const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");
const CryptoSelectAmountTemplate = require("./select-amount.template");

class CryptoSelectAmount {

  constructor(app, mod, mycallback=null) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(app, mod);
    this.callback = mycallback;
  }

  render(mycallback = null) {
    if (mycallback != null) { this.callback = mycallback; }
    this.overlay.show(CryptoSelectAmountTemplate(this.app, this.mod));
    this.attachEvents(this.callback);
  }

  attachEvents(callback=null) {

    document.querySelector(".amount_to_stake").onclick = (e) => {
      let amt = document.querySelector(".amount_to_stake").value;
      if (amt === "0.0" || amt === "0") { 
        document.querySelector(".amount_to_stake").select();
      }
    }

    document.querySelector(".crypto_amount_btn").onclick = (e) => {
      let amount = document.getElementById("amount_to_stake_input").value;
      if (callback != null) {
	this.overlay.hide();
        callback(amount);
      }
    };

  }

}

module.exports = CryptoSelectAmount;


