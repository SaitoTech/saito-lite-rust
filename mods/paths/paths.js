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




    //
    // Austria-Hungary AH
    //
    this.importUnit('ah_army01', {
      ckey		:       "AH" ,
      country           :       "Austro-Hungarian" ,
      name		:	"1st Army" ,
      type		:	"army" ,
      front		:	"ah_army01.png" ,
      back		:	"ah_army01_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ah_army02', {
      ckey		:       "AH" ,
      country           :       "Austro-Hungarian" ,
      name		:	"2nd Army" ,
      type		:	"army" ,
      front		:	"ah_army02.png" ,
      back		:	"ah_army02_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ah_army03', {
      ckey		:       "AH" ,
      country           :       "Austro-Hungarian" ,
      name		:	"3rd Army" ,
      type		:	"army" ,
      front		:	"ah_army03.png" ,
      back		:	"ah_army03_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ah_army04', {
      ckey		:       "AH" ,
      country           :       "Austro-Hungarian" ,
      name		:	"4th Army" ,
      type		:	"army" ,
      front		:	"ah_army04.png" ,
      back		:	"ah_army04_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ah_army05', {
      ckey		:       "AH" ,
      country           :       "Austro-Hungarian" ,
      name		:	"5th Army" ,
      type		:	"army" ,
      front		:	"ah_army05.png" ,
      back		:	"ah_army05_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ah_army06', {
      ckey		:       "AH" ,
      country           :       "Austro-Hungarian" ,
      name		:	"6th Army" ,
      type		:	"army" ,
      front		:	"ah_army06.png" ,
      back		:	"ah_army06_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ah_army07', {
      ckey		:       "AH" ,
      country           :       "Austro-Hungarian" ,
      name		:	"7th Army" ,
      type		:	"army" ,
      front		:	"ah_army07.png" ,
      back		:	"ah_army07_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ah_army10', {
      ckey		:       "AH" ,
      country           :       "Austro-Hungarian" ,
      name		:	"10th Army" ,
      type		:	"army" ,
      front		:	"ah_army10.png" ,
      back		:	"ah_army10_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ah_army11', {
      ckey		:       "AH" ,
      country           :       "Austro-Hungarian" ,
      name		:	"11th Army" ,
      type		:	"army" ,
      front		:	"ah_army11.png" ,
      back		:	"ah_army11_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ah_corps', {
      ckey		:       "AH" ,
      country           :       "Austro-Hungarian" ,
      name		:	"AH Corps" ,
      type		:	"corps" ,
      front		:	"ah_corps.png" ,
      back		:	"ah_corps_back.png" ,
      combat		:	1 ,
      loss		:	1 ,
      movement		:	3 ,
      rcombat		:	0 ,
      rloss		:	1 ,
      rmovement		:	3 ,
    });

    //
    // Arab Northern Army
    //
    this.importUnit('ana_corps', {
      ckey		:       "ANA" ,
      country           :       "Arab Northern Army" ,
      name		:	"ANA Corps" ,
      type		:	"corps" ,
      front		:	"ana_corps.png" ,
      back		:	"ana_corps_back.png" ,
      combat		:	1 ,
      loss		:	1 ,
      movement		:	3 ,
      rcombat		:	0 ,
      rloss		:	1 ,
      rmovement		:	3 ,
      checkSupplyStatus :	(paths_self, spacekey) => { return 1; }
    });

    //
    // Army of Islam
    //
    this.importUnit('aoi_corps', {
      ckey		:       "AOI" ,
      country           :       "Army of Islam" ,
      name		:	"AOI Army" ,
      type		:	"army" ,
      front		:	"aoi_army.png" ,
      back		:	"aoi_army_back.png" ,
      combat		:	1 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	2 ,
    });

    //
    // Australian Corps
    //
    this.importUnit('aus_corps', {
      ckey		:       "AUS" ,
      country           :       "Australian Corps" ,
      name		:	"AUS Corps" ,
      type		:	"corps" ,
      front		:	"aus_corps.png" ,
      back		:	"aus_corps_back.png" ,
      combat		:	2 ,
      loss		:	1 ,
      movement		:	4 ,
      rcombat		:	2 ,
      rloss		:	1 ,
      rmovement		:	4 ,
    });

    //
    // Belgian Army
    //
    this.importUnit('be_army', {
      ckey		:       "BE" ,
      country           :       "Belgium" ,
      name		:	"BE Army" ,
      type		:	"army" ,
      front		:	"be_army.png" ,
      back		:	"be_army_back.png" ,
      combat		:	2 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });

    //
    // Belgian Corps
    //
    this.importUnit('be_corps', {
      ckey		:       "BE" ,
      country           :       "Belgium" ,
      name		:	"BE Corps" ,
      type		:	"corps" ,
      front		:	"be_corps.png" ,
      back		:	"be_corps_back.png" ,
      combat		:	1 ,
      loss		:	1 ,
      movement		:	3 ,
      rcombat		:	0 ,
      rloss		:	1 ,
      rmovement		:	3 ,
    });

    //
    // British Expeditionary Force
    //
    this.importUnit('bef_army', {
      ckey		:       "BEF" ,
      country           :       "British Expeditionary Force" ,
      name		:	"BEF Army" ,
      type		:	"army" ,
      front		:	"bef_army.png" ,
      back		:	"bef_army_back.png" ,
      combat		:	5 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	4 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });

    //
    // British Expeditionary Force
    //
    this.importUnit('bef_corps', {
      ckey		:       "BEF" ,
      country           :       "British Expeditionary Force" ,
      name		:	"BEF Corps" ,
      type		:	"corps" ,
      front		:	"bef_corps.png" ,
      back		:	"bef_corps_back.png" ,
      combat		:	2 ,
      loss		:	2 ,
      movement		:	4 ,
      rcombat		:	2 ,
      rloss		:	1 ,
      rmovement		:	4 ,
    });


    //
    // British BR
    //
    this.importUnit('br_army01', {
      ckey		:       "BR" ,
      country           :       "British" ,
      name		:	"1st Army" ,
      type		:	"army" ,
      front		:	"br_army01.png" ,
      back		:	"br_army01_back.png" ,
      combat		:	4 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('br_army02', {
      ckey		:       "BR" ,
      country           :       "British" ,
      name		:	"2nd Army" ,
      type		:	"army" ,
      front		:	"br_army02.png" ,
      back		:	"br_army02_back.png" ,
      combat		:	4 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('br_army03', {
      ckey		:       "BR" ,
      country           :       "British" ,
      name		:	"3rd Army" ,
      type		:	"army" ,
      front		:	"br_army03.png" ,
      back		:	"br_army03_back.png" ,
      combat		:	4 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('br_army04', {
      ckey		:       "BR" ,
      country           :       "British" ,
      name		:	"4th Army" ,
      type		:	"army" ,
      front		:	"br_army04.png" ,
      back		:	"br_army04_back.png" ,
      combat		:	4 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('br_army05', {
      ckey		:       "BR" ,
      country           :       "British" ,
      name		:	"5th Army" ,
      type		:	"army" ,
      front		:	"br_army05.png" ,
      back		:	"br_army05_back.png" ,
      combat		:	4 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('br_corps', {
      ckey		:       "BR" ,
      country           :       "British" ,
      name		:	"BR Corps" ,
      type		:	"corps" ,
      front		:	"br_corps.png" ,
      back		:	"br_corps_back.png" ,
      combat		:	2 ,
      loss		:	1 ,
      movement		:	4 ,
      rcombat		:	1 ,
      rloss		:	1 ,
      rmovement		:	4 ,
    });

    //
    // Bulgarian
    //
    this.importUnit('bu_corps', {
      ckey		:       "BU" ,
      country           :       "Bulgarian" ,
      name		:	"BU Corps" ,
      type		:	"corps" ,
      front		:	"bu_corps.png" ,
      back		:	"bu_corps_back.png" ,
      combat		:	2 ,
      loss		:	1 ,
      movement		:	3 ,
      rcombat		:	0 ,
      rloss		:	1 ,
      rmovement		:	3 ,
    });

    //
    // Caucasus
    //
    this.importUnit('cau_army', {
      ckey		:       "CAU" ,
      country           :       "Caucasus" ,
      name		:	"CAU Army" ,
      type		:	"army" ,
      front		:	"cau_army.png" ,
      back		:	"cau_army_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });

    //
    // Canadian
    //
    this.importUnit('cnd_corps', {
      ckey		:       "CND" ,
      country           :       "Canadian" ,
      name		:	"CND Corps" ,
      type		:	"corps" ,
      front		:	"cnd_corps.png" ,
      back		:	"cnd_corps_back.png" ,
      combat		:	2 ,
      loss		:	1 ,
      movement		:	4 ,
      rcombat		:	2 ,
      rloss		:	1 ,
      rmovement		:	4 ,
    });

    //
    // Czech Legion
    //
    this.importUnit('czl_corps', {
      ckey		:       "CZL" ,
      country           :       "Czech Legion" ,
      name		:	"CZL Corps" ,
      type		:	"corps" ,
      front		:	"czl_army.png" ,
      back		:	"czl_army_back.png" ,
      combat		:	2 ,
      loss		:	1 ,
      movement		:	4 ,
      rcombat		:	1 ,
      rloss		:	1 ,
      rmovement		:	4 ,
    });


    //
    // France FR
    //
    this.importUnit('fr_army01', {
      ckey		:       "FR" ,
      country           :       "France" ,
      name		:	"1st Army" ,
      type		:	"army" ,
      front		:	"fr_army01.png" ,
      back		:	"fr_army01_back.png" ,
      combat		:	3 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('fr_army02', {
      ckey		:       "FR" ,
      country           :       "France" ,
      name		:	"2nd Army" ,
      type		:	"army" ,
      front		:	"fr_army02.png" ,
      back		:	"fr_army02_back.png" ,
      combat		:	3 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('fr_army03', {
      ckey		:       "FR" ,
      country           :       "France" ,
      name		:	"3rd Army" ,
      type		:	"army" ,
      front		:	"fr_army03.png" ,
      back		:	"fr_army03_back.png" ,
      combat		:	3 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('fr_army04', {
      ckey		:       "FR" ,
      country           :       "France" ,
      name		:	"4th Army" ,
      type		:	"army" ,
      front		:	"fr_army04.png" ,
      back		:	"fr_army04_back.png" ,
      combat		:	3 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('fr_army05', {
      ckey		:       "FR" ,
      country           :       "France" ,
      name		:	"5th Army" ,
      type		:	"army" ,
      front		:	"fr_army05.png" ,
      back		:	"fr_army05_back.png" ,
      combat		:	3 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('fr_army06', {
      ckey		:       "FR" ,
      country           :       "France" ,
      name		:	"6th Army" ,
      type		:	"army" ,
      front		:	"fr_army06.png" ,
      back		:	"fr_army06_back.png" ,
      combat		:	3 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('fr_army07', {
      ckey		:       "FR" ,
      country           :       "France" ,
      name		:	"7th Army" ,
      type		:	"army" ,
      front		:	"fr_army07.png" ,
      back		:	"fr_army07_back.png" ,
      combat		:	3 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('fr_army09', {
      ckey		:       "FR" ,
      country           :       "France" ,
      name		:	"9th Army" ,
      type		:	"army" ,
      front		:	"fr_army09.png" ,
      back		:	"fr_army09_back.png" ,
      combat		:	3 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('fr_army10', {
      ckey		:       "FR" ,
      country           :       "France" ,
      name		:	"10th Army" ,
      type		:	"army" ,
      front		:	"fr_army10.png" ,
      back		:	"fr_army10_back.png" ,
      combat		:	3 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('fr_corps', {
      ckey		:       "FR" ,
      country           :       "France" ,
      name		:	"FR Corps" ,
      type		:	"corps" ,
      front		:	"fr_corps.png" ,
      back		:	"fr_corps_back.png" ,
      combat		:	1 ,
      loss		:	1 ,
      movement		:	4 ,
      rcombat		:	1 ,
      rloss		:	1 ,
      rmovement		:	4 ,
    });


    //
    // Germany GE
    //
    this.importUnit('ge_army01', {
      ckey		:       "GE" ,
      country           :       "Germany" ,
      name		:	"1st Army" ,
      type		:	"army" ,
      front		:	"ge_army01.png" ,
      back		:	"ge_army01_back.png" ,
      combat		:	5 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('ge_army02', {
      ckey		:       "GE" ,
      country           :       "Germany" ,
      name		:	"2nd Army" ,
      type		:	"army" ,
      front		:	"ge_army02.png" ,
      back		:	"ge_army02_back.png" ,
      combat		:	5 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('ge_army03', {
      ckey		:       "GE" ,
      country           :       "Germany" ,
      name		:	"3rd Army" ,
      type		:	"army" ,
      front		:	"ge_army03.png" ,
      back		:	"ge_army03_back.png" ,
      combat		:	5 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('ge_army04', {
      ckey		:       "GE" ,
      country           :       "Germany" ,
      name		:	"4th Army" ,
      type		:	"army" ,
      front		:	"ge_army04.png" ,
      back		:	"ge_army04_back.png" ,
      combat		:	5 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('ge_army05', {
      ckey		:       "GE" ,
      country           :       "Germany" ,
      name		:	"5th Army" ,
      type		:	"army" ,
      front		:	"ge_army05.png" ,
      back		:	"ge_army05_back.png" ,
      combat		:	5 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('ge_army06', {
      ckey		:       "GE" ,
      country           :       "Germany" ,
      name		:	"6th Army" ,
      type		:	"army" ,
      front		:	"ge_army06.png" ,
      back		:	"ge_army06_back.png" ,
      combat		:	5 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('ge_army07', {
      ckey		:       "GE" ,
      country           :       "Germany" ,
      name		:	"7th Army" ,
      type		:	"army" ,
      front		:	"ge_army07.png" ,
      back		:	"ge_army07_back.png" ,
      combat		:	5 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('ge_army08', {
      ckey		:       "GE" ,
      country           :       "Germany" ,
      name		:	"8th Army" ,
      type		:	"army" ,
      front		:	"ge_army08.png" ,
      back		:	"ge_army08_back.png" ,
      combat		:	5 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('ge_army09', {
      ckey		:       "GE" ,
      country           :       "Germany" ,
      name		:	"9th Army" ,
      type		:	"army" ,
      front		:	"ge_army09.png" ,
      back		:	"ge_army09_back.png" ,
      combat		:	5 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('ge_army10', {
      ckey		:       "GE" ,
      country           :       "Germany" ,
      name		:	"10th Army" ,
      type		:	"army" ,
      front		:	"ge_army10.png" ,
      back		:	"ge_army10_back.png" ,
      combat		:	5 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('ge_army11', {
      ckey		:       "GE" ,
      country           :       "Germany" ,
      name		:	"11th Army" ,
      type		:	"army" ,
      front		:	"ge_army11.png" ,
      back		:	"ge_army11_back.png" ,
      combat		:	5 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('ge_army12', {
      ckey		:       "GE" ,
      country           :       "Germany" ,
      name		:	"12th Army" ,
      type		:	"army" ,
      front		:	"ge_army12.png" ,
      back		:	"ge_army12_back.png" ,
      combat		:	5 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('ge_army14', {
      ckey		:       "GE" ,
      country           :       "Germany" ,
      name		:	"14th Army" ,
      type		:	"army" ,
      front		:	"ge_army14.png" ,
      back		:	"ge_army14_back.png" ,
      combat		:	5 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('ge_army17', {
      ckey		:       "GE" ,
      country           :       "Germany" ,
      name		:	"17th Army" ,
      type		:	"army" ,
      front		:	"ge_army17.png" ,
      back		:	"ge_army17_back.png" ,
      combat		:	5 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('ge_army18', {
      ckey		:       "GE" ,
      country           :       "Germany" ,
      name		:	"18th Army" ,
      type		:	"army" ,
      front		:	"ge_army18.png" ,
      back		:	"ge_army18_back.png" ,
      combat		:	5 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('ge_corps', {
      ckey		:       "GE" ,
      country           :       "Germany" ,
      name		:	"GE Corps" ,
      type		:	"corps" ,
      front		:	"ge_corps.png" ,
      back		:	"ge_corps_back.png" ,
      combat		:	2 ,
      loss		:	1 ,
      movement		:	4 ,
      rcombat		:	1 ,
      rloss		:	1 ,
      rmovement		:	4 ,
    });

    //
    // Greek
    //
    this.importUnit('gr_corps', {
      ckey		:       "GR" ,
      country           :       "Greek Corps" ,
      name		:	"GR Corps" ,
      type		:	"corps" ,
      front		:	"gr_corps.png" ,
      back		:	"gr_corps_back.png" ,
      combat		:	1 ,
      loss		:	1 ,
      movement		:	3 ,
      rcombat		:	0 ,
      rloss		:	1 ,
      rmovement		:	3 ,
    });

    //
    // Italy IT
    //
    this.importUnit('it_army01', {
      ckey		:       "IT" ,
      country           :       "Italy" ,
      name		:	"1st Army" ,
      type		:	"army" ,
      front		:	"it_army01.png" ,
      back		:	"it_army01_back.png" ,
      combat		:	2 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('it_army02', {
      ckey		:       "IT" ,
      country           :       "Italy" ,
      name		:	"2nd Army" ,
      type		:	"army" ,
      front		:	"it_army02.png" ,
      back		:	"it_army02_back.png" ,
      combat		:	2 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('it_army03', {
      ckey		:       "IT" ,
      country           :       "Italy" ,
      name		:	"3rd Army" ,
      type		:	"army" ,
      front		:	"it_army03.png" ,
      back		:	"it_army03_back.png" ,
      combat		:	2 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('it_army04', {
      ckey		:       "IT" ,
      country           :       "Italy" ,
      name		:	"4th Army" ,
      type		:	"army" ,
      front		:	"it_army04.png" ,
      back		:	"it_army04_back.png" ,
      combat		:	2 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('it_army05', {
      ckey		:       "IT" ,
      country           :       "Italy" ,
      name		:	"5th Army" ,
      type		:	"army" ,
      front		:	"it_army05.png" ,
      back		:	"it_army05_back.png" ,
      combat		:	2 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('it_corps', {
      ckey		:       "IT" ,
      country           :       "Italy" ,
      name		:	"IT Corps" ,
      type		:	"corps" ,
      front		:	"it_corps.png" ,
      back		:	"it_corps_back.png" ,
      combat		:	2 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });

    //
    // Mediterranean Expeditionary Force
    //
    this.importUnit('mef_army', {
      ckey		:       "MEF" ,
      country           :       "Mediterranean Expeditionary Force" ,
      name		:	"MEF Army" ,
      type		:	"army" ,
      front		:	"mef_army.png" ,
      back		:	"mef_army_back.png" ,
      combat		:	1 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });

    //
    // Montenegrin Corps
    //
    this.importUnit('mn_corps', {
      ckey		:       "MN" ,
      country           :       "Montenegro" ,
      name		:	"Montenegrin Corps" ,
      type		:	"corps" ,
      front		:	"mn_corps.png" ,
      back		:	"mn_corps_back.png" ,
      combat		:	1 ,
      loss		:	1 ,
      movement		:	0 ,
      rcombat		:	0 ,
      rloss		:	1 ,
      rmovement		:	0 ,
      checkSupplyStatus :	(paths_self, spacekey) => { return 1; }
    });

    //
    // Near East Army
    //
    this.importUnit('ne_army', {
      ckey		:       "NE" ,
      country           :       "Near East Army" ,
      name		:	"NE Army" ,
      type		:	"army" ,
      front		:	"ne_army.png" ,
      back		:	"ne_army_back.png" ,
      combat		:	4 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });

    //
    // Orient Army
    //
    this.importUnit('orient_army', {
      ckey		:       "OA" ,
      country           :       "Orient Army" ,
      name		:	"OA Army" ,
      type		:	"army" ,
      front		:	"orient_army.png" ,
      back		:	"orient_army_back.png" ,
      combat		:	3 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });

    //
    // Polish Corps
    //
    this.importUnit('pol_corps', {
      ckey		:       "POL" ,
      country           :       "Poland" ,
      name		:	"Polish Corps" ,
      type		:	"army" ,
      front		:	"pol_corps.png" ,
      back		:	"pol_corps_back.png" ,
      combat		:	2 ,
      loss		:	1 ,
      movement		:	4 ,
      rcombat		:	1 ,
      rloss		:	1 ,
      rmovement		:	4	 ,
    });

    //
    // Portuguese Corps
    //
    this.importUnit('pt_corps', {
      ckey		:       "PT" ,
      country           :       "Portuguese" ,
      name		:	"Portuguese Corps" ,
      type		:	"army" ,
      front		:	"pt_corps.png" ,
      back		:	"pt_corps_back.png" ,
      combat		:	1 ,
      loss		:	1 ,
      movement		:	3 ,
      rcombat		:	0 ,
      rloss		:	1 ,
      rmovement		:	3 ,
    });

    //
    // Romanian Corps
    //
    this.importUnit('ro_corps', {
      ckey		:       "RO" ,
      country           :       "Romania" ,
      name		:	"Romanian Corps" ,
      type		:	"army" ,
      front		:	"ro_corps.png" ,
      back		:	"ro_corps_back.png" ,
      combat		:	1 ,
      loss		:	1 ,
      movement		:	3 ,
      rcombat		:	0 ,
      rloss		:	1 ,
      rmovement		:	3 ,
    });

    //
    // Russia RU
    //
    this.importUnit('ru_army01', {
      ckey		:       "RU" ,
      country           :       "Russia" ,
      name		:	"1st Army" ,
      type		:	"army" ,
      front		:	"ru_army01.png" ,
      back		:	"ru_army01_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ru_army02', {
      ckey		:       "RU" ,
      country           :       "Russia" ,
      name		:	"2nd Army" ,
      type		:	"army" ,
      front		:	"ru_army02.png" ,
      back		:	"ru_army02_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ru_army03', {
      ckey		:       "RU" ,
      country           :       "Russia" ,
      name		:	"3rd Army" ,
      type		:	"army" ,
      front		:	"ru_army03.png" ,
      back		:	"ru_army03_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ru_army04', {
      ckey		:       "RU" ,
      country           :       "Russia" ,
      name		:	"4th Army" ,
      type		:	"army" ,
      front		:	"ru_army04.png" ,
      back		:	"ru_army04_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ru_army05', {
      ckey		:       "RU" ,
      country           :       "Russia" ,
      name		:	"5th Army" ,
      type		:	"army" ,
      front		:	"ru_army05.png" ,
      back		:	"ru_army05_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ru_army06', {
      ckey		:       "RU" ,
      country           :       "Russia" ,
      name		:	"6th Army" ,
      type		:	"army" ,
      front		:	"ru_army06.png" ,
      back		:	"ru_army06_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ru_army07', {
      ckey		:       "RU" ,
      country           :       "Russia" ,
      name		:	"7th Army" ,
      type		:	"army" ,
      front		:	"ru_army07.png" ,
      back		:	"ru_army07_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ru_army08', {
      ckey		:       "RU" ,
      country           :       "Russia" ,
      name		:	"8th Army" ,
      type		:	"army" ,
      front		:	"ru_army08.png" ,
      back		:	"ru_army08_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ru_army09', {
      ckey		:       "RU" ,
      country           :       "Russia" ,
      name		:	"9th Army" ,
      type		:	"army" ,
      front		:	"ru_army09.png" ,
      back		:	"ru_army09_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ru_army10', {
      ckey		:       "RU" ,
      country           :       "Russia" ,
      name		:	"10th Army" ,
      type		:	"army" ,
      front		:	"ru_army10.png" ,
      back		:	"ru_army10_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ru_army11', {
      ckey		:       "RU" ,
      country           :       "Russia" ,
      name		:	"11th Army" ,
      type		:	"army" ,
      front		:	"ru_army11.png" ,
      back		:	"ru_army11_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ru_army12', {
      ckey		:       "RU" ,
      country           :       "Russia" ,
      name		:	"12th Army" ,
      type		:	"army" ,
      front		:	"ru_army12.png" ,
      back		:	"ru_army12_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });

    //
    // Russian Cavalry
    //
    this.importUnit('ru_cav', {
      ckey		:       "RU" ,
      country           :       "Russia" ,
      name		:	"Russian Cavalry" ,
      type		:	"corps" ,
      front		:	"ru_cav.png" ,
      back		:	"ru_cav_back.png" ,
      combat		:	1 ,
      loss		:	1 ,
      movement		:	4 ,
      rcombat		:	0 ,
      rloss		:	1 ,
      rmovement		:	4 ,
    });

    //
    // Russian Corps
    //
    this.importUnit('ru_corps', {
      ckey		:       "RU" ,
      country           :       "Russia" ,
      name		:	"Russian Corps" ,
      type		:	"corps" ,
      front		:	"ru_corps.png" ,
      back		:	"ru_corps_back.png" ,
      combat		:	1 ,
      loss		:	1 ,
      movement		:	3 ,
      rcombat		:	0 ,
      rloss		:	1 ,
      rmovement		:	3 ,
    });

    //
    // Serbia
    //
    this.importUnit('sb_army01', {
      ckey		:       "SB" ,
      country           :       "Serbia" ,
      name		:	"1st Army" ,
      type		:	"army" ,
      front		:	"sb_army01.png" ,
      back		:	"sb_army01_back.png" ,
      combat		:	2 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	3 ,
      checkSupplyStatus :	(paths_self, spacekey) => { 
	if (paths_self.game.spaces[spacekey].country == "serbia") { return 1; }
      } ,
    });
    this.importUnit('sb_army02', {
      ckey		:       "SB" ,
      country           :       "Serbia" ,
      name		:	"2nd Army" ,
      type		:	"army" ,
      front		:	"sb_army02.png" ,
      back		:	"sb_army02_back.png" ,
      combat		:	2 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	3 ,
      checkSupplyStatus :	(paths_self, spacekey) => { 
	if (paths_self.game.spaces[spacekey].country == "serbia") { return 1; }
      } ,
    });

    //
    // Serbian Corps
    //
    this.importUnit('sb_corps', {
      ckey		:       "SB" ,
      country           :       "Serbia" ,
      name		:	"Serbian Corps" ,
      type		:	"corps" ,
      front		:	"sb_corps.png" ,
      back		:	"sb_corps_back.png" ,
      combat		:	1 ,
      loss		:	1 ,
      movement		:	4 ,
      rcombat		:	0 ,
      rloss		:	1 ,
      rmovement		:	4 ,
      checkSupplyStatus :	(paths_self, spacekey) => { 
	if (paths_self.game.spaces[spacekey].country == "serbia") { return 1; }
      } ,
    });

    //
    // Sennusi Tribal
    //
    this.importUnit('sn_corps', {
      ckey		:       "SN" ,
      country           :       "Sennusi" ,
      name		:	"Sennusi Corps" ,
      type		:	"corps" ,
      front		:	"sn_corps.png" ,
      back		:	"sn_corps_back.png" ,
      combat		:	1 ,
      loss		:	1 ,
      movement		:	1 ,
      rcombat		:	0 ,
      rloss		:	1 ,
      rmovement		:	1 ,
      checkSupplyStatus :	(paths_self, spacekey) => { return 1; }
    });

    //
    // Turkish Corps
    //
    this.importUnit('tu_corps', {
      ckey		:       "TU" ,
      country           :       "Turkey" ,
      name		:	"Turkish Corps" ,
      type		:	"corps" ,
      front		:	"tu_corps.png" ,
      back		:	"tu_corps_back.png" ,
      combat		:	1 ,
      loss		:	1 ,
      movement		:	3 ,
      rcombat		:	0 ,
      rloss		:	1 ,
      rmovement		:	3 ,
    });

    //
    // US Army
    //
    this.importUnit('us_army01', {
      ckey		:       "US" ,
      country           :       "United States" ,
      name		:	"1st Army" ,
      type		:	"army" ,
      front		:	"us_army01.png" ,
      back		:	"us_army01_back.png" ,
      combat		:	5 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('us_army02', {
      ckey		:       "US" ,
      country           :       "United States" ,
      name		:	"2nd Army" ,
      type		:	"army" ,
      front		:	"us_army02.png" ,
      back		:	"us_army02_back.png" ,
      combat		:	5 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });

    //
    // US Army Corps
    //
    this.importUnit('us_corps', {
      ckey		:       "US" ,
      country           :       "United States" ,
      name		:	"United States Corps" ,
      type		:	"corps" ,
      front		:	"us_corps.png" ,
      back		:	"us_corps_back.png" ,
      combat		:	2 ,
      loss		:	1 ,
      movement		:	4 ,
      rcombat		:	1 ,
      rloss		:	1 ,
      rmovement		:	4 ,
    });


    //
    // Yilderim Army
    //
    this.importUnit('yld_army01', {
      ckey		:       "YLD" ,
      country           :       "Yilderim" ,
      name		:	"1st Army" ,
      type		:	"army" ,
      front		:	"yld_army01.png" ,
      back		:	"yld_army01_back.png" ,
      combat		:	1 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	2 ,
    });





console.log("INITIALIZING PATHS");

    let first_time_running = 0;

    //
    // initialize
    //
    if (!this.game.state) {

      this.game.state = this.returnState();
      this.game.spaces = this.returnSpaces();
      this.game.state.players_info = this.returnPlayers(this.game.players.length);

console.log("PLAYERS INFO: " + JSON.stringify(this.game.state.players_info));

console.log("\n\n\n\n");
console.log("---------------------------");
console.log("---------------------------");
console.log("------ INITIALIZE GAME ----");
console.log("---------------------------");
console.log("---------------------------");
console.log("---------------------------");
console.log("DECK: " + this.game.options.deck);
console.log("\n\n\n\n");

      this.updateStatus("<div class='status-message' id='status-message'>Generating the Game</div>");

      //
      // Game Queue
      //
      this.game.queue.push("turn");	// turn 1
      this.game.queue.push("READY");
      this.game.queue.push("init");

      this.game.queue.push("DEAL\t2\t2\t7");
      this.game.queue.push("DEAL\t1\t1\t6"); // player automatically gets Guns of August
      //this.game.queue.push("DEAL\t2\t2\t7");
      //this.game.queue.push("DEAL\t1\t1\t6"); // player chooses Guns of August or extra card 

      this.game.queue.push("DECKENCRYPT\t2\t2");
      this.game.queue.push("DECKENCRYPT\t2\t1");
      this.game.queue.push("DECKXOR\t2\t2");
      this.game.queue.push("DECKXOR\t2\t1");

      this.game.queue.push("DECKENCRYPT\t1\t2");
      this.game.queue.push("DECKENCRYPT\t1\t1");
      this.game.queue.push("DECKXOR\t1\t2");
      this.game.queue.push("DECKXOR\t1\t1");

      let deck = this.returnMobilizationDeck("central");
      delete deck["cp01"];
      this.game.queue.push("DECK\t1\t"+JSON.stringify(deck));
      // this.game.queue.push("DECK\t1\t"+JSON.stringify(this.returnMobilizationDeck("central")));
      this.game.queue.push("DECK\t2\t"+JSON.stringify(this.returnMobilizationDeck("allies")));

      //
      // belgium joins the allies
      //
      this.convertCountryToPower("belgium", "allies");

    }

    //
    // all cards with events added to this.deck
    //
    this.deck = this.returnDeck("all");

console.log("INITIALIZING PATHS");

    //
    // and show the board
    //
    this.displayBoard();



  }



  returnSpaceNameForLog() {
    return `<span class="showcard ${card}" id="${card}">${card}</span>`;


  }

  popup(card) {

    let c = null;
    if (!c && this.game.deck[0]) { c = this.game.deck[0].cards[card]; }
    if (!c && this.game.deck[1]) { c = this.game.deck[1].cards[card]; }
    if (!c && this.debaters) { 
      c = this.debaters[card];
      if (c) { return `<span class="showcard ${card}" id="${card}">${c.name}</span>`; }
    }
    if (!c) {
      let x = this.returnDeck();
      if (x[card]) { c = x[card]; }
    }
    if (c) { 
      if (c.name) {
        return `<span class="showcard ${card}" id="${card}">${c.name}</span>`;
      }
    }
    return `<span class="showcard ${card}" id="${card}">${card}</span>`;
  }

  canPlayStrategicRedeployment(faction="allies") {
    if (faction == "allies") {
      if (this.game.state.allies_rounds.length > 0) {
        if (this.game.state.allies_rounds[this.game.state.allies_rounds.length-1] == "sr") {  
  	  return 0;
        }
      }
      return 1;
    } else {
      if (this.game.state.central_rounds.length > 0) {
        if (this.game.state.central_rounds[this.game.state.central_rounds.length-1] == "sr") {  
  	  return 0;
        }
      }
      return 1;
    }
  }

  canPlayReinforcementPoints(faction="allies") {
    if (faction == "allies") {
      if (this.game.state.allies_rounds.length > 0) {
        if (this.game.state.allies_rounds[this.game.state.allies_rounds.length-1] == "rp") {  
  	  return 0;
        }
      }
      return 1;
    } else {
      if (this.game.state.central_rounds.length > 0) {
        if (this.game.state.central_rounds[this.game.state.central_rounds.length-1] == "rp") {  
  	  return 0;
        }
      }
      return 1;
    }
  }


  removeCardFromHand(card) {

    if (card[0] === 'c' && this.game.player == this.returnPlayerOfFaction("central")) {
      if (this.game.deck[0].hand.includes(card)) {
        for (let i = 0; i < this.game.deck[0].hand.length; i++) {
	  if (this.game.deck[0].hand[i] === card) {
	    if (!this.game.deck[0].discards[card]) {
	      this.game.deck[0].discards[card] = this.game.deck[0].cards[card];
	      delete this.game.deck[0].cards[card];
	    }
	    this.game.deck[0].hand.splice(i, 1);
	  }
	}
      }
    }
    if (card[0] === 'a' && this.game.player == this.returnPlayerOfFaction("allies")) {
      if (this.game.deck[1].hand.includes(card)) {
        for (let i = 0; i < this.game.deck[1].hand.length; i++) {
	  if (this.game.deck[1].hand[i] === card) {
	    if (!this.game.deck[1].discards[card]) {
	      this.game.deck[1].discards[card] = this.game.deck[1].cards[card];
	      delete this.game.deck[1].cards[card];
	    }
	    this.game.deck[1].hand.splice(i, 1);
	  }
	}
      }
    }

    if (this.game.deck[1].cards[card]) {
      this.game.deck[1].discards[card] = this.game.deck[1].cards[card];
      delete this.game.deck[1].cards[card];
    }
    if (this.game.deck[1].cards[card]) {
      this.game.deck[1].discards[card] = this.game.deck[1].cards[card];
      delete this.game.deck[1].cards[card];
    }

  }

  removeCardFromGame(card) {

    for (let key in this.game.deck[0].cards) {
      if (key === card) {
        this.game.deck[0].removed[key] = this.game.deck[0].cards[key];
        delete this.game.deck[0].cards[key];
      }
    }
    for (let key in this.game.deck[1].cards) {
      if (key === card) {
        this.game.deck[1].removed[key] = this.game.deck[1].cards[key];
        delete this.game.deck[1].cards[key];
      }
    }

  }

  returnMobilizationDeck(type="all") {
    let deck = {};

    if (type == "allies" || type == "all") {

      deck['ap01'] = { 
        key : 'britishreinforcements',
        img : "cards/card_ap01.svg" ,
        name : "British Reinforcements" ,
        cc : false ,
	ws : 1 ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.allies_reinforcements_br > 0) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tallies_reinforcements_br\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("allies", ["br_army02", "br_corps"], "england");
	  }
	  return 0;
	} ,
      }
	    
      deck['ap02'] = { 
        key : 'blockade',
        img : "cards/card_ap02.svg" ,
        name : "Blockade" ,
        cc : false ,
	ws : 2 ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.events.blockade = 1;
	  return 1;
        } ,
      }

      deck['ap03'] = { 
        key : 'russianreinforcements',
        img : "cards/card_ap03.svg" ,
        name : "Russian Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.allies_reinforcements_ru > 0) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tallies_reinforcements_ru\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("allies", ["ru_army11", "ru_corps"], "russia");
	  }
	  return 0;
	} ,
      }

      deck['ap04'] = { 
        key : 'pleve',
        img : "cards/card_ap04.svg" ,
        name : "Pleve" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { 
	  let attacker_units = paths_self.returnAttackerUnits();
	  let defender_units = paths_self.returnDefenderUnits();
	  for (let i = 0; i < attacker_units.length; i++) {
	    if (attacker_units[i].country === "russia") { return 1; }
	  }
	  for (let i = 0; i < defender_units.length; i++) {
	    if (defender_units[i].country === "russia") { return 1; }
	  }
	  return 0;
        } ,
        onEvent : function(paths_self, faction) {
	  let attacker_units = paths_self.returnAttackerUnits();
	  let defender_units = paths_self.returnDefenderUnits();
	  for (let i = 0; i < attacker_units.length; i++) {
	    if (attacker_units[i].country === "russia") { paths_self.game.state.combat.attacker_drm++; return 1; }
	  }
	  for (let i = 0; i < defender_units.length; i++) {
	    if (defender_units[i].country === "russia") { paths_self.game.state.combat.defender_drm++; return 1; }
	  }
	  return 1; 
	} ,
      }

      deck['ap05'] = { 
        key : 'putnik',
        img : "cards/card_ap05.svg" ,
        name : "Putnik" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
        canEvent : function(paths_self, faction) { 
	  let attacker_units = paths_self.returnAttackerUnits();
	  let defender_units = paths_self.returnDefenderUnits();
	  for (let i = 0; i < attacker_units.length; i++) {
	    if (attacker_units[i].country === "serbia") { return 1; }
	  }
	  for (let i = 0; i < defender_units.length; i++) {
	    if (defender_units[i].country === "serbia") { return 1; }
	  }
	  return 0; 
	} ,
        onEvent : function(paths_self, faction) {
	  let attacker_units = paths_self.returnAttackerUnits();
	  let defender_units = paths_self.returnDefenderUnits();
	  for (let i = 0; i < attacker_units.length; i++) {
	    if (attacker_units[i].country === "serbia") { paths_self.game.state.combat.attacker_drm++; return 1; }
	  }
	  for (let i = 0; i < defender_units.length; i++) {
	    if (defender_units[i].country === "serbia") { paths_self.game.state.combat.defender_drm++; return 1; }
	  }
	  return 1; 
	} ,
      }

      deck['ap06'] = { 
        key : 'withdrawal',
        img : "cards/card_ap06.svg" ,
        name : "Withdrawal" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.events.withdrawal = 1;
	  paths_self.game.state.combat.withdrawal = 1; 
	  return 1;
	} ,
      }

      deck['ap07'] = { 
        key : 'severeweather',
        img : "cards/card_ap07.svg" ,
        name : "Severe Weather" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
        canEvent : function(paths_self, faction) {
	  let space = paths_self.game.spaces[paths_self.game.state.combat.key];
	  if (space.terrain == "mountain") {
	    if ([3,4,7,8,11,12,15,16,19,20].includes(paths_self.game.state.turn)) { 
	      return 1;
	    }
	  }
	  if (space.terrain == "swamp") {
	    if ([3,5,7,9,11,13,15,17,19].includes(paths_self.game.state.turn)) { 
	      return 1;
	    }
	  }
	  return 0;
	} ,
        onEvent : function(paths_self, faction) {
	  let space = paths_self.game.spaces[paths_self.game.state.combat.key];
	  if (space.terrain == "mountain") {
	    if ([3,4,7,8,11,12,15,16,19,20].includes(paths_self.game.state.turn)) { 
	      paths_self.game.state.combat.defender_drm += 2;
	    }
	  }
	  if (space.terrain == "swamp") {
	    if ([3,5,7,9,11,13,15,17,19].includes(paths_self.game.state.turn)) { 
	      paths_self.game.state.combat.defender_drm += 2;
	    }
	  }
	  return 1;
	} ,
      }

      deck['ap08'] = { 
        key : 'russianreinforcements',
        img : "cards/card_ap08.svg" ,
        name : "Russian Reinforcements" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.allies_reinforcements_ru > 0) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tallies_reinforcements_ru\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("allies", ["ru_corps", "ru_corps"], "russia");
	  }
	  return 0;
	} ,
      }

      deck['ap09'] = { 
        key : 'moltke',
        img : "cards/card_ap09.svg" ,
        name : "Moltke" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.turn <= 2) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.events.moltke = 1;
	  return 1;
	} ,
      }

      deck['ap10'] = { 
        key : 'frenchreinforcements',
        img : "cards/card_ap10.svg" ,
        name : "French Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.allies_reinforcements_fr > 0) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tallies_reinforcements_fr\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("allies", ["fr_army10"], "france");
	  }
	  return 0;
	} ,
      }

      deck['ap11'] = { 
        key : 'russianreinforcements',
        img : "cards/card_ap11.svg" ,
        name : "Russian Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.allies_reinforcements_ru > 0) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tallies_reinforcements_ru\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("allies", ["ru_army09", "ru_army10"], "russia");
	  }
	  return 0;
	} ,
      }

      deck['ap12'] = { 
        key : 'entrench',
        img : "cards/card_ap12.svg" ,
        name : "Entrench" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.events.entrench == 1) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {

	  paths_self.game.state.events.entrench = 1;

	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {

	    //
	    // get eligible spaces
	    //
    	    let options = paths_self.returnSpacesWithFilter(
      		(key) => {
		  if (paths_self.game.spaces[key].trench > 0) { return 0; }
        	  if (paths_self.game.spaces[key].control == "allies") {
        	    if (paths_self.game.spaces[key].units.length > 0) {
                      if (paths_self.checkSupplyStatus("allies", key)) {
		        return 1;
		      }
		    }
		  }
		} ,
            );

	    //
	    // no placement options
	    //
	    if (options.length == 0) {
	      paths_self.addMove("NOTIFY\tNo Valid Allied Entrenchment Options");
	      paths_self.endTurn();
	      return 0;
	    }

	    //
	    // place a trench
	    //
            paths_self.playerSelectSpaceWithFilter(
              "Add Level 1 Trench Where? ",
              (key) => {
          	if (options.includes(key)) { return 1; }
              },
              (key) => {
		paths_self.updateStatus("processing...");
 		paths_self.addMove("entrench\tallies\t"+key);
 		paths_self.endTurn();
		return 0;
	      },
              null, 
              true
            );
	  }
	  return 0;
	} ,
      }

      deck['ap13'] = { 
        key : 'rapeofbelgium',
        img : "cards/card_ap13.svg" ,
        name : "Rape Of Belgium" ,
        cc : false ,
	ws : 2 ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.events.guns_of_august == 1 && paths_self.game.state.general_records_track.allies_war_status < 4) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.events.rape_of_belgium = 1;
	  paths_self.displayGeneralRecordsTrack();
	  return 1;
        } ,
      }

deck['ap14'] = { 
        key : 'britishreinforcements',
        img : "cards/card_ap14.svg" ,
        name : "British Reinforcements" ,
        cc : false ,
	ws : 1 ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,       
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.allies_reinforcements_br > 0) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tallies_reinforcements_br\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("allies", ["br_army01", "br_corps"], "england");
	  }
	  return 0;
	} ,
      }
    }
	  
    if (type == "central" || type == "all") {

      deck['cp01'] = { 
        key : 'gunsofaugust',
        img : "cards/card_cp01.svg" ,
        name : "Guns of August" ,
        cc : false ,
	ws : 2 ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.turn == 1 && paths_self.game.state.round == 1) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {

	  paths_self.game.state.events.guns_of_august = 1;
	  paths_self.game.spaces['liege'].fort = -1;
	  paths_self.game.spaces['liege'].control = "central";
	  paths_self.moveUnitToSpacekey("ge_army01", "liege");
	  paths_self.moveUnitToSpacekey("ge_army02", "liege");
	  paths_self.game.spaces['liege'].activated_for_combat = 1;
	  paths_self.game.spaces['koblenz'].activated_for_combat = 1;	    
	  paths_self.game.queue.push("player_play_combat\tcentral");
	  paths_self.displayBoard();
	  paths_self.shakeSpacekey("liege");
	  paths_self.shakeSpacekey("koblenz");

	  return 1;

	} ,
      }

      deck['cp02'] = { 
        key : 'wirelessintercepts',
        img : "cards/card_cp02.svg" ,
        name : "Wireless Intercepts" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) { 
	  paths_self.game.state.events.wireless_intercepts = 1;
	  paths_self.game.queue.push("combat_card\tcentral\tcp02");
	  return 1;
	} ,
      }

      deck['cp03'] = { 
        key : 'vonfrancois',
        img : "cards/card_cp03.svg" ,
        name : "Von Francois" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
        canEvent : function(paths_self, faction) {
          let attacker_units = paths_self.returnAttackerUnits();
          let defender_units = paths_self.returnDefenderUnits();
          let valid_option = false;
          for (let i = 0; i < attacker_units.length; i++) { if (attacker_units[i].country == "germany") { valid_option = true; } }
          for (let i = 0; i < defender_units.length; i++) { if (defender_units[i].country != "russia") { valid_option = false; } }
          if (valid_option == true) { return 1; }
	  return 0;
	} ,
        onEvent : function(paths_self, faction) {
          let attacker_units = paths_self.returnAttackerUnits();
          let defender_units = paths_self.returnDefenderUnits();
          let valid_option = false;
          for (let i = 0; i < attacker_units.length; i++) { if (attacker_units[i].country == "germany") { valid_option = true; } }
          for (let i = 0; i < defender_units.length; i++) { if (defender_units[i].country != "russia") { valid_option = false; } }
          if (valid_option == true) { paths_self.game.state.combat.attacker_drm += 1; }
	  return 1;
	} ,
      }

      deck['cp04'] = { 
        key : 'severeweather',
        img : "cards/card_cp04.svg" ,
        name : "Severe Weather" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
        canEvent : function(paths_self, faction) {
	  let space = paths_self.game.spaces[paths_self.game.state.combat.key];
	  if (space.terrain == "mountain") {
	    if ([3,4,7,8,11,12,15,16,19,20].includes(paths_self.game.state.turn)) { 
	      return 1;
	    }
	  }
	  if (space.terrain == "swamp") {
	    if ([3,5,7,9,11,13,15,17,19].includes(paths_self.game.state.turn)) { 
	      return 1;
	    }
	  }
	  return 0;
	} ,
        onEvent : function(paths_self, faction) { 
	  let space = paths_self.game.spaces[paths_self.game.state.combat.key];
	  if (space.terrain == "mountain") {
	    if ([3,4,7,8,11,12,15,16,19,20].includes(paths_self.game.state.turn)) { 
	      paths_self.game.state.combat.defender_drm += 2;
	    }
	  }
	  if (space.terrain == "swamp") {
	    if ([3,5,7,9,11,13,15,17,19].includes(paths_self.game.state.turn)) { 
	      paths_self.game.state.combat.defender_drm += 2;
	    }
	  }
	  return 1;
	} ,
      }

      deck['cp05'] = { 
        key : 'landwehr',
        img : "cards/card_cp05.svg" ,
        name : "Landwehr" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) { 
	  paths_self.game.queue.push(`rp\tcentral\tcp05`);
	  paths_self.game.queue.push(`landwehr`);
	  return 1;
	} ,
        handleGameLoop : function(paths_self, qe, mv) {
      
          if (mv[0] === "landwehr") {

            paths_self.game.queue.splice(qe, 1);
            let p1 = paths_self.returnPlayerOfFaction("central");

	    let units_to_restore = 2;

	    let loop_fnct = () => {

              paths_self.removeSelectable();
    	      if (units_to_restore > 0) {
    	        //
    	        // players can flip 2 damaged armies back to full strength
    	        //
                paths_self.playerSelectUnitWithFilter(
            	    "Select Unit to Repair / Deploy" ,
          	    filter_fnct ,
          	    execute_fnct ,
          	    null ,
          	    true ,
          	    [{ key : "pass" , value : "pass" }]
                );
	      } else {
        	paths_self.removeSelectable();
        	paths_self.endTurn();
		return 0;
	      }
	    }

    	    let filter_fnct = (spacekey, unit) => {
	       if (paths_self.returnPowerOfUnit(unit) == "allies") { return 0; }
               if (unit.damaged == 1 && unit.destroyed != 1 && unit.army) { return 1; }
	       return 0;
      	    }

	    let execute_fnct = (spacekey, unit_idx) => {
      		paths_self.updateStatus("processing...");
	        if (spacekey === "pass") {
        	  paths_self.removeSelectable();
        	  paths_self.endTurn();
        	  just_stop = 1;
		  units_to_restore = 0;
        	  return 1;
      	        }
        	paths_self.game.spaces[spacekey].units[unit_idx].damaged = 0;
		paths_self.addMove(`NOTIFY\t${paths_self.game.spaces[spacekey].units[unit_idx].name} repaired in ${paths_self.returnSpaceNameForLog(spacekey)}`);
        	paths_self.addMove(`repair\tcentral\t${spacekey}\t${unit_idx}\t${paths_self.game.player}`);
        	paths_self.displaySpace(spacekey);
        	paths_self.shakeSpacekey(spacekey);
		units_to_restore--;
		loop_fnct();
	    } 

	    let count = paths_self.countUnitsWithFilter(filter_fnct);

            if (count == 0) {
	      paths_self.game.queue.push("NOTIFY\tNo eligible units for "+paths_self.popup("cp05"));
	      return 1;
	    }

            if ((count == 1 && units_to_restore >= 1) || (count == 2 && units_to_restore >= 2)) {
    	      let update_filter_fnct = (spacekey, unit) => {
	        if (paths_self.returnPowerOfUnit(unit) == "allies") { return 0; }
                if (unit.damaged == 1 && unit.destroyed != 1) {
		  unit.damaged = 0; paths_self.displaySpace(spacekey);
		  paths_self.updateLog(`${unit.name} repaired in ${paths_self.game.spaces[spacekey].name}`);
        	  paths_self.shakeSpacekey(spacekey);
		}
	        return 1;
	      }
	      // filter function will update now
	      paths_self.countUnitsWithFilter(update_filter_fnct);
	      return 1;
	    }

	    if (paths_self.game.player == p1) {
	      loop_fnct();
	    } else {
	      paths_self.updateStatus("Central Powers playing " + paths_self.popup("cp05"));
	    }
            return 0;
          } 
          
	  return 1;
	}
      }

      deck['cp06'] = { 
        key : 'entrench',
        img : "cards/card_cp06.svg" ,
        name : "Entrench" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.events.entrench == 1) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) { 

	  paths_self.game.state.events.entrench = 1;

	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {

	    //
	    // get eligible spaces
	    //
    	    let options = paths_self.returnSpacesWithFilter(
      		(key) => {
		  if (paths_self.game.spaces[key].trench > 0) { return 0; }
        	  if (paths_self.game.spaces[key].control == "central") {
        	    if (paths_self.game.spaces[key].units.length > 0) {
                      if (paths_self.checkSupplyStatus("central", key)) {
		        return 1;
		      }
		    }
		  }
		} ,
            );

	    //
	    // no placement options
	    //
	    if (options.length == 0) {
	      paths_self.addMove("NOTIFY\tNo Valid Central Entrechment Options");
	      paths_self.endTurn();
	      return 0;
	    }

	    //
	    // place a trench
	    //
            paths_self.playerSelectSpaceWithFilter(
              "Add Level 1 Trench Where? ",
              (key) => {
          	if (options.includes(key)) { return 1; }
              },
              (key) => {
		paths_self.updateStatus("processing...");
 		paths_self.addMove("entrench\tcentral\t"+key);
 		paths_self.endTurn();
		return 0;
	      },
              null, 
              true
            );
	  }

	  return 0;

	} ,
      }

      deck['cp07'] = { 
        key : 'germanreinforcements',
        img : "cards/card_cp07.svg" ,
        name : "German Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.central_reinforcements_ge > 0) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tcentral_reinforcements_ge\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("central", ["ge_army09"], "germany");
	  }
	  return 0;
	} ,
      }

      deck['cp08'] = { 
        key : 'racetothesea',
        img : "cards/card_cp08.svg" ,
        name : "Race to the Sea" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) { 
	  paths_self.game.state.events.race_to_the_sea = 1; 
	  return 1;
	} ,
      }

      deck['cp09'] = { 
        key : 'reichstagtruce',
        img : "cards/card_cp09.svg" ,
        name : "Reichstag Truce" ,
        cc : false ,
	ws : 1 ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.general_records_track.central_war_status > 10) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
          paths_self.game.state.events.reichstag_truce = 1;
	  paths_self.displayGeneralRecordsTrack();
          return 1;
        } ,
      }

      deck['cp10'] = { 
        key : 'sudarmy',
        img : "cards/card_cp10.svg" ,
        name : "Sud Army" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) { 
	  paths_self.game.state.events.sudarmy = 1;  
	  return 1;
	} ,
      }

      deck['cp11'] = { 
        key : 'oberost',
        img : "cards/card_cp11.svg" ,
        name : "Oberost" ,
        cc : false ,
	ws : 1 ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.events.oberost = 1;
	  return 1;
	} ,
      }

      deck['cp12'] = { 
        key : 'germanreinforcements',
        img : "cards/card_cp12.svg" ,
        name : "German Reinforcements" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.central_reinforcements_ge > 0) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tcentral_reinforcements_ge\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("central", ["ge_corps","ge_corps","ge_army10"], "germany");
	  }
	  return 0;
	} ,
      }

      deck['cp13'] = { 
        key : 'falkenhayn',
        img : "cards/card_cp13.svg" ,
        name : "Falkenhayn" ,
        cc : false ,
	ws : 2 ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { 
	  if (paths_self.game.state.turn >= 3) { return 1; }
	  if (paths_self.game.state.events.moltke == 1) { return 1; }
	  return 0; 
        } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.events.falkenhayn = 1;
	  return 1;
	} ,
      }

      deck['cp14'] = { 
        key : 'austria-hungaryreinforcements',
        img : "cards/card_cp14.svg" ,
        name : "Austria-Hungary Reinforcements" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.central_reinforcements_ah > 0) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tcentral_reinforcements_ah\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("central", ["ah_army07","ah_corps","ah_corps"], "austria");
	  }
	  return 0;
	} ,
      }


    }

    for (let key in deck) {
      if (!deck[key].ws) { deck[key].ws = 0; }
    }

    return deck;
  }

  returnLimitedWarDeck(type="all") {

    let deck = {};

    if (type == "allies" || type == "all") {

deck['ap15'] = { 
        key : 'britishreinforcements',
        img : "cards/card_ap15.svg" ,
        name : "British Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.allies_reinforcements_br > 0) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tallies_reinforcements_br\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("allies", ["br_army04","br_corps"], "england");
	  }
	  return 0;
	} ,
      }

deck['ap16'] = { 
        key : 'romania',
        img : "cards/card_ap16.svg" ,
        name : "Romania" ,
        cc : false ,
	ws : 1 ,
        ops : 5 ,
        sr : 5 ,        
        rp : { 'A' : 1 , 'BR' : 3 , 'FR' : 3 , 'IT' : 2 , 'RU' : 4 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.neutral_entry == 0) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.convertCountryToPower("romania", "allies");
	  paths_self.game.state.events.romania = true;
	  paths_self.game.state.events.neutral_entry = 1;
	  paths_self.addUnitToSpace("ro_corps", "bucharest");
	  paths_self.addUnitToSpace("ro_corps", "bucharest");
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.playerPlaceUnitOnBoard("romania", ["ro_corps", "ro_corps", "ro_corps", "ro_corps"], () => {
	      paths_self.addMove("SETVAR\tstate\tneutral_entry\t1");
	      paths_self.endTurn();
	    });
	  } else {
	    paths_self.updateStatus("Romania entering war...");
	  }

          paths_self.displayCustomOverlay({
                text : "Romania joins the Allies" ,
                title : "Romania joins the War!",
                img : "/paths/img/backgrounds/entry/romania-enters-the-war.png",
                msg : "Romanian units added to board...",
                styles : [{ key : "backgroundPosition" , val : "bottom" }],
          });
	  return 0;
	} ,
      }

deck['ap17'] = { 
        key : 'italy',
        img : "cards/card_ap17.svg" ,
        name : "Italy" ,
        cc : false ,
	ws : 2 ,
        ops : 5 ,
        sr : 5 ,        
        rp : { 'A' : 1 , 'BR' : 3 , 'FR' : 3 , 'RU' : 4 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.neutral_entry == 0) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {

	  paths_self.convertCountryToPower("italy", "allies");
          paths_self.addTrench("trent", 1);
          paths_self.addTrench("asiago", 1);
          paths_self.addTrench("maggiore", 1);

	  paths_self.game.state.events.italy = true;
	  paths_self.game.state.neutral_entry = 1;

	  paths_self.addUnitToSpace("it_corps", "arbox");
	  paths_self.addUnitToSpace("it_corps", "arbox");
	  paths_self.addUnitToSpace("it_corps", "arbox");

	  paths_self.addUnitToSpace("it_corps", "turin");

	  paths_self.addUnitToSpace("it_army01", "verona");
	  paths_self.addUnitToSpace("it_army04", "asiago");
	  paths_self.addUnitToSpace("it_army03", "maggiore");
	  paths_self.addUnitToSpace("it_army02", "udine");
	  paths_self.addUnitToSpace("it_corps", "rome");
	  paths_self.addUnitToSpace("it_corps", "taranto");

          paths_self.displayCustomOverlay({
                text : "Italy joins the Allied Powers" ,
                title : "Italy joins the War!",
                img : "/paths/img/backgrounds/entry/italy-enters-the-war.png",
                msg : "Italian units added to board...",
                styles : [{ key : "backgroundPosition" , val : "bottom" }],
          });

	  return 1;
	} ,
      }


deck['ap18'] = { 
        key : 'hurricanebarrage',
        img : "cards/card_ap18.svg" ,
        name : "Hurricane Barrage" ,
        cc : true ,
        ops : 2 ,
        sr : 2 , 
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
        canEvent : function(paths_self, faction) { 
          let attacker_units = paths_self.returnAttackerUnits();
          for (let i = 0; i < attacker_units.length; i++) {
            if (attacker_units[i].ckey == "BR") { return 1; }
          }
          return 0;
        } ,
	onEvent : function(paths_self, faction) {
          let attacker_units = paths_self.returnAttackerUnits();
          for (let i = 0; i < attacker_units.length; i++) {
            if (attacker_units[i].ckey == "BR") { paths_self.game.state.combat.attacker_drm++; return 1; }
          }
          return 1;  
        } ,   
      }

deck['ap19'] = { 
        key : 'airsuperiority',
        img : "cards/card_ap19.svg" ,
        name : "Air Superiority" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
        canEvent : function(paths_self, faction) {
          let attacker_units = paths_self.returnAttackerUnits();
          for (let i = 0; i < attacker_units.length; i++) {
            if (attacker_units[i].ckey == "BR" || attacker_units[i].ckey == "FR") { return 1; }
          }
          return 0;
	} ,
        onEvent : function(paths_self, faction) {
          let attacker_units = paths_self.returnAttackerUnits();
          for (let i = 0; i < attacker_units.length; i++) {
            if (attacker_units[i].ckey == "BR" || attacker_units[i].ckey == "FR") { paths_self.game.state.combat.attacker_drm++; return 1; }
          }
          return 1;  
        } ,   
      }

deck['ap20'] = { 
        key : 'britishreinforcements',
        img : "cards/card_ap20.svg" ,
        name : "British Reinforcements" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.allies_reinforcements_br > 0) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tallies_reinforcements_br\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("allies", ["cad_corps", "aus_corps"], "england");
	  }
	  return 0;
	} ,
      }


deck['ap21'] = { 
        key : 'phosgenegas',
        img : "cards/card_ap21.svg" ,
        name : "Phosgene Gas" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { 
          let attacker_units = paths_self.returnAttackerUnits();
          for (let i = 0; i < attacker_units.length; i++) {
            if (attacker_units[i].ckey == "FR") { return 1; }
          }
          return 0;
	} ,
        onEvent : function(paths_self, faction) {
          let attacker_units = paths_self.returnAttackerUnits();
          for (let i = 0; i < attacker_units.length; i++) {
            if (attacker_units[i].ckey == "FR") { paths_self.game.state.combat.attacker_drm++; return 1; }
          }
          return 1;  
        } ,   
      }

deck['ap22'] = { 
        key : 'italianreinforcements',
        img : "cards/card_ap22.svg" ,
        name : "Italian Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.events.italy && paths_self.game.state.allies_reinforcements_it == 0) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tallies_reinforcements_it\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("allies", ["it_army05"], "italy");
	  }
	  return 0;
	} ,
      }

deck['ap23'] = { 
        key : 'cloakanddagger',
        img : "cards/card_ap23.svg" ,
        name : "Cloak And Dagger" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.queue.push("cloak_and_dagger");
	  return 1;
	} ,
        handleGameLoop : function(paths_self, qe, mv) {
      
          if (mv[0] === "cloak_and_dagger") {

            paths_self.game.queue.splice(qe, 1);

            let p1 = paths_self.returnPlayerOfFaction("central");
	    if (paths_self.game.player == p1) {
              paths_self.addMove("cloak_and_dagger_results\t"+JSON.stringify(paths_self.game.deck[0].hand));
              paths_self.endTurn();
	    } else {
	      paths_self.updateStatus("opponent revealing hand...");
	    }
            return 0;
          } 
          
          if (mv[0] === "cloak_and_dagger_results") {

            paths_self.game.queue.splice(qe, 1);

	    let hand = JSON.parse(mv[1]);

	    let html = "Central Powers: ";
	    for (let z = 0; z < hand.length; z++) { html += paths_self.popup(hand[z]); }
	    paths_self.updateLog(html);

	    paths_self.game.queue.push("player_play_ops\tallies\tap23\t");

	    return 1;
          } 
          
          return 1;
        }
      }

deck['ap24'] = { 
        key : 'frenchreinforcements',
        img : "cards/card_ap24.svg" ,
        name : "French Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.allies_reinforcements_fr == 0) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tallies_reinforcements_fr\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("allies", ["fr_army07"], "france");
	  }
	  return 0;
	} ,
      }

deck['ap25'] = { 
        key : 'russianreinforcements',
        img : "cards/card_ap25.svg" ,
        name : "Russian Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.allies_reinforcements_ru == 0) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tallies_reinforcements_ru\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("allies", ["ru_corps", "ru_corps", "ru_army07"], "russia");
	  }
	  return 0;
	} ,
      }

deck['ap26'] = { 
        key : 'lusitania',
        img : "cards/card_ap26.svg" ,
        name : "Lusitania" ,
        cc : false ,
	ws : 2 ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.events.blockade && !paths_self.game.state.events.zimmerman_telegram) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.events.lusitania = 1;
	  paths_self.displayGeneralRecordsTrack();
	  return 1;
	} ,
      }

deck['ap27'] = { 
        key : 'greatretreat',
        img : "cards/card_ap27.svg" ,
        name : "Great Retreat" ,
        cc : false ,
	ws : 1 ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) { paths_self.game.state.events.great_retreat = 1; return 1; } ,
      }


deck['ap28'] = { 
        key : 'landships',
        img : "cards/card_ap28.svg" ,
        name : "Landships" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1, 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) { paths_self.game.state.events.landships = 1; return 1; } ,
      }

deck['ap29'] = { 
        key : 'yudenitch',
        img : "cards/card_ap29.svg" ,
        name : "Yudenitch" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1, 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) {

	  //
	  // near east spaces
	  //
	  let nespaces = ["constantinople","bursa","adapazari","sinope","eskidor","ankara","samsun","giresun","trebizond","sivas","erzingan","kharput","kayseri","konya","rize","erzerum","bitlis","diyarbakir","adana","aleppo","urfa","mardin","potl","grozny","petrovsk","tbilisi","elizabethpol","baku","erivan","kars","batum","eleskirt","van","mosul","kirkuk","dilman","tabriz","hamadan","kermanshah","khorramabad","abwaz","basra","qurna","kut","annasiriya","samawah","baghdad","beirut","damascus","nablus","amman","jerusalem","beersheba","arabia","medina","aqaba","sinai","gaza","cairo","portsaid","alexandria","libya"];

	  //
	  // supplied Russian spaces
	  //
	  let russian_spaces = paths_self.returnSpacekeysByCountry("russia");
	  for (let z = russian_spaces.length-1; z >= 0; z--) {
	    if (!nespaces.includes(russian_spaces[z])) {
	      russian_spaces.splice(z, 1);
	    } else {
	      if (paths_self.game.spaces[russian_spaces[z]].control != "allies") {
	        russian_spaces.splice(z, 1);
	      } else {
	        if (!paths_self.checkSupplyStatus("ru", russian_spaces[z])) {
		  russian_spaces.splice(z, 1);
	        }
	      }
	    }
	  }

	  if (russian_spaces.length == 0) {
	    paths_self.updateLog("No in-supply Russian spaces...");
	    return 1;
	  }

	  if (paths_self.game.player == paths_self.returnPlayerOfFaction("allies")) {
  	    paths_self.playerPlaceUnitInSpacekey(russian_spaces, ["cau_army"], () => {
	      paths_self.endTurn();
	    });
	  } else {
	    paths_self.updateStatus("Russia placing unit...");
	  }       

	  return 0;
	} ,
      }


deck['ap30'] = { 
        key : 'salonika',
        img : "cards/card_ap30.svg" ,
        name : "Salonika" ,
        cc : false ,
	ws : 1 ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1, 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) {

	  paths_self.game.state.events.salonika = 1;

	  if (paths_self.game.state.events.greece != 1) {
	    paths_self.addUnitToSpace("gr_corps", "florina");
	    paths_self.addUnitToSpace("gr_corps", "athens");
	    paths_self.addUnitToSpace("gr_corps", "larisa");
	  }

	  //
	  // 9.3.3 - rhe play of the Salonika event counts as an SR play for purposes of this rule.
	  //
	  paths_self.game.state.central_rounds[paths_self.game.state.central_rounds.length-1] = "sr";

	  let p = paths_self.returnPlayerOfFaction("allies");
          let just_stop = 0;

	  if (paths_self.game.player == p) {

	    //
	    // count max units movable
	    //
	    let max_units_movable = 3;
	    max_units_movable -= paths_self.game.spaces["salonika"].units.length;
	    if (max_units_movable <= 0) { paths_self.endTurn(); return 0; }

            let loop_fnct = () => {
              if (continue_fnct()) {
        	paths_self.playerSelectUnitWithFilter(
        	  "Select Corps for Salonika?" ,
        	  filter_fnct ,
        	  execute_fnct ,
        	  null ,
        	  true ,
        	  [{ key : "pass" , value : "pass" }]
        	);
      	      }
    	    }

    	    let filter_fnct = (spacekey, unit) => {
	      if (spacekey == "arbox") {
		for (let z = 0; z < paths_self.game.spaces["arbox"].units.length; z++) {
		  if (paths_self.game.spaces["arbox"].units[z].corps) { return 1; }
		}
	      }
	      if (paths_self.game.spaces[spacekey].port.length > 0) { if (unit.corps) { return 1; } }
	      return 0;
	    };

    	    let continue_fnct = () => {
  	      if (just_stop == 1) { return 0; }
	      let count = paths_self.countUnitsWithFilter(filter_fnct);
	      if (count == 0) { return 0; }
	      for (let key in paths_self.game.state.rp[faction]) {
	        if (parseInt(paths_self.game.state.rp[faction][key]) > 0) { return 1; }
	      } 
	      return 0;
	    }

	    let execute_fnct = (spacekey, unit_idx) => {
	      paths_self.updateStatus("processing...");
	      if (spacekey === "pass") {
	        paths_self.removeSelectable();
	        paths_self.endTurn();
	        just_stop = 1;
	        return 1;
	      } 
	      paths_self.moveUnit(spacekey, unit_idx, "salonika");
	      paths_self.prependMove(`move\t${faction}\t${spacekey}\t${unit_idx}\tsalonika\t${paths_self.game.player}`);
	      paths_self.displaySpace(spacekey);
	      paths_self.displaySpace("salonika");
	      loop_fnct();
	    }

	    loop_fnct();

	  } else {
	    paths_self.updateLog("Allies playing Salonika...");
	  }

	  return 0;
	} ,
      }


deck['ap31'] = { 
        key : 'mef',
        img : "cards/card_ap31.svg" ,
        name : "Middle-East Force" ,
        cc : false ,
	ws : 1 ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1, 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { 
	  if (paths_self.game.state.events.salonika != 1 && paths_self.game.state.events.turkey == 1) { return 1; }
	  return 0; 
	} ,
        onEvent : function(paths_self, faction) {

	  paths_self.game.state.events.mef = 1;
	  paths_self.game.state.events.mef_beachhead = "";

	  if (paths_self.game.player == paths_self.returnPlayerOfFaction("allies")) {
	    let filter_fnct = (spacekey) => {
	      if (paths_self.game.spaces[spacekey].control == "central") { return 0; }
	      if (spacekey == "gallipoli") { return 1; }
	      if (spacekey == "canakale") { return 1; }
	      if (spacekey == "izmir") { return 1; }
	      if (spacekey == "adana") { return 1; }
	      return 0;
	    }
	    let count = paths_self.countUnitsWithFilter(filter_fnct);
	    if (count == 0) {
	      paths_self.addMove("NOTIFY\tNo viable placements for Middle-East Force");
	      paths_self.endTurn();
	      return 0;
	    }

            paths_self.playerSelectSpaceWithFilter(
              "Place MEF Where? " ,
              filter_fnct ,
              (key) => {
		paths_self.updateStatus("processing...");
 		paths_self.addMove("mef_placement\t"+key);
 		paths_self.endTurn();
		return 0;
	      },
              null , 
	      true 
	    );

	    return 0;

	  } else {
	    paths_self.updateStatus("Allies placing MEF...");
	  }	
	  return 0;
	},
      }

deck['ap32'] = { 
        key : 'russianreinforcements',
        img : "cards/card_ap32.svg" ,
        name : "Russian Reinforcements" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.allies_reinforcements_ru == 0) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tallies_reinforcements_ru\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("allies", ["ru_army12"], "russia");
	  }
	  return 0;
        } ,
      }

deck['ap33'] = { 
        key : 'grandfleet',
        img : "cards/card_ap33.svg" ,
        name : "Grand Fleet" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.event.grand_fleet = 1;
	  if (paths_self.game.state.event.high_seas_fleet > 1) {
	    paths_self.game.state.event.high_seas_fleet = 0;
	  }
	  return 1;
	} ,
      }

deck['ap34'] = { 
        key : 'britishreinforcements',
        img : "cards/card_ap34.svg" ,
        name : "British Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.allies_reinforcements_br > 0) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tallies_reinforcements_br\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("allies", ["br_corps", "br_army03", "br_corps"], "england");
	  }
	  return 0;
        } ,
      }
    }

    if (type == "central" || type == "all") {

      deck['cp15'] = { 
        key : 'chlorinegas',
        img : "cards/card_cp15.svg" ,
        name : "Chlorine Gas" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { 
          let attacker_units = paths_self.returnAttackerUnits();
          for (let i = 0; i < attacker_units.length; i++) {
            if (attacker_units[i].ckey == "GE") { return 1; }
          }
          return 0;
	} ,
        onEvent : function(paths_self, faction) {
          let attacker_units = paths_self.returnAttackerUnits();
          for (let i = 0; i < attacker_units.length; i++) {
            if (attacker_units[i].ckey == "GE") { paths_self.game.state.combat.attacker_drm++; return 1; }
          }   
          return 1;
        } , 
      }

  deck['cp16'] = { 
        key : 'limanvonsanders',
        img : "cards/card_cp16.svg" ,
        name : "Liman Von Sanders" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) {
          let attacker_units = paths_self.returnAttackerUnits();
          let defender_units = paths_self.returnDefenderUnits();
          for (let i = 0; i < attacker_units.length; i++) {
            if (attacker_units[i].ckey === "RU") { return 1; }
          } 
          for (let i = 0; i < defender_units.length; i++) {
            if (defender_units[i].ckey === "RU") { 1; }
          }
          return 0;
	} ,
        onEvent : function(paths_self, faction) {
          let attacker_units = paths_self.returnAttackerUnits();
          let defender_units = paths_self.returnDefenderUnits();
          for (let i = 0; i < attacker_units.length; i++) {
            if (attacker_units[i].ckey === "RU") { paths_self.game.state.combat.attacker_drm++; return 1; }
          } 
          for (let i = 0; i < defender_units.length; i++) {
            if (defender_units[i].ckey === "RU") { paths_self.game.state.combat.defender_drm++; return 1; }
          }
          return 1;
        } ,
      }

  deck['cp17'] = { 
        key : 'matahari',
        img : "cards/card_cp17.svg" ,
        name : "Mata Hari" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) {
          paths_self.game.queue.push("matahari");
	  return 1;
        } , 
        handleGameLoop : function(paths_self, qe, mv) {
          if (mv[0] === "matahari") {
        
            paths_self.game.queue.splice(qe, 1);
        
            let p1 = paths_self.returnPlayerOfFaction("allies"); 
            if (paths_self.game.player == p1) {
              paths_self.addMove("matahari_results\t"+JSON.stringify(paths_self.game.deck[1].hand));
              paths_self.endTurn();
            } else {
              paths_self.updateStatus("opponent revealing hand...");
            }
            return 0;
          }
          
          if (mv[0] === "matahari_results") {
        
            paths_self.game.queue.splice(qe, 1);

            let hand = JSON.parse(mv[1]);

            let html = "Allied Powers: ";
            for (let z = 0; z < hand.length; z++) { html += paths_self.popup(hand[z]); }
            paths_self.updateLog(html);

            paths_self.game.queue.push("player_play_ops\tcentral\tcp17\t");

            return 1;
          }

          return 1;
        }
      }

  deck['cp18'] = { 
        key : 'fortifiedmachineguns',
        img : "cards/card_cp18.svg" ,
        name : "Fortified Machine Guns" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
        canEvent : function(paths_self, faction) {
          let defender_units = paths_self.returnDefenderUnits();
          for (let i = 0; i < defender_units.length; i++) {
            if (defender_units[i].ckey === "GE") { 
	      if (paths_self.game.spaces[paths_self.game.state.combat.key].trench > 0) { return 1; }
            }
          }
          return 0;
	} ,
        onEvent : function(paths_self, faction) {
          let defender_units = paths_self.returnDefenderUnits();
          for (let i = 0; i < defender_units.length; i++) {
            if (defender_units[i].ckey === "GE") { 
	      if (paths_self.game.spaces[paths_self.game.state.combat.key].trench > 0) { paths_self.game.state.combat.defender_drm++; return 1; }
            }
          }
          return 1;
        } , 
      }

  deck['cp19'] = { 
        key : 'flamethrowers',
        img : "cards/card_cp19.svg" ,
        name : "Flamethrowers" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { 
          let attacker_units = paths_self.returnAttackerUnits();
          for (let i = 0; i < attacker_units.length; i++) {
            if (attacker_units[i].ckey == "GE") { return 1; }
          }   
          return 1;
	} ,
        onEvent : function(paths_self, faction) {
          let attacker_units = paths_self.returnAttackerUnits();
          for (let i = 0; i < attacker_units.length; i++) {
            if (attacker_units[i].ckey == "GE") { paths_self.game.state.combat.attacker_drm++; return 1; }
          }   
          return 1;
        } , 
      }


  deck['cp20'] = { 
        key : 'austria-hungaryreinforcements',
        img : "cards/card_cp20.svg" ,
        name : "Austria-Hungary Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.central_reinforcements_ah > 0) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tcentral_reinforcements_ah\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("central", ["ah_army10"], "austria");
	  }
          return 0;
        } ,
      }

  deck['cp21'] = { 
        key : 'germanreinforcements',
        img : "cards/card_cp21.svg" ,
        name : "German Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.central_reinforcements_ge > 0) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tcentral_reinforcements_ge\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("central", ["ge_corps","ge_army11"], "germany");
	  }
          return 0;
        } ,
      }

  deck['cp22'] = { 
        key : 'germanreinforcements',
        img : "cards/card_cp22.svg" ,
        name : "German Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.central_reinforcements_ge > 0) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tcentral_reinforcements_ge\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("central", ["ge_army12","ge_corps"], "germany");
	  }
          return 0;
        } ,
      }


  deck['cp23'] = { 
        key : 'austria-hungaryreinforcements',
        img : "cards/card_cp23.svg" ,
        name : "Austria-Hungary Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.central_reinforcements_ah > 0) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tcentral_reinforcements_ah\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("central", ["ah_army11"], "austria");
	  }
          return 0;
        } ,
      }

  deck['cp24'] = { 
        key : 'libyanrevolts(tureinforcements)',
        img : "cards/card_cp24.svg" ,
        name : "Libyan Revolt (Tu Reinforcements)" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) {
          paths_self.addUnitToSpace("sn_corps", "libya");
	  paths_self.game.state.events.libyan_revolt = 1;
          return 1;
        } ,
      }

  deck['cp25'] = { 
        key : 'highseasfleet',
        img : "cards/card_cp25.svg" ,
        name : "High Seas Fleet" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) { paths_self.game.state.events.high_seas_fleet = 3; return 1; } ,
      }

deck['cp26'] = { 
        key : 'placeofexecution',
        img : "cards/card_cp26.svg" ,
        name : "Place of Execution" ,
        cc : true ,
	ws : 1 ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { 
	  if (faction == "defender" || faction == "attacker") { if (paths_self.game.state.events.hl_take_command) { return 0; } return 1; }
	  for (let key in paths_self.game.spaces) {
	    if (paths_self.game.spaces[key].country == "france" && paths_self.game.spaces[key].fort > 0) {
	      return 0;
	    }
	  }
	  return 1;
	}  ,
        onEvent : function(paths_self, faction) {
	  //
	  // indicates play as combat card
	  //
	  if (faction == "defender" || faction == "attacker") {
            let attacker_units = paths_self.returnAttackerUnits();
	    if (paths_self.game.spaces[paths_self.game.state.combat.key].fort > 0) {
              for (let i = 0; i < attacker_units.length; i++) {
                if (attacker_units[i].ckey === "GE") { paths_self.game.state.combat.attacker_drm++; return 1; }
              }
	    }
	  } else {
	    //
	    // indicates play as event for war status points
	    //
	  }
          return 1;
        } ,
      }

  deck['cp27'] = { 
        key : 'zeppelinraids',
        img : "cards/card_cp27.svg" ,
        name : "Zeppelin Raids" ,
        cc : false ,
	ws : 1 ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) { paths_self.game.state.events.zeppelin_raids = 1; return 1; } ,
      }

  deck['cp28'] = { 
        key : 'tsartakescommand',
        img : "cards/card_cp28.svg" ,
        name : "Tsar Takes Command" ,
        cc : false ,
	ws : 1 ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.russian_capitulation_track == 3) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.events.tsar_takes_command = 1;
	  return 1;
	} ,
      }

  deck['cp29'] = { 
        key : '11tharmy',
        img : "cards/card_cp29.svg" ,
        name : "11th Army" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.events.eleventh_army = 1;
          return 1;
        } ,
      }

deck['cp30'] = { 
        key : 'alpenkorps',
        img : "cards/card_cp30.svg" ,
        name : "Alpenkorps" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
        canEvent : function(paths_self, faction) {
	  let attacker_units = paths_self.returnAttackerUnits();
	  let defender_units = paths_self.returnDefenderUnits();
	  for (let i = 0; i < attacker_units.length; i++) {
	    if (attacker_units[i].ckey == "GE" && (paths_self.game.spaces[attacker_units[i].spacekey].terrain === "mountain" || paths_self.game.spaces[paths_self.game.state.combat.key].terrain === "mountain")) { return 1; }
	  }
	  return 0; 
	} ,
        onEvent : function(paths_self, faction) {
	  let attacker_units = paths_self.returnAttackerUnits();
	  let defender_units = paths_self.returnDefenderUnits();
	  for (let i = 0; i < attacker_units.length; i++) {
	    if (attacker_units[i].ckey == "GE" && (paths_self.game.spaces[attacker_units[i].spacekey].terrain === "mountain" || paths_self.game.spaces[paths_self.game.state.combat.key].terrain === "mountain")) { paths_self.game.state.combat.attacker_drm++; return 1; }
	  }
	  return 1; 
	} ,
      }

deck['cp31'] = { 
        key : 'kemal',
        img : "cards/card_cp31.svg" ,
        name : "Kemal" ,
        cc : true ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

deck['cp32'] = { 
        key : 'warinafrica',
        img : "cards/card_cp32.svg" ,
        name : "War in Africa" ,
        cc : false ,
	ws : 1 ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) { 

	  if (paths_self.returnPlayerOfFaction("allies") == paths_self.game.player) {

    	    let filter_fnct = (spacekey, unit) => {
	      if (spacekey == "aeubox") { return 0; }
	      if (unit.army && unit.damaged == 0 && unit.ckey == "BR") { return 1; }
	    }
    	    let filter_fnct2 = (spacekey, unit) => {
	      if (spacekey == "aeubox") { return 0; }
	      if (unit.army && unit.damaged == 0 && unit.ckey == "BR") { return 0; }
	    }

	    let execute_fnct = (spacekey, unit_idx) => {
	      paths_self.updateStatus("processing...");
	      if (spacekey === "pass") {
	        paths_self.removeSelectable();
	        paths_self.endTurn();
	        return 1;
	      }
	      paths_self.addMove(`eliminate\t${spacekey}\t${unit_idx}`);
	      paths_self.endTurn();
	      return 1;
	    }

	    //
	    //
	    //
	    let count = paths_self.countUnitsWithFilter(filter_fnct);
	    if (count == 0) {
	      filter_fnct = filter_fnct2;
	      count = paths_self.countUnitsWithFilter(filter_fnct);
	    }
	    if (count == 0) {
	      return 0;
	    }

	    //
	    // should they remove 
	    //
    	    let html = `<ul>`;
    	    html    += `<li class="card" id="remove">remove BR corps</li>`;
    	    html    += `<li class="card" id="vp">cede +1 VP</li>`;
    	    html    += `</ul>`; 

    	    this.updateStatusWithOptions(`War in Africa!`, html);
    	    this.attachCardboxEvents((action) => {
    
      	      if (action === "remove") {
                paths_self.playerSelectUnitWithFilter(
          	  "Select BR Army to Remove" ,
        	  filter_fnct2 ,
        	  execute_fnct ,
        	  null ,
        	  true ,
        	  [{ key : "pass" , value : "pass" }]
                );

    	        return;
    	      }

    	      if (action === "vp") {
	        paths_self.addMove("SETVAR\tstate\tevents\twar_in_africa_vp\t1");
	        paths_self.endTurn();
    	      }
 
    	    });

	  } else {
	    paths_self.updateStatus("Allies playing War in Africa");
	  }

	  return 0;
	} ,
      }

deck['cp33'] = { 
        key : 'walterrathenau',
        img : "cards/card_cp33.svg" ,
        name : "Walter Rathenau" ,
        cc : false ,
	ws : 2 ,
        ops : 5 ,
        sr : 5 ,        
        rp : { 'AH' : 3 , 'BU' : 1 , 'GE' : 4 , 'TU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.events.walter_rathenau = 1;
	}
      }
   deck['cp34'] = { 
        key : 'bulgaria',
        img : "cards/card_cp34.svg" ,
        name : "Bulgaria" ,
        cc : false ,
	ws : 2 ,
        ops : 5 ,
        sr : 5 ,        
        rp : { 'AH' : 3 , 'GE' : 4 , 'TU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.neutral_entry == 0) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.convertCountryToPower("bulgaria", "central");
	  paths_self.game.state.events.neutral_entry = 1;
	  paths_self.game.state.events.romania = true;
	  paths_self.addUnitToSpace("bu_corps", "sofia");
	  paths_self.addUnitToSpace("bu_corps", "sofia");
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.playerPlaceUnitOnBoard("romania", ["bu_corps", "bu_corps", "bu_corps", "bu_corps"], () => {
	      paths_self.addMove("SETVAR\tstate\tneutral_entry\t1");
	      paths_self.endTurn();
	    });
	  } else {
	    paths_self.updateStatus("Bulgaria entering war...");
	  }

          paths_self.displayCustomOverlay({
                text : "Bulgaria joins the Central Powers" ,
                title : "Bulgaria joins the War!",
                img : "/paths/img/backgrounds/entry/bulgaria-enters-the-war.png",
                msg : "Bulgarian units added to board...",
                styles : [{ key : "backgroundPosition" , val : "bottom" }],
          });

	  return 0;
	} ,
      }


    }
    return deck;
  }

  returnTotalWarDeck(type="all") {
    let deck = {};

    if (type == "allies" || type == "all") {

deck['ap35'] = { 
        key : 'yanksandtanks',
        img : "cards/card_ap35.svg" ,
        name : "Yanks And Tanks" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.queue.push("player_play_ops\tallies\tap35\t");
	  paths_self.game.state.events.yanks_and_tanks = 1;
	  return 1;

	} ,
      }

deck['ap36'] = { 
        key : 'mineattack',
        img : "cards/card_ap36.svg" ,
        name : "Mine Attack" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.events.mine_attack != 1) { 

	  let space = paths_self.game.spaces[paths_self.game.state.combat.key];
	  let valid_defender = 0;
	  let valid_attacker = 0;

	  if (space.trench > 0) {
	    let attacker_units = paths_self.returnAttackerUnits();
	    for (let i = 0; i < attacker_units.length; i++) {
	      if (attacker_units[i].ckey == "BR") { return 1; }
	    }
	  }

	} return 0; } ,
        onEvent : function(paths_self, faction) {

	  if (paths_self.game.state.events.mine_attack == 1) { return 1; }
	  paths_self.game.state.events.mine_attack = 1; // already used this turn

	  let space = paths_self.game.spaces[paths_self.game.state.combat.key];
	  let valid_defender = 0;
	  let valid_attacker = 0;

	  if (space.trench > 0) {
	    let attacker_units = paths_self.returnAttackerUnits();
	    for (let i = 0; i < attacker_units.length; i++) {
	      if (attacker_units[i].ckey == "BR") { paths_self.game.state.combat.attacker_drm++; return 1; }
	    }
	  }

	  return 1;

	} ,
      }

deck['ap37'] = { 
        key : 'independentairforce',
        img : "cards/card_ap37.svg" ,
        name : "Independent Air Force" ,
        cc : false ,
	ws : 1 ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) { 
	  paths_self.game.state.events.independent_air_force = 1;
	  return 1;
	} ,
      }

deck['ap38'] = { 
        key : 'usareinforcements',
        img : "cards/card_ap38.svg" ,
        name : "USA Reinforcements" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.events.over_there == 1) { return 1; } return 0;  } ,
        onEvent : function(paths_self, faction) { return 1; 
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tallies_reinforcements_us\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("allies", ["us_corps"], "usa");
	  }
	  return 0;
	} ,
      }

deck['ap39'] = { 
        key : 'theyshallnotpass',
        img : "cards/card_ap39.svg" ,
        name : "They Shall Not Pass" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) { paths_self.game.state.events.they_shall_not_pass = 1; return 1; } ,
      }

deck['ap40'] = { 
        key : '14points',
        img : "cards/card_ap40.svg" ,
        name : "14 Points" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.events.fourteen_points = 1;
	  return 1;
	} ,
      }

deck['ap41'] = { 
        key : 'arabnorthernarmy',
        img : "cards/card_ap41.svg" ,
        name : "Arab Northern Army" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.events.turkey == 1) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {
	  let options = [];
	  for (let key in paths_self.game.spaces) { if (paths_self.game.spaces[key].country == "arabia") { options.push(key); } }
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.playerAddReinforcements("allies", ["ana_corps"], "england", options);
	  }
	  return 0;
        } ,
      }

deck['ap42'] = { 
        key : 'britishreinforcements',
        img : "cards/card_ap42.svg" ,
        name : "British Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.allies_reinforcements_br > 0) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tallies_reinforcements_br\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("allies", ["br_army05","br_corps", "pt_corps"], "england");
	  }
	  return 0;
	} ,
      }

deck['ap43'] = { 
        key : 'usareinforcements',
        img : "cards/card_ap43.svg" ,
        name : "USA Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.events.over_there == 1) { return 1; } return false; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tallies_reinforcements_us\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("allies", ["us_army01","us_corps", "us_corps"], "usa");
	  }
	  return 0;
	} ,
      }

deck['ap44'] = { 
        key : 'greece',
        img : "cards/card_ap44.svg" ,
        name : "Greece" ,
        cc : false ,
	ws : 1 ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.neutral_entry == 0) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {

	  paths_self.convertCountryToPower("greece", "allies");
	  paths_self.game.state.events.greece = true;
	  paths_self.game.state.neutral_entry = 1;

	  if (paths_self.game.state.events.salonika != 1) {
	    paths_self.addUnitToSpace("gr_corps", "florina");
	    paths_self.addUnitToSpace("gr_corps", "athens");
	    paths_self.addUnitToSpace("gr_corps", "larisa");
	  }

	  return 1;
        } ,
      }

deck['ap45'] = { 
        key : 'kerenskyoffensive',
        img : "cards/card_ap45.svg" ,
        name : "Kerensky Offensive" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.events.kerensky_offensive = 1;
	  paths_self.game.queue.push("player_play_ops\tallies\tap45\t");
	  return 1;
	} ,
      }

deck['ap46'] = { 
        key : 'brusilovoffensive',
        img : "cards/card_ap46.svg" ,
        name : "Brusilov Offensive" ,
        cc : false ,
	ws : 2 ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.events.brusilov_offensive = 1;
	  paths_self.game.queue.push("player_play_ops\tallies\tap46\t");
	  return 1;
	} ,
      }

deck['ap47'] = { 
        key : 'usareinforcements',
        img : "cards/card_ap47.svg" ,
        name : "USA Reinforcements" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

deck['ap48'] = { 
        key : 'royaltankcorps',
        img : "cards/card_ap48.svg" ,
        name : "Royal Tank Corps" ,
        cc : true ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.events.landships == 1) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {

	  let space = paths_self.game.spaces[paths_self.game.state.combat.key];

	  if (space.terrain == "normal" && (space.country == "france" || space.country == "belgium" || space.country == "germany")) {
	    if (paths_self.game.spaces[paths_self.game.state.combat.key].terrain == "normal") {
	      let attacker_units = paths_self.returnAttackerUnits();
	      for (let i = 0; i < attacker_units.length; i++) {
	        if (attacker_units[i].ckey == "BR") { paths_self.game.state.combat.cancel_trench_effects = 1; }
	      }
	    }
	  }
	  return 1; 
	} ,
      }

deck['ap49'] = { 
        key : 'sinaipipeline',
        img : "cards/card_ap49.svg" ,
        name : "Sinai Pipeline" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.events.sinai_pipeline = 1;
	} ,
      }

deck['ap50'] = { 
        key : 'allenby',
        img : "cards/card_ap50.svg" ,
        name : "Allenby" ,
        cc : false ,
	ws : 1 ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.events.sinai_pipeline == 1) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.playerAddReinforcements("allies", ["ne_army"], "england", ["alexandria"]);
	  }
          return 0;
	} ,
      }

deck['ap51'] = { 
        key : 'everyoneintobattle',
        img : "cards/card_ap51.svg" ,
        name : "Everyone Into Battle" ,
        cc : false ,
	ws : 1 ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) {
	  if (paths_self.game.state.events.blucher == 1 || paths_self.game.state.events.michael == 1 || paths_self.game.state.events.peace_offensive == 1) { return 1; }
	  return 0;
	} ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.events.everyone_into_battle = 1;
	  return 1;
	} ,
      }

deck['ap52'] = { 
        key : 'convoy',
        img : "cards/card_ap52.svg" ,
        name : "Convoy" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.events.convoy = 1;
	  return 1;
	} ,
      }

deck['ap53'] = { 
        key : 'armyoftheorient',
        img : "cards/card_ap53.svg" ,
        name : "Army Of The Orient" ,
        cc : false ,
        ops : 5 ,
        sr : 5 ,        
        rp : { 'A' : 1 , 'BR' : 3 , 'FR' : 3 , 'IT' : 2 , 'RU' : 4 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.spaces["salonika"].control == "allies" && paths_self.game.spaces["salonika"].units.length < 3) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.playerAddReinforcements("allies", ["orient_army"], "england", ["salonika"]);
	  }
          return 0;
	} ,
      }

deck['ap54'] = { 
        key : 'zimmermanntelegram',
        img : "cards/card_ap54.svg" ,
        name : "Zimmermann Telegram" ,
        cc : false ,
	ws : 2 ,
        ops : 5 ,
        sr : 5 ,        
        rp : { 'A' : 1 , 'BR' : 3 , 'FR' : 3 , 'IT' : 2 , 'RU' : 4 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.us_commitment_track == 2) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) { return 1; 
	  paths_self.game.state.events.zimmerman_telegram = 1;
	  paths_self.game.state.events.usa = 1;
	  paths_self.game.state.us_commitment_track = 3;
	  paths_self.displayUSCommitmentTrack();
	  return 1;
	} ,
      }

deck['ap55'] = { 
        key : 'overthere',
        img : "cards/card_ap55.svg" ,
        name : "Over There" ,
        cc : false ,
        ops : 5 ,
        sr : 5 ,        
        rp : { 'A' : 1 , 'BR' : 3 , 'FR' : 3 , 'IT' : 2 , 'RU' : 4 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.events.zimmerman_telegram == 1) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.events.over_there = 1;
	  paths_self.game.state.us_commitment_track = 4;
	  paths_self.displayUSCommitmentTrack();
	  return 1;
	} ,
      }

deck['ap56'] = { 
        key : 'paristaxis',
        img : "cards/card_ap56.png" ,
        name : "Paris Taxis" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

deck['ap57'] = { 
        key : 'russiancavalry',
        img : "cards/card_ap57.png" ,
        name : "Russian Cavalry" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

deck['ap58'] = { 
        key : 'russianguards',
        img : "cards/card_ap58.png" ,
        name : "Russian Guards" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

deck['ap59'] = { 
        key : 'alpinetroops',
        img : "cards/card_ap59.png" ,
        name : "Alpine Troops" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 2 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }


deck['ap60'] = { 
        key : 'czechlegion',
        img : "cards/card_ap60.png" ,
        name : "Czech Legion" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

deck['ap61'] = { 
        key : 'maude',
        img : "cards/card_ap61.png" ,
        name : "Maude" ,
        cc : true ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

deck['ap62'] = { 
        key : 'Thesixtusaffair',
        img : "cards/card_ap62.png" ,
        name : "The Sixtus Affair" ,
        cc : false ,
	ws : 1 ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

deck['ap63'] = { 
        key : 'backstothewall',
        img : "cards/card_ap63.png" ,
        name : "Backs To The Wall" ,
        cc : true ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

deck['ap64'] = { 
        key : 'usareinforcements',
        img : "cards/card_ap64.png" ,
        name : "Usa Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

deck['ap65'] = { 
        key : 'influenza',
        img : "cards/card_ap65.png" ,
        name : "Influenza" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

    }

    if (type == "central" || type == "all") {

   deck['cp35'] = { 
        key : 'mustardgas',
        img : "cards/card_cp35.svg" ,
        name : "Mustard Gas" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { 
          let attacker_units = paths_self.returnAttackerUnits();
          for (let i = 0; i < attacker_units.length; i++) {
            if (attacker_units[i].ckey == "GE") { return 1; }
          }   
          return 0;
	} ,
        onEvent : function(paths_self, faction) {
          let attacker_units = paths_self.returnAttackerUnits();
          for (let i = 0; i < attacker_units.length; i++) {
            if (attacker_units[i].ckey == "GE") { paths_self.game.state.combat.attacker_drm++; return 1; }
          }
          return 1;
        } ,
      }

   deck['cp36'] = { 
        key : 'u-boatsunleashed',
        img : "cards/card_cp36.svg" ,
        name : "U-Boats Unleashed" ,
        cc : false ,
	ws : 2 ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.events.hl_take_command) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.events.uboats_unleashed = 1;
	  return 1;
	} ,
      }

   deck['cp37'] = { 
        key : 'hoffmann',
        img : "cards/card_cp37.svg" ,
        name : "Hoffmann" ,
        cc : false ,
	ws : 1 ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) { paths_self.game.state.events.hottman = 1; return 1; } ,
      }

   deck['cp38'] = { 
        key : 'germanreinforcements',
        img : "cards/card_cp38.svg" ,
        name : "German Reinforcements" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.central_reinforcements_ge > 0) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tcentral_reinforcements_ge\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("central", ["ge_corps", "ge_corps"], "germany");
	  }
	  return 0;
	} ,
      }

   deck['cp39'] = { 
        key : 'germanreinforcements',
        img : "cards/card_cp39.svg" ,
        name : "German Reinforcements" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.central_reinforcements_ge > 0) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tcentral_reinforcements_ge\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("central", ["ge_corps", "ge_corps"], "germany");
	  }
	  return 0;
	} ,
      }


   deck['cp40'] = { 
        key : 'airsuperiority',
        img : "cards/card_cp40.svg" ,
        name : "Air Superiority" ,
        cc : true ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
        canEvent : function(paths_self, faction) { 
          let attacker_units = paths_self.returnAttackerUnits();
          for (let i = 0; i < attacker_units.length; i++) {
            if (attacker_units[i].ckey == "GE") { return 1; }
          }   
          return 0;
	} ,
        onEvent : function(paths_self, faction) {
          let attacker_units = paths_self.returnAttackerUnits();
          for (let i = 0; i < attacker_units.length; i++) {
            if (attacker_units[i].ckey == "GE") { paths_self.game.state.combat.attacker_drm++; return 1; }
          }
          return 1;
        } ,
      }

   deck['cp41'] = { 
        key : 'germanreinforcements',
        img : "cards/card_cp41.svg" ,
        name : "German Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.central_reinforcements_ge > 0) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tcentral_reinforcements_ge\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("central", ["ge_army14"], "germany");
	  }
	  return 0;
	} ,
      }

   deck['cp42'] = { 
        key : 'turkishreinforcements',
        img : "cards/card_cp42.svg" ,
        name : "Turkish Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tcentral_reinforcements_tu\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("central", ["yld_army01"], "turkey");
	  }
	  return 0;
	} ,
      }

   deck['cp43'] = { 
        key : 'vonbelow',
        img : "cards/card_cp43.svg" ,
        name : "Von Below" ,
        cc : true ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) {
          let attacker_units = paths_self.returnAttackerUnits();
          let defender_units = paths_self.returnDefenderUnits();
          let valid_attacker = false;
	  let valid_defender = true; 
          for (let i = 0; i < attacker_units.length; i++) { if (attacker_units[i].ckey == "GE") { valid_attacker = true; } }
          for (let i = 0; i < defender_units.length; i++) { if (defender_units[i].ckey != "IT") { valid_defender = false; } }
          if (valid_attacker == true && valid_defender == true) {
	    return 1;
	  }
	  return 0;
	} ,
        onEvent : function(paths_self, faction) {
          let attacker_units = paths_self.returnAttackerUnits();
          let defender_units = paths_self.returnDefenderUnits();
          let valid_attacker = false;
	  let valid_defender = true; 
          for (let i = 0; i < attacker_units.length; i++) { if (attacker_units[i].ckey == "GE") { valid_attacker = true; } }
          for (let i = 0; i < defender_units.length; i++) { if (defender_units[i].ckey != "IT") { valid_defender = false; } }
          if (valid_attacker == true && valid_defender == true) {
	    paths_self.game.state.events.von_below = 1;
	  }
	  return 1;
	} ,
      }

   deck['cp44'] = { 
        key : 'vonhutier',
        img : "cards/card_cp44.svg" ,
        name : "Von Hutier" ,
        cc : true ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { 
          let attacker_units = paths_self.returnAttackerUnits();
          let defender_units = paths_self.returnDefenderUnits();
          let valid_attacker = false;
	  let valid_defender = false;
           for (let i = 0; i < attacker_units.length; i++) { if (attacker_units[i].ckey == "GE") { valid_attacker = true; } }
          for (let i = 0; i < defender_units.length; i++) { if (defender_units[i].ckey == "RU") { valid_defender = true; } }
          if (valid_attacker == true && valid_defender == true) {
	    return 1;
	  }
	  return 0;
        } ,
        onEvent : function(paths_self, faction) { return 1; 
	  paths_self.game.state.events.von_hutier = 1;
	  paths_self.game.queue.push("combat_card\tcentral\tcp44");
	  paths_self.game.state.combat.cancel_trench_effects = 1;
	  return 1;
	} ,
      }


   deck['cp45'] = { 
        key : 'treatyofbrestlitovsk',
        img : "cards/card_cp45.svg" ,
        name : "Treaty of Brest Litovsk" ,
        cc : false ,
	ws : 1 ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.events.bolshevik_revolution == 1) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) { 
	  paths_self.game.state.events.treaty_of_brest_litovsk = 1;
	  return 1;
	} ,
      }


 deck['cp46'] = { 
        key : 'germanreinforcements',
        img : "cards/card_cp46.svg" ,
        name : "German Reinforcements" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.central_reinforcements_ge > 0) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tcentral_reinforcements_ge\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("central", ["ge_army17","ge_army18"], "germany");
	  }
	  return 0;
	} ,
      }

  deck['cp47'] = { 
        key : 'frenchmutiny',
        img : "cards/card_cp47.svg" ,
        name : "French Mutiny" ,
        cc : false ,
	ws : 1 ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

deck['cp48'] = { 
        key : 'turkishreinforcements',
        img : "cards/card_cp48.svg" ,
        name : "Turkish Reinforcements" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tcentral_reinforcements_tu\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("central", ["aoi_army"], "turkey");
	  }
	  return 0;
	} ,
      }

deck['cp49'] = { 
        key : 'michael',
        img : "cards/card_cp49.svg" ,
        name : "Michael" ,
        cc : true ,
	ws : 1 ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.events.hl_take_command) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

deck['cp50'] = { 
        key : 'blucher',
        img : "cards/card_cp50.svg" ,
        name : "Blucher" ,
        cc : true ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.events.hl_take_command) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

deck['cp51'] = { 
        key : 'peaceoffensive',
        img : "cards/card_cp51.svg" ,
        name : "Peace Offensive" ,
        cc : true ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.events.hl_take_command) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

deck['cp52'] = { 
        key : 'fallofthetsar',
        img : "cards/card_cp52.svg" ,
        name : "Fall of The Tsar" ,
        cc : false ,
        ops : 5 ,
        sr : 5 ,        
        rp : { 'AH' : 3 , 'BU' : 1 , 'GE' : 4 , 'TU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.events.fall_of_the_tsar == 1 && paths_self.game.state.events.bolshevik_revolution != 1) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) { 
	  paths_self.game.state.events.fall_of_the_tsar = 1;
	  if (!paths_self.game.state.events.romania) {
	    paths_self.game.state.events.fall_of_the_tsar_romania_bonus = 1;
	  }
	return 1; } ,
      }

deck['cp53'] = { 
        key : 'bolshevikrevolution',
        img : "cards/card_cp53.svg" ,
        name : "Bolshevik Revolution" ,
        cc : false ,
        ops : 5 ,
        sr : 5 ,        
        rp : { 'AH' : 3 , 'BU' : 1 , 'GE' : 4 , 'TU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

deck['cp54'] = { 
        key : 'h-ltakecommand',
        img : "cards/card_cp54.svg" ,
        name : "H-L Take Command" ,
        cc : false ,
	ws : 2 ,
        ops : 5 ,
        sr : 5 ,        
        rp : { 'AH' : 3 , 'BU' : 1 , 'GE' : 4 , 'TU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.events.hl_take_command = 1;
	  return 1;
	} ,
      }

deck['cp55'] = { 
        key : 'lloydgeorge',
        img : "cards/card_cp55.svg" ,
        name : "Lloyd George" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

/***** OPTIONAL ******
deck['cp56'] = { 
        key : 'withdrawal',
        img : "cards/card_cp56.png" ,
        name : "withdrawal" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

deck['cp57'] = { 
        key : 'kaisertreu',
        img : "cards/card_cp57.png" ,
        name : "Kaisertreu" ,
        cc : true ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }
deck['cp58'] = { 
        key : 'stavkatimidity',
        img : "cards/card_cp58.png" ,
        name : "Stavka Timidity" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }


deck['cp59'] = { 
        key : 'polishrestoration',
        img : "cards/card_cp59.png" ,
        name : "Polish Restoration" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

deck['cp60'] = { 
        key : 'turkdetermination',
        img : "cards/card_cp60.png" ,
        name : "turk Determination" ,
        cc : true ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }
deck['cp61'] = { 
        key : 'haig',
        img : "cards/card_cp61.png" ,
        name : "Haig" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }


deck['cp62'] = { 
        key : 'achtung:panzer',
        img : "cards/card_cp62.png" ,
        name : "Achtung: Panzer" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

deck['cp63'] = { 
        key : 'russiandesertions',
        img : "cards/card_cp63.png" ,
        name : "Russian Desertions" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

deck['cp64'] = { 
        key : 'alberich',
        img : "cards/card_cp64.png" ,
        name : "Alberich" ,
        cc : true ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }


deck['cp65'] = { 
        key : 'princemax',
        img : "cards/card_cp65.png" ,
        name : "Prince Max" ,
        cc : false ,
	ws : 3 ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }
***** OPTIONAL ******/
    }

    return deck;
  }
  returnDeck(type="all") {
    let a = this.returnMobilizationDeck(type);
    let b = this.returnLimitedWarDeck(type);
    let c = this.returnTotalWarDeck(type);
    let d = Object.assign({}, a, b);
    let deck = Object.assign({}, d, c);

    for (let key in deck) {
      deck[key] = this.addEvents(deck[key]);
    }

    return deck;
  }


  returnDefenderUnits() {
    return this.game.spaces[this.game.state.combat.key].units;
  }

  returnAttackerUnits() {
    let x = this.game.state.combat.attacker;

    x.sort((a, b) => {
      if (a.unit_idx < b.unit_idx) { return -1; }
      if (a.unit_idx > b.unit_idx) { return 1; }   
      return 0;
    });

    let units = [];
    for (let z = 0; z < x.length; z++) {
      units.push(this.game.spaces[x[z].unit_sourcekey].units[x[z].unit_idx]);   
    }
    return units;
  }

  returnDefenderCombatPower() {
    let x = 0;
    for (let i = 0; i < this.game.spaces[this.game.state.combat.key].units.length; i++) {
      let unit = this.game.spaces[this.game.state.combat.key].units[i];
      if (unit.damaged) {
        x += unit.rcombat;
      } else {
        x += unit.combat;
      }
    }
    return x;
  }

  returnAttackerCombatPower() {
    let x = 0;
    for (let i = 0; i < this.game.state.combat.attacker.length; i++) {
      let unit = this.game.spaces[this.game.state.combat.attacker[i].unit_sourcekey].units[this.game.state.combat.attacker[i].unit_idx];
      if (unit) {
        if (unit.damaged) {
          x += unit.rcombat;
        } else {
          x += unit.combat;
        }
      }
    }
    return x;
  }

  returnArmyColumnNumber(cp=0) {
    if (cp >= 16) { return 10; }
    if (cp >= 15) { return 9; }
    if (cp >= 12) { return 8; }
    if (cp >= 9) { return 7; }
    if (cp >= 6) { return 6; }
    if (cp >= 5) { return 5; }
    if (cp >= 4) { return 4; }
    if (cp >= 3) { return 3; }
    if (cp >= 2) { return 2; }
    if (cp >= 1) { return 1; }
    return 0;
  }

  returnCorpsColumnNumber(cp=0) {
    if (cp >= 8) { return 9; }
    if (cp >= 7) { return 8; }
    if (cp >= 6) { return 7; }
    if (cp >= 5) { return 6; }
    if (cp >= 4) { return 5; }
    if (cp >= 3) { return 4; }
    if (cp >= 2) { return 3; }
    if (cp >= 1) { return 2; }
    return 1;
  }

  returnAttackerLossFactor() {

    let cp = this.returnDefenderCombatPower();

    //
    // forts lend their combat strength to the defender 
    //
    if (this.game.spaces[this.game.state.combat.key].fort > 0) {
      this.updateLog("Defender Combat Bonus " + this.game.spaces[this.game.state.combat.key].fort);
      cp += this.game.spaces[this.game.state.combat.key].fort;
    }
    
console.log("CALCULATING ATTACKER LOSS FACTOR (defender hits): )");
console.log("CP: " + cp);

    let hits = this.returnArmyFireTable();
    if (this.game.state.combat.defender_table === "corps") { hits = this.returnCorpsFireTable(); }

console.log("table: " + JSON.stringify(hits));

    for (let i = hits.length-1; i >= 0; i--) {
      if (hits[i].max >= cp && hits[i].min <= cp) {

	//
	// we have found the right column and row, but we shift
	// based on combat modifiers...
	//
console.log("original col: " + (i) + " " + this.game.state.combat.defender_column_shift);
	let col = i + this.game.state.combat.defender_column_shift;


	if (col <= 0) { col = 1; }
	if (col >= hits.length) { col = hits.length-1; }

console.log("adjusted col: " + col);
console.log("defender hits: " + hits[col][this.game.state.combat.defender_modified_roll]);
console.log("dmr: " + this.game.state.combat.defender_modified_roll);
        return hits[col][this.game.state.combat.defender_modified_roll];


      }
    }
    return 0;
  }

  returnDefenderLossFactor() {
    let cp = this.returnAttackerCombatPower();
console.log("CALCULATING DEFENDER LOSS FACTOR (attacker hits): )");
console.log("CP: " + cp);
    let hits = this.returnArmyFireTable();
    if (this.game.state.combat.attacker_table === "corps") { hits = this.returnCorpsFireTable(); }
console.log("table: " + JSON.stringify(hits));
    for (let i = hits.length-1; i >= 0; i--) {
      if (hits[i].max >= cp && hits[i].min <= cp) {
	
	//
	// we haev found the right column and row, but we shift
	// based on combat modifiers...
	//
	let col = i + this.game.state.combat.attacker_column_shift;
console.log("original col: " + i + " + " + this.game.state.combat.attacker_column_shift);
	if (col <= 0) { col = 1; }
	if (col >= hits.length) { col = hits.length-1; }
console.log("adjusted col: " + col);
console.log("calculating hits: " + hits[i][this.game.state.combat.attacker_modified_roll]);

        return hits[i][this.game.state.combat.attacker_modified_roll];
      }
    }
    return 0;
  }

  returnArmyFireTable() {
    let hits = [];
    hits.push({ min : 1,  max : 1,   1 : 0 , 2 : 1 , 3 : 1 , 4 : 1 , 5 : 2 , 6 : 2 })
    hits.push({ min : 2,  max : 2,   1 : 1 , 2 : 1 , 3 : 2 , 4 : 2 , 5 : 3 , 6 : 3 })
    hits.push({ min : 3,  max : 3,   1 : 1 , 2 : 2 , 3 : 2 , 4 : 3 , 5 : 3 , 6 : 4 })
    hits.push({ min : 4,  max : 4,   1 : 2 , 2 : 2 , 3 : 3 , 4 : 3 , 5 : 4 , 6 : 4 })
    hits.push({ min : 5,  max : 5,   1 : 2 , 2 : 3 , 3 : 3 , 4 : 4 , 5 : 4 , 6 : 5 })
    hits.push({ min : 6,  max : 8,   1 : 3 , 2 : 3 , 3 : 4 , 4 : 4 , 5 : 5 , 6 : 5 })
    hits.push({ min : 9,  max : 11,  1 : 3 , 2 : 4 , 3 : 4 , 4 : 5 , 5 : 5 , 6 : 7 })
    hits.push({ min : 12, max : 14,  1 : 4 , 2 : 4 , 3 : 5 , 4 : 5 , 5 : 7 , 6 : 7 })
    hits.push({ min : 15, max : 15,  1 : 4 , 2 : 5 , 3 : 5 , 4 : 7 , 5 : 7 , 6 : 7 })
    hits.push({ min : 16, max : 100, 1 : 5 , 2 : 5 , 3 : 7 , 4 : 7 , 5 : 7 , 6 : 7 })
    return hits;
  }

  returnCorpsFireTable() {
    let hits = [];
    hits.push({ min : 0, max : 0, 1 : 0 , 2 : 0 , 3 : 0 , 4 : 0 , 5 : 1 , 6 : 1 })
    hits.push({ min : 1, max : 1, 1 : 0 , 2 : 0 , 3 : 0 , 4 : 1 , 5 : 1 , 6 : 1 })
    hits.push({ min : 2, max : 2, 1 : 0 , 2 : 1 , 3 : 1 , 4 : 1 , 5 : 1 , 6 : 1 })
    hits.push({ min : 3, max : 3, 1 : 1 , 2 : 1 , 3 : 1 , 4 : 1 , 5 : 2 , 6 : 2 })
    hits.push({ min : 4, max : 4, 1 : 1 , 2 : 1 , 3 : 1 , 4 : 2 , 5 : 2 , 6 : 2 })
    hits.push({ min : 5, max : 5, 1 : 1 , 2 : 1 , 3 : 2 , 4 : 2 , 5 : 2 , 6 : 3 })
    hits.push({ min : 6, max : 6, 1 : 1 , 2 : 1 , 3 : 2 , 4 : 2 , 5 : 3 , 6 : 3 })
    hits.push({ min : 7, max : 7, 1 : 1 , 2 : 2 , 3 : 2 , 4 : 3 , 5 : 3 , 6 : 4 })
    hits.push({ min : 8, max : 100, 1 : 2 , 2 : 2 , 3 : 3 , 4 : 3 , 5 : 4 , 6 : 4 })
    return hits;
  }


  returnTerrainShift(spacekey="") {
    let tshift = { attack : 0 , defense : 0 , effects : [] };
    let space = this.game.spaces[spacekey];
    if (!space) { return tshift; }
    if (space.terrain == "mountain") { tshift.attack--; }
    if (space.terrain == "swamp") { tshift.attack--; }
    if (this.game.state.combat.cancel_trench_effects != 1) {
      if (space.trench == 1) { tshift.attack--; tshift.defense++; }
      if (space.trench == 2) { tshift.attack--; tshift.defense+=2; }
    }
    return tshift;
  }

  canCancelRetreat(spacekey="") {
    let space = this.game.spaces[spacekey];
    if (!space) { return false; }
    if (space.terrain == "mountain") { return true; }
    if (space.terrain == "swamp") { return true; }
    if (space.terrain == "forest") { return true; }
    if (space.terrain == "desert") { return true; }
    if (space.trench > 0) { return true; }
    return false;
  }

  canStopAdvance(spacekey="") {
    let space = this.game.spaces[spacekey];
    if (!space) { return false; }
    if (space.terrain == "mountain") { return true; }
    if (space.terrain == "swamp") { return true; }
    if (space.terrain == "forest") { return true; }
    if (space.terrain == "desert") { return true; }
    return false;
  }

  canFlankAttack() {

    let combat = this.game.state.combat;
    let spacekey = this.game.state.combat.key;
    let attacker_units = this.returnAttackerUnits();
    let defender_units = this.returnDefenderUnits();
    let space = this.game.spaces[spacekey];

    let is_one_army_attacking = false;
    let are_attacks_from_two_spaces = false;
    let attacker_spaces = [];
    let is_geography_suitable = true;
    let is_flank_attack_possible = false;

    //
    // at least one army attacking
    //
    for (let i = 0; i < attacker_units.length; i++) {
      if (!attacker_spaces.includes(attacker_units[i].spacekey)) { attacker_spaces.push(attacker_units[i].spacekey); }
      if (attacker_units[i].type == "army") { is_one_army_attacking = true; }
    }

    //
    // no swamp or mountain or trench or unoccupied fort
    //
    if (space.terrain == "mountain") { is_geography_suitable = false; }
    if (space.terrain == "swamp")    { is_geography_suitable = false; }
    if (space.trench > 0)            { is_geography_suitable = false; }
    if (space.fort > 0)              { is_geography_suitable = false; }
    if (attacker_spaces.length > 1)         { are_attacks_from_two_spaces = true; }

    if (is_geography_suitable == true && is_one_army_attacking == true && are_attacks_from_two_spaces == true) {
      is_flank_attack_possible = true;
    }

    return is_flank_attack_possible;

  }


  hideOverlays() {
    this.zoom_overlay.hide();
  }

  pulseSpacekey(spacekey) {

    let elements = document.querySelectorAll(`.space.${spacekey}`);

    elements.forEach((el) => {
      el.classList.remove("pulsing");
      el.classList.add("pulsing");
    });

    setTimeout(() => {
      elements.forEach((el) => el.classList.remove("pulsing"));
    }, 2100);

  }


  shakeSpacekey(spacekey) {

    let qs = `.space.${spacekey}`;
    let element = document.querySelectorAll(qs).forEach((element) => {

      if (element.classList.contains("shake")) { return; }
      element.classList.add("shake");

      setTimeout(() => { 
        document.querySelectorAll(qs).forEach((element) => {
          element.classList.remove("shake");
        }); 
      }, 1500);
    });
  }

  shakeUnit(skey, ukey) {

    let qs = `.${ukey}`;
    document.querySelectorAll(qs).forEach((element) => {

      if (element.classList.contains("shake")) { return; }
      element.classList.add("shake");

      setTimeout(() => { 
        document.querySelectorAll(qs).forEach((element) => {
          element.classList.remove("shake");
	}); 
      }, 1500);
    });

  }

  displayCustomOverlay(obj={}) {

    //
    // move HUD above winter if winter is showing
    //
    this.welcome_overlay.pullHudOverOverlay();
    this.welcome_overlay.pushHudUnderOverlay();

    let deck = this.returnDeck(); // include removed

    let title = "";
    let text = "";
    let img = "";
    let card = "";

    if (obj.title) { title = obj.title; }
    if (obj.text) { text = obj.text; }
    if (obj.img) { img = obj.img; }
    if (obj.card) { card = obj.card; }

        this.welcome_overlay.renderCustom({
          text : text,
          title : title,
          img : img,
	  card : card
        });

  }

  addHighlightToSpacekey(spacekey="", htype="") {
    let obj = document.querySelector(`.${spacekey}`);
    if (htype == "central" && obj) { obj.classList.add('central-highlight'); }
    if (htype == "allies" && obj) { obj.classList.add('allies-highlight'); }
  }

  addHighlights(el) {
    if (!el.classList.contains("allies")) {
      el.classList.add('allies-highlight');
    }
    if (!el.classList.contains("neutral")) {
      el.classList.add('neutral-highlight');
    }
    if (!el.classList.contains("central")) {
      el.classList.add('central-highlight');
    }
  }

  removeHighlights() {
    document.querySelectorAll(".allies-highlight").forEach((el) => {
      el.classList.remove("allies-highlight");
    });
    document.querySelectorAll(".neutral-highlight").forEach((el) => {
      el.classList.remove("neutral-highlight");
    });
    document.querySelectorAll(".central-highlight").forEach((el) => {
      el.classList.remove("central-highlight");
    });
  }

  addSelectable(el) {
    if (!el.classList.contains("selectable")) {
      el.classList.add('selectable');
    }
  } 
    
  removeSelectable() {
    document.querySelectorAll(".selectable").forEach((el) => {
      el.onclick = (e) => {};
      el.classList.remove('selectable');
    });
    $('.trench-tile').off();
    $('.army-tile').off();
    $('.space').off();
  }


  displayBoard() {

    let paths_self = this;

    paths_self.displayTurnTrack();
    paths_self.displayGeneralRecordsTrack();
    paths_self.displayActionRoundTracks();
    paths_self.displayMandatedOffensiveTracks();
    paths_self.displayUSCommitmentTrack();
    paths_self.displayRussianCapitulationTrack();
    paths_self.displayReserveBoxes();
    paths_self.displayEliminatedUnitsBoxes();

    //
    // display the spaces on the board
    //
    try {
      this.displaySpaces();
      //this.addHighlights();

    } catch (err) {
console.log("!");
console.log("!");
console.log("!");
      console.log("error displaying spaces... " + err);
    }

  }


  displaySpace(key) {

    if (key === "arbox" || key === "crbox" || key === "aeubox" || key === "ceubox") { return; }

    try {

      let space = this.game.spaces[key];
      let html = "";
      let control = this.returnControlOfSpace(key);

      //
      // units / armies
      //
      for (let i = 0; i < space.units.length; i++) {
        html += this.returnUnitImageInSpaceWithIndex(key, i);
      }

      //
      // activated for movement
      //
      if (space.activated_for_movement) {
        html += `<img src="/paths/img/tiles/activate_move.png" class="activation-tile" />`;
      }
      if (space.activated_for_combat) {
        html += `<img src="/paths/img/tiles/activate_attack.png" class="activation-tile" />`;
      }

      //
      // add central control
      //
      if (space.country == "germany" || space.country == "austria" || space.country == "bulgaria" || space.country == "turkey") {
	if (space.control == "allies") {
          html += `<img src="/paths/img/tiles/control_ap.png" class="trench-tile control-tile" />`;
	}
      } else {
	if (space.control == "central") {
          html += `<img src="/paths/img/tiles/control_cp.png" class="trench-tile control-tile" />`;
	}
      }


      //
      // trenches
      //
      if (space.trench == 1) {
	if (control == "allies") {
          html += `<img src="/paths/img/tiles/ap_trench1.png" class="trench-tile" />`;
	}
	if (control == "central") {
          html += `<img src="/paths/img/tiles/cp_trench1.png" class="trench-tile" />`;
	}
      }
      if (space.trench == 2) {
	if (control == "allies") {
          html += `<img src="/paths/img/tiles/ap_trench2.png" class="trench-tile" />`;
	}
	if (control == "central") {
          html += `<img src="/paths/img/tiles/cp_trench2.png" class="trench-tile" />`;
	}
      }

      if (space.besieged == 1) {
        html += `<img src="/paths/img/tiles/fort_besieged.png" class="trench-tile fort-besieged" />`;
      }
      if (space.fort == -1) {
        html += `<img src="/paths/img/tiles/fort_destroyed.png" class="trench-tile fort-destroyed" />`;
      }

      //
      // out of supply
      //
      if (space.oos == 1 && space.units.length > 0) { 
	if (this.returnPowerOfUnit(space.units[0]) == "central") {
          html += `<img src="/paths/img/tiles/oos_central.png" class="trench-tile oos-tile" />`;
	} else {
          html += `<img src="/paths/img/tiles/oos_allies.png" class="trench-tile oos-tile" />`;
	}
      } else {

	//
	// remove any highlights
	//
        document.querySelectorAll(`.${key}`).forEach((el) => { 
	  el.classList.remove("oos-highlight");
	});
      }


      document.querySelectorAll(`.${key}`).forEach((el) => { 
//        if (control == "allies") { el.classList.add("allies-highlight"); }
//        if (control == "central") { el.classList.add("central-highlight"); }
//        if (control == "neutral") { el.classList.add("neutral-highlight"); }
	el.innerHTML = html; 
      });

    } catch (err) {
console.log("err: " + err);
    }
  }

  displaySpaceDetailedView(key) {
    this.space_overlay.render(key);
  }

  displaySpaces() {

    let paths_self = this;

    //
    // add tiles
    //
    for (let key in this.game.spaces) {
      if (this.game.spaces.hasOwnProperty(key)) {
	this.displaySpace(key);
      }
    }

    //
    // add click event to gameboard for close-up / zoom UI
    //
    if (!paths_self.bound_gameboard_zoom) {

      //$('.main .gameboard').on('mousedown', function (e) {
      //  if (e.currentTarget.classList.contains("space")) { return; }
      //});
      $('.main .gameboard').on('mouseup', function (e) {

        //
        // if this is a selectable space, let people select directly
        //
        // this is a total hack by the way, but it captures the embedding that happens when
        // we are clicking and the click action is technically on the item that is INSIDE
        // the selectable DIV, like a click on a unit in a key, etc.
        //
        if (e.target.classList.contains("selectable")) {
          return;
        } else {
          let el = e.target;
          if (el.parentNode) {
            if (el.parentNode.classList.contains("selectable")) {
              return;
            } else {
              if (el.parentNode.parentNode) {
                if (el.parentNode.parentNode.classList.contains("selectable")) {
                  return;
                }
              }
            }
          }
        }

  	const board = document.querySelector(".main .gameboard");

  	let scale = 1;
  	const computedTransform = window.getComputedStyle(board).transform;
  	if (computedTransform && computedTransform !== "none") {
  	  const match = computedTransform.match(/^matrix\(([^,]+),/);
  	  if (match) {
  	    scale = parseFloat(match[1]);
  	  }
  	}

    	const rect = board.getBoundingClientRect();
  	const localX = (e.clientX - rect.left) / scale;
  	const localY = (e.clientY - rect.top) / scale;

  	paths_self.zoom_overlay.renderAtCoordinates(localY, localX);

      });


document.querySelector(".log").addEventListener("mouseover", (e) => {
  let trigger = e.target.closest(".pulse-trigger");
  if (trigger) {
    let spacekey = trigger.dataset.spacekey;
    this.pulseSpacekey(spacekey);
  }
});


      //
      // we only attach this event to the gameboard once, so once we have done
      // that remember that we have already bound the gameboard zoom event so that
      // we will not do it again. If necessary we can reset this variable to 0
      // and call this function again.
      //
      paths_self.bound_gameboard_zoom = 1;
    }


  }



  returnCardImage(cardname) {

    let cardclass = "cardimg";
    let deck = this.returnDeck();
    let card = "";
    let html = "";

    if (cardname === "pass") {
      return `<img class="${cardclass}" src="/paths/img/cards/PASS.png" /><div class="cardtext">pass</div>`;
    }

    if (deck[cardname]) {
      card = deck[cardname];
      html = `<img class="${cardclass}" src="/paths/img/${card.img}" />`;
      let can_event_card = false;
      try {
	can_event_card = card.canEvent(this);
      } catch (err) {}
      try {
        if (!can_event_card || (this.game.state.player_turn_card_select == true && card.cc == true)) {
          html += `<img class="${cardclass} cancel_x" src="/paths/img/cancel_x.png" />`;
        }
      } catch (err) {

console.log("$");
console.log("$");
console.log("$");
console.log("$");
console.log("$");
console.log("$");
console.log("$");
console.log("$");
console.log(err);

      }
    }

    return html

  }


  async preloadImages() {
    var allImages = [
    //  "img/factions/england.png",
    ];

    this.preloadImageArray(allImages);
  }

  preloadImageArray(imageArray=[], idx=0) {

    let pre_images = [imageArray.length];

    if (imageArray && imageArray.length > idx) {
      pre_images[idx] = new Image();
      pre_images[idx].onload = () => {
        this.preloadImageArray(imageArray, idx+1);
      }
      pre_images[idx].src = "/paths/" + imageArray[idx];
    }

  }



  displayTurnTrack() {

    try {

      document.querySelectorAll(".turn-track").forEach((el) => { el.classList.remove("active"); });

      if (this.game.state.turn == 1) { document.querySelector(".turn-track-1").classList.add("active"); }
      if (this.game.state.turn == 2) { document.querySelector(".turn-track-2").classList.add("active"); }
      if (this.game.state.turn == 3) { document.querySelector(".turn-track-3").classList.add("active"); }
      if (this.game.state.turn == 4) { document.querySelector(".turn-track-4").classList.add("active"); }
      if (this.game.state.turn == 5) { document.querySelector(".turn-track-5").classList.add("active"); }
      if (this.game.state.turn == 6) { document.querySelector(".turn-track-6").classList.add("active"); }
      if (this.game.state.turn == 7) { document.querySelector(".turn-track-7").classList.add("active"); }
      if (this.game.state.turn == 8) { document.querySelector(".turn-track-8").classList.add("active"); }
      if (this.game.state.turn == 9) { document.querySelector(".turn-track-9").classList.add("active"); }
      if (this.game.state.turn == 10) { document.querySelector(".turn-track-10").classList.add("active"); }
      if (this.game.state.turn == 11) { document.querySelector(".turn-track-11").classList.add("active"); }
      if (this.game.state.turn == 12) { document.querySelector(".turn-track-12").classList.add("active"); }
      if (this.game.state.turn == 13) { document.querySelector(".turn-track-13").classList.add("active"); }
      if (this.game.state.turn == 14) { document.querySelector(".turn-track-14").classList.add("active"); }
      if (this.game.state.turn == 15) { document.querySelector(".turn-track-15").classList.add("active"); }
      if (this.game.state.turn == 16) { document.querySelector(".turn-track-16").classList.add("active"); }
      if (this.game.state.turn == 17) { document.querySelector(".turn-track-17").classList.add("active"); }
      if (this.game.state.turn == 18) { document.querySelector(".turn-track-18").classList.add("active"); }
      if (this.game.state.turn == 19) { document.querySelector(".turn-track-19").classList.add("active"); }
      if (this.game.state.turn == 20) { document.querySelector(".turn-track-20").classList.add("active"); }

    } catch (err) {

console.log("*");
console.log("*");
console.log("*");
console.log("*");
console.log("*");
console.log(JSON.stringify(err));

    }

  }

  displayGeneralRecordsTrack() {

    try {

      document.querySelectorAll(".general-records-track").forEach((el) => { el.classList.remove("vp"); el.innerHTML = ""; });

      ////////////////////////
      // Replacement Points //
      ////////////////////////

      // central
      document.querySelector(`.general-records-track-${this.game.state.rp["central"]["GE"]}`).innerHTML += `<img src="/paths/img/rp/rp_ge.png" />`;
      document.querySelector(`.general-records-track-${this.game.state.rp["central"]["AH"]}`).innerHTML += `<img src="/paths/img/rp/rp_ah.png" />`;
      document.querySelector(`.general-records-track-${this.game.state.rp["central"]["TU"]}`).innerHTML += `<img src="/paths/img/rp/rp_tu.png" />`;
      document.querySelector(`.general-records-track-${this.game.state.rp["central"]["BU"]}`).innerHTML += `<img src="/paths/img/rp/rp_bu.png" />`;
      document.querySelector(`.general-records-track-${this.game.state.rp["central"]["CP"]}`).innerHTML += `<img src="/paths/img/rp/rp_cp.png" />`;

      // allies
      document.querySelector(`.general-records-track-${this.game.state.rp["allies"]["A"]}`).innerHTML += `<img src="/paths/img/rp/rp_a.png" />`;
      document.querySelector(`.general-records-track-${this.game.state.rp["allies"]["BR"]}`).innerHTML += `<img src="/paths/img/rp/rp_br.png" />`;
      document.querySelector(`.general-records-track-${this.game.state.rp["allies"]["FR"]}`).innerHTML += `<img src="/paths/img/rp/rp_fr.png" />`;
      document.querySelector(`.general-records-track-${this.game.state.rp["allies"]["IT"]}`).innerHTML += `<img src="/paths/img/rp/rp_it.png" />`;
      document.querySelector(`.general-records-track-${this.game.state.rp["allies"]["RU"]}`).innerHTML += `<img src="/paths/img/rp/rp_ru.png" />`;
      document.querySelector(`.general-records-track-${this.game.state.rp["allies"]["AP"]}`).innerHTML += `<img src="/paths/img/rp/rp_ap.png" />`;

      let central_rp = 0;
      for (let key in this.game.state.rp["central"]) { central_rp += this.game.state.rp["central"][key]; }

      let allied_rp = 0;
      for (let key in this.game.state.rp["allies"]) { allied_rp += this.game.state.rp["allies"][key]; }

      document.querySelector(`.general-records-track-${central_rp}`).innerHTML += `<img src="/paths/img/rp/rp_cp.png" />`;
      document.querySelector(`.general-records-track-${allied_rp}`).innerHTML += `<img src="/paths/img/rp/rp_allied.png" />`;


      ////////////////////
      // Victory Points //
      ////////////////////
      this.calculateVictoryPoints();
      document.querySelector(`.general-records-track-${this.game.state.general_records_track.vp}`).innerHTML += `<img src="/paths/img/vp.png" />`;


      ////////////////
      // War Status //
      ////////////////
      let allies_war_status = `<img src="/paths/img/warstatus_ap.png" />`;
      let central_war_status = `<img src="/paths/img/warstatus_cp.png" />`;
      let combined_war_status = `<img src="/paths/img/warstatus_combined.png" />`;
      let current_cp_russian_vp = `<img src="/paths/img/current_cp_russian_vp.png" />`;

console.log("CHECKING WAR STATUS: ");
console.log("Allies: " + this.game.state.general_records_track.allies_war_status);
console.log("Central: " + this.game.state.general_records_track.central_war_status);

      document.querySelector(`.general-records-track-${this.game.state.general_records_track.allies_war_status}`).innerHTML += allies_war_status;
      document.querySelector(`.general-records-track-${this.game.state.general_records_track.central_war_status}`).innerHTML += central_war_status;
      document.querySelector(`.general-records-track-${this.game.state.general_records_track.combined_war_status}`).innerHTML += combined_war_status;
      document.querySelector(`.general-records-track-${this.game.state.general_records_track.current_cp_russian_vp}`).innerHTML += current_cp_russian_vp;

    } catch (err) {
console.log("X");
console.log("X");
console.log("X");
console.log("X");
console.log("X");
console.log("X");
console.log("X");
console.log("X");
console.log("X");
console.log("X");
      console.log(err);
    }

  }

  displayActionRoundTracks() {

    let central_token = `<img src="/paths/img/control_cp.png" />`;
    let allies_token = `<img src="/paths/img/allies_cp.png" />`;
    let current_round = this.game.state.round;
    let current_turn = this.game.state.turn;

    document.querySelectorAll(`.central-action-round-track`).forEach((el) => { el.innerHTML = ""; });
    document.querySelectorAll(`.allies-action-round-track`).forEach((el) => { el.innerHTML = ""; });

    for (let z = 0; z < this.game.state.allies_rounds.length; z++) {
      let allies_move = this.game.state.allies_rounds[z];
      if (allies_move == "sr") {
	document.querySelector(".allies-action-round-track-5").innerHTML = `<ing src="/paths/img/action_ap${(z+1)}.png" />`;
      }
      if (allies_move == "rp") {
	document.querySelector(".allies-action-round-track-6").innerHTML = `<ing src="/paths/img/action_ap${(z+1)}.png" />`;
      }
    }
    for (let z = 0; z < this.game.state.central_rounds.length; z++) {
      let central_move = this.game.state.central_rounds[z];
      if (central_move == "sr") {
	document.querySelector(".central-action-round-track-7").innerHTML = `<ing src="/paths/img/action_cp${(z+1)}.png" />`;
      }
      if (central_move == "rp") {
	document.querySelector(".central-action-round-track-8").innerHTML = `<ing src="/paths/img/action_cp${(z+1)}.png" />`;
      }
    }

    if (parseInt(this.game.state.central_reinforcements_ge) > 0) {
      document.querySelector(`.central-action-round-track-2`).innerHTML = `<img src="/paths/img/action_cp${this.game.state.central_reinforcements_ge}.png" />`;
    }
    if (parseInt(this.game.state.central_reinforcements_ah) > 0) {
      document.querySelector(`.central-action-round-track-3`).innerHTML = `<img src="/paths/img/action_cp${this.game.state.central_reinforcements_ah}.png" />`;
    }
    if (parseInt(this.game.state.central_reinforcements_tu) > 0) {
      document.querySelector(`.central-action-round-track-4`).innerHTML = `<img src="/paths/img/action_cp${this.game.state.central_reinforcements_tu}.png" />`;
    }

    if (parseInt(this.game.state.allies_reinforcements_fr) > 0) {
      document.querySelector(`.allies-action-round-track-2`).innerHTML = `<img src="/paths/img/action_ap${this.game.state.allies_reinforcements_fr}.png" />`;
    }
    if (parseInt(this.game.state.allies_reinforcements_br) > 0) {
      document.querySelector(`.allies-action-round-track-3`).innerHTML = `<img src="/paths/img/action_ap${this.game.state.allies_reinforcements_br}.png" />`;
    }
    if (parseInt(this.game.state.allies_reinforcements_ru) > 0) {
      document.querySelector(`.allies-action-round-track-4`).innerHTML = `<img src="/paths/img/action_ap${this.game.state.allies_reinforcements_ru}.png" />`;
    }
    if (parseInt(this.game.state.allies_reinforcements_it) > 0) {
      document.querySelector(`.allies-action-round-track-5`).innerHTML = `<img src="/paths/img/action_ap${this.game.state.allies_reinforcements_it}.png" />`;
    }
    if (parseInt(this.game.state.allies_reinforcements_us) > 0) {
      document.querySelector(`.allies-action-round-track-6`).innerHTML = `<img src="/paths/img/action_ap${this.game.state.allies_reinforcements_us}.png" />`;
    }

    if (this.game.state.neutral_entry != 0) {
      document.querySelector(`.central-action-round-track-1`).innerHTML = central_token;;
      document.querySelector(`.allies-action-round-track-1`).innerHTML = allies_token;;
    }

  }

  displayMandatedOffensiveTracks() {

    document.querySelectorAll(".central-mandated-offensive-track").forEach((el) => { el.classList.remove("active"); });
    document.querySelectorAll(".allies-mandated-offensive-track").forEach((el) => { el.classList.remove("active"); });

    if (this.game.state.mandated_offensives.central === "AH") {
      document.querySelector(".central-mandated-offensive-track-1").classList.add("active");
    }
    if (this.game.state.mandated_offensives.central === "AH IT") {
      document.querySelector(".central-mandated-offensive-track-1").classList.add("active");
    }
    if (this.game.state.mandated_offensives.central === "TU") {
      document.querySelector(".central-mandated-offensive-track-1").classList.add("active");
    }
    if (this.game.state.mandated_offensives.central === "GE") {
      document.querySelector(".central-mandated-offensive-track-1").classList.add("active");
    }

    if (this.game.state.mandated_offensives.allies === "FR") {
      document.querySelector(".allies-mandated-offensive-track-1").classList.add("active");
    }
    if (this.game.state.mandated_offensives.allies === "FR") {
      document.querySelector(".allies-mandated-offensive-track-2").classList.add("active");
    }
    if (this.game.state.mandated_offensives.allies === "BR") {
      document.querySelector(".allies-mandated-offensive-track-3").classList.add("active");
    }
    if (this.game.state.mandated_offensives.allies === "IT") {
      document.querySelector(".allies-mandated-offensive-track-4").classList.add("active");
    }
    if (this.game.state.mandated_offensives.allies === "IT") {
      document.querySelector(".allies-mandated-offensive-track-5").classList.add("active");
    }
    if (this.game.state.mandated_offensives.allies === "RU") {
      document.querySelector(".allies-mandated-offensive-track-5").classList.add("active");
    }

  }

  displayUSCommitmentTrack() {

    try {

      document.querySelectorAll(".us-commitment-track").forEach((el) => { el.classList.remove("active"); });

      if (this.game.state.us_commitment_track == 1) { 
        document.querySelector(".us-commitment-track-1").classList.add("active");
      }
      if (this.game.state.us_commitment_track == 2) { 
        document.querySelector(".us-commitment-track-2").classList.add("active");
      }
      if (this.game.state.us_commitment_track == 3) { 
        document.querySelector(".us-commitment-track-3").classList.add("active");
      }
      if (this.game.state.us_commitment_track == 4) { 
        document.querySelector(".us-commitment-track-4").classList.add("active");
      }

    } catch (err) {

    }

  }

  displayRussianCapitulationTrack() {

    try {

      document.querySelectorAll(".russian-capitulation-track").forEach((el) => { el.classList.remove("active"); });

      if (this.game.state.russian_capitulation_track == 1) { 
        document.querySelector(".russian-capitulation-track-1").classList.add("active");
      }
      if (this.game.state.russian_capitulation_track == 2) { 
        document.querySelector(".russian-capitulation-track-2").classList.add("active");
      }
      if (this.game.state.russian_capitulation_track == 3) { 
        document.querySelector(".russian-capitulation-track-3").classList.add("active");
      }
      if (this.game.state.russian_capitulation_track == 4) { 
        document.querySelector(".russian-capitulation-track-4").classList.add("active");
      }
      if (this.game.state.russian_capitulation_track == 5) { 
        document.querySelector(".russian-capitulation-track-5").classList.add("active");
      }
      if (this.game.state.russian_capitulation_track == 6) { 
        document.querySelector(".russian-capitulation-track-6").classList.add("active");
      }
      if (this.game.state.russian_capitulation_track == 7) { 
        document.querySelector(".russian-capitulation-track-7").classList.add("active");
      }
      if (this.game.state.russian_capitulation_track == 8) { 
        document.querySelector(".russian-capitulation-track-8").classList.add("active");
      }

    } catch (err) {

    }


  }

  displayReserveBoxes() {

    try {

      let arb = document.querySelector(".allies-reserve-box");
      let crb = document.querySelector(".central-reserve-box");

      arb.innerHTML = "";
      crb.innerHTML = "";

      for (let z = 0; z < this.game.spaces["arbox"].units.length; z++) {
	if (this.game.spaces["arbox"].units[z].damaged) {
          arb.innerHTML += `<img class="army-tile ${this.game.spaces["arbox"].units[z].key}" src="/paths/img/army/${this.game.spaces["arbox"].units[z].back}" />`;
        } else {
          arb.innerHTML += `<img class="army-tile ${this.game.spaces["arbox"].units[z].key}" src="/paths/img/army/${this.game.spaces["arbox"].units[z].front}" />`;
	}
      }
      for (let z = 0; z < this.game.spaces["crbox"].units.length; z++) {
	if (this.game.spaces["crbox"].units[z].damaged) {
          crb.innerHTML += `<img class="army-tile ${this.game.spaces["crbox"].units[z].key}" src="/paths/img/army/${this.game.spaces["crbox"].units[z].back}" />`;
        } else {
          crb.innerHTML += `<img class="army-tile ${this.game.spaces["crbox"].units[z].key}" src="/paths/img/army/${this.game.spaces["crbox"].units[z].front}" />`;
	}
      }

    } catch (err) {

    }

  }

  displayEliminatedUnitsBoxes() {

    try {

      let arb = document.querySelector(".allies-eliminated-units-box");
      let crb = document.querySelector(".central-eliminated-units-box");

      arb.innerHTML = "";
      crb.innerHTML = "";

      for (let z = 0; z < this.game.state.eliminated['allies'].length; z++) {
        arb.innerHTML += `<img class="army-tile ${this.game.state.eliminated["allies"][z].key}" src="/paths/img/army/${this.game.state.eliminated['allies'][z]}.png" />`;
      }
      for (let z = 0; z < this.game.state.eliminated['central'].length; z++) {
        crb.innerHTML += `<img class="army-tile ${this.game.state.eliminated["central"][z].key}" src="/paths/img/army/${this.game.state.eliminated['central'][z]}.png" />`;
      }

    } catch (err) {

    }

  }




  returnEventObjects() {

    let z = [];

    //
    // cards in the deck can modify gameloop
    //
    for (let key in this.deck) {
      z.push(this.deck[key]);
    }

    return z;

  }



  addEvents(obj) {

    ///////////////////////
    // game state events //
    ///////////////////////
    //
    // these events run at various points of the game. They are attached to objs
    // on object initialization, so that the objects can have these events 
    // triggered at various points of the game automatically.
    //
    // 1 = fall through, 0 = halt game
    //
    if (obj.handleGameLoop == null) {
      obj.handleGameLoop = function(paths_self, qe, mv) { return 1; } // 1 means fall-through / no-stop
    }

    //
    // functions for convenience
    //
    if (obj.menuOptionTriggers == null) {
      obj.menuOptionTriggers = function(paths_self, stage, player, faction) { return 0; }
    }
    if (obj.menuOption == null) {
      obj.menuOption = function(paths_self, stage, player, faction) { return 0; }
    }
    if (obj.menuOptionActivated == null) {
      obj.menuOptionActivated = function(paths_self, stage, player, faction) { return 0; }
    }

    return obj;

  }



  returnSpaceNameForLog(spacekey) {
    return `<span data-spacekey="${spacekey}" class="pulse-trigger">${this.game.spaces[spacekey].name}</span>`;
  }

  convertCountryToPower(country="", power="allies") {
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].country == country) {
	this.game.spaces[key].control = power;
      }
    }
  }

  returnArrayOfSpacekeysForPlacingReinforcements(country="") {

    let options = [];

    if (country == "england") {
      if (this.game.spaces["london"].control == "allies" && this.game.spaces["london"].units.length < 3) { options.push("london"); }
    }
    if (country == "usa") {
      if (this.game.spaces["larochelle"].control == "allies" && this.game.spaces["larochelle"].units.length < 3) { options.push("larochelle"); }
      if (this.game.spaces["nantes"].control == "allies" && this.game.spaces["nantes"].units.length < 3) { options.push("nantes"); }
      if (this.game.spaces["cherbourg"].control == "allies" && this.game.spaces["cherbourg"].units.length < 3) { options.push("cherbourg"); }
      if (this.game.spaces["lahavre"].control == "allies" && this.game.spaces["lahavre"].units.length < 3) { options.push("lahavre"); }
      if (this.game.spaces["calais"].control == "allies" && this.game.spaces["calais"].units.length < 3) { options.push("calais"); }
      if (this.game.spaces["bordeaux"].control == "allies" && this.game.spaces["bordeaux"].units.length < 3) { options.push("bordeaux"); }
    }
    if (country == "france") {
      if (this.game.spaces["paris"].control == "allies" && this.game.spaces["paris"].units.length < 3) { options.push("paris"); }
      if (this.game.spaces["paris"].control == "allies" && this.game.spaces["paris"].units.length >= 3) {
        if (this.game.spaces["orleans"].control == "allies" && this.game.spaces["orleans"].units.length < 3) { options.push("orleans"); }
      }
    }
    if (country == "italy") {
      if (this.game.spaces["rome"].control == "allies" && this.game.spaces["rome"].units.length < 3) { options.push("rome"); }
    }
    if (country == "romania") {
      if (this.game.spaces["bucharest"].control == "allies" && this.game.spaces["bucharest"].units.length < 3) { options.push("bucharest"); }
    }
    if (country == "russia") {
      if (this.game.spaces["moscow"].control == "allies" && this.game.spaces["moscow"].units.length < 3) { options.push("moscow"); }
      if (this.game.spaces["caucasus"].control == "allies" && this.game.spaces["caucasus"].units.length < 3) { options.push("caucasus"); }
      if (this.game.spaces["kharkov"].control == "allies" && this.game.spaces["kharkov"].units.length < 3) { options.push("kharkov"); }
      if (this.game.spaces["petrograd"].control == "allies" && this.game.spaces["petrograd"].units.length < 3) { options.push("petrograd"); }
    }
    if (country == "serbia") {
      if (this.game.spaces["belgrade"].control == "allies" && this.game.spaces["belgrade"].units.length < 3) { options.push("belgrade"); }
    }


    if (country == "germany") {
      if (this.game.spaces["berlin"].control == "central" && this.game.spaces["berlin"].units.length < 3) { options.push("berlin"); }
      if (this.game.spaces["breslau"].control == "central" && this.game.spaces["breslau"].units.length < 3) { options.push("breslau"); }
      if (this.game.spaces["essen"].control == "central" && this.game.spaces["essen"].units.length < 3) { options.push("essen"); }
    }
    if (country == "austria") {
      if (this.game.spaces["vienna"].control == "central" && this.game.spaces["vienna"].units.length < 3) { options.push("vienna"); }
    }
    if (country == "bulgaria") {
      if (this.game.spaces["sofia"].control == "central" && this.game.spaces["sofia"].units.length < 3) { options.push("sofia"); }
    }

    for (let i = options.length-1; i > 0; i--) {
      if (this.game.spaces[options[i]].fort > 0 && this.game.spaces[options[i]].besieged) { options.splice(i, 1); }
    }

    return options;

  }

  returnSpaceName(spacekey) {
    return this.game.spaces[spacekey].name;
  }

  activateSpaceForCombat(spacekey) {
    this.game.spaces[spacekey].activated_for_combat = 1;
    this.displaySpace(spacekey);
  }

  activateSpaceForMovement(spacekey) {
    this.game.spaces[spacekey].activated_for_movement = 1;
    this.displaySpace(spacekey);
  }

  canSpaceFlank(spacekey) {
    if (this.game.spaces[spacekey].units.length == 0) { return 0; }
    let enemy_units = 0;
    let faction = this.returnPowerOfUnit(this.game.spaces[spacekey].units[0]);
    for (let z = 0; z < this.game.spaces[spacekey].neighbours.length; z++) {
      let n = this.game.spaces[this.game.spaces[spacekey].neighbours[z]];
      if (n.units.length > 0) {
	if (this.returnPowerOfUnit(n.units[0]) != faction) {
	  enemy_units++;
	}
      }
    }
    if (enemy_units == 1) { return 1; }
    return 0;
  }

  addTrench(spacekey, level=0) {
    if (level != 0) {
      this.game.spaces[spacekey].trench = level;
      return;
    }
    if (this.game.spaces[spacekey].trench == 1) {
      this.game.spaces[spacekey].trench = 2;
    }
    if (this.game.spaces[spacekey].trench == 0) {
      this.game.spaces[spacekey].trench = 1;
    }
  }
  removeTrench(spacekey, level=0) {
    if (level != 0) {
      this.game.spaces[spacekey].trench = level;
      return;
    }
    if (this.game.spaces[spacekey].trench == 1) {
      this.game.spaces[spacekey].trench = 0;
    }
    if (this.game.spaces[spacekey].trench == 2) {
      this.game.spaces[spacekey].trench = 1;
    }
  }

  doesSpaceHaveUnit(spacekey, unitkey) {
    let space = this.game.spaces[spacekey];
    if (space) {
      for (let z = 0; z < space.units.length; z++) {
        if (space.units[z].key == unitkey) { return 1; }
      }
    }
    return 0;
  }
  doesSpaceHaveEnemyUnits(faction, spacekey) { return this.doesSpaceContainEnemyUnits(faction, spacekey); }
  doesSpaceContainEnemyUnits(faction, spacekey) {
    if (this.game.spaces[spacekey].control != faction) {
      if (this.game.spaces[spacekey].units.length > 0) { return 1; }
    }
    return 0;
  }
  isSpaceEnemyControlled(faction, spacekey) {
    if (this.game.spaces[spacekey].control != "neutral" && this.game.spaces[spacekey].control != faction) { return 1; }
    return 0;
  }

  returnFriendlyControlledPorts(faction) {
    let ports = [];
    for (let key in this.game.spaces) {
      if (faction == "allies" && this.game.spaces[key].port == 1 && this.game.spaces[key].control == "allies") { ports.push(key); }
      if (faction == "central" && this.game.spaces[key].port == 2 && this.game.spaces[key].control == "central") { ports.push(key); }
    }
    return ports;
  }

  returnSpacesConnectedToSpaceForStrategicRedeployment(faction, spacekey) {

    let spaces = [];
    let pending = [spacekey];
    let examined = {};

    while (pending.length > 0) {

      let current = pending.shift();

      //
      // mark space as examined
      //
      examined[current] = true;

      //
      //
      //
      let loop = 0;

      if (!this.isSpaceEnemyControlled(faction, current)) {
        loop = 1;
        if (this.doesSpaceHaveEnemyUnits(faction, current)) {
	  loop = 0;
	}
      }

      if (loop == 1) {

	//
	// this is a possible destination!
	//
        spaces.push(current);

        //
        // add neighbours to pending if...
        //
        for (let n in this.game.spaces[current].neighbours) {
          let s = this.game.spaces[current].neighbours[n];
          if (!examined[s]) {
            if (this.returnControlOfSpace(s) == faction) {
              pending.push(s);
            }
          }
        }
      }
    }

    return spaces;

  }




  checkSupplyStatus(faction="", spacekey="") {

let trace_supply = 0;
if (spacekey == "batum") {
  trace_supply = 1;
}

    //
    // if we call this function generically, it means we want
    // to check the supply status of every unit on the board
    // and update their visuals.
    //
    if (faction == "" && spacekey == "") {
      for (let key in this.game.spaces) {
	if (this.game.spaces[key].oos == 1) {
	  this.game.spaces[key].oos = 0;
	  this.displaySpace(key);
	}
      }

      for (let key in this.game.spaces) {
	if (key == "crbox" || key == "arbox" || key == "ceubox" || key == "aeubox") {
	} else {
	  if (this.game.spaces[key].units.length > 0) {
	    let space = this.game.spaces[key];
	    let supplied = false;
	    for (let z = 0; z < space.units.length; z++) {
	      let u = space.units[z];
	      //
	      // some units manage their own supply
	      //
	      if (this.game.units[u.key].checkSupplyStatus(this, key) == 1) { 
console.log("unit: " + u.name + " w " + u.key + " --- " + key);
		supplied = true;
	      }
	      if (this.checkSupplyStatus(u.ckey.toLowerCase(), key)) {
	        z = space.units.length+1;
	        supplied = true;
	      }
	    }
	    if (supplied == false) {
	      let obj = document.querySelector(`.${key}`);
	      if (!obj.classList.contains("oos-highlight")) { 
	        obj.classList.add("oos-highlight");
	        this.game.spaces[key].oos = 1;
	        this.displaySpace(key);
	      }
	    }
	  }
	}
      }
      return;
    }

    this.game.spaces[spacekey].supply = {};
    this.game.spaces[spacekey].oos = 0;

    let ports_added = false;
    let pending = [spacekey];
    let examined = {};
    let sources = [];
    let controlling_faction = "allies";

    if (faction == "cp" || faction == "ge" || faction == "austria" || faction == "germany" || faction == "ah" || faction == "central") { sources = ["essen","breslau","sofia","constantinople"]; controlling_faction = "central"; }
    if (faction == "be" || faction == "belgium") { sources = ["london"]; }
    if (faction == "fr" || faction == "france") { sources = ["london"]; }
    if (faction == "ap" || faction == "allies") { sources = ["london"]; }
    if (faction == "ru" || faction == "russia") { sources = ["moscow","petrograd","kharkov","caucasus"]; }
    if (faction == "ro" || faction == "romania") { sources = ["moscow","petrograd","kharkov","caucasus"]; }
    if (faction == "sb" || faction == "serbia") { 
      sources = ["moscow","petrograd","kharkov","caucasus","london"]; 
      if (this.returnControlOfSpace("salonika") == "allies") { sources["sb"].push("salonika"); }
    }
    if (sources.length == 0) {
      sources = ["london"];
    }
    let ports = this.returnFriendlyControlledPorts(controlling_faction);

    while (pending.length > 0) {

      let current = pending.shift();

      //
      // if spacekey is a source we have a supply-line
      //
      if (sources.includes(current)) {
	this.displaySpace(spacekey);
	return 1;
      }

      //
      // mark space as examined
      //
      examined[current] = true;

      //
      // add neighbours to pending if...
      //
      for (let n in this.game.spaces[current].neighbours) {
        let s = this.game.spaces[current].neighbours[n];
        if (!examined[s]) {
	  if (this.returnControlOfSpace(s) == controlling_faction) {
	    //
	    // only if not besieged
	    //
	    if (this.game.spaces[s].fort > 0) {
	      if (this.game.spaces[s].units.length > 0) {
		if (this.returnPowerOfUnit(this.game.spaces[s].units[0]) != controlling_faction) {
		  //
		  // besieging unit blocking supply channel
		  //
		} else {
	          pending.push(s); 
		}
	      } else {
	        pending.push(s); 
	      }
	    } else {
	      pending.push(s); 
	    }
	  } else {
	    if (this.game.spaces[s].fort > 0) {
	      if (this.game.spaces[s].units.length > 0) {
		//
		// we can still trace supply through besieged spaces with our units
		//
		if (this.returnPowerOfUnit(this.game.spaces[s].units[0]) == controlling_faction) {
	    	  pending.push(s); 
		}
	      }
	    }
	  }
	}
      }


      if (ports_added == false) {
	if (controlling_faction == "allies" && this.game.spaces[current].port == 1 && this.game.spaces[current].control == "allies") {
 	  for (let i = 0; i < ports.length; i++) {
	    if (this.game.spaces[ports[i]].control == "allies") {
	      pending.push(ports[i]);
	    }
	  }
	  ports_added = true;
	}
	if (controlling_faction == "central" && this.game.spaces[current].port == 2 && this.game.spaces[current].control == "central") {
 	  for (let i = 0; i < ports.length; i++) {
	    if (this.game.spaces[ports[i]].control == "central") {
	      pending.push(ports[i]);
	    }
	  }
	  ports_added = true;
	}
      }

    }

    //
    // exiting means no supply
    //
    if (this.game.spaces[spacekey].units.length > 0) {
      if (spacekey != "crbox" && spacekey != "arbox" && spacekey != "ceubox" && spacekey != "aeubox") {
	let is_supplied = false;
	for (let z = 0; z < this.game.spaces[spacekey].units.length; z++) {
	  let u = this.game.spaces[spacekey].units[z];
	  if (this.game.units[u.key].checkSupplyStatus(this, spacekey) == 1) { 
	    is_supplied = true;
	  }
	}
	if (!is_supplied) {
          let obj = document.querySelector(`.${spacekey}`);
          obj.classList.add("oos-highlight");
          this.game.spaces[spacekey].oos = 1;
          this.displaySpace(spacekey);
        }
      }
    }


    return 0;
  }


  returnControlOfSpace(key) {
    let space = this.game.spaces[key];
    if (space.control) { return space.control; }
    if (space.units.length > 0) { return this.returnPowerOfUnit(space.units[0]); }
    return "";
  }

  returnActivationCost(faction, key) {

    let space = this.game.spaces[key];
    let units = [];
    let countries = {};
    let total_nationalities = 0;

    for (let i = 0; i < space.units.length; i++) {
      if (!units.includes(space.units[i].ckey)) {
	let u = space.units[i];
	let ckey = space.units[i].ckey;
	if (key == "antwerp" || key == "ostend" || key == "calais" || key == "amiens") { if (ckey == "BE") { ckey = "BR"; } }
	if (ckey == "ANA" || ckey == "BR" || ckey == "AUS" || ckey == "CND" || ckey == "PT") { ckey = "BR"; }
	if (ckey == "US" || ckey == "FR") { if (space.country == "france") { ckey = "FR"; } }
	if (ckey == "SN") { ckey = "TU"; }
	if (ckey == "MN") { ckey = "SB"; }
	if (!countries[ckey]) { countries[ckey] = 0; } 
	countries[ckey] += 1;
	units.push(space.units[i].ckey);
      }
    }

    for (let key in countries) { total_nationalities++; }

    if (faction == "allies") {
      if (this.game.state.events.everyone_into_battle == 1) {
	if (space.country == "italy" || space.country == "france" || space.country == "belgium") { return 1; }
      }
    }
    

    if (faction == "central") {
      if (this.game.state.events.eleventh_army == 1) {
	let has_eleventh_army = false;
	let has_other_army = false;
	let number_cp_corps = 0;
	for (let z = 0; z < space.units.length; z++) {
	  if (space.units[z].corps) { number_cp_corps++; }
	  if (space.units[z].key == "ge_army11") { has_eleventh_army = true; }
	  if (space.units[z].key != "ge_army11" && space.units[z].army) { has_other_army = true; }
        }
        if (has_eleventh_army) { return this.game.spaces[key].units.length - number_cp_corps; }
        if (has_other_army) { return this.game.spaces[key].units.length - number_cp_corps + 1; }
      }

      if (this.game.state.events.falkenhayn != 1 && this.game.state.events.moltke == 1 && (space.country == "france" || space.country == "belgium")) {
        if (space.units.length == 1) { return 1; }
        if (space.units.length == 2) { return 2; }
        if (space.units.length == 3) { return 3; }
      }
      if (this.game.state.events.sudarmy == 1) {
	if (countries["GE"] >= 1 && countries["AH"] == 1) {
	  let sud_army_eligible = false;
	  let sud_army_excess_cost = 0;
	  for (let z = 0; z < space.units.length; z++) {
	    if (space.units[z].ckey == "AH" && space.units[z].army) { sud_army_eligible = true; }
	    if (space.units[z].ckey == "AH" && space.units[z].corps) { sud_army_excess_cost++; }
	    if (space.units[z].ckey == "GE" && space.units[z].army) { sud_army_excess_cost++; }
	    if (space.units[z].ckey != "GE" && space.units[z].ckey != "AH") { sud_army_excess_cost++; }
	  }
	  if (sud_army_eligible == true) {
	    return (1 + sud_army_excess_cost);
	  }
	}
      }
    }

    return total_nationalities;

  }

  returnSpacesWithFilter(filter_func) {
    let spaces = [];
    for (let key in this.game.spaces) {
      if (filter_func(key) == 1) { spaces.push(key); }
    }
    return spaces;
  } 

  returnNumberOfSpacesWithFilter(filter_func) {
    let count = 0;
    for (let key in this.game.spaces) {
      if (filter_func(key) == 1) {
        count++;
      }
    }
    return count;
  }

  returnSpacesWithinHops(source, limit=0, passthrough_func=null, unit=null) {

    let paths_self = this;

    try { if (this.game.spaces[source]) { source = this.game.spaces[source]; } } catch (err) {}
    if (limit == 0) { return [source.key]; }
    let hop = 0;
    let old = [];

    let addHop = function(news, hop) {     

      hop++;
      let newer = [];

      //
      //
      for (let i = 0; i < news.length; i++) {

	let passthrough = true;
	if (passthrough_func != null) { if (!passthrough_func(news[i])) { passthrough = false; } } 

	//
	// don't add anything that isn't passthrough, and don't process any of its
	// neighbours since we cannot route through it.
	//
	if (passthrough) {
          for (let z = 0; z < paths_self.game.spaces[news[i]].neighbours.length; z++) {
            let n = paths_self.game.spaces[news[i]].neighbours[z];

	    //
	    // we submit unit when calculating movement, so that we can 
	    // determine if units can move between depots etc.
	    //
	    let restricted_movement = false;
	    if (unit != null) {
	      let lim = paths_self.game.spaces[news[i]].limits;
	      if (lim) {
	        for (let z = 0; z < lim.length; z++) {
		  if (lim[z][n]) {
		    restricted_movement = true;
		    if (lim[z][n] == unit.ckey) { restricted_movement = false; }
		  }
		}
	      }
	    }

	    if (restricted_movement == false) {
              if (!old.includes(n)) {
                if (!news.includes(n)) {
                  if (!newer.includes(n)) {
                    if (n !== source.key) {
	              newer.push(n);
	            }
	          }
	        }
	      }
	    }
          }

          if (hop != 1) {
	    if (!old.includes(news[i])) {
	      if (news[i] !== source.key) {
	        old.push(news[i]);
	      }
            }
          }
        }
      }

      if (hop <= limit) {
	  return addHop(newer, hop);
      } else {
	  return old;
      }

    }

    return addHop([source.key], 0); 

  }

  returnHopsToDestination(source, destination, limit=0) {
    try { if (this.game.spaces[source]) { source = this.game.spaces[source]; } } catch (err) {}
    try { if (this.game.spaces[destination]) { destination = this.game.spaces[destination]; } } catch (err) {}
    return this.returnHopsBetweenSpacesWithFilter(source, limit=0, function(spacekey) {
      if (spacekey === destination.key) { return 1; }
      return 0;  
    });
  }

  returnHopsBetweenSpacesWithFilter(space, limit=0, filter_func) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    let paths_self = this;
    let map = {};
    let sources = [];
    let hop = 0;

    let addHop = function(sources, hop) {

      hop++;

      if (hop > limit && limit > 0) { return 0; }      

      let new_neighbours = [];

      for (let i = 0; i < sources.length; i++) {

        if (!map[sources[i]]) {

	  for (let z = 0; z < paths_self.game.spaces[sources[i]].neighbours.length; z++) {
	    let sourcekey = paths_self.game.spaces[sources[i]].neighbours[z];
	    if (!map[sourcekey]) {

	      //
	      // if we have a hit, it's this many hops!
	      //
	      if (filter_func(sourcekey)) { return hop; }

	      //
	      // otherwise queue for next hop
	      //
	      if (!new_neighbours.includes(sourcekey)) { new_neighbours.push(sourcekey); }

	    }
	  }

	  map[sources[i]] = 1;

	}
      }

      if (new_neighbours.length > 0 && hop < limit) {
	return addHop(new_neighbours, hop);
      } else {
	return 0;
      }

    }

    return addHop(space.neighbours, 0);   

  }



  returnSpacekeysByCountry(country="") {
    let s = this.returnSpaces();
    let keys = [];
    for (let k in s) {
      if (s[k].country == country) { keys.push(k); }
    }
    return keys;
  }


  returnSpaces() {

    let spaces = {};


//
// ENGLAND
//
spaces['london'] = {
    name: "London" ,
    control : "allies" ,
    top: 1036 ,
    left: 316 , 
    neighbours: ["cherbourg", "lehavre", "calais"] ,
    terrain : "normal" ,
    vp : false ,
    port : 1 ,
    country : "england" ,
   }

//
// FRANCE
//
spaces['calais'] = {
    name: "Calais" ,
    control : "allies" ,
    top: 1135 ,
    left: 542 ,
    neighbours: ["ostend", "cambrai", "amiens", "london"] ,
    limits : [ { "london" : ["BR"] } ] ,
    terrain : "swamp" ,
    vp : true ,
    port : 1 ,
    country : "france" ,
   }

spaces['amiens'] = {
    name: "Amiens" ,
    control : "allies" ,
    top: 1263 ,
    left: 575 , 
    neighbours: ["calais", "cambrai", "paris", "rouen"] ,
    terrain : "normal" ,
    vp : true ,
    port : 0 ,
    country : "france" ,
   }

spaces['cambrai'] = {
    name: "Cambrai" ,
    control : "allies" ,
    top: 1264 ,
    left: 702 ,
    neighbours: ["amiens", "calais", "brussels", "sedan", "chateauthierry"] ,
    terrain : "normal" ,
    vp : true , 
    port : 0 ,
    country : "france" ,
   }

spaces['sedan'] = {
    name: "Sedan" ,
    control : "allies" ,
    top: 1260 ,
    left: 843 , 
    neighbours: ["cambrai", "koblenz", "brussels", "liege", "chateauthierry", "verdun", "metz"] ,
    terrain : "forest" ,
    vp : true , 
    port : 0 ,
    country : "france" ,
   }

spaces['verdun'] = {
    name: "Verdun" ,
    control : "allies" ,
    fort : 3 ,
    top: 1354 ,
    left: 942 , 
    neighbours: ["sedan", "chateauthierry", "barleduc", "nancy", "metz"] ,
    terrain : "normal" ,
    vp : true , 
    port : 0 ,
    country : "france" ,
   }

spaces['chateauthierry'] = {
    name: "Chateau Thierry" ,
    control : "allies" ,
    top: 1405 ,
    left: 780 , 
    neighbours: ["cambrai", "sedan", "paris", "verdun", "barleduc", "melun"] ,
    terrain : "normal" ,
    vp : false , 
    port : 0 ,
    country : "france" ,
   }



spaces['paris'] = {
    name: "Paris" ,
    control : "allies" ,
    fort : 1 ,
    top: 1420 ,
    left: 621 , 
    neighbours: ["rouen", "amiens", "chateauthierry", "melun", "orleans"] ,
    terrain : "normal" ,
    vp : true , 
    country : "france" ,
   }


spaces['rouen'] = {
    name: "Rouen" ,
    control : "allies" ,
    top: 1380 ,
    left: 480 , 
    neighbours: ["lehavre", "amiens", "paris", "lemans", "caen"] ,
    terrain : "normal" ,
    vp : true , 
    country : "france" ,
   }

spaces['lehavre'] = {
    name: "Le Havre" ,
    control : "allies" ,
    top: 1311 ,
    left: 363 , 
    neighbours: ["rouen", "london"] ,
    limits : [ { "london" : ["BR"] } ] ,
    terrain : "normal" ,
    vp : true , 
    port : 1 ,
    country : "france" ,
   }

spaces['cherbourg'] = {
    name: "Cherbourg" ,
    control : "allies" ,
    top: 1304 ,
    left: 159 , 
    neighbours: ["caen", "london"] ,
    limits : [ { "london" : ["BR"] } ] ,
    terrain : "normal" ,
    vp : false , 
    port : 1 ,
    country : "france" ,
   }

spaces['barleduc'] = {
    name: "Bar le Duc" ,
    control : "allies" ,
    top: 1525 ,
    left: 885 , 
    neighbours: ["chateauthierry", "verdun", "nancy", "melun", "dijon"] ,
    terrain : "normal" ,
    vp : true , 
    country : "france" ,
   }

spaces['caen'] = {
    name: "Caen" ,
    control : "allies" ,
    top: 1413 ,
    left: 249 , 
    neighbours: ["cherbourg", "rouen", "lemans"] ,
    terrain : "normal" ,
    vp : false , 
    country : "france" ,
   }

spaces['rennes'] = {
    name: "Rennes" ,
    control : "allies" ,
    top: 1533 ,
    left: 171 , 
    neighbours: ["lemans", "nantes"] ,
    terrain : "normal" ,
    vp : false , 
    country : "france" ,
   }

spaces['lemans'] = {
    name: "Le Mans" ,
    control : "allies" ,
    top: 1522 ,
    left: 362 , 
    neighbours: ["caen", "rouen", "rennes", "nantes", "tours", "orleans"] ,
    terrain : "normal" ,
    vp : false , 
    country : "france" ,
   }

spaces['orleans'] = {
    name: "Orleans" ,
    control : "allies" ,
    top: 1575 ,
    left: 561 , 
    neighbours: ["lemans", "paris", "melun", "stamand", "tours"] ,
    terrain : "normal" ,
    vp : true , 
    country : "france" ,
   }

spaces['melun'] = {
    name: "Melun" ,
    control : "allies" ,
    top: 1551 ,
    left: 724 , 
    neighbours: ["paris", "chateauthierry", "barleduc", "nevers", "orleans"] ,
    terrain : "normal" ,
    vp : true , 
    country : "france" ,
   }

spaces['nancy'] = {
    name: "Nancy" ,
    control: "allies" ,
    fort : 2 ,
    top: 1490 ,
    left: 1011 , 
    neighbours: ["barleduc", "verdun", "metz", "strasbourg", "belfort"] ,
    terrain : "normal" ,
    vp : true , 
    country : "france" ,
   }

spaces['nantes'] = {
    name: "Nantes" ,
    control: "allies" ,
    top: 1663 ,
    left: 157 , 
    neighbours: ["rennes","lemans","tours","larochelle"] ,
    terrain : "normal" ,
    vp : false ,
    port : 1 ,
    country : "france" ,
   }

spaces['tours'] = {
    name: "Tours" ,
    control: "allies" ,
    top: 1646 ,
    left: 414 , 
    neighbours: ["lemans", "orleans", "stamand", "poitiers", "nantes"] ,
    terrain : "normal" ,
    vp : false , 
    country : "france" ,
   }

spaces['larochelle'] = {
    name: "La Rochelle" ,
    control: "allies" ,
    top: 1814 ,
    left: 236 , 
    neighbours: ["nantes", "poitiers", "bordeaux"] ,
    terrain : "normal" ,
    vp : false , 
    port : 1 ,
    country : "france" ,
   }

spaces['bordeaux'] = {
    name: "Bordeaux" ,
    control: "allies" ,
    top: 1986 ,
    left: 274 , 
    neighbours: ["larochelle"] ,
    terrain : "normal" ,
    vp : false , 
    port : 1 ,
    country : "france" ,
   }

spaces['poitiers'] = {
    name: "Poitiers" ,
    control: "allies" ,
    top: 1790 ,
    left: 405 , 
    neighbours: ["larochelle", "tours"] ,
    terrain : "normal" ,
    vp : false , 
    country : "france" ,
   }

spaces['stamand'] = {
    name: "St. Amand" ,
    control: "allies" ,
    top: 1743 ,
    left: 598 , 
    neighbours: ["tours", "orleans", "nevers"] ,
    terrain : "normal" ,
    vp : false , 
    country : "france" ,
   }

spaces['nevers'] = {
    name: "Nevers" ,
    control: "allies" ,
    top: 1721 ,
    left: 757 , 
    neighbours: ["stamand", "melun", "dijon", "lyon"] ,
    terrain : "normal" ,
    vp : false , 
    country : "france" ,
   }

spaces['dijon'] = {
    name: "Dijon" ,
    control: "allies" ,
    top: 1701 ,
    left: 936 , 
    neighbours: ["nevers", "barleduc", "belfort"] ,
    terrain : "normal" ,
    vp : true , 
    country : "france" ,
   }

spaces['lyon'] = {
    name: "Lyon" ,
    control: "allies" ,
    top: 1883 ,
    left: 869 , 
    neighbours: ["nevers", "avignon", "grenoble"] ,
    terrain : "normal" ,
    vp : false , 
    country : "france" ,
   }

spaces['avignon'] = {
    name: "Avignon" ,
    control: "allies" ,
    top: 2058 ,
    left: 824 , 
    neighbours: ["lyon", "marseilles"] ,
    terrain : "normal" ,
    vp : false , 
    country : "france" ,
   }

spaces['marseilles'] = {
    name: "Marseilles" ,
    control: "allies" ,
    top: 2232 ,
    left: 912 , 
    neighbours: ["avignon", "nice"] ,
    terrain : "normal" ,
    vp : false , 
    port : 1 ,
    country : "france" ,
   }

spaces['nice'] = {
    name: "Nice" ,
    control: "allies" ,
    top: 2199 ,
    left: 1077 , 
    neighbours: ["marseilles", "turin"] ,
    terrain : "normal" ,
    vp : false , 
    country : "france" ,
   }

spaces['grenoble'] = {
    name: "Grenoble" ,
    control: "allies" ,
    top: 1944 ,
    left: 1009 , 
    neighbours: ["lyon", "turin"] ,
    terrain : "mountain" ,
    vp : false , 
    country : "france" ,
   }

spaces['belfort'] = {
    name: "Belfort" ,
    control: "allies" ,
    fort : 2 ,
    top: 1635 ,
    left: 1072 , 
    neighbours: ["dijon", "nancy", "mulhouse"] ,
    terrain : "mountain" ,
    vp : false , 
    country : "france" ,
   }

//
// Belgium
//
spaces['ostend'] = {
    name: "Ostend" ,
    control: "neutral" ,
    top: 1048 ,
    left: 663 , 
    neighbours: ["calais", "brussels", "antwerp"] ,
    terrain : "swamp" ,
    vp : true , 
    port : 1 ,
    country : "belgium" ,
   }

spaces['antwerp'] = {
    name: "Antwerp" ,
    control: "neutral" ,
    fort : 1 ,
    top: 1002 ,
    left: 858 , 
    neighbours: ["ostend", "brussels"] ,
    terrain : "normal" ,
    vp : true , 
    country : "belgium" ,
   }

spaces['brussels'] = {
    name: "Brussels" ,
    control: "neutral" ,
    top: 1132 ,
    left: 788 , 
    neighbours: ["ostend", "antwerp", "liege", "sedan", "cambrai"] ,
    terrain : "normal" ,
    vp : true , 
    country : "belgium" ,
   }

spaces['liege'] = {
    name: "Liege" ,
    control: "neutral" ,
    fort : 3 ,
    top: 1144 ,
    left: 951 , 
    neighbours: ["brussels", "aachen", "sedan", "koblenz"] ,
    terrain : "normal" ,
    vp : false , 
    country : "belgium" ,
   }


//
// GERMANY
//
spaces['wilhelmshaven'] = {
    name: "Wilhelmshaven" ,
    control: "central" ,
    top: 690 ,
    left: 1222 , 
    neighbours: ["bremen"] ,
    terrain : "normal" ,
    vp : false , 
      port : 2 ,
    country : "germany" ,
   }

spaces['essen'] = {
    name: "Essen" ,
    control: "central" ,
    top: 991 ,
    left: 1160 , 
    neighbours: ["aachen", "bremen", "kassel"] ,
    terrain : "normal" ,
    vp : true , 
    country : "germany" ,
   }

spaces['aachen'] = {
    name: "Aachen" ,
    control: "central" ,
    top: 1024 ,
    left: 1018 , 
    neighbours: ["liege", "essen", "koblenz"] ,
    terrain : "normal" ,
    vp : true , 
    country : "germany" ,
   }

spaces['koblenz'] = {
    name: "Koblenz" ,
    control: "central" ,
    top: 1162 ,
    left: 1101 , 
    neighbours: ["liege", "aachen", "frankfurt", "sedan", "metz"] ,
    terrain : "normal" ,
    vp : true , 
    country : "germany" ,
   }

spaces['metz'] = {
    name: "Metz" ,
    control: "central" ,
    fort : 3 ,
    top: 1307 ,
    left: 1107 , 
    neighbours: ["verdun", "sedan", "koblenz", "strasbourg", "nancy"] ,
    terrain : "forest" ,
    vp : true , 
    country : "germany" ,
   }

spaces['strasbourg'] = {
    name: "Strasbourg" ,
    control: "central" ,
    fort : 3 ,
    top: 1448 ,
    left: 1184 , 
    neighbours: ["nancy", "metz", "mannheim", "mulhouse"] ,
    terrain : "normal" ,
    vp : true , 
    country : "germany" ,
   }

spaces['mulhouse'] = {
    name: "Mulhouse" ,
    control: "central" ,
    top: 1601 ,
    left: 1214 , 
    neighbours: ["belfort", "strasbourg"] ,
    terrain : "mountain" ,
    vp : false , 
    country : "germany" ,
   }

spaces['stuttgart'] = {
    name: "Stuttgart" ,
    control: "central" ,
    top: 1429 ,
    left: 1342 , 
    neighbours: ["mannheim", "augsburg"] ,
    terrain : "normal" ,
    vp : true , 
    country : "germany" ,
   }

spaces['mannheim'] = {
    name: "Mannheim" ,
    control: "central" ,
    top: 1322 ,
    left: 1256 , 
    neighbours: ["frankfurt", "strasbourg", "stuttgart"] ,
    terrain : "normal" ,
    vp : false , 
    country : "germany" ,
   }

spaces['frankfurt'] = {
    name: "Frankfurt" ,
    control: "central" ,
    top: 1164 ,
    left: 1252 , 
    neighbours: ["koblenz", "kassel", "mannheim"] ,
    terrain : "normal" ,
    vp : true , 
    country : "germany" ,
   }


spaces['kassel'] = {
    name: "Kassel" ,
    control: "central" ,
    top: 1006 ,
    left: 1352 , 
    neighbours: ["essen", "hannover", "frankfurt", "erfurt"] ,
    terrain : "normal" ,
    vp : false , 
    country : "germany" ,
   }

spaces['bremen'] = {
    name: "Bremen" ,
    control: "central" ,
    top: 828 ,
    left: 1299 , 
    neighbours: ["wilhelmshaven", "essen", "hamburg", "hannover"] ,
    terrain : "normal" ,
    vp : false , 
    country : "germany" ,
   }

spaces['kiel'] = {
    name: "Kiel" ,
    control: "central" ,
    top: 618 ,
    left: 1431 , 
    neighbours: ["hamburg"] ,
    terrain : "normal" ,
    vp : false , 
      port : 2 ,
    country : "germany" ,
   }

spaces['hamburg'] = {
    name: "Hamburg" ,
    control: "central" ,
    top: 759 ,
    left: 1431 , 
    neighbours: ["kiel", "bremen", "rostock"] ,
    terrain : "normal" ,
    vp : false , 
    country : "germany" ,
   }

spaces['hannover'] = {
    name: "Hannover" ,
    control: "central" ,
    top: 922 ,
    left: 1549 , 
    neighbours: ["bremen", "kassel", "berlin"] ,
    terrain : "normal" ,
    vp : false , 
    country : "germany" ,
   }

spaces['erfurt'] = {
    name: "Erfurt" ,
    control: "central" ,
    top: 1183 ,
    left: 1527 , 
    neighbours: ["kassel", "leipzig", "nuremberg"] ,
    terrain : "normal" ,
    vp : false , 
    country : "germany" ,
   }

spaces['nuremberg'] = {
    name: "Nuremberg" ,
    control: "central" ,
    top: 1329 ,
    left: 1529 , 
    neighbours: ["erfurt", "augsburg", "regensburg"] ,
    terrain : "normal" ,
    vp : false , 
    country : "germany" ,
   }

spaces['augsburg'] = {
    name: "Augsburg" ,
    control: "central" ,
    top: 1456 ,
    left: 1482 , 
    neighbours: ["stuttgart", "nuremberg", "innsbruck", "regensburg"] ,
    terrain : "normal" ,
    vp : false , 
    country : "germany" ,
   }

spaces['munich'] = {
    name: "Munich" ,
    control: "central" ,
    top: 1506 ,
    left: 1607 , 
    neighbours: ["regensburg", "spittal"] ,
    terrain : "mountain" ,
    vp : true , 
    country : "germany" ,
   }

spaces['regensburg'] = {
    name: "Regensburg" ,
    control: "central" ,
    top: 1390 ,
    left: 1659 , 
    neighbours: ["nuremberg", "augsburg", "munich", "linz"] ,
    terrain : "normal" ,
    vp : false , 
    country : "germany" ,
   }

spaces['leipzig'] = {
    name: "Leipzig" ,
    control: "central" ,
    top: 1062 ,
    left: 1675 , 
    neighbours: ["berlin", "erfurt", "dresden"] ,
    terrain : "normal" ,
    vp : false , 
    country : "germany" ,
   }

spaces['berlin'] = {
    name: "Berlin" ,
    control: "central" ,
    top: 871 ,
    left: 1761 , 
    neighbours: ["rostock", "stettin", "hannover", "cottbus", "leipzig"] ,
    terrain : "normal" ,
    vp : true , 
    country : "germany" ,
   }

spaces['rostock'] = {
    name: "Rostock" ,
    control: "central" ,
    top: 656 ,
    left: 1638 , 
    neighbours: ["hamburg", "stettin", "berlin"] ,
    terrain : "normal" ,
    vp : false , 
    country : "germany" ,
   }

spaces['stettin'] = {
    name: "Stettin" ,
    control: "central" ,
    top: 687 ,
    left: 1911 , 
    neighbours: ["rostock", "kolberg", "berlin"] ,
    terrain : "normal" ,
    vp : false , 
      port : 2 ,
    country : "germany" ,
   }

spaces['cottbus'] = {
    name: "Cottbus" ,
    control: "central" ,
    top: 974 ,
    left: 1911 , 
    neighbours: ["berlin", "posen", "breslau", "dresden"] ,
    terrain : "normal" ,
    vp : false , 
    country : "germany" ,
   }

spaces['dresden'] = {
    name: "Dresden" ,
    control: "central" ,
    top: 1094 ,
    left: 1806 , 
    neighbours: ["leipzig", "cottbus", "prague"] ,
    terrain : "normal" ,
    vp : false , 
    country : "germany" ,
   }

spaces['breslau'] = {
    name: "Breslau" ,
    control: "central" ,
    fort : 2 ,
    top: 1091 ,
    left: 2157 , 
    neighbours: ["cottbus", "posen", "lodz", "oppeln"] ,
    terrain : "normal" ,
    vp : true , 
    country : "germany" ,
   }

spaces['oppeln'] = {
    name: "Oppeln" ,
    control: "central" ,
    top: 1146 ,
    left: 2314 , 
    neighbours: ["breslau", "olmutz", "czestochowa", "cracow"] ,
    terrain : "normal" ,
    vp : false , 
    country : "germany" ,
   }

spaces['posen'] = {
    name: "Posen" ,
    control: "central" ,
    fort : 2 ,
    top: 904 ,
    left: 2151 , 
    neighbours: ["cottbus", "thorn", "breslau", "lodz"] ,
    terrain : "normal" ,
    vp : true , 
    country : "germany" ,
   }

spaces['kolberg'] = {
    name: "Kolberg" ,
    control: "central" ,
    top: 632 ,
    left: 2115 , 
    neighbours: ["stettin", "danzig"] ,
    terrain : "normal" ,
    vp : false , 
      port : 2 ,
    country : "germany" ,
   }

spaces['thorn'] = {
    name: "Thorn" ,
    control: "central" ,
    fort : 2 ,
    top: 767 ,
    left: 2248 , 
    neighbours: ["danzig", "tannenberg", "plock", "lodz", "posen"] ,
    terrain : "normal" ,
    vp : false , 
    country : "germany" ,
   }

spaces['danzig'] = {
    name: "Danzig" ,
    control: "central" ,
    fort : 2 ,
    top: 609 ,
    left: 2332 , 
    neighbours: ["kolberg", "tannenberg", "thorn"] ,
    terrain : "normal" ,
    vp : true , 
      port : 2 ,
    country : "germany" ,
   }

spaces['konigsberg'] = {
    name: "Konigsberg" ,
    control: "central" ,
    fort : 3 ,
    top: 549 ,
    left: 2514 , 
    neighbours: ["insterberg", "tannenberg"] ,
    terrain : "normal" ,
    vp : true , 
    port : 2 ,
    country : "germany" ,
   }

spaces['tannenberg'] = {
    name: "Tannenberg" ,
    control: "central" ,
    top: 717 ,
    left: 2507 , 
    neighbours: ["danzig", "konigsberg", "insterberg", "lomza", "plock", "thorn"] ,
    terrain : "forest" ,
    vp : false , 
    country : "germany" ,
   }

spaces['insterberg'] = {
    name: "Insterberg" ,
    control: "central" ,
    top: 636 ,
    left: 2666 , 
    neighbours: ["tannenberg", "konigsberg", "memel", "kovno", "grodno"] ,
    terrain : "forest" ,
    vp : false , 
    country : "germany" ,
   }

spaces['memel'] = {
    name: "Memel" ,
    control: "central" ,
    top: 422 ,
    left: 2614 , 
    neighbours: ["libau", "szawli", "insterberg"] ,
    terrain : "normal" ,
    vp : false , 
      port : 2 ,
    country : "germany" ,
   }

spaces['mulhouse'] = {
    name: "Mulhouse" ,
    control: "central" ,
    top: 1600 ,
    left: 1214 , 
    neighbours: ["belfort", "strasbourg"] ,
    terrain : "mountain" ,
    vp : false , 
    country : "germany" ,
   }


//
// ITALY
//
spaces['turin'] = {
    name: "Turin" ,
    control: "allies" ,
    top: 1966 ,
    left: 1161 , 
    neighbours: ["grenoble", "nice", "milan", "genoa"] ,
    terrain : "normal" ,
    vp : false , 
    country : "italy" ,
   }

spaces['milan'] = {
    name: "Milan" ,
    control: "allies" ,
    top: 1910 ,
    left: 1324 , 
    neighbours: ["turin", "genoa", "verona"] ,
    terrain : "normal" ,
    vp : true , 
    country : "italy" ,
   }

spaces['genoa'] = {
    name: "Genoa" ,
    control: "allies" ,
    top: 2068 ,
    left: 1301 , 
    neighbours: ["turin", "milan", "bologna"] ,
    terrain : "normal" ,
    vp : true , 
    port : 1 ,
    country : "italy" ,
   }

spaces['verona'] = {
    name: "Verona" ,
    control: "allies" ,
    top: 1915 ,
    left: 1505 , 
    neighbours: ["trent", "milan", "bologna", "venice"] ,
    terrain : "normal" ,
    vp : false , 
    country : "italy" ,
   }

spaces['asiago'] = {
    name: "Asiago" ,
    control: "allies" ,
    top: 1788 ,
    left: 1619 , 
    neighbours: ["trent", "maggiore", "venice"] ,
    terrain : "normal" ,
    vp : false , 
    country : "italy" ,
   }

spaces['maggiore'] = {
    name: "Maggiore" ,
    control: "allies" ,
    top: 1764 ,
    left: 1747 , 
    neighbours: ["asiago", "udine", "villach"] ,
    terrain : "normal" ,
    vp : false , 
    country : "italy" ,
   }

spaces['udine'] = {
    name: "Udine" ,
    control: "allies" ,
    top: 1883 ,
    left: 1767 , 
    neighbours: ["trieste", "venice", "maggiore"] ,
    terrain: "normal" ,
    vp : false ,
    country : "italy" ,
   }

spaces['venice'] = {
    name: "Venice" ,
    control: "allies" ,
    top: 1937 ,
    left: 1649 , 
    neighbours: ["bologna", "verona", "asiago", "udine", "ravenna"] ,
    terrain : "normal" ,
    vp : false , 
    country : "italy" ,
   }

spaces['bologna'] = {
    name: "Bologna" ,
    control: "allies" ,
    top: 2034 ,
    left: 1545 , 
    neighbours: ["genoa", "verona", "venice", "florence"] ,
    terrain : "normal" ,
    vp : true , 
    country : "italy" ,
   }

spaces['florence'] = {
    name: "Florence" ,
    control: "allies" ,
    top: 2163 ,
    left: 1536 , 
    neighbours: ["bologna", "ravenna", "viterbo"] ,
    terrain : "normal" ,
    vp : true , 
    country : "italy" ,
   }

spaces['ravenna'] = {
    name: "Ravenna" ,
    control: "allies" ,
    top: 2121 ,
    left: 1688 , 
    neighbours: ["venice", "florence", "ancona"] ,
    terrain : "normal" ,
    vp : false , 
    country : "italy" ,
   }

spaces['ancona'] = {
    name: "Ancona" ,
    control: "allies" ,
    top: 2243 ,
    left: 1800 , 
    neighbours: ["ravenna", "pescara"] ,
    terrain : "normal" ,
    vp : false , 
    country : "italy" ,
   }

spaces['viterbo'] = {
    name: "Viterbo" ,
    control: "allies" ,
    top: 2307 ,
    left: 1626 , 
    neighbours: ["florence", "rome"] ,
    terrain : "normal" ,
    vp : false , 
    country : "italy" ,
   }

spaces['rome'] = {
    name: "Rome" ,
    control: "allies" ,
    top: 2431 ,
    left: 1680 , 
    neighbours: ["viterbo", "naples"] ,
    terrain : "normal" ,
    vp : true , 
    country : "italy" ,
   }

spaces['pescara'] = {
    name: "Pescara" ,
    control: "allies" ,
    top: 2381 ,
    left: 1864 , 
    neighbours: ["ancona", "foggia"] ,
    terrain : "normal" ,
    vp : false , 
    country : "italy" ,
   }

spaces['naples'] = {
    name: "Naples" ,
    control: "allies" ,
    top: 2585 ,
    left: 1869 , 
    neighbours: ["rome", "foggia"] ,
    terrain : "normal" ,
    vp : true , 
    port : 1 ,
    country : "italy" ,
   }

spaces['foggia'] = {
    name: "Foggia" ,
    control: "allies" ,
    top: 2526 ,
    left: 2031 , 
    neighbours: ["pescara", "naples", "taranto"] ,
    terrain : "normal" ,
    vp : false , 
    country : "italy" ,
   }

spaces['taranto'] = {
    name: "Taranto" ,
    control: "allies" ,
    top: 2646 ,
    left: 2179 , 
    neighbours: ["foggia", "valona"] ,
    limits : [ { "valona" : ["IT"] } ] ,
    terrain : "normal" ,
    vp : false , 
    port : 1 ,
    country : "italy" ,
   }


//
// AUSTRIA
//
spaces['prague'] = {
    name: "Prague" ,
    control: "central" ,
    top: 1235 ,
    left: 1884 , 
    neighbours: ["dresden", "kolin"] ,
    terrain : "normal" ,
    vp : false , 
    country : "austria" ,
   }

spaces['trent'] = {
    name: "Trent" ,
    control: "central" ,
    fort : 3 ,
    top: 1742 ,
    left: 1450 , 
    neighbours: ["verona", "asiago", "innsbruck"] ,
    terrain : "mountain" ,
    vp : true , 
    country : "austria" ,
   }

spaces['innsbruck'] = {
    name: "Innsbruck" ,
    control: "central" ,
    top: 1655 ,
    left: 1570 , 
    neighbours: ["trent", "augsburg", "spittal"] ,
    terrain : "mountain" ,
    vp : false , 
    country : "austria" ,
   }

spaces['spittal'] = {
    name: "Spittal" ,
    control: "central" ,
    top: 1635 ,
    left: 1725 , 
    neighbours: ["innsbruck", "munich", "villach"] ,
    terrain : "mountain" ,
    vp : false , 
    country : "austria" ,
   }

spaces['linz'] = {
    name: "Linz" ,
    control: "central" ,
    top: 1527 ,
    left: 1847 , 
    neighbours: ["regensburg", "vienna", "graz"] ,
    terrain : "normal" ,
    vp : false , 
    country : "austria" ,
   }

spaces['villach'] = {
    name: "Villach" ,
    control: "central" ,
    top: 1723 ,
    left: 1870 , 
    neighbours: ["spittal", "maggiore", "graz", "trieste"] ,
    terrain : "mountain" ,
    vp : false , 
    country : "austria" ,
   }

spaces['trieste'] = {
    name: "Trieste" ,
    control: "central" ,
    fort : 3 ,
    top: 1890 ,
    left: 1898 , 
    neighbours: ["udine", "villach", "zagreb"] ,
    terrain : "mountain" ,
    vp : true , 
    country : "austria" ,
   }

spaces['kolin'] = {
    name: "Kolin" ,
    control: "central" ,
    top: 1308 ,
    left: 2011 , 
    neighbours: ["prague", "brun"] ,
    terrain : "normal" ,
    vp : false , 
    country : "austria" ,
   }

spaces['brun'] = {
    name: "Brun" ,
    control: "central" ,
    top: 1380 ,
    left: 2130 , 
    neighbours: ["kolin", "olmutz", "vienna"] ,
    terrain : "normal" ,
    vp : false , 
    country : "austria" ,
   }
spaces['vienna'] = {
    name: "Vienna" ,
    control: "central" ,
    top: 1517 ,
    left: 2089 , 
    neighbours: ["linz", "brun", "budapest", "graz"] ,
    terrain : "normal" ,
    vp : true , 
    country : "austria" ,
   }

spaces['graz'] = {
    name: "Graz" ,
    control: "central" ,
    top: 1681 ,
    left: 1998 , 
    neighbours: ["linz", "vienna", "zagreb", "villach"] ,
    terrain : "mountain" ,
    vp : false , 
    country : "austria" ,
   }

spaces['zagreb'] = {
    name: "Zagreb" ,
    control: "central" ,
    top: 1866 ,
    left: 2052 , 
    neighbours: ["trieste", "graz", "pecs", "banjaluka"] ,
    terrain : "normal" ,
    vp : false , 
    country : "austria" ,
   }

spaces['banjaluka'] = {
    name: "Banja Luka" ,
    control: "central" ,
    top: 2018 ,
    left: 2184 , 
    neighbours: ["zagreb", "sarajevo"] ,
    terrain : "mountain" ,
    vp : false , 
    country : "austria" ,
   }

spaces['mostar'] = {
    name: "Mostar" ,
    control: "central" ,
    top: 2233 ,
    left: 2169 , 
    neighbours: ["sarajevo", "cetinje"] ,
    terrain : "mountain" ,
    vp : false , 
    country : "austria" ,
   }

spaces['sarajevo'] = {
    name: "Sarajevo" ,
    control: "central" ,
    top: 2137 ,
    left: 2320 , 
    neighbours: ["mostar", "banjaluka", "novisad", "valjevo"] ,
    terrain : "mountain" ,
    vp : false , 
    country : "austria" ,
   }

spaces['pecs'] = {
    name: "Pecs" ,
    control: "central" ,
    top: 1833 ,
    left: 2299 , 
    neighbours: ["zagreb", "budapest", "szeged", "novisad"] ,
    terrain : "normal" ,
    vp : false , 
    country : "austria" ,
   }

spaces['olmutz'] = {
    name: "Olmutz" ,
    control: "central" ,
    top: 1275 ,
    left: 2261 , 
    neighbours: ["oppeln", "martin", "brun"] ,
    terrain : "normal" ,
    vp : false , 
    country : "austria" ,
   }

spaces['martin'] = {
    name: "Martin" ,
    control: "central" ,
    top: 1428 ,
    left: 2331 , 
    neighbours: ["olmutz", "cracow", "budapest", "gorlice"] ,
    terrain : "normal" ,
    vp : false , 
    country : "austria" ,
   }

spaces['budapest'] = {
    name: "Budapest" ,
    control: "central" ,
    top: 1613 ,
    left: 2392 , 
    neighbours: ["vienna", "martin", "miskolcz", "szeged", "pecs"] ,
    terrain : "normal" ,
    vp : true , 
    country : "austria" ,
   }
spaces['szeged'] = {
    name: "Szeged" ,
    control: "central" ,
    top: 1769 ,
    left: 2492 , 
    neighbours: ["pecs", "budapest", "debrecen", "timisvar", "novisad"] ,
    terrain : "normal" ,
    vp : false , 
    country : "austria" ,
   }

spaces['novisad'] = {
    name: "Novi Sad" ,
    control: "central" ,
    top: 1926 ,
    left: 2452 , 
    neighbours: ["pecs", "szeged", "belgrade", "sarajevo"] ,
    terrain : "normal" ,
    vp : false , 
    country : "austria" ,
   }

spaces['timisvar'] = {
    name: "Timisvar" ,
    control: "central" ,
    top: 1878 ,
    left: 2628 , 
    neighbours: ["szeged", "belgrade", "targujiu"] ,
    terrain : "normal" ,
    vp : false , 
    country : "austria" ,
   }

spaces['debrecen'] = {
    name: "Debrecen" ,
    control: "central" ,
    top: 1611 ,
    left: 2666 , 
    neighbours: ["miskolcz", "cluj", "szeged"] ,
    terrain : "normal" ,
    vp : true , 
    country : "austria" ,
   }

spaces['miskolcz'] = {
    name: "Miskolcz" ,
    control: "central" ,
    top: 1496 ,
    left: 2523 , 
    neighbours: ["gorlice", "uzhgorod", "debrecen", "budapest"] ,
    terrain : "normal" ,
    vp : false , 
    country : "austria" ,
   }

spaces['cracow'] = {
    name: "Cracow" ,
    control: "central" ,
    fort : 2 ,
    top: 1249 ,
    left: 2460 , 
    neighbours: ["oppeln", "czestochowa", "tarnow", "martin"] ,
    terrain : "normal" ,
    vp : true , 
    country : "austria" ,
   }

spaces['tarnow'] = {
    name: "Tarnow" ,
    control: "central" ,
    top: 1251 ,
    left: 2620 , 
    neighbours: ["cracow", "ivangorod", "przemysl", "gorlice"] ,
    terrain : "normal" ,
    vp : false , 
    country : "austria" ,
   }

spaces['gorlice'] = {
    name: "Gorlice" ,
    control: "central" ,
    top: 1374 ,
    left: 2574 , 
    neighbours: ["martin", "tarnow", "uzhgorod", "miskolcz"] ,
    terrain : "mountain" ,
    vp : false , 
    country : "austria" ,
   }

spaces['przemysl'] = {
    name: "Przemysl" ,
    control: "central" ,
    fort : 3 ,
    top: 1251 ,
    left: 2778 , 
    neighbours: ["tarnow", "lublin", "lemberg", "stanislau", "uzhgorod"] ,
    terrain : "normal" ,
    vp : false , 
    country : "austria" ,
   }

spaces['uzhgorod'] = {
    name: "Uzhgorod" ,
    control: "central" ,
    top: 1463 ,
    left: 2727 , 
    neighbours: ["miskolcz", "gorlice", "przemysl", "stanislau", "munkacs"] ,
    terrain : "mountain" ,
    vp : false , 
    country : "austria" ,
   }

spaces['lemberg'] = {
    name: "Lemberg" ,
    control: "central" ,
    top: 1266 ,
    left: 2931 , 
    neighbours: ["przemysl", "lutsk", "tarnopol", "stanislau"] ,
    terrain : "normal" ,
    vp : true , 
    country : "austria" ,
   }

spaces['stanislau'] = {
    name: "Stanislau" ,
    control: "central" ,
    top: 1426 ,
    left: 2897 , 
    neighbours: ["uzhgorod", "przemysl", "lemberg", "tarnopol", "czernowitz", "munkacs"] ,
    terrain : "normal" ,
    vp : false , 
    country : "austria" ,
   }

spaces['munkacs'] = {
    name: "Munkacs" ,
    control: "central" ,
    top: 1560 ,
    left: 2886 , 
    neighbours: ["uzhgorod", "stanislau", "czernowitz", "cluj"] ,
    terrain : "mountain" ,
    vp : false , 
    country : "austria" ,
   }

spaces['cluj'] = {
    name: "Cluj" ,
    control: "central" ,
    top: 1685 ,
    left: 2854 , 
    neighbours: ["debrecen", "munkacs", "schossburg", "hermannstadt"] ,
    terrain : "normal" ,
    vp : true , 
    country : "austria" ,
   }

spaces['hermannstadt'] = {
    name: "Hermannstadt" ,
    control: "central" ,
    top: 1842 ,
    left: 2850 , 
    neighbours: ["cluj", "kronstadt", "cartedearges"] ,
    terrain : "mountain" ,
    vp : false , 
    country : "austria" ,
   }

spaces['kronstadt'] = {
    name: "Kronstadt" ,
    control: "central" ,
    top: 1838 ,
    left: 3004 , 
    neighbours: ["hermannstadt", "schossburg", "ploesti"] ,
    terrain : "mountain" ,
    vp : false , 
    country : "austria" ,
   }

spaces['schossburg'] = {
    name: "Schossburg" ,
    control: "central" ,
    top: 1710 ,
    left: 3004 , 
    neighbours: ["cluj", "kronstadt"] ,
    terrain : "mountain" ,
    vp : false , 
    country : "austria" ,
   }

spaces['czernowitz'] = {
    name: "Czernowitz" ,
    control: "central" ,
    top: 1524 ,
    left: 3048 , 
    neighbours: ["munkacs", "stanislau", "tarnopol", "kamenetspodolski"] ,
    terrain : "normal" ,
    vp : true , 
    country : "austria" ,
   }

spaces['tarnopol'] = {
    name: "Tarnopol" ,
    control: "central" ,
    top: 1371 ,
    left: 3049 , 
    neighbours: ["stanislau", "lemberg", "dubno", "kamenetspodolski", "czernowitz"] ,
    terrain : "normal" ,
    vp : false , 
    country : "austria" ,
   }


//
// RUSSIA
//
spaces['reval'] = {
      name: "Reval" ,
    control: "allies" ,
      top: 81 ,
      left: 3139 ,
      neighbours: ["riga", "petrograd"] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}

spaces['pskov'] = {
      name: "Pskov" ,
    control: "allies" ,
      top: 119 ,
      left: 3395 ,
      neighbours: ["opochka", "petrograd"] ,
      limits : [ { "petrograd" : ["RU"] } ] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}

spaces['petrograd'] = {
      name: "Petrograd" ,
    control: "allies" ,
      top: 82 ,
      left: 3610 ,
      neighbours: ["velikiyeluki", "pskov", "reval"] ,
      limits : [ { "reval" : ["RU"] } ] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}

spaces['riga'] = {
      name: "Riga" ,
    control: "allies" ,
      fort : 3 ,
      top: 240 ,
      left: 2921 ,
      neighbours: ["dvinsk", "szawli", "reval"] ,
      limits : [ { "reval" : ["RU"] } ] ,
      terrain : "normal" ,
      vp : true ,
      port : 2 ,
      country : "russia" ,
}

spaces['libau'] = {
      name: "Libau" ,
    control: "allies" ,
      top: 284 ,
      left: 2617 ,
      neighbours: ["memel", "szawli"] ,
      terrain : "normal" ,
      vp : false ,
      port : 2 ,
      country : "russia" ,
}

spaces['szawli'] = {
      name: "Szawli" ,
    control: "allies" ,
      top: 360 ,
      left: 2779 ,
      neighbours: ["libau", "riga", "memel", "kovno", "dvinsk"] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}

spaces['dvinsk'] = {
      name: "Dvinsk" ,
    control: "allies" ,
      top: 402 ,
      left: 3185 ,
      neighbours: ["szawli", "riga", "vilna", "moldechno", "polotsk", "opochka"] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}

spaces['opochka'] = {
      name: "Opochka" ,
    control: "allies" ,
      top: 301 ,
      left: 3408 ,
      neighbours: ["pskov", "dvinsk", "polotsk", "velikiyeluki"] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}

spaces['velikiyeluki'] = {
      name: "Velikiye Luki" ,
    control: "allies" ,
      top: 298 ,
      left: 3592 ,
      neighbours: ["petrograd", "opochka", "vitebsk", "moscow"] ,
      limits : [ { "petrograd" : ["RU"] } , { "moscow" : ["RU"] } ] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}

spaces['kovno'] = {
      name: "Kovno" ,
    control: "allies" ,
      fort : 1 ,
      top: 534 ,
      left: 2807 ,
      neighbours: ["szawli", "vilna", "grodno", "insterberg"] ,
      terrain : "normal" ,
      vp : true ,
      country : "russia" ,
}

spaces['vilna'] = {
      name: "Vilna" ,
      top: 527 ,
    control: "allies" ,
      left: 2970 ,
      neighbours: ["kovno", "grodno", "moldechno", "dvinsk"] ,
      terrain : "normal" ,
      vp : true ,
      country : "russia" ,
}

spaces['moldechno'] = {
      name: "Moldechno" ,
    control: "allies" ,
      top: 594 ,
      left: 3143 ,
      neighbours: ["polotsk", "vilna", "dvinsk", "minsk"] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}

spaces['polotsk'] = {
      name: "Polotsk" ,
    control: "allies" ,
      top: 517 ,
      left: 3375 ,
      neighbours: ["dvinsk", "opochka", "moldechno", "vitebsk", "orsha"] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}

spaces['vitebsk'] = {
      name: "Vitebsk" ,
    control: "allies" ,
      top: 473 ,
      left: 3592 ,
      neighbours: ["velikiyeluki", "smolensk", "polotsk", "orsha"] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}

spaces['grodno'] = {
      name: "Grodno" ,
    control: "allies" ,
      fort : 1 ,
      top: 683 ,
      left: 2881 ,
      neighbours: ["vilna", "kovno", "insterberg", "baranovichi", "bialystok"] ,
      terrain : "forest" ,
      vp : false ,
      country : "russia" ,
}

spaces['baranovichi'] = {
      name: "Baranovichi" ,
    control: "allies" ,
      top: 737 ,
      left: 3123 ,
      neighbours: ["grodno", "minsk", "slutsk"] ,
      terrain : "forest" ,
      vp : false ,
      country : "russia" ,
}

spaces['minsk'] = {
      name: "Minsk" ,
    control: "allies" ,
      top: 689 ,
      left: 3314 ,
      neighbours: ["orsha", "slutsk", "baranovichi", "moldechno"] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}

spaces['orsha'] = {
      name: "Orsha" ,
    control: "allies" ,
      top: 588 ,
      left: 3592 ,
      neighbours: ["minsk", "polotsk", "vitebsk", "smolensk", "mogilev"] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}

spaces['smolensk'] = {
      name: "Smolensk" ,
    control: "allies" ,
      top: 563 ,
      left: 3788 ,
      neighbours: ["orsha", "moscow", "vitebsk", "roslavl"] ,
      limits: [ { "moscow" : ["RU"] } ] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}

spaces['moscow'] = {
      name: "Moscow" ,
    control: "allies" ,
      top: 514 ,
      left: 3946 ,
      neighbours: ["smolensk", "velikiyeluki"] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}

spaces['lomza'] = {
      name: "Lomza" ,
    control: "allies" ,
      fort : 1 , 
      top: 786 ,
      left: 2707 ,
      neighbours: ["tannenberg", "plock", "warsaw", "bialystok"] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}

spaces['bialystok'] = {
      name: "Bialystok" ,
    control: "allies" ,
      top: 819 ,
      left: 2942 ,
      neighbours: ["lomza", "grodno", "brestlitovsk"] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}

spaces['pinsk'] = {
      name: "Pinsk" ,
    control: "allies" ,
      top: 881 ,
      left: 3073 ,
      neighbours: ["brestlitovsk", "kovel", "sarny"] ,
      terrain : "swamp" ,
      vp : false ,
      country : "russia" ,
}

spaces['sarny'] = {
      name: "Sarny" ,
    control: "allies" ,
      top: 966 ,
      left: 3218 ,
      neighbours: ["rovno", "kovel", "pinsk"] ,
      terrain : "swamp" ,
      vp : false ,
      country : "russia" ,
}

spaces['slutsk'] = {
      name: "Slutsk" ,
    control: "allies" ,
      top: 832 ,
      left: 3395 ,
      neighbours: ["baranovichi", "minsk", "mogilev", "mozyr"] ,
      terrain : "forest" ,
      vp : false ,
      country : "russia" ,
}

spaces['mogilev'] = {
      name: "Mogilev" ,
    control: "allies" ,
      top: 702 ,
      left: 3602 ,
      neighbours: ["orsha", "gomel", "slutsk", "roslavl"] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}

spaces['gomel'] = {
      name: "Gomel" ,
    control: "allies" ,
      top: 898 ,
      left: 3671 ,
      neighbours: ["chernigov", "mogilev", "roslavl"] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}


spaces['roslavl'] = {
      name: "Roslavl" ,
    control: "allies" ,
      top: 761 ,
      left: 3836 ,
      neighbours: ["gomel", "mogilev", "smolensk"] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}

spaces['plock'] = {
      name: "Plock" ,
    control: "allies" ,
      top: 845 ,
      left: 2429 ,
      neighbours: ["tannenberg", "warsaw", "lomza", "lodz", "thorn"] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}

spaces['lodz'] = {
      name: "Lodz" ,
    control: "allies" ,
      top: 979 ,
      left: 2410 ,
      neighbours: ["posen", "warsaw", "breslau", "plock", "thorn", "czestochowa"] ,
      terrain : "normal" ,
      vp : true ,
      country : "russia" ,
}

spaces['warsaw'] = {
      name: "Warsaw" ,
    control: "allies" ,
      fort : 2 , 
      top: 918 ,
      left: 2592 ,
      neighbours: ["ivangorod", "lodz", "lomza", "plock", "brestlitovsk"] ,
      terrain : "normal" ,
      vp : true ,
      country : "russia" ,
}

spaces['brestlitovsk'] = {
      name: "Brest Litovsk" ,
    control: "allies" ,
      fort : 1 ,
      top: 934 ,
      left: 2828 ,
      neighbours: ["warsaw", "lublin", "kovel", "pinsk", "bialystok"] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}

spaces['kovel'] = {
      name: "Kovel" ,
    control: "allies" ,
      top: 1009 ,
      left: 3008 ,
      neighbours: ["lublin", "brestlitovsk", "lutsk", "sarny", "pinsk"] ,
      terrain : "sawmp" ,
      vp : false ,
      country : "russia" ,
}

spaces['mozyr'] = {
      name: "Mozyr" ,
    control: "allies" ,
      top: 1011 ,
      left: 3475 ,
      neighbours: ["slutsk", "zhitomir"] ,
      terrain : "sawmp" ,
      vp : false ,
      country : "russia" ,
}

spaces['chernigov'] = {
      name: "Chernigov" ,
    control: "allies" ,
      top: 1051 ,
      left: 3700 ,
      neighbours: ["gomel", "kiev"] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}

spaces['czestochowa'] = {
      name: "Czestochowa" ,
    control: "allies" ,
      top: 1124 ,
      left: 2498 ,
      neighbours: ["lodz", "ivangorod", "cracow", "oppeln"] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}

spaces['ivangorod'] = {
      name: "Ivangorod" ,
    control: "allies" ,
      fort : 1 ,
      top: 1102 ,
      left: 2648 ,
      neighbours: ["warsaw", "lublin", "tarnow", "czestochowa"] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}

spaces['lublin'] = {
      name: "Lublin" ,
    control: "allies" ,
      top: 1098 ,
      left: 2853 ,
      neighbours: ["ivangorod", "brestlitovsk", "kovel", "lutsk", "przemysl"] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}

spaces['lutsk'] = {
      name: "Lutsk" ,
    control: "allies" ,
      fort : 1 ,
      top: 1144 ,
      left: 3065 ,
      neighbours: ["dubno", "lemberg", "kovel", "lublin", "rovno"] ,
      terrain : "forest" ,
      vp : false ,
      country : "russia" ,
}

spaces['rovno'] = {
      name: "Rovno" ,
    control: "allies" ,
      top: 1118 ,
      left: 3281 ,
      neighbours: ["dubno", "sarny", "zhitomir", "lutsk"] ,
      terrain : "forest" ,
      vp : false ,
      country : "russia" ,
}

spaces['dubno'] = {
      name: "Dubno" ,
    control: "allies" ,
      fort : 1 ,
      top: 1252 ,
      left: 3189 ,
      neighbours: ["tarnopol", "rovno", "zhitomir", "lutsk", "kamenetspodolski"] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}

spaces['zhitomir'] = {
      name: "Zhitomir" ,
    control: "allies" ,
      top: 1182 ,
      left: 3439 ,
      neighbours: ["dubno", "rovno", "mozyr", "kiev", "belayatserkov"] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}

spaces['kiev'] = {
      name: "Kiev" ,
    control: "allies" ,
      top: 1188 ,
      left: 3614 ,
      neighbours: ["zhitomir", "chernigov", "kharkov", "belayatserkov"] ,
      limits : [ { "kharkov" : ["RU"] } ] ,
      terrain : "normal" ,
      vp : true ,
      country : "russia" ,
}

spaces['kharkov'] = {
      name: "Kharkov" ,
    control: "allies" ,
      top: 1183 ,
      left: 3948 ,
      neighbours: ["kiev"] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}

spaces['kamenetspodolski'] = {
      name: "Kamenets Podolski" ,
    control: "allies" ,
      top: 1440 ,
      left: 3196 ,
      neighbours: ["dubno", "tarnopol", "vinnitsa", "zhmerinka", "czernowitz"] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}

spaces['vinnitsa'] = {
      name: "Vinnitsa" ,
    control: "allies" ,
      top: 1373 ,
      left: 3404 ,
      neighbours: ["uman", "kamenetspodolski", "zhmerinka", "belayatserkov"] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}

spaces['belayatserkov'] = {
      name: "Belaya Tserkov" ,
    control: "allies" ,
      top: 1364 ,
      left: 3642 ,
      neighbours: ["uman", "vinnitsa", "kiev", "zhitomir"] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}

spaces['zhmerinka'] = {
      name: "Zhmerinka" ,
    control: "allies" ,
      top: 1544 ,
      left: 3329 ,
      neighbours: ["kamenetspodolski", "vinnitsa", "jassy", "kishinev"] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}

spaces['uman'] = {
      name: "Uman" ,
    control: "allies" ,
      top: 1546 ,
      left: 3646 ,
      neighbours: ["odessa", "vinnitsa", "belayatserkov", "caucasus"] ,
      limits : [ { "caucasus" : ["RU"] } ] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}

spaces['kishinev'] = {
      name: "Kishinev" ,
    control: "allies" ,
      top: 1692 ,
      left: 3444 ,
      neighbours: ["ismail", "barlad", "zhmerinka"] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}

spaces['caucasus'] = {
      name: "Caucasus" ,
    control: "allies" ,
      top: 1608 ,
      left: 3947 ,
      neighbours: ["uman", "odessa", "poti", "grozny"] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}

spaces['ismail'] = {
      name: "Ismail" ,
    control: "allies" ,
      top: 1855 ,
      left: 3469 ,
      neighbours: ["kishinev", "odessa", "galatz"] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}

spaces['odessa'] = {
      name: "Odessa" ,
    control: "allies" ,
      fort : 3 ,
      top: 1756 ,
      left: 3644 ,
      neighbours: ["caucasus", "uman", "ismail"] ,
      limits : [ { "caucasus" : ["RU"] } ] ,
      terrain : "normal" ,
      vp : true ,
      country : "russia" ,
}

spaces['poti'] = {
      name: "Poti" ,
    control: "allies" ,
      top: 1871 ,
      left: 4377 ,
      neighbours: ["caucasus", "batum"] ,
      limits : [ { "caucasus" : ["RU"] } ] ,
      terrain : "mountain" ,
      vp : false ,
      country : "russia" ,
}

spaces['grozny'] = {
      name: "Grozny" ,
    control: "allies" ,
      top: 1882 ,
      left: 4594 ,
      neighbours: ["caucasus", "petrovsk", "tbilisi"] ,
      limits : [ { "caucasus" : ["RU"] } ] ,
      terrain : "mountain" ,
      vp : false ,
      country : "russia" ,
}

spaces['petrovsk'] = {
      name: "Petrovsk" ,
    control: "allies" ,
      top: 1921 ,
      left: 4801 ,
      neighbours: ["grozny", "tbilisi"] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}

spaces['batum'] = {
      name: "Batum" ,
    control: "allies" ,
      top: 2038 ,
      left: 4458 ,
      neighbours: ["kars", "poti", "rize"] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}

spaces['kars'] = {
      name: "Kars" ,
    control: "allies" ,
      top: 2085 ,
      left: 4560 ,
      neighbours: ["batum", "erzerum", "tbilisi"] ,
      terrain : "mountain" ,
      vp : false ,
      country : "russia" ,
}

spaces['tbilisi'] = {
      name: "Tbilisi" ,
    control: "allies" ,
      top: 2035 ,
      left: 4683 ,
      neighbours: ["grozny", "kars", "petrovsk", "erivan", "elizabethpol"] ,
      terrain : "mountain" ,
      vp : false ,
      country : "russia" ,
}

spaces['erivan'] = {
      name: "Erivan" ,
    control: "allies" ,
      top: 2166 ,
      left: 4684 ,
      neighbours: ["tbilisi", "dilman", "eleskrit"] ,
      terrain : "mountain" ,
      vp : false ,
      country : "russia" ,
}

spaces['elizabethpol'] = {
      name: "Elizabethpol" ,
    control: "allies" ,
      top: 2119 ,
      left: 4797 ,
      neighbours: ["tbilisi", "baku"] ,
      terrain : "normal" ,
      vp : false ,
      country : "russia" ,
}

spaces['baku'] = {
      name: "Baku" ,
    control: "allies" ,
      top: 2202 ,
      left: 4919 ,
      neighbours: ["elizabethpol"] ,
      terrain : "normal" ,
      vp : true ,
      country : "russia" ,
}   


//
// PERSIA
//
spaces['dilman'] = {
      name: "Dilman" ,
    control: "neutral" ,
      top: 2318 ,
      left: 4681 ,
      neighbours: ["erivan", "van", "tabriz"] ,
      terrain : "mountain" ,
      vp : false ,
      country : "persia" ,
}

spaces['tabriz'] = {
      name: "Tabriz" ,
    control: "neutral" ,
      top: 2402 ,
      left: 4794 ,
       neighbours: ["dilman", "hamadan"] ,
      terrain : "mountain" ,
      vp : false ,
      country : "persia" ,
}

spaces['hamadan'] = {
      name: "Hamadan" ,
    control: "neutral" ,
      top: 2561 ,
      left: 4844 ,
      neighbours: ["tabriz", "khorramabad", "kermanshah"] ,
      terrain : "mountain" ,
      vp : false ,
      country : "persia" ,
}

spaces['kermanshah'] = {
      name: "Kermanshah" ,
    control: "neutral" ,
      top: 2632 ,
      left: 4716 ,
      neighbours: ["hamadan", "khorramabad", "baghdad"] ,
      terrain : "mountain" ,
      vp : false ,
      country : "persia" ,
}

spaces['khorramabad'] = {
      name: "Khorramabad" ,
    control: "neutral" ,
      top: 2701 ,
      left: 4858 ,
      neighbours: ["hamadan", "kermanshah", "ahwaz"] ,
      terrain : "normal" ,
      vp : false ,
      country : "persia" ,
}

spaces['ahwaz'] = {
      name: "Ahwaz" ,
    control: "neutral" ,
      top: 2848 ,
      left: 4872 ,
      neighbours: ["basra", "qurna", "khorramabad"] ,
      terrain : "normal" ,
      vp : false ,
      country : "persia" ,
}

spaces['basra'] = {
      name: "Basra" ,
    control: "neutral" ,
      fort : 1 ,
      top: 2989 ,
      left: 4840 ,
      neighbours: ["ahwaz", "qurna"] ,
      terrain : "normal" ,
      vp : true ,
    port : 1 ,
      country : "persia" ,
}


//
// TURKEY
//
spaces['adapazari'] = {
      name: "Adapazari" ,
    control: "neutral" ,
      top: 2099 ,
      left: 3791 ,
      neighbours: ["constantinople", "sinope"] ,
      terrain : "normal" ,
      vp : false ,
      country : "turkey" ,
}

spaces['sinope'] = {
      name: "Sinope" ,
    control: "neutral" ,
      top: 2052 ,
      left: 3899 ,
      neighbours: ["samsun", "adapazari"] ,
      terrain : "normal" ,
      vp : false ,
      country : "turkey" ,
}

spaces['samsun'] = {
      name: "Samsun" ,
    control: "neutral" ,
      top: 2035 ,
      left: 4005 ,
      neighbours: ["sinope", "giresun", "sivas", "ankara"] ,
      terrain : "normal" ,
      vp : false ,
      country : "turkey" ,
}


spaces['giresun'] = {
      name: "Giresun" ,
    control: "neutral" ,
      top: 2068 ,
      left: 4105 ,
      neighbours: ["samsun", "trebizond"] ,
      terrain : "normal" ,
      vp : false ,
      country : "turkey" ,
}

spaces['trebizond'] = {
      name: "Trebizond" ,
    control: "neutral" ,
      top: 2107 ,
      left: 4225 ,
      neighbours: ["giresun", "rize", "erzingan"] ,
      terrain : "normal" ,
      vp : false ,
      country : "turkey" ,
}

spaces['rize'] = {
      name: "Rize" ,
    control: "neutral" ,
      top: 2100 ,
      left: 4355 ,
      neighbours: ["trebizond", "batum"] ,
      terrain : "normal" ,
      vp : false ,
      country : "turkey" ,
}

spaces['bursa'] = {
      name: "Bursa" ,
    control: "neutral" ,
      top: 2695 ,
      left: 3470 ,
      neighbours: ["constantinople", "eskidor"] ,
      terrain : "normal" ,
      vp : false ,
      country : "turkey" ,
}

spaces['eskidor'] = {
      name: "Eskidor" ,
    control: "neutral" ,
      top: 2238 ,
      left: 3790 ,
      neighbours: ["constantinople", "bursa", "ankara", "konya"] ,
      terrain : "mountain" ,
      vp : false ,
      country : "turkey" ,
}

spaces['ankara'] = {
      name: "Ankara" ,
    control: "neutral" ,
      top: 2204 ,
      left: 3906 ,
      neighbours: ["eskidor", "samsun", "sivas"] ,
      terrain : "mountain" ,
      vp : false ,
      country : "turkey" ,
}

spaces['sivas'] = {
      name: "Sivas" ,
    control: "neutral" ,
      top: 2194 ,
      left: 4060 ,
       neighbours: ["ankara", "samsun", "erzingan", "kayseri"] ,
      terrain : "mountain" ,
      vp : false ,
      country : "turkey" ,
}

spaces['erzingan'] = {
      name: "Erzingan" ,
    control: "neutral" ,
      top: 2233 ,
      left: 4231 ,
      neighbours: ["sivas", "trebizond", "erzerum", "kharput"] ,
      terrain : "mountain" ,
      vp : false ,
      country : "turkey" ,
}

spaces['erzerum'] = {
      name: "Erzerum" ,
    control: "neutral" ,
      top: 2211 ,
      left: 4397 ,
      neighbours: ["diyarbakir", "eleskrit", "erzingan", "kars"] ,
      terrain : "mountain" ,
      vp : false ,
      country : "turkey" ,
}

spaces['eleskrit'] = {
      name: "Eleskrit" ,
    control: "neutral" ,
      top: 2223 ,
      left: 4526 ,
      neighbours: ["erzerum", "van", "erivan"] ,
      terrain : "normal" ,
      vp : false ,
      country : "turkey" ,
}

spaces['konya'] = {
      name: "Konya" ,
    control: "neutral" ,
      top: 2354 ,
      left: 3960 ,
      neighbours: ["eskidor", "adana"] ,
      terrain : "mountain" ,
      vp : false ,
      country : "turkey" ,
}

spaces['kayseri'] = {
      name: "Kayseri" ,
    control: "neutral" ,
      top: 2334 ,
      left: 4091 ,
      neighbours: ["sivas", "adana", "erzingan"] ,
      terrain : "normal" ,
      vp : false ,
      country : "turkey" ,
}

spaces['kharput'] = {
      name: "Kharput" ,
    control: "neutral" ,
      top: 2346 ,
      left: 4210 ,
      neighbours: ["urfa", "kayseri", "erzingan", "diyarbakir"] ,
      terrain : "normal" ,
      vp : false ,
      country : "turkey" ,
}

spaces['diyarbakir'] = {
      name: "Diyarbakir" ,
    control: "neutral" ,
      top: 2336 ,
      left: 4323 ,
      neighbours: ["mardin", "bitlis", "kharput", "erzerum"] ,
      terrain : "normal" ,
      vp : false ,
      country : "turkey" ,
}

spaces['bitlis'] = {
      name: "Bitlis" ,
    control: "neutral" ,
      top: 2343 ,
      left: 4429 ,
      neighbours: ["diyarbakir", "van"] ,
      terrain : "mountain" ,
      vp : false ,
      country : "turkey" ,
}

spaces['van'] = {
      name: "Van" ,
    control: "neutral" ,
      top: 2340 ,
      left: 4544 ,
      neighbours: ["bitlis", "dilman", "eleskrit"] ,
      terrain : "mountain" ,
      vp : false ,
      country : "turkey" ,
}

spaces['adana'] = {
      name: "Adana" ,
    control: "neutral" ,
      top: 2454 ,
      left: 4072 ,
      neighbours: ["konya", "kayseri", "aleppo"] ,
      terrain : "mountain" ,
      vp : false ,
      country : "turkey" ,
}

spaces['aleppo'] = {
      name: "Aleppo" ,
    control: "neutral" ,
      top: 2510 ,
      left: 4196 ,
      neighbours: ["beirut", "urfa", "adana", "damascus"] ,
      terrain : "mountain" ,
      vp : false ,
      country : "turkey" ,
}

spaces['urfa'] = {
      name: "Urfa" ,
    control: "neutral" ,
      top: 2467 ,
      left: 4310 ,
      neighbours: ["mardin", "aleppo", "kharput"] ,
      terrain : "normal" ,
      vp : false ,
      country : "turkey" ,
}

spaces['mardin'] = {
      name: "Mardin" ,
    control: "neutral" ,
      top: 2467 ,
      left: 4433 ,
      neighbours: ["urfa", "diyarbakir", "mosul"] ,
      terrain : "normal" ,
      vp : false ,
      country : "turkey" ,
}

spaces['mosul'] = {
      name: "Mosul" ,
    control: "neutral" ,
      top: 2482 ,
      left: 4546 ,
      neighbours: ["mardin", "kirkuk"] ,
      terrain : "normal" ,
      vp : true ,
      country : "turkey" ,
}

spaces['beirut'] = {
      name: "Beirut" ,
    control: "neutral" ,
      top: 2585 ,
      left: 4091 ,
      neighbours: ["aleppo", "nablus"] ,
      terrain : "normal" ,
      vp : false ,
      country : "turkey" ,
}

spaces['damascus'] = {
      name: "Damascus" ,
    control: "neutral" ,
      top: 2614 ,
      left: 4213 ,
      neighbours: ["aleppo", "nablus", "amman"] ,
      terrain : "normal" ,
      vp : true ,
      country : "turkey" ,
}

spaces['kirkuk'] = {
      name: "Kirkuk" ,
    control: "neutral" ,
      top: 2612 ,
      left: 4558 ,
      neighbours: ["mosul", "baghdad"] ,
      terrain : "normal" ,
      vp : false ,
      country : "turkey" ,
}

spaces['nablus'] = {
      name: "Nablus" ,
    control: "neutral" ,
      top: 2728 ,
      left: 4043 ,
      neighbours: ["beirut", "damascus", "jerusalem", "gaza"] ,
      terrain : "mountain" ,
      vp : false ,
      country : "turkey" ,
}

spaces['amman'] = {
      name: "Amman" ,
    control: "neutral" ,
      top: 2745 ,
      left: 4166 ,
      neighbours: ["arabia", "damascus", "jerusalem"] ,
      limits: [ { "arabia" : ["ANA"] } ] ,
      terrain : "normal" ,
      vp : false ,
      country : "turkey" ,
}

spaces['baghdad'] = {
      name: "Baghdad" ,
    control: "neutral" ,
      top: 2736 ,
      left: 4603 ,
      neighbours: ["kirkuk", "samawah", "kut", "kermanshah"] ,
      terrain : "normal" ,
      vp : true ,
      country : "turkey" ,
}

spaces['kut'] = {
      name: "Kut" ,
    control: "neutral" ,
      top: 2785 ,
      left: 4712 ,
      neighbours: ["baghdad", "qurna"] ,
      terrain : "normal" ,
      vp : false ,
      country : "turkey" ,
}

spaces['gaza'] = {
      name: "Gaza" ,
    control: "neutral" ,
      fort : 2 ,
      top: 2872 ,
      left: 3989 ,
      neighbours: ["nablus", "sinai", "beersheba"] ,
      terrain : "desert" ,
      vp : false ,
      country : "turkey" ,
}

spaces['jerusalem'] = {
      name: "Jerusalem" ,
    control: "neutral" ,
      top: 2840 ,
      left: 4116 ,
      neighbours: ["nablus", "amman", "beersheba", "arabia"] ,
      limits : [ { "arabia" : ["ANA"] } ] ,
      terrain : "normal" ,
      vp : false ,
      country : "turkey" ,
}


spaces['samawah'] = {
      name: "Samawah" ,
    control: "neutral" ,
      top: 2876 ,
      left: 4554 ,
      neighbours: ["baghdad", "annasiriya"] ,
      terrain : "desert" ,
      vp : false ,
      country : "turkey" ,
}

spaces['qurna'] = {
      name: "Qurna" ,
    control: "neutral" ,
      top: 2883 ,
      left: 4759 ,
      neighbours: ["kut", "ahwaz", "basra", "annasiriya"] ,
      terrain : "normal" ,
      vp : false ,
      country : "turkey" ,
}

spaces['sinai'] = {
      name: "Sinai" ,
    control: "neutral" ,
      top: 2979 ,
      left: 3897 ,
      neighbours: ["gaza", "beersheba", "portsaid", "cairo"] ,
      terrain : "desert" ,
      vp : false ,
      country : "turkey" ,
}

spaces['beersheba'] = {
      name: "Beersheba" ,
    control: "neutral" ,
      fort : 2 ,
      top: 2967 ,
      left: 4101 ,
      neighbours: ["gaza", "jerusalem", "sinai", "aqaba"] ,
      terrain : "desert" ,
      vp : false ,
      country : "turkey" ,
}

spaces['aqaba'] = {
      name: "Aqaba" ,
    control: "neutral" ,
      fort : 1 ,
      top: 3077 ,
      left: 4016 ,
      neighbours: ["medina", "beersheba", "arabia"] ,
      limits : [ { "arabia" : ["ANA"] } ] ,
      terrain : "desert" ,
      vp : false ,
      country : "turkey" ,
}


spaces['arabia'] = {
      name: "Arabia" ,
    control: "neutral" ,
      top: 2990 ,
      left: 4321 ,
      neighbours: ["medina", "aqaba", "jerusalem", "amman"] ,
      terrain : "desert" ,
      vp : false ,
      country : "turkey" ,
}

spaces['medina'] = {
      name: "Medina" ,
    control: "neutral" ,
      top: 3155 ,
      left: 4167 ,
      neighbours: [ "aqaba", "arabia"] ,
      limits : [ { "arabia" : ["ANA"] } ] ,
      terrain : "desert" ,
      vp : true ,
      country : "turkey" ,
}

spaces['annasiriya'] = {
      name: "An Nasiriya" ,
    control: "neutral" ,
      top: 3034 ,
      left: 4673 ,
      neighbours: [ "qurna", "samawah"] ,
      terrain : "desert" ,
      vp : true ,
      country : "turkey" ,
}


//
// EGYPT
//
spaces['libya'] = {
      name: "Libya" ,
    control: "neutral" ,
      top: 2935 ,
      left: 3518 ,
      neighbours: [ "alexandria"] ,
      terrain : "normal" ,
      vp : false ,
      country : "egypt" ,
}

spaces['alexandria'] = {
      name: "Alexandria" ,
    control: "neutral" ,
      top: 2955 ,
      left: 3661 ,
       neighbours: [ "libya", "cairo", "portsaid"] ,
      terrain : "normal" ,
      vp : true ,
    port : 1 ,
      country : "egypt" ,
}

spaces['portsaid'] = {
      name: "Port Said" ,
    control: "neutral" ,
      top: 2899 ,
      left: 3777 ,
      neighbours: [ "alexandria", "cairo", "sinai"] ,
      terrain : "normal" ,
      vp : true ,
    port : 1 ,
      country : "egypt" ,
}

spaces['cairo'] = {
      name: "Cairo" ,
    control: "neutral" ,
      top: 3038 ,
      left: 3789 ,
      neighbours: [ "alexandria", "portsaid", "sinai"] ,
      terrain : "normal" ,
      vp : true ,
      country : "egypt" ,
}

//
// Montenegro
//
spaces['cetinje'] = {
      name: "Cetinje" ,
      control: "allies" ,
      top: 2341 ,
      left: 2365 ,
      neighbours: [ "tirana", "mostar"] ,
      terrain : "mountain" ,
      vp : false ,
      country : "montenegro" ,
}

//
// Albania
//
spaces['tirana'] = {
      name: "Tirana" ,
    control: "neutral" ,
      top: 2484 ,
      left: 2468 ,
      neighbours: [ "valona", "cetinje", "skopje"] ,
      terrain : "mountain" ,
      vp : false ,
      country : "albania" ,
}

spaces['valona'] = {
      name: "Valona" ,
    control: "neutral" ,
      top: 2659 ,
      left: 2459 ,
      neighbours: [ "tirana", "florina", "taranto"] ,
      terrain : "mountain" ,
      vp : false ,
      country : "albania" ,
}

//
// Greece
//
spaces['florina'] = {
      name: "Florina" ,
    control: "neutral" ,
      top: 2702 ,
      left: 2659 ,
      neighbours: [ "larisa", "valona", "salonika", "monastir"] ,
      terrain : "mountain" ,
      vp : false ,
      country : "greece" ,
}

spaces['salonika'] = {
      name: "Salonika" ,
    control: "neutral" ,
      top: 2650 ,
      left: 2782 ,
      neighbours: [ "strumitsa", "florina", "kavala", "monastir"] ,
      terrain : "mountain" ,
      vp : false ,
      port : 1 ,
      country : "greece" ,
}

spaces['kavala'] = {
      name: "Kavala" ,
    control: "neutral" ,
      top: 2584 ,
      left: 2932 ,
      neighbours: [ "philippoli", "strumitsa", "salonika"] ,
      terrain : "mountain" ,
      vp : false ,
      country : "greece" ,
}

spaces['larisa'] = {
      name: "Larisa" ,
    control: "neutral" ,
      top: 2803 ,
      left: 2754 ,
      neighbours: ["florina", "athens"] ,
      terrain : "mountain" ,
      vp : false ,
      country : "greece" ,
}

spaces['athens'] = {
      name: "Athens" ,
      control: "neutral" ,
      top: 3017 ,
      left: 2888 ,
      neighbours: ["larisa"] ,
      terrain : "normal" ,
      vp : false ,
      port : 1 ,
      country : "greece" ,
}

//
// Serbia
//
spaces['valjevo'] = {
      name: "Valjevo" ,
      control: "allies" ,
      top: 2200 ,
      left: 2490 ,
      neighbours: ["sarajevo","belgrade","nis"] ,
      terrain : "mountain" ,
      vp : false ,
      country : "serbia" ,
}

spaces['belgrade'] = {
      name: "Belgrade" ,
      control: "allies" ,
      fort : 1 ,
      top: 2040 ,
      left: 2580 ,
      neighbours: ["valjevo","nis","timisvar","novisad"] ,
      terrain : "normal" ,
      vp : true ,
      country : "serbia" ,
}

spaces['nis'] = {
      name: "Nis" ,
      control: "allies" ,
      top: 2220 ,
      left: 2640 ,
      neighbours: ["belgrade","valjevo","sofia","skopje"] ,
      terrain : "normal" ,
      vp : false ,
      country : "serbia" ,
}

spaces['skopje'] = {
      name: "Skopje" ,
      control: "allies" ,
      top: 2400 ,
      left: 2645 ,
      neighbours: ["nis","tirana","monastir","sofia"] ,
      terrain : "mountain" ,
      vp : false ,
      country : "serbia" ,
}

spaces['monastir'] = {
      name: "Skopje" ,
      control: "allies" ,
      top: 2543 ,
      left: 2653 ,
      neighbours: ["florina","skopje","strumitsa","salonika"] ,
      terrain : "mountain" ,
      vp : false ,
      country : "serbia" ,
}


//
// Bulgaria
//
spaces['sofia'] = {
      name: "Sofia" ,
    control: "neutral" ,
      top: 2280 ,
      left: 2840 ,
      neighbours: ["strumitsa","skopje","nis","kazanlik"] ,
      terrain : "normal" ,
      vp : false ,
      country : "bulgaria" ,
}

spaces['strumitsa'] = {
      name: "Strumitsa" ,
    control: "neutral" ,
      top: 2440 ,
      left: 2860 ,
      neighbours: ["sofia","monastir","kavala","philippoli"] ,
      terrain : "mountain" ,
      vp : false ,
      country : "bulgaria" ,
}

spaces['philippoli'] = {
      name: "Philippoli" ,
    control: "neutral" ,
      top: 2525 ,
      left: 3065 ,
      neighbours: ["kavala","strumitsa","kazanlik","adrianople"] ,
      terrain : "mountain" ,
      vp : false ,
      country : "bulgaria" ,
}

spaces['kazanlik'] = {
      name: "Kazanlik" ,
    control: "neutral" ,
      top: 2380 ,
      left: 3095 ,
      neighbours: ["sofia","philippoli","burgas","plevna","varna"] ,
      terrain : "mountain" ,
      vp : false ,
      country : "bulgaria" ,
}

spaces['burgas'] = {
      name: "Burgas" ,
    control: "neutral" ,
      top: 2360 ,
      left: 3295 ,
      neighbours: ["adrianople","kazanlik","varna"] ,
      terrain : "normal" ,
      vp : false ,
      country : "bulgaria" ,
}

spaces['varna'] = {
      name: "Varna" ,
    control: "neutral" ,
      top: 2225 ,
      left: 3322 ,
      neighbours: ["burgas","kazanlik","bucharest","constanta"] ,
      terrain : "normal" ,
      vp : false ,
      country : "bulgaria" ,
}

spaces['plevna'] = {
      name: "Plevna" ,
    control: "neutral" ,
      top: 2240 ,
      left: 3010 ,
      neighbours: ["caracal","kazanlik","bucharest","varna"] ,
      terrain : "normal" ,
      vp : false ,
      country : "bulgaria" ,
}



//
// Romania
//
spaces['bucharest'] = {
      name: "Bucharest" ,
    control: "neutral" ,
      top: 2065 ,
      left: 3145 ,
      neighbours: ["plevna","varna","galatz","caracal","ploesti"] ,
      terrain : "normal" ,
      vp : true ,
      country : "romania" ,
}

spaces['constanta'] = {
      name: "Constanta" ,
    control: "neutral" ,
      top: 2070 ,
      left: 3380 ,
      neighbours: ["varna","bucharest","galatz"] ,
      terrain : "normal" ,
      vp : false ,
      country : "romania" ,
}

spaces['galatz'] = {
      name: "Galatz" ,
    control: "neutral" ,
      top: 1935 ,
      left: 3300 ,
      neighbours: ["constanta","bucharest","ismail","barlad"] ,
      terrain : "normal" ,
      vp : false ,
      country : "romania" ,
}

spaces['barlad'] = {
      name: "Barlad" ,
    control: "neutral" ,
      top: 1770 ,
      left: 3215 ,
      neighbours: ["jassy","kishinev","galatz","ploesti"] ,
      terrain : "normal" ,
      vp : false ,
      country : "romania" ,
}

spaces['jassy'] = {
      name: "Jassy" ,
    control: "neutral" ,
      top: 1635 ,
      left: 3175 ,
      neighbours: ["barlad","zhmerinka"] ,
      terrain : "normal" ,
      vp : false ,
      country : "romania" ,
}

spaces['ploesti'] = {
      name: "Ploesti" ,
    control: "neutral" ,
      top: 1915 ,
      left: 3120 ,
      neighbours: ["bucharest","barlad","kronstadt","cartedearges"] ,
      terrain : "mountain" ,
      vp : true ,
      country : "romania" ,
}

spaces['caracal'] = {
      name: "Caracal" ,
    control: "neutral" ,
      top: 2098 ,
      left: 2932 ,
      neighbours: ["bucharest","plevna","targujiu","cartedearges"] ,
      terrain : "normal" ,
      vp : false ,
      country : "romania" ,
}

spaces['cartedearges'] = {
      name: "Carte de Arges" ,
    control: "neutral" ,
      top: 1963 ,
      left: 2902 ,
      neighbours: ["caracal","ploesti","targujiu","hermannstadt"] ,
      terrain : "mountain" ,
      vp : false ,
      country : "romania" ,
}

spaces['targujiu'] = {
      name: "Targu Jiu" ,
    control: "neutral" ,
      top: 1973 ,
      left: 2753 ,
      neighbours: ["ploesti","caracal","timisvar"] ,
      terrain : "normal" ,
      vp : false ,
      country : "romania" ,
}

spaces['adrianople'] = {
      name: "Adrianople" ,
    control: "neutral" ,
      top: 2505 ,
      left: 3300 ,
      neighbours: ["gallipoli","philippoli","burgas","constantinople"] ,
      terrain : "normal" ,
      vp : false ,
      country : "turkey" ,
}

spaces['gallipoli'] = {
      name: "Gallipoli" ,
    control: "neutral" ,
      top: 2635 ,
      left: 3170 ,
      neighbours: ["adrianople","constantinople"] ,
      terrain : "mountain" ,
      vp : false ,
      country : "turkey" ,
}

spaces['constantinople'] = {
      name: "Constantinople" ,
    control: "neutral" ,
      top: 2555 ,
      left: 3465 ,
      neighbours: ["adrianople","gallipoli","bursa","eskidor","adapazari"] ,
      terrain : "normal" ,
    port : 1 ,
      vp : true ,
      country : "turkey" ,
}

spaces['balikesir'] = {
      name: "Balikesir" ,
    control: "neutral" ,
      top: 2788 ,
      left: 3347 ,
      neighbours: ["bursa","canakale","izmir"] ,
      terrain : "mountain" ,
      vp : false ,
      country : "turkey" ,
}

spaces['canakale'] = {
      name: "Cana Kale" ,
    control: "neutral" ,
      top: 2767 ,
      left: 3186 ,
      neighbours: ["balikesir"] ,
      terrain : "normal" ,
      vp : false ,
      country : "turkey" ,
}

spaces['izmir'] = {
      name: "Izmir" ,
    control: "neutral" ,
      top:  2945,
      left: 3265,
      neighbours: ["balikesir"] ,
      terrain : "normal" ,
      vp : false ,
      country : "turkey" ,
}

spaces['aeubox'] = {
      name: "Allied Eliminated Units" ,
      control: "allies" ,
      top:  0,
      left: 0,
      neighbours: [],
      terrain : "normal" ,
      vp : false ,
}

spaces['ceubox'] = {
      name: "Central Eliminated Units" ,
      control: "central",
      top:  0,
      left: 0,
      neighbours: [],
      terrain : "normal" ,
      vp : false ,
}

spaces['arbox'] = {
      name: "Allied Reserves" ,
      control: "allies" ,
      top:  2945,
      left: 3265,
      neighbours: [],
      terrain : "normal" ,
      vp : false ,
}

spaces['crbox'] = {
      name: "Central Powers Reserves" ,
      control: "central",
      top:  2945,
      left: 3265,
      neighbours: [],
      terrain : "normal" ,
      vp : false ,
}

    for (let key in spaces) {
      spaces[key].besieged = 0;
      spaces[key].units = [];
      if (!spaces[key].fort) { spaces[key].fort = 0; }
      spaces[key].trench = 0;
      if (!spaces[key].control) { spaces[key].control = ""; }
      spaces[key].activated_for_movement = 0;
      spaces[key].activated_for_combat = 0;
      if (!spaces[key].port) { spaces[key].port = 0; } // no port
      spaces[key].key = key;
      spaces[key].type = "normal";
    }

    return spaces;

  }




  // turns have several rounds
  onNewRound() {

    this.calculateVictoryPoints();
    this.displayGeneralRecordsTrack();
    this.calculateRussianCapitulationTrack();
    this.displayActionRoundTracks();

    this.game.state.events.wireless_intercepts = 0;
    this.game.state.events.withdrawal = 0;
    this.game.state.events.withdrawal_bonus_used = 0;
    this.game.state.events.brusilov_offensive = 0;

    this.game.state.attacks = {};

    if (this.game.state.events.high_seas_fleet > 1) { this.game.state.events.high_seas_fleet--; }

    for (let key in this.game.spaces) {
      let redisplay = false;
      if (this.game.spaces[key].activated_for_combat || this.game.spaces[key].activated_for_movement) {
        redisplay = true;
      }
      this.game.spaces[key].activated_for_combat = 0;
      this.game.spaces[key].activated_for_movement = 0;
      for (let z = 0; z < this.game.spaces[key].units.length; z++) {
	this.game.spaces[key].units[z].moved = 0;
	this.game.spaces[key].units[z].attacked = 0;
      }
      if (redisplay) { this.displaySpace(key); }
    }

  }

  // the turn is the "round" (rounds have turns)
  onNewTurn() {

    this.game.state.mandated_offensives = {};
    this.game.state.mandated_offensives.central = "";
    this.game.state.mandated_offensives.allies = "";

    this.game.state.allies_passed = 0;
    this.game.state.central_passed = 0;

    this.game.state.ccs = {};
    this.game.state.cc_central_on_table = [];
    this.game.state.cc_central_active = [];
    this.game.state.cc_central_played_this_round = [];
    this.game.state.cc_allies_on_table = [];
    this.game.state.cc_allies_active = [];
    this.game.state.cc_allies_played_this_round = [];

    this.game.state.neutral_entry = 0;
    this.game.state.central_reinforcements_ge = 0;
    this.game.state.central_reinforcements_ah = 0;
    this.game.state.central_reinforcements_tu = 0;
    this.game.state.allies_reinforcements_fr = 0;
    this.game.state.allies_reinforcements_br = 0;
    this.game.state.allies_reinforcements_ru = 0;
    this.game.state.allies_reinforcements_it = 0;
    this.game.state.allies_reinforcements_us = 0;
    this.game.state.allies_rounds = [];
    this.game.state.central_rounds = [];

    this.game.state.entrenchments = [];

    this.game.state.mo = {};
    this.game.state.mo.allies = [];
    this.game.state.mo.central = [];
    this.game.state.mo.vp_bonus = 0;

    this.game.state.rp = {};
    this.game.state.rp['central'] = {};
    this.game.state.rp['allies'] = {};
    this.game.state.rp['central']['GE'] = 0;
    this.game.state.rp['central']['AH'] = 0;
    this.game.state.rp['central']['TU'] = 0;
    this.game.state.rp['central']['BU'] = 0;
    this.game.state.rp['central']['CP'] = 0;
    this.game.state.rp['allies']['A'] = 0;
    this.game.state.rp['allies']['BR'] = 0;
    this.game.state.rp['allies']['FR'] = 0;
    this.game.state.rp['allies']['IT'] = 0;
    this.game.state.rp['allies']['RU'] = 0;
    this.game.state.rp['allies']['AP'] = 0;

    this.game.state.events.zeppelin_raids = 0;
    this.game.state.events.great_retreat = 0;
    this.game.state.events.great_retreat_used = 0;
    this.game.state.events.fall_of_the_tsar_russian_vp = 0;
    this.game.state.events.they_shall_not_pass = 0;
    this.game.state.events.wireless_intercepts = 0;
    this.game.state.events.everyone_into_battle = 0;
    this.game.state.events.withdrawal = 0;
    this.game.state.events.withdrawal_bonus_used = 0;
    this.game.state.events.mine_attack = 0;

  }

  removeOverstackedUnits() {
    for (let key in this.game.spaces) {
      if (key != "ceubox" && key != "aeubox" && key != "arbox" && key != "crbox") {
        while (this.game.spaces[key].units.length > 3) {
	  this.updateLog(this.game.spaces[key].units[3].name + " removed from game (over-stacked)");
	  this.game.spaces[key].units.splice(3, 1);
	  this.displaySpace(key);
	  this.shakeSpacekey(key);
        }
      }
    }
    return 1;
  }

  calculateRussianCapitulationTrack() {

    let count = 0;
    let position = 1;

    for (let key in this.game.spaces) {
      let space = this.game.spaces[key];
      if (space.country == "russia" && space.control == "central" && space.vp == 1) {
	count++;
      }
    }
    if (count >= 3) { position++; }

    if (this.game.state.events.tsar_takes_command) { position++; }

    if (position >= 3) {
      if ((this.game.state.general_records_track.combined_war_status + count) >= 33) { position++; }
    }

    if (this.game.state.events.fall_of_the_tsar) { position++; }

    if (count == 7 || count > this.game.state.events.fall_of_the_tsar_russian_vp && this.game.state.events.fall_of_the_tsar_russian_vp != -1) {
      position++;
    }

    if (this.game.state.events.bolshevik_revolution) { position++; }

    if (position != this.game.state.russian_capitulation_track) {    
      this.game.state.russian_capitulation_track = position;
      this.displayRussianCapitulationTrack();
    }

  }

  returnCapital(ckey="BR") {
    if (ckey == "BR") { return ["london"]; }
    if (ckey == "AH") { return ["vienna","budapest"]; }
    if (ckey == "BE") { return ["brussels"]; }
    if (ckey == "BU") { return ["sofia"]; }
    if (ckey == "FR") { return ["paris"]; }
    if (ckey == "GE") { return ["berlin"]; }
    if (ckey == "GR") { return ["athens"]; }
    if (ckey == "IT") { return ["rome"]; }
    if (ckey == "MN") { return ["cetinje"]; }
    if (ckey == "RO") { return ["bucharest"]; }
    if (ckey == "SB") { return ["belgrade"]; }
    if (ckey == "TU") { return ["constantinople"]; }
    return [];
  }

  calculateVictoryPoints() {

    let vp = 0;
    let central_controlled_vp_spaces = 0;

    //
    // central VP spaces
    //
    for (let key in this.game.spaces) { if (this.game.spaces[key].vp > 0 && this.game.spaces[key].control == "central") { central_controlled_vp_spaces++; } }

    //
    //
    //
    let expected_central_vp_spaces = this.countSpacesWithFilter((spacekey) => {
      if (this.game.spaces[spacekey].country == "germany" && this.game.spaces[spacekey].vp > 0) { return 1; }
      if (this.game.spaces[spacekey].country == "austria" && this.game.spaces[spacekey].vp > 0) { return 1; }
      if (this.game.state.events.bulgaria) { 
        if (this.game.spaces[spacekey].country == "bulgaria" && this.game.spaces[spacekey].vp > 0) { return 1; }
      }
    });

    vp = central_controlled_vp_spaces - expected_central_vp_spaces + 10;

    if (this.game.state.events.rape_of_belgium) { vp--; }
    if (this.game.state.events.belgium) { 
      if (this.game.state.turn >= 5) { vp--; }
      if (this.game.state.turn >= 9) { vp--; }
      if (this.game.state.turn >= 13) { vp--; }
      if (this.game.state.turn >= 17) { vp--; }
    }
    if (this.game.state.events.reichstag_truce) { vp++; }
    if (this.game.state.events.lusitania) { vp--; }
    if (this.game.state.events.war_in_africa_vp) { vp++; }
    if (this.game.state.events.fall_of_the_tsar) { vp++; }
    if (this.game.state.events.fall_of_the_tsar_romania_bonus) { vp++; }
    if (this.game.state.events.fourteen_points) { vp--; }
    if (this.game.state.events.convoy) { vp--; }
    if (this.game.state.events.zimmerman_telegram) { vp--; }
    if (this.game.state.events.blockade > 1) { vp -= (this.game.state.events.blockade-1); }

    if (this.game.state.mo.vp_bonus > 0) { vp += this.game.state.mo.vp_bonus; }

    this.game.state.general_records_track.vp = vp;
  
    return vp;

  }

  returnState() {

    let state = {};

    state.events = {};

    state.players = [];
    state.removed = []; // removed cards
    state.round = 0;
    state.turn = 0;
    state.skip_counter_or_acknowledge = 0; // don't skip
    state.cards_left = {};

    state.neutral_entry = 0;

    state.mandated_offensives = {};
    state.mandated_offensives.central = "";
    state.mandated_offensives.allies = "";

    state.allies_rounds = [];
    state.central_rounds = [];

    state.entrenchments = [];

    state.general_records_track = {};
    state.general_records_track.vp = 10;
    state.general_records_track.allies_war_status = 0;
    state.general_records_track.central_war_status = 0;
    state.general_records_track.combined_war_status = 0;

    state.general_records_track.ge_replacements = 0;
    state.general_records_track.ah_replacements = 0;
    state.general_records_track.allied_replacements = 0;
    state.general_records_track.br_replacements = 0;
    state.general_records_track.fr_replacements = 0;
    state.general_records_track.ru_replacements = 0;

    state.central_reinforcements_ge = 0;
    state.central_reinforcements_ah = 0;
    state.central_reinforcements_tu = 0;
    state.allies_reinforcements_fr = 0;
    state.allies_reinforcements_br = 0;
    state.allies_reinforcements_ru = 0;
    state.allies_reinforcements_it = 0;
    state.allies_reinforcements_us = 0;

    state.general_records_track.current_cp_russian_vp = 0;

    state.us_commitment_track = 1;		// 1 = neutral
						// 2 = Zimmerman Telegram Allowed
						// 3 = Zimmerman Telegram
						// 4 = Over There !

    state.russian_capitulation_track = 1;	// 1 = God Save the Tsar
						// 2 = Tsar Takes Command Allowed 
						// 3 = Tsar Takes Command
						// 4 = Fall of the Tsar Allowed
						// 5 = Fall of the Tsar
						// 6 = Bolshevik Revolution Allowed
						// 7 = Bolshevik Revolution
						// 8 = Treaty of Bresk Litovsk

    state.reserves = {};
    //state.reserves['central'] = ["ah_corps","ah_corps","ah_corps","ah_corps","ge_corps","ge_corps","ge_corps","ge_corps","ge_corps","ge_corps","ge_corps","ge_corps"];
    //state.reserves['allies'] = ["it_corps","it_corps","it_corps","it_corps","fr_corps","fr_corps","fr_corps","fr_corps","fr_corps","fr_corps","fr_corps","br_corps","bef_corps","ru_corps","ru_corps","ru_corps","ru_corps","ru_corps","be_corps","sb_corps","sb_corps"];
    state.reserves['central'] = ["ge_army04", "ge_army06", "ge_army08"];
    state.reserves['allies'] = ["fr_army01", "br_corps", "ru_army09", "ru_army10"];

    state.allies_passed = 0;
    state.central_passed = 0;

    state.eliminated = {};
    state.eliminated['central'] = [];
    state.eliminated['allies'] = [];

    state.rp = {};
    state.rp['central'] = {};
    state.rp['allies'] = {};
    state.rp['central']['GE'] = 0;
    state.rp['central']['AH'] = 0;
    state.rp['central']['TU'] = 0;
    state.rp['central']['BU'] = 0;
    state.rp['central']['CP'] = 0;
    state.rp['allies']['A'] = 0;
    state.rp['allies']['BR'] = 0;
    state.rp['allies']['FR'] = 0;
    state.rp['allies']['IT'] = 0;
    state.rp['allies']['RU'] = 0;
    state.rp['allies']['AP'] = 0;

    // tracks mandated offensives - who each attacked against
    state.mo = {};
    state.mo.allies = [];
    state.mo.central = [];
    state.mo.vp_bonus = 0;
    state.attacks = {};

    state.active_player = -1;

    state.ccs = {};
    state.cc_central_active = [];
    state.cc_central_played_this_round = [];
    state.cc_allies_active = [];
    state.cc_allies_played_this_round = [];


    state.central_limited_war_cards_added = false;
    state.allies_limited_war_cards_added = false;
    state.central_total_war_cards_added = false;
    state.allies_total_war_cards_added = false;

    //
    // countries get marked when they enter the war...
    //
    state.events.belgium = 1;
    state.events.montenegro = 1;
    state.events.serbia = 1;
    state.events.austria = 1;
    state.events.germany = 1;
    state.events.france = 1;
    state.events.england = 1;
    state.events.russia = 1;

    state.events.war_in_africa_vp = 0;
    state.events.blockade = 0;
    state.events.great_retreat = 0;
    state.events.great_retreat_used = 0;

    return state;

  }


  moveUnitToSpacekey(ukey, to="") {

    let unit = this.game.units[ukey];

    for (let key in this.game.spaces) {
      for (let i = 0; i < this.game.spaces[key].units.length; i++) {
        if (this.game.spaces[key].units[i].key == ukey) {
	  unit = this.game.spaces[key].units[i];
	  this.game.spaces[key].units.splice(i, 1);
	  break;
        }
      }
    }

    unit.spacekey = to;
    this.game.spaces[to].units.push(unit);

    this.displayBoard();
    
    return 1;

  }



  //
  // Core Game Logic
  //
  async handleGameLoop() {

    let paths_self = this;

    ///////////
    // QUEUE //
    ///////////
    if (this.game.queue.length > 0) {

        let qe = this.game.queue.length-1;
        let mv = this.game.queue[qe].split("\t");
	let z = this.returnEventObjects();
        let shd_continue = 1;

console.log("QUEUE: " + JSON.stringify(this.game.queue));
console.log("MOVE: " + mv[0]);

	//
	// entry point for every turn in the game
	//
	// NOTE: turns contains rounds in this game, which is a somewhat
	// unusual terminology. the action phase contains 6 rounds per 
	// player, played in sequence.
	//
        if (mv[0] === "turn") {

	  this.game.state.turn++;
	  this.game.state.round = 0;	   


console.log("##################");
console.log("##################");
console.log("##################");
console.log("##################");
console.log("##################");
console.log("##################");
console.log("##################");
console.log("##################");
console.log("====HANDS====");
console.log(JSON.stringify(this.game.deck[0].hand));
console.log(JSON.stringify(this.game.deck[1].hand));

	  //
	  // remove any "pass" option
	  //
	  for (let z = this.game.deck[0].hand.length-1; z >= 0; z--) {
	    if (this.game.deck[0].hand[z] === "pass") { this.game.deck[0].hand.splice(z, 1); }
	  }
	  for (let z = this.game.deck[1].hand.length-1; z >= 0; z--) {
	    if (this.game.deck[1].hand[z] === "pass") { this.game.deck[1].hand.splice(z, 1); }
	  }

this.updateLog(`###############`);
this.updateLog(`### Turn ${this.game.state.turn} ###`);
this.updateLog(`###############`);
console.log(JSON.stringify(this.game.deck[0].hand));
console.log(JSON.stringify(this.game.deck[1].hand));

	  this.onNewTurn();

          for (let i = 0; i < this.game.state.players_info.length; i++) {
            this.resetPlayerRound((i+1));
          }

	  //
	  // we have reset variables, so redisplay
	  //
	  this.displayBoard();

          this.game.queue.push("draw_strategy_card_phase");
          this.game.queue.push("replacement_phase");
          this.game.queue.push("evaluate_mandated_offensive_phase");
          this.game.queue.push("war_status_phase");
          this.game.queue.push("siege_phase");
          this.game.queue.push("attrition_phase");
          this.game.queue.push("action_phase");
          this.game.queue.push("mandated_offensive_phase");

	  if (this.game.state.turn === 1) {
            this.game.queue.push("guns_of_august");
            this.game.queue.push("show_overlay\twelcome\tallies");
            this.game.queue.push("show_overlay\twelcome\tcentral");
          }

	  return 1;

	}


        if (mv[0] === "show_overlay") {

          this.game.queue.splice(qe, 1);

          //
          // hide any cardbox
          //
          this.cardbox.hide();

          if (mv[1] === "welcome") {
            let faction = mv[2];
            let player = this.returnPlayerOfFaction(faction);
            if (faction === "central") { player = this.returnPlayerOfFaction("central"); }
            if (faction === "allies") { player = this.returnPlayerOfFaction("allies"); }
            if (this.game.player === player) {
              this.welcome_overlay.render(faction);
              this.game.queue.push("hide_overlay\twelcome");
              if (faction === "central") { this.game.queue.push("ACKNOWLEDGE\tYou are the Central Powers"); }
              if (faction === "allies") { this.game.queue.push("ACKNOWLEDGE\tYou are the Allied Powers"); }
            }
          }

	  return 1;
	}


	//
	// now we just start everyone with Guns of August
	//
	if (mv[0] === "guns_of_august") {

	  this.game.queue.splice(qe, 1);

	  if (this.game.player === this.returnPlayerOfFaction("central")) {
	    this.game.deck[0].hand.push("cp01");
	  }

	  //if (this.game.player === this.returnPlayerOfFaction("central")) {
	  //  if (this.game.deck[0].hand.includes("cp01")) {
	  //    this.addMove("NOTIFY\tCentral Powers start with Guns of August!");
          //    this.addMove("DEAL\t1\t1\t1"); // deal random other card
	  //    this.endTurn();
	  //  } else {
	  //    this.playerPlayGunsOfAugust();
	  //  }
	  //} else {
	  //  this.updateStatus("Central Powers considering Guns of August");
	  //}
	  //
	  //return 0;

	}

 	if (mv[0] == "draw_strategy_card_phase") {

          this.game.queue.splice(qe, 1);

	  let all_cards = this.returnDeck("all"); 
          this.game.queue.push("deal_strategy_cards");

	  //
	  // LIMITED WAR CARDS - allied
	  //
  	  if (this.game.state.general_records_track.allies_war_status >= 4 && this.game.state.allies_limited_war_cards_added == false) {

	    this.game.state.allies_limited_war_cards_added = true;
	
	    let discarded_cards = {};
    	    for (let key in this.game.deck[1].discards) { discarded_cards[key] = all_cards[key]; }
	    let new_cards = this.returnLimitedWarDeck("allies");
	    for (let key in discarded_cards) { new_cards[key] = discarded_cards[key]; }

            // shuffle in discarded cards
            this.game.queue.push("SHUFFLE\t2");
            this.game.queue.push("DECKRESTORE\t2");
            this.game.queue.push("DECKENCRYPT\t2\t2");
            this.game.queue.push("DECKENCRYPT\t2\t1");
            this.game.queue.push("DECKXOR\t2\t2");
            this.game.queue.push("DECKXOR\t2\t1");
            this.game.queue.push("DECK\t2\t"+JSON.stringify(new_cards));
            this.game.queue.push("DECKBACKUP\t2");
            this.updateLog("Shuffling discarded cards back into the deck...");

	  }

  	  if (this.game.state.general_records_track.central_war_status >= 4 && this.game.state.central_limited_war_cards_added == false) {
	    this.game.state.central_limited_war_cards_added = true;
	
	    let discarded_cards = {};
    	    for (let key in this.game.deck[0].discards) { discarded_cards[key] = all_cards[key]; }
	    let new_cards = this.returnLimitedWarDeck("central");
	    for (let key in discarded_cards) { new_cards[key] = discarded_cards[key]; }

            // shuffle in discarded cards
            this.game.queue.push("SHUFFLE\t1");
            this.game.queue.push("DECKRESTORE\t1");
            this.game.queue.push("DECKENCRYPT\t1\t2");
            this.game.queue.push("DECKENCRYPT\t1\t1");
            this.game.queue.push("DECKXOR\t1\t2");
            this.game.queue.push("DECKXOR\t1\t1");
            this.game.queue.push("DECK\t1\t"+JSON.stringify(new_cards));
            this.game.queue.push("DECKBACKUP\t1");
            this.updateLog("Shuffling discarded cards back into the deck...");

	  }
  	  if (this.game.state.general_records_track.allies_war_status >= 11 && this.game.state.allies_total_war_cards_added == false) {
	    this.game.state.allies_total_war_cards_added = true;
	
	    let discarded_cards = {};
    	    for (let key in this.game.deck[1].discards) { discarded_cards[key] = all_cards[key]; }
	    let new_cards = this.returnTotalWarDeck("allies");
	    for (let key in discarded_cards) { new_cards[key] = discarded_cards[key]; }

            // shuffle in discarded cards
            this.game.queue.push("SHUFFLE\t2");
            this.game.queue.push("DECKRESTORE\t2");
            this.game.queue.push("DECKENCRYPT\t2\t2");
            this.game.queue.push("DECKENCRYPT\t2\t1");
            this.game.queue.push("DECKXOR\t2\t2");
            this.game.queue.push("DECKXOR\t2\t1");
            this.game.queue.push("DECK\t2\t"+JSON.stringify(new_cards));
            this.game.queue.push("DECKBACKUP\t2");
            this.updateLog("Shuffling discarded cards back into the deck...");

	  }
  	  if (this.game.state.general_records_track.central_war_status >= 11 && this.game.state.central_total_war_cards_added == false) {
	    this.game.state.central_total_war_cards_added = true;
	
	    let discarded_cards = {};
    	    for (let key in this.game.deck[0].discards) { discarded_cards[key] = all_cards[key]; }
	    let new_cards = this.returnTotalWarDeck("central");
	    for (let key in discarded_cards) { new_cards[key] = discarded_cards[key]; }

            // shuffle in discarded cards
            this.game.queue.push("SHUFFLE\t1");
            this.game.queue.push("DECKRESTORE\t1");
            this.game.queue.push("DECKENCRYPT\t1\t2");
            this.game.queue.push("DECKENCRYPT\t1\t1");
            this.game.queue.push("DECKXOR\t1\t2");
            this.game.queue.push("DECKXOR\t1\t1");
            this.game.queue.push("DECK\t1\t"+JSON.stringify(new_cards));
            this.game.queue.push("DECKBACKUP\t1");
            this.updateLog("Shuffling discarded cards back into the deck...");

	  }

          return 1;

	}


	if (mv[0] == "deal_strategy_cards") {

	  this.game.queue.splice(qe, 1);

          let allies_cards_needed = (this.game.state.round >= 4)? 6 : 7;
          let central_cards_needed = (this.game.state.round >= 4)? 6 : 7;
      
          if (allies_cards_needed > this.game.deck[1].crypt.length) { allies_cards_needed = this.game.deck[1].crypt.length; }
          if (central_cards_needed > this.game.deck[0].crypt.length) { central_cards_needed = this.game.deck[0].crypt.length; }
          
          this.game.queue.push("DEAL\t1\t1\t"+central_cards_needed);
          this.game.queue.push("DEAL\t2\t2\t"+allies_cards_needed);

	  return 1;

	}


 	if (mv[0] == "replacement_phase") {

          this.game.queue.splice(qe, 1);

	  //
	  // Zeppelin Raids
	  //
	  if (this.game.state.events.zeppelin_raids == 1) {
	    this.updateLog("Zepplin Raids reduce British Replacement Points (-4)...");
	    if (!this.game.state.rp["allies"]["BR"]) { this.game.state.rp["allies"]["BR"] = 0; }
	    this.game.state.rp["allies"]["BR"] -= 4;
	    if (this.game.state.rp["allies"]["BR"] < 0) { this.game.state.rp["allies"]["BR"] = 0; }
	  }

	  //
	  // U-Boats Unleashed
	  //
	  if (this.game.state.events.uboats_unleashed == 1 && this.game.state.events.convoy != 1) {
	    if (!this.game.state.rp["allies"]["BR"]) { this.game.state.rp["allies"]["BR"] = 0; }
	    if (this.game.state.rp["allies"]["BR"] > 1) { this.game.state.rp["allies"]["BR"]--; }
	  }

	  //
	  // Walter Rathenau
	  //
	  if (this.game.state.events.walter_rathenau == 1 && this.game.state.events.independent_air_force != 1) {
	    if (!this.game.state.rp["central"]["GE"]) { this.game.state.rp["central"]["GE"] = 0; }
	    this.updateLog("Germany gets Walter Rathenau bonus...");
	    this.game.state.rp["central"]["GE"]++;
	  }

	  this.game.queue.push("player_play_replacements\tallies");
	  this.game.queue.push("player_play_replacements\tcentral");

	  console.log("###");
	  console.log("### Replacement Phase");
	  console.log("###");

	  return 1;
	}

	if (mv[0] == "player_play_replacements") {

	  let faction = mv[1];
          this.game.queue.splice(qe, 1);

	  //	
	  // skip if no replacement points	
	  //	
	  let count = 0;
	  for (let key in this.game.state.rp[faction]) { count += parseInt(this.game.state.rp[faction][key]); }
	  if (count == 0) { 

alert("no replacement points for... " + faction);

return 1; }

	  if (this.returnPlayerOfFaction(faction) == this.game.player) {
	    this.playerSpendReplacementPoints(faction);
	  } else {
	    this.updateStatus(this.returnFactionName(faction) + " assigning replacement points...");
	  }

	  return 0;

	}

	if (mv[0] == "finish_replacement_phase") {

	  this.game.state.rp['central'] = {};
	  this.game.state.rp['allies'] = {};
	  
          this.game.queue.splice(qe, 1);
	  return 1;
	}

 	if (mv[0] == "war_status_phase") {

	  //
	  // blockade removes 1 VP if active - done by incrementing event
	  //
	  if (this.game.state.events.blockade > 0) { this.game.state.events.blockade++; }

  	  if (this.game.state.general_records_track.central_war_status >= 4 && this.game.state.central_limited_war_cards_added == false) {
	    if (this.game.player == this.returnPlayerOfFaction("central")) {
	      this.displayCustomOverlay({
          	text : "Central Powers gain Limited War Cards",
          	title : "Limited War!",
          	img : "/paths/img/backgrounds/shells.png",
          	msg : "new cards added to deck...",
          	styles : [{ key : "backgroundPosition" , val : "bottom" }],
              });
	    }

	    //
	    // Turkey enters the war on the side of the Central Powers
	    //
	    paths_self.convertCountryToPower("turkey", "central");
	    this.game.state.events.turkey = 1;
	    this.addTrench("giresun", 1);
	    this.addTrench("baghdad", 1);
	    this.addUnitToSpace("tu_corps", "adrianople");
	    this.addUnitToSpace("tu_corps", "gallipoli");
	    this.addUnitToSpace("tu_corps", "constantinople");
	    this.addUnitToSpace("tu_corps", "balikesir");
	    this.addUnitToSpace("tu_corps", "ankara");
	    this.addUnitToSpace("tu_corps", "adana");
	    this.addUnitToSpace("tu_corps", "rize");
	    this.addUnitToSpace("tu_corps", "erzerum");
	    this.addUnitToSpace("tu_corps", "baghdad");
	    this.addUnitToSpace("tu_corps", "damascus");
	    this.addUnitToSpace("tu_corps", "gaza");
	    this.addUnitToSpace("tu_corps", "medina");
	    this.displayBoard();

	    this.displayCustomOverlay({
          	text : "Turkey joins the Central Powers" ,
          	title : "Limited War!",
          	img : "/paths/img/backgrounds/entry/turkey-enters-the-war.png",
          	msg : "Turkish units added to deck...",
          	styles : [{ key : "backgroundPosition" , val : "bottom" }],
            });

	  }
  	  if (this.game.state.general_records_track.allies_war_status >= 4 && this.game.state.allies_limited_war_cards_added == false) {
	    if (this.game.player == this.returnPlayerOfFaction("allies")) {
	      this.displayCustomOverlay({
          	text : "Allied Nations gain Limited War Cards",
          	title : "Limited War!",
          	img : "/paths/img/backgrounds/shells.png",
          	msg : "new cards added to deck...",
          	styles : [{ key : "backgroundPosition" , val : "bottom" }],
              });
	    }
	  }
  	  if (this.game.state.general_records_track.allies_war_status >= 11 && this.game.state.allies_total_war_cards_added == false) {
	    if (this.game.player == this.returnPlayerOfFaction("allies")) {
	      this.displayCustomOverlay({
          	text : "Allied Nations gain Total War Cards",
          	title : "Total War!",
          	img : "/paths/img/backgrounds/trench.png",
          	msg : "new cards added to deck...",
          	styles : [{ key : "backgroundPosition" , val : "bottom" }],
              });
	    }

	  }
  	  if (this.game.state.general_records_track.central_war_status >= 11 && this.game.state.central_total_war_cards_added == false) {
	    if (this.game.player == this.returnPlayerOfFaction("central")) {
	      this.displayCustomOverlay({
          	text : "Central Powers gain Total War Cards",
          	title : "Total War!",
          	img : "/paths/img/backgrounds/trench.png",
          	msg : "new cards added to deck...",
          	styles : [{ key : "backgroundPosition" , val : "bottom" }],
              });
	    }
	  }

          this.game.queue.splice(qe, 1);
	  return 1;
	}

 	if (mv[0] == "siege_phase") {

	  for (let key in this.game.spaces) {
	    let space = this.game.spaces[key];
	    if (space.besieged == true) {
	      if (space.fort > 0) {
		if (space.units.length > 0) {
		  if (this.returnPowerOfUnit(space.units[0]) != space.control) {

		    let roll = this.rollDice(6);
		    if (this.game.state.turn < 2) { roll -= 2; }
		    if (roll > space.fort) {
		      space.fort = -1;
		      this.updateStatus(this.returnSpaceNameForLog(space.key) + " fort destroyed (roll: " + roll + ")");

	              //
	              // switch control
	              //
	              space.control = this.returnPowerOfUnit(space.units[0]);

 	             //
                     // degrade trenches
                     //
                     if (space.trench > 0) { space.trench--; }
		     this.displaySpace(key);
		     this.shakeSpacekey(key);

		    } else {
		      this.updateStatus(this.returnSpaceNameForLog(space.key) + " fort resists siege (roll: " + roll + ")");
		    }

		  }
		}
	      }
	    }
	  }

          this.game.queue.splice(qe, 1);
	  return 1;
	}
 	if (mv[0] == "attrition_phase") {

          this.game.queue.splice(qe, 1);

	  //
	  // look unit-by-unit for units that are out-of-supply
	  //
	  for (let key in this.game.spaces) {
	    if (this.game.spaces[key].units.length > 0 &&
		key != "arbox" && 
		key != "crbox" && 
		key != "aeubox" && 
		key != "ceubox"
	    ) {
	      let power = this.returnPowerOfUnit(this.game.spaces[key].units[0]);
	      let ckey = this.game.spaces[key].units[0].ckey.toLowerCase();

	      if (power == "central" || power == "allies") {

		if (!this.checkSupplyStatus(ckey, key)) {

		  let anyone_in_supply = false;
		  for (let z = 0; z < this.game.spaces[key].units.length; z++) {
		    if (this.game.units[this.game.spaces[key].units[z].key].checkSupplyStatus(this, key)) { anyone_in_supply = true; };
		  }

		  //
		  // eliminate armies and corps
		  //
		  if (anyone_in_supply == false) {
		  for (let z = this.game.spaces[key].units.length-1; z >= 0; z--) {
		    let u = this.game.spaces[key].units[z];
		    if (u.army) {
          	      if (power == "allies") {
			this.updateLog(u.name + " eliminated from " + this.returnSpaceNameForLog(key) + " (out-of-supply)");
			this.game.spaces[key].units.splice(z, 1);
		      }
          	      if (power == "central") {
			this.updateLog(u.name + " eliminated from " + this.returnSpaceNameForLog(key) + " (out-of-supply)");
			this.game.spaces[key].units.splice(z, 1);
		      }
		    }
		    if (u.corps) {
          	      if (power == "allies") {
			this.updateLog(u.name + " eliminated from " + this.returnSpaceNameForLog(key) + " (out-of-supply)");
            		this.game.state.eliminated["allies"].push(this.game.spaces[key].units[z]);
			this.game.spaces[key].units.splice(z, 1);
		      }
          	      if (power == "central") {
			this.updateLog(u.name + " eliminated from " + this.returnSpaceNameForLog(key) + " (out-of-supply)");
            		this.game.state.eliminated["central"].push(this.game.spaces[key].units[z]);
			this.game.spaces[key].units.splice(z, 1);
		      }
		    }
		  }
		  }
		}
	      }
	    }
	  }

	  return 1;

	}

 	if (mv[0] == "action_phase") {

          this.game.queue.splice(qe, 1);

	  //
	  // these will clear when:
	  //  - 1 card left + pass, or 
	  //  - no cards left
	  //
          let cards_needed = (this.game.state.round >= 4)? 6 : 7;
	  for (let z = 0; z < cards_needed+1; z++) {
	    this.game.queue.push("play\tallies");
	    this.game.queue.push("play\tcentral");
	  }

	  return 1;
	}

 	if (mv[0] == "evaluate_mandated_offensive_phase") {

	  let central_fulfills = false;
	  let allies_fulfills = false;

	  if (this.game.state.mandated_offensives.central == "") { central_fulfills = true; }
	  if (this.game.state.mandated_offensives.allies == "") { allies_fulfills = true; }

	  for (let z = 0; z < this.game.state.mo["central"].length; z++) {
	    if (this.game.state.mo["central"][z] == this.game.state.mandated_offensives.central) {
	      central_fulfills = true;
	    }
	  }

	  for (let z = 0; z < this.game.state.mo["allies"].length; z++) {
	    if (this.game.state.mo["allies"][z] == this.game.state.mandated_offensives.allies) {
	      allies_fulfills = true;
	    }
	  }

	  if (!central_fulfills) {
	    this.updateLog("Central Powers -1 VP for failing mandated offensive");
	    this.game.state.mo.vp_bonus--;
	  }
	  if (!allies_fulfills) {
	    this.updateLog("Allied Powers -1 VP for failing mandated offensive");
	    this.game.state.mo.vp_bonus++;
	  }

          this.game.queue.splice(qe, 1);
	  return 1;

	}


 	if (mv[0] == "mandated_offensive_phase") {

	  let central = this.rollDice();
	  let allies = this.rollDice();
	
	  if (this.game.state.events.hoffman == 1) {
	    this.updateLog("Central Powers get Hoffman +1 bonus...");
	    central++;
	  }	

	  if (this.game.state.events.hl_take_command == 1) {
	    this.updateLog("H-L Take Command effect: no Central MO...");
	    central = 6;
	  }

 	  if (central == 1) { this.game.state.mandated_offensives.central = "AH"; }
 	  if (central == 2) { this.game.state.mandated_offensives.central = "AH IT"; }
	  if (this.game.state.events.italy != 1) { this.game.state.mandated_offensives.central = "AH"; }
 	  if (central == 3) { this.game.state.mandated_offensives.central = "TU"; }
 	  if (central == 4) { this.game.state.mandated_offensives.central = "GE"; }
 	  if (central == 5) { this.game.state.mandated_offensives.central = ""; }
 	  if (central == 6) { this.game.state.mandated_offensives.central = ""; }
 	  if (allies == 1)  { this.game.state.mandated_offensives.allies = "FR"; }
 	  if (allies == 2)  { this.game.state.mandated_offensives.allies = "FR"; }
 	  if (allies == 3)  { this.game.state.mandated_offensives.allies = "BR"; }
 	  if (allies == 4)  { this.game.state.mandated_offensives.allies = "IT"; }
 	  if (allies == 5)  { this.game.state.mandated_offensives.allies = "IT"; }
 	  if (allies == 6)  { this.game.state.mandated_offensives.allies = "RU"; }

	  // 7.1.2 If the result is “None” or a currently neutral nation, there is 
	  // no effect. If the nation’s capital (both Budapest and Vienna in the 
	  // case of Austria-Hungary) is currently controlled by the enemy, that 
	  // nation does not have a MO and the MO is shifted one space to the right 
	  // on the MO Table.
	  //

	  //
	  // allies
	  //
	  let shift_required = true;
	  allies--;
	  while (shift_required && allies <= 6) {

	    allies++;
 	    if (allies == 1)  { this.game.state.mandated_offensives.allies = "FR"; }
 	    if (allies == 2)  { this.game.state.mandated_offensives.allies = "FR"; }
 	    if (allies == 3)  { this.game.state.mandated_offensives.allies = "BR"; }
 	    if (allies == 4)  { this.game.state.mandated_offensives.allies = "IT"; }
 	    if (allies == 5)  { this.game.state.mandated_offensives.allies = "IT"; }
 	    if (allies == 6)  { this.game.state.mandated_offensives.allies = "RU"; }
 	    if (allies == 7)  { this.game.state.mandated_offensives.allies = ""; }

	    let c = this.returnCapital(this.game.state.mandated_offensives.allies);
	    for (let z = 0; z < c.length; z++) {
	      if (this.game.spaces[c[z]].besieged == 0 && this.game.spaces[c[z]].control != "allies") {
	      } else {
		shift_required = false;
	      }
	    }

	  }


	  //
	  // central
	  //
	  shift_required = true;
	  central--;
	  while (shift_required && central <= 6) {

	    central++;

 	    if (central == 1) { this.game.state.mandated_offensives.central = "AH"; }
 	    if (central == 2) { this.game.state.mandated_offensives.central = "AH IT"; }
	    if (this.game.state.events.italy != 1) { this.game.state.mandated_offensives.central = "AH"; }
 	    if (central == 3) { this.game.state.mandated_offensives.central = "TU"; }
 	    if (central == 4) { this.game.state.mandated_offensives.central = "GE"; }
 	    if (central == 5) { this.game.state.mandated_offensives.central = ""; }
 	    if (central == 6) { this.game.state.mandated_offensives.central = ""; }
 	    if (central == 7) { this.game.state.mandated_offensives.central = ""; }

	    let ckey = this.game.state.mandated_offensives.central;
	    if (ckey == "AH IT") { ckey = "AH"; }
	    let c = this.returnCapital(ckey);

	    for (let z = 0; z < c.length; z++) {
	      if (this.game.spaces[c[z]].besieged == 0 && this.game.spaces[c[z]].control != "central") {
	      } else {
		shift_required = false;
	      }
	    }

	  }

	  this.displayMandatedOffensiveTracks();
          this.game.queue.splice(qe, 1);

	  return 1;
	}


	//////////////
	// GAMEPLAY //
	//////////////
	if (mv[0] == "play") {

	  let faction = mv[1];
	  let player = this.returnPlayerOfFaction(faction);
	  let name = this.returnPlayerName(faction);
	  let hand = this.returnPlayerHand();

	  this.removeSelectable();
	  this.removeOverstackedUnits();
	  this.checkSupplyStatus();

	  this.unbindBackButtonFunction();

console.log("faction: " + faction);
console.log("central_passed: " + this.game.state.central_passed);
console.log("allies_passed: " + this.game.state.allies_passed);

	  if (faction == "central") { this.game.state.round++; }

	  if (faction === "central" && parseInt(this.game.state.central_passed) == 1) {
	    for (let z = 0; z < this.game.deck[0].hand.length; z++) { if (this.game.deck[0].hand[z] == "pass") { this.game.deck[0].hand.splice(z, 1); } }
	    this.game.queue.splice(qe, 1); 
	    this.updateStatusAndListCards(`Opponent Turn`, hand);
	    return 1; 
	  }
	  if (faction === "allies" && parseInt(this.game.state.allies_passed) == 1) {
	    for (let z = 0; z < this.game.deck[1].hand.length; z++) { if (this.game.deck[1].hand[z] == "pass") { this.game.deck[0].hand.splice(z, 1); } }
	    this.updateStatusAndListCards(`Opponent Turn`, hand);
	    this.game.queue.splice(qe, 1);
	    return 1; 
	  }

	  this.onNewRound();

console.log("PLAY: " + this.game.player);
console.log("player: " + player);
console.log("HAND: " + JSON.stringify(hand));

	  if (this.game.player == player) {
	    this.playerTurn(faction);
	  } else {
	    this.updateStatusAndListCards(`Opponent Turn`, hand);
	  }
	  
	  return 0;

	}

	if (mv[0] == "pass") {

	  let faction = mv[1];
	  if (faction == "central") {
	    this.game.state.central_passed = 1;
	  } else {
	    this.game.state.allies_passed = 1;
	  }

          this.game.queue.splice(qe, 1);
	  return 1;

	}

	if (mv[0] == "record") {

	  let faction = mv[1];
	  let round = parseInt(mv[2]);
	  let action = mv[3];

	  if (faction == "central") {
	    this.game.state.central_rounds.push(action);
	  }
	  if (faction == "allies") {
	    this.game.state.allies_rounds.push(action);
	  }

          this.game.queue.splice(qe, 1);
	  return 1;

	}

	if (mv[0] == "add_unit_to_space") {

	  let unit = mv[1];
	  let spacekey = mv[2];
	  let player_to_ignore = 0;
	  if (mv[3]) { player_to_ignore = parseInt(mv[3]); }

	  if (this.game.player != player_to_ignore) {
            this.addUnitToSpace(unit, spacekey);
	  }

	  this.shakeSpacekey(spacekey);

          this.game.queue.splice(qe, 1);
	  return 1;

	}

	if (mv[0] == "discard") {

	  let deck = this.returnDeck();
	  let card = mv[1];

	  this.removeCardFromHand(card);

	  if (deck[card].removeFromDeckAfterPlay(this)) {
	    this.removeCardFromGame(card);
	  }

          this.game.queue.splice(qe, 1);
	  return 1;

	}


	if (mv[0] == "event") {

	  let deck = this.returnDeck();
	  let card = mv[1];
	  let faction = mv[2];

          this.game.queue.splice(qe, 1);

	  this.updateLog(this.returnFactionName(faction) + " triggers " + this.popup(card));

	  if (deck[card]) {
	    if (deck[card].canEvent(this, faction)) {
	      return deck[card].onEvent(this, faction);
	    }
	  }

	  this.game.queue.push(`ACKNOWLEDGE\t${this.returnFactionName(faction)} triggers ${deck[card].name}`);

	  return 1;

	}


        if (mv[0] == "init") {
try {
	  // belgium
          this.addUnitToSpace("be_army", "antwerp");
          this.addUnitToSpace("bef_army", "brussels");

	  // france
          this.addTrench("paris", 1);
          this.addUnitToSpace("fr_army05", "sedan");
          this.addUnitToSpace("fr_army06", "paris");
          this.addUnitToSpace("fr_army03", "verdun");
          this.addUnitToSpace("fr_army04", "verdun");
          this.addUnitToSpace("fr_army01", "nancy");
          this.addUnitToSpace("fr_army02", "nancy");
          this.addUnitToSpace("fr_army09", "barleduc");
          this.addUnitToSpace("fr_corps", "belfort");
          this.addUnitToSpace("fr_corps", "grenoble");

	  // germany
	  this.addTrench("metz", 1);
	  this.addTrench("konigsberg", 1);
	  this.addTrench("strasbourg", 1);
          this.addUnitToSpace("ge_army01", "aachen");
          this.addUnitToSpace("ge_army02", "koblenz");
          this.addUnitToSpace("ge_army03", "koblenz");
          this.addUnitToSpace("ge_army04", "metz");
          this.addUnitToSpace("ge_army05", "metz");
          this.addUnitToSpace("ge_army06", "strasbourg");
          this.addUnitToSpace("ge_army08", "insterberg");
          this.addUnitToSpace("ge_corps", "insterberg");
          this.addUnitToSpace("ge_corps", "bremen");
          this.addUnitToSpace("ge_corps", "oppeln");

	  // russia
	  this.addTrench("riga", 1);
	  this.addTrench("odessa", 1);
          this.addUnitToSpace("ru_army01", "kovno");
          this.addUnitToSpace("ru_army02", "lomza");
          this.addUnitToSpace("ru_army04", "ivangorod");
          this.addUnitToSpace("ru_army05", "lublin");
          this.addUnitToSpace("ru_army03", "dubno");
          this.addUnitToSpace("ru_army08", "kamenetspodolski");
          this.addUnitToSpace("ru_corps", "grodno");
          this.addUnitToSpace("ru_corps", "riga");
          this.addUnitToSpace("ru_corps", "szawli");
          this.addUnitToSpace("ru_corps", "odessa");
          this.addUnitToSpace("ru_corps", "lutsk");
          this.addUnitToSpace("ru_corps", "riga");
          this.addUnitToSpace("ru_corps", "batum");

	  // austria
	  this.addTrench("cracow", 1);
	  this.addTrench("trieste", 1);
	  this.addTrench("villach", 1);
          this.addUnitToSpace("ah_corps", "cracow");
          this.addUnitToSpace("ah_corps", "villach");
          this.addUnitToSpace("ah_corps", "timisvar");
          this.addUnitToSpace("ah_corps", "czernowitz");
          this.addUnitToSpace("ah_corps", "stanislau");
          this.addUnitToSpace("ah_army06", "sarajevo");
          this.addUnitToSpace("ah_army05", "novisad");
          this.addUnitToSpace("ah_army02", "munkacs");
          this.addUnitToSpace("ah_army01", "tarnow");
          this.addUnitToSpace("ah_army04", "przemysl");
          this.addUnitToSpace("ah_army03", "tarnopol");

	  // montenegro
          this.addUnitToSpace("mn_corps", "cetinje");

	  // serbia
          this.addUnitToSpace("sb_corps", "arbox");
          this.addUnitToSpace("sb_corps", "arbox");
          this.addUnitToSpace("sb_army01", "belgrade");
          this.addUnitToSpace("sb_army02", "valjevo");

	  // italy
	  //this.addTrench("trent", 1);
	  //this.addTrench("asiago", 1);
	  //this.addTrench("maggiore", 1);
          //this.addUnitToSpace("it_corps", "taranto");
          //this.addUnitToSpace("it_corps", "rome");
          //this.addUnitToSpace("it_corps", "turin");
          //this.addUnitToSpace("it_army01", "verona");
          //this.addUnitToSpace("it_army02", "udine");
          //this.addUnitToSpace("it_army03", "maggiore");
          //this.addUnitToSpace("it_army04", "asiago");

	  // reserves boxes
    	  this.addUnitToSpace("ah_corps", "crbox");
    	  this.addUnitToSpace("ah_corps", "crbox");
    	  this.addUnitToSpace("ah_corps", "crbox");
    	  this.addUnitToSpace("ah_corps", "crbox");

    	  this.addUnitToSpace("ge_corps", "crbox");
    	  this.addUnitToSpace("ge_corps", "crbox");
    	  this.addUnitToSpace("ge_corps", "crbox");
    	  this.addUnitToSpace("ge_corps", "crbox");
    	  this.addUnitToSpace("ge_corps", "crbox");
    	  this.addUnitToSpace("ge_corps", "crbox");
    	  this.addUnitToSpace("ge_corps", "crbox");
    	  this.addUnitToSpace("ge_corps", "crbox");

    	  this.addUnitToSpace("be_corps", "arbox");

    	  this.addUnitToSpace("sb_corps", "arbox");
    	  this.addUnitToSpace("sb_corps", "arbox");

    	  this.addUnitToSpace("ru_corps", "arbox");
    	  this.addUnitToSpace("ru_corps", "arbox");
    	  this.addUnitToSpace("ru_corps", "arbox");
    	  this.addUnitToSpace("ru_corps", "arbox");
    	  this.addUnitToSpace("ru_corps", "arbox");

    	  this.addUnitToSpace("fr_corps", "arbox");
    	  this.addUnitToSpace("fr_corps", "arbox");
    	  this.addUnitToSpace("fr_corps", "arbox");
    	  this.addUnitToSpace("fr_corps", "arbox");
    	  this.addUnitToSpace("fr_corps", "arbox");
    	  this.addUnitToSpace("fr_corps", "arbox");
    	  this.addUnitToSpace("fr_corps", "arbox");

    	  this.addUnitToSpace("br_corps", "arbox");
    	  this.addUnitToSpace("bef_corps", "arbox");

} catch(err) {console.log("error initing:" + JSON.stringify(err));}

          this.displayBoard();

          this.game.queue.splice(qe, 1);
	  return 1;
        }



	////////////////////////////
	// SHOW AND HIDE OVERLAYS //
	////////////////////////////
	if (mv[0] === "show_overlay") {

	  //
	  // hide any cardbox
	  //
	  this.cardbox.hide();

	  if (mv[1] === "zoom") {
	    let lz = mv[2];
	    this.zoom_overlay.render(lz);
          }
          this.game.queue.splice(qe, 1);
	  return 1;
	}

	if (mv[0] === "hide_overlay") {
	  if (mv[1] === "zoom") { this.theses_overlay.hide(); }
          this.game.queue.splice(qe, 1);
	  return 1;
	}


	if (mv[0] === "control") {

	  let faction = mv[1];
	  let spacekey = mv[2];

	  this.game.spaces[spacekey].control = faction;

          this.game.queue.splice(qe, 1);
	  return 1;

	}


	/////////////////////
	// modifying state //
	/////////////////////
  	if (mv[0] === "sr") {

          this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let source = mv[2];
          let destination = mv[3];
	  let unit_idx = parseInt(mv[4]);
	  let value = parseInt(mv[5]);
	  let card = mv[6];

	  let unit = this.game.spaces[source].units[unit_idx];
	  this.game.spaces[source].units.splice(unit_idx, 1);
	  this.game.spaces[destination].units.push(unit);

	  this.updateLog(unit.name + " redeploys to " + this.returnSpaceNameForLog(destination));

	  this.displaySpace(source);
	  this.displaySpace(destination);
	  this.displayReserveBoxes();

	  if (value > 0) {
	    if (this.game.player == this.returnPlayerOfFaction(faction)) {
	      this.playerPlayStrategicRedeployment(faction, card, value);
            } else {
	      this.updateStatus("Opponent Redeploying...");
	    }
	    return 0;
	  } else {
	    return 1;
	  }

	}



	if (mv[0] === "ws") {

	  let card = mv[1];
	  let faction = mv[2];
	  let ws = parseInt(mv[3]);

	  if (faction == "allies") {
            this.game.state.general_records_track.allies_war_status += ws;
            this.game.state.general_records_track.combined_war_status += ws;
          } else {
            this.game.state.general_records_track.central_war_status += ws;
            this.game.state.general_records_track.combined_war_status += ws;
          }

	  //
	  // Zimmerman Telegram Allowed 
	  //
	  if (this.game.state.general_records_track.combined_war_status >= 30 && this.game.state.us_commitment_track == 1) {
	    this.game.state.us_commitment_track = 2;
	    this.displayUSCommitmentTrack();
	  }

          this.displayGeneralRecordsTrack();

	  this.game.queue.splice(qe, 1);
	  return 1;

	}

  	if (mv[0] === "rp") {

	  let faction = mv[1];
	  let card = mv[2];

    	  let c = this.deck[card];

    	  for (let key in c.rp) {
            if (faction == "central") {
              if (!this.game.state.rp["central"][key]) { this.game.state.rp["central"][key] = 0; }
              this.game.state.rp["central"][key] += parseInt(c.rp[key]);
            }
            if (faction == "allies") {
              if (!this.game.state.rp["allies"][key]) { this.game.state.rp["allies"][key] = 0; }
              this.game.state.rp["allies"][key] += parseInt(c.rp[key]);
            }
          }
	  if (faction == "allies" && this.game.state.events.over_there) {
            if (!this.game.state.rp["allies"]["A"]) { this.game.state.rp["allies"]["A"] = 0; }
            this.game.state.rp["allies"]["A"] += 1;
	  }

	  this.updateLog(this.returnFactionName(faction) + " plays " + this.popup(card) + " for Replacement Points");
          this.game.queue.splice(qe, 1);
	  return 1;

	}

        if (mv[0] === "resolve") {

	  this.game.queue.splice(qe, 1);

	  let cmd = "";
	  if (mv[1]) { cmd = mv[1]; }
	  if (this.game.queue.length >= 1) {
	    if (this.game.queue[qe-1].split("\t")[0] === cmd) {
	      this.game.queue.splice(qe-1, 1);
	    }
	  }

	  return 1;

	}

        if (mv[0] === "card") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let card = mv[2];

	  let p = this.returnPlayerOfFaction(faction);

	  if (this.game.player === p) {
	    this.playerPlayCard(card, p, faction);
	  }

	  return 0;

	}

	if (mv[0] === "player_play_combat") {

	  //
	  // movement has happened, so we...
	  //
	  this.removeOverstackedUnits();

	  //
	  // we do not splice, because combat involves multiple
	  // returns to this, so we only want to clear this once
	  // it is not possible to execute any more combat.
	  //
	  let faction = mv[1];
	  let player = this.returnPlayerOfFaction(faction);

          let options = this.returnSpacesWithFilter(
            (key) => {
              if (this.game.spaces[key].activated_for_combat == 1) {
		for (let z = 0; z < this.game.spaces[key].units.length; z++) {
		  if (this.game.spaces[key].units[z].attacked == 0) { return 1; }
		}
	        return 0;
	      }
              return 0;
            }
          );
          if (options.length == 0) {
	    this.game.queue.splice(qe, 1);
	    return 1;
	  }

	  if (this.game.player == player) {
	    this.playerPlayCombat(faction);
	  } else {
	    this.updateStatus(this.returnFactionName(faction) + " executing combat");
	  }

	  return 0;

	}

	if (mv[0] === "combat") {

    	  //
    	  // deprecated -- remove "pass"
    	  //
    	  for (let z = 0; z < this.game.deck[0].hand.length; z++) {
    	    if (this.game.deck[0].hand[z] == "pass") { this.game.deck[0].hand.splice(z, 1); }
          }
    	  for (let z = 0; z < this.game.deck[1].hand.length; z++) {
    	    if (this.game.deck[1].hand[z] == "pass") { this.game.deck[1].hand.splice(z, 1); }
    	  }

	  let key = mv[1];
	  let selected = JSON.parse(mv[2]);

	  this.game.state.combat = {};
	  this.game.state.combat.key = key;
	  this.game.state.combat.attacker = selected;
	  this.game.state.combat.attacking_faction = this.returnPowerOfUnit(this.game.spaces[selected[0].unit_sourcekey].units[0]);
	  if (this.game.state.combat.attacking_faction == "central") { this.game.state.combat.defending_faction = "allies"; } else { this.game.state.combat.defending_faction = "central"; }
	  this.game.state.combat.attacker_drm = 0;
	  this.game.state.combat.defender_drm = 0;
	  this.game.state.combat.unoccupied_fort = 0;
	  if (this.game.spaces[key].units.length == 0 && this.game.spaces[key].fort > 0) { this.game.state.combat.unoccupied_fort = 1; }

	  //
	  // update log
	  //
	  this.updateLog(this.returnFactionName(this.game.state.combat.attacking_faction) + " attacks " + this.returnSpaceNameForLog(key));

	  //
	  // Great Retreat allows RU units to retreat
	  //
	  if (this.game.state.events.great_retreat == 1 && this.game.state.events.great_retreat_used != 1) {
	    for (let z = 0; z < this.game.spaces[this.game.state.combat.key].units.length; z++) {
	      let u = this.game.spaces[this.game.state.combat.key].units[z];
	      if (u.ckey == "RU") {
		this.game.queue.push("great_retreat\t"+key);
		this.game.state.events.great_retreat_used = 1;
		return 1;
	      }
	    }
	  }

	  //
	  // mandated offensive tracking
	  //
	  let au = this.returnAttackerUnits();
	  if (this.game.state.combat.attacking_faction == "central") {
	    if (this.game.state.mandated_offensives.allies === "AH IT") {

	      // 7.1.6 If the result is “AH (It)” and Italy is at war, an Austro- Hungarian 
	      // unit must attack either a space containing Italian units, a space in Italy, 
	      // or a space containing Allied units tracing supply through a space in Italy. 
	      // If Italy is neutral or its capital is controlled by the CP during the Mandated 
	      // Offensive Phase, move the Mandated Offensive marker to the AH box and treat 
	      // the result as if “AH” had been rolled.
	      //
	      let valid_target = false;
	      let sp = this.game.spaces[this.game.state.combat.key];
	      if (sp.country == "italy") { valid_target = true; } else {
		for (let z = 0; z < sp.units.length; z++) {
		  if (sp.units[z].ckey === "IT") {
		    valid_target = true;
		  }
		}
	      }

	      if (valid_target) {
	        this.game.state.mo["central"].push("AH");
	      }

	    } else {

	      // 7.1.5 To count as a Mandated Offensive, German units must attack an American, 
	      // British, Belgian, or French unit in France, Belgium or Germany. Treat GE 
	      // Mandated Offensives as “None” after the H-L Take Command event is in effect (as 
	      // noted on the CP Mandated Offensive Table). To count as a Mandated Offensive, a 
	      // Turkish unit must attack an Allied unit. The SN cannot satisfy the TU MO.
	      //
	      if (this.game.state.mandated_offensives.allies === "TU") {

	        let valid_target = false;
	        let sp = this.game.spaces[this.game.state.combat.key];
		for (let z = 0; z < sp.units.length; z++) {
		  if (sp.units[z].ckey != "SN") {
		    valid_target = true;
		  }
	        }
	        if (valid_target) {
	          this.game.state.mo["central"].push("TU");
	        }

	      } else {

	        if (this.game.state.mandated_offensives.allies === "GE") {

	          let valid_target = false;
	          let sp = this.game.spaces[this.game.state.combat.key];
		  for (let z = 0; z < sp.units.length; z++) {
		    if (sp.units[z].ckey == "US") { valid_target = true; }
		    if (sp.units[z].ckey == "BR") { valid_target = true; }
		    if (sp.units[z].ckey == "FR") { valid_target = true; }
		    if (sp.units[z].ckey == "BE") { valid_target = true; }
		  }
		  if (valid_target == true && sp.country != "france" && sp.country != "belgium" && sp.country != "germany") {
		    valid_target = false;
		  }

	          if (valid_target) {
	            this.game.state.mo["central"].push("GE");
	          }

		} else {
	          for (let i = 0; i < au.length; i++) {
	            this.game.state.mo["central"].push(au[i].ckey);
	          }
	        }

	      }

	    }
	  }
	  if (this.game.state.combat.attacking_faction == "allies") {
	    for (let i = 0; i < au.length; i++) {

	      //
	      // 1.4 To count as a Mandated Offensive, British or French units must attack 
	      // a German unit in France, Belgium or Germany. (AUS, CND, PT, or ANA do not 
	      // count as British for this purpose nor are they impacted by the Lloyd George 
	      // event.)
	      //
	      if (this.game.state.mandated_offensives.allies == "BR" || this.game.state.mandated_offensives.allies == "FR") {
		let sp = this.game.spaces[this.game.state.combat.key];
		if (sp.country == "belgium" || sp.country == "france" || sp.country == "germany") {
		  for (let z = 0; z < sp.units.length; z++) {
		    if (sp.units[z].ckey == "GE") {
	              this.game.state.mo["allies"].push(this.game.spaces[this.game.state.combat.key].units[i].ckey);
		      z = sp.units.length+1;
		    }
		  }
		}
	      } else {
	        this.game.state.mo["allies"].push(au[i].ckey);
	      }

	    }
	  }

	  //
	  // everything has cleared out, so attackers may advance 
	  //
	  if (this.game.state.events.great_retreat == 1 && this.game.state.events.great_retreat_used == 1) {
	    if (this.game.spaces[this.game.state.combat.key].units.length == 0) {
	      if (this.game.spaces[this.game.state.combat.key].fort == 0) {
	  	this.game.queue.splice(qe, 1);
	  	this.game.queue.push("great_retreat_advance\t"+key); // attackers advance 1
		return 1;
	      }
	    }
	  }

	  //
	  // withdrawal must mark-up withdrawal-eligible corps
	  //
	  for (let z = 0; z < this.game.spaces[this.game.state.combat.key].units.length; z++) {
	    let u = this.game.spaces[this.game.state.combat.key].units[z];
	    if (u.corps) { u.eligible_for_withdrawal_bonus = 1; }
	  }

	  //
	  // remove this from the queue
	  //
	  this.game.queue.splice(qe, 1);

	  let attacker_strength = 0;
	  let defender_strength = 0;

	  for (let i = 0; i < this.game.spaces[key].units.length; i++) {
	    defender_strength += this.game.spaces[key].units[i].combat;
	  }

	  for (let z = 0; z < this.game.state.combat.attacker.length; z++) {
	    let obj = this.game.state.combat.attacker[z];
	    attacker_strength += this.game.spaces[obj.unit_sourcekey].units[obj.unit_idx].combat;
	  }

	  this.game.state.combat.attacker_strength = attacker_strength;
	  this.game.state.combat.defender_strength = defender_strength;

	  //
	  // now show overlay and 
	  //
	  this.game.queue.push("combat_attacker_advance");
	  this.game.queue.push("combat_defender_retreat");
	  this.game.queue.push("combat_determine_outcome");
	  this.game.queue.push("combat_play_combat_cards");
	  this.game.queue.push("combat_evaluate_flank_attack");

//3. Play trench-negating Combat Cards
//4. Attempt Flank Attack
//5. Play Combat Cards
//6. Determine DRM
//7. Determine Fire Column
//8. Determine Results
//9. Take Losses
//10. Determine Combat Winner
//11. Defender Retreat
//12. Attacker Advance

	  //this.combat_overlay.render();
	  //this.combat_overlay.pullHudOverOverlay();

	  return 1;

	}

	if (mv[0] == "combat_play_combat_cards") {

	  // The Attacker may play any number of Combat Card Events whose 
	  // conditions are met by this Combat at the time of Step 5. In 
	  // addition, the Attacker may elect to use any Combat Card Events
	  // that are in front of him whose conditions are met by this Combat 
	  // and which have not been used in a previous Combat during this Action 
	  // Round. After the Attacker plays and selects all his Combat Cards, 
	  // the Defender has the opportunity to play and select Combat Cards 
	  // using the same procedure outlined for the Attacker.
	  // 
	  // Both players examine all played and selected Combat Event Cards to 
	  // determine the final DRM which will affect this Combat. There is also 
	  // a –3 DRM if all attacking units are in the Sinai space. (Attacks 
	  // from the Sinai space in conjunction with another space do not suffer 
	  // the –3 DRM). This step is conducted simultaneously.

	  this.game.queue.push("calculate_combat_card_modifications");
	  this.game.queue.push("defender_select_combat_cards");
	  this.game.queue.push("attacker_select_combat_cards");

	  this.game.state.cc_central_active = [];
	  this.game.state.cc_allies_active = [];

	  this.game.queue.splice(qe, 1);
	  return 1;

	}

	if (mv[0] == "calculate_combat_card_modifications") {

	  this.game.queue.splice(qe, 1);

	  let deck = this.returnDeck("all");

console.log("#############");
console.log("COMBAT CARDS:");
console.log("#############");
console.log(JSON.stringify(this.game.state.cc_central_active));
console.log(JSON.stringify(this.game.state.cc_allies_active));

	  //
	  // brusilov offensive
	  //
	  if (this.game.state.combat.attacker_power == "allies" && this.game.state.events.brusilov_offensive == 1) {
	    let attacker_units = this.returnAttackerUnits();
            for (let i = 0; i < attacker_units.length; i++) {
              if (attacker_units[i].ckey == "RU") { this.game.state.combat.attacker_drm += 1; i = attacker_units.length; }
            }
	  }

	  for (let i = 0; i < this.game.state.cc_central_active.length; i++) {
	    let card = this.game.state.cc_central_active[i];
	    if (this.game.state.combat.attacker_power == "central") { 
	      this.updateLog("Combat: Attackers play " + this.popup(card));
	      deck[card].onEvent(this, "attacker");
	    } else {
	      this.updateLog("Combat: Defenders play " + this.popup(card));
	      deck[card].onEvent(this, "defender");
	    }
	  }
	  for (let i = 0; i < this.game.state.cc_allies_active.length; i++) {
	    let card = this.game.state.cc_allies_active[i];
	    if (this.game.state.combat.attacker_power == "allies") { 
	      //
	      // kerensky_offensive
	      //
	      if (card === "ap45") {
  	        this.updateLog("Combat: Attackers play " + this.popup(card));
		this.game.state.combat.attacker_drm += 2;
		this.game.state.events.kerensky_offensive = 0;
	      } else {
  	        this.updateLog("Combat: Attackers play " + this.popup(card));
	        deck[card].onEvent(this, "attacker");
	      }
	    } else {
	      this.updateLog("Combat: Defenders play " + this.popup(card));
	      deck[card].onEvent(this, "defender");
	    }
	  }

	  return 1;
	
	}

	if (mv[0] == "defender_select_combat_cards") {

	  this.game.queue.splice(qe, 1);

	  if (this.game.player != this.returnPlayerOfFaction(this.game.state.combat.attacking_faction)) {
	    this.playerSelectDefenderCombatCards();
	  } else {
	    this.updateStatus("Defender Selecting Combat Cards...");
	  }

	  return 0;

	}


	if (mv[0] == "attacker_select_combat_cards") {

	  this.game.queue.splice(qe, 1);

	  if (this.game.player == this.returnPlayerOfFaction(this.game.state.combat.attacking_faction)) {
	    this.playerSelectAttackerCombatCards();
	  } else {
	    this.updateStatus("Attacker Selecting Combat Cards...");
	  }

	  return 0;

	}

	if (mv[0] == "combat_card") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let card = mv[2];

	  this.updateLog(this.returnFactionName(faction) + " plays " + this.popup(card));

	  if (faction == "central") {
	    if (!this.game.state.cc_central_active.includes(card)) { this.game.state.cc_central_active.push(card); }
	    if (!this.game.state.cc_central_on_table.includes(card)) { this.game.state.cc_central_on_table.push(card); }
	    if (!this.game.state.cc_central_played_this_round.includes(card)) { this.game.state.cc_central_played_this_round.push(card); }
	    for (let i = 0; i < this.game.deck[0].hand.length; i++) {
	      if (this.game.deck[0].hand[i] == card) { this.game.deck[0].hand.splice(i, 1); }
	    }
	  }
	  if (faction == "allies") {
	    if (!this.game.state.cc_allies_active.includes(card)) { this.game.state.cc_allies_active.push(card); }
	    if (!this.game.state.cc_allies_active.includes(card)) { this.game.state.cc_allies_on_table.push(card); }
	    if (!this.game.state.cc_allies_active.includes(card)) { this.game.queue.push("discard\t"+card); }
	    for (let i = 0; i < this.game.deck[1].hand.length; i++) {
	      if (this.game.deck[1].hand[i] == card) { this.game.deck[1].hand.splice(i, 1); }
	    }
	  }

	  return 1;
	}


	if (mv[0] == "combat_recalculate_loss_factor") {

	  let faction = mv[1]; // attacker / defender

	  let attacker_strength = 0;          
	  let defender_strength = 0;          

	  //
	  // the defender assigns hits first in this case, so any corps that are
	  // destroyed are not eligible to be restored in this case....
	  //
	  if (this.game.state.events.withdrawal && faction == "attacker") {
	    //
	    // the defender can now only restore corps that stil
            //
            for (let z = 0; z < this.game.spaces[this.game.state.combat.key].units.length; z++) {
              let u = this.game.spaces[this.game.state.combat.key].units[z];
              if (u.eligible_for_withdrawal_bonus == 1 && u.destroyed == 1) { u.eligible_for_withdrawal_bonus = 0; }
            }
	  }

          for (let z = 0; z < this.game.spaces[this.game.state.combat.key].units.length; z++) {
            let u = this.game.spaces[this.game.state.combat.key].units[z];
	    if (!u.damaged) {
              defender_strength += u.combat;
	    } else {
              defender_strength += u.rcombat;
	    }
          }

          for (let z = 0; z < this.game.state.combat.attacker.length; z++) {
	    let skey = this.game.state.combat.attacker[z].unit_sourcekey;
	    let sidx = this.game.state.combat.attacker[z].unit_idx;
            let u = this.game.spaces[skey].units[sidx];
	    if (u) {
	      if (!u.damaged) {
                attacker_strength += u.combat;
	      } else {
                attacker_strength += u.rcombat;
	      }
	    }
          }

          this.game.state.combat.attacker_strength = attacker_strength;
          this.game.state.combat.defender_strength = defender_strength;

	  if (faction == "attacker") {
            this.game.state.combat.attacker_loss_factor = this.returnAttackerLossFactor();
          }

	  if (faction == "defender") {
	    this.game.state.combat.defender_loss_factor = this.returnDefenderLossFactor();
	  }

          if (this.game.state.combat.attacker_loss_factor > this.game.state.combat.defender_loss_factor) {
            this.game.state.combat.winner = "defender";
          }
          if (this.game.state.combat.attacker_loss_factor < this.game.state.combat.defender_loss_factor) {
            this.game.state.combat.winner = "attacker";
          }

	  this.game.queue.splice(qe, 1);
	  return 1;

	}


	if (mv[0] == "combat_determine_outcome") {

	  //
	  // rolls are either handled synchronously or in sequence
	  //
	  let attacker_drm = this.game.state.combat.attacker_drm;
	  let defender_drm = this.game.state.combat.defender_drm;
	  let attacker_roll = 0;
	  let defender_roll = 0;
	  let attacker_modified_roll = 0;
	  let defender_modified_roll = 0;
	  let attacker_power = "allies";
	  let defender_power = "central";
	  let attacker_combat_power = 0;
	  let defender_combat_power = 0;

	  let attacker_table = "corps";
	  let defender_table = "corps";

	  //
	  // record which spaces have attacked where, to prevent double-attacks
	  //
	  let attacker_units = this.returnAttackerUnits();
	  for (let i = 0; i < attacker_units.length; i++) {
	    let spacekey = attacker_units[i].spacekey;
	    if (!this.game.state.attacks[spacekey]) {
	      this.game.state.attacks[spacekey] = [];
	    }
	    this.game.state.attacks[spacekey].push(this.game.state.combat.key);
	  }

	  //
	  // trenches and row shifts
	  //
	  let tshift = this.returnTerrainShift(this.game.state.combat.key);
	  let attacker_column_shift = tshift.attack;
	  let defender_column_shift = tshift.defense;

	  if (this.game.state.combat.unoccupied_fort == 1) {
	    attacker_table = "corps";
	    if (this.game.spaces[this.game.state.combat.key].control == "central") { attacker_power = "central"; defender_power = "allies"; } 
	  } else {
	    for (let i = 0; i < this.game.spaces[this.game.state.combat.key].units.length; i++) {
	      let unit = this.game.spaces[this.game.state.combat.key].units[i];
	      if (this.returnPowerOfUnit(unit) == "allies") { attacker_power = "central"; defender_power = "allies"; } 
	      if (this.game.state.events.yanks_and_tanks == 1 && unit.ckey == "US") { defender_drm += 2; }
	      if (unit.key.indexOf("army") > 0) { attacker_table = "army"; }
	    }
	  }

	  //
	  // sinai -3 DRM modifier
	  //
	  if (["portsaid","cairo","gaza","beersheba"].includes(this.game.state.combat.key)) {
	    let attacker_units = this.returnAttackerUnits();
	    let attacking_from_sinai = false;
	    for (let i = 0; i < attacker_units.length; i++) { if (attacker_units[i].spacekey == "sinai") { attacking_from_sinai = true; } }
	    for (let i = 0; i < attacker_units.length; i++) { if (attacker_units[i].spacekey != "sinai") { attacking_from_sinai = false; } }
	    if (attacking_from_sinai == true) {
	      if (attacker_power == "allies" && this.game.state.events.sinai_pipeline == 1) {} else {
		this.updateLog("Sinai -3 DRM modifier punishes attacker...");
	        this.game.state.combat.attacker_drm -= 3;
	        attacker_drm -= 3;
	      }
	    }
	  }

	  for (let i = 0; i < this.game.state.combat.attacker.length; i++) {
	    let unit = this.game.spaces[this.game.state.combat.attacker[i].unit_sourcekey].units[this.game.state.combat.attacker[i].unit_idx];
	    if (unit.key.indexOf("army") > 0) { defender_table = "army"; }	    
	    if (this.game.state.events.yanks_and_tanks == 1 && unit.ckey == "US") { attacker_drm += 2; }
	    unit.attacked = 1;
	  }

	  attacker_roll = this.rollDice();
	  defender_roll = this.rollDice();

	  attacker_modified_roll = attacker_roll + attacker_drm;
	  defender_modified_roll = defender_roll + defender_drm;

	  if (attacker_drm > 0) {
	    this.updateLog(`Attacker rolls: ${attacker_roll} [+${attacker_drm}]`);
	  } else {
	    this.updateLog(`Attacker rolls: ${attacker_roll}`);
	  }	  
	  if (defender_drm > 0) {
	    this.updateLog(`Defender rolls: ${defender_roll} [+${defender_drm}]`);
	  } else {
	    this.updateLog(`Defender rolls: ${defender_roll}`);
	  }	  

	  if (attacker_modified_roll > 6) { attacker_modified_roll = 6; }
	  if (defender_modified_roll > 6) { defender_modified_roll = 6; }
	  if (attacker_modified_roll < 1) { attacker_modified_roll = 1; }
	  if (defender_modified_roll < 1) { defender_modified_roll = 1; }

	  this.game.state.combat.attacker_table = attacker_table;
	  this.game.state.combat.defender_table = defender_table;
	  this.game.state.combat.attacker_power = attacker_power;
	  this.game.state.combat.defender_power = defender_power;
	  //this.game.state.combat.attacker_drm = attacker_drm;
	  //this.game.state.combat.defender_drm = defender_drm;
	  this.game.state.combat.attacker_roll = attacker_roll;
	  this.game.state.combat.defender_roll = defender_roll;
	  this.game.state.combat.attacker_column_shift = attacker_column_shift;
	  this.game.state.combat.defender_column_shift = defender_column_shift;
	  this.game.state.combat.attacker_modified_roll = attacker_modified_roll;
	  this.game.state.combat.defender_modified_roll = defender_modified_roll;
	  this.game.state.combat.attacker_loss_factor = this.returnAttackerLossFactor();
	  this.game.state.combat.defender_loss_factor = this.returnDefenderLossFactor();
	  this.game.state.combat.winner = "none";
	  if (this.game.state.combat.attacker_loss_factor > this.game.state.combat.defender_loss_factor) {
	    this.game.state.combat.winner = "defender";
	  }
	  if (this.game.state.combat.attacker_loss_factor < this.game.state.combat.defender_loss_factor) {
	    this.game.state.combat.winner = "attacker";
	  }

	  //
	  // Wireless Intercepts
	  //
	  if (this.game.state.events.wireless_intercepts == 1) { this.game.state.combat.flank_attack = "attacker"; }


	  if (this.game.state.combat.flank_attack == "attacker") {
	    this.game.queue.push(`combat_assign_hits\tattacker`);
	    this.game.queue.push(`combat_recalculate_loss_factor\tattacker`);
	    this.game.queue.push(`combat_assign_hits\tdefender`);
	  }
	  if (this.game.state.combat.flank_attack == "defender") {
	    this.game.queue.push(`combat_assign_hits\tdefender`);
	    this.game.queue.push(`combat_recalculate_loss_factor\tdefender`);
	    this.game.queue.push(`combat_assign_hits\tattacker`);
	  }
	  //
	  // defender applies losses first if not a flank attack
	  //
	  if (!this.game.state.combat.flank_attack) {
	    this.game.queue.push(`combat_assign_hits\tattacker`);
	    this.game.queue.push(`combat_assign_hits\tdefender`);
	  }

	  this.game.queue.splice(qe, 1);

	  return 1;

	}


	if (mv[0] === "combat_assign_hits") {

	  let power = mv[1];
	  let player = 1;
	  let loss_factor = 0;

	  if (this.game.state.combat.unoccupied_fort == 1) {

	    if (this.game.state.combat.defender_loss_factor > this.game.spaces[this.game.state.combat.key].fort) {
	      this.game.spaces[this.game.state.combat.key].fort = -1;
	      this.displaySpace(this.game.state.combat.key);
	    }

	    this.game.queue.splice(qe, 1);
	    return 1;

	  }

	  if (power == "attacker") { 
	    player = this.returnPlayerOfFaction(this.game.state.combat.attacker_power);
	    loss_factor = this.game.state.combat.attacker_loss_factor;
	  }
	  if (power == "defender") {
	    player = this.returnPlayerOfFaction(this.game.state.combat.defender_power);
	    loss_factor = this.game.state.combat.defender_loss_factor;
	  }

	  if (this.game.player === player) {
	    this.combat_overlay.hide();
	    this.loss_overlay.render(power);
	  } else {
	    this.combat_overlay.hide();
	    this.loss_overlay.render(power);
	    this.unbindBackButtonFunction();
	    this.updateStatus("Opponent Assigning Losses");
	  }

	  this.game.queue.splice(qe, 1);
	  return 0;

	}


	if (mv[0] === "combat_determine_winner") {

	  if (this.game.state.combat.attacker_loss_factor > this.game.state.combat.defender_loss_factor) {
	    // loser discards combat cards
	  }
	  if (this.game.state.combat.attacker_loss_factor > this.game.state.combat.defender_loss_factor) {
	    // loser discards combat cards
	  }
	  if (this.game.state.combat.attacker_loss_factor == this.game.state.combat.defender_loss_factor) {
	    // both players lose
	  }

	  this.game.queue.splice(qe, 1);

	  return 1;

	}


	if (mv[0] === "great_retreat_advance") {

	  let spacekey = mv[1];

          let player = this.returnPlayerOfFaction("central");
          if (this.game.player == player) {
	    this.playerPlayGreatAdvance(spacekey);
          } else {
	    this.updateStatus("Central Powers considering advance...");
          }

	  this.game.queue.splice(qe, 1);
	  return 0;

	}

	if (mv[0] === "great_retreat") {

	  let spacekey = mv[1];

          let player = this.returnPlayerOfFaction("allies");
          if (this.game.player == player) {
	    this.playerHandleGreatRetreat(spacekey);
          } else {
	    this.updateStatus("Russian evaluating retreat..."); 
          }

	  this.game.queue.splice(qe, 1);
	  return 0;

	}

	if (mv[0] === "combat_defender_retreat") {

	  this.game.queue.splice(qe, 1);

console.log("CDR 1");

	  let attacker_units = this.returnAttackerUnits();
	  let does_defender_retreat = false;
	  let can_defender_cancel = false;

	  //
	  // withdrawal might still need to restore a unit (flank attacks)
	  //
	  if (this.game.state.events.withdrawal == 1 && this.game.state.events.withdrawal_bonus_used == 0) {
	    let corps_restored = false;
	    for (let z = 0; z < this.game.spaces[this.game.state.combat.key].units.length; z++) {
	      let unit = this.game.spaces[this.game.state.combat.key].units[z];
	      if (unit.damaged && unit.eligible_for_withdrawal_bonus) {
		unit.damaged = 0;
		try { salert(unit.name + " restored with Withdrawal bonus..."); } catch (err) {}
                this.game.state.events.withdrawal_bonus_used = 1;
		corps_restored = true;
	      }
	    }
	    // 12.6.6 If no Corps step was lost, then one Army step loss may be negated.
	    if (corps_restored == false) {
	      for (let z = 0; z < this.game.spaces[this.game.state.combat.key].units.length; z++) {
	        let unit = this.game.spaces[this.game.state.combat.key].units[z];
		if (unit.damaged && unit.army) {
		  unit.damaged = 0;
		  try { salert(unit.name + " restored with Withdrawal bonus..."); } catch (err) {}
		  this.game.state.events.withdrawal_bonus_used = 1;
		}	
	      }
	    } 
	  }        

console.log("CDR 2");

	  //
	  // can we take another stepwise loss to cancel the retreat?
	  //
	  can_defender_cancel = this.canCancelRetreat(this.game.state.combat.key);;
	  if (this.game.spaces[this.game.state.combat.key].units.length == 1) {
	    if (this.game.spaces[this.game.state.combat.key].units[0].damaged == 1) {
	      if (this.game.spaces[this.game.state.combat.key].units[0].corps == 1) {
		can_defender_cancel = false;
	      }
	    }
	  }
	  // withdrawal prevents
	  if (this.game.state.withdrawal == 1) { this.game.state.combat.can_defender_cancel = false; }
	  this.game.state.combat.can_defender_cancel = can_defender_cancel;

console.log("CDR 3");

	  //
	  // no retreating from unoccupied fort
	  //
	  if (this.game.state.combat.unoccupied_fort == 1) { return 1; }

	  //
	  // hide loss overlay
	  //
	  // we do not want to do this entirely automated, so we will leave it open if
	  // we have not clicked
	  //
	  try { this.loss_overlay.showRetreatNotice(); } catch (err) {}

console.log("CDR 4");

	  //
	  // remove all destroyed defender units
	  //
	  for (let z = this.game.spaces[this.game.state.combat.key].units.length-1; z >= 0; z--) {
	    let u = this.game.spaces[this.game.state.combat.key].units[z];
	    if (u.destroyed == true) { this.game.spaces[this.game.state.combat.key].units.splice(z, 1); }
	  }
	  this.displaySpace(this.game.state.combat.key);

console.log("CDR 5 - " + JSON.stringify(this.game.spaces[this.game.state.combat.key]));

	  //
	  // no need to retreat if nothing is left
	  //
	  if (this.game.spaces[this.game.state.combat.key].units.length <= 0) { return 1; } 

console.log("CDR 6");

	  //
	  // no need to retreat if "they shall not pass"
	  //
	  if (this.game.state.events.they_shall_not_pass == 1) {
	    let space = this.game.spaces[this.game.state.combat.key];
	    	if (space.country == "france" && space.fort > 0) {
	      for (let z = space.units.length-1; z >= 0; z--) {
	        let u = space.units[z];
	        if (u.ckey == "FR" && this.game.state.combat.winner == "attacker") {
		  this.updateLog("They Shall Not Pass cancels French retreat...");
	          this.game.state.events.they_shall_not_pass = 0;
		  return 1;
		}
	      }
	    }
	  }

	  if (this.game.state.combat.winner == "defender") {
	    this.updateLog("Defender Wins, no retreat...");
	    return 1;
	  }

	  if (this.game.state.combat.winner == "none") {
	    this.updateLog("Mutual Loss, no retreat...");
	    return 1;
	  }

this.updateLog("Winner of the Combat: " + this.game.state.combat.winner);

	  for (let i = 0; i < attacker_units.length; i++) {
	    if (attacker_units[i]) {
	      if (attacker_units[i].type == "army" && attacker_units[i].damaged == false) {
	        does_defender_retreat = true;
	      }
	    }
	  }

	  if (does_defender_retreat) {
this.updateLog("Defender Power handling retreat: " + this.game.state.combat.defender_power); 
	    let player = this.returnPlayerOfFaction(this.game.state.combat.defender_power);
	    if (this.game.player == player) {
	      this.playerPlayPostCombatRetreat();
	    } else {
	      this.updateStatus("Opponent Retreating...");
	    }
	    return 0;
	  } else {
	    return 1;
	  }

	}

	if (mv[0] === "combat_attacker_advance") {

	  this.game.queue.splice(qe, 1);

	  //
	  // we can advance into destroyed forts
	  //
	  if (this.game.state.combat.unoccupied_fort == 1 && this.game.space[this.game.state.combat.key].fort == -1) {
	    let player = this.returnPlayerOfFaction(this.game.state.combat.attacker_power);
	    if (this.game.player == player) {
	      this.playerPlayAdvance();
	    } else {
	      this.updateStatus("Opponent deciding on advance...");
	    }
	    return 1;
	  }

	  if (this.game.state.combat.winner == "defender") {
	    //this.updateLog("Defender Wins, no advance...");
	    return 1;
	  }

	  if (this.game.state.combat.winner == "none") {
	    //this.updateLog("Mutual Loss, no advance...");
	    return 1;
	  }

	  //
	  // retreat was cancelled for some reason...
	  //
	  if (this.game.spaces[this.game.state.combat.key].units.length > 0) { 
	    this.updateLog("Attacker unable to advance...");
	    return 1;
	  }

	  let player = this.returnPlayerOfFaction(this.game.state.combat.attacker_power);

	  if (this.game.player == player) {
	    this.playerPlayAdvance();
	  } else {
	    this.updateStatus("Opponent deciding on advance...");
	  }

	  return 0;
	}


	if (mv[0] == "combat_evaluate_flank_attack") {

	  this.game.queue.splice(qe, 1);

	  //
	  // Von Hutier 
	  //
	  if (this.game.state.events.von_hutier == 1) {
	    this.game.state.combat.flank_attack = "attacker";
	    return 1;
	  }


	  if (this.canFlankAttack()) {
	    if (this.game.player == this.returnPlayerOfFaction(this.game.state.combat.attacking_faction)) {
	      this.playerPlayFlankAttack();
	    } else {
	      this.updateStatus("Opponent considering Flank Attack");
	    }
	    return 0;
          }

	  return 1;

	}


	if (mv[0] === "post_combat_cleanup") {

	  this.game.queue.splice(qe, 1);

	  //
	  // disable combat events that should disappear
	  //
	  this.game.state.events.von_hutier = 0;

	  if (!this.game.state.combat) { return 1; }

	  let spacekey = this.game.state.combat.key;
	  if (!spacekey) { return 1; }

	  for (let i = this.game.spaces[spacekey].units.length-1; i >= 0; i--) {
	    let u = this.game.spaces[spacekey].units[i];
	    if (u.destroyed == true) {
	      this.game.spaces[spacekey].units.splice(i, 1);
	    }
	  }

	  this.displaySpace(spacekey);

	  for (let key in this.game.spaces) {
	    let space = this.game.spaces[key];
	    if (space.activated_for_combat || space.activated_for_movement) {
	      for (let z = space.units.length-1; z >= 0 ; z--) {
	        let u = space.units[z];
		if (u.destroyed) { space.units.splice(z, 1); }
	      }
	    }
	    this.displaySpace(key);
	  }

	  //
	  // remove combat cards from loser
	  //
	  let cards = this.returnDeck();
	  if (this.game.state.combat.winner == "central") {
	    for (let i = this.game.state.cc_allies_active.length-1; i >= 0; i--) {
	      let c = this.game.state.cc_allies_active[i];
	      for (let z = 0; z < this.game.state.cc_allies_on_table.length; z++) {
		if (this.game.state.cc_allies_on_table[i] == c) {
		  this.game.state.cc_allies_on_table.splice(i, 1);
		}
	      }
	      if (cards[c].removeFromDeckAfterPlay(this, "allies")) {
	      } else {
		this.game.deck[1].discards.push(c);
	      }
	    }
	  }
	  if (this.game.state.combat.winner == "allies") {
	    for (let i = this.game.state.cc_central_active.length-1; i >= 0; i--) {
	      let c = this.game.state.cc_central_active[i];
	      for (let z = 0; z < this.game.state.cc_allies_on_table.length; z++) {
		if (this.game.state.cc_allies_on_table[i] == c) {
		  this.game.state.cc_allies_on_table.splice(i, 1);
		}
	      }
	      if (cards[c].removeFromDeckAfterPlay(this, "central")) {
		
	      } else {
		this.game.deck[0].discards.push(c);
	      }
	    }
	  }

	  return 1;

	}

	// eliminates unit from game
	if (mv[0] === "eliminate") {

	  let spacekey = mv[1];
	  let idx = parseInt(mv[2]);

	  let unit = this.game.spaces[spacekey].units[idx];
	  let faction = this.returnPowerOfUnit(unit);
	  this.updateLog(unit.name + " eliminated in " + this.returnSpaceNameForLog(spacekey));

	  if (faction == "allies") {
   	    this.game.state.eliminated["allies"].push(unit);
	  } else {
   	    this.game.state.eliminated["central"].push(unit);
	  }

	  this.game.spaces[spacekey].units.splice(idx, 1);	
	  this.displaySpace(spacekey);

	  this.game.queue.splice(qe, 1);
	  return 1;

        }

	if (mv[0] === "repair") {

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let unit_idx = parseInt(mv[3]);
	  let player_to_ignore = 0;
	  if (mv[4]) { player_to_ignore = parseInt(mv[4]); }

	  if (this.game.player != player_to_ignore) {
	    if (this.game.spaces[spacekey].units[unit_idx].destroyed) {
	      this.game.spaces[spacekey].units[unit_idx].destroyed = 0;
	      this.game.spaces[spacekey].units[unit_idx].damaged = 1;
	    } else {
	      this.game.spaces[spacekey].units[unit_idx].destroyed = 0;
	      this.game.spaces[spacekey].units[unit_idx].damaged = 0;
	    }
	  }

	  this.displaySpace(spacekey);
          this.shakeSpacekey(spacekey);
	  this.game.queue.splice(qe, 1);
	  return 1;

	}

	if (mv[0] === "damage") {

	  this.game.queue.splice(qe, 1);

	  let spacekey = mv[1];
	  let key = mv[2];
	  let damaged = parseInt(mv[3]);
	  let player_to_ignore = 0;
	  if (mv[4]) { player_to_ignore = parseInt(mv[4]); }

	  let is_last_unit = 0;
	  let tmpx = this.game.queue[this.game.queue.length-1].split("\t");
	  if (tmpx[0] !== "damage" && tmpx[0] !== "add") { is_last_unit = 1; }

	  if (player_to_ignore != this.game.player) {
	    let unit = null;
	    let unit_idx = 0;
	    for (let z = 0; z < this.game.spaces[spacekey].units.length; z++) {
	      if (!this.game.spaces[spacekey].units[z].destroyed) {
	        if (damaged == 1) {
	          if (this.game.spaces[spacekey].units[z].damaged == true && key === this.game.spaces[spacekey].units[z].key) {
		    unit = this.game.spaces[spacekey].units[z];
		    unit_idx = z;
	          }
	        } else {
	          if (this.game.spaces[spacekey].units[z].damaged == false && key === this.game.spaces[spacekey].units[z].key) {
		    unit = this.game.spaces[spacekey].units[z];
		    unit_idx = z;
	          }
	        }
	      }
	    }
	    if (unit) {
	      if (unit.damaged == false) {
		unit.damaged = true;
	      } else { 
		unit.destroyed = true;
	      }
	    }
	  }

	  if (is_last_unit) {
            for (let z = this.game.spaces[spacekey].units.length-1; z >= 0; z--) {
              let u = this.game.spaces[spacekey].units[z];
	      let f = this.returnPowerOfUnit(u);
              if (u.destroyed == true) {
		if (f === "central") {
	          this.moveUnit(spacekey, z, "ceubox");
		  this.displaySpace("ceubox");
		} else {
	          this.moveUnit(spacekey, z, "aeubox");
		  this.displaySpace("aeubox");
		}
	      }
            } 
	  }
            
	  this.displaySpace("ceubox");
	  this.displaySpace("aeubox");
	  this.displaySpace(spacekey);
          this.shakeSpacekey(spacekey);

	  return 1;

	}


	if (mv[0] === "remove") {

	  let spacekey = mv[1];
	  let unitkey = mv[2];
	  let player_to_ignore = 0;
	  if (mv[3]) { player_to_ignore = parseInt(mv[3]); }

	  if (player_to_ignore != this.game.player) {
	    for (let z = 0; z < this.game.spaces[spacekey].units.length; z++) {
	      if (this.game.spaces[spacekey].units[z].key === unitkey) {
		this.game.spaces[spacekey].units.splice(z, 1);
		z = this.game.spaces[spacekey].units.length + 2;

		//
		// if removing attacker, update unit_idx of whatever else is there
		//
		if (this.game.state.combat.attacker) {
		  for (let zz = 0; zz < this.game.state.combat.attacker.length; zz++) {
		    if (this.game.state.combat.attacker[zz].unit_sourcekey == spacekey) {
		      if (z < this.game.state.combat.attacker[zz].unit_idx) {
			this.game.state.combat.attacker[zz].unit_idx--;
		      }
		    }
		  }
		}

	      }
	    }
	  }

	  this.displaySpace(spacekey);
	  this.shakeSpacekey(spacekey);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}

	if (mv[0] === "add") {

	  let spacekey = mv[1];
	  let unitkey = mv[2];
	  let player_to_ignore = 0;
	  if (mv[3]) { player_to_ignore = parseInt(mv[3]); }

	  if (player_to_ignore != this.game.player) {
	    let unit = this.cloneUnit(unitkey);
	    unit.spacekey = spacekey;
	    this.game.spaces[spacekey].units.push(this.cloneUnit(unitkey));
	  }

	  //
	  // if this is a corps and it is in a spacekey under combat, update
	  //
          if (unitkey.indexOf("corps") > -1) {
	    if (this.game.state.combat.attacker) {
	      for (let z = 0; z < this.game.state.combat.attacker.length; z++) {
  	        if (this.game.state.combat.attacker[z].unit_sourcekey == spacekey) {
	          this.game.state.combat.attacker.push({ key : this.game.state.combat.key , unit_sourcekey : spacekey , unit_idx : this.game.spaces[spacekey].units.length-1 });
		  z = this.game.state.combat.attacker.length + 2;
console.log("ADDACKERS NOW: " + JSON.stringify(this.game.state.combat.attacker));
	        }
	      }
	    }
	  }


	  this.displaySpace(spacekey);
	  this.shakeSpacekey(spacekey);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}



	if (mv[0] == "flank_attack_attempt") {

	  let action = mv[1];
	  let eligible_spaces = JSON.parse(mv[2]);

	  let drm_modifiers = 0;
          //
          // +1 for every unit without another army adjacent to it
          //
          let flanking_spaces = [];

          for (let i = 0; i < eligible_spaces.length; i++) {
            if (i != action) {
              if (!flanking_spaces.includes(eligible_spaces[i])) {
                flanking_spaces.push(eligible_spaces[i]);
                if (this.canSpaceFlank(eligible_spaces[i])) {
                  drm_modifiers++;
                }
              }
            }
          }

	  let roll = this.rollDice(6);
	  this.updateLog("roll: " + roll + " (+"+drm_modifiers+")"); 

	  if ((roll+drm_modifiers) > 3) {
	    try { salert("Flank Attack Succeeds!"); } catch (err) {}
	    this.game.state.combat.flank_attack = "attacker"; 
	  } else {
	    try { salert("Flank Attack Fails!"); } catch (err) {}
	    this.game.state.combat.flank_attack = "defender"; 
	  }

	  this.game.queue.splice(qe, 1);

	  return 1;

        }


	
	if (mv[0] === "player_play_movement") {

	  this.game.queue.splice(qe, 1);
	  let faction = mv[1];

    	  let options = this.returnSpacesWithFilter(
    	    (key) => {
    	      if (this.game.spaces[key].activated_for_movement == 1) { return 1; }
      	      return 0;
      	    }
    	  );

	  if (options.length == 0) { return 1; }

	  let player = this.returnPlayerOfFaction(faction);
	  if (this.game.player == player) {
	    this.playerPlayMovement(faction);
	  } else {
	    this.updateStatus(this.returnFactionName(faction) + " executing movement");
	  }

	  return 0;

	}


	if (mv[0] === "player_play_ops") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let card = mv[2];
	  let cost = parseInt(mv[3]);
	  let skipend = 0;
	  if (mv[4]) { skipend = parseInt(mv[4]); }
	  let player = this.returnPlayerOfFaction(faction);

	  if (this.game.player == player) {
	    this.playerPlayOps(faction, card, cost, skipend);    
	  } else {
	    this.updateStatus(this.returnFactionName(faction) + " playing OPS");
	  }

	  return 0;

	}


        if (mv[0] === "activate_for_combat") {

	  let faction = mv[1];
	  let key = mv[2];

	  for (let i = 0; i < this.game.spaces[key].units.length; i++) {
	    this.game.spaces[key].units[i].spacekey = key;
	  }
	  this.activateSpaceForCombat(key);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}



        if (mv[0] === "activate_for_movement") {

	  let faction = mv[1];
	  let key = mv[2];

	  for (let i = 0; i < this.game.spaces[key].units.length; i++) {
	    this.game.spaces[key].units[i].spacekey = key;
	  }
	  this.activateSpaceForMovement(key);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}



	if (mv[0] === "mef_placement") {

	  let spacekey = mv[1];

	  this.game.state.events.mef = 1;	
	  this.game.state.events.mef_beachhead = spacekey;
	  this.game.spaces[spacekey].control = "allies";
	  this.game.spaces[spacekey].port = 1; // new allied port
          this.addUnitToSpace("mef_army", spacekey);
	  this.displaySpace(spacekey);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}



	if (mv[0] === "entrench") {

	  let faction = mv[1];
	  let key = mv[2];
	  let idx = null;

	  if (mv[3]) { idx = parseInt(mv[3]); }
	  let loss_factor = 0;
	  if (mv[4]) { loss_factor = parseInt(mv[4]) };

	  //
	  // exists if a unit is doing it
	  //
	  if (idx) {
	    if (loss_factor) {
	      this.game.state.entrenchments.push({ spacekey : key , loss_factor : loss_factor});
	    }
	    this.game.spaces[key].units[idx].moved = 1;
	  } else {
	    if (!this.game.spaces[key].trench) { this.game.spaces[key].trench = 0; }
	    if (this.game.spaces[key].trench == 0) { 
	      this.updateLog(this.returnName(faction) + " entrenches in " + this.returnSpaceNameForLog(key));
	    } else {
	      this.updateLog(this.returnName(faction) + " entrenches deeper in " + this.returnSpaceNameForLog(key));
	    }
	    this.game.spaces[key].trench++;
	    if (this.game.spaces[key].trench > 2) { this.game.spaces[key].trench = 2; }
	  }

	  this.displaySpace(key);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}

	if (mv[0] === "dig_trenches") {

	  if (this.game.state.entrenchments) {
	    for (let i = 0; i < this.game.state.entrenchments.length; i++) {
	      let e = this.game.state.entrenchments[i];
	      let roll = this.rollDice(6);
	      if (this.game.state.entrenchments[i].loss_factor >= roll) {
	        this.updateLog("Trench Success: " + this.game.spaces[e.spacekey].name + " ("+roll+")");
	        this.addTrench(e.spacekey);
	      } else {
	        this.updateLog("Trench Failure: " + this.game.spaces[e.spacekey].name + " ("+roll+")");
	      }
	    }
	  }

	  this.game.queue.splice(qe, 1);
	  return 1;

	}


	if (mv[0] === "retreat") {

	  let faction = mv[1];
	  let sourcekey = mv[2];
	  let sourceidx = parseInt(mv[3]);
	  let destinationkey = mv[4];
	  let player_to_ignore = 0;
	  if (mv[5]) { player_to_ignore = parseInt(mv[5]); }

	  this.game.queue.splice(qe, 1);
	  if (mv[5]) {
	     this.game.queue.push("move\t"+mv[1]+"\t"+mv[2]+"\t"+mv[3]+"\t"+mv[4]+"\t"+mv[5]);
	  } else {
	     this.game.queue.push("move\t"+mv[1]+"\t"+mv[2]+"\t"+mv[3]+"\t"+mv[4]);
	  }

	  this.game.state.combat.retreat_sourcekey = mv[2];
	  this.game.state.combat.retreat_destinationkey = mv[4];

	  return 1;

	}


	if (mv[0] === "selective_acknowledgement") {

	  let player = parseInt(mv[1]);

	  if (this.game.player == player) {
	    this.game.queue.push("ACKNOWLEDGE\tClick to Continue");
	  }

	  return 1;

	}


	if (mv[0] === "move") {

	  let faction = mv[1];
	  let sourcekey = mv[2];
	  let sourceidx = parseInt(mv[3]);
	  let destinationkey = mv[4];
	  let player_to_ignore = 0;
	  if (mv[5]) { player_to_ignore = parseInt(mv[5]); }

	  if (this.game.player != player_to_ignore) {
	    this.moveUnit(sourcekey, sourceidx, destinationkey);
	  }

	  let deactivate_for_movement = true;
          for (let z = 0; z < this.game.spaces[sourcekey].units.length; z++) {
            if (this.game.spaces[sourcekey].units[z].moved == 0) {
	      deactivate_for_movement = false;
	    }
          }
	  if (deactivate_for_movement) {
            this.game.spaces[sourcekey].activated_for_movement = 0;
	    this.displaySpace(sourcekey);
	  }

	  //
	  // the game logic should prevent units from moving in unless they have
	  // enough strength to besiege a fort, so if this is a fort we want to
	  // toggle the besieged variable if needed.
	  //
	  // note that this does not apply to units moving into a space they control...
	  //
	  if (this.game.spaces[destinationkey].units.length > 0) {

	    if (this.returnPowerOfUnit(this.game.spaces[destinationkey].units[0]) != this.game.spaces[destinationkey].control) {
	      if (this.game.spaces[destinationkey].fort > 0) {
	        this.game.spaces[destinationkey].besieged = 1;
	      } else {
	        //
	        // switch control
	        //
	        this.game.spaces[destinationkey].control = this.returnPowerOfUnit(this.game.spaces[destinationkey].units[0]);

	        //
	        // degrade trenches
	        //
	        if (this.game.spaces[destinationkey].trench > 0) { this.game.spaces[destinationkey].trench--; }
	      }
	    }
	  }

	  //
	  // check if no longer besieged?
	  //
	  if (this.game.spaces[sourcekey].besieged == 1) {
	    if (this.game.spaces[sourcekey].units.length > 0) {
	      if (this.returnPowerOfUnit(this.game.spaces[sourcekey].units[0]) != this.game.spaces[destinationkey].control) {
	        this.game.spaces[sourcekey].besieged = 0;
	      }
	    } else {
	      this.game.spaces[sourcekey].besieged = 0;
	      if (this.game.spaces[sourcekey].fort > 0) {
		//
		// control switches back to original owner of fort
		//
		let spc = this.returnSpaces();
		this.game.spaces[sourcekey].control = spc[sourcekey].control;
	      }
	    }
	  }

	  this.game.queue.splice(qe, 1);


	  //
	  // shake the space
	  //
	  this.displaySpace(destinationkey);
	  this.shakeSpacekey(destinationkey);

	  return 1;
	}
	


        if (mv[0] === "ops") {

	  let faction = mv[1];
	  let card = mv[2];
	  let opsnum = parseInt(mv[3]);

	  this.game.queue.splice(qe, 1);

	  return 1;

	}

	if (mv[0] === "counter_or_acknowledge") {

	  this.game.queue.splice(qe, 1);

	  return 1;

	}


	//
	// objects and cards can add commands
	//
        for (let i in z) {
          if (!z[i].handleGameLoop(this, qe, mv)) { return 0; }
        }


        //
        // avoid infinite loops
        //
        if (shd_continue == 0) {
          console.log("NOT CONTINUING");
          return 0;
        }

    } // if cards in queue

    return 1;

  }



  returnPlayers(num = 0) {
    var players = [];
    return players;
  }

  returnPlayerHand() {
    return this.game.deck[this.game.player-1].hand;
  }

  returnFactionName(faction="") { return this.returnPlayerName(faction); }

  returnPlayerName(faction="") {
    if (faction == "central") { return "Central Powers"; }
    return "Allies";
  }

  returnPowerOfPlayer() { return this.returnFactionOfPlayer(); }
  returnFactionOfPlayer() {
    if (this.game.player == 1) { return "central"; }
    return "allies";
  }

  returnPlayerOfFaction(faction="") {
    if (faction == "central") { return 1; }
    return 2;
  }

  playerSelectAttackerCombatCards() {

    let num = 0;
    let ccs = [];
    let cards = this.returnDeck();
    let faction = this.returnFactionOfPlayer(this.game.player);
    let name = this.returnPlayerName(faction);

    //
    // cards can come from our hand, or the list which is active (on_table) and
    // eligible for use. when a card is selected for a battle, it is moved into
    // the "active" storage section, which makes it eligible for loss if the 
    // player loses the battle...
    //
    if (faction == "central") {
      for (let i = 0; i < this.game.deck[0].hand.length; i++) {
	if (cards[this.game.deck[0].hand[i]].cc) { 
	  if (!this.game.state.cc_central_active.includes(this.game.deck[0].hand[i])) {
	    if (cards[this.game.deck[0].hand[i]].canEvent(this, "attacker")) {
	      ccs.push(this.game.deck[0].hand[i]);
	    }
	  }
	}
      }
      for (let i = 0; i < this.game.state.cc_central_on_table.length; i++) {
	let c = this.game.state.cc_central_on_table[i];
	if (!this.game.state.cc_central_on_table.includes(c)) {
	  ccs.push(c);
        }
      }
    }
    if (faction == "allies") {
      for (let i = 0; i < this.game.deck[1].hand.length; i++) {
	if (cards[this.game.deck[1].hand[i]].cc) { 
	  if (!this.game.state.cc_allies_on_table.includes(this.game.deck[1].hand[i])) {
	    ccs.push(this.game.deck[1].hand[i]);
	  }
	}
      }
      for (let i = 0; i < this.game.state.cc_allies_on_table.length; i++) {
	let c = this.game.state.cc_allies_active[i];
	if (!this.game.state.cc_allies_on_table.includes(c)) {
	  ccs.push(c);
        }
      }
    }

    //
    // these two cards are combat cards, but they are played prior to the 
    // flank attempt stage, so they cannot be selected at this stage of the 
    // combat card selection. So we will remove them from our list of eligible
    // combat cards...
    //
    if (ccs.includes("cp44")) {
      for (let i = 0; i < ccs.length; i++) {
	if (ccs[i] == "cp44") { ccs.splice(i, 1); }
      }
    }
    if (ccs.includes("cp02")) {
      for (let i = 0; i < ccs.length; i++) {
	if (ccs[i] == "cp02") { ccs.splice(i, 1); }
      }
    }

    //
    // some cards can only be used once per turn, so check to see if they have
    // already been played and remove them from our list of playable cards if
    // they have already been played this turn...
    //
    // Mine Attack, Royal Tank Corps, Kemal...
    //
    if (ccs.includes("ap36") && this.game.state.cc_allies_played_this_round.includes("ap36")) {
      for (let i = 0; i < ccs.length; i++) {
	if (ccs[i] == "ap36") { ccs.splice(i, 1); }
      }
    }
    if (ccs.includes("ap48") && this.game.state.cc_allies_played_this_round.includes("ap48")) {
      for (let i = 0; i < ccs.length; i++) {
	if (ccs[i] == "ap48") { ccs.splice(i, 1); }
      }
    }
    if (ccs.includes("cp31") && this.game.state.cc_central_played_this_round.includes("cp31")) {
      for (let i = 0; i < ccs.length; i++) {
	if (ccs[i] == "cp31") { ccs.splice(i, 1); }
      }
    }

    //
    // we only want to show the players the cards that they are 
    // capable of eventing...
    //
    for (let z = 0; z < ccs.length; z++) {
      if (cards[ccs[z]].canEvent(this, "attacker")) {
	num++;
      }
    }

    //
    // some cards create pseudo-bonuses, in which case we add them as fake
    // combat cards...
    //

    //
    // Kerensky Offensive +2 bonus / one
    //
    if (faction == "allies" && this.game.state.events.kerensky_offensive == 1) {
      if (!ccs.includes("ap45")) { ccs.push("ap45"); }
    }

    //
    // Brusilov Offensive (ignore trench effects)
    //
    if (faction == "allies" && this.game.state.events.brusilov_offensive == 1) {
      if (!ccs.includes("ap46")) { ccs.push("ap46"); }
    }

    if (num == 0) {
      this.endTurn();
      return 0;
    }

    ccs.push("pass");
   
    this.updateStatusAndListCards(`${name} - play combat card?`, ccs);
    this.attachCardboxEvents((card) => {

      if (cards[card]) {
        if (!cards[card].canEvent(this, "attacker")) {
	  let c = confirm("Do you wish to play this combat card, even though it will have no effect on the current battle?");
	  if (!c) { return; }
        }
      }

      this.unbindBackButtonFunction();
      this.updateStatus("submitting...");

      if (card == "pass") {
	this.endTurn();
	return 1;
      }

      if (ccs.length > 2) { // > 1+PASS
        this.addMove("attacker_select_combat_cards");
        this.addMove("combat_card\t"+faction+"\t"+card);
	this.endTurn();
      } else {
        this.addMove("combat_card\t"+faction+"\t"+card);
	this.endTurn();
      }

    }); 
  }

  playerSelectDefenderCombatCards() {

    let num = 0;
    let ccs = [];
    let cards = this.returnDeck("all");
    let faction = this.returnFactionOfPlayer(this.game.player);
    let name = this.returnPlayerName(faction);

    //
    // cards can come from our hand, or the list which is active (on_table) and
    // eligible for use. when a card is selected for a battle, it is moved into
    // the "active" storage section, which makes it eligible for loss if the 
    // player loses the battle...
    //
    if (faction == "central") {
      for (let i = 0; i < this.game.deck[0].hand.length; i++) {
	if (cards[this.game.deck[0].hand[i]].cc) { 
	  if (!this.game.state.cc_central_active.includes(this.game.deck[0].hand[i])) {
	    if (cards[this.game.deck[0].hand[i]].canEvent(this, "attacker")) {
	      ccs.push(this.game.deck[0].hand[i]);
	    }
	  }
	}
      }
      for (let i = 0; i < this.game.state.cc_central_on_table.length; i++) {
	let c = this.game.state.cc_central_on_table[i];
	if (!this.game.state.cc_central_on_table.includes(c)) {
	  ccs.push(c);
        }
      }
    }
    if (faction == "allies") {
      for (let i = 0; i < this.game.deck[1].hand.length; i++) {
	if (cards[this.game.deck[1].hand[i]].cc) { 
	  if (!this.game.state.cc_allies_on_table.includes(this.game.deck[1].hand[i])) {
	    ccs.push(this.game.deck[1].hand[i]);
	  }
	}
      }
      for (let i = 0; i < this.game.state.cc_allies_on_table.length; i++) {
	let c = this.game.state.cc_allies_active[i];
	if (!this.game.state.cc_allies_on_table.includes(c)) {
	  ccs.push(c);
        }
      }
    }

    //
    // these two cards are combat cards, but they are played prior to the 
    // flank attempt stage, so they cannot be selected at this stage of the 
    // combat card selection. So we will remove them from our list of eligible
    // combat cards...
    //
    if (ccs.includes("cp44")) {
      for (let i = 0; i < ccs.length; i++) {
	if (ccs[i] == "cp44") { ccs.splice(i, 1); }
      }
    }
    if (ccs.includes("cp02")) {
      for (let i = 0; i < ccs.length; i++) {
	if (ccs[i] == "cp02") { ccs.splice(i, 1); }
      }
    }

    //
    // some cards can only be used once per turn, so check to see if they have
    // already been played and remove them from our list of playable cards if
    // they have already been played this turn...
    //
    // Mine Attack, Royal Tank Corps, Kemal...
    //
    if (ccs.includes("ap36") && this.game.state.cc_allies_played_this_round.includes("ap36")) {
      for (let i = 0; i < ccs.length; i++) {
	if (ccs[i] == "ap36") { ccs.splice(i, 1); }
      }
    }
    if (ccs.includes("ap48") && this.game.state.cc_allies_played_this_round.includes("ap48")) {
      for (let i = 0; i < ccs.length; i++) {
	if (ccs[i] == "ap48") { ccs.splice(i, 1); }
      }
    }
    if (ccs.includes("cp31") && this.game.state.cc_central_played_this_round.includes("cp31")) {
      for (let i = 0; i < ccs.length; i++) {
	if (ccs[i] == "cp31") { ccs.splice(i, 1); }
      }
    }

    //
    // we only want to show the players the cards that they are 
    // capable of eventing...
    //
    for (let z = 0; z < ccs.length; z++) {
      if (cards[ccs[z]].canEvent(this, "defender")) {
	num++;
      }
    }

    //
    // some cards create pseudo-bonuses, in which case we add them as fake
    // combat cards...
    //

    //
    // Kerensky Offensive +2 bonus / one
    //
    if (faction == "allies" && this.game.state.events.kerensky_offensive == 1) {
      if (!ccs.includes("ap45")) { ccs.push("ap45"); }
    }

console.log("#");
console.log("#");
console.log("#");
console.log("cc: " + num);

    if (num == 0) {
      this.endTurn();
      return 0;
    }

    ccs.push("pass");
   
    this.updateStatusAndListCards(`${name} - play combat card?`, ccs);
    this.attachCardboxEvents((card) => {

      if (cards[card]) {
        if (!cards[card].canEvent(this, "defender")) {
	  let c = confirm("Do you wish to play this combat card, even though it will have no effect on the current battle?");
	  if (!c) { return; }
        }
      }

      this.unbindBackButtonFunction();
      this.updateStatus("submitting...");

      if (card == "pass") {
	this.endTurn();
	return 1;
      }

      if (ccs.length > 2) { // > 1+PASS
        this.addMove("defender_select_combat_cards");
        this.addMove("combat_card\t"+faction+"\t"+card);
	this.endTurn();
      } else {
        this.addMove("combat_card\t"+faction+"\t"+card);
	this.endTurn();
      }

    }); 
  }


  playerAddReinforcements(faction="", units=[], country="", options=[]) {

    let paths_self = this;
    let just_stop = 0;
    let unit = null;

    //
    // corps go into reserve boxes
    // armies into capital or supply sources
    // if options specified, respect
    //
    let continue_fnct = () => {
      if (just_stop == 1) { paths_self.endTurn(); return 0; }
      if (units.length == 0) { paths_self.endTurn(); return 0; }
      return 1;
    }

    let execute_fnct = (spacekey) => {
      paths_self.updateStatus("deploying...");
      paths_self.removeSelectable();
      paths_self.addUnitToSpace(unit.key, spacekey);
      paths_self.addMove(`add\t${spacekey}\t${unit.key}\t${paths_self.game.player}`);    
      paths_self.displaySpace(spacekey);
      loop_fnct();
    };

    let loop_fnct = () => {
      if (continue_fnct()) {

	unit = paths_self.game.units[units[units.length-1]];
	units.splice(units.length-1, 1);
	let choices = [];

console.log("#");
console.log("#");
console.log("#");
console.log("#");
console.log("#");
console.log("#");
console.log("UNIT: " + JSON.stringify(unit));

	
	//
	// CORPS
	//
	if (unit.corps) {

	  if (faction == "allies") { choices.push("arbox"); } 
	  if (faction == "central") { choices.push("crbox"); } 

	  //
	  // one option? auto-handle
	  //
	  if (options.length == 0) {
	    execute_fnct(choices[0]);
	    return;

	  //
	  // multiple options? let player choose
	  //
	  } else {

	    for (let z = 0; z < options.length; z++) {
	      if (!choices.includes(options[z])) { choices.push(options[z]); }
	    }

            paths_self.playerSelectSpaceWithFilter(
   	      `Destination for ${unit.name}` ,
	      (spacekey) => { if (choices.includes(spacekey)) { return 1; } return 0; } ,
	      execute_fnct ,
	      null , 
	      true ,
            );

	    return;
	  }

	//
	// ARMIES
	//
	} else {

	  //
	  // armies go in spacekeys, options over-ride
	  //
	  let spacekeys = this.returnArrayOfSpacekeysForPlacingReinforcements(country);
          if (options.length > 0) { spacekeys = options; }

	  //
	  // one option? auto-handle
	  //
	  if (spacekeys.length == 0) {
	    alert("Error -- no viable placement options?");
	    this.endTurn();
	  }

	  if (spacekeys.length == 1) {
	    execute_fnct(spacekeys[0]);
	    return;
	  }

	  if (spacekeys.length > 1) {
            paths_self.playerSelectSpaceWithFilter(
   	      `Destination for ${unit.name}` ,
	      (spacekey) => { if (spacekeys.includes(spacekey)) { return 1; } return 0; } ,
	      execute_fnct ,
	      null , 
	      true
            );
	    return;
	  }

	}
      }
    }    

    loop_fnct();
    return;

  }


  playerPlayAdvance() {

    let can_player_advance = false;
    let spacekey = this.game.state.combat.key;
    let space = this.game.spaces[spacekey];
    let attacker_units = this.returnAttackerUnits();

    for (let i = 0; i < attacker_units.length; i++) {
      let unit = attacker_units[i];
      if (!unit.damaged) { can_player_advance = true; }
    }
    if (space.fort) { 
      //
      // we cannot advance into a fort we attacked from an adjacent space if
      // the fort was empty, but we can advance (and then besiege) a fort if
      // we routed the opponent.
      //
      if (this.game.state.combat.unoccupied_fort == 1) { can_player_advance = false; }
    }

    //
    // skip advance if not possible
    //
    if (can_player_advance == false) {
      this.endTurn();
      return;
    }


    let html = `<ul>`;
    html    += `<li class="card" id="advance">advance</li>`;
    html    += `<li class="card" id="refuse">do not advance</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions(`Advance Full-Strength Units?`, html);
    this.attachCardboxEvents((action) => {

      if (action === "advance") {
	this.playerHandleAdvance();
	return;
      }

      if (action === "refuse") {
	this.endTurn();
	return;
      }

    });

  }



  playerPlayGreatAdvance(spacekey="") {

    let can_player_advance = false;
    if (!this.game.spaces[spacekey]) { this.endTurn(); return 0; }
    let space = this.game.spaces[spacekey];
    let attacker_units = this.returnAttackerUnits();

    for (let i = 0; i < attacker_units.length; i++) {
      let unit = attacker_units[i];
      if (!unit.damaged) { can_player_advance = true; }
    }
    if (space.fort) { 
      //
      // we cannot advance into a fort we attacked from an adjacent space if
      // the fort was empty, but we can advance (and then besiege) a fort if
      // we routed the opponent.
      //
      if (this.game.state.combat.unoccupied_fort == 1) { can_player_advance = false; }
    }

    //
    // skip advance if not possible
    //
    if (can_player_advance == false) {
      this.endTurn();
      return;
    }


    let html = `<ul>`;
    html    += `<li class="card" id="advance">advance</li>`;
    html    += `<li class="card" id="refuse">do not advance</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions(`Russians Retreat - Advance Full-Strength Units?`, html);
    this.attachCardboxEvents((action) => {

      if (action === "advance") {
	this.playerHandleGreatAdvance(spacekey);
	return;
      }

      if (action === "refuse") {
	this.endTurn();
	return;
      }

    });

  }


  playerHandleAdvance() {

    let paths_self = this;

    let spaces_to_retreat = 2;
    let attacker_loss_factor = this.game.state.combat.attacker_loss_factor;
    let defender_loss_factor = this.game.state.combat.defender_loss_factor;
    if ((attacker_loss_factor-defender_loss_factor) == 1) { spaces_to_retreat = 1; }

    if (this.game.state.combat.unoccupied_fort == 1 && this.game.space[this.game.state.combat.key].fort == -1) {
      spaces_to_retreat = 1;
      paths_self.playerSelectSpaceWithFilter(
        `Advanced into Destroyed Fort?`,
        (destination) => {
          if (destination == this.game.state.combat.key) { return 1; }
	  return 0;
        },
        (key) => {

          this.unbindBackButtonFunction();
          this.updateStatus("advancing...");

	  for (let i = 0, j = 0; j <= 2 && i < attacker_units.length; i++) {
            let x = attacker_units[i];
            let skey = x.spacekey;
            let ukey = x.key;
            let uidx = 0;
            let u = {};
            for (let z = 0; z < paths_self.game.spaces[skey].units.length; z++) {
              if (paths_self.game.spaces[skey].units[z].key === ukey) {
                uidx = z;
              }
            }
            if (!attacker_units[i].damaged) {
              paths_self.moveUnit(skey, uidx, key);
              paths_self.addMove(`move\t${faction}\t${skey}\t${uidx}\t${key}\t${paths_self.game.player}`);
	      j++;
            }
            paths_self.displaySpace(skey);
          }
          paths_self.displaySpace(key);
          paths_self.endTurn();
        },
        null,
        true
      );
      return 0;
    }


    let sourcekey = this.game.state.combat.retreat_sourcekey;
    let destinationkey = this.game.state.combat.retreat_destinationkey;
    let roptions = [];
    let attacker_units = this.returnAttackerUnits();
    let faction = this.returnFactionOfPlayer();

    //
    // no-one retreated, it was a massacre
    //
    if (!sourcekey) {
      roptions.push(this.game.state.combat.key);
    //
    // someone retreated
    //
    } else {

      let source = this.game.spaces[sourcekey];
      let destination = this.game.spaces[destinationkey];

      roptions.push(sourcekey);
   
      if (spaces_to_retreat == 2) {
        for (let i = 0; i < source.neighbours.length; i++) {
          for (let z = 0; z < destination.neighbours.length; z++) {
            if (source.neighbours[i] == destination.neighbours[z]) {
	      if (!roptions.includes(source.neighbours[i])) { roptions.push(source.neighbours[i]); }
	    }
          }
        }
      }
    }

    //
    // remove inappropriate options
    //
    for (let z = roptions.length-1; z >= 0; z--) {
      let spliceout = false;
      let s = this.game.spaces[roptions[z]];
      if (s.fort && this.game.state.combat.unoccupied_fort == 1) { spliceout = true; }
      if (s.units.length > 0) { spliceout = true; }
      if (spliceout == true) {
	roptions.splice(z, 1);
      }
    }

    //
    // nope out if no advance options
    //
    if (roptions.length == 0) {
      paths_self.addMove("NOTIFY\tAttacker no options ot advance");
      paths_self.endTurn();
    }

    paths_self.playerSelectSpaceWithFilter(
      `Select Advance Destination`,
      (destination) => {
	if (roptions.includes(destination)) {
	  return 1;
	}
        return 0;
      },
      (key) => {

	this.unbindBackButtonFunction();
	this.updateStatus("advancing...");


	for (let i = 0, j = 0; j <= 2 && i < attacker_units.length; i++) {
          let x = attacker_units[i];
      	  let skey = x.spacekey;
      	  let ukey = x.key;
      	  let uidx = 0;
	  let u = {};
	  for (let z = 0; z < paths_self.game.spaces[skey].units.length; z++) {
	    if (paths_self.game.spaces[skey].units[z].key === ukey) {
	      uidx = z;
	    } 
	  }
	  if (!attacker_units[i].damaged) {
            paths_self.moveUnit(skey, uidx, key);
	    // if we are moving past, we control the intermediate space
	    if (key != paths_self.game.state.combat.key) {
	      paths_self.addMove(`control\t${faction}\t${paths_self.game.state.combat.key}`);
	    }
	    paths_self.addMove(`move\t${faction}\t${skey}\t${uidx}\t${key}\t${paths_self.game.player}`);
	    j++;
	  }
          paths_self.displaySpace(skey);
	}
        paths_self.displaySpace(key);
	paths_self.endTurn();
      },
      null,
      true
    );
  }

  playerHandleGreatAdvance(sourcekey="") {

    let paths_self = this;

    let roptions = [sourcekey];
    let attacker_units = this.returnAttackerUnits();
    let faction = "central";

    paths_self.playerSelectSpaceWithFilter(
      `Select Advance Destination`,
      (destination) => {
	if (roptions.includes(destination)) {
	  return 1;
	}
        return 0;
      },
      (key) => {

	this.unbindBackButtonFunction();
	this.updateStatus("advancing...");

	for (let i = 0; i < attacker_units.length; i++) {
          let x = attacker_units[i];
      	  let skey = x.spacekey;
      	  let ukey = x.key;
      	  let uidx = 0;
	  let u = {};
	  for (let z = 0; z < paths_self.game.spaces[skey].units.length; z++) {
	    if (paths_self.game.spaces[skey].units[z].key === ukey) {
	      uidx = z;
	    } 
	  }
	  if (!attacker_units[i].damaged) {
            paths_self.moveUnit(skey, uidx, key);
	    paths_self.addMove(`move\t${faction}\t${skey}\t${uidx}\t${key}\t${paths_self.game.player}`);
	  }
          paths_self.displaySpace(skey);
	}
        paths_self.displaySpace(key);
	paths_self.endTurn();
      },
      null,
      true
    );
  }



  playerSpendReplacementPoints(faction="central") {

    this.removeSelectable();

    let continue_fnct = () => {};

    let html = `<ul>`;
    html    += `<li class="card" id="overlay">show overlay</li>`;
    html    += `<li class="card" id="finish">finish</li>`;
    html    += `</ul>`;

    this.replacements_overlay.hideSubMenu();

    this.updateStatusWithOptions(`Replacements Stage`, html);
    this.attachCardboxEvents((action) => {

      this.updateStatus("continuing...");

      if (action === "overlay") {
        if (continue_fnct()) {
	  this.playerSpendReplacementPoints(faction);
	} else {
	  this.endTurn();
	}
	return;
      }

      if (action === "finish") {
	this.endTurn();
	return;
      }

    });


    let paths_self = this;
    let rp = this.game.state.rp[faction];
    let do_upgradeable_units_remain = false;
    let just_stop = 0;


console.log("XXX");
console.log("XXX");
console.log("XXX");
console.log("XXX");
console.log("XXX");
console.log("XXX");
console.log("XXX");
console.log(JSON.stringify(rp));

    //
    // players can spend their replacement points to:
    //
    // 1. flip damaged units on the board
    // 2. flip damaged units in the RB
    // 3. return eliminated units to RB 
    //
    let do_replacement_points_exist_for_unit = (unit) => {

      // 17.1.3 - Belgian and Serbian Army units can be recreated only if they may 
      // legally be placed on the map [see 17.1.5] Belgian and Serbian corps can still 
      // be rebuilt in the Reserve Box, even if their countries are completely controlled 
      // by the enemy.
      //
      if (unit.ckey === "BE") {
	if (this.game.spaces["antwerp"].control == "allies") { return 1; }
	if (this.game.spaces["brussels"].control == "allies") { return 1; }
	if (this.game.spaces["ostend"].control == "allies") { return 1; }
	if (this.game.spaces["liege"].control == "allies") { return 1; }
      }
      if (unit.ckey === "SB") {
	if (this.game.spaces["belgrade"].control == "allies") { return 1; }
	if (this.game.spaces["valjevo"].control == "allies") { return 1; }
	if (this.game.spaces["nis"].control == "allies") { return 1; }
	if (this.game.spaces["skopje"].control == "allies") { return 1; }
	if (this.game.spaces["monastir"].control == "allies") { return 1; }
      }

      //
      // cannot spend replacement points if capital is besieged
      //
      let capitals = paths_self.returnCapital(unit.ckey);
      let is_capital_besieged = false;
      for (let z = 0; z < capitals.length; z++) {
	let c = paths_self.game.spaces[capitals[z]];
        let p = paths_self.returnPowerOfUnit(unit);
	if (c.control != p) { is_capital_besieged = true; }
	if (c.units.length > 0) {
	  if (paths_self.returnPowerOfUnit(c.units[0]) != p) {
	    is_capital_besieged = true;
	  }
	}
	if ((z+1) < capitals.length) { is_capital_besieged = false; }
      }

      if (is_capital_besieged == true) { return 0; }
      if (rp[unit.ckey] > 0) { return 1; }
      if (rp["A"] > 0) {
	if (unit.ckey == "ANA" || unit.ckey == "AUS" || unit.ckey == "BE" || unit,ckey == "CND" || unit.ckey == "MN" || unit.ckey == "PT" || unit.ckey == "RO" || unit.ckey == "GR" || unit.ckey == "SB") {
	  return 1;
	}
      }
      return 0;
    }

    continue_fnct = () => {

	let can_uneliminate_unit = false;
	let can_uneliminate_unit_array = [];	
	let can_repair_unit_on_board = false;	
	let can_repair_unit_on_board_array = [];
	let can_repair_unit_in_reserves = false;	
	let can_repair_unit_in_reserves_array = [];
	let can_deploy_unit_in_reserves = false;	
	let can_deploy_unit_in_reserves_array = [];

        for (let key in paths_self.game.spaces) {
	  for (let z = 0; z < paths_self.game.spaces[key].units.length; z++) {
	    if (key == "arbox" && faction == "allies") { 
	      if (do_replacement_points_exist_for_unit(paths_self.game.spaces[key].units[z])) {
	        can_deploy_unit_in_reserves = true;
	        can_deploy_unit_in_reserves_array.push({ key : key , idx : z , name : paths_self.game.spaces[key].units[z].name });
	        if (paths_self.game.spaces[key].units[z].damaged) {
	  	  can_repair_unit_in_reserves = true;
	          can_repair_unit_in_reserves_array.push({ key : key , idx : z , name : paths_self.game.spaces[key].units[z].name });
	        }
	      }
	    }
	    if (key == "aeubox" && faction == "allies") { 
	      if (do_replacement_points_exist_for_unit(paths_self.game.spaces[key].units[z])) {
	        can_uneliminate_unit = true;
	        can_uneliminate_unit_array.push({ key : key , idx : z , name : paths_self.game.spaces[key].units[z].name });
	      }
	    }
	    if (key == "crbox" && faction == "central") { 
	      if (do_replacement_points_exist_for_unit(paths_self.game.spaces[key].units[z])) {
	        can_deploy_unit_in_reserves = true;
	        can_deploy_unit_in_reserves_array.push({ key : key , idx : z , name : paths_self.game.spaces[key].units[z].name });
	        if (paths_self.game.spaces[key].units[z].damaged) {
		  can_repair_unit_in_reserves = true;
	          can_repair_unit_in_reserves_array.push({ key : key , idx : z , name : paths_self.game.spaces[key].units[z].name });
	        }
	      }
	    }
	    if (key == "ceubox" && faction == "central") { 
	      if (do_replacement_points_exist_for_unit(paths_self.game.spaces[key].units[z])) {
	        can_uneliminate_unit = true;
	        can_uneliminate_unit_array.push({ key : key , idx : z , name : paths_self.game.spaces[key].units[z].name });
	      }
	    }
	    if (key != "ceubox" && key != "crbox" && key != "arbox" && key != "aeubox" && faction == "central") {
	      if (do_replacement_points_exist_for_unit(paths_self.game.spaces[key].units[z])) {
	        if (paths_self.game.spaces[key].units[z].damaged && paths_self.returnPowerOfUnit(paths_self.game.spaces[key].units[z]) == "central") {
		  can_repair_unit_on_board = true;
	          can_repair_unit_on_board_array.push({ key : key , idx : z , name : paths_self.game.spaces[key].units[z].name });
	        }
	      }
	    }
	    if (key != "ceubox" && key != "crbox" && key != "arbox" && key != "aeubox" && faction == "allies") {
	      if (do_replacement_points_exist_for_unit(paths_self.game.spaces[key].units[z])) {
	        if (paths_self.game.spaces[key].units[z].damaged && paths_self.returnPowerOfUnit(paths_self.game.spaces[key].units[z]) == "allies") {
		  can_repair_unit_on_board = true;
	          can_repair_unit_on_board_array.push({ key : key , idx : z , name : paths_self.game.spaces[key].units[z].name });
	        }
	      }
	    }
	  }
	}

	let options = [];
	if (can_uneliminate_unit) { options.push(`<li class="option" id="uneliminate">rebuild eliminated unit</li>`); }
	if (can_repair_unit_on_board) { options.push(`<li class="option" id="repair_board">repair unit on board</li>`); }
	if (can_repair_unit_in_reserves) { options.push(`<li class="option" id="repair_reserves">repair unit in reserves</li>`); }
	if (can_deploy_unit_in_reserves) { options.push(`<li class="option" id="deploy">deploy unit from reserves</li>`); }
        options.push(`<li class="option" id="finish">finish</li>`);

	this.game.state.replacements = {};
	this.game.state.replacements.options = options;
	this.game.state.replacements.can_uneliminate_unit = can_uneliminate_unit;
	this.game.state.replacements.can_uneliminate_unit_array = can_uneliminate_unit_array;
	this.game.state.replacements.can_repair_unit_on_board = can_repair_unit_on_board;
	this.game.state.replacements.can_repair_unit_on_board_array = can_repair_unit_on_board_array;
	this.game.state.replacements.can_repair_unit_in_reserves = can_repair_unit_in_reserves;
	this.game.state.replacements.can_repair_unit_in_reserves_array = can_repair_unit_in_reserves_array;
	this.game.state.replacements.can_deploy_unit_in_reserves = can_deploy_unit_in_reserves;
	this.game.state.replacements.can_deploy_unit_in_reserves_array = can_deploy_unit_in_reserves_array;

	if (options.length > 1) { return 1; }

	return 0;

    }    

    if (continue_fnct()) {
      paths_self.replacements_overlay.render();
    }

    return 1;
  }



  playerPlayPostCombatRetreat() {

    let can_defender_cancel_retreat = false;

    //
    // triggers if we only have 1 unit left and they are a damaged
    // corps...
    //
    if (this.game.state.combat.can_defender_cancel == false) {
      this.playerHandleRetreat();
      return;
    }

    //
    // withdrawal forces retreat -- no other options
    //
    if (this.game.state.events.withdrawal) {
      this.playerHandleRetreat();
      return;
    }


    //
    // Defending units in Trenches, Forests, Deserts, Mountains, or 
    // Swamps may chose to ignore a retreat by taking one additional
    // step loss. 
    //
    let space = this.game.spaces[this.game.state.combat.key];

    if (space.terrain == "forest") 	{ can_defender_cancel_retreat = true; }
    if (space.terrain == "mountain") 	{ can_defender_cancel_retreat = true; }
    if (space.terrain == "swamp") 	{ can_defender_cancel_retreat = true; }
    if (space.terrain == "desert") 	{ can_defender_cancel_retreat = true; }
    if (space.trench > 0) 		{ can_defender_cancel_retreat = true; }

    if (can_defender_cancel_retreat == false) {
      this.playerHandleRetreat();
      return;
    }

    let html = `<ul>`;
    html    += `<li class="card" id="retreat">retreat</li>`;
    html    += `<li class="card" id="hit">take additional hit</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions(`Retreat?`, html);
    this.attachCardboxEvents((action) => {

      if (action === "retreat") {
	this.playerHandleRetreat();
	return;
      }

      if (action === "hit") {
	this.loss_overlay.renderToAssignAdditionalStepwiseLoss();
        return;
      }

    });

    return;
  }


  playerHandleRetreat() {

console.log("into player handle retreat...");

    let paths_self = this;

    let spaces_to_retreat = 2;
    let attacker_loss_factor = this.game.state.combat.attacker_loss_factor;
    let defender_loss_factor = this.game.state.combat.defender_loss_factor;
    if ((attacker_loss_factor-defender_loss_factor) == 1) { spaces_to_retreat = 1; }
    let faction = this.returnFactionOfPlayer(this.game.player);
    let sourcekey = this.game.state.combat.key;

    //
    // withdrawal forces spaces to retreat to 1
    //
    if (this.game.state.events.withdrawal) { spaces_to_retreat = 1; } 

    //
    // 
    //
    let spaces_within_hops = paths_self.returnSpacesWithinHops(
      this.game.state.combat.key,
      spaces_to_retreat, 
      (spacekey) => {
	if (spacekey == this.game.state.combat.key) { return 1; }; // pass through
        if (paths_self.game.spaces[spacekey].units.length > 0) {
	  if (paths_self.returnPowerOfUnit(paths_self.game.spaces[spacekey].units[0]) != faction) { 
  	    return 0; 
          }
        }
        return 1;
      }
    );

console.log("###################");
console.log("###################");
console.log("###################");
console.log("SPACES WITHIN HOPS:");
console.log(JSON.stringify(spaces_within_hops));

    //
    // remove source and single-hop destination if needed
    //
    let source = this.game.spaces[this.game.state.combat.key];
    for (let i = spaces_within_hops.length-1; i >= 0; i--) {
      let destination = spaces_within_hops[i];
      if (destination == this.game.state.combat.key) {
	spaces_within_hops.splice(i, 1);
      }
      if (source.neighbours.includes(destination)) {
	let is_there_a_two_hop_connection = false;
	let d = this.game.spaces[destination];
	//
	// we only keep if there is a connecting, controlled space
	// that could server as the first interstitial hop...
	//
        for (let z = 0; z < d.neighbours.length; z++) {
	  if (this.doesSpaceHaveEnemyUnits(this.returnFactionOfPlayer(), d.neighbours[z])) {
	  } else {
	    //
	    // check to see if it has a connection with the source
	    //
	    if (source.neighbours.includes(d.neighbours[z])) {
	      is_there_a_two_hop_connection = true;
	    }
	  }
	}
	if (is_there_a_two_hop_connection == false) {
	  spaces_within_hops.splice(i, 1);
	}
      }

      // what is not prohibited is explicitly allowed?
      //if (faction == "central" && paths_self.game.state.events.race_to_the_sea != 1) {
	//if (spaces_within_hops[i] == "amiens") { spaces_within_hops.splice(i, 1); } else {
	//  if (spaces_within_hops[i] == "ostend") { spaces_within_hops.splice(i, 1); } else {
	//    if (spaces_within_hops[i] == "calais") { spaces_within_hops.splice(i, 1); }
	//  }
	//}
      //}
    }

    //
    // no retreat options? eliminate all defenders
    //
    if (spaces_within_hops.length == 0) {
      for (let i = 0; i < source.units.length; i++) {
        paths_self.addMove(`eliminate\t${source.key}\t${i}`);
	paths_self.endTurn();
	return;
      }
    }

  
    //
    // allow UI for moving unit...
    //
    let retreat_function = (unit_idx, retreat_function) => {
      let unit = source.units[unit_idx];
      paths_self.playerSelectSpaceWithFilter(
          `Select Retreat Destination for ${unit.name}`,
	  (destination) => {
	    if (spaces_within_hops.includes(destination)) {
	      if (paths_self.game.spaces[destination].control == paths_self.returnFactionOfPlayer(paths_self.game.player)) {
		return 1;
	      }
	    }
	    return 0;
	  },
	  (key) => {
	    paths_self.updateStatus("retreating...");
            paths_self.moveUnit(sourcekey, unit_idx, key);
	    paths_self.prependMove(`retreat\t${faction}\t${sourcekey}\t${unit_idx}\t${key}\t${paths_self.game.player}`);
            paths_self.displaySpace(key);
	    if (unit_idx <= 0) {
	      paths_self.endTurn();
	      return 0;
	    } else {
	      retreat_function(unit_idx-1, retreat_function);
	    }
	  },
	  null,
    	  true
      );
    };
  
    //
    // now allow moves
    //
    retreat_function(source.units.length-1, retreat_function);

  }



  playerHandleGreatRetreat(sourcekey="") {

    let paths_self = this;

    let spaces_to_retreat = 1;
    let faction = "allies";

    //
    // retreat options 
    //
    let spaces_within_hops = paths_self.returnSpacesWithinHops(
      this.game.state.combat.key,
      spaces_to_retreat, 
      (spacekey) => {
	if (spacekey == this.game.state.combat.key) { return 1; }; // pass through
        if (paths_self.game.spaces[spacekey].units.length > 0) {
	  if (paths_self.returnPowerOfUnit(paths_self.game.spaces[spacekey].units[0]) != faction) { 
  	    return 0; 
          }
        }
        return 1;
      }
    );

console.log("###################");
console.log("###################");
console.log("###################");
console.log("SPACES WITHIN HOPS:");
console.log(JSON.stringify(spaces_within_hops));

    //
    // remove source and single-hop destination if needed
    //
    let source = this.game.spaces[this.game.state.combat.key];
    for (let i = spaces_within_hops.length-1; i >= 0; i--) {
      let destination = spaces_within_hops[i];
      if (destination == this.game.state.combat.key) {
	spaces_within_hops.splice(i, 1);
      }
    }

    //
    // no retreat options? this is voluntary, so we should just end without retreating
    //
    if (spaces_within_hops.length == 0) {
      paths_self.endTurn();
      return 0;
    }

  
    //
    // allow UI for moving unit...
    //
    let retreat_function = (unit_idx, retreat_function) => {
      let unit = source.units[unit_idx];

      //
      // only RU units retreat
      //
      while (unit.ckey != "RU") { 
	unit_idx--; 
	if (unit_idx < 0) {
	  paths_self.endTurn();
	  return 0;
	}
        unit = source.units[unit_idx];
      }

      paths_self.playerSelectSpaceWithFilter(
          `Select Retreat Destination for ${unit.name}`,
	  (destination) => {
	    if (spaces_within_hops.includes(destination)) {
	      if (paths_self.game.spaces[destination].control == paths_self.returnFactionOfPlayer(paths_self.game.player)) {
		return 1;
	      }
	    }
	    return 0;
	  },
	  (key) => {
	    paths_self.updateStatus("retreating...");
            paths_self.moveUnit(sourcekey, unit_idx, key);
	    paths_self.prependMove(`retreat\t${faction}\t${sourcekey}\t${unit_idx}\t${key}\t${paths_self.game.player}`);
            paths_self.displaySpace(key);
	    if (unit_idx <= 0) {
	      paths_self.endTurn();
	      return 0;
	    } else {
	      retreat_function(unit_idx-1, retreat_function);
	    }
	  },
	  null,
    	  true
      );
    };
  
    //
    // now allow moves
    //
    retreat_function(source.units.length-1, retreat_function);

  }



  playerPlayGunsOfAugust() {

    let html = `<ul>`;
    html    += `<li class="card" id="guns">Guns of August</li>`;
    html    += `<li class="card" id="other">other card</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions(`Choose Your Seventh Card:`, html);
    this.guns_overlay.render();

    this.attachCardboxEvents((action) => {

      this.unbindBackButtonFunction();
      this.guns_overlay.remove();
      this.updateStatus("selected");

      if (action === "guns") {
        this.game.deck[0].hand.push("cp01");
	this.endTurn();
      }

      if (action === "other") {
        this.addMove("DEAL\t1\t1\t1"); // player chooses random other card
	this.endTurn();
      }

    });

  }

  playerPlayFlankAttack() {

    //
    // it is possible to launch a flank attack if we want
    //
    let html = `<ul>`;
    html    += `<li class="option" id="yes">flank attack</li>`;
    html    += `<li class="option" id="no">normal attack</li>`;
    if (this.game.deck[0].hand.includes("cp44")) {
      let attacker_units = this.returnAttackerUnits();
      let defender_units = this.returnDefenderUnits();
      let valid_attacker = false;
      let valid_defender = false;
      for (let i = 0; i < attacker_units.length; i++) { if (attacker_units[i].ckey == "GE") { valid_attacker = true; } }
      for (let i = 0; i < defender_units.length; i++) { if (defender_units[i].ckey == "RU") { valid_defender = true; } }
      if (valid_attacker && valid_defender) {
        html    += `<li class="option showcard" id="cp44">von hutier</li>`;
      }
    }
    if (this.game.deck[0].hand.includes("cp02")) {
      let attacker_units = this.returnAttackerUnits();
      let defender_units = this.returnDefenderUnits();
      let valid_option = false;
      for (let i = 0; i < attacker_units.length; i++) { if (attacker_units[i].country == "germany") { valid_option = true; } }
      for (let i = 0; i < defender_units.length; i++) { if (defender_units[i].country != "russia") { valid_option = false; } }
      if (valid_option == true) {
        html    += `<li class="option showcard" id="cp02">wireless intercepts</li>`;
      }
    }
    html    += `</ul>`;

    this.flank_overlay.render();
    this.updateStatusWithOptions(`Flank Attack?`, html);
    this.attachCardboxEvents((action) => {

      this.unbindBackButtonFunction();
      this.updateStatus("submitting...");
      this.flank_overlay.hide();

      if (action === "no") {
	this.endTurn();
	return;
      }

      if (action === "cp02") {
	this.addMove("event\tcp02\tcentral");
        this.endTurn();
      }

      if (action === "cp44") {
	this.addMove("event\tcp44\tcentral");
        this.endTurn();
      }

      if (action === "yes") {

	//
	// computer-aided simulation, so we will-auto pin
	// in the most advantageous possible...
	//

        //
        // select pinning unit
        //
        let html = `<ul>`;
	let eligible_spaces = [];
	for (let i = 0; i < this.game.state.combat.attacker.length; i++) {
	  let unit = this.game.state.combat.attacker[i];
	  if (!eligible_spaces.includes(unit.unit_sourcekey)) { eligible_spaces.push(unit.unit_sourcekey); }
	}

	let current_option_spacekey = "";
	let current_option_drmboost = 0;
	let best_option_spacekey = "";
	let best_option_drmboost = 0;
        let flanking_spaces = [];
	let action = 0;

	//
	//
	//
	for (let z = 0; z < eligible_spaces.length; z++) {

	  current_option_spacekey = eligible_spaces[z];
	  current_option_drmboost = 0;
	  flanking_spaces = [];

          for (let i = 0; i < eligible_spaces.length; i++) {
            if (eligible_spaces[i] !== current_option_spacekey) {
              if (!flanking_spaces.includes(eligible_spaces[i])) {
                flanking_spaces.push(eligible_spaces[i]);
                if (this.canSpaceFlank(eligible_spaces[i])) {
                  current_option_drmboost++;
                }
              }
            }
          }

	  if (best_option_drmboost < current_option_drmboost) {
	    best_option_drmboost = current_option_drmboost;
	    best_option_spacekey = current_option_spacekey;
	  }

	}

	for (let i = 0; i < eligible_spaces.length; i++) {
	  if (eligible_spaces[i] === best_option_spacekey) { action = i; }
	}

	this.addMove(`flank_attack_attempt\t${action}\t${JSON.stringify(eligible_spaces)}`);
	this.addMove(`NOTIFY\tFlank Attack launched from: ${eligible_spaces[action]}`);
	this.endTurn();

      }
    });
  }

  playerPlayCard(faction, card) {

    //
    // avoid back-button select
    //
    this.removeSelectable();

    //
    // pass is pass!
    //
    if (card == "pass") {
      this.addMove("pass\t"+faction);
      this.endTurn();
      return;
    }

    let c = this.deck[card];

    //
    // hide any popup
    //
    this.cardbox.hide();

    let html = `<ul>`;
    html    += `<li class="card movement" id="ops">ops (movement / combat)</li>`;
    if (c.sr && this.canPlayStrategicRedeployment(faction)) {
      html    += `<li class="card redeployment" id="sr">strategic redeployment</li>`;
    }
    if (c.rp && this.canPlayReinforcementPoints(faction)) {
      html    += `<li class="card reinforcement" id="rp">reinforcement points</li>`;
    }
    let can_event_card = false;
    try { can_event_card = c.canEvent(this, faction); } catch (err) {}

    if (can_event_card) {
      html    += `<li class="card event" id="event">trigger event</li>`;
    }
    html    += `</ul>`;

    this.bindBackButtonFunction(() => { this.playerTurn(faction); });

    this.updateStatusWithOptions(`${this.returnFactionName(faction)} - playing ${this.popup(card)}`, html, true);

    this.menu_overlay.render(this.game.player, faction, card);

    this.attachCardboxEvents((action) => {

      this.updateStatus("selected...");
      this.menu_overlay.hide();

      //
      // discard the card
      //
      this.addMove("discard\t"+card);

      if (action === "ops") {
	this.playerPlayOps(faction, card, c.ops);
      }

      if (action === "sr") {
	this.playerPlayStrategicRedeployment(faction, card, c.sr);
      }

      if (action === "rp") {
	this.playerPlayReplacementPoints(faction, card);
      }

      if (action === "event") {

	//
	// and trigger event
	//
	if (c.canEvent(this, faction)) {
	  this.addMove("event\t"+card+"\t"+faction);
	}

	//
	// War Status
	//
	if (c.ws > 0) {
	  this.addMove("ws\t"+card+"\t"+faction+"\t"+c.ws);
	}

        this.addMove(`record\t${faction}\t${this.game.state.round}\tevent`);

	this.endTurn();
	return 1;
      }

    });

  }

  playerPlayCombat(faction) {

    let paths_self = this;
    let options = this.returnSpacesWithFilter(
      (key) => {
	if (this.game.spaces[key].units.length > 0) {
	  if (this.returnPowerOfUnit(this.game.spaces[key].units[0]) != faction) {
  	    for (let i = 0; i < this.game.spaces[key].neighbours.length; i++) {
	      let n = this.game.spaces[key].neighbours[i];
	      if (this.game.spaces[n].oos == 1) { return 0; } // cannot attack if OOS
	      if (this.game.spaces[n].activated_for_combat == 1) { return 1; }
	    }
	  }
	}
        return 0;
      }
    );


    let rendered_at = options[0];
    if (paths_self.zoom_overlay.visible) {
      paths_self.zoom_overlay.scrollTo(options[0]);
    } else {
      paths_self.zoom_overlay.renderAtSpacekey(options[0]);
    }
    paths_self.zoom_overlay.showControls();


    let mainInterface = function(options, mainInterface, attackInterface) {

      //
      // sometimes this ends
      //
      if (options.length == 0) {
	paths_self.updateStatus("combat finished...");
	paths_self.addMove("resolve\tplayer_play_combat");
	paths_self.addMove("post_combat_cleanup");
	paths_self.endTurn();
	return;
      }

      //
      // sanity check options still valid
      //
      let non_german_units = false;
      let units_to_attack = 0;
      for (let i = 0; i < options.length; i++) {
	let s = options[i];
	for (let z = 0; z < paths_self.game.spaces[options[i]].units.length; z++) {
	  if (paths_self.game.spaces[options[i]].units[z].attacked != 1) {
            if (paths_self.game.spaces[options[i]].units[z].ckey != "GE") { non_german_units = true; }
	    units_to_attack++;
	  }
	}
      }

      //
      // exit if nothing is left to attack with
      //
      if (units_to_attack == 0) {
	//
	// nothing left
	//
	paths_self.removeSelectable();
	paths_self.updateStatus("acknowledge...");
	paths_self.addMove("resolve\tplayer_play_combat");
	paths_self.addMove("post_combat_cleanup");
	paths_self.endTurn();
      }

      //
      // select space to attack
      //
      paths_self.playerSelectSpaceWithFilter(
	"Execute Combat (Select Target): ",
	(key) => {

	  //
	  // Austrian units can still attack...
	  //
	  if (paths_self.game.state.events.oberost != 1) {
	    if (faction == "central") {
	      if (paths_self.game.spaces[key].country == "russia" && paths_self.game.spaces[key].fort > 0) {
            	if (non_german_units == false) { return 0; } else {
		  let attack_ok = false;
		  for (let z = 0; z < paths_self.game.spaces[key].neighbours.length; z++) {
		    let n = paths_self.game.spaces[paths_self.game.spaces[key].neighbours[z]];
		    if (n.activated_for_combat == 1) {
		      for (let zz = 0; zz < n.units.length; zz++) {
			if (n.units[zz].ckey != "GE") { attack_ok = true; }
		      }
		    }
		  }
		  if (!attack_ok) { return 0; }
		}
	      }
	    }
	  }
	  if (paths_self.game.spaces[key].fort > 0 && paths_self.game.spaces[key].units.length == 0) {
	    for (let z = 0; z < paths_self.game.spaces[key].neighbours.length; z++) {
	      if (paths_self.game.spaces[key].activated_for_combat == 1) { 
		if (paths_self.game.spaces[key].control != faction) { return 1; }
	      }
	    }
	  }
	  if (paths_self.game.spaces[key].units.length > 0 || paths_self.game.spaces[key].fort > 0) {
	    let power = paths_self.game.spaces[key].control;
	    if (paths_self.game.spaces[key].units.length > 0) { power = paths_self.returnPowerOfUnit(paths_self.game.spaces[key].units[0]); }
	    if (power != faction) {
  	      for (let i = 0; i < paths_self.game.spaces[key].neighbours.length; i++) {
	        let n = paths_self.game.spaces[key].neighbours[i];
	        if (paths_self.game.spaces[n].oos != 1 && paths_self.game.spaces[n].activated_for_combat == 1) {
	  	  if (paths_self.game.state.attacks[n]) {
	  	    if (paths_self.game.state.attacks[n] == key) { return 0; }
		  }
		  for (let z = 0; z < paths_self.game.spaces[n].units.length; z++) {
		    if (paths_self.game.spaces[n].units[z].attacked != 1) { return 1; }
		  }
		  paths_self.game.spaces[n].activated_for_combat = 0;
		  paths_self.displaySpace(n);
		}
	      }
	    }
            return 0;
	  }
	},
	(key) => {

	  if (key === "skip") {
	    paths_self.addMove("resolve\tplayer_play_combat");
	    paths_self.addMove("post_combat_cleanup");
	    paths_self.removeSelectable();
	    paths_self.endTurn();
	    return;
	  }
	
	  paths_self.removeSelectable();
	  attackInterface(key, options, [], mainInterface, attackInterface);
	},
	null,
	true,
	[{ key : "skip" , value : "finish attack" }],
      )
    }

    let attackInterface = function(key, options, selected, mainInterface, attackInterface) {

      let units = [];
      let original_key = key;

      let can_german_units_attack = true;
      if (paths_self.game.spaces[key].country == "russia" && paths_self.game.spaces[key].fort > 0 && paths_self.game.spaces[key].units.length > 0 && paths_self.game.state.events.oberost != 1) {
	can_german_units_attack = false;
      }

      for (let z = 0; z < paths_self.game.spaces[key].neighbours.length; z++) {
	let n = paths_self.game.spaces[key].neighbours[z];
	if (paths_self.game.spaces[n].activated_for_combat == 1) {
	  for (let k = 0; k < paths_self.game.spaces[n].units.length; k++) {
	    let u = paths_self.game.spaces[n].units[k];
	    if (u.attacked != 1 && paths_self.game.spaces[n].oos != 1) {
	      if (!can_german_units_attack) {
	        if (u.ckey != "GE") {
		  units.push({ key : key , unit_sourcekey: n , unit_idx : k });
		}
	      } else {
	        units.push({ key : key , unit_sourcekey: n , unit_idx : k });
	      }
	    }
	  }
	}
      }
      units.push({ key : "skip" , unit_idx : "skip" });

      paths_self.playerSelectOptionWithFilter(
	"Which Units Participate in Attack?",
	units,
	(idx) => {
	  if (idx.key == "skip") {
	    return `<li class="option" id="skip">finished selecting</li>`;
	  }
	  let unit = paths_self.game.spaces[idx.unit_sourcekey].units[idx.unit_idx];
	  let already_selected = false;
	  for (let z = 0; z < selected.length; z++) {
	     if (paths_self.app.crypto.stringToBase64(JSON.stringify(idx)) === selected[z]) { already_selected = true; }
	  }
	  if (already_selected) {
  	    return `<li class="option" id='${paths_self.app.crypto.stringToBase64(JSON.stringify(idx))}'>${unit.name} / ${idx.unit_sourcekey} ***</li>`;
	  } else {
  	    return `<li class="option" id='${paths_self.app.crypto.stringToBase64(JSON.stringify(idx))}'>${unit.name} / ${idx.unit_sourcekey}</li>`;
	  }
	},
	(idx) => {

	  //
	  // maybe we are done!
	  //
	  if (idx === "skip") {
	    let finished = false;
	    paths_self.zoom_overlay.hide();
	    paths_self.updateStatusWithOptions("attacking...", "");
	    if (selected.length > 0) {
	      let s = [];
	      for (let z = 0; z < selected.length; z++) {
  		s.push(JSON.parse(paths_self.app.crypto.base64ToString(selected[z])));
	      }
	      paths_self.addMove("resolve\tplayer_play_combat");
	      paths_self.addMove("player_play_combat\t"+paths_self.returnFactionOfPlayer());
	      paths_self.addMove("post_combat_cleanup");
	      paths_self.addMove(`combat\t${original_key}\t${JSON.stringify(s)}`);
	      paths_self.endTurn();
	    } else {
	      paths_self.addMove("resolve\tplayer_play_combat");
	      paths_self.addMove("post_combat_cleanup");
	      paths_self.endTurn();
	    }
	    return;
	  }

	  //
	  // or our JSON object
	  //
	  let pidx = JSON.parse(paths_self.app.crypto.base64ToString(idx));

	  let key = pidx.key;
	  let unit_sourcekey = pidx.unit_sourcekey;
	  let unit_idx = pidx.unit_idx;

	  if (selected.includes(idx)) {
	    selected.splice(selected.indexOf(idx), 1);
	  } else {
	    selected.push(idx);
	  }

          attackInterface(original_key, options, selected, mainInterface, attackInterface);

	},
        false
      );
    }

    mainInterface(options, mainInterface, attackInterface);

  }


  playerPlayMovement(faction) {

    let active_unit = null;
    let active_unit_moves = 0;

    let paths_self = this;
    let options = this.returnSpacesWithFilter(
      (key) => {
        if (key == "ceubox" || key == "crbox" || key == "aeubox" || key == "arbox") { return 0; }
	if (this.game.spaces[key].activated_for_movement == 1) { return 1; }
        return 0;
      }
    );

    let rendered_at = options[0];
    paths_self.zoom_overlay.renderAtSpacekey(options[0]);
    paths_self.zoom_overlay.showControls();

    let mainInterface = function(options, mainInterface, moveInterface, unitActionInterface, continueMoveInterface) {

      //
      // sometimes this ends
      //
      if (options.length == 0) {
	this.updateStatus("moving units...");
	this.endTurn();
	return;
      }

      //
      // sanity check options still valid
      //
      let units_to_move = 0;
      for (let i = 0; i < options.length; i++) {
	for (let z = 0; z < paths_self.game.spaces[options[i]].units.length; z++) {
	  if (paths_self.game.spaces[options[i]].units[z].moved != 1) {
	    units_to_move++;
	  }
	}
      }
      if (units_to_move == 0) {
	//
	// nothing left
	//
	paths_self.removeSelectable();
	paths_self.updateStatus("acknowledge...");
	paths_self.endTurn();
      }

      paths_self.playerSelectSpaceWithFilter(
	"Execute Movement (Awaiting Orders): ",
	(key) => {
	  if (
	    paths_self.game.spaces[key].activated_for_movement == 1 
	    && options.includes(key)
	  ) {
	    let everything_moved = true;
	    for (let z = 0; z < paths_self.game.spaces[key].units.length; z++) {
	      if (paths_self.game.spaces[key].units[z].moved != 1) { everything_moved = false; }
	    }
	    if (everything_moved == true) {
	      paths_self.game.spaces[key].activated_for_movement = 0;
	      paths_self.displaySpace(key);
	    }
	    if (everything_moved == false) { return 1; }
	  }
	  return 0;
	},
	(key) => {

	  if (key === "skip") {
            paths_self.addMove("resolve\tplayer_play_movement");
            paths_self.removeSelectable();
            paths_self.endTurn();
            return;
	  }

	  paths_self.zoom_overlay.scrollTo(key);
	  paths_self.removeSelectable();
	  moveInterface(key, options, mainInterface, moveInterface, unitActionInterface, continueMoveInterface);
	},
	null ,
	true , 
	[{ key : "skip" , value : "finish movement" }],
      )
    }


    let unitActionInterface = function(key, idx, options, mainInterface, moveInterface, unitActionInterface, continueMoveInterface) {

      let unit = paths_self.game.spaces[key].units[idx];

      active_unit = unit;
      active_unit_moves = unit.movement;
      if (unit.damaged) { active_unit_moves = unit.rmovement; }
     
      let sourcekey = key;
      let html  = `<ul>`;
      if (paths_self.game.spaces[key].oos != 1) {
          html += `<li class="option" id="move">move</li>`;
      }
      if (paths_self.game.state.events.entrench == 1) {
        let can_entrench_here = true;
	for (let z = 0; z < paths_self.game.state.entrenchments.length; z++) {
	  if (paths_self.game.state.entrenchments[z].spacekey == key) { can_entrench_here = false; }
	}
	if (can_entrench_here) {
          html += `<li class="option" id="entrench">entrench</li>`;
	}
      }
          html += `<li class="option" id="skip">stand down</li>`;
          html += `</ul>`;
      paths_self.updateStatusWithOptions(`Select Action for ${unit.name}`, html);
      paths_self.attachCardboxEvents((action) => {

        if (action === "move") {
	  continueMoveInterface(sourcekey, sourcekey, idx, options, mainInterface, moveInterface, unitActionInterface, continueMoveInterface);
        }

        if (action === "entrench") {
	  let u = paths_self.game.spaces[sourcekey].units[idx];
	  let lf = u.loss; if (u.damaged) { lf = u.rloss; }
	  paths_self.addMove(`player_play_movement\t${faction}`);
	  paths_self.addMove(`entrench\t${faction}\t${sourcekey}\t${idx}\t${lf}`);
	  paths_self.endTurn();
	  return;
        }


        if (action === "skip") {
	  paths_self.game.spaces[key].units[idx].moved = 1;
	  let mint = false;
	  for (let z = 0; z < paths_self.game.spaces[key].units.length; z++) {
	    if (paths_self.game.spaces[key].units[z].moved != 1) { mint = true; }
	  }
	  if (mint) {
	    moveInterface(key, options, mainInterface, moveInterface, unitActionInterface, continueMoveInterface);
	  } else {
	    mainInterface(options, mainInterface, moveInterface, unitActionInterface, continueMoveInterface);
	  }
        }

      });
    }


    let continueMoveInterface = function(sourcekey, currentkey, idx, options, mainInterface, moveInterface, unitActionInterface, continueMoveInterface) {

      let unit = active_unit;

      //
      // update idx as it can change based on new location...
      //
      for (let z = 0; z < paths_self.game.spaces[currentkey].units.length; z++) {
        if (JSON.stringify(paths_self.game.spaces[currentkey].units[z]) === JSON.stringify(unit)) { idx = z; }
      }

      let spaces_within_hops = paths_self.returnSpacesWithinHops(currentkey, active_unit_moves, (spacekey) => {
	if (paths_self.game.state.events[paths_self.game.spaces[spacekey].country] < 1) {
	      // neutral country so movement not allowed 
	      return 0;
	}
	if (paths_self.game.spaces[spacekey].units.length > 0) {
	  if (paths_self.returnPowerOfUnit(paths_self.game.spaces[spacekey].units[0]) != faction) { 
	    return 0; 
	  }
	}
	return 1;
      }, unit);

      //
      // remove any spaces activated for combat!
      //
      for (let z = spaces_within_hops.length-1; z >= 0; z--) {
	if (paths_self.game.spaces[spaces_within_hops[z]].activated_for_combat == 1) { 
	  spaces_within_hops.splice(z, 1);
	}
      }

      paths_self.playerSelectSpaceWithFilter(

	    `${active_unit_moves} moves for ${unit.name}`,

	    (destination) => {

	      if (faction == "central" && paths_self.game.state.events.race_to_the_sea != 1 && paths_self.game.state.general_records_track.central_war_status <4 ) {
		if (destination == "amiens") { return 0; }
		if (destination == "ostend") { return 0; }
		if (destination == "calais") { return 0; }
	      }

	      //
	      // you cannot move into neutral countries
	      //
	      let country = paths_self.game.spaces[destination].country;
	      if (paths_self.game.state.events[country] != 1) { return 0; }

	      if (spaces_within_hops.includes(destination)) {
	        return 1;
	      }
	      return 0;
	    },
	    (key2) => {

	      //
	      // end turn
	      //
	      if (key2 === "skip") {
		//
		// we finish the movement of one unit, and move on to the next 
		//
	        mainInterface(options, mainInterface, moveInterface, unitActionInterface, continueMoveInterface);
		//paths_self.endTurn();
		return 1;
	      }

	      //
	      // if this is a fort, we need to move enough units into the fort in order
	      // to besiege it, which is at least 1 army, or a number of Corps equal to 
	      // the fort’s LF 
	      //
	      let is_the_unit_an_army = false;
	      let is_the_destination_a_fort = false;
	      if (paths_self.game.spaces[key2].fort > 1 && paths_self.game.spaces[key2].control != paths_self.returnFactionOfPlayer()) { is_the_destination_a_fort = true; }
	      if (unit.army == 1) { is_the_unit_an_army = true; }

	      let units_remaining = 2;
	
	      //
	      // internal function that allows for moving multiple units at the same 
	      // time if necessary to besiege a fort. hijacks control of this function...
	      //
	      let select_and_add_extra_armies = (units_remaining=1, select_and_add_extra_armies) => {

		//
		// find spaces with potential units
		//
	        let spaces_within_hops = paths_self.returnSpacesWithinHops(
      		  key2 ,
      		  3 ,
      		  (spacekey) => { 
		    if (paths_self.game.spaces[spacekey].activated_for_movement == 1) { 
		      for (let z = 0; z < paths_self.game.spaces[spacekey].units.length; z++) {
		        if (paths_self.game.spaces[spacekey].units[z].moved != 1) {
			  if (JSON.stringify(paths_self.game.spaces[spacekey].units[z]) !== JSON.stringify(unit)) { return 1; }
		        }
		      }
		    }
                    return 0;
		  }
    		);

		//
		// count units available
		//
		let count = 0;
		for (let z = 0; z < spaces_within_hops.length; z++) {
		  for (let i = 0; i < paths_self.game.spaces[spaces_within_hops[z]].units.length; i++) {
		    if (spaces_within_hops[z] != currentkey ||JSON.stringify(paths_self.game.spaces[spacekey].units[i]) !== JSON.stringify(unit)) {
		      let u = paths_self.game.spaces[spaces_within_hops[z]].units[i];
		      if (u.corps == 1) { count++; }
		      if (u.army == 1) { count += 100; }
		    }
		  }
		}
	        for (let z = 0; z < paths_self.game.spaces[key2].units.length; z++) {
		  let u = paths_self.game.spaces[key2].units[z];
		  if (paths_self.returnPowerOfUnit(u) == paths_self.returnPowerOfPlayer()) {
		    if (u.army) { count++; }
		  }
		}

	        if (count == 0) {
		  salert("Besieging a Fort Requires an Army: pick again");
		  if (currentkey == sourcekey) {
		    unitActionInterface(currentkey, idx, options, mainInterface, moveInterface, unitActionInterface, continueMoveInterface);
		  } else {
	            continueMoveInterface(sourcekey, currentkey, idx, options, mainInterface, moveInterface, unitActionInterface, continueMoveInterface);
		  }
		  return;
		}

		paths_self.playerSelectUnitWithFilter(
		  "Select Unit to Help Besiege" ,
		  (spacekey, unit) => {
		    if (paths_self.game.spaces[spacekey].activated_for_movement) { 
		      if (unit.name != paths_self.game.spaces[sourcekey].units[idx].name) { return 1; }
		    }
		    return 0;
		  } ,
		  (bspacekey, bunit_idx) => {

		    let unit = paths_self.game.spaces[bspacekey].units[bunit_idx];
		    if (unit.army) { units_remaining = 0; }
		    if (unit.corps) { units_remaining--; }

              	    paths_self.moveUnit(bspacekey, bunit_idx, key2);
	      	    paths_self.addMove(`move\t${faction}\t${bspacekey}\t${bunit_idx}\t${key2}\t${paths_self.game.player}`);
              	    paths_self.displaySpace(key2);
              	    paths_self.displaySpace(bspacekey);

		    if (units_remaining > 0) {

		      select_and_add_extra_armies(units_remaining, select_and_add_extra_armies);

		    } else {

              	      paths_self.moveUnit(currentkey, idx, key2);
              	      paths_self.game.spaces[key2].control = paths_self.returnPowerOfPlayer();
	      	      paths_self.game.spaces[key2].units[paths_self.game.spaces[key2].units.length-1].moved = 1;
	      	      paths_self.prependMove(`move\t${faction}\t${currentkey}\t${idx}\t${key2}\t${paths_self.game.player}`);
              	      paths_self.displaySpace(sourcekey);
              	      paths_self.displaySpace(currentkey);
                      paths_self.displaySpace(key2);
	      	      let mint = false;


	              //
          	      // check if no longer besieged?
          	      //
     		      if (paths_self.game.spaces[currentkey].fort > 0) {
     		        if (paths_self.game.spaces[currentkey].units.length > 0) {
      		        } else {
      		          paths_self.game.spaces[currentkey].besieged = 0;
      		            //
      		            // control switches back to original owner of fort
      		            //
      		            let spc = paths_self.returnSpaces();
      		            paths_self.game.spaces[currentkey].control = spc[currentkey].control;
			    paths_self.displaySpace(currentkey);
      		        }
      		      }


	              for (let z = 0; z < paths_self.game.spaces[sourcekey].units.length; z++) {
	                if (paths_self.game.spaces[sourcekey].units[z].moved != 1) { mint = true; }
	              }

	              if (mint) {
	                moveInterface(sourcekey, options, mainInterface, moveInterface, unitActionInterface, continueMoveInterface);
	              } else {
	                mainInterface(options, mainInterface, moveInterface, unitActionInterface, continueMoveInterface);
	              }

		    }

		  } ,
		  () => {
		    alert("reload to restart please");
		  }
	        );

		return;


	      }

	      //
	      // besiege fort? enter sub-function to move all necessary units
	      //
	      if (is_the_destination_a_fort == true && is_the_unit_an_army == false) {
		let do_i_have_an_army_already_there = false;
	        for (let z = 0; z < paths_self.game.spaces[key2].units.length; z++) {
		  if (paths_self.game.spaces[key].units[0].army == true) {
		    if (paths_self.returnPowerOfUnit(paths_self.game.spaces[key2].units[0]) == paths_self.returnFactionOfPlayer()) {
		      do_i_have_an_army_already_there = true;
		    }
		  }
		}
		if (do_i_have_an_army_already_there == false) {
		  select_and_add_extra_armies((paths_self.game.spaces[key2].fort-1), select_and_add_extra_armies);
		  return;
		}
	      }

	      //
	      // if the movement is only 1 space, the user may be trying to control
	      // the exact path through the unit moves in order to more precisely
	      // control which spaces switch to Allied or Central control...
	      //
	      let is_one_hop_move = false;
	      if (paths_self.game.spaces[currentkey].neighbours.includes(key2)) { is_one_hop_move = true; }


	      //
	      // code mirrored above inside besiege section
	      //
              paths_self.moveUnit(currentkey, idx, key2);
              paths_self.game.spaces[key2].control = paths_self.returnPowerOfPlayer();
	      paths_self.game.spaces[key2].units[paths_self.game.spaces[key2].units.length-1].moved = 1;
	      paths_self.prependMove(`move\t${faction}\t${currentkey}\t${idx}\t${key2}\t${paths_self.game.player}`);
              paths_self.displaySpace(sourcekey);
              paths_self.displaySpace(currentkey);
              paths_self.displaySpace(key2);
	      let mint = false;
	      for (let z = 0; z < paths_self.game.spaces[sourcekey].units.length; z++) {
	        if (paths_self.game.spaces[sourcekey].units[z].moved != 1) { mint = true; }
	      }

	              //
          	      // check if no longer besieged?
          	      //
     		      if (paths_self.game.spaces[currentkey].fort > 0) {
console.log("AAA 1: is fort");
     		        if (paths_self.game.spaces[currentkey].units.length > 0) {
console.log("AAA 2: no units");
      		        } else {
      		          paths_self.game.spaces[currentkey].besieged = 0;
      		            //
      		            // control switches back to original owner of fort
      		            //
      		            let spc = paths_self.returnSpaces();
      		            paths_self.game.spaces[currentkey].control = spc[currentkey].control;
console.log("updating to: " + spc[currentkey].control);
			    paths_self.displaySpace(currentkey);

      		        }
      		      }

	      //
	      // continue
	      //
	      active_unit_moves--;

	      if (is_one_hop_move && active_unit_moves > 0) {
	        continueMoveInterface(sourcekey, key2, idx, options, mainInterface, moveInterface, unitActionInterface, continueMoveInterface);
	      } else {
	        if (mint) {
	          moveInterface(sourcekey, options, mainInterface, moveInterface, unitActionInterface, continueMoveInterface);
	        } else {
	          mainInterface(options, mainInterface, moveInterface, unitActionInterface, continueMoveInterface);
	        }
	      }
	    },
	    null ,
	    true ,
	    [{ key : "skip" , value : "finish movement" }] ,
	  );
      

    }

    let moveInterface = function(key, options, mainInterface, moveInterface, unitActionInterface, continueMoveInterface) {

      let units = [];

console.log("SPACEKEY: " + key);
console.log("SPACES: " + JSON.stringify(paths_self.game.spaces[key].units));

      for (let z = 0; z < paths_self.game.spaces[key].units.length; z++) {
	if (paths_self.game.spaces[key].units[z].moved != 1) {
	  units.push(z);
	}
      }

      if (units.length == 1) {

	let unit = paths_self.game.spaces[key].units[units[0]];
	paths_self.game.spaces[key].units[units[0]].moved = 1;
        unitActionInterface(key, units[0], options, mainInterface, moveInterface, unitActionInterface, continueMoveInterface);

      } else {

        paths_self.playerSelectOptionWithFilter(
	  "Which Unit?",
	  units,
	  (idx) => {
	    let unit = paths_self.game.spaces[key].units[idx];
	    return `<li class="option" id="${idx}">${unit.name} / ${unit.movement}</li>`;
	  },
	  (idx) => {
	    let unit = paths_self.game.spaces[key].units[idx];
	    paths_self.game.spaces[key].units[idx].moved = 1;
            unitActionInterface(key, idx, options, mainInterface, moveInterface, unitActionInterface, continueMoveInterface);
	  },
          false
        );

      }

    }

    mainInterface(options, mainInterface, moveInterface, unitActionInterface, continueMoveInterface);

  }

  playerPlayOps(faction, card, cost, skipend=0) {

    this.addMove(`record\t${faction}\t${this.game.state.round}\tops`);

    if (!skipend) {
      this.addMove("player_play_combat\t"+faction);
      this.addMove("dig_trenches");
      this.addMove("player_play_movement\t"+faction);
    }

    let targets = this.returnNumberOfSpacesWithFilter((key) => {
      if (cost < this.returnActivationCost(faction, key)) { return 0; }
      let space = this.game.spaces[key];
      if (space.activated_for_combat == 1) { return 0; }
      if (space.activated_for_movement == 1) { return 0; }
      for (let i = 0; i < space.units.length; i++) {
        return 1;
      }
      return 0;
    });

    //
    // hide any popup
    //
    this.cardbox.hide();

    let html = `<ul>`;
    if (targets > 0) {
      html    += `<li class="card" id="movement">activate for movement</li>`;
    }
    if (targets > 0) {
      html    += `<li class="card" id="combat">activate for combat</li>`;
    }
    html    += `<li class="card" id="end">skip remaining ops...</li>`;
    html    += `</ul>`;

    this.bindBackButtonFunction(() => { 
      for (let key in this.game.spaces) { if (this.game.spaces[key].activated_for_movement == 1 || this.game.spaces[key].activated_for_combat == 1) { this.game.spaces[key].activated_for_movement = 0; this.game.spaces[key].activated_for_combat = 0; this.displaySpace(key)} } 
      this.moves = [];
      if (this.game.queue[this.game.queue.length-1].split("\t")[0] == "play") {
        this.addMove("resolve\tplay");
      }
      this.playerPlayCard(faction, card);
    });
    this.updateStatusWithOptions(`You have ${cost} OPS remaining`, html, true);
    this.attachCardboxEvents((action) => {

      if (action === "end") {
	this.updateStatus("ending turn");
	this.endTurn();
      }

      let movement_fnct = (movement_fnct) => {
	this.playerSelectSpaceWithFilter(
	  `Select Space to Activate (${cost} ops):`,
	  (key) => {
	    if (cost < this.returnActivationCost(faction, key)) { return 0; }
	    let space = this.game.spaces[key];
	    if (space.activated_for_combat == 1) { return 0; }
	    if (space.activated_for_movement == 1) { return 0; }
	    for (let i = 0; i < space.units.length; i++) {
	      if (this.returnPowerOfUnit(space.units[i]) === faction) {
	        return 1;
	      }
	    }
	    return 0;
	  },
	  (key) => {
	    this.updateStatus("activating...");
	    this.activateSpaceForMovement(key);
            this.displaySpace(key);
	    let cost_paid = this.returnActivationCost(faction, key); 
	    cost -= cost_paid;
	    this.addMove(`activate_for_movement\t${faction}\t${key}`);
	    if (cost <= 0) {
	      cost = 0;
	      this.endTurn();
	    }
	    if (cost > 0) {
	      this.removeSelectable();
	      movement_fnct(movement_fnct);
	      this.playerPlayOps(faction, card, cost, 1);
	      return;
	    }
	  },
	  null,
	  true,
	);
      }
 
      let combat_fnct = (combat_fnct) => {
	this.playerSelectSpaceWithFilter(
	  `Select Space to Activate (${cost} ops):`,
	  (key) => {
	    let space = this.game.spaces[key];
	    if (space.activated_for_movement == 1) { return 0; }
	    if (space.activated_for_combat == 1) { return 0; }
	    for (let i = 0; i < space.units.length; i++) {
	      if (this.returnPowerOfUnit(space.units[i]) === faction) {
	        return 1;
	      }
	    }
	    return 0;
	  },
	  (key) => {
	    this.updateStatus("activating...");
	    this.activateSpaceForCombat(key);
	    let cost_paid = this.returnActivationCost(faction, key); 
	    cost -= cost_paid;
	    this.addMove(`activate_for_combat\t${faction}\t${key}`);
	    if (cost <= 0) {
	      cost = 0;
	      this.endTurn();
	    }
	    if (cost > 0) {
	      this.removeSelectable();
	      combat_fnct(combat_fnct);
	      this.playerPlayOps(faction, card, cost, 1);
	      return;
	    }
	  },
	  null,
	  true,
	);
      }

      if (action === "movement") {
	//
	// select valid space to activate
	//
	this.removeSelectable();
	movement_fnct(movement_fnct);
      }

      if (action === "combat") {
	//
	// select valid space to activate
	//
	this.removeSelectable();
	combat_fnct(combat_fnct);
      }

    });

  }

  playerPlayReplacementPoints(faction, card) {

    let c = this.deck[card];

    //
    // hide any popup
    //
    this.cardbox.hide();

    //
    //
    //
    this.updateStatus("adding replacement points...");
    this.addMove(`rp\t${faction}\t${card}`);
    this.addMove(`record\t${faction}\t${this.game.state.round}\trp`);
    this.endTurn();

  }

  playerSelectOptionWithFilter(msg, opts, filter_func, mycallback, cancel_func = null, board_blickable = false) {

    let paths_self = this;

    let html = '<ul>';
    for (let i = 0; i < opts.length; i++) { html += filter_func(opts[i]); }
    html += '</ul>';

    this.updateStatusWithOptions(msg, html);
    $('.option').off();
    $('.option').on('click', function () {
      let action = $(this).attr("id");
      $('.option').off();
      paths_self.updateStatus("acknowledge...");
      mycallback(action);
    });

  }

  countSpacesWithFilter(filter_func) {

    let paths_self = this;
    let count = 0;

    for (let key in this.game.spaces) {
      if (filter_func(key) == 1) { 
	count++;
      }
    }

    return count;
  }

  countUnitsWithFilter(filter_func) {

    let paths_self = this;
    let count = 0;

    for (let key in this.game.spaces) {
      for (let z = 0; z < this.game.spaces[key].units.length; z++) {
        if (filter_func(key, this.game.spaces[key].units[z]) == 1) {
	  count++;
	}
      }
    }

    return count;

  }


  playerSelectUnitWithFilter(msg, filter_func, mycallback = null, cancel_func = null, board_clickable=false, extra_options=[]) {

    let paths_self = this;
    let callback_run = false;
    let at_least_one_option = false;
    let html = '';
    html += '<ul class="hide-scrollbar">';

    $('.trench-tile').off();
    $('.army-tile').off();
    $('.space').off();

    this.zoom_overlay.spaces_onclick_callback = mycallback;

    for (let key in this.game.spaces) {
      let at_least_one_eligible_unit_in_spacekey = false;
      for (let z = 0; z < this.game.spaces[key].units.length; z++) {
        if (filter_func(key, this.game.spaces[key].units[z]) == 1) {
	  at_least_one_eligible_unit_in_spacekey = true;
          at_least_one_option = true;
          html += '<li class="option .'+key+'-'+z+'" id="' + key + '-'+z+'">' + key + ' - ' + this.game.spaces[key].units[z].name + '</li>';
	}
      }
      if (at_least_one_eligible_unit_in_spacekey) {

        //
        // the spaces that are selectable are clickable on the main board (whatever board shows)
        //
        if (board_clickable) {
          let t = "."+key;
          document.querySelectorAll(t).forEach((el) => {
            paths_self.addSelectable(el);
            el.onclick = (e) => {

	      let clicked_key = e.currentTarget.id;

              e.stopPropagation();
              e.preventDefault();   // clicking on keys triggers selection -- but clicking on map will still show zoom-in
              el.onclick = () => {};

              $('.space').off();
              $('.army-tile').off();
              $('.trench-tile').off();

              paths_self.zoom_overlay.spaces_onclick_callback = null;
              paths_self.removeSelectable();

	      if (paths_self.game.spaces[clicked_key].units.length == 1) {
                if (callback_run == false) {
                  callback_run = true;
                  mycallback(clicked_key, 0);
                }
	      } else {
	        let h =  '<ul>';
		for (let z = 0; z < paths_self.game.spaces[clicked_key].units.length; z++) {
                  h += '<li class="option .'+clicked_key+'-'+z+'" id="' + clicked_key + '-'+z+'">' + clicked_key + ' - ' + this.game.spaces[clicked_key].units[z].name + '</li>';
		}
		h += '</ul>';

    		this.updateStatusWithOptions("Select Unit", h);

    		$('.option').off();
  		$('.option').on('click', function () {
  		  let action = $(this).attr("id");
  		  let tmpx = action.split("-");
  		  mycallback(tmpx[0], tmpx[1]);
  		});

	      }
            }
          });
        }
      }
    }


    if (cancel_func != null) {
      html += '<li class="option" id="cancel">cancel</li>';
    }
    if (extra_options.length > 0) {
      for (let z = 0; z < extra_options.length; z++) { html += `<li class="option ${extra_options[z].key}" id="${extra_options[z].key}">${extra_options[z].value}</li>`; }
    }
    html += '</ul>';

    this.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', function () {

      let action = $(this).attr("id");
      let tmpx = action.split("-");
      if (action == "cancel") {
        cancel_func();
        return 0;
      }

      mycallback(tmpx[0], tmpx[1]);

    });

    if (at_least_one_option) { return 1; }
    return 0;

  }

  playerSelectSpaceWithFilter(msg, filter_func, mycallback = null, cancel_func = null, board_clickable = false, extra_options=[]) {

    let paths_self = this;
    let callback_run = false;
    let at_least_one_option = false;
    let html = '';
    html += '<ul class="hide-scrollbar">';

    $('.trench-tile').off();
    $('.army-tile').off();
    $('.space').off();

    this.zoom_overlay.spaces_onclick_callback = mycallback;

    for (let key in this.game.spaces) {
      if (filter_func(key) == 1) {
        at_least_one_option = true;
        html += '<li class="option .'+key+'" id="' + key + '">' + key + '</li>';

        //
        // the spaces that are selectable are clickable on the main board (whatever board shows)
        //
        if (board_clickable) {
          let t = "."+key;
          document.querySelectorAll(t).forEach((el) => {
            paths_self.addSelectable(el);
            el.onclick = (e) => {
              e.stopPropagation();
              e.preventDefault();   // clicking on keys triggers selection -- but clicking on map will still show zoom-in
              el.onclick = () => {};
              $('.space').off();
              $('.army-tile').off();
              $('.trench-tile').off();
              paths_self.zoom_overlay.spaces_onclick_callback = null;
              paths_self.removeSelectable();
              if (callback_run == false) {
                callback_run = true;
                mycallback(key);
              }
            }
          });
        }
      }
    }
    if (cancel_func != null) {
      html += '<li class="option" id="cancel">cancel</li>';
    }
    if (extra_options.length > 0) {
      for (let z = 0; z < extra_options.length; z++) { html += `<li class="option ${extra_options[z].key}" id="${extra_options[z].key}">${extra_options[z].value}</li>`; }
    }
    html += '</ul>';

    this.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', function () {

      paths_self.updateStatus("selected...");

      //
      // and remove on-board clickability
      //
      if (board_clickable) {
        for (let key in paths_self.game.spaces) {
          if (filter_func(key) == 1) {
            let t = "."+key;
            document.querySelectorAll(t).forEach((el) => {
              el.onclick = (e) => {};
            });
          }
        }
      }

      paths_self.removeSelectable();

      $('.trench-tile').off();
      $('.army-tile').off();
      $('.space').off();

      let action = $(this).attr("id");
      if (action == "cancel") {
        cancel_func();
        return 0;
      }

      paths_self.zoom_overlay.spaces_onclick_callback = null;
      mycallback(action);

    });

    if (at_least_one_option) { return 1; }
    return 0;
  }



  playerPlayStrategicRedeployment(faction, card, value) {

    let paths_self = this;

    let spaces = this.returnSpacesWithFilter((key) => {
      if (key == "aeubox") { return 0; }
      if (key == "ceubox") { return 0; }
      if (key == "arbox") { if (this.game.player == this.returnPlayerOfFaction("allies")) { return 1; } else { return 0; } }
      if (key == "crbox") { if (this.game.player == this.returnPlayerOfFaction("central")) { return 1; } else { return 0; } }
      for (let z = 0; z < paths_self.game.spaces[key].units.length; z++) {
        let unit = paths_self.game.spaces[key].units[z];
	if (faction == paths_self.returnPowerOfUnit(unit)) {
	  if (unit.type == "corps" && value >= 1) { 
	    return 1;
	  }
	  if (unit.type == "army" && value >= 4) {
	    return 1;
	  }
	}
      }
      return 0;
    });

    //
    // hide any popup
    //
    this.cardbox.hide();

    this.addMove(`record\t${faction}\t${this.game.state.round}\tsd`);

    let msg = `Redeploy Army / Corps (${value} ops)`;
    if (value < 4) { msg = `Redeploy Corps only (${value} ops)`; }

    //
    // select box with unit
    //
    this.playerSelectSpaceWithFilter(
      msg ,
      (key) => {
	if (spaces.includes(key)) {
	  if (value == 4) { return 1; }	
	  for (let z = 0; z < paths_self.game.spaces[key].units.length; z++) {
	    if (paths_self.game.spaces[key].units[z].corps) {
	      return 1;
	    }
	  }
	}
        return 0;
      },
      (key) => {

	if (key === "end") {
	  paths_self.unbindBackButtonFunction();
	  paths_self.updateStatus("submitting...");
	  paths_self.endTurn();
	  return 1;
	}

        if (key == "crbox") {
  	  paths_self.reserves_overlay.pickUnitAndTriggerCallback("central", (idx) => {
	    let unit = paths_self.game.spaces["crbox"].units[idx];
            if (unit.type == "corps") { value -= 1; }
            if (unit.type == "army") { value -= 4; }
	    paths_self.game.spaces[key].units[idx].moved = 1;
	    paths_self.playerRedeployUnit(faction, card, value, key, idx);
	  });
	  return;
	}
        if (key == "arbox") {
  	  paths_self.reserves_overlay.pickUnitAndTriggerCallback("allies", (idx) => {
	    let unit = paths_self.game.spaces["arbox"].units[idx];
            if (unit.type == "corps") { value -= 1; }
            if (unit.type == "army") { value -= 4; }
	    paths_self.game.spaces[key].units[idx].moved = 1;
	    paths_self.playerRedeployUnit(faction, card, value, key, idx);
	  });
	  return;
	}

        let units = [];
        for (let z = 0; z < paths_self.game.spaces[key].units.length; z++) {
  	  if (paths_self.game.spaces[key].units[z].moved != 1) {
	    units.push(z);
	  }
        }

	if (units.length == 0) {
	  return 1;
	}

	if (units.length > 1) {
          paths_self.playerSelectOptionWithFilter(
	    "Redeploy Which Unit?",
	    units,
	    (idx) => {
	      let unit = paths_self.game.spaces[key].units[idx];
	      return `<li class="option" id="${idx}">${unit.name}</li>`;
	    },
	    (idx) => {
	      paths_self.unbindBackButtonFunction();
	      let unit = paths_self.game.spaces[key].units[idx];
              if (unit.type == "corps") { value -= 1; }
              if (unit.type == "army") { value -= 4; }
	      paths_self.game.spaces[key].units[idx].moved = 1;
	      paths_self.playerRedeployUnit(faction, card, value, key, idx);
	    },
            false
          );
	} else {

	  paths_self.unbindBackButtonFunction();
	
	  let unit = paths_self.game.spaces[key].units[units[0]];
          if (unit.type == "corps") { value -= 1; }
          if (unit.type == "army") { value -= 4; }
	  paths_self.game.spaces[key].units[units[0]].moved = 1;
	  paths_self.playerRedeployUnit(faction, card, value, key, units[0]);

	}
      },
      null,
      true,
      [{ key : "end" , value : "end" }] ,
    );

  }

  playerRedeployUnit(faction, card, value=0, spacekey="", unit_idx=0) {

    let paths_self = this;
    let unit = paths_self.game.spaces[spacekey].units[unit_idx];
    let controlling_faction = paths_self.returnFactionOfPlayer();

    let destinations = paths_self.returnSpacesConnectedToSpaceForStrategicRedeployment(faction, spacekey);

    this.playerSelectSpaceWithFilter(
      `Redeploy ${paths_self.game.spaces[spacekey].units[unit_idx].name}?`,
      (key) => {
	if (key == spacekey) { return 0; }
	if (spacekey == "aeubox" && (key == "crbox" || key == "ceubox" || key == "arbox")) { return 0; }
	if (spacekey == "ceubox" && (key == "crbox" || key == "arbox" || key == "aeubox")) { return 0; }
	if (spacekey == "arbox" && (key == "crbox" || key == "ceubox" || key == "aeubox")) { return 0; }
	if (spacekey == "crbox" && (key == "arbox" || key == "ceubox" || key == "aeubox")) { return 0; }
        if (key == "aeubox" || key == "ceubox" || key == "arbox" || key == "crbox") { return 1; }
        if (paths_self.game.spaces[key].control == controlling_faction) {
          if (paths_self.checkSupplyStatus(unit.ckey.toLowerCase(), key) == 1) {
            return 1;
          }
        }
	if (destinations.includes(key)) { return 1; }
        return 0;
      },
      (key) => {
	this.updateStatus("redeploying...");
        this.addMove(`sr\t${faction}\t${spacekey}\t${key}\t${unit_idx}\t${value}\t${card}`);
        this.endTurn();
      },
      null,
      true
    );

  }

  playerTurn(faction) {

    let name = this.returnPlayerName(faction);
    let hand = this.returnPlayerHand();

    //
    // you can pass once only 1 card left
    //
    if (hand.length == 1) { hand.push("pass"); this.addMove("pass\t"+faction); }
    this.addMove("resolve\tplay");

    this.game.state.player_turn_card_select = true;
    this.updateStatusAndListCards(`${name} - select card`, hand);
    this.attachCardboxEvents((card) => {

      //
      // remove "pass"
      //
      for (let z = 0; z < this.game.deck[0].hand.length; z++) {
        if (this.game.deck[0].hand[z] == "pass") { this.game.deck[0].hand.splice(z, 1); }
      }
      for (let z = 0; z < this.game.deck[1].hand.length; z++) {
        if (this.game.deck[1].hand[z] == "pass") { this.game.deck[1].hand.splice(z, 1); }
      }

      this.game.state.player_turn_card_select = false;
      this.playerPlayCard(faction, card);
    });

  }

  playerPlaceUnitInSpacekey(spacekey=[], units=[], mycallback=null) {

    let filter_fnct = (key) => { if (spacekeys.includes(key)) { return 1; } return 0; };
    let unit_idx = 0;

    let finish_fnct = (spacekey) => {
      this.addUnitToSpace(units[unit_idx], spacekey);
      this.displaySpace(spacekey);
      unit_idx++;
      if (unit_idx >= units.length) {
	if (mycallback != null) { mycallback(); }
	return 1;
      } else {
	place_unit_fnct();
      }
    }

    let place_unit_fnct = () => {

      let x = "1st";
      if (unit_idx == 1) { x = "2nd"; }
      if (unit_idx == 2) { x = "3rd"; }
      if (unit_idx == 3) { x = "4th"; }
      if (unit_idx == 4) { x = "5th"; }
      if (unit_idx == 5) { x = "6th"; }
      if (unit_idx == 6) { x = "7th"; }

      this.playerSelectSpaceWithFilter(
	`Select Space for ${this.game.units[units[unit_idx]].name} (${x} unit)`,
        filter_func ,
	finish_fnct ,
	null ,
	true
      );
    }

    if (units.length == 0) { mycallback(); return; }
    
    place_unit_fnct();

  }

  playerPlaceUnitOnBoard(country="", units=[], mycallback=null) {

    let filter_func = () => {}
    let unit_idx = 0;
    let countries = [];

    if (country == "russia") {
      countries = this.returnSpacekeysByCountry("russia");
      filter_func = (spacekey) => { 
	if (countries.includes(spacekey)) {
	  if (this.game.spaces[spacekey].control == "allies") { 
	    if (this.checkSupplyStatus("russia", spacekey)) { return 1; }
	  }
	}
	return 0;
      }
    }

    if (country == "romania") {
      countries = this.returnSpacekeysByCountry("romania");
      filter_func = (spacekey) => { 
	if (countries.includes(spacekey)) {
	  if (this.game.spaces[spacekey].control == "allies") { 
	    if (this.checkSupplyStatus("romania", spacekey)) { return 1; }
	  }
	}
	return 0;
      }
    }

    if (country == "france") {
      countries = this.returnSpacekeysByCountry("france");
      filter_func = (spacekey) => { 
	if (countries.includes(spacekey)) {
	  if (this.game.spaces[spacekey].control == "allies") { 
	    if (this.checkSupplyStatus("france", spacekey)) { return 1; }
	  }
	}
	return 0;
      }
console.log("countries: " + JSON.stringify(countries));
    }

    if (country == "germany") {
      countries = this.returnSpacekeysByCountry("germany");
console.log("GERMANY: " + JSON.stringify(countries));
      filter_func = (spacekey) => { 
	if (countries.includes(spacekey)) {
	  if (this.game.spaces[spacekey].control == "central") { 
console.log("checking: " + spacekey);
	    if (this.checkSupplyStatus("germany", spacekey)) { 
console.log("in supply!");
	      return 1; 
	    }
	  }
	}
	return 0;
      }
    }

    if (country == "austria") {
      countries = this.returnSpacekeysByCountry("austria");
      filter_func = (spacekey) => { 
	if (countries.includes(spacekey)) {
	  if (this.game.spaces[spacekey].control == "central") { 
	    if (this.checkSupplyStatus("austria", spacekey)) { return 1; }
	  }
	}
	return 0;
      }
    }



    let finish_fnct = (spacekey) => {
      this.updateStatus("placing unit...");
      this.addUnitToSpace(units[unit_idx], spacekey);
      this.addMove(`add\t${spacekey}\t${this.game.units[units[unit_idx]].key}\t${this.game.player}`);
      this.displaySpace(spacekey);
      unit_idx++;
      if (unit_idx >= units.length) {
	if (mycallback != null) { mycallback(); }
	return 1;
      } else {
	place_unit_fnct();
      }
    }

    let place_unit_fnct = () => {

      let x = "1st";
      if (unit_idx == 1) { x = "2nd"; }
      if (unit_idx == 2) { x = "3rd"; }
      if (unit_idx == 3) { x = "4th"; }
      if (unit_idx == 4) { x = "5th"; }
      if (unit_idx == 5) { x = "6th"; }
      if (unit_idx == 6) { x = "7th"; }

      this.playerSelectSpaceWithFilter(
	`Select Space for ${this.game.units[units[unit_idx]].name} (${x} unit)`,
        filter_func ,
	finish_fnct ,
	null ,
	true
      );
    }

    if (units.length == 0) { mycallback(); return; }
    
    place_unit_fnct();

  }



  returnFactionOfUnit(unit) { return this.returnPowerOfUnit(unit); }
  returnPowerOfUnit(unit) {

    try { if (!unit.ckey) { unit = this.game.units[unit]; } } catch (err) {}

    let allied = ["FR", "RU", "BR", "BE", "IT", "US", "ANA", "AUS", "BEF", "CAU", "CND", "CZL", "GR", "MEF", "MN", "NE", "OA", "POL", "PT" , "RO", "SB"];
    let central = ["GE", "AH", "TU", "BG", "AOI", "BU", "SN" , "YLD"];

    if (allied.includes(unit.ckey)) { return "allies"; }
    if (central.includes(unit.ckey)) { return "central"; }

    return "";

  }



  importUnit(key, obj) {

    if (!this.game.units) { this.game.units = {}; }

    //
    // avoid re-importing
    //
    if (this.game.units[key]) {
      if (obj.checkSupplyStatus) {
	this.game.units[key].checkSupplyStatus = obj.checkSupplyStatus;
      } else {
	this.game.units[key].checkSupplyStatus = (paths_self, spacekey) => { return 0; }
      }
      return;
    }

    obj.key = key;

    if (!obj.name)      	{ obj.name      = "Unknown"; }
    if (!obj.army)		{ obj.army 	= 0; }
    if (!obj.corps)		{ obj.corps 	= 0; }
    if (!obj.combat)		{ obj.combat 	= 5; }
    if (!obj.loss)		{ obj.loss 	= 3; }
    if (!obj.movement)		{ obj.movement 	= 3; }
    if (!obj.rcombat)		{ obj.rcombat 	= 5; }
    if (!obj.rloss)		{ obj.rloss 	= 3; }
    if (!obj.rmovement)		{ obj.rmovement = 3; }

    if (!obj.attacked)		{ obj.attacked  = 0; }
    if (!obj.moved)		{ obj.moved     = 0; }

    if (!obj.damaged)		{ obj.damaged = false; }
    if (!obj.destroyed)		{ obj.destroyed = false; }
    if (!obj.spacekey)  	{ obj.spacekey = ""; }
    if (!obj.checkSupplyStatus) { obj.checkSupplyStatus = (paths_self, spacekey) => { return 0; } };

    if (key.indexOf("army") > -1) { obj.army = 1; } else { obj.corps = 1; }

    this.game.units[key] = obj;

  }

  moveUnit(sourcekey, sourceidx, destinationkey) {
    let unit = this.game.spaces[sourcekey].units[sourceidx];
    this.game.spaces[sourcekey].units[sourceidx].moved = 1;
    this.game.spaces[sourcekey].units.splice(sourceidx, 1);
    if (!this.game.spaces[destinationkey].units) { this.game.spaces[destinationkey].units = []; }

    if (destinationkey == "aeubox" || destinationkey == "ceubox") {
      this.updateLog(unit.name + " eliminated.");
    } else {
      this.updateLog(unit.name + " moves from " + this.returnSpaceNameForLog(sourcekey) + " to " + this.returnSpaceNameForLog(destinationkey));
    }

    unit.spacekey = destinationkey;
    this.game.spaces[destinationkey].units.push(unit);
    unit.spacekey = destinationkey;
    this.displaySpace(sourcekey);
    this.displaySpace(destinationkey);
  }

  returnUnitImage(unit, just_link=false) {
    let key = unit.key;

    if (unit.destroyed) {
     return this.returnDestroyedUnitImage(unit, just_link);
    }

    if (unit.damaged) {
      if (just_link) { return `/paths/img/army/${key}_back.png`; }
      return `<img src="/paths/img/army/${key}_back.png" class="army-tile ${unit.key}" />`;
    } else {
      if (just_link) { return `/paths/img/army/${key}.png`; }
      return `<img src="/paths/img/army/${key}.png" class="army-tile ${unit.key}" />`;
    }
  }
  returnUnitBackImage(unit, just_link=false) {
    let key = unit.key;
    if (just_link) { return `/paths/img/army/${key}_back.png`; }
    return `<img src="/paths/img/army/${key}_back.png" class="army-tile ${unit.key}" />`;
  }
  returnUnitImageWithMouseoverOfStepwiseLoss(unit, just_link="", mouseout_first=false) {
    let key = unit.key;
    let face_img = "";
    let back_img = "";

    if (unit.destroyed) {
     return this.returnDestroyedUnitImage(unit, just_link);
    }

    if (unit.damaged) {
      face_img = `/paths/img/army/${key}_back.png`;
      back_img = this.returnUnitImageWithStepwiseLoss(unit, true);
    } else {
      face_img = `/paths/img/army/${key}.png`;
      back_img = `/paths/img/army/${key}_back.png`;
    }

    //
    // the workaround below is part of our strategy to prevent tiles from insta-
    // flipping once clicked on, so that mouseout is required in order to trigger
    // tiles showing their reversed side on mouseover. see /lib/ui/overlays/loss.js
    //
    if (!mouseout_first) {
      return `<img src="${face_img}" onmouseover="this.src='${back_img}'" onmouseout="this.src='${face_img}'" class="army-tile ${unit.key}" />`;
    } else {
      return `<img src="${face_img}" data-mouseover="false" onmouseover="if (this.dataset.mouseover === 'true') { this.src='${back_img}' }" onmouseout="this.dataset.mouseover = 'true'; this.src='${face_img}'" class="army-tile ${unit.key}" />`;
    }

  }
  returnUnitImageInSpaceWithIndex(spacekey, idx) {
    let unit = this.game.spaces[spacekey].units[idx];
    return this.returnUnitImage(unit);
  }
  returnDestroyedUnitImage(unit, just_link=false) {
    if (just_link) {
      return `/paths/img/cancel_x.png`;
    } else {
      return `<img src="/paths/img/cancel_x.png" class="army-tile ${unit.key}" />`;
    }

  }

  returnUnitImageWithStepwiseLoss(unit, just_link=false) {

    let key = unit.key;

    if (unit.destroyed) {
     return this.returnDestroyedUnitImage(unit, just_link);
    }

    if (!unit.damaged) {

      if (just_link) { return `/paths/img/army/${key}_back.png`; }
      return `<img src="/paths/img/army/${key}_back.png" class="army-tile ${unit.key}" />`;

    } else {

      //
      // replace with corps if destroyed
      //
      if (unit.key.indexOf('army') >= 0) {
        let corpskey = unit.key.split('_')[0] + '_corps';
        let new_unit = this.cloneUnit(corpskey);
        return this.returnUnitImage(new_unit, just_link);

      } else {

	return this.returnDestroyedUnitImage(unit, just_link);
      }

    }

    return "";
  }

  cloneUnit(unitkey) {
    return JSON.parse(JSON.stringify(this.game.units[unitkey]));
  }

  addUnitToSpace(unitkey, spacekey) {
    let unit = this.cloneUnit(unitkey);
    unit.spacekey = spacekey;
    this.game.spaces[spacekey].units.push(unit);
  }

  damageUnitInSpace(unitkey, spacekey) {
    if (!this.game.spaces[spacekey]) { return; }
    if (!this.game.spaces[spacekey].includes(unitkey)) { return; }
    for (let i = 0; i < this.game.spaces[spacekey].units.length; i++) {
      let u = this.game.spaces[spacekey].units[i];
      if (u.key === unitkey) {
	if (u.damaged == false) { u.damaged = true; }
      }
    }
  }



} // end and export

module.exports = PathsOfGlory;


