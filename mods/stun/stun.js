const saito = require("./../../lib/saito/saito");
const ModTemplate = require("../../lib/templates/modtemplate");



class Stun extends ModTemplate {

        IP_ADDRESS = ""
        PORT = ""

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

         console.log('STUN: ' + JSON.stringify(stun));

	 //
	 // do we need to broadcast a message and update our keychain?
	 //
	 if (1) {
           this.handleSendStunTransaction();
	   this.saveStun(stun);
	 }

       }


       fetchStunInformation() {

	let stun = {};

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
                this.handleSaveToKeyChain();
             }
          };

        } catch (error) {
          console.log("An error occured with stun",error)
        }

	return stun; 
       
      }


      saveStun() {

	//
	// keychain is already initialized by the time that we are initializing modules
	// BUT we may or may not have our own key stored, so we can't just write to the 0
	// ENTRY.
	//
        this.app.keys.keys[0].data.stun = stun;
        this.app.keys.saveKeys();
      }


      handleSendStunTransaction() {

        let newtx = this.app.wallet.createUnsignedTransaction();
        newtx.msg.module = "Stun";
        newtx.msg.stun = this.stun;
        newtx = this.app.wallet.signTransaction(newtx);
        this.app.network.propagateTransaction(newtx);
        
      }

}

module.exports = Stun;

