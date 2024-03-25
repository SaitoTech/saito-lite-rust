const StatsOverlayTemplate = require('./stats.template');
const SaitoOverlay = require('./../../../lib/saito/ui/saito-overlay/saito-overlay');

class StatsOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);

		this.tracked_stats = [
			{
				code: "vpip",
				readable: "VPIP",
				further: "Voluntarily put money in (discounts walks)",
				percentage: "adjusted",
			},
			{
				code: "wins",
				readable: "Hands Won",
				percentage: true,
			},
			{
				code: "folds",
				readable: "Hands Folded",
				percentage: true,
			},
			{
				code: "showdowns",
				readable: "Hands Completed",
				percentage: true,
			},
			{
				code: "walks",
				readable: "Walks",
				further: "All players abandoned the hand",
			},
			{
				code: "hands",
				readable: "Hands Played",
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
