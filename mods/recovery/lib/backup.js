const BackupTemplate = require('./backup.template');
const SaitoOverlay = require('./../../../lib/saito/ui/saito-overlay/saito-overlay');
const SaitoLoader = require('./../../../lib/saito/ui/saito-loader/saito-loader');

class Backup {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.success_callback = null;
    this.desired_identifier = "";

    this.modal_overlay = new SaitoOverlay(this.app, this.mod);
    this.loader = new SaitoLoader(this.app, this.mod, "#backup-template .saito-overlay-subform");
  }

  render() {
    let key = this.app.keychain.returnKey(this.mod.publicKey);
    let identifier = key?.identifier || "";
    let newIdentifier = key?.has_registered_username && identifier === "";
    identifier = this.desired_identifier || identifier;

    this.modal_overlay.show(BackupTemplate(identifier, newIdentifier));
    this.attachEvents();
  }

  show() { this.render(); }
  hide() { this.remove(); }

  remove() {
    this.modal_overlay.remove();
  }

  attachEvents() {

    document.querySelector('#backup-template .saito-overlay-form-submit').onclick = (e) => {
      e.preventDefault();
      let email = document.querySelector("#backup-template .saito-overlay-form-email").value;
      let password = document.querySelector("#backup-template .saito-overlay-form-password").value;

      if (!email || !password){
        console.warn("No email or password provided!");
        return;
      }
      
      if (document.querySelector(".saito-overlay-form-text")){
        document.querySelector(".saito-overlay-form-text").remove();
      }

      let div = document.querySelector("#backup-template .saito-overlay-subform");
      if (div){
        div.innerHTML = "";
        div.classList.add("centerme");
      }

      this.loader.render();
      
      let button = document.querySelector("#backup-template .saito-overlay-form-submit");
      if (button){
        button.innerHTML = "Uploading...";
        button.onclick = null;
      }

      this.mod.backupWallet(email, password);

      setTimeout(()=>{
        this.remove();
        if (this.success_callback) {
          this.success_callback();
        }
      }, 3000);

    }
  }

  //Don't actually care about receiving a transaction
  success(){
    /*let div = document.querySelector("#backup-template .saito-overlay-form-submit");
    if (div){
      this.loader.remove();
      div.innerHTML = `Success`;
      div.onclick = ()=> { this.modal_overlay.remove(); }
    }

    if (this.success_callback){
      this.success_callback();
    }*/
  }

}

module.exports = Backup;

