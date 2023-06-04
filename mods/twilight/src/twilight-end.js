

    //
    // return 0 so other cards do not trigger infinite loop
    //
    return 0;
  }






  //
  // arcade uses
  //
  returnShortGameOptionsArray(options) {

    let sgo = super.returnShortGameOptionsArray(options);
    let nsgo = [];

    for (let i in sgo) {
      let output_me = 1;
      if (output_me == 1) {
        nsgo[i] = sgo[i];
      }
    }

    return nsgo;
  }




  preloadImages() {

    let allImages = [
	"/twilight/img/backgrounds/europe-scoring-bg.png",
	"/twilight/img/backgrounds/asia-scoring-bg.png",
	"/twilight/img/backgrounds/mideast-scoring-bg.png",
	"/twilight/img/backgrounds/africa-scoring-bg.png",
	"/twilight/img/backgrounds/southamerica-scoring-bg.png",
	"/twilight/img/backgrounds/centralamerica-scoring-bg.png",
	"/twilight/img/backgrounds/seasia-scoring-bg.png",
	"/twilight/img/backgrounds/indopaki-bg.jpg",
	"/twilight/img/backgrounds/arabisraeli-bg.jpg",
	"/twilight/img/backgrounds/iraniraq-bg.jpg",
	"/twilight/img/backgrounds/koreanwar-bg.jpg",
	"/twilight/img/backgrounds/brushwar-bg.jpg"
    ];

    this.preloadImageArray(allImages, 0);

  }
  preloadImageArray(imageArray=[], idx=0) {

    let pre_images = [imageArray.length];

    if (imageArray && imageArray.length > idx) {
      pre_images[idx] = new Image();
      pre_images[idx].onload = () => {
        this.preloadImageArray(imageArray, idx+1);
      }
      pre_images[idx].src = "/imperium/" + imageArray[idx];
    }

  }



  formatStatusHeader(status_header, include_back_button = false) {
    return `
    <div class="status-header">
      ${include_back_button ? this.back_button_html : ""}
      <span id="status-content">${status_header}</span>
    </div>
    `;
  }


} // end Twilight class

module.exports = Twilight;



