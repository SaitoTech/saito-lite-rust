const SaitoLoginOverlayTemplate = require("./backup-overlay.template");
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");

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
class BackupOverlay {
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

    document.querySelector(".saito-backup-button").onclick = (e) => {

      let email = document.getElementById("saito-login-email").value;
      let pass  = document.getElementById("saito-login-password").value;

      let decryption_secret = this.app.crypto.hash(this.app.crypto.hash(email+pass)+hash1);
      let retrieval_hash    = this.app.crypto.hash(this.app.crypto.hash(hash2+email)+pass);

      let newtx = this.mod.createBackupTransaction(decryption_secret, retrieval_hash);
      this.app.network.propagateTransaction(newtx);
      this.overlay.hide();

    }
  }

}

module.exports = BackupOverlay;

