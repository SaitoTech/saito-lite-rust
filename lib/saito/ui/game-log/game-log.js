const GameLogTemplate = require("./game-log.template");

/**
 * Creates a sidebar window for a reverse-ordered list of moves that have occurred in the game.
 * By default, only displays the most recent 150 log messages and will refuse to display consecutive identical messages
 * Included in GameTemplate by default and accessible through property: log.
 * Functionality completely encoded within gameTemplate through wrapper functions updateLog (to add a message) and restoreLog (to replay the log history when reloading a saved game)
 * but must call render/attachEvents (in initializeHTML)
 *
 */
class GameLog {
  /**
   *  @constructor
   *  @param app - Saito app
   */
  constructor(app) {
    this.app = app;

    this.logs = [];
    this.log_length = 150;
    this.logs_last_msg = "";

    // backwards compatibility for older functions
    // which do not have a reference to the module
    // so we create one and then add it on the first
    // render.
    this.game_mod = null;
  }

  /**
   * Adds Log to the DOM
   * @param app - Saito app
   * @param mod - reference to the game module
   */
  render(app, mod) {
    if (this.game_mod == null) {
      this.game_mod = mod;
    }
    if (this.logs_last_msg === "" && this.logs.length > 0) {
      this.logs_last_msg = this.logs[0];
    }
    if (!document.querySelector("#log")) {
      app.browser.addElementToDom(GameLogTemplate());
    }
    const log = document.getElementById("log");
    if (log) {
      log.innerHTML = this.logs
          .slice(0, this.log_length)
          .map((line) => `<div>> ${line}</div>`)
          .join("");
    } else {
      console.error("Unable to render game log");
    }
  }

  /**
   * Adds functionality to open/close log by clicking (with some tolerance for click-drag actions
   * @param app - Saito app (unused here)
   * @param mod - reference to game module (unused here)
   */
  attachEvents(app, mod) {
    let xpos = 0;
    let ypos = 0;

    document.querySelector("#log").onmousedown = (e) => {
      xpos = e.clientX;
      ypos = e.clientY;
    };
    document.querySelector("#log").onmouseup = (e) => {
      if (Math.abs(xpos - e.clientX) > 4 || Math.abs(ypos - e.clientY) > 4) {
        return;
      }
      this.toggleLog();
    };
  }

  /**
   * Internal function to toggle display of the log
   */
  toggleLog() {
    document.querySelector("#log").toggleClass("log-lock");
  }

  /**
   * Add log_str to the log and run callback
   * In a bit of Twilight specific coding, log_str will not be appended if it is identical to previous log message
   * unless "force" is invoked or log_str contains either "removes" or "places" as a substring
   * @param log_str - the message to prepend to the log
   * @param force - a flag to override checks to prevent duplicate messages being logged
   *
   */
  updateLog(log_str, force = 0) {
    let add_this_log_message = 1;

    if (log_str === this.logs_last_msg) {
      add_this_log_message = 0;
      if (log_str.indexOf("removes") > -1) {
        add_this_log_message = 1;
      }
      if (log_str.indexOf("places") > -1) {
        add_this_log_message = 1;
      }
    }

    if (add_this_log_message == 1 || force == 1) {
      this.logs_last_msg = log_str;
      this.logs.unshift(log_str);
      this.render(this.app, this.game_mod);
    }
  }
}

module.exports = GameLog;
