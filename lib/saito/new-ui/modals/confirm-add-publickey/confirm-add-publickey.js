const ConfirmAddPublicKeyTemplate = require("./confirm-add-publickey.template");
const SaitoOverlay = require("./../../saito-overlay/saito-overlay");

class ModalConfirmAddPublicKey {

  constructor(app, mod, identiconUri, publickey) {
    this.app = app;
    this.overlay = new SaitoOverlay(app, mod);
    this.identiconUri = identiconUri;
    this.publickey = publickey;
  }

  render(app, mod) {
    this.overlay.show(app, mod, ConfirmAddPublicKeyTemplate(app, mod, this.identiconUri, this.publickey));
    this.attachEvents(app, mod);
  }

  attachEvents(app, mod) {
    document.getElementById("saito-add-key-btn").onclick = (e) => {
      let publickey = document.getElementById("add-publickey-input").value;
      let encrypt_self = app.modules.returnModule("Encrypt");
      if (encrypt_self === null) {
        if (app.crypto.isPublicKey(publickey)) {
          salert("Adding address, but unable to create shared secret -- plaintext only");
          app.keys.addKey(publickey);
        } else {
          salert("Not a Saito public key...");
        }
      } else {
        app.keys.saveKeys();
        encrypt_self.initiate_key_exchange(publickey);
        salert("Contact added successfully");
      }
      this.overlay.hide();
    }
  }

}

module.exports = ModalConfirmAddPublicKey;