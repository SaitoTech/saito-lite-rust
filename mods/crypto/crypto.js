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
      let ac = this.app.wallet.returnActivatedCryptos();
      let menus = [];
      for (let i = 0; i < ac.length; i++) {
	menus[i] = {};
        menus[i].menu_option = {
	text: "Crypto",
	  id: "game-crypto",
	  class : "game-crypto",
      	  callback : async function(app, game_mod) {
	    game_mod.menu.showSubMenu("game-crypto");
          }
        };
	menus[i].sub_menu_option = {
          text : ac[i].ticker,
          id : "game-crypto-"+ac[i].ticker,
          class : "game-crypto-"+ac[i].ticker,
          callback : async function(app, game_mod) {
            game_mod.menu.hideSubMenus();
	    let cm = app.modules.returnModule("Crypto");
	    let game_id = game_mod.game.id;
	    cm.enableCrypto(game_mod, game_id, a[i].ticker);
          }
        };
      }
      return { menus : menus };
    }
    return null;
  }


  enableCrypto(game_mod, game_id, ticker) {
    alert("Proposing Game Stake!");
    game_mod.proposeGameStake(ticker, "0.2");
    alert("Proposed!");
    //this.overlay.render(this.app, this);
  }

}

module.exports = Crypto;

