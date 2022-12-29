const LeagueListModalTemplate= require('./league-list-modal.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

 class LeagueListModal {

  constructor(app, mod, callback = () => { }) {
    this.app = app;
    this.mod = mod;
    this.callback = callback;
    this.title = "Game";
    this.prompt = "Select a game for your league";
    this.list = "";
    this.overlay = new SaitoOverlay(this.app, this.mod);
  }

  render() {
    modal_self = this;
    this.overlay.show(LeagueListModalTemplate(this.app, this.mod, this));

    Array.from(document.querySelectorAll('#selection-list li')).forEach(game => {
      game.addEventListener('click', (e) => {
        let gameName = e.target.getAttribute("data-id");
        modal_self.overlay.remove();
        console.log(gameName);
        this.callback(gameName);
      });
    });

    console.log(this.callback);
  }
  
}


module.exports = LeagueListModal;

