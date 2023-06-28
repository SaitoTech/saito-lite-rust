const BackupTemplate = require("./backup.template");
const SaitoOverlay = require("./../../../lib/saito/ui/saito-overlay/saito-overlay");
const SaitoLoader = require("./../../../lib/saito/ui/saito-loader/saito-loader");

class Backup {
  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.success_callback = null;

    this.modal_overlay = new SaitoOverlay(this.app, this.mod);
    this.loader = new SaitoLoader(this.app, this.mod, "#backup-template .saito-overlay-subform");
  }

  render() {
    let key = this.app.keychain.returnKey(this.app.wallet.publicKey);
    let identifier = key?.identifier || "";
    let newIdentifier = key?.has_registered_username && identifier === "";

    console.log("Render backup overlay");
    this.modal_overlay.show(BackupTemplate(identifier, newIdentifier));
    this.attachEvents();
  }

  show() {
    this.render();
  }
  hide() {
    this.remove();
  }

  remove() {
    this.modal_overlay.remove();
  }

  attachEvents() {
    document.querySelector("#backup-template .saito-overlay-form-submit").onclick = (e) => {
      e.preventDefault();
      let email = document.querySelector("#backup-template .saito-overlay-form-email").value;
      let password = document.querySelector("#backup-template .saito-overlay-form-password").value;

      if (!email || !password) {
        return;
      }

      let div = document.querySelector("#backup-template .saito-overlay-subform");
      if (div) {
        div.innerHTML = "";
        div.classList.add("centerme");
      }

      this.loader.render();

      let button = document.querySelector("#backup-template .saito-overlay-form-submit");
      if (button) {
        button.innerHTML = "Uploading...";
        button.onclick = null;
      }

      this.mod.backupWallet(email, password);
    };
  }

  success() {
    let div = document.querySelector("#backup-template .saito-overlay-form-submit");
    if (div) {
      this.loader.remove();
      div.innerHTML = `Success`;
      div.onclick = () => {
        this.modal_overlay.remove();
      };
    }

    if (this.success_callback) {
      this.success_callback();
    }
  }
}

module.exports = Backup;
