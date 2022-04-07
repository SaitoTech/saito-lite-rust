const saito = require("./../../lib/saito/saito");
const ModTemplate = require("../../lib/templates/modtemplate");
const StunUI = require('./lib/stun-ui');
const Slip = require('../..//lib/saito/slip.ts');


console.log(ModTemplate, Slip, saito);

class Stun extends ModTemplate {





  constructor(app) {
    super(app);
    this.appname = "Stun";
    this.name = "Stun";
    this.description = "Session Traversal Utilitiesf for NAT (STUN)";
    this.categories = "Utility Networking";

    this.stun = {};
    this.stun.ip_address = "";
    this.stun.port = "";
    this.stun.offer_sdp = "";


  }



 

  onConfirmation(blk, tx, conf, app) {
    console.log("testing ...");
    let stun_self = app.modules.returnModule("Stun");
    let txmsg = tx.returnMessage();


    if (conf == 0) {
      if (txmsg.module === "Stun") {
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
              stun_self.stun = tx.msg.stun;
              const preferred_crypto = stun_self.app.wallet.returnPreferredCrypto();
              let address = preferred_crypto.returnAddress();
              console.log(stun_self.app.keys.keys[i].publickey, address);
              console.log("key length ", stun_self.app.keys.keys.length);
              console.log("public key ", address);
              console.log("stun changed, saving changes..", tx.msg.stun);
              stun_self.app.keys.keys[i].data.stun = tx.msg.stun;

              stun_self.app.keys.saveKeys();
          


     
          
             

            }

          }
        }



       
        app.connection.emit("stun-update",app, stun_self);
      
      


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
    this.stun = stun;

    console.log(this.stun);

    //
    // my key
    //
    let do_we_broadcast_and_update = 1;
    const preferred_crypto = this.app.wallet.returnPreferredCrypto();
    let publickey = preferred_crypto.returnAddress();
  
    let key = null;
    console.log(this.app.keys.keys);
    for (let i = 0; i < this.app.keys.keys.length; i++) {
      let tk = this.app.keys.keys[i];
      if (tk.publickey === publickey) {
           console.log('public keys', tk.publickey, publickey);
        key = tk;
        if (key && !key.data.stun) {
          this.app.keys.keys[i].data.stun = stun;
          this.app.keys.saveKeys();
        }
        if (key && key.data.stun) {
          if (JSON.stringify(key.data.stun) === JSON.stringify(stun)) {
            do_we_broadcast_and_update = 1;
          } else {
            this.app.keys.keys[i].data.stun = stun;
            this.app.keys.saveKeys();
          }
        }
      }
    }



    //  or add key if missing

    if (key == null) {
      do_we_broadcast_and_update = 1;
      this.app.keys.addKey(publickey);
      for (let i = 0; i < this.app.keys.keys.length; i++) {
        if (this.app.keys.keys[i].publickey === publickey) {
          this.app.keys.keys[i].data.stun = stun;
          this.app.keys.saveKeys();
        }
      }
    }

    //
    // do we need to broadcast a message and update our keychain?
    console.log(do_we_broadcast_and_update, "broadcast");
    if (do_we_broadcast_and_update) {
      this.broadcastAddress( publicKey);
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
        offer_sdp: ""
      };
      try {
        
        const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
        pc.createDataChannel('');
        pc.createOffer().then(offer => pc.setLocalDescription(offer)).catch(e => console.log(`${e} An error occured on offer creation`));
        pc.onicecandidate = (ice) => {
          if (!ice || !ice.candidate || !ice.candidate.candidate) {
            console.log("ice canditate check closed.");
            pc.close();
            stun.offer_sdp = pc.localDescription;
            resolve(stun);
            return;
          }
          let split = ice.candidate.candidate.split(" ");
          if (split[7] === "host") {
            // console.log(`Local IP : ${split[4]}`);
            // stun.ip_address = split[4];
            // console.log(split);
          } else {
            console.log(`External IP : ${split[4]}`);
            console.log(`PORT: ${split[5]}`);
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





  broadcastAddress(publicKey) {

    console.log('broadcasting address');
    let newtx = this.app.wallet.createUnsignedTransaction();
   
    
 
      newtx.transaction.to.push(new saito.default.slip(publicKey));
    

    newtx.msg.module = "Stun";
    newtx.msg.stun = this.stun;
    newtx = this.app.wallet.signTransaction(newtx);
    console.log(this.app.network);

    // does not work without the settimeout, it seems the blockchain isn't initialized by the time this function is run , so propagation doesn't register
    this.app.network.propagateTransaction(newtx);



  }



}

module.exports = Stun;

