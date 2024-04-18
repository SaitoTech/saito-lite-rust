const ModTemplate = require('../../lib/templates/modtemplate');
const RegisterProfile = require('./lib/register-profile');
const UpdateProfile = require('./lib/update-profile');
const PeerService = require('saito-js/lib/peer_service').default;

class Profile extends ModTemplate {
	constructor(app) {
		super(app);

		this.app = app;
		this.name = 'Profile';
		this.description = 'Saito DNS support';
		this.categories = 'Core Utilities Messaging';
		this.class = 'utility';
		//
		// master DNS publickey for this module
		//
		this.profile_publickey = 'zYCCXRZt2DyPD9UmxRfwFgLTNAqCd5VE8RuNneg4aNMK';

		//
		// peers
		//
		this.peers = [];

		//
		// we keep an in-memory list of cached keys to avoid the need for contant
		// database lookups. this is used primarily by browsers but also by servers
		// to avoid the need for database hits on simple DNS queries.
		//
		// this set of cached keys is updated by the browser in fetchManyProfiles()
		// after it gets a response from the server. It is updated by the server in
		// handlePeerTransaction() when it fields a request from the browser.
		//
		// servers will periodically remove content
		//
		this.cached_keys = {};
		this.keys_to_look_up = [];
		this.identifier_timeout = null;

		//
		// we keep a copy of our own publicKey for convenience. this is set in
		// super.initialize(app).
		//
		this.publicKey = '';

		//
		// set true for testing locally
		// All it does is allows both main nodes and lite clients to update
		// this.profile_publickey with the public key of the main node
		//
		this.local_dev = 1;

		this.styles = ['/saito/saito.css', '/profile/style.css'];

		//
		// EVENTS
		//
		// Saito Profile module supports two main events, one that fetches identifiers from
		// the DNS service and then updates the DOM, and a second that starts the registration
		// process by showing a popup. The first is the entry point for most applications.
		//
		this.app.connection.on(
			'profile-fetch-identifiers-and-update-dom',
			async (keys) => {
				//
				// every 1 in 20 times, clear cache of anonymous keys to requery
				//
				if (Math.random() < 0.05) {
					for (let i of Object.keys(this.cached_keys)) {
						if (i == this.cached_keys[i]) {
							delete this.cached_keys[i];
						}
					}
				}

				for (let i = 0; i < keys.length; i++) {
					if (this.cached_keys[keys[i]]) {
						this.app.browser.updateAddressHTML(
							keys[i],
							this.cached_keys[keys[i]].identifier
						);
					} else {
						if (!this.keys_to_look_up.includes(keys[i])) {
							this.keys_to_look_up.push(keys[i]);
						}
					}
				}

				if (this.identifier_timeout) {
					clearTimeout(this.identifier_timeout);
				}

				this.identifier_timeout = setTimeout(() => {
					let unidentified_keys = Array.from(this.keys_to_look_up);
					this.keys_to_look_up = [];

					this.fetchManyProfiles(unidentified_keys, (answer) => {
						//
						// This callback is run in the browser
						//
						//console.log("PROFILE: event triggered fetchManyProfiles callback");
						Object.entries(answer).forEach(([key, value]) => {
							// console.log('key value', key, value);
							if (value !== this.publicKey) {
								//
								// if this is a key that is stored in our keychain, then we want
								// to update the cached value that we have stored there as well
								//
								if (
									this.app.keychain.returnKey(key, true) &&
									key !== value
								) {
									this.app.keychain.addKey({
										publicKey: key,
										identifier: value.identifier,
										profile: value.profile
									});
								}

								this.app.browser.updateAddressHTML(
									key,
									value.identifier
								);
							}
						});

						//
						// save all keys queried to cache so even if we get nothing
						// back we won't query the server again for them.
						//
						for (let i = 0; i < unidentified_keys.length; i++) {
							if (!this.cached_keys[unidentified_keys[i]]) {
								this.cached_keys[unidentified_keys[i]] =
									unidentified_keys[i];
							}
						}
					});
				}, 250);
			}
		);

		this.app.connection.on('register-profile-or-login', (obj) => {
			let key = this.app.keychain.returnKey(this.publicKey);
			this.register_username_overlay = new RegisterProfile(
				this.app,
				this
			);

			if (obj?.success_callback) {
				this.register_username_overlay.callback = obj.success_callback;
			}
			this.register_username_overlay.render(obj?.msg);
		});

		this.app.connection.on('update-profile', (obj) => {
			let key = this.app.keychain.returnKey(this.publicKey);
			this.register_username_overlay = new UpdateProfile(this.app, this);

			if (obj?.success_callback) {
				this.register_username_overlay.callback = obj.success_callback;
			}
			this.register_username_overlay.render(obj?.msg);
		});

		return this;
	}

	//
	// initialization
	//
	async initialize(app) {
		await super.initialize(app);

		if (this.app.BROWSER == 0) {
			if (this.local_dev) {
				this.profile_publickey = this.publicKey;
				// console.log('Profile public key: ' + this.profile_publickey);
			}
		}

		this.render();
	}

	//
	// let people know we have a profile
	//
	async render() {
		if (!this.app.BROWSER) {
			return;
		}
		await super.render();
	}
	returnServices() {
		let services = [];
		//
		// So all full nodes can act as a profile of sorts
		// (or at leastre route requests to the actual profile)
		//
		if (this.app.BROWSER == 0) {
			services.push(new PeerService(null, 'profile', 'saito'));
		}
		return services;
	}



	fetchManyProfiles(publickeys = [], mycallback = null) {
		let profile_self = this;
		if (mycallback == null) {
			return;
		}
		const found_keys = {};
		const missing_keys = [...publickeys];

		// Idealy, keys profiles be fetched from cache, this means on any profile change, contacts should be updated about the new profile change 
		// 

		// publickeys.forEach((publickey) => {

		// 	// missing_keys.push(publickey)

		// 	// 

		// 	// const profile =
		// 	// 	this.app.keychain.returnKey(publickey);

		// 	// 	if(profile){
		// 	// 		if(profile.identifier){
		// 	// 			missing_keys.push(publickey)
		// 	// 		}else {
		// 	// 			found_keys[publickey] = profile;
		// 	// 		}
		// 	// 	}else {
		// 	// 		missing_keys.push(publickey)
		// 	// 	}
		// });

		console.log(found_keys, "found keys")
		if (missing_keys.length == 0) {
			mycallback(found_keys);
			return 1;
		}

		this.queryKeys(this.peers[0], missing_keys, (profiles) => {
			//
			// This callback is executed in the browser
			//
			for (let key in profiles) {
				profile_self.cached_keys[key] = profiles[key];
				found_keys[key] = profiles[key];
			}
			mycallback(found_keys);
		});
	}


	respondTo(type = '') {
		if (type == 'saito-return-key') {
			return {
				returnKey: (data = null) => {
					//
					// data might be a publickey, permit flexibility
					// in how this is called by pushing it into a
					// suitable object for searching
					//
					if (typeof data === 'string') {
						let d = { publicKey: '' };
						d.publicKey = data;
						data = d;
					}

					//
					// if keys exist
					//
					for (let key in this.cached_keys) {
						if (key === data.publicKey) {
							if (
								this.cached_keys[key] &&
								key !== this.cached_keys[key].publicKey
							) {
								return {
									publicKey: key,
									identifier: this.cached_keys[key].identifier
								};
							} else {
								return { publicKey: key };
							}
						}
					}

					return null;
				},
				returnKeys: () => {
					keyList = [];

					for (let key in this.cached_keys) {
						keyList.push({
							publicKey: key,
							identifier: this.cached_keys[key]
						});
					}

					return keyList;
				}
			};
		}
		if(type === "saito-profile"){
			return {
				fetchManyProfiles: (publicKeys, callback=null) => {
					return this.fetchManyProfiles(publicKeys, callback)
				},
				updateProfile: (identifier, bio = "", photo="", data="")=> {
					return this.updateProfile(identifier,bio, photo, data)
				}
			}
			 
		}

		return super.respondTo(type);
	}

	//
	//
	//  Registers a profile
	//
	async registerProfile(
		identifier,
		domain = '@saito',
		bio = '',
		photo = '',
		data = ''
	) {
		let result = await this.sendRegisterRequestTransaction(
			identifier,
			domain,
			bio,
			photo,
			JSON.stringify(data)
		);
		return result;
	}

	async updateProfile(identifier, bio = '', photo = '', data = '') {
		let result = await this.sendUpdateRequestTransaction(
			identifier,
			bio,
			photo,
			JSON.stringify(data)
		);
		return result;
	}

	/**
	 * QueryKeys is a cross network database search for a set of public keys
	 * Typically we call it from the browser on the first peer claiming to have a profile service
	 */
	queryKeys(peer, keys, mycallback) {
		if (!peer?.peerIndex) {
			console.log('No peer');
			return;
		}

		let data = {
			request: 'profile query',
			keys: keys
		};

		//console.log(`PROFILE queryKeys from ${this.publicKey} to ${peer.publicKey}`);
		return this.app.network.sendRequestAsTransaction(
			'profile query',
			data,
			mycallback,
			peer.peerIndex
		);
	}

	onPeerServiceUp(app, peer, service = {}) {
		if (service.service === 'profile') {
			this.peers.push(peer);

			//
			// We want to allow service nodes to connect to each other as profile peers
			// but don't need to do any of the other processing
			//
			if (!app.BROWSER) {
				return;
			}

			//
			// if we have instructed the server to run this application locally then we
			// want browsers (connecting to the server) to update their profile publickey
			// so the publickey of the server.
			//

			if (this.local_dev) {
				this.profile_publickey = peer.publicKey;
			}

			let myKey = app.keychain.returnKey(this.publicKey, true);
			console.log('myKey', myKey);
			if (myKey?.identifier) {
				let profile_self = this;
				this.queryKeys(peer, [this.publicKey], function (profiles) {
					console.log('profiles', profiles);
					for (let profile in profiles) {
						if (profile.publicKey == myKey.publicKey) {
							if (
								profiles[profile].identifier !==
								myKey.identifier
							) {
								console.log('PROFILE: Identifier mismatch...');
								console.log(
									`PROFILE: Expecting ${myKey.identifier}, but Profile has ${profiles[key].identifier}`
								);

								//Maybe we do an update here???
							} else {
							}
							return;
						}
					}

					//
					//Make sure that we actually checked the right source
					//
					//if (peer.publicKey == profile_self.profile_publickey) {
					let identifier = myKey.identifier.split('@');
					if (identifier.length !== 2) {
						console.log(
							'PROFILE: Invalid identifier',
							myKey.identifier
						);
						return;
					}

					profile_self.checkIdentifierInDatabase(
						myKey.identifier,
						(rows) => {
							if (rows.length === 0) {
								profile_self.registerProfile(
									identifier[0],
									'@' + identifier[1]
								);
							}
						}
					);

					console.log(
						'PROFILE: Attempting to register our name again'
					);
					//}
				});
			} else if (myKey.has_registered_username) {
				console.log('PROFILE: unset registering... status');
				this.app.keychain.addKey(this.publicKey, {
					has_registered_username: false
				});
				this.app.connection.emit('update_profile', this.publicKey);
			}
		}
	}

	/////////////////////////////
	// HANDLE PEER TRANSACTION //
	/////////////////////////////
	//
	// data queries hit here
	//
	async handlePeerTransaction(app, newtx = null, peer, mycallback = null) {
		if (newtx == null) {
			return 0;
		}

		let txmsg = newtx.returnMessage();
		if (!txmsg?.data) {
			return 0;
		}

		if (txmsg.request == 'profile query') {
			if (txmsg.data.request === 'profile query') {
				let keys = txmsg.data?.keys;
				return this.fetchProfilesFromDatabase(keys, mycallback);
			}

			if (txmsg.data.request === 'profile namecheck') {
				let identifier = txmsg.data?.identifier;
				return this.checkIdentifierInDatabase(identifier, mycallback);
			}
		}

		return super.handlePeerTransaction(app, newtx, peer, mycallback);
	}

	//
	// There are TWO types of requests that this module will process on-chain. The first is
	// the request to REGISTER a @saito address. This will only be processed by the node that
	// is running the publickey identified in this module as the "profile_publickey".
	//
	// The second is a confirmation that the node running the domain broadcasts into the network
	// with a proof-of-registration. All nodes that run the DNS service should listen for
	// these messages and add the records into their own copy of the database, along with the
	// signed proof-of-registration.
	//
	async onConfirmation(blk, tx, conf) {
		try {
			let txmsg = tx.returnMessage();
			if (txmsg.module !== 'Profile') {
				return;
			}
			if (conf == 0) {
				if (txmsg.request === 'register request') {
					console.log(
						`PROFILE: ${tx.from[0].publicKey} -> ${txmsg.identifier}`
					);
					try {
						await this.receiveRegisterRequestTransaction(blk, tx);
					} catch (err) {
						console.error(
							'Profile: Error processing register request transaction:',
							err
						);

						await this.sendFailureTransaction(
							tx,
							'Failed to register profile'
						);
					}
				}
				if (txmsg.request === 'register success') {
					try {
						await this.receiveRegisterSuccessTransaction(blk, tx);
					} catch (err) {
						console.error(
							'Profile: Error processing register success transaction:',
							err
						);
						salert('An error occured with registration');
					}
				}

				if (txmsg.request === 'update request') {
					try {
						await this.receiveUpdateRequestTransaction(blk, tx);
					} catch (err) {
						console.error(
							'Profile: Error processing update request transaction:',
							err
						);
						await this.sendFailureTransaction(
							tx,
							'Failed to update profile'
						);
					}
				}

				if (txmsg.request === 'update success') {
					try {
						await this.receiveUpdateSuccessTransaction(blk, tx);
					} catch (err) {
						console.error(
							'Profile: Error processing update success transaction:',
							err
						);
					}
				}

				if (txmsg.request === 'request failed') {
					console.log(txmsg, 'request failed');
					salert(txmsg.message);
				}
			}
		} catch (err) {
			console.error('Profile: Error in onConfirmation:', err);
		}
	}

	/*
	 * Lightly recursive, server side code to look up keys in the profile database
	 * Invoked through a peer request.
	 * Any requested keys not found are passed on to any peers with the DNS publickey
	 */
	async fetchProfilesFromDatabase(keys, mycallback = null) {
		let found_keys = {};
		let missing_keys = [];

		let myregexp = new RegExp('^([a-zA-Z0-9])*$');
		for (let i = keys.length - 1; i >= 0; i--) {
			if (!myregexp.test(keys[i])) {
				keys.splice(i, 1);
				continue;
			}

			if (!this.cached_keys[keys[i]]) {
				this.cached_keys[keys[i]] = {};
			}
		}

		try {
			if (keys.length > 0) {
				const where_statement = `publickey IN ("${keys.join('","')}")`;
				const sql = `SELECT * FROM records WHERE ${where_statement}`;

				let rows = await this.app.storage.queryDatabase(
					sql,
					{},
					'profile'
				);
				if (rows?.length > 0) {
					for (let row of rows) {
						found_keys[row.publickey] = {
							...row,
							profile:
								row.bio || row.photo || row.profile_data
									? {
											bio: row.bio,
											photo: row.photo,
											profile_data: row.profile_data
									  }
									: null
						};
						this.cached_keys[row.publickey] =
							found_keys[row.publickey];
					}
				}
			}
		} catch (err) {
			console.error(
				'Profile: Error fetching profiles from database:',
				err
			);
		}

		// Determine missing keys
		let found_check = Object.keys(found_keys);
		for (let key of keys) {
			if (!found_check.includes(key)) {
				missing_keys.push(key);
			}
		}

		if (
			missing_keys.length > 0 &&
			this.publicKey !== this.profile_publickey
		) {
			let has_peer = false;
			for (let peer of this.peers) {
				if (peer.publicKey === this.profile_publickey) {
					has_peer = true;
					try {
						return await this.queryKeys(
							peer,
							missing_keys,
							(res) => {
								for (let key in res) {
									if (res[key] !== key) {
										this.cached_keys[key] = res[key];
										found_keys[key] = res[key];
									}
								}

								if (mycallback) {
									mycallback(found_keys);
									return 1;
								}
							}
						);
					} catch (err) {
						console.error(
							'Profile: Error querying keys from peer:',
							err
						);
					}
				}
			}

			if (!has_peer) {
				console.log('PROFILE: Not a peer with the central DNS');
			}

			return 0;
		} else if (mycallback && found_check.length > 0) {
			mycallback(found_keys);
			return 1;
		}
	}

	async checkIdentifierInDatabase(identifier, mycallback = null) {
		if (!mycallback) {
			console.warn('No callback');
			return 0;
		}

		if (this.publicKey == this.profile_publickey) {
			const sql = `SELECT * FROM records WHERE identifier = ?`;

			let rows = await this.app.storage.queryDatabase(
				sql,
				[identifier],
				'profile'
			);

			mycallback(rows);
			return 1;
		} else {
			await this.sendPeerDatabaseRequestWithFilter(
				'Profile',
				`SELECT * FROM records WHERE identifier = "${identifier}"`,
				(res) => {
					mycallback(res?.rows);
					return 1;
				},

				(p) => {
					if (p.publicKey == this.profile_publickey) {
						return 1;
					}
					return 0;
				}
			);
		}
		return 0;
	}

	async addRecord(
		identifier = '',
		publickey = '',
		unixtime = 0,
		bid = 0,
		bsh = '',
		lock_block = 0,
		sig = '',
		signer = '',
		lc = 1,
		bio = '',
		photo = '',
		data = ''
	) {
		let sql = `INSERT INTO records (
				identifier,
				publickey,
				unixtime,
				bid,
				bsh,
				lock_block,
				sig,
				signer,
				lc,
				bio,
				photo,
				profile_data
			) VALUES (
				$identifier,
				$publickey,
				$unixtime,
				$bid,
				$bsh,
				$lock_block,
				$sig,
				$signer,
				$lc,
				$bio,
				$photo,
				$data
			)`;

		let params = {
			$identifier: identifier,
			$publickey: publickey,
			$unixtime: unixtime,
			$bid: Number(bid),
			$bsh: bsh,
			$lock_block: lock_block,
			$sig: sig,
			$signer: signer,
			$lc: lc,
			$bio: bio,
			$photo: photo,
			$data: typeof data === 'object' ? JSON.stringify(data) : data
		};

		let result = await this.app.storage.runDatabase(sql, params, 'profile');

		if (!result) {
			throw Error('Error adding record');
		}
		return result?.changes;
	}

	async updateRecord(identifier, bio, photo, data) {
		let findRecordSql = `SELECT id FROM records WHERE identifier = $identifier`;
		let records = await this.app.storage.queryDatabase(
			findRecordSql,
			{ $identifier: identifier },
			'profile'
		);

		if (records.length === 0) {
			throw new Error('Record not found.');
		}
		let recordId = records[0].id;

		let sql = `UPDATE records SET
				bio = $bio,
				photo = $photo,
				profile_data = $data
				WHERE id = $record_id`;

		let params = {
			$record_id: recordId,
			$bio: bio,
			$photo: photo,
			$data: typeof data === 'object' ? JSON.stringify(data) : data
		};

		let result = await this.app.storage.runDatabase(sql, params, 'profile');

		if (!result) {
			throw Error('Error updating record');
		}
		return result?.changes;
	}

	async onChainReorganization(bid, bsh, lc) {
		var sql = 'UPDATE records SET lc = $lc WHERE bid = $bid AND bsh = $bsh';
		var params = { $bid: bid, $bsh: bsh };
		await this.app.storage.runDatabase(sql, params, 'profile');
		return;
	}

	async sendRegisterRequestTransaction(
		identifier,
		domain,
		bio = '',
		photo = '',
		data = ''
	) {
		try {
			// Validate the identifier is a string
			if (typeof identifier !== 'string') {
				throw new Error('Identifier must be a string.');
			}

			const newtx =
				await this.app.wallet.createUnsignedTransactionWithDefaultFee(
					this.profile_publickey
				);
			if (!newtx) {
				throw new Error(
					'Failed to create transaction in profile module.'
				);
			}

			// Validate the identifier for alphanumeric characters
			const isAlphanumeric = /^[0-9A-Za-z]+$/.test(identifier);
			if (!isAlphanumeric) {
				throw new Error(
					'Identifier must contain alphanumeric characters only.'
				);
			}

			// Set transaction details
			newtx.msg.module = 'Profile';
			newtx.msg.request = 'register request';
			newtx.msg.identifier = identifier + domain;
			newtx.msg.bio = bio;
			newtx.msg.photo = photo;
			newtx.msg.data = data;

			// Add sender, sign the newtx, and propagate it onchain
			await newtx.addFrom(this.publicKey);
			await newtx.sign();
			await this.app.network.propagateTransaction(newtx);

			return true;
		} catch (error) {
			console.error(
				'Profile: Error creating Register Request Transaction.',
				error
			);
			return false;
		}
	}

	async receiveRegisterRequestTransaction(block, transaction) {
		const txmsg = transaction.returnMessage();

		if (
			transaction.isTo(this.publicKey) &&
			this.publicKey === this.profile_publickey
		) {
			const identifier = txmsg.identifier;
			const publicKey = transaction.from[0].publicKey;
			const unixTime = new Date().getTime();
			const blockId = block.id;
			const blockHash = block.hash;
			const lockBlock = 0;
			const signedMessage = identifier + publicKey + blockId + blockHash;
			const signature = this.app.crypto.signMessage(
				signedMessage,
				await this.app.wallet.getPrivateKey()
			);
			const signer = this.profile_publickey;
			const data = txmsg.data;
			const bio = txmsg.bio;
			const photo = txmsg.photo;
			const result = await this.addRecord(
				identifier,
				publicKey,
				unixTime,
				blockId,
				blockHash,
				lockBlock,
				signature,
				signer,
				1,
				bio,
				photo,
				data
			);

			if (result) {
				console.log('added record');
				const obj = {
					lockBlock,
					unixTime,
					signer,
					blockId,
					blockHash,
					identifier,
					signedMessage,
					signature,
					publicKey,
					bio,
					photo,
					data
				};

				await this.sendRegisterSuccessTransaction(transaction, obj);
			}
		}
	}

	async sendRegisterSuccessTransaction(tx, obj) {
		try {
			let from = tx.from[0].publicKey;
			let { identifier } = tx.returnMessage();
			if (!from) {
				throw Error('PROFILE: NO "FROM" PUBLIC KEY FOUND');
			}
			let request = 'register success';
			let newtx =
				await this.app.wallet.createUnsignedTransactionWithDefaultFee(
					from
				);
			newtx.addFrom(this.publicKey);

			newtx.msg = {
				request,
				module: 'Profile',
				identifier,
				...obj
			};

			await newtx.sign();
			console.log('sending register success tx');
			await this.app.network.propagateTransaction(newtx);
		} catch (error) {
			console.error(
				'PROFILE: error creating register request transaction',
				error
			);
		}
	}

	async receiveRegisterSuccessTransaction(blk, tx) {
		console.log('receiving register success');

		let txmsg = tx.returnMessage();
		if (!txmsg) {
			throw Error('txmsg is invalid');
		}
		if (tx.from[0].publicKey == this.profile_publickey) {
			let publickey = tx.to[0].publicKey;
			let identifier = txmsg.identifier;
			let bio = txmsg.bio;
			let photo = txmsg.photo;
			let data = txmsg.data;
			let signedMessage = txmsg.signedMessage;
			let signature = txmsg.signature;
			let bid = txmsg.bid;
			let bsh = txmsg.bsh;
			let unixtime = txmsg.unixtime;
			let lock_block = txmsg.lock_block;
			let signer = txmsg.signer;
			let lc = 1;

			if (
				this.app.crypto.verifyMessage(
					signedMessage,
					signature,
					this.profile_publickey
				)
			) {
				if (this.publicKey != this.profile_publickey) {
					if (!this.app.BROWSER) {
						let res = await this.addRecord(
							identifier,
							publickey,
							unixtime,
							bid,
							bsh,
							lock_block,
							signature,
							signer,
							1,
							bio,
							photo,
							data
						);
					}

					console.log('receiving register success transaction');
					if (tx.isTo(this.publicKey)) {
						this.app.keychain.addKey(tx.to[0].publicKey, {
							identifier: identifier,
							watched: true,
							block_id: blk.id,
							block_hash: blk.hash,
							lc: 1,
							profile: { bio, photo, data }
						});

						console.info('***********************');
						console.info(
							'verification success for : ' + identifier
						);
						console.info('***********************');

						this.app.browser.updateAddressHTML(
							tx.to[0].publicKey,
							identifier
						);
						this.app.connection.emit(
							'update_profile',
							tx.to[0].publicKey
						);
						this.app.connection.emit('update_profile', this.publicKey);
						siteMessage("Profile successfully registered")
					}
				}
			} else {
				throw Error('Error verifying username');
			}
		}
	}

	async sendUpdateRequestTransaction(
		identifier,
		bio = '',
		photo = '',
		data = ''
	) {
		try {
			// Validate the identifier is a string
			if (typeof identifier !== 'string') {
				throw new Error('Identifier must be a string.');
			}

			const newtx =
				await this.app.wallet.createUnsignedTransactionWithDefaultFee(
					this.profile_publickey
				);
			if (!newtx) {
				throw new Error(
					'Failed to create transaction in profile module.'
				);
			}

			// Set transaction details
			newtx.msg.module = 'Profile';
			newtx.msg.request = 'update request';
			newtx.msg.identifier = identifier;
			newtx.msg.bio = bio;
			newtx.msg.photo = photo;
			newtx.msg.data = data;

			// Add sender, sign the newtx, and propagate it onchain
			await newtx.addFrom(this.publicKey);
			await newtx.sign();
			await this.app.network.propagateTransaction(newtx);

			return true;
		} catch (error) {
			console.error(
				'Profile: Error creating Update Request Transaction.',
				error
			);
			return false;
		}
	}

	async receiveUpdateRequestTransaction(block, transaction) {
		const txmsg = transaction.returnMessage();

		if (
			transaction.isTo(this.publicKey) &&
			this.publicKey === this.profile_publickey
		) {
			const identifier = txmsg.identifier;
			const publicKey = transaction.from[0].publicKey;
			const unixTime = new Date().getTime();
			const blockId = block.id;
			const blockHash = block.hash;
			const lockBlock = 0;
			const signedMessage = identifier + publicKey + blockId + blockHash;
			const signature = this.app.crypto.signMessage(
				signedMessage,
				await this.app.wallet.getPrivateKey()
			);
			const signer = this.profile_publickey;
			const data = txmsg.data;
			const bio = txmsg.bio;
			const photo = txmsg.photo;
			const result = await this.updateRecord(
				identifier,
				bio,
				photo,
				data
			);

			if (result) {
				console.log('added record');
				const obj = {
					lockBlock,
					unixTime,
					signer,
					blockId,
					blockHash,
					identifier,
					signedMessage,
					signature,
					publicKey,
					bio,
					photo,
					data
				};

				await this.sendUpdateSuccessTransaction(transaction, obj);
			}
		}
	}

	async sendUpdateSuccessTransaction(tx, obj) {
		try {
			let from = tx.from[0].publicKey;
			let { identifier } = tx.returnMessage();
			if (!from) {
				throw Error('PROFILE: NO "FROM" PUBLIC KEY FOUND');
			}
			let request = 'update success';
			let newtx =
				await this.app.wallet.createUnsignedTransactionWithDefaultFee(
					from
				);
			newtx.addFrom(this.publicKey);

			newtx.msg = {
				request,
				module: 'Profile',
				identifier,
				...obj
			};

			await newtx.sign();

			await this.app.network.propagateTransaction(newtx);
		} catch (error) {
			console.error(
				'PROFILE: error creating register request transaction',
				error
			);
		}
	}

	async sendFailureTransaction(tx, message) {
		try {
			let from = tx.from[0].publicKey;
			if (!from) {
				throw Error('PROFILE: NO "FROM" PUBLIC KEY FOUND');
			}
			let newtx =
				await this.app.wallet.createUnsignedTransactionWithDefaultFee(
					from
				);

			newtx.addFrom(this.publicKey);
			newtx.msg = {
				request: 'request failed',
				module: 'Profile',
				message
			};
			await newtx.sign();
			await this.app.network.propagateTransaction(newtx);
		} catch (error) {}
	}

	async receiveUpdateSuccessTransaction(blk, tx) {
		try {
			let txmsg = tx.returnMessage();
			if (!txmsg) {
				throw Error('txmsg is invalid');
			}
			if (tx.from[0].publicKey == this.profile_publickey) {
				try {
					let publickey = tx.to[0].publicKey;
					let identifier = txmsg.identifier;
					let bio = txmsg.bio;
					let photo = txmsg.photo;
					let data = txmsg.data;
					let signedMessage = txmsg.signedMessage;
					let signature = txmsg.signature;
					let bid = txmsg.bid;
					let bsh = txmsg.bsh;
					let unixtime = txmsg.unixtime;
					let lock_block = txmsg.lock_block;
					let signer = txmsg.signer;
					let lc = 1;

					if (
						this.app.crypto.verifyMessage(
							signedMessage,
							signature,
							this.profile_publickey
						)
					) {
						if (this.publicKey != this.profile_publickey) {
							if (!this.app.BROWSER) {
								let res = await this.updateRecord(
									identifier,
									bio,
									photo,
									data
								);
							}

					
							if (tx.isTo(this.publicKey)) {
								this.app.keychain.addKey(tx.to[0].publicKey, {
									identifier: identifier,
									watched: true,
									block_id: blk.id,
									block_hash: blk.hash,
									lc: 1,
									profile: { bio, photo, data }
								});

								console.info('***********************');
								console.info(
									'verification success for : ' + identifier
								);
								console.info('***********************');

								this.app.browser.updateAddressHTML(
									tx.to[0].publicKey,
									identifier
								);
								this.app.connection.emit(
									'update_profile',
									tx.to[0].publicKey
								);

								siteMessage("Profile successfully updated")
							}
					
						}
					}
				} catch (err) {
					console.error(
						'ERROR verifying username registration message: ',
						err
					);
				}
			}
		} catch (error) {
			console.error(
				'Profile: Error receiving update success transaction'
			);
		}
	}
}

module.exports = Profile;
