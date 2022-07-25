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
    if (!document.getElementById("league-main-container")) {
      app.browser.addElementToDom(LeagueMainContainerTemplate(app, mod));
    }

    //
    // render league creation boxes
    //
    LeagueComponentAdminBox.render(app, mod, this.mod.games);

    //
    // render existing league componenets
    //
    let leagues_to_display = mod.filterLeagues(app);
    leagues_to_display.forEach((game, i) => {
      LeagueComponentExistingLeague.render(app, mod, game);
    });
  }
}

module.exports = Container;

