const SaitoOverlay = require("../../../../lib/saito/new-ui/saito-overlay/saito-overlay");
const RedSquareImageOverlayTemplate = require('./image-overlay.template');


class RedSquareImageOverlay {

  constructor(app, img) {
    this.app = app;
    this.saito_overlay = new SaitoOverlay(app, true, true);
    this.img = img;
    this.img_index = img.getAttribute("data-index");;
    this.selected = 1;
    this.parent = this.img.parentNode;
    this.tweetImgs = this.parent.childNodes;
  }

  render(app, mod) {
    this_self = this;
    this.saito_overlay.show(app, mod, RedSquareImageOverlayTemplate(app, mod));

    // if tweet has only one img, hide left right arrows
    if (this.tweetImgs.length == 1) {
      this.hideArrowLeft();
      this.hideArrowRight();
    }

    // loop through each img inside tweet and append them to overlay
    this.tweetImgs.forEach(function(img, index){
      let imgdata_uri = img.style.backgroundImage.slice(4, -1).replace(/"/g, "");
      let img_index = img.getAttribute("data-index");

      let oImg = document.createElement("img");
      oImg.setAttribute('src', imgdata_uri);
      oImg.setAttribute('data-index', img_index);
      oImg.setAttribute('class', "tweet-overlay-img");
      oImg.setAttribute('id', "tweet-overlay-img-"+img_index);

      // show img that was clicked, hide others on first render
      if (this_self.img_index == img_index) {
        
        // keep track of which img is being shown to help in left right arrow click
        this_self.selected = Number(img_index);

        if (img_index == 1) {
          this_self.hideArrowLeft();
        }

        if (img_index == this_self.tweetImgs.length) {
          this_self.hideArrowRight();
        }        
      
      } else {
        oImg.style.display = 'none';
      }
      
      document.querySelector("#tweet-overlay-img-cont").appendChild(oImg);
    });

    this.attachEvents(app, mod);
  }


  attachEvents(app, mod) {
    this_self = this;
    document.getElementById("tweet-img-arrow-box-left").addEventListener('click', function(e){
      this_self.hideAllImgs();
      this_self.selected = this_self.selected - 1; 

      document.querySelector("#tweet-overlay-img-"+this_self.selected).style.display = 'block';
      this_self.checkArrows();
    });

    document.getElementById("tweet-img-arrow-box-right").addEventListener('click', function(e){
      this_self.hideAllImgs();
      this_self.selected = this_self.selected + 1; 

      document.querySelector("#tweet-overlay-img-"+this_self.selected).style.display = 'block';
      this_self.checkArrows();
    });
  }

  checkArrows(){
    this.showArrows();

    if (this.selected == 1) {
      this.hideArrowLeft();
    }

    if (this.selected == this.tweetImgs.length) {
      this.hideArrowRight();
    }        
  }

  hideAllImgs(){
    document.querySelectorAll('.tweet-overlay-img').forEach(function(img) {
      img.style.display = 'none';
    });  
  }

  showArrows(){
    document.querySelector('#tweet-img-arrow-box-left').style.display = 'block';
    document.querySelector('#tweet-img-arrow-box-right').style.display = 'block';
  }

  hideArrowLeft(){
    document.querySelector('#tweet-img-arrow-box-left').style.display = 'none';    
  }

  hideArrowRight(){
    document.querySelector('#tweet-img-arrow-box-right').style.display = 'none';    
  }

}

module.exports = RedSquareImageOverlay;

