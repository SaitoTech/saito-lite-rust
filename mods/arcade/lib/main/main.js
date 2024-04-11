const JSON = require('json-bigint');
const ArcadeMainTemplate = require('./main.template');
const ArcadeInitializer = require('./initializer');

class ArcadeMain {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;



		//
		// load init page
		//
		app.connection.on('arcade-game-initialize-render-request', (game_id) => {
			document.querySelector('.arcade-main').innerHTML = '';

			if (document.getElementById('saito-container')) {
				document.getElementById('saito-container').scrollTop = 0;
			}

			let initializer = new ArcadeInitializer(
				this.app,
				this.mod,
				'.arcade-main'
			);

			this.mod.is_game_initializing = true;
			initializer.game_id = game_id;

			initializer.render();
		});

		app.connection.on('rerender-whole-arcade', () => {
			this.render();
		});
	}

	async render() {
		if (document.querySelector('.saito-container')) {
			this.app.browser.replaceElementBySelector(
				ArcadeMainTemplate(this.app, this.mod),
				'.saito-container'
			);
		} else {
			this.app.browser.addElementToSelector(
				ArcadeMainTemplate(this.app, this.mod),
				this.container
			);
		}

		//
		// invite manager
		//
		await this.app.modules.renderInto('.arcade-invites-box');

		//
		// appspace modules
		//
		await this.app.modules.renderInto('.arcade-leagues');

		this.attachEvents();
	}

	attachEvents() {
		/*

		const scrollableElement = document.querySelector('.saito-container');
		const sidebar = document.querySelector('.saito-sidebar.right');
		let scrollTop = 0;
		let stop = 0;

		scrollableElement.addEventListener('scroll', (e) => {
			if (window.innerHeight - 150 < sidebar.clientHeight) {
				if (scrollTop < scrollableElement.scrollTop) {
					stop =
						window.innerHeight -
						sidebar.clientHeight +
						scrollableElement.scrollTop;
					if (
						scrollableElement.scrollTop + window.innerHeight >
						sidebar.clientHeight
					) {
						sidebar.style.top = stop + 'px';
					}
				} else {
					if (stop > scrollableElement.scrollTop) {
						stop = scrollableElement.scrollTop;
						sidebar.style.top = stop + 'px';
					}
				}
			} else {
				stop = scrollableElement.scrollTop;
				sidebar.style.top = stop + 'px';
			}
			scrollTop = scrollableElement.scrollTop;
		});
		*/
	}
}

module.exports = ArcadeMain;
