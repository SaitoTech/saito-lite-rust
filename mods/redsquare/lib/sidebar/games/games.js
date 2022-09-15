const RedSquareGamesTemplate = require("./games.template");

class RedSquareGames {

  constructor(app, mod, selector = "") {
    this.app = app;
    this.mod = mod;
    this.selector = selector;

    app.connection.on("game-invite-list-update", () => {
        //console.log("Arcade update received");
        this.render(app, mod);
    });
  }

  render(app, mod, selector="") {

    if (selector != "") {
      this.selector = selector;
    }

    let div = document.querySelector(this.selector);
    if (div){
      div.innerHTML = RedSquareGamesTemplate(app, mod);
      this.attachEvents(app, mod);
    }
    //app.browser.replaceElementBySelector(RedSquareGamesTemplate(app, mod), this.selector);

    //this.attachEvents(app, mod);
  }


  attachEvents(app, mod) {
    Array.from(document.querySelectorAll('.saito-arcade-invite')).forEach(game => {
      game.onclick = (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();

        let game_id = e.currentTarget.getAttribute("data-id");
        let arcade_mod = app.modules.returnModule("Arcade");
        if (arcade_mod) {
          for (let i = 0; i < arcade_mod.games.length; i++) {
            if (arcade_mod.games[i].transaction.sig == game_id){
              let gameInviteDetails = new GameInviteDetails(this.app, this.mod);
              gameInviteDetails.render(this.app, this.mod, arcade_mod.games[i]);
            }
          }    
        }
      };

    }); 
  }
}

module.exports = RedSquareGames;

