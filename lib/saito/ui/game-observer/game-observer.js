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
    }

    this.arcade_mod = app.modules.returnModule("Arcade");
    if (this.arcade_mod == null) {

      salert("ERROR 413252: Arcade Module not Installed");
      return;
    }


    if (!document.getElementById("game-observer-last")) {
      app.browser.addElementToDom(GameObserverTemplate());
    }
  }

  /**
   * Add functionality to the forward/rewind buttons
   * @param app - the Saito Application
   * @param mod - the game module in question
   */
  attachEvents(app, mod) {
    document.getElementById("game-observer-next-btn").onclick = (e) => {
      this.next();
    };

    document.getElementById("game-observer-last-btn").onclick = (e) => {
      this.last();
    };
  }

  /**
   * Move forward one step
   * @param app - the Saito Application
   * @param mod - the game module in question
   * 
   */ 
  next() {
    let observer_self = this;
    let current_queue_hash = this.app.crypto.hash(JSON.stringify(this.game_mod.game.queue));

    //
    // unhalt the game
    //
    this.game_mod.game.halted = 0;
    this.game_mod.game.gaming_active = 0;
    this.game_mod.saveGame(this.game_mod.game.id);

    this.arcade_mod.observerDownloadNextMoves(this.game_mod, function (mod) {

      if (mod.game.future.length == 0) {
        salert("No Moves Yet Available Beyond this Point");
        observer_self.hideNextMoveButton();
        return;
      }
      if (mod.game.queue.length > 0) {
        if (mod.game.queue[mod.game.queue.length - 1] === "OBSERVER_CHECKPOINT") {
          mod.game.queue.splice(mod.game.queue.length - 1, 1);
        }
      }

      if (mod.runQueue() == 0) {
        mod.processFutureMoves();
      }

      if (mod.game.future.length == 0) {
        let revised_queue_hash = mod.app.crypto.hash(JSON.stringify(mod.game.queue));
        if (revised_queue_hash === current_queue_hash) {
          salert("No Moves Yet Available Beyond this Point");
          observer_self.hideNextMoveButton();
          return;
        }
      }
    });
  }


  /**
   * Rewind one step
   * @param app - the Saito Application
   * @param mod - the game module in question
   * 
   */ 
  last() {
    salert("Please wait while we move back one step...");
    this.arcade_mod.initializeObserverModePreviousStep(
      this.game_mod.game.id,
      this.game_mod.game.step.ts
    );
  }

  hideNextMoveButton() {
    document.getElementById("game-observer-next-btn").style.display = "none";
  }

  showNextMoveButton() {
    document.getElementById("game-observer-next-btn").style.display = "block";
  }

  hideLastMoveButton() {
    document.getElementById("game-observer-last-btn").style.display = "none";
  }

  showLastMoveButton() {
    document.getElementById("game-observer-last-btn").style.display = "block";
  }
}

module.exports = GameObserver;
