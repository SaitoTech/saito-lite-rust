//Code borrows heavily from:
//https://codepen.io/ambaqinejad/pen/ExRObmr
const GameSliderTemplate = require('./game-slider.template');

class GameSlider {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = container;
		this.name = 'GameSlider';
		this.interval = null;

		this.games = [];

		//
		// handle requests to re-render
		//
		this.app.connection.on('arcade-game-slider-render-request', () => {
			this.render();
		});
	}

	hide() {
		if (this.interval) {
			clearInterval(this.interval);
		}
		let obj = document.querySelector('.game-slider');
		if (obj) {
			obj.remove();
		}
	}

	render() {
		//
		// create HTML of games list
		//
		let gamelist = [];
		let html = '<ul class="slides">';
		let circles_html = '<div class="slides-circles">';
		for (const game_mod of this.mod.arcade_games) {
			gamelist.push([
				game_mod.categories,
				`<li class="slide arcade-game-slider-item-${game_mod.returnSlug()}" data-game="${
					game_mod.name
				}">
          <span class="game-slider-name">${game_mod.returnName()}</span>
          <img loading="lazy" alt="${game_mod.returnName()}" src="${game_mod.respondTo('arcade-games').banner}">
          </li>`
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

		let first = true;
		gamelist.forEach((game) => {
			if (first) {
				html += game[1].replace('<li', '<li data-active-slide');
				circles_html += '<div data-active-slide></div>';
				first = false;
			} else {
				html += game[1];
				circles_html += '<div></div>';
			}
		});

		html += '</ul>';
		html += circles_html + '</div>';

		if (document.querySelector('.game-slider')) {
			this.app.browser.replaceElementBySelector(
				GameSliderTemplate(html),
				'.game-slider'
			);
		} else {
			this.app.browser.addElementToSelector(
				GameSliderTemplate(html),
				this.container
			);
		}

		this.attachEvents();

		setTimeout(() => {
			if (document.querySelector(".game-slider")){
				document.querySelector(".game-slider").removeAttribute("style");	
			}
		}, 1000);
	}

	attachEvents() {
		const buttons = document.querySelectorAll('[data-slide-direction]');

		buttons.forEach((button) => {
			button.addEventListener('click', () => {
				const offset =
					button.dataset.slideDirection === 'next' ? 1 : -1;
				changeSlide(offset);
			});
		});

		const slides = document.querySelector('.slides');

		const changeSlide = (offset) => {
			const activeSlide = slides.querySelector('[data-active-slide]');
			let newIndex = [...slides.children].indexOf(activeSlide) + offset;
			newIndex =
				newIndex < 0
					? slides.children.length - 1
					: newIndex === slides.children.length
						? 0
						: newIndex;
			slides.children[newIndex].dataset.activeSlide = true;
			if (typeof activeSlide.dataset != 'undefined' &&
				activeSlide != null) {
				delete activeSlide.dataset.activeSlide;
			}
			/*
        const circles = document.querySelector(".slides-circles");
        const activeCircle = circles.querySelector("[data-active-slide]");
        circles.children[newIndex].dataset.activeSlide = true;
        delete activeCircle.dataset.activeSlide;
      */
		};

		this.interval = setInterval(changeSlide.bind(null, 1), 6000);

		slides.onclick = (e) => {
			e.stopPropagation();
			const activeSlide = slides.querySelector('[data-active-slide]');

			let modname = activeSlide.dataset.game;

			this.app.browser.logMatomoEvent(
				'GameWizard',
				'GameSlider',
				modname
			);
			this.app.connection.emit('arcade-launch-game-wizard', {
				game: modname
			});
		};
	}
}

module.exports = GameSlider;
