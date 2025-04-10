const GameObserverTemplate = require('./game-observer.template');

/**
 * An interface for a third party to trace the moves of a game step-by-step
 *
 */
class GameObserver {
	/**
	 * @constructor
	 * @param app - the Saito Application
	 */
	constructor(app, game_mod) {
		this.app = app;
		this.game_mod = game_mod;
		this.arcade_mod = null;

		this.step_speed = 2000;
		this.is_paused = true;

		this.game_states = [];
		this.game_moves = [];
		this.future_moves = [];
	}

	/**
	 * Render the Observer interface
	 */
	render() {
		console.log('Rendering ObserverHUD');
		if (this.game_mod.game?.live) {
			this.is_paused = false;
		}

		if (!this.arcade_mod) {
			this.arcade_mod = this.app.modules.returnModule('Arcade');
			if (this.arcade_mod == null) {
				salert('ERROR 413252: Arcade Module not Installed');
				return;
			}
		}

		if (!document.getElementById('game-observer-hud')) {
			this.app.browser.addElementToDom(GameObserverTemplate(this.game_mod));
		} else {
			this.app.browser.replaceElementById(GameObserverTemplate(this.game_mod), 'game-observer-hud');
		}

		this.attachEvents();
	}

	hide() {
		if (document.getElementById('game-observer-hud')) {
			document.getElementById('game-observer-hud').style.display = 'none';
		}
	}

	remove() {
		if (document.getElementById('game-observer-hud')) {
			document.getElementById('game-observer-hud').remove();
		}
	}

	updateStatus(str) {
		try {
			let statusBox = document.getElementById('obstatus');
			if (statusBox) {
				statusBox.innerHTML = sanitize(str);
				setTimeout(() => {
					statusBox.innerHTML = this.game_mod.game.status;
				}, 1500);
			}
		} catch (err) {
			console.error(err);
		}
	}

	/**
	 * Add functionality to the forward/rewind buttons
	 */
	attachEvents() {
		let observer_self = this;
		console.log('Paused/Halted: ' + this.is_paused + ' ' + this.game_mod.halted);

		if (document.getElementById('game-observer-next-btn')) {
			document.getElementById('game-observer-next-btn').onclick = (e) => {
				document.getElementById('game-observer-next-btn').classList.remove('flashit');
				if (!this.is_paused) {
					this.step_speed /= 2;
					return;
				}

				this.next();
			};
		}

		if (document.getElementById('game-observer-play-btn')) {
			document.getElementById('game-observer-play-btn').onclick = (e) => {
				if (this.game_mod.game?.live) {
					this.game_mod.game.live = 0;
					this.render();
					this.pause();
					return;
				}

				console.log('GO Paused/Halted: ' + this.is_paused + ' ' + this.game_mod.halted);
				document.getElementById('game-observer-next-btn').classList.remove('flashit');

				this.step_speed = 2000; //Reset to normal play speed
				if (this.is_paused) {
					//Update controls UI and flags
					this.play();
					//Kick off loop with next move
					this.next();
				} else {
					this.pause();
				}
			};
		}

		if (document.getElementById('game-observer-first-btn')) {
			document.getElementById('game-observer-first-btn').onclick = async (e) => {
				this.game_states = [];
				this.future_moves = this.future_moves.concat(this.game_moves);
				this.game_moves = [];
				this.pause();

				//Reset the game_mod.game
				this.game_mod.game = this.game_mod.newGame(this.game_mod.game.id);
				this.game_mod.saveGame(this.game_mod.game.id);
				await this.game_mod.initializeObserverMode(
					this.arcade_mod.returnGame(this.game_mod.game.id)
				);

				this.game_mod.halted = 1; // Default to paused

				this.game_mod.observerDownloadNextMoves(() => {
					console.log('GAME QUEUE:' + JSON.stringify(this.game_mod.game.queue));
					this.game_mod.initialize_game_run = 0;
					this.game_mod.initializeGameQueue(this.game_mod.game.id);
					//Tell gameObserver HUD to update its step
					observer_self.updateStep(this.game_mod.game.step.game);
				});
			};
		}

		if (document.getElementById('game-observer-last-btn')) {
			document.getElementById('game-observer-last-btn').onclick = (e) => {
				//Backup one step
				this.pause();
				this.showNextMoveButton();
				this.last();
			};
		}
		this.app.browser.makeDraggable('game-observer-hud');

		let joinBtn = document.getElementById('observer-join-game-btn');
		if (joinBtn) {
			joinBtn.onclick = async () => {
				let c = await sconfirm('Request to be dealt into the next hand?');
				if (c) {
					console.log(this.game_mod.game.options);
					if (this.game_mod.game.options.crypto && (parseFloat(this.game_mod.game.options.stake) > 0 || parseFloat(this.game_mod.game.options.stake?.min) >= 0)) {
						this.app.connection.emit("accept-game-stake", { 
							game_mod: this.game_mod, 
							ticker: this.game_mod.game.options.crypto, 
							stake: this.game_mod.game.options.stake, 
							accept_callback: (input = null) => { 
								joinBtn.innerHTML = 'waiting';
								joinBtn.onclick = null;
								this.game_mod.sendMetaMessage('JOIN');
								$('#game-observer-play-btn').remove();
							}
						});
					}else{
						joinBtn.innerHTML = 'waiting';
						joinBtn.onclick = null;
						this.game_mod.sendMetaMessage('JOIN');
						$('#game-observer-play-btn').remove();
					}
				}
			};
		}
	}

	updateStep(step) {
		try {
			document.getElementById('game-observer-status').innerHTML = `Game step: ${step}`;
		} catch (err) {}
	}

	pause() {
		let playBtn = document.getElementById('game-observer-play-btn');
		playBtn.classList.add('play-state');
		playBtn.classList.remove('pause-state');
		let fwdBtn = document.getElementById('game-observer-next-btn');
		fwdBtn.classList.add('play-state');
		fwdBtn.classList.remove('pause-state');

		this.is_paused = true;
		this.game_mod.halted = 1;
	}

	play() {
		let playBtn = document.getElementById('game-observer-play-btn');
		playBtn.classList.remove('play-state');
		playBtn.classList.add('pause-state');
		let fwdBtn = document.getElementById('game-observer-next-btn');
		fwdBtn.classList.remove('play-state');
		fwdBtn.classList.add('pause-state');

		this.updateStatus('Replaying moves...');
		this.is_paused = false;
		console.log("OBSERVER: unhalt game (play)");
		this.game_mod.halted = 0;
	}

	insertFutureMoves(game_mod) {
		for (let i = 0; i < this.future_moves.length; i++) {
			let future_tx = this.future_moves[i];
			game_mod.addFutureMove(future_tx);
		}
		this.future_moves = [];
	}

	/**
	 * Move forward one step
	 *
	 */
	async next() {
		console.log("OBSERVER: unhalt game (next)");
		this.game_mod.halted = 0;

		//If we have backed up, we kept an array of undone moves add those back onto the game's future queue
		this.insertFutureMoves(this.game_mod);

		let result = await this.game_mod.processFutureMoves();

		if (result == 0) {
			//Only download if there are no new valid moves pending in the future queue
			this.updateStatus('Checking for missing additional moves...');

			this.game_mod.observerDownloadNextMoves(async () => {
				console.log('Callback', this.game_mod.game.future.length);

				await this.game_mod.processFutureMoves();

				//Reset game to halted
				this.game_mod.halted = this.is_paused ? 1 : 0;

				if (this.game_mod.game.future.length == 0) {
					this.hideNextMoveButton();
				}
			});
		} else {
			console.log('processFutureMoves returned ', result);
		}
	}

	/**
	 * Rewind one step
	 *
	 */
	last() {
		console.log('Backing up from...' + this.game_mod.game.step.game);
		let observer_self = this;
		const callback = function (mod) {
			//Get game module to reload and refresh the DOM
			console.log('GAME QUEUE:' + JSON.stringify(mod.game.queue));
			mod.initialize_game_run = 0;
			mod.initializeGameQueue(mod.game.id);
			//Tell gameObserver HUD to update its step
			observer_self.updateStep(mod.game.step.game);
			//Clear status of gameObserverHUD
			//observer_self.updateStatus("");
		};

		if (this.game_states.length > 0) {
			let g1 = this.game_states.pop();
			this.future_moves.unshift(this.game_moves.pop());

			console.log('PREVIOUS GAME STATE:');
			console.log(g1);
			this.game_mod.game = g1;
			this.game_mod.saveGame(this.game_mod.game.id);
			callback(this.game_mod);
		}
		/*else{
      salert("Please wait while we query the previous step...");

      this.arcade_mod.initializeObserverModePreviousStep(
        this.game_mod,
        this.game_mod.game.step.game, 
        callback
      );
    }*/
	}

	hideNextMoveButton() {
		let nextMoveBtn = document.getElementById('game-observer-next-btn');
		if (nextMoveBtn) {
			nextMoveBtn.classList.remove('flashit');
			nextMoveBtn.classList.add('unavailable');
		}
	}

	showNextMoveButton() {
		let nextMoveBtn = document.getElementById('game-observer-next-btn');
		if (nextMoveBtn) {
			if (nextMoveBtn.classList.contains('unavailable')) {
				nextMoveBtn.classList.remove('unavailable');
			} else {
				nextMoveBtn.classList.add('flashit');
			}
		}
	}

	showLastMoveButton() {
		let lastBtn = document.getElementById('game-observer-last-btn');
		if (lastBtn) {
			lastBtn.classList.remove('unavailable');
		}
		let firstBtn = document.getElementById('game-observer-first-btn');
		if (firstBtn) {
			firstBtn.classList.remove('unavailable');
		}
	}
}

module.exports = GameObserver;
