
  render(app) {

    if (this.browser_active == 0) { return; }

    super.render(app);

    let game_mod = this;

    //
    //
    //
    if (!this.game.state) {
      this.game.state = this.returnState();
    }

    //
    // preload images
    //
    this.preloadImages();


    // required here so menu will be proper
    try {
      if (this.app.options.gameprefs.hereistand_expert_mode == 1) {
        this.confirm_moves = 0;
      } else {
        this.confirm_moves = 1;
      }
    } catch (err) {}


    this.menu.addMenuOption("game-game", "Game");
    this.menu.addSubMenuOption("game-game", {
      text : "Difficulty",
      id : "game-confirm",
      class : "game-confirm",
      callback : null
    });

    this.confirm_moves = 0;
    if (this.app.options.gameprefs) {
      if (this.app.options.gameprefs.his_expert_mode) {
	this.confirm_moves = this.app.options.gameprefs.his_expert_mode;
	if (this.confirm_moves == 1) { this.game_help.enabled = false; }
      }
    }
    this.menu.addSubMenuOption("game-confirm",{
      text: `Newbie ${(this.confirm_moves==1)?"✔":""}`,
      id:"game-confirm-newbie",
      class:"game-confirm-newbie",
      callback: function(app,game_mod){
        if (game_mod.confirm_moves == 0){
	  document.querySelector("#game-confirm-newbie div").innerHTML = "Newbie ✔";
	  document.querySelector("#game-confirm-expert div").innerHTML = "Expert";
          game_mod.displayModal("Game Settings", "Tutorial Mode re-enabled");
          game_mod.saveGamePreference('his_expert_mode', 0);
	  game_mod.game_help.enabled = true;
	  game_mod.confirm_moves = 1;
        }else{
          game_mod.menu.hideSubMenus();
        }
      }
    });
      
    this.menu.addSubMenuOption("game-confirm",{ 
      text: `Expert ${(this.confirm_moves==1)?"":"✔"}`,
      id:"game-confirm-expert",
      class:"game-confirm-expert",
      callback: function(app,game_mod){
        if (game_mod.confirm_moves == 1){
	  document.querySelector("#game-confirm-newbie div").innerHTML = "Newbie";
	  document.querySelector("#game-confirm-expert div").innerHTML = "Expert ✔";
          game_mod.displayModal("Game Settings", "Tutorial Mode disabled");
          game_mod.saveGamePreference('his_expert_mode', 1);
	  game_mod.game_help.hide();
	  game_mod.game_help.enabled = false;
	  game_mod.confirm_moves = 0;
        }else{
          game_mod.menu.hideSubMenus();
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
/****
    this.menu.addSubMenuOption("game-game", {
      text : "Stats",
      id : "game-stats",
      class : "game-stats",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        game_mod.handleStatsMenu();
      }
    });
****/
    this.menu.addMenuOption("game-info", "Info");
    this.menu.addSubMenuOption("game-info", {
      text: "Faction Units",
      id: "game-units",
      class: "game-units",
      callback: function(app, game_mod){
	game_mod.menu.hideSubMenus();
        game_mod.units_overlay.render();
      }
    });
    this.menu.addSubMenuOption("game-info", {
      text: "Faction Cards",
      id: "game-faction-cards",
      class: "game-faction-cards",
      callback: function(app, game_mod){
        game_mod.menu.showSubSubMenu("game-faction-cards");
      }
    });
    this.menu.addSubMenuOption("game-info", {
      text: "Discard Pile",
      id: "game-cards",
      class: "game-cards",
      callback: function(app, game_mod){
	game_mod.menu.hideSubMenus();
        game_mod.deck_overlay.render("discards");
      }
    });
/****
    this.menu.addSubMenuOption("game-info", {
      text: "Diplomatic Cards",
      id: "game-diplomatic",
      class: "game-diplomatic",
      callback: function(app, game_mod){
        game_mod.menu.showSubSubMenu("game-diplomatic");
      }
    });
****/
    this.menu.addSubMenuOption("game-faction-cards", {
      text : "Papacy",
      id : "game-papacy-cards",
      class : "game-papacy-cards",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
	if (game_mod.returnPlayerOfFaction("papacy") == game_mod.game.player) {
          let fhand_idx = game_mod.returnFactionHandIdx(game_mod.game.player, "papacy");
          let c = game_mod.game.deck[0].fhand[fhand_idx];
          game_mod.deck_overlay.render("hand", c);
	  return;
	}
        game_mod.deck_overlay.render("papacy");
      }
    });
    this.menu.addSubMenuOption("game-faction-cards", {
      text : "Protestant",
      id : "game-protestant-cards",
      class : "game-protestant-cards",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
	if (game_mod.returnPlayerOfFaction("protestant") == game_mod.game.player) {
          let fhand_idx = game_mod.returnFactionHandIdx(game_mod.game.player, "protestant");
          let c = game_mod.game.deck[0].fhand[fhand_idx];
          game_mod.deck_overlay.render("hand", c);
	  return;
	}
        game_mod.deck_overlay.render("protestant");
      }
    });
if (this.game.players.length > 2) {
    this.menu.addSubMenuOption("game-faction-cards", {
      text : "England",
      id : "game-england-cards",
      class : "game-england-cards",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
	if (game_mod.returnPlayerOfFaction("england") == game_mod.game.player) {
          let fhand_idx = game_mod.returnFactionHandIdx(game_mod.game.player, "england");
          let c = game_mod.game.deck[0].fhand[fhand_idx];
          game_mod.deck_overlay.render("hand", c);
	  return;
	}
        game_mod.deck_overlay.render("england");
      }
    });
    this.menu.addSubMenuOption("game-faction-cards", {
      text : "France",
      id : "game-france-cards",
      class : "game-france-cards",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
	if (game_mod.returnPlayerOfFaction("france") == game_mod.game.player) {
          let fhand_idx = game_mod.returnFactionHandIdx(game_mod.game.player, "france");
          let c = game_mod.game.deck[0].fhand[fhand_idx];
          game_mod.deck_overlay.render("hand", c);
	  return;
	}
        game_mod.deck_overlay.render("france");
      }
    });
    this.menu.addSubMenuOption("game-faction-cards", {
      text : "Hapsburg",
      id : "game-hapsburg-cards",
      class : "game-hapsburg-cards",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
	if (game_mod.returnPlayerOfFaction("hapsburg") == game_mod.game.player) {
          let fhand_idx = game_mod.returnFactionHandIdx(game_mod.game.player, "hapsburg");
          let c = game_mod.game.deck[0].fhand[fhand_idx];
          game_mod.deck_overlay.render("hand", c);
	  return;
	}
        game_mod.deck_overlay.render("hapsburg");
      }
    });
    this.menu.addSubMenuOption("game-faction-cards", {
      text : "Ottoman",
      id : "game-ottoman-cards",
      class : "game-ottoman-cards",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
	if (game_mod.returnPlayerOfFaction("ottoman") == game_mod.game.player) {
          let fhand_idx = game_mod.returnFactionHandIdx(game_mod.game.player, "ottoman");
          let c = game_mod.game.deck[0].fhand[fhand_idx];
          game_mod.deck_overlay.render("hand", c);
	  return;
	}
        game_mod.deck_overlay.render("ottoman");
      }
    });
}
/****
    this.menu.addSubMenuOption("game-cards", {
      text : "My Hand",
      id : "game-my-hand",
      class : "game-my-hand",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        game_mod.deck_overlay.render("hand");
      }
    });
    this.menu.addSubMenuOption("game-cards", {
      text : "Discards",
      id : "game-discards",
      class : "game-discards",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        game_mod.deck_overlay.render("discards");
      }
    });
    this.menu.addSubMenuOption("game-cards", {
      text : "All Cards",
      id : "game-all-cards",
      class : "game-all-cards",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        game_mod.deck_overlay.render("all");
      }
    });
    this.menu.addSubMenuOption("game-cards", {
      text : "Unplayed",
      id : "game-unplayed-cards",
      class : "game-unplayed-cards",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        game_mod.deck_overlay.render("unplayed");
      }
    });
    this.menu.addSubMenuOption("game-cards", {
      text : "Removed",
      id : "game-removed-cards",
      class : "game-removed-cards",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        game_mod.deck_overlay.render("removed");
      }
    });
****/
    this.menu.addSubMenuOption("game-info", {
      text : "VP",
      id : "game-vp",
      class : "game-vp",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        game_mod.vp_overlay.render();
      }
    });
    this.menu.addSubMenuOption("game-info", {
      text : "New World",
      id : "game-new-world",
      class : "game-cnew-world",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        game_mod.newworld_overlay.render();
      }
    });
/****
    this.menu.addSubMenuOption("game-info", {
      text : "Chateaux",
      id : "game-chateaux-building",
      class : "game-chateaux-building",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        game_mod.chateaux_overlay.render("papacy");
      }
    });
****/
    this.menu.addSubMenuOption("game-info", {
      text : "Religion",
      id : "game-religious-conflict",
      class : "game-religious-conflict",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        game_mod.religious_overlay.render();
      }
    });
    this.menu.addSubMenuOption("game-info", {
      text : "Debaters",
      id : "game-debaters",
      class : "game-debaters",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        game_mod.displayDebaters();
      }
    });
    this.menu.addSubMenuOption("game-info", {
      text : "Explorers",
      id : "game-explorers",
      class : "game-explorers",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        game_mod.displayExplorers();
      }
    });
    this.menu.addSubMenuOption("game-info", {
      text : "Conquistadors",
      id : "game-conquistadors",
      class : "game-conquistadors",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        game_mod.displayConquistadors();
      }
    });
/***
***/

    this.menu.addMenuOption("game-factions", "Factions");
    this.menu.addSubMenuOption("game-factions", {
      text : "Hapsburgs",
      id : "game-hapsburgs",
      class : "game-hapsburgs",
      callback : function(app, game_mod) {
        game_mod.faction_overlay.render("hapsburg");
      }
    });
    this.menu.addSubMenuOption("game-factions", {
      text : "England",
      id : "game-england",
      class : "game-england",
      callback : function(app, game_mod) {
        game_mod.faction_overlay.render("england");
      }
    });
    this.menu.addSubMenuOption("game-factions", {
      text : "France",
      id : "game-france",
      class : "game-france",
      callback : function(app, game_mod) {
        game_mod.faction_overlay.render("france");
      }
    });
    this.menu.addSubMenuOption("game-factions", {
      text : "Ottoman Empire",
      id : "game-ottoman",
      class : "game-ottoman",
      callback : function(app, game_mod) {
        game_mod.faction_overlay.render("ottoman");
      }
    });
    this.menu.addSubMenuOption("game-factions", {
      text : "Protestants",
      id : "game-protestants",
      class : "game-protestants",
      callback : function(app, game_mod) {
        game_mod.faction_overlay.render("protestant");
      }
    });
    this.menu.addSubMenuOption("game-factions", {
      text : "Papacy",
      id : "game-papacy",
      class : "game-papacy",
      callback : function(app, game_mod) {
        game_mod.faction_overlay.render("papacy");
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
    let spaces = this.returnSpaces();
    for (let key in spaces) {
      if (spaces.hasOwnProperty(key)) {
	try {
	  let obj = document.getElementById(key);
	  obj.style.top = spaces[key].top + "px";
	  obj.style.left = spaces[key].left + "px";
        } catch (err) {
	}
      }
    }

    //
    // position pregnancy chart
    //
    let pregnancies = this.returnPregnancyChart();
    for (let key in pregnancies) {
      if (pregnancies.hasOwnProperty(key)) {
	try {
          let idname = "pregnancy"+key;
	  let obj = document.getElementById(idname);
	  obj.style.top = pregnancies[key].top + "px";
	  obj.style.left = pregnancies[key].left + "px";
        } catch (err) {
	}
      }
    }

    //
    // position diplomacy chart
    //
    let d = this.returnDiplomacyTable();
    for (let key in d) {
      if (d.hasOwnProperty(key)) {
	try {
          for (let key2 in d[key]) {
	    divname = key + "_" + key2;
	    let obj = document.getElementById(divname);
	    obj.style.top = d[key][key2].top + "px";
	    obj.style.left = d[key][key2].left + "px";
	  }
        } catch (err) {
	}
      }
    }
    this.game.diplomacy = d;



    //
    // position electorate display
    //
    let elec = this.returnElectorateDisplay();
    for (let key in elec) {
      if (elec.hasOwnProperty(key)) {
        try {
          let obj = document.getElementById(`ed_${key}`);
          obj.style.top = elec[key].top + "px";
          obj.style.left = elec[key].left + "px";
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
	//
	// sizer makes draggable 
	//
        //$('#gameboard').draggable({
	//  stop : function(event, ui) {
	//    his_self.saveGamePreference((his_self.returnSlug()+"-board-offset"), ui.offset);
	//  }
	//});
	//
      }

    } catch (err) {}

    this.factionbar.render();

    this.hud.render();

    this.displayBoard();

  }




