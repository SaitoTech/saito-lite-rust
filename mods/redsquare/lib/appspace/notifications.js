const RedSquareAppspaceNotificationsTemplate = require("./notifications.template");
const SaitoOverlay = require("./../../../../lib/saito/new-ui/saito-overlay/saito-overlay");
const Notification = require("./../notification");


class RedSquareAppspaceNotifications {

  constructor(app, mod) {
    this.app = app;
    this.name = "RedSquareAppspaceNotifications";
  }

  render(app, mod) {
    document.querySelector(".appspace").innerHTML = "";
    app.browser.addElementToClass(RedSquareAppspaceNotificationsTemplate(app, mod), "appspace");

    for (let i = 0; i < 10; i++) {
      let tx = app.wallet.createUnsignedTransaction();
      let notification = new Notification(app, mod, tx);
      notification.render(app, mod, ".redsquare-list");
    }

    this.attachEvents(app, mod);

  }

  attachEvents(app, mod) {

  }

}

module.exports = RedSquareAppspaceNotifications;

