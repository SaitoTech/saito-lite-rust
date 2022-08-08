const ShareLinkTemplate = require("./share-link.template");
const SaitoOverlay = require("./../../saito-overlay/saito-overlay");

class ModalShareLink {

  constructor(app, mod) {
    this.app = app;
    this.overlay = new SaitoOverlay(app, mod);
  }

  render(app, mod) {
    this.overlay.show(app, mod, ShareLinkTemplate(app, mod));
    this.attachEvents(app, mod);
  }

  attachEvents(app, mod) {
  }

}

module.exports = ModalShareLink;

