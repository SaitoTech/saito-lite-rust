const TweetBoxTemplate = require("./tweet-box.template");

class TweetBox {

    constructor(app, mod, tweet) {
      this.tweet_item = tweet;
      this.getIdenticon(app, mod);
    }

    render(app, mod, container = "") {

      console.log('inside tweet item');
      console.log(this.tweet_item);
      app.browser.addElementToDom(TweetBoxTemplate(app, mod, this.tweet_item), 'redsquare-list');
      this.attachEvents();
    }

    attachEvents() { 
    }

    getIdenticon(app, mod) {
      let identicon = "";
      name = app.keys.returnUsername(this.tweet_item.publickey);

      if (name != "") {
        if (name.indexOf("@") > 0) {
          name = name.substring(0, name.indexOf("@"));
        }
      }

      identicon = app.keys.returnIdenticon(name);
      this.tweet_item.identicon = identicon;
    }
}

module.exports = TweetBox;


