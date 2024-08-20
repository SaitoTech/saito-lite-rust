const saito = require('./../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');
const CryptoSelectAmount = require('./lib/overlays/select-amount');
const CryptoInadequate = require('./lib/overlays/inadequate');
const AcceptStake = require('./lib/overlays/accept-stake');
const AdjustStake = require('./lib/overlays/adjust-stake');

class Crypto extends ModTemplate {
	constructor(app) {
		super(app);

		this.app = app;

		this.styles = ['/crypto/style.css'];

		this.name = 'Crypto';

		this.description = 'Enable crypto gaming';
		this.categories = 'Utility Entertainment';

		this.class = 'utility';

		this.balances = {};

		this.overlay = new CryptoSelectAmount(app, this);
		this.overlay_inadequate = new CryptoInadequate(app, this);
		this.approve_overlay = new AcceptStake(app, this);
		this.adjust_overlay = new AdjustStake(app, this);
		
	}

	async initialize(app) {
		await super.initialize(app);

		//
		// Turn on crypto for all games that don't explicity opt out
		//
		let mod_list = app.modules.returnModulesRespondingTo('arcade-games');
		for (let m of mod_list){
			if (m.can_bet !== 0) {
				m.can_bet = 1;
			}
		}

		app.connection.on('accept-game-stake', (sobj) => {
			if (isNaN(sobj.stake)){
				this.adjust_overlay.render(sobj);
			}else{
				this.approve_overlay.render(sobj);	
			}
		});

	}

	respondTo(type = '') {
		if (type == 'game-menu') {
			//
			// This should be a game module
			//
			let gm = this.app.modules.returnActiveModule();

			//
			// If it isn't a game module or a bettable game
			//
			if (!gm?.game?.cryptos) {
				return null;
			}

			//
			// Returns an object of CRYPTO(string): MAX_BET(float)
			//
			let ac = this.calculateAvailableCryptos(gm.game.cryptos);

			let menu = {
				id: 'game-crypto',
				text: 'Crypto',
				submenus: []
			};

			for (let ticker in ac) {
				menu.submenus.push({
					parent: 'game-crypto',
					text: ticker,
					id: 'game-crypto-' + ticker,
					class: 'game-crypto-ticker',
					callback: async (app, game_mod) => {
						this.attachStyleSheets();

						this.max_balance = ac[ticker];
						this.min_balance = game_mod?.opengame ? this.max_balance : -1;

						if (
							game_mod.game.crypto &&
							game_mod.game.crypto != 'CHIPS'
						) {

							if (typeof game_mod.game.stake === "object"){
								let str = "";
								for (let i in game_mod.game.stake){
									if (i !== 'min'){
										str += `${game_mod.app.keychain.returnUsername(i)}: ${game_mod.game.stake[i]}${game_mod.game.crypto} / `
									}
								}
								str = str.substring(0, str.length - 3);
								salert(`${str} staked on this game`);
							}else{
								salert(
									`${game_mod.game.stake} ${game_mod.game.crypto} staked on this game!`
								);
							}
							return;
						}

						this.overlay.ticker = ticker;

						this.overlay.render((ticker, amount) => {
							game_mod.menu.hideSubMenus();
							game_mod.proposeGameStake(ticker, amount);
						});
					}
				});
			}


			if (Object.keys(ac).length == 0) {
				menu.submenus.push({
					parent: 'game-crypto',
					text: 'No Cryptos Available',
					id: 'game-crypto-none',
					class: 'game-crypto-none',
					callback: (app, game_mod) => {
						game_mod.menu.hideSubMenus();
						salert(
							'Players do not have any common crypto to play with...'
						);
					}
				});
			}

			return menu;
		}

		return super.respondTo(type);
	}

	async renderInto(qs) {
		if (qs == "#arcade-advance-opt"){

			this.balances = await this.app.wallet.returnAvailableCryptosAssociativeArray();
			console.log("Available Balances: ", this.balances);
			
			this.attachStyleSheets();
			this.overlay = new CryptoSelectAmount(this.app, this);
			this.overlay.fixed = false;
			this.app.browser.addElementToSelector(`<div class="game-wizard-crypto-hook"><i class="fa-solid fa-coins"></i></div>`, qs);

			let hook = document.querySelector(".game-wizard-crypto-hook");
			let game_name = document.querySelector("input[name='game']")?.value;
			this.min_balance = 0;

			if (game_name){
				let gm = this.app.modules.returnModuleByName(game_name);
				if (gm?.opengame){
					this.min_balance = -1;
				}
			}
			hook.onclick = (e) => {

				if (hook.dataset?.amount){
					this.overlay.stake = hook.dataset.amount;
				}

				this.overlay.render((ticker, amount, match_amount = null) => {
					console.log("SELECTED CRYPTO: ", ticker, amount, match_amount);
					hook.dataset["ticker"] = ticker;
					hook.dataset["amount"] = amount;
					if (match_amount !== null){
						hook.dataset["match"] = match_amount;	
					}
				});
			}
		}
	}


	/**
	 * We have a list of each players available cryptos and balances, so
	 * we want to calculate an intersection and minimum operation
	 */
	calculateAvailableCryptos(crypto_array) {
		let union = [];

		for (let player in crypto_array) {
			for (let c in crypto_array[player]) {
				if (!union.includes(c)) {
					union.push(c);
				}
			}
		}

		let intersection = {};

		for (let c of union) {
			let min = 0;
			for (let player in crypto_array) {
				if (crypto_array[player][c]) {
					let value = parseFloat(crypto_array[player][c].balance);
					if (min) {
						min = Math.min(min, value);
					} else {
						min = value;
					}
				} else {
					min = -1;
					break;
				}
			}

			if (min > 0) {
				intersection[c] = min;
			}
		}

		return intersection;
	}






	returnCryptoOptionsHTML(values = null) {
		values = values || [0.001, 0.01, 0.1, 1, 5, 10, 50, 100, 500, 1000];
		let html = `
        <div class="overlay-input">
          <label for="crypto">Crypto:</label>
          <select id="crypto" name="crypto">
            <option value="" selected>none</option>`;

		let listed = [];
		for (let i = 0; i < this.app.modules.mods.length; i++) {
			if (
				this.app.modules.mods[i].ticker &&
				!listed.includes(this.app.modules.mods[i].ticker)
			) {
				html += `<option value="${this.app.modules.mods[i].ticker}">${this.app.modules.mods[i].ticker}</option>`;
				listed.push(this.app.modules.mods[i].ticker);
			}
		}

		html += `</select></div>`;

		html += `<div id="stake_input" class="overlay-input" style="display:none;">
                <label for="stake">Stake:</label>
                <select id="stake" name="stake">`;

		for (let i = 1; i < values.length; i++) {
			html += `<option value="${values[i]}" >${values[i]}</option>`;
		}
		html += `</select></div>`;

		return html;
	}
}

module.exports = Crypto;
