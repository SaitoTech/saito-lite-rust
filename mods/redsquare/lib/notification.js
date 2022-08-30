const NotificationTemplate = require("./notification.template");
const LikeNotificationTemplate = require("./like-notification.template");
const ReplyNotificationTemplate = require("./reply-notification.template");
const RetweetNotificationTemplate = require("./retweet-notification.template");

class RedSquareNotification {

    constructor(app, mod, tx) {
      this.tx = tx;
    }

    render(app, mod, selector = "") {

      let html = '';
      let txmsg = this.tx.returnMessage();
 
      if (txmsg.request == "like tweet") {
	html = LikeNotificationTemplate(app, mod, this.tx);
      }
      else if (txmsg.request == "create tweet") {
        //
	// retweet
	//
	if (txmsg.data.retweet_tx) {
	  let retweet_tx = new saito.default.transaction(JSON.parse(txmsg.data.retweet_tx));
	  html = RetweetNotificationTemplate(app, mod, retweet_tx);
	//
	// or reply
	//
	} else {
	  html = ReplyNotificationTemplate(app, mod, this.tx);
        }
      }
      app.browser.addElementToSelector(html, ".redsquare-list");

    }

    attachEvents(app, mod) { 
    }
}

module.exports = RedSquareNotification;


