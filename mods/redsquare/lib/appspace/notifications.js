const RedSquareAppspaceNotificationsTemplate = require("./notifications.template");
const Invite = require("./../invite");


class RedSquareAppspaceNotifications {

  constructor(app) {
    this.app = app;
    this.name = "RedSquareAppspaceNotifications";
  }

  render(app, mod) {
    document.querySelector(".appspace").innerHTML = "";
    app.browser.addElementToClass(RedSquareAppspaceNotificationsTemplate(app, mod), "appspace");

    let tx = app.wallet.createUnsignedTransaction();
    let invite = new Invite(app, mod, tx);
    invite.render(app, mod, ".redsquare-list");

  }

}

module.exports = RedSquareAppspaceNotifications;

