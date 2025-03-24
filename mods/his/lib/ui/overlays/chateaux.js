const ChateauxTemplate = require('./chateaux.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class ChateauxOverlay {
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

	render(faction = 'france') {
		this.visible = true;
		this.overlay.show(ChateauxTemplate());

		// bonuses
		let bonus = 0;
		let p = this.mod.returnPlayerOfFaction(faction);

		if (this.mod.isSpaceControlled('milan', 'france')) {
			bonus += 2;
			document.querySelectorAll('.modifier1').forEach((el) => {
			  el.style.borderBottom = "2px dashed yellow";
			  el.style.color = "white";
	 		});
		}
		if (this.mod.isSpaceControlled('florence', 'france')) {
			bonus += 1;
			document.querySelectorAll('.modifier2').forEach((el) => {
			  el.style.borderBottom = "2px dashed yellow";
			  el.style.color = "white";
			});
		}

		let italian_keys = 0;
		let occupied_french_space = 0;
		let controlled_french_space = 0;

		for (let x in this.mod.game.spaces) {
			let s = this.mod.game.spaces[x];
			if (s.language == 'italian' && s.type == "key") {
				if (this.mod.isSpaceControlled(s.key, 'france')) {
					italian_keys++;
				}
			}
			if (s.home == 'france') {
				if (!this.mod.isSpaceControlled(s.key, 'france')) {
					controlled_french_space++;
				}
				if (this.mod.doesSpaceHaveNonFactionUnits(s.key, 'france')) {
					occupied_french_space++;
				}
			}
		}

		if (italian_keys >= 3) {
			bonus += 2;
			document.querySelectorAll('.modifier3').forEach((el) => {
			  el.style.borderBottom = "2px dashed yellow";
			  el.style.color = "white";
			});
		}
		if (controlled_french_space > 0) {
			bonus -= 1;
			document.querySelectorAll('.modifier5').forEach((el) => {
			  el.style.borderBottom = "2px dashed yellow";
			  el.style.color = "white";
			});
		}
		if (occupied_french_space > 0) {
			bonus -= 2;
			document.querySelectorAll('.modifier6').forEach((el) => {
			  el.style.borderBottom = "2px dashed yellow";
			  el.style.color = "white";
			});
		}

		this.bonus = bonus;
		this.roll = this.mod.rollDice(6);

		if (this.bonus != 0) {
		  this.mod.updateLog("Chateaux Roll: " + this.roll + " ["+this.bonus+" bonus]");
		} else {
		  this.mod.updateLog("Chateaux Roll: " + this.roll);
		}

		let modified_roll = this.roll + this.bonus;

		document.querySelector(
			'.chateaux-overlay .help'
		).innerHTML = `${this.mod.returnFactionName(faction)} rolls ${
			this.roll
		} (modified: ${modified_roll})`;

		// remove cards_left update from France
		for (let z = 0; z < this.mod.game.queue.length; z++) {
			let lqe = this.mod.game.queue[z];
			let lmv = lqe.split("\t");
			if (lmv[0] == "cards_left" && lmv[1] == "france") {
				this.mod.game.queue.splice(z, 1);
			}
		}

		if (modified_roll >= 8) {
			this.mod.updateLog("Patron of the Arts: +1 VP, draw 2 discard 1");
			document.querySelectorAll(".outcome1").forEach((el) => {
				el.style.backgroundColor = "yellow";
				el.style.color = "black";
			});
			this.mod.game.state.french_chateaux_vp += 1;
			this.mod.game.queue.push('select_and_discard\t' + faction);
			this.mod.game.queue.push('hide_overlay\tchateaux');
			this.mod.game.queue.push('hand_to_fhand\t1\t' + p + '\t' + faction + "\t1");
			this.mod.game.state.cards_left["france"]+=2;
			this.mod.game.queue.push('DEAL\t1\t' + p + '\t' + 2);
			this.mod.game.queue.push(
				`ACKNOWLEDGE\t${this.mod.returnFactionName(
					faction
				)} rolls on the Chateaux Table`
			);
		}
		if (modified_roll >= 5 && modified_roll < 8) {
			this.mod.updateLog("Patron of the Arts: +1 VP, draw 1");
			document.querySelectorAll(".outcome2").forEach((el) => {
				el.style.backgroundColor = "yellow";
				el.style.color = "black";
			});
			this.mod.game.state.french_chateaux_vp += 1;
			this.mod.game.queue.push('hide_overlay\tchateaux');
			this.mod.game.queue.push('hand_to_fhand\t1\t' + p + '\t' + faction + "\t1");
			this.mod.game.state.cards_left["france"]++;
			this.mod.game.queue.push('DEAL\t1\t' + p + '\t' + 1);
			this.mod.game.queue.push(
				`ACKNOWLEDGE\t${this.mod.returnFactionName(
					faction
				)} rolls on the Chateaux Table`
			);
		}
		if (modified_roll >= 3 && modified_roll < 5) {
			this.mod.updateLog("Patron of the Arts: +1 VP, draw 1 discard 1");
			document.querySelectorAll(".outcome3").forEach((el) => {
				el.style.backgroundColor = "yellow";
				el.style.color = "black";
			});
			this.mod.game.state.french_chateaux_vp += 1;
			this.mod.game.queue.push('select_and_discard\t' + faction);
			this.mod.game.queue.push('hide_overlay\tchateaux');
			this.mod.game.queue.push('hand_to_fhand\t1\t' + p + '\t' + faction + "\t1");
			this.mod.game.state.cards_left["france"]++;
			this.mod.game.queue.push('DEAL\t1\t' + p + '\t' + 1);
			this.mod.game.queue.push(
				`ACKNOWLEDGE\t${this.mod.returnFactionName(
					faction
				)} rolls on the Chateaux Table`
			);
		}
		if (modified_roll <= 2) {
			this.mod.updateLog("Patron of the Arts: draw 2 discard 1");
			document.querySelectorAll(".outcome4").forEach((el) => {
				el.style.backgroundColor = "yellow";
				el.style.color = "black";
			});
			this.mod.game.queue.push('select_and_discard\t' + faction);
			this.mod.game.queue.push('hide_overlay\tchateaux');
			this.mod.game.state.cards_left["france"]+=2;
			this.mod.game.queue.push('hand_to_fhand\t1\t' + p + '\t' + faction + "\t1");
			this.mod.game.queue.push('DEAL\t1\t' + p + '\t' + 2);
			this.mod.game.queue.push(
				`ACKNOWLEDGE\t${this.mod.returnFactionName(
					faction
				)} rolls on the Chateaux Table`
			);
		}

		this.pushHudUnderOverlay();
		this.attachEvents();
	}


        attachEvents() {
                let his_self = this.mod;

                $('.chateaux-overlay').on('click', () => {
                        this.hide();
                        if (document.querySelector('.option.acknowledge')) {
                                document.querySelector('.option.acknowledge').click();
                        }
                });
                $('.saito-overlay:has(> .chateaux-overlay) + .saito-overlay-backdrop').on('click', () => {
                        this.hide();
                        if (document.querySelector('.option.acknowledge')) {
                                document.querySelector('.option.acknowledge').click();
                        }
                });
        }

}

module.exports = ChateauxOverlay;
