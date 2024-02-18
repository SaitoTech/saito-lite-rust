const DiplomacyConfirmTemplate = require('./diplomacy_confirm.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class DiplomacyConfirmOverlay {

	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
	}

	hide() {
		this.overlay.hide();
		return;
	}

	render(proposal_idx=0) {
	  this.overlay.show(DiplomacyConfirmTemplate(this, proposal_idx));
    	  this.attachEvents(proposal_idx=0);
	}

	attachEvents(proposal_idx=0) {

          if (document.querySelector('.accept')) {
            document.querySelector('.accept').click = (e) => {
              this.hide();
	      this.mod.addMove("diplomacy_accept\t"+protposal_idx);
	      this.mod.endTurn();
            };
          }

          if (document.querySelector('.reject')) {
            document.querySelector('.reject').click = (e) => {
              this.hide();
	      this.mod.addMove("diplomacy_reject\t"+protposal_idx);
	      this.mod.endTurn();
            };
          }

	}

}

module.exports = DiplomacyConfirmOverlay;

