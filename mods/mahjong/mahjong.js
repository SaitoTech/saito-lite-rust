const OnePlayerGameTemplate = require('../../lib/templates/oneplayergametemplate');
const MahjongGameRulesTemplate = require('./lib/mahjong-game-rules.template');

//////////////////
// CONSTRUCTOR  //
//////////////////
class Mahjong extends OnePlayerGameTemplate {

  constructor(app) {
    super(app);

    this.name            = "Mahjong";
    this.gamename        = "Mahjong";
    this.game_length     = 10; //Estimated number of minutes to complete a game
    this.description     = `Remove matching mahjong tiles in pairs until the board is clear or you lose`;
    this.categories      = "Games Cardgame One-player";
    this.publisher_message = "developed by Pawel (twitter: @PawelPawlak14). Feel free to pm me with any suggestions/feedback";

    this.status          = "Beta";
    this.app = app;

  }


  returnGameRulesHTML(){
    return MahjongGameRulesTemplate(this.app, this);
  }

  //
  // runs the first time the game is created / initialized
  //
  initializeGame(game_id) {

    console.log("GAMEID: " + game_id);

    //
    // to persist data between games, such as board state, write it to 
    // the game.state object. if this object does not exist, that tells
    // us this is the first time we have initialized this game.
    //
    if (!this.game.state) {

      this.game.state = this.returnState();
      this.newRound();
    }
    
    this.saveGame(this.game.id);

    if (this.browser_active){
      $('.slot').css('min-height', $('.card').css('min-height'));  
    }

  }

  newRound(){
    //Set up queue
    this.game.queue = ["READY"];

    //Clear board
    this.game.board = {};

    //Reset/Increment State
    this.displayBoard();
  }

  isArrayInArray(arr, item){
    var item_as_string = JSON.stringify(item);
  
    var contains = arr.some(function(ele){
      return JSON.stringify(ele) === item_as_string;
    });
    return contains;
  }

  firstColumn = 1;
  lastColumn = 14;

  emptyCells = [
    // bottom layer
    [1,1], [1,14],
    [2,1], [2,2], [2,3], [2,12], [2,13], [2,14],
    [3,1], [3,2], [3,13], [3,14],
    [4,14],
    [5,1], 
    [6,1], [6,2], [6,13], [6,14],
    [7,1], [7,2], [7,3], [7,12], [7,13], [7,14],
    [8,1], [8,14],
    // 2nd layer
    [9,1], [9,2], [9,3], [9,4], [9,11], [9,12], [9,13], [9,14],
    [10,1], [10,2], [10,3], [10,4], [10,11], [10,12], [10,13], [10,14],
    [11,1], [11,2], [11,3], [11,4], [11,11], [11,12], [11,13], [11,14],
    [12,1], [12,2], [12,3], [12,4], [12,11], [12,12], [12,13], [12,14],
    [13,1], [13,2], [13,3], [13,4], [13,11], [13,12], [13,13], [13,14],
    [14,1], [14,2], [14,3], [14,4], [14,11], [14,12], [14,13], [14,14],
    // 3rd layer
    [15,1], [15,2], [15,3], [15,4], [15,5], [15,10], [15,11], [15,12], [15,13], [15,14],
    [16,1], [16,2], [16,3], [16,4], [16,5], [16,10], [16,11], [16,12], [16,13], [16,14],
    [17,1], [17,2], [17,3], [17,4], [17,5], [17,10], [17,11], [17,12], [17,13], [17,14],
    [18,1], [18,2], [18,3], [18,4], [18,5], [18,10], [18,11], [18,12], [18,13], [18,14],
    // 4th layer
    [19,1], [19,2], [19,3], [19,4], [19,5], [19,6], [19,9], [19,10], [19,11], [19,12], [19,13], [19,14],
    [20,1], [20,2], [20,3], [20,4], [20,5], [20,6], [20,9], [20,10], [20,11], [20,12], [20,13], [20,14],
    //5th layer (top)
    [21,1], [21,2], [21,3], [21,4], [21,5], [21,6], [21,9], [21,10], [21,11], [21,12], [21,13], [21,14],
  ];

  // displayBoard
  async displayBoard(timeInterval = 1) {
    let index = 0;

    let deckSize = 0;

    this.game.availableMoves = [];
    if (!('board' in this.game) || Object.values(this.game.board).length === 0) {
      this.game.deck.cards = this.returnDeck();
      this.game.board = {}
      deckSize = Object.values(this.game.deck.cards).length;
      this.game.hidden = [];
      for (let row = 1; row <= 21; row++){
        for (let column = 1; column <= 14; column++){
          let position = `row${row}_slot${column}`;
          this.makeInvisible(position);
          if (!this.isArrayInArray(this.emptyCells, [row,column]) && deckSize > index) {
            this.game.board[position] = Object.values(this.game.deck.cards)[index];
            index++;
          } else {
            this.game.board[position] = "E";
          }
        }
      }
    } else {
      deckSize = Object.values(this.returnDeck()).length;
      for (let row = 1; row <= 21; row++){
        for (let column = 1; column <= 14; column++){
          let position = `row${row}_slot${column}`;
          this.makeInvisible(position);
        }
      }
    }

    this.game.cardsLeft = deckSize - this.game.hidden.length;
    this.game.selected = "";
    $(".selected").removeClass("selected");

    index = 0;
    try {
      //Want to add a timed delay for animated effect
      const timeout = ms => new Promise(res => setTimeout(res, ms));
      for (let row = 1; row <= 21; row++){
        for (let column = 1; column <= 14; column++){
          var divname = `row${row}_slot${column}`;
          if (!this.isArrayInArray(this.emptyCells, [row,column]) && deckSize > index) {
            await timeout(timeInterval);
            $('#' + divname).html(this.returnCardImageHTML(this.game.board[divname]));
            this.makeVisible(divname);
            if (this.game.hidden.includes(divname)) {
              this.makeInvisible(divname);
            }
          }
        }
      }
      this.attachEventsToBoard();
      this.displayUserInterface();
    } catch (err) {
      console.log(err);
    }


  }

 
  makeInvisible(divname) {
    //let noShadowBox = 'none';
    //this.applyShadowBox(divname, noShadowBox);
    $(`#${divname}`).addClass("invisible");
    $(`#${divname}`).removeClass("selected");
  }

  makeVisible(divname) {
    $(`#${divname}`).removeClass("invisible");
    //let boxShadow = '12px 10px 12px 1px #000000';
    //this.applyShadowBox(divname, boxShadow);
  }


  toggleCard(divname) {
    $(`#${divname}`).addClass("selected");
  }

  toggleInvalidCard(divname) {
    let mahjong_self = this;
    
    $(`#${divname}`).addClass("invalid");
    $(`#${mahjong_self.game.selected}`).addClass("invalid");
    $(".selected").removeClass("selected");

    let last = mahjong_self.game.selected;

    setTimeout(() => {
      $(".invalid").removeClass("invalid");
      mahjong_self.untoggleCard(divname);
      mahjong_self.untoggleCard(last);
      mahjong_self.game.selected = "";
    }, 900);

  }

  untoggleCard(divname) {

    $(`#${divname}`).removeClass("selected");
  }

  /*applyShadowBox(divname, property) {
    let boxShadowProperties = ['box-shadow', '-moz-box-shadow', '-webkit-box-shadow', '-o-box-shadow'];
    for (let i = 0; i < boxShadowProperties.length; i++) {
      $(`#${divname}`).css(boxShadowProperties[i],property);
    }
  }*/

  returnCardImageHTML(name) {
    if (name[0] === 'E') { return ""; }
    else { return '<img src="/mahjong/img/tiles/white/'+name+'.png" />'; }
  }

  returnBackgroundImageHtml() {
    return '<img src="/mahjong/img/tiles/Export/Regular/Front.png" />';
  }

  //
  // runs whenever we load the game into the browser. render()
  //
  initializeHTML(app) {
    if (!this.browser_active) { return; }
    
    super.initializeHTML(app);

    this.menu.addMenuOption("game-game", "Game");
    this.menu.addMenuOption("game-info", "Info");

    this.menu.addSubMenuOption("game-game",{
      text : "Start New Game",
      id : "game-new",
      class : "game-new",
      callback : function(app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.prependMove("lose");
        game_mod.endTurn();
      }
    });
    this.menu.addSubMenuOption("game-info", {
      text : "How to Play",
      id : "game-intro",
      class : "game-intro",
      callback : function(app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.overlay.show(game_mod.returnGameRulesHTML());
      }
    });
    this.menu.addSubMenuOption("game-info", {
      text : "Stats",
      id : "game-stats",
      class : "game-stats",
      callback : function(app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.overlay.show(game_mod.returnStatsHTML());
      }
    });

    this.menu.addChatMenu();

    //
    // render menu
    //
    this.menu.render();

    //
    // display the board?
    //
    this.displayBoard();

    if (app.browser.isMobileBrowser(navigator.userAgent)) {
      this.hammer.render(this.app, this);
      this.hammer.attachEvents(this.app, this, "#mahj-rowbox");
    }else{
      this.sizer.render();
      this.sizer.attachEvents("#mahj-rowbox");
    }
  }


  attachEventsToBoard() {

    let mahjong_self = this;

    $('.slot').off();
    $('.slot').on('click', function() {

      let card = $(this).attr("id");
      if(!mahjong_self.game.availableMoves.includes(card)) {
        return;
      }

      if (mahjong_self.game.selected === card) { //Selecting same card again
        mahjong_self.untoggleCard(card);
        mahjong_self.game.selected = "";
        return;
      } else {
        if (mahjong_self.game.selected === "") { // New Card
          mahjong_self.game.selected = card;
          mahjong_self.toggleCard(card);
          return;
        } else {
          if (mahjong_self.game.board[card] === mahjong_self.game.board[mahjong_self.game.selected]) {
            mahjong_self.makeInvisible(card);
            mahjong_self.makeInvisible(mahjong_self.game.selected);
            mahjong_self.game.hidden.push(card);
            mahjong_self.game.hidden.push(mahjong_self.game.selected);
            mahjong_self.game.cardsLeft = mahjong_self.game.cardsLeft - 2;
            if (mahjong_self.game.cardsLeft === 0) {
              mahjong_self.prependMove("win");
              mahjong_self.endTurn();
              return;              
            }
            mahjong_self.displayUserInterface();
            mahjong_self.game.selected = "";
            return;
          } else { // no match
            mahjong_self.toggleInvalidCard(card);
            return;
          }
        }
      }
    });

  }

  getAvailableTiles() {
    let availableTiles = new Map([]);
    this.game.availableMoves = [];
    $(".slot").removeClass("available");
    for (let row = 1; row <= 21; row++){
      for (let column = 1; column <= 14; column++){
        if ((row === 5 && column === 2 && !this.game.hidden.includes('row4_slot1')) || 
          (row === 4 && column === 13 && !this.game.hidden.includes('row5_slot14'))) {
            continue;
        }
        if (row >= 2 && row <= 7 && column >= 5 && column <= 10) {
          if (!this.game.hidden.includes(`row${row + 7}_slot${column}`)) {
            continue;
          }
        }
        if (row >= 10 && row <= 13 && column >= 6 && column <= 9) {
          if (!this.game.hidden.includes(`row${row + 5}_slot${column}`)) {
            continue;
          }
        }
        if (row >= 16 && row <= 17 && column >= 7 && column <= 8) {
          if (!this.game.hidden.includes(`row${row + 3}_slot${column}`)) {
            continue;
          }
        }
        if (row >= 19 && row <= 20 && column >= 7 && column <= 8) {
          if (!this.game.hidden.includes(`row21_slot${column}`)) {
            continue;
          }
        }
        if ( // \/ checking if right or left tile is unlocked or empty
          ((this.game.hidden.includes(`row${row}_slot${column - 1}`) || 
          this.game.board[`row${row}_slot${column - 1}`] === "E" ||
          this.game.hidden.includes(`row${row}_slot${column + 1}`) || 
          this.game.board[`row${row}_slot${column + 1}`] === "E") && 
          this.game.board[`row${row}_slot${column}`] !== "E" && 
          !this.game.hidden.includes(`row${row}_slot${column}`)) ||
          // /\ checking if right or left tile is unlocked or empty
          // \/ checking two outermost rows
            (row === 4 && column === 1 && !this.game.hidden.includes('row4_slot1')) ||
            (row === 5 && column === 14 && !this.game.hidden.includes('row5_slot14'))
          ) { // /\ checking two outermost rows
            if (availableTiles.get(this.game.board[`row${row}_slot${column}`]) !== undefined) {
              availableTiles.set(this.game.board[`row${row}_slot${column}`], availableTiles.get(this.game.board[`row${row}_slot${column}`]) + 1);
            } else {
              availableTiles.set(this.game.board[`row${row}_slot${column}`], 1);
            }
            this.game.availableMoves.push(`row${row}_slot${column}`)
            $(`#row${row}_slot${column}`).addClass("available");
        }
      }
    }

    let hints = [];
    for (let i = 0; i < this.game.availableMoves.length - 1; i++){
      for (let j = i + 1; j < this.game.availableMoves.length; j++){
        if (this.game.board[this.game.availableMoves[i]] === this.game.board[this.game.availableMoves[j]]){
          hints.push([this.game.availableMoves[i], this.game.availableMoves[j]]);
        }
      }
    }

    return hints;
  }

  async displayUserInterface() {
    let tilesLeftToUnlock = this.getAvailableTiles();

    if (!tilesLeftToUnlock || tilesLeftToUnlock.length == 0) {
      let c = await sconfirm("There are no more available moves to make, start new game?");
      if (c){
        this.prependMove("lose");
        this.endTurn();
        return;
      }
    }
    let mahjong_self = this;

    let html = `<div class="hidable">Remove tiles in pairs until none remain. Tiles must be at the edge of their level to be removed.</div>
                <div id="hint" class="tip">Available tile pairs to unlock: <span class="hint_btn">${tilesLeftToUnlock.length}</span>
                  <div class="tiptext">Click for a hint</div>
                </div>`;

    let option = '';
    if (this.game.hidden.length > 0){
      option += `<ul><li class="menu_option" id="undo">Undo`;
      option += "</li></ul>";
    }    
    
    this.updateStatusWithOptions(html,option); 

    $('.menu_option').off();
    $('.menu_option').on('click', function() {
      let action = $(this).attr("id");
      if (action === "undo"){
        mahjong_self.undoMove();
        return;
      }
    });


    $("#hint").off();
    

    $("#hint").on("click", function(){
      if (tilesLeftToUnlock.length > 0){
        let pair = tilesLeftToUnlock.pop();
        $(`#${pair[0]}, #${pair[1]}`).addClass("hint").delay(500)
        .queue(function () {
          $(this).removeClass("hint").dequeue();
        })
        .delay(400)
        .queue(function () {
          $(this).addClass("hint").dequeue();
        })
        .delay(500)
        .queue(function () {
          $(this).removeClass("hint").dequeue();
        })
        .delay(400)
        .queue(function () {
          $(this).addClass("hint").dequeue();
        })
        .delay(500)
        .queue(function () {
          $(this).removeClass("hint").dequeue();
        });

        tilesLeftToUnlock.unshift(pair);
      }
    });

  }

  undoMove() {
    if (this.game.selected !== "") {
      this.untoggleCard(this.game.selected);
      this.game.selected = "";
    }
    this.makeVisible(this.game.hidden.pop());
    this.makeVisible(this.game.hidden.pop());

    this.game.cardsLeft += 2;
    this.displayUserInterface();
  }

  ////////////////////
  // VERY IMPORTANT //
  ////////////////////
  //
  // this is the main function for queue-based games. cryptographic logic
  // and shared commands (DEAL, SHUFFLE, etc.) are powered by the underlying
  // game engine, which kicks instructions here if it doesn't recognize them.
  //
  // the convention is for game-level instructions to be lowercase and game-
  // engine commands to be UPPERCASE so as to easily.
  //
  // return 0 -- halts execution
  // return 1 -- continues execution
  //
  // clear the queue manually and return 1 if there is no user-input at this
  // point in the game. if there is user-input, return 0 and the QUEUE will 
  // being to execute again the next time a move is received over the network.
  //
  handleGameLoop(msg=null) {
    ///////////
    // QUEUE //
    ///////////
    if (this.game.queue.length > 0) {

      let qe = this.game.queue.length-1;
      let mv = this.game.queue[qe].split("\t");

      if (mv[0] === "lose"){
        this.game.queue.splice(qe, 1);
        this.newRound();
        this.game.state.session.round++;
        this.game.state.session.losses++;
        this.game.queue.push(`ROUNDOVER\t${JSON.stringify([])}\troundover\t${JSON.stringify([this.app.wallet.returnPublicKey()])}`);

        return 1;
      }

      if (mv[0] === "win"){
        this.game.queue.splice(qe, 1);
        this.game.state.session.round++;
        this.game.state.session.wins++;
        this.displayModal("Congratulations!", "You solved the puzzle!");
        this.newRound();
        this.game.queue.push(`ROUNDOVER\t${JSON.stringify([this.app.wallet.returnPublicKey()])}\troundover\t${JSON.stringify([])}`);

        return 1;
      }


      return 0;

    } 

    //
    // nothing in queue, return 0 and halt
    //
    return 0; 

  }


  returnDeck() {

    let cards = [
      "Chun",
      "Hatsu",
      "Man1",
      "Man2",
      "Man3",
      "Man4",
      "Man5-Dora",
      "Man5",
      "Man6",
      "Man7",
      "Man8",
      "Man9",
      "Nan",
      "Pei",
      "Pin1",
      "Pin2",
      "Pin3",
      "Pin4",
      "Pin5-Dora",
      "Pin5",
      "Pin6",
      "Pin7",
      "Pin8",
      "Pin9",
      "Shaa",
      "Sou1",
      "Sou2",
      "Sou3",
      "Sou4",
      "Sou5-Dora",
      "Sou5",
      "Sou6",
      "Sou7",
      "Sou8",
      "Sou9",
      "Ton"
    ];

    // TODO - remove (use for testing)

    // let cards = [
    //   "Chun",
    //   "Hatsu"
    // ];

    let deck = {};
    
    for (let j=0; j<4; j++){
      cards.sort(() => Math.random() - 0.5);
      for (let i = 0; i<cards.length; i++) {
        let name = cards[i];
        deck[`${name}_${j}`] = name;
      }
    }

    return deck;

  }


}

module.exports = Mahjong;

