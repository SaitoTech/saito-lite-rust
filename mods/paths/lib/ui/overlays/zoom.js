const ZoomTemplate = require('./zoom.template');
const SaitoOverlay = require("./../../../../../lib/saito/ui/saito-overlay/saito-overlay");

class ZoomOverlay {

    constructor(app, mod){
        this.app = app;
        this.mod = mod;
	this.visible = false;
        this.overlay = new SaitoOverlay(app, mod);
        this.rendering_at_coordinates = false;
	this.spaces_onclick_callback = null;
    }

    pullHudOverOverlay() {
      let overlay_zindex = parseInt(this.overlay.zIndex);
      if (document.querySelector(".hud")) {
        document.querySelector(".hud").style.zIndex = overlay_zindex+1;
        this.mod.hud.zIndex = overlay_zindex+1;
      }
    }

    pushHudUnderOverlay() {
      let overlay_zindex = parseInt(this.overlay.zIndex);
      if (document.querySelector(".hud")) {
        document.querySelector(".hud").style.zIndex = overlay_zindex-2;
        this.mod.hud.zIndex = overlay_zindex-2;
      }
    }

    hide() {
        this.visible = false;
	this.overlay.hide();
    } 
 
    renderAtCoordinates(xpos, ypos) {

      this.pushHudUnderOverlay();

      this.visible = true;
      this.rendering_at_coordinates = true;
      let gb   = document.querySelector(".gameboard");

      xpos = parseInt(xpos);
      ypos = parseInt(ypos);

      let top    = parseInt(gb.getBoundingClientRect().top);
      let left   = parseInt(gb.getBoundingClientRect().left);
      let width  = parseInt(gb.getBoundingClientRect().width);
      let height = parseInt(gb.getBoundingClientRect().height);

      let current_xpos = parseInt((xpos - left));
      let current_ypos = parseInt((ypos - top));

      let percent_right = parseInt(parseFloat(current_xpos / width) * 100);
      let percent_down  = parseInt(parseFloat(current_ypos / height) * 100);

      percent_right -= 12;
      percent_down -= 8;

      if (percent_down < 16) { percent_down = 16; }
      if (percent_right < 15) { percent_right = 15; }
      if (percent_right > 62.5) { percent_right = 62.5; }
      if (percent_down > 63.5) { percent_down = 63.5; }

      this.render();
      this.rendering_at_coordinates = false;

      // remove status
      let status = document.querySelector(".zoom-overlay .status");
      status.style.display = "none";
      let controls = document.querySelector(".zoom-overlay .controls");
      controls.style.display = "none";

      let gb2 = document.querySelector(".gameboard-clone");
      gb2.classList.remove("zoom-german");
      gb2.classList.remove("zoom-french");
      gb2.classList.remove("zoom-spanish");
      gb2.classList.remove("zoom-italian");
      gb2.classList.remove("zoom-english");
      gb2.classList.remove("zoom-ottoman");
      gb2.style.transform = `translate(-${percent_right}%, -${percent_down}%) scaleX(1) scaleY(1)`;

    }
  
    render() {

        this.pushHudUnderOverlay();

	//
	// if already visible, don't reload
	//
        if (this.visible == true) {
	  if (document.querySelector(".zoom_overlay")) { return; }
        }

	this.visible = true;
        this.overlay.show(ZoomTemplate());

	let dw = document.querySelector(".zoom-overlay");
	let gb = document.querySelector(".gameboard");

	let gb2 = gb.cloneNode(true);
	gb2.removeAttribute("id");
        gb2.removeAttribute("style");
	gb2.classList.add("gameboard-clone");

	dw.appendChild(gb2);

        $('.gameboard-clone').draggable({});

        this.attachEvents();
    }

    attachEvents(){

      //
      // add tiles
      //
      for (let key in this.mod.spaces) {
        let qs = ".zoom-overlay .gameboard ."+key;
	document.querySelector(qs).onclick = (e) => {
	  let space_id = e.currentTarget.id;
	  //
	  // we have clicked on a space. if there is a callback attached to the 
	  // zoom overlay, we are going to execute that callback. this is used
	  // when we want people to use the zoom overlay to select something.
	  //
	  if (this.spaces_onclick_callback != null) {
	    this.spaces_onclick_callback(space_id);

	  //
	  // otherwise we will show the detailed VIEW of the space, since people
	  // are trying to click on a space but it isn't selectable, which means
	  // letting them see for themselves what is heree.
	  //
	  } else {
	    this.mod.displaySpaceDetailedView(space_id);
	  }
	}
      }

    }

}

module.exports = ZoomOverlay;

