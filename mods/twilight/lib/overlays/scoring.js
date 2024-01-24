const ScoringTemplate = require('./scoring.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class ScoringOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.region = 'europe';
		this.overlay = new SaitoOverlay(app, mod);
	}

	render(region = 'europe', obj = null) {
		this.overlay.show(ScoringTemplate(region, obj));

		let cardimg = this.mod.returnCardImage(region);
		let qs = '.scoring-overlay .card';
		let qobj = document.querySelector(qs);

		if (qobj) {
			qobj.innerHTML = '';
			this.app.browser.addElementToSelector(cardimg, qs);
		}

		for (let i = 0; i < obj.bonus.length; i++) {
			let name = obj.bonus[i].name;
			let desc = obj.bonus[i].desc;
			let side = obj.bonus[i].side;
			let icon = obj.bonus[i].icon;

			this.app.browser.addElementToSelector(
				`
	    <div class="scoring-event">
	      <div class="scoring-event-name">${name}</div>
	      <div class="scoring-event-icon"><img src="${icon}" /></div>
	      <div class="scoring-event-desc">${desc}</div>
	    </div>
	  `,
				`.scoring-event-grid`
			);
		}

		this.attachEvents();
	}

	attachEvents() {}
}

module.exports = ScoringOverlay;
