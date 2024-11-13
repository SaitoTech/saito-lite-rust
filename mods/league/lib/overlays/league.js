const LeagueOverlayTemplate = require('./league.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');
const Leaderboard = require('./../leaderboard');
const LeagueWelcome = require('./league-welcome');
const JoinLeagueOverlay = require('./join');
const InvitationLink = require('./../../../../lib/saito/ui/modals/saito-link/saito-link');

class LeagueOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod);
		this.league = null;

		this.leaderboards = {};

		app.connection.on('league-overlay-render-request', (league_id) => {
			//console.log('league-overlay-render-request:',league_id);
			this.league = this.mod.returnLeague(league_id);
			if (this.league) {
				this.render();
			} else {
				console.warn('Overlay Render Request for Invalid League');
			}
		});
		app.connection.on('league-overlay-remove-request', () => {
			this.overlay.remove();
		});
	}

	// --------------------------------------------
	// Do not directly call render -- emit an event
	// --------------------------------------------
	async render() {
		if (!this.league) {
			return;
		}

		// So we keep a kopy of the league - leaderboard for faster clicking
		if (!this.leaderboards[this.league.id]) {
			this.leaderboards[this.league.id] = new Leaderboard(
				this.app,
				this.mod,
				'.league-overlay-leaderboard',
				this.league
			);
		}

		this.overlay.show(
			LeagueOverlayTemplate(this.app, this.mod, this.league)
		);

		let game_mod = this.app.modules.returnModuleByName(this.league.game);
		if (game_mod) {
			this.overlay.setBackground(
				game_mod.respondTo('arcade-games').image
			);
		}

		//Show Leaderboard
		this.leaderboards[this.league.id].render();

		//Show list of recent games (once refreshed)
		await this.app.modules.renderInto('.league-overlay-games-list');

		let obj = { game: this.league.game };
		if (this.league.admin) {
			obj['league_id'] = this.league.id;
		}
		this.app.connection.emit('league-overlay-games-list', obj);

		//Add click event to create game
		this.attachEvents();
	}

	attachEvents() {
		if (document.getElementById('league-overlay-create-game-button')) {
			document.getElementById(
				'league-overlay-create-game-button'
			).onclick = (e) => {
				this.overlay.remove();
				this.app.browser.logMatomoEvent(
					'GameWizard',
					'LeagueOverlay',
					this.league.game
				);
				if (this.league.admin) {
					// private leagues get league provided
					this.app.connection.emit('arcade-launch-game-wizard', {
						game: this.league.game,
						league: this.league
					});
				} else {
					// default games skip as invites are open
					this.app.connection.emit('arcade-launch-game-wizard', {
						game: this.league.game,
						skip: 1,
					});
				}
			};
		}

		if (document.querySelector('.join_league')) {
			document.querySelector('.join_league').onclick = () => {
				let jlo = new JoinLeagueOverlay(
					this.app,
					this.mod,
					this.league.id
				);
				jlo.render();
			};
		}

		if (document.querySelector('.backup_account')) {
			document.querySelector('.backup_account').onclick = () => {
				this.app.connection.emit(
					'recovery-backup-overlay-render-request',
					{
						success_callback: () => {
							this.render();
						}
					}
				);
			};
		}

		if (document.querySelector('.contact_admin')) {
			document.querySelector('.contact_admin').onclick = () => {
				if (!this.email_admin) {
					this.overlay.remove();
					this.email_admin = new LeagueWelcome(
						this.app,
						this.mod,
						this.league
					);
					this.email_admin.render();
					this.league.email_sent = true;
				} else {
					salert(
						'You already messaged the league admin. Please be patient'
					);
				}
			};
		}

		if (document.getElementById('league-chat-button')) {
			document.getElementById('league-chat-button').onclick = () => {
				let player_keys = this.league.players.map(
					(obj) => obj.publicKey
				);
				this.overlay.remove();
				let league_group = {
					name: this.league.name,
					id: this.league.id,
					key: player_keys
				};
				//This will serve as a flag to create a "permanent" group
				if (this.league.admin === this.mod.publicKey) {
					league_group.admin = this.league.admin;
				}
				this.app.connection.emit('open-chat-with', league_group);
			};
		}

		if (document.getElementById('league-invite-button')) {
			document.getElementById('league-invite-button').onclick = (e) => {
				let data = {
					game: this.league.game,
					league_id: this.league.id,
					name: 'League',
					path: '/arcade/'
				};
				this.invitation_link = new InvitationLink(
					this.app,
					this.mod,
					data
				);
				this.invitation_link.render();
			};
		}

		if (!document.querySelector('.contactAdminWarning')) {
			Array.from(document.querySelectorAll('.menu-icon')).forEach(
				(item) => {
					item.onclick = (e) => {
						let nav = e.currentTarget.id;

						try {
							document
								.querySelector('.active-tab')
								.classList.remove('active-tab');
							document
								.querySelector('.league-overlay-leaderboard')
								.classList.remove('hidden');
							document
								.querySelector('.league-overlay-body')
								.classList.remove('admin-mode');
							Array.from(
								document.querySelectorAll(
									'.league-overlay-body-content > .league-overlay-content-box'
								)
							).forEach((div) => div.classList.add('hidden'));

							switch (nav) {
							case 'home':
								document
									.querySelector(
										'.league-overlay-description'
									)
									.classList.remove('hidden');
								break;
							case 'contact':
								document
									.querySelector('#admin_details')
									.classList.remove('hidden');
								if (document.querySelector('#admin_note')) {
									document
										.querySelector('#admin_note')
										.classList.remove('hidden');
								}
								break;
							case 'games':
								document
									.querySelector(
										'.league-overlay-league-body-games'
									)
									.classList.remove('hidden');
								break;
							case 'players':
								document
									.querySelector('.league-overlay-body')
									.classList.add('admin-mode');
								document
									.querySelector('#admin-widget')
									.classList.remove('hidden');
								document
									.querySelector(
										'.league-overlay-leaderboard'
									)
									.classList.add('hidden');
								this.loadPlayersUI();
								break;
							case 'rankings':
								document
									.querySelector(
										'.league-overlay-leaderboard'
									)
									.classList.add('hidden');
							}
						} catch (err) {
							console.error(
								'dom selection in league overlay',
								err
							);
						}
						e.currentTarget.classList.add('active-tab');
					};
				}
			);
		}
	}

	loadPlayersUI() {
		this.app.browser.replaceElementById(
			`<div id="admin-widget" class="admin-widget league-overlay-content-box">
      <div class="saito-table">
        <div class="saito-table-header">
          <div>Player</div>
          <div>Score</div>
          <div>Games Completed</div>
          <div>Games Started</div>
          <div>Last Activity</div>
          <div>Email</div>
          <div>Remove</div>
        </div>
        <div class="saito-table-body"></div>
        </div>
        </div>`,
			'admin-widget'
		);

		console.log(JSON.parse(JSON.stringify(this.league)));

		if (!this.league) {
			return;
		}

		let html = '';
		for (let player of this.league.players) {
			let datetime = this.app.browser.formatDate(player.timestamp);
			html += `<div class="saito-table-row">
        <div>${this.app.browser.returnAddressHTML(player.publicKey)}</div>
        <div class="player_score editable_field" data-id="${
	player.publicKey
}" contenteditable="true">${Math.round(player.score)}</div>
        <div>${Math.round(player.games_finished)}</div>
        <div>${Math.round(player.games_started)}</div>
        <div>${datetime.day} ${datetime.month} ${datetime.year}</div>
        <div class="email_field editable_field" data-id="${
	player.publicKey
}" contenteditable="true">${player.email}</div>
        <div class="remove_player" data-id="${
	player.publicKey
}"><i class="fas fa-ban"></i></div>
      </div> `;
		}

		this.app.browser.addElementToSelector(
			html,
			'#admin-widget .saito-table-body'
		);

		Array.from(document.querySelectorAll('.email_field')).forEach(
			(player_contact) => {
				player_contact.onblur = async (e) => {
					let newtx = await this.mod.createUpdatePlayerTransaction(
						this.league.id,
						e.currentTarget.dataset.id,
						sanitize(player_contact.textContent),
						'email'
					);
					this.app.network.propagateTransaction(newtx);

					for (let i = 0; i < this.league.players.length; i++) {
						if (
							this.league.players[i].publicKey ===
							e.currentTarget.dataset.id
						) {
							this.league.players[i].email = sanitize(
								player_contact.textContent
							);
						}
					}
				};
			}
		);

		Array.from(document.querySelectorAll('.remove_player')).forEach(
			(player) => {
				player.onclick = async (e) => {
					let key = e.currentTarget.dataset.id;
					let c = await sconfirm(
						`Remove ${this.app.keychain.returnIdentifierByPublicKey(
							key,
							true
						)} from the league?`
					);
					if (c) {
						let tx = await this.mod.createQuitTransaction(
							this.league.id,
							key
						);
						this.app.network.propagateTransaction(tx);
						this.mod.removeLeaguePlayer(this.league.id, key);
						this.app.connection.emit(
							'remove-user-from-chat-group',
							this.league.id,
							key
						);
						this.loadPlayersUI();
					}
				};
			}
		);

		Array.from(document.querySelectorAll('.player_score')).forEach(
			(player) => {
				player.onblur = async (e) => {
					let key = e.currentTarget.dataset.id;
					let c = await sconfirm(
						`Change ${this.app.keychain.returnIdentifierByPublicKey(
							key,
							true
						)}'s score?`
					);
					if (c) {
						let new_score = sanitize(player.textContent);
						new_score = parseInt(new_score);

						let newtx =
							await this.mod.createUpdatePlayerTransaction(
								this.league.id,
								key,
								new_score,
								'score'
							);
						this.app.network.propagateTransaction(newtx);

						for (let i = 0; i < this.league.players.length; i++) {
							if (this.league.players[i].publicKey === key) {
								this.league.players[i].score = new_score;
							}
						}
					}
				};
			}
		);
	}
}

module.exports = LeagueOverlay;
