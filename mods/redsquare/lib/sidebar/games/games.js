const RedSquareGamesTemplate = require("./games.template");
const GameCreator = require("./../../appspace/arcade/game-creator");
const GameInviteDetails = require("./../../appspace/arcade/game-invite-details");
const SaitoScheduler = require("./../../../../../lib/saito/new-ui/saito-scheduler/saito-scheduler");
const GameLoader = require("../../../../../lib/saito/new-ui/game-loader/game-loader");

class RedSquareGames {

  constructor(app, mod, selector = "") {
    this.app = app;
    this.mod = mod;
    this.selector = selector;
    this.blockRender = false;


    app.connection.on("game-invite-list-update", () => {
        //console.log("Arcade update received");
        this.render(app, mod);
    });

    app.connection.on("arcade-game-loading" , () =>{
      this.blockRender = true;
      let gameLoader = new GameLoader(this.app, this);
      gameLoader.render(this.app, this, this.selector);
    });

    app.connection.on("arcade-game-ready-play" , (game) =>{
      this.blockRender = true;
      let gameLoader = new GameLoader(this.app, this, game.game_id);
      gameLoader.render(this.app, this, this.selector, `${game.game_name} is ready to start!`);
    });

  }

  render(app, mod, selector="") {
    if (this.blockRender) { return; }

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
  
    //Copied from lib/appspace/games.js
    if (document.getElementById("redsquare-schedule-game")){
      document.getElementById("redsquare-schedule-game").onclick = (e) => {
        let sc = new SaitoScheduler(app, mod);
        // callback is on submit
        sc.render(app, mod, function(options) {
          let gc = new GameCreator(app, mod);
          gc.render(app, mod);
        });
      }

    }
    if (document.getElementById("redsquare-create-game")){
      document.getElementById("redsquare-create-game").onclick = (e) => {
        let gc = new GameCreator(app, mod);
        gc.render(app, mod);
      }
    }


  }
}

module.exports = RedSquareGames;

