const GameScoreboardTemplate = require("./game-scoreboard.template");

/**
 *
 */
class GameScoreBoard {
  /**
   *  @constructor
   *  @param app - Saito app
   */
  constructor(app) {
    this.app = app;
    this.game_mod = null;
  }

  /**
   *
   * @param app - Saito app
   * @param game_mod - the game object
   */
  render(app, game_mod = null) {
    if (!document.querySelector("#game-scoreboard")) {
      app.browser.addElementToDom(GameScoreboardTemplate());
    }
  }


  attachEvents(app, game_mod){
  }

  update(html){
    this.render(this.app);
    let scoreboard = document.querySelector("#game-scoreboard");
    scoreboard.innerHTML = sanitize(html);
  }

  append(html){
    this.render(this.app);
    let scoreboard = document.querySelector("#game-scoreboard");
    scoreboard.innerHTML += sanitize(html);
  }
}

module.exports = GameScoreBoard;
