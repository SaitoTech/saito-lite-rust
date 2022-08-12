const saito = require('./../../../../../lib/saito/saito');
const GameInviteDetailsTemplate = require('./game-invite-details.template');
const ArcadeGameDetails = require('./../../../../arcade/lib/arcade-game/arcade-game-details');
const SaitoOverlay = require('./../../../../../lib/saito/new-ui/saito-overlay/saito-overlay');


class GameInviteDetails {

  constructor(app, mod, invite = null) {
    this.app = app;
    this.mod = mod;
    this.name = "GameInviteDetails";
    this.overlay = new SaitoOverlay(app, mod);
    this.invite = invite;
  }

  render(app, mod, invite = null) {
    this.overlay.show(this.app, this.mod, GameInviteDetailsTemplate(app, mod, invite));
    this.attachEvents(app, mod);
  }

  
  attachEvents(app, mod) {
    let btn = document.querySelector(".game-invite-join-btn");
    if (btn){
      btn.onclick = () => {
        salert("Please visit the Arcade to play a game :P");
      }
    }
  }

}


module.exports = GameInviteDetails;

