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

  render(app, mod) {
    this.overlay.show(this.app, this.mod, GameInviteDetailsTemplate(app, mod));
    this.attachEvents(app, mod);
  }

  
  attachEvents(app, mod) {

  }

}


module.exports = GameInviteDetails;

