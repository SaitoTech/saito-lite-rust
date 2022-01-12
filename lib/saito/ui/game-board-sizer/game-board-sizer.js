const GameBoardSizerTemplate = require("./game-board-sizer.template");

/**
 * Adds a slider to screen to allow players to magnify or shrink the game board
 * Included by default in gameTemplate as "sizer", must call render/attachEvents in individual game module to display and use it (preferably in initializeHTML function) 
 */
module.exports = GameBoardSizer = {
  /**
   * Creates the gameBoardSizer if it does not already exist
   * @param app - the Saito app
   * @param game_mod - game module
   * @param attachTo - DOM reference for where to attach the gameBoardSizer, default = body
   */
  render(app, game_mod, attachTo = "body") {
    if (!document.getElementById("game_board_sizer")) {
      const object = document.querySelector(attachTo);
      object.append(app.browser.htmlToElement(GameBoardSizerTemplate()));
    }
  },

  /**
   * Adds event listener to slider and makes target draggable (via JQuery). Changes to the board size and position are saved for subsequent game loads
   * @param app - the Saito app
   * @param game_mod - game module
   * @param target - DOM reference to object to be scaled in size
   *
   */
  attachEvents(app, game_mod, target = ".gameboard") {
    const sizer_self = this;
    const targetObject = document.querySelector(target);

    if (!targetObject) {
      console.error(target + " not found");
      return;
    }

    document
      .querySelector("#game_board_sizer")
      .addEventListener("change", () => {
        sizer_self.scaleBoard(game_mod, targetObject);
      });

    // adjust scale
    if (game_mod.loadGamePreference(game_mod.returnSlug() + "-board-scale")) {
      try {
        document.querySelector("#game_board_sizer").value =
          game_mod.loadGamePreference(game_mod.returnSlug() + "-board-scale");
        this.scaleBoard(game_mod, targetObject);
      } catch (err) {
        console.error(err);
      }
    }

    // and adjust positioning
    let boardoffset = game_mod.loadGamePreference(
      game_mod.returnSlug() + "-board-offset"
    );
    if (boardoffset) {
      $(target).offset(boardoffset);
    }

    // and make draggable
    $(target).draggable({
      stop: function (event, ui) {
        game_mod.saveGamePreference(
          game_mod.returnSlug() + "-board-offset",
          ui.offset
        );
      },
    });
  },

  /**
   * Internal function to scale targetObject based on slider
   * @param game_mod - the game module
   * @param targetObject - by default, the ".gameboard" DOM object
   *
   */
  scaleBoard(game_mod, targetObject) {
    // disable hammer if it exists
    try {
      game_mod.hammer.get("pinch").set({ enable: false });
      game_mod.hammer.get("pan").set({ enable: false });
    } catch (err) {
      console.error(err);
    }

    targetObject.style.transform = `scale(${
      document.querySelector("#game_board_sizer").value / 100
    })`;
    game_mod.saveGamePreference(
      game_mod.returnSlug() + "-board-scale",
      document.querySelector("#game_board_sizer").value
    );

    // re-enable hammer
    try {
      game_mod.hammer.get("pinch").set({ enable: true });
      game_mod.hammer.get("pan").set({ enable: true });
    } catch (err) {
      console.error(err);
    }
  },
};
