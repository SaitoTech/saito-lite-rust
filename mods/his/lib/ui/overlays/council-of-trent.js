const CouncilOfTrentTemplate = require('./council-of-trent.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class CouncilOfTrentOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.visible = false;
		this.overlay = new SaitoOverlay(app, mod);
		this.selected = [];
	}

	hide() {
		this.visible = false;
		this.overlay.hide();
	}

	render(stage = 'papacy') {
		this.selected = [];

		let papacy_player = this.mod.returnPlayerOfFaction('papacy');
		let protestants_player = this.mod.returnPlayerOfFaction('protestant');

		this.visible = true;
		this.overlay.show(CouncilOfTrentTemplate());

		if (stage == 'papacy') {
			let debaters = this.mod.returnDebaters('papacy', 'uncommitted');
			for (let i = 0; i < debaters.length; i++) {
				this.app.browser.addElementToSelector(
					this.mod.returnCardImage(debaters[i].type),
					'.council-of-trent-overlay .debaters'
				);
			}
			if (this.mod.game.player != papacy_player) {
				document.querySelector(
					'.council-of-trent-overlay .help'
				).innerHTML = 'Papacy is selecting up to 4 Debaters.';
			} else {
				document.querySelector(
					'.council-of-trent-overlay .help'
				).innerHTML = `Papacy - select up to 4 Debaters. (<span class="finish-selecting-debaters">click when done</span>)`;
			}
		}
		if (stage == 'protestant') {
			let debaters = this.mod.returnDebaters('protestant', 'uncommitted');
			for (let i = 0; i < debaters.length; i++) {
				this.app.browser.addElementToSelector(
					this.mod.returnCardImage(debaters[i].type),
					'.council-of-trent-overlay .debaters'
				);
			}
			if (this.mod.game.player != protestants_player) {
				document.querySelector(
					'.council-of-trent-overlay .help'
				).innerHTML = 'Protestants are selecting up to 2 Debaters.';
			} else {
				document.querySelector(
					'.council-of-trent-overlay .help'
				).innerHTML = `Protestants - select up to 2 Debaters. (<span class="finish-selecting-debaters">click when done</span>)`;
			}
		}
		if (stage == 'results') {

			let papacy_total = 0;
			let protestants_total = 0;
			let papacy_rolls = [];
			let protestants_rolls = [];
			let papacy_hits = 0;
			let protestants_hits = 0;

			for (
				let i = 0;
				i < this.mod.game.state.council_of_trent.papacy.debaters.length;
				i++
			) {
				let d =
					this.mod.debaters[
						this.mod.game.state.council_of_trent.papacy.debaters[i]
					];
				papacy_total += d.power;
			}
			for (
				let i = 0;
				i <
				this.mod.game.state.council_of_trent.protestants.debaters
					.length;
				i++
			) {
				let d =
					this.mod.debaters[
						this.mod.game.state.council_of_trent.protestants
							.debaters[i]
					];
				protestants_total += d.power;
			}

			for (let i = 0; i < papacy_total; i++) {
				papacy_rolls.push(this.mod.rollDice(6));
			}
			for (let i = 0; i < protestants_total; i++) {
				protestants_rolls.push(this.mod.rollDice(6));
			}

			for (let i = 0; i < papacy_rolls.length; i++) {
				if (papacy_rolls[i] >= 5) {
					papacy_hits++;
				}
			}
			for (let i = 0; i < protestants_rolls.length; i++) {
				if (protestants_rolls[i] >= 5) {
					protestants_hits++;
				}
			}

			let html =
				'Papacy rolls: ' + JSON.stringify(papacy_rolls) + '<br />';
			html +=
				'Protestants roll: ' +
				JSON.stringify(protestants_rolls) +
				'<br />';

			let winner = `Council of Trent inconclusive (<span class="continue_inconclusive">click here</span>)`;
			let winner_converts = 0;
			if (protestants_hits > papacy_hits) {
				winner_converts = protestants_hits - papacy_hits;
				winner = `Protestants may convert ${winner_converts} space(s) (<span class="continue_protestants">click here</a>)`;
				html += winner;
				for (let i = 0; i < winner_converts; i++) {
					this.mod.game.queue.push("select_for_protestant_conversion\tprotestant\tall");
				}
				this.mod.game.queue.push(
					'ACKNOWLEDGE\tProtestants win the Council of Trent'
				);
			}
			if (protestants_hits < papacy_hits) {
				winner_converts = papacy_hits - protestants_hits;
				winner = `Papacy may convert ${winner_converts} space(s) (<span class="continue_papacy">click here</a>)`;
				html += winner;
				for (let i = 0; i < winner_converts; i++) {
					this.mod.game.queue.push("select_for_catholic_conversion\tpapacy\tall");
				}
				this.mod.game.queue.push(
					'ACKNOWLEDGE\tPapacy wins the Council of Trent'
				);
			}
			if (protestants_hits === papacy_hits) {
				document.querySelector(".council-of-trent-overlay .help").innerHTML += 'Council Inconclusive - No Winner';
				this.mod.game.queue.push(
					'ACKNOWLEDGE\tThe Council of Trent is Inconclusive'
				);
			}

			document.querySelector(
				'.council-of-trent-overlay .help'
			).innerHTML = html;

			let his_self = this.mod;

			$('.continue_inconclusive').off();
			$('.continue_inconclusive').on('click', () => {
				this.overlay.remove();
			});

			$('.continue_protestants').off();
			$('.continue_protestants').on('click', () => {
				this.overlay.remove();
			});

			$('.continue_papacy').off();
			$('.continue_papacy').on('click', () => {
				this.overlay.remove();
			});
		}

		if (stage == 'results') {
			this.attachEvents(stage);
		}

		if (
			(this.mod.game.player == papacy_player && stage == 'papacy') ||
			(this.mod.game.player == protestants_player &&
				stage == 'protestant')
		) {
			this.attachEvents(stage);
		}
	}

	attachEvents(stage = 'papacy') {
		let papacy_player = this.mod.returnPlayerOfFaction('papacy');
		let protestants_player = this.mod.returnPlayerOfFaction('protestant');

		try {
			document.querySelector('.finish-selecting-debaters').onclick = (
				e
			) => {
				document.querySelector('.finish-selecting-debaters').onclick = (
					e
				) => {};
				if (
					this.mod.game.player == papacy_player &&
					stage == 'papacy'
				) {
					this.mod.addMove(
						'council_of_trent_add_debaters\tpapacy\t' +
							JSON.stringify(this.selected)
					);
					this.mod.endTurn();
				}
				if (
					this.mod.game.player == protestants_player &&
					stage == 'protestant'
				) {
					this.mod.addMove(
						'council_of_trent_add_debaters\tprotestant\t' +
							JSON.stringify(this.selected)
					);
					this.mod.endTurn();
				}
			};
		} catch (err) {}

		try {
			document
				.querySelectorAll(
					'.council-of-trent-overlay .debaters .debater-card'
				)
				.forEach((el) => {
					el.onclick = (e) => {
						let el = e.currentTarget;
						let debater = e.currentTarget.id;

						if (el.classList.contains('opaque')) {
							el.classList.remove('opaque');
							for (let i = 0; i < this.selected.length; i++) {
								if (this.selected[i] == debater) {
									this.selected.splice(i, 1);
								}
							}
						} else {
							if (stage === 'papacy') {
								if (this.selected.length >= 4) {
									alert('You can at most select 4 debaters');
									return;
								}
							}
							if (stage === 'protestant') {
								if (this.selected.length >= 2) {
									alert('You can at most select 2 debaters');
									return;
								}
							}

							el.classList.add('opaque');
							if (!this.selected.includes(debater)) {
								this.selected.push(debater);
							}
						}
					};
				});
		} catch (err) {}
	}
}

module.exports = CouncilOfTrentOverlay;
