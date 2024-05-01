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

	renderPlayerbox(player) {
	  
	  let publickey = this.game_mod.game.players[player-1];
	  let qs = `.playerbox-${publickey}`;
	  if (!document.querySelector(qs)) { this.addPlayerbox(player); }
	  document.querySelector(qs).innerHTML = "render";
	}

	renderPlayerboxes(player) {
	  for (let i = 0; i < this.game_mod.game.players.length; i++) {
	    this.renderPlayerbox((i+1));
	  }
	}

	renderBalance(player) {

	}

	renderUserline(html, player) {
console.log("RENDER USERLINE");
	}


	attachEvents() {
	}


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

