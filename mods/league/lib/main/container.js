const LeagueMainContainerTemplate    = require("./container.template");
const LeagueComponentAdminBox = require("./../components/admin-box");
const LeagueComponentExistingLeague = require("./../components/existing-league");


class Container {

  constructor(app, mod) {

    this.app = app;
    this.mod = mod;

    this.leagues = [];
    this.existingLeaguesComponents = [];

    this.mod.games.forEach((game, i) => {
        this.leagues.push(new LeagueComponentAdminBox(app, mod, game));
    });
  }


  render(app, mod, template=null) {

    //
    // render main template
    //
    if (!document.getElementById("league-main-container")) {
      app.browser.addElementToDom(LeagueMainContainerTemplate(app, mod));
    }

    //
    // render league boxes
    //
    //if (template == "container") {
    for (let i = 0; i < this.leagues.length; i++) {
      this.leagues[i].render(app, mod);
    }
    //}

    //
    // render existing league componenets
    //
    //if (template == "existing_leagues") { 
      this.mod.leagues.forEach((game, i) => {
        this.existingLeaguesComponents.push(new LeagueComponentExistingLeague(app, mod, game));
        this.existingLeaguesComponents[i].render(app, mod);
      });
    //}
  }
}

module.exports = Container;

