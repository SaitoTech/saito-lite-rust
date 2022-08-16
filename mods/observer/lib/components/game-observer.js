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
    }

    this.attachEvents(app, mod);
  }

  /**
   * Add functionality to the forward/rewind buttons
   * @param app - the Saito Application
   * @param mod - the game module in question
   */
  attachEvents(app, mod) {
    document.getElementById("game-observer-first-btn").onclick = (e) =>{
      this.arcade_mod.game_states = [];
      this.arcade_mod.game_moves = [];
      this.arcade_mod.initializeObserverModePreviousStep(this.game_mod.game.id, 0);
    }

    document.getElementById("game-observer-next-btn").onclick = (e) => {
      document.getElementById("game-observer-next-btn").classList.remove("flashit");
      this.next();
    };
    console.log("Paused/Halted: " + this.arcade_mod.is_paused + mod.game.halted);

    let playBtn = document.getElementById("game-observer-play-btn"); 
    playBtn.onclick = (e) => {
      console.log("GO Paused/Halted: " + this.arcade_mod.is_paused + " " +  mod.game.halted);
      document.getElementById("game-observer-next-btn").classList.remove("flashit");

      this.arcade_mod.step_speed = 2000; //Reset to normal play speed
      if (mod.game.halted == 1){
        playBtn.classList.remove("play-state");
        playBtn.classList.add("pause-state");
        this.game_mod.updateObserverStatus("Replaying moves...");
        this.arcade_mod.is_paused = false;
        mod.restartQueue();
      }else{
        playBtn.classList.add("play-state");
        playBtn.classList.remove("pause-state");
        this.arcade_mod.is_paused = true;
        mod.game.halted = 1;
      }
    }

    document.getElementById("game-observer-last-btn").onclick = (e) => {
      //Switch to pause state
      if (!this.arcade_mod.is_paused){
        playBtn.onclick.apply(playBtn);
      }
      //Backup one step
      this.last();
    };


    app.browser.makeDraggable("game-observer-hud");
  }


  updateStep(step){
    try{
      document.getElementById("game-observer-status").innerHTML = `Game step: ${sanitize(step)}`;
    }catch(err){

    }
  }

  /**
   * Move forward one step
   * @param app - the Saito Application
   * @param mod - the game module in question
   * 
   */ 
  next() {
    let observer_self = this;
    //let current_queue_hash = this.app.crypto.hash(JSON.stringify(this.game_mod.game.queue));

    if (!this.arcade_mod.is_paused){
      this.arcade_mod.step_speed /= 2;
      return;
    }


    this.game_mod.game.halted = 0;
    if (this.game_mod.processFutureMoves() == 0){
      //
      //Only download if there are no new valid moves pending in the future queue
      this.game_mod.updateObserverStatus("Checking for additional moves...");
      this.arcade_mod.observerDownloadNextMoves(this.game_mod, function (mod) {

        if (mod.game.future.length == 0) {
          salert("No Moves Yet Available Beyond this Point");
          observer_self.hideNextMoveButton();
          mod.updateObserverStatus("");
          mod.game.halted = observer_self.arcade_mod.is_paused; 
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
        if (observer_self.arcade_mod.is_paused){
          observer_self.game_mod.game.halted = 1;
        }

        /*if (mod.game.future.length == 0) {
          let revised_queue_hash = mod.app.crypto.hash(JSON.stringify(mod.game.queue));
          if (revised_queue_hash === current_queue_hash) {
            salert("No Moves Yet Available Beyond this Point");
            observer_self.hideNextMoveButton();
            return;
          }
        }*/
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

    console.log("Backing up...");
    let observer_self = this;
    const callback = function(mod){
      //Get game module to reload and refresh the DOM
      mod.initialize_game_run = 0;
      mod.initialize(mod.app);
      //Tell gameObserver HUD to update its step
      observer_self.updateStep(mod.game.step.game);
      //Clear status of gameObserverHUD
      mod.updateObserverStatus("");
    }

    if (this.arcade_mod.game_states.length > 0){
      let g1 = this.arcade_mod.game_states.pop();
      let g2 = this.arcade_mod.game_moves.pop();

      this.game_mod.game = g1;
      this.game_mod.saveGame(this.game_mod.game.id);
      callback(this.game_mod);
    }else{
      salert("Please wait while we query the previous step...");

      this.arcade_mod.initializeObserverModePreviousStep(
        this.game_mod.game.id,
        this.game_mod.game.step.game, 
        callback
      );
    }

    
  }

  hideNextMoveButton() {
    document.getElementById("game-observer-next-btn").style.display = "none";
    document.getElementById("game-observer-next-btn").classList.remove("flashit");
  }

  showNextMoveButton() {
    let nextMoveBtn = document.getElementById("game-observer-next-btn");
    if (nextMoveBtn){
      if (nextMoveBtn.style.display == "block"){
        nextMoveBtn.classList.add("flashit");
      }else{
        nextMoveBtn.style.display = "block";
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
