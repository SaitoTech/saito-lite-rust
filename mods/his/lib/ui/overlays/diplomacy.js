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
		this.active_proposal = -1;
	        this.is_visible = false;
		this.proposals = [];
		this.proposal = {};
		this.proposal.confirms = [];
		this.proposal.terms = [];
		this.proposal.parties = [];
		this.proposal.proposer = "";
		this.proposal.target = "";
                this.game_menu_zindex = 0;	
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


        purgeProposals() {
                this.proposals = [];
                this.proposal = {};
                this.proposal.confirms = [];
                this.proposal.terms = [];
                this.proposal.parties = [];
                this.proposal.proposer = "";
		this.proposal.target = "";
        }

	

	hide() {
		this.purgeProposals();
	        this.is_visible = false;
		this.overlay.hide();
          	let gm = document.querySelector("#saito-header");
		if (this.game_menu_zindex > 0) {
          	  if (gm) {
          	    gm.style.zIndex = this.game_menu_zindex;
		  }
	        }
		return;
	}

	render(faction="") {

          let his_self = this.mod;
	  this.is_visible = true;
	  let num = 0;
	  this.active_proposal = -1;

          let gm = document.querySelector("#saito-header");
          if (gm) {
            this.game_menu_zindex = gm.style.zIndex;
            gm.style.zIndex = 999;
          }


	  if (faction == "") { faction = this.faction; } else { this.faction = faction; }
	  if (faction != "" && !this.proposal.parties.includes(faction)) { this.proposal.parties.push(faction); }

	  this.overlay.show(DiplomacyTemplate(this, faction));
	  this.renderAllProposals(faction);

	  let obj = document.querySelector(".diplomacy-overlay");
	  if (obj) { obj.style.flexWrap = "nowrap"; }
	  if (obj) { obj.style.background = ""; }

	  if (faction == "hapsburg" || faction == "england" || faction == "france" || faction == "papacy" || faction == "protestants") {
	    document.querySelector(".controls2 ul li.hapsburg").remove();
	  }
	  if (faction == "england" || faction == "france" || faction == "papacy" || faction == "protestants") {
	    document.querySelector(".controls2 ul li.england").remove();
	  }
	  if (faction == "france" || faction == "papacy" || faction == "protestants") {
	    document.querySelector(".controls2 ul li.france").remove();
	  }
	  if (faction == "papacy" || faction == "protestants") {
	    document.querySelector(".controls2 ul li.papacy").remove();
	  }

	  this.pushHudUnderOverlay();

	  this.overlay.show();

	  this.attachEvents(faction);

	}


	attachEvents(faction="") {

	  //
	  // delete proposals
	  //
	  document.querySelectorAll(".proposal-close").forEach((el) => {
	    el.onclick = (e) => {
	      this.proposals.splice(e.currentTarget.id, 1);
	      this.render(faction);
	    }
	  });

	  //

	  //
	  // add terms to existing proposal
	  //
	  document.querySelectorAll(".proposal-add-term").forEach((el) => {
	    el.onclick = (e) => {
	      this.proposal.terms = this.proposals[e.currentTarget.id].terms;
	      this.proposal.target = this.proposals[e.currentTarget.id].target;
	      this.proposals.splice(e.currentTarget.id, 1);
	      this.renderAddProposalMenu(faction, this.proposal.target);
	    }
	  });

	  //
	  // finish diplomacy stage
	  //
	  if (document.querySelector(".submit")) {
	    document.querySelector(".submit").onclick = (e) => {
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
	      this.createNewProposal(faction, "hapsburg");
	    }
	  }

	  if (document.querySelector(".option.protestant")) {
	    document.querySelector(".option.protestant").onclick = (e) => {
	      this.faction_under_offer = "protestant";
	      this.createNewProposal(faction, "protestant");
	    }
	  }

	  if (document.querySelector(".option.papacy")) {
	    document.querySelector(".option.papacy").onclick = (e) => {
	      this.faction_under_offer = "papacy";
	      this.createNewProposal(faction, "papacy");
	    }
	  }

	  if (document.querySelector(".option.england")) {
	    document.querySelector(".option.england").onclick = (e) => {
	      this.faction_under_offer = "england";
	      this.createNewProposal(faction, "england");
	    }
	  }

	  if (document.querySelector(".option.france")) {
	    document.querySelector(".option.france").onclick = (e) => {
	      this.faction_under_offer = "france";
	      this.createNewProposal(faction, "france");
	    }
	  }

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
	    proposals_html += '<li class="proposal-group-level">';
	    proposals_html += `<div><div class="proposal-target-faction">Offer to ${this.mod.returnFactionName(this.proposals[i].target)}<div class="proposal-close" id="${i}">X</div></div><ul>`;
	    let p = this.proposals[i];
	    let t = this.mod.convertTermsToText(p.terms);
	    for (let z = 0; z < t.length; z++) {
	      proposals_html += '<li class="proposal-term-level">' + t[z] + '</li>';
	    }
	    proposals_html += `<li class="proposal-term-level proposal-add-term" id="${i}">add new term</li>`;
	    proposals_html += '</ul></div></li>';
          }
	  proposals_html += '</ol>';
	  if (any_proposals) {
	    document.querySelector(".diplomacy-overlay .right .proposals").innerHTML = proposals_html;

	    try {
	      let sobj = document.querySelector(".submit");
	      if (sobj) { 
	        sobj.innerHTML = "submit offers";
	      }
	    } catch (err) {

	    }

	  }


	}

	createNewProposal(faction="", target="") {
	    this.terms = [];
	    this.proposal.target = target;
	    this.renderAddProposalMenu(faction, target);
	}

	submitProposals() {
          for (let z = 0; z < this.proposals.length; z++) {
            this.mod.addMove("diplomacy_submit_proposal\t"+JSON.stringify(this.proposals[z]));
          }
          this.mod.endTurn();
          this.hide();
	}

	renderAddProposalMenu(faction, target="") {

	  let his_self = this.mod;

	  let obj = document.querySelector(".diplomacy-overlay");
	  if (obj) { obj.style.flexWrap = "wrap"; }
	  if (obj) { obj.style.background = "transparent"; }

	  //
	  // overlay gets menu
	  //
	  let menu = this.mod.returnDiplomacyMenuOptions(this.mod.game.player, faction);
          let html = "";
          for (let i = 0; i < menu.length; i++) {
            if (menu[i].check(his_self, his_self.game.player, faction, target)) {
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
		  // add proposal to stack and reclaim
		  //
	    	  this.proposal.proposer = this.faction;
            	  this.proposals.push(this.proposal);
            	  this.proposal = {};
            	  this.proposal.terms = [];
            	  this.proposal.parties = [];
                  this.proposal.proposer = this.faction;

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

