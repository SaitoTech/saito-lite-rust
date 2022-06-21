const LeagueComponentExistingLeagueTemplate = require("./existing-league.template");


class ExistingLeague {

  constructor(app, mod, game) {
    this.app = app;
    this.mod = mod;
    this.game = game;
  }

  render(app, mod) {
    app.browser.addElementToDom(LeagueComponentExistingLeagueTemplate(app, mod, this.game), "league-component-existing-league");
    this.attachEvents(app, mod);
  }

  attachEvents(app, mod) {
    Array.from(document.getElementsByClassName('league-component-existing-league-join')).forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        let league_id = btn.getAttribute('data-league-id');
	mod.sendJoinLeagueTransaction(league_id);
        alert('League joined');
        location.reload();
      }
    });
  }
}

module.exports = ExistingLeague;

