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

    for (let i = 0; i < mod.ntfs.length; i++) {
      let notification = new Notification(app, mod, mod.ntfs[i]);
      notification.render(app, mod, ".redsquare-list");
    }

    this.attachEvents(app, mod);

  }

  attachEvents(app, mod) {

  }

}

module.exports = RedSquareAppspaceNotifications;

