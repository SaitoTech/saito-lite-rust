const LeagueComponentExistingLeagueTemplate = require("./existing-league.template");

module.exports = ExistingLeague = {

  render(app, mod, league, id) {
    if (!document.getElementById(league.id)) {
      app.browser.addElementToId(LeagueComponentExistingLeagueTemplate(app, mod, league), id);
    } else {
      app.browser.replaceElementById(LeagueComponentExistingLeagueTemplate(app, mod, league), league.id);
    }
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
          app.connection.emit("view-league-details", league_id);
        }
        if (cmd == "invite") {
          mod.showShareLink(league_id);
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


