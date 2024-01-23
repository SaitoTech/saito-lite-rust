const ImperiumAgendaOverlayTemplate = require('./agenda.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class AgendaOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
	}

	render(agenda = []) {
		//
		// show overlay
		//
		this.overlay.show(ImperiumAgendaOverlayTemplate());
		this.overlay.setBackground(
			'/imperium/img/backgrounds/agenda-background.jpg'
		);

		for (let i in agenda) {
			this.app.browser.addElementToSelector(
				agenda[i].returnCardImage(),
				'.agenda-overlay'
			);
		}
	}
}

module.exports = AgendaOverlay;
