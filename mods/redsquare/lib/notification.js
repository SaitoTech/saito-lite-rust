const NotificationTemplate = require("./notification.template");
const LikeTemplate = require("./like.template");
const ReplyTemplate = require("./reply.template");
const RetweetTemplate = require("./retweet.template");

class RedSquareNotification {

    constructor(app, mod, tx) {
      this.tx = tx;
    }

    render(app, mod, selector = "") {

      let html = '';
      let x = Math.random();
      if (x < 0.4) {
	html = LikeTemplate(app, mod, this.tx);
      } else if (x < 0.7) {
	html = ReplyTemplate(app, mod, this.tx);
      } else {
	html = RetweetTemplate(app, mod, this.tx);
      } 
      app.browser.addElementToSelector(html, ".redsquare-list");

    }

    attachEvents(app, mod) { 
    }
}

module.exports = RedSquareNotification;


