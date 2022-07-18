const AddContactTemplate = require("./add-contact.template");
const SaitoOverlay = require("./../../saito-overlay/saito-overlay");

/***
const InviteFriendsQR = require("./invite-friends-qr");
const InviteFriendsTemplate = require("./invite-friends.template.js");
const InviteFriendsLinkTemplate = require("./invite-friends-link.template");
const InviteFriendsPublickeyTemplate = require("./invite-friends-publickey.template");
***/

class ModalAddContact {

  constructor(app, mod) {
console.log("c 1");
    this.app = app;
console.log("c 2");
    this.overlay = new SaitoOverlay(app, mod);
console.log("c 3");
  }

  render(app, mod) {


console.log("1 2");
    this.overlay.show(app, mod, AddContactTemplate(app, mod));
console.log("1 3");

  }

  attachEvents(app, mod) {
  }

}

module.exports = ModalAddContact;

