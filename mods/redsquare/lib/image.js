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
    let element = this.container + " > .tweet-picture";
    let template = RedSquareImageTemplate(this.app, this.mod, this.images);
    let sig = this.tweet.tx.signature;

    let expected_width = 520;
    let expected_height = "auto";

    //
    // avoid length vertical posts
    //
    for (let i = 0; i < this.images.length; i++) {
      var img = new Image();
      let tweet = this.tweet;

      img.onload = function () {
        //console.log("Image load");
        let available_width_qs = ".tweet-" + tweet.tx.signature + " > .tweet-body .tweet-main";
        if (document.querySelector(available_width_qs)) {
          let obj = document.querySelector(available_width_qs);
          expected_width = parseInt(obj.getBoundingClientRect().width);
          //console.log("Column Width: " + expected_width);
        } else {
          //console.log("QS not found");
        }

        let aspect_ratio = img.width / img.height;
        //console.log("Aspect: " + aspect_ratio);

        if (img.height >= img.width) {
          expected_height = expected_width;
        } else {
          expected_height = expected_width / aspect_ratio;
        }

        let qs = ".tweet-" + sig + " > .tweet-body  .tweet-picture .image-" + i;
        let obj = document.querySelector(qs);
        if (obj) {
          obj.style.maxHeight = Math.floor(expected_height) + "px";
          obj.style.maxWidth = expected_width + "px";
          //console.log(obj.style.maxWidth + ", " + obj.style.maxHeight);
        }
      };
      img.src = this.images[0];
    }
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
    let sel =
      ".tweet-" + this.tweet.tx.signature + " > .tweet-body .tweet-preview .tweet-picture > img";

    if (document.querySelectorAll(sel)) {
      document.querySelectorAll(sel).forEach((image) => {
        image.onclick = (e) => {
          let image_idx = e.currentTarget.getAttribute("data-index");
          this.overlay.render(image_idx);
        };
      });
    }
  }
}

module.exports = RedSquareImage;
