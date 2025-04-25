const GameHelpTemplate = require('./game-help.template');
const WelcomeTemplate = require('./welcome.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

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
			document.querySelector('.welcome-title').innerHTML = obj.title;
		}
		if (obj.text) {
			document.querySelector('.welcome-text').innerHTML = obj.text;
		}
		if (obj.img) {
			document.querySelector('.welcome').style.backgroundImage = `url(${obj.img})`;
		}

		// this will clear any ACKNOWLEDGE
		this.attachEvents();
	}

	render(targs = {}) {

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
		};
	}

}

module.exports = GameHelp;
