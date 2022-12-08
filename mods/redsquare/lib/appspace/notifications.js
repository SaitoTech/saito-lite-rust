const AppspaceNotificationsTemplate = require("./notifications.template");

class AppspaceNotifications {

  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.name = "RedSquareAppspaceNotifications";
  }

  render() {

    //
    // replace element or insert into page
    //
    if (document.querySelector(".redsquare-notifications")) {
      this.app.browser.replaceElementBySelector(AppspaceNotificationsTemplate(), ".redsquare-notifications");
    } else {
      if (this.container) {
        this.app.browser.addElementToSelector(AppspaceNotificationsTemplate(), this.container);
      } else {
        this.app.browser.addElementToDom(AppspaceNotificationsTemplate());
      }
    }

console.log("NOTIFICATIONS: ");
console.log(JSON.stringify(this.mod.notifications));

    //
    //
    //
    for (let i = 0; i < this.mod.notifications.length; i++) {
      this.mod.notifications[i].container = ".redsquare-home";
      this.mod.notifications[i].render();
    }

    this.attachEvents();

  }  

  attachEvents() {

  }

}

module.exports = AppspaceNotifications;



