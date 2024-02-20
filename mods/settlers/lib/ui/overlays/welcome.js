const SettlersWelcomeOverlayTemplate = require('./welcome.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');
const SettlersNotice = require('./notice');

class WelcomeOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
		this.secondWelcome = new SettlersNotice(this.app, this.mod);
	}

	render() {
		this.overlay.show(SettlersWelcomeOverlayTemplate(this), ()=> {
			if (this.mod.game.players.length == 2){
				this.secondWelcome.render();
			}
		});
		this.attachEvents();
	}

	attachEvents() {
		try {
			document.querySelector('.welcome_overlay').onclick = () => {
				this.overlay.hide();
				if (this.mod.game.players.length == 2){
					this.secondWelcome.render();
				}
			};
		} catch (err) {
			console.log(err);
		}
	}
}

module.exports = WelcomeOverlay;
