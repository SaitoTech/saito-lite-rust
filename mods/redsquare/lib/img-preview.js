const RedSquareImgPreviewTemplate = require("./img-preview.template");

class RedSquareImgPreview {

  constructor(app, mod, container = "", tweet) {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.tweet = tweet;
    this.name = "RedSquareImgPreview";
    let txmsg = tweet.tx.msg;
    this.images = txmsg.data.images || [];
  }

  render() {

    //
    // replace element or insert into page
    //
    let element = "#tweet-"+this.tweet.tx.transaction.sig+ " > .tweet-body  .tweet-picture";
    let template = RedSquareImgPreviewTemplate(this.app, this.mod, this.images);

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



  attachEvents() {

  }

}

module.exports = RedSquareImgPreview;

