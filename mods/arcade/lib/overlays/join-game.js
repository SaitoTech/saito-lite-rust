const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');
const JoinGameOverlayTemplate = require('./join-game.template');

class JoinGameOverlay {

  constructor(app, mod, invite) {
    this.app = app;
    this.mod = mod;
    this.invite = invite;
    this.overlay = new SaitoOverlay(app, mod, false, true);   //No close button, auto-delete overlay
  }

  render() {
    
    let game_mod = this.app.modules.returnModuleBySlug(this.invite.game_slug);

    this.overlay.show(JoinGameOverlayTemplate(this.app, this.mod, this.invite));
    this.overlay.setBackground(game_mod.returnArcadeImg());
    this.attachEvents();
  }
  
  attachEvents() {

    if (document.getElementById("arcade-game-controls-join-game")){
      document.getElementById("arcade-game-controls-join-game").onclick = (e) => {
          //
          // Create Transaction
          //
          let newtx = this.mod.createJoinTransaction(this.invite.tx);

          //
          // send it on-chain and off-chain
          //
          this.app.network.propagateTransaction(newtx);

          this.app.connection.emit("send-relay-message", {recipient: this.invite.players, request: "arcade spv update", data: newtx});
          this.app.connection.emit("send-relay-message", {recipient: "PEERS", request: "arcade spv update", data: newtx});

          this.overlay.remove();
     
          this.app.connection.emit("arcade-invite-manager-render-request");        
        }
     }

    if (document.getElementById("arcade-game-controls-continue-game")){
      document.getElementById("arcade-game-controls-continue-game").onclick = (e) => {
          window.location = `/${this.invite.game_slug}/#gid=${this.invite.game_id}`;
      }
    }
    
    if (document.getElementById("arcade-game-controls-cancel-game")){
      document.getElementById("arcade-game-controls-cancel-game").onclick = (e) => {
          this.mod.sendCloseTransaction(this.invite.game_id);
          this.mod.removeGame(this.invite.game_id);
          this.overlay.remove();
      }
    }

    if (document.getElementById("arcade-game-controls-cancel-invite")){
      document.getElementById("arcade-game-controls-cancel-invite").onclick = (e) => {
            this.mod.sendCloseTransaction(this.invite.game_id);
            this.mod.removeGame(this.invite.game_id);
            this.overlay.remove();
      }
    }

  }

}


module.exports = JoinGameOverlay;

