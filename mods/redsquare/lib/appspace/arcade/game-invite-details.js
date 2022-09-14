const saito = require('./../../../../../lib/saito/saito');
const GameInviteDetailsTemplate = require('./game-invite-details.template');
const ArcadeGameDetails = require('./../../../../arcade/lib/arcade-game/arcade-game-details');
const SaitoOverlay = require('./../../../../../lib/saito/new-ui/saito-overlay/saito-overlay');


class GameInviteDetails {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.name = "GameInviteDetails";
    this.overlay = new SaitoOverlay(app, mod);
  }

  render(app, mod, invite = null) {
    this.overlay.show(this.app, this.mod, GameInviteDetailsTemplate(app, mod, invite));
    this.attachEvents(app, mod, invite);
  }

  
  attachEvents(app, mod, invite) {
    let btn = document.querySelector(".game-invite-join-btn");
    let classSelf = this;
    if (btn){
      btn.onclick = (e) => {
        //salert("Please visit the Arcade to play a game :P");
        app.connection.emit("join-game", invite.transaction.sig);
        classSelf.overlay.hide();
      }
    }
  }

}


module.exports = GameInviteDetails;

