const JSON = require('json-bigint');
const ArcadeMainTemplate = require('./main.template');
const ArcadeInitializer = require('./initializer');

class ArcadeMain {
	constructor(app, mod, container = 'body') {
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
		// invites box modules
		//
		await this.app.modules.renderInto('.arcade-sidebar');

		this.attachEvents();
	}

	attachEvents() {

		let gameListContainerAlt = document.querySelector(".arcade-main");
		let gameListContainer = document.querySelector(".arcade-game-filter-list")

		const intersectionObserver = new IntersectionObserver((entries) => {
		  entries.forEach(entry => {
			  if (entry.intersectionRatio <= 0) {
			  	if (entry.target.id == "top-of-game-list"){
			  		gameListContainer.classList.add("can-scroll-up");
			  	}else{
			  		gameListContainerAlt.classList.add("can-scroll-down");
			  	}
			  }else{
			  	if (entry.target.id == "top-of-game-list"){
			  		gameListContainer.classList.remove("can-scroll-up");
			  	}else{
			  		gameListContainerAlt.classList.remove("can-scroll-down");
			  	}
			  }
		  });
		});
		// start observing
		intersectionObserver.observe(document.getElementById("top-of-game-list"));
		intersectionObserver.observe(document.getElementById("bottom-of-game-list"));


		Array.from(
			document.querySelectorAll('.arcade-game-selector-game')
		).forEach((game) => {
			game.onclick = (e) => {
				e.stopPropagation();
				let modname = e.currentTarget.getAttribute('data-league');

				this.app.browser.logMatomoEvent(
					'LeagueOverlay',
					'GameSelector',
					modname
				);

				this.app.connection.emit(
						'league-overlay-render-request',
						modname
				);

			};
		});


	}
}

module.exports = ArcadeMain;
