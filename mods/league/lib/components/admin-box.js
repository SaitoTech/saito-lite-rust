const LeagueComponentAdminBoxTemplate = require("./admin-box.template");


class AdminBox {

  constructor(app, mod, game_mod=null) {

    this.app = app;
    this.mod = mod;
    this.game_mod = game_mod;

    /*app.connection.on("league-update", (league) => {
      console.log("ADMIN BOX RECEIVES EVENT -- re-renders?",JSON.parse(JSON.stringify(league)));
    });*/

  }

  render(app, mod) {

    app.browser.addElementToDom(LeagueComponentAdminBoxTemplate(app, mod, this.game_mod), "league-main-container-games");
    this.attachEvents(app, mod);


  }


  attachEvents(app, mod) {
    Array.from(document.getElementsByClassName('league-component-admin-box-form')).forEach(box => {
      box.onsubmit = (e) => {
        e.preventDefault();
        let leaguename = sanitize(box.querySelector("#leaguename")?.textContent || e.target.game.value);
 	      mod.sendCreateLeagueTransaction(leaguename, e.target.game.value, e.target.type.value, e.target.ranking.value, e.target.max_players.value);
        salert('League created');
        //location.reload();
        return false;
      }
      
    });
  }
}

module.exports = AdminBox;

