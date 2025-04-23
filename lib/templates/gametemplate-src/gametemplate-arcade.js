/*********************************************************************************
 GAME ARCADE (API)

  This file contains functions that other modules may call to get formatted html containing
  game module specific information, concerning: rules / how to play, selectable options,
  abbreviated options to display in game invites, etc.
 
**********************************************************************************/
let SaitoOverlay = require('./../../saito/ui/saito-overlay/saito-overlay');

class GameArcade {
	/**
	 * Advanced options interface in Arcade creates an overlay with the returned html
	 * Can use <div class="overlay-input"></div> to neatly group options
	 */
	returnAdvancedOptions() {
		return '';
	}

	returnOptions() {
		let html = '';
		if (this.minPlayers === this.maxPlayers) {
			html = `<input type="hidden" class="game-wizard-players-select" name="game-wizard-players-select" value="${this.minPlayers}">`;
			html += this.returnSingularGameOption();
		} else {
			html += `<div class="overlay-input"><select class="game-wizard-players-select" name="game-wizard-players-select">`;
			for (let p = this.minPlayers; p <= this.maxPlayers; p++) {
				html += `<option value="${p}" ${
					p === this.minPlayers ? 'selected default' : ''
				}>${p} player</option>`;
			}

			if (this.opengame) {
				html += `<option value="open-table">open table</option>`;
			}			

			html += `</select></div>`;

		}

		return html;
	}

	/**
	 * Called when displaying advanced game options, so you can dynamically change the DOM as users select options
	 * (i.e. hide/display options that have prerequisites)
	 */
	attachAdvancedOptionsEventListeners() {
		let crypto = document.getElementById('crypto');
		let stakeInput = document.getElementById('stake_input');
		if (crypto && stakeInput) {
			crypto.onchange = () => {
				if (crypto.value) {
					stakeInput.style.display = 'block';
				} else {
					stakeInput.style.display = 'none';
				}
			};
		}
		return;
	}

	/**
	 * A stub that should be overwritten by the game module to return a formatted HTML (to be inserted into an overlay) description of the game rules
	 */
	returnGameRulesHTML() {
		return '';
	}

	returnDefaultGameOptions() {
		let playerOptions = this.returnOptions();
		let advancedOptions = this.returnAdvancedOptions();

		let metaOverlay = new SaitoOverlay(this.app, this, false, false);
		metaOverlay.show(
			`<form class="default_game_options">${playerOptions}${advancedOptions}</form>`
		);
		metaOverlay.hide();

		let options = { game: this.name };
		document
			.querySelectorAll(
				'form.default_game_options input, form.default_game_options select'
			)
			.forEach((element) => {
				if (element.name) {
					if (element.type == 'checkbox') {
						if (element.checked) {
							options[element.name] = 1;
						}
					} else if (element.type == 'radio') {
						if (element.checked) {
							options[element.name] = element.value;
						}
					} else {
						options[element.name] = element.value;
					}
				}
			});

		metaOverlay.remove();
		return options;
	}

	/**
	 * Semi-Advanced options interface in Arcade allows 2 player games to elevate a separate option in lieu of # players
	 * Should be a <select>
	 */
	returnSingularGameOption() {
		return '';
	}

	/*
	 * A method to filter out some of the game options to clean up the game invite display in the arcade
	 * Game invites list options, or rename the options in a more user friendly way
	 * See also arcade/lib/arcade-main/templates/arcade-invite.template.js
	 */
	returnShortGameOptionsArray(options) {
		let sgo = {};
		let crypto = '';

		for (let i in options) {
			console.log(i, options[i]);
			if (options[i] !== '') {
				let output_me = 1;
				if (i == 'clock') {
					output_me = 0;
					if (options[i] == 0) {
						sgo[i] = 'unlimited';
					} else {
						sgo[i] = options[i] + ' minutes';
					}
				}
				if (i == "lightning"){
					output_me = 0;
					if (options[i] != 0) {
						sgo[i] = `+${options[i]} seconds`;
					}
				}
				if (i == 'observer' && options[i] != 'enable') {
					output_me = 0;
				}
				if (i == 'league_id') {
					output_me = 0;
				}
				if (i == 'league_name') {
					output_me = 0;
					sgo[
						'league'
					] = `<span class="saito-league">${options[i]}</span>`;
				}
				if (i == 'open-table') {
					output_me = 0;
					sgo['max players'] = options["game-wizard-players-select-max"];
				}
				if (i.includes('game-wizard-players')) {
					output_me = 0;
				}

				if (i == 'game') {
					output_me = 0;
				}
				if (i == 'crypto') {
					output_me = 0;
					crypto = options[i]; //Don't display but save this info
				}
				if (i == 'stake') {
					output_me = 0;
					if (crypto){
						if (typeof options['stake'] === 'object') {
							let min = parseFloat(options.stake.min);
							let max = min;
							for (let q in options.stake){
								if (parseFloat(options.stake[q]) > max){
									max = parseFloat(options.stake[q]);
								}
							}
							sgo['stake'] = `${min} - ${max} ${crypto}`;
						} else if (parseFloat(options['stake']) > 0) {
							sgo['stake'] = options['stake'] + ' ' + crypto;
						}
					} 
				}

				if (i == 'desired_opponent_publickey') {
					output_me = 0;
					/*sgo['invited player'] = this.app.browser.returnAddressHTML(
						options[i]
					);*/
				}

				if (output_me == 1) {
					sgo[i] = options[i];
				}
			}
		}

		return sgo;
	}

	/*
	 * DEPRECATED -- It was a way to reorganize the options read from HTML and better package it,
	 * However, the few game modules that implemented it didn't make any meaningful difference, but introduced errors
	 * A method for game modules to (optionally) filter the whole list of options to a smaller object.
	 * That object gets included in the game data packaged with the transaction to create an invite
	 */
	returnFormattedGameOptions(options) {
		return options;
	}
}

module.exports = GameArcade;
