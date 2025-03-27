const GameTableTemplate = require('../../lib/templates/table-gametemplate');
const saito = require('../../lib/saito/saito');
const BlackjackGameRulesTemplate = require('./lib/blackjack-game-rules.template');
const htmlTemplate = require('./lib/game-html.template');

//////////////////
// CONSTRUCTOR  //
//////////////////
class Blackjack extends GameTableTemplate {
	constructor(app) {
		super(app);

		this.app = app;
		this.name = 'Blackjack';
		this.slug = 'blackjack';
		this.title = "Saito Blackjack";

		this.description = 'Classic casino game with home rules. Try to get closest to 21 without going over and beat the dealer to win your bet, but look out! You may be dealer next hand.';

		this.categories = 'Games Cardgame Casino';

		this.card_img_dir = '/saito/img/arcade/cards';

		this.minPlayers = 2;
		this.maxPlayers = 6;

		this.settlement = [];
		this.updateHTML = '';
		this.decimal_precision = 8;

		return this;
	}

	async initializeHTML(app) {
		if (!this.browser_active) {
			return;
		}
		if (this.initialize_game_run) {
			return;
		}

		await this.injectGameHTML(htmlTemplate());

		await super.initializeHTML(app);

		//
		// ADD MENU
		//
		this.menu.addMenuOption('game-game', 'Game');
		this.menu.addMenuOption('game-info', 'Info');

		this.menu.addSubMenuOption('game-info', {
			text: 'Help',
			id: 'game-intro',
			class: 'game-intro',
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

		/***
     this.menu.addSubMenuOption("game-info", {
      text : "Stats",
      id : "game-stats",
      class : "game-stats",
      callback : function(app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.handleStatsMenu();
      }
    });
     ****/

		this.menu.addChatMenu();
		this.menu.render();

		this.log.render();

		this.playerbox.render();
		this.playerbox.addClassAll('poker-seat-', true);
		this.playerbox.addGraphicClass('hand');
		this.playerbox.addGraphicClass('tinyhand');
		this.playerbox.addStatus(); //enable update Status to display in playerbox
		this.updateStatus(
			'Waiting for other players to sit down to start playing'
		);
	}

	/* Opt out of letting League create a default*/
	respondTo(type) {
		//if (type == "default-league") {
		//  return null;
		//}
		return super.respondTo(type);
	}

	//
	// if we switch into a staked game, we reset to a new round, while keeping all of the
	// other settings identical.
	//
	initializeGameStake(crypto, stake) {
		this.game.crypto = this.game.options.crypto = crypto;
		this.game.stake = this.game.options.stake = parseFloat(stake);

		for (let i = 0; i < this.game.state.player.length; i++) {
			this.game.state.player[i].credit = parseFloat(stake);
			this.game.state.player[i].wager = 0;
			this.game.state.player[i].payout = 1;
			this.game.state.player[i].hand = [];
			this.game.state.player[i].total = 0;
			this.game.state.player[i].winner = null;
			this.game.state.player[i].split = [];
		}

		console.log('PLAYER STATE: ' + JSON.stringify(this.game.state.player));

		this.game.state.round = 1;

		//
		// and redisplay board
		//
		this.displayBoard();
	}

	async initializeGame() {
		await super.initializeGame();

		//
		// initialize
		//
		if (this.game.options?.crypto) {
			this.game.crypto = this.game.options.crypto || '';
			this.game.stake = this.game.options.stake
				? parseFloat(this.game.options.stake)
				: 500;
		} else {
			this.game.stake = 500;
			this.game.crypto = '';
		}

		if (this.game.deck.length == 0) {
			this.game.state = this.returnInitialState(this.game.players.length);
			this.updateStatus('Generating the Game');
			//Neither of these show up
			//this.game.state.required_pot = this.game.state.big_blind;

			this.game.queue = [];
			this.game.queue.push('start');
			this.game.queue.push('READY');
		}

		let minbet = (this.game.stake / 100).toString();
		if (minbet.includes('.')) {
			this.decimal_precision = 8;
			//this.decimal_precision = minbet.split(".")[1].length;
		}
		//console.log("Num dec places needed:" + this.decimal_precision);
		if (this.browser_active) {
			this.displayBoard();
		}

		//If reloading, make sure we can refresh the queue operations
		this.halted = 0;
	}

	/*
   Initalize and return state object for tracking game specific data
   State Object contains some global properties and a single array of objects for the player-specific properties (rather than multiple arrays)
   */
	returnInitialState(num_of_players) {
		let state = {};

		state.round = 0;
		state.turn = 0;
		state.dealer = 0;
		state.player = Array(num_of_players);
		//state.player contains { name, credit | wager, payout, hand, total, winner}

		for (let i = 0; i < num_of_players; i++) {
			state.player[i] = {
				credit: this.game.stake,
				name: this.app.keychain.returnIdentifierByPublicKey(
					this.game.players[i],
					1
				),
				wager: 0,
				payout: 1,
				hand: [],
				total: 0,
				winner: null,
				split: []
			};
			if (state.player[i].name.indexOf('@') > 0) {
				state.player[i].name = state.player[i].name.substring(
					0,
					state.player[i].name.indexOf('@')
				);
			}
			if (state.player[i].name === this.game.players[i]) {
				state.player[i].name =
					this.game.players[i].substring(0, 10) + '...';
			}
		}

		return state;
	}

	removePlayerFromState(index) {
		this.game.state.player.splice(index, 1);
	}

	addPlayerToState(address) {
		let new_player = {
			credit: this.game.stake,
			name: this.app.keychain.returnIdentifierByPublicKey(address, 1),
			wager: 0,
			payout: 1,
			hand: [],
			total: 0,
			winner: null,
			split: []
		};

		if (new_player.name.indexOf('@') > 0) {
			new_player.name = new_player.name.substring(
				0,
				new_player.name.indexOf('@')
			);
		}
		if (new_player.name === address) {
			new_player.name = address.substring(0, 10) + '...';
		}
		this.game.state.player.push(new_player);
	}

	/*
    Resets state variable and pushing commands to queue
  */
	initializeQueue() {
		/*
      Reset each players starting position, Unlike Game Module, game.state arrays are 0-indexed
    */
		for (let i = 0; i < this.game.state.player.length; i++) {
			this.game.state.player[i].wager = 0;
			this.game.state.player[i].payout = 1; //Multiplier for Blackjack bonus
			this.game.state.player[i].hand = []; //Array for holding each players hand
			this.game.state.player[i].total = 0; //Score of the hand
			this.game.state.player[i].winner = null; //Is the player a winner this round
			this.game.state.player[i].split = []; //An array for holding extra hands
		}
		this.game.queue = [];
		this.updateHTML = '';
		this.game.queue.push('startplay');

		//Show one card face up before players start taking turns
		for (let i = this.game.players.length; i > 0; i--)
			this.game.queue.push(`showone\t${i}`); //Sets Data Structure so DisplayPlayer knows what cards to put in the DOM

		//Maybe should be in proper order, but it doesn't technically matter
		for (let i = this.game.players.length; i > 0; i--)
			this.game.queue.push(`DEAL\t1\t${i}\t1`);

		this.game.queue.push('logbets');
		let betters = this.nonDealerPlayers();
		this.resetConfirmsNeeded(betters);
		this.game.queue.push('takebets\t' + JSON.stringify(betters));

		for (let i = this.game.players.length; i > 0; i--)
			this.game.queue.push(`DEAL\t1\t${i}\t1`);

		for (let i = this.game.players.length; i > 0; i--)
			this.game.queue.push(`DECKENCRYPT\t1\t${i}`);

		for (let i = this.game.players.length; i > 0; i--)
			this.game.queue.push(`DECKXOR\t1\t${i}`);

		this.game.queue.push(
			'DECK\t1\t' + JSON.stringify(this.returnPokerDeck())
		);
	}

	/*
  Returns an array of the player numbers of everyone in the game except the dealer
  */
	nonDealerPlayers() {
		let players = [];
		for (let p = 1; p <= this.game.players.length; p++) {
			if (p != this.game.state.dealer) {
				players.push(p);
			}
		}
		return players;
	}

	settleLastRound() {
		/*
    We want these at the end of the queue so they get processed first, but if
    any players got removed, there will be some issues....
    */
		let msg = 'Clearing the table';
		this.game.queue.push('newround');
		//Have to do twice because want to add players before checking for end of game condition,
		//but if too many players want to join they may want to take the seat of an eliminated player
		this.game.queue.push('PLAYERS');
		this.game.queue.push('checkplayers');
		this.game.queue.push('PLAYERS');

		if (this.game.crypto) {
			msg += this.game.crypto ? ' and settling bets...' : '...';

			console.log('PROCESSING THE SETTLEMENT NOW!');
			console.log(JSON.stringify(this.settlement));
			for (let i = 0; i < this.settlement.length; i++) {
				this.game.queue.push(this.settlement[i]);
			}
		}
		console.log('new queue: ' + JSON.stringify(this.game.queue));

		this.updateStatus(msg);
		this.cardfan.hide();

		this.settlement = [];
	}

	/*
  Updates game stats  and calls initializeQueue
  */
	newRound() {
		//
		// advance and reset variables
		this.game.state.turn = 0;
		this.game.state.blackjack = 0;
		this.game.state.round++;
		//This is going to be a little problematic if removing people from the game
		this.game.state.dealer =
			(this.game.state.dealer % this.game.players.length) + 1;

		this.updateLog(
			`Round: ${this.game.state.round}, Dealer: P${
				this.game.state.dealer
			} (${this.game.state.player[this.game.state.dealer - 1].name})`
		);
		document.querySelectorAll('.plog').forEach((el) => {
			el.innerHTML = '';
		});
		this.initializeQueue();
		return 1;
	}

	async handleGameLoop() {
		///////////
		// QUEUE //
		///////////
		if (this.game.queue.length > 0) {
			//console.log(JSON.stringify(this.game.queue));
			let qe = this.game.queue.length - 1;
			let mv = this.game.queue[qe].split('\t');
			let shd_continue = 1;
			this.displayBoard();

			if (mv[0] === 'start' || mv[0] === 'newround') {
				//If we change the # of players, we want to stop the queue and refresh the game
				//Otherwise return 1, and run through the initialized queue commands
				return this.newRound();
			}

			if (mv[0] == 'checkplayers') {
				this.game.queue.splice(qe, 1);
				//How many players still have credit
				let removal = false;
				let solventPlayers = this.countActivePlayers();
				if (solventPlayers === 1) {
					//Clear winner
					this.game.queue.push(`winner\t${this.firstActivePlayer()}`);
					return 1;
				} else if (this.game.state.player.length > 2) {
					//if more than 2, remove extras
					for (
						let i = this.game.state.player.length - 1;
						i >= 0;
						i--
					) {
						if (this.game.state.player[i].credit <= 0) {
							removal = true;
							console.log(`*** Removing Player ${i + 1}`);
							this.removePlayer(this.game.players[i]); //Remove player in gamemodule
						}
					}
				}

				if (removal) {
					//Save game with fewer players
					this.saveGame(this.game.id);

					//Let's just try reloading the game
					setTimeout(() => {
						this.initialize_game_run = 0;
						this.initializeGameQueue(this.game.id);
					}, 1000);
					return 0;
				} else {
					return 1;
				}
			}

			//Player takes their turn
			if (mv[0] === 'play') {
				let player = parseInt(mv[1]);
				this.game.queue.splice(qe, 1);
				let status = null;
				$('.player-box.active').removeClass('active');
				this.playerbox.addClass('active', player);

				if (
					this.game.state.player[player - 1].wager == 0 &&
					player != this.game.state.dealer
				) {
					return 1;
				}

				//Blackjack
				if (
					this.game.state.player[player - 1].total === 21 &&
					this.game.state.player[player - 1].hand.length === 2
				) {
					this.game.queue.push(`blackjack\t${player}`);
					return 1;
				}
				//Bust
				if (this.game.state.player[player - 1].total < 0) {
					this.game.queue.push(`bust\t${player}`);
					return 1;
				}

				//Default turn behavior
				if (player == this.game.player) {
					this.playerTurn();
				} else {
					this.updateStatus(
						this.getLastNotice(true) +
							`<div>Waiting for ${
								player === this.game.state.dealer
									? 'the dealer'
									: `Player ${player}`
							} (${
								this.game.state.player[player - 1].name
							})</div>`
					);
				}
				return 0;
			}

			if (mv[0] === 'hit') {
				let player = parseInt(mv[1]);
				let playerName =
					player == this.game.state.dealer
						? 'Dealer'
						: `Player ${player}`;
				this.updateLog(
					`${playerName} hits on ${
						this.game.state.player[player - 1].total
					}`
				);
				this.game.queue.splice(qe, 1);
				this.game.queue.push('play\t' + player);
				this.game.queue.push('revealhand\t' + player); //force reveal whole hand
				this.game.queue.push('DEAL\t1\t' + player + '\t1');
				return 1;
			}

			if (mv[0] === 'double') {
				let player = parseInt(mv[1]);
				this.game.queue.splice(qe, 1);
				this.updateLog(`Player ${player} doubles down`);
				this.game.state.player[player - 1].wager =
					2 * this.game.state.player[player - 1].wager;
				this.game.queue.push('checkdouble\t' + player);
				this.game.queue.push('revealhand\t' + player);
				this.game.queue.push('DEAL\t1\t' + player + '\t1');
				return 1;
			}

			if (mv[0] === 'split') {
				let player = parseInt(mv[1]);
				//Store second card in reserve
				let card = this.game.state.player[player - 1].hand.splice(1);
				this.game.state.player[player - 1].split.push(card);
				this.updateLog(`Player ${player} splits their hand`);
				this.game.queue.splice(qe, 1);

				this.game.queue.push(
					`playsplit\t${player}\t${
						this.game.state.player[player - 1].wager
					}`
				); //switch to second card
				//Play first card as a hand
				this.game.queue.push('play\t' + player);
				this.game.queue.push('revealhand\t' + player);
				this.game.queue.push('DEAL\t1\t' + player + '\t1');
				return 1;
			}

			//TODO: double check that this works in all conditions both hands play through to the end, and one or the other busts out/gets dealt a blackjack
			if (mv[0] === 'playsplit') {
				let player = parseInt(mv[1]);
				this.game.state.player[player - 1].wager = parseFloat(mv[2]); //Restore original wager
				this.game.queue.splice(qe, 1);
				//Swap the hands
				let newHand = this.game.state.player[player - 1].split.pop();
				this.game.state.player[player - 1].split.unshift(
					this.game.state.player[player - 1].hand
				);
				this.game.state.player[player - 1].hand = newHand;
				//Play next card as a hand
				this.game.queue.push('play\t' + player);
				this.game.queue.push('revealhand\t' + player);
				this.game.queue.push('DEAL\t1\t' + player + '\t1');
				return 1;
			}

			if (mv[0] === 'checkdouble') {
				let player = parseInt(mv[1]);
				this.game.queue.splice(qe, 1);
				//Check for Bust
				if (this.game.state.player[player - 1].total < 0) {
					this.game.queue.push(`bust\t${player}`);
				} else {
					this.updateLog(
						`Player ${player} ends up with ${
							this.game.state.player[player - 1].total
						}`
					);
				}
				return 1;
			}

			if (mv[0] === 'setwager') {
				//Move data into shared public data structure
				this.game.queue.splice(qe, 1);
				let player = parseInt(mv[1]);
				let wager = parseFloat(mv[2]);
				this.game.state.player[player - 1].wager = wager;
				return 1;
			}
			//Player Blackjack
			if (mv[0] === 'blackjack') {
				this.game.queue.splice(qe, 1);
				let player = parseInt(mv[1]);
				//this.game.state.player[player-1].payout = 2; //Temporary Blackjack bonus
				//Pay out immediately
				let wager = this.game.state.player[player - 1].wager;
				this.game.state.player[player - 1].credit += wager * 2;
				this.game.state.player[this.game.state.dealer - 1].wager -=
					wager * 2;
				this.game.state.player[player - 1].wager = 0;
				if (player == this.game.player) {
					this.updateStatus(
						`<div class="persistent">Blackjack! You win double your bet (${wager}x2)</div>`
					);
				}

				this.updateHTML += `<div class="h3 justify"><span>${
					this.game.state.player[player - 1].name
				}: Blackjack!</span><span>Win:${wager * 2}</span></div>`;
				this.updateHTML += this.handToHTML(
					this.game.state.player[player - 1].hand
				);

				if (this.game.crypto) {
					let ts = new Date().getTime();
					this.rollDice();
					let uh = this.game.dice;
					this.game.queue.push(
						`SEND\t${
							this.game.players[this.game.state.dealer - 1]
						}\t${this.game.players[player - 1]}\t${(
							wager * 2
						).toFixed(this.decimal_precision)}\t${ts}\t${uh}\t${
							this.game.crypto
						}`
					);
				}

				this.updateLog(`Player ${player} has a blackjack!`);
				return 1;
			}

			if (mv[0] === 'stand') {
				this.game.queue.splice(qe, 1);
				let playerName =
					mv[1] == this.game.state.dealer
						? 'Dealer'
						: `Player ${mv[1]}`;
				this.updateLog(
					`${playerName} stands on ${
						this.game.state.player[mv[1] - 1].total
					}`
				);
				return 1;
			}

			if (mv[0] === 'bust') {
				this.game.queue.splice(qe, 1);
				let player = parseInt(mv[1]);

				if (player != this.game.state.dealer) {
					//Player, not dealer
					let wager = this.game.state.player[player - 1].wager;
					this.updateLog(
						`Player ${player} busts, loses ${wager} to dealer`
					);
					//Collect their chips immediately
					this.game.state.player[player - 1].credit -= wager;
					this.game.state.player[this.game.state.dealer - 1].wager +=
						wager;
					this.game.state.player[player - 1].wager = 0;
					if (player == this.game.player) {
						this.updateStatus(
							`<div class="persistent">You have gone bust. You lose your bet of ${wager}</div>`
						);
					}

					this.updateHTML += `<div class="h3 justify"><span>${
						this.game.state.player[player - 1].name
					}: Bust!</span><span>Loss:${wager}</span></div>`;
					this.updateHTML += this.handToHTML(
						this.game.state.player[player - 1].hand
					);

					if (this.game.crypto) {
						let ts = new Date().getTime();
						this.rollDice();
						let uh = this.game.dice;
						this.game.queue.push(
							`SEND\t${this.game.players[player - 1]}\t${
								this.game.players[this.game.state.dealer - 1]
							}\t${wager.toFixed(
								this.decimal_precision
							)}\t${ts}\t${uh}\t${this.game.crypto}`
						);
					}
				} else {
					this.updateLog(`Dealer busts`);
				}
				return 1;
			}

			if (mv[0] === 'logbets') {
				this.game.queue.splice(qe, 1);
				let logMsg = '';
				for (let i = 0; i < this.game.players.length; i++) {
					if (i + 1 !== this.game.state.dealer) {
						logMsg += `Player ${i + 1} bets ${
							this.game.state.player[i].wager
						}; `;
					}
				}
				logMsg = logMsg.substr(0, logMsg.length - 2);
				this.updateLog(logMsg);
				return 1;
			}

			if (mv[0] === 'takebets') {
				let betters = JSON.parse(mv[1]);
				let betsNeeded = 0;
				let doINeedToBet = false;
				let statusMsg = '';
				$('.player-box.active').removeClass('active');
				for (let i of betters) {
					if (this.game.confirms_needed[i - 1] == 1) {
						this.playerbox.addClass('active', i);
						statusMsg += `Player ${i}, `;
						betsNeeded++;
						if (this.game.player == parseInt(i)) {
							//If >2 players, this gets called repeatedly....
							this.addMove('RESOLVE\t' + this.publicKey);
							this.selectWager();
							doINeedToBet = true;
						}
					}
				}

				statusMsg = statusMsg.substring(0, statusMsg.length - 2); //cut the final ,
				if (betsNeeded >= 2) {
					let index = statusMsg.lastIndexOf(',');
					statusMsg =
						statusMsg.slice(0, index) +
						' and' +
						statusMsg.slice(index + 1);
				}

				if (!doINeedToBet) {
					this.updateStatus(
						`Waiting for ${statusMsg} to place their bets.`
					);
				}

				if (betsNeeded == 0) {
					this.game.queue.splice(qe, 1);
					return 1;
				}
				return 0;
			}

			//Check if Dealer has blackjack
			if (mv[0] === 'dealer') {
				this.game.queue.splice(qe, 1);
				//Am I the dealer
				if (this.game.state.dealer == this.game.player) {
					//check for dealer blackjack, this is private info
					let score = this.scoreArrayOfCards(this.myCards());
					if (score == 21) {
						this.addMove('announceblackjack');
					}
					this.endTurn();
				} else {
					this.updateStatus('Waiting for dealer');
				}
				return 0;
			}

			//Dealer Blackjack
			if (mv[0] === 'announceblackjack') {
				this.game.state.blackjack = 1;
				//Clear Game queue
				this.game.queue = [];
				//Go to winnings collection
				this.game.queue.push('pickwinner');
				//Show all hands
				for (let i = 1; i <= this.game.players.length; i++) {
					this.game.queue.push(`revealhand\t${i}`);
				}

				return 1;
			}

			if (mv[0] === 'startplay') {
				//Arrange the queue for players to take turns

				this.game.queue.splice(qe, 1);

				this.game.queue.push('pickwinner');
				let otherPlayers = [];

				//Dealer Goes Last
				this.game.queue.push('play\t' + this.game.state.dealer);
				this.game.queue.push(`revealhand\t${this.game.state.dealer}`);

				//Cycle Other Players (in order from dealer)
				for (let i = 0; i < this.game.players.length - 1; i++) {
					let otherPlayer =
						((this.game.state.dealer + i) %
							this.game.players.length) +
						1;
					this.game.queue.push('play\t' + otherPlayer);
					this.game.queue.push(`revealhand\t${otherPlayer}`);
				}
				this.game.queue.push(`dealer`);

				return 1;
			}

			//Share information of the first card in your hand
			if (mv[0] === 'showone') {
				let player = parseInt(mv[1]);
				this.game.queue.splice(qe, 1);
				if (player === this.game.player) {
					let card =
						this.game.deck[0].cards[this.game.deck[0].hand[0]].name; //Just One Card
					this.addMove(
						'flipcard\t' + this.game.player + '\t' + [card]
					);
					this.endTurn();
				}
				return 0;
			}

			//Announces the last (most recent) card in the player's hand
			if (mv[0] === 'revealhand') {
				this.game.queue.splice(qe, 1);
				if (this.game.player == parseInt(mv[1])) {
					//Only share if it is my turn
					let card =
						this.game.deck[0].hand[
							this.game.deck[0].hand.length - 1
						];
					this.addMove(
						'flipcard\t' +
							this.game.player +
							'\t' +
							this.game.deck[0].cards[card].name
					);
					this.endTurn();
				}
				return 0;
			}

			/*
      Given array of D1, S6, etc cards, every now knows the whole hand and its score
      */
			if (mv[0] === 'flipcard') {
				let player = parseInt(mv[1]);
				this.game.queue.splice(qe, 1);

				this.game.state.player[player - 1].hand.push(mv[2]);
				this.game.state.player[player - 1].total =
					this.scoreArrayOfCards(
						this.game.state.player[player - 1].hand
					);
				return 1;
			}

			if (mv[0] === 'pickwinner') {
				this.game.queue.splice(qe, 1);
				return this.pickWinner();
			}

			if (mv[0] === 'winner') {
				//copied from poker
				this.game.queue = [];
				this.game.crypto = null; //Clear crypto to prevent double dipping
				//Notably not keyed to game.player, but by the index
				if (this.game.player == parseInt(mv[1]) + 1) {
					this.sendGameOverTransaction(this.publicKey, 'elimination');
				}
				return 0;
			}

			//
			// avoid infinite loops
			//
			if (shd_continue == 0) {
				console.warn('NOT CONTINUING');
				return 0;
			}
		}
		return 1;
	}

	/*
    Test if any outstanding bets on the board
    Wagers are cleared (zeroed out) when players are eliminated
  */
	areThereAnyBets() {
		for (let i = 0; i < this.game.state.player.length; i++) {
			if (i + 1 != this.game.state.dealer) {
				if (
					this.game.state.player[i].wager >
					0 /*&& this.game.state.player[i].payout!=2*/
				)
					return true;
			}
		}

		return false;
	}

	countActivePlayers() {
		let playerCount = 0;
		for (let i = 0; i < this.game.state.player.length; i++)
			if (this.game.state.player[i].credit > 0) playerCount++;

		return playerCount;
	}

	firstActivePlayer() {
		for (let i = 0; i < this.game.state.player.length; i++)
			if (this.game.state.player[i].credit > 0) return i;

		return -1;
	}

	canSplit() {
		if (this.game.player == this.game.state.dealer) return false; //Must be a player
		let cards = this.game.state.player[this.game.player - 1].hand;
		if (cards.length != 2) return false; //Must have two cards (first move)
		let me = this.game.state.player[this.game.player - 1];
		if (me.credit < 2 * me.wager) return false; //Must have sufficient credit
		if (
			cards[0].length == 2 &&
			cards[1].length == 2 &&
			cards[0][1] == cards[1][1]
		)
			return true; //Cards must match Ace, 2, ... 9. Don't let players split 10s
		return false;
	}

	canDouble() {
		if (this.game.player == this.game.state.dealer) return false; //Must be a player
		let p = this.game.player - 1;
		if (this.game.state.player[p].split.length > 0) return false; //No double down on split (for now)
		if (
			this.game.state.player[p].credit >=
				2 * this.game.state.player[p].wager &&
			this.game.state.player[p].hand.length === 2
		)
			return true;
		else return false;
	}

	async selectWager() {
		let blackjack_self = this;

		//Should be tied to the stake, 1%, 5%, 10%, 20%

		let fractions = [0.01, 0.05, 0.1];
		let myCredit =
			this.game.state.player[blackjack_self.game.player - 1].credit;

		let html = `<div class="status-info">Select a wager: (credit: ${this.app.crypto.convertStringToDecimalPrecision(
			myCredit
		)})</div>`;
		html += '<ul>';
		for (let i = 0; i < fractions.length; i++) {
			if (fractions[i] * this.game.stake < myCredit)
				html += `<li class="menu_option" id="${
					fractions[i] * this.game.stake
				}">${fractions[i] * this.game.stake} ${this.game.crypto}</li>`;
		}
		//Add an all-in option when almost out of credit
		if (fractions.slice(-1) * this.game.stake > myCredit) {
			html += `<li class="menu_option" id="${myCredit}">All In!</li>`;
		}
		html += '</ul>';

		this.updateStatus(this.getLastNotice() + html, 1);
		this.lockInterface();
		try {
			$('.menu_option').off();
			$('.menu_option').on('click', async function () {
				$('.menu_option').off();
				blackjack_self.unlockInterface();
				let choice = $(this).attr('id');
				blackjack_self.addMove(
					'setwager\t' + blackjack_self.game.player + '\t' + choice
				);
				blackjack_self.endTurn();
			});
		} catch (err) {
			console.error('selectwager error', err);
		}
	}

	async playerTurn() {
		let blackjack_self = this;
		let html;

		if (
			!this.areThereAnyBets() &&
			this.game.player == this.game.state.dealer
		) {
			//Check if Dealer need to play -- blackjacks too!
			html = this.getLastNotice();
			html += `<div class="menu-player">There is no one left to play against</div>`;
			html += `<ul><li class="menu_option" id="stand">end round</li></ul>`;
		} else {
			//Let Player or Dealer make choice
			html = `<div class="menu-player">You have ${
				this.game.state.player[this.game.player - 1].total
			}, your move:</div><ul>`;
			html += `<li class="menu_option" id="stand" title="end your turn">stand</li>`;
			if (this.game.state.player[this.game.player - 1].total < 21) {
				html += `<li class="menu_option" id="hit" title="get another card">hit</li>`;
			}
			if (this.canDouble()) {
				html += `<li class="menu_option" id="double" title="double your bet for one card">double down</li>`;
			}
			if (this.canSplit()) {
				html += `<li class="menu_option" id="split" title="double your bet to split to two hands">split</li>`;
			}
			html += '</ul>';
		}

		this.updateStatus(html, 1);
		this.lockInterface();

		$('.menu_option').off();
		$('.menu_option').on('click', async function () {
			$('.menu_option').off();
			blackjack_self.unlockInterface();
			let choice = $(this).attr('id');

			if (choice === 'hit') {
				blackjack_self.addMove('hit\t' + blackjack_self.game.player);
				blackjack_self.endTurn();
				return 0;
			}

			if (choice === 'stand') {
				//blackjack_self.addMove("RESOLVE\t"+blackjack_self.publicKey);
				blackjack_self.addMove('stand\t' + blackjack_self.game.player);
				blackjack_self.endTurn();
				return 0;
			}

			if (choice === 'double') {
				blackjack_self.addMove('double\t' + blackjack_self.game.player);
				blackjack_self.endTurn();
				return 0;
			}

			if (choice === 'split') {
				blackjack_self.addMove('split\t' + blackjack_self.game.player);
				blackjack_self.endTurn();
				return 0;
			}
		});
	}

	displayBoard() {
		if (this.browser_active == 0) {
			return;
		}

		this.displayPlayers();
		this.displayHand();
	}

	/*
  Player should see their hand in position 1 of player_box, other players are even spaced around "poker table"
  */
	displayPlayers() {
		if (this.browser_active == 0) {
			return;
		}

		try {
			for (let i = 0; i < this.game.state.player.length; i++) {
				let newhtml = '';
				let player_hand_shown = 0;

				this.playerbox.refreshName(i + 1);

				if (
					this.game.state.player[i].wager > 0 &&
					this.game.state.dealer !== i + 1
				) {
					newhtml = `<div class="chips">${this.app.crypto.convertStringToDecimalPrecision(
						this.game.state.player[i].credit -
							this.game.state.player[i].wager
					)} ${
						this.game.crypto || 'SAITO'
					}, Bet: ${this.app.crypto.convertStringToDecimalPrecision(
						this.game.state.player[i].wager
					)}</div>`;
				} else {
					newhtml = `<div class="chips">${this.app.crypto.convertStringToDecimalPrecision(
						this.game.state.player[i].credit
					)} ${this.game.crypto || 'SAITO'}</div>`;
				}

				if (this.game.state.dealer == i + 1) {
					newhtml += `<div class="player-notice dealer">DEALER</div>`;
				} else {
					newhtml += `<div class="player-notice">Player ${
						i + 1
					}</div>`;
				}
				//
				this.playerbox.refreshInfo(newhtml, i + 1);
				newhtml = '';

				//Check for backup hands
				if (this.game.state.player[i].split.length > 0) {
					for (
						let z = 0;
						z < this.game.state.player[i].split.length;
						z++
					) {
						newhtml += `<div class="splithand">`;
						let ts = this.scoreArrayOfCards(
							this.game.state.player[i].split[z]
						);
						if (ts > 0) {
							newhtml += `<span>Score: ${ts}</span>`;
						} else {
							newhtml += `<span>Bust</span>`;
						}
						newhtml += this.handToHTML(
							this.game.state.player[i].split[z]
						);
						newhtml += '</div>';
					}
				}

				if (
					this.game.player !== i + 1 &&
					this.game.state.player[i].total !== 0
				) {
					this.playerbox.refreshLog(
						newhtml +
							`<div class="status-info">Hand Score: ${
								this.game.state.player[i].total > 0
									? this.game.state.player[i].total
									: 'Bust'
							}</div>`,
						i + 1
					);
				}

				//Make Image Content
				if (
					this.game.state.player[i].hand &&
					this.game.player !== i + 1
				) {
					newhtml = '';

					for (
						let y = this.game.state.player[i].hand.length;
						y < 2;
						y++
					) {
						newhtml += `<img class="card" src="${this.card_img_dir}/red_back.png">`;
					}
					for (let c of this.game.state.player[i].hand) {
						// show all visible cards
						newhtml += `<img class="card" src="${this.card_img_dir}/${c}.png">`;
					}

					this.playerbox.refreshGraphic(newhtml, i + 1);
				}
			}
		} catch (err) {
			console.error('Display Players err: ' + err);
		}
	}

	displayHand() {
		if (this.game.player == 0) {
			return;
		}
		try {
			let cardhtml = '';
			for (let c of this.myCards()) {
				cardhtml += `<img class="card" src="${this.card_img_dir}/${c}.png">`;
			}

			this.cardfan.render(cardhtml);

			//Add split hands
			if (this.game.state.player[this.game.player - 1].split.length > 0) {
				let newhtml = '';
				for (
					let z = 0;
					z <
					this.game.state.player[this.game.player - 1].split.length;
					z++
				) {
					let ts = this.scoreArrayOfCards(
						this.game.state.player[this.game.player - 1].split[z]
					);

					newhtml +=
						ts > 0
							? `<span>Score: ${ts}</span>`
							: `<span>Bust</span>`;

					newhtml += `<div class="splithand">`;
					newhtml += this.handToHTML(
						this.game.state.player[this.game.player - 1].split[z]
					);
					newhtml += '</div>';
				}
				this.playerbox.refreshGraphic(newhtml);
				$('#player-box-graphic-1').removeClass(
					'hidden-playerbox-element'
				);
			} else {
				$('#player-box-graphic-1').addClass('hidden-playerbox-element');
			}
		} catch (err) {
			console.error('Display Hand err: ' + err);
		}
	}

	/*
  Sends a message to restart the queue
  */
	async endTurn(nextTarget = 0) {
		if (this.browser_active) {
			$('.menu_option').off();
		}

		super.endTurn();
	}

	//Return -1 for bust
	scoreArrayOfCards(array_of_cards) {
		let total = 0;
		let aces = 0;
		for (let i = 0; i < array_of_cards.length; i++) {
			let card = array_of_cards[i];
			//card[0] is suit, Ace is stored as a 1
			if (card[1] === '1' && card.length == 2) {
				total += parseInt(1);
				aces++;
			} else {
				let card_total = parseInt(card.substring(1));
				/*if ((card_total+total) == 11 && aces == 1) {
          return 21;
        }*/
				if (card_total > 10) {
					card_total = 10;
				} //Jack - 11, Queen 12, King 13 --> 10
				total += parseInt(card_total);
			}
		}

		for (let z = 0; z < aces; z++) {
			if (total + 10 <= 21) {
				total += 10;
			}
		}

		if (total > 21) return -1;
		return total;
	}

	/*
    Decodes the indexed card numbers into the Suit+Value
    */
	myCards() {
		if (this.game.state.player[this.game.player - 1].split.length > 0) {
			return this.game.state.player[this.game.player - 1].hand;
		}
		let array_of_cards = [];

		for (let i of this.game.deck[0].hand) {
			array_of_cards.push(this.game.deck[0].cards[i].name);
		}
		return array_of_cards;
	}

	/*
    Evaluate the scores of all the players hands
    Then update credits

    When players bust, we resolve them immediately.
    Blackjacks are held to the end for convenience so we make sure dealer can't accidentally tie a blackjack
    If the dealer has a blackjack, this.game.state.blackjack = 1, all players lose no matter what!
    The dealer doesn't set a wager, so we use that as a clearing house to track the total credit exchange between players and the house
    */
	async pickWinner() {
		let dealerScore =
			this.game.state.player[this.game.state.dealer - 1].total;

		//Players win if they have a higher score than the dealer (blackjacks get paid right away)
		for (let i = 0; i < this.game.state.player.length; i++) {
			this.game.state.player[i].winner =
				this.game.state.player[i].total > dealerScore;
		}

		let winners = [];
		let losers = [];
		let debt = 0;
		let logMsg = '';
		let dealerHTML = '';
		let playerHTML = '';

		if (dealerScore < 0) {
			dealerHTML = '<h1>Dealer Busts!</h1>';
		}

		//If Dealer Blackjack
		if (this.game.state.blackjack == 1) {
			dealerHTML = '<h1>Dealer Blackjack!</h1>';

			logMsg = 'Dealer blackjack! ';
			for (let i = 0; i < this.game.state.player.length; i++) {
				if (i != this.game.state.dealer - 1) {
					//Not the Dealer
					//If the player also has a blackjack
					if (this.game.state.player[i].total === 21) {
						debt = this.game.state.player[i].wager;
					} else {
						debt = this.game.state.player[i].wager * 2;
					}
					//Don't collect more than a player has
					debt = Math.min(debt, this.game.state.player[i].credit);

					//Temporarily store all chips collected from players in the dealer's "wager"
					this.game.state.player[this.game.state.dealer - 1].wager +=
						debt;
					this.game.state.player[i].credit -= debt;
					this.game.state.player[i].wager = 0;
					playerHTML += `<div class="h3 justify"><span>${
						this.game.state.player[i].name
					}: ${
						this.game.state.player[i].total
					} loses to blackjack.</span><span>Loss: ${debt.toFixed(
						this.decimal_precision
					)}</span></div>`;
					playerHTML += this.handToHTML(
						this.game.state.player[i].hand
					);

					logMsg += `Player ${i + 1} loses ${debt.toFixed(
						this.decimal_precision
					)}, `;
					//Check for bankruptcy to personalize message
					if (this.game.state.player[i].credit <= 0) {
						logMsg += 'going bankrupt, ';
					}

					if (this.game.crypto) {
						let ts = new Date().getTime();
						this.rollDice();
						let uh = this.game.dice;
						this.settlement.push(
							`SEND\t${this.game.players[i]}\t${
								this.game.players[this.game.state.dealer - 1]
							}\t${debt.toFixed(
								this.decimal_precision
							)}\t${ts}\t${uh}\t${this.game.crypto}`
						);
					}

					losers.push(this.game.players[i]);
				}
			}
		} else {
			//Otherwise, normal processing, some players win, some lose
			//Update each player
			let sender, receiver;

			for (let i = 0; i < this.game.state.player.length; i++) {
				if (i != this.game.state.dealer - 1) {
					//Not the Dealer
					if (this.game.state.player[i].wager > 0) {
						//Player still has something to resolve
						debt = this.game.state.player[i].wager;
						if (this.game.state.player[i].winner) {
							winners.push(this.game.players[i]);
							this.game.state.player[
								this.game.state.dealer - 1
							].wager -= debt;
							this.game.state.player[i].credit += Math.min(
								debt,
								this.game.state.player[
									this.game.state.dealer - 1
								].credit
							);
							logMsg += `Player ${i + 1} wins ${debt.toFixed(
								this.decimal_precision
							)}, `;
							sender =
								this.game.players[this.game.state.dealer - 1];
							receiver = this.game.players[i];
						} else {
							losers.push(this.game.players[i]);
							debt = Math.min(
								debt,
								this.game.state.player[i].credit
							);
							this.game.state.player[
								this.game.state.dealer - 1
							].wager += debt;
							this.game.state.player[i].credit -= debt;

							logMsg += `Player ${i + 1} loses ${debt.toFixed(
								this.decimal_precision
							)}, `;
							if (this.game.state.player[i].credit <= 0) {
								logMsg += 'going bankrupt, ';
							}
							receiver =
								this.game.players[this.game.state.dealer - 1];
							sender = this.game.players[i];
						}
						playerHTML += `<div class="h3 justify"><span>${
							this.game.state.player[i].name
						}: ${this.game.state.player[i].total}.</span><span>${
							this.game.state.player[i].winner ? 'Win' : 'Loss'
						}: ${Math.abs(debt).toFixed(
							this.decimal_precision
						)}</span></div>`;
						playerHTML += this.handToHTML(
							this.game.state.player[i].hand
						);
						if (this.game.crypto) {
							let ts = new Date().getTime();
							this.rollDice();
							let uh = this.game.dice;
							this.settlement.push(
								`SEND\t${sender}\t${receiver}\t${debt.toFixed(
									this.decimal_precision
								)}\t${ts}\t${uh}\t${this.game.crypto}`
							);
						}
						this.game.state.player[i].wager = 0;
					} else {
						if (this.game.state.player[i].total == 21) {
							winners.push(this.game.players[i]);
						} else {
							losers.push(this.game.players[i]);
						}
					}
					//check and process secondary hands
					for (let z of this.game.state.player[i].split) {
						let ts = this.scoreArrayOfCards(z);
						if (ts > 0 && (z.length > 2 || ts < 21)) {
							//Busts & blackjacks get ignored
							playerHTML += `<div class="h3 justify"><span>${this.game.state.player[i].name}: ${ts}.</span>`;
							if (ts > dealerScore) {
								this.game.state.player[
									this.game.state.dealer - 1
								].wager -= debt;
								this.game.state.player[i].credit += debt;
								logMsg += `Player ${i + 1} wins ${debt.toFixed(
									this.decimal_precision
								)}, `;
								playerHTML += `<span>Win: ${debt.toFixed(
									this.decimal_precision
								)}</span></div>`;
								sender =
									this.game.players[
										this.game.state.dealer - 1
									];
								receiver = this.game.players[i];
							} else {
								debt = Math.min(
									debt,
									this.game.state.player[i].credit
								);
								this.game.state.player[
									this.game.state.dealer - 1
								].wager += debt;
								this.game.state.player[i].credit -= debt;
								logMsg += `Player ${i + 1} loses ${debt.toFixed(
									this.decimal_precision
								)}, `;
								if (this.game.state.player[i].credit <= 0) {
									logMsg += 'going bankrupt, ';
								}
								playerHTML += `<span>Loss: ${debt.toFixed(
									this.decimal_precision
								)}</span></div>`;
								receiver =
									this.game.players[
										this.game.state.dealer - 1
									];
								sender = this.game.players[i];
							}
							playerHTML += this.handToHTML(z);

							if (this.game.crypto) {
								let ts = new Date().getTime();
								this.rollDice();
								let uh = this.game.dice;
								this.settlement.push(
									`SEND\t${sender}\t${receiver}\t${debt.toFixed(
										this.decimal_precision
									)}\t${ts}\t${uh}\t${this.game.crypto}`
								);
							}
						}
					}
				}
			}
		}
		playerHTML += this.updateHTML; //Add other players who already resolved their turn

		logMsg = logMsg.substring(0, logMsg.length - 2); //remove comma

		//Update Dealer
		let dealerEarnings =
			this.game.state.player[this.game.state.dealer - 1].wager;
		this.game.state.player[this.game.state.dealer - 1].credit +=
			dealerEarnings;

		let dealerLog = '';
		if (dealerEarnings > 0) {
			dealerLog = `Dealer wins ${dealerEarnings.toFixed(
				this.decimal_precision
			)} for the round.`;
		} else if (dealerEarnings < 0) {
			dealerLog = `Dealer pays out ${Math.abs(dealerEarnings).toFixed(
				this.decimal_precision
			)} for the round.`;
		} else {
			dealerLog = `Dealer has no change in credits.`;
		}
		logMsg += `${logMsg ? '. ' : ''}${dealerLog}`;
		dealerHTML += `<div class="h2">${dealerLog}</div>`;
		dealerHTML += `<div class="h3">${
			this.game.state.player[this.game.state.dealer - 1].name
		} (Dealer): ${dealerScore > 0 ? dealerScore : 'Bust'}</div>`;
		dealerHTML += this.handToHTML(
			this.game.state.player[this.game.state.dealer - 1].hand
		);
		//Bankruptcy Check
		if (this.game.state.player[this.game.state.dealer - 1].credit <= 0) {
			logMsg += ' Dealer is bankrupted!';
		}

		//Consolidated log message
		this.updateLog(logMsg);
		this.settleLastRound();

		if (winners.length > 0) {
			this.game.queue.push(
				`ROUNDOVER\t${JSON.stringify(winners)}\t${JSON.stringify([
					this.game.players[this.game.state.dealer - 1]
				])}`
			);
		}
		if (losers.length > 0) {
			this.game.queue.push(
				`ROUNDOVER\t${JSON.stringify([
					this.game.players[this.game.state.dealer - 1]
				])}\t${JSON.stringify(losers)}`
			);
		}

		if (this.settlement.length > 0) {
			this.overlay.show(
				`<div class="shim-notice">${dealerHTML}${playerHTML}</div>`,
				() => {
					this.restartQueue();
				}
			);
			this.halted = 1;
			return 0;
		} else {
			this.overlay.show(
				`<div class="shim-notice">${dealerHTML}${playerHTML}</div>`
			);
		}
		return 1;
	}

	returnGameRulesHTML() {
		return BlackjackGameRulesTemplate(this.app, this);
	}

	returnGameOptionsHTML() {
		let options_html = `<h1 class="overlay-title">Blackjack Options</h1>`;

		return options_html;
	}

	attachAdvancedOptionsEventListeners() {
		let crypto = document.getElementById('crypto');
		let stakeInput = document.getElementById('stake_input');

		if (crypto) {
			crypto.onchange = () => {
				if (crypto.value == '') {
					stakeInput.style.display = 'none';
				} else {
					stakeInput.style.display = 'block';
				}
			};
		}
	}

	payWinners(winner) {
		return 0;
	}

	async receiveStopGameTransaction(resigning_player, txmsg) {
		await super.receiveStopGameTransaction(resigning_player, txmsg);

		if (!txmsg.loser) {
			return;
		}

		let player = parseInt(txmsg.loser);

		if (player != this.game.state.dealer) {
			//Player, not dealer
			let wager = this.game.state.player[player - 1].wager;
			if (wager > 0) {
				this.game.state.player[this.game.state.dealer - 1].wager +=
					wager;
				this.game.state.player[player - 1].wager = 0;
				this.game.state.player[player - 1].credit = 0;
			}

			this.updateHTML += `<div class="h3 justify"><span>${
				this.game.state.player[player - 1].name
			}: Quit the game!</span><span>Loss:${wager}</span></div>`;
			this.updateHTML += this.handToHTML(
				this.game.state.player[player - 1].hand
			);

			if (this.game.crypto) {
				let ts = new Date().getTime();
				this.rollDice();
				let uh = this.game.dice;
				this.game.queue.push(
					`SEND\t${this.game.players[player - 1]}\t${
						this.game.players[this.game.state.dealer - 1]
					}\t${wager.toFixed(
						this.decimal_precision
					)}\t${ts}\t${uh}\t${this.game.crypto}`
				);
			}
		}
	}

	/*
    This function may be less than ideal, abusing the concept of status,
    since it is mostly being used to update the DOM for user interface
  */
	updateStatus(str, hide_info = 0) {
		try {
			if (hide_info == 0) {
				this.playerbox.showInfo();
			} else {
				this.playerbox.hideInfo();
			}

			if (this.lock_interface == 1) {
				return;
			}

			this.game.status = str;

			if (this.browser_active == 1) {
				let status_obj = document.querySelector('.status');
				if (this.game.players.includes(this.publicKey)) {
					status_obj.innerHTML = str;
				}
			}
		} catch (err) {
			console.error('ERR: ' + err);
		}
	}

	getLastNotice(preserveLonger = false) {
		if (document.querySelector('.status .persistent')) {
			let nodes = document.querySelectorAll('.status .persistent');
			return `<div class="${
				preserveLonger ? 'persistent' : 'status-info'
			}">${nodes[nodes.length - 1].innerHTML}</div>`;
		}

		return '';
	}
}

module.exports = Blackjack;
