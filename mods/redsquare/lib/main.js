const RedSquareMainTemplate = require('./main.template');
const TweetManager = require('./manager');
const SaitoOverlay = require('./../../../lib/saito/ui/saito-overlay/saito-overlay');

class RedSquareMain {
  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.name = "RedSquareMain";

    this.components = {};

    this.scroll_depth = 0;

    this.manager = new TweetManager(app, mod, ".saito-main");

    //
    // measuring activity
    //
    this.idleTime = 10;

    ////////////////////
    // EVENTS
    ////////////////////

    //
    // HOME-RENDER-REQUEST render the main thread from scratch
    //
    this.app.connection.on("redsquare-home-render-request", (scroll_to_top = false) => {

      console.log("redsquare-home-render-request");
      if (document.querySelector(".saito-back-button")) {
        document.querySelector(".saito-back-button").remove();
      }

      this.manager.render("tweets");

      let behavior = "auto";

      if (scroll_to_top) {
        this.scroll_depth = 0;
        this.idleTime = 10;
        behavior = "smooth";
      }

      this.scrollFeed(this.scroll_depth, behavior);
    });

    //
    // POSTCACHE RENDER REQUEST removes "loading new tweets" if exists, then
    // re-renders if canRefreshPage() returns true. if we cannot refresh the
    // page we show a button that can be clicked to do so.
    //
    this.app.connection.on("redsquare-home-postcache-render-request", (num_tweets = 0) => {
      console.log(`postcache, pulled ${num_tweets} new tweets`);

      //
      // check if we can refresh page (show tweets immediately) or show prompt / button
      //
      if (num_tweets > 0) {

        this.app.connection.emit("redsquare-remove-loading-message");
        //
        // Don't insert new tweets or button if looking at a tweet or profile
        //
        if (this.manager.mode == "tweets") {
          if (this.canRefreshPage()) {
            console.log("postcache-render-request: refresh the page automatically!");
            document.querySelector(".saito-main").innerHTML = "";
            this.app.connection.emit("redsquare-home-render-request", true);

          } else {
            console.log("postcache-render-request: CANNOT refresh the page!");

            if (!document.getElementById("saito-new-tweets")) {
              this.app.browser.prependElementToSelector(
                `<div class="saito-button-secondary saito-new-tweets" id="saito-new-tweets">load new tweets</div>`,
                ".saito-main"
              );
            }

            document.getElementById("saito-new-tweets").onclick = (e) => {

              document.querySelector(".saito-main").innerHTML = "";
              this.app.connection.emit("redsquare-home-render-request", true);
            };
          }
        }

        // So it will automatically insert new tweets if we navigate back to the main feed from looking at something else??

      }else{
        setTimeout(()=>{
          this.app.connection.emit("redsquare-remove-loading-message");
        }, 1000);
      }

    });

    //
    // when someone clicks on a tweet
    //
    this.app.connection.on("redsquare-tweet-render-request", (tweet) => {

      window.history.pushState({}, "", `/redsquare?tweet_id=${tweet.tx.signature}`);
 
      this.scrollFeed(0);
      this.manager.renderTweet(tweet);

      this.app.connection.emit("saito-header-replace-logo", (e) => {
        this.app.connection.emit("redsquare-home-render-request");
        window.history.pushState({}, document.title, "/" + this.mod.slug);

      });

    });

    this.app.connection.on("redsquare-notifications-render-request", () => {
      this.scrollFeed(0);
      this.mod.notifications_last_viewed_ts = new Date().getTime();
      this.mod.notifications_number_unviewed = 0;
      this.mod.saveOptions();
      this.mod.menu.incrementNotifications("notifications", 0);
      this.manager.render("notifications");

      this.app.connection.emit("saito-header-replace-logo", (e) => {
        this.app.connection.emit("redsquare-home-render-request");
        window.history.pushState({}, document.title, "/" + this.mod.slug);

      });


    });

    //
    // Replace RS with a user's profile (collection of their tweets)
    //
    this.app.connection.on("redsquare-profile-render-request", (publicKey = "") => {

      this.scrollFeed(0);

      if (publicKey == "") {
        publicKey = this.mod.publicKey;
      }

      this.manager.renderProfile(publicKey);

      this.app.connection.emit("saito-header-replace-logo", (e) => {
        this.app.connection.emit("redsquare-home-render-request");
        window.history.pushState({}, document.title, "/" + this.mod.slug);

      });

    });

    this.app.connection.on("redsquare-insert-loading-message", () => {
      if (!document.querySelector(".saito-cached-loader")){
        this.app.browser.prependElementToSelector(
          `<div class="saito-cached-loader">loading new tweets...</div>`,
          ".saito-main"
        );
      }
    });

    this.app.connection.on("redsquare-remove-loading-message", () => {
      if (document.querySelector(".saito-cached-loader")) {
        document.querySelector(".saito-cached-loader").remove();
      }
    });

    //
    // This isn't triggered anywhere, but may be useful in the future,
    // leave here as a stub for further development
    //
    this.app.connection.on("redsquare-component-render-request", (obj) => {
      let hash = obj.hash;
      let params = obj.params;

      if (hash) {
        if (this.components[hash]) {
          this.render_component = hash;
          document.querySelector(".saito-main").innerHTML = "";
          this.components[this.render_component].render();
        } else {
          this.app.modules.returnModulesRenderingInto(".saito-main").forEach((mod) => {
            if (mod.returnSlug() === hash) {
              document.querySelector(".saito-main").innerHTML = "";
              mod.renderInto(".saito-main");
              document
                .querySelector(".saito-container")
                .scroll({ top: 0, left: 0, behavior: "smooth" });
              if (mod.canRenderInto(".saito-sidebar.right")) {
                document.querySelector(".saito-sidebar.right").innerHTML = "";
                mod.renderInto(".saito-sidebar.right");
              }
            }
          });
        }
      }
    });

  }

  render() {
    if (document.querySelector(".saito-container")) {
      this.app.browser.replaceElementBySelector(RedSquareMainTemplate(), ".saito-container");
    } else {
      this.app.browser.addElementToDom(RedSquareMainTemplate());
    }
    this.manager.render("tweets");
    this.attachEvents();

    this.monitorUserInteraction();
  }

  attachEvents() {
    var scrollableElement = document.querySelector(".saito-container");

    scrollableElement.addEventListener("scroll", (e) => {

      if (this.manager.mode == "tweets") {
        this.scroll_depth = scrollableElement.scrollTop;
        this.idleTime = 0;
      }

    });
  }

  scrollFeed(newDepth = this.scroll_depth, behavior = "auto") {
    if (this.manager.mode == "tweets") {
      this.scroll_depth = document.querySelector(".saito-container").scrollTop;
    }

    document.querySelector(".saito-container").scroll({ top: newDepth, left: 0, behavior });
  }

  monitorUserInteraction() {
    let this_main = this;
    // Increment the idle time counter every second.
    var idleInterval = setInterval(function () {
      this_main.idleTime = this_main.idleTime + 1;
    }, 1000);

    document.body.addEventListener("scroll", function () {
      this_main.idleTime = 0;
    });
    document.body.addEventListener("keydown", function () {
      this_main.idleTime = 0;
    });
    document.body.addEventListener("click", function () {
      this_main.idleTime = 0;
    });
    document.body.addEventListener("touchstart", function () {
      this_main.idleTime = 0;
    });
  }

  //
  // we can refresh the page if we are at the top, and we have not
  // clicked on an overlay such as leaving a response or trying to
  // load content.
  //
  canRefreshPage() {

    //
    // no if we have scrolled down
    //
    if (this.scroll_depth) {
      return 0;
    }

    //return false if any overlay is open
    if (document.querySelector(".saito-overlay") != null) {
      return 0;
    }

    if (this.idleTime >= 10) {
      return 1;
    }

    //
    // no by default
    //
    return 0;
  }
}

module.exports = RedSquareMain;
