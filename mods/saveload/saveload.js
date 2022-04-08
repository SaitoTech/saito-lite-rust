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


  initialize(app) {

    if (this.app.browser.active_module === "load") {
      let game_id = this.app.browser.returnURLParameter("game_id");

      if (game_id != "") {

        let c = confirm("Are you sure you wish to load this game? Clicking YES will redirect you into the game.");
        if (c) {

  	  let game_obj = this.app.options.saves[game_id];

	  for (let i = 0; i < this.app.options.games.length; i++) {
	    if (this.app.options.games[i].id == game_id) {
	      game_obj.ts = new Date().getTime();
	      this.app.options.games[i] = game_obj;
	      this.app.storage.saveOptions();
	      for (let z = 0; z < this.app.modules.mods.length; z++) {
	        if (this.app.modules.mods[z].name === game_obj.module) {
	  	  let game_slug = this.app.modules.mods[z].returnSlug();
		  window.location = "/"+game_slug;
	        }
	      }
	    }
	  }
	}
      }
    }

  }

}

module.exports = Saveload;

