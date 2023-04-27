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

	initializeHTML(app) {
		super.initializeHTML(app);

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
			this.game.queue.push("PLAY\t2");
			this.game.queue.push("DEAL\t2\t2\t1");
			this.game.queue.push("PLAY\t1");
			this.game.queue.push("READY");


			//First player to go, doesn't get to draw an 8th card at the beginning of their turn
			this.game.queue.push("DEAL\t1\t1\t7");
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


	importCard(key, card) {
		let game_self = this;

		let c = {
			key,
			name: "Unnamed",
			color: "*",
			cost: [],
			power: 0,
			toughness: 0,
			text: "This card has not provided text",
			img: "/img/cards/sample.png",
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

		game_self.card_library[c.key] = c;
	}

	handleGameLoop() {
		///////////
		// QUEUE //
		///////////
		if (this.game.queue.length > 0) {
			let qe = this.game.queue.length - 1;
			let mv = this.game.queue[qe].split("\t");

			console.log("QUEUE: " + JSON.stringify(this.game.queue));

			//
			// we never clear the "round" so that when we hit it
			// we always bounce back higher on the queue by adding
			// turns for each player.
			//
			if (mv[0] == "round") {
				this.game.queue.push("PLAY\t2");
				this.game.queue.push("DEAL\t2\t2\t1");
				this.game.queue.push("PLAY\t1");
				this.game.queue.push("DEAL\t1\t1\t1");
			}

			if (mv[0] === "summon") {
				let player_id = parseInt(mv[1]);
				let cardkey = mv[2];

				if (this.game.player !== player_id){
					this.game.state.summoning_stack.push({player: player_id, card: this.card_library[cardkey]});
					this.addCard(cardkey, "#summoning_stack");					

					//To Do: add a step for opponent to Counter/Acknowledge summoned card
					//Shortcut to accept
					this.addMove("accept");
					this.endTurn();
				}

				this.game.queue.splice(qe, 1);
				return 0;
			}

			if (mv[0] === "accept") {
				this.game.queue.splice(qe, 1);

				for (let summoned_card of this.game.state.summoning_stack.length) {
					this.game.queue.push(`resolve_card\t${summoned_card.player}\t${summoned_card.card.key}`);
				}
				this.game.state.summoning_stack = [];

			}

			if (mv[0] === "resolve_card") {
				let player = parseInt(mv[1]);
				let card = this.card_library[mv[2]];

				//Insert code to do stuff based on the card definition

				//Move permanents onto board

				//Discard non-permanents


				this.game.queue.splice(qe, 1);
			}

		}
		return 1;
	}

	returnState() {
		let state = {};

		state.players = [2];
		for (let i = 0; i < 2; i++) {
			state.players[i] = {
				health: 20,
				mana: 0, 
				lands: [],
				creatures: [],
				artifacts: [],
				graveyard: [],
			};
		}

		state.summoning_stack = [];

		return state;
	}


	
	nonPlayerTurn() {
		if (this.browser_active == 0) {
			return;
		}

		this.updateStatusAndListCards(`Opponent Turn`, this.game.deck[this.game.player - 1].hand);
		this.attachCardboxEvents();

	}

	playerTurn() {
		if (this.browser_active == 0) {
			return;
		}

		//
		// show my hand
		//
		this.updateStatusAndListCards(
			`Your Turn <span id="end-turn" class="end-turn">[ or pass ]</span>`,
			this.game.deck[this.game.player - 1].hand
		);

		//
		// players may click on cards in their hand
		//
		this.attachCardboxEvents((card) => {
			this.playerPlayCardFromHand(card);
		});

		//
		// players may also end their turn
		//
		document.getElementById("end-turn").onclick = (e) => {
			this.updateStatusAndListCards(
				"Opponent Turn",
				this.game.deck[this.game.player - 1].hand,
				function () {}
			);
			this.prependMove("RESOLVE\t" + this.app.wallet.returnPublicKey());
			this.endTurn();
		};

	}


	insertCardSlot(uuid, destination) {
		this.app.browser.addElementToSelector(`<div id="a${uuid}" class="showcard card"></div>`, destination);
		return `#a${uuid}`;
	}

	moveCard(card_uuid, destination = "#me.realm-card-tray") {
		destination = this.insertCardSlot(card_uuid, destination);
		console.log(destination);
		let hudCard = document.getElementById(card_uuid);

		this.moveGameElement(this.copyGameElement(hudCard.firstChild), destination, {insert: 1, resize: 1},()=> { $(".animated_elem").remove();});
	}

	addCard(card_id, destination = "#summoning_stack") {
		console.log("Adding opponent's card!");
		this.insertCardSlot(card_id, destination);
		this.moveGameElement(this.createGameElement(`<img src="${this.card_library[card_id].img}" class="cardimg" />`, ".opponent_hand", ".status-cardbox .hud-card"), 
				"#summoning_stack > div:last-child", {resize: 1, insert: 1}, ()=> { $(".animated_elem").remove();});	
	}


	playerPlayCardFromHand(card_index) {
		let card = this.game.deck[this.game.player - 1].cards[card_index];

		let c = this.card_library[card];

		console.log(c);

		if (c.type == "land") {
			if (this.game.state.has_placed_land) {
				salert("You may only play one land per turn.");
				return;
			} else {
				this.game.state.has_placed_land = 1;
			}
		}

		//To do -- insert test for mana pool

		for (let i = 0; i < this.game.deck[this.game.player-1].hand.length; i++){
			if (this.game.deck[this.game.player-1].hand[i] == card_index){
				this.game.deck[this.game.player-1].hand.splice(i,1);
				this.game.state.summoning_stack.push({player: this.game.player, card: c});
			}
		}

		this.addMove(`summon\t${this.game.player}\t${card}`);
		this.moveCard(card_index, "#summoning_stack");
		this.endTurn();
	}

	displayBoard() {
		let game_self = this;

		$("#summoning_stack").html("");
		for (let summoned_card of this.game.state.summoning_stack){
			this.app.browser.addElementToSelector(this.cardToHTML(summoned_card.card.key, summoned_card.player), "#summoning_stack");
		}

	}


	buildSampleBoard(){

	}


	//
	// this controls the display of the card
	//
	cardToHTML(cardkey, player) {
		let card = this.card_library[cardkey];
		let tapped = "";

		return `
      <div class="card showcard ${tapped}" id="p${player}-${cardkey}" data-id="${cardkey}">
        <img src="${card.img}" class="cardimg" />
      </div>
    `;
	}
}

Realms.importFunctions(RealmsDeck);

module.exports = Realms;
