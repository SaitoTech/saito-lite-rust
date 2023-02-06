const LeagueWizard = require("./overlays/league-wizard");
const LeagueMainTemplate    = require("./main.template");
const LeagueComponentExistingLeague = require("./components/existing-league");

class LeagueMain {

  constructor(app, mod) {

    this.app = app;
    this.mod = mod;
    this.wizard = null;

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

    let leagues = this.mod.leagues;

    let filter1 = leagues.filter(l => l.admin == this.app.wallet.returnPublicKey());
    let filter2 = leagues.filter(l => l.myRank > 0 && l.admin != this.app.wallet.returnPublicKey());
    let filter3 = leagues.filter(l => l.myRank <= 0 && l.admin != this.app.wallet.returnPublicKey());

    if (filter1.length > 0) {
      filter1.forEach((game) => {
        LeagueComponentExistingLeague.render(this.app, this.mod, game, "leagues-for-admin");
      });
    }

    if (filter2.length > 0) {
      filter2.forEach((game) => {
        LeagueComponentExistingLeague.render(this.app, this.mod, game, "leagues-for-play");
      });
    }

    if (filter3.length > 0) {
      filter3.forEach((game) => {
        LeagueComponentExistingLeague.render(this.app, this.mod, game, "leagues-for-join");
      });
    }

    this.attachEvents();
    LeagueComponentExistingLeague.attachEvents(this.app, this.mod);
  }


  attachEvents() {

    if (document.getElementById('create-new-league')) {
      document.getElementById('create-new-league').onclick = () => {

        this.app.connection.emit("arcade-launch-game-selector", { 
	  callback : (obj) => {
    	    if (this.wizard != null) { delete this.wizard; }
	    let game_mod = this.app.modules.returnModuleByName(obj.game);
	    this.wizard = new LeagueWizard(this.app, this.mod, game_mod);
            this.wizard.render();
	  }
	});

      }
    }
  }



}

module.exports = LeagueMain;

