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
    var img = new Image;
    let tweet = this.tweet;

    img.onload = function() {

      let available_width_qs = ".tweet-"+tweet.tx.transaction.sig+ " > .tweet-body .tweet-main";
      if (document.querySelector(available_width_qs)) {
        let obj = document.querySelector(available_width_qs);
        expected_width = parseInt(obj.getBoundingClientRect().width);
console.log("set expected width to: " + expected_width);
      }

console.log(tweet.text);
console.log("expected width: " + expected_width);
      expected_width = parseInt(expected_width);
console.log("expected width: " + expected_width);
      expected_height = parseInt((expected_width / img.width) * img.height);

console.log(img.height + " -- " + img.width);
console.log(expected_height + " -- " + expected_width);

     while (Math.floor(expected_height) > expected_width) {
	expected_height = expected_width * 0.75;
     }

//console.log("yes as: " + Math.floor(expected_height*0.70) + " > " + expected_width);
        let qs = ".tweet-"+sig+ " > .tweet-body  .tweet-picture img";
	let obj = document.querySelector(qs);
	//obj.style.maxHeight = Math.floor(expected_width*0.70) + "px";
	obj.style.maxHeight = Math.floor(expected_height) + "px";
console.log("MAX HEIGHT: " + obj.style.maxHeight);
	obj.style.maxWidth = expected_width + "px";
console.log("MAX WIDTH: " + obj.style.maxWidth);
    };
    img.src = this.images[0];



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

