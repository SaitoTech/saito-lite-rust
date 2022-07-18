const AddPublicKeyTemplate = require("./add-publickey.template");
const SaitoOverlay = require("./../../saito-overlay/saito-overlay");

class ModalAddPublicKey {

  constructor(app, mod) {
    this.app = app;
    this.overlay = new SaitoOverlay(app, mod);
  }

  render(app, mod) {
    this.overlay.show(app, mod, AddPublicKeyTemplate(app, mod));
    this.attachEvents(app, mod);
  }

  attachEvents(app, mod) {
    document.getElementById("add-publickey-button").onclick = (e) => {
      alert("add publickey clicked");
    }
  }

}

module.exports = ModalAddPublicKey;

