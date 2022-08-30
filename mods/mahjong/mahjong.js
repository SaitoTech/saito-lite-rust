var saito = require('../../lib/saito/saito');
var GameTemplate = require('../../lib/templates/gametemplate');


//////////////////
// CONSTRUCTOR  //
//////////////////
class Mahjong extends GameTemplate {

  constructor(app) {

    super(app);

    this.name            = "Mahjong";

    this.description     = 'Two deck solitaire card game that traps you in a web of addiction';
    this.categories       = "Games Cardgame one-player";

    this.maxPlayers      = 1;
    this.minPlayers      = 1;
    this.status          = "Beta";

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

      //
      // we can pop moves onto the queue and execute them one-by-one. this
      // is more useful in 2P++ games. all games keep their QUEUE in order
      // using the structured inputs provided by the network.
      //
      this.game.queue.push("play");
      this.game.queue.push("READY");
      this.game.queue.push("DEAL\t1\t1\t10");
      this.game.queue.push("SHUFFLE\t1\t1");
      this.game.queue.push("DECK\t1\t"+JSON.stringify(this.returnDeck()));

    }
    
    this.saveGame(this.game.id);

    if (this.browser_active){
      $('.slot').css('min-height', $('.card').css('min-height'));  
    }

  }

  isArrayInArray(arr, item){
    var item_as_string = JSON.stringify(item);
  
    var contains = arr.some(function(ele){
      return JSON.stringify(ele) === item_as_string;
    });
    return contains;
  }

  // displayBoard
  async displayBoard(timeInterval = 5) {
    var emptyCells = [
      [1,1], [1,14],
      [2,1], [2,2], [2,3], [2,12], [2,13], [2,14],
      [3,1], [3,2], [3,13], [3,14],
      [5,1], [5,14],
      [6,1], [6,2], [6,13], [6,14],
      [7,1], [7,2], [7,3], [7,12], [7,13], [7,14],
      [8,1], [8,14]
    ];

    let index = 0;
    this.game.board = {}
    console.log("display board");
    console.log(Object.values(this.game.deck[0].cards));
    for (let i = 1; i <= 8; i++){
      for (let j = 1; j <= 14; j++){
        if (!this.isArrayInArray(emptyCells, [i,j])) {
          let position = `row${i}_slot${j}`;
          this.game.board[position] = Object.values(this.game.deck[0].cards)[index];
          index++;
        }
      }
    }
    console.log(this.game);
    if (this.browser_active == 0) { return; }
    $(".slot").removeClass("empty");
    index = 0;
    try {
      //Want to add a timed delay for animated effect
      const timeout = ms => new Promise(res => setTimeout(res, ms));
      for (let i = 1; i <= 8; i++){
        for (let j = 1; j <= 14; j++){
          if (!this.isArrayInArray(emptyCells, [i,j])) {
            let divname = `row${i}_slot${j}`;
            await timeout(timeInterval);
            $('#' + divname).html(this.returnCardImageHTML(Object.values(this.game.deck[0].cards)[index++]));
          }
        }
      }
    } catch (err) {
      console.log(err);
      console.log(this.game);
    }
  }

  returnCardImageHTML(name) {
    if (name[0] == 'E') { return ""; }
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


    //
    // Want Menus ?
    //
    this.menu.addMenuOption({
      text : "Game",
      id : "game-game",
      class : "game-game",
      callback : function(app, game_mod) {
        game_mod.menu.showSubMenu("game-game");
      }
    });
    this.menu.addSubMenuOption("game-game",{
      text : "Start New Game",
      id : "game-new",
      class : "game-new",
      callback : function(app, game_mod) {
      alert("New Game");
      }
    });
    this.menu.addSubMenuOption("game-game", {
      text : "Exit",
      id : "game-exit",
      class : "game-exit",
      callback : function(app, game_mod) {
        game_mod.updateStatusWithOptions("Saving game to the blockchain...");
        game_mod.prependMove("exit_game\t"+game_mod.game.player);
        game_mod.endTurn();
      }
    });

    //
    // fullscren toggle?
    //
    this.menu.addMenuIcon({
      text : '<i class="fa fa-window-maximize" aria-hidden="true"></i>',
      id : "game-menu-fullscreen",
      callback : function(app, game_mod) {
        game_mod.menu.hideSubMenus();
        app.browser.requestFullscreen();
      }
    });

    //
    // chat menu?
    //
    this.menu.addChatMenu(app, this);

    //
    // render menu
    //
    this.menu.render(app, this);
    this.menu.attachEvents(app, this);

    //
    // sidebar log
    //
    this.log.render(this.app, this);
    this.log.attachEvents(this.app, this);



    //
    // display the board?
    //
    this.displayBoard();

  }

  returnState() {

    let state = {};
    return state;

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

    let mahjong_self = this;

    ///////////
    // QUEUE //
    ///////////
    if (this.game.queue.length > 0) {

      let qe = this.game.queue.length-1;
      let mv = this.game.queue[qe].split("\t");
      let shd_continue = 1;

      if (mv[0] === "play"){

        //
        // perhaps wait until game is being viewed to execute?
        //
        if (!this.browser_active) { return 0; }

        console.log("OUR CARDS: ");
        console.log(JSON.stringify(this.game.deck[0].hand));
        alert("play handleGameLoop() -- why not replace this with an init function?");

        this.updateLog("add notes to log");
        this.updateStatus("display in status message box");

        this.game.queue.splice(qe, 1);
        return 1;

      }

      return 1;

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

    let deck = {};

    for (let i = 0; i<cards.length; i++) {
      for (let j=0; j<4; j++){
        let name = cards[i];
        deck[`${name}_${j}`] = name;
      }
    }

    return deck;

  }


}

module.exports = Mahjong;

