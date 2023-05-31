const GamePlayerboxManagerTemplate = require("./main.template");
const GamePlayerbox = require("./playerbox");

class GamePlayerboxManager {

  constructor(app, mod, container = "") {

    this.app = app;
    this.mod = mod;
    this.container = container || ".game-playerbox-manager";

    //
    // track popups
    //
    this.playerboxes = [];
    for (let i = 0; i < mod.game.players.length; i++) {
      //
      // seat number starts at 1
      //
      this.playerbox.push(new GamePlayerbox(app, mod, this.container, mod.game.players[i], (i+1))); 
    }

    //
    // handle requests to re-render chat manager
    //
    app.connection.on("game-playerbox-render-request", () => {
      this.render();
    });


    //
    // remove playerboxes
    //
    app.connection.on("game-playerbox-remove-request", (publickey = null) => {
      for (let i = 0; i < this.playerboxes.length; i++) {
        if (this.playerboxes[i].publickey === publickey) {
          this.playerboxes.splice(i, 1);
	  this.render();
        }
      }
    });

  }


  render() {

    if (document.querySelector(".game-playerbox-manager")) {
      this.app.browser.replaceElementBySelector(GamePlayerboxManagerTemplate(this.app, this.mod), ".game-playerbox-manager");
    } else {
      this.app.browser.addElementToSelectorOrDom(GamePlayerboxManagerTemplate(this.app, this.mod), this.container);
    }

    //
    // render chat groups
    //
    for (let i = 0; i < this.playerboxes.length; i++) {
      this.playerboxes[i].render();
    }

    this.attachEvents();

  }


  attachEvents() {
    for (let i = 0; i < this.playerboxes.length; i++) {
      this.playerboxes[i].attachEvents();
    }
  }

}

module.exports = GamePlayerboxManager;


