const MarriageTemplate = require('./marriage.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class MarriageOverlay {

	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.visible = false;
		this.overlay = new SaitoOverlay(app, mod);
		this.selected = [];
		this.bonus = 0;
		this.roll = 0;
	}

	hide() {
		this.visible = false;
		this.overlay.hide();
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

	renderApproveDivorce() {

		let his_self = this.mod;

		this.render();

		document.querySelector(".marriage-overlay .help").innerHTML = "Annulling Henry VIII's Marriage prevents Papal-Hapsburg Alliance for one turn...";

		this.app.browser.addElementToSelector('<div class="status"></div>', ".marriage-overlay");
		this.app.browser.addElementToSelector('<div class="controls"></div>', ".marriage-overlay");
	
            	let msg = "Approve Henry VIII's Divorce?";
            	let html = '<ul>';
            	html += '<li class="option" id="approve">approve divorce</li>';
            	html += '<li class="option" id="disapprove">do not approve</li>';
            	html += '</ul>';

            	his_self.updateStatusWithOptions(msg, html);

                $('.option').off();
                $('.option').on('click', function () {

                  let action = $(this).attr("id");

                  if (action === "approve") {
		    his_self.addMove("advance_henry_viii_marital_status");
		    his_self.addMove(`SETVAR\tstate\thenry_viii_pope_approves_divorce\t1`);
		    his_self.addMove(`NOTIFY\tThe Papacy accedes to Henry VIII's request for a divorce.`);
		    his_self.endTurn(); 
                  }
                  if (action === "disapprove") {
		    his_self.endTurn(); 
		    his_self.hide();
                  }

		});
	}

	render(msg="") {

		let his_self = this.mod;

		this.overlay.show(MarriageTemplate());

		if (msg != "") {
		  document.querySelector(".marriage-overlay .help").innerHTML = msg;
		}

		for (let i = 0; i < 7; i++) {
			tileqs = `.marriage-overlay .tile${i+1}`;
			let obj = document.querySelector(tileqs);
			obj.classList.add(`henry_viii_marital_status`);
			obj.classList.add(`henry_viii_marital_status${i+1}`);
                        if (i == his_self.game.state.henry_viii_marital_status) {
			  obj.classList.add("active");
			}
                        if (i > his_self.game.state.henry_viii_marital_status) {
			  obj.classList.add(`show_wife`);
			}
		}
	}

}

module.exports = MarriageOverlay;
