const LeagueComponentAdminBoxTemplate = require("./admin-box.template");


class AdminBox {

  constructor(app, mod, game_mod=null) {

    this.app = app;
    this.mod = mod;
    this.game_mod = game_mod;

    app.connection.on("league-update", (league) => {
      console.log("ADMIN BOX RECEIVES EVENT -- re-renders?");
    });

  }

  render(app, mod) {

    app.browser.addElementToDom(LeagueComponentAdminBoxTemplate(app, mod, this.game_mod), document.getElementById("league-main-container-games"));
    this.attachEvents(app, mod);


  }


  attachEvents(app, mod) {
    Array.from(document.getElementsByClassName('league-component-admin-box-form')).forEach(box => {
      async () => {
        box.onsubmit = (e) => {
          e.preventDefault();
   	  mod.sendCreateLeagueTransaction(e.target.game.value, e.target.type.value);
          alert('League created');
          location.reload();
        }
      }
    });
  }
}

module.exports = AdminBox;

