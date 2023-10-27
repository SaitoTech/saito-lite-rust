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
            console.log("Intersection: " + this.mode);

            this.showLoader();

            console.log("WHAT MODE: " + this.mode);
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
              mod.loadTweets(null, (txs) => {
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
                  console.log("at least one notification to render");
                  //if (!notification.isRendered()) {
                  notification.render(".tweet-manager");
                  //}
                }
                if (this.mod.notifications.length == 0) {
                  let notification = new Notification(this.app, this.mod, null);
                  console.log("no notifications to render");
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
              console.log("loading profile!");

              this.mod.loadProfile(null, this.profile.publicKey, (txs) => {
                if (this.mode !== "profile") {
                  console.log("returning as our mode is not profile!");
                  return;
                }

                console.log("txs length: " + txs.length);

                for (let z = 0; z < txs.length; z++) {
                  let tweet = new Tweet(this.app, this.mod, txs[z]);
                  console.log("does tweet have errors: " + tweet?.noerrors);
                  if (tweet?.noerrors) {
                    console.log("rendering!");
                    tweet.render();
                  }
                }
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
        console.log("Cache tweets");
        let kids = managerElem.children;
        console.log(kids.length);
        holder.replaceChildren(...kids);
      } else {
        console.log("clear tweet manager");
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
        console.log("Restore tweets");
        let kids = holder.children;
        console.log(kids.length);
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

    this.profile.publicKey = publicKey;
    this.profile.render();

    this.mod.loadProfile(null, publicKey, (txs) => {
      for (let z = 0; z < txs.length; z++) {
        let tweet = new Tweet(this.app, this.mod, txs[z]);
        tweet.render();
      }
      setTimeout(() => {
        this.hideLoader();
      }, 50);
    });

    this.attachEvents();
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

    this.mod.loadTweetThread(null, thread_id, () => {
      let root_tweet = this.mod.returnTweet(thread_id);
      root_tweet.renderWithChildrenWithTweet(tweet);
      this.hideLoader();
    });

    //
    //Mobile/Desktop back button (when left navigation bar hidden!)
    //

    this.app.connection.emit("saito-header-replace-logo", (e) => {
      console.log("Click on back button");
      this.app.connection.emit("redsquare-home-render-request", false);
    });
  }

  attachEvents() {
    if (this.mode !== "tweets") {
      this.app.connection.emit("saito-header-replace-logo", (e) => {
        console.log("Click on back button");
        this.app.connection.emit("redsquare-home-render-request", false);
      });
    }
    //
    // dynamic content loading
    //
    let ob = document.getElementById("redsquare-intersection");
    if (ob) {
      this.intersectionObserver.observe(ob);
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
