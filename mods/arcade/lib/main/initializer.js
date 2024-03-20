const InitializerTemplate = require('./initializer.template');

class Initializer {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = container;

		app.connection.on(
			'arcade-game-ready-render-request',
			(game_details) => {
				this.render(game_details.id);
				this.notify(game_details.name);
				this.attachEvents(game_details.slug);
				siteMessage(`${game_details.name} ready to play!`);
			}
		);

		app.connection.on('arcade-close-game', (game_id) => {
			if (game_id == this?.game_id) {
				this.mod.is_game_initializing = false;
				this.app.connection.emit('rerender-whole-arcade');
			}
		});
	}

	render(game_id = null) {
		this.mod.is_game_initializing = true;
		this.game_id = game_id;

		let html = InitializerTemplate(game_id);

		if (document.querySelector('.arcade-initializer')) {
			this.app.browser.replaceElementBySelector(
				html,
				'.arcade-initializer'
			);
		} else {
			this.app.browser.addElementToSelector(html, this.container);
		}
	}

	notify(game_name) {

		//Flash Tab if not in Saito
		this.app.browser.createTabNotification('Game ready!', game_name);

		//Play chime no matter what
		try{
			let chime = new Audio("/saito/sound/Jinja.mp3");
			chime.play();
		}catch(err){
			console.error(err);
		}
	}


	attachEvents(slug) {
		if (document.querySelector('.arcade-game-initializer-success-button')) {
			document.querySelector(
				'.arcade-game-initializer-success-button'
			).onclick = (e) => {
				//Remember where we enter the game from
				let am = this.app.modules.returnActiveModule().returnName();
				this.app.options.homeModule = am;
				this.app.storage.saveOptions();

				this.app.browser.logMatomoEvent(
					'StartGameClick',
					am,
					slug.slice(0, 1).toUpperCase() + slug.slice(1)
				);

				//Make sure we have enough time to save the options
				setTimeout(() => {
					window.location = '/' + slug;
				}, 400);
			};
		}
	}


}

module.exports = Initializer;
