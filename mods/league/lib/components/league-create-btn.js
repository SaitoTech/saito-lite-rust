const LeagueCreateBtnTemplate = require('./../components/league-create-btn');

module.exports = LeagueCreateBtn = {
    render(app, mod) {
      if (app.BROWSER == 0) { 
        return; 
      }

      console.log('inside create btn render');
      app.browser.addElementToDom(LeagueCreateBtnTemplate(), "game-wizard-invite");
    },

    attachEvents(app, mod) {

    }
}
