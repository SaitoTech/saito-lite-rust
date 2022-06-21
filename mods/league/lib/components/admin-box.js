const LeagueComponentAdminBoxTemplate = require("./admin-box.template");


class AdminBox {

  constructor(app, mod, game_mod=null) {
    this.app = app;
    this.mod = mod;
    this.game_mod = game_mod;
  }

  render(app, mod) {
    app.browser.addElementToDom(LeagueComponentAdminBoxTemplate(app, mod, this.game_mod), "league-main-container-games");
    this.attachEvents(app, mod);
  }


  attachEvents(app, mod) {
    Array.from(document.getElementsByClassName('league-component-admin-box-form')).forEach(box => {
      box.onsubmit = (e) => {
        e.preventDefault();

        let formData = {
          module: "League",
          game: e.target.game.value,
          request: "create_league",
          type: e.target.type.value, // private or public
          timestamp: new Date().getTime()
        };

        mod.createTransaction(formData);
        alert('League created');
        location.reload();
      }
    });
  }
}

module.exports = AdminBox;

