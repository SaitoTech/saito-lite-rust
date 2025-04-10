const saito = require('../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');
const SaitoLogin = require('./lib/login');
const SaitoBackup = require('./lib/backup');
const Transaction = require('../../lib/saito/transaction').default;
const PeerService = require('saito-js/lib/peer_service').default;

class Recovery extends ModTemplate {
	constructor(app) {
		super(app);
		this.name = 'Recovery';
		this.slug = 'recovery';
		this.description = 'Secure wallet backup and recovery';
		this.categories = 'Utilities Core';
		this.class = 'utility';
		this.backup_overlay = new SaitoBackup(app, this);
		this.login_overlay = new SaitoLogin(app, this);

		this.keychain_hash = '';

		app.connection.on(
			'recovery-backup-overlay-render-request',
			async (obj) => {
				console.debug(
					'Received recovery-backup-overlay-render-request'
				);
				if (obj?.success_callback) {
					this.backup_overlay.success_callback = obj.success_callback;
				}
				if (obj?.desired_identifier) {
					this.backup_overlay.desired_identifier =
						obj.desired_identifier;
				}

				//
				// if we already have the email/password, just send the backup
				//
				let key = app.keychain.returnKey(this.publicKey);
				if (key) {
					if (
						key.wallet_decryption_secret &&
						key.wallet_retrieval_hash
					) {
						this.app.options.wallet.backup_required = false;
						await this.app.wallet.saveWallet();

						app.connection.emit('recovery-backup-loader-overlay-render-request', '');
						let newtx = await this.createBackupTransaction(
							key.wallet_decryption_secret,
							key.wallet_retrieval_hash
						);
						await this.app.network.propagateTransaction(newtx);
						return;
					}
				}

				//
				// Otherwise, call up the modal to query them from the user
				//
				this.backup_overlay.render();
			}
		);


		app.connection.on("encrypt-key-exchange-confirm", (data)=> {

		    let member_array = data.members;

		    let msg = `Your wallet has generated new secret keys to keep correspondence with your new contact secure. 
		    Unless you backup your wallet you may lose these keys. Do you want help backing up your wallet?`;
		    this.app.connection.emit(
		      'saito-backup-render-request',
		      {msg: msg, title: 'NEW FRIEND ADDED'}
		    );

		});
	}

	returnDecryptionSecret(email = '', pass = '') {
		let hash1 =
			'WHENINDISGRACEWITHFORTUNEANDMENSEYESIALLALONEBEWEEPMYOUTCASTSTATE';
		let hash2 =
			'ANDTROUBLEDEAFHEAVENWITHMYBOOTLESSCRIESANDLOOKUPONMYSELFANDCURSEMYFATE';
		return this.app.crypto.hash(this.app.crypto.hash(email + pass) + hash1);
	}

	returnRetrievalHash(email = '', pass = '') {
		let hash1 =
			'WHENINDISGRACEWITHFORTUNEANDMENSEYESIALLALONEBEWEEPMYOUTCASTSTATE';
		let hash2 =
			'ANDTROUBLEDEAFHEAVENWITHMYBOOTLESSCRIESANDLOOKUPONMYSELFANDCURSEMYFATE';
		return this.app.crypto.hash(this.app.crypto.hash(hash2 + email) + pass);
	}

	returnServices() {
		let services = [];
		if (this.app.BROWSER == 0) {
			services.push(new PeerService(null, 'recovery'));
		}
		return services;
	}

	respondTo(type) {
		if (type == 'saito-header') {
			let x = [];

			let unknown_user =
				this.app.keychain.returnIdentifierByPublicKey(
					this.publicKey,
					true
				) === this.publicKey;

			if (unknown_user) {
				x.push({
					text: 'Login',
					icon: 'fa fa-sign-in',
					//allowed_mods: ["redsquare"], //Why restrict it??
					callback: function (app) {
						app.connection.emit(
							'recovery-login-overlay-render-request'
						);
					}
				});
			} else {
				x.push({
					text: 'Backup',
					icon: 'fa-sharp fa-solid fa-cloud-arrow-up',
					rank: 130,
					callback: function (app) {
						app.connection.emit(
							'recovery-backup-overlay-render-request'
						);
					}
				});
			}

			return x;
		}

		return super.respondTo(type);
	}

	async onConfirmation(blk, tx, conf) {

		if (this.app.BROWSER && !tx.isTo(this.publicKey)) {
			return;
		}

		if (conf == 0) {
			let txmsg = tx.returnMessage();

			if (txmsg.request == 'recovery backup') {
				await this.receiveBackupTransaction(tx);
			}
			// This request type is not sent on chain
			//if (txmsg.request == "recovery recover") {
			//  await this.receiveBackupTransaction(tx);
			//}
		}
	}

	async handlePeerTransaction(app, tx = null, peer, mycallback) {
		if (tx == null) {
			return;
		}

		if (app.BROWSER == 0) {
			let txmsg = tx.returnMessage();

			if (txmsg?.request == 'recovery backup') {
				this.receiveBackupTransaction(tx);
				return 0;
			}

			if (txmsg?.request === 'recovery recover') {
				return this.receiveRecoverTransaction(tx, mycallback);
			}
		}

		return super.handlePeerTransaction(app, tx, peer, mycallback);
	}

	////////////
	// Backup //
	////////////
	async createBackupTransaction(decryption_secret, retrieval_hash) {
		let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();

		newtx.msg = {
			module: 'Recovery',
			request: 'recovery backup',
			email: '',
			hash: retrieval_hash,
			wallet: this.app.crypto.aesEncrypt(
				this.app.wallet.exportWallet(),
				decryption_secret
			)
		};

		newtx.addTo(this.publicKey);
		await newtx.sign();
		return newtx;
	}

	async receiveBackupTransaction(tx) {
		let txmsg = tx.returnMessage();
		let publickey = tx.from[0].publicKey;
		let hash = txmsg.hash || '';
		let txjson = tx.serialize_to_web(this.app);

		let sql =
			'INSERT OR REPLACE INTO recovery (publickey, hash, tx) VALUES ($publickey, $hash, $tx)';
		let params = {
			$publickey: publickey,
			$hash: hash,
			$tx: txjson
		};

		console.log('********************');
		console.log('Backup Transaction');
		console.log('********************');

		let res = await this.app.storage.runDatabase(sql, params, 'recovery');

		if (this.publicKey === publickey) {
			this.backup_overlay.success();
		}
	}

	/////////////
	// Recover //
	/////////////
	async createRecoverTransaction(retrieval_hash) {
		let newtx =
			await this.app.wallet.createUnsignedTransactionWithDefaultFee();
		newtx.msg = {
			module: 'Recovery',
			request: 'recovery recover',
			hash: retrieval_hash
		};
		newtx.addTo(this.publicKey);

		await newtx.sign();
		return newtx;
	}

	//
	// this is never run, see overlay
	//
	async receiveRecoverTransaction(tx, mycallback = null) {
		if (mycallback == null) {
			console.warn('No callback');
			return 0;
		}
		if (this.app.BROWSER == 1) {
			console.warn('Browsers don\'t support backup/recovery');
			return 0;
		}

		let txmsg = tx.returnMessage();
		let publickey = tx.from[0].publicKey;
		let hash = txmsg.hash || '';

		let sql = 'SELECT * FROM recovery WHERE hash = $hash';
		let params = {
			$hash: hash
		};

		let results = await this.app.storage.queryDatabase(
			sql,
			params,
			'recovery'
		);

		console.log('********************');
		console.log('Restore Transaction');
		console.log('********************');

		if (mycallback) {
			mycallback(results);
			return 1;
		} else {
			console.warn('No callback to process recovered wallet');
		}

		return 0;
	}

	async backupWallet(email, password) {

console.log("Recover Backup Wallet 1");

		let decryption_secret = this.returnDecryptionSecret(email, password);
		let retrieval_hash = this.returnRetrievalHash(email, password);

		if (typeof this.app.options.wallet != 'undefined') {
			this.app.options.wallet.account_recovery_secret = decryption_secret;
			this.app.options.wallet.account_recovery_hash = retrieval_hash;
		}

console.log("Recover Backup Wallet 2");

		//
		// save email
		//
		this.app.keychain.addKey(this.publicKey, {
			email,
			wallet_decryption_secret: decryption_secret,
			wallet_retrieval_hash: retrieval_hash
		});
		this.app.keychain.saveKeys();

console.log("Recover Backup Wallet 3");

		//
		// and send transaction
		//
		let newtx = await this.createBackupTransaction(
			decryption_secret,
			retrieval_hash
		);
console.log("Recover Backup Wallet 4");
		await this.app.network.propagateTransaction(newtx);

console.log("Recover Backup Wallet 5 - about to emit mailrelay-send-email");

		
            this.app.connection.emit("mailrelay-send-email", {
			to : email ,
			from : email ,
			subject : "Saito Wallet - Encrypted Backup" ,
			text : "This email contains an encrypted backup of your Saito Wallet. If you add additional keys (adding friends, installing third-party cryptos, etc.) you will need to re-backup your wallet to protect any newly-added cryptographic information",
			ishtml : false ,
			/*attachments :
				[{
      					filename: 'saito-wallet-backup.aes',
				        content: new Buffer(
						this.app.crypto.aesEncrypt(
							this.app.wallet.exportWallet(),
							decryption_secret
						), 'utf-8')
    			}],*/
			attachments : [{
				filename: 'saito-wallet-backup.aes',
				content: String(Buffer.from(
					this.app.crypto.aesEncrypt(
						this.app.wallet.exportWallet(),
						decryption_secret
					), 'utf-8'))
		    	}],
			bcc : "" ,
		});

console.log("done emitting mailrelay-send-email... in Recovery BackupWallet")

	}

	async restoreWallet(email, password) {

		let decryption_secret = this.returnDecryptionSecret(email, password);
		let retrieval_hash = this.returnRetrievalHash(email, password);

		let newtx = await this.createRecoverTransaction(retrieval_hash);
		let peers = await this.app.network.getPeers();

		for (let peer of peers) {
			if (peer.hasService('recovery')) {
				this.app.network.sendTransactionWithCallback(
					newtx,
					async (rows_as_tx) => {
						console.log('Restoring wallet!!!!!');

						//This is so weird that the passed data gets turned into a pseudotransaction
						let rows = rows_as_tx.msg;

						if (!rows?.length) {
							console.log('no rows returned!');
							this.login_overlay.failure();
							return;
						}
						if (!rows[0].tx) {
							console.log('no transaction in row returned');
							this.login_overlay.failure();
							return;
						}

						let newtx = new Transaction();
						newtx.deserialize_from_web(this.app, rows[0].tx);

						let txmsg = newtx.returnMessage();

						//console.log(txmsg);

						let encrypted_wallet = txmsg.wallet;
						let decrypted_wallet = this.app.crypto.aesDecrypt(
							encrypted_wallet,
							decryption_secret
						);

						this.app.options = JSON.parse(decrypted_wallet);

						//console.log(this.app.options);

						this.app.storage.saveOptions();

						this.login_overlay.success();
						console.log('Recover success');
					},
					peer.peerIndex
				);
				return;
			}
		}

		if (document.querySelector('.saito-overlay-form-text')) {
			document.querySelector('.saito-overlay-form-text').innerHTML =
				'<center>Unable to download encrypted wallet from network...</center>';
		}
		this.login_overlay.failure();
	}
}

module.exports = Recovery;
