const ImperiumFactionSheetOverlayTemplate = require('./faction-sheet.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');
const TokenBar = require('./../tokenbar');

class FactionSheetOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.tokenbar = new TokenBar(
			this.app,
			this.mod,
			'.faction-sheet-tokenbar'
		);
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
	}

	render(player) {
		let imperium_self = this.mod;
		let faction_name = imperium_self.returnFactionNickname(player);
		let factions = imperium_self.returnFactions(player);
		let this_faction =
			factions[imperium_self.game.state.players_info[player - 1].faction];

		let flagship_idx = '';
		let flagship_name = '';
		let flagship_text = '';

		this.overlay.show(
			ImperiumFactionSheetOverlayTemplate(this.mod, player, faction_name)
		);

		this.tokenbar.render(player);

		//
		// action cards
		//
		let ac = imperium_self.returnPlayerActionCards(
			imperium_self.game.player
		);
		console.log('ac length: ' + ac.length);
		for (let i = 0; i < ac.length; i++) {
			let html = '';
			if (imperium_self.game.player == player) {
				html += imperium_self.action_cards[ac[i]].returnCardImage();
			} else {
				html = `<div class="faction_sheet_action_card faction_sheet_action_card_back bc"></div>`;
			}
			this.app.browser.addElementToSelector(
				html,
				'.faction-sheet-action-cards'
			);
		}

		//
		// tech cards
		//
		for (
			let i = 0;
			i < imperium_self.game.state.players_info[player - 1].tech.length;
			i++
		) {
			let html = '';
			let techname =
				imperium_self.game.state.players_info[player - 1].tech[i];
			let tech = imperium_self.tech[techname];
			if (tech.type != 'ability') {
				this.app.browser.addElementToSelector(
					tech.returnCardImage(),
					'.faction-sheet-tech-cards'
				);
			}
		}

		//
		// faction-specific tech
		//
		for (i in imperium_self.tech) {
			let tech = imperium_self.tech[i];
			if (tech.type == 'special') {
				if (
					!imperium_self.game.state.players_info[
						player - 1
					].tech.includes(i)
				) {
					if (
						imperium_self.game.state.players_info[player - 1]
							.faction == tech.faction
					) {
						let unmodded = tech.returnCardImage();
						let html = unmodded.replace(/nonopaque/g, 'opaque');
						this.app.browser.addElementToSelector(
							html,
							'.faction-sheet-tech-cards'
						);
					}
				}
			}
		}

		//
		// planet cards
		//
		let pc = imperium_self.returnPlayerPlanetCards(player);
		for (let b = 0; b < pc.length; b++) {
			let exhausted = '';
			if (imperium_self.game.planets[pc[b]].exhausted == 1) {
				exhausted = 'exhausted';
			}
			let html = `<div class="faction_sheet_planet_card bc ${exhausted}" id="${
				pc[b]
			}" style="background-image: url(${
				imperium_self.game.planets[pc[b]].img
			});"></div>`;
			imperium_self.app.browser.addElementToSelector(
				html,
				'.faction-sheet-planets'
			);
		}

		//
		// faction tech
		//
		for (
			let i = 0;
			i < imperium_self.game.state.players_info[player - 1].tech.length;
			i++
		) {
			let tech =
				imperium_self.tech[
					imperium_self.game.state.players_info[player - 1].tech[i]
				];
			if (tech.type == 'ability') {
				if (tech.key.indexOf('flagship') == -1) {
					let html = `
            <div id="faction_ability_${i}" class="faction_ability">
               <div class="faction_ability_title">${tech.name}</div>
               <div class="faction_ability_text">${tech.text}</div>
            </div>
          `;
					imperium_self.app.browser.addElementToSelector(
						html,
						'.faction-sheet-faction-abilities'
					);
				} else {
					flagship_idx = i;
					flagship_name = tech.name;
					flagship_text = tech.text;
				}
			}
		}

		//
		// promissary notes
		//
		for (let i = 0; i < this_faction.promissary_notes.length; i++) {
			let pm = this_faction.promissary_notes[i];
			if (pm.indexOf(this_faction.id) == 0) {
				let p = imperium_self.promissary_notes[pm];
				let html = `
          <div id="faction_ability_${pm.key}" class="faction_ability">
             <div class="faction_ability_title">${p.name} - Promissary</div>
             <div class="faction_ability_text">${p.text}</div>
          </div>
        `;
				this.app.browser.addElementToSelector(
					html,
					'.faction-sheet-faction-abilities'
				);
			}
		}

		//
		// faction tech (flagship)
		//
		let html = `
      <div id="faction_ability_${flagship_idx}" class="faction_ability">
        <div class="faction_ability_title">${flagship_name}</div>
        <div class="faction_ability_text">${flagship_text}</div>
      </div>
    `;
		this.app.browser.addElementToSelector(
			html,
			'.faction-sheet-faction-abilities'
		);
	}

	attachEvents() {}
}

module.exports = FactionSheetOverlay;
