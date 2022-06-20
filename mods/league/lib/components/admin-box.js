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

module.exports = AdminBox;

