const TweetManagerTemplate = require("./manager.template");
const Tweet = require("./tweet");
const Notification = require("./notification");
const SaitoProfile = require("./../../../lib/saito/ui/saito-profile/saito-profile");
const SaitoLoader = require("./../../../lib/saito/ui/saito-loader/saito-loader");


class TweetManager {

  constructor(app, mod, container = "", tx = null) {

    this.app = app;
    this.mod = mod;
    this.container = container;

    this.mode = "tweets";
    this.thread_id = "";
    this.parent_id = "";
    this.tweet_id = "";
    this.publickey = "";

    this.profile = new SaitoProfile(app, mod, ".saito-main");

    //////////////////////////////
    // load more on scroll-down //
    //////////////////////////////
    this.loader = new SaitoLoader(app, mod, "#redsquare-intersection");
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {

          this.loader.render();

	  //
	  // load more tweets
	  //
	  if (this.mode == "tweets") {
            mod.loadTweets(null, (txs) => {
	      this.loader.hide();
      	      for (let i = 0; i < this.mod.tweets.length; i++) {
      	        let tweet = this.mod.tweets[i];
        	if (!tweet.isRendered()) {
		  tweet.renderWithCriticalChild();
		}
      	      }
	    });
	  }

	  //
	  // load more notifications
	  //
	  if (this.mode == "notifications") {
            mod.loadNotifications(null, (txs) => {
              for (let i = 0; i < this.mod.notifications.length; i++) {
                let notification = new Notification(this.app, this.mod, this.mod.notifications[i].tx);
        	if (!notification.isRendered()) {
                  notification.render(".tweet-manager");
                }
              }
	      this.loader.hide();
	    });
	  }

	  //
	  // load more profile tweets
	  //
	  if (this.mode == "profile") {
            this.mod.loadProfileTweets(null , this.publickey , (txs) => {
              for (let z = 0; z < txs.length; z++) {
                let tweet = new Tweet(this.app, this.mod, ".tweet-manager", txs[z]);
                tweet.render();
              }
              this.mod.updatePeerEarliestProfileTimestamp(null, this.mod.returnEarliestTimestampFromTransactionArray(txs));
	      this.loader.hide();
            });
	  }

        }
      });
    }, {
      root: null,
      rootMargin: '0px',
      threshold: 1
    });


  }




  render() {

    let myqs = `.tweet-manager`;

    if (!document.querySelector(myqs)) {
      this.app.browser.addElementToSelector(TweetManagerTemplate(), this.container);
    } else {
      if (document.querySelector("#redsquare-intersection")) { document.querySelector("#redsquare-intersection").remove(); }
      this.app.browser.replaceElementBySelector(TweetManagerTemplate(), myqs);
    }


    ////////////
    // tweets //
    ////////////
    if (this.mode == "tweets") {

      this.profile.remove();

      for (let i = 0; i < this.mod.tweets.length; i++) {
        let tweet = this.mod.tweets[i];
        tweet.renderWithCriticalChild();
      }

    }

    ///////////////////
    // notifications //
    ///////////////////
    if (this.mode == "notifications") {

      this.profile.remove();

      for (let i = 0; i < this.mod.notifications.length; i++) {
        let notification = new Notification(this.app, this.mod, this.mod.notifications[i].tx);
        notification.render(".tweet-manager");
      }

      this.loader.hide();

    }

    /////////////
    // profile //
    /////////////
    if (this.mode == "profile") {

      this.profile.publickey = this.publickey;

      window.history.pushState(null, "", `/redsquare/?user_id=${this.publickey}`);

      this.profile.render();

      //
      // all peers reset to 0 tweets fetched
      //
      this.mod.updatePeerEarliestProfileTimestamp(null, new Date().getTime());
      this.mod.loadProfileTweets(null , this.publickey , (txs) => {
        for (let z = 0; z < txs.length; z++) {
          let tweet = new Tweet(this.app, this.mod, ".tweet-manager", txs[z]);
          tweet.render();
        }
        this.mod.updatePeerEarliestProfileTimestamp(null, this.mod.returnEarliestTimestampFromTransactionArray(txs));
      });
    }
 
    this.attachEvents();

  }


  //
  // this renders a tweet, loads all of its available children and adds them to the page
  // as they appear...
  //
  renderTweet(tweet) {

    if (document.querySelector('#redsquare-intersection')) {
      this.intersectionObserver.unobserve(document.querySelector('#redsquare-intersection'));
    }

    let myqs = `.tweet-manager`;

    if (!document.querySelector(myqs)) {
      this.app.browser.addElementToSelector(TweetManagerTemplate(), this.container);
    } else {
      document.querySelector("#redsquare-intersection").remove();
      this.app.browser.replaceElementBySelector(TweetManagerTemplate(), myqs);
    }

    this.mode = "tweets";
    this.profile.remove();

    tweet.render();
    this.loader.render();
    this.mod.loadTweetChildren(null, tweet.tx.transaction.sig, () => {
      tweet.renderWithChildren();
      this.loader.hide();
    });

  }




  attachEvents() {

    //
    // dynamic content loading
    //
    this.intersectionObserver.observe(document.querySelector('#redsquare-intersection'));

  }


  showLoader() {

    if (!document.querySelector("#redsquare-intersection")) {
      if (document.querySelector(".tweet-manager")) {
	document.querySelector(".tweet-manager").remove();
      }
      this.app.browser.addElementToSelector(TweetManagerTemplate(), this.container);
    }
    this.loader.show(); 

  }
  hideLoader() { this.loader.hide(); }

}

module.exports = TweetManager;

