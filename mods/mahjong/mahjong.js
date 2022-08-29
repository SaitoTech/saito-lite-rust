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

  }

  //
  // 
  //
  displayBoard() {
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

    let deck = {};

    deck['001'] = { name : "001" };
    deck['002'] = { name : "002" };
    deck['003'] = { name : "003" };
    deck['004'] = { name : "004" };
    deck['005'] = { name : "005" };
    deck['006'] = { name : "006" };
    deck['007'] = { name : "007" };
    deck['008'] = { name : "008" };
    deck['009'] = { name : "009" };
    deck['010'] = { name : "010" };
    deck['011'] = { name : "011" };
    deck['012'] = { name : "012" };
    deck['013'] = { name : "013" };
    deck['014'] = { name : "014" };
    deck['015'] = { name : "015" };
    deck['016'] = { name : "016" };
    deck['017'] = { name : "017" };
    deck['018'] = { name : "018" };
    deck['019'] = { name : "019" };
    deck['020'] = { name : "020" };
    deck['021'] = { name : "021" };
    deck['022'] = { name : "022" };
    deck['023'] = { name : "023" };
    deck['024'] = { name : "024" };
    deck['025'] = { name : "025" };
    deck['026'] = { name : "026" };
    deck['027'] = { name : "027" };
    deck['028'] = { name : "028" };
    deck['029'] = { name : "029" };
    deck['030'] = { name : "030" };

    return deck;

  }


}

module.exports = Mahjong;

