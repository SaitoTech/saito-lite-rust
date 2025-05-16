const PeerService = require('saito-js/lib/peer_service').default;
const Transaction = require('../../lib/saito/transaction').default;
const saito = require('./../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');
const ArcadeMain = require('./lib/main/main');
const SaitoHeader = require('./../../lib/saito/ui/saito-header/saito-header');
const InviteManager = require('./lib/invite-manager');
const GameManager = require('./lib/game-manager');
const GameWizard = require('./lib/overlays/game-wizard');
const GameSelector = require('./lib/overlays/game-selector');
const GameScheduler = require('./lib/overlays/game-scheduler');
const GameInvitationLink = require('./../../lib/saito/ui/modals/saito-link/saito-link');
const Invite = require('./lib/invite');
const JoinGameOverlay = require('./lib/overlays/join-game');
const arcadeHome = require('./index');

class Arcade extends ModTemplate {
	constructor(app) {
		super(app);

		//
		// DEBUGGING MODE
		//
		this.debug = false;

		this.name = 'Arcade';
		this.slug = 'arcade';
		this.sudo = false;
		this.description =
			'Interface for creating and joining games coded for the Saito Open Source Game Engine.';
		this.categories = 'Games Entertainment Appspace';

		// We store reference to all the installed modules which are arcade compatible
		// Useful for rendering the sidebar menu, or any list of games for game-selector (prior to game-wizard)
		this.arcade_games = [];

		/*
      We store the original transactions (from createOpenTransaction/joinOpenTransaction) in this.games,
      but because it is an object in memory, we will update the player list as players join.
      When the game kicks off, we update the server side sql so that anyone else joining the network won't get confused
      the tx.signature becomes the game_id.
    		*/
		this.games = {};

		this.is_game_initializing = false;

		this.icon = 'fas fa-gamepad';

		this.styles = ['/arcade/style.css'];

		this.affix_callbacks_to = [];

		// Still using deprecated peerhandshakecomplete rather than peerservice
		this.services = [this.app.network.createPeerService(null, 'arcade', '', 'saito')];

		this.invite_cutoff = 1500000; //25 minutes
		this.game_cutoff = 600000000;

		this.possibleHome = 1;

		this.theme_options['arcade'] = 'fa-solid fa-building-columns';

		this.social = {
			twitter: '@SaitoOfficial',
			title: '🟥 Saito Arcade',
			url: 'https://saito.io/arcade/',
			description: 'Peer to peer gaming on the blockchain',
			image: 'https://saito.tech/wp-content/uploads/2023/11/arcade-300x300.png'
		};

		app.connection.on('arcade-issue-challenge', async ({ game, players, options }) => {
			let tx;

			if (this.challenge_tx) {
				tx = await this.createJoinTransaction(this.challenge_tx);
			} else {
				tx = await this.createChallengeTransaction(game, players, options);
			}

			if (tx) {
				app.connection.emit('relay-send-message', {
					recipient: players,
					request: 'arcade spv update',
					data: tx.toJson()
				});
			}
		});

		app.connection.on('arcade-notify-player-turn', (game_id, target, status) => {
			for (let game of app.options.games) {
				if (game.id == game_id) {
					//let prev_target = game.target;

					game.status = status;
					game.target = target;

					// save with turn updated, so reload works
					app.storage.saveOptions();

					siteMessage(`It is now your turn in ${game.module}`, 5000);
					app.connection.emit('arcade-invite-manager-render-request');
				}
			}
		});

		app.connection.on('arcade-gametable-addplayer', (game_id) => {
			console.log('arcade-gametable-addplayer');
			let game = this.returnGame(game_id);
			if (game) {
				console.log(game);
				this.sendJoinTransaction({ tx: game, game_name: 'open_table' });
			}
		});

		app.connection.on('arcade-gametable-removeplayer', (game_id, player_stats) => {
			console.log('arcade-gametable-removeplayer');
			let game = this.returnGame(game_id);
			if (game) {
				console.log(game);
				this.sendLeaveTransaction(game, player_stats);
			}
		});


		app.connection.on('arcade-launch-game-selector', (obj = {}) => {
			if (!this.invite_manager){
				setTimeout(()=> {
					this.invite_manager = new InviteManager(app, this, '.overlay-invite-manager');
					this.invite_manager.type = 'long';
					this.invite_manager.show_carousel = false;
					this.invite_manager.render();
				}, 50);
			}
		});

	}

	//////////////////////////////
	// INITIALIZATION FUNCTIONS //
	//////////////////////////////
	//
	// runs when the module initializes, note that at this point the network
	// may not be up. use onPeerHandshakeCompete() to make requests over the
	// network and process the results.
	//
	async initialize(app) {
		await super.initialize(app);

		//
		// compile list of arcade games
		//
		app.modules.returnModulesRespondingTo('arcade-games').forEach((game_mod) => {
			
			this.arcade_games.push(game_mod);
			//
			// and listen to their transactions
			//
			this.affix_callbacks_to.push(game_mod.name);
		});

		if (!app.options.arcade) {
			app.options.arcade = {};
		}

		//
		// Maybe good, maybe not... Only sorts on fresh load...
		//
		this.arcade_games = this.arcade_games.sort((a, b) => {
			//Default sorting 1, 0, -1
			let b_count = b.sort_priority;
			let a_count = a.sort_priority;

			if (app.options.arcade?.last_game == b.name) {
				return 1;
			}

			//Add user behavior metrics
			if (app.options.arcade[b.name]) {
				b_count += 2 * app.options.arcade[b.name];
			}

			if (app.options.arcade[a.name]) {
				a_count += 2 * app.options.arcade[a.name];
			}

			return b_count - a_count;
		});

		this.games['mine'] = [];
		this.games['open'] = [];

		//
		// If we have a browser (are a user)
		// initialize some UI components and query the list of games to display
		//
		if (this.app.BROWSER == 1) {

			if (this.browser_active && this.app.browser.returnURLParameter('moderator')) {
				this.sudo = true;
			}

			// These are three overlays with event listeners that can function outside of the Arcade
			this.wizard = new GameWizard(app, this, null, {});
			this.game_selector = new GameSelector(app, this, {});
			//We create this here so it can respond to events
			this.game_scheduler = new GameScheduler(app, this, {});

			//
			// my games stored in local wallet
			//
			if (this.app.options.games) {
				this.purgeBadGamesFromWallet();
				this.purgeOldGamesFromWallet();

				for (let game of this.app.options.games) {
					if (game.players.includes(this.publicKey) || game.accepted.includes(this.publicKey)) {
						if (game.over) {
							if (game.last_block > 0) {
								console.log('Game Over');
								return;
							}
						}

						//
						// We create a dummy tx from the saved game state so that the arcade can render the
						// active game like a new open invite
						//
						let game_tx = await this.createPseudoTransaction(game);

						//
						// and add to list of my games
						//
						if (!game.over) {
							this.addGame(game_tx, 'active');
						} else {
							this.addGame(game_tx, 'over');
						}
					}
				}
			}

			//Check for server delivered data load
			if (window?.game) {
				let game_tx = new Transaction();
				game_tx.deserialize_from_web(app, window.game);
				this.addGame(game_tx);
			}

			this.app.connection.emit('arcade-invite-manager-render-request');

			setInterval(() => {
				let cutoff = new Date().getTime() - this.invite_cutoff;
				for (let key of ['mine', 'open']) {
					let my_games = this.games[key];
					for (let i = my_games.length - 1; i >= 0; i--) {
						if (my_games[i].timestamp < cutoff) {
							this.removeGame(my_games[i].signature);
							this.addGame(my_games[i], 'close');
							this.app.connection.emit('arcade-invite-manager-render-request');
						}
					}
				}
			}, 90000);
		}

		try {
			this.leagueCallback = this.app.modules.returnFirstRespondTo('league_membership');
		} catch (err) {
			this.leagueCallback = {};
		}
	}

	async createPseudoTransaction(game) {
		let game_tx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();

		if (game.accepted) {
			game.accepted.forEach((player) => {
				game_tx.addTo(player);
				game_tx.addFrom(player);
			});
		} else {
			game_tx.addFrom(this.publicKey);
			game_tx.addTo(this.publicKey);
		}

		let msg = {
			//ts
			module: 'Arcade',
			request: 'loaded', //will be overwritten as "active" when added
			game: game.module,
			options: game.options,
			players_needed: game.players_needed,
			players: game.accepted,
			players_sigs: [], //Only used to verify cryptology when initializing the game
			originator: game.originator,
			//winner: game.winner,
			step: game?.step?.game,
			timestamp: game?.timestamp
		};

		game_tx.signature = game.id;
		game_tx.msg = msg;

		return game_tx;
	}

	async onPeerServiceUp(app, peer, service = {}) {
		if (!app.BROWSER) {

			if (this.games?.offline){
				for (let j = 0; j < this.games.offline.length; j++){
					if (this.games.offline[j].from[0].publicKey == peer.publicKey){
						let game = this.games.offline[j];
						console.log("Mark game invite online again!", game);
						this.notifyPeers(this.games.offline[j]);
						this.removeGame(game.signature);
						this.addGame(game, "open");
					}
				}
			}

			return;
		}

		let arcade_self = this;

		if (service.service == 'arcade') {
			this.app.network.sendRequestAsTransaction('arcade invite list', {}, (txs) => {
				for (let serial_tx of txs) {
					let game_tx = new Transaction();
					game_tx.deserialize_from_web(app, serial_tx);

					let status = game_tx.msg.request;
					let game_added = arcade_self.addGame(game_tx);

					if (arcade_self?.debug && arcade_self.browser_active) {
						console.log("Available arcade game:", status, game_added, game_tx);	
					}

					//Game is marked as "active" but we didn't already add it from our app.options file...
					if (status == 'active' && game_added && arcade_self.isMyGame(game_tx)) {
						game_tx.msg.game_id = game_tx.signature;
						arcade_self.receiveAcceptTransaction(game_tx);
					}
				}

				//
				// For processing direct link to game invite
				//
				if (arcade_self.app.browser.returnURLParameter('game_id')) {
					this.loadGameInviteById(arcade_self.app.browser.returnURLParameter('game_id'));

					// Overwrite link-url with baseline url
					window.history.replaceState('', '', `/arcade/`);
				}

				app.connection.emit('arcade-invite-manager-render-request');
				app.connection.emit('arcade-data-loaded');
			});
		}



		if (service.service === 'archive') {
			for (let game of this.app.options.games) {

				if (game?.over) { continue; }

				let query = game.module + '_' + game.id;
				let game_mod = this.app.modules.returnModule(game.module);

				if (!game_mod) { continue; }

				this.app.storage.loadTransactions(
					{
						field1: query
					},
					async (txs) => {
						for (let i = txs.length - 1; i >= 0; i--) {

							// arcade 
							await this.onConfirmation(-1, txs[i], 0);

							// game mod
							await game_mod.onConfirmation(-1, txs[i], 0);
						}
					},
					peer
				);
			}
		}
	}


	loadGameInviteById(game_id_short){
		let game = this.returnGameFromHash(game_id_short);

		if (!game) {
			salert('Sorry, the game is no longer available');
			return;
		}

		if (this.isAvailableGame(game)) {
			//Mark myself as an invited guest
			game.msg.options.desired_opponent_publickey = this.publicKey;

			//Then we have to remove and readd the game so it goes under "mine"
			this.removeGame(game.signature);
			this.addGame(game);
		}

		this.app.browser.logMatomoEvent('GameInvite', 'FollowLink', game.game);

		let invite = new Invite(this.app, this, null, null, game, this.publicKey);
		let join_overlay = new JoinGameOverlay(this.app, this, invite.invite_data);
		join_overlay.render();
	}

	////////////
	// RENDER //
	////////////
	//
	// this function renders the main application (if called). it will be
	// run by browser if the user attempts to visit /arcade in their browser
	// while the application is loaded.
	//
	async render() {
		if (window.location.pathname.includes(this.returnSlug())) {
			if (this.main == null) {
				this.main = new ArcadeMain(this.app, this);
				this.header = new SaitoHeader(this.app, this);
				await this.header.initialize(this.app);
				this.header.header_class = 'arcade';
				this.addComponent(this.header);
				this.addComponent(this.main);
			}

			for (const mod of this.app.modules.returnModulesRespondingTo('chat-manager')) {
				let cm = mod.respondTo('chat-manager');
				cm.container = '.saito-sidebar.right';
				cm.render_manager_to_screen = 1;
				this.addComponent(cm);
			}

			await super.render();
		} else {
			let path = window.location.pathname.split('/');
			let game_name = path.pop();
			let game_mod = this.app.modules.returnModuleBySlug(game_name);
			if (game_mod) {
				game_mod.game = null;
				game_mod.attachEvents();
			}

			this.browser_active = 0;
		}
	}

	//
	// let other modules know if we can render into any components
	//
	canRenderInto(qs) {
		if (qs === '.redsquare-sidebar') {
			return true;
		}
		if (qs === '.arcade-sidebar') {
			return true;
		}

		return qs == '.league-overlay-games-list';
	}

	//
	// render components into other modules on-request
	//
	async renderInto(qs) {
		if (qs == '.redsquare-sidebar' || qs == '.arcade-sidebar') {
			if (!this.renderIntos[qs]) {
				this.styles = ['/arcade/style.css'];
				this.renderIntos[qs] = [];
				this.invite_manager = new InviteManager(this.app, this, qs);
				this.invite_manager.type = 'short';
				this.renderIntos[qs].push(this.invite_manager);
				this.attachStyleSheets();
			}
		}

		if (qs == '.arcade-invites-box') {
			if (!this.renderIntos[qs]) {
				this.styles = ['/arcade/style.css'];
				this.renderIntos[qs] = [];
				this.invite_manager = new InviteManager(this.app, this, '.arcade-invites-box');
				this.invite_manager.type = 'long';
				this.renderIntos[qs].push(this.invite_manager);
				this.attachStyleSheets();
			}
		}

		if (qs == '.game-page-invites') {
			if (!this.renderIntos[qs]) {
				this.styles = ['/arcade/style.css'];
				this.renderIntos[qs] = [];
				this.invite_manager = new InviteManager(this.app, this, '.arcade-invites-box');
				this.invite_manager.type = 'long';
				this.renderIntos[qs].push(this.invite_manager);
				this.attachStyleSheets();
			}
		}

		if (qs == '.league-overlay-games-list') {
			if (!this.renderIntos[qs]) {
				this.styles = ['/arcade/style.css'];
				this.renderIntos[qs] = [];
				let obj = new GameManager(this.app, this, '.league-overlay-games-list');
				this.renderIntos[qs].push(obj);
				this.attachStyleSheets();
			}
		}

		if (this.renderIntos[qs] != null && this.renderIntos[qs].length > 0) {
			for (const comp of this.renderIntos[qs]) {
				await comp.render();
			}
		}
	}

	//
	// flexible inter-module-communications
	//

	respondTo(type = '', obj) {
		if (type === 'user-menu') {
			if (obj?.publicKey && obj.publicKey !== this.publicKey) {
				let am = this.app.modules.returnActiveModule();
				if (!am || !this.shouldAffixCallbackToModule(am.name) || this.name == am.name) {
					return {
						text: 'Challenge to Game',
						icon: 'fas fa-gamepad',
						callback: function (app, publicKey) {
							app.connection.emit('arcade-launch-game-selector', {
								publicKey
							});
						}
					};
				}
			}
		}

		if (type === 'game-manager') {
			let container = obj?.container || '';
			let gm = new GameManager(this.app, this, container);
			return { gm };
		}

		if (type === 'invite-manager') {
			let game_filter = obj?.filter || null;

			if (!this.renderIntos) {
				this.renderIntos = [];
			}

			if (!this.renderIntos['.game-page-invites']) {
				this.renderIntos['.game-page-invites'] = [];
				let obj = new InviteManager(this.app, this, '.game-page-invites');
				obj.type = 'long';
				obj.game_filter = game_filter;
				this.renderIntos['.game-page-invites'].push(obj);
			}

			this.renderInto('.game-page-invites');
		}

		if (type === 'saito-header') {
			let x = [];
			if (!this.browser_active) {
				this.attachStyleSheets();
				x.push({
					text: 'Arcade',
					icon: 'fa-solid fa-building-columns',
					rank: 15,
					callback: function (app, id) {
						navigateWindow('/arcade');
					}
				});
			}

			x.push({
				text: 'Games',
				icon: this.icon || 'fas fa-gamepad',
				rank: 10,
				callback: function (app, id) {
					app.connection.emit('arcade-launch-game-selector', {});
				}
			});
			return x;
		}
		if (type === 'saito-floating-menu') {
			let x = [];

			x.push({
				text: 'Games',
				icon: this.icon || 'fas fa-gamepad',
				is_active: this.browser_active,
				rank: 25,
				callback: function (app, id) {
					app.connection.emit('arcade-launch-game-selector', {});
				}
			});
			return x;
		}

		if (type === 'saito-link') {
			const urlParams = new URL(obj?.link).searchParams;
			const entries = urlParams.entries();
			for (const pair of entries) {
				if (pair[0] == 'game_id') {
					return { processLink: (link) => { 
						this.loadGameInviteById(pair[1]);
					}}
				}
			}
		}

		return super.respondTo(type, obj);
	}

	////////////////////////////////////////////////////
	// NETWORK FUNCTIONS -- sending and receiving TXS //
	////////////////////////////////////////////////////
	//
	////////////////////////////////////////////////////
	// ON CONFIRMATION === process on-chain transactions
	////////////////////////////////////////////////////

	async onConfirmation(blk, tx, conf) {
		let txmsg = tx.returnMessage();
		let arcade_self = this.app.modules.returnModule('Arcade');

		try {
			if (conf == 0) {
				if (txmsg.module === 'Arcade') {
					if (this.hasSeenTransaction(tx)) {
						return;
					}

					if (this.debug) {
						console.log('ON CONFIRMATION:', JSON.parse(JSON.stringify(txmsg)));
					}

					//
					// public & private invites processed the same way
					//
					if (txmsg.request === 'open' || txmsg.request === 'private') {
						await arcade_self.receiveOpenTransaction(tx, blk);
					}

					//
					// Add a player to the game invite
					//
					if (txmsg.request == 'join') {
						await arcade_self.receiveJoinTransaction(tx);
					}

					// Remove player from ongoing game
					if (txmsg.request == 'leave') {
						await arcade_self.receiveLeaveTransaction(tx);
					}

					//
					// cancel a join transaction / Remove a player from the game invite
					//
					if (txmsg.request == 'cancel') {
						await arcade_self.receiveCancelTransaction(tx);
					}

					//
					// kick off game initialization
					//
					if (txmsg.request === 'accept') {
						await arcade_self.receiveAcceptTransaction(tx);
					}
				} else {
					if (txmsg.request === 'stopgame') {
						await arcade_self.receiveCloseTransaction(tx);
					}

					if (txmsg.request === 'gameover') {
						await arcade_self.receiveGameoverTransaction(tx);
					}

					if (txmsg.request === 'game') {
						await arcade_self.receiveGameStepTransaction(tx);
					}

					//
					// Archive game overs for async to work
					//
					if (!this.app.BROWSER) {
						let step = txmsg?.step?.game || txmsg.step || null;
						if (step) {
							step = String(step).padStart(5, '0');
						}
						//if (txmsg.request !== "game"){
						//	console.log("!!!!!!!!!! SAVE NON GAME STEP: ", step);	
						//}
						await this.app.storage.saveTransaction(
							tx,
							{ field4: txmsg.game_id, field5: step },
							'localhost'
						);
					}
				}
			}
		} catch (err) {
			console.log('ERROR in arcade: ', err);
		}
	}

	/////////////////////////////
	// HANDLE PEER TRANSACTION //
	/////////////////////////////
	//
	// handles off-chain transactions, packaged as data by Relay module
	//
	async handlePeerTransaction(app, newtx = null, peer, mycallback = null) {
		if (newtx == null) {
			return 0;
		}
		let message = newtx.returnMessage();

		if (message.request === 'arcade invite list') {
			// Process stuff on server side

			this.purgeOldGames();

			let txs = [];
			let peers = await app.network.getPeers();

			for (let key in this.games) {
				for (let g of this.games[key]) {
					txs.push(g.serialize_to_web(this.app));
				}
			}

			if (mycallback) {
				mycallback(txs);
				return 1;
			}
		}

		if (message.request === "arcade clear invite") {
			this.removeGame(message.data.game_id);
		}

		//
		// this code doubles onConfirmation
		//
		if (message?.data && message?.request === 'arcade spv update') {
			let tx = new Transaction(undefined, message.data);

			this.hasSeenTransaction(tx);

			let txmsg = tx.returnMessage();

			if (txmsg.module === 'Arcade') {
				if (this.debug) {
					console.log('Arcade HPT embedded txmsg:', JSON.parse(JSON.stringify(txmsg)));
				}

				//
				// public & private invites processed the same way
				//
				if (txmsg.request === 'open' || txmsg.request === 'private') {
					await this.receiveOpenTransaction(tx);
				}

				//
				// Add a player to the game invite
				//
				if (txmsg.request == 'join') {
					await this.receiveJoinTransaction(tx);
				}

				// Remove player from ongoing game
				if (txmsg.request == 'leave') {
					await this.receiveLeaveTransaction(tx);
				}


				//
				// cancel a join transaction / Remove a player from the game invite
				//
				if (txmsg.request == 'cancel') {
					await this.receiveCancelTransaction(tx);
				}

				//
				// kick off game initialization
				//
				if (txmsg.request === 'accept') {
					await this.receiveAcceptTransaction(tx);
				}

				//TODO - reimplement / check
				// This was an idea to completely off-chain send a player a direct/play now game invite
				// Which will pop up a yes/no demand for immediate response

				if (txmsg.request == 'challenge') {
					this.receiveChallengeTransaction(tx);
				}

				if (txmsg.request == 'sorry') {
					//Trigger UI update in game
					app.connection.emit('arcade-reject-challenge', txmsg.game_id);
				}


				if (txmsg.request == "offline"){
					await this.receiveOfflineTransaction(tx);
				}
			} else {
				if (txmsg.request === 'stopgame') {
					await this.receiveCloseTransaction(tx);
				}
				if (txmsg.request === 'gameover') {
					await this.receiveGameoverTransaction(tx);
				}
				if (this.app.BROWSER) {
					if (txmsg.request === 'game') {
						await this.receiveGameStepTransaction(tx);
					}
				}
			}

			//
			// only servers notify lite-clients
			//
			if (app.BROWSER == 0 && app.SPVMODE == 0) {
				this.notifyPeers(tx);
			}

			return 1;
		}

		return super.handlePeerTransaction(app, newtx, peer, mycallback);
	}


	async onConnectionUnstable(app, publicKey){
		if (this.app.BROWSER == 1) {
			return;
		}

		// Only care about open, public invites
		for (let g of this.games["open"]){
			if (publicKey == g.from[0].publicKey){
				let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();
				newtx.msg = {
					module: "Arcade",
					request: "offline",
					game_id: g.signature
				}

				await newtx.sign();

				this.notifyPeers(newtx);

				this.removeGame(g.signature);
				this.addGame(g, "offline");
			}
		}
	}

	//
	// send TX to our SPV peers
	//
	async notifyPeers(tx) {
		if (this.app.BROWSER == 1) {
			return;
		}
		let peers = await this.app.network.getPeers();
		for (let peer of peers) {
			if (peer.synctype == 'lite' && peer?.status !== "disconnected") {
				//
				// fwd tx to peer
				//
				let message = {};
				message.request = 'arcade spv update';
				message.data = tx.toJson();

				this.app.network
					.sendRequestAsTransaction(message.request, message.data, null, peer.peerIndex)
					.then(() => {
						// console.log("peer notified : " + peer.peerIndex);
					});
			}
		}
	}

	///////////////////////
	// GAME TRANSACTIONS //
	///////////////////////
	//
	// open - creating games
	// join - adds player, but does not initialize
	// accept - the final player to join, triggers initialization
	//
	///////////////
	// OPEN GAME //
	///////////////
	//
	// an OPEN transaction is the first step in creating a game. It describes the
	// conditions of the game and triggers browsers to add it to their list of
	// available games.
	//
	// servers can also index the transaction to notify others that a game is
	// available if asked.
	//
	async createOpenTransaction(gamedata) {
		let sendto = this.publicKey;
		let moduletype = 'Arcade';

		let { timestamp, name, options, players_needed, invitation_type } = gamedata;

		let accept_sig = await this.app.crypto.signMessage(
			`invite_game_${timestamp}`,
			await this.app.wallet.getPrivateKey()
		);

		let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();
		newtx.addTo(this.publicKey);
		if (options?.desired_opponent_publickey) {
			newtx.addTo(options.desired_opponent_publickey);
		}

		newtx.msg = {
			timestamp: timestamp,
			module: moduletype,
			request: invitation_type,
			game: name,
			options: options,
			players_needed: parseInt(players_needed),
			players: [this.publicKey],
			players_sigs: [accept_sig],
			originator: this.publicKey
		};

		newtx.packData();
		await newtx.sign();

		return newtx;
	}

	async receiveOpenTransaction(tx, blk = null) {
		let txmsg = tx.returnMessage();

		// add to games list == open or private
		this.addGame(tx);
		this.app.connection.emit('arcade-invite-manager-render-request');

		if (txmsg?.options?.desired_opponent_publickey == this.publicKey) {
			siteMessage(`You were invited to play ${txmsg.game}`, 5000);
		}
	}

	////////////
	// Cancel //
	////////////
	async createCancelTransaction(orig_tx) {
		let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();

		for (let player of orig_tx.msg.players) {
			newtx.addTo(player);
		}
		newtx.addTo(this.publicKey);

		let msg = {
			request: 'cancel',
			module: 'Arcade',
			game_id: orig_tx.signature
		};
		newtx.msg = msg;
		await newtx.sign();

		return newtx;
	}

	async receiveCancelTransaction(tx) {
		let txmsg = tx.returnMessage();
		let game = this.returnGame(txmsg.game_id);

		if (!game || !game.msg) {
			return;
		}

		if (game.msg.players.includes(tx.from[0].publicKey)) {
			if (tx.from[0].publicKey == game.msg.originator) {
				if (this.debug) {
					console.log(
						`Player (${tx.from[0].publicKey}) Canceling Game invite: `,
						JSON.parse(JSON.stringify(game.msg))
					);
				}

				this.changeGameStatus(txmsg.game_id, 'closed');
			} else {
				if (this.debug) {
					console.log(
						`Removing Player (${tx.from[0].publicKey}) from Game: `,
						JSON.parse(JSON.stringify(game.msg))
					);
				}

				let p_index = game.msg.players.indexOf(tx.from[0].publicKey);
				game.msg.players.splice(p_index, 1);
				//Make sure player_sigs array exists and add invite_sig
				if (game.msg.players_sigs && game.msg.players_sigs.length > p_index) {
					game.msg.players_sigs.splice(p_index, 1);
				}
			}
		} else if (
			game.msg.options?.desired_opponent_publickey &&
			tx.isFrom(game.msg.options.desired_opponent_publickey)
		) {
			if (this.publicKey == game.msg.originator) {
				siteMessage('Your game invite was declined', 5000);
			}
			this.changeGameStatus(txmsg.game_id, 'closed');
		}

		this.app.connection.emit('arcade-close-game', txmsg.game_id);
		this.app.connection.emit('arcade-invite-manager-render-request');
	}

	async sendCancelTransaction(game_id) {
		let game = this.returnGame(game_id);

		if (!game || !game.msg) {
			return;
		}

		let close_tx = await this.createCancelTransaction(game);
		this.app.network.propagateTransaction(close_tx);

		this.app.connection.emit('relay-send-message', {
			recipient: game.msg.players,
			request: 'arcade spv update',
			data: close_tx.toJson()
		});

		this.app.connection.emit('relay-send-message', {
			recipient: 'PEERS',
			request: 'arcade spv update',
			data: close_tx.toJson()
		});
	}

	changeGameStatus(game_id, newStatus) {
		let game = this.returnGame(game_id);

		//Move game to different list
		if (game) {

			if (this.debug || this.sudo){
				console.log(`Change game status from ${game.msg.request} to ${newStatus}`);	
			}

			if (game?.msg?.request == 'over' && !this?.sudo) {
				return;
			}

			this.removeGame(game_id);
			this.addGame(game, newStatus);
		}

		this.app.connection.emit('arcade-invite-manager-render-request');
	}

	//////////////
	// GAMEOVER //
	//////////////

	async receiveGameoverTransaction(tx) {
		let txmsg = tx.returnMessage();

		let game = this.returnGame(txmsg.game_id);

		//In case we arrive at gameover without close game
		this.app.connection.emit('arcade-close-game', txmsg.game_id);
		this.changeGameStatus(txmsg.game_id, 'over');

		let winner = txmsg.winner || null;

		if (game?.msg) {
			//Store the results locally
			game.msg.winner = winner;
			game.msg.method = txmsg.reason;
			game.msg.time_finished = txmsg.timestamp;
		} else {
			console.warn("Game not found, arcade can't process gameover tx");
		}

		if (this.debug) {
			console.log('Winner updated in arcade', winner);
			console.log(this.games);
		}
	}

	async receiveCloseTransaction(tx) {
		let txmsg = tx.returnMessage();

		// Mark game as closed, unless it is a player leaving an open table...
		if (txmsg.reason !== "withdraw"){
			this.app.connection.emit('arcade-close-game', txmsg.game_id);
			this.changeGameStatus(txmsg.game_id, 'closed');
		}
	}

	async receiveGameStepTransaction(tx) {
		let txmsg = tx.returnMessage();
		let game = this.returnGame(txmsg.game_id);
		if (game?.msg) {
			game.msg.step = txmsg.step.game;
			game.msg.timestamp = txmsg.step.timestamp;
		}
	}

	////////////
	// Invite // TODO -- confirm we still use these, instead of challenge
	////////////
	//
	// unsure
	//
	async createInviteTransaction(orig_tx) {
		let txmsg = orig_tx.returnMessage();

		let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();
		newtx.addTo(orig_tx.from[0].publicKey);
		newtx.addTo(this.publicKey);

		newtx.msg.timestamp = new Date().getTime();
		newtx.msg.module = txmsg.game;
		newtx.msg.request = 'invite';
		newtx.msg.game_id = orig_tx.signature;
		newtx.msg.players_needed = parseInt(txmsg.players_needed);
		newtx.msg.options = txmsg.options;
		newtx.msg.accept_sig = '';
		if (orig_tx.msg.accept_sig != '') {
			newtx.msg.accept_sig = orig_tx.msg.accept_sig;
		}
		if (orig_tx.msg.timestamp != '') {
			newtx.msg.timestamp = orig_tx.msg.timestamp;
		}
		newtx.msg.invite_sig = await this.app.crypto.signMessage(
			'invite_game_' + newtx.msg.timestamp,
			await this.app.wallet.getPrivateKey()
		);
		await newtx.sign();

		return newtx;
	}

	///////////////
	// JOIN GAME //
	///////////////
	//
	// join is the act of adding yourself to a game that does not have enough
	// players. technically, you're providing a signature that -- when returned
	// as part of a valid game, will trigger your browser to start initializing
	// the game.
	//
	async createJoinTransaction(orig_tx, option_update = null) {
		if (!orig_tx || !orig_tx.signature) {
			console.error('Invalid Game Invite TX, cannot Join');
			return;
		}

		let txmsg = orig_tx.returnMessage();

		let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();
		for (let player of txmsg.players) {
			newtx.addTo(player);
		}
		newtx.addTo(this.publicKey);

		newtx.msg = JSON.parse(JSON.stringify(txmsg));
		newtx.msg.module = 'Arcade';
		newtx.msg.request = 'join';
		newtx.msg.game_id = orig_tx.signature;
		if (option_update) {
			newtx.msg.options = orig_tx.msg.options[option_update];
			newtx.msg.update_options = option_update;
		}

		newtx.msg.invite_sig = await this.app.crypto.signMessage(
			'invite_game_' + orig_tx.msg.timestamp,
			await this.app.wallet.getPrivateKey()
		);

		await newtx.sign();

		return newtx;
	}

	async sendJoinTransaction(invite, update_options = '') {
		//
		// Create Transaction
		//
		let newtx = await this.createJoinTransaction(invite.tx, update_options);

		//
		// send it on-chain and off-chain
		//
		this.app.network.propagateTransaction(newtx);

		this.app.connection.emit('relay-send-message', {
			recipient: 'PEERS',
			request: 'arcade spv update',
			data: newtx.toJson()
		});

		this.app.browser.logMatomoEvent('GameInvite', 'JoinGame', invite.game_name);
		this.app.connection.emit('arcade-invite-manager-render-request');
	}

	async receiveJoinTransaction(tx) {
		if (!tx || !tx.signature) {
			return;
		}

		let txmsg = tx.returnMessage();

		//console.log("JOIN TRANSACTION from: ", tx.from[0].publicKey, txmsg);

		//Transaction must be signed
		if (!txmsg.invite_sig) {
			return;
		}

		//
		// game is the copy of the original invite creation TX stored in our object of arrays.
		//
		let game = this.returnGame(txmsg.game_id);
		//
		// If we don't find it, or we have already marked the game as active, stop processing
		//
		if (!game) {
			return;
		}


		//
		// Don't add the same player twice!
		//
		if (!game.msg.players.includes(tx.from[0].publicKey)) {
			if (this.isAvailableGame(game)) {
				if (txmsg.update_options) {
					console.log(
						`Join TX updates the invite options -- ${txmsg.update_options}!`,
						game.msg.options,
						txmsg.options
					);
					Object.assign(game.msg.options[txmsg.update_options], txmsg.options);
				}

				if (this.debug) {
					console.log(
						`Adding Player (${tx.from[0].publicKey}) to Game: `,
						JSON.parse(JSON.stringify(game))
					);
				}

				//
				// add player to game
				//
				game.msg.players.push(tx.from[0].publicKey);
				game.msg.players_sigs.push(txmsg.invite_sig);

				this.removeGame(txmsg.game_id);
				this.addGame(game);

				//Update UI
				this.app.connection.emit('arcade-invite-manager-render-request');
			} else {
				if (tx.isFrom(this.publicKey)) {
					salert('Game not available right now...');
					return;
				}
			}
		} else {
			console.log('Player already added');
		}

		// If this is an already initialized table game... stop
		if (game.msg.request == 'active' || game.msg.request == 'over') {
			return;
		}

		//
		// Do we have enough players?
		//
		if (game.msg.players.length >= game.msg.players_needed) {
			//
			// Temporarily change it so we don't process additional joins
			//
			game.msg.request = 'accepted';

			//
			// First player (originator) sends the accept message
			//
			if (
				game.msg.originator == this.publicKey ||
				(tx.isFrom(this.publicKey) && game.msg.options?.async_dealing)
			) {
				let newtx = await this.createAcceptTransaction(game);
				this.app.network.propagateTransaction(newtx);
				this.app.connection.emit('relay-send-message', {
					recipient: 'PEERS',
					request: 'arcade spv update',
					data: newtx.toJson()
				});

				//Start Spinner
				this.app.connection.emit('arcade-game-initialize-render-request', txmsg.game_id);
			}
		}
	}



	async sendLeaveTransaction(invite_tx, data) {
		let txmsg = invite_tx.returnMessage();

		let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();
		for (let player of txmsg.players) {
			newtx.addTo(player);
		}

		newtx.addTo(this.publicKey);

		newtx.msg = JSON.parse(JSON.stringify(txmsg));
		newtx.msg.module = 'Arcade';
		newtx.msg.request = 'leave';
		newtx.msg.game_id = invite_tx.signature;
		newtx.msg.data = data;

		await newtx.sign();

		this.app.network.propagateTransaction(newtx);

		this.app.connection.emit('relay-send-message', {
			recipient: 'PEERS',
			request: 'arcade spv update',
			data: newtx.toJson()
		});

		//this.app.browser.logMatomoEvent('GameInvite', 'LeaveGame', txmsg.game);
		this.app.connection.emit('arcade-invite-manager-render-request');
	}


	async receiveLeaveTransaction(tx) {
		if (!tx || !tx.signature) {
			return;
		}

		let txmsg = tx.returnMessage();

		//
		// game is the copy of the original invite creation TX stored in our object of arrays.
		//
		let game = this.returnGame(txmsg.game_id);

		//
		// If we don't find it, or we have already marked the game as active, stop processing
		//
		if (!game) {
			return;
		}

		//
		// Don't remove the same player twice!
		//
		if (game.msg.players.includes(tx.from[0].publicKey)) {
				if (this.debug) {
					console.log(
						`Removing Player (${tx.from[0].publicKey}) from Game: `,
						JSON.parse(JSON.stringify(game))
					);
				}

				let index = game.msg.players.indexOf(tx.from[0].publicKey);
				game.msg.players.splice(index, 1);
				game.msg.players_sigs.splice(index, 1);

				if (!game.msg.options?.eliminated){
					game.msg.options.eliminated = {};
				}

				game.msg.options.eliminated[tx.from[0].publicKey] = txmsg.data;

				this.removeGame(txmsg.game_id);
				this.addGame(game);

				//Update UI
				this.app.connection.emit('arcade-invite-manager-render-request');
		} else {
			console.log('Player already removed / not in game');
		}

	}

	/////////////////
	// ACCEPT GAME //
	/////////////////
	//
	// this transaction should be a valid game that has signatures from everyone
	// and is capable of initializing a game. if this TX is valid and has our
	// signature we will auto-accept it, kicking off the game.
	//
	async createAcceptTransaction(orig_tx) {
		// console.log("createAcceptTransaction", orig_tx);
		if (!orig_tx || !orig_tx.signature) {
			console.error('Invalid Game Invite TX, cannot Accept');
			return;
		}

		let txmsg = orig_tx.msg;

		let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();
		for (let i = 0; i < txmsg.players.length; i++) {
			newtx.addTo(txmsg.players[i]);
		}

		newtx.msg = JSON.parse(JSON.stringify(txmsg));
		newtx.msg.module = 'Arcade';
		newtx.msg.game_id = orig_tx.signature;
		newtx.msg.request = 'accept';

		await newtx.sign();

		return newtx;
	}

	async receiveAcceptTransaction(tx) {
		//Must be valid tx
		if (!tx) {
			console.warn('Invalid tx');
			return;
		}
		let txmsg = tx.returnMessage();

		//
		// Must have game module installed
		// We call the game-initialization function directly on gamemod further down
		//
		let gamemod = this.app.modules.returnModule(txmsg.game);

		// I guess this safety catch should be further up the processing chain, like we shouldn't even display an invite/join a game we don't have installed
		if (!gamemod) {
			console.error('Error Initializing! Game Module not Installed -- ' + txmsg.game);
			return;
		}

		let game = this.returnGame(txmsg.game_id);

		// Must be an available invite
		if (!game || (!this.isAvailableGame(game, 'accepted') && !txmsg.options?.async_dealing)) {
			console.log('NOT AVAILABLE GAME');
			//console.log(game);
			//console.log(txmsg);
			return;
		}

		// do not re-accept game already in my local storage (a consequence of game initialization)
		for (let i = 0; i < this.app?.options?.games?.length; i++) {
			if (this.app.options.games[i].id === txmsg.game_id) {
				console.log('RETURNING...');
				return;
			}
		}

		//
		// Mark the game as accept, i.e. active
		//
		this.changeGameStatus(txmsg.game_id, 'active');

		//
		// If I am a player in the game, let's start it initializing
		//
		if (txmsg.players.includes(this.publicKey)) {
			console.log('$');
			console.log('$');
			console.log('$');
			console.log('$');
			console.log('$');
			console.log('$ i am in this game');
			if (!this.app.options.arcade[txmsg.game]) {
				this.app.options.arcade[txmsg.game] = 0;
			}
			this.app.options.arcade[txmsg.game]++;

			this.app.options.arcade.last_game = txmsg.game;

			this.app.connection.emit('arcade-game-initialize-render-request', txmsg.game_id);

			if (this.app.BROWSER == 1 && txmsg.players.length > 1) {
				siteMessage(txmsg.game + ' invite accepted', 5000);
			}

			/*
      So the game engine does a bunch of checks and returns false if something prevents the game
      from initializing, so... we should wait for feedback and nope out of the spinner if something breaks
      */

			console.log('before igfat 1');
			let game_engine_id = await gamemod.initializeGameFromAcceptTransaction(tx);
			console.log('before igfat 2');

			console.log('game engine id ///////');
			console.log(game_engine_id);

			if (!game_engine_id || game_engine_id !== txmsg.game_id) {
				salert('Something went wrong with the game initialization: ' + game_engine_id);
			}
		}
	}

	
	async receiveOfflineTransaction(tx){

		let txmsg = tx.returnMessage();

		if (this.app.BROWSER){
			for (let j = 0;  j < this.games.open.length; j++){
				if (this.games.open[j].signature == txmsg.game_id){
					this.games.open.splice(j, 1);
					this.app.connection.emit('arcade-invite-manager-render-request');
					break;
				}
			}
		}

		return 0;
	}



	/////////////////////////////////////////////////////////////
	// CHANGE == toggle a game invite between private and public
	//////////////////////////////////////////////////////////////
	/*
  createChangeTransaction(gametx, direction) {
      let tx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
      //tx.to.push(new saito.default.slip(this.publicKey, 0.0));
      tx.msg = gametx.returnMessage();
      tx.msg.request = "change_" + direction;
      tx.msg.game_id = gametx.signature;
      tx = this.app.wallet.signTransaction(tx);

      if (this.debug) {
        console.log("Transaction to change");
        console.log(gametx);
        console.log(`CHANGE TX to ${direction}:`, tx);
      }
      return tx;
    }


  async receiveChangeTransaction(tx) {

    let txmsg = tx.returnMessage();
    let new_status = txmsg.request.split("_")[1];

    let sql = `UPDATE games SET status = '${new_status}' WHERE game_id = '${txmsg.game_id}'`;
    this.sendPeerDatabaseRequestWithFilter("Arcade", sql);

    //
    // update status if stored locally
    //
    let game = this.returnGame(newtx.game_id);
    if (game) { game.msg.request = new_status; }

    //
    // and re-display
    //
    if (!tx.isFrom(this.publicKey)) {
      if (this.isMyGame(tx)) {
        this.app.connection.emit('arcade-invite-manager-render-request', invites[i]);
      } else {
        if (new_status == "private") {
          this.removeGame(txmsg.game_id);
        } else {
          this.addGame(newtx, "open");
        }
        this.app.connection.emit('arcade-invite-manager-render-request', invites[i]);
      }
    };
  }
  */

	///////////////
	// CHALLENGE //
	///////////////
	//
	// a direct invitation from one player to another
	//

	async createChallengeTransaction(game, players, options) {
		let timestamp = new Date().getTime();

		let accept_sig = await this.app.crypto.signMessage(
			`invite_game_${timestamp}`,
			await this.app.wallet.getPrivateKey()
		);

		let tx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey);

		let otherPlayer = null;

		console.log(players);

		for (let sendto of players) {
			if (sendto !== this.publicKey) {
				otherPlayer = sendto;
				tx.addTo(otherPlayer);
			}
		}

		if (!otherPlayer) {
			return null;
		}

		tx.msg = {
			timestamp: timestamp,
			module: 'Arcade',
			request: 'challenge',
			game,
			options,
			players_needed: players.length,
			players: [this.publicKey],
			players_sigs: [accept_sig],
			originator: this.publicKey,
			desired_opponent_publickey: otherPlayer
		};

		await tx.sign();

		return tx;
	}

	receiveChallengeTransaction(tx, blk = null) {
		if (!tx || !tx.signature) {
			return;
		}

		if (!tx.isTo(this.publicKey)) {
			return;
		}

		this.addGame(tx, 'private');

		let txmsg = tx.returnMessage();

		//console.log(txmsg);

		if (!tx.isFrom(this.publicKey)) {
			this.challenge_tx = tx;
		}

		this.app.connection.emit('arcade-challenge-issued', tx);
	}

	/*
  Update the Games Table with a new list of players+signatures for the multiplayer game
  (works for adding or subtracting players and enforces consistent ordering)
  *****
  DO NOT DELETE THIS FUNCTION AGAIN UNLESS WE WANT TO GET RID OF MULTIPLAYER GAMES
  *****
  */
	async updatePlayerListSQL(id, keys, sigs) {
		if (!this.app.BROWSER) {
			//Copy arrays to new data structures
			keys = keys.slice();
			sigs = sigs.slice();
			let players_array = keys.shift() + '/' + sigs.shift();

			if (keys.length !== sigs.length) {
				console.error('Length mismatch');
			}

			while (keys.length > 0) {
				let minIndex = 0;
				for (let i = 1; i < keys.length; i++) {
					if (keys[i] < keys[minIndex]) {
						minIndex = i;
					}
				}
				players_array += `_${keys.splice(minIndex, 1)[0]}/${sigs.splice(minIndex, 1)[0]}`;
			}

			let sql = 'UPDATE games SET players_array = $players_array WHERE game_id = $game_id';
			let params = {
				$players_array: players_array,
				$game_id: id
			};

			await this.app.storage.runDatabase(sql, params, 'arcade');
		}
	}

	///////////////////////////////
	// "LOAD"ING AND RUNNING GAMES //
	///////////////////////////////

	//
	// single player game
	//
	async launchSinglePlayerGame(gameobj) {
		let opentx = await this.createOpenTransaction(gameobj, this.publicKey);

		this.app.connection.emit('relay-send-message', {
			recipient: 'PEERS',
			request: 'arcade spv update',
			data: opentx.toJson()
		});
		this.addGame(opentx, 'private');

		let newtx = await this.createAcceptTransaction(opentx);

		this.app.network.propagateTransaction(newtx);
		this.app.connection.emit('relay-send-message', {
			recipient: 'PEERS',
			request: 'arcade spv update',
			data: newtx.toJson()
		});

		//Start Spinner
		this.app.connection.emit('arcade-game-initialize-render-request', opentx.signature);

		/*
    try {

          this.app.connection.emit("arcade-game-initialize-render-request");

          console.log(JSON.parse(JSON.stringify(gameobj)));

          let gameMod = this.app.modules.returnModule(gameobj.name);

          for (let i = 0; i < this.app.options?.games.length; i++) {
            if (this.app.options.games[i].module == gameobj.name) {
              this.app.connection.emit("arcade-game-ready-render-request", { name: gameobj.name, slug: gameMod.returnSlug(), id: this.app.options.games[i].id })
              return;
            }
          }

          let tx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
          tx.to.push(new saito.default.slip(this.publicKey, 0.0));

          tx.msg = {};
          tx.msg.request = "launch singleplayer";
          tx.msg.module = "Arcade";
          tx.msg.game = gameobj.name;
          tx = this.app.wallet.signTransaction(tx);
          this.app.network.propagateTransaction(tx);

          let game_id = await gameMod.initializeSinglePlayerGame(gameobj);

          for (let i = 0; i < this.app.options?.games.length; i++) {
            if (this.app.options.games[i].id == "" && this.app.options.games[i].name === gameMod.name) {
              this.app.options.games[i].id = game_id;
            }
          }

          this.app.connection.emit("arcade-game-ready-render-request", { name: gameobj.name, slug: gameMod.returnSlug(), id: game_id })

    } catch (err) {
      console.log(err);
      return;
    }
*/
	}

	/************************************************************
   // functions to manipulate the local games list
   ************************************************************/

	//
	//Add a game (tx) to a specified list
	//
	addGame(tx, list = null) {
		//
		// Sanity check the tx and make sure we don't already have it
		//
		if (!tx || !tx.msg || !tx.signature) {
			console.error("Invalid Game TX, won't add to list", tx);
			return false;
		}

		//Always removeGame before calling addGame to successfully reclassify
		for (let key in this.games) {
			for (let z = 0; z < this.games[key].length; z++) {
				if (tx.signature === this.games[key][z].signature) {
					if (this.debug) {
						console.log('TX is already in Arcade list');
					}
					return false;
				}
			}
		}

		if (list) {
			//Update the game status (open/private/active/close/over)
			tx.msg.request = list;
		} else {
			//default to the embedded invite type
			list = tx.msg?.request || 'open';
		}

		if (list !== 'over' && list !== 'close' && list !== 'offline') {
			//
			// Sanity check the target list so my games are grouped together
			//
			if (this.isMyGame(tx)) {
				list = 'mine';
			} else {
				if (tx.msg.players_needed <= tx.msg.players.length) {
					list = 'active';
				}
				//if (tx.msg?.options['open-table']) {
				//	list = 'open';
				//}
			}
		}

		if (!this.games[list]) {
			this.games[list] = [];
		}

		// We want new games to go towards the top

		this.games[list].unshift(tx);

		if (this.debug) {
			console.log(
				`Added game (${tx.signature}) to ${list}`,
				JSON.parse(JSON.stringify(this.games))
			);
		}

		return true;
	}

	removeGame(game_id) {
		for (let key in this.games) {
			this.games[key] = this.games[key].filter((game) => {
				if (game.signature) {
					return game.signature != game_id;
				} else {
					return true;
				}
			});
		}
	}

	//
	// purges invites unaccepted
	//
	purgeOldGames() {
		let now = new Date().getTime();
		for (let key in this.games) {
			let cutoff = now - this.invite_cutoff;
			if (key == 'active' || key == 'over' || key == 'mine') {
				cutoff = now - this.game_cutoff;
			}
			this.games[key] = this.games[key].filter((game) => {
				return game.timestamp > cutoff;
			});
		}

		if (this.app.BROWSER){
			//Second pass for my open invites
			let cutoff = now - this.invite_cutoff;
			for (let g = this.games.mine.length - 1; g >= 0; g--) {
				if (!this.isAvailableGame(this.games.mine[g])) {
					if (this.games.mine[g].timestamp < cutoff) {
						siteMessage('Game invite timed out...', 4000);
						this.games.mine.splice(g, 1);
					}
				}
			}
		}
	}

	purgeBadGamesFromWallet() {
		if (this.app.options.games) {
			for (let i = this.app.options.games.length - 1; i >= 0; i--) {
				if (this.app.options.games[i].module === '' && this.app.options.games[i].id.length < 25) {
					this.app.options.games.splice(i, 1);
				} else if (this.app.options.games[i].players_set == 0) {
					//This will be games created but not fully initialized for whatever reason
					this.app.options.games.splice(i, 1);
				}
			}
		}
	}

	//
	// purges games that are completed
	//
	purgeOldGamesFromWallet() {
		if (this.app.options.games) {
			for (let i = this.app.options.games.length - 1; i >= 0; i--) {
				let g = this.app.options.games[i];
				if (g.over >= 1) {
					if (g.timestamp < new Date().getTime() - 240000) {
						// after 1 hour
						this.app.options.games.splice(i, 1);
					}
				}
			}
		}
	}


	removeGameFromWallet(game_id){
		this.removeGame(game_id);
		if (this.app.options.games) {
			for (let i = 0; i < this.app.options.games.length; i++) {
				if (this.app.options.games[i].id){
					this.app.options.games.splice(i, 1);
					break;
				}
			}
		}
		this.app.storage.saveOptions();
		this.app.connection.emit('arcade-invite-manager-render-request');
	}

	isAvailableGame(game_tx, additional_status = '') {
		if (game_tx.msg.request == 'open' || game_tx.msg.request == 'private') {
			return true;
		}
		if (game_tx.msg.request == 'active' && game_tx.msg.options['open-table']){
			return true;
		}
		if (additional_status && additional_status === game_tx.msg.request) {
			return true;
		}
		if (this.debug) {
			console.log('Game cannot be joined or accepted because ' + game_tx.msg.request);
		}
		return false;
	}

	//
	// Determines whether the user is in any way associated with the game
	// Either they sent the invite, they have clicked join, or someone specifically invited them by key
	//
	isMyGame(tx) {
		for (let i = 0; i < tx.to.length; i++) {
			if (tx.to[i].publicKey == this.publicKey) {
				return true;
			}
		}
		for (let i = 0; i < tx.msg.players.length; i++) {
			if (tx.msg.players[i] == this.publicKey) {
				return true;
			}
		}
		if (tx.msg.options) {
			if (tx.msg.options.desired_opponent_publickey) {
				if (tx.msg.options.desired_opponent_publickey == this.publicKey) {
					return true;
				}
			}
		}
		return false;
	}

	findGame(game, short_id) {
		for (let key in this.games) {
			for (let g of this.games[key]) {
				if (g.game == game && this.app.crypto.hash(g.signature).slice(-6) === short_id) {
					return g;
				}
			}
		}
		return null;
	}

	returnGame(game_id) {
		for (let key in this.games) {
			let game = this.games[key].find((g) => g.signature == game_id);
			if (game) {
				return game;
			}
		}
		return null;
	}

	returnOpenInvites() {
		let invites = [];

		for (let invite of this.games?.mine) {
			if (this.isAvailableGame(invite) && this.publicKey == invite.msg.originator) {
				invites.push(invite.signature);
			}
		}

		return invites;
	}

	returnGameFromHash(game_id) {
		for (let key in this.games) {
			let game = this.games[key].find(
				(g) => this.app.crypto.hash(g.signature).slice(-6) == game_id
			);
			if (game) {
				if (this.debug) {
					console.log(`Game found in ${key} list`);
				}
				return game;
			}
		}
		return null;
	}

	shouldAffixCallbackToModule(modname) {
		if (modname == 'Arcade') {
			return 1;
		}
		for (let i = 0; i < this.affix_callbacks_to.length; i++) {
			if (this.affix_callbacks_to[i] == modname) {
				return 1;
			}
		}
		return 0;
	}

	isSlug(slug) {
		if (slug == this.returnSlug() || slug == 'game') {
			return true;
		}
		return false;
	}

	webServer(app, expressapp, express) {
		let webdir = `${__dirname}/../../mods/${this.dirname}/web`;
		let arcade_self = this;

		expressapp.get('/' + encodeURI(this.returnSlug()), async function (req, res) {
			let reqBaseURL = req.protocol + '://' + req.headers.host + '/';
			let game_data = null;
			let updatedSocial = Object.assign({}, arcade_self.social);

			if (Object.keys(req.query).length > 0) {
				let query_params = req.query;

				let game = query_params?.game || query_params?.view_game;

				if (game) {
					let gm = app.modules.returnModuleBySlug(game.toLowerCase());
					if (gm) {
						updatedSocial.title = `Play ${gm.returnName()} on 🟥 Saito`;
						updatedSocial.image = `${reqBaseURL + gm.returnSlug()}/img/arcade/arcade.jpg`;
					}
				}

				let id = query_params?.game_id;
				game_data = arcade_self.findGame(game, id);
			}

			updatedSocial.url = reqBaseURL + encodeURI(arcade_self.returnSlug());
			let html = arcadeHome(app, arcade_self, app.build_number, updatedSocial, game_data);
			if (!res.finished) {
				res.setHeader('Content-type', 'text/html');
				res.charset = 'UTF-8';
				return res.send(html);
			}
			return;
		});

		expressapp.get('/game/:game', async function (req, res) {
			let reqBaseURL = req.protocol + '://' + req.headers.host + '/';
			let game = req.params.game;
			let game_mod = arcade_self.app.modules.returnModuleBySlug(game);

			if (game_mod) {
				let html = game_mod.returnHomePage(reqBaseURL);
				if (!res.finished) {
					res.setHeader('Content-type', 'text/html');
					res.charset = 'UTF-8';
					return res.send(html);
				}
				return;
			} else {
				let html = arcadeHome(app, arcade_self, app.build_number, arcade_self.social, null);
				if (!res.finished) {
					res.setHeader('Content-type', 'text/html');
					res.charset = 'UTF-8';
					return res.send(html);
				}
				return;
			}
		});

		expressapp.use('/' + encodeURI(this.returnSlug()), express.static(webdir));
	}

	showShareLink(game_sig, show = true) {
		let data = {};
		let accepted_game = null;

		//Add more information about the game
		for (let key in this.games) {
			let x = this.games[key].find((g) => g.signature === game_sig);
			if (x) {
				accepted_game = x;
			}
		}

		if (accepted_game) {
			data.game = accepted_game.msg.game;
			data.game_id = this.app.crypto.hash(game_sig).slice(-6);
			data.path = '/arcade/';
			if (accepted_game.msg?.options?.crypto){
				data.crypto = accepted_game.msg.options.crypto;
			}
		} else {
			return;
		}

		let game_invitation_link = new GameInvitationLink(this.app, this, data);
		game_invitation_link.render(show);
	}

	async makeGameInvite(options, gameType = 'open', invite_obj = {}) {
		let game = options.game;
		let game_mod = this.app.modules.returnModule(game);
		let players_needed = options['game-wizard-players-select'];

		//
		// add league_id to options if this is a league game
		//
		if (invite_obj.league) {
			//The important piece of information
			options.league_id = invite_obj.league.id;
			//For convenience sake when making the join overlay
			options.league_name = invite_obj.league.name;
		}
		if (invite_obj.publicKey) {
			options.desired_opponent_publickey = invite_obj.publicKey;
			gameType = 'direct';
		}
		if (invite_obj.gameobj) {
			options.gameobj = invite_obj.gameobj;
			gameType = 'import';
		}

		if (!players_needed) {
			console.error('ERROR 582342: Create Game Error');
			return;
		}

		console.log('creating gamedata...');

		let gamedata = {
			ts: new Date().getTime(),
			name: game,
			slug: game_mod.returnSlug(),
			options: options,
			players_needed: players_needed,
			invitation_type: gameType
		};
		console.log('X: ' + JSON.stringify(gamedata));

		if (players_needed == 1) {
			this.launchSinglePlayerGame(gamedata);
			return;
		} else {
			let open_invites = this.returnOpenInvites();
			if (open_invites.length > 0) {
				let c = await sconfirm(
					'You already have an open invite. Are you sure you want to create a new one?'
				);
				if (!c) {
					return;
				} else {
					c = await sconfirm('Would you like to close the other invites?');
					if (c) {
						for (let game_id of open_invites) {
							this.sendCancelTransaction(game_id);
						}
					}
				}
			}

			if (gameType == 'direct') {
				if (gamedata.players_needed > 2) {
					gamedata.invitation_type = 'open';
				} else {
					gamedata.invitation_type = 'private';
				}
			}

			console.log('creating gamedata... 2');
			let newtx = await this.createOpenTransaction(gamedata);
			console.log('creating gamedata... 3');

			if (gameType == 'import') {
				console.log('creating gamedata... 3');
				this.app.connection.emit('arcade-launch-game-import', newtx);
				console.log('creating gamedata... 4');
				return;
			}

			if (gameType == 'direct') {
				this.app.connection.emit('arcade-launch-game-scheduler', newtx);
				return;
			}

			await this.app.network.propagateTransaction(newtx);
			this.app.connection.emit('relay-send-message', {
				recipient: 'PEERS',
				request: 'arcade spv update',
				data: newtx.toJson()
			});
			this.addGame(newtx, gamedata.invitation_type);
			//Render game in my game list
			this.app.connection.emit('arcade-invite-manager-render-request');

			if (gameType == 'open') {
				if (this.app.browser.isMobileBrowser(navigator.userAgent) && !this.browser_active) {
					siteMessage('Game invite created. Visit the Arcade to manage');
				}
				return;
			}

			if (gameType == 'private') {
				this.showShareLink(newtx.signature);
			}
		}
	}

	///////////////////////////////////////////////////////////////////////////
	////////////////////   GAME OBSERVER STUFF  ///////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	async observeGame(game_id, watch_live = false) {
		let game_tx = this.returnGame(game_id);

		if (!game_tx) {
			console.warn('Game not found!');
			return;
		}

		console.log('Observe Game: ', watch_live);

		let game_msg = game_tx.returnMessage();

		let game_mod = this.app.modules.returnModule(game_msg.game);

		this.app.connection.emit('arcade-game-initialize-render-request', game_id);

		//We want to send a message to the players to add us to the game.accept list so they route their game moves to us as well
		game_msg.game_id = game_id;

		if (!this.app.options.games) {
			this.app.options.games = [];
		}

		if (!game_mod.doesGameExistLocally(game_id)) {
			console.log('Initialize game');
			//starts running the queue...
			await game_mod.initializeObserverMode(game_tx, watch_live);
		} else {
			console.log('Game already exists');
			game_mod.loadGame(game_id);
			game_mod.game.player = 0;
		}

		if (watch_live) {
			game_mod.expecting_state = true;
			game_mod.sendMetaMessage("FOLLOW");
		}

	}
}

module.exports = Arcade;
