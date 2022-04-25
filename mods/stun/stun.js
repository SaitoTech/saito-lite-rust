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

    this.invites = [];
    this.peer_connections = {};
    this.videoMaxCapacity = 5;



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
            // console.log('tx peer key not equal');
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
    if (conf == 0) {
      if (txmsg.module === "Stun") {
        if (tx.msg.listeners) {
          stun_self.addListenersFromPeers(tx.msg.listeners.listeners);
        }



      }
    }
    if (conf == 0) {
      if (txmsg.module === "Stun") {
        if (tx.msg.invites) {
          stun_self.invites = tx.msg.invites.invites
          console.log("invites ", stun_self.invites);
        }

      }
    }
    if (conf == 0) {
      if (txmsg.module === "Stun") {
        if (tx.msg.invite) {
          console.log('new invite')
          stun_self.invites.push(tx.msg.invite.invite);
          console.log(stun_self.invites);
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


      // send latest copy of invites to this peer


      let newtx2 = this.app.wallet.createUnsignedTransaction();

      if (this.app.network.peers.length > 0) {
        newtx2.transaction.to.push(new saito.default.slip(this.app.network.peers[this.app.network.peers.length - 1].returnPublicKey()));

        console.log('sending to ', this.app.network.peers[this.app.network.peers.length - 1].returnPublicKey(), this.invites);
        newtx2.msg.module = "Stun";
        newtx2.msg.invites = {
          invites: this.invites
        };

        console.log(newtx2)
        newtx2 = this.app.wallet.signTransaction(newtx2);
        this.app.network.propagateTransaction(newtx2);
      }




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



  createVideoInvite() {
    const inviteCode = 'invite';
    // prevent dupicate invite code creation -- for development purposes
    let invite = this.invites.find(invite => invite.code === inviteCode);
    // prevent dupicate invite code creation -- for development purposes
    if (invite) return console.log('invite already created');
    invite = { code: inviteCode, peers: [], peerCount: 0, isMaxCapicity: false, validityPeriod: 86400, startTime: Date.now(), checkpoint: 0 };


    let newtx = this.app.wallet.createUnsignedTransaction();

    for (let i = 0; i < this.app.network.peers.length; i++) {
      if (this.app.network.peers[i].returnPublicKey() != this.app.wallet.returnPublicKey()) {
        newtx.transaction.to.push(new saito.default.slip(this.app.network.peers[i].returnPublicKey()));
      }
    }

    newtx.msg.module = "Stun";
    newtx.msg.invite = {
      invite
    };
    newtx = this.app.wallet.signTransaction(newtx);
    this.app.network.propagateTransaction(newtx);


  }



  async joinVideoInvite(inviteCode) {
    const invite = this.invites.find(invite => invite.code === inviteCode);
    const index = this.invites.findIndex(invite => invite.code === inviteCode);

    console.log('invites :', this.invites, 'result :', invite, index);


    if (!invite) return console.log('invite does not exist');

    if (invite.isMaxCapicity) {
      return console.log("Room has reached max capacity");
    }

    if (Date.now() < invite.startTime) {
      return console.log("Video call time not reached");
    }


    // check if peer already exists

    // check if peer  already exists

    let publicKey = this.app.wallet.returnPublicKey();
    let peerPosition = invite.peerCount + 1;

    const peer_data = {
      publicKey,
      peerPosition,
    }

    invite.peers.push(peer_data);
    invite.peerCount = invite.peerCount + 1;


    // send connection to other peers if they exit
    if (invite.peers.length > 1) {
      for (let i = 0; i < invite.peers.length; i++) {
        if (invite.peers[i].publicKey !== this.app.wallet.returnPublicKey()) {
          const pc = await this.createPeerConnectionOffer();
        }
      }
    }



    // update invites 
    this.invites[index] = invite;

    console.log(this.invites)






  }


  async createPeerConnection() {
    return "peer connection ha"
  }

  // addListeners(listeners) {
  //   if (this.app.BROWSER === 0) return;
  //   console.log("adding listeners ...");
  //   if (listeners.length === 0) return console.log("No listeners to add");

  //   let publickey = this.app.wallet.returnPublicKey();
  //   let key_index = this.app.keys.keys.findIndex(key => key.publickey === publickey);

  //   // save key if it doesnt exist
  //   if (key_index === -1) {
  //     this.app.keys.addKey(publickey);
  //     this.app.keys.saveKeys();
  //   }
  //   if (!this.app.keys.keys[key_index].data.stun) {
  //     this.app.keys.keys[key_index].data.stun = this.stun;
  //     this.app.keys.saveKeys();

  //   }

  //   let validated_listeners;

  //   // check if key is valid
  //   validated_listeners = listeners.map(listener => listener.trim());
  //   validated_listeners = listeners.filter(listener => listener.length === 44);

  //   // filter out already existing keys
  //   validated_listeners = listeners.filter(listener => !this.app.keys.keys[key_index].data.stun.listeners.includes(listener));

  //   // this.broadcastKeyToListeners(validated_listeners);

  //   // add listeners to existing listeners
  //   this.app.keys.keys[key_index].data.stun.listeners = [...this.app.keys.keys[key_index].data.stun.listeners, ...validated_listeners];
  //   this.app.keys.saveKeys();




  //   this.app.connection.emit('listeners-update', this.app, this.app.keys.keys[key_index].data.stun.listeners);
  // }


  // broadcastKeyToListeners(listeners) {
  //   let newtx = this.app.wallet.createUnsignedTransaction();
  //   let from = this.app.wallet.returnPublicKey();
  //   console.log('Adding contacts :', listeners, " to ", from);

  //   for (let i = 0; i < listeners.length; i++) {
  //     newtx.transaction.to.push(new saito.default.slip(listeners[i]));
  //   }



  //   newtx.msg.module = "Stun";
  //   newtx.msg.broadcast_details = {
  //     listeners,
  //     from
  //   };
  //   newtx = this.app.wallet.signTransaction(newtx);

  //   this.app.network.propagateTransaction(newtx);
  // }





}

module.exports = Stun;

