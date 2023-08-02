<<<<<<< HEAD
const saito = require("./../../lib/saito/saito");
const ModTemplate = require("../../lib/templates/modtemplate");
const CryptoSelectAmount = require("./lib/overlays/select-amount");
=======
const saito = require('./../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');
const CryptoSelectAmount = require('./lib/overlays/select-amount');
const CryptoInadequate = require('./lib/overlays/inadequate');

>>>>>>> staging

class Crypto extends ModTemplate {
  constructor(app, mod) {
    super(app);

    this.app = app;
    this.mod = mod;
    this.ticker = "";

    this.styles = ["/crypto/css/crypto-base.css"];

    this.appname = "Crypto";
    this.name = "Crypto";
    this.description = "Modifies the Game-Menu to add an option for managing in-game crypto";
    this.categories = "Utility Entertainment";
    this.min_balance = 0.0;
    this.overlay = new CryptoSelectAmount(app, this);
<<<<<<< HEAD
=======
    this.overlay_inadequate = new CryptoInadequate(app, this);

>>>>>>> staging
  }

  respondTo(type = "") {

    if (type == "game-menu") {
      //
      // only show if games are winnable
      //
      let gm = this.app.modules.returnActiveModule();
<<<<<<< HEAD
      if (gm.winable == 0) {
        return null;
      }
      if (gm.cooperative == 1) {
        return null;
      }
      if (gm.losable == 0) {
        return null;
      }
=======
      if (!gm.can_bet) { return null; }
      if (gm.name === "Chess") { return null; }
>>>>>>> staging

      let ac = this.app.wallet.returnActivatedCryptos();

      let cm = this;
      let menu = {
        id: "game-crypto",
        text: "Crypto",
        submenus: [],
      };

      for (let i = 0; i < ac.length; i++) {
<<<<<<< HEAD
        menu.submenus.push({
          text: ac[i].ticker,
          id: "game-crypto-" + ac[i].ticker,
          class: "game-crypto-ticker",
          callback: async (app, game_mod) => {
            this.attachStyleSheets();
            this.ticker = ac[i].ticker;
            await this.overlay.render(async (amount) => {
              game_mod.menu.hideSubMenus();
              await cm.enableCrypto(game_mod, game_mod.game.id, ac[i].ticker, amount);
            });
          },
=======
      	menu.submenus.push({
          text : ac[i].ticker,
          id : "game-crypto-"+ac[i].ticker,
          class : "game-crypto-ticker",
          callback : async (app, game_mod) => {

	    this.attachStyleSheets();
	    this.ticker = ac[i].ticker;

console.log("CRYPTOS");
console.log(JSON.stringify(game_mod.game.cryptos));

	    this.min_balance = 0.0;
	
	    //
	    // check everyone else has crypto installed
	    //
	    let usernum = 0;
	    for (let key in game_mod.game.cryptos) {
	      usernum++;
	      let c = game_mod.game.cryptos[key][this.ticker];
	      if (!c) {
		this.overlay_inadequate.render();
		return;
	      }
	      if (parseFloat(c.balance) <= 0) { 
		this.overlay_inadequate.render();
		return;
	      } else {
		if (parseFloat(c.balance) >= 0) {
		  if (usernum == 1) {
		    this.min_balance = parseFloat(c.balance);
		  } else {
		    if (parseFloat(c.balance) < this.min_balance) {
		      this.min_balance = parseFloat(c.balance);
	            }
		  }
	        }
	      }
	    }

	    this.overlay.render(async (amount) => {
              game_mod.menu.hideSubMenus();

    	      let ticker = ac[i].ticker;
	      let cryptomod = game_mod.app.wallet.returnCryptoModuleByTicker(ticker);
	      let current_balance = await cryptomod.returnBalance();


	      //
	      // if proposing, you should be ready
	      //
	      if (Number(current_balance) < Number(amount)) {
		alert("You do not have "+ticker+" available yourself. Please deposit more before enabling this game.");
		return;
	      }
	      if (Number(this.min_balance) < Number(amount)) {
		alert("Some players have only "+Number(this.min_balance)+" "+ticker+" in wallet. Please try a lower amount");
		return;
	      }

      	      cm.enableCrypto(game_mod, game_mod.game.id, ac[i].ticker, amount);
	    });
          }
>>>>>>> staging
        });
      }
      return menu;
    }

    return super.respondTo(type);
  }


  async enableCrypto(game_mod, game_id, ticker, amount) {

    if (game_mod.game.crypto != "" && game_mod.game.crypto != "CHIPS") {
      alert("Exiting: crypto already enabled for this game!");
      return;
    }

    //
    // restore original pre-move state
    //
    // this ensures if we are halfway through a move that we will
    // return to the game in a clean state after we send the request
    // to our opponent for shifting game modes.
    //
    game_mod.game = game_mod.game_state_pre_move;
    game_mod.game.turn = [];
    game_mod.moves = [];
    await game_mod.proposeGameStake(ticker, amount);
  }
}

module.exports = Crypto;
