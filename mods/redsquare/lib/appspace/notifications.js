const RedSquareAppspaceNotificationsTemplate = require("./notifications.template");

class RedSquareAppspaceNotifications {

  constructor(app) {
    this.app = app;
    this.name = "RedSquareAppspaceNotifications";
  }

  render(app, mod) {
    document.querySelector(".appspace").innerHTML = "";
    app.browser.addElementToClass(RedSquareAppspaceNotificationsTemplate(app, mod), "appspace");
  }

}

module.exports = RedSquareAppspaceNotifications;

