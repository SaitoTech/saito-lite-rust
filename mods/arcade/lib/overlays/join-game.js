const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');
const JoinGameOverlayTemplate = require('./join-game.template');

class JoinGameOverlay {

  constructor(app, mod, tx=null) {
    this.app = app;
    this.mod = mod;
    this.invite_tx = tx;
    this.overlay = new SaitoOverlay(app, mod, false, true);
  }

  render() {
    
    let txmsg = this.invite_tx.returnMessage();
    let modname = txmsg.name;
    if (!modname) { modname = txmsg.game; }
    if (!modname) { modname = txmsg.module; }
console.log("TXMSG: " + JSON.stringify(txmsg));

    let game_mod = this.app.modules.returnModuleByName(modname);

    this.overlay.show(JoinGameOverlayTemplate(this.app, this.mod, this.invite_tx));
    this.overlay.setBackground(game_mod.returnArcadeImg());
    this.attachEvents();
  }
  
  attachEvents() {

    document.querySelector(".arcade-game-controls-join-game").onclick = (e) => {

      //
      // join or accept?
      //
      let newtx;
      let txmsg = this.invite_tx.returnMessage();
      let players_needed = parseInt(txmsg.players_needed);
      let players_current = parseInt(txmsg.players_sigs.length);

      if (players_needed == (players_current-1)) {
        newtx = this.mod.createJoinTransaction(this.invite_tx);
      } else {
        newtx = this.mod.createAcceptTransaction(this.invite_tx);
        this.app.connection.emit("arcade-game-initialize-render-request", (newtx.transaction.sig));
      }

      //
      // send on-chain
      //
      this.app.network.propagateTransaction(newtx);

      //
      // refresh with latest data, including me !
      //
      let newtxmsg = newtx.returnMessage();
      let players = newtxmsg.players;

      //
      // send off-chain
      //
      let relay_mod = this.app.modules.returnModule("Relay");
      if (relay_mod != null) {
        relay_mod.sendRelayMessage(players, "arcade spv update", newtx);
      }

      //
      // hello world!
      //
      salert("Joining game! Please wait a moment");

      //
      // hide overlay
      //
      this.overlay.hide();
 
      //
      // let main panel take action
      //
      this.app.connection.emit("arcade-invite-manager-render-request");        

    }
  }

}


module.exports = JoinGameOverlay;

