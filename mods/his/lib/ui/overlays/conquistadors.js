const ConquistadorsTemplate = require('./conquistadors.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class ConquistadorsOverlay {
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

	render(faction = '') {

		let his_self = this.mod;
		this.visible = true;
		this.overlay.show(ConquistadorsTemplate());

		for (let key in his_self.conquistadors) {
			let unavailable = '';
			let exp = his_self.conquistadors[key];
			this.app.browser.addElementToSelector(
				`<div class="conquistadors-tile ${key}" data-key="${key}" data-id="${key}" style="background-image:url('${his_self.conquistadors[key].img}')"></div>`,
				'.conquistadors-overlay'
			);
		}


	        for (let i = 0; i < his_self.game.state.conquests.length; i++) {
		  let con = his_self.game.state.conquests[i];
		  if (con.conquistador_lost == 1) {
		    let obj = document.querySelector(`.${con.conquistador}`);
		    if (obj) {
		      obj.classList.add('opaque');
		    }
		  }
		}

		this.attachEvents();
	}

	attachEvents() {
	}

}

module.exports = ConquistadorsOverlay;
