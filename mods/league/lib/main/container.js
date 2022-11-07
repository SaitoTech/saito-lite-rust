const LeagueMainContainerTemplate    = require("./container.template");
const LeagueWizard = require("./../components/league-wizard");
const ListSelectionModal = require('./../../../../lib/saito/new-ui/modals/list-selection-modal/list-selection-modal');


class Container {

  constructor(app, mod) {

    this.app = app;
    this.mod = mod;

  }

  render(app, mod) {

    let leagues_to_display = mod.filterLeagues(app, false);

    //
    // Wipe the main container and create a fresh build render main template
    //
    app.browser.replaceElementById(LeagueMainContainerTemplate(app, mod, leagues_to_display), "league-main-container");

    this.attachEvents(app, mod);
  }


  attachEvents(app, mod){

    if (document.getElementById('create-new-league')){
      document.getElementById('create-new-league').onclick = () =>{

        let html = "";
        app.modules.respondTo("arcade-games").forEach(game_mod => {
          html += `<li data-id="${game_mod.name}">${game_mod.gamename || game_mod.name}</li>`;
        });

        let selector = new ListSelectionModal(app, (gamename) =>{
          console.log(gamename);
          let gameMod = app.modules.returnModule(gamename);
          if (!gameMod){ console.log("No game module"); return;}
          let wizard = new LeagueWizard(app, mod, gameMod);
          wizard.render(app, mod);
        });

        selector.render(app, "Games", "Select a game for your league", html);
      }
    }
  }
}

module.exports = Container;

