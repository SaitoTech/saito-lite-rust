const LeagueComponentExistingLeagueTemplate = require("./existing-league.template");
const ArcadeLeagueView = require("../overlays/arcade-league-view");


class ExistingLeague {

  constructor(app, mod, league) {
    this.app = app;
    this.mod = mod;
    this.league = league;
  }

  render(app, mod) {
    app.browser.addElementToDom(LeagueComponentExistingLeagueTemplate(app, mod, this.league), "league-component-existing-league");
    this.attachEvents(app, mod);
  }

  attachEvents(app, mod) {
    Array.from(document.getElementsByClassName('league-component-existing-league')).forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        let league_id = btn.getAttribute('data-league-id');
        let cmd = btn.getAttribute('data-cmd');
        if (cmd == "join"){
          mod.sendJoinLeagueTransaction(league_id);
          salert('League joined');
        }
        if (cmd == "view"){
          for (let league of mod.leagues){
            if (league.id == league_id){
              ArcadeLeagueView.render(app, mod, league);
              return;    
            }
          }
          console.log("League not found");
        }
        if (cmd == "invite"){
         mod.overlay.show(app, mod, `<h2>Insert invite link here</h2>`); 
        }
      }
    });
  }
}

module.exports = ExistingLeague;

