const RedSquareTweetTemplate = require("./tweet.template");

class RedSquareTweet {

  constructor(app, mod, container = "", tx) {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.name = "RedSquareTweet";

    this.tx = tx;

    this.parent_id = "";
    this.thread_id = "";
    this.updated_at = 0;

    this.retweet = null;
    this.retweeters = [];
    this.retweet_tx = null;
    this.retweet_tx_sig = null;

    this.setKeys(tx.msg.data);
    this.setKeys(tx.optional);

    //
    // create retweet if exists, and set its render container as our preview-box
    //
    if (this.retweet != null) {
      let newtx = new saito.default.transaction(JSON.parse(this.retweet_tx));
      this.retweet = new RedSquareTweet(app, mod, (".tweet-preview-"+this.tx.transaction.sig), newtx);
    }

  }

  render() {

console.log("rendering into: " + this.container);

    //
    // replace element or insert into page
    //
    // if (document.querySelector(".redsquare-menu")) {
    //   this.app.browser.replaceElementBySelector(RedSquareTweetTemplate(this.app, this.mod), ".redsquare-menu");
    // } else {
      if (this.container) {
        this.app.browser.addElementToSelector(RedSquareTweetTemplate(this.app, this.mod, this), this.container);
      } else {
        this.app.browser.addElementToDom(RedSquareTweetTemplate(this.app, this.mod, this));
      }
    //}

    //
    // this should render any (re)tweet into the tweet-preview.
    //
    if (this.retweet != null) {
      this.retweet.render();
    }


    this.attachEvents();

  }


  setKeys(obj) {
    for (let key in obj) {
      if (typeof obj[key] !== 'undefined') {
        if (this[key] === 0 || this[key] === "" || this[key] === null) {
          this[key] = obj[key];
        }
      }
    }
  }

  attachEvents() {
    tweet_self = this;
  }

}

module.exports = RedSquareTweet;

