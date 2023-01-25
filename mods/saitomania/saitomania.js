var saito = require('./../../lib/saito/saito');
var GameTemplate = require('./../../lib/templates/gametemplate');
const SaitoManiaGameOptionsTemplate = require("./lib/saitomania-game-options.template");


//////////////////
// CONSTRUCTOR  //
//////////////////
class SaitoMania extends GameTemplate {

  constructor(app) {

    super(app);

    this.name            = "SaitoMania";
    this.gamename        = "Saito Mania";
    this.slug            = "saitomania";
    this.description     = 'Blast shitcoins, pick up superpowers, destroy rocks to collect Saito and learn about the Saito project while playing ;)';
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

    if (!this.browser_active) { return; }
    
    let framerate = this.game.options.framerate;

    if (framerate === "60fps") {
      if (window.location.toString().indexOf("60fps") == -1) {
	window.location = "/saitomania/60fps/index.html";
	return;
      }
    }
    if (framerate === "30fps") {
      if (window.location.toString().indexOf("30fps") == -1) {
	window.location = "/saitomania/30fps/index.html";
	return;
      }
    }

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


           
  returnSingularGameOption(){
    return `<div>
            <select name="framerate" id="framerate">
              <option value="60fps" selected>fast (60 FPS)</option>
              <option value="30fps">slow (30 FPS)</option>
            </select></div>
          `;  
  }           
     

  //returnGameOptionsHTML() { 
  //  return SaitoManiaGameOptionsTemplate(this.app, this);
  //}

}

module.exports = SaitoMania;

