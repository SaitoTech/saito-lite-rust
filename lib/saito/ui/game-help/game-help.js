const GameHelpTemplate = require('./game-help.template');
const SaitoOverlay = require('./../saito-overlay/saito-overlay');

/**
 * GameHelp is a small triangle that will show up on the bottom-left of the 
 * screen and toggle an overlay that can be filled with customized advice
 * when the user clicks on it.
 */
class GameHelp {

	/**
	 * @param app - the Saito application
	 * @param mod - reference to the game module
	 */
	constructor(app, mod) {
		this.app = app;
		this.game_mod = mod;
	}

	hide() {
	  let gh = document.querySelector(".game-help");
	  if (gh) {
	    gh.classList.remove("game-help-visible");
	    gh.classList.add("game-help-hidden");
	  }
	}

	render() {
		let gh = document.querySelector(".game-help");
		if (gh) {
			gh.classList.remove("game-help-hidden");
			gh.classList.add("game-help-visible");
		} else {
			this.app.browser.addElementToDom(GameHelpTemplate());
		}
		this.attachEvents();
	}

	attachEvents() {

	  let gh = document.querySelector(".game-help");

	  gh.onclick = (e) => {
	    this.toggle();
	  }
	

	}

	toggle() {
	  let gh = document.querySelector(".game-help");
	  if (gh.classList.contains("game-help-visible")) {
	    this.hide();
	  } else {
	    this.render();
	  }
	}

}

module.exports = GameHelp;

