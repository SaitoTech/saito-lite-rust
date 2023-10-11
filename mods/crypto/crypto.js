const saito = require("./../../lib/saito/saito");
const ModTemplate = require("../../lib/templates/modtemplate");
const CryptoSelectAmount = require("./lib/overlays/select-amount");
const CryptoInadequate = require("./lib/overlays/inadequate");

class Crypto extends ModTemplate {
  constructor(app, mod) {
    super(app);

    this.app = app;
    this.mod = mod;
    this.ticker = "";

    this.styles = ["/crypto/css/crypto-base.css"];

    this.appname = "Crypto";
    this.name = "Crypto";
    this.description = "Enable crypto gaming";
    this.categories = "Utility Entertainment";
    this.min_balance = 0.0;
    this.overlay = new CryptoSelectAmount(app, this);
    this.overlay_inadequate = new CryptoInadequate(app, this);
  }

  respondTo(type = "") {
    if (type == "game-menu") {
      //
      // This should be a game module
      //
      let gm = this.app.modules.returnActiveModule();

      //
      // If it isn't a game module or a bettable game
      //
      if (!gm?.game?.cryptos) {
        return null;
      }

      //
      // Returns an object of CRYPTO(string): MAX_BET(float)
      //
      let ac = this.calculateAvailableCryptos(gm.game.cryptos);

      let menu = {
        id: "game-crypto",
        text: "Crypto",
        submenus: [],
      };

      for (let ticker in ac) {
        menu.submenus.push({
          parent: "game-crypto",
          text: ticker,
          id: "game-crypto-" + ticker,
          class: "game-crypto-ticker",
          callback: async (app, game_mod) => {
            this.attachStyleSheets();
            this.ticker = ticker;

            this.min_balance = 0.0;
            this.max_balance = ac[ticker];

            console.log(game_mod.game.crypto);
            if (game_mod.game.crypto && game_mod.game.crypto != "CHIPS") {
              salert(`Exiting: ${game_mod.game.crypto} already enabled for this game!`);
              return;
            }

            this.overlay.render((amount) => {
              game_mod.menu.hideSubMenus();
              game_mod.proposeGameStake(ticker, amount);
            });
          },
        });
      }

      if (Object.keys(ac).length == 0){
        menu.submenus.push({
          text: "No Cryptos Available",
          id: "game-crypto-none",
          class: "game-crypto-none",
          callback: (app, game_mod) => {
            game_mod.menu.hideSubMenus();
            salert("The players do not have any common crypto available to play with");
          }
        });
      }

      return menu;
    }

    return super.respondTo(type);
  }


  /**
   * We have a list of each players available cryptos and balances, so
   * we want to calculate an intersection and minimum operation
   */ 
  calculateAvailableCryptos(crypto_array) {
    let union = [];

    for (let player in crypto_array){
      for (let c in crypto_array[player]){
        if (!union.includes(c)){
          union.push(c);
        }
      }
    }

    let intersection = {};

    for (let c of union){
      let min = 0;
      for (let player in crypto_array){
        if (crypto_array[player][c]){
          let value = parseFloat(crypto_array[player][c].balance);
          if (min) {
            min = Math.min(min, value);
          }else {
            min = value;
          }
        }else {
          min = -1;
          break;
        }
      }

      if (min > 0){
        intersection[c] = min;
      }
    }

    return intersection;
  }


  returnCryptoOptionsHTML(values = null) {
    values = values || [0.001, 0.01, 0.1, 1, 5, 10, 50, 100, 500, 1000];
    let html = `
        <div class="overlay-input">
          <label for="crypto">Crypto:</label>
          <select id="crypto" name="crypto">
            <option value="" selected>none</option>`;

    let listed = [];
    for (let i = 0; i < this.app.modules.mods.length; i++) {
      if (this.app.modules.mods[i].ticker && !listed.includes(this.app.modules.mods[i].ticker)) {
        html += `<option value="${this.app.modules.mods[i].ticker}">${this.app.modules.mods[i].ticker}</option>`;
        listed.push(this.app.modules.mods[i].ticker);
      }
    }

    html += `</select></div>`;

    html += `<div id="stake_input" class="overlay-input" style="display:none;">
                <label for="stake">Stake:</label>
                <select id="stake" name="stake">`;

    for (let i = 1; i < values.length; i++) {
      html += `<option value="${values[i]}" >${values[i]}</option>`;
    }
    html += `</select></div>`;

    return html;
  }

}

module.exports = Crypto;
