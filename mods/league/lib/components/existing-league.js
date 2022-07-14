const LeagueComponentExistingLeagueTemplate = require("./existing-league.template");
const ArcadeLeagueView = require("../overlays/arcade-league-view");


module.exports = ExistingLeague = {

  render(app, mod, league) {
    if (!document.getElementById(league.id)){
      app.browser.addElementToDom(LeagueComponentExistingLeagueTemplate(app, mod, league), "league-component-existing-league");
    }else{
      document.getElementById(league.id).outerHTML = LeagueComponentExistingLeagueTemplate(app, mod, league);
    }
    this.attachEvents(app, mod);
  },

  //Not good programming to nest loops like this, define functions then immediately overwriting them
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
         mod.showShareLink(league_id, mod); 
        }
      }
    });
  }
}


