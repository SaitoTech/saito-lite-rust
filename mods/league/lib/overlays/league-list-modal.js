const LeagueListModalTemplate= require('./league-list-modal.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');
const LeagueWizard = require("./../components/league-wizard");

 class LeagueListModal {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.title = "Game";
    this.prompt = "Select a game for your league";
    this.list = "";
    this.overlay = new SaitoOverlay(this.app, this.mod);
  }

  render() {
    this.overlay.show(LeagueListModalTemplate(this.app, this.mod, this));

    this.attachEvents();
  }

  attachEvents() {
    modal_self = this;
    Array.from(document.querySelectorAll('#selection-list li')).forEach(game => {
      game.addEventListener('click', (e) => {
        let gameName = e.target.getAttribute("data-id");
        modal_self.overlay.remove();
        console.log(gameName);

        let gameMod = modal_self.app.modules.returnModule(gameName);
        if (!gameMod){ console.log("No game module"); return;}
        let wizard = new LeagueWizard(modal_self.app, modal_self.mod, gameMod);
        wizard.render(modal_self.app, modal_self.mod);
      });
    });
  }
  
}


module.exports = LeagueListModal;

