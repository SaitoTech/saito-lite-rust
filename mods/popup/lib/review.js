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

		loadQuestion();

		this.attachEvents();

	}

	attachEvents() {

        	document.querySelectorAll('.option').forEach((el) => {
			el.bind('mouseover', function () {
        	        	$(this).addClass('option_hover');
        		});
		});

        	document.querySelectorAll('.option').forEach((el) => {
			el.bind('mouseout', function () {
        	        	$(this).addClass('option_hover');
        		});
		});

	}

}

module.exports = ReviewOverlay;
