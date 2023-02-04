const AddPublicKeyTemplate = require("./add-publickey.template");
const SaitoOverlay = require("./../../saito-overlay/saito-overlay");

class ModalAddPublicKey {

  constructor(app, mod) {
    this.app = app;
    this.overlay = new SaitoOverlay(app);
  }

  render(app, mod) {
    this.overlay.show(app, mod, AddPublicKeyTemplate(app, mod));
    document.getElementById("add-publickey-input").focus();
    this.attachEvents(app, mod);
  }

  attachEvents(app, mod) {
    document.getElementById("add-publickey-button").onclick = (e) => {
      let publickey = document.getElementById("add-publickey-input").value;
      let encrypt_self = app.modules.returnModule("Encrypt");
      if (encrypt_self === null) {
	if (app.crypto.isPublicKey(publickey)) {
	  alert("adding address, but unable to create shared secret -- plaintext only");
	  app.keychain.addKey(publickey);
	} else {
	  alert("not a Saito public key...");
	}
      } else {
	app.keychain.saveKeys();
	encrypt_self.initiate_key_exchange(publickey);
      }
      this.overlay.hide();
    }
  }

}

module.exports = ModalAddPublicKey;

