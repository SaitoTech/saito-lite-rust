const LeagueMainTemplate = require("./league-main.template");


class LeagueMain {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
  }

  render(app, mod) {

    if (!document.getElementById("league-main")) {
      app.browser.addElementToDom(LeagueMainTemplate(app, mod));
    }

    this.attachEvents(app, mod);
  }


  attachEvents(app, mod) {
    if (document.getElementById('create-form')) {
      document.getElementById('create-form').addEventListener('submit', function(e){
          e.preventDefault();

          let formData = {};
          formData.game = e.target.game.value;
          formData.players = e.target.players.value;
          formData.type = e.target.type.value;

          this.mod.createLeagueTransaction(formData);  
          alert("Creating league...");
        
      });
    }
  }
}

module.exports = LeagueMain;

