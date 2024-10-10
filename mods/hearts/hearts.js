const GameTemplate = require('../../lib/templates/gametemplate');
const saito = require('../../lib/saito/saito');

//////////////////
// CONSTRUCTOR  //
//////////////////
class Hearts extends GameTemplate {
	constructor(app) {
		super(app);

		this.name = 'Hearts';
		this.slug = 'hearts';
		this.description = 'A version of Hearts for the Saito Arcade';

		this.categories = 'Games Cardgame Classic';

		this.card_img_dir = '/hearts/img/cards';

		this.minPlayers = 4;
		this.maxPlayers = 4;
		this.app = app;

		return this;
	}

	// Opt out of letting League create a default
	respondTo(type) {
		if (type == 'default-league') {
			return null;
		}
		return super.respondTo(type);
	}

	//
	// every time the game boots
	//
	initializeGame(game_id) {
		if (!this.game.state) {
			this.game.state = this.returnState();

			this.game.queue = [];

			this.game.queue.push('newround');
			this.game.queue.push('READY');
			//this.game.queue.push("init");
		}
	}

	initializeQueue() {
		this.game.queue.push('startplay');
		for (let j = 0; j < 13; j++) {
			for (let i = this.game.players.length; i > 0; i--) {
				this.game.queue.push(`DEAL\t1\t${i}\t1`);
			}
		}
		for (let i = this.game.players.length; i > 0; i--)
			this.game.queue.push(`DECKENCRYPT\t1\t${i}`);

		for (let i = this.game.players.length; i > 0; i--)
			this.game.queue.push(`DECKXOR\t1\t${i}`);

		this.game.queue.push(
			'DECK\t1\t' + JSON.stringify(this.returnPokerDeck())
		);
	}

	//
	// initialize HTML (overwrites game template stuff, so include...)
	//
	async render(app) {
		if (!this.browser_active) {
			return;
		}

		await super.render(app);

		//
		// add ui components here
		//
		this.log.render(app, this);
		this.log.attachEvents(app, this);

		//
		// ADD MENU
		//
		this.menu.addMenuOption('game-game', 'Game');
		this.menu.addMenuOption('game-info', 'Info');

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
			text: 'Stats',
			id: 'game-stats',
			class: 'game-stats',
			callback: function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				game_mod.handleStatsMenu();
			}
		});

		this.menu.addChatMenu();
		this.menu.render();

		this.cardbox.render();

		//
		// we want hud to support cardbox, so re-render
		//
		this.hud.render();

		//
		// add card events -- for special hud treatment
		//
		// this means that if you click on an element tagged as class "card"
		// the cardbox will automatically handle the click events and the
		// card popup and menu options. set
		//
		//   this.cardbox.skip_card_prompt = 1;
		//
		// and you'll see what happens
		//
		this.cardbox.addCardType('card', 'select', this.cardbox_callback);

		//
		// this prevents desktop users going creay
		//
		//if (!app.browser.isMobileBrowser(navigator.userAgent)) {
		//   this.cardbox.skip_card_prompt = 1;
		//}

		try {
			if (app.browser.isMobileBrowser(navigator.userAgent)) {
				this.hammer.render();
			} else {
				this.sizer.render();
				this.sizer.attachEvents('.gameboard');
			}
		} catch (err) {}
	}

	//
	// main game queue
	//
	handleGameLoop() {
		///////////
		// QUEUE //
		///////////
		if (this.game.queue.length > 0) {
			let qe = this.game.queue.length - 1;
			let mv = this.game.queue[qe].split('\t');
			// TODO: make a cute little thing that as long as players are set up
			// we can restart the game without going thru arcade...
			// if (mv[0) === "NEWGAME") {
			//   this.game = this.newGame(game_id);
			//   this.initializeGame();
			// }
			if (mv[0] === 'newround') {
				console.log('new round...');
				this.game.queue.push('play\t2');
				this.game.queue.push('play\t1');
				this.game.queue.push(
					'ACKNOWLEDGE\tThis is the start of a new Round'
				);

				//
				// if we don't splice, we'll loop endlessly
				//
				//this.game.queue.splice(qe, 1);

				return 1;
			}

			if (mv[0] === 'play') {
				let player_to_go = parseInt(mv[1]);
				let hearts_self = this;

				if (this.game.player == player_to_go) {
					this.updateStatusAndListCards(
						'Select a Card',
						this.game.deck[0].hand,
						function (card) {
							alert(`You picked: ${card}`);

							this.addMove('resolve');
							this.addMove(
								`NOTIFY\tPlayer ${this.game.player} picked card ${this.game.deck[0].cards[card].name}`
							);
							this.endTurn();
						}
					);
				} else {
					this.updateStatus(
						`Player ${player_to_go} is taking their turn`
					);
				}

				//
				// STOP EXECUTION
				//
				return 0;
			}

			//
			// WE RELOAD AND HIT PLAYER X moving, and pause again, so if we want
			// to keep going deeper into the queue, PLAYER X should tell us to
			// remove their move.
			//
			if (mv[0] === 'resolve') {
				this.game.queue.splice(qe - 1, 2);
				return 1;
			}

			if (mv[0] === 'init') {
				console.log('sometimes we can handle init stuff in queue...');
				this.game.queue.splice(qe, 1);
				return 1;
			}
		}

		return 1;
	}

	returnCardImage(cardidx) {
		let c = null;

		for (let z = 0; c == undefined && z < this.game.deck.length; z++) {
			c = this.game.deck[z].cards[cardidx];
			if (c == undefined) {
				c = this.game.deck[z].discards[cardidx];
			}
			if (c == undefined) {
				c = this.game.deck[z].removed[cardidx];
			}
		}

		//
		// card not found
		//
		if (c == undefined) {
			return '<div class="noncard">' + cardidx + '</div>';
		}

		return `<img class="cardimg" id="${cardidx}" src="/${this.returnSlug()}/img/cards/${
			c.name
		}" />`;
	}

	returnState() {
		let state = {};

		return state;
	}
}

module.exports = Hearts;
