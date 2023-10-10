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
    // EVENTS
    //
    // redsquare - component - ui-component - [render-method] - (render-request)
    //
    // rendering the main thread
    this.app.connection.on("redsquare-home-render-request", () => {
      this.manager.publicKey = this.mod.publicKey;
      this.manager.mode = "tweets";
      this.manager.render();
    });
    // when someone clicks on a tweet
    this.app.connection.on("redsquare-home-tweet-render-request", (tweet) => {
      this.manager.publicKey = this.mod.publicKey;
      this.manager.mode = "tweets";
      this.manager.renderTweet(tweet);
    });
    this.app.connection.on("redsquare-notifications-render-request", () => {
      this.mod.notifications_last_viewed_ts = new Date().getTime();
      this.mod.notifications_number_unviewed = 0;
      this.mod.save();
      this.mod.menu.incrementNotifications("notifications", 0);
      this.manager.publicKey = this.mod.publicKey;
      this.manager.mode = "notifications";
      this.manager.render();
    });      
    this.app.connection.on("redsquare-profile-render-request", (publickey = "") => {

      //
      // reset peers
      //
      for (let i = 0; i < this.mod.peers.length; i++) {
	this.mod.peers[i].profile_latest_ts = 0;
	this.mod.peers[i].profile_earliest_ts = new Date().getTime();
      }

      if (publickey == "") {
	publickey = this.mod.publicKey;
      }

      this.manager.mode = "profile";
      this.manager.publicKey = publickey;
      this.manager.render();
    });
    this.app.connection.on("redsquare-home-loader-render-request", () => {
      this.manager.showLoader();
    });
    this.app.connection.on("redsquare-home-loader-hide-request", () => {
      this.manager.hideLoader();
    });
    this.app.connection.on("redsquare-home-thread-render-request", (tweets) => {
      alert("3");
    });
    this.app.connection.on("redsquare-home-tweet-append-render-request", (tweet) => {
      alert("5");
    });
    this.app.connection.on("redsquare-home-tweet-and-critical-child-append-render-request", (tweet) => {
      alert("7");
    });
    // this is triggered when you reply to a tweet -- it pushes tweet and your reply to top, or should
    this.app.connection.on("redsquare-home-tweet-and-critical-child-prepend-render-request", (tweet) => {
      this.app.connection.emit("redsquare-home-tweet-render-request", (tweet));
    });
    // not sure when rendered
    this.app.connection.on("redsquare-tweet-added-render-request", (tweet) => {
      alert("9");
    });
    this.app.connection.on("redsquare-component-render-request", (obj) => {

      alert("12");

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
              document.querySelector('.saito-container').scroll({ top: 0, left: 0, behavior: 'smooth' });
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
      this.app.browser.addElementToSelector(RedSquareMainTemplate(), this.container);
    }
    this.manager.render();
    this.attachEvents();
  }

  attachEvents() {

    var scrollableElement = document.querySelector(".saito-container");
    var sidebar = document.querySelector(".saito-sidebar.right");
    var scrollTop = 0;
    var stop = 0;

    scrollableElement.addEventListener("scroll", (e) => {
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
    });
  }

  scrollFeed(newDepth, behavior = "auto") {
    if (this.manager.mode == "tweets") {
      this.scroll_depth = document.querySelector(".saito-container").scrollTop;
    }

    document.querySelector(".saito-container").scroll({ top: newDepth, left: 0, behavior });
  }
}

module.exports = RedSquareMain;

