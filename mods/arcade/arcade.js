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

		this.icon_fa = 'fas fa-gamepad';

		this.styles = ['/arcade/style.css'];

		this.affix_callbacks_to = [];
		this.services = [new PeerService(null, 'arcade', '', 'saito')];

		this.invite_cutoff = 3500000;
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

		app.connection.on('arcade-notify-player-turn', (game_id, target, status) => {
			for (let game of app.options.games) {
				if (game.id == game_id) {

					//let prev_target = game.target;

					game.status = status;
					game.target = target;

					// save with turn updated, so reload works
					app.storage.saveOptions();

					//if (prev_target == target){
					//	prev_target--;
					//	if (prev_target < 1){
					//		prev_target = game.players.length;
					//	}
					//	console.log("Adjust prev target");
					//}
					//console.log("Last: ", prev_target, "Me:", target);
					//console.log(`${this.app.keychain.returnUsername(game.players[prev_target-1])} played a move **********`);

					siteMessage(`It is now your turn in ${game.module}`, 5000);
					app.connection.emit('arcade-invite-manager-render-request');
				}
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

		if (this.browser_active) {
			this.styles = ['/saito/saito.css', '/arcade/style.css'];
		}

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

				//console.log("Processing games from app.options:");

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
						}
					}
				}
			}

			//Check for server delivered data load
			if (window?.game) {
				console.log('GAME FROM WEBSERVER!!!!!');
				console.log(window.game);
				let tx = this.createGameFromRecord(window.game);
				this.addGame(tx, window.game?.status);
			}

			//console.log(JSON.parse(JSON.stringify(this.games)));
			this.app.connection.emit('arcade-invite-manager-render-request');
		}

		try {
			this.leagueCallback = this.app.modules.returnFirstRespondTo('league_membership');
		} catch (err) {
			this.leagueCallback = {};
		}
	}

	createGameFromRecord(record) {
		//This is the save openTX
		let game_tx = new Transaction(undefined, JSON.parse(record.tx));
		game_tx.timestamp = record.created_at;

		//But we update the player list
		let player_info = record.players_array.split('_');
		for (let pi of player_info) {
			let pair = pi.split('/');
			let pkey = pair[0];
			let sig = pair[1];
			if (!game_tx.msg.players.includes(pkey)) {
				game_tx.msg.players.push(pkey);
				game_tx.msg.players_sigs.push(sig);
			}
		}

		//
		//Game Meta Data stored directly in DB
		//
		if (record.winner) {
			game_tx.msg.winner = [record.winner];
			try {
				game_tx.msg.winner = JSON.parse(record.winner);
			} catch (err) {
				//console.log("Non-JSON DB entry:", record.winner);
			}
		}

		game_tx.msg.method = record.method;
		game_tx.msg.time_finished = record.time_finished;
		if (record?.step) {
			let step = JSON.parse(record.step);
			game_tx.msg.step = step?.game;
			game_tx.msg.timestamp = step?.timestamp;

			// Make sure an active game (one that has started, will not be considered an open invite)
			game_tx.msg.players_needed = game_tx.msg.players.length;
		}

		if (this.debug) {
			console.log('Load DB Game: ' + record.status, game_tx.returnMessage());
		}
		if (record.time_finished) {
			if (record.status !== 'over') {
				console.log('Game status mismatch');
				record.status = 'close';
			}
		}

		return game_tx;
	}

	async createPseudoTransaction(game) {
		let game_tx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();

		if (game.players) {
			game.players.forEach((player) => {
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
			players: game.players,
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

	//
	// runs when we connect to a network client
	// The key thing that happens is we want to query the service node for current state of the arcade
	// Since no open transactions are addressed to us, we can't just read them off the blockchain
	//
	async onPeerHandshakeComplete(app, peer) {
		if (!app.BROWSER) {
			return;
		}
		let arcade_self = this;

		let cutoff1 = new Date().getTime() - this.invite_cutoff;
		let cutoff2 = new Date().getTime() - this.game_cutoff;

		//
		// load open games from server
		//  ( status = "open" OR status = "private" ) AND

		let sql = `SELECT *
               FROM games
               WHERE created_at > ${cutoff1}
                  OR (created_at > ${cutoff2} AND (status = 'over' OR status = 'active'))
               ORDER BY created_at ASC`;

		this.sendPeerDatabaseRequestWithFilter('Arcade', sql, (res) => {

			if (res?.rows) {
				for (let record of res.rows) {
					if (this.debug) {
						console.log(JSON.parse(JSON.stringify(record)));
					}

					let game_tx = this.createGameFromRecord(record);
					//
					//record.status will overwrite the open/private msg.request from the original game invite creation
					//
					let game_added = arcade_self.addGame(game_tx, record.status);

					//Game is marked as "active" but we didn't already add it from our app.options file...
					if (record.status == "active" && game_added && arcade_self.isMyGame(game_tx)){
						console.log("ARCADE: Asynchronous game creation!")
						game_tx.msg.game_id = game_tx.signature;
						arcade_self.receiveAcceptTransaction(game_tx);
					}
				}
			}

			//
			// For processing direct link to game invite
			//
			if (arcade_self.app.browser.returnURLParameter('game_id')) {
				let game_id_short = arcade_self.app.browser.returnURLParameter('game_id');

				if (arcade_self.debug) {
					console.log('attempting to join game... ' + game_id_short);
				}

				let game = arcade_self.returnGameFromHash(game_id_short);

				if (!game) {
					salert('Sorry, the game is no longer available');
					return;
				}

				if (arcade_self.isAvailableGame(game)) {
					console.log('Make it my game');
					//Mark myself as an invited guest
					//game.msg.options.desired_opponent_publickey = this.publicKey;

					//Then we have to remove and readd the game so it goes under "mine"
					//arcade_self.removeGame(game.signature);
					//arcade_self.addGame(game, "private");
				}

				app.browser.logMatomoEvent('GameInvite', 'FollowLink', game.game);

				let invite = new Invite(app, this, null, null, game, this.publicKey);
				let join_overlay = new JoinGameOverlay(app, this, invite.invite_data);
				join_overlay.render();
				window.history.pushState('', '', `/arcade/`);
			}

			app.connection.emit('arcade-invite-manager-render-request');
			app.connection.emit('arcade-data-loaded');

		});
	}

	async onPeerServiceUp(app, peer, service = {}) {

		if (!app.BROWSER) {
			return;
		}

		if (service.service === 'archive') {
			for (let game of this.app.options.games) {
				if (game?.over) {
					continue;
				}

				let query = game.module + '_' + game.id;

				console.log("Arcade check for missed game events: ", query);

				let game_mod = this.app.modules.returnModule(game.module);

				if (!game_mod){
					continue;
				}

				this.app.storage.loadTransactions(
					{
						field1: query
					},
					async (txs) => {
						for (let i = txs.length - 1; i >= 0; i--) {
							//Process in Arcade
							await this.onConfirmation(-1, txs[i], 0);
							//Process in game mod
							await game_mod.onConfirmation(-1, txs[i], 0);
						}
					},
					peer
				);
			}
		}
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
		if (window.location.pathname.includes(this.returnSlug())){

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

		}else{

			let path = window.location.pathname.split("/");
			let game_name = path.pop();
			console.log(game_name);
			let game_mod = this.app.modules.returnModuleBySlug(game_name);
			console.log(game_mod);
			if (game_mod){
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
				let obj = new InviteManager(this.app, this, qs);
				obj.type = 'short';
				this.renderIntos[qs].push(obj);
				this.attachStyleSheets();
			}
		}

		if (qs == '.arcade-invites-box') {
			if (!this.renderIntos[qs]) {
				this.styles = ['/arcade/style.css'];
				this.renderIntos[qs] = [];
				let obj = new InviteManager(this.app, this, '.arcade-invites-box');
				obj.type = 'long';
				this.renderIntos[qs].push(obj);
				this.attachStyleSheets();
			}
		}

		if (qs == '.game-page-invites') {
			if (!this.renderIntos[qs]) {
				this.styles = ['/arcade/style.css'];
				this.renderIntos[qs] = [];
				let obj = new InviteManager(this.app, this, '.arcade-invites-box');
				obj.type = 'long';
				this.renderIntos[qs].push(obj);
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
		if (type == 'header-dropdown') {
			return {
				name: this.appname ? this.appname : this.name,
				icon_fa: this.icon_fa,
				browser_active: this.browser_active,
				slug: this.returnSlug()
			};
		}
		if (type === 'user-menu') {
			if (obj?.publicKey && obj.publicKey !== this.publicKey) {
				let am = this.app.modules.returnActiveModule();
				if (!am || !this.shouldAffixCallbackToModule(am.name) || this.name == am.name){
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
			let container = obj?.container || "";
			let gm = new GameManager(this.app, this, container);
			return { gm };
		}

		if (type === 'invite-manager'){
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
				x.push({
					text: 'Arcade',
					icon: 'fa-solid fa-building-columns',
					rank: 15,
					callback: function (app, id) {
						window.location = '/arcade';
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
				disallowed_mods: ['redsquare'],
				rank: 10,
				callback: function (app, id) {
					app.connection.emit('arcade-launch-game-selector', {});
				}
			});
			return x;

			return x;
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
		// console.log("onConfirmation called");
		let txmsg = tx.returnMessage();
		let arcade_self = this.app.modules.returnModule('Arcade');

		try {
			if (conf == 0) {
				if (txmsg.module === 'Arcade') {
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
					// Allow the game originator to change mind about game being open or private
					//
					/*
          if (txmsg.request.includes("change")) {
            arcade_self.receiveChangeTransaction(tx);
          }
          */

					//
					// Add a player to the game invite
					//
					if (txmsg.request == 'join') {
						await arcade_self.receiveJoinTransaction(tx);
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
						await this.app.storage.saveTransaction(
							tx,
							{ field1: txmsg.module + '_' + txmsg.game_id },
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

		//
		// this code doubles onConfirmation
		//
		if (message?.data && message?.request === 'arcade spv update') {
			let tx = new Transaction(undefined, message.data);

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

				/*
        //TODO - reimplement / check
        // This was an idea to completely off-chain send a player a direct/play now game invite
        // Which will pop up a yes/no demand for immediate response

        if (txmsg.request == "challenge") {
          this.receiveChallengeTransaction(tx);
        }

        if (txmsg.request == "sorry"){
          app.connection.emit("arcade-reject-challenge", txmsg.game_id);
        }
        */
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

	//
	// send TX to our SPV peers
	//
	async notifyPeers(tx) {
		if (this.app.BROWSER == 1) {
			return;
		}
		let peers = await this.app.network.getPeers();
		for (let peer of peers) {
			// console.log("sync type : " + peer.peerIndex + " -> " + peer.synctype);
			if (peer.synctype == 'lite') {
				//
				// fwd tx to peer
				//
				let message = {};
				message.request = 'arcade spv update';
				message.data = tx.toJson();

				// console.log("notifying peer : " + peer.peerIndex);
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

		if (this.debug) {
			console.log(
				`Creating ${invitation_type} Game Invite: `,
				JSON.parse(JSON.stringify(newtx.msg))
			);
		}

		newtx.packData();
		await newtx.sign();

		return newtx;
	}

	async receiveOpenTransaction(tx, blk = null) {
		let txmsg = tx.returnMessage();

		// add to games list == open or private
		this.addGame(tx, txmsg.request);
		this.app.connection.emit('arcade-invite-manager-render-request');

		if (txmsg?.options?.desired_opponent_publickey == this.publicKey) {
			siteMessage(`You were invited to play ${txmsg.game}`, 5000);
		}

		//
		// Only the arcade service node (non-browser) needs to bother executing SQL
		//

		let options = txmsg.options != undefined ? txmsg.options : {};

		let players_array = txmsg.players[0] + '/' + txmsg.players_sigs[0];
		let start_bid = blk != null ? blk.id : BigInt(1);

		let created_at = tx.timestamp;

		let sql = `INSERT
    OR IGNORE INTO games (
                game_id ,
                players_needed ,
                players_array ,
                module ,
                status ,
                options ,
                tx ,
                start_bid ,
                created_at ,
                winner
              ) VALUES (
    $game_id ,
    $players_needed ,
    $players_array ,
    $module ,
    $status ,
    $options ,
    $tx,
    $start_bid ,
    $created_at ,
    $winner
    )`;
		let params = {
			$game_id: tx.signature,
			$players_needed: parseInt(txmsg.players_needed),
			$players_array: players_array,
			$module: txmsg.game,
			$status: txmsg.request, //open, private
			$options: options,
			$tx: JSON.stringify(tx.toJson()),
			$start_bid: start_bid,
			$created_at: created_at,
			$winner: ''
		};
		await this.app.storage.runDatabase(sql, params, 'arcade');
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

				await this.changeGameStatus(txmsg.game_id, 'close');
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

				await this.updatePlayerListSQL(txmsg.game_id, game.msg.players, game.msg.players_sigs);
			}
		} else if (
			game.msg.options?.desired_opponent_publickey &&
			tx.isFrom(game.msg.options.desired_opponent_publickey)
		) {
			if (this.publicKey == game.msg.originator) {
				siteMessage('Your game invite was declined', 5000);
			}
			await this.changeGameStatus(txmsg.game_id, 'close');
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

	async changeGameStatus(game_id, newStatus) {

		let game = this.returnGame(game_id);

		if (game?.msg?.request == 'over') {
			return;
		}

		//Update top level sql table
		let sql = `UPDATE games
               SET status = $status
               WHERE game_id = $game_id AND status != 'over'`;

		let params = { $status: newStatus, $game_id: game_id };
		await this.app.storage.runDatabase(sql, params, 'arcade');

		//Move game to different list
		if (game) {
			this.removeGame(game_id);
			this.addGame(game, newStatus);
		}

		this.app.connection.emit('arcade-invite-manager-render-request');
	}

	//////////////
	// GAMEOVER //
	//////////////

	/*
  Note to self -- need to fix DB storage of winner since we are ambiguous as to whether it is a string or array
*/
	async receiveGameoverTransaction(tx) {
		let txmsg = tx.returnMessage();

		let game = this.returnGame(txmsg.game_id);

		let winner = txmsg.winner || null;
		console.log('Winner:', winner);

		if (game?.msg) {
			//Store the results locally
			game.msg.winner = winner;
			game.msg.method = txmsg.reason;
			game.msg.time_finished = txmsg.timestamp;
		} else {
			console.warn("Game not found, arcade can't process gameover tx");
		}

		let sql = `UPDATE games
               SET winner        = $winner,
                   method        = $method,
                   status  	   = $status,
                   time_finished = $timestamp
               WHERE game_id = $game_id`;
		let params = {
			$winner: JSON.stringify(winner),
			$method: txmsg.reason,
			$status: "over",
			$timestamp: txmsg.timestamp,
			$game_id: txmsg.game_id
		};
		await this.app.storage.runDatabase(sql, params, 'arcade');

		if (this.debug) {
			console.log('Winner updated in arcade');
		}
	}

	async receiveCloseTransaction(tx) {
		let txmsg = tx.returnMessage();
		this.app.connection.emit('arcade-close-game', txmsg.game_id);
		await this.changeGameStatus(txmsg.game_id, 'close');
	}

	async receiveGameStepTransaction(tx) {
		let txmsg = tx.returnMessage();
		let game = this.returnGame(txmsg.game_id);
		if (game?.msg) {
			game.msg.step = txmsg.step.game;
			game.msg.timestamp = txmsg.step.timestamp;
		}

		if (!this.app.BROWSER) {
			let sql = `UPDATE games
                 SET step = $step
                 WHERE game_id = $game_id`;
			let params = {
				$step: JSON.stringify(txmsg.step),
				$game_id: txmsg.game_id
			};
			await this.app.storage.runDatabase(sql, params, 'arcade');
		}
	}

	////////////
	// Invite // TODO -- confirm we still use these, instead of challenge
	////////////
	//
	// unsure
	//
	async createInviteTransaction(orig_tx) {
		// console.log("createInviteTransaction", orig_tx);
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
	async createJoinTransaction(orig_tx) {

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

		newtx.msg.invite_sig = await this.app.crypto.signMessage(
			'invite_game_' + orig_tx.msg.timestamp,
			await this.app.wallet.getPrivateKey()
		);

		await newtx.sign();

		return newtx;
	}

	async sendJoinTransaction(invite){
		//
		// Create Transaction
		//
		let newtx = await this.createJoinTransaction(invite.tx);

		//
		// send it on-chain and off-chain
		//
		this.app.network.propagateTransaction(newtx);

		this.app.connection.emit('relay-send-message', {
			recipient: 'PEERS',
			request: 'arcade spv update',
			data: newtx.toJson()
		});

		this.app.browser.logMatomoEvent('GameInvite', 'JoinGame', invite.game_mod.name);
		this.app.connection.emit('arcade-invite-manager-render-request');

	}

	async receiveJoinTransaction(tx) {
		// console.log("receiveJoinTransaction", tx);
		if (!tx || !tx.signature) {
			return;
		}

		let txmsg = tx.returnMessage();

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
		if (!game || !this.isAvailableGame(game)) {
			return;
		}

		//
		// Don't add the same player twice!
		//
		if (!game.msg.players.includes(tx.from[0].publicKey)) {
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

			//Update DB
			await this.updatePlayerListSQL(txmsg.game_id, game.msg.players, game.msg.players_sigs);

			//Update UI
			this.app.connection.emit('arcade-invite-manager-render-request');
		}

		//
		// Do we have enough players?
		//
		if (game.msg.players.length >= game.msg.players_needed) {
			//Temporarily change it....
			game.msg.request = 'accepted';

			//
			// First player (originator) sends the accept message
			//
			if (game.msg.originator == this.publicKey || tx.isFrom(this.publicKey) && game.msg.options?.async_dealing) {
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
			console.warn("Invalid tx");
			return;
		}
		let txmsg = tx.returnMessage();

		// Must have game module installed
		// We call the game-initialization function directly on gamemod further down
		let gamemod = this.app.modules.returnModule(txmsg.game);

		// I guess this safety catch should be further up the processing chain, like we shouldn't even display an invite/join a game we don't have installed
		if (!gamemod) {
			console.error('Error Initializing! Game Module not Installed -- ' + txmsg.game);
			return;
		}

		let game = this.returnGame(txmsg.game_id);

		// Must be an available invite
		if (!game || (!this.isAvailableGame(game, 'accepted') && !txmsg.options?.async_dealing)) {
			console.log(game);
			console.log(txmsg);
			return;
		}

		// do not re-accept game already in my local storage (a consequence of game initialization)
		for (let i = 0; i < this.app?.options?.games?.length; i++) {
			if (this.app.options.games[i].id == txmsg.game_id) {
				return;
			}
		}

		//
		// Mark the game as accept, i.e. active
		//
		await this.changeGameStatus(txmsg.game_id, 'active');

		//
		// If I am a player in the game, let's start it initializing
		//

		if (txmsg.players.includes(this.publicKey)) {
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

			let game_engine_id = await gamemod.initializeGameFromAcceptTransaction(tx);

			console.log('game engine id ///////');
			console.log(game_engine_id);

			if (!game_engine_id || game_engine_id !== txmsg.game_id) {
				salert('Something went wrong with the game initialization: ' + game_engine_id);
			}
		}
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
	/*
  createChallengeTransaction(gameData) {
    let timestamp = new Date().getTime();
    let accept_sig = this.app.crypto.signMessage(
      `invite_game_${ts}`,
      this.app.wallet.returnPrivateKey()
    );

    let tx = this.app.wallet.createUnsignedTransactionWithDefaultFee();

    for (let sendto of gameData.players) {
      tx.to.push(new saito.default.slip(sendto, 0.0));
    }

    tx.msg = {
      timestamp: timestamp,
      module: "Arcade",
      request: "challenge",
      game: gameData.game,
      options: gameData.options,
      players_needed: gameData.players.length,
      players: [this.publicKey],
      players_sigs: [accept_sig],
      originator: this.publicKey,
      invitees: gameData.players,
    };

    tx = this.app.wallet.signTransaction(tx);

    return tx;

  }

  receiveChallengeTransaction(tx) {
    if (!tx.transaction || !tx.signature || !tx.msg) {
      return;
    }

    if (!tx.isTo(this.publicKey)) {
      return;
    }

    this.addGame(tx, "open");

    let challenge = new ChallengeModal(app, this, tx);
    challenge.processChallenge(app, tx);

  }
  */

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
	addGame(tx, list = 'open') {
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

		//Update the game status (open/private/active/close/over)
		tx.msg.request = list;

		if (list !== 'over' && list !== 'close') {
			if (tx.msg?.options['open-table']) {
				list = 'open';
			}

			//
			// Sanity check the target list so my games are grouped together
			//
			if (this.isMyGame(tx)) {
				list = 'mine';
			}else if (tx.msg.players_needed <= tx.msg.players.length){
				list = 'active';
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
	// Test whether the game_tx (from this.games) is of a game with all the players,
	// includes me, and has saved a game module instantiation in my local storage
	//
	isAcceptedGame(game_id) {
		if (!game_id) {
			return false;
		}

		let game_tx = this.returnGame(game_id);

		if (!game_tx) {
			return false;
		}

		if (game_tx.msg.players_needed > game_tx.msg.players.length) {
			return false;
		}

		/*let is_my_game = false;

    for (let i = 0; i < game_tx.msg.players.length; i++) {
      if (game_tx.msg.players[i] == this.publicKey) {
        is_my_game = true;
      }
    }

    if (is_my_game) {
      for (let i = 0; i < this.app.options?.games?.length; i++) {
        if (this.app.options.games[i].id === game_tx.signature) {
          return true;
        }
      }
    }*/

		return true;
	}

	isAvailableGame(game_tx, additional_status = '') {
		if (game_tx.msg.request == 'open' || game_tx.msg.request == 'private') {
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
			if (!this.isAcceptedGame(invite.signature) && this.publicKey == invite.msg.originator) {
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
				//console.info("AFFIXING CALLBACKS TO: " + modname);
				return 1;
			}
		}
		return 0;
	}


	isSlug(slug){	
		if (slug == this.returnSlug() || slug == "game"){
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
				game_data = await arcade_self.findGame(game, id);
			}

			updatedSocial.url = reqBaseURL + encodeURI(arcade_self.returnSlug());
			res.setHeader('Content-type', 'text/html');
			res.charset = 'UTF-8';
			res.send(arcadeHome(app, arcade_self, app.build_number, updatedSocial, game_data));
			return;
		});


		expressapp.get('/game/:game', async function (req, res){
			let reqBaseURL = req.protocol + '://' + req.headers.host + '/';

			let game = req.params.game;

			let game_mod = arcade_self.app.modules.returnModuleBySlug(game);

			res.setHeader('Content-type', 'text/html');
			res.charset = 'UTF-8';

			if (game_mod){
				res.send(game_mod.returnHomePage(reqBaseURL));
			}else{
				res.send(arcadeHome(app, arcade_self, app.build_number, arcade_self.social, null));
			}

		});

		expressapp.use('/' + encodeURI(this.returnSlug()), express.static(webdir));
	}

	async findGame(game, short_id) {
		let sql = `SELECT * FROM games WHERE module = $module ORDER BY created_at DESC LIMIT 50`;
		let params = { $module: game };

		let sqlResults = await this.app.storage.queryDatabase(sql, params, 'arcade');

		for (let res of sqlResults) {
			if (this.app.crypto.hash(res.game_id).slice(-6) === short_id) {
				return res;
			}
		}
		return null;
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

		if (!players_needed) {
			console.error('ERROR 582342: Create Game Error');
			return;
		}

		if (
			options['game-wizard-players-select-max'] &&
			options['game-wizard-players-select-max'] < players_needed
		) {
			options['game-wizard-players-select'] = options['game-wizard-players-select-max'];
			options['game-wizard-players-select-max'] = players_needed;
			players_needed = options['game-wizard-players-select'];
		}

		let gamedata = {
			ts: new Date().getTime(),
			name: game,
			slug: game_mod.returnSlug(),
			options: options,
			players_needed: players_needed,
			invitation_type: gameType
		};

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

			let newtx = await this.createOpenTransaction(gamedata);

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
				if (
					this.app.browser.isMobileBrowser(navigator.userAgent) &&
					this.app.modules.returnActiveModule().returnName() == 'Red Square'
				) {
					salert('Game invite created. Redirecting to arcade...');
					setTimeout(function () {
						window.location.href = '/arcade';
					}, 2000);
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

		let game_msg = game_tx.returnMessage();

		let game_mod = this.app.modules.returnModule(game_msg.game);

		this.app.connection.emit('arcade-game-initialize-render-request', game_id);

		//We want to send a message to the players to add us to the game.accept list so they route their game moves to us as well
		game_msg.game_id = game_id;
		this.sendFollowTx(game_msg);

		if (!this.app.options.games) {
			this.app.options.games = [];
		}

		if (!game_mod.doesGameExistLocally(game_id)) {
			console.log('Initialize game');
			game_mod.initializeObserverMode(game_tx);
		} else {
			console.log('Game already exists');
			game_mod.loadGame(game_id);
			game_mod.game.player = 0;
		}

		await this.observerDownloadNextMoves(game_mod, () => {
			if (watch_live) {
				game_mod.game.live = watch_live;
				game_mod.saveGame(game_id);
			}

			this.app.connection.emit('arcade-game-ready-render-request', {
				id: game_id,
				name: game_msg.game,
				slug: game_mod.returnSlug()
			});
		});
	}

	async sendFollowTx(game) {
		let tx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();
		tx.msg = {
			module: game.game,
			game_id: game.game_id,
			request: 'follow game',
			my_key: this.publicKey
		};

		for (let p of game.players) {
			tx.addTo(p);
		}
		await tx.sign();

		//Only looking for this in handlePeerRequest, pure off-chain
		//this.app.network.propagateTransaction(tx);

		//
		// relay too
		//
		this.app.connection.emit('relay-send-message', {
			recipient: game.players,
			request: 'game relay update',
			data: tx.toJson()
		});
	}

	async observerDownloadNextMoves(game_mod, mycallback = null) {
		// purge old transactions
		for (let i = game_mod.game.future.length - 1; i >= 0; i--) {
			let queued_tx = new Transaction(undefined, JSON.parse(game_mod.game.future[i]));
			let queued_txmsg = queued_tx.returnMessage();

			if (
				queued_txmsg.step.game <= game_mod.game.step.game &&
				queued_txmsg.step.game <= game_mod.game.step.players[queued_tx.from[0].publicKey]
			) {
				console.log('Trimming future move to download new ones:', JSON.stringify(queued_txmsg));
				game_mod.game.future.splice(i, 1);
			}
		}

		console.log(`${game_mod.name}_${game_mod.game.id} from ${game_mod.game.originator}`);

		this.app.storage.loadTransactions(
			{ field1: game_mod.name + '_' + game_mod.game.id, limit: 100 },
			(txs) => {
				for (let tx of txs) {
					let game_move = tx.returnMessage();
					let loaded_step = game_move.step.game;

					if (
						loaded_step > game_mod.game.step.game ||
						loaded_step > game_mod.game.step.players[tx.from[0].publicKey]
					) {
						console.log('Add move: ' + JSON.stringify(game_move));
						game_mod.addFutureMove(tx); //This will save future moves (so saveGame below doesn't overwrite them)
					}
				}
				game_mod.saveGame(game_mod.game.id);

				if (mycallback) {
					mycallback(game_mod);
				}
			}
		);
	}
}

module.exports = Arcade;
