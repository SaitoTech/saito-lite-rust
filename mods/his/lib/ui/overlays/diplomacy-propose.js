const DiplomacyProposeTemplate = require('./diplomacy-propose.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class DiplomacyProposeOverlay {

	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
		this.faction = "";
		this.proposal = {};
		this.proposal.terms = [];
		this.proposal.parties = [];
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
	      let proposal_html = "PROPOSAL #" + num + ": ";
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

	  document.querySelectorAll(".submenu").forEach((el) => {
	    el.style.display = "none";
	  });
	  document.querySelectorAll(".menu").innerHTML = proposals_html;

	}

	attachEvents(faction="") {

	  //
	  // finish diplomacy stage
	  //
	  document.querySelector(".end").onclick = (e) => {
	    this.mod.updateLog("NOTIFY\t"+this.returnFactionName(faction)+" concludes diplomacy");
	    this.mod.endTurn();
	  }

	  //
	  // start new proposal
	  //
	  document.querySelector(".add").onclick = (e) => {

	    alert("adding!");
	    this.terms = [];
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
	    html += '</ul>';

	    document.querySelector(".diplomacy-propose-overlay .content").innerHTML = html;

	    document.querySelectorAll(".mainmenu").forEach((el) => {
	      el.style.display = "none";
	    });
	    document.querySelectorAll(".submenu").forEach((el) => {
	      el.style.display = "block";
	    });

	  }	


	  //
	  // add condition to proposal
	  //
	  document.querySelector(".also").onclick = (e) => {
	    document.querySelector(".add").click();
	  }

	  //
	  // finish
	  //
	  document.querySelector(".finish").onclick = (e) => {
alert("FINISH");
	  }

	}

}

module.exports = DiplomacyProposeOverlay;

