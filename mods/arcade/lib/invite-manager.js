const Invite = require('./invite');
const InviteManagerTemplate = require('./invite-manager.template');
const JSON = require('json-bigint');
const ArcadeInitializer = require('./main/initializer');
const SaitoOverlay = require('./../../../lib/saito/ui/saito-overlay/saito-overlay');
const JoinGameOverlay = require('./overlays/join-game');
const GameSlider = require('./game-slider');

class InviteManager {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = container;
		this.name = 'InviteManager';
		this.type = 'short';

		this.slider = new GameSlider(this.app, this.mod, '.invite-manager');

		// For filtering which games get displayed
		// We may want to only display one type of game invite, so overwrite this before render()
		this.list = 'all';
		this.lists = ['mine', 'open', 'active'];

		if (mod?.sudo){
			console.log("Sudo mode!");
			this.lists = ['mine', 'open', 'active', 'private', 'close', 'over', 'offline'];
		}

		this.game_filter = null;

		this.show_carousel = true;
		
		this.loader_overlay = new SaitoOverlay(app, mod, false, true);

		//
		// handle requests to re-render invite manager
		//
		app.connection.on('arcade-invite-manager-render-request', () => {
			if (this.mod.debug) {
				console.log('RERENDER ARCADE INVITES: ', this.mod.games);
			}
			if (!this.mod.is_game_initializing) {
				this.mod.purgeOldGames();
				this.render();
			} else {
				console.log("Don't update Arcade while initializing game");
			}
		});

		app.connection.on('finished-loading-leagues', () => {
			if (!this.mod.is_game_initializing) {
				this.mod.purgeOldGames();
				this.render();
			}
		});

		app.connection.on('arcade-game-initialize-render-request', (game_id) => {
			//
			// If Arcade is the active module, Arcade.main will respond to this event
			// Otherwise we launch an overlay and stick the spinner in there
			//
			if (!this.mod.browser_active) {
				let target = '.arcade_game_overlay_loader';

				let im = document.querySelector('.invite-manager');
				//If we have an invite manager AND it is visible
				if (im && im.getBoundingClientRect().width) {
					document.querySelector('.invite-manager').innerHTML = '';
					target = '.invite-manager';
				} else {
					this.loader_overlay.show('<div class="arcade_game_overlay_loader"></div>');
				}

				let game_loader = new ArcadeInitializer(app, mod, target);

				this.mod.is_game_initializing = true;
				game_loader.game_id = game_id;

				game_loader.render();
			}
		});

		app.connection.on('arcade-continue-game-from-options', async (game_mod) => {
			let id = game_mod.game?.id;
			if (!id) {
				return;
			}

			let game_tx = mod.returnGame(id);

			if (!game_tx) {
				console.log('Creating fresh transaction');
				game_tx = await mod.createPseudoTransaction(game_mod.game);
				mod.addGame(game_tx, 'closed');
			} else {
				delete game_tx.msg.time_finished;
				delete game_tx.msg.method;
				delete game_tx.msg.winner;
				game_tx.msg.request = 'paused';
			}

			console.log(JSON.parse(JSON.stringify(game_tx)));
			console.log(JSON.parse(JSON.stringify(game_mod.game)));

			let newInvite = new Invite(app, mod, null, this.type, game_tx, mod.publicKey);
			let join_overlay = new JoinGameOverlay(app, mod, newInvite.invite_data);
			join_overlay.render();
		});
	}

	render() {
		//
		// replace element or insert into page (deletes invites for a full refresh)
		//
		let target = this.container + ' .invite-manager';

		if (document.querySelector(target)) {
			this.app.browser.replaceElementBySelector(InviteManagerTemplate(this.app, this.mod), target);
		} else {
			this.app.browser.addElementToSelector(
				InviteManagerTemplate(this.app, this.mod),
				this.container
			);
		}

		let rendered_content = false;

		for (let list of this.lists) {
			if (this.list === 'all' || this.list === list) {
				if (!this.mod.games[list]) {
					this.mod.games[list] = [];
				}

				if (this.mod.games[list].length > 0 && !this.game_filter) {
					if (list === 'mine') {
						this.app.browser.addElementToSelector(
							`<h5 class="sidebar-header">My Games</h5>`,
							target
						);
					} else if (list == 'open') {
						this.app.browser.addElementToSelector(
							`<h5 class="sidebar-header">Open Invites</h5>`,
							target
						);
					} else if (list == 'active') {
						let valid_open_games = false;
						for (let i = 0; i < this.mod.games[list].length; i++) {
							if (this.mod.games[list][i].msg.options['open-table']) {
								valid_open_games = true;
							}
						}
						if (valid_open_games) {
							this.app.browser.addElementToSelector(
								`<h5 class="sidebar-header">Active Matches</h5>`,
								target
							);
						}
					} else if (list == 'over') {
						this.app.browser.addElementToSelector(
							`<h5 class="sidebar-header">Recent Matches</h5>`,
							target
						);
					} else {
						this.app.browser.addElementToSelector(
							`<h5 class="sidebar-header">${
								list.charAt(0).toUpperCase() + list.slice(1)
							} Games</h5>`,
							target
						);
					}
				}

				for (let i = 0; i < this.mod.games[list].length && i < 5; i++) {
					if (!this?.game_filter || this.game_filter == this.mod.games[list][i].msg.game) {
						if (list == 'active' && !this.mod.games[list][i].msg.options['open-table'] && !this.mod.sudo) {
							continue;
						}

						let newInvite = new Invite(
							this.app,
							this.mod,
							target,
							this.type,
							this.mod.games[list][i],
							this.mod.publicKey
						);

						if (newInvite.invite_data.league) {
							if (!this.mod.leagueCallback?.testMembership(newInvite.invite_data.league)) {
								continue;
							}
						}
						newInvite.render();
						rendered_content = true;
					}
				}
			}
		}

		if (!rendered_content && !this.game_filter && this.show_carousel) {
			this.slider.render();
		}

		this.attachEvents();
	}

	attachEvents() {}
}

module.exports = InviteManager;
