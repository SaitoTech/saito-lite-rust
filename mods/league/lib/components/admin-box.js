const LeagueComponentAdminBoxTemplate = require("./admin-box.template");


class AdminBox {

  constructor(app, mod, game_mod=null) {
    this.app = app;
    this.mod = mod;
    this.game_mod = game_mod;
  }

  render(app, mod) {
    app.browser.addElementToDom(LeagueComponentAdminBoxTemplate(app, mod, this.game_mod), "league-avl-games-container");
    this.attachEvents(app, mod);
  }


  attachEvents(app, mod) {
    Array.from(document.getElementsByClassName('league-main-create-form')).forEach(box => {
      box.onsubmit = (e) => {
        e.preventDefault();

        let formData = {};
        formData.game = e.target.game.value;
        formData.type = e.target.type.value;

        mod.createTransaction(formData);
      }
    });
  }
}

module.exports = AdminBox;

