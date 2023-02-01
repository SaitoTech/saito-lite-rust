const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');
const JoinGameOverlayTemplate = require('./join-game.template');

/*
  General Interface for the Overlay that comes up when you click on a (game) "invite".
  There are several circumstances that affect what a user can do with the overlay, but because
  so much of the UI is identical it is better to have it all in one file instead of multiple
  files with the logic spread out across all the places where you might need to trigger the overlay.

  The basic purpose is to display the game details (results of game-selector/game-wizard) and allow a player to join/cance
*/

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

    //
    // This is a little complicated because an initialized game will persist in the 
    // app.options and keep getting added back to the arcade list because it didn't 
    // reach a gameover. So, we send a game over request through the game, but if the opponent
    // isn't online it doesn't process, so we need an additional fallback just to make 
    // sure we aren't annoyed by being unable to close a game.
    // Of course, forfeiting a game might hurt one's leaderboard standings, but the leaderboard
    // and game engine have checks to prevent that in most cases where a game breaks early on
    //
    if (document.getElementById("arcade-game-controls-forfeit-game")){
      document.getElementById("arcade-game-controls-forfeit-game").onclick = (e) => {
          this.mod.removeGame(this.invite.game_id);
          this.overlay.remove();

          for (let i = 0; i < this.app.options?.games.length; i++) {
            if (this.app.options.games[i].id == this.invite.game_id) { 
              let gamemod = this.app.modules.returnModule(this.app.options.games[i].module);
              if (gamemod) {
                gamemod.resignGame(this.invite.game_id, "cancellation");
                setTimeout(()=>{ 
                  gamemod.removeGameFromOptions(this.invite.game_id);
                  this.mod.sendCloseTransaction(this.invite.game_id); 
                }, 3000);
                return;
              }
            }
          }

          this.mod.sendCloseTransaction(this.invite.game_id); 
      }
    }
    if (document.getElementById("arcade-game-controls-cancel-join")){
      document.getElementById("arcade-game-controls-cancel-join").onclick = (e) => {
          this.mod.sendCancelTransaction(this.invite.game_id);
          this.overlay.remove();
      }
    }

  }

}


module.exports = JoinGameOverlay;

