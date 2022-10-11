const saito = require('./../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');

class Crypto extends ModTemplate {

  constructor(app) {

    super(app);

    this.appname = "Crypto";
    this.name = "Crypto";
    this.description = "Modifies the Game-Menu to add an option for managing in-game crypto";
    this.categories = "Utility Entertainment";

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
	      cm.enableCrypto(game_id);
	    }
          },
	} ]
      }
    }
    return null;
  }


  enableCrypto(game_id) {
    alert("Enabling Crypto:" + game_id);
  }

}




module.exports = Screenshot;

