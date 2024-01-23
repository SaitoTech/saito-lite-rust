const GameTemplate = require('../../lib/templates/gametemplate');
const JSON = require('json-bigint');

//////////////////
// CONSTRUCTOR  //
//////////////////
class Labyrinth extends GameTemplate {
	constructor(app) {
		super(app);

		this.app = app;

		this.name = 'Labyrinth';
		this.gamename = 'Labyrinth';
		this.slug = 'labyrinth';
		this.description = `Labyrinth is a 1-2 player strategic boardgame based around the clash between Islamist jihad and the West in the era of the Global War on Terror.`;
		this.publisher_message =
			'Labyrinth is owned by GMT Games. This module is made available under an open source license provided by GMT Games that permits usage provided that at least one player per game has purchased a copy of the game.';
		this.categories = 'Games Boardgame Strategy';

		this.interface = 1; // graphical interface

		//
		// this sets the ratio used for determining
		// the size of the original pieces
		//
		this.boardWidth = 5100;

		//
		// newbie mode
		//
		this.confirm_moves = 1;

		//
		//
		// players
		this.minPlayers = 2;
		this.maxPlayers = 6;
	}

	////////////////
	// initialize //
	////////////////
	initializeGame(game_id) {
		//
		// check user preferences to update interface, if text
		//
		if (this.app?.options?.gameprefs) {
			if (this.app.options.gameprefs.his_expert_mode == 1) {
				this.confirm_moves = 0;
			} else {
				this.confirm_moves = 1;
			}
		}

		//
		// re-fill status and log
		//
		if (this.game.status != '') {
			this.updateStatus(this.game.status);
		}

		//
		// initialize
		//
		let first_time_running = 0;
		if (!this.game.state) {
			first_time_running = 1;
			this.game.state = this.returnState();
			this.game.players_info = this.returnPlayers(
				this.game.players.length
			);

			console.log('\n\n\n\n');
			console.log('---------------------------');
			console.log('---------------------------');
			console.log('------ INITIALIZE GAME ----');
			console.log('---------------------------');
			console.log('---------------------------');
			console.log('---------------------------');
			console.log('DECK: ' + this.game.options.deck);
			console.log('\n\n\n\n');

			this.updateStatus(
				'<div class=\'status-message\' id=\'status-message\'>Generating the Game</div>'
			);

			//
			// Game Queue
			//
			this.game.queue.push('round');
			this.game.queue.push('READY');
			this.game.queue.push('DECK\t1\t' + JSON.stringify(this.deck));
			this.game.queue.push('init');
		}

		//
		// add initial units
		//
		if (first_time_running == 1) {
			console.log('is first tiem running: ' + this.game.state.scenario);
		}

		//
		// and show the board
		//
		this.displayBoard();
	}

	/////////////////////
	// Core Game State //
	/////////////////////
	returnState() {
		let state = {};

		state.events = {};

		return state;
	}

	returnSpaces() {
		let spaces = {};

		for (let key in spaces) {
			spaces[key].units = {};
		}

		return spaces;
	}

	returnDeck() {
		var deck = {};

		deck['001'] = {
			img: 'cards/HIS-001.svg',
			name: 'Janissaries',
			ops: 5,
			turn: 1,
			type: 'normal',
			faction: 'ottoman',
			removeFromDeckAfterPlay: function (his_self, player) {
				return 0;
			},
			menuOption: function (his_self, menu, player) {
				if (menu == 'field_battle_hits_assignment') {
					let f = '';
					for (
						let i = 0;
						i < his_self.game.deck[0].fhand.length;
						i++
					) {
						if (his_self.game.deck[0].fhand[i].includes('001')) {
							f =
								his_self.game.players_info[
									his_self.game.player - 1
								].factions[i];
							break;
						}
					}
					return {
						faction: f,
						event: 'janissaries',
						html: `<li class="option" id="janissaries">janissaries (${f})</li>`
					};
				}
				return {};
			},
			menuOptionTriggers: function (his_self, menu, player, faction) {
				if (menu == 'field_battle_hits_assignment') {
					for (
						let i = 0;
						i < his_self.game.deck[0].fhand.length;
						i++
					) {
						if (his_self.game.deck[0].fhand[i].includes('001')) {
							return 1;
						}
					}
				}
				return 0;
			},
			menuOptionActivated: function (his_self, menu, player, faction) {
				if (menu == 'field_battle_hits_assignment') {
					his_self.addMove('janissaries');
					his_self.endTurn();
					his_self.updateStatus('acknowledge');
				}
				return 0;
			},
			handleGameLoop: function (his_self, qe, mv) {
				if (mv[0] == 'janissaries') {
					his_self.game.queue.splice(qe, 1);
					his_self.updateLog('Ottoman Empire plays Janissaries');
					his_self.game.state.field_battle.attacker_rolls += 5;
					his_self.game.state.field_battle.attacker_results.push(
						his_self.rollDice(6)
					);

					return 1;
				}
			}
		};
		deck['002'] = {
			img: 'cards/HIS-002.svg',
			name: 'Holy Roman Emperor',
			ops: 5,
			turn: 1,
			type: 'normal',
			faction: 'hapsburg',
			removeFromDeckAfterPlay: function (his_self, player) {
				return 0;
			}
		};
		deck['003'] = {
			img: 'cards/HIS-003.svg',
			name: 'Six Wives of Henry VIII',
			ops: 5,
			turn: 1,
			type: 'normal',
			faction: 'england',
			removeFromDeckAfterPlay: function (his_self, player) {
				return 0;
			}
		};

		for (let key in deck) {
			deck[key] = this.addEvents(deck[key]);
		}

		return deck;
	}

	returnEventObjects() {
		let z = [];
		//
		// cards in the deck can modify gameloop
		//
		for (let key in this.deck) {
			z.push(this.deck[key]);
		}

		return z;
	}

	addEvents(obj) {
		///////////////////////
		// game state events //
		///////////////////////
		//
		// 1 = fall through, 0 = halt game
		//
		if (obj.handleGameLoop == null) {
			obj.handleGameLoop = function (his_self, qe, mv) {
				return 1;
			};
		}

		//
		// functions for convenience
		//
		if (obj.menuOption == null) {
			obj.menuOption = function (his_self, stage, player, faction) {
				return 0;
			};
		}
		if (obj.menuOptionActivated == null) {
			obj.menuOptionActivated = function (
				his_self,
				stage,
				player,
				faction
			) {
				return 0;
			};
		}
		if (obj.menuOptionTriggers == null) {
			obj.menuOptionTriggers = function (
				his_self,
				stage,
				player,
				faction
			) {
				return 0;
			};
		}

		return obj;
	}

	displayBoard() {
		console.log('displaying board');
	}

	returnEventObjects() {
		let z = [];
		//
		// cards in the deck can modify gameloop
		//
		for (let key in this.deck) {
			z.push(this.deck[key]);
		}

		return z;
	}

	addEvents(obj) {
		///////////////////////
		// game state events //
		///////////////////////
		//
		// 1 = fall through, 0 = halt game
		//
		if (obj.handleGameLoop == null) {
			obj.handleGameLoop = function (his_self, qe, mv) {
				return 1;
			};
		}

		//
		// functions for convenience
		//
		if (obj.menuOption == null) {
			obj.menuOption = function (his_self, stage, player, faction) {
				return 0;
			};
		}
		if (obj.menuOptionActivated == null) {
			obj.menuOptionActivated = function (
				his_self,
				stage,
				player,
				faction
			) {
				return 0;
			};
		}
		if (obj.menuOptionTriggers == null) {
			obj.menuOptionTriggers = function (
				his_self,
				stage,
				player,
				faction
			) {
				return 0;
			};
		}

		return obj;
	}

	//
	// Core Game Logic
	//
	async handleGameLoop() {
		let labyrinth_self = this;

		///////////
		// QUEUE //
		///////////
		if (this.game.queue.length > 0) {
			let qe = this.game.queue.length - 1;
			let mv = this.game.queue[qe].split('\t');
			let z = this.returnEventObjects();
			let shd_continue = 1;

			console.log('QUEUE: ' + JSON.stringify(this.game.queue));
			console.log('MOVE: ' + mv[0]);

			//
			// round
			// init
			//
			if (mv[0] == 'init') {
				this.game.queue.splice(qe, 1);
				return 1;
			}

			if (mv[0] === 'round') {
				this.game.state.round++;
				this.game.queue.splice(qe, 1);
				return 1;
			}

			if (mv[0] === 'halt') {
				return 0;
			}

			//
			// halt if events return 0
			//
			for (let i in z) {
				if (!(await z[i].handleGameLoop(this, qe, mv))) {
					return 0;
				}
			}

			//
			// avoid infinite loops
			//
			if (shd_continue == 0) {
				console.log('NOT CONTINUING');
				return 0;
			}
		} // if cards in queue
		return 1;
	}

	returnPlayers(num = 0) {
		var players = [];

		for (let i = 0; i < num; i++) {
			players[i] = {};
			players[i].num = i;
			players[i].role = 'us';

			if (i == 0) {
				if (this.game.options.player1 != undefined) {
					if (this.game.options.player1 != 'random') {
						players[i].role = this.game.options.player1;
					}
				}
			}
			if (i == 1) {
				if (this.game.options.player2 != undefined) {
					if (this.game.options.player2 != 'random') {
						players[i].role = this.game.options.player2;
					}
				}
			}
		}

		return players;
	}
} // end and export

module.exports = Labyrinth;
