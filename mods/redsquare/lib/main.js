const RedSquareMainTemplate = require("./main.template");
const RedSquareAppspaceProfile = require("./appspace/profile");
const RedSquareAppspaceHome = require("./appspace/home");
const RedSquareAppspaceNotifications = require("./appspace/notifications");
const RedSquareAppspaceGames = require("./appspace/games");
const RedSquareAppspaceContacts = require("./appspace/contacts");
const SaitoLoader = require("../../../lib/saito/ui/saito-loader/saito-loader");

class RedSquareMain {
  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.name = "RedSquareMain";

    this.components = {};
<<<<<<< HEAD
    this.components["home"] = new RedSquareAppspaceHome(app, mod, ".saito-main");
    this.components["profile"] = new RedSquareAppspaceProfile(app, mod, ".saito-main");
    this.components["notifications"] = new RedSquareAppspaceNotifications(app, mod, ".saito-main");
=======
    this.components['home'] = new RedSquareAppspaceHome(app, mod, ".saito-main");
    this.components['profile'] = this.mod.profile;
    this.components['notifications'] = new RedSquareAppspaceNotifications(app, mod, ".saito-main");
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    //this.components['contacts'] = new RedSquareAppspaceContacts(app, mod, ".saito-main");
    this.render_component = "home";

    //
    // EVENTS
    //
    // redsquare - component - ui-component - [render-method] - (render-request)
    //
    this.app.connection.on("redsquare-home-render-request", () => {
      this.renderAppspaceComponent("home");
      this.components["home"].renderTweets();
    });
    this.app.connection.on("redsquare-home-loader-render-request", () => {
      this.components["home"].loader.render();
    });
    this.app.connection.on("redsquare-home-loader-hide-request", () => {
      this.components["home"].loader.hide();
    });
    this.app.connection.on("redsquare-home-thread-render-request", (tweets) => {
      this.renderAppspaceComponent("home");
      this.components["home"].renderThread(tweets);
    });
    this.app.connection.on("redsquare-home-tweet-render-request", (tweet) => {
      //document.querySelector('.saito-container').scrollTo({top:0, left:0, behavior:"smooth"});
      this.components["home"].renderTweet(tweet);
    });
    this.app.connection.on("redsquare-home-tweet-append-render-request", (tweet) => {
      this.components["home"].appendTweet(tweet);
    });
    this.app.connection.on("redsquare-home-tweet-prepend-render-request", (tweet) => {
      this.components["home"].prependTweet(tweet);
    });
    this.app.connection.on(
      "redsquare-home-tweet-and-critical-child-append-render-request",
      (tweet) => {
        this.components["home"].prependTweetWithCriticalChild(tweet);
      }
    );
    this.app.connection.on(
      "redsquare-home-tweet-and-critical-child-prepend-render-request",
      (tweet) => {
        this.components["home"].prependTweetWithCriticalChild(tweet);
      }
    );
    this.app.connection.on("redsquare-tweet-added-render-request", async (tweet) => {
      if (this.render_component === "home") {
        if (tweet.updated_at < this.mod.tweets_last_viewed_ts) {
          this.app.connection.emit("redsquare-home-tweet-append-render-request", tweet);
        } else {
          if (tweet.tx.from[0].publicKey === (await this.app.wallet.getPublicKey())) {
            this.app.connection.emit("redsquare-home-tweet-prepend-render-request", tweet);
          }
        }
      }
    });
    this.app.connection.on("redsquare-profile-render-request", (publickey = "") => {
<<<<<<< HEAD
      setHash("profile");
      this.renderAppspaceComponent("profile", publickey);
=======
      setHash('profile');
      //this.renderAppspaceComponent("profile", publickey);
      this.app.connection.emit("saito-profile-render-request", this.app.wallet.returnPublicKey());
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    });
    //this.app.connection.on("redsquare-contacts-render-request", () => {
    //  this.renderAppspaceComponent("contacts");
    //});
    this.app.connection.on("redsquare-notifications-render-request", () => {
      this.renderAppspaceComponent("notifications");
      this.components["notifications"].renderNotifications();
      // and load more notifications
      this.mod.loadMoreNotifications();
    });

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

  async renderAppspaceComponent(component, id = null) {
    document.querySelector(".saito-main").innerHTML = "";
    this.mod.viewing = component;
    this.render_component = component;
    await this.components[this.render_component].render(id);
    document.querySelector(".saito-sidebar.right").innerHTML = "";
    await this.mod.sidebar.render();
  }

  async render() {
    //
    // render framework for app
    //
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
}

module.exports = RedSquareMain;
