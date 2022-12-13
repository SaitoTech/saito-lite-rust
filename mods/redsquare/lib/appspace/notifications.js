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

console.log("NOTIFICATIONS: " + this.mod.notifications.length);

    for (let i = 0; i < this.mod.notifications.length; i++) {
      this.mod.notifications[i].container = ".redsquare-notifications";
      if (this.processNotification(this.mod.notifications[i])) {
	this.mod.notifications[i].text = html;
        this.mod.notifications[i].render();
      }
    }

    this.attachEvents();

  }  

  attachEvents() {

  }


  //
  // returns 0 (do not render) or 1 (render)
  //
  processNotification(tweet) {
 
    let html = '';
    let txmsg = tweet.tx.returnMessage();

    if (tweet.tx.transaction.ts > this.mod.last_viewed_notifications_ts) {
      this.mod.last_viewed_notifications_ts = tweet.tx.transaction.ts;
//      this.mod.saveRedSquare();
    }

    ///////////
    // LIKED //
    ///////////
    if (txmsg.request == "like tweet") {
      let qs = `.tweet-${txmsg.data.sig}`;
      let obj = document.querySelector(qs);
      if (obj) {
        obj.innerHTML = obj.innerHTML.replace("liked ", "really liked ");
        return 0;
      } else {
        tweet.text = "";
	return 1;
      }
    }

    else if (txmsg.request == "create tweet") {

      if (txmsg.data.retweet_tx) {

        /////////////
        // RETWEET //
        /////////////
        tweet.notice = "retweeted your tweet";
	return 1;

      } else {

        ///////////
        // REPLY //
        ///////////
        tweet.notice = "replied to your tweet";
	return 1;

      }
    }
  }

}

module.exports = AppspaceNotifications;



