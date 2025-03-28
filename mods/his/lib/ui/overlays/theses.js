const ThesesTemplate = require('./theses.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class ThesesOverlay {
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
			document.querySelector('.hud').style.zIndex = overlay_zindex - 3;
			this.mod.hud.zIndex = overlay_zindex - 3;
		}
	}

	remove() {
		this.visible = false;
		this.overlay.remove();
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
		let status = document.querySelector('.theses-overlay .status');
		status.style.display = 'none';
		let controls = document.querySelector('.theses-overlay .controls');
		controls.style.display = 'none';

		let gb2 = document.querySelector('.gameboard-clone');
		gb2.classList.remove('zoom-german');
		gb2.classList.remove('zoom-french');
		gb2.classList.remove('zoom-spanish');
		gb2.classList.remove('zoom-italian');
		gb2.classList.remove('zoom-english');
		gb2.classList.remove('zoom-ottoman');
		gb2.style.transform = `translate(-${percent_right}%, -${percent_down}%) scaleX(0.7) scaleY(0.7)`;

		return {
			percent_right : percent_right ,
			percent_down : percent_down ,
		}

	}

	render(language_zone = 'german') {
		this.pushHudUnderOverlay();

		//
		// if already visible, don't reload
		//
		if (this.visible == true) {
			if (document.querySelector('.theses_overlay')) {
				return;
			}
		}

		this.visible = true;
		this.overlay.show(ThesesTemplate());

		let dw = document.querySelector('.theses-overlay');
		let gb = document.querySelector('.gameboard');

		let gb2 = gb.cloneNode(true);
		gb2.removeAttribute('id');
		gb2.removeAttribute('style');
		gb2.classList.add('gameboard-clone');

		if (language_zone == 'german') {
			gb2.classList.add('zoom-german');
		}
		if (language_zone == 'english') {
			gb2.classList.add('zoom-english');
		}
		if (language_zone == 'french') {
			gb2.classList.add('zoom-french');
		}
		if (language_zone == 'spanish') {
			gb2.classList.add('zoom-spanish');
		}
		if (language_zone == 'italian') {
			gb2.classList.add('zoom-italian');
		}
		if (language_zone == 'ottoman') {
			gb2.classList.add('zoom-ottoman');
		}

		dw.appendChild(gb2);

		$('.gameboard-clone').draggable({});

		this.attachEvents();
	}

	attachEvents() {
		//
		// add tiles
		//
		for (let key in this.mod.spaces) {
			let qs = '.theses-overlay .gameboard .' + key;
			document.querySelector(qs).onclick = (e) => {
				let space_id = e.currentTarget.id;
				if (this.spaces_onclick_callback != null) {
					this.spaces_onclick_callback(space_id);
				} else {
					this.mod.displaySpaceDetailedView(space_id);
				}
			};
		}
		for (let key in this.mod.navalspaces) {
			let qs = '.theses-overlay .gameboard .' + key;
			document.querySelector(qs).onclick = (e) => {
				let space_id = e.currentTarget.id;
				if (this.spaces_onclick_callback != null) {
					this.spaces_onclick_callback(space_id);
				} else {
					this.mod.displaySpaceDetailedView(space_id);
				}
			};
		}
	}
}

module.exports = ThesesOverlay;
