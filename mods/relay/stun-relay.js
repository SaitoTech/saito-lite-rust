const Transaction = require("../../lib/saito/transaction").default;

class StunManager {
  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.peers = new Map();

    this.on_connection = null;

    this.servers = [
      {
        urls: "turn:stun-sf.saito.io:3478",
        username: "guest",
        credential: "somepassword",
      },
      {
        urls: "turn:stun-sg.saito.io:3478",
        username: "guest",
        credential: "somepassword",
      },
      {
        urls: "turn:stun-de.saito.io:3478",
        username: "guest",
        credential: "somepassword",
      },
    ];

    app.connection.on("open-stun-relay", (publicKey, connectionCallback) => {
      if (this.peers.get(publicKey)) {
        let pc = this.peers.get(publicKey);

        console.log("Already have peer connection: " + pc.connectionState);

        if (pc.connectionState == "connected"){
          if (connectionCallback){
            connectionCallback(this.peers.get(publicKey));
          }
         
        }else{
          this.renegotiate(publicKey);
        }

         return;
      }

      this.createPeerConnection(publicKey, connectionCallback);

      this.mod.sendRelayMessage(publicKey, "stun signaling relay", {
        type: "peer-query",
        public_key: this.mod.publicKey,
      });
    });
  }

  handleDataChannelMessage(data, peerId) {
    let relayed_tx = new Transaction();
    relayed_tx.deserialize_from_web(this.app, data);
    this.app.modules.handlePeerTransaction(relayed_tx);
  }

  async handleSignalingMessage(data) {
    const { type, sdp, iceCandidate, public_key } = data;

    console.log("RELAY Stun Signal Message: " + type, data);

    if (type == "peer-query") {
      this.createPeerConnection(public_key);
      return;
    }

    if (type == "peer-left") {
      this.removePeerConnection(public_key);
      return;
    }

    let peerConnection = this.peers.get(public_key);

    if (!peerConnection) {
      console.warn("Receiving stun signalling messages for a non-peer connection");
      return;
    }

    if (type === "offer") {
      peerConnection
        .setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp }))
        .then(() => {
          return peerConnection.createAnswer();
        })
        .then((answer) => {
          return peerConnection.setLocalDescription(answer);
        })
        .then(() => {
          let data = {
            type: "answer",
            sdp: peerConnection.localDescription.sdp,
            public_key: this.mod.publicKey,
          };

          console.log("Stun: send answer to offer");
          this.mod.sendRelayMessage([public_key], "stun signaling relay", data);
        })
        .catch((error) => {
          console.error("Error handling offer:", error);
        });
    } else if (type === "answer") {
      peerConnection
        .setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp }))
        .then((answer) => {})
        .catch((error) => {
          console.error("Error handling answer:", error);
        });
      this.peers.set(data.public_key, peerConnection);
    } else if (type === "candidate") {
      if (peerConnection.remoteDescription === null) return;
      peerConnection.addIceCandidate(iceCandidate).catch((error) => {
        console.error("Error adding remote candidate:", error);
      });
    }
  }

  hasConnection(peerId){
    let peerConnection = this.peers.get(peerId);

    if (peerConnection){

      if (peerConnection?.dc){

        if (peerConnection.connectionState == "connected"){
          
          return true;
        }
      }
    }

    return false;
  }

  sendTransaction(peerId, tx){
    let peerConnection = this.peers.get(peerId);
    if (!peerConnection?.dc){
      console.warn("Stun-Relay: no data channel with peer");
      return;
    }

    try{
      peerConnection.dc.send(tx.serialize_to_web(this.app));
    }catch(err){
      console.error(err);
      this.app.connection.emit("relay-stun-send-fail", peerId);
    }
    
  }

  async createPeerConnection(peerId, on_connection = null) {
    console.log("STUN: Create Peer Connection with " + peerId);

    if (this.peers.get(peerId)){
      if (this.peers.get(peerId).connection == "connected"){
        return;  
      }
    }

    if (peerId === this.mod.publicKey) {
      console.log("STUN: Attempting to create a peer Connection with myself!");
      return;
    }

    // check if peer connection already exists
    const peerConnection = new RTCPeerConnection({
      iceServers: this.servers,
    });

    this.peers.set(peerId, peerConnection);

    // Implement the creation of a new RTCPeerConnection and its event handlers

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        let data = {
          type: "candidate",
          iceCandidate: event.candidate,
          public_key: this.mod.publicKey,
        };

        this.mod.sendRelayMessage([peerId], "stun signaling relay", data);
      }
    };

    //
    // This handles the renegotiation for adding/droping media streams
    // However, need to further study "perfect negotiation" with polite/impolite peers
    //
    peerConnection.onnegotiationneeded = () => {
      this.renegotiate(peerId);
    };

    peerConnection.addEventListener("connectionstatechange", () => {
      console.log(`STUN: ${peerId} connectionstatechange -- ` + peerConnection.connectionState);

    });

    if (on_connection) {
      peerConnection.addEventListener("datachannel", (event) => {
        console.log("STUN: datachannel event");

        const receiveChannel = event.channel;
        peerConnection.dc = receiveChannel;

        receiveChannel.onmessage = (event) => {
          this.handleDataChannelMessage(event.data, peerId);
        };

        receiveChannel.onopen = (event) => {
          console.log("STUN: Data channel is open");
          on_connection(peerConnection);
        };

        receiveChannel.onclose = (event) => {
          console.log("STUN: Data channel is closed");
          this.app.connection.emit("relay-stun-send-fail", peerId);
        };
      });
    } else {
      const dc = peerConnection.createDataChannel("data-channel");
      peerConnection.dc = dc;

      dc.onmessage = (event) => {
        this.handleDataChannelMessage(event.data, peerId);
      };

      dc.onopen = (event) => {
        console.log("STUN: Data channel is open");
      };

      dc.onclose = (event) => {
        console.log("STUN: Data channel is closed");
        this.app.connection.emit("relay-stun-send-fail", peerId);
      };

      this.renegotiate(peerId);
    }
  }

  removePeerConnection(peerId) {
    const peerConnection = this.peers.get(peerId);
    if (peerConnection) {
      peerConnection.close();
      this.peers.delete(peerId);
    }
  }

  //
  // This is to send an offer (or resend it if the mediastream changes)
  //
  async renegotiate(peerId) {
    const peerConnection = this.peers.get(peerId);

    if (!peerConnection) {
      return;
    }

    try {
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: false,
      });

      await peerConnection.setLocalDescription(offer);

      let data = {
        type: "offer",
        sdp: peerConnection.localDescription.sdp,
        public_key: this.mod.publicKey,
      };

      this.mod.sendRelayMessage([peerId], "stun signaling relay", data);
    } catch (err) {
      console.error("Error creating offer:", err);
    }
  }
}

module.exports = StunManager;
