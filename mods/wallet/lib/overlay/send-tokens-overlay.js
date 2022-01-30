const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');
const SendTokensOverlayTemplate = require('./send-tokens-overlay.template');

module.exports = SendTokensOverlay = {

  render(app, mod) {

    this.overlay = new SaitoOverlay(app);

    this.overlay.show(app, mod, SendTokensOverlayTemplate());

  },

  attachEvents(app, mod) {

    document.getElementById("wallet-send-tokens-submit-btn").onclick = (e) => {

      let recipient = document.getElementById("wallet-send-tokens-recipient").value;
      let amount = document.getElementById("wallet-send-tokens-amount").value;
      let token = app.wallet.return

      let c = confirm(`Do you wish to send ${amount} ${app.wallet.preferred_crypto} to ${recipient}`);
      if (c) {
        salert("Your payment has been sent");
      } else {
        salert("Transfer cancelled");
      }
    }

  },

}

