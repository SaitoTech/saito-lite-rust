const saito = require('./../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');
const CryptoOverlay = require('./lib/overlay/main');

class Crypto extends ModTemplate {

  constructor(app) {

    super(app);

    this.appname = "Crypto";
    this.name = "Crypto";
    this.description = "Modifies the Game-Menu to add an option for managing in-game crypto";
    this.categories = "Utility Entertainment";

    this.overlay = new CryptoOverlay(app, this);

  }
  
  respondTo(type = "") {
    if (type == "game-menu") {
      return {
	menus : [ {
          menu_option: {
	    text: "Crypto",
	    id: "game-crypto",
	    class : "game-crypto",
      	    callback : async function(app, game_mod) {
	      let cm = app.modules.returnModule("Crypto");
	      let game_id = game_mod.game.id;
	      cm.enableCrypto(game_mod, game_id);
	    }
          },
	} ]
      }
    }
    return null;
  }


  enableCrypto(game_mod, game_id) {
    alert("Proposing Game Stake!");
    game_mod.proposeGameStake("TRX", "0.2");
    alert("Proposed!");
    //this.overlay.render(this.app, this);
  }

}

module.exports = Crypto;

