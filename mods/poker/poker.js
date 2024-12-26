const GameTableTemplate = require('../../lib/templates/table-gametemplate');
const GameBoard = require('./lib/ui/game-board/game-board');
const Pot = require('./lib/ui/pot/pot');
const JSON = require('json-bigint');
const PokerStats = require("./lib/stats");
const htmlTemplate = require('./lib/game-html.template');
const PokerGameRulesTemplate = require('./lib/poker-game-rules.template');
const PokerGameOptionsTemplate = require('./lib/poker-game-options.template');

const PokerState = require('./lib/poker-state.js');
const PokerStake = require('./lib/poker-stake.js');
const PokerQueue = require('./lib/poker-queue.js');
const PokerUI = require('./lib/poker-ui.js');
const PokerCards = require('./lib/poker-cards.js');

//////////////////
// CONSTRUCTOR  //
//////////////////
class Poker extends GameTableTemplate {

	constructor(app) {
		super(app);

		this.app = app;
		this.name = 'Poker';
		this.title = "Saito Poker";
		this.description =
			`Texas Hold\'em Poker for the Saito Arcade. With five cards on the table and two in your hand, can you bet and bluff your way to victory? 
				<br> Play with up to five other players for fun or wager integrated web3 cryptocurrencies through your hnady Saito Wallets`;
		this.categories = 'Games Cardgame Casino';
		this.card_img_dir = '/saito/img/arcade/cards';
		this.icon = 'fa-solid fa-diamond';

		this.minPlayers = 2;
		this.maxPlayers = 6;
		this.settlement = [];

		this.stats = new PokerStats(app, this);
		this.board = new GameBoard(app, this);
		this.pot = new Pot(app, this);

		/********************
		*********************
		*********************
		***
		*** CRYPTO *NEEDS* to be in a string, but the internal math/logic of the game is a lot less bug-ridden
		*** if we _secretly_ make all games use 100 chip buy ins, with all bets as whole numbers of chips... 
		*** so everything -- the blind, the pot, the debt, the credit is a whole number... 
		*** If there is a stake, such as 32 TRX or 0.005 BTC, we divide that by 100, and multiply by the whole numbers
		*** when rendering UI or initiating transfers.
		*** Stake 250.67 SAITO --> x = 2.5067 SAITO. Bets are in increments of 2.5067 SAITO, e.g. 1x, 2x, 3x ...  
		***
		***
		this.game.crypto;       // (STRING) TICKER of crypto or "CHIPS" in standard game
		this.game.stake;        // (STRING) TOTAL crypto buy-in OR 100 (if chips)
		this.game.chips;        // (INTEGER) TOTAL CHIPS per buy-in,
		this.game.blind_mode;     // (STRING) "static" or "increase"
   
   
		this.game.state.round;    // (INT) round in game
		this.game.state.big_blind;    // (INTEGER) value of big-blind
		this.game.state.small_blind;  // (INTEGER) value of small-blind
		this.game.state.last_raise;   // (INTEGER) value of last raise
		this.game.state.required_pot; // (INTEGER) value players need in pot to keep playing
   
		this.game.state.passed[i];    // (INT) 1 = has passed
		this.game.state.player_pot[i];  // (INTEGER) value contributed to pot
		this.game.state.debt[i];    // (INTEGER) amount due
		this.game.state.player_credit[i]; // (INTEGER) bankroll
		*********************
		*********************
		********************/

		this.updateHTML = '';

		this.sort_priority = 1;

	}




	initializeGame() {
		//
		// test crypto hand scoring
		//
		// this is just convenience code for checking why two hands
		// might not score properly. please leave this in for now.
		//
		//let hand1 = ["S8","S7","H3","H5","C2","S6","H4"];
		//let hand2 = ["C10","D2","H3","H5","C2","S6","H4"];
		//console.log("TESTING HAND SCORING");
		//let score1 = this.scoreHand(hand1);
		//let score2 = this.scoreHand(hand2);
		//let winner = this.pickWinner(score1, score2);
		//console.log("score1: " + JSON.stringify(score1));
		//console.log("score2: " + JSON.stringify(score2));
		//console.log("winner: " + JSON.stringify(winner));

		super.initializeGame(); //Update max players

		//
		// CHIPS or CRYPTO ?
		//
		// force settlement unless set to false
		this.settleNow = true;

		//
		// initialize game state
		//
		if (this.game.deck.length == 0) {
			this.game.state = this.returnState(this.game.players.length);
			this.initializeGameStake(this.game.crypto, this.game.stake);
			this.game.stats = this.returnStats();
			this.startRound(); // DOM update on new round
		}

		//
		// browsers display UI
		//
		if (this.browser_active) {
			this.board.render();
		}
	}

	returnShortGameOptionsArray(options) {
		let sgoa = super.returnShortGameOptionsArray(options);
		let ngoa = {};
		let crypto = '';
		for (let i in sgoa) {
			if (sgoa[i] != '') {
				let okey = i;
				let oval = sgoa[i];

				let output_me = 1;
				if (okey == 'chip') {
					if (oval !== '0') {
						okey = 'small blind';
					} else {
						output_me = 0;
					}
				}
				if (okey == 'blind_mode') {
					if (oval == 'increase') {
						okey = 'mode';
						oval = 'tournament';
					} else {
						output_me = 0;
					}
				}
				if (okey == 'num_chips') {
					okey = 'chips';
				}

				if (output_me == 1) {
					ngoa[okey] = oval;
				}
			}
		}

		return ngoa;
	}


	async render(app) {

		if (!this.browser_active) {
			return;
		}
		if (this.initialize_game_run) {
			return;
		}

		await this.injectGameHTML(htmlTemplate());

		//
		// ADD MENU
		//
		this.menu.addMenuOption('game-game', 'Game');
		this.menu.addSubMenuOption('game-game', {
			text: 'How to Play',
			id: 'game-rules',
			class: 'game-rules',
			callback: function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				game_mod.overlay.show(game_mod.returnGameRulesHTML());
			}
		});
		this.menu.addSubMenuOption('game-game', {
			text: 'Stats',
			id: 'game-stats',
			class: 'game-stats',
			callback: function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				game_mod.stats.render();
			}
		});


		this.theme = this.loadGamePreference("theme") || "flat";

		this.menu.addSubMenuOption("game-game", {
			text: "Theme",
			id: "game-theme",
			class: "game-theme",
			callback: null
		});

		this.menu.addSubMenuOption("game-theme", {
			text: `Flat ${(this.theme == "flat") ? "✔" : ""}`,
			id: "game-theme-flat",
			class: "game-theme-flat",
			callback: function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				game_mod.theme = "flat";
				game_mod.saveGamePreference("theme", "flat");
				game_mod.board.toggleView();
				game_mod.menu.render();
			}
		});

		this.menu.addSubMenuOption("game-theme", {
			text: `3D ${(this.theme == "threed") ? "✔" : ""}`,
			id: "game-theme-3d",
			class: "game-theme-3d",
			callback: function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				game_mod.theme = "threed";
				game_mod.saveGamePreference("theme", "threed");
				game_mod.board.toggleView();
				game_mod.menu.render();
			}
		});

		this.cardfan.container = ".mystuff";

		await super.render(app);

		this.board.render();

		this.playerbox.mode = 2;
		this.playerbox.render();
		this.displayPlayerNotice(this.status, this.game.player);

		$(".game-playerbox-seat-1").appendTo(".mystuff");

		this.menu.addChatMenu();
		this.menu.render();

		this.log.render();

		this.insertCryptoLogo(this.game?.options?.crypto);

		//
		// gametabletemplate adds a scoreboard DIV that shows HIDE / LEAVE / JOIN instructions
		// which we are going to hide to prevent UI / UX clutter, but leave functional so as to
		// enable faster experimentation.
		//
		if (document.querySelector('.game-scoreboard')) {
			document.querySelector('.game-scoreboard').style.display = 'none';
		}
	}

	async exitGame() {
		if (this.game.over == 0 && this.game.player) {
			let c = await sconfirm("forfeit the game?");
			if (c) {
				await this.sendStopGameTransaction("forfeit");
				this.game.over = 2;
				this.removePlayer(this.publicKey);
				this.saveGame(this.game.id);
				setTimeout(
					() => {
						super.exitGame();
					}, 500);
			}
		} else {
			super.exitGame();
		}
	}


	async receiveStopGameTransaction(resigning_player, txmsg) {
		console.log("Poker: receiveStopGameTransaction", txmsg, resigning_player);

		await super.receiveStopGameTransaction(resigning_player, txmsg);

		if (this.publicKey == resigning_player) {
			return;
		}

		let loser = -1;
		for (let i = 0; i < this.game.players.length; i++) {
			if (this.game.players[i] == resigning_player) {
				loser = i + 1;
				break;
			}
		}

		if (loser < 0) {
			console.log("Player is not in the game");
			return;
		}

		if (txmsg?.deck) {
			if (!this.game?.opponent_decks) {
				this.game.opponent_decks = {};
			}
			if (!this.game.opponent_decks[`${loser}`]) {
				this.game.opponent_decks[`${loser}`] = txmsg.deck;
			}
		}

		if (this.browser_active) {
			if (this.publicKey !== resigning_player) {
				this.displayPlayerNotice(
					`<div class="plog-update">left the table</div>`,
					loser
				);
			}
		}

		this.updateLog(
			this.game.state.player_names[loser - 1] + ' left the table'
		);

		this.game.stats[resigning_player].folds++;
		this.game.state.passed[loser - 1] = 1;
		this.game.state.last_fold = loser;

		if (this.game.target == loser) {
			this.game.state.plays_since_last_raise--;
			this.startQueue();
		}
	}

	endTurn(nextTarget = 0) {
		if (this.browser_active) {
				this.updateStatus('waiting for information from peers...');
				$('.option').off();
		}

		super.endTurn(nextTarget);
	}

        returnGameRulesHTML() {
                return PokerGameRulesTemplate(this.app, this);
        }

        returnAdvancedOptions() {
                return PokerGameOptionsTemplate(this.app, this);
        }

        // Extension of game engine stub for advanced stake selection before starting a game
        
        attachAdvancedOptionsEventListeners() {

                let blindModeInput = document.getElementById('blind_mode');
                let numChips = document.getElementById('num_chips');
                let blindDisplay = document.getElementById('blind_explainer');
                let crypto = document.getElementById('crypto');
                let stakeValue = document.getElementById('stake');
                let chipInput = document.getElementById('chip_wrapper');
                //let stake = document.getElementById("stake");

                const updateChips = function () {
                        if (numChips && stakeValue && chipInput /*&& stake*/) {
                                if (crypto.value == '') {
                                        chipInput.style.display = 'none';
                                        stake.value = '0';
                                } else {
                                        let nChips = parseInt(numChips.value);
                                        let stakeAmt = parseFloat(stakeValue.value);
                                        let jsMath = stakeAmt / nChips;
                                        chipInput.style.display = 'block';
                                }
                        }
                };

                if (blindModeInput && blindDisplay) {
                        blindModeInput.onchange = function () {
                                if (blindModeInput.value == 'static') {
                                        blindDisplay.textContent =
                                                'Small blind is one chip, big blind is two chips throughout the game';
                                } else {
                                        blindDisplay.textContent =
                                                'Small blind starts at one chip, and increments by 1 every 5 rounds';
                                }
                        };
                }

                if (crypto) {
                        crypto.onchange = updateChips;
                }
                if (numChips) {
                        numChips.onchange = updateChips;
                }
        }



}


Poker.importFunctions(
	PokerState,
	PokerStake,
	PokerQueue,
	PokerUI,
	PokerCards
);

module.exports = Poker;
