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
      this.next(app, mod);
    };

    document.getElementById("game-observer-last-btn").onclick = (e) => {
      this.last(app, mod);
    };
  }

  /**
   * Move forward one step
   * @param app - the Saito Application
   * @param mod - the game module in question
   * 
   */ 
  next(app, mod) {
    let observer_self = this;
    let current_queue_hash = app.crypto.hash(JSON.stringify(mod.game.queue));

    //
    // unhalt the game
    //
    mod.game.halted = 0;
    mod.game.gaming_active = 0;
    mod.saveGame(mod.game.id);

    let arcade_mod = app.modules.returnModule("Arcade");
    if (arcade_mod == null) {
      alert("ERROR 413231: Arcade Module not Installed");
      return;
    }
    arcade_mod.observerDownloadNextMoves(mod, function (mod2) {
      mod = mod2;

      if (mod.game.future.length == 0) {
        salert("No Moves Yet Available Beyond this Point");
        observer_self.hideNextMoveButton();
        return;
      }
      if (mod.game.queue.length > 0) {
        if (
          mod.game.queue[mod.game.queue.length - 1] === "OBSERVER_CHECKPOINT"
        ) {
          mod.game.queue.splice(mod.game.queue.length - 1, 1);
        }
      }

      mod.runQueue();
      mod.processFutureMoves();

      if (mod.game.future.length == 0) {
        let revised_queue_hash = app.crypto.hash(
          JSON.stringify(mod.game.queue)
        );
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
  last(app, mod) {
    let arcade_mod = app.modules.returnModule("Arcade");
    if (arcade_mod == null) {
      salert("ERROR 413252: Arcade Module not Installed");
      return;
    }
    salert("Please wait while we move back one step...");
    arcade_mod.initializeObserverModePreviousStep(
      mod.game.id,
      mod.game.step.ts
    );
  }

  hideNextMoveButton() {
    document.getElementById("game-observer-next").style.display = "none";
  }

  showNextMoveButton() {
    document.getElementById("game-observer-next").style.display = "block";
  }

  hideLastMoveButton() {
    document.getElementById("game-observer-last").style.display = "none";
  }

  showLastMoveButton() {
    document.getElementById("game-observer-last").style.display = "block";
  }
}

module.exports = GameObserver;
