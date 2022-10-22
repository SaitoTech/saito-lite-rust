const GameInviteDetailsTemplate = require('./game-invite-details.template');
const SaitoOverlay = require('./../../../../lib/saito/new-ui/saito-overlay/saito-overlay');

/*
  To show details of an open game invite, so users may click to join
*/

class GameInviteDetails {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.name = "GameInviteDetails";
    this.overlay = new SaitoOverlay(app);
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
        app.connection.emit("join-game", invite.transaction.sig);
        classSelf.overlay.hide();
      }
    }
  }

}


module.exports = GameInviteDetails;

