const LikeNotificationTemplate = require("./notification-like.template");
const ReplyNotificationTemplate = require("./notification-reply.template");
const saito = require("./../../../lib/saito/saito");
const Tweet = require("./tweet");
const SaitoUser = require("./../../../lib/saito/ui/saito-user/saito-user");

class RedSquareNotification {
  constructor(app, mod, tx = null) {
    this.app = app;
    this.mod = mod;
    this.tx = tx;
    this.user = null;
  }

  render(selector = "") {
    if (this.tx == null) {
      document.querySelector(selector).innerHTML =
        '<div class="saito-end-of-redsquare">no notifications</div>';
    } else {
      let html = "";
      let from = this.tx.from[0].publicKey;

      let txmsg = this.tx.returnMessage();

      //
      // We put the entire render in a callback so that if we don't have the original tweet being referenced by the
      // notification, we can make a peer DB request to try to find it
      //

      this.mod.loadTweetWithSig(txmsg.data.signature, (tweet_tx) => {

        if (!tweet_tx) {
          console.log("Notification for unknown tweet");
          return null;
        }

        if (!tweet_tx.tx) {
          console.log("Tweet does not contain original TX for unknown reasons");
          return null;
        }


        if (Array.isArray(tweet_tx)) {
          if (tweet_tx.length > 0) {
            tweet_tx = tweet_tx[0];
          } else {
            console.log("Notification for unknown tweet");
            return null;
          }
        }

        //Process as normal
        if (txmsg.request == "like tweet") {
          this.tweet = new Tweet(
            this.app,
            this.mod,
            tweet_tx.tx,
            `.tweet-notif-fav.notification-item-${from}-${txmsg.data.signature} .tweet-body .tweet-main .tweet-preview`
          );

          this.user = new SaitoUser(
            this.app,
            this.mod,
            `.notification-item-${from}-${txmsg.data.signature} > .tweet-header`,
            this.tx.from[0].publicKey
          );

          let qs = `.tweet-notif-fav.notification-item-${from}-${txmsg.data.signature}`;
          let obj = document.querySelector(qs);
          if (obj) {
            obj.innerHTML = obj.innerHTML.replace("liked ", "really liked ");

            //We process multiple likes from same person of same tweet, just update html in situ and quit
            return;
          } else {
            html = LikeNotificationTemplate(this.app, this.mod, this.tx);
            let msg = "liked your tweet";

            if (this.mod.publicKey != tweet_tx.tx.from[0].publicKey) {
              msg = "liked a tweet sent to you";
            }

            this.user.notice = `</i> <span class='notification-type'>${msg}</span>`;
          }
        } else if (txmsg.request == "create tweet") {

          this.tweet = new Tweet(
            this.app,
            this.mod,
            tweet_tx.tx,
            `.notification-item-${this.tx.signature} .tweet-body .tweet-main .tweet-preview`
          );
          this.user = new SaitoUser(
            this.app,
            this.mod,
            `.notification-item-${this.tx.signature} > .tweet-header`,
            this.tx.from[0].publicKey
          );

          html = ReplyNotificationTemplate(this.app, this.mod, this.tx);

          //
          // retweet
          //
          if (txmsg.data.retweet_tx) {
            this.user.notice = "<span class='notification-type'>retweeted your tweet</span>";

            //
            // or reply
            //
          } else {
            this.user.notice = "<span class='notification-type'>replied to your tweet</span>";
          }
        } else {
          console.log("Unknown Notification type: ", txmsg.request);
          return null;
        }

        if (!this.tweet?.noerrors) {
          return null;
        }

        //
        //
        //
        let nqs = ".notification-item-" + this.tx.signature;
        if (document.querySelector(nqs)) {
          this.app.browser.replaceElementBySelector(html, nqs);
        } else {
          this.app.browser.addElementToSelector(html, ".tweet-manager");
        }

        //
        // and render the user
        //
        this.user.fourthelem = this.app.browser.returnTime(this.tx.timestamp);
        this.user.render();

        this.tweet.show_controls = 0;
        this.tweet.render();

        this.attachEvents();
      });
    }
  }

  attachEvents() {
    let qs = ".notification-item-" + this.tx.signature;
    let obj = document.querySelector(qs);

    if (obj) {
      obj.onclick = (e) => {
        let sig = e.currentTarget.getAttribute("data-id");
        let tweet = this.mod.returnTweet(this.tx.signature);

        if (tweet) {
          this.app.connection.emit("redsquare-tweet-render-request", tweet);
        } else {

          //
          // I'm not sure we would ever run into this situation
          // Besides wounldn't the this.tweet be the one we are looking for... why even go through the DOM dataset?
          //
          console.log("Notification tweet not found...");

          this.mod.loadTweetWithSig(this.tx.signature, (txs) => {
            let tweet = this.mod.returnTweet(this.tx.signature);
            this.app.connection.emit("redsquare-tweet-render-request", tweet);
          });
        }
      };
    }
  }

  isRendered() {
    //if (document.querySelector(`.notification-item-${this.tx.signature}`)) {
    //  return true;
    //}
    return false;
  }
}

module.exports = RedSquareNotification;
