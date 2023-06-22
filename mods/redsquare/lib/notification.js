const LikeNotificationTemplate = require("./notification-like.template");
const ReplyNotificationTemplate = require("./notification-reply.template");
const RetweetNotificationTemplate = require("./notification-retweet.template");
const saito = require("./../../../lib/saito/saito");
const Tweet = require("./tweet");
const SaitoUser = require("./../../../lib/saito/ui/saito-user/saito-user");

class RedSquareNotification {
  constructor(app, mod, tx = null) {
    this.app = app;
    this.mod = mod;
    this.tx = tx;
    this.type = 1; // 1 reply
    // 2 retweet
    // 3 like
    if (tx != null) {
      this.user = new SaitoUser(
        this.app,
        this.mod,
        `.notification-item-${tx.signature} > .tweet-header`,
        tx.from[0].publicKey
      );
    } else {
      this.user = null;
    }
  }

  render(selector = "") {
    let app = this.app;
    let mod = this.mod;

    if (this.tx == null) {
      document.querySelector(selector).innerHTML = '';
    } else {
      let html = "";
      let txmsg = this.tx.returnMessage();
      let from = this.tx.from[0].publicKey;

      if (txmsg.request == "like tweet") {
        let qs = `.tweet-notif-fav-${from}-${txmsg.data.sig}`;
        let obj = document.querySelector(qs);
        if (obj) {
          obj.innerHTML = obj.innerHTML.replace("liked ", "really liked ");
          return;
        } else {
          html = LikeNotificationTemplate(app, mod, this.tx);
          this.user.notice = "</i> <span class='notification-type'>liked your tweet</span>";
          this.user.fourthelem = app.browser.returnTime(new Date().getTime());
          this.type = 3; // like
        }
      } else if (txmsg.request == "create tweet") {
        //
        // retweet
        //
        if (txmsg.data.retweet_tx) {
          let retweet_tx = new saito.default.transaction();
          retweet_tx.deserialize_from_web(this.app, txmsg.data.retweet_tx);
          let retweet_txmsg = retweet_tx.returnMessage();
          html = RetweetNotificationTemplate(app, mod, this.tx, retweet_tx, retweet_txmsg);
          this.type = 2; // retweet
          this.user.notice = "<span class='notification-type'>retweeted your tweet</span>";
          this.user.fourthelem = app.browser.returnTime(new Date().getTime());

          //
          // or reply
          //
        } else {
          html = ReplyNotificationTemplate(app, mod, this.tx, txmsg);
          this.user.notice = "<span class='notification-type'>replied to your tweet</span>";
          this.user.fourthelem = app.browser.returnTime(new Date().getTime());
        }
      }

      if (this.tx.timestamp > mod.last_viewed_notifications_ts) {
        mod.last_viewed_notifications_ts = this.tx.timestamp;
        mod.save();
      }

      //
      //
      //
      let nqs = ".notification-item-" + this.tx.signature;
      if (document.querySelector(nqs)) {
        app.browser.replaceElementBySelector(html, nqs);
      } else {
        app.browser.addElementToSelector(html, ".tweet-manager");
      }

      //
      // and render the user
      //
      this.user.render();

      this.attachEvents();
    }
  }

  attachEvents() {
    let app = this.app;
    let mod = this.mod;

    let qs = ".notification-item-" + this.tx.signature;
    let obj = document.querySelector(qs);

    if (obj) {
      obj.onclick = (e) => {
        let sig = e.currentTarget.getAttribute("data-id");
        let tweet = this.mod.returnTweet(sig);

        if (tweet) {
          app.connection.emit("redsquare-home-tweet-render-request", tweet);
          app.connection.emit("redsquare-home-loader-render-request");
        } else {
          mod.loadTweetWithSig(sig, (txs) => {
            let tweet = this.mod.returnTweet(sig);
            app.connection.emit("redsquare-home-tweet-render-request", tweet);
            app.connection.emit("redsquare-home-loader-render-request");
          });
        }
      };
    }
  }

  isRendered() {
    if (document.querySelector(`.notification-item-${this.tx.signature}`)) {
      return true;
    }
    return false;
  }
}

module.exports = RedSquareNotification;
