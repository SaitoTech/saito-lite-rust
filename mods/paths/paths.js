const GameTemplate = require('../../lib/templates/gametemplate');
const ZoomOverlay = require('./lib/ui/overlays/zoom');

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

      //
      // trenches
      //
      if (space.trench == 1) {
	if (space.control == "allies") {
          html += `<img src="/paths/img/tiles/ap_trench1.png" class="trench-tile" />`;
	}
	if (space.control == "central") {
          html += `<img src="/paths/img/tiles/cp_trench1.png" class="trench-tile" />`;
	}
      }
      if (space.trench == 2) {
	if (space.control == "allies") {
          html += `<img src="/paths/img/tiles/ap_trench2.png" class="trench-tile" />`;
	}
	if (space.control == "central") {
          html += `<img src="/paths/img/tiles/cp_trench2.png" class="trench-tile" />`;
	}
      }

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
        html += `<img src="/paths/img/tiles/activate_combat.png" class="activation-tile" />`;
      }

      document.querySelector(`.${key}`).innerHTML = html;

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



  activeSpaceForCombat(spacekey) {
    this.game.spaces[spacekey].activated_for_combat = 1;
    this.displaySpace(spacekey);
  }

  activateSpaceForMovement(spacekey) {
    this.game.spaces[spacekey].activated_for_movement = 1;
    this.displaySpace(spacekey);
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

    spaces['stirling'] = {
      top: 690,
      left: 1222,
      name: "Stirling",
      neighbours: ["glasgow","edinburgh"],
      type: "town"
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

	  // initialize the board
          this.addUnitToSpace("ah_army01", "stirling");
          this.addUnitToSpace("ge_army01", "stirling");
          this.addUnitToSpace("br_army01", "stirling");

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
	alert("ops - " + JSON.stringify(c));
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

  playerPlayOps(faction, card, cost) {

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
console.log("SPACE: " + spacekey + ": " + JSON.stringify(this.game.spaces[spacekey]));
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


