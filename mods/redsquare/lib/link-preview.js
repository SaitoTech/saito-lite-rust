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
      let element = "#tweet-"+this.tweet.tx.transaction.sig+ " > .tweet-body  .link-preview";
      let template = RedSquareLinkPreviewTemplate(this.app, this.mod)

      if (document.querySelector(element)) {
        this.app.browser.replaceElementBySelector(template, element);
      } else {
        if (this.container) {
          this.app.browser.addElementToSelector(template, this.container);
        } else {
          this.app.browser.addElementToDom(template);
        }
      }

      this.attachEvents();
    }
  }  



  attachEvents() {

  }

}

module.exports = RedSquareLinkPreview;

