const CryptoModule = require('../../lib/templates/cryptomodule');

class TST extends CryptoModule {
	constructor(app) {
		super(app, "TST");

		this.slug = 'tst';

		this.description =
			'This module implement CryptoModule functions without moving tokens';
		this.information =
			'This is some important information you may care to read about when enabling the TST crypto module';
		this.warning = 'The TST crypto module wishes you to read this warning';

	}

	//
	// returns the web3 crypto address
	//
	returnAddress() {
		// just given them our Saito publickey - easy to test
		//console.log("TST return address: " + this.publicKey);

		return this.address;
	}

	async activate(){

		if (!this.isActivated()){

			if (!this?.address){
				this.privateKey = this.app.crypto.generateKeys();
				this.address = this.app.crypto.generatePublicKey(this.privateKey);			
			}

			if (Number(this.balance) == 0){
				this.balance = (100*Math.random()).toFixed(8);
			}

			this.app.connection.emit('header-install-crypto', this.ticker);
			this.save();
		}
		
		await super.activate();
	}

	//
	// returns the web3 crypto private key
	//
	async returnPrivateKey() {
		// just give them our Saito privatekey - easy to test
		return this.privateKey;
	}

	async checkBalance(){
		return 0;
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


	async checkWithdrawalFeeForAddress(address="", callback){
		callback(0.005);
	}

	respondTo(type = '', obj) {
		if (type == 'crypto-logo') {
			if (obj?.ticker == this.ticker) {
				return null;
			}
		}

		return null;
	}

}

module.exports = TST;
