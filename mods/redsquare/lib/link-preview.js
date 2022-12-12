const RedSquareLinkPreviewTemplate = require("./link-preview.template");

class RedSquareLinkPreview {

  constructor(app, mod, container = "", tweet) {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.tweet = tweet;
    this.name = "RedSquareLinkPreview";
  }

  render() {

    //
    // replace element or insert into page
    //
    if (typeof this.tweet.link != "undefined") {

      let qs = ".tweet-"+this.tweet.tx.transaction.sig+ " > .tweet-body .tweet-main .tweet-preview";

      if (document.querySelector(qs)) {
        this.app.browser.replaceElementBySelector(RedSquareLinkPreviewTemplate(this.tweet), qs);
      } else {
        this.app.browser.addElementToSelectorOrDom(RedSquareLinkPreviewTemplate(this.tweet), this.container);
      }

      this.attachEvents();
    }
  }  



  attachEvents() {
  }

}

module.exports = RedSquareLinkPreview;

