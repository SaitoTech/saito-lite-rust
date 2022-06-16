const LeagueMainTemplate    = require("./league-main.template");
const LeagueCreateLeagueBox = require("./../components/league-create-league-box");



class LeagueMain {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
  }

  render(app, mod) {

    if (!document.getElementById("league-main")) {
      app.browser.addElementToDom(LeagueMainTemplate(app, mod));
    }

    LeagueCreateLeagueBox.render(app, mod);
  }
}

module.exports = LeagueMain;

