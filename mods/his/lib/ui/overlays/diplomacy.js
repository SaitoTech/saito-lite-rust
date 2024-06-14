const DiplomacyTemplate = require('./diplomacy.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class DiplomacyOverlay {

	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
		this.overlay.clickBackdropToClose = false;
		this.faction = "";
		this.faction_under_offer = "";
		this.proposals = [];
		this.proposal = {};
		this.proposal.confirms = [];
		this.proposal.terms = [];
		this.proposal.parties = [];
		this.proposal.proposer = "";
	
	}

        pullHudOverOverlay() {
                let overlay_zindex = parseInt(this.overlay.zIndex);
                if (document.querySelector('.hud')) {
                        document.querySelector('.hud').style.zIndex = overlay_zindex + 1;
                        this.mod.hud.zIndex = overlay_zindex + 1;
                }
        }
        pushHudUnderOverlay() {
                let overlay_zindex = parseInt(this.overlay.zIndex);
                if (document.querySelector('.hud')) {
                        document.querySelector('.hud').style.zIndex = overlay_zindex - 2;
                        this.mod.hud.zIndex = overlay_zindex - 2;
                }
        }

	hide() {

		this.proposals = [];
		this.proposal = {};
		this.proposal.confirms = [];
		this.proposal.terms = [];
		this.proposal.parties = [];
		this.proposal.proposer = "";

		this.overlay.hide();
		return;
	}

	render(faction="") {

          let his_self = this.mod;
	  let num = 0;

	  if (faction == "") { faction = this.faction; } else { this.faction = faction; }
	  if (faction != "" && !this.proposal.parties.includes(faction)) { this.proposal.parties.push(faction); }

	  this.overlay.show(DiplomacyTemplate(this));
	  this.renderAllProposals(faction);

	  let obj = document.querySelector(".diplomacy-overlay");
	  if (obj) { obj.style.flexWrap = "nowrap"; }

	  this.pushHudUnderOverlay();

	  this.overlay.show();

	  this.attachEvents(faction);

	}


	attachEvents(faction="") {

	  //
	  // finish diplomacy stage
	  //
	  if (document.querySelector(".submit")) {
	    document.querySelector(".submit").onclick = (e) => {
	      this.mod.updateLog(this.mod.returnFactionName(faction)+" concludes diplomacy");
	      for (let z = 0; z < this.proposals.length; z++) {
	        this.mod.addMove("diplomacy_submit_proposal\t"+JSON.stringify(this.proposals[z]));
	      }
	      this.mod.endTurn();
	      this.hide();
	    }
	  }


	  if (document.querySelector(".option.hapsburg")) {
	    document.querySelector(".option.hapsburg").onclick = (e) => {
	      this.faction_under_offer = "hapsburg";
	      this.createNewProposal(faction);
	    }
	  }

	  if (document.querySelector(".option.protestant")) {
	    document.querySelector(".option.protestant").onclick = (e) => {
	      this.faction_under_offer = "protestant";
	      this.createNewProposal(faction);
	    }
	  }

	  if (document.querySelector(".option.papacy")) {
	    document.querySelector(".option.papacy").onclick = (e) => {
	      this.faction_under_offer = "papacy";
	      this.createNewProposal(faction);
	    }
	  }

	  if (document.querySelector(".option.england")) {
	    document.querySelector(".option.england").onclick = (e) => {
	      this.faction_under_offer = "england";
	      this.createNewProposal(faction);
	    }
	  }

	  if (document.querySelector(".option.france")) {
	    document.querySelector(".option.france").onclick = (e) => {
	      this.faction_under_offer = "france";
	      this.createNewProposal(faction);
	    }
	  }


	  //
	  // add condition to proposal
	  //
//	  document.querySelector(".also").onclick = (e) => {
//	    this.renderCurrentProposal();
//	    this.renderAddProposalMenu(faction);
//	  }

	  //
	  // submit
	  //
	  document.querySelector(".submit").onclick = (e) => {
	    this.submitProposals();
	  }

	  return;

	}


	renderAllProposals(faction="") {
	  let any_proposals = false;
	  let proposals_html = "<ol>";
          for (let i = 0; i < this.proposals.length; i++) {
	    any_proposals = true;
	    proposals_html += '<li><ul>';
	    let p = this.proposals[i];
	    let t = this.mod.convertTermsToText(p.terms);
	    for (let z = 0; z < t.length; z++) {
	      proposals_html += '<li>' + t[z] + '</li>';
	    }
	    proposals_html += '</ul></li>';
          }
	  proposals_html += '</ol>';
	  if (any_proposals) {
	    document.querySelector(".diplomacy-overlay .right .proposals").innerHTML = proposals_html;
	  }
	}

	createNewProposal(faction="") {
	    this.terms = [];
	    this.renderAddProposalMenu(faction);
	}


	submitProposals() {
            this.proposal.proposer = this.faction;
            this.proposals.push(this.proposal);
            this.proposal = {};
            this.proposal.terms = [];
            this.proposal.parties = [];
            this.proposal.proposer = this.faction;
	}


	renderAddProposalMenu(faction) {

	  let his_self = this.mod;

	  let obj = document.querySelector(".diplomacy-overlay");
	  if (obj) { obj.style.flexWrap = "wrap"; }

	  //
	  // overlay gets menu
	  //
	  let menu = this.mod.returnDiplomacyMenuOptions(this.mod.game.player, faction);
          let html = "";
          for (let i = 0; i < menu.length; i++) {
            if (menu[i].check(his_self, his_self.game.player, faction)) {
	      html += this.returnMenuHTML(menu[i].name, menu[i].img, i);
	    }
	  }
	  document.querySelector(".diplomacy-overlay").innerHTML = html;

	  //
	  // attach interactivity
	  //
          for (let i = 0; i < menu.length; i++) {
            let obj = document.querySelector(`.menu-option-container${i}`);
            if (obj) {
	      obj.onclick = (e) => {

		//
		// hide in overlay function to avoid purging proposals
		//
		this.overlay.hide();
		this.pullHudOverOverlay();

		//
		// manipulate proposal list
		//
		let id = e.currentTarget.id;
		menu[id].fnct(his_self, faction, (terms) => {
		  for (let z = 0; z < terms.length; z++) {
		    let io = this.mod.returnDiplomacyImpulseOrder(faction);
	 	    for (let y = 0; y < io.length; y++) {
		      if (terms[z].indexOf(io[y]) > -1 && !this.proposal.parties.includes(io[y])) { this.proposal.parties.push(io[y]); }
		      if (terms[z].indexOf("marital") > -1 && !this.proposal.parties.includes("papacy") && io[y] == "papacy") { this.proposal.parties.push("papacy"); }
		      if (terms[z].indexOf("marriage") > -1 && !this.proposal.parties.includes("papacy") && io[y] == "papacy") { this.proposal.parties.push("papacy"); }
		    }
		    this.proposal.terms.push(terms[z]);
		  }

		  //
		  // and re-render
		  //
		  this.render(faction);

		});
	      }
	    }
	  }
	}


        returnMenuHTML(name="", img="", idx, active_option="active card") {
          return `
              <div id="${idx}" class="menu-option-container${idx} menu-option-container ${active_option}">
                <div class="menu-option-image">
                  <img src="/his/img/backgrounds/diplomacy/${img}" />
                </div>
                <div class="menu-option-title">${name}</div>
              </div>
          `;
        }


}

module.exports = DiplomacyOverlay;

