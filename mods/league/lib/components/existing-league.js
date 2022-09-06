const LeagueComponentExistingLeagueTemplate = require("./existing-league.template");
const ArcadeLeagueView = require("../overlays/arcade-league-view");


module.exports = ExistingLeague = {

  render(app, mod, league) {
    if (!document.getElementById(league.id)) {
      app.browser.addElementToId(LeagueComponentExistingLeagueTemplate(app, mod, league), "league-component-existing-league");

    } else {
      document.getElementById(league.id).outerHTML = LeagueComponentExistingLeagueTemplate(app, mod, league);
    }
    this.attachEvents(app, mod);
  },

  //Not good programming to nest loops like this, define functions then immediately overwriting them
  attachEvents(app, mod) {
    Array.from(document.getElementsByClassName('league-component-existing-league')).forEach(btn => {
      btn.onclick = async (e) => {
        e.preventDefault();
        let league_id = btn.getAttribute('data-league-id');
        let cmd = btn.getAttribute('data-cmd');
        if (cmd == "join") {
          mod.sendJoinLeagueTransaction(league_id);
          salert('Joining League... it may take a moment to update info');
        }
        if (cmd == "view") {
          for (let league of mod.leagues) {
            if (league.id == league_id) {
              let bs = new ArcadeLeagueView(app);
              bs.render(app, mod, league);
              return;
            }
          }
          console.log("League not found");
        }
        if (cmd == "invite") {
          mod.showShareLink(league_id, mod);
        }
        if (cmd == "delete") {
          let confirm = await sconfirm("Are you sure you want to delete this league?");
          if (confirm) {
            mod.sendDisbandLeagueTransaction(league_id);
            salert("League Deleted");
          }
        }
      }
    });
  }
}


