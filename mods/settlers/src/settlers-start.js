const Scoreboard = require("./lib/scoreboard");
const GameTemplate = require("../../lib/templates/gametemplate");
const SettlersSkin = require("./lib/settlers.skin.js");
const SettlersRules = require("./lib/overlays/rules");
const SettlersWelcome = require("./lib/overlays/welcome");
const SettlersStats = require("./lib/overlays/stats");
const SettlersGameOptionsTemplate = require("./lib/settlers-game-options.template");
const SettlersTradeHelpOverlayTemplate = require("./lib/settlers-trade-help-overlay.template");


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
  }


  initializeHTML(app) {

    if (!this.browser_active) { return; }

    //Prevent this function from running twice as saito-lite is configured to run it twice
    if (this.initialize_game_run) {return;} 

    super.initializeHTML(app);
    
    this.scoreboard.render();

    this.menu.addMenuOption("game-game", "Game");
    this.menu.addMenuOption("game-info", "Info");

    this.menu.addSubMenuOption("game-info", {
      text: "How to Play",
      id: "game-help",
      class: "game-help",
      callback: function (app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.rules_overlay.render();
      },
    });
    this.menu.addSubMenuOption("game-info", {
      text: "Stats",
      id: "game-stats",
      class: "game-stats",
      callback: function (app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.stats_overlay.render();
      },
    });
    
    this.menu.addSubMenuOption("game-info", {
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

console.log("UPDATING THE HUD!");
    this.hud.render();

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
      document.querySelector(".mobile-trading-container").style.display = "none";
      let s = document.querySelector(".scoreboard");
      if (s.style.display != "block") { s.style.display = "block"; } else { s.style.display = "none"; }
    }
    document.querySelector(".hud-body .mobile .trade").onclick = (e) => {
      document.querySelector(".scoreboard").style.display = "none";
      let s = document.querySelector(".mobile-trading-container");
      if (s.style.display != "grid") { s.style.display = "grid"; } else { s.style.display = "none"; }
    }

  }

  initializeGame(game_id) {

    if (this.game.state == undefined) {
      this.game.state = this.returnState();

      let colors = [1, 2, 3, 4];
      this.game.colors = [];
      for (let i = 0; i < this.game.players.length; i++){
        this.game.colors = this.game.colors.concat(colors.splice(this.rollDice(colors.length)-1,1));
      }

      this.skin.render(this.game.options.theme);
      this.game.stats = this.returnStats();

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


  returnState() {

    let state = {};
    state.hexes = {};
    state.roads = [];
    state.cities = [];
    state.longestRoad = { size: 0, player: 0, path:[] };
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

  returnStats(){
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
          logMsg += `${this.game.playerNames[player-1]} gains ${resource}`;
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
      let robPlayer = (victim) => {
        let potentialLoot =
            settlers_self.game.state.players[victim - 1].resources;
          if (potentialLoot.length > 0) {
            let loot =
              potentialLoot[Math.floor(Math.random() * potentialLoot.length)];
            settlers_self.addMove(`steal_card\t${player}\t${victim}\t${loot}`);
          } else settlers_self.addMove(`steal_card\t${player}\t${victim}\tnothing`);
          settlers_self.endTurn();
      };

      if (thievingTargets.length > 1) {
        let html = '<div class="tbd">Steal from which Player: <ul>';
        for (let i = 0; i < this.game.players.length; i++) {
          if (thievingTargets.includes(i + 1)) {
            html += `<li class="option" id="${i + 1}">${settlers_self.game.playerNames[i]} (${
              settlers_self.game.state.players[i].resources.length
            } cards)</li>`;
          }
        }
        html += "</ul></div>";
        this.updateStatus(html, 1);

        //Select a player to steal from
        $(".option").off();
        $(".option").on("click", function () {
          $(".option").off();
          let victim = $(this).attr("id");
          robPlayer(victim);
        });
      } else {
        robPlayer(thievingTargets[0]);
      }
    } else {
      //No one to steal from
      settlers_self.addMove(`steal_card\t${player}\t0\tnothing`);
      settlers_self.endTurn();
    }
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

    if (Object.keys(this.game.state.ports).length == 9){
      //Just read the port information and call the function
      for (let p in this.game.state.ports){
        let hex = p.substr(2);
        let dir = p[0];
        this.addPortToGameboard(hex, this.game.state.ports[p], dir);
      }
    }else{
      //Define the ports
      let resources = this.skin.resourceArray();
      let randomRoll = this.rollDice(2);
      let hexes, angles;
      if (randomRoll == 1){
         hexes = ["1_1", "3_5", "5_4", "4_2"];
         angles = [6, 3, 3, 5]; 
      }else{
         hexes = ["1_2", "2_1",  "5_3", "5_5"];
         angles = [1, 5,  4, 2];
      }

      for (let i = 0; i < hexes.length; i ++){
        this.addPortToGameboard(hexes[i], "any", angles[i]);
      }

      //Now do resource ports
      if (randomRoll == 1){
         hexes = ["1_2", "2_1", "5_3", "5_5", "2_4"];
         angles = [1, 5, 4, 2, 1];
      }else{
         hexes = ["1_1", "3_5", "5_4", "4_2", "2_4"];
         angles = [6, 3, 3, 5, 1]; 
      }

      for (let i = 0; i < 5; i++) {
        let r = resources.splice(this.rollDice(resources.length)-1,1);
        this.addPortToGameboard(hexes[i], r, angles[i]);
      }
    }
    
  }

  addPortToGameboard(hex, port, direction) {
    let port_id = "port_" + direction + "_" + hex;

    this.game.state.ports[direction + "_" + hex] = port;

    if (!this.browser_active){return;}

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
    //console.log("Add road to gameboard: "+road_id);
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
    console.log(this.game.pool, this.game.deck);
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
    console.log("Draw board");
    $(".road.empty").remove();
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
      let classname = "p" + this.game.colors[this.game.state.cities[i].player-1];
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
      //Not the most efficient, but should work to both draw the built roads and prep the available spaces for future building
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
        this.game.queue.push(`winner\t${i}`);
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
                    </div>`;
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
      this.cardfan.render(cards);

      if (usingDev){
        this.cardfan.addClass("staggered-hand");
        this.cardfan.removeClass("bighand");
      }else{
        this.cardfan.addClass("bighand");  
        this.cardfan.removeClass("staggered-hand");
      }
    } catch (err) {
      //console.log(err);
    }
  }

  // Only for the game Observer
  showPlayerResources(){
    $(".player-box-graphic .hand").remove();
    for (let i = 0; i < this.game.players.length; i++){
      let hand = `<div class="hand">`;
      for (let r of this.game.state.players[i].resources){
        hand +=`<div class="card">
                  <img src="${this.skin.resourceCard(r)}">
                  <img class="icon" src="${this.skin.resourceIcon(r)}"/>
                </div>`;
      }
      hand += "</div>";

      this.playerbox.appendGraphic(hand, i+1);
    }
  }

  /*
    Refresh the Playerboxes with formatted information on the players
  */
  displayPlayers() {

    this.updateScore();

    if (!this.browser_active){ return; }

    let card_dir = "/settlers/img/cards/";
    for (let i = 1; i <= this.game.state.players.length; i++) {
      this.game.state.players[i - 1].resources.sort();
      let newhtml = "";

      let playerHTML = `
          <div class="saito-user settlers-user saito-user-${this.game.players[i-1]}" id="saito-user-${this.game.players[i-1]}" data-id="${this.game.players[i-1]}">
            <div class="saito-identicon-box"><img class="saito-identicon" src="${this.app.keychain.returnIdenticon(this.game.players[i-1])}"></div>
            <div class="saito-playername" data-id="${this.game.players[i-1]}">${this.game.playerNames[i-1]}</div>
            <div class="saito-userline">${this.skin.vp.name}: ${this.game.state.players[i - 1].vp}</div>
            ${(i==this.game.player)? `<i id="construction-costs" class="handy-help fa fa-question-circle" aria-hidden="true"></i>`: ""}
          </div>`;
      this.playerbox.refreshTitle(playerHTML, i);

      //Stats
      newhtml = `<div class="flexline">`;
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
      newhtml += `</div>`;

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
      
      } else {  //Is me

        if (!this.game.state.placedCity){
          newhtml += `<div class="flexline">`;
          if (this.game.state.ads[i-1].offer || this.game.state.ads[i-1].ask){
            newhtml += "<span>";
            if (this.game.state.ads[i-1].offer){
              newhtml += this.wishListToImage(this.game.state.ads[i-1].offer);
            }
            newhtml += `<i class="fas fa-long-arrow-alt-right"></i>`;
            if (this.game.state.ads[i-1].ask){
             newhtml += this.wishListToImage(this.game.state.ads[i-1].ask); 
            }
            newhtml += `</span><i id="cleartrade" class="fas fa-ban"></i>`;
          }else{
            newhtml += `<span id="tradenow">Trade</span>`;
          }
          newhtml += `</div>`;
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
      }

      this.playerbox.refreshInfo(newhtml, i);
      $(".player-box-info").disableSelection();
     
      //Other player ads... in LOG
      if (this.game.player != i) {
        if (this.game.state.ads[i-1].offer || this.game.state.ads[i-1].ask){

          if (this.game.state.ads[i-1].ad){
            let offer = this.wishListToImage(this.game.state.ads[i-1].offer);
            let ask = this.wishListToImage(this.game.state.ads[i-1].ask);
            let id = `trade_${i}`;
            let html = `<div class="trade flexline" id="${id}">`;
            if (ask) {
              html += `<span>Wants:</span><span class="tip">${ask}</span>`;
            }
            if (offer) {
              html += `<span>Has:</span><span class="tip">${offer}</span></div>`;
            }
            this.playerbox.refreshLog(html, i);
            id = "#" + id;
            $(id).off();
            $(id).on("click", function () {
              //  Launch overlay window for private trade
              settlers_self.showTradeOverlay(i, settlers_self.game.state.ads[i-1].ask, settlers_self.game.state.ads[i-1].offer);
            });                  
          }else{
            this.renderTradeOfferInPlayerBox(i, this.game.state.ads[i-1].offer, this.game.state.ads[i-1].ask);
          }
        }else{
          this.playerbox.refreshLog("", i);
        }
      } 
    }

    if (this.game.player == 0){ 
      this.showPlayerResources();
      return; 
    }

      
    let settlers_self = this;  
    $('#cleartrade').off();
    $('#cleartrade').on("click", function(){ 
      settlers_self.clearAdvert();
    });
    $("#tradenow").off();
    $("#tradenow").on("click", function(){
      settlers_self.showResourceOverlay();
    });

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


  renderTradeOfferInPlayerBox(offering_player, stuff_on_offer, stuff_in_return){
    let settlers_self = this;

    let can_accept = true;
    for (let r in stuff_in_return){
      if (this.countResource(this.game.player,r) < stuff_in_return[r]){
        can_accept = false;
      }
    }

    if (!can_accept){
      this.game.state.ads[offering_player-1].ad = true;
      this.addMove(`reject_offer\t${this.game.player}\t${offering_player}`);
      this.endTurn();
      return;
    }

    //Simplify resource objects
    let offer = this.wishListToImage(stuff_on_offer) || "<em>nothing</em>";
    let ask = this.wishListToImage(stuff_in_return) || "<em>nothing</em>";

    let html = `<div class="pbtrade">
                  <div class="flexline">Offers <span class="tip highlight">${offer}</span> for <span class="tip highlight">${ask}</span></div>`;
    
    if (this.game.state.canTrade){
      html += `<ul class="flexline">
                <li class="pboption" id="accept">✔</li>
                <li class="pboption" id="reject">✘</li>
              </ul>`;  
    }
    html += "</div>";

    this.playerbox.refreshLog(html, offering_player);
 
    let selector =
      "#player-box-" + this.playerbox.playerBox(offering_player);

    $(`${selector} .pboption`).off();
    $(`${selector} .pboption`).on("click", function () {
      //
      settlers_self.playerbox.refreshLog("", offering_player);
      //
      let choice = $(this).attr("id");
      if (choice == "accept") {
        settlers_self.game.state.ads[offering_player-1].offer = null;
        settlers_self.game.state.ads[offering_player-1].ask = null;
        settlers_self.addMove(`clear_advert\t${settlers_self.game.player}`);
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
        settlers_self.game.state.ads[offering_player-1].ad = true;
        settlers_self.addMove(`reject_offer\t${settlers_self.game.player}\t${offering_player}`);
        settlers_self.endTurn();
      }
    });

  
  }

  //Allow this player to click buttons to display resource or dev cards in their cardfan
  addEventsToHand() {
    let settlers_self = this;

    $(".cardselector").off(); //Previous events should be erased when the dom is rebuilt, but just in case...
    $(".cardselector").on("click", function () {
      settlers_self.displayCardfan($(this).attr("id"));
    });
  }

  removeEvents(){
    //console.trace("remove events");
    this.displayBoard();
    $(".cardselector").off();
    $(".trade").off();
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
    let classname = "p" + this.game.colors[player-1];

    $(divname).addClass(classname);
    $(divname).removeClass("empty");
    $(divname).html(this.skin.c1.svg);

    let blocks_me = false;
    let newRoads = this.hexgrid.edgesFromVertex(slot.replace("city_", ""));
    if (this.game.player == player) {
      //Enable player to put roads on adjacent edges
      for (let road of newRoads) {
        //console.log("Add ghost road from city");
        this.addRoadToGameboard(road.substring(2), road[0]);
      }
    }else{
      //Check if new city blocks other players from expanding their roads    
      for (let road of newRoads) {
        //console.log("road: ",road);
        for (let i = 0; i < this.game.state.roads.length; i++){
          if (this.game.state.roads[i].slot == "road_"+road){
            //console.log("exists");
            if (this.game.state.roads[i].player == this.game.player){
              //console.log("is mine");
              blocks_me = true;
            }
           break;
          }
        }
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
  
    if (blocks_me){
      console.log("undo ghost roads");
      this.displayBoard();
    }

  }

  /*
  Update internal game logic to mark road as built and change class in DOM for display
  */
  buildRoad(player, slot) {
    let divname = "#" + slot;
    let owner = "p" + this.game.colors[player-1];

    //Check if road exists in DOM and update status
    if (!document.querySelector(divname)) {
      let roadInfo = slot.split("_");
      this.addRoadToGameboard(roadInfo[2] + "_" + roadInfo[3], roadInfo[1]);
    }
    $(divname).addClass(owner);
    $(divname).removeClass("empty");
    //console.log(`Build road at ${slot} for Player ${player}`);
    //Add adjacent road slots
    if (this.game.player == player) {
      let v1 = this.hexgrid.verticesFromEdge(slot.replace("road_", ""));
      for (let road of this.hexgrid.adjacentEdges(slot.replace("road_", ""))) {
        //console.log("road: ",road);
        let v2 = this.hexgrid.verticesFromEdge(road);
        let intersection = v2.filter(function(n){return v1.indexOf(n) !== -1;});
        //console.log(v1, v2, intersection);
        let block_me = false;
        for (let i = 0; i < this.game.state.cities.length; i++) {
          if (this.game.state.cities[i].slot == "city_"+intersection[0]) {
            if(this.game.state.cities[i].player !== this.game.player){
              block_me = true;
            }
            break;
          }
        }
        if (!block_me){
          //console.log("city_"+intersection[0]+" clear, Add ghost road from road");
          this.addRoadToGameboard(road.substring(2), road[0]);  
        }
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


  returnResourceHTML(resource){
    return `<div class="tip">
            <img class="icon" src="${this.skin.resourceCard(resource)}">
            </div>`;
  }

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
      let html = `<div class="construction-costs saitoa">
              <div class="h2">Building Costs</div>
              <div class="table">
              <div class="tip token p${this.game.colors[this.game.player-1]}"><svg viewbox="0 0 200 200"><polygon points="0,175 175,0, 200,25 25,200"/></svg>
                <div class="tiptext">${this.skin.r.name}: Longest road worth 2 VP</div></div>
                  <div class="cost">${this.visualizeCost(0)}</div>
                <div class="tip token p${this.game.colors[this.game.player-1]}">${this.skin.c1.svg}<div class="tiptext">${this.skin.c1.name}: 1 VP</div></div>
                    <div class="cost">${this.visualizeCost(1)}</div>
                    <div class="tip token p${this.game.colors[this.game.player-1]}">${this.skin.c2.svg}<div class="tiptext">${this.skin.c2.name}: 2 VP</div></div>
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

  hasVPCards() {
    for (let i = 0; i < this.game.deck[0].hand.length; i++) {
      let cardname = this.game.deck[0].cards[this.game.deck[0].hand[i]].card;
      if (!this.skin.isActionCard(cardname)) return true;
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
              `claimed the ${this.skin.longest.name} from ${this.game.playerNames[this.game.state.longestRoad.player-1]} with ${longest.length} segments!`
            );
            this.game.state.longestRoad.player = player;
            this.game.state.longestRoad.size = longest.length;
            this.game.state.longestRoad.path = longest;
          } else {
            //Increase size
            this.game.state.longestRoad.size = longest.length;
            this.game.state.longestRoad.path = longest;
            this.updateLog(
              `${this.game.playerNames[player-1]} extended the ${this.skin.longest.name} to ${longest.length} segments.`
            );
          }
          return 1;
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
        this.game.state.longestRoad.path = longest;
        return 1;
      }
    }
    return 0;
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
  showTradeOverlay(tradeType = -1, i_should_give, i_should_accept) {
    let settlers_self = this;

    let my_resources = {};
    let resources = settlers_self.skin.resourceArray();
    let offer_resources = settlers_self.skin.resourceObject();
    let receive_resources = settlers_self.skin.resourceObject();

    offer_resources = Object.assign(offer_resources, i_should_give);
    receive_resources = Object.assign(receive_resources, i_should_accept);

    //Convert the players array of resources into a compact object {wheat:1, wood:2,...}
    for (let resource of resources) {
      let temp = settlers_self.countResource(
        settlers_self.game.player,
        resource
      );
      if (temp > 0) my_resources[resource] = temp;
    }

    let updateOverlay = function (settlers_self, resList, myRes, offering, receiving) {
      let resource_cnt = 0;
      let can_afford = true;

      let html = `
          <div class="trade_overlay saitoa" id="trade_overlay">
            <div class="h1 trade_overlay_title">Trade with ${settlers_self.game.playerNames[tradeType-1]}</div>
            <div class="h2">You will accept</div>
            <div class="trade_overlay_offers">`;
      for (let i = 0; i < resList.length; i++){
        resource_cnt += receiving[resList[i]];
        html += `<div id="want_${i}" class="trade_area select">
                  <div>${resList[i]}</div>
                  <div class="offer_icons" id="want_${resList[i]}">`;
        if (receiving[resList[i]]>0){
          html += `<img id="${resList[i]}" class="icon receive" src="${settlers_self.skin.resourceIcon(resList[i])}"/>`;
        }
        if (receiving[resList[i]]>1){
          html += `<div class="icon_multiplier">x${receiving[resList[i]]}</div>`;
        }
         html +=  `</div></div>`;
      }

      html += `</div>
            <div class="h2">You will give</div>
            <div class="trade_overlay_offers">`;

      for (let i = 0; i < resList.length; i++) {
        resource_cnt += offering[resList[i]];
        console.log(resList[i], offering[resList[i]], myRes[resList[i]]);
        if (offering[resList[i]] > (myRes[resList[i]] || 0)){
          can_afford = false;
        }
        html += `<div id="offer_${i}" class="trade_area ${(myRes[resList[i]])?"select":"noselect"}">
                 <div class="tip"><span>${resList[i]}</span>
                 <div class="tiptext">${(myRes[resList[i]])?myRes[resList[i]]:0} total</div></div>
                 <div class="offer_icons" id="offer_${resList[i]}">`;
          if (offering[resList[i]]>0){
            html += `<img id="${resList[i]}" class="icon offer" src="${settlers_self.skin.resourceIcon(resList[i])}"/>`;
          }
          if (offering[resList[i]]>1){
            html += `<div class="icon_multiplier">x${offering[resList[i]]}</div>`;
          }
          html += `</div></div>`;
      }

      html += `</div><div class="trade_overlay_buttons">
            <div class="trade_overlay_button saito-button-primary trade_overlay_reset_button">Reset</div>
            <div class="trade_overlay_button saito-button-primary trade_overlay_broadcast_button${(can_afford && resource_cnt>0)?"":" noselect"}">Submit Offer</div>
          </div></div>`;

      settlers_self.overlay.closebox = true;
      settlers_self.overlay.show(html);
      $(".trade_area.select > div:first-child").off();
      $(".trade_area.select > div:first-child").on("click", function () {
        //Update Offer
        let item = $(this).parent().attr("id");
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
      $(".icon").off();
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
      $(".trade_overlay_reset_button").off();
      $(".trade_overlay_reset_button").on("click", function () {
        updateOverlay(
          settlers_self,
          resList,
          myRes,
          settlers_self.skin.resourceObject(),
          settlers_self.skin.resourceObject()
        );
      });
      $(".trade_overlay_broadcast_button").off();
      $(".trade_overlay_broadcast_button").on("click", function () {
        if ($(this).hasClass("noselect")) { return; }
        settlers_self.addMove(`clear_advert\t${settlers_self.game.player}`);
        settlers_self.addMove(
            `offer\t${settlers_self.game.player}\t
            ${tradeType}\t${JSON.stringify(offering)}\t
            ${JSON.stringify(receiving)}`);
        settlers_self.overlay.hide();
        settlers_self.overlay.closebox = false;
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

    let html = `<div class="trade_overlay saitoa" id="trade_overlay">
            <div>
              <div class="h1 trade_overlay_title">Advertise Trade</div>
              <p>You may share information about your resources with the other players, telling them which resources you may be interested in trading. It will be up to them to initiate a trade offer on their. This should facilitate trading without interrupting game play.</p>
            </div>
            <div class="h2">You Want:</div>
            <div class="trade_overlay_offers">`;
    for (let i = 0; i < resources.length; i++)
      html += `<div id="want_${i}" class="trade_area select tip"><img class="icon" src="${this.skin.resourceIcon(
        resources[i]
      )}"/><div class="tiptext">${resources[i]}</div></div>`;

    html += `</div><div class="h2">You Offer:</div><div class="trade_overlay_offers">`;

    for (let i = 0; i < resources.length; i++) {
      if (myRes[resources[i]])
        html += `<div id="offer_${i}" class="trade_area select tip"><img class="icon" src="${this.skin.resourceIcon(
          resources[i]
        )}"/><div class="tiptext">You have ${myRes[resources[i]]} ${resources[i]} available</div></div>`;
      else
        html += `<div id="offer_${i}" class="trade_area noselect tip"><img class="icon" src="${this.skin.resourceIcon(
          resources[i]
        )}"/><div class="tiptext">You have no ${resources[i]} to offer</div></div>`;
    }

    html += `</div><div class="trade_overlay_buttons">
            <div class="trade_overlay_button saito-button-primary trade_overlay_reset_button">Reset</div>
            <div class="trade_overlay_button saito-button-primary trade_overlay_broadcast_button noselect">Broadcast Offer</div>
          </div></div>`;

    this.overlay.closebox = true;
    this.overlay.show(html);

    $(".trade_area.select").on("click", function () {
      $(this).toggleClass("selected");
      if (document.querySelector(".trade_area.selected")){
        $(".trade_overlay_broadcast_button").removeClass("noselect");
      }else{
        $(".trade_overlay_broadcast_button").addClass("noselect");
      }
    });

    $(".trade_overlay_reset_button").on("click", function () {
      $(".trade_area.select").removeClass("selected");
    });

    $(".trade_overlay_broadcast_button").on("click", function () {
      if ($(this).hasClass("noselect")){
        return;
      }
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
      settlers_self.overlay.closebox = false;

    });
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


  /***********
   *
   * Game animations
   *
   ***********/
  /*
  Briefly animate the longest road and update log if there is a change in ownership
  */
  highlightRoad(player, road, msg) {
    this.updateLog(`${this.game.playerNames[player-1]} ${msg}`);
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

  /*
  Flashes tiles activated by dice roll
  */
  animateDiceRoll(roll) {
    //console.log("Dice Animated: " + roll);
    $(".rolled").removeClass("rolled");
    $(".sector_value:not(.bandit)").attr("style","");
    let divname = ".sv" + roll + ":not(.bandit)";
    $(divname).addClass("rolled")
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


  updatePlayerBox(str, hide_info = 0) {
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
        let status_obj = document.querySelector(".player-box.me .status");
        if (this.game.players.includes(this.app.wallet.returnPublicKey())) {
          status_obj.innerHTML = str;
          $(".player-box.me .status").disableSelection();
        }
      }
    } catch (err) {
      //console.log("ERR: " + err);
    }
  }

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
        let status_obj = document.querySelector(".hud-body .status");
        if (this.game.players.includes(this.app.wallet.returnPublicKey())) {
          status_obj.innerHTML = str;
          $(".status").disableSelection();
        }
      }
    } catch (err) {
      //console.log("ERR: " + err);
    }

    //
    //
    //
    if (this.hud.user_dragged == 0) {
      let obj = document.querySelector(".hud");
      if (hud) {
        hud.style.bottom = 0;
        hud.style.height = "auto";
        hud.style.top = "unset";
      }
    }

  }


  confirmPlacement(slot, piece, callback){
    if (this.confirm_moves == 0){
      callback();
      return;
    }

    $(`#${slot}`).css("background-color", "yellow");
    let settlers_self = this;
    let html = `
          <div class="popup-confirm-menu">
            <div class="popup-prompt">Place ${piece} here?</div>
            <div class="action" id="confirm">yes</div>
            <div class="action" id="cancel">cancel</div>
            <div class="confirm_check"><input type="checkbox" name="dontshowme" value="true"/> don't ask again </div>
          </div>`;

    let left = $(`#${slot}`).offset().left + 50;
    let top = $(`#${slot}`).offset().top + 20;
          
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
      if (confirmation == "confirm"){
        callback();
      }
    });

    $('input:checkbox').change(function() {
      if ($(this).is(':checked')) {
        settlers_self.confirm_moves = 0;
      }else{
        settlers_self.confirm_moves = 1;
      }
    });
  }

  returnGameOptionsHTML() {
    return SettlersGameOptionsTemplate(this.app, this);
  }

  returnTradeHelpOverlay(){
    return SettlersTradeHelpOverlayTemplate(this.app, this);
  }


