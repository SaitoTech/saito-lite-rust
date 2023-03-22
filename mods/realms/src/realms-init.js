const GameTemplate = require('../../lib/templates/gametemplate');
const saito = require('../../lib/saito/saito');

//////////////////
// CONSTRUCTOR  //
//////////////////
class Realms extends GameTemplate {

  constructor(app) {

    super(app);

    this.app 		= app;
    this.gamename 	= "Realms";
    this.appname 	= "Realms";
    this.name 		= "Realms";
    this.description 	= "Saito Realms is a card-driven enchantment battle game";
    this.categories 	= "Games Arcade Entertainment";
    this.type     	= "Cardgame";
    this.card_img_dir 	= '/realm/img/cards';

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
        background : "/realm/img/arcade/arcade-banner-background.png" ,
	title : "Realms" ,
      }
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
      }
    }
    return null;

  }


  initializeHTML(app) {

    super.initializeHTML(app);

    //
    // ADD MENU
    //
    this.menu.addMenuOption("game-game", "Game");
    this.menu.addSubMenuOption("game-game", {
      text : "Log",
      id : "game-log",
      class : "game-log",
      callback : function(app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.log.toggleLog();
      }
    });
    this.menu.addSubMenuOption("game-game", {
      text : "Exit",
      id : "game-exit",
      class : "game-exit",
      callback : function(app, game_mod) {
        window.location.href = "/arcade";
      }
    });
    this.menu.addMenuIcon({
      text : '<i class="fa fa-window-maximize" aria-hidden="true"></i>',
      id : "game-menu-fullscreen",
      callback : function(app, game_mod) {
        game_mod.menu.hideSubMenus();
        app.browser.requestFullscreen();
      }
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
    if (this.game.status != "") { this.updateStatus(this.game.status); }
    if (this.game.dice == "") { this.initializeDice(); }

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
    for (let key in deck1) { this.importCard(key, deck1[key], 1); }
    for (let key in deck2) { this.importCard(key, deck2[key], 2); }

    try {
      this.displayBoard();
      this.updateStatusAndListCards("Waiting for Opponent Move", this.game.deck[this.game.player-1].hand);
    } catch (err) {

    }
  }


