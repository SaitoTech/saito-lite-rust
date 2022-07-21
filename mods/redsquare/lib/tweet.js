const TweetTemplate = require("./tweet.template");
const LinkPreview = require("./link-preview");
const fetch = require('node-fetch');


class RedSquareTweet {

    constructor(app, mod, tx) {
      this.tweet = {};
      this.tweet.tx = tx;
      this.tweet.has_link = true;
      this.tweet.link_data = {};

      this.setKeys(tx.msg.data);
      this.setKeys(tx.optional);

    }

    render(app, mod, selector = "") {
      app.browser.addElementToSelector(TweetTemplate(app, mod, this.tweet), selector);
      this.attachEvents(app, mod);
    }


    setKeys(obj) {
      for (let key in obj) { 
        if (typeof obj[key] != 'undefined') 
          this.tweet[key] = obj[key];  
      }
    }


    attachEvents(app, mod) { 
    }
}

module.exports = RedSquareTweet;


