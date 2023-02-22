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
    this.type = 1; 	// 1 reply
			// 2 retweet
			// 3 like
  }

  render(selector = "") {

    let app = this.app;
    let mod = this.mod;

    if (this.tx == null) { 
      document.querySelector(selector).innerHTML = `<div class="notifications-empty"><span> <i class="far fa-folder-open" aria-hidden="true"></i> </span> <p>No new notifications </p> </div>`
    } else {

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
	  this.type = 3; // like
        }
      }
  
      else if (txmsg.request == "create tweet") {
        //
        // retweet
        //
        if (txmsg.data.retweet_tx) {
          let retweet_tx = new saito.default.transaction(JSON.parse(txmsg.data.retweet_tx));
          let retweet_txmsg = retweet_tx.returnMessage();
          html = RetweetNotificationTemplate(app, mod, this.tx, retweet_tx, retweet_txmsg);
	  this.type = 2; // retweet
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
 
      //
      //
      //
      let nqs = ".notification-item-"+this.tx.transaction.sig;
      if (document.querySelector(nqs)) {
        app.browser.replaceElementBySelector(html, ".redsquare-notifications");
      } else {
        app.browser.addElementToSelector(html, ".redsquare-notifications");
      }
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
	let tweet = this.mod.returnTweet(sig);
	if (tweet) {
          app.connection.emit('redsquare-home-tweet-render-request', (tweet));
          app.connection.emit('redsquare-home-loader-render-request');
          mod.loadChildrenOfTweet(sig, (tweets) => {
            app.connection.emit('redsquare-home-loader-hide-request');
	    for (let i = 0; i < tweets.length; i++) {
              app.connection.emit('redsquare-home-tweet-append-render-request', (tweets[i]));
	    }
          });
	} else {
          mod.loadTweetWithSig(sig, (tweet) => {
            app.connection.emit('redsquare-home-tweet-render-request', (tweet));
            mod.loadChildrenOfTweet(tweet.tx.transaction.sig, (tweets) => {
	      for (let i = 0; i < tweets.length; i++) {
                app.connection.emit('redsquare-home-tweet-append-render-request', (tweets[i]));
              }
            });
          });
	}
      }
    }
  }
}

module.exports = RedSquareNotification;

