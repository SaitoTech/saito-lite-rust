const SettlersStatsOverlayTemplate = require('./stats.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class StatsOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
		this.dice_count = [];
	}

	render(winner = "") {
		this.overlay.show(SettlersStatsOverlayTemplate(this, winner));
		this.attachEvents();
	}

	attachEvents() {
		Array.from(document.querySelectorAll(".overlay-tab")).forEach(tab => {
			tab.onclick = (e) => {
				if (e.currentTarget.classList.contains("active-tab")){
					return;
				}

				$(".active-tab").removeClass("active-tab");
				$(".active-page").removeClass("active-page");

				e.currentTarget.classList.add("active-tab");

				let id = e.currentTarget.id.split("-")[0];

				$(`#${id}-page`).addClass("active-page");
			}
		})
	}
}

module.exports = StatsOverlay;
