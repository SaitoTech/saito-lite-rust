const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');
const ContinueGameOverlayTemplate = require('./continue-game.template');

class ContinueGameOverlay {

  constructor(app, mod, tx=null) {
    this.app = app;
    this.mod = mod;
    this.invite_tx = tx;
    this.invite = null;
    this.overlay = new SaitoOverlay(app, mod, false, true);
  }

  render() {

    console.log('inside continue-game overlay');
    
    let txmsg = this.invite_tx.returnMessage();
    let modname = txmsg.name;
    if (!modname) { modname = txmsg.game; }
    if (!modname) { modname = txmsg.module; }
    let game_mod = this.app.modules.returnModuleByName(modname);

    this.overlay.show(ContinueGameOverlayTemplate(this.app, this.mod, this));
    this.overlay.setBackground(`/${game_mod.returnSlug()}/img/arcade/arcade.jpg`);

    this.attachEvents();

  }
  

  attachEvents() {

    document.querySelector(".arcade-game-controls-continue-game").onclick = (e) => {
        let game_id = e.currentTarget.getAttribute("data-id");      
	let game_tx = this.mod.returnGame(game_id);
console.log("GAME: " + JSON.stringify(game_tx.msg));
        let modname = game_tx.msg.options.game;
        let game_mod = this.app.modules.returnModuleByName(modname);
	window.location = `/${game_mod.returnSlug()}/#gid=${game_id}`;
  	return;
    }
    document.querySelector(".arcade-game-controls-cancel-game").onclick = (e) => {
        let game_id = e.currentTarget.getAttribute("data-id");      

    }

  }

}


module.exports = ContinueGameOverlay;

