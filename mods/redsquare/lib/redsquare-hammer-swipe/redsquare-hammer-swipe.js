/**
 Utility to allow mobile users to downswipe if at the top of the page.

 This will trigger the same thing as a call to home -- scroll to top and refresh
**/

class RedSquareHammerSwipe {

  constructor(app, mod){
    this.app = app;
    this.mod = mod;

    this.fixHammerjsDeltaIssue = null;
  }

  render(target = ".saito-main"){

    this.element = document.querySelector(target);

    if (!this.element){
      console.error(target + " does not exist for RedSquare Hammer Swipe")
      return;
    }

    this.attachEvents(target);
    this.onSwipeUp();
  }

  onSwipeUp() {

    alert('swipeup');
    alert(window.pageYOffset + " - " + this.element.scrollTop + " - " + document.body.scrollTop);

  }

  attachEvents(target){

    let rhs = this;

    if (!this.element){
      console.error("Invalid selector for RedSquare Hammer Target");
      return;
    }
      
    try {

      //Create hammer (HammerJS included in index.html script)
      let hammertime = new Hammer(this.element);
      hammertime.get('swipe').set({ direction: Hammer.DIRECTION_ALL })

      hammertime.on("swipeup", function () { 
        rhs.onSwipeUp();
      }); 

    } catch (err) {
      console.error("Error: " + err);
    }    
  }

}

module.exports = RedSquareHammerSwipe;


