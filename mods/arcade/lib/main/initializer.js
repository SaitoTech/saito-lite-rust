const InitializerTemplate = require('./initializer.template');

class Initializer {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = container;

		app.connection.on(
			'arcade-game-ready-render-request',
			(game_details) => {

				let game_mod = app.modules.returnModuleBySlug(game_details?.slug);
				this.render(game_details?.id);

				if (!(game_mod?.maxPlayers == 1 || app.browser.isMobileBrowser())) {
					this.notify(game_details.name);				
				}

				this.attachEvents(game_details.slug);
			}
		);

		app.connection.on('arcade-close-game', (game_id) => {
			console.log("arcade-close-game", game_id, this?.game_id);
			if (game_id == this?.game_id) {
				this.mod.is_game_initializing = false;
				this.app.connection.emit('rerender-whole-arcade');
			}
		});
	}

	render(ready = false) {
		let html = InitializerTemplate(ready);

		if (document.querySelector(".arcade-container")){
			document.querySelector(".arcade-container").classList.add("initializing-game");
		}

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

		siteMessage(`${game_name} ready to play!`);

		//Play chime no matter what
		try{
			let chime = new Audio("/saito/sound/Jinja.mp3");
			try { chime.play(); } catch (err) {}
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
				let am = this.app.modules.returnActiveModule()?.returnName() || "Arcade";
				this.app.options.homeModule = am;
				this.app.storage.saveOptions();

				this.app.browser.logMatomoEvent(
					'StartGameClick',
					am,
					slug.slice(0, 1).toUpperCase() + slug.slice(1)
				);

				navigateWindow(`/${slug}`, 200);
			};
		}
	}


}

module.exports = Initializer;
