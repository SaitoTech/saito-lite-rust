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
              this.mod.loadProfile(null, this.profile.publicKey, (txs) => {
                if (this.mode !== "profile") {
                  return;
                }

                for (let z = 0; z < txs.length; z++) {
                  let tweet = new Tweet(this.app, this.mod, txs[z]);
                  if (tweet?.noerrors) {
                    if (tweet.isPost()) {
                      if (!this.profilePostsAlreadyHasTweet(tweet)) {
                        this.profile_posts.push(tweet);
                      }
                      if (this.tab == "posts") {
                        tweet.render();
                      }
                    }
                    if (tweet.isReply()) {
                      if (!this.profileRepliesAlreadyHasTweet(tweet)) {
                        this.profile_replies.push(tweet);
                      }
                      if (this.tab == "replies") {
                        tweet.render();
                      }
                    }
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
                } else {
                  if (this.profile.publicKey === this.mod.publicKey) {
                    //this.mod.saveLocalProfile();
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

  profileRepliesAlreadyHasTweet(tweet) {
    for (let z = 0; z < this.profile_replies.length; z++) {
      if (tweet.tx.signature == this.profile_replies[z].tx.signature) {
        return true;
      }
    }
    return false;
  }

  profilePostsAlreadyHasTweet(tweet) {
    for (let z = 0; z < this.profile_posts.length; z++) {
      if (tweet.tx.signature == this.profile_posts[z].tx.signature) {
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

  rerenderProfile() {
    if (document.querySelector(".tweet-manager")) {
      document.querySelector(".tweet-manager").innerHTML = "";
    }
    this.renderProfileMenu();
    if (this.tab == "posts") {
      for (let z = 0; z < this.profile_posts.length; z++) {
        this.profile_posts[z].render();
      }
    }
    if (this.tab == "replies") {
      for (let z = 0; z < this.profile_replies.length; z++) {
        this.profile_replies[z].render();
      }
    }
    this.attachEvents();
  }

  renderProfileMenu() {
    if (!document.querySelector(".redsquare-profile-menu-posts")) {
      this.app.browser.addElementToSelector(
        '<div class="redsquare-profile-menu-posts active">Posts</div>',
        ".saito-profile-menu"
      );
    }
    if (!document.querySelector(".redsquare-profile-menu-replies")) {
      this.app.browser.addElementToSelector(
        '<div class="redsquare-profile-menu-replies">Replies</div>',
        ".saito-profile-menu"
      );
    }
    if (this.tab == "posts") {
      let el1 = document.querySelector(".redsquare-profile-menu-posts");
      let el2 = document.querySelector(".redsquare-profile-menu-replies");
      el2.classList.remove("active");
      el1.classList.add("active");
    }
    if (this.tab == "replies") {
      let el1 = document.querySelector(".redsquare-profile-menu-posts");
      let el2 = document.querySelector(".redsquare-profile-menu-replies");
      el1.classList.remove("active");
      el2.classList.add("active");
    }
  }

  renderProfile(publicKey) {
    this.mode = "profile";

    if (!document.querySelector(".tweet-manager")) {
      this.app.browser.addElementToSelector(TweetManagerTemplate(), ".saito-main");
    }

    if (
      publicKey != this.mod.publicKey ||
      (publicKey == this.mod.publicKey && this.profile.publicKey != publicKey)
    ) {
      this.profile_posts = [];
      this.profile_replies = [];
    }

    this.profile.publicKey = publicKey;
    this.profile.render();

    this.renderProfileMenu();

    this.mod.loadProfile(null, publicKey, (txs) => {
      for (let z = 0; z < txs.length; z++) {
        let tweet = new Tweet(this.app, this.mod, txs[z]);
        if (tweet.isPost()) {
          if (!this.profilePostsAlreadyHasTweet(tweet)) {
            this.profile_posts.push(tweet);
          }
          if (this.tab == "posts") {
            tweet.render();
          }
        }
        if (tweet.isReply()) {
          if (!this.profileRepliesAlreadyHasTweet(tweet)) {
            this.profile_replies.push(tweet);
          }
          if (this.tab == "replies") {
            tweet.render();
          }
        }
      }

      if (txs.length > 0) {
        if (this.profile.publicKey === this.mod.publicKey) {
          //this.mod.saveLocalProfile();
        }
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

    if (this.mode === "profile") {
      document.querySelectorAll(".redsquare-profile-menu-posts").forEach((el) => {
        el.onclick = (e) => {
          this.switchToPosts();
        };
      });
      document.querySelectorAll(".redsquare-profile-menu-replies").forEach((el) => {
        el.onclick = (e) => {
          this.switchToReplies();
        };
      });
    }
  }

  switchToPosts() {
    if (this.tab == "posts") {
      return;
    }
    let el = document.querySelector(`.redsquare-profile-menu-replies`);
    if (el) {
      el.classList.remove("active");
    }
    this.tab = "posts";
    el = document.querySelector(`.redsquare-profile-menu-posts`);
    if (el) {
      el.classList.add("active");
    }
    this.rerenderProfile();
  }

  switchToReplies() {
    if (this.tab == "replies") {
      return;
    }
    let el = document.querySelector(`.redsquare-profile-menu-posts`);
    if (el) {
      el.classList.remove("active");
    }
    this.tab = "replies";
    el = document.querySelector(`.redsquare-profile-menu-replies`);
    if (el) {
      el.classList.add("active");
    }
    this.rerenderProfile();
  }

  showLoader() {
    this.loader.show();
  }

  hideLoader() {
    this.loader.hide();
  }
}

module.exports = TweetManager;
