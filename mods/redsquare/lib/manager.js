const TweetManagerTemplate = require("./manager.template");
const Tweet = require("./tweet");
const SaitoProfile = require("./../../../lib/saito/ui/saito-profile/saito-profile");


class TweetManager {

  constructor(app, mod, container = "", tx = null) {

    this.app = app;
    this.mod = mod;
    this.container = container;

    this.mode = "tweets";
    this.profile = new SaitoProfile(app, mod, ".saito-main");

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

  }

}

module.exports = TweetManager;

