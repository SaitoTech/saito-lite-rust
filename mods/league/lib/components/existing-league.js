const LeagueComponentExistingLeagueTemplate = require("./existing-league.template");


class ExistingLeague {

  constructor(app, mod, game) {
    this.app = app;
    this.mod = mod;
    this.game = game;
  }

  render(app, mod) {
    console.log('inside existing component');
    console.log(this.game);
    app.browser.addElementToDom(LeagueComponentExistingLeagueTemplate(app, mod, this.game), "league-component-existing-league");
    this.attachEvents(app, mod);
  }


  attachEvents(app, mod) {
  }
}

module.exports = ExistingLeague;

