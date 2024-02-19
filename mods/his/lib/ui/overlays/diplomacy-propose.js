const DiplomacyProposeTemplate = require('./diplomacy-propose.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class DiplomacyProposeOverlay {

	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
		this.faction = "";
	}

	hide() {
		this.overlay.hide();
		return;
	}

	render(faction="") {

          let his_self = obj.mod;
	  let num = 0;
	  this.faction = faction;

	  let proposals_html = '<ul>';   
          for (let i = 0; i < his_self.game.state.diplomacy.length; i++) {
            if (his_self.game.state.diplomacy[i].parties.includes(faction)) {
	      let p = his_self.game.state.diplomacy[i];
	      let t = his_self.convertTermsToText(p);
	      let proposal_html = 'PROPOSAL #" + num + ": ";
	      for (let z = 0; z < t.length; z++) {
		if (z > 0) { proposal_html += ' / '; }
		proposal_html += t[z];
	      };
	      proposals_html += `<li>${proposal_html}</li>`;
	    }
          }
	  proposals_html += '</ul>';

	  this.overlay.show(DiplomacyProposeTemplate(this, proposals_html));
    	  this.attachEvents(faction);
	}

	attachEvents(faction="") {

	  let menu = this.returnDiplomacyMenuOptions(this.mod.game.player, faction);

          //
          // duplicates code below
          //
          let html = `<ul>`;
          for (let i = 0; i < menu.length; i++) {
            if (menu[i].check(this, this.game.player, faction)) {
              for (let z = 0; z < menu[i].factions.length; z++) {
                if (menu[i].factions[z] === faction) {
                  html    += `<li class="card" id="${i}">${menu[i].name} [${menu[i].cost[z]} ops]</li>`;
		  z = menu[i].factions.length+1;
                }
              }
            }
          }

	}

}

module.exports = DiplomacyProposeOverlay;

