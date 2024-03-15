const AttackOverlayTemplate = require('./attack.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class AttackOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
	}

	render(title = '', cards = []) {
		this.overlay.show(AttackOverlayTemplate());

		let details = '';

		if (text) {
			details += `<div class="overlay-msg">${text}</div>`;
		}
		for (let i = 0; i < cards.length; i++) {
			details += `<div class="overlay-img aoc">${this.mod.returnCardImage(
				cards[i]
			)}</div>`;
		}
		document.querySelector('.attack_details').innerHTML = details;

		this.attachEvents();
	}

	attachEvents() {}
}

module.exports = AttackOverlay;
