const CryptoModule = require('../../lib/templates/cryptomodule');

class TST extends CryptoModule {
	constructor(app) {
		super(app, 'TST');
		this.name = 'TST';
		this.ticker = 'TST';
		this.description =
			'This module implement CryptoModule functions without moving tokens';
		this.categories = 'Cryptocurrency';
		this.information =
			'This is some important information you may care to read about when enabling the TST crypto module';
		this.warning = 'The TST crypto module wishes you to read this warning';
		this.balance = (100*Math.random()).toFixed(8);
	}

	//
	// returns the web3 crypto address
	//
	returnAddress() {
		// just given them our Saito publickey - easy to test
		//console.log("TST return address: " + this.publicKey);

		//
		// Strange that this.publicKey is not intialized...
		//

		return this.app.wallet.publicKey;
	}

	//
	// returns the web3 crypto private key
	//
	async returnPrivateKey() {
		// just give them our Saito privatekey - easy to test
		return await this.app.wallet.returnPrivateKey();
	}

	//
	// fetches and returns the balance at the web3 crypto addresses
	//
	// @param {String} address in which to check balance
	// @return {Array} Array of {address: {String}, balance: {Int}}
	//
	async returnBalance(address = '') {
		return this.balance;
		//return '100.00000000';
	}

	//
	// sends a payment in amount requested to the specified address if possible
	//
	// @param {String} amount of tokens to send
	// @param {String} address of recipient
	// @return {Array} Array of {hash: {String}} where hash is the transaction_id
	//        of the transaction that makes this transfer on the external web3
	//        crypto.
	//
	async sendPayment(amounts = '', recipient = '', unique_hash = '') {
		return this.app.crypto.hash(Math.random().toString());
	}

	//
	// checks if a payment has been received at the web3 crypto address
	//
	// @param {String} amount of tokens to send
	// @param {String} sender of transfer
	// @param {String} recipient of transfer
	// @param {timestamp} timestamp after which transfer must have been made
	// @return {Array} Array of {hash: {String}} where hash is the transaction_id
	//
	async receivePayment(
		amount = '',
		sender = '',
		receiver = '',
		timestamp,
		unique_hash = ''
	) {
		if (Math.random() > 0.5) {
			return 1;
		}
		return 0;
	}

	async renderModalSelectCrypto(app, mod, cryptomod) {
		return WarningTemplate(await this.returnAddress());
	}

	attachEventsModalSelectCrypto(app, mod, cryptomod) {
		try {
			let dotgo = document.getElementById('dot-warning-confirm');
			if (dotgo) {
				dotgo.onclick = (e) => {
					cryptomod.modal_overlay.hide();
					app.connection.emit('header-update-balance');
				};
			}
		} catch (err) {
			console.log('ERROR ACTIVATING: ' + err);
		}
		return;
	}
}

module.exports = TST;
