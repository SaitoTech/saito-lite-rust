const saito = require("./../../lib/saito/saito");
const ModTemplate = require("../../lib/templates/modtemplate");



class Stun extends ModTemplate {
        IP_ADDRESS = ""
        PORT = ""

       constructor(app){
                super(app)
                this.appname = "Stun",
                this.name = "Stun",
                this.description="Session Traversal Utilitiesf for NAT (STUN)"
                this.categories = "Utility Networking"
       }

       initialize(app){
           super.initialize(app)
           this.getIP()
           console.log('stun')
       }

      //  initializeHTML(app) {

      //   super.initializeHTML(app);
    
    
    
      // }


       getIP = () => {
        if(!this.IP_ADDRESS && this.app.BROWSER == 1){
       
        this.handleGetIPs();
        }
      }

       handleGetIPs = () =>  {
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
                // this.IP_ADDRESS = split[4]
                // console.log(split)
              } else {
                console.log(`External IP : ${split[4]}`);
                console.log(`PORT: ${split[5]}`)
                this.IP_ADDRESS = split[4]
                this.PORT = split[5];

                this.handleSaveToKeyChain()
  
               }
          };
        } catch (error) {
            console.log("An error occured with stun",error)
        }
        
        }

    

      handleSaveToKeyChain = ()=> {
        if (this.app.options.keys.length == 0) {
          this.app.keys.initialize();
        }
          
          this.app.keys.keys[0].data = {
            PORT: this.PORT,
            IP_ADDRESS: this.IP_ADDRESS
          }
          this.app.keys.saveKeys()
          this.handleSendStunTransaction()
        }



        handleSendStunTransaction(){
          let newStunTx = this.app.wallet.createUnsignedTransaction();

          newStunTx.msg.module = "stun";
          newStunTx.msg.IP = this.IP_ADDRESS;
          newStunTx.msg.PORT = this.PORT
    
          const signedStunTx =  this.app.wallet.signTransaction(newStunTx);
         
          this.app.network.propagateTransaction(signedStunTx);

        
        
        }

      
}

module.exports = Stun