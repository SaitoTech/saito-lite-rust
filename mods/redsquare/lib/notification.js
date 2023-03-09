const NotificationTemplate = require("./notification.template");
const LikeNotificationTemplate = require("./like-notification.template");
const ReplyNotificationTemplate = require("./reply-notification.template");
const RetweetNotificationTemplate = require("./retweet-notification.template");
const saito = require("./../../../lib/saito/saito");
const Tweet = require("./tweet");


class RedSquareNotification {

  constructor(app, mod, tx = null) {
    this.app = app;
    this.mod = mod;
    this.tx = tx;
  }

  render(selector = "") {

    let app = this.app;
    let mod = this.mod;

    if (this.tx == null) {
      document.querySelector(selector).innerHTML = `<div class="notifications-empty"><span> <i class="far fa-folder-open" aria-hidden="true"></i> </span> <p>No new notifications </p> </div>`
    } else {
      console.log('rendering tx', this.tx, this.tx.returnMessage())
      let html = '';
      let txmsg = this.tx.returnMessage();

      if (txmsg.request == "like tweet") {
        let qs = `.tweet-fav-${txmsg.data.sig}`;
        let obj = document.querySelector(qs);
        if (obj) {
          obj.innerHTML = obj.innerHTML.replace("liked ", "really liked ");
          return;
        } else {
          html = LikeNotificationTemplate(app, mod, this.tx);
        }
      } else if (txmsg.request == "create tweet") {
        //
        // retweet
        //
        if (txmsg.data.retweet_tx) {
          let retweet_tx = new saito.default.transaction(undefined, JSON.parse(txmsg.data.retweet_tx));
          let retweet_txmsg = retweet_tx.returnMessage();
          html = RetweetNotificationTemplate(app, mod, this.tx, retweet_tx, retweet_txmsg);
          //
          // or reply
          //
        } else {
          html = ReplyNotificationTemplate(app, mod, this.tx, txmsg);
        }
      }

      if (this.tx.transaction.ts > mod.last_viewed_notifications_ts) {
        mod.last_viewed_notifications_ts = this.tx.transaction.ts;
        mod.save();
      }

      app.browser.addElementToSelector(html, ".redsquare-notifications");
      this.attachEvents();
    }

  }

  attachEvents() {

    let app = this.app;
    let mod = this.mod;

    let qs = ".notification-item-" + this.tx.transaction.sig;
    let obj = document.querySelector(qs);

    if (obj) {
      obj.onclick = (e) => {
        let sig = e.currentTarget.getAttribute("data-id");
        let sql = `SELECT *
                   FROM tweets
                   WHERE sig = '${sig}'
                      OR parent_id = '${sig}'`;
        mod.loadTweetsFromPeerAndReturn(mod.peers_for_tweets[0], sql, (txs) => {
          for (let z = 0; z < txs.length; z++) {
            let tweet = new Tweet(app, mod, ".redsquare-home", txs[z]);
            app.connection.emit('redsquare-thread-render-request', tweet);
          }
        }, false, false);
        return;
      }
    }
  }
}

module.exports = RedSquareNotification;

