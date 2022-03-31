const saito = require("./../../lib/saito/saito");
const ModTemplate = require("../../lib/templates/modtemplate");



class Stun extends ModTemplate {

       constructor(app) {
         super(app);
         this.appname = "Stun";
         this.name = "Stun";
         this.description="Session Traversal Utilitiesf for NAT (STUN)";
         this.categories = "Utility Networking";

	 this.stun = {};
	 this.stun.ip_address = "";
	 this.stun.port = "";
       }

       initialize(app){

         super.initialize(app);

	 //
	 // always stun on init
	 //
	 let stun = this.fetchStunInformation();

	 //
	 // my key
	 //
	 let do_we_broadcast_and_update = 1;
	 let publickey = this.app.wallet.returnPublicKey();
	 let key = null;
	 for (let i = 0; i < this.app.keys.keys.length; i++) {
	   let tk = this.app.keys.keys[i];
	   if (tk.publickey === publickey) {
	     key = tk;
	     if (key.stun) {
	       if (JSON.stringify(key.stun) === JSON.stringify(stun)) {
		 do_we_broadcast_and_update = 0;
	       } else {
		 this.app.keys.keys[i].data.stun = stun;
                 this.app.keys.saveKeys();
	       }
	     }
	   }
	 }
         console.log('STUN: ' + JSON.stringify(stun));

	 //
	 // or add key if missing
	 //
	 if (key == null) {
	   do_we_broadcast_and_update = 1;
	   this.app.keys.addKey(this.app.wallet.returnPublicKey());
	   for (let i = 0; i < this.app.keys.keys.length; i++) {
	     if (this.app.keys.keys[i].publickey === this.app.wallet.returnPublicKey()) {
	       this.app.keys.keys[i].data.stun = stun;
               this.app.keys.saveKeys();
	     }
	   }
	 }

	 //
	 // do we need to broadcast a message and update our keychain?
	 //
	 if (do_we_broadcast_and_update) {
           this.broadcastAddress(stun);
	 }

       }


       fetchStunInformation() {

	let stun = {};

	try {

          const pc = new RTCPeerConnection({ iceServers: [ {urls: 'stun:stun.l.google.com:19302'} ] });
          pc.createDataChannel('');
          pc.createOffer().then(offer => pc.setLocalDescription(offer)).catch(e => console.log(`${e} An error occured on offer creation`))
          pc.onicecandidate = (ice) => {
            if (!ice || !ice.candidate || !ice.candidate.candidate) {
              console.log("ice canditate check closed.");
              pc.close();   
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
            }
          };

        } catch (error) {
          console.log("An error occured with stun",error)
        }

	return stun; 
       
      }


      broadcastAddress() {

        let newtx = this.app.wallet.createUnsignedTransaction();
        newtx.msg.module = "Stun";
        newtx.msg.stun = this.stun;
        newtx = this.app.wallet.signTransaction(newtx);
        this.app.network.propagateTransaction(newtx);
        
      }

}

module.exports = Stun;

