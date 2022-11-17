const LeagueMainContainerTemplate    = require("./container.template");
const LeagueWizard = require("./../components/league-wizard");
const ListSelectionModal = require('./../../../../lib/saito/new-ui/modals/list-selection-modal/list-selection-modal');
const LeagueComponentExistingLeague = require("./../components/existing-league");
const LeagueJoinOverlay = require("./../overlays/join-league-overlay");

class Container {

  constructor(app, mod) {

    this.app = app;
    this.mod = mod;

  }

  render(app, mod) {

    //
    // Wipe the main container and create a fresh build render main template
    //
    app.browser.replaceElementById(LeagueMainContainerTemplate(), "league-main-container");

    let leagues = mod.filterLeagues(app, false);
    let filter1 = leagues.filter( l => l.admin == app.wallet.returnPublicKey() );
    let filter2 = leagues.filter( l => l.myRank > 0 && l.admin != app.wallet.returnPublicKey());
    let filter3 = leagues.filter( l => l.myRank <= 0 && l.admin != app.wallet.returnPublicKey());

    if (filter1.length > 0){
      filter1.forEach((game) => {
        LeagueComponentExistingLeague.render(app, mod, game, "leagues-for-admin");
      });
    }else{
      document.getElementById("leagues-for-admin").style.display = "none";
    }  

    if (filter2.length > 0){
      filter2.forEach((game) => {
        LeagueComponentExistingLeague.render(app, mod, game, "leagues-for-play");
      });
    }else{
      document.getElementById("leagues-for-play").style.display = "none";
    }  

    if (filter3.length > 0){
      filter3.forEach((game) => {
        LeagueComponentExistingLeague.render(app, mod, game, "leagues-for-join");
      });
    }else{
      document.getElementById("leagues-for-join").style.display = "none";
    }  


    let url = new URL(window.location.href);
    let league_id = url.searchParams.get("league_id");
    let action = url.searchParams.get("action");

    if (league_id != null && action == "join") {
      let league_join_overlay = new LeagueJoinOverlay(app);
      league_join_overlay.render(app, mod, league_id);
    }


    this.attachEvents(app, mod);
    LeagueComponentExistingLeague.attachEvents(app, mod);
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

