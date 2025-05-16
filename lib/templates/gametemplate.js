const Transaction = require('../../lib/saito/transaction').default;
const SaitoHeader = require('../../lib/saito/ui/saito-header/saito-header');

/*********************************************************************************
 GAME MODULE v.

 This is a general parent class for modules that wish to implement Game logic. It
 introduces underlying methods for creating games via email invitations, and sending
 and receiving game messages over the Saito network. The module also includes random
 number routines for dice and deck management. Thanks for the Web3 Foundation for its
 support developing code that allows games to interact with cryptocurrency tokens and
 Polkadot parachains.

 This module attempts to use peer-to-peer connections with fellow gamers where
 possible in order to avoid the delays associated with on-chain transactions. All
 games should be able to fallback to using on-chain communications however. Peer-
 to-peer connections will only be used if both players have a proxymod connection
 established.

 Developers please note that every interaction with a random dice and or processing
 of the deck requires an exchange between machines, so games that do not have more
 than one random dice roll per move and/or do not require constant dealing of cards
 from a deck are easier to implement on a blockchain than those which require
 multiple random moves per turn.

 HOW IT WORKS

 We recommend new developers check out the WORDBLOCKS game for a quick introduction
 to how to build complex games atop the Saito Game Engine. Essentially, games require
 developers to manage a "stack" of instructions which are removed one-by-one from
 the main stack, updating the state of all players in the process.

 MINOR DEBUGGING NOTE

 core functionality from being re-run -- i.e. DECKBACKUP running twice on rebroadcast
 or reload, clearing the old deck twice. What this means is that if the msg.extra
 data fields are used to communicate, they should not be expected to persist AFTER
 core functionality is called like DEAL or SHUFFLE. etc. An example of this is in the
 Twilight Struggle headline code.

 **********************************************************************************/
let ModTemplate = require('./modtemplate');

//
// CORE Game Engine file are broken across several
// classes to compartmentalize related functionality
// these are all dynamically included in the main
// game-template.
//
const GameAcknowledge = require('./gametemplate-src/gametemplate-acknowledge');
const GameAnimation = require('./gametemplate-src/gametemplate-animation');
const GameArcade = require('./gametemplate-src/gametemplate-arcade');
const GameCards = require('./gametemplate-src/gametemplate-cards');
const GameMoves = require('./gametemplate-src/gametemplate-moves');
const GamePlayers = require('./gametemplate-src/gametemplate-players');
const GameQueue = require('./gametemplate-src/gametemplate-queue');
const GameGame = require('./gametemplate-src/gametemplate-game');
const GameUI = require('./gametemplate-src/gametemplate-ui');
const GameWeb3 = require('./gametemplate-src/gametemplate-web3');

const HomePage = require('./gametemplate-src/index');

let saito = require('./../saito/saito');

const GameLog = require('./../saito/ui/game-log/game-log');
const GameHud = require('./../saito/ui/game-hud/game-hud');
const GameMenu = require('./../saito/ui/game-menu/game-menu');
const GameClock = require('./../saito/ui/game-clock/game-clock');
const SaitoOverlay = require('./../saito/ui/saito-overlay/saito-overlay');
const GameCardbox = require('./../saito/ui/game-cardbox/game-cardbox');
const GamePlayerbox = require('./../saito/ui/game-playerbox/game-playerbox');
const GameCardfan = require('./../saito/ui/game-cardfan/game-cardfan');
const GameBoardSizer = require('./../saito/ui/game-board-sizer/game-board-sizer');
const GameHexGrid = require('./../saito/ui/game-hexgrid/game-hexgrid');
const GameAcknowledgeOverlay = require('./../saito/ui/game-acknowledge-overlay/game-acknowledge-overlay');
const GameObserverControls = require('./../saito/ui/game-observer/game-observer');
const GameHelp = require('./../saito/ui/game-help/game-help');
const GameScoreboard = require('./../saito/ui/game-scoreboard/game-scoreboard');
const GameHammerMobile = require('./../saito/ui/game-hammer-mobile/game-hammer-mobile');
const GameRaceTrack = require('./../saito/ui/game-racetrack/game-racetrack');

const JSON = require('json-bigint');

class GameTemplate extends ModTemplate {
	constructor(app) {
		super(app);

		this.name = 'Game';
		this.game_length = 30; //Estimated number of minutes to complete a game
		this.game = {};
		this.moves = [];
		this.description = 'Peer to peer gaming on the blockchain';
		this.endmoves = [];
		this.commands = [];
		this.game_state_pre_move = '';

		this.social = {
			creator: 'Saito Team',
			twitter: '@SaitoOfficial',
			title: this.returnName(),
			url: 'https://saito.io/arcade/',
			description: this.description,
			image: 'https://saito.tech/wp-content/uploads/2023/11/arcade-300x300.png'
		};

		this.recordOptions = {
			container: 'body',
			callbackAfterRecord: null,
			active: true
		};

		this.acknowledge_text = 'acknowledge'; // text shown in ACKNOWLEDGE

		// card height-width-ratio
		this.card_height_ratio = 1.53;
		//size of the board in pixels
		this.boardWidth = 500; //Should be overwritten by the (board game's) full size pixel width
		this.boardRatio = 1;

		this.grace_window = 4;
		this.decimal_precision = 8; /* used to round off strings representing crypto/token fractions */

		//
		// optional interface -- shouldn't really have these defaults
		//
		this.useHUD = 0;
		this.useCardbox = 0;
		this.useClock = 0;

		this.lock_interface = 0;
		this.lock_interface_step = '';
		this.lock_interface_tx = '';

		//
		// async deals weaken security conditions, but eliminate the need for all players to be online
		// simultaneously in order to shuffle and deal cards from the deck. instead, they shuffle the
		// deck and draw cards. this exposes information about player hands, but speeds up play of games
		// like wordblocks, etc. where security requirements can be optionally reduced
		//
		this.async_dealing = 0;

		this.crypto_msg = 'winner takes all';
		this.winnable = 1; // if it is possible to win this game
		this.loseable = 1; // if it is possible to lose this game
		this.cooperative = 0; // if this is a cooperative game

		this.request_no_interrupts = true;

		this.confirm_moves = 0;
		this.confirm_this_move = 0;

		this.animationSpeed = 1500;
		/*
		 * Our self defined animations add a marker (their div id) whenever they start and remove it when they finish
		 * so we can know if animations are actively moving around the screen through animation_queue
		 * Meanwhile, we may want to set up a series of animations with slight pauses between each one kicks off, so animationSequence
		 * holds structure object data with the animation function and its parameters. The method runAnimationQueue will execute each animation in turn
		 */
		this.animation_queue = [];
		this.animationSequence = [];

		//
		// game interface variables
		//
		this.interface = 0; // 0 = no hud
		// 1 = graphics hud
		// 2 = text hud

		this.relay_moves_offchain_if_possible = 1;
		this.initialize_game_offchain_if_possible = 1;

		this.next_move_onchain_only = 0;

		this.hud = new GameHud(app, this);
		this.clock = new GameClock(app, this);
		this.log = new GameLog(app, this);
		this.cardfan = new GameCardfan(app, this);
		this.playerbox = new GamePlayerbox(app, this);
		this.cardbox = new GameCardbox(app, this);
		this.menu = new GameMenu(app, this);
		this.hammer = new GameHammerMobile(app, this);
		this.sizer = new GameBoardSizer(app, this); //yes constructor
		this.scoreboard = new GameScoreboard(app, this);
		this.hexgrid = new GameHexGrid(app, this);
		this.overlay = new SaitoOverlay(app, this, false);
		this.acknowledge_overlay = new GameAcknowledgeOverlay(app, this);
		this.observerControls = new GameObserverControls(app, this);
		this.racetrack = new GameRaceTrack(app, this);
		this.game_help = new GameHelp(app, this);

		this.scripts = [];
		this.styles = ['/saito/lib/jsonTree/jsonTree.css'];

		this.game_move_notification = null;

		this.clock_timers = {}; //Interval reference updating countdown clock
		this.menus = [];
		this.minPlayers = 2;
		this.maxPlayers = 2;
		this.lang = 'en';
		this.log_length = 150;

		this.card_back = 'red_back.png';

		this.publisher_message = '';
		this.pending = [];

		this.archive_connected = false;
		this.archive_exhausted = 0;

		//
		// used to generate provably-fair dice rolls
		//
		this.secureroll_rnums = [];
		this.secureroll_hash = '';

		//
		// used in reshuffling
		//
		this.old_discards = {};
		this.old_removed = {};
		this.old_cards = {};
		this.old_crypt = [];
		this.old_keys = [];
		this.old_hand = [];

		this.halted = 0;
		this.gaming_active = 1; //
		// this works like halted, except at the level of
		// the game engine. when a move arrives it flips to 1
		// and when a move (rnQueue) has finished executing it
		// goes back to 0. The purpose is to prevent a second
		// move from arriving and executing while the previous
		// one is still executing.
		//
		// the difference between halted and gaming_active
		// for design purposes is that halted should be
		// used when the interface stops the game (i.e. user
		// acknowledgement is required for the game to progress
		// while gaming_active happens behind the scenes.
		//

		//
		// have we tried running our existing queue?
		//
		this.initialize_game_run = 0;

		//
		// this is distinct from this.game.initialize_game_run
		// the reason is that BOTH are set to 1 when the game
		// is initialized. But we only nope out on initializing
		// the game if BOTH are 1. This allows us to swap in and
		// out saved games, but still init the game on reload if
		// this.game.initialize_game_run is set to 1 but it is
		// a freshly loaded browser.
		//
		//
		// instead of associating a different function with each card css we are
		// associating a single one, and changing the reference function inside
		// to get different actions executed on click. Basically we swap out the
		// changeable function before attachingCardEvents and everything just works
		//
		let temp_self = this;
		this.changeable_callback = function (card) {};
		this.cardbox_callback = async function (card) {
			if (temp_self.changeable_callback !== null) {
				await temp_self.changeable_callback(card);
			}
		};
		this.menu_backup_callback = null;
		this.back_button_html = `<i class="fa fa-arrow-left" aria-hidden="true"></i>`;

		this.statistical_unit = 'game';

		this.enable_observer = true;

		app.connection.on('update-username-in-game', () => {
			if (this.gameBrowserActive()) {
				this.game.playerNames = [];
				this.game.players.forEach((playerKey, i) => {
					let name = this.app.keychain.returnUsername(playerKey);
					if (name.includes('...')) {
						name = `Player ${i + 1}`;
					}
					if (name.includes('@')) {
						name = name.substring(0, name.indexOf('@'));
					}
					console.log(playerKey, i, name);
					this.game.playerNames.push(name);
				});
				for (let i = 0; i < this.game.players.length; i++) {
					try {
						Array.from(
							document.querySelectorAll(`.saito-playername[data-id='${this.game.players[i]}']`)
						).forEach((add) => (add.innerHTML = this.game.playerNames[i]));
					} catch (err) {
						console.error(err);
					}
				}
			}
		});

		app.connection.on('league-leaderboard-loaded', (game, leaderboard) => {
			if (this.gameBrowserActive() && this.name == game) {
				let default_league_data = this.respondTo('default-league');
				this.playerRanks = [];
				this.game.players.forEach((playerKey, i) => {
					let player = { rank: 0, score: default_league_data?.default_score };
					for (let j = 0; j < leaderboard.length; j++) {
						if (leaderboard[j].publicKey == playerKey) {
							player.rank = j + 1;
							player.score = leaderboard[j].score;
							break;
						}
					}
					this.playerRanks.push(player);
				});
				this.insertLeagueRankings();
			}
		});

		app.connection.on('stop-game', async (game, id, reason) => {
			if (this.name === game) {
				if (!this.gameBrowserActive()) {
					let current_game_id = this.game.id;
					this.loadGame(id);
					await this.sendStopGameTransaction(reason);
					this.loadGame(current_game_id);
				} else {
					// we have received stop-game that should not be triggered if we are IN the game... this means
					// something is sending an event that is forcing game-over...
					alert(
						'we are bug-hunting a game-ending bug -- please report this bug to developers - 582434'
					);
				}
			}
		});

		app.connection.on('relay-notification', (data) => {
			let { mod, game_id, notification } = data;
			if (mod == this.name) {
				if (this.gameBrowserActive(game_id)) {
					siteMessage(notification, 2500);

					//
					// Opponent sent me notice that they entered, be kind and respond
					//
					if (data?.code == 'enter') {
						let data = {
							mod: this.name,
							game_id: this.game?.id,
							notification: `${this.app.keychain.returnUsername(
								this.publicKey
							)} is already in the game`,
							code: 'respond'
						};

						if (this.useClock && this.game.target == this.game.player) {
							data.ts = this.game.time.last_received;
						}

						if (this.game.player) {
							this.app.connection.emit('relay-notify-peer', this.game.opponents, data);
						}
					}

					if (this.useClock && data?.ts) {
						if (this.game.target !== this.game.player) {
							this.game.time.last_received = data.ts;
						}
					}
				}
			}
		});

		return this;
	}

	async render(app) {
		await super.render(app);
		app.connection.emit('set-relay-status-to-busy', {});

		await this.header.render();
		this.initializeHTML(app);
		this.game_move_notification = new Audio('/saito/sound/Belligerent.mp3');

		if (this.game.crypto) {
			this.insertCryptoLogo(this.game.crypto);
		}

		//
		// try to fetch games moves if we have finished init
		//
		if (this.game.step.game > 2) {
			this.fetchRecentMoves();
		}
	}

	returnImage() {
		return `/${this.returnSlug()}/img/arcade/arcade.jpg`;
	}

	returnBanner() {
		return `/${this.returnSlug()}/img/arcade/arcade-banner-background.png`;
	}

	initializeHTML(app) {
		//
		// if we are trying to load a game, check
		//
		try {
			let load_id = app.browser.returnURLParameter('load');
			if (load_id) {
				for (let z = 0; z < this.app.options.games.length; z++) {
					if (this.app.options.games[z].id == load_id) {
						if (this.app.options.saves[load_id]) {
							this.app.options.games[z] = this.app.options.saves[load_id];
							this.app.options.games[z].timestamp = new Date().getTime();
							this.loadGame(load_id);
							let newUrl =
								this.app.browser.protocol + '://' + this.app.browser.host + '/' + this.returnSlug();
							try {
								window.history.pushState({}, '', newUrl);
							} catch (err) {}
						}
					}
				}
			} else {
				if (this.app.options.saves) {
					for (let key in this.app.options.saves) {
						let x = new Date().getTime() - this.app.options.saves[key].timestamp;
						if (x > 50000000) {
							delete this.app.options.saves[key];
						}
					}
				}
			}
		} catch (err) {
			console.log('ERROR WITH LOAD:' + JSON.stringify(err));
		}

		//
		// initialize game feeder tries to do this
		//
		// it needs to as the QUEUE which starts
		// executing may updateStatus and affect
		// the interface. So this is a sanity check
		//
		// These two tests should be copied to the top of any module that extends gameTemplate
		//
		if (this.browser_active == 0) {
			return;
		}
		if (this.initialize_game_run == 1) {
			return 0;
		}

		//
		// Query server to make sure you know and remember your new friends names
		this.app.connection.emit('registry-fetch-identifiers-and-update-dom', this.game.players);

		//
		// hash reflects game id and position
		//

		try {
			let oldHash = window.location.hash;
			window.location.hash = `#`;

			let short_game_id = this.app.crypto.hash(this.game.id).slice(-6);

			//This function is stupid and confusing
			window.location.hash = app.browser.initializeHash(
				`#gid=${short_game_id}&step=${this.game.step.game}`,
				oldHash,
				{}
			);
		} catch (err) {
			console.error(err);
		}

		//
		// check options for clock
		//

		if (this.game?.options?.clock) {
			if (parseFloat(this.game.options.clock) == 0) {
				this.useClock = 0;
			} else {
				let limit = parseFloat(this.game.options.clock) * 60 * 1000;
				this.clock.clock_limit = limit;
				if (!this.game.clock.length) {
					for (let i = 0; i < this.game.players.length; i++) {
						this.game.clock.push({ limit, spent: 0 });
					}
					this.saveGame(this.game.id);
				}
				this.useClock = 1;
			}
		}

		if (this.game.player == 0) {
			this.observerControls.render();
			document.body.classList.add('observer-mode');
			if (this.game.live) {
				this.observerControls.step_speed = 3;
				//this.observerControls.play(); //Just update the controls so they match our altered state
			}
		}

		//
		// load initial display preferences
		//
		if (this.app.options != undefined) {
			if (this.app.options.gameprefs != undefined) {
				if (this.app.options.gameprefs.lang != undefined) {
					this.lang = this.app.options.gameprefs.lang;
				}
				if (this.app.options.gameprefs.interface != undefined) {
					this.interface = this.app.options.gameprefs.interface;
				}
			}
		}

		this.attachStyleSheets();
	}

	gameBrowserActive(game_id = null) {
		if (this.browser_active) {
			if (!game_id) {
				game_id = this.game.id;
			}
			// For debugging
			try {
				let short_game_id = this.app.crypto.hash(game_id).slice(-6);
				let gid = window.location.hash.split('&')[0].substring(5);
				if (gid === short_game_id) {
					return true;
				}
			} catch (err) {
				return false;
			}
		}

		return false;
	}

	async attachEvents(app) {
		if (this?.game?.id) {
			await this.initializeGameQueue(this.game.id);
		} else {
			document.documentElement.setAttribute('data-theme', 'arcade');

			let header = new SaitoHeader(this.app, this);
			await header.initialize(this.app);
			header.header_location = '/';

			//document.querySelector("body").classList.add("scrollable-page");

			if (document.getElementById('game-loader-screen')) {
				await header.render();
				setTimeout(() => {
					document.getElementById('game-loader-screen').remove();
				}, 1500);
				this.browser_active = false;
			}

			this.app.connection.on('league-data-loaded', () => {
				//What would be my league id...
				let potential_league = this.app.crypto.hash(this.returnName());

				// Use League Description
				let updated_description = false;
				let league_mod = this.app.modules.returnFirstRespondTo('leagues-for-arcade');
				if (league_mod) {
					let league = league_mod.returnLeague(potential_league);

					if (league?.description && league.description !== this.description) {
						if (document.querySelector('.splash-page-game-description')) {
							document.querySelector('.splash-page-game-description').innerHTML =
								league.description;
						}
						updated_description = true;
						if (document.querySelector('.saito-splash-optional')) {
							document.querySelector('.saito-splash-optional').classList.remove('hidden');
						}
					}
				}
				if (!updated_description) {
					if (document.querySelector('.saito-splash-image.full')) {
						document.querySelector('.saito-splash-image.full').setAttribute('id', 'nav_about');
					}
				}

				// Insert Leaderboard
				if (document.querySelector('.splash-page-leaderboard')) {
					document.querySelector('.splash-page-leaderboard').innerHTML = '';
					this.app.connection.emit(
						'league-render-into',
						potential_league,
						'.splash-page-leaderboard'
					);
				}
			});

			this.app.modules.respondTo('game-manager', { container: '.league-overlay-games-list' });

			// Add Recent Game Activity
			this.app.connection.on('arcade-data-loaded', () => {
				if (document.querySelector('.game-activity')) {
					document.querySelector(
						'.game-activity'
					).innerHTML = `<div class="game-page-invites"></div><div class="league-overlay-games-list"></div>`;
				}
				this.app.modules.respondTo('invite-manager', { filter: this.name });
				this.app.connection.emit('league-overlay-games-list', { game: this.name });
			});

			//Launch league overlay by default... ?
			// 1) the css is a bit trick to port in
			// 2) we need a way to initialize the game when browser_active
			//this.app.connection.emit('league-overlay-render-request',	this.app.crypto.hash(this.returnName()));
			if (document.getElementById('return-to-arcade')) {
				document.getElementById('return-to-arcade').onclick = (e) => {
					navigateWindow('/arcade');
				};
			}

			let clicked = false;
			let clickMe = () => {
				if (!clicked) {
					clicked = true;
					return;
				}

				this.app.connection.emit('arcade-launch-game-wizard', {
					game: this.name,
					skip: 1
				});
			};

			if (document.getElementById('create-game-button')) {
				document.getElementById('create-game-button').onclick = clickMe;
			}

			if (document.getElementById('create-game-button-mobile')) {
				document.getElementById('create-game-button-mobile').onclick = clickMe;
			}
		} // end of splash page
	}

	//
	// ARCADE SUPPORT
	//
	respondTo(type) {
		/*
    This is primarily used as a flag to say "Yes I am a game", but some arcade functions want to
    access the game properties to render properly
    */
		if (type == 'arcade-games') {
			if (this.sort_priority == undefined) {
				this.sort_priority = this?.status ? -1 : 0;
			}

			let obj = {};
			obj.image = this.returnImage();
			obj.banner = this.returnBanner();
			return obj;
		}

		if (type == 'default-league') {
			let obj = {};
			obj.name = this.gamename || this.name;
			obj.game = this.name;
			obj.description = this.description;
			obj.ranking_algorithm = 'ELO';
			obj.default_score = 1500;
			return obj;
		}

		return null;
	}

	async onPeerServiceUp(app, peer, service = {}) {
		if (!app.BROWSER) {
			return;
		}

		if (service.service == 'archive') {
			console.log('Archive available!!');
			this.archive_connected = true;
		}

		if (!this.gameBrowserActive()) {
			return;
		}

		if (service.service === 'relay') {
			let data = {
				mod: this.name,
				game_id: this.game?.id,
				notification: `${this.app.keychain.returnUsername(this.publicKey)} has entered the game`,
				code: 'enter'
			};

			if (this.useClock && this.game.target == this.game.player) {
				data.ts = this.game.time.last_received;
			}

			if (this.game.player) {
				this.app.connection.emit('relay-notify-peer', this.game.opponents, data);
			}

			if (this.game && !this.game?.initializing) {
				await this.getPendingGameMoves();
			}

			if (this.pending.length > 0) {
				console.log('**** REBROADCASTING GAME MOVES ***');
				this.gaming_active = 0;
				while (this.pending.length > 0) {
					let tx = this.pending.shift();
					this.app.network.propagateTransaction(tx);
					this.app.connection.emit('relay-send-message', {
						recipient: this.game.accepted,
						request: 'game relay gamemove',
						data: tx.toJson()
					});
				}
			}
		}
	}

	async initializeObserverMode(tx, use_state = false) {
		let game_id = tx.signature;
		let txmsg = tx.returnMessage();

		console.log('!!!!!OBSERVER MODE!!!!!');
		console.log(game_id, JSON.parse(JSON.stringify(txmsg)));

		this.loadGame(game_id);

		//
		// otherwise setup the game
		//
		this.game.options = txmsg.options;
		this.game.module = txmsg.game;
		this.game.originator = txmsg.originator; //Keep track of who initiated the game
		this.game.players_needed = txmsg.players.length; //So arcade renders correctly

		for (let i = 0; i < txmsg.players.length; i++) {
			this.addPlayer(txmsg.players[i]);
		}

		this.saveGame(game_id);
		if (this.game.players_set == 0) {
			this.gaming_active = 1; //Prevent any moves processing while sorting players

			let players = [];
			for (let z = 0; z < this.game.players.length; z++) {
				players.push(this.app.crypto.hash(this.game.players[z] + this.game.id));
			}

			players.sort();

			let players_reconstructed = [];
			for (let z = 0; z < players.length; z++) {
				for (let zz = 0; zz < this.game.players.length; zz++) {
					if (players[z] === this.app.crypto.hash(this.game.players[zz] + this.game.id)) {
						players_reconstructed.push(this.game.players[zz]);
					}
				}
			}
			this.game.players = players_reconstructed;

			for (let i = 0; i < this.game.players.length; i++) {
				// defaults to SAITO keys
				// I guess this is useful for something...
				this.game.keys.push(this.game.players[i]);
			}

			//
			// game step
			//
			for (let i = 0; i < this.game.players.length; i++) {
				this.game.step.players[this.game.players[i]] = 0;
			}

			this.game.players_set = 1;
		}

		this.saveGame(game_id);

		if (use_state) {
			this.game.live = true;
			this.saveGame(game_id);
		} else {
			await this.initializeGameQueue(game_id);
		}
	}

	/*
  Called by Saito on browser load for all modules
  */
	async initialize(app) {
		//We don't inherit (run super.initialize) from modTemplate so need to do this!
		this.publicKey = await this.app.wallet.getPublicKey();

		//Update social graph properties for the specific game....
		this.social.title = this.returnName();
		this.social.description = this.description;

		if (this.app.options.games == undefined) {
			this.app.options.games = [];
		}

		if (this.app.options.gameprefs == undefined) {
			this.app.options.gameprefs = {};
			this.app.options.gameprefs.random = this.app.crypto.generateKeys();
		}

		//
		// 20 second loop to rebroadcast pending txs, in case network goes down but
		// comes back up. just a safety issue.
		//
		// Todo: delete this / overkill because we already listen for network reconnect in onPeerServiceUp
		//
		/*	        if (this.browser_active && this.app.BROWSER) {
			setInterval( async () => {
	                	let pending = await this.app.wallet.getPendingTransactions();
        	        	for (let i = 0; i < pending.length; i++) {
                		        let tx = pending[i];
                        		let txmsg = tx.returnMessage();
                        		if (txmsg && txmsg.module == this.name) {
						this.app.network.propagateTransaction(tx);
                        		}
                		}
			}, 20000);
		}
*/

		this.initializeQueueCommands(); // Define standard queue commands

		if (!this.browser_active) {
			//
			// We need the queuecommands defined so that game invites
			// can be initialized from outside the game
			//
			this.gaming_active = 0;
			return;
		}

		this.calculateBoardRatio();

		//
		// we grab the game with the most current timestamp (ts)
		// since no ID is provided
		if (!this.loadGame()) {
			console.log('No valid game.... stop!!!!!');
			this.initialize_game_run = 1; //Will prevent rendering of game assets
			return;
		}

		//
		// This function searches the wallet for txs that were sent but never received
		// We will stash them in this.pending and broadcast them as soon as we are connected to relay
		// meanwhile we won't start the game queue as normally until those bounce back to us and we process them
		//
		if (!this.game?.initializing) {
			await this.getPendingGameMoves();
		}

		//Just make sure I am in the accepted, so if I send a message, I also receive it
		//edge case with table games/observer
		this.addFollower(this.publicKey);

		//Set navigation protection
		this.app.browser.lockNavigation(this.visibilityChange.bind(this));
	}

	/*
          Minimum default, should be overwritten by every game module
        */
	async initializeGame() {
		if (this.game.dice == '') {
			this.initializeDice();
			this.queue.push('READY');
			this.saveGame(this.game.id);
		}
	}

	async onConfirmation(blk, tx, conf) {
		let txmsg = tx.returnMessage();

		let game_halted = null;
		let game_gaming_active = null;
		let game_initialize_game_run = null;

		if (conf == 0) {
			let game_id = txmsg.game_id;

			if (!tx.isTo(this.publicKey)) {
				return;
			}

			if (!this.app.BROWSER) {
				return;
			}

			if (!this.doesGameExistLocally(game_id)) {
				return;
			}

			if (this.hasSeenTransaction(tx)) return;

			let current_game_id = null || this?.game?.id;

			if (current_game_id) {
				//
				// If move is for a different game, we need to save the state first
				// and restore afterwards
				//
				if (game_id !== current_game_id) {
					//
					// sanity-check before we load, we check to see if this transaction
					// is likely to be an unprocessed move...
					//
					let player_publickey = tx.from[0].publicKey;
					let player_step = 0;
					if (txmsg.step?.game) {
						player_step = txmsg.step.game;
					}

					if (this.isUnprocessedMoveQuickCheck(player_publickey, player_step, game_id) == -1) {
						return;
					}

					console.info('Game engine received move for other game. Safety catch, loading game...');

					//
					// track execution state of game we shift away from...
					//
					console.log(
						"Cache the game's state: ",
						this.halted,
						this.gaming_active,
						this.initialize_game_run
					);
					game_halted = this.halted;
					game_gaming_active = this.gaming_active;
					game_initialize_game_run = this.initialize_game_run;

					this.saveGame(current_game_id);
					this.loadGame(game_id);
				}
			} else {
				//
				// No current game, just load the one to process the move
				//
				this.loadGame(game_id);
			}

			//
			// gameover requests
			//
			if (txmsg.request === 'gameover') {
				await this.receiveGameoverTransaction(blk, tx, conf, this.app);
			} else if (txmsg.request === 'stopgame') {
				// stopgame requests
				await this.receiveStopGameTransaction(tx.from[0].publicKey, txmsg);
			} else if (txmsg.request === 'game') {
				//
				// TODO - poker init fails if this is commented out
				//
				// do we have a failure here if relay not running / fails?
				//
				//
				// this could be a game init
				//
				if (!txmsg?.step?.game) {
					//Not a game move
					console.info(`${this.name} skipping ${JSON.stringify(txmsg)}`);
				} else if (!this.game.over) {
					//
					// process game move
					//
					if (this?.treat_all_moves_as_future || this.isFutureMove(tx.from[0].publicKey, txmsg)) {
						await this.addFutureMove(tx);

						//Safety check in case observer missed a move
						//If we have multiple moves in the future queue and are receiving moves on chain,
						//then something has probably gone wrong
						if (this.game.player === 0 && this.game.future.length > 3) {
							console.log(
								'Receive future move onConfirmation as Observer',
								this.gaming_active,
								this.halted
							);
							if (!this.gaming_active && !this.halted) {
								console.log('Trigger observer from onConfirmation');
								await this.observerControls.next();
							}
						}
					} else if (this.isUnprocessedMove(tx.from[0].publicKey, txmsg)) {
						await this.addNextMove(tx);
						this.notifyMove();
					} else {
					}
				}
			} else {
				this.receiveMetaMessage(tx);
			}

			//
			// Restore game state after processing onchain transactions
			//
			if (current_game_id && current_game_id !== game_id) {
				this.loadGame(current_game_id);

				//
				// track execution state of game we shift away from...
				//
				if (game_halted != null) {
					console.log(
						"Did we change the game's state? ",
						this.halted,
						this.gaming_active,
						this.initialize_game_run
					);
					this.halted = game_halted;
					this.gaming_active = game_gaming_active;
					this.initialize_game_run = game_initialize_game_run;
				}

				if (this.gameBrowserActive()) {
					// We need to do something to restore the status that aren't saved in the wallet
					// like the chess engine or worblocks dictionary
					this.initializeGame();
				}
			}
		}
	}

	async handlePeerTransaction(app, tx = null, peer, mycallback = null) {
		let message;
		if (tx == null) {
			return 0;
		}
		try {
			message = tx.returnMessage();
		} catch (err) {
			console.log('@#421341234 error');
			console.log(JSON.stringify(tx));
			return 0;
		}

		if (app.BROWSER == 0) {
			return 0;
		}

		if (message?.request?.includes('game relay')) {
			if (message?.data != undefined) {
				let gametx = new Transaction(undefined, message.data);
				let gametxmsg = gametx.returnMessage();

				//
				// Unlike onConfirmation, it seems every module runs handlePeerTransaction
				//
				if (this.name === gametxmsg.module) {
					//
					// Legacy safety catch in case somewhere doesn't use game_id as the standard in the message
					//
					if (gametxmsg.id) {
						gametxmsg.game_id = gametxmsg.id;
					}

					if (!this.doesGameExistLocally(gametxmsg.game_id)) {
						console.info(
							`Game does not exist locally. Not processing HPR message (${message.request}): waiting for on-chain`
						);
						return;
					}

					//
					// if we are undefined here, we are not a module
					// that should be thinking about doing anything in
					// response to this game message.
					// -- or loading the game id came up with a different game module
					//
					if (!this.game?.id || gametxmsg.game_id != this.game.id) {
						console.warn('ERROR SKIPPING HPT IN GAME: ' + gametxmsg.game_id);
						return;
					}

					if (message.request.includes('game relay')) {
						if (this.hasSeenTransaction(gametx)) return;
					}

					if (message.request === 'game relay gamemove') {
						if (this.game.over) {
							return 0;
						}

						if (
							this?.treat_all_moves_as_future ||
							this.isFutureMove(gametx.from[0].publicKey, gametxmsg)
						) {
							await this.addFutureMove(gametx);
						} else if (this.isUnprocessedMove(gametx.from[0].publicKey, gametxmsg)) {
							await this.addNextMove(gametx);
							this.notifyMove();
						} else {
							console.warn('HPT: is old move ' + gametxmsg.step.game);
						}
					} else if (message.request == 'game relay update') {
						if (gametxmsg.request == 'gameover') {
							await this.receiveGameoverTransaction(null, gametx, 0, app);
						} else if (gametxmsg.request == 'stopgame') {
							await this.receiveStopGameTransaction(gametx.from[0].publicKey, gametxmsg);
						} else {
							this.receiveMetaMessage(gametx);
						}
					} else {
						console.log('Unknown request', message.request);
					}

					return 1;
				}
			}
		}

		return super.handlePeerTransaction(app, tx, peer, mycallback);
	}

	insertLeagueRankings() {
		if (this?.insert_rankings && this.playerRanks) {
			for (let i = 0; i < this.playerRanks.length; i++) {
				let np = this.playerRanks[i].rank
					? `#${this.playerRanks[i].rank} / ${this.playerRanks[i].score}`
					: `Unranked / ${this.playerRanks[i].score}`;

				let line = `<span>${np}</span>`;

				if (this.game.crypto && this.game.crypto !== 'CHIPS' && this.game.stake) {
					if (typeof this.game.stake === 'object') {
						line += `<span class="player-stake">${this.game.stake[this.game.players[i]]} ${
							this.game.crypto
						}</span>`;
					} else {
						line += `<span class="player-stake">${this.game.stake} ${this.game.crypto}</span>`;
					}
				}

				this.playerbox.updateUserline(line, i + 1);
			}
		}
	}

	async preloadImages() {
		// Dummy function that games can implement if they have a lot of
		// image assets to load
		// TODO: add to render function by default and improve the games that use it
	}

	//
	// Games should have a function to turn off all game-specific dom events
	//
	removeEvents() {}

	//
	// Fisher–Yates shuffle algorithm:
	//
	shuffleArray(a) {
		let j, x, i;
		for (i = a.length - 1; i > 0; i--) {
			j = Math.floor(Math.random() * (i + 1));
			x = a[i];
			a[i] = a[j];
			a[j] = x;
		}
		return a;
	}

	//
	// OBSERVER MODE - return keystate prior to move (hand, etc.)
	//
	// JSON.parse(JSON.stringify(this.game));
	// JSON.parse(JSON.stringify(this.game_state_pre_move));
	returnGameState(game_clone) {
		let sharekey = this.loadGamePreference(this.game.id + '_sharekey');
		for (let i = 0; i < game_clone.deck.length; i++) {
			if (sharekey) {
				game_clone.deck[i].hand = this.app.crypto.encodeXOR(
					this.app.crypto.stringToHex(JSON.stringify(game_clone.deck[i].hand)),
					sharekey
				);
				game_clone.deck[i].keys = this.app.crypto.encodeXOR(
					this.app.crypto.stringToHex(JSON.stringify(game_clone.deck[i].keys)),
					sharekey
				);
			} else {
				game_clone.deck[i].keys = [];
				game_clone.deck[i].hand = [];
			}
		}
		return game_clone;
	}

	startClock(player = this.game.target) {
		if (!this.useClock) {
			return;
		}

		if (this.clock_timers[player]) {
			clearInterval(this.clock_timers[player]); //Just in case
		}

		console.log('Start CLOCK: ', player, JSON.stringify(this.game.clock));

		if (!player) {
			return;
		}

		if (!this.game.time.last_received) {
			this.game.time.last_received = new Date().getTime();
		}

		//Refresh the clock every second
		this.clock_timers[player] = setInterval(() => {
			let t = new Date().getTime();
			let time_on_clock =
				this.game.clock[player - 1].limit -
				(t - this.game.time.last_received) -
				this.game.clock[player - 1].spent;
			if (time_on_clock <= 0) {
				clearInterval(this.clock_timers[player]);
				delete this.clock_timers[player];
				this.clock.displayTime(0, player);
				if (this.game.player == player) {
					this.game.clock[player - 1].spent = this.game.clock[player - 1].limit;
					this.onTimeOver();
					salert('Time Over!');
					return;
				}
			}
			this.clock.displayTime(time_on_clock, player);
		}, 1000);
	}

	stopClock(player = this.game.target) {
		if (!this.useClock) {
			return;
		}

		if (!player) {
			return;
		}

		if (!this.clock_timers[player]) {
			return;
		}

		//
		// Only process if the clock is running (avoid double taps for when we send a move and receive it back on chain)
		//
		console.log('Stop CLOCK: ', player, JSON.stringify(this.game.clock));

		clearInterval(this.clock_timers[player]);
		delete this.clock_timers[player];

		//
		// game timer !!!!!!!!!!!!
		//
		this.game.time.last_sent = new Date().getTime();

		if (this.game.time.last_sent > this.game.time.last_received + 1000) {
			this.game.clock[player - 1].spent += this.game.time.last_sent - this.game.time.last_received;

			if (this.game.options?.lightning) {
				console.log('Lightning Mode!!!');
				let value = parseInt(this.game.options.lightning);
				this.game.clock[player - 1].limit += value * 1000;
			}

			let time_left = this.game.clock[player - 1].limit - this.game.clock[player - 1].spent;
			console.log('TIME LEFT: ', player, time_left);
			this.clock.displayTime(time_left, player);
		}

		this.game.time.last_received = this.game.time.last_sent;
	}

	// Default is to send a game over transaction, but games
	// can override to do other things...
	onTimeOver() {
		this.sendStopGameTransaction('time out').then(() => {});
	}

	/**
	 * The Game Menu calls exitGame, which allows us to be a little smarter about
	 * redirecting the user back to the Saito main page (e.g. Arcade, RedSquare,
	 * wherever)
	 */
	exitGame() {
		this.app.browser.unlockNavigation();

		// Don't process game moves while exiting!
		console.log('Halt game to exit');
		this.halted = 1;
		this.saveGame(this.game.id);

		this.visibilityChange();

		let homeModule = this.app.options.homeModule || 'Arcade';
		let mod = this.app.modules.returnModuleByName(homeModule);
		let slug = mod?.returnSlug() || 'arcade';
		navigateWindow(`/${slug}`, 300);
	}


	/*
	Process some non-game move messages

	(Do we need protections for game.over???)
	*/

	receiveMetaMessage(tx) {

		if (!tx.isTo(this.publicKey)){
			console.warn("processing a tx that isn't addressed to us...");
		}

		let txmsg = tx.returnMessage();

		if (txmsg.request == 'FOLLOW') {
			this.addFollower(txmsg.my_key);

			// Don't send myself an empty game state!
			if (!tx.isFrom(this.publicKey)) {
				let state = this?.cacheGame ? JSON.stringify(this.cacheGame) : '';
				this.sendMetaMessage('SHARE', state);
			}
			return;
		}

		if (txmsg.request == 'SHARE') {
			if (this.expecting_state) {
				console.log('Player shared last game state', tx.from[0].publicKey);
				console.log(JSON.parse(JSON.stringify(this.game)));

				if (txmsg?.data != '') {
					this.game = JSON.parse(txmsg.data);
					console.log(this.game);
					this.game.player = 0;
					this.game.live = true;
					console.log(this.game.step, this.game.queue);
					this.saveGame(this.game.id);

					this.app.connection.emit('arcade-game-ready-render-request', {
						name: this.name,
						slug: this.returnSlug(),
						id: this.game.id
					});

					// So we only process once!
					this.expecting_state = false;
				} else {
					this.initializeGameQueue(txmsg.game_id);
				}
			}

			// Sanity check that everyone has the right people in the accepted[]
			for (let i = 0; i < tx.to.length; i++){
				this.addFollower(tx.to[i].publicKey);
			}

			return;
		}

		console.warn('Game Engine: unprocessed meta transaction -- ', tx, txmsg);
	}

	/*
		A restricted communication format for players to exchange messages about game state that aren't moving the game forward
		FOLLOW / SHARE / STAKE / CONFIRM
		(and more in table-gametemplate)	
	*/
	async sendMetaMessage(request, data = {}) {
		let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();
		newtx.msg = {
			module: this.name,
			game_id: this.game.id,
			request: request,
			my_key: this.publicKey,
			data
		};

		for (let i = 0; i < this.game.accepted.length; i++) {
			newtx.addTo(this.game.accepted[i]);
		}

		console.log(JSON.parse(JSON.stringify(this.game.accepted)));
		console.log(JSON.parse(JSON.stringify(newtx.msg)));

		await newtx.sign();

		this.app.network.propagateTransaction(newtx);

		this.app.connection.emit('relay-send-message', {
			recipient: this.game.accepted,
			request: 'game relay update',
			data: newtx.toJson()
		});
	}

	visibilityChange() {
		if (!this.game.over) {
			let data = {
				mod: this.name,
				game_id: this.game?.id,
				notification: `${this.app.keychain.returnUsername(this.publicKey)} has exited the game`,
				code: 'exit'
			};
			if (this.game.player) {
				this.app.connection.emit('relay-notify-peer', this.game.opponents, data);
			}
		}
	}

	// this function runs "connect" event
	onConnectionStable(app, peer) {
		if (this.app.BROWSER === 1) {
			siteMessage('Connection Restored', 1000);
		}
	}

	//
	//
	// ON CONNECTION UNSTABLE
	//
	// this function runs "disconnect" event
	onConnectionUnstable(app, publicKey) {
		if (this.app.BROWSER === 1) {
			siteMessage('Connection Unstable', 1000);
		}
	}

	returnWelcome() {
		//return `<img src="/settlers/img/welcome2.jpg"/>`;
		return null;
	}

	returnDefaultHTML() {
		return `
		<div class="game-loader-backdrop" style="background-image: url(/${this.returnSlug()}/img/arcade/arcade.jpg);"></div>
		<div id="saito-loader-container" class="saito-loader-container"> 
		    	<h1>No Game Found</h1>
		    	<div id="return-to-arcade" class="button saito-button-primary" style="margin-bottom:5rem;">Go to Arcade</div>
   	</div>`;
	}

	createSplashScreen() {
		let html = `<div class="scrollable-page">
			<div class="saito-splash-image full" style="background-image: url(/${this.returnSlug()}/img/arcade/arcade.jpg);">
				<div class="saito-splash-section-title">
					<h1>${this.returnName()}</h1>
					<h3>${this.categories.replace('Games ', '').split(' ').reverse().join(' ')}</h3>
					<div class="saito-splash-info">
						<div class="splash-page-game-introduction">${this.description}</div>`;
		if (this.publisher_message) {
			html += `<div><em>Publisher's Note</em>: ${this.publisher_message}</div>`;
		}
		html += `
					</div>
				</div>
			</div>`;

		html += `
			<div class="saito-splash-optional hidden">
				<div id="nav_about" class="saito-splash-image" style="background-image: url(/${this.returnSlug()}/img/arcade/arcade-banner-background.png);">
					<div class="saito-splash-section-title">
						<h2>About</h2>
					</div>
				</div>
				<div class="saito-splash-info">
					<div class="splash-page-game-description"></div>
				</div>
			</div>
			<div id="nav_rankings" class="saito-splash-image" style="background-image: url(/${this.returnSlug()}/img/arcade/arcade-banner-background.png);">
				<div class="saito-splash-section-title">
					<h2>Leaderboard</h2>
				</div>
			</div>
			<div class="saito-splash-info">
				<div class="splash-page-leaderboard">
					<div id="saito-loader-container" class="saito-loader-container non-blocker"><div class="saito-loader"></div></div>
				</div>
			</div>
			<div id="nav_activity" class="saito-splash-image" style="background-image: url(/${this.returnSlug()}/img/arcade/arcade-banner-background.png);">
				<div class="saito-splash-section-title">
					<h2>Recent Activity</h2>
				</div>
			</div>
			<div class="saito-splash-info">
				<div class="game-activity">
					<div id="saito-loader-container" class="saito-loader-container non-blocker"><div class="saito-loader"></div></div>
				</div>
			</div>
			<div id="nav_learn" class="saito-splash-image" style="background-image: url(/${this.returnSlug()}/img/arcade/arcade-banner-background.png);">
				<div class="saito-splash-section-title">
					<h2>How to Play</h2>
				</div>
			</div>
			<div class="saito-splash-info">
				${this.returnGameRulesHTML()}
			</div>

			<!-- navigation -->
			<nav class="saito-splash-nav" style="background-image:url(/${this.returnSlug()}/img/arcade/menu-img.gif);">
			<ul>
			<li><a href="#nav_about">about</a></li>
			<li><a href="#nav_rankings">rankings</a></li>
			<li><a href="#nav_activity"><button id="create-game-button" class="saito-button-primary">create game</button></li></a>
			<li><a href="#nav_activity">activity</a></li>
			<li><a href="#nav_learn">learn</a></li>
			</ul>
			</nav>
			<a id="mobile-anchor" href="#nav_activity"><button id="create-game-button-mobile" class="saito-button-secondary"><i class="fa-solid fa-plus"></i></button></a>
			</div>
		`;
		return html;
	}

	async injectGameHTML(template) {
		if (!this.game_template_injected) {
			//
			// Initialize Header just before rendering...
			//
			this.header = new SaitoHeader(this.app, this);
			this.header.header_class = 'game';

			await this.timeout(500);

			await this.header.initialize(this.app);

			// Delete any default html
			while (document.body.hasChildNodes()) {
				document.body.firstChild.remove();
			}

			document.body.innerHTML = template;
			this.calculateBoardRatio();
		}
		this.game_template_injected = 1;
	}

	webServer(app, expressapp, express) {
		let webdir = `${__dirname}/../../mods/${this.dirname}/web`;
		let mod_self = this;

		expressapp.get('/' + encodeURI(this.returnSlug()), async function (req, res) {
			let reqBaseURL = req.protocol + '://' + req.headers.host + '/';

			mod_self.social.url = reqBaseURL + encodeURI(mod_self.returnSlug());
			mod_self.social.image = `${reqBaseURL + mod_self.returnSlug()}/img/arcade/arcade.jpg`;

			let html = HomePage(app, mod_self, app.build_number, mod_self.social);
			if (!res.finished) {
				res.setHeader('Content-type', 'text/html');
				res.charset = 'UTF-8';
				return res.send(html);
			}
			return;
		});

		expressapp.use('/' + encodeURI(this.returnSlug()), express.static(webdir));
	}

	returnHomePage(reqBaseURL) {
		this.social.url = reqBaseURL + encodeURI(this.returnSlug());
		this.social.image = `${reqBaseURL + this.returnSlug()}/img/arcade/arcade.jpg`;

		return HomePage(this.app, this, this.app.build_number, this.social, false);
	}
}

GameTemplate.importFunctions(
	GameAnimation,
	GameAcknowledge,
	GameArcade,
	GameCards,
	GameGame,
	GameMoves,
	GamePlayers,
	GameUI,
	GameQueue,
	GameWeb3
);

module.exports = GameTemplate;
