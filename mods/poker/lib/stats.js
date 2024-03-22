const StatsOverlayTemplate = require('./stats.template');
const SaitoOverlay = require('./../../../lib/saito/ui/saito-overlay/saito-overlay');

class StatsOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);

		this.tracked_stats = [
			{
				code: "hands",
				readable: "Hands Played",
			},
			{
				code: "wins",
				readable: "Hands Won",
				percentage: "hands",
			},
			{
				code: "folds",
				readable: "Hands Folded",
				percentage: "hands",
			},
			{
				code: "showdowns",
				readable: "Hands Completed",
				percentage: "hands",
			},
			{
				code: "walks",
				readable: "Walks",
				further: "All players abandoned the hand",
			},
			{
				code: "vpip",
				readable: "VPIP",
				further: "Voluntarily put money in (discounts walks)",
				percentage: true,
			},
		];
	}

	render() {
		this.overlay.show(StatsOverlayTemplate(this.mod, this.tracked_stats));
		this.attachEvents();
	}

	attachEvents() {}




}

module.exports = StatsOverlay;
