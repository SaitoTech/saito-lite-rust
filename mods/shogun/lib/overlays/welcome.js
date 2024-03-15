const ShogunWelcomeOverlayTemplate = require('./welcome.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class WelcomeOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false, true, true);
	}

	render() {
		this.overlay.show(ShogunWelcomeOverlayTemplate(this.mod), ()=> {
			this.mod.game.state.welcome = 1;
			this.mod.restartQueue();
		});
	}

	attachEvents() {
	}
}

module.exports = WelcomeOverlay;
