const RedSquareMainTemplate = require("./main.template");
const TweetManager = require("./manager");
const SaitoOverlay = require("./../../../lib/saito/ui/saito-overlay/saito-overlay");

class RedSquareMain {
  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.name = "RedSquareMain";

    this.components = {};

    this.scroll_depth = 0;

    this.manager = new TweetManager(app, mod, ".saito-main");

    //
    // measuring activity
    //
    this.hasScrolledDown = false;
    this.idleTime = 10;

    ////////////////////
    // EVENTS
    ////////////////////

    //    
    // HOME-RENDER-REQUEST render the main thread from scratch
    //
    this.app.connection.on("redsquare-home-render-request", () => {
      window.history.pushState({}, document.title, "/" + this.mod.slug);
      window.location.hash = "#home";
      document.querySelector(".saito-main").innerHTML = "";

      if (document.querySelector(".saito-back-button") != null) {
        document.querySelector(".saito-back-button").remove();
      }

      this.scroll_depth = 0;
      this.scrollFeed(0, "smooth");
      this.manager.render("tweets");

    });


    //
    // POSTCACHE RENDER REQUEST removes "loading new tweets" if exists, then 
    // re-renders if canRefreshPage() returns true. if we cannot refresh the 
    // page we show a button that can be clicked to do so.
    //
    this.app.connection.on("redsquare-home-postcache-render-request", (num_tweets = 0) => {

      console.log(`postcache, pulled ${num_tweets} new tweets`);

for (let z = 0; z < this.mod.tweets.length; z++) {
  let higher = this.mod.tweets[z].created_at;
  if (this.mod.tweets[z].updated_at > higher) { higher = this.mod.tweets[z].updated_at; }
  console.log(higher + " -- " + this.mod.tweets[z].text);
}

      //
      // remove "loading new tweets" notice...
      //
      setTimeout(function() {
        if (document.querySelector(".saito-cached-loader") != null &&
          typeof (document.querySelector(".saito-cached-loader")) != 'undefined') {
          document.querySelector(".saito-cached-loader").remove();          
        }
      }, 1000);

      //
      // check if we can refresh page (show tweets immediately) or show prompt / button
      //
      if (num_tweets > 0) {
        if (this.canRefreshPage()) {
console.log("postcache-render-request: can refresh the page!");
          try {
            document.querySelector(".saito-main").innerHTML = "";
          } catch (err) {}
          this.manager.render("tweets");
        } else {
console.log("postcache-render-request: CANNOT refresh the page!");
          /*
            We seem to be missing a hidden element that encourages us to scroll to insert the new tweets 
            at the top of the feed and scroll up there
          */
          if (document.querySelector(".saito-new-tweets")) {
            document.querySelector(".saito-new-tweets").style.display = "block";
          }
        }
      }
    });



    this.app.connection.on("redsquare-insert-loading-message", ()=> {
      this.app.browser.prependElementToSelector(
        `<div class="saito-cached-loader">loading new tweets...</div>`,
        ".saito-main"
      );
    })


    //
    // when someone clicks on a tweet
    //
    this.app.connection.on("redsquare-tweet-render-request", (tweet) => {
      this.scrollFeed(0);
      document.querySelector(".saito-main").innerHTML = "";
      this.manager.renderTweet(tweet);
      document.querySelectorAll(".optional-menu-item").forEach(item => {
        item.style.display = "none";
      });
      document.querySelector(".redsquare-menu-home").style.display = "flex";
    });

    this.app.connection.on("redsquare-notifications-render-request", () => {
      this.scrollFeed(0);
      document.querySelector(".saito-main").innerHTML = "";
      this.mod.notifications_last_viewed_ts = new Date().getTime();
      this.mod.notifications_number_unviewed = 0;
      this.mod.save();
      this.mod.menu.incrementNotifications("notifications", 0);
      this.manager.render("notifications");

      document.querySelectorAll(".optional-menu-item").forEach(item => {
        item.style.display = "none";
      });

      document.querySelector(".redsquare-menu-home").style.display = "flex";

    });


    //
    // Replace RS with a user's profile (collection of their tweets)
    //
    this.app.connection.on("redsquare-profile-render-request", (publickey = "") => {

      this.scrollFeed(0);

      // reset peers
      for (let i = 0; i < this.mod.peers.length; i++) {
        this.mod.peers[i].profile_latest_ts = 0;
        this.mod.peers[i].profile_earliest_ts = new Date().getTime();
      }

      if (publickey == "") {
        publickey = this.mod.publicKey;
      }

      this.manager.renderProfile(publickey);

      document.querySelectorAll(".optional-menu-item").forEach(item => {
        item.style.display = "none";
      });

      document.querySelector(".redsquare-menu-home").style.display = "flex";


    });

    this.app.connection.on("redsquare-home-loader-render-request", () => {
      this.manager.showLoader();
    });

    this.app.connection.on("redsquare-home-loader-hide-request", () => {
      this.manager.hideLoader();
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


    // event for rendering back btn when viewing post
    this.app.connection.on("saito-main-render-back-btn", (callback = null) => {
      this.app.browser.prependElementToSelector(
        `<div class="saito-main-back">
          <i class="fa-solid fa-arrow-left"></i> 
          <span>Back</span>
        </div>`,
        ".saito-main"
      );

      document.querySelector(".saito-main-back").onclick = async (e) => {
        e.currentTarget.remove();

        if (callback) {
          await callback(e);
        }
      };
    });

  }

  render() {
    if (document.querySelector(".saito-container")) {
      this.app.browser.replaceElementBySelector(RedSquareMainTemplate(), ".saito-container");
    } else {
      this.app.browser.addElementToSelector(RedSquareMainTemplate(), this.container);
    }
    this.manager.render();
    this.attachEvents();
    this.monitorUserInteraction();
  }

  attachEvents() {
    let this_main = this;
    var scrollableElement = document.querySelector(".saito-container");
    var sidebar = document.querySelector(".saito-sidebar.right");
    var scrollTop = 0;
    var stop = 0;

    scrollableElement.addEventListener("scroll", (e) => {

      this.hasScrolledDown = true;
      if (window.innerHeight - 150 < sidebar.clientHeight) {
        if (scrollTop < scrollableElement.scrollTop) {
          stop = window.innerHeight - sidebar.clientHeight + scrollableElement.scrollTop;
          if (scrollableElement.scrollTop + window.innerHeight > sidebar.clientHeight) {
            try {
              sidebar.style.top = stop + "px";
            } catch (err) {
              console.log("SIDEBAR ERROR 1");
            }
          }
        } else {
          if (stop > scrollableElement.scrollTop) {
            stop = scrollableElement.scrollTop;
            try {
              sidebar.style.top = stop + "px";
            } catch (err) {
              console.log("SIDEBAR ERROR 2");
            }
          }
        }
      } else {
        stop = scrollableElement.scrollTop;
        try {
          sidebar.style.top = stop + "px";
        } catch (err) {
          console.log("SIDEBAR ERROR 3");
        }
      }
      scrollTop = scrollableElement.scrollTop;
      this_main.idleTime = 0;
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

console.log("^");
console.log("^");
console.log("^");
console.log("^ canRefreshPage ");

    try {

      //
      // no if we have scrolled down
      //
      if (this.hasScrolledDown == true) { return 0; }

      //
      // yes if still at top
      //
      if (window.pageYOffset == 0 && document.body.scrollTop == 0) {
	return 1;
      }
    } catch (err) {}

    //
    // no by default
    //
    return 0;

    //if (this.idleTime >= 10) {
    //  return true;
    //}

    return false;
  }
}

module.exports = RedSquareMain;
