const GameTemplate = require('../../lib/templates/gametemplate');
const JSON = require('json-bigint');

//////////////////
// CONSTRUCTOR  //
//////////////////
class HereIStand extends GameTemplate {

  constructor(app) {

    super(app);

    this.app             = app;

    this.name  		 = "HereIStand";
    this.gamename        = "Here I Stand";
    this.slug		 = "his";
    this.description     = `Here I Stand is a boardgame based on the military, political and religious conflicts within Europe at the outbreak of the Protestant Reformation (1517-1555). Each player controls one or more major powers that dominated Europe: the Ottoman Empire, the Hapsburgs, England, France, the Papacy and the Protestant states.`;
    this.publisher_message = "Here I Stand is owned by GMT Games. This module is made available under an open source license provided by GMT Games that permits usage provided that at least one player per game has purchased a copy of the game.";
    this.categories      = "Games Arcade Entertainment";

    //
    // this sets the ratio used for determining
    // the size of the original pieces
    //
    this.boardgameWidth  = 5100;

    //
    // newbie mode
    //
    this.confirm_moves = 1;

    
    //
    // default zoom
    //
    this.gameboardZoom   = 0.90;
    this.gameboardMobileZoom = 0.67;

    //
    //
    // players
    this.minPlayers 	 = 2;
    this.maxPlayers 	 = 6;

    this.type       	 = "Strategy Boardgame";
    this.categories 	 = "Bordgame Game"

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
    this.restoreLog();
    
    //
    // initialize game objects
    //
    this.factions = {};
    this.units = {};
    this.deck = this.returnDeck();



    this.importFaction('faction2', {
      id		:	"faction2" ,
      name		: 	"English",
      nickname		: 	"English",
      img		:	"england.png",
    });
 


    this.importFaction('faction3', {
      id		:	"faction3" ,
      name		: 	"French",
      nickname		: 	"French",
      img		:	"france.png",
    });
 



    this.importFaction('faction1', {
      id		:	"faction1" ,
      name		: 	"Hapsburgs",
      nickname		: 	"Hapsburgs",
      img		:	"hapsburgs.png",
    });
 



    this.importFaction('faction5', {
      id		:	"faction5" ,
      name		: 	"Ottoman Empire",
      nickname		: 	"Ottoman",
      img		:	"ottoman.png",
    });
 



    this.importFaction('faction4', {
      id		:	"faction4" ,
      name		: 	"Papacy",
      nickname		: 	"Papacy",
      img		:	"papacy.png",
    });
 



    this.importFaction('faction6', {
      id		:	"faction6" ,
      name		: 	"Protestant",
      nickname		: 	"Protestant",
      img		:	"protestant.png",
    });
 



    this.importUnit('regular', {
      type		:	"regular" ,
      name		: 	"Regular",
    });
 
    this.importUnit('mercenary', {
      type		:	"mercenary" ,
      name		: 	"Mercenary",
    });
 
    this.importUnit('cavalry', {
      type		:	"cavalry" ,
      name		: 	"Cavalry",
    });
 
    this.importUnit('debater', {
      type		:	"debater" ,
      name		: 	"Debater",
    });
 



    //
    // initialize
    //
    if (!this.game.state) {

      this.game.state = this.returnState();
      this.game.spaces = this.returnSpaces();
      this.game.players_info = this.returnPlayers(this.game.players.length);

      this.initializeDice();

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
      this.game.queue.push("round");
      this.game.queue.push("READY");
      this.game.queue.push("init");

    }


    //
    // attach events to spaces
    //
    this.spaces = {};
    for (let key in this.game.spaces) {
      this.spaces[key] = this.importSpace(this.game.spaces[key], key);
    }


    //
    // add some units
    //
    this.addRegular(1, "london");
    this.addRegular(1, "london");
    this.addRegular(1, "london");
    this.addRegular(1, "london");
    this.addRegular(1, "worms");
    this.addMercenary(2, "paris");
    this.addDebater(2, "venice");
console.log("TEST: " + JSON.stringify(this.spaces['london']));

    //
    // and show the board
    //
    this.displayBoard();

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


    let game_mod = this;

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
      text : "Factions",
      id : "game-factions",
      class : "game-factions",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
	game_mod.menu.showSubMenu("game-factions");
      }
    });
    this.menu.addSubMenuOption("game-factions", {
      text : "Hapsburgs",
      id : "game-hapsburgs",
      class : "game-hapsburgs",
      callback : function(app, game_mod) {
        game_mod.displayFactionSheet("faction1"); 
      }
    });
    this.menu.addSubMenuOption("game-factions", {
      text : "England",
      id : "game-england",
      class : "game-england",
      callback : function(app, game_mod) {
        game_mod.displayFactionSheet("faction2"); 
      }
    });
    this.menu.addSubMenuOption("game-factions", {
      text : "France",
      id : "game-france",
      class : "game-france",
      callback : function(app, game_mod) {
        game_mod.displayFactionSheet("faction3");
      }
    });
    this.menu.addSubMenuOption("game-factions", {
      text : "Ottoman Empire",
      id : "game-ottoman",
      class : "game-ottoman",
      callback : function(app, game_mod) {
        game_mod.displayFactionSheet("faction5");
      }
    });
    this.menu.addSubMenuOption("game-factions", {
      text : "Protestants",
      id : "game-protestants",
      class : "game-protestants",
      callback : function(app, game_mod) {
        game_mod.displayFactionSheet("faction6");
      }
    });
    this.menu.addSubMenuOption("game-factions", {
      text : "Papacy",
      id : "game-papacy",
      class : "game-papacy",
      callback : function(app, game_mod) {
        game_mod.displayFactionSheet("faction4");
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
	  let obj = document.getElementById(key);
	  obj.style.top = spaces[key].top + "px";
	  obj.style.left = spaces[key].left + "px";
        } catch (err) {
	}
      }
    }

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





  addRegular(player, space) {
console.log("ADD REGULAR");
    this.spaces[space].units[player-1].push(this.newUnit(player, "regular"));
  }

  addMercenary(player, space) {
    this.spaces[space].units[player-1].push(this.newUnit(player, "mercenary"));
  }

  addDebater(player, space) {
    this.spaces[space].units[player-1].push(this.newUnit(player, "debater"));
  }

  convertSpace(religion, space) {
    this.spaces[space].religion = religion;
    this.displayBoard();
  }


  /////////////////////
  // Core Game State //
  /////////////////////
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
      home: "scotland",
      political: "scotland",
      religious: "catholic",
      type: "fortress"
    }
    spaces['glasgow'] = {
      top: 225,
      left: 1285,
      home: "scotland",
      political: "scotland",
      religious: "catholic",
      type: "town"
    }
    spaces['edinburgh'] = {
      top: 125,
      left: 1420,
      home: "scotland",
      political: "scotland",
      religious: "catholic",
      type: "key"
    }
    spaces['berwick'] = {
      top: 183,
      left: 1572,
      home: "england",
      political: "england",
      religious: "catholic",
      type: "town"
    }
    spaces['carlisle'] = {
      top: 276,
      left: 1447,
      home: "england",
      political: "england",
      religious: "catholic",
      type: "town"
    }
    spaces['york'] = {
      top: 375,
      left: 1595,
      home: "england",
      political: "england",
      religious: "catholic",
      type: "key"
    }
    spaces['wales'] = {
      top: 633,
      left: 1398,
      home: "england",
      political: "england",
      religious: "catholic",
      type: "town"
    }
    spaces['shrewsbury'] = {
      top: 521,
      left: 1535,
      home: "england",
      political: "england",
      religious: "catholic",
      type: "town"
    }
    spaces['lincoln'] = {
      top: 531,
      left: 1706,
      home: "england",
      political: "england",
      religious: "catholic",
      type: "town"
    }
    spaces['norwich'] = {
      top: 538,
      left: 1896,
      home: "england",
      political: "england",
      religious: "catholic",
      type: "town"
    }
    spaces['bristol'] = {
      top: 688,
      left: 1554,
      home: "england",
      political: "england",
      religious: "catholic",
      type: "key"
    }
    spaces['london'] = {
      top: 706,
      left: 1785,
      home: "england",
      political: "england",
      religious: "catholic",
      type: "key"
    }
    spaces['plymouth'] = {
      top: 898,
      left: 1398,
      home: "england",
      political: "england",
      religious: "catholic",
      type: "town"
    }
    spaces['portsmouth'] = {
      top: 821,
      left: 1661,
      home: "england",
      political: "england",
      religious: "catholic",
      type: "town"
    }
    spaces['calais'] = {
      top: 745,
      left: 2022,
      home: "england",
      political: "england",
      religious: "catholic",
      type: "key"
    }

    spaces['boulogne'] = {
      top: 880,
      left: 1955,
      home: "france",
      political: "france",
      religious: "catholic",
      type: "town"
    }
    spaces['stquentin'] = {
      top: 933,
      left: 2093,
      home: "france",
      political: "france",
      religious: "catholic",
      type: "town"
    }
    spaces['stdizier'] = {
      top: 1043,
      left: 2205,
      home: "france",
      political: "france",
      religious: "catholic",
      type: "town"
    }
    spaces['paris'] = {
      top: 1063,
      left: 2009,
      home: "france",
      political: "france",
      religious: "catholic",
      type: "key"
    }
    spaces['rouen'] = {
      top: 1000,
      left: 1805,
      home: "france",
      political: "france",
      religious: "catholic",
      type: "key"
    }
    spaces['orleans'] = {
      top: 1217,
      left: 2018,
      home: "france",
      political: "france",
      religious: "catholic",
      type: "town"
    }
    spaces['dijon'] = {
      top: 1205,
      left: 2204,
      home: "france",
      political: "france",
      religious: "catholic",
      type: "town"
    }
    spaces['limoges'] = {
      top: 1398,
      left: 1975,
      home: "france",
      political: "france",
      religious: "catholic",
      type: "town"
    }
    spaces['tours'] = {
      top: 1277,
      left: 1849,
      home: "france",
      political: "france",
      religious: "catholic",
      type: "town"
    }
    spaces['nantes'] = {
      top: 1310,
      left: 1650,
      home: "france",
      political: "france",
      religious: "catholic",
      type: "town"
    }
    spaces['brest'] = {
      top: 1173,
      left: 1409,
      home: "france",
      political: "france",
      religious: "catholic",
      type: "town"
    }
    spaces['bordeaux'] = {
      top: 1568,
      left: 1780,
      home: "france",
      political: "france",
      religious: "catholic",
      type: "key"
    }
    spaces['lyon'] = {
      top: 1445,
      left: 2312,
      home: "france",
      political: "france",
      religious: "catholic",
      type: "key"
    }
    spaces['grenoble'] = {
      top: 1590,
      left: 2437,
      home: "france",
      political: "france",
      religious: "catholic",
      type: "town"
    }
    spaces['avignon'] = {
      top: 1645,
      left: 2292,
      home: "france",
      political: "france",
      religious: "catholic",
      type: "town"
    }
    spaces['marseille'] = {
      top: 1781,
      left: 2390,
      home: "france",
      political: "france",
      religious: "catholic",
      type: "key"
    }
    spaces['toulouse'] = {
      top: 1740,
      left: 1990,
      home: "france",
      political: "france",
      religious: "catholic",
      type: "town"
    }
    spaces['bordeaux'] = {
      top: 1568,
      left: 1780,
      home: "france",
      political: "france",
      religious: "catholic",
      type: "key"
    }

    spaces['munster'] = {
      top: 537,
      left: 2500,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "town"
    }
    spaces['bremen'] = {
      top: 422,
      left: 2595,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "town"
    }
    spaces['hamburg'] = {
      top: 345,
      left: 2758,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "town"
    }
    spaces['lubeck'] = {
      top: 258,
      left: 2985,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "town"
    }
    spaces['stettin'] = {
      top: 310,
      left: 3214,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "town"
    }
    spaces['brandenburg'] = {
      top: 460,
      left: 3077,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "electorate"
    }
    spaces['wittenberg'] = {
      top: 600,
      left: 3130,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "electorate"
    }
    spaces['magdeburg'] = {
      top: 534,
      left: 2932,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "town"
    }
    spaces['brunswick'] = {
      top: 568,
      left: 2722,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "town"
    }
    spaces['cologne'] = {
      top: 716,
      left: 2500,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "electorate"
    }
    spaces['kassel'] = {
      top: 714,
      left: 2665,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "town"
    }
    spaces['erfurt'] = {
      top: 750,
      left: 2824,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "town"
    }
    spaces['leipzig'] = {
      top: 690,
      left: 2983,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "town"
    }
    spaces['regensburg'] = {
      top: 956,
      left: 3033,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "town"
    }
    spaces['salzburg'] = {
      top: 1108,
      left: 3147,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "town"
    }
    spaces['augsburg'] = {
      top: 1080,
      left: 2860,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "electorate"
    }
    spaces['nuremberg'] = {
      top: 925,
      left: 2834,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "town"
    }
    spaces['mainz'] = {
      top: 868,
      left: 2666,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "electorate"
    }
    spaces['trier'] = {
      top: 894,
      left: 2516,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "town"
    }
    spaces['strasburg'] = {
      top: 1070,
      left: 2578,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "town"
    }
    spaces['worms'] = {
      top: 1009,
      left: 2704,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "town"
    }


    spaces['navarre'] = {
      top: 1814,
      left: 1702,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "key"
    }
    spaces['bilbao'] = {
      top: 1825,
      left: 1533,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['corunnas'] = {
      top: 1870,
      left: 1015,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['valladolid'] = {
      top: 2058,
      left: 1394,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "key"
    }
    spaces['zaragoza'] = {
      top: 2025,
      left: 1777,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['barcelona'] = {
      top: 2062,
      left: 2106,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "key"
    }
    spaces['palma'] = {
      top: 2266,
      left: 2211,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['madrid'] = {
      top: 2236,
      left: 1550,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['valencia'] = {
      top: 2333,
      left: 1871,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['cartagena'] = {
      top: 2593,
      left: 1830,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['granada'] = {
      top: 2657,
      left: 1558,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['seville'] = {
      top: 2642,
      left: 1319,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "key"
    }
    spaces['cordoba'] = {
      top: 2530,
      left: 1446,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['gibraltar'] = {
      top: 2814,
      left: 1374,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "fortress"
    }

    spaces['oran'] = {
      top: 2822,
      left: 1902,
      home: "hapsburg ottoman",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['algiers'] = {
      top: 2656,
      left: 2275,
      home: "ottoman independent",
      political: "",
      religious: "catholic",
      type: "key"
    }
    spaces['tunis'] = {
      top: 2599,
      left: 2945,
      home: "independent",
      political: "",
      religious: "catholic",
      type: "key"
    }
    spaces['cagliari'] = {
      top: 2320,
      left: 2828,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['palermo'] = {
      top: 2421,
      left: 3260,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['messina'] = {
      top: 2429,
      left: 3475,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['cerignola'] = {
      top: 1915,
      left: 3426,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['taranto'] = {
      top: 2080,
      left: 3597,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['naples'] = {
      top: 2087,
      left: 3358,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "key"
    }
    spaces['malta'] = {
      top: 2715,
      left: 3380,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "fortress"
    }
    spaces['vienna'] = {
      top: 1020,
      left: 3474,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "key"
    }
    spaces['linz'] = {
      top: 1045,
      left: 3288,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['graz'] = {
      top: 2715,
      left: 3380,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['trieste'] = {
      top: 1392,
      left: 3257,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['innsbruck'] = {
      top: 1170,
      left: 3016,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "town"
    }


    spaces['tripoli'] = {
      top: 3030,
      left: 3316,
      home: "hapsburg ottoman",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['candia'] = {
      top: 2670,
      left: 4484,
      home: "venice",
      political: "",
      religious: "catholic",
      type: "fortress"
    }
    spaces['rhodes'] = {
      top: 2524,
      left: 4730,
      home: "independent",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['corfu'] = {
      top: 2210,
      left: 3868,
      home: "venice",
      political: "",
      religious: "catholic",
      type: "fortress"
    }


    spaces['coron'] = {
      top: 2510,
      left: 4146,
      home: "",
      political: "",
      religious: "other",
      type: "town"
    }
    spaces['athens'] = {
      top: 2346,
      left: 4286,
      home: "ottoman",
      political: "",
      religious: "other",
      type: "key"
    }
    spaces['lepanto'] = {
      top: 2320,
      left: 4057,
      home: "ottoman",
      political: "",
      religious: "other",
      type: "town"
    }
    spaces['larissa'] = {
      top: 2184,
      left: 4130,
      home: "ottoman",
      political: "",
      religious: "other",
      type: "town"
    }
    spaces['salonika'] = {
      top: 2010,
      left: 4164,
      home: "ottoman",
      political: "",
      religious: "other",
      type: "key"
    }
    spaces['durazzo'] = {
      top: 2040,
      left: 3844,
      home: "ottoman",
      political: "",
      religious: "other",
      type: "town"
    }
    spaces['scutari'] = {
      top: 1860,
      left: 3819,
      home: "ottoman",
      political: "",
      religious: "other",
      type: "fortress"
    }
    spaces['edirne'] = {
      top: 1840,
      left: 4532,
      home: "ottoman",
      political: "",
      religious: "other",
      type: "key"
    }
    spaces['istanbul'] = {
      top: 1890,
      left: 4775,
      home: "ottoman",
      political: "",
      religious: "other",
      type: "key"
    }
    spaces['varna'] = {
      top: 1620,
      left: 4653,
      home: "ottoman",
      political: "",
      religious: "other",
      type: "town"
    }
    spaces['bucharest'] = {
      top: 1430,
      left: 4459,
      home: "ottoman",
      political: "",
      religious: "other",
      type: "town"
    }
    spaces['nicopolis'] = {
      top: 1570,
      left: 4336,
      home: "ottoman",
      political: "",
      religious: "other",
      type: "town"
    }
    spaces['sofia'] = {
      top: 1765,
      left: 4275,
      home: "ottoman",
      political: "",
      religious: "other",
      type: "town"
    }
    spaces['nezh'] = {
      top: 1652,
      left: 4070,
      home: "ottoman",
      political: "",
      religious: "other",
      type: "town"
    }


    spaces['belgrade'] = {
      top: 1450,
      left: 3894,
      home: "hungary",
      political: "",
      religious: "catholic",
      type: "key"
    }
    spaces['szegedin'] = {
      top: 1268,
      left: 3846,
      home: "hungary",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['mohacs'] = {
      top: 1353,
      left: 3710,
      home: "hungary",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['graz'] = {
      top: 1208,
      left: 3374,
      home: "hungary",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['agram'] = {
      top: 1373,
      left: 3460,
      home: "hungary",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['buda'] = {
      top: 1104,
      left: 3746,
      home: "hungary",
      political: "",
      religious: "catholic",
      type: "key"
    }
    spaces['pressburg'] = {
      top: 1080,
      left: 3613,
      home: "hungary",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['brunn'] = {
      top: 840,
      left: 3526,
      home: "hungary",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['breslau'] = {
      top: 640,
      left: 3466,
      home: "hungary",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['prague'] = {
      top: 785,
      left: 3230,
      home: "hungary",
      political: "",
      religious: "catholic",
      type: "key"
    }


    spaces['amsterdam'] = {
      top: 546,
      left: 2244,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['antwerp'] = {
      top: 669,
      left: 2168,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "key"
    }
    spaces['brussels'] = {
      top: 823,
      left: 2201,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "fortress"
    }
    spaces['liege'] = {
      top: 783,
      left: 2351,
      home: "independent",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['metz'] = {
      top: 995,
      left: 2384,
      home: "independent",
      political: "",
      religious: "catholic",
      type: "key"
    }
    spaces['besancon'] = {
      top: 1169,
      left: 2390,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "fortress"
    }
    spaces['basel'] = {
      top: 1211,
      left: 2558,
      home: "independent",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['zurich'] = {
      top: 1216,
      left: 2712,
      home: "independent",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['geneva'] = {
      top: 1367,
      left: 2474,
      home: "independent",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['milan'] = {
      top: 1373,
      left: 2746,
      home: "independent",
      political: "",
      religious: "catholic",
      type: "key"
    }
    spaces['trent'] = {
      top: 1310,
      left: 2933,
      home: "independent",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['modena'] = {
      top: 1486,
      left: 2951,
      home: "independent",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['pavia'] = {
      top: 1505,
      left: 2800,
      home: "independent",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['turin'] = {
      top: 1530,
      left: 2585,
      home: "independent",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['nice'] = {
      top: 1733,
      left: 2580,
      home: "independent",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['florence'] = {
      top: 1642,
      left: 2976,
      home: "independent",
      political: "",
      religious: "catholic",
      type: "key"
    }
    spaces['siena'] = {
      top: 1805,
      left: 2988,
      home: "independent",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['bastia'] = {
      top: 1829,
      left: 2784,
      home: "genoa",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['genoa'] = {
      top: 1626,
      left: 2726,
      home: "genoa",
      political: "",
      religious: "catholic",
      type: "key"
    }
    spaces['rome'] = {
      top: 1924,
      left: 3125,
      home: "papacy",
      political: "",
      religious: "catholic",
      type: "key"
    }
    spaces['ancona'] = {
      top: 1754,
      left: 3238,
      home: "papacy",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['ravenna'] = {
      top: 1596,
      left: 3130,
      home: "papacy",
      political: "",
      religious: "catholic",
      type: "key"
    }
    spaces['venice'] = {
      top: 1399,
      left: 3086,
      home: "venice",
      political: "",
      religious: "catholic",
      type: "key"
    }
    spaces['zara'] = {
      top: 1571,
      left: 3374,
      home: "venice",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['ragusa'] = {
      top: 1750,
      left: 3660,
      home: "independent",
      political: "",
      religious: "catholic",
      type: "town"
    }


    for (let key in spaces) {
      spaces[key].units = [];
      for (let i = 0; i < this.game.players.length; i++) {
	spaces[key].units.push([]);
      }
    }

    return spaces;

  }


  returnElectorateDisplay() {

    let electorates = {};

    electorates['augsburg'] = {
      top: 190,
      left: 3380,
    }
    electorates['trier'] = {
      top: 190,
      left: 3510,
    }
    electorates['cologne'] = {
      top: 190,
      left: 3642,
    }
    electorates['wittenberg'] = {
      top: 376,
      left: 3380,
    }
    electorates['mainz'] = {
      top: 376,
      left: 3510,
    }
    electorates['brandenburg'] = {
      top: 376,
      left: 3642,
    }

    return electorates;

  }

  //
  // import space attaches events / functions to spaces if they do not exist
  //
  importSpace(obj, key) {

    obj.key = key;

    if (obj.name == null)               { obj.name = "Unknown"; }
    if (obj.owner == null)              { obj.owner = -1; }          
    if (obj.type == null)               { obj.type = "town"; }     
    if (obj.debaters == null)           { obj.debaters = []; }     
    if (obj.returnView == null)		{ 

      obj.returnView = function () {
	return `
	  <div class="space_view" id="">
	    This is the detailed view of the city or town.
	  </div>
	`;
      };

    }

    return obj;

  }



  returnDeck() {

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
      event : function(player) {
alert("Luther's Event is Triggered!");
      }
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




  //
  // Core Game Logic
  //
  handleGameLoop() {

console.log("handle game loop...");

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
	  if (this.game.state.round > 1) {
	    this.log.updateLog("Luther's 95 Theses!");
	    this.game.queue.push("event\t1\t008");
	    this.convertSpace("protestant", "wittenberg");
	    this.addUnit("regular", 1, "wittenberg");
	    this.addUnit("regular", 1, "wittenberg");
	    this.addUnit("luther", 1, "wittenberg");
	  }


          return 1;
        }

        if (mv[0] === "event") {

	  let player = mv[1];
	  let card = mv[2];

	  this.deck[card].triggerEvent(1);

	  this.game.queue.splice(qe, 1);

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





  returnPlayers(num = 0) {

    var players = [];
    let factions = JSON.parse(JSON.stringify(this.factions));

    for (let i = 0; i < num; i++) {

      if (i == 0) { col = "color1"; }
      if (i == 1) { col = "color2"; }
      if (i == 2) { col = "color3"; }
      if (i == 3) { col = "color4"; }
      if (i == 4) { col = "color5"; }
      if (i == 5) { col = "color6"; }

      var keys = Object.keys(factions);
      let rf = keys[this.rollDice(keys.length) - 1];

      if (i == 0) {
        if (this.game.options.player1 != undefined) {
          if (this.game.options.player1 != "random") {
            rf = this.game.options.player1;
          }
        }
      }
      if (i == 1) {
        if (this.game.options.player2 != undefined) {
          if (this.game.options.player2 != "random") {
            rf = this.game.options.player2;
          }
        }
      }
      if (i == 2) {
        if (this.game.options.player3 != undefined) {
          if (this.game.options.player3 != "random") {
            rf = this.game.options.player3;
          }
        }
      }
      if (i == 3) {
        if (this.game.options.player4 != undefined) {
          if (this.game.options.player4 != "random") {
            rf = this.game.options.player4;
          }
        }
      }
      if (i == 4) {
        if (this.game.options.player5 != undefined) {
          if (this.game.options.player5 != "random") {
            rf = this.game.options.player5;
          }
        }
      }
      if (i == 5) {
        if (this.game.options.player6 != undefined) {
          if (this.game.options.player6 != "random") {
            rf = this.game.options.player6;
          }
        }
      }

      delete factions[rf];


      players[i] = {};
      players[i].faction = rf;

    }

    return players;

  }



  playerTurn(selected_card=null) {

    this.startClock();

    let his_self = this;

    this.updateStatusAndListCards(user_message, this.game.deck[0].hand);
    twilight_self.addShowCardEvents(function(card) {
      twilight_self.playerTurnCardSelected(card, player);
    });

  }




  importFaction(name, obj) {

console.log("importing faction " + name);

    if (obj.id == null)                 { obj.id = "faction"; }
    if (obj.name == null)               { obj.name = "Unknown Faction"; }
    if (obj.img == null)                { obj.img = ""; }
    if (obj.returnFactionSheet == null) {
      obj.returnFactionSheet = function(faction) {
        return `
	  <div class="faction_sheet" id="faction" style="background-image: url('/his/img/factions/${obj.img}')">
	  </div>
	`;
      }
    }

    //obj = this.addEvents(obj);
    this.factions[name] = obj;

  }





  importUnit(name, obj) {

    if (obj.type == null)               { obj.type = "unit"; }
    if (obj.name == null)               { obj.name = "Unit"; }
    if (obj.img == null)                { obj.img = ""; }

    //obj = this.addEvents(obj);
    this.units[name] = obj;

  }

  newUnit(player, type) {
    for (let key in this.units) {
      if (this.units[key].type === type) {
	let new_unit = JSON.parse(JSON.stringify(this.units[key]));
	new_unit.owner = player;
	return new_unit;
      }
    }
    return null;
  }


  displayFactionSheet(faction) {
    let html = this.factions[faction].returnFactionSheet(faction);
    this.overlay.showOverlay(this.app, this, html);
  }

  displayBoard() {

    try {

      this.displayColony();
      this.displayConquest();
      this.displayElectorateDisplay();
      this.displayNewWorld();
      this.displaySpaces();
      this.displayVictoryTrack();

    } catch (err) {

      console.log("error displaying board... " + err);

    }
  }

  displayColony() {
  }

  displayConquest() {
  }

  displayNewWorld() {
  }

  displaySpace(name) {
    let html = this.spaces[name].returnView();    
    this.overlay.showOverlay(this.app, this, html);
  }

  displayElectorateDisplay() {

    let elecs = this.returnElectorateDisplay();
    for (let key in elecs) {
      let obj = document.getElementById(`ed_${key}`);
      let tile = this.returnSpaceTile(this.spaces[key]);
      obj.innerHTML = ` <img class="hextile" src="${tile}" />`;      
    }
  }

  returnSpaceTile(space) {

    let owner = space.political;
    if (owner == "") { owner = space.home; }
    let tile = "";
    let stype = "hex";

    if (space.type == "town") { stype = "hex"; }
    if (space.type == "key") { stype = "key"; }

    if (owner != "") {
      if (owner === "hapsburg") {
        tile = "/his/img/tiles/hapsburg/";	  
        if (space.religion === "protestant") {
          tile += `Hapsburg_${stype}_back.svg`;
        } else {
          tile += `Hapsburg_${stype}.svg`;
        }
      }
      if (owner === "england") {
        tile = "/his/img/tiles/england/";	  
        if (space.religion === "protestant") {
          tile += `England_${stype}_back.svg`;
        } else {
          tile += `England_${stype}.svg`;
        }
      }
      if (owner === "france") {
        tile = "/his/img/tiles/france/";	  
        if (space.religion === "protestant") {
          tile += `France_${stype}_back.svg`;
        } else {
          tile += `France_${stype}.svg`;
        }
      }
      if (owner === "papacy") {
        tile = "/his/img/tiles/papacy/";	  
        if (space.religion === "protestant") {
          tile += `Papacy_${stype}_back.svg`;
	} else {
	  tile += `Papacy_${stype}.svg`;
	}
      }
      if (owner === "protestant") {
        tile = "/his/img/tiles/protestant/";	  
        if (space.religion === "protestant") {
          tile += `Protestant_${stype}_back.svg`;
        } else {
          tile += `Protestant_${stype}.svg`;
        }
      }
      if (owner === "ottoman") {
        tile = "/his/img/tiles/ottoman/";	  
        if (space.religion === "protestant") {
          tile += `Ottoman_${stype}_back.svg`;
        } else {
          tile += `Ottoman_${stype}.svg`;
        }
      }
    }

    return tile;

  }

  returnArmies(space) {

    let html = '<div class="space_army" id="">';
    let owner = space.political;
    if (owner == "") { owner = space.home; }
    let tile = "";


    for (let z = 0; z < this.game.players.length; z++) {

      let army = 0;
      for (let zz = 0; zz < space.units[z].length; zz++) {
	if (space.units[z][zz].type === "regular") {
	  army++;
	}
      }

      while (army >= 1) {
        if (owner != "") {
          if (owner === "hapsburg") {
            tile = "/his/img/tiles/hapsburg/";	  
	    if (army >= 4) {
              tile += `HapsburgReg-4.svg`;
	      army -= 4;
	    }
	    if (army >= 2) {
              tile += `HapsburgReg-2.svg`;
	      army -= 2;
	    }
	    if (army >= 1) {
              tile += `HapsburgReg-1.svg`;
	      army -= 1;
	    }
          }
          if (owner === "england") {
            tile = "/his/img/tiles/england/";	  
	    if (army >= 4) {
              tile += `EnglandReg-4.svg`;
	      army -= 4;
            }
	    if (army >= 2) {
              tile += `EnglandReg-2.svg`;
	      army -= 4;
            }
	    if (army >= 1) {
              tile += `EnglandReg-1.svg`;
	      army -= 1;
            }
          }
          if (owner === "france") {
            tile = "/his/img/tiles/france/";	  
	    if (army >= 4) {
              tile += `FrenchReg-4.svg`;
	      army -= 4;
            }
	    if (army >= 2) {
              tile += `FrenchReg-2.svg`;
	      army -= 2;
            }
	    if (army >= 1) {
              tile += `FrenchReg-1.svg`;
	      army -= 1;
            }
          }
          if (owner === "papacy") {
            tile = "/his/img/tiles/papacy/";	  
	    if (army >= 4) {
              tile += `PapacyReg-4.svg`;
	      army -= 4;
	    }
	    if (army >= 2) {
              tile += `PapacyReg-2.svg`;
	      army -= 2;
	    }
	    if (army >= 1) {
              tile += `PapacyReg-1.svg`;
	      army -= 1;
	    }
          }
          if (owner === "protestant") {
            tile = "/his/img/tiles/protestant/";	  
	    if (army >= 4) {
              tile += `ProtestantReg-4.svg`;
	      army -= 4;
            }
	    if (army >= 2) {
              tile += `ProtestantReg-2.svg`;
	      army -= 2;
            }
	    if (army >= 1) {
              tile += `ProtestantReg-1.svg`;
	      army -= 1;
            }
          }
          if (owner === "ottoman") {
            tile = "/his/img/tiles/ottoman/";	  
	    if (army >= 4) {
              tile += `OttomanReg-4.svg`;
	      army -= 4;
            }
	    if (army >= 2) {
              tile += `OttomanReg-2.svg`;
	      army -= 2;
            }
	    if (army >= 1) {
              tile += `OttomanReg-1.svg`;
	      army -= 1;
            }
          }
        }
        html += `<img class="army_tile" src="${tile}" />`;
      }
    }

    html += '</div>';

    if (tile === "") { return tile; }

    return html;

  }

  returnMercenaries(space) {

    let html = '<div class="space_mercenaries" id="">';
    let owner = space.political;
    if (owner == "") { owner = space.home; }
    let tile = "";

    for (let z = 0; z < this.game.players.length; z++) {

      let army = 0;
      for (let zz = 0; zz < space.units[z].length; zz++) {
        if (space.units[z][zz].type === "mercenary") {
          army++;
        }
      }

      for (let i = 0; i < army; i+= 2) {
        if (owner != "") {
          if (owner === "hapsburg") {
            tile = "/his/img/tiles/hapsburg/";	  
	    if (army >= 4) {
              tile += `HapsburgMerc-4.svg`;
	      army -= 4;
	    }
	    if (army >= 2) {
              tile += `HapsburgMerc-2.svg`;
	      army -= 2;
	    }
	    if (army >= 1) {
              tile += `HapsburgMerc-1.svg`;
	      army -= 1;
	    }
          }
          if (owner === "england") {
            tile = "/his/img/tiles/england/";	  
	    if (army >= 4) {
              tile += `EnglandMerc-4.svg`;
	      army -= 4;
            }
	    if (army >= 2) {
              tile += `EnglandMerc-2.svg`;
	      army -= 4;
            }
	    if (army >= 1) {
              tile += `EnglandMerc-1.svg`;
	      army -= 1;
            }
          }
          if (owner === "france") {
            tile = "/his/img/tiles/france/";	  
	    if (army >= 4) {
              tile += `FrenchMerc-4.svg`;
	      army -= 4;
            }
	    if (army >= 2) {
              tile += `FrenchMerc-2.svg`;
	      army -= 2;
            }
	    if (army >= 1) {
              tile += `FrenchMerc-1.svg`;
	      army -= 1;
            }
          }
          if (owner === "papacy") {
            tile = "/his/img/tiles/papacy/";	  
	    if (army >= 4) {
              tile += `PapacyMerc-4.svg`;
	      army -= 4;
	    }
	    if (army >= 2) {
              tile += `PapacyMerc-2.svg`;
	      army -= 2;
	    }
	    if (army >= 1) {
              tile += `PapacyMerc-1.svg`;
	      army -= 1;
	    }
          }
          if (owner === "protestant") {
            tile = "/his/img/tiles/protestant/";	  
	    if (army >= 4) {
              tile += `ProtestantMerc-4.svg`;
	      army -= 4;
            }
	    if (army >= 2) {
              tile += `ProtestantMerc-2.svg`;
	      army -= 2;
            }
	    if (army >= 1) {
              tile += `ProtestantMerc-1.svg`;
	      army -= 1;
            }
          }
          if (owner === "ottoman") {
            tile = "/his/img/tiles/ottoman/";	  
	    if (army >= 4) {
              tile += `OttomanMerc-4.svg`;
	      army -= 4;
            }
	    if (army >= 2) {
              tile += `OttomanMerc-2.svg`;
	      army -= 2;
            }
	    if (army >= 1) {
              tile += `OttomanMerc-1.svg`;
	      army -= 1;
            }
          }
        }
        html += `<img class="mercenary_tile" src="${tile}" />`;
      }
    }

    html += '</div>';

    if (tile === "") { return tile; }

    return html;

  }

  returnDebaters(space) {

    let html = '<div class="debater_tile" id="">';
    let owner = space.political;
    if (owner == "") { owner = space.home; }
    let tile = "";

    for (let z = 0; z < this.game.players.length; z++) {
      for (let zz = 0; zz < space.units[z].length; zz++) {
	if (space.units[z][zz].type === "debater") {
          html += '<img src="/his/img/tiles/debaters/AleanderDebater_back.svg" />';
	}
      }
    }

    html += '</div>';

    if (tile === "") { return tile; }

    return html;

  }

  displaySpaces() {

    //
    // add tiles
    //
    for (let key in this.spaces) {
      if (this.spaces.hasOwnProperty(key)) {

        let obj = document.getElementById(key);
	let space = this.spaces[key];
	let tile = this.returnSpaceTile(space);
        let stype = "hex";

        if (space.type == "town") { stype = "hex"; }
        if (space.type == "key") { stype = "key"; }

	//
	// should we show the tile?
	//
	let show_tile = 1;

	//
	// do not show under some conditions
	//
	if (space.political == space.home) { show_tile = 0; }
	if (space.political === "") { show_tile = 0; }

	//
	// and force for keys
	//
	if (space.home === "" && space.political !== "") { show_tile = 1; }
	if (space.type === "key") { show_tile = 1; }

	//
	// sanity check
	//
	if (tile === "") { show_tile = 0; }

	if (show_tile === 1) {
	  obj.innerHTML = `<img class="${stype}tile" src="${tile}" />`;
	  obj.innerHTML += this.returnArmies(space);
	  obj.innerHTML += this.returnMercenaries(space);
	  obj.innerHTML += this.returnDebaters(space);
	}

      }
    }


    //
    // add click event
    //
    for (let key in this.spaces) {
      if (this.spaces.hasOwnProperty(key)) {
        document.getElementById(key).onclick = (e) => {
	  this.displaySpace(key);
        }
      }
    }

  }

  displayVictoryTrack() {
  }




} // end and export

module.exports = HereIStand;


