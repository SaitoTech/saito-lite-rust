const GameObserverTemplate = require("./game-observer.template");

/**
 * An interface for a third party to trace the moves of a game step-by-step
 *
 */
class GameObserver {
  /**
   * @constructor
   * @param app - the Saito Application
   */
  constructor(app) {
    this.app = app;
    this.game_mod = null;

  }

  /**
   * Render the Observer interface
   * @param app - the Saito Application
   * @param mod - the game module in question
   */
  render(app, mod) {
    if (this.game_mod === null || this.game_mod !== mod) {
      this.game_mod = mod;
      console.log("Set game to halted when rendering GO controls");
      this.game_mod.game.halted = 1;
    }

    if (!this.arcade_mod){
      this.arcade_mod = app.modules.returnModule("Observer");
      if (this.arcade_mod == null) {
        salert("ERROR 413252: Observer Module not Installed");
        return;
      }
    }

    let step = -1;
    if (mod.game?.step?.game){
      step = mod.game.step.game;
    }

    if (!document.getElementById("game-observer-hud")) {
      app.browser.addElementToDom(GameObserverTemplate(step));
    }else{
      document.getElementById("game-observer-hud").style.display="block";
    }

    this.attachEvents(app, mod);
  }

  hide(){
    if (document.getElementById("game-observer-hud")){
      document.getElementById("game-observer-hud").style.display="none";
    }
  }

  remove(){
    if (document.getElementById("game-observer-hud")){
      document.getElementById("game-observer-hud").remove();
    }
  }

  /**
   * Add functionality to the forward/rewind buttons
   * @param app - the Saito Application
   * @param mod - the game module in question
   */
  attachEvents(app, mod) {

    document.getElementById("game-observer-next-btn").onclick = (e) => {
      document.getElementById("game-observer-next-btn").classList.remove("flashit");
      if (!this.arcade_mod.is_paused){
        this.arcade_mod.step_speed /= 2;
        return;
      }

      this.next();
    };
    console.log("Paused/Halted: " + this.arcade_mod.is_paused + " " + mod.game.halted);

    document.getElementById("game-observer-play-btn").onclick = (e) => {
      console.log("GO Paused/Halted: " + this.arcade_mod.is_paused + " " +  mod.game.halted);
      document.getElementById("game-observer-next-btn").classList.remove("flashit");
        this.arcade_mod.step_speed = 2000; //Reset to normal play speed
      if (this.arcade_mod.is_paused){
        //Update controls UI and flags
        this.play();  
        //Kick off loop with next move
        this.next();
      }else{
        this.pause();
      }

    };

    document.getElementById("game-observer-first-btn").onclick = (e) =>{
      this.arcade_mod.game_states = [];
      this.arcade_mod.future_moves = this.arcade_mod.future_moves.concat(this.arcade_mod.game_moves);
      this.arcade_mod.game_moves = [];
      this.pause();
      this.showNextMoveButton();
      this.hideLastMoveButton();
      this.arcade_mod.initializeObserverModePreviousStep(this.game_mod, 0, (mod) =>{
        //Get game module to reload and refresh the DOM
        console.log("GAME QUEUE:"+JSON.stringify(mod.game.queue));
        mod.initialize_game_run = 0;
        mod.initializeGameFeeder(mod.game.id);
        //Tell gameObserver HUD to update its step
        this.updateStep(mod.game.step.game);
        //Clear status of gameObserverHUD
        mod.updateObserverStatus("");
      });
    };

    document.getElementById("game-observer-last-btn").onclick = (e) => {
      //Backup one step
      this.pause();
      this.showNextMoveButton();
      this.last();
    };

    document.getElementById("game-observer-help").onclick = (e) => {
      console.log(JSON.parse(JSON.stringify(this.game_mod.game)));
    }
    //document.getElementById("game-observer-help2").onclick = (e) => {
    //  console.log(this.arcade_mod.game_states);
    //  console.log(this.arcade_mod.game_moves);
    //}


    app.browser.makeDraggable("game-observer-hud");
  }


  updateStep(step){
    try{
      document.getElementById("game-observer-status").innerHTML = `Game step: ${sanitize(step)}`;
    }catch(err){

    }
  }

  pause(){
    let playBtn = document.getElementById("game-observer-play-btn"); 
    playBtn.classList.add("play-state");
    playBtn.classList.remove("pause-state");
    let fwdBtn = document.getElementById('game-observer-next-btn');
    fwdBtn.classList.add("play-state");
    fwdBtn.classList.remove("pause-state");
    
    this.arcade_mod.is_paused = true;
    this.game_mod.game.halted = 1;
  }

  play(){
    let playBtn = document.getElementById("game-observer-play-btn"); 
    playBtn.classList.remove("play-state");
    playBtn.classList.add("pause-state");
    let fwdBtn = document.getElementById('game-observer-next-btn');
    fwdBtn.classList.remove("play-state");
    fwdBtn.classList.add("pause-state");

    this.game_mod.updateObserverStatus("Replaying moves...");
    this.arcade_mod.is_paused = false;
    this.game_mod.game.halted = 0; 
  
  }


  /**
   * Move forward one step
   * @param app - the Saito Application
   * @param mod - the game module in question
   * 
   */ 
  async next() {
    let observer_self = this;
    //let current_queue_hash = this.app.crypto.hash(JSON.stringify(this.game_mod.game.queue));

    this.game_mod.game.halted = 0;

    //If we have backed up, we kept an array of undone moves add those back onto the game's future queue
    this.arcade_mod.insertFutureMoves(this.game_mod);
    
    if (this.game_mod.processFutureMoves() == 0){
      
      //Only download if there are no new valid moves pending in the future queue
      this.game_mod.updateObserverStatus("Checking for additional moves...");
      this.arcade_mod.observerDownloadNextMoves(this.game_mod, function (mod) {
        //console.log("Callback",mod.game.future.length);

        if (mod.game.future.length == 0) {
          observer_self.hideNextMoveButton();
          mod.updateObserverStatus("");
          mod.game.halted = (observer_self.arcade_mod.is_paused) ? 1: 0; 
          return;
        }

        if (mod.game.queue.length > 0) {
          if (mod.game.queue[mod.game.queue.length - 1] === "OBSERVER_CHECKPOINT") {
            salert("OBSERVER_CHECKPOINT");
            mod.game.queue.splice(mod.game.queue.length - 1, 1);
          }
        }

        if (mod.runQueue() == 0) {
          mod.processFutureMoves();
        }

        //Reset game to halted 
        mod.game.halted = (observer_self.arcade_mod.is_paused) ? 1: 0; 

      });
    }

  }


  /**
   * Rewind one step
   * @param app - the Saito Application
   * @param mod - the game module in question
   * 
   */ 
  last() {

    console.log("Backing up from..." + this.game_mod.game.step.game);
    let observer_self = this;
    const callback = function(mod){
      //Get game module to reload and refresh the DOM
      console.log("GAME QUEUE:"+JSON.stringify(mod.game.queue));
      mod.initialize_game_run = 0;
      mod.initializeGameFeeder(mod.game.id);
      //Tell gameObserver HUD to update its step
      observer_self.updateStep(mod.game.step.game);
      //Clear status of gameObserverHUD
      mod.updateObserverStatus("");
    }

    if (this.arcade_mod.game_states.length > 0){
      let g1 = this.arcade_mod.game_states.pop();
      this.arcade_mod.future_moves.unshift(this.arcade_mod.game_moves.pop());
      console.log("PREVIOUS GAME STATE:");
      console.log(g1);
      this.game_mod.game = g1;
      this.game_mod.saveGame(this.game_mod.game.id);
      callback(this.game_mod);
    }else{
      salert("Please wait while we query the previous step...");

      this.arcade_mod.initializeObserverModePreviousStep(
        this.game_mod,
        this.game_mod.game.step.game, 
        callback
      );
    }

    
  }

  hideNextMoveButton() {
    let nextMoveBtn = document.getElementById("game-observer-next-btn");
    if (nextMoveBtn){
      nextMoveBtn.classList.remove("flashit");
      if (nextMoveBtn.style.display !== "none"){
        nextMoveBtn.style.display = "none";
        //salert("No Moves Yet Available Beyond this Point");
      }
    }
  }

  showNextMoveButton() {
    let nextMoveBtn = document.getElementById("game-observer-next-btn");
    if (nextMoveBtn){
      if (nextMoveBtn.style.display == "none"){
        nextMoveBtn.style.display = "block";
      }else{
        nextMoveBtn.classList.add("flashit");
      }
    }
  }

  hideLastMoveButton() {
    document.getElementById("game-observer-last-btn").style.display = "none";

  }

  showLastMoveButton() {
    document.getElementById("game-observer-last-btn").style.display = "block";
  }
}

module.exports = GameObserver;
