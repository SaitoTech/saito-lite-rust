const ThesesTemplate = require('./theses.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class ThesesOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.visible = false;
		this.overlay = new SaitoOverlay(app, mod);
	}

	hide() {
		this.visible = false;
		this.overlay.hide();
	}

	render() {
		this.visible = true;
		this.overlay.show(ThesesTemplate());

		let dw = document.querySelector('.theses-overlay');
		let gb = document.querySelector('.gameboard');
		let gb2 = gb.cloneNode(true);
		gb2.removeAttribute('id');
		gb2.removeAttribute('style');
		gb2.classList.add('gameboard-clone');

		dw.appendChild(gb2);

		let obj = document.querySelector('.gameboard-clone');
		obj.style.position = '';
		obj.style.transformOrigin = '';
		obj.style.transform = '';
		obj.style.top = '0px !important';
		obj.style.bottom = '';
		obj.style.left = '0px !important';
		obj.style.right = '';

		$('.gameboard-clone').draggable({});

		this.attachEvents();
	}

	attachEvents() {}
}

module.exports = ThesesOverlay;
