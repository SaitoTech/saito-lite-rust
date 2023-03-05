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
    let sig = this.tweet.tx.transaction.sig;

    let expected_width = "100%";
    let expected_height = "auto";

    //
    // avoid length vertical posts
    //
    for (let i = 0; i < this.images.length; i++) {

      var img = new Image;
      let tweet = this.tweet;

      img.onload = function() {

        let available_width_qs = ".tweet-"+tweet.tx.transaction.sig+ " > .tweet-body .tweet-main";
        if (document.querySelector(available_width_qs)) {
          let obj = document.querySelector(available_width_qs);
          expected_width = parseInt(obj.getBoundingClientRect().width);
        }

        expected_width = parseInt(expected_width);
        expected_height = parseInt((expected_width / img.width) * img.height);

        while (Math.floor(expected_height) > expected_width) {
  	  expected_height = expected_width * 0.69;
        }

        let qs = ".tweet-"+sig+ " > .tweet-body  .tweet-picture .image-"+i;
	let obj = document.querySelector(qs);
	obj.style.maxHeight = Math.floor(expected_height) + "px";
	obj.style.maxWidth = expected_width + "px";
      };
      img.src = this.images[0];

    };



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

