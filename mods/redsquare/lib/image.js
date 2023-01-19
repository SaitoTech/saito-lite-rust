const SaitoImageOverlay = require("./../../../lib/saito/ui/saito-image-overlay/saito-image-overlay");
const RedSquareImageTemplate = require("./image.template");

class RedSquareImage {

  constructor(app, mod, container = "", tweet) {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.tweet = tweet;
    this.images = tweet.tx.msg.data.images || [];
    this.overlay = new SaitoImageOverlay(this.app, this.mod, this.images);
  }

  render() {

    let element = ".tweet-"+this.tweet.tx.transaction.sig+ " > .tweet-body  .tweet-picture";
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

    let sel = ".tweet-"+this.tweet.tx.transaction.sig+ " > .tweet-body .tweet-preview .tweet-picture > img";

    if (document.querySelectorAll(sel)) {
      document.querySelectorAll(sel).forEach(image => {
        image.onclick = (e) => {
          let image_idx = e.currentTarget.getAttribute("data-index");	  
          this.overlay.render(image_idx);
        }
      });
    }

  }

}

module.exports = RedSquareImage;

