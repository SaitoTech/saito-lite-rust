const ArcadeLeagueTemplate = require("./arcade-league.template");

class ArcadeLeague {

  constructor(app, mod, league) {

    this.app = app;
    this.mod = mod;
    this.league = league;
  }

  render(app, mod, elem) {

    app.browser.addElementToElement(ArcadeLeagueTemplate(app, mod, this.league), elem);
    this.attachEvents(app, mod);

  }


  attachEvents(app, mod) {
    let league = this.league;
    
    document.querySelectorAll(`#league-${league.id} .league-tile-button`).forEach((el) =>{
        el.onclick = function (e) {
        let game_sig = e.currentTarget.getAttribute("data-sig");
        let game_cmd = e.currentTarget.getAttribute("data-cmd");

        if (game_cmd == "play" && game_sig == league.id){
          mod.createLeagueGame(league);
        }

        if (game_cmd == "view" && game_sig == league.id){
          app.connection.emit("view-league-details", game_sig);
        }
        
        if (game_cmd == "join" && game_sig == league.id){
          mod.sendJoinLeagueTransaction(league.id);
          salert('Joining League... it may take a moment to update info');
        }
      }
    });
    
    
  }

}

module.exports = ArcadeLeague;
