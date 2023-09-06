const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");
const CryptoSelectAmountTemplate = require("./select-amount.template");

class CryptoSelectAmount {
  constructor(app, mod, mycallback = null) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(app, mod);
    this.callback = mycallback;
  }

  render(mycallback = null) {
    if (mycallback != null) {
      this.callback = mycallback;
    }
    this.overlay.show(CryptoSelectAmountTemplate(this.app, this.mod));
    this.attachEvents(this.callback);
  }

  attachEvents(callback = null) {
    let stake_input = document.getElementById("amount_to_stake_input");
    if (!stake_input) {
      return;
    }

    stake_input.onclick = (e) => {
      let amt = stake_input.value;
      if (parseFloat(amt) == 0) {
        stake_input.select();
      }
    };

    document.querySelector(".crypto_amount_btn").onclick = (e) => {
      let amount = stake_input.value;
      let confirm = document.getElementById("crypto-stake-confirm-input").checked;

      if (parseFloat(amount) <= 0) {
        salert("You need to select a positive value");
        return;
      }

      if (parseFloat(amount) > this.mod.max_balance) {
        salert("Not all the players have that much to stake");
        return;
      }

      if (!confirm) {
        salert("You need to confirm");
        return;
      }

      if (callback != null) {
        this.overlay.hide();
        callback(amount);
      }
    };
  }
}

module.exports = CryptoSelectAmount;
