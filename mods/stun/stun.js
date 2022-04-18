const saito = require("./../../lib/saito/saito");
const ModTemplate = require("../../lib/templates/modtemplate");
const StunUI = require('./lib/stun-ui');
const Slip = require('../..//lib/saito/slip.ts');
var serialize = require('serialize-javascript');







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



  }





  onConfirmation(blk, tx, conf, app) {
    console.log("testing ...");
    let stun_self = app.modules.returnModule("Stun");
    let txmsg = tx.returnMessage();


    if (conf == 0) {
      if (txmsg.module === "Stun" && tx.msg.stun) {

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
    }


    if (conf == 0) {
      if (txmsg.module === "Stun") {

        let address = app.wallet.returnPublicKey();



        if (tx.msg.answer) {
          if (address === tx.msg.answer.peer_b) {
            stun_self.app.connection.emit('answer_received', tx.msg.answer.peer_a, tx.msg.answer.peer_b, tx.msg.answer.reply);
          } else {
            console.log('tx peer key not equal');
          }
        }


      }
    }
    if (conf == 0) {
      if (txmsg.module === "Stun") {

        let address = app.wallet.returnPublicKey();



        if (tx.msg.offer) {
          console.log("offer received");
          if (address === tx.msg.offer.peer_b) {
            stun_self.app.connection.emit('offer_received', tx.msg.offer.peer_a, tx.msg.offer.peer_b, tx.msg.offer.offer);
          } else {
            console.log('tx peer key not equal');
          }
        }


      }
    }

    // if (conf == 0) {
    //   if (txmsg.module === "Stun") {

    //     let address = app.wallet.returnPublicKey();



    //     if (tx.msg.offer_icecandidates) {
    //       console.log("ice candidates received");

    //       if (address === tx.msg.offer_peer_info.peer_b) {
    //         stun_self.app.connection.emit('icecandidates_received', tx.msg.offer_peer_info.peer_a, tx.msg.offer_peer_info.peer_b, tx.msg.offer_peer_info.offer);
    //       } else {
    //         console.log('tx peer key not equal');
    //       }
    //     }


    //   }
    // }

    if (conf == 0) {
      if (txmsg.module === "Stun") {

        let public_key = app.wallet.returnPublicKey();



        if (tx.msg.broadcast_details) {

          const listeners = tx.msg.broadcast_details.listeners;
          const from = tx.msg.broadcast_details.from;
          if (public_key === from) return;

          console.log("listeners: ", listeners, "from: ", from);
          const index = stun_self.app.keys.keys.findIndex(key => key.publickey === public_key);
          if (index !== -1) {
            stun_self.app.keys.keys[index].data.stun.listeners.push(from);
            stun_self.app.keys.saveKeys();

            app.connection.emit('listeners-update', stun_self.app, stun_self.app.keys.keys[index].data.stun.listeners);
            console.log("keys updated, added: ", from, " updated listeners: ", stun_self.app.keys.keys[index].data.stun.listeners);
          }
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



  // async generateStun(publicKey) {



  //   let stun = await this.fetchStunInformation();
  //   if (!stun) {
  //     console.log("no stun");
  //     return;
  //   }

  //   //
  //   // my key
  //   //
  //   let do_we_broadcast_and_update = 1;

  //   let publickey = this.app.wallet.returnPublicKey();
  //   console.log("public key ", publicKey, this.app.wallet.returnPublicKey())
  //   let index = this.app.keys.keys.findIndex(key => key.publickey === publickey);

  //   if (index === -1) {
  //     this.app.keys.addKey(publickey);
  //     let new_index = this.app.keys.keys.findIndex(key => key.publickey === publickey);
  //     this.app.keys.keys[new_index].data.stun = stun;
  //     this.app.keys.saveKeys();
  //   }

  //   let new_index = this.app.keys.keys.findIndex(key => key.publickey === publickey);
  //   const key = this.app.keys.keys[new_index];

  //   // don't broadcast if is equal
  //   if (JSON.stringify(key.data.stun) === JSON.stringify(stun)) {
  //     do_we_broadcast_and_update = 1;
  //   }
  //   this.app.keys.keys[new_index].data.stun = { ...stun, listeners: this.app.keys.keys[new_index].data.stun.listeners };
  //   this.app.keys.saveKeys();



  //   // do we need to broadcast a message and update our keychain?
  //   console.log(do_we_broadcast_and_update, "broadcast");
  //   if (do_we_broadcast_and_update) {
  //     this.broadcastAddress(this.app.keys.keys[new_index].data.stun);
  //   }

  // }


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



  // fetchStunInformation() {


  //   this.stun.counter += 1;
  //   console.log("Stun count", this.stun.counter);
  //   console.log("keys ", this.app.keys.keys);


  //   return new Promise((resolve, reject) => {
  //     let stun = {
  //       ip_address: "",
  //       port: "",
  //       offer_sdp: "",
  //       pc: "",
  //       listeners: [],
  //       iceCandidates: []
  //     };
  //     const createPeerConnection = async () => {

  //       try {
  //         const pc = new RTCPeerConnection({
  //           iceServers: [
  //             {
  //               urls: "stun:openrelay.metered.ca:80",
  //             },
  //             {
  //               urls: "turn:openrelay.metered.ca:80",
  //               username: "openrelayproject",
  //               credential: "openrelayproject",
  //             },
  //             {
  //               urls: "turn:openrelay.metered.ca:443",
  //               username: "openrelayproject",
  //               credential: "openrelayproject",
  //             },
  //             {
  //               urls: "turn:openrelay.metered.ca:443?transport=tcp",
  //               username: "openrelayproject",
  //               credential: "openrelayproject",
  //             },
  //           ],
  //         });

  //         pc.onicecandidate = (ice) => {
  //           if (!ice || !ice.candidate || !ice.candidate.candidate) {

  //             // pc.close();

  //             stun.offer_sdp = pc.localDescription;

  //             // let new_obj = $.extend(new_obj, pc);
  //             // let peer_connection = JSON.stringify(new_obj); //returns correct JSON string
  //             // console.log('peer_connection ', peer_connection)
  //             stun.pc = ""

  //             this.app.connection.emit('peer_connection', pc)
  //             console.log("ice candidates", JSON.stringify(stun.iceCandidates));
  //             resolve(stun);
  //             return;
  //           }

  //           if (ice.candidate && pc.remoteDescription) {
  //             console.log('ice candidate', ice.candidate, ice)
  //             pc.addIceCandidate(ice.candidate);
  //           }

  //           let split = ice.candidate.candidate.split(" ");
  //           if (split[7] === "host") {
  //             // console.log(`Local IP : ${split[4]}`);
  //             // stun.ip_address = split[4];
  //             // console.log(split);
  //           } else {
  //             // console.log(`External IP : ${split[4]}`);
  //             // console.log(`PORT: ${split[5]}`);
  //             stun.ip_address = split[4];
  //             stun.port = split[5];
  //             stun.iceCandidates.push(ice.candidate);
  //             // resolve(stun);
  //           }
  //         };
  //         const localVideoSteam = document.querySelector('#localStream');
  //         const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  //         localStream.getTracks().forEach(track => {
  //           pc.addTrack(track, localStream);

  //         });
  //         if (localVideoSteam) {
  //           localVideoSteam.srcObject = localStream;
  //         }


  //         pc.LOCAL_STREAM = localStream;
  //         const remoteStream = new MediaStream()
  //         pc.addEventListener('track', (event) => {

  //           const remoteVideoSteam = document.querySelector('#remoteStream');
  //           console.log('got remote stream ', event.streams);
  //           event.streams[0].getTracks().forEach(track => {
  //             remoteStream.addTrack(track);
  //           });

  //           pc.REMOTE_STREAM = remoteStream

  //           if (remoteVideoSteam) {
  //             remoteVideoSteam.srcObject = remoteStream;
  //           }

  //         });

  //         const offer = await pc.createOffer();
  //         pc.setLocalDescription(offer);

  //         // stun.offer_sdp = offer;

  //         // // let new_obj = $.extend(new_obj, pc);
  //         // // let peer_connection = JSON.stringify(new_obj); //returns correct JSON string
  //         // // console.log('peer_connection ', peer_connection)
  //         // stun.pc = ""

  //         // this.app.connection.emit('peer_connection', pc)
  //         // resolve(stun);






  //       } catch (error) {
  //         console.log(error);
  //       }

  //     }
  //     return createPeerConnection();

  //   });
  // }





  broadcastAddress(stun) {
    let publickey = this.app.wallet.returnPublicKey();
    let key_index = this.app.keys.keys.findIndex(key => key.publickey === publickey);
    let listeners = this.app.keys.keys[key_index].data.stun.listeners;



    console.log('broadcasting address');
    let newtx = this.app.wallet.createUnsignedTransaction();

    console.log("listeners are ", listeners);
    for (let i = 0; i < listeners.length; i++) {
      console.log('broadcasting to ', listeners[i]);
      newtx.transaction.to.push(new saito.default.slip(listeners[i]));
    }



    newtx.msg.module = "Stun";
    newtx.msg.stun = stun;
    newtx = this.app.wallet.signTransaction(newtx);
    console.log(this.app.network);


    this.app.network.propagateTransaction(newtx);



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

  addListeners(listeners) {
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

    this.broadcastKeyToListeners(validated_listeners);

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

