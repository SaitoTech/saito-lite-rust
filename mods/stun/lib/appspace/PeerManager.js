/**
 * This appears to hold the core code for connecting to peers over stun
 * 
 */

class PeerManager {
  constructor(app, mod, ui_type = "large", config) {
    console.log("PeerManager constructor, config:", config);
    this.app = app;
    this.mod = mod;
    this.ui_type = ui_type;
    this.config = config;
    this.peers = new Map();
    this.localStream = null;        //My Video Feed
    this.remoteStreams = new Map(); //The video of the other parties

    this.videoEnabled = true;
    this.audioEnabled = true;

    this.app.connection.on("stun-peer-manager-update-room-code", (room_code) => {
      this.room_code = room_code;
    });

    app.connection.on("stun-event-message", (data) => {
      if (data.room_code !== this.room_code) {
        return;
      }

      if (data.type === "peer-joined") {
        let peerConnection = this.peers.get(data.public_key);
        if(!peerConnection){
          this.createPeerConnection(data.public_key, "offer");
        }
      } else if (data.type === "peer-left") {
        this.removePeerConnection(data.public_key);
      } else if (data.type === "toggle-audio") {
        // console.log(data);
        app.connection.emit("toggle-peer-audio-status", data);
      } else if (data.type === "toggle-video") {
        app.connection.emit("toggle-peer-video-status", data);
      } else {

        let peerConnection = this.peers.get(data.public_key);
        if (!peerConnection) {
          console.log("Create Peer Connection with " + data.public_key);
          this.createPeerConnection(data.public_key);
          peerConnection = this.peers.get(data.public_key);
        }
        console.log("peers consoled", peerConnection);
        
        if (peerConnection) {
          this.handleSignalingMessage(data);
        }
      }
    });

    app.connection.on("stun-disconnect", () => {
      this.leave();
    });

    app.connection.on("stun-toggle-video", async () => {

      if (this.videoEnabled === true) {
        if (!this.localStream.getVideoTracks()[0]) return;

        this.localStream.getVideoTracks()[0].enabled = false;
        this.app.connection.emit("mute", "video", "local");
        this.videoEnabled = false;

      } else {

        if (!this.localStream.getVideoTracks()[0]) {
          const oldVideoTracks = this.localStream.getVideoTracks();
          if (oldVideoTracks.length > 0) {
            oldVideoTracks.forEach((track) => {
              this.localStream.removeTrack(track);
            });
          }
          // start a video stream;
          let localStream = await navigator.mediaDevices.getUserMedia({ video: true });

          // Add new track to the local stream
          this.app.connection.emit("render-local-stream-request", this.localStream, "video");
          let track = localStream.getVideoTracks()[0];
          this.localStream.addTrack(track);

          this.peers.forEach((peerConnection, key) => {
            const videoSenders = peerConnection
              .getSenders()
              .filter((sender) => sender.track && sender.track.kind === "video");
            if (videoSenders.length > 0) {
              videoSenders.forEach((sender) => {
                sender.replaceTrack(track);
              });
            } else {
              peerConnection.addTrack(track);
            }

            this.renegotiate(key);
          });
          
        } else {
          this.localStream.getVideoTracks()[0].enabled = true;
        }
        this.videoEnabled = true;
      }

      let data = {
        room_code: this.room_code,
        type: "toggle-video",
        enabled: this.videoEnabled,
      };

      this.mod.sendStunMessageToServerTransaction(data);
    });

    app.connection.on("stun-toggle-audio", async () => {
      // if video is enabled
      if (this.audioEnabled === true) {
        this.localStream.getAudioTracks()[0].enabled = false;
        this.app.connection.emit("mute", "audio", "local");
        this.audioEnabled = false;
      } else {
        this.localStream.getAudioTracks()[0].enabled = true;
        this.audioEnabled = true;
      }

      let data = {
        room_code: this.room_code,
        type: "toggle-audio",
        enabled: this.audioEnabled,
      };
      this.mod.sendStunMessageToServerTransaction(data);
    });

    //Emitted by StunAppspace
    app.connection.on("show-chat-manager-large", async () => {

      //Set up Chat-Manager component
      await this.showChatManagerLarge();

      //Send message that we are joining room
      this.join();

      let sound = new Audio("/videocall/audio/enter-call.mp3");
      sound.play();
    });

    app.connection.on("show-chat-manager-small", async (to_join) => {
      // console.log(this, "peer")
      await this.showChatManagerSmall(this.config);
  
      if (to_join) {
        this.join();
      }
  
      let sound = new Audio("/videocall/audio/enter-call.mp3");
      sound.play();
    });

    app.connection.on("switch-ui-type-to-large", async () => {
      this.ui_type = "large";
      // remove small ui
      this.removeChatManagerSmall(false);
      // render large ui
      this.showChatManagerLarge();

      setTimeout(() => {
        this.renderRemoteStreams();
      }, 1000);

      // loop over this.remoteStreams and render them
    });

    app.connection.on("switch-ui-type-to-small", async () => {
      this.ui_type = "small";
    });


    //Chat-Settings saves whether to enter the room with mic/camera on/off
    app.connection.on("update-media-preference", (kind, state) => {
      if (kind === "audio") {
        this.audioEnabled = state;
      } else if (kind === "video") {
        this.videoEnabled = state;
      }
    });
  }

  async showChatManagerLarge() {
    
    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: this.videoEnabled,
      audio: true,
    });
    
    this.localStream.getAudioTracks()[0].enabled = this.audioEnabled;

    //Tell Chat Manager to Set Up
    this.app.connection.emit(
      "show-video-chat-large-request",
      this.app,
      this.mod,
      this.room_code,
      this.videoEnabled,
      this.audioEnabled,
      this.config
    );

    //Turn on my camera in Chat-Manager-Large
    this.app.connection.emit("render-local-stream-large-request", this.localStream);
  }

  async showChatManagerSmall() {
    this.videoEnabled = false;

    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: this.videoEnabled,
      audio: true,
    });
    this.localStream.getAudioTracks()[0].enabled = this.audioEnabled;
    this.app.connection.emit(
      "show-video-chat-small-request",
      this.app,
      this.mod,
      this.room_code,
      this.videoEnabled,
      this.audioEnabled,
      this.config
    );
    this.app.connection.emit("render-local-stream-small-request", this.localStream);
  }

  removeChatManagerSmall(completely) {
    this.app.connection.emit("remove-video-chat-small-request", completely);
  }

  handleSignalingMessage(data) {
    const { type, sdp, candidate, targetPeerId, public_key } = data;
    if (type === "renegotiate-offer" || type === "offer") {
      if (
        this.getPeerConnection(public_key).connectionState === "connected" ||
        this.getPeerConnection(public_key).remoteDescription !== null ||
        this.getPeerConnection(public_key).connectionState === "stable"
      ) {
        return;
      }

      console.log(this.getPeerConnection(public_key), "remote description offer");
      this.getPeerConnection(public_key)
        .setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp }))
        .then(() => {
          return this.getPeerConnection(public_key).createAnswer();
        })
        .then((answer) => {
          return this.getPeerConnection(public_key).setLocalDescription(answer);
        })
        .then(() => {
          let data = {
            room_code: this.room_code,
            type: "renegotiate-answer",
            sdp: this.getPeerConnection(public_key).localDescription.sdp,
            targetPeerId: public_key,
          };
          this.mod.sendStunMessageToServerTransaction(data);
        })
        .catch((error) => {
          console.error("Error handling offer:", error);
        });
      this.peers.set(data.public_key, this.getPeerConnection(public_key));
    } else if (type === "renegotiate-answer" || type === "answer") {
      console.log(
        this.getPeerConnection(public_key),
        this.getPeerConnection(public_key).connectionState,
        "remote description answer"
      );
      if (
        this.getPeerConnection(public_key).connectionState === "connected" ||
        this.getPeerConnection(public_key).signalingState === "stable"
      )
        return;
      this.getPeerConnection(public_key)
        .setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp }))
        .then((answer) => {})
        .catch((error) => {
          console.error("Error handling answer:", error);
        });
      this.peers.set(data.public_key, this.getPeerConnection(public_key));
    } else if (type === "candidate") {
      if (this.getPeerConnection(public_key).remoteDescription === null) return;
      this.getPeerConnection(public_key)
        .addIceCandidate(new RTCIceCandidate(candidate))
        .catch((error) => {
          console.error("Error adding remote candidate:", error);
        });
    }
  }

  async createPeerConnection(peerId, type) {
    // check if peer connection already exists
    const peerConnection = new RTCPeerConnection({
      iceServers: this.mod.servers,
    });

    //Make sure you have a local Stream
    if (!this.localStream){
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: this.videoEnabled,
        audio: true,
      });
    }

    this.peers.set(peerId, peerConnection);

    // Implement the creation of a new RTCPeerConnection and its event handlers

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        let data = {
          room_code: this.room_code,
          type: "candidate",
          candidate: event.candidate,
          targetPeerId: peerId,
        };
        this.mod.sendStunMessageToServerTransaction(data);
      }
    };

    const remoteStream = new MediaStream();
    peerConnection.addEventListener("track", (event) => {
      // console.log("trackss", event.track, "stream :", event.streams);
      if (event.streams.length === 0) {
        remoteStream.addTrack(event.track);
      } else {
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
      }

      this.remoteStreams.set(peerId, { remoteStream, peerConnection });
      console.log(this.remoteStreams, "remote stream new");
      if (this.ui_type === "large") {
        this.app.connection.emit(
          "render-remote-stream-large-request",
          peerId,
          remoteStream
        );
      } else if (this.ui_type === "small") {
        this.app.connection.emit(
          "add-remote-stream-small-request",
          peerId,
          remoteStream
        );
      }
    });

    this.localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, this.localStream);
      // console.log('track local ', track)
    });

    peerConnection.addEventListener("connectionstatechange", () => {
      if (
        peerConnection.connectionState === "failed" ||
        peerConnection.connectionState === "disconnected"
      ) {
        setTimeout(() => {
          // console.log('sending offer');
          this.reconnect(peerId, type);
        }, 10000);
      }
      if (peerConnection.connectionState === "connected") {
        let sound = new Audio("/videocall/audio/enter-call.mp3");
        sound.play();
      }
      // if(peerConnection.connectionState === "disconnected"){

      // }

      this.app.connection.emit(
        "stun-update-connection-message",
        this.room_code,
        peerId,
        peerConnection.connectionState
      );
    });

    if (type === "offer") {
      this.renegotiate(peerId);
    }
  }

  reconnect(peerId, type) {
    const maxRetries = 2;
    const retryDelay = 10000;

    const attemptReconnect = (currentRetry) => {
      const peerConnection = this.peers.get(peerId);
      if (currentRetry === maxRetries) {
        if (peerConnection && peerConnection.connectionState !== "connected") {
          console.log("Reached maximum number of reconnection attempts, giving up");
          this.removePeerConnection(peerId);
        }
        return;
      }

      if (peerConnection && peerConnection.connectionState === "connected") {
        console.log("Reconnection successful");
        // remove connection message
        return;
      }

      if (peerConnection && peerConnection.connectionState !== "connected") {
        this.removePeerConnection(peerId);
        if (type === "offer") {
          this.createPeerConnection(peerId, "offer");
        }
      }

      setTimeout(() => {
        console.log(`Reconnection attempt ${currentRetry + 1}/${maxRetries}`);
        attemptReconnect(currentRetry + 1);
      }, retryDelay);
    };

    attemptReconnect(0);
  }

  removePeerConnection(peerId) {
    const peerConnection = this.peers.get(peerId);
    if (peerConnection) {
      peerConnection.close();
      this.peers.delete(peerId);
    }

    let sound = new Audio("/videocall/audio/end-call.mp3");
    sound.play();
    if (this.ui_type === "large") {
      this.app.connection.emit("video-box-remove", peerId, "disconnection");
    } else if (this.ui_type === "small") {
      console.log("peer left");
      this.app.connection.emit("audio-box-remove", peerId);
    }
  }

  renegotiate(peerId, retryCount = 0) {
    const maxRetries = 4;
    const retryDelay = 3000;

    const peerConnection = this.peers.get(peerId);
    if (!peerConnection) {
      return;
    }

    // console.log('signalling state, ', peerConnection.signalingState)
    if (peerConnection.signalingState !== "stable") {
      if (retryCount < maxRetries) {
        console.log(
          `Signaling state is not stable, will retry in ${retryDelay} ms (attempt ${
            retryCount + 1
          }/${maxRetries})`
        );
        setTimeout(() => {
          this.renegotiate(peerId, retryCount + 1);
        }, retryDelay);
      } else {
        console.log("Reached maximum number of renegotiation attempts, giving up");
      }
      return;
    }

    const offerOptions = {
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    };

    peerConnection
      .createOffer(offerOptions)
      .then((offer) => {
        return peerConnection.setLocalDescription(offer);
      })
      .then(() => {
        let data = {
          room_code: this.room_code,
          type: "renegotiate-offer",
          sdp: peerConnection.localDescription.sdp,
          targetPeerId: peerId,
        };
        this.mod.sendStunMessageToServerTransaction(data);
      })
      .catch((error) => {
        console.error("Error creating offer:", error);
      });

    // Implement renegotiation logic for reconnections and media stream restarts
  }

  join() {
    console.log("joining mesh network");
    this.mod.sendStunMessageToServerTransaction({
      type: "peer-joined",
      room_code: this.room_code,
    });
  }

  leave() {
    this.localStream.getTracks().forEach((track) => {
      track.stop();
      // console.log(track);
      console.log("stopping track");
    });
    this.peers.forEach((peerConnections, key) => {
      peerConnections.close();
    });

    this.peers = new Map();

    let data = {
      room_code: this.room_code,
      type: "peer-left",
    };

    this.mod.sendStunMessageToServerTransaction(data);
  }

  sendSignalingMessage(data) {}

  switchUITypeToLarge() {
    this.ui_type = "large";
  }
  switchUITypeToSmall() {
    this.ui_type = "small";
  }

  renderRemoteStreams() {
    // loop over remote stream
    this.remoteStreams.forEach((property, key) => {
      console.log(property, "property", key, "key");
      // console.log(stream, 'stream')
      if (this.ui_type === "large") {
        this.app.connection.emit(
          "render-remote-stream-large-request",
          key,
          property.remoteStream
        );
      } else if (this.ui_type === "small") {
        this.app.connection.emit(
          "add-remote-stream-small-request",
          key,
          property.remoteStream
        );
      }
    });
  }

  getPeerConnection(public_key) {
    return this.peers.get(public_key);
  }
}

module.exports = PeerManager;
