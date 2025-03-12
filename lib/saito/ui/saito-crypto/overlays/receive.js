const ReceiveTemplate = require('./receive.template');
const SaitoOverlay = require('./../../saito-overlay/saito-overlay');

class Receive {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, mod, false);

		this.app.connection.on('saito-crypto-receive-render-request', (obj) => {
			this.receivePayment(this.app, this.mod, obj.sender, obj.receiver, obj.amount, obj.ts, obj.ticker, obj.mycallback);			
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
				ReceiveTemplate(app, mod, sobj),
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


}

module.exports = Receive;


