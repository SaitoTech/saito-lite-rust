const RedSquareGamesSidebarTemplate = require("./games-sidebar.template");
const SaitoCalendar = require("./../../../../lib/saito/new-ui/saito-calendar/saito-calendar");
const GameInvite = require("./../game");

class RedSquareGamesSidebar {

  constructor(app, mod, selector = "") {
    this.name = "RedSquareGamesSidebar";
    this.mod = mod;
    this.selector = selector;
  }

  render(app, mod, selector="") {

    if (document.querySelector(".saito-sidebar.right")) {
      document.querySelector(".saito-sidebar.right").remove();
    }

console.log("ADDING GAMES SIDEBAR!");

    if (selector != "") {
      app.browser.addElementToSelector(RedSquareGamesSidebarTemplate(app, mod), selector);
    } else {
      app.browser.addElementToSelector(RedSquareGamesSidebarTemplate(app, mod), this.selector);
    }

    app.connection.on("game-invite-render-request", (tx) => {
console.log("RECEIVED INVITE TO ADD");
        let gi = new GameInvite(app, mod, tx);
        gi.render(app, mod, ".saito-arcade-invite-list");
    });


    //
    // render existing arcade games
    //
    let arcade_mod = app.modules.returnModule("Arcade");
    if (arcade_mod) {
console.log("arcade mod exists");
      for (let i = 0; i < arcade_mod.games.length; i++) {
console.log("EMITTING INVITE ");
        app.connection.emit('game-invite-render-request', arcade_mod.games[i]);
      }
    };



    this.attachEvents(app, mod);

  }

  attachEvents(app, mod) {

  } 

}

module.exports = RedSquareGamesSidebar;

