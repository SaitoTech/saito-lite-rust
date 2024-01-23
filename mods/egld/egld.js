/*********************************************************************************

   returnAddress()
   returnPrivateKey()
   async returnBalance(address = "")
   async sendPayment(amount="", recipient="", unique_hash="")
   async receivePayment(amount="", sender="", recipient="", timestamp=0, unique_hash="")

**********************************************************************************/
const {
	ApiNetworkProvider
} = require('@elrondnetwork/erdjs-network-providers');
const { TokenPayment } = require('@elrondnetwork/erdjs');
const axios = require('axios');
const {
	account: Account,
	transaction: Transaction
} = require('@elrondnetwork/elrond-core-js');
const CryptoModule = require('../../lib/templates/cryptomodule');

class EGLDModule extends CryptoModule {
	constructor(app, mod) {
		super(app);
		this.app = app;
		this.ticker = 'EGLD';
		this.name = 'EGLD';
		this.categories = 'Cryptocurrency';
		this.balance = 0;
		this.egld = {};
		this.base_url = '';
		// this.base_url = "https://elrond.saito.io/0"
		this.api_network_provider = 'https://devnet-api.elrond.com';
		this.has_loaded = false;
	}

	async initialize() {
		if (!this.has_loaded) {
			try {
				const res = await axios({
					method: 'get',
					url: 'https://elrond.saito.io/0/hello'
				});
				this.base_url = 'https://elrond.saito.io/0';
			} catch (error) {
				this.base_url = 'https://elrond-api-devnet.public.blastapi.io';
			} finally {
				this.createEGLDAccount();
				this.networkProvider = new ApiNetworkProvider(
					this.api_network_provider
				);
				let address = this.egld.keyfile.bech32;
				await this.updateBalance(address);
				await this.updateAddressNonce(address);
				console.log('base url', this.base_url);
				this.has_loaded = true;
			}
		}

		// check saito api status periodically, use fallback if it fails
		setInterval(async () => {
			try {
				const res = await axios({
					method: 'get',
					url: 'https://elrond.saito.io/0/hello'
				});
				this.base_url = 'https://elrond.saito.io/0';
			} catch (error) {
				this.base_url = 'https://elrond-api-devnet.public.blastapi.io';
			}
		}, 60000);
	}

	async sendPayment(amount, recipient, unique_hash = '') {
		let from = this.egld.keyfile.bech32;
		let config = await this.networkProvider.getNetworkConfig();
		let nonce = await this.nonce;
		console.log('nonce ', nonce);
		let tokenPayment = TokenPayment.egldFromAmount(String(amount));
		let value = BigInt(amount * 10 ** tokenPayment.numDecimals);
		console.log('value ', value.toString());
		const balance = await this.returnBalance(from);
		if (parseFloat(balance) < parseFloat(value.toString())) {
			return console.log(
				'your balance is not enough for this transaction',
				balance
			);
		}
		let to = recipient;
		let tx = new Transaction({
			nonce,
			from,
			to,
			senderUsername: '',
			receiverUsername: '',
			value: value.toString(),
			gasPrice: 1000000000,
			gasLimit: 70000,
			data: '',
			chainID: config.ChainID,
			version: 1
		});
		try {
			let serializedTx = tx.prepareForSigning();
			tx.signature = this.egld.account.sign(serializedTx);
			let signedtx = tx.prepareForNode();
			signedtx.chainId = config.ChainID;
			let signedTxJson = JSON.stringify(signedtx, null, 4);

			let res = await axios({
				method: 'post',
				url: `${this.base_url}/transactions`,
				data: signedtx
			});

			console.log('transaction successful', res);

			await this.updateAddressNonce(from);

			return res.data.txHash;
		} catch (error) {
			console.log(error, 'error');
		}
	}

	async receivePayment(
		amount = '',
		sender = '',
		recipient = '',
		timestamp = 0,
		unique_hash = ''
	) {
		const res = await axios({
			method: 'get',
			url: `${this.base_url}/accounts/${recipient}/transfers?sender=${sender}`
		});
		//    console.log(res.data)

		let toReturn = null;

		for (let i = 0; i < res.data.length; i++) {
			if (res.data[i].timestamp > timestamp) {
				let amountRes = TokenPayment.egldFromBigInteger(
					res.data[i].value
				);
				let amountSent = TokenPayment.egldFromAmount(String(amount));
				// console.log(amountRes.toString(), amountSent.toString())
				if (
					parseFloat(amountRes.toString()) ===
					parseFloat(amountSent.toString())
				) {
					toReturn = 1;
					// console.log(res.data[i], "actual transaction");
				}
			}
		}
		return toReturn;
	}

	async returnBalance(address) {
		let res = await axios({
			method: 'get',
			url: `${this.base_url}/address/${address}/balance`,
			data: ''
		});
		this.balance = res.data.data.balance;
		return res.data.data.balance;
	}

	returnAddress() {
		return this.egld.keyfile.bech32;
	}

	async getAddressNonce(address) {
		const res = await axios({
			method: 'get',
			url: `${this.base_url}/address/${address}/nonce`
		});
		let nonce = res.data.data.nonce;
		//    console.log(res, 'data')
		return nonce;
	}

	async updateAddressNonce(address) {
		const res = await axios({
			method: 'get',
			url: `${this.base_url}/address/${address}/nonce`
		});

		this.nonce = res.data.data.nonce;
	}

	incrementNonce(nonce) {
		return nonce + 1;
	}

	returnPrivateKey() {
		return this.egld.account.privateKey;
	}

	async updateBalance(address) {
		let balance = await this.returnBalance(address);
		balance = TokenPayment.egldFromBigInteger(balance);
		this.balance = balance.toPrettyString();
		console.log('egld balance', this.balance);
	}

	async createEGLDAccount() {
		if (this.app.options.egld) {
			let keyfile = this.app.options.egld.keyfile;
			let account = new Account(
				this.app.options.egld.keyfile,
				this.app.options.egld.password
			);
			this.egld.keyfile = keyfile;
			this.egld.account = account;
		} else {
			let password = this.app.crypto
				.generateRandomNumber()
				.substring(0, 8);
			//   let password = "password"
			let keyfile = new Account().initNewAccountFromPassword(password);
			let account = new Account().loadFromKeyFile(keyfile, password);
			this.egld.keyfile = keyfile;
			this.egld.account = account;
			this.app.options.egld = { keyfile, password };
			this.app.storage.saveOptions();

			// let keyfile =  {
			//     "version": 4,
			//     "id": "7ec57842-6808-4b24-acad-4ea97b004be2",
			//     "address": "573f7f00a6c99fa399eb969ae08a73891bd46484a10f44c6207c3a8ef5e16840",
			//     "bech32": "erd12ulh7q9xex068x0tj6dwpznn3ydageyy5y85f33q0sagaa0pdpqqal879j",
			//     "crypto": {
			//       "ciphertext": "e4ffc0b7aa7a269d347c25c440c279692379bd3cf525781711b6ad0830bfeed53ac705a91141c3e126c5b97178e1113019c4fd7975a23637733498cb5bb0f240",
			//       "cipherparams": {
			//         "iv": "604826587f31bdf765ca28115cd2d588"
			//       },
			//       "cipher": "aes-128-ctr",
			//       "kdf": "scrypt",
			//       "kdfparams": {
			//         "dklen": 32,
			//         "salt": "e0a132cd73464e414e94c21d453f52407918895b9d586316950c74e9fd4c8848",
			//         "n": 4096,
			//         "r": 8,
			//         "p": 1
			//       },
			//       "mac": "c8770053d62c66ddb0e2d5105dd6dc7c72b05b2476867db7a3667f245b6aa260"
			//     }
			//   }

			//   let account = new Account(keyfile, password);
			//   this.egld.keyfile = keyfile;
			//   this.egld.account = account;
			//   this.app.options.egld = {keyfile, password}
			//   this.app.storage.saveOptions();
			// }
		}
	}
}

module.exports = EGLDModule;
