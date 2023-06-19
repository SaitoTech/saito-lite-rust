const GameTemplate = require("../../lib/templates/gametemplate");
const saito = require("../../lib/saito/saito");
<<<<<<< HEAD
=======
const RealmsDeck = require("./lib/realms-deck");
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0

//////////////////
// CONSTRUCTOR  //
//////////////////
class Realms extends GameTemplate {
<<<<<<< HEAD
  constructor(app) {
    super(app);

    this.app = app;
    this.gamename = "Realms";
    this.appname = "Realms";
    this.name = "Realms";
    this.description = "Saito Realms is a card-driven enchantment battle game";
    this.categories = "Games Arcade Entertainment";
    this.type = "Cardgame";
    this.card_img_dir = "/realm/img/cards";

    // graphics
    this.interface = 1;

    this.minPlayers = 2;
    this.maxPlayers = 2;

    return this;
  }

  //
  // manually announce arcade banner support
  //
  async respondTo(type) {
    if (super.respondTo(type) != null) {
      return super.respondTo(type);
    }

    // barge haulers on the volga
    if (type == "arcade-carousel") {
      return {
        background: "/realm/img/arcade/arcade-banner-background.png",
        title: "Realms",
      };
    }

    if (type == "arcade-create-game") {
      return {
        slug: this.slug,
        title: this.name,
        description: this.description,
        publisher_message: this.publisher_message,
        returnGameOptionsHTML: this.returnGameOptionsHTML.bind(this),
        minPlayers: this.minPlayers,
        maxPlayers: this.maxPlayers,
      };
    }
    return null;
  }

  async initializeHTML(app) {
    await super.initializeHTML(app);

    //
    // ADD MENU
    //
    this.menu.addMenuOption("game-game", "Game");
    this.menu.addSubMenuOption("game-game", {
      text: "Log",
      id: "game-log",
      class: "game-log",
      callback: function (app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.log.toggleLog();
      },
    });
    this.menu.addSubMenuOption("game-game", {
      text: "Exit",
      id: "game-exit",
      class: "game-exit",
      callback: function (app, game_mod) {
        window.location.href = "/arcade";
      },
    });
    this.menu.addMenuIcon({
      text: '<i class="fa fa-window-maximize" aria-hidden="true"></i>',
      id: "game-menu-fullscreen",
      callback: function (app, game_mod) {
        game_mod.menu.hideSubMenus();
        app.browser.requestFullscreen();
      },
    });

    this.menu.addChatMenu();

    this.menu.render(app, this);
    this.menu.attachEvents(app, this);

    this.log.render(app, this);
    this.log.attachEvents(app, this);

    this.cardbox.render(app, this);
    this.cardbox.attachEvents(app, this);

    //
    // add card events -- text shown and callback run if there
    //
    this.cardbox.addCardType("showcard", "", null);
    this.cardbox.addCardType("card", "select", this.cardbox_callback);

    this.hud.render(app, this);
    this.hud.attachEvents(app, this);
  }

  initializeGame(game_id) {
    //
    // initialize some useful variables
    //
    if (this.game.status != "") {
      this.updateStatus(this.game.status);
    }
    if (this.game.dice == "") {
      this.initializeDice();
    }

    //
    // import player cards
    //
    let deck1 = this.returnWhiteDeck();
    let deck2 = this.returnBlueDeck();

    //
    // initialize queue on new games
    //
    if (this.game.deck.length == 0) {
      this.game.state = this.returnState(this.game.players.length);

      this.game.queue.push("round");
      this.game.queue.push("PLAY\t2");
      this.game.queue.push("PLAY\t1");
      this.game.queue.push("READY");

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

    //
    // dynamic import
    //
    // all cards that may be in play are imported into this.game.cards. the import process
    // adds all necessary dummy functions and variables such that the game can check to see
    //
    // if cards implement special abilities, they must be individually programmed to do so
    // when provided.
    //
    this.game.cards = {};
    for (let key in deck1) {
      this.importCard(key, deck1[key], 1);
    }
    for (let key in deck2) {
      this.importCard(key, deck2[key], 2);
    }

    try {
      this.displayBoard();
      this.updateStatusAndListCards(
        "Waiting for Opponent Move",
        this.game.deck[this.game.player - 1].hand
      );
    } catch (err) {}
  }

  ////////////////////////////////
  /// Cards and Card Functions ///
  ////////////////////////////////
  returnBlueDeck() {
    var deck = {};

    deck["b001"] = {
      name: "b001",
      type: "creature",
      color: "blue",
      cost: ["*", "*", "*", "blue", "blue"],
      power: 4,
      toughness: 3,
      properties: ["flying"],
      img: "/realm/img/cards/sample.png",
    };
    deck["b002"] = {
      name: "b002",
      type: "creature",
      color: "blue",
      cost: ["*", "*", "blue"],
      power: 2,
      toughness: 1,
      properties: ["flying"],
      img: "/realm/img/cards/sample.png",
      onEnterBattlefield: function (game_self, player, card) {
        game_self.updateLog("UNIMPLEMENTED: when creature enters battlefield, draw card.");
        return 1;
      },
    };
    deck["b003"] = {
      name: "b003",
      type: "creature",
      color: "blue",
      cost: ["*", "*", "*", "blue"],
      power: 3,
      toughness: 2,
      properties: ["flying"],
      img: "/realm/img/cards/sample.png",
      onAttack: function (game_self, player, card) {
        game_self.updateLog(
          "UNIMPLEMENTED: gains flying when attacking creatures without flying until end of turn."
        );
        return 1;
      },
    };
    deck["b004"] = {
      name: "b004",
      type: "instant",
      color: "blue",
      cost: ["*", "*", "blue"],
      img: "/realm/img/cards/sample.png",
      onInstant: function (game_self, player, card) {
        game_self.updateLog(
          "UNIMPLEMENTED: targetted creature gets -4/-0 until end of turn. Player may draw a card."
        );
        return 1;
      },
    };
    deck["b005"] = {
      name: "b005",
      type: "sorcery",
      color: "blue",
      cost: ["*", "*", "blue"],
      img: "/realm/img/cards/sample.png",
      onCostAdjustment: function (game_self, player, card) {
        game_self.updateLog(
          "UNIMPLEMENTED: card costs 1 less to cast if player controlls creature with flying."
        );
        return 1;
      },
      onInstant: function (game_self, player, card) {
        game_self.updateLog("UNIMPLEMENTED: draw two cards");
        return 1;
      },
    };
    deck["island1"] = {
      name: "Isle",
      type: "land",
      color: "blue",
      img: "/realm/img/cards/sample.png",
    };
    deck["island2"] = {
      name: "Isle",
      type: "land",
      color: "blue",
      img: "/realm/img/cards/sample.png",
    };
    deck["island3"] = {
      name: "Isle",
      type: "land",
      color: "blue",
      img: "/realm/img/cards/sample.png",
    };
    deck["island4"] = {
      name: "Isle",
      type: "land",
      color: "blue",
      img: "/realm/img/cards/sample.png",
    };
    deck["island5"] = {
      name: "Isle",
      type: "land",
      color: "blue",
      img: "/realm/img/cards/sample.png",
    };
    deck["island6"] = {
      name: "Isle",
      type: "land",
      color: "blue",
      img: "/realm/img/cards/sample.png",
    };
    deck["island7"] = {
      name: "Isle",
      type: "land",
      color: "blue",
      img: "/realm/img/cards/sample.png",
    };
    deck["island8"] = {
      name: "Isle",
      type: "land",
      color: "blue",
      img: "/realm/img/cards/sample.png",
    };
    deck["island9"] = {
      name: "Isle",
      type: "land",
      color: "blue",
      img: "/realm/img/cards/sample.png",
    };
    deck["island10"] = {
      name: "Isle",
      type: "land",
      color: "blue",
      img: "/realm/img/cards/sample.png",
    };
    deck["island11"] = {
      name: "Isle",
      type: "land",
      color: "blue",
      img: "/realm/img/cards/sample.png",
    };
    deck["island12"] = {
      name: "Isle",
      type: "land",
      color: "blue",
      img: "/realm/img/cards/sample.png",
    };
    deck["island13"] = {
      name: "Isle",
      type: "land",
      color: "blue",
      img: "/realm/img/cards/sample.png",
    };

    return deck;
  }

  returnWhiteDeck() {
    var deck = {};

    deck["w001"] = {
      name: "w001",
      type: "creature",
      color: "white",
      cost: ["*", "white"],
      power: 1,
      toughness: 3,
      properties: ["flying"],
      img: "/realm/img/cards/sample.png",
    };
    deck["w002"] = {
      name: "w002",
      type: "creature",
      color: "white",
      cost: ["*", "*", "*", "*", "white"],
      power: 3,
      toughness: 2,
      properties: ["flying"],
      img: "/realm/img/cards/sample.png",
      onEnterBattlefield: function (game_self, player, card) {
        game_self.updateLog("When Dawning Angel enters battlefield, gain 4 life.");
        game_self.game.status.player[player - 1].health += 4;
        return 1;
      },
    };
    deck["w003"] = {
      name: "w002",
      type: "creature",
      color: "white",
      cost: ["*", "*", "white"],
      power: 3,
      toughness: 2,
      properties: [],
      img: "/realm/img/cards/sample.png",
      onEnterBattlefield: function (game_self, player, card) {
        game_self.updateLog(
          "UNIMPLEMENTED: when Haazda Officer enters battlefield, target creature gains +1/+1 until end of turn"
        );
        return 1;
      },
    };
    deck["w004"] = {
      name: "w004",
      type: "creature",
      color: "white",
      cost: ["*", "*", "white"],
      power: 2,
      toughness: 2,
      properties: ["flying"],
      img: "/realm/img/cards/sample.png",
      onAttack: function (game_self, player, card) {
        game_self.updateLog(
          "UNIMPLEMENTED: when attacks, target attacking creature without flying gains flying until end of turn"
        );
        return 1;
      },
    };
    deck["inspired-charge"] = {
      name: "Inspired Charge",
      type: "instant",
      color: "white",
      cost: ["*", "*", "white"],
      img: "/realm/img/cards/sample.png",
      onInstant: function (game_self, player, card) {
        game_self.updateLog("UNIMPLEMENTED: all controlled creatures gain +2/+1 until end of turn");
        return 1;
      },
    };
    deck["plains1"] = {
      name: "Grasslands",
      type: "land",
      color: "white",
      img: "/realm/img/cards/sample.png",
    };
    deck["plains2"] = {
      name: "Grasslands",
      type: "land",
      color: "white",
      img: "/realm/img/cards/sample.png",
    };
    deck["plains3"] = {
      name: "Grasslands",
      type: "land",
      color: "white",
      img: "/realm/img/cards/sample.png",
    };
    deck["plains4"] = {
      name: "Grasslands",
      type: "land",
      color: "white",
      img: "/realm/img/cards/sample.png",
    };
    deck["plains5"] = {
      name: "Grasslands",
      type: "land",
      color: "white",
      img: "/realm/img/cards/sample.png",
    };
    deck["plains6"] = {
      name: "Grasslands",
      type: "land",
      color: "white",
      img: "/realm/img/cards/sample.png",
    };
    deck["plains7"] = {
      name: "Grasslands",
      type: "land",
      color: "white",
      img: "/realm/img/cards/sample.png",
    };
    deck["plains8"] = {
      name: "Grasslands",
      type: "land",
      color: "white",
      img: "/realm/img/cards/white/plains.jpg",
    };
    deck["plains9"] = {
      name: "Grasslands",
      type: "land",
      color: "white",
      img: "/realm/img/cards/sample.png",
    };
    deck["plains10"] = {
      name: "Grasslands",
      type: "land",
      color: "white",
      img: "/realm/img/cards/sample.png",
    };
    deck["plains11"] = {
      name: "Grasslands",
      type: "land",
      color: "white",
      img: "/realm/img/cards/sample.png",
    };
    deck["plains12"] = {
      name: "Grasslands",
      type: "land",
      color: "white",
      img: "/realm/img/cards/sample.png",
    };
    deck["plains13"] = {
      name: "Grasslands",
      color: "white",
      type: "land",
      img: "/realm/img/cards/sample.png",
    };

    return deck;
  }

  importCard(key, card, player) {
    let game_self = this;

    let c = {};
    c.key = key;
    c.player = player;
    c.name = "Unnamed";
    c.color = "*";
    c.cost = [];
    c.power = 0;
    c.toughness = 0;
    c.text = "This card has not provided text";
    c.img = "/img/cards/sample.png";
    c.tapped = "";

    if (card.name) {
      c.name = card.name;
    }
    if (card.color) {
      c.color = card.color;
    }
    if (card.cost) {
      c.cost = card.cost;
    }
    if (card.text) {
      c.text = card.text;
    }
    if (card.type) {
      c.type = card.type;
    }
    if (card.power) {
      c.power = card.power;
    }
    if (card.toughness) {
      c.toughness = card.toughness;
    }
    if (card.img) {
      c.img = card.img;
    }

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
    c.returnElement = function (card) {
      return game_self.returnElement(game_self, player, c.key);
    };

    game_self.game.cards[c.key] = c;
  }

  handleGameLoop() {
    ///////////
    // QUEUE //
    ///////////
    if (this.game.queue.length > 0) {
      let qe = this.game.queue.length - 1;
      let mv = this.game.queue[qe].split("\t");
      let shd_continue = 1;

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

      if (mv[0] === "play") {
        let player_to_go = parseInt(mv[1]);

        //
        // update board
        //
        this.displayBoard();

        //
        // do not remove until we resolve!
        //
        //this.game.queue.splice(qe, 1);

        return 0;
      }

      //
      // avoid infinite loops
      //
      if (shd_continue == 0) {
        console.log("NOT CONTINUING");
        return 0;
      }
    }
    return 1;
  }

  returnState(num_of_players) {
    let state = {};
=======
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
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0

		this.hud.render(app, this);


<<<<<<< HEAD
    return state;
  }

  returnEventObjects() {
    let z = [];
=======
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
					let id = this.insertCardSlot(player_id, "#summoning_stack");
					this.game.state.summoning_stack.push({player: player_id, key: cardkey, card: this.card_library[cardkey], uuid: id});
					this.addCard(cardkey, id);					

					//To Do: add a step for opponent to Counter/Acknowledge summoned card
					//Shortcut to accept
					this.addMove("accept");
					setTimeout(()=> {this.endTurn();}, 2000);
					
				}

				this.game.queue.splice(qe, 1);
				return 0;
			}

			if (mv[0] === "accept") {
				this.game.queue.splice(qe, 1);

				for (let summoned_card of this.game.state.summoning_stack) {
					this.game.queue.push(`resolve_card\t${summoned_card.player}\t${summoned_card.key}`);
				}

			}

			if (mv[0] === "resolve_card") {
				let player = parseInt(mv[1]);
				let card_key = mv[2];

				//Insert code to do stuff based on the card definition

				this.game.queue.splice(qe, 1);

				let card = this.game.state.summoning_stack.pop();
				if (card.key !== card_key) {
					console.log("Desyncronized stacks! " + card_key);
					console.log(JSON.parse(JSON.stringify(card)));
				}

				//lands: [], 				creatures: [], 				artifacts: [],				graveyard: [],

				
				if (["land", "creature", "artifact"].includes(card.type)) {
					//Move permanents onto board
					if (card.type == "creature"){
						card.tapped = true;
					}

					this.game.state.players[player - 1][card.type].push(card);
					
				} //else {
					//Discard non-permanents
					this.game.state.players[player - 1]["graveyard"].push(card);
					this.moveCard(card.uuid, ".graveyard");
				//}

				
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
				land: [],
				creature: [],
				artifact: [],
				graveyard: [],
			};
		}
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0

		state.summoning_stack = [];

<<<<<<< HEAD
    //
    // playable cards in my hand
    //

    return z;
  }

  addEvents(obj) {
    ///////////////////////
    // game state events //
    ///////////////////////
    //
    // 1 = fall through, 0 = halt game
    //
    if (obj.canEvent == null) {
      obj.canEvent = function (his_self, faction) {
        return 0;
      }; // 0 means cannot event
    }
    if (obj.onEvent == null) {
      obj.onEvent = function (his_self, player) {
        return 1;
      };
    }
    if (obj.handleGameLoop == null) {
      obj.handleGameLoop = function (his_self, qe, mv) {
        return 1;
      };
    }

    //
    // functions for convenience
    //
    //if (obj.menuOptionTriggers == null) {
    //  obj.menuOptionTriggers = function(his_self, stage, player, faction) { return 0; }
    //}
    //if (obj.menuOption == null) {
    //  obj.menuOption = function(his_self, stage, player, faction) { return 0; }
    //}
    //if (obj.menuOptionActivated == null) {
    //  obj.menuOptionActivated = function(his_self, stage, player, faction) { return 0; }
    //}

    return obj;
  }

  nonPlayerTurn() {
    this.updateStatusAndListCards(
      `Opponent Turn`,
      this.game.deck[this.game.player - 1].hand,
      function () {}
    );
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
      this.game.deck[this.game.player - 1].hand,
      function () {}
    );
=======
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


	insertCardSlot(player, destination) {
		let base_id = `p${player}-card-`;

		let max = 0;
		let existing_cards = document.getElementsByClassName("cardslot");
		for (let div of existing_cards){
			if (div.id.includes(base_id)){
				let temp = parseInt(div.id.replace(base_id, ""));
				if (temp > max) {
					max = temp;
				}
			}
		}
		max++;

		base_id += max;

		this.app.browser.addElementToSelector(`<div class="cardslot" id="${base_id}"></div>`, destination);
		
		return base_id;
	}

	moveCard(source_id, destination) {
		
		console.log("Card at: ", source_id);
		console.log("Move card to: ", destination);


		this.moveGameElement(this.copyGameElement(`#${source_id} img`), 
													destination, 
													{insert: 1, resize: 1},
													()=> { 
														$(".animated_elem").remove(); 
														$("#"+source_id).remove(); 
														if (destination === ".graveyard") {
															$(".graveyard").children().fadeOut();
														}
													}
													);
	
	}

	addCard(card_id, destination) {
		console.log("Adding opponent's card to:", destination);

		let destObj = document.getElementById(destination) || document.querySelector(destination);

		this.moveGameElement(this.createGameElement(`<img src="${this.card_library[card_id].img}" id="${card_id}" class="cardimg" />`, ".opponent_hand", ".status-cardbox .hud-card"), 
				destObj, {resize: 1, insert: 1}, ()=> { $(".animated_elem").remove();});	

		//"#summoning_stack > div:last-child"
	}

>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0

	playerPlayCardFromHand(card_index) {
		let card = this.game.deck[this.game.player - 1].cards[card_index];

<<<<<<< HEAD
    //
    // players may also end their turn
    //
    document.getElementById("end-turn").onclick = (e) => {
      this.updateStatusAndListCards(
        "Opponent Turn",
        this.game.deck[this.game.player - 1].hand,
        function () {}
      );
      this.prependMove("RESOLVE\t" + this.app.wallet.getPublicKey());
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
=======
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


		let ui_id = this.insertCardSlot(this.game.player, "#summoning_stack");
		for (let i = 0; i < this.game.deck[this.game.player-1].hand.length; i++){
			if (this.game.deck[this.game.player-1].hand[i] == card_index){
				this.game.deck[this.game.player-1].hand.splice(i,1);
				this.game.state.summoning_stack.push({player: this.game.player, key: card, card: c, uuid: ui_id});
			}
		}

		this.addMove(`summon\t${this.game.player}\t${card}`);

		this.moveCard(card_index, ui_id);
		this.endTurn();
	}

	displayBoard() {
		let game_self = this;

		$("#summoning_stack").html("");
		for (let summoned_card of this.game.state.summoning_stack){
			this.app.browser.addElementToSelector(this.cardToHTML(summoned_card.key, summoned_card.uuid), "#summoning_stack");
		}

	}
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0


<<<<<<< HEAD
  playerPlayCardFromHand(card) {
    let c = this.game.cards[card];

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
        console.log("unsupported card type");
    }
  }

  displayBoard() {
    let game_self = this;
    /****
     document.getElementById("p1-lands").innerHTML = "";
     document.getElementById("p1-creatures").innerHTML = "";
     document.getElementById("p1-enchantments").innerHTML = "";

     // Player 2
     document.getElementById("p2-lands").innerHTML = "";
     document.getElementById("p2-creatures").innerHTML = "";
     document.getElementById("p2-enchantments").innerHTML = "";

     for (let i = 1; i <= 2; i++) {
      for (let z = 0; z < this.game.state.hands[i-1].lands.length; z++) {
        this.app.browser.addElementToDom(this.game.cards[this.game.state.hands[i-1].lands[z]].returnElement(game_self, i), `p${i}-lands`);
      }
      for (let z = 0; z < this.game.state.hands[i-1].creatures.length; z++) {
        this.app.browser.addElementToDom(this.game.cards[this.game.state.hands[i-1].creatures[z]].returnElement(game_self, i), `p${i}-creatures`);
      }
      for (let z = 0; z < this.game.state.hands[i-1].enchantments.length; z++) {
        this.app.browser.addElementToDom(this.game.cards[this.game.state.hands[i-1].enchantments[z]].returnElement(game_self, i), `p${i}-enchantments`);
      }
    }
     ****/
  }

  //
  // this controls the display of the card
  //
  returnElement(game_self, player, cardkey) {
    let card = game_self.game.cards[cardkey];
    let tapped = "";
    if (card.tapped == 1) {
      tapped = " tapped";
    }

    return `
      <div class="card ${tapped}" id="p${player}-${cardkey}">
        <img src="${card.img}" class="card-image" />
      </div>
    `;
  }
}

=======
	buildSampleBoard(){

	}


	//
	// this controls the display of the card
	//
	cardToHTML(cardkey, uuid, tapped = false) {
		let card = this.card_library[cardkey];
		
		return `
      <div class="cardslot ${(tapped)?"tapped":""}" id="${uuid}">
        <img src="${card.img}" class="cardimg" id="${cardkey}"/>
      </div>
    `;
	}
}

Realms.importFunctions(RealmsDeck);

>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
module.exports = Realms;
