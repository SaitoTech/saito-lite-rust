const ConfirmAddPublicKeyTemplate = require("./confirm-add-publickey.template");
const SaitoOverlay = require("./../../saito-overlay/saito-overlay");

class ModalConfirmAddPublicKey {

  constructor(app, mod, identiconUri, publickey) {
    this.app = app;
    this.overlay = new SaitoOverlay(app);
    this.identiconUri = identiconUri;
    this.publickey = publickey;

    //
    // adding a key means it should have aes_secret
    //
    let k = app.keychain.findByPublicKey(publickey);
    if (typeof k != "undefined") {
      if (k.aes_publickey != "") {
        this.status = 1;
      } else {
        this.status = 0;
      }
    } else {
      this.status = 0;
    }
  }

  render(app, mod) {
    this.overlay.show(app, mod, ConfirmAddPublicKeyTemplate(app, mod, this.identiconUri, this.publickey, this.status));
    this.attachEvents(app, mod);
  }

  attachEvents(app, mod) {
    if (document.getElementById("saito-add-key-btn") != null) {
      document.getElementById("saito-add-key-btn").onclick = (e) => {
        let publickey = document.getElementById("saito-confirm-add-publickey-input").value;
        let encrypt_self = app.modules.returnModule("Encrypt");
        if (encrypt_self === null) {
          if (app.crypto.isPublicKey(publickey)) {
            salert("Adding address, but unable to create shared secret -- plaintext only");
            app.keychain.addKey(publickey);
          } else {
            salert("Not a Saito public key...");
          }
        } else {
          app.keychain.saveKeys();
          encrypt_self.initiate_key_exchange(publickey);
          salert("Contact added successfully");
        }
        this.overlay.hide();
      }
    }
  }
}

module.exports = ModalConfirmAddPublicKey;
