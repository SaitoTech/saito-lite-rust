const LeagueMainTemplate = require("./league-main.template");


class LeagueMain {

  constructor(app) {
  }

  render(app, mod) {

    if (!document.getElementById("league-main")) {
      app.browser.addElementToDom(LeagueMainTemplate(app, mod));
    }

  }

}

module.exports = LeagueMain;

