const ReviewTemplate = require('./review.template');
const SaitoOverlay = require('./../../../lib/saito/ui/saito-overlay/saito-overlay');

class ReviewOverlay {
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
		this.overlay.show(ReviewTemplate(this.mod));

		// POPUP OLD CODE
alert("pre setup reinforcement lightbox");
		setup_reinforcement_lightbox();
alert("done setup reinforcement lightbox");
		// trigger review function directly now
		loadQuestion();
alert("done loadQuestion");

		this.attachEvents();
	}

	attachEvents() {}
}

module.exports = ReviewOverlay;
