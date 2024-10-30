const DiplomacyConfirmTemplate = require('./diplomacy-confirm.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class DiplomacyConfirmOverlay {

	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
		this.overlay.clickBackdropToClose = false;
		this.faction = "";
		this.proposal_idx = 0;
	}

	hide() {
		this.overlay.hide();
		return;
	}

	updateInstructions(msg="") {
	  try {
	    document.querySelector(".diplomacy-confirm-overlay .help").innerHTML = msg;
	  } catch (err) {
	  }
	}

	render(faction, proposal_idx=0) {
	  let proposal = this.mod.game.state.diplomacy[proposal_idx];
	  this.faction = faction;
	  this.overlay.show(DiplomacyConfirmTemplate(this, proposal, proposal_idx, faction));
	  // and hide winter
	  this.mod.winter_overlay.hide();
    	  this.attachEvents(faction, proposal_idx);
	}

	attachEvents(faction, proposal_idx=0) {

          if (document.querySelector('.accept')) {
            document.querySelector('.accept').onclick = (e) => {
             this.hide();
	      this.mod.addMove("diplomacy_accept\t"+this.faction+"\t"+proposal_idx);
	      this.mod.endTurn();
            };
          }

          if (document.querySelector('.reject')) {
            document.querySelector('.reject').onclick = (e) => {
              this.hide();
	      this.mod.addMove("diplomacy_reject\t"+this.faction+"\t"+proposal_idx);
	      this.mod.endTurn();
            };
          }

	}

}

module.exports = DiplomacyConfirmOverlay;

