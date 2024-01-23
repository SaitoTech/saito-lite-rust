const ImperiumObjectivesOverlayTemplate = require('./objectives.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class ObjectivesOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
		this.overlay.clickToClose = true;
	}

	render(objectives = []) {
		//
		// show overlay
		//
		this.overlay.show(ImperiumObjectivesOverlayTemplate());
		this.overlay.setBackground(
			'/imperium/img/backgrounds/objectives-background.jpg',
			false
		); // background not dark

		for (let i in objectives) {
			this.app.browser.addElementToSelector(
				objectives[i].returnCardImage(),
				'.objectives-overlay-content'
			);
		}
	}
}

module.exports = ObjectivesOverlay;
