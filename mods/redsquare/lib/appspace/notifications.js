const RedSquareAppspaceNotificationsTemplate = require("./notifications.template");
const SaitoOverlay = require("./../../../../lib/saito/new-ui/saito-overlay/saito-overlay");
const Invite = require("./../invite");


class RedSquareAppspaceNotifications {

  constructor(app, mod) {
    this.app = app;
    this.name = "RedSquareAppspaceNotifications";
  }

  render(app, mod) {
    document.querySelector(".appspace").innerHTML = "";
    app.browser.addElementToClass(RedSquareAppspaceNotificationsTemplate(app, mod), "appspace");

    let tx = app.wallet.createUnsignedTransaction();
    let invite = new Invite(app, mod, tx);
    invite.render(app, mod, ".redsquare-list");

    this.attachEvents(app, mod);

  }

  attachEvents(app, mod) {

  }

}

module.exports = RedSquareAppspaceNotifications;

