const LeagueMainContainerTemplate    = require("./container.template");
const LeagueComponentAdminBox = require("./../components/admin-box");
const LeagueComponentExistingLeague = require("./../components/existing-league");


class Container {

  constructor(app, mod) {

    this.app = app;
    this.mod = mod;

  }


  render(app, mod, template=null) {

    //
    // Wipe the main container and create a fresh build render main template
    //
    if (document.getElementById("league-main-container")) {
      document.getElementById("league-main-container").remove();
    }
    app.browser.addElementToDom(LeagueMainContainerTemplate(app, mod));

    //
    // render league boxes
    //
    //if (template == "container") {
    this.mod.games.forEach((game, i) => {
        let league = new LeagueComponentAdminBox(app, mod, game);
        league.render(app, mod);
    });

    //}

    //
    // render existing league componenets
    //
    //if (template == "existing_leagues") { 
      this.mod.leagues.forEach((game, i) => {
        let league = new LeagueComponentExistingLeague(app, mod, game);
        league.render(app, mod);
      });
    //}
  }
}

module.exports = Container;

