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
  constructor(app, game_mod) {
    this.app = app;
    this.game_mod = game_mod;
    this.arcade_mod = null;

    this.step_speed = 2000;
    this.is_paused = true;

    this.game_states = [];
    this.game_moves = [];
    this.future_moves = [];

  }

  /**
   * Render the Observer interface
   */
  render() {
    console.log("Rendering ObserverHUD");
    if (!this.arcade_mod){
      this.arcade_mod = this.app.modules.returnModule("Arcade");
      if (this.arcade_mod == null) {
        salert("ERROR 413252: Arcade Module not Installed");
        return;
      }
    }

    let step = this.game_mod.game?.step?.game || 0;

    if (!document.getElementById("game-observer-hud")) {
      this.app.browser.addElementToDom(GameObserverTemplate(step));
    }else{
      document.getElementById("game-observer-hud").style.display="block";
    }

    this.attachEvents();
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


  updateStatus(str) {
   try {
      let statusBox = document.getElementById("obstatus");
      if (statusBox) {
        statusBox.innerHTML = sanitize(str);
        setTimeout(() => {
          statusBox.innerHTML = this.game_mod.game.status;
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    }
  }


  /**
   * Add functionality to the forward/rewind buttons
   */
  attachEvents() {

    let observer_self = this;

    document.getElementById("game-observer-next-btn").onclick = (e) => {
      document.getElementById("game-observer-next-btn").classList.remove("flashit");
      if (!this.is_paused){
        this.step_speed /= 2;
        return;
      }

      this.next();
    };
    console.log("Paused/Halted: " + this.is_paused + " " + this.game_mod.game.halted);

    document.getElementById("game-observer-play-btn").onclick = (e) => {
      console.log("GO Paused/Halted: " + this.is_paused + " " +  this.game_mod.game.halted);
      document.getElementById("game-observer-next-btn").classList.remove("flashit");
      
      this.step_speed = 2000; //Reset to normal play speed
      if (this.is_paused){
        //Update controls UI and flags
        this.play();  
        //Kick off loop with next move
        this.next();
      }else{
        this.pause();
      }

    };

    document.getElementById("game-observer-first-btn").onclick = (e) =>{
      this.game_states = [];
      this.future_moves = this.future_moves.concat(this.game_moves);
      this.game_moves = [];
      this.pause();

      //Reset the game_mod.game
      this.game_mod.game = this.game_mod.newGame(this.game_mod.game.id);
      this.game_mod.saveGame(this.game_mod.game.id);
      this.game_mod.initializeObserverMode(this.arcade_mod.returnGame(this.game_mod.game.id));

      this.game_mod.game.halted = 1; // Default to paused
   
      this.arcade_mod.observerDownloadNextMoves(this.game_mod, (mod)=> {
        console.log("GAME QUEUE:"+JSON.stringify(mod.game.queue));
        mod.initialize_game_run = 0;
        mod.initializeGameQueue(mod.game.id);
        //Tell gameObserver HUD to update its step
        observer_self.updateStep(mod.game.step.game);
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
    //  console.log(this.game_states);
    //  console.log(this.game_moves);
    //}


    this.app.browser.makeDraggable("game-observer-hud");
  }


  updateStep(step){
    try{
      document.getElementById("game-observer-status").innerHTML = `Game step: ${step}`;
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
    
    this.is_paused = true;
    this.game_mod.game.halted = 1;
  }

  play(){
    let playBtn = document.getElementById("game-observer-play-btn"); 
    playBtn.classList.remove("play-state");
    playBtn.classList.add("pause-state");
    let fwdBtn = document.getElementById('game-observer-next-btn');
    fwdBtn.classList.remove("play-state");
    fwdBtn.classList.add("pause-state");

    this.updateStatus("Replaying moves...");
    this.is_paused = false;
    this.game_mod.game.halted = 0; 
  
  }

  insertFutureMoves(game_mod) {
    for (let i = 0; i < this.future_moves.length; i++) {
      let future_tx = this.future_moves[i];
      game_mod.addFutureMove(future_tx);
    }
    this.future_moves = [];
  }



  /**
   * Move forward one step
   * 
   */ 
  async next() {
    let observer_self = this;

    this.game_mod.game.halted = 0;

    //If we have backed up, we kept an array of undone moves add those back onto the game's future queue
    this.insertFutureMoves(this.game_mod);
    
    if (this.game_mod.processFutureMoves() == 0){
      
      //Only download if there are no new valid moves pending in the future queue
      this.updateStatus("Checking for additional moves...");
      this.arcade_mod.observerDownloadNextMoves(this.game_mod, function (mod) {

        console.log("Callback",mod.game.future.length);

        if (mod.runQueue() == 0) {
          mod.processFutureMoves();
        }

        //Reset game to halted 
        mod.game.halted = (observer_self.is_paused) ? 1: 0; 

        if (mod.game.future.length == 0) {
          observer_self.hideNextMoveButton();
        }

      });
    }

  }


  /**
   * Rewind one step
   * 
   */ 
  last() {

    console.log("Backing up from..." + this.game_mod.game.step.game);
    let observer_self = this;
    const callback = function(mod){
      //Get game module to reload and refresh the DOM
      console.log("GAME QUEUE:"+JSON.stringify(mod.game.queue));
      mod.initialize_game_run = 0;
      mod.initializeGameQueue(mod.game.id);
      //Tell gameObserver HUD to update its step
      observer_self.updateStep(mod.game.step.game);
      //Clear status of gameObserverHUD
      //observer_self.updateStatus("");
    }

    if (this.game_states.length > 0){
    
      let g1 = this.game_states.pop();
      this.future_moves.unshift(this.game_moves.pop());

      console.log("PREVIOUS GAME STATE:");
      console.log(g1);
      this.game_mod.game = g1;
      this.game_mod.saveGame(this.game_mod.game.id);
      callback(this.game_mod);
    
    }
    /*else{
      salert("Please wait while we query the previous step...");

      this.arcade_mod.initializeObserverModePreviousStep(
        this.game_mod,
        this.game_mod.game.step.game, 
        callback
      );
    }*/

    
  }

  hideNextMoveButton() {
    let nextMoveBtn = document.getElementById("game-observer-next-btn");
    if (nextMoveBtn){
      nextMoveBtn.classList.remove("flashit");
      nextMoveBtn.classList.add("unavailable");
    }
  }

  showNextMoveButton() {
    let nextMoveBtn = document.getElementById("game-observer-next-btn");
    if (nextMoveBtn){
      if (nextMoveBtn.classList.contains("unavailable")){
        nextMoveBtn.classList.remove("unavailable");
      }else{
        nextMoveBtn.classList.add("flashit");
      }
    }
  }


  showLastMoveButton() {
    let lastBtn = document.getElementById("game-observer-last-btn");
    if (lastBtn){
      lastBtn.classList.remove("unavailable");
    }
    let firstBtn = document.getElementById("game-observer-first-btn");
    if (firstBtn){
      firstBtn.classList.remove("unavailable");
    }
  }
}

module.exports = GameObserver;
