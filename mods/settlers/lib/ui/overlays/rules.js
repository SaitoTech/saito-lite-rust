const SettlersRulesOverlayTemplate = require('./rules.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class RulesOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
	}

	render() {
		this.overlay.show(SettlersRulesOverlayTemplate(this, "saitoa"));

		this.attachEvents();
	}

	returnRules(){
		return SettlersRulesOverlayTemplate(this);
	}

	attachEvents() {}
}

module.exports = RulesOverlay;
