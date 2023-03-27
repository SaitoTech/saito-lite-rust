const GameLoaderTemplate = require('./game-loader.template');

/*
    DEPRECATED --- DELETE ONCE OBSERVER IS INTEGRATED BACK INTO ARCADE
*/

class GameLoader {

  constructor(app, mod, id = null) {
    this.app = app;
    this.mod = mod;
    this.id = id;
    if (document.querySelector("#game-loader-container")) {
      document.querySelector("#game-loader-container").remove();
    }
  }

  render(app, mod, component = '', message = 'Your Game is Initializing', btn_name = "start game") {
    if (!document.querySelector("#game-loader-container")) {
      if (component) {
        let container = document.querySelector(component);
        if (container) {
          container.innerHTML = GameLoaderTemplate(this.id, message, btn_name);
        }
      } else {
        //Let's nope out of rendering if we don't have a specified place to put it
        //Maybe accidentally rendering within the wrong active module
        return;
        //app.browser.prependElementToDom(GameLoaderTemplate(this.id, message, btn_name));
      }
    }
    if (this.id) {
      this.attachEvents(app, mod);
    }
  }

  attachEvents(app, mod) {
    try {
      document.getElementById("start_btn").onclick = (e) => {

        let game_id = e.currentTarget.getAttribute("data-sig");

        for (let i = 0; i < app.options.games.length; i++) {
          if (app.options.games[i].id == game_id) {
            app.options.games[i].timestamp = new Date().getTime();
            app.options.games[i].initialize_game_run = 0;
            app.storage.saveOptions();

            let game_mod = app.modules.returnModule(app.options.games[i].module);
            if (game_mod) {
              window.location = "/" + game_mod.returnSlug();
              return;
            }
          }
        }

        salert("Game module not found");
      };
    } catch (err) {
    }
  }

  remove() {
    setTimeout(() => {
      if (typeof document.getElementById('game-loader-container') != 'undefined' && document.getElementById('game-loader-container') != null) {
        document.getElementById('game-loader-container').remove();
      }
    }, 500)

  }
}

module.exports = GameLoader;
