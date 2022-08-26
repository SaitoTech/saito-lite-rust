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

  }

}

module.exports = ModalConfirmAddPublicKey;