const GameTemplate = require("../../lib/templates/gametemplate");
const saito = require("../../lib/saito/saito");
const RealmsDeck = require("./lib/realms-deck");

//////////////////
// CONSTRUCTOR  //
//////////////////
class Realms extends GameTemplate {


	constructor(app) {
		super(app);

		this.app = app;
		this.name = "Realms";
		this.description = "Saito Realms is a card-driven magical battle game";
		this.categories 	 = "Games Cardgame Strategy Deckbuilding";
		this.card_img_dir = "/realms/img/cards";

		this.card_height_ratio = 1.39;

		// graphics
		this.interface = 1;

		this.minPlayers = 2;
		this.maxPlayers = 2;

		return this;
	}

	respondTo(type) {
		return super.respondTo(type);
	}

	render(app) {
		super.render(app);

		//
		// ADD MENU
		//
		this.menu.addMenuOption("game-game", "Game");
		this.menu.addMenuOption("game-info", "Info");

		this.menu.addChatMenu();

		this.menu.render(app, this);

		this.log.render(app, this);

		this.cardbox.render(app, this);

		//
		// add card events -- text shown and callback run if there
		//
		this.cardbox.skip_card_prompt = 0;
		this.cardbox.addCardType("showcard", "", null);
		this.cardbox.addCardType("card", "select", this.cardbox_callback);

		this.hud.render(app, this);


		this.buildSampleBoard();
	}

	initializeGame(game_id) {
		//
		// initialize some useful variables
		//
		if (this.game.status) {
			this.updateStatus(this.game.status);
		}

		//
		// import player cards
		//
		let deck1 = this.returnWhitishDeck();
		let deck2 = this.returnBluishDeck();

		//
		// initialize queue on new games
		//
		if (this.game.deck.length == 0) {
			this.game.state = this.returnState();

			this.game.queue.push("round");
			//this.game.queue.push("PLAY\t2");
			//this.game.queue.push("DEAL\t2\t2\t1");
			//this.game.queue.push("PLAY\t1");
			this.game.queue.push("READY");


			//First player to go, doesn't get to draw an 8th card at the beginning of their turn
			this.game.queue.push("DEAL\t1\t1\t6");
			this.game.queue.push("DEAL\t2\t2\t7");

			// encrypt and shuffle player-2 deck
			this.game.queue.push("DECKENCRYPT\t2\t2");
			this.game.queue.push("DECKENCRYPT\t2\t1");
			this.game.queue.push("DECKXOR\t2\t2");
			this.game.queue.push("DECKXOR\t2\t1");

			// encrypt and shuffle player-1 deck
			this.game.queue.push("DECKENCRYPT\t1\t2");
			this.game.queue.push("DECKENCRYPT\t1\t1");
			this.game.queue.push("DECKXOR\t1\t2");
			this.game.queue.push("DECKXOR\t1\t1");

			// import our decks
			this.game.queue.push("DECK\t1\t" + JSON.stringify(deck1));
			this.game.queue.push("DECK\t2\t" + JSON.stringify(deck2));
		}

		if (!this.game.board){
			this.game.board = {};
		}

		//
		// dynamic import
		//
		// all cards that may be in play are imported into this.game.cards. the import process
		// adds all necessary dummy functions and variables such that the game can check to see
		//
		// if cards implement special abilities, they must be individually programmed to do so
		// when provided.
		//
		let deck = this.returnCards();
		this.card_library = {};
		for (let key in deck) {
			this.importCard(key, deck[key]);
		}

		try {
			this.displayBoard();
			this.updateStatusAndListCards(
				"Initializing game",
				this.game.deck[this.game.player - 1].hand
			);
		} catch (err) {}
	}


