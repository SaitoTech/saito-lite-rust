const ArcadeMenuTemplate = require('./menu.template');

class ArcadeMenu {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = container;
	}

	async render() {
		//
		// create HTML of games list
		//
		let gamelist = [];
		let html = '';
		for (let i = 0; i < this.mod.arcade_games.length; i++) {
			let game_mod = this.mod.arcade_games[i];
			gamelist.push([
				game_mod.categories,
				`<li class="arcade-menu-item" id="${
					game_mod.name
				}">${game_mod.returnName()}</li>`
			]);
		}
		if (!this.mod.manual_ordering) {
			gamelist.sort(function (a, b) {
				if (a[0] > b[0]) {
					return 1;
				}
				if (a[0] < b[0]) {
					return -1;
				}
				return 0;
			});
		}
		for (let g of gamelist) {
			html += g[1];
		}

		if (document.querySelector('.arcade-menu')) {
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

		let gameListContainer = document.querySelector(".arcade-menu");
		let gameListContainerAlt = document.querySelector(".arcade-game-list-container")

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
	}
}

module.exports = ArcadeMenu;
