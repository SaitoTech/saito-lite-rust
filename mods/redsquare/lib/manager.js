const TweetManagerTemplate = require("./manager.template");
const Tweet = require("./tweet");

class TweetManager {

  constructor(app, mod, container = "", tx = null) {

    this.app = app;
    this.mod = mod;
    this.container = container;

    this.tweets = [];
    this.modes = ["tweets","notifications","profile"];

  }

  render() {

    let myqs = `.tweet-manager`;

    if (!document.querySelector(myqs)) {
      this.app.browser.addElementToSelector(TweetManagerTemplate(), this.container);
    } else {
      this.app.browser.replaceElementBySelector(TweetManagerTemplate(), myqs);
    }

    this.attachEvents();

  }

  attachEvents() {

  }

}

module.exports = TweetManager;

