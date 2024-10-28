const FactionTemplate = require('./faction.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class FactionOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.visible = false;
		this.overlay = new SaitoOverlay(app, mod);
	}

	hide() {
		this.overlay.hide();
	}

	updateNotice(notice="") {
		try {
			document.querySelector(".faction_sheet_notice").innerHTML = notice;
		} catch (err) {}
	}

	render(faction = '') {
		let his_self = this.mod;

		this.visible = true;

		let f = this.mod.factions[faction];
		this.overlay.show(FactionTemplate(f));
		this.app.browser.addElementToSelector(`<div class="faction_sheet_notice ${f.key}" id="faction_sheet_notice"></div>`, '.faction_sheet');


		let controlled_keys = 0;
		let keyboxen = '';

		let war_winner_vp = 0;

		for (let key in his_self.game.spaces) {
			if (his_self.game.spaces[key].type === 'key') {

			  	let owner = his_self.game.spaces[key].political;
    			  	if (owner == "") { owner = his_self.game.spaces[key].home; }
    			  	owner = his_self.returnControllingPower(owner);

			  	if (owner == his_self.factions[faction].key) {
			  	  controlled_keys++;
			  	}
			}
		}

		// ENGLAND
		if (his_self.factions[faction].key === 'england') {
			war_winner_vp = his_self.game.state.england_war_winner_vp;
			let total_keys = 9;
			let controlled_keys = his_self.returnNumberOfKeysControlledByFaction('england');
			let remaining_keys = total_keys - controlled_keys;
			for (let i = 0; i < 7; i++) {
			  let hcss = ""; 
			  if (i == his_self.game.state.henry_viii_marital_status) { hcss = "active "; }
			  if (i > his_self.game.state.henry_viii_marital_status) {
			    hcss = "show_wife";
			  }
			  keyboxen += `<div class="${hcss} faction_sheet_keytile henry_viii_marital_status henry_viii_marital_status${i + 1}" id="henry_viii_marital_status${i + 1}"></div>`;
			}
			for (let i = 1; i <= 9; i++) {
				if (i > controlled_keys) {
					keyboxen += `<div class="faction_sheet_keytile faction_sheet_${his_self.factions[faction].key}_keytile${i} england_keytile" id="faction_sheet_keytile${i}"></div>`;
				}
			}

			if (his_self.game.state.leaders.henry_viii == 1) {
			}
			if (his_self.game.state.leaders.edward_vi == 1) {
				this.app.browser.addElementToSelector(
					his_self.returnCardImage('019'),
					'.faction_sheet_ruler'
				);
			}
			if (his_self.game.state.leaders.mary_i == 1) {
				this.app.browser.addElementToSelector(
					his_self.returnCardImage('021'),
					'.faction_sheet_ruler'
				);
			}
			if (his_self.game.state.leaders.elizabeth_i == 1) {
				this.app.browser.addElementToSelector(
					his_self.returnCardImage('023'),
					'.faction_sheet_ruler'
				);
			}

		}

		// FRANCE
		if (his_self.factions[faction].key === 'france') {
			war_winner_vp = his_self.game.state.france_war_winner_vp;
			let total_keys = 11;
			let remaining_keys = total_keys - controlled_keys;
			for (let i = 0; i < 7; i++) {
				let c = "";
				if (i == his_self.game.state.french_chateaux_vp) {
					c = "faction_sheet_france_vp_keytile";
				}
				keyboxen += `<div class="faction_sheet_keytile ${c} france_chateaux_status${i+1}" id="france_chateaux_status_keytile${i + 1}"></div>`;
			}
			for (let i = 1; i <= 11; i++) {
				if (i > 11 - remaining_keys) {
					keyboxen += `<div class="faction_sheet_keytile faction_sheet_france_keytile faction_sheet_${his_self.factions[faction].key}_keytile${i}" id="faction_sheet_keytile${i}"></div>`;
				}
			}

			if (his_self.game.state.leaders.henry_ii == 1) {
				this.app.browser.addElementToSelector(
					his_self.returnCardImage('020'),
					'.faction_sheet_ruler'
				);
			}
		}
		// OTTOMAN
		if (his_self.factions[faction].key === 'ottoman') {
			war_winner_vp = his_self.game.state.ottoman_war_winner_vp;
			let total_keys = 11;
			let remaining_keys = total_keys - controlled_keys;
			for (let i = 0; i <= 10; i++) {
				let xcs = "";
				if (i == his_self.game.state.events.ottoman_piracy_vp) {
					xcs = "ottoman_piracy_keytile";
				}
				keyboxen += `<div class="faction_sheet_keytile ${xcs} ottoman_piracy_status${i}" id="ottoman_piracy_status_keytile${i}"></div>`;
			}
			for (let i = 1; i <= 11; i++) {
				if (i > (11 - remaining_keys)) {
					keyboxen += `<div class="faction_sheet_keytile ottoman_keytile faction_sheet_${his_self.factions[faction].key}_keytile${i}" id="faction_sheet_keytile${i}"></div>`;
				}
			}
		}
		// PAPACY
		if (his_self.factions[faction].key === 'papacy') {

			////////////////////
		 	// excommunicated //
			////////////////////
			let exhtml = "";
			if (his_self.game.state.excommunicated_factions["england"] == 1) {
			  exhtml += `<div class="excommunicated england"></div>`;
			}
			if (his_self.game.state.excommunicated_factions["france"] == 1) {
			  exhtml += `<div class="excommunicated france"></div>`;
			}
			if (his_self.game.state.excommunicated_factions["hapsburg"] == 1) {
			  exhtml += `<div class="excommunicated hapsburg"></div>`;
			}
			for (let i = 0; i < his_self.game.state.excommunicated.length; i++) {
			  let obj = his_self.game.state.excommunicated[i];
			  if (obj.reformer) {
			    if (obj.reformer.type == "luther-reformer") {
			      exhtml += `<div class="excommunicated luther-reformer"></div>`;
			    }
			    if (obj.reformer.type == "zwingli-reformer") {
			      exhtml += `<div class="excommunicated zwingli-reformer"></div>`;
			    }
			    if (obj.reformer.type == "calvin-reformer") {
			      exhtml += `<div class="excommunicated calvin-reformer"></div>`;
			    }
			    if (obj.reformer.type == "cramner-reformer") {
			      exhtml += `<div class="excommunicated cramner-reformer"></div>`;
			    }
			  }
			}
			if (exhtml != "") {
				this.app.browser.addElementToSelector(
					exhtml,
					'.faction_sheet'
				);
			}

			war_winner_vp = his_self.game.state.papacy_war_winner_vp;
			let total_keys = 7;
			controlled_keys = his_self.returnNumberOfKeysControlledByFaction('papacy');
			let remaining_keys = total_keys - controlled_keys;
console.log(remaining_keys + " = " + total_keys + " - " + controlled_keys);
			for (let i = 0; i < 12; i++) {
				if (his_self.game.state.saint_peters_cathedral['state'] == i) {
					keyboxen += `<div class="faction_sheet_keytile papacy_construction_status${
						i + 1
					} saint_peters_tile" id="papacy_construction_status_keytile${
						i + 1
					}"></div>`;
				}
				if (his_self.game.state.saint_peters_cathedral['vp'] == i) {
					keyboxen += `<div class="faction_sheet_keytile papacy_construction_status${
						7 + i
					} papacy_vp_tile" id="papacy_construction_status_keytile${
						7 + i
					}"></div>`;
				}
			}
			for (let i = 1; i <= 7; i++) {
				if (i > controlled_keys) {
					keyboxen += `<div class="faction_sheet_keytile faction_sheet_${his_self.factions[faction].key}_keytile${i} papacy_keytile" id="faction_sheet_keytile${i}"></div>`;
				}
			}

			if (his_self.game.state.leaders.clement_vii == 1) {
				this.app.browser.addElementToSelector(
					his_self.returnCardImage('010'),
					'.faction_sheet_ruler'
				);
			}
			if (his_self.game.state.leaders.paul_iii == 1) {
				this.app.browser.addElementToSelector(
					his_self.returnCardImage('014'),
					'.faction_sheet_ruler'
				);
			}
			if (his_self.game.state.leaders.julius_iii == 1) {
				this.app.browser.addElementToSelector(
					his_self.returnCardImage('022'),
					'.faction_sheet_ruler'
				);
			}
		}

		// PROTESTANTS
		if (his_self.factions[faction].key === 'protestant') {
			war_winner_vp = his_self.game.state.protestant_war_winner_vp;
			for (let i = 0; i <= 6; i++) {
				let box_inserts = '';
				if (his_self.game.state.translations['new']['german'] == i) {
					box_inserts += `<div class="new_testament_german_tile" id="new_testament_german_tile"></div>`;
				}
				if (his_self.game.state.translations['new']['french'] == i) {
					box_inserts += `<div class="new_testament_french_tile" id="new_testament_french_tile"></div>`;
				}
				if (his_self.game.state.translations['new']['english'] == i) {
					box_inserts += `<div class="new_testament_english_tile" id="new_testament_english_tile"></div>`;
				}
				keyboxen += `<div class="faction_sheet_keytile protestant_translation_status${i}" id="protestant_translation_status_keytile${i}">${box_inserts}</div>`;
			}
			for (let i = 1; i <= 12; i++) {
				let box_inserts = '';
				if (
					his_self.game.state.translations['full']['german'] ==
					i - 1
				) {
					box_inserts += `<div class="bible_german_tile" id="bible_german_tile"></div>`;
				}
				if (
					his_self.game.state.translations['full']['french'] ==
					i - 1
				) {
					box_inserts += `<div class="bible_french_tile" id="bible_french_tile"></div>`;
				}
				if (
					his_self.game.state.translations['full']['english'] ==
					i - 1
				) {
					box_inserts += `<div class="bible_english_tile" id="bible_english_tile"></div>`;
				}
				keyboxen += `<div class="faction_sheet_keytile faction_sheet_${his_self.factions[faction].key}_keytile${i}" id="faction_sheet_keytile${i}">${box_inserts}</div>`;
			}

                        if (his_self.game.state.leaders.calvin == 1) {
                                this.app.browser.addElementToSelector(
                                        his_self.returnCardImage('016'),
                                        '.faction_sheet_ruler'
                                );
                        }

		}

		// HAPSBURG
		if (his_self.factions[faction].key === 'hapsburg') {
			war_winner_vp = his_self.game.state.hapsburg_war_winner_vp;
			let total_keys = 14;
			let remaining_keys = total_keys - controlled_keys;
			for (let i = 1; i <= 14; i++) {
				if (i > (14 - remaining_keys)) {
					keyboxen += `<div class="faction_sheet_keytile faction_sheet_hapsburg_keytile faction_sheet_${his_self.factions[faction].key}_keytile${i}" id="faction_sheet_keytile${i}"></div>`;
				}
			}
		}
		this.app.browser.addElementToSelector(keyboxen, '.faction_sheet');

		//
		// captured leaders
		//
		let p = his_self.returnPlayerCommandingFaction(faction);
		if (p > 0) {
		  for (let z = 0; z < his_self.game.state.players_info[p-1].captured.length; z++) {
		    let c = his_self.game.state.players_info[p-1].captured[z];

console.log("CAPTURED: " + JSON.stringify(c));

		    if (c.capturing_faction == faction) {
		      if (c.army_leader) {
			this.app.browser.addElementToSelector(
				`<div class="army_tile" style="background-image: url(/his/img/tiles/army/${c.img})"></div>`,
				'.faction_sheet_vp'
			);
		      }
		      if (c.navy_leader) {
			this.app.browser.addElementToSelector(
				`<div class="army_tile" style="background-image: url(/his/img/tiles/navy/${c.img})"></div>`,
				'.faction_sheet_vp'
			);
		      }
		    }
		  }
		}

		//
		// master of italy
		//
		master_of_italy_vp = his_self.game.state.master_of_italy[faction];
		while (master_of_italy_vp >= 2) {
			this.app.browser.addElementToSelector(
				'<div class="master_of_italy_vp vp2"></div>',
				'.faction_sheet_vp'
			);
			master_of_italy_vp -= 2;
		}
		while (master_of_italy_vp >= 1) {
			this.app.browser.addElementToSelector(
				'<div class="master_of_italy_vp vp1"></div>',
				'.faction_sheet_vp'
			);
			master_of_italy_vp -= 1;
		}


		//
		// War Winner VPs
		//
		while (war_winner_vp >= 2) {
			this.app.browser.addElementToSelector(
				'<div class="war_winner_vp vp2"></div>',
				'.faction_sheet_vp'
			);
			war_winner_vp -= 2;
		}
		while (war_winner_vp >= 1) {
			this.app.browser.addElementToSelector(
				'<div class="war_winner_vp vp1"></div>',
				'.faction_sheet_vp'
			);
			war_winner_vp -= 1;
		}

		//
		// New World Discoveries
		//
		for (let key in his_self.game.state.newworld) {
			if (his_self.game.state.newworld[key].type == "discovery" && his_self.game.state.newworld[key].claimed == 1 && his_self.game.state.newworld[key].faction == faction) {
				this.app.browser.addElementToSelector(
					`<div class="new_world_vp ${key}"></div>`,
					'.faction_sheet_vp'
				);
			}
		}


		//
		// Edward and Elizabeth
		//
	  	if (his_self.factions[faction].key === "england") {
		  if (his_self.game.state.henry_viii_healthy_edward == 1 || his_self.game.state.henry_viii_sickly_edward == 1) {
		    let html = `<div class="debaters-tile" data-key="" data-id="" style="background-image: url(/his/img/tiles/vp/Edward.svg);"></div>`;
		    this.app.browser.addElementToSelector(
			html,
			'.faction_sheet_vp'
		    );
		  } else {
		    if (his_self.game.state.henry_viii_add_elizabeth > 0) {
		      let html = `<div class="debaters-tile" data-key="" data-id="" style="background-image: url(/his/img/tiles/vp/Elizabeth.svg);"></div>`;
		      this.app.browser.addElementToSelector(
			html,
			'.faction_sheet_vp'
		      );
		    }	    
		  }	    
		}


		//
		// Disgraced and Burned Debaters
		//
		if (his_self.factions[faction].key === 'protestant') {
			for (let i = 0; i < his_self.game.state.burned.length; i++) {
				let dn = his_self.game.state.burned[i];
				let dd = his_self.debaters[dn];
				if (dd.faction === 'papacy') {
					let vp_bonus = dd.power;
					let html = `<div class="debaters-tile" data-key="${dd.key}" data-id="${dd.key}" style="background-image: url(/his/img/tiles/debaters/${dd.img});"></div>`;
					this.app.browser.addElementToSelector(
						html,
						'.faction_sheet_vp'
					);
				}
			}
		}
		if (his_self.factions[faction].key === 'papacy') {
			for (let i = 0; i < his_self.game.state.burned.length; i++) {
				let dn = his_self.game.state.burned[i];
				let dd = his_self.debaters[dn];
				if (dd.faction === 'protestant') {
					let vp_bonus = dd.power;
					let html = `<div class="debaters-tile" data-key="${dd.key}" data-id="${dd.key}" style="background-image: url(/his/img/tiles/debaters/${dd.img});"></div>`;
					this.app.browser.addElementToSelector(
						html,
						'.faction_sheet_vp'
					);
				}
			}
		}


		//
		// Bible Translations
		//
		if (his_self.factions[faction].key === 'protestant') {
		  if (his_self.game.state.translations['full']['german'] >= 10) {
					let html = `<div class="debaters-tile" data-key="" data-id="" style="background-image: url(/his/img/factions/BibleGerman.svg"></div>`;
					this.app.browser.addElementToSelector(html, '.faction_sheet_vp');
		  } 
		  if (his_self.game.state.translations['full']['english'] >= 10) {
					let html = `<div class="debaters-tile" data-key="" data-id="" style="background-image: url(/his/img/factions/BibleEnglish.svg"></div>`;
					this.app.browser.addElementToSelector(html, '.faction_sheet_vp');
		  } 
		  if (his_self.game.state.translations['full']['french'] >= 10) {
					let html = `<div class="debaters-tile" data-key="" data-id="" style="background-image: url(/his/img/factions/BibleFrench.svg"></div>`;
					this.app.browser.addElementToSelector(html, '.faction_sheet_vp');
		  } 
		}


		this.attachEvents();
	}

	attachEvents() {}
}

module.exports = FactionOverlay;
