const GameTableTemplate = require('../../lib/templates/table-gametemplate');
const GameBoard = require('./lib/ui/game-board/game-board');
const Stack = require('./lib/ui/stack/stack');
const Pot = require('./lib/ui/pot/pot');
const Cardfan = require('./lib/ui/cardfan/cardfan');
const Playerbox = require('./lib/ui/playerbox/playerbox');
const JSON = require('json-bigint');
const PokerStats = require("./lib/stats");
const GameHelp = require('./lib/ui/game-help/game-help');
const htmlTemplate = require('./lib/game-html.template');


const PokerState = require('./lib/poker-state.js');
const PokerStake = require('./lib/poker-stake.js');
const PokerQueue = require('./lib/poker-queue.js');
const PokerPlayer = require('./lib/poker-player.js');
const PokerDisplay = require('./lib/poker-display.js');
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
		this.stack = new Stack(app, this);
		this.pot = new Pot(app, this);
		this.cardfan = new Cardfan(app, this);
		this.playerbox = new Playerbox(app, this);

		//
		// triangular help button
		//
		this.game_help = new GameHelp(this.app, this);


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
		this.game.state.pot;    // (INTEGER) current pot
   
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



	//
	// initializes chips / pools / pots information
	//
	initializeGameStake(crypto = 'CHIPS', stake = '100') {
		console.log("Initialize Poker Stakes!");
		this.game.crypto = crypto;
		this.game.stake = stake;
		this.game.chips = 100;
		this.game.blind_mode = 'static';

		if (this.game.options.num_chips > 0) {
			this.game.chips = this.game.options.num_chips;
		}
		if (this.game.options.crypto) {
			this.game.crypto = this.game.options.crypto;
		}
		if (this.game.options.stake) {
			this.game.stake = this.game.options.stake;
		}
		if (this.game.options.blind_mod) {
			this.game.blind_mod = this.game.options.blind_mode;
		}

		this.settleNow = true;

		this.game.state.round = 1;

		this.game.state.big_blind = 2;
		this.game.state.small_blind = 1;
		this.game.state.last_raise = this.game.state.big_blind;
		this.game.state.required_pot = this.game.state.big_blind;

		for (let i = 0; i < this.game.players.length; i++) {
			this.game.state.passed[i] = 0;
			this.game.state.player_pot[i] = 0;
			this.game.state.debt[i] = 0;
			this.game.state.player_credit[i] = this.game.chips;
		}

		this.game.queue = ['newround'];

		//
		// and redisplay board
		//
		for (let i = 1; i <= this.game.players; i++) {
			this.playerbox.updateGraphics('', i);
		}

		console.log(JSON.parse(JSON.stringify(this.game.state)));

		this.board.render();

		//Doesn't do anything substantial
		console.log("Initialize Poker Stakes 2!");
		super.initializeGameStake(crypto, stake);
		console.log("Initialize Poker Stakes 3!");
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

		//
		// if flat, we remove the active transform below this.board.render()
		//
		this.theme = this.loadGamePreference("theme");
		this.sandee_theme_style = "perspective(700px) rotateX(33deg) !important";
		this.current_board_style = this.sandee_theme_style;
		if (this.theme == "flat") { this.current_board_style = ""; }
		if (this.theme == "" || this.theme == undefined) { this.theme = "flat"; this.current_board_style = ""; }

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
				game_mod.current_board_style = "";
				game_mod.board.render();
			}
		});

		this.menu.addSubMenuOption("game-theme", {
			text: `3D ${(this.theme == "3d") ? "✔" : ""}`,
			id: "game-theme-3d",
			class: "game-theme-3d",
			callback: function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				game_mod.theme = "3d";
				game_mod.saveGamePreference("theme", "3d");
				game_mod.current_board_style = game_mod.sandee_theme_style;
				game_mod.board.render();
			}
		});



		await super.render(app);

		//
		// board renders all subcomponents
		//
		this.board.render();


		if (this.theme == "flat") {
			let gb = document.querySelector(".gameboard");
			gb.style.transform = "";
		}

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




}


Poker.importFunctions(
	PokerState,
	PokerStake,
	PokerQueue,
	PokerPlayer,
	PokerDisplay,
	PokerCards
);

module.exports = Poker;
