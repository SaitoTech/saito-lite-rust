const LeagueComponentExistingLeagueTemplate = require("./existing-league.template");


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
    Array.from(document.getElementsByClassName('league-component-existing-league-join')).forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        let league_id = btn.getAttribute('data-league-id');
	      mod.sendJoinLeagueTransaction(league_id);
        salert('League joined');
      }
    });
  }
}

module.exports = ExistingLeague;

