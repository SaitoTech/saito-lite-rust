const saito = require("./../../../../lib/saito/saito");
const SaitoLoginOverlayTemplate = require("./recover-overlay.template");
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");
const SaitoLoader = require("./../../../../lib/saito/ui/saito-loader/saito-loader");

/**
 * This near full-screen overlay allows users to restore their account by providing an email
 * address plus password. Both components are hashed with ONE salt to provide a lookup key
 * that is used to fetch a transaction from the network. That transaction contains an encrypted
 * copy of the user's wallet.
 *
 * The same information is then hashed with a SECOND salt to generate the decryption key. This
 * permits users who lose access to their account to restore their privatekey and potentially
 * any additional information.
 *
 * we can put backup functionality in this module as well / or in browser.js
 *
 */
class RecoverOverlay {
  /**
   * @constructor
   * @param app - the Saito Application
   */
  constructor(app, mod, withCloseBox = true, removeOnClose = true) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(this.app, this.mod, false, true); // false to close-button, true to delete-when-closed
  }

  /**
   * Create the DOM elements if they don't exist. Called by show
   * @param app - the Saito Application
   * @param mod - the calling module
   */
  render() {
    this.overlay.show(SaitoLoginOverlayTemplate(this.app, this.mod));
    document.getElementById("saito-login-email").focus();
    this.attachEvents();
  }


  attachEvents() {

    let hash1 = "WHENINDISGRACEWITHFORTUNEANDMENSEYESIALLALONEBEWEEPMYOUTCASTSTATE";
    let hash2 = "ANDTROUBLEDEAFHEAVENWITHMYBOOTLESSCRIESANDLOOKUPONMYSELFANDCURSEMYFATE";

    document.querySelector("#saito-login-password").onkeydown = (e) => {
      if ((e.which == 13 || e.keyCode == 13) && !e.shiftKey) {
        e.preventDefault();
        document.querySelector(".saito-restore-button").click();
      }
    }

    document.querySelector(".saito-restore-button").onclick = (e) => {

      let email = document.getElementById("saito-login-email").value;
      let pass = document.getElementById("saito-login-password").value;

      let decryption_secret = this.app.crypto.hash(this.app.crypto.hash(email + pass) + hash1);
      let retrieval_secret = this.app.crypto.hash(this.app.crypto.hash(hash2 + email) + pass);

      let newtx = this.mod.createRecoverTransaction(retrieval_secret);

      //
      // Update UI
      //
      document.querySelector(".saito-modal-subtitle").innerHTML = "looking for wallet to restore...";
      document.querySelectorAll(".saito-login-overlay-field").forEach((el) => {
        el.style.display = "none";
      });
      let ld = new SaitoLoader(this.app, this.mod, ".saito-login-overlay");
      ld.render();

      this.app.network.sendTransactionWithCallback(newtx, async (res) => {

        if (res) {
          if (res.rows) {
            if (res.rows[0]) {

              let tx = JSON.parse(res.rows[0].tx);
              let newtx = new saito.default.transaction(undefined, tx);
              let txmsg = newtx.returnMessage();

              let encrypted_wallet = txmsg.wallet;
              let decrypted_wallet = this.app.crypto.aesDecrypt(encrypted_wallet, decryption_secret);

              this.app.wallet.wallet = JSON.parse(decrypted_wallet);
              this.app.wallet.saveWallet();
              this.overlay.hide();

            }
          }
        }
      });

    }
  }

}

module.exports = RecoverOverlay;

