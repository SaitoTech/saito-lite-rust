const ZoomTemplate = require('./zoom.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class ZoomOverlay {

	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.visible = false;
		this.overlay = new SaitoOverlay(app, mod);
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

		let top = 0;
		let left = 0;

		if (spacekey != "") {
			top = this.mod.game.spaces[spacekey].top;
			left = this.mod.game.spaces[spacekey].left;
		}

		return this.scrollToCoordinates(top, left);

	}

	scrollToCoordinates(top=0, left=0) {

			let zoomOverlay = document.querySelector(".zoom-overlay");
			if (!zoomOverlay) { 
				try {
					this.render();
					zoomOverlay = document.querySelector(".zoom-overlay");	
				} catch (err) {
					return 0;
				}
			}

			const zoomWidth = zoomOverlay.clientWidth;
			const zoomHeight = zoomOverlay.clientHeight;

  			let scrollLeft = left - zoomWidth / 2;
  			let scrollTop = top - zoomHeight / 2;
			if (scrollLeft < 0) { scrollLeft = 0; }
			if (scrollTop < 0) { scrollTop = 0; }

			let board = document.querySelector(".zoom-overlay .gameboard");	
			board.style.transition = "transform 0.5s ease";
			board.style.transform = `translate(-${scrollLeft}px, -${scrollTop}px)`;

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


        renderAtSpacekey(spacekey="") {

                this.visible = true;

		let s = this.mod.game.spaces[spacekey];
		this.renderAtCoordinates(s.top, s.left);

                return 0;

        }

	renderAtCoordinates(top=0, left=0) {

		this.render();
		let zoomOverlay = document.querySelector(".zoom-overlay");	

		const zoomWidth = zoomOverlay.clientWidth;
		const zoomHeight = zoomOverlay.clientHeight;

  		let scrollLeft = left - zoomWidth / 2;
  		let scrollTop = top - zoomHeight / 2;

		if (scrollLeft < 0) { scrollLeft = 0; }
		if (scrollTop < 0) { scrollTop = 0; }

		let board = document.querySelector(".zoom-overlay .gameboard");	
		// funky slide
		//board.style.transition = "transform 0.5s ease";
		//board.style.transform = `translate(-${scrollLeft}px, -${scrollTop}px)`;
		//board.style.top = "-" + scrollTop + "px";
		//board.style.left = "-" + scrollLeft + "px";
		board.style.transition = "";
		board.style.transform = `translate(-${scrollLeft}px, -${scrollTop}px)`;

		// remove status
		let status = document.querySelector('.zoom-overlay .status');
		status.style.display = 'none';
		let controls = document.querySelector('.zoom-overlay .controls');
		controls.style.display = 'none';

		this.attachEvents();

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
