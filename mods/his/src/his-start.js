
      //
      // finished initializing game objects
      //
      this.displayBoard();

    } catch (err) {}
  }



  //
  // manually announce arcade banner support
  //
  respondTo(type) {

    if (super.respondTo(type) != null) {
      return super.respondTo(type);
    }

    if (type == "arcade-carousel") {
      let obj = {};
      obj.background = "/his/img/arcade/arcade-banner-background.png";
      obj.title = "Here I Stand";
      return obj;
    }
   
    return null;
 
  }




  initializeHTML(app) {

    if (this.browser_active == 0) { return; }

    super.initializeHTML(app);

    //
    //
    //
    if (!this.game.state) {
      this.game.state = this.returnState();
    }


    this.app.modules.respondTo("chat-manager").forEach(mod => {
      mod.respondTo('chat-manager').render(app, this);
      mod.respondTo('chat-manager').attachEvents(app, this);
    });

    // required here so menu will be proper
    try {
      if (this.app.options.gameprefs.hereistand_expert_mode == 1) {
        this.confirm_moves = 0;
      } else {
        this.confirm_moves = 1;
      }
    } catch (err) {}


    this.menu.addMenuOption({
      text : "Game",
      id : "game-game",
      class : "game-game",
      callback : function(app, game_mod) {
	game_mod.menu.showSubMenu("game-game");
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
          game_mod.saveGamePreference('twilight_expert_mode', 0);
	  window.location.reload();	
	} else {
	  game_mod.confirm_moves = 0;
          game_mod.saveGamePreference('twilight_expert_mode', 1);
	  window.location.reload();	
	}
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
    this.menu.addSubMenuOption("game-game", {
      text : "Exit",
      id : "game-exit",
      class : "game-exit",
      callback : function(app, game_mod) {
        window.location.href = "/arcade";
      }
    });
    this.menu.addMenuOption({
      text : "Cards",
      id : "game-cards",
      class : "game-cards",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        game_mod.handleCardsMenu();
      }
    });
    this.menu.addMenuOption({
      text : "Display",
      id : "game-display",
      class : "game-display",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        game_mod.handleDisplayMenu();
      }
    });


    let main_menu_added = 0;
    let community_menu_added = 0;
    for (let i = 0; i < this.app.modules.mods.length; i++) {
      if (this.app.modules.mods[i].slug === "chat") {
	for (let ii = 0; ii < this.game.players.length; ii++) {
	  if (this.game.players[ii] != this.app.wallet.returnPublicKey()) {

	    // add main menu
	    if (main_menu_added == 0) {
              this.menu.addMenuOption({
                text : "Chat",
          	id : "game-chat",
          	class : "game-chat",
          	callback : function(app, game_mod) {
		  game_mod.menu.showSubMenu("game-chat");
          	}
              })
	      main_menu_added = 1;
	    }

	    if (community_menu_added == 0) {
    	      this.menu.addSubMenuOption("game-chat", {
    	        text : "Community",
      	        id : "game-chat-community",
      	        class : "game-chat-community",
      	        callback : function(app, game_mod) {
	  	  game_mod.menu.hideSubMenus();
        	  chatmod.sendEvent('chat-render-request', {});
                  chatmod.mute_community_chat = 0;
		  chatmod.openChatBox();
    	        }
              });
	      community_menu_added = 1;
	    }

	    // add peer chat
  	    let data = {};
	    let members = [this.game.players[ii], this.app.wallet.returnPublicKey()].sort();
	    let gid = this.app.crypto.hash(members.join('_'));
	    let name = "Player "+(ii+1);
	    let chatmod = this.app.modules.mods[i];
	
    	    this.menu.addSubMenuOption("game-chat", {
    	      text : name,
      	      id : "game-chat-"+(ii+1),
      	      class : "game-chat-"+(ii+1),
      	      callback : function(app, game_mod) {
		game_mod.menu.hideSubMenus();
	        chatmod.createChatGroup(members, name);
		chatmod.openChatBox(gid);
        	chatmod.sendEvent('chat-render-request', {});
        	chatmod.saveChat();
    	      }
            });
	  }
	}
      }
    }
    this.menu.addMenuIcon({
      text : '<i class="fa fa-window-maximize" aria-hidden="true"></i>',
      id : "game-menu-fullscreen",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        app.browser.requestFullscreen();
      }
    });

    this.menu.render(app, this);
    this.menu.attachEvents(app, this);

    this.log.render(app, this);
    this.log.attachEvents(app, this);

    this.cardbox.render(app, this);
    this.cardbox.attachEvents(app, this);

    //
    // add card events -- text shown and callback run if there
    //
    this.hud.addCardType("logcard", "", null);
    this.hud.addCardType("card", "select", this.cardbox_callback);
    if (!app.browser.isMobileBrowser(navigator.userAgent)) {
      this.cardbox.skip_card_prompt = 1;
    }

    //
    // position cities / spaces / etc
    //
    let spaces = this.returnSpaces();
    for (let key in spaces) {
      if (spaces.hasOwnProperty(key)) {
	try {
console.log("key: " + key);
	  let obj = document.getElementById(key);
	  obj.style.top = spaces[key].top + "px";
	  obj.style.left = spaces[key].left + "px";
        } catch (err) {
console.log("err: " + err);
	}
      }
    }

    try {

      if (app.browser.isMobileBrowser(navigator.userAgent)) {
        this.hammer.render(this.app, this);
        this.hammer.attachEvents(this.app, this, '.gameboard');
      } else {
	let his_self = this;
        this.sizer.render(this.app, this);
        this.sizer.attachEvents(this.app, this, '.gameboard');
        $('#gameboard').draggable({
	  stop : function(event, ui) {
	    his_self.saveGamePreference((his_self.returnSlug()+"-board-offset"), ui.offset);
	  }
	});
      }

    } catch (err) {}

    this.hud.render(app, this);
    this.hud.attachEvents(app, this);

    this.displayBoard();

  }




  displayBoard() {

    this.updateLog("updating board display");

    this.displayColony();
    this.displayConquest();
    this.displayNewWorld();
    this.displaySpaces();
    this.displayVictoryTrack();

  }

  displayColony() {
  }

  displayConquest() {
  }

  displayNewWorld() {
  }

  displaySpaces() {

    let spaces = this.returnSpaces();

    for (let key in spaces) {
      if (spaces.hasOwnProperty(key)) {
console.log("key2: " + key);
        document.getElementById(key).onclick = (e) => {
	  alert("Clicked on " + key);
        }
      }
    }

  }

  displayVictoryTrack() {
  }



  //
  // Core Game Logic
  //
  handleGameLoop() {

    let his_self = this;

    ///////////
    // QUEUE //
    ///////////
    if (this.game.queue.length > 0) {

        let qe = this.game.queue.length-1;
        let mv = this.game.queue[qe].split("\t");
        let shd_continue = 1;

        //
        // round
        // init
	//
        if (mv[0] == "init") {
	  this.updateLog("init game");
          this.game.queue.splice(qe, 1);
        }

        if (mv[0] === "round") {

	  //
	  // restore state
	  //


	  //
	  // collect stats
	  //
	  if (this.game.state.round > 1) {
	    //this.game.state.stats.round.push({});
	    //this.game.state.stats.round[this.game.state.stats.round.length-1].us_scorings = this.game.state.stats.us_scorings;
	  }

	  //
          // if we have come this far, move to the next turn
          //
          this.updateStatus("<div class='status-message' id='status-message'><span>Preparing for round</span> " + this.game.state.round+"</div>");

          this.game.queue.push("turn");
          for (let i = this.game.players.length; i > 0; i++) {
            this.game.queue.push(`play\t${i}`);
          }

          return 1;
        }


        if (mv[0] === "play") {

          this.displayBoard();
          this.playMove();
          return 0;
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



  playerTurn(selected_card=null) {

    this.startClock();

    let his_self = this;

    this.updateStatusAndListCards(user_message, this.game.deck[0].hand);
    twilight_self.addShowCardEvents(function(card) {
      twilight_self.playerTurnCardSelected(card, player);
    });

  }




  ////////////////////
  // Core Game Data //
  ////////////////////
  returnState() {

    let state = {};

    state.round = 1;
    state.players = [];
    state.events = {};

  }


  returnColonies() {

    let colonies = {};

    colonies['1'] = {
      top : 1007,
      left : 55
    }
    colonies['2'] = {
      top : 1120,
      left : 55
    }
    colonies['3'] = {
      top : 1232,
      left : 55
    }
    colonies['4'] = {
      top : 1344,
      left : 55
    }
    colonies['5'] = {
      top : 1456,
      left : 55
    }
    colonies['6'] = {
      top : 1568,
      left : 55
    }
    colonies['7'] = {
      top : 1680,
      left : 55
    }

    return colonies;

  }


  returnNewWorld() {

    let nw = {};

    nw['greatlakes'] = {
      top : 1906 ,
      left : 280,
      vp : 1
    }
    nw['stlawrence'] = {
      top : 1886 ,
      left : 515,
      vp : 1
    }
    nw['mississippi'] = {
      top : 2075 ,
      left : 280 ,
      vp : 1
    }
    nw['aztec'] = {
      top : 2258 ,
      left : 168 ,
      vp : 2
    }
    nw['maya'] = {
      top : 2300 ,
      left : 302 ,
      vp : 2
    }
    nw['amazon'] = {
      top : 2536 ,
      left : 668 ,
      vp : 2
    }
    nw['inca'] = {
      top : 2660 ,
      left : 225,
      vp : 2
    }
    nw['circumnavigation'] = {
      top : 2698,
      left : 128,
      vp : 3
    }
    nw['pacificstrait'] = {
      top : 2996 ,
      left : 486 ,
      vp : 1
    }


    return nw;

  }


  returnConquest() {

    let conquest = {};

    conquest['1'] = {
      top : 1007,
      left : 178
    }
    conquest['2'] = {
      top : 1120,
      left : 178
    }
    conquest['3'] = {
      top : 1232,
      left : 178
    }
    conquest['4'] = {
      top : 1344,
      left : 178
    }
    conquest['5'] = {
      top : 1456,
      left : 178
    }
    conquest['6'] = {
      top : 1568,
      left : 178
    }
    conquest['7'] = {
      top : 1680,
      left : 178
    }

    return conquest;

  }

  returnVictoryPointTrack() {

    let track = {};

    track['1'] = {
      top : 2912,
      left : 2138
    }
    track['2'] = {
      top : 2912,
      left : 2252
    }
    track['3'] = {
      top : 2912,
      left : 2366
    }
    track['4'] = {
      top : 2912,
      left : 2480
    }
    track['5'] = {
      top : 2912,
      left : 2594
    }
    track['6'] = {
      top : 2912,
      left : 2708
    }
    track['7'] = {
      top : 2912,
      left : 2822
    }
    track['8'] = {
      top : 2912,
      left : 2936
    }
    track['9'] = {
      top : 2912,
      left : 3050
    }
    track['10'] = {
      top : 3026,
      left : 884
    }
    track['11'] = {
      top : 3026,
      left : 998
    }
    track['12'] = {
      top : 3026,
      left : 1112
    }
    track['13'] = {
      top : 1226,
      left : 1
    }
    track['14'] = {
      top : 3026,
      left : 1340
    }
    track['15'] = {
      top : 3026,
      left : 1454
    }
    track['16'] = {
      top : 3026,
      left : 1568
    }
    track['17'] = {
      top : 3026,
      left : 1682
    }
    track['18'] = {
      top : 3026,
      left : 1796
    }
    track['19'] = {
      top : 3026,
      left : 1910
    }
    track['20'] = {
      top : 3026,
      left : 2024
    }
    track['21'] = {
      top : 3026,
      left : 2138
    }
    track['22'] = {
      top : 3026,
      left : 2252
    }
    track['23'] = {
      top : 3026,
      left : 2366
    }
    track['24'] = {
      top : 3026,
      left : 2480
    }
    track['25'] = {
      top : 3026,
      left : 2594
    }
    track['26'] = {
      top : 3026,
      left : 2708
    }
    track['27'] = {
      top : 3026,
      left : 2822
    }
    track['28'] = {
      top : 3026,
      left : 2936
    }
    track['29'] = {
      top : 3026,
      left : 3050
    }

  }


  returnSpaces() {

    let spaces = {};

    spaces['stirling'] = {
      top: 70,
      left: 1265,
      type: "fortress"
    }
    spaces['glasgow'] = {
      top: 225,
      left: 1285,
      type: "town"
    }
    spaces['edinburgh'] = {
      top: 125,
      left: 1420,
      type: "key"
    }
    spaces['berwick'] = {
      top: 183,
      left: 1572,
      type: "town"
    }
    spaces['carlisle'] = {
      top: 276,
      left: 1447,
      type: "town"
    }
    spaces['york'] = {
      top: 375,
      left: 1595,
      type: "key"
    }
    spaces['wales'] = {
      top: 633,
      left: 1398,
      type: "town"
    }
    spaces['shrewsbury'] = {
      top: 521,
      left: 1535,
      type: "town"
    }
    spaces['lincoln'] = {
      top: 531,
      left: 1706,
      type: "town"
    }
    spaces['norwich'] = {
      top: 538,
      left: 1896,
      type: "town"
    }
    spaces['bristol'] = {
      top: 688,
      left: 1554,
      type: "town"
    }
    spaces['london'] = {
      top: 706,
      left: 1785,
      type: "town"
    }
    spaces['plymouth'] = {
      top: 898,
      left: 1398,
      type: "town"
    }
    spaces['portsmouth'] = {
      top: 821,
      left: 1661,
      type: "town"
    }
    spaces['calais'] = {
      top: 745,
      left: 2022,
      type: "town"
    }

    spaces['boulogne'] = {
      top: 880,
      left: 1955,
      type: "town"
    }
    spaces['stquentin'] = {
      top: 933,
      left: 2093,
      type: "town"
    }
    spaces['stdizier'] = {
      top: 1043,
      left: 2205,
      type: "town"
    }
    spaces['paris'] = {
      top: 1063,
      left: 2009,
      type: "town"
    }
    spaces['rouen'] = {
      top: 1000,
      left: 1805,
      type: "key"
    }
    spaces['orleans'] = {
      top: 1217,
      left: 2018,
      type: "town"
    }
    spaces['dijon'] = {
      top: 1205,
      left: 2204,
      type: "town"
    }
    spaces['limoges'] = {
      top: 1398,
      left: 1975,
      type: "town"
    }
    spaces['tours'] = {
      top: 1277,
      left: 1849,
      type: "town"
    }
    spaces['nantes'] = {
      top: 1310,
      left: 1650,
      type: "town"
    }
    spaces['brest'] = {
      top: 1173,
      left: 1409,
      type: "town"
    }
    spaces['bordeaux'] = {
      top: 1568,
      left: 1780,
      type: "key"
    }
    spaces['lyon'] = {
      top: 1445,
      left: 2312,
      type: "key"
    }
    spaces['grenoble'] = {
      top: 1590,
      left: 2437,
      type: "town"
    }
    spaces['avignon'] = {
      top: 1645,
      left: 2292,
      type: "town"
    }
    spaces['marseille'] = {
      top: 1781,
      left: 2390,
      type: "key"
    }
    spaces['toulouse'] = {
      top: 1740,
      left: 1990,
      type: "town"
    }
    spaces['bordeaux'] = {
      top: 1568,
      left: 1780,
      type: "key"
    }

    spaces['munster'] = {
      top: 537,
      left: 2500,
      type: "town"
    }
    spaces['bremen'] = {
      top: 422,
      left: 2595,
      type: "town"
    }
    spaces['hamburg'] = {
      top: 345,
      left: 2758,
      type: "town"
    }
    spaces['lubeck'] = {
      top: 258,
      left: 2985,
      type: "town"
    }
    spaces['stettin'] = {
      top: 310,
      left: 3214,
      type: "town"
    }
    spaces['brandenburg'] = {
      top: 460,
      left: 3077,
      type: "electorate"
    }
    spaces['wittenberg'] = {
      top: 600,
      left: 3130,
      type: "electorate"
    }
    spaces['magdeburg'] = {
      top: 534,
      left: 2932,
      type: "town"
    }
    spaces['brunswick'] = {
      top: 568,
      left: 2722,
      type: "town"
    }
    spaces['cologne'] = {
      top: 716,
      left: 2500,
      type: "electorate"
    }
    spaces['kassel'] = {
      top: 714,
      left: 2665,
      type: "town"
    }
    spaces['erfurt'] = {
      top: 750,
      left: 2824,
      type: "town"
    }
    spaces['leipzig'] = {
      top: 690,
      left: 2983,
      type: "town"
    }
    spaces['regensburg'] = {
      top: 956,
      left: 3033,
      type: "town"
    }
    spaces['salzburg'] = {
      top: 1108,
      left: 3147,
      type: "town"
    }
    spaces['augsburg'] = {
      top: 1080,
      left: 2860,
      type: "electorate"
    }
    spaces['nuremberg'] = {
      top: 925,
      left: 2834,
      type: "town"
    }
    spaces['mainz'] = {
      top: 868,
      left: 2666,
      type: "electorate"
    }
    spaces['trier'] = {
      top: 894,
      left: 2516,
      type: "town"
    }
    spaces['strasburg'] = {
      top: 1070,
      left: 2578,
      type: "town"
    }
    spaces['worms'] = {
      top: 1009,
      left: 2704,
      type: "town"
    }


    spaces['navarre'] = {
      top: 1814,
      left: 1702,
      type: "key"
    }
    spaces['bilbao'] = {
      top: 1825,
      left: 1533,
      type: "town"
    }
    spaces['corunnas'] = {
      top: 1870,
      left: 1015,
      type: "town"
    }
    spaces['valladolid'] = {
      top: 2058,
      left: 1394,
      type: "key"
    }
    spaces['zaragoza'] = {
      top: 2025,
      left: 1777,
      type: "town"
    }
    spaces['barcelona'] = {
      top: 2062,
      left: 2106,
      type: "key"
    }
    spaces['palma'] = {
      top: 2266,
      left: 2211,
      type: "town"
    }
    spaces['madrid'] = {
      top: 2236,
      left: 1550,
      type: "town"
    }
    spaces['valencia'] = {
      top: 2333,
      left: 1871,
      type: "town"
    }
    spaces['cartagena'] = {
      top: 2593,
      left: 1830,
      type: "town"
    }
    spaces['granada'] = {
      top: 2657,
      left: 1558,
      type: "town"
    }
    spaces['seville'] = {
      top: 2642,
      left: 1319,
      type: "key"
    }
    spaces['cordoba'] = {
      top: 2530,
      left: 1446,
      type: "key"
    }
    spaces['gibraltar'] = {
      top: 2814,
      left: 1374,
      type: "fortress"
    }

    spaces['oran'] = {
      top: 2822,
      left: 1902,
      type: "town"
    }
    spaces['algiers'] = {
      top: 2656,
      left: 2275,
      type: "key"
    }
    spaces['tunis'] = {
      top: 2599,
      left: 2945,
      type: "key"
    }
    spaces['cagliari'] = {
      top: 2320,
      left: 2828,
      type: "town"
    }
    spaces['palermo'] = {
      top: 2421,
      left: 3260,
      type: "town"
    }
    spaces['messina'] = {
      top: 2429,
      left: 3475,
      type: "town"
    }
    spaces['cerignola'] = {
      top: 1915,
      left: 3426,
      type: "town"
    }
    spaces['taranto'] = {
      top: 2080,
      left: 3597,
      type: "town"
    }
    spaces['naples'] = {
      top: 2087,
      left: 3358,
      type: "key"
    }
    spaces['malta'] = {
      top: 2715,
      left: 3380,
      type: "fortress"
    }
    spaces['vienna'] = {
      top: 1020,
      left: 3474,
      type: "key"
    }
    spaces['linz'] = {
      top: 1045,
      left: 3288,
      type: "town"
    }
    spaces['graz'] = {
      top: 2715,
      left: 3380,
      type: "fortress"
    }
    spaces['trieste'] = {
      top: 1392,
      left: 3257,
      type: "town"
    }
    spaces['innsbruck'] = {
      top: 1170,
      left: 3016,
      type: "town"
    }


    spaces['tripoli'] = {
      top: 3030,
      left: 3316,
      type: "town"
    }
    spaces['candia'] = {
      top: 2670,
      left: 4484,
      type: "fortress"
    }
    spaces['rhodes'] = {
      top: 2524,
      left: 4730,
      type: "town"
    }
    spaces['corfu'] = {
      top: 2210,
      left: 3868,
      type: "fortress"
    }


    spaces['coron'] = {
      top: 2510,
      left: 4146,
      type: "town"
    }
    spaces['athens'] = {
      top: 2346,
      left: 4286,
      type: "town"
    }
    spaces['lepanto'] = {
      top: 2320,
      left: 4057,
      type: "town"
    }
    spaces['larissa'] = {
      top: 2184,
      left: 4130,
      type: "town"
    }
    spaces['salonika'] = {
      top: 2010,
      left: 4164,
      type: "key"
    }
    spaces['durazzo'] = {
      top: 2040,
      left: 3844,
      type: "town"
    }
    spaces['scutari'] = {
      top: 1860,
      left: 3819,
      type: "fortress"
    }
    spaces['edirne'] = {
      top: 1840,
      left: 4532,
      type: "key"
    }
    spaces['istanbul'] = {
      top: 1890,
      left: 4775,
      type: "key"
    }
    spaces['varna'] = {
      top: 1620,
      left: 4653,
      type: "town"
    }
    spaces['bucharest'] = {
      top: 1430,
      left: 4459,
      type: "town"
    }
    spaces['nicopolis'] = {
      top: 1570,
      left: 4336,
      type: "town"
    }
    spaces['sofia'] = {
      top: 1765,
      left: 4275,
      type: "town"
    }
    spaces['nezh'] = {
      top: 1652,
      left: 4070,
      type: "town"
    }


    spaces['belgrade'] = {
      top: 1450,
      left: 3894,
      type: "key"
    }
    spaces['szegedin'] = {
      top: 1268,
      left: 3846,
      type: "town"
    }
    spaces['mohacs'] = {
      top: 1353,
      left: 3710,
      type: "town"
    }
    spaces['graz'] = {
      top: 1208,
      left: 3374,
      type: "town"
    }
    spaces['agram'] = {
      top: 1373,
      left: 3460,
      type: "town"
    }
    spaces['buda'] = {
      top: 1104,
      left: 3746,
      type: "key"
    }
    spaces['pressburg'] = {
      top: 1080,
      left: 3613,
      type: "town"
    }
    spaces['brunn'] = {
      top: 840,
      left: 3526,
      type: "town"
    }
    spaces['breslau'] = {
      top: 640,
      left: 3466,
      type: "town"
    }
    spaces['prague'] = {
      top: 785,
      left: 3230,
      type: "key"
    }

    spaces['amsterdam'] = {
      top: 546,
      left: 2244,
      type: "town"
    }
    spaces['antwerp'] = {
      top: 669,
      left: 2168,
      type: "key"
    }
    spaces['brussels'] = {
      top: 823,
      left: 2201,
      type: "fortress"
    }
    spaces['liege'] = {
      top: 783,
      left: 2351,
      type: "town"
    }
    spaces['metz'] = {
      top: 995,
      left: 2384,
      type: "key"
    }
    spaces['besancon'] = {
      top: 1169,
      left: 2390,
      type: "fortress"
    }
    spaces['basel'] = {
      top: 1211,
      left: 2558,
      type: "town"
    }
    spaces['zurich'] = {
      top: 1216,
      left: 2712,
      type: "town"
    }
    spaces['geneva'] = {
      top: 1367,
      left: 2474,
      type: "town"
    }
    spaces['milan'] = {
      top: 1373,
      left: 2746,
      type: "key"
    }
    spaces['trent'] = {
      top: 1310,
      left: 2933,
      type: "town"
    }
    spaces['modena'] = {
      top: 1486,
      left: 2951,
      type: "town"
    }
    spaces['pavia'] = {
      top: 1505,
      left: 2800,
      type: "town"
    }
    spaces['turin'] = {
      top: 1530,
      left: 2585,
      type: "town"
    }
    spaces['nice'] = {
      top: 1733,
      left: 2580,
      type: "town"
    }
    spaces['florence'] = {
      top: 1642,
      left: 2976,
      type: "key"
    }
    spaces['siena'] = {
      top: 1805,
      left: 2988,
      type: "town"
    }
    spaces['bastia'] = {
      top: 1829,
      left: 2784,
      type: "town"
    }
    spaces['genoa'] = {
      top: 1626,
      left: 2726,
      type: "key"
    }
    spaces['rome'] = {
      top: 1924,
      left: 3125,
      type: "key"
    }
    spaces['ancona'] = {
      top: 1754,
      left: 3238,
      type: "town"
    }
    spaces['ravenna'] = {
      top: 1596,
      left: 3130,
      type: "key"
    }
    spaces['venice'] = {
      top: 1399,
      left: 3086,
      type: "key"
    }
    spaces['zara'] = {
      top: 1571,
      left: 3374,
      type: "town"
    }
    spaces['ragusa'] = {
      top: 1750,
      left: 3660,
      type: "town"
    }

    return spaces;

  }


  returnCards() {

    var deck = {};

    // EARLY WAR
    deck['001'] = { 
      img : "HIS-001.svg" , 
      name : "Card" ,
    }
    deck['002'] = { 
      img : "HIS-002.svg" , 
      name : "Card" ,
    }
    deck['003'] = { 
      img : "HIS-003.svg" , 
      name : "Card" ,
    }
    deck['004'] = { 
      img : "HIS-004.svg" , 
      name : "Card" ,
    }
    deck['005'] = { 
      img : "HIS-005.svg" , 
      name : "Card" ,
    }
    deck['006'] = { 
      img : "HIS-006.svg" , 
      name : "Card" ,
    }
    deck['007'] = { 
      img : "HIS-007.svg" , 
      name : "Card" ,
    }
    deck['008'] = { 
      img : "HIS-008.svg" , 
      name : "Card" ,
    }
    deck['009'] = { 
      img : "HIS-009.svg" , 
      name : "Card" ,
    }
    deck['010'] = { 
      img : "HIS-010.svg" , 
      name : "Card" ,
    }

    return deck;

  }



  returnGameOptionsHTML() {

    return `
      <div style="padding:40px;width:100vw;height:100vh;overflow-y:scroll;display:grid;grid-template-columns: 200px auto">
	<div style="top:0;left:0;">
            <label for="player1">Play as:</label>
            <select name="player1">
              <option value="random" selected>random</option>
              <option value="ussr">Protestants</option>
              <option value="us">Hapsburgs</option>
            </select>
	    <div id="game-wizard-advanced-return-btn" class="game-wizard-advanced-return-btn button">accept</div>
	</div>
    </div>
          `;

  }

} // end and export

module.exports = HereIStand;




