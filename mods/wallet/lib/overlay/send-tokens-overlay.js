const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');
const SendTokensOverlayTemplate = require('./send-tokens-overlay.template');

module.exports = SendTokensOverlay = {

  render(app, mod) {

    mod.overlay = new SaitoOverlay(app);
    mod.overlay.show(app, mod, SendTokensOverlayTemplate());

  },

  attachEvents(app, mod) {

    document.getElementById("wallet-send-tokens-submit-btn").onclick = (e) => {

      let recipient = document.getElementById("wallet-send-tokens-recipient").value;
      let amount = document.getElementById("wallet-send-tokens-amount").value;
      let preferred_crypto = app.wallet.wallet.preferred_crypto;
      let ticker = preferred_crypto;
      let cryptomod = null;

      for (let i = 0; i < app.modules.mods.length; i++) {
	if (app.modules.mods[i].ticker === ticker) {
	  cryptomod = app.modules.mods[i];
	}
      }

alert("PREFERRED CRYPTO: " + app.wallet.wallet.preferred_crypto);

      let c = confirm(`Do you wish to send ${amount} ${app.wallet.wallet.preferred_crypto}/${ticker} to ${recipient}`);
      if (c) {
	let sender = cryptomod.returnAddress();
	let hash = app.wallet.sendPayment([sender], [recipient], [amount], (new Date().getTime()), function() {
	  mod.overlay.hide();
	}, ticker);
      } else {
        salert("Transfer cancelled");
      }
    }

  },

}

