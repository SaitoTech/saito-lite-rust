const GameTemplate = require('../../lib/templates/gametemplate');
const saito = require('../../lib/saito/saito');
const JSON = require('json-bigint');

//////////////////
// CONSTRUCTOR  //
//////////////////
class GameTestSuite extends GameTemplate {
	constructor(app) {
		super(app);

		this.name = 'GameTestSuite';
		this.slug = 'gametestsuite';
		this.gamename = 'Game Test Suite';
		this.description = 'A test suite covering core functions for the Saito Game Engine';
		this.categories = 'Utilities Development Demonstration';

		this.card_img_dir = '/gametestsuite/img/cards';

		this.status = 'Demonstration';

		// player numbers
		this.minPlayers = 1; //2;
		this.maxPlayers = 1; //6;

		this.game_cardfan_visible = 0;
		this.game_menu_visible = 1;
		this.game_hud_visible = 0;
		this.game_cardbox_visible = 0;
		this.game_playerboxes_visible = 0;
		this.game_boardsizer_visible = 0;

		this.gameMode = 0;

		this.hud.mode = 0;
		this.hud.enable_mode_change = 1;

		return this;
	}

	//
	// initialize module when it starts
	//
	async initializeGame(game_id) {
		//
		// create game if it does not exist
		//
		if (!this.game.state) {
			this.game.state = this.returnState(this.game.players.length);

			this.game.queue.push('welcome');
			this.game.queue.push('init');
			this.game.queue.push('NOTIFY\tYou are Player ' + this.game.player);
			this.game.queue.push('READY');
		}

		//
		// let opponents know my game crypto
		//
		// normally this is automatically done when moves are made, but since
		// this is a demo app it is possible that people will click immediately
		// on web3 testing functionality, in which case we already want the keys
		// to have been exchanged / set.
		//
		if (this.game.options.crypto != undefined) {
			this.game.crypto = this.game.options.crypto;
			let crypto_key = this.app.wallet.returnCryptoAddressByTicker(
				this.game.crypto
			);
			this.addMove(
				'CRYPTOKEY\t' +
					this.publicKey +
					'\t' +
					crypto_key +
					'\t' +
					(await this.app.crypto.signMessage(
						crypto_key,
						await this.app.wallet.getPrivateKey()
					))
			);
			this.endTurn();
		}
	}

	//
	// initialize HTML and UI components
	//
	async initializeHTML(app) {
		//Game initialization begins from the Arcade.
		//So, it is best to prevent any HTML/DOM manipulation until in the right page
		if (!this.browser_active) {
			return;
		}

		await super.initializeHTML(app);

		//Put functionality into the menu

		this.menu.addMenuOption({
			text: 'Game',
			id: 'game-game',
			class: 'game-game',
			callback: function (app, game_mod) {
				game_mod.menu.showSubMenu('game-game');
			}
		});

		this.menu.addSubMenuOption('game-game', {
			text: 'Intro',
			id: 'game-intro',
			class: 'game-type',
			callback: function (app, game_mod) {
				game_mod.gameMode = 0;
				$('#main').html(game_mod.returnMainHTML());
				game_mod.addEventsToDom(app);
				game_mod.updateMenuCheck();
			}
		});
		this.menu.addSubMenuOption('game-game', {
			text: 'Card Game',
			id: 'game-cardgame',
			class: 'game-type',
			callback: function (app, game_mod) {
				game_mod.gameMode = 1;
				$('#main').html(game_mod.returnCardGameHTML());
				game_mod.updateMenuCheck();
			}
		});
		this.menu.addSubMenuOption('game-game', {
			text: 'Board Game',
			id: 'game-boardgame',
			class: 'game-type',
			callback: function (app, game_mod) {
				game_mod.gameMode = 2;
				$('#main').html(game_mod.returnBoardGameHTML());
				game_mod.updateMenuCheck();
			}
		});
		this.menu.addSubMenuOption('game-game', {
			text: 'HexBoard',
			id: 'game-hexboard',
			class: 'game-type',
			callback: function (app, game_mod) {
				game_mod.gameMode = 3;
				$('#main').html(game_mod.returnHexGameHTML());
				game_mod.updateMenuCheck();
			}
		});

		/* Simulate different numbers of players*/
		this.menu.addMenuOption({
			text: 'Players',
			id: 'menu-players',
			class: 'menu-players',
			callback: function (app, game_mod) {
				game_mod.menu.showSubMenu('menu-players');
			}
		});

		for (let i = 1; i < 7; i++) {
			this.menu.addSubMenuOption('menu-players', {
				text: `${i}`,
				id: `menu-${i}-player`,
				class: 'menu-num-players',
				callback: function (app, game_mod) {
					game_mod.menu.hideSubMenus();
					game_mod.adjustPlayers(i);
				}
			});
		}

		/* Interface */
		this.menu.addMenuOption({
			text: 'Interface',
			id: 'menu-interface',
			class: 'menu-interface',
			callback: function (app, game_mod) {
				game_mod.menu.showSubMenu('menu-interface');
			}
		});

		this.menu.addSubMenuOption('menu-interface', {
			text: 'HUD',
			id: 'menu-hud',
			class: 'menu-hud',
			callback: function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				game_mod.display_cardhud_test(game_mod.app);
			}
		});

		this.menu.addSubMenuOption('menu-interface', {
			text: 'Playerbox',
			id: 'menu-playerbox',
			class: 'menu-playerbox',
			callback: function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				game_mod.add_player_boxes_test(game_mod.app);
			}
		});

		this.menu.addSubMenuOption('menu-interface', {
			text: 'Log',
			id: 'menu-log',
			class: 'menu-log',
			callback: function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				game_mod.log.toggleLog();
			}
		});

		this.menu.addSubMenuOption('menu-interface', {
			text: 'HUD',
			id: 'menu-hud',
			class: 'menu-hud',
			callback: function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				game_mod.display_cardhud_test(game_mod.app);
			}
		});

		this.menu.addSubMenuOption('menu-interface', {
			text: 'Board Sizer',
			id: 'menu-board-sizer',
			class: 'menu-board-sizer',
			callback: function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				game_mod.display_boardsizer_test(game_mod.app);
			}
		});

		this.menu.addSubMenuOption('menu-interface', {
			text: 'Card fan',
			id: 'menu-fan',
			class: 'menu-fan',
			callback: function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				game_mod.display_cardfan_test(game_mod.app);
			}
		});

		this.menu.addSubMenuOption('menu-interface', {
			text: 'Card box',
			id: 'menu-cardbox',
			class: 'menu-cardbox',
			callback: function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				game_mod.toggle_cardbox_test(game_mod.app);
			}
		});

		this.menu.addSubMenuOption('menu-interface', {
			text: 'Overlay',
			id: 'menu-overlay',
			class: 'menu-overlay',
			callback: function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				game_mod.display_overlay_test(game_mod.app);
			}
		});

		this.menu.addSubMenuOption('menu-interface', {
			text: 'Blocking overlay',
			id: 'menu-block-overlay',
			class: 'menu-overlay',
			callback: function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				game_mod.display_blocking_overlay_test(game_mod.app);
			}
		});

		this.menu.addSubMenuOption('menu-interface', {
			text: 'Scoreboard',
			id: 'menu-scoreboard',
			class: 'menu-scoreboard',
			callback: function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				game_mod.display_scoreboard_test(game_mod.app);
			}
		});
		this.menu.addSubMenuOption('menu-interface', {
			text: 'Game Clock',
			id: 'menu-game-clock',
			class: 'menu-game-clock',
			callback: function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				game_mod.display_game_clock_test(game_mod.app);
			}
		});

		/* Crypto*/
		this.menu.addMenuOption({
			text: 'Web3',
			id: 'menu-crypto',
			class: 'menu-crypto',
			callback: function (app, game_mod) {
				game_mod.menu.showSubMenu('menu-crypto');
			}
		});

		this.menu.addSubMenuOption('menu-crypto', {
			text: 'Check Balance',
			id: 'crypto-balance',
			class: 'crypto-balance',
			callback: function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				game_mod.check_balance_test(game_mod.app);
			}
		});

		this.menu.addSubMenuOption('menu-crypto', {
			text: 'Payment',
			id: 'crypto-send',
			class: 'crypto-send',
			callback: function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				game_mod.send_payment_test(game_mod.app);
			}
		});

		/*this.menu.addSubMenuOption("menu-crypto", {
      text: "Receive Payment",
      id: "crypto-receive",
      class: "crypto-receive",
      callback: function (app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.receive_payment_test(game_mod.app);
      },
    });
    */

		this.menu.render();

		this.log.render();

		this.updateMenuCheck();

		//
		// add events to DOM
		//
		// good behavior to wrap attempts to manipulate the DOM in
		// try/catch blocks so that errors attempting to manipulate
		// the DOM don't disrupt other applications running on the
		// Saito stack.
		//
		try {
			switch (this.gameMode) {
			case 1:
				$('#main').html(this.returnCardGameHTML());
				break;
			case 2:
				$('#main').html(this.returnBoardGameHTML());
				break;
			case 3:
				$('#main').html(this.returnHexGameHTML());
				break;
			default:
				$('#main').html(this.returnMainHTML());
			}

			this.addEventsToDom(this.app);
		} catch (err) {
			console.log('Error: ' + err);
		}
	}

	//
	// main game queue
	//
	handleGameLoop() {
		///////////
		// QUEUE //
		///////////
		if (this.game.queue.length > 0) {
			let qe = this.game.queue.length - 1;
			let mv = this.game.queue[qe].split('\t');

			if (mv[0] === 'init') {
				console.log('sometimes we can handle init stuff in queue...');
				this.game.queue.splice(qe, 1);
				return 1;
			}
			if (mv[0] === 'welcome') {
				if (this.browser_active) {
					this.overlay.show(this.returnWelcomeMessage());
					this.game.queue.splice(qe, 1);
				}
				return 0; //Stops the game engine from cycling through the game loop
			}
		}

		return 1;
	}

	returnWelcomeMessage() {
		//
		// update active crypto
		//
		let crypto = this.game.crypto || 'SAITO';

		return `<div class="introduction-container">
          <p>This application provides click-to-test functionality of core backend components in the Saito Game Engine. It also serves as a showcase for how to simply and easily handle common game tasks like rolling dice, dealing cards or displaying UI elements. It also provides a basic starting point for coding games!</p>
          <p>Online Docs: <a href="https://github.com/SaitoTech/saito-lite/blob/master/docs/saito-game-engine/readme.md" target="_newsaito">game engine overview</a> | <a href="https://github.com/SaitoTech/saito-lite/blob/master/docs/saito-game-engine/api.md" target="_newsaito">api details</a></p>
          <p>Please note that testing web3 cryptocurrency support requires your wallet to be configured to support those cryptocurrencies. This application was created with support for <span id="saito_crypto">${crypto}</span> as the Web3 token -- to change to another token such as DOT or WND please specify in the advanced options menu on game create. Some card-related functionality may require you to have dealt cards to players.</p>
      </div>`;
	}

	//
	// ( advanced options on Arcade start )
	//
	// used here to allow users to select in-game web3 crypto
	//
	returnGameOptionsHTML() {
		let options_html = `
      <h1 class="overlay-title">Select a Web3 Crypto:</h1>
      <div class="overlay-input">
        <label for="crypto">Crypto:</label>
        <select name="crypto">
          <option value="" selected>None</option>
    `;
		for (let i = 0; i < this.app.modules.mods.length; i++) {
			if (
				this.app.modules.mods[i].ticker != '' &&
				this.app.modules.mods[i].ticker != undefined
			) {
				options_html += `<option value="${this.app.modules.mods[i].ticker}">${this.app.modules.mods[i].ticker}</option>`;
			}
		}
		options_html += `
        </select>
      </div>
    `;

		return options_html;
	}

	/*
   default game state
   state is an object stored in the game (e.g. this.game.state), which is remembered between refreshes
   due to default saveGame behavior in the game engine
   This information is "public"
  */
	returnState(numPlayers) {
		let state = {};

		state.cards_dealt_to_players = 0;
		state.simultaneous_pick_submitted = 0;
		state.numPlayers = numPlayers;

		state.players = [];
		for (let i = 0; i < numPlayers; i++) {
			state.players.push({ cards: [], score: 0 });
		}

		return state;
	}

	//
	// default deck
	//
	returnDeck() {
		var deck = {};

		deck['1'] = { name: 'S1.png', img: '/gametestsuite/img/cards/S1.png' };
		deck['2'] = { name: 'S2.png', img: '/gametestsuite/img/cards/S2.png' };
		deck['3'] = { name: 'S3.png', img: '/gametestsuite/img/cards/S3.png' };
		deck['4'] = { name: 'S4.png', img: '/gametestsuite/img/cards/S4.png' };
		deck['5'] = { name: 'S5.png', img: '/gametestsuite/img/cards/S5.png' };
		deck['6'] = { name: 'S6.png', img: '/gametestsuite/img/cards/S6.png' };
		deck['7'] = { name: 'S7.png', img: '/gametestsuite/img/cards/S7.png' };
		deck['8'] = { name: 'S8.png', img: '/gametestsuite/img/cards/S8.png' };
		deck['9'] = { name: 'S9.png', img: '/gametestsuite/img/cards/S9.png' };
		deck['10'] = {
			name: 'S10.png',
			img: '/gametestsuite/img/cards/S10.png'
		};
		deck['11'] = {
			name: 'S11.png',
			img: '/gametestsuite/img/cards/S11.png'
		};
		deck['12'] = {
			name: 'S12.png',
			img: '/gametestsuite/img/cards/S12.png'
		};
		deck['13'] = {
			name: 'S13.png',
			img: '/gametestsuite/img/cards/S13.png'
		};
		deck['14'] = { name: 'C1.png', img: '/gametestsuite/img/cards/C1.png' };
		deck['15'] = { name: 'C2.png', img: '/gametestsuite/img/cards/C2.png' };
		deck['16'] = { name: 'C3.png', img: '/gametestsuite/img/cards/C3.png' };
		deck['17'] = { name: 'C4.png', img: '/gametestsuite/img/cards/C4.png' };
		deck['18'] = { name: 'C5.png', img: '/gametestsuite/img/cards/C5.png' };
		deck['19'] = { name: 'C6.png', img: '/gametestsuite/img/cards/C6.png' };
		deck['20'] = { name: 'C7.png', img: '/gametestsuite/img/cards/C7.png' };
		deck['21'] = { name: 'C8.png', img: '/gametestsuite/img/cards/C8.png' };
		deck['22'] = { name: 'C9.png', img: '/gametestsuite/img/cards/C9.png' };
		deck['23'] = {
			name: 'C10.png',
			img: '/gametestsuite/img/cards/C10.png'
		};
		deck['24'] = {
			name: 'C11.png',
			img: '/gametestsuite/img/cards/C11.png'
		};
		deck['25'] = {
			name: 'C12.png',
			img: '/gametestsuite/img/cards/C12.png'
		};
		deck['26'] = {
			name: 'C13.png',
			img: '/gametestsuite/img/cards/C13.png'
		};
		deck['27'] = { name: 'H1.png', img: '/gametestsuite/img/cards/H1.png' };
		deck['28'] = { name: 'H2.png', img: '/gametestsuite/img/cards/H2.png' };
		deck['29'] = { name: 'H3.png', img: '/gametestsuite/img/cards/H3.png' };
		deck['30'] = { name: 'H4.png', img: '/gametestsuite/img/cards/H4.png' };
		deck['31'] = { name: 'H5.png', img: '/gametestsuite/img/cards/H5.png' };
		deck['32'] = { name: 'H6.png', img: '/gametestsuite/img/cards/H6.png' };
		deck['33'] = { name: 'H7.png', img: '/gametestsuite/img/cards/H7.png' };
		deck['34'] = { name: 'H8.png', img: '/gametestsuite/img/cards/H8.png' };
		deck['35'] = { name: 'H9.png', img: '/gametestsuite/img/cards/H9.png' };
		deck['36'] = {
			name: 'H10.png',
			img: '/gametestsuite/img/cards/H10.png'
		};
		deck['37'] = {
			name: 'H11.png',
			img: '/gametestsuite/img/cards/H11.png'
		};
		deck['38'] = {
			name: 'H12.png',
			img: '/gametestsuite/img/cards/H12.png'
		};
		deck['39'] = {
			name: 'H13.png',
			img: '/gametestsuite/img/cards/H13.png'
		};
		deck['40'] = { name: 'D1.png', img: '/gametestsuite/img/cards/D1.png' };
		deck['41'] = { name: 'D2.png', img: '/gametestsuite/img/cards/D2.png' };
		deck['42'] = { name: 'D3.png', img: '/gametestsuite/img/cards/D3.png' };
		deck['43'] = { name: 'D4.png', img: '/gametestsuite/img/cards/D4.png' };
		deck['44'] = { name: 'D5.png', img: '/gametestsuite/img/cards/D5.png' };
		deck['45'] = { name: 'D6.png', img: '/gametestsuite/img/cards/D6.png' };
		deck['46'] = { name: 'D7.png', img: '/gametestsuite/img/cards/D7.png' };
		deck['47'] = { name: 'D8.png', img: '/gametestsuite/img/cards/D8.png' };
		deck['48'] = { name: 'D9.png', img: '/gametestsuite/img/cards/D9.png' };
		deck['49'] = {
			name: 'D10.png',
			img: '/gametestsuite/img/cards/D10.png'
		};
		deck['50'] = {
			name: 'D11.png',
			img: '/gametestsuite/img/cards/D11.png'
		};
		deck['51'] = {
			name: 'D12.png',
			img: '/gametestsuite/img/cards/D12.png'
		};
		deck['52'] = {
			name: 'D13.png',
			img: '/gametestsuite/img/cards/D13.png'
		};

		return deck;
	}

	//////////////////////////////
	// MODULE SPECIFIC FUNCTION //
	//////////////////////////////
	//
	// this is a non-standard function that we called in initializeHTML() to handle
	// all of the DOM events. It is not part of the game engine and is included here
	// merely to isolate the code away from the core components so that the logic of
	// game creation is cleaner and easier to see.
	//
	addEventsToDom(app) {
		let game_self = this;

		//
		// deal cards to players
		//
		document.getElementById('deal_cards_to_player_button').onclick = (
			e
		) => {
			game_self.deal_cards_to_player_test(game_self.app);
		};

		//
		// deal cards to the table
		//
		document.getElementById('shuffle_deck_button').onclick = (e) => {
			game_self.shuffle_deck_test(game_self.app);
		};

		//
		// deal cards to the table
		//
		document.getElementById('deal_cards_to_table_button').onclick = (e) => {
			game_self.deal_cards_to_table_test(game_self.app);
		};

		document.getElementById('add_player').onclick = (e) => {
			if (game_self.game.players.length < 6) {
				game_self.adjustPlayers(game_self.game.players.length + 1);
				$('#player_count').text(
					`Players -- ${game_self.game.players.length}`
				);
			}
		};
		document.getElementById('subtract_player').onclick = (e) => {
			if (game_self.game.players.length > 1) {
				game_self.adjustPlayers(game_self.game.players.length - 1);
				$('#player_count').text(
					`Players -- ${game_self.game.players.length}`
				);
			}
		};

		//
		// add to menu to page
		//
		document.getElementById('add_menu_button').onclick = (e) => {
			game_self.add_menu_test(game_self.app);
		};

		//
		// show non-blocking overlay
		//
		document.getElementById('display_overlay_button').onclick = (e) => {
			game_self.display_overlay_test(game_self.app);
		};

		//
		// show blocking overlay
		//
		document.getElementById('display_blocking_overlay_button').onclick = (
			e
		) => {
			game_self.display_blocking_overlay_test(game_self.app);
		};
	}

	////////////////////
	// TEST FUNCTIONS //
	////////////////////
	//
	// these functions illustrate how the underlying game engine is used to
	// handle the desired functionality or load and manipulate the UI components
	// that we are testing. This code exists as a reference for third-party
	// developers. Questions and feedback are welcome, as are contributions.
	//
	async add_player_boxes_test(app) {
		if (this.game_playerboxes_visible == 0) {
			this.playerbox.render();
			this.playerbox.addClassAll('poker-seat-', true); //Have to manually add a class for positioning

			this.game_playerboxes_visible = 1;
		} else {
			this.game_playerboxes_visible = 0;
			this.playerbox.hide();
		}
	}

	async insecure_dice_roll_test(app) {
		// individual machines can do this, but to keep dice rolls in sync wrap rolls in
		// a function that can be called simultaneously on both machines on the queue...
		// this.diceRoll(6);
		this.addMove('LOGDICE');
		this.endTurn();
	}

	async secure_dice_roll_test(app) {
		this.addMove('LOGDICE');
		this.requestSecureRoll();
		this.endTurn();
	}

	async simultaneous_pick_test(app) {
		let game_self = this;
		let simultaneous_pick_card = Math.random().toString();

		if (game_self.game.state.simultaneous_pick_submitted) {
			salert(
				'All players need to click on the simultaneous pick button. The results will be printed in the console.log. The test is restricted to running a single time, to avoid players making multiple submissions before all players have contributed and triggering failures in card selection.'
			);
			return 0;
		}

		game_self.game.state.simultaneous_pick_submitted = 1;

		game_self.updateLog(`

			All players must click this button. The backend code
			will consequently perform a cryptographic exchange that
			permits provably-fair reconstruction of simultaneously-
			selected numbers, without revealing those numbers until
			all players have committed and publicized their
			selections:

			Your card is ${simultaneous_pick_card};

    `);

		let hash1 = game_self.app.crypto.hash(simultaneous_pick_card); // my card
		let hash2 = game_self.app.crypto.hash(Math.random().toString()); // my secret
		let hash3 = game_self.app.crypto.hash(hash2 + hash1); // combined hash

		let card_sig = game_self.app.crypto.signMessage(
			simultaneous_pick_card,
			await game_self.app.wallet.getPrivateKey()
		);
		let hash2_sig = game_self.app.crypto.signMessage(
			hash2,
			await game_self.app.wallet.getPrivateKey()
		);
		let hash3_sig = game_self.app.crypto.signMessage(
			hash3,
			await game_self.app.wallet.getPrivateKey()
		);

		game_self.game.spick_card = simultaneous_pick_card;
		game_self.game.spick_hash = hash2;

		game_self.addMove(
			'SIMULTANEOUS_PICK\t' +
				game_self.game.player +
				'\t' +
				hash3 +
				'\t' +
				hash3_sig
		);
		game_self.endTurn();
	}

	async consecutive_moves_test(app) {
		let game_self = this;
		game_self.updateLog(`

			This illustrates how to get both players moving one-by-one. First
			one player will move. And when they have completed their move the
			other player will be asked to move.

    `);
		for (let i = 0; i < game_self.game.players.length; i++) {
			game_self.addMove(
				'NOTIFY\tPlayer ' + (i + 1) + ' is finished moving'
			);
			game_self.addMove('PLAY\t' + (i + 1));
			game_self.addMove(
				'NOTIFY\tPlayer ' + (i + 1) + ' is about to move'
			);
		}
		game_self.endTurn();
	}

	async simultaneous_moves_test() {
		let game_self = this;

		game_self.updateLog(`

			This illustrates how to provide the opportunity for multiple players
			to perform actions at the same time. Note that these are not blind 
			actions so any player that moves first will have their move visible
			to others. But it allows for rapid responses to gameplay action in 
			particular confirming that actions have happened.

			Games should not be designed with nested simultaneous moves. If you 
			require complicated actions that require responses within these sub-
			moves it is better to switch to concurrent processing or (better yet)
			to break gameplay into two steps.

    `);
		let players_to_go = [];
		for (let i = 0; i < game_self.game.players.length; i++) {
			players_to_go.push(i + 1);
		}
		game_self.addMove('NOTIFY\tAll players have finished moving');
		game_self.addMove('PLAY\t' + JSON.stringify(players_to_go));
		game_self.addMove('NOTIFY\tAll players will move simultaneously');
		game_self.endTurn();
	}

	display_overlay_test(app) {
		let overlay_html = `
      <div style="background-color:whitesmoke;width:80vw;padding:40px;font-size:1.2em;">
      Non-blocking overlays can be closed by clicking on backdrops.
      <p></p>
      Width and height determined based on content put into overlay.
      </div>
    `;

		this.overlay.show(overlay_html, function () {
			alert('Callback Optional on Close!');
		});
	}

	display_blocking_overlay_test(app) {
		let game_self = this;

		let overlay_html = `
      <div style="background-color:whitesmoke;width:80vw;padding:40px;font-size:1.2em;">
      Blocking overlays cannot be closed by clicking on backdrops.
      <p></p>
      <div class="button close_overlay_button" id="close_overlay_button">close overlay</div>
      Width and height determined based on content put into overlay.
      </div>
    `;

		this.overlay.show(overlay_html);
		this.overlay.blockClose();
		document.getElementById('close_overlay_button').onclick = (e) => {
			game_self.overlay.hide();
		};
	}

	display_scoreboard_test(app) {
		this.scoreboard.update(
			`<div>Num Players: ${this.game.players.length}</div>`
		);
	}

	display_game_clock_test(app) {
		this.clock.render();
	}

	async deal_cards_to_player_test(app) {
		let game_self = this;

		//
		// SIMPLEDEAL
		//
		game_self.addMove('LOGHAND\t1');
		game_self.updateLog(`

			use the SIMPLEDEAL instruction to deal the contents of a deck
			of cards securely to all players. the deck is an associative
			array. what is dealt to players is the INDEX that is used to 
		  	find the card in the associative array. All players are dealt
			cards.

    `);

		//
		// SIMPLEDEAL [number_of_cards_to_deal] [index_of_deck] [JSON of deck]
		//
		game_self.addMove(
			'SIMPLEDEAL\t' +
				3 +
				'\t' +
				1 +
				'\t' +
				JSON.stringify(game_self.returnDeck())
		);
		game_self.endTurn();

		if (this.game_cardfan_visible) {
			this.cardfan.render();
		}
	}

	async deal_cards_to_table_test(app) {
		let game_self = this;

		/*game_self.updateLog(`

			dealing cards to a common pool requires creating and encrypting
			a deck, and then creating a POOL into which cards can be dealt
			so as to be publicly viewabble.

			as with the cards that are dealt to players, what are dealt to
			the pool are the INDEXES of cards that are in the associative array
			that constitutes the deck.
    `);

    game_self.addMove("LOGPOOL\t1");
    game_self.addMove("POOLDEAL\t3\t1\t1"); // deal 3 cards from deck-1 to pool-1
    game_self.addMove("POOL\t1"); // create pool with index 1 (pool-1)
    for (let i = game_self.game.players.length; i >= 1; i--) {
      game_self.addMove("DECKENCRYPT\t1\t"+i);
    }
    for (let i = game_self.game.players.length; i >= 1; i--) {
      game_self.addMove("DECKXOR\t1\t"+i);
    }
    game_self.addMove("DECK\t1\t" + JSON.stringify(game_self.returnDeck())); // create deck with index 1 (deck-1)
    game_self.endTurn();
    */
		game_self.addMove('LOGPOOL\t1');
		game_self.addMove('POOLDEAL\t3\t1\t1'); // deal 3 cards from deck-1 to pool-1
		game_self.addMove('POOL\t1'); // create pool with index 1 (pool-1)
		game_self.endTurn();
	}

	async shuffle_deck_test(app) {
		let game_self = this;

		game_self.updateLog(`

			shuffling a deck uses a random number to re-arrange the order of
			undealt (encrypted or unencrypted) cards. simply use the SHUFFLE
			instruction and deck-number and the game engine will handle this
			for all players, while keeping decryption keys in sync, etc.			
    `);

		game_self.addMove('NOTIFY\tDeck 1 shuffle complete');
		game_self.addMove('SHUFFLE\t1');
		game_self.addMove('DECK\t1\t' + JSON.stringify(game_self.returnDeck()));
		game_self.endTurn();
	}

	async receive_payment_test(app) {
		let game_self = this;

		let receiver = game_self.game.players[game_self.game.player - 1];
		let sender = receiver;
		for (let i = 0; i < game_self.game.players.length; i++) {
			if (game_self.game.players[i] != receiver) {
				sender = game_self.game.players[i];
				break;
			}
		}

		game_self.addMove(
			'RECEIVE' +
				'\t' +
				sender +
				'\t' +
				receiver +
				'\t' +
				'0.0001' +
				'\t' +
				new Date().getTime() +
				'\t' +
				game_self.game.crypto
		);
		game_self.addMove(
			'SEND' +
				'\t' +
				sender +
				'\t' +
				receiver +
				'\t' +
				'0.0001' +
				'\t' +
				new Date().getTime() +
				'\t' +
				game_self.game.crypto
		);
		game_self.endTurn();
	}

	async send_payment_test(app) {
		let game_self = this;

		let sender = game_self.game.players[game_self.game.player - 1];
		let receiver = sender;
		/*for (let i = 0; i < game_self.game.players.length; i++) {
      if (game_self.game.players[i] != sender) {
        receiver = game_self.game.players[i];
        break;
      }
    }*/

		let ts = new Date().getTime();
		this.rollDice();
		let uh = this.game.dice;
		game_self.addMove(
			`RECEIVE\t${sender}\t${receiver}\t0.0001\t${ts}\t${uh}\t${game_self.game.crypto}`
		);
		game_self.addMove(
			`SEND\t${sender}\t${receiver}\t0.0001\t${ts}\t${uh}\t${game_self.game.crypto}`
		);
		game_self.endTurn();
	}

	/*
  Game engine command BALANCE doesn't work very well.... or at all
  */
	async check_balance_test(app) {
		let game_self = this;

		let amount = 0;
		let address = game_self.game.keys[game_self.game.player - 1];
		let ticker = game_self.game.crypto;
		/*
    game_self.addMove("NOTIFY\tThe balance check is finished: balance adequate!");
    game_self.updateLog(`The game engine is checking to see if the balance at address ${address} is at least ${amount} ${ticker}. The game will halt for all players until the balance is at this amount.`);

    if (ticker != "") {
      game_self.addMove("BALANCE" + "\t" + amount + "\t" + address + "\t" + ticker);
    } else {
      game_self.addMove("BALANCE" + "\t" + amount + "\t" + address);
    }
    game_self.endTurn();
    */

		let current_balance = 0;
		game_self.updateStatus(`you have ${current_balance} ${ticker}`);
	}

	display_boardsizer_test(app) {
		if (this.game_boardsizer_visible == 0) {
			this.sizer.render();
			this.sizer.attachEvents();
			this.game_boardsizer_visible = 1;
		} else {
			//this.sizer.hide();
			this.game_boardsizer_visible = 0;
		}
	}

	display_cardfan_test(app) {
		if (this.game_cardfan_visible == 0) {
			this.cardfan.render();
			this.game_cardfan_visible = 1;
		} else {
			this.cardfan.hide();
			this.game_cardfan_visible = 0;
		}
	}

	display_cardhud_test(app) {
		let game_self = this;
		if (this.game_hud_visible == 0) {
			this.hud.render();
			if (this.game.deck[0].hand) {
				this.updateStatusAndListCards(
					'Here is my hand',
					this.game.deck[0].hand
				);
			} else {
				this.updateStatusWithOptions(
					'There are no cards to display',
					`<ul><li id="deal" class="hudmenuitem">Deal cards</li><li id="close" class="hudmenuitem">Close hud</li></ul>`
				);
				$('.hudmenuitem').off();
				$('.hudmenuitem').on('click', async function () {
					this.game_hud_visible = 0;
					let cid = $(this).attr('id');
					if (cid === 'deal') {
						game_self.deal_cards_to_player_test(game_self.app);
						game_self.display_cardhud_test(game_self.app);
						return;
					}
					if (cid === 'close') {
						game_self.hud.hide();
						return;
					}
				});
			}
			this.game_hud_visible = 1;
		} else {
			this.hud.hide();
			this.game_hud_visible = 0;
		}
	}

	toggle_cardbox_test(app) {
		this.hud.render();
		this.cardbox.render();

		if (this.game_cardbox_visible == 1) {
			this.game_cardbox_visible = 0;
			this.cardbox.disable();
			this.updateStatusAndListCards('cardbox disabled in hud');
		} else {
			this.game_cardbox_visible = 1;
			this.cardbox.addCardType('card', 'select', function (c) {
				salert(`You clicked on the ${c} card`);
			});
			this.updateStatusAndListCards('cardbox enabled in hud');
			this.cardbox.attachCardEvents();
		}
	}

	add_menu_test(app) {
		if (this.game_menu_visible == 0) {
			this.menu.render(this.app, this);
			this.menu.attachEvents(this.app, this);
			this.game_menu_visible = 1;
			this.updateLog('Show Menu');
		} else {
			this.menu.hide();
			this.game_menu_visible = 0;
			this.updateLog('Hide Menu');
		}
	}

	///////////////////
	// MISCELLANEOUS //
	///////////////////
	//
	// the contents of this function allow the Arcade to display and start games.
	// extending the respondTo function allows this module to return data to other
	// modules based on specific inbound requests. in this case we respond to the
	// request that checks if we can create games. The Arcade makes this request
	// when it loads to determine which modules support interactions with users
	// through the Arcade interface.
	//
	respondTo(type) {
		if (type == 'default-league') {
			return null;
		}
		return super.respondTo(type);
	}

	returnMainHTML() {
		return `<div class="gameboard" id="gameboard">
        <div class="test-buttons">
        <div>
          <h2>Interfaces</h2>
          <div class="button add_menu" id="add_menu_button">Toggle Menu</div>
          <div class="button display_overlay" id="display_overlay_button">Display Overlay</div>
        </div>

        <div>
          <h2>Decks</h2>
          <div class="button shuffle_cards" id="shuffle_deck_button">Shuffle Deck</div>
          <div class="button deal_cards_to_pile" id="deal_cards_to_player_button">Deal Cards to Players</div>
          <div class="button deal_cards_to_table" id="deal_cards_to_table_button">Deal Cards to Table</div>
        </div>

        <div>
          <h2 id="player_count">Players -- ${this.game.players.length}</h2>
          <div class="button" id="add_player">Add Player</div>
          <div class="button" id="subtract_player">Remove Player</div>
        </div>
        </div>
      </div>
      `;
	}

	returnCardGameHTML() {
		return ``;
	}

	returnBoardGameHTML() {
		return ``;
	}

	returnHexGameHTML() {
		return ``;
	}

	//"✔"
	updateMenuCheck() {
		try {
			Array.from(document.querySelectorAll('.game-type')).forEach(
				(mItem) => {
					mItem.textContent = mItem.textContent.replace('✔', '');
				}
			);
			//menu-num-players
			Array.from(document.querySelectorAll('.menu-num-players')).forEach(
				(mItem) => {
					mItem.textContent = mItem.textContent.replace('✔', '');
				}
			);

			switch (this.gameMode) {
			case 1:
				document.getElementById('game-cardgame').textContent += '✔';
				break;
			case 2:
				document.getElementById('game-boardgame').textContent +=
						'✔';
				break;
			case 3:
				document.getElementById('game-hexboard').textContent += '✔';
				break;
			default:
				document.getElementById('game-intro').textContent += '✔';
				break;
			}

			let divname = `menu-${this.game.players.length}-player`;
			document.getElementById(divname).textContent += '✔';
		} catch (err) {}
	}

	async adjustPlayers(numPlayers) {
		while (numPlayers < this.game.players.length) {
			this.removePlayer(this.game.players.pop());
		}
		while (numPlayers > this.game.players.length) {
			let pseudoAddress =
				'P' + this.app.crypto.hash(Math.random().toString(32));
			this.addPlayer(pseudoAddress);
		}

		if (this.game_playerboxes_visible) {
			let boxes = document.querySelectorAll('.player-box');
			for (let box of boxes) {
				box.remove();
			}
			this.game_playerboxes_visible = 0;
			this.add_player_boxes_test(this.app);
		}
	}
}

module.exports = GameTestSuite;
