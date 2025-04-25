const saito = require('./../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');
const LeagueRankings = require('./lib/rankings');
const LeagueLeaderboard = require('./lib/leaderboard');
const LeagueMain = require('./lib/main');
const SaitoHeader = require('../../lib/saito/ui/saito-header/saito-header');
const SaitoOverlay = require('../../lib/saito/ui/saito-overlay/saito-overlay');
const JoinLeagueOverlay = require('./lib/overlays/join');
const PeerService = require('saito-js/lib/peer_service').default;

//Trial -- So that we can display league results in game page
const LeagueOverlay = require('./lib/overlays/league');

//
// League uses 3 URL parameters (which will trigger overlays in Arcade/Redsquare/elsewhere)
// view_game="GameName" (any case) ---> pull up the league_overlay for the default saito leaderboard of said game
// league="id"  --> pull up the league_overlay for the specified league
// league_id="id" --> pull up the join league overlay for the specified league
//

class League extends ModTemplate {
	constructor(app) {
		super(app);

		this.name = 'League';
		this.slug = 'league';
		this.description = 'Leaderboards and leagues for Saito Games';
		this.categories = 'Arcade Gaming';
		this.overlay = null;

		this.styles = ['/arcade/style.css', '/league/style.css'];

		this.leagues = [];

		//
		// UI components
		//
		this.main = null;
		this.header = null;

		/* Not fully implemented
    Only keep the last N recent games
    You don't play a game for 30 days, you get dropped from leaderboard
     (should prune data from SQL table or just filter from UI???)
    */
		this.recent_game_cutoff = 10;
		this.inactive_player_cutoff = 30 * 24 * 60 * 60 * 1000;

		this.auto_open_league_overlay_league_id = null;
		this.icon_fa = 'fas fa-user-friends';
		this.debug = false;
		this.last_prune = 0;
		this.finished_games = [];

		app.connection.on('league-render-into', (league_id, container) => {
			if (!app.BROWSER) {
				return;
			}

			let league = this.returnLeague(league_id);

			if (!league) {
				return;
			}

			console.log(this.styles);
			this.attachStyleSheets();

			let leaderboard = new LeagueLeaderboard(app, this, container, league);
			leaderboard.render();
		});
	}

	//
	// declare that we support the "league" service, which allows peers to query
	// us for league-related information (leagues, players, leaderboards, etc.)
	//
	returnServices() {
		if (this.app.BROWSER) {
			return [];
		}
		return [new PeerService(null, 'league', null, 'saito')];
	}

	respondTo(type, obj = null) {
		if (type == 'league_membership') {
			let league_self = this;
			return {
				testMembership: (league_id) => {
					let leag = league_self.returnLeague(league_id);
					if (!leag) {
						//console.log("No league");
						return false;
					}
					if (leag.rank < 0) {
						//console.log("Not a member");
						return false;
					}
					if (leag?.unverified) {
						//console.log("Unverified");
						return false;
					}
					return true;
				}
			};
		}

		if (type == 'leagues-for-arcade') {
			this.styles = ['/league/style.css'];
			this.attachStyleSheets();
			return {
				returnLeague: (league_id) => {
					return this.returnLeague(league_id);
				},
				returnLeagues: () => {
					return this.leagues;
				}
			};
		}

		return super.respondTo(type, obj);
	}

	async initialize(app) {
		await super.initialize(app);


		if (!this.app.options.leagues) {
			this.app.options.leagues = [];
		}

		//
		// create initial leagues
		//
		this.app.modules.getRespondTos('default-league').forEach(async (modResponse) => {
			await this.addLeague({
				id: app.crypto.hash(modResponse.modname), // id
				game: modResponse.game, // game - name of game mod
				name: modResponse.name, // name - name of league
				admin: '', // admin - publicKey (if exists)
				status: 'public', // status - public or private
				description: modResponse.description, //
				ranking_algorithm: modResponse.ranking_algorithm, //
				default_score: modResponse.default_score // default ranking for newbies
			});
		});

		await this.loadLeagues();

		//this.pruneOldPlayers();

		if (!app.BROWSER){
			return;
		}

		//Trial -- So that we can display league results in game page
		this.overlay = new LeagueOverlay(app, this);

		if (app.browser.returnURLParameter('view_game')) {
			let game = app.browser.returnURLParameter('view_game').toLowerCase();
			let gm = app.modules.returnModuleBySlug(game);
			if (!gm) {
				return;
			}
			//TODO: Reset the default leagues and make the hashes based on game slugs!!!!
			this.auto_open_league_overlay_league_id = app.crypto.hash(gm.returnName());
			console.log('ID: ' + this.auto_open_league_overlay_league_id, game);
			app.connection.emit('league-overlay-render-request', this.auto_open_league_overlay_league_id);
		}

		if (app.browser.returnURLParameter('league')) {
			this.auto_open_league_overlay_league_id = app.browser.returnURLParameter('league');
			app.connection.emit('league-overlay-render-request', this.auto_open_league_overlay_league_id);
		}
	}

	//
	// So leagues are displayed in same order as game list for consistency's sake
	//
	sortLeagues() {
		let superArray = [];
		try {
			this.leagues.forEach((l) => {
				let gm = this.app.modules.returnModuleByName(l.game);
				//This will filter out any games we previously deleted
				if (gm) {
					superArray.push([l.admin, gm.categories, l]);
				}
			});

			superArray.sort((a, b) => {
				//Push community leagues to the top
				if (a[0] && !b[0]) {
					return -1;
				}
				if (!a[0] && b[0]) {
					return 1;
				}

				//Sort by game categories
				if (a[1] > b[1]) {
					return 1;
				}
				if (a[1] < b[1]) {
					return -1;
				}

				return 0;
			});

			this.leagues = [];
			for (let i = 0; i < superArray.length; i++) {
				this.leagues.push(superArray[i][2]);
			}
		} catch (err) {
			console.warn(err);
		}
	}

	//////////////////////////
	// Rendering Components //
	//////////////////////////
	async render() {
		this.main = new LeagueMain(this.app, this);
		this.header = new SaitoHeader(this.app, this);
		await this.header.initialize(this.app);

		this.addComponent(this.main);
		this.addComponent(this.header);

		await super.render(this.app, this);
	}

	canRenderInto(qs) {
		if (qs == '.redsquare-sidebar') {
			return true;
		}
		return false;
	}

	renderInto(qs) {
		if (qs == '.redsquare-sidebar') {
			if (!this.renderIntos[qs]) {
				this.renderIntos[qs] = [];
				this.renderIntos[qs].push(new LeagueRankings(this.app, this, qs));
			}
			this.styles = ['/league/style.css', '/arcade/style.css'];
			this.attachStyleSheets();
			this.renderIntos[qs].forEach((comp) => {
				comp.render();
			});
		}
	}

	validateID(league_id) {
		if (/^[a-z0-9]*$/.test(league_id)) {
			return league_id;
		}
		return '';
	}

	async onPeerServiceUp(app, peer, service) {
		//
		// add remote leagues
		//
		let league_self = this;

		if (service.service === 'league') {
			if (this.debug) {
				console.log('===  peer server up  ===');
				console.log('Refresh local leagues: ');
			}

			let league_id = this.validateID(app.browser.returnURLParameter('league_id'));

			let sql;

			if (this.browser_active) {
				if (this.debug) {
					console.log('Load all leagues');
				}
				sql = `SELECT *
               FROM leagues
               WHERE status = 'public'
                 AND deleted = 0`;
			} else {
				// If in a game module, just get the most up-to-date rankings
				let am_name = this.app.modules.returnActiveModule()?.name;
				if (am_name) {
					for (let i = 0; i < this.leagues.length; i++) {
						if (this.leagues[i].game == am_name) {
							this.fetchLeagueLeaderboard(this.leagues[i].id, () => {
								console.log("Update league info for curent game:", this.leagues[i]);
								this.app.connection.emit(
									'league-leaderboard-loaded',
									this.leagues[i].game,
									this.leagues[i].players
								);
							});
							return;
						}
					}
				}

				let league_list = '';
				if (this.app.options?.leagues) {
					league_list = this.app.options.leagues.map((x) => `'${x}'`).join(', ');
				}

				if (league_id && !league_list.includes(league_id)) {
					if (league_list) {
						league_list += `, '${league_id}'`;
					} else {
						league_list = `'${league_id}'`;
					}
				}
				if (
					this.auto_open_league_overlay_league_id &&
					!league_list.includes(this.auto_open_league_overlay_league_id)
				) {
					if (league_list) {
						league_list += `, '${this.auto_open_league_overlay_league_id}'`;
					} else {
						league_list = `'${this.auto_open_league_overlay_league_id}'`;
					}
				}

				if (this.debug) {
					console.log('Load my leagues: ' + league_list);
				}

				//sql = `SELECT * FROM leagues WHERE id IN (${league_list})`;
				sql = `SELECT *
               FROM leagues
               WHERE (admin = '' OR id IN (${league_list}))
                 AND deleted = 0`;
			}
			//
			// load any requested league we may not have in options file
			// or refresh any league data that has changed
			//
			this.sendPeerDatabaseRequestWithFilter(
				'League',
				sql,
				async (res) => {
					if (res?.rows) {
						for (let league of res.rows) {
							//In case I missed the deletion tx, I can catch that my league has been removed and I should drop it
							if (league.deleted) {
								await league_self.removeLeague(league.id);
							} else {
								await league_self.updateLeague(league);
							}
						}
					}

					league_self.sortLeagues();
					app.connection.emit('leagues-render-request');
					app.connection.emit('league-rankings-render-request');

					//
					// league join league
					//
					if (league_id) {
						console.log('Joining league: ', league_id);
						let jlo = new JoinLeagueOverlay(app, league_self, league_id);
						jlo.render();
					}

					//
					// Viewing a league/game page
					//
					if (league_self.auto_open_league_overlay_league_id) {
						console.log('Redraw league overlay');
						app.connection.emit(
							'league-overlay-render-request',
							this.auto_open_league_overlay_league_id
						);
					}
				},
				(p) => {
					if (p.publicKey == peer.publicKey) {
						return 1;
					}
					return 0;
				}
			);

			//
			// fetch updated rankings
			//

			//console.log("Will update League rankings in 5sec");
			setTimeout(() => {
				let league_list = this.leagues.map((x) => `'${x.id}'`).join(', ');
				//console.log(league_list);

				let league = null;
				let rank, myPlayerStats;
				let cutoff = new Date().getTime() - 3 * 24 * 60 * 60 * 1000;
				//console.log("Sending SQL query to update");
				this.sendPeerDatabaseRequestWithFilter(
					'League',
					`SELECT *
           FROM players
           WHERE deleted = 0
             AND games_finished > 0
             AND league_id IN (${league_list})
           ORDER BY league_id, score DESC, games_won DESC, games_tied DESC, games_finished DESC`,
					async (res) => {
						if (res?.rows) {
							let league_id = 0;

							for (let p of res.rows) {
								//console.log(p);

								//Next League
								if (p.league_id !== league_id) {
									league_id = p.league_id;

									//Add me to bottom of list if I haven't played any games
									if (myPlayerStats) {
										await this.addLeaguePlayer(league_id, myPlayerStats);
									}

									league = league_self.returnLeague(league_id);
									league.players = [];
									league.rank = -1;
									rank = 0;
									myPlayerStats = null;
									//league.timestamp = new Date().getTime();
								}

								if (
									((p.games_finished == 0 && p.score !== league.default_score) ||
										p.timestamp < cutoff) &&
									p.publickey !== this.publicKey &&
									!league.admin
								) {
									continue;
								}

								//
								// Count how many people are ranked above me in the leaderboard
								//
								rank++;

								if (p.publickey == this.publicKey) {
									if (p.games_finished > 0) {
										league.rank = rank;
									} else {
										league.rank = 0;
										myPlayerStats = p;
										continue;
									}
								}

								//
								// Update player-league data in our live data structure
								//
								await this.addLeaguePlayer(league_id, p);
							}

							//Add me to bottom of list if I haven't played any games
							if (myPlayerStats) {
								await this.addLeaguePlayer(league_id, myPlayerStats);
							}

							league_self.leagues.forEach((l) => {
								l.numPlayers = l.players.length;
							});

							//Refresh UI
							app.connection.emit('leagues-render-request');
							app.connection.emit('league-rankings-render-request');
							app.connection.emit('league-data-loaded');

							//Save locally
							this.saveLeagues();
						}
					},
					(p) => {
						if (p.hasService('league')) {
							return 1;
						}
						return 0;
					}
				);
			}, 5000);
		}
	}

	async onConfirmation(blk, tx, conf) {
		if (conf != 0) {
			return;
		}

		try {
			if (this.app.BROWSER && !tx.isTo(this.publicKey)) {
				return;
			}

			if (this.hasSeenTransaction(tx)) {
				console.warn("Duplicate transaction in League");
				return;
			}

			let txmsg = tx.returnMessage();

			if (this.debug) {
				console.log('LEAGUE onConfirmation: ' + txmsg.request);
			}

			if (txmsg.request === 'league create') {
				await this.receiveCreateTransaction(blk, tx, conf);
			} else if (txmsg.request === 'league join') {
				await this.receiveJoinTransaction(blk, tx, conf);
			} else if (txmsg.request === 'league quit') {
				await this.receiveQuitTransaction(blk, tx, conf);
			} else if (txmsg.request === 'league remove') {
				await this.receiveRemoveTransaction(blk, tx, conf);
			} else if (txmsg.request === 'league update') {
				await this.receiveUpdateTransaction(blk, tx, conf);
			} else if (txmsg.request === 'league update player') {
				await this.receiveUpdatePlayerTransaction(blk, tx, conf);
			} else if (txmsg.request === 'gameover') {
				await this.receiveGameoverTransaction(txmsg);
			} else if (txmsg.request === 'roundover') {
				await this.receiveRoundoverTransaction(txmsg);
			} else if (txmsg.request === 'accept') {
				await this.receiveAcceptTransaction(blk, tx, conf);
			} else if (txmsg.request === 'launch singleplayer') {
				await this.receiveLaunchSinglePlayerTransaction(blk, tx, conf);
			} else {
				//Don't save or refresh if just a game move!!!
				return;
			}

			if (this.app.BROWSER) {
				this.saveLeagues();
				this.sortLeagues();
				this.app.connection.emit('leagues-render-request');
				this.app.connection.emit('league-rankings-render-request');
			}
		} catch (err) {
			console.log('ERROR in league onConfirmation: ' + err);
		}

		return;
	}

	shouldAffixCallbackToModule(modname, tx = null) {
		if (modname == 'League') {
			return 1;
		}
		if (modname == 'Arcade') {
			return 1;
		}
		for (let i = 0; i < this.leagues.length; i++) {
			if (this.leagues[i].game === modname) {
				return 1;
			}
		}
		return 0;
	}

	async loadLeagues() {
		let league_self = this;
		if (this.app.BROWSER) {

			//
			// Browsers cache data for relevant leagues
			//
			if (this.app.options?.leagues) {
				if (this.debug) {
					console.log(
						'Locally stored leagues:',
						JSON.parse(JSON.stringify(this.app.options.leagues))
					);
				}


				for (let lid of this.app.options.leagues) {
					let value = await this.app.storage.getLocalForageItem(`league_${lid}`);
					if (value) {
						//console.log(`Loaded League ${lid.substring(0,10)} from IndexedDB`);
						await league_self.updateLeague(value);

						let league = league_self.returnLeague(lid);

						//Make sure we get these data right!
						league.players = value.players;
						league.rank = value.rank;
						league.numPlayers = value.numPlayers;

						if (league.game === league_self.app.modules.returnActiveModule()?.name) {
							console.log(
								'Local version of this game league: ',
								JSON.parse(JSON.stringify(league))
							);
						}
					}
				}

				console.log('All leagues loaded from IndexedDB --> refresh UI');
				league_self.sortLeagues();
				//Render initial UI based on what we have saved
				league_self.app.connection.emit('leagues-render-request'); // league/ main
				league_self.app.connection.emit('league-rankings-render-request'); // sidebar league list
				league_self.app.connection.emit('finished-loading-leagues');


				return;
			} else {
				this.app.options.leagues = [];
			}
		} else {

			let sqlResults = await this.app.storage.queryDatabase(
				`SELECT *
         FROM leagues
         WHERE deleted = 0`,
				[],
				'league'
			);
			for (let league of sqlResults) {
				await league_self.updateLeague(league);
			}
			console.log("Loaded leagues into memory");
		}
	}

	/**
	 * We only store the leagues we are a member of.
	 * League id -> app.options, full league data in localForage
	 *
	 * maybe this should be async...
	 */
	saveLeagues() {
		if (!this.app.BROWSER) {
			return;
		}

		let league_self = this;
		this.app.options.leagues = [];

		let cnt = 0;
		for (let league of this.leagues) {
			if (league.rank >= 0 || league.admin === this.publicKey) {
				//let newLeague = JSON.parse(JSON.stringify(league));
				//delete newLeague.players;
				this.app.options.leagues.push(league.id);

				this.app.storage.setLocalForageItem(`league_${league.id}`, league);
			}
		}

		if (this.debug) {
			console.info('Save Leagues:');
			console.info(JSON.stringify(this.app.options.leagues));
			console.info(JSON.parse(JSON.stringify(this.leagues)));
		}

		this.app.storage.saveOptions();
	}

	/////////////////////
	// create a league //
	/////////////////////
	async createCreateTransaction(obj = null) {
		if (obj == null) {
			return null;
		}

		let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();
		newtx.msg = this.validateLeague(obj);
		newtx.msg.module = 'League';
		newtx.msg.request = 'league create';

		newtx.addTo(this.publicKey);

		await newtx.sign();

		return newtx;
	}

	async receiveCreateTransaction(blk, tx, conf) {
		let txmsg = tx.returnMessage();

		let obj = this.validateLeague(txmsg);
		obj.id = tx.signature;

		await this.addLeague(obj);
	}

	addressToAll(tx, league_id) {
		tx.addTo(this.publicKey);

		let league = this.returnLeague(league_id);
		if (!league?.admin) {
			return tx;
		}

		tx.addTo(league.admin);

		for (let p of league.players) {
			tx.addTo(p.publicKey);
		}

		return tx;
	}

	///////////////////
	// join a league //
	///////////////////
	async createJoinTransaction(league_id = '', email = '') {
		let newtx = await this.app.wallet.createUnsignedTransaction();
		newtx = this.addressToAll(newtx, league_id);

		newtx.msg = {
			module: 'League',
			league_id: league_id,
			request: 'league join'
		};

		if (email) {
			newtx.msg.email = email;
		}
		await newtx.sign();
		return newtx;
	}

	async receiveJoinTransaction(blk, tx, conf) {
		let txmsg = tx.returnMessage();

		let params = {
			publicKey: tx.from[0].publicKey,
			email: txmsg.email || '',
			ts: parseInt(tx.timestamp)
		};

		await this.addLeaguePlayer(txmsg.league_id, params);

		//
		//So, when we get our join message returned to us, we will do a query to figure out our rank
		//save the info locally, and emit an event to update as a success
		//
		if (this.publicKey === tx.from[0].publicKey) {
			this.fetchLeagueLeaderboard(txmsg.league_id, () => {
				this.app.connection.emit('join-league-success');
			});
			return;
		}

		let league = this.returnLeague(txmsg.league_id);
		if (this.publicKey === league.admin) {
			this.fetchLeagueLeaderboard(txmsg.league_id, () => {
				siteMessage('New league member', 2500);
			});
		}
	}

	async createUpdateTransaction(league_id, new_data, field = 'description') {
		let newtx = await this.app.wallet.createUnsignedTransaction();
		newtx = this.addressToAll(newtx, league_id);

		newtx.msg = {
			module: 'League',
			request: 'league update',
			league_id,
			new_data,
			field
		};
		await newtx.sign();
		return newtx;
	}

	async receiveUpdateTransaction(blk, tx, conf) {
		let txmsg = tx.returnMessage();

		let league_id = txmsg.league_id;
		let new_data = txmsg.new_data;
		let field = txmsg.field;

		if (field !== 'description' && field !== 'contact') {
			console.error('League Update Error: Unknown SQL field');
			return;
		}

		let league = this.returnLeague(league_id);
		if (league) {
			league[field] = new_data;
		}

		let sql = `UPDATE OR IGNORE leagues
               SET ${field} = $data
               WHERE id = $id`;
		let params = {
			$id: league_id,
			$data: new_data
		};

		await this.app.storage.runDatabase(sql, params, 'league');
	}

	async createUpdatePlayerTransaction(league_id, publicKey, new_data, field = 'email') {
		let newtx = await this.app.wallet.createUnsignedTransaction();

		newtx.addTo(this.publicKey);
		newtx.addTo(publicKey);

		newtx.msg = {
			module: 'League',
			request: 'league update player',
			league_id,
			publicKey,
			new_data,
			field
		};
		await newtx.sign();
		return newtx;
	}

	async receiveUpdatePlayerTransaction(blk, tx, conf) {
		let txmsg = tx.returnMessage();

		let league_id = txmsg.league_id;
		let publicKey = txmsg.publicKey;
		let new_data = txmsg.new_data;
		let field = txmsg.field;

		if (field !== 'email' && field !== 'score') {
			console.error('League Update Error: Unknown SQL field');
			return;
		}

		let league = this.returnLeague(league_id);
		if (league) {
			league[field] = new_data;
		}

		//My data was updated...
		if (this.publicKey === publicKey) {
			setTimeout(() => {
				this.fetchLeagueLeaderboard(league_id, () => {
					if (field == 'email' && new_data) {
						siteMessage(`${league.name} membership approved`, 2500);
					} else if (field == 'score') {
						siteMessage(`${league.name} score updated`, 2500);
					}
				});
			}, 1000);
		}

		let sql = `UPDATE OR IGNORE players
               SET ${field} = $data
               WHERE league_id = $league_id
                 AND publickey = $publickey`;
		let params = {
			$data: new_data,
			$league_id: league_id,
			$publickey: publicKey
		};

		await this.app.storage.runDatabase(sql, params, 'league');
	}

	///////////////////
	// quit a league //
	///////////////////
	async createQuitTransaction(league_id, publicKey = null) {
		let newtx = await this.app.wallet.createUnsignedTransaction();
		newtx = this.addressToAll(newtx, league_id);

		publicKey = publicKey || this.publicKey;

		newtx.msg = {
			module: 'League',
			request: 'league quit',
			league_id: league_id,
			publicKey
		};
		await newtx.sign();
		return newtx;
	}

	async receiveQuitTransaction(blk, tx, conf) {
		let txmsg = tx.returnMessage();

		let sql = `UPDATE players
               SET deleted = 1
               WHERE league_id = $league
                 AND publickey = $publickey`;
		let params = {
			$league: txmsg.league_id,
			$publickey: txmsg.publicKey
		};

		//if (tx.from[0].publicKey !== txmsg.publicKey){
		//  let league = this.returnLeague(txmsg.league_id);
		//  if (!league?.admin || league.admin !== tx.from[0].publicKey {
		//    console.log("Ignore invalid removal request");
		//    return;
		//  }
		//}

		await this.app.storage.runDatabase(sql, params, 'league');

		await this.removeLeaguePlayer(txmsg.league_id, txmsg.publicKey);
	}

	/////////////////////
	// remove a league //
	/////////////////////
	async createRemoveTransaction(league_id) {
		let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();
		newtx = this.addressToAll(newtx, league_id);

		newtx.msg = {
			module: 'League',
			request: 'league remove',
			league_id: league_id
		};

		if (this?.sudo == league_id) {
			newtx.msg['sudo'] = this.publicKey;
		}

		await newtx.sign();
		return newtx;
	}

	async receiveRemoveTransaction(blk, tx, conf) {
		let txmsg = tx.returnMessage();
		let sql1, params1;

		if (txmsg?.sudo && txmsg.sudo === tx.from[0].publicKey) {
			sql1 = `UPDATE leagues
            SET deleted = 1
            WHERE id = $id`;
			params1 = {
				$id: txmsg.league_id
			};
		} else {
			sql1 = `UPDATE leagues
                  SET deleted = 1
                  WHERE id = $id
                    AND admin = $admin`;
			params1 = {
				$id: txmsg.league_id,
				$admin: tx.from[0].publicKey
			};
		}

		let result = await this.app.storage.runDatabase(sql1, params1, 'league');

		let sql2 = `UPDATE players
                SET deleted = 1
                WHERE league_id = $league_id`;
		let params2 = { $league_id: txmsg.league_id };

		result = await this.app.storage.runDatabase(sql2, params2, 'league');

		await this.removeLeague(txmsg.league_id);
	}

	///////////////////////////
	// roundover transaction //
	///////////////////////////
	async receiveRoundoverTransaction(txmsg) {
		await this.receiveGameoverTransaction(txmsg, false);
	}

	//////////////////////////
	// gameover transaction //
	//////////////////////////
	async receiveGameoverTransaction(txmsg, is_gameover = true) {
		//if (app.BROWSER == 1) { return; }

		let game = txmsg.module;

		//
		// small grace period
		//
		if (is_gameover){
			if(txmsg.reason == 'cancellation' ||
				txmsg.reason?.includes('Wins:') ||
				txmsg.reason?.includes('Scores: '))
		 	{
				console.log("Don't process");
				return;
			}
			if (this.finished_games.includes(txmsg.game_id)){
				console.warn("Game over already processed");
				return;
			}else{
				this.finished_games.push(txmsg.game_id);
			}
		}

		//
		// fetch players
		//
		let publicKeys = txmsg.players.split('_');
		if (Array.isArray(txmsg.winner) && txmsg.winner.length == 1) {
			txmsg.winner = txmsg.winner[0];
		}

		if (this.debug) {
			console.log(`League updating player scores for end of ${is_gameover ? 'game' : 'round'}`);
			console.log(publicKeys);
		}
		//
		// fetch leagues
		//
		let relevantLeagues = await this.getRelevantLeagues(game, txmsg?.league_id);

		if (!relevantLeagues) {
			console.log('No relevant league');
			return;
		}

		//if (this.debug){console.log(relevantLeagues, publicKeys);}

		//
		// update database
		//
		for (let leag of relevantLeagues) {

			let myScore = leag.score;
			let myRank = leag.rank;

			//
			// update rankings (ELO)
			//
			if (leag.ranking_algorithm === 'ELO') {
				await this.updateELORanking(publicKeys, leag, txmsg);
			}
			if (leag.ranking_algorithm === 'EXP') {
				await this.updateEXPRanking(publicKeys, leag, txmsg);
			}
			if (leag.ranking_algorithm === 'HSC') {
				await this.updateHighScore(publicKeys, leag, txmsg);
			}

			if (this.app.BROWSER) {
				console.log("Update league rankings on game over");
				console.log(JSON.parse(JSON.stringify(leag.players)), myScore, myRank);
				this.fetchLeagueLeaderboard(leag.id, () => {
					if (myRank <= 0 && leag.rank > 0) {
						if (is_gameover) {
							siteMessage(`You are now ranked ${leag.rank} on the ${leag.name} leaderboard`);
						}
					} else {
						let point_message = '';
						if (leag.ranking_algorithm === 'ELO' && leag.score != myScore) {
							if (leag.score > myScore) {
								point_message = `gained ${leag.score - myScore} points`;
							} else {
								point_message = `lost ${myScore - leag.score} points`;
							}
						} else if (leag.ranking_algorithm === 'HSC') {
							if (leag.score > myScore) {
								point_message = `set a new personal best of ${leag.score}`;
							}
						}

						let rank_message = '';

						if (myRank > leag.rank) {
							rank_message = `jumped ${myRank - leag.rank} place${
								myRank - leag.rank > 1 ? 's' : ''
							} on the leaderboard`;
						} else if (myRank < leag.rank) {
							rank_message = `dropped ${leag.rank - myRank} place${
								leag.rank - myRank > 1 ? 's' : ''
							} on the leaderboard`;
						}

						if (is_gameover) {
							if (point_message && rank_message) {
								siteMessage(`${leag.name}: You ${point_message} and ${rank_message}`);
							} else if (point_message || rank_message) {
								siteMessage(`${leag.name}: You ${point_message}${rank_message}`);
							}
						}
					}
					console.log('LEAGUE: My previous score and rank:', myScore, myRank);
					console.log('LEAGUE: My new score and rank: ', leag.score, leag.rank);
				});
			}
		}
	}

	////////////////////////
	// accept transaction //
	////////////////////////
	//
	// inserts player into public league if one exists
	//
	async receiveLaunchSinglePlayerTransaction(blk, tx, conf) {
		await this.receiveAcceptTransaction(blk, tx, conf);
	}

	async receiveAcceptTransaction(blk, tx, conf) {
		let txmsg = tx.returnMessage();

		if (this.debug) {
			console.log(`League processing game start of ${txmsg.game}!`);
		}

		//if (this.app.BROWSER){ return; }

		const relevantLeagues = await this.getRelevantLeagues(txmsg.game, txmsg?.options?.league_id);
		if (!relevantLeagues) {
			return;
		}

		if (this.debug) {
			console.log('League: AcceptGame');
			console.log(`Specific league? ${txmsg?.options?.league_id ? txmsg.options.league_id : 'no'}`);
			console.log(JSON.parse(JSON.stringify(relevantLeagues)));
		}

		//
		// who are the players ?
		//
		let publicKeys = [];
		for (let i = 0; i < tx.to.length; i++) {
			if (!publicKeys.includes(tx.to[i].publicKey)) {
				publicKeys.push(tx.to[i].publicKey);
			}
		}

		//if (this.debug){console.log(relevantLeagues, publicKeys);}

		//
		// and insert if needed
		//
		for (let leag of relevantLeagues) {
			console.log('Process League ' + leag.id);
			for (let publicKey of publicKeys) {
				//Make sure players are automatically added to the Saito-leaderboards
				if (!leag.admin) {
					await this.addLeaguePlayer(leag.id, { publicKey });
				}
				//Update Player's game started count
				await this.incrementPlayer(publicKey, leag.id, 'games_started');
			}
		}
	}

	/////////////////////
	/////////////////////
	async getRelevantLeagues(game, target_league = '') {
		/*let sql = `SELECT *
               FROM leagues
               WHERE game = $game
                 AND (admin = "" OR id = $target)
                 AND deleted = 0`;

		let params = { $game: game, $target: target_league };

		let sqlResults = await this.app.storage.queryDatabase(sql, params, 'league');
		*/

		let localLeagues = this.leagues.filter((l) => {
			if (l.game === game) {
				if (!l.admin || l.id == target_league) {
					return true;
				}
			}
			return false;
		});

		return /*sqlResults ||*/ localLeagues;
	}

	async getPlayersFromLeague(league_id, players) {
		let sql2 = `SELECT *
                FROM players
                WHERE league_id = ?
                  AND publickey IN (`;
		for (let pk of players) {
			sql2 += `'${pk}', `;
		}
		sql2 = sql2.substring(0, sql2.length - 2) + `) AND deleted = 0`;

		let sqlResults = await this.app.storage.queryDatabase(sql2, [league_id], 'league');

		if (sqlResults) {
			sqlResults = sqlResults.map(this.validatePlayer, this);
		}

		let league = this.returnLeague(league_id);

		let localStats = null;

		if (league?.players) {
			localStats = league.players.filter((p) => players.includes(p.publicKey));
		}

		//console.log("SQL:", sqlResults);
		//console.log("Local:", localStats);

		// should we look to ts value for which is the newest reault
		// Only matters on server nodes where we would have both
		return sqlResults || localStats;
	}

	/////////////////////
	// update rankings //
	/////////////////////
	async updateEXPRanking(publicKeys, league, txmsg) {
		let players = [...publicKeys]; //Need to refresh this each loop (since we splice below)

		//
		// winning += 5 points
		// ties    += 3 points
		// losing  += 1 point
		//

		// everyone gets a point for playing
		for (let i = 0; i < players.length; i++) {
			await this.incrementPlayer(players[i], league.id, 'score', 1);
			await this.incrementPlayer(players[i], league.id, 'games_finished', 1);
		}

		let numPoints = txmsg.reason == 'tie' ? 2 : 4;
		let gamekey = txmsg.reason == 'tie' ? 'games_tied' : 'games_won';

		for (let i = 0; i < players.length; i++) {
			if (txmsg.winner === players[i] || txmsg.winner.includes(players[i])) {
				await this.incrementPlayer(players[i], league.id, 'score', numPoints);
				await this.incrementPlayer(players[i], league.id, gamekey, 1);
			}
		}
	}

	async updateELORanking(players, league, txmsg) {
		//
		// no change for 1P games
		//
		if (players.length < 2) {
			return;
		}

		let shouldTweet = false;

		if (!this.app.BROWSER) {
			//for dev purposes
			//shouldTweet = true;

			for (let key of players) {
				// Only care if at least one player has a registered username or money is on the line!
				if (this.app.keychain.returnIdentifierByPublicKey(key, false) || txmsg.options?.stake) {
					shouldTweet = true;
				}
			}
			// has to be a proper gameover
			if (txmsg.request !== 'gameover') {
				shouldTweet = false;
			}
		}

		let playerStats = await this.getPlayersFromLeague(league.id, players);

		if (!playerStats || playerStats.length !== players.length) {
			// skip out - not all players are league members
			console.log('ELO player mismatch');
			return;
		}

		if (shouldTweet) {
			await this.fetchRankings(league.id, playerStats);
		}

		let winner = [],
			loser = [];
		let qsum = 0;

		let playerObj = {};

		for (let player of playerStats) {
			//Convert each players ELO rating into a logistic function
			player.q = Math.pow(10, player.score / 400);
			//Sum the denominator so that the Expected values add to 1
			qsum += player.q;

			//
			//Dynamically calculate each player's K-factor
			//
			player.k = 10;
			if (player?.score < 2400) {
				player.k = 20;
			}
			if (player?.games_finished < 30 && player?.score < 2300) {
				player.k = 40;
			}

			await this.incrementPlayer(player.publicKey, league.id, 'games_finished');

			//
			//Sort into winners and losers
			//
			if (player.publicKey == txmsg.winner || txmsg.winner.includes(player.publicKey)) {
				winner.push(player);
			} else {
				loser.push(player);
			}

			playerObj[player.publicKey] = {
				iRank: player?.rank,
				iScore: Math.round(player.score)
			};

		}

		for (let p of winner) {
			let outcome = winner.length == 1 ? 'games_won' : 'games_tied';
			await this.incrementPlayer(p.publicKey, league.id, outcome);

			let diff = p.k * (1 / winner.length - p.q / qsum);
			p.score += diff;
			await this.updatePlayerScore(p, league.id);
		}
		for (let p of loser) {
			let diff2 = (p.k * p.q) / qsum;
			p.score -= diff2;
			await this.updatePlayerScore(p, league.id);
		}

		if (shouldTweet) {

			await this.fetchRankings(league.id, playerStats);

			let tweetContent = `###### _${league.name} Leaderboard Update_ ######\n|`;

			for (let player of playerStats){
				tweetContent += ` | ${this.app.keychain.returnUsername(player.publicKey)}`;
				if (player.publicKey == txmsg.winner || txmsg.winner.includes(player.publicKey)){
					tweetContent += "👑";
				}
			}

			let space = ':----:|';

			tweetContent += ` | \n|:---- |${space.repeat(playerStats.length)} \n| Ranking`;

			for (let player of playerStats) {
				tweetContent += ` | ${player.rank}`;
				let rank = playerObj[player.publicKey]?.iRank;
				if (rank){
					if (player.rank < rank) {
						tweetContent += ` (+${rank - player.rank}) ⬆️`;
					}else if (player.rank > rank){
						tweetContent += ` (${rank - player.rank}) ⬇️`;
					} // else -- no change
				}else {
					tweetContent += " (NEW)";
				}
			}

			tweetContent += ` | \n| Points |`;

			for (let player of playerStats) {
				let points2 = Math.round(player.score);
				let points1 = playerObj[player.publicKey]?.iScore;

				if (points2 > points1){
					tweetContent += ` ${points2} (+${points2-points1}) ⬆️ |`;
				}else{
					tweetContent += ` ${points2} (${points2-points1}) ⬇️ |`;
				}
			}

			// Add stake info if any
			if (txmsg.options?.stake){
				if (typeof txmsg.options['stake'] === 'object'){
					tweetContent += ` \n| $${txmsg.options.crypto} |`;
					for (let player of playerStats) {
						tweetContent += ` ${txmsg.options.stake[player.publicKey]} |`;
					}
				}else{
					tweetContent += `\n\n ${txmsg.options.stake} ${txmsg.options.crypto} were staked on the game!`	
				}
				
			}

			//console.log(tweetContent);

			let now = new Date().getTime();

			let obj = {
				module: 'RedSquare',
				request: 'create tweet',
				data: { text: tweetContent, mentions: players }
			};

			if (league?.tweetID) {
				if (now - league.tweetTS > 1000*60*60*4){
					// Start a new thread if it has been at least 4 hours
					delete league.tweetID;
					delete league.tweetTS;
				}else{
					league.tweetTS = now;
					obj.data.parent_id = league.tweetID;
					obj.data.thread_id = league.tweetID;
					obj.data.signature = league.tweetID;
				}
			}

			let newtx = await this.app.wallet.createUnsignedTransaction();
			for (let player of players){
				newtx.addTo(player);
			}

			newtx.msg = obj;

			await newtx.sign();
			await this.app.network.propagateTransaction(newtx);

			if (!league?.tweetID){
				league.tweetID = newtx.signature;
				league.tweetTS = now;
			}

		}
	}

	async updateHighScore(players, league, txmsg) {
		//
		// it better be a 1P games
		//
		if (players.length > 1) {
			return;
		}

		let playerStats = await this.getPlayersFromLeague(league.id, players);

		if (!playerStats || playerStats.length !== players.length) {
			// skip out - not all players are league members
			return;
		}

		for (let player of playerStats) {
			let newScore = parseInt(txmsg.reason);

			player.score = Math.max(player.score, newScore);
			await this.incrementPlayer(player.publicKey, league.id, 'games_finished');
			await this.updatePlayerScore(player, league.id);
		}
	}

	async incrementPlayer(publicKey, league_id, field, amount = 1) {
		if (this.app.BROWSER) {
			return 1;
		}

		if (
			!(
				field === 'score' ||
				field === 'games_finished' ||
				field === 'games_won' ||
				field === 'games_tied' ||
				field === 'games_started'
			)
		) {
			console.warn('Invalid field: ' + field);
			return 0;
		}

		let success = false;

		//This is more for live data

		let league = this.returnLeague(league_id);
		if (league?.players) {
			for (let i = 0; i < league.players.length; i++) {
				if (league.players[i].publicKey === publicKey) {
					league.players[i][field]++;
					if (this.debug) {
						console.log(`Incremented ${field}: in ${league.id}`);
						console.log(JSON.parse(JSON.stringify(league.players[i])));
					}
					success = true;
				}
			}
		}

		//if (!success) {
		//  return 0;
		//}

		let sql = `UPDATE OR IGNORE players
               SET ${field} = (${field} + ${amount}), ts = $ts
               WHERE publickey = $publickey
                 AND league_id = $league_id`;
		let params = {
			$ts: new Date().getTime(),
			$publickey: publicKey,
			$league_id: league_id
		};

		await this.app.storage.runDatabase(sql, params, 'league');
		this.entropy();
		return 1;
	}

	async updatePlayerScore(playerObj, league_id) {
		if (this.app.BROWSER) {
			return 1;
		}

		let league = this.returnLeague(playerObj.league_id);
		if (league?.players) {
			for (let i = 0; i < league.players.length; i++) {
				if (league.players[i].publicKey === playerObj.publicKey) {
					league.players[i]['score'] = playerObj.score;
					if (this.debug) {
						console.log('New Score: ' + playerObj.score);
						console.log(JSON.parse(JSON.stringify(league.players[i])));
					}
				}
			}
		}

		let sql = `UPDATE players
               SET score = $score,
                   ts    = $ts
               WHERE publickey = $publickey
                 AND league_id = $league_id`;
		let params = {
			$score: playerObj.score,
			$ts: new Date().getTime(),
			$publickey: playerObj.publicKey,
			$league_id: league_id
		};

		await this.app.storage.runDatabase(sql, params, 'league');
		this.entropy();
		return 1;
	}

	////////////////////////////////////////////////
	// convenience functions for local data inserts //
	////////////////////////////////////////////////

	/////////////////////////////
	// League Array Management //
	/////////////////////////////
	returnLeague(league_id) {
		for (let i = 0; i < this.leagues.length; i++) {
			if (this.leagues[i].id === league_id) {
				return this.leagues[i];
			}
		}
		return null;
	}

	async removeLeague(league_id) {
		for (let i = 0; i < this.leagues.length; i++) {
			if (this.leagues[i].id === league_id) {
				this.leagues.splice(i, 1);
				if (this.app.BROWSER) {
					await this.app.storage.removeLocalForageItem(`league_${league_id}`);
				}
				this.saveLeagues();
				return;
			}
		}
	}

	validateLeague(obj) {
		let newObj = {};
		//
		// default values
		//
		newObj.id = obj?.id || '';
		newObj.game = obj?.game || 'Unknown';
		newObj.name = obj?.name || 'Unknown';
		newObj.admin = obj?.admin || '';
		newObj.contact = obj?.contact || '';
		newObj.status = obj?.status || 'public';
		newObj.description = obj?.description || '';
		newObj.ranking_algorithm = obj?.ranking_algorithm || 'EXP';
		newObj.default_score = obj?.default_score || 0;
		newObj.welcome = newObj.admin
			? `Welcome to ${newObj.name}! Please make sure the admin has your email address or social media handle as well as your Saito address so they can contact you with arranged matches. 
            If you do not provide this information, you will be removed from the league. You should also make sure your Saito wallet is backed up so you can login to play games from any device.`
			: '';

		return newObj;
	}

	async addLeague(obj) {
		if (!obj) {
			return;
		}
		if (!obj.id) {
			return;
		}

		if (!this.returnLeague(obj.id)) {
			let newLeague = this.validateLeague(obj);

			//if (this.debug) {
			//  console.log(`Add ${newLeague.game} League, ${newLeague.id}`);
			//}

			//
			// dynamic data-storage
			//
			newLeague.players = obj?.players || [];
			newLeague.rank = -1; //My rank in the league
			newLeague.numPlayers = obj?.numPlayers || 0;

			if (obj?.rank >= 0) {
				newLeague.rank = obj.rank;
			}

			//console.log("Add New League:");
			//console.log(JSON.parse(JSON.stringify(newLeague)));

			this.leagues.push(newLeague);

			await this.leagueInsert(newLeague);
		}
	}

	async updateLeague(obj) {
		if (!obj) {
			return;
		}
		if (!obj.id) {
			return;
		}
		let oldLeague = this.returnLeague(obj.id);

		if (!oldLeague) {
			await this.addLeague(obj);
			return;
		}

		Object.assign(oldLeague, obj);

		//console.log("Updated League from Storage");
		//console.log(JSON.parse(JSON.stringify(oldLeague)));
	}

	validatePlayer(obj) {
		let newObj = {};

		newObj.publicKey = obj.publicKey || obj.publickey || '';
		newObj.score = obj.score || 0;
		newObj.games_started = obj.games_started || 0;
		newObj.games_finished = obj.games_finished || 0;
		newObj.games_won = obj.games_won || 0;
		newObj.games_tied = obj.games_tied || 0;
		newObj.email = obj.email || '';
		newObj.timestamp = obj.timestamp || 0;

		return newObj;
	}

	async addLeaguePlayer(league_id, obj) {
		let league = this.returnLeague(league_id);

		if (!league?.players) {
			console.error('League not found');
			return;
		}

		let newPlayer = this.validatePlayer(obj);

		if (!newPlayer.score) {
			newPlayer.score = league.default_score;
		}
		//Make sure it is a number!
		newPlayer.score = parseInt(newPlayer.score);

		if (newPlayer.publicKey === this.publicKey) {
			league.score = newPlayer.score;
			if (!league?.rank || league.rank <= 0) {
				league.rank = 0;
				league.numPlayers = league.players.length;
			}

			if (league.admin && league.admin !== this.publicKey) {
				league.unverified = newPlayer.email == '';
			}
		}

		//If we have the player already, just update the stats
		for (let z = 0; z < league.players.length; z++) {
			if (league.players[z].publicKey === newPlayer.publicKey) {
				league.players[z].score = newPlayer.score || league.players[z].score;
				league.players[z].games_started =
					newPlayer.games_started || league.players[z].games_started;
				league.players[z].games_won = newPlayer.games_won || league.players[z].games_won;
				league.players[z].games_tied = newPlayer.games_tied || league.players[z].games_tied;
				league.players[z].games_finished =
					newPlayer.games_finished || league.players[z].games_finished;
				return;
			}
		}

		league.players.push(newPlayer);

		//
		if (this.app.BROWSER == 0) {
			await this.playerInsert(league_id, newPlayer);
		}
	}

	async removeLeaguePlayer(league_id, publicKey) {
		if (publicKey == this.publicKey) {
			await this.removeLeague(league_id);
			return;
		}

		let league = this.returnLeague(league_id);

		for (let i = 0; i < league.players.length; i++) {
			if (league.players[i].publicKey === publicKey) {
				league.players.splice(i, 1);

				//Force a new ranking calculation on next leaderboard load
				league.timestamp = 0;
				break;
			}
		}

		this.saveLeagues();
	}

	async fetchRankings(league_id, players) {
		let sqlResults = await this.app.storage.queryDatabase(
			`SELECT *
       FROM players
       WHERE league_id = $league_id AND deleted = 0
       ORDER BY score DESC, games_won DESC, games_tied DESC, games_finished DESC`,
			{ $league_id: league_id },
			'league'
		);

		for (let i = 0; i < sqlResults.length; i++) {
			for (let p of players) {
				if (p.publicKey == sqlResults[i].publickey) {
					p.rank = i + 1;
				}
			}
		}
	}

	fetchLeagueLeaderboard(league_id, mycallback = null) {
		let league = this.returnLeague(league_id);
		let rank = 0;
		let myPlayerStats = null;

		if (!league) {
			console.error('League not found');
			return;
		}

		//We need to reset this because this should be an ordered array
		//and if the scores have changed, we need to resort the players
		league.players = [];
		league.rank = -1;

		let cutoff = new Date().getTime() - 3 * 24 * 60 * 60 * 1000;

		this.sendPeerDatabaseRequestWithFilter(
			'League',
			`SELECT *
       FROM players
       WHERE league_id = '${league_id}'
         AND deleted = 0
       ORDER BY score DESC, games_won DESC, games_tied DESC, games_finished DESC`,
			async (res) => {
				if (res?.rows) {
					for (let p of res.rows) {
						if (
							((p.games_finished == 0 && p.score !== league.default_score) ||
								p.timestamp < cutoff) &&
							p.publickey !== this.publicKey &&
							!league.admin
						) {
							continue;
						}

						//
						// Count how many people are ranked above me in the leaderboard
						//
						rank++;

						if (p.publickey == this.publicKey) {
							if (p.games_finished > 0) {
								league.rank = rank;
							} else {
								league.rank = 0;
								myPlayerStats = p;
								continue;
							}
						}

						//
						// Update player-league data in our live data structure
						//
						await this.addLeaguePlayer(league_id, p);
					}

					league.numPlayers = rank;
					//Add me to bottom of list if I haven't played any games
					if (myPlayerStats) {
						await this.addLeaguePlayer(league_id, myPlayerStats);
					}
				}

				league.timestamp = new Date().getTime();

				if (mycallback != null) {
					await mycallback(res);
				}

				if (this.app.BROWSER) {
					this.saveLeagues();
					this.app.connection.emit('leagues-render-request');
					this.app.connection.emit('league-rankings-render-request');
				}
			},
			(p) => {
				if (p.hasService('league')) {
					return 1;
				}
				return 0;
			}
		);
	}

	////////////////////////////////////////////////
	// convenience functions for database inserts //
	////////////////////////////////////////////////
	async leagueInsert(obj) {
		let sql = `INSERT
    OR IGNORE INTO leagues (id, game, name, admin, contact, status, description, ranking_algorithm, default_score) 
                    VALUES (
    $id,
    $game,
    $name,
    $admin,
    $contact,
    $status,
    $description,
    $ranking_algorithm,
    $default_score
    )`;
		let params = {
			$id: obj.id,
			$game: obj.game,
			$name: obj.name,
			$admin: obj.admin,
			$contact: obj.contact,
			$status: obj.status,
			$description: obj.description,
			$ranking_algorithm: obj.ranking_algorithm,
			$default_score: obj.default_score
		};

		await this.app.storage.runDatabase(sql, params, 'league');

		return;
	}

	async playerInsert(league_id, obj) {
		let sql = `INSERT
    OR IGNORE INTO players (league_id, publickey, score, ts) 
                                VALUES (
    $league_id,
    $publickey,
    $score,
    $ts
    )`;
		let params = {
			$league_id: league_id,
			$publickey: obj.publicKey,
			$score: obj.score,
			$ts: new Date().getTime()
		};

		//console.log("Insert player:", params);

		await this.app.storage.runDatabase(sql, params, 'league');
		return;
	}

	async pruneOldPlayers() {
		/*
    Need to do an inner join to select for default leaderboards only
    */

		let sql = `UPDATE players
               SET deleted = 1
               WHERE players.timestamp < ?`;
		let cutoff = new Date().getTime() - this.inactive_player_cutoff;
		await this.app.storage.runDatabase(sql, [cutoff], 'league');
	}

	async entropy() {
		let now = new Date().getTime();
		let check_threshold = 1000 * 60 * 60 * 4; //Check several times a day to catch up...
		let decay_threshold = 1000 * 60 * 60 * 24; //Decay 1 point per day...

		//Check if we have deployed the decay function in the last day...
		if (now - this.last_prune > check_threshold) {
			this.last_prune = now;
			for (let league of this.leagues) {
				// Just the default leaderboards
				if (league.admin === '') {
					let sql = `UPDATE OR IGNORE players
			               SET score = (score - 1), ts = (ts + ${decay_threshold})
			               WHERE ts < ${now - decay_threshold}
			                 AND league_id = $league_id AND score > 0`;
					let params = {
						$league_id: league.id
					};
					let results = await this.app.storage.runDatabase(sql, params, 'league');
					if (results?.changes) {
						console.log(`Apply Entropy to ${league.name} League: ${results.changes}`);
					}
				}
			}
		}
	}
}

module.exports = League;
