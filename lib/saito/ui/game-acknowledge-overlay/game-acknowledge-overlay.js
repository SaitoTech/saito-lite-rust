const GameAcknowledgeOverlayTemplate = require('./game-acknowledge-overlay.template');
const SaitoOverlay = require('./../saito-overlay/saito-overlay');

class GameAcknowledgeOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
	}

	hide() {
		this.visible = 0;
		this.overlay.hide();
	}

	render(msg = '', img = '') {
		this.visible = 1;
		this.overlay.show(GameAcknowledgeOverlayTemplate(msg));
		try {
			document.querySelector(
				'.game-acknowledge-overlay'
			).style.backgroundImage = `url(${img});`;
			document.querySelector(
				'.game-acknowledge-menu'
			).innerHTML = `<div class="game-acknowledge-notice">${msg}</div><ul><li class="textchoice acknowledge" id="acknowledge">acknowledge</li></ul>`;
		} catch (err) {}
	}
}

module.exports = GameAcknowledgeOverlay;
