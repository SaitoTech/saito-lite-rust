const RedSquareTweetTemplate = require("./tweet.template");

class RedSquareTweet {

  constructor(app, mod, container = "", tx) {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.name = "RedSquareTweet";
    this.tx = tx;

    this.setKeys(tx.msg.data);
    this.setKeys(tx.optional);
  }

  render() {

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

