const GameHelpTemplate = require('./game-help.template');
const WelcomeTemplate = require('./game-help-overlay.template');
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
		this.overlay = new SaitoOverlay(this.app, this.game_mod);
	}

	hide() {
		let gh = document.querySelector('.game-help-triangle');
		if (gh) {
			gh.classList.remove('game-help-visible');
			gh.classList.add('game-help-hidden');
		}
	}

	renderCustomOverlay(obj = {}) {

		this.overlay.show(WelcomeTemplate());

		if (obj.title) {
			document.querySelector('.game-help-overlay-title').innerHTML = obj.title;
		}
		if (obj.text) {
			document.querySelector('.game-help-overlay-text').innerHTML = obj.text;
		}
		if (obj.img) {
			document.querySelector('.game-help-overlay').style.backgroundImage = `url(${obj.img})`;
		}

	}

	render(targs = {}) {

		if (targs.id){
			if (this.game_mod.loadGamePreference(`settlers_help_${targs.id}`)){
				return;
			}
		}

		let gh = document.querySelector('.game-help-triangle');
		if (gh) {
			gh.classList.remove('game-help-hidden');
			gh.classList.add('game-help-visible');
		} else {
			this.app.browser.addElementToDom(GameHelpTemplate(targs));
			gh = document.querySelector('.game-help-triangle');
		}
		if (targs.line1) {
			document.querySelector('.game-help-text .line1').innerHTML = targs.line1;
		}
		if (targs.line2) {
			document.querySelector('.game-help-text .line2').innerHTML = targs.line2;
		}
		this.attachEvents(targs);
	}

	attachEvents(targs = {}) {
		let gh = document.querySelector('.game-help-triangle');
		gh.onclick = (e) => {
			this.hide();
			this.renderCustomOverlay(targs);

			// Overlay events
			if (document.querySelector(".game-help-overlay-optout")){
				document.querySelector(".game-help-overlay-optout").onclick = (e) => {
					this.game_mod.saveGamePreference(`settlers_help_${targs.id}`, 'noshow');
					this.overlay.close();
				}
			}
		};
	}

}

module.exports = GameHelp;
