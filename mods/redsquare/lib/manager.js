const TweetManagerTemplate = require("./manager.template");
const Tweet = require("./tweet");
const SaitoProfile = require("./../../../lib/saito/ui/saito-profile/saito-profile");
const SaitoLoader = require("./../../../lib/saito/ui/saito-loader/saito-loader");


class TweetManager {

  constructor(app, mod, container = "", tx = null) {

    this.app = app;
    this.mod = mod;
    this.container = container;

    this.mode = "tweets";
    this.profile = new SaitoProfile(app, mod, ".saito-main");

    // dynamic loading
    this.intersection_loader = new SaitoLoader(app, mod, "#redsquare-intersection");
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
alert("INTERSECTION LOADER");
          this.intersection_loader.render();
          mod.loadTweets(() => { this.intersection_loader.hide() });
        }
      });
    }, {
      root: null,
      rootMargin: '0px',
      threshold: 1
    });


  }

  render() {

    let myqs = `.tweet-manager`;

    if (!document.querySelector(myqs)) {
      this.app.browser.addElementToSelector(TweetManagerTemplate(), this.container);
    } else {
      this.app.browser.replaceElementBySelector(TweetManagerTemplate(), myqs);
    }

    ////////////
    // tweets //
    ////////////
    if (this.mode == "tweets") {

      this.profile.remove();

      for (let i = 0; i < this.mod.tweets.length; i++) {
        let tweet = this.mod.tweets[i];
        tweet.renderWithCriticalChild();
      }

    }

    ///////////////////
    // notifications //
    ///////////////////
    if (this.mode == "notifications") {

      this.profile.remove();

      for (let i = 0; i < this.mod.notifications.length; i++) {
        let notification = new Notification(this.app, this.mod, this.mod.notifications[i].tx);
        notification.render(".tweet-manager");
      }

    }

    /////////////
    // profile //
    /////////////
    if (this.mode == "profile") {
      this.profile.render();
    }
 
    this.attachEvents();

  }

  attachEvents() {

    //
    // dynamic content loading
    //
    this.intersectionObserver.observe(document.querySelector('#redsquare-intersection'));

  }

}

module.exports = TweetManager;

