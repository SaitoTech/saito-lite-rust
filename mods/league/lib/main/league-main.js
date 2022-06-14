const LeagueCreateBtn = require('./../components/league-create-btn');

module.exports = LeagueMain = {
    render(app, mod) {
      if (app.BROWSER == 0) { 
        return; 
      }

      console.log('inside league main render');

      if (mod.renderMode == "league-create-btn") {
      	
        console.log('inside league main if');
        LeagueCreateBtn.render(app, mod);
      	LeagueCreateBtn.attachEvents(app, mod);
      }
    },
}
