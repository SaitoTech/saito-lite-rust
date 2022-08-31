const NotificationTemplate = require("./notification.template");
const LikeNotificationTemplate = require("./like-notification.template");
const ReplyNotificationTemplate = require("./reply-notification.template");
const RetweetNotificationTemplate = require("./retweet-notification.template");
const saito = require("./../../../lib/saito/saito");

class RedSquareNotification {

    constructor(app, mod, tx=null) {
      this.tx = tx;
    }

    render(app, mod, selector = "") {

      if (this.tx == null) { return; }

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
          let retweet_txmsg = retweet_tx.returnMessage();

      	  html = RetweetNotificationTemplate(app, mod, retweet_tx, retweet_txmsg);
      	//
      	// or reply
      	//
      	} else {
    	    html = ReplyNotificationTemplate(app, mod, this.tx, txmsg);
        }
      }


      app.browser.addElementToSelector(html, ".redsquare-list");
      this.attachEvents(app, mod);
    }

    attachEvents(app, mod) { 

    }
}

module.exports = RedSquareNotification;


