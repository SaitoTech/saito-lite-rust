const GameTemplate = require("../../lib/templates/gametemplate");
const GameHexGrid = require("../../lib/saito/ui/game-hexgrid/game-hexgrid");
const SettlersSkin = require("./lib/settlers.skin.js");


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
    this.categories = "Games Arcade Entertainment";
    this.type = "Strategy Boardgame";
    this.status = "Beta";

    this.hexgrid = new GameHexGrid();
    this.skin = new SettlersSkin();

    this.cardbox.skip_card_prompt = 0;
    this.minPlayers = 2;
    this.maxPlayers = 4;

    this.tradeWindowOpen = false;
    this.is_sleeping = true;
  }
  //
  // requestInterface(type) {
  //
  //   if (type == "arcade-sidebar") {
  //     return { title: this.name };
  //   }
  //   return null;
  // }
  //
  // manually announce arcade banner support
  //
  respondTo(type) {
    if (super.respondTo(type) != null) {
      return super.respondTo(type);
    }
    if (type == "arcade-carousel") {
      let obj = {};
      obj.background = "/settlers/img/arcade/arcade-banner-background.png";
      obj.title = "Settlers";
      return obj;
    }

    return null;
  }

  /*
  Advanced Game options for Arcade
  */
  returnGameOptionsHTML() {
    return `
        <div class="overlay-input">
            <label for="game_length ">Game Length:</label>
            <select name="game_length">
              <option value="8" >8 VP - for a quick sprint</option>
              <option value="10" selected>10 VP - standard game</option>
              <option value="12">12 VP - marathon</option>
            </select>
            <div id="game-wizard-advanced-return-btn" class="game-wizard-advanced-return-btn button">accept</div>
        </div>
    `;
    /*let html = `
          <div class="overlay-input">
          <label for="theme">Game Version:</label>
          <select name="theme">
            <option value="classic" selected title="Familiar version of the game with ore, wheat, bricks, wood and sheep">Classic</option>`;
    //<option value="elements" title="Magical version of game where players cultivate the five elements (earth, fire, water, metal, and wood)">Elemental</option>
    html += `</select>
          </div>
          <div id="game-wizard-advanced-return-btn" class="game-wizard-advanced-return-btn button">accept</div>
    `;
    return html;*/
  }


  returnTradeHelpOverlay(){
    let html = `<div class="rules-overlay">
                <h1>Trading</h1>
                <p>There are several mechanisms in the game to initiate trades, but two things should be noted. First, you are not technically allowed to initiate trades unless it is your turn, or at the very most, you may propose a trade to the player who turn it is. Secondly, double click anyone's name to open a chat window with them. This is a social game, and you can do all the wheeling and dealing you want simply by talking to the other players.</p>
                <h2>Open Offers</h2>
                <div>
                  <img style="float:left; margin:1em;" src="/settlers/img/help/tradeBroadcast1.png">
                  <p>On your turn, you can initiate a trade offer by selecting <em>Make Offer</em> from the Trade menu. This opens an interface where you can specify how many of which resources you want in exchange for what. Click the resource name to add resources to your tender and click the resource images to remove them. </p>
                </div>
                <img src="/settlers/img/help/tradeBroadcast2.png">
                <div>
                <img style="float:right; margin:1em;" src="/settlers/img/help/tradeBroadcast4.png">
                <p>If you have more than one opponent, you must wait until either all players have rejected your offer, or one of them has accepted it. The first player to click accept will complete the trade, and any subsequent players will be excluded from the trade. If you change your mind or are tired of waiting for your opponents to decide on the trade, you may "withdraw" the offer.</p>
                </div>
                <h2>Incoming Offers</h2>
                <p>In general, incoming trade offers take the following form:</p>
                <img src="/settlers/img/help/tradeBroadcast3.png">
                <p>Assuming you have the requested resources, you will have the choice to accept or reject the trade offer. If you don't have the enough resources, you still get to see the offer, and should close it so that the other player may continue with their turn.</p>
                <div>
                  <img style="float:left; margin:1em;" src="/settlers/img/help/privateTrade1.png">
                  <p>During an opponent's turn, when trading is allowed, you can open the private trading interface to propose an offer to them. You may only make one such offer, so it is best to communicate with them first through chat.</p>
                </div>
                <p>On your turn, you will be notified by an alert of any incoming trade offers, and the details will be summarized in your opponents player box.</p>
                <p>There may be multiple incoming offers to choose from. You may accept the trade as is, reject it, or completely ignore it and carry on with your turn. The offer automatically expires as soon as end the trading phase of your turn.</p>
                <img style="width:100%" src="/settlers/img/help/tradeIncomingOffer.png">
                <h2>Passive Offers</h2>
                <p>It is often the case that you desperately need a particular resource, or are flush with that resource. You are open to trading, but don't have anything in particular in mind. Nevertheless, it may be helpful for your opponents to know what you have and/or want so they can make an offer to you and you don't want to have to keep asking in the chat group "Does anyone have X?". If so, you can use the <em>Advertise</em> option from the trade menu to notify the other players about the state of your hand</p>
                <img src="/settlers/img/help/tradeAdvert2.png">
                <p>With this interface, you don't specify exact numbers, just which resources you want or have for trading.</p>
                <div>
                <img style="float:right;" src="/settlers/img/help/tradeAdvert3.png">
                <p>Your status will be reflected in your corresponding playerbox on your opponent's screen. On their turn or your turn, they may directly click your advertisement to open a "Private Trading Interface." They are under no obligation to respect your wishes and may counter your offer with any trade request. Your advertisement will persist across turns. You may select <em>Cancel</em> in the Trade menu to remove it. Note that sending a trade offer to a player on their turn will also clear your advertisment.</p>
                </div>
                
                </div>`;

    return html;
  }

  returnWelcomeOverlay(){
    let html = `<div class="rules-overlay trade_overlay">
                <h1>Welcome to the Island of Saitoa</h1>
                <h2>Initial Placement Phase</h2>
                <p>Every one gets to start by placing two ${this.skin.c1.name}s anywhere on the board, each with an attached ${this.skin.r.name}. ${this.skin.c1.name}s go on the corners of the hexagon tiles, while ${this.skin.r.name}s go on the edges. When the dice roll the number of that tile, adjacent ${this.skin.c1.name}s produce that resource.</p>
                <p>In order to be fair, the players take turns making their initial placement first in last out, i.e. the first player to place their first ${this.skin.c1.name} is the last player to place their second ${this.skin.c1.name}. You begin the game with the resources adjacent to your second ${this.skin.c1.name}.</p>
                <h2>Good Luck!</h2>
                <p>For more detailed instructions of the game, see "RULES" under the game menu. For detailed instructions on trading, refer to the "HELP" item under the trade menu.</p>
                <div class="button close_welcome_overlay" id="close_welcome_overlay">Start Playing</div>
                </div>
  `;
    return html;
  }


  /*
  Make Overlay of game introduction/Rules
  */
  returnGameRulesHTML() {
    let skin = this.skin;
    if (!skin || skin.empty){
      skin = new SettlersSkin();
      skin.render();
    }
    let overlay_html = `

  <div class="rules-overlay trade_overlay">
  <h1>${skin.gametitle}</h1>
  <h2>Overview</h2>
  <p>The game mechanics should be familiar to anyone who has played resource-acquisition boardgames based on trading and building.</p>
  <h2>Set up</h2>
  <p>Each player gets to place 2 ${skin.c1.name}s and 2 adjoining ${skin.r.name}s anywhere on the board during the initial setup. <em>Note: </em> ${skin.c1.name}s may not be placed on adjacent corners (i.e. only seperated by a single ${skin.r.name}, whether or not one is actually built).</p>
  <p>The order of placement reverses so that last player to place their first ${skin.c1.name} is the first to place their second ${skin.c1.name}. Each player starts with resource cards from the tiles adjacent to their second placed ${skin.c1.name}.</p>
  <h2>Game Play</h2>
  <p>Each player's turn consists of a number of moves: roll, trade, build, buy card, play card. They begin by rolling the dice. The number of the roll determines which tiles produce resources (see section on ${skin.b.name}). Players with ${skin.c1.name}s on the producing tiles collect resources from those tiles.</p>
  <p>Players may then trade with each other or with the "bank." Trades with the bank require 4 identical resources to be exchanged for any other resource. However, if players have a ${skin.c1.name} adjacent to a trade ship, they can get a better rate with the "bank." There are no restrictions on trades between players, who may trade any number of resources. Once a player has bought a card or built something, they may no longer make trades during their turn. All trades must involve the player whose turn it is.</p>
  <h3>Building and Costs</h3>
  <p>After the player is satisfied with their trades (if any), they may build something or purchase a ${skin.card.name} card. Players must have sufficient resources to afford the purchases, as defined below:</p>
  <ul style="margin-left:2em"> <li>A ${skin.r.name} costs ${skin.priceList[0]}</li>
  <li>A ${skin.c1.name} costs ${skin.priceList[1]}</li>
  <li>A ${skin.c2.name} costs ${skin.priceList[2]}</li>
  <li>A ${skin.card.name} card costs ${skin.priceList[3]}</li></ul>
  <p> A ${skin.c2.name} replaces an already built ${skin.c1.name} and collects double the resources of a ${skin.c1.name}.</p>
  <h3 style="text-transform:capitalize">${skin.b.name}</h3>
  <p>If a 7 is rolled, the ${skin.b.name} comes into play. The ${skin.b.name} does 3 things. First, any players with more than 7 resource cards must discard half their hand. Second, the rolling player may move the ${skin.b.name} to any tile. The ${skin.b.name} may steal one resource from any player with a ${skin.c1.name} or ${skin.c2.name} adjacent to the affected tile. Third, that tile is deactivate by the presence of the ${skin.b.name} and will not produce resources until the ${skin.b.name} is moved. The ${skin.b.name} will be moved on the next roll of a 7 or if a player purchases and plays a ${skin.s.name} from the ${skin.card.name} cards.</p>
  <h3 style="text-transform:capitalize">${skin.card.name} cards</h3>
  <p>There are many kinds of ${skin.card.name} cards, though the aforementioned ${skin.s.name} is the most common type. Some allow the player to perform a special action (such as building additional ${skin.r.name} at no cost or collecting additional resources), while others give the player an extra ${skin.vp.name}. Players may play a ${skin.card.name} card at any time during their turn (including before the roll), but may only play one per turn and only on the turn after purchasing it. ${skin.card.name} cards which give +1 ${skin.vp.name} are exempt from these restrictions.</p> 
  <h2>Winning the Game</h2>
  <p>${skin.vp.name} are important because the first player to accumulate 10 ${skin.vp.name} is declared the winner of the game. Players earn ${skin.vp.name} by building ${skin.c1.name}s (worth 1 ${skin.vp.name} each) and ${skin.c1.name}s (worth 2 ${skin.vp.name}s each). There are also two special achievements worth 2 ${skin.vp.name}s each.</p>
  <p> The player with the longest contiguous ${skin.r.name} of at least 5 is awarded the "${skin.longest.name}" badge. Similarly, if a player accumulates at least 3 ${skin.s.name}s, they are awarded the "${skin.largest.name}" badge. Only one player may hold either badge, and other players must surpass them to claim it for themselves.</p>
  <h2>FAQ</h2>
  <dl>
  <dt>Why can't I build a ${skin.c1.name}?</dt>
  <dd>In order to build a ${skin.c1.name}, you have to satisfy several requirements. Firstly, you must have all the resources required to build. Secondly, you must have an available spot on the board, which is both connected to one of your roads and not adjacent to any other ${skin.c1.name}s or ${skin.c2.name}s. Thirdly, you many only have up to 5 ${skin.c1.name}s on the board at any time. Try upgrading one of your ${skin.c1.name}s to a ${skin.c2.name}. </dd>
  <dt>Why can't I build a ${skin.c2.name}?</dt>
  <dd>See the above answer, but note that you are limited to 4 ${skin.c2.name}s on the board.</dd>
  </dl>
  </div>
   `;

   return overlay_html;
  }

  initializeHTML(app) {

    if (!this.browser_active) { return; }

    super.initializeHTML(app);
    if (this.game.state.lastroll.length == 0){
      $(".diceroll").css("display", "none");
    }else{
      this.displayDice();  
    }

    this.app.modules.respondTo("chat-manager").forEach((mod) => {
      mod.respondTo("chat-manager").render(app, this);
      mod.respondTo("chat-manager").attachEvents(app, this);
    });

    this.menu.addMenuOption({
      text: "Game",
      id: "game-game",
      class: "game-game",
      callback: function (app, game_mod) {
        game_mod.menu.showSubMenu("game-game");
      },
    });
    this.menu.addSubMenuOption("game-game", {
      text: "Instructions",
      id: "game-help",
      class: "game-help",
      callback: function (app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.overlay.show(app, game_mod, game_mod.returnGameRulesHTML());
      },
    });
    this.menu.addSubMenuOption("game-game", {
      text: "Stats",
      id: "game-stats",
      class: "game-stats",
      callback: function (app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.overlay.show(app, game_mod, game_mod.returnStatsOverlay());
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
    this.menu.addSubMenuOption("game-game", {
      text: "Exit",
      id: "game-exit",
      class: "game-exit",
      callback: function (app, game_mod) {
        window.location.href = "/arcade";
      },
    });

    this.menu.addChatMenu(this.app, this);
    
    this.menu.addMenuIcon({
      text: '<i class="fa fa-window-maximize" aria-hidden="true"></i>',
      id: "game-menu-fullscreen",
      callback: function (app, game_mod) {
        game_mod.menu.hideSubMenus();
        app.browser.requestFullscreen();
      },
    });

    this.menu.addMenuOption({
      text: "Trade",
      id: "game-trade",
      class: "game-trade",
      callback: function (app, game_mod) {
        game_mod.menu.showSubMenu("game-trade");
      },
    });
    
    this.menu.addSubMenuOption("game-trade", {
      text: "Make Offer",
      id: "game-offer",
      class: "game-offer",
      callback: function (app, game_mod) {
        game_mod.menu.hideSubMenus();
        if (game_mod.game.state.canTrade && game_mod.game.player ===  game_mod.game.state.playerTurn) {
            game_mod.tradeWindowOpen = true;
            game_mod.showTradeOverlay();
        }else{
          salert("You cannot trade right now");
        }
      },
    });

    this.menu.addSubMenuOption("game-trade", {
      text: "Advertise",
      id: "game-advert",
      class: "game-advert",
      callback: function (app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.showResourceOverlay();
      },
    });

    this.menu.addSubMenuOption("game-trade", {
      text: "Clear",
      id: "game-rescind",
      class: "game-rescind",
      callback: function (app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.clearAdvert();
      },
    });
    this.menu.addSubMenuOption("game-trade", {
      text: "Help",
      id: "game-trade-help",
      class: "game-trade-help",
      callback: function (app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.overlay.show(app, game_mod, game_mod.returnTradeHelpOverlay());
      },
    });

    this.menu.render(app, this);
    this.menu.attachEvents(app, this);

    this.restoreLog();
    this.log.render(app, this);
    this.log.attachEvents(app, this);

    this.hexgrid.render(app, this);
    this.hexgrid.attachEvents(app, this);

    try {
      this.skin.render(this.game.options.theme);

      this.cardbox.render(app, this);
      this.cardbox.attachEvents(app, this);
      this.cardbox.addCardType("handy-help","",this.cardbox_callback);
      
      //Let's Try a PlayerBox instead of hud
      this.playerbox.render(app, this);
      this.playerbox.attachEvents(app);

      this.playerbox.addStatus();
      this.playerbox.addClass("me", this.game.player);

      for (let i = 1; i <= this.game.players.length; i++) {
        this.playerbox.addClass(`c${i}`, i);
        if (i != this.game.player) {
          this.playerbox.addClass("notme", i);
        }
      }
      if (this.game.players.length > 2) {
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
        this.sizer.render(this.app, this);
        this.sizer.attachEvents(this.app, this, "#game-hexgrid");
      }

      //
      // Preliminary DOM set up, adding elements to display
      this.addCitiesToGameboard();
      this.addPortsToGameboard();

      this.displayBoard();
   
    } catch (err) {
      console.log("Intialize HTML: "+err);
    }

  }

  initializeGame(game_id) {
    //
    // initialize
    //
    if (this.game.state == undefined) {
      this.game.state = this.returnState();

      //Running in InitializeHTML and InitializeGame just in case
      this.skin.render(this.game.options.theme);
      this.game.stats = this.returnInitStats();

      this.initializeDice();

      console.log("---------------------------");
      console.log("---------------------------");
      console.log("------ INITIALIZE GAME ----");
      console.log("---------------------------");
      console.log("---------------------------");
      console.log("---------------------------");

      this.game.queue.push("init");

      for (let i = 1; i <= this.game.players.length; i++) {
        this.game.queue.push("player_build_road\t" + i);
        this.game.queue.push("player_build_city\t" + i);
      }
      for (let i = this.game.players.length; i >= 1; i--) {
        this.game.queue.push("player_build_road\t" + i);
        this.game.queue.push("player_build_city\t" + i);
      }

      this.game.queue.push("READY");
      //Board
      this.game.queue.push("generate_map");
      /*
      For some reason, you can only flip one card at a time, otherwise the decrypting fucks up
      But we treat the tiles and numeric tokens as decks to randomize the order
      */
      for (let j = 0; j < 19; j++) {
        for (let i = this.game.players.length - 1; i >= 0; i--) {
          this.game.queue.push("FLIPCARD\t2\t1\t1\t" + (i + 1)); //tiles
        }
        this.game.queue.push("FLIPRESET\t1");
      }
      for (let j = 0; j < 18; j++) {
        for (let i = this.game.players.length - 1; i >= 0; i--) {
          this.game.queue.push("FLIPCARD\t3\t1\t2\t" + (i + 1)); //tokens
        }
        this.game.queue.push("FLIPRESET\t2");
      }

      this.game.queue.push(
        "DECKANDENCRYPT\t3\t" +
          this.game.players.length +
          "\t" +
          JSON.stringify(this.returnDiceTokens())
      );
      this.game.queue.push(
        "DECKANDENCRYPT\t2\t" +
          this.game.players.length +
          "\t" +
          JSON.stringify(this.skin.returnHexes())
      );

      //Development Cards
      this.game.queue.push(
        "DECKANDENCRYPT\t1\t" +
          this.game.players.length +
          "\t" +
          JSON.stringify(this.skin.returnDeck())
      );
    }
  }

  returnStatsOverlay(){
    let html = `<div class="rules-overlay">
                <h1>Game Statistics</h1>`;

    //Fucking Dice
    html += `<table class="stats-table"><caption>Dice Rolls</caption><thead><tr><th>Rolls: </th>`;
    for (let i = 2; i <= 12; i++){
      html += `<th>${i}</th>`;
    }
    html += `</tr></thead><tbody><tr><th>Freq: </th>`;
    for (let i = 2; i <= 12; i++){
      html += `<td>${this.game.stats.dice[i]}</td>`;
    }
    html += `</tr></tbody></table>`;
   
    //Production Log
    html += `<table class="stats-table"><caption>Resources Produced</caption><thead><tr><th></th>`;
    for (let r in this.game.stats.production){
      html += `<th>${this.returnResourceHTML(r)}</th>`; 
    }
    html += `<th>Sum</th></tr></thead><tbody>`;

    for (let j = 0; j < this.game.players.length; j++){
      let count = 0;
      html += `<tr><th>Player ${j+1}</th>`;  
      for (let r in this.game.stats.production){
        html += `<td>${this.game.stats.production[r][j]}</td>`; 
        count += this.game.stats.production[r][j]
      }
      html += `<td>${count}</td></tr>`;
    }
    html += `<tr><th>Total:</th>`;
    for (let r in this.game.stats.production){
      let count = 0;
      for (let j = 0; j < this.game.players.length; j++){
        count += this.game.stats.production[r][j];
      }
      html += `<td>${count}</td>`;
    }      
    html += `</tr>`;
    html += `</tbody></table>`;
    
    //VP Race
    html += `<table class="stats-table"><caption>VP Race</caption><thead><tr><th></th>`;
    html += `<th><div class="tip token p${this.game.player}">${this.skin.c1.svg}<div class="tiptext">${this.skin.c1.name}</div></div></th>`;
    html += `<th><div class="tip token p${this.game.player}">${this.skin.c2.svg}<div class="tiptext">${this.skin.c2.name}</div></div></th>`;
    html += `<th><div class="tip token">${this.skin.vp.svg}<div class="tiptext">${this.skin.vp.name}</div></div></th>`;
    html += `<th><div class="tip token">${this.skin.largest.svg}<div class="tiptext">${this.skin.largest.name}</div></div></th>`;
    html += `<th><div class="tip token">${this.skin.longest.svg}<div class="tiptext">${this.skin.longest.name}</div></div></th>`;
    html += `<th>Total</th></tr></thead><tbody>`;
    //Sort players by VP
    let ranking_scores = [this.game.state.players[0].vp];
    let ranking_players = [0];
    for (let i = 1; i < this.game.state.players.length; i++){
      let j = 0;
      for (; j < ranking_scores.length; j++){
        if (this.game.state.players[i].vp > ranking_scores[j]){
          break; 
        }
      }
      ranking_scores.splice(j,0,this.game.state.players[i].vp);
      ranking_players.splice(j,0,i);
    }
    for (let i = 0; i < ranking_scores.length; i++){
      let player = ranking_players[i];
      let numVil = 0;
      let numCity = 0;
      for (let j = 0; j < this.game.state.cities.length; j++) {
        if (this.game.state.cities[j].player === player + 1) {
          if (this.game.state.cities[j].level == 1){
            numVil++;
          }else{
            numCity++;
          }
        }
      }

      html += `<tr><th>Player ${player + 1}</th>
                <td>${numVil}</td>
                <td>${numCity}</td>
                <td>${this.game.state.players[player].vpc}</td>
                <td>${(this.game.state.largestArmy.player == player + 1)?this.game.state.largestArmy.size:""}</td>
                <td>${(this.game.state.longestRoad.player == player + 1)?this.game.state.longestRoad.size:""}</td>
                <td>${ranking_scores[i]}</td></tr>`;
    }
    

    html += `</tbody></table>`;

    return html+"</div>";
  }

  /*
  We want to track some statistics
  */
  returnInitStats(){
    let stats = {};
    stats.dice = {};
    stats.production = {};
    for (let i = 2; i <=12 ; i++){
      stats.dice[i]=0;
    }

    for (let r of this.skin.resourceArray()){
      let array = new Array(this.game.players.length);
      array.fill(0);
      stats.production[r] = array; 
    }
    return stats;
  }

  /*
  Create Initial Game State -- state is a commmon data structure the players "share"
  */
  returnState() {
    let state = {};
    state.hexes = {};
    state.roads = [];
    state.cities = [];
    state.longestRoad = { size: 0, player: 0 };
    state.largestArmy = { size: 0, player: 0 };
    state.players = [];
    state.playerTurn = 0;
    state.ports = [];
    state.lastroll = [];
    state.placedCity = "hello world"; //a slight hack for game iniitalization
    state.welcome = 0;
    for (let i = 0; i < this.game.players.length; i++) {
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

  /*
   * Core Game Logic
   * Commands: init, generate_map, winner
   */
  handleGameLoop() {
    let settlers_self = this;

    ///////////
    // QUEUE //
    ///////////
    if (this.game.queue.length > 0) {
      //Before popping, so if display players adds a win command, we will catch it.
      try {
        this.displayPlayers(); //Is it enough to update the player huds each iteration, board doesn't get redrawn at all?
      } catch (e) {
        //console.log("Attempting to access DOM elements which haven't been created yet");
        //console.log(e);
      }
      
      let qe = this.game.queue.length - 1;
      let mv = this.game.queue[qe].split("\t");

      //console.log("QUEUE: " + this.game.queue);
      //console.log(JSON.parse(JSON.stringify(this.game.state)));
      
      /* Game Setup */

      if (mv[0] == "init") {
        this.game.queue.splice(qe, 1);   
        this.game.state.placedCity = null; //We are in game play mode, not initial set up
        this.game.state.lastroll = [0,0];
        this.displayDice();
        $(".diceroll").css("display","");
        this.game.queue.push("round");
        this.displayModal("Now we begin game play");
        return 1;
      }

      if (mv[0] == "round"){ // no splice, we want to bounce off this
        for (let i = this.game.players.length; i > 0; i--) {
          //count backwards so it goes P1, P2, P3,
          this.game.queue.push(`play\t${i}`);
        }
        return 1;
      }

      if (mv[0] == "generate_map") {
        console.log("Building the map");
        this.game.queue.splice(qe, 1);
        this.generateMap();
        return 1;
      }

      if (mv[0] == "winner") {
        
        let winner = parseInt(mv[1]);
        this.game.queue.splice(qe, 1);

        this.updateLog(
          `Player ${winner} is ${this.skin.winState} of Saitoa! The game is over.`
        );
        if (this.game.player == winner) {
          this.updateStatus(
            `<div class="tbd">You are the winner! Congratulations!</div>`
          );
        } else {
          this.updateStatus(
            `<div class="tbd">Player ${winner} wins! Better luck next time.</div>`
          );
        }
        this.overlay.show(this.app, this, this.returnStatsOverlay());
        $(".rules-overlay h1").text(`Game Over: Player ${winner} wins!`);
        this.game.winner = this.game.players[winner - 1];
        this.resignGame(this.game.id); //? post to leaderboard - ignore 'resign'
        return 0;
      }

      /* Development Cards */

      if (mv[0] == "buy_card") {
        let player = parseInt(mv[1]);
        this.game.queue.splice(qe, 1);
        
        this.updateLog(`Player ${player} bought a ${this.skin.card.name} card`);
        this.stopTrading();

        //this player will update their devcard count on next turn
        if (player != this.game.player) {
          this.game.state.players[player - 1].devcards++; //Add card for display
        }else{
          this.boughtCard = true; //So we display dev cards on next refresh
        }
        return 1;
      }

      //Declare Victory point card
      if (mv[0] == "vp") {
        let player = parseInt(mv[1]);
        let cardname = mv[2]; //Maybe we want custom icons for each VPC?
        this.game.queue.splice(qe, 1);

        //Score gets recounted a lot, so we save the number of VP cards
        this.game.state.players[player - 1].vpc++; //Number of victory point cards for the player
        this.game.state.players[player - 1].devcards--; //Remove card (for display)

        this.updateLog(
          `Player ${player} played ${cardname} to gain 1 victory point`
        );
        return 1;
      }

      //Declare Road building
      if (mv[0] == "road_building") {
        let player = parseInt(mv[1]);
        let cardname = mv[2];
        this.game.queue.splice(qe, 1);

        this.game.state.players[player - 1].devcards--; //Remove card (for display)
        this.updateLog(`Player ${player} played ${cardname}`);
        return 1;
      }

      //Knight
      if (mv[0] == "play_knight") {
        let player = parseInt(mv[1]);
        let cardname = mv[2];
        this.game.queue.splice(qe, 1);

        this.updateLog(`Player ${player} played a ${cardname}!`);
        this.game.state.players[player - 1].devcards--; //Remove card (for display)
        //Update Army!
        this.game.state.players[player - 1].knights++;
        this.checkLargestArmy(player);

        //Move Bandit
        if (this.game.player == player) {
          this.playBandit();
        } else {
          this.updateStatus(
            `<div class="tbd">Waiting for Player ${player} to move the ${this.skin.b.name}...</div>`
          );
        }
        return 0;
      }

      if (mv[0] == "year_of_plenty") {
        let player = parseInt(mv[1]);
        let cardname = mv[2];
        let resources = JSON.parse(mv[3]); //The two resources the player picked

        this.game.queue.splice(qe, 1);

        for (let j of resources) {
          //Should always be 2
          this.game.state.players[player - 1].resources.push(j);
        }

        this.game.state.players[player - 1].devcards--; //Remove card (for display)
        this.updateLog(`Player ${player} played ${cardname}.`);
        return 1;
      }

      if (mv[0] == "monopoly") {
        let player = parseInt(mv[1]);
        let cardname = mv[2];
        let resource = mv[3];
        this.game.queue.splice(qe, 1);
        let lootCt = 0;
        //Collect all instances of the resource
        for (let i = 0; i < this.game.state.players.length; i++) {
          if (player != i + 1) {
            let am_i_a_victim = false;
            for (let j = 0; j < this.game.state.players[i].resources.length; j++) {
              if (this.game.state.players[i].resources[j] == resource) {
                am_i_a_victim = true;
                lootCt++;
                this.game.state.players[i].resources.splice(j, 1);
                j--;
              }
            }
            if (am_i_a_victim && this.game.player == i+1){
              this.displayModal(cardname,`Player ${player} stole all your ${resource}`);
            }
          }
        }
        //Award to Player
        for (let i = 0; i < lootCt; i++)
          this.game.state.players[player - 1].resources.push(resource);

        this.game.state.players[player - 1].devcards--; //Remove card (for display)
        this.updateLog(
          `Player ${player} played ${cardname} for ${resource}, collecting ${lootCt}.`
        );
        return 1;
      }

      /* Building Actions */

      // remove a resource from players stockpile
      if (mv[0] == "spend_resource") {
        let player = parseInt(mv[1]);
        let resource = mv[2]; //string name: "ore", "brick", etc

        let target =
          this.game.state.players[player - 1].resources.indexOf(resource);
        if (target >= 0) {
          this.game.state.players[player - 1].resources.splice(target, 1);
        } else {
          console.log(
            "Resource not found...",
            resource,
            this.game.state.players[player - 1]
          );
        }
        this.game.queue.splice(qe, 1);
        return 1;
      }

      // Build a road, let player pick where to build a road
      if (mv[0] == "player_build_road") {
        let player = parseInt(mv[1]);
        this.game.queue.splice(qe, 1);
        this.stopTrading();
        if (this.game.player == player) {
          this.playerBuildRoad(mv[1]);
        } else {
          this.updateStatus(
            `<div class="tbd">Player ${player} is building a ${this.skin.r.name}...</div>`
          );
        }
        return 0;
      }

      //Notify other players of where new road was built
      if (mv[0] == "build_road") {
        let player = parseInt(mv[1]);
        let slot = mv[2];
        this.game.queue.splice(qe, 1);

        this.buildRoad(player, slot);
        this.updateLog(`Player ${player} built a ${this.skin.r.name}`);
        this.checkLongestRoad(player); //Everyone checks
        return 1;
      }

      // Build a town
      // Let player make selection, other players wait
      if (mv[0] == "player_build_city") {
        let player = parseInt(mv[1]);
        this.game.queue.splice(qe, 1);
        this.stopTrading();

        //For the beginning of the game only...
        if (this.game.state.welcome == 0 && this.browser_active) {
            this.overlay.show(this.app, this, this.returnWelcomeOverlay());
            document.querySelector(".close_welcome_overlay").onclick = (e) => {
              this.overlay.hide();
            };
          this.game.state.welcome = 1;
        }

        if (this.game.player == player) {
          this.playerBuildCity(mv[1]);
        } else {
          this.updateStatus(
            `<div class="tbd">Player ${player} is building a ${this.skin.c1.name}...</div>`
          );
        }

        return 0; // halt game until next move received
      }

      //Get resources from adjacent tiles of second settlement during game set up
      if (mv[0] == "secondcity") {
        let player = parseInt(mv[1]);
        let city = mv[2];
        this.game.queue.splice(qe, 1);

        let logMsg = `Player ${player} starts with `;
        for (let hextile of this.hexgrid.hexesFromVertex(city)) {
          let bounty = this.game.state.hexes[hextile].resource;
          if (bounty !== this.skin.nullResource()){ //DESERT ATTACK
            logMsg += bounty + ", ";
            this.game.state.players[player - 1].resources.push(bounty);
            this.game.stats.production[bounty][player-1]++; //Initial starting stats  
          }
        }
        logMsg = logMsg.substring(0, logMsg.length - 2) + ".";
        this.updateLog(logMsg);
        return 1;
      }

      //Allow other players to update board status
      if (mv[0] == "build_city") {
        let player = parseInt(mv[1]);
        let slot = mv[2];

        this.game.queue.splice(qe, 1);

        if (this.game.player != player) {
          this.buildCity(player, slot);
        }
        this.updateLog(`Player ${player} built a ${this.skin.c1.name}`);

        return 1;
      }

      // Upgrade town to city
      // pause game for player to chose
      if (mv[0] == "player_upgrade_city") {
        let player = parseInt(mv[1]);
        this.game.queue.splice(qe, 1);
        this.stopTrading();
        if (this.game.player == player) {
          this.playerUpgradeCity(player);
        } else {
          this.updateStatus(
            `<div class="tbd">Player ${player} is upgrading to a ${this.skin.c2.name}...</div>`
          );
        }

        return 0; // halt game until next move received
      }

      //
      // upgrade town to city, propagate change in DOM
      //
      if (mv[0] == "upgrade_city") {
        let player = parseInt(mv[1]);
        let slot = mv[2];
        this.game.queue.splice(qe, 1);

        this.updateLog(
          `Player ${player} upgraded a ${this.skin.c1.name} to a ${this.skin.c2.name}`
        );
        for (let i = 0; i < this.game.state.cities.length; i++) {
          if (this.game.state.cities[i].slot === slot) {
            this.game.state.cities[i].level = 2;
            //Player exchanges city for town
            this.game.state.players[player - 1].cities--;
            this.game.state.players[player - 1].towns++;
            let divname = "#" + slot;
            $(divname).html(this.skin.c2.svg);
            $(divname).addClass(`p${player}`);
            return 1;
          }
        }
        //console.log("Upgrade city failed...",slot,this.game.state.cities);

        return 1;
      }

      /* Trading Actions */

      //
      // trade advertisement
      //
      if (mv[0] == "advertisement") {
        let offering_player = parseInt(mv[1]);
        let stuff_on_offer = JSON.parse(mv[2]);
        let stuff_in_return = JSON.parse(mv[3]);
        this.game.queue.splice(qe, 1);

        if (this.game.player != offering_player) {
          //Simplify resource objects
          let offer = this.wishListToImage(stuff_on_offer);
          let ask = this.wishListToImage(stuff_in_return);
          let id = `trade_${offering_player}`;
          let html = `<div class="trade" id="${id}">`;
          if (ask) {
            html += `<div class="flexline wishlist"><span>Wants: </span><span class="tip">${ask}</span></div>`;
          }
          if (offer) {
            html += `<div class="flexline wishlist"><span>Has: </span><span class="tip">${offer}</span></div></div>`;
          }
          this.playerbox.refreshLog(html, offering_player);
          id = "#" + id;
          $(id).off();
          $(id).on("click", function () {
            // >>>> Launch overlay window for private trade
            if (settlers_self.game.state.canTrade) {
              //It's my turn or their turn
              if (settlers_self.game.player === settlers_self.game.state.playerTurn) {
                settlers_self.showTradeOverlay(offering_player);
              } else if (offering_player === settlers_self.game.state.playerTurn) {
                settlers_self.showTradeOverlay(offering_player);
              } else {
                salert(`You can only trade on your turn or during Player ${offering_player}'s turn.`);
              }
            } else {
              salert(`You cannot trade now.`);
            }
          });
        }

        return 0;
      }

      if (mv[0] == "clear_advert") {
        let player = parseInt(mv[1]);
        this.game.queue.splice(qe, 1);
        if (this.game.player != player) {
          this.playerbox.refreshLog("", player);
        }
      }
      //
      // Player A has offered another player a trade
      //
      if (mv[0] === "offer") {
        let offering_player = parseInt(mv[1]);
        let receiving_player = parseInt(mv[2]);
        let stuff_on_offer = JSON.parse(mv[3]);
        let stuff_in_return = JSON.parse(mv[4]);
        this.game.queue.splice(qe, 1);

        if (this.game.player == receiving_player) {
          if (offering_player == this.game.state.playerTurn) {
            //Overlay Trade offer
            this.showTradeOffer(offering_player, stuff_in_return, stuff_on_offer);
          } else {
            //Within the playerbox to evaluate a trade offer
            //Check if I can accept the trade
            let can_accept = true;
            for (let r in stuff_in_return){
              if (this.countResource(this.game.player,r) < stuff_in_return[r]){
                can_accept = false;
              }
            }

            if (can_accept){
              this.displayModal("New trade offer");
            }

            //Simplify resource objects
            let offer = this.wishListToImage(stuff_on_offer) || "<em>nothing</em>";
            let ask = this.wishListToImage(stuff_in_return) || "<em>nothing</em>";

            let html = `<div class="pbtrade">
                          <div>Offers <span class="tip highlight">${offer}</span> for <span class="tip highlight">${ask}</span></div>`;
            
            if (can_accept){
              html += `<ul>
                        <li class="pboption" id="accept">accept</li>
                        <li class="pboption" id="reject">reject</li>
                      </ul>`;  
            }else{
              html += `<div class="pboption">You cannot meet the trade</div>
                       <ul><li class="pboption" id="reject">okay</li></ul>`;  
            }
            html += "</div>";

            this.playerbox.refreshLog(html, offering_player);
            let selector =
              "#player-box-" + this.playerbox.playerBox(offering_player);

            $(`${selector} .pboption`).off();
            $(`${selector} .pboption`).on("click", function () {
              settlers_self.playerbox.refreshLog("", offering_player);
              let choice = $(this).attr("id");
              if (choice == "accept") {
                
                settlers_self.addMove(
                  "accept_offer\t" +
                    settlers_self.game.player + "\t" +
                    offering_player + "\t" +
                    JSON.stringify(stuff_on_offer) + "\t" +
                    JSON.stringify(stuff_in_return)
                );
                settlers_self.endTurn();
              }
              if (choice == "reject") {
                settlers_self.addMove(`reject_offer\t${settlers_self.game.player}\t${offering_player}`);
                settlers_self.endTurn();
              }
            });
          }
        } else {
          if (this.game.player == offering_player) {
            this.updateStatus(
              `Player ${receiving_player} is considering your offer.`
            );
            //I only get to propose one offer if it is not my turn
            if (this.game.player != this.game.state.playerTurn) {
              this.game.state.canTrade = false;
            }
          }
        }

        return 0;
      }

      /*
      Set up queue for open trade offer
      */
      if (mv[0] === "multioffer") {
        let player = parseInt(mv[1]);
        this.game.queue.splice(qe, 1);
        this.game.state.tradingOpen = true;
        let playersToConsider = [];
        for (let i = 0; i < this.game.players.length; i++) {
          if (i + 1 !== player) {
            playersToConsider.push(i + 1);
          }
        }

        this.resetConfirmsNeeded(playersToConsider);
        this.game.queue.push(
          `consider_offer\t${player}\t${JSON.stringify(playersToConsider)}\t${
            mv[2]
          }\t${mv[3]}`
        );
        return 1;
      }

      if (mv[0] === "consider_offer") {
        let offering_player = parseInt(mv[1]);
        let playersToConsider = JSON.parse(mv[2]);
        let stuff_on_offer = JSON.parse(mv[3]);
        let stuff_in_return = JSON.parse(mv[4]);
        let amIPlaying = false;
        let confirmsNeeded = 0;
        let remainingPlayers = "";

        for (let i of playersToConsider) {
          if (this.game.confirms_needed[i - 1] == 1) {
            remainingPlayers += `Player ${i}, `;
            confirmsNeeded++;
            if (this.game.player === parseInt(i)) {
              //this.addMove("RESOLVE\t"+this.app.wallet.returnPublicKey());
              this.showTradeOffer(
                offering_player,
                stuff_in_return,
                stuff_on_offer,
                false
              );
              amIPlaying = true;
            }
          }
        }
        remainingPlayers = this.prettifyList(remainingPlayers);

        if (this.game.player != offering_player) {
          if (!amIPlaying) {
            settlers_self.updateStatus(
              settlers_self.getLastNotice(true) +
                `Waiting for ${remainingPlayers} to decide.`
            );
          }
        } else {
          let html = `<div class="tbd">${remainingPlayers} ${
            confirmsNeeded == 1 ? "is" : "are"
          } considering your offer</div>
                      <ul><li class="option" id="cancel">Withdraw offer</li></ul>`;
          settlers_self.updateStatus(settlers_self.getLastNotice(true) + html);

          $(".option").off();
          $(".option").on("click", function () {
            //settlers_self.addMove(`NOTIFY\tPlayer ${offering_player} withdrew the trade offer`);  //Log
            settlers_self.addMove(`withdraw\t${offering_player}`);
            settlers_self.endTurn();
          });
        }

        if (confirmsNeeded == 0) {
          this.game.queue.splice(qe, 1);
          return 1;
        }
        return 0;
      }

      if (mv[0] == "accept_offer_first") {
        this.game.queue.splice(qe, 1);

        //Is Offer still valid
        if (!this.game.state.tradingOpen) return 1;

        //Block other players
        this.clearTrading();

        //Execute Trade
        this.game.queue.push(
          "accept_offer\t" + mv[1] + "\t" + mv[2] + "\t" + mv[3] + "\t" + mv[4]
        );
        return 1;
      }

      if (mv[0] == "withdraw") {
        let player = parseInt(mv[1]);
        this.game.queue.splice(qe, 1);

        this.clearTrading();

        if (this.game.player != player) {
          this.updateStatus(
            `<div class="persistent">Player ${player} withdrew their trade offer</div>`
          );
        }
        return 1;
      }
      /*
        * Because we add and subtract resources through different methods, there is a lag in the UI where it looks like you only gained,
        the loss of resources doesn't come until later... It's because these is ....
        * This does not validate trading (no checking whether player has resource to give)
      */
      if (mv[0] === "accept_offer") {
        let accepting_player = parseInt(mv[1]);
        let offering_player = parseInt(mv[2]);
        let tradeOut = JSON.parse(mv[3]);
        let tradeIn = JSON.parse(mv[4]);
        this.game.queue.splice(qe, 1);

        // let offering player know
        if (this.game.player == offering_player) {
          this.updateStatus(
            `<div class='persistent'>Player ${accepting_player} accepted your offer</div>`
          );
        }
        if (this.game.player == accepting_player) {
          this.updateStatus(
            `<div class='persistent'>You completed a trade with Player ${offering_player}.</div>`
          );
        }
        if (
          this.game.player !== accepting_player &&
          this.game.player !== offering_player
        ) {
          this.updateStatus(
            `<div class="persistent">Players ${accepting_player} and ${offering_player} completed a trade.</div>`
          );
        }

        //Offering Player
        for (let i in tradeOut) {
          //i is resource name, offer[i]
          for (let j = 0; j < tradeOut[i]; j++) {
            //Ignores zeros
            this.game.queue.push(
              "spend_resource\t" + offering_player + "\t" + i
            ); //Just easier to do this in the queue
            this.game.state.players[accepting_player - 1].resources.push(i);
          }
        }
        for (let i in tradeIn) {
          //i is resource name, offer[i]
          for (let j = 0; j < tradeIn[i]; j++) {
            this.game.queue.push(
              "spend_resource\t" + accepting_player + "\t" + i
            ); //Just easier to do this in the queue
            this.game.state.players[offering_player - 1].resources.push(i);
          }
        }
        this.updateLog(
          `Players ${accepting_player} and ${offering_player} completed a trade.`
        );
        //

        return 1; //<><>Status updates get quickly overwritten<><>
      }

      if (mv[0] === "reject_offer") {
        let refusing_player = parseInt(mv[1]);
        let offering_player = parseInt(mv[2]);
        this.game.queue.splice(qe, 1);

        this.game.confirms_needed[refusing_player - 1] = 0; //Manually resolve
        if (this.game.player == offering_player) {
          this.updateStatus(
            "<div class='persistent'>Your offer has been rejected</div>"
          );
        }
        if (this.game.player == refusing_player) {
          this.updateStatus(
            `<div class='persistent'>You reject Player ${offering_player}'s trade.</div>`
          );
        }
        this.updateLog(
          `Player ${refusing_player} turned down a trade offer from Player ${offering_player}.`
        );
        return 1; //<><>Status updates get immediately overwritten<><>
      }

      /*
      Execute trade with bank
      */
      if (mv[0] === "bank") {
        let player = parseInt(mv[1]);
        let outCount = parseInt(mv[2]);
        let outResource = mv[3];
        let inCount = parseInt(mv[4]);
        let inResource = mv[5];
        this.game.queue.splice(qe, 1);

        // let offering player know
        if (this.game.player == player) {
          this.updateStatus(
            "<div class='persistent'>Your trade is completed</div>"
          );
        } else {
          this.updateStatus(
            `<div class='persistent'>Player ${player} traded with the bank</div>`
          );
        }
        for (let i = 0; i < outCount; i++) {
          this.game.queue.push(
            "spend_resource\t" + player + "\t" + outResource
          );
        }
        for (let j = 0; j < inCount; j++) {
          //Should always be 1
          this.game.state.players[player - 1].resources.push(inResource);
        }
        this.updateLog(`Player ${player} traded with the bank.`);

        return 1;
      }

      /*
        General Game Mechanics
      */
      //

      // Player turn begins by rolling the dice (or playing dev card if available)
      if (mv[0] == "play") {
        let player = parseInt(mv[1]);

        this.game.state.playerTurn = player;
        this.playerbox.insertGraphic("diceroll",player);


        if (this.game.player == player) {

          /*
          We put a lag in passing the length of the hand to the state.devcards
          so that we can know that the last card in the hand is "new" and unable to be played until their next turn 
          */
          this.game.state.players[player - 1].devcards =
            this.game.deck[0].hand.length;

          //Messaging to User
          let html = `<div class="tbd"><div class="player-notice">YOUR TURN:</div>`;
          html += `<ul>`;
          html += `<li class="option" id="rolldice">roll dice</li>`;
          if (settlers_self.canPlayerPlayCard()) {
            html += `<li class="option" id="knight">play card</li>`;
          }
          html += `</ul>`;
          html += `</div>`;

          this.updateStatus(html);

          //Flash to be like "hey it's your move"
          if (this.is_sleeping){
            this.playerbox.addClass('flash');
            setTimeout(() => {
                $(".flash").removeClass("flash");
              }, 3000);
              this.is_sleeping = false;  
          }

          //roll the dice by clicking on the dice
          if (document.querySelector("#diceroll")) {
            $("#diceroll").off();
            $("#diceroll").addClass("rhover");
            $("#diceroll").on("click", function () {
              $("#diceroll").off();
              $("#diceroll").removeClass("rhover");
              settlers_self.addMove("roll\t" + player);
              settlers_self.endTurn();
            });
          }

          //Or, choose menu option
          $(".option").off();
          $(".option").on("click", function () {
            $("#diceroll").off();
            let choice = $(this).attr("id");

            if (choice === "rolldice") {
              settlers_self.addMove("roll\t" + player);
              settlers_self.endTurn();
            }
            if (choice === "knight") {
              settlers_self.playerPlayCard();
            }
          });
        } else {
          this.updateStatus(
            `<div class="tbd">Player ${player} rolling dice...</div>`
          );
        }
        //this.game.queue.splice(qe, 1);
        return 0;
      }

      // Roll the dice
      //
      if (mv[0] == "roll") {
        let player = parseInt(mv[1]);
        this.game.queue.splice(qe - 1, 2);

        
        // everyone rolls the dice
        let d1 = this.rollDice(6);
        let d2 = this.rollDice(6);
        this.game.state.lastroll = [d1, d2];
        let roll = d1 + d2;
        this.updateLog(`Player ${player} rolled: ${roll}`);
        this.game.stats.dice[roll]++; //Keep count of the rolls

        // board animation
        this.displayDice();
        this.animateDiceRoll(roll);

        //Regardless of outcome, player gets a turn
        this.game.queue.push(`player_actions\t${player}`);
        this.game.queue.push("enable_trading"); //Enable trading after resolving bandit

        //Next Step depends on Dice outcome
        if (roll == 7) {
          this.game.queue.push("play_bandit\t" + player);

          //Manage discarding before bandit comes into play
          let playersToDiscard = [];
          for (let i = 0; i < this.game.state.players.length; i++) {
            if (this.game.state.players[i].resources.length > 7) {
              playersToDiscard.push(i + 1);
            }
          }

          if (playersToDiscard.length > 0) {
            this.resetConfirmsNeeded(playersToDiscard);
            this.game.queue.push(
              "NOTIFY\tAll players have finished discarding"
            );
            this.game.queue.push(
              "discard\t" + JSON.stringify(playersToDiscard)
            ); //One queue move all the players
          }
        } else {
          this.game.queue.push(`collect_harvest\t${roll}`);
        }
        return 1;
      }

      if (mv[0] == "enable_trading"){
        this.game.queue.splice(qe, 1);
        this.game.state.canTrade = true; //Toggles false when the player builds or buys
        return 1;
      }

      //
      // gain resources if dice are !7
      //
      if (mv[0] == "collect_harvest") {
        let roll = parseInt(mv[1]);
        this.game.queue.splice(qe, 1);
        this.collectHarvest(roll);
        return 1;
      }

      /*
      Each player checks if they are on the toGo list, and if so must discard cards
      Otherwise, they just hang out...
      */
      if (mv[0] == "discard") {
        let playersToGo = JSON.parse(mv[1]);
        //this.game.queue.splice(qe, 1); //Try not splicing

        let discardString = "";
        let confirmsNeeded = 0;
        let amIPlaying = false;
        for (let i of playersToGo) {
          if (this.game.confirms_needed[i - 1] == 1) {
            discardString += `Player ${i}, `;
            confirmsNeeded++;
            if (this.game.player == parseInt(i)) {
              this.addMove("RESOLVE\t" + this.app.wallet.returnPublicKey());
              this.chooseCardsToDiscard();
              //return 0;
              amIPlaying = true;
            }
          }
        }

        discardString = this.prettifyList(discardString);
        
        this.game.queue.push(
          `NOTIFY\t${discardString} must discard half their hand.`
        );

        if (!amIPlaying) {
          this.updateStatus(
            `Waiting for ${discardString} to discard half their hand.`
          );
        }

        if (confirmsNeeded == 0) {
          this.game.queue.splice(qe, 1);
          return 1;
        }
        return 0;
      }

      //Player Chooses where to put bandit
      if (mv[0] == "play_bandit") {
        let player = parseInt(mv[1]);
        this.game.queue.splice(qe, 1);

        //Move Bandit
        if (this.game.player == player) {
          this.playBandit();
        } else {
          this.updateStatus(
            `<div class="tbd">Waiting for Player ${player} to move the ${this.skin.b.name}...</div>`
          );
        }
        return 0;
      }

      // Update DOM for new Bandit Location and player picks card to steal
      if (mv[0] == "move_bandit") {
        let player = parseInt(mv[1]);
        let hex = mv[2]; //Id of the sector_value
        this.game.queue.splice(qe, 1);

        //Move Bandit in DOM
        $(".bandit").removeClass("bandit");
        $("#" + hex).addClass("bandit");
        let temp = hex.split("_"); // sector_value_3_3
        let hexId = temp[2] + "_" + temp[3];

        //Move Bandit in Game Logic
        for (let h in this.game.state.hexes) {
          this.game.state.hexes[h].robber = h === hexId;
        }
        let hexName =
          this.game.state.hexes[hexId].value +
          "->" +
          this.game.state.hexes[hexId].resource;
        this.updateLog(
          `Player ${player} moved the ${this.skin.b.name} to ${hexName}`
        );

        if (this.game.player === player) {
          this.moveBandit(player, hexId);
        } else {
          this.updateStatus(
            `<div class="tbd">Waiting for Player ${player} to choose the ${this.skin.b.name}'s victim...</div>`
          );
        }

        return 0;
      }

      //Move resources for bandit theft
      if (mv[0] == "steal_card") {
        let thief = parseInt(mv[1]);
        let victim = parseInt(mv[2]);
        let loot = mv[3];
        this.game.queue.splice(qe, 1);

        if (victim > 0 && loot != "nothing") { //victim 0 means nobody
          this.game.queue.push("spend_resource\t" + victim + "\t" + loot);
          this.game.state.players[thief - 1].resources.push(loot);
        }
 
        if (this.game.player === thief){
          this.updateStatus(`<div class="persistent">You stole: ${(loot == "nothing")?"nothing":this.returnResourceHTML(loot)}</div>`);
        }
        if (this.game.player === victim){
          this.updateStatus(`<div class="persistent">Player ${thief} stole ${(loot == "nothing")?"nothing":this.returnResourceHTML(loot)} from you</div>`);
        }
        
        let victim_name = (victim>0)? `Player ${victim}` : "nobody";
        this.updateLog(`Player ${thief} stole ${loot} from ${victim_name}`);
        return 1;
      }

      //
      // Main, repeating part of player turn
      // Do NOT splice from queue, Keep bouncing back here until the player chooses to pass the dice on
      if (mv[0] == "player_actions") {
        let player = parseInt(mv[1]);

        if (player == this.game.player) {
          this.playerPlayMove();
        } else {
          let oldhtml = this.getLastNotice();

          /*<><><><><><><><><><><><><><><>
            Give non-active player one chance to make a trade offer
            Only allow one offer to prevent harrassment by repeated offers
            However, if two players offer trade, the first to submit will overwrite the other's offer
          */
          if (this.game.state.canTrade) {
            let settlers_self = this;
            let html = `<div class="player-notice">Player ${player} is taking their turn.</div><ul><li id='tradenow' class='option'>Propose a trade</li></ul>`;
            this.updateStatus(oldhtml + html);
            $("#tradenow").on("click", function () {
              settlers_self.showTradeOverlay(player);
            });
          } else {
            this.updateStatus(
              oldhtml +
                `<div class="tbd">Player ${player} is taking their turn.</div>`
            );
          }
        }
        return 0;
      }

      //End Player's Turn
      if (mv[0] == "end_turn") {
        //Must be calculated here because player_actions and play can cycle multiple times per turn
        this.game.state.canPlayCard = this.game.deck[0].hand.length > 0;
        this.stopTrading();
        this.game.queue.splice(qe - 1, 2);
        this.is_sleeping = true;
        // remove city highlighting from last roll
        for (let city of this.game.state.cities) {
          document.querySelector(`#${city.slot}`).classList.remove("producer");
        }

        let divname = `.sector_value:not(.bandit)`;
        $(divname).removeAttr("style");
        return 1;
      }
    }
    return 1;
  }

  //
  // Award resources for dice roll
  //
  collectHarvest(value) {
    let logMsg = "";
    let notice = "";
    for (let city of this.game.state.cities) {
      let player = city.player;

      for (let neighboringHex of city.neighbours) {
        if (
          this.game.state.hexes[neighboringHex].value == value &&
          !this.game.state.hexes[neighboringHex].robber
        ) {
          //Highlight cities which produce resources
          document.querySelector(`#${city.slot}`).classList.add("producer");
          let resource = this.game.state.hexes[neighboringHex].resource;
          logMsg += `Player ${player} gains ${resource}`;
          if (this.game.player == player) {
            notice += this.returnResourceHTML(resource);
          }
          this.game.state.players[player - 1].resources.push(resource);
          this.game.stats.production[resource][player-1]++;
          //Double Resources for Upgraded City
          if (city.level == 2) {
            this.game.state.players[player - 1].resources.push(resource);
            this.game.stats.production[resource][player-1]++;
            logMsg += " x2";
            if (this.game.player == player) {
              notice += this.returnResourceHTML(resource);
            }
          }
          logMsg += "; ";
        }
      }
    }
    logMsg = logMsg.substr(0, logMsg.length - 2);
    if (logMsg) {
      this.updateLog(logMsg);
    } else {
      this.updateLog("No one collects any resources.");
    }
    if (notice) {
      this.updateStatus(
        `<div class="persistent alignme"><span>You acquired: </span>${notice}</div>`
      );
    }
  }

  /*
  Used to help with settlement placement, 
  returns list of all available vertices adjacent to the edges owned by a given player
  */
  returnCitySlotsAdjacentToPlayerRoads(player) {
    let adjacentVertices = [];

    //Cycle through roads to find all adjacent vertices
    for (let i = 0; i < this.game.state.roads.length; i++) {
      if (this.game.state.roads[i].player == player) {
        let slot = this.game.state.roads[i].slot.replace("road_", "");
        //console.log(this.game.state.roads[i],slot);
        for (let vertex of this.hexgrid.verticesFromEdge(slot))
          if (!adjacentVertices.includes(vertex)) adjacentVertices.push(vertex);
      }
    }

    // Filter for available slots
    let existing_adjacent = [];
    for (let vertex of adjacentVertices) {
      let city = document.querySelector("#city_" + vertex);
      if (city && city.classList.contains("empty")) {
        existing_adjacent.push("city_" + vertex);
      }
    }
    //console.log(existing_adjacent);
    adjacent = existing_adjacent;
    return adjacent;
  }

  /*
  Used to prevent placing settlements too close together,
  for a given vertex coordinate, returns list of 2-3 adjacent vertices
  */
  returnAdjacentCitySlots(city_slot) {
    let adjacent = [];

    let vertexID = city_slot.replace("city_", "");
    for (let vertex of this.hexgrid.adjacentVertices(vertexID)) {
      adjacent.push("city_" + vertex);
    }
    //console.log("Vertex: ",city_slot," Neighbors: ",adjacent);
    return adjacent;
  }

  //
  // when 7 is rolled or Soldier Played
  // Select the target spot
  //
  playBandit() {
    this.updateStatus("Move the bandit...");
    let settlers_self = this;
    $(".sector_value").addClass("rhover");
    $(".sector_value").off();
    $(".sector_value").on("click", function () {
      $(".sector_value").off();
      $(".sector_value").removeClass("rhover");
      let slot = $(this).attr("id");

      settlers_self.addMove(
        `move_bandit\t${settlers_self.game.player}\t${slot}`
      );
      settlers_self.endTurn();
    });
    $(".bandit").removeClass("rhover");
    $(".bandit").off(); //Don't select bandit tile
  }

  //Select the person to steal from
  moveBandit(player, hexId) {
    let settlers_self = this;
    //Find adjacent cities and launch into stealing mechanism
    let thievingTargets = [];

    for (let city of this.game.state.cities) {
      if (city.neighbours.includes(hexId)) {
        if (city.player != player)
          if (!thievingTargets.includes(city.player))
            thievingTargets.push(city.player);
      }
    }
    if (thievingTargets.length > 0) {
      let html = '<div class="tbd">Steal from which Player: <ul>';
      for (let i = 0; i < this.game.players.length; i++) {
        if (thievingTargets.includes(i + 1)) {
          html += `<li class="option" id="${i + 1}">Player ${i + 1} (${
            settlers_self.game.state.players[i].resources.length
          } cards)</li>`;
        }
      }
      html += "</ul></div>";
      this.updateStatus(html, 1);

      //Select a player to steal from
      $(".option").off();
      $(".option").on("click", function () {
        let victim = $(this).attr("id");
        let potentialLoot =
          settlers_self.game.state.players[victim - 1].resources;
        if (potentialLoot.length > 0) {
          let loot =
            potentialLoot[Math.floor(Math.random() * potentialLoot.length)];
          settlers_self.addMove(`steal_card\t${player}\t${victim}\t${loot}`);
        } else settlers_self.addMove(`steal_card\t${player}\t${victim}\tnothing`);
        settlers_self.endTurn();
      });
    } else {
      //No one to steal from
      settlers_self.addMove(`steal_card\t${player}\t0\tnothing`);
      settlers_self.endTurn();
    }
  }

  chooseCardsToDiscard() {
    let settlers_self = this;

    let player = this.game.player;
    let cardCt = this.game.state.players[this.game.player - 1].resources.length;
    if (cardCt <= 7) return;

    let targetCt = Math.floor(cardCt / 2);
    let my_resources = {};
    let cardsToDiscard = [];

    for (let resource of this.skin.resourceArray()) {
      let temp = settlers_self.countResource(
        settlers_self.game.player,
        resource
      );
      if (temp > 0) my_resources[resource] = temp;
    }

    //Player recursively selects all the resources they want to get rid of
    let discardFunction = function (settlers_self) {
      let html = `<div class='tbd'>Select Cards to Discard (Must get rid of ${
        targetCt - cardsToDiscard.length
      }): <ul>`;
      for (let i in my_resources) {
        if (my_resources[i] > 0)
          html += `<li id="${i}" class="option">${i}:`;
          for (let j = 0; j < my_resources[i]; j++){
            html += `<img class="icon" src="${settlers_self.skin.resourceIcon(i)}">`;
          }
          html += `</li>`;
      }
      html += "</ul>";
      html += "</div>";

      settlers_self.updateStatus(html, 1);

      $(".option").off();
      $(".option").on("click", function () {
        let res = $(this).attr("id");
        cardsToDiscard.push(res); //Add it to recycling bin
        my_resources[res]--; //Subtract it from display
        settlers_self.addMove("spend_resource\t" + player + "\t" + res);
        if (cardsToDiscard.length >= targetCt) {
          settlers_self.endTurn();
          return 0;
        } else {
          discardFunction(settlers_self);
        }
      });
    };

    discardFunction(settlers_self);
  }

  /*
  Functions to generate and display the game
  */

  /*
    Set everything to zero by default
  */
  addSectorValuesToGameboard() {
    for (const i of this.hexgrid.hexes) {
      this.addSectorValueToGameboard(i, 0);
    }
  }

  addSectorValueToGameboard(hex, sector_value) {
    let selector = "hex_bg_" + hex;
    let hexobj = document.getElementById(selector);
    let svid = `sector_value_${hex}`;

    if (document.getElementById(svid)) {
      //Update Sector Value
      let temp = document.getElementById(svid);
      temp.textContent = sector_value;
      temp.classList.add("sv" + sector_value);
    } else {
      //Create Sector_value
      let sector_value_html = `<div class="sector_value hexTileCenter sv${sector_value}" id="${svid}">${sector_value}</div>`;
      let sector_value_obj = this.app.browser.htmlToElement(sector_value_html);
      if (hexobj) {
        hexobj.after(sector_value_obj);
      }
    }
    return svid;
  }

  /*
    Hardcode the position of resource ports
    Use road id + adjacent vertices for internal logic
  */
  addPortsToGameboard() {
    let resources = this.skin.resourceArray();
    this.addPortToGameboard("1_1", "any", 6);
    this.addPortToGameboard("3_5", "any", 3);
    this.addPortToGameboard("5_4", "any", 3);
    this.addPortToGameboard("4_2", "any", 5);

    let hexes = ["1_2", "2_1", "2_4", "5_3", "5_5"];
    let angles = [1, 5, 1, 4, 2];
    for (let i = 0; i < 5; i++) {
      this.addPortToGameboard(hexes[i], /*"2:1 "+*/ resources[i], angles[i]);
    }
  }

  addPortToGameboard(hex, port, direction) {
    let port_id = "port_" + direction + "_" + hex;

    this.game.state.ports[direction + "_" + hex] = port;

    let selector = "hex_bg_" + hex;
    let hexobj = document.getElementById(selector);
    if (!document.getElementById(port_id)) {
      let port_html = `<div class="port port${direction}" id="${port_id}">
                        <div class="ship hexTileCenter">${this.skin.portIcon(
                          port
                        )}</div>
                        <div class="harbor lharbor"></div>
                        <div class="harbor rharbor"></div>
                        </div>`;
      let port_obj = this.app.browser.htmlToElement(port_html);
      if (hexobj) hexobj.after(port_obj);
      //else console.log("Null selector: "+selector);
    }
  }

  /*
  Creates DOM stuctures to hold cities, 
  addCityToGameboard calculates where to (absolutely) position them
  */
  addCitiesToGameboard() {
    for (const i of this.hexgrid.hexes) {
      this.addCityToGameboard(i, 6);
      this.addCityToGameboard(i, 1);
    }
    //Right side corners
    this.addCityToGameboard("1_3", 2);
    this.addCityToGameboard("2_4", 2);
    this.addCityToGameboard("3_5", 2);
    this.addCityToGameboard("4_5", 2);
    this.addCityToGameboard("5_5", 2);

    this.addCityToGameboard("3_5", 3);
    this.addCityToGameboard("4_5", 3);
    this.addCityToGameboard("5_5", 3);

    //Left Under side
    this.addCityToGameboard("3_1", 5);
    this.addCityToGameboard("4_2", 5);
    this.addCityToGameboard("5_3", 5);
    //Bottom
    this.addCityToGameboard("5_3", 4);
    this.addCityToGameboard("5_4", 5);
    this.addCityToGameboard("5_4", 4);
    this.addCityToGameboard("5_5", 5);
    this.addCityToGameboard("5_5", 4);
  }

  /*
  Hexboard row_col indexed, city_component is point of hexagon (1 = top, 2 = upper right, ... )
  */
  addCityToGameboard(hex, city_component) {
    //let el = document.querySelector('.game-hexgrid-cities');
    //let hexobj = document.getElementById(hex);
    let city_id = "city_" + city_component + "_" + hex;

    let selector = "hex_bg_" + hex;
    let hexobj = document.getElementById(selector);
    if (!document.getElementById(city_id)) {
      let city_html = `<div class="city city${city_component} empty" id="${city_id}"></div>`;
      let city_obj = this.app.browser.htmlToElement(city_html);
      if (hexobj) hexobj.after(city_obj);
      //else console.log("Null selector: "+selector);
    }
  }

 
  addRoadToGameboard(hex, road_component) {
    let selector = "hex_bg_" + hex;
    let hexobj = document.getElementById(selector);
    let road_id = "road_" + road_component + "_" + hex;

    if (!document.getElementById(road_id)) {
      let road_html = `<div class="road road${road_component} empty" id="${road_id}"></div>`;
      let road_obj = this.app.browser.htmlToElement(road_html);
      if (hexobj) hexobj.after(road_obj);
      //else console.log("Null selector: "+selector);
    }
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

  /*
  Every player should have in deck[2] and deck[3] the board tiles and tokens in the same order
  */
  generateMap() {
    let tileCt = 0;
    let tokenCt = 0;
    let tile, resourceName, token;
    for (let hex of this.hexgrid.hexes) {
      tile = this.game.pool[0].hand[tileCt++];
      resourceName = this.game.deck[1].cards[tile].resource;
      if (resourceName != this.skin.nullResource()) {
        let temp = this.game.pool[1].hand[tokenCt++];
        token = this.game.deck[2].cards[temp].value;
      } else {
        token = 0;
      }
      this.game.state.hexes[hex] = {
        resource: resourceName,
        value: token,
        img: this.game.deck[1].cards[tile].img,
        neighbours: [],
        robber: false,
      };
      if (resourceName == this.skin.nullResource())
        this.game.state.hexes[hex].robber = true;
      if (token) this.addSectorValueToGameboard(hex, token);
    }
  }

  /*
  Draw the board (Tiles are already in DOM), add/update sector_values, add/update built cities and roads
  */
  displayBoard() {
    /*
      Set the tile backgrounds to display resources and display sector values (dice value tokens)
    */
    for (let i in this.game.state.hexes) {
      let divname = "#hex_bg_" + i;
      $(divname).html(
        `<img class="hex_img2" src="${this.game.state.hexes[i].img}">`
      );
      if (this.game.state.hexes[i].resource != this.skin.nullResource()) {
        let svid = this.addSectorValueToGameboard(
          i,
          this.game.state.hexes[i].value
        );
        if (this.game.state.hexes[i].robber)
          document.getElementById(svid).classList.add("bandit");
      }
    }

    /*
      Identify which vertices have a player settlement/city and add those to board
    */
    for (let i in this.game.state.cities) {
      let divname = "#" + this.game.state.cities[i].slot;
      let classname = "p" + this.game.state.cities[i].player;
      $(divname).addClass(classname);
      $(divname).removeClass("empty");

      if (this.game.state.cities[i].level == 1) {
        $(divname).html(this.skin.c1.svg);
      } else {
        /* == 2*/
        $(divname).html(this.skin.c2.svg);
      }
      $(divname).addClass(classname);

      // remove adjacent slots
      let ad = this.returnAdjacentCitySlots(this.game.state.cities[i].slot);
      for (let i = 0; i < ad.length; i++) {
        let d = "#" + ad[i];
        try {
          $(d).remove();
        } catch (err) {}
      }
    }

    /*
    Add roads to gameboard
    */
    for (let i in this.game.state.roads) {
      //Not the most efficient, but should work
      this.buildRoad(this.game.state.roads[i].player, this.game.state.roads[i].slot);
    }

    this.displayPlayers();
  }

  /*
  Work in Progress
  Check the score everytime we update players, which is with each cycle of game queue, 
  so should catch victory condition
  */
  updateScore() {
    for (let i = 0; i < this.game.state.players.length; i++) {
      let score = 0;
      //Count towns and cities
      for (let j = 0; j < this.game.state.cities.length; j++) {
        if (this.game.state.cities[j].player === i + 1) {
          //Player Number, not array index
          score += this.game.state.cities[j].level;
        }
      }

      //Update Longest Road
      if (this.game.state.longestRoad.player == i + 1) {
        score += 2;
      }
      //Update Largest Army
      if (this.game.state.largestArmy.player == i + 1) {
        score += 2;
      }
      //Count (played) Victory Points
      score += this.game.state.players[i].vpc;

      //Save Score
      this.game.state.players[i].vp = score;

      //Check for winner
      if (score >= this.game.options.game_length) {
        this.game.queue.push(`winner\t${i + 1}`);
      }
    }
  }

  
  /*
    @param {string} deck -- the name of the deck to render (resource || cards), if empty defaults to resource, if no resources, tries dev cards
  */
  displayCardfan(deck = "") {
    try {
      let usingDev = false;
      let cards = "";
      if (deck == "resource" || deck == "") {
        for (let r of this.game.state.players[this.game.player - 1].resources) {
          //Show all cards
          cards += `<div class="card tip"><img src="${this.skin.resourceCard(r)}">
                    <img class="icon" src="${this.skin.resourceIcon(r)}"/>
                    
                    </div>`; //<div class="tiptext">${r}</div>
        }
      }
      if (deck == "cards" || cards == "") {
        //Dev Cards
        usingDev = true;
        for (let x = 0; x < this.game.deck[0].hand.length; x++) {
          let card = this.game.deck[0].cards[this.game.deck[0].hand[x]];
          cards += `<div class="card tip"><img src="${card.img}">
                    <div class="cardtitle">${card.card}</div>
                    <div class="cardrules">${this.skin.rules[card.action]}</div>
                    <div class="tiptext">${card.card}: ${this.skin.rules[card.action]}</div>
                    </div>`;
        }
      }
      if (cards){
        this.cardfan.render(this.app, this, cards);

        if (usingDev){
          this.cardfan.addClass("staggered-hand");
          this.cardfan.removeClass("bighand");
        }else{
          this.cardfan.addClass("bighand");  
          this.cardfan.removeClass("staggered-hand");
        }
        this.cardfan.attachEvents(this.app, this);  
      }
    } catch (err) {
      //console.log(err);
    }
  }

  /*
    Refresh the Playerboxes with formatted information on the players
  */
  displayPlayers() {
    this.updateScore();
    let card_dir = "/settlers/img/cards/";
    for (let i = 1; i <= this.game.state.players.length; i++) {
      this.game.state.players[i - 1].resources.sort();
      let newhtml = "";
      //Name
      this.playerbox.refreshName(i);

      //Stats
      newhtml = `<div class="flexline"><div>Player ${i}</div>`;
      //Victory Point Card Tokens
      for (let j = 0; j < this.game.state.players[i - 1].vpc; j++) {
        newhtml += `<div class="token">${this.skin.vp.svg}</div>`;
      }
      if (this.game.state.largestArmy.player == i) {
        newhtml += `<div class="token" title="${this.skin.largest.name}">${this.skin.largest.svg}</div>`;
      }
      if (this.game.state.longestRoad.player == i) {
        newhtml += `<div class="token" title="${this.skin.longest.name}">${this.skin.longest.svg}</div>`;
      }
      newhtml += `<div class="vp" title="${this.skin.vp.name}">${
        this.skin.vp.name
      }: ${this.game.state.players[i - 1].vp}</div></div>`;

      if (this.game.state.players[i - 1].knights > 0) {
        newhtml += `<div class="flexline2">`;
        for (let j = 0; j < this.game.state.players[i - 1].knights; j++) {
          newhtml += this.skin.s.img;
        }
        newhtml += `</div>`;
      }
      //For opponents, summarize their hands numerically
      if (this.game.player != i) {
        newhtml += `<div class="flexline">`;
        newhtml += `<div class="cardct">Resources: ${
          this.game.state.players[i - 1].resources.length
        }</div>`;
        newhtml += `<div class="cardct">Cards: ${
          this.game.state.players[i - 1].devcards
        }</div>`;
        newhtml += `</div>`;
      } else {
        //Interactive controls to toggle between "decks"
        if (
          this.game.deck[0].hand.length > 0 &&
          this.game.state.players[i - 1].resources.length > 0
        ) {
          newhtml += `<div class="flexline">`;
          newhtml += `<div class="cardselector" id="resource" title="Show my resources">Resources</div>`;
          newhtml += `<div class="cardselector" id="cards" title="Show my ${this.skin.card.name} cards">Cards</div>`;
          newhtml += `</div>`;
        }
      }

      this.playerbox.refreshInfo(newhtml, i);
      $(".player-box-info").disableSelection();
    }
    //Insert tool into name
    let pbhead = document.querySelector("#player-box-head-1");
    this.app.browser.addElementToElement(`<i id="construction-costs" class="handy-help fa fa-question-circle" aria-hidden="true"></i>`, pbhead);
    this.cardbox.attachCardEvents();

    //Show player cards and add events (Doesn't need to be in for loop!)
    if (this.boughtCard) {
      this.displayCardfan("cards"); //Only shows this player's
      this.boughtCard = false;
    } else {
      this.displayCardfan();
    }
    this.addEventsToHand();
  }

  //Allow this player to click buttons to display resource or dev cards in their cardfan
  addEventsToHand() {
    let settlers_self = this;

    $(".cardselector").off(); //Previous events should be erased when the dom is rebuilt, but just in case...
    $(".cardselector").on("click", function () {
      settlers_self.displayCardfan($(this).attr("id"));
    });
  }

  /*
    Functions for Player interacting with the board
  */

  playerBuildCity() {

    let settlers_self = this;
    let existing_cities = 0;
    for (let i = 0; i < this.game.state.cities.length; i++) {
      if (this.game.state.cities[i].player == this.game.player) {
        existing_cities++;
      }
    }
    $(".flash").removeClass("flash");
    /*
    Everyone starts with 2 settlements and can be placed anywhere on island
    */
    if (existing_cities < 2) {
      this.playerbox.addClass("flash");
      if (existing_cities == 1){
        this.updateStatus(`<div class="tbd">YOUR TURN: place ${this.skin.c1.name}...</div>`);
      }else{
        this.updateStatus(`<div class="tbd">YOUR TURN: place ${this.skin.c1.name}...</div>`);
      }
    
      let xpos, ypos;
      $(".city.empty").addClass("chover");
      //$('.city').css('z-index', 9999999);
      $(".city.empty").off();
        
      $(".city.empty").on("mousedown", function (e) {
        xpos = e.clientX;
        ypos = e.clientY;
      });
      //Create as menu on the game board to input word from a tile in horizontal or vertical direction
      $(".city.empty").on("mouseup", function (e) {
          if (Math.abs(xpos - e.clientX) > 4) {
            return;
          }
          if (Math.abs(ypos - e.clientY) > 4) {
            return;
          }
          $(".city.empty").css("background-color", "");   
          //Confirm this move
          let slot = $(this).attr("id");
          $(this).css("background-color", "yellow");

          let html = `
          <div class="popup-confirm-menu">
            <div class="popup-prompt">Place ${settlers_self.skin.c1.name} here?</div>
            <div class="action" id="confirm">yes</div>
            <div class="action" id="cancel">cancel</div>
          </div>`;

          let left = $(this).offset().left + 50;
          let top = $(this).offset().top + 20;
          
          $(".popup-confirm-menu").remove();
          $("body").append(html);
          $(".popup-confirm-menu").css({
                position: "absolute",
                top: top,
                left: left,
              });

            $(".action").off();
            $(".action").on("click", function () {
              $("#"+slot).css("background-color", "");
              let confirmation = $(this).attr("id");
              $(".action").off();
              $(".popup-confirm-menu").remove();
              if (confirmation === "confirm"){
                $(".city.empty").removeClass("chover");
                $(".city.empty").off();
                  settlers_self.game.state.placedCity = slot;
                  settlers_self.buildCity(settlers_self.game.player, slot);
                  if (existing_cities == 1)
                    settlers_self.addMove(
                      `secondcity\t${settlers_self.game.player}\t${slot.replace(
                        "city_",
                        ""
                      )}`
                    );
                  settlers_self.addMove(
                    `build_city\t${settlers_self.game.player}\t${slot}`
                  );
                  settlers_self.endTurn();
              } 
            });
      });
      
    } else {
      /* During game, must build roads to open up board for new settlements*/
      this.updateStatus(`<div class="tbd">You may build a ${this.skin.c1.name}...</div>`);
      let building_options = this.returnCitySlotsAdjacentToPlayerRoads(this.game.player);
      for (let i = 0; i < building_options.length; i++) {
        /*
          Highlight connected areas available to build a new settlement
        */
        let divname = "#" + building_options[i];

        $(divname).addClass("rhover");

        $(divname).off();
        $(divname).on("click", function () {
          //Need to turn of these things for all the potential selections, no?
          $(".rhover").off();
          $(".rhover").removeClass("rhover");

          //$(divname).off();
          let slot = $(this).attr("id");
          settlers_self.buildCity(settlers_self.game.player, slot);
          settlers_self.addMove(
            `build_city\t${settlers_self.game.player}\t${slot}`
          );
          settlers_self.endTurn();
        });
      }
    }
  }

  buildCity(player, slot) {
    // remove adjacent slots
    let ad = this.returnAdjacentCitySlots(slot);
    for (let i = 0; i < ad.length; i++) {
      let d = "#" + ad[i];
      try {
        $(d).remove();
      } catch (err) {}
    }

    //Put City on GUI Board
    let divname = "#" + slot;
    let classname = "p" + player;

    $(divname).addClass(classname);
    $(divname).removeClass("empty");
    $(divname).html(this.skin.c1.svg);

    //Enable player to put roads on adjacent edges
    if (this.game.player == player) {
      let newRoads = this.hexgrid.edgesFromVertex(slot.replace("city_", ""));
      for (let road of newRoads) {
        console.log("road: ",road);
        this.addRoadToGameboard(road.substring(2), road[0]);
      }
    }

    //Save City to Internal Game Logic
    //Stop if we already saved the Village
    for (let i = 0; i < this.game.state.cities.length; i++) {
      if (this.game.state.cities[i].slot == slot) {
        return;
      }
    }

    this.game.state.players[player - 1].towns--;

    //Check if the city is a port
    for (let p in this.game.state.ports) {
      let porttowns = this.hexgrid.verticesFromEdge(p);
      for (let t of porttowns) {
        if ("city_" + t == slot) {
          this.game.state.players[player - 1].ports.push(
            this.game.state.ports[p]
          );
          //console.log(`Player ${player} has a ${this.game.state.ports[p]} port`);
        }
      }
    }

    //Let's just store a list of hex-ids that the city borders
    let neighbours = this.hexgrid.hexesFromVertex(slot.replace("city_", "")); //this.returnAdjacentHexes(slot);
    this.game.state.cities.push({
      player: player,
      slot: slot,
      neighbours: neighbours,
      level: 1,
    });
  }

  playerUpgradeCity(player) {
    this.updateStatus(
      `<div class="tbd">Click on a ${this.skin.c1.name} to upgrade it to a ${this.skin.c2.name}...</div>`
    );

    let settlers_self = this;
    //let selector = `.city.p${player}`;
    //Manually go through available player's cities because DOM doesn't have convenient selector
    for (let c of settlers_self.game.state.cities) {
      if (c.level === 1 && c.player === player) {
        $("#" + c.slot).addClass("chover");
      }
    }

    //$(selector).addClass('chover');
    $(".chover").off();
    $(".chover").on("click", function () {
      $(".chover").off();
      $(".chover").removeClass("chover");

      let slot = $(this).attr("id");

      for (let i = 0; i < settlers_self.game.state.cities.length; i++) {
        if (
          slot == settlers_self.game.state.cities[i].slot &&
          settlers_self.game.state.cities[i].level == 1
        ) {
          settlers_self.addMove(
            `upgrade_city\t${settlers_self.game.player}\t${slot}`
          );
          settlers_self.endTurn();
          return;
        }
      }
      //Something went wrong, try again
      settlers_self.playerUpgradeCity(player);
    });
  }

  /*
    Allows player to click a road 
  */
  playerBuildRoad() {
    let settlers_self = this;

    
    if (this.game.state.placedCity) {
      this.updateStatus(
        `<div class="tbd">YOUR TURN: place ${this.skin.r.name}...</div>`
      );

      /*Initial placing of settlements and roads, road must connect to settlement just placed
        Use a "new" class tag to restrict scope
        This is literally just a fix for the second road in the initial placement
      */
      let newRoads = this.hexgrid.edgesFromVertex(
        this.game.state.placedCity.replace("city_", "")
      );
      for (let road of newRoads) {
        $(`#road_${road}`).addClass("new");
      }

      $(".road.new").addClass("rhover");
      
      $(".road.new").off();
      $(".road.new").on("click", function () {
        $(".road.new").off();
        $(".road.new").removeAttr("style");
        $(".road.new").removeClass("rhover");
        $(".road.new").removeClass("new");

        let slot = $(this).attr("id");
        //settlers_self.buildRoad(settlers_self.game.player, slot);
        settlers_self.addMove(`build_road\t${settlers_self.game.player}\t${slot}`);
        settlers_self.endTurn();
      });
    } else {
      this.updateStatus(
      `<div class="tbd">You may build a ${this.skin.r.name}...</div>`
      );

      /*Normal game play, can play road anywhere empty connected to my possessions*/
      $(".road.empty").addClass("rhover");
      
      $(".road.empty").off();
      $(".road.empty").on("click", function () {
        $(".road.empty").off();
        $(".road.empty").removeClass("rhover");
        $(".road.empty").removeAttr("style");
        let slot = $(this).attr("id");
        //settlers_self.buildRoad(settlers_self.game.player, slot);
        settlers_self.addMove(`build_road\t${settlers_self.game.player}\t${slot}`);
        settlers_self.endTurn();
      });
    }
  }

  /*
  Update internal game logic to mark road as built and change class in DOM for display
  */
  buildRoad(player, slot) {
    let divname = "#" + slot;
    let owner = "p" + player;

    //Check if road exists in DOM and update status
    if (!document.querySelector(divname)) {
      let roadInfo = slot.split("_");
      this.addRoadToGameboard(roadInfo[2] + "_" + roadInfo[3], roadInfo[1]);
    }
    $(divname).addClass(owner);
    $(divname).removeClass("empty");

    //Add adjacent road slots
    if (this.game.player == player) {
      for (let road of this.hexgrid.adjacentEdges(slot.replace("road_", ""))) {
        //console.log("road: ",road);
        this.addRoadToGameboard(road.substring(2), road[0]);
      }
    }

    /* Store road in game state if not already*/
    for (let i = 0; i < this.game.state.roads.length; i++) {
      if (this.game.state.roads[i].slot == slot) {
        return;
      }
    }
    this.game.state.roads.push({ player: player, slot: slot });
  }

  /*
  Main function to let player carry out their turn...
  */
  playerPlayMove() {
    let settlers_self = this;
    let html = "";

    //console.log("RES: " + JSON.stringify(this.game.state.players[this.game.player - 1].resources));

    html += '<div class="tbd">';
    html += "<ul>";
    /*if (settlers_self.canPlayerTrade(settlers_self.game.player)) {
      html += `<li class="option" id="trade">trade</li>`;
    }*/
    if (settlers_self.canPlayerTrade(settlers_self.game.player) && settlers_self.canPlayerBankTrade()){
      html += '<li class="option" id="bank">bank</li>';  
    }
    

    if (settlers_self.canPlayerPlayCard()) {
      html += `<li class="option" id="playcard">play card</li>`;
    }
    if (
      settlers_self.canPlayerBuildRoad(settlers_self.game.player) ||
      settlers_self.canPlayerBuildTown(settlers_self.game.player) ||
      settlers_self.canPlayerBuildCity(settlers_self.game.player) ||
      settlers_self.canPlayerBuyCard(settlers_self.game.player)
    ) {
      html += `<li class="option" id="spend">spend resources</li>`;
    } else {
      //html += `<li class="option noselect" id="nospend">spend resources</li>`;
    }

    html += `<li class="option" id="pass">pass dice</li>`;
    html += "</ul>";
    html += "</div>";

    settlers_self.updateStatus(settlers_self.getLastNotice() + html);

    $(".option").off();
    $(".option").on("click", function () {
      let id = $(this).attr("id");
      /*
      Player should be able to continue to take actions until they end their turn
      */
      if (id === "pass") {
        settlers_self.addMove("end_turn\t" + settlers_self.game.player);
        settlers_self.endTurn();
        return;
      }
      if (id === "bank"){
        settlers_self.bankTrade();
        return;
      }
      if (id === "playcard") {
        settlers_self.playerPlayCard();
        return;
      }
      if (id == "spend") {
        settlers_self.playerBuild();
        return;
      }
      if (id == "nospend") {
        //Show a tool tip to remind players of what resources they need to build what
      }

      //console.log("Unexpected selection for player move:",id);
    });
  }


  returnResourceHTML(resource){
    return `<div class="tip">
            <img class="icon" src="${this.skin.resourceIcon(resource)}">
            <div class="tiptext">${resource}</div>
            </div>`;
  }

  /*

  */
  visualizeCost(purchase) {
    let html = "";
    if (purchase < 0 || purchase > 3) return "";
    let cost = this.skin.priceList[purchase];
    for (let resource of cost) {
      //html += `<img class="icon" src="${this.skin.resourceIcon(resource)}">`;
      html += this.returnResourceHTML(resource);
    }
    return html;
  }

  /*
  Overwrite standard card imaging function to hijack the game-cardbox and have it show
  building costs "help" card
  */
  returnCardImage(card){
    if (card == "construction-costs"){
      let html = `<div class="construction-costs">
              <h2>Building Costs</h2>
              <div class="table">
              <div class="tip token p${this.game.player}"><svg viewbox="0 0 200 200"><polygon points="0,175 175,0, 200,25 25,200"/></svg>
                <div class="tiptext">${this.skin.r.name}: Longest road worth 2 VP</div></div>
                  <div class="cost">${this.visualizeCost(0)}</div>
                <div class="tip token p${this.game.player}">${this.skin.c1.svg}<div class="tiptext">${this.skin.c1.name}: 1 VP</div></div>
                    <div class="cost">${this.visualizeCost(1)}</div>
                    <div class="tip token p${this.game.player}">${this.skin.c2.svg}<div class="tiptext">${this.skin.c2.name}: 2 VP</div></div>
                    <div class="cost">${this.visualizeCost(2)}</div>
                <div class="tip token"><svg viewbox="0 0 200 200"><polygon points="25,0 175,0, 175,200 25,200"/>
                <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-size="132px" fill="red">?</text></svg>
                <div class="tiptext">${this.skin.card.name} card: Largest army worth 2 VP</div></div><div class="cost">${this.visualizeCost(3)}</div>
              </div>
              <div class="message">The first player to reach ${this.game.options.game_length} VP wins!</div>
              </div>`;
      return html;
    }else{
      return "";
    }
  }




  /*
  Maybe an intermediate interface for building (like Trading)
  Level 1: Trade, Buy, Build, End Turn
            |            |_ Build Road, Build Village, Upgrade to City
            |_ Trade with Player X --> Offer --> Accept --> v~
  */
  playerBuild() {
    let settlers_self = this;
    let html = '<div class="tbd">';
    html += "<ul>";

    if (settlers_self.canPlayerBuildRoad(settlers_self.game.player)) {
      html += `<li class="option" id="0">build ${this.skin.r.name} </li>`;
    } /*else{
      html += `<li class="disabled" id="0">${this.visualizeCost(0)} to build ${this.skin.r.name}</li>`;
    }*/
    if (settlers_self.canPlayerBuildTown(settlers_self.game.player)) {
      html += `<li class="option" id="1">build ${this.skin.c1.name}</li>`;
    } /*else{
      html += `<li class="disabled" id="1">${this.visualizeCost(1)} to build ${this.skin.c1.name}</li>`;
    }*/
    if (settlers_self.canPlayerBuildCity(settlers_self.game.player)) {
      html += `<li class="option" id="2">build ${this.skin.c2.name}</li>`;
    } /*else{
      html += `<li class="disabled" id="2">${this.visualizeCost(2)} to build ${this.skin.c2.name}</li>`;
    }*/
    if (settlers_self.canPlayerBuyCard(settlers_self.game.player)) {
      html += `<li class="option" id="3">buy ${this.skin.card.name} card</li>`;
    } /*else{
      html += `<li class="disabled" id="3">${this.visualizeCost(3)} to buy card</li>`;
    }*/
    html += `<li class="option" id="cancel">go back</li>`;
    html += "</ul>";
    html += "</div>";

    settlers_self.updateStatus(html);

    $(".option").off();
    $(".option").on("click", function () {
      let id = $(this).attr("id");
      settlers_self.updateStatus('<div class="tbd">broadcasting choice</div>'); //If visible, something terrible has gone wrong
      if (id === "cancel") {
        settlers_self.playerPlayMove();
        return;
      }
      if (id === "0") {
        settlers_self.addMove(
          "player_build_road\t" + settlers_self.game.player
        );
      }
      if (id === "1") {
        settlers_self.addMove(
          "player_build_city\t" + settlers_self.game.player
        );
      }
      if (id === "2") {
        settlers_self.addMove(
          "player_upgrade_city\t" + settlers_self.game.player
        );
      }
      if (id === "3") {
        settlers_self.addMove("buy_card\t" + settlers_self.game.player); //have everyone update game state
        // Deck #1 = deck[0] = devcard deck
        settlers_self.addMove(
          "SAFEDEAL\t1\t" + settlers_self.game.player + "\t1"
        ); //get card from deck
      }
      let purchase = parseInt(id);
      if (purchase >= 0 && purchase <= 3) {
        let cost = settlers_self.skin.priceList[parseInt(id)];
        for (let resource of cost) {
          settlers_self.addMove(
            "spend_resource\t" + settlers_self.game.player + "\t" + resource
          );
        }
        settlers_self.endTurn();
      } else {
        //console.log("Unexpected selection for player move:",id);
      }
    });
  }

  playerPlayCard() {
    let settlers_self = this;
    this.displayCardfan("cards");
    let html = "";
    html += '<div class="tbd">Select a card to play: <ul>';
    let limit = Math.min(
      this.game.deck[0].hand.length,
      this.game.state.players[this.game.player - 1].devcards
    );
    //Show all old cards
    for (let i = 0; i < limit; i++) {
      let card = this.game.deck[0].cards[this.game.deck[0].hand[i]];
      if (this.game.state.canPlayCard || !this.skin.isActionCard(card.card)) {
        html += `<li class="option tip" id="${i}">${card.card}
                  <div class="tiptext">${this.skin.rules[card.action]}</div>
                 </li>`;
      }
    }
    //Show New VP as well
    for (let i = Math.max(limit, 0); i < this.game.deck[0].hand.length; i++) {
      let card = this.game.deck[0].cards[this.game.deck[0].hand[i]];
      if (!this.skin.isActionCard(card.card)) {
        html += `<li class="option tip" id="${i}">${card.card}
                 <div class="tiptext">${this.skin.rules[card.action]}</div>
                 </li>`;
      }
    }

    html += `<li class="option" id="cancel">go back</li>`;
    html += "</ul></div>";
    this.updateStatus(html, 0);  

    $(".option").off();
    $(".option").on("click", function () {
      let card = $(this).attr("id"); //this is either "cancel" or the card's deck index (i.e. "11")

      //Allow a player not to play their dev card
      if (card == "cancel") {
        settlers_self.endTurn();
        /*Restart last move because maybe thought about playing a card before rolling and want to go back to that state
         */
        return;
      }

      let cardobj =
        settlers_self.game.deck[0].cards[settlers_self.game.deck[0].hand[card]];

      //Callback seems to get lost somewhere
      //cardobj.callback(settlers_self.game.player);
      //Fallback code, old school switch
      switch (cardobj.action) {
        case 1: //Soldier/Knight
          settlers_self.game.state.canPlayCard = false; //No more cards this turn
          settlers_self.addMove(
            `play_knight\t${settlers_self.game.player}\t${cardobj.card}`
          );
          settlers_self.endTurn();
          break;
        case 2:
          settlers_self.playYearOfPlenty(
            settlers_self.game.player,
            cardobj.card
          );
          settlers_self.game.state.canPlayCard = false; //No more cards this turn
          break;
        case 3:
          settlers_self.playMonopoly(settlers_self.game.player, cardobj.card);
          settlers_self.game.state.canPlayCard = false; //No more cards this turn
          break;
        case 4:
          settlers_self.game.state.canPlayCard = false; //No more cards this turn
          settlers_self.addMove(
            "player_build_road\t" + settlers_self.game.player
          );
          settlers_self.addMove(
            "player_build_road\t" + settlers_self.game.player
          );
          settlers_self.addMove(
            `road_building\t${settlers_self.game.player}\t${cardobj.card}`
          );
          settlers_self.endTurn();
          break;
        default:
          //victory point
          settlers_self.addMove(
            `vp\t${settlers_self.game.player}\t${cardobj.card}`
          );
          settlers_self.endTurn();
      }
      settlers_self.removeCardFromHand(settlers_self.game.deck[0].hand[card]);
    });
  }

  /*
    Given a resource cost and player, check if they meet the minimum
    requirement = ["res1","res2"...]
  */
  doesPlayerHaveResources(player, requirement) {
    let myBank = this.game.state.players[player - 1].resources.slice();
    for (let x of requirement) {
      let ind = myBank.indexOf(x);
      if (ind >= 0) myBank.splice(ind, 1);
      else return false;
    }
    return true;
  }

  //Maybe an extreme edge case where there is nowhere on the board to place a road
  canPlayerBuildRoad(player) {
    return this.doesPlayerHaveResources(player, this.skin.priceList[0]);
  }

  /*
  Three conditions. Must have a village/settlement, and must have 3 ore and 2 wheat
  >>>
  */
  canPlayerBuildTown(player) {
    if (this.game.state.players[player - 1].towns == 0) return false;
    if (this.returnCitySlotsAdjacentToPlayerRoads(this.game.player).length == 0)
      return false;
    return this.doesPlayerHaveResources(player, this.skin.priceList[1]);
  }

  /*
  Three conditions. Must have a village/settlement, can't build more than 4 citiees, and must have 3 ore and 2 wheat
  >>>
  */
  canPlayerBuildCity(player) {
    let availableSlot = false;
    for (let i of this.game.state.cities) {
      if (i.player == player && i.level == 1) availableSlot = true;
    }
    if (!availableSlot) return false;

    if (this.game.state.players[player - 1].cities == 0) return false;

    return this.doesPlayerHaveResources(player, this.skin.priceList[2]);
  }

  canPlayerBuyCard(player) {
    //No more cards in deck (No reshuffling in this game)
    if (this.game.deck[0].crypt.length === 0) return false;
    return this.doesPlayerHaveResources(player, this.skin.priceList[3]);
  }

  /*
    Player must have a development card in the hand to play...
    Any card is fine 
  */
  canPlayerPlayCard() {
    if (this.game.state.players[this.game.player - 1].devcards > 0) {
      //not deck.length
      if (this.game.state.canPlayCard) return true;
    }
    if (this.hasVPCards()) {
      return true;
    }

    return false;
  }

  hasVPCards() {
    for (let i = 0; i < this.game.deck[0].hand.length; i++) {
      let cardname = this.game.deck[0].cards[this.game.deck[0].hand[i]].card;
      if (!this.skin.isActionCard(cardname)) return true;
    }
    return false;
  }

  /*
  Must have some resources to trade, lol...maybe?
  */
  canPlayerTrade(player) {
    if (this.game.state.canTrade && this.game.state.players[player - 1].resources.length > 0) 
      return 1;

    return 0;
  }


  canPlayerBankTrade(){
    let minForTrade = this.analyzePorts(); //4;  //1) Fix to have 3:1 port, 2) Fix for resource specific 2:1 ports

    for (let resource of this.skin.resourceArray()) {
      if (this.countResource(this.game.player, resource) >= minForTrade[resource]) 
        return true;
    }
    return false;
  }
    

  /*
    Recursively let player select two resources, then push them to game queue to share selection
  */
  playYearOfPlenty(player, cardname) {
    if (this.game.player != player) return;
    //Pick something to get
    let settlers_self = this;
    let remaining = 2;
    let resourceList = this.skin.resourceArray();
    let cardsToGain = [];

    //Player recursively selects all the resources they want to get rid of
    let gainResource = function (settlers_self) {
      let html = `<div class='tbd'>Select Resources (Can get ${remaining}): <ul class="horizontal_list">`;
      for (let i of resourceList) {
        html += `<li id="${i}" class="iconoption option">${settlers_self.returnResourceHTML(i)}</li>`;
      }
      html += "</ul>";
      html += "</div>";
      settlers_self.displayCardfan();
      settlers_self.updateStatus(html, 1);

      $(".option").off();
      $(".option").on("click", function () {
        let res = $(this).attr("id");
        cardsToGain.push(res);
        remaining--;
        if (remaining <= 0) {
          settlers_self.addMove(
            `year_of_plenty\t${player}\t${cardname}\t${JSON.stringify(
              cardsToGain
            )}`
          );
          settlers_self.endTurn();
          return 0;
        } else {
          gainResource(settlers_self);
        }
      });
    };
    gainResource(settlers_self);
  }

  /*
    Let player choose a resource, then issue selection to game queue
  */
  playMonopoly(player, cardname) {
    if (this.game.player != player) return;
    //Pick something to get
    let settlers_self = this;
    let resourceList = this.skin.resourceArray();

    //Player recursively selects all the resources they want to get rid of
    let html = `<div class='tbd'>Select Desired Resource: <ul class="horizontal_list">`;
    for (let i of resourceList) {
      html += `<li id="${i}" class="iconoption option">${settlers_self.returnResourceHTML(i)}</li>`;
    }
    html += "</ul>";
    html += "</div>";

    settlers_self.updateStatus(html, 1);
    settlers_self.displayCardfan();
    $(".option").off();
    $(".option").on("click", function () {
      let res = $(this).attr("id");
      settlers_self.addMove(`monopoly\t${player}\t${cardname}\t${res}`);
      settlers_self.endTurn();
      return 0;
    });
  }

  /*
    Every time a knight played, need to check if this makes a new largest army
  */
  checkLargestArmy(player) {
    let vpChange = false;
    if (this.game.state.largestArmy.player > 0) {
      //Someone already has it
      if (this.game.state.largestArmy.player != player) {
        //Only care if a diffeent player
        if (
          this.game.state.players[player - 1].knights >
          this.game.state.largestArmy.size
        ) {
          this.game.state.largestArmy.player = player;
          this.game.state.largestArmy.size =
            this.game.state.players[player - 1].knights;
          vpChange = true;
        }
      } else {
        //Increase army size
        this.game.state.largestArmy.size =
          this.game.state.players[player - 1].knights;
      }
    } else {
      //Open to claim
      if (this.game.state.players[player - 1].knights >= 3) {
        this.game.state.largestArmy.player = player;
        this.game.state.largestArmy.size =
          this.game.state.players[player - 1].knights;
        vpChange = true;
      }
    }
    if (vpChange) this.updateScore(); //Maybe not necessary?
  }

  /*
  Given a city (vertex) slot w/ or w/o the city_ prefix, determine who owns a city there
  or return 0 if empty
  */
  isCityAt(slot) {
    if (!slot.includes("city_")) slot = "city_" + slot;

    for (let city of this.game.state.cities)
      if (city.slot == slot) return city.player;
    return 0;
  }

  /*
    A down and dirty recursive algorthm to find a player's longest contiguous road
  */
  checkLongestRoad(player) {
    //Recursive search function

    let continuousRoad = function (settlers_self, currentPath, availableRoads) {
      let best = currentPath;
      if (availableRoads.length == 0) return best;

      let returnedBest,
        cityCheck,
        potTemp,
        verts = [];
      //Look in both directions
      if (currentPath.length === 1)
        verts = settlers_self.hexgrid.verticesFromEdge(currentPath[0]);
      else
        verts.push(
          settlers_self.hexgrid.directedEdge(
            currentPath[currentPath.length - 2],
            currentPath[currentPath.length - 1]
          )
        );

      for (let v of verts) {
        cityCheck = settlers_self.isCityAt(v);
        if (cityCheck == player || cityCheck == 0) {
          potTemp = settlers_self.hexgrid.edgesFromVertex(v);
          for (let potRoad of potTemp) {
            if (availableRoads.includes(potRoad)) {
              let newPath = currentPath.concat(potRoad);
              let remainder = [...availableRoads];
              remainder.splice(remainder.indexOf(potRoad), 1);
              returnedBest = continuousRoad(settlers_self, newPath, remainder);
              if (returnedBest.length > best.length) best = returnedBest;
            }
          }
        }
      }
      return best;
    };

    //Determine which roads belong to player
    let playerSegments = [];
    for (let road of this.game.state.roads) {
      if (road.player == player)
        playerSegments.push(road.slot.replace("road_", ""));
    }
    //Starting with each, find maximal continguous path
    let longest = [];
    //console.log(`Player ${player}: ${playerSegments}`);
    for (let i = 0; i < playerSegments.length; i++) {
      let remainder = [...playerSegments];
      remainder.splice(i, 1);
      let bestPath = continuousRoad(this, Array(playerSegments[i]), remainder);
      if (bestPath.length > longest.length) longest = bestPath;
    }

    //Check if longest path is good enough to claim VP prize
    if (longest.length >= 5) {
      if (this.game.state.longestRoad.player > 0) {
        //Someone already has it
        if (longest.length > this.game.state.longestRoad.size) {
          if (this.game.state.longestRoad.player != player) {
            //Only care if a diffeent player
            this.highlightRoad(
              player,
              longest,
              `claimed the ${this.skin.longest.name} from Player ${this.game.state.longestRoad.player} with ${longest.length} segments!`
            );
            this.game.state.longestRoad.player = player;
            this.game.state.longestRoad.size = longest.length;
          } else {
            //Increase size
            this.game.state.longestRoad.size = longest.length;
            this.updateLog(
              `Player ${player} extended the ${this.skin.longest.name} to ${longest.length} segments.`
            );
          }
        }
      } else {
        //Open to claim
        this.highlightRoad(
          player,
          longest,
          `claimed the ${this.skin.longest.name} with ${longest.length} segments.`
        );
        this.game.state.longestRoad.player = player;
        this.game.state.longestRoad.size = longest.length;
      }
    }
  }

  countResource(player, resource) {
    let ct = 0;
    for (let i of this.game.state.players[player - 1].resources)
      if (i == resource) ct++;
    return ct;
  }

  /*
   *  Functions for trading
   *
   */

  //Convert Resource Object to readable string
  wishListToString(stuff) {
    let offer = "";
    for (let resource in stuff) {
      if (stuff[resource] > 0) {
        if (stuff[resource] > 1) {
          offer += ` and ${stuff[resource]} x ${resource}`;
        } else {
          offer += ` and ${resource}`;
        }
      }
    }
    offer = offer.length > 0 ? offer.substring(5) : "<em>nothing</em>";
    return offer;
  }

  wishListToImage(stuff) {
    let offer = "";
    for (let resource in stuff) {
      for (let i = 0; i < stuff[resource]; i++) {
        offer += `<img class="icon" src="${this.skin.resourceIcon(resource)}"/><div class="tiptext">${resource}</div>`;
      }
    }
    return offer;
  }

  /*
  Cancel all outstanding trade offers (well... just delete from dom)
  (Because player moved from trading to building part of turn)
  */
  stopTrading() {
    this.game.state.canTrade = false; //Once you spend resources, you can no longer trade
    if (this.tradeWindowOpen){
      this.displayModal("Trading closed until next player's turn");
      this.overlay.hide();
      this.tradeWindowOpen = false;  
    }
    
    let nodes = document.querySelectorAll(".pbtrade");
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].remove();
    }
  }

  /*
  Short circuit the simultaneous moves from an open offer trade to give player control of the game again
  */
  clearTrading() {
    this.game.state.tradingOpen = false; //Flag to prevent incoming trades
    //Hack the confirms to clear the queue
    for (let i = 0; i < this.game.confirms_needed.length; i++) {
      if (this.game.confirms_needed[i]) {
        this.game.confirms_needed[i] = 0;
        if (this.game.player == i + 1) {
          this.overlay.hide();
        }
      }
    }
  }

  clearAdvert() {
    this.addMove("clear_advert\t" + this.game.player);
    this.endTurn();
  }



  /*<><><><><><><>
  Broadcast offer to trade to all players
  This just makes an advertisement accessible through game menu to any player at any time (even if not eligible to trade)
  and there is no game mechanic to go directly into accepting or rejecting the trade
  @param tradeType (integer) the player number of the targeted player, 0 for all players, -1 for advertisement
  */
  showTradeOverlay(tradeType = -1) {
    let settlers_self = this;

    this.tradeWindowOpen = true;
    let my_resources = {};
    let resources = settlers_self.skin.resourceArray();
    let offer_resources = settlers_self.skin.resourceObject();
    let receive_resources = settlers_self.skin.resourceObject();

    //Convert the players array of resources into a compact object {wheat:1, wood:2,...}
    for (let resource of resources) {
      let temp = settlers_self.countResource(
        settlers_self.game.player,
        resource
      );
      if (temp > 0) my_resources[resource] = temp;
    }
    //Customize UI for dealing with 1 or more players
    let title =
      tradeType > 0
        ? `Trade with Player ${tradeType}`
        : "Broadcast Trade Offer";
    let submit = tradeType > 0 ? "Send offer" : "Broadcast Offer";

    let updateOverlay = function (settlers_self, resList, myRes, offering, receiving) {
      let html = `<div class="trade_overlay" id="trade_overlay">
            <div style="width:100%"><h1 class="trade_overlay_title">${title}</h1></div>`;
      html += `<p>Interrupt game play to send a concrete trade offer to ${(tradeType>0)?`Player ${tradeType}.`:"all your opponents. The first to accept completes the trade. You may rescind the trade and move on with your turn if they take too long to think about it."}</p>`;
  
      html += `<h2>You Want</h2>
            <div class="trade_overlay_offers">`;
      for (let i = 0; i < resList.length; i++){
        html += `<div id="want_${i}" class="trade_button select">
                  <div>${resList[i]}</div>
                  <div class="offer_icons" id="want_${resList[i]}">`;

        for (let j = 0; j< receiving[resList[i]]; j++){
          html += `<img id="${resList[i]}" class="icon receive" src="${settlers_self.skin.resourceIcon(resList[i])}"/>`;
        }
         html +=  `</div></div>`;
      }
        

      html += `</div><h2>You Offer</h2><div class="trade_overlay_offers">`;

      for (let i = 0; i < resList.length; i++) {
        html += `<div id="offer_${i}" class="trade_button ${(myRes[resList[i]])?"select":"noselect"}">
                 <div class="tip"><span>${resList[i]}</span>
                 <div class="tiptext">${(myRes[resList[i]])?myRes[resList[i]]:0} total</div></div>
                 <div class="offer_icons" id="offer_${resList[i]}">`;
          for (let j = 0; j< offering[resList[i]]; j++){
            html += `<img id="${resList[i]}" class="icon offer" src="${settlers_self.skin.resourceIcon(resList[i])}"/>`;
          }
          html += `</div></div>`;
      }

      html += `</div><div class="trade_overlay_buttons">
            <div class="trade_overlay_button button trade_overlay_reset_button">Reset</div>
            <div class="trade_overlay_button button trade_overlay_broadcast_button">${submit}</div>
          </div></div>`;

      settlers_self.overlay.show(settlers_self.app, settlers_self.this, html);

      $(".trade_button.select").on("click", function () {
        //Update Offer
        let item = $(this).attr("id");
        let temp = item.split("_");
        let resInd = parseInt(temp[1]);
        if (temp[0] == "want") {
          receiving[resList[resInd]]++;
        } else {
          if (offering[resList[resInd]] < myRes[resList[resInd]]) {
            offering[resList[resInd]]++;
          }
        }
        ///Update DOM
        updateOverlay(settlers_self, resList, myRes, offering, receiving);
      });

      $(".icon").on("click", function(e){
        let res = $(this).attr("id");
        if ($(this).hasClass("offer")){
          offering[res]--;
        }else{
          receiving[res]--;
        }
        e.stopPropagation();
        updateOverlay(settlers_self, resList, myRes, offering, receiving);
      });

      $(".trade_overlay_reset_button").on("click", function () {
        updateOverlay(
          settlers_self,
          resList,
          myRes,
          settlers_self.skin.resourceObject(),
          settlers_self.skin.resourceObject()
        );
      });

      $(".trade_overlay_broadcast_button").on("click", function () {
        settlers_self.tradeWindowOpen = false;
        if (tradeType > 0) {
          settlers_self.addMove(
            `offer\t${settlers_self.game.player}\t
            ${tradeType}\t${JSON.stringify(offering)}\t
            ${JSON.stringify(receiving)}`);
        } else {
          settlers_self.addMove(
            `multioffer\t${settlers_self.game.player}\t
            ${JSON.stringify(offering)}
            \t${JSON.stringify(receiving)}`
          );
        }
        settlers_self.overlay.hide();
        settlers_self.endTurn();
      });
    };

    //Start the display and selection process
    updateOverlay(
      settlers_self,
      resources,
      my_resources,
      offer_resources,
      receive_resources
    );
  }

  /*
  Alternate UI for advertizing your wants and needs
  */
  showResourceOverlay() {
    let settlers_self = this;
    let myRes = {};
    let resources = settlers_self.skin.resourceArray();

    //Convert the players array of resources into a compact object {wheat:1, wood:2,...}
    for (let resource of resources) {
      let temp = settlers_self.countResource(
        settlers_self.game.player,
        resource
      );
      if (temp > 0) myRes[resource] = temp;
    }

    let html = `<div class="trade_overlay" id="trade_overlay">
            <div style="width:100%"><h1 class="trade_overlay_title">Advertise</h1>
            <p>You may share information about your resources with the other players, telling them which resources you may be interested in trading. It will be up to them to initiate a trade offer. This action does not interrupt game play.</p></div>
            <h2>You Want</h2>
            <div class="trade_overlay_offers">`;
    for (let i = 0; i < resources.length; i++)
      html += `<div id="want_${i}" class="trade_button select tip"><img class="icon" src="${this.skin.resourceIcon(
        resources[i]
      )}"/><div class="tiptext">${resources[i]}</div></div>`;

    html += `</div><h2>You Offer</h2><div class="trade_overlay_offers">`;

    for (let i = 0; i < resources.length; i++) {
      if (myRes[resources[i]])
        html += `<div id="offer_${i}" class="trade_button select tip"><img class="icon" src="${this.skin.resourceIcon(
          resources[i]
        )}"/><div class="tiptext">You have ${myRes[resources[i]]} ${resources[i]} available</div></div>`;
      else
        html += `<div id="offer_${i}" class="trade_button noselect tip"><img class="icon" src="${this.skin.resourceIcon(
          resources[i]
        )}"/><div class="tiptext">You have no ${resources[i]} to offer</div></div>`;
    }

    html += `</div><div class="trade_overlay_buttons">
            <div class="trade_overlay_button button trade_overlay_reset_button">Reset</div>
            <div class="trade_overlay_button button trade_overlay_broadcast_button">Broadcast Offer</div>
          </div></div>`;

    this.overlay.show(this.app, this, html);

    $(".trade_button.select").on("click", function () {
      $(this).toggleClass("selected");
    });

    $(".trade_overlay_reset_button").on("click", function () {
      $(".trade_button.select").removeClass("selected");
    });

    $(".trade_overlay_broadcast_button").on("click", function () {
      let offering = {};
      let receiving = {};
      let divs = document.querySelectorAll(".selected");
      for (let i = 0; i < divs.length; i++) {
        let id = divs[i].id;
        let temp = id.split("_");
        let resInd = parseInt(temp[1]);
        //console.log(id,resources[resInd]);
        if (temp[0] == "want") {
          receiving[resources[resInd]] = 1;
        } else {
          offering[resources[resInd]] = 1;
        }
      }
      /*
          //Lazy way
          settlers_self.addMove(`advertisement\t${settlers_self.game.player}\t${JSON.stringify(offering)}\t${JSON.stringify(receiving)}`);
          settlers_self.endTurn();
          settlers_self.overlay.hide();
          */
      //Old way
      let old_turn = settlers_self.game.turn;
      //console.log(settlers_self.game.turn);
      let cmd = `advertisement\t${settlers_self.game.player}\t${JSON.stringify(
        offering
      )}\t${JSON.stringify(receiving)}`;
      settlers_self.game.turn = [];
      settlers_self.game.turn.push(cmd);
      settlers_self.sendMessage("game", {}, function () {
        settlers_self.game.turn = old_turn;
      });
      settlers_self.overlay.hide();
    });
  }


  /*
    Alternate interface for viewing a trade offer with accept/reject commands
  */
  showTradeOffer(player, offering, receiving, exclusive = true) {
    let settlers_self = this;
    let resList = settlers_self.skin.resourceArray();

    let html = `<div class="trade_overlay" id="trade_overlay">
            <div style="width:100%"><h1 class="trade_overlay_title">Trade Offer</h1></div>
            <h2>Player ${player} will give you</h2>
            <div class="trade_overlay_offers">`;
    for (let i = 0; i < resList.length; i++) {
      if (receiving[resList[i]] > 0) {
        html += `<div class="tip">`;
        for (let j = 0; j < receiving[resList[i]]; j++) {
          html += `<img class="icon" src="${this.skin.resourceIcon(resList[i])}">`;
        }
        html += `<div class="tiptext">${receiving[resList[i]]} ${resList[i]}</div></div>`;
      }
    }

    html += `</div><h2>In exchange for</h2><div class="trade_overlay_offers">`;
    let canPlayerAccept = true;
    for (let i = 0; i < resList.length; i++) {
      if (offering[resList[i]] > 0) {
        html += `<div class="tip">`;
        for (let j = 0; j < offering[resList[i]]; j++) {
          html += `<img class="icon" src="${this.skin.resourceIcon(resList[i])}">`;
        }
        html += `<div class="tiptext">${offering[resList[i]]} ${resList[i]}</div></div>`;
      }

      if (this.countResource(this.game.player, resList[i]) < offering[resList[i]]) {
        canPlayerAccept = false;
      }
    }

    html += `</div><div class="trade_overlay_buttons">`;

    if (canPlayerAccept){
      html += `<div class="trade_overlay_button button" id="reject">Reject</div>
               <div class="trade_overlay_button button" id="accept">Accept</div>`; 
    }else{
      html += `<div class="notice">You cannot accept this trade</div>
               <div class="trade_overlay_button button" id="reject">Okay</div>`;
    }
    
    //<div class="trade_overlay_button button" id="chat">Chat</div>
    html += `</div></div>`;

    settlers_self.overlay.show(settlers_self.app, settlers_self.this, html);
    settlers_self.overlay.blockClose();
    $(".trade_overlay_button").on("click", function () {
      let choice = $(this).attr("id");

      if (choice == "accept") {
        settlers_self.overlay.hide();
        if (exclusive) {
          settlers_self.addMove(
            "accept_offer\t" +
              settlers_self.game.player + "\t" +
              player + "\t" +
              JSON.stringify(receiving) + "\t" +
              JSON.stringify(offering)
          );
        } else {
          settlers_self.addMove(
            "accept_offer_first\t" +
              settlers_self.game.player + "\t" +
              player + "\t" +
              JSON.stringify(receiving) + "\t" +
              JSON.stringify(offering)
          );
        }

        settlers_self.endTurn();
      }
      if (choice == "reject") {
        settlers_self.overlay.hide();
        //if (exclusive){
        settlers_self.addMove(`reject_offer\t${settlers_self.game.player}\t${player}`);
        //}else{
        // settlers_self.addMove("reject_open_offer\t"+settlers_self.game.player+"\t"+player);
        //}
        settlers_self.endTurn();
      }
      //Short cut to chat window
      if (choice == "chat") {
        settlers_self.overlay.hide(); //Have to close overlay because it blocks chat window
        settlers_self.chatWith(player);
      }
    });
    $(".noselect").off(); //Don't let players accept trade
  }

  chatWith(player) {
    let members = [
      this.game.players[player - 1],
      this.app.wallet.returnPublicKey(),
    ].sort();
    let gid = this.app.crypto.hash(members.join("_"));
    let chatmod = null;
    for (let i = 0; i < this.app.modules.mods.length; i++) {
      if (this.app.modules.mods[i].slug === "chat") {
        chatmod = this.app.modules.mods[i];
      }
    }
    let newgroup = chatmod.createChatGroup(members);
    if (newgroup) {
      chatmod.addNewGroup(newgroup);
      chatmod.sendEvent("chat-render-request", {});
      chatmod.saveChat();
      chatmod.openChatBox(newgroup.id);
    } else {
      chatmod.sendEvent("chat-render-request", {});
      chatmod.openChatBox(gid);
    }
  }

  /* 
  Create an object saying what the exchange rate for each resource is
  */
  analyzePorts() {
    let resources = this.skin.resourceArray();
    let tradeCost = {};
    let minForTrade = 4;
    //console.log(this.game.state.players[this.game.player-1].ports);

    for (let i of this.game.state.players[this.game.player - 1].ports) {
      if (i == "any") {
        //3:1 portt
        minForTrade = 3;
      } else {
        //2:1 resource port
        tradeCost[i] = 2;
      }
    }
    //Fill in exchange rates
    for (let r of resources) {
      if (!tradeCost[r]) {
        tradeCost[r] = minForTrade;
      }
    }

    return tradeCost;
  }


  /* 
  Interface to Trade with the bank
  */
  bankTrade() {
    let settlers_self = this;
    let my_resources = {};
    let minForTrade = this.analyzePorts(); //4;  //1) Fix to have 3:1 port, 2) Fix for resource specific 2:1 ports

    for (let resource of this.skin.resourceArray()) {
      let temp = settlers_self.countResource(
        settlers_self.game.player,
        resource
      );
      if (temp >= minForTrade[resource]) my_resources[resource] = temp;
    }

    if (Object.keys(my_resources).length > 0) {
      let html = "<div class='tbd'>Select Resource to Trade: <ul class='bank'>";
      for (let i in my_resources) {
        html += `<li id="${i}" class="option">`;
        for (let j = 0; j<minForTrade[i]; j++){
          html += `<img class="icon" src="${settlers_self.skin.resourceIcon(i)}"/>`;
        }
        //`${i} (${minForTrade[i]}/${my_resources[i]})</li>`;
      }
      html += '<li id="cancel" class="option">cancel trade</li>';
      html += "</ul>";
      html += "</div>";

      settlers_self.updateStatus(html, 1);

      $(".option").off();
      $(".option").on("click", function () {
        let res = $(this).attr("id");
        if (res == "cancel") {
          settlers_self.endTurn();
          return;
        }

        //Picked something to give, now pick something to get
        html = "<div class='tbd'>Select Desired Resource: <ul class='bank horizontal_list'>";
        for (let i of settlers_self.skin.resourceArray()) {
          html += `<li id="${i}" class="iconoption option tip"><img class="icon" src="${settlers_self.skin.resourceIcon(i)}">
            <div class="tiptext">${i}</div></li>`;
        }
        html += '<li id="cancel" class="option">cancel trade</li>';
        html += "</ul>";
        html += "</div>";
        settlers_self.updateStatus(html, 1);

        $(".option").off();
        $(".option").on("click", function () {
          let newRes = $(this).attr("id");
          if (newRes == "cancel") {
            settlers_self.endTurn();
            return;
          }
          if (newRes == res) {
            html = `<div class="tbd">Are you sure you want to discard ${
              minForTrade[res] - 1
            } ${res}s??
                          <ul><li id="yes" class="option">Yes, Do it!</li>
                          <li id="no" class="option">No way!</li></ul></div>`;
            settlers_self.updateStatus(html, 1);
            $(".option").off();
            $(".option").on("click", function () {
              let choice = $(this).attr("id");
              if (choice == "yes") {
                settlers_self.addMove(
                  `bank\t${settlers_self.game.player}\t${minForTrade[res]}\t${res}\t1\t${newRes}`
                );
                settlers_self.endTurn();
                return;
              } else {
                settlers_self.endTurn();
                return;
              }
            });
            return;
          }

          //Set up Trade
          settlers_self.addMove(
            `bank\t${settlers_self.game.player}\t${minForTrade[res]}\t${res}\t1\t${newRes}`
          );
          settlers_self.endTurn();
          return;
        });
      });
    } else {
      let ackhtml = `<div class='tbd'>You don't have enough resources to trade with the bank</div> 
                    <ul><li class="option" id="okay">okay</li></ul>`;
      settlers_self.updateStatus(ackhtml,1);
      $(".option").off();
      $(".option").on("click",function(){
        settlers_self.playerPlayMove();
        return;
      });
    }
  }

  /***********
   *
   * Game animations
   *
   ***********/
  /*
  Briefly animate the longest road and update log if there is a change in ownership
  */
  highlightRoad(player, road, msg) {
    this.updateLog(`Player ${player} ${msg}`);
    for (let segment of road) {
      let selector = "#road_" + segment;
      let div = document.querySelector(selector);
      if (div) div.classList.add("roadhighlight");
      //else  console.log("Null selector?",selector);
    }

    let divname = ".roadhighlight";

    $(divname)
      .css("background", "#FFF")
      .delay(500)
      .queue(function () {
        $(this).removeAttr("style").dequeue();
      })
      .delay(500)
      .queue(function () {
        $(this).css("background", "#FFF").dequeue();
      })
      .delay(500)
      .queue(function () {
        $(this).removeAttr("style").dequeue();
      })
      .delay(500)
      .queue(function () {
        $(this).css("background", "#FFF").dequeue();
      })
      .delay(500)
      .queue(function () {
        $(this).removeAttr("style").dequeue();
      })
      .delay(500)
      .queue(function () {
        $(this).css("background", "#FFF").dequeue();
      })
      .delay(500)
      .queue(function () {
        $(this).removeAttr("style").removeClass("roadhighlight").dequeue();
      });
  }

  displayDice() {
    //Should move to general gametools at some point

    try {
      //$('#diceroll').fadeIn();

      let obj = document.querySelector("#diceroll");
      if (obj) {
        let html = "";

        for (let d of this.game.state.lastroll) {
          html += `<div class="die">`;
          switch (d) {
            case 1:
              html += `<svg viewbox="0 0 200 200"><rect fill="red" width="200" height="200" rx="25"/>
                    <circle fill="white" cx="100" cy="100" r="25"/></svg>`;
              break;
            case 2:
              html += `<svg viewbox="0 0 200 200"><rect fill="red" width="200" height="200" rx="25"/>
                    <circle fill="white" cx="66" cy="66" r="25"/>
                    <circle fill="white" cx="133" cy="133" r="25"/></svg>`;
              break;
            case 3:
              html += `<svg viewbox="0 0 200 200"><rect fill="red" width="200" height="200" rx="25"/>
                    <circle fill="white" cx="50" cy="50" r="25"/>
                    <circle fill="white" cx="100" cy="100" r="25"/>
                    <circle fill="white" cx="150" cy="150" r="25"/></svg>`;
              break;
            case 4:
              html += `<svg viewbox="0 0 200 200"><rect fill="red" width="200" height="200" rx="25"/>
                    <circle fill="white" cx="55" cy="55" r="25"/>
                    <circle fill="white" cx="55" cy="145" r="25"/>
                    <circle fill="white" cx="145" cy="55" r="25"/>
                    <circle fill="white" cx="145" cy="145" r="25"/></svg>`;
              break;
            case 5:
              html += `<svg viewbox="0 0 200 200"><rect fill="red" width="200" height="200" rx="25"/>
                    <circle fill="white" cx="50" cy="50" r="25"/>
                    <circle fill="white" cx="50" cy="150" r="25"/>
                    <circle fill="white" cx="100" cy="100" r="25"/>
                    <circle fill="white" cx="150" cy="50" r="25"/>
                    <circle fill="white" cx="150" cy="150" r="25"/></svg>`;
              break;
            case 6:
              html += `<svg viewbox="0 0 200 200"><rect fill="red" width="200" height="200" rx="25"/>
                  <circle fill="white" cx="55" cy="40" r="25"/>
                  <circle fill="white" cx="55" cy="100" r="25"/>
                  <circle fill="white" cx="55" cy="160" r="25"/>
                  <circle fill="white" cx="145" cy="40" r="25"/>
                  <circle fill="white" cx="145" cy="100" r="25"/>
                  <circle fill="white" cx="145" cy="160" r="25"/></svg>`;
              break;
            default:
              html += `<svg viewbox="0 0 200 200"><rect fill="red" width="200" height="200" rx="25"/></svg>`;
          }
          html += `</div>`;
        }
        obj.innerHTML = html;
      }
    } catch (err) {}
  }
  /*
  Flashes tiles activated by dice roll
  */
  animateDiceRoll(roll) {
    //console.log("Dice Animated: " + roll);
    let divname = ".sv" + roll + ":not(.bandit)";
    $(divname)
      .css("color", "#000")
      .css("background", "#FFF6")
      .delay(600)
      .queue(function () {
        $(this).css("color", "#FFF").css("background", "#0004").dequeue();
      })
      .delay(600)
      .queue(function () {
        $(this).css("color", "#000").css("background", "#FFF6").dequeue();
      })
      .delay(600)
      .queue(function () {
        $(this).css("color", "#FFF").css("background", "#0004").dequeue();
      })
      .delay(600)
      .queue(function () {
        $(this).css("color", "#000").css("background", "#FFF6").dequeue();
      })
      .delay(600)
      .queue(function () {
        $(this).css("color", "#FFF").css("background", "#0004").dequeue();
      })
      .delay(600)
      .queue(function () {
        $(this).css("color", "#000").css("background", "#FFF6").dequeue();
      });
      /*.delay(800)
      .queue(function () {
        $(this).removeAttr("style").dequeue();
      });*/
  }

  /*
  So we sometimes want a status update message to persist through the next update status 
  (so player has a chance to read it if we are rapidly knocking moves of the queue)
  Important messages are marked with "persistent"
  */
  getLastNotice(preserveLonger = false) {
    if (document.querySelector(".status .persistent")) {
      let nodes = document.querySelectorAll(".status .persistent");
      return `<div class="${preserveLonger ? "persistent" : "player-notice"}">${
        nodes[nodes.length - 1].innerHTML
      }</div>`;
    }
    return "";
  }

  /*
    ****(Close) Duplicate of Blackjack****
    Need to overwrite gametemple which requires either HUD or a ID=status,
    PlayerBox Model uses a .status class ....
    This function may be less than ideal, abusing the concept of status, 
    since it is mostly being used to update the DOM for user interface
  */
  updateStatus(str, hide_info = 0) {
    try {
      if (hide_info == 0) {
        this.playerbox.showInfo();
      } else {
        this.playerbox.hideInfo();
      }

      if (this.lock_interface == 1) {
        return;
      }

      this.game.status = str;

      if (this.browser_active == 1) {
        let status_obj = document.querySelector(".status");
        if (this.game.players.includes(this.app.wallet.returnPublicKey())) {
          status_obj.innerHTML = str;
          $(".status").disableSelection();
        }
      }
    } catch (err) {
      //console.log("ERR: " + err);
    }
  }


}

module.exports = Settlers;
