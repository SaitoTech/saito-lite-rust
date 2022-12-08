const NotificationTemplate = require("./notification.template");
//const LikeNotificationTemplate = require("./like-notification.template");
//const ReplyNotificationTemplate = require("./reply-notification.template");
//const RetweetNotificationTemplate = require("./retweet-notification.template");
//const saito = require("./../../../lib/saito/saito");


class RedSquareNotification {

  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.container = container;
  }

  render() {

/****
    if (this.tx == null) { return; }

    let html = '';
    let txmsg = this.tx.returnMessage();

    ///////////
    // LIKED //
    ///////////
    if (txmsg.request == "like tweet") {
      let qs = `.likedd-tweet-${txmsg.data.sig}`;
      let obj = document.querySelector(qs);
      if (obj) {
        obj.innerHTML = obj.innerHTML.replace("liked ", "really liked ");
        return;
      } else {
        html = LikeNotificationTemplate(app, mod, this.tx);
      }
    }

    /////////////
    // RETWEET //
    /////////////
    else if (txmsg.request == "create tweet") {
      //
      // retweet
      //
      if (txmsg.data.retweet_tx) {
        let retweet_tx = new saito.default.transaction(JSON.parse(txmsg.data.retweet_tx));
        let retweet_txmsg = retweet_tx.returnMessage();
        html = RetweetNotificationTemplate(app, mod, this.tx, retweet_tx, retweet_txmsg);
        //
        // or reply
        //
      ///////////
      // REPLY //
      ///////////
      } else {
        html = ReplyNotificationTemplate(app, mod, this.tx, txmsg);
      }
    }

    if (this.tx.transaction.ts > mod.last_viewed_notifications_ts) {
      mod.last_viewed_notifications_ts = this.tx.transaction.ts;
      mod.saveRedSquare();
    }

    app.browser.addElementToSelector(html, ".redsquare-list");
    this.attachEvents(app, mod);
  }

  attachEvents(app, mod) {

    let qs = ".notification-item-" + this.tx.transaction.sig;
    let obj = document.querySelector(qs);

    if (obj) {
      obj.onclick = (e) => {
        let sig = e.currentTarget.getAttribute("data-id");
        mod.renderParentWithChildren(app, mod, sig);
      }
    }
****/
  }
}

module.exports = RedSquareNotification;

