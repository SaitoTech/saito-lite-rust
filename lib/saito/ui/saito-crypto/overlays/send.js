const SendTemplate = require('./send.template');
const SaitoOverlay = require('./../../saito-overlay/saito-overlay');
const SaitoUser = require('./../../saito-user/saito-user');

class Send {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, mod, false);

		this.overlay.clickBackdropToClose = false;

		this.counter_party = new SaitoUser(this.app, this.mod, "#send-crypto-request-container .counterparty-details");

		this.app.connection.on('saito-crypto-send-render-request', (details) => {
			this.render(details);
		});

		this.app.connection.on('saito-crypto-send-confirm', (rtnValue) => {

			this.updateOverlay(rtnValue);
		});
	}

	/**
	 * Shows a confirmation overlay before initiating a crypto transfer
	 * @param ticker { string } - name of a currency
	 * @param amount { string } - the amount of crypto
	 * @param publicKey { string } - Saito public key of recipient
	 * @param address { string } - address of receiver (for currency)
	 * @param trusted { boolean } - flag for whether to autoprocess
	 * @param mycallback { function} - to run when approved
	 * 
	 */ 
	render(details) {
		
		//
		// Verify complete information
		//
		if (!details?.ticker || !details?.amount){
			console.error("Missing ticker/amount in Send Crypto Overlay");
			return;
		}

		if (!details?.publicKey || !details?.address){
			console.error("Missing address in Send Crypto Overlay");
			return;
		}

		this.overlay.show(SendTemplate(this.app, this.mod, details));

		this.counter_party.publicKey = details.publicKey;

		this.counter_party.render();

		let html = `
			<div class="profile-public-key">
				<div>${details.address.slice(0, -6)}</div>
                <div>${details.address.slice(-6)}</div>
            </div>`;

		this.counter_party.updateUserline(html);

		if (details?.mycallback){
			details.mycallback();	
		}

		this.attachEvents();

		if (details?.trusted){
			console.log("Trusted!");
			this.timeout = setTimeout(()=> { 
				this.overlay.close(); 
				this.timeout = null;
			}, 3000);

			this.countDown();
		}

	}

	countDown() {
		// Countdown clock
		setTimeout(() => {
			let c = document.querySelector("#send-crypto-request-container .crypto-transfer-countdown span");
			if (c){
				let value = parseInt(c.innerHTML);
				value = Math.max(value-1, 0);
				c.innerHTML = value.toString();
				this.countDown();
			}
		}, 900);
	}

	attachEvents() {
		if (document.getElementById('send_crypto_transfer_btn')){
			document.getElementById('send_crypto_transfer_btn').onclick = (e) => {
				let ignoreBtn = document.querySelector('#ignore_checkbox');
				if (ignoreBtn?.checked){
					this.mod.saveGamePreference("crypto_transfers_outbound_trusted", 1);
				}
				this.overlay.close();
			};
		}
	}

	updateOverlay(results){

		let success = results?.hash && !results?.err;

		if (document.getElementById("send-crypto-request-container")){
			document.querySelector('#spinner').style.display = 'none';

			if (success){
				document.querySelector('#auth_title').innerHTML = `Crypto Sent Successfully`;
				document.querySelector('#game-crypto-icon').style.display = 'block';
			}else{
				document.querySelector('#auth_title').innerHTML = `Crypto Transfer Failed`;
				document.querySelector('#game-crypto-failure-icon').style.display = 'block';
			}
		
			if (this.timeout) {
				clearTimeout(this.timeout);
				setTimeout(() => { 
					this.overlay.close(); 
					this.timeout = null;
				}, 3000);
				document.querySelector("#send-crypto-request-container .crypto-transfer-countdown span").innerHTML = 3;
			}

		}


	}


}

module.exports = Send;


