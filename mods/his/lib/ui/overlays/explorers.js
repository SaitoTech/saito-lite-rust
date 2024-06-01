const ExplorersTemplate = require('./explorers.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class ExplorersOverlay {
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
		this.overlay.show(ExplorersTemplate());

		for (let key in his_self.explorers) {
			let unavailable = '';
			let exp = his_self.explorers[key];
			this.app.browser.addElementToSelector(
				`<div class="explorers-tile ${key}" data-key="${key}" data-id="${key}" style="background-image:url('${his_self.explorers[key].img}')"></div>`,
				'.explorers-overlay'
			);
		}


	        for (let i = 0; i < his_self.game.state.explorations.length; i++) {
		  let exp = his_self.game.state.explorations[i];
		  if (exp.explorer_lost == 1) {
		    let obj = document.querySelector(`.${exp.explorer}`);
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

module.exports = ExplorersOverlay;
