const ZoomTemplate = require('./zoom.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class ZoomOverlay {

	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.visible = false;
		this.overlay = new SaitoOverlay(app, mod);
		this.rendering_at_coordinates = false;
		this.spaces_onclick_callback = null;
	}

	pullHudOverOverlay() {
		let overlay_zindex = parseInt(this.overlay.zIndex);
		if (document.querySelector('.hud')) {
			document.querySelector('.hud').style.zIndex = overlay_zindex + 1;
			this.mod.hud.zIndex = overlay_zindex + 1;
		}
	}

	pushHudUnderOverlay() {
		let overlay_zindex = parseInt(this.overlay.zIndex);
		if (document.querySelector('.hud')) {
			document.querySelector('.hud').style.zIndex = overlay_zindex - 2;
			this.mod.hud.zIndex = overlay_zindex - 2;
		}
	}

	scrollTo(spacekey="") {

console.log("spacekey: " + spacekey);

		if (spacekey != "") {

			let top = this.mod.game.spaces[spacekey].top;
			let left = this.mod.game.spaces[spacekey].left;

			let zoomOverlay = document.querySelector(".zoom-overlay");	
if (!zoomOverlay) { 
	try {
		this.render(spacekey);
		zoomOverlay = document.querySelector(".zoom-overlay");	
	} catch (err) {
		return 0;
	}
}
			const zoomWidth = zoomOverlay.clientWidth;
			const zoomHeight = zoomOverlay.clientHeight;

  			const scrollLeft = left - zoomWidth / 2;
  			const scrollTop = top - zoomHeight / 2;

			let board = document.querySelector(".zoom-overlay .gameboard");	
			// funky slide
			board.style.transition = "transform 0.5s ease";
			board.style.transform = `translate(-${scrollLeft}px, -${scrollTop}px)`;

		}

	}

	showControls() {
	  let ob1 = document.querySelector(".zoom-overlay .status");
	  let ob2 = document.querySelector(".zoom-overlay .controls");
	  if (ob1) { ob1.style.display = "block"; }
	  if (ob2) { ob2.style.display = "block"; }
	}

	hideControls() {
	  let ob1 = document.querySelector(".zoom-overlay .status");
	  let ob2 = document.querySelector(".zoom-overlay .controls");
	  if (ob1) { ob1.style.display = "none"; }
	  if (ob2) { ob2.style.display = "none"; }
	}

	hide() {
		this.visible = false;
		this.overlay.hide();
	}



        renderAtSpacekey(spacekey) {

                let left = 0;
                let top = 0;
                let board_height = 0;
                let board_width = 0;

                let element = document.querySelector(`.${spacekey}`);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    top = rect.top;
                    left = rect.left;
                }

                let coords = this.renderAtCoordinates(left, top);

console.log("TOP is: " + top);
console.log("LEFT is: " + left);
console.log("percent right: " + coords.percent_right);
console.log("percent down: " + coords.percent_down);

                let gb = document.querySelector('.theses-overlay');
                if (gb) {
                    board_height = gb.getBoundingClientRect().height;
                    board_width = gb.getBoundingClientRect().width;
                    let gb2 = document.querySelector('.theses-overlay .gameboard');

                    if (coords.percent_right > 15) {
                    }
                    if (coords.percent_right < 62) {
console.log("shifting left: " + (board_width/6));
                      gb2.style.left = "-" + parseInt((board_width/6)) + "px";
                    }
                    if (coords.percent_down > 50) {
console.log("shifting up: " + (board_height/3));
                      gb2.style.top = "+" + parseInt((board_height/3)) + "px";
                    }
                }


                return 0;

        }

	renderAtCoordinates(xpos, ypos) {
		this.pushHudUnderOverlay();

		this.visible = true;
		this.rendering_at_coordinates = true;
		let gb = document.querySelector('.gameboard');

		xpos = parseInt(xpos);
		ypos = parseInt(ypos);

		let top = parseInt(gb.getBoundingClientRect().top);
		let left = parseInt(gb.getBoundingClientRect().left);
		let width = parseInt(gb.getBoundingClientRect().width);
		let height = parseInt(gb.getBoundingClientRect().height);

		let current_xpos = parseInt(xpos - left);
		let current_ypos = parseInt(ypos - top);

		let percent_right = parseInt(parseFloat(current_xpos / width) * 100);
		let percent_down = parseInt(parseFloat(current_ypos / height) * 100);

		percent_right -= 12;
		percent_down -= 8;

		if (percent_down < 16) {
			percent_down = 16;
		}
		if (percent_right < 15) {
			percent_right = 15;
		}
		if (percent_right > 62.5) {
			percent_right = 62.5;
		}
		if (percent_down > 63.5) {
			percent_down = 63.5;
		}

		this.render();
		this.rendering_at_coordinates = false;

		// remove status
		let status = document.querySelector('.zoom-overlay .status');
		status.style.display = 'none';
		let controls = document.querySelector('.zoom-overlay .controls');
		controls.style.display = 'none';

		let gb2 = document.querySelector('.gameboard-clone');
		gb2.classList.remove('zoom-german');
		gb2.classList.remove('zoom-french');
		gb2.classList.remove('zoom-spanish');
		gb2.classList.remove('zoom-italian');
		gb2.classList.remove('zoom-english');
		gb2.classList.remove('zoom-ottoman');
		gb2.style.transform = `translate(-${percent_right}%, -${percent_down}%) scaleX(1) scaleY(1)`;

		this.attachEvents();

                return {
                        percent_right : percent_right ,
                        percent_down : percent_down ,
                }

	}

	render() {
		this.pushHudUnderOverlay();

		//
		// if already visible, don't reload
		//
		if (this.visible == true) {
			if (document.querySelector('.zoom_overlay')) {
				return;
			}
		}

		this.visible = true;
		this.overlay.show(ZoomTemplate());

		let dw = document.querySelector('.zoom-overlay');
		let gb = document.querySelector('.gameboard');

		let gb2 = gb.cloneNode(true);
		gb2.removeAttribute('id');
		gb2.removeAttribute('style');
		gb2.classList.add('gameboard-clone');

		dw.appendChild(gb2);

		$('.gameboard-clone').draggable({});

		this.attachEvents();
	}

	attachEvents() {
		//
		// add tiles
		//
		for (let key in this.mod.game.spaces) {
			let qs = '.zoom-overlay .gameboard .' + key;
			if (!document.querySelector(qs)) {
				console.log('qs: ' + qs);
			} else {
				document.querySelector(qs).onclick = (e) => {
					let space_id = e.currentTarget.id;
					//
					// we have clicked on a space. if there is a callback attached to the
					// zoom overlay, we are going to execute that callback. this is used
					// when we want people to use the zoom overlay to select something.
					//
					if (this.spaces_onclick_callback != null) {
						//
						// trigger if selectable
						//
						let can_trigger = false;
						let tkey = `.${key}`;
						document.querySelectorAll(tkey).forEach((el) => {
							if (el.classList.contains('selectable')) {
								can_trigger = true;
							}
						});
						if (can_trigger) {
							this.spaces_onclick_callback(space_id);
						}

						//
						// otherwise we will show the detailed VIEW of the space, since people
						// are trying to click on a space but it isn't selectable, which means
						// letting them see for themselves what is heree.
						//
					} else {
						this.mod.displaySpaceDetailedView(space_id);
					}
				};
			}
		}
	}
}

module.exports = ZoomOverlay;
