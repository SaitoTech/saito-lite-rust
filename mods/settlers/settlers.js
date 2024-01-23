const GameTemplate = require('../../lib/templates/gametemplate');
const SettlersRules = require('./lib/ui/overlays/rules');
const SettlersWelcome = require('./lib/ui/overlays/welcome');
const SettlersStats = require('./lib/ui/overlays/stats');
const SettlersGameOptionsTemplate = require('./lib/ui/settlers-game-options.template');
const SettlersTradeHelpOverlayTemplate = require('./lib/ui/settlers-trade-help-overlay.template');

const SettlersGameLoop = require('./lib/src/settlers-gameloop.js');
const SettlersPlayer = require('./lib/src/settlers-player');
const SettlersActions = require('./lib/src/settlers-actions');
const SettlersDisplay = require('./lib/src/settlers-display');
const SettlersState = require('./lib/src/settlers-state');

const TradeOverlay = require('./lib/ui/overlays/trade');
const BuildOverlay = require('./lib/ui/overlays/build');
const BankOverlay = require('./lib/ui/overlays/bank');
const DevCardOverlay = require('./lib/ui/overlays/dev-card');
const YearOfPlentyOverlay = require('./lib/ui/overlays/year-of-plenty');
const DiscardOverlay = require('./lib/ui/overlays/discard');
const MonopolyOverlay = require('./lib/ui/overlays/monopoly');

//////////////////
// CONSTRUCTOR  //
//////////////////
class Settlers extends GameTemplate {
	constructor(app) {
		super(app);

		this.app = app;

		this.name = 'Settlers';
		this.gamename = 'Settlers of Saitoa';
		this.description = 'Explore the island of Saitoa, collect resources, and build your way to dominance.';
		this.categories = 'Games Boardgame Strategy';

		this.cardbox.a_prompt = 0;
		this.minPlayers = 2;
		this.maxPlayers = 4;
		this.game_length = 20; //Estimated number of minutes to complete a game
		this.is_sleeping = true;
		this.confirm_moves = true;
		this.animationSpeed = 1200;

		this.can_bet = 1;

		//
		// UI components
		//
		this.rules_overlay = new SettlersRules(this.app, this);
		this.welcome_overlay = new SettlersWelcome(this.app, this);
		this.stats_overlay = new SettlersStats(this.app, this);
		this.trade_overlay = new TradeOverlay(this.app, this);

		this.build = new BuildOverlay(this.app, this);
		this.bank = new BankOverlay(this.app, this);
		this.dev_card = new DevCardOverlay(this.app, this);
		this.year_of_plenty = new YearOfPlentyOverlay(this.app, this);
		this.discard = new DiscardOverlay(this.app, this);
		this.monopoly = new MonopolyOverlay(this.app, this);

		//
		// basic game info
		//
		this.empty = false;
		this.c1 = {
			name: 'village',
			svg: '<img src="/settlers/img/icons/village.png"/>'
		};
		this.c2 = {
			name: 'city',
			svg: '<img src="/settlers/img/icons/city.png"/>'
		};
		this.r = {
			name: 'road',
			svg: '<img src="/settlers/img/icons/road.png"/>'
		};
		this.b = {
			name: 'bandit',
			svg: '<img src="/settlers/img/icons/bandit.png"/>'
		};
		this.s = {
			name: 'knight',
			img: '<img src="/settlers/img/icons/knight.png"/>'
		};
		this.t = { name: 'bank' };
		this.vp = {
			name: 'VP',
			img: '<img src="/settlers/img/icons/point_card.png"/>'
		};
		this.longest = {
			name: 'Longest Road',
			svg: '<img src="/settlers/img/icons/road.png"/>'
		};
		this.largest = {
			name: 'Largest Army',
			img: '<img src="/settlers/img/icons/knight.png"/>'
		};
		this.resources = [
			{
				name: 'brick',
				count: 3,
				ict: 3,
				icon: '/settlers/img/icons/brick-icon.png'
			},
			{
				name: 'wood',
				count: 4,
				ict: 3,
				icon: '/settlers/img/icons/wood-icon.png'
			},
			{
				name: 'wheat',
				count: 4,
				ict: 3,
				icon: '/settlers/img/icons/wheat-icon.png'
			},
			{
				name: 'wool',
				count: 4,
				ict: 3,
				icon: '/settlers/img/icons/wool-icon.png'
			},
			{
				name: 'ore',
				count: 3,
				ict: 3,
				icon: '/settlers/img/icons/ore-icon.png'
			},
			{ name: 'desert', count: 1, ict: 1 }
		];
		this.priceList = [
			['brick', 'wood'],
			['brick', 'wood', 'wheat', 'wool'],
			['ore', 'ore', 'ore', 'wheat', 'wheat'],
			['ore', 'wool', 'wheat']
		];
		this.cardDir = '/settlers/img/cards/';
		this.back = '/settlers/img/cards/red_back.png'; //Hidden Resource cards
		this.card = {
			name: 'development',
			back: '/settlers/img/cards/red_back.png'
		};
		this.deck = [
			{
				card: 'Knight',
				count: 14,
				img: '/settlers/img/cards/knight.png',
				action: 1
			},
			{
				card: 'Unexpected Bounty',
				count: 2,
				img: '/settlers/img/cards/treasure.png',
				action: 2
			},
			{
				card: 'Legal Monopoly',
				count: 2,
				img: '/settlers/img/cards/scroll.png',
				action: 3
			},
			{
				card: 'Caravan',
				count: 2,
				img: '/settlers/img/cards/wagon.png',
				action: 4
			},
			{
				card: 'Brewery',
				count: 1,
				img: '/settlers/img/cards/drinking.png',
				action: 0
			},
			{
				card: 'Bazaar',
				count: 1,
				img: '/settlers/img/cards/shop.png',
				action: 0
			},
			{
				card: 'Advanced Industry',
				count: 1,
				img: '/settlers/img/cards/windmill.png',
				action: 0
			},
			{
				card: 'Cathedral',
				count: 1,
				img: '/settlers/img/cards/church.png',
				action: 0
			},
			{
				card: 'Chemistry',
				count: 1,
				img: '/settlers/img/cards/potion.png',
				action: 0
			}
		];
		this.gametitle = 'Settlers of Saitoa';
		this.winState = 'elected governor';

		this.rules = [
			`Gain 1 ${this.vp.name}.`,
			`Move the ${this.b.name} to a tile of your choosing`,
			'Gain any two resources',
			'Collect all cards of a resource from the other players',
			`Build 2 ${this.r.name}s`
		];

		//
		// complicated game engine variables
		//
		//
		this.grace_window = 24;

		// temp var to help w/ post-splash flash
		this.currently_active_player = 0;

		this.enable_observer = false;
	}

	async render(app) {
		if (!this.browser_active) {
			return;
		}

		//Prevent this function from running twice as saito-lite is configured to run it twice
		if (this.initialize_game_run) {
			return;
		}

		await super.render(app);

		this.racetrack.win = this.game.options.game_length;
		this.racetrack.title = 'Victory Points';
		this.racetrack.icon = '<i class="fa-solid fa-crown"></i>';
		for (let i = 0; i < this.game.players.length; i++) {
			let player = {
				name: app.keychain.returnUsername(this.game.players[i]),
				score: this.game.state.players[i].vp,
				color: this.game.colors[i]
			};
			this.racetrack.players.push(player);
		}

		this.racetrack.render();

		this.menu.addMenuOption('game-game', 'Game');
		this.menu.addSubMenuOption('game-game', {
			text: 'How to Play',
			id: 'game-help',
			class: 'game-help',
			callback: function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				game_mod.rules_overlay.render();
			}
		});
		this.menu.addSubMenuOption('game-game', {
			text: 'Stats',
			id: 'game-stats',
			class: 'game-stats',
			callback: function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				game_mod.stats_overlay.render();
			}
		});

		this.menu.addChatMenu();

		this.menu.render();
		this.log.render();
		this.hexgrid.render('.gameboard');

		try {
			this.cardbox.render();
			this.cardbox.addCardType('handy-help', '', null);
			this.cardbox.makeDraggable();

			this.playerbox.render();

			//
			// This adds a class in the playerbox to attach color
			//

			for (let i = 1; i <= this.game.players.length; i++) {
				this.playerbox.addClass(
					`p${this.game.colors[i - 1]}-lite`,
					i,
					'game-playerbox-head'
				);
			}

			if (app.browser.isMobileBrowser(navigator.userAgent)) {
				console.log('mobile environment');
				this.hammer.render('#game-hexgrid');
			} else {
				this.sizer.render();
				this.sizer.attachEvents('#game-hexgrid');
			}

			//
			// Preliminary DOM set up, adding elements to display
			//
			this.addCitiesToGameboard();
			this.addPortsToGameboard();

			this.displayBoard();

			if (this.game.state.placedCity == null) {
				$('.dark').css('backgroundColor', 'unset');
			}
		} catch (err) {
			console.log('Intialize HTML: ' + err);
		}

		//
		// add the HUD so we can leverage it
		//
		this.hud.minWidth = 600;
		this.hud.maxWidth = 1;
		this.hud.render();

		//
		//Maybe we should standardize addClass() or classlist = [], for our UI components
		//
		document.querySelector('#hud')?.classList.add('saitoa');

		//
		//
		//
		//
		// add extra controls to HUD
		//
		console.log(this.game.deck[0].hand);

		this.app.browser.prependElementToSelector(
			`<div class="mobile"><div class="trade">trade</div><div class="cards ${
				this.game.deck[0]?.hand?.length > 0 ? '' : 'hidden'
			}">cards</div><div class="score">score</div></div>`,
			'.hud-body'
		);

		console.log('inside settlers render //////');

		//
		// hook up interactivity
		//
		document.querySelector('.hud-body .mobile .score').onclick = (e) => {
			this.stats_overlay.render();
		};

		document.querySelector('.hud-body .mobile .cards').onclick = (e) => {
			this.dev_card.render();
		};

		let trade_btn = document.querySelector('.hud-body .mobile .trade');

		if (!trade_btn || this.game.over) {
			return;
		}

		if (
			this.app.browser.isMobileBrowser() &&
			window.innerHeight > window.innerWidth
		) {
			trade_btn.innerHTML = 'players';
		}

		trade_btn.onclick = (e) => {
			if (
				this.app.browser.isMobileBrowser() &&
				window.innerHeight > window.innerWidth
			) {
				if (
					document.querySelector('.game-playerbox-manager').style
						.display == 'flex'
				) {
					document.querySelector(
						'.game-playerbox-manager'
					).style.display = 'none';
					return;
				} else {
					document.querySelector(
						'.game-playerbox-manager'
					).style.display = 'flex';
					try {
						//
						// load trade overlay on playerbox click
						//
						//for (let i = 0; i < this.game.players.length; i++) {
						//  this.playerbox.onclick(() => {
						//    this.trade_overlay.render();
						//  }, i + 1);
						//}

						//
						// close playerboxen on back-click
						//
						$('.game-playerbox-manager').off();
						$('.game-playerbox-manager').on('click', () => {
							console.log('Hide playerboxes in mobile');
							document.querySelector(
								'.game-playerbox-manager'
							).style.display = 'none';
						});
					} catch (err) {
						console.log('ERROR 485023: ' + err);
					}
				}
			} else {
				this.trade_overlay.render();
			}
		};
	}

	initializeGame(game_id) {
		console.log('inside initializeGame');
		console.log(this.game.state);

		if (this.game.state == undefined) {
			this.game.state = this.initializeState();

			let colors = [1, 2, 3, 4];
			this.game.colors = [];
			for (let i = 0; i < this.game.players.length; i++) {
				this.game.colors = this.game.colors.concat(
					colors.splice(this.rollDice(colors.length) - 1, 1)
				);
			}

			this.game.stats = this.initializeStats();

			console.log('---------------------------');
			console.log('---------------------------');
			console.log('------ INITIALIZE GAME ----');
			console.log('---------------------------');
			console.log('---------------------------');

			this.game.queue.push('init');

			let numPlay = this.game.players.length;

			for (let i = 1; i <= numPlay; i++) {
				this.game.queue.push('player_build_road\t' + i + '\t1');
				this.game.queue.push(`player_build_city\t${i}\t0`);
			}
			for (let i = numPlay; i >= 1; i--) {
				this.game.queue.push('player_build_road\t' + i + '\t1');
				this.game.queue.push(`player_build_city\t${i}\t0`);
			}

			this.game.queue.push('READY');
			// this is BAD -- do we force a save here in generate map so as not to lose POOL data
			this.game.queue.push('generate_map');
			this.game.queue.push('POOLDEAL\t3\t18\t2');
			this.game.queue.push('POOLDEAL\t2\t19\t1');

			this.game.queue.push(
				`DECKANDENCRYPT\t3\t${numPlay}\t${JSON.stringify(
					this.returnDiceTokens()
				)}`
			);
			this.game.queue.push(
				`DECKANDENCRYPT\t2\t${numPlay}\t${JSON.stringify(
					this.returnHexes()
				)}`
			);

			this.game.queue.push(
				`DECKANDENCRYPT\t1\t${numPlay}\t${JSON.stringify(
					this.returnDevelopmentCards()
				)}`
			);
		}

		if (this.game.players.length > 2) {
			this.grace_window = this.game.players.length * 12;
		}

		this.game.playerNames = [];
		for (let i = 0; i < this.game.players.length; i++) {
			this.game.playerNames.push(
				this.app.keychain.returnUsername(this.game.players[i])
			);
		}
	}

	initializeState() {
		let state = {};
		state.hexes = {};
		state.roads = [];
		state.cities = [];
		state.longestRoad = { size: 0, player: 0, path: [] };
		state.largestArmy = { size: 0, player: 0 };
		state.players = [];
		state.ads = [];
		state.playerTurn = 0;
		state.ports = {};
		state.lastroll = [];
		state.placedCity = 'hello world'; //a slight hack for game iniitalization
		state.welcome = 0;
		state.hasRolled = false;

		for (let i = 0; i < this.game.players.length; i++) {
			state.ads.push({});

			state.players.push({});
			state.players[i].resources = [];
			state.players[i].vp = 0;
			state.players[i].towns = 5;
			state.players[i].cities = 4;
			state.players[i].knights = 0;
			state.players[i].vpc = 0;
			state.players[i].devcards = 0;
			state.players[i].ports = [];
			state.players[i].road = 0;
		}
		return state;
	}

	initializeStats() {
		let stats = {};
		stats.dice = {};
		stats.dicePlayer = {};

		stats.production = {};
		for (let i = 2; i <= 12; i++) {
			stats.dice[i] = 0;

			let array = new Array(this.game.players.length);
			array.fill(0);

			stats.dicePlayer[i] = array;
		}

		for (let r of this.returnResources()) {
			let array = new Array(this.game.players.length);
			array.fill(0);
			stats.production[r] = array;
		}
		return stats;
	}

	returnAdvancedOptions() {
		return SettlersGameOptionsTemplate(this.app, this);
	}

	returnTradeHelpOverlay() {
		return SettlersTradeHelpOverlayTemplate(this.app, this);
	}
}

Settlers.importFunctions(
	SettlersGameLoop,
	SettlersPlayer,
	SettlersDisplay,
	SettlersActions,
	SettlersState
);

module.exports = Settlers;
