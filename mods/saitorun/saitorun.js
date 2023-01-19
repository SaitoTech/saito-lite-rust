var saito = require('../../lib/saito/saito');
var GameTemplate = require('../../lib/templates/gametemplate');
const SaitoRunRulesTemplate = require("./lib/saitorun-rules.template");

//////////////////
// CONSTRUCTOR  //
//////////////////
class SaitoRun extends GameTemplate {

  constructor(app) {

    super(app);

    this.name            = "SaitoRun";
    this.gamename        = "SaitoRun";
    this.slug            = "saitorun";
    this.description     = 'Collect cubes and navigate through obstacles to get highest possible score!';
    this.categories      = "Games Cardgame one-player";
    this.request_no_interrupts = true; // don't popup chat
    this.maxPlayers      = 1;
    this.minPlayers      = 1;
    this.app = app;
  }


  // Create an exp league by default
  respondTo(type){
    if (type == "default-league") {
      let obj = super.respondTo(type);
      obj.type = "exp";
      return obj;
    }
    return super.respondTo(type);
  }


  initializeGame(game_id) {
    console.log("SET WITH GAMEID: " + game_id);

    if (!this.game.state) {
      console.log("******Generating the Game******");
      this.game.state = this.returnState();
      this.game.queue = [];
      this.game.queue.push("round");
      this.game.queue.push("READY");
    }
    
    console.log(JSON.parse(JSON.stringify(this.game)));

    if (this.browser_active){
      $('.slot').css('min-height', $('.card').css('min-height'));  
    }
  }

  newRound(){

    //Set up queue
    this.game.queue = [];
    this.game.queue.push("play");

    //Clear board
    this.game.board = {};

    //Reset/Increment State
    this.game.state.round++;
    this.game.state.recycles_remaining = 2;
  }


  initializeHTML(app) {

    console.trace("Initialize HTML");

    if (!this.browser_active) { return; }
    
    super.initializeHTML(app);

    //
    // ADD MENU
    //
    this.menu.addMenuOption("game-game", "Game");


    this.menu.addSubMenuOption("game-game", {
        text : "Screenshot",
        id : "game-post",
        class : "game-post",
        callback : async function(app, game_mod) {
	  alert("Sorry, not available!");
        },
    });


    this.menu.addChatMenu();
    this.menu.render();

  }


  returnState() {

    let state = {};

    state.round = 0;
    state.wins = 0;

    return state;

  }

  handleGameLoop(msg=null) {

    this.saveGame(this.game.id);
    ///////////
    // QUEUE //
    ///////////
    if (this.game.queue.length > 0) {

      let qe = this.game.queue.length-1;
      let mv = this.game.queue[qe].split("\t");
      let shd_continue = 1;

      console.log(JSON.stringify(mv));


      if (mv[0] === "play") {
        return 0;
      }

      //
      // avoid infinite loops
      //
      if (shd_continue == 0) { 
        console.log("NOT CONTINUING");
        return 0; 
      }

    } 
    return 1;
  }

}

module.exports = SaitoRun;