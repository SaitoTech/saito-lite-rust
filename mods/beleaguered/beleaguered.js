const OnePlayerGameTemplate = require("../../lib/templates/oneplayergametemplate");
const BeleagueredGameRulesTemplate = require("./lib/beleaguered-game-rules.template");

const CardStack = require("../../lib/saito/ui/game-cardstack/game-cardstack");

//////////////////
// CONSTRUCTOR  //
//////////////////
class Beleaguered extends OnePlayerGameTemplate {
  constructor(app) {
    super(app);

    this.name = "Beleaguered";
    this.gamename = "Beleaguered Castle";
    this.slug = "beleaguered";
    this.description = "Stack all cards by suit from aces to kings to win this game";
    this.categories = "Games Cardgame One-player";
    this.publisher_message =
      "developed by Pawel (twitter: @PawelPawlak14). Feel free to pm me with any suggestions/feedback";

    this.app = app;
    this.status = "Beta";
    this.stacks = ["l1", "m1", "r1", 
                  "l2", "m2", "r2", 
                  "l3", "m3", "r3", 
                  "l4", "m4", "r4"];
  }

  returnGameRulesHTML() {
    return BeleagueredGameRulesTemplate(this.app, this);
  }

  initializeGame(game_id) {

    if (!this.game.state) {
      console.log("******Generating the Game******");
      this.game.state = this.returnState();
      this.game.queue = [];
      this.game.queue.push("round");
    }

    this.game.queue.push("READY");


    if (this.browser_active) {
      $(".slot").css("min-height", $(".card").css("min-height"));
    }
  }

  newRound() {
    //Set up queue
    this.game.queue = [];
    this.game.queue.push("play");
    this.game.queue.push("DEAL\t1\t1\t48");
    this.game.queue.push("SHUFFLE\t1\t1");
    this.game.queue.push("DECK\t1\t" + JSON.stringify(this.returnDeck()));

    //Clear board
    this.game.board = {};

    for (let slot of this.stacks) {
      this.cardStacks[slot].clear();
    }
  }



  async render(app) {
    //console.trace("Initialize HTML");
    if (!this.browser_active) {
      return;
    }

    await super.render(app);

    //
    // ADD MENU
    //
    this.menu.addMenuOption("game-game", "Game");

    this.menu.addSubMenuOption("game-game", {
      text: "Start New Game",
      id: "game-new",
      class: "game-new",
      callback: function (app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.prependMove("lose");
        game_mod.endTurn();
      },
    });
    /*this.menu.addSubMenuOption("game-game", {
      text: "Play Mode",
      id: "game-play",
      class: "game-play",
      callback: function (app, game_mod) {
        game_mod.menu.showSubSubMenu("game-play");
      }
    });
    */

    this.menu.addSubMenuOption("game-game", {
      text: "How to Play",
      id: "game-intro",
      class: "game-intro",
      callback: function (app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.overlay.show(game_mod.returnGameRulesHTML());
      },
    });

    this.menu.addSubMenuOption("game-game", {
      text: "Stats",
      id: "game-stats",
      class: "game-stats",
      callback: function (app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.overlay.show(game_mod.returnStatsHTML());
      },
    });

    await this.menu.addChatMenu();
    this.menu.render();

    this.cardStacks = { };
    for (let slot of this.stacks){
      this.cardStacks[slot] = new CardStack(app, this, slot);
    }

    this.setUpStacks();

  }

  setUpStacks(){
    for (let i = 1; i <=4 ; i++){
      this.cardStacks["l"+i].orientation = "left";
      this.cardStacks["r"+i].orientation = "right";
      this.cardStacks["m"+i].orientation = "center";
    }
    
  }


  attachEventsToBoard(){

    const canMoveCard = (card, stack) => {
      let beleaguered_self = stack.mod;
      let suit = card[0];
      let number = parseInt(card.slice(1));

      //You can't select a card that doesn't exist
      if (card == "empty") {
        return false;
      }

      //You can't move cards from the center
      if (stack.name[0] == "m") {
        return false;
      }

      for (let st in beleaguered_self.game.board){

        //You can move any card to an empty space
        if (beleaguered_self.game.board[st].length == 0) {
          return true;
        }

        let top_card = beleaguered_self.game.board[st].slice(-1)[0];

        let top_suit = top_card[0];
        let top_number = parseInt(top_card.slice(1));

        if (st[0] == "m") {
          //Count up in the middle, suits must match
          if (suit == top_suit && number == top_number + 1) {
            return true;
          }
        } else {
          //Count down on the sides, suits can mismatch
          if (number + 1 == top_number) {
            return true;
          }
        }
      }
      return false;
    };

    const selectCard = (activated_card_stack, card_index) => {
      let game_self = activated_card_stack.mod;

      game_self.selected = activated_card_stack.cards[card_index];
      $(".gameboard").addClass("selected_state");

      for (let slot of game_self.stacks) {

        ////////////////////////
        // Move Card!
        ///////////////////////
        game_self.cardStacks[slot].applyFilter(canPlaceCard, (target_card_stack) => {
          //Update game's internal logic
          let card = game_self.game.board[activated_card_stack.name].pop();
          game_self.game.board[target_card_stack.name].push(card);

          //Update UI
          activated_card_stack.pop();
          target_card_stack.push(card);
    
          game_self.prependMove(`move\t${card}\t${activated_card_stack.name}\t${target_card_stack.name}`);

          activateCards();
        });
      }

      //Clicking on the same stack will unselect the card
      activated_card_stack.applyFilter(()=>{ return true; }, returnCard);
      activated_card_stack.markSelected(card_index);

    };

    const canPlaceCard = (card, stack) => {
      let beleaguered_self = stack.mod;
      let moving_card = beleaguered_self.selected;
      let moving_card_suit = moving_card[0];
      let moving_card_number = parseInt(moving_card.slice(1));

      //console.log(`Can move ${beleaguered_self.selected} to ${card} on stack ${stack.name}?`);

      let suit = card[0];
      let number = parseInt(card.slice(1));
  
      //Can always place on an empty slot
      if (card === "empty") {
        return true;
      }

      if (stack.name[0] == "m") {
        if (moving_card_suit === suit && number + 1 === moving_card_number ) {
          return true;
        }
      } else {
        if ( moving_card_number + 1 == number ){
          return true;
        }
      }

      return false;

    };

    const returnCard = () => {
      console.log("Return Card");
      activateCards();
    };

    const activateCards = async () => {
      //Check for victory
      if (this.game.board["m1"].length + this.game.board["m2"].length + this.game.board["m3"].length + this.game.board["m4"].length == 52) {
        let c = await sconfirm("You win! Start new Game?");
        if (c) {
          this.prependMove("win");
          this.endTurn();
        }
        this.updateStatus("Game Over");
        return;
      }

      //
      // Activate events always starts without a selected card
      // 
      let success = 0;
      $(".gameboard").removeClass("selected_state");
      this.selected = "";
      for (let slot of this.stacks) {
        success += this.cardStacks[slot].applyFilter(canMoveCard, selectCard);
      }

      if (!success) {
        let c = await sconfirm("No more moves. Start new Game?")
        if (c) {
          this.prependMove("lose");
          this.endTurn();
        }
        this.updateStatus("Game Over");
        return;
      }

      this.displayUserInterface();
    }


    activateCards();

  }


  /* Copy hand into board*/
  handToBoard() {

    if (!("board" in this.game) || Object.keys(this.game.board).length != this.stacks.length) {
      this.game.board = {};
      for (let slot of this.stacks) {
        this.game.board[slot] = [];
      }  

      let indexCt = 0;
      this.game.board["m1"] = ["C1"];
      this.game.board["m2"] = ["D1"];
      this.game.board["m3"] = ["H1"];
      this.game.board["m4"] = ["S1"];

      for (let j = 0; j < 6; j++) {
        for (let i = 1; i <= 4; i++) {
          let card = this.game.deck[0].cards[this.game.deck[0].hand[indexCt++]];
          this.game.board[`l${i}`].push(card);
          card = this.game.deck[0].cards[this.game.deck[0].hand[indexCt++]];
          this.game.board[`r${i}`].push(card);
        }
      }
    }

    console.log(JSON.parse(JSON.stringify(this.game.board)));
    console.log(JSON.parse(JSON.stringify(this.stacks)));
    
    for (let slot of this.stacks) {
      if (!this.cardStacks[slot].initialized){
        for (let card of this.game.board[slot]){
          this.cardStacks[slot].push(card);
        }
        this.cardStacks[slot].initialized = true;
      }else {
        console.log("********************");
        console.log("Oh no, the cardstack is already initialize");
        console.log("********************");
      }
    }

    this.selected = "";
    this.game.previousMoves = [];
  }

  parseIndex(slot) {
    let coords = slot.split("_");
    let x = coords[0].replace("row", "");
    let y = coords[1].replace("slot", "");
    return 10 * (parseInt(x) - 1) + parseInt(y) - 1;
  }

  async handleGameLoop(msg = null) {
    this.saveGame(this.game.id);
    ///////////
    // QUEUE //
    ///////////
    if (this.game.queue.length > 0) {
      let qe = this.game.queue.length - 1;
      let mv = this.game.queue[qe].split("\t");
      let shd_continue = 1;

      if (mv[0] === "round") {
        this.newRound();
      }

      if (mv[0] === "win") {
        this.game.state.session.round++;
        this.game.state.session.wins++;
        this.game.queue.push("round");
        this.game.queue.push(
          `ROUNDOVER\t${JSON.stringify([this.publicKey])}\t${JSON.stringify(
            []
          )}`
        );
      }

      if (mv[0] === "lose") {
        this.game.state.session.round++;
        this.game.state.session.losses++;
        this.game.queue.push("round");
        this.game.queue.push(
          `ROUNDOVER\t${JSON.stringify([])}\t${JSON.stringify([
            this.publicKey
          ])}`
        );
      }

      if (mv[0] === "play") {
        //this.game.queue.splice(qe, 1);
        if (this.browser_active) {
          this.handToBoard();
          this.displayBoard();
          this.displayUserInterface();
        }
        return 0;
      }

      if (mv[0] === "move") {
        this.game.queue.splice(qe, 1);
      }
    }
    return 1;
  }

  displayBoard() {
    if (this.browser_active == 0) {
      return;
    }
    for (let i of this.stacks) {
      this.cardStacks[i].render();
    }

    this.attachEventsToBoard();
  }


  /*
  no status atm, but this is to update the hud
  */
  displayUserInterface() {
    let html =
      `<div>Place all cards ascending by number on their suit stacks to win the game.</div>
      <div>Cards can be moved around on higher cards on the side stacks regardless of their suit. 
      Any card can be placed on the empty side stack.</div>
      <div class="controls">`;

    if (this.moves.length > 0){
      html += `<div class="undo_last status_option">Undo</div>`;
    }
    html += `<div class="auto_solve status_option">Auto Complete</div></div>`;

    this.updateStatus(html);

    $(".undo_last").on("click", () => {
      this.undoMove();
    });

    $(".auto_solve").on("click", async () => {
      let success = await this.autoPlay();
      if (!success){
        $(".auto_solve").text("No cards can castle");
        $(".auto_solve").off();
      }else{
        this.displayBoard();
      }
    });
  }


  undoMove(){
    if (this.moves.length == 0) {
      return;
    }

    let mv = this.moves.shift().split("\t");

    if (mv[0] == "move"){
      this.game.board[mv[3]].pop();
      this.cardStacks[mv[3]].pop();

      this.game.board[mv[2]].push(mv[1]);
      this.cardStacks[mv[2]].push(mv[1]);
      
      this.displayBoard();
    }
  }

  async autoPlay(){
    let source_stack = "";
    let target_stack = "";
    let target_card = "";

    for (let i = 1; i <= 4; i++) {
      target_stack = `m${i}`;
      let top_card = this.game.board[target_stack].slice(-1)[0];
      target_card = top_card[0] + (parseInt(top_card.slice(1)) + 1);

      for (let slot of this.stacks){
        if (this.game.board[slot].length > 0){
          let available_card = this.game.board[slot].slice(-1)[0];
          if (available_card == target_card){
            source_stack = slot;
            break;
          }
        }
      }

      if (source_stack){
        break;
      }
    }

    if (source_stack){
      this.game.board[source_stack].pop();
      this.cardStacks[source_stack].pop();

      this.game.board[target_stack].push(target_card);
      this.cardStacks[target_stack].push(target_card);

      this.prependMove(`move\t${target_card}\t${source_stack}\t${target_stack}`);

      //Recurse as long as we make a move
      await this.autoPlay();
      return true;
    }
    return false;
  }

  returnCardImageHTML(name) {
    // return '<img src="/beleaguered/img/cards/C1.png"/>'
    if (name[0] == "E") {
      return "";
    } else {
      return '<img src="/beleaguered/img/cards/' + name + '.png" />';
    }
  }

  returnDeck() {
    let suits = ["S", "C", "H", "D"];
    var deck = {};
    for (let i = 0; i < 4; i++)
      for (let j = 2; j <= 13; j++) {
        let name = suits[i] + j;
        deck[name] = name;
      }

    return deck;
  }

  returnCardSuite(slot) {
    let card = this.game.board[slot];
    return card[0];
  }

  returnCardNumber(slot) {
    let card = this.game.board[slot];
    if (card[0] === "E")
      //empty slot
      return 0;
    return card.substring(1);
  }
}

module.exports = Beleaguered;

