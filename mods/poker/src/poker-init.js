const GameTableTemplate = require('../../lib/templates/table-gametemplate');
const GameBoard = require('./lib/ui/game-board/game-board');
const Stack = require('./lib/ui/stack/stack');
const Pot = require('./lib/ui/pot/pot');
const Cardfan = require('./lib/ui/cardfan/cardfan');
const Playerbox = require('./lib/ui/playerbox/playerbox');
const JSON = require('json-bigint');
const PokerGameRulesTemplate = require('./lib/poker-game-rules.template');
const PokerGameOptionsTemplate = require('./lib/poker-game-options.template');
const PokerStats = require("./lib/stats");
const htmlTemplate = require('./lib/game-html.template');


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


	initializeQueue() {
		this.game.queue = [];

		this.game.queue.push('ante');
		this.game.queue.push('READY');
		this.game.queue.push('POOL\t1');
		this.game.queue.push(
			`SIMPLEDEAL\t2\t1\t` + JSON.stringify(this.returnDeck())
		);
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
		super.initializeGameStake(crypto, stake);
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



