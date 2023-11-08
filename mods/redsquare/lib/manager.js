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
    this.tab = "posts"; // replies
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
            // load more tweets
            //
            if (this.mode === "tweets") {
              mod.loadTweets("earlier", (txs) => {
                this.hideLoader();

                if (this.mode !== "tweets") {
                  return;
                }

                for (let i = 0; i < this.mod.tweets.length; i++) {
                  let tweet = this.mod.tweets[i];
                  if (!tweet.isRendered()) {
                    tweet.renderWithCriticalChild();
                  }
                }

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
            }

            //
            // load more notifications
            //
            if (this.mode === "notifications") {
              mod.loadNotifications(null, (txs) => {
                if (this.mode !== "notifications") {
                  return;
                }
                for (let i = 0; i < this.mod.notifications.length; i++) {
                  let notification = new Notification(
                    this.app,
                    this.mod,
                    this.mod.notifications[i].tx
                  );
                  //if (!notification.isRendered()) {
                  notification.render(".tweet-manager");
                  //}
                }
                if (this.mod.notifications.length == 0) {
                  let notification = new Notification(this.app, this.mod, null);
                  notification.render(".tweet-manager");
                }

                if (document.querySelector("#redsquare-intersection")) {
                  this.intersectionObserver.unobserve(
                    document.querySelector("#redsquare-intersection")
                  );
                }
                this.hideLoader();
              });
            }

            //
            // load more profile tweets
            //
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
            }
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

  listContainsTweet(list, tweet) {
    for (let z = 0; z < list.length; z++) {
      if (tweet.tx.signature == list[z].tx.signature) {
        return true;
      }
    }
    return false;
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
      if (holder) {
        let kids = holder.children;
        managerElem.replaceChildren(...kids);
      }

      for (let i = 0; i < this.mod.tweets.length; i++) {
        let tweet = this.mod.tweets[i];
        tweet.renderWithCriticalChild();
      }

      setTimeout(() => {
        this.hideLoader();
      }, 50);
    }

    ///////////////////
    // notifications //
    ///////////////////
    if (this.mode == "notifications") {
      if (this.mod.notifications.length == 0) {
        let notification = new Notification(this.app, this.mod, null);
        notification.render(".tweet-manager");
      } else {
        for (let i = 0; i < this.mod.notifications.length; i++) {
          let notification = new Notification(this.app, this.mod, this.mod.notifications[i].tx);
          notification.render(".tweet-manager");
        }
      }

      setTimeout(() => {
        this.hideLoader();
      }, 50);
    }

    //Fire up the intersection observer
    this.attachEvents();
  }


  renderProfile(publicKey) {
    this.mode = "profile";

    if (!document.querySelector(".tweet-manager")) {
      this.app.browser.addElementToSelector(TweetManagerTemplate(), ".saito-main");
    }

    //Reset Profile
    if (publicKey != this.profile.publicKey) {
      this.profile.posts = [];
      this.profile.replies = [];
      this.profile.publicKey = publicKey;
    }

    this.profile.profile_earliest_ts = new Date().getTime();

    this.profile.render();

    this.profile.loadProfile((txs) => {
      console.log("Finished loading profile");
      console.log(txs);
      this.filterAndRenderProfile(txs);

      setTimeout(() => {
        this.hideLoader();
      }, 50);
    });

    this.attachEvents();
  }

  filterAndRenderProfile(txs) {
    for (let z = 0; z < txs.length; z++) {
      let tweet = new Tweet(this.app, this.mod, txs[z]);
      if (tweet?.noerrors) {
        if (tweet.isPost()) {
          if (!this.listContainsTweet(this.profile.posts, tweet)) {
            this.profile.posts.push(tweet);
          }
          if (this.tab == "posts") {
            tweet.render();
          }
        }
        if (tweet.isReply()) {
          if (!this.listContainsTweet(this.profile.replies, tweet)) {
            this.profile.replies.push(tweet);
          }
          if (this.tab == "replies") {
            tweet.render();
          }
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
