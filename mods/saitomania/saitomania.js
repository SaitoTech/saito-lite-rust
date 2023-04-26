const OnePlayerGameTemplate = require('./../../lib/templates/oneplayergametemplate');
const SaitoManiaGameOptionsTemplate = require("./lib/saitomania-game-options.template");


//////////////////
// CONSTRUCTOR  //
//////////////////
class SaitoMania extends OnePlayerGameTemplate {

  constructor(app) {

    super(app);

    this.name            = "SaitoMania";
    this.gamename        = "Saito Mania";
    this.slug            = "saitomania";
    this.description     = 'Blast shitcoins, pick up superpowers, destroy rocks to collect Saito and learn about the Saito project while playing ;)';
    this.categories      = "Games Arcadegame One-player";
    this.request_no_interrupts = true; // don't popup chat
    this.app = app;
    this.statistical_unit = "game";
  }


  // Create an exp league by default
  respondTo(type){
    if (type == "default-league") {
      let obj = super.respondTo(type);
      obj.ranking_algorithm = "HSC";
      return obj;
    }
    return super.respondTo(type);
  }


  initializeGame(game_id) {

    if (!this.game.state) {
      console.log("******Generating the Game******");
      this.game.queue = [];
      this.game.queue.push("play");
      this.game.queue.push("READY");
      this.game.state = {
        scores: [],
      };
    }
    
    console.log(JSON.parse(JSON.stringify(this.game)));
  }


  initializeHTML(app) {

    if (!this.browser_active) { return; }
    
    //
    // leaving here as an example of how we can parse game.options
    // on game load, and incorporate the variables in the init
    // sequence -- in this case splitting to different versions of 
    // the binary depending on system framerate support.
    //
    //let framerate = this.game.options.framerate;
    //let framerate = "60fps";
    //if (framerate === "60fps") {
    //  if (window.location.toString().indexOf("60fps") == -1) {
    //	window.location = "/saitomania/60fps/index.html";
    //	return;
    //  }
    //}
    //if (framerate === "30fps") {
    //  if (window.location.toString().indexOf("30fps") == -1) {
    //	window.location = "/saitomania/30fps/index.html";
    //	return;
    //  }
    //}

    super.initializeHTML(app);

    //
    // ADD MENU
    //
    this.menu.addMenuOption("game-game", "Game");

    this.menu.addChatMenu();
    this.menu.render();


    const log = console.info.bind(console)
    console.info = (...args) => {
      if (args.length > 0) {
        //Check for special info in the console.info
        if (typeof args[0] === 'string') {
          if (this.checkForGameOver(args[0])){
            return;
          }
        }

        //Still output as default
        log(...args);
      }
    }


  }



  handleGameLoop(msg=null) {

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

    } 
    return 0;
  }


  checkForGameOver(log_msg){
    if (log_msg.includes("SAITOMANIA:")){
      let score = log_msg.replace("SAITOMANIA:","");
      console.log("Game over, final score:" + score);
      this.game.state.scores.push(score);
      this.endGame([], score);
      return 1;
    }
    return 0;
  }


}

module.exports = SaitoMania;

