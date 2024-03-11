const LimboMenuTemplate = require('./menu.template');

class LimboMenu {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = container;
	}

	async render(space_list) {

		let html = '';


		if (document.getElementById('')) {
			this.app.browser.replaceElementBySelector(
				ArcadeMenuTemplate(html),
				'.arcade-menu'
			);
		} else {
			this.app.browser.addElementToSelector(
				ArcadeMenuTemplate(html),
				this.container
			);
		}

		this.attachEvents();
	}

	attachEvents() {
		let menu_self = this;

		Array.from(document.getElementsByClassName('arcade-menu-item')).forEach(
			(game) => {
				game.addEventListener('click', (e) => {
					this.app.browser.logMatomoEvent(
						'GameWizard',
						'ArcadeMenu',
						e.currentTarget.id
					);
					menu_self.app.connection.emit('arcade-launch-game-wizard', {
						game: e.currentTarget.id
					});
				});
			}
		);
	}
}

module.exports = LimboMenu;
