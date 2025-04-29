const GameSelectorTemplate = require('./game-selector.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

/*
  Creates an overlay of the list of available games, users can click to launch the game creation interface for that game
*/

class GameSelector {
	constructor(app, mod, obj = {}) {
		this.app = app;
		this.mod = mod;
		this.name = 'GameSelector';
		this.overlay = new SaitoOverlay(app, mod, true, false);
		this.obj = obj;

		this.app.connection.on('arcade-launch-game-selector', (obj = {}) => {
			mod.styles = [
				'/arcade/css/arcade-game-selector-overlay.css',
				'/arcade/css/arcade-overlays.css'
			];
			mod.attachStyleSheets();

			this.obj = obj;
			this.render();
			this.attachEvents();
		});
	}

	render() {
		if (document.querySelector(".game-selector-overlay")){
			this.overlay.show();
		}else{
			this.overlay.show(GameSelectorTemplate(this.app, this.mod, this));
			this.attachEvents();
		}		
	}

	attachEvents() {
		Array.from(
			document.querySelectorAll('.arcade-game-selector-game')
		).forEach((game) => {
			game.onclick = (e) => {
				e.stopPropagation();
				let modname = e.currentTarget.getAttribute('data-id');
				this.obj.game = modname;
				this.overlay.close();

				if (this.obj.callback != null) {
					this.obj.callback(this.obj);
				} else {
					this.app.browser.logMatomoEvent(
						'GameWizard',
						'GameSelector',
						modname
					);
					this.app.connection.emit(
						'arcade-launch-game-wizard',
						this.obj
					);
				}
			};
		});

		if (document.querySelector('.arcade-game-selector')) {
			document.querySelector('.arcade-game-selector').onclick = (e) => {
				this.overlay.close();
			};
		}
	}
}

module.exports = GameSelector;
