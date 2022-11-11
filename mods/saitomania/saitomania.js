var saito = require('../../lib/saito/saito');
var GameTemplate = require('../../lib/templates/gametemplate');


//////////////////
// CONSTRUCTOR  //
//////////////////
class SaitoMania extends GameTemplate {

  constructor(app) {

    super(app);

    this.name            = "SaitoMania";
    this.gamename        = "SaitoMania";
    this.slug            = "saitomania";
    this.description     = 'Once you\'ve started playing SaitoMania, how can you go back to old-fashioned Solitaire? This one-player card game is the perfect way to pass a flight from Hong Kong to pretty much anywhere. Arrange the cards on the table from 2-10 ordered by suite. Harder than it looks.';
    this.categories      = "Games Cardgame one-player";

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

    this.menu.addChatMenu(app, this);
    this.menu.render(app, this);

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

module.exports = SaitoMania;

