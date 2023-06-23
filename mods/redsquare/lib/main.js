const RedSquareMainTemplate = require("./main.template");
const TweetManager = require("./manager");

class RedSquareMain {

  constructor(app, mod, container = "") {

    this.app = app;
    this.mod = mod;
    this.container = container;
    this.name = "RedSquareMain";

    this.components = {};

    this.manager = new TweetManager(app, mod, ".saito-main");

    //
    // EVENTS
    //
    // redsquare - component - ui-component - [render-method] - (render-request)
    //
    // rendering the main thread
    this.app.connection.on("redsquare-home-render-request", () => {
      this.manager.publickey = this.app.wallet.returnPublicKey();
      this.manager.mode = "tweets";
      this.manager.render();
    });
    // when someone clicks on a tweet
    this.app.connection.on("redsquare-home-tweet-render-request", (tweet) => {
      this.manager.publickey = this.app.wallet.returnPublicKey();
      this.manager.mode = "tweets";
      this.manager.renderTweet(tweet);
    });
    // when someone adds a tweet at top -- scroll up and render
    this.app.connection.on("redsquare-home-tweet-prepend-render-request", (tweet) => {
      document.querySelector('.tweet-manager').scroll({ top: 0, left: 0, behavior: 'smooth' });
      tweet.render(true); // prepend = true
    });
    this.app.connection.on("redsquare-notifications-render-request", () => {
      this.mod.notifications_last_viewed_ts = new Date().getTime();
      this.mod.notifications_number_unviewed = 0;
      this.mod.saveLocalTweets();
      this.mod.menu.incrementNotifications("notifications");
      this.manager.publickey = this.app.wallet.returnPublicKey();
      this.manager.mode = "notifications";
      this.manager.render();
    });
    this.app.connection.on("redsquare-profile-render-request", (publickey = "") => {
      this.manager.mode = "profile";
      this.manager.publickey = publickey;
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
    this.app.connection.on("redsquare-tweet-added-render-request", (tweet) => {
      //alert("9");
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

