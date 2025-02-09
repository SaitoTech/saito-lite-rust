const SettlersHudTemplate = require('./hud.template');


class SettlersHud {

	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
	}


	render(reset = true) {

		let hud = this.mod.hud;

                hud.minWidth = 600;
                hud.maxWidth = 1;
                hud.render();

		try {

	                document.querySelector('#hud-body')?.classList.add('saitoa');
        	        $('.hud-body .controls').appendTo('#hud');

                	hud.updateControls(SettlersHudTemplate());
                	this.mod.updateControls();

		} catch (err) {

		}

		this.attachEvents();
	}

	attachEvents() {
	}
}

module.exports = SettlersHud;

