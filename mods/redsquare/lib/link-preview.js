const RedSquareLinkPreviewTemplate = require("./link-preview.template");

class RedSquareLinkPreview {

  constructor(app, mod, container = "", tweet) {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.tweet = tweet;
    this.name = "RedSquareLinkPreview";

    console.log("LINK PREVIEW");
    console.log(tweet);
  }

  render() {

    //
    // replace element or insert into page
    //
    let element = "#tweet-"+this.tweet.tx.transaction.sig+ " > .tweet-body  .link-preview";
    if (document.querySelector(element)) {
      this.app.browser.replaceElementBySelector(RedSquareLinkPreviewTemplate(this.app, this.mod), element);
    } else {
      if (this.container) {
        this.app.browser.addElementToSelector(RedSquareLinkPreviewTemplate(this.app, this.mod), this.container);
      } else {
        this.app.browser.addElementToDom(RedSquareLinkPreviewTemplate(this.app, this.mod));
      }
    }

    this.attachEvents();
  }  



  attachEvents() {

  }

}

module.exports = RedSquareLinkPreview;

