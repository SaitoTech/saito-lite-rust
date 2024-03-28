const GameTableTemplate = require('../../lib/templates/table-gametemplate');
const JSON = require('json-bigint');
const PokerGameRulesTemplate = require('./lib/poker-game-rules.template');
const PokerGameOptionsTemplate = require('./lib/poker-game-options.template');
const HealthMeter = require("./lib/poker-health-meter");
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
			'Texas Hold\'em Poker for the Saito Arcade. With five cards on the table and two in your hand, can you bet and bluff your way to victory?';
		this.categories = 'Games Cardgame Casino';
		this.card_img_dir = '/saito/img/arcade/cards';
		this.icon = 'fa-solid fa-diamond';

		this.minPlayers = 2;
		this.maxPlayers = 6;
		this.settlement = [];
		this.healthBars = [];

		this.stats = new PokerStats(app, this);

		this.animationSpeed = 800;

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

	}

	//
	// returns "1 CHIP" or "2.412 SAITO" or "1.423 CHIPS" etc.
	//
	formatWager(numChips, includeTicker = true) {
		let chips = this.game.crypto || 'CHIPS';
		if (chips === 'CHIPS') {
			if (numChips == 1) {
				chips = 'CHIP';
			}
		}

		let wager = this.convertChipsToCrypto(numChips);

		if (includeTicker) {
			wager += ' ' + chips;
		}

		return wager;
	}

	convertChipsToCrypto(numChips, asString = true) {
		let numCrypto =
			(numChips * parseFloat(this.game.stake)) / this.game.chips;

		//console.log(`${numChips} chips => ${numCrypto} ${this.game.crypto}`);

		if (asString) {
			return this.app.crypto.convertFloatToSmartPrecision(numCrypto);
		} else {
			return numCrypto;
		}
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

		await super.render(app);

		this.menu.addChatMenu();
		this.menu.render();

		this.log.render();

		this.playerbox.container = 'body';
		this.playerbox.mode = 2; // poker/cards
		this.playerbox.render();

		this.insertCryptoLogo(this.game?.options?.crypto);

		for (let i = 0; i < this.game.players.length; i++){
			let hm = new HealthMeter(this.app, this, `.game-playerbox-${i+1}`);
			hm.divisor = this.game.players.length;
			this.healthBars.push(hm);
			hm.render(this.game.state.player_credit[i]);
		}

		//
		// gametabletemplate adds a scoreboard DIV that shows HIDE / LEAVE / JOIN instructions
		// which we are going to hide to prevent UI / UX clutter, but leave functional so as to
		// enable faster experimentation.
		//
		if (document.querySelector('.game-scoreboard')) {
			document.querySelector('.game-scoreboard').style.display = 'none';
		}
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

		//Update from game.options (deactivated by Dave)
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

		this.displayBoard();

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
			this.displayBoard();
		}
	}

	//
	// returns "true" or "false" based on need to settle
	//
	needToSettleDebt() {
		if (!this.game.crypto || this.settleNow) {
			return false;
		}
		if (this.toLeave.length > 0) {
			return true;
		}
		for (let i = 0; i < this.game.state.player_credit.length; i++) {
			if (this.game.state.player_credit[i] <= 0) {
				return true;
			}
		}
		return false;
	}

	//
	// adds settlement instructions to queue for processing
	//
	settleDebt() {
		for (let i = 0; i < this.game.state.debt.length; i++) {
			if (this.game.state.debt[i] > 0) {
				for (let j = 0; j < this.game.state.debt.length; j++) {
					if (this.game.state.debt[j] < 0) {
						let amount_owed = Math.min(
							this.game.state.debt[j],
							this.game.state.debt[i]
						);
						if (amount_owed > 0) {
							this.game.state.debt[i] -= amount_owed;
							this.game.state.debt[j] += amount_owed;

							// Convert Chips to CRYPTO
							let amount_to_send =
								this.convertChipsToCrypto(amount_owed);

							let ts = new Date().getTime();
							this.rollDice();
							let uh = this.game.dice;
							this.settlement.push(
								`RECEIVE\t${this.game.players[i]}\t${this.game.players[j]}\t${amount_to_send}\t${ts}\t${uh}\t${this.game.crypto}`
							);
							this.settlement.push(
								`SEND\t${this.game.players[i]}\t${this.game.players[j]}\t${amount_to_send}\t${ts}\t${uh}\t${this.game.crypto}`
							);
						}
					}
				}
			}
		}
	}

	settleLastRound(winner_array, method) {
		/*
    We want these at the end of the queue so they get processed first, but if
    any players got removed, there will be some issues....
    */
		let msg = 'Clearing the table';
		this.game.queue.push('newround');

		this.game.queue.push('PLAYERS');
		this.game.queue.push('checkplayers');

		if (this.needToSettleDebt()) {
			this.settleDebt();
		}

		if (
			this.game.crypto &&
			this.game.crypto != 'CHIPS' &&
			this.settleNow == true
		) {
			msg += ' and settling bets...';
			for (let i = 0; i < this.settlement.length; i++) {
				this.game.queue.push(this.settlement[i]);
			}
		} else {
			msg += '...';
		}

		//
		// We will calculate vpip here, before resetting the next round
		// If a player voluntarily added money to the pot, +1
		// >>>>>>>>>>
		for (let i = 1; i <= this.game.players.length; i++){
			let voluntary_bet = this.game.state.player_pot[i-1];
			if (i == this.game.state.small_blind_player){
				voluntary_bet -= this.game.state.small_blind;
			}
			if (i == this.game.state.big_blind_player){
				voluntary_bet -= this.game.state.big_blind;
			}

			if (voluntary_bet > 0){
				this.game.stats[this.game.players[i-1]].vpip++;
			}
		}



		this.updateStatus(msg);
		this.settlement = [];
		this.game.queue.push(`ROUNDOVER\t${JSON.stringify(winner_array)}\t${method}`);

	}

	startRound() {
		this.updateLog('===============');
		this.updateLog('Round: ' + this.game.state.round);

		for (let i = 0; i < this.game.players.length; i++) {
			this.updateLog(
				`Player ${i + 1}${
					i + 1 == this.game.state.button_player ? ' (dealer)' : ''
				}: ${this.game.state.player_names[i]} (${this.formatWager(
					this.game.state.player_credit[i],
					true
				)})`
			);
		}

		for (let i = 1; i <= this.game.players.length; i++) {
			this.playerbox.updateGraphics('', i);
		}

		this.initializeQueue();
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

	handleGameLoop() {
		///////////
		// QUEUE //
		///////////
		if (this.game.queue.length > 0) {
			let qe = this.game.queue.length - 1;
			let mv = this.game.queue[qe].split('\t');
			let shd_continue = 1;

			if (this.browser_active) {
				this.updatePot(); //to update pot on blinds and bets...
			}

			if (mv[0] === 'winner') {
				this.displayPlayers(true); //to update chips before game_over
				this.game.queue = [];
				this.game.crypto = null;
				this.settleDebt();
				this.sendGameOverTransaction(
					this.game.players[parseInt(mv[1])],
					'elimination'
				);
				return 0;
			}

			if (mv[0] === 'newround') {
				//
				// clear displayed cards...
				//
				for (let i = 1; i <= this.game.players; i++) {
					this.playerbox.updateGraphics('', i);
				}

				this.game.state.round++;

				//Shift dealer, small blind, and big blind
				this.game.state.button_player--; //dealer
				if (this.game.state.button_player < 1) {
					this.game.state.button_player = this.game.players.length;
				}

				this.game.state.small_blind_player =
					this.game.state.button_player - 1;
				if (this.game.state.small_blind_player < 1) {
					this.game.state.small_blind_player =
						this.game.players.length;
				}

				this.game.state.big_blind_player =
					this.game.state.small_blind_player - 1;
				if (this.game.state.big_blind_player < 1) {
					this.game.state.big_blind_player = this.game.players.length;
				}

				// This needs to be reset between rounds, hahaah
				// Otherwise, you could fold and still win
				this.game.state.player_cards = {};
				this.game.state.player_cards_reported = 0;
				this.game.state.player_cards_required = 0;

				this.game.state.last_fold = null;
				this.game.state.winners = [];

				//Adjust blind levels if necessary
				if (
					this.game.blind_mode == 'increase' &&
					this.game.state.round % 5 == 0
				) {
					//TODO: parameterize num_rounds between increases
					this.game.state.small_blind++;
					this.game.state.big_blind += 2;

					this.updateLog(
						`Blinds increased to: ${this.game.state.big_blind}/${this.game.state.small_blind}`
					);
					salert(
						`Blinds increased to: ${this.game.state.big_blind}/${this.game.state.small_blind}`
					);
				}

				this.game.state.flipped = 0;
				this.game.state.plays_since_last_raise = 0;
				this.game.state.pot = 0;
				this.game.state.last_raise = this.game.state.big_blind;
				this.game.state.required_pot = this.game.state.big_blind;
				this.game.state.all_in = false; //we are stupidly testing for all_in on the display players

				for (let i = 0; i < this.game.players.length; i++) {
					this.game.state.passed[i] = 0;
					this.game.state.player_pot[i] = 0;
					this.game.stats[this.game.players[i]].hands++;
				}

				this.startRound();
				return 1;
			}

			//
			// turns "resolve"
			//
			if (mv[0] === 'resolve') {
				let last_mv = this.game.queue[qe - 1].split('\t');
				if (mv[1] === last_mv[0]) {
					this.game.queue.splice(qe - 1, 2);
				} else {
					console.error('Unexpected resolve in queue');
					this.game.queue.splice(qe, 1);
				}
				return 1;
			}

			if (mv[0] === 'checkplayers') {
				this.game.queue.splice(qe, 1);

				//Check for end of game -- everyone except 1 player has zero credit...
				let alive_players = 0;
				let winner = -1;
				let am_i_out = false;

				for (let i = 0; i < this.game.state.player_credit.length; i++) {
					if (this.game.state.player_credit[i] > 0) {
						alive_players++;
						winner = i;
					}
				}

				//Catch that only one player is standing at the start of the new round
				if (alive_players + this.toJoin.length == 1) {
					this.game.queue = [];
					this.game.queue.push('winner\t' + winner);
					return 1;
				}

				//
				// only remove if there are more than two players
				// if two players - let victory play out.
				//
				let removal = false;

				if (alive_players < this.game.state.player_credit.length) {
					for (
						let i = this.game.state.player_credit.length - 1;
						i >= 0;
						i--
					) {
						if (this.game.state.player_credit[i] <= 0) {
							this.updateLog(
								`Player ${i + 1} (${
									this.game.state.player_names[i]
								}) has been eliminated from the game.`
							);
							removal = true;
							//
							// remove any players who are missing
							if (this.game.players[i] == this.publicKey){
								am_i_out = true;
							}

							this.removePlayerFromState(i);
							this.removePlayer(this.game.players[i]);

							//Adjust dealer for each removed player
							if (i < this.game.state.button_player) {
								this.game.state.button_player--;
								if (this.game.state.button_player < 1) {
									this.game.state.button_player =
										this.game.players.length;
								}
							}
						}
					}
				}

				if (removal) {
					this.halted = 1;

					if (am_i_out){
						this.updateStatusForPlayerOut("You have been eliminated!", true);
					}else{
						this.resetGameWithFewerPlayers();	
					}
					return 0;
				}

				return 1;
			}

			//
			//Player's turn to fold,check,call,raise
			//
			if (mv[0] === 'turn') {
				let player_to_go = parseInt(mv[1]);
				this.game.target = player_to_go;
				//
				// if everyone except 1 player has folded...
				//
				let active_players = 0;
				let player_left_idx = 0;
				for (let i = 0; i < this.game.state.passed.length; i++) {
					if (this.game.state.passed[i] == 0) {
						active_players++;
						player_left_idx = i;
					}
				}

				/***********************/
				/*PLAYER WINS HAND HERE*/
				/***********************/

				if (active_players === 1) {
					let winnings =
						this.game.state.pot -
						this.game.state.player_pot[player_left_idx];

					let logMsg = `${
						this.game.state.player_names[player_left_idx]
					} wins ${this.formatWager(
						this.game.state.pot
					)} (${this.formatWager(winnings, false)} net)`;

					this.updateLog(logMsg);
					
					//this.game.state.player_credit[player_left_idx] +=	this.game.state.pot;
					
					this.game.stats[this.game.players[player_left_idx]]
						.wins++;

					if (this.game.state.flipped == 0){
						if (this.game.state.pot == this.game.state.big_blind + this.game.state.small_blind){
							// No one called or raised --> walk
							for (let p of this.game.players){
								this.game.stats[p].walks++;
							}
						}
					}

					//So that userline updates with winner
					this.game.state.winners = [player_left_idx+1];

					//
					// everyone settles with winner if needed
					//
					if (this.game.crypto) {
						for (let i = 0; i < this.game.players.length; i++) {
							if (i != player_left_idx) {
								//
								// only losers
								//
								if (this.game.state.player_pot[i] > 0) {
									let amount_to_send =
										this.convertChipsToCrypto(
											this.game.state.player_pot[i]
										);

									if (this.settleNow) {
										let ts = new Date().getTime();
										this.rollDice();
										let uh = this.game.dice;
										this.settlement.push(
											`RECEIVE\t${this.game.players[i]}\t${this.game.players[player_left_idx]}\t${amount_to_send}\t${ts}\t${uh}\t${this.game.crypto}`
										);
										this.settlement.push(
											`SEND\t${this.game.players[i]}\t${this.game.players[player_left_idx]}\t${amount_to_send}\t${ts}\t${uh}\t${this.game.crypto}`
										);
									} else {
										this.game.state.debt[i] +=
											this.game.state.player_pot[i];
										this.game.state.debt[player_left_idx] -=
											this.game.state.player_pot[i];
									}
								}
							}
						}
					}

					// if everyone has folded - start a new round
					this.halted = 1;

					let msg = `${this.game.state.player_names[player_left_idx]} wins the round`;
					if (this.game.player == player_left_idx + 1){
						msg = "You win the round";
					}

					this.cardfan.hide();
					this.animateWin(this.game.state.pot, [player_left_idx]);
					this.playerAcknowledgeNotice(msg, async () => {
						this.settleLastRound([this.game.players[player_left_idx]], "fold");
						this.clearTable();
					});

					return 0;

				}
				this.game.state.plays_since_last_raise++;

				//
				// Is this the end of betting?
				//
				if (
					this.game.state.plays_since_last_raise >
					this.game.players.length
				) {
					//Is this the end of the hand?
					if (this.game.state.flipped == 5) {
						this.playerbox.setInactive();

						this.game.queue = [];
						let first_scorer = 0;

						for (
							let i = 1;
							i <= this.game.state.passed.length;
							i++
						) {
							if (this.game.state.passed[i - 1] == 0) {
								first_scorer = first_scorer || i;
								this.game.state.player_cards_required++;
								this.game.state.player_cards[i] = [];

								this.game.stats[this.game.players[i-1]].showdowns++;
							}
						}

						if (first_scorer == this.game.player) {
							this.addMove(
								`reveal\t${this.game.player}\t${this.game.deck[0].hand[0]}\t${this.game.deck[0].hand[1]}`
							);
							this.endTurn();
						}
						return 0;
					} else {
						let cards_to_flip =
							this.game.state.flipped == 0 ? 3 : 1;

						this.game.state.flipped += cards_to_flip;

						//We can't just push "announce", have to reset queue to clear out any remaining turns
						this.game.queue = ['round', 'announce'];
						this.game.queue.push(
							`POOLDEAL\t1\t${cards_to_flip}\t1`
						);

						this.game.state.plays_since_last_raise = 0;
						return 1;
					}
				}

				if (this.game.state.passed[player_to_go - 1] == 1) {
					//
					// we auto-clear without need for player to broadcast
					//
					this.game.queue.splice(qe, 1);
					return 1;
				} else if (
					this.game.state.player_credit[player_to_go - 1] == 0
				) {
					//
					// we auto-clear without need for player to broadcast
					//
					this.game.queue.splice(qe, 1);
					return 1;
				} else {
					this.playerbox.setActive(player_to_go);

					if (player_to_go == this.game.player) {
						this.playerTurn();
					} else {
						this.refreshPlayerLog(
							`<div class="plog-update">active player</div>`,
							player_to_go
						);
						if (this.game.state.passed[this.game.player - 1]) {
							this.updateStatus('waiting for next round');
						} else {
							this.updateStatus(
								'waiting for ' +
									this.game.state.player_names[
										player_to_go - 1
									]
							);
						}
					}
					return 0;
				}
				shd_continue = 0;
			}

			if (mv[0] === 'announce') {
				this.game.queue.splice(qe, 1);

				if (this.game.state.flipped === 0) {
					if (this.game.player > 0) {
						this.updateLog(
							`*** HOLE CARDS *** [${this.cardToHuman(
								this.game.deck[0].hand[0]
							)} ${this.cardToHuman(this.game.deck[0].hand[1])}]`
						);
					}
					return 1;
				}

				this.animateRiver();

				if (this.game.state.flipped === 3) {
					this.updateLog(
						`*** FLOP *** [${this.cardToHuman(
							this.game.pool[0].hand[0]
						)} ${this.cardToHuman(
							this.game.pool[0].hand[1]
						)} ${this.cardToHuman(this.game.pool[0].hand[2])}]`
					);
				}
				if (this.game.state.flipped === 4) {
					this.updateLog(
						`*** TURN *** [${this.cardToHuman(
							this.game.pool[0].hand[0]
						)} ${this.cardToHuman(
							this.game.pool[0].hand[1]
						)} ${this.cardToHuman(
							this.game.pool[0].hand[2]
						)}] [${this.cardToHuman(this.game.pool[0].hand[3])}]`
					);
				}
				if (this.game.state.flipped === 5) {
					this.updateLog(
						`*** RIVER *** [${this.cardToHuman(
							this.game.pool[0].hand[0]
						)} ${this.cardToHuman(
							this.game.pool[0].hand[1]
						)} ${this.cardToHuman(
							this.game.pool[0].hand[2]
						)}] [${this.cardToHuman(
							this.game.pool[0].hand[3]
						)}] [${this.cardToHuman(this.game.pool[0].hand[4])}]`
					);
				}

				return 1;
			}

			if (mv[0] === 'reveal') {
				let scorer = parseInt(mv[1]);
				let card1 = mv[2];
				let card2 = mv[3];

				this.game.queue.splice(qe, 1);

				//Pocket
				this.game.state.player_cards[scorer].push(
					this.returnCardFromDeck(card1)
				);
				this.game.state.player_cards[scorer].push(
					this.returnCardFromDeck(card2)
				);

				let playercards = `
          <div class="other-player-hand hand tinyhand">
            <div class="card"><img src="${this.card_img_dir}/${this.game.deck[0].cards[card1].name}"></div>
            <div class="card"><img src="${this.card_img_dir}/${this.game.deck[0].cards[card2].name}"></div>
          </div>
        `;
				this.playerbox.updateGraphics(playercards, scorer);

				//Everyone can use the pool
				for (let i = 0; i < 5; i++) {
					this.game.state.player_cards[scorer].push(
						this.returnCardFromDeck(this.game.pool[0].hand[i])
					);
				}

				this.game.state.player_cards_reported++;

				if (
					this.game.state.player_cards_reported !==
					this.game.state.player_cards_required
				) {
					//If not everyone has reported there hand yet, find the next in sequence from this scorer
					let next_scorer = 0;
					for (
						let i = scorer;
						i < this.game.state.passed.length;
						i++
					) {
						if (this.game.state.passed[i] == 0) {
							next_scorer = i + 1;
							break;
						}
					}

					if (this.game.player == next_scorer) {
						this.addMove(
							`reveal\t${this.game.player}\t${this.game.deck[0].hand[0]}\t${this.game.deck[0].hand[1]}`
						);
						this.endTurn();
					}

					return 0;
				}

				//
				// we have all of the hands, and can pick a winner
				//
				// PLAYER WINS HAND HERE
				//
				let winners = [];
				let winner_keys = [];

				var updateHTML = '';
				var winlist = [];

				for (let i = 1; i <= this.game.players.length; i++){
					this.playerbox.updateUserline(`<span></span><div class="saito-balance">${this.formatWager(this.game.state.player_credit[i-1])}</div>`, i);			
				}

				//Sort hands from low to high
				for (var key in this.game.state.player_cards) {
					let deck = this.game.state.player_cards[key];

					if (winlist.length == 0) {
						winlist.splice(0, 0, {
							player: parseInt(key),
							player_hand: this.scoreHand(deck)
						});
					} else {
						let score = this.scoreHand(deck);
						let winlist_length = winlist.length;
						let place = 0;

						for (let k = 0; k < winlist_length; k++) {
							let w = this.pickWinner(
								winlist[k].player_hand,
								score
							);
							if (w > 1) {
								place = k + 1;
							}
						}
						winlist.splice(place, 0, {
							player: parseInt(key),
							player_hand: score
						});
					}
				}

				// Populate winners with winning players
				let topPlayer = winlist[winlist.length - 1];
				let winning_hand = topPlayer.player_hand.hand_description;

				console.log("Showdown:", winlist);

				// ... and anyone else who ties
				for (let p = 0; p < winlist.length; p++) {
					if (
						this.pickWinner(
							topPlayer.player_hand,
							winlist[p].player_hand
						) == 3
					) {
						winners.push(winlist[p].player - 1);
						winner_keys.push(
							this.game.players[winlist[p].player - 1]
						);
					}
				}

				// Put my key first, if it is in the list
				winners.sort((a, b) => {
					if (b == this.game.player - 1){
						return 1;
					}
					return 0;
				});

				// split winnings among winners
				let pot_size = Math.floor(this.game.state.pot / winners.length);
				let winnerStr = '';

				// single winner gets everything

				let logMsg =
					winners.length > 1
						? `split the pot for ${this.formatWager(pot_size)} each`
						: `wins ${this.formatWager(
							this.game.state.pot
						  )} (${this.formatWager(
							this.game.state.pot -
									this.game.state.player_pot[winners[0]],
							false
						  )} net)`;

				for (let i = 0; i < winners.length; i++) {
					if (i >= 1){
						if (i + 1 < winners.length) {
							winnerStr += ', ';
						}else{
							winnerStr += ", and ";
						}
					} 
					this.game.stats[this.game.players[winners[i]]].wins++;
					if (winners[i] == this.game.player - 1){
						winnerStr += "You";
					}else{
						winnerStr += this.game.state.player_names[winners[i]];	
					}
					
					//this.game.state.player_credit[winners[i]] += pot_size;
					//this.game.state.pot -= pot_size;

					this.game.state.winners.push(winners[i]+1);

				}

				//update log
				this.updateLog(winnerStr + logMsg);

				// update splash!
				if (winners.length == 1) {
					if (winners[0] == this.game.player -1 ){
						winnerStr += ` win with ${winning_hand.toUpperCase()}!`;
					}else{
						winnerStr += ` wins with ${winning_hand.toUpperCase()}!`;	
					}
				} else {
					winnerStr += ` split the pot with ${winning_hand.toUpperCase()}!`;
				}

				winlist.forEach((pl) => {
					this.updateLog(
						`${this.game.state.player_names[pl.player - 1]}: ${
							pl.player_hand.hand_description
						} <br> ${this.toHuman(pl.player_hand.cards_to_score)}`
					);

					let player_hand = this.game.state.player_cards[
						pl.player
					].slice(0, 2);
					updateHTML =
						`<div class="player-result">` +
						this.handToHTML(
							pl.player_hand.cards_to_score,
							player_hand
						) +
						'</div>' +
						updateHTML;

					updateHTML = `<div class="h3">${
						this.game.state.player_names[pl.player - 1]
					}: ${pl.player_hand.hand_description}</div>${updateHTML}`;


				});

				this.updateHTML = updateHTML;

				//
				// non-winners send wagers to winner
				//
				if (this.game.crypto) {
					for (let ii = 0; ii < this.game.players.length; ii++) {
						for (let i = 0; i < winners.length; i++) {
							if (
								!winners.includes(ii) &&
								this.game.state.player_pot[ii] > 0
							) {
								let amount_to_send = this.convertChipsToCrypto(
									this.game.state.player_pot[ii] /
										winners.length
								);
								//To Do: check math on this... and make more efficient (fewer transfers total if split pot)

								if (this.settleNow) {
									// do not reformat -- adding whitespace screws with API
									let ts = new Date().getTime();
									this.rollDice();
									let uh = this.game.dice;
									this.settlement.push(
										`RECEIVE\t${this.game.players[ii]}\t${
											this.game.players[winners[i]]
										}\t${amount_to_send}\t${ts}\t${uh}\t${
											this.game.crypto
										}`
									);
									this.settlement.push(
										`SEND\t${this.game.players[ii]}\t${
											this.game.players[winners[i]]
										}\t${amount_to_send}\t${ts}\t${uh}\t${
											this.game.crypto
										}`
									);
								} else {
									let share_of_winnings =
										this.game.state.player_pot[ii] /
										winners.length;
									this.game.state.debt[ii] +=
										share_of_winnings;
									this.game.state.debt[winners[i]] -=
										share_of_winnings;
								}
							}
						}
					}
				}


				this.halted = 1;
				this.cardfan.hide();
				this.animateWin(pot_size, winners);
				this.playerAcknowledgeNotice(winnerStr, async () => {
					this.settleLastRound(winner_keys, "besthand");
					this.clearTable();
				});

				return 0;
			}

			//Set up bets for beginning of round (new deal)
			if (mv[0] == 'ante') {
				this.game.queue.splice(qe, 1);

				this.displayBoard(); //Clean HTML

				let bbpi = this.game.state.big_blind_player - 1;
				//
				// Big Blind
				//
				if (
					this.game.state.player_credit[bbpi] <=
					this.game.state.big_blind
				) {
					this.updateLog(
						this.game.state.player_names[bbpi] +
							` posts remaining ${this.game.state.player_credit[bbpi]} chips for big blind and is removed from game`
					);
					//Put all the player tokens in the pot and have them pass / remove
					this.game.state.player_pot[bbpi] +=
						this.game.state.player_credit[bbpi];
					//this.game.state.pot += this.game.state.player_credit[bbpi];
					//this.game.state.player_credit[bbpi] = 0;
					this.animateBet(this.game.state.player_credit[bbpi], bbpi);
					this.game.state.passed[bbpi] = 1;
				} else {
					this.updateLog(
						`${
							this.game.state.player_names[bbpi]
						} posts big blind: ${this.formatWager(
							this.game.state.big_blind
						)}`
					);
					this.game.state.player_pot[bbpi] +=
						this.game.state.big_blind;
					//this.game.state.pot += this.game.state.big_blind;
					//this.game.state.player_credit[bbpi] -=
					//	this.game.state.big_blind;
					this.animateBet(this.game.state.big_blind, bbpi);
				}

				//this.refreshPlayerLog(`<div class="plog-update">committed: ${this.formatWager(this.game.state.big_blind)}</div>`,this.game.state.big_blind_player);

				//
				// Small Blind
				//
				let sbpi = this.game.state.small_blind_player - 1;
				if (
					this.game.state.player_credit[sbpi] <=
					this.game.state.small_blind
				) {
					this.updateLog(
						this.game.state.player_names[sbpi] +
							` posts remaining ${this.game.state.player_credit[sbpi]} chips as small blind and is removed from the game`
					);
					this.game.state.player_pot[sbpi] +=
						this.game.state.player_credit[sbpi];
					//this.game.state.pot += this.game.state.player_credit[sbpi];
					//this.game.state.player_credit[sbpi] = 0;
					this.animateBet(this.game.state.player_credit[sbpi], sbpi);
					this.game.state.passed[sbpi] = 1;
				} else {
					this.updateLog(
						`${
							this.game.state.player_names[sbpi]
						} posts small blind: ${this.formatWager(
							this.game.state.small_blind
						)}`
					);
					this.game.state.player_pot[sbpi] +=
						this.game.state.small_blind;
					//this.game.state.pot += this.game.state.small_blind;
					//this.game.state.player_credit[sbpi] -=
					//	this.game.state.small_blind;
					this.animateBet(this.game.state.small_blind, sbpi);
				}

				this.displayPlayers(true); //Update Chip stacks after betting
				this.game.queue.push('round'); //Start
				this.game.queue.push('announce'); //Print Hole cards to Log
			}

			/* Set up a round
         We don't splice it, so we keep coming back here after each player has taken their turn
         until we reach an endgame state which runs startNextRound and clears to queue
      */
			if (mv[0] === 'round') {
				// Start betting to the left of the big blind on first turn

				let lastToBet =
					this.game.state.flipped == 0 &&
					this.game.state.plays_since_last_raise <
						this.game.players.length
						? this.game.state.big_blind_player
						: this.game.state.button_player;
				for (
					let i = lastToBet;
					i <= lastToBet + this.game.players.length - 1;
					i++
				) {
					let player_to_go = i % this.game.players.length;
					if (player_to_go == 0) {
						player_to_go = this.game.players.length;
					}
					this.game.queue.push('turn\t' + player_to_go);
				}
			}

			/* WE programmatically determine here how much the call is*/
			if (mv[0] === 'call') {
				let player = parseInt(mv[1]);

				let amount_to_call =
					this.game.state.required_pot -
					this.game.state.player_pot[player - 1];

				if (amount_to_call <= 0) {
					console.error('Zero/Negative Call');
				}


				if (this.game.state.player_credit[player - 1] === amount_to_call) {
					this.game.state.all_in = true;
					this.updateLog(
						this.game.state.player_names[player - 1] +
							' goes all in to call'
					);
					if (this.game.player !== player) {
					this.refreshPlayerLog(
						`<div class="plog-update">All in!</div>`,
						player
					);
				}

				} else {
					this.updateLog(
						this.game.state.player_names[player - 1] + ' calls'
					);
					if (this.game.player !== player) {
						this.refreshPlayerLog(
							`<div class="plog-update">calls</div>`,
							player
						);
					}

				}

				//
				// reset plays since last raise
				//
				
				this.game.state.player_pot[player - 1] += amount_to_call;
				this.animateBet(amount_to_call, player - 1, true);
				//this.game.state.pot += amount_to_call;
				//this.game.state.player_credit[player - 1] -= amount_to_call;
				
				this.game.queue.splice(qe, 1);

				this.refreshPlayerStack(player); //Here we don't want to hide cards


				return 0;
			}

			if (mv[0] === 'fold') {
				let player = parseInt(mv[1]);

				this.updateLog(
					this.game.state.player_names[player - 1] + ' folds'
				);

				this.game.stats[this.game.players[player - 1]].folds++;
				this.game.state.passed[player - 1] = 1;
				this.game.state.last_fold = player;
				this.game.queue.splice(qe, 1);

				if (this.browser_active) {
					if (this.game.player !== player) {
						this.refreshPlayerLog(
							`<div class="plog-update">folds</div>`,
							player
						);
					} else {
						this.displayHand();
					}
				}

			}

			if (mv[0] === 'check') {
				let player = parseInt(mv[1]);
				this.game.queue.splice(qe, 1);
				this.updateLog(
					this.game.state.player_names[player - 1] + ' checks.'
				);
				if (this.game.player !== player && this.browser_active) {
					this.refreshPlayerLog(
						`<div class="plog-update">checks</div>`,
						player
					);
				}
				return 1;
			}

			if (mv[0] === 'raise') {
				let player = parseInt(mv[1]);
				let raise = parseInt(mv[2]); // raise is a float now, i don't think so !!!!

				let call_portion =
					this.game.state.required_pot -
					this.game.state.player_pot[player - 1];
				let raise_portion = raise - call_portion;

				this.game.state.plays_since_last_raise = 1;

				//this.game.state.player_credit[player - 1] -= raise;
				this.game.state.player_pot[player - 1] += raise;
				//this.game.state.pot += raise;

				if (this.game.state.player_credit[player - 1] === raise) {
					this.game.state.all_in = true;
					raise_message = `goes all in `;
					if (this.game.player !== player && this.browser_active) {
						this.refreshPlayerLog(
							`<div class="plog-update">all in!</div>`,
							player
						);
					}
				}

				this.animateBet(raise, player - 1, true);

				this.game.state.last_raise = raise_portion;
				this.game.state.required_pot += raise_portion;

				let raise_message = `raises ${this.formatWager(
					raise_portion
				)} `;

				if (call_portion > 0) {
					if (raise_portion > 0) {
						this.updateLog(
							`${
								this.game.state.player_names[player - 1]
							} ${raise_message}to ${this.formatWager(
								this.game.state.player_pot[player - 1]
							)}`
						);
						if (
							this.game.player !== player &&
							this.browser_active
						) {
							this.refreshPlayerLog(
								`<div class="plog-update">raises ${this.formatWager(
									raise_portion
								)}</div>`,
								player
							);
						}
					} else {
						this.updateLog(
							`${
								this.game.state.player_names[player - 1]
							} calls ${this.formatWager(call_portion)}`
						);
						if (
							this.game.player !== player &&
							this.browser_active
						) {
							this.refreshPlayerLog(
								`<div class="plog-update">calls ${this.formatWager(
									call_portion
								)}</div>`,
								player
							);
						}
					}
				} else {
					this.updateLog(
						`${
							this.game.state.player_names[player - 1]
						} ${raise_message}to ${this.formatWager(
							this.game.state.player_pot[player - 1]
						)}`
					);
					if (this.game.player !== player && this.browser_active) {
						this.refreshPlayerLog(
							`<div class="plog-update">raises ${this.formatWager(
								raise
							)}</div>`,
							player
						);
					}
				}
				this.game.queue.splice(qe, 1);
				this.refreshPlayerStack(player); //Here we don't want to hide cards

				return 0;
			}

			//
			// avoid infinite loops
			//
			if (shd_continue == 0) {
				return 0;
			}
		} else {
		}
		return 1;
	}

	playerTurn() {
		if (this.browser_active == 0) {
			return;
		}
		if (this.game.player == 0) {
			salert('How on earth did we call player-zero turn??');
			return;
		}

		let poker_self = this;
		let balance_html = '';
		let html = '';
		let mobileToggle =
			window.matchMedia('(orientation: landscape)').matches &&
			window.innerHeight <= 600;

		//
		// cancel raise kicks us back
		//
		if (!poker_self.moves.includes('resolve\tturn')) {
			poker_self.addMove('resolve\tturn');
		}

		let match_required =
			this.game.state.required_pot -
			this.game.state.player_pot[this.game.player - 1];

		if (match_required == 0 && this.game.state.all_in) {
			poker_self.endTurn();
			return;
		}

		if (match_required < 0) {
			console.warn('Hmmm, can bet negative chips');
			match_required = 0;
		}

		//These would be a strange edge case
		this.game.state.last_raise = Math.max(
			this.game.state.last_raise,
			this.game.state.big_blind
		);

		let can_call =
			this.game.state.player_credit[this.game.player - 1] >=
			match_required;
		let can_raise =
			!this.game.state.all_in &&
			this.game.state.player_credit[this.game.player - 1] >
				match_required;

		//cannot raise more than everyone can call.
		//
		// TODO - buy-ins will change this smallest stack calculation
		//
		let smallest_stack = this.game.chips * poker_self.game.players.length; //Start with total amount of money in the game
		let smallest_stack_player = 0;

		poker_self.game.state.player_credit.forEach((stack, index) => {
			if (poker_self.game.state.passed[index] == 0) {
				stack += this.game.state.player_pot[index];
				stack -= this.game.state.required_pot;
				if (stack < smallest_stack) {
					smallest_stack = stack;
					smallest_stack_player = index;
				}
			}
		});

		if (!can_call) {
			this.updateStatus('You can only fold...');
			this.addMove('fold\t' + poker_self.game.player);
			this.endTurn();
			return;
		}

		balance_html = `
  <div class="menu-player-upper">
          <div style="float:right;" class="saito-balance">${this.formatWager(
		this.game.state.player_credit[this.game.player - 1]
	)}</div>
        </div>
    `;
		this.app.browser.replaceElementBySelector(
			balance_html,
			`.game-playerbox-body-${this.game.player} .menu-player-upper`
		);

		html = '<ul>';
		html += '<li class="option" id="fold">fold</li>';

		if (match_required > 0) {
			html += `<li class="option" id="call">call - ${this.formatWager(
				match_required
			)}</li>`;
		} else {
			// we don't NEED to match
			html += '<li class="option" id="check">check</li>';
		}
		if (can_raise) {
			html += `<li class="option" id="raise">raise</li>`;
		}
		html += '</ul>';

		this.updateStatus(html);

		$('.option').off();
		$('.option').on('click', function () {
			let choice = $(this).attr('id');

			if (choice === 'raise') {
				let credit_remaining =
					poker_self.game.state.player_credit[
						poker_self.game.player - 1
					] - match_required;

				html = `<div class="menu-player">`;
				if (match_required > 0) {
					html += `match ${poker_self.formatWager(
						match_required
					)} and raise `;
				} else {
				}
				html += `</div><ul><li class="option" id="0">${
					mobileToggle ? 'nope' : 'cancel raise'
				}</li>`;
				let max_raise = Math.min(credit_remaining, smallest_stack);

				for (let i = 0; i < 4; i++) {
					let this_raise =
						poker_self.game.state.last_raise +
						i * poker_self.game.state.last_raise;

					if (max_raise > this_raise) {
						html += `<li class="option" id="${
							this_raise + match_required
						}">${
							mobileToggle ? ' ' : 'raise '
						}${poker_self.formatWager(this_raise)}</li>`;
					} else {
						break;
					}
				}

				//Always give option for all in
				html += `<li class="option" id="${max_raise + match_required}">
                  raise ${poker_self.formatWager(max_raise)} 
                  (all in${
	smallest_stack_player !== poker_self.game.player - 1
		? ` for ${poker_self.game.state.player_names[smallest_stack_player]}`
		: ''
})</li>`;

				html += '</ul>';
				poker_self.updateStatus(html);

				$('.option').off();
				$('.option').on('click', function () {
					let raise = $(this).attr('id');

					if (raise === '0') {
						poker_self.playerTurn();
					} else {
						poker_self.addMove(
							`raise\t${poker_self.game.player}\t${raise}`
						);
						poker_self.endTurn();
					}
				});
			} else {
				poker_self.addMove(`${choice}\t${poker_self.game.player}`);
				poker_self.endTurn();
			}
		});
	}

	returnState(num_of_players) {
		let state = {};

		state.round = 1;
		state.flipped = 0;

		state.player_cards = {};
		state.player_cards_reported = 0;
		state.player_cards_required = 0;

		state.plays_since_last_raise = 0;

		state.pot = 0;

		state.big_blind_player = 1;
		state.small_blind_player = 2;
		state.button_player = 3;

		if (num_of_players == 2) {
			state.button_player = 2;
			state.big_blind_player = 2;
			state.small_blind_player = 1;
		}

		state.player_names = [];
		state.player_pot = [];
		state.player_credit = [];
		state.passed = [];
		state.debt = [];

		state.winners = [];
		state.last_fold = null;

		//
		// initializeGameStake should flesh this out
		//
		for (let i = 0; i < num_of_players; i++) {
			state.passed[i] = 0;
			state.player_pot[i] = 0;
			state.player_credit[i] = 0;
			state.debt[i] = 0;
			state.player_names[i] = this.app.keychain.returnUsername(
				this.game.players[i],
				12
			);
		}

		state.big_blind = 2;
		state.small_blind = 1;
		state.last_raise = 2;
		state.required_pot = 2;
		state.all_in = false;

		return state;
	}

	returnStats() {
		let stats = {};
		for (let i = 0; i < this.game.players.length; i++) {
			stats[this.game.players[i]] = {};
			stats[this.game.players[i]].hands = 0;
			stats[this.game.players[i]].wins = 0;
			stats[this.game.players[i]].folds = 0;
			stats[this.game.players[i]].walks = 0;
			stats[this.game.players[i]].vpip = 0;
			stats[this.game.players[i]].showdowns = 0;
		}
		return stats;
	}

	removePlayerFromState(index) {
		if (index >= 0 && index < this.game.state.player_names.length){
			this.game.state.player_names.splice(index, 1);
			this.game.state.player_pot.splice(index, 1);
			this.game.state.player_credit.splice(index, 1);
			this.game.state.passed.splice(index, 1);
			this.game.state.debt.splice(index, 1);
		}else{
			console.warn("Invalid index removePlayerFromState");
		}
	}

	returnCardFromDeck(idx) {
		let deck = this.returnDeck();
		let card = deck[idx];
		return card.name.substring(0, card.name.indexOf('.'));
	}

	/* TO-DO rectify poker decks across games!*/

	returnDeck() {
		var deck = {};

		deck['1'] = { name: 'S1.png' };
		deck['2'] = { name: 'S2.png' };
		deck['3'] = { name: 'S3.png' };
		deck['4'] = { name: 'S4.png' };
		deck['5'] = { name: 'S5.png' };
		deck['6'] = { name: 'S6.png' };
		deck['7'] = { name: 'S7.png' };
		deck['8'] = { name: 'S8.png' };
		deck['9'] = { name: 'S9.png' };
		deck['10'] = { name: 'S10.png' };
		deck['11'] = { name: 'S11.png' };
		deck['12'] = { name: 'S12.png' };
		deck['13'] = { name: 'S13.png' };
		deck['14'] = { name: 'C1.png' };
		deck['15'] = { name: 'C2.png' };
		deck['16'] = { name: 'C3.png' };
		deck['17'] = { name: 'C4.png' };
		deck['18'] = { name: 'C5.png' };
		deck['19'] = { name: 'C6.png' };
		deck['20'] = { name: 'C7.png' };
		deck['21'] = { name: 'C8.png' };
		deck['22'] = { name: 'C9.png' };
		deck['23'] = { name: 'C10.png' };
		deck['24'] = { name: 'C11.png' };
		deck['25'] = { name: 'C12.png' };
		deck['26'] = { name: 'C13.png' };
		deck['27'] = { name: 'H1.png' };
		deck['28'] = { name: 'H2.png' };
		deck['29'] = { name: 'H3.png' };
		deck['30'] = { name: 'H4.png' };
		deck['31'] = { name: 'H5.png' };
		deck['32'] = { name: 'H6.png' };
		deck['33'] = { name: 'H7.png' };
		deck['34'] = { name: 'H8.png' };
		deck['35'] = { name: 'H9.png' };
		deck['36'] = { name: 'H10.png' };
		deck['37'] = { name: 'H11.png' };
		deck['38'] = { name: 'H12.png' };
		deck['39'] = { name: 'H13.png' };
		deck['40'] = { name: 'D1.png' };
		deck['41'] = { name: 'D2.png' };
		deck['42'] = { name: 'D3.png' };
		deck['43'] = { name: 'D4.png' };
		deck['44'] = { name: 'D5.png' };
		deck['45'] = { name: 'D6.png' };
		deck['46'] = { name: 'D7.png' };
		deck['47'] = { name: 'D8.png' };
		deck['48'] = { name: 'D9.png' };
		deck['49'] = { name: 'D10.png' };
		deck['50'] = { name: 'D11.png' };
		deck['51'] = { name: 'D12.png' };
		deck['52'] = { name: 'D13.png' };

		return deck;
	}

	/****************
	 *
	 ***** GUI *****
	 *
	 ***************/

	displayBoard() {
		if (!this.browser_active) {
			return;
		}
		try {
			this.displayPlayers(); //Clear player log
			this.displayHand();
			this.displayTable();
		} catch (err) {
			console.error('err: ' + err);
		}
	}

	returnPlayerRole(player) {
		if (this.game.state.winners.includes(player)){
			return "Winner!";
		}
		if (player == this.game.state.small_blind_player) {
			return 'small blind';
		}
		if (player == this.game.state.big_blind_player) {
			return 'big blind';
		}
		if (player == this.game.state.button_player) {
			return 'dealer';
		}

		return '';
	}

	displayPlayers(preserveLog = false) {
		if (!this.browser_active) {
			return;
		}
		try {
			for (let i = 1; i <= this.game.players.length; i++) {
				this.refreshPlayerStack(i);
				this.playerbox.updateIcons(``, i);
				if (!preserveLog) {
					this.refreshPlayerLog('', i);
				}
			}
			this.playerbox.updateIcons(
				`<i class="fa-solid fa-circle-dot"></i>`,
				this.game.state.button_player
			);
		} catch (err) {
			console.log('error displaying player box', err);
		}
	}

	displayHand() {
		if (this.game.player == 0) {
			this.updateStatus(`You are observing the game`, -1);
			return;
		}

		if (this.game.state.passed[this.game.player - 1]) {
			this.cardfan.hide();
		} else {
			this.cardfan.render();
		}
	}

	returnTicker() {
		if (this.game.crypto) {
			return this.game.crypto;
		}
		return 'CHIPS';
	}

	updatePot() {
		let poker_self = this;

		let html = `<div class="pot-counter">${this.formatWager(this.game.state.pot)}</div>`;

		$('#pot').css('display', 'flex');

		this.app.browser.replaceElementBySelector(html, ".pot-counter");

	}

	displayTable() {
		if (!this.browser_active) {
			return;
		}
		try {
			if (document.getElementById('deal')) {
				let newHTML = '';
				for (
					let i = 0;
					i < 5 || i < this.game.pool[0].hand.length;
					i++
				) {
					let card = {};

					if (i < this.game.pool[0].hand.length) {
						card =
							this.game.pool[0].cards[this.game.pool[0].hand[i]];
						newHTML += `<div class="flip-card card"><img class="cardFront" src="${this.card_img_dir}/${card.name}"></div>`;
					} else {
						newHTML += `<div class="flip-card card"><img class="cardBack" src="${this.card_img_dir}/red_back.png"></div>`;
					}
				}
				document.getElementById('deal').innerHTML = newHTML;
			}
		} catch (err) {
			console.warn('Card error displaying table:', err);
		}
		this.updatePot();
	}

	async animateRiver() {
		if (!this.browser_active || !document.getElementById('deal')) {
			return;
		}

		for (let i = 0; i < this.game.pool[0].hand.length; i++) {
			let card = this.game.pool[0].cards[this.game.pool[0].hand[i]];
			let nthSlot = $('#deal').children().get(i);

			if (
				nthSlot.classList.contains('flipped') ||
				!nthSlot.classList.contains('flip-card')
			) {
				continue;
			}
			$(nthSlot).append(
				`<img class="card cardFront" src="${this.card_img_dir}/${card.name}">`
			);
			await this.timeout(250);
			$(nthSlot).addClass('flipped');
		}
	}

	//
	// We will actually increment player stack / decrement the game pot in this function!!!
	//
	async animateWin(amount, player_indices){	

		for (let i = 0; i < amount; i++){
	
			for (let j = 0; j < player_indices.length; j++){

				this.moveGameElement(this.createGameElement(`<div class="poker-chip"></div>`, ".pot-chips"),
					`.game-playerbox-${player_indices[j] + 1}`,
					{
						callback: () => {
							this.game.state.pot--;
							this.game.state.player_credit[player_indices[j]]++;
							this.updatePot();
							this.refreshPlayerStack(player_indices[j] + 1);
						},
						run_all_callbacks: true
					},
					(item) => {
						$(item).remove();
					});
				await this.timeout(1000/amount);
			}
		}

		if (this.game.state.pot > 0) {
			// ***TO DO: examine possibility of fractional chips
			// Randomly give the remaining chip to one player
		}


	}

	async animateBet(amount, player_index, restartQueue = false){

		if (restartQueue){
			this.halted = 1;
		}
		
		for (let i = 0; i < amount; i++){

			this.moveGameElement(this.createGameElement(`<div class="poker-chip"></div>`, `.game-playerbox-${player_index+1}`),
				".pot-chips",
				{
					callback: () => {
						this.game.state.pot++;
						this.game.state.player_credit[player_index]--;
						this.updatePot();
						this.refreshPlayerStack(player_index+1);
					},
					run_all_callbacks: !restartQueue
				},
				(item) => {
					if (!restartQueue){
						$(item).remove();	
					}else{
						$('.animated_elem').remove();
						console.log("*******************************");
						this.restartQueue();
					}
					
				});
			await this.timeout(500/amount);
		}

	}

	async clearTable() {
		if (!this.browser_active) {
			return;
		}

		$('#pot').fadeOut(1650);


		$('.game-playerbox-graphics .hand').animate(
			{ left: '1000px' },
			1200,
			'swing',
			function () {
				$(this).remove();
			}
		);

		await this.timeout(600);

		$($('#deal').children().get().reverse()).each(function (index) {
			$(this)
				.delay(50 * index)
				.queue(function () {
					$(this)
						.removeClass('flipped')
						.delay(20 * index)
						.queue(function () {
							$(this)
								.animate(
									{ left: '1000px' },
									1200,
									'swing',
									function () {
										$(this).remove();
									}
								)
								.dequeue();
						})
						.dequeue();
				});
		});

		$('.winner').removeClass('winner');

		await this.timeout(1000);
		this.restartQueue();
	}

	refreshPlayerLog(html, player) {
		this.playerbox.updateBody(html, player);
	}

	refreshPlayerStack(player) {
		if (!this.browser_active) {
			return;
		}

		let credit = this.game.state.player_credit[player - 1]; 

		let userline =
			this.returnPlayerRole(player) +
			`<div class="saito-balance">${this.formatWager(credit)}</div>`;
		this.playerbox.updateUserline(userline, player);

		this.healthBars[player-1].render(credit);
	}

	async exitGame(){
      if (this.game.over == 0 && this.game.player){
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
      }else{
      	super.exitGame();
      }
	}


	async receiveStopGameTransaction(resigning_player, txmsg) {
		console.log("Poker: receiveStopGameTransaction", txmsg, resigning_player);

		await super.receiveStopGameTransaction(resigning_player, txmsg);

		if (this.publicKey == resigning_player){
			return;
		}

		let loser = -1;
		for (let i = 0; i < this.game.players.length; i++){
			if (this.game.players[i] == resigning_player){
				loser = i + 1;
				break;
			}
		}

		if (loser < 0){
			console.log("Player is not in the game");
			return;
		}

		if (txmsg?.deck){
			if (!this.game?.opponent_decks){
				this.game.opponent_decks = {};	
			}
			if (!this.game.opponent_decks[`${loser}`]){
			 this.game.opponent_decks[`${loser}`] = txmsg.deck;
			}
		}

		if (this.browser_active) {
			if (this.publicKey !== resigning_player) {
				this.refreshPlayerLog(
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

	/* Functions to analyze hands and compare them*/

	pickWinner(score1, score2) {
		let hands_differ = false;

		//Check if hands are different
		for (let i = 0; i < score1.cards_to_score.length; i++) {
			if (score1.cards_to_score[i] !== score2.cards_to_score[i]) {
				hands_differ = true;
			}
		}
		if (!hands_differ) {
			return 3; // == tie
		}

		if (
			score1.hand_description == 'royal flush' &&
			score2.hand_description == 'royal flush'
		) {
			for (let i = 0; i < score1.cards_to_score.length; i++) {
				// first card will be aces, so we only need to compare the first entry
				if (
					this.returnHigherCard(
						score1.cards_to_score[i],
						score2.cards_to_score[i]
					) == score1.cards_to_score[i]
				) {
					return 1;
				} else {
					return 2;
				}
			}
		}

		if (score1.hand_description == 'royal flush') {
			return 1;
		}
		if (score2.hand_description == 'royal flush') {
			return 2;
		}

		if (
			score1.hand_description == 'straight flush' &&
			score2.hand_description == 'straight flush'
		) {
			for (let i = 0; i < score1.cards_to_score.length; i++) {
				if (
					this.returnHigherNumberCard(
						score1.cards_to_score[i],
						score2.cards_to_score[i]
					) == score1.cards_to_score[i]
				) {
					return 1;
				}
				if (
					this.returnHigherNumberCard(
						score1.cards_to_score[i],
						score2.cards_to_score[i]
					) == score2.cards_to_score[i]
				) {
					return 2;
				}
			}
			return 3;
		}
		if (score1.hand_description == 'straight flush') {
			return 1;
		}
		if (score2.hand_description == 'straight flush') {
			return 2;
		}

		if (
			score1.hand_description == 'four-of-a-kind' &&
			score2.hand_description == 'four-of-a-kind'
		) {
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[0],
					score2.cards_to_score[0]
				) == score1.cards_to_score[0]
			) {
				return 1;
			}
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[0],
					score2.cards_to_score[0]
				) == score2.cards_to_score[0]
			) {
				return 2;
			}
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[4],
					score2.cards_to_score[4]
				) == score1.cards_to_score[4]
			) {
				return 1;
			}
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[4],
					score2.cards_to_score[4]
				) == score2.cards_to_score[4]
			) {
				return 2;
			}
			return 3;
		}
		if (score1.hand_description == 'four-of-a-kind') {
			return 1;
		}
		if (score2.hand_description == 'four-of-a-kind') {
			return 2;
		}

		if (
			score1.hand_description == 'full house' &&
			score2.hand_description == 'full house'
		) {
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[0],
					score2.cards_to_score[0]
				) == score1.cards_to_score[0]
			) {
				return 1;
			}
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[0],
					score2.cards_to_score[0]
				) == score2.cards_to_score[0]
			) {
				return 2;
			}
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[3],
					score2.cards_to_score[3]
				) == score1.cards_to_score[3]
			) {
				return 1;
			}
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[3],
					score2.cards_to_score[3]
				) == score2.cards_to_score[3]
			) {
				return 2;
			}
			return 3;
		}
		if (score1.hand_description == 'full house') {
			return 1;
		}
		if (score2.hand_description == 'full house') {
			return 2;
		}

		if (
			score1.hand_description == 'flush' &&
			score2.hand_description == 'flush'
		) {
			for (let i = 0; i < score1.cards_to_score.length; i++) {
				if (
					this.returnHigherCard(
						score1.cards_to_score[i],
						score2.cards_to_score[i]
					) == score1.cards_to_score[i]
				) {
					return 1;
				}
				if (
					this.returnHigherCard(
						score1.cards_to_score[i],
						score2.cards_to_score[i]
					) == score2.cards_to_score[i]
				) {
					return 2;
				}
			}
			return 3;
		}
		if (score1.hand_description == 'flush') {
			return 1;
		}
		if (score2.hand_description == 'flush') {
			return 2;
		}

		if (
			score1.hand_description == 'straight' &&
			score2.hand_description == 'straight'
		) {
			for (let i = 0; i < score1.cards_to_score.length; i++) {
				if (
					this.returnHigherNumberCard(
						score1.cards_to_score[i],
						score2.cards_to_score[i]
					) == score1.cards_to_score[i]
				) {
					return 1;
				}
				if (
					this.returnHigherNumberCard(
						score1.cards_to_score[i],
						score2.cards_to_score[i]
					) == score2.cards_to_score[i]
				) {
					return 2;
				}
			}
			return 3;
		}
		if (score1.hand_description == 'straight') {
			return 1;
		}
		if (score2.hand_description == 'straight') {
			return 2;
		}

		if (
			score1.hand_description == 'three-of-a-kind' &&
			score2.hand_description == 'three-of-a-kind'
		) {
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[0],
					score2.cards_to_score[0]
				) == score1.cards_to_score[0]
			) {
				return 1;
			}
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[0],
					score2.cards_to_score[0]
				) == score2.cards_to_score[0]
			) {
				return 2;
			}
			for (let i = 3; i < 5; i++) {
				if (
					this.returnHigherNumberCard(
						score1.cards_to_score[i],
						score2.cards_to_score[i]
					) == score1.cards_to_score[i]
				) {
					return 1;
				}
				if (
					this.returnHigherNumberCard(
						score1.cards_to_score[i],
						score2.cards_to_score[i]
					) == score2.cards_to_score[i]
				) {
					return 2;
				}
			}
			return 3;
		}
		if (score1.hand_description == 'three-of-a-kind') {
			return 1;
		}
		if (score2.hand_description == 'three-of-a-kind') {
			return 2;
		}

		if (
			score1.hand_description == 'two pair' &&
			score2.hand_description == 'two pair'
		) {
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[0],
					score2.cards_to_score[0]
				) == score1.cards_to_score[0]
			) {
				return 1;
			}
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[0],
					score2.cards_to_score[0]
				) == score2.cards_to_score[0]
			) {
				return 2;
			}
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[2],
					score2.cards_to_score[2]
				) == score1.cards_to_score[2]
			) {
				return 1;
			}
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[2],
					score2.cards_to_score[2]
				) == score2.cards_to_score[2]
			) {
				return 2;
			}
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[4],
					score2.cards_to_score[4]
				) == score1.cards_to_score[4]
			) {
				return 1;
			}
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[4],
					score2.cards_to_score[4]
				) == score2.cards_to_score[4]
			) {
				return 2;
			}
			return 3;
		}

		if (score1.hand_description == 'two pair') {
			return 1;
		}
		if (score2.hand_description == 'two pair') {
			return 2;
		}

		if (
			score1.hand_description == 'pair' &&
			score2.hand_description == 'pair'
		) {
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[0],
					score2.cards_to_score[0]
				) == score1.cards_to_score[0]
			) {
				return 1;
			}
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[0],
					score2.cards_to_score[0]
				) == score2.cards_to_score[0]
			) {
				return 2;
			}
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[2],
					score2.cards_to_score[2]
				) == score1.cards_to_score[2]
			) {
				return 1;
			}
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[2],
					score2.cards_to_score[2]
				) == score2.cards_to_score[2]
			) {
				return 2;
			}
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[4],
					score2.cards_to_score[4]
				) == score1.cards_to_score[4]
			) {
				return 1;
			}
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[4],
					score2.cards_to_score[4]
				) == score2.cards_to_score[4]
			) {
				return 2;
			}
			return 3;
		}

		if (score1.hand_description == 'pair') {
			return 1;
		}
		if (score2.hand_description == 'pair') {
			return 2;
		}

		if (
			score1.hand_description == 'highest card' &&
			score2.hand_description == 'highest card'
		) {
			for (let i = 0; i < score1.cards_to_score.length; i++) {
				if (
					this.returnHigherNumberCard(
						score1.cards_to_score[i],
						score2.cards_to_score[i]
					) == score1.cards_to_score[i]
				) {
					return 1;
				}
				if (
					this.returnHigherNumberCard(
						score1.cards_to_score[i],
						score2.cards_to_score[i]
					) == score2.cards_to_score[i]
				) {
					return 2;
				}
			}
			return 3;
		}
		if (score1.hand_description == 'highest card') {
			return 1;
		}
		if (score2.hand_description == 'highest card') {
			return 2;
		}
	}

	scoreHand(hand) {
		let x = this.convertHand(hand);
		let suite = x.suite;
		let val = x.val;

		let idx = 0;
		let pairs = [];
		let three_of_a_kind = [];
		let four_of_a_kind = [];
		let straights = [];
		let full_house = [];

		//
		// identify pairs
		//
		idx = 1;
		while (idx < 14) {
			let x = this.isTwo(suite, val, idx);
			if (x == 0) {
				idx = 14;
			} else {
				pairs.push(x);
				idx = x + 1;
			}
		}
		pairs.sort((a, b) => a - b);

		//
		// identify triples
		//
		idx = 1;
		while (idx < 14) {
			let x = this.isThree(suite, val, idx);
			if (x == 0) {
				idx = 14;
			} else {
				three_of_a_kind.push(x);
				idx = x + 1;
			}
		}
		three_of_a_kind.sort((a, b) => a - b);

		//
		// identify quintuples
		//
		idx = 1;
		while (idx < 14) {
			let x = this.isFour(suite, val, idx);
			if (x == 0) {
				idx = 14;
			} else {
				four_of_a_kind.push(x);
				idx = x + 1;
			}
		}

		//
		// identify straights
		//
		idx = 1;
		while (idx < 10) {
			let x = this.isStraight(suite, val, idx);
			if (x == 0) {
				idx = 11;
			} else {
				straights.push(x);
				idx = x + 1;
			}
		}

		//
		// remove triples and pairs that are four-of-a-kind
		//
		for (let i = 0; i < four_of_a_kind.length; i++) {
			for (var z = 0; z < three_of_a_kind.length; z++) {
				if (three_of_a_kind[z] === four_of_a_kind[i]) {
					three_of_a_kind.splice(z, 1);
				}
			}

			for (var z = 0; z < pairs.length; z++) {
				if (pairs[z] === four_of_a_kind[i]) {
					pairs.splice(z, 1);
				}
			}
		}

		//
		// remove pairs that are also threes
		//
		for (let i = 0; i < three_of_a_kind.length; i++) {
			for (var z = 0; z < pairs.length; z++) {
				if (pairs[z] === three_of_a_kind[i]) {
					pairs.splice(z, 1);
				}
			}
		}

		//
		// now ready to identify highest hand
		//
		// royal flush
		// straight flush
		// four-of-a-kind    x
		// full-house
		// flush
		// straight      x
		// three-of-a-kind    x
		// two-pair
		// pair        x
		// high card
		//
		let cards_to_score = [];
		let hand_description = '';
		let highest_card = [];

		//
		// ROYAL FLUSH
		//
		if (straights.includes(10)) {
			if (this.isFlush(suite, val) != '') {
				let x = this.isFlush(suite, val);
				if (
					this.isCardSuite(suite, val, 1, x) == 1 &&
					this.isCardSuite(suite, val, 13, x) == 1 &&
					this.isCardSuite(suite, val, 12, x) == 1 &&
					this.isCardSuite(suite, val, 11, x) == 1 &&
					this.isCardSuite(suite, val, 10, x) == 1
				) {
					cards_to_score.push('1' + x);
					cards_to_score.push('13' + x);
					cards_to_score.push('12' + x);
					cards_to_score.push('11' + x);
					cards_to_score.push('10' + x);
					hand_description = 'royal flush';
					return {
						cards_to_score: this.sortByValue(cards_to_score),
						hand_description: hand_description
					};
				}
			}
		}

		//
		// STRAIGHT FLUSH
		//
		if (straights.length > 0) {
			if (this.isFlush(suite, val) != '') {
				let x = this.isFlush(suite, val);
				for (let i = straights.length - 1; i >= 0; i--) {
					if (
						this.isCardSuite(suite, val, straights[i] + 4, x) ==
							1 &&
						this.isCardSuite(suite, val, straights[i] + 3, x) ==
							1 &&
						this.isCardSuite(suite, val, straights[i] + 2, x) ==
							1 &&
						this.isCardSuite(suite, val, straights[i] + 1, x) ==
							1 &&
						this.isCardSuite(suite, val, straights[i], x) == 1
					) {
						cards_to_score.push(straights[i] + 4 + x);
						cards_to_score.push(straights[i] + 3 + x);
						cards_to_score.push(straights[i] + 2 + x);
						cards_to_score.push(straights[i] + 1 + x);
						cards_to_score.push(straights[i] + x);
						hand_description = 'straight flush';
						return {
							cards_to_score: this.sortByValue(cards_to_score),
							hand_description: hand_description
						};
					}
				}
			}
		}

		//
		// FOUR OF A KIND
		//
		if (four_of_a_kind.length > 0) {
			if (four_of_a_kind.includes(1)) {
				cards_to_score = ['C1', 'D1', 'H1', 'S1'];
				highest_card = this.returnHighestCard(
					suite,
					val,
					cards_to_score
				);
				cards_to_score.push(highest_card);
				hand_description = 'four-of-a-kind';
				return {
					cards_to_score: cards_to_score,
					hand_description: hand_description
				};
			}

			cards_to_score = [
				'C' + four_of_a_kind[four_of_a_kind.length - 1],
				'D' + four_of_a_kind[four_of_a_kind.length - 1],
				'H' + four_of_a_kind[four_of_a_kind.length - 1],
				'S' + four_of_a_kind[four_of_a_kind.length - 1]
			];
			highest_card = this.returnHighestCard(suite, val, cards_to_score);
			hand_description = 'four-of-a-kind';
			cards_to_score.push(highest_card);
			return {
				cards_to_score: cards_to_score,
				hand_description: hand_description
			};
		}

		//
		// FULL HOUSE
		//
		if (three_of_a_kind.length == 2) {
			if (three_of_a_kind[0] > three_of_a_kind[1]) {
				pairs.push(three_of_a_kind.pop());
			} else {
				pairs.push(three_of_a_kind.shift());
			}
		}
		if (three_of_a_kind.length > 0 && pairs.length > 0) {
			let highest_suite = 'C';

			for (let i = 0; i < val.length; i++) {
				if (val[i] == three_of_a_kind[three_of_a_kind.length - 1]) {
					if (this.isHigherSuite(suite[i], highest_suite)) {
						highest_suite = suite[i];
					}
					cards_to_score.push(suite[i] + val[i]);
				}
			}
			highest_card =
				highest_suite + three_of_a_kind[three_of_a_kind.length - 1];

			for (let i = 0; i < val.length; i++) {
				if (val[i] == pairs[pairs.length - 1]) {
					cards_to_score.push(suite[i] + val[i]);
				}
				if (cards_to_score.length > 5) {
					cards_to_score.pop();
				}
			}

			hand_description = 'full house';
			return {
				cards_to_score: cards_to_score,
				hand_description: hand_description,
				highest_card: highest_card
			};
		}

		//
		// FLUSH
		//
		if (this.isFlush(suite, val) != '') {
			let x = this.isFlush(suite, val);
			let y = [];
			let has_ace = false;

			for (let i = 0; i < val.length; i++) {
				if (suite[i] == x) {
					y.push(val[i]);
				}
			}

			// y now contains only in-suite vals
			y.sort((a, b) => a - b);
			// aces high, shift manually if needed
			if (y[0] === 1) {
				y.push(1);
				y.splice(0, 1);
			}
			y.splice(0, y.length - 5);
			for (let i = y.length - 1; i >= 0; i--) {
				cards_to_score.push(x + y[i]);
			}

			hand_description = 'flush';
			return {
				cards_to_score: this.sortByValue(cards_to_score),
				hand_description: hand_description
			};
		}

		//
		// STRAIGHT
		//
		if (this.isStraight(suite, val) > 0) {
			let x = this.isStraight(suite, val);

			hand_description = 'straight';

			//ace hight straight
			if (x == 10) {
				cards_to_score.push(this.returnHighestSuiteCard(suite, val, 1));
				cards_to_score.push(
					this.returnHighestSuiteCard(suite, val, 13)
				);
				cards_to_score.push(
					this.returnHighestSuiteCard(suite, val, 12)
				);
				cards_to_score.push(
					this.returnHighestSuiteCard(suite, val, 11)
				);
				cards_to_score.push(
					this.returnHighestSuiteCard(suite, val, 10)
				);

				return {
					cards_to_score: cards_to_score,
					hand_description: hand_description
				};
			}
			//ace low straight
			if (x == 1) {
				cards_to_score.push(this.returnHighestSuiteCard(suite, val, 5));
				cards_to_score.push(this.returnHighestSuiteCard(suite, val, 4));
				cards_to_score.push(this.returnHighestSuiteCard(suite, val, 3));
				cards_to_score.push(this.returnHighestSuiteCard(suite, val, 2));
				cards_to_score.push(this.returnHighestSuiteCard(suite, val, 1));

				return {
					cards_to_score: cards_to_score,
					hand_description: hand_description
				};
			}
			for (let i = 4; i >= 0; i--) {
				cards_to_score.push(
					this.returnHighestSuiteCard(suite, val, x + i)
				);
			}
			return {
				cards_to_score: this.sortByValue(cards_to_score),
				hand_description: hand_description
			};
		}

		//
		// THREE OF A KIND
		//
		if (three_of_a_kind.length > 0) {
			let x = three_of_a_kind[three_of_a_kind.length - 1];
			let y = [];

			let cards_remaining = val.length;
			for (let i = 0; i < cards_remaining; i++) {
				if (val[i] == x) {
					y.push(suite[i] + val[i]);
					val.splice(i, 1);
					suite.splice(i, 1);
					cards_remaining--;
					i--;
				}
			}

			for (let i = 0; i < y.length; i++) {
				cards_to_score.push(y[i]);
			}

			let remaining1 = this.returnHighestCard(suite, val);
			let remaining2 = this.returnHighestCard(suite, val, [remaining1]);
			let remaining_cards = this.sortByValue([remaining1, remaining2]);
			for (let i = 0; i < remaining_cards.length; i++) {
				cards_to_score.push(remaining_cards[i]);
			}

			hand_description = 'three-of-a-kind';
			return {
				cards_to_score: cards_to_score,
				hand_description: hand_description
			};
		}

		//
		// TWO PAIR
		//
		if (pairs.length > 1) {
			pairs.sort((a, b) => a - b);

			// deal with three pairs.
			if (pairs.length == 3) {
				if (pairs[0] == 1) {
					pairs.push(pairs.shift());
				}
				pairs.shift();
			}

			let m = pairs[pairs.length - 1];
			let n = pairs[pairs.length - 2];

			if (m > n) {
				highest_card = m;
			} else {
				highest_card = n;
			}
			if (n == 1) {
				highest_card = n;
			}

			let cards_remaining = val.length;
			for (let i = 0; i < cards_remaining; i++) {
				if (val[i] == highest_card) {
					cards_to_score.push(suite[i] + val[i]);
					val.splice(i, 1);
					suite.splice(i, 1);
					cards_remaining--;
					i--;
				}
			}
			cards_remaining = val.length;
			for (let i = 0; i < cards_remaining; i++) {
				if (val[i] == m || val[i] == n) {
					cards_to_score.push(suite[i] + val[i]);
					val.splice(i, 1);
					suite.splice(i, 1);
					cards_remaining--;
					i--;
				}
			}

			let remaining1 = this.returnHighestCard(suite, val, cards_to_score);
			cards_to_score.push(remaining1);
			hand_description = 'two pair';

			return {
				cards_to_score: cards_to_score,
				hand_description: hand_description
			};
		}

		//
		// A PAIR
		//
		if (pairs.length > 0) {
			let x = pairs[pairs.length - 1];
			let y = [];

			let cards_remaining = val.length;
			for (let i = 0; i < cards_remaining; i++) {
				if (val[i] == x) {
					y.push(suite[i] + val[i]);
					val.splice(i, 1);
					suite.splice(i, 1);
					cards_remaining--;
					i--;
				}
			}

			let remaining1 = this.returnHighestCard(suite, val);
			let remaining2 = this.returnHighestCard(suite, val, [remaining1]);
			let remaining3 = this.returnHighestCard(suite, val, [
				remaining1,
				remaining2
			]);

			let cards_remaining2 = this.sortByValue([
				remaining1,
				remaining2,
				remaining3
			]);
			//let cards_remaining2 = [remaining1, remaining2, remaining3];
			cards_to_score.push(y[0]);
			cards_to_score.push(y[1]);
			for (let i = 0; i < cards_remaining2.length; i++) {
				cards_to_score.push(cards_remaining2[i]);
			}
			hand_description = 'pair';
			return {
				cards_to_score: cards_to_score,
				hand_description: hand_description
			};
		}

		//
		// HIGHEST CARD
		//
		let remaining1 = this.returnHighestCard(suite, val);
		let remaining2 = this.returnHighestCard(suite, val, [remaining1]);
		let remaining3 = this.returnHighestCard(suite, val, [
			remaining1,
			remaining2
		]);
		let remaining4 = this.returnHighestCard(suite, val, [
			remaining1,
			remaining2,
			remaining3
		]);
		let remaining5 = this.returnHighestCard(suite, val, [
			remaining1,
			remaining2,
			remaining3,
			remaining4
		]);

		cards_to_score.push(remaining1);
		cards_to_score.push(remaining2);
		cards_to_score.push(remaining3);
		cards_to_score.push(remaining4);
		cards_to_score.push(remaining5);

		hand_description = 'highest card';
		highest_card = remaining1;
		return {
			cards_to_score: this.sortByValue(cards_to_score),
			hand_description: hand_description
		};
	}

	convertHand(hand) {
		let x = {};
		x.suite = [];
		x.val = [];

		for (let i = 0; i < hand.length; i++) {
			x.suite.push(hand[i][0]);
			x.val.push(parseInt(hand[i].substring(1)));
		}

		return x;
	}

	sortByValue(cards) {
		//let x = this.convertHand(cards);
		let y = [];
		let idx = 0;

		y.push(cards[0]);

		for (let i = 1; i < cards.length; i++) {
			idx = 0;
			for (let j = 0; j < y.length; j++) {
				if (this.returnHigherCard(cards[i], y[j]) == y[j]) {
					idx = j + 1;
				}
			}
			y.splice(idx, 0, cards[i]);
		}
		return y;
	}

	returnHigherCard(card1, card2) {
		let card1_suite = card1[0];
		let card1_val = parseInt(card1.substring(1));

		let card2_suite = card2[0];
		let card2_val = parseInt(card2.substring(1));

		if (card1_val == 1) {
			card1_val = 14;
		}
		if (card2_val == 1) {
			card2_val = 14;
		}

		if (card1_val > card2_val) {
			return card1;
		}
		if (card2_val > card1_val) {
			return card2;
		}
		if (card2_val == card1_val) {
			if (card1_suite == card2_suite) {
				return 0;
			}
			if (this.isHigherSuite(card1_suite, card2_suite)) {
				return card1;
			} else {
				return card2;
			}
		}
	}

	returnHigherNumberCard(card1, card2) {
		let card1_val = parseInt(card1.substring(1));
		let card2_val = parseInt(card2.substring(1));

		if (card1_val == 1) {
			card1_val = 14;
		}
		if (card2_val == 1) {
			card2_val = 14;
		}

		if (card1_val > card2_val) {
			return card1;
		}
		if (card2_val > card1_val) {
			return card2;
		}
		if (card2_val == card1_val) {
			return 0;
		}
	}

	isHigherSuite(currentv, newv) {
		if (currentv === 'S') {
			return 1;
		}
		if (newv == 'S') {
			return 0;
		}
		if (currentv === 'H') {
			return 1;
		}
		if (newv == 'H') {
			return 0;
		}
		if (currentv === 'D') {
			return 1;
		}
		if (newv == 'D') {
			return 0;
		}
		if (currentv === 'C') {
			return 1;
		}
		if (newv == 'C') {
			return 0;
		}
	}

	returnHighestSuiteCard(suite, val, x) {
		let suite_to_return = 'C';
		let card_to_return = '';

		for (let i = 0; i < val.length; i++) {
			if (val[i] == x) {
				if (card_to_return != '') {
					if (this.isHigherSuite(suite_to_return, suite[i])) {
						suite_to_return = suite[i];
						card_to_return = suite[i] + val[i];
					}
				} else {
					suite_to_return = suite[i];
					card_to_return = suite[i] + val[i];
				}
			}
		}
		return card_to_return;
	}

	returnHighestCard(suite, val, noval = [], less_than = 14) {
		let highest_card = 0;
		let highest_suite = 'C';
		let highest_idx = 0;

		for (let i = 0; i < val.length; i++) {
			if (noval.includes(suite[i] + val[i])) {
				//if the case id not in the exclude list
			} else {
				if (val[i] == 1) {
					//if the candidate is an ace
					if (highest_card == 14) {
						//and the encumbent is an ace
						if (this.isHigherSuite(suite[i], highest_suite)) {
							//if the candidate is a higher suite
							//the candidate wins
							highest_suite = suite[i];
						}
					} else {
						highest_card = 14; // and if there was no encumbent - the candidate is the winner.
						highest_suite = suite[i];
					}
				}

				if (val[i] == highest_card) {
					//if the candiates is as high as the encumbent
					if (this.isHigherSuite(suite[i], highest_suite)) {
						//if the candidate has a higher suite
						highest_suite = suite[i];
					}
				}

				if (val[i] > highest_card) {
					// if the candidate is just higher
					highest_card = val[i]; // the candidate wins
					highest_suite = suite[i]; // the candiate wins
				}
			}
		}
		if (highest_card == 14) {
			highest_card = 1;
		}
		return highest_suite + highest_card;
	}

	isFlush(suite, val) {
		let total_clubs = 0;
		let total_spades = 0;
		let total_hearts = 0;
		let total_diamonds = 0;

		for (let i = 0; i < suite.length; i++) {
			if (suite[i] == 'C') {
				total_clubs++;
			}
			if (suite[i] == 'D') {
				total_diamonds++;
			}
			if (suite[i] == 'H') {
				total_hearts++;
			}
			if (suite[i] == 'S') {
				total_spades++;
			}
		}

		if (total_clubs >= 5) {
			return 'C';
		}
		if (total_spades >= 5) {
			return 'S';
		}
		if (total_hearts >= 5) {
			return 'H';
		}
		if (total_diamonds >= 5) {
			return 'D';
		}

		return '';
	}

	isFour(suite, val, low = 1) {
		for (let i = low - 1; i < 13; i++) {
			let total = 0;
			for (let z = 0; z < val.length; z++) {
				if (val[z] == i + 1) {
					total++;
					if (total == 4) {
						return i + 1;
					}
				}
			}
		}

		return 0;
	}

	isThree(suite, val, low = 1) {
		for (let i = low - 1; i < 13; i++) {
			let total = 0;
			for (let z = 0; z < val.length; z++) {
				if (val[z] == i + 1) {
					total++;
					if (total == 3) {
						return i + 1;
					}
				}
			}
		}

		return 0;
	}

	isTwo(suite, val, low = 1) {
		for (let i = low - 1; i < 13; i++) {
			let total = 0;
			for (let z = 0; z < val.length; z++) {
				if (val[z] == i + 1) {
					total++;
					if (total == 2) {
						return i + 1;
					}
				}
			}
		}

		return 0;
	}

	isStraight(suite, val, low = 1) {
		let rv = 0;
		for (let i = low - 1; i < 10; i++) {
			//
			// catch royal straight
			//
			if (i == 9) {
				if (
					val.includes(13) &&
					val.includes(12) &&
					val.includes(11) &&
					val.includes(10) &&
					val.includes(1)
				) {
					rv = 10;
				}
			}

			if (
				val.includes(i + 1) &&
				val.includes(i + 2) &&
				val.includes(i + 3) &&
				val.includes(i + 4) &&
				val.includes(i + 5)
			) {
				rv = i + 1;
			}
		}

		return rv;
	}

	isCardSuite(suite, val, card, s) {
		for (let i = 0; i < val.length; i++) {
			if (val[i] == card) {
				if (suite[i] == s) {
					return 1;
				}
			}
		}
		return 0;
	}

	cardToHuman(card) {
		if (!this.game.deck[0].cards[card]) {
			return '';
		}
		let h = this.game.deck[0].cards[card].name;
		h = h.replace('.png', '');
		h = h.replace('13', 'K');
		h = h.replace('12', 'Q');
		h = h.replace('11', 'J');
		h = h.replace('1', 'A');
		h = h.replace('A0', '10'); //restore ten
		let suit = h[0];
		h = h.substring(1);
		switch (suit) {
		case 'H':
			return h + 'h';
			break;
		case 'D':
			return h + 'd';
			break;
		case 'S':
			return h + 's';
			break;
		case 'C':
			return h + 'c';
			break;
		}
		return h;
	}

	toHuman(hand) {
		var humanHand = ' <span class=\'htmlhand\'>';
		hand.forEach((h) => {
			h = h.replace(
				'H',
				'<span style=\'color:red\'><span class=\'suit\'>&hearts;</span>'
			);
			h = h.replace(
				'D',
				'<span style=\'color:red\'><span class=\'suit\'>&diams;</span>'
			);
			h = h.replace(
				'S',
				'<span style=\'color:black\'><span class=\'suit\'>&spades;</span>'
			);
			h = h.replace(
				'C',
				'<span style=\'color:black\'><span class=\'suit\'>&clubs;</span>'
			);
			h = h.replace('13', 'K');
			h = h.replace('12', 'Q');
			h = h.replace('11', 'J');
			h = h.replace('1', 'A');
			h = h.replace('A0', '10');
			h = '<span class=\'htmlCard\'>' + h + '</span></span>';
			humanHand += h;
		});
		humanHand += '</span> ';
		return humanHand;
	}

	returnGameRulesHTML() {
		return PokerGameRulesTemplate(this.app, this);
	}

	returnAdvancedOptions() {
		return PokerGameOptionsTemplate(this.app, this);
	}

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
		// if (stake){
		//   stake.onchange = updateChips;
		// }
		if (numChips) {
			numChips.onchange = updateChips;
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

				/*if (okey == "crypto"){
          output_me = 0;
          crypto = oval;
        }
        if (okey == "stake"){
          oval += crypto;
        }*/

				if (output_me == 1) {
					ngoa[okey] = oval;
				}
			}
		}

		return ngoa;
	}

	updateStatus(str, hide_info = 0) {
		if (str.indexOf('<') == -1) {
			str = `<div style="padding-top:2rem">${str}</div>`;
		}

		this.game.status = str;
		if (!this.browser_active) {
			return;
		}
		if (this.lock_interface == 1) {
			return;
		}

		//
		// insert status message into playerbox BODY unless the status
		// already exists, in which case we simplify update it instead
		// of updating the body again.
		//
		try {
			let status_obj = document.querySelector('.status');
			if (status_obj) {
				status_obj.innerHTML = str;
			} else {
				this.playerbox.updateBody(
					`<div class="status">${str}</div>`,
					this.game.player
				);
			}
		} catch (err) {
			console.log('ERR: ' + err);
		}
	}

	handToHTML(hand, pocket) {
		let html = '<div class=\'htmlCards pocket\'>';
		pocket.forEach((card) => {
			html += `<img class="card ${
				hand.includes(card) ? 'used' : 'not_used'
			}" src="${this.card_img_dir}/${card}.png">`;
		});
		html += '</div> ';

		html += '<div class=\'htmlCards pool\'>';
		this.game.pool[0].hand.forEach((card) => {
			card = this.game.pool[0].cards[card].name.replace('.png', '');
			html += `<img class="card ${
				hand.includes(card) ? 'used' : 'not_used'
			}" src="${this.card_img_dir}/${card}.png">`;
		});
		html += '</div> ';
		return html;
	}

	preloadImages() {
		let allImages = [
			'/poker/img/cards/C1.png',
			'/poker/img/cards/C2.png',
			'/poker/img/cards/C3.png',
			'/poker/img/cards/C4.png',
			'/poker/img/cards/C5.png',
			'/poker/img/cards/C6.png',
			'/poker/img/cards/C7.png',
			'/poker/img/cards/C8.png',
			'/poker/img/cards/C9.png',
			'/poker/img/cards/C10.png',
			'/poker/img/cards/C11.png',
			'/poker/img/cards/C12.png',
			'/poker/img/cards/C13.png',
			'/poker/img/cards/S1.png',
			'/poker/img/cards/S2.png',
			'/poker/img/cards/S3.png',
			'/poker/img/cards/S4.png',
			'/poker/img/cards/S5.png',
			'/poker/img/cards/S6.png',
			'/poker/img/cards/S7.png',
			'/poker/img/cards/S8.png',
			'/poker/img/cards/S9.png',
			'/poker/img/cards/S10.png',
			'/poker/img/cards/S11.png',
			'/poker/img/cards/S12.png',
			'/poker/img/cards/S13.png',
			'/poker/img/cards/D1.png',
			'/poker/img/cards/D2.png',
			'/poker/img/cards/D3.png',
			'/poker/img/cards/D4.png',
			'/poker/img/cards/D5.png',
			'/poker/img/cards/D6.png',
			'/poker/img/cards/D7.png',
			'/poker/img/cards/D8.png',
			'/poker/img/cards/D9.png',
			'/poker/img/cards/D10.png',
			'/poker/img/cards/D11.png',
			'/poker/img/cards/D12.png',
			'/poker/img/cards/D13.png',
			'/poker/img/cards/H1.png',
			'/poker/img/cards/H2.png',
			'/poker/img/cards/H3.png',
			'/poker/img/cards/H4.png',
			'/poker/img/cards/H5.png',
			'/poker/img/cards/H6.png',
			'/poker/img/cards/H7.png',
			'/poker/img/cards/H8.png',
			'/poker/img/cards/H9.png',
			'/poker/img/cards/H10.png',
			'/poker/img/cards/H11.png',
			'/poker/img/cards/H12.png',
			'/poker/img/cards/H13.png'
		];

		this.preloadImageArray(allImages, 0);
	}

	preloadImageArray(imageArray = [], idx = 0) {
		let pre_images = [imageArray.length];

		if (imageArray && imageArray.length > idx) {
			pre_images[idx] = new Image();
			pre_images[idx].onload = () => {
				this.preloadImageArray(imageArray, idx + 1);
			};
			pre_images[idx].src = imageArray[idx];
		}
	}


}

module.exports = Poker;
