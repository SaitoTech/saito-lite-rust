const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');
const JoinGameOverlayTemplate = require('./join-game.template');
const jsonTree = require('json-tree-viewer');

/*
  General Interface for the Overlay that comes up when you click on a (game) "invite".
  There are several circumstances that affect what a user can do with the overlay, but because
  so much of the UI is identical it is better to have it all in one file instead of multiple
  files with the logic spread out across all the places where you might need to trigger the overlay.

  The basic purpose is to display the game details (results of game-selector/game-wizard) and allow a player to join/cance
*/

class JoinGameOverlay {
	constructor(app, mod, invite) {
		this.app = app;
		this.mod = mod;
		this.invite = invite;
		this.overlay = new SaitoOverlay(app, mod, false, true); //No close button, auto-delete overlay

		app.connection.on('relay-is-online', async (pkey) => {
			if (pkey == this.invite.originator) {
				if (document.getElementById(`invite-user-${pkey}`)) {
					document.getElementById(`invite-user-${pkey}`).classList.add('online');
				}
			}
		});

		app.connection.on('relay-is-busy', async (pkey) => {
			if (pkey == this.invite.originator) {
				if (document.getElementById(`invite-user-${pkey}`)) {
					document.getElementById(`invite-user-${pkey}`).classList.add('online');
					document.getElementById(`invite-user-${pkey}`).classList.add('busy');
				}
			}
		});
	}

	render() {
		let game_mod = this.app.modules.returnModuleBySlug(this.invite.game_slug);

		if (this.mod.sudo) {
			this.overlay.show(`<div class="arcade-game-overlay debug_overlay"><button class="saito-button-primary" id="clear-invite">Delete</button></div>`);

			if (!this.mod.styles.includes('/saito/lib/jsonTree/jsonTree.css')) {
				this.mod.styles.push('/saito/lib/jsonTree/jsonTree.css');
				this.mod.attachStyleSheets();
			}

			let el = document.querySelector('.arcade-game-overlay');

			console.log(el);
			try {
				let optjson = JSON.parse(
					JSON.stringify(this.invite, (key, value) => (key == 'game_mod' ? 'game_mod' : value))
				);

				var tree = jsonTree.create(optjson, el);
			} catch (err) {
				console.error('error creating jsonTree: ' + err);
			}
		} else {
			this.overlay.show(JoinGameOverlayTemplate(this.app, this.mod, this.invite));
		}

		this.overlay.setBackground(game_mod.respondTo('arcade-games').image);
		this.attachEvents();
		this.app.connection.emit('add-league-identifier-to-dom');
	}

	attachEvents() {
		if (document.getElementById('arcade-game-controls-join-game')) {
			//This is a joinable game
			this.app.connection.emit('relay-send-message', {
				recipient: [this.invite.originator],
				request: 'ping',
				data: {}
			});

			document.getElementById('arcade-game-controls-join-game').onclick = async (e) => {
				let open_invites = this.mod.returnOpenInvites();

				if (open_invites.length > 0) {
					let c = await sconfirm(
						'You have an open invite. Would you like to close it to join this game?'
					);
					if (c) {
						for (let game_id of open_invites) {
							this.mod.sendCancelTransaction(game_id);
						}
					}
				}

				this.overlay.remove();

				if (
					this.invite.options.crypto &&
					(parseFloat(this.invite.options.stake) > 0 ||
						parseFloat(this.invite.options.stake?.min) >= 0)
				) {
					try {
						let game_mod = this.app.modules.returnModuleBySlug(this.invite.game_slug);

						this.app.connection.emit('accept-game-stake', {
							game_mod,
							ticker: this.invite.options.crypto,
							stake: this.invite.options.stake,
							accept_callback: (input = null) => {
								let update_options =
									input !== null && typeof this.invite.options.stake == 'object' ? 'stake' : '';
								if (update_options) {
									this.invite.options.stake[this.mod.publicKey] = input;
								}
								this.mod.sendJoinTransaction(this.invite, update_options);
							}
						});
					} catch (err) {
						console.log('ERROR checking crypto: ' + err);
						return false;
					}
				} else {
					this.mod.sendJoinTransaction(this.invite);
				}
			};
		}

		if (document.getElementById('arcade-game-controls-continue-game')) {
			document.getElementById('arcade-game-controls-continue-game').onclick = async (e) => {
				this.app.browser.logMatomoEvent('GameInvite', 'ContinueGame', this.invite.game_mod.name);
				navigateWindow(
					`/${this.invite.game_slug}/#gid=${this.app.crypto.hash(this.invite.game_id).slice(-6)}`
				);
			};
		}

		if (document.getElementById('arcade-game-controls-close-game')) {
			document.getElementById('arcade-game-controls-close-game').onclick = async (e) => {
				this.overlay.remove();

				this.app.browser.logMatomoEvent('GameInvite', 'CloseActiveGame', this.invite.game_mod.name);

				let c = await sconfirm('Are you sure you want to end the game?');

				if (c) {
					this.app.connection.emit(
						'stop-game',
						this.invite.game_mod.name,
						this.invite.game_id,
						'cancellation'
					);
				}
			};
		}

		//
		// This is a little complicated because an initialized game will persist in the
		// app.options and keep getting added back to the arcade list because it didn't
		// reach a gameover. So, we send a game over request through the game, but if the opponent
		// isn't online it doesn't process, so we need an additional fallback just to make
		// sure we aren't annoyed by being unable to close a game.
		// Of course, forfeiting a game might hurt one's leaderboard standings, but the leaderboard
		// and game engine have checks to prevent that in most cases where a game breaks early on
		//
		if (document.getElementById('arcade-game-controls-forfeit-game')) {
			document.getElementById('arcade-game-controls-forfeit-game').onclick = async (e) => {
				this.overlay.remove();
				this.app.browser.logMatomoEvent('GameInvite', 'ForfeitGame', this.invite.game_mod.name);

				let c = await sconfirm('Are you sure you want to end the game and take a loss?');

				if (c) {
					this.app.connection.emit(
						'stop-game',
						this.invite.game_mod.name,
						this.invite.game_id,
						'forfeit'
					);
				}
			};
		}

		if (document.getElementById('arcade-game-controls-cancel-join')) {
			document.getElementById('arcade-game-controls-cancel-join').onclick = (e) => {
				this.mod.sendCancelTransaction(this.invite.game_id);
				this.overlay.remove();
				this.app.browser.logMatomoEvent('GameInvite', 'CancelJoin', this.invite.game_mod.name);
			};
		}

		if (document.getElementById('arcade-game-controls-invite-join')) {
			document.getElementById('arcade-game-controls-invite-join').onclick = (e) => {
				this.mod.showShareLink(this.invite.game_id);
			};
		}

		if (document.getElementById('arcade-game-controls-watch-game')) {
			document.getElementById('arcade-game-controls-watch-game').onclick = (e) => {
				this.app.connection.emit('league-overlay-remove-request');
				this.mod.observeGame(this.invite.game_id, true);
				this.overlay.remove();
				this.app.browser.logMatomoEvent('GameInvite', 'WatchGame', this.invite.game_mod.name);
			};
		}

		if (document.getElementById('arcade-game-controls-review-game')) {
			document.getElementById('arcade-game-controls-review-game').onclick = (e) => {
				this.app.connection.emit('league-overlay-remove-request');
				this.mod.observeGame(this.invite.game_id);
				this.overlay.remove();
				this.app.browser.logMatomoEvent('GameInvite', 'ReviewGame', this.invite.game_mod.name);
			};
		}

		if (document.getElementById('arcade-game-controls-clear-game')) {
			document.getElementById('arcade-game-controls-clear-game').onclick = (e) => {
				this.mod.removeGameFromWallet(this.invite.game_id);
				this.overlay.remove();
			};
		}

		/*Array.from(document.querySelectorAll('.available_slot')).forEach((emptySlot) => {
			emptySlot.onclick = () => {
				this.mod.showShareLink(this.invite.game_id, false);
				this.overlay.remove();
			};
		});*/


		if (document.getElementById('clear-invite')){
			document.getElementById('clear-invite').onclick = (e) => {
				this.app.network.sendRequestAsTransaction("arcade clear invite", { game_id: this.invite.game_id}, ()=> {
					window.location.reload();
				})
			}
		}
	}
}

module.exports = JoinGameOverlay;
