const GameTemplate = require('../../lib/templates/gametemplate');
const ZoomOverlay = require('./lib/ui/overlays/zoom');
const CombatOverlay = require('./lib/ui/overlays/combat');

const PathsRules = require('./lib/core/rules.template');
const PathsOptions = require('./lib/core/advanced-options.template');
const PathsingularOption = require('./lib/core/options.template');

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
    this.zoom_overlay = new ZoomOverlay(this.app, this); 
    this.combat_overlay = new CombatOverlay(this.app, this); 

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
    this.maxPlayers 	 = 6;

  }


  render(app) {

    if (this.browser_active == 0) { return; }

    super.render(app);

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
	  window.location.reload();	
	} else {
	  game_mod.confirm_moves = 0;
          game_mod.saveGamePreference('his_expert_mode', 1);
	  window.location.reload();	
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
	let his_self = this;
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
    this.importUnit('aoi_corps', {
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
    this.importUnit('aus_corps', {
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
      this.game.queue.push("DEAL\t1\t1\t6"); // player chooses Guns of August or extra card 

      this.game.queue.push("DECKENCRYPT\t2\t2");
      this.game.queue.push("DECKENCRYPT\t2\t1");
      this.game.queue.push("DECKXOR\t2\t2");
      this.game.queue.push("DECKXOR\t2\t1");

      this.game.queue.push("DECKENCRYPT\t1\t2");
      this.game.queue.push("DECKENCRYPT\t1\t1");
      this.game.queue.push("DECKXOR\t1\t2");
      this.game.queue.push("DECKXOR\t1\t1");

      this.game.queue.push("DECK\t1\t"+JSON.stringify(this.returnMobilizationDeck("central")));
      this.game.queue.push("DECK\t2\t"+JSON.stringify(this.returnMobilizationDeck("allies")));

    }

    //
    // all cards with events added to this.deck
    //
    this.deck = this.returnDeck("all");


    //
    // and show the board
    //
    this.displayBoard();



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




  returnMobilizationDeck(type="all") {
    let deck = {};

    if (type == "allies" || type == "all") {

      deck['ap01'] = { 
        key : 'ap01',
        img : "cards/card_ap01.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
      deck['ap02'] = { 
        key : 'ap02',
        img : "cards/card_ap02.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
      deck['ap03'] = { 
        key : 'ap03',
        img : "cards/card_ap03.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
      deck['ap04'] = { 
        key : 'ap04',
        img : "cards/card_ap04.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
      deck['ap05'] = { 
        key : 'ap05',
        img : "cards/card_ap05.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
      deck['ap06'] = { 
        key : 'ap06',
        img : "cards/card_ap06.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
      deck['ap07'] = { 
        key : 'ap07',
        img : "cards/card_ap07.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
      deck['ap08'] = { 
        key : 'ap08',
        img : "cards/card_ap08.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
      deck['ap09'] = { 
        key : 'ap09',
        img : "cards/card_ap09.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
      deck['ap10'] = { 
        key : 'ap10',
        img : "cards/card_ap10.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

    }
    if (type == "central" || type == "all") {

      deck['cp01'] = { 
        key : 'cp01',
        img : "cards/card_cp01.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
      deck['cp02'] = { 
        key : 'cp02',
        img : "cards/card_cp02.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
      deck['cp03'] = { 
        key : 'cp03',
        img : "cards/card_cp03.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
      deck['cp04'] = { 
        key : 'cp04',
        img : "cards/card_cp04.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
      deck['cp05'] = { 
        key : 'cp05',
        img : "cards/card_cp05.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
      deck['cp06'] = { 
        key : 'cp06',
        img : "cards/card_cp06.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
      deck['cp07'] = { 
        key : 'cp07',
        img : "cards/card_cp07.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
      deck['cp08'] = { 
        key : 'cp08',
        img : "cards/card_cp08.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
      deck['cp09'] = { 
        key : 'cp09',
        img : "cards/card_cp09.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
      deck['cp10'] = { 
        key : 'cp10',
        img : "cards/card_cp10.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
    }

    return deck;
  }
  returnLimitedWarDeck(type="all") {
    let deck = {};
    return deck;
  }
  returnFullWarDeck(type="all") {
    let deck = {};
    return deck;
  }
  returnDeck(type="all") {
    let a = this.returnMobilizationDeck(type);
    let b = this.returnLimitedWarDeck(type);
    let c = this.returnFullWarDeck(type);
    let d = Object.assign({}, a, b);
    let deck = Object.assign({}, d, c);

    for (let key in deck) {
      deck[key] = this.addEvents(deck[key]);
    }

    return deck;
  }




  hideOverlays() {
    this.zoom_overlay.hide();
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

    //
    // display the spaces on the board
    //
    try {
      this.displaySpaces();
    } catch (err) {
console.log("!");
console.log("!");
console.log("!");
      console.log("error displaying spaces... " + err);
    }


    //
    // add click event to gameboard for close-up / zoom UI
    //
    let xpos = 0;
    let ypos = 0;

    if (!paths_self.bound_gameboard_zoom) {

      $('.gameboard').on('mousedown', function (e) {
        if (e.currentTarget.classList.contains("space")) { return; }
        xpos = e.clientX;
        ypos = e.clientY;
      });
      $('.gameboard').on('mouseup', function (e) {
        if (Math.abs(xpos-e.clientX) > 4) { return; }
        if (Math.abs(ypos-e.clientY) > 4) { return; }
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
	//
        // nothing is selectable here, so show zoom
        paths_self.zoom_overlay.renderAtCoordinates(xpos, ypos);
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


  displaySpace(key) {

    try {

      let space = this.game.spaces[key];
      let html = "";
      let control = this.returnControlOfSpace(key);

      //
      // units / armies
      //
      for (let i = 0; i < space.units.length; i++) {
        html += this.returnUnitImage(key, i);
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

      document.querySelectorAll(`.${key}`).forEach((el) => { el.innerHTML = html; });

    } catch (err) {
    }
  }

  displaySpaceDetailedView(key) {
alert("display detailed space!");
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

    let xpos = 0;
    let ypos = 0;

    if (!paths_self.bound_gameboard_zoom) {

      $('.gameboard').on('mousedown', function (e) {
        if (e.currentTarget.classList.contains("space")) { return; }
        xpos = e.clientX;
        ypos = e.clientY;
      });
      $('.gameboard').on('mouseup', function (e) { 
        if (Math.abs(xpos-e.clientX) > 4) { return; }
        if (Math.abs(ypos-e.clientY) > 4) { return; }
	//
	// if this is a selectable space, let people select directly
	//
	// this is a total hack by the way, but it captures the embedding that happens when
	// we are clicking and the click actino is technically on the item that is INSIDE
	// the selectable DIV, like a click on a unit in a key, etc.
	//
	if (e.target.classList.contains("selectable")) {
	  // something else is handling this
	  return;
	} else {
	  let el = e.target;
	  if (el.parentNode) {
	    if (el.parentNode.classList.contains("selectable")) {
	      // something else is handling this
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
	// otherwise show zoom
        //if (e.target.classList.contains("space")) {
          paths_self.zoom_overlay.renderAtCoordinates(xpos, ypos);
	  //e.stopPropagation();
	  //e.preventDefault();	
	  //return;
	//}
      });

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
      try {
	if (card.canEvent(this)) {
          html += `<img class="${cardclass} cancel_x" src="/paths/img/cancel_x.png" />`;
        }
      } catch (err) {}
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
      obj.handleGameLoop = function(his_self, qe, mv) { return 1; } // 1 means fall-through / no-stop
    }

    //
    // functions for convenience
    //
    if (obj.menuOptionTriggers == null) {
      obj.menuOptionTriggers = function(his_self, stage, player, faction) { return 0; }
    }
    if (obj.menuOption == null) {
      obj.menuOption = function(his_self, stage, player, faction) { return 0; }
    }
    if (obj.menuOptionActivated == null) {
      obj.menuOptionActivated = function(his_self, stage, player, faction) { return 0; }
    }

    return obj;

  }



  activateSpaceForCombat(spacekey) {
    this.game.spaces[spacekey].activated_for_combat = 1;
    this.displaySpace(spacekey);
  }

  activateSpaceForMovement(spacekey) {
    this.game.spaces[spacekey].activated_for_movement = 1;
    this.displaySpace(spacekey);
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

  returnControlOfSpace(key) {
    let space = this.game.spaces[key];
    if (space.control) { return space.control; }
    if (space.units.length > 0) {
      return this.returnPowerOfUnit(space.units[0]);     
    }
    return "";
  }

  returnActivationCost(key) {

    let space = this.game.spaces[key];
    let units = [];
    for (let i = 0; i < space.units.length; i++) {
      if (!units.includes(space.units[i].ckey)) {
	units.push(space.units[i].ckey);
      }
    }

    if (units.length == 1) { return 1; }
    if (units.length == 2) { return 2; }
    if (units.length == 3) { return 3; }

    return 100;

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

  returnHopsToDestination(source, destination) {
    try { if (this.game.spaces[source]) { destination = this.game.spaces[source]; } } catch (err) {}
    return this.returnHopsBetweenSpacesWithFilter(source, function(spacekey) {
      if (spacekey === destination.key) { return 1; }
      return 0;  
    });
  }

  returnHopsBetweenSpacesWithFilter(space, filter_func) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    let his_self = this;
    let map = {};
    let sources = [];
    let hop = 0;

    let addHop = function(sources, hop) {

      hop++;
      
      let new_neighbours = [];

      for (let i = 0; i < sources.length; i++) {
	for (let z = 0; z < his_self.game.spaces[sources[i]].neighbours.length; z++) {
	  let sourcekey = his_self.game.spaces[sources[i]].neighbours[z];
	  if (!map[sourcekey]) {
	    map[sourcekey] = 1;
	    new_neighbours.push(sourcekey);

	    //
	    // if we have a hit, it's this many hops!
	    //
	    if (filter_func(sourcekey)) { return hop; }
	  }
	}
      }

      if (new_neighbours.length > 0) {
	return addHop(new_neighbours, hop);
      } else {
	return 0;
      }

    }

    return addHop(space.neighbours, 0);   

  }

  returnSpaces() {

    let spaces = {};

spaces['london'] = {
    name: "London" ,
    top: 1036 ,
    left: 316 , 
   }

spaces['calais'] = {
    name: "Calais" ,
    top: 1135 ,
    left: 542 , 
   }

spaces['amiens'] = {
    name: "Amiens" ,
    top: 1263 ,
    left: 575 , 
   }

spaces['cambral'] = {
    name: "Cambral" ,
    top: 1264 ,
    left: 702 , 
   }

spaces['sedan'] = {
    name: "Sedan" ,
    top: 1260 ,
    left: 843 , 
   }

spaces['verdun'] = {
    name: "Verdun" ,
    top: 1354 ,
    left: 942 , 
   }

spaces['chateauthierry'] = {
    name: "Chateau Thierry" ,
    top: 1405 ,
    left: 780 , 
   }



spaces['paris'] = {
    name: "Paris" ,
    top: 1420 ,
    left: 621 , 
   }

spaces['rouen'] = {
    name: "Rouen" ,
    top: 1380 ,
    left: 480 , 
   }

spaces['lehavre'] = {
    name: "Le Havre" ,
    top: 1311 ,
    left: 363 , 
   }

spaces['cherbourg'] = {
    name: "Cherbourg" ,
    top: 1304 ,
    left: 159 , 
   }

spaces['barleduc'] = {
    name: "Bar le Duc" ,
    top: 1525 ,
    left: 885 , 
   }

spaces['caen'] = {
    name: "Caen" ,
    top: 1413 ,
    left: 249 , 
   }

spaces['rennes'] = {
    name: "Rennes" ,
    top: 1533 ,
    left: 171 , 
   }



spaces['lemans'] = {
    name: "Le Mans" ,
    top: 1522 ,
    left: 362 , 
   }

spaces['orleans'] = {
    name: "Orleans" ,
    top: 1575 ,
    left: 561 , 
   }

spaces['melun'] = {
    name: "Melun" ,
    top: 1551 ,
    left: 724 , 
   }

spaces['nancy'] = {
    name: "Nancy" ,
    top: 1490 ,
    left: 1011 , 
   }

spaces['nantes'] = {
    name: "Nantes" ,
    top: 1663 ,
    left: 157 , 
   }

spaces['tours'] = {
    name: "Tours" ,
    top: 1646 ,
    left: 414 , 
   }

spaces['larochelle'] = {
    name: "La Rochelle" ,
    top: 1814 ,
    left: 236 , 
   }



spaces['bordeaux'] = {
    name: "Bordeaux" ,
    top: 1986 ,
    left: 274 , 
   }

spaces['poitiers'] = {
    name: "Poitiers" ,
    top: 1790 ,
    left: 405 , 
   }

spaces['stamand'] = {
    name: "St. Amand" ,
    top: 1743 ,
    left: 598 , 
   }

spaces['nevers'] = {
    name: "Nevers" ,
    top: 1721 ,
    left: 757 , 
   }

spaces['dijon'] = {
    name: "Dijon" ,
    top: 1701 ,
    left: 936 , 
   }

spaces['lyon'] = {
    name: "Lyon" ,
    top: 1883 ,
    left: 869 , 
   }

spaces['avignon'] = {
    name: "Avignon" ,
    top: 2058 ,
    left: 824 , 
   }



spaces['marseilles'] = {
    name: "Marseilles" ,
    top: 2232 ,
    left: 912 , 
   }

spaces['nice'] = {
    name: "Nice" ,
    top: 2199 ,
    left: 1077 , 
   }

spaces['grenoble'] = {
    name: "Grenoble" ,
    top: 1944 ,
    left: 1009 , 
   }

spaces['belfort'] = {
    name: "Belfort" ,
    top: 1635 ,
    left: 1072 , 
   }

spaces['ostend'] = {
    name: "Ostend" ,
    top: 1048 ,
    left: 663 , 
   }

spaces['antwerp'] = {
    name: "Antwerp" ,
    top: 1002 ,
    left: 858 , 
   }

spaces['brussels'] = {
    name: "Brussels" ,
    top: 1132 ,
    left: 788 , 
   }



spaces['liege'] = {
    name: "Liege" ,
    top: 1144 ,
    left: 951 , 
   }

spaces['wilhelmshaven'] = {
    name: "Wilhelmshaven" ,
    top: 690 ,
    left: 1222 , 
   }

spaces['essen'] = {
    name: "Essen" ,
    top: 991 ,
    left: 1160 , 
   }

spaces['aachen'] = {
    name: "Aachen" ,
    top: 1024 ,
    left: 1018 , 
   }

spaces['koblenz'] = {
    name: "Koblenz" ,
    top: 1162 ,
    left: 1101 , 
   }

spaces['metz'] = {
    name: "Metz" ,
    top: 1307 ,
    left: 1107 , 
   }

spaces['strasbourg'] = {
    name: "Strasbourg" ,
    top: 1448 ,
    left: 1184 , 
   }



spaces['mulhouse'] = {
    name: "Mulhouse" ,
    top: 1601 ,
    left: 1214 , 
   }

spaces['stuttgart'] = {
    name: "Stuttgart" ,
    top: 1429 ,
    left: 1342 , 
   }

spaces['mannheim'] = {
    name: "Mannheim" ,
    top: 1322 ,
    left: 1256 , 
   }

spaces['frankfurt'] = {
    name: "Frankfurt" ,
    top: 1164 ,
    left: 1252 , 
   }

spaces['kassel'] = {
    name: "Kassel" ,
    top: 1006 ,
    left: 1352 , 
   }

spaces['bremen'] = {
    name: "Bremen" ,
    top: 828 ,
    left: 1299 , 
   }

spaces['kiel'] = {
    name: "Kiel" ,
    top: 618 ,
    left: 1431 , 
   }



spaces['hamburg'] = {
    name: "Hamburg" ,
    top: 759 ,
    left: 1431 , 
   }

spaces['hannover'] = {
    name: "Hannover" ,
    top: 922 ,
    left: 1549 , 
   }

spaces['erfurt'] = {
    name: "Erfurt" ,
    top: 1183 ,
    left: 1527 , 
   }

spaces['nuremberg'] = {
    name: "Nuremberg" ,
    top: 1329 ,
    left: 1529 , 
   }

spaces['augsburg'] = {
    name: "Augsburg" ,
    top: 1456 ,
    left: 1482 , 
   }

spaces['munich'] = {
    name: "Munich" ,
    top: 1506 ,
    left: 1607 , 
   }

spaces['regensburg'] = {
    name: "Regensburg" ,
    top: 1390 ,
    left: 1659 , 
   }



spaces['leipzig'] = {
    name: "Leipzig" ,
    top: 1062 ,
    left: 1675 , 
   }

spaces['berlin'] = {
    name: "Berlin" ,
    top: 871 ,
    left: 1761 , 
   }

spaces['rostock'] = {
    name: "Rostock" ,
    top: 656 ,
    left: 1638 , 
   }

spaces['stettin'] = {
    name: "Stettin" ,
    top: 687 ,
    left: 1911 , 
   }

spaces['cottbus'] = {
    name: "Cottbus" ,
    top: 974 ,
    left: 1911 , 
   }

spaces['dresden'] = {
    name: "Dresden" ,
    top: 1094 ,
    left: 1806 , 
   }

spaces['breslau'] = {
    name: "Breslau" ,
    top: 1091 ,
    left: 2157 , 
   }



spaces['oppeln'] = {
    name: "Oppeln" ,
    top: 1146 ,
    left: 2314 , 
   }

spaces['posen'] = {
    name: "Posen" ,
    top: 904 ,
    left: 2151 , 
   }

spaces['kolberg'] = {
    name: "Kolberg" ,
    top: 632 ,
    left: 2115 , 
   }

spaces['thorn'] = {
    name: "Thorn" ,
    top: 767 ,
    left: 2248 , 
   }

spaces['danzig'] = {
    name: "Danzig" ,
    top: 609 ,
    left: 2332 , 
   }

spaces['konigsberg'] = {
    name: "Konigsberg" ,
    top: 549 ,
    left: 2514 , 
   }

spaces['tannenberg'] = {
    name: "Tannenberg" ,
    top: 717 ,
    left: 2507 , 
   }



spaces['insterberg'] = {
    name: "Insterberg" ,
    top: 636 ,
    left: 2666 , 
   }

spaces['memel'] = {
    name: "Memel" ,
    top: 422 ,
    left: 2614 , 
   }

spaces['mulhouse'] = {
    name: "Mulhouse" ,
    top: 1600 ,
    left: 1214 , 
   }

spaces['turin'] = {
    name: "Turin" ,
    top: 1966 ,
    left: 1161 , 
   }

spaces['milan'] = {
    name: "Milan" ,
    top: 1910 ,
    left: 1324 , 
   }

spaces['genoa'] = {
    name: "Genoa" ,
    top: 2068 ,
    left: 1301 , 
   }

spaces['verona'] = {
    name: "Verona" ,
    top: 1915 ,
    left: 1505 , 
   }



spaces['asiago'] = {
    name: "Asiago" ,
    top: 1788 ,
    left: 1619 , 
   }

spaces['maggiore'] = {
    name: "Maggiore" ,
    top: 1764 ,
    left: 1747 , 
   }

spaces['udine'] = {
    name: "Udine" ,
    top: 1883 ,
    left: 1767 , 
   }

spaces['venice'] = {
    name: "Venice" ,
    top: 1937 ,
    left: 1649 , 
   }

spaces['bologna'] = {
    name: "Bologna" ,
    top: 2034 ,
    left: 1545 , 
   }

spaces['florence'] = {
    name: "Florence" ,
    top: 2163 ,
    left: 1536 , 
   }

spaces['ravenna'] = {
    name: "Ravenna" ,
    top: 2121 ,
    left: 1688 , 
   }



spaces['ancona'] = {
    name: "Ancona" ,
    top: 2243 ,
    left: 1800 , 
   }

spaces['viterbo'] = {
    name: "Viterbo" ,
    top: 2307 ,
    left: 1626 , 
   }

spaces['rome'] = {
    name: "Rome" ,
    top: 2431 ,
    left: 1680 , 
   }

spaces['pescara'] = {
    name: "Pescara" ,
    top: 2381 ,
    left: 1864 , 
   }

spaces['naples'] = {
    name: "Naples" ,
    top: 2585 ,
    left: 1869 , 
   }

spaces['foggia'] = {
    name: "Foggia" ,
    top: 2526 ,
    left: 2031 , 
   }

spaces['taranto'] = {
    name: "Taranto" ,
    top: 2646 ,
    left: 2179 , 
   }



spaces['prague'] = {
    name: "Prague" ,
    top: 1235 ,
    left: 1884 , 
   }

spaces['trent'] = {
    name: "Trent" ,
    top: 1742 ,
    left: 1450 , 
   }

spaces['innsbruck'] = {
    name: "Innsbruck" ,
    top: 1655 ,
    left: 1570 , 
   }

spaces['spittal'] = {
    name: "Spittal" ,
    top: 1635 ,
    left: 1725 , 
   }

spaces['linz'] = {
    name: "Linz" ,
    top: 1527 ,
    left: 1847 , 
   }

spaces['villach'] = {
    name: "Villach" ,
    top: 1723 ,
    left: 1870 , 
   }

spaces['trieste'] = {
    name: "Trieste" ,
    top: 1890 ,
    left: 1898 , 
   }



spaces['kolin'] = {
    name: "Kolin" ,
    top: 1308 ,
    left: 2011 , 
   }

spaces['brun'] = {
    name: "Brun" ,
    top: 1380 ,
    left: 2130 , 
   }

spaces['vienna'] = {
    name: "Vienna" ,
    top: 1517 ,
    left: 2089 , 
   }

spaces['graz'] = {
    name: "Graz" ,
    top: 1681 ,
    left: 1998 , 
   }

spaces['zagreb'] = {
    name: "Zagreb" ,
    top: 1866 ,
    left: 2052 , 
   }

spaces['banjaluka'] = {
    name: "Banja Luka" ,
    top: 2018 ,
    left: 2184 , 
   }

spaces['mostar'] = {
    name: "Mostar" ,
    top: 2233 ,
    left: 2169 , 
   }



spaces['sarajevo'] = {
    name: "Sarajevo" ,
    top: 2137 ,
    left: 2320 , 
   }

spaces['pecs'] = {
    name: "Pecs" ,
    top: 1833 ,
    left: 2299 , 
   }

spaces['olmutz'] = {
    name: "Olmutz" ,
    top: 1275 ,
    left: 2261 , 
   }

spaces['martin'] = {
    name: "Martin" ,
    top: 1428 ,
    left: 2331 , 
   }

spaces['budapest'] = {
    name: "Budapest" ,
    top: 1613 ,
    left: 2392 , 
   }

spaces['szeged'] = {
    name: "Szeged" ,
    top: 1769 ,
    left: 2492 , 
   }

spaces['novisad'] = {
    name: "Novi Sad" ,
    top: 1926 ,
    left: 2452 , 
   }



spaces['timisvar'] = {
    name: "Timisvar" ,
    top: 1878 ,
    left: 2628 , 
   }

spaces['debrecen'] = {
    name: "Debrecen" ,
    top: 1611 ,
    left: 2666 , 
   }

spaces['miskolcz'] = {
    name: "Miskolcz" ,
    top: 1496 ,
    left: 2523 , 
   }

spaces['cracow'] = {
    name: "Cracow" ,
    top: 1249 ,
    left: 2460 , 
   }

spaces['tarnow'] = {
    name: "Tarnow" ,
    top: 1251 ,
    left: 2620 , 
   }

spaces['gorlice'] = {
    name: "Gorlice" ,
    top: 1374 ,
    left: 2574 , 
   }

spaces['przemysl'] = {
    name: "Przemysl" ,
    top: 1251 ,
    left: 2778 , 
   }



spaces['uzhgorod'] = {
    name: "Uzhgorod" ,
    top: 1463 ,
    left: 2727 , 
   }

spaces['lemberg'] = {
    name: "Lemberg" ,
    top: 1266 ,
    left: 2931 , 
   }

spaces['stanislau'] = {
    name: "Stanislau" ,
    top: 1426 ,
    left: 2897 , 
   }

spaces['munkacs'] = {
    name: "Munkacs" ,
    top: 1560 ,
    left: 2886 , 
   }

spaces['cluj'] = {
    name: "Cluj" ,
    top: 1685 ,
    left: 2854 , 
   }

spaces['hermannstadt'] = {
    name: "Hermannstadt" ,
    top: 1842 ,
    left: 2850 , 
   }

spaces['kronstadt'] = {
    name: "Kronstadt" ,
    top: 1838 ,
    left: 3004 , 
   }



spaces['schossburg'] = {
    name: "Schossburg" ,
    top: 1710 ,
    left: 3004 , 
   }

spaces['czernowitz'] = {
    name: "Czernowitz" ,
    top: 1524 ,
    left: 3048 , 
   }

spaces['tarnopol'] = {
    name: "Tarnopol" ,
    top: 1371 ,
    left: 3049 , 
   }



spaces['reval'] = {
      name: "Reval" ,
      top: 81 ,
      left: 3139 ,
    }

spaces['pskov'] = {
      name: "Pskov" ,
      top: 119 ,
      left: 3395 ,
    }

spaces['petrograd'] = {
      name: "Petrograd" ,
      top: 82 ,
      left: 3610 ,
    }

spaces['riga'] = {
      name: "Riga" ,
      top: 240 ,
      left: 2921 ,
    }

spaces['libau'] = {
      name: "Libau" ,
      top: 284 ,
      left: 2617 ,
    }


spaces['szawli'] = {
      name: "Szawli" ,
      top: 360 ,
      left: 2779 ,
    }


spaces['dvinsk'] = {
      name: "Dvinsk" ,
      top: 402 ,
      left: 3185 ,
    }




spaces['opochka'] = {
      name: "Opochka" ,
      top: 301 ,
      left: 3408 ,
    }


spaces['velikiyeluki'] = {
      name: "Velikiye Luki" ,
      top: 298 ,
      left: 3592 ,
    }

spaces['kovno'] = {
      name: "Kovno" ,
      top: 534 ,
      left: 2807 ,
    }



spaces['vilna'] = {
      name: "Vilna" ,
      top: 527 ,
      left: 2970 ,
    }

spaces['moldechno'] = {
      name: "Moldechno" ,
      top: 594 ,
      left: 3143 ,
    }

spaces['polotsk'] = {
      name: "Polotsk" ,
      top: 517 ,
      left: 3375 ,
    }

spaces['vitebsk'] = {
      name: "Vitebsk" ,
      top: 473 ,
      left: 3592 ,
    }

spaces['grodno'] = {
      name: "Grodno" ,
      top: 683 ,
      left: 2881 ,
    }

spaces['baranovichi'] = {
      name: "Baranovichi" ,
      top: 737 ,
      left: 3123 ,
    }

spaces['minsk'] = {
      name: "Minsk" ,
      top: 689 ,
      left: 3314 ,
    }

spaces['orsha'] = {
      name: "Orsha" ,
      top: 588 ,
      left: 3592 ,
    }

spaces['smolensk'] = {
      name: "Smolensk" ,
      top: 563 ,
      left: 3788 ,
    }

spaces['moscow'] = {
      name: "Moscow" ,
      top: 514 ,
      left: 3946 ,
    }

spaces['lomza'] = {
      name: "Lomza" ,
      top: 786 ,
      left: 2707 ,
    }

spaces['bialystok'] = {
      name: "Bialystok" ,
      top: 819 ,
      left: 2942 ,
    }

spaces['pinsk'] = {
      name: "Pinsk" ,
      top: 881 ,
      left: 3073 ,
    }

spaces['sarny'] = {
      name: "Sarny" ,
      top: 966 ,
      left: 3218 ,
    }

spaces['slutsk'] = {
      name: "Slutsk" ,
      top: 832 ,
      left: 3395 ,
    }

spaces['mogilev'] = {
      name: "Mogilev" ,
      top: 702 ,
      left: 3602 ,
    }

spaces['gomel'] = {
      name: "Gomel" ,
      top: 898 ,
      left: 3671 ,
    }

spaces['roslavl'] = {
      name: "Roslavl" ,
      top: 761 ,
      left: 3836 ,
    }

spaces['plock'] = {
      name: "Plock" ,
      top: 845 ,
      left: 2429 ,
    }

spaces['lodz'] = {
      name: "Lodz" ,
      top: 979 ,
      left: 2410 ,
    }

spaces['warsaw'] = {
      name: "Warsaw" ,
      top: 918 ,
      left: 2592 ,
    }

spaces['brestlitovsk'] = {
      name: "Brest Litovsk" ,
      top: 934 ,
      left: 2828 ,
    }

spaces['kovel'] = {
      name: "Kovel" ,
      top: 1009 ,
      left: 3008 ,
    }

spaces['mozyr'] = {
      name: "Mozyr" ,
      top: 1011 ,
      left: 3475 ,
    }

spaces['chernigov'] = {
      name: "Chernigov" ,
      top: 1051 ,
      left: 3700 ,
    }

spaces['czestochowa'] = {
      name: "Czestochowa" ,
      top: 1124 ,
      left: 2498 ,
    }

spaces['ivangorod'] = {
      name: "Ivangorod" ,
      top: 1102 ,
      left: 2648 ,
    }

spaces['lublin'] = {
      name: "Lublin" ,
      top: 1098 ,
      left: 2853 ,
    }

spaces['lutsk'] = {
      name: "Lutsk" ,
      top: 1144 ,
      left: 3065 ,
    }



spaces['rovno'] = {
      name: "Rovno" ,
      top: 1118 ,
      left: 3281 ,
    }

spaces['dubno'] = {
      name: "Dubno" ,
      top: 1252 ,
      left: 3189 ,
    }

spaces['zhitomir'] = {
      name: "Zhitomir" ,
      top: 1182 ,
      left: 3439 ,
    }

spaces['kiev'] = {
      name: "Kiev" ,
      top: 1188 ,
      left: 3614 ,
    }

spaces['kharkov'] = {
      name: "Kharkov" ,
      top: 1183 ,
      left: 3948 ,
    }

spaces['kamenetspodolski'] = {
      name: "Kamenets Podolski" ,
      top: 1440 ,
      left: 3196 ,
    }

spaces['vinnitsa'] = {
      name: "Vinnitsa" ,
      top: 1373 ,
      left: 3404 ,
    }



spaces['belayatserkov'] = {
      name: "Belaya Tserkov" ,
      top: 1364 ,
      left: 3643 ,
    }

spaces['zhmerinka'] = {
      name: "Zhmerinka" ,
      top: 1544 ,
      left: 3329 ,
    }

spaces['uman'] = {
      name: "Uman" ,
      top: 1546 ,
      left: 3646 ,
    }

spaces['Kishinev'] = {
      name: "Kishinev" ,
      top: 1692 ,
      left: 3444 ,
    }

spaces['caucasus'] = {
      name: "Caucasus" ,
      top: 1608 ,
      left: 3947 ,
    }

spaces['ismail'] = {
      name: "Ismail" ,
      top: 1855 ,
      left: 3469 ,
    }

spaces['odessa'] = {
      name: "Odessa" ,
      top: 1756 ,
      left: 3644 ,
    }



spaces['poti'] = {
      name: "Poti" ,
      top: 1871 ,
      left: 4377 ,
    }


spaces['grozny'] = {
      name: "Grozny" ,
      top: 1882 ,
      left: 4594 ,
    }

spaces['petrovsk'] = {
      name: "Petrovsk" ,
      top: 1921 ,
      left: 4801 ,
    }

spaces['batum'] = {
      name: "Batum" ,
      top: 2038 ,
      left: 4458 ,
    }

spaces['kars'] = {
      name: "Kars" ,
      top: 2085 ,
      left: 4560 ,
    }

spaces['tbilisi'] = {
      name: "Tbilisi" ,
      top: 2035 ,
      left: 4683 ,
    }

spaces['erivan'] = {
      name: "Erivan" ,
      top: 2166 ,
      left: 4684 ,
    }


spaces['elizabethpol'] = {
      name: "Elizabethpol" ,
      top: 2119 ,
      left: 4797 ,
    }

spaces['baku'] = {
      name: "Baku" ,
      top: 2202 ,
      left: 4619 ,
    }

spaces['dilman'] = {
      name: "Dilman" ,
      top: 2318 ,
      left: 4681 ,
    }

spaces['tabriz'] = {
      name: "Tabriz" ,
      top: 2402 ,
      left: 4794 ,
    }

spaces['hamadan'] = {
      name: "Hamadan" ,
      top: 2561 ,
      left: 4844 ,
    }

spaces['kermanshah'] = {
      name: "Kermanshah" ,
      top: 2632 ,
      left: 4716 ,
    }

spaces['khorramabad'] = {
      name: "Khorramabad" ,
      top: 2701 ,
      left: 4858 ,
    }




spaces['ahwaz'] = {
      name: "Ahwaz" ,
      top: 2848 ,
      left: 4872 ,
    }

spaces['basra'] = {
      name: "Basra" ,
      top: 2989 ,
      left: 4840 ,
    }

spaces['constantinople'] = {
      name: "Constantinople" ,
      top: 2108 ,
      left: 3666 ,
    }

spaces['adapazari'] = {
      name: "Adapazari" ,
      top: 2099 ,
      left: 3791 ,
    }

spaces['sinope'] = {
      name: "Sinope" ,
      top: 2052 ,
      left: 2899 ,
    }

spaces['samsun'] = {
      name: "Samsun" ,
      top: 2035 ,
      left: 4005 ,
    }


spaces['giresun'] = {
      name: "Giresun" ,
      top: 2068 ,
      left: 4105 ,
    }


spaces['trebizond'] = {
      name: "Trebizond" ,
      top: 2107 ,
      left: 4225 ,
    }


spaces['rize'] = {
      name: "Rize" ,
      top: 2100 ,
      left: 4355 ,
    }


spaces['bursa'] = {
      name: "Bursa" ,
      top: 2252 ,
      left: 3674 ,
    }


spaces['eskidor'] = {
      name: "Eskidor" ,
      top: 2238 ,
      left: 3790 ,
    }


spaces['ankara'] = {
      name: "Ankara" ,
      top: 2204 ,
      left: 3906 ,
    }


spaces['sivas'] = {
      name: "Sivas" ,
      top: 2194 ,
      left: 4060 ,
    }




spaces['erzingan'] = {
      name: "Erzingan" ,
      top: 2233 ,
      left: 4231 ,
    }


spaces['erzerum'] = {
      name: "Erzerum" ,
      top: 2211 ,
      left: 4397 ,
    }


spaces['eleskrit'] = {
      name: "Eleskrit" ,
      top: 2223 ,
      left: 4526 ,
    }


spaces['konya'] = {
      name: "Konya" ,
      top: 2354 ,
      left: 3960 ,
    }


spaces['kayseri'] = {
      name: "Kayseri" ,
      top: 2334 ,
      left: 4091 ,
    }


spaces['kharput'] = {
      name: "Kharput" ,
      top: 2346 ,
      left: 4210 ,
    }




spaces['diyarbakir'] = {
      name: "Diyarbakir" ,
      top: 2336 ,
      left: 4323 ,
    }


spaces['bitlis'] = {
      name: "Bitlis" ,
      top: 2343 ,
      left: 4429 ,
    }


spaces['van'] = {
      name: "Van" ,
      top: 2340 ,
      left: 4544 ,
    }


spaces['adana'] = {
      name: "Adana" ,
      top: 2454 ,
      left: 4072 ,
    }


spaces['aleppo'] = {
      name: "Aleppo" ,
      top: 2510 ,
      left: 4196 ,
    }
spaces['urfa'] = {
      name: "Urfa" ,
      top: 2467 ,
      left: 4310 ,
    }

spaces['mardin'] = {
      name: "Mardin" ,
      top: 2467 ,
      left: 4433 ,
    }

spaces['mosul'] = {
      name: "Mosul" ,
      top: 2482 ,
      left: 4546 ,
    }

spaces['beirut'] = {
      name: "Beirut" ,
      top: 2585 ,
      left: 4091 ,
    }

spaces['damascus'] = {
      name: "Damascus" ,
      top: 2614 ,
      left: 4213 ,
    }

spaces['kirkuk'] = {
      name: "Kirkuk" ,
      top: 2612 ,
      left: 4558 ,
    }

spaces['nablus'] = {
      name: "Nablus" ,
      top: 2728 ,
      left: 4043 ,
    }

spaces['amman'] = {
      name: "Amman" ,
      top: 2745 ,
      left: 4166 ,
    }

spaces['baghdad'] = {
      name: "Baghdad" ,
      top: 2736 ,
      left: 4603 ,
    }


spaces['kut'] = {
      name: "Kut" ,
      top: 2785 ,
      left: 4712 ,
    }

spaces['gaza'] = {
      name: "Gaza" ,
      top: 2872 ,
      left: 3989 ,
    }

spaces['jerusalem'] = {
      name: "Jerusalem" ,
      top: 2840 ,
      left: 4116 ,
    }

spaces['samawah'] = {
      name: "Samawah" ,
      top: 2876 ,
      left: 4554 ,
    }

spaces['qurna'] = {
      name: "Qurna" ,
      top: 2883 ,
      left: 4759 ,
    }

spaces['sinai'] = {
      name: "Sinai" ,
      top: 2979 ,
      left: 3897 ,
    }

spaces['beersheba'] = {
      name: "Beersheba" ,
      top: 2967 ,
      left: 4101 ,
    }



spaces['aqaba'] = {
      name: "Aqaba" ,
      top: 3077 ,
      left: 4016 ,
    }

spaces['arabia'] = {
      name: "Arabia" ,
      top: 2990 ,
      left: 4321 ,
    }

spaces['medina'] = {
      name: "Medina" ,
      top: 3155 ,
      left: 4167 ,
    }

spaces['annasiriya'] = {
      name: "An Nasiriya" ,
      top: 3034 ,
      left: 4673 ,
    }

spaces['izmir'] = {
      name: "Izmir" ,
      top: 2954 ,
      left: 3274 ,
    }

spaces['balikesir'] = {
      name: "Balikesir" ,
      top: 2798 ,
      left: 3355 ,
    }

spaces['canakale'] = {
      name: "Cana Kale" ,
      top: 2775 ,
      left: 3194 ,
    }



spaces['bursa'] = {
      name: "Bursa" ,
      top: 2701 ,
      left: 3479 ,
    }

spaces['constantinople'] = {
      name: "Constantinople" ,
      top: 2560 ,
      left: 3474 ,
    }

spaces['gallipoli'] = {
      name: "Gallipoli" ,
      top: 2644 ,
      left: 3177 ,
    }

spaces['adrianople'] = {
      name: "Adrianople" ,
      top: 2514 ,
      left: 3308 ,
    }

spaces['libya'] = {
      name: "Libya" ,
      top: 2935 ,
      left: 3518 ,
    }

spaces['alexandria'] = {
      name: "Alexandria" ,
      top: 2955 ,
      left: 3661 ,
    }

spaces['portsaid'] = {
      name: "Port Said" ,
      top: 2899 ,
      left: 3777 ,
    }

spaces['cairo'] = {
      name: "Cairo" ,
      top: 3038 ,
      left: 3789 ,
    }

spaces['jassy'] = {
      name: "Jassy" ,
      top: 1644 ,
      left: 3183 ,
    }

spaces['barlad'] = {
      name: "Barlad" ,
      top: 1777 ,
      left: 3222 ,
    }

spaces['galatz'] = {
      name: "Galatz" ,
      top: 1946 ,
      left: 3308 ,
    }

spaces['ploesti'] = {
      name: "Ploesti" ,
      top: 1921 ,
      left: 3129 ,
    }


spaces['cartedearges'] = {
      name: "Carte de Arges" ,
      top: 1973 ,
      left: 2909 ,
    }


spaces['targujiu'] = {
      name: "Targu Jiu" ,
      top: 1983 ,
      left: 2760 ,
    }

spaces['caracal'] = {
      name: "Caracal" ,
      top: 2107 ,
      left: 2938 ,
    }

spaces['bucharest'] = {
      name: "Bucharest" ,
      top: 2074 ,
      left: 3154 ,
    }
spaces['constanta'] = {
      name: "Constanta" ,
      top: 2080 ,
      left: 3385 ,
    }

spaces['varna'] = {
      name: "Varna" ,
      top: 2233 ,
      left: 3331 ,
    }

spaces['plevna'] = {
      name: "Plevna" ,
      top: 2247 ,
      left: 3017 ,
    }

spaces['sofia'] = {
      name: "Sofia" ,
      top: 2290 ,
      left: 2847 ,
    }

spaces['kazanlik'] = {
      name: "Kazanlik" ,
      top: 2388 ,
      left: 3102 ,
    }

spaces['burgas'] = {
      name: "Burgas" ,
      top: 2365 ,
      left: 3302 ,
    }

spaces['philippoli'] = {
      name: "Philippoli" ,
      top: 2536 ,
      left: 3072 ,
    }

spaces['strumitsa'] = {
      name: "Strumitsa" ,
      top: 2445 ,
      left: 2866 ,
    }

spaces['belgrade'] = {
      name: "Belgrade" ,
      top: 2050 ,
      left: 2586 ,
    }

spaces['valjevo'] = {
      name: "Valjevo" ,
      top: 2204 ,
      left: 2499 ,
    }

spaces['nis'] = {
      name: "Nis" ,
      top: 2226 ,
      left: 2650 ,
    }

spaces['skopje'] = {
      name: "Skopje" ,
      top: 2410 ,
      left: 2653 ,
    }

spaces['monastir'] = {
      name: "Monastir" ,
      top: 2550 ,
      left: 2660 ,
    }

spaces['centije'] = {
      name: "Centije" ,
      top: 2341 ,
      left: 2365 ,
    }

spaces['tirana'] = {
      name: "Tirana" ,
      top: 2484 ,
      left: 2468 ,
    }

spaces['valona'] = {
      name: "Valona" ,
      top: 2659 ,
      left: 2459 ,
    }

spaces['florina'] = {
      name: "Florina" ,
      top: 2702 ,
      left: 2659 ,
    }

spaces['salonika'] = {
      name: "Salonika" ,
      top: 2650 ,
      left: 2782 ,
    }

spaces['kavala'] = {
      name: "Kavala" ,
      top: 2584 ,
      left: 2932 ,
    }

spaces['larisa'] = {
      name: "Larisa" ,
      top: 2803 ,
      left: 2754 ,
    }

spaces['athens'] = {
      name: "Athens" ,
      top: 3017 ,
      left: 2888 ,
    }




    for (let key in spaces) {
      spaces[key].units = [];
      spaces[key].trench = 0;
      if (!spaces[key].control) { spaces[key].control = ""; }
      spaces[key].activated_for_movement = 0;
      spaces[key].activated_for_combat = 0;
    }

    return spaces;

  }




  onNewRound() {
  }

  onNewTurn() {

    this.game.state.rp['central'] = {};
    this.game.state.rp['allies'] = {};


    for (let key in this.game.spaces) {
      for (let z = 0; z < this.game.spaces[key].units.length; z++) {
	this.game.spaces[key].units[z].moved = 0;
      }
    }

  }

  returnState() {

    let state = {};

    state.events = {};
    state.players = [];
    state.removed = []; // removed cards
    state.turn = 1;
    state.skip_counter_or_acknowledge = 0; // don't skip
    state.cards_left = {};

    state.reserves = {};
    state.reserves['central'] = [];
    state.reserves['allies'] = [];

    state.rp = {};
    state.rp['central'] = {};
    state.rp['allies'] = {};


    state.active_player = -1;

    return state;

  }

  returnActivationCost(key) {
    return 1;
  }

  returnMovementCost(key) {
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
	   
this.updateLog(`###############`);
this.updateLog(`### Turn ${this.game.state.turn} ###`);
this.updateLog(`###############`);

	  this.onNewTurn();

          for (let i = 0; i < this.game.state.players_info.length; i++) {
            this.resetPlayerRound((i+1));
          }

          this.game.queue.push("draw_strategy_card_phase");
          this.game.queue.push("replacement_phase");
          this.game.queue.push("war_status_phase");
          this.game.queue.push("siege_phase");
          this.game.queue.push("attrition_phase");
          this.game.queue.push("action_phase");
          this.game.queue.push("mandated_offensive_phase");

	}

 	if (mv[0] == "draw_strategy_card_phase") {
          this.game.queue.splice(qe, 1);
	  return 1;
	}
 	if (mv[0] == "replacement_phase") {
          this.game.queue.splice(qe, 1);
	  return 1;
	}
 	if (mv[0] == "war_status_phase") {
          this.game.queue.splice(qe, 1);
	  return 1;
	}
 	if (mv[0] == "siege_phase") {
          this.game.queue.splice(qe, 1);
	  return 1;
	}
 	if (mv[0] == "attrition_phase") {
          this.game.queue.splice(qe, 1);
	  return 1;
	}
 	if (mv[0] == "action_phase") {

          this.game.queue.splice(qe, 1);

	  for (let i = 0; i < 6; i++) {
	    this.game.queue.push("play\tallies");
	    this.game.queue.push("play\tcentral");
	  }

	  return 1;
	}
 	if (mv[0] == "mandated_offensive_phase") {
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

console.log("PLAYER: " + this.game.player);
console.log("LIve: " + player);
console.log("HAND: " + JSON.stringify(hand));

	  if (this.game.player == player) {
	    this.playerTurn(faction);
	  } else {
	    this.updateStatusAndListCards(`${name} is picking a card`, hand);
	  }
	  
	  return 0;

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

	  // italy
	  this.addTrench("trent", 1);
	  this.addTrench("asiago", 1);
	  this.addTrench("maggiore", 1);
          this.addUnitToSpace("it_corps", "taranto");
          this.addUnitToSpace("it_corps", "rome");
          this.addUnitToSpace("it_corps", "turin");
          this.addUnitToSpace("it_army01", "verona");
          this.addUnitToSpace("it_army02", "udine");
          this.addUnitToSpace("it_army03", "maggiore");
          this.addUnitToSpace("it_army04", "asiago");

}catch(err) {console.log("error initing:" + JSON.stringify(err));}

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



	/////////////////////
	// modifying state //
	/////////////////////
  	if (mv[0] === "sr") {
	  let faction = mv[1];
          this.game.queue.splice(qe, 1);
	  return 1;
	}

  	if (mv[0] === "rp") {

	  let faction = mv[1];
	  let key = mv[2];
	  let value = mv[3];

	  if (!this.game.state.rp[faction][key]) { this.game.state.rp[faction][key] = 0; }
	  this.game.state.rp[faction][key] += parseInt(value);

          this.game.queue.splice(qe, 1);
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

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let player = this.returnPlayerOfFaction(faction);

          let options = this.returnSpacesWithFilter(
            (key) => {
              if (this.game.spaces[key].activated_for_combat == 1) { return 1; }
              return 0;
            }
          );
          if (options.length == 0) { return 1; }

	  if (this.game.player == player) {
	    this.playerPlayCombat(faction);
	  } else {
	    this.updateStatus(this.returnFactionName(faction) + " executing combat");
	  }

	  return 0;

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

console.log("how many spaces activated?" + options.length);

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
	  let player = this.returnPlayerOfFaction(faction);

	  if (this.game.player == player) {
	    this.playerPlayOps(faction, card, cost);    
	  } else {
	    this.updateStatus(this.returnFactionName(faction) + " playing OPS");
	  }

	  return 0;

	}


        if (mv[0] === "activate_for_combat") {

	  let faction = mv[1];
	  let key = mv[2];

	  this.activateSpaceForCombat(key);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}



        if (mv[0] === "activate_for_movement") {

	  let faction = mv[1];
	  let key = mv[2];

	  this.activateSpaceForMovement(key);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}


	if (mv[0] === "entrench") {

	  let faction = mv[1];
	  let key = mv[2];
	  let idx = parseInt(mv[3]);

alert("entrench here!");
	  this.game.spaces[key].units[idx].moved = 1;

	  this.game.queue.splice(qe, 1);
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

	  return 1;
	}


        if (mv[0] === "ops") {

	  let faction = mv[1];
	  let card = mv[2];
	  let opsnum = parseInt(mv[3]);

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

  returnPlayerName(faction="") {
    if (faction == "central") { return "Central Powers"; }
    return "Allies";
  }

  returnPlayerOfFaction(faction="") {
    if (faction == "central") { return 1; }
    return 2;
  }

  playerPlayCard(faction, card) {

    let c = this.deck[card];

    //
    // hide any popup
    //
    this.cardbox.hide();


    let html = `<ul>`;
    html    += `<li class="card" id="ops">ops (movement / combat)</li>`;
    html    += `<li class="card" id="sr">strategic redeployment</li>`;
    html    += `<li class="card" id="rp">replacement points</li>`;
    html    += `<li class="card" id="event">trigger event</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions(`Playing ${this.popup(card)}`, html, true);
    this.bindBackButtonFunction(() => { this.playerTurn(faction); });
    this.attachCardboxEvents((action) => {

      if (action === "ops") {
	this.playerPlayOps(faction, card, c.ops);
      }

      if (action === "sr") {
	alert("sr");
	this.playerPlayStrategicRedeployment(faction, card, c.rp);
      }

      if (action === "rp") {
	alert("rp");
	this.playerPlayReplacementPoints(faction, card);
      }

      if (action === "event") {
	alert("event");
      }

    });

  }

  playerPlayCombat(faction) {
    alert("player play combat...");
  }

  playerPlayMovement(faction) {

    let paths_self = this;
    let options = this.returnSpacesWithFilter(
      (key) => {
	if (this.game.spaces[key].activated_for_movement == 1) { return 1; }
        return 0;
      }
    );

    let mainInterface = function(options, mainInterface, moveInterface, unitActionInterface) {

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
	"Units Awaiting Command: ",
	(key) => {
	  if (
	    paths_self.game.spaces[key].activated_for_movement == 1 
	    && options.includes(key)
	  ) {
	    let everything_moved = true;
	    for (let z = 0; z < paths_self.game.spaces[key].units.length; z++) {
	      if (paths_self.game.spaces[key].units[z].moved != 1) { everything_moved = false; }
	    }
	    if (everything_moved == false) { return 1; }
	  }
	  return 0;
	},
	(key) => {
	  for (let z = 0; z < paths_self.game.spaces[key].units.length; z++) {
	    paths_self.game.spaces[key].units[z].moved = 0;
	  }
	  paths_self.game.spaces[key].activated_for_movement = 0;
	  paths_self.removeSelectable();
	  moveInterface(key, options, mainInterface, moveInterface, unitActionInterface);
	},
	null,
	true
      )
    }

    let unitActionInterface = function(key, idx, options, mainInterface, moveInterface, unitActionInterface) {
      let unit = paths_self.game.spaces[key].units[idx];
      let sourcekey = key;
      let html  = `<ul>`;
          html += `<li class="option" id="move">move</li>`;
          html += `<li class="option" id="entrench">entrench</li>`;
          html += `<li class="option" id="skip">skip</li>`;
          html += `</ul>`;
      paths_self.updateStatusWithOptions(`Select Action for Unit`, html);
      paths_self.attachCardboxEvents((action) => {

        if (action === "move") {
	  paths_self.playerSelectSpaceWithFilter(
	    `Select Destination for ${unit.name}`,
	    (key) => {
	      return 1;
	    },
	    (key) => {
              paths_self.moveUnit(sourcekey, idx, key);
	      paths_self.addMove(`move\t${faction}\t${sourcekey}\t${idx}\t${key}\t${paths_self.game.player}`);
              paths_self.displaySpace(key);
	      let mint = false;
	      for (let z = 0; z < paths_self.game.spaces[sourcekey].units.length; z++) {
	        if (paths_self.game.spaces[sourcekey].units[z].moved != 1) { mint = true; }
	      }
	      if (mint) {
	        moveInterface(sourcekey, options, mainInterface, moveInterface, unitActionInterface);
	      } else {
	        mainInterface(options, mainInterface, moveInterface, unitActionInterface);
	      }
	    },
	    null,
	    true
	  );
        }
        if (action === "entrench") {
	  paths_self.addMove(`player_play_movement\t${faction}`);
	  paths_self.addMove(`entrench\t${faction}\t${sourcekey}\t${idx}`);
	  paths_self.endTurn();
	  return;
        }
        if (action === "skip") {
          paths_self.endTurn();
	  // this unit has been moved
	  paths_self.game.spaces[key].units[idx].moved = 1;
	  let mint = false;
	  for (let z = 0; z < paths_self.game.spaces[key].units.length; z++) {
	    if (paths_self.game.spaces[key].units[z].moved != 1) { mint = true; }
	  }
	  if (mint) {
	    moveInterface(key, options, mainInterface, moveInterface, unitActionInterface);
	  } else {
	    mainInterface(options, mainInterface, moveInterface, unitActionInterface);
	  }
        }

      });
    }


    let moveInterface = function(key, options, mainInterface, moveInterface, unitActionInterface) {
console.log("moving interface for " + key);
      let units = [];
      for (let z = 0; z < paths_self.game.spaces[key].units.length; z++) {
	if (paths_self.game.spaces[key].units[z].moved != 1) {
	  units.push(z);
	}
      }

      paths_self.playerSelectOptionWithFilter(
	"Which Unit?",
	units,
	(idx) => {
	  let unit = paths_self.game.spaces[key].units[idx];
	  return `<li class="option" id="${idx}">${unit.name}</li>`;
	},
	(idx) => {
	  let unit = paths_self.game.spaces[key].units[idx];
	  paths_self.game.spaces[key].units[idx].moved = 1;
          unitActionInterface(key, idx, options, mainInterface, moveInterface, unitActionInterface);
	},
        false
      );
    }

    mainInterface(options, mainInterface, moveInterface, unitActionInterface);

  }

  playerPlayOps(faction, card, cost) {

    this.addMove("player_play_combat\t"+faction);
    this.addMove("player_play_movement\t"+faction);

    let targets = this.returnNumberOfSpacesWithFilter((key) => {
      if (cost < this.returnActivationCost(key)) { return 0; }
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
    html    += `<li class="card" id="end">continue without activation</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions(`You have ${cost} OPS remaining`, html, true);
    this.bindBackButtonFunction(() => { this.moves = []; this.playerPlayCard(faction, card); });
    this.attachCardboxEvents((action) => {

      if (action === "end") {
	this.updateStatus("ending turn");
	this.endTurn();
      }

      if (action === "movement") {
	//
	// select valid space to activate
	//
	this.playerSelectSpaceWithFilter(
	  "Select Space to Activate:",
	  (key) => {
	    if (cost < this.returnActivationCost(key)) { return 0; }
	    let space = this.game.spaces[key];
	    if (space.activated_for_combat == 1) { return 0; }
	    if (space.activated_for_movement == 1) { return 0; }
	    for (let i = 0; i < space.units.length; i++) {
	      return 1;
	    }
	    return 0;
	  },
	  (key) => {
	    this.updateStatus("activating...");
	    this.activateSpaceForMovement(key);
            this.displaySpace(key);
	    let cost_paid = this.returnActivationCost(key); 
	    cost -= cost_paid;
	    if (cost < 0) { cost = 0; }
	    if (cost > 0) {
	      this.addMove(`player_play_ops\t${faction}\t${card}\t${cost}}`);
	    }
	    this.addMove(`activate_for_movement\t${faction}\t${key}`);
	    this.endTurn();
	  },
	  null,
	  true,
	);

      }

      if (action === "combat") {

	//
	// select valid space to activate
	//
	this.playerSelectSpaceWithFilter(
	  "Select Space to Activate:",
	  (key) => {
	    let space = this.game.spaces[key];
	    if (space.activated_for_movement == 1) { return 0; }
	    if (space.activated_for_combat == 1) { return 0; }
	    for (let i = 0; i < space.units.length; i++) {
	      return 1;
	    }
	    return 0;
	  },
	  (key) => {
	    this.updateStatus("activating...");
	    this.activateSpaceForCombat(key);
	    let cost_paid = this.returnActivationCost(key); 
	    cost -= cost_paid;
	    if (cost < 0) { cost = 0; }
	    if (cost > 0) {
	      this.addMove(`player_play_ops\t${faction}\t${card}\t${cost}}`);
	    }
	    this.addMove(`activate_for_combat\t${faction}\t${key}`);
	    this.endTurn();
	  },
	  null,
	  true,
	);

      }

    });

  }

  playerPlayReplacementPoints(faction, card) {

    let c = this.deck[card];

    //
    // hide any popup
    //
    this.cardbox.hide();

    let html = `<ul>`;
    for (let key in c.sr) {
      html    += `<li class="card" id="${key}">${key} - ${c.sr[key]}</li>`;
    }
    html    += `</ul>`;

    this.updateStatusWithOptions(`Add Strategic Redeployments:`, html, true);
    this.bindBackButtonFunction(() => { this.moves = []; this.playerPlayCard(faction, card); });
    this.attachCardboxEvents((action) => {
      this.addMove("rp\tfaction\t${action}\t${c.sr[key]}");
      this.endTurn();
    });

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




  playerSelectSpaceWithFilter(msg, filter_func, mycallback = null, cancel_func = null, board_clickable = false) {

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
    html += '</ul>';

    this.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', function () {

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



  playerPlayStrategicRedeployment(faction, value) {
    this.addMove(`sr\t${faction}\t${value}`);
    this.endTurn();
  }

  playerPlayEvent(faction, card) {

  }

  playerTurn(faction) {

    let name = this.returnPlayerName(faction);
    let hand = this.returnPlayerHand();

    this.updateStatusAndListCards(`${name}: pick a card`, hand);
    this.attachCardboxEvents((card) => {
      this.playerPlayCard(faction, card);
    });

  }



  returnPowerOfUnit(unit) {

    try { if (!unit.ckey) { unit = this.game.units[unit]; } } catch (err) {}

    let allied = ["FR", "RU", "BR", "BE", "IT", "US"];
    let central = ["GE", "AH", "TU", "BG"];

    if (allied.includes(unit.ckey)) { return "allies"; }
    if (central.includes(unit.ckey)) { return "central"; }

    return "";

  }


  importUnit(key, obj) {

    if (!this.game.units) { this.game.units = {}; }

    //
    // avoid re-importing
    //
    if (this.game.units[key]) { return; }

    obj.key = key;

    if (!obj.combat)	{ obj.combat 	= 5; }
    if (!obj.loss)	{ obj.loss 	= 3; }
    if (!obj.movement)	{ obj.movement 	= 3; }
    if (!obj.rcombat)	{ obj.rcombat 	= 5; }
    if (!obj.rloss)	{ obj.rloss 	= 3; }
    if (!obj.rmovement)	{ obj.rmovement = 3; }

    if (!obj.damaged)	{ obj.damaged = false; }

    this.game.units[key] = obj;

  }

  moveUnit(sourcekey, sourceidx, destinationkey) {
    let unit = this.game.spaces[sourcekey].units[sourceidx];
    this.game.spaces[sourcekey].units[sourceidx].moved = 1;
    this.game.spaces[sourcekey].units.splice(sourceidx, 1);
    if (!this.game.spaces[destinationkey].units) { this.game.spaces[destinationkey].units = []; }
    this.game.spaces[destinationkey].units.push(unit);
    this.displaySpace(sourcekey);
    this.displaySpace(destinationkey);
  }

  returnUnitImage(spacekey, idx) {

    let unit = this.game.spaces[spacekey].units[idx];
    let key = unit.key;

    if (unit.damaged) {
      return `<img src="/paths/img/army/${key}_back.png" class="army-tile" />`;
    } else {
      return `<img src="/paths/img/army/${key}.png" class="army-tile" />`;
    }

  }

  cloneUnit(unitkey) {
    return JSON.parse(JSON.stringify(this.game.units[unitkey]));
  }

  addUnitToSpace(unitkey, spacekey) {
    this.game.spaces[spacekey].units.push(this.cloneUnit(unitkey));
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


