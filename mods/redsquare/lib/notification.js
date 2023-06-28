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
    this.user = null;
  }

  render(selector = "") {

    if (this.tx == null) {
      document.querySelector(selector).innerHTML = '<div class="saito-end-of-redsquare">No notifications</div>';
    } else {

      let html = "";
      let txmsg = this.tx.returnMessage();
      let from = this.tx.transaction.from[0].add;
      let tweet_tx = this.mod.returnTweet(txmsg.data.sig);
      
      if (txmsg.request == "like tweet") {
        this.tweet = new Tweet(this.app, this.mod, tweet_tx.tx, `.tweet-notif-fav.notification-item-${from}-${txmsg.data.sig} .tweet-body .tweet-main .tweet-preview`);
        this.user = new SaitoUser(this.app, this.mod, `.notification-item-${from}-${txmsg.data.sig} > .tweet-header`, this.tx.transaction.from[0].add);

        let qs = `.tweet-notif-fav.notification-item-${from}-${txmsg.data.sig}`;
        let obj = document.querySelector(qs);
        if (obj) {
          obj.innerHTML = obj.innerHTML.replace("liked ", "really liked ");
          
          //We process multiple likes from same person of same tweet, just update html in situ and quit
          return;

        } else {
          html = LikeNotificationTemplate(this.app, this.mod, this.tx);
          this.user.notice = "</i> <span class='notification-type'>liked your tweet</span>";
        }
      } else if (txmsg.request == "create tweet") {
        this.tweet = new Tweet(this.app, this.mod, tweet_tx.tx, `.notification-item-${this.tx.transaction.sig} .tweet-body .tweet-main .tweet-preview`);
        this.user = new SaitoUser(this.app, this.mod, `.notification-item-${this.tx.transaction.sig} > .tweet-header`, this.tx.transaction.from[0].add);

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
      }


      //
      //
      //
      let nqs = ".notification-item-" + this.tx.transaction.sig;
      if (document.querySelector(nqs)) {
        this.app.browser.replaceElementBySelector(html, nqs);
      } else {
        this.app.browser.addElementToSelector(html, ".tweet-manager");
      }

      //
      // and render the user
      //
      this.user.fourthelem = this.app.browser.returnTime(this.tx.transaction.ts);
      this.user.render();

      this.tweet.show_controls = 0;
      this.tweet.render();

      this.attachEvents();
    }
  }

  attachEvents() {
    let qs = ".notification-item-" + this.tx.transaction.sig;
    let obj = document.querySelector(qs);

    if (obj) {
      obj.onclick = (e) => {
        let sig = e.currentTarget.getAttribute("data-id");
        let tweet = this.mod.returnTweet(sig);

        if (tweet) {
          this.app.connection.emit("redsquare-home-tweet-render-request", tweet);
        } else {
          this.mod.loadTweetWithSig(sig, (txs) => {
            let tweet = this.mod.returnTweet(sig);
            this.app.connection.emit("redsquare-home-tweet-render-request", tweet);
          });
        }
      };
    }
  }

  isRendered() {
    //if (document.querySelector(`.notification-item-${this.tx.transaction.sig}`)) {
    //  return true;
    //}
    return false;
  }
}

module.exports = RedSquareNotification;
