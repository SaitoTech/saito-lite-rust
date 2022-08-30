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
      let x = Math.random();

      if (x > 0  && x < 0.4) {
	       html = LikeNotificationTemplate(app, mod, this.tx);
      } else if (x > 0.4  && x < 0.7) {
	       html = ReplyNotificationTemplate(app, mod, this.tx);
      } else {
	     html = RetweetNotificationTemplate(app, mod, this.tx);
      } 
      app.browser.addElementToSelector(html, ".redsquare-list");

    }

    attachEvents(app, mod) { 
    }
}

module.exports = RedSquareNotification;


