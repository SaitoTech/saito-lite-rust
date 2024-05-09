const PlayerboxContainerTemplate = require('./playerbox-container.template');
const PlayerboxTemplate = require('./playerbox.template');

class GameBoard {

	/**
	 * @param app - the Saito application
	 * @param mod - reference to the game module
	 */
	constructor(app, mod) {
		this.app = app;
		this.game_mod = mod;
	}

	render() {
		this.app.browser.addElementToDom(PlayerboxContainerTemplate());
console.log("render!");
		for (let i = 0; i < this.game_mod.game.players.length; i++) { this.addPlayerbox((i+1)); }
		this.renderPlayerboxes();
		this.attachEvents();
	}

        setActive(player_number, deactivate_others = true) {
                let qs2 = `.game-playerbox.active`;
                let obj2 = document.querySelectorAll(qs2).forEach((el) => {
                        el.classList.remove('active');
                });
                let qs = `.game-playerbox-${player_number}`;
                let obj = document.querySelector(qs);
                if (obj) {
                        obj.classList.add('active');
                }
        }

        setInactive(player_number = -1) {
                if (player_number == -1) {
                        this.setActive(-1); // de-activate others, but won't set anything active
                        return;
                }
                let qs = `.game-playerbox-${player_number}`;
                let obj = document.querySelector(qs);
                if (obj) {
                        obj.classList.remove('active');
                }
        }


	renderPlayerbox(player) {
	  
	  let publickey = this.game_mod.game.players[player-1];
	  let qs = `.playerbox-${publickey}`;
	  if (!document.querySelector(qs)) { this.addPlayerbox(player); }
	}

	renderPlayerboxes(player) {
	  for (let i = 0; i < this.game_mod.game.players.length; i++) {
	    this.renderPlayerbox((i+1));
	  }
	}

	renderBalance(player) {

	}

	renderUserline(msg, player) {
	  let publickey = this.game_mod.game.players[player-1];
	  let qs = `.game-playerbox-head-${player} .saito-user .saito-userline`;
	  document.querySelector(qs).innerHTML = msg;
	}

	renderNotice(msg, player) {
	  let publickey = this.game_mod.game.players[player-1];
	  let qs = `.game-playerbox-body-${player}`;
	  document.querySelector(qs).innerHTML = msg;
	}

	attachEvents() {
	}

	updateIcons() {}

	updateGraphics() {}

	addPlayerbox(player) {

	  let publickey = this.game_mod.game.players[player-1];
	  let qs = `.playerbox-${publickey}`;

console.log("#");
console.log("#");
console.log("#");
console.log("adding playerbox for: " + publickey);

	  if (!document.querySelector(qs)) { 
	    if (player == this.game_mod.game.player) {
	      this.app.browser.addElementToSelector(PlayerboxTemplate(player, publickey, 1), '.mystuff');
	    } else {
	      this.app.browser.addElementToSelector(PlayerboxTemplate(player, publickey), '.playerboxes');
	    }
	  } else {
	    if (player == this.game_mod.game.player) {
	      this.app.browser.replaceElementBySelector(PlayerboxTemplate(player, publickey, 1), ".game-playerbox-seat-1");
	    } else {
	      this.app.browser.replaceElementBySelector(PlayerboxTemplate(player, publickey), qs);
	    }
	  }

	  this.renderPlayerboxes();

	}


}

module.exports = GameBoard;

