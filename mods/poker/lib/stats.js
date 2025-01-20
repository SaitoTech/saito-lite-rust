const StatsOverlayTemplate = require('./stats.template');
const SaitoOverlay = require('./../../../lib/saito/ui/saito-overlay/saito-overlay');

class StatsOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, true, false);
		this.overlay.nonBlocking = true;
		this.rendered = false;
		this.eventsAttached = false;

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

	toggle(){
		if (this.rendered){
			this.overlay.close();
		}else{
			this.render();
		}
	}

	render() {
		this.overlay.show(StatsOverlayTemplate(this.mod, this.tracked_stats), () => { this.rendered = false; });
		this.rendered = true;
		if (!this.eventsAttached){
			this.attachEvents();	
		}
		
	}

	attachEvents() {
		this.app.browser.makeDraggable(`saito-overlay${this.overlay.ordinal}`, '', true);
		this.eventsAttached = true;
	}




}

module.exports = StatsOverlay;
