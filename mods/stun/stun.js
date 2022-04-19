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
    this.stun.pc = ""

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
              const preferred_crypto = stun_self.app.wallet.returnPreferredCrypto();
              let address = preferred_crypto.returnAddress();
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
        const preferred_crypto = stun_self.app.wallet.returnPreferredCrypto();
        let address = preferred_crypto.returnAddress();

        if (!tx.msg.peer_info) return;
        if (address === tx.msg.peer_info.peer_b) {
          stun_self.app.connection.emit('answer_received', tx.msg.peer_info.peer_a, tx.msg.peer_info.peer_b, tx.msg.peer_info.answer);
        } else {
          console.log('tx peer key not equal');
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



  async generateStun(publicKey) {



    let stun = await this.fetchStunInformation();
    if (!stun) {
      console.log("no stun");
      return;
    }

    //
    // my key
    //
    let do_we_broadcast_and_update = 1;

    const preferred_crypto = this.app.wallet.returnPreferredCrypto();
    let publickey = preferred_crypto.returnAddress();
    console.log(publickey);
    let index = this.app.keys.keys.findIndex(key => key.publickey === publickey);

    if (index === -1) {
      this.app.keys.addKey(publickey);
      let new_index = this.app.keys.keys.findIndex(key => key.publickey === publickey);
      this.app.keys.keys[new_index].data.stun = stun;
      this.app.keys.saveKeys();
    }

    let new_index = this.app.keys.keys.findIndex(key => key.publickey === publickey);
    const key = this.app.keys.keys[new_index];

    // don't broadcast if is equal
    if (JSON.stringify(key.data.stun) === JSON.stringify(stun)) {
      do_we_broadcast_and_update = 1;
    }
    this.app.keys.keys[new_index].data.stun = { ...stun, listeners: this.app.keys.keys[new_index].data.stun.listeners };
    this.app.keys.saveKeys();



    // do we need to broadcast a message and update our keychain?
    console.log(do_we_broadcast_and_update, "broadcast");
    if (do_we_broadcast_and_update) {
      this.broadcastAddress(this.app.keys.keys[new_index].data.stun);
    }

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

  }



  fetchStunInformation() {

    return new Promise((resolve, reject) => {
      let stun = {
        ip_address: "",
        port: "",
        offer_sdp: "",
        pc: "",
        listeners: []

      };
      try {

        const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
        pc.createDataChannel('');
        pc.createOffer().then(offer => {
          pc.setLocalDescription(offer);
          //  console.log("offer ", offer);

        }).catch(e => console.log(`${e} An error occured on offer creation`));
        pc.onicecandidate = (ice) => {
          if (!ice || !ice.candidate || !ice.candidate.candidate) {
            // console.log("ice canditate check closed.");
            // pc.close();

            stun.offer_sdp = pc.localDescription;

            let new_obj = $.extend(new_obj, pc);
            let peer_connection = JSON.stringify(new_obj); //returns correct JSON string
            // console.log('peer_connection ', peer_connection)
            stun.pc = peer_connection;
            this.app.connection.emit('peer_connection', pc)
            resolve(stun);
            return;
          }
          let split = ice.candidate.candidate.split(" ");
          if (split[7] === "host") {
            // console.log(`Local IP : ${split[4]}`);
            // stun.ip_address = split[4];
            // console.log(split);
          } else {
            // console.log(`External IP : ${split[4]}`);
            // console.log(`PORT: ${split[5]}`);
            stun.ip_address = split[4];
            stun.port = split[5];
            // resolve(stun);
          }
        };

      } catch (error) {
        console.log("An error occured with stun", error);
      }
    });
  }





  broadcastAddress(stun) {
    const preferred_crypto = this.app.wallet.returnPreferredCrypto();
    let publickey = preferred_crypto.returnAddress();
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

    // does not work without the settimeout, it seems the blockchain isn't initialized by the time this function is run , so propagation doesn't register
    this.app.network.propagateTransaction(newtx);



  }

  broadcastAnswer(my_key, peer_key, answer) {
    let newtx = this.app.wallet.createUnsignedTransaction();
    console.log('broadcasting answer  to ', peer_key);
    newtx.transaction.to.push(new saito.default.slip(peer_key));

    newtx.msg.module = "Stun";
    newtx.msg.peer_info = {
      peer_a: my_key,
      peer_b: peer_key,
      answer
    };
    newtx = this.app.wallet.signTransaction(newtx);
    console.log(this.app.network);
    this.app.network.propagateTransaction(newtx);
  }

  addListeners(listeners) {
    if (listeners.length === 0) return console.log("No listeners to add");

    const preferred_crypto = this.app.wallet.returnPreferredCrypto();
    let publickey = preferred_crypto.returnAddress();
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


    // add listeners to existing listeners
    this.app.keys.keys[key_index].data.stun.listeners = [...this.app.keys.keys[key_index].data.stun.listeners, ...validated_listeners];
    this.app.keys.saveKeys();

    this.app.connection.emit('listeners-update', this.app, this);
  }





}

module.exports = Stun;

