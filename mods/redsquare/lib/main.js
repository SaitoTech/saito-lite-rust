const RedSquareMainTemplate = require("./main.template");
const TweetManager = require("./manager");

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
    this.app.connection.on("redsquare-home-render-request", (user_click = true) => {
      if (this.manager.mode == "tweets" && user_click) {
        this.scroll_depth = 0;      
        this.manager.showLoader();
        this.mod.loadNewTweets(null, () => {
          this.app.connection.emit("redsquare-home-render-request", false);
        });
        return;        
      }
      this.manager.mode = "tweets";
      this.manager.render();
      this.scrollFeed(this.scroll_depth);
    });


    // when someone clicks on a tweet
    this.app.connection.on("redsquare-home-tweet-render-request", (tweet) => {
      this.scrollFeed(0);
      this.manager.renderTweet(tweet);
    });

    this.app.connection.on("redsquare-notifications-render-request", () => {
      this.mod.notifications_last_viewed_ts = new Date().getTime();
      this.mod.notifications_number_unviewed = 0;
      this.mod.saveLocalTweets();
      this.mod.menu.incrementNotifications("notifications");
      this.scrollFeed(0);
      this.manager.mode = "notifications";
      this.manager.render();
    });

    this.app.connection.on("redsquare-profile-render-request", (publickey = "") => {
      this.scrollFeed(0);
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

    // this is triggered when you reply to a tweet -- it pushes tweet and your reply to top, or should
    this.app.connection.on("redsquare-home-tweet-and-critical-child-prepend-render-request", (tweet) => {
      this.app.connection.emit("redsquare-home-tweet-render-request", (tweet));
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


  scrollFeed(newDepth){
    if (this.manager.mode == "tweets"){
      this.scroll_depth = document.querySelector('.saito-container').scrollTop;
    }

    document.querySelector('.saito-container').scroll({ top: newDepth, left: 0, behavior: 'smooth' });

  }

}

module.exports = RedSquareMain;

