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
		this.slug = 'crypto';
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

		app.connection.on('accept-game-stake', async (sobj) => {
			
			console.log("accept-game-stake sobj: ", sobj);

			await this.app.wallet.setPreferredCrypto(sobj.ticker);

			let current_balance = Number(await this.app.wallet.returnPreferredCryptoBalance());

			let network_fee = 0; 

		  let crypto_mod = this.app.wallet.returnPreferredCrypto();
	    await crypto_mod.checkWithdrawalFeeForAddress('', function(res){
	      network_fee = Number(res);
	    });

			let needed_balance = (typeof sobj.stake == "object") ? parseFloat(sobj.stake.min) : parseFloat(sobj.stake);
			
			console.log(current_balance, needed_balance, network_fee);

			needed_balance += network_fee;

			if (needed_balance > current_balance){

				this.app.connection.emit('saito-crypto-deposit-render-request', {
					ticker: sobj.ticker,
					amount: (needed_balance - current_balance),
				});
				return;
			}

			if (typeof sobj.stake == "object"){
				this.adjust_overlay.render(sobj, current_balance);
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
				if (!gm.game?.crypto || gm.game.crypto == ticker){
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

								game_mod.showStakeOverlay();
							
								return;
							}

							this.overlay.ticker = ticker;

							this.overlay.render((ticker, amount) => {
								game_mod.menu.hideSubMenus();
								game_mod.proposeGameStake(ticker, amount);
								app.browser.logMatomoEvent('StakeCrypto', 'viaGameMenu', ticker);
							});
						}
					});
				}
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

			this.min_balance = 0;

			let game_name = document.querySelector("input[name='game']")?.value;
			if (game_name){
				this.gm = this.app.modules.returnModuleByName(game_name);
				if (this.gm?.opengame){
					this.min_balance = -1;
				}
				if (!this.gm?.can_bet){
					return;
				}
			}else {
				return;
			}

			this.attachStyleSheets();

			this.balances = await this.app.wallet.returnAvailableCryptosAssociativeArray();

			this.app.browser.addElementToSelector(`<div class="game-wizard-crypto-hook"><i class="fa-solid fa-coins"></i></div>`, qs);

			let hook = document.querySelector(".game-wizard-crypto-hook");

			if (hook){
				hook.onclick = (e) => {

					this.overlay = new CryptoSelectAmount(this.app, this);
					this.overlay.fixed = false;

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


	includeFeeInMax(ticker) {
		let fee = 0;

    let crypto_mod = this.app.wallet.returnCryptoModuleByTicker(ticker);
    crypto_mod.checkWithdrawalFeeForAddress('', function(res){
      fee = Number(res);
    });

    let diff = Number(this.max_balance) - Number(fee);
    diff = parseFloat(diff.toFixed(8));

    if (diff < 0) {
      this.max_balance = 0;  
    } else {
      this.max_balance = diff;
    }

    return fee;
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
