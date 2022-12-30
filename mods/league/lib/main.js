const LeagueMainTemplate    = require("./main.template");
const LeagueListModal = require('./overlays/league-list-modal');
const LeagueComponentExistingLeague = require("./components/existing-league");
//const LeagueJoinOverlay = require("./../overlays/join-league-overlay");

class LeagueMain {

  constructor(app, mod) {

    this.app = app;
    this.mod = mod;

    app.connection.on("league-add-league", (league) => {
      this.render();
    });

  }

  render() {

    //
    // Wipe the main container and create a fresh build render main template
    //

    if (document.getElementById('league-main-container') != null) {
      this.app.browser.replaceElementBySelector(LeagueMainTemplate(), "#league-main-container");
    } else {
      this.app.browser.addElementToDom(LeagueMainTemplate());
    }

    

    let leagues = this.mod.filterLeagues(this.app, false);

    console.log("LEAGUES");
    console.log(leagues);

    let filter1 = leagues.filter( l => l.admin == this.app.wallet.returnPublicKey() );
    let filter2 = leagues.filter( l => l.myRank > 0 && l.admin != this.app.wallet.returnPublicKey());
    let filter3 = leagues.filter( l => l.myRank <= 0 && l.admin != this.app.wallet.returnPublicKey());

    console.log("FILTERSSS");
    console.log("filter1");
    console.log(filter1);
    console.log("filter");
    console.log(filter2);
    console.log("filter3");
    console.log(filter3);

    if (filter1.length > 0){
      filter1.forEach((game) => {
        LeagueComponentExistingLeague.render(this.app, this.mod, game, "leagues-for-admin");
      });
    }else{
      // if (document.getElementById("leagues-for-admin") != null)
      //   document.getElementById("leagues-for-admin").style.display = "none";
    }  

    if (filter2.length > 0){
      filter2.forEach((game) => {
        LeagueComponentExistingLeague.render(this.app, this.mod, game, "leagues-for-play");
      });
    }else{
      //if (document.getElementById("leagues-for-play") != null)
        //document.getElementById("leagues-for-play").style.display = "none";
    }  

    if (filter3.length > 0){
      filter3.forEach((game) => {
        LeagueComponentExistingLeague.render(this.app, this.mod, game, "leagues-for-join");
      });
    }else{
      //if (document.getElementById("leagues-for-join") != null)
        //document.getElementById("leagues-for-join").style.display = "none";
    }  


    // let url = new URL(window.location.href);
    // let league_id = url.searchParams.get("league_id");
    // let action = url.searchParams.get("action");

    // if (league_id != null && action == "join") {
    //   let league_join_overlay = new LeagueJoinOverlay(app);
    //   league_join_overlay.render(this.app, mod, league_id);
    // }


    this.attachEvents();
    LeagueComponentExistingLeague.attachEvents(this.app, this.mod);
  }


  attachEvents(){
    main_self = this;

    if (document.getElementById('create-new-league')){
      document.getElementById('create-new-league').onclick = () =>{

        let html = "";
        main_self.app.modules.respondTo("arcade-games").forEach(game_mod => {
          html += `<li data-id="${game_mod.name}">${game_mod.gamename || game_mod.name}</li>`;
        });

        console.log("RESPONDTO");
        console.log(main_self.app.modules.respondTo("arcade-games"));

        console.log("HTML");
        console.log(html);        

        let selector = new LeagueListModal(main_self.app, main_self.mod);

        selector.title = "Games";
        selector.prompt = "Select a game for your league";
        selector.list = html;
        selector.render();
      }
    }
  }
}

module.exports = LeagueMain;

