const LeagueMainTemplate    = require("./league-main.template");
const LeagueAdminBox = require("./../components/league-admin-box");


class LeagueMain {

  constructor(app, mod) {

    this.app = app;
    this.mod = mod;

    this.leagues = [];
    foreach ( (let i = 0; i < this.mod.games.length; i++) { this.leagues.push(new LeagueAdminBox(app, mod, this.mod.games[i])); }

  }

  render(app, mod) {

    //
    // render main template
    //
    if (!document.getElementById("league-main")) {
      app.browser.addElementToDom(LeagueMainTemplate(app, mod));
    }

    //
    // render league boxes
    //
    for (let i = 0; i < this.leagues.length; i++) {
      this.leagues[i].render(app, mod);
    }

  }
}

module.exports = LeagueMain;

