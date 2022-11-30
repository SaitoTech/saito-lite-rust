const SaitoOverlay = require("../../../../lib/saito/ui/saito-overlay/saito-overlay");
const RedSquareImageOverlayTemplate = require('./image-overlay.template');


class RedSquareImageOverlay {

  constructor(app, img) {
    this.app = app;
    this.saito_overlay = new SaitoOverlay(app, false, true);
    this.img = img;
    this.img_index = img.getAttribute("data-index");;
    this.selected = 1;
    this.parent = this.img.parentNode;
    this.tweetImgs = [];
    this.imgsCount = 0;

    this.setImgCount();
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

      if (img.nodeName == "IMG") {
        let imgdata_uri = img.getAttribute("src");
        let img_index = img.getAttribute("data-index");


        let oImg = document.createElement("img");
        oImg.setAttribute('src', imgdata_uri);
        oImg.setAttribute('data-index', img_index);
        oImg.setAttribute('class', "tweet-overlay-img");
        oImg.setAttribute('id', "tweet-overlay-img-"+img_index);


        document.querySelector("#tweet-overlay-img-cont").appendChild(oImg);
     
        // show img that was clicked, hide others on first render
        if (this_self.img_index == img_index) {

          // keep track of which img is being shown to help in left right arrow click
          this_self.selected = Number(img_index);
          this_self.checkArrows(document.getElementById("tweet-overlay-img-"+img_index));        
        
        } else {
          oImg.style.display = 'none';
        }
      }

    });

    this.attachEvents(app, mod);
  }


  attachEvents(app, mod) {
    this_self = this;
    document.getElementById("tweet-img-arrow-box-left").addEventListener('click', function(e){
      this_self.hideAllImgs();
      this_self.selected = this_self.selected - 1; 

      let img_showing = document.querySelector("#tweet-overlay-img-"+this_self.selected);
      img_showing.style.display = 'block';
      this_self.checkArrows(img_showing);
    });

    document.getElementById("tweet-img-arrow-box-right").addEventListener('click', function(e){
      this_self.hideAllImgs();
      this_self.selected = this_self.selected + 1; 

      let img_showing = document.querySelector("#tweet-overlay-img-"+this_self.selected);
      img_showing.style.display = 'block';
      this_self.checkArrows(img_showing);
    });
  }

  checkArrows(img){
    this.showArrows();

    if (this.selected == 1) {
      this.hideArrowLeft();
    }

    if (this.selected == this.tweetImgs.length) {
      this.hideArrowRight();
    }

    let buffer = (window.innerWidth > 535) ? 30 : 0;
    let img_pos = img.getBoundingClientRect();
    let left_arrow_pos = img_pos.x - buffer;
    let right_arrow_pos = window.innerWidth - img_pos.x - img_pos.width - buffer;

    document.querySelector('#tweet-img-arrow-box-left').style.left = '-'+ left_arrow_pos + 'px';
    document.querySelector('#tweet-img-arrow-box-right').style.right = '-'+ right_arrow_pos + 'px';
  }

  setImgCount() {
    this_self = this;
    let imgCount = 0;
    this.parent.childNodes.forEach(function(img, index){
      if (img.nodeName == "IMG") {
        imgCount++; 
        this_self.tweetImgs.push(img);
      }
    });

    this.imgCount = imgCount;
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

