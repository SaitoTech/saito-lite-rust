const ConfirmAddPublicKeyTemplate = require("./confirm-add-publickey.template");
const SaitoOverlay = require("./../../saito-overlay/saito-overlay");

class ModalConfirmAddPublicKey {

  constructor(app, mod) {
    this.app = app;
    this.overlay = new SaitoOverlay(app, mod);
  }

  render(app, mod) {
    this.overlay.show(app, mod, ConfirmAddPublicKeyTemplate(app, mod));
    this.attachEvents(app, mod);
  }

  attachEvents(app, mod) {

  }

}

module.exports = ModalConfirmAddPublicKey;