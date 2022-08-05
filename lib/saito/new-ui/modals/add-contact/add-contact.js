const AddContactTemplate = require("./add-contact.template");
const SaitoOverlay = require("./../../saito-overlay/saito-overlay");
const AddPublicKey = require("./../add-publickey/add-publickey");
const ShareLink = require("./../share-link/share-link");


class ModalAddContact {

  constructor(app, mod) {
    this.app = app;
    this.overlay = new SaitoOverlay(app, mod);
  }

  render(app, mod) {
    this.overlay.show(app, mod, AddContactTemplate(app, mod));
    this.attachEvents(app, mod);
  }

  attachEvents(app, mod) {

    document.getElementById("add-by-address").onclick = (e) => {
      this.overlay.hide();
      let m = new AddPublicKey(app, mod);
      m.render(app, mod);
    }
    document.getElementById("add-by-qrcode").onclick = (e) => {
      this.overlay.hide();
      let qrscanner = app.modules.returnModule("QRScanner");
      if (qrscanner) { qrscanner.startScanner(); } else {
	alert("Your Saito bundle does not support QR scanning");
      }
    }
    document.getElementById("add-by-link").onclick = (e) => {
      this.overlay.hide();
      let s = new ShareLink(app, mod);
      s.render(app, mod);
    }

  }

}

module.exports = ModalAddContact;

