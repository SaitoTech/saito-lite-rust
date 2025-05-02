const GameTemplate = require('../../lib/templates/gametemplate');
const ZoomOverlay = require('./lib/ui/overlays/zoom');
const CombatOverlay = require('./lib/ui/overlays/combat');
const SpaceOverlay = require('./lib/ui/overlays/space');
const LossOverlay = require('./lib/ui/overlays/loss');
const GunsOverlay = require('./lib/ui/overlays/guns');
const ReplacementsOverlay = require('./lib/ui/overlays/replacements');
const FlankOverlay = require('./lib/ui/overlays/flank');
const ReservesOverlay = require('./lib/ui/overlays/reserves');
const MandatesOverlay = require('./lib/ui/overlays/mandates');
const WelcomeOverlay = require('./lib/ui/overlays/welcome');
const MenuOverlay = require('./lib/ui/overlays/menu');

const PathsRules = require('./lib/core/rules.template');
const PathsOptions = require('./lib/core/advanced-options.template');
const PathsSingularOption = require('./lib/core/options.template');

const htmlTemplate = require('./lib/core/game-html.template').default;
const JSON = require('json-bigint');



//////////////////
// CONSTRUCTOR  //
//////////////////
class PathsOfGlory extends GameTemplate {

  constructor(app) {

    super(app);

    this.app             = app;

    this.name  		 = "PathsOfGlory";
    this.gamename        = "Paths of Glory";
    this.slug		 = "paths";
    this.description     = `Paths of Glory: The First World War invites players to assume the roles of the leaders of the Central Powers and Allies who led the world to the precipice of destruction between 1914 and 1918.`;
    this.publisher_message = `Here I Stand is published by GMT Games. This module is made available under an open source license provided by GMT Games that permits usage provided that at least one player per game has purchased a copy of the game. Support GMT Games: <a href="https://boardgamegeek.com/boardgame/91/paths-glory">Paths of Glory</a>`;
    this.categories      = "Games Boardgame Strategy";

    this.interface = 1; // graphical interface

    //
    // ui components
    //
    this.flank_overlay = new FlankOverlay(this.app, this); 
    this.zoom_overlay = new ZoomOverlay(this.app, this); 
    this.combat_overlay = new CombatOverlay(this.app, this); 
    this.loss_overlay = new LossOverlay(this.app, this); 
    this.guns_overlay = new GunsOverlay(this.app, this); 
    this.replacements_overlay = new ReplacementsOverlay(this.app, this); 
    this.reserves_overlay = new ReservesOverlay(this.app, this); 
    this.mandates_overlay = new MandatesOverlay(this.app, this); 
    this.welcome_overlay = new WelcomeOverlay(this.app, this); 
    this.menu_overlay = new MenuOverlay(this.app, this); 
    this.space_overlay = new SpaceOverlay(this.app, this); 

    //
    // this sets the ratio used for determining
    // the size of the original pieces
    //
    this.boardWidth  = 5100;

    //
    // newbie mode
    //
    this.confirm_moves = 1;

    //
    // "showcard" popups
    //
    this.useCardbox = 1;

    //
    //
    // players
    this.minPlayers 	 = 2;
    this.maxPlayers 	 = 2;

  }


  async render(app) {

    if (this.browser_active == 0 || this.initialize_game_run) { return; }

    if (this.game_html_injected != 1) {
      await this.injectGameHTML(htmlTemplate());
      this.game_html_injected = 1;
    }

    await super.render(app);

    let game_mod = this;

    //
    // preload images
    //
    this.preloadImages();


    // required here so menu will be proper
    try {
      if (this.app.options.gameprefs.pathsofglory_expert_mode == 1) {
        this.confirm_moves = 0;
      } else {
        this.confirm_moves = 1;
      }
    } catch (err) {}

    this.menu.addMenuOption("game-game", "Game");
    let initial_confirm_moves = "Newbie Mode"; 
    if (this.confirm_moves == 1) {
      initial_confirm_moves = "Expert Mode"; 
    }
    this.menu.addSubMenuOption("game-game", {
      text : initial_confirm_moves,
      id : "game-confirm",
      class : "game-confirm",
      callback : function(app, game_mod) {
        game_mod.menu.hideSubMenus();
	if (game_mod.confirm_moves == 0) {
	  game_mod.confirm_moves = 1;
          game_mod.saveGamePreference('his_expert_mode', 0);
          reloadWindow(300);
	} else {
	  game_mod.confirm_moves = 0;
          game_mod.saveGamePreference('his_expert_mode', 1);
          reloadWindow(300);
	}
      }
    });
    this.menu.addSubMenuOption("game-game", {
      text : "Combat",
      id : "game-combat",
      class : "game-combat",
      callback : function(app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.combat_overlay.render();
      }
    });
    this.menu.addSubMenuOption("game-game", {
      text : "Central Reserves",
      id : "game-reserves-central",
      class : "game-reserves-central",
      callback : function(app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.reserves_overlay.render("central");
      }
    });
    this.menu.addSubMenuOption("game-game", {
      text : "Allied Reserves",
      id : "game-reserves-allies",
      class : "game-reserves-allies",
      callback : function(app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.reserves_overlay.render("allies");
      }
    });
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
      text : "Stats",
      id : "game-stats",
      class : "game-stats",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        game_mod.handleStatsMenu();
      }
    });
/***
    this.menu.addSubMenuOption("game-game", {
      text : "Replacements",
      id : "game-replacements",
      class : "game-replacements",
      callback : function(app, game_mod) {
	game_mod.playerSpendReplacementPoints(game_mod.returnFactionOfPlayer());
      }
    });
***/

/****
    this.menu.addMenuOption("game-info", "Info");
    this.menu.addSubMenuOption("game-info", {
      text : "Control",
      id : "game-control",
      class : "game-control",
      callback: function(app,game_mod){
	for (let key in game_mod.game.spaces) {
	  if (game_mod.game.spaces[key].control == "central") {
	    this.addHighlightToSpacekey(key, "central");
	  }
	  if (game_mod.game.spaces[key].control == "allies") {
	    this.addHighlightToSpacekey(key, "allies");
	  }
	  document.querySelector("body").onclick = () => { document.querySelector("body").onclick = () => {}; this.removeHighlights(); }
	}
      }
    });
****/

    this.menu.addChatMenu();
    this.menu.render();
    this.log.render();
    this.cardbox.render();


    //
    // add card events -- text shown and callback run if there
    //
    this.cardbox.addCardType("showcard", "", null);
    this.cardbox.addCardType("card", "select", this.cardbox_callback);
    if (app.browser.isMobileBrowser(navigator.userAgent)) {
      this.cardbox.skip_card_prompt = 0;
    }

    //
    // position cities / spaces / etc
    //
    if (!this.game.spaces) { this.game.spaces = this.returnSpaces(); }
    for (let key in this.game.spaces) {
      if (this.game.spaces.hasOwnProperty(key)) {
	try {
	  let obj = document.getElementById(key);
	  obj.style.top = this.game.spaces[key].top + "px";
	  obj.style.left = this.game.spaces[key].left + "px";
        } catch (err) {
	}
      }
    }

    try {

      if (app.browser.isMobileBrowser(navigator.userAgent)) {
        //this.hammer.render();
      } else {
	let paths_self = this;
        this.sizer.render();
        this.sizer.attachEvents('#gameboard');
      }

    } catch (err) {}

    this.hud.render();
    this.displayBoard();

  }






  returnSingularGameOption(){
    return PathsSingularOption();
  }

  returnAdvancedOptions() {
    return PathsOptions();
  }

  returnGameRulesHTML(){
    return PathsRules();
  }




  ////////////////
  // initialize //
  ////////////////
  initializeGame(game_id) {

    //
    // check user preferences to update interface, if text
    //
    if (this.app?.options?.gameprefs) {
      if (this.app.options.gameprefs.his_expert_mode == 1) {
        this.confirm_moves = 0;
      } else {
        this.confirm_moves = 1;
      }
    }

    //
    // re-fill status and log
    //
    if (this.game.status != "") { this.updateStatus(this.game.status); }

    //
    // initialize game objects
    //
    this.deck = this.returnDeck("all");



