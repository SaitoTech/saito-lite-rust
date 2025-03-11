const ImportGame = require('./import-game.js');
const GameWizardTemplate = require('./game-wizard.template.js');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay.js');

//
// {
//    game   : module_name
//    league : league_obj { id , name , mod }
// }
//

class GameWizard {

	constructor(app, mod, game_mod = null, obj = {}) {
		this.app = app;
		this.mod = mod;
		this.game_mod = game_mod;
		this.import_game = new ImportGame(app, mod, game_mod);
		this.overlay = new SaitoOverlay(app, mod);
		this.obj = obj;

		app.connection.on('arcade-launch-game-wizard', async (obj) => {
			if (obj?.game) {
				let game_mod = this.app.modules.returnModuleByName(obj.game);

				if (game_mod) {
					//
					// We do a little check that if we already have a game in the options,
					// we prompt them to continue that one instead of creating a new game
					//
					if (game_mod.doWeHaveAnOngoingGame()) {
						if (obj.skip){
							navigateWindow(`/${game_mod.returnSlug()}/`);
						}else{
							console.log('Found existing game', game_mod.game);
							app.connection.emit(
								'arcade-continue-game-from-options',
								game_mod
							);
						}
					} else {
						//Launch game wizard
						this.game_mod = game_mod;
						this.obj = obj;
						this.render();
					}

				} else {
					salert('Module not found: ' + obj.game);
				}
			}
		});
	}

	render() {
		//
		// Create the game wizard overlay
		//  & set a callback to remove the advanced options overlay if we change our mind about creating a game
		//
		if (this.mod.debug) {
			console.log(JSON.parse(JSON.stringify(this.obj)));
		}

		this.overlay.show(GameWizardTemplate(this.game_mod, this.obj), () => {
			if (this.meta_overlay) {
				this.meta_overlay.remove();
			}
		});
		this.overlay.setBackground(
			this.game_mod.respondTo('arcade-games').image
		);

		//Test if we should include Advanced Options
		let advancedOptions = this.game_mod.returnAdvancedOptions();
		if (!advancedOptions) {
			if (document.querySelector('.arcade-advance-opt-text')) {
				document.querySelector('.arcade-advance-opt-text').style.visibility =
					'hidden';
			}
		} else {
			console.log("Advanced Options!: ", advancedOptions);
			let accept_button = `<div id="game-wizard-advanced-return-btn" class="game-wizard-advanced-return-btn button saito-button-primary">Accept</div>`;
			if (!advancedOptions.includes(accept_button)) {
				advancedOptions += accept_button;
			}
			advancedOptions = `<div id="advanced-options-overlay-container">${advancedOptions}</div>`;

			this.meta_overlay = new SaitoOverlay(
				this.app,
				this.mod,
				false,
				false
			); // Have to manually delete when done
			this.meta_overlay.show(advancedOptions);
			this.meta_overlay.hide();
		}

		//Hook for Crypto module (if installed) to add button to attach functionality
		this.app.modules.renderInto("#arcade-advance-opt");

		this.attachEvents();

		if (this.obj?.skip){
			if (this.game_mod.maxPlayers === 1){
				if(!this.game_mod.returnSingularGameOption() && !advancedOptions){
					let btn = document.querySelector(".game-invite-btn");
					if (btn){
						btn.click();
					}
				}
			} 
		}

	}

	//
	// Note: mod = Arcade
	//
	attachEvents() {
		if (document.querySelector('.saito-multi-select_btn')) {
			document
				.querySelector('.saito-multi-select_btn')
				.addEventListener('click', (e) => {
					e.currentTarget.classList.toggle('showAll');
				});
		}

		//
		// Display Advanced Options Overlay
		//
		const advancedOptionsToggle =
			document.querySelector('.arcade-advance-opt-text');
		if (advancedOptionsToggle) {
			advancedOptionsToggle.onclick = (e) => {
				this.meta_overlay.show();
				this.game_mod.attachAdvancedOptionsEventListeners();
				this.meta_overlay.blockClose();

				if (
					document.getElementById('game-wizard-advanced-return-btn')
				) {
					document.querySelector(
						'.game-wizard-advanced-return-btn'
					).onclick = (e) => {
						this.meta_overlay.hide();
					};
				}
			};
		}

		//
		// Display Rules Overlay
		//
		if (document.getElementById('game-rules-btn')) {
			document.getElementById('game-rules-btn').onclick = function () {
				let rules_overlay = new SaitoOverlay(this.app, this.mod);
				rules_overlay.show(this.game_mod.returnGameRulesHTML());
			};
		}

		//
		// create game
		//
		Array.from(document.querySelectorAll('.game-invite-btn')).forEach(
			(gameButton) => {
				gameButton.addEventListener('click', async (e) => {
					e.stopPropagation();

					let options = this.getOptions();
					let gameType = e.currentTarget.getAttribute('data-type');

					this.overlay.remove();

					if (gameType == 'private') {
						this.app.browser.logMatomoEvent(
							'GameWizard',
							'CreatePrivateInvite',
							options.game
						);
					} else if (gameType == 'single') {
						this.app.browser.logMatomoEvent(
							'GameWizard',
							'PlaySinglePlayerGame',
							options.game
						);
						this.mod.makeGameInvite(options, 'private', this.obj);
						return;
					} else if (gameType == 'direct') {
						this.app.browser.logMatomoEvent(
							'GameWizard',
							'CreateDirectInvite',
							options.game
						);
					} else if (gameType == 'async'){
						if (options['game-wizard-players-select'] > 2) {
							salert("Asynchronous game creation is experimental and assumes there are only two players!");
							return;
						}
						this.app.browser.logMatomoEvent(
							'GameWizard',
							'CreateAsyncInvite',
							options.game
						);
						options.async_dealing = 1;
						gameType = 'private';
					} else {
						this.app.browser.logMatomoEvent(
							'GameWizard',
							'CreateOpenInvite',
							options.game
						);
					}

					if (gameType === "import") {
						this.import_game.render(options.game);
						return;
					}

					this.mod.makeGameInvite(options, gameType, this.obj);
				});
			}
		);
	}

	getOptions() {
		let options = {};
		document
			.querySelectorAll(
				'#advanced-options-overlay-container input, #advanced-options-overlay-container select, .arcade-wizard-overlay input, .arcade-wizard-overlay select'
			)
			.forEach((element) => {
				if (element.name) {
					if (element.type == 'checkbox') {
						if (element.checked) {
							options[element.name] = 1;
						}
					} else if (element.type == 'radio') {
						if (element.checked) {
							options[element.name] = element.value;
						}
					} else {
						options[element.name] = element.value;
					}
				}
			});

		if (document.querySelector(".game-wizard-crypto-hook")){
			let hook = document.querySelector(".game-wizard-crypto-hook");
			if (hook.dataset?.ticker && hook.dataset?.amount) {
				options["crypto"] = hook.dataset.ticker;
				options["stake"] = hook.dataset.amount;

				if (hook.dataset.match != undefined) {
					options["stake"] = { 
									"min": parseFloat(hook.dataset.match) 
								};
					options["stake"][this.mod.publicKey] = parseFloat(hook.dataset.amount);
				}

				this.app.browser.logMatomoEvent('StakeCrypto', 'viaGameWizard', hook.dataset.ticker);
			}
		}


		if (this.mod.debug) {
			console.log(
				'GAMEWIZARD -- reading options from HTML: ',
				JSON.stringify(options)
			);
		}

		if (this.meta_overlay) {
			this.meta_overlay.remove();
		}

		// Check for open table here
		if (options["game-wizard-players-select"] == "open-table"){
			options["open-table"] = 1;
			options["game-wizard-players-select"] = 2;
			options["game-wizard-players-select-max"] = 6;
		}

		return options;
	}
}

module.exports = GameWizard;
