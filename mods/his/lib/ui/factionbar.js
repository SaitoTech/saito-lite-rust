const FactionBarTemplate = require('./factionbar.template');

class FactionBarOverlay {

	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.visible = false;
	}

	//
	// one or multiple factions
	//
	setActive(faction=null) {
	  try {
	    document.querySelectorAll(".factionbar-faction").forEach((el) => {
	      el.classList.remove("active");
	    });
	    if (typeof faction === 'string') {
	      let obj = document.querySelector(`.factionbar-faction.${faction}`);
	      if (obj) { obj.classList.add("active"); }
	    } else {
	      if (Array.isArray(faction)) {
		for (let i = 0; i < faction.length; i++) {
	          let obj = document.querySelector(`.factionbar-faction.${faction[i]}`);
	          if (obj) { obj.classList.add("active"); }
		}
	      }
	    }
	  } catch (err) {}
	}

	setInactive(faction=null) {
	  try {
	    if (typeof faction === 'string') {
	      let obj = document.querySelector(".factionbar-faction.${faction}");
	      if (obj) { obj.classList.add("active"); }
	    } else {
	      if (Array.isArray(faction)) {
		for (let i = 0; i < faction.length; i++) {
	          let obj = document.querySelector(`.factionbar-faction.${faction[i]}`);
	          if (obj) { obj.classList.add("active"); }
		}
	      }
	    }
	  } catch (err) {}
	}


	render(faction = '') {

		if (this.mod.game.players.length == 2) { return; }
		if (this.mod.game.state.players.length == 2) { return; }
	 	if (this.visible) { return; }

		let his_self = this.mod;

		this.app.browser.addElementToSelector(FactionBarTemplate());

		let factions = ["ottoman","hapsburg","england","france","papacy","protestant"];
		for (let z = 0; z < factions.length; z++) {
		  let active_faction = "";
		  if (this.mod.returnPlayerCommandingFaction(factions[z]) === this.mod.game.player) { active_faction = "*"; }
		  let f = factions[z];
		  this.app.browser.addElementToSelector(`<div class="factionbar-faction ${f}" id="${f}">${f}${active_faction}</div>`, '.factionbar');
		}

		this.visible = true;
		this.attachEvents();

	}

	attachEvents() {

		let his_self = this.mod;

		let factions = ["ottoman","hapsburg","england","france","papacy","protestant"];
		for (let z = 0; z < factions.length; z++) {
			let f = factions[z];
			document.querySelector(`.factionbar-faction.${f}`).onclick = (e) => {
				let f = e.currentTarget.id;
        			if (his_self.returnPlayerOfFaction(f) === his_self.game.player) {
          				let fhand_idx = his_self.returnFactionHandIdx(his_self.game.player, f);
					his_self.game.state.players_info[his_self.game.player-1].active_faction = f;
					his_self.game.state.players_info[his_self.game.player-1].active_faction_idx = fhand_idx;
          				let c = his_self.game.deck[0].fhand[fhand_idx];
          				his_self.deck_overlay.render("hand", c);
          				return;
				} else {
					this.mod.deck_overlay.render(f);
				}
			}
		}
	}

}

module.exports = FactionBarOverlay;
