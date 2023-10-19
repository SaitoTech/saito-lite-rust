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
    this.deck = this.returnDeck();



    let first_time_running = 0;

    //
    // initialize
    //
    if (!this.game.state) {

      this.game.state = this.returnState();
      this.game.state.players_info = this.returnPlayers(this.game.players.length);
      this.game.spaces = this.returnSpaces();

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
    // attach events to spaces
    //
    this.spaces = {};
    for (let key in this.game.spaces) {
      this.spaces[key] = this.importSpace(this.game.spaces[key], key);
    }

    //
    // add initial units
    //
    if (first_time_running == 1) {
    }

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
        ps : 4 ,
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
        ps : 4 ,
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
        ps : 4 ,
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
        ps : 4 ,
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
        ps : 4 ,
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
        ps : 4 ,
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
        ps : 4 ,
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
        ps : 4 ,
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
        ps : 4 ,
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
        ps : 4 ,
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
        ps : 4 ,
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
        ps : 4 ,
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
        ps : 4 ,
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
        ps : 4 ,
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
        ps : 4 ,
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
        ps : 4 ,
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
        ps : 4 ,
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
        ps : 4 ,
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
        ps : 4 ,
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
        ps : 4 ,
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


  displayBoard() {

    let paths_self = this;

    //
    // display the spaces on the board
    //
    try {
      this.displaySpaces();
    } catch (err) {
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
console.log("display: " + key);
  }

  displaySpaceDetailedView(key) {
alert("display detailed space!");
  }

  displaySpaces() {

    let paths_self = this;

    if (!this.game.state.board) {
      this.game.state.board["protestant"] = this.returnOnBoardUnits("protestant");
      this.game.state.board["papacy"] = this.returnOnBoardUnits("papacy");
      this.game.state.board["england"] = this.returnOnBoardUnits("england");
      this.game.state.board["france"] = this.returnOnBoardUnits("france");
      this.game.state.board["ottoman"] = this.returnOnBoardUnits("ottoman");
      this.game.state.board["hapsburg"] = this.returnOnBoardUnits("hapsburg");
    }

    //
    // add tiles
    //
    for (let key in this.spaces) {
      if (this.spaces.hasOwnProperty(key)) {
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
          paths_self.theses_overlay.renderAtCoordinates(xpos, ypos);
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



  returnSpaceName(spacekey) {
    if (this.game.spaces[spacekey]) { return this.game.spaces[spacekey].name; }
    if (this.game.navalspaces[spacekey]) { return this.game.navalspaces[spacekey].name; }
    return spacekey;
  }

  resetBesiegedSpaces() {
    for (let space in this.game.spaces) {
      if (space.besieged == 2) { space.besieged = 1; }
    }
  }
  resetLockedTroops() {
    for (let space in this.game.spaces) {
      for (let f in this.game.spaces[space].units) {
        for (let z = 0; z < this.game.spaces[space].units[f].length; z++) {
          this.game.spaces[space].units[f][z].locked = false;
        }
      }
    }
  }

  addUnrest(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    space.unrest = 1;
  }

  removeUnrest(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    space.unrest = 0;
  }

  hasProtestantReformer(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < space.units["protestant"].length; i++) {
      let unit = space.units["protestant"][i];
      if (unit.reformer) { return true; }
    }
    for (let i = 0; i < space.units["england"].length; i++) {
      let unit = space.units["england"][i];
      if (unit.reformer) { return true; }
    }
    for (let i = 0; i < space.units["france"].length; i++) {
      let unit = space.units["france"][i];
      if (unit.reformer) { return true; }
    }
    return false;
  }


  hasProtestantLandUnits(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    //
    // only protestant units count
    //
    for (let i = 0; i < space.units["protestant"].length; i++) {
      let unit = space.units["protestant"][i];
      if (unit.type == "regular" || unit.type == "mercenary") { return true; }
    }

    //
    // unless Edward VI or Elizabeth I are on the throne
    //
    if (this.game.state.leaders.edward_vi == 1 || this.game.state.leaders.elizabeth_i == 1) {

      //
      // then british mercenaries and regulars count
      //
      for (let i = 0; i < space.units["england"].length; i++) {
        let unit = space.units["england"][i];
        if (unit.type == "regular" || unit.type == "mercenary") { return true; }
      }

      //
      // or Scottish ones if Scotland is allied to England
      //
      if (this.areAllies("england", "scotland")) {
        for (let i = 0; i < space.units["scotland"].length; i++) {
          let unit = space.units["scotland"][i];
          if (unit.type == "regular" || unit.type == "mercenary") { return true; }
        }
      }

    }

    return false;

  }

  returnCatholicLandUnitsInSpace(space) {

    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    let units = [];

    for (let f in space.units) {
      if (f != "protestant" && f != "ottoman") {
	if (f == "england" && (this.game.state.leaders.edward_vi != 1 || this.game.state.leaders.elizabeth_i != 1)) {
          for (let z = 0; z < space.units[f].length; z++) {
	    let u = space.units[f][z];
	    if (u.type === "regular" || u.type === "mercenary" || u.type === "cavalry") { units.push({ faction : f , unit_idx : z }); }
	  }
	} else {
          for (let z = 0; z < space.units[f].length; z++) {
	    let u = space.units[f][z];
	    if (u.type === "regular" || u.type === "mercenary" || u.type === "cavalry") { units.push({ faction : f , unit_idx : z }); }
	  }
	}
      }
    }

    return units;

  }

  hasCatholicLandUnits(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let f in space.units) {
      if (f != "protestant" && f != "ottoman") {

	if (f == "england" && (this.game.state.leaders.edward_vi != 1 || this.game.state.leaders.elizabeth_i != 1)) {
          if (this.returnFactionLandUnitsInSpace(f, space)) { return true; }
	} else {
          if (this.returnFactionLandUnitsInSpace(f, space)) { return true; }
	}
      }
    }

    return false;
  }

  isSpaceFriendly(space, faction) {
    let cf = this.returnFactionControllingSpace(space);
    if (cf === faction) { return true; }
    return this.areAllies(cf, faction);
  }

  isSpaceHostile(space, faction) {
    let cf = this.returnFactionControllingSpace(space);
    if (cf === faction) { return false; }
    return this.areEnemies(cf, faction);
  }

  isSpaceControlled(space, faction) {

    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    // home spaces that have not fallen to another power.
    if (space.home === faction && space.political == "") { return true; }

    // home spaces that have not fallen to another power.
    if (space.home === faction && space.political == faction) { return true; }

    // independent (gray) spaces seized by the power.
    if (space.home === "independent" && space.political === faction) { return true; }

    // home spaces of other powers seized by the power.
    if (space.home !== faction && space.political === faction) { return true; }

    // home spaces of allied minor powers. 
    if (space.home !== faction && this.isAlliedMinorPower(space.home, faction)) { return true; }

    return false;
  }

  isSpaceFortified(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    if (space.type === "electorate" || space.type === "key" || space.type === "fortress") { return true; }
    return false;
  }

  returnHopsToFortifiedHomeSpace(source, faction) {
    let his_self = this;
    try { if (this.game.spaces[source]) { source = this.game.spaces[source]; } } catch (err) {}
    return this.returnHopsBetweenSpacesWithFilter(source, function(spacekey) {
      if (his_self.isSpaceFortified(his_self.game.spaces[spacekey])) {
	if (his_self.isSpaceControlled(spacekey, faction)) {
	  if (his_self.game.spaces[spacekey].home === faction) {
	    return 1;
	  }
	}
      }
      return 0;
    });
  }
  returnHopsToDestination(source, destination) {
    try { if (this.game.spaces[source]) { destination = this.game.spaces[source]; } } catch (err) {}
    try { if (this.game.spaces[destination]) { destination = this.game.spaces[destination]; } } catch (err) {}
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

  //
  // similar to above, except it can cross a sea-zone
  //
  isSpaceConnectedToCapitalSpringDeployment(space, faction) {

    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    let his_self = this;
    let capitals = this.returnCapitals(faction);
    let already_routed_through = {};
    let transit_passes = 0;
    let hostile_sea_passes = 0;

    if (this.game.state.spring_deploy_across_seas.includes(faction)) {
      hostile_sea_passes = 1;
    }
    if (this.game.state.spring_deploy_across_passes.includes(faction)) {
      transit_passes = 1;
    }

    let res = this.returnNearestSpaceWithFilter(

      space.key,

      // capitals are good destinations
      function(spacekey) {
        if (capitals.includes(spacekey)) { return 1; }
        return 0;
      },

      // route through this?
      function(spacekey) {
	if (already_routed_through[spacekey] == 1) { return 0; }
        already_routed_through[spacekey] = 1;
	if (his_self.isSpaceFriendly(spacekey, faction)) { return 1; }
	return 0;
      },

      // transit passes? 0
      transit_passes,

      // transit seas? 1
      1,
     
      // faction? optional
      faction,

      // already crossed sea zone optional
      0 
    );

    return 1;
  }

  isSpaceAdjacentToReligion(space, religion) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < space.neighbours.length; i++) {
      if (this.game.spaces[space.neighbours[i]].religion === religion) {
	return true;
      }
    }
    return false;
  }

  isSpaceAdjacentToProtestantReformer(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let z = 0; z < space.neighbours.length; z++) {
      if (this.doesSpaceContainProtestantReformer(space.neighbours[z])) { return true; }
    }
    return false;
  }

  // either in port or in adjacent sea
  returnNumberOfSquadronsProtectingSpace(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    let number_of_squadrons_in_port = 0;
    let number_of_squadrons_at_sea = 0;

    //
    // in port
    //
    for (let f in space.units) {
      for (let i = 0; i < space.units[f].length; i++) {
        if (space.units[f][i].type == "squadron") {
	  if (space.units[f][i].besieged != 0) { number_of_squadrons_in_port++; }
	}
      }
    }

console.log("SQUADRONS IN SPACE: " + number_of_squadrons_in_port);

    //
    // adjacent sea
    //
console.log("SPACE PORTS: " + JSON.stringify(space.ports));

    for (let p = 0; p < space.ports.length; p++) {

      let sea = this.game.navalspaces[space.ports[p]];

console.log("SEA: " + JSON.stringify(sea));

      for (let f in sea.units) {

	// faction at sea is friendly to port space controller
	if (this.isSpaceFriendly(space, f)) {
	  for (let i = 0; i < sea.units[f].length; i++) {
	    if (sea.units[f][i].type == "squadron") {
	      number_of_squadrons_at_sea++;
	    }
	  }
	}
      }
    }

console.log("SQUADRONS AT SEA: " + number_of_squadrons_at_sea);

    return (number_of_squadrons_in_port + number_of_squadrons_at_sea);

  }
  doesSpaceContainProtestantReformer(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < space.units["protestant"].length; i++) {
      if (space.units["protestant"][i].reformer == true) { return true; }
    }
    return false;
  }

  doesSpaceContainCatholicReformer(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < space.units["papacy"].length; i++) {
      if (space.units["papacy"][i].reformer == true) { return true; }
    }
    return false;
  }

  isSpaceAPortInTheSameSeaZoneAsAProtestantPort(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    let seas = [];
    for (let i = 0; i < space.ports.length; i++) {
      if (!seas.includes(space.ports[i])) { seas.push(space.ports[i]); }
    }
    for (let s in this.game.spaces) {
      let sp = this.game.spaces[s];
      if (sp.religion == "protestant" && sp.ports.length > 0) {
	for (let z = 0; z < sp.ports.length; z++) {
	  if (seas.includes(sp.ports[z])) { return true; }
	}
      }
    }  
    return false;
  }


  returnSpacesWithFilter(filter_func) {
    let spaces = [];
    for (let spacekey in this.game.spaces) {
      if (filter_func(spacekey) == 1) { spaces.push(spacekey); }
    }
    return spaces;
  }

  isSpaceFactionCapital(space, faction) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    let capitals = this.returnCapitals(faction);
    for (let i = 0; i < capitals.length; i++) {
      if (capitals[i] === space.key) { return true; }
    }
    return false;
  }

  isSpaceInUnrest(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    if (space.unrest == 1) { return true; }
    return false;
  }

  isSpaceUnderSiege(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    if (space.besieged > 0) { return true; }
    return false;
  }

  isSpaceConnectedToCapital(space, faction) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    let his_self = this;
    let capitals = this.returnCapitals(faction);
    let already_routed_through = {};

    let res = this.returnNearestSpaceWithFilter(

      space.key,

      // capitals are good destinations
      function(spacekey) {
        if (capitals.includes(spacekey)) { return 1; }
        return 0;
      },

      // route through this?
      function(spacekey) {
	if (already_routed_through[spacekey] == 1) { return 0; }
        already_routed_through[spacekey] = 1;
	if (his_self.isSpaceFriendly(spacekey, faction)) { return 1; }
	return 0;
      }
    );

    return 1;
  }










  returnFactionControllingSpace(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    let factions = this.returnImpulseOrder(); 
    for (let i = 0; i < factions.length; i++) {
      if (this.isSpaceControlled(space, factions[i])) { return factions[i]; }
    }
    if (space.political) { return space.political; }
    return space.home;
  }



  returnSpaceOfPersonage(faction, personage) {
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].units[faction]) {
        for (let i = 0; i < this.game.spaces[key].units[faction].length; i++) {
	  if (this.game.spaces[key].units[faction][i]) {
	    if (this.game.spaces[key].units[faction][i].type === personage) {
  	      return key;
            }
          }
        }
      }
    }
    return "";
  }

  returnIndexOfPersonageInSpace(faction, personage, spacekey="") {
    if (spacekey === "") { return -1; }
    if (!this.game.spaces[spacekey]) { return -1; }
    for (let i = 0; i < this.game.spaces[spacekey].units[faction].length; i++) {
      if (this.game.spaces[spacekey].units[faction][i].type === personage) {
        return i;
      }
    }
    return -1;
  }

  returnNavalTransportDestinations(faction, space, ops) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    let viable_destinations = [];
    let viable_navalspaces = [];
    let options = [];
    let ops_remaining = ops-1;    

    for (let i = 0; i < space.ports.length; i++) {
      if (this.doesFactionHaveNavalUnitsInSpace(faction, space.ports[i])) {
	viable_navalspaces.push({key : space.ports[i] , ops_remaining : ops_remaining});
      }
    }

    //
    // TODO check for blocking fleet
    //
    while (ops_remaining > 1) {
      ops_remaining--;
      for (let i = 0; i < viable_navalspaces.length; i++) {
	for (let z = 0; z < this.game.navalspaces[viable_navalspaces[i].key].neighbours.length; z++) {
          if (this.doesFactionHaveNavalUnitsInSpace(faction, space.ports[i])) {
	    let ns = this.game.navalspaces[viable_navalspaces[i].key].neighbours[z];
	    let already_included = 0;
	    for (let z = 0; z < viable_navalspaces.length; z++) {
	      if (viable_navalspaces[z].key == ns) { already_included = 1; }
	    }
	    if (already_included == 0) {
	      viable_navalspaces.push({ key : ns , ops_remaining : ops_remaining });
	    }
	  }
	}
      }
    }

    //
    //
    //
    for (let i = 0; i < viable_navalspaces.length; i++) {
      let key = viable_navalspaces[i].key;
      for (let z = 0; z < this.game.navalspaces[key].ports.length; z++) {      
	let port = this.game.navalspaces[key].ports[z];
	if (port != space.key) {
	  viable_destinations.push({ key : port , cost : (ops - ops_remaining)});
	}
      }
    }

    return viable_destinations;

  }


  returnFactionNavalUnitsToMove(faction) {

    let units = [];

    //
    // include minor-activated factions
    //
    let fip = [];
        fip.push(faction);
    if (this.game.state.activated_powers[faction]) {
      for (let i = 0; i < this.game.state.activated_powers[faction].length; i++) {
        fip.push(this.game.state.activated_powers[faction][i]);
      }
    }

    //
    // if this is the 2P game, include any major activated units
    //
    if (faction != "independent" && faction != "scotland" && faction != "genoa" && faction != "venice" && faction != "hungary") {
      if (this.game.players.length == 2) {
        if (this.areAllies(faction, "hapsburg") && faction != "hapsburg") { fip.push("hapsburg"); }
        if (this.areAllies(faction, "protestant") && faction != "protestant") { fip.push("protestant"); }
        if (this.areAllies(faction, "france") && faction != "france") { fip.push("france"); }
        if (this.areAllies(faction, "england") && faction != "england") { fip.push("england"); }
        if (this.areAllies(faction, "papacy") && faction != "papacy") { fip.push("papacy"); }
        if (this.areAllies(faction, "ottoman") && faction != "ottoman") { fip.push("ottoman"); }
      }
    }

    //
    // find units
    //
    for (let i = 0; i < fip.length; i++) {
      for (let key in this.game.spaces) {

	//
	// we only care about units in ports
	//
	if (this.game.spaces[key].ports) {
	if (this.game.spaces[key].ports.length > 0) {
	  let ships = [];
	  let leaders = [];
	  for (let z = 0; z < this.game.spaces[key].units[fip[i]].length; z++) {

	    //
	    // only add leaders if there is a ship in port
	    //
	    let u = this.game.spaces[key].units[fip[i]][z];
	    u.idx = z;
	    if (u.land_or_sea === "sea") {
	      if (u.navy_leader == true) {
		leaders.push(u);
	      } else {
		ships.push(u);
	      }
	    }
	  }

	  //
	  // add and include location
	  //
	  if (ships.length > 0) {
	    for (let y = 0; y < ships.length; y++) {
	      ships[y].spacekey = key;
	      units.push(ships[y]);
	    }
	    for (let y = 0; y < leaders.length; y++) {
	      leaders[y].spacekey = key;
	      units.push(leaders[y]);
	    }
	  }
	}
        }
      }
    }

    //
    // add ships and leaders out-of-port
    //
    for (let i = 0; i < fip.length; i++) {
      for (let key in this.game.navalspaces) {
	for (let z = 0; z < this.game.navalspaces[key].units[fip[i]].length; z++) {
	  this.game.navalspaces[key].units[fip[i]][z].spacekey = key;
	  units.push(this.game.navalspaces[key].units[fip[i]][z]);
	}
      }
    }

    return units;
  }








  returnNearestFriendlyFortifiedSpaces(faction, space) {

    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

if (space.key === "agram") {
  console.log(space.type + " -- " + space.fortified);
}

    if (space.type == "fortress" || space.type == "electorate" || space.type == "key" || space.fortified == 1) { return [space]; }

if (faction == "venice") {
  console.log("getting res for: " + space.key);
}

    let original_spacekey = space.key;
    let his_self = this;
    let already_routed_through = {};

    let res = this.returnNearestSpaceWithFilter(

      space.key,

      // fortified spaces
      function(spacekey) {
        if (his_self.isSpaceFortified(his_self.game.spaces[spacekey])) {
console.log(spacekey + " -- is fortified");
	  if (his_self.isSpaceControlled(spacekey, faction)) {
console.log("and controlled");
	    return 1;
	  }
	  if (his_self.isSpaceFriendly(spacekey, faction)) {
console.log("and friendly");
	    return 1;
	  }
	}
        return 0;
      },

      // route through this?
      function(spacekey) {
	if (already_routed_through[spacekey] == 1) { return 0; }
        already_routed_through[spacekey] = 1;
	if (his_self.isSpaceFriendly(spacekey, faction)) { return 1; }
	if (spacekey == original_spacekey) { return 1; }
	return 0;
      }
    );

    return res;

  }


  returnNearestFactionControlledPorts(faction, space) {
    try { if (this.game.navelspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}

    let his_self = this;
    let already_routed_through = {};

    let res = this.returnNearestNavalSpaceOrPortWithFilter(

      space.key,

      // ports
      function(spacekey) {
        if (his_self.game.spaces[spacekey]) {
	  if (his_self.isSpaceControlled(space, faction)) {
	    return 1;
	  }
	}
        return 0;
      },

      // route through this
      function(spacekey) {	
        if (his_self.game.spaces[spacekey]) { return 0; }
	if (already_routed_through[spacekey] == 1) { return 0; }
        already_routed_through[spacekey] = 1;
	return 1;
      }
    );

    return res;

  }


  canFactionRetreatToSpace(faction, space, attacker_comes_from_this_space="") {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    try { if (this.game.spaces[attacker_comes_from_this_space]) { attacker_comes_from_this_space = this.game.spaces[attacker_comes_from_this_space]; } } catch (err) {}
    if (space === attacker_comes_from_this_space) { return 0; }
    if (this.isSpaceInUnrest(space) == 1) { return 0; }
    if (this.isSpaceFriendly(space, faction) == 1) { return 1; }
    return 0;
  }

  canFactionRetreatToNavalSpace(faction, space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    try { if (this.game.navalspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}
    return 1;
  }

  convertSpace(religion, space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    space.religion = religion;
    this.displayBoard();
  }

  controlSpace(faction, space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    space.political = faction;
    space.occupier = faction;
  }


  returnDefenderFaction(attacker_faction, space) {
    // called in combat, this finds whichever faction is there but isn't allied to the attacker
    // or -- failing that -- whichever faction is recorded as occupying the space.
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let f in space.units) {
      let luis = this.returnFactionLandUnitsInSpace(f, space.key);
      if (luis > 0) {
        if (!this.areAllies(attacker_faction, f) && f !== attacker_faction) {
	  return f;
	}
      }
    }
    return this.returnFactionOccupyingSpace(space);
  }

  returnFactionOccupyingSpace(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    if (space.occupier != "" && space.occupier != undefined && space.occupier != "undefined" && space.occupier != 'undefined') { 
      // whoever had units here first
      if (space.units[space.occupier]) {
        if (space.units[space.occupier].length > 0) {
          return space.occupier; 
        }
      }
    }
    // or whoever has political control
    if (space.political != "") { return space.political; }
    // or whoever has home control
    if (space.owner != -1) { return space.owner; }
    return space.home;
  }

  returnFriendlyLandUnitsInSpace(faction, space) {
    let luis = 0;
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < space.units[faction].length; i++) {
      if (space.units[faction][i].type === "regular") { luis++; }
      if (space.units[faction][i].type === "mercenary") { luis++; }
      if (space.units[faction][i].type === "cavalry") { luis++; }
    }
    return luis;
  }

  returnFactionLandUnitsInSpace(faction, space) {
    let luis = 0;
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < space.units[faction].length; i++) {
      if (space.units[faction][i].type === "regular") { luis++; }
      if (space.units[faction][i].type === "mercenary") { luis++; }
      if (space.units[faction][i].type === "cavalry") { luis++; }
    }
    return luis;
  }

  returnFactionSeaUnitsInSpace(faction, space) {
    let luis = 0;
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    try { if (this.game.navalspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}
    for (let i = 0; i < space.units[faction].length; i++) {
      if (space.units[faction][i].type === "squadron") { luis++; }
      if (space.units[faction][i].type === "corsair") { luis++; }
    }
    return luis;
  }

  doesOtherFactionHaveNavalUnitsInSpace(exclude_faction, key) {
    if (this.game.spaces[key]) {
      for (let f in this.game.spaces[key].units) {
	if (f != exclude_faction) {
          if (this.game.spaces[key].units[faction]) {
            for (let i = 0; i < this.game.spaces[key].units[faction].length; i++) {
              if (this.game.spaces[key].units[faction][i].type === "squadron" || this.game.spaces[key].units[faction][i].type === "corsair") {
  	        return 1;
              }
            }
	  }
	}
      }
    }
    if (this.game.navalspaces[key]) {
      for (let f in this.game.navalspaces[key].units) {
	if (f != exclude_faction) {
          if (this.game.navalspaces[key].units[faction]) {
            for (let i = 0; i < this.game.navalspaces[key].units[faction].length; i++) {
              if (this.game.spaces[key].units[faction][i].type === "squadron" || this.game.spaces[key].units[faction][i].type === "corsair") {
  	        return 1;
              }
            }
	  }
	}
      }
    }
    return 0;
  }

  doesFactionHaveNavalUnitsInSpace(faction, key) {
    if (this.game.spaces[key]) {
      if (this.game.spaces[key].units[faction]) {
        for (let i = 0; i < this.game.spaces[key].units[faction].length; i++) {
          if (this.game.spaces[key].units[faction][i].type === "squadron" || this.game.spaces[key].units[faction][i].type === "corsair") {
  	    return 1;
          }
        }
      }
    }
    if (this.game.navalspaces[key]) {
      if (this.game.navalspaces[key].units[faction]) {
        for (let i = 0; i < this.game.navalspaces[key].units[faction].length; i++) {
          if (this.game.navalspaces[key].units[faction][i].type === "squadron" || this.game.navalspaces[key].units[faction][i].type === "corsair") {
  	    return 1;
          }
        }
      }
    }
    return 0;
  }

  doesFactionHaveNavalUnitsOnBoard(faction) {
    for (let key in this.game.navalspaces) {
      if (this.game.navalspaces[key].units[faction]) {
        for (let i = 0; i < this.game.navalspaces[key].units[faction].length; i++) {
	  return 1;
	}
      }
    }
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].units[faction]) {
        for (let i = 0; i < this.game.spaces[key].units[faction].length; i++) {
	  if (this.game.spaces[key].units[faction][i].land_or_sea === "sea") {
	    return 1;
	  }
	}
      }
    }
    return 0;
  }

  returnFactionMap(space, faction1, faction2) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    try { if (this.game.navalspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}
    let faction_map = {};

    for (let f in space.units) {
      if (this.returnFactionLandUnitsInSpace(f, space)) {
        if (f == faction1) {
          faction_map[f] = faction1;
        } else {
          if (f == faction2) {
            faction_map[f] = faction2;
          } else {
            if (this.areAllies(f, faction1)) {
              faction_map[f] = faction1;
            }
            if (this.areAllies(f, faction2)) {
              faction_map[f] = faction2;
            }
          }
        }
      }
    }
    return faction_map;
  }

  returnHomeSpaces(faction) {

    let spaces = [];

    for (let i in this.game.spaces) {
      if (this.game.spaces[i].home === faction) { spaces.push(i); }
    }

    return spaces;

  }

  //
  // transit seas calculates neighbours across a sea zone
  //
  // if transit_seas and faction is specified, we can only cross if
  // there are no ports in a zone with non-faction ships.
  //
  returnNeighbours(space, transit_passes=1, transit_seas=0, faction="") {

    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    if (transit_seas == 0) {
      if (transit_passes == 1) {
        return space.neighbours;
      }
      let neighbours = [];
      for (let i = 0; i < space.neighbours.length; i++) {
        let x = space.neighbours[i];      
        if (!space.pass.includes[x]) {
  	  neighbours.push(x);
        }
      }
      return neighbours;
    } else {

      let neighbours = [];

      if (transit_passes == 1) {
        neighbours = JSON.parse(JSON.stringify(space.neighbours));
      } else {
        for (let i = 0; i < space.neighbours.length; i++) {
          let x = space.neighbours[i];  
          if (!space.pass.includes[x]) {
            neighbours.push(x);
          }
        }
      }

      //
      // any ports ?
      //
      if (space.ports) {
        if (space.ports.length > 0) {
	  for (let i = 0; i < space.ports.length; i++) {
	    let navalspace = this.game.navalspaces[space.ports[i]];
	    let any_unfriendly_ships = false;
	    if (navalspace.ports) {
	      if (faction != "") {
	        for (let z = 0; z < navalspace.ports.length; z++) {
	          if (this.doesOtherFactionHaveNavalUnitsInSpace(faction, navalspace.ports[z])) {
		    if (this.game.state.events.spring_preparations != faction) {
		      any_unfriendly_ships = true;
		    }
		  }
	        }
	      }
              for (let z = 0; z < navalspace.ports.length; z++) {
	        if (!neighbours.includes(navalspace.ports[z]) && any_unfriendly_ships == false) {
	          neighbours.push(navalspace.ports[z]);
	        };
	      }
	    }
 	  }
        }
      }
      return neighbours;
    }
  }


  //
  // only calculates moves from naval spaces, not outbound from ports
  //
  returnNavalNeighbours(space, transit_passes=1) {
    try { if (this.game.navalspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}
    let neighbours = [];
    for (let i = 0; i < space.ports.length; i++) {
      let x = space.ports[i];
      neighbours.push(x);
    }
    for (let i = 0; i < space.neighbours.length; i++) {
      let x = space.neighbours[i];
      neighbours.push(x);
    }

    return neighbours;
  }




  //
  // returns adjacent naval and port spaces
  //
  returnNavalAndPortNeighbours(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    try { if (this.game.navalspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}

    let key = space.key;
    let neighbours = [];

    //
    // ports add only naval spaces
    //
    if (this.game.spaces[key]) {
      for (let i = 0; i < space.ports.length; i++) {
        let x = space.ports[i];
        neighbours.push(x);
      }
    }

    //
    // naval spaces add ports
    //
    if (this.game.navalspaces[key]) {
      for (let i = 0; i < space.ports.length; i++) {
        let x = space.ports[i];
        neighbours.push(x);
      }
      for (let i = 0; i < space.neighbours.length; i++) {
        let x = space.neighbours[i];
        neighbours.push(x);
      }
    }

    return neighbours;
  }


  //
  // returns both naval and port movement options
  //
  returnNavalMoveOptions(spacekey) {

    let neighbours = [];

    if (this.game.navalspaces[spacekey]) {
      for (let i = 0; i < this.game.navalspaces[spacekey].neighbours.length; i++) {
	neighbours.push(this.game.navalspaces[spacekey].neighbours[i]);
      }
      for (let i = 0; i < this.game.navalspaces[spacekey].ports.length; i++) {
	neighbours.push(this.game.navalspaces[spacekey].ports[i]);
      }
    } else {
      if (this.game.spaces[spacekey]) {
        for (let i = 0; i < this.game.spaces[spacekey].ports.length; i++) {
	  neighbours.push(this.game.spaces[spacekey].ports[i]);
        }
      }
    }

    return neighbours;
  }


  //
  // find the nearest destination.
  //
  returnNearestNavalSpaceOrPortWithFilter(sourcekey, destination_filter, propagation_filter, include_source=1) {

    //
    // return array with results + hops distance
    //
    let results = [];
    let searched_spaces = {};
    let pending_spaces = {};

    //
    // if the source matches our destination, return it
    //
    if (include_source == 1) {
      if (destination_filter(sourcekey)) {
        results.push({ space : sourcekey , hops : 0 });
        return results;
      }
    }

    //
    // put the neighbours into pending
    //
    let n = this.returnNavalNeighbours(sourcekey);

    for (let i = 0; i < n.length; i++) {
      pending_spaces[n[i]] = { hops : 0 , key : n[i] };
    }



    //
    // otherwise propagate outwards searching pending
    //
    let continue_searching = 1;
    while (continue_searching) {

      let count = 0;
      for (let key in pending_spaces) {

	count++;
	let hops = pending_spaces[key].hops;

	if (destination_filter(key)) {
	  // found results? this is last pass
	  results.push({ hops : (hops+1) , key : key });	
	  continue_searching = 0;
	  if (searched_spaces[key]) {
	    // we've searched for this before
	  } else {
	    searched_spaces[key] = { hops : (hops+1) , key : key };
	  }
	} else {
	  if (propagation_filter(key)) {
    	    for (let i = 0; i < this.game.navalspaces[key].neighbours.length; i++) {
	      if (searched_spaces[this.game.navalspaces[key].neighbours[i]]) {
		// don't add to pending as we've transversed before
	      } else {
      	        pending_spaces[this.game.navalspaces[key].neighbours[i]] = { hops : (hops+1) , key : this.game.navalspaces[key].neighbours[i] };
	      }
    	    }
	  }
	  searched_spaces[key] = { hops : (hops+1) , key : key };
	}
	delete pending_spaces[key];

      }
      if (count == 0) {
	continue_searching = 0;
	for (let newkey in pending_spaces) {
	  if (pending_spaces[newkey]) { continue_searching = 1; }
	}
      }
    }

    //
    // at this point we have results or not 
    //
    return results;

  }

  //
  // find the nearest destination.
  //
  // transit_eas = filters on spring deploment criteria of two friendly ports on either side of the zone + no uncontrolled ships in zone
  //
  returnNearestSpaceWithFilter(sourcekey, destination_filter, propagation_filter, include_source=1, transit_passes=0, transit_seas=0, faction="", already_crossed_sea_zone=0) {

    //
    // return array with results + hops distance
    //
    let results = [];
    let searched_spaces = {};
    let pending_spaces = {};

    //
    // if the source matches our destination, return it
    //
    if (include_source == 1) {
      if (destination_filter(sourcekey)) {
        results.push({ space : sourcekey , hops : 0 });
        return results;
      }
    }

    //
    // put the neighbours into pending
    //
    let n = this.returnNeighbours(sourcekey, transit_passes, transit_seas, faction);

    for (let i = 0; i < n.length; i++) {
      pending_spaces[n[i]] = { hops : 0 , key : n[i] };
    }

    //
    // otherwise propagate outwards searching pending
    //
    let continue_searching = 1;
    while (continue_searching) {

      let count = 0;
      for (let key in pending_spaces) {

	count++;
	let hops = pending_spaces[key].hops;

	if (destination_filter(key)) {
	  // found results? this is last pass
	  results.push({ hops : (hops+1) , key : key });	
	  continue_searching = 0;
	  if (searched_spaces[key]) {
	    // we've searched for this before
	  } else {
	    searched_spaces[key] = { hops : (hops+1) , key : key };
	  }
	} else {
	  if (propagation_filter(key)) {
    	    for (let i = 0; i < this.game.spaces[key].neighbours.length; i++) {
	      if (searched_spaces[this.game.spaces[key].neighbours[i]]) {
		// don't add to pending as we've transversed before
	      } else {
      	        pending_spaces[this.game.spaces[key].neighbours[i]] = { hops : (hops+1) , key : this.game.spaces[key].neighbours[i] };
	      }
    	    }
	  }
	  searched_spaces[key] = { hops : (hops+1) , key : key };
	}
	delete pending_spaces[key];

      }
      if (count == 0) {
	continue_searching = 0;
	for (let newkey in pending_spaces) {
	  if (pending_spaces[newkey]) { continue_searching = 1; }
	}
      }
    }

    //
    // at this point we have results or not 
    //
    return results;

  }

  isSpaceElectorate(spacekey) {
    if (spacekey === "augsburg") { return true; }
    if (spacekey === "mainz") { return true; }
    if (spacekey === "trier") { return true; }
    if (spacekey === "cologne") { return true; }
    if (spacekey === "wittenberg") { return true; }
    if (spacekey === "brandenburg") { return true; }
    return false;
  }

  returnNumberOfCatholicElectorates() {
    let controlled_keys = 0;
    if (!this.isSpaceControlled('augsburg', "protestant")) { controlled_keys++; }
    if (!this.isSpaceControlled('mainz', "protestant")) { controlled_keys++; }
    if (!this.isSpaceControlled('trier', "protestant")) { controlled_keys++; }
    if (!this.isSpaceControlled('cologne', "protestant")) { controlled_keys++; }
    if (!this.isSpaceControlled('wittenberg', "protestant")) { controlled_keys++; }
    if (!this.isSpaceControlled('brandenburg', "protestant")) { controlled_keys++; }
    return controlled_keys;
  }
  returnNumberOfProtestantElectorates() {
    let controlled_keys = 0;
    if (this.isSpaceControlled('augsburg', "protestant")) { controlled_keys++; }
    if (this.isSpaceControlled('mainz', "protestant")) { controlled_keys++; }
    if (this.isSpaceControlled('trier', "protestant")) { controlled_keys++; }
    if (this.isSpaceControlled('cologne', "protestant")) { controlled_keys++; }
    if (this.isSpaceControlled('wittenberg', "protestant")) { controlled_keys++; }
    if (this.isSpaceControlled('brandenburg', "protestant")) { controlled_keys++; }
    return controlled_keys;
  }
  returnNumberOfElectoratesControlledByCatholics() {
    let controlled_keys = 0;
    if (this.game.spaces['augsburg'].religion === "catholic") { controlled_keys++; }
    if (this.game.spaces['mainz'].religion === "catholic") { controlled_keys++; }
    if (this.game.spaces['trier'].religion === "catholic") { controlled_keys++; }
    if (this.game.spaces['cologne'].religion === "catholic") { controlled_keys++; }
    if (this.game.spaces['wittenberg'].religion === "catholic") { controlled_keys++; }
    if (this.game.spaces['brandenburg'].religion === "catholic") { controlled_keys++; }
    return controlled_keys;
  }
  returnNumberOfElectoratesControlledByProtestants() {
    let controlled_keys = 0;
    if (this.game.spaces['augsburg'].religion === "protestant") { controlled_keys++; }
    if (this.game.spaces['mainz'].religion === "protestant") { controlled_keys++; }
    if (this.game.spaces['trier'].religion === "protestant") { controlled_keys++; }
    if (this.game.spaces['cologne'].religion === "protestant") { controlled_keys++; }
    if (this.game.spaces['wittenberg'].religion === "protestant") { controlled_keys++; }
    if (this.game.spaces['brandenburg'].religion === "protestant") { controlled_keys++; }
    return controlled_keys;
  }
  returnNumberOfKeysControlledByFaction(faction) {
    let controlled_keys = 0;
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].type === "key") {
        if (this.game.spaces[key].political === this.factions[faction].key || (this.game.spaces[key].political === "" && this.game.spaces[key].home === this.factions[faction].key)) {
          controlled_keys++;
        }
      }
    }
    return controlled_keys;
  }
  returnNumberOfKeysControlledByPlayer(player_num) {
    let faction = this.game.state.players_info[player_num-1].faction;
    let controlled_keys = 0;
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].type === "key") {
        if (this.game.spaces[key].political === this.factions[faction].key || (this.game.spaces[key].political === "" && this.game.spaces[key].home === this.factions[faction].key)) {
          controlled_keys++;
        }
      }
    }
    return controlled_keys;
  }

  returnNumberOfCatholicSpacesInLanguageZone(language="") {  
    let catholic_spaces = 0;
    for (let key in this.game.spaces) {
      if ((this.game.spaces[key].unrest == 1 && this.game.spaces[key].religion == "protestant") || this.game.spaces[key].religion === "catholic") {
	if (language == "" || this.game.spaces[key].language == language) {
	  catholic_spaces++;
	}
      }
    }
    return catholic_spaces;
  }

  returnNumberOfProtestantSpacesInLanguageZone(language="") {  
    let protestant_spaces = 0;
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].religion === "protestant" && this.game.spaces[key].unrest == 0) {
	if (language == "all" || language == "" || this.game.spaces[key].language == language) {
	  protestant_spaces++;
	}
      }
    }
    return protestant_spaces;
  }


  returnNavalSpaces() {

    let seas = {};

    seas['irish'] = {
      top : 875 ,
      left : 900 ,
      name : "Irish Sea" ,
      ports : ["glasgow"] ,
      neighbours : ["biscay","north","channel"] ,
    }
    seas['biscay'] = {
      top : 1500 ,
      left : 1400 ,
      name : "Bay of Biscay" ,
      ports : ["brest", "nantes", "bordeaux", "corunna" ] ,
      neighbours : ["irish","channel","atlantic"] ,
    }
    seas['atlantic'] = {
      top : 2700 ,
      left : 850 ,
      name : "Atlantic Ocean" ,
      ports : ["gibraltar" , "seville" , "corunna"] ,
      neighbours : ["biscay"] ,
    }
    seas['channel'] = {
      top : 1020 ,
      left : 1450 ,
      name : "English Channel" ,
      ports : ["brest", "plymouth", "portsmouth", "rouen", "bolougne", "calais" ] ,
      neighbours : ["irish","biscay","north"] ,
    }
    seas['north'] = {
      top : 200 ,
      left : 2350 ,
      name : "North Sea" ,
      ports : ["london", "norwich", "berwick", "edinburgh", "calais", "antwerp", "amsterdam", "bremen", "hamburg" ] ,
      neighbours : ["irish","channel","baltic"] ,
    }
    seas['baltic'] = {
      top : 50 ,
      left : 3150 ,
      name : "Baltic Sea" ,
      ports : ["lubeck", "stettin" ] ,
      neighbours : ["north"] ,
    }
    seas['gulflyon'] = {
      top : 1930 ,
      left : 2430 ,
      name : "Gulf of Lyon" ,
      ports : ["cartagena", "valencia", "palma", "barcelona" , "marseille", "nice" , "genoa", "bastia" ] ,
      neighbours : ["barbary","tyrrhenian"] ,
    }
    seas['barbary'] = {
      top : 2330 ,
      left : 2430 ,
      name : "Barbary Coast" ,
      ports : ["gibraltar", "oran", "cartagena", "algiers" , "tunis", "cagliari" , "palma" ] ,
      neighbours : ["gulflyon","tyrrhenian","ionian","africa"] ,
    }
    seas['tyrrhenian'] = {
      top : 2260 ,
      left : 3300 ,
      name : "Tyrrhenian Sea" ,
      ports : ["genoa" , "bastia" , "rome" , "naples" , "palermo" , "cagliari" , "messina" ] ,
      neighbours : ["barbary","gulflyon"] ,
    }
    seas['africa'] = {
      top : 2770 ,
      left : 4200 ,
      name : "North African Coast" ,
      ports : ["tunis" , "tripoli" , "malta" , "candia" , "rhodes" ] ,
      neighbours : ["ionian","barbary","aegean"] ,
    }
    seas['aegean'] = {
      top : 2470 ,
      left : 4450 ,
      name : "Aegean Sea" ,
      ports : ["rhodes" , "candia" , "coron" , "athens" , "salonika" , "istanbul" ] ,
      neighbours : ["black","africa","ionian"] ,
    }
    seas['ionian'] = {
      top : 2390 ,
      left : 3750 ,
      name : "Ionian Sea" ,
      ports : ["malta" , "messina" , "coron", "lepanto" , "corfu" , "taranto" ] ,
      neighbours : ["black","aegean","adriatic"] ,
    }
    seas['adriatic'] = {
      top : 1790 ,
      left : 3400 ,
      name : "Adriatic Sea" ,
      ports : ["corfu" , "durazzo" , "scutari" , "ragusa" , "trieste" , "venice" , "ravenna" , "ancona" ] ,
      neighbours : ["ionian"] ,
    }
    seas['black'] = {
      top : 1450 ,
      left : 4750 ,
      name : "Black Sea" ,
      ports : ["istanbul" , "varna" ] ,
      neighbours : ["aegean"] ,
    }

    for (let key in seas) {
      seas[key].units = {};
      seas[key].units['england'] = [];
      seas[key].units['france'] = [];
      seas[key].units['hapsburg'] = [];
      seas[key].units['ottoman'] = [];
      seas[key].units['papacy'] = [];
      seas[key].units['protestant'] = [];
      seas[key].units['venice'] = [];
      seas[key].units['genoa'] = [];
      seas[key].units['hungary'] = [];
      seas[key].units['scotland'] = [];
      seas[key].units['independent'] = [];
      seas[key].key = key;
    }

    return seas;
  }

  returnSpaceName(key) {
    if (this.game.spaces[key]) { return this.game.spaces[key].name; }
    if (this.game.navalspaces[key]) { return this.game.navalspaces[key].name; }
    return "Unknown";
  }


  returnSpacesInUnrest() {
    let spaces_in_unrest = [];
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].unrest == 1) { spaces_in_unrest.push(key); }
    }
    return spaces_in_unrest;
  }

  returnSpacesWithFactionInfantry(faction) {
    let spaces_with_infantry = [];
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].units[faction].length > 0) {
        spaces_with_infantry.push(key);
      }
    }
    return spaces_with_infantry;
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
      spaces[key].units = {};
    }

    return spaces;

  }


  isOccupied(space) {

    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    for (let key in space.units) {
      if (space.units[key].length > 0) { return 1; }
    }

    return 0;
  }

  isElectorate(spacekey) {

    try { if (spacekey.key) { spacekey = spacekey.key; } } catch (err) {}

    if (spacekey === "augsburg") { return 1; }
    if (spacekey === "trier") { return 1; }
    if (spacekey === "cologne") { return 1; }
    if (spacekey === "wittenberg") { return 1; }
    if (spacekey === "mainz") { return 1; }
    if (spacekey === "brandenburg") { return 1; }
    return 0;
  }

  //
  // import space attaches events / functions to spaces if they do not exist
  //
  importSpace(obj, key) {

    let his_self = this;

    obj.key = key;

    if (obj.name == null)               { obj.name = "Unknown"; }
    if (obj.owner == null)              { obj.owner = -1; }          
    if (obj.type == null)               { obj.type = "town"; }     
    if (obj.debaters == null)           { obj.debaters = []; }     
    if (obj.returnView == null)		{ 

      obj.returnView = function () {

	let html = '<div class="space_view" id="">';

	let home = obj.home;
	let religion = obj.religion;
	let political = obj.political;
	let language = obj.language;
	if (!political) { political = obj.home; }

	if (political == "genoa" || political == "venice" || political == "scotland" || political == "hungary" || political == "independent") { his_self.game.state.board[political] = his_self.returnOnBoardUnits(political); } else {
	  if (home == "genoa" || home == "venice" || home == "scotland" || home == "hungary" || home == "independent") { his_self.game.state.board[home] = his_self.returnOnBoardUnits(home); }
	}

	html += `
	  <div class="space_name">${obj.name}</div>
	  <div class="space_properties">
	    <div class="religion"><div class="${religion}" style="background-image: url('${his_self.returnReligionImage(religion)}')"></div><div class="label">${religion} religion</div></div>
	    <div class="political"><div class="${political}" style="background-image: url('${his_self.returnControlImage(political)}')"></div><div class="label">${political} control</div></div>
	    <div class="language"><div class="${language}" style="background-image: url('${his_self.returnLanguageImage(language)}')"></div><div class="label">${language} language</div></div>
	    <div class="home"><div class="${home}" style="background-image: url('${his_self.returnControlImage(home)}')"></div><div class="label">${home} home</div></div>
	  </div>
	  <div class="space_units">
	`;

        for (let key in obj.units) {
	  html += his_self.returnArmyTiles(key, obj.key);
	  html += his_self.returnMercenaryTiles(key, obj.key);
	  html += his_self.returnPersonagesTiles(key, obj.key);
	  html += his_self.returnNavalTiles(key, obj.key);
        }

        for (let f in this.units) {
	  if (this.units[f].length > 0) {
            for (let i = 0; i < this.units[f].length; i++) {
	      let b = "";
	      if (this.units[f][i].besieged) { b = ' (besieged)'; }
	      html += `<div class="space_unit">${f} - ${this.units[f][i].type} ${b}</div>`;
	    }
	  }
	}

	html += `</div>`;
	html += `</div>`;

	return html;

      };

    }

    return obj;

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
	alert("ops");
	this.playerPlayOps(faction, card, card.ops);
      }

      if (action === "sr") {
	alert("sr");
	this.playerPlayStrategicRedeployment(faction, card, card.rp);
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

    //
    // hide any popup
    //
    this.cardbox.hide();

    let html = `<ul>`;
    html    += `<li class="card" id="movement">activate for movement</li>`;
    html    += `<li class="card" id="combat">activate for combat</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions(`You have ${cost} OPS remaining`, html, true);
    this.bindBackButtonFunction(() => { this.moves = []; this.playerPlayCard(faction, card); });
    this.attachCardboxEvents((action) => {

      if (action === "movement") {
	alert("movement");
      }

      if (action === "combat") {
	alert("combat");
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



} // end and export

module.exports = PathsOfGlory;


