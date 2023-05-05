const Scoreboard = require("./lib/scoreboard");
const GameTemplate = require("../../lib/templates/gametemplate");
const SettlersSkin = require("./lib/settlers.skin.js");
const SettlersRules = require("./lib/overlays/rules");
const SettlersWelcome = require("./lib/overlays/welcome");
const SettlersStats = require("./lib/overlays/stats");
const SettlersGameOptionsTemplate = require("./lib/settlers-game-options.template");
const SettlersTradeHelpOverlayTemplate = require("./lib/settlers-trade-help-overlay.template");

const SettlersGameLoop = require("./lib/src/settlers-gameloop.js");
const SettlersPlayer = require("./lib/src/settlers-player");
const SettlersState = require("./lib/src/settlers-state");
const SettlersActions = require("./lib/src/settlers-actions");
const SettlersInit = require("./lib/src/settlers-init");
const BuildOverlay = require("./lib/overlays/build");
const BankOverlay = require("./lib/overlays/bank");
const DevCardOverlay = require("./lib/overlays/dev-card");
const YearOfPlentyOverlay = require("./lib/overlays/year-of-plenty");
const DiscardOverlay = require("./lib/overlays/discard");
const MonopolyOverlay = require("./lib/overlays/monopoly");

//////////////////
// CONSTRUCTOR  //
//////////////////
class Settlers extends GameTemplate {

  constructor(app) {
    super(app);

    this.app = app;

    this.name = "Settlers";
    this.gamename = "Settlers of Saitoa";
    this.description = `Explore the island of Saitoa, collect resources, and build your way to dominance.`;
    this.categories = "Games Boardgame Strategy";

    this.skin = new SettlersSkin();

    this.cardbox.a_prompt = 0;
    this.minPlayers = 2;
    this.maxPlayers = 4;
    this.game_length = 20; //Estimated number of minutes to complete a game
    this.is_sleeping = true;
    this.confirm_moves = true;

    // UI components
    this.scoreboard = new Scoreboard(this.app, this);
    this.rules_overlay = new SettlersRules(this.app, this);
    this.welcome_overlay = new SettlersWelcome(this.app, this);
    this.stats_overlay = new SettlersStats(this.app, this);

    this.grace_window = 24;
    // temp variable to help with post-splash flash
    this.currently_active_player = 0;

    this.build = new BuildOverlay(this.app, this);
    this.bank = new BankOverlay(this.app, this);
    this.dev_card = new DevCardOverlay(this.app, this);
    this.year_of_plenty = new YearOfPlentyOverlay(this.app, this);
    this.discard = new DiscardOverlay(this.app, this);
    this.monopoly = new MonopolyOverlay(this.app, this);

    this.enable_observer = false;
  }

       

  initializeHTML(app) {

    if (!this.browser_active) { return; }

    //Prevent this function from running twice as saito-lite is configured to run it twice
    if (this.initialize_game_run) {return;} 

    super.initializeHTML(app);
    
    this.scoreboard.render();

    this.menu.addMenuOption("game-game", "Game");
    this.menu.addSubMenuOption("game-game", {
      text: "How to Play",
      id: "game-help",
      class: "game-help",
      callback: function (app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.rules_overlay.render();
      },
    });
    this.menu.addSubMenuOption("game-game", {
      text: "Stats",
      id: "game-stats",
      class: "game-stats",
      callback: function (app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.stats_overlay.render();
      },
    });
    this.menu.addSubMenuOption("game-game", {
      text: "Log",
      id: "game-log",
      class: "game-log",
      callback: function (app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.log.toggleLog();
      },
    });

    this.menu.addChatMenu();

    this.menu.render();
    this.log.render();

    this.hexgrid.render(".gameboard");

    try {

      this.skin.render(this.game.options.theme);

      this.cardbox.render();
      this.cardbox.addCardType("handy-help","",null);
      this.cardbox.makeDraggable();

      this.playerbox.render();
      this.playerbox.addStatus();
      //this.playerbox.classList.add("saitoa");
      this.playerbox.addClass("me", this.game.player);

      for (let i = 1; i <= this.game.players.length; i++) {
        this.playerbox.addClass(`c${this.game.colors[i-1]}`, i);
        if (i != this.game.player) {
          this.playerbox.addClass("notme", i);
        }
      }

      if (this.game.players.length > 2 || this.game.player == 0) {
        this.playerbox.groupOpponents();
      }
      this.playerbox.makeDraggable();
      $(".player-box *").disableSelection();

      if (app.browser.isMobileBrowser(navigator.userAgent)) {
        this.hammer.render(this.app, this);
        this.hammer.attachEvents(
          this.app,
          this,
          "#game-hexgrid"
        );
      } else {
        this.sizer.render();
        this.sizer.attachEvents("#game-hexgrid");
      }

      //
      // Preliminary DOM set up, adding elements to display
      console.log(this.game.state);
      this.addCitiesToGameboard();
      this.addPortsToGameboard();

      this.displayBoard();
   
      if (this.game.state.placedCity == null){
        $(".dark").css("backgroundColor","unset");  
      }
      

    } catch (err) {
      console.log("Intialize HTML: "+err);
    }


    //
    // add the HUD so we can leverage it
    //
    this.hud.render();
    document.querySelector('#hud')?.classList.add('saitoa');
  


    //
    // tweak - make hud draggable by body
    //
    document.querySelector(".hud-header").style.display = "none";
    //this.app.browser.makeDraggable("hud", "hud", true);
      
 

    //
    // mobile UI toggles
    //
    this.app.browser.prependElementToSelector('<div class="mobile"><div class="score">score</div><div class="trade">trade</div></div>', '.hud-body');
    this.app.browser.addElementToSelector('<div class="mobile-trading-container"></div>', '.gameboard');
    let num_playerboxes = 0;
    let gas = ``; // grid-area-string
    let gtr = ``;
    document.querySelectorAll(".player-box").forEach((el) => {
      num_playerboxes++;
      el.style.gridArea = `area${num_playerboxes}`;
      gas += `"area${num_playerboxes}" `;
      gtr += `min-content `;
      document.querySelector(".mobile-trading-container").appendChild(el);
    });
    document.querySelector(".mobile-trading-container").style.gridTemplateAreas = gas;
    document.querySelector(".mobile-trading-container").style.gridTemplateColumns = "1fr";
    document.querySelector(".mobile-trading-container").style.gridTemplateRows = gtr;
    document.querySelector(".mobile-trading-container").style.rowGap = "2.5vh";

    document.querySelector(".hud-body .mobile .score").onclick = (e) => {
      let s = document.querySelector(".scoreboard");
      s.style.display = "block";
      //
      // desktop show the stats menu - which has the score
      //
      if (s.style.zIndex < 10) {
        this.stats_overlay.render();
        return;
      }
      document.querySelector(".mobile-trading-container").style.display = "none";
      if (s.style.display != "block") { s.style.display = "block"; } else { s.style.display = "none"; }
    }
    document.querySelector(".hud-body .mobile .trade").onclick = (e) => {
      let s = document.querySelector(".mobile-trading-container");
      //
      // desktop might already have the hud visible
      //
      if (s.style.zIndex < 10) { 
        document.querySelector(".scoreboard").style.display = "none";
	this.showResourceOverlay();
	return;
      }
      if (s.style.display != "grid") { s.style.display = "grid"; } else { s.style.display = "none"; }
    }

  }

  initializeGame(game_id) {

    if (this.game.state == undefined) {
      this.game.state = this.initializeState();

      let colors = [1, 2, 3, 4];
      this.game.colors = [];
      for (let i = 0; i < this.game.players.length; i++){
        this.game.colors = this.game.colors.concat(colors.splice(this.rollDice(colors.length)-1,1));
      }

      this.skin.render(this.game.options.theme);
      this.game.stats = this.initializeStats();

      console.log("---------------------------");
      console.log("---------------------------");
      console.log("------ INITIALIZE GAME ----");
      console.log("---------------------------");
      console.log("---------------------------");

      this.game.queue.push("init");

      let numPlay = this.game.players.length;

      for (let i = 1; i <= numPlay; i++) {
        this.game.queue.push("player_build_road\t" + i + "\t1");
        this.game.queue.push(`player_build_city\t${i}\t0`);
      }
      for (let i = numPlay; i >= 1; i--) {
        this.game.queue.push("player_build_road\t" + i + "\t1");
        this.game.queue.push(`player_build_city\t${i}\t0`);
      }

      this.game.queue.push("READY");
      //Board
      this.game.queue.push("generate_map");

      this.game.queue.push(`POOLDEAL\t3\t18\t2`);
      this.game.queue.push(`POOLDEAL\t2\t19\t1`);

      this.game.queue.push(`DECKANDENCRYPT\t3\t${numPlay}\t${JSON.stringify(this.returnDiceTokens())}`);
      this.game.queue.push(`DECKANDENCRYPT\t2\t${numPlay}\t${JSON.stringify(this.skin.returnHexes())}`);

      //Development Cards
      this.game.queue.push(`DECKANDENCRYPT\t1\t${numPlay}\t${JSON.stringify(this.skin.returnDeck())}`);
    
    }

    this.resetPlayerNames();

    if (this.game.players.length > 2){
      this.grace_window = this.game.players.length * 12;
    }

  }

  initializeState() {

    let state = {};
    state.hexes = {};
    state.roads = [];
    state.cities = [];
    state.longestRoad = { size: 0, player: 0, path: [] };
    state.largestArmy = { size: 0, player: 0 };
    state.players = [];
    state.ads = [];
    state.playerTurn = 0;
    state.ports = {};
    state.lastroll = [];
    state.placedCity = "hello world"; //a slight hack for game iniitalization
    state.welcome = 0;
    for (let i = 0; i < this.game.players.length; i++) {
        state.ads.push({});

        state.players.push({});
        state.players[i].resources = [];
        state.players[i].vp = 0;
        state.players[i].towns = 5;
        state.players[i].cities = 4;
        state.players[i].knights = 0;
        state.players[i].vpc = 0;
        state.players[i].devcards = 0;
        state.players[i].ports = [];
    }
    return state;
}

initializeStats() {
  let stats = {};
  stats.dice = {};
  stats.production = {};
  for (let i = 2; i <= 12; i++) {
      stats.dice[i] = 0;
  }

  for (let r of this.skin.resourceArray()) {
      let array = new Array(this.game.players.length);
      array.fill(0);
      stats.production[r] = array;
  }
  return stats;
}


returnDiceTokens() {
  let dice = [];
  dice.push({ value: 2 });
  dice.push({ value: 12 });
  for (let i = 3; i < 7; i++) {
      dice.push({ value: i });
      dice.push({ value: i });
      dice.push({ value: i + 5 });
      dice.push({ value: i + 5 });
  }
  return dice;
}


returnGameOptionsHTML() {
  return SettlersGameOptionsTemplate(this.app, this);
}

returnTradeHelpOverlay(){
  return SettlersTradeHelpOverlayTemplate(this.app, this);
}


}

Settlers.importFunctions(SettlersInit, SettlersGameLoop, SettlersPlayer, SettlersState, SettlersActions);

module.exports = Settlers;
