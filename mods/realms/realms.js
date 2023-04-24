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

			if (mv[0] === "move") {
				let player_id = parseInt(mv[1]);
				let cardkey = mv[2];
				let source = mv[3];
				let destination = mv[4];
				let sending_player_also = 1;
				if (mv[5] == 0) {
					sending_player_also = 0;
				}

				if (sending_player_also == 0) {
					if (this.game.player != player_id) {
						this.moveCard(player_id, cardkey, source, destination);
					}
				} else {
					this.moveCard(player_id, cardkey, source, destination);
				}

				this.displayBoard();

				this.game.queue.splice(qe, 1);
			}

			/*if (mv[0] === "play") {

        let player_to_go = parseInt(mv[1]);

      	//
      	// update board
      	//
        this.displayBoard();
        this.playerTurn();

      	//
      	// do not remove until we resolve!
      	//
        //this.game.queue.splice(qe, 1);

        return 0;

      }*/
		}
		return 1;
	}

	returnState() {
		let state = {};

		state.players = [2];
		for (let i = 0; i < 2; i++) {
			state.players[i] = {};
			state.players[i].health = 20;
		}

		state.hands = [2];
		for (let i = 0; i < 2; i++) {
			state.hands[i] = {};
			state.hands[i].cards = {};
			state.hands[i].lands = [];
			state.hands[i].creatures = [];
			state.hands[i].enchantments = [];
			state.hands[i].graveyard = [];
			state.hands[i].exiled = [];
		}

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

		//
		// display board
		//
		this.displayBoard();
	}

	//
	// this moves a card from one location, such as a player's hand, to another, such as
	// the discard or remove pile, or a location on the table, such as affixing it to
	// another card.
	//
	moveCard(player, card, source, destination) {
		console.log(player + " -- " + card + " -- " + source + " -- " + destination);

		switch (source) {
			case "hand":
				for (let i = 0; i < this.game.deck[0].hand.length; i++) {
					if (this.game.deck[0].hand[i] == card) {
						this.game.deck[0].hand.splice(i, 1);
						break;
					}
				}
				break;

			case "lands":
				for (let i = 0; i < this.game.state.hands[player - 1].lands.length; i++) {
					if (this.game.state.hands[player - 1].lands[i] == card) {
						this.game.state.hands[player - 1].lands.splice(i, 1);
						break;
					}
				}
				break;

			case "creatures":
				for (let i = 0; i < this.game.state.hands[player - 1].creatures.length; i++) {
					if (this.game.state.hands[player - 1].creatures[i] == card) {
						this.game.state.hands[player - 1].creatures.splice(i, 1);
						break;
					}
				}
				break;

			case "sorcery":
			case "enchantments":
				for (let i = 0; i < this.game.state.hands[player - 1].enchantments.length; i++) {
					if (this.game.state.hands[player - 1].enchantments[i] == card) {
						this.game.state.hands[player - 1].enchantments.splice(i, 1);
						break;
					}
				}
				break;

			case "graveyard":
				for (let i = 0; i < this.game.state.hands[player - 1].graveyard.length; i++) {
					if (this.game.state.hands[player - 1].graveyard[i] == card) {
						this.game.state.hands[player - 1].graveyard.splice(i, 1);
						break;
					}
				}
				break;

			default:
		}

		console.log("pushing card onto " + destination);

		let already_exists = 0;
		switch (destination) {
			case "hand":
				already_exists = 0;
				for (let i = 0; i < this.game.deck[0].hand.length; i++) {
					if (this.game.deck[0].hand[i] == card) {
						already_exists = 1;
					}
				}
				if (already_exists == 0) {
					this.game.deck[0].hand.push(card);
				}
				break;

			case "lands":
				already_exists = 0;
				for (let i = 0; i < this.game.state.hands[player - 1].lands.length; i++) {
					if (this.game.state.hands[player - 1].lands[i] == card) {
						already_exists = 1;
					}
				}
				if (already_exists == 0) {
					this.game.state.hands[player - 1].lands.push(card);
				}
				break;

			case "creatures":
				already_exists = 0;
				for (let i = 0; i < this.game.state.hands[player - 1].creatures.length; i++) {
					if (this.game.state.hands[player - 1].creatures[i] == card) {
						already_exists = 1;
					}
				}
				if (already_exists == 0) {
					this.game.state.hands[player - 1].creatures.push(card);
				}
				break;

			case "sorcery":
			case "enchantments":
				already_exists = 0;
				for (let i = 0; i < this.game.state.hands[player - 1].enchantments.length; i++) {
					if (this.game.state.hands[player - 1].enchantments[i] == card) {
						already_exists = 1;
					}
				}
				if (already_exists == 0) {
					this.game.state.hands[player - 1].enchantments.push(card);
				}
				break;

			case "graveyard":
				already_exists = 0;
				for (let i = 0; i < this.game.state.hands[player - 1].graveyard.length; i++) {
					if (this.game.state.hands[player - 1].graveyard[i] == card) {
						already_exists = 1;
					}
				}
				if (already_exists == 0) {
					this.game.state.hands[player - 1].graveyard.push(card);
				}
				break;

			default:
		}
	}

	playerPlayCardFromHand(card) {
		let c = this.card_library[card];

		switch (c.type) {
			case "land":
				//
				// confirm player can place
				//
				if (this.game.state.has_placed_land == 1) {
					alert("You may only play one land per turn.");
					break;
				} else {
					this.game.state.has_placed_land = 1;
				}

				// move land from hand to board
				this.moveCard(this.game.player, c.key, "hand", "lands");
				this.addMove("move\t" + this.game.player + "\t" + c.key + "\thand\tlands\t0");
				this.endTurn();
				break;

			case "creature":
				// move creature from hand to board
				this.moveCard(this.game.player, c.key, "hand", "creatures");
				this.addMove("move\t" + this.game.player + "\t" + c.key + "\thand\tcreatures\t0");
				this.endTurn();
				break;

			case "sorcery":
			case "enchantment":
				// move enchantment from hand to board
				this.moveCard(this.game.player, c.key, "hand", "enchantments");
				this.addMove("move\t" + this.game.player + "\t" + c.key + "\thand\tenchantments\t0");
				this.endTurn();
				break;

			case "instant":
				// move instant from hand to board
				this.moveCard(this.game.player, c.key, "hand", "instant");
				this.addMove("move\t" + this.game.player + "\t" + c.key + "\thand\tinstants\t0");
				this.endTurn();
				break;

			default:
				console.log("unsupported card type: " + c.type);
		}
	}

	displayBoard() {
		let game_self = this;
	}


	buildSampleBoard(){

	}


	//
	// this controls the display of the card
	//
	cardToHTML(cardkey) {
		let card = this.card_library[cardkey];
		let tapped = "";
		let player = "";

		return `
      <div class="card showcard ${tapped}" id="p${player}-${cardkey}" data-id="${cardkey}">
        <img src="${card.img}" class="card-image" />
      </div>
    `;
	}
}

Realms.importFunctions(RealmsDeck);

module.exports = Realms;
