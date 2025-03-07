const SendTemplate = require('./send.template');
const SaitoOverlay = require('./../../saito-overlay/saito-overlay');

class Send {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, mod, false);

		this.app.connection.on('saito-crypto-send-render-request', (obj) => {
			this.sendPayment(this.app, this.mod, obj.sender, obj.receiver, obj.amount, obj.ts, obj.ticker, obj.mycallback);
		});
	}

	render() {
	}

	attachEvents() {
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

			this.overlay.show(SendTemplate(app, mod, sobj));

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

}

module.exports = Send;


