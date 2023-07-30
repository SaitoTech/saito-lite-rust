const saito = require('./../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');
const CryptoSelectAmount = require('./lib/overlays/select-amount');
const CryptoInadequate = require('./lib/overlays/inadequate');


class Crypto extends ModTemplate {

  constructor(app, mod) {

    super(app);

    this.app = app;
    this.mod = mod;
    this.ticker = "";

    this.styles = ['/crypto/css/crypto-base.css'];

    this.appname = "Crypto";
    this.name = "Crypto";
    this.description = "Modifies the Game-Menu to add an option for managing in-game crypto";
    this.categories = "Utility Entertainment";
    this.min_balance = 0.0;
    this.overlay = new CryptoSelectAmount(app, this);
    this.overlay_inadequate = new CryptoInadequate(app, this);

  }
  

  

  respondTo(type = "") {

    if (type == "game-menu") {

      //
      // only show if games are winnable
      //
      let gm = this.app.modules.returnActiveModule();
      if (!gm.can_bet) { return null; }

      let ac = this.app.wallet.returnActivatedCryptos();
      let cm = this;
      let menu = { id: "game-crypto",
                   text: "Crypto",
                   submenus: []};

      for (let i = 0; i < ac.length; i++) {
      	menu.submenus.push({
          text : ac[i].ticker,
          id : "game-crypto-"+ac[i].ticker,
          class : "game-crypto-ticker",
          callback : async (app, game_mod) => {

	    this.attachStyleSheets();
	    this.ticker = ac[i].ticker;

	    this.min_balance = 0.0;

	    //
	    // check everyone else has crypto installed
	    //
	    for (let key in game_mod.game.cryptos) {
	      let c = game_mod.game.cryptos[key][this.ticker];
	      if (!c) {
		this.overlay_inadequate.render();
		return;
	      }
	      if (parseFloat(c.balance) <= 0) { 
		this.overlay_inadequate.render();
		return;
	      } else {
		if (parseFloat(c.balance) >= 0 && parseFloat(c.balance) < this.min_balance) {
		  this.min_balance = parseFloat(c.balance);
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
        });
      }
      return menu;
    }

    return super.respondTo(type);
  }


  enableCrypto(game_mod, game_id, ticker, amount) {

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
    game_mod.proposeGameStake(ticker, amount);

  }

}

module.exports = Crypto;

