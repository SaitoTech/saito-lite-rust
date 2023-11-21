const TweetManagerTemplate = require("./manager.template");
const Tweet = require("./tweet");
const Notification = require("./notification");
const SaitoProfile = require("./../../../lib/saito/ui/saito-profile/saito-profile");
const SaitoLoader = require("./../../../lib/saito/ui/saito-loader/saito-loader");

class TweetManager {
  constructor(app, mod, container = ".saito-main") {
    this.app = app;
    this.mod = mod;
    this.container = container;

    this.mode = "loading";
    this.profile_posts = [];
    this.profile_replies = [];

    this.profile = new SaitoProfile(app, mod, ".saito-main");

    //This is an in-place loader... not super useful when content is overflowing off the bottom of the screen
    this.loader = new SaitoLoader(app, mod, "#redsquare-intersection");

    //////////////////////////////
    // load more on scroll-down //
    //////////////////////////////
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.showLoader();

            //
            // single tweet mode should hide loader immediately
            //
            if (this.mode === "tweet") {
              this.hideLoader();
              return;
            }

            //
            // load more tweets -- from local and remote sources
            //
            if (this.mode === "tweets") {
              mod.loadTweets("earlier", (tx_count) => {
                console.log(`${tx_count} new tweets`);

                // hide "loading new tweet.."
                this.app.connection.emit("redsquare-home-cached-loader-hide-request");
                
                this.hideLoader();

                if (this.mode !== "tweets") {
                  console.log("Not on main feed anymore");
                  return;
                }

                for (let i = 0; i < this.mod.tweets.length; i++) {
                  let tweet = this.mod.tweets[i];
                  if (!tweet.isRendered()) {
                    tweet.renderWithCriticalChild();
                  }
                }

                if (tx_count == 0) {
                  if (!document.querySelector(".saito-end-of-redsquare")) {
                    this.app.browser.addElementToSelector(
                      `<div class="saito-end-of-redsquare">no more tweets</div>`,
                      ".tweet-manager"
                    );
                  }
                  if (document.querySelector("#redsquare-intersection")) {
                    this.intersectionObserver.unobserve(
                      document.querySelector("#redsquare-intersection")
                    );
                  }
                }else{
                  //
                  // It is possible that the local archive pull comes back with nothing
                  // So we need logic to keep the intersection observer going if the remote
                  // pull comes back a few seconds later with older tweets
                  //
                  if (document.querySelector(".saito-end-of-redsquare")) {
                    document.querySelector(".saito-end-of-redsquare").remove();
                  }
                  if (document.querySelector("#redsquare-intersection")) {
                    this.intersectionObserver.observe(
                      document.querySelector("#redsquare-intersection")
                    );
                  }

                }
              });
            }

            //
            // load more notifications
            //
            if (this.mode === "notifications") {
              mod.loadNotifications((new_txs) => {
                if (this.mode !== "notifications") {
                  return;
                }
                for (let i = 0; i < new_txs.length; i++) {
                  let notification = new Notification(this.app, this.mod, new_txs[i]);
                  notification.render(".tweet-manager");
                }
                if (this.mod.notifications.length == 0) {
                  let notification = new Notification(this.app, this.mod, null);
                  notification.render(".tweet-manager");

                  if (document.querySelector("#redsquare-intersection")) {
                    this.intersectionObserver.unobserve(document.querySelector("#redsquare-intersection"));
                  }
                }
                this.hideLoader();
              });
            }

            /////////////////////////////////////////////////
            //
            // So right now, we are fetching earlier stuff from the intersection observer
            // We will fetch the 100 most recent tweets/likes, so we'll see if people start complaining
            // about not having enough history available
            //
            //////////////////////////////////////////////////

            //
            // load more profile tweets
            /*
            if (this.mode === "profile") {
              this.profile.loadProfile((txs) => {
                if (this.mode !== "profile") {
                  return;
                }

                this.filterAndRenderProfile(txs);

                this.hideLoader();
                if (txs.length == 0) {
                  if (!document.querySelector(".saito-end-of-redsquare")) {
                    this.app.browser.addElementToSelector(
                      `<div class="saito-end-of-redsquare">no more tweets</div>`,
                      ".tweet-manager"
                    );
                  }
                  if (document.querySelector("#redsquare-intersection")) {
                    this.intersectionObserver.unobserve(
                      document.querySelector("#redsquare-intersection")
                    );
                  }
                } 
              });
            }*/
          }
        });
      },
      {
        root: null,
        rootMargin: "30px",
        threshold: 1,
      }
    );
  }

  render(new_mode = "") {
    //
    // remove notification at end
    //
    if (document.querySelector(".saito-end-of-redsquare")) {
      document.querySelector(".saito-end-of-redsquare").remove();
    }

    //
    // if someone asks the manager to render with a mode that is not currently
    // set, we want to update our mode and proceed with it.
    //
    if (new_mode && new_mode != this.mode) {
      this.mode = new_mode;
    }
    if (!this.mode) {
      this.mode = "tweets";
    }

    let myqs = `.tweet-manager`;

    //
    // Stop observering while we rebuild the page
    //
    this.intersectionObserver.disconnect();
    this.profile.remove();

    let holder = document.getElementById("tweet-thread-holder");
    let managerElem = document.querySelector(myqs);

    if (!document.querySelector(myqs)) {
      this.app.browser.addElementToSelector(TweetManagerTemplate(), this.container);
    } else {
      if (this.mode == "tweets") {
        let kids = managerElem.children;
        holder.replaceChildren(...kids);
      } else {
        while (managerElem.hasChildNodes()) {
          managerElem.firstChild.remove();
        }
      }
    }

    this.showLoader();

    ////////////
    // tweets //
    ////////////
    if (this.mode == "tweets") {
      
      //if (holder) {
      //  let kids = holder.children;
      //  managerElem.replaceChildren(...kids);
      //}

      for (let i = 0; i < this.mod.tweets.length; i++) {
        let tweet = this.mod.tweets[i];
        tweet.renderWithCriticalChild();
      }

      setTimeout(() => {
        this.hideLoader();
      }, 50);

      //Fire up the intersection observer
      this.attachEvents();
      return;
    }

    ///////////////////
    // notifications //
    ///////////////////
    if (this.mode == "notifications") {
      for (let i = 0; i < this.mod.notifications.length; i++) {
        let notification = new Notification(this.app, this.mod, this.mod.notifications[i].tx);
        notification.render(".tweet-manager");
      }

      this.mod.loadNotifications((new_txs) => {
        if (this.mode !== "notifications") {
          return;
        }

        for (let i = 0; i < new_txs.length; i++) {
          let notification = new Notification(this.app, this.mod, new_txs[i]);
          notification.render(".tweet-manager");
        }
        if (this.mod.notifications.length == 0) {
          let notification = new Notification(this.app, this.mod, null);
          notification.render(".tweet-manager");

          if (document.querySelector("#redsquare-intersection")) {
            this.intersectionObserver.unobserve(
              document.querySelector("#redsquare-intersection")
            );
          }
        }
        this.hideLoader();

        //Fire up the intersection observer after the callback completes...
        this.attachEvents();

      });

    }

  }

  renderProfile(publicKey) {
    this.mode = "profile";

    if (!document.querySelector(".tweet-manager")) {
      this.app.browser.addElementToSelector(TweetManagerTemplate(), ".saito-main");
    }

    //Reset Profile
    if (publicKey != this.profile.publicKey) {
      this.profile.reset(publicKey);
    }

    this.profile.render();
    this.showLoader();

    this.loadProfile((txs) => {
      this.filterAndRenderProfile(txs);
      if (this.profile.posts.length > 0) {
        this.app.connection.emit("update-profile-stats", "posts", this.profile.posts.length);
      }
      if (this.profile.replies.length > 0) {
        this.app.connection.emit("update-profile-stats", "replies", this.profile.replies.length);
      }
      if (this.profile.retweets.length > 0){
       this.app.connection.emit("update-profile-stats", "retweets", this.profile.retweets.length); 
      }

      this.hideLoader();
      this.profile.render();
    });

    this.attachEvents();
  }

  loadProfile(mycallback) {
    if (this.mod.publicKey == this.profile.publicKey) {
      // Find likes...
      // I already have a list of tweets I liked available
      this.loadLikes(this.mod.liked_tweets, "localhost");
    }

    this.app.storage.loadTransactions(
      {
        field1: "RedSquare",
        field2: this.profile.publicKey,
        limit: 100,
      },
      (txs) => {
        if (mycallback) {
          mycallback(txs);
        }
      },
      "localhost"
    );

    this.app.storage.loadTransactions(
      {
        field1: "RedSquare",
        field2: this.profile.publicKey,
        limit: 100,
      },
      (txs) => {
        if (mycallback) {
          mycallback(txs);
        }
      },
      null //Query network
    );

    this.app.storage.loadTransactions(
      { field1: "RedSquareLike", field2: this.profile.publicKey },
      (txs) => {
        let liked_tweets = [];
        for (tx of txs) {
          let txmsg = tx.returnMessage();

          let sig = txmsg?.data?.signature;
          if (sig && !liked_tweets.includes(sig)) {
            liked_tweets.push(sig);
          }
        }

        this.loadLikes(liked_tweets, null);
      },
      null
    );
  }

  /*
    Liked tweets are more complicated than tweets I have sent because it is a 2-step look up
    We can find the 1, 2...n txs where I liked the tweet, which contains the signature of the original 
    tweet transaction. Fortunately, if I am looking at my own profile, I should have everything stored locally
  */
  loadLikes(list_of_liked_tweet_sigs, peer) {
    let likes_to_load = list_of_liked_tweet_sigs.length;

    for (let sig of list_of_liked_tweet_sigs) {
      //
      // We may already have the liked tweet in memory
      //
      let old_tweet = this.mod.returnTweet(sig);
      if (old_tweet) {
        likes_to_load--;
        this.profile.insertTweet(old_tweet, this.profile.likes);
        if (likes_to_load == 0) {
          this.app.connection.emit(
            "update-profile-stats",
            "likes",
            list_of_liked_tweet_sigs.length
          );
        }
      } else {
        //
        // Otherwise, we gotta hit up the archive
        //
        this.app.storage.loadTransactions(
          { field1: "RedSquare", sig },
          (txs) => {
            likes_to_load--;
            for (let z = 0; z < txs.length; z++) {
              let tweet = new Tweet(this.app, this.mod, txs[z]);
              this.profile.insertTweet(tweet, this.profile.likes);
            }
            if (likes_to_load == 0) {
              this.app.connection.emit(
                "update-profile-stats",
                "likes",
                list_of_liked_tweet_sigs.length
              );
            }
          },
          peer
        );
      }
    }
  }

  filterAndRenderProfile(txs) {
    for (let z = 0; z < txs.length; z++) {
      let tweet = new Tweet(this.app, this.mod, txs[z]);
      if (tweet?.noerrors) {
        if (tweet.isRetweet()){
         this.profile.insertTweet(tweet, this.profile.retweets);
         return; 
        }
        if (tweet.isPost()) {
          this.profile.insertTweet(tweet, this.profile.posts);
        }
        if (tweet.isReply()) {
          this.profile.insertTweet(tweet, this.profile.replies);
        }
      }
    }
  }

  //
  // this renders a tweet, loads all of its available children and adds them to the page
  // as they appear...
  //
  renderTweet(tweet) {
    this.render("tweet");

    // show the basic tweet first
    if (!tweet.parent_id) {
      tweet.renderWithChildren();
    }

    // query the whole thread
    let thread_id = tweet.thread_id || tweet.parent_id || tweet.tx.signature;

    this.mod.loadTweetThread(thread_id, () => {
      let root_tweet = this.mod.returnTweet(thread_id);
      root_tweet.renderWithChildrenWithTweet(tweet);
      this.hideLoader();
    });

    //
    //Mobile/Desktop back button (when left navigation bar hidden!)
    //

    this.app.connection.emit("saito-header-replace-logo", (e) => {
      this.app.connection.emit("redsquare-home-render-request", false);
    });
  }

  attachEvents() {
    if (this.mode !== "tweets") {
      this.app.connection.emit("saito-header-replace-logo", (e) => {
        this.app.connection.emit("redsquare-home-render-request", false);
      });
    }
    //
    // dynamic content loading
    //

    let ob = document.getElementById("redsquare-intersection");
    if (ob) {
      //Only set up intersection observer if we have more content than fits on the screen
      //(so we don't double tap the servers)
      if (ob.getBoundingClientRect().top > window.innerHeight) {
        this.intersectionObserver.observe(ob);
      }
    }
  }

  showLoader() {
    this.loader.show();
  }

  hideLoader() {
    this.loader.hide();
  }
}

module.exports = TweetManager;
