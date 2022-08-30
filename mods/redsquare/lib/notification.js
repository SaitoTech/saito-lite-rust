const NotificationTemplate = require("./notification.template");
const LikeNotificationTemplate = require("./like-notification.template");
const ReplyNotificationTemplate = require("./reply-notification.template");
const RetweetNotificationTemplate = require("./retweet-notification.template");

const SaitoOverlay = require("./../../../lib/saito/new-ui/saito-overlay/saito-overlay");
const SaitoLoader = require("./../../../lib/saito/new-ui/saito-loader/saito-loader");

class RedSquareNotification {

    constructor(app, mod, tx=null) {
      this.tx = tx;
      
      this.saito_loader = new SaitoLoader(app, this);
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
      	  html = RetweetNotificationTemplate(app, mod, retweet_tx);
      	//
      	// or reply
      	//
      	} else {
    	   html = ReplyNotificationTemplate(app, mod, this.tx);
        }
      }
      app.browser.addElementToSelector(html, ".redsquare-list");

      this.attachEvents(app, mod);
    }

    attachEvents(app, mod) { 

      notificationSelf = this;

      document.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        console.log('clicked');
        console.log(e.target.classList);

        if (e.target && e.target.classList.contains('tweet')) {
          notificationSelf.saito_loader.render(app, mod, 'redsquare-home-header', false);

          let el = e.target;
          let tweet_sig_id = el.getAttribute("data-id");

          console.log('clicked on notification tweet');
          console.log(tweet_sig_id);

          document.querySelector(".redsquare-list").innerHTML = "";

          let new_title = "<i class='saito-back-button fas fa-arrow-left'></i> RED SQUARE";
          app.browser.replaceElementById(`<div class="saito-page-header-title" id="saito-page-header-title"><i class='saito-back-button fas fa-arrow-left'></i> RED SQUARE</div>`, "saito-page-header-title");
          document.querySelector(".saito-back-button").onclick = (e) => {
            app.browser.replaceElementById(`<div class="saito-page-header-title" id="saito-page-header-title">Red Square</div>`, "saito-page-header-title");
            mod.renderMainPage(app, mod);
            let redsquareUrl = window.location.origin + window.location.pathname;
            window.history.pushState({}, document.title, redsquareUrl);  
          }

          // // mod.fetchTweetsFromServer(app, mod, tweet_sig_id, function(app, mod) {mod.renderWithChildren(app, mod,)})
          let sql = `SELECT * FROM tweets WHERE sig = '${tweet_sig_id}'`;
          mod.fetchTweets(app, mod, sql, function (app, mod) { mod.renderWithChildren(app, mod, tweet_sig_id); });

          if (!window.location.href.includes('type=tweet')) {
            let tweetUrl = window.location.href + '?type=tweet&id=' + notificationSelf.tx.transaction.sig;      
            window.history.pushState({}, document.title, tweetUrl);  
          }

          notificationSelf.saito_loader.remove();
        }
      });

    }
}

module.exports = RedSquareNotification;


