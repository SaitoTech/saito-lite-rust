const ShareLinkTemplate = require("./share-link.template");
const SaitoOverlay = require("./../../saito-overlay/saito-overlay");

class ModalShareLink {

  constructor(app, mod, link = null) {
    this.app = app;
    this.overlay = new SaitoOverlay(app);
    this.link = link;
  }

  render(app, mod) {
    this.overlay.show(app, mod, ShareLinkTemplate(app, mod, this.link));
    this.attachEvents(app, mod);
  }

  attachEvents(app, mod) {
  }

}

module.exports = ModalShareLink;

