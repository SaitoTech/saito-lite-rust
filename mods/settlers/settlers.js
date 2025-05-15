const GameTemplate = require('../../lib/templates/gametemplate');
const SettlersRules = require('./lib/ui/overlays/rules');
const SettlersStats = require('./lib/ui/overlays/stats');
const SettlersGameOptionsTemplate = require('./lib/ui/settlers-game-options.template');
const htmlTemplate = require('./lib/ui/game-html.template');
const AppSettings = require('./lib/ui/settlers-settings');


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
const CardOverlay = require('./lib/ui/overlays/card');

//////////////////
// CONSTRUCTOR  //
//////////////////
class Settlers extends GameTemplate {
	constructor(app) {
		super(app);

		this.app = app;

		this.name = 'Settlers';
		this.slug = 'settlers';
		this.gamename = 'Settlers of Saitoa';
		this.description = `Saitoa is an island rich in natural resources that are produced with every roll of the die. Collect, trade, and spend resources to grow your colony faster than your opponents to win the game!`;
		this.categories = 'Games Boardgame Strategy';

		this.minPlayers = 2;
		this.maxPlayers = 4;
		this.game_length = 20; //Estimated number of minutes to complete a game
		this.confirm_moves = true;
		this.animationSpeed = 1200;
		this.sleep_timer = null;
		this.insert_rankings = true;

		//Deactivate screen record, but why?
		this.recordOptions.active = false;

		//
		// UI components
		//
		this.rules_overlay = new SettlersRules(this.app, this);
		this.stats_overlay = new SettlersStats(this.app, this);
		this.trade_overlay = new TradeOverlay(this.app, this);
		this.card_overlay = new CardOverlay(this.app, this);

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
			svg: `<img src="/settlers/img/icons/village3.png"/>`
		};
		this.c2 = {
			name: 'city',
			svg: `<img src="/settlers/img/icons/city3.png"/>`
		};
		this.r = {
			name: 'road',
			svg: `<img src="/settlers/img/icons/road.png"/>`
		};
		this.b = {
			name: 'bandit',
			icon: `<img src="/settlers/img/icons/bandit.png"/>`,
			alt: `<img src="/settlers/img/icons/robinhood.png"/>`,
			card: `<img src="/settlers/img/cards/devcards/bandit.png"/>`,
			alt_card: `<img src="/settlers/img/cards/devcards/robin_hood.png"/>`
		};
		this.s = {
			name: 'soldier',
			img: `<img class="image-as-token" src="/settlers/img/icons/knight.png"/>`
		};
		this.t = { name: 'bank' };
		this.vp = {
			name: 'VP',
			img: `<img src="/settlers/img/cards/devcard.png"/>`
		};
		this.longest = {
			name: 'Longest Road',
			icon: `<img class="image-as-token" src="/settlers/img/icons/road.png"/>`,
			card: `<img src="/settlers/img/cards/longest_road.png"/>`,
			value: 2,
			min: 5
		};
		this.largest = {
			name: 'Largest Army',
			card: `<img src="/settlers/img/cards/largest_army.png"/>`,
			value: 2
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
			{ name: 'desert', count: 1, ict: 1, null: true }
		];
		this.priceList = [
			['brick', 'wood'],
			['brick', 'wood', 'wheat', 'wool'],
			['ore', 'ore', 'ore', 'wheat', 'wheat'],
			['ore', 'wool', 'wheat']
		];
		this.cardDir = '/settlers/img/cards/';
		this.back = '/settlers/img/cards/desert.png'; //Hidden Resource cards
		this.card = {
			name: 'development',
			back: '/settlers/img/cards/devcard.png',
		};

		this.deck = [
			{
				card: 'Soldier',
				count: 14,
				img: '/settlers/img/cards/devcards/knight.png',
				title: 'Soldier',
				subtitle: `move the ${this.b.name}`,
				text: ` may move the ${this.b.name}`,
				action: 1
			},
			{
				card: 'Windfall',
				count: 2,
				img: '/settlers/img/cards/devcards/unexpected_bounty.png',
				title: 'Windfall',
				subtitle: 'receive any two resources',
				text: ' collects two resources',
				action: 2
			},
			{
				card: 'Legal Monopoly',
				count: 2,
				img: '/settlers/img/cards/devcards/monopoly.png',
				title: 'Legal Monopoly',
				subtitle: 'get resource from opponents',
				text: ' steals all of any resource',
				action: 3
			},
			{
				card: 'Construction',
				count: 2,
				img: '/settlers/img/cards/devcards/road_construction.png',
				title: 'Road Construction',
				subtitle: 'build two roads',
				text: ' may build two roads at no cost',
				action: 4
			},
			{
				card: 'Market',
				count: 1,
				img: '/settlers/img/cards/devcards/market.png',
				title: 'Achievement - Market',
				subtitle: 'gain one victory point',
				text: ' earns one Victory Point',
				action: 0
			},
			{
				card: 'University',
				count: 1,
				img: '/settlers/img/cards/devcards/university.png',
				title: 'Achievement - University',
				subtitle: 'gain one victory point',
				text: ' earns one Victory Point',
				action: 0
			},
			{
				card: 'Cathedral',
				count: 1,
				img: '/settlers/img/cards/devcards/cathedral.png',
				title: 'Achievement - Cathedral',
				subtitle: 'gain one victory point',
				text: ' earns one Victory Point',
				action: 0
			},
			{
				card: 'Lighthouse',
				count: 1,
				img: '/settlers/img/cards/devcards/lighthouse.png',
				title: 'Achievement - Lighthouse',
				subtitle: 'gain one victory point',
				text: ' earns one Victory Point',
				action: 0
			},
			{
				card: 'Laboratory',
				count: 1,
				img: '/settlers/img/cards/devcards/chemistry.png',
				title: 'Achievement - Chemistry Lab',
				subtitle: 'gain one victory point',
				text: ' earns one Victory Point',
				action: 0
			},

			//Pseudo-dev cards

			{
				card: 'Bandit',
				count: 0,
				img: '/settlers/img/cards/bandit.png',
				title: `Event - ${this.b.name}`,
				text: ` moves the ${this.b.name}`,
				action: -1
			},
			{
				card: 'Robin Hood',
				count: 0,
				img: '/settlers/img/cards/robin_hood.png',
				title: `Event - Robin Hood`,
				text: ` moves the ${this.b.name}`,
				action: -1
			},
			{
				card: `Winner`,
				count: 0,
				img: '/settlers/img/cards/governors_statue.png',
				title: `Governor's Statue`,
				text: ` is elected governor of Saitoa`,
				action: -2,
			}

		];
		this.gametitle = 'Settlers of Saitoa';
		this.winState = {
			name: 'elected governor',
			img: '/settlers/img/cards/governors_statue.png'
		};

		this.rules = [
			`Gain 1 ${this.vp.name}.`,
			`Move the ${this.b.name} to a tile of your choosing`,
			`Gain any two resources`,
			`Collect all cards of a resource from the other players`,
			`Build 2 ${this.r.name}s`
		];

		//
		// complicated game engine variables
		//
		//
		this.grace_window = 24;

		this.enable_observer = false;

		this.sort_priority = 1;
	}

    hasSettings() {
	    return true;
    }

	loadSettings(container = null) {
	    if (!container){
	      this.overlay.show(`<div class="module-settings-overlay"><h2>${this.gamename} Settings</h2></div>`);
	      container = ".module-settings-overlay";
	    }

		let as = new AppSettings(this.app, this, container);
		as.render();
	}


	async render(app) {
		if (!this.browser_active) {
			return;
		}

		//Prevent this function from running twice as saito-lite is configured to run it twice
		if (this.initialize_game_run) {
			return;
		}

		await this.injectGameHTML(htmlTemplate());

		await super.render(app);

		this.racetrack.win = this.game.options.game_length;
		this.racetrack.title = 'Victory Points';
		this.racetrack.icon = `<i class="fa-solid fa-crown"></i>`;
		this.racetrack.players = [];
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
			id: 'game-rules',
			class: 'game-rules',
			callback: function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				game_mod.rules_overlay.render();
			}
		});

		this.menu.addSubMenuOption('game-game', {
			text: 'Settings',
			id: 'game-settings',
			class: 'game-settings',
			callback: function(app, game_mod){
				game_mod.loadSettings();
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
		this.hexgrid.render('.main');
		this.cardfan.render();
        this.cardfan.addClass('bighand');

		try {
			this.playerbox.render();

			//
			// This adds a class in the playerbox to attach color
			//

			for (let i = 1; i <= this.game.players.length; i++) {
				this.playerbox.addClass(`p${this.game.colors[i - 1]}-lite`, i, 'game-playerbox'); /* add to root object so it can be inherited everywhere.*/
				this.playerbox.addClass(`p${this.game.colors[i - 1]}-lite`, i, 'game-playerbox-head');
			}

			if (app.browser.isMobileBrowser(navigator.userAgent)) {
				console.log('mobile environment');
				this.hammer.render('#game-hexgrid');
				//Prevent hud dragging in mobile
				this.hud.draggable_whole = false;
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

			///
			if (this.game.state.lastroll.length){
				this.playerbox.updateGraphics(`<div class="last-roll">${this.returnDiceImage(this.game.state.lastroll[0])}${this.returnDiceImage(this.game.state.lastroll[1])}</div>`, this.game.state.playerTurn);
			}

			if (this.game.state.playerTurn){
				this.playerbox.setActive(this.game.state.playerTurn);
			}

		} catch (err) {
			console.error('Intialize HTML: ' + err);
		}

		//
		// add the HUD so we can leverage it
		//
		this.hud.minWidth = 600;
		this.hud.maxWidth = 1;
		this.hud.render();
		this.status = [];

		//
		//Maybe we should standardize addClass() or classlist = [], for our UI components
		//
		document.querySelector('#hud-body')?.classList.add('saitoa');
		$('.hud-body .controls').appendTo('#hud');

		let html = `<ul><li class="option enabled" id="score" title="view game statistics"><i class="fa-solid fa-ranking-star"></i></li>
	    	<li class="option enabled" id="trade" title="trade with other players"><i class="fa-solid fa-money-bill-transfer"></i></li>
	    	<li class="option" id="bank" title="trade with the bank"><i class="fa-solid fa-building-columns"></i></li>
	    	<li class="option" id="playcard" title="play an action card"><i class="fa-solid fa-person-running"></i></li>
	    	<li class="option" id="spend" title="build or buy"><i class="fa-solid fa-screwdriver-wrench"></i></li>
	    	<li class="option enabled" id="rolldice"><i class="fa-solid fa-forward"></i></li></ul>
	    	`;

		this.hud.updateControls(html);
		this.updateControls();

		if (this.game.state.placedCity) {
			$('.option').css('visibility', 'hidden');
		}

		//
		// hook up interactivity
		//
		if (document.querySelector('.controls #score')) {
			document.querySelector('.controls #score').onclick = (e) => {
				this.stats_overlay.render();
			};

			if (document.querySelector('.controls #playcard')) {
				document.querySelector('.controls #playcard').onclick = (e) => {
					this.dev_card.render();
				};
			}

			if (document.querySelector('.controls #bank')) {
				document.querySelector('.controls #bank').onclick = (e) => {
					this.bank.render();
				};
			}

			if (document.querySelector('.controls #spend')) {
				document.querySelector('.controls #spend').onclick = (e) => {
					this.build.render();
				};
			}

			let trade_btn = document.querySelector('.controls #trade');

			if (!trade_btn || this.game.over) {
				return;
			}

			const openTrade = (e) => {
				if (this.game.state.ads[this.game.player - 1].offer || this.game.state.ads[this.game.player - 1].ask) {
          			this.showTradeOverlay(this.game.player,  
          			 this.game.state.ads[this.game.player - 1].ask,
            		 this.game.state.ads[this.game.player - 1].offer
          			);
				}else{
					this.trade_overlay.render();	
				}
			}

			trade_btn.onclick = openTrade;

			if (this.app.browser.isMobileBrowser() && window.innerHeight > window.innerWidth) {
				trade_btn.innerHTML = `<i class="fa-solid fa-users"></i>`;

				const showPlayerBoxes = () => {
					if (document.querySelector('.game-playerbox-manager').style.display == 'flex') {
						document.querySelector('.game-playerbox-manager').style.display = 'none';
						trade_btn.onclick = showPlayerBoxes;
						trade_btn.innerHTML = `<i class="fa-solid fa-users"></i>`;
						return;
					} else {
						document.querySelector('.game-playerbox-manager').style.display = 'flex';
						try {
							// Swap to trade functionality

							trade_btn.innerHTML = `<i class="fa-solid fa-money-bill-transfer"></i>`;
							trade_btn.onclick = openTrade;

							//
							// close playerboxen on back-click
							//
							$('.game-playerbox-manager').off();
							$('.game-playerbox-manager').on('click', () => {
								console.log('Hide playerboxes in mobile');
								document.querySelector('.game-playerbox-manager').style.display = 'none';
								trade_btn.onclick = showPlayerBoxes;
								trade_btn.innerHTML = `<i class="fa-solid fa-users"></i>`;
							});
						} catch (err) {
							console.error('ERROR 485023: ' + err);
						}
					}

				}

				trade_btn.onclick = showPlayerBoxes;

			}

		}
	}

	async initializeGameStake(crypto, stake) {
		await super.initializeGameStake(crypto, stake);

		//Reset Game
		this.game.state = this.initializeState();
		this.game.stats = this.initializeStats();
		this.game.queue = [];

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

		this.game.queue.push('initial_placement');

		this.game.queue.push('READY');
		this.saveGame(this.game.id);

		$('.main').html('');

		this.hexgrid.render('.main');

		if (this.app.browser.isMobileBrowser(navigator.userAgent)) {
			this.hammer.render('#game-hexgrid');
		} else {
			this.sizer.render();
			this.sizer.attachEvents('#game-hexgrid');
		}

		//
		// Preliminary DOM set up, adding elements to display
		//
		this.generateMap();
		this.addCitiesToGameboard();
		this.addPortsToGameboard();

		this.displayBoard();

		this.initializeGameQueue(this.game.id);
	}

	initializeGame(game_id) {
		if (this.game.state == undefined) {
			this.game.state = this.initializeState();

			this.game.canProcess = false; // For end game... 

			if (!this.game.colors) {
				let colors = [1, 2, 3, 4];
				this.game.colors = [];
				for (let i = 0; i < this.game.players.length; i++) {
					this.game.colors = this.game.colors.concat(
						colors.splice(this.rollDice(colors.length) - 1, 1)
					);
				}
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

			this.game.queue.push('initial_placement');
			this.game.queue.push('READY');
			// this is BAD -- do we force a save here in generate map so as not to lose POOL data
			this.game.queue.push('generate_map');
			this.game.queue.push(`POOLDEAL\t3\t18\t2`);
			this.game.queue.push(`POOLDEAL\t2\t19\t1`);

			this.game.queue.push(
				`DECKANDENCRYPT\t3\t${numPlay}\t${JSON.stringify(this.returnDiceTokens())}`
			);
			this.game.queue.push(`DECKANDENCRYPT\t2\t${numPlay}\t${JSON.stringify(this.returnHexes())}`);

			this.game.queue.push(
				`DECKANDENCRYPT\t1\t${numPlay}\t${JSON.stringify(this.returnDevelopmentCards())}`
			);
		}

		if (this.game.players.length > 2) {
			this.grace_window = this.game.players.length * 12;
		} else {
			//2-player game -- make adjustments!

			this.longest.value = 1;
			this.longest.min = 6;
			this.largest.value = 1;
		}

		this.game.playerNames = [];
		for (let i = 0; i < this.game.players.length; i++) {
			this.game.playerNames.push(this.app.keychain.returnUsername(this.game.players[i]));
		}

		this.game.options.game_length = parseInt(this.game.options.game_length);
		this.turn_limit = parseInt(this.game.options.turn_limit) * 1000;
		if (this.turn_limit) {
			this.clock.useShotClock = true;
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
		state.hasRolled = false;
		state.threatened = [];
		state.robinhood_overlay = 0;

		for (let i = 0; i < this.game.players.length; i++) {
			state.ads.push({});

			state.players.push({});
			state.players[i].resources = [];
			state.players[i].vp = 0;
			state.players[i].towns = 5;
			state.players[i].cities = 4;
			state.players[i].knights = 0;
			state.players[i].vpc = 0;
			state.players[i].devcards = [];
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
		stats.discarded = {};
		stats.robbed = {};
		stats.blocked = {};
		stats.banked = {}; // out
		stats.traded = {}; // in
		stats.move_bandit = new Array(this.game.players.length);
		stats.move_bandit.fill(0);

		for (let i = 2; i <= 12; i++) {
			stats.dice[i] = 0;

			let array = new Array(this.game.players.length);
			array.fill(0);

			stats.dicePlayer[i] = array;
		}

		stats.famine = {};

		for (let r of this.returnResources()) {
			let array = new Array(this.game.players.length);
			array.fill(0);
			stats.production[r] = array;

			stats.discarded[r] = array.slice();
			stats.robbed[r] = array.slice();
			stats.blocked[r] = array.slice();
			stats.banked[r] = array.slice();
			stats.traded[r] = array.slice();
		}

		stats.history = [];

		return stats;
	}

	returnGameRulesHTML() {
		return this.rules_overlay.returnRules();
	}

	returnAdvancedOptions() {
		return SettlersGameOptionsTemplate(this.app, this);
	}

	endTurn() {
		this.halted = 0;

		if (this.sleep_timer) {
			clearTimeout(this.sleep_timer);
			this.sleep_timer = null;
		}

		this.clearShotClock();
		this.clock.stopClock();

		this.updateStatus("submitting game move...");
		this.updateControls('WAIT');
		
		super.endTurn();
	}

	updateControls(str) {

		if (!this.gameBrowserActive()){
			return;
		}

		if (str) {
			if (str.includes('<i')) {
				$('.controls .option').css('visibility', 'hidden');
				$('#rolldice').addClass('enabled');
				$('#rolldice').css('visibility', 'visible');
				$('#rolldice').html(str);
				return;
			} else if (str === "WAIT") {
				$('.controls .option').css('visibility', 'hidden');
				$('#rolldice').css('visibility', 'visible');
				$('#rolldice').html(`<i class="fa-solid fa-pause"></i>`);
				$('#rolldice').removeClass('enabled');
				document.getElementById("rolldice").onclick = null;
				return;
			} else {
				console.log('UPDATE CONTROLS:', str);
				//super.updateControls(str);
			}
		}

		$('.controls .option').css('visibility', 'visible');

		if (this.game.state.playerTurn !== this.game.player) {
			$('#rolldice').html(`<i class="fa-solid fa-pause"></i>`);
			$('#rolldice').removeClass('enabled');
			document.getElementById("rolldice").onclick = null;

			$('#bank').removeClass('enabled');
			$('#playcard').removeClass('enabled');
			$('#spend').removeClass('enabled');
		}
	}


	// Overwrite inherited function so we can play nice with the specialty HUD controls
	updateStatusForGameOver(status, allowRematch) {
		let target = this.app.options.homeModule || 'Arcade';
		allowRematch = allowRematch && this.game.player !== 0;

		let options = `<ul>
                      <li class="textchoice" id="confirmit">Return to ${target}</li>
                      ${
							allowRematch
								? '<!--li class="textchoice" id="rematch">Rematch</li-->'
								: ''
						}
                   </ul>`;

		this.hud.back_button = false;

		this.updateStatus(status);

		let settlers_self = this;

		$('.controls .option').css('visibility', 'hidden');
		$('.controls .option').removeClass('enabled');

		$('#score').addClass('enabled');
		$('#score').css('visibility', 'visible');

		
		$('#spend').addClass('enabled');
		$('#spend').html(`<i class="fa-solid fa-rotate-left"></i>`);
		$('#spend').css('visibility', 'visible');

		// --> return
		$('#rolldice').addClass('enabled');
		$('#rolldice').html(`<i class="fa-solid fa-door-open"></i>`);
		$('#rolldice').css('visibility', 'visible');

		document.getElementById('rolldice').onclick = (e) => {
			e.currentTarget.onclick = null;
			this.exitGame();
		}

		if (document.getElementById('spend')) {
			document.getElementById('spend').onclick = (e) => {
				this.initialize_game_run = 0;
				e.currentTarget.onclick = null;
				$("#spend").removeClass('enabled');
				$("#spend").css('visibility', 'hidden');
				this.app.connection.emit('arcade-issue-challenge', {
					game: this.name,
					players: this.game.players,
					options: this.game.options
				});
			};
		}



		////////////////////////////////////////
		// Attach Listeners for rematch actions
		////////////////////////////////////////
		this.app.connection.on("arcade-challenge-issued", tx => {
			let btn = document.getElementById('spend');
			if (btn){
				if (tx.isFrom(this.publicKey)){
					this.updateStatus("Rematch requested");
				}else{
					this.updateStatus("Accept Rematch?");
				}
			}
		});

		this.app.connection.on('arcade-game-initialize-render-request', (game_id) => {
			this.updateStatus('Preparing rematch...');
			this.updateControls("WAIT");
			this.browser_active = 0; //Hack to simulate not being in the game mod
		});

		this.app.connection.on(
			'arcade-game-ready-render-request',
			(game_details) => {
				let status = document.getElementById("status") || document.querySelector(".status");
				status.innerHTML = `<div class="player-notice">Set sail for a new island</div>`;
	 		    
	 		    $('#rolldice').addClass('enabled');
				$('#rolldice').html(`<i class="fa-solid fa-anchor"></i>`);
				$('#rolldice').css('visibility', 'visible');
				document.getElementById('rolldice').onclick = (e) => {
					e.currentTarget.onclick = null;
					navigateWindow('/' + game_details.slug, 100);
				}
			}
		);


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

//<i class="fa-solid fa-hammer"></i>   //<i class="fa-solid fa-screwdriver-wrench"></i>
//<i class="fa-solid fa-dice"></i>
//<i class="fa-solid fa-forward"></i>
//<i class="fa-solid fa-building-columns"></i>

//<i class="fa-solid fa-money-bill-transfer"></i>
//<i class="fa-solid fa-ranking-star"></i>