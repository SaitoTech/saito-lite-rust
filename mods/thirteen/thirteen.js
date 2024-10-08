const GameTemplate = require('../../lib/templates/gametemplate');
const ThirteenGameRulesTemplate = require('./lib/thirteen-game-rules.template');
const ThirteenGameOptionsTemplate = require('./lib/thirteen-game-options.template');

//////////////////
// constructor  //
//////////////////
class Thirteen extends GameTemplate {
	constructor(app) {
		super(app);

		this.app = app;

		this.gamename = 'Thirteen Days';
		this.name = 'Thirteen';
		this.slug = 'thirteen';
		this.description = `Thirteen Days is a mid-length simulation of the Cuban Missile Crisis created by Asger Granerud and Daniel Skjold Pedersenmade.`;
		this.publisher_message = `Thirteen Days is owned by <a href="http://jollyrogergames.com/game/13-days/">Jolly Roger Games</a>. This module includes the open source Vassal module explicitly authorized by the publisher. Vassal module requirements are that at least one player per game has purchased a copy of the game. Please support Jolly Roger Games and purchase your copy <a href="http://jollyrogergames.com/game/13-days/">here</a>`;
		this.categories = 'Games Boardgame Strategy';
		this.status = 'Beta';

		this.boardWidth = 2450;

		this.minPlayers = 2;
		this.maxPlayers = 2;

		this.rounds_in_turn = 1;

		this.used_agendas = [];
		this.all_battlegrounds = [
			'cuba_pol',
			'cuba_mil',
			'atlantic',
			'turkey',
			'berlin',
			'italy',
			'un',
			'television',
			'alliances'
		];
		this.roles = ['observer', 'USSR', 'US'];
		this.card_height_ratio = 1.37;
		this.hud.mode = 0; // wide
		this.hud.enable_mode_change = 1;
		this.interface = 1;

		this.opponent_cards_in_hand = 0;
		this.agendas = this.returnAgendaCards();
		this.strategies = this.returnStrategyCards();
	}

	async render(app) {
		if (this.browser_active == 0 || this.initialize_game_run) {
			return;
		}

		await super.render(app);

		this.log.render();

		this.cardbox.render();

		this.menu.addMenuOption('game-game', 'Game');
		this.menu.addMenuOption('game-info', 'Info');

		this.menu.addSubMenuOption('game-info', {
			text: 'How to Play',
			id: 'game-rules',
			class: 'game-rules',
			callback: function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				game_mod.overlay.show(game_mod.returnGameRulesHTML());
			}
		});

		this.menu.addSubMenuOption('game-info', {
			text: 'Log',
			id: 'game-log',
			class: 'game-log',
			callback: function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				game_mod.log.toggleLog();
			}
		});

		this.menu.addSubMenuOption('game-info', {
			text: 'Cards',
			id: 'game-cards',
			class: 'game-cards',
			callback: function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				game_mod.handleCardsMenu();
			}
		});

		this.menu.addChatMenu();

		this.menu.render();

		this.cardbox.addCardType('showcard', '', null);
		this.cardbox.addCardType('card', 'select', this.cardbox_callback);

		this.hud.render();

		try {
			if (app.browser.isMobileBrowser(navigator.userAgent)) {
				this.cardbox.skip_card_prompt = 0;
				this.hammer.render();
			} else {
				this.sizer.render();
				this.sizer.attachEvents('.gameboard');
			}
		} catch (err) {}

		/* Attach classes to hud to visualize player roles */
		//this.game.player == 1 --> ussr, == 2 --> usa
		let hh = document.querySelector('.hud-header');
		if (hh) {
			switch (this.game.player) {
			case 1:
				hh.classList.add('soviet');
				break;
			case 2:
				hh.classList.add('american');
				break;
			default:
			}
		}

		this.scoreboard.render();
	}

	handleCardsMenu() {
		let twilight_self = this;
		let html = `
    <div class="game-overlay-menu" id="game-overlay-menu">
    <div>SELECT DECK:</div>
    <ul>
    <li class="menu-item" id="hand">Your Hand</li>
    <li class="menu-item" id="unplayed">Unplayed Cards</li>
    </ul>
    </div>
    `;

		twilight_self.overlay.show(html);

		$('.menu-item').on('click', function () {
			let player_action = $(this).attr('id');
			var deck = twilight_self.game.deck[1];
			var html = '';
			var cards;

			switch (player_action) {
			case 'hand':
				cards = deck.hand;
				break;
			case 'unplayed':
				cards = Object.keys(twilight_self.returnUnplayedCards());
				break;
			default:
				break;
			}

			html += '<div class="cardlist-container">';
			for (let i = 0; i < cards.length; i++) {
				html += '<div class="cardlist-card">';
				if (cards[i] != undefined) {
					html += twilight_self.returnCardImage(cards[i], 1);
				}
				html += '</div>';
			}
			html += '</div>';

			if (cards.length == 0) {
				html = `
        <div style="text-align:center; margin: auto;">
        There are no cards in ${player_action}
        </div>
        `;
			}

			twilight_self.overlay.show(html);
		});
	}

	////////////////
	// initialize //
	////////////////
	initializeGame(game_id) {
		//
		// initialize
		//
		if (this.game.state == undefined) {
			this.game.state = this.returnState();
		}
		if (this.game.flags == undefined) {
			this.game.flags = this.returnFlags();
		}
		if (this.game.arenas == undefined) {
			this.game.arenas = this.returnArenas();
		}
		if (this.game.prestige == undefined) {
			this.game.prestige = this.returnPrestigeTrack();
		}
		if (this.game.rounds == undefined) {
			this.game.rounds = this.returnRoundTrack();
		}
		if (this.game.defcon == undefined) {
			this.game.defcon = this.returnDefconTracks();
		}
		if (this.game.deck.length == 0) {
			console.log('\n\n\n\n');
			console.log('---------------------------');
			console.log('---------------------------');
			console.log('------ initialize game ----');
			console.log('---------------------------');
			console.log('---------------------------');
			console.log('---------------------------');
			console.log('\n\n\n\n');

			this.updateStatus(
				'<div class=\'status-message\' id=\'status-message\'>generating the game</div>'
			);

			this.game.queue.push('round');
			this.game.queue.push('READY');

			this.game.queue.push('DECKENCRYPT\t2\t2');
			this.game.queue.push('DECKENCRYPT\t2\t1');
			this.game.queue.push('DECKXOR\t2\t2');
			this.game.queue.push('DECKXOR\t2\t1');
			this.game.queue.push('DECK\t2\t' + JSON.stringify(this.strategies));

			this.game.queue.push('DECKENCRYPT\t1\t2');
			this.game.queue.push('DECKENCRYPT\t1\t1');
			this.game.queue.push('DECKXOR\t1\t2');
			this.game.queue.push('DECKXOR\t1\t1');
			this.game.queue.push('DECK\t1\t' + JSON.stringify(this.agendas));

			this.game.queue.push('init');
		}

		if (!this.browser_active) {
			return;
		}

		//
		// adjust screen ratio
		//
		try {
			//
			// arenas
			//
			for (var i in this.game.arenas) {
				let divname = '#' + i;

				$(divname).css(
					'top',
					this.scale(this.game.arenas[i].top) + 'px'
				);
				$(divname).css(
					'left',
					this.scale(this.game.arenas[i].left) + 'px'
				);

				if (this.game.arenas[i].us > 0) {
					this.showInfluence(i);
				}
				if (this.game.arenas[i].ussr > 0) {
					this.showInfluence(i);
				}
			}

			//
			// prestige track
			//
			for (var i in this.game.prestige) {
				let divname = '.' + i;

				$(divname).css(
					'top',
					this.scale(this.game.prestige[i].top) + 'px'
				);
				$(divname).css(
					'left',
					this.scale(this.game.prestige[i].left) + 'px'
				);
			}

			//
			// flags
			//
			for (var i in this.game.flags) {
				let divname = '#' + i;
				$(divname).css(
					'top',
					this.scale(this.game.flags[i].top) + 'px'
				);
				$(divname).css(
					'left',
					this.scale(this.game.flags[i].left) + 'px'
				);
			}

			//
			// defcon track
			//
			for (var i in this.game.defcon) {
				let divname = '#' + i;
				$(divname).css(
					'top',
					this.scale(this.game.defcon[i].top) + 'px'
				);
				$(divname).css(
					'left',
					this.scale(this.game.defcon[i].left) + 'px'
				);
			}

			//
			// round track
			//
			for (var i in this.game.rounds) {
				let divname = '#' + i;

				$(divname).css(
					'top',
					this.scale(this.game.rounds[i].top) + 'px'
				);
				$(divname).css(
					'left',
					this.scale(this.game.rounds[i].left) + 'px'
				);
			}
		} catch (err) {}

		//
		// update defcon and milops and stuff
		//
		this.showBoard();
	}

	//
	// core game logic
	//
	async handleGameLoop(msg = null) {
		let thirteen_self = this;
		let player = 'ussr';
		if (this.game.player == 2) {
			player = 'us';
		}

		//
		// support observer mode
		//
		if (this.game.player == 0) {
			player = 'observer';
		}

		///////////
		// queue //
		///////////
		if (this.game.queue.length > 0) {
			//console.log("queue: " + JSON.stringify(this.game.queue));
			console.log('DECK:', JSON.parse(JSON.stringify(this.game.deck)));
			console.log('STATE:', JSON.parse(JSON.stringify(this.game.state)));

			let qe = this.game.queue.length - 1;
			let mv = this.game.queue[qe].split('\t');
			let shd_continue = 1;
			let thirteen_self = this;

			if (mv[0] === 'init') {
				this.game.queue.splice(qe, 1);

				// observer skips
				if (
					this.game.player === 0 ||
					!this.game.players.includes(this.publicKey)
				) {
					return 1;
				}

				//Game engine automatically randomizes player order, so we are good to go
				if (
					!this.game.options.player1 ||
					this.game.options.player1 == 'random'
				) {
					return 1;
				}

				if (this.game.options.player1 === 'ussr') {
					if (this.game.players[0] !== this.game.originator) {
						let p = this.game.players.shift();
						this.game.players.push(p);
					}
				} else {
					if (this.game.players[1] !== this.game.originator) {
						let p = this.game.players.shift();
						this.game.players.push(p);
					}
				}
				//Fix game.player so that it corresponds to the indices of game.players[]
				for (let i = 0; i < this.game.players.length; i++) {
					if (this.game.players[i] === this.publicKey) {
						this.game.player = i + 1;
					}
				}

				return 1;
			}

			if (mv[0] === 'pick_agenda_card') {
				if (this.browser_active == 0) {
					return 0;
				}

				let player = parseInt(mv[1]);

				if (this.game.player == player) {
					let html = `${this.roles[player]} pick your Agenda Card: `;

					let hand = this.game.deck[0].hand;

					this.updateStatus('Pick your agenda card');
					this.overlay.showCardSelectionOverlay(
						this.app,
						this,
						hand,
						{
							columns: 3,
							textAlign: 'center',
							cardlistWidth: '90vw',
							title: html,
							subtitle:
								'earn points by beating your opponent in this domain by turn\'s end',
							onCardSelect: function (card) {
								thirteen_self.overlay.hide();

								thirteen_self.addMove('RESOLVE');

								if (player == 1) {
									thirteen_self.game.state.ussr_agenda_selected =
										card;
									$(
										thirteen_self.returnCardImage(card)
									).appendTo('#ussr_agenda');
								} else {
									thirteen_self.game.state.us_agenda_selected =
										card;
									$(
										thirteen_self.returnCardImage(card)
									).appendTo('#us_agenda');
								}

								for (let i = hand.length - 1; i >= 0; i--) {
									thirteen_self.addMove(
										`flag\t${player}\t${
											thirteen_self.agendas[hand[i]].flag
										}`
									);
								}
								thirteen_self.endTurn();
							}
						}
					);
					this.overlay.blockClose();
				} else {
					this.updateStatus(
						'waiting for opponent to select agenda card'
					);
				}

				return 0;
			}

			if (mv[0] === 'discard_agenda') {
				let player = parseInt(mv[1]);
				let card = mv[2];
				let used = parseInt(mv[3]);

				//Leave on Board (Trash pile)
				if (used) {
					this.used_agendas.push(card);
					$(this.returnCardImage(card)).appendTo('#agenda_discard');
				} else {
					//Or add to discards to be reshuffled
					this.game.deck[0].discards[card] =
						this.game.deck[0].cards[card];
				}

				if (this.game.player == player) {
					this.removeCardFromHand(card);
				}

				this.game.queue.splice(qe, 1);
				return 1;
			}

			if (mv[0] === 'discard') {
				let player = parseInt(mv[1]);
				let deckidx = parseInt(mv[2]) - 1;
				let cardname = mv[3];

				this.updateLog(
					`<span>${this.roles[player]} discards</span> <span class="showcard" id="${cardname}">${this.game.deck[deckidx].cards[cardname].name}</span>`
				);

				this.game.deck[deckidx].discards[cardname] =
					this.game.deck[deckidx].cards[cardname];

				if (this.game.player == player) {
					this.removeCardFromHand(cardname);
				}

				this.game.queue.splice(qe, 1);
				return 1;
			}

			if (mv[0] === 'setvar') {
				let player = parseInt(mv[2]);

				if (mv[1] == 'opponent_cards_in_hand') {
					this.opponent_cards_in_hand = player;
				}

				if (mv[1] == 'personal_letter') {
					this.game.state.personal_letter = 3 - player;
				}

				if (mv[1] == 'add_command_token_bonus') {
					if (player == 1) {
						this.game.state.ussr_command_token_bonus++;
					} else {
						this.game.state.us_command_token_bonus++;
					}
				}

				if (mv[1] == 'remove_command_token_bonus') {
					if (player == 1) {
						this.game.state.ussr_command_token_bonus--;
					} else {
						this.game.state.us_command_token_bonus--;
					}
				}

				if (mv[1] == 'cannot_deflate_defcon_from_events') {
					if (player == 1) {
						this.game.state.ussr_cannot_deflate_defcon_from_events = 1;
					} else {
						this.game.state.us_cannot_deflate_defcon_from_events = 2;
					}
				}

				this.game.queue.splice(qe, 1);
				return 1;
			}

			if (mv[0] === 'flush') {
				let deckidx = parseInt(mv[2]) - 1;

				if (mv[1] == 'discards') {
					this.game.deck[deckidx].discards = {};
				}

				this.game.queue.splice(qe, 1);
				return 1;
			}

			if (mv[0] == 'flag') {
				let player = parseInt(mv[1]);
				let slot = mv[2];

				if (player == 1) {
					this.game.state.ussr_agendas.push(slot);
				} else {
					this.game.state.us_agendas.push(slot);
				}

				this.showBoard();
				this.game.queue.splice(qe, 1);
				return 1;
			}

			if (mv[0] == 'defcon_check') {
				let us_loses = 0;
				let ussr_loses = 0;

				if (
					this.game.state.defcon1_us > 6 ||
					this.game.state.defcon2_us > 6 ||
					this.game.state.defcon3_us > 6
				) {
					us_loses = 1;
				}
				if (
					this.game.state.defcon1_us > 3 &&
					this.game.state.defcon2_us > 3 &&
					this.game.state.defcon3_us > 3
				) {
					us_loses = 1;
				}

				if (
					this.game.state.defcon1_ussr > 6 ||
					this.game.state.defcon2_ussr > 6 ||
					this.game.state.defcon3_ussr > 6
				) {
					ussr_loses = 1;
				}
				if (
					this.game.state.defcon1_ussr > 3 &&
					this.game.state.defcon2_ussr > 3 &&
					this.game.state.defcon3_ussr > 3
				) {
					ussr_loses = 1;
				}

				if (us_loses == 1 && ussr_loses == 1) {
					this.sendGameOverTransaction({}, 'US and USSR both lose');
					return 0;
				}
				if (us_loses == 1) {
					this.sendGameOverTransaction(
						this.game.players[0],
						'US DEFCON too high'
					);
					return 0;
				}
				if (ussr_loses == 1) {
					this.sendGameOverTransaction(
						this.game.players[1],
						'USSR DEFCON too high'
					);
					return 0;
				}

				this.game.queue.splice(qe, 1);
				return 1;
			}

			if (mv[0] == 'scoring_result') {
				let player = parseInt(mv[1]);
				let prestige_shift = parseInt(mv[2]);
				this.updateLog('vp change: ' + prestige_shift);

				if (player == 1) {
					this.total_scoring_this_round = 0;
					this.total_scoring_this_round += prestige_shift;
				}

				if (player == 2) {
					this.total_scoring_this_round += prestige_shift;
					if (this.total_scoring_this_round > 5) {
						this.total_scoring_this_round = 5;
						this.addMove(
							'notify\tUSSR restricted to 5 prestige gain this round'
						);
					}
					if (this.total_scoring_this_round < -5) {
						this.total_scoring_this_round = -5;
						this.addMove(
							'notify\tUS restricted to 5 prestige gain this round'
						);
					}

					//
					// only update track on second time
					//
					if (this.total_scoring_this_round < 0) {
						this.updateLog(
							'US gains ' +
								this.total_scoring_this_round * -1 +
								' Prestige'
						);
					}
					if (this.total_scoring_this_round > 0) {
						this.updateLog(
							'USSR gains ' +
								this.total_scoring_this_round +
								' Prestige'
						);
					}
					if (this.total_scoring_this_round == 0) {
						this.updateLog(
							'US and USSR tie for Prestige this round...'
						);
					}

					this.game.state.prestige_track +=
						this.total_scoring_this_round;
					if (this.game.state.prestige_track > 12) {
						this.game.state.prestige_track = 12;
					}
					if (this.game.state.prestige_track < 2) {
						this.game.state.prestige_track = 2;
					}
				}

				this.game.queue.splice(qe, 1);
				return 1;
			}

			if (mv[0] == 'scoring_phase') {
				let scorer = parseInt(mv[1]);
				let agenda_card =
					scorer === 1
						? this.game.state.ussr_agenda_selected
						: this.game.state.us_agenda_selected;

				this.game.queue.splice(qe, 1);

				if (this.game.player == scorer) {
					this.addMove(
						`scoring_result\t${scorer}\t${this.agendas[
							agenda_card
						].score()}`
					);
					this.addMove(
						`notify\t${this.roles[scorer]} choses to score ${this.agendas[agenda_card].name}`
					);

					for (let a of this.game.deck[0].hand) {
						if (a === agenda_card) {
							this.addMove(
								`discard_agenda\t${this.game.player}\t${a}\t1`
							);
						} else {
							this.addMove(
								`discard_agenda\t${this.game.player}\t${a}\t0`
							);
						}
					}

					this.endTurn();
				}

				return 0;
			}

			if (mv[0] == 'world_opinion_phase') {
				this.game.queue.splice(qe, 1);

				let segment = mv[1];

				if (segment == 'television') {
					let television_bonus = 0;
					if (
						this.game.arenas['television'].us >
						this.game.arenas['television'].ussr
					) {
						television_bonus = 2;
					}
					if (
						this.game.arenas['television'].us <
						this.game.arenas['television'].ussr
					) {
						television_bonus = 1;
					}

					if (television_bonus == 0) {
						this.updateLog(
							'No one gets the Television bonus this turn'
						);
						return 1;
					}

					this.updateLog(
						`${this.roles[television_bonus]} wins the Television Battleground bonus.`
					);

					if (this.game.player == television_bonus) {
						this.updateStatus(
							`<div class="status-message" id="status-message">You receive Television Battleground bonus: adjust one DEFCON track one level.</div>`
						);
						this.eventShiftDefcon(
							this.game.player,
							this.game.player,
							[1, 2, 3],
							1
						);
					} else {
						this.updateStatus(
							'<div class=\'status-message\' id=\'status-message\'>Opponent is taking Television Battleground bonus</div>'
						);
						return 0;
					}

					return 0;
				}

				if (segment == 'un') {
					let un_bonus = 0;
					if (
						this.game.arenas['un'].us > this.game.arenas['un'].ussr
					) {
						un_bonus = 2;
					}
					if (
						this.game.arenas['un'].us < this.game.arenas['un'].ussr
					) {
						un_bonus = 1;
					}

					if (un_bonus == 0) {
						this.updateLog(
							'No one gets the United Nations bonus this turn'
						);
					} else {
						this.updateLog(
							`${this.roles[un_bonus]} wins the United Nations Battleground bonus and secures the Personal Letter.`
						);
						this.game.state.personal_letter = un_bonus;
					}

					return 1;
				}

				if (segment == 'alliances') {
					let alliances_bonus = 0;
					if (
						this.game.arenas['alliances'].us >
						this.game.arenas['alliances'].ussr
					) {
						alliances_bonus = 2;
					}
					if (
						this.game.arenas['alliances'].us <
						this.game.arenas['alliances'].ussr
					) {
						alliances_bonus = 1;
					}

					if (alliances_bonus == 0) {
						this.updateLog(
							'No one gets the Alliances bonus this turn'
						);
						return 1;
					}

					this.updateLog(
						`${this.roles[alliances_bonus]} wins the Alliances Battleground bonus.`
					);

					if (this.game.player == alliances_bonus) {
						this.updateStatus(
							'<div class=\'status-message\' id=\'status-message\'>You are pulling the Alliances Battleground Bonus: pulling strategy card</div>'
						);
						this.addMove(
							'aftermath_or_discard\t' + this.game.player
						);
						this.addMove('DEAL\t2\t1\t1'); // deck 2, player 1, 1 card
						this.endTurn();
					} else {
						this.updateStatus(
							'<div class=\'status-message\' id=\'status-message\'>Alliances Battleground Bonus: Opponent is pulling strategy card</div>'
						);
					}

					return 0;
				}
			}

			if (mv[0] == 'aftermath_or_discard') {
				let player = parseInt(mv[1]);

				this.game.queue.splice(qe, 1);

				if (this.game.player == player) {
					let card = this.game.deck[1].hand[0];

					let statMsg = `You have pulled ${this.cardToText(
						card
					)} as an Aftermath bonus card:`;
					let html =
						'<ul><li class="card nocard" id="discard">discard card</li>';
					html += `<li class="card nocard" id="${card}">put in aftermath</li></ul>`;
					thirteen_self.updateStatusWithOptions(statMsg, html);
					thirteen_self.attachCardboxEvents(function (action) {
						if (action == 'discard') {
							thirteen_self.addMove(
								`discard\t${player}\t2\t${card}`
							);
							thirteen_self.addMove(
								'notify\tWorld Opinion bonus card is discarded'
							);
							thirteen_self.endTurn();
							return;
						}

						if (thirteen_self.game.player == 1) {
							thirteen_self.game.state.aftermath_ussr.push(card);
						}
						if (thirteen_self.game.player == 2) {
							thirteen_self.game.state.aftermath_us.push(card);
						}
						thirteen_self.endTurn();
					});
				}
				return 0;
			}

			//For Intelligence Report, draw a random card from opponents hand
			if (mv[0] == 'pullcard') {
				this.game.queue.splice(qe, 1);

				let pullee = parseInt(mv[1]); //Person taking the card

				let dieroll = -1;

				if (this.game.player != pullee) {
					this.rollDice(
						this.game.deck[1].hand.length,
						function (roll) {
							let dieroll = parseInt(roll) - 1;

							if (thirteen_self.game.deck[1].hand.length == 0) {
								thirteen_self.addMove(
									'notify\topponent has no Strategy Cards to give'
								);
								thirteen_self.endTurn();
								return 0;
							} else {
								let card =
									thirteen_self.game.deck[1].hand[dieroll];
								thirteen_self.addMove(
									'share_card\t' +
										thirteen_self.game.player +
										'\t' +
										card
								);
								thirteen_self.endTurn();
								return 0;
							}
						}
					);
				} else {
					this.rollDice();
					return 0;
				}
			}

			if (mv[0] == 'share_card') {
				let sharer = parseInt(mv[1]); //Victim
				let card = mv[2];

				if (this.game.player == sharer) {
					this.removeCardFromHand(card);
				} else {
					//
					// play or discard
					//

					let html = '<ul>';
					html += '<li class="card" id="discard">discard card</li>';
					html += `<li class="card" id="${card}">play card</li>`;
					html += '</ul>';

					thirteen_self.updateStatusWithOptions(
						`You pulled ${this.cardToText(card)}:`,
						html
					);
					thirteen_self.attachCardboxEvents(function (card) {
						if (card == 'discard') {
							thirteen_self.addMove(
								`notify\t${
									thirteen_self.roles[
										thirteen_self.game.player
									]
								} discards the card without triggering the event`
							);
							thirteen_self.endTurn();
						} else {
							thirteen_self.playerPlayStrategyCard(card);
						}
					});
				}

				this.game.queue.splice(qe, 1);
				return 0;
			}

			if (mv[0] == 'round') {
				this.game.state.round++;

				//
				// if end of game
				//
				if (this.game.state.round == 4) {
					if (this.game.state.prestige > 7) {
						this.sendGameOverTransaction(
							this.game.players[0],
							'prestige track'
						);
					}
					if (this.game.state.prestige < 7) {
						this.sendGameOverTransaction(
							this.game.players[1],
							'prestige track'
						);
					}
					if (this.game.state.prestige == 7) {
						this.sendGameOverTransaction(this.game.players, 'tie');
					}
					return 0;
				}

				//
				// push remaining card into aftermath queue
				//
				if (this.game.state.round > 1) {
					if (this.game.player == 1) {
						this.game.state.aftermath_ussr.push(
							this.game.deck[1].hand[0]
						);
					}
					if (this.game.player == 2) {
						this.game.state.aftermath_us.push(
							this.game.deck[1].hand[0]
						);
					}
				}

				//
				// reset for next turn
				//
				this.game.deck[1].hand = [];
				this.game.deck[0].hand = [];

				//
				// reset round vars
				//
				this.game.state.ussr_command_token_bonus = 0;
				this.game.state.us_command_token_bonus = 0;
				this.game.state.ussr_cannot_deflate_defcon_from_events = 0;
				this.game.state.us_cannot_deflate_defcon_from_events = 0;

				//
				// defcon check
				//
				this.game.queue.push('defcon_check');

				//
				// scoring phase
				//
				this.game.queue.push('scoring_phase\t2');
				this.game.queue.push('scoring_phase\t1');

				//
				// world opinion phase
				//
				this.game.queue.push('world_opinion_phase\talliances');
				this.game.queue.push('world_opinion_phase\tun');
				this.game.queue.push('world_opinion_phase\ttelevision');

				let first_player = this.returnInitiative() === 'ussr' ? 1 : 2;
				for (let i = 0; i < 4; i++) {
					this.game.queue.push(`play\t${3 - first_player}`);
					this.game.queue.push(`play\t${first_player}`);
				}

				this.game.queue.push('DEAL\t2\t1\t5');
				this.game.queue.push('DEAL\t2\t2\t5');
				this.game.queue.push('SHUFFLE\t2');

				//For displaying flags
				this.game.state.us_agendas = [];
				this.game.state.ussr_agendas = [];

				this.game.queue.push('pick_agenda_card\t2');
				this.game.queue.push('pick_agenda_card\t1');

				//
				// phase 2 - deal agenda cards
				//
				this.game.queue.push('DEAL\t1\t1\t3');
				this.game.queue.push('DEAL\t1\t2\t3');
				this.game.queue.push('SHUFFLEDISCARDS\t1');

				//
				// phase 1 - escalate defcon markets
				//
				this.updateLog('all defcon tracks increased by 1');
				// military = 1
				this.game.state.defcon1_us++;
				this.game.state.defcon1_ussr++;
				// political = 2
				this.game.state.defcon2_us++;
				this.game.state.defcon2_ussr++;
				// world opinion = 3
				this.game.state.defcon3_us++;
				this.game.state.defcon3_ussr++;

				this.showBoard();
				return 1;
			}

			if (mv[0] == 'increase_defcon') {
				this.game.queue.splice(qe, 1);
				this.updateDefcon(
					parseInt(mv[1]),
					parseInt(mv[2]),
					parseInt(mv[3])
				);

				return 1;
			}

			if (mv[0] == 'decrease_defcon') {
				this.game.queue.splice(qe, 1);
				this.updateDefcon(
					parseInt(mv[1]),
					parseInt(mv[2]),
					-1 * parseInt(mv[3])
				);

				return 1;
			}

			if (mv[0] == 'trigger_opponent_event') {
				let player = parseInt(mv[1]);
				let card = mv[2];

				if (player == 1) {
					if (
						this.game.state
							.ussr_cannot_deflate_defcon_from_events == 1
					) {
						this.game.state.ussr_cannot_deflate_defcon_from_events = 2;
					}
				}
				if (player == 2) {
					if (
						this.game.state.us_cannot_deflate_defcon_from_events ==
						1
					) {
						this.game.state.us_cannot_deflate_defcon_from_events = 2;
					}
				}

				let log_update = player == 1 ? 'USSR' : 'US';
				log_update += ' plays ' + this.cardToText(card);
				this.updateLog(log_update);

				if (this.game.player == player) {
					//Just in case the card event doesn't update status
					this.updateStatus(
						`Opponent triggers ${this.cardToText(card)}`
					);
					this.strategies[card].event(player);
				}

				this.game.queue.splice(qe, 1);
				return 0;
			}

			if (mv[0] == 'command_influence') {
				let player = parseInt(mv[1]);
				let number = parseInt(mv[2]);
				let letter = mv[3] ? parseInt(mv[3]) : 0;

				console.log(
					`${this.roles[player]} SHOULD COMMAND: ${number} influence`
				);

				this.game.queue.splice(qe, 1);

				if (this.game.player == player) {
					this.playerPlaceCommandTokens(player, number);
				} else {
					this.updateStatusAndListCards(
						`Opponent commanding ${
							this.adjustInfluence(player, number) + letter
						} influence`,
						this.returnHand()
					);
				}

				return 0;
			}

			if (mv[0] == 'event_add_influence') {
				let player = parseInt(mv[1]);
				let player_to_add = parseInt(mv[2]);
				let options = JSON.parse(this.app.crypto.base64ToString(mv[3]));
				let number = parseInt(mv[4]);
				let max_per_arena = parseInt(mv[5]);
				let defcon_trigger = parseInt(mv[6]);

				if (this.game.player == player) {
					this.eventAddInfluence(
						player,
						player_to_add,
						options,
						number,
						max_per_arena,
						defcon_trigger
					);
				}

				this.game.queue.splice(qe, 1);
				return 0;
			}

			if (mv[0] == 'add_influence') {
				let player = parseInt(mv[1]);
				let arena_id = mv[2];
				let num = parseInt(mv[3]);
				let already_updated = parseInt(mv[4]);

				this.game.queue.splice(qe, 1);

				if (already_updated != this.game.player) {
					this.addInfluence(player, arena_id, num);
				}

				this.showBoard();

				return 1;
			}

			if (mv[0] == 'event_remove_influence') {
				let player = parseInt(mv[1]);
				let player_to_remove = parseInt(mv[2]);
				let options = JSON.parse(this.app.crypto.base64ToString(mv[3]));
				let number = parseInt(mv[4]);
				let max_per_arena = parseInt(mv[5]);
				let defcon_trigger = parseInt(mv[6]);

				if (this.game.player == player) {
					this.eventRemoveInfluence(
						player,
						player_to_remove,
						options,
						number,
						max_per_arena,
						defcon_trigger
					);
				}

				this.game.queue.splice(qe, 1);
				return 0;
			}

			if (mv[0] == 'remove_influence') {
				let player = parseInt(mv[1]);
				let arena_id = mv[2];
				let num = parseInt(mv[3]);
				let already_updated = parseInt(mv[4]);

				this.game.queue.splice(qe, 1);

				if (already_updated != this.game.player) {
					this.removeInfluence(player, arena_id, num);
				}

				this.showBoard();
				return 1;
			}

			if (mv[0] == 'event_shift_defcon') {
				let player = parseInt(mv[1]);
				let player_getting_moved = parseInt(mv[2]);
				let options = JSON.parse(this.app.crypto.base64ToString(mv[3]));
				let number = parseInt(mv[4]);

				if (this.game.player == player) {
					this.eventShiftDefcon(
						player,
						player_getting_moved,
						options,
						number
					);
				} else {
					this.updateStatusAndListCards(
						`Opponent shifting ${
							player == player_getting_moved ? 'their' : 'your'
						} defcon levels`,
						this.returnHand()
					);
				}

				this.game.queue.splice(qe, 1);
				return 0;
			}

			if (mv[0] == 'prestige') {
				let player = parseInt(mv[1]);
				let num = parseInt(mv[2]);

				if (player == 1) {
					this.game.state.prestige_track += num;
					this.updateLog('USSR gains ' + num + ' prestige');
				} else {
					this.game.state.prestige_track -= num;
					this.updateLog('US gains ' + num + ' prestige');
				}

				if (this.game.state.prestige_track > 12) {
					this.game.state.prestige_track = 12;
				}
				if (this.game.state.prestige_track < 2) {
					this.game.state.prestige_track = 2;
				}

				this.game.queue.splice(qe, 1);
				this.showBoard();
			}

			if (mv[0] == 'bayofpigs') {
				this.game.queue.splice(qe, 1);

				//
				// us deals with bays of pigs invasion
				//
				if (this.game.player == 2) {
					let html = '<ul>';

					if (this.game.arenas['alliances'].us >= 2) {
						html +=
							'<li class="card nocard" id="remove">remove influence</li>';
					}
					html +=
						'<li class="card nocard" id="restrict">defcon restriction</li>';
					html += '</ul>';

					thirteen_self.updateStatusWithOptions(
						`${this.cardToText(
							's34b'
						)}: Either remove two influence from alliance battleground or choose not to use events to lower defcon for this round:`,
						html
					);

					thirteen_self.attachCardboxEvents(function (action) {
						if (action == 'remove') {
							thirteen_self.addMove(
								'remove_influence\t2\talliances\t2'
							);
							thirteen_self.endTurn();
						}
						if (action == 'restrict') {
							thirteen_self.addMove(
								'setvar\tcannot_deflate_defcon_from_events\t2'
							);
							thirteen_self.endTurn();
						}
					});
				} else {
					this.updateStatusAndListCards(
						`US dealing with ${this.cardToText('s34b')}`,
						this.returnHand()
					);
				}

				return 0;
			}

			if (mv[0] == 'play') {
				if (
					this.game.state.ussr_cannot_deflate_defcon_from_events > 1
				) {
					this.game.state.ussr_cannot_deflate_defcon_from_events = 1;
				}
				if (this.game.state.us_cannot_deflate_defcon_from_events > 1) {
					this.game.state.us_cannot_deflate_defcon_from_events = 1;
				}
				this.game.state.turn = parseInt(mv[1]);
				this.game.queue.splice(qe, 1);

				this.playerTurn();

				return 0;
			}
		}

		return 1;
	}

	//
	// remove active events
	//
	removeEventsFromBoard() {
		$('.country').off();
		$('.active_battleground').removeClass('active_battleground');
	}

	returnHand() {
		let cards = [];
		for (let i = 0; i < this.game.deck[1].hand.length; i++) {
			cards.push(this.game.deck[1].hand[i]);
		}
		if (this.game.player == this.game.state.personal_letter) {
			cards.push('personal_letter');
		}
		return cards;
	}

	playerTurn(selected_card = null) {
		let thirteen_self = this;

		this.game.state.personal_letter_bonus = 0;

		this.removeEventsFromBoard();

		if (this.game.state.turn != this.game.player) {
			this.cardbox.hide(1);
			this.updateStatusAndListCards(
				`waiting for ${
					this.game.player == 1 ? 'US' : 'USSR'
				} to move...`,
				this.returnHand()
			);
			this.attachCardboxEvents(); //Allow mouseover zoom
		} else {
			this.updateStatusAndListCards(
				'Pick a card to play',
				this.returnHand()
			);
			this.attachCardboxEvents(function (card) {
				if (card == 'personal_letter') {
					thirteen_self.game.state.personal_letter_bonus = 1;
					thirteen_self.addMove(
						'setvar\tpersonal_letter\t' + thirteen_self.game.player
					);

					thirteen_self.updateStatusAndListCards(
						'Pick a card to play for Command (+1 bonus)',
						this.game.deck[1].hand
					);
					thirteen_self.attachCardboxEvents(function (card) {
						thirteen_self.addMove(
							`discard\t${thirteen_self.game.player}\t2\t${card}`
						);
						thirteen_self.playerPlayStrategyCard(card);
					});
				} else {
					thirteen_self.addMove(
						`discard\t${thirteen_self.game.player}\t2\t${card}`
					);
					thirteen_self.playerPlayStrategyCard(card);
				}
			});
		}
	}

	cardToText(card) {
		return `<span class="showcard" id="${card}">${this.strategies[card].name}</span>`;
	}

	playerPlayStrategyCard(card) {
		let thirteen_self = this;
		let this_card = this.strategies[card];

		let me = this.game.player == 2 ? 'us' : 'ussr';

		const playCommand = (card) => {
			let number = this_card.tokens;

			if (this_card.side == 'neutral' || this_card.side == me) {
				thirteen_self.playerPlaceCommandTokens(
					thirteen_self.game.player,
					number
				);
			} else {
				thirteen_self.updateStatus(
					`wait for opponent to play ${thirteen_self.cardToText(
						card
					)} event`
				);
				thirteen_self.addMove(
					`command_influence\t${thirteen_self.game.player}\t${number}\t${thirteen_self.game.state.personal_letter_bonus}`
				);
				thirteen_self.addMove(
					`trigger_opponent_event\t${
						3 - thirteen_self.game.player
					}\t${card}`
				);
				thirteen_self.addMove(
					`notify\t${me} plays ${thirteen_self.cardToText(
						card
					)} for command`
				);
				thirteen_self.endTurn();
			}
		};

		if (this.game.state.personal_letter_bonus) {
			playCommand(card);
			return;
		}

		let html = '<ul>';
		if (this_card.side == 'neutral' || this_card.side == me) {
			html += '<li class="card noncard" id="playevent">play event</li>';
		}
		html +=
			'<li class="card noncard" id="playcommand">command (add/remove cubes)</li></ul>';

		thirteen_self.updateStatusWithOptions(
			`how would you like to play ${thirteen_self.cardToText(card)}:`,
			html
		);
		thirteen_self.attachCardboxEvents(function (action) {
			if (action == 'playevent') {
				thirteen_self.addMove(
					`notify\t${me} plays ${thirteen_self.cardToText(
						card
					)} for event`
				);
				this_card.event(thirteen_self.game.player);
				return;
			}
			if (action == 'playcommand') {
				playCommand(card);
			}
		});
	}

	addInfluence(player, arena_id, num) {
		if (player == 1) {
			if (
				this.game.state.influence_on_board_ussr >= 17 ||
				this.game.arenas[arena_id].ussr > 5
			) {
				this.displayModal('USSR influence maxed out, placement failed');
				return false;
			}

			if (this.game.state.influence_on_board_ussr + num > 17) {
				num = 17 - this.game.state.influence_on_board_ussr;
				this.updateLog(
					'USSR can only have 17 influence on the board at any time. Reducing placement'
				);
			}
			if (this.game.arenas[arena_id].ussr + num > 5) {
				num = 5 - this.game.arenas[arena_id].ussr;
				this.updateLog(
					'USSR can only have 5 influence on any battleground. Reducing placement'
				);
			}

			this.game.arenas[arena_id].ussr += num;
			this.updateLog(
				'USSR gains ' +
					num +
					' influence in ' +
					this.game.arenas[arena_id].name
			);
		}

		if (player == 2) {
			if (
				this.game.state.influence_on_board_us >= 17 ||
				this.game.arenas[arena_id].us > 5
			) {
				this.displayModal('US influence maxed out, placement failed');
				return false;
			}

			if (this.game.state.influence_on_board_us + num > 17) {
				num = 17 - this.game.state.influence_on_board_us;
				this.updateLog(
					'US can only have 17 influence on the board at any time. Reducing placement'
				);
			}

			if (this.game.arenas[arena_id].us + num > 5) {
				num = 5 - this.game.arenas[arena_id].us;
				this.updateLog(
					'US can only have 5 influence on any battleground. Reducing placement'
				);
			}

			this.game.arenas[arena_id].us += num;

			this.updateLog(
				'US gains ' +
					num +
					' influence in ' +
					this.game.arenas[arena_id].name
			);
		}

		return num;
	}

	removeInfluence(player, arena_id, num) {
		if (player == 1) {
			num = Math.min(num, this.game.arenas[arena_id].ussr);
			this.game.arenas[arena_id].ussr -= num;
		} else {
			num = Math.min(num, this.game.arenas[arena_id].us);
			this.game.arenas[arena_id].us -= num;
		}

		if (num > 0) {
			this.updateLog(
				`${this.roles[player]} removes ${num} influence in ${this.game.arenas[arena_id].name}`
			);
		}

		return num;
	}

	eventShiftDefcon(
		player,
		player_getting_moved,
		options,
		number,
		directions = 'both',
		mycallback = null
	) {
		if (directions == 'decrease') {
			if (player == 1) {
				if (
					this.game.state.ussr_cannot_deflate_defcon_from_events == 1
				) {
					this.updateLog(
						'USSR cannot deflate defcon from events this turn'
					);
					runCallback(0);
					return 0;
				}
			}
			if (player == 2) {
				if (this.game.state.us_cannot_deflate_defcon_from_events == 1) {
					this.updateLog(
						'US cannot deflate defcon from events this turn'
					);
					runCallback(0);
					return 0;
				}
			}
		}

		let thirteen_self = this;
		let defcon_tracks = ['military', 'political', 'world opinion'];

		this.removeEventsFromBoard();

		//All players to reset in the branching menu tree
		this.menu_backup_callback = () => {
			thirteen_self.eventShiftDefcon(
				player,
				player_getting_moved,
				options,
				number,
				directions,
				mycallback
			);
		};

		const runCallback = function (total_shifted) {
			if (mycallback) {
				console.log('Running callback funtion');
				mycallback(total_shifted);
			} else {
				console.log('No callback, ending turn');
				thirteen_self.endTurn();
			}
		};

		const choosetrack = function () {
			//Shortcut if no choice
			if (options.length == 1) {
				choosedirection(options[0]);
			}

			let html2 = '<ul>';
			for (let op of options) {
				html2 += `<li class="card nocard" id="${op}">${
					defcon_tracks[parseInt(op) - 1]
				}</li>`;
			}

			html2 += '<li class="card nocard" id="done">finish move</li>';
			html2 += '</ul>';

			thirteen_self.updateStatusWithOptions(
				`Adjust which DEFCON track for ${
					player == player_getting_moved ? 'you' : 'your opponent'
				}:`,
				html2
			);
			thirteen_self.attachCardboxEvents(function (action) {
				if (action == 'done') {
					runCallback(0);
					return;
				} else {
					choosedirection(action);
				}
			});
		};

		const choosedirection = function (track) {
			let choices = 0;
			let nochoice = '';

			let html = '<ul>';
			if (directions != 'decrease') {
				if (thirteen_self.getDefcon(player_getting_moved, track) < 8) {
					choices++;
					nochoice = 'increase';
					html += `<li class="card nocard" id="increase">escalate!</li>`;
				}
			}
			if (directions != 'increase') {
				if (thirteen_self.getDefcon(player_getting_moved, track) > 1) {
					choices++;
					nochoice = 'decrease';
					html += `<li class="card nocard" id="decrease">de-escalate</li>`;
				}
			}
			html += '<li class="card nocard" id="done">finish move</li>';
			html += '</ul>';

			if (choices === 1) {
				chooseamount(track, nochoice);
				return;
			}

			thirteen_self.updateStatusWithOptions(
				`escalate or de-escalate ${
					defcon_tracks[track - 1]
				} defcon track for ${
					player == player_getting_moved ? 'you' : 'your opponent'
				}?`,
				html,
				true
			);

			thirteen_self.attachCardboxEvents(function (direction) {
				if (direction == 'done') {
					runCallback(0);
				}

				chooseamount(track, direction);
			});
		};

		const chooseamount = function (track, direction) {
			let multiplier = direction == 'decrease' ? -1 : 1;
			let current = thirteen_self.getDefcon(player_getting_moved, track);

			if (number != 1) {
				let html3 = '<ul>';
				for (let i = 1; i <= number; i++) {
					let value = multiplier * i + current;
					if (value <= 1 || value >= 8) {
						break;
					}
					html3 += `<li class="card nocard" id="${i}">${i}</li>`;
				}
				html3 += `<li class="card nocard" id="done">finish move</li></ul>`;

				thirteen_self.updateStatusWithOptions(
					`${direction} ${defcon_tracks[track - 1]} by how much?`,
					html3,
					true
				);
				thirteen_self.attachCardboxEvents(function (num) {
					if (num === 'done') {
						runCallback(0);
						return;
					}

					num = parseInt(num);

					thirteen_self.addMove(
						`${direction}_defcon\t${player_getting_moved}\t${track}\t${num}`
					);
					runCallback(num);
				});
			} else {
				thirteen_self.addMove(
					`${direction}_defcon\t${player_getting_moved}\t${track}\t1`
				);
				runCallback(1);
			}
		};

		choosetrack();
	}

	//
	// number = 100 = place in only 1 battleground, max_per_arena number permitted
	//

	eventAddInfluence(
		player,
		player_added,
		options,
		number,
		max_per_arena,
		defcon_trigger = 0,
		mycallback = null
	) {
		let thirteen_self = this;
		let battleground_selected = '';

		this.attachCardboxEvents(function (action) {
			if (action == 'done') {
				if (mycallback) {
					mycallback();
				} else {
					thirteen_self.endTurn();
				}
			}
		});

		let placed = {};
		let total_placed = 0;

		this.removeEventsFromBoard();

		for (let bg of options) {
			placed[bg] = 0;
			$(`#${bg}`).addClass('active_battleground');
		}

		$('.active_battleground').off();
		$('.active_battleground').on('click', function () {
			let arena_id = $(this).attr('id');

			// Not sure which event requires user to select one battleground and add an optional amount of influence
			if (number == 100) {
				if (battleground_selected == '') {
					battleground_selected = arena_id;
				} else {
					if (arena_id != battleground_selected) {
						salert(
							'you can only add to one country. click done when done.'
						);
						return;
					}
				}
			}

			if (placed[arena_id] >= max_per_arena) {
				salert('you cannot place more influence there.');
				return;
			}

			if (thirteen_self.addInfluence(player_added, arena_id, 1)) {
				total_placed++;
				placed[arena_id]++;

				thirteen_self.addMove(
					'add_influence\t' +
						player_added +
						'\t' +
						arena_id +
						'\t' +
						'1' +
						'\t' +
						thirteen_self.game.player
				);
				thirteen_self.showBoard();

				//Short cut so we know we are done in that special case?
				if (number == 100 && total_placed >= max_per_arena) {
					number = max_per_arena;
				}

				//
				// have we hit our influence limit?
				let hit_influence_limit =
					(player_added == 1 &&
						thirteen_self.game.state.influence_on_board_ussr ==
							17) ||
					(player_added == 2 &&
						thirteen_self.game.state.influence_on_board_us == 17);

				if (total_placed >= number || hit_influence_limit) {
					$('.active_battleground').off();

					//
					// manipulate defcon
					//
					if (defcon_trigger == 1) {
						for (var z in placed) {
							let defcon_adjustment = Math.max(0, placed[z] - 1);
							if (defcon_adjustment > 0) {
								let defcon_track =
									thirteen_self.returnDefconFromBattleground(
										z
									);

								thirteen_self.addMove(
									'increase_defcon\t' +
										thirteen_self.game.player +
										'\t' +
										defcon_track +
										'\t' +
										defcon_adjustment
								);
							}
						}
					}

					if (mycallback) {
						mycallback();
					} else {
						thirteen_self.endTurn();
					}
				}
			} else {
				salert('you cannot place more influence there.');
			}
		});
	}

	//
	// number has special codes 100 == as many as you want (from 1 arena), in which case max_per_arena isn't used
	// 			      101 == half, rounded up, in which case max_per_area is how many battlegrounds
	//
	eventRemoveInfluence(
		player,
		player_removed,
		options,
		number,
		max_per_arena,
		defcon_trigger = 0,
		mycallback = null
	) {
		let thirteen_self = this;
		let battleground_selected = '';
		let max_to_remove = -1;
		let placed = {};
		let total_placed = 0;

		const runCallback = function (total_shifted) {
			if (mycallback) {
				console.log('Running callback funtion');
				mycallback(total_shifted);
			} else {
				console.log('No callback, ending turn');
				thirteen_self.endTurn();
			}
		};

		this.removeEventsFromBoard();
		this.attachCardboxEvents(function (action) {
			if (action == 'done') {
				runCallback(total_placed);
			}
		});

		for (let bg of options) {
			placed[bg] = 0;
			$(`#${bg}`).addClass('active_battleground');
		}

		$('.active_battleground').off();
		$('.active_battleground').on('click', function () {
			let arena_id = $(this).attr('id');

			//
			// remove half
			if (number == 101) {
				let x =
					player_removed == 1
						? thirteen_self.game.arenas[arena_id].ussr
						: thirteen_self.game.arenas[arena_id].us;
				let total_to_remove = Math.ceil(x / 2);

				if (
					thirteen_self.removeInfluence(
						player_removed,
						arena_id,
						total_to_remove
					)
				) {
					thirteen_self.addMove(
						'remove_influence\t' +
							player_removed +
							'\t' +
							arena_id +
							'\t' +
							total_to_remove +
							'\t' +
							thirteen_self.game.player
					);
					thirteen_self.showBoard();
					runCallback(total_placed);
					return;
				}
			}

			if (number == 100) {
				if (!battleground_selected) {
					battleground_selected = arena_id;
					if (player_removed == 1) {
						max_to_remove =
							thirteen_self.game.arenas[arena_id].ussr;
					}
					if (player_removed == 2) {
						max_to_remove = thirteen_self.game.arenas[arena_id].us;
					}
					max_per_arena = max_to_remove;
				} else {
					if (arena_id != battleground_selected) {
						salert(
							'you can only remove from one battleground. click done when done.'
						);
					}
				}
			}

			if (placed[arena_id] > max_per_arena) {
				salert('you cannot remove any additional influence there.');
			} else {
				if (
					thirteen_self.removeInfluence(player_removed, arena_id, 1)
				) {
					total_placed++;
					placed[arena_id]++;

					thirteen_self.addMove(
						'remove_influence\t' +
							player_removed +
							'\t' +
							arena_id +
							'\t' +
							'1' +
							'\t' +
							thirteen_self.game.player
					);
					thirteen_self.showBoard();

					if (number == 100 && total_placed >= max_to_remove) {
						number = total_placed;
					}

					if (total_placed >= number) {
						$('.active_battleground').off();

						if (defcon_trigger == 1) {
							for (var z in placed) {
								let defcon_adjustment = placed[z] - 1;

								if (defcon_adjustment > 0) {
									let defcon_track =
										thirteen_self.returnDefconFromBattleground(
											z
										);

									thirteen_self.addMove(
										'decrease_defcon\t' +
											thirteen_self.game.player +
											'\t' +
											defcon_track +
											'\t' +
											defcon_adjustment
									);
								}
							}
						}

						runCallback(total_placed);
					}
				} else {
					salert('you cannot remove more influence there.');
				}
			}
		});
	}

	adjustInfluence(player, tokens) {
		//Includes possible penalties (as -1)
		if (player == 1) {
			tokens += this.game.state.ussr_command_token_bonus;
		}
		if (player == 2) {
			tokens += this.game.state.us_command_token_bonus;
		}
		tokens = Math.max(tokens, 1);

		//
		// personal letter bonus if played
		//
		tokens += this.game.state.personal_letter_bonus;

		return tokens;
	}

	playerPlaceCommandTokens(player, tokens) {
		let thirteen_self = this;

		tokens = this.adjustInfluence(player, tokens);

		this.updateStatusWithOptions(
			`Pick a battleground to add/remove up to ${tokens} cubes:`,
			`<ul><li class="card nocard" id="done">finish</li></ul>`
		);
		this.attachCardboxEvents(function (card) {
			if (card === 'done') {
				thirteen_self.endTurn();
			}
		});

		$('.country').off();
		$('.country').on('click', function () {
			$('.country').off();
			pickDirection($(this).attr('id'));
		});

		const pickDirection = (arena) => {
			let currentTokens =
				player == 1
					? thirteen_self.game.arenas[arena].ussr
					: thirteen_self.game.arenas[arena].us;
			let choice = '';
			let choices = 0;
			let html = `<ul>`;
			if (currentTokens < 5) {
				html += `<li class="card nocard" id="addtokens">add command tokens</li>`;
				choice = 'addtokens';
				choices++;
			}
			if (currentTokens > 0) {
				html +=
					'<li class="card nocard" id="removetokens">remove command tokens</li>';
				choice = 'removetokens';
				choices++;
			}
			html += `<li class="card nocard" id="done">end turn</li>`;
			html += '</ul>';

			if (choices == 1) {
				pickAmount(arena, choice);
			} else {
				thirteen_self.updateStatusWithOptions(
					`do you wish to add or remove command tokens?`,
					html
				);
				thirteen_self.attachCardboxEvents(function (action) {
					if (action == 'done') {
						thirteen_self.endTurn();
						return;
					}
					pickAmount(arena, action);
				});
			}
		};

		const pickAmount = (arena, direction) => {
			let html = '<ul>';
			let currentTokens =
				player == 1
					? thirteen_self.game.arenas[arena].ussr
					: thirteen_self.game.arenas[arena].us;

			if (direction == 'addtokens') {
				for (
					let i = currentTokens, j = 1;
					i < 5 && j <= tokens;
					i++, j++
				) {
					html += `<li class="card nocard" id="${j}">${j}</li>`;
				}
				html += `<li class="card nocard" id="done">end turn</li>`;
				html += '</ul>';

				thirteen_self.updateStatusWithOptions(
					`how many command tokens do you wish to add?`,
					html
				);
				thirteen_self.attachCardboxEvents(function (number) {
					if (number == 'done') {
						thirteen_self.endTurn();
						return;
					}
					let defcon_increase = parseInt(number) - 1;
					let defcon_track =
						thirteen_self.returnDefconFromBattleground(arena);

					if (
						thirteen_self.addInfluence(
							thirteen_self.game.player,
							arena,
							parseInt(number)
						)
					) {
						thirteen_self.addMove(
							`notify\t${
								thirteen_self.roles[thirteen_self.game.player]
							} adds ${number} cubes to ${
								thirteen_self.game.arenas[arena].name
							}\t${thirteen_self.game.player}`
						);
						thirteen_self.addMove(
							'add_influence\t' +
								thirteen_self.game.player +
								'\t' +
								arena +
								'\t' +
								number +
								'\t' +
								thirteen_self.game.player
						);

						if (defcon_increase > 0) {
							thirteen_self.addMove(
								'increase_defcon\t' +
									thirteen_self.game.player +
									'\t' +
									defcon_track +
									'\t' +
									defcon_increase
							);
						}

						thirteen_self.endTurn();
					}
				});
			}

			if (direction == 'removetokens') {
				for (let i = 1; i <= currentTokens && i <= tokens; i++) {
					html += `<li class="card nocard" id="${i}">${i}</li>`;
				}
				html += '</ul>';

				thirteen_self.updateStatusWithOptions(
					`how many command tokens do you wish to remove?`,
					html
				);
				thirteen_self.attachCardboxEvents(function (number) {
					let defcon_decrease = parseInt(number) - 1;
					let defcon_track =
						thirteen_self.returnDefconFromBattleground(arena);

					if (
						thirteen_self.removeInfluence(
							thirteen_self.game.player,
							arena,
							parseInt(number)
						)
					) {
						thirteen_self.addMove(
							'remove_influence\t' +
								thirteen_self.game.player +
								'\t' +
								arena +
								'\t' +
								number +
								'\t' +
								thirteen_self.game.player
						);

						if (defcon_decrease > 0) {
							thirteen_self.addMove(
								'decrease_defcon\t' +
									thirteen_self.game.player +
									'\t' +
									defcon_track +
									'\t' +
									defcon_decrease
							);
						}
						thirteen_self.endTurn();
					}
				});
			}
		};
	}

	returnInitiative() {
		if (this.game.state.prestige_track == 7) {
			return 'ussr';
		}
		if (this.game.state.prestige_track < 7) {
			return 'us';
		}
		if (this.game.state.prestige_track > 7) {
			return 'ussr';
		}
	}

	///////////////////////
	// display functions //
	///////////////////////
	showRoundTrack() {
		$('.round_slot').html('');
		$('<img src="/thirteen/img/Round%20Marker.png" />').appendTo(
			`#round_${this.game.state.round}`
		);
	}

	returnDefconFromBattleground(battleground) {
		if (battleground == 'cuba_mil') {
			return 1;
		}
		if (battleground == 'atlantic') {
			return 1;
		}
		if (battleground == 'berlin') {
			return 1;
		}
		if (battleground == 'cuba_pol') {
			return 2;
		}
		if (battleground == 'turkey') {
			return 2;
		}
		if (battleground == 'italy') {
			return 2;
		}
		if (battleground == 'un') {
			return 3;
		}
		if (battleground == 'television') {
			return 3;
		}
		if (battleground == 'alliances') {
			return 3;
		}

		return -1;
	}

	getDefcon(player, track) {
		if (player == 1) {
			if (track == 1) {
				return this.game.state.defcon1_ussr;
			}
			if (track == 2) {
				return this.game.state.defcon2_ussr;
			}
			if (track == 3) {
				return this.game.state.defcon3_ussr;
			}
		}

		if (player == 2) {
			if (track == 1) {
				return this.game.state.defcon1_us;
			}
			if (track == 2) {
				return this.game.state.defcon2_us;
			}
			if (track == 3) {
				return this.game.state.defcon3_us;
			}
		}
		return -1;
	}

	updateDefcon(player, track, num) {
		if (player == 1) {
			if (track == 1) {
				this.game.state.defcon1_ussr += num;
				if (this.game.state.defcon1_ussr > 8) {
					this.game.state.defcon1_ussr = 8;
				}
				if (this.game.state.defcon1_ussr < 1) {
					this.game.state.defcon1_ussr = 1;
				}
			}
			if (track == 2) {
				this.game.state.defcon2_ussr += num;
				if (this.game.state.defcon2_ussr > 8) {
					this.game.state.defcon2_ussr = 8;
				}
				if (this.game.state.defcon2_ussr < 1) {
					this.game.state.defcon2_ussr = 1;
				}
			}
			if (track == 3) {
				this.game.state.defcon3_ussr += num;
				if (this.game.state.defcon3_ussr > 8) {
					this.game.state.defcon3_ussr = 8;
				}
				if (this.game.state.defcon3_ussr < 1) {
					this.game.state.defcon3_ussr = 1;
				}
			}
		}

		if (player == 2) {
			if (track == 1) {
				this.game.state.defcon1_us += num;
				if (this.game.state.defcon1_us > 8) {
					this.game.state.defcon1_us = 8;
				}
				if (this.game.state.defcon1_us < 1) {
					this.game.state.defcon1_us = 1;
				}
			}
			if (track == 2) {
				this.game.state.defcon2_us += num;
				if (this.game.state.defcon2_us > 8) {
					this.game.state.defcon2_us = 8;
				}
				if (this.game.state.defcon2_us < 1) {
					this.game.state.defcon2_us = 1;
				}
			}
			if (track == 3) {
				this.game.state.defcon3_us += num;
				if (this.game.state.defcon3_us > 8) {
					this.game.state.defcon3_us = 8;
				}
				if (this.game.state.defcon3_us < 1) {
					this.game.state.defcon3_us = 1;
				}
			}
		}

		this.showBoard();
	}

	/* Defcon Tracks run from 1 - 8 (inclusive) */
	showDefconTracks() {
		//Remove all tokens
		$('.defcon_track_slot').html('');

		//Place them anew
		$(
			'<img src="/thirteen/img/Blue%20Disc.png" class="defcon_disc_us" />'
		).appendTo($(`#defcon_track_1_${this.game.state.defcon1_us}`));
		$(
			'<img src="/thirteen/img/Red%20Disc.png" class="defcon_disc_ussr" />'
		).appendTo($(`#defcon_track_1_${this.game.state.defcon1_ussr}`));

		$(
			'<img src="/thirteen/img/Blue%20Disc.png" class="defcon_disc_us" />'
		).appendTo($(`#defcon_track_2_${this.game.state.defcon2_us}`));
		$(
			'<img src="/thirteen/img/Red%20Disc.png" class="defcon_disc_ussr" />'
		).appendTo($(`#defcon_track_2_${this.game.state.defcon2_ussr}`));

		$(
			'<img src="/thirteen/img/Blue%20Disc.png" class="defcon_disc_us" />'
		).appendTo($(`#defcon_track_3_${this.game.state.defcon3_us}`));
		$(
			'<img src="/thirteen/img/Red%20Disc.png" class="defcon_disc_ussr" />'
		).appendTo($(`#defcon_track_3_${this.game.state.defcon3_ussr}`));
	}

	showPrestigeTrack() {
		for (let i = 1; i < 14; i++) {
			let divname = '.prestige_slot_' + i;

			if (this.game.state.prestige_track == i) {
				$(divname).html('<img src="/thirteen/img/VP%20Marker.png" />');
			} else {
				$(divname).html('');
			}
		}
	}

	showArenas() {
		this.game.state.influence_on_board_us = 0;
		this.game.state.influence_on_board_ussr = 0;

		for (var i in this.game.arenas) {
			this.showInfluence(i);
		}
	}

	showFlags() {
		for (var i in this.game.flags) {
			let divname = '#' + i;
			$(divname).html('');
		}

		for (let i = 0; i < this.game.state.us_agendas.length; i++) {
			let divname = '#' + this.game.state.us_agendas[i];
			$(divname).append(
				'<img src="/thirteen/img/nUS%20Tile%20with%20bleed.png" style="z-index:12;left:0px;position:relative;top:0px;"/>'
			);
		}
		for (let i = 0; i < this.game.state.ussr_agendas.length; i++) {
			let divname = '#' + this.game.state.ussr_agendas[i];
			$(divname).append(
				'<img src="/thirteen/img/nUSSR%20Tile%20with%20bleed.png" style="z-index:10;left:0px;position:relative;top:0px;" />'
			);
		}
	}

	showBoard() {
		if (this.browser_active == 0) {
			return;
		}

		this.showArenas();
		this.showFlags();
		this.showRoundTrack();
		this.showPrestigeTrack();
		this.showDefconTracks();

		$(this.returnCardImage(this.game.state.ussr_agenda_selected)).appendTo(
			'#ussr_agenda'
		);
		$(this.returnCardImage(this.game.state.us_agenda_selected)).appendTo(
			'#us_agenda'
		);

		$('#agenda_discard').html('');
		let offset = 0;
		for (let card of this.used_agendas) {
			$(this.returnCardImage(card))
				.appendTo('#agenda_discard')
				.css({ left: `${offset}px`, top: `${offset}px` });
			offset += 2;
		}

		//Scoreboard
		let html = `<div class="ussr_tokens">USSR: ${
			17 - this.game.state.influence_on_board_ussr
		}</div>`;
		html += `<div class="us_tokens">US: ${
			17 - this.game.state.influence_on_board_us
		}</div>`;
		this.scoreboard.update(html);
	}

	showInfluence(arena_id) {
		let width = 100;
		let cubes = 0;

		let y = [-10, 0, -34, -25, -135];
		let x = [15, 14, 12, 10, 44];

		//
		// us cubes
		//
		cubes = this.game.arenas[arena_id].us;

		this.game.state.influence_on_board_us += cubes;
		let html = '';

		if (cubes > 0) {
			let starting_point = width / 2;
			let cube_gap = 50;
			if (cubes > 1) {
				starting_point = 0;
				cube_gap = width / cubes - 10;
			}

			for (let z = 0; z < cubes; z++) {
				html += `<img class="cube" src="/thirteen/img/Blue%20Cube.png" style="top:${this.scale(
					y[z]
				)}px;left:${this.scale(x[z])}px;" />`;
				starting_point += cube_gap;
			}
		}

		$(`#${arena_id} > .us`).html(html);

		//
		// ussr cubes
		//

		cubes = this.game.arenas[arena_id].ussr;
		this.game.state.influence_on_board_ussr += cubes;
		html = '';

		if (cubes > 0) {
			let starting_point = width / 2;
			let cube_gap = 50;
			if (cubes > 1) {
				starting_point = 0;
				cube_gap = width / cubes - 10;
			}

			for (let z = 0; z < cubes; z++) {
				html += `<img class="cube" src="/thirteen/img/Red%20Cube.png" style="-webkit-transform:scaleX(-1);transform: scaleX(-1);top:${this.scale(
					y[z]
				)}px;left:${this.scale(x[z])}px;" />`;
				starting_point += cube_gap;
			}
		}

		$(`#${arena_id} > .ussr`).html(html);
	}

	////////////////////
	// core game data //
	////////////////////
	returnState() {
		var state = {};

		state.aftermath_us = [];
		state.aftermath_ussr = [];

		state.prestige_track = 7;
		state.round = 0;

		state.influence_on_board_us = 2;
		state.influence_on_board_ussr = 2;

		state.defcon1_us = 1;
		state.defcon1_ussr = 2;
		state.defcon2_us = 2;
		state.defcon2_ussr = 1;
		state.defcon3_us = 1;
		state.defcon3_ussr = 1;

		state.personal_letter = 2;
		state.personal_letter_bonus = 0;

		state.us_agendas = [];
		state.ussr_agendas = [];
		state.us_agenda_selected = '';
		state.ussr_agenda_selected = '';

		state.ussr_command_token_bonus = 0;
		state.us_command_token_bonus = 0;
		state.ussr_cannot_deflate_defcon_from_events = 0;
		state.us_cannot_deflate_defcon_from_events = 0;

		state.initiative = 'ussr';

		return state;
	}

	returnRoundTrack() {
		let slots = {};

		slots['round_1'] = {
			top: 1122,
			left: 526
		};
		slots['round_2'] = {
			top: 1110,
			left: 598
		};
		slots['round_3'] = {
			top: 1100,
			left: 664
		};
		slots['round_4'] = {
			top: 1090,
			left: 750
		};

		return slots;
	}

	returnPrestigeTrack() {
		let slots = {};

		slots['prestige_slot_1'] = {
			top: 172,
			left: 1050
		};
		slots['prestige_slot_2'] = {
			top: 172,
			left: 1120
		};
		slots['prestige_slot_3'] = {
			top: 173,
			left: 1180
		};
		slots['prestige_slot_4'] = {
			top: 174,
			left: 1230
		};
		slots['prestige_slot_5'] = {
			top: 174,
			left: 1280
		};
		slots['prestige_slot_6'] = {
			top: 175,
			left: 1335
		};
		slots['prestige_slot_7'] = {
			top: 175,
			left: 1385
		};
		slots['prestige_slot_8'] = {
			top: 175,
			left: 1440
		};
		slots['prestige_slot_9'] = {
			top: 176,
			left: 1490
		};
		slots['prestige_slot_10'] = {
			top: 177,
			left: 1545
		};
		slots['prestige_slot_11'] = {
			top: 178,
			left: 1595
		};
		slots['prestige_slot_12'] = {
			top: 179,
			left: 1650
		};
		slots['prestige_slot_13'] = {
			top: 180,
			left: 1725
		};

		return slots;
	}

	returnDefconTracks() {
		let slots = {};

		slots['defcon_track_1_1'] = {
			top: 1123,
			left: 1814
		};
		slots['defcon_track_2_1'] = {
			top: 1123,
			left: 1877
		};
		slots['defcon_track_3_1'] = {
			top: 1123,
			left: 1940
		};

		slots['defcon_track_1_2'] = {
			top: 1061,
			left: 1814
		};
		slots['defcon_track_2_2'] = {
			top: 1061,
			left: 1877
		};
		slots['defcon_track_3_2'] = {
			top: 1061,
			left: 1940
		};

		slots['defcon_track_1_3'] = {
			top: 998,
			left: 1814
		};
		slots['defcon_track_2_3'] = {
			top: 998,
			left: 1877
		};
		slots['defcon_track_3_3'] = {
			top: 998,
			left: 1940
		};

		slots['defcon_track_1_4'] = {
			top: 936,
			left: 1814
		};
		slots['defcon_track_2_4'] = {
			top: 936,
			left: 1877
		};
		slots['defcon_track_3_4'] = {
			top: 936,
			left: 1940
		};

		slots['defcon_track_1_5'] = {
			top: 872,
			left: 1814
		};
		slots['defcon_track_2_5'] = {
			top: 872,
			left: 1877
		};
		slots['defcon_track_3_5'] = {
			top: 872,
			left: 1940
		};

		slots['defcon_track_1_6'] = {
			top: 811,
			left: 1814
		};
		slots['defcon_track_2_6'] = {
			top: 811,
			left: 1877
		};
		slots['defcon_track_3_6'] = {
			top: 811,
			left: 1940
		};

		slots['defcon_track_1_7'] = {
			top: 749,
			left: 1814
		};
		slots['defcon_track_2_7'] = {
			top: 749,
			left: 1877
		};
		slots['defcon_track_3_7'] = {
			top: 749,
			left: 1940
		};

		slots['defcon_track_1_8'] = {
			top: 684,
			left: 1814
		};
		slots['defcon_track_2_8'] = {
			top: 684,
			left: 1877
		};
		slots['defcon_track_3_8'] = {
			top: 684,
			left: 1940
		};

		return slots;
	}

	returnFlags() {
		var flags = {};

		flags['cuba_pol_flag'] = {
			top: 500,
			left: 710
		};

		flags['cuba_mil_flag'] = {
			top: 845,
			left: 810
		};

		flags['atlantic_flag'] = {
			top: 510,
			left: 1040
		};

		flags['berlin_flag'] = {
			top: 290,
			left: 1340
		};

		flags['turkey_flag'] = {
			top: 290,
			left: 1660
		};

		flags['italy_flag'] = {
			top: 530,
			left: 1615
		};

		flags['un_flag'] = {
			top: 710,
			left: 1300
		};

		flags['television_flag'] = {
			top: 965,
			left: 1190
		};

		flags['alliances_flag'] = {
			top: 885,
			left: 1630
		};

		flags['military_flag'] = {
			top: 567,
			left: 1815
		};

		flags['political_flag'] = {
			top: 567,
			left: 1877
		};

		flags['world_opinion_flag'] = {
			top: 566,
			left: 1940
		};

		flags['personal_letter_flag'] = {
			top: 1280,
			left: 1150
		};

		return flags;
	}

	returnArenas() {
		var arenas = {};

		arenas['cuba_pol'] = {
			top: 570,
			left: 520,
			us: 0,
			ussr: 0,
			name: 'Cuba (political)'
		};
		arenas['cuba_mil'] = {
			top: 915,
			left: 620,
			us: 0,
			ussr: 1,
			name: 'Cuba (military)'
		};
		arenas['atlantic'] = {
			top: 580,
			left: 850,
			us: 0,
			ussr: 0,
			name: 'Atlantic'
		};
		arenas['berlin'] = {
			top: 360,
			left: 1150,
			us: 0,
			ussr: 1,
			name: 'Berlin'
		};
		arenas['turkey'] = {
			top: 360,
			left: 1470,
			us: 1,
			ussr: 0,
			name: 'Turkey'
		};
		arenas['italy'] = {
			top: 600,
			left: 1425,
			us: 1,
			ussr: 0,
			name: 'Italy'
		};
		arenas['un'] = {
			top: 780,
			left: 1110,
			us: 0,
			ussr: 0,
			name: 'United Nations'
		};
		arenas['television'] = {
			top: 1035,
			left: 1000,
			us: 0,
			ussr: 0,
			name: 'Television'
		};
		arenas['alliances'] = {
			top: 955,
			left: 1440,
			us: 0,
			ussr: 0,
			name: 'Alliances'
		};

		return arenas;
	}

	returnCardImage(card) {
		if (card === 'personal_letter') {
			return `<img class="cardimg" id="personal_letter" src="/thirteen/img/Agenda%20Card%2013b.png"/>`;
		}

		if (this.agendas[card]) {
			return `<img class="agenda_card cardimg" src="/thirteen/img/${this.agendas[card].img}" id="${card}"/>`;
		}
		if (this.strategies[card]) {
			return `<img class="strategy_card cardimg" src="/thirteen/img/${this.strategies[card].img}" id="${card}"/>`;
		}
		return '';
	}

	returnAgendaCards() {
		let deck = {};
		let thirteen_self = this;

		deck['a01b'] = {
			img: 'Agenda Card 01b.png',
			name: 'Military Track',
			flag: 'military_flag',
			score: function () {
				let winner = 0;
				let difference = 0;

				//
				// DEFCON 2 players escalated
				//
				if (
					thirteen_self.game.state.defcon1_us > 3 &&
					thirteen_self.game.state.defcon1_us < 6
				) {
					thirteen_self.game.state.defcon1_us++;
				}
				if (
					thirteen_self.game.state.defcon1_ussr > 3 &&
					thirteen_self.game.state.defcon1_ussr < 6
				) {
					thirteen_self.game.state.defcon1_ussr++;
				}

				//
				// find winner and difference
				//
				if (
					thirteen_self.game.state.defcon1_us >
					thirteen_self.game.state.defcon1_ussr
				) {
					winner = 2;
					difference =
						thirteen_self.game.state.defcon1_us -
						thirteen_self.game.state.defcon1_ussr;
				}
				if (
					thirteen_self.game.state.defcon1_us <
					thirteen_self.game.state.defcon1_ussr
				) {
					winner = 1;
					difference =
						thirteen_self.game.state.defcon1_ussr -
						thirteen_self.game.state.defcon1_us;
				}

				if (winner == 0) {
					return 0;
				}
				if (winner == 1) {
					return difference + 1;
				}
				if (winner == 2) {
					return (difference + 1) * -1;
				}
			}
		};
		deck['a02b'] = {
			img: 'Agenda Card 02b.png',
			name: 'Military Track',
			flag: 'military_flag',
			score: function () {
				let winner = 0;
				let difference = 0;

				//
				// DEFCON 2 players escalated
				//
				if (
					thirteen_self.game.state.defcon1_us > 3 &&
					thirteen_self.game.state.defcon1_us < 6
				) {
					thirteen_self.game.state.defcon1_us++;
				}
				if (
					thirteen_self.game.state.defcon1_ussr > 3 &&
					thirteen_self.game.state.defcon1_ussr < 6
				) {
					thirteen_self.game.state.defcon1_ussr++;
				}

				//
				// find winner and difference
				//
				if (
					thirteen_self.game.state.defcon1_us >
					thirteen_self.game.state.defcon1_ussr
				) {
					winner = 2;
					difference =
						thirteen_self.game.state.defcon1_us -
						thirteen_self.game.state.defcon1_ussr;
				}
				if (
					thirteen_self.game.state.defcon1_us <
					thirteen_self.game.state.defcon1_ussr
				) {
					winner = 1;
					difference =
						thirteen_self.game.state.defcon1_ussr -
						thirteen_self.game.state.defcon1_us;
				}

				if (winner == 0) {
					return 0;
				}
				if (winner == 1) {
					return difference + 1;
				}
				if (winner == 2) {
					return (difference + 1) * -1;
				}
			}
		};
		deck['a03b'] = {
			img: 'Agenda Card 03b.png',
			name: 'Political Track',
			flag: 'political_flag',
			score: function () {
				let winner = 0;
				let difference = 0;

				//
				// DEFCON 2 players escalated
				//
				if (
					thirteen_self.game.state.defcon2_us > 3 &&
					thirteen_self.game.state.defcon2_us < 6
				) {
					thirteen_self.game.state.defcon2_us++;
				}
				if (
					thirteen_self.game.state.defcon2_ussr > 3 &&
					thirteen_self.game.state.defcon2_ussr < 6
				) {
					thirteen_self.game.state.defcon2_ussr++;
				}

				//
				// find winner and difference
				//
				if (
					thirteen_self.game.state.defcon2_us >
					thirteen_self.game.state.defcon2_ussr
				) {
					winner = 2;
					difference =
						thirteen_self.game.state.defcon2_us -
						thirteen_self.game.state.defcon2_ussr;
				}
				if (
					thirteen_self.game.state.defcon2_us <
					thirteen_self.game.state.defcon2_ussr
				) {
					winner = 1;
					difference =
						thirteen_self.game.state.defcon2_ussr -
						thirteen_self.game.state.defcon2_us;
				}

				if (winner == 0) {
					return 0;
				}
				if (winner == 1) {
					return difference + 1;
				}
				if (winner == 2) {
					return (difference + 1) * -1;
				}
			}
		};
		deck['a04b'] = {
			img: 'Agenda Card 04b.png',
			name: 'Political Track',
			flag: 'political_flag',
			score: function () {
				let winner = 0;
				let difference = 0;

				//
				// DEFCON 2 players escalated
				//
				if (
					thirteen_self.game.state.defcon2_us > 3 &&
					thirteen_self.game.state.defcon2_us < 6
				) {
					thirteen_self.game.state.defcon2_us++;
				}
				if (
					thirteen_self.game.state.defcon2_ussr > 3 &&
					thirteen_self.game.state.defcon2_ussr < 6
				) {
					thirteen_self.game.state.defcon2_ussr++;
				}

				//
				// find winner and difference
				//
				if (
					thirteen_self.game.state.defcon2_us >
					thirteen_self.game.state.defcon2_ussr
				) {
					winner = 2;
					difference =
						thirteen_self.game.state.defcon2_us -
						thirteen_self.game.state.defcon2_ussr;
				}
				if (
					thirteen_self.game.state.defcon2_us <
					thirteen_self.game.state.defcon2_ussr
				) {
					winner = 1;
					difference =
						thirteen_self.game.state.defcon2_ussr -
						thirteen_self.game.state.defcon2_us;
				}

				if (winner == 0) {
					return 0;
				}
				if (winner == 1) {
					return difference + 1;
				}
				if (winner == 2) {
					return (difference + 1) * -1;
				}
			}
		};
		deck['a05b'] = {
			img: 'Agenda Card 05b.png',
			name: 'World Opinion Track',
			flag: 'world_opinion_flag',
			score: function () {
				let winner = 0;
				let difference = 0;

				//
				// DEFCON 2 players escalated
				//
				if (
					thirteen_self.game.state.defcon3_us > 3 &&
					thirteen_self.game.state.defcon333_us < 6
				) {
					thirteen_self.game.state.defcon3_us++;
				}
				if (
					thirteen_self.game.state.defcon3_ussr > 3 &&
					thirteen_self.game.state.defcon3_ussr < 6
				) {
					thirteen_self.game.state.defcon3_ussr++;
				}

				//
				// find winner and difference
				//
				if (
					thirteen_self.game.state.defcon3_us >
					thirteen_self.game.state.defcon3_ussr
				) {
					winner = 2;
					difference =
						thirteen_self.game.state.defcon3_us -
						thirteen_self.game.state.defcon3_ussr;
				}
				if (
					thirteen_self.game.state.defcon3_us <
					thirteen_self.game.state.defcon3_ussr
				) {
					winner = 1;
					difference =
						thirteen_self.game.state.defcon3_ussr -
						thirteen_self.game.state.defcon3_us;
				}

				if (winner == 0) {
					return 0;
				}
				if (winner == 1) {
					return difference + 1;
				}
				if (winner == 2) {
					return (difference + 1) * -1;
				}
			}
		};
		deck['a06b'] = {
			img: 'Agenda Card 06b.png',
			name: 'World Opinion Track',
			flag: 'world_opinion_flag',
			score: function () {
				let winner = 0;
				let difference = 0;

				//
				// DEFCON 2 players escalated
				//
				if (
					thirteen_self.game.state.defcon3_us > 3 &&
					thirteen_self.game.state.defcon3_us < 6
				) {
					thirteen_self.game.state.defcon3_us++;
				}
				if (
					thirteen_self.game.state.defcon3_ussr > 3 &&
					thirteen_self.game.state.defcon3_ussr < 6
				) {
					thirteen_self.game.state.defcon3_ussr++;
				}

				//
				// find winner and difference
				//
				if (
					thirteen_self.game.state.defcon3_us >
					thirteen_self.game.state.defcon3_ussr
				) {
					winner = 2;
					difference =
						thirteen_self.game.state.defcon3_us -
						thirteen_self.game.state.defcon3_ussr;
				}
				if (
					thirteen_self.game.state.defcon3_us <
					thirteen_self.game.state.defcon3_ussr
				) {
					winner = 1;
					difference =
						thirteen_self.game.state.defcon3_ussr -
						thirteen_self.game.state.defcon3_us;
				}

				if (winner == 0) {
					return 0;
				}
				if (winner == 1) {
					return difference + 1;
				}
				if (winner == 2) {
					return (difference + 1) * -1;
				}
			}
		};
		deck['a07b'] = {
			img: 'Agenda Card 07b.png',
			name: 'Turkey',
			flag: 'turkey_flag',
			score: function () {
				let winner = 0;
				let difference = 0;

				//
				// find winner and difference
				//
				if (
					thirteen_self.game.arenas['turkey'].us >
					thirteen_self.game.arenas['turkey'].ussr
				) {
					winner = 2;
					difference =
						thirteen_self.game.arenas['turkey'].us -
						thirteen_self.game.arenas['turkey'].ussr;
				}
				if (
					thirteen_self.game.arenas['turkey'].us <
					thirteen_self.game.arenas['turkey'].ussr
				) {
					winner = 1;
					difference =
						thirteen_self.game.arenas['turkey'].ussr -
						thirteen_self.game.arenas['turkey'].us;
				}

				if (winner == 0) {
					return 0;
				}
				if (winner == 1) {
					return difference + 1;
				}
				if (winner == 2) {
					return (difference + 1) * -1;
				}
			}
		};
		deck['a08b'] = {
			img: 'Agenda Card 08b.png',
			name: 'Berlin',
			flag: 'berlin_flag',
			score: function () {
				let winner = 0;
				let difference = 0;

				//
				// find winner and difference
				//
				if (
					thirteen_self.game.arenas['berlin'].us >
					thirteen_self.game.arenas['berlin'].ussr
				) {
					winner = 2;
					difference =
						thirteen_self.game.arenas['berlin'].us -
						thirteen_self.game.arenas['berlin'].ussr;
				}
				if (
					thirteen_self.game.arenas['berlin'].us <
					thirteen_self.game.arenas['berlin'].ussr
				) {
					winner = 1;
					difference =
						thirteen_self.game.arenas['berlin'].ussr -
						thirteen_self.game.arenas['berlin'].us;
				}

				if (winner == 0) {
					return 0;
				}
				if (winner == 1) {
					return difference + 1;
				}
				if (winner == 2) {
					return (difference + 1) * -1;
				}
			}
		};
		deck['a09b'] = {
			img: 'Agenda Card 09b.png',
			name: 'Italy',
			flag: 'italy_flag',
			score: function () {
				let winner = 0;
				let difference = 0;

				//
				// find winner and difference
				//
				if (
					thirteen_self.game.arenas['italy'].us >
					thirteen_self.game.arenas['italy'].ussr
				) {
					winner = 2;
					difference =
						thirteen_self.game.arenas['turkey'].us -
						thirteen_self.game.arenas['italy'].ussr;
				}
				if (
					thirteen_self.game.arenas['italy'].us <
					thirteen_self.game.arenas['italy'].ussr
				) {
					winner = 1;
					difference =
						thirteen_self.game.arenas['italy'].ussr -
						thirteen_self.game.arenas['italy'].us;
				}

				if (winner == 0) {
					return 0;
				}
				if (winner == 1) {
					return difference + 1;
				}
				if (winner == 2) {
					return (difference + 1) * -1;
				}
			}
		};
		deck['a10b'] = {
			img: 'Agenda Card 10b.png',
			name: 'Cuba (pol)',
			flag: 'cuba_pol_flag',
			score: function () {
				let winner = 0;
				let difference = 0;
				let bonus = 0;

				//
				// find winner and difference
				//
				if (
					thirteen_self.game.arenas['cuba_pol'].us >
					thirteen_self.game.arenas['cuba_pol'].ussr
				) {
					winner = 2;
					difference =
						thirteen_self.game.arenas['cuba_pol'].us -
						thirteen_self.game.arenas['cuba_pol'].ussr;
				}
				if (
					thirteen_self.game.arenas['cuba_pol'].us <
					thirteen_self.game.arenas['cuba_pol'].ussr
				) {
					winner = 1;
					difference =
						thirteen_self.game.arenas['cuba_pol'].ussr -
						thirteen_self.game.arenas['cuba_pol'].us;
				}

				if (winner == 1) {
					if (
						thirteen_self.game.arenas['cuba_mil'].ussr >
						thirteen_self.game.arenas['cuba_mil'].us
					) {
						difference++;
					}
					if (
						thirteen_self.game.arenas['atlantic'].ussr >
						thirteen_self.game.arenas['atlantic'].us
					) {
						difference++;
					}
				}

				if (winner == 2) {
					if (
						thirteen_self.game.arenas['cuba_mil'].ussr <
						thirteen_self.game.arenas['cuba_mil'].us
					) {
						difference++;
					}
					if (
						thirteen_self.game.arenas['atlantic'].ussr <
						thirteen_self.game.arenas['atlantic'].us
					) {
						difference++;
					}
				}

				if (winner == 0) {
					return 0;
				}
				if (winner == 1) {
					return difference + bonus;
				}
				if (winner == 2) {
					return (difference + bonus) * -1;
				}
			}
		};
		deck['a11b'] = {
			img: 'Agenda Card 11b.png',
			name: 'Cuba (mil)',
			flag: 'cuba_mil_flag',
			score: function () {
				let winner = 0;
				let difference = 0;
				let bonus = 0;

				//
				// find winner and difference
				//
				if (
					thirteen_self.game.arenas['cuba_mil'].us >
					thirteen_self.game.arenas['cuba_mil'].ussr
				) {
					winner = 2;
					difference =
						thirteen_self.game.arenas['cuba_mil'].us -
						thirteen_self.game.arenas['cuba_mil'].ussr;
				}
				if (
					thirteen_self.game.arenas['cuba_mil'].us <
					thirteen_self.game.arenas['cuba_mil'].ussr
				) {
					winner = 1;
					difference =
						thirteen_self.game.arenas['cuba_mil'].ussr -
						thirteen_self.game.arenas['cuba_mil'].us;
				}

				if (winner == 1) {
					if (
						thirteen_self.game.arenas['cuba_pol'].ussr >
						thirteen_self.game.arenas['cuba_pol'].us
					) {
						difference++;
					}
					if (
						thirteen_self.game.arenas['atlantic'].ussr >
						thirteen_self.game.arenas['atlantic'].us
					) {
						difference++;
					}
				}

				if (winner == 2) {
					if (
						thirteen_self.game.arenas['cuba_pol'].ussr <
						thirteen_self.game.arenas['cuba_pol'].us
					) {
						difference++;
					}
					if (
						thirteen_self.game.arenas['atlantic'].ussr <
						thirteen_self.game.arenas['atlantic'].us
					) {
						difference++;
					}
				}

				if (winner == 0) {
					return 0;
				}
				if (winner == 1) {
					return difference + bonus;
				}
				if (winner == 2) {
					return (difference + bonus) * -1;
				}
			}
		};
		deck['a12b'] = {
			img: 'Agenda Card 12b.png',
			name: 'Atlantic',
			flag: 'atlantic_flag',
			score: function () {
				let winner = 0;
				let difference = 0;
				let bonus = 0;

				//
				// find winner and difference
				//
				if (
					thirteen_self.game.arenas['atlantic'].us >
					thirteen_self.game.arenas['atlantic'].ussr
				) {
					winner = 2;
					difference =
						thirteen_self.game.arenas['atlantic'].us -
						thirteen_self.game.arenas['atlantic'].ussr;
				}
				if (
					thirteen_self.game.arenas['atlantic'].us <
					thirteen_self.game.arenas['atlantic'].ussr
				) {
					winner = 1;
					difference =
						thirteen_self.game.arenas['atlantic'].ussr -
						thirteen_self.game.arenas['atlantic'].us;
				}

				if (winner == 1) {
					if (
						thirteen_self.game.arenas['cuba_pol'].ussr >
						thirteen_self.game.arenas['cuba_pol'].us
					) {
						difference++;
					}
					if (
						thirteen_self.game.arenas['cuba_mil'].ussr >
						thirteen_self.game.arenas['cuba_mil'].us
					) {
						difference++;
					}
				}

				if (winner == 2) {
					if (
						thirteen_self.game.arenas['cuba_pol'].ussr <
						thirteen_self.game.arenas['cuba_pol'].us
					) {
						difference++;
					}
					if (
						thirteen_self.game.arenas['cuba_mil'].ussr <
						thirteen_self.game.arenas['cuba_mil'].us
					) {
						difference++;
					}
				}

				if (winner == 0) {
					return 0;
				}
				if (winner == 1) {
					return difference + bonus;
				}
				if (winner == 2) {
					return (difference + bonus) * -1;
				}
			}
		};
		deck['a13b'] = {
			img: 'Agenda Card 13b.png',
			name: 'Personal Letter',
			flag: 'personal_letter_flag',
			score: function () {
				if (thirteen_self.game.state.personal_letter == 1) {
					return 2;
				}
				if (thirteen_self.game.state.personal_letter == 2) {
					return -2;
				}
			}
		};

		return deck;
	}

	returnStrategyCards() {
		let thirteen_self = this;
		let deck = {};

		deck['s01b'] = {
			img: 'Strategy Card 01b.png',
			name: 'Speech to the Nation',
			text: 'Place up to three influence cubes in total on one or more world opinion battlegrounds. max 2 per battleground',
			side: 'neutral',
			tokens: 3,
			defcon: 0,
			event: function (player) {
				thirteen_self.updateStatusWithOptions(
					`${thirteen_self.cardToText(
						's01b'
					)}: Place up to three influence cubes in total on one or more world opinion battlegrounds (max 2 per battleground)`,
					`<ul><li class="card nocard" id="done">finish</li></ul>`
				);
				thirteen_self.eventAddInfluence(
					player,
					player,
					['un', 'television', 'alliances'],
					3,
					2,
					0
				);
			}
		};
		deck['s02b'] = {
			img: 'Strategy Card 02b.png',
			name: 'The Guns of August',
			text: 'Escalate/deflate one of your DEFCON tracks by up to 2 steps. Then Command 1 Influence cube',
			side: 'neutral',
			tokens: 3,
			defcon: 1,
			event: function (player) {
				// escalate / de-escalate DEFCON tracks by up to 2 steps
				thirteen_self.eventShiftDefcon(
					player,
					player,
					[1, 2, 3],
					2,
					'both',
					function (args) {
						thirteen_self.updateStatusWithOptions(
							'Command 1 Influence cube:',
							`<ul><li class="card nocard" id="done">finish</li></ul>`
						);
						thirteen_self.playerPlaceCommandTokens(player, 1);
					}
				);
			}
		};
		deck['s03b'] = {
			img: 'Strategy Card 03b.png',
			name: 'Fifty-Fifty',
			text: 'The player with the most Influence on the Television battleground may escalate / deflate two of their DEFCON tracks by 1 step (any mix)',
			side: 'neutral',
			tokens: 3,
			defcon: 0,
			event: function (player) {
				let who_goes = 0;
				if (
					thirteen_self.game.arenas['television'].us >
					thirteen_self.game.arenas['television'].ussr
				) {
					who_goes = 2;
				}
				if (
					thirteen_self.game.arenas['television'].us <
					thirteen_self.game.arenas['television'].ussr
				) {
					who_goes = 1;
				}

				if (who_goes == 0) {
					thirteen_self.addMove(
						'notify\tNeither player has more influence in Television Battleground'
					);
					thirteen_self.endTurn();
				} else {
					let options = thirteen_self.app.crypto.stringToBase64(
						JSON.stringify([1, 2, 3])
					);

					// escalate / de-escalate up to 2 DEFCON tracks by up to 1 steps
					thirteen_self.addMove(
						'event_shift_defcon\t' +
							who_goes +
							'\t' +
							who_goes +
							'\t' +
							options +
							'\t1'
					);
					thirteen_self.addMove(
						'event_shift_defcon\t' +
							who_goes +
							'\t' +
							who_goes +
							'\t' +
							options +
							'\t1'
					);
					thirteen_self.addMove(
						`notify\t${who_goes} may escalate or de-escalate 2 DEFCON tracks by 1 step each because dominant in Television`
					);
					thirteen_self.endTurn();
				}
			}
		};
		deck['s04b'] = {
			img: 'Strategy Card 04b.png',
			name: 'SOPs',
			text: 'All your Command actions have +1 Influence cube for this round',
			side: 'neutral',
			tokens: 1,
			defcon: 0,
			event: function (player) {
				let playern = thirteen_self.game.player == 2 ? 'US' : 'USSR';

				thirteen_self.displayModal(
					'You get +1 bonus to your command tokens for remainder of turn'
				);
				thirteen_self.addMove(
					`setvar\tadd_command_token_bonus\t${player}`
				);
				thirteen_self.addMove(
					`notify\t${playern} adds +1 bonus to all command token plays this turn`
				);
				thirteen_self.endTurn();
			}
		};
		deck['s05b'] = {
			img: 'Strategy Card 05b.png',
			name: 'Close Allies',
			text: 'Place up to 2 Influence cubes in total on one more political battlegrounds',
			side: 'neutral',
			tokens: 2,
			defcon: 0,
			event: function (player) {
				// place up to 2 influence cubes in total on one or more political battlegrounds
				thirteen_self.updateStatusWithOptions(
					'Place up to two influence cubes in total on one or more political battlegrounds:',
					`<ul><li class="card nocard" id="done">finish</li></ul>`
				);
				thirteen_self.eventAddInfluence(
					player,
					player,
					['cuba_pol', 'italy', 'turkey'],
					2,
					2,
					0
				);
			}
		};
		deck['s06b'] = {
			img: 'Strategy Card 06b.png',
			name: 'Intelligence Reports',
			text: 'Draw one random Strategy card from your opponent\'s hand. Play it as normal or discard it. Opponent draws a replacement card',
			side: 'neutral',
			tokens: 2,
			defcon: 1,
			event: function (player) {
				let opponent = 3 - thirteen_self.game.player;
				thirteen_self.addMove('DEAL\t2\t' + opponent + '\t1');
				thirteen_self.addMove('pullcard\t' + thirteen_self.game.player);
				thirteen_self.endTurn();
			}
		};
		deck['s07b'] = {
			img: 'Strategy Card 07b.png',
			name: 'Summit Meeting',
			text: 'Discard any number of Strategy cards from your hand. Draw one Strategy card per card so discarded',
			side: 'neutral',
			tokens: 2,
			defcon: 0,
			event: function (player) {
				let cards_discarded = 0;
				let max_cards = 0;
				let html = '<ul>';
				for (
					let i = 0;
					i < thirteen_self.game.deck[1].hand.length;
					i++
				) {
					if (thirteen_self.game.deck[1].hand[i] !== 's07b') {
						max_cards++;
						html += `<li class="card nocard" id="${
							thirteen_self.game.deck[1].hand[i]
						}">${thirteen_self.cardToText(
							thirteen_self.game.deck[1].hand[i]
						)}</li>`;
					}
				}
				html +=
					'<li class="card nocard dashed" id="finished">Done Discarding</li></ul>';

				thirteen_self.updateStatusWithOptions(
					`Select cards to discard:`,
					html
				);

				thirteen_self.attachCardboxEvents(function (card) {
					if (card == 'finished') {
						thirteen_self.addMove(
							'SAFEDEAL\t2\t' +
								thirteen_self.game.player +
								'\t' +
								cards_discarded
						);
						thirteen_self.endTurn();
					} else {
						let li = document.querySelector(
							`.status ul #${card}.card.nocard`
						);
						if (li) {
							cards_discarded++;
							li.remove();
							thirteen_self.addMove(
								`discard\t${thirteen_self.game.player}\t2\t${card}`
							);

							if (cards_discarded === max_cards) {
								thirteen_self.addMove(
									'SAFEDEAL\t2\t' +
										thirteen_self.game.player +
										'\t' +
										cards_discarded
								);
								thirteen_self.endTurn();
							}
						} else {
							console.warn(`TROUBLE UPDATING UI: `, card);
						}
					}
				});
			}
		};
		deck['s08b'] = {
			img: 'Strategy Card 08b.png',
			name: 'To the Brink',
			text: 'Play on opponent. All their Command actions have -1 Influence cube for this round (to a minimum of 1 Influence cube)',
			side: 'neutral',
			tokens: 2,
			defcon: 0,
			event: function (player) {
				let opponentn = thirteen_self.game.player == 1 ? 'US' : 'USSR';

				thirteen_self.addMove(
					`setvar\tremove_command_token_bonus\t${
						3 - thirteen_self.game.player
					}`
				);
				thirteen_self.addMove(
					`notify\t${opponentn} player command actions have -1 bonus this round`
				);
				thirteen_self.endTurn();
			}
		};
		deck['s09b'] = {
			img: 'Strategy Card 09b.png',
			name: 'Nuclear Submarines',
			text: 'Place up to 2 Influence cubes in total on one or more military battlegrounds',
			side: 'neutral',
			tokens: 1,
			defcon: 0,
			event: function (player) {
				// place up to 2 influence cubes in total on one or more military battlegrounds
				thirteen_self.updateStatusWithOptions(
					'Place up to two influence cubes in total on one or more military battlegrounds:',
					`<ul><li class="card nocard" id="done">finish</li></ul>`
				);
				thirteen_self.eventAddInfluence(
					player,
					player,
					['cuba_mil', 'atlantic', 'berlin'],
					2,
					2,
					0
				);
			}
		};
		deck['s10b'] = {
			img: 'Strategy Card 10b.png',
			name: 'U Thant',
			text: 'Deflate all your DEFCON tracks by 1 step',
			side: 'neutral',
			tokens: 1,
			defcon: 0,
			event: function (player) {
				// deflate all your DEFCON tracks by 1
				thirteen_self.updateStatus(
					'Decreasing all of your DEFCON tracks by 1:'
				);
				thirteen_self.addMove('decrease_defcon\t' + player + '\t1\t1');
				thirteen_self.addMove('decrease_defcon\t' + player + '\t2\t1');
				thirteen_self.addMove('decrease_defcon\t' + player + '\t3\t1');
				thirteen_self.endTurn();
			}
		};
		deck['s11b'] = {
			img: 'Strategy Card 11b.png',
			name: 'Containment',
			text: 'Play on opponent. They can\'t use Events from cards they played themselves to deflate their DEFCON tracks for this round',
			side: 'neutral',
			tokens: 2,
			defcon: 0,
			event: function (player) {
				// your opponent cannot use events to reduce DEFCON
				let opponentn = thirteen_self.game.player == 1 ? 'US' : 'USSR';
				thirteen_self.addMove(
					`setvar\tcannot_deflate_defcon_from_events\t${
						3 - thirteen_self.game.player
					}`
				);
				thirteen_self.addMove(
					`notify\t${opponentn} cannot deflate their DEFCON track this round from Events they play themselves.`
				);
				thirteen_self.endTurn();
			}
		};
		deck['s12b'] = {
			img: 'Strategy Card 12b.png',
			name: 'A Face-Saver',
			text: 'Command 3 Influence cubes. Then opponent may Command 1 Influence cube',
			side: 'neutral',
			tokens: 1,
			defcon: 1,
			event: function (player) {
				let opponent = 3 - thirteen_self.game.player;

				// command three influence, then opponent may command 1 influence
				thirteen_self.addMove(`command_influence\t${opponent}\t1`);
				thirteen_self.updateStatusWithOptions(
					'Command 3 Influence cubes',
					`<ul><li class="card nocard" id="done">finish</li></ul>`
				);
				thirteen_self.playerPlaceCommandTokens(
					thirteen_self.game.player,
					3
				);
			}
		};
		deck['s13b'] = {
			img: 'Strategy Card 13b.png',
			name: 'Scramble',
			text: 'Place 1 Influence cube on each of up to three different battlegrounds',
			side: 'neutral',
			tokens: 3,
			defcon: 0,
			event: function (player) {
				thirteen_self.updateStatusWithOptions(
					'Place up to three influence cubes on up to three battlegrounds (1 each):',
					`<ul><li class="card nocard" id="done">finish</li></ul>`
				);
				thirteen_self.eventAddInfluence(
					player,
					player,
					thirteen_self.all_battlegrounds,
					3,
					1,
					0
				);
			}
		};
		deck['s14b'] = {
			img: 'Strategy Card 14b.png',
			name: 'Mathematical Precision',
			text: 'Escalate/deflate the US political DEFCON track by up to 2 steps. Then Command 1 Influence cube',
			side: 'us',
			tokens: 3,
			defcon: 1,
			event: function (player) {
				thirteen_self.eventShiftDefcon(
					player,
					player,
					[2],
					2,
					'both',
					function (args) {
						thirteen_self.updateStatusWithOptions(
							'Command 1 influence cube:',
							`<ul><li class="card nocard" id="done">finish</li></ul>`
						);
						thirteen_self.playerPlaceCommandTokens(player, 1);
					}
				);
			}
		};

		deck['s15b'] = {
			img: 'Strategy Card 15b.png',
			name: 'Excomm',
			text: 'Place up to 4 Influence cubes in total on battlegrounds where the US player currently has no Influence cubes. Max 2 per battleground',
			side: 'us',
			tokens: 3,
			defcon: 1,
			event: function (player) {
				let options = [];
				for (var i in thirteen_self.game.arenas) {
					if (thirteen_self.game.arenas[i].us == 0) {
						options.push(i);
					}
				}
				thirteen_self.updateStatusWithOptions(
					'Place up to 4 Influence in battlegrounds where the US currently has no influence. Max 2 per battleround:',
					`<ul><li class="card nocard" id="done">finish</li></ul>`
				);
				thirteen_self.eventAddInfluence(
					player,
					player,
					options,
					4,
					2,
					1
				);
			}
		};
		deck['s16b'] = {
			img: 'Strategy Card 16b.png',
			name: 'Public Protests',
			text: 'Remove any number of US Influence cubes from any one battleground',
			side: 'us',
			tokens: 3,
			defcon: 0,
			event: function (player) {
				let options = [];
				for (var i in thirteen_self.game.arenas) {
					if (thirteen_self.game.arenas[i].us > 0) {
						options.push(i);
					}
				}

				if (options.length == 0) {
					thirteen_self.addMove(
						`notify\t${thirteen_self.cardToText(
							's16b'
						)}: US has no influence to remove from any battleground.`
					);
					thirteen_self.endTurn();
					return;
				}

				thirteen_self.updateStatusWithOptions(
					'Select a battleground from which to remove US influence:',
					`<ul><li class="card nocard" id="done">finish</li></ul>`
				);
				thirteen_self.eventRemoveInfluence(
					thirteen_self.game.player,
					2,
					options,
					100,
					1,
					0
				);
			}
		};

		deck['s17b'] = {
			img: 'Strategy Card 17b.png',
			name: 'Lessons of Munich',
			text: 'Place up to 4 Influence cubes in total on Berlin, Italy, and Turkey Battlegrounds. Max 2 per battleground',
			side: 'us',
			tokens: 3,
			defcon: 0,
			event: function (player) {
				thirteen_self.updateStatusWithOptions(
					'Place up to 4 Influence in total on Berlin, Italy, and Turkey Battlegrounds. Max 2 per battleground',
					`<ul><li class="card nocard" id="done">finish</li></ul>`
				);
				thirteen_self.eventAddInfluence(
					player,
					player,
					['berlin', 'italy', 'turkey'],
					4,
					2,
					0,
					function (args) {
						thirteen_self.endTurn();
					}
				);
			}
		};
		deck['s18b'] = {
			img: 'Strategy Card 18b.png',
			name: 'Operation Mongoose',
			text: 'US gains 1 Prestige. Then USSR may escalate / deflate a US DEFCON track by 1 step',
			side: 'us',
			tokens: 2,
			defcon: 0,
			event: function (player) {
				let options = thirteen_self.app.crypto.stringToBase64(
					JSON.stringify([1, 2, 3])
				);

				thirteen_self.updateLog(
					'US gains 1 prestige, USSR may shift 1 US DEFCON track'
				);
				thirteen_self.addMove(
					'event_shift_defcon\t1\t2\t' + options + '\t1'
				);
				thirteen_self.addMove('prestige\t2\t1');
				thirteen_self.endTurn();
			}
		};
		deck['s19b'] = {
			img: 'Strategy Card 19b.png',
			name: 'Air Strike',
			text: 'EITHER remove half the USSR Influence cubes from one Cuba battleground (rounded up) OR place up to 2 Influence cubes on the Alliances battleground',
			side: 'us',
			tokens: 2,
			defcon: 0,
			event: function (player) {
				let html = '<ul>';
				html +=
					'<li class="card nocard" id="remove_from_cuba">remove half of USSR influence from one Cuban battleground (rounded up)</li>';
				html +=
					'<li class="card nocard" id="add_alliances">place up to 2 Influence on the Alliances battleground</li>';
				html += '</ul>';
				thirteen_self.updateStatusWithOptions(
					`${thirteen_self.cardToText(
						's19b'
					)}: which would you prefer?`,
					html
				);
				thirteen_self.attachCardboxEvents(function (action) {
					if (action == 'remove_from_cuba') {
						thirteen_self.updateStatusWithOptions(
							'Select a Cuban battleground to remove half of the USSR influence:',
							`<ul><li class="card nocard" id="done">finish</li></ul>`
						);
						thirteen_self.eventRemoveInfluence(
							2,
							1,
							['cuba_pol', 'cuba_mil'],
							101,
							1,
							0
						);
					}
					if (action == 'add_alliances') {
						thirteen_self.updateStatusWithOptions(
							'Add up to two influence to the Alliances battleground:',
							`<ul><li class="card nocard" id="done">finish</li></ul>`
						);
						thirteen_self.eventAddInfluence(
							2,
							2,
							['alliances'],
							2,
							2,
							0
						);
					}
				});
			}
		};
		deck['s20b'] = {
			img: 'Strategy Card 20b.png',
			name: 'Non-Invasion Pledge',
			text: 'Remove up to 2 USSR Influence cubes from the Turkey battleground. Then escalate/deflate the US political DEFCON track by up to 2 steps',
			side: 'us',
			tokens: 2,
			defcon: 0,
			event: function (player) {
				thirteen_self.updateStatusWithOptions(
					'Remove up to 2 USSR Influence cubes from the Turkey battleground.',
					`<ul><li class="card nocard" id="done">finish</li></ul>`
				);
				thirteen_self.eventRemoveInfluence(
					player,
					1,
					['turkey'],
					2,
					2,
					0,
					function (args) {
						thirteen_self.eventShiftDefcon(player, player, [2], 2);
					}
				);
			}
		};
		deck['s21b'] = {
			img: 'Strategy Card 21b.png',
			name: 'Offensive Missiles',
			text: 'If US political DEFCON track is in the DEFCON 3 area, place up to 1 Influence cube on all political battlegrounds',
			side: 'us',
			tokens: 2,
			defcon: 0,
			event: function (player) {
				if (thirteen_self.game.state.defcon2_us < 4) {
					thirteen_self.updateStatusWithOptions(
						'Place up to 3 Influence in Cuba (pol), Italy and Turkey (max 1 per battleground):',
						`<ul><li class="card nocard" id="done">finish</li></ul>`
					);
					thirteen_self.addMove(
						'notify\tUS installs offensive missiles in political chokepoints'
					);
					thirteen_self.eventAddInfluence(
						2,
						2,
						['cuba_pol', 'italy', 'turkey'],
						3,
						1,
						0
					);
				} else {
					thirteen_self.addMove(
						'notify\tUS political defcon track is lower than 3, skipping Offensive Missiles'
					);
					thirteen_self.displayModal(
						'Offensive Missiles doesn\'t go into effect because US political defcon track is lower than 3'
					);
					thirteen_self.endTurn();
				}
			}
		};

		deck['s22b'] = {
			img: 'Strategy Card 22b.png',
			name: 'Invasion of Cuba',
			text: 'Escalate the US military DEFCON track by up to 2 steps. You may then deflate another US DEFCON track by the same number of steps',
			side: 'us',
			tokens: 1,
			defcon: 0,
			event: function (player) {
				//player, player_getting_moved, options, number, max_per_arena, mycallback=null, directions="both"
				thirteen_self.eventShiftDefcon(
					player,
					2,
					[1],
					2,
					'increase',
					function (arg) {
						thirteen_self.eventShiftDefcon(
							player,
							2,
							[2, 3],
							arg,
							'decrease'
						);
					}
				);
			}
		};
		deck['s23b'] = {
			img: 'Strategy Card 23b.png',
			name: 'Quarantine',
			text: 'Place up to 2 Influence cubes on the Atlantic battleground',
			side: 'us',
			tokens: 1,
			defcon: 0,
			event: function (player) {
				thirteen_self.updateStatusWithOptions(
					'Place up to 2 Influence on the Atlantic battleground:',
					`<ul><li class="card nocard" id="done">finish</li></ul>`
				);
				thirteen_self.eventAddInfluence(
					player,
					player,
					['atlantic'],
					2,
					2,
					0
				);
			}
		};
		deck['s24b'] = {
			img: 'Strategy Card 24b.png',
			name: 'U-2 Photographs',
			text: 'Command 3 Influence cubes on to one military battleground',
			side: 'us',
			tokens: 1,
			defcon: 1,
			event: function (player) {
				//FIX THIS <<<<<<
				thirteen_self.eventAddInfluence(
					player,
					player,
					['cuba_mil', 'berlin', 'atlantic'],
					100,
					3,
					1
				);
			}
		};
		deck['s25b'] = {
			img: 'Strategy Card 25b.png',
			name: 'Wave and Smile',
			text: 'Remove up to 2 US Influence cubes in total from one or more battlerounds. Place them on other battlegrounds',
			side: 'us',
			tokens: 2,
			defcon: 0,
			event: function (player) {
				thirteen_self.updateStatusWithOptions(
					'Remove up to 2 US influence cubes in total from one or more battlegrounds. Place them on other battlegrounds:',
					`<ul><li class="card nocard" id="done">finish</li></ul>`
				);
				thirteen_self.eventRemoveInfluence(
					player,
					player,
					thirteen_self.all_battlegrounds,
					2,
					2,
					0,
					function (arg) {
						thirteen_self.updateStatusWithOptions(
							`Now place the ${arg} influence on other battlegrounds:`,
							`<ul><li class="card nocard" id="done">finish</li></ul>`
						);
						thirteen_self.eventAddInfluence(
							player,
							player,
							thirteen_self.all_battlegrounds,
							arg,
							arg,
							0
						);
					}
				);
			}
		};
		deck['s26b'] = {
			img: 'Strategy Card 26b.png',
			name: 'Eyeball to Eyeball',
			text: 'If US is more escalated than USSR on the military DEFCON track, place up to 3 Influence cubes in total on one or both Cuba battlegrounds',
			side: 'us',
			tokens: 1,
			defcon: 1,
			event: function (player) {
				if (
					thirteen_self.game.state.defcon1_us >
					thirteen_self.game.state.defcon1_ussr
				) {
					let options = thirteen_self.app.crypto.stringToBase64(
						JSON.stringify(['cuba_mil', 'cuba_pol'])
					);
					thirteen_self.addMove(
						'event_add_influence\t2\t2\t' + options + '\t3\t3\t1'
					);
				} else {
					thirteen_self.addMove(
						'notify\tUS is not higher than USSR on military defcon track. Skipping event'
					);
				}
				thirteen_self.endTurn();
			}
		};
		deck['s27b'] = {
			img: 'Strategy Card 27b.png',
			name: 'MRBMs & IRBMs',
			text: 'Escalate/deflate the USSR military DEFCON track by up to 2 steps. Then Command 1 Influence cube',
			side: 'ussr',
			tokens: 3,
			defcon: 1,
			event: function (player) {
				thirteen_self.eventShiftDefcon(
					1,
					1,
					[1],
					2,
					'both',
					function (args) {
						thirteen_self.playerPlaceCommandTokens(1, 1);
					}
				);
			}
		};
		deck['s28b'] = {
			img: 'Strategy Card 28b.png',
			name: 'Moscow is our Brain',
			text: 'Place up to 4 Influence dubes in total on battlegrounds where the USSR player currently has Influence cubes. Max 2 per battleground',
			side: 'ussr',
			tokens: 3,
			defcon: 1,
			event: function (player) {
				thirteen_self.updateStatusWithOptions(
					'Place up to 4 Influence cubes in total on battlegrounds where the USSR player currently has Influence cubes. Max 2 per battleground: ',
					`<ul><li class="card nocard" id="done">finish</li></ul>`
				);
				let options = [];

				for (var i in thirteen_self.game.arenas) {
					if (thirteen_self.game.arenas[i].ussr > 0) {
						options.push(i);
					}
				}
				thirteen_self.eventAddInfluence(1, 1, options, 4, 2, 1);
			}
		};
		deck['s29b'] = {
			img: 'Strategy Card 29b.png',
			name: 'Missile Trade',
			text: 'Remove up to 3 USSR Influence cubes in total from one or more battlegrounds',
			side: 'ussr',
			tokens: 3,
			defcon: 1,
			event: function (player) {
				thirteen_self.updateStatusWithOptions(
					'Remove up to 3 USSR Influence cubes in total from one or more battlegrounds: ',
					`<ul><li class="card nocard" id="done">finish</li></ul>`
				);
				thirteen_self.eventRemoveInfluence(
					player,
					1,
					thirteen_self.all_battlegrounds,
					3,
					3,
					1
				);
			}
		};
		deck['s30b'] = {
			img: 'Strategy Card 30b.png',
			name: 'Fidel Castro',
			text: 'Place up to 3 Influence cubes in total on one or both Cuba battlegrounds',
			side: 'ussr',
			tokens: 3,
			defcon: 0,
			event: function (player) {
				thirteen_self.updateStatusWithOptions(
					'Place up to 3 USSR Influence cubes in total on one or both Cuba battlegrounds: ',
					`<ul><li class="card nocard" id="done">finish</li></ul>`
				);
				thirteen_self.eventAddInfluence(
					player,
					player,
					['cuba_mil', 'cuba_pol'],
					3,
					3,
					0
				);
			}
		};
		deck['s31b'] = {
			img: 'Strategy Card 31b.png',
			name: 'Berlin Blockade',
			text: 'USSR gains 2 Prestige. Then US player may escalate/deflate a USSR DEFCON track by up to 2 steps',
			side: 'ussr',
			tokens: 2,
			defcon: 0,
			event: function (player) {
				let options = thirteen_self.app.crypto.stringToBase64(
					JSON.stringify([1, 2, 3])
				);
				thirteen_self.addMove(
					'event_shift_defcon\t2\t1\t' + options + '\t2'
				);
				thirteen_self.addMove('prestige\t1\t2');
				thirteen_self.addMove('notify\tUSSR gains 2 prestige');
				thirteen_self.endTurn();
			}
		};
		deck['s32b'] = {
			img: 'Strategy Card 32b.png',
			name: 'Suez-Hungary',
			text: 'Keep placing 1 USSR Influence cube on the Italy battleground until the USSR runs out, reaches 5, or has one more Influence cube there than the US player',
			side: 'ussr',
			tokens: 2,
			defcon: 0,
			event: function (player) {
				let total_needed = Math.min(
					thirteen_self.game.arenas['italy'].us + 1,
					5
				);

				let total_to_add =
					total_needed - thirteen_self.game.arenas['italy'].ussr;
				if (
					thirteen_self.game.state.influence_on_board_ussr +
						total_to_add >
					17
				) {
					total_to_add =
						17 - thirteen_self.game.state.influence_on_board_ussr;
				}

				if (total_to_add > 0) {
					thirteen_self.addMove(
						'add_influence\t1\titaly\t' + total_to_add + '\t' + '-1'
					);
					thirteen_self.addMove(
						'notify\tUSSR adds ' + total_to_add + ' in Italy'
					);
				}

				thirteen_self.endTurn();
			}
		};
		deck['s33b'] = {
			img: 'Strategy Card 33b.png',
			name: 'Maskirovka',
			text: 'If USSR military DEFCON track is in the DEFCON 3 area, place up to 1 Influence cube on all military battlegrounds',
			side: 'ussr',
			tokens: 2,
			defcon: 0,
			event: function (player) {
				let options = thirteen_self.app.crypto.stringToBase64(
					JSON.stringify(['cuba_mil', 'atlantic', 'berlin'])
				);

				if (thirteen_self.game.state.defcon1_ussr < 4) {
					thirteen_self.addMove(
						'event_add_influence\t1\t1\t' + options + '\t3\t1\t0'
					);
					thirteen_self.addMove(
						'notify\tUSSR places influence in military battlegrounds'
					);
				} else {
					thirteen_self.addMove(
						'notify\tUSSR military defcon track is higher than 3.'
					);
				}
				thirteen_self.endTurn();
			}
		};
		deck['s34b'] = {
			img: 'Strategy Card 34b.png',
			name: 'Bay of Pigs',
			text: 'Play on opponent. They EITHER remove 2 Influence cubes from the Alliances battleground OR they can\'t play Events to deflate their DEFCON tracks for this round',
			side: 'ussr',
			tokens: 2,
			defcon: 0,
			event: function (player) {
				thirteen_self.addMove('bayofpigs\t' + player);
				thirteen_self.endTurn();
			}
		};
		deck['s35b'] = {
			img: 'Strategy Card 35b.png',
			name: 'Turn Back the Ships',
			text: 'Deflate the most escalated USSR DEFCON track by up to 2 steps (if tied, pick one)',
			side: 'ussr',
			tokens: 1,
			defcon: 0,
			event: function (player) {
				let max_defcon = 0;
				let options = [];

				if (thirteen_self.game.state.defcon1_ussr > max_defcon) {
					max_defcon = thirteen_self.game.state.defcon1_ussr;
				}
				if (thirteen_self.game.state.defcon2_ussr > max_defcon) {
					max_defcon = thirteen_self.game.state.defcon2_ussr;
				}
				if (thirteen_self.game.state.defcon3_ussr > max_defcon) {
					max_defcon = thirteen_self.game.state.defcon3_ussr;
				}
				if (thirteen_self.game.state.defcon1_ussr >= max_defcon) {
					options.push(1);
				}
				if (thirteen_self.game.state.defcon2_ussr >= max_defcon) {
					options.push(2);
				}
				if (thirteen_self.game.state.defcon3_ussr >= max_defcon) {
					options.push(3);
				}

				thirteen_self.eventShiftDefcon(
					player,
					player,
					options,
					2,
					'decrease'
				);
			}
		};
		deck['s36b'] = {
			img: 'Strategy Card 36b.png',
			name: 'Strategic Balance',
			text: 'Place up to 3 Influence cubes on the Atlantic battleground',
			side: 'ussr',
			tokens: 1,
			defcon: 1,
			event: function (player) {
				thirteen_self.updateStatusWithOptions(
					'Place up to 3 Influence on the Atlantic battleground: ',
					`<ul><li class="card nocard" id="done">finish</li></ul>`
				);
				thirteen_self.eventAddInfluence(
					player,
					player,
					['atlantic'],
					3,
					3,
					1
				);
			}
		};
		deck['s37b'] = {
			img: 'Strategy Card 37b.png',
			name: 'National Liberation',
			text: 'Command 3 Influence cubes on to one political battleground',
			side: 'ussr',
			tokens: 1,
			defcon: 1,
			event: function (player) {
				thirteen_self.updateStatusWithOptions(
					'Command 3 Influence cubes on to one political battleground: ',
					`<ul><li class="card nocard" id="done">finish</li></ul>`
				);
				thirteen_self.eventAddInfluence(
					player,
					player,
					['cuba_pol', 'italy', 'turkey'],
					100,
					3,
					1
				);
			}
		};
		deck['s38b'] = {
			img: 'Strategy Card 38b.png',
			name: 'U-2 Downed',
			text: 'Place up to 2 Influence cubes on the Turkey battleground. Remove half the US Influence cubes from one Cuba battleground (rounded up)',
			side: 'ussr',
			tokens: 2,
			defcon: 0,
			event: function (player) {
				thirteen_self.updateStatusWithOptions(
					'Add up to 2 influence cubes in Turkey: ',
					`<ul><li class="card nocard" id="done">finish</li></ul>`
				);
				thirteen_self.eventAddInfluence(
					player,
					player,
					['turkey'],
					2,
					2,
					0,
					function (args) {
						thirteen_self.updateStatusWithOptions(
							'Now, click remove half of US influence from one Cuban battleground: ',
							`<ul><li class="card nocard" id="done">finish</li></ul>`
						);
						thirteen_self.eventRemoveInfluence(
							player,
							2,
							['cuba_pol', 'cuba_mil'],
							101,
							2,
							0
						);
					}
				);
			}
		};
		deck['s39b'] = {
			img: 'Strategy Card 39b.png',
			name: 'Defensive Missiles',
			text: 'Place up to 2 Influence cubes in total on the Television and United Nations battlegrounds',
			side: 'ussr',
			tokens: 1,
			defcon: 1,
			event: function (player) {
				thirteen_self.updateStatusWithOptions(
					'Place up to 2 Influence cubes in total on the Television and United Nations battlegrounds: ',
					`<ul><li class="card nocard" id="done">finish</li></ul>`
				);
				thirteen_self.eventAddInfluence(
					player,
					player,
					['un', 'television'],
					2,
					2,
					1
				);
			}
		};

		return deck;
	}

	returnGameRulesHTML() {
		return ThirteenGameRulesTemplate(this.app, this);
	}

	returnGameOptionsHTML() {
		return ThirteenGameOptionsTemplate(this.app, this);
	}

	returnUnplayedCards() {
		var unplayed = {};
		for (let i in this.game.deck[1].cards) {
			unplayed[i] = this.game.deck[1].cards[i];
		}
		for (let i in this.game.deck[1].discards) {
			delete unplayed[i];
		}
		for (let i in this.game.deck[1].removed) {
			delete unplayed[i];
		}
		for (let i = 0; i < this.game.deck[1].hand.length; i++) {
			delete unplayed[this.game.deck[1].hand[i]];
		}

		return unplayed;
	}
} // end Thirteen class

module.exports = Thirteen;
