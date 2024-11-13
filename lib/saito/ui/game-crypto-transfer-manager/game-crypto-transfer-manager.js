//const GameCryptoTransferManagerTemplate = require('./game-crypto-transfer-manager.template'); //Not Used
const GameCryptoTransferManagerSendTemplate = require('./game-crypto-transfer-manager-send.template');
const GameCryptoTransferManagerReceiveTemplate = require('./game-crypto-transfer-manager-receive.template');
const GameCryptoTransferManagerBalanceTemplate = require('./game-crypto-transfer-manager-balance.template');
const SaitoOverlay = require('./../saito-overlay/saito-overlay');

/**
 * A tool, integrated in GameTemplate, to facilitate the transfer of cryptos
 * by populating an overlay with basic forms and getting confirmation from the user
 *
 *
 */
class GameCryptoTransferManager {
	/**
	 * @constructor
	 * @param app - the Saito Application
	 */
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = container;
		this.overlay = new SaitoOverlay(app, mod, false);
	}

	render() {}

	attachEvents() {}

	/**
	 * Display an overlay with the given public key address and ticker (currency)
	 * @param app - the Saito application
	 * @param mod - the containing module
	 * @param address - a public key address
	 * @param ticker {string} - name of a currency
	 * @mycallback - an optional callback function that never gets called
	 */
	async returnBalance(app, mod, address, ticker, mycallback = null) {
		try {
			let sobj = {};
			sobj.address = address;
			sobj.ticker = ticker;

			this.overlay.closebox = false;
			this.overlay.show(
				GameCryptoTransferManagerBalanceTemplate(app, sobj)
			);
			this.overlay.blockClose();
			let cryptoMod = app.wallet.returnCryptoModuleByTicker(ticker);
			let current_balance = await cryptoMod.returnBalance();

			let spinner = document.querySelector('.spinner');
			if (spinner) {
				spinner.remove();
			}

			let balanceDiv = document.querySelector('#crypto_balance');
			let confirmBtn = document.querySelector('#crypto_balance_btn');

			if (balanceDiv) {
				balanceDiv.textContent = current_balance
					? sanitize(current_balance)
					: 'Crypto unavailable';
				balanceDiv.classList.remove('hidden');
			}

			if (confirmBtn) {
				confirmBtn.classList.remove('hidden');
				confirmBtn.onclick = (e) => {
					this.hideOverlay(mycallback);
				};
			} else {
				this.hideOverlay(mycallback);
			}
			return current_balance;
		} catch (err) {
			console.log(err);
		}
	}

	/**
	 * Display an overlay to confirm a crypto transfer
	 * @param app - the Saito application
	 * @param mod - the containing module
	 * @param sender - a public key address of sender
	 * @param receiver - public key address of receiver
	 * @param amount - the amount of crypto
	 * @param ts (unused)
	 * @param ticker {string} - name of a currency
	 * @mycallback - an optional callback function to run on confirmation
	 */
	sendPayment(
		app,
		mod,
		sender,
		receiver,
		amount,
		ts,
		ticker,
		mycallback = null
	) {
		try {
			let this_self = this;
			let sobj = {};
			sobj.amount = amount;
			sobj.from = sender;
			sobj.to = receiver;
			sobj.ticker = ticker;

			sobj.crypto_transfers_outbound_trusted = 
			(app.options.gameprefs.crypto_transfers_outbound_trusted != null) ? 
			app.options.gameprefs.crypto_transfers_outbound_trusted : 1;
			
			sobj.crypto_transfers_inbound_trusted = 
			(app.options.gameprefs.crypto_transfers_inbound_trusted != null) ? 
			app.options.gameprefs.crypto_transfers_inbound_trusted : 1;
			
			if (mod?.game?.over == 0) {
				this.overlay.closebox = false;
				this.overlay.blockClose();
			} else {
				this.overlay.closebox = true;
			}

			this.overlay.show(GameCryptoTransferManagerSendTemplate(app, mod, sobj));

			if (mod?.game?.over == 1) {
				return mycallback();
			}

			if (app.options.gameprefs.crypto_transfers_outbound_trusted == 1) {
				setTimeout(function() {
					this_self.hideOverlay(mycallback);
				}, 3000);
			} else {
				document.querySelector('.crypto_transfer_btn').onclick = async(e) => {
					let ignoreBtn = document.querySelector('#ignore_checkbox');
					if (ignoreBtn) {
						app.options.gameprefs.crypto_transfers_outbound_trusted = ignoreBtn.checked ? 1 : 0;
						await app.wallet.saveWallet();
					}

					this.hideOverlay(mycallback);
				};
			}
		} catch (err) {
			console.log(err);
		}
	}

	/**
	 * Display an overlay to confirm a crypto transfer
	 * @param app - the Saito application
	 * @param mod - the containing module
	 * @param sender - a public key address of sender
	 * @param receiver - public key address of receiver
	 * @param amount - the amount of crypto
	 * @param ts (unused)
	 * @param ticker {string} - name of a currency
	 * @mycallback - an optional callback function to run on confirmation
	 */
	async receivePayment(
		app,
		mod,
		sender,
		receiver,
		amount,
		ts,
		ticker,
		mycallback = null
	) {
		try {
			let this_self = this;
			let sobj = {};
			sobj.amount = amount;
			sobj.from = sender;
			sobj.to = receiver;
			sobj.ticker = ticker;

			sobj.crypto_transfers_outbound_trusted = 
			(app.options.gameprefs.crypto_transfers_outbound_trusted != null) ? 
			app.options.gameprefs.crypto_transfers_outbound_trusted : 1;
			
			sobj.crypto_transfers_inbound_trusted = 
			(app.options.gameprefs.crypto_transfers_inbound_trusted != null) ? 
			app.options.gameprefs.crypto_transfers_inbound_trusted : 1;
			
			if (mod?.game?.over == 1) {
				this.overlay.closebox = true;
			}

			//
			// if someone closes the overlay, just continue executing
			//
			this.overlay.show(
				GameCryptoTransferManagerReceiveTemplate(app, mod, sobj),
				() => {
					return mycallback(null, null, 1);
				}
			);

			if (mod?.game?.over == 1) {
				return mycallback(document.querySelector('#auth_title'), this_self.overlay);
			} else {
				this.overlay.blockClose();
			}
			
			if (mycallback != null) {
				if (app.options.gameprefs.crypto_transfers_inbound_trusted == 1) {
					setTimeout(function(){
						this_self.hideOverlay();
						mycallback(null, null, 1);
					}, 3000);

				} else {
					mycallback(document.querySelector('#auth_title'), this_self.overlay);

					let confirmBtn = document.querySelector('#crypto_receipt_btn');
					let ignoreBtn = document.querySelector('.ignore_checkbox');

					if (confirmBtn) {
						confirmBtn.onclick = async (e) => {					
							app.options.gameprefs.crypto_transfers_inbound_trusted = ignoreBtn.checked ? 1 : 0;
							await this_self.app.wallet.saveWallet();

							this_self.hideOverlay();
							mycallback();
						};
					}

					if (ignoreBtn) {
						ignoreBtn.onchange = (e) => {
							ignoreBtn.checked ? confirmBtn.classList.remove("disabled") : confirmBtn.classList.add("disabled"); 
						};
					}
				}
			}

		} catch (err) {
			console.log(err);
		}
	}


	/**
	 *  Programmatically close the overlay
	 */
	hideOverlay(mycallback = null) {
		this.overlay.hide();
		if (mycallback) {
			mycallback();
		}
	}
}

module.exports = GameCryptoTransferManager;
