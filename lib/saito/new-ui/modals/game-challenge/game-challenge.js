const ChallengeIssuedTemplate = require('./challenge-issued.template');
const ChallengeTimeoutTemplate = require('./challenge-timeout.template');
const ChallengeRejectedTemplate = require('./challenge-rejected.template');
const ArcadeChallengeTemplate = require('./arcade-challenge.template');
const SaitoOverlay = require("./../../saito-overlay/saito-overlay");
const saito = require("./../../../saito");

class GameChallengeManager {

/**
 * @constructor
 * @param app - the Saito Application
 */ 
    constructor(app, mod, tx) {
      this.app = app;
      this.mod = mod; //Arcade

      this.overlay = new SaitoOverlay(app, false);
    
       app.connection.on("arcade-reject-challenge", (game_id)=>{
       	this.overlay.show(app, null, ChallengeRejectedTemplate());
      });

       app.connection.on("arcade-game-loading" , () =>{

      });
    }


/*
*/

	processChallenge(app, tx){
	    if (!tx.isFrom(app.wallet.returnPublicKey())){
	      let txmsg = tx.returnMessage();      

	      this.overlay.show(app, this, ArcadeChallengeTemplate(txmsg));
	      this.overlay.blockClose();

	      document.getElementById("reject-btn").onclick = (e) =>{
	        let newtx = app.wallet.createUnsignedTransactionWithDefaultFee();
	  
	        for (let player of txmsg.players){
	          newtx.transaction.to.push(new saito.default.slip(player, 0.0));
	        }

	        newtx.msg = {
	          request: "sorry",
	          module: "Arcade",
	          game_id: tx.transaction.sig,
	        };

	        console.log(JSON.parse(JSON.stringify(newtx)));
	        newtx = app.wallet.signTransaction(newtx);

	        app.connection.emit("send-relay-message", {recipient: txmsg.players, request: "arcade spv update", data:newtx});
	        this.overlay.remove();
	      }

	      document.getElementById("accept-btn").onclick = (e) =>{
	        let newtx = this.mod.createJoinTransaction(tx);
	        app.connection.emit("send-relay-message", {recipient: txmsg.players, request: "arcade spv update", data:newtx});
	        this.overlay.remove();        
	      }

	    }else{
	    	this.overlay.show(app, this, ChallengeIssuedTemplate());

	    	this.timeout = setTimeout(async ()=>{
              this.overlay.show(app, this, ChallengeTimeoutTemplate());
            }, 10000);

	    }

	}

}


module.exports = GameChallengeManager;