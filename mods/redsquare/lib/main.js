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

    this.overlay = new SaitoOverlay(app, mod);
    this.manager = new TweetManager(app, mod, ".saito-main");

    //
    // EVENTS
    //
    // redsquare - component - ui-component - [render-method] - (render-request)
    //
    this.app.connection.on("redsquare-navigation", (to_home) => {
      //this.overlay.show('<div class="saito-loader"></div>');
    });

    this.app.connection.on("redsquare-navigation-complete", () => {
      //this.overlay.remove();
    });

    // rendering the main thread
    this.app.connection.on("redsquare-home-render-request", async (user_click = true) => {
      //Update menu that we are on the main feed
      this.app.connection.emit("redsquare-navigation", true);
      if (user_click) {
        window.history.pushState(null, "", "/redsquare/#home");
      }

      if (this.manager.mode == "tweets" && user_click) {
        this.scroll_depth = 0;
        this.scrollFeed(0, "smooth");
        this.mod.loadNewTweets(null, (txs) => {
          if (txs.length > 0) {
            this.app.connection.emit("redsquare-new-tweets-notification-request");
          } else {
            siteMessage("No new tweets", 1000);
          }
        });
        return;
      }

      this.manager.render("tweets");
      this.scrollFeed(this.scroll_depth);
    });

    // when someone clicks on a tweet
    this.app.connection.on("redsquare-tweet-render-request", (tweet) => {
      this.scrollFeed(0);
      this.app.connection.emit("redsquare-navigation");
      window.history.pushState(
        null,
        "",
        `/redsquare/?tweet_id=${tweet?.tx?.signature}`
      );

      this.manager.renderTweet(tweet);
    });

    this.app.connection.on("redsquare-new-tweets-notification-request", async () => {
      document.getElementById("show-new-tweets").style.display = "flex";
      document.getElementById("show-new-tweets").onclick = (e) => {
        e.currentTarget.onclick = null;
        e.currentTarget.style.display = "none";
        console.log("Show new tweets");
        this.scoll_depth = 0;

        this.app.connection.emit("redsquare-home-render-request", false);
        setTimeout(() => {
          this.mod.saveLocalTweets();
        }, 1500);
      };
    });

    this.app.connection.on("redsquare-notifications-render-request", () => {
      this.mod.notifications_last_viewed_ts = new Date().getTime();
      this.mod.notifications_number_unviewed = 0;
      this.mod.menu.incrementNotifications("notifications");
      this.mod.saveOptions();

      this.scrollFeed(0);
      window.history.pushState(null, "", "/redsquare/#notifications");
      this.manager.render("notifications");
    });

    this.app.connection.on("redsquare-profile-render-request", (publicKey = "") => {
      this.scrollFeed(0);
      window.history.pushState(null, "", `/redsquare/?user_id=${publicKey}`);
      this.manager.publicKey = publicKey;
      this.manager.render("profile");
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
      this.app.browser.addElementToSelector(RedSquareMainTemplate(), this.container);
    }

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

