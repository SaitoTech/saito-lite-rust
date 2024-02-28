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
		this.proposal.terms = [];
		this.proposal.parties = [];
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
                //
                // pull GAME HUD over overlay
                //
                let overlay_zindex = parseInt(this.overlay.zIndex);
                if (document.querySelector('.hud')) {
                        document.querySelector('.hud').style.zIndex = overlay_zindex + 1;
                        this.mod.hud.zIndex = overlay_zindex + 1;
                }
        }
        pushHudUnderOverlay() {
                //
                // push GAME HUD under overlay
                //
                let overlay_zindex = parseInt(this.overlay.zIndex);
                if (document.querySelector('.hud')) {
                        document.querySelector('.hud').style.zIndex = overlay_zindex - 2;
                        this.mod.hud.zIndex = overlay_zindex - 2;
                }
        }


	hide() {
		this.overlay.hide();
		return;
	}




	render(faction="") {

          let his_self = this.mod;
	  let num = 0;
	  if (faction == "") { faction = this.faction; } else { this.faction = faction; }

	  if (faction != "" && !this.proposal.parties.includes(faction)) { this.proposal.parties.push(faction); }

	  this.overlay.show(DiplomacyProposeTemplate(this));
	  this.renderAllProposals(faction);

	  this.pushHudUnderOverlay();

	  document.querySelector(".diplomacy-propose-overlay").style.visibility = "visible";
  	  document.querySelector(".diplomacy-propose-overlay .buttons").style.visibility = "visible";

	  this.showMainMenu();

	  this.attachEvents(faction);

	}


	renderAddProposalMenu(faction) {

	  let his_self = this.mod;
	  let menu = this.mod.returnDiplomacyMenuOptions(this.mod.game.player, faction);

	  //
	  // hide the overlay
	  //
  	  document.querySelector(".diplomacy-propose-overlay").style.backgroundImage = "";
  	  document.querySelector(".diplomacy-propose-overlay .buttons").style.visibility = "hidden";

          //
          // duplicates code below
          //
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
		document.querySelectorAll(".diplomacy-propose-overlay .menu").innerHTML = "";
		document.querySelectorAll(".diplomacy-propose-overlay .help").innerHTML = "Please Continue Using Game HUD...";
		document.querySelectorAll(".diplomacy-propose-overlay .content").innerHTML = "";

		this.pullHudOverOverlay();

		let id = e.currentTarget.id;
		menu[id].fnct(his_self, faction, (terms) => {
		  for (let z = 0; z < terms.length; z++) {
		    let io = this.mod.returnDiplomacyImpulseOrder(faction);
	 	    for (let y = 0; y < io.length; y++) {
		      if (terms[z].substring(io[y]) && !this.proposal.parties.includes(io[y])) { this.proposal.parties.push(io[y]); }
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
	    document.querySelector(".content").innerHTML = proposals_html;
	  } else {
	    document.querySelector(".content").innerHTML = "You have no proposals...";
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

	  if (any_proposals) {
	    document.querySelector(".content").innerHTML = proposals_html;
	  } else {
	    document.querySelector(".content").innerHTML = "select option";;
	  }

	  this.showSubMenu();
	}



	attachEvents(faction="") {

//alert("proposals in attachEvents is: " + JSON.stringify(this.proposals));

	  //
	  // finish diplomacy stage
	  //
	  document.querySelector(".end").onclick = (e) => {
//alert("end");
	    this.mod.updateLog("NOTIFY\t"+this.mod.returnFactionName(faction)+" concludes diplomacy");
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
//alert("add"); 
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
//alert("also"); 
	    this.renderCurrentProposal();
	    this.renderAddProposalMenu(faction);
	  }

	  //
	  // submit
	  //
	  document.querySelector(".finish").onclick = (e) => {
//alert("finish"); 

	    this.proposals.push(this.proposal);
	    this.proposal = {};
	    this.proposal.terms = [];
	    this.proposal.parties = [];

	    this.render(faction);
	    this.showMainMenu();
	    this.renderAllProposals(faction);
	  }

	  //
	  // delete
	  //
	  document.querySelector(".delete").onclick = (e) => {
//alert("delete"); 
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

