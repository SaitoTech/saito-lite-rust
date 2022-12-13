const ImageOverlay = require("./appspace/image-overlay");
const RedSquareImageTemplate = require("./image.template");

class RedSquareImage {

  constructor(app, mod, container = "", tweet) {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.tweet = tweet;
    this.name = "RedSquareImage";
    let txmsg = tweet.tx.msg;
    this.images = txmsg.data.images || [];
    this.image_overlay = null;
  }

  render() {

    //
    // replace element or insert into page
    //
    let element = "#tweett-"+this.tweet.tx.transaction.sig+ " > .tweet-body  .tweet-picture";
    let template = RedSquareImageTemplate(this.app, this.mod, this.images);

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
    tweet_self = this;

    ///
    // view image
    //
    let sel = ".tweet-"+this.tweet.tx.transaction.sig+ " > .tweet-body .tweet-preview .tweet-picture > img";

    console.log("tweet img id");
    console.log(sel);

    if (document.querySelectorAll(sel)) {
      document.querySelectorAll(sel).forEach(image => {
        image.onclick = (e) => {
          let image = e.target;
          
          tweet_self.image_overlay = new ImageOverlay(this.app, this.mod, image);
          tweet_self.image_overlay.render();
        }
      });
    }
  }

}

module.exports = RedSquareImage;

