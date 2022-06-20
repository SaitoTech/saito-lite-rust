const LeagueMainContainerTemplate    = require("./container.template");
const LeagueComponentAdminBox = require("./../components/admin-box");


class Container {

  constructor(app, mod) {

    this.app = app;
    this.mod = mod;

    this.leagues = [];

    this.mod.games.forEach((game, i) => {
        this.leagues.push(new LeagueComponentAdminBox(app, mod, game));
    });
  }

  render(app, mod) {

    //
    // render main template
    //
    if (!document.getElementById("league-main")) {
      app.browser.addElementToDom(LeagueMainContainerTemplate(app, mod));
    }

    //
    // render league boxes
    //
    for (let i = 0; i < this.leagues.length; i++) {
      this.leagues[i].render(app, mod);
    }

  }
}

module.exports = Container;

