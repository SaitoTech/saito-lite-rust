const TweetTemplate = require("./tweet.template");

class RedSquareTweet {

    constructor(app, mod, tx) {
      this.tweet = tx;
    }

    render(app, mod, selector = "") {
      app.browser.addElementToSelector(TweetTemplate(app, mod, this.tweet), selector);
      this.attachEvents(app, mod);
    }

    attachEvents(app, mod) { 
    }
}

module.exports = RedSquareTweet;


