const GameTemplate = require('../../lib/templates/gametemplate');
const TwilightRules = require('./lib/core/rules.template');
const TwilightOptions = require('./lib/core/advanced-options.template');
const TwilightSingularOption = require('./lib/core/options.template');
const ChooseCardOverlay = require('./lib/overlays/choosecard');
const ScoringOverlay = require('./lib/overlays/scoring');
const WarOverlay = require('./lib/overlays/war');
const StatsOverlay = require('./lib/overlays/stats');
const DeckOverlay = require('./lib/overlays/deck');
const HeadlineOverlay = require('./lib/overlays/headline');
const htmlTemplate = require('./lib/core/game-html.template').default;
const GameHelp = require('./lib/overlays/game-help');


const JSON = require('json-bigint');


//
// Missile Envy is a bit messy
//
var is_this_missile_envy_noneventable = 0;
var is_player_skipping_playing_china_card = 0;
var start_turn_game_state = null;
var start_turn_game_queue = null;

//
// allows cancellation of pick "pickagain"
//
var original_selected_card = null;


//////////////////
// CONSTRUCTOR  //
//////////////////
class Twilight extends GameTemplate {

  constructor(app) {

    super(app);

    this.app             = app;

    this.name  		 = "Twilight";
    this.gamename        = "Twilight Struggle";
    this.slug		 = "twilight";
    this.description     = `Card-driven strategy board game for two players -- one representing the United States (US), and the other the Soviet Union (USSR) <br>
                            Relive events of the cold war, such as the Berlin Airlift and Siezing of the Suez Canal, as you compete to gain influence across Europe 
                            and the rest of the world. Engage in nuclear brinksmanship while supporting coups in battleground states, but watch out, 
                            if you end up causing world war three, you lose!`;
    this.publisher_message = "Twilight Struggle is owned by GMT Games. This module is made available under an open source license provided by GMT Games for usage in open source game engines. Publisher requirements is that at least one player per game has purchased a copy of the game.";
    this.categories      = "Games Boardgame Strategy";

    this.boardWidth  = 5100; //Pieces originally scaled to 5100px wide board
    this.card_height_ratio = 1.39; // height is 1.39x width

    this.clock.container = "#clock_";
    this.moves           = [];
    this.cards    	 = [];
    this.is_testing 	 = 0;
    this.insert_rankings = true;

    //
    // ui components
    //
    this.scoring_overlay = new ScoringOverlay(this.app, this);
    this.choosecard_overlay = new ChooseCardOverlay(this.app, this);
    this.stats_overlay = new StatsOverlay(this.app, this);
    this.war_overlay = new WarOverlay(this.app, this);
    this.deck_overlay = new DeckOverlay(this.app, this);
    this.headline_overlay = new HeadlineOverlay(this.app, this);
    this.game_help = new GameHelp(this.app, this);

    //
    // newbie mode
    //
    this.confirm_moves = 0;

    this.interface 	 = 1;  //Graphical card display

    this.minPlayers 	 = 2;
    this.maxPlayers 	 = 2;

    this.hud.mode = 0;  // long-horizontal
    
    // Temporarily block this because the alternate hud css was messed up by recent refactors
    //this.hud.enable_mode_change = 1;
    this.hud.card_width = 120;
    this.roles = ["observer", "ussr", "us"];
    this.region_key = { "asia": "Asia", "seasia": "Southeast Asia", "europe":"Europe", "africa":"Africa", "mideast":"Middle East", "camerica": "Central America", "samerica":"South America"};
    this.grace_window = 25;

    this.sort_priority = 1;

    this.can_play_async = 1;

  }

  showCardOverlay(cards, title = ""){
    let html = `
      <div class="transparent-card-overlay hide-scrollbar">
        ${this.returnCardList(cards)}
      </div>
    `;

    if (cards.length == 0) {
      html = `<div class="transparent-card-overlay" style="text-align:center; margin: auto;">
              There are no cards to display
              </div>`;
    }

    let cc_status = this.overlay.clickToClose;
    this.overlay.clickToClose = true;
    this.overlay.show(html, ()=> { this.overlay.clickToClose = cc_status;});
  }


  //
  // async
  //
  startClockAndSetActivePlayer(target = this.game.player) {
    //Update target
    this.game.target = target;

    this.playerbox.setActive(target);

    if (target == this.game.player) {
      this.setPlayerActive();
    } else {
      this.startClock();
    }
  }

  showScoreOverlay(card, point_obj){
    if (this.browser_active) {
      this.scoring_overlay.render(card, point_obj);
    }
  }

  handleExportMenu() {

    let twilight_self = this;
    let html =
    `
      <div class="game-overlay-menu" id="game-overlay-menu">
        <div>Export Options:</div>
       <ul>
          <li class="menu-item" id="private">Private <div style="font-size:0.8em;clear:both">Create a backup file that saves the game along with the (encrypted) hands of each player. Only the current players will be able to restore the game.</div></li>
        </ul>
      </div>
    `;

    twilight_self.overlay.show(html);

    $('.menu-item').on('click', function() {

      let player_action = $(this).attr("id");

      switch (player_action) {
        case "private":
          break;
        default:
          break;
      }

      twilight_self.overlay.show("All players are backing up their game...");
    });

  }


  handleStatsMenu() {
    if (this.browser_active) {
      this.stats_overlay.render(this.game.state.stats);
    }
  }


  handleDisplayMenu() {

    let twilight_self = this;
    let use_clock_html = '';
    if (twilight_self.useClock == 1) { use_clock_html = '<li class="menu-item" id="move_clock">Move Clock</li>'; }

    let user_message = `
      <div class="game-overlay-menu" id="game-overlay-menu">
        <div>DISPLAY MODE:</div>
        <ul>${use_clock_html}</ul>
      </div>`;
    //<li class="menu-item" id="text">Text Cards</li>
    //<li class="menu-item" id="graphics">Graphical Cards</li>

    twilight_self.overlay.show(user_message);

    $('.menu-item').on('click', function() {
      let action2 = $(this).attr("id");

      if (action2 === "move_clock") {
      	twilight_self.clock.moveClock();
      	return;
      }


      if (action2 === "text") {
        twilight_self.displayModal("Card Menu options changed to text-mode. Please reload.");
        twilight_self.interface = 0;
        twilight_self.saveGamePreference("interface", 0);
	      reloadWindow(1000);
      }

      if (action2 === "graphics") {
        twilight_self.displayModal("Card Menu options changed to graphical mode. Please reload.");
        twilight_self.interface = 1;
        twilight_self.saveGamePreference("interface", 1);
        reloadWindow(1000);
      }

    });
  }


  async render(app) {


    if (this.browser_active == 0) { return; }

    if (this.initialize_game_run) {
      return;
    }


    if (this.game_html_injected != 1) {
      await this.injectGameHTML(htmlTemplate());
      this.game_html_injected = 1;
    }

    await super.render(app);

    //
    // check language preference
    //
    if (app.browser.returnPreferredLanguage() === "zh") {
      if (!app?.options?.gameprefs?.lang) {
        this.lang = "zh";
        this.saveGamePreference("lang", "zh");
      }
    }
    if (app.browser.returnPreferredLanguage() === "es") {
      if (!app?.options?.gameprefs?.lang) {
        this.lang = "es";
        this.saveGamePreference("lang", "es");
      }
    }
    if (app.browser.returnPreferredLanguage() === "ru") {
      if (!app?.options?.gameprefs?.lang) {
        this.lang = "ru";
        this.saveGamePreference("lang", "ru");
      }
    }

    // required here so menu will be proper
    try {
      if (this.app.options.gameprefs.twilight_expert_mode == 1) {
        this.confirm_moves = 0;
      } else {
        this.confirm_moves = 1;
      }
    } catch (err) {}

    this.menu.addMenuOption("game-game", "Game");
    this.menu.addMenuOption("game-info", "Info");

    this.menu.addSubMenuOption("game-game", {
      text : "Difficulty",
      id : "game-confirm",
      class : "game-confirm",
      callback : null
    });

    this.menu.addSubMenuOption("game-confirm",{
      text: `Newbie ${(this.confirm_moves==1)?"✔":""}`,
      id:"game-confirm-newbie",
      class:"game-confirm-newbie",
      callback: function(app,game_mod){
        if (game_mod.confirm_moves == 0){
          game_mod.displayModal("Game Settings", "Will confirm moves before committing");
          game_mod.confirm_moves = 1;
          game_mod.saveGamePreference('twilight_expert_mode', 0);
          reloadWindow(1000);
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
        if (game_mod.confirm_moves ==1){
          game_mod.displayModal("Game Settings", "No need to confirm moves");
          game_mod.confirm_moves = 0;
          game_mod.saveGamePreference('twilight_expert_mode', 1);
          reloadWindow(1000);
        }else{
          game_mod.menu.hideSubMenus();
        }
      }
    });

    this.menu.addSubMenuOption("game-info", {
      text : "How to Play",
      id : "game-rules",
      class : "game-rules",
      callback : function(app, game_mod) {
         game_mod.menu.hideSubMenus();
         game_mod.overlay.show(game_mod.returnGameRulesHTML());
      }
    });

    this.menu.addSubMenuOption("game-info", {
      text : "Stats",
      id : "game-stats",
      class : "game-stats",
      callback : async function(app, game_mod) {
      	game_mod.menu.hideSubMenus();
        game_mod.handleStatsMenu();
      }
    });

    this.menu.addSubMenuOption("game-info", {
      text: "Cards",
      id: "game-cards",
      class: "game-cards",
      callback: null
    });
    this.menu.addSubMenuOption("game-cards",{
      text: "My Hand",
      id: "game-cards-hand",
      class: "game-cards-hand",
      callback: function(app,game_mod){
        game_mod.menu.hideSubMenus();
        game_mod.showCardOverlay(game_mod.game.deck[0].hand, "My Hand");
      }
    });
    this.menu.addSubMenuOption("game-cards",{
      text: "Discards",
      id: "game-cards-discards",
      class: "game-cards-discards",
      callback: function(app,game_mod){
        game_mod.menu.hideSubMenus();
        game_mod.showCardOverlay(Object.keys(game_mod.game.deck[0].discards), "Discards");
      }
    });
    this.menu.addSubMenuOption("game-cards",{
      text: "Removed",
      id: "game-cards-removed",
      class: "game-cards-removed",
      callback: function(app,game_mod){
        game_mod.menu.hideSubMenus();
        game_mod.showCardOverlay(Object.keys(game_mod.game.deck[0].removed), "Removed Cards");
      }
    });
    this.menu.addSubMenuOption("game-cards",{
      text: "Unplayed",
      id: "game-cards-unplayed",
      class: "game-cards-unplayed",
      callback: function(app,game_mod){
        game_mod.menu.hideSubMenus();
        game_mod.showCardOverlay(Object.keys(game_mod.returnUnplayedCards()), "Unplayed Cards");
      }
    });

    this.menu.addSubMenuOption("game-game",{
      text: "Language",
      id: "game-language",
      class: "game-language",
      callback: null
    });

    this.menu.addSubMenuOption("game-language", {
      text: `English ${(this.lang=="en")?"✔":""}`,
      id: "game-language-en",
      callback: function(app, game_mod){
        game_mod.displayModal("Language Settings", "Card settings changed to English");
        game_mod.lang = "en";
        game_mod.saveGamePreference("lang", "en");
        reloadWindow(1000);
      }
    });
    this.menu.addSubMenuOption("game-language", {
      text: `简体中文 ${(this.lang=="zh")?"✔":""}`,
      id: "game-language-zh",
      callback: function(app, game_mod){
        game_mod.displayModal("语言设定", "卡牌语言改成简体中文");
        game_mod.lang = "zh";
        game_mod.saveGamePreference("lang", "zh");
        reloadWindow(1000);
      }
    });
    this.menu.addSubMenuOption("game-language", {
      text: `русский ${(this.lang=="ru")?"✔":""}`,
      id: "game-language-ru",
      callback: function(app, game_mod){
        game_mod.displayModal("");
        game_mod.lang = "ru";
        game_mod.saveGamePreference("lang", "ru");
        reloadWindow(1000);
      }
    });
    this.menu.addSubMenuOption("game-language", {
      text: `Español ${(this.lang=="es")?"✔":""}`,
      id: "game-language-es",
      callback: function(app, game_mod){
        game_mod.displayModal("");
        game_mod.lang = "es";
        game_mod.saveGamePreference("lang", "es");
        reloadWindow(1000);
      }
    });

    this.menu.addSubMenuOption("game-info", {
      text : "Log",
      id : "game-log",
      class : "game-log",
      callback : function(app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.log.toggleLog();
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

    try {
      if (app.browser.isMobileBrowser(navigator.userAgent)) {
        this.hud.card_width = 110;
        this.cardbox.skip_card_prompt = 0;
        this.hammer.render();
      } else {
        this.hud.card_width = 120; // hardcode max card size
        this.sizer.render();
        this.sizer.attachEvents('.gameboard');
      }

    } catch (err) {}

    if (this.game.player > 0){
      if (this.useClock){
        this.playerbox.render();

        for (let i = 1; i <= this.game.players.length; i++) {
          this.playerbox.updateIcons(
            `<div class="tool-item item-detail player-icon-${this.roles[
              i
            ].toLowerCase()}"></div>`,
            i
          );

          this.playerbox.updateBody(`<div class="player_clock" id="clock_${i}"></div>`, i);
        }

        if (this.game.player == 1) {
          $('.game-playerbox-manager').addClass('reverse');
        }

        this.clock.render();
        for (let i = 0; i < this.game.clock.length; i++){
          this.clock.displayTime(this.game.clock[i].limit - this.game.clock[i].spent, i+1);
        }
      }

      this.hud.render();

      /* Attach classes to hud to visualize player roles */
      //this.game.player == 1 --> ussr, == 2 --> usa
      let hh = document.querySelector(".hud-header");
      if (hh){
        switch(this.game.player){
          case 1: hh.classList.add("soviet"); break;
          case 2: hh.classList.add("american"); break;
          default:
        }
      }
    }
  }


  ////////////////
  // initialize //
  ////////////////
initializeGame(game_id) {

  //
  // check user preferences to update interface, if text
  //
  if (this.app?.options?.gameprefs) {
    this.interface = this.app.options.gameprefs.interface || this.interface;
/*
    if (this.app.options.gameprefs.twilight_expert_mode == 1) {
      this.confirm_moves = 0;
    } else {
      this.confirm_moves = 1;
    }
*/
  }

  //
  // VP needed
  //
  this.game.vp_needed = 20;

  //
  // initialize
  //
  if (!this.game.state) {

    this.game.countries = this.returnCountries();
    this.countries = this.game.countries; // deprecated
    this.game.state = this.returnState();

    console.log("\n\n\n\n");
    console.log("---------------------------");
    console.log("---------------------------");
    console.log("------ INITIALIZE GAME ----");
    console.log("---------------------------");
    console.log("---------------------------");
    console.log("---------------------------");
    console.log("DECK: " + this.game.options.deck);
    console.log("\n\n\n\n");

    this.updateStatus("Generating the Game");

    this.game.queue.push("round");
    if (this.game.options.usbonus != undefined) {
      if (this.game.options.usbonus > 0 && this.game.options.deck !== "late-war") {
        this.game.queue.push("placement_bonus\t2\t"+this.game.options.usbonus);
      }
    }
    this.game.queue.push("placement\t2");
    this.game.queue.push("placement\t1");
    this.game.queue.push("READY");
    this.game.queue.push("DEAL\t1\t2\t8");
    this.game.queue.push("DEAL\t1\t1\t8");
    this.game.queue.push("SHUFFLE\t1");
    this.game.queue.push("DECKENCRYPT\t1\t2");
    this.game.queue.push("DECKENCRYPT\t1\t1");
    this.game.queue.push("DECKXOR\t1\t2");
    this.game.queue.push("DECKXOR\t1\t1");

    //
    // TESTING
    //
    if (this.is_testing == 1) {

      let is_async = false;
      if (parseInt(this.game.options.async_dealing) == 1) { is_async = true; }

      this.game.options = {};
      if (is_async) { this.game.options.async_dealing = 1; }
      this.game.options.culturaldiplomacy = 1;
      this.game.options.gouzenkoaffair = 1;
      this.game.options.poliovaccine = 1;
      this.game.options.communistrevolution = 1;

//      this.game.options.handshake = 1;
      this.game.options.khruschevthaw = 1;
      this.game.options.rustinredsquare = 1;
      this.game.options.berlinagreement = 1;
      this.game.options.august1968 = 1;
      this.game.options.sudan = 1;
      this.game.options.fischerspassky = 1;
      this.game.options.argo = 1;
      this.game.options.bayofpigs = 1;
      this.game.options.fallofsaigon = 1;
      this.game.options.antiapartheid = 1;
      this.game.options.carterdoctrine = 1;
      this.game.options.energycrisis = 1;
      this.game.options.iranianultimatum = 1;
      this.game.options.kissinger = 1;
      this.game.options.nixonshock = 1;
      this.game.options.pinochet = 1;
      this.game.options.revolutionsof1989 = 1;
      this.game.options.samotlor = 1;
      this.game.options.tsarbomba = 1;
      this.game.options.unitedfruit = 1;
      this.game.options.august1968 = 1;
      this.game.options.argo = 1;
      this.game.options.sudan = 1;
      this.game.options.bayofpigs = 1;
      this.game.options.fallofsaigon = 1;
      this.game.options.fischerspassky = 1;

      this.placeInfluence("turkey", 2, "us");
      this.placeInfluence("cuba", 3, "ussr");

      this.game.options.deck = "endofhistory";
      let a = this.returnEarlyWarCards();
      let b = this.returnMidWarCards();
      let c = this.returnLateWarCards();
      let d = Object.assign({}, a, b);
      let e = Object.assign({}, d, c);

      this.game.options.deck = "coldwarcrazies";
      let f = this.returnEarlyWarCards();
      let g = this.returnMidWarCards();
      let h = this.returnLateWarCards();
      let i = Object.assign({}, f, e);
      let j = Object.assign({}, g, i);
      let k = Object.assign({}, h, j);

      this.game.options.deck = "saito";
      let l = this.returnEarlyWarCards();
      let m = this.returnMidWarCards();
      let n = this.returnLateWarCards();
      let o = Object.assign({}, l, k);
      let p = Object.assign({}, m, o);
      let q = Object.assign({}, n, p);

      this.game.queue.push("DECK\t1\t"+JSON.stringify(q));

    } else {

      if (this.game.options.deck === "late-war") {

        let l = this.returnEarlyWarCards();
        let m = this.returnMidWarCards();
        let n = this.returnLateWarCards();
        let o = Object.assign({}, l, m);
        let p = Object.assign({}, n, o);

	delete p['fidel'];
	delete p['vietnamrevolts'];
	delete p['blockade'];
	delete p['koreanwar'];
	delete p['romanianab'];
	delete p['comecon'];
	delete p['nasser'];
	delete p['warsawpact'];
	delete p['degaulle'];
	delete p['naziscientist'];
	delete p['truman'];
	delete p['nato'];
	delete p['indreds'];
	delete p['marshall'];
	delete p['usjapan'];
	delete p['containment'];
	delete p['cia'];
	delete p['suezcrisis'];
	delete p['destalinization'];
	delete p['formosan'];
	delete p['norad'];

	delete p['cubanmissile'];
	delete p['seasia'];
	delete p['nuclearsubs'];
	delete p['quagmire'];
	delete p['saltnegotiations'];
	delete p['howilearned'];
	delete p['kitchendebates'];
	delete p['wwby'];
	delete p['brezhnev'];
	delete p['portuguese'];
	delete p['allende'];
	delete p['willybrandt'];
	delete p['culturalrev'];
	delete p['flowerpower'];
	delete p['u2'];
	delete p['lonegunman'];
	delete p['puppet'];
	delete p['oas'];
	delete p['nixon'];
	delete p['sadat'];
	delete p['ussuri'];
	delete p['asknot'];
	delete p['alliance'];
	delete p['tehran'];

        this.game.queue.push("DECK\t1\t"+JSON.stringify(p));

	this.game.state.vp = -4;
	this.game.state.round = 7; // will go to 8 next round
        this.game.state.defcon = 3; // will go to 4 next round
        this.game.state.space_race_us = 8;
        this.game.state.space_race_ussr = 6;
	this.game.state.space_station = "us";
	this.game.state.space_station_bonus_taken = 1; // is set to 0 on round init

	this.game.state.events.usjapan = 1;
	this.game.state.events.marshall = 1;
	this.game.state.events.warsawpact = 1;
	this.game.state.events.degaulle = 1;
	this.game.state.events.nato = 1;
	this.game.state.events.nato_westgermany = 1;
	this.game.state.events.flowerpower = 1;

        this.placeInfluence("uk", 5, "us");
        this.placeInfluence("italy", 2, "us");
        this.placeInfluence("benelux", 2, "us");
        this.placeInfluence("westgermany", 5, "us");
        this.placeInfluence("denmark", 3, "us");
        this.placeInfluence("norway", 3, "us");
        this.placeInfluence("israel", 4, "us");
        this.placeInfluence("iran", 2, "us");
        this.placeInfluence("pakistan", 2, "us");
        this.placeInfluence("turkey", 2, "us");
        this.placeInfluence("zaire", 1, "us");
        this.placeInfluence("somalia", 2, "us");
        this.placeInfluence("kenya", 2, "us");
        this.placeInfluence("nigeria", 1, "us");
        this.placeInfluence("japan", 4, "us");
        this.placeInfluence("southkorea", 3, "us");
        this.placeInfluence("taiwan", 3, "us");
        this.placeInfluence("philippines", 3, "us");
        this.placeInfluence("thailand", 2, "us");
        this.placeInfluence("indonesia", 2, "us");
        this.placeInfluence("australia", 5, "us");
        this.placeInfluence("malaysia", 3, "us");
        this.placeInfluence("nicaragua", 1, "us");
        this.placeInfluence("panama", 2, "us");
        this.placeInfluence("haiti", 1, "us");
        this.placeInfluence("honduras", 1, "us");
        this.placeInfluence("venezuela", 2, "us");
        this.placeInfluence("chile", 3, "us");
        this.placeInfluence("argentina", 2, "us");
        this.placeInfluence("colombia", 2, "us");
        this.placeInfluence("dominicanrepublic", 2, "us");

        this.placeInfluence("angola", 1, "us");
        this.placeInfluence("spain", 1, "us");
        this.placeInfluence("france", 3, "us");
        this.placeInfluence("romania", 1, "us");
        this.placeInfluence("jordan", 2, "us");
        this.placeInfluence("egypt", 1, "us");
        this.placeInfluence("southafrica", 2, "us");
        this.placeInfluence("finland", 1, "us");
        this.placeInfluence("peru", 2, "us");
        this.placeInfluence("yugoslavia", 1, "us");
        this.placeInfluence("saudiarabia", 2, "us");

        this.placeInfluence("westgermany", 1, "ussr");
        this.placeInfluence("eastgermany", 3, "ussr");
        this.placeInfluence("poland", 3, "ussr");
        this.placeInfluence("hungary", 3, "ussr");
        this.placeInfluence("czechoslovakia", 3, "ussr");
        this.placeInfluence("bulgaria", 3, "ussr");
        this.placeInfluence("cuba", 3, "ussr");
        this.placeInfluence("northkorea", 3, "ussr");
        this.placeInfluence("iraq", 3, "ussr");
        this.placeInfluence("syria", 3, "ussr");
        this.placeInfluence("india", 3, "ussr");
        this.placeInfluence("afghanistan", 2, "ussr");
        this.placeInfluence("libya", 2, "ussr");
        this.placeInfluence("algeria", 2, "ussr");
        this.placeInfluence("ethiopia", 1, "ussr");
        this.placeInfluence("zimbabwe", 1, "ussr");
        this.placeInfluence("angola", 3, "ussr");
        this.placeInfluence("laos", 2, "ussr");
        this.placeInfluence("vietnam", 5, "ussr");
        this.placeInfluence("seafricanstates", 2, "ussr");
        this.placeInfluence("france", 1, "ussr");
        this.placeInfluence("romania", 3, "ussr");
        this.placeInfluence("jordan", 2, "ussr");
        this.placeInfluence("southafrica", 1, "ussr");
        this.placeInfluence("finland", 2, "ussr");
        this.placeInfluence("burma", 1, "ussr");
        this.placeInfluence("peru", 1, "ussr");
        this.placeInfluence("yugoslavia", 2, "ussr");


      } else {

	let early_war_deck = this.returnEarlyWarCards();

        //
	// SAITO COMMUNITY - edition
        //
        if (this.game.options.deck === "saito") {
	  this.removeCardFromDeck('nato', "Prerequisites Unmet");
	  this.addCardToDeck('iranianultimatum', "New Card");
	  this.addCardToDeck('unitedfruit', "New Card");
	  early_war_deck = this.returnEarlyWarCards();
	  delete early_war_deck['nato'];
	}
        this.game.queue.push("DECK\t1\t"+JSON.stringify(early_war_deck));
      }
    }
    this.game.queue.push("init");

  } else {
    // old location for data structure so code uses this.countries
    // moved to this.game so is saved properly
    this.countries = this.game.countries;
  }

  //
  // re-enable async dealing
  //
  if (parseInt(this.game.options.async_dealing) == 1) {
    this.async_dealing = 1;
  }

  if (this.game.state.headline == 1 && this.game.state.headline_card == ""){
    this.playerPickHeadlineCard(); //In case reloading during the headline selection...
  }

  //
  // adjust screen ratio
  //
try {
  $('.country').css('width', this.scale(202)+"px");
  $('.us').css('width', this.scale(100)+"px");
  $('.ussr').css('width', this.scale(100)+"px");
  $('.us').css('height', this.scale(100)+"px");
  $('.ussr').css('height', this.scale(100)+"px");

  $('.formosan_resolution').css('width', this.scale(202)+"px");
  $('.formosan_resolution').css('height', this.scale(132)+"px");
  $('.formosan_resolution').css('top', this.scale(this.countries['taiwan'].top-32)+"px");
  $('.formosan_resolution').css('left', this.scale(this.countries['taiwan'].left)+"px");

  $('.civil_war_sudan').css('width', this.scale(202)+"px");
  $('.civil_war_sudan').css('height', this.scale(132)+"px");
  $('.civil_war_sudan').css('top', this.scale(this.countries['sudan'].top-32)+"px");
  $('.civil_war_sudan').css('left', this.scale(this.countries['sudan'].left)+"px");

  $('.kissinger_colombia').css('width', this.scale(202)+"px");
  $('.kissinger_colombia').css('height', this.scale(132)+"px");
  $('.kissinger_colombia').css('top', this.scale(this.countries['colombia'].top-32)+"px");
  $('.kissinger_colombia').css('left', this.scale(this.countries['colombia'].left)+"px");

  $('.kissinger_guatemala').css('width', this.scale(202)+"px");
  $('.kissinger_guatemala').css('height', this.scale(132)+"px");
  $('.kissinger_guatemala').css('top', this.scale(this.countries['guatemala'].top-32)+"px");
  $('.kissinger_guatemala').css('left', this.scale(this.countries['guatemala'].left)+"px");

  $('.kissinger_elsalvador').css('width', this.scale(202)+"px");
  $('.kissinger_elsalvador').css('height', this.scale(132)+"px");
  $('.kissinger_elsalvador').css('top', this.scale(this.countries['elsalvador'].top-32)+"px");
  $('.kissinger_elsalvador').css('left', this.scale(this.countries['elsalvador'].left)+"px");

  $('.kissinger_nicaragua').css('width', this.scale(202)+"px");
  $('.kissinger_nicaragua').css('height', this.scale(132)+"px");
  $('.kissinger_nicaragua').css('top', this.scale(this.countries['nicaragua'].top-32)+"px");
  $('.kissinger_nicaragua').css('left', this.scale(this.countries['nicaragua'].left)+"px");

  $('.kissinger_haiti').css('width', this.scale(202)+"px");
  $('.kissinger_haiti').css('height', this.scale(132)+"px");
  $('.kissinger_haiti').css('top', this.scale(this.countries['haiti'].top-32)+"px");
  $('.kissinger_haiti').css('left', this.scale(this.countries['haiti'].left)+"px");

  $('.kissinger_dominicanrepublic').css('width', this.scale(202)+"px");
  $('.kissinger_dominicanrepublic').css('height', this.scale(132)+"px");
  $('.kissinger_dominicanrepublic').css('top', this.scale(this.countries['dominicanrepublic'].top-32)+"px");
  $('.kissinger_dominicanrepublic').css('left', this.scale(this.countries['dominicanrepublic'].left)+"px");

  $('.kissinger_saharanstates').css('width', this.scale(202)+"px");
  $('.kissinger_saharanstates').css('height', this.scale(132)+"px");
  $('.kissinger_saharanstates').css('top', this.scale(this.countries['saharanstates'].top-32)+"px");
  $('.kissinger_saharanstates').css('left', this.scale(this.countries['saharanstates'].left)+"px");

  $('.kissinger_sudan').css('width', this.scale(202)+"px");
  $('.kissinger_sudan').css('height', this.scale(132)+"px");
  $('.kissinger_sudan').css('top', this.scale(this.countries['sudan'].top-32)+"px");
  $('.kissinger_sudan').css('left', this.scale(this.countries['sudan'].left)+"px");

  $('.kissinger_ethiopia').css('width', this.scale(202)+"px");
  $('.kissinger_ethiopia').css('height', this.scale(132)+"px");
  $('.kissinger_ethiopia').css('top', this.scale(this.countries['ethiopia'].top-32)+"px");
  $('.kissinger_ethiopia').css('left', this.scale(this.countries['ethiopia'].left)+"px");

  $('.kissinger_cameroon').css('width', this.scale(202)+"px");
  $('.kissinger_cameroon').css('height', this.scale(132)+"px");
  $('.kissinger_cameroon').css('top', this.scale(this.countries['cameroon'].top-32)+"px");
  $('.kissinger_cameroon').css('left', this.scale(this.countries['cameroon'].left)+"px");

  $('.kissinger_seafricanstates').css('width', this.scale(202)+"px");
  $('.kissinger_seafricanstates').css('height', this.scale(132)+"px");
  $('.kissinger_seafricanstates').css('top', this.scale(this.countries['seafricanstates'].top-32)+"px");
  $('.kissinger_seafricanstates').css('left', this.scale(this.countries['seafricanstates'].left)+"px");

  $('.kissinger_zimbabwe').css('width', this.scale(202)+"px");
  $('.kissinger_zimbabwe').css('height', this.scale(132)+"px");
  $('.kissinger_zimbabwe').css('top', this.scale(this.countries['zimbabwe'].top-32)+"px");
  $('.kissinger_zimbabwe').css('left', this.scale(this.countries['zimbabwe'].left)+"px");

  $('.kissinger_lebanon').css('width', this.scale(202)+"px");
  $('.kissinger_lebanon').css('height', this.scale(132)+"px");
  $('.kissinger_lebanon').css('top', this.scale(this.countries['lebanon'].top-32)+"px");
  $('.kissinger_lebanon').css('left', this.scale(this.countries['lebanon'].left)+"px");

  $('.kissinger_laos').css('width', this.scale(202)+"px");
  $('.kissinger_laos').css('height', this.scale(132)+"px");
  $('.kissinger_laos').css('top', this.scale(this.countries['laos'].top-32)+"px");
  $('.kissinger_laos').css('left', this.scale(this.countries['laos'].left)+"px");

  $('.kissinger_vietnam').css('width', this.scale(202)+"px");
  $('.kissinger_vietnam').css('height', this.scale(132)+"px");
  $('.kissinger_vietnam').css('top', this.scale(this.countries['vietnam'].top-32)+"px");
  $('.kissinger_vietnam').css('left', this.scale(this.countries['vietnam'].left)+"px");

  $('.kissinger_indonesia').css('width', this.scale(202)+"px");
  $('.kissinger_indonesia').css('height', this.scale(132)+"px");
  $('.kissinger_indonesia').css('top', this.scale(this.countries['indonesia'].top-32)+"px");
  $('.kissinger_indonesia').css('left', this.scale(this.countries['indonesia'].left)+"px");

  //
  // update defcon and milops and stuff
  //
  this.displayBoard();

} catch (err) {

console.log("error in initialize game:" + err);

} // we must be in invite page

  //
  // initialize interface
  //
  for (var i in this.countries) {

    let divname      = '#'+i;
    let divname_us   = divname + " > .us > img";
    let divname_ussr = divname + " > .ussr > img";

    let us_i   = 0;
    let ussr_i = 0;

    try {
      $(divname).css('top', this.scale(this.countries[i].top)+"px");
      $(divname).css('left', this.scale(this.countries[i].left)+"px");
      $(divname_us).css('height', this.scale(100)+"px");
      $(divname_ussr).css('height', this.scale(100)+"px");

      //Want to display without triggering shake event

      if (this.countries[i].us > 0 || this.countries[i].ussr > 0) {
        this.showInfluence(i);
      }

    } catch (err) {
console.log("error here 222");
    } // invite page

  }


  try {

    let twilight_self = this;
    $('.scoring_card').off();
    $('.scoring_card').mouseover(function() {

      let region = this.id;
      let scoring = twilight_self.calculateScoring(region, 1);

      let total_vp = scoring.us.vp - scoring.ussr.vp;
      let vp_color = "#FFF";

      if (total_vp > 0) { vp_color = "#00F" }
      if (total_vp < 0) { vp_color = "#F00" }
      
      if (total_vp > (twilight_self.game.vp_needed) || total_vp < (twilight_self.game.vp_needed*-1)) { total_vp = "WIN" }
      if (total_vp == "WIN" || Math.abs(total_vp) > 15){
        vp_color += "F";
      }else {
        vp_color += Math.abs(total_vp).toString(16).toUpperCase();
      }

      $(`.display_vp#${region}`).html(`VP ${total_vp}`);
      $(`.display_vp#${region}`).css("background", vp_color);

      $(`.display_card#${region}`).show();
    }).mouseout(function() {
      let region = this.id;
      $(`.display_card#${region}`).hide();
    });

    $('.scoring_card').on('mousedown', function (e) {
      xpos = e.clientX;
      ypos = e.clientY;
    });
    $('.scoring_card').on('mouseup', function (e) {
      if (Math.abs(xpos-e.clientX) > 4) { return; }
      if (Math.abs(ypos-e.clientY) > 4) { return; }
      let region = e.currentTarget.id;
      let scoring = twilight_self.calculateScoring(region, 1);
      twilight_self.scoring_overlay.render(region, scoring);
    });
  } catch (err) {
    console.log("error 2 in initializeGame: " + err);
  }

  //
  // preload images
  //
  if (this.browser_active) {
    this.preloadImages();
  }

}





  //
  // Core Game Logic
  //
  handleGameLoop() {

    let twilight_self = this;
    let player = (this.game.player === 1) ? "ussr" : "us";

    //
    // not our turn!
    //
    this.game.target = 0;

    //
    // support observer mode
    //
    if (this.game.player === 0) { player = "observer"; }

    //
    // avoid China bug on reshuffle - sept 27
    //
    try {
      if (this.game.deck[0]) {
        if (this.game.deck[0].cards) {
          this.game.deck[0].cards["china"] = this.returnChinaCard();
        }
      }
    } catch (err) {}



    if (this.game.over == 1) {
      let winner = "ussr";
      if (this.game.winner == 2) { winner = "us"; }
      let gid = $('#sage_game_id').attr("class");
      if (gid === this.game.id) {
        this.updateStatus("Game Over: "+winner.toUpperCase() + " wins");
      }

      return 0;
    }



    ///////////
    // QUEUE //
    ///////////
    if (this.game.queue.length > 0) {

      let qe = this.game.queue.length-1;
      let mv = this.game.queue[qe].split("\t");
      let shd_continue = 1;

console.log("LATEST MOVE: " + mv);

      //
      // cambridge region
      // chernobyl region
      // grainsales sender card
      // missileenvy sender card
      // latinamericandebtcrisis (if USSR can double)
      // che ussr country_of_target1
      // pinochet -- ussr removes 1 us influence, if exists
      //
      // start round
      // flush [discards] // empty discards pile if exists
      // bgs // update or reset bgs
      // placement (initial placement)
      // ops [us/ussr] card num
      // round
      // revert -- return to start of turn
      // move [us/ussr]
      // turn [us/ussr]
      // event [us/ussr] card
      // remove [us/ussr] [us/ussr] countryname influence     // player moving, then player whose ops to remove
      // place [us/ussr] [us/ussr] countryname influence      // player moving, then player whose ops to remove
      // resolve card
      // space [us/ussr] card
      // defcon [lower/raise]
      // coup [us/ussr] countryname influence
      // realign [us/ussr] countryname
      // card [1/2] card  --> hand card to play
      // hand [1/2] card  --> hand card for hand
      // play_card_or_hand_to_opponent
      // vp [us/ussr] points [delay_settlement_until_end_of_turn=1]
      // dynamic_deck_management --> logic to add/remove cards
      // discard [us/ussr] card --> discard from hand
      // discard [ussr/us] card
      // deal [1/2]  --- player decides how many cards they need, adds DEAL and clears when ready
      // init -- assign roles
      // final_scoring -- trigger final scoring and end game
      // observer -- reveal cards to player0s (insecure)


    if (mv[0] == "player_turn_card_selected") {

      this.game.queue.splice(qe, 1);
      let player = mv[1];
      let card = mv[2];

      if (player == "us") {
	if (this.game.player == 2) {
          this.playerTurnCardSelected(card, player);
        }
      } else {
	if (this.game.player == 1) {
          this.playerTurnCardSelected(card, player);
        }
      }

      return 0;

    }

    if (mv[0] == "bgs") {

      this.game.queue.splice(qe, 1);

      let cmd = "";
      if (mv[1]) { cmd = mv[1]; }

      if (cmd === "reset") {
        this.resetBattlegroundCountries();
      } else {
        for (let i in this.game.countries) {
          this.game.countries[i].bg = parseInt(this.game.countries[i].bg);
        }
      }

      return 1;

    }



    if (mv[0] == "add_latewar_card_to_deck") {

	this.game.queue.splice(qe, 1);
	this.addCardToDeck(mv[1], "New Card");
	let x = {};
	x[mv[1]] = this.game.deck[0].cards[mv[1]];

            this.game.queue.push("SHUFFLE\t1");
            this.game.queue.push("DECKRESTORE\t1");
            this.game.queue.push("DECKENCRYPT\t1\t2");
            this.game.queue.push("DECKENCRYPT\t1\t1");
            this.game.queue.push("DECKXOR\t1\t2");
            this.game.queue.push("DECKXOR\t1\t1");
	    this.game.queue.push("DECK\t1\t"+JSON.stringify(x));
            this.game.queue.push("DECKBACKUP\t1");

	this.game.saito_cards_added.push(mv[1]);
	this.game.saito_cards_added_reason.push("Player Choice");

	return 1;

    }

    if (mv[0] == "choose_latewar_optional_cards") {

        //
        // exit if diplomacy-overlay open and visible
        // 
        if (this.choosecard_overlay.is_visible) { return 0; }
        if (this.moves.length > 0) { return 0; }
            
        //
        // skip if we have already confirmed!
        //
        if (this.game.confirms_needed[this.game.player-1] == 0) {
          this.choosecard_overlay.hide();
          return 0;
        } 

	//
	// if it is our first time, make array of options
	//
	let cardchosen = [];
	let cardoptions = ["rustinredsquare", "argo", "sudan","antiapartheid"];

        while (cardchosen.length < 4) {
	  let x = this.rollDice(cardoptions.length)-1;
	  cardchosen.push(cardoptions[x]);
	  cardoptions.splice(x, 1);
	}

        this.addMove("RESOLVE\t"+this.publicKey);
	
	if (this.game.player == 1) {
          this.choosecard_overlay.render(cardchosen[0], cardchosen[1], "latewar");
	} else {
          this.choosecard_overlay.render(cardchosen[2], cardchosen[3], "latewar");
	}

        return 0;

    }

    if (mv[0] == "add_midwar_card_to_deck") {

	this.game.queue.splice(qe, 1);
	this.addCardToDeck(mv[1], "New Card");
	let x = {};
	x[mv[1]] = this.game.deck[0].cards[mv[1]];

            this.game.queue.push("SHUFFLE\t1");
            this.game.queue.push("DECKRESTORE\t1");
            this.game.queue.push("DECKENCRYPT\t1\t2");
            this.game.queue.push("DECKENCRYPT\t1\t1");
            this.game.queue.push("DECKXOR\t1\t2");
            this.game.queue.push("DECKXOR\t1\t1");
	    this.game.queue.push("DECK\t1\t"+JSON.stringify(x));
            this.game.queue.push("DECKBACKUP\t1");

	this.game.saito_cards_added.push(mv[1]);
	this.game.saito_cards_added_reason.push("Player Choice");

	return 1;

    }

    if (mv[0] == "choose_midwar_optional_cards") {

        //
        // exit if diplomacy-overlay open and visible
        // 
        if (this.choosecard_overlay.is_visible) { return 0; }
        if (this.moves.length > 0) { return 0; }
            
        //
        // skip if we have already confirmed!
        //
        if (this.game.confirms_needed[this.game.player-1] == 0) {
          this.choosecard_overlay.hide();
          return 0;
        } 

	//
	// if it is our first time, make array of options
	//
	let cardchosen = [];
	let cardoptions = ["tsarbomba", "pinochet", "carterdoctrine","nixonshock", "energycrisis", "bayofpigs", "august1968"];

        while (cardchosen.length < 4) {
	  let x = this.rollDice(cardoptions.length)-1;
	  cardchosen.push(cardoptions[x]);
	  cardoptions.splice(x, 1);
	}

        this.addMove("RESOLVE\t"+this.publicKey);
	
	if (this.game.player == 1) {
          this.choosecard_overlay.render(cardchosen[0], cardchosen[1]);
	} else {
          this.choosecard_overlay.render(cardchosen[2], cardchosen[3]);
	}

        return 0;

    }



    if (mv[0] == "init") {

      this.game.queue.splice(qe, 1);

      for (let i = 0; i < this.game.players.length; i++){
        if (this.game.players[i] === this.publicKey){
          this.game.player = i+1;
        }
      }

      // observer skips
      if (this.game.player === 0 || !this.game.players.includes(this.publicKey)) {
        return 1;
      }

      //Game engine automatically randomizes player order, so we are good to go
      if (!this.game.options.player1 || this.game.options.player1 == "random"){
        return 1;
      }

      if (this.game.options.player1 === "ussr"){
        if (this.game.players[0] !== this.game.originator){
          let p = this.game.players.shift();
          this.game.players.push(p);
        }
      } else {
        if (this.game.players[1] !== this.game.originator){
          let p = this.game.players.shift();
          this.game.players.push(p);
        }
      }
      // sanity check
      for (let i = 0; i < this.game.players.length; i++){
        if (this.game.players[i] === this.publicKey){
          this.game.player = i+1;
        }
      }
    }

    if (mv[0] === "update_observers") {

     let p = parseInt(mv[1]);

     if (this.game.player == p) {
       this.addMove("observer_cards_update\t"+this.game.player+"\t"+JSON.stringify(this.game.deck[0].hand));
       this.endTurn();
     }

     this.game.queue.splice(qe, 1); //This may be better placed before adding moves to the queue, no?
     return 0;

    }


    if (mv[0] === "observer_cards_update") {

  	  let cards = JSON.stringify(mv[2]);

  	  //if (mv[1] == this.game.observer_mode_player) { //game.observer_mode_player is undefined
  	    if (this.game.player == 0) {
  	      this.game.deck[0].hand = [];
  	      for (let i = 0; i < cards.length; i++) {
  	        this.game.deck[0].hand.push(cards[i]);
  	      }
  	    }
  	  //}

      this.game.queue.splice(qe, 1);
      return 1;

    }

    if (mv[0] === "revert") {
      this.revertTurn();
      this.game.queue.splice(qe, 1);
    }

    if (mv[0] == "final_scoring") {
      this.finalScoring();
      return 0;
    }


    if (mv[0] === "turn") {
      this.game.state.turn_in_round++;
      this.game.state.events.china_card_eligible = 0;
      this.game.queue.splice(qe, 1);
      this.updateActionRound();
    }

    // SAITO COMMUNITY
    if (mv[0] === "purge") {
      let card = mv[1];
      this.game.queue.splice(qe, 1);
      this.cancelEvent(card);
      this.removeCardFromDeckNextDeal(card);
      return 1;
    }

    if (mv[0] === "discard") {
      if (mv[2] === "china") {
        // china card switches hands
        if (mv[1] == "ussr") {
          this.updateLog("China Card passes to US face down");
          this.game.state.events.china_card = 2;
        }
        if (mv[1] == "us") {
          this.updateLog("China Card passes to USSR face down");
          this.game.state.events.china_card = 1;
        }

        this.game.state.events.china_card_facedown = 1;
        this.displayChinaCard();

      } else {
        // remove from hand if present
        this.removeCardFromHand(mv[2]);

        //
        // missile envy is an exception, non-player triggers
        if (mv[2] == "missileenvy" && this.game.state.events.missile_envy != this.game.player) {
          this.game.state.events.missile_envy = 0;
          this.game.state.events.missileenvy = 0;
        }

        for (var i in this.game.deck[0].cards) {
          if (mv[2] == i) {
            if (this.game.deck[0].cards[mv[2]] != undefined) {
              // move to discard pile
              this.updateLog(`${mv[1].toUpperCase()} discards ${this.cardToText(mv[2])}`);

              // discard pile is parallel to normal
              this.game.deck[0].discards[i] = this.game.deck[0].cards[i];
            }
          }
        }
      }
      this.game.queue.splice(qe, 1);
    }

    if (mv[0] === "fyp_discard") {

      let card = mv[1];

      for (var i in this.game.deck[0].cards) {
        if (card == i) {
          if (this.game.deck[0].cards[card] != undefined) {
            this.game.deck[0].discards[i] = this.game.deck[0].cards[i];
          }
        }
      }

      this.game.queue.splice(qe, 1);
      return 1;

    }

    //
    // remove from discards (will still be in cards)
    //
    if (mv[0] === "undiscard") {

      let cardkey = mv[1];

      if (this.game.deck[0].discards[cardkey]) {
        // remove from discards
        this.updateLog(`${this.cardToText(cardkey)} removed from discard pile`);
        if (this.game.deck[0].discards[cardkey]) {
          this.game.deck[0].cards[cardkey] = this.game.deck[0].discards[cardkey];
          delete this.game.deck[0].discards[cardkey];
        }
      } else {
        let ac = this.returnAllCards(true);
        if (ac[cardkey]) {
          this.game.deck[0].cards[cardkey] = ac[cardkey];
        }
      }

      this.game.queue.splice(qe, 1);
      return 1;
    }

    //
    // wargames
    //
    if (mv[0] == "wargames") {

      let activate = parseInt(mv[2]);

      if (activate == 0) {
        //
        // card is discarded, nothing happens
        //
	this.game.queue.splice(qe, 1);
	return 1;

      } else {
        if (mv[1] == "us") {
          this.game.state.vp -= this.game.state.wargames_concession;
        } else {
          this.game.state.vp += this.game.state.wargames_concession;
        }
        this.updateVictoryPoints();

	//
	// late-war
	//
        if (this.game.options.deck === "late-war") {
          if (this.game.state.vp < 20) {
            this.sendGameOverTransaction(this.game.players[0], "Wargames");
          } else {
            this.sendGameOverTransaction(this.game.players[1], "Wargames");
          }
	  return 0;
        }

        if (this.game.state.vp > 0) {
          this.sendGameOverTransaction(this.game.players[1],"Wargames");
        }
        if (this.game.state.vp < 0) {
          this.sendGameOverTransaction(this.game.players[0],"Wargames");
        }
        if (this.game.state.vp == 0) {
          this.sendGameOverTransaction(this.game.players, "tie");
        }

      }

      return 0;
    }



    //
    // card [player] [card]
    //
    if (mv[0] === "card") {
      this.game.queue.splice(qe, 1);

      if (player == mv[1]) {
        this.playerTurn(mv[2]);
      }

      shd_continue = 0;
    }


    //
    // hand [player] [card]
    //
    if (mv[0] === "hand") {

      this.game.queue.splice(qe, 1);

      if (this.game.player == parseInt(mv[1])) {
	if (!this.game.deck[0].hand.includes(mv[2])) {
 	  this.game.deck[0].hand.push(mv[2]);
	}
      } else {
        this.removeCardFromHand(mv[2]);
      }

      return 1;

    }




    //
    // grainsales
    //
    if (mv[0] === "grainsales") {

      //
      // this is the ussr telling the us what card they can choose
      //
      if (mv[1] == "ussr") {

        // remove the command triggering this
        this.game.queue.splice(qe, 1);

        this.startClockAndSetActivePlayer(2);

        if (this.game.player == 2) {

          let user_message  = `${this.cardToText(mv[0])} pulls ${this.cardToText(mv[2])} from USSR. Do you want to play this card?`;
          let html = "<ul>";
          if (mv[2] == "unintervention" && this.game.state.headline == 1) {
          } else {
            html += '<li class="option noncard" id="play">play card</li>';
          }
          html += '<li class="option noncard" id="nope">return card</li>';
          html += '</ul>';
          this.updateStatusWithOptions(user_message, html, function(action2) {
            if (action2 == "play") {
              // trigger play of selected card
              twilight_self.addMove("resolve\tgrainsales");
              twilight_self.playerTurn(mv[2]);
            }
            if (action2 == "nope") {
              twilight_self.addMove("resolve\tgrainsales");
              twilight_self.addMove("ops\tus\tgrainsales\t2");
              twilight_self.addMove("grainsales\tus\t"+mv[2]);
              twilight_self.endTurn();
            }
          });

        }
        shd_continue = 0;
      }

      //
      // this is the us telling the ussr they are returning a card
      //
      if (mv[1] == "us") {

        if (this.game.player == 1) {
          this.game.deck[0].hand.push(mv[2]);
        } else {
          //
          // us increases ussr cards in hand to avoid deal errors
          //
          this.game.state.opponent_cards_in_hand++;
  	    }

        this.game.queue.splice(qe, 1);
        shd_continue = 1;
      }
    }

    // Stage
    if (mv[0] == "stage") {
      this.game.queue.splice(qe, 1);
      shd_continue = 1;
    }

    //
    // Che
    if (mv[0] == "clearcheclicktargets") {

      try {   
        $(".easterneurope").removeClass("easterneurope");
      } catch (err) {}      

      this.game.queue.splice(qe, 1);
      return 1;

    }

    if (mv[0] == "checoup") {

      let target1 = mv[2];
      let original_us = this.countries[mv[2]].us;
      let couppower = parseInt(mv[3]);

      //
      // this is the first coup, which runs on both
      // computers, so they can collectively see the
      // results.
      //
      twilight_self.playCoup("ussr", mv[2], couppower, function() {
        twilight_self.game.queue.splice(qe, 1); //Remove checoup from queue

        //Test if first coup was successful
        if (twilight_self.countries[mv[2]].us < original_us) {
          //Repeat code from che.js

          let valid_targets = 0;
          for (let c in twilight_self.countries) {

            if ( twilight_self.game.countries[c].bg == 0 && (twilight_self.countries[c].region === "africa" || twilight_self.countries[c].region === "camerica" || twilight_self.countries[c].region === "samerica") && twilight_self.countries[c].us > 0 ) {
              //Must be a new target for second attempt
              if (c !== target1){
                valid_targets++;
                $("#"+c).addClass("easterneurope");
              }
            }
          }

          if (valid_targets == 0) {
            twilight_self.updateLog("No more valid targets for Che");
            //just need one player to send a signal to restart the queue processing
            if (twilight_self.game.player == 2){
              twilight_self.endTurn();
            }

          } else {

            twilight_self.startClockAndSetActivePlayer(1);

            if (twilight_self.game.player == 1) {

              let user_message = "Pick second target for coup:";
              let html =  '<ul><li class="option" id="skipche">or skip coup</li></ul>';

              twilight_self.updateStatusWithOptions(user_message, html, function(action2) {
                if (action2 == "skipche") {
                  twilight_self.endTurn();
                  twilight_self.updateStatus("Skipping Che coups...");
                }
              });

              $(".easterneurope").on('click', function() {
                twilight_self.playerFinishedPlacingInfluence("ussr");
                let c = $(this).attr('id');
                twilight_self.addMove("clearcheclicktargets");
                twilight_self.addMove("coup\tussr\t"+c+"\t"+couppower);
                twilight_self.addMove("NOTIFY\tChe launches coup in "+twilight_self.countries[c].name);
                twilight_self.endTurn();
              });
            }else{
      	      twilight_self.cancelBackButtonFunction();
              twilight_self.updateStatus(`Waiting for USSR to play second ${twilight_self.cardToText("che")} coup`);
              return 0;
            }
          }

        } else {
          //just need one player to send a signal to restart the queue processing
          if (twilight_self.game.player == 2){
            twilight_self.endTurn();
          }
        }
      });

      shd_continue = 0;
    }

    //
    // missileenvy \t sender \t card
    //
    if (mv[0] === "missileenvy") {

      let sender = mv[1];
      let card = mv[2];
      let receiver = "us";
      let discarder = "ussr";
      if (sender == 2) { receiver = "ussr"; discarder = "us"; }

      this.game.state.events.missile_envy = sender;

      let opponent_card = 0;
      if (this.game.deck[0].cards[card].player == "us" && sender == 2) { opponent_card = 1; }
      if (this.game.deck[0].cards[card].player == "ussr" && sender == 1) { opponent_card = 1; }

      // remove missileenvy from queue
      this.game.queue.splice(qe, 1);

      //
      // play for ops
      //
      if (opponent_card == 1) {
        this.game.queue.push("discard\t"+discarder+"\t"+card);
        this.game.queue.push("ops\t"+receiver+"\t"+card+"\t"+this.game.deck[0].cards[card].ops);
        this.game.queue.push("NOTIFY\t"+discarder.toUpperCase() + " offers " + this.game.deck[0].cards[card].name + " for OPS");
      }

      //
      // or play for event
      //
      if (opponent_card == 0) {
        this.game.queue.push("discard\t"+discarder+"\t"+card);
        this.game.queue.push("event\t"+receiver+"\t"+card);
        this.game.queue.push("NOTIFY\t"+discarder.toUpperCase() + " offers " + this.game.deck[0].cards[card].name + " for EVENT");
      }

      //
      // remove card from hand
      //
      if (this.game.player == sender) {
        this.removeCardFromHand(card);
      }

      shd_continue = 1;

    }

    if (mv[0] === "quagmire") {
      let discard = mv[2];
      let sticker = (mv[1]=="ussr") ? "beartrap": "quagmire";

      let roll = this.rollDice(6);

      this.updateLog(`${this.cardToText(sticker)}: ${mv[1].toUpperCase()} discards ${this.cardToText(discard)} and rolls a ${roll}`);

      if (roll < 5) {
        if (mv[1] == "ussr") {
          this.game.state.events.beartrap = 0;
        }
        if (mv[1] == "us") {
          this.game.state.events.quagmire = 0;
        }
        this.updateLog(`${this.cardToText(sticker)} ends`);
        this.displayModal(`${mv[1].toUpperCase()} extricates itself from ${this.cardToText(sticker)}`);
      } else {
        this.updateLog(`${this.cardToText(sticker)} continues...`);
        //
	// SAITO COMMUNITY
        //
	if (mv[1] == "us") {
          this.game.state.events.double_quagmire = 1;
        } else {
          this.game.state.events.double_beartrap = 1;
	}
	this.displayModal(`${mv[1].toUpperCase()} remains stuck in the ${this.cardToText(sticker)}`);
      }

      this.game.queue.splice(qe, 1);
      shd_continue = 1;

    }


    if (mv[0] == "tehran") {

      let sender  = mv[1];
      let keysnum = parseInt(mv[2]);
      this.game.queue.splice(qe, 1);

      if (sender == "ussr") {

        //
        // ussr has sent keys to decrypt
        //
        this.startClockAndSetActivePlayer(2);

        if (this.game.player == 1) {

          for (let i = 0; i < keysnum; i++) { this.game.queue.splice(this.game.queue.length-1, 1); }

        } else {

          //
          // us decrypts and decides what to toss
          //
          var cardoptions = [];
          var pos_to_discard = [];

      	  if (this.async_dealing) {
                  for (let i = 0; i < keysnum; i++) {
                    cardoptions[i] = this.app.crypto.hexToString(this.game.deck[0].crypt[i]);
      	    }
      	  } else {
            for (let i = 0; i < keysnum; i++) {
              cardoptions[i] = this.game.deck[0].crypt[i];
              cardoptions[i] = this.app.crypto.decodeXOR(cardoptions[i], this.game.deck[0].keys[i]);
            }
            for (let i = 0; i < keysnum; i++) {
              cardoptions[i] = this.app.crypto.decodeXOR(cardoptions[i], this.game.queue[this.game.queue.length-keysnum+i]);
              cardoptions[i] = this.app.crypto.hexToString(cardoptions[i]);
            }
      	  }
          for (let i = 0; i < keysnum; i++) {
            this.game.queue.splice(this.game.queue.length-1, 1);
          }

          let user_message = "Select cards to discard:";
          cardoptions.push("finished");
          //
          // cardoptions is in proper order
          //
          let cards_discarded = 0;
          twilight_self.updateStatusAndListCards(user_message, cardoptions, function(action2) {

            if (action2 == "finished") {

              for (let i = 0; i < pos_to_discard.length; i++) {
                twilight_self.addMove(this.game.deck[0].crypt[pos_to_discard[i]]);
              }
              twilight_self.addMove("tehran\tus\t"+cards_discarded);
              twilight_self.endTurn();

            } else {

              pos_to_discard.push(cardoptions.indexOf(action2));
              cards_discarded++;
              $(`#${action2}.card`).hide();
              twilight_self.addMove("discard\tus\t"+action2);

            }
          });
        }

        shd_continue = 0;

      } else {

        //
        // us has sent keys to discard back
        //
        let removedcard = [];
        for (let i = 0; i < keysnum; i++) {
          removedcard[i] = this.game.queue[this.game.queue.length-1];
          this.game.queue.splice(this.game.queue.length-1, 1);
        }

        for (let i = 0; i < 5; i++) {
          if (removedcard.includes(this.game.deck[0].crypt[i])) {
            //
            // set cards to zero
            //
            this.game.deck[0].crypt[i] = "";
            this.game.deck[0].keys[i] = "";
          }
        }

        //
        // remove empty elements
        //
        var newcards = [];
        var newkeys  = [];
        for (let i = 0; i < this.game.deck[0].crypt.length; i++) {
          if (this.game.deck[0].crypt[i] != "") {
            newcards.push(this.game.deck[0].crypt[i]);
            newkeys.push(this.game.deck[0].keys[i]);
          }
        }

        //
        // keys and cards refreshed
        //
        this.game.deck[0].crypt = newcards;
        this.game.deck[0].keys = newkeys;

      }
    }

    //
    // limit [restriction] [region]
    //
    if (mv[0] == "limit") {
      if (mv[1] == "china") { this.game.state.events.china_card_in_play = 1; }
      if (mv[1] == "coups") { this.game.state.limit_coups = 1; }
      if (mv[1] == "spacerace") { this.game.state.limit_spacerace = 1; }
      if (mv[1] == "realignments") { this.game.state.limit_realignments = 1; }
      if (mv[1] == "placement") { this.game.state.limit_placement = 1; }
      if (mv[1] == "milops") { this.game.state.limit_milops = 1; }
      if (mv[1] == "ignoredefcon") { this.game.state.limit_ignoredefcon = 1; }
      if (mv[1] == "region") { this.game.state.limit_region.push(mv[2]); }
      this.game.queue.splice(qe, 1);
    }

    if (mv[0] == "flush") {
      if (mv[1] == "discards") {
        this.game.deck[0].discards = {};
      }
      this.game.queue.splice(qe, 1);
    }

    //
    // latinamericandebtcrisis
    //
    if (mv[0] == "latinamericandebtcrisis") {

      this.game.queue.splice(qe, 1);

      this.startClockAndSetActivePlayer(1);

      if (this.game.player == 1) {

        let potCountries = [];
        for (var i in this.countries) {
          if (this.countries[i].region == "samerica") {
            if (this.countries[i].ussr > 0) {
              potCountries.push(i);
            }
          }
        }

        if (potCountries.length == 0) {
          this.addMove("NOTIFY\tUSSR has no countries with influence to double");
          this.endTurn();
          return 0;
        }

        let countries_to_double = Math.min(2, potCountries.length);

        this.updateStatus("Select "+countries_to_double+" countries in South America to double USSR influence");

        //
        // double influence in two countries
        //
        for (var i of potCountries) {
          this.countries[i].place = 1;
          $("#"+i).addClass("easterneurope");
        }

        $(".easterneurope").off();
        $(".easterneurope").on('click', function() {

          let countryname = $(this).attr('id');

          if (twilight_self.countries[countryname].place == 1) {
            let ops_to_place = twilight_self.countries[countryname].ussr;
            twilight_self.placeInfluence(countryname, ops_to_place, "ussr");
            twilight_self.addMove("place\tussr\tussr\t"+countryname+"\t" + ops_to_place);
            twilight_self.countries[countryname].place = 0;
            countries_to_double--;
            if (countries_to_double == 0) {
              twilight_self.playerFinishedPlacingInfluence();
              twilight_self.endTurn();
            }
          } else {
            twilight_self.displayModal("Invalid Target","Already doubled influence");
          }
        });

      }else{
        this.updateStatus(`USSR is deciding which country to double their influence`);
      }
      return 0;
    }

    if (mv[0] == "northsea") {

      this.startClockAndSetActivePlayer(2);

      if (this.game.player == 2) {

        let user_message  = "Do you wish to take an extra turn?";
        let html = `<ul>
                    <li class="option" id="play">yes</li>
                    <li class="option" id="nope">no</li>
                    </ul>`;
        this.updateStatusWithOptions(user_message, html, function(action2) {

          if (action2 == "play") {
              twilight_self.addMove("resolve\tnorthsea");
              twilight_self.addMove("play\t2");
              twilight_self.endTurn();
          }
          if (action2 == "nope") {
              twilight_self.addMove("resolve\tnorthsea");
              twilight_self.addMove("play\t2");
              twilight_self.endTurn();
          }

        });
      }else{
        this.updateStatus("US determining whether to take extra turn");
      }
      shd_continue = 0;
    }


    if (mv[0] == "space") {
      this.playerSpaceCard(mv[2], mv[1]);
      if (mv[2] != "china") {
        this.game.deck[0].discards[mv[2]] = this.game.deck[0].cards[mv[2]];
      }
      this.game.queue.splice(qe, 1);
    }


    if (mv[0] == "unlimit") {
      if (mv[1] == "china") { this.game.state.events_china_card_in_play = 0; }
      if (mv[1] == "cmc") {
	this.game.state.events.cubanmissilecrisis = 0;
	this.game.state.events.cubanmissilecrisis_cancelled = 1;
	if (mv[2]) {
	  this.game.state.events.cubanmissilecrisis_removal_country = mv[2];
	}
      }
      if (mv[1] == "coups") { this.game.state.limit_coups = 0; }
      if (mv[1] == "spacerace") { this.game.state.limit_spacerace = 0; }
      if (mv[1] == "realignments") { this.game.state.limit_realignments = 0; }
      if (mv[1] == "placement") { this.game.state.limit_placement = 0; }
      if (mv[1] == "milops") { this.game.state.limit_milops = 0; }
      if (mv[1] == "ignoredefcon") { this.game.state.limit_ignoredefcon = 0; }
      if (mv[1] == "region") { this.game.state.limit_region = []; }
      this.game.queue.splice(qe, 1);
    }

    if (mv[0] == "dynamic_deck_management") {

      this.game.queue.splice(qe, 1);

      if (this.game.options.deck !== "saito") {
	return 1;
      }

      this.dynamicDeckManagement();

      //
      // show overlay and purge
      //
      //if ((this.game.saito_cards_added.length > 0 || this.game.saito_cards_removed.length > 0) && this.game.options.deck === "saito") {
      if (this.game.saito_cards_added.length > 0 && this.game.options.deck === "saito") {
	this.deck_overlay.render();
	this.game.saito_cards_added = [];
	this.game.saito_cards_added_reason = [];
	this.game.saito_cards_removed = [];
	this.game.saito_cards_removed_reason = [];
      }

      return 1;
    }

    if (mv[0] == "pinochet") {

      this.game.queue.splice(qe, 1);

      this.startClockAndSetActivePlayer(1);

      if (this.game.player == 1) {

        this.playerFinishedPlacingInfluence();

        var ops_available = 0;
        for (var i in this.countries) {
          if (this.countries[i].region == "camerica" || this.countries[i].region == "samerica") {
            if (this.countries[i].us > 0) {
	            ops_available++;
              $("#"+i).addClass("easterneurope");
              this.countries[i].place = 1;
            }
          }
        }

        if (ops_available == 0) {
	         return 1;
        }

        let ops_to_purge = 1;

        this.updateStatus("Remove 1 US influence from Central or South America");

        $(".easterneurope").off();
        $(".easterneurope").on('click', function() {
          let c = $(this).attr('id');
          if (twilight_self.countries[c].place != 1 || twilight_self.countries[c].us == 0) {
            twilight_self.displayModal("Invalid Country");
          } else {
            twilight_self.removeInfluence(c, 1, "us");
            twilight_self.addMove("remove\tussr\tus\t"+c+"\t1");
            twilight_self.playerFinishedPlacingInfluence();
            twilight_self.endTurn();
          }
        });

      }

      return 0;
    }



    // used by nixon shock
    if (mv[0] === "nixon_shock_play_card_or_hand_to_opponent") {

      this.game.queue.splice(qe, 1);

      let player = parseInt(mv[1]);
      let active_player = mv[2];
      let opponent = 1;
      if (player == 1) { opponent = 2; }

      this.startClockAndSetActivePlayer(player);

      if (this.game.player == player) {

	let card = this.game.deck[0].hand[this.game.deck[0].hand.length-1];

        let user_message = `${this.cardToText(card)} drawn:`;
        let html = `<ul>`;
        //if (this.game.state.headline == 1) {
        if (active_player === "us") {
          html += `<li class="option" id="play">play card</li>`;
        }
        html += `
            <li class="option" id="keep">hold card</li>
            <li class="option" id="hand">give to opponent</li>
            </ul>`;
        twilight_self.updateStatusWithOptions(user_message, html, function(action2) {
	  if (action2 === "play") {
	    twilight_self.addMove(`NOTIFY\tUS pulls and plays ${twilight_self.cardToText(card)}`);
            twilight_self.playerTurn(card);
          }
          if (action2 == "hand") {
	    twilight_self.addMove(`NOTIFY\tUS hands ${twilight_self.cardToText(card)} to USSR`);
            twilight_self.addMove("hand\t"+opponent+"\t"+card);
            twilight_self.endTurn();
	  }
          if (action2 == "keep") {
	    // it is already in my hand, so just end turn
            twilight_self.endTurn();
          }
	});
      }

      return 0;

    }


    if (mv[0] == "chernobyl") {
      this.game.state.events.chernobyl = mv[1];
      this.game.queue.splice(qe, 1);

      if (this.game.player == 1){
        this.displayModal("Chernobyl",`Influence placements restricted in ${this.region_key[mv[1]]}`);
      }
    }

    //
    // burn die roll
    if (mv[0] == "dice") {
      if (mv[1] == "burn") {
        if (this.game.player == 1 && mv[2] == "ussr") {
          roll = this.rollDice(6);
        }
        if (this.game.player == 2 && mv[2] == "us")   {
          roll = this.rollDice(6);
        }
        if (this.game.player == 0) {
          roll = this.rollDice(6);
        }
      }
      this.game.queue.splice(qe, 1);
    }

    //
    // aldrich ames
    if (mv[0] == "aldrichreveal") {

      if (this.game.player == 2) {

        let revealed = "", keys = "";
        for (let i = 0; i < this.game.deck[0].hand.length; i++) {
          if (i > 0) {
            revealed += ", ";
            keys += " ";
          }
          revealed += this.game.deck[0].cards[this.game.deck[0].hand[i]].name;
          keys += this.game.deck[0].hand[i];
        }

        if (this.game.deck[0].hand.length > 0 ) {
          this.addMove("showhand\t2\t"+keys);
          this.addMove("NOTIFY\tUS hand contains: "+revealed);
        } else {
          this.addMove("NOTIFY\tUS has no cards to reveal");
        }

        this.endTurn();
      }

      this.game.queue.splice(qe, 1);
      return 0;
    }

    if (mv[0] == "aldrich") {
      //
      // us telling ussr their hand, ussr picks a card to discard
      //
      if (mv[1] == "us") {

        let num = parseInt(mv[2]);
        let user_message = `${this.cardToText("aldrichames")}: USSR discard card from US hand:`;
        let uscards = [];
        this.game.queue.splice(qe, 1);

        for (let i = 0; i < num; i++) {
          uscards.push(this.game.queue.pop());
        }

        this.startClockAndSetActivePlayer(1);
        if (this.game.player == 1) {
          this.updateStatusAndListCards(user_message, uscards, function(action2) {
            twilight_self.addMove("discard\tus\t"+action2);
            twilight_self.addMove("aldrich\tussr\t"+action2);
            twilight_self.endTurn();
          });
        }else{
          this.updateStatus(`${this.cardToText("aldrichames")}: USSR choosing card to discard`);
        }

        return 0;
      }

      // ussr telling us which card to junk
      if (mv[1] == "ussr") {

        if (this.game.player == 2) {
          this.removeCardFromHand(mv[2]);
        }

        this.game.queue.splice(qe, 1);
        this.updateLog(`USSR forces US to discard ${this.cardToText(mv[2])}`);
        shd_continue = 1;
      }

    }

    if (mv[0] === "cambridge") {

      this.startClockAndSetActivePlayer(1);
      if (this.game.player == 1) {

        let placetxt = `${this.cardToText("cambridge")}: ${player.toUpperCase()} place 1 OP in`;
        for (let i = 1; i < mv.length; i++) {
          placetxt += " ";
          placetxt += this.cardToText(mv[i], true); //FIX Names

          for (var k in this.countries) {
            if (this.countries[k].region.includes(mv[i])) {
              $("#"+k).addClass("easterneurope");
            }
          }
        }

        $(".easterneurope").off();
        $(".easterneurope").on('click',function() {
          let countryname = $(this).attr('id');
          twilight_self.playerFinishedPlacingInfluence();
          twilight_self.placeInfluence(countryname, 1, "ussr");
          twilight_self.addMove("place\tussr\tussr\t"+countryname+"\t1");
          twilight_self.endTurn();
        });
        twilight_self.updateStatus(placetxt);

      }
      this.game.queue.splice(qe, 1);
      shd_continue = 0;
    }


    if (mv[0] === "teardownthiswall") {

      this.startClockAndSetActivePlayer(2);

      if (this.game.player == 2){

        let user_message = "Tear Down this Wall is played -- US may make 3 OP free Coup Attempt or Realignments in Europe.";
        let html = `<ul>
            <li class="option" id="taketear">make coup or realign</li>
            <li class="option" id="skiptear">skip coup</li>
            </ul>`;
        twilight_self.updateStatusWithOptions(user_message, html, function(action2) {

          if (action2 == "skiptear") {
            twilight_self.updateStatus("Skipping Tear Down this Wall...");
            twilight_self.addMove("resolve\tteardownthiswall");
            twilight_self.endTurn();
          }

          if (action2 == "taketear") {
            twilight_self.addMove("resolve\tteardownthiswall");
            twilight_self.addMove("unlimit\tignoredefcon");
            twilight_self.addMove("unlimit\tregion");
            twilight_self.addMove("unlimit\tplacement");
            twilight_self.addMove("unlimit\tmilops");
            twilight_self.addMove("ops\tus\tteardown\t3");
            twilight_self.addMove("limit\tmilops");
            twilight_self.addMove("limit\tplacement");
            twilight_self.addMove("limit\tregion\tasia");
            twilight_self.addMove("limit\tregion\tseasia");
            twilight_self.addMove("limit\tregion\tmideast");
            twilight_self.addMove("limit\tregion\tsamerica");
            twilight_self.addMove("limit\tregion\tcamerica");
            twilight_self.addMove("limit\tregion\tafrica");
            twilight_self.addMove("limit\tignoredefcon");
            twilight_self.endTurn();
          }

        });
      }else{
          this.updateStatus("US playing Tear Down This Wall");
      }
        shd_continue = 0;
      }


    if (mv[0] === "deal") {

      if (this.game.player == mv[1]) {

        let cards_needed_per_player = (this.game.state.round >= 4)? 9: 8;

        let my_cards = this.game.deck[0].hand.length;
        for (let z = 0; z < this.game.deck[0].hand.length; z++) {
          if (this.game.deck[0].hand[z] == "china") {
            my_cards--;
console.log("REDUCING CARDS NEEDED BECAUSE I HOLD CHINA to: " + my_cards);
          }
        }
        let cards_needed = cards_needed_per_player - my_cards;

console.log("CARDS NEEDED PER PLAYER: " + cards_needed_per_player + " - " + my_cards);

        this.addMove("resolve\tdeal");
        this.addMove("DEAL\t1\t"+mv[1]+"\t"+cards_needed);
        this.endTurn();
      }

      this.updateStatus(player.toUpperCase() + " is fetching new cards");
      return 0;
    }


    if (mv[0] === "reshuffle"){

        this.game.queue.splice(qe, 1);
        let reshuffle_limit = 14;
        let cards_needed_per_player = (this.game.state.round >= 4)? 9 : 8;

        let ussr_cards = this.game.deck[0].hand.length;
        let us_cards   = this.game.state.opponent_cards_in_hand; //Already filtered China card

        for (let z = 0; z < this.game.deck[0].hand.length; z++) {
          if (this.game.deck[0].hand[z] == "china") {
            ussr_cards--;
          }
        }

        if (this.game.player == 2) {
          let x = ussr_cards;
          ussr_cards = us_cards;
          us_cards = x;
        }

        let us_cards_needed = cards_needed_per_player - us_cards;
        let ussr_cards_needed = cards_needed_per_player - ussr_cards;
        reshuffle_limit = us_cards_needed + ussr_cards_needed;

console.log("-----------------------");
console.log("-----------------------");
console.log("US CARDS NEEDED:   " + us_cards_needed);
console.log("USSR CARDS NEEDED: " + us_cards_needed);
console.log("RESHUFFLE LIMIT:   " + reshuffle_limit);
console.log("-----------------------");


        if (this.game.deck[0].crypt.length < reshuffle_limit) {

          // no need to reshuffle in turn 4 or 8 as we have new cards inbound
          if (this.game.state.round != 4 && this.game.state.round != 8) {
            console.log("Need to reshuffle: ");

            // don't shuffle shuttle diplomacy back in if still in play
            if (this.game.state.events.shuttlediplomacy == 1) {
              if (this.game.deck[0].discards['shuttle']) {
                delete this.game.deck[0].discards['shuttle'];
              }
            }

            // this resets discards = {} so that DECKBACKUP will not retain
            let discarded_cards = this.returnDiscardedCards();

console.log("deck has crypt:    " + this.game.deck[0].crypt.length);
console.log("deck has discards 1:    " + this.game.deck[0].discards.length);
console.log("deck has discards 2: " + Object.keys(discarded_cards).length);
console.log("DESC: " + JSON.stringify(discarded_cards));

            if (Object.keys(discarded_cards).length > 0) {

              // shuffle in discarded cards
              this.game.queue.push("SHUFFLE\t1");
              this.game.queue.push("DECKRESTORE\t1");
              this.game.queue.push("DECKENCRYPT\t1\t2");
              this.game.queue.push("DECKENCRYPT\t1\t1");
              this.game.queue.push("DECKXOR\t1\t2");
              this.game.queue.push("DECKXOR\t1\t1");
              this.game.queue.push("DECK\t1\t"+JSON.stringify(discarded_cards));
              this.game.queue.push("DECKBACKUP\t1");
              //this.game.queue.push("HANDBACKUP\t1");
              this.updateLog("Shuffling discarded cards back into the deck...");

            }

            //
            // deal existing cards *evenly* before
            // we shuffle the discards into the
            // deck
            //
            let cards_available = this.game.deck[0].crypt.length;
            let player2_cards = Math.floor(cards_available / 2);
            let player1_cards = cards_available - player2_cards;;

            //
            // adjust distribution of cards
            if (player2_cards > us_cards_needed) {
              let surplus_cards = player2_cards - us_cards_needed;
              player2_cards = us_cards_needed;
              player1_cards += surplus_cards;
            }

            if (player1_cards > ussr_cards_needed) {
              let surplus_cards = player1_cards - ussr_cards_needed;
              player1_cards = ussr_cards_needed;
              player2_cards += surplus_cards;
            }

            if (player1_cards > 0) {
              this.game.queue.push("DEAL\t1\t2\t"+player2_cards);
              this.game.queue.push("DEAL\t1\t1\t"+player1_cards);
            }
            this.updateStatus("Dealing remaining cards from draw deck before reshuffling...");
            this.updateLog(`Dealing ${cards_available} remaining cards from draw deck before reshuffling...`);

          }

        }


    }

    // player | card | op
    if (mv[0] === "ops") {

      if (this.game.deck[0].cards[mv[2]] != undefined) { this.game.state.event_name = this.cardToText(mv[2]); }

      //Don't want to log the original ops value *****
      let orig_ops = parseInt(mv[3]);
      let mod_ops = this.modifyOps(orig_ops, mv[2], mv[1], 0);
      if (mod_ops > orig_ops){
        this.updateLog(mv[1].toUpperCase() + ` plays ${this.game.state.event_name} for ${mv[3]} OPS (+${mod_ops-orig_ops} bonus)`);
      }else if (mod_ops < orig_ops){
        this.updateLog(mv[1].toUpperCase() + ` plays ${this.game.state.event_name} for ${mv[3]} OPS (-${orig_ops-mod_ops} penalty)`);
      }else{
        this.updateLog(mv[1].toUpperCase() + ` plays ${this.game.state.event_name} for ${mv[3]} OPS`);
      }


      // stats
      if (mv[1] === "us") {
	this.game.state.stats.us_ops += parseInt(mv[3]);
	this.game.state.stats.us_modified_ops += mod_ops;
      }
      if (mv[1] === "ussr") {
	this.game.state.stats.ussr_ops += parseInt(mv[3]);
	this.game.state.stats.ussr_modified_ops += mod_ops;
      }
      if (this.game.deck[0].cards[mv[2]] != undefined) {
        if (this.game.deck[0].cards[mv[2]].player === "us") {
          if (mv[1] === "ussr") {
            this.game.state.stats.ussr_us_ops += parseInt(mv[3]);
          }
          if (mv[1] === "us") {
            this.game.state.stats.us_us_ops += parseInt(mv[3]);
          }
        }
        if (this.game.deck[0].cards[mv[2]].player === "ussr") {
          if (mv[1] === "ussr") {
            this.game.state.stats.ussr_ussr_ops += parseInt(mv[3]);
          }
          if (mv[1] === "us") {
            this.game.state.stats.us_ussr_ops += parseInt(mv[3]);
          }
        }
        if (this.game.deck[0].cards[mv[2]].player == "both") {
          if (mv[1] == "ussr") {
            this.game.state.stats.ussr_neutral_ops += parseInt(mv[3]);
          }
          if (mv[1] == "us") {
            this.game.state.stats.us_neutral_ops += parseInt(mv[3]);
          }
        }
      }

      // unset formosan if China card played by US
      if (mv[1] == "us" && mv[2] == "china") {
        this.game.state.events.formosan = 0;
        $('.formosan').hide();
      }

      this.playOps(mv[1], parseInt(mv[3]), mv[2]);
      shd_continue = 0;
    }


    if (mv[0] === "milops") {
      this.updateLog(mv[1].toUpperCase() + " receives " + mv[2] + " milops");
      if (mv[1] === "us") {
        this.game.state.milops_us += parseInt(mv[2]);
      } else {
        this.game.state.milops_ussr += parseInt(mv[2]);
      }
      this.updateMilitaryOperations();
      this.game.queue.splice(qe, 1);
    }


    if (mv[0] === "vp") {
      if (mv.length > 3) {
        if (parseInt(mv[3]) == 1) {
          this.updateLog(mv[1].toUpperCase() + " receives " + mv[2] + " VP", 1);
          if (mv[1] === "us") {
            this.game.state.vp_outstanding += parseInt(mv[2]);
          } else {
            this.game.state.vp_outstanding -= parseInt(mv[2]);
          }
        } else {
          if (mv[1] === "us") {
            this.game.state.vp += parseInt(mv[2]);
          } else {
            this.game.state.vp -= parseInt(mv[2]);
          }
        }
      } else {
        this.updateLog(mv[1].toUpperCase() + " receives " + mv[2] + " VP");
        if (mv[1] === "us") {
          this.game.state.vp += parseInt(mv[2]);
        } else {
          this.game.state.vp -= parseInt(mv[2]);
        }
        this.updateVictoryPoints();
      }
      this.game.queue.splice(qe, 1);
    }


    if (mv[0] === "coup") {

      let card = "";
      let player = mv[1];
      let countryname = mv[2];
      let ops = parseInt(mv[3]);
      if (mv.length >= 5) { card = mv[4]; }
      let mod_ops = this.modifyOps(ops, card, player, 0);

      this.updateLog(mv[1].toUpperCase() + " coups " + this.countries[mv[2]].name + " with " + mv[3] + " OPS");

      if (this.game.state.limit_milops != 1) {
        //
        // modify ops is handled incoherently with milops, so we calculate afresh here
        //
        // reason is that modify ops is run before submitting coups sometimes and sometimes now
        //
        if (mv[1] == "us") { this.game.state.milops_us += this.modifyOps(parseInt(mv[3]), card, "us"); }
        if (mv[1] == "ussr") { this.game.state.milops_ussr += this.modifyOps(parseInt(mv[3]), card, "ussr"); }

        this.updateMilitaryOperations();
      }
      //
      // do not submit card, ops already modified
      //
      this.playCoup(mv[1], mv[2], parseInt(mv[3]));
      this.game.queue.splice(qe, 1);
    }


    if (mv[0] === "realign") {
      if (mv[1] != player) {
        this.playRealign(mv[1], mv[2]);
      }
      this.game.queue.splice(qe, 1);
    }

    if (mv[0] === "defcon") {
      if (mv[1] === "lower") {
        this.lowerDefcon();
      }
      if (mv[1] === "raise") {
        this.game.state.defcon++;
        if (this.game.state.defcon > 5) { this.game.state.defcon = 5; }
        this.updateDefcon();
      }
      this.game.queue.splice(qe, 1);
    }


    if (mv[0] === "move") {
      if (mv[1] == "ussr") { this.game.state.move = 0; }
      if (mv[1] == "us") { this.game.state.move = 1; }
      this.game.queue.splice(qe, 1);
    }


    if (mv[0] === "event") {

      if (this.game.deck[0].cards[mv[2]] != undefined) { 
        if (mv[1] === "us") {
	  this.game.state.stats.us_events_ops += parseInt(this.game.deck[0].cards[mv[2]].ops);
        }
        if (mv[1] === "ussr") {
	  this.game.state.stats.ussr_events_ops += parseInt(this.game.deck[0].cards[mv[2]].ops);
        }
	this.game.state.event_name = this.cardToText(mv[2]);
      }
      this.updateLog(mv[1].toUpperCase() + ` triggers ${this.game.state.event_name} as an event`);

      shd_continue = this.playEvent(mv[1], mv[2]);

      //
      // show active events
      //
      this.updateEventTiles();

      if (shd_continue == 0) {
        //
        // game will stop
        //
        //this.game.saveGame(this.game.id);
      } else {
        //
        // only continue if we do not stop
        //
        if (mv[1] != "china") { //China card gets processed seperately
          //
          // remove non-recurring events from game
          //
          for (var i in this.game.deck[0].cards) {
            if (mv[2] == i) {
              if (this.game.deck[0].cards[i].recurring != 1) {

                let event_removal = 1;

                //
                // Wargames not removed if DEFCON > 2
                //
                if (this.game.state.defcon > 2 && mv[2] == "wargames") {
                  event_removal = 0;
                }

                //
                // NATO not removed if prerequisitcs not met
                //
                if (this.game.state.events.nato == 0 && mv[2] == "nato") {
                  event_removal = 0;
                }

                //
                // Solidarity not removed if Pope John Paul II not in play
                //
                if (this.game.state.events.johnpaul == 0 && mv[2] == "solidarity") {
                  event_removal = 0;
                }

                //
                // Star Wars not removed if not triggered
                //
                if (this.game.state.events.starwars == 0 && mv[2] == "starwars") {
                  event_removal = 0;
                }

                //
                // Our Man in Tehran not removed if not triggered
                //
                if (this.game.state.events.ourmanintehran == 0 && mv[2] == "ourmanintehran") {
                  event_removal = 0;
                }

                //
                // Kitchen Debates not removed if not triggered
                //
                if (this.game.state.events.kitchendebates == 0 && mv[2] == "kitchendebates") {
                  event_removal = 0;
                }


                if (event_removal == 1) {
                  this.updateLog(this.cardToText(i) + " removed from game");
                  this.game.deck[0].removed[i] = this.game.deck[0].cards[i];
                  delete this.game.deck[0].cards[i];
                } else {
                  // just discard -- NATO catch mostly
                  this.updateLog(this.cardToText(i) + " discarded");
                  this.game.deck[0].discards[i] = this.game.deck[0].cards[i];
                }
              } else {
                this.updateLog(this.cardToText(i) + " discarded");
                this.game.deck[0].discards[i] = this.game.deck[0].cards[i];
              }
            }
          }
        }

        // delete event if not deleted already
        this.game.queue.splice(qe, 1);
      }
    }


    if (mv[0] === "stability") {
      let p = mv[1];
      let c = mv[2];
      let adj = parseInt(mv[3]);
  	  if (this.countries[c] != undefined) {
  	    this.countries[c].control += adj;
  	    this.updateLog(this.countries[c].name + " stability is now " + this.countries[c].control);
  	  }
      this.game.queue.splice(qe, 1);
    }


    if (mv[0] === "place") {
      if (player !== mv[1]) { this.placeInfluence(mv[3], parseInt(mv[4]), mv[2]); }
      this.game.queue.splice(qe, 1);
    }

    if (mv[0] === "setvar") {
      this.game.queue.splice(qe, 1);
      let player = parseInt(mv[1]);

      if (mv[2] === "hold") {
	if (player == 1) {
	  this.game.state.player1_hold_cards = JSON.parse(mv[3]);
	}
	if (player == 2) {
	  this.game.state.player2_hold_cards = JSON.parse(mv[3]);
	}
	return 1;
      }

      if (this.game.player != mv[1]) {
  	if (mv[2] == "opponent_cards_in_hand") {
          this.game.state.opponent_cards_in_hand = parseInt(mv[3]);
        }
        if (mv[3]) {
          if (mv[3] == "back_button_cancelled") {
           this.game.state.back_button_cancelled = parseInt(mv[4]);
          }
        }
      }
    }


    if (mv[0] === "remove") {
      if (player != mv[1]) { this.removeInfluence(mv[3], parseInt(mv[4]), mv[2]); }
      this.game.queue.splice(qe, 1);
    }


    if (mv[0] === "resolve") {

      //
      // eliminate junta
      //
      if (mv[1] === "junta") { this.game.state.events.junta = 0; }

      if (qe == 0) {
          this.game.queue = [];
      } else {

        let le = qe-1;

        //
        // resolving UN intervention means disabling the effect
        //
        if (mv[1] == "unintervention") {

  	      //
  	      // if u2 in play, give extra VP
  	      //
  	      if (this.game.state.events.u2 == 1) {
        		this.updateLog("USSR gains +1 VP bonus from U2 Intervention");
        		this.game.state.vp--;
  	        this.updateVictoryPoints();
  	      }

          //
          // UNIntervention causing issues with USSR when US plays
          // force the event to reset in ALL circumstances
          this.game.state.events.unintervention = 0;

          let lmv = this.game.queue[le].split("\t");
          if (lmv[0] == "event" && lmv[2] == mv[1]) {
            this.game.state.events.unintervention = 0;
          }

        }

        //
        // we can remove the event if it is immediately above us in the queue
        //
        if (le <= 0) {
          this.game.queue = ["round"]; // shd be first
        } else {

          let lmv = this.game.queue[le].split("\t");
          let rmvd = 0;

  	      if (lmv[0] === "OBSERVER_CHECKPOINT" && le >= 1) {
        		let tmp = this.game.queue[le];
	          this.game.queue[le] = this.game.queue[le-1];
		        this.game.queue[le-1] = tmp;
            lmv = this.game.queue[le].split("\t");
	        }

          if (lmv[0] == "headline" && mv[1] == "headline") {
            this.game.queue.splice(le, 2);
            rmvd = 1;
          }
          if (lmv[0] == "ops" && mv[1] == "ops") {
            this.game.queue.splice(le, 2);
            rmvd = 1;
          }
          if (lmv[0] == "play" && mv[1] == "play") {
            this.game.queue.splice(le, 2);
            rmvd = 1;
          }
          if (lmv[0] == "event" && lmv[2] == mv[1]) {
            this.game.queue.splice(le, 2);
            rmvd = 1;
          }
          if (lmv[0] == "placement" && mv[1] == "placement") {
            this.game.queue.splice(le, 2);
            rmvd = 1;
          }
          if (lmv[0] == "placement_bonus" && mv[1] == "placement_bonus") {
            this.game.queue.splice(le, 2);
            rmvd = 1;
          }
          if (lmv[0] == "deal" && mv[1] == "deal") {
            this.game.queue.splice(le, 2);
            rmvd = 1;
          }
          if (lmv[0] == "discard" && lmv[2] == mv[1]) {
            this.game.queue.splice(qe, 1);
            rmvd = 1;
          }
          if (lmv[0] === mv[1]) {	// "discard teardownthiswall"
            this.game.queue.splice(le, 2);
            rmvd = 1;
          }
          if (rmvd == 0) {
            //
            // remove the event
            //
            this.game.queue.splice(qe, 1);
            //
            // go back through the queue and remove the first event that matches this one
            //
            for (let z = le, zz = 1; z >= 0 && zz == 1; z--) {
              let tmplmv = this.game.queue[z].split("\t");
              if (tmplmv.length > 0) {
                if (tmplmv[0] === "event") {
                  if (tmplmv.length > 2) {
                    if (tmplmv[2] === mv[1]) {
                      this.game.queue.splice(z);
                      zz = 0;
                    }
                  }
                }

                //
          	    // may need to remove deal
                if (tmplmv[0] === "deal" && mv[1] == "deal") {
                  this.game.queue.splice(z);
                  zz = 0;
        		    }
              }
            }
          }
        }
      }

      //
      // remove non-recurring events from game
      //
      for (var i in this.game.deck[0].cards) {
        if (mv[1] == i) {
          if (this.game.deck[0].cards[i].recurring != 1) {
            this.updateLog(this.cardToText(i) + " removed from game");
            this.game.deck[0].removed[i] = this.game.deck[0].cards[i];
            delete this.game.deck[0].cards[i];
          } else {
            this.updateLog(this.cardToText(i) + " discarded");
            this.game.deck[0].discards[i] = this.game.deck[0].cards[i];
          }
        }
      }
    }


    if (mv[0] === "clear"){
      this.game.queue.splice(qe, 1);
      if (mv[1] == "headline"){
        // it is no longer the headline
        this.game.state.headline = 0;
        this.game.state.headline_card = "";
        this.game.state.headline_xor = "";
        this.game.state.headline_hash = "";
        this.game.state.headline_opponent_hash = "";
        this.game.state.headline_opponent_xor = "";
        this.game.state.headline_opponent_card = "";
        return 1;
      }
    }

    if (mv[0] === "placement") {

      //
      // TESTING
      //
      // if you want to hardcode the hands of the players, you can set
      // them manually here. Be sure that all of the cards have been
      // dealt ento the DECK during the setup phase though.
      //
      if (this.is_testing == 1) {
        if (this.game.player == 2) {
          this.game.deck[0].hand = ["flowerpower", "saltnegotiations","argo","voiceofamerica", "asia", "mideast", "europe", "opec", "awacs"];
        } else {
          this.game.deck[0].hand = ["cubanmissile", "abmtreaty","vietnamrevolts","wargames","romanianab"];
        }

      	//this.game.state.round = 1;
       	this.displayBoard();
      }

      //
      // add china card to deck and make sure it is in USSR's hand
      //
      this.game.deck[0].cards["china"] = this.returnChinaCard();
      if (this.game.player == 1) {
        let hand_contains_china = 0;
        for (let x = 0; x < this.game.deck[0].hand.length; x++) {
          if (this.game.deck[0].hand[x] == "china") { hand_contains_china = 1; }
        }
        if (hand_contains_china == 0) {
          if (!this.game.deck[0].hand.includes("china")) {
            this.game.deck[0].hand.push("china");
          }
        }
      }

      //
      // Late-War scenario skips
      //
      if (this.game.options.deck === "late-war") {
	this.game.queue.splice(qe, 1);
	return 1;
      }

      if (this.is_testing && this.game.player == mv[1]){
        this.addMove("resolve\tplacement");
        if (this.game.player == 1){
          this.addMove("place\tussr\tussr\tpoland\t3");
          this.addMove("place\tussr\tussr\tfinland\t3");
          this.placeInfluence("poland", 3, "ussr");
          this.placeInfluence("finland", 3, "ussr");
        }else{
          this.addMove("place\tus\tus\twestgermany\t3");
          this.addMove("place\tus\tus\tfrance\t3");
          this.addMove("place\tus\tus\titaly\t1");
          this.placeInfluence("westgermany", 3, "us");
          this.placeInfluence("france", 3, "us");
          this.placeInfluence("italy", 1, "us");
        }
        this.endTurn();
        return 0;
      }

      this.startClockAndSetActivePlayer(parseInt(mv[1]));
      if (this.game.player == mv[1]) {
        this.playerPlaceInitialInfluence();
      } else {
	      this.game_help.hide();
        this.updateStatusAndListCards(`${(mv[1] == 1)?"USSR":"US"} is making its initial placement of influence:`);
      }

      // do not remove from queue -- handle RESOLVE on endTurn submission
      return 0;
    }


    if (mv[0] === "placement_bonus") {
      //
      // only the US gets a placement_bonus
      //
      this.startClockAndSetActivePlayer(parseInt(mv[1]));

      if (this.game.player == mv[1]) {
        this.playerPlaceBonusInfluence(mv[2]);
      } else {
        this.updateStatusAndListCards(`${(mv[1] == 1)?"USSR":"US"} is making its bonus placement of ${mv[2]} influence`);
      }

      // do not remove from queue -- handle RESOLVE on endTurn submission
      return 0;
    }

    if (mv[0] === "headline") {

      //
      // in case still showing
      //
      this.game_help.hide();

      let stage  = mv[1] || "headline1";
      let hash   = mv[2] || "";
      let xor    = mv[3] || "";
      let card   = mv[4] || "";

      this.game.state.headline = 1;

      //
      // add Xs to cards - update cancelled events array
      //
      this.cancelEventsDynamically();

console.log("$");
console.log("$");
console.log("$");
console.log("play headline post modern...");

      let x = this.playHeadlinePostModern(stage, hash, xor, card);
      //
      // do not remove from queue -- handle RESOLVE on endTurn submission
      //
      return 0;

    }

    if (mv[0] === "deckaddcards") {

      let cards = JSON.parse(mv[1]);
      let ac = this.returnAllCards();

      for (let key in cards) {
        if (ac[key]) {
	  this.game.deck[0].cards[key] = ac[key];
        }
      }    

      this.game.queue.splice(qe, 1);
      return 1;

    }

    if (mv[0] === "round") {

      //
      // china card is face-up
      //
      this.game.state.events.china_card_facedown = 0;

      //
      // reset 
      //
      this.game.state.defectors_pulled_in_headline = false;


      //
      // reset / disable aldrich
      //
      this.game.state.events.aldrich = 0;

      //
      // END OF HISTORY
      //
      this.game.state.events.inftreaty = 0;

      //
      // SAITO COMMUNITY CARD
      //
      this.game.state.events.carterdoctrine = 0;

try {

      //
      // NORAD -- we check here in case the final move of the round triggers it
      //
      if (this.game.state.us_defcon_bonus == 1) {

        //
        // prevent DEFCON bonus from repeating when we bounce back to "round"
        //
        this.game.state.us_defcon_bonus = 0;

        if (this.isControlled("us", "canada") == 1) {

          this.updateLog("NORAD triggers: US places 1 influence in country with US influence");

          if (this.game.player == 2) {

            for (var i in this.countries) {
              if (this.countries[i].us > 0) {
                $("#"+i).addClass("westerneurope");
              }
            }

            this.updateStatus("Place your NORAD bonus: (1 OP)");

            $(".westerneurope").off();
            $(".westerneurope").on('click', function() {

              // no need for this end-of-round
              // twilight_self.addMove("resolve\tturn");

              let countryname = $(this).attr('id');
              twilight_self.addMove("place\tus\tus\t"+countryname+"\t1");
              twilight_self.placeInfluence(countryname, 1, "us");
              twilight_self.playerFinishedPlacingInfluence();
              twilight_self.endTurn();
            });

          }else{
            this.updateStatus("NORAD triggers: US places 1 influence in country with US influence");
          }
          return 0;
        }
      }

} catch (err) {
}


      //
      // settle outstanding VP issue
      //
      this.settleVPOutstanding();

      //
      // show active events
      //
      this.updateEventTiles();

      //
      // USSR gets extra turn if desired
      //
      if (this.game.state.events.khruschev_thaw) {
	this.game.state.events.khruschev_thaw = 0;
        if (this.game.player == 1) {

          //
          // USSR gets extra move
          //
          let html  = `<ul>
                      <li class="option" id="play">play extra turn</li>
                      <li class="option" id="nope">do not play</li>
                      </ul>`;
          this.updateStatusWithOptions(`Do you want to take an extra turn? (Khruschev Thaw)`,html, function(action2) {

            if (action2 == "play") {
              twilight_self.addMove("play\t1");
              twilight_self.endTurn(1);
            }
            if (action2 == "nope") {
              twilight_self.addMove("NOTIFY\tUSSR does not play extra turn");
              twilight_self.endTurn(1);
            }

          });
        } else {
          this.updateStatus("USSR is deciding whether to take extra turn");
        }
	return 0;
      }


      if (this.game.state.events.northseaoil_bonus == 1) {
        //
        // prevent North Sea Oil bonus from carrying over to next round
        //
        this.game.state.events.northseaoil_bonus = 0;

        if (this.game.player == 2) {

          //
          // US gets extra move
          //
          let html  = `<ul>
                      <li class="option" id="play">play extra turn</li>
                      <li class="option" id="nope">do not play</li>
                      </ul>`;
          this.updateStatusWithOptions(`Do you want to take an extra turn? (North Sea Oil)`,html, function(action2) {

            if (action2 == "play") {
              twilight_self.addMove("play\t2");
              twilight_self.endTurn(1);
            }
            if (action2 == "nope") {
              twilight_self.addMove("NOTIFY\tUS does not play extra turn");
              twilight_self.endTurn(1);
            }

          });
        }else{
          this.updateStatus("US is deciding whether to take extra turn");
        }

        return 0;
      }

      //
      // Eagle/Bear Has Landed -- Player can discard a held card
      //
      if (this.game.state.eagle_has_landed != "" && this.game.state.eagle_has_landed_bonus_taken == 0 && this.game.state.round > 0) {
try {
        this.game.state.eagle_has_landed_bonus_taken = 1;

        let bonus_player = (this.game.state.eagle_has_landed == "us") ? 2 : 1;

        if (this.game.player != bonus_player) {
          this.updateStatus(this.game.state.eagle_has_landed.toUpperCase() + " is deciding whether to discard a card");
          return 0;
        }

  	let available_cards = [];
  	for (let i = 0; i < this.game.deck[0].hand.length; i++) {
  	  let thiscard = this.game.deck[0].hand[i];
  	  if (thiscard != "europe" && thiscard != "asia" && thiscard != "mideast" && thiscard != "seasia" && thiscard != "camerica" && thiscard != "samerica" && thiscard != "africa" && thiscard != "china") {
  	    available_cards.push(thiscard);
  	  }
  	}

  	//
        // if we have no cards, skip
  	//
        if (available_cards.length == 0) {
  	  this.updateLog("No cards in hand, skipping end-of-turn discard");
  	  this.addMove("NOTIFY\tSkipping Eagle / Bear has Landed");
  	  this.endTurn();
  	} else {
          let user_message = `${this.game.state.eagle_has_landed.toUpperCase()} may discard a card: (${(bonus_player == 1)?"Bear":"Eagle"} Has Landed)`;
          let html = `<ul>`;
          for (let i = 0; i < available_cards.length; i++) {
            html += `<li class="option" id="${available_cards[i]}">${twilight_self.game.deck[0].cards[available_cards[i]].name}</li>`;
          }
          html +=    `<li class="option dashed nocard" id="nope">do not discard</li>
                      </ul>`;

          this.updateStatusWithOptions(user_message, html, function(action2) {

            if (action2 == "nope") {
              twilight_self.addMove("NOTIFY\t"+twilight_self.game.state.eagle_has_landed.toUpperCase()+" does not discard a card");
              twilight_self.endTurn(1);
            } else {
              $(`#${action2}.card`).hide();
              twilight_self.hideCard();
              twilight_self.updateStatus("Discarding...");
              twilight_self.removeCardFromHand(action2);
              twilight_self.addMove("discard\t"+twilight_self.game.state.eagle_has_landed+"\t"+action2);
              twilight_self.addMove("NOTIFY\t"+twilight_self.game.state.eagle_has_landed.toUpperCase()+` discards ${twilight_self.cardToText(action2)}`);
              twilight_self.endTurn(1);
              return 0;
            }
          });
        }

        return 0;
} catch (err) {
}
      }

      //
      // Space Station
      //
      if (this.game.state.space_station != "" && this.game.state.space_station_bonus_taken == 0 && this.game.state.round > 0) {

        this.game.state.space_station_bonus_taken = 1;

        let bonus_player = (this.game.state.space_station == "us") ? 2 : 1;

        if (this.game.player != bonus_player) {
          this.updateStatus(this.game.state.space_station.toUpperCase() + " is deciding whether to take extra turn");
          return 0;
        }

        //
        // player gets extra move
        //
        let html  = `<ul><li class="option" id="play">play extra turn</li>
                     <li class="option" id="nope">do not play</li></ul>`;
        this.updateStatusWithOptions("Do you want to take an extra turn: (Space Shuttle)", html, function(action2) {
          if (action2 == "play") {
            twilight_self.addMove("play\t"+bonus_player);
            twilight_self.endTurn(1);
          }
          if (action2 == "nope") {
            twilight_self.addMove("NOTIFY\t"+twilight_self.game.state.space_station.toUpperCase()+" does not play extra turn");
            twilight_self.endTurn(1);
          }
        });

        return 0;

      }

      //
      // if we have come this far, move to the next turn
      //
      if (this.game.state.round > 0) {
        this.updateLog("End of Round " + this.game.state.round);
      }

      //Increment state.round and resets state variables for next round
      if (!this.endRound()) { return 0; }


      //
      // STATS - aggregate the statisics
      //
      if (this.game.state.round > 1) {
	while (this.game.state.stats.round.length < (this.game.state.round - 1)) {
          this.game.state.stats.round.push({});
          this.game.state.stats.round[this.game.state.stats.round.length-1].us_scorings = this.game.state.stats.us_scorings;
          this.game.state.stats.round[this.game.state.stats.round.length-1].ussr_scorings = this.game.state.stats.ussr_scorings;
          this.game.state.stats.round[this.game.state.stats.round.length-1].us_ops = this.game.state.stats.us_ops;
          this.game.state.stats.round[this.game.state.stats.round.length-1].ussr_ops = this.game.state.stats.ussr_ops;
          this.game.state.stats.round[this.game.state.stats.round.length-1].us_events_ops = this.game.state.stats.us_events_ops;
          this.game.state.stats.round[this.game.state.stats.round.length-1].ussr_events_ops = this.game.state.stats.ussr_events_ops;
          this.game.state.stats.round[this.game.state.stats.round.length-1].us_modified_ops = this.game.state.stats.us_modified_ops;
          this.game.state.stats.round[this.game.state.stats.round.length-1].ussr_modified_ops = this.game.state.stats.ussr_modified_ops;
          this.game.state.stats.round[this.game.state.stats.round.length-1].us_us_ops = this.game.state.stats.us_ops;
          this.game.state.stats.round[this.game.state.stats.round.length-1].ussr_us_ops = this.game.state.stats.ussr_ussr_ops;
          this.game.state.stats.round[this.game.state.stats.round.length-1].us_ussr_ops = this.game.state.stats.us_ussr_ops;
          this.game.state.stats.round[this.game.state.stats.round.length-1].ussr_ussr_ops = this.game.state.stats.ussr_ussr_ops;
          this.game.state.stats.round[this.game.state.stats.round.length-1].us_neutral_ops = this.game.state.stats.us_neutral_ops;
          this.game.state.stats.round[this.game.state.stats.round.length-1].ussr_neutral_ops = this.game.state.stats.ussr_neutral_ops;
          this.game.state.stats.round[this.game.state.stats.round.length-1].vp = this.game.state.vp;
	}
      }


      //
      // END GAME IF WE MAKE IT !
      //
      if (this.game.state.round == 11) {
        this.finalScoring();
        return 0; //Stop running through the queue
      }

      this.updateStatus("Preparing for round " + this.game.state.round);


      let rounds_in_turn = 6;
      if (this.game.state.round > 3) { rounds_in_turn = 7; }

      for (let i = 0; i < rounds_in_turn; i++) {
        this.game.queue.push("turn");
        this.game.queue.push("play\t2");
        this.game.queue.push("play\t1");
      }



      //this.game.queue.push("update_observers\t2");
      //this.game.queue.push("update_observers\t1");


      //
      // trigger headline
      //
      this.game.queue.push("headline");


      //
      // ADD CARDS + DYNAMIC
      //
      if (this.game.state.round > 1) {

        this.updateLog(this.game.deck[0].crypt.length + " cards remaining in deck...");

        this.game.queue.push("deal\t2");
        this.game.queue.push("deal\t1");

        this.game.queue.push("reshuffle");


	//
	// this permits each player to select 1 card entering midwar / latewar
	//
        if (this.game.options.deck === "saito") {
          if (this.game.state.round == 4) {
    	    this.game.queue.push("choose_midwar_optional_cards");
    	    this.game.queue.push("RESETCONFIRMSNEEDED\tall");
	  }
	  if (this.game.state.round == 8) {
    	    this.game.queue.push("choose_latewar_optional_cards");
    	    this.game.queue.push("RESETCONFIRMSNEEDED\tall");
	  }
	}


	//
	// COMMUNITY EDITION - dynamic deck management
	//
	if (this.game.state.round == 3) {
          if (this.game.options.deck === "saito") {
            if (this.game.state.events.cia != 1 && this.game.state.events.tsarbomba_added != 1) {
//	      this.game.state.events.tsarbomba_added = 1;
//	      this.addCardToDeck('tsarbomba', "New Card");
	    }
	  }
	}

        if (this.game.state.round == 4) {

          this.game.queue.push("SHUFFLE\t1");
          this.game.queue.push("DECKRESTORE\t1");
          this.game.queue.push("DECKENCRYPT\t1\t2");
          this.game.queue.push("DECKENCRYPT\t1\t1");
          this.game.queue.push("DECKXOR\t1\t2");
          this.game.queue.push("DECKXOR\t1\t1");

	  //
	  // SAITO COMMUNITY
	  //
	  let mid_war_cards = this.returnMidWarCards();
          if (this.game.options.deck === "saito") {

	    //
	    // remove
	    //
	    this.removeCardFromDeckNextDeal("summit", "Removed");
            if (this.game.state.events.cia == 1 && this.game.state.events.tsarbomba_added == 1) {
//	      this.game.state.events.tsarbomba_added = 1; // avoid getting re-added later
//            this.removeCardFromDeckNextDeal("tsarbomba", "CIA Evented");
//	      this.cancelEvent("tsarbomba");
	    }
	    if (this.game.state.events.iranianultimatum != 1 && this.game.state.events.iranianultimatum_removed != 1) {
	      this.game.state.events.iranianultimatum_removed = 1;
	      this.removeCardFromDeckNextDeal("iranianultimatum", "Removed");
	    }
	    if (this.game.state.events.fidel != 1) {
	      this.removeCardFromDeckNextDeal("cubanmissile", "Fidel not evented");
	    }
	    if (this.game.state.events.cia_created != 1) {
	      this.removeCardFromDeckNextDeal("lonegunman", "CIA not evented");
	    }


	    //
	    // dynamic cards removed, so refresh cardlist
	    //
	    mid_war_cards = this.returnMidWarCards();

	    //
	    // then add 
	    //
            if (this.game.state.events.cia_created == 1 && this.game.state.events.cia_created_added != 1) {
	      this.addCardToDeck("lonegunman", "Prerequisites Met");
	      this.game.state.events.cia_created_added = 1;
	    }
//	    if (this.game.state.events.handshake_added != 1) {
//	      this.addCardToDeck("handshake", "New Card");
//	      this.game.state.events.handshake_added = 1;
//	    }

	    //
	    // delete removed from existing deck
	    //
	    delete mid_war_cards['cubanmissile'];
	    delete mid_war_cards['lonegunman'];
	    delete mid_war_cards['summit'];

	  }

          this.game.queue.push("DECK\t1\t"+JSON.stringify(mid_war_cards));
          //this.game.queue.push("HANDBACKUP\t1");
          this.game.queue.push("DECKBACKUP\t1");
          this.updateLog("Adding Mid War cards to the deck...");

        }

	if (this.game.state.round == 4) {
          if (this.game.options.deck === "saito") {
	    if (this.game.state.events.bayofpigs_added != 1 && this.game.state.events.fidel == 1 && this.game.state.events.bayofpigs != 1 && this.game.state.events.cubanmissile != 1) {
//	      this.game.state.events.bayofpigs_added = 1;
//	      this.addCardToDeck('bayofpigs', "New Card");
	    }
//	    this.addCardToDeck('fischerspassky', "New Card");
	    if (this.game.state.events.vietname_revolts == 1 && this.game.state.events.fallofsaigon_added == 0) {
//	      this.game.state.events.fallofsaigon_added = 1;
//	      this.addCardToDeck('fallofsaigon', "New Card");
	    }
	  }
	}

	if (this.game.state.round == 6) {
          if (this.game.options.deck === "saito") {
//	    this.addCardToDeck('nixonshock', "New Card");
//	    this.addCardToDeck('energycrisis', "New Card");
	  }
	}

	if (this.game.state.round == 7) {
          if (this.game.options.deck === "saito") {
	    let euc =  this.isControlled("us", "italy");
	        euc += this.isControlled("us", "france");
	        euc += this.isControlled("us", "westgermany");
	        euc += this.isControlled("us", "eastgermany");
	        euc += this.isControlled("us", "poland");
	    // USSR gets balance if US controls 1 or fewer European
	    // battlegrounds. This provides a slight check against 
	    // the lack of a US bonus early-war.
	    if (euc < 2) {
//	      this.addCardToDeck('khrushchevthaw', "European Domination");
	    }
	  }
	}

        if (this.game.state.round == 8) {

          this.game.queue.push("SHUFFLE\t1");
          this.game.queue.push("DECKRESTORE\t1");
          this.game.queue.push("DECKENCRYPT\t1\t2");
          this.game.queue.push("DECKENCRYPT\t1\t1");
          this.game.queue.push("DECKXOR\t1\t2");
          this.game.queue.push("DECKXOR\t1\t1");

	  //
	  // SAITO COMMUNITY
	  //
	  let late_war_cards = this.returnLateWarCards();
          if (this.game.options.deck === "saito") {

	    //
	    // remove
	    //
	    //
	    // revolutions 1989
	    //
            if (this.isControlled("ussr", "southkorea") == 1 && this.game.state.events.revolutionsof1989_added != 1) {
	      delete late_war_cards['KAL007'];
	      this.removeCardFromDeckNextDeal("KAL007", "Prerequisite Unmet");
	    } else {
	    }
	    //
	    // Star Wars
	    //
	    if (this.game.state.space_race_ussr_counter <= this.game.state.space_race_us_counter) {
	    } else {
	      this.removeCardFromDeckNextDeal("starwars", "US not ahead in Space Race");
	    }
	    //
	    // Ortega
	    //
 	    if (this.countries['cuba'].us < 1) {
	      this.removeCardFromDeckNextDeal("ortega", "US has no influence in Cuba");
	    }
	    //
	    // Cambridge
	    //
	    this.removeCardFromDeckNextDeal("cambridge", "Removed from Game");
	    //
	    //
	    //


	    //
	    // dynamic cards removed, so refresh cardlist
	    //
	    late_war_cards = this.returnLateWarCards();

	    //
	    // SOLIDARITY
	    //
	    if (this.game.state.events.johnpaul == 1 && this.game.state.events.solidarity_added != 1) {
	      this.game.state.events.solidarity_added = 1;
	      //this.addCardToDeck("solidarity", "Prerequisite Met");
	    } else {
	      delete late_war_cards['solidarity'];
	      this.removeCardFromDeckNextDeal("solidarity", "Prerequisite Unmet");
	    }

	    //
	    // RUST IN RED SQUARE
	    //
	    if (this.game.state.events.rustinredsquare_added != 1) {
	      this.game.state.events.rustinredsquare_added = 1;
	      this.addCardToDeck("rustinredsquare", "Replace Cambridge Five");
	    }
	    //
	    // KAL007 or 1989
	    //
            if (this.isControlled("ussr", "southkorea") == 1 && this.game.state.events.revolutionsof1989_added != 1) {
	      this.game.state.events.revolutionsof1989_added = 1;
	      this.addCardToDeck("revolutionsof1989", "Replacement for KAL007");
	    } else {
	    }

	    //
	    // then delete
	    //
	    if (this.game.state.space_race_ussr_counter <= this.game.state.space_race_us_counter) {
	    } else {
	      delete late_war_cards['starwars'];
	    }
	    //
	    // Ortega
	    //
 	    if (this.countries['cuba'].us < 1) {
	      delete late_war_cards['ortega'];
	    }

	  }

          this.game.queue.push("DECK\t1\t"+JSON.stringify(late_war_cards));
          this.game.queue.push("DECKBACKUP\t1");
          this.updateLog("Adding Late War cards to the deck...");

        }

	if (this.game.state.round == 9) {
          if (this.game.options.deck === "saito") {
	    if (this.isControlled("us", "canada")) {
//	      this.addCardToDeck('argo', "New Card");
	    }
	  }
	}

	if (this.game.state.round == 10) {
          if (this.game.options.deck === "saito") {
	   if (this.isControlled("us", "southafrica")) {
//	     this.addCardToDeck('antiapartheid', "New Card");
	    }
	  }
	}



        //
        // dynamic deck management -- SAITO COMMUNITY
        //
        // dynamically adding and removing cards from the deck based on card and game
        // logic criteria. this is how the Saito Edition manages to squeeze in a bunch
        // of dynamic balancing behavior.
        //
        if (this.game.state.round >= 1) {
	  if (this.game.options.deck === "saito") {
            this.game.queue.push("dynamic_deck_management");
	  }
    	  // tournament reveal before reshuffles
          this.game.queue.push("sharehandsize\t2");
          this.game.queue.push("sharehandsize\t1");

        }

      } else {

	if (!this.game.saito_cards_added) {
	  this.game.saito_cards_added = [];
	  this.game.saito_cards_added_reason = [];
	  this.game.saito_cards_removed = [];
  	  this.game.saito_cards_removed_reason = [];
	}

	if (this.game.options.deck === "saito") {
          if (this.game.saito_cards_added.length > 0 || this.game.saito_cards_removed.length > 0) {
	    if (this.game.saito_cards_added.length > 0 ) { this.deck_overlay.render(); }
	    this.game.saito_cards_added = [];
	    this.game.saito_cards_added_reason = [];
	    this.game.saito_cards_removed = [];
  	    this.game.saito_cards_removed_reason = [];
          }
        }

      }

      return 1;

    }


    if (mv[0] === "play") {

console.log("EXECUTING PLAY!");

      //if (this.game.player == 0) {
      //  this.game.queue.push("OBSERVER_CHECKPOINT");
      //}

      //
      // copy for reversion
      //
      try {
        start_turn_game_state = JSON.parse(JSON.stringify(this.game.state));
        start_turn_game_queue = JSON.parse(JSON.stringify(this.game.queue));
      } catch (err) {
        start_turn_game_state = null;
        start_turn_game_queue = null;
      }

      //
      // cancel events
      this.cancelEventsDynamically();

      //
      // resolve outstanding VP
      this.settleVPOutstanding();

      //
      // show active events
      this.updateEventTiles();

      //keep track of phasing player
      this.game.state.turn = parseInt(mv[1]);

console.log("TURN IS: " + this.game.state.turn);

      //
      // deactivate cards
      this.game.state.events.china_card_eligible = 0;
      this.displayChinaCard();

      //
      // back button functions again
      this.game.state.back_button_cancelled = 0;
      this.game.state.events.cubanmissilecrisis_cancelled = 0;
      this.game.state.events.cubanmissilecrisis_removal_country = "";

      //
      // NORAD -- NEEDS TESTING
      //
      if (this.game.state.us_defcon_bonus == 1) {
        this.game.state.us_defcon_bonus = 0;
        if (this.isControlled("us", "canada") == 1) {

          let twilight_self = this;

          this.updateLog("NORAD triggers: US places 1 influence in country with US influence");

          twilight_self.startClockAndSetActivePlayer(2);

          if (this.game.player == 2) {

            for (var i in this.countries) {
              if (this.countries[i].us > 0) {
                $("#"+i).addClass("westerneurope");
              }
            }

            this.updateStatus("US place NORAD bonus: (1 OP)");

            $(".westerneurope").off();
            $(".westerneurope").on('click', function() {
              let countryname = $(this).attr('id');

              twilight_self.addMove("resolve\tturn");
              twilight_self.addMove("place\tus\tus\t"+countryname+"\t1");

              twilight_self.placeInfluence(countryname, 1, "us", function() {
              twilight_self.playerFinishedPlacingInfluence();
              twilight_self.endTurn();
              });
            });
          } else {
            this.updateStatus("NORAD triggers: US places 1 influence in country with US influence");
          }
          return 0;
        }
      }

      this.displayBoard();

      this.playMove();
      return 0;
    }

    if (mv[0] === "showhand") {
      this.game.queue.splice(qe, 1);
      let whosehand = parseInt(mv[1]);

      if (mv[2] !== "") {
        let cards_to_reveal = mv[2].split(" ");
        let title = (whosehand == 1)? "USSR Hand" : "US Hand";
        if (this.game.player != whosehand){
          this.showCardOverlay(cards_to_reveal, title);
        }
      }

      return 1;
    }


    if (mv[0] === "modal"){
      this.game.queue.splice(qe, 1);
      this.displayModal(mv[1],mv[2]);
      return 1;
    }


    if (mv[0] === "sharehandsize"){

      let player = parseInt(mv[1]);

      //
      // the hold card is shared according to tournament rules, and used
      // to avoid re-dealing when cards are added / removed in the dynamic
      // edition of the game.
      //
      let cards = [];

      this.game.queue.splice(qe, 1);

      if (this.game.player == player){
        let cards_in_hand = this.game.deck[0].hand.length;
        for (let z = 0; z < this.game.deck[0].hand.length; z++) {
          if (this.game.deck[0].hand[z] === "china") {
            cards_in_hand--;
          } else {
	    cards.push(this.game.deck[0].hand[z]);
          }
        }
        this.addMove("setvar\t"+this.game.player+"\thold\t"+JSON.stringify(cards));
        this.addMove("setvar\t"+this.game.player+"\topponent_cards_in_hand\t"+cards_in_hand);
        this.endTurn();
      }

      return 0;
    }

    if (mv[0] === "war"){

      let card 		= mv[1] || "";
      let winner 	= mv[2] || "";
      let die 		= mv[3] || "";
      let modifications = mv[4] || "";
      let player 	= mv[5] || "";
      let success 	= mv[6] || -1;

      if (this.browser_active) {
        this.war_overlay.render(card, { winner : winner , die : die , modifications : modifications , player : player , success : success });
      }

      this.game.queue.splice(qe, 1);
      return 1;
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

  /************** END OF GAME LOOP **************/

  playHeadlinePostModern(stage, hash="", xor="", card="") {

     if (this.game.player === 0) {
      this.updateLog("Processing Headline Cards...");
      return;
    }

    // NO HEADLINE PEEKING
    if (this.game.state.man_in_earth_orbit == "") {
      if (stage == "headline1"){
        //Directly push these, so only a single copy is added to queue
        this.game.queue.push("resolve\theadline");
        this.game.queue.push("headline\theadline4");

        this.startClock(3-this.game.player); //Run opponent's clock
        this.startClockAndSetActivePlayer(); //And my own

        this.playerPickHeadlineCard();  //Players simultaneously pick their headlines
        return 0;

      } else if (stage == "headline4"){
        //We should have results back from simultaneous pick
        //stored in -- game_self.game.state.sp[player_id - 1] = player_card;

        this.game.state.headline_opponent_card = this.game.state.sp[2-this.game.player];
        stage = "headline6";
      }
    }else{ // man in earth orbit = HEADLINE PEEKING

      let first_picker = 2;
      let second_picker = 1;
      let playerside = "US";

      if (this.game.state.man_in_earth_orbit === "us") { first_picker = 1; second_picker = 2; playerside = "USSR"; }

      // first player sends card
      if (stage == "headline1") {
        this.updateLog(playerside + " selecting headline card first");

        this.startClockAndSetActivePlayer(first_picker);

        if (this.game.player == first_picker) {
          this.addMove("resolve\theadline");
          this.playerPickHeadlineCard();
        } else {
          this.updateStatusAndListCards(playerside + ' picks headline card first');
        }
        return 0;
      }

      // second player receives first card and sends card
      if (stage == "headline2") {
        this.updateLog(this.game.state.man_in_earth_orbit.toUpperCase() + " selecting headline card second");

        this.startClockAndSetActivePlayer(second_picker);

        if (this.game.player == second_picker) {
          this.game.state.headline_opponent_hash = hash;
          this.game.state.headline_opponent_xor = xor;
          this.game.state.headline_opponent_card = card;
          this.addMove("resolve\theadline");
          this.playerPickHeadlineCard();
        } else {
          this.updateStatusAndListCards(`${this.game.state.man_in_earth_orbit.toUpperCase()} picking headline card second`);
        }
        return 0;

      }

      // first player gets second player pick, then we move on....
      if (stage == "headline3") {
        if (this.game.player == first_picker) {
          this.game.state.headline_opponent_hash = hash;
          this.game.state.headline_opponent_xor = xor;
          this.game.state.headline_opponent_card = card;
        }
        stage = "headline6"; //Fast forward to processing events
      }
    }

    /*
     * Process Headline cards
     */


    //Sort cards by country
    let my_card = this.game.state.headline_card;
    let opponent_card = this.game.state.headline_opponent_card;

    let uscard, ussrcard;
    if (this.game.player == 1) {
      uscard = opponent_card;
      ussrcard = my_card;
    } else {
      ussrcard = opponent_card;
      uscard = my_card;
    }
   

    if (stage == "headline6") {

      if (this.browser_active) {
        this.headline_overlay.render(uscard, ussrcard);
      }

      this.updateLog("Moving into first headline card event");

      //Only calculate once
      this.game.state.player_to_go = 2; //default to us (in ties) and update below

      if (this.returnOpsOfCard(ussrcard) > this.returnOpsOfCard(uscard)) {
        this.game.state.player_to_go = 1;
      }

      let card_player = (this.game.state.player_to_go == 2)? "us": "ussr";

      //
      // check to see if defectors is in play
      //

     
      if (uscard === "defectors" || (ussrcard != "defectors" && this.game.state.defectors_pulled_in_headline == 1)) {
     
        this.game.turn = []; 

        this.updateLog(`USSR headlines ${this.cardToText(ussrcard)}`);
        this.updateLog(`US headlines ${this.cardToText("defectors")} and cancels USSR headline.`);

        //
        // only one player should trigger next round
        if (this.game.player == 1) {
          this.addMove("resolve\theadline");
          this.addMove("discard\tus\tdefectors");
          this.addMove("discard\tussr\t"+my_card);
          this.endTurn();
        }
        this.updateStatus(`>${this.cardToText("defectors")} cancels USSR headline. Moving into first turn...`);

      } else {

        let statusMsg = "";
        if (this.game.state.player_to_go == 1){
          statusMsg = `USSR headlines ${this.cardToText(ussrcard)}. US headlines ${this.cardToText(uscard)}`;
          this.updateLog(`USSR headlines ${this.cardToText(ussrcard)}.`);
          this.updateLog(`US headlines ${this.cardToText(uscard)}`);
        }else{
          statusMsg = `US headlines ${this.cardToText(uscard)}. USSR headlines ${this.cardToText(ussrcard)}`;
          this.updateLog(`US headlines ${this.cardToText(uscard)}.`);
          this.updateLog(`USSR headlines ${this.cardToText(ussrcard)}`);
        }

        if (this.game.state.player_to_go == this.game.player) {
          this.addMove("resolve\theadline");
          this.addMove("headline\theadline7\t"+this.game.state.player_to_go);
          this.addMove("event\t"+card_player+"\t"+my_card);
          this.removeCardFromHand(my_card);
          this.endTurn();
        }
        this.updateStatus(statusMsg);
      }
      return 0;
    }

    //
    // second player plays headline card
    //
    if (stage == "headline7") {

      //You don't have to recalculate if we store the first player_to_go in game.state
      this.game.state.player_to_go = 3 - this.game.state.player_to_go; //Other pleyer goes now

      let card_player = (this.game.state.player_to_go == 2)? "us" : "ussr";

      if (uscard === "defectors" || (ussrcard != "defectors" && this.game.state.defectors_pulled_in_headline == 1)) {
     
        this.game.turn = []; 

        this.updateLog(`USSR headlines ${this.cardToText(ussrcard)}, but it is cancelled by ${this.cardToText("defectors")}`);

        //
        // only one player should trigger next round
        if (this.game.player == 1) {
          this.addMove("resolve\theadline");
          this.addMove("discard\tussr\t"+my_card);
          this.endTurn();
        }

        this.updateStatus(`>${this.cardToText("defectors")} cancels USSR headline. Moving into first turn...`);

      } else {

      let statusMsg = "";
      if (this.game.state.player_to_go == 1){
        statusMsg = `Resolving USSR headline: ${this.cardToText(ussrcard)}`;
      } else {
        statusMsg = `Resolving US headline: ${this.cardToText(uscard)}`;
      }

      if (this.game.state.player_to_go == this.game.player) {
        this.addMove("resolve\theadline");
        this.addMove("clear\theadline");
        this.addMove("event\t"+card_player+"\t"+my_card);
        this.removeCardFromHand(my_card);
        this.endTurn();
      }
      this.updateStatus(statusMsg);
    }
      return 0;
    }

    return 1;

  }



  playerPickHeadlineCard() {

    let twilight_self = this;
    if (this.browser_active == 0) { return; }

    let player = this.roles[this.game.player];
    let x = "";

    //
    // HEADLINE PEEKING / man in earth orbit
    if (this.game.state.man_in_earth_orbit) {
      if (this.game.state.man_in_earth_orbit === player) {
        x = `${player.toUpperCase()} pick your headline card second (opponent selected: ${twilight_self.cardToText(twilight_self.game.state.headline_opponent_card)})`;
      } else {
        x = `${player.toUpperCase()} pick your headline card first`;
      }
    //
    // NORMAL HEADLINE ORDER
    } else {
      x = `${player.toUpperCase()} pick your headline card`;
    }
    if (this.game.player == 0){
      x = "Players picking headline cards";
    }
    this.updateStatusAndListCards(x,this.game.deck[0].hand);
    if (twilight_self.confirm_moves == 1) { twilight_self.cardbox.skip_card_prompt = 0; }
    twilight_self.hud.attachControlCallback(async function(card) {
      if (twilight_self.confirm_moves == 1) { twilight_self.cardbox.skip_card_prompt = 1; }
      await twilight_self.playerTurnHeadlineSelected(card, player);
    });


  }


async playerTurnHeadlineSelected(card, player) {

    let twilight_self = this;

    // cannot pick china card or UN intervention
    if (card == "china") {
      this.displayModal("Invalid Headline", "You cannot headline China");
      return;
    }
    if (card == "unintervention") {
      this.displayModal("Invalid Headline", "You cannot headline UN Intervention");
      return;
    }

    twilight_self.game.state.headline_card = card;
    twilight_self.game.state.headline_xor = twilight_self.app.crypto.hash(Math.random().toString());
    twilight_self.game.state.headline_hash = twilight_self.app.crypto.encodeXOR(twilight_self.app.crypto.stringToHex(twilight_self.game.state.headline_card), twilight_self.game.state.headline_xor);


    //
    // HEADLINE PEEKING / man in earth orbit
    //
    if (this.game.state.man_in_earth_orbit){
      if (this.game.state.man_in_earth_orbit === player) {
        //Second pick
        twilight_self.addMove("headline\theadline3\t"+twilight_self.game.state.headline_hash+"\t"+twilight_self.game.state.headline_xor+"\t"+twilight_self.game.state.headline_card);
      }else{
        //First pick
        twilight_self.addMove("headline\theadline2\t"+twilight_self.game.state.headline_hash+"\t"+twilight_self.game.state.headline_xor+"\t"+twilight_self.game.state.headline_card);
      }
    } else { // NORMAL HEADLINE ORDER

      let hash1 = twilight_self.app.crypto.hash(card);    // my card
      let hash2 = twilight_self.app.crypto.hash(Math.random().toString());  // my secret
      let hash3 = twilight_self.app.crypto.hash(hash2 + hash1);             // combined hash

      let privateKey = await twilight_self.app.wallet.getPrivateKey();

      let card_sig = twilight_self.app.crypto.signMessage(card, privateKey);
      let hash2_sig = twilight_self.app.crypto.signMessage(hash2, privateKey);
      let hash3_sig = twilight_self.app.crypto.signMessage(hash3, privateKey);

      twilight_self.game.spick_card = card;
      twilight_self.game.spick_hash = hash2;
      twilight_self.game.spick_done = 0;

      twilight_self.addMove("SIMULTANEOUS_PICK\t"+twilight_self.game.player+"\t"+hash3+"\t"+hash3_sig);

    }

    twilight_self.game.turn = [];
    $('.card').off();
    twilight_self.hideCard();
    twilight_self.endTurn();

    //
    // Update status no longer hides the cards !!!!!!
    //
    twilight_self.updateStatus("simultaneous blind pick... encrypting selected card");

    $(`.controls #${card}`).css("filter", "brightness(0.5)");

    return;

  }




  playMove() {

    console.log("in play move!");

    this.startClockAndSetActivePlayer(this.game.state.turn);

    //
    // this is never run in headline - we set the headline to 0 here automatically
    // to avoid DEFCON error that can happen with NORAD if this is not done.
    //
    this.game.state.headline = 0;

    //
    // how many turns left?
    let rounds_in_turn = (this.game.state.round > 3)? 7: 6;
    let moves_remaining = rounds_in_turn - this.game.state.turn_in_round;

    //
    let scoring_cards_available = 0;
    for (i = 0; i < this.game.deck[0].hand.length; i++) {
      if (this.game.deck[0].cards[this.game.deck[0].hand[i]]?.scoring == 1) {
          scoring_cards_available++;
      }
    }

    //
    // player 1 (USSR) moves
    //
    if (this.game.state.turn == 1) {

      if (this.game.state.turn_in_round == 0) {
          this.game.state.turn_in_round++;
console.log("#");
console.log("# turn in round to " + this.game.state.turn_in_round);
console.log("#");
          this.updateActionRound();
      }

      if (this.game.player == 1) {
        if (this.game.state.events.missile_envy == 1) {
          //
          // if must play scoring card -- moves remaining at 0 in last move
          //
          if (scoring_cards_available > moves_remaining) {
            this.playerTurn("scoringcard");
          } else {
            //
            // if cannot sacrifice missile envy to bear trap because red purged
            //
            if (this.game.state.events.beartrap == 1 && this.game.state.events.redscare_player1 >= 1) {
              this.playerTurn();
            } else {
              this.playerTurn("missileenvy");
            }
          }
        } else {
          this.playerTurn();
        }
      } else {
	      this.cancelBackButtonFunction();
        this.updateStatusAndListCards(`Waiting for USSR to move`);
      }
      return;
    }

    //
    // player 2 moves
    //
    if (this.game.state.turn == 2) {
      //
      // END OF HISTORY
      //
      if (this.game.state.events.greatsociety == 1) {
        this.game.state.events.greatsociety = 0;
        if (this.game.player == 2) {
          let scoring_cards = [];
          for (let i = 0; i < this.game.deck[0].hand.length; i++) {
            if (this.game.deck[0].cards[this.game.deck[0].hand[i]]?.scoring == 1) {
              scoring_cards.push(this.game.deck[0].hand[i]);
            }
          }

          let user_message = `Great Society is active. US may earn a VP for either skipping its turn or playing a scoring card:`;
          let html = "<ul>";
          if (scoring_cards.length > 0) {
            html += `<li class='card' id='scoring'>play scoring card</li>
                   <li class='card' id='scoring_w_card'>play scoring card and draw card</li>`;
          }
          html += `<li class='card' id='skip'>skip turn</li>
                <li class='card' id='skip_w_card'>skip turn and draw card</li>`;
          if (this.game.deck[0].hand.length > 0) {
            html += `<li class='card' id='select'>select card</li>`;
          }
          html += "</ul>";

          let twilight_self = this;

          this.updateStatusWithOptions(user_message, html, function (action2) {
            if (action2 === "select") {
              twilight_self.updateStatus();
              twilight_self.playerTurn();
              return;
            }
            if (action2 === "skip" || action2 === "skip_w_card") {
              twilight_self.addMove("resolve\tplay");
              if (action2 === "skip_w_card") {
                twilight_self.addMove("SAFEDEAL\t1\t2\t1");
                twilight_self.addMove("NOTIFY\tUS is drawing a bonus card");
              }
              twilight_self.addMove("vp\tus\t1\t0");
              twilight_self.addMove("NOTIFY\tUS skips a turn for 1 VP as a Great Society");
              twilight_self.endTurn();
            }
            if (action2 === "scoring" || action2 === "scoring_w_card") {
              twilight_self.addMove("resolve\tplay");
              twilight_self.addMove("vp\tus\t1\t0");
              twilight_self.addMove("NOTIFY\tUS plays a scoring card for 1 VP as a Great Society");
              if (action2 === "scoring_w_card") {
                twilight_self.addMove("SAFEDEAL\t1\t2\t1");
                twilight_self.addMove("NOTIFY\tUS is drawing a bonus card");
              }
              twilight_self.playerTurn("greatsociety");
            }
          });

          return 0;
        }
      }


      if (this.game.player == 2) {

        if (this.game.state.events.missile_envy == 2) {
          //
          // moves remaining will be 0 last turn
          //
          if (scoring_cards_available > moves_remaining) {
            this.playerTurn("scoringcard");
          } else {
            //
            // if cannot sacrifice missile envy to quagmire because red scare
            //
            if (this.game.state.events.quagmire == 1 && this.game.state.events.redscare_player2 >= 1) {
              this.playerTurn();
            } else {
              this.playerTurn("missileenvy");
            }
          }
        } else {
          this.playerTurn();
        }
      } else {
	      this.cancelBackButtonFunction();
        this.updateStatusAndListCards(`Waiting for US to move`);
      }
      return;
    }

  }



  playerTurn(selected_card=null) {


    if (this.browser_active == 0) { return; }

    try {
      $(".easterneurope").removeClass("easterneurope");
    } catch (err) {
      // sanity for CHE
    }


    let twilight_self = this;

    //
    // if the clock is going, ask to confirm moves
    //
    //twilight_self.confirm_this_move = 1;

    //
    // END OF HISTORY
    //
    let greatsociety = 0;
    if (selected_card == "greatsociety") {
      greatsociety = 1;
      selected_card = "scoringcard";
    }

    //
    // remove back button from forced gameplay
    //
    if (selected_card != null) {
      this.game.state.back_button_cancelled = 1;
    }

    //
    // cancel this first round anyway
    //
    if (this.hud.back_button_clicked == true) {
      this.cancelBackButtonFunction();
    }

    //
    // check who has China Card
    //
    //this.displayChinaCard();

    //
    // show active events
    //
    this.updateEventTiles();

    //
    // if player only has the China Card, they are allowed to skip
    // global var [is_player_skipping_playing_china_card] initialized to 0
    //
    if (selected_card == null) {
      if (this.game.deck[0].hand.length == 1) {
         if (this.game.deck[0].hand[0] == "china") {

          if (is_player_skipping_playing_china_card){
            //Keep passing automatically until end of round
            twilight_self.addMove("resolve\tplay");
            twilight_self.endTurn();
            return;
          }else{
            //Give player option to keep China card until next round

            let user_message = `You only have the ${this.cardToText("china")} card remaining. Do you wish to play it this turn?`;
            let html = '<ul><li class="option" id="play">play card</li><li class="option" id="skipturn">skip turn</li></ul>';
            this.updateStatusWithOptions(user_message, html, function(action) {
              if (action === "play") {
                twilight_self.playerTurn("china"); //reload function, ignoring this logic tree
              }
              if (action === "skipturn") {
                is_player_skipping_playing_china_card = 1;
                twilight_self.addMove("resolve\tplay");
                if (twilight_self.game.player == 1) {
                  twilight_self.addMove("NOTIFY\tUSSR chooses not to play the China Card");
                } else {
                  twilight_self.addMove("NOTIFY\tUS chooses not to play the China Card");
                }
                twilight_self.endTurn();
              }
            });

            return;
          }

         }
       }
    }


    original_selected_card = selected_card;

    //
    // reset region bonuses (if applicable)
    //
    this.game.state.events.china_card_in_play = 0;
    this.game.state.events.vietnam_revolts_eligible = 1;
    this.game.state.events.china_card_eligible = 1;
    this.game.state.events.region_bonus = "";
    this.game.state.ironlady_before_ops = 0;

    let player = "ussr";
    let opponent = "us";
    let playable_cards = [];

    if (this.game.player == 2) {
      player = "us";
      opponent = "ussr";
    }

    is_this_missile_envy_noneventable = this.game.state.events.missileenvy;

    if ( (player === "ussr" && this.game.state.events.missile_envy == 1) || (player === "us" && this.game.state.events.missile_envy == 2)) {
      is_this_missile_envy_noneventable = 1;
    }

    let user_message = "";

    /* Open play, choose a card from card list*/
    if (selected_card == null) {
      user_message = player.toUpperCase() + " pick a card: ";
      for (i = 0; i < this.game.deck[0].hand.length; i++) {

        // when UN Intervention is eventing, we can only select opponent cards
        if (this.game.state.events.unintervention == 1) {
          if (this.game.deck[0].cards[this.game.deck[0].hand[i]].player === opponent) {
            playable_cards.push(this.game.deck[0].hand[i]);
          }
        } else {
          playable_cards.push(this.game.deck[0].hand[i]);
        }
      };
    } else {

      if (selected_card === "scoringcard") {
        user_message = 'Scoring card must be played: <ul>';
        for (i = 0; i < this.game.deck[0].hand.length; i++) {
          if (this.game.deck[0].cards[this.game.deck[0].hand[i]]?.scoring == 1) {
            selected_card = this.game.deck[0].hand[i];
            playable_cards.push(this.game.deck[0].hand[i]);
          }
        }
      } else {
        playable_cards.push(selected_card);
      }
    }


    //
    // Add dummy card for canceling Cuban Missile Crisis
    if (this.game.player == this.game.state.events.cubanmissilecrisis && this.game.player > 0) {
      if (this.canCancelCMC()) {
        playable_cards.push("cancel_cmc");
      }
    }

    //
    // Bear Trap and Quagmire
    //
    // headline check ensures that Quagmire does not trigger if headlined and the US triggers a card pull
    //
    if (this.game.state.headline == 0 && ((this.game.player == 1 && this.game.state.events.beartrap == 1) || (this.game.player == 2 && this.game.state.events.quagmire == 1)) ) {

      //
      // do we have cards to select
      //
      let cards_available = 0;
      let scoring_cards_available = 0;
      playable_cards = [];

      //
      // how many turns left?
      //
      let rounds_in_turn = 6;
      if (this.game.state.round > 3) { rounds_in_turn = 7; }
      let moves_remaining = rounds_in_turn - this.game.state.turn_in_round;

      user_message = `Select a card for ${(this.game.player == 1)? this.cardToText("beartrap"): this.cardToText("quagmire")}: `;

      for (i = 0; i < this.game.deck[0].hand.length; i++) {
        if (this.modifyOps(this.game.deck[0].cards[this.game.deck[0].hand[i]].ops, this.game.deck[0].hand[i], player, 0) >= 2 && this.game.deck[0].hand[i] != "china") {
          playable_cards.push(this.game.deck[0].hand[i]);
          cards_available++;
        }

        if (this.game.deck[0].cards[this.game.deck[0].hand[i]]?.scoring == 1) {
          scoring_cards_available++;
        }
      }

      //
      // handle missile envy if needed
      let playable_cards_handled = 1;
      if (this.game.state.events.missile_envy == this.game.player) {
        playable_cards_handled = 0;
        if (this.modifyOps(2, "missileenvy", player, 0) >= 2) {
          // reset here, since will not trigger elsewhere
          playable_cards_handled = 1;
          this.game.state.events.missile_envy = 0;
          this.game.state.events.missileenvy = 0;
          playable_cards = [];
          playable_cards.push("missileenvy");
        }
      }

      if (scoring_cards_available >= moves_remaining) {
        playable_cards_handled = 0;
      } else {
        if (cards_available == 0) {
          playable_cards_handled = 0;
        }
      }

      if (playable_cards_handled == 0) {

        //
        // do we have any cards to play?
        //
        if (cards_available > 0 && scoring_cards_available <= moves_remaining) {
          playable_cards = [];
          for (i = 0; i < this.game.deck[0].hand.length; i++) {
            if (this.game.deck[0].cards[this.game.deck[0].hand[i]] != undefined) {
              if (this.modifyOps(this.game.deck[0].cards[this.game.deck[0].hand[i]].ops, this.game.deck[0].hand[i], player, 0) >= 2 && this.game.deck[0].hand[i] != "china") {
                playable_cards.push(this.game.deck[0].hand[i]);
              }
            }
          }
        } else {
          if (scoring_cards_available > 0) {
            if (this.game.player == 1) {
              user_message = "Bear Trap restricts you to Scoring Cards: ";
            } else {
              user_message = "Quagmire restricts you to Scoring Cards: ";
            }
            playable_cards = [];
            for (i = 0; i < this.game.deck[0].hand.length; i++) {
              if (this.game.deck[0].cards[this.game.deck[0].hand[i]]?.scoring == 1) {
                playable_cards.push(this.game.deck[0].hand[i]);
              }
            }
          } else {
            if (this.game.state.events.beartrap == 1) {
              user_message = "No cards playable due to Bear Trap: ";
            } else {
              user_message = "No cards playable due to Quagmire: ";
            }
            playable_cards = [];
            playable_cards.push("skipturn");
          }
        }
      }
    }

    //
    // display the cards -- probably a problem here in defaulting back to hand
    //
    if (playable_cards.length > 0) {
      this.updateStatusAndListCards(user_message, playable_cards);
    } else {
      this.updateStatusAndListCards(user_message, this.game.deck[0].hand);
    }


    if (this.game.state.events.unintervention != 1 && selected_card != "grainsales") {

      //
      // END OF HISTORY
      //
      // note - do not remove the clearing of the moves array if removing greatsociety
      //
      if (greatsociety != 1) {
        this.moves = [];
      }

    }

    twilight_self.playerFinishedPlacingInfluence();


    //
    // cannot play if no cards remain
    //
    if (selected_card == null && this.game.deck[0].hand.length == 0) {
      this.addMove("resolve\tplay");
      this.addMove(`NOTIFY\t${player.toUpperCase()} skipping turn... no cards left to play`);
      this.endTurn();
      this.updateStatus("Skipping turn... no cards left to play");
      return;
    }

    twilight_self.hud.attachControlCallback(function(card) {
      twilight_self.playerTurnCardSelected(card, player);
    });

  }



  async playerTurnCardSelected(card, player) {

    let ac = this.returnAllCards(true);
    let twilight_self = this;
    let opponent = "us";
    if (this.game.player == 2) { opponent = "ussr"; }

      //
      // Skip Turn
      //
      if (card === "skipturn") {
        twilight_self.hideCard();
        twilight_self.addMove("resolve\tplay");
        twilight_self.addMove("NOTIFY\t"+player.toUpperCase()+" has no cards playable.");
        twilight_self.endTurn();
        return 0;
      }


      //
      // warn if user is leaving a scoring card in hand
      //
      let scoring_cards_available = 0;
      let rounds_in_turn = 6;
      if (twilight_self.game.state.round > 3) { rounds_in_turn = 7; }
      let moves_remaining = rounds_in_turn - twilight_self.game.state.turn_in_round;

      for (i = 0; i < twilight_self.game.deck[0].hand.length; i++) {
        if (ac[twilight_self.game.deck[0].hand[i]]?.scoring == 1) { 
          scoring_cards_available++; 
        }
      }


      if (scoring_cards_available > 0 && scoring_cards_available > moves_remaining && ac[card]?.scoring == 0) {
        let c = await sconfirm("Holding a scoring card at the end of the turn will lose you the game. Still play this card?");
        if (c) {} else { return; }
      }


      twilight_self.hideCard(); //close cardbox in case it is open

      //
      // WWBY
      //
      if (twilight_self.game.state.events.wwby == 1 && twilight_self.game.state.headline == 0) {
        if (player == "us") {
          if (card != "unintervention") {
            if (twilight_self.playerHoldsCard("unintervention")){
              let c = await sconfirm(`If you don't play ${twilight_self.cardToText("unintervention")}, USSR will gain 3 VP. Still play this card?`);
              if (c) {} else { return; }
            }
            twilight_self.game.state.events.wwby_triggers = 1; //Remember penalty to apply with next endturn
          }
          twilight_self.game.state.events.wwby = 0; //Turn off WWBY
        }
      }

      //
      // Quagmire / Bear Trap
      //
      if (twilight_self.game.state.headline == 0 && ((twilight_self.game.state.events.quagmire == 1 && twilight_self.game.player == 2) || (twilight_self.game.state.events.beartrap == 1 && twilight_self.game.player == 1)) ) {
        //
        // scoring cards score, not get discarded
        if (ac[card]?.scoring == 0) {
          twilight_self.removeCardFromHand(card);
          twilight_self.addMove("resolve\tplay");
          twilight_self.addMove("quagmire\t"+player+"\t"+card);
          twilight_self.addMove("discard\t"+player+"\t"+card);
          twilight_self.endTurn();
          return 0;
        }
      }

      //
      // Cuban Missile Crisis
      //
      if (card === "cancel_cmc") {
        twilight_self.cancelCubanMissileCrisis();
        return 0;
      }


      //Process the card
      twilight_self.addMove("resolve\tplay");
      twilight_self.addMove("discard\t"+player+"\t"+card);

      //Go straight to ops when pairing with UN Intervention
      if (twilight_self.game.state.events.unintervention === 1){
        // resolve added
        //twilight_self.addMove("NOTIFY\t"+player.toUpperCase()+" plays "+card+" with UN Intervention");
        twilight_self.addMove("ops\t"+player+"\t"+card+"\t"+ac[card].ops);
        twilight_self.removeCardFromHand(card);
        twilight_self.endTurn();
        return;

      }

      //
      // The China Card
      //
      if (card == "china") {
        twilight_self.addMove("unlimit\tchina");
        twilight_self.game.state.events.china_card_in_play = 1;
      }


      if (ac[card]?.scoring == 1) {
        let status_header = `Playing ${ac[card].name}:`;
        let html = `<ul><li class="option" id="event">score region</li></ul>`;
        twilight_self.updateStatusWithOptions(status_header, html);
      } else {

        let ops = twilight_self.modifyOps(ac[card].ops, card, player, 0);

        let announcement = "";

        announcement += `<ul>`;

        //
        // cannot play China card or Missile Envy (forced) for event
        // cannot event UN Intervention w/o the opponent card in hand
        //
        let can_play_event = 1;
        if (card == "unintervention") {
          let opponent_event_in_hand = 0;
          for (let b = 0; b < twilight_self.game.deck[0].hand.length; b++) {
            let tmpc = twilight_self.game.deck[0].hand[b];
            if (tmpc != "china") {
              if (twilight_self.game.player == 1) {
                if (ac[tmpc].player === "us") { opponent_event_in_hand = 1; }
              } else {
                if (ac[tmpc].player === "ussr") { opponent_event_in_hand = 1; }
              }
            }
          }
          if (opponent_event_in_hand == 0) { can_play_event = 0; }
        }
        if (card == "china") { can_play_event = 0; }
        if (card == "missileenvy" && is_this_missile_envy_noneventable == 1) { can_play_event = 0; }

        //
        // cannot play event of opponent card (usability fix)
        //
        if (ac[card].player == opponent) { can_play_event = 0; }


	//
	// cancel some events that cannot be played
	//
        if (this.game.state.events.cancelled[card] == 1) {
	  can_play_event = 0;
	  if (card == "defectors") { can_play_event = 0; }
        }


        if (can_play_event == 1) { announcement += '<li class="option" id="event">play event</li>'; }

        announcement += '<li class="option" id="ops">play for ops</li>';

        announcement += twilight_self.isSpaceRaceAvailable(ops);    

        //
        // cancel cuban missile crisis
        //
        if (twilight_self.game.state.events.cubanmissilecrisis && twilight_self.game.state.events.cubanmissilecrisis === twilight_self.game.player){
          if (twilight_self.canCancelCMC()) {
            announcement += '<li class="option" id="cancel_cmc">cancel cuban missile crisis</li>';
          }
        }
        let header_msg = `${player.toUpperCase()} playing <span>${ac[card].name}</span>`; 

        if (twilight_self.game.state.back_button_cancelled != 1) {
	  twilight_self.bindBackButtonFunction(() => { this.playerTurn(); });
	}
        twilight_self.updateStatusWithOptions(header_msg, announcement);
      }


      twilight_self.hud.attachControlCallback(async function(action) {

        $('.card').off();

        //
        // missile envy (reset if held over headline)
        //
        if ((twilight_self.game.player == 2 && twilight_self.game.state.events.missile_envy == 2) || (twilight_self.game.player == 1 && twilight_self.game.state.events.missile_envy == 1)) {
          if (card == "missileenvy") {
            twilight_self.game.state.events.missileenvy = 0;
            twilight_self.game.state.events.missile_envy = 0;
            is_this_missile_envy_noneventable = 0;
          }
        }

        //
        // Cuban Missile Crisis
        //
        if (action == "cancel_cmc") {
          twilight_self.moves = []; // clear the resolve play so we go back to the same player's turn
          // submitting card + player returns to execute that card after CMC rmeoved
	  twilight_self.cancelCubanMissileCrisis(player, card);
          return;
        }

        if (action == "event") {

	  let ac = twilight_self.returnAllCards(true);
          if (ac[card].player != "both" && ac[card].player != player) {

            let fr_header =  "This is your opponent's event. Are you sure you wish to play it for the event instead of the OPS?";
            let fr_msg = '<ul><li class="option" id="playevent">play event</li></ul>';

            twilight_self.bindBackButtonFunction(()=>{ twilight_self.playerTurn(original_selected_card); });
            twilight_self.updateStatusWithOptions(fr_header, fr_msg, function(action) {
              $('.card').off();
              if (action == "playevent") {
                twilight_self.playerTriggerEvent(player, card);
                return;
              }
            });
            return;
          }

          //
          // our event or both
          //
          if (twilight_self.confirm_moves == 1) {

            let fr_header = `Confirm you want to play this event: `;
            let fr_msg = `
              <ul><li class="option" id="playevent">play event</li>
              <li class="option" id="dontshowme">don't confirm (expert mode)...</li>
              <ul>`;

            twilight_self.bindBackButtonFunction(()=>{ twilight_self.playerTurn(original_selected_card)} );
            twilight_self.updateStatusWithOptions(fr_header, fr_msg, function(action) {
              $('.card').off();
  	      if (action === "dontshowme") {
                twilight_self.confirm_moves = 0;
                twilight_self.saveGamePreference('confirm_moves', 0);
                try { $(".game-confirm").text("Newbie Mode"); } catch (err) {}
	        action = "playevent";
	      }

              if (action == "playevent") {
                twilight_self.playerTriggerEvent(player, card);
                return;
              }
            });

            return;
          }

          // play normally when not confirmed
          twilight_self.playerTriggerEvent(player, card);
          return;

        }

        if (action == "ops") {

          //
          // our event or both
          if (twilight_self.confirm_moves == 1 && (card != "missileenvy" || is_this_missile_envy_noneventable == 0)) {

            let fr_header = "Confirm you want to play for ops:";
            let fr_msg = `<ul>
              <li class="option" id="playevent">play for ops</li>
              <li class="option" id="dontshowme">don't confirm (expert mode)...</li>
              </ul>
              `;

             twilight_self.bindBackButtonFunction(()=>{ twilight_self.playerTurn(original_selected_card)} );
             twilight_self.updateStatusWithOptions(fr_header, fr_msg, function(action) {
              $('.card').off();

  	      if (action === "dontshowme") {
                twilight_self.confirm_moves = 0;
                twilight_self.saveGamePreference('confirm_moves', 0);
                try { $(".game-confirm").text("Newbie Mode"); } catch (err) {}
	        action = "playevent";
	      }
              if (action == "playevent") {
                twilight_self.playerTriggerOps(player, card);
                return;
              }
             });
            return;
          }

          twilight_self.playerTriggerOps(player, card);
          return;
        }

        if (action == "space") {

	  let ac = twilight_self.returnAllCards(true);

          if (twilight_self.confirm_moves == 1) {
            let fr_header = `Confirm you want to space ${ac[card].name}`;
            let fr_msg =  `<ul><li class="option" id="spaceit">send into orbit</li>
              <li class="option" id="dontshowme">don't confirm (expert mode)...</li>
              </ul>`;

            twilight_self.bindBackButtonFunction(()=>{twilight_self.playerTurn(original_selected_card)});
            twilight_self.updateStatusWithOptions(fr_header,fr_msg, function(action) {
              $('.card').off();

	      if (action === "dontshowme") {
                twilight_self.confirm_moves = 0;
                twilight_self.saveGamePreference('confirm_moves', 0);
                try { $(".game-confirm").text("Newbie Mode"); } catch (err) {}
		action = "spaceit";
	      }

              if (action == "spaceit") {
                twilight_self.addMove("space\t"+player+"\t"+card);
                twilight_self.removeCardFromHand(card);
                twilight_self.endTurn();
                return;
              }
            });

            return;
          }

          twilight_self.addMove("space\t"+player+"\t"+card);
          twilight_self.removeCardFromHand(card);
          twilight_self.endTurn();
          return;
        }

        twilight_self.updateStatus("");

      });
  }


  playOps(player, ops, card) {

    let original_ops = ops;
    let twilight_self = this;

    //
    // modify ops
    ops = this.modifyOps(ops, card, player);

    let me = this.roles[this.game.player];

    // reset events / DOM
    twilight_self.playerFinishedPlacingInfluence();

    this.startClockAndSetActivePlayer(this.roles.indexOf(player));

    if (player === me) {

      let bind_back_button_state = true;

      if (card === "missileenvy") { bind_back_button_state = false; }
      if (twilight_self.game.state.event_before_ops == 1) { bind_back_button_state = false; }
      if (twilight_self.game.state.headline == 1) { bind_back_button_state = false; }
      if (twilight_self.game.state.back_button_cancelled == 1 || bind_back_button_state == false) {
	twilight_self.cancelBackButtonFunction();
	bind_back_button_state = false;
      }

      let html = '<ul>';
      if (this.game.state.limit_placement == 0) { html += '<li class="option" id="place">place influence</li>'; }
      if (this.game.state.limit_coups == 0) { html += '<li class="option" id="coup">launch coup</li>'; }
      if (this.game.state.limit_realignments == 0) { html += '<li class="option" id="realign">realign country</li>'; }
      if (this.game.state.events.unintervention == 1) {html += this.isSpaceRaceAvailable(ops); }
      if ((this.game.player == this.game.state.events.cubanmissilecrisis)  && this.game.state.events.cubanmissilecrisis > 0 ) {
        if (this.canCancelCMC()) {
          html += '<li class="option" id="cancel_cmc">cancel cuban missile crisis</li>';
        }
      }
      html += '</ul>';

      if (bind_back_button_state) {
        twilight_self.bindBackButtonFunction(() => {
          twilight_self.game.state.events.vietnam_revolts_eligible = 1;
          twilight_self.game.state.events.china_card_eligible = 1;
          twilight_self.addMove("revert");
          twilight_self.endTurn();
           return;
        });
      }
      twilight_self.updateStatusWithOptions(`${player.toUpperCase()} plays ${ops} OPS:`, html);

      // TODO:
      twilight_self.hud.attachControlCallback(async function(action2) {

        //
        // prevent ops hang
        //
        twilight_self.addMove("resolve\tops");

        if (action2 == "cancel_cmc") {

	  // don't resolve OPs
          twilight_self.moves = [];

          let are_we_playing_ops = 0;
          if (twilight_self.game.queue[twilight_self.game.queue.length-1].split("\t")[0] === "ops") {
            are_we_playing_ops = 1;
          }

          if (are_we_playing_ops == 0) {
              twilight_self.addMove(`ops\t${me}\t${card}\t${original_ops}`);
          }

          twilight_self.cancelCubanMissileCrisis();

          return;
        }

        if (action2 == "space"){

	  let ac = twilight_self.returnAllCards(true);

          if (twilight_self.confirm_moves == 1) {
              let fr_header = `Confirm you want to space ${ac[card].name}`;
              let fr_msg =  `<ul><li class="option" id="spaceit">send into orbit</li>
                <li class="option" id="dontshowme">don't confirm (expert mode)...</li>
              </ul>`;

              twilight_self.bindBackButtonFunction(()=>{twilight_self.playerOps(player, ops, card)});
              twilight_self.updateStatusWithOptions(fr_header,fr_msg, function(action) {
                $('.card').off();

  	        if (action === "dontshowme") {
                  twilight_self.confirm_moves = 0;
                  twilight_self.saveGamePreference('confirm_moves', 0);
                  try { $(".game-confirm").text("Newbie Mode"); } catch (err) {}
	  	  action = "spaceit";
	        }

                if (action == "spaceit") {
                  twilight_self.addMove("space\t"+player+"\t"+card);
                  twilight_self.removeCardFromHand(card);
                  twilight_self.endTurn();
                  return;
                }
              });

              return;
            }

            twilight_self.addMove("space\t"+player+"\t"+card);
            twilight_self.removeCardFromHand(card);
            twilight_self.endTurn();
            return;

        }

        if (action2 == "place") {

          let j = ops;
          let html = "Place " + j + " influence";
          twilight_self.updateStatus(html, true);
          twilight_self.prePlayerPlaceInfluence(player);
          if (j == 1) {
            twilight_self.uneventOpponentControlledCountries(player, card);
          }

          twilight_self.playerPlaceInfluence(player, (country, player) => {

            j--;

            //
            // breaking control must be costly
            //
            if (twilight_self.game.break_control == 1) {
              j--;
              if (j < 0) { twilight_self.endRegionBonus(); j = 0; }
            }
            twilight_self.game.break_control = 0;

            if (j < 2) {
              twilight_self.uneventOpponentControlledCountries(player, card);
            }

            let html = "Place " + j + " influence";
            twilight_self.updateStatus(html, true);

            if (j <= 0) {
              if (twilight_self.isRegionBonus(card) == 1) {
                j++;
                twilight_self.limitToRegionBonus();
                twilight_self.endRegionBonus();
              } else {
                twilight_self.playerFinishedPlacingInfluence();
                twilight_self.endTurn();
                return;
              }
            }


            twilight_self.bindBackButtonFunction(() => {
              //
              // If the placement array is full, then
              // undo all of the influence placed this turn
              //
              if (twilight_self.undoMove(action2, ops - j)) {

                //
            	// reset china and vietnam revolts eligibility
            	//
            	twilight_self.game.state.events.vietnam_revolts_eligible = 1;
            	twilight_self.game.state.events.china_card_eligible = 1;

                twilight_self.playOps(player, ops, card);
              }
            });

          });

        }

        if (action2 == "coup") {

          //
          // sanity Cuban Missile Crisis check
          //
          if (twilight_self.game.state.events.cubanmissilecrisis == 2 && player =="us" ||
              twilight_self.game.state.events.cubanmissilecrisis == 1 && player =="ussr"
          ) {
            let c = await sconfirm("Are you sure you wish to coup during the Cuban Missile Crisis?");
            if (c) {
            } else {
              twilight_self.playOps(player, ops, card);
              return;
            }
          }

          let html = "Pick a country to coup";
          twilight_self.updateStatus(html, true);
          twilight_self.playerCoupCountry(player, ops, card);

        }


        if (action2 == "realign") {

          twilight_self.game.state.back_button_cancelled = 1;
	  twilight_self.cancelBackButtonFunction();

          let alignment_rolls = ops;
          let header_msg = `Pick a target to realign (${alignment_rolls} rolls), or:`;
          let html = `<ul><li class="option" id="cancelrealign">end turn without rolling</li></ul>`;
          twilight_self.updateStatusWithOptions(header_msg,html, function(action2) {
            if (action2 == "cancelrealign") {
              twilight_self.addMove("NOTIFY\t"+player.toUpperCase()+" opts to end realignments");
              twilight_self.endTurn();
              return;
            }
          });

          $(".country").off();
          $(".country").on('click', async function() {

            let c = $(this).attr('id');

            let coupHeader = `Cannot Realign ${twilight_self.countries[c].name}`;
            let failureReason = ""; //Also tells us if it is a valid target

            //
            // Region Restrictions
            //
            if (twilight_self.game.state.limit_region.indexOf(twilight_self.countries[c].region) > -1) {
              failureReason = "Invalid Region for Realignment";
            }

            //
            // DEFCON restrictions
            //
            if (twilight_self.game.state.limit_ignoredefcon == 0 && twilight_self.game.state.events.inftreaty == 0) {
              if (twilight_self.countries[c].region == "europe" && twilight_self.game.state.defcon < 5) {
                failureReason = "DEFCON prevents realignments in Europe";
              }
              if (twilight_self.countries[c].region == "asia" && twilight_self.game.state.defcon < 4) {
                failureReason = "DEFCON prevents realignments in Asia";
              }
              if (twilight_self.countries[c].region == "seasia" && twilight_self.game.state.defcon < 4) {
                failureReason = "DEFCON prevents realignments in Asia";
              }
              if (twilight_self.countries[c].region == "mideast" && twilight_self.game.state.defcon < 3) {
		// SAITO COMMUNITY CARD - Carter Doctrine
		if (twilight_self.game.state.events.carterdoctrine != 1) {
                  failureReason = "DEFCON prevents realignments in the Middle-East";
                }
              }
            }

            if (twilight_self.game.state.events.usjapan == 1 && c == "japan" && player == "ussr") {
              failureReason = "US / Japan Alliance prevents realignments in Japan";
            }

            if (twilight_self.countries[c].region == "europe" && twilight_self.game.state.events.nato == 1 && player == "ussr") {
              if (twilight_self.isControlled("us", c) == 1) {
                if ( (c == "westgermany" && twilight_self.game.state.events.nato_westgermany == 0) || (c == "france" && twilight_self.game.state.events.nato_france == 0) ) {
                  // if West Germany or France have been removed from Nato (by Degaulle or WillyBrandt) then realignments permitted...
                } else {
                  failureReason = "NATO prevents realignments of US-controlled countries in Europe";
                }
              }
            }

            if ((player == "us" && twilight_self.countries[c].ussr <= 0) || (player == "ussr" && twilight_self.countries[c].us <= 0)) {
              failureReason = "No enemy influence";
            }

            if (failureReason.length > 0) {

              twilight_self.displayModal(coupHeader, failureReason);

            } else {

              //
              // vietnam revolts and china card bonuses
              //
              if (twilight_self.countries[c].region !== "seasia") { twilight_self.game.state.events.vietnam_revolts_eligible = 0; }
              if (twilight_self.countries[c].region !== "seasia" && twilight_self.countries[c].region !== "asia") { twilight_self.game.state.events.china_card_eligible = 0; }

              // play move / add move to queue
              var result = twilight_self.playRealign(player, c);
              twilight_self.addMove("realign\t"+player+"\t"+c);


              alignment_rolls--;

	      //
              // update directions
	      //
              twilight_self.updateStatusWithOptions(`Pick a target to realign (${alignment_rolls} rolls), or:`,`<ul><li class="option" id="cancelrealign">end turn</li></ul>`, function(action2) {
                if (action2 == "cancelrealign") { //Not a cancel, keeps realignment rolls so far...
                  twilight_self.reverseMoves("realign");
                  return;
                }
              });

              if (alignment_rolls <= 0) {
                if (twilight_self.isRegionBonus(card) == 1) {
                  twilight_self.limitToRegionBonus(); //Turn off click events outside of regional bonus
                  twilight_self.endRegionBonus(); //Toggle flags about aplicability of regional bonuses
                  alignment_rolls++;
                } else {

                  twilight_self.reverseMoves("realign");
                  return;
                }
              }
            }
          });
        }


      });

    }else{
      this.updateStatusAndListCards(`${player.toUpperCase()} playing ${this.game.state.event_name} for ${ops} OPS`);
    }

    return;

  }

  reverseMoves(action){
    let new_moves = [];
    for (let z = this.moves.length-1; z >= 0; z--) {
      let tmpar = this.moves[z].split("\t");
      if (tmpar[0] === action) {
        new_moves.push(this.moves[z]);
      } else {
        new_moves.unshift(this.moves[z])
      }
    }
    this.moves = new_moves;
    this.endTurn();
  }

  async confirmEvent() {
    let c = await sconfirm("Confirm your desire to play this event");
    return c;
  }

  cancelBackButtonFunction() {
    this.hud.back_button = false;
    this.hud.back_button_callback = null;
  }
  unbindBackButtonFunction() {
    this.cancelBackButtonFunction();
  }
  bindBackButtonFunction(mycallback) {
    this.hud.back_button = true;
    this.hud.back_button_callback = mycallback;
  }


  canCancelCMC(){
    if (this.game.player == 1 && this.countries['cuba'].ussr >= 2) { return 1; }
    if (this.game.player == 2 && this.countries['turkey'].us >= 2) { return  1; }
    if (this.game.player == 2 && this.countries['westgermany'].us >= 2) { return  1; }
    return 0;
  }

  //
  // if player + card selected, we'll continue with play of that card
  //
  cancelCubanMissileCrisis(player="", card=""){

    let twilight_self = this;
    if (twilight_self.game.player == 0) { return; } //just in case

    if (twilight_self.game.player == 1) {
      if (card != "" && player != "") {
	twilight_self.addMove("player_turn_card_selected\t"+player+"\t"+card);
      }
      twilight_self.addMove("setvar\tgame\tstate\tevents\tcubanmissilecrisis\t0");
      twilight_self.addMove("setvar\tgame\tstate\tevents\tcubanmissilecrisis_cancelled\t1");
      twilight_self.addMove("setvar\tgame\tstate\tevents\tcubanmissilecrisis_removal_country\tcuba");
      twilight_self.removeInfluence("cuba", 2, "ussr");
      twilight_self.addMove("remove\tussr\tussr\tcuba\t2");
      twilight_self.addMove("unlimit\tcmc\tcuba");
      twilight_self.addMove("NOTIFY\tUSSR has cancelled the Cuban Missile Crisis");
      twilight_self.game.state.events.cubanmissilecrisis = 0;
      twilight_self.game.state.events.cubanmissilecrisis_removal_country = "cuba";
      twilight_self.game.state.events.cubanmissilecrisis_cancelled = 1;
      twilight_self.endTurn();
    } else {
      let html = "<ul>";
      if (twilight_self.countries['turkey'].us >= 2) {
        html += '<li class="option" id="turkey">Turkey</li>';
      }
      if (twilight_self.countries['westgermany'].us >= 2) {
        html += '<li class="option" id="westgermany">West Germany</li>';
      }
      html += '</ul>';
      twilight_self.updateStatusWithOptions('Select country from which to remove influence:',html, function(action2) {

        if (card != "" && player != "") {
	  twilight_self.addMove("player_turn_card_selected\t"+player+"\t"+card);
        }
        twilight_self.addMove("setvar\tgame\tstate\tevents\tcubanmissilecrisis\t0");
        twilight_self.addMove("setvar\tgame\tstate\tevents\tcubanmissilecrisis_cancelled\t1");
        twilight_self.addMove("setvar\tgame\tstate\tevents\tcubanmissilecrisis_removal_country\t"+action2);
        twilight_self.removeInfluence(action2, 2, "us");
        twilight_self.addMove(`remove\tus\tus\t${action2}\t2`);
        twilight_self.addMove("unlimit\tcmc\t"+action2);
        twilight_self.addMove("NOTIFY\tUS has cancelled the Cuban Missile Crisis");
        twilight_self.endTurn();

        twilight_self.game.state.events.cubanmissilecrisis = 0;
        twilight_self.game.state.events.cubanmissilecrisis_removal_country = action2;
        twilight_self.game.state.events.cubanmissilecrisis_cancelled = 1;

      });

    }
  }


  revertTurn() {

    let twilight_self = this;

    this.cancelBackButtonFunction();
    this.hud.back_button_clicked = true;

    if (twilight_self.game.state.events.cubanmissilecrisis_cancelled == 1) {
      if (twilight_self.game.state.events.cubanmissilecrisis_removal_country != "") {
	//
	// we have removed 2 influence from this country, so re-add it
	//
	if (twilight_self.game.state.events.cubanmissilecrisis_removal_country === "cuba") {
          this.placeInfluence("cuba", 2, "ussr");
	}
	if (twilight_self.game.state.events.cubanmissilecrisis_removal_country === "westgermany") {
          this.placeInfluence("westgermany", 2, "us");
	}
	if (twilight_self.game.state.events.cubanmissilecrisis_removal_country === "turkey") {
          this.placeInfluence("turkey", 2, "us");
	}
      }

      twilight_self.game.state.events.cubanmissilecrisis = 1;
      twilight_self.game.state.events.cubanmissilecrisis_cancelled = 0;
      twilight_self.game.state.events.cubanmissilecrisis_removal_country = "";
    }

    //
    // revert game board state AFTER CMC
    //
    let unintervention = (twilight_self.game.state.events.unintervention);
    if (start_turn_game_state == null || start_turn_game_state == undefined) {} else {
      twilight_self.game.state = start_turn_game_state;
    }

    for (let i = twilight_self.game.queue.length-1; i >= 0; i--) {
      let tmpar = twilight_self.game.queue[i].split("\t");

      if (tmpar[0] === "discard") {
      	if (tmpar[1] === "ussr" && twilight_self.game.player == 1) {
          if (tmpar[2] != "ops") {
            twilight_self.addCardToHand(tmpar[2]);
          }
        }
      	if (tmpar[1] === "us" && twilight_self.game.player == 2) {
      	  if (tmpar[2] != "ops") {
      	    twilight_self.addCardToHand(tmpar[2]);
      	  }
      	}
        if (unintervention && tmpar[2] !== "unintervention"){
         twilight_self.game.state.events.unintervention = 1;
        }
        twilight_self.updateLog(`${tmpar[1].toUpperCase()} second-guesses themselves and takes back their ${twilight_self.cardToText(tmpar[2])}...`);
      }
      if (tmpar[0] === "play") {
        twilight_self.displayBoard();
        return 1;
      } else {
        twilight_self.game.queue.splice(i, 1);
      }
    }
    twilight_self.displayBoard();
  }







  playerTriggerOps(player, card) {

    let twilight_self = this;
    if (this.game.player == 0 ) {return; } //just in case

    let opponent = "us";
    if (this.game.player == 2) { opponent = "ussr"; }

    //
    // Flower Power -- needs to be higher up the chain
    //
    if (twilight_self.game.state.events.flowerpower == 1 && player === "us") {
      if ((card == "arabisraeli" && twilight_self.game.state.events.campdavid == 0) || card == "koreanwar" || card == "brushwar" || card == "indopaki" || card == "iraniraq") {
        twilight_self.addMove("modal\t"+this.cardToText("flowerpower"),"USSR gains 2 VP");
        twilight_self.addMove("NOTIFY\tFlower Power triggered by "+this.cardToText(card));
        twilight_self.addMove("vp\tussr\t2\t1");
      }
    }

    twilight_self.game.state.event_before_ops = 0;

    let ac = twilight_self.returnAllCards(true);

    if (ac[card].player == opponent) {
        let html = '<ul><li class="option" id="before_ops">event before ops</li><li class="option" id="after_ops">event after ops</li></ul>';
        twilight_self.bindBackButtonFunction(() => {  twilight_self.playerTurnCardSelected(card, player);  });
        twilight_self.updateStatusWithOptions('Playing opponent card:', html, function(action2) {

          twilight_self.game.state.event_name = twilight_self.cardToText(card);

          if (action2 === "before_ops") {
            twilight_self.game.state.event_before_ops = 1;
            twilight_self.addMove("ops\t"+player+"\t"+card+"\t"+ac[card].ops);
            twilight_self.addMove("event\t"+player+"\t"+card);

          }
          else if (action2 === "after_ops") {
            twilight_self.addMove("event\t"+player+"\t"+card);
            twilight_self.addMove("ops\t"+player+"\t"+card+"\t"+ac[card].ops);
          }

          twilight_self.removeCardFromHand(card);
          twilight_self.endTurn();
          return;
        });


      return;

    } else { //Playing my own or neutral card for ops

      twilight_self.addMove("ops\t"+player+"\t"+card+"\t"+ac[card].ops);
      if (card == "china") { twilight_self.addMove("limit\tchina"); }
      twilight_self.removeCardFromHand(card);
      twilight_self.endTurn();
      return;

    }

  }





  playerTriggerEvent(player, card) {

    let twilight_self = this;

    //
    // Flower Power
    //
    if (twilight_self.game.state.events.flowerpower == 1) {
      if ((card == "arabisraeli" && twilight_self.game.state.events.campdavid == 0) || card == "koreanwar" || card == "brushwar" || card == "indopaki" || card == "iraniraq") {
        if (player === "us") {
          twilight_self.addMove("modal\t"+this.cardToText("flowerpower"),"USSR gains 2 VP");
          twilight_self.addMove("NOTIFY\tFlower Power triggered by "+this.cardToText(card));
          twilight_self.addMove("vp\tussr\t2\t1");
        }
      }
    }

    twilight_self.game.state.event_name = twilight_self.cardToText(card);
    twilight_self.addMove("event\t"+player+"\t"+card);
    twilight_self.removeCardFromHand(card);


    //
    // Our Man in Tehran -- check if reshuffle is needed
    //
    if (card == "tehran") {

      //
      // reshuffle needed before event
      //
      if (5 > twilight_self.game.deck[0].crypt.length) {

        // don't shuffle shuttle diplomacy back in if still in play
        if (this.game.state.events.shuttlediplomacy == 1) {
          if (this.game.deck[0].discards['shuttle']) {
            delete this.game.deck[0].discards['shuttle'];
          }
        }

        let discarded_cards = twilight_self.returnDiscardedCards();

        if (Object.keys(discarded_cards).length > 0) {

          //
          // shuffle in discarded cards -- eliminate SHUFFLE here as unnecessary
          //
          twilight_self.addMove("SHUFFLE\t1");
          twilight_self.addMove("DECKRESTORE\t1");
          twilight_self.addMove("DECKENCRYPT\t1\t2");
          twilight_self.addMove("DECKENCRYPT\t1\t1");
          twilight_self.addMove("DECKXOR\t1\t2");
          twilight_self.addMove("DECKXOR\t1\t1");
          twilight_self.addMove("flush\tdiscards"); // opponent should know to flush discards as we have
          twilight_self.addMove("DECK\t1\t"+JSON.stringify(discarded_cards));
          twilight_self.addMove("DECKBACKUP\t1");
          twilight_self.updateLog("cards remaining: " + twilight_self.game.deck[0].crypt.length);
          twilight_self.updateLog("Shuffling discarded cards back into the deck...");

        }
      }
    }

    twilight_self.endTurn();
    return;

  }




  /////////////////////
  // Place Influence //
  // If China card or Vietnam revolts in effect, we hold off on clearing them, because we may have 2 bonus OPs which could break control.
  /////////////////////
  uneventOpponentControlledCountries(player, card) {

    let bonus_regions = this.returnArrayOfRegionBonuses(card);

    for (var i in this.countries) {
        let bonus_region_applies = 0;
        for (let z = 0; z < bonus_regions.length; z++) {
          if (this.countries[i].region.indexOf(bonus_regions[z]) > -1) {
            bonus_region_applies = 1;
          }
        }

      if (player == "us") {
        if (this.isControlled("ussr", i) == 1 && bonus_region_applies == 0) {
          this.countries[i].place = 0;
          let divname = '#'+i;
          $(divname).off();
        }
      }
      if (player == "ussr") {
        if (this.isControlled("us", i) == 1 && bonus_region_applies == 0) {
          this.countries[i].place = 0;
          let divname = '#'+i;
          $(divname).off();
        }
      }
    }

  }


  /*
  Can only place influence in countries with influence or neighboring countries with your influence
  Resets the board to enable to you make your placements properly
  */
  prePlayerPlaceInfluence(player) {
    //
    // reset
    //
    for (var i in this.countries) { this.game.countries[i].place = 0; }

    //
    // ussr
    //
    if (player == "ussr") {

      this.game.countries['finland'].place = 1;
      this.game.countries['poland'].place = 1;
      this.game.countries['romania'].place = 1;
      this.game.countries['afghanistan'].place = 1;
      this.game.countries['northkorea'].place = 1;

      for (var i in this.game.countries) {
        if (this.game.countries[i].ussr > 0) {

          let place_in_country = 1;

          //
          // skip argentina if only has 1 and ironlady_before_ops
          //
          if (this.game.state.ironlady_before_ops == 1 && this.game.countries['chile'].ussr < 1 && this.game.countries['uruguay'].ussr < 1 && this.game.countries['paraguay'].ussr < 1 && this.game.countries['argentina'].ussr == 1 && i === "argentina") { place_in_country = 0; }

          this.game.countries[i].place = place_in_country;

          if (place_in_country == 1) {
            for (let n = 0; n < this.game.countries[i].neighbours.length; n++) {
              let j = this.game.countries[i].neighbours[n];
              this.game.countries[j].place = 1;
            }
          }

        }
      }
    }

    //
    // us
    //
    if (player == "us") {

      this.game.countries['canada'].place = 1;
      this.game.countries['mexico'].place = 1;
      this.game.countries['cuba'].place = 1;
      this.game.countries['japan'].place = 1;

      for (var i in this.game.countries) {
        if (this.game.countries[i].us > 0) {
          this.game.countries[i].place = 1;
          for (let n = 0; n < this.game.countries[i].neighbours.length; n++) {
            let j = this.game.countries[i].neighbours[n];
            this.game.countries[j].place = 1;
          }
        }
      }
    }

  }



  playerPlaceInitialInfluence() {

    let twilight_self = this;

    try {

      twilight_self.addMove("resolve\tplacement");

      //
      // HACK intended to prevent the double-placement bug, which is possible
      // in some games for some unknown reason -- the first placement happens
      // 2x.
      //
      if (twilight_self.game.state.placement >= 1) { 
	twilight_self.endTurn();
	return;
      }

      if (this.game.player == 1) { //USSR

	this.game_help.render({
	    title : "Standard USSR Placement" ,
	    text : "A strong opening protects your critical battleground countries (East Germany and Poland) and uses your final OP to secure access to Italy and Greece",
	    img : "/twilight/img/backgrounds/ussr_placement.png" ,
	    color: "#d2242a" ,
	    line1 : "where",
	    line2 : "to place?",
	    fontsize : "2.1rem" ,
	}); 
	
        this.updateStatusAndListCards(`You are the USSR. Place six additional influence in Eastern Europe.`);

        var placeable = ["finland", "eastgermany", "poland", "austria", "czechoslovakia", "hungary", "romania", "yugoslavia", "bulgaria"];
        let ops_to_place = 6;

        for (let p of placeable) {
          this.game.countries[p].place = 1;
          let divname = "#"+p;
          $(divname).addClass("easterneurope");
        }

        $(".easterneurope").off();
        $(".easterneurope").on('click', function() {

          let countryname = $(this).attr('id');

          if (twilight_self.countries[countryname].place == 1) {
            twilight_self.addMove("place\tussr\tussr\t"+countryname+"\t1");
            twilight_self.placeInfluence(countryname, 1, "ussr");
            ops_to_place--;

            if (ops_to_place == 0) {
              twilight_self.playerFinishedPlacingInfluence();
              twilight_self.game.state.placement = 1;
              twilight_self.endTurn();
            } else {
              twilight_self.updateStatusAndListCards(`You are the USSR. Place ${ops_to_place} additional influence in Eastern Europe.`);
            }
          } else { //Should be impossible to hit here
            twilight_self.displayModal("Invalid Influence Placement", `You cannot place there...: ${ops_to_place} influence left`);
          }
        });

        return;
      } else { //US

	this.game_help.render({
	    title : "Standard US Placement" ,
	    text : "Controlling Italy and West Germany protects France. Consider using your bonus to protect Iran and your access to Asia from the Middle East",
	    img : "/twilight/img/backgrounds/us_placement.png" ,
	    color: "#008fd5" ,
	    line1 : "where",
	    line2 : "to place?",
	    fontsize : "2.1rem" ,
	}); 

        this.updateStatusAndListCards(`You are the US. Place seven additional influence in Western Europe.`)

        var placeable = ["canada", "uk", "benelux", "france", "italy", "westgermany", "greece", "spain", "turkey", "austria", "norway", "denmark", "sweden", "finland"];
        var ops_to_place = 7;

        for (let p of placeable) {
          this.game.countries[p].place = 1;
          let divname = "#"+p;
          $(divname).addClass("westerneurope");
        }

        $(".westerneurope").off();
        $(".westerneurope").on('click', function() {

          let countryname = $(this).attr('id');

          if (twilight_self.countries[countryname].place == 1) {
            twilight_self.addMove("place\tus\tus\t"+countryname+"\t1");
            twilight_self.placeInfluence(countryname, 1, "us");
            ops_to_place--;

            if (ops_to_place == 0) {
              twilight_self.playerFinishedPlacingInfluence();
              twilight_self.game.state.placement = 1;
              twilight_self.endTurn();
            }else{
              twilight_self.updateStatusAndListCards(`You are the US. Place ${ops_to_place} additional influence in Western Europe.`)
            }
          } else { //Should be impossible to hit here
            twilight_self.displayModal("Invalid Influence Placement", `You cannot place there...: ${ops_to_place} influence left`);
          }
        });
      }
    } catch (err) { console.log("Error in playerPlaceInitialInfluence: "+err);}
  }



  playerPlaceBonusInfluence(bonus) {

    let twilight_self = this;

    twilight_self.addMove("resolve\tplacement_bonus");

    //
    // HACK intended to prevent the double-placement bug, which is possible
    // in some games for some unknown reason -- the first placement happens
    // 2x.
    //
    if (twilight_self.game.state.placement >= 2) { 
      twilight_self.endTurn();
      return;
    }

    if (this.game.player == 1) {

      this.updateStatusAndListCards(`You are the USSR. Place ${bonus} additional influence in countries with existing Soviet influence.`);

      for (var i in this.game.countries) {
        if (this.game.countries[i].ussr > 0) {

          let countryname  = i;
          let divname      = '#'+i;

          $(divname).off();
          $(divname).on('click', function() {

            let countryname = $(this).attr('id');

            twilight_self.addMove("place\tussr\tussr\t"+countryname+"\t1");
            twilight_self.placeInfluence(countryname, 1, "ussr");
            bonus--;

            if (bonus == 0) {
              twilight_self.playerFinishedPlacingInfluence();
              twilight_self.game.state.placement = 2;
              twilight_self.endTurn();
            }
          });
        }
      }
    } else {

      this.updateStatusAndListCards(`You are the US. Place ${bonus} additional influence in countries with existing American influence.`);

      for (var i in this.game.countries) {
        if (this.game.countries[i].us > 0) {

          let countryname  = i;
          let divname      = '#'+i;
          $(divname).addClass("westerneurope");
        }
      }

      $(".westerneurope").off();
      $(".westerneurope").on('click', function() {

        let countryname = $(this).attr('id');
        twilight_self.addMove("place\tus\tus\t"+countryname+"\t1");
        twilight_self.placeInfluence(countryname, 1, "us");
        bonus--;

        if (bonus == 0) {
          twilight_self.playerFinishedPlacingInfluence();
          twilight_self.game.state.placement = 2;
          twilight_self.endTurn();
        }else{
          twilight_self.updateStatusAndListCards(`You are the US. Place ${bonus} additional influence in countries with existing American influence.`);
        }
      });

    }
  }


  removeInfluence(country, inf, player, mycallback=null) {

    if (player == "us") {
      this.countries[country].us = parseInt(this.countries[country].us) - parseInt(inf);
      if (this.countries[country].us < 0) { this.countries[country].us = 0; };
    } else {
      this.countries[country].ussr = parseInt(this.countries[country].ussr) - parseInt(inf);
      if (this.countries[country].ussr < 0) { this.countries[country].ussr = 0; };
    }

    this.updateLog(player.toUpperCase() + " removes " + inf + " from " + this.countries[country].name);

    this.showInfluence(country, player, mycallback);

  }

  placeInfluence(country, inf, player, mycallback=null) {

    this.game_help.hide();

    if (player == "us") {
      this.countries[country].us = parseInt(this.countries[country].us) + parseInt(inf);
    } else {
      this.countries[country].ussr = parseInt(this.countries[country].ussr) + parseInt(inf);
    }

    this.updateLog(player.toUpperCase() + " places " + inf + " in " + this.countries[country].name, 1);
    this.showInfluence(country, player, mycallback);

  }


  /*
   * So, why do we need to specify which "player" (e.g. "us"/"ussr") in this function?
   */
  showInfluence(country, player="", mycallback=null) {

    let obj_us    = "#"+country+ " > .us";
    let obj_ussr = "#"+country+ " > .ussr";

    //Why do we need to parseInt?
    let us_i   = parseInt(this.countries[country].us);
    let ussr_i = parseInt(this.countries[country].ussr);

    let countryMaster = this.whoControls(country);

    //Update HTML for USSR and US

    if (ussr_i == 0){
      $(obj_ussr).html('');
    }else if (countryMaster === "ussr"){
      $(obj_ussr).html('<div class="ussr_control">'+ussr_i+'</div>');
    }else{
      $(obj_ussr).html('<div class="ussr_uncontrol">'+ussr_i+'</div>');
    }

    if (us_i == 0){
      $(obj_us).html('');
    }else if (countryMaster === "us"){
      $(obj_us).html('<div class="us_control">'+us_i+'</div>');
    }else{
      $(obj_us).html('<div class="us_uncontrol">'+us_i+'</div>');
    }

    //Add an animation to clue the other player into the new influence status
    if (player){
      if (!(this.game.player == 1 && player == "ussr") && !(this.game.player == 2 && player == "us")){
        $(`#${country}`).addClass("shake").delay(1500).queue(function () {
          $(this).removeClass("shake").dequeue();
        });
      }
    }

    $('.us_control').css('height', this.scale(100)+"px");
    $('.us_uncontrol').css('height', this.scale(100)+"px");
    $('.ussr_control').css('height', this.scale(100)+"px");
    $('.ussr_uncontrol').css('height', this.scale(100)+"px");

    $('.us_control').css('font-size', this.scale(100)+"px");
    $('.us_uncontrol').css('font-size', this.scale(100)+"px");
    $('.ussr_control').css('font-size', this.scale(100)+"px");
    $('.ussr_uncontrol').css('font-size', this.scale(100)+"px");

    //
    // adjust screen ratio
    //
    $('.country').css('width', this.scale(202)+"px");
    $('.us').css('width', this.scale(100)+"px");
    $('.ussr').css('width', this.scale(100)+"px");
    $('.us').css('height', this.scale(100)+"px");
    $('.ussr').css('height', this.scale(100)+"px");

    //
    // update game state -- countries unchanged by this function
    // this.game.countries = this.countries;

    if (mycallback != null) { mycallback(country, player); }

  }










  playerPlaceInfluence(player, mycallback=null) {

    // reset off
    this.playerFinishedPlacingInfluence();

    var twilight_self = this;
    let xpos = 0;
    let ypos = 0;

    for (var i in this.countries) {

      let countryname  = i;
      let divname      = '#'+i;

      let restricted_country = 0;

      //
      // Chernobyl
      //
      if (this.game.player == 1 && this.game.state.events.chernobyl != "") {
        if (this.countries[i].region == this.game.state.events.chernobyl) {
	        restricted_country = 1;
        }
        if (this.game.state.events.chernobyl == "asia" && this.countries[i].region == "seasia") {
          restricted_country = 1;
        }
      }

      if (this.game.state.limit_region.indexOf(this.countries[i].region) > -1) { restricted_country = 1; }

      if (restricted_country == 1) {
        $(divname).off();
        $(divname).on('click', function() {
          twilight_self.displayModal("Invalid Target - restricted region");
        });

      } else {

        if (player == "us") {

          $(divname).off();
          $(divname).on('mousedown', function (e) {
            xpos = e.clientX;
            ypos = e.clientY;
          });
          $(divname).on('mouseup', async function (e) {
            if (Math.abs(xpos-e.clientX) > 4) { return; }
            if (Math.abs(ypos-e.clientY) > 4) { return; }

            let countryname = $(this).attr('id');

            if (twilight_self.countries[countryname].place == 1) {

              //
              // vietnam revolts and china card - US never eligible for former
              //
              twilight_self.game.state.events.vietnam_revolts_eligible = 0;
              if (twilight_self.countries[countryname].region.indexOf("asia") < 0) { twilight_self.game.state.events.china_card_eligible = 0; }

              if (twilight_self.isControlled("ussr", countryname) == 1) { twilight_self.game.break_control = 1; }

              //
              // permit cuban missile crisis removal after placement
              //
              if (twilight_self.game.state.events.cubanmissilecrisis == 2) {
                if (countryname === "turkey" || countryname === "westgermany") {
                  if (twilight_self.countries[countryname].us >= 1) {

                    //
                    // allow player to remove CMC
                    //
                    let removeinf = await sconfirm("You are placing 1 influence in "+twilight_self.countries[countryname].name+". Once this is done, do you want to cancel the Cuban Missile Crisis by removing 2 influence in "+twilight_self.countries[countryname].name+"?");
                    if (removeinf) {
      		      twilight_self.addMove("setvar\tgame\tstate\tevents\tcubanmissilecrisis\t0");
      		      twilight_self.addMove("setvar\tgame\tstate\tevents\tcubanmissilecrisis_cancelled\t1");
    		      twilight_self.addMove("setvar\tgame\tstate\tevents\tcubanmissilecrisis_removal_country\t"+countryname);
                      twilight_self.removeInfluence(countryname, 1, "us"); // remove 1 instead of placing 1
                      twilight_self.addMove(`remove\tus\tus\t${countryname}\t1`);
                      twilight_self.addMove("unlimit\tcmc\t"+countryname);
                      twilight_self.addMove("NOTIFY\tUS has cancelled the Cuban Missile Crisis");
	              twilight_self.game.state.events.cubanmissilecrisis = 0; //for immediate effect
	              twilight_self.game.state.events.cubanmissilecrisis_cancelled = 1; //for immediate effect
	              twilight_self.game.state.events.cubanmissilecrisis_removal_country = countryname;
                    } else {
                      twilight_self.addMove("place\tus\tus\t"+countryname+"\t1");
                      twilight_self.placeInfluence(countryname, 1, "us", mycallback);
		    }
                  } else {
                    twilight_self.addMove("place\tus\tus\t"+countryname+"\t1");
                    twilight_self.placeInfluence(countryname, 1, "us", mycallback);
		  }
                } else {
                  twilight_self.addMove("place\tus\tus\t"+countryname+"\t1");
                  twilight_self.placeInfluence(countryname, 1, "us", mycallback);
		}
              } else {
                twilight_self.addMove("place\tus\tus\t"+countryname+"\t1");
                twilight_self.placeInfluence(countryname, 1, "us", mycallback);
	      }


            } else {
              twilight_self.displayModal("you cannot place there...");
              return;
            }
          });

        } else {

          $(divname).off();
          $(divname).on('mousedown', function (e) {
            xpos = e.clientX;
            ypos = e.clientY;
          });
          $(divname).on('mouseup', async function (e) {
            if (Math.abs(xpos-e.clientX) > 4) { return; }
            if (Math.abs(ypos-e.clientY) > 4) { return; }

            let countryname = $(this).attr('id');

            if (twilight_self.countries[countryname].place == 1) {

              //
              // vietnam revolts and china card
              //
              if (twilight_self.countries[countryname].region !== "seasia") { twilight_self.game.state.events.vietnam_revolts_eligible = 0; }
              if (twilight_self.countries[countryname].region.indexOf("asia") < 0) { twilight_self.game.state.events.china_card_eligible = 0; }
              if (twilight_self.isControlled("us", countryname) == 1) { twilight_self.game.break_control = 1; }

              //
              // permit cuban missile crisis removal after placement
              //
              if (twilight_self.game.state.events.cubanmissilecrisis == 1) {
                if (countryname === "cuba") {
                  if (twilight_self.countries[countryname].ussr >= 1) {

                    //
                    // allow player to remove CMC
                    //
                    let removeinf = await sconfirm("You are placing 1 influence in "+twilight_self.countries[countryname].name+". Once this is done, do you want to cancel the Cuban Missile Crisis by removing 2 influence in "+twilight_self.countries[countryname].name+"?");
                    if (removeinf) {
      		        twilight_self.addMove("setvar\tgame\tstate\tevents\tcubanmissilecrisis\t0");
      		        twilight_self.addMove("setvar\tgame\tstate\tevents\tcubanmissilecrisis_cancelled\t1");
    		        twilight_self.addMove("setvar\tgame\tstate\tevents\tcubanmissilecrisis_removal_country\t"+countryname);
                        twilight_self.removeInfluence("cuba", 1, "ussr");
                        twilight_self.addMove("remove\tussr\tussr\tcuba\t2");
                        twilight_self.addMove("unlimit\tcmc\t"+countryname);
                        twilight_self.addMove("NOTIFY\tUSSR has cancelled the Cuban Missile Crisis");
                        twilight_self.game.state.events.cubanmissilecrisis = 0; //for immediate effect
	                twilight_self.game.state.events.cubanmissilecrisis_cancelled = 1; //for immediate effect
	                twilight_self.game.state.events.cubanmissilecrisis_removal_country = countryname;
                    } else {
                      twilight_self.addMove("place\tussr\tussr\t"+countryname+"\t1");
                      twilight_self.placeInfluence(countryname, 1, "ussr", mycallback);
		    }
                  } else {
                    twilight_self.addMove("place\tussr\tussr\t"+countryname+"\t1");
                    twilight_self.placeInfluence(countryname, 1, "ussr", mycallback);
		  }
                } else {
                  twilight_self.addMove("place\tussr\tussr\t"+countryname+"\t1");
                  twilight_self.placeInfluence(countryname, 1, "ussr", mycallback);
		}
              } else {
                twilight_self.addMove("place\tussr\tussr\t"+countryname+"\t1");
                twilight_self.placeInfluence(countryname, 1, "ussr", mycallback);
	      }

            } else {
              twilight_self.displayModal("Invalid Target");
              return;
            }
          });
        } // NON RESTRICTED COUNTRY
      }
    }

  }

  removeEvents(){
    $(".country").off();
  }

  playerFinishedPlacingInfluence(player, mycallback=null) {
    $(".country").off();
    $(".easterneurope").removeClass("easterneurope");
    $(".westerneurope").removeClass("westerneurope");
    if (mycallback != null) { mycallback(); }
  }


  isSpaceRaceAvailable(ops){
        //
        // is space race an option
        //
        let sre = 1;
        if (this.game.player == 1 && this.game.state.space_race_ussr_counter >= 1) {
          if (this.game.state.animal_in_space == "ussr" && this.game.state.space_race_ussr_counter < 2) {} else {
            sre = 0;
          }
        }
        if (this.game.player == 2 && this.game.state.space_race_us_counter >= 1) {
          if (this.game.state.animal_in_space == "us" && this.game.state.space_race_us_counter < 2) {} else {
            sre = 0;
          }
        }

        if (sre == 1) {
          let myspacerace = (this.game.player == 1) ? this.game.state.space_race_ussr : this.game.state.space_race_us;
          if ((myspacerace < 4 && ops > 1) || (myspacerace < 7 && ops > 2) || ops > 3){
            return '<li class="option" id="space">space race</li>';
          }
        }
        return "";
  }


  playerSpaceCard(card, player) {

    let ac = this.returnAllCards(true);
    let card_ops = ac[card].ops;

    // stats
    if (player == "us") { this.game.state.stats.us_ops_spaced += this.modifyOps(card_ops, card, player); }
    if (player == "ussr") { this.game.state.stats.ussr_ops_spaced += this.modifyOps(card_ops, card, player); }

    /* Track attempts to advance in the space race, normally 1 per turn*/
    if (player == "ussr") {
      this.game.state.space_race_ussr_counter++;
    } else {
      this.game.state.space_race_us_counter++;
    }

    let roll = this.rollDice(6);

    let successful     = 0;
    let box       = (player == "ussr") ? this.game.state.space_race_ussr : this.game.state.space_race_us;

    if (box == 0) { if (roll < 4) { successful = 1; } }
    if (box == 1) { if (roll < 5) { successful = 1; } }
    if (box == 2) { if (roll < 4) { successful = 1; } }
    if (box == 3) { if (roll < 5) { successful = 1; } }
    if (box == 4) { if (roll < 4) { successful = 1; } }
    if (box == 5) { if (roll < 5) { successful = 1; } }
    if (box == 6) { if (roll < 4) { successful = 1; } }
    if (box == 7) { if (roll < 3) { successful = 1; } }

    if (successful == 1) {
      this.updateLog(player.toUpperCase() + ` advances in the Space Race with roll ${roll}`);
      this.advanceSpaceRace(player);
    } else {
      this.updateLog(player.toUpperCase() + ` fails in the Space Race with roll ${roll}`);
      this.displayModal(player.toUpperCase() + " fails to advance in the Space Race");
    }

  }




  ///////////
  // COUPS //
  ///////////
  playerCoupCountry(player,  ops, card) {

    var twilight_self = this;

    $(".country").off();
    $(".country").on('click', async function() {

      let countryname = $(this).attr('id');

      //
      // sanity DEFCON check
      //
      if (twilight_self.game.state.defcon == 2 && twilight_self.game.countries[countryname].bg == 1 &&
          !(player == "us" && twilight_self.game.state.events.nuclearsubs == 1)) {
        let c = await sconfirm("Are you sure you wish to coup a Battleground State? (DEFCON is 2)");
        if (c) {
        } else {
          twilight_self.playOps(player, ops, card);
          return;
        }
      }

      let coupHeader = `Cannot Coup ${twilight_self.countries[countryname].name}`;
      let failureReason = ""; //Also tells us if it is a valid target

      //
      // Coup Restrictions
      //
      if (twilight_self.game.state.limit_region.indexOf(twilight_self.countries[countryname].region) > -1) {
        failureReason = "Invalid Region for this Coup";
      }

      if (twilight_self.game.state.limit_ignoredefcon == 0) {
        if (twilight_self.countries[countryname].region == "europe" && twilight_self.game.state.defcon < 5) {
          failureReason = "DEFCON prevents coups in Europe";
        }

        if ((twilight_self.countries[countryname].region == "asia" || twilight_self.countries[countryname].region == "seasia") && twilight_self.game.state.defcon < 4) {
          failureReason = "DEFCON prevents coups in Asia";
        }

        if (twilight_self.countries[countryname].region == "mideast" && twilight_self.game.state.defcon < 3) {
          failureReason = "DEFCON prevents coups in the Middle-East";
        }
      }


      // US / Japan Restrictions
      if (twilight_self.game.state.events.usjapan == 1 && countryname == "japan" && player == "ussr") {
        failureReason = "US/Japan Alliance prevents coups in Japan";
      }

      /*
      WATCH OUT for LOGIC failure in the next two if-blocks, the realities of defcon blocking coups means that the logic has likely never been tested
      */

      // Nato Coup Restriction
      if (twilight_self.countries[countryname].region == "europe" && twilight_self.game.state.events.nato == 1 && player == "ussr") {
        if (twilight_self.isControlled("us", countryname) == 1) {
          if ( (countryname == "westgermany" && twilight_self.game.state.events.nato_westgermany == 0) || (countryname == "france" && twilight_self.game.state.events.nato_france == 0) ) {
            //If West Germany or France have been removed from Nato (by Degaulle or WillyBrandt), then one can coup there....
          } else {
            failureReason = "NATO prevents coups of US-controlled countries in Europe";
          }
        }
      }

      // The Reformer Coup Restriction
      if (twilight_self.countries[countryname].region == "europe" && twilight_self.game.state.events.reformer == 1 && player == "ussr") {
        failureReason = "The Reformer prevents USSR coup attempts in Europe";
      }

     if ((player == "us" && twilight_self.countries[countryname].ussr <= 0) || (player == "ussr" && twilight_self.countries[countryname].us <= 0)) {
        failureReason = "No enemy influence";
      }


      if (failureReason.length > 0) {
        twilight_self.displayModal(coupHeader, failureReason);
      } else {
        //
        // china card regional bonuses
        //
        if (card == "china" && (twilight_self.game.countries[countryname].region == "asia" || twilight_self.game.countries[countryname].region == "seasia")) {
          twilight_self.updateLog("China bonus OP added to coup in Asia...");
          ops++;
        }
        if (player == "ussr" && twilight_self.game.state.events.vietnam_revolts == 1 && twilight_self.game.countries[countryname].region == "seasia") {
    	    if (twilight_self.returnOpsOfCard(card) == 1 && twilight_self.game.state.events.redscare_player1 >= 1) {
            twilight_self.updateLog("Vietnam Revolts bonus OP negated by Red Purge");
    	    } else {
            twilight_self.updateLog("Vietnam Revolts bonus OP added to Southeast Asia coup...");
            ops++;
          }
        }

        twilight_self.addMove("coup\t"+player+"\t"+countryname+"\t"+ops+"\t"+card);
        twilight_self.endTurn();
      }

    });

  }




  playCoup(player, countryname, ops, mycallback=null) {

    let roll    = this.rollDice(6);
    let modifier = 0;

    //
    // stats
    //
    if (player == "us") {
	this.game.state.stats.us_coups.push(roll);
    }
    if (player == "ussr") {
	this.game.state.stats.ussr_coups.push(roll);
    }

    //
    // Cuban Missile Crisis
    //
    if (player == "ussr" && this.game.state.events.cubanmissilecrisis == 1) {
      this.sendGameOverTransaction(this.game.players[1], "Cuban Missile Crisis");
      return;
    }
    if (player == "us" && this.game.state.events.cubanmissilecrisis == 2) {
      this.sendGameOverTransaction(this.game.players[0], "Cuban Missile Crisis");
      return;
    }


    //
    // Yuri and Samantha
    //
    if (this.game.state.events.yuri == 1) {
      if (player == "us") {
        this.game.state.vp -= 1;
        this.updateVictoryPoints();
        this.updateLog(`USSR gains 1 VP from ${this.cardToText("yuri")}`);
      }
    }

    //
    // Salt Negotiations
    //
    if (this.game.state.events.saltnegotiations == 1) {
      this.updateLog(`${this.cardToText("saltnegotiations")}: -1 modifier on coups`);
      modifier--;
    }

    //
    // Latin American Death Squads
    //
    if (this.game.state.events.deathsquads != 0) {
      if (this.game.state.events.deathsquads <= -1) {
	      let roll_modifier = Math.abs(this.game.state.events.deathsquads);
        if (this.countries[countryname].region == "camerica" || this.countries[countryname].region == "samerica") {
          if (player == "ussr") {
            this.updateLog(`${this.cardToText("deathsquads")} triggers: USSR +${roll_modifier} modifier`);
            modifier += roll_modifier;
          }
          if (player == "us")   {
            if (this.countries[countryname].region == "camerica" || this.countries[countryname].region == "samerica") {
              this.updateLog(`${this.cardToText("deathsquads")} triggers: US -${roll_modifier} modifier`);
              modifier -= roll_modifier;
            }
          }
        }
      }
      if (this.game.state.events.deathsquads >= 1) {
        let roll_modifier = this.game.state.events.deathsquads;
        if (this.countries[countryname].region == "camerica" || this.countries[countryname].region == "samerica") {
          if (player == "ussr") {
            this.updateLog(`${this.cardToText("deathsquads")} triggers: USSR -${roll_modifier} modifier`);
            modifier -= roll_modifier;
          }
          if (player == "us")   {
            this.updateLog(`${this.cardToText("deathsquads")} triggers: US +${roll_modifier} modifier`);
            modifier += roll_modifier;
          }
        }
      }
    }

    //
    // END OF HISTORY (INF Treaty and CMC)
    //
    if (this.game.state.events.inftreaty == 1) {
        this.updateLog(`${this.cardToText("inftreaty")} -1 modifier on coups`);
        modifier--;
    }

    // Lower Defcon in BG countries unless US has nuclear subs or special condition flagged
    if (this.game.countries[countryname].bg == 1 && this.game.state.lower_defcon_on_coup == 1) {
      if (player == "ussr" || this.game.state.events.nuclearsubs == 0 ){
        this.lowerDefcon();
      }
    }

    let stability = parseInt(this.countries[countryname].control); //Just for some reason

    if (modifier != 0) {
      roll = (roll+modifier);
      this.updateLog(`COUP: ${player.toUpperCase()} modified roll: ${roll}`);
    } else {
      this.updateLog(`COUP: ${player.toUpperCase()} rolls ${roll}`);
    }

    let winning = roll + ops - (stability * 2);


    if (winning > 0) {

      if (this.browser_active == 1) {
        this.displayModal(`COUP in ${this.countries[countryname].name}!`, `${player.toUpperCase()} successfully shifts influence in by ${winning}`);
      }

      let removed = 0;
      let gained = 0;
      this.updateLog(`${player.toUpperCase()}'s coup succeeds in ${this.countries[countryname].name}.`);

      if (player == "us") {
        removed = Math.min(winning, this.countries[countryname].ussr);
        gained = winning - removed;
        if (removed > 0){
          this.removeInfluence(countryname, removed, "ussr");
        }
      }else{
        removed = Math.min(winning, this.countries[countryname].us);
        gained = winning - removed;
        if (removed > 0){
          this.removeInfluence(countryname, removed, "us");
        }
      }
      this.placeInfluence(countryname, gained, player);

    } else {
      if ((player == "us" && this.game.player == 2) || (player == "ussr" && this.game.player == 1) ) {
        this.displayModal(`COUP FAILS!`);
      }else{
        this.displayModal(`COUP in ${this.countries[countryname].name}!`,"Your forces repel the coup and the government remains in power");
      }

      this.updateLog(`${player.toUpperCase()}'s coup in ${this.countries[countryname].name} fails, no change in influence`);
    }


    if (mycallback != null) {
      mycallback();
    }

    return;
  }



  playRealign(player, country) {

      this.updateLog(player.toUpperCase() + " attempts to realign " + this.countries[country].name);

      let bonus_us = 0;
      let bonus_ussr = 0;

      if (this.countries[country].us > this.countries[country].ussr) {
        bonus_us++;
      }
      if (this.countries[country].ussr > this.countries[country].us) {
        bonus_ussr++;
      }
      for (let z = 0; z < this.countries[country].neighbours.length; z++) {
        let racn = this.countries[country].neighbours[z];
        if (this.isControlled("us", racn) == 1) {
          bonus_us++;
        }
        if (this.isControlled("ussr", racn) == 1) {
          bonus_ussr++;
        }
      }

      //
      // handle adjacent influence
      //
      if (country === "mexico") { bonus_us++; }
      if (country === "cuba")   { bonus_us++; }
      if (country === "japan")  { bonus_us++; }
      if (country === "canada") { bonus_us++; }
      if (country === "finland") { bonus_ussr++; }
      if (country === "poland") { bonus_ussr++; }
      if (country === "romania") { bonus_ussr++; }
      if (country === "afghanistan") { bonus_ussr++; }
      if (country === "northkorea") { bonus_ussr++; }


      //
      // Iran-Contra Scandal
      //
      if (this.game.state.events.irancontra == 1) {
        this.updateLog("Iran-Contra Scandal -1 modification on US roll");
        bonus_us--;
      }

      let roll_us   = this.rollDice(6);
      let roll_ussr = this.rollDice(6);

      roll_us   = roll_us + bonus_us;
      roll_ussr = roll_ussr + bonus_ussr;

      if (roll_us > roll_ussr) {
        this.updateLog(`US wins realignment roll with ${roll_us} (incl. ${bonus_us} bonus) vs. USSR ${roll_ussr} (incl. ${bonus_ussr} bonus)`);
        let diff = roll_us - roll_ussr;
        if (this.countries[country].ussr > 0) {
          diff = Math.min(diff, this.countries[country].ussr);
          this.removeInfluence(country, diff, "ussr");
        }
      }else if (roll_us < roll_ussr) {
        this.updateLog(`USSR wins realignment roll with ${roll_ussr} (incl. ${bonus_ussr} bonus) vs. US ${roll_us} (incl. ${bonus_us} bonus)`);
        let diff = roll_ussr - roll_us;
        if (this.countries[country].us > 0) {
          diff = Math.min(diff, this.countries[country].us);
          this.removeInfluence(country, diff, "us");
        }
      }else{
        this.updateLog(`Realignment roll is a draw! US [${roll_us-bonus_us} + ${bonus_us}] = USSR [${roll_ussr-bonus_ussr} + ${bonus_ussr}]`);
      }

  }








  ///////////////////////
  // Twilight Specific //
  ///////////////////////
  removeMove() {
    return this.moves.pop();
  }

  endTurn(nextTarget=0) {

    //
    // cancel click function on cards
    //
    this.changeable_callback = function() {};

    //
    // show active events
    //
    this.updateEventTiles();
    this.cancelBackButtonFunction();
    this.updateStatus("Submitting moves... awaiting response from peers...");

    //
    // remove events from board to prevent "Doug Corley" gameplay
    //
    try {
    $(".card").off();
    $(".country").off();
    } catch (err) {}

    //
    // we will bury you scores first!
    //
    if (this.game.state.events.wwby_triggers == 1) {
      this.addMove(`NOTIFY\t${this.cardToText("wwby")} triggers +3 VP for USSR`);
      this.addMove("vp\tussr\t3");
      this.game.state.events.wwby_triggers = 0;
    }

    let extra = {};
    this.game.turn = this.moves;
    this.moves = [];
    this.sendGameMoveTransaction("game", extra);

  }


  undoMove(move_type, num_of_moves) {

    switch(move_type) {
      case 'place':
        // iterate through the queue and remove past moves
        // cycle through past moves to know what to revert
        for (let i = 0; i < num_of_moves; i++) {
          let last_move = this.removeMove();
          last_move = last_move.split('\t');
          let player = last_move[2];
          let country = last_move[3];
          let ops = last_move[4];

          let opponent = "us";
          if (player == "us") { opponent = "ussr"; }
          this.removeInfluence(country, ops, player);

          //
          // if the country is now enemy controlled, it must have taken an extra move
          // for the play to place there....
          //
          if (this.isControlled(opponent, country) == 1) {
            i++;
          }
        }

        // use this to clear the "resolve ops" move
        this.removeMove();
        return 1;
      default:
        break;
        return 0;
    }
  }


  displayBoard() {

    try {

    for (let i in this.countries) {
      this.showInfluence(i);
    }

    this.updateDefcon();
    this.updateActionRound();
    this.updateSpaceRace();
    this.updateVictoryPoints();
    this.updateMilitaryOperations();
    this.updateRound();

    } catch (err) {}

  }

  playerHoldsCard(card){
    for (let i = 0 ; i < this.game.deck[0].hand.length; i++) {
      if (this.game.deck[0].hand[i] == card) {
        return true;
      }
    }
    return false;
  }

  endRound() {

    is_player_skipping_playing_china_card = 0;

    this.game.state.round++;
    this.game.state.turn 		= 0;
    this.game.state.turn_in_round 	= 0;
    this.game.state.move 		= 0;

    //
    // game over if scoring card is held
    //
    if (this.game.state.round > 1) {
      for (let i = 0 ; i < this.game.deck[0].hand.length; i++) {
        if (this.game.deck[0].hand[i] != "china") {
          if (this.game.deck[0].cards[this.game.deck[0].hand[i]]?.scoring == 1) {
	    if (this.game.options.deck != "late-war" && this.game.state.round != 8) {
              this.sendStopGameTransaction("scoring card held");
              return 0;
	    }
          }
        }
      }
    }

    //
    // calculate milops
    //
    if (this.game.state.round > 1) {
      let milops_needed = this.game.state.defcon;
      let ussr_milops_deficit = (this.game.state.defcon-this.game.state.milops_ussr);
      let us_milops_deficit = (this.game.state.defcon-this.game.state.milops_us);

      if (ussr_milops_deficit > 0) {
        this.game.state.vp += ussr_milops_deficit;
        this.updateLog("USSR penalized " + ussr_milops_deficit + " VP (milops)");
      }
      if (us_milops_deficit > 0) {
        this.game.state.vp -= us_milops_deficit;
        this.updateLog("US penalized " + us_milops_deficit + " VP (milops)");
      }
    }

    this.game.state.us_defcon_bonus = 0;

    this.game.state.milops_us = 0;
    this.game.state.milops_ussr = 0;

    this.game.state.headline = 0;

    //Reset SpaceRace Attempts
    this.game.state.space_race_us_counter = 0;
    this.game.state.space_race_ussr_counter = 0;
    this.game.state.eagle_has_landed_bonus_taken = 0;
    this.game.state.space_station_bonus_taken = 0;

    // set to 1 when ironlady events before ops played (by ussr - limits placement to rules)
    this.game.state.ironlady_before_ops = 0;

    this.game.state.events.wwby_triggers = 0;
    this.game.state.events.region_bonus = "";
    this.game.state.events.u2 = 0;
    this.game.state.events.containment = 0;
    this.game.state.events.brezhnev = 0;
    this.game.state.events.redscare_player1 = 0;
    this.game.state.events.redscare_player2 = 0;
    this.game.state.events.vietnam_revolts = 0;
    this.game.state.events.vietnam_revolts_eligible = 0;
    this.game.state.events.deathsquads = 0;
    this.game.state.events.missileenvy = 0;
    this.game.state.events.cubanmissilecrisis = 0;
    this.game.state.events.cubanmissilecrisis_cancelled = 0;
    this.game.state.events.cubanmissilecrisis_removal_country = "";

    this.game.state.events.nuclearsubs = 0;
    this.game.state.events.saltnegotiations = 0;
    this.game.state.events.northseaoil_bonus = 0;
    this.game.state.events.yuri = 0;
    this.game.state.events.irancontra = 0;
    this.game.state.events.chernobyl = "";
    this.game.state.events.aldrich = 0;

    //
    // increase DEFCON by one
    //
    // SAITO COMMUNITY -- skip under tsar bomba
    if (this.game.state.events.tsarbomba == 1) { this.game.state.events.tsarbomba = 0; } else {
      this.game.state.defcon++;
      if (this.game.state.defcon > 5) { this.game.state.defcon = 5; }
    }
    this.game.state.ussr_milops = 0;
    this.game.state.us_milops = 0;

    try {
      this.displayBoard();
    } catch (err) {
    }

    //
    // give me the china card if needed -- OBSERVER
    //
    if (this.game.player != 0) {
      let do_i_have_the_china_card = 0;
      for (let i = 0; i < this.game.deck[0].hand.length; i++) {
        if (this.game.deck[0].hand[i] == "china") {
          do_i_have_the_china_card = 1;
        }
      }
      if (do_i_have_the_china_card == 0) {
        if (this.game.player == 1) {
          if (this.game.state.events.china_card == 1) {
            if (!this.game.deck[0].hand.includes("china")) {
              this.game.deck[0].hand.push("china");
            }
          }
        }
        if (this.game.player == 2) {
          if (this.game.state.events.china_card == 2) {
            if (!this.game.deck[0].hand.includes("china")) {
              this.game.deck[0].hand.push("china");
            }
          }
        }
      }
    }
    this.game.state.events.china_card = 0;
    this.game.state.events.china_card_eligible = 0;

    return 1;
  }




  whoHasTheChinaCard() {

    //
    // the observer has no clue
    //
    if (this.game.player == 0) {
      return "ussr";
    }

    let do_i_have_the_china_card = 0;

    for (let i = 0; i < this.game.deck[0].hand.length; i++) {
      if (this.game.deck[0].hand[i] == "china") {
        do_i_have_the_china_card = 1;
      }
    }

    if (do_i_have_the_china_card == 0) {
      if (this.game.player == 1) {
        if (this.game.state.events.china_card == 1) {
          if (!this.game.deck[0].hand.includes("china")) {
            return "us";
          } else {
            return "ussr";
          }
        } else {
          if (do_i_have_the_china_card == 1) {
            return "ussr";
          } else {
            return "us";
          }
        }
      }
      if (this.game.player == 2) {
        if (this.game.state.events.china_card == 2) {
          if (!this.game.deck[0].hand.includes("china")) {
            return "ussr";
          } else {
            return "us";
          }
        } else {
          if (do_i_have_the_china_card == 1) {
            return "us";
          } else {
            return "ussr";
          }
        }
      }
    } else {
      if (this.game.player == 1) { return "ussr"; }
      if (this.game.player == 2) { return "us"; }
    }

    //
    // we should never hit this
    //

  }


  addCardToHand(card) {
    if (this.game.player == 0) { return; }
    this.game.deck[0].hand.push(card);
  }
  removeCardFromHand(card) {
    if (this.game.player == 0) { return; }
    for (i = 0; i < this.game.deck[0].hand.length; i++) {
      if (this.game.deck[0].hand[i] == card) {
        this.game.deck[0].hand.splice(i, 1);
      }
    }
  }

  cancelEvent(card) {
    this.game.state.events.cancelled[card] = 1;
  }
  uncancelEvent(card) {
    if (this.game.state.events.cancelled[card]) {
      delete this.game.state.events.cancelled[card];
    }
  }


  ////////////////////
  // Core Game Data //
  ////////////////////
  returnState() {

    var state = {};

    state.dealt = 0;
    state.back_button_cancelled = 0;
    state.r1_placement = 0;
    state.placement = 0;
    state.headline  = 0;
    state.headline_hash = "";
    state.headline_card = "";
    state.headline_xor = "";
    state.headline_opponent_hash = "";
    state.headline_opponent_card = "";
    state.headline_opponent_xor = "";
    state.round = 0;
    state.turn  = 0;
    state.turn_in_round = 0;
    state.broke_control = 0;
    state.us_efcon_bonus = 0;
    state.player1_hold_cards = []; // tournament rules require reveal end-of-turn
    state.player2_hold_cards = [];
    state.opponent_cards_in_hand = 0;
    state.opponent_cards_in_hand = 0;
    state.event_before_ops = 0;
    state.event_name = "";
    state.player_to_go = 1; // used in headline to track phasing player (primarily for assigning losses for defcon lowering stunts)

    state.lower_defcon_on_coup = 1;

    state.vp_outstanding = 0; // vp not settled yet

    state.space_race_us = 0;
    state.space_race_ussr = 0;
    state.space_race_us_counter = 0;
    state.space_race_ussr_counter = 0;


    state.animal_in_space = "";
    state.man_in_earth_orbit = "";
    state.eagle_has_landed = "";
    state.eagle_has_landed_bonus_taken = 0;
    state.space_station = "";
    state.space_station_bonus_taken = 0;

    state.limit_coups = 0;
    state.limit_realignments = 0;
    state.limit_placement = 0;
    state.limit_spacerace = 0;
    state.limit_region = [];
    state.limit_ignoredefcon = 0;

    // track as US (+) and USSR (-)
    state.vp    = 0;

    state.ar_ps         = [];

    // relative --> top: 38px
    state.ar_ps[0]      = { top : 208 , left : 920 };
    state.ar_ps[1]      = { top : 208 , left : 1040 };
    state.ar_ps[2]      = { top : 208 , left : 1155 };
    state.ar_ps[3]      = { top : 208 , left : 1270 };
    state.ar_ps[4]      = { top : 208 , left : 1390 };
    state.ar_ps[5]      = { top : 208 , left : 1505 };
    state.ar_ps[6]      = { top : 208 , left : 1625 };
    state.ar_ps[7]      = { top : 208 , left : 1740 };

    state.vp_ps     = [];
    state.vp_ps[0]  = { top : 2466, left : 3108 };
    state.vp_ps[1]  = { top : 2466, left : 3304 };
    state.vp_ps[2]  = { top : 2466, left : 3440 };
    state.vp_ps[3]  = { top : 2466, left : 3572 };
    state.vp_ps[4]  = { top : 2466, left : 3708 };
    state.vp_ps[5]  = { top : 2466, left : 3840 };
    state.vp_ps[6]  = { top : 2466, left : 3972 };
    state.vp_ps[7]  = { top : 2466, left : 4108 };

    state.vp_ps[8]  = { top : 2608, left : 3036 };
    state.vp_ps[9]  = { top : 2608, left : 3172 };
    state.vp_ps[10]  = { top : 2608, left : 3304 };
    state.vp_ps[11]  = { top : 2608, left : 3440 };
    state.vp_ps[12]  = { top : 2608, left : 3572 };
    state.vp_ps[13]  = { top : 2608, left : 3708 };
    state.vp_ps[14]  = { top : 2608, left : 3840 };
    state.vp_ps[15]  = { top : 2608, left : 3972 };
    state.vp_ps[16]  = { top : 2608, left : 4108 };

    state.vp_ps[17]  = { top : 2748, left : 3036 };
    state.vp_ps[18]  = { top : 2748, left : 3172 };
    state.vp_ps[19]  = { top : 2748, left : 3304 };
    state.vp_ps[20]  = { top : 2748, left : 3572 };
    state.vp_ps[21]  = { top : 2748, left : 3840 };
    state.vp_ps[22]  = { top : 2748, left : 3972 };
    state.vp_ps[23]  = { top : 2748, left : 4108 };

    state.vp_ps[24]  = { top : 2888, left : 3036 };
    state.vp_ps[25]  = { top : 2888, left : 3172 };
    state.vp_ps[26]  = { top : 2888, left : 3304 };
    state.vp_ps[27]  = { top : 2888, left : 3440 };
    state.vp_ps[28]  = { top : 2888, left : 3572 };
    state.vp_ps[29]  = { top : 2888, left : 3708 };
    state.vp_ps[30]  = { top : 2888, left : 3840 };
    state.vp_ps[31]  = { top : 2888, left : 3972 };
    state.vp_ps[32]  = { top : 2888, left : 4108 };

    state.vp_ps[33]  = { top : 3030, left : 3036 };
    state.vp_ps[34]  = { top : 3030, left : 3172 };
    state.vp_ps[35]  = { top : 3030, left : 3304 };
    state.vp_ps[36]  = { top : 3030, left : 3440 };
    state.vp_ps[37]  = { top : 3030, left : 3572 };
    state.vp_ps[38]  = { top : 3030, left : 3708 };
    state.vp_ps[39]  = { top : 3030, left : 3840 };
    state.vp_ps[40]  = { top : 3030, left : 4042 };

    state.space_race_ps = [];
    state.space_race_ps[0] = { top : 510 , left : 3465 }
    state.space_race_ps[1] = { top : 510 , left : 3638 }
    state.space_race_ps[2] = { top : 510 , left : 3810 }
    state.space_race_ps[3] = { top : 510 , left : 3980 }
    state.space_race_ps[4] = { top : 510 , left : 4150 }
    state.space_race_ps[5] = { top : 510 , left : 4320 }
    state.space_race_ps[6] = { top : 510 , left : 4490 }
    state.space_race_ps[7] = { top : 510 , left : 4660 }
    state.space_race_ps[8] = { top : 510 , left : 4830 }

    state.milops_us = 0;
    state.milops_ussr = 0;

    state.milops_ps    = [];
    state.milops_ps[0]  = { top : 2940 , left : 1520 };
    state.milops_ps[1]  = { top : 2940 , left : 1675 };
    state.milops_ps[2]  = { top : 2940 , left : 1830 };
    state.milops_ps[3]  = { top : 2940 , left : 1985 };
    state.milops_ps[4]  = { top : 2940 , left : 2150 };
    state.milops_ps[5]  = { top : 2940 , left : 2305 };

    state.defcon = 5;

    state.defcon_ps    = [];
    state.defcon_ps[0] = { top : 2592, left : 1526 };
    state.defcon_ps[1] = { top : 2592, left : 1682 };
    state.defcon_ps[2] = { top : 2592, left : 1838 };
    state.defcon_ps[3] = { top : 2592, left : 1994 };
    state.defcon_ps[4] = { top : 2592, left : 2150 };

    state.round_ps    = [];
    state.round_ps[0] = { top : 150, left : 3473 };
    state.round_ps[1] = { top : 150, left : 3627 };
    state.round_ps[2] = { top : 150, left : 3781 };
    state.round_ps[3] = { top : 150, left : 3935 };
    state.round_ps[4] = { top : 150, left : 4098 };
    state.round_ps[5] = { top : 150, left : 4252 };
    state.round_ps[6] = { top : 150, left : 4405 };
    state.round_ps[7] = { top : 150, left : 4560 };
    state.round_ps[8] = { top : 150, left : 4714 };
    state.round_ps[9] = { top : 150, left : 4868 };

    // stats - statistics
    state.stats = {};
    state.stats.us_scorings = 0;
    state.stats.ussr_scorings = 0;
    state.stats.us_ops = 0;
    state.stats.ussr_ops = 0;
    state.stats.us_us_ops = 0;
    state.stats.ussr_us_ops = 0;
    state.stats.us_ussr_ops = 0;
    state.stats.ussr_ussr_ops = 0;
    state.stats.us_neutral_ops = 0;
    state.stats.ussr_neutral_ops = 0;
    state.stats.us_ops_spaced = 0;
    state.stats.ussr_ops_spaced = 0;
    state.stats.us_modified_ops = 0;
    state.stats.ussr_modified_ops = 0;
    state.stats.us_events_ops = 0;
    state.stats.ussr_events_ops = 0;
    state.stats.us_coups = [];
    state.stats.ussr_coups = [];
    state.stats.round = [];

    // events - early war
    state.events = {};
    state.events.optional = {};			// optional cards -- makes easier to search for
    state.events.cancelled = {};		// if entry exists, event is cancelled
    state.events.cancelled['solidarity'] = 1;   // solidarity starts cancelled
    state.events.formosan           = 0;
    state.events.redscare_player1   = 0;
    state.events.redscare_player2   = 0;
    state.events.containment        = 0;
    state.events.degaulle           = 0;
    state.events.nato               = 0;
    state.events.nato_westgermany   = 0;
    state.events.nato_france        = 0;
    state.events.marshall           = 0;
    state.events.warsawpact         = 0;
    state.events.unintervention     = 0;
    state.events.usjapan            = 0;
    state.events.norad              = 0;

    // regional bonus events
    state.events.vietnam_revolts     = 0;
    state.events.vietnam_revolts_eligible = 0;
    state.events.china_card          = 0;
    state.events.china_card_facedown = 0;
    state.events.china_card_in_play  = 0;
    state.events.china_card_eligible = 0;

    // events - mid-war
    state.events.northseaoil        = 0;
    state.events.johnpaul           = 0;
    state.events.ourmanintehran     = 0;
    state.events.kitchendebates     = 0;
    state.events.brezhnev           = 0;
    state.events.wwby               = 0;
    state.events.wwby_triggers      = 0;
    state.events.willybrandt        = 0;
    state.events.shuttlediplomacy   = 0;
    state.events.deathsquads        = 0;
    state.events.campdavid          = 0;
    state.events.cubanmissilecrisis = 0;
    state.events.saltnegotiations   = 0;
    state.events.missileenvy        = 0; // tracks whether happening
    state.events.missile_envy       = 0; // to whom
    state.events.flowerpower        = 0;
    state.events.beartrap           = 0;
    state.events.quagmire           = 0;

    // events - late war
    state.events.awacs              = 0;
    state.events.starwars           = 0;
    state.events.teardown           = 0;
    state.events.iranianhostage     = 0;
    state.events.ironlady           = 0;
    state.events.reformer           = 0;
    state.events.northseaoil        = 0;
    state.events.northseaoil_bonus  = 0;
    state.events.evilempire         = 0;
    state.events.yuri               = 0;
    state.events.aldrich            = 0;
    state.wargames_concession       = 6;

    //
    // events END OF HISTORY
    //
    state.events.inftreaty          = 0;


    //
    // events COLD WAR CRAZIES
    //
    state.events.communi          = 0;



    return state;

  }


  returnCountries() {

    var countries = {};

    // EUROPE
    countries['canada'] = { top : 752, left : 842 , us : 2 , ussr : 0 , control : 4 , bg : 0 , neighbours : [ 'uk' ] , region : "europe" , name : "Canada" };
    countries['uk'] = { top : 572, left : 1690 , us : 5 , ussr : 0 , control : 5 , bg : 0 , neighbours : [ 'canada','norway','benelux','france' ] , region : "europe" , name : "UK" };
    countries['benelux'] = { top : 728, left : 1860 , us : 0 , ussr : 0 , control : 3 , bg : 0 , neighbours : [ 'uk','westgermany' ] , region : "europe" , name : "Benelux" };
    countries['france'] = { top : 906, left : 1820 , us : 0 , ussr : 0 , control : 3 , bg : 1 , neighbours : [ 'algeria', 'uk','italy','spain','westgermany' ] , region : "europe" , name : "France" };
    countries['italy'] = { top : 1036, left : 2114 , us : 0 , ussr : 0 , control : 2 , bg : 1 , neighbours : [ 'spain','france','greece','austria','yugoslavia' ] , region : "europe" , name : "Italy" };
    countries['westgermany'] = { top : 728, left : 2078 , us : 0 , ussr : 0 , control : 4 , bg : 1 , neighbours : [ 'austria','france','benelux','denmark','eastgermany' ] , region : "europe" , name : "West Germany" };
    countries['eastgermany'] = { top : 580, left : 2156 , us : 0 , ussr : 3 , control : 3 , bg : 1 , neighbours : [ 'westgermany','poland','austria','czechoslovakia' ] , region : "europe" , name : "East Germany" };
    countries['poland'] = { top : 580, left : 2386 , us : 0 , ussr : 0 , control : 3 , bg : 1 , neighbours : [ 'eastgermany','czechoslovakia' ] , region : "europe" , name : "Poland" };
    countries['spain'] = { top : 1118, left : 1660 , us : 0 , ussr : 0 , control : 2 , bg : 0 , neighbours : [ 'morocco', 'france','italy' ] , region : "europe" , name : "Spain" };
    countries['greece'] = { top : 1200, left : 2392 , us : 0 , ussr : 0 , control : 2 , bg : 0 , neighbours : [ 'italy','turkey','yugoslavia','bulgaria' ] , region : "europe" , name : "Greece" };
    countries['turkey'] = { top : 1056, left : 2788 , us : 0 , ussr : 0 , control : 2 , bg : 0 , neighbours : [ 'syria', 'greece','romania','bulgaria' ] , region : "europe"  , name : "Turkey"};
    countries['yugoslavia'] = { top : 1038, left : 2342 , us : 0 , ussr : 0 , control : 3 , bg : 0 , neighbours : [ 'italy','hungary','romania','greece' ] , region : "europe" , name : "Yugoslavia" };
    countries['bulgaria'] = { top : 1038, left : 2570 , us : 0 , ussr : 0 , control : 3 , bg : 0 , neighbours : [ 'greece','turkey' ] , region : "europe" , name : "Bulgaria" };

    countries['romania'] = { top : 880, left : 2614 , us : 0 , ussr : 0 , control : 3 , bg : 0 , neighbours : [ 'turkey','hungary','yugoslavia' ] , region : "europe" , name : "Romania" };
    countries['hungary'] = { top : 880, left : 2394 , us : 0 , ussr : 0 , control : 3 , bg : 0 , neighbours : [ 'austria','czechoslovakia','romania','yugoslavia' ] , region : "europe" , name : "Hungary" };
    countries['austria'] = { top : 880, left : 2172 , us : 0 , ussr : 0 , control : 4 , bg : 0 , neighbours : [ 'hungary','italy','westgermany','eastgermany' ] , region : "europe" , name : "Austria" };
    countries['czechoslovakia'] = { top : 728, left : 2346 , us : 0 , ussr : 0 , control : 3 , bg : 0 , neighbours : [ 'hungary','poland','eastgermany' ] , region : "europe" , name : "Czechoslovakia" };
    countries['denmark'] = { top : 432, left : 1982 , us : 0 , ussr : 0 , control : 3 , bg : 0 , neighbours : [ 'sweden','westgermany' ] , region : "europe" , name : "Denmark" };
    countries['norway'] = { top : 278, left : 1932 , us : 0 , ussr : 0 , control : 4 , bg : 0 , neighbours : [ 'uk','sweden' ] , region : "europe" , name : "Norway" };
    countries['finland'] = { top : 286, left : 2522 , us : 0 , ussr : 1 , control : 4 , bg : 0 , neighbours : [ 'sweden' ] , region : "europe" , name : "Finland" };
    countries['sweden'] = { top : 410, left : 2234 , us : 0 , ussr : 0 , control : 4 , bg : 0 , neighbours : [ 'finland','denmark','norway' ] , region : "europe" , name : "Sweden" };

    // MIDDLE EAST
    countries['libya'] = { top : 1490, left : 2292, us : 0 , ussr : 0 , control : 2 , bg : 1 , neighbours : [ 'egypt','tunisia' ] , region : "mideast" , name : "Libya" };    countries['egypt'] = { top : 1510, left : 2520, us : 0 , ussr : 0 , control : 2 , bg : 1 , neighbours : [ 'libya','sudan','israel' ], region : "mideast"  , name : "Egypt"};
    countries['egypt'] = { top : 1510, left : 2520, us : 0 , ussr : 0 , control : 2 , bg : 1 , neighbours : [ 'libya','sudan','israel' ], region : "mideast"  , name : "Egypt"};
    countries['lebanon'] = { top : 1206, left : 2660, us : 0 , ussr : 0 , control : 1 , bg : 0 , neighbours : [ 'syria','jordan','israel' ], region : "mideast"  , name : "Lebanon"};
    countries['syria'] = { top : 1202, left : 2876, us : 0 , ussr : 1 , control : 2 , bg : 0 , neighbours : [ 'lebanon','turkey','israel' ], region : "mideast"  , name : "Syria"};
    countries['israel'] = { top : 1356, left : 2624, us : 1 , ussr : 0 , control : 4 , bg : 1 , neighbours : [ 'egypt','jordan','lebanon','syria' ], region : "mideast" , name : "Israel" };
    countries['iraq'] = { top : 1356, left : 2874, us : 0 , ussr : 1 , control : 3 , bg : 1 , neighbours : [ 'jordan','iran','gulfstates','saudiarabia' ], region : "mideast" , name : "Iraq" };
    countries['iran'] = { top : 1356, left : 3090, us : 1 , ussr : 0 , control : 2 , bg : 1 , neighbours : [ 'iraq','afghanistan','pakistan' ], region : "mideast" , name : "Iran" };
    countries['jordan'] = { top : 1508, left : 2766, us : 0 , ussr : 0 , control : 2 , bg : 0 , neighbours : [ 'israel','lebanon','iraq','saudiarabia' ], region : "mideast" , name : "Jordan" };
    countries['gulfstates'] = { top : 1504, left : 3014, us : 0 , ussr : 0 , control : 3 , bg : 0 , neighbours : [ 'iraq','saudiarabia' ], region : "mideast" , name : "Gulf States" };
    countries['saudiarabia'] = { top : 1654, left : 2952, us : 0 , ussr : 0 , control : 3 , bg : 1 , neighbours : [ 'jordan','iraq','gulfstates' ], region : "mideast" , name : "Saudi Arabia" };


    // ASIA
    countries['afghanistan'] = { top : 1256, left : 3346, us : 0 , ussr : 0 , control : 2 , bg : 0 , neighbours : [ 'iran','pakistan' ], region : "asia" , name : "Afghanistan" };
    countries['pakistan'] = { top : 1452, left : 3342, us : 0 , ussr : 0 , control : 2 , bg : 1 , neighbours : [ 'iran','afghanistan','india' ], region : "asia" , name : "Pakistan"}
    countries['india'] = { top : 1554, left : 3592, us : 0 , ussr : 0 , control : 3 , bg : 1 , neighbours : [ 'pakistan','burma' ], region : "asia" , name : "India"};
    countries['burma'] = { top : 1584, left : 3862, us : 0 , ussr : 0 , control : 2 , bg : 0 , neighbours : [ 'india','laos' ], region : "seasia" , name : "Burma"};
    countries['laos'] = { top : 1606, left : 4076, us : 0 , ussr : 0 , control : 1 , bg : 0 , neighbours : [ 'burma','thailand','vietnam' ], region : "seasia" , name : "Laos"};
    countries['thailand'] = { top : 1760, left : 3986, us : 0 , ussr : 0 , control : 2 , bg : 1 , neighbours : [ 'laos','vietnam','malaysia' ], region : "seasia" , name : "Thailand"};
    countries['vietnam'] = { top : 1762, left : 4206, us : 0 , ussr : 0 , control : 1 , bg : 0 , neighbours : [ 'laos','thailand' ], region : "seasia" , name : "Vietnam"};
    countries['malaysia'] = { top : 1994, left : 4086, us : 0 , ussr : 0 , control : 2 , bg : 0 , neighbours : [ 'thailand','australia','indonesia' ], region : "seasia" , name : "Malaysia"};
    countries['australia'] = { top : 2444, left : 4454, us : 4 , ussr : 0 , control : 4 , bg : 0 , neighbours : [ 'malaysia' ], region : "asia" , name : "Australia" };
    countries['indonesia'] = { top : 2178, left : 4450, us : 0 , ussr : 0 , control : 1 , bg : 0 , neighbours : [ 'malaysia','philippines' ], region : "seasia" , name : "Indonesia"};
    countries['philippines'] = { top : 1756, left : 4532, us : 1 , ussr : 0 , control : 2 , bg : 0 , neighbours : [ 'indonesia','japan' ], region : "seasia" , name : "Philippines"};
    countries['taiwan'] = { top : 1526, left : 4438, us : 0 , ussr : 0 , control : 3 , bg : 0 , neighbours : [ 'japan','southkorea' ], region : "asia" , name : "Taiwan"};
    countries['japan'] = { top : 1348, left : 4706, us : 1 , ussr : 0 , control : 4 , bg : 1 , neighbours : [ 'philippines','taiwan','southkorea' ], region : "asia" , name : "Japan"};
    countries['southkorea'] = { top : 1204, left : 4532, us : 1 , ussr : 0 , control : 3 , bg : 1 , neighbours : [ 'japan','taiwan','northkorea' ], region : "asia" , name : "South Korea"};
    countries['northkorea'] = { top : 1052, left : 4486, us : 0 , ussr : 3 , control : 3 , bg : 1 , neighbours : [ 'southkorea' ], region : "asia" , name : "North Korea"};



    // CENTRAL AMERICA
    countries['mexico'] = { top : 1370, left : 178, us : 0 , ussr : 0 , control : 2 , bg : 1 , neighbours : [ 'guatemala' ], region : "camerica" , name : "Mexico"};
    countries['guatemala'] = { top : 1528, left : 368, us : 0 , ussr : 0 , control : 1 , bg : 0 , neighbours : [ 'mexico','elsalvador','honduras' ], region : "camerica" , name : "Guatemala"};
    countries['elsalvador'] = { top : 1690, left : 296, us : 0 , ussr : 0 , control : 1 , bg : 0 , neighbours : [ 'honduras','guatemala' ], region : "camerica" , name : "El Salvador"};
    countries['honduras'] = { top : 1678, left : 518, us : 0 , ussr : 0 , control : 2 , bg : 0 , neighbours : [ 'nicaragua','costarica','guatemala','elsalvador' ], region : "camerica" , name : "Honduras"};
    countries['nicaragua'] = { top : 1678, left : 740, us : 0 , ussr : 0 , control : 1 , bg : 0 , neighbours : [ 'costarica','honduras','cuba' ], region : "camerica" , name : "Nicaragua"};
    countries['costarica'] = { top : 1832, left : 498, us : 0 , ussr : 0 , control : 3 , bg : 0 , neighbours : [ 'honduras', 'panama','nicaragua' ], region : "camerica" , name : "Costa Rica"};
    countries['panama'] = { top : 1828, left : 744, us : 1 , ussr : 0 , control : 2 , bg : 1 , neighbours : [ 'colombia','costarica' ], region : "camerica" , name : "Panama"};
    countries['cuba'] = { top : 1482, left : 754, us : 0 , ussr : 0 , control : 3 , bg : 1 , neighbours : [ 'haiti','nicaragua' ], region : "camerica" , name : "Cuba"};
    countries['haiti'] = { top : 1620, left : 970, us : 0 , ussr : 0 , control : 1 , bg : 0 , neighbours : [ 'cuba','dominicanrepublic' ], region : "camerica" , name : "Haiti"};
    countries['dominicanrepublic'] = { top : 1618, left : 1186, us : 0 , ussr : 0 , control : 1 , bg : 0 , neighbours : [ 'haiti' ], region : "camerica" , name : "Dominican Republic"};

    // SOUTH AMERICA
    countries['venezuela'] = { top : 1850, left : 1006, us : 0 , ussr : 0 , control : 2 , bg : 1 , neighbours : [ 'colombia','brazil' ], region : "samerica" , name : "Venezuela"};
    countries['colombia'] = { top : 2012, left : 886, us : 0 , ussr : 0 , control : 1 , bg : 0 , neighbours : [ 'panama','venezuela','ecuador' ], region : "samerica" , name : "Colombia"};
    countries['ecuador'] = { top : 2080, left : 654, us : 0 , ussr : 0 , control : 2 , bg : 0 , neighbours : [ 'peru','colombia' ], region : "samerica" , name : "Ecuador"};
    countries['peru'] = { top : 2248, left : 780, us : 0 , ussr : 0 , control : 2 , bg : 0 , neighbours : [ 'ecuador','chile','bolivia' ], region : "samerica" , name : "Peru"};
    countries['chile'] = { top : 2570, left : 888, us : 0 , ussr : 0 , control : 3 , bg : 1 , neighbours : [ 'peru','argentina' ], region : "samerica" , name : "Chile"};
    countries['bolivia'] = { top : 2386, left : 1010, us : 0 , ussr : 0 , control : 2 , bg : 0 , neighbours : [ 'paraguay','peru' ], region : "samerica" , name : "Bolivia"};
    countries['argentina'] = { top : 2862, left : 962, us : 0 , ussr : 0 , control : 2 , bg : 1 , neighbours : [ 'chile','uruguay','paraguay' ], region : "samerica" , name : "Argentina"};
    countries['paraguay'] = { top : 2552, left : 1136, us : 0 , ussr : 0 , control : 2 , bg : 0 , neighbours : [ 'uruguay','argentina','bolivia' ], region : "samerica" , name : "Paraguay"};
    countries['uruguay'] = { top : 2742, left : 1206, us : 0 , ussr : 0 , control : 2 , bg : 0 , neighbours : [ 'argentina','paraguay','brazil' ], region : "samerica" , name : "Uruguay"};
    countries['brazil'] = { top : 2232, left : 1390, us : 0 , ussr : 0 , control : 2 , bg : 1 , neighbours : [ 'uruguay','venezuela' ], region : "samerica" , name : "Brazil"};

    // AFRICA
    countries['morocco'] = { top : 1400, left : 1718, us : 0 , ussr : 0 , control : 3 , bg : 0 , neighbours : [ 'westafricanstates','algeria','spain' ], region : "africa" , name : "Morocco"};
    countries['algeria'] = { top : 1332, left : 1938, us : 0 , ussr : 0 , control : 2 , bg : 1 , neighbours : [ 'tunisia','morocco','france','saharanstates' ], region : "africa" , name : "Algeria"};
    countries['tunisia'] = { top : 1314, left : 2166, us : 0 , ussr : 0 , control : 2 , bg : 0 , neighbours : [ 'libya','algeria' ], region : "africa" , name : "Tunisia"};
    countries['westafricanstates'] = { top : 1596, left : 1696, us : 0 , ussr : 0 , control : 2 , bg : 0 , neighbours : [ 'ivorycoast','morocco' ], region : "africa" , name : "West African States"};
    countries['saharanstates'] = { top : 1650, left : 2028, us : 0 , ussr : 0 , control : 1 , bg : 0 , neighbours : [ 'algeria','nigeria' ], region : "africa" , name : "Saharan States"};
    countries['sudan'] = { top : 1690, left : 2556, us : 0 , ussr : 0 , control : 1 , bg : 0 , neighbours : [ 'egypt','ethiopia' ], region : "africa" , name : "Sudan"};
    countries['ivorycoast'] = { top : 1886, left : 1838, us : 0 , ussr : 0 , control : 2 , bg : 0 , neighbours : [ 'nigeria','westafricanstates' ], region : "africa" , name : "Ivory Coast"};
    countries['nigeria'] = { top : 1862, left : 2114, us : 0 , ussr : 0 , control : 1 , bg : 1 , neighbours : [ 'ivorycoast','cameroon','saharanstates' ], region : "africa" , name : "Nigeria"};
    countries['ethiopia'] = { top : 1846, left : 2712, us : 0 , ussr : 0 , control : 1 , bg : 0 , neighbours : [ 'sudan','somalia' ], region : "africa" , name : "Ethiopia"};
    countries['somalia'] = { top : 1914, left : 2956, us : 0 , ussr : 0 , control : 2 , bg : 0 , neighbours : [ 'ethiopia','kenya' ], region : "africa" , name : "Somalia"};
    countries['cameroon'] = { top : 2036, left : 2214, us : 0 , ussr : 0 , control : 1 , bg : 0 , neighbours : [ 'zaire','nigeria' ], region : "africa" , name : "Cameroon"};
    countries['zaire'] = { top : 2110, left : 2474, us : 0 , ussr : 0 , control : 1 , bg : 1 , neighbours : [ 'angola','zimbabwe','cameroon' ], region : "africa" , name : "Zaire"};
    countries['kenya'] = { top : 2046, left : 2738, us : 0 , ussr : 0 , control : 2 , bg : 0 , neighbours : [ 'seafricanstates','somalia' ], region : "africa" , name : "Kenya"};
    countries['angola'] = { top : 2290, left : 2282, us : 0 , ussr : 0 , control : 1 , bg : 1 , neighbours : [ 'southafrica','botswana','zaire' ], region : "africa" , name : "Angola"};
    countries['seafricanstates'] = { top : 2250, left : 2766, us : 0 , ussr : 0 , control : 1 , bg : 0 , neighbours : [ 'zimbabwe','kenya' ], region : "africa" , name : "Southeast African States"};
    countries['zimbabwe'] = { top : 2364, left : 2550, us : 0 , ussr : 0 , control : 1 , bg : 0 , neighbours : [ 'seafricanstates','botswana','zaire' ], region : "africa" , name : "Zimbabwe"};
    countries['botswana'] = { top : 2524, left : 2478, us : 0 , ussr : 0 , control : 2 , bg : 0 , neighbours : [ 'southafrica','angola','zimbabwe' ], region : "africa" , name : "Botswana"};
    countries['southafrica'] = { top : 2690, left : 2374, us : 1 , ussr : 0 , control : 3 , bg : 1 , neighbours : [ 'angola','botswana' ], region : "africa" , name : "South Africa"};

    for (var i in countries) { countries[i].place = 0; }

    return countries;

  }



  returnChinaCard() {
    return { img : "TNRnTS-06" , name : "China" , scoring : 0 , bg : 0 , player : "both" , recurring : 1 , ops : 4 };
  }


  returnAllCards(inc_optional=false) {
    // SAITO COMMUNITY
    let original_deck = this.game.options.deck;
    this.game.options.deck = "saito";
    let x = this.returnEarlyWarCards(inc_optional);
    let y = this.returnMidWarCards(inc_optional);
    let z = this.returnLateWarCards(inc_optional);
    let a = Object.assign({}, x, y);
    let b = Object.assign({}, a, z);
    b['china'] = this.returnChinaCard();
    this.game.options.deck = original_deck;
    return b;
  }

  resetBattlegroundCountries(region="") {
    for (let i in this.game.countries) {
      if (region == "") {
        this.game.countries[i].bg = this.countries[i].bg;
      } else {
        if (this.game.countries[i].region === region) { 
    	  this.game.countries[i].bg = this.countries[i].bg;
	    }
      }
    }
  }

  returnBattlegroundCountries() {
    let bgs = [];
    for (let i in this.countries) {
      if (this.countries[i].bg === 1) {
        bgs.push(i);
      }
    }
    return bgs;
  }

  returnEarlyWarCards(inc_optional=false) {

    let deck = {};

    // EARLY WAR
    deck['asia']            = { img : "TNRnTS-01" , name : "Asia Scoring", scoring : 1 , player : "both" , recurring : 1 , ops : 0 };
    deck['europe']          = { img : "TNRnTS-02" , name : "Europe Scoring", scoring : 1 , player : "both" , recurring : 1 , ops : 0 };
    deck['mideast']         = { img : "TNRnTS-03" , name : "Middle-East Scoring", scoring : 1 , player : "both" , recurring : 1 , ops : 0 };
    deck['duckandcover']    = { img : "TNRnTS-04" , name : "Duck and Cover", scoring : 0 , player : "us"   , recurring : 1 , ops : 3 };
    deck['fiveyearplan']    = { img : "TNRnTS-05" , name : "Five Year Plan", scoring : 0 , player : "us"   , recurring : 1 , ops : 3 };
    deck['socgov']          = { img : "TNRnTS-07" , name : "Socialist Governments", scoring : 0 , player : "ussr" , recurring : 1 , ops : 3 };
    if (this.game.options.deck === "saito") {
      deck['fidel']           = { img : "TNRnTS-234png" , name : "Fidel", scoring : 0 , player : "ussr" , recurring : 0 , ops : 2 };
    } else {
      deck['fidel']           = { img : "TNRnTS-08" , name : "Fidel", scoring : 0 , player : "ussr" , recurring : 0 , ops : 2 };
    }
    deck['vietnamrevolts']  = { img : "TNRnTS-09" , name : "Vietnam Revolts", scoring : 0 , player : "ussr" , recurring : 0 , ops : 2 };
    deck['blockade']        = { img : "TNRnTS-10" , name : "Blockade", scoring : 0 , player : "ussr" , recurring : 0 , ops : 1 };
    deck['koreanwar']       = { img : "TNRnTS-11" , name : "Korean War", scoring : 0 , player : "ussr" , recurring : 0 , ops : 2 };
    deck['romanianab']      = { img : "TNRnTS-12" , name : "Romanian Abdication", scoring : 0 , player : "ussr" , recurring : 0 , ops : 1 };
    deck['arabisraeli']     = { img : "TNRnTS-13" , name : "Arab-Israeli War", scoring : 0 , player : "ussr" , recurring : 1 , ops : 2 };
    deck['comecon']         = { img : "TNRnTS-14" , name : "Comecon", scoring : 0 , player : "ussr" , recurring : 0 , ops : 3 };
    deck['nasser']          = { img : "TNRnTS-15" , name : "Nasser", scoring : 0 , player : "ussr" , recurring : 0 , ops : 1 };
    deck['warsawpact']      = { img : "TNRnTS-16" , name : "Warsaw Pact", scoring : 0 , player : "ussr" , recurring : 0 , ops : 3 };
    deck['degaulle']        = { img : "TNRnTS-17" , name : "De Gaulle Leads France", scoring : 0 , player : "ussr" , recurring : 0 , ops : 3 };
    deck['naziscientist']   = { img : "TNRnTS-18" , name : "Nazi Scientist", scoring : 0 , player : "both" , recurring : 0 , ops : 1 };
    deck['truman']          = { img : "TNRnTS-19" , name : "Truman", scoring : 0 , player : "us"   , recurring : 0 , ops : 1 };
    deck['olympic']         = { img : "TNRnTS-20" , name : "Olympic Games", scoring : 0 , player : "both" , recurring : 1 , ops : 2 };
    if (this.game.options.deck === "saito") {
      deck['nato']            = { img : "TNRnTS-236png" , name : "NATO", scoring : 0 , player : "us"   , recurring : 0 , ops : 4 };
    } else {
      deck['nato']            = { img : "TNRnTS-21" , name : "NATO", scoring : 0 , player : "us"   , recurring : 0 , ops : 4 };
    }
    deck['indreds']         = { img : "TNRnTS-22" , name : "Independent Reds", scoring : 0 , player : "us"   , recurring : 0 , ops : 2 };
    deck['marshall']        = { img : "TNRnTS-23" , name : "Marshall Plan", scoring : 0 , player : "us"   , recurring : 0 , ops : 4 };
    deck['indopaki']        = { img : "TNRnTS-24" , name : "Indo-Pakistani War", scoring : 0 , player : "both" , recurring : 1 , ops : 2 };
    deck['containment']     = { img : "TNRnTS-25" , name : "Containment", scoring : 0 , player : "us"   , recurring : 0 , ops : 3 };
    if (this.game.options.deck === "saito") {
      deck['cia']             = { img : "TNRnTS-232png" , name : "CIA Created", scoring : 0 , player : "us"   , recurring : 0 , ops : 1 };
    } else {
      deck['cia']             = { img : "TNRnTS-26" , name : "CIA Created", scoring : 0 , player : "us"   , recurring : 0 , ops : 1 };
    }
    deck['usjapan']         = { img : "TNRnTS-27" , name : "US/Japan Defense Pact", scoring : 0 , player : "us"   , recurring : 0 , ops : 4 };
    deck['suezcrisis']      = { img : "TNRnTS-28" , name : "Suez Crisis", scoring : 0 , player : "ussr" , recurring : 0 , ops : 3 };
    deck['easteuropean']    = { img : "TNRnTS-29" , name : "East European Unrest", scoring : 0 , player : "us"   , recurring : 1 , ops : 3 };
    deck['decolonization']  = { img : "TNRnTS-30" , name : "Decolonization", scoring : 0 , player : "ussr" , recurring : 1 , ops : 2 };
    deck['redscare']        = { img : "TNRnTS-31" , name : "Red Scare", scoring : 0 , player : "both" , recurring : 1 , ops : 4 };
    deck['unintervention']  = { img : "TNRnTS-32" , name : "UN Intervention", scoring : 0 , player : "both" , recurring : 1 , ops : 1 };
    deck['destalinization'] = { img : "TNRnTS-33" , name : "Destalinization", scoring : 0 , player : "ussr" , recurring : 0 , ops : 3 };
    deck['nucleartestban']  = { img : "TNRnTS-34" , name : "Nuclear Test Ban Treaty", scoring : 0 , player : "both" , recurring : 1 , ops : 4 };
    deck['formosan']        = { img : "TNRnTS-35" , name : "Formosan Resolution", scoring : 0 , player : "us"   , recurring : 0 , ops : 2 };

    //
    // OPTIONS - we default to the expanded deck
    //
    if (this.game.options.deck != "original" ) {
      deck['defectors']       = { img : "TNRnTS-103" ,name : "Defectors", scoring : 0 , player : "us"   , recurring : 1 , ops : 2 };
      deck['cambridge']       = { img : "TNRnTS-104" ,name : "The Cambridge Five", scoring : 0 , player : "ussr"   , recurring : 1 , ops : 2 };
      deck['specialrelation'] = { img : "TNRnTS-105" ,name : "Special Relationship", scoring : 0 , player : "us"   , recurring : 1 , ops : 2 };
      deck['norad']           = { img : "TNRnTS-106" ,name : "NORAD", scoring : 0 , player : "us"   , recurring : 0 , ops : 3 };
    }
    
    if (inc_optional == true) {

      deck['culturaldiplomacy'] = { img : "TNRnTS-202png" , name : "Cultural Diplomacy", scoring : 0 , player : "both" , recurring : 1 , ops : 2 };
      deck['gouzenkoaffair'] = { img : "TNRnTS-204png" , name : "Gouzenko Affair", scoring : 0 , player : "ussr" , recurring : 0 , ops : 2 };
      deck['poliovaccine'] = { img : "TNRnTS-206png" , name : "Polio Vaccine", scoring : 0 , player : "both" , recurring : 0 , ops : 3 };

      // SAITO
      deck['unitedfruit']       = { img : "TNRnTS-207png" ,name : "United Fruit Company", scoring : 0 , player : "us"   , recurring : 1 , ops : 1 };
      deck['iranianultimatum']       = { img : "TNRnTS-210png" ,name : "Iranian Ultimatum", scoring : 0 , player : "us"   , recurring : 0 , ops : 3 };

      // END OF HISTORY
      deck['peronism']       = { img : "TNRnTS-307png" ,name : "Peronism", scoring : 0 , player : "both"   , recurring : 0 , ops : 1 };

      // COLD WAR CRAZIES 
      deck['berlinairlift']      	= { img : "TNRnTS-401png" ,name : "Berlin Airlift", scoring : 0 , player : "us"     , recurring : 0 , ops : 1 };
      deck['communistrevolution']       = { img : "TNRnTS-402png" ,name : "Communist Revolution", scoring : 0 , player : "ussr"   , recurring : 1 , ops : 2 };
      deck['philadelphia']      	= { img : "TNRnTS-403png" ,name : "Philadelphia Experiment", scoring : 0 , player : "us"     , recurring : 0 , ops : 3 };
      deck['sinoindian']                = { img : "TNRnTS-404png" ,name : "Sino-Indian War", scoring : 0 , player : "both"   , recurring : 1 , ops : 2 };
      deck['titostalin']                = { img : "TNRnTS-405png" ,name : "Tito-Stalin Split", scoring : 0 , player : "us"   , recurring : 1 , ops : 3 };

    } else {

      //
      // remove or add specified cards
      //
      if (this.game.options != undefined) {
        for (var key in this.game.options) {

          if (deck[key] != undefined) { delete deck[key]; }

          //
          // optional early war cards
          //
          if (key === "culturaldiplomacy") { deck['culturaldiplomacy'] = { img : "TNRnTS-202png" , name : "Cultural Diplomacy", scoring : 0 , player : "both" , recurring : 1 , ops : 2 }; }
          if (key === "gouzenkoaffair") { deck['gouzenkoaffair'] = { img : "TNRnTS-204png" , name : "Gouzenko Affair", scoring : 0 , player : "ussr" , recurring : 0 , ops : 2 }; }
          if (key === "poliovaccine") { deck['poliovaccine'] = { img : "TNRnTS-206png" , name : "Polio Vaccine", scoring : 0 , player : "both" , recurring : 0 , ops : 3 }; }
  
	  // SAITO
          if (key === "unitedfruit") { deck['unitedfruit']       = { img : "TNRnTS-207png" ,name : "United Fruit Company", scoring : 0 , player : "us"   , recurring : 1 , ops : 1 }; }
          if (key === "iranianultimatum") { deck['iranianultimatum']       = { img : "TNRnTS-210png" ,name : "Iranian Ultimatum", scoring : 0 , player : "us"   , recurring : 0 , ops : 3 }; }

	  // END OF HISTORY
          if (key === "peronism") { deck['peronism']       = { img : "TNRnTS-307png" ,name : "Peronism", scoring : 0 , player : "both"   , recurring : 0 , ops : 1 }; }

	  // COLD WAR CRAZIES
          if (key === "berlinairlift") { deck['berlinairlift']      	= { img : "TNRnTS-401png" ,name : "Berlin Airlift", scoring : 0 , player : "us"     , recurring : 0 , ops : 1 }; }
          if (key === "communistrevolution") { deck['communistrevolution']       = { img : "TNRnTS-402png" ,name : "Communist Revolution", scoring : 0 , player : "ussr"   , recurring : 1 , ops : 2 }; }
          if (key === "philadelphia") { deck['philadelphia']      	= { img : "TNRnTS-403png" ,name : "Philadelphia Experiment", scoring : 0 , player : "us"     , recurring : 0 , ops : 3 }; }
          if (key === "sinoindian") { deck['sinoindian']                = { img : "TNRnTS-404png" ,name : "Sino-Indian War", scoring : 0 , player : "both"   , recurring : 1 , ops : 2 }; }
          if (key === "titostalin") { deck['titostalin']                = { img : "TNRnTS-405png" ,name : "Tito-Stalin Split", scoring : 0 , player : "us"   , recurring : 1 , ops : 3 }; }

        }
      }
    } // inc_optional



    //
    // specify early-war period
    //
    for (var key in deck) { deck[key].p = 0; }

    return deck;

  }



  returnMidWarCards(inc_optional=false) {

    let deck = {};

    deck['brushwar']          = { img : "TNRnTS-36" , name : "Brush War", scoring : 0 , player : "both" , recurring : 1 , ops : 3 };
    deck['camerica']          = { img : "TNRnTS-37" , name : "Central America Scoring", scoring : 1 , player : "both" , recurring : 1 , ops : 0 };
    deck['seasia']            = { img : "TNRnTS-38" , name : "Southeast Asia Scoring", scoring : 1 , player : "both" , recurring : 0 , ops : 0 };
    deck['armsrace']          = { img : "TNRnTS-39" , name : "Arms Race", scoring : 0 , player : "both" , recurring : 1 , ops : 3 };
    if (this.game.options.deck === "saito") {
      deck['cubanmissile']      = { img : "TNRnTS-233png" , name : "Cuban Missile Crisis", scoring : 0 , player : "both" , recurring : 0 , ops : 3 };
    } else {
      deck['cubanmissile']      = { img : "TNRnTS-40" , name : "Cuban Missile Crisis", scoring : 0 , player : "both" , recurring : 0 , ops : 3 };
    }
    deck['nuclearsubs']       = { img : "TNRnTS-41" , name : "Nuclear Subs", scoring : 0 , player : "us" , recurring : 0 , ops : 2 };
    deck['quagmire']          = { img : "TNRnTS-42" , name : "Quagmire", scoring : 0 , player : "ussr" , recurring : 0 , ops : 3 };
    deck['saltnegotiations']  = { img : "TNRnTS-43" , name : "Salt Negotiations", scoring : 0 , player : "both" , recurring : 0 , ops : 3 };
    deck['beartrap']          = { img : "TNRnTS-44" , name : "Bear Trap", scoring : 0 , player : "us" , recurring : 0 , ops : 3 };
    deck['summit']            = { img : "TNRnTS-45" , name : "Summit", scoring : 0 , player : "both" , recurring : 1 , ops : 1 };
    deck['howilearned']       = { img : "TNRnTS-46" , name : "How I Learned to Stop Worrying", scoring : 0 , player : "both" , recurring : 0 , ops : 2 };
    deck['junta']             = { img : "TNRnTS-47" , name : "Junta", scoring : 0 , player : "both" , recurring : 1 , ops : 2 };
    deck['kitchendebates']    = { img : "TNRnTS-48" , name : "Kitchen Debates", scoring : 0 , player : "us" , recurring : 0 , ops : 1 };
    deck['missileenvy']       = { img : "TNRnTS-49" , name : "Missile Envy", scoring : 0 , player : "both" , recurring : 1 , ops : 2 };
    deck['wwby']              = { img : "TNRnTS-50" , name : "We Will Bury You", scoring : 0 , player : "ussr" , recurring : 0 , ops : 4 };
    deck['brezhnev']          = { img : "TNRnTS-51" , name : "Brezhnev Doctrine", scoring : 0 , player : "ussr" , recurring : 0 , ops : 3 };
    deck['portuguese']        = { img : "TNRnTS-52" , name : "Portuguese Empire Crumbles", scoring : 0 , player : "ussr" , recurring : 0 , ops : 2 };
    deck['southafrican']      = { img : "TNRnTS-53" , name : "South African Unrest", scoring : 0 , player : "ussr" , recurring : 1 , ops : 2 };
    deck['allende']           = { img : "TNRnTS-54" , name : "Allende", scoring : 0 , player : "ussr" , recurring : 0 , ops : 1 };
    deck['willybrandt']       = { img : "TNRnTS-55" , name : "Willy Brandt", scoring : 0 , player : "ussr" , recurring : 0 , ops : 2 };
    deck['muslimrevolution']  = { img : "TNRnTS-56" , name : "Muslim Revolution", scoring : 0 , player : "ussr" , recurring : 1 , ops : 4 };
    deck['abmtreaty']         = { img : "TNRnTS-57" , name : "ABM Treaty", scoring : 0 , player : "both" , recurring : 1 , ops : 4 };
    deck['culturalrev']       = { img : "TNRnTS-58" , name : "Cultural Revolution", scoring : 0 , player : "ussr" , recurring : 0 , ops : 3 };
    deck['flowerpower']       = { img : "TNRnTS-59" , name : "Flower Power", scoring : 0 , player : "ussr" , recurring : 0 , ops : 4 };
    deck['u2']                = { img : "TNRnTS-60" , name : "U2 Incident", scoring : 0 , player : "ussr" , recurring : 0 , ops : 3 };
    deck['opec']              = { img : "TNRnTS-61" , name : "OPEC", scoring : 0 , player : "ussr" , recurring : 1 , ops : 3 };
    deck['lonegunman']        = { img : "TNRnTS-62" , name : "Lone Gunman", scoring : 0 , player : "ussr" , recurring : 0 , ops : 1 };
    deck['colonial']          = { img : "TNRnTS-63" , name : "Colonial Rear Guards", scoring : 0 , player : "us" , recurring : 1 , ops : 2 };
    deck['panamacanal']       = { img : "TNRnTS-64" , name : "Panama Canal Returned", scoring : 0 , player : "us" , recurring : 0 , ops : 1 };
    deck['campdavid']         = { img : "TNRnTS-65" , name : "Camp David Accords", scoring : 0 , player : "us" , recurring : 0 , ops : 2 };
    deck['puppet']            = { img : "TNRnTS-66" , name : "Puppet Governments", scoring : 0 , player : "us" , recurring : 0 , ops : 2 };
    deck['grainsales']        = { img : "TNRnTS-67" , name : "Grain Sales to Soviets", scoring : 0 , player : "us" , recurring : 1 , ops : 2 };
    deck['johnpaul']          = { img : "TNRnTS-68" , name : "John Paul II Elected Pope", scoring : 0 , player : "us" , recurring : 0 , ops : 2 };
    deck['deathsquads']       = { img : "TNRnTS-69png" , name : "Latin American Death Squads", scoring : 0 , player : "both" , recurring : 1 , ops : 2 };
    deck['oas']               = { img : "TNRnTS-70" , name : "OAS Founded", scoring : 0 , player : "us" , recurring : 0 , ops : 1 };
    deck['nixon']             = { img : "TNRnTS-71" , name : "Nixon Plays the China Card", scoring : 0 , player : "us" , recurring : 0 , ops : 2 };
    deck['sadat']             = { img : "TNRnTS-72" , name : "Sadat Expels Soviets", scoring : 0 , player : "us" , recurring : 0 , ops : 1 };
    deck['shuttle']           = { img : "TNRnTS-73" , name : "Shuttle Diplomacy", scoring : 0 , player : "us" , recurring : 1 , ops : 3 };
    deck['voiceofamerica']    = { img : "TNRnTS-74" , name : "Voice of America", scoring : 0 , player : "us" , recurring : 1 , ops : 2 };
    if (this.game.options.deck === "saito") {
      deck['liberation']        = { img : "TNRnTS-235png" , name : "Liberation Theology", scoring : 0 , player : "ussr" , recurring : 1 , ops : 2 };
    } else {
      deck['liberation']        = { img : "TNRnTS-75" , name : "Liberation Theology", scoring : 0 , player : "ussr" , recurring : 1 , ops : 2 };
    }
    deck['ussuri']            = { img : "TNRnTS-76" , name : "Ussuri River Skirmish", scoring : 0 , player : "us" , recurring : 0 , ops : 3 };
    deck['asknot']            = { img : "TNRnTS-77" , name : "Ask Not What Your Country...", scoring : 0 , player : "us" , recurring : 0 , ops : 3 };
    deck['alliance']          = { img : "TNRnTS-78" , name : "Alliance for Progress", scoring : 0 , player : "us" , recurring : 0 , ops : 3 };
    deck['africa']            = { img : "TNRnTS-79" , name : "Africa Scoring", scoring : 1 , player : "both" , recurring : 1 , ops : 0 };
    deck['onesmallstep']      = { img : "TNRnTS-80" , name : "One Small Step", scoring : 0 , player : "both" , recurring : 1 , ops : 2 };
    deck['samerica']          = { img : "TNRnTS-81" , name : "South America Scoring", scoring : 1 , player : "both" , recurring : 1 , ops : 0 };

    //
    // OPTIONS - we default to the expanded deck
    //
    if (this.game.options.deck != "original" || inc_optional == true) {
      deck['che']               = { img : "TNRnTS-107" , name : "Che", scoring : 0 , player : "ussr" , recurring : 1 , ops : 3 };
      deck['tehran']            = { img : "TNRnTS-108" , name : "Our Man in Tehran", scoring : 0 , player : "us" , recurring : 0 , ops : 2 };
    }

    if (this.game.options.deck === "saito") {
      deck['che'] 	   		= { img : "TNRnTS-241png" ,name : "Che", scoring : 0 , player : "ussr"   , recurring : 0 , ops : 3 };
    }

    if (inc_optional == true) {

      //
      // optional midwar cards
      //

      // SAITO
      deck['berlinagreement'] 		= { img : "TNRnTS-217png" , name : "Berlin Agreement", scoring : 0 , player : "both" , recurring : 0 , ops : 3 };
      deck['pinochet']      		= { img : "TNRnTS-208png" ,name : "Pinochet", scoring : 0 , player : "us"   , recurring : 0 , ops : 2 };
      deck['tsarbomba']       		= { img : "TNRnTS-209png" ,name : "Tsar Bomba", scoring : 0 , player : "ussr"   , recurring : 0 , ops : 1 };
      deck['carterdoctrine']  		= { img : "TNRnTS-211png" ,name : "Carter Doctrine", scoring : 0 , player : "us"   , recurring : 0 , ops : 3 };
      deck['energycrisis']      	= { img : "TNRnTS-212png" ,name : "Energy Crisis", scoring : 0 , player : "ussr"   , recurring : 0 , ops : 3 };
      deck['nixonshock']       		= { img : "TNRnTS-213png" ,name : "Nixon Shock", scoring : 0 , player : "us"   , recurring : 0 , ops : 2 };
      deck['kissinger'] 	     	= { img : "TNRnTS-218png" ,name : "Kissinger Bombs Cambodia", scoring : 0 , player : "us"     , recurring : 1 , ops : 2 };
      //deck['handshake'] 		= { img : "TNRnTS-201png" , name : "Handshake in Space", scoring : 0 , player : "both" , recurring : 1 , ops : 2 };
      deck['fischerspassky']  		= { img : "TNRnTS-221png" ,name : "Fischer-Spassky", scoring : 0 , player : "both"   , recurring : 0 , ops : 3 };
      deck['sudan']       		= { img : "TNRnTS-219png" ,name : "Sudanese Civil War", scoring : 0 , player : "both"   , recurring : 0 , ops : 2 };
      deck['fallofsaigon']      	= { img : "TNRnTS-225png" ,name : "Fall of Saigon", scoring : 0 , player : "both"   , recurring : 0 , ops : 2 };
      deck['bayofpigs']       		= { img : "TNRnTS-222png" ,name : "Bay of Pigs", scoring : 0 , player : "ussr"   , recurring : 0 , ops : 2 };
      deck['august1968']       		= { img : "TNRnTS-220png" ,name : "August Protests", scoring : 0 , player : "ussr"   , recurring : 0 , ops : 3 };
      deck['khruschevthaw']    		= { img : "TNRnTS-230png" ,name : "Khruschev Thaw", scoring : 0 , player : "ussr"   , recurring : 0 , ops : 3 };

      // END OF HISTORY
      deck['manwhosavedtheworld']       = { img : "TNRnTS-301png" ,name : "The Man Who Saved the World", scoring : 0 , player : "both"   , recurring : 0 , ops : 4 };
      deck['breakthroughatlopnor']      = { img : "TNRnTS-302png" ,name : "Breakthrough at Lop Nor", scoring : 0 , player : "ussr"   , recurring : 0 , ops : 2 };
      deck['greatsociety']              = { img : "TNRnTS-303png" ,name : "Great Society", scoring : 0 , player : "us"   , recurring : 0 , ops : 2 };
      deck['nationbuilding']            = { img : "TNRnTS-304png" ,name : "Nation Building", scoring : 0 , player : "both"   , recurring : 1 , ops : 2 };
      deck['eurocommunism']             = { img : "TNRnTS-306png" ,name : "Eurocommunism", scoring : 0 , player : "us"   , recurring : 0 , ops : 3 };

    } else {

      //
      // remove any cards specified
      //
      if (this.game.options != undefined) {
        for (var key in this.game.options) {

          if (deck[key] != undefined) { delete deck[key]; }

	  // SAITO
          if (key === "berlinagreement") { deck['berlinagreement'] = { img : "TNRnTS-217png" , name : "Berlin Agreement", scoring : 0 , player : "both" , recurring : 0 , ops : 3 }; }
          if (key === "pinochet") { deck['pinochet']      	= { img : "TNRnTS-208png" ,name : "Pinochet", scoring : 0 , player : "us"   , recurring : 0 , ops : 2 }; }
          if (key === "tsarbomba") { deck['tsarbomba']       	= { img : "TNRnTS-209png" ,name : "Tsar Bomba", scoring : 0 , player : "ussr"   , recurring : 0 , ops : 1 }; }
          if (key === "carterdoctrine") { deck['carterdoctrine']  = { img : "TNRnTS-211png" ,name : "Carter Doctrine", scoring : 0 , player : "us"   , recurring : 0 , ops : 3 }; }
          if (key === "energycrisis") { deck['energycrisis']      = { img : "TNRnTS-212png" ,name : "Energy Crisis", scoring : 0 , player : "ussr"   , recurring : 0 , ops : 3 }; }
          if (key === "nixonshock") { deck['nixonshock']       	= { img : "TNRnTS-213png" ,name : "Nixon Shock", scoring : 0 , player : "us"   , recurring : 0 , ops : 2 }; }
          if (key === "kissinger") { deck['kissinger'] 	     	= { img : "TNRnTS-218png" ,name : "Kissinger Bombs Cambodia", scoring : 0 , player : "us"     , recurring : 1 , ops : 2 }; }
          if (key === "khruschevthaw") { deck['khruschevthaw'] 	     	= { img : "TNRnTS-230png" ,name : "Khrushchev Thaw", scoring : 0 , player : "ussr"     , recurring : 0 , ops : 3 }; }
          //if (key === "handshake") { deck['handshake'] 		= { img : "TNRnTS-201png" , name : "Handshake in Space", scoring : 0 , player : "both" , recurring : 1 , ops : 1 }; }
          if (key === "fischerspassky") { deck['fischerspassky']  = { img : "TNRnTS-221png" ,name : "Fischer-Spassky", scoring : 0 , player : "both"   , recurring : 0 , ops : 3 }; }
          if (key === "sudan") { deck['sudan']       		= { img : "TNRnTS-219png" ,name : "Sudanese Civil War", scoring : 0 , player : "both"   , recurring : 0 , ops : 2 }; }
          if (key === "fallofsaigon") { deck['fallofsaigon']      = { img : "TNRnTS-225png" ,name : "Fall of Saigon", scoring : 0 , player : "both"   , recurring : 0 , ops : 2 }; }
          if (key === "bayofpigs") { deck['bayofpigs']       	= { img : "TNRnTS-222png" ,name : "Bay of Pigs", scoring : 0 , player : "ussr"   , recurring : 0 , ops : 2 }; }
          if (key === "august1968") { deck['august1968']       	= { img : "TNRnTS-220png" ,name : "August Protests", scoring : 0 , player : "ussr"   , recurring : 0 , ops : 3 }; }

	  // END OF HISTORY
          if (key === "manwhosavedtheworld") { deck['manwhosavedtheworld']       = { img : "TNRnTS-301png" ,name : "The Man Who Saved the World", scoring : 0 , player : "both"   , recurring : 0 , ops : 4 }; }
          if (key === "breakthroughatlopnor") { deck['breakthroughatlopnor']      = { img : "TNRnTS-302png" ,name : "Breakthrough at Lop Nor", scoring : 0 , player : "ussr"   , recurring : 0 , ops : 2 }; }
          if (key === "greatsociety") { deck['greatsociety']              = { img : "TNRnTS-303png" ,name : "Great Society", scoring : 0 , player : "us"   , recurring : 0 , ops : 2 }; }
          if (key === "nationbuilding") { deck['nationbuilding']            = { img : "TNRnTS-304png" ,name : "Nation Building", scoring : 0 , player : "both"   , recurring : 1 , ops : 2 }; }
	  if (key === "eurocommunism") { deck['eurocommunism']             = { img : "TNRnTS-306png" ,name : "Eurocommunism", scoring : 0 , player : "us"   , recurring : 0 , ops : 3 }; }
        }
      }
    }

    for (var key in deck) { deck[key].p = 1; }

    return deck;

  }


  returnLateWarCards(inc_optional=false) {

    let deck = {};

    deck['iranianhostage']    = { img : "TNRnTS-82" , name : "Iranian Hostage Crisis", scoring : 0 , player : "ussr" , recurring : 0 , ops : 3 };
    deck['ironlady']          = { img : "TNRnTS-83" , name : "The Iron Lady", scoring : 0 , player : "us" , recurring : 0 , ops : 3 };
    deck['reagan']            = { img : "TNRnTS-84" , name : "Reagan Bombs Libya", scoring : 0 , player : "us" , recurring : 0 , ops : 2 };
    if (this.game.options.deck === "saito") {
      deck['starwars']          = { img : "TNRnTS-240png" , name : "Star Wars", scoring : 0 , player : "us" , recurring : 0 , ops : 2 };
    } else {
      deck['starwars']          = { img : "TNRnTS-85" , name : "Star Wars", scoring : 0 , player : "us" , recurring : 0 , ops : 2 };
    }
    deck['northseaoil']       = { img : "TNRnTS-86" , name : "North Sea Oil", scoring : 0 , player : "us" , recurring : 0 , ops : 3 };
    deck['reformer']          = { img : "TNRnTS-87" , name : "The Reformer", scoring : 0 , player : "ussr" , recurring : 0 , ops : 3 };
    deck['marine']            = { img : "TNRnTS-88" , name : "Marine Barracks Bombing", scoring : 0 , player : "ussr" , recurring : 0 , ops : 2 };
    if (this.game.options.deck === "saito") {
      deck['KAL007']            = { img : "TNRnTS-239png" , name : "Soviets Shoot Down KAL-007", scoring : 0 , player : "us" , recurring : 0 , ops : 4 };
    } else {
      deck['KAL007']            = { img : "TNRnTS-89" , name : "Soviets Shoot Down KAL-007", scoring : 0 , player : "us" , recurring : 0 , ops : 4 };
    }
    deck['glasnost']          = { img : "TNRnTS-90" , name : "Glasnost", scoring : 0 , player : "ussr" , recurring : 0 , ops : 4 };
    if (this.game.options.deck === "saito") {
      deck['ortega']            = { img : "TNRnTS-237png" , name : "Ortega Elected in Nicaragua", scoring : 0 , player : "ussr" , recurring : 0 , ops : 2 };
    } else {
      deck['ortega']            = { img : "TNRnTS-91" , name : "Ortega Elected in Nicaragua", scoring : 0 , player : "ussr" , recurring : 0 , ops : 2 };
    }
    deck['terrorism']         = { img : "TNRnTS-92" , name : "Terrorism", scoring : 0 , player : "both" , recurring : 1 , ops : 2 };
    deck['irancontra']        = { img : "TNRnTS-93" , name : "Iran Contra Scandal", scoring : 0 , player : "ussr" , recurring : 0 , ops : 2 };
    deck['chernobyl']         = { img : "TNRnTS-94" , name : "Chernobyl", scoring : 0 , player : "us" , recurring : 0 , ops : 3 };
    deck['debtcrisis']        = { img : "TNRnTS-95" , name : "Latin American Debt Crisis", scoring : 0 , player : "ussr" , recurring : 1 , ops : 2 };
    deck['teardown']          = { img : "TNRnTS-96" , name : "Tear Down this Wall", scoring : 0 , player : "us" , recurring : 0 , ops : 3 };
    deck['evilempire']        = { img : "TNRnTS-97" , name : "An Evil Empire", scoring : 0 , player : "us" , recurring : 0 , ops : 3 };
    deck['aldrichames']       = { img : "TNRnTS-98" , name : "Aldrich Ames Remix", scoring : 0 , player : "ussr" , recurring : 0 , ops : 3 };
    deck['pershing']          = { img : "TNRnTS-99" , name : "Pershing II Deployed", scoring : 0 , player : "ussr" , recurring : 0 , ops : 3 };
    deck['wargames']          = { img : "TNRnTS-100" , name : "Wargames", scoring : 0 , player : "both" , recurring : 0 , ops : 4 };
    if (this.game.options.deck === "saito") {
      deck['solidarity']        = { img : "TNRnTS-238png" , name : "Solidarity", scoring : 0 , player : "us" , recurring : 0 , ops : 2 };
    } else {
      deck['solidarity']        = { img : "TNRnTS-101" , name : "Solidarity", scoring : 0 , player : "us" , recurring : 0 , ops : 2 };
    }

    //
    // OPTIONS - we default to the expanded deck
    //
    if (this.game.options.deck != "original" || inc_optional == true) {
      deck['iraniraq']          = { img : "TNRnTS-102" , name : "Iran-Iraq War", scoring : 0 , player : "both" , recurring : 0 , ops : 2 };
      deck['yuri']              = { img : "TNRnTS-109" , name : "Yuri and Samantha", scoring : 0 , player : "ussr" , recurring : 0 , ops : 2 };
      deck['awacs']             = { img : "TNRnTS-110" , name : "AWACS Sale to Saudis", scoring : 0 , player : "us" , recurring : 0 , ops : 3 };
    }

    if (inc_optional == true) {

      // SAITO
      deck['antiapartheid']      = { img : "TNRnTS-214png" ,name : "Anti-Apartheid Movement", scoring : 0 , player : "ussr"   , recurring : 0 , ops : 2 };
      deck['samotlor']        	 = { img : "TNRnTS-215png" ,name : "Samotlor Oil Field", scoring : 0 , player : "ussr"   , recurring : 0 , ops : 3 };
      deck['rustinredsquare'] = { img : "TNRnTS-203png" , name : "Rust Lands in Red Square", scoring : 0 , player : "us" , recurring : 0 , ops : 1 };
      deck['revolutionsof1989'] = { img : "TNRnTS-216png" , name : "Revolutions of 1989", scoring : 0 , player : "us" , recurring : 0 , ops : 4 };
      deck['argo']       = { img : "TNRnTS-224png" ,name : "Argo", scoring : 0 , player : "us"   , recurring : 0 , ops : 2 };

      // END OF HISTORY
      deck['perestroika']       = { img : "TNRnTS-305png" ,name : "Perestroika", scoring : 0 , player : "ussr"   , recurring : 0 , ops : 3 };
      deck['inftreaty']         = { img : "TNRnTS-308png" ,name : "INF Treaty", scoring : 0 , player : "both"   , recurring : 0 , ops : 3 };

      // COLD WAR CRAZIES
      deck['sovietcoup']       = { img : "TNRnTS-405png" ,name : "Soviet Coup", scoring : 0 , player : "ussr"   , recurring : 0 , ops : 4 };    

      // TWILIGHT ABSURDUM
      deck['brexit'] 	     	= { img : "TNRnTS-501png" ,name : "Brexit", scoring : 0 , player : "both"     , recurring : 1 , ops : 4 };

    } else {

      //
      // remove any cards specified
      //
      if (this.game.options != undefined) {
        for (var key in this.game.options) {

          if (deck[key] != undefined) { delete deck[key]; }

          //
          // optional latewar cards
          //

	  // SAITO
          if (key === "antiapartheid") { deck['antiapartheid']      = { img : "TNRnTS-214png" ,name : "Anti-Apartheid Movement", scoring : 0 , player : "ussr"   , recurring : 0 , ops : 2 }; }
          if (key === "samotlor") { deck['samotlor']        	 = { img : "TNRnTS-215png" ,name : "Samotlor Oil Field", scoring : 0 , player : "ussr"   , recurring : 0 , ops : 3 }; }
          if (key === "rustinredsquare") { deck['rustinredsquare'] = { img : "TNRnTS-203png" , name : "Rust Lands in Red Square", scoring : 0 , player : "us" , recurring : 0 , ops : 1 }; }
          if (key === "revolutionsof1989") { deck['revolutionsof1989'] = { img : "TNRnTS-216png" , name : "Revolutions of 1989", scoring : 0 , player : "us" , recurring : 0 , ops : 4 }; }
          if (key === "argo") { deck['argo']       = { img : "TNRnTS-224png" ,name : "Argo", scoring : 0 , player : "us"   , recurring : 0 , ops : 2 }; }

          // END OF HISTORY
          if (key === "perestroika") { deck['perestroika']       = { img : "TNRnTS-305png" ,name : "Perestroika", scoring : 0 , player : "ussr"   , recurring : 0 , ops : 3 }; }
          if (key === "inftreaty") { deck['inftreaty']         = { img : "TNRnTS-308png" ,name : "INF Treaty", scoring : 0 , player : "both"   , recurring : 0 , ops : 3 }; }

          // COLD WAR CRAZIES
          if (key === "sovietcoup") { deck['sovietcoup']       = { img : "TNRnTS-405png" ,name : "Soviet Coup", scoring : 0 , player : "ussr"   , recurring : 0 , ops : 4 }; }

          // TWILIGHT ABSURDUM
          if (key === "brexit") { deck['brexit'] 	     	= { img : "TNRnTS-501png" ,name : "Brexit", scoring : 0 , player : "both"     , recurring : 1 , ops : 4 }; }

        }
      }
    }


    //
    // specify early-war period
    //
    for (var key in deck) { deck[key].p = 2; }

    return deck;

  }



  returnUnplayedCards() {

    var unplayed = {};
    for (let i in this.game.deck[0].cards) {
      unplayed[i] = this.game.deck[0].cards[i];
    }
    for (let i in this.game.deck[0].discards) {
      delete unplayed[i];
    }
    for (let i in this.game.deck[0].removed) {
      delete unplayed[i];
    }
    for (let i = 0; i < this.game.deck[0].hand.length; i++) {
      delete unplayed[this.game.deck[0].hand[i]];
    }

    return unplayed;

  }






  whoControls(country){
    let cobj = this.countries[country];
    if (!cobj){
      return "";
    }
    if ((cobj.ussr - cobj.us) >= cobj.control){
      return "ussr";
    }
    if ((cobj.us - cobj.ussr) >= cobj.control){
      return "us";
    }
    return "";
  }

  isControlled(player, country) {

    if (this.countries[country] == undefined) { return 0; }

    let country_lead = 0;

    if (player == "ussr") {
      country_lead = parseInt(this.countries[country].ussr) - parseInt(this.countries[country].us);
    }
    if (player == "us") {
      country_lead = parseInt(this.countries[country].us) - parseInt(this.countries[country].ussr);
    }

    if (this.countries[country].control <= country_lead) { return 1; }
    return 0;

  }



  returnOpsOfCard(card="", deck=0) {
    if (this.game.deck[deck].cards[card] != undefined) {
      return this.game.deck[deck].cards[card].ops;
    }
    if (this.game.deck[deck].discards[card] != undefined) {
      return this.game.deck[deck].discards[card].ops;
    }
    if (this.game.deck[deck].removed[card] != undefined) {
      return this.game.deck[deck].removed[card].ops;
    }
    if (card == "china") { return 4; }
    return 1;
  }


  returnArrayOfRegionBonuses(card="") {

    let regions = [];

    //
    // Vietnam Revolts
    //
    if (this.game.state.events.vietnam_revolts == 1 && this.game.state.events.vietnam_revolts_eligible == 1 && this.game.player == 1) {

      //
      // Vietnam Revolts does not give bonus to 1 OP card in SEA if USSR Red Purged
      // https://boardgamegeek.com/thread/1136951/red-scarepurge-and-vietnam-revolts
      //
      let pushme = 1;
      if (card != "") {
        if (this.game.state.events.redscare_player1 >= 1) {
          if (this.returnOpsOfCard(card) == 1) { pushme = 0; }
        }
      }
      if (pushme == 1) {
        regions.push("seasia");
      }
    }

    //
    // The China Card
    //
    if (this.game.state.events.china_card_in_play == 1 && this.game.state.events.china_card_eligible == 1) {
      regions.push("asia");
    }

    return regions;

  }





  isRegionBonus(card="") {

    //
    // Vietnam Revolts
    //
    if (this.game.state.events.vietnam_revolts == 1 && this.game.state.events.vietnam_revolts_eligible == 1 && this.game.player == 1) {
      //
      // Vietnam Revolts does not give bonus to 1 OP card in SEA if USSR Red Purged
      // https://boardgamegeek.com/thread/1136951/red-scarepurge-and-vietnam-revolts
      if (card != "") { if (this.returnOpsOfCard(card) == 1 && this.game.state.events.redscare_player1 >= 1) { return 0; } }

      this.cancelBackButtonFunction();
      this.updateStatus("Extra 1 OP Available for Southeast Asia");
      this.game.state.events.region_bonus = "seasia";
      return 1;
    }

    //
    // The China Card
    //
    if (this.game.state.events.china_card_in_play == 1 && this.game.state.events.china_card_eligible == 1) {

      this.cancelBackButtonFunction();
      this.updateStatus("Extra 1 OP Available for Asia");
      this.game.state.events.region_bonus = "asia";
      return 1;
    }
    return 0;
  }




  endRegionBonus() {
    if (this.game.state.events.vietnam_revolts_eligible == 1 && this.game.state.events.vietnam_revolts == 1) {
      this.game.state.events.vietnam_revolts_eligible = 0;
      return;
    }
    if (this.game.state.events.china_card_in_play == 1 && this.game.state.events.china_card_eligible == 1) {
      this.game.state.events.china_card_eligible = 0;
      return;
    }
  }



  limitToRegionBonus() {
    for (var i in this.countries) {
      if (this.countries[i].region.indexOf(this.game.state.events.region_bonus) == -1) {
        let divname = '#'+i;
        $(divname).off();
      } else {

        //Go ahead an remove opponent controlled countries if we don't have both in favor
        if (this.game.state.events.region_bonus == "asia" || this.game.state.events.china_card_in_play == 0) {
          if (this.game.player == 1) {
            // prevent breaking control
            if (this.isControlled("us", i) == 1) {
              let divname = '#'+i;
              $(divname).off();
            }
          } else {
            // prevent breaking control
            if (this.isControlled("ussr", i) == 1) {
              let divname = '#'+i;
              $(divname).off();
            }
          }
        }
      }

    }
    return;
  }


  /*
   Check various states that affect player's operation points values
  */
  modifyOps(ops, card="",player="", updatelog=1) {

    /* Do we really want to always override the ops passed in??*/
    // probably not, just check with card if ops are undefined ? see if this breaks first
    if (card == "olympic" && ops == 4) {} else {
      if (card != "") { ops = this.returnOpsOfCard(card); }
    }

    if (this.game.state.events.brezhnev == 1 && player === "ussr") {
      if (updatelog == 1) { this.updateLog("USSR gets Brezhnev bonus +1");  }
      ops++;
    }

    if (this.game.state.events.containment == 1 && player === "us") {
      if (updatelog == 1) { this.updateLog("US gets Containment bonus +1");  }
      ops++;
    }

    if (player === 1) { player = "ussr"; }
    if (player === 2) { player = "us"; }
    if (player === "") {
      if (this.game.player == 1) { player = "ussr"; }
      if (this.game.player == 2) { player = "us"; }
    }

    if (this.game.state.events.redscare_player1 >= 1 && player === "ussr") {
      if (updatelog == 1) {
        if (this.game.state.events.redscare_player1 == 1) {
          this.updateLog("USSR is affected by Red Purge");
        } else {
          this.updateLog("USSR is really affected by Red Purge");
        }
      }
      ops -= this.game.state.events.redscare_player1;
    }

    if (this.game.state.events.redscare_player2 >= 1 && player === "us") {
      if (updatelog == 1) {
        if (this.game.state.events.redscare_player2 == 1) {
          this.updateLog("US is affected by Red Scare");
        } else {
          this.updateLog("US is really affected by Red Scare");
        }
      }
      ops -= this.game.state.events.redscare_player2;
    }

    if (ops <= 0) { return 1; }
    if (ops >= 4) { return 4; }

    return ops;
  }



  finalScoring() {

    //
    // disable shuttle diplomacy
    //
    this.game.state.events.shuttlediplomacy = 0;

    //
    // disable kissinger - SAITO COMMUNITY
    //
    this.game.state.events.kissinger = "";

    //
    //
    //
    if (this.whoHasTheChinaCard() == "ussr") {
      this.game.state.vp--;
      this.updateLog("USSR receives 1 VP for the China Card");
      if (this.game.state.vp <= -20) {
        this.sendGameOverTransaction(this.game.players[0], "victory points");
        return;
      }
    } else {
      this.game.state.vp++;
      this.updateLog("US receives 1 VP for the China Card");
      if (this.game.state.vp >= 20) {
        this.sendGameOverTransaction(this.game.players[1], "victory points");
        return;
      }
    }

    let vp_adjustment = 0;
    let total_vp = 0;

    vp_adjustment = this.calculateScoring("europe");
    total_vp = vp_adjustment.us.vp - vp_adjustment.ussr.vp;
    this.game.state.vp += total_vp;
    this.updateLog("Europe: " + total_vp + " VP");

    vp_adjustment = this.calculateScoring("asia");
    total_vp = vp_adjustment.us.vp - vp_adjustment.ussr.vp;
    this.game.state.vp += total_vp;
    this.updateLog("Asia: " + total_vp + " VP");

    vp_adjustment = this.calculateScoring("mideast");
    total_vp = vp_adjustment.us.vp - vp_adjustment.ussr.vp;
    this.game.state.vp += total_vp;
    this.updateLog("Middle East: " + total_vp + " VP");

    vp_adjustment = this.calculateScoring("africa");
    total_vp = vp_adjustment.us.vp - vp_adjustment.ussr.vp;
    this.game.state.vp += total_vp;
    this.updateLog("Africa: " + total_vp + " VP");

    vp_adjustment = this.calculateScoring("samerica");
    total_vp = vp_adjustment.us.vp - vp_adjustment.ussr.vp;
    this.game.state.vp += total_vp;
    this.updateLog("South America: " + total_vp + " VP");

    vp_adjustment = this.calculateScoring("camerica");
    total_vp = vp_adjustment.us.vp - vp_adjustment.ussr.vp;
    this.game.state.vp += total_vp;
    this.updateLog("Central America: " + total_vp + " VP");

    this.updateVictoryPoints();

    //
    // late-war scenario
    //
    if (this.game.options.deck === "late-war") {
      if (this.game.state.vp < 20) {
        this.sendGameOverTransaction(this.game.players[0], "final scoring");
      } else {
        this.sendGameOverTransaction(this.game.players[1], "final scoring");
      }
    }

    //
    // normal game
    //
    if (this.game.state.vp == 0) {
      this.sendGameOverTransaction(this.game.players, "tie");
      return 1;
    }
    if (this.game.state.vp < 0) {
      this.sendGameOverTransaction(this.game.players[0], "final scoring");
    } else {
      this.sendGameOverTransaction(this.game.players[1], "final scoring");
    }

    return 1;
  }



  calculateControlledBattlegroundCountries(scoring, bg_countries) {
    for (var [player, side] of Object.entries(scoring)) {
      for (var country of bg_countries) {
        if (this.isControlled(player, country) == 1) { side.bg++; side.total++;}
      }
    }
    return scoring;
  }

  calculateControlledCountries(scoring, countries) {
    for (var [player, side] of Object.entries(scoring)) {
      for (var country of countries) {
        if (this.isControlled(player, country) == 1) { side.total++; };
      }
    }
    return scoring;
  }

  determineRegionVictor(scoring, region_scoring_range, max_bg_num, region="") {

    // SAITO COMMUNITY
    if (scoring.us.bg == max_bg_num && scoring.us.total > scoring.ussr.total) { 
      scoring.us.vp = region_scoring_range.control; 
      scoring.us.status = "Control";
      if (this.game.state.events.fischerspassky === region) {
        scoring.us.vp = region_scoring_range.domination; 
        scoring.us.status = "Domination";
      }
    }else if (scoring.us.bg > scoring.ussr.bg  && scoring.us.total > scoring.ussr.total && scoring.us.total > scoring.us.bg) { 
      scoring.us.vp = region_scoring_range.domination; 
      scoring.us.status = "Domination";
      if (this.game.state.events.fischerspassky === region) {
        scoring.us.vp = region_scoring_range.presence; 
        scoring.us.status = "Presence";
      }
    }else if (scoring.us.total + scoring.us.bg > 0) { 
      scoring.us.vp = region_scoring_range.presence; 
      scoring.us.status = "Presence";
    }else{
      scoring.us.status = "None";
    }

    if (scoring.ussr.bg == max_bg_num && scoring.ussr.total > scoring.us.total) {
      scoring.ussr.vp = region_scoring_range.control;
      scoring.ussr.status = "Control"; 
      if (this.game.state.events.fischerspassky === region) {
        scoring.ussr.vp = region_scoring_range.domination; 
        scoring.ussr.status = "Domination";
      }
    }else if (scoring.ussr.bg > scoring.us.bg && scoring.ussr.total > scoring.us.total && scoring.ussr.total > scoring.ussr.bg) { 
      scoring.ussr.vp = region_scoring_range.domination; 
      scoring.ussr.status = "Domination";
      if (this.game.state.events.fischerspassky === region) {
        scoring.ussr.vp = region_scoring_range.presence; 
        scoring.ussr.status = "Presence";
      }
    }else if (scoring.ussr.total + scoring.ussr.bg > 0) { 
      scoring.ussr.vp = region_scoring_range.presence; 
      scoring.ussr.status = "Presence";
    }else{
      scoring.ussr.status = "None";
    }

    scoring.us.vp = scoring.us.vp + scoring.us.bg;
    scoring.ussr.vp = scoring.ussr.vp + scoring.ussr.bg;

    return scoring;
  }


  calculateScoring(region, mouseover_preview=0) {

    var scoring = {
      us: {total: 0, bg: 0, vp: 0},
      ussr: {total: 0, bg: 0, vp: 0},
      bonus: [],
    }

    let bg_countries = [];
    let non_bg_countries = [];
    let scoring_range = {presence: 0, domination: 0, control: 0};

    for (let i in this.game.countries) {
      if (this.game.countries[i].region.includes(region)) {
        if (this.game.countries[i].bg === 1) {
          bg_countries.push(i);
        } else {
          non_bg_countries.push(i);
        }
      }
    }

    // skip for SEASIA (special case)
    if (region !== "seasia") {
      scoring = this.calculateControlledBattlegroundCountries(scoring, bg_countries); //fill in scoring.us/ussr.bg
      scoring = this.calculateControlledCountries(scoring, non_bg_countries);         //fill in scoring.us/ussr.total
    }

    switch (region) {

      ////////////
      // EUROPE //
      ////////////
      case "europe":

        scoring_range = {presence: 3, domination: 7, control: 10000 };
        scoring = this.determineRegionVictor(scoring, scoring_range, bg_countries.length, region);

        //
        // neighbouring countries
        //
        scoring.us.neigh = [];
        scoring.ussr.neigh = [];

        if (this.isControlled("us", "finland") == 1) {
	  scoring.us.vp++;
	  scoring.us.neigh.push("finland");
	  scoring.bonus.push({ side : "us" , name : "Adjacency" , desc : "US +1 for Finland" , icon : "/twilight/img/adjacency.png" });
	}
        if (this.isControlled("us", "romania") == 1) {
	  scoring.us.vp++;
	  scoring.us.neigh.push("romania");
	  scoring.bonus.push({ side : "us" , name : "Adjacency" , desc : "US +1 for Romania" , icon : "/twilight/img/adjacency.png" });
	}
        if (this.isControlled("us", "poland") == 1) {
	  scoring.us.vp++;
	  scoring.us.neigh.push("poland");
	  scoring.bonus.push({ side : "us" , name : "Adjacency" , desc : "US +1 for Poland" , icon : "/twilight/img/adjacency.png" });
	}
        if (this.isControlled("ussr", "canada") == 1) {
	  scoring.ussr.vp++;
	  scoring.ussr.neigh.push("canada");
	  scoring.bonus.push({ side : "ussr" , name : "Adjacency" , desc : "USSR +1 for Canada" , icon : "/twilight/img/adjacency.png" });
	}

        //
        // GOUZENKO AFFAIR -- early war optional
        //
        if (this.game.state.events.optional.gouzenkoaffair == 1) {
          if (this.isControlled("us", "canada") == 1) {
	    vp_us++;
	    scoring.us.neigh.push("canada");
	    scoring.bonus.push({ side : "us" , name : "Gouzenko Affair" , desc : "US +1 for Canada-USSR adjacency" , icon : "/twilight/img/adjacency.png"});
	  }
        }

        if (mouseover_preview != 1) { this.resetBattlegroundCountries(region); }

        break;

      /////////////
      // MIDEAST //
      /////////////
      case "mideast":

        scoring_range = { presence: 3, domination: 5, control: 7 };

        //
        // Shuttle Diplomacy
        //
        if (this.game.state.events.shuttlediplomacy == 1) {
	  scoring.bonus.push({ side : "us" , name : "Shuttle Diplomacy" , desc : "USSR -1 battleground" , icon : "/twilight/img/Event73.png" });
          if (scoring.ussr.bg > 0) {
            scoring.ussr.bg--;
            scoring.ussr.total--;
          }
          if (mouseover_preview == 0) { //commit score
            scoring.shuttle = 1;
            this.game.state.events.shuttlediplomacy = 0;
      	    this.game.deck[0].discards['shuttle'] = this.game.deck[0].cards['shuttle'];
          }
        }

        scoring = this.determineRegionVictor(scoring, scoring_range, bg_countries.length, region);

        if (mouseover_preview != 1) { this.resetBattlegroundCountries(region); }

        break;

      /////////////
      // SE ASIA //
      /////////////
      case "seasia":
        let seasia_countries = ["burma","laos", "vietnam", "malaysia", "philippines", "indonesia"];

        for (let country of seasia_countries) {
          for (var [player, side] of Object.entries(scoring)) {
            if (this.isControlled(player, country) == 1) { side.total++; }
          }
        }
        switch (this.whoControls("thailand")){
          case "us": scoring.us.total += 2; scoring.us.bg = 1; scoring.us.status = "Thailand"; break;
          case "ussr": scoring.ussr.total += 2; scoring.ussr.bg = 1; scoring.ussr.status = "Thailand"; break;
        }

        scoring.us.vp += scoring.us.total;
        scoring.ussr.vp += scoring.ussr.total;
        break;


      /////////////
      // AFRICA  //
      /////////////
      case "africa":

        scoring_range = {presence: 1, domination: 4, control: 6 };

        scoring = this.determineRegionVictor(scoring, scoring_range, bg_countries.length, region);

        if (mouseover_preview != 1) { this.resetBattlegroundCountries(region); }

        break;

      /////////////////////
      // CENTRAL AMERICA //
      /////////////////////
      case "camerica":
        scoring_range = {presence: 1, domination: 3, control: 5};

        scoring = this.determineRegionVictor(scoring, scoring_range, bg_countries.length, region);

        // neighbouring countries
        scoring.us.neigh = [];
        scoring.ussr.neigh = [];

        if (this.isControlled("ussr", "mexico") == 1) {
	  scoring.ussr.vp++;
	  scoring.ussr.neigh.push("mexico");
	  scoring.bonus.push({ side : "ussr" , name : "Adjacency" , desc : "USSR +1 for Mexico" , icon : "/twilight/img/adjacency.png" });
	}
        if (this.isControlled("ussr", "cuba") == 1) {
	  scoring.ussr.vp++;
	  scoring.ussr.neigh.push("cuba");
	  scoring.bonus.push({ side : "ussr" , name : "Adjacency" , desc : "USSR +1 for Cuba" , icon : "/twilight/img/adjacency.png" });
	}

        if (mouseover_preview != 1) { this.resetBattlegroundCountries(region); }

        break;

      ///////////////////
      // SOUTH AMERICA //
      ///////////////////
      case "samerica":
        scoring_range = {presence: 2, domination: 5, control: 6};

        scoring = this.determineRegionVictor(scoring, scoring_range, bg_countries.length, region);

        if (mouseover_preview != 1) { this.resetBattlegroundCountries(region); }

        break;

      //////////
      // ASIA //
      //////////
      case "asia":

        //move Taiwan to BG if necessay
        if (this.game.state.events.formosan == 1 && this.isControlled("us", "taiwan") == 1) {
          bg_countries.push("taiwan");
          scoring.us.bg++;
	  scoring.bonus.push({ side : "us" , name : "Formosan Resolution" , desc : "US +1 battleground country" , icon : "/twilight/img/Event35.svg" });
        }

        scoring_range = {presence: 3, domination: 7, control: 9};

        ///////////////////////
        // Shuttle Diplomacy //
        ///////////////////////
        if (this.game.state.events.shuttlediplomacy == 1) {
	  scoring.bonus.push({ side : "us" , name : "Shuttle Diplomacy" , desc : "USSR -1 battleground" , icon : "/twilight/img/Event73.png" });
          if (scoring.ussr.bg > 0) {
            scoring.ussr.bg--;
            scoring.ussr.total--;
          }

          scoring.shuttle = 1;

          if (mouseover_preview == 0) {
            this.game.state.events.shuttlediplomacy = 0;
      	    this.game.deck[0].discards['shuttle'] = this.game.deck[0].cards['shuttle'];
          }

      	}

        scoring = this.determineRegionVictor(scoring, scoring_range, bg_countries.length, region);	

        //
        // neighbouring countries
        //
        scoring.us.neigh = [];
        scoring.ussr.neigh = [];

        if (this.isControlled("us", "afghanistan") == 1) {
	  scoring.us.vp++;
	  scoring.us.neigh.push("afghanistan");
	  scoring.bonus.push({ side : "us" , name : "Adjacency" , desc : "US +1 for Afghanistan" , icon : "/twilight/img/adjacency.png" });
	}
        if (this.isControlled("us", "northkorea") == 1) {
	  scoring.us.vp++;
	  scoring.us.neigh.push("northkorea");
	  scoring.bonus.push({ side : "us" , name : "Adjacency" , desc : "US +1 for North Korea" , icon : "/twilight/img/adjacency.png" });
	}
        if (this.isControlled("ussr", "japan") == 1) {
          if (this.game.state.events.shuttlediplomacy == 1) {
            this.updateLog("USSR loses Japan/US-adjacency with Shuttle Diplomacy");
  	  } else {
  	    scoring.ussr.vp++;
            scoring.ussr.neigh.push("japan");
	    scoring.bonus.push({ side : "ussr" , name : "Adjacency" , desc : "USSR +1 for Japan" , icon : "/twilight/img/adjacency.png" });
	  }
	}

        if (mouseover_preview != 1) { 
	  // SAITO COMMUNITY
	  if (region === this.game.state.events.kissinger) { this.game.state.events.kissinger = ""; }
	  if (region === this.game.state.events.fischerspassky) {
	    this.updateLog("Region Scoring Adjusted by Fischer-Spassky...");
	    this.game.state.events.fischerspassky = "";
	  }
	  this.resetBattlegroundCountries(region); 
	}

        break;
      }


    return scoring;

  }


  /*
  Necessary for summit card -- note formosan revolution adjacency not counted
  */
  doesPlayerDominateRegionForSummit(player, region) {

    let total_us = 0;
    let total_ussr = 0;
    let bg_us = 0;
    let bg_ussr = 0;
    let vp_us = 0;
    let vp_ussr = 0;


    ////////////
    // EUROPE //
    ////////////
    if (region === "europe") {

      if (this.isControlled("us", "italy") == 1) { bg_us++; }
      if (this.isControlled("ussr", "italy") == 1) { bg_ussr++; }
      if (this.isControlled("us", "france") == 1) { bg_us++; }
      if (this.isControlled("ussr", "france") == 1) { bg_ussr++; }
      if (this.isControlled("us", "westgermany") == 1) { bg_us++; }
      if (this.isControlled("ussr", "westgermany") == 1) { bg_ussr++; }
      if (this.isControlled("us", "eastgermany") == 1) { bg_us++; }
      if (this.isControlled("ussr", "eastgermany") == 1) { bg_ussr++; }
      if (this.isControlled("us", "poland") == 1) { bg_us++; }
      if (this.isControlled("ussr", "poland") == 1) { bg_ussr++; }

      total_us = bg_us;
      total_ussr = bg_ussr;

      if (this.isControlled("us", "spain") == 1) { total_us++; }
      if (this.isControlled("ussr", "spain") == 1) { total_ussr++; }
      if (this.isControlled("us", "greece") == 1) { total_us++; }
      if (this.isControlled("ussr", "greece") == 1) { total_ussr++; }
      if (this.isControlled("us", "turkey") == 1) { total_us++; }
      if (this.isControlled("ussr", "turkey") == 1) { total_ussr++; }
      if (this.isControlled("us", "yugoslavia") == 1) { total_us++; }
      if (this.isControlled("ussr", "yugoslavia") == 1) { total_ussr++; }
      if (this.isControlled("us", "bulgaria") == 1) { total_us++; }
      if (this.isControlled("ussr", "bulgaria") == 1) { total_ussr++; }
      if (this.isControlled("us", "austria") == 1) { total_us++; }
      if (this.isControlled("ussr", "austria") == 1) { total_ussr++; }
      if (this.isControlled("us", "romania") == 1) { total_us++; }
      if (this.isControlled("ussr", "romania") == 1) { total_ussr++; }
      if (this.isControlled("us", "hungary") == 1) { total_us++; }
      if (this.isControlled("ussr", "hungary") == 1) { total_ussr++; }
      if (this.isControlled("us", "czechoslovakia") == 1) { total_us++; }
      if (this.isControlled("ussr", "czechoslovakia") == 1) { total_ussr++; }
      if (this.isControlled("us", "benelux") == 1) { total_us++; }
      if (this.isControlled("ussr", "benelux") == 1) { total_ussr++; }
      if (this.isControlled("us", "uk") == 1) { total_us++; }
      if (this.isControlled("ussr", "uk") == 1) { total_ussr++; }
      if (this.isControlled("us", "canada") == 1) { total_us++; }
      if (this.isControlled("ussr", "canada") == 1) { total_ussr++; }
      if (this.isControlled("us", "norway") == 1) { total_us++; }
      if (this.isControlled("ussr", "norway") == 1) { total_ussr++; }
      if (this.isControlled("us", "denmark") == 1) { total_us++; }
      if (this.isControlled("ussr", "denmark") == 1) { total_ussr++; }
      if (this.isControlled("us", "sweden") == 1) { total_us++; }
      if (this.isControlled("ussr", "sweden") == 1) { total_ussr++; }
      if (this.isControlled("us", "finland") == 1) { total_us++; }
      if (this.isControlled("ussr", "finland") == 1) { total_ussr++; }

      if (total_us > 0) { vp_us = 3; }
      if (total_ussr> 0) { vp_ussr = 3; }

      if (bg_us > bg_ussr && total_us > bg_us && total_us > total_ussr) { vp_us = 7; }
      if (bg_ussr > bg_us && total_ussr > bg_ussr && total_ussr > total_us) { vp_ussr = 7; }

      if (bg_us > bg_ussr && total_us == 6 && total_us > total_ussr) { vp_us = 10000; }
      if (bg_ussr > bg_us && total_ussr == 6 && total_us > total_ussr) { vp_ussr = 10000; }

      vp_us = vp_us + bg_us;
      vp_ussr = vp_ussr + bg_ussr;

      if ((vp_us >= vp_ussr+2 && total_us > bg_us) || (bg_us == 5 && total_us > total_ussr)) {
        if (player == "us") { return 1; }
        if (player == "ussr") { return 0; }
      }
      if ((vp_ussr >= vp_us+2 && total_ussr > bg_ussr) || (bg_ussr == 5 && total_ussr > total_us)) {
        if (player == "us") { return 0; }
        if (player == "ussr") { return 1; }
      }
    }



    /////////////////
    // MIDDLE EAST //
    /////////////////
    if (region === "mideast") {

      if (this.isControlled("us", "libya") == 1) { bg_us++; }
      if (this.isControlled("ussr", "libya") == 1) { bg_ussr++; }
      if (this.isControlled("us", "egypt") == 1) { bg_us++; }
      if (this.isControlled("ussr", "egypt") == 1) { bg_ussr++; }
      if (this.isControlled("us", "israel") == 1) { bg_us++; }
      if (this.isControlled("ussr", "israel") == 1) { bg_ussr++; }
      if (this.isControlled("us", "iraq") == 1) { bg_us++; }
      if (this.isControlled("ussr", "iraq") == 1) { bg_ussr++; }
      if (this.isControlled("us", "iran") == 1) { bg_us++; }
      if (this.isControlled("ussr", "iran") == 1) { bg_ussr++; }
      if (this.isControlled("us", "saudiarabia") == 1) { bg_us++; }
      if (this.isControlled("ussr", "saudiarabia") == 1) { bg_ussr++; }

      total_us = bg_us;
      total_ussr = bg_ussr;

      if (this.isControlled("us", "lebanon") == 1) { total_us++; }
      if (this.isControlled("ussr", "lebanon") == 1) { total_ussr++; }
      if (this.isControlled("us", "syria") == 1) { total_us++; }
      if (this.isControlled("ussr", "syria") == 1) { total_ussr++; }
      if (this.isControlled("us", "jordan") == 1) { total_us++; }
      if (this.isControlled("ussr", "jordan") == 1) { total_ussr++; }
      if (this.isControlled("us", "gulfstates") == 1) { total_us++; }
      if (this.isControlled("ussr", "gulfstates") == 1) { total_ussr++; }

      if (total_us > 0) { vp_us = 3; }
      if (total_ussr> 0) { vp_ussr = 3; }

      if (bg_us > bg_ussr && total_us > bg_us && total_us > total_ussr) { vp_us = 5; }
      if (bg_ussr > bg_us && total_ussr > bg_ussr && total_ussr > total_us) { vp_ussr = 5; }

      if (bg_us > bg_ussr && total_us == 7 && total_us > total_ussr) { vp_us = 7; }
      if (bg_ussr > bg_us && total_ussr == 7 && total_us > total_ussr) { vp_ussr = 7; }

      vp_us = vp_us + bg_us;
      vp_ussr = vp_ussr + bg_ussr;

      if ((vp_us >= vp_ussr+2 && total_us > bg_us) || (bg_us == 6 && total_us > total_ussr)) {
        if (player == "us") { return 1; }
        if (player == "ussr") { return 0; }
      }
      if ((vp_ussr >= vp_us+2 && total_ussr > bg_ussr) || (bg_ussr == 6 && total_ussr > total_us)) {
        if (player == "us") { return 0; }
        if (player == "ussr") { return 1; }
      }
    }



    ////////////
    // AFRICA //
    ////////////
    if (region === "africa") {

      if (this.isControlled("us", "algeria") == 1) { bg_us++; }
      if (this.isControlled("ussr", "algeria") == 1) { bg_ussr++; }
      if (this.isControlled("us", "nigeria") == 1) { bg_us++; }
      if (this.isControlled("ussr", "nigeria") == 1) { bg_ussr++; }
      if (this.isControlled("us", "zaire") == 1) { bg_us++; }
      if (this.isControlled("ussr", "zaire") == 1) { bg_ussr++; }
      if (this.isControlled("us", "angola") == 1) { bg_us++; }
      if (this.isControlled("ussr", "angola") == 1) { bg_ussr++; }
      if (this.isControlled("us", "southafrica") == 1) { bg_us++; }
      if (this.isControlled("ussr", "southafrica") == 1) { bg_ussr++; }

      total_us = bg_us;
      total_ussr = bg_ussr;

      if (this.isControlled("us", "morocco") == 1) { total_us++; }
      if (this.isControlled("ussr", "morocco") == 1) { total_ussr++; }
      if (this.isControlled("us", "tunisia") == 1) { total_us++; }
      if (this.isControlled("ussr", "tunisia") == 1) { total_ussr++; }
      if (this.isControlled("us", "westafricanstates") == 1) { total_us++; }
      if (this.isControlled("ussr", "westafricanstates") == 1) { total_ussr++; }
      if (this.isControlled("us", "saharanstates") == 1) { total_us++; }
      if (this.isControlled("ussr", "saharanstates") == 1) { total_ussr++; }
      if (this.isControlled("us", "sudan") == 1) { total_us++; }
      if (this.isControlled("ussr", "sudan") == 1) { total_ussr++; }
      if (this.isControlled("us", "ivorycoast") == 1) { total_us++; }
      if (this.isControlled("ussr", "ivorycoast") == 1) { total_ussr++; }
      if (this.isControlled("us", "ethiopia") == 1) { total_us++; }
      if (this.isControlled("ussr", "ethiopia") == 1) { total_ussr++; }
      if (this.isControlled("us", "somalia") == 1) { total_us++; }
      if (this.isControlled("ussr", "somalia") == 1) { total_ussr++; }
      if (this.isControlled("us", "cameroon") == 1) { total_us++; }
      if (this.isControlled("ussr", "cameroon") == 1) { total_ussr++; }
      if (this.isControlled("us", "kenya") == 1) { total_us++; }
      if (this.isControlled("ussr", "kenya") == 1) { total_ussr++; }
      if (this.isControlled("us", "seafricanstates") == 1) { total_us++; }
      if (this.isControlled("ussr", "seafricanstates") == 1) { total_ussr++; }
      if (this.isControlled("us", "zimbabwe") == 1) { total_us++; }
      if (this.isControlled("ussr", "zimbabwe") == 1) { total_ussr++; }
      if (this.isControlled("us", "botswana") == 1) { total_us++; }
      if (this.isControlled("ussr", "botswana") == 1) { total_ussr++; }

      if (total_us > 0) { vp_us = 1; }
      if (total_ussr> 0) { vp_ussr = 1; }

      if (bg_us > bg_ussr && total_us > bg_us && total_us > total_ussr) { vp_us = 4; }
      if (bg_ussr > bg_us && total_ussr > bg_ussr && total_ussr > total_us) { vp_ussr = 4; }

      if (bg_us > bg_ussr && total_us == 7 && total_us > total_ussr) { vp_us = 6; }
      if (bg_ussr > bg_us && total_ussr == 7 && total_us > total_ussr) { vp_ussr = 6; }

      vp_us = vp_us + bg_us;
      vp_ussr = vp_ussr + bg_ussr;

      if ((vp_us >= vp_ussr+2 && total_us > bg_us) || (bg_us == 5 && total_us > total_ussr)) {
        if (player == "us") { return 1; }
        if (player == "ussr") { return 0; }
      }
      if ((vp_ussr >= vp_us+2 && total_ussr > bg_ussr) || (bg_ussr == 5 && total_ussr > total_us)) {
        if (player == "us") { return 0; }
        if (player == "ussr") { return 1; }
      }
    }



    /////////////////////
    // CENTRAL AMERICA //
    /////////////////////
    if (region === "camerica") {

      if (this.isControlled("us", "mexico") == 1) { bg_us++; }
      if (this.isControlled("ussr", "mexico") == 1) { bg_ussr++; }
      if (this.isControlled("us", "cuba") == 1) { bg_us++; }
      if (this.isControlled("ussr", "cuba") == 1) { bg_ussr++; }
      if (this.isControlled("us", "panama") == 1) { bg_us++; }
      if (this.isControlled("ussr", "panama") == 1) { bg_ussr++; }

      total_us = bg_us;
      total_ussr = bg_ussr;

      if (this.isControlled("us", "guatemala") == 1) { total_us++; }
      if (this.isControlled("ussr", "guatemala") == 1) { total_ussr++; }
      if (this.isControlled("us", "elsalvador") == 1) { total_us++; }
      if (this.isControlled("ussr", "elsalvador") == 1) { total_ussr++; }
      if (this.isControlled("us", "honduras") == 1) { total_us++; }
      if (this.isControlled("ussr", "honduras") == 1) { total_ussr++; }
      if (this.isControlled("us", "costarica") == 1) { total_us++; }
      if (this.isControlled("ussr", "costarica") == 1) { total_ussr++; }
      if (this.isControlled("us", "nicaragua") == 1) { total_us++; }
      if (this.isControlled("ussr", "nicaragua") == 1) { total_ussr++; }
      if (this.isControlled("us", "haiti") == 1) { total_us++; }
      if (this.isControlled("ussr", "haiti") == 1) { total_ussr++; }
      if (this.isControlled("us", "dominicanrepublic") == 1) { total_us++; }
      if (this.isControlled("ussr", "dominicanrepublic") == 1) { total_ussr++; }

      if (total_us > 0) { vp_us = 1; }
      if (total_ussr> 0) { vp_ussr = 1; }

      if (bg_us > bg_ussr && total_us > bg_us && total_us > total_ussr) { vp_us = 3; }
      if (bg_ussr > bg_us && total_ussr > bg_ussr && total_ussr > total_us) { vp_ussr = 3; }

      if (bg_us > bg_ussr && total_us == 7 && total_us > total_ussr) { vp_us = 5; }
      if (bg_ussr > bg_us && total_ussr == 7 && total_us > total_ussr) { vp_ussr = 5; }

      vp_us = vp_us + bg_us;
      vp_ussr = vp_ussr + bg_ussr;

      if ((vp_us > vp_ussr && total_us > bg_us && bg_us > 0) || (bg_us == 3 && total_us > total_ussr)) {
        if (player == "us") { return 1; }
        if (player == "ussr") { return 0; }
      }
      if ((vp_ussr > vp_us && total_ussr > bg_ussr && bg_ussr > 0) || (bg_ussr == 3 && total_ussr > total_us)) {
        if (player == "us") { return 0; }
        if (player == "ussr") { return 1; }
      }
    }



    ///////////////////
    // SOUTH AMERICA //
    ///////////////////
    if (region === "samerica") {

      if (this.isControlled("us", "venezuela") == 1) { bg_us++; }
      if (this.isControlled("ussr", "venezuela") == 1) { bg_ussr++; }
      if (this.isControlled("us", "brazil") == 1) { bg_us++; }
      if (this.isControlled("ussr", "brazil") == 1) { bg_ussr++; }
      if (this.isControlled("us", "argentina") == 1) { bg_us++; }
      if (this.isControlled("ussr", "argentina") == 1) { bg_ussr++; }
      if (this.isControlled("us", "chile") == 1) { bg_us++; }
      if (this.isControlled("ussr", "chile") == 1) { bg_ussr++; }

      total_us = bg_us;
      total_ussr = bg_ussr;

      if (this.isControlled("us", "colombia") == 1) { total_us++; }
      if (this.isControlled("ussr", "colombia") == 1) { total_ussr++; }
      if (this.isControlled("us", "ecuador") == 1) { total_us++; }
      if (this.isControlled("ussr", "ecuador") == 1) { total_ussr++; }
      if (this.isControlled("us", "peru") == 1) { total_us++; }
      if (this.isControlled("ussr", "peru") == 1) { total_ussr++; }
      if (this.isControlled("us", "bolivia") == 1) { total_us++; }
      if (this.isControlled("ussr", "bolivia") == 1) { total_ussr++; }
      if (this.isControlled("us", "paraguay") == 1) { total_us++; }
      if (this.isControlled("ussr", "paraguay") == 1) { total_ussr++; }
      if (this.isControlled("us", "uruguay") == 1) { total_us++; }
      if (this.isControlled("ussr", "uruguay") == 1) { total_ussr++; }

      if (total_us > 0) { vp_us = 2; }
      if (total_ussr> 0) { vp_ussr = 2; }

      if (bg_us > bg_ussr && total_us > bg_us && total_us > total_ussr) { vp_us = 5; }
      if (bg_ussr > bg_us && total_ussr > bg_ussr && total_ussr > total_us) { vp_ussr = 5; }

      if (bg_us > bg_ussr && total_us == 7 && total_us > total_ussr) { vp_us = 6; }
      if (bg_ussr > bg_us && total_ussr == 7 && total_us > total_ussr) { vp_ussr = 6; }

      vp_us = vp_us + bg_us;
      vp_ussr = vp_ussr + bg_ussr;

      if ((vp_us > vp_ussr+2 && total_us > bg_us && bg_us > 0) || (bg_us == 4 && total_us > total_ussr)) {
        if (player == "us") { return 1; }
        if (player == "ussr") { return 0; }
      }
      if ((vp_ussr > vp_us+2 && total_ussr > bg_ussr && bg_ussr > 0) || (bg_ussr == 4 && total_ussr > total_us)) {
        if (player == "us") { return 0; }
        if (player == "ussr") { return 1; }
      }

    }




    //////////
    // ASIA //
    //////////
    if (region === "asia") {

      if (this.isControlled("us", "northkorea") == 1) { bg_us++; }
      if (this.isControlled("ussr", "northkorea") == 1) { bg_ussr++; }
      if (this.isControlled("us", "southkorea") == 1) { bg_us++; }
      if (this.isControlled("ussr", "southkorea") == 1) { bg_ussr++; }
      if (this.isControlled("us", "japan") == 1) { bg_us++; }
      if (this.isControlled("ussr", "japan") == 1) { bg_ussr++; }
      if (this.isControlled("us", "thailand") == 1) { bg_us++; }
      if (this.isControlled("ussr", "thailand") == 1) { bg_ussr++; }
      if (this.isControlled("us", "india") == 1) { bg_us++; }
      if (this.isControlled("ussr", "india") == 1) { bg_ussr++; }
      if (this.isControlled("us", "pakistan") == 1) { bg_us++; }
      if (this.isControlled("ussr", "pakistan") == 1) { bg_ussr++; }

      total_us = bg_us;
      total_ussr = bg_ussr;

      if (this.isControlled("us", "afghanistan") == 1) { total_us++; }
      if (this.isControlled("ussr", "afghanistan") == 1) { total_ussr++; }
      if (this.isControlled("us", "burma") == 1) { total_us++; }
      if (this.isControlled("ussr", "burma") == 1) { total_ussr++; }
      if (this.isControlled("us", "laos") == 1) { total_us++; }
      if (this.isControlled("ussr", "laos") == 1) { total_ussr++; }
      if (this.isControlled("us", "vietnam") == 1) { total_us++; }
      if (this.isControlled("ussr", "vietnam") == 1) { total_ussr++; }
      if (this.isControlled("us", "malaysia") == 1) { total_us++; }
      if (this.isControlled("ussr", "malaysia") == 1) { total_ussr++; }
      if (this.isControlled("us", "australia") == 1) { total_us++; }
      if (this.isControlled("ussr", "australia") == 1) { total_ussr++; }
      if (this.isControlled("us", "indonesia") == 1) { total_us++; }
      if (this.isControlled("ussr", "indonesia") == 1) { total_ussr++; }
      if (this.isControlled("us", "philippines") == 1) { total_us++; }
      if (this.isControlled("ussr", "philippines") == 1) { total_ussr++; }

      if (total_us > 0) { vp_us = 3; }
      if (total_ussr > 0) { vp_ussr = 3; }

      if (bg_us > bg_ussr && total_us > bg_us && total_us > total_ussr) { vp_us = 7; }
      if (bg_ussr > bg_us && total_ussr > bg_ussr && total_ussr > total_us) { vp_ussr = 7; }

      if (bg_us > bg_ussr && total_us == 6 && total_us > total_ussr) { vp_us = 9; }
      if (bg_ussr > bg_us && total_ussr == 6 && total_us > total_ussr) { vp_ussr = 9; }

      vp_us = vp_us + bg_us;
      vp_ussr = vp_ussr + bg_ussr;

      if ((vp_us > vp_ussr+2 && total_us > bg_us && bg_us > 0) || (bg_us >= 6 && total_us > total_ussr)) {
        if (player == "us") { return 1; }
        if (player == "ussr") { return 0; }
      }
      if ((vp_ussr > vp_us+2 && total_ussr > bg_ussr && bg_ussr > 0) || (bg_ussr == 6 && total_ussr > total_us)) {
        if (player == "us") { return 0; }
        if (player == "ussr") { return 1; }
      }
    }

    return 0;

  }




  updateRound() {

    let dt = 0;
    let dl = 0;

    let rid = this.game.state.round - 1;
    rid = Math.max(rid,0); //Collapse state.round = 0 & 1 into rid = 0;

    dt = this.game.state.round_ps[rid].top;
    dl = this.game.state.round_ps[rid].left;

    dt = this.scale(dt)+"px";
    dl = this.scale(dl)+"px";

    $('.round').css('width', this.scale(140)+"px");
    $('.round').css('height', this.scale(140)+"px");
    $('.round').css('top', dt);
    $('.round').css('left', dl);

  }


  lowerDefcon() {

    //
    // END OF HISTORY
    //
    if ((this.game.state.events.manwhosavedtheworld === "us" && this.game.state.turn == 2) || (this.game.state.events.manwhosavedtheworld === "ussr" && this.game.state.turn == 1)) {
      if (this.game.state.defcon == 2) {
        this.game.state.events.manwhosavedtheworld = "";
        this.updateLog("Man Who Saved the World prevents thermonuclear war");
        return;
      }
    }


    this.game.state.defcon--;
    this.updateDefcon();

    this.updateLog("DEFCON falls to " + this.game.state.defcon);

    if (this.game.state.events.norad == 1) {
      if (this.game.state.defcon == 2) {
        if (this.game.state.headline != 1) {
          this.game.state.us_defcon_bonus = 1;
        }
      }
    }

    if (this.game.state.defcon <= 1) {
      if (this.game.state.headline == 1) {
        // phasing player in headline loses
        this.sendGameOverTransaction(this.game.players[2 - this.game.state.player_to_go], "thermonuclear war");
      }else{
        this.sendGameOverTransaction(this.game.players[2 - this.game.state.turn], "thermonuclear war");
      }
      return;
    }

  }


  updateDefcon() {

    if (this.game.state.defcon > 5) { this.game.state.defcon = 5; }

    let dt = 0;
    let dl = 0;

    if (this.game.state.defcon == 5) {
      dt = this.game.state.defcon_ps[0].top;
      dl = this.game.state.defcon_ps[0].left;
    }
    if (this.game.state.defcon == 4) {
      dt = this.game.state.defcon_ps[1].top;
      dl = this.game.state.defcon_ps[1].left;
    }
    if (this.game.state.defcon == 3) {
      dt = this.game.state.defcon_ps[2].top;
      dl = this.game.state.defcon_ps[2].left;
    }
    if (this.game.state.defcon == 2) {
      dt = this.game.state.defcon_ps[3].top;
      dl = this.game.state.defcon_ps[3].left;
    }
    if (this.game.state.defcon == 1) {
      dt = this.game.state.defcon_ps[4].top;
      dl = this.game.state.defcon_ps[4].left;
    }

    dt = this.scale(dt) + "px";
    dl = this.scale(dl) + "px";

    dt = dt;
    dl = dl;

    $('.defcon').css('width', this.scale(120)+"px");
    $('.defcon').css('height', this.scale(120)+"px");
    $('.defcon').css('top', dt);
    $('.defcon').css('left', dl);

  }



  updateActionRound() {

    let dt = 0;
    let dl = 0;
    let dt_us = 0;
    let dl_us = 0;

    let turn_in_round = this.game.state.turn_in_round;

    if (turn_in_round == 0) {
      dt = this.game.state.ar_ps[0].top;
      dl = this.game.state.ar_ps[0].left;
    }
    if (turn_in_round == 1) {
      dt = this.game.state.ar_ps[0].top;
      dl = this.game.state.ar_ps[0].left;
    }
    if (turn_in_round == 2) {
      dt = this.game.state.ar_ps[1].top;
      dl = this.game.state.ar_ps[1].left;
    }
    if (turn_in_round == 3) {
      dt = this.game.state.ar_ps[2].top;
      dl = this.game.state.ar_ps[2].left;
    }
    if (turn_in_round == 4) {
      dt = this.game.state.ar_ps[3].top;
      dl = this.game.state.ar_ps[3].left;
    }
    if (turn_in_round == 5) {
      dt = this.game.state.ar_ps[4].top;
      dl = this.game.state.ar_ps[4].left;
    }
    if (turn_in_round == 6) {
      dt = this.game.state.ar_ps[5].top;
      dl = this.game.state.ar_ps[5].left;
    }
    if (turn_in_round == 7) {
      dt = this.game.state.ar_ps[6].top;
      dl = this.game.state.ar_ps[6].left;
    }
    if (turn_in_round == 8) {
      dt = this.game.state.ar_ps[7].top;
      dl = this.game.state.ar_ps[7].left;
    }

    dt = this.scale(dt)+"px";
    dl = this.scale(dl)+"px";

    if (this.game.state.turn == 1) {
      $('.action_round_us').hide();
      $('.action_round_ussr').show();
      $('.action_round_ussr').css('width', this.scale(100)+"px");
      $('.action_round_ussr').css('height', this.scale(100)+"px");
      $('.action_round_ussr').css('top', dt);
      $('.action_round_ussr').css('left', dl);
    } else {
      $('.action_round_ussr').hide();
      $('.action_round_us').show();
      $('.action_round_us').css('width', this.scale(100)+"px");
      $('.action_round_us').css('height', this.scale(100)+"px");
      $('.action_round_us').css('top', dt);
      $('.action_round_us').css('left', dl);
    }

    let rounds_this_turn = 6;
    if (this.game.state.round > 3) { rounds_this_turn = 7; }
    if (this.game.state.northseaoil == 1 && this.game.player == 2) { rounds_this_turn++; }
    if (this.game.state.space_station === "us" && this.game.player == 2) { rounds_this_turn++; }
    if (this.game.state.space_station === "ussr" && this.game.player == 1) { rounds_this_turn++; }

    $('.action_round_cover').css('width', this.scale(100)+"px");
    $('.action_round_cover').css('height', this.scale(100)+"px");

    let dt8 = this.scale(this.game.state.ar_ps[7].top) + "px";
    let dl8 = this.scale(this.game.state.ar_ps[7].left) + "px";
    let dt7 = this.scale(this.game.state.ar_ps[6].top) + "px";
    let dl7 = this.scale(this.game.state.ar_ps[6].left) + "px";

    $('.action_round_8_cover').css('top', dt8);
    $('.action_round_8_cover').css('left', dl8);
    $('.action_round_7_cover').css('top', dt7);
    $('.action_round_7_cover').css('left', dl7);

    if (rounds_this_turn < 8) { $('.action_round_8_cover').css('display','all'); } else { $('.action_round_8_cover').css('display','none'); }
    if (rounds_this_turn < 7) { $('.action_round_7_cover').css('display','all'); } else { $('.action_round_7_cover').css('display','none'); }

  }



  advanceSpaceRace(player, withOSS = false) {

    this.displayModal(`${player.toUpperCase()} advances in the Space Race`);

    //Parameters to simplify the function
    let sr_player = "space_race_us";
    let sr_opponent = "space_race_ussr";

    if (player == "ussr"){
      sr_player = "space_race_ussr";
      sr_opponent = "space_race_us";
    }

    this.game.state[sr_player]++;

    let first = this.game.state[sr_player] > this.game.state[sr_opponent];
    let vp_change = 0;

    switch(this.game.state[sr_player]){
      case 1:  // Earth Satellite
        vp_change = (first) ? 2 : 1;
        break;
      case 2:  // Animal in Space
        this.game.state.animal_in_space = (first) ? player : "";
        break;
      case 3: // Man in Space
        vp_change = (first) ? 2 : 0;
        break;
      case 4: // Man in Earth Orbit
        this.game.state.man_in_earth_orbit = (first) ? player : "";
        break;
      case 5: // Lunar Orbit
        vp_change = (first) ? 3 : 1;
        break;
      case 6: // Eagle/Bear has Landed
        this.game.state.eagle_has_landed = (first) ? player : "";
        break;
      case 7:  // Space Shuttle
        vp_change = (first) ? 4 : 2;
        break;
      case 8:
        vp_change = (first) ? 2 : 0;
        this.game.state.space_station = (first) ? player : "";
        break;
    }

    this.updateSpaceRace();

    if (withOSS){
      return;
    }

    if (player == "us"){
      this.game.state.vp += vp_change;
    } else {
      this.game.state.vp -= vp_change;
    }

    this.updateVictoryPoints();
    if (vp_change > 0){
      this.updateLog(`${player.toUpperCase()} gains ${vp_change} VP for advancing in the space race.`);
    }


  }



  updateSpaceRace() {

    if (!this.browser_active){return;}

    let dt_us = this.game.state.space_race_ps[this.game.state.space_race_us].top;
    let dl_us = this.game.state.space_race_ps[this.game.state.space_race_us].left;
    let dt_ussr = this.game.state.space_race_ps[this.game.state.space_race_ussr].top;
    let dl_ussr = this.game.state.space_race_ps[this.game.state.space_race_ussr].left;

    dt_us = this.scale(dt_us);
    dl_us = this.scale(dl_us);
    dt_ussr = this.scale(dt_ussr+40)+"px";
    dl_ussr = this.scale(dl_ussr+10)+"px";

    $('.space_race_us').css('width', this.scale(100)+"px");
    $('.space_race_us').css('height', this.scale(100)+"px");
    $('.space_race_us').css('top', dt_us);
    $('.space_race_us').css('left', dl_us);

    $('.space_race_ussr').css('width', this.scale(100)+"px");
    $('.space_race_ussr').css('height', this.scale(100)+"px");
    $('.space_race_ussr').css('top', dt_ussr);
    $('.space_race_ussr').css('left', dl_ussr);

  }



  updateEventTiles() {

    if (!this.browser_active){return;}

    try {

    if (this.game.state.events.nixonshock != 1) {
      $('#eventtile_nixonshock').css('display','none');
    } else {
      $('#eventtile_nixonshock').css('display','block');
    }

    if (this.game.state.events.argo != 1) {
      $('#eventtile_argo').css('display','none');
    } else {
      $('#eventtile_argo').css('display','block');
    }

    if (this.game.state.events.sudan != 1) {
      $('#eventtile_sudan').css('display','none');
    } else {
      $('#eventtile_sudan').css('display','block');
    }

    if (this.game.state.events.berlinagreement != 1) {
      $('#eventtile_berlinagreement').css('display','none');
    } else {
      $('#eventtile_berlinagreement').css('display','block');
    }

    if (this.game.state.events.carterdoctrine != 1) {
      $('#eventtile_carterdoctrine').css('display','none');
    } else {
      $('#eventtile_carterdoctrine').css('display','block');
    }

    if (this.game.state.events.tsarbomba != 1) {
      $('#eventtile_tsarbomba').css('display','none');
    } else {
      $('#eventtile_tsarbomba').css('display','block');
    }


    if (this.game.state.events.sudanese_civil_war) {
      $('.civil_war_sudan').css('display','block');
      $('.civil_war_sudan').show();
    }

    if (!this.game.state.events.kissinger) {
      $('#eventtile_kissinger').css('display','none');
    } else {

      if (this.game.state.events.kissinger === "camerica") {
        $('.kissinger_colombia').css('display','block');
        $('.kissinger_colombia').show();
        $('.kissinger_guatemala').css('display','block');
        $('.kissinger_guatemala').show();
        $('.kissinger_elsalvador').css('display','block');
        $('.kissinger_elsalvador').show();
        $('.kissinger_nicaragua').css('display','block');
        $('.kissinger_nicaragua').show();
        $('.kissinger_haiti').css('display','block');
        $('.kissinger_haiti').show();
        $('.kissinger_dominicanrepublic').css('display','block');
        $('.kissinger_dominicanrepublic').show();
      }

      if (this.game.state.events.kissinger === "samerica") {
        $('.kissinger_colombia').css('display','block');
        $('.kissinger_colombia').show();
      }

      if (this.game.state.events.kissinger === "africa") {
        $('.kissinger_saharanstates').css('display','block');
        $('.kissinger_saharanstates').show();
	if (!this.game.state.events.sudanese_civil_war) {
          $('.kissinger_sudan').css('display','block');
          $('.kissinger_sudan').show();
	}
        $('.kissinger_ethiopia').css('display','block');
        $('.kissinger_ethiopia').show();
        $('.kissinger_cameroon').css('display','block');
        $('.kissinger_cameroon').show();
        $('.kissinger_seafricanstates').css('display','block');
        $('.kissinger_seafricanstates').show();
        $('.kissinger_zimbabwe').css('display','block');
        $('.kissinger_zimbabwe').show();
      }

      if (this.game.state.events.kissinger === "mideast") {
        $('.kissinger_lebanon').css('display','block');
        $('.kissinger_lebanon').show();
      }

      if (this.game.state.events.kissinger === "asia") {
        $('.kissinger_laos').css('display','block');
        $('.kissinger_laos').show();
        $('.kissinger_vietnam').css('display','block');
        $('.kissinger_vietnam').show();
        $('.kissinger_indonesia').css('display','block');
        $('.kissinger_indonesia').show();
      }
      $('#eventtile_kissinger').css('display','block');
    }

    if (this.game.state.events.warsawpact == 0) {
      $('#eventtile_warsaw').css('display','none');
    } else {
      $('#eventtile_warsaw').css('display','block');
    }

    if (this.game.state.events.degaulle == 0) {
      $('#eventtile_degaulle').css('display','none');
    } else {
      $('#eventtile_degaulle').css('display','block');
    }

    if (this.game.state.events.nato == 0) {
      $('#eventtile_nato').css('display','none');
    } else {
      $('#eventtile_nato').css('display','block');
    }

    if (this.game.state.events.marshall == 0) {
      $('#eventtile_marshall').css('display','none');
    } else {
      $('#eventtile_marshall').css('display','block');
    }

    if (this.game.state.events.usjapan == 0) {
      $('#eventtile_usjapan').css('display','none');
    } else {
      $('#eventtile_usjapan').css('display','block');
    }

    if (this.game.state.events.norad == 0) {
      $('#eventtile_norad').css('display','none');
    } else {
      $('#eventtile_norad').css('display','block');
    }

    if (this.game.state.events.quagmire == 0) {
      $('#eventtile_quagmire').css('display','none');
    } else {
      $('#eventtile_quagmire').css('display','block');
    }


    if (this.game.state.events.formosan == 0) {
      $('#eventtile_formosan').css('display','none');
      $('.formosan_resolution').css('display','none');
      $('.formosan_resolution').hide();
    } else {
      if (this.isControlled("ussr", "taiwan") != 1) {
        $('#eventtile_formosan').css('display','block');
        $('.formosan_resolution').css('display','block');
        $('.formosan_resolution').show();
      } else {
        $('.formosan_resolution').css('display','none');
        $('.formosan_resolution').hide();
      }
    }

    if (this.game.state.events.beartrap == 0) {
      $('#eventtile_beartrap').css('display','none');
    } else {
      $('#eventtile_beartrap').css('display','block');
    }

    if (this.game.state.events.willybrandt == 0) {
      $('#eventtile_willybrandt').css('display','none');
    } else {
      $('#eventtile_willybrandt').css('display','block');
    }

    if (this.game.state.events.campdavid == 0) {
      $('#eventtile_campdavid').css('display','none');
    } else {
      $('#eventtile_campdavid').css('display','block');
    }

    if (this.game.state.events.flowerpower == 0) {
      $('#eventtile_flowerpower').css('display','none');
    } else {
      $('#eventtile_flowerpower').css('display','block');
    }

    if (this.game.state.events.johnpaul == 0) {
      $('#eventtile_johnpaul').css('display','none');
    } else {
      $('#eventtile_johnpaul').css('display','block');
    }

    if (this.game.state.events.iranianhostage == 0) {
      $('#eventtile_iranianhostagecrisis').css('display','none');
    } else {
      $('#eventtile_iranianhostagecrisis').css('display','block');
    }

    if (this.game.state.events.shuttlediplomacy == 0) {
      $('#eventtile_shuttlediplomacy').css('display','none');
    } else {
      $('#eventtile_shuttlediplomacy').css('display','block');
    }

    if (this.game.state.events.ironlady == 0) {
      $('#eventtile_ironlady').css('display','none');
    } else {
      $('#eventtile_ironlady').css('display','block');
    }

    if (this.game.state.events.northseaoil == 0) {
      $('#eventtile_northseaoil').css('display','none');
    } else {
      $('#eventtile_northseaoil').css('display','block');
    }

    if (this.game.state.events.reformer == 0) {
      $('#eventtile_reformer').css('display','none');
    } else {
      $('#eventtile_reformer').css('display','block');
    }

    if (this.game.state.events.teardown == 0) {
      $('#eventtile_teardown').css('display','none');
    } else {
      $('#eventtile_teardown').css('display','block');
    }

    if (this.game.state.events.evilempire == 0) {
      $('#eventtile_evilempire').css('display','none');
    } else {
      $('#eventtile_evilempire').css('display','block');
    }

    if (this.game.state.events.awacs == 0) {
      $('#eventtile_awacs').css('display','none');
    } else {
      $('#eventtile_awacs').css('display','block');
    }

    } catch (err) {}

  }



  updateMilitaryOperations() {

    let dt_us = 0;
    let dl_us = 0;
    let dt_ussr = 0;
    let dl_ussr = 0;

    if (this.game.state.milops_us == 0) {
      dt_us = this.game.state.milops_ps[0].top;
      dl_us = this.game.state.milops_ps[0].left;
    }
    if (this.game.state.milops_us == 1) {
      dt_us = this.game.state.milops_ps[1].top;
      dl_us = this.game.state.milops_ps[1].left;
    }
    if (this.game.state.milops_us == 2) {
      dt_us = this.game.state.milops_ps[2].top;
      dl_us = this.game.state.milops_ps[2].left;
    }
    if (this.game.state.milops_us == 3) {
      dt_us = this.game.state.milops_ps[3].top;
      dl_us = this.game.state.milops_ps[3].left;
    }
    if (this.game.state.milops_us == 4) {
      dt_us = this.game.state.milops_ps[4].top;
      dl_us = this.game.state.milops_ps[4].left;
    }
    if (this.game.state.milops_us >= 5) {
      dt_us = this.game.state.milops_ps[5].top;
      dl_us = this.game.state.milops_ps[5].left;
    }

    if (this.game.state.milops_ussr == 0) {
      dt_ussr = this.game.state.milops_ps[0].top;
      dl_ussr = this.game.state.milops_ps[0].left;
    }
    if (this.game.state.milops_ussr == 1) {
      dt_ussr = this.game.state.milops_ps[1].top;
      dl_ussr = this.game.state.milops_ps[1].left;
    }
    if (this.game.state.milops_ussr == 2) {
      dt_ussr = this.game.state.milops_ps[2].top;
      dl_ussr = this.game.state.milops_ps[2].left;
    }
    if (this.game.state.milops_ussr == 3) {
      dt_ussr = this.game.state.milops_ps[3].top;
      dl_ussr = this.game.state.milops_ps[3].left;
    }
    if (this.game.state.milops_ussr == 4) {
      dt_ussr = this.game.state.milops_ps[4].top;
      dl_ussr = this.game.state.milops_ps[4].left;
    }
    if (this.game.state.milops_ussr >= 5) {
      dt_ussr = this.game.state.milops_ps[5].top;
      dl_ussr = this.game.state.milops_ps[5].left;
    }

    dt_us = this.scale(dt_us);
    dl_us = this.scale(dl_us);
    dt_ussr = this.scale(dt_ussr+40)+"px";
    dl_ussr = this.scale(dl_ussr+10)+"px";

    $('.milops_us').css('width', this.scale(100)+"px");
    $('.milops_us').css('height', this.scale(100)+"px");
    $('.milops_us').css('top', dt_us);
    $('.milops_us').css('left', dl_us);

    $('.milops_ussr').css('width', this.scale(100)+"px");
    $('.milops_ussr').css('height', this.scale(100)+"px");
    $('.milops_ussr').css('top', dt_ussr);
    $('.milops_ussr').css('left', dl_ussr);

  }



  updateVictoryPoints() {

    //
    // if VP are outstanding, do not update VP and trigger end
    //
    if (this.game.state.vp_outstanding != 0) { return; }
    if (!this.browser_active) { return; }

    let dt = 0;
    let dl = 0;

    if (this.game.state.vp <= -20) {
      dt = this.game.state.vp_ps[0].top;
      dl = this.game.state.vp_ps[0].left;
    }
    else if (this.game.state.vp >= 20) {
      dt = this.game.state.vp_ps[40].top;
      dl = this.game.state.vp_ps[40].left;
    }else{
      let vp_idx = this.game.state.vp + 20;
      dt = this.game.state.vp_ps[vp_idx].top;
      dl = this.game.state.vp_ps[vp_idx].left;
    }


    if (this.app.BROWSER == 1) {
      dt = this.scale(dt);
      dl = this.scale(dl);

      dt = dt + "px";
      dl = dl + "px";

      $('.vp').css('width', this.scale(120)+"px");
      $('.vp').css('height', this.scale(120)+"px");
      $('.vp').css('top', dt);
      $('.vp').css('left', dl);
    }

    if (this.game.state.vp > 19) {
        this.sendGameOverTransaction(this.game.players[1], "victory point track");
    }
    if (this.game.state.vp < -19) {
      this.sendGameOverTransaction(this.game.players[0], "victory point track");
    }

  }

  /////////////////////////
  cardToText(cardname, textonly = false){
    let ac = this.returnAllCards(true);
    let card = ac[cardname];
    if (card == undefined) { card = this.game.deck[0].discards[cardname]; }
    if (card == undefined) { card = this.game.deck[0].removed[cardname]; }

    try{
      if (textonly){
        return card.name;
      }else{
        return `<span class="showcard" id="${cardname}">${card.name}</span>`;
      }
    }catch(err){
      console.log(err);
      console.log(cardname, ac[cardname], card);
      console.log(this.game.deck[0]);
    }
    return "unknown";

  }


  returnCardImage(cardname) {
    let cardclass = "cardimg";

    var c = this.game.deck[0].cards[cardname];
    if (c == undefined) { c = this.game.deck[0].discards[cardname]; }
    if (c == undefined) { c = this.game.deck[0].removed[cardname]; }
    if (c == undefined) { let x = this.returnAllCards(true); c = x[cardname]; }

    if (c == undefined) {
      //
      // this is not a card, it is something like "skip turn" or cancel
      //
      if (cardname === "finished") {
        return `<div class="noncard" style="height:100%;background-image: url('/twilight/img/done.png'); background-size: cover;" id="${cardname.replaceAll(" ","")}"></div>`;
      }
      if (cardname === "skipturn") {
        return `<div class="noncard" style="height:100%;background-image: url('/twilight/img/skipturn.png'); background-size: cover;" id="${cardname.replaceAll(" ","")}"></div>`;
      }
      if (cardname === "cancel_cmc") {
        return `<div class="noncard" style="height:100%;background-image: url('/twilight/img/cancel_cmc.png'); background-size: cover;" id="${cardname.replaceAll(" ","")}"></div>`;
      }
      if (cardname === "cancel_cmc") {
        return `<div class="noncard" style="height:100%;background-image: url('/twilight/img/cancel_cmc.png'); background-size: cover;" id="${cardname.replaceAll(" ","")}"></div>`;
      }

      //
      // or something else
      //
      return `<div class="noncard" id="${cardname.replaceAll(" ","")}">${cardname}</div>`;

    }

    var html = `<img class="${cardclass}" src="/twilight/img/${this.lang}/${c.img}.svg" />`;

    //
    // cards can be generated with http://www.invadethree.space/tscardgen/
    // as long as they have the string "png" included in the name they will
    // be treated as fully formed (i.e. not SVG files). The convention is to
    // name these cards starting at 201 in order to avoid conflict with other
    // cards that may be released officially.
    //
    if (c.img.indexOf("png") > -1) {
        html = `<img class="${cardclass}" src="/twilight/img/${this.lang}/${c.img}.png" />`;
    } else {
        if (c.p == 0) { html += `<img class="${cardclass}" src="/twilight/img/EarlyWar.svg" />`; }
        if (c.p == 1) { html += `<img class="${cardclass}" src="/twilight/img/MidWar.svg" />`; }
        if (c.p == 2) { html += `<img class="${cardclass}" src="/twilight/img/LateWar.svg" />`; }

      switch (c.player) {
        case "both":
          html += `<img class="${cardclass}" src="/twilight/img/BothPlayerCard.svg" />`;
          if (c.ops) {
            html += `<img class="${cardclass}" src="/twilight/img/White${c.ops}.svg" />`;
            html += `<img class="${cardclass}" src="/twilight/img/Black${c.ops}.svg" />`;
          }
          break;
        case "us":
          html += `<img class="${cardclass}" src="/twilight/img/AmericanPlayerCard.svg" />`;
          if (c.ops) { html += `<img class="${cardclass}" src="/twilight/img/Black${c.ops}.svg" />`; }
          break;
        case "ussr":
          html += `<img class="${cardclass}" src="/twilight/img/SovietPlayerCard.svg" />`;
          if (c.ops) { html += `<img class="${cardclass}" src="/twilight/img/White${c.ops}.svg" />`; }
          break;
        default:
          break;
      }
    }

    if (c.scoring == 1) {
      html +=`<img class="${cardclass}" src="/twilight/img/MayNotBeHeld.svg" />`;
    } else if (c.recurring == 0) {
      if (c.img.indexOf("png") > -1) {} else {
        html += `<img class="${cardclass}" src="/twilight/img/RemoveFromPlay.svg" />`;
      }
    }


    if (this.game.state.events.cancelled[cardname] == 1) {
      html += `<img class="${cardclass} cancel_x" src="/twilight/img/cancel_x.png" />`;
    }


    return html
  }


   mobileCardSelect(card, player, mycallback, prompttext="play") {

    let twilight_self = this;

    twilight_self.hideCard();
    twilight_self.showPlayableCard(card);

    $('.cardbox_menu_playcard').html(prompttext);
    $('.cardbox_menu_playcard').css('display','block');
    $('.cardbox_menu_playcard').off();
    $('.cardbox_menu_playcard').on('click', function () {
      $('.cardbox_menu').css('display','none');
      twilight_self.hideCard();
      mycallback();
      $(this).hide();
      $('.cardbox-exit').hide();
    });
    $('.cardbox-exit').off();
    $('.cardbox-exit').on('click', function () {
      twilight_self.hideCard();
      $('.cardbox_menu_playcard').css('display','none');
      $(this).css('display', 'none');
    });

  }
  showPlayableCard(cardname) {
    let card_html = this.returnCardImage(cardname,0);
    let cardbox_html = this.app.browser.isMobileBrowser(navigator.userAgent) ?
      `${card_html}
      <div id="cardbox-exit-background">
        <div class="cardbox-exit" id="cardbox-exit">×</div>
      </div>
      <div class="cardbox_menu_playcard cardbox_menu_btn" id="cardbox_menu_playcard">
        PLAY
      </div>` : card_html;

    $('#cardbox').html(cardbox_html);
    $('#cardbox').show();
  }

  hideCard() {
    this.cardbox.hide(1);
  }


  returnSingularGameOption(){
    return TwilightSingularOption();
  }

  returnAdvancedOptions() {
    return TwilightOptions();
  }

  returnGameRulesHTML(){
    return TwilightRules();
  }

  settleVPOutstanding() {

    if (this.game.state.vp_outstanding != 0) {
      this.game.state.vp += this.game.state.vp_outstanding;
    }
    this.game.state.vp_outstanding = 0;
    this.updateVictoryPoints();

  }





  displayChinaCard() {

    $('.china_card_status').removeClass('china_card_status_us_facedown');
    $('.china_card_status').removeClass('china_card_status_us_faceup');
    $('.china_card_status').removeClass('china_card_status_ussr_facedown');
    $('.china_card_status').removeClass('china_card_status_ussr_faceup');

    let x = this.whoHasTheChinaCard();

    if (x === "ussr") {
      if (this.game.state.events.china_card_facedown == 0) {
        $('.china_card_status').addClass('china_card_status_ussr_faceup');
      } else {
        $('.china_card_status').addClass('china_card_status_ussr_facedown');
      }
    } else {
      if (this.game.state.events.china_card_facedown == 0) {
        $('.china_card_status').addClass('china_card_status_us_faceup');
      } else {
        $('.china_card_status').addClass('china_card_status_us_facedown');
      }
    }

  }


  //
  // track events which are cancelled / cancellable dynamically
  //
  cancelEventsDynamically() {

      // NATO
      if (this.game.state.events.marshall == 1 || this.game.state.events.warsawpact == 1) {
	this.uncancelEvent("nato");
      } else {
	this.cancelEvent("nato");
      }

      // cambridge-five late war
      if (this.game.state.round >= 8) {
        this.cancelEvent("cambridge");
      }

      // wargames, if decon is 2
      if (this.game.state.defcon != 2) {
        this.cancelEvent("wargames");
      } else {
        this.uncancelEvent("wargames");
      }
      // onesmallstep - if we are behind/ahead
      if (this.game.player == 2) {
      	if (this.game.state.space_race_us >= this.game.state.space_race_ussr) {
      	  this.cancelEvent("onesmallstep");
              } else {
      	  this.uncancelEvent("onesmallstep");
      	}
      } else {
      	if (this.game.state.space_race_ussr >= this.game.state.space_race_us) {
      	  this.cancelEvent("onesmallstep");
              } else {
      	  this.uncancelEvent("onesmallstep");
      	}
      }
  }


  /////////////////////////////////////////////
  // Saito Edition - Dynamic Card Management //
  /////////////////////////////////////////////
  //
  // the Saito edition adds and removes cards from the game based on historical
  // precedents being triggered, as well as the threshold criteria being triggered
  // for this reason, we have a few functions that assist. they run at the beginning
  // of every round.
  //
  // if the catalyst for adding a card is triggered, the card is added to the deck
  // and the deck is shuffled. if a card is removed, players will remove it from
  // their hand and draw a new card to make up for the shortfall.
  //
  dynamicDeckManagement() {

    //
    // sanity check
    //
    if (this.game.options.deck != "saito") { return; }

    //
    // living history / saito edition -- SAITO COMMUNITY
    //
    if (!this.game.saito_cards_added) {
      this.game.saito_cards_added = [];
      this.game.saito_cards_added_reason = [];
    }
    if (!this.game.saito_cards_removed) {
      this.game.saito_cards_removed = [];
      this.game.saito_cards_removed_reason = [];
    }

    if (this.game.options.deck !== "saito") { return; }

    let shuffle_in_these_cards = {};
    let already_dealt = {};

    //
    // double quagmire / bear trap
    //
    if (this.game.state.events.double_quagmire && this.game.state.events.kissinger_added != 1) {
      this.addCardToDeck("kissinger", "Double Quagmire");
      this.game.state.events.kissinger_added = 1;
    }
    if (this.game.state.events.double_beartrap && this.game.state.events.samotlor_added != 1) {
      this.addCardToDeck("samotlor", "Double Bear Trap");
      this.game.state.events.samotlor_added = 1;
    }


    // SUMMIT remains in the game, although not likely to be added because who events Nuclear Test Ban Treaty ?
    if (this.game.state.events.nucleartestbantreaty == 1 && this.game.state.events.summit_added != 1) {
      this.game.state.events.summit_added = 1;
      this.addCardToDeck("summit", "Nuclear Treaty in Play");
    }


    //
    // if USSR controls Cuba
    //
    if (this.isControlled("ussr", "cuba") && this.game.state.events.bayofpigs_added != 1 && this.game.state.round >= 4) {
      this.game.state.events.bagofpigs_added = 1;
      this.addCardToDeck("bayofpigs", "USSR controls Cuba");
    }
    if (this.isControlled("ussr", "cuba") && this.game.state.events.cubanmissile_added != 1 && this.game.state.round >= 4) {
      this.game.state.events.cubanmissile_added = 1;
      this.addCardToDeck("cubanmissile", "USSR controls Cuba");
    }

    //
    // US routed in Europe, Blockade Outstanding
    //
    if (!this.isControlled("us", "italy") && !this.isControlled("us","france") && !this.isControlled("us","poland") && !this.isControlled("us","eastgermany")) {
      if ((this.game.state.round >= 4 && this.game.state.round <= 7) && this.game.state.events.blockade != 1 && this.game.state.events.berlinagreement_added != 1) {
        this.addCardToDeck("berlinagreement", "US routed in Europe");
        this.game.state.events.berlinagreement_added = 1;
      }
    }

    //
    // double-purge / double-scare
    //
    if (this.game.state.events.redscare_player1_count > 1 && this.game.state.events.august1968_added != 1) {
      this.addCardToDeck("august1968", "Double Red Purge");
      this.game.state.events.august1968_added = 1;
    } 
    if (this.game.state.events.redscare_player2_count > 1 && this.game.state.events.carterdoctrine_added != 1) {
      this.addCardToDeck("carterdoctrine", "Double Red Scare");
      this.game.state.events.carterdoctrine_added = 1;
    }

    //
    // destalinization + decolonization combo
    //
    if (this.game.state.events.destalinization_played && this.game.state.events.decolonization_played && this.game.state.events.pinochet_added != 1) {
      this.addCardToDeck("pinochet", "Destalinization and Decolonization");
      this.game.state.events.pinochet_added = 1;
    }

    //
    // add or remove the cardkeys to these two
    // arrays to bring them into the game or
    // remove them from it. note that if you are
    // adding a removed card back into the game
    // you should remove it from the removed
    // array.
    //
    let saito_edition_removed = this.game.saito_cards_removed;
    let saito_edition_added   = this.game.saito_cards_added;

    let original_deck = this.game.options.deck;
    this.game.options.deck = "saito";
    let a = this.returnEarlyWarCards();
    let b = this.returnMidWarCards();
    let c = this.returnLateWarCards();
    let d = Object.assign({}, a, b);
    let fulldeck = Object.assign({}, d, c);
    this.game.options.deck = original_deck;

    let cards_added_to_deck = 0;
    let cards_removed_from_deck = 0;
    let cards_removed_from_my_hand = 0;

    //
    // remove cards
    //
    for (let i in this.game.deck[0].cards) {
      if (saito_edition_removed.includes(i)) {

	//
	// prevent it creeping back in
	//
	if (fulldeck[i]) {
	  if (this.game.options[i]) { delete this.game.options[i]; } else { this.game.options[i] = 1; }
	  fulldeck = this.returnAllCards();
	  if (fulldeck[i]) { console.log("WTF CAN I NOT REMOVE THIS 1: " + i); }
        }

	//
	// from main deck
	//
	if (this.game.deck[0].cards[i]) { delete this.game.deck[0].cards[i]; }
	cards_removed_from_deck++;

	//
	// from discards
	//
	if (this.game.deck[0].discards[i]) { delete this.game.deck[0].discards[i]; }

        //
        // cut from hand too
        //
	if (this.game.deck[0].hand.includes(i)) {
	  for (let z = this.game.deck[0].hand.length-1; z >= 0; z--) {
	    if (this.game.deck[0].hand[z] === i) {
	      this.game.deck[0].hand.splice(z, 1);
	      cards_removed_from_my_hand++;
	    }
	  }
	}
      }
    }

    //
    // add cards
    //
    for (let i = 0; i < saito_edition_added.length; i++) {

      //
      // prevent it being removed
      //
      if (!fulldeck[saito_edition_added[i]]) {
        if (!this.game.options[saito_edition_added[i]]) { this.game.options[saito_edition_added[i]] = 1; } else { delete this.game.options[saito_edition_added[i]]; }
        fulldeck = this.returnAllCards();
        if (fulldeck[saito_edition_added[i]]) { console.log("WTF CAN I NOT ADD THIS 1: " + saito_edition_added[i]); }
      }

      if (!this.game.deck[0].cards[saito_edition_added[i]]) {
	if (fulldeck[saito_edition_added[i]] && !saito_edition_removed.includes(saito_edition_added[i])) {
	  cards_added_to_deck++;
	  shuffle_in_these_cards[saito_edition_added[i]] = fulldeck[saito_edition_added[i]];
	}
      }
    }

    //
    // discards should be removed from main deck for reshuffle
    //
    for (let key2 in this.game.deck[0].discards) {
      if (this.game.deck[0].cards[key2]) {
	delete this.game.deck[0].cards[key2];
      }
    }

    for (let key3 in this.game.deck[0].cards) {
      if (this.game.state.player1_hold_cards.includes(key3) || this.game.state.player2_hold_cards.includes(key3)) {
	if (key3 != "china") {
          if (!already_dealt[key3]) {
	    already_dealt[key3] = this.game.deck[0].cards[key3];
	    delete this.game.deck[0].cards[key3];
	  } else {
	    if (this.game.deck[0].cards[key3]) {
	      delete this.game.deck[0].cards[key3];
	    }
	  }
	}
      } else {
	if (key3 != "china") {
          shuffle_in_these_cards[key3] = this.game.deck[0].cards[key3];
        }
      }
    }

console.log("SHUFFLING IN THESE CARDS: ");
for (let key in shuffle_in_these_cards) { console.log(key); }


    //
    // shuffle in new cards
    //
    // note - no backup and restore as we are replacing the deck
    //
    this.game.queue.push("SHUFFLE\t1");
    this.game.queue.push("deckaddcards\t"+JSON.stringify(already_dealt));
    this.game.queue.push("DECKADDCARDS\t"+JSON.stringify(already_dealt));
    this.game.queue.push("DECKRESTORE");
    this.game.queue.push("DECKENCRYPT\t1\t2");
    this.game.queue.push("DECKENCRYPT\t1\t1");
    this.game.queue.push("DECKXOR\t1\t2");
    this.game.queue.push("DECKXOR\t1\t1");
    this.game.queue.push("DECK\t1\t"+JSON.stringify(shuffle_in_these_cards));
    this.game.queue.push("HANDBACKUP\t1");
    this.game.queue.push("NOTIFY\tShuffling New Cards into Deck");
    
  }

  addCardToDeck(key="", reason="") {

    if (this.game.options.deck != "saito") { return; }

    if (!this.game.saito_cards_added) {
      //
      // living history / saito edition -- SAITO COMMUNITY
      //
      this.game.saito_cards_added = [];
      this.game.saito_cards_removed = [];
      this.game.saito_cards_added_reason = [];
      this.game.saito_cards_removed_reason = [];
    }

    //
    // skip if already added
    //
    if (this.game.saito_cards_added.includes(key)) { return; }

    //
    // make sure it pops up when deck requested
    //
    let allCards = this.returnAllCards();
    if (!allCards[key]) {
      if (!this.game.options[key]) { this.game.options[key] = 1; } else { delete this.game.options[key]; }
    }

    let original_deck = this.game.options.deck;
    this.game.options.deck = "saito";
    a = this.returnEarlyWarCards();
    b = this.returnMidWarCards();
    c = this.returnLateWarCards();
    let d = Object.assign({}, a, b);
    let fulldeck = Object.assign({}, d, c);
    this.game.options.deck = original_deck;

    //
    // add to deck
    //
    if (this.game.deck.length > 0) {
      if (!this.game.deck[0].cards[key]) {
        if (fulldeck[key]) {
          this.game.deck[0].cards[key] = fulldeck[key];
        }
      }
    }

    //
    // remove from removed
    //
    if (this.game.saito_cards_removed.includes(key)) {
      for (let z = this.game.saito_cards_removed.length-1; z >= 0; z--) {
        if (this.game.saito_cards_removed[z] === key) {
          this.game.saito_cards_removed.splice(z, 1);
          this.game.saito_cards_removed_reason.splice(z, 1);
	}
      }
    }

    //
    // add to removed
    //
    if (!this.game.saito_cards_added.includes(key)) {
      this.game.saito_cards_added.push(key);
      this.game.saito_cards_added_reason.push(reason);
    }

  }
  removeCardFromDeckNextDeal(key="", reason="") {

    if (this.game.options.deck != "saito") { return; }

    if (!this.game.saito_cards_added) {
      //
      // living history / saito edition -- SAITO COMMUNITY
      //
      this.game.saito_cards_added = [];
      this.game.saito_cards_removed = [];
      this.game.saito_cards_added_reason = [];
      this.game.saito_cards_removed_reason = [];
    }

    //
    // make sure it doesn't pop up
    //
    let allCards = this.returnAllCards();
    if (allCards[key]) {
      if (!this.game.options[key]) { this.game.options[key] = 1; } else { delete this.game.options[key]; }
    }

    if (!this.game.saito_cards_removed.includes(key)) {
      this.game.saito_cards_removed.push(key);
      this.game.saito_cards_removed_reason.push(reason);
    }

  }
  removeCardFromDeck(key="", reason="") {

    if (this.game.options.deck != "saito") { return; }

    if (!this.game.saito_cards_added) {
      //
      // living history / saito edition -- SAITO COMMUNITY
      //
      this.game.saito_cards_added = [];
      this.game.saito_cards_removed = [];
      this.game.saito_cards_added_reason = [];
      this.game.saito_cards_removed_reason = [];
    }

    //
    // make sure it doesn't pop up
    //
    let allCards = this.returnAllCards();
    if (allCards[key]) {
      if (!this.game.options[key]) { this.game.options[key] = 1; } else { delete this.game.options[key]; }
    }

    if (this.game.deck.length > 0) {
      //
      // remove from deck
      //
      if (this.game.deck[0].cards[key]) {
        delete this.game.deck[0].cards[key];
      }
      //
      // remove from discards
      //
      if (this.game.deck[0].discards[key]) {
        delete this.game.deck[0].discards[key];
      }
    }

    //
    // remove from hand
    //
    if (this.game.deck.length > 0) {
      if (this.game.deck[0].hand.includes(key)) {
        for (let z = this.game.deck[0].hand.length-1; z >= 0; z--) {
          if (this.game.deck[0].hand[z] === i) {
            this.game.deck[0].hand.splice(z, 1);
  	  }
        }
      }
    }

    //
    // remove from added
    //
    if (this.game.saito_cards_added.includes(key)) {
      for (let z = 0; z < this.game.saito_cards_added.length; z++) {
        if (this.game.saito_cards_added[z] === key) {
          this.game.saito_cards_added.splice(z, 1);
          this.game.saito_cards_added_reason.splice(z, 1);
	}
      }
    }

    //
    // add to removed
    //
    if (!this.game.saito_cards_removed.includes(key)) {
      this.game.saito_cards_removed.push(key);
      this.game.saito_cards_removed_reason.push(reason);
    }

  }


  returnDiscardedCards(deckidx=1) {

    let discarded = {};
    let all_cards = this.returnAllCards();  

    for (var i in this.game.deck[deckidx - 1].discards) {
      if (all_cards[i]) {
        discarded[i] = all_cards[i];
      }
    }   

    this.game.deck[deckidx - 1].discards = {};
          
    return discarded;


  }
  


  /////////////////
  // Play Events //
  /////////////////
  //
  // the point of this function is either to execute events directly
  // or permit the relevant player to translate them into actions
  // that can be directly executed by UPDATE BOARD.
  //
  // this function returns 1 if we can continue, or 0 if we cannot
  // in the handleGame loop managing the events / turns that are
  // queued up to go.
  //
  playEvent(player, card) {

    if (this.game.deck[0].cards[card] != undefined) {
      this.updateStatus(`${player.toUpperCase()} triggers ${this.cardToText(card)}`);
    } else {
      console.log("sync loading error -- playEvent on card: " + card);
      return 1;
    }


    let i_played_the_card = (this.roles[this.game.player] == player);

