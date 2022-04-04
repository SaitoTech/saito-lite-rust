const saito = require('./../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');

class Saveload extends ModTemplate {

  constructor(app) {

    super(app);

    this.appname = "Save and Load";
    this.name = "Saveload";
    this.description = "Save and load games - useful for bughunting";
    this.categories = "Utility Entertainment";

  }
  
  respondTo(type = "") {
    if (type == "game-menu") {
      return {
	menus : [ {
          menu_option: {
	    text: "Game",
	    id: "game-game",
            class : "game-game",
            callback : async function(app, game_mod) {
	      game_mod.menu.showSubMenu("game-game");
	    }
          },
	  sub_menu_option: {
            text : "Save",
            id : "game-save",
            class : "game-save",
            callback : async function(app, game_mod) {
	      game_mod.game.moves = [];
	      game_mod.addMove("SAVE");
	      game_mod.endTurn();
	      alert("saving the game!");
            }
	  },
	} ]
      }
    }
    return null;
  }

}

module.exports = Saveload;

