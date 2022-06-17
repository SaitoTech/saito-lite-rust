const LeagueCreateLeagueBoxTemplate = require("./league-create-league-box.template");


class LeagueCreateLeagueBox {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
  }

  render(app, mod) {

    

    // check if any games exist in arcade
    if (typeof mod.games != 'undefined' && mod.games.length > 0) {
      for (var i=0; i<mod.games.length; i++){
        let game = mod.games[i];
        app.browser.addElementToDom(LeagueCreateLeagueBoxTemplate(game), "league-avl-games-container");
      }
    
      this.attachEvents(app, mod);
    }
  }

  attachEvents(app, mod) {
    if (document.getElementById('create-form')) {
        document.getElementById('create-form').addEventListener('submit', function(e){
        e.preventDefault();

        let formData = {};
        formData.game = e.target.game.value;
        formData.type = e.target.type.value;

        
        mod.createMatchTransaction(formData);
      });
    }
  }
}

module.exports = LeagueCreateLeagueBox;

