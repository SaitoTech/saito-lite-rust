const saito = require("./../../lib/saito/saito");
const ModTemplate = require("../../lib/templates/modtemplate");
const StunUI = require('./lib/stun-ui');
const Slip = require('../..//lib/saito/slip.ts');
var serialize = require('serialize-javascript');
const VideoChat = require('../../lib/saito/ui/video-chat/video-chat');







console.log(ModTemplate, Slip, saito);

class Stun extends ModTemplate {





  constructor(app) {
    console.log(serialize)
    super(app);
    this.appname = "Stun";
    this.name = "Stun";
    this.description = "Session Traversal Utilitiesf for NAT (STUN)";
    this.categories = "Utility Networking";

    this.stun = {};
    this.stun.ip_address = "";
    this.stun.port = "";
    this.stun.offer_sdp = "";
    this.stun.listeners = [];
    this.stun.pc = "";
    this.stun.iceCandidates = [];
    this.stun.counter = 0;
    this.videoChat = new VideoChat(app);
    this.servers = [
      {
        urls: "stun:openrelay.metered.ca:80",
      },
      {
        urls: "turn:openrelay.metered.ca:80",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
      {
        urls: "turn:openrelay.metered.ca:443",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
      {
        urls: "turn:openrelay.metered.ca:443?transport=tcp",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
    ]





  }





  onConfirmation(blk, tx, conf, app) {

    let stun_self = app.modules.returnModule("Stun");
    let txmsg = tx.returnMessage();


    if (conf == 0) {
      console.log("stun testing ...");
      let address = app.wallet.returnPublicKey();
      if (txmsg.module === 'Stun') {
        if (tx.msg.stun) {


          // check if key exists in key chain
          let key_index = stun_self.app.keys.keys.findIndex((key) => key.publickey === tx.transaction.from[0].add);
          console.log(key_index, "key index");

          // save key if it doesn't exist
          if (key_index === -1) {
            stun_self.app.keys.addKey(tx.transaction.from[0].add);
            stun_self.app.keys.saveKeys();
          }
          for (let i = 0; i < app.keys.keys.length; i++) {

            if (tx.transaction.from[0].add === stun_self.app.keys.keys[i].publickey) {
              console.log(JSON.stringify(stun_self.app.keys.keys[i].data.stun), JSON.stringify(tx.msg.stun))
              if (JSON.stringify(stun_self.app.keys.keys[i].data.stun) != JSON.stringify(tx.msg.stun)) {
                let address = app.wallet.returnPublicKey();
                console.log("stun changed, saving changes..", tx.msg.stun);
                stun_self.app.keys.keys[i].data.stun = { ...tx.msg.stun };

                stun_self.app.keys.saveKeys();

              }

            }
          }




          app.connection.emit("stun-update", app, stun_self);




        }



        if (tx.msg.answer) {
          if (address === tx.msg.answer.peer_b) {
            stun_self.app.connection.emit('answer_received', tx.msg.answer.peer_a, tx.msg.answer.peer_b, tx.msg.answer.reply);
          } else {
            // console.log('tx peer key not equal');
          }
        }





        if (tx.msg.offer) {
          console.log("offer received");
          if (address === tx.msg.offer.peer_b) {
            stun_self.app.connection.emit('offer_received', tx.msg.offer.peer_a, tx.msg.offer.peer_b, tx.msg.offer.offer);
          } else {
            console.log('tx peer key not equal');
          }
        }

        if (tx.msg.broadcast_details) {

          const listeners = tx.msg.broadcast_details.listeners;
          const from = tx.msg.broadcast_details.from;
          if (address === from) return;

          console.log("listeners: ", listeners, "from: ", from);
          const index = stun_self.app.keys.keys.findIndex(key => key.publickey === address);
          if (index !== -1) {
            stun_self.app.keys.keys[index].data.stun.listeners.push(from);
            stun_self.app.keys.saveKeys();

            app.connection.emit('listeners-update', stun_self.app, stun_self.app.keys.keys[index].data.stun.listeners);
            console.log("keys updated, added: ", from, " updated listeners: ", stun_self.app.keys.keys[index].data.stun.listeners);
          }
        }

        if (tx.msg.listeners) {
          stun_self.addListenersFromPeers(tx.msg.listeners.listeners);
        }






      }
    }
  }


  async updateKey(publicKey) {
    console.log('updating key');
    let newtx = this.app.wallet.createUnsignedTransaction();
    newtx.msg.module = "Stun";

    newtx = this.app.wallet.signTransaction(newtx);
    console.log(this.app.network);

    // does not work without the settimeout, it seems the blockchain isn't initialized by the time this function is run , so propagation doesn't register
    this.app.network.propagateTransaction(newtx);

  }



  respondTo(type) {
    if (type == 'email-appspace') {
      let obj = {};
      obj.render = this.renderStunUI;
      obj.attachEvents = this.attachEvents;
      return obj;
    }
    return null;
  }


  renderStunUI(app, mod) {
    StunUI.render(app, mod);
  }

  attachEvents(app, mod) {
    StunUI.attachEvents(app, mod);
  }











  async initialize(app) {


    let publickey = this.app.wallet.returnPublicKey();
    let key_index = this.app.keys.keys.findIndex(key => key.publickey === publickey);

    // save key if it doesnt exist
    if (key_index === -1) {
      this.app.keys.addKey(publickey);
      this.app.keys.saveKeys();
    }
    if (!this.app.keys.keys[key_index].data.stun) {
      this.app.keys.keys[key_index].data.stun = this.stun;
      this.app.keys.saveKeys();

    }


  }


  onPeerHandshakeComplete() {
    // lite clients not allowed to run this
    if (this.app.BROWSER == 0) {
      const peers = [];
      let newtx = this.app.wallet.createUnsignedTransaction();
      for (let i = 0; i < this.app.network.peers.length; i++) {
        if (this.app.network.peers[i].returnPublicKey() != this.app.wallet.returnPublicKey()) {
          peers.push(this.app.network.peers[i].returnPublicKey());
          newtx.transaction.to.push(new saito.default.slip(this.app.network.peers[i].returnPublicKey()));
        }
      }

      newtx.msg.module = "Stun";
      newtx.msg.listeners = {
        listeners: peers
      };
      newtx = this.app.wallet.signTransaction(newtx);
      this.app.network.propagateTransaction(newtx);



    }






  }




  broadcastOffer(my_key, peer_key, offer) {
    let newtx = this.app.wallet.createUnsignedTransaction();
    console.log('broadcasting offer  to ', peer_key);
    newtx.transaction.to.push(new saito.default.slip(peer_key));
    console.log("offer ", offer);
    newtx.msg.module = "Stun";
    newtx.msg.offer = {
      peer_a: my_key,
      peer_b: peer_key,
      offer
    }
    console.log('new tx', newtx);
    newtx = this.app.wallet.signTransaction(newtx);
    console.log(this.app.network);
    this.app.network.propagateTransaction(newtx);
  }





  broadcastAnswer(my_key, peer_key, reply) {
    let newtx = this.app.wallet.createUnsignedTransaction();
    console.log('broadcasting answer  to ', peer_key);
    newtx.transaction.to.push(new saito.default.slip(peer_key));

    newtx.msg.module = "Stun";
    newtx.msg.answer = {
      peer_a: my_key,
      peer_b: peer_key,
      reply: reply
    };
    newtx = this.app.wallet.signTransaction(newtx);
    console.log(this.app.network);
    this.app.network.propagateTransaction(newtx);
  }



  acceptOfferAndCreateAnswer(app, offer_creator, offer_sdp, iceCandidates) {
    let stun_mod = app.modules.returnModule("Stun");
    console.log('accepting offer');
    console.log('info ', offer_creator, offer_sdp, iceCandidates)
    const createPeerConnection = async () => {
      let reply = {
        answer: "",
        iceCandidates: []
      }
      const pc = new RTCPeerConnection({
        iceServers: this.servers,
      });
      try {

        pc.onicecandidate = (ice) => {
          if (!ice || !ice.candidate || !ice.candidate.candidate) {
            console.log('ice candidate check closed');

            let video_mod = app.modules.returnModule("Video");
            video_mod.peer_connections[offer_creator] = pc;
            console.log('broadcasting answer ', video_mod.peer_connections);
            video_mod.broadcastAnswerInvite(video_mod.app.wallet.returnPublicKey(), offer_creator, reply);
            return;

          };

          reply.iceCandidates.push(ice.candidate);





        }

        // pc.onconnectionstatechange = e => {
        //   console.log("connection state ", pc.connectionState)
        //   switch (pc.connectionState) {


        //     case "connected":
        //       vanillaToast.cancelAll();
        //       vanillaToast.success('Connected', { duration: 3000, fadeDuration: 500 });
        //       break;

        //     case "disconnected":
        //       StunUI.displayConnectionClosed();
        //       vanillaToast.error('Disconnected', { duration: 3000, fadeDuration: 500 });
        //       break;

        //     default:
        //       ""
        //       break;
        //   }
        // }

        // add data channels 
        const data_channel = pc.createDataChannel('channel');
        pc.dc = data_channel;
        pc.dc.onmessage = (e) => {

          console.log('new message from client : ', e.data);
          // StunUI.displayMessage(peer_key, e.data);
        };
        pc.dc.open = (e) => {
          console.log('connection opened');
          // $('#connection-status').html(` <p style="color: green" class="data">Connected to ${peer_key}</p>`);
        }

        // add tracks

        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStream.getTracks().forEach(track => {
          pc.addTrack(track, localStream);
          console.log('got local stream for answerer');
        });


        stun_mod.videoChat.show(pc);
        stun_mod.videoChat.addLocalStream(localStream);


        const remoteStream = new MediaStream();
        pc.addEventListener('track', (event) => {
          console.log('got remote stream ', event.streams);
          event.streams[0].getTracks().forEach(track => {
            remoteStream.addTrack(track);
          });
          stun_mod.videoChat.addRemoteStream(remoteStream, offer_creator);

        });


        await pc.setRemoteDescription(offer_sdp);

        const peerIceCandidates = iceCandidates;
        // console.log('peer ice candidates', peerIceCandidates);
        if (peerIceCandidates.length > 0) {
          console.log('adding offer candidates');
          for (let i = 0; i < peerIceCandidates.length; i++) {
            pc.addIceCandidate(peerIceCandidates[i]);
          }
        }


        console.log('remote description  is set');


        reply.answer = await pc.createAnswer();

        console.log("answer ", reply.answer);


        pc.setLocalDescription(reply.answer);

        // console.log("peer connection ", pc);

      } catch (error) {
        console.log("error", error);
      }

    }

    createPeerConnection();

  }

  addListenersFromPeers(peers) {
    // only lite clients allowed to run this
    if (this.app.BROWSER === 0) return;
    console.log("adding peers as listeners ...");
    if (peers.length === 0) return console.log("No peers to add");

    let filteredListeners;

    // remove current istance public key
    filteredListeners = peers.filter(peer => peer !== this.app.wallet.returnPublicKey());

    // remove duplicates
    const seen = new Map();
    let filteredPeers = [];
    for (let i = 0; i < filteredListeners.length; i++) {
      if (!seen[filteredListeners[i]]) {
        seen[filteredListeners[i]] = 1;
        filteredPeers.push(filteredListeners[i]);

      } else {
        seen[filteredListeners[i]] += 1;
      }
    }
    console.log('filtered peers ', filteredPeers, ' seen ', seen);

    // save key if it doesnt exist
    let publickey = this.app.wallet.returnPublicKey();
    let key_index = this.app.keys.keys.findIndex(key => key.publickey === publickey);
    if (key_index === -1) {
      this.app.keys.addKey(publickey);
      this.app.keys.saveKeys();
    }
    if (!this.app.keys.keys[key_index].data.stun) {
      this.app.keys.keys[key_index].data.stun = this.stun;
      this.app.keys.saveKeys();

    }
    this.app.keys.keys[key_index].data.stun.listeners = filteredPeers;
    this.app.keys.saveKeys();
    // this.app.connection.emit('listeners-update', this.app, this.app.keys.keys[key_index].data.stun.listeners);



  }







  createPeerConnectionOffer(publicKey) {
    const stun_mod = this.app.modules.returnModule('Stun');

    const createPeerConnection = new Promise((resolve, reject) => {
      let iceCandidates = [];
      const execute = async () => {

        try {
          const pc = new RTCPeerConnection({
            iceServers: [
              {
                urls: "stun:openrelay.metered.ca:80",
              },
              {
                urls: "turn:openrelay.metered.ca:80",
                username: "openrelayproject",
                credential: "openrelayproject",
              },
              {
                urls: "turn:openrelay.metered.ca:443",
                username: "openrelayproject",
                credential: "openrelayproject",
              },
              {
                urls: "turn:openrelay.metered.ca:443?transport=tcp",
                username: "openrelayproject",
                credential: "openrelayproject",
              },
            ],
          });



          pc.onicecandidate = (ice) => {
            if (!ice || !ice.candidate || !ice.candidate.candidate) {

              // pc.close();

              let offer_sdp = pc.localDescription;
              resolve({ publicKey, offer_sdp, iceCandidates, pc });
              // stun_mod.broadcastIceCandidates(my_key, peer_key, ['savior']);

              return;
            } else {
              iceCandidates.push(ice.candidate);
            }

          };

          const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          localStream.getTracks().forEach(track => {
            pc.addTrack(track, localStream);

          });



          stun_mod.videoChat.show(pc);
          stun_mod.videoChat.addLocalStream(localStream)



          pc.LOCAL_STREAM = localStream;
          const remoteStream = new MediaStream();

          pc.addEventListener('track', (event) => {

            console.log('current peer connection ', this.peer_connections);



            console.log('got remote stream', event.streams);
            event.streams[0].getTracks().forEach(track => {
              remoteStream.addTrack(track);
              this.remoteStreamPosition += 1;
            });


            stun_mod.videoChat.addRemoteStream(remoteStream, publicKey);


          });

          const data_channel = pc.createDataChannel('channel');
          pc.dc = data_channel;
          pc.dc.onmessage = (e) => {

            console.log('new message from client : ', e.data);

          };
          pc.dc.open = (e) => console.log("connection opened");

          const offer = await pc.createOffer();
          pc.setLocalDescription(offer);

        } catch (error) {
          console.log(error);
        }

      }
      execute();

    })

    return createPeerConnection;



  }

  addListeners(listeners) {
    if (this.app.BROWSER === 0) return;
    console.log("adding listeners ...");
    if (listeners.length === 0) return console.log("No listeners to add");

    let publickey = this.app.wallet.returnPublicKey();
    let key_index = this.app.keys.keys.findIndex(key => key.publickey === publickey);

    // save key if it doesnt exist
    if (key_index === -1) {
      this.app.keys.addKey(publickey);
      this.app.keys.saveKeys();
    }
    if (!this.app.keys.keys[key_index].data.stun) {
      this.app.keys.keys[key_index].data.stun = this.stun;
      this.app.keys.saveKeys();

    }

    let validated_listeners;

    // check if key is valid
    validated_listeners = listeners.map(listener => listener.trim());
    validated_listeners = listeners.filter(listener => listener.length === 44);

    // filter out already existing keys
    validated_listeners = listeners.filter(listener => !this.app.keys.keys[key_index].data.stun.listeners.includes(listener));

    // this.broadcastKeyToListeners(validated_listeners);

    // add listeners to existing listeners
    this.app.keys.keys[key_index].data.stun.listeners = [...this.app.keys.keys[key_index].data.stun.listeners, ...validated_listeners];
    this.app.keys.saveKeys();




    this.app.connection.emit('listeners-update', this.app, this.app.keys.keys[key_index].data.stun.listeners);
  }


  broadcastKeyToListeners(listeners) {
    let newtx = this.app.wallet.createUnsignedTransaction();
    let from = this.app.wallet.returnPublicKey();
    console.log('Adding contacts :', listeners, " to ", from);

    for (let i = 0; i < listeners.length; i++) {
      newtx.transaction.to.push(new saito.default.slip(listeners[i]));
    }



    newtx.msg.module = "Stun";
    newtx.msg.broadcast_details = {
      listeners,
      from
    };
    newtx = this.app.wallet.signTransaction(newtx);

    this.app.network.propagateTransaction(newtx);
  }





}

module.exports = Stun;

