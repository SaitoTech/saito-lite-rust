const DiplomacyProposeTemplate = require('./diplomacy-propose.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class DiplomacyProposeOverlay {

	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
		this.overlay.clickBackdropToClose = false;
		this.faction = "";
		this.proposals = [];
		this.proposal = {};
		this.proposal.confirms = [];
		this.proposal.terms = [];
		this.proposal.parties = [];
		this.proposal.proposer = "";
		this.game_menu_zindex = 0;
	}

	purgeProposals() {
		this.proposals = [];
		this.proposal = {};
		this.proposal.confirms = [];
		this.proposal.terms = [];
		this.proposal.parties = [];
		this.proposal.proposer = "";
	}

        updateInstructions(msg="") {
          try {
            document.querySelector(".diplomacy-propose-overlay .help").innerHTML = msg;
          } catch (err) {
          }
        }
        
	showSubMenu() {
	  document.querySelectorAll(".mainmenu").forEach((el) => { el.style.display = "none"; });
	  document.querySelectorAll(".submenu").forEach((el) => { el.style.display = "block"; });
	}

	showMainMenu() {
	  document.querySelectorAll(".mainmenu").forEach((el) => { el.style.display = "block"; });
	  document.querySelectorAll(".submenu").forEach((el) => { el.style.display = "none"; });
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
		this.purgeProposals();
		this.overlay.hide();
          	let gm = document.querySelector("#saito-header");
          	if (gm) {
	        	gm.style.zIndex = this.game_menu_zindex;
		}
		return;
	}

	render(faction="") {

	  let gm = document.querySelector("#saito-header");
	  if (gm) {
	    this.game_menu_zindex = gm.style.zIndex;
	    gm.style.zIndex = 999;
	  }

          let his_self = this.mod;
	  let num = 0;
	  if (faction == "") { faction = this.faction; } else { this.faction = faction; }

	  if (faction != "" && !this.proposal.parties.includes(faction)) { this.proposal.parties.push(faction); }

	  this.overlay.show(DiplomacyProposeTemplate(this));
	  this.renderAllProposals(faction);

	  this.pushHudUnderOverlay();

	  this.overlay.show();
	  //document.querySelector(".diplomacy-propose-overlay").style.visibility = "visible";
  	  //document.querySelector(".diplomacy-propose-overlay .buttons").style.visibility = "visible";
  	  //document.querySelector(".diplomacy-propose-overlay").style.display = "block";

	  this.showMainMenu();

	  this.attachEvents(faction);

	}


	renderAddProposalMenu(faction) {

	  let his_self = this.mod;
	  let menu = this.mod.returnDiplomacyMenuOptions(this.mod.game.player, faction);

  	  document.querySelector(".diplomacy-propose-overlay").style.backgroundImage = "";
  	  document.querySelector(".diplomacy-propose-overlay .buttons").style.visibility = "hidden";

          let html = "";
          for (let i = 0; i < menu.length; i++) {
            if (menu[i].check(his_self, his_self.game.player, faction)) {
	      html += this.returnMenuHTML(menu[i].name, menu[i].img, i);
	    }
	  }

	  document.querySelector(".diplomacy-propose-overlay .menu").innerHTML = html;

          for (let i = 0; i < menu.length; i++) {
            let obj = document.querySelector(`.menu-option-container${i}`);
            if (obj) {
	      obj.onclick = (e) => {

		// remove click event from all
		this.overlay.hide();

		this.pullHudOverOverlay();

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
		  this.render(faction);
		  this.renderCurrentProposal();
		});
	      }
	    }
	  }
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
	    this.updateInstructions(`${this.mod.returnFactionName(faction)} - Diplomacy Stage - All Proposals`);
	    document.querySelector(".diplomacy-propose-overlay .content").innerHTML = proposals_html;
	    try {
	      document.querySelector(".mainmenu.add").innerHTML = "create new proposal";
	      document.querySelector(".mainmenu.end").innerHTML = "submit and see if they accept";
	    } catch (err) {
	      console.log(JSON.stringify(err));
	    }
	  } else {
	    this.updateInstructions(`${this.mod.returnFactionName(faction)} - Diplomacy Stage`);
	    document.querySelector(".content").innerHTML = "propose a diplomatic agreement?";
	  }

	}

	renderCurrentProposal() {

	  let proposals_html = '<ul>';
	  let t = this.mod.convertTermsToText(this.proposal.terms);
	  let any_proposals = false;
	  for (let z = 0; z < t.length; z++) {
	    any_proposals = true;
	    proposals_html += '<li>' + t[z] + '</li>';
	  }
	  proposals_html += '</ul>';
	  this.updateInstructions("Creating New Proposal");

	  if (any_proposals) {
	    document.querySelector(".diplomacy-propose-overlay .help").innerHTML = "your proposal consists of the following:";
	    document.querySelector(".diplomacy-propose-overlay .content").innerHTML = proposals_html;
	    document.querySelector(".diplomacy-propose-overlay .content").style.display = "block";
	  } else {
	    document.querySelector(".diplomacy-propose-overlay .help").innerHTML = "add term to your new proposal";
	    document.querySelector(".content").style.display = "none";
	  }

	  this.showSubMenu();
	}



	attachEvents(faction="") {

	  //
	  // finish diplomacy stage
	  //
	  document.querySelector(".end").onclick = (e) => {
	    for (let z = 0; z < this.proposals.length; z++) {
	      this.mod.addMove("diplomacy_submit_proposal\t"+JSON.stringify(this.proposals[z]));
	    }
	    this.mod.endTurn();
	    this.hide();
	  }

	  //
	  // start new proposal
	  //
	  document.querySelector(".add").onclick = (e) => {
 	    document.querySelector(".diplomacy-propose-overlay .buttons").style.visibility = "hidden";
	    document.querySelector(".content").innerHTML = "";
	    this.terms = [];
	    this.renderAddProposalMenu(faction);
	    this.renderCurrentProposal();
	  };

	  //
	  // add condition to proposal
	  //
	  document.querySelector(".also").onclick = (e) => {
	    this.renderCurrentProposal();
	    this.renderAddProposalMenu(faction);
	  }

	  //
	  // submit
	  //
	  document.querySelector(".finish").onclick = (e) => {

	    this.proposal.proposer = this.faction;
	    this.proposals.push(this.proposal);
	    this.proposal = {};
	    this.proposal.terms = [];
	    this.proposal.parties = [];
	    this.proposal.proposer = this.faction;

	    this.render(faction);
	    this.showMainMenu();
	    this.renderAllProposals(faction);
	  }

	  //
	  // delete
	  //
	  document.querySelector(".delete").onclick = (e) => {

	    this.proposal = {};
	    this.proposal.terms = [];
	    this.proposal.parties = [];
	    this.proposal.proposer = this.faction;

	    this.render(faction);
	    this.showMainMenu();
	    this.renderAllProposals(faction);
	  }

	  return;

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

module.exports = DiplomacyProposeOverlay;

