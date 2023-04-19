
const RedSquareAppspaceNotificationsTemplate = require("./notifications.template");
const Notification = require("./../notification");
const SaitoLoader = require("./../../../../lib/saito/ui/saito-loader/saito-loader");

class RedSquareAppspaceNotifications {

  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.name = "RedSquareAppspaceNotifications";
    this.saito_loader = new SaitoLoader(app, mod, '#redsquare-home-header');
    this.increment = 1;
    this.container  = container;
  }


  render() {

    if (document.querySelector(".redsquare-notifications")) {
      this.app.browser.replaceElementBySelector(RedSquareAppspaceNotificationsTemplate(this.app, this.mod), ".redsquare-notifications");
    } else {
      if (this.container) {
        this.app.browser.addElementToSelector(RedSquareAppspaceNotificationsTemplate(this.app, this.mod), this.container);
      } else {
        this.app.browser.addElementToDom(RedSquareAppspaceNotificationsTemplate(this.app, this.mod));
      }
    }

    this.attachEvents();

  }

  renderNotifications() {

    if (!document.querySelector(".redsquare-notifications")) {
      this.render();
    }

    console.log("notifications list /////////");
    console.log(this.mod.notifications);

    for (let i = 0; i < this.mod.notifications.length; i++) {
      let notification = new Notification(this.app, this.mod, this.mod.notifications[i].tx);
      notification.render(".redsquare-notifications");
    }


    if (this.mod.notifications.length === 0){
      let notification = new Notification(this.app, this.mod, null);
      notification.render(".redsquare-notifications");
    }

    this.attachEvents();    
    document.querySelector('.saito-container').scrollTo({top:0, left:0, behavior:"smooth"});
  }


  attachEvents() {}

}

module.exports = RedSquareAppspaceNotifications;

