const GameHud = require("../../lib/saito/ui/game-hud/game-hud");
const GameTemplate = require("../../lib/templates/gametemplate");


    const endHover = function(){
      const lookingGlass = $(".zoom-container img");
      const glassFrame = lookingGlass.parent();
      glassFrame.addClass('hidden');
    }    

    const zoomHover = function(e) {
      let gbheight = Math.round(document.getElementById("gameboard").getBoundingClientRect().height);
      let gbwidth = Math.round(document.getElementById("gameboard").getBoundingClientRect().width);
      let gbtop = Math.round(document.getElementById("gameboard").getBoundingClientRect().top);
      let gbleft = Math.round(document.getElementById("gameboard").getBoundingClientRect().left);
      // Show original picture          
      const glassFrame = $(".zoom-container");
      const lookingGlass = glassFrame.children(":first");
      glassFrame.removeClass('hidden');
      // Ratios
      var ratioX = lookingGlass.width() / gbwidth ;
      var ratioY = lookingGlass.height() / gbheight;
      
      let zoom_area = 400 / ratioX;
      let zoom_radius = zoom_area/2;
      
      var offset = $(".gameboard").offset();
      var tX = e.clientX - offset.left;
      var tY = e.clientY - offset.top;
     
      // We stay inside the limits of the zoomable area
      tX = Math.max( zoom_radius, Math.min( gbwidth - zoom_radius, tX ) );
      tY = Math.max( zoom_radius, Math.min( gbheight - zoom_radius, tY ) );
      // Margin to be set in the original    
      var moX = -Math.floor( ( tX  - zoom_radius ) * ratioX ) ;
      var moY = -Math.floor( ( tY  - zoom_radius ) * ratioY ) ;
      // Apply zoom efect
      lookingGlass.css( 'marginLeft', moX );
      lookingGlass.css( 'marginTop', moY );

    //Center magnifying glass
    glassFrame.css({
              top: e.clientY - zoom_radius*ratioY,
              left: e.clientX - zoom_radius*ratioX,
              bottom: "unset",
              right: "unset",
            });
  }



//////////////////
// constructor  //
//////////////////
class Scotland extends GameTemplate {
  constructor(app) {
    super(app);

    this.app = app;

    this.name = "Scotland";
    this.slug = "scotland";
    this.description = `Scotland Yard is a cat-and-mouse detective game set in London, England. Criminal mastermind Mister X must wind his way through the city while hiding from Scotland Yard.<p></p>The Saito edition of Scotland Yard is modified slightly to improve the balance of gameplay over the traditional version. If played with less than six players, the players controlling the detectives will control multiple detectives to increase the effectiveness of surround-and-capture strategies.`;
    this.type = "Strategy Boardgame";
    this.categories = "Games Arcade Entertainment";
    //
    // this sets the ratio used for determining
    // the size of the original pieces
    //
    this.boardWidth = 5135; //by 3829
    this.card_height_ratio = 1.2;
    
    this.minPlayers = 2;
    this.maxPlayers = 6; 

    this.hud.mode = 0;
    this.sizer.maxZoom = 100;
  }


  returnGameRulesHTML(){
    let html = `<div class="rules-overlay">
                <h1>Scotland Yard</h1>
                <p>A team of detectives is on the hunt for international terrorist Mr. X. Can London's finest trap him before their Oyster cards run out of credit?</p>     
               </div>`;
    return html;
  }

  handleCluesMenuItem() {
    let html = `<div id="game-clues" class="rules-overlay">`;
    for (let i = 0; i < this.game.state.clues.length; i++) {
      html += '<div class="game-clues-row">' + this.game.state.clues[i] + "</div>";
    }
    html += `</div>`;
    this.overlay.show(this.app, this, html);
  }

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
    if (type == "arcade-create-game") {
      return {
        slug: this.slug,
        title: this.name,
        description: this.description,
        publisher_message: this.publisher_message,
        returnGameOptionsHTML: this.returnGameOptionsHTML.bind(this),
        minPlayers: this.minPlayers,
        maxPlayers: this.maxPlayers,
      };
    }
    if (super.respondTo(type) != null) {
      return super.respondTo(type);
    }

    if (type == "arcade-carousel") {
      let obj = {};
      obj.background = "/scotland/img/arcade/arcade-banner-background.png";
      obj.title = "Scotland Yard";
      return obj;
    }

    return null;
  }

  initializeHTML(app) {
    if (!this.browser_active) {
      return;
    }

    super.initializeHTML(app);
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
    this.menu.addSubMenuOption("game-game",{
      text: "Clues",
      id: "game-clue",
      class: "game-clue",
      callback: function (app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.handleCluesMenuItem();
      },
    });
    this.menu.addSubMenuOption("game-game",{
      text: "Underground Map",
      id: "game-underground",
      class: "game-underground",
      callback: function (app, game_mod) {
        game_mod.menu.hideSubMenus();
        
      },
    });
    this.menu.addSubMenuOption("game-game",{
      text: "Bus Routes",
      id: "game-bus",
      class: "game-bus",
      callback: function (app, game_mod) {
        game_mod.menu.hideSubMenus();
      },
    });
    this.menu.addSubMenuOption("game-game",{
      text: "Inspect Map",
      id: "game-map",
      class: "game-map",
      callback: function (app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.magnifyingGlass();
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
 
    this.menu.addMenuIcon({
      text: '<i class="fa fa-window-maximize" aria-hidden="true"></i>',
      id: "game-menu-fullscreen",
      callback: function (app, game_mod) {
        game_mod.menu.hideSubMenus();
        app.browser.requestFullscreen();
      },
    });

    this.menu.addChatMenu(app, this);
    
    this.menu.render(app, this);
    this.menu.attachEvents(app, this);

    this.log.render(app, this);
    this.log.attachEvents(app, this);

    this.hud.render(app, this);
    this.hud.attachEvents(app, this);

    try {
      if (app.browser.isMobileBrowser(navigator.userAgent)) {
        this.hammer.render(this.app, this);
        this.hammer.attachEvents(this.app, this, ".gameboard");
      } else {
        this.sizer.render(this.app, this);
        this.sizer.attachEvents(this.app, this, ".gameboard");
      }
    } catch (err) {}
  }

  ////////////////
  // initialize //
  ////////////////
  initializeGame(game_id) {
    if (this.game.status != "") {
      this.updateStatus(this.game.status);
    }

    //
    // initialize
    //
    if (this.game.state == undefined) {
      this.game.state = this.returnState();

      this.initializeDice();

      console.log("\n\n\n\n");
      console.log("-------------------------");
      console.log("-------------------------");
      console.log("---- initialize game ----");
      console.log("-------------------------");
      console.log("-------------------------");
      console.log("\n\n\n\n");

      this.updateStatus("generating the game");

      //
      // keys are not backed-up when saved, so "deck"
      // is re-used here to provide a way for MisterX
      // to publish location info, while keeping keys
      // secret when making moves.
      //
      this.addDeck(0);

      this.game.queue.push("round");
      this.game.queue.push("init");
      this.game.queue.push("READY");
    }

    this.restoreLog();

    if (!this.browser_active) {
      return;
    }

    //
    // locations
    //
    for (var i in this.game.state.locations) {
      let divname = "#" + i;
      $(divname).css("top", this.scale(this.game.state.locations[i].top+40) + "px");
      $(divname).css("left", this.scale(this.game.state.locations[i].left+37) + "px");
    }
  }

  //
  // core game logic
  //
  handleGameLoop(msg = null) {
    let scotland_self = this;

    //
    // report winner
    // -- need a new default for team victories
    if (this.game.over == 1) {
      if (this.game.winner == this.game.state.x){
       this.updateStatus("Mr X wins"); 
      }else{
       this.updateStatus("Scotland Yard wins"); 
      }
      return 0;
    }

    console.log(JSON.parse(JSON.stringify(this.game.state)));
    ///////////
    // queue //
    ///////////
    if (this.game.queue.length > 0) {
      console.log("queue: " + JSON.stringify(this.game.queue));

      let qe = this.game.queue.length - 1;
      let mv = this.game.queue[qe].split("\t");
      let shd_continue = 1;

      /*
      Game Initialization
      */
      if (mv[0] == "init") {
        this.game.state.x = this.rollDice(this.game.players.length);

        //Assign Detective Pawns to all players
        let j = 0;
        while (j < this.game.state.numDetectives){
          for (let i = 1; i <= this.game.players.length; i++){
            if (i != this.game.state.x){
              this.game.state.detectives[j] = i;
              j++;
            }
          }
        }
        console.log("***" + JSON.stringify(this.game.state.detectives));

        for (let i = 0; i < this.game.state.numDetectives; i++) {
          this.game.state.tickets[i] = {};
          this.game.state.tickets[i]["taxi"] = 10;
          this.game.state.tickets[i]["bus"]=8;
          this.game.state.tickets[i]["underground"] = 4;            

          let start_pos = this.rollDice(this.game.state.starting_positions.length) - 1;
          this.game.state.player_location[i] = this.game.state.starting_positions[start_pos];
          this.game.state.starting_positions.splice(start_pos, 1);
        }

        //Add Mr. X
        let x = this.game.state.numDetectives;
        this.game.state.tickets[x] = {};
        this.game.state.tickets[x]["taxi"] = 4;
        this.game.state.tickets[x]["bus"] = 3;
        this.game.state.tickets[x]["underground"] = 3;
        this.game.state.tickets[x]["double"] = 2;
        this.game.state.tickets[x]["x"] = 5;

        this.game.state.player_location[x] = -1;
          
        //
        // Mister X now picks his location (secretly)
        //
        // TODO hide Mister X plaement cryptographically
        //
        if (this.game.player == this.game.state.x) {
          let start_pos = this.rollDice(this.game.state.starting_positions.length) - 1;
          this.game.state.player_location[x] = this.game.state.starting_positions[start_pos];
          if (document.getElementById("hud")){
            document.getElementById("hud").classList.add("misterx");
          }
        } else {
          this.rollDice(6);
        }

        this.game.queue.splice(qe, 1);
      }


      /*
      Special Move
      */
      if (mv[0] === "double") {
        this.game.state.tickets[this.game.state.numDetectives]["double"]--;
        this.game.queue.push("play\t" + this.game.state.x + "\t" + this.game.state.numDetectives);
        this.game.queue.push("play\t" + this.game.state.x + "\t" + this.game.state.numDetectives);
        this.game.state.double_in_action = 1;
        this.game.queue.splice(qe, 1);
        return 1;
      }

      if (mv[0] === "win"){
        let method = mv[1];
        let winner = parseInt(mv[2]);
        let location = mv[3];

        this.game.queue = [];
        if (method == "escape"){
          this.updateLog("Detectives are out of moves! Mister X escapes");
          this.game.winner = winner;
        }
        if (method == "caught"){
          this.updateLog(`Detective ${winner+1} landed on Mister X and arrested him`);
          this.game.winner = this.game.state.detectives[pawn];
        }
        if (method == "trapped"){
          this.updateLog(`The detectives encircled Mister X forcing him to surrender`);
          this.game.winner = -1;
        }
        return 0;
      }

      /*
      Standard Move
      */
      if (mv[0] === "move") {
        let player = parseInt(mv[1]);
        let pawn = mv[2];
        let target_id = mv[3];
        let ticket = mv[4];
        
        this.game.state.tickets[pawn][ticket]--;

        //Mr X is moving
        if (pawn == this.game.state.numDetectives) {
          this.game.state.xmoves ++;
          console.log("Mr X location -- "+ target_id);
          let hint = "";
          switch(ticket){
            case "taxi": hint = "Mr. X was spotted in a taxi..."; break;
            case "bus": hint = "Mr. X was spotted in a bus..."; break;
            case "underground": hint = "Mr. X was spotted on the underground..."; break;
            default: hint = "Mr. X evaded detection this turn...";
          }
          
          if (this.game.state.xmoves == 3 || this.game.state.xmoves == 8 || this.game.state.xmoves == 13 || this.game.state.xmoves == 18 || this.game.state.xmoves == 24 ) {
            this.game.state.player_location[pawn] = target_id;
            hint+= `... at ${target_id}`;
          } else {
            this.game.state.player_location[pawn] = -1;
          }

          this.updateLog(hint);
          this.game.state.clues.push(this.game.state.xmoves + " - " + hint);
          
          //
          // Mister X needs to get his decrypted move
          //
          if (this.game.player == this.game.state.x) {
            this.game.state.player_location[pawn] = this.game.deck[0].keys[this.game.deck[0].keys.length - 1].location;
          }

        }else{
          this.game.state.player_location[pawn] = target_id;
          this.updateLog(`Detective ${pawn+1} takes the ${ticket} to ${target_id}`);
          //Mr. X gets discards....
          this.game.state.tickets[this.game.state.numDetectives][ticket]++;
  
          //If I am Mr X and someone else moved, I have to check if they moved on top of me and announce the end of the game
          if (this.game.player == this.game.state.x){
            if (target_id === this.game.state.player_location[this.game.state.numDetectives]){
              this.addMove(`win\tcaught\t${pawn}\t${target_id}`);
              //this.addMove("NOTIFY\tMister X has been caught at " + target_id);
              this.endTurn();
              //this.resignGame();
            }
          }

        }
        console.log(`Player ${player} moves to ${this.game.state.player_location[pawn]}`);

        this.game.state.rounds[this.game.state.round].tickets[pawn] = ticket;
        this.game.state.rounds[this.game.state.round].location[pawn] = target_id;

        this.showBoard();

        this.game.queue.splice(qe, 1);
        return 1;
      }

      if (mv[0] == "round") {
        //
        // update the round, and create a place to store locations
        //
        this.game.state.round++;
        this.game.state.rounds[this.game.state.round] = {};
        this.game.state.rounds[this.game.state.round].location = [];
        this.game.state.rounds[this.game.state.round].tickets = [];
        this.game.state.double_in_action = 0; // reset ability to play double

        //
        // check game is ongoing
        //
        let turns_remaining = 23 - this.game.state.round;
        this.updateLog(turns_remaining + " moves remaining to catch Mister X!");

        //
        // show the board
        //
        this.showBoard();

        
        let detectivesCanMove = false;
        for (let j = this.game.state.numDetectives-1; j >= 0 ; j--){
          if (this.canBobbyMove(j)){
            this.game.queue.push(`play\t${this.game.state.detectives[j]}\t${j}`);  
            detectivesCanMove = true;
          }
        }

        if (!detectivesCanMove){
          this.game.queue.push(`win\tescape\t${this.game.state.x}\t-1`);
          return 1;
        }
        
        // Mister X goes first...
        this.game.queue.push(`play\t${this.game.state.x}\t${this.game.state.numDetectives}`);
        
        //
        // move into first turn
        //
        return 1;
      }

      if (mv[0] == "play") {
        let player = parseInt(mv[1]);
        let pawn = parseInt(mv[2]);

        if (!this.browser_active) return;
        this.game.queue.splice(qe, 1);
        
        if (this.game.player == player){
          this.playerTurn(player, pawn); // player is the human, pawn is the token  
        }else{
          if (pawn == this.game.state.numDetectives){
            this.updateStatus(`Waiting for Mr X to move (Player ${player})`);
          }else{
            this.updateStatus(`Waiting for Detective ${pawn+1} to move (Player ${player})`);
          }
        }  
        return 0;
      }
    }

    return 1;
  }

 
  removeEventsFromBoard() {
    //
    // remove active events
    //
    $(".location").off();
    $(".location").css("border-color", "transparent");

    this.showBoard();
  }

  canBobbyMove(cop){
    let source_id = this.game.state.player_location[cop];
    let mylocation = this.game.state.locations[source_id]; //Obj

    if (this.game.state.tickets[cop]["taxi"] > 0 && mylocation.taxi.length > 0){
      return true;
    }
    if (this.game.state.tickets[cop]["bus"] > 0 && mylocation.bus.length > 0){
      return true;
    }
    if (this.game.state.tickets[cop]["underground"] > 0 && mylocation.underground.length > 0){
      return true;
    }
    return false;
  }

  //
  // player is the human this.game.player
  // gamer is the player (may only be 2)
  //
  playerTurn(player, pawn) {
    if (!this.browser_active) return;

    let scotland_self = this;
    let can_player_move = 0;

    this.menu_backup_callback = function(){scotland_self.playerTurn(player, pawn);};    

    //
    // refresh board
    //
    this.removeEventsFromBoard();
    let useMysteryTicket = false;

    //
    // generate instructions and print to HUD
    //
    let sHeader = (player == this.game.state.x)? 'You are Mister X!' : `You are Detective ${pawn + 1}!`;

    let source_id = this.game.state.player_location[pawn];
    
    let mylocation = this.game.state.locations[source_id]; //Obj

    sHeader += ` (At ${source_id})`;
    if (this.game.state.xmoves == 2 || this.game.state.xmoves == 7 || this.game.state.xmoves == 12 || this.game.state.xmoves == 17 || this.game.state.xmoves == 23) {
      if (player === this.game.state.x){
        sHeader+= " You will be visible to the detectives after you move!";
      }
    }

    let html = "";
    html = `<div class="status-message">${sHeader}</div>
          <div class='status-icon-menu'>

            <div class="menu_icon" id="taxi">
              <i class="menu_icon_icon fas fa-taxi fa-border"></i>
              <div class="menu-text">
               Taxi: ${this.game.state.tickets[pawn]["taxi"]}
              </div>
            </div>

            <div class="menu_icon" id="bus">
              <i class="menu_icon_icon fas fa-bus fa-border"  style="background-color: #4382b5;"></i>
              <div class="menu-text">Bus: ${this.game.state.tickets[pawn]["bus"]}</div>
            </div>

            <div class="menu_icon" id="underground">
               <i class="menu_icon_icon fas fa-subway fa-border"  style="background-color: #be5e2f;"></i>
               <div class="menu-text">U.: ${this.game.state.tickets[pawn]["underground"]}</div>
            </div>

         </div>`;


/*    if (player === this.game.state.x){
      html += `<li class="menu_option" id="taxi">taxi</li>`;
      html += `<li class="menu_option" id="bus">bus</li>`;
      html += `<li class="menu_option" id="underground">underground</li>`;
      
      //TODO: Need to select mystery move and have it be doubled if necessary
      if (this.game.state.tickets[pawn]["x"] > 0) {
        html += `<li class="menu_option" id="mystery">mystery (${this.game.state.tickets[pawn]["x"]} tickets)</li>`;
      }
      if (this.game.state.tickets[pawn]["double"] > 0 && this.game.state.double_in_action == 0) {
        html += `<li class="menu_option" id="double">double move (${this.game.state.tickets[pawn]["double"]})</li>`;
      }
    
    }else{ //Detectives
      if (this.game.state.tickets[pawn]["taxi"] > 0) {
        html += `<li class="menu_option" id="taxi">taxi (${this.game.state.tickets[pawn]["taxi"]} tickets)</li>`;
      }
      if (this.game.state.tickets[pawn]["bus"] > 0) {
        html += `<li class="menu_option" id="bus">bus (${this.game.state.tickets[pawn]["bus"]} tickets)</li>`;
      }
      if (this.game.state.tickets[pawn]["underground"] > 0) {
        html += `<li class="menu_option" id="underground">underground (${this.game.state.tickets[pawn]["underground"]} tickets)</li>`;
      }
     }

    this.updateStatusWithOptions(sHeader, `<ul>${html}</ul>`, true);
  */
    this.updateStatus(html);
    if (player !== this.game.state.x) {this.setHudClass(pawn);}

    //
    // attach events
    //

    $(".menu_option").off();
    $(".menu_option").on("click", function(){
      $(".highlight-available-move").css("border-color", "transparent");
      let action = $(this).attr("id");
      if (action == "double"){
        scotland_self.addMove("double");
        scotland_self.endTurn();
        return;
      }
      if (action == "taxi"){
        enableTaxi();
      }
      if (action == "bus"){
        enableBus();
      }
      if (action == "underground"){
        enableUnderground();
      }
      if (action == "mystery"){
        $(".highlight-available-move").css("border-color", "black");
        useMysteryTicket = true;
      }
    });
    

    $(".location").off();
    let detectives = this.game.state.player_location.slice(0,this.game.state.numDetectives);

    const enableTaxi = function(){ 
      if (scotland_self.game.state.tickets[pawn]["taxi"] > 0) {
        for (let z of mylocation.taxi) {
          if (!detectives.includes(parseInt(z))){
            can_player_move = 1;
            $(`#${z}`).on("click", function () {
              let target_id = $(this).attr("id");
              console.log("success...");
              let ticket = (useMysteryTicket)? "x": "taxi";
              scotland_self.movePlayer(player, pawn, target_id, ticket);
            });
            $(`#${z}`).css("border-color","yellow");
            $(`#${z}`).addClass("highlight-available-move");
          }
        }
      }
    }
      
    const enableBus = function(){
      if (scotland_self.game.state.tickets[pawn]["bus"] > 0) {
      for (let z of mylocation.bus) {
        if (!detectives.includes(parseInt(z))){
          can_player_move = 1;
          $(`#${z}`).on("click", function () {
            let target_id = $(this).attr("id");
            console.log("success...");
            let ticket = (useMysteryTicket)? "x": "bus";
            scotland_self.movePlayer(player, pawn, target_id, ticket);
          });
        }
        $(`#${z}`).css("border-color","cyan");
        $(`#${z}`).addClass("highlight-available-move");
      }
      }
    }
    
    const enableUnderground = function(){
      if (scotland_self.game.state.tickets[pawn]["underground"] > 0) {
      for (let z of mylocation.underground) {
        if (!detectives.includes(parseInt(z))){
          can_player_move = 1;
          $(`#${z}`).on("click", function () {
            let target_id = $(this).attr("id");
            let ticket = (useMysteryTicket)? "x": "underground";
            scotland_self.movePlayer(player, pawn, target_id, ticket);
          });
        }
        $(`#${z}`).css("border-color","red");
        $(`#${z}`).addClass("highlight-available-move");
      }
    }

    }

    const enableFerry = function(){
       if (scotland_self.game.state.tickets[pawn]["x"] > 0) {
        for (let z of mylocation.ferry) {
          if (!detectives.includes(parseInt(z))){
            can_player_move = 1;
            $(`#${z}`).on("click", function () {
              let target_id = $(this).attr("id");
              scotland_self.movePlayer(player, pawn, target_id, "x");
            });
          }
          $(`#${z}`).css("border-color","black");
          $(`#${z}`).addClass("highlight-available-move");
        }
      }
    }    
   
    enableTaxi();
    enableBus();
    enableUnderground();
    enableFerry();

    if (can_player_move == 0) {
      //Mr. X is boxed in and cannot move --> game over
      if (player === this.game.state.x){
        this.addMove(`win\ttrapped\t-1\t${source_id}`);
        this.endTurn();
      }else{
        this.addMove(`ACKNOWLEDGE\tDetective ${pawn+1} cannot move... skipping turn`);
        this.endTurn();  
      }
      $(".location").off();
      return 0;
    }
  }

  movePlayer(player, pawn, target_id, ticket) {

    this.removeEventsFromBoard();
    // Mister X disguises his moves
    if (this.game.player == this.game.state.x) {
      if (this.game.state.xmoves == 2 || this.game.state.xmoves == 7 || this.game.state.xmoves == 12 || this.game.state.xmoves == 17 || this.game.state.xmoves == 23) {
        let secret_decrypt = this.app.crypto.hash(Math.random() + "MISTERXSECRETHASH");
        this.game.deck[0].keys.push({ location: target_id, hash: secret_decrypt });
      } else {
        let secret_decrypt = this.app.crypto.hash(Math.random() + "MISTERXSECRETHASH");
        this.game.deck[0].keys.push({ location: target_id, hash: secret_decrypt });
        target_id = this.app.crypto.hash(secret_decrypt + target_id);
      }
    }
    this.updateStatus("Sending your move...");
    this.addMove("move\t" + player + "\t" + pawn + "\t" + target_id + "\t" + ticket);
    this.endTurn();
  }

  showBoard() {
    $(".highlightpawn").removeClass("highlightpawn");
    $(".highlight-available-move").removeClass("highlight-available-move");

    this.showPlayers();

    if (this.game.player != this.game.state.x) {
      console.log("Initial Hints for Detectives");
      console.log(JSON.parse(JSON.stringify(this.game.state)));
      if (this.game.state.xmoves < 3) {
        for (let i = 0; i < this.game.state.starting_positions.length; i++) {
          let divname = "#" + this.game.state.starting_positions[i];
          console.log(divname);
          $(divname).css("border-color", "white");
        }
      }
    }
  }

  showPlayers() {
    $(".location").html("");

    for (let i = 0; i <= this.game.state.numDetectives; i++) {
      if (this.game.state.player_location[i] != -1) {
        let divname = "#" + this.game.state.player_location[i];
        $(divname).html(this.returnPawn(i));
        $(divname).addClass("highlightpawn");
      }
    }

  }

  returnPawn(pawn_id) {
    if (pawn_id === this.game.state.numDetectives){
      return '<img src="/scotland/img/XPawn.png" class="pawn" />';
    }
    switch(pawn_id){
      case 0: return '<img src="/scotland/img/Red%20Pawn.png" class="pawn" />';
      break;
      case 1: return '<img src="/scotland/img/Yellow%20Pawn.png" class="pawn" />';
      break;
      case 2: return '<img src="/scotland/img/Blue%20Pawn.png" class="pawn" />';
      break;
      case 3:  return '<img src="/scotland/img/Cyan%20Pawn.png" class="pawn" />';
      break;
      case 4: return '<img src="/scotland/img/Black%20Pawn.png" class="pawn" />';
      break;
      default: console.log("undefined pawn type"); 
    }
    return "";
  }

  setHudClass(pawn_id){
    let hh = document.querySelector(".hud-header");
    if (!hh) return;

    hh.classList.remove("pawn0", "pawn1", "pawn2", "pawn3", "pawn4");
    hh.classList.add(`pawn${pawn_id}`);

  }

  magnifyingGlass(){
  let scotland_self = this;
  $('.gameboard').toggleClass("zoom-window");
  let glass = document.querySelector(".zoom-container");
  if ($('.gameboard').hasClass("zoom-window")){
    console.log("Turn on zoom");
    let board = document.querySelector(".gameboard");
    let newBoard = board.cloneNode(true);
    newBoard.style = "position:relative;";
    glass.append(newBoard);

    document.querySelector(".gameboard").addEventListener("mousemove", zoomHover);
    glass.addEventListener("mousemove", zoomHover);  
    glass.addEventListener("click",scotland_self.magnifyingGlass);
    //document.querySelector(".gameboard").addEventListener("mouseout", scotland_self.magnifyingGlass);
  }else{
    console.log("Turn off zoom");
    glass.removeChild(glass.firstChild);
    document.querySelector(".gameboard").removeEventListener("mousemove", zoomHover);
    glass.removeEventListener("mousemove", zoomHover);
    glass.classList.add("hidden");  
    $(".zoom-container").off();
    //document.querySelector(".gameboard").removeEventListener("mouseout", endHover);  
  }

   
  }

  ////////////////////
  // core game data //
  ////////////////////
  returnState() {
    var state = {};
    state.locations = this.returnLocations();
    state.starting_positions = this.returnStartingPositions(); //We store this to give detectives a clue in the first two rounds
    state.numDetectives = (this.game.players.length < 4) ? 4 : 5; 
    //organized by detective #, mr x's location/tickets @ index = numDetectives
    state.player_location = [];
    state.tickets = [];
    state.detectives = []; //Mapping from detectives to player numbers (this.game.players)
    //Organized by rounds
    state.round = 0;
    state.xmoves = 0;
    state.rounds = []; //Keeping a total log of where everyone went and how
    state.clues = [];  //Keeping track of public information about Mr X
    
    state.x = 0; // who is Mister X

    return state;
  }
  returnStartingPositions() {
    return [13, 26, 29, 34, 50, 53, 91, 94, 103, 112, 117, 132, 138, 141, 155, 174, 197, 198];
  }

  returnLocations() {
    var locations = {};

    locations["1"] = {
      top: 120,
      left: 550,
      taxi: ["8", "9"],
      underground: ["46"],
      bus: ["58", "46"],
      ferry: [],
    };
    locations["2"] = {
      top: 42,
      left: 1503,
      taxi: ["20", "10"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["3"] = {
      top: 50,
      left: 2106,
      taxi: ["11", "12", "4"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["4"] = {
      top: 25,
      left: 2473,
      taxi: ["3", "13"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["5"] = {
      top: 60,
      left: 3925,
      taxi: ["15", "16"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["6"] = {
      top: 55,
      left: 4382,
      taxi: ["29", "7"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["7"] = {
      top: 85,
      left: 4826,
      taxi: ["6", "17"],
      underground: [],
      bus: ["42"],
      ferry: [],
    };
    locations["8"] = {
      top: 338,
      left: 362,
      taxi: ["1", "18", "19"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["9"] = {
      top: 342,
      left: 741,
      taxi: ["1", "19", "20"],
      underground: [],
      bus: [],
      ferry: [],
    };

    locations["10"] = {
      top: 308,
      left: 1805,
      taxi: ["2", "21", "34", "11"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["11"] = {
      top: 355,
      left: 2085,
      taxi: ["10", "3", "22"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["12"] = {
      top: 307,
      left: 2312,
      taxi: ["3", "23"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["13"] = {
      top: 288,
      left: 2733,
      taxi: ["4", "23"],
      underground: ["46", "67", "89"],
      bus: ["23", "14", "52"],
      ferry: [],
    };
    locations["14"] = {
      top: 195,
      left: 3163,
      taxi: ["15", "25"],
      underground: [],
      bus: ["13", "15"],
      ferry: [],
    };
    locations["15"] = {
      top: 155,
      left: 3595,
      taxi: ["14", "5", "16", "28", "26"],
      underground: [],
      bus: ["14", "41"],
      ferry: [],
    };
    locations["16"] = {
      top: 308,
      left: 4015,
      taxi: ["15", "5", "28", "29"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["17"] = {
      top: 437,
      left: 4795,
      taxi: ["29", "7", "30"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["18"] = {
      top: 507,
      left: 158,
      taxi: ["43", "31", "8"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["19"] = {
      top: 542,
      left: 516,
      taxi: ["8", "9", "32"],
      underground: [],
      bus: [],
      ferry: [],
    };

    locations["20"] = {
      top: 432,
      left: 942,
      taxi: ["2", "9", "33"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["21"] = {
      top: 610,
      left: 1395,
      taxi: ["33", "10"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["22"] = {
      top: 675,
      left: 2105,
      taxi: ["34", "11", "23", "35"],
      underground: [],
      bus: ["23", "3", "34", "65"],
      ferry: [],
    };
    locations["23"] = {
      top: 493,
      left: 2445,
      taxi: ["22", "12", "13", "37"],
      underground: [],
      bus: ["3", "13", "22", "67"],
      ferry: [],
    };
    locations["24"] = {
      top: 507,
      left: 2985,
      taxi: ["13", "37", "38"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["25"] = {
      top: 565,
      left: 3215,
      taxi: ["14", "38", "39"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["26"] = {
      top: 300,
      left: 3565,
      taxi: ["15", "27", "39"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["27"] = {
      top: 507,
      left: 3625,
      taxi: ["26", "28", "40"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["28"] = {
      top: 430,
      left: 3785,
      taxi: ["15", "16", "27", "41"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["29"] = {
      top: 550,
      left: 4380,
      taxi: ["6", "16", "17", "41", "42"],
      underground: [],
      bus: ["42", "55", "41", "15"],
      ferry: [],
    };

    locations["30"] = {
      top: 517,
      left: 4951,
      taxi: ["17", "42"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["31"] = {
      top: 667,
      left: 314,
      taxi: ["18", "43", "44"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["32"] = {
      top: 783,
      left: 825,
      taxi: ["19", "33", "44", "45"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["33"] = {
      top: 715,
      left: 1200,
      taxi: ["20", "32", "46", "21"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["34"] = {
      top: 778,
      left: 1843,
      taxi: ["10", "22", "47", "48"],
      underground: [],
      bus: ["22", "63", "46"],
      ferry: [],
    };
    locations["35"] = {
      top: 867,
      left: 2215,
      taxi: ["22", "48", "36", "65"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["36"] = {
      top: 890,
      left: 2365,
      taxi: ["35", "37", "49"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["37"] = {
      top: 685,
      left: 2592,
      taxi: ["23", "24", "36", "50"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["38"] = {
      top: 700,
      left: 3095,
      taxi: ["24", "25", "50", "51"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["39"] = {
      top: 660,
      left: 3325,
      taxi: ["25", "26", "51", "52"],
      underground: [],
      bus: [],
      ferry: [],
    };

    locations["40"] = {
      top: 825,
      left: 3723,
      taxi: ["27", "41", "52", "53"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["41"] = {
      top: 750,
      left: 3895,
      taxi: ["28", "29", "40", "54"],
      underground: [],
      bus: ["15", "29", "52", "87"],
      ferry: [],
    };
    locations["42"] = {
      top: 750,
      left: 4810,
      taxi: ["29", "30", "56", "72"],
      underground: [],
      bus: ["72", "7", "29"],
      ferry: [],
    };
    locations["43"] = {
      top: 855,
      left: 75,
      taxi: ["18", "31", "57"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["44"] = {
      top: 955,
      left: 585,
      taxi: ["31", "32", "58"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["45"] = {
      top: 1012,
      left: 956,
      taxi: ["32", "46", "60", "58", "59"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["46"] = {
      top: 916,
      left: 1266,
      taxi: ["33", "47", "61", "45"],
      underground: ["1", "74", "79", "13"],
      bus: [],
      ferry: [],
    };
    locations["47"] = {
      top: 847,
      left: 1510,
      taxi: ["46", "34", "62"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["48"] = {
      top: 1027,
      left: 1910,
      taxi: ["34", "35", "63", "62"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["49"] = {
      top: 1034,
      left: 2501,
      taxi: ["36", "50", "66"],
      underground: [],
      bus: [],
      ferry: [],
    };

    locations["50"] = {
      top: 877,
      left: 2740,
      taxi: ["49", "37", "38"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["51"] = {
      top: 923,
      left: 3237,
      taxi: ["67", "38", "39", "52", "68"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["52"] = {
      top: 855,
      left: 3488,
      taxi: ["51", "39", "40", "69"],
      underground: [],
      bus: ["41", "13", "86", "67"],
      ferry: [],
    };
    locations["53"] = {
      top: 1011,
      left: 3765,
      taxi: ["69", "40", "54"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["54"] = {
      top: 948,
      left: 3958,
      taxi: ["53", "41", "55", "70"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["55"] = {
      top: 940,
      left: 4395,
      taxi: ["54", "71"],
      underground: [],
      bus: ["29", "89"],
      ferry: [],
    };
    locations["56"] = {
      top: 988,
      left: 4978,
      taxi: ["42", "91"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["57"] = {
      top: 1051,
      left: 246,
      taxi: ["43", "73", "58"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["58"] = {
      top: 1103,
      left: 737,
      taxi: ["57", "44", "45", "59"],
      underground: [],
      bus: ["1", "46", "74", "77"],
      ferry: [],
    };
    locations["59"] = {
      top: 1217,
      left: 830,
      taxi: ["75", "58", "45", "76"],
      underground: [],
      bus: [],
      ferry: [],
    };

    locations["60"] = {
      top: 1187,
      left: 1025,
      taxi: ["45", "76", "61"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["61"] = {
      top: 1235,
      left: 1360,
      taxi: ["76", "60", "78", "46", "62"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["62"] = {
      top: 1176,
      left: 1533,
      taxi: ["61", "47", "48", "79"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["63"] = {
      top: 1383,
      left: 1955,
      taxi: ["79", "80", "64", "48"],
      underground: [],
      bus: ["65", "34", "79", "100"],
      ferry: [],
    };
    locations["64"] = {
      top: 1337,
      left: 2210,
      taxi: ["63", "65", "81"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["65"] = {
      top: 1285,
      left: 2475,
      taxi: ["35", "82", "64", "66"],
      underground: [],
      bus: ["22", "67", "82", "63"],
      ferry: [],
    };
    locations["66"] = {
      top: 1245,
      left: 2633,
      taxi: ["65", "67", "49", "82"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["67"] = {
      top: 1193,
      left: 2930,
      taxi: ["66", "68", "51", "84"],
      underground: ["13", "89", "111", "79"],
      bus: ["52", "65", "82", "102"],
      ferry: [],
    };
    locations["68"] = {
      top: 1120,
      left: 3273,
      taxi: ["51", "67", "68", "85"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["69"] = {
      top: 1095,
      left: 3593,
      taxi: ["68", "53", "52", "86"],
      underground: [],
      bus: [],
      ferry: [],
    };

    locations["70"] = {
      top: 1155,
      left: 3973,
      taxi: ["54", "71", "87"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["71"] = {
      top: 1158,
      left: 4340,
      taxi: ["70", "55", "89", "72"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["72"] = {
      top: 1195,
      left: 4707,
      taxi: ["71", "42", "90", "91"],
      underground: [],
      bus: ["107", "105", "42"],
      ferry: [],
    };
    locations["73"] = {
      top: 1252,
      left: 245,
      taxi: ["57", "92", "74"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["74"] = {
      top: 1445,
      left: 415,
      taxi: ["73", "92", "58", "75"],
      underground: ["46"],
      bus: ["58", "94"],
      ferry: [],
    };
    locations["75"] = {
      top: 1375,
      left: 659,
      taxi: ["74", "58", "59", "94"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["76"] = {
      top: 1370,
      left: 968,
      taxi: ["59", "77", "60", "61"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["77"] = {
      top: 1540,
      left: 1172,
      taxi: ["95", "76", "78", "96"],
      underground: [],
      bus: ["58", "94", "78", "124"],
      ferry: [],
    };
    locations["78"] = {
      top: 1490,
      left: 1435,
      taxi: ["77", "61", "79", "97"],
      underground: [],
      bus: ["77", "46", "79"],
      ferry: [],
    };
    locations["79"] = {
      top: 1459,
      left: 1618,
      taxi: ["78", "62", "63", "98"],
      underground: ["46", "93", "67", "111"],
      bus: ["78", "63"],
      ferry: [],
    };

    locations["80"] = {
      top: 1538,
      left: 2025,
      taxi: ["63", "99", "100"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["81"] = {
      top: 1590,
      left: 2395,
      taxi: ["64", "100", "82"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["82"] = {
      top: 1505,
      left: 2537,
      taxi: ["81", "65", "66", "101"],
      underground: [],
      bus: ["65", "67", "100", "140"],
      ferry: [],
    };
    locations["83"] = {
      top: 1440,
      left: 2868,
      taxi: ["101", "102"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["84"] = {
      top: 1343,
      left: 3102,
      taxi: ["67", "85"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["85"] = {
      top: 1272,
      left: 3296,
      taxi: ["84", "68", "103"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["86"] = {
      top: 1405,
      left: 3640,
      taxi: ["69", "103", "104"],
      underground: [],
      bus: ["52", "87", "116", "102"],
      ferry: [],
    };
    locations["87"] = {
      top: 1495,
      left: 4000,
      taxi: ["70", "88"],
      underground: [],
      bus: ["105", "41", "86"],
      ferry: [],
    };
    locations["88"] = {
      top: 1525,
      left: 4175,
      taxi: ["87", "89", "117"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["89"] = {
      top: 1403,
      left: 4316,
      taxi: ["88", "71", "105"],
      underground: ["67", "140", "128", "13"],
      bus: ["55", "105"],
      ferry: [],
    };

    locations["90"] = {
      top: 1406,
      left: 4563,
      taxi: ["72", "91", "105"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["91"] = {
      top: 1417,
      left: 4926,
      taxi: ["56", "72", "90", "105", "107"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["92"] = {
      top: 1635,
      left: 117,
      taxi: ["73", "74", "93"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["93"] = {
      top: 1767,
      left: 142,
      taxi: ["92", "94"],
      underground: ["79"],
      bus: ["94"],
      ferry: [],
    };
    locations["94"] = {
      top: 1705,
      left: 450,
      taxi: ["75", "93", "95"],
      underground: [],
      bus: ["74", "93", "77"],
      ferry: [],
    };
    locations["95"] = {
      top: 1668,
      left: 608,
      taxi: ["94", "77", "122"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["96"] = {
      top: 1760,
      left: 1370,
      taxi: ["77", "97", "109"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["97"] = {
      top: 1720,
      left: 1496,
      taxi: ["78", "96", "98", "109"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["98"] = {
      top: 1642,
      left: 1712,
      taxi: ["97", "79", "99", "110"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["99"] = {
      top: 1663,
      left: 1925,
      taxi: ["80", "98", "110", "112"],
      underground: [],
      bus: [],
      ferry: [],
    };

    locations["100"] = {
      top: 1780,
      left: 2265,
      taxi: ["80", "81", "101", "112", "113"],
      underground: [],
      bus: ["111", "63", "82"],
      ferry: [],
    };
    locations["101"] = {
      top: 1650,
      left: 2612,
      taxi: ["100", "82", "83", "114"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["102"] = {
      top: 1475,
      left: 3060,
      taxi: ["83", "115", "103"],
      underground: [],
      bus: ["67", "86", "127"],
      ferry: [],
    };
    locations["103"] = {
      top: 1427,
      left: 3353,
      taxi: ["102", "85", "86"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["104"] = {
      top: 1570,
      left: 3645,
      taxi: ["86", "116"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["105"] = {
      top: 1631,
      left: 4460,
      taxi: ["89", "90", "106", "108", "91"],
      underground: [],
      bus: ["108", "107", "87", "89", "72"],
      ferry: [],
    };
    locations["106"] = {
      top: 1675,
      left: 4771,
      taxi: ["105", "107"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["107"] = {
      top: 1682,
      left: 5002,
      taxi: ["91", "106", "119"],
      underground: [],
      bus: ["105", "72", "161"],
      ferry: [],
    };
    locations["108"] = {
      top: 1985,
      left: 4380,
      taxi: ["105", "117", "119"],
      underground: [],
      bus: ["116", "135", "105"],
      ferry: ["115"],
    };
    locations["109"] = {
      top: 2035,
      left: 1580,
      taxi: ["96", "97", "110", "124"],
      underground: [],
      bus: [],
      ferry: [],
    };

    locations["110"] = {
      top: 1804,
      left: 1822,
      taxi: ["98", "99", "109", "111"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["111"] = {
      top: 1970,
      left: 1978,
      taxi: ["124", "110", "112"],
      underground: ["79", "67", "153", "163"],
      bus: ["124", "100"],
      ferry: [],
    };
    locations["112"] = {
      top: 1914,
      left: 2069,
      taxi: ["111", "99", "100", "125"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["113"] = {
      top: 1933,
      left: 2413,
      taxi: ["100", "114", "125"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["114"] = {
      top: 1840,
      left: 2654,
      taxi: ["113", "101", "115", "126", "132"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["115"] = {
      top: 1710,
      left: 3058,
      taxi: ["114", "102", "126", "127"],
      underground: [],
      bus: [],
      ferry: ["108", "157"],
    };
    locations["116"] = {
      top: 1925,
      left: 3645,
      taxi: ["104", "117", "118", "127"],
      underground: [],
      bus: ["127", "86", "142", "108"],
      ferry: [],
    };
    locations["117"] = {
      top: 2078,
      left: 4060,
      taxi: ["88", "116", "108", "129"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["118"] = {
      top: 2167,
      left: 3652,
      taxi: ["116", "134", "129", "142"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["119"] = {
      top: 2233,
      left: 4895,
      taxi: ["108", "107", "136"],
      underground: [],
      bus: [],
      ferry: [],
    };

    locations["120"] = {
      top: 2400,
      left: 115,
      taxi: ["121", "144"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["121"] = {
      top: 2405,
      left: 290,
      taxi: ["120", "122", "145"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["122"] = {
      top: 2395,
      left: 542,
      taxi: ["95", "121", "123", "146"],
      underground: [],
      bus: ["123", "144"],
      ferry: [],
    };
    locations["123"] = {
      top: 2380,
      left: 1175,
      taxi: ["122", "124", "137", "148", "149"],
      underground: [],
      bus: ["124", "122", "185", "144"],
      ferry: [],
    };
    locations["124"] = {
      top: 2295,
      left: 1525,
      taxi: ["109", "123", "138", "111", "130"],
      underground: [],
      bus: ["77", "111", "123", "153"],
      ferry: [],
    };
    locations["125"] = {
      top: 2080,
      left: 2185,
      taxi: ["112", "113", "131"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["126"] = {
      top: 1969,
      left: 2825,
      taxi: ["114", "132", "115", "127", "140"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["127"] = {
      top: 2077,
      left: 3293,
      taxi: ["126", "117", "116", "133", "134"],
      underground: [],
      bus: ["133", "116", "102"],
      ferry: [],
    };
    locations["128"] = {
      top: 2770,
      left: 3895,
      taxi: ["172", "188", "160", "142", "143"],
      underground: ["185", "140", "89"],
      bus: ["142", "135", "161", "187", "199"],
      ferry: [],
    };
    locations["129"] = {
      top: 2215,
      left: 4028,
      taxi: ["117", "118", "142", "143", "135"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["130"] = {
      top: 2329,
      left: 2073,
      taxi: ["124", "131", "139"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["131"] = {
      top: 2185,
      left: 2269,
      taxi: ["125", "130", "114"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["132"] = {
      top: 2178,
      left: 2670,
      taxi: ["140", "114", "126"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["133"] = {
      top: 2390,
      left: 3115,
      taxi: ["140", "141", "127"],
      underground: [],
      bus: ["140", "157", "127"],
      ferry: [],
    };
    locations["134"] = {
      top: 2280,
      left: 3433,
      taxi: ["141", "142", "127", "118"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["135"] = {
      top: 2353,
      left: 4185,
      taxi: ["129", "143", "161", "136"],
      underground: [],
      bus: ["108", "161", "128"],
      ferry: [],
    };
    locations["136"] = {
      top: 2575,
      left: 4775,
      taxi: ["135", "119", "162"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["137"] = {
      top: 2585,
      left: 955,
      taxi: ["123", "147"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["138"] = {
      top: 2447,
      left: 1643,
      taxi: ["124", "150", "152"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["139"] = {
      top: 2475,
      left: 2047,
      taxi: ["130", "154", "153"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["140"] = {
      top: 2420,
      left: 2663,
      taxi: ["139", "132", "133", "126", "154", "156"],
      underground: ["153", "128", "89"],
      bus: ["82", "133", "154", "156"],
      ferry: [],
    };
    locations["141"] = {
      top: 2465,
      left: 3230,
      taxi: ["133", "134", "142", "158"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["142"] = {
      top: 2546,
      left: 3650,
      taxi: ["141", "134", "118", "129", "143", "128", "158"],
      underground: [],
      bus: ["157", "128", "116"],
      ferry: [],
    };
    locations["143"] = {
      top: 2490,
      left: 4030,
      taxi: ["142", "129", "135", "160", "128"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["144"] = {
      top: 2840,
      left: 175,
      taxi: ["120", "145", "177"],
      underground: [],
      bus: ["122", "123", "163"],
      ferry: [],
    };
    locations["145"] = {
      top: 2825,
      left: 352,
      taxi: ["121", "144", "146"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["146"] = {
      top: 2805,
      left: 597,
      taxi: ["122", "145", "147", "163"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["147"] = {
      top: 2763,
      left: 775,
      taxi: ["146", "137", "164"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["148"] = {
      top: 2725,
      left: 1032,
      taxi: ["123", "149", "164"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["149"] = {
      top: 2695,
      left: 1242,
      taxi: ["123", "150", "165", "148"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["150"] = {
      top: 2603,
      left: 1485,
      taxi: ["138", "149", "151"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["151"] = {
      top: 2730,
      left: 1605,
      taxi: ["150", "152", "165", "166"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["152"] = {
      top: 2608,
      left: 1772,
      taxi: ["151", "138", "153"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["153"] = {
      top: 2750,
      left: 1867,
      taxi: ["166", "152", "139", "154", "167"],
      underground: ["163", "111", "140", "185"],
      bus: ["124", "165", "154", "184", "180"],
      ferry: [],
    };
    locations["154"] = {
      top: 2653,
      left: 2295,
      taxi: ["153", "139", "140", "155"],
      underground: [],
      bus: ["153", "140", "156"],
      ferry: [],
    };
    locations["155"] = {
      top: 2835,
      left: 2440,
      taxi: ["154", "156", "167", "168"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["156"] = {
      top: 2835,
      left: 2725,
      taxi: ["155", "140", "157", "169"],
      underground: [],
      bus: ["154", "140", "157", "184"],
      ferry: [],
    };
    locations["157"] = {
      top: 2855,
      left: 2975,
      taxi: ["156", "170", "158"],
      underground: [],
      bus: ["156", "133", "142", "185"],
      ferry: ["115", "194"],
    };
    locations["158"] = {
      top: 2688,
      left: 3370,
      taxi: ["141", "142", "157", "159"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["159"] = {
      top: 3245,
      left: 3392,
      taxi: ["158", "172", "198", "186", "170"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["160"] = {
      top: 2833,
      left: 4207,
      taxi: ["128", "143", "161", "173"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["161"] = {
      top: 2795,
      left: 4538,
      taxi: ["135", "174", "160"],
      underground: [],
      bus: ["128", "199", "135", "107"],
      ferry: [],
    };
    locations["162"] = {
      top: 2800,
      left: 5015,
      taxi: ["136", "175"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["163"] = {
      top: 2940,
      left: 575,
      taxi: ["146", "177"],
      underground: ["111", "153"],
      bus: ["144", "176", "191"],
      ferry: [],
    };
    locations["164"] = {
      top: 2939,
      left: 828,
      taxi: ["147", "178", "148", "179"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["165"] = {
      top: 3020,
      left: 1305,
      taxi: ["179", "149", "151", "180"],
      underground: [],
      bus: ["191", "180", "123"],
      ferry: [],
    };
    locations["166"] = {
      top: 2907,
      left: 1805,
      taxi: ["151", "153", "183", "181"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["167"] = {
      top: 2979,
      left: 2195,
      taxi: ["153", "183", "155", "168"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["168"] = {
      top: 3080,
      left: 2338,
      taxi: ["167", "155", "184"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["169"] = {
      top: 3035,
      left: 2718,
      taxi: ["156", "184"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["170"] = {
      top: 3065,
      left: 2942,
      taxi: ["157", "185", "159"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["171"] = {
      top: 3591,
      left: 4448,
      taxi: ["199", "173", "175"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["172"] = {
      top: 3040,
      left: 3771,
      taxi: ["159", "187", "128"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["173"] = {
      top: 3195,
      left: 4295,
      taxi: ["160", "174", "171", "188"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["174"] = {
      top: 3062,
      left: 4731,
      taxi: ["161", "173", "175"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["175"] = {
      top: 3245,
      left: 4960,
      taxi: ["171", "174", "162"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["176"] = {
      top: 3188,
      left: 100,
      taxi: ["177", "189"],
      underground: [],
      bus: ["163", "190"],
      ferry: [],
    };
    locations["177"] = {
      top: 3142,
      left: 305,
      taxi: ["175", "144", "163"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["178"] = {
      top: 3112,
      left: 682,
      taxi: ["163", "164", "191", "189"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["179"] = {
      top: 3157,
      left: 1122,
      taxi: ["164", "165", "191"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["180"] = {
      top: 3215,
      left: 1395,
      taxi: ["165", "181", "193"],
      underground: [],
      bus: ["165", "190", "184", "153"],
      ferry: [],
    };
    locations["181"] = {
      top: 3135,
      left: 1680,
      taxi: ["193", "180", "166", "182"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["182"] = {
      top: 3175,
      left: 1815,
      taxi: ["195", "181", "183"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["183"] = {
      top: 3059,
      left: 2076,
      taxi: ["167", "166", "182", "195"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["184"] = {
      top: 3250,
      left: 2575,
      taxi: ["197", "196", "168", "169", "185"],
      underground: [],
      bus: ["180", "153", "156", "185"],
      ferry: [],
    };
    locations["185"] = {
      top: 3452,
      left: 2860,
      taxi: ["184", "170", "186"],
      underground: ["153", "128"],
      bus: ["184", "157", "187"],
      ferry: [],
    };
    locations["186"] = {
      top: 3385,
      left: 3172,
      taxi: ["185", "159", "198"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["187"] = {
      top: 3270,
      left: 3637,
      taxi: ["172", "198", "188"],
      underground: [],
      bus: ["185", "128"],
      ferry: [],
    };
    locations["188"] = {
      top: 3275,
      left: 4105,
      taxi: ["187", "128", "173", "199"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["189"] = {
      top: 3485,
      left: 315,
      taxi: ["176", "178", "190"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["190"] = {
      top: 3615,
      left: 538,
      taxi: ["189", "191", "192"],
      underground: [],
      bus: ["176", "191", "180"],
      ferry: [],
    };
    locations["191"] = {
      top: 3375,
      left: 835,
      taxi: ["178", "179", "190", "192"],
      underground: [],
      bus: ["190", "163", "165"],
      ferry: [],
    };
    locations["192"] = {
      top: 3680,
      left: 905,
      taxi: ["190", "191", "194"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["193"] = {
      top: 3405,
      left: 1590,
      taxi: ["180", "181", "194"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["194"] = {
      top: 3500,
      left: 1675,
      taxi: ["192", "193", "195"],
      underground: [],
      bus: [],
      ferry: ["157"],
    };
    locations["195"] = {
      top: 3488,
      left: 1885,
      taxi: ["182", "194", "197"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["196"] = {
      top: 3325,
      left: 2190,
      taxi: ["183", "184", "197"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["197"] = {
      top: 3535,
      left: 2235,
      taxi: ["184", "195", "196"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["198"] = {
      top: 3670,
      left: 3385,
      taxi: ["186", "187", "199"],
      underground: [],
      bus: [],
      ferry: [],
    };
    locations["199"] = {
      top: 3667,
      left: 4160,
      taxi: ["198", "188", "171"],
      underground: [],
      bus: ["161", "128"],
      ferry: [],
    };

    return locations;
  }
}

module.exports = Scotland;
