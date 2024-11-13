const GameTemplate = require('../../lib/templates/gametemplate');
const saito = require('../../lib/saito/saito');
const Board = require('./lib/ui/board');
const ManaOverlay = require('./lib/ui/overlays/mana');
const CombatOverlay = require('./lib/ui/overlays/combat');

//////////////////
// CONSTRUCTOR  //
//////////////////
class Realms extends GameTemplate {
	constructor(app) {
		super(app);

		this.app = app;
		this.name = 'Realms';
		this.slug = 'realms';
		this.description = 'Saito Realms is a card-driven magical battle game';
		this.categories = 'Games Cardgame Strategy Deckbuilding';
		this.card_img_dir = '/realms/img/cards';

		this.card_height_ratio = 1.39;

		this.interface = 1;

		this.minPlayers = 2;
		this.maxPlayers = 2;

		//
		// UI components
		//
		this.board = new Board(this.app, this, '.gameboard');
		this.mana_overlay = new ManaOverlay(this.app, this);
		this.combat_overlay = new CombatOverlay(this.app, this);

		return this;
	}

	async render(app) {
		if (!this.browser_active || this.initialize_game_run) {
			return;
		}

		await super.render(app);

		//
		// ADD MENU
		//
		this.menu.addMenuOption('game-game', 'Game');
		this.menu.addMenuOption('game-info', 'Info');
		this.menu.addChatMenu();
		this.menu.render(app, this);

		//
		// add card events -- text shown and callback run if there
		//
		this.cardbox.render(app, this);
		//this.cardbox.skip_card_prompt = 0;
		this.cardbox.addCardType('showcard', '', null);
		this.cardbox.addCardType('card', 'select', this.cardbox_callback);

		this.log.render(app, this);
		this.hud.render(app, this);

		this.board.render();
	}

	initializeGame(game_id) {
		//
		// initialize
		//
		if (this.game.status) {
			this.updateStatus(this.game.status);
		}

		//
		// import player cards
		//
		let deck1 = this.returnRedDeck();
		let deck2 = this.returnGreenDeck();

		//
		// initialize queue on new games
		//
		if (this.game.deck.length == 0) {
			this.game.state = this.returnState();

			this.game.queue.push('round');
			this.game.queue.push('READY');

			//
			// first play to go draws 6 to avoid pulling 8th first turn
			//
			this.game.queue.push('DEAL\t1\t1\t6');
			this.game.queue.push('DEAL\t2\t2\t7');

			//
			// encrypt and shuffle player-2 deck
			//
			this.game.queue.push('DECKENCRYPT\t2\t2');
			this.game.queue.push('DECKENCRYPT\t2\t1');
			this.game.queue.push('DECKXOR\t2\t2');
			this.game.queue.push('DECKXOR\t2\t1');

			// encrypt and shuffle player-1 deck
			this.game.queue.push('DECKENCRYPT\t1\t2');
			this.game.queue.push('DECKENCRYPT\t1\t1');
			this.game.queue.push('DECKXOR\t1\t2');
			this.game.queue.push('DECKXOR\t1\t1');

			// import our decks
			this.game.queue.push('DECK\t1\t' + JSON.stringify(deck1));
			this.game.queue.push('DECK\t2\t' + JSON.stringify(deck2));
		}

		//
		// add events to cards
		//
		this.deck = {};
		for (let key in deck1) {
			this.importCard(key, deck1[key]);
		}
		for (let key in deck2) {
			this.importCard(key, deck2[key]);
		}
	}

	handleGameLoop() {
		///////////
		// QUEUE //
		///////////
		if (this.game.queue.length > 0) {
			let qe = this.game.queue.length - 1;
			let mv = this.game.queue[qe].split('\t');

			console.log('QUEUE: ' + JSON.stringify(this.game.queue));

			//
			// we never clear the "round" so that when we hit it
			// we always bounce back higher on the queue by adding
			// more turns for each player.
			//
			if (mv[0] == 'round') {
				this.game.queue.push('play\t2');
				this.game.queue.push('DEAL\t2\t2\t1');
				this.game.queue.push('play\t1');
				this.game.queue.push('DEAL\t1\t1\t1');
			}

			//
			// this "deploys" cards into the battleground, such
			// as adding mana into play. the 4th argument allows us
			// to specify that a player should ignore the instruction
			// which is used when a player has made their move locally
			// and we have already updated their board and do not want
			// them to repeat that.
			//
			if (mv[0] == 'deploy') {
				this.game.queue.splice(qe, 1);

				let type = mv[1];
				let player = parseInt(mv[2]);
				let cardkey = mv[3];
				let card = this.deck[cardkey];
				let player_ignores = parseInt(mv[4]);

				if (this.game.player != player_ignores) {
					if (type == 'land') {
						this.deploy(player, cardkey);
					}

					if (type == 'creature') {
						this.deploy(player, cardkey);
					}

					if (type == 'artifact') {
						this.deploy(player, cardkey);
					}

					if (type == 'enchantment') {
						this.deploy(player, cardkey);
					}
				}

				this.board.render();

				return 1;
			}

			if (mv[0] === 'play') {
				// this is only removed through "resolve"

				let player = parseInt(mv[1]);
				if (this.game.player == player) {
					this.playerTurn();
				} else {
					this.updateStatusAndListCards(
						'Opponent Turn',
						this.game.deck[this.game.player - 1].hand
					);
				}

				return 0;
			}
		}
		return 1;
	}

	playerTurn() {
		let realms_self = this;

		if (this.browser_active == 0) {
			return;
		}

		console.log(
			'CARDS IS: ' +
				JSON.stringify(this.game.deck[this.game.player - 1].hand)
		);

		//
		// show my hand
		//
		this.updateStatusAndListCards(
			`play card(s) or click board to attack <span id="end-turn" class="end-turn">[ or pass ]</span>`,
			this.game.deck[this.game.player - 1].hand,
			function (cardname) {
				let card = realms_self.deck[cardname];

				if (card.type == 'land') {
					this.deploy(realms_self.game.player, cardname);
					this.addMove(
						`deploy\tland\t${realms_self.game.player}\t${cardname}\t${realms_self.game.player}`
					);
					this.endTurn();
				}
				if (card.type == 'creature') {
					this.deploy(realms_self.game.player, cardname);
					this.addMove(
						`deploy\tcreature\t${realms_self.game.player}\t${cardname}\t${realms_self.game.player}`
					);
					this.endTurn();
				}
				if (card.type == 'artifact') {
					this.deploy(realms_self.game.player, cardname);
					this.addMove(
						`deploy\tartifact\t${realms_self.game.player}\t${cardname}\t${realms_self.game.player}`
					);
					this.endTurn();
				}
				if (card.type == 'enchantment') {
					this.deploy(realms_self.game.player, cardname);
					this.addMove(
						`deploy\tenchantment\t${realms_self.game.player}\t${cardname}\t${realms_self.game.player}`
					);
					this.endTurn();
				}
			}
		);

		//
		// or end their turn
		//
		document.getElementById('end-turn').onclick = (e) => {
			this.prependMove('RESOLVE\t' + this.publicKey);
			this.endTurn();
		};
	}

	returnState() {
		let state = {};
		state.players_info = [2];
		for (let i = 0; i < 2; i++) {
			state.players_info[i] = {
				health: 20,
				mana: 0,
				cards: [],
				graveyard: []
			};
		}

		return state;
	}

	deploy(player, cardname) {
		let c = this.deck[cardname];

		let obj = {
			key: cardname,
			tapped: true,
			affixed: []
		};

		this.game.state.players_info[player - 1].cards.push(obj);

		alert('deployed card: ' + cardname);

		this.board.render();
	}

	importCard(key, card) {
		let game_self = this;

		let c = {
			key,
			name: 'Unnamed',
			color: '*',
			cost: [],
			power: 0,
			toughness: 0,
			text: 'This card has not provided text',
			img: '/img/cards/sample.png'
		};

		c = Object.assign(c, card);

		//
		// add dummy events that return 0 (do nothing)
		//
		if (!c.onInstant) {
			c.onInstant = function (game_self, player, card) {
				return 0;
			};
		}
		if (!c.onEnterBattlefield) {
			c.onEnterBattlefield = function (game_self, player, card) {
				return 0;
			};
		}
		if (!c.onCostAdjustment) {
			c.onCostAdjustment = function (game_self, player, card) {
				return 0;
			};
		}

		game_self.deck[c.key] = c;
	}

	returnCardImage(cardname) {
		if (this.deck[cardname]) {
			return this.deck[cardname].returnCardImage();
		}

		return '';
	}

	importCard(key, card) {
		let game_self = this;

		let c = {
			key: key,
			name: 'Unnamed',
			color: '*',
			cost: [],
			power: 0,
			toughness: 0,
			text: 'This card has not provided text',
			img: '/img/cards/sample.png'
		};
		c = Object.assign(c, card);

		//
		// add dummy events that return 0 (do nothing)
		//
		if (!c.returnCardImage) {
			c.returnCardImage = function () {
				return `<div class="card"><img class="card cardimg" src="/realms/img/cards/016_shellring_vindicator.png"></div>`;
			};
		}
		if (!c.oninstant) {
			c.oninstant = function (game_self, player, card) {
				return 0;
			};
		}
		if (!c.onEnterBattlefield) {
			c.onEnterBattlefield = function (game_self, player, card) {
				return 0;
			};
		}
		if (!c.onCostAdjustment) {
			c.onCostAdjustment = function (game_self, player, card) {
				return 0;
			};
		}

		game_self.deck[c.key] = c;
	}

	////////////////////////////////
	/// Cards and Card Functions ///
	////////////////////////////////
	returnCards() {
		var deck = {};

		return deck;
	}
}

module.exports = Realms;
