const GameTemplate = require("../../lib/templates/gametemplate");
const JSON = require("json-bigint");

//////////////////
// CONSTRUCTOR  //
//////////////////
class Poker extends GameTemplate {
  constructor(app) {
    super(app);

    this.app = app;
    this.name = "Poker";
    this.gamename = "Poker";
    this.description =
      "Texas Hold'em Poker for the Saito Arcade. With five cards on the table and two in your hand, can you bet and bluff your way to victory?";
    this.categories = "Games Arcade Entertainment";
    this.type = "Classic Cardgame";
    this.card_img_dir = "/poker/img/cards";

    this.minPlayers = 2;
    this.maxPlayers = 6;
    this.decimal_precision = 0; /*Default, since default is 15/30 blinds*/
    this.settlement = [];
    this.updateHTML = "";
    this.useGraphics = true;
    return this;
  }

  //
  // manually announce arcade banner support
  //
  respondTo(type) {

    if (type == "arcade-carousel") {
      let obj = {};
      obj.background = "/poker/img/arcade/arcade-banner-background.png";
      obj.title = "Poker";
      return obj;
    }

    /*Deprecated ? */
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

    return null;
  }

 

  initializeHTML(app) {

    if (!this.browser_active) { return; }
    
    super.initializeHTML(app);

    //
    // ADD MENU
    //
    this.menu.addMenuOption({
      text: "Game",
      id: "game-game",
      class: "game-game",
      callback: function (app, game_mod) {
        game_mod.menu.showSubMenu("game-game");
      },
    });
    this.menu.addSubMenuOption("game-game", {
      text: "Rules",
      id: "game-rules",
      class: "game-rules",
      callback: function (app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.overlay.show(app, game_mod, game_mod.returnGameRulesHTML());
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
      text: "Stats",
      id: "game-stats",
      class: "game-stats",
      callback: function (app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.handleStatsMenu();
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

    this.restoreLog();
    this.log.render(app, this);
    this.log.attachEvents(app, this);

    this.playerbox.render(app, this);
    this.playerbox.attachEvents(app, this); //empty function
    this.playerbox.addClassAll("poker-seat-", true);
    this.playerbox.addStatus(); //enable update Status to display in playerbox
 
    if (this.game.crypto){
      if (this.game.crypto == "TRX"){
        try{
          if (!document.querySelector(".crypto_logo")){
            $(".gameboard").append(app.browser.htmlToElement(`
            <div class="crypto_logo">
            <?xml version="1.0" encoding="utf-8"?>
            <svg version="1.1" id="图层_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
               viewBox="0 0 3000 1131.5" style="enable-background:new 0 0 3000 1131.5;" xml:space="preserve">
            <style type="text/css">
              .st0{fill:#EBEBEC;}
              .st1{fill:#EB0029;}
            </style>
            <g>
              <g>
                <rect x="1198.6" y="497.4" class="st0" width="44.4" height="289.9"/>
                <rect x="1080" y="374.6" class="st0" width="361.9" height="44.4"/>
                <rect x="1278.8" y="497.4" class="st0" width="44.4" height="289.9"/>
              </g>
              <g>
                <polygon class="st0" points="2549.8,787.6 2594.6,787.6 2594.6,613 2549.8,563.2    "/>
                <polygon class="st0" points="2785.7,374.6 2785.7,698.3 2468.8,346.1 2468.8,787.6 2513.5,787.6 2513.5,463.8 2830.6,816.1 
                  2830.6,374.6    "/>
              </g>
              <g>
                <path class="st0" d="M2178.7,374.4c-113.9,0-206.5,92.6-206.5,206.5s92.6,206.5,206.5,206.5s206.5-92.6,206.5-206.5
                  C2385.2,467.1,2292.6,374.4,2178.7,374.4z M2178.7,742.9c-89.3,0-162-72.6-162-162s72.6-162,162-162c89.3,0,162,72.6,162,162
                  C2340.7,670.2,2268,742.9,2178.7,742.9z"/>
                <path class="st0" d="M2178.7,551.2c-16.4,0-29.7,13.3-29.7,29.7s13.3,29.7,29.7,29.7s29.7-13.3,29.7-29.7
                  S2195.1,551.2,2178.7,551.2z"/>
              </g>
              <path class="st0" d="M1894.5,501.3c0-69.8-56.4-126.6-125.7-126.6h-236.2v413h44.1V419.5h192.1c44.5,0,80.7,36.7,80.7,81.8
                c0,44.9-35.7,81.4-79.8,81.9l-156.7-0.1v204.6h44.1V627.9h103.3l84.4,159.7h51.3l-88.1-166C1858.9,604.7,1894.5,555.5,1894.5,501.3
                z"/>
            </g>
            <path class="st1" d="M774.7,292.8L172.9,182.1l316.7,796.8l441.2-537.6L774.7,292.8z M765.1,341.6l92.1,87.5l-251.8,45.6
              L765.1,341.6z M550.7,465.6L285.3,245.5L719,325.3L550.7,465.6z M531.7,504.6l-43.2,357.7L255.2,275.1L531.7,504.6z M571.7,523.5
              L850.5,473L530.8,862.6L571.7,523.5z"/>
            </svg></div>
          `));  
          }
        }catch(err){

        }
      }
    }
  }

  initializeGame(game_id) { 
    /*if (this.game.status != "") {
      this.updateStatus(this.game.status);
    }*/
  
    // initialize game state
    if (this.game.deck.length == 0) {
      this.game.state = this.returnState(this.game.players.length);
      this.game.stats = this.returnStats();
      this.startRound(); //Does some DOM stuff
    }

    //Parse game options
    this.game.crypto = (this.game.options.crypto)? this.game.options.crypto: "";
    this.game.stake =  (this.game.options.stake) ? parseFloat(this.game.options.stake) : 0;
    this.game.chipValue = this.game.stake / parseInt(this.game.options.num_chips);
    this.game.tournamentBlinds = (this.game.options.blind_mode === "increase");
    this.useGraphics = (this.game.options.chip_graphics == 1);
    let chipValueStr = this.game.chipValue.toString();
    this.decimal_precision = (chipValueStr.includes(".")) ? chipValueStr.split(".")[1].length : chipValueStr.length;
    console.log("INITIALIZE GAME WITH CRYPTO: " + this.game.crypto);
    console.log(chipValueStr, this.decimal_precision);
    if (this.browser_active) {
      this.displayBoard();
    }
  }


  /*
  Call be "turn", "reveal", "fold" if any of them lead to end of round conditions
  */
  startNextRound() {

    console.log("--------- SNR ---------");

    this.game.state.round++;
    this.game.state.preflop = true;
    
    //Shift dealer, small blind, and big blind
    this.game.state.big_blind_player--;
    this.game.state.small_blind_player--;
    this.game.state.button_player--; //dealer
    
    if (this.game.state.big_blind_player < 1) {
      this.game.state.big_blind_player = this.game.players.length;
    }
    if (this.game.state.small_blind_player < 1) {
      this.game.state.small_blind_player = this.game.players.length;
    }
    if (this.game.state.button_player < 1) {
      this.game.state.button_player = this.game.players.length;
    }

    //Adjust blind levels if necessary
    if (this.game.tournamentBlinds && this.game.state.round % 5 == 0) { //TODO: parameterize num_rounds between increases
      this.game.state.small_blind++;
      this.game.state.big_blind = 2 * this.game.state.big_blind;
      this.updateLog(`Blinds increased to: ${this.game.state.big_blind}/${this.game.state.small_blind}`);
      salert(`Blinds increased to: ${this.game.state.big_blind}/${this.game.state.small_blind}`);  
    }

    this.game.state.flipped = 0;
    this.game.state.plays_since_last_raise = 0;
    this.game.state.pot = 0.0;
    this.game.state.last_raise = this.game.state.big_blind;
    this.game.state.required_pot = this.game.state.big_blind;

    for (let i = 0; i < this.game.players.length; i++) {
      this.game.state.passed[i] = 0;
      this.game.state.player_pot[i] = 0;
      this.game.stats[this.game.players[i]].handsPlayed++;
    }

    //Check for end of game -- everyone except 1 player has zero credit...
    let alive_players = 0;
    let winner = -1;
     for (let i = 0; i < this.game.state.player_credit.length; i++) {
        if (this.game.state.player_credit[i] > 0) {
            alive_players++;
            winner = i;
        } 
     }

    if (this.browser_active){
      this.displayPlayers(true); //to update chips before game_over
    }
    this.game.state.all_in = false; //we are stupidly testing for all_in on the display players
     

    //Catch that only one player is standing at the start of the new round
    if (alive_players == 1) {
      this.game.queue = [];
      this.game.queue.push("winner\t" + winner);
      this.settleLastRound();
      return 1;
    }


    //
    // only remove if there are more than two players
    // if two players - let victory play out.
    //
    let removal = false;

    if (alive_players < this.game.state.player_credit.length) {
      console.log("Need to remove a player");
      console.log(JSON.parse(JSON.stringify(this.game.players)));
      for (let i = 0; i < this.game.state.player_credit.length; i++) {
        if (this.game.state.player_credit[i] <= 0) {
          this.updateLog(`Player ${i+1} has been removed from the game.`);
          removal = true;
          //
          // remove any players who are missing
          this.game.state.player_names.splice(i, 1);
          this.game.state.player_pot.splice(i, 1);
          this.game.state.player_credit.splice(i, 1);
          this.game.state.passed.splice(i, 1);
          this.removePlayer(this.game.players[i]);

          //Adjust dealer for each removed player
          if (i < this.game.state.button_player){
            this.game.state.button_player--;
          }
          i--;
        }
      }
    }
    if (removal){
      this.cardfan.hide(); //hide everyone's cards at first
      //Reassign id's
      this.game.player = 0;
      for (let i = 0; i < this.game.players.length; i++) {
        if (this.game.players[i] === this.app.wallet.returnPublicKey()) {
          this.game.player = (i + 1);
        }
      }
      
      //Update DOM -- re-render the playerboxes
      try{
        let boxes = document.querySelectorAll(".player-box");
        for (let box of boxes){
          box.remove();
        }
        this.playerbox.render(this.app,this);
        this.playerbox.addClassAll("poker-seat-", true);
        this.playerbox.addStatus(); //enable update Status to display in playerbox

      } catch(err) {
        console.log("ERROR reRendering Playerboxes",err);
      }

      //Fix dealer and blinds Dealer -> Small -> Big
      if (this.game.state.button_player < 1) {
        this.game.state.button_player = this.game.players.length;
      } 
      this.game.state.small_blind_player = this.game.state.button_player - 1;     
      if (this.game.state.small_blind_player < 1) {
        this.game.state.small_blind_player = this.game.players.length;
      }
      this.game.state.big_blind_player = this.game.state.small_blind_player - 1;     
      if (this.game.state.big_blind_player < 1) {
        this.game.state.big_blind_player = this.game.players.length;
      }
    }

    this.startRound();
  }

  settleLastRound() {
    /*
    We want these at the end of the queue so they get processed first, but if 
    any players got removed, there will be some issues....
    */
    if (this.game.crypto) {
      console.log("PROCESSING THE SETTLEMENT NOW!");
      console.log(JSON.stringify(this.settlement));
      for (let i = 0; i < this.settlement.length; i++) {
        this.game.queue.push(this.settlement[i]);
      }
      console.log("new queue: " + JSON.stringify(this.game.queue));    
    }
    this.settlement = [];
  }


  startRound(){

    console.log("START ROUND");
    
    
    this.updateLog("Round: " + this.game.state.round);
    this.updateLog(`Table ${this.game.id.substring(0, 10)}, Player ${this.game.state.button_player} is the button`);

    for (let i = 0; i < this.game.players.length; i++) {
      this.updateLog(`Player ${(i + 1)}: ${this.game.state.player_names[i]} (${this.game.state.player_credit[i]})`);
    }
    
    /*
    //this.displayBoard();  
    document.querySelector(".round").innerHTML = `Round : ${this.game.state.round}`;
    document.querySelector(".dealer").innerHTML = `Button : Player ${this.game.state.button_player}`;
    */
    this.initializeQueue();

  }

   /*
  Called by initializeGame and startNextRound
  */
  initializeQueue() {

    //console.log("old queue:" + JSON.stringify(this.game.queue));
    this.game.queue = [];

    this.game.queue.push("round");
    this.game.queue.push("READY");
    this.game.queue.push("POOL\t1"); // CREATE pool for cards on table

    /*Deal two cards to everyone
    for (let i = this.game.players.length; i>0; i--){
      this.game.queue.push(`DEAL\t1\t${i}\t2`);
    }

    for (let i = this.game.players.length; i>0; i--){
      this.game.queue.push(`DECKENCRYPT\t1\t${i}`);
    }
    for (let i = this.game.players.length; i>0; i--){
      this.game.queue.push(`DECKXOR\t1\t${i}`);
    }
    this.game.queue.push("DECK\t1\t" + JSON.stringify(this.returnDeck()));
    */
    this.game.queue.push(`SIMPLEDEAL\t2\t1\t`+ JSON.stringify(this.returnDeck()));

    // adds any outstanding settlement to queue (if not already processed)
    this.settleLastRound();


  }

  handleGameLoop() {
    ///////////
    // QUEUE //
    ///////////
    if (this.game.queue.length > 0) {
      let qe = this.game.queue.length - 1;
      let mv = this.game.queue[qe].split("\t");
      let shd_continue = 1;

      this.displayTable(); //to update pot

      console.log("QUEUE: " + JSON.stringify(this.game.queue));
      //this.outputState();

      if (mv[0] == "notify") {
        this.updateLog(mv[1]);
        this.game.queue.splice(qe, 1);
      }

      if (mv[0] === "winner") {
        this.game.queue = [];
        let winner = parseInt(mv[1]); //Notably not keyed to game.player, but by the index
        this.updateStatus("Game Over: " + this.game.state.player_names[winner] + " wins!");
        this.updateLog("Game Over: " + this.game.state.player_names[winner] + " wins!");
        this.overlay.show(this.app, this, `<div class="shim-notice"><h1>Game Over: ${this.game.state.player_names[winner]} wins!</h1>${this.updateHTML}</div>`);
        this.game.winner = this.game.players[winner];
        if (this.game.player == this.game.winner){
          this.resignGame(this.game.id); //post to leaderboard - ignore 'resign'
        }
        return 0;
      }

      //
      // turns "resolve"
      //
      if (mv[0] === "resolve") {
        this.game.queue.splice(qe - 1, 2);
        return 1;
      }

      //Player's turn to fold,check,call,raise
      if (mv[0] === "turn") {
        let player_to_go = parseInt(mv[1]);

        //
        // if everyone except 1 player has folded...
        //
        let active_players = 0;
        let player_left_idx = 0;
        for (let i = 0; i < this.game.state.passed.length; i++) {
          if (this.game.state.passed[i] == 0) {
            active_players++;
            player_left_idx = i;
          }
        }

        /*PLAYER WINS HAND HERE*/
        if (active_players === 1) {
          let winnings = this.game.state.pot - this.game.state.player_pot[player_left_idx];
          this.updateLog(`${this.game.state.player_names[player_left_idx]} wins ${this.game.state.pot} (${winnings} net)`);
          console.log(`${this.game.state.player_credit[player_left_idx]} + ${this.game.state.pot} = `);
          this.game.state.player_credit[player_left_idx] += this.game.state.pot;
          console.log(this.game.state.player_credit[player_left_idx]);
          this.game.stats[this.game.players[player_left_idx]].handsWon++;
          //
          // everyone settles with winner if needed
          //
          if (this.game.crypto) {
            for (let i = 0; i < this.game.players.length; i++) {
              if (i != player_left_idx) {
                //Only losers
                if (this.game.state.player_pot[i] > 0) {
                  let amount_to_send = this.game.state.player_pot[i]*this.game.chipValue;
                  amount_to_send = amount_to_send.toFixed(this.decimal_precision+1);

                  let ts = new Date().getTime();
                  this.rollDice();
                  let uh = this.game.dice;
                  //if (this.game.player - 1 == player_left_idx) {
              // do not reformat -- adding whitespace screws with API
                  //  this.settlement.push(`RECEIVE\t${this.game.players[i]}\t${this.game.players[player_left_idx]}\t${this.game.state.player_pot[i]}\t${ts}\t${uh}\t${this.game.crypto}`);
                  //} else {
                     this.settlement.push(`RECEIVE\t${this.game.players[i]}\t${this.game.players[player_left_idx]}\t${amount_to_send}\t${ts}\t${uh}\t${this.game.crypto}`);
                     this.settlement.push(`SEND\t${this.game.players[i]}\t${this.game.players[player_left_idx]}\t${amount_to_send}\t${ts}\t${uh}\t${this.game.crypto}`);
                  //}
                }
              }
            }
          }

          // if everyone has folded - start a new round
          console.log("everyone has folded... start next round");
          this.startNextRound();

          return 1;
        }
        this.game.state.plays_since_last_raise++;
        console.log("PLAYS SINCE LAST RAISE: "+this.game.state.plays_since_last_raise);
        
        // Is this the end of betting?
        if (this.game.state.plays_since_last_raise > this.game.players.length) {
          //Is this the end of the hand?
          if (this.game.state.flipped == 5) {
            console.log("GO TO SHOWDOWN");
            this.game.state.player_cards = {};
            this.game.state.player_cards_reported = 0;
            this.game.state.player_cards_required = 0;
            this.game.queue = [];
            let first_scorer = -1;

            for (let i = 0; i < this.game.state.passed.length; i++) {
              if (this.game.state.passed[i] == 0) {
                if (first_scorer == -1) {
                  first_scorer = i;
                }
                this.game.state.player_cards_required++;
                this.game.state.player_cards[i] = [];
              }
            }

            if (first_scorer == this.game.player - 1) {
              this.addMove(`reveal\t${this.game.player}\t${this.game.deck[0].hand[0]}\t${this.game.deck[0].hand[1]}`);
              this.endTurn();
            }
            return 0;
          } else {
            console.log("REVEAL MORE CARD[S]");
            let cards_to_flip =  (this.game.state.flipped == 0)? 3: 1;

            this.game.state.flipped += cards_to_flip;

            //We can't just push "announce", have to reset queue to clear out any remaining turns
            this.game.queue = ["round", "announce"];
            //this.game.queue.push("announce");
            this.game.queue.push(`POOLDEAL\t1\t${cards_to_flip}\t1`);
            /*for (let z = 0; z < cards_to_flip; z++) {
              for (let i = this.game.players.length - 1; i >= 0; i--) {
                this.game.queue.push("FLIPCARD\t1\t1\t1\t" + (i + 1));
              }
              this.game.queue.push("FLIPRESET\t1");
            }*/

            //
            // observer mode
            //
            if (this.game.player == 0) {
              this.game.queue.push("OBSERVER_CHECKPOINT");
            }

            this.game.state.plays_since_last_raise = 0;
            return 1;
          }
        }
      
        if (this.game.state.passed[player_to_go - 1] == 1) {
          console.log("THIS PLAYER ALREADY PASSED " + player_to_go);
          //
          // we auto-clear without need for player to broadcast
          //
          this.game.queue.splice(qe, 1);
          return 1;
        } else if (this.game.state.player_credit[player_to_go - 1] == 0){
          console.log("THIS PLAYER IS ALL IN " + player_to_go);
          //
          // we auto-clear without need for player to broadcast
          //
          this.game.queue.splice(qe, 1);
          return 1;
        }else{
          console.log("GET ACTION " + player_to_go);
          if (this.browser_active){
            $(".player-box.active").removeClass("active");
            this.playerbox.addClass("active", player_to_go);  
          }
          
          if (player_to_go == this.game.player) {
            this.playerTurn();
          } else {
            if (this.game.state.passed[this.game.player-1]){
              this.updateStatus("Waiting for next round");
            }else{
              this.updateStatus("Waiting for " + this.game.state.player_names[player_to_go - 1]);  
            }
          }
          return 0;   
        }
       shd_continue = 0;
      }


      if (mv[0] === "announce") {
        console.log("ANNOUNCE");
        this.displayBoard();
        this.game.queue.splice(qe, 1);

        if (this.game.state.flipped === 0) {
          this.updateLog(`*** HOLE CARDS *** [${this.cardToHuman(this.game.deck[0].hand[0])} ${this.cardToHuman(this.game.deck[0].hand[1])}]`);
        }
        if (this.game.state.flipped === 3) {
          this.updateLog(`*** FLOP *** [${this.cardToHuman(this.game.pool[0].hand[0])} ${this.cardToHuman(this.game.pool[0].hand[1])} ${this.cardToHuman(this.game.pool[0].hand[2])}]`);
        }
        if (this.game.state.flipped === 4) {
          this.updateLog(`*** TURN *** [${this.cardToHuman(this.game.pool[0].hand[0])} ${this.cardToHuman(this.game.pool[0].hand[1])} ${this.cardToHuman(this.game.pool[0].hand[2])}] [${this.cardToHuman(this.game.pool[0].hand[3])}]`);        
        }
        if (this.game.state.flipped === 5) {
          this.updateLog(`*** RIVER *** [${this.cardToHuman(this.game.pool[0].hand[0])} ${this.cardToHuman(this.game.pool[0].hand[1])} ${this.cardToHuman(this.game.pool[0].hand[2])}] [${this.cardToHuman(this.game.pool[0].hand[3])}] [${this.cardToHuman(this.game.pool[0].hand[4])}]`);
        }

        return 1;
      }

      if (mv[0] === "reveal") {
        var _this = this;

        let scorer = parseInt(mv[1]);
        let card1 = mv[2];
        let card2 = mv[3];

        this.game.queue.splice(qe,1);

        //Pocket
        this.game.state.player_cards[scorer - 1].push(
          this.returnCardFromDeck(card1)
        );
        this.game.state.player_cards[scorer - 1].push(
          this.returnCardFromDeck(card2)
        );

        //Pool
        for (let i = 0; i < 5; i ++){
          this.game.state.player_cards[scorer - 1].push(this.returnCardFromDeck(this.game.pool[0].hand[i]));  
        }
        
        let winners = [];

        this.game.state.player_cards_reported++;

        //
        // we have all of the hands, and can pick a winner
        ///*PLAYER WINS HAND HERE*/
        if (this.game.state.player_cards_reported == this.game.state.player_cards_required) {
          let deck = null;
          var updateHTML = "";
          var winlist = [];

          for (var key in this.game.state.player_cards) {
            deck = this.game.state.player_cards[key];

            if (winlist.length == 0) {
              winlist.splice(0, 0, {
                player: parseInt(key) + 1,
                player_hand: this.scoreHand(deck),
              });
            } else {
              let winlist_length = winlist.length;
              let place = 0;
              for (let k = 0; k < winlist_length; k++) {
                let w = _this.pickWinner(winlist[k].player_hand, _this.scoreHand(deck));
                if (w > 1) {
                  place = k + 1;
                }
              }
              winlist.splice(place, 0, {
                player: parseInt(key) + 1,
                player_hand: _this.scoreHand(deck),
              });
            }

            //need to specify two winners differently not just on identical hands.
          }
          // Populate winners with winning players
          winners.push(winlist[winlist.length - 1].player - 1);
          for (let p = winlist.length - 1; p > 0; p--) {
            if (_this.pickWinner(winlist[winlist.length - 1].player_hand, winlist[p - 1].player_hand) == 3) {
              winners.push(winlist[p - 1].player - 1);
            }
          }

          // split winnings among winners ***TO DO: examine possibility of fractional chips
          let pot_size = Math.floor(this.game.state.pot / winners.length);
          let winnerStr = "";
          for (let i = 0; i < winners.length; i++) {
            this.game.stats[this.game.players[winners[i]]].handsWon++;
            winnerStr += this.game.state.player_names[winners[i]] + ", ";
            //Award in game winnings
            this.game.state.player_credit[winners[i]] += pot_size;
          }
          winnerStr = this.prettifyList(winnerStr); //works with one player
          console.log(winners.length+ " WINNERS: ",winners);

          // update logs and splash!
          let winner_html = "<h2>" + winnerStr;

          if (winners.length == 1) {
            winner_html += " takes the pot!</h2>";
          } else {
            winner_html += " split the pot!</h2>";
          }

          winlist.forEach((pl) => {
            _this.updateLog(`${_this.game.state.player_names[pl.player - 1]}: ${pl.player_hand.hand_description} <br>${ _this.toHuman(pl.player_hand.cards_to_score)}`);
            updateHTML = this.handToHTML(pl.player_hand.cards_to_score) + updateHTML;
            updateHTML = `<h3>${_this.game.state.player_names[pl.player - 1]}: ${pl.player_hand.hand_description}</h3>${updateHTML}`;
          });

          this.updateHTML = updateHTML;

          if (winners.length > 1) {
            this.updateLog(`${winnerStr} split the pot for ${pot_size} each`);

            //
            // send wagers to winner
            let chips_to_send = this.game.state.player_pot[this.game.player - 1] / winners.length;
            if (chips_to_send !== Math.round(chips_to_send)){
              salert("Uneven pot split. House keeps difference");
              chips_to_send = Math.floor(chips_to_send);
            }

            for (let i = 0; i < winners.length; i++) {
              //
              // non-winners send wagers to winner
              if (this.game.crypto) {
                for (let ii = 0; ii < this.game.players.length; ii++) {
                  if (!winners.includes(ii) && this.game.state.player_pot[ii] > 0) {
                    let amount_to_send = this.game.chipValue * this.game.state.player_pot[ii] / winners.length ;
                    amount_to_send = amount_to_send.toFixed(this.decimal_precision+1);

                    // do not reformat -- adding whitespace screws with API
                    let ts = new Date().getTime();
                    this.rollDice();
                    let uh = this.game.dice;
                    this.settlement.push(`RECEIVE\t${this.game.players[ii]}\t${this.game.players[winners[i]]}\t${amount_to_send}\t${ts}\t${uh}\t${this.game.crypto}`);
                    this.settlement.push(`SEND\t${this.game.players[ii]}\t${this.game.players[winners[i]]}\t${amount_to_send}\t${ts}\t${uh}\t${this.game.crypto}`);
                  }
                }
              }
            }
          } else {// single winner gets everything
            this.updateLog(`${winnerStr} wins ${this.game.state.pot} (${this.game.state.pot-this.game.state.player_pot[winners[0]]} net)`);

            if (this.game.crypto) {
              for (let ii = 0; ii < this.game.players.length; ii++) {
                if (!winners.includes(ii) && this.game.state.player_pot[ii] > 0) {
                  let amount_to_send = this.game.state.player_pot[ii] * this.game.chipValue;
                  amount_to_send = amount_to_send.toFixed(this.decimal_precision+1);

                  let ts = new Date().getTime();
                  this.rollDice();
                  let uh = this.game.dice;
                  // do not reformat -- adding whitespace screws with API
                  this.settlement.push(`RECEIVE\t${this.game.players[ii]}\t${this.game.players[winners[0]]}\t${amount_to_send}\t${ts}\t${uh}\t${this.game.crypto}`);
                  this.settlement.push(`SEND\t${this.game.players[ii]}\t${this.game.players[winners[0]]}\t${amount_to_send}\t${ts}\t${uh}\t${this.game.crypto}`);
                }
              }
            }
          }

          this.overlay.show(this.app, this, `<div class="shim-notice">${winner_html}${updateHTML}</div>`, ()=>{
            this.game.halted = 0;
            let cont = this.runQueue();
            if (cont == 0) {
              this.processFutureMoves();
            }
          });
          this.game.halted = 1;
          this.startNextRound();

          return 0;
        }

        //If not everyone has reported there hand yet, find the next in sequence from this scorer
        let next_scorer = -1;
        for (let i = scorer; i < this.game.state.passed.length; i++) {
          if (this.game.state.passed[i] == 0) {
            if (next_scorer == -1) {
              next_scorer = i;
            }
          }
        }

        if (this.game.player - 1 == next_scorer) {
          this.addMove(`reveal\t${this.game.player}\t${this.game.deck[0].hand[0]}\t${this.game.deck[0].hand[1]}`);
          this.endTurn();
        }

        return 0;
      }

      /* Set up a round of betting 
         We don't splice it, so we keep coming back here after each player has taken their turn
         until we reach an endgame state which runs startNextRound and clears to queue
      */
      if (mv[0] === "round") {
        // Start betting to the left of the big blind on first turn

        let lastToBet = (this.game.state.flipped == 0 && this.game.state.plays_since_last_raise < this.game.players.length)? this.game.state.big_blind_player : this.game.state.button_player;
        for (let i = lastToBet; i <= lastToBet + this.game.players.length - 1; i++) {
          let player_to_go = i % this.game.players.length;
          if (player_to_go == 0) {
            player_to_go = this.game.players.length;
          }
          this.game.queue.push("turn\t" + player_to_go);
        }

        //Set up bets for beginning of round (new deal)
        if (this.game.state.preflop) {

          let bbpi = this.game.state.big_blind_player - 1;
          //
          // Big Blind
          //
          if (this.game.state.player_credit[bbpi] <= this.game.state.big_blind) {
            if (
              this.game.state.player_credit[bbpi] == this.game.state.big_blind) {
              this.updateLog(this.game.state.player_names[bbpi] + " posts big blind " + this.game.state.big_blind);
            } else {
              this.updateLog(this.game.state.player_names[bbpi] + " posts remaining tokens as big blind and is removed from game");
            }

            //Put all the player tokens in the pot and have them pass / remove
            this.game.state.player_pot[bbpi] += this.game.state.player_credit[bbpi];
            this.game.state.pot += this.game.state.player_credit[bbpi];
            this.game.state.player_credit[bbpi] = 0;
            this.game.state.passed[bbpi] = 1;
          } else {
            this.updateLog(this.game.state.player_names[bbpi] + " posts big blind " + this.game.state.big_blind);
            this.game.state.player_pot[bbpi] += this.game.state.big_blind;
            this.game.state.pot += this.game.state.big_blind;
            this.game.state.player_credit[bbpi] -= this.game.state.big_blind;
          }

          this.playerbox.refreshLog(`<div class="plog-update">Big Blind: ${this.game.state.big_blind}</div>`,this.game.state.big_blind_player);
          //
          // Small Blind
          //
          let sbpi = this.game.state.small_blind_player - 1;
          if (this.game.state.player_credit[sbpi] <= this.game.state.small_blind) {
            if (this.game.state.player_credit[sbpi] === this.game.state.small_blind) {
              this.updateLog(this.game.state.player_names[sbpi] + " posts small blind " + this.game.state.small_blind);
            } else {
              this.updateLog(this.game.state.player_names[sbpi] + 
                " posts remaining tokens as small blind and is removed from the game");
            }
            this.game.state.player_pot[sbpi] += this.game.state.player_credit[sbpi];
            this.game.state.pot += this.game.state.player_credit[sbpi];
            this.game.state.player_credit[sbpi] = 0;
            this.game.state.passed[sbpi] = 1;
          } else {
            this.updateLog(this.game.state.player_names[sbpi] + " posts small blind " + this.game.state.small_blind);
            this.game.state.player_pot[sbpi] += this.game.state.small_blind;
            this.game.state.pot += this.game.state.small_blind;
            this.game.state.player_credit[sbpi] -= this.game.state.small_blind;
          }

          this.outputState();

          this.playerbox.refreshLog(`<div class="plog-update">Small Blind: ${this.game.state.small_blind}</div>`,this.game.state.small_blind_player);

          this.game.queue.push("announce");        
          this.game.state.preflop = false;

          this.displayPlayers(true); //To refresh the stacks of the small and big blind player
        }   

      }



      /* WE programmatically determine here how much the call is*/
      if (mv[0] === "call") {
        let player = parseInt(mv[1]);

        let amount_to_call = this.game.state.required_pot - this.game.state.player_pot[player - 1];

        if (amount_to_call <= 0) {
          console.error("Zero/Negative Call");
          console.log(mv);
          this.outputState();
        }

        //
        // reset plays since last raise
        //
        this.game.state.player_credit[player - 1] -= amount_to_call;
        this.game.state.player_pot[player - 1] += amount_to_call;
        this.game.state.pot += amount_to_call;

        this.game.queue.splice(qe, 1);

        this.refreshPlayerStack(player, true); //Here we don't want to hide cards
        
        if (this.game.player !== player) {this.playerbox.refreshLog(`<div class="plog-update">calls</div>`, player);}

        if (this.game.state.player_credit[player-1] === 0){
          this.game.state.all_in = true;
          this.updateLog(this.game.state.player_names[player - 1] + " goes all in to call");
        }else{
          this.updateLog(this.game.state.player_names[player - 1] + " calls");
        }
        

      }

      if (mv[0] === "fold") {
        let player = parseInt(mv[1]);

        if (this.browser_active){
          if (this.game.player !== player) {
            this.refreshPlayerStack(player, false); //Here we want to hide cards
            this.playerbox.refreshLog(`<div class="plog-update">folds</div>`, player);
          }else{
            this.displayHand();
          } 
        }
        
        this.updateLog(this.game.state.player_names[player - 1] + " folds");

        this.game.stats[this.game.players[player-1]].handsFolded++;
        this.game.state.passed[player - 1] = 1;
        this.game.queue.splice(qe, 1);
      }

      if (mv[0] === "check") {
        let player = parseInt(mv[1]);
        this.game.queue.splice(qe, 1);
        this.updateLog(this.game.state.player_names[player - 1] + " checks.");
        if (this.game.player !== player && this.browser_active) {
          this.playerbox.refreshLog(`<div class="plog-update">checks</div>`, player);
        }
        return 1;
      }

      if (mv[0] === "raise") {

        let player = parseInt(mv[1]);
        let raise = parseInt(mv[2]); //Includes call portion (if any)
        let call_portion = this.game.state.required_pot - this.game.state.player_pot[player - 1];
        let raise_portion = raise - call_portion;

        /*console.log("raise is: " + raise);
        console.log("raise portion: "  + raise_portion);
        console.log("call portion: "  + call_portion);*/
  
        if (raise_portion <= 0){
          alert("Insufficient raise");
          console.error("Call process in raise/Insufficient Raise",mv);
          this.outputState();
        }
        
        this.game.state.plays_since_last_raise = 1;

        this.game.state.player_credit[player - 1] -= raise;
        this.game.state.player_pot[player - 1] += raise;
        this.game.state.pot += raise;
        this.game.state.last_raise = raise_portion;
        this.game.state.required_pot += raise_portion;
        let raise_message = `raises ${raise_portion} `;
        if (this.game.state.player_credit[player -1 ] === 0){
          this.game.state.all_in = 1;
          raise_message = `goes all in `;
        }      
        if (call_portion > 0) {  
          if (raise_portion > 0) {
            this.updateLog(`${this.game.state.player_names[player - 1]} ${raise_message}to ${this.game.state.player_pot[player - 1]}`);
            if (this.game.player !== player && this.browser_active) {this.playerbox.refreshLog(`<div class="plog-update">raises ${raise_portion}</div>`, player);}
          } else {
            this.updateLog(`${this.game.state.player_names[player - 1]} calls ${call_portion}`);
          }
        } else {
          this.updateLog(`${this.game.state.player_names[player - 1]} ${raise_message}to ${this.game.state.player_pot[player - 1]}`);
          if (this.game.player !== player && this.browser_active) {this.playerbox.refreshLog(`<div class="plog-update">raises ${raise}</div>`, player);}
        }
        this.game.queue.splice(qe, 1);

        this.refreshPlayerStack(player, true); //Here we don't want to hide cards

        return 1;
      }

      //
      // avoid infinite loops
      //
      if (shd_continue == 0) {
        console.log("NOT CONTINUING");
        return 0;
      }
    }else{
      console.log("QUEUE EMPTY!");
    }
    return 1;
  }

  
  outputState(){
    console.log("######################");
    console.log(JSON.parse(JSON.stringify(this.game.state)));
  }


  playerTurn() {
    if (this.browser_active == 0) {
      return;
    }

    let poker_self = this;
    let html = "";

    //
    // cancel raise kicks us back
    //
    if (!poker_self.moves.includes("resolve\tturn")) {
      poker_self.addMove("resolve\tturn");
    }

    console.log("required pot: " + this.game.state.required_pot);
    console.log("player pot: " + this.game.state.player_pot[this.game.player-1]);
    console.log("all in: "+this.game.state.all_in);

    let match_required = this.game.state.required_pot - this.game.state.player_pot[this.game.player - 1];

    if (match_required === 0 && this.game.state.all_in){
      poker_self.endTurn();
      return;
    }

    //These would be a strange edge case
    this.game.state.last_raise = Math.max(this.game.state.last_raise,this.game.state.big_blind);
    match_required = Math.max(0,match_required); 

    let can_call = (this.game.state.player_credit[this.game.player - 1] >= match_required);
    let can_raise = !this.game.state.all_in; //(this.game.state.player_credit[this.game.player - 1] > match_required /*+ this.game.state.last_raise*/);

    //cannot raise more than everyone can call.
    let smallest_stack = poker_self.game.options.num_chips * poker_self.game.players.length; //Start with total amount of money in the game
    let smallest_stack_player = 0;

    poker_self.game.state.player_credit.forEach((stack, index) => {
      if (poker_self.game.state.passed[index] == 0) {
        stack += this.game.state.player_pot[index] - this.game.state.required_pot; //adjust for their potential need to also match current pot
        if (stack < smallest_stack){
          smallest_stack = stack;
          smallest_stack_player = index;   
        } 
      }
    });
        
    //console.log(match_required,this.game.state.last_raise,smallest_stack);

    if (!can_call) {
      console.error("Auto fold... this should never arise");
      this.outputState();
      this.updateStatus("You can only fold...");
      this.addMove("fold\t" + poker_self.game.player);
      this.endTurn();
      return;
    }

    html += '<div class="menu-player" style="text-align:left;width:100%">';
    
    if (this.game.state.flipped == 0 && this.game.player == this.game.state.big_blind_player) {
      html += "big blind:";
    }else if (this.game.state.flipped == 0 && this.game.player == this.game.state.small_blind_player) {
      html += "small blind:";
    }else{
      html += "your move:";
    }
    
    html += `<div style="float:right;" class="saito-balance">${this.game.state.player_credit[this.game.player - 1]}</div></div>`;
    html += "<ul>";

    html += '<li class="menu_option" id="fold">fold</li>';
    
    if (match_required > 0) {
      html += `<li class="menu_option" id="call">call (${match_required})</li>`;
    } else { // we don't NEED to match
      html += '<li class="menu_option" id="check">check</li>';
    }
    if (can_raise) {
        html += `<li class="menu_option" id="raise">raise</li>`;
      }
    html += "</ul>";

    this.updateStatus(html, 1);

    $(".menu_option").off();
    $(".menu_option").on("click", function () {
      let choice = $(this).attr("id");
   
      if (choice === "raise") {
        let credit_remaining = poker_self.game.state.player_credit[poker_self.game.player - 1] - match_required;

        html = `<div class="menu-player">`;
        if (match_required > 0) {
          html += `Match ${match_required} and raise: `;
        } else {
          html += "Please select an option below: ";
        }

        html += `</div><ul><li class="menu_option" id="0">cancel raise</li>`;
        let max_raise = Math.min(credit_remaining, smallest_stack);

        console.log("last raise: " + poker_self.game.state.last_raise);
        console.log("match required: " + match_required); 

        for (let i = 0; i < 5; i++) {

          let this_raise = poker_self.game.state.last_raise + i * poker_self.game.state.last_raise;

          console.log("this raise: " + this_raise);
          console.log("id is: " + (this_raise + match_required));

          if (max_raise > this_raise) {
            html += `<li class="menu_option" id="${this_raise + match_required}">raise ${this_raise}</li>`;
          } else {
            i = 6; //Stop for-loop
            html += `<li class="menu_option" id="${max_raise + match_required}">
                      raise ${max_raise} 
                      (all in for ${poker_self.game.state.player_names[smallest_stack_player]})</li>`;
          }
        }

        html += "</ul>";
        poker_self.updateStatus(html);

        $(".menu_option").off();
        $(".menu_option").on("click", function () {

          let raise = $(this).attr("id");

          if (raise === "0") {
            poker_self.playerTurn();
          } else {
            console.log("Player chocie: "+raise);
            poker_self.addMove(`raise\t${poker_self.game.player}\t${raise}`);
            poker_self.endTurn();
          }
        });
      }else{
        /* choice = fold, check or call, so just directly insert in Move*/
        console.log("Player chocie: "+choice);
        poker_self.addMove(`${choice}\t${poker_self.game.player}`);
        poker_self.endTurn();
      }
    });
  }

  /* To fix float operations*/
  sizeNumber(x) {
    return parseFloat(x.toFixed(8));
  }


  returnState(num_of_players) {
    let state = {};

    state.round = 1;
    state.flipped = 0;
    state.preflop = true;

    state.player_cards = {};
    state.player_cards_reported = 0;
    state.player_cards_required = 0;

    state.plays_since_last_raise = 0;

    state.pot = 0.0;
   
    state.big_blind_player = 1;
    state.small_blind_player = 2;
    state.button_player = 3;
    
    if (num_of_players == 2) {
      state.button_player = 2;
      state.big_blind_player = 2;
      state.small_blind_player = 1;
    }
  
    //Player Arrays
    state.player_names = [];
    state.player_pot = [];
    state.player_credit = [];
    state.passed = [];

    for (let i = 0; i < num_of_players; i++) {
      state.passed[i] = 0;
      state.player_pot[i] = 0;
      //Initial stake
      state.player_credit[i] = this.game.options.num_chips;
      
      //Assign names
      state.player_names[i] = this.getShortNames(this.game.players[i]);
    }

    state.big_blind = 2;
    state.small_blind = 1;
    state.last_raise = state.big_blind;
    state.required_pot = state.big_blind;
    state.all_in = false;
    //console.log("STATE: " + JSON.stringify(state));

    return state;
  }

  getShortNames(publicKey){
    let name = this.app.keys.returnUsername(publicKey);
      if (name.indexOf("@") > 0) {
        name = name.substring(0, name.indexOf("@"));
      }
      if (name === publicKey) {
        name = publicKey.substring(0, 10) + "...";
      } 
    return name;
  }

  returnCardFromDeck(idx) {
    let deck = this.returnDeck();
    let card = deck[idx];

    return card.name.substring(0, card.name.indexOf("."));
  }

  /* TO-DO rectify poker decks across games!*/

  returnDeck() {
    var deck = {};

    deck["1"] = { name: "S1.png" };
    deck["2"] = { name: "S2.png" };
    deck["3"] = { name: "S3.png" };
    deck["4"] = { name: "S4.png" };
    deck["5"] = { name: "S5.png" };
    deck["6"] = { name: "S6.png" };
    deck["7"] = { name: "S7.png" };
    deck["8"] = { name: "S8.png" };
    deck["9"] = { name: "S9.png" };
    deck["10"] = { name: "S10.png" };
    deck["11"] = { name: "S11.png" };
    deck["12"] = { name: "S12.png" };
    deck["13"] = { name: "S13.png" };
    deck["14"] = { name: "C1.png" };
    deck["15"] = { name: "C2.png" };
    deck["16"] = { name: "C3.png" };
    deck["17"] = { name: "C4.png" };
    deck["18"] = { name: "C5.png" };
    deck["19"] = { name: "C6.png" };
    deck["20"] = { name: "C7.png" };
    deck["21"] = { name: "C8.png" };
    deck["22"] = { name: "C9.png" };
    deck["23"] = { name: "C10.png" };
    deck["24"] = { name: "C11.png" };
    deck["25"] = { name: "C12.png" };
    deck["26"] = { name: "C13.png" };
    deck["27"] = { name: "H1.png" };
    deck["28"] = { name: "H2.png" };
    deck["29"] = { name: "H3.png" };
    deck["30"] = { name: "H4.png" };
    deck["31"] = { name: "H5.png" };
    deck["32"] = { name: "H6.png" };
    deck["33"] = { name: "H7.png" };
    deck["34"] = { name: "H8.png" };
    deck["35"] = { name: "H9.png" };
    deck["36"] = { name: "H10.png" };
    deck["37"] = { name: "H11.png" };
    deck["38"] = { name: "H12.png" };
    deck["39"] = { name: "H13.png" };
    deck["40"] = { name: "D1.png" };
    deck["41"] = { name: "D2.png" };
    deck["42"] = { name: "D3.png" };
    deck["43"] = { name: "D4.png" };
    deck["44"] = { name: "D5.png" };
    deck["45"] = { name: "D6.png" };
    deck["46"] = { name: "D7.png" };
    deck["47"] = { name: "D8.png" };
    deck["48"] = { name: "D9.png" };
    deck["49"] = { name: "D10.png" };
    deck["50"] = { name: "D11.png" };
    deck["51"] = { name: "D12.png" };
    deck["52"] = { name: "D13.png" };

    return deck;
  }

/****************
 * 
 ***** GUI *****
 * 
 ***************/

  displayBoard() {
    if (!this.browser_active) {
      return;
    }
    try {
      this.displayPlayers(); //Clear player log
      this.displayHand();
      this.displayTable();
    } catch (err) {
      console.error("err: " + err);
    }
  }

  displayPlayers(preserveLog = false) {
    if (!this.browser_active){
      return;
    }
  try {
    /*let player_box = "";
    var prank = "";
    if (!this.game.players.includes(this.app.wallet.returnPublicKey())) {
      document.querySelector('.status').innerHTML = "You are out of the game.<br />Feel free to hang out and chat.";
      this.cardfan.addClass("hidden");
      player_box = this.returnViewBoxArray();
    }*/

    for (let i = 1; i <= this.game.players.length; i++) {
      this.playerbox.refreshName(i);
      this.refreshPlayerStack(i, true);  

      if (!preserveLog){
        this.playerbox.refreshLog("",i);
      }
    }

    let elem;
    
    elem = document.querySelector(`#player-box-head-${this.playerbox.playerBox(this.game.state.button_player)}`);
    if (elem){
      let newButton = this.app.browser.makeElement("div","dealerbutton","dealerbutton");
      newButton.classList.add("dealer");
      newButton.textContent = "⬤";
      elem.firstChild.after(newButton);
      this.app.browser.addToolTip(newButton, "Dealer");  
    }
  } catch (err) {
    console.log("error displaying player box",err);
  }
  }

  displayHand() {
    if (this.game.state.passed[this.game.player-1]){
      this.cardfan.hide();
    }else{
      this.cardfan.render(this.app, this);
      this.cardfan.attachEvents(this.app, this);  
    }
  }

  displayTable() {
    if (!this.browser_active){
      return;
    }
    try {
      if (document.querySelector("#deal")){
        let newHTML = "";
        for (let i = 0; i < 5 || i < this.game.pool[0].hand.length; i++) {
          let card = {};

          if (i < this.game.pool[0].hand.length) {
            card = this.game.pool[0].cards[this.game.pool[0].hand[i]];
          } else {
            card.name = "red_back.png";
          }
          newHTML += `<img class="card" src="${this.card_img_dir}/${card.name}">`;
        }
        document.querySelector("#deal").innerHTML = newHTML;
      }
      // update pot
      let html = `<div class="pot-counter">${this.game.state.pot}</div>`;
      if (this.useGraphics){
        for (let i = 0; i < this.game.state.player_pot.length; i++){
          html += this.returnPlayerStackHTML(i+1, this.game.state.player_pot[i]);
        }
      }
        html += `<div class="tiptext">${this.game.state.pot} chips in the pot`;
        if (this.game.crypto){
          html += `, worth ${this.sizeNumber(this.game.state.pot * this.game.chipValue)} ${this.game.crypto}`;
        }
        html += "</div>";
      
      document.querySelector(".pot").innerHTML = sanitize(html);

    } catch (err) { console.log("error displaying table",err);}
  }

  refreshPlayerStack(player, includeCards = true){
    if (!this.browser_active){
      return;
    }
    //Update numerical stack
    let html = "";
    if (this.game.state.player_credit[player - 1] === 0 && this.game.state.all_in){
        html = `<div class="player-info-chips">All in!</div>`;
    }else{
        html = `<div class="player-info-chips">${this.game.state.player_credit[player - 1]} CHIPS</div>`;
    }
    if (this.game.crypto){
      html = `<div class="tip">${html}<div class="tiptext">${this.sizeNumber(this.game.state.player_credit[player - 1] * this.game.chipValue)} ${this.game.crypto}</div></div>`;
    }
    this.playerbox.refreshInfo(html, player);
   
    if (this.useGraphics){
      //Draw literal stack
      html = this.returnPlayerStackHTML(player, this.game.state.player_credit[player - 1]);
      html = html.substring(0,html.length - 6); //remove final </div> tag
      let bonusExplainer = `<div>${this.game.state.player_credit[player - 1]} CHIPS</div>`;
      if (this.game.crypto){
        bonusExplainer += `<div>${this.sizeNumber(this.game.state.player_credit[player - 1] * this.game.chipValue)} ${this.game.crypto}</div>`;
      }

      this.playerbox.refreshGraphic(`${html}<div class="tiptext">${bonusExplainer}</div></div>`,player);
    } 
    
    //Append cards in graphics box for other players
    if (includeCards){
      if (player != this.game.player && !this.game.state.passed[player-1]) {
        //Show backs of cards
        let newhtml = `
          <div class="other-player-hand hand tinyhand">
            <img class="card" src="${this.card_img_dir}/red_back.png">
            <img class="card" src="${this.card_img_dir}/red_back.png">
          </div>
        `;
        if (this.useGraphics){
          //Need to put tinyhand and chip-stack both in graphic
          this.playerbox.appendGraphic(newhtml, player);  
        }else{
          this.playerbox.refreshGraphic(newhtml, player);
        }
        
      }
    }
    
  }
  
  returnPlayerStackHTML(player,numChips){
    let html = `<div class="chip_stack pstack${player} tip">`;

    let numBigChips = Math.floor(numChips/10);
    let numSmallChips = numChips - numBigChips*10;

    if (numSmallChips == 0 && numBigChips > 0){
      numSmallChips += 10;
      numBigChips --;
    }
    //console.log(`${numChips} represented as ${numBigChips} large chips and ${numSmallChips} small chips`);
    for (let i = 0; i < numBigChips; i++){
      html += this.returnChipHTML(false, player, i*8);
    }
    for (let i = numBigChips; i < numBigChips+numSmallChips; i++){
      html += this.returnChipHTML(true, player, i*8);
    }
    
   html += "</div>";
   return html;
  }


  returnChipHTML(single = true, player = 1, offset = 0){
    if (single){
     return `<svg class="poker_chip" style="bottom:${offset}px; " viewbox="0 0 100 35">
            <path d="
                M 2 13
                A 41 10 0 0 0 98 13
                A 41 10 0 0 0 2 13
                L 2 21
                A 41 10 0 0 0 98 21
                L 98 13
              " 
              stroke-width="1">
            </svg>`;
    }else{
      return `<svg class="poker_chip" style="bottom:${offset}px; " viewbox="0 0 100 35">
              <path d="
                M 2 13
                L 2 21
                A 41 10 0 0 0 98 21
                L 98 13
                A 41 10 0 0 0 2 13
              "
              stroke-width="1" stroke="black" fill="url(#stripes${player})"/>
              <path d="
                M 2 13
                A 41 10 0 0 0 98 13
                A 41 10 0 0 0 2 13
              " 
              stroke-width="1" stroke="black" />
            </svg>`;
    }
  }


  endTurn(nextTarget = 0) {
    this.updateStatus("Waiting for information from peers....");

    try {
      $(".menu_option").off();
    } catch (err) {}

    let extra = {};
    extra.target = this.returnNextPlayer(this.game.player);

    if (nextTarget != 0) {
      extra.target = nextTarget;
    }
    this.game.turn = this.moves;
    this.moves = [];
    this.sendMessage("game", extra);
  }


/* Functions to analyze hands and compare them*/

  pickWinner(score1, score2) {
    let hands_differ = 0;

    //Check if hands are different
    for (let i = 0; i < score1.cards_to_score.length; i++) {
      if (score1.cards_to_score[i] !== score2.cards_to_score[i]) {
        hands_differ = 1;
      }
    }
    if (hands_differ == 0) {
      return 3;
    }

    if (score1.hand_description == "royal flush" &&  score2.hand_description == "royal flush") {
      for (let i = 0; i < score1.cards_to_score.length; i++) {
        if (this.returnHigherCard(score1.cards_to_score[i], score2.cards_to_score[i]) == score1.cards_to_score[i]) {
          return 1;
        } else {
          return 2;
        }
      }
    }

    if (score1.hand_description == "royal flush") {
      return 1;
    }
    if (score2.hand_description == "royal flush") {
      return 2;
    }

    if (score1.hand_description == "straight flush" && score2.hand_description == "straight flush") {
      for (let i = 0; i < score1.cards_to_score.length; i++) {
        if (this.returnHigherNumberCard(score1.cards_to_score[i], score2.cards_to_score[i]) == score1.cards_to_score[i]) {
          return 1;
        }
        if (this.returnHigherNumberCard(score1.cards_to_score[i],score2.cards_to_score[i]) == score2.cards_to_score[i]) {
          return 2;
        }
      }
      return 3;
    }
    if (score1.hand_description == "straight flush") {
      return 1;
    }
    if (score2.hand_description == "straight flush") {
      return 2;
    }

    if (score1.hand_description == "four-of-a-kind" && score2.hand_description == "four-of-a-kind") {
      if (this.returnHigherNumberCard(score1.cards_to_score[0], score2.cards_to_score[0]) == score1.cards_to_score[0]) {
        return 1;
      }
      if (this.returnHigherNumberCard(score1.cards_to_score[0], score2.cards_to_score[0]) == score2.cards_to_score[0]) {
        return 2;
      }
      if (this.returnHigherNumberCard(score1.cards_to_score[4], score2.cards_to_score[4]) == score1.cards_to_score[4]) {
        return 1;
      }
      if (this.returnHigherNumberCard(score1.cards_to_score[4], score2.cards_to_score[4]) == score2.cards_to_score[4]) {
        return 2;
      }
      return 3;
    }
    if (score1.hand_description == "four-of-a-kind") {
      return 1;
    }
    if (score2.hand_description == "four-of-a-kind") {
      return 2;
    }

    if (score1.hand_description == "full house" &&  score2.hand_description == "full house") {
      if (this.returnHigherNumberCard(score1.cards_to_score[0], score2.cards_to_score[0]) == score1.cards_to_score[0]) {
        return 1;
      }
      if (this.returnHigherNumberCard(score1.cards_to_score[0], score2.cards_to_score[0]) == score2.cards_to_score[0]) {
        return 2;
      }
      if (this.returnHigherNumberCard(score1.cards_to_score[3], score2.cards_to_score[3]) == score1.cards_to_score[3]) {
        return 1;
      }
      if (this.returnHigherNumberCard(score1.cards_to_score[3], score2.cards_to_score[3]) == score2.cards_to_score[3]) {
        return 2;
      }
      return 3;
    }
    if (score1.hand_description == "full house") {
      return 1;
    }
    if (score2.hand_description == "full house") {
      return 2;
    }

    if (score1.hand_description == "flush" && score2.hand_description == "flush") {
      for (let i = 0; i < score1.cards_to_score.length; i++) {
        if (this.returnHigherCard(score1.cards_to_score[i], score2.cards_to_score[i]) == score1.cards_to_score[i]) {
          return 1;
        }
        if (this.returnHigherCard(score1.cards_to_score[i], score2.cards_to_score[i]) == score2.cards_to_score[i]) {
          return 2;
        }
      }
      return 3;
    }
    if (score1.hand_description == "flush") {
      return 1;
    }
    if (score2.hand_description == "flush") {
      return 2;
    }

    if (score1.hand_description == "straight" && score2.hand_description == "straight") {
      for (let i = 0; i < score1.cards_to_score.length; i++) {
        if (this.returnHigherNumberCard(score1.cards_to_score[i], score2.cards_to_score[i]) == score1.cards_to_score[i]) {
          return 1;
        }
        if (this.returnHigherNumberCard(score1.cards_to_score[i], score2.cards_to_score[i]) == score2.cards_to_score[i]) {
          return 2;
        }
      }
      return 3;
    }
    if (score1.hand_description == "straight") {
      return 1;
    }
    if (score2.hand_description == "straight") {
      return 2;
    }

    if (score1.hand_description == "three-of-a-kind" && score2.hand_description == "three-of-a-kind") {
      if (this.returnHigherNumberCard(score1.cards_to_score[0], score2.cards_to_score[0]) == score1.cards_to_score[0]) {
        return 1;
      }
      if (this.returnHigherNumberCard(score1.cards_to_score[0], score2.cards_to_score[0]) == score2.cards_to_score[0]) {
        return 2;
      }
      for (let i = 3; i < 5; i++) {
        if (this.returnHigherNumberCard(score1.cards_to_score[i], score2.cards_to_score[i]) == score1.cards_to_score[i]) {
          return 1;
        }
        if (this.returnHigherNumberCard(score1.cards_to_score[i], score2.cards_to_score[i]) == score2.cards_to_score[i]) {
          return 2;
        }
      }
      return 3;
    }
    if (score1.hand_description == "three-of-a-kind") {
      return 1;
    }
    if (score2.hand_description == "three-of-a-kind") {
      return 2;
    }

    if (score1.hand_description == "two pair" && score2.hand_description == "two pair") {
      if (this.returnHigherNumberCard(score1.cards_to_score[0], score2.cards_to_score[0]) == score1.cards_to_score[0]) {
        return 1;
      }
      if (this.returnHigherNumberCard(score1.cards_to_score[0], score2.cards_to_score[0]) == score2.cards_to_score[0]) {
        return 2;
      }
      if (this.returnHigherNumberCard(score1.cards_to_score[2], score2.cards_to_score[2]) == score1.cards_to_score[2]) {
        return 1;
      }
      if (this.returnHigherNumberCard(score1.cards_to_score[2], score2.cards_to_score[2]) == score2.cards_to_score[2]) {
        return 2;
      }
      if (this.returnHigherNumberCard(score1.cards_to_score[4], score2.cards_to_score[4]) == score1.cards_to_score[4]) {
        return 1;
      }
      if (this.returnHigherNumberCard(score1.cards_to_score[4], score2.cards_to_score[4]) == score2.cards_to_score[4]) {
        return 2;
      }
      return 3;
    }

    if (score1.hand_description == "two pair") {
      return 1;
    }
    if (score2.hand_description == "two pair") {
      return 2;
    }

    if (score1.hand_description == "pair" && score2.hand_description == "pair") {
      if (this.returnHigherNumberCard(score1.cards_to_score[0], score2.cards_to_score[0]) == score1.cards_to_score[0]) {
        return 1;
      }
      if (this.returnHigherNumberCard(score1.cards_to_score[0], score2.cards_to_score[0]) == score2.cards_to_score[0]) {
        return 2;
      }
      if (this.returnHigherNumberCard(score1.cards_to_score[2], score2.cards_to_score[2]) == score1.cards_to_score[2]) {
        return 1;
      }
      if (this.returnHigherNumberCard(score1.cards_to_score[2], score2.cards_to_score[2]) == score2.cards_to_score[2]) {
        return 2;
      }
      if (this.returnHigherNumberCard(score1.cards_to_score[4], score2.cards_to_score[4]) == score1.cards_to_score[4]) {
        return 1;
      }
      if (this.returnHigherNumberCard(score1.cards_to_score[4], score2.cards_to_score[4]) == score2.cards_to_score[4]) {
        return 2;
      }
      return 3;
    }

    if (score1.hand_description == "pair") {
      return 1;
    }
    if (score2.hand_description == "pair") {
      return 2;
    }

    if (score1.hand_description == "highest card" && score2.hand_description == "highest card") {
      for (let i = 0; i < score1.cards_to_score.length; i++) {
        if (this.returnHigherNumberCard(score1.cards_to_score[i], score2.cards_to_score[i]) == score1.cards_to_score[i]) {
          return 1;
        }
        if (this.returnHigherNumberCard(score1.cards_to_score[i], score2.cards_to_score[i]) == score2.cards_to_score[i]) {
          return 2;
        }
      }
      return 3;
    }
    if (score1.hand_description == "highest card") {
      return 1;
    }
    if (score2.hand_description == "highest card") {
      return 2;
    }
  }

  scoreHand(hand) {
    let x = this.convertHand(hand);
    let suite = x.suite;
    let val = x.val;

    let idx = 0;
    let pairs = [];
    let three_of_a_kind = [];
    let four_of_a_kind = [];
    let straights = [];
    let full_house = [];

    //
    // identify pairs
    //
    idx = 1;
    while (idx < 14) {
      let x = this.isTwo(suite, val, idx);
      if (x == 0) {
        idx = 14;
      } else {
        pairs.push(x);
        idx = x + 1;
      }
    }
    pairs.sort((a, b) => a - b);

    //
    // identify triples
    //
    idx = 1;
    while (idx < 14) {
      let x = this.isThree(suite, val, idx);
      if (x == 0) {
        idx = 14;
      } else {
        three_of_a_kind.push(x);
        idx = x + 1;
      }
    }
    three_of_a_kind.sort((a, b) => a - b);

    //
    // identify quintuples
    //
    idx = 1;
    while (idx < 14) {
      let x = this.isFour(suite, val, idx);
      if (x == 0) {
        idx = 14;
      } else {
        four_of_a_kind.push(x);
        idx = x + 1;
      }
    }

    //
    // identify straights
    //
    idx = 1;
    while (idx < 10) {
      let x = this.isStraight(suite, val, idx);
      if (x == 0) {
        idx = 11;
      } else {
        straights.push(x);
        idx = x + 1;
      }
    }

    //
    // remove triples and pairs that are four-of-a-kind
    //
    for (let i = 0; i < four_of_a_kind.length; i++) {
      for (var z = 0; z < three_of_a_kind.length; z++) {
        if (three_of_a_kind[z] === four_of_a_kind[i]) {
          three_of_a_kind.splice(z, 1);
        }
      }

      for (var z = 0; z < pairs.length; z++) {
        if (pairs[z] === four_of_a_kind[i]) {
          pairs.splice(z, 1);
        }
      }
    }

    //
    // remove pairs that are also threes
    //
    for (let i = 0; i < three_of_a_kind.length; i++) {
      for (var z = 0; z < pairs.length; z++) {
        if (pairs[z] === three_of_a_kind[i]) {
          pairs.splice(z, 1);
        }
      }
    }

    //
    // now ready to identify highest hand
    //
    // royal flush
    // straight flush
    // four-of-a-kind    x
    // full-house
    // flush
    // straight      x
    // three-of-a-kind    x
    // two-pair
    // pair        x
    // high card
    //
    let cards_to_score = [];
    let hand_description = "";
    let highest_card = [];

    //
    // ROYAL FLUSH
    //
    if (straights.includes(10)) {
      if (this.isFlush(suite, val) != "") {
        let x = this.isFlush(suite, val);
        if (
          this.isCardSuite(suite, val, 1, x) == 1 &&
          this.isCardSuite(suite, val, 13, x) == 1 &&
          this.isCardSuite(suite, val, 12, x) == 1 &&
          this.isCardSuite(suite, val, 11, x) == 1 &&
          this.isCardSuite(suite, val, 10, x) == 1
        ) {
          cards_to_score.push("1" + x);
          cards_to_score.push("13" + x);
          cards_to_score.push("12" + x);
          cards_to_score.push("11" + x);
          cards_to_score.push("10" + x);
          hand_description = "royal flush";
          return {
            cards_to_score: this.sortByValue(cards_to_score),
            hand_description: hand_description,
          };
        }
      }
    }

    //
    // STRAIGHT FLUSH
    //
    if (straights.length > 0) {
      if (this.isFlush(suite, val) != "") {
        let x = this.isFlush(suite, val);
        for (let i = straights.length - 1; i >= 0; i--) {
          if (
            this.isCardSuite(suite, val, straights[i] + 4, x) == 1 &&
            this.isCardSuite(suite, val, straights[i] + 3, x) == 1 &&
            this.isCardSuite(suite, val, straights[i] + 2, x) == 1 &&
            this.isCardSuite(suite, val, straights[i] + 1, x) == 1 &&
            this.isCardSuite(suite, val, straights[i], x) == 1
          ) {
            cards_to_score.push(straights[i] + 4 + x);
            cards_to_score.push(straights[i] + 3 + x);
            cards_to_score.push(straights[i] + 2 + x);
            cards_to_score.push(straights[i] + 1 + x);
            cards_to_score.push(straights[i] + x);
            hand_description = "straight flush";
            return {
              cards_to_score: this.sortByValue(cards_to_score),
              hand_description: hand_description,
            };
          }
        }
      }
    }

    //
    // FOUR OF A KIND
    //
    if (four_of_a_kind.length > 0) {
      if (four_of_a_kind.includes(1)) {
        cards_to_score = ["C1", "D1", "H1", "S1"];
        highest_card = this.returnHighestCard(suite, val, cards_to_score);
        cards_to_score.push(highest_card);
        hand_description = "four-of-a-kind";
        return {
          cards_to_score: cards_to_score,
          hand_description: hand_description,
        };
      }

      cards_to_score = [
        "C" + four_of_a_kind[four_of_a_kind.length - 1],
        "D" + four_of_a_kind[four_of_a_kind.length - 1],
        "H" + four_of_a_kind[four_of_a_kind.length - 1],
        "S" + four_of_a_kind[four_of_a_kind.length - 1],
      ];
      highest_card = this.returnHighestCard(suite, val, cards_to_score);
      hand_description = "four-of-a-kind";
      cards_to_score.push(highest_card);
      return {
        cards_to_score: cards_to_score,
        hand_description: hand_description,
      };
    }

    //
    // FULL HOUSE
    //
    if (three_of_a_kind.length == 2) {
      if (three_of_a_kind[0] > three_of_a_kind[1]) {
        pairs.push(three_of_a_kind.pop());
      } else {
        pairs.push(three_of_a_kind.shift());
      }
    }
    if (three_of_a_kind.length > 0 && pairs.length > 0) {
      let highest_suite = "C";

      for (let i = 0; i < val.length; i++) {
        if (val[i] == three_of_a_kind[three_of_a_kind.length - 1]) {
          if (this.isHigherSuite(suite[i], highest_suite)) {
            highest_suite = suite[i];
          }
          cards_to_score.push(suite[i] + val[i]);
        }
      }
      highest_card =
        highest_suite + three_of_a_kind[three_of_a_kind.length - 1];

      for (let i = 0; i < val.length; i++) {
        if (val[i] == pairs[pairs.length - 1]) {
          cards_to_score.push(suite[i] + val[i]);
        }
        if (cards_to_score.length > 5) {
          cards_to_score.pop();
        }
      }

      hand_description = "full house";
      return {
        cards_to_score: cards_to_score,
        hand_description: hand_description,
        highest_card: highest_card,
      };
    }

    //
    // FLUSH
    //
    if (this.isFlush(suite, val) != "") {
      let x = this.isFlush(suite, val);
      let y = [];

      for (let i = 0; i < val.length; i++) {
        if (suite[i] == x) {
          y.push(val[i]);
        }
      }

      // y now contians onyl in-suite vals
      y.sort((a, b) => a - b);
      y.splice(0, y.length - 5);
      for (let i = y.length - 1; i >= 0; i--) {
        cards_to_score.push(x + y[i]);
      }

      hand_description = "flush";
      return {
        cards_to_score: this.sortByValue(cards_to_score),
        hand_description: hand_description,
      };
    }

    //
    // STRAIGHT
    //
    if (this.isStraight(suite, val) > 0) {
      let x = this.isStraight(suite, val);

      hand_description = "straight";

      //ace hight straight
      if (x == 10) {
        cards_to_score.push(this.returnHighestSuiteCard(suite, val, 1));
        cards_to_score.push(this.returnHighestSuiteCard(suite, val, 13));
        cards_to_score.push(this.returnHighestSuiteCard(suite, val, 12));
        cards_to_score.push(this.returnHighestSuiteCard(suite, val, 11));
        cards_to_score.push(this.returnHighestSuiteCard(suite, val, 10));

        return {
          cards_to_score: cards_to_score,
          hand_description: hand_description,
        };
      }
      //ace low straight
      if (x == 1) {
        cards_to_score.push(this.returnHighestSuiteCard(suite, val, 5));
        cards_to_score.push(this.returnHighestSuiteCard(suite, val, 4));
        cards_to_score.push(this.returnHighestSuiteCard(suite, val, 3));
        cards_to_score.push(this.returnHighestSuiteCard(suite, val, 2));
        cards_to_score.push(this.returnHighestSuiteCard(suite, val, 1));

        return {
          cards_to_score: cards_to_score,
          hand_description: hand_description,
        };
      }
      for (let i = 4; i >= 0; i--) {
        cards_to_score.push(this.returnHighestSuiteCard(suite, val, x + i));
      }
      return {
        cards_to_score: this.sortByValue(cards_to_score),
        hand_description: hand_description,
      };
    }

    //
    // THREE OF A KIND
    //
    if (three_of_a_kind.length > 0) {
      let x = three_of_a_kind[three_of_a_kind.length - 1];
      let y = [];

      let cards_remaining = val.length;
      for (let i = 0; i < cards_remaining; i++) {
        if (val[i] == x) {
          y.push(suite[i] + val[i]);
          val.splice(i, 1);
          suite.splice(i, 1);
          cards_remaining--;
          i--;
        }
      }

      for (let i = 0; i < y.length; i++) {
        cards_to_score.push(y[i]);
      }

      let remaining1 = this.returnHighestCard(suite, val);
      let remaining2 = this.returnHighestCard(suite, val, [remaining1]);
      let remaining_cards = this.sortByValue([remaining1, remaining2]);
      for (let i = 0; i < remaining_cards.length; i++) {
        cards_to_score.push(remaining_cards[i]);
      }

      hand_description = "three-of-a-kind";
      return {
        cards_to_score: cards_to_score,
        hand_description: hand_description,
      };
    }

    //
    // TWO PAIR
    //
    if (pairs.length > 1) {
      pairs.sort((a, b) => a - b);

      // deal with three pairs.
      if (pairs.length == 3) {
        if (pairs[0] == 1) {
          pairs.push(pairs.shift());
        }
        pairs.shift();
      }

      let m = pairs[pairs.length - 1];
      let n = pairs[pairs.length - 2];

      if (m > n) {
        highest_card = m;
      } else {
        highest_card = n;
      }
      if (n == 1) {
        highest_card = n;
      }

      let cards_remaining = val.length;
      for (let i = 0; i < cards_remaining; i++) {
        if (val[i] == highest_card) {
          cards_to_score.push(suite[i] + val[i]);
          val.splice(i, 1);
          suite.splice(i, 1);
          cards_remaining--;
          i--;
        }
      }
      cards_remaining = val.length;
      for (let i = 0; i < cards_remaining; i++) {
        if (val[i] == m || val[i] == n) {
          cards_to_score.push(suite[i] + val[i]);
          val.splice(i, 1);
          suite.splice(i, 1);
          cards_remaining--;
          i--;
        }
      }

      let remaining1 = this.returnHighestCard(suite, val, cards_to_score);
      cards_to_score.push(remaining1);
      hand_description = "two pair";

      return {
        cards_to_score: cards_to_score,
        hand_description: hand_description,
      };
    }

    //
    // A PAIR
    //
    if (pairs.length > 0) {
      let x = pairs[pairs.length - 1];
      let y = [];

      let cards_remaining = val.length;
      for (let i = 0; i < cards_remaining; i++) {
        if (val[i] == x) {
          y.push(suite[i] + val[i]);
          val.splice(i, 1);
          suite.splice(i, 1);
          cards_remaining--;
          i--;
        }
      }

      let remaining1 = this.returnHighestCard(suite, val);
      let remaining2 = this.returnHighestCard(suite, val, [remaining1]);
      let remaining3 = this.returnHighestCard(suite, val, [
        remaining1,
        remaining2,
      ]);

      let cards_remaining2 = this.sortByValue([
        remaining1,
        remaining2,
        remaining3,
      ]);
      //let cards_remaining2 = [remaining1, remaining2, remaining3];
      cards_to_score.push(y[0]);
      cards_to_score.push(y[1]);
      for (let i = 0; i < cards_remaining2.length; i++) {
        cards_to_score.push(cards_remaining2[i]);
      }
      hand_description = "pair";
      return {
        cards_to_score: cards_to_score,
        hand_description: hand_description,
      };
    }

    //
    // HIGHEST CARD
    //
    let remaining1 = this.returnHighestCard(suite, val);
    let remaining2 = this.returnHighestCard(suite, val, [remaining1]);
    let remaining3 = this.returnHighestCard(suite, val, [
      remaining1,
      remaining2,
    ]);
    let remaining4 = this.returnHighestCard(suite, val, [
      remaining1,
      remaining2,
      remaining3,
    ]);
    let remaining5 = this.returnHighestCard(suite, val, [
      remaining1,
      remaining2,
      remaining3,
      remaining4,
    ]);

    cards_to_score.push(remaining1);
    cards_to_score.push(remaining2);
    cards_to_score.push(remaining3);
    cards_to_score.push(remaining4);
    cards_to_score.push(remaining5);

    hand_description = "highest card";
    highest_card = remaining1;
    return {
      cards_to_score: this.sortByValue(cards_to_score),
      hand_description: hand_description,
    };
  }

  convertHand(hand) {
    let x = {};
    x.suite = [];
    x.val = [];

    for (let i = 0; i < hand.length; i++) {
      x.suite.push(hand[i][0]);
      x.val.push(parseInt(hand[i].substring(1)));
    }

    return x;
  }

  sortByValue(cards) {
    //let x = this.convertHand(cards);
    let y = [];
    let idx = 0;

    y.push(cards[0]);

    for (let i = 1; i < cards.length; i++) {
      idx = 0;
      for (let j = 0; j < y.length; j++) {
        if (this.returnHigherCard(cards[i], y[j]) == y[j]) {
          idx = j + 1;
        }
      }
      y.splice(idx, 0, cards[i]);
    }
    return y;
  }

  returnHigherCard(card1, card2) {
    let card1_suite = card1[0];
    let card1_val = parseInt(card1.substring(1));

    let card2_suite = card2[0];
    let card2_val = parseInt(card2.substring(1));

    if (card1_val == 1) {
      card1_val = 14;
    }
    if (card2_val == 1) {
      card2_val = 14;
    }

    if (card1_val > card2_val) {
      return card1;
    }
    if (card2_val > card1_val) {
      return card2;
    }
    if (card2_val == card1_val) {
      if (card1_suite == card2_suite) {
        return 0;
      }
      if (this.isHigherSuite(card1_suite, card2_suite)) {
        return card1;
      } else {
        return card2;
      }
    }
  }

  returnHigherNumberCard(card1, card2) {
    let card1_val = parseInt(card1.substring(1));
    let card2_val = parseInt(card2.substring(1));

    if (card1_val == 1) {
      card1_val = 14;
    }
    if (card2_val == 1) {
      card2_val = 14;
    }

    if (card1_val > card2_val) {
      return card1;
    }
    if (card2_val > card1_val) {
      return card2;
    }
    if (card2_val == card1_val) {
      return 0;
    }
  }

  isHigherSuite(currentv, newv) {
    if (currentv === "S") {
      return 1;
    }
    if (newv == "S") {
      return 0;
    }
    if (currentv === "H") {
      return 1;
    }
    if (newv == "H") {
      return 0;
    }
    if (currentv === "D") {
      return 1;
    }
    if (newv == "D") {
      return 0;
    }
    if (currentv === "C") {
      return 1;
    }
    if (newv == "C") {
      return 0;
    }
  }

  returnHighestSuiteCard(suite, val, x) {
    let suite_to_return = "C";
    let card_to_return = "";

    for (let i = 0; i < val.length; i++) {
      if (val[i] == x) {
        if (card_to_return != "") {
          if (this.isHigherSuite(suite_to_return, suite[i])) {
            suite_to_return = suite[i];
            card_to_return = suite[i] + val[i];
          }
        } else {
          suite_to_return = suite[i];
          card_to_return = suite[i] + val[i];
        }
      }
    }
    return card_to_return;
  }

  returnHighestCard(suite, val, noval = [], less_than = 14) {
    let highest_card = 0;
    let highest_suite = "C";
    let highest_idx = 0;

    for (let i = 0; i < val.length; i++) {
      if (noval.includes(suite[i] + val[i])) {
        //if the case id not in the exclude list
        console.log("you are barred from the pub");
      } else {
        if (val[i] == 1) {
          //if the candidate is an ace
          if (highest_card == 14) {
            //and the encumbent is an ace
            if (this.isHigherSuite(suite[i], highest_suite)) {
              //if the candidate is a higher suite
              //the candidate wins
              highest_suite = suite[i];
            }
          } else {
            highest_card = 14; // and if there was no encumbent - the candidate is the winner.
            highest_suite = suite[i];
          }
        }

        if (val[i] == highest_card) {
          //if the candiates is as high as the encumbent
          if (this.isHigherSuite(suite[i], highest_suite)) {
            //if the candidate has a higher suite
            highest_suite = suite[i];
          }
        }

        if (val[i] > highest_card) {
          // if the candidate is just higher
          highest_card = val[i]; // the candidate wins
          highest_suite = suite[i]; // the candiate wins
        }
      }
    }
    if (highest_card == 14) {
      highest_card = 1;
    }
    return highest_suite + highest_card;
  }

  isFlush(suite, val) {
    let total_clubs = 0;
    let total_spades = 0;
    let total_hearts = 0;
    let total_diamonds = 0;

    for (let i = 0; i < suite.length; i++) {
      if (suite[i] == "C") {
        total_clubs++;
      }
      if (suite[i] == "D") {
        total_diamonds++;
      }
      if (suite[i] == "H") {
        total_hearts++;
      }
      if (suite[i] == "S") {
        total_spades++;
      }
    }

    if (total_clubs >= 5) {
      return "C";
    }
    if (total_spades >= 5) {
      return "S";
    }
    if (total_hearts >= 5) {
      return "H";
    }
    if (total_diamonds >= 5) {
      return "D";
    }

    return "";
  }

  isFour(suite, val, low = 1) {
    for (let i = low - 1; i < 13; i++) {
      let total = 0;
      for (let z = 0; z < val.length; z++) {
        if (val[z] == i + 1) {
          total++;
          if (total == 4) {
            return i + 1;
          }
        }
      }
    }

    return 0;
  }

  isThree(suite, val, low = 1) {
    for (let i = low - 1; i < 13; i++) {
      let total = 0;
      for (let z = 0; z < val.length; z++) {
        if (val[z] == i + 1) {
          total++;
          if (total == 3) {
            return i + 1;
          }
        }
      }
    }

    return 0;
  }

  isTwo(suite, val, low = 1) {
    for (let i = low - 1; i < 13; i++) {
      let total = 0;
      for (let z = 0; z < val.length; z++) {
        if (val[z] == i + 1) {
          total++;
          if (total == 2) {
            return i + 1;
          }
        }
      }
    }

    return 0;
  }

  isStraight(suite, val, low = 1) {
    for (let i = low - 1; i < 10; i++) {
      //
      // catch royal straight
      //
      if (i == 9) {
        if (
          val.includes(13) &&
          val.includes(12) &&
          val.includes(11) &&
          val.includes(10) &&
          val.includes(1)
        ) {
          return 10;
        }
        return 0;
      }

      if (
        val.includes(i + 1) &&
        val.includes(i + 2) &&
        val.includes(i + 3) &&
        val.includes(i + 4) &&
        val.includes(i + 5)
      ) {
        return i + 1;
      }
    }

    return 0;
  }

  isCardSuite(suite, val, card, s) {
    for (let i = 0; i < val.length; i++) {
      if (val[i] == card) {
        if (suite[i] == s) {
          return 1;
        }
      }
    }
    return 0;
  }

  /*Helper functions for display and options*/

  cardToHuman(card) {
    
    if (!this.game.deck[0].cards[card]){
      console.log("Deck error: " + card);
      console.log(JSON.parse(JSON.stringify(this.game.deck[0])));
      return "";
    }
    let h = this.game.deck[0].cards[card].name;
    h = h.replace(".png", "");
    h = h.replace("13", "K");
    h = h.replace("12", "Q");
    h = h.replace("11", "J");
    h = h.replace("1", "A");
    h = h.replace("A0", "10"); //restore ten
    let suit = h[0];
    h = h.substring(1);
    switch(suit){
      case "H": return h+"h"; break;
      case "D": return h+"d"; break;
      case "S": return h+"s"; break;
      case "C": return h+"c"; break;
    }
    return h;
  }

  toHuman(hand) {
    var humanHand = " <span class='htmlhand'>";
    hand.forEach((h) => {
      h = h.replace("H", "<span style='color:red'><span class='suit'>&hearts;</span>");
      h = h.replace("D", "<span style='color:red'><span class='suit'>&diams;</span>");
      h = h.replace("S", "<span style='color:black'><span class='suit'>&spades;</span>");
      h = h.replace("C", "<span style='color:black'><span class='suit'>&clubs;</span>");
      h = h.replace("13", "K");
      h = h.replace("12", "Q");
      h = h.replace("11", "J");
      h = h.replace("1", "A");
      h = h.replace("A0", "10");
      h = "<span class='htmlCard'>" + h + "</span></span>";
      humanHand += h;
    });
    humanHand += "</span> ";
    return humanHand;
  }

  

  returnGameRulesHTML(){
    return `<div class="rules-overlay">
    <h1>Texas Hold'em</h1>
    <p>This is a standard implementation of the popular poker game.</p>
    <p>Each player attempts to form the best hand with their two private cards (called "the hole") and the five public cards.</p>
    <p>Players are initially dealt their two secret cards and betting begins. The player to the left (clockwise) of the dealer is called the small blind and must bet the small blind, the player to his/her left (clockwise) is the big blind and must also bet. Any other players must fold, call the big blind, or raise the pot. Once all bets are called, the three public cards are flipped over (the "flop").</p>
    <p>Another round of betting then commences from the player to the left of the dealer. Players can fold, check (i.e. not increase the pot), raise, or call (i.e. match a raise). Another card (the "turn") is revealed followed by another round of betting, and the final card (the "river") is revealed with another round of betting. </p> 
    <p>Any remaining players after the final round of betting go into the showdown and the highest hand wins the pot.</p>
    <h2>Poker Hands</h2>
    <ul>
    <li><em>Straight Flush</em> is the best possible hand, where all the cards are of the same suit and continuous, with Ace high. A straight flush of A, K, Q, J, 10 is called a royal flush.</li>
    <li><em>Four of a Kind</em></li>
    <li><em>Full House</em>--three of a kind and a pair.</li>
    <li><em>Flush</em>--All five cards of of the same suit</li>
    <li><em>Straight</em>--the five cards are sequential in order (but not of the same suit)</li>
    <li><em>Three of a Kind</em></li>
    <li><em>Two Pair</em></li>
    <li><em>One Pair</em></li>
    <li><em>No Pair</em></li>
    </ul>
    </div>`;
  }

  /**
   * Casinos generally have a minimum buyin of 20 x big blind and maximum buyin of 100 x big blind
   * We can't let users independently select starting blinds and stakes
   */ 
  returnGameOptionsHTML() {
    let options_html = `
      <h1 class="overlay-title">Poker Options</h1>
          <div class="overlay-input">
            <label for="blind_mode">Mode:</label>
            <select id="blind_mode" name="blind_mode">
              <option value="static">static blinds</option>
              <option value="increase">increasing blinds</option>
            </select>
          </div>
          <div class="options_notice" id="blind_explainer">Small blind is one chip, big blind is two chips throughout the game</div>
          <div class="overlay-input">
            <label for="num_chips">Num chips:</label>
            <select id="num_chips" name="num_chips">
              <option value="40">40</option>
              <option value="100" selected>100</option>
              <option value="250">250</option>
            </select>
          </div>
          <div class="overlay-input">
            <input type="checkbox" name="chip_graphics" />
            <label for="chip_graphics">Use visual chips</label>
          </div>
          <div class="overlay-input">
            <label for="crypto">Crypto:</label>
            <select id="crypto" name="crypto">
              <option value="" selected>None</option>
              <option value="SAITO">SAITO</option>
    `;

    let listed = [];
    for (let i = 0; i < this.app.modules.mods.length; i++) {
      if (
        this.app.modules.mods[i].ticker != "" &&
        this.app.modules.mods[i].ticker != undefined &&
  !listed.includes(this.app.modules.mods[i].ticker)
      ) {
        options_html += `<option value="${this.app.modules.mods[i].ticker}">${this.app.modules.mods[i].ticker}</option>`;
  listed.push(this.app.modules.mods[i].ticker);
      }
    }

    options_html += `
            </select>
          </div>
          <div id="chip_wrapper" class="overlay-input" style="display:none;">
            <label for="stake">Game stake:</label>
            
            <input type="number" id="stake" list="suggestedChipValues" name="stake" min="0" value="0" step="1">
          </div>
          <datalist id="suggestedChipValues">
            <option value="0.01">
            <option value="0.1">
            <option value="1">
            <option value="5">
            <option value="20">
            <option value="50">
            <option value="100">
          </datalist>
   
          <div class="options_notice" id="stakesMsg">The game is just for fun</div>
   
          <div class="overlay-input">
            <label for="observer_mode">Observer Mode:</label>
            <select name="observer">
              <option value="enable" >enable</option>
              <option value="disable" selected>disable</option>
            </select>
          </div>
          <!--input type="hidden" id="stake" name="stake" value="0"-->
      <div id="game-wizard-advanced-return-btn" class="game-wizard-advanced-return-btn button">accept</div>

    `;

    return options_html;
  }

  attachAdvancedOptionsEventListeners(){
    let blindModeInput = document.getElementById("blind_mode");
    let numChips = document.getElementById("num_chips");
    let blindDisplay = document.getElementById("blind_explainer");
    let crypto = document.getElementById("crypto");
    let stakeValue = document.getElementById("stake");
    let chipInput = document.getElementById("chip_wrapper");
    let chipDisplay = document.getElementById("stakesMsg");
    //let stake = document.getElementById("stake");

    const updateChips = function(){
      if(crypto && chipDisplay && numChips && stakeValue && chipInput /*&& stake*/){
        if (crypto.value == ""){
          chipDisplay.textContent = "The game is just for fun";
          chipInput.style.display = "none";
          stake.value = "0";
        }else{
          let nChips = parseInt(numChips.value);
          let stakeAmt = parseFloat(stakeValue.value);
          let jsMath = stakeAmt/nChips;

          chipDisplay.textContent = `You need ${stakeAmt} ${crypto.value} to play the game, with starting blinds of ${jsMath.toFixed(3)}/${(2*jsMath).toFixed(3)} ${crypto.value}`;
          chipInput.style.display = "block";
        }
      }
    };

    if (blindModeInput && blindDisplay){
      blindModeInput.onchange = function(){
        if (blindModeInput.value == "static"){
          blindDisplay.textContent = "Small blind is one chip, big blind is two chips throughout the game";
        }else{
          blindDisplay.textContent = "Small blind starts at one chip, and increments by 1 every 5 rounds";
        }
      }
    }

    if (crypto){
      crypto.onchange = updateChips;
    }
    if (stake){
      stake.onchange = updateChips;
    }
    if (numChips){
      numChips.onchange = updateChips;
    }
  }

  /*
    Only use the following options when creating the game invite TX
   */
  returnFormattedGameOptions(options) {
    let new_options = {};
    for (var index in options) {
      if (index == "crypto") {
        new_options[index] = options[index];
      }
      if (index == "chip") {
        new_options[index] = options[index];
      }
      if (index == "stake"){
        new_options[index] = options[index]; 
      }
      if (index == "num_chips") {
        new_options[index] = options[index];
      }
      if (index == "blind_mode") {
        new_options[index] = options[index];
      }
      if (index == "chip_graphics"){
        new_options[index] = options[index]; 
      }
    }
 
    return new_options;
  }

  returnShortGameOptionsArray(options) {
    let sgoa = super.returnShortGameOptionsArray(options);
    let ngoa = {};
    let useGraphics = false;
    let crypto = "";
    for (let i in sgoa) {
      if (sgoa[i] != "") {
        let okey = i;
        let oval = options[i];

        let output_me = 1;
        if (okey == "chip") {
          if (oval !== "0"){
            okey = "small blind";  
          }else{
            output_me = 0;
          }
        }
        if (okey == "blind_mode") {
          if (oval == "increase") {
            okey = "mode";
            oval = "tournament";
          } else {
            output_me = 0;
          }
        }
        if (okey == "num_chips"){
          okey = "chips";
        }
        if (okey == "chip_graphics"){
          if (oval == 1){
            useGraphics = true;
            okey = "show chips";
            oval = null;
          }
        }
        if (okey == "crypto"){
          output_me = 0;
          crypto = oval;
        }
        if (okey == "stake"){
          oval += crypto;
        }

        if (output_me == 1) {
          ngoa[okey] = oval;
        }
      }
    }

    //Only checked options are stored, but we want visual confirmation of not checked
    if (!useGraphics){
      ngoa["hide chips"] = null;
    }

    return ngoa;
  }

  updateStatus(str, hide_info = 0) {
    this.game.status = str;
    if (!this.browser_active){return;}
    if (this.lock_interface == 1) { return; }

     try {
        if (hide_info == 0) {
          this.playerbox.showInfo();
        } else {
          this.playerbox.hideInfo();
        }
        
        let status_obj = document.querySelector(".status");
        if (this.game.players.includes(this.app.wallet.returnPublicKey())) {
          status_obj.innerHTML = str;
        }
      
      } catch (err) { 
        console.log("ERR: " + err);
      }

  }

  returnStats(){
    let stats = {};
    for (let i = 0; i < this.game.players.length; i++){
      stats[this.game.players[i]] = {};
      stats[this.game.players[i]].handsPlayed = 0;
      stats[this.game.players[i]].handsWon = 0;
      stats[this.game.players[i]].handsFolded = 0;
    }
    return stats;
  }


  handleStatsMenu() {
    console.log(JSON.parse(JSON.stringify(this.game.stats)));
    
    let stats = ["handsPlayed", "handsWon","handsFolded"];
    let html = `
      <div class="rules-overlay" id="game-stats-overlay">
        <h1>Game Statistics:</h1>
        <table><thead><tr><th></th>
       `; 
    for (let p in this.game.stats){
      html += `<th>${this.getShortNames(p)}</th>`;
    }
    html += `</tr></thead><tbody>`;
    for (let s of stats){
      html += `<tr><th>${s}</th>`;
      for (let p in this.game.stats){
        html += `<td>${this.game.stats[p][s]}</td>`;
      }
      html += "</tr>";
    }
    html += "</tbody></table>";

    html+=`</div>`;

    this.overlay.show(this.app, this, html);
  }


 
}

module.exports = Poker;
