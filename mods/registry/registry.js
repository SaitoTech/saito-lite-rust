const ModTemplate = require('../../lib/templates/modtemplate');
const RegisterUsernameOverlay = require('./lib/register-username');
const PeerService = require('saito-js/lib/peer_service').default;

class Registry extends ModTemplate {
	constructor(app) {
		super(app);

		this.app = app;
		this.name = 'Registry';
		this.description = 'Saito DNS support';
		this.categories = 'Core Utilities Messaging';
		this.class = 'utility';
		//
		// master DNS publickey for this module
		//
		this.registry_publickey =
			'zYCCXRZt2DyPD9UmxRfwFgLTNAqCd5VE8RuNneg4aNMK';

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
		// this.registry_publickey with the public key of the main node
		//
		this.local_dev = 1;

		//
		// EVENTS
		//
		// Saito Registry module supports two main events, one that fetches identifiers from
		// the DNS service and then updates the DOM, and a second that starts the registration
		// process by showing a popup. The first is the entry point for most applications.
		//
		this.app.connection.on(
			'registry-fetch-identifiers-and-update-dom',
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
						//console.log("REGISTRY: event triggered fetchManyProfiles callback");
						Object.entries(answer).forEach(([key, value]) => {
							console.log('key value', key, value);
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

		this.app.connection.on('register-username-or-login', (obj) => {
			let key = this.app.keychain.returnKey(this.publicKey);
			this.register_username_overlay = new RegisterUsernameOverlay(
				this.app,
				this
			);
			// if (key?.has_registered_username) {
			//  return;
			// }
			// if (!this.register_username_overlay) {
			//  this.register_username_overlay = new RegisterUsernameOverlay(
			//      this.app,
			//      this
			//  );
			// }
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
				this.registry_publickey = this.publicKey;
				console.log('Registry public key: ' + this.registry_publickey);
			}
		}
	}

	//
	// let people know we have a registry
	//
	returnServices() {
		let services = [];
		//
		// So all full nodes can act as a registry of sorts
		// (or at leastre route requests to the actual registry)
		//
		if (this.app.BROWSER == 0) {
			services.push(new PeerService(null, 'registry', 'saito'));
		}
		return services;
	}

	//
	// fetching identifiers
	//
	// this function is run on the browsers, triggered by the event that wants to re-write the DOM
	// so it will query the first peer it sees that runs the registry module and ask it for the
	// identifiers
	//
	// this first checks the cache that browsers maintain in their own memory that maps keys to
	// identifiers and only fetches information from the server when that does not work or find
	// an address. this is intended to limit the load on the parent server.
	//
	fetchManyProfiles(publickeys = [], mycallback = null) {
		let registry_self = this;
		if (mycallback == null) {
			return;
		}
		const found_keys = {};
		const missing_keys = [];

		publickeys.forEach((publickey) => {
			const identifier =
				this.app.keychain.returnIdentifierByPublicKey(publickey);

			//returns "" if not found
			if (identifier) {
				found_keys[publickey] = identifier;
			} else {
				missing_keys.push(publickey);
			}
		});

		if (missing_keys.length == 0) {
			mycallback(found_keys);
			return 1;
		}

		this.queryKeys(this.peers[0], missing_keys, (profiles) => {
			//
			// This callback is executed in the browser
			//
			for (let key in profiles) {
				registry_self.cached_keys[key] = profiles[key];
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

		return super.respondTo(type);
	}

	//
	//
	//  Registers an identifier
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
	 * Typically we call it from the browser on the first peer claiming to have a registry service
	 */
	queryKeys(peer, keys, mycallback) {
		if (!peer?.peerIndex) {
			console.log('No peer');
			return;
		}

		let data = {
			request: 'registry query',
			keys: keys
		};

		//console.log(`REGISTRY queryKeys from ${this.publicKey} to ${peer.publicKey}`);
		return this.app.network.sendRequestAsTransaction(
			'registry query',
			data,
			mycallback,
			peer.peerIndex
		);
	}

	onPeerServiceUp(app, peer, service = {}) {
		if (service.service === 'registry') {
			this.peers.push(peer);

			//
			// We want to allow service nodes to connect to each other as registry peers
			// but don't need to do any of the other processing
			//
			if (!app.BROWSER) {
				return;
			}

			//
			// if we have instructed the server to run this application locally then we
			// want browsers (connecting to the server) to update their registry publickey
			// so the publickey of the server.
			//

			if (this.local_dev) {
				this.registry_publickey = peer.publicKey;
			}

			//console.log(`Registry connected: ${peer.publicKey} and/but using: ${this.registry_publickey}`);

			let myKey = app.keychain.returnKey(this.publicKey, true);
			if (myKey?.identifier) {
				let registry_self = this;
				this.queryKeys(peer, [this.publicKey], function (profiles) {
					console.log('profiles', profiles);
					//console.log(`REGISTRY lookup ${myKey.identifier}: ${registry_self.publicKey} in ${peer.publicKey}, found: `, identifiers);

					for (let profile in profiles) {
						console.log('profiles', profile);
						if (profile.publicKey == myKey.publicKey) {
							if (
								profiles[profile].identifier !==
								myKey.identifier
							) {
								console.log('REGISTRY: Identifier mismatch...');
								console.log(
									`REGISTRY: Expecting ${myKey.identifier}, but Registry has ${profiles[key].identifier}`
								);

								//Maybe we do an update here???
							} else {
								//console.log("REGISTRY: Identifier checks out");
								//Identifier checks out!
							}
							return;
						}
					}

					//
					//Make sure that we actually checked the right source
					//
					//if (peer.publicKey == registry_self.registry_publickey) {
					let identifier = myKey.identifier.split('@');
					if (identifier.length !== 2) {
						console.log(
							'REGISTRY: Invalid identifier',
							myKey.identifier
						);
						return;
					}

					registry_self.checkIdentifierInDatabase(
						myKey.identifier,
						(rows) => {
							console.log('rowserr', rows);
							if (rows.length === 0) {
								registry_self.registerProfile(
									identifier[0],
									'@' + identifier[1]
								);
							}
						}
					);

					console.log(
						'REGISTRY: Attempting to register our name again'
					);
					//}
				});
			} else if (myKey.has_registered_username) {
				console.log('REGISTRY: unset registering... status');
				this.app.keychain.addKey(this.publicKey, {
					has_registered_username: false
				});
				this.app.connection.emit('update_identifier', this.publicKey);
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

		if (txmsg.request == 'registry query') {
			if (txmsg.data.request === 'registry query') {
				let keys = txmsg.data?.keys;
				//console.log("REGISTRY query lookup: ", keys);
				return this.fetchProfilesFromDatabase(keys, mycallback);
			}

			if (txmsg.data.request === 'registry namecheck') {
				let identifier = txmsg.data?.identifier;
				//console.log("REGISTRY check if identifer is registered: ", identifier);
				return this.checkIdentifierInDatabase(identifier, mycallback);
			}
		}

		return super.handlePeerTransaction(app, newtx, peer, mycallback);
	}

	//
	// There are TWO types of requests that this module will process on-chain. The first is
	// the request to REGISTER a @saito address. This will only be processed by the node that
	// is running the publickey identified in this module as the "registry_publickey".
	//
	// The second is a confirmation that the node running the domain broadcasts into the network
	// with a proof-of-registration. All nodes that run the DNS service should listen for
	// these messages and add the records into their own copy of the database, along with the
	// signed proof-of-registration.
	//
	async onConfirmation(blk, tx, conf) {
		let txmsg = tx.returnMessage();
		if (txmsg.module !== 'Registry') {
			return;
		}
		if (conf == 0) {
			if (txmsg.request === 'register request') {
				console.log(
					`REGISTRY: ${tx.from[0].publicKey} -> ${txmsg.identifier}`
				);
				this.receiveRegisterRequestTransaction(blk, tx);
			}
			if (txmsg.request === 'register success') {
				// console.log(
				// 	`REGISTRY: ${tx.from[0].publicKey} -> ${txmsg.identifier}`
				// );
				await this.receiveRegisterSuccessTransaction(blk, tx);
			}

			if (txmsg.request === 'update request') {
				// console.log(
				// 	`REGISTRY: ${tx.from[0].publicKey} -> ${txmsg.identifier}`
				// );
				await this.receiveUpdateRequestTransaction(blk, tx);
			}

			if (txmsg.request === 'update success') {
				// console.log(
				// 	`REGISTRY: ${tx.from[0].publicKey} -> ${txmsg.identifier}`
				// );
				await this.receiveUpdateSuccessTransaction(blk, tx);
			}
		}
	}

	/*
	 * Lightly recursive, server side code to look up keys in the registry database
	 * Invoked through a peer request.
	 * Any requested keys not found are passed on to any peers with the DNS publickey
	 */
	async fetchProfilesFromDatabase(keys, mycallback = null) {
		let registry_self = this;
		let found_keys = {};
		let missing_keys = [];

		let myregexp = new RegExp('^([a-zA-Z0-9])*$');
		for (let i = keys.length - 1; i >= 0; i--) {
			if (!myregexp.test(keys[i])) {
				keys.splice(i, 1);
				continue;
			}
			/*if (this.cached_keys[keys[i]] && this.cached_keys[keys[i]] !== keys[i]) {
        found_keys[keys[i]] = this.cached_keys[keys[i]];
        keys.splice(i, 1);
      }*/

			if (!this.cached_keys[keys[i]]) {
				this.cached_keys[keys[i]] = {};
			}
		}

		//
		// check database if needed
		//
		if (keys.length > 0) {
			// Assuming `publickey` is a unique identifier in the `records` table
			const where_statement = `r.publickey IN ("${keys.join('","')}")`;
			const sql = `SELECT r.*, p.bio, p.photo, p.profile_data 
                         FROM records r
                         LEFT JOIN profiles p ON r.id = p.record_id
                         WHERE ${where_statement}`;

			let rows = await this.app.storage.queryDatabase(
				sql,
				{},
				'registry'
			);
			if (rows?.length > 0) {
				for (let i = 0; i < rows.length; i++) {
					found_keys[rows[i].publickey] = {
						...rows[i],
						profile:
							rows[i].bio || rows[i].photo || rows[i].profile_data
								? {
										bio: rows[i].bio,
										photo: rows[i].photo,
										profile_data: rows[i].profile_data
								  }
								: null
					};
					registry_self.cached_keys[rows[i].publickey] =
						found_keys[rows[i].publickey];
				}
			}
		}

		// Which keys are we missing?
		let found_check = Object.keys(found_keys);
		console.log('found keys', found_keys);
		for (let key of keys) {
			if (!found_check.includes(key)) {
				missing_keys.push(key);
			}
		}

		//console.log("this REGISTRY found", found_keys, "but not", missing_keys);

		//
		// Fallback because browsers don't automatically have DNS as a peer
		//
		if (
			missing_keys.length > 0 &&
			this.publicKey !== this.registry_publickey
		) {
			let has_peer = false;
			//
			// if we were asked about any missing keys, ask our parent server
			//
			for (let i = 0; i < this.peers.length; i++) {
				if (this.peers[i].publicKey == this.registry_publickey) {
					has_peer = true;
					// ask the parent for the missing values, cache results
					return this.queryKeys(
						this.peers[i],
						missing_keys,
						(res) => {
							//
							// This is run by the main service node
							//
							for (let key in res) {
								if (res[key] !== key) {
									registry_self.cached_keys[key] = res[key];
									found_keys[key] = res[key];
								}
							}

							if (mycallback) {
								//console.log("REGISTRY: run nested DB callback on found keys", found_keys);
								mycallback(found_keys);
								return 1;
							}
						}
					);
				}
			}

			if (!has_peer) {
				console.log('REGISTRY: Not a peer with the central DNS');
			}

			//No peer found...
			return 0;
		} else if (mycallback && found_check.length > 0) {
			//
			// This is run by either the main service node or the proper registry node
			//
			//console.log("REGISTRY: run DB callback on found keys", found_keys);
			mycallback(found_keys);
			return 1;
		}
	}

	async checkIdentifierInDatabase(identifier, mycallback = null) {
		if (!mycallback) {
			console.warn('No callback');
			return 0;
		}

		if (this.publicKey == this.registry_publickey) {
			const sql = `SELECT * FROM records WHERE identifier = ?`;

			let rows = await this.app.storage.queryDatabase(
				sql,
				[identifier],
				'registry'
			);

			mycallback(rows);
			return 1;
		} else {
			await this.sendPeerDatabaseRequestWithFilter(
				'Registry',
				`SELECT * FROM records WHERE identifier = "${identifier}"`,
				(res) => {
					mycallback(res?.rows);
					return 1;
				},

				(p) => {
					if (p.publicKey == this.registry_publickey) {
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
		data = '' // Assuming 'data' refers to 'profile_data'
	) {
		// Insert into `records` table

		try {
			let sqlRecords = `INSERT INTO records (
                identifier,
                publickey,
                unixtime,
                bid,
                bsh,
                lock_block,
                sig,
                signer,
                lc
            )
            VALUES (
                $identifier,
                $publickey,
                $unixtime,
                $bid,
                $bsh,
                $lock_block,
                $sig,
                $signer,
                $lc
            )`;
			let paramsRecords = {
				$identifier: identifier,
				$publickey: publickey,
				$unixtime: unixtime,
				$bid: Number(bid),
				$bsh: bsh,
				$lock_block: lock_block,
				$sig: sig,
				$signer: signer,
				$lc: lc
			};

			let recordRes = await this.app.storage.runDatabase(
				sqlRecords,
				paramsRecords,
				'registry'
			);

			console.log(recordRes, 'record result');
			let recordId = recordRes.lastID;

			if (bio || photo || data) {
				let sqlProfiles = `INSERT INTO profiles (
                    record_id,
                    bio,
                    photo,
                    profile_data
                )
                VALUES (
                    $record_id,
                    $bio,
                    $photo,
                    $data
                )`;
				let paramsProfiles = {
					$record_id: recordId,
					$bio: bio,
					$photo: photo,
					$data: data
				};

				await this.app.storage.runDatabase(
					sqlProfiles,
					paramsProfiles,
					'registry'
				);
			}

			return recordRes?.changes;
		} catch (error) {
			console.error('Registry: error adding record', error);
		}
	}

	async updateRecord(identifier, bio, photo, data) {
		console.log('record', identifier, bio, photo, data);
		try {
			let findRecordIdSql = `SELECT id FROM records WHERE identifier = $identifier`;
			let record = await this.app.storage.queryDatabase(
				findRecordIdSql,
				{ $identifier: identifier },
				'registry'
			);
			if (record.length === 0) {
				throw new Error('Record not found.');
			}
			let recordId = record[0].id;

			// Check if a profile already exists for this record_id
			let findProfileSql = `SELECT id FROM profiles WHERE record_id = $recordId`;
			let profile = await this.app.storage.queryDatabase(
				findProfileSql,
				{ $recordId: recordId },
				'registry'
			);

			let sqlProfiles;
			let paramsProfiles = {
				$record_id: recordId,
				$bio: bio,
				$photo: photo,
				$data: typeof data === 'object' ? JSON.stringify(data) : data
			};

			// If a profile exists, update it. Otherwise, insert a new profile row.
			if (profile.length > 0) {
				sqlProfiles = `UPDATE profiles SET
                           bio = $bio,
                           photo = $photo,
                           profile_data = $data
                           WHERE record_id = $record_id`;
			} else {
				sqlProfiles = `INSERT INTO profiles (
                           record_id,
                           bio,
                           photo,
                           profile_data
                           )
                           VALUES (
                           $record_id,
                           $bio,
                           $photo,
                           $data
                           )`;
			}

			// Execute the insert or update operation for the profile
			let resProfiles = await this.app.storage.runDatabase(
				sqlProfiles,
				paramsProfiles,
				'registry'
			);

			// Return the number of records updated or inserted in the profiles table
			return resProfiles?.changes;
		} catch (error) {
			console.error('Registry: error updating records', error);
		}
	}

	async onChainReorganization(bid, bsh, lc) {
		var sql = 'UPDATE records SET lc = $lc WHERE bid = $bid AND bsh = $bsh';
		var params = { $bid: bid, $bsh: bsh };
		await this.app.storage.runDatabase(sql, params, 'registry');
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
					this.registry_publickey
				);
			if (!newtx) {
				throw new Error(
					'Failed to create transaction in registry module.'
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
			newtx.msg.module = 'Registry';
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
				'Registry: Error creating Register Request Transaction.',
				error
			);
			return false;
		}
	}

	async receiveRegisterRequestTransaction(block, transaction) {
		try {
			const txmsg = transaction.returnMessage();

			if (
				transaction.isTo(this.publicKey) &&
				this.publicKey === this.registry_publickey
			) {
				const identifier = txmsg.identifier;
				const publicKey = transaction.from[0].publicKey;
				const unixTime = new Date().getTime();
				const blockId = block.id;
				const blockHash = block.hash;
				const lockBlock = 0;
				const signedMessage =
					identifier + publicKey + blockId + blockHash;
				const signature = this.app.crypto.signMessage(
					signedMessage,
					await this.app.wallet.getPrivateKey()
				);
				const signer = this.registry_publickey;
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
		} catch (error) {
			console.error(
				'Registry: Error receiving register request transaction.',
				error
			);
		}
	}

	async sendRegisterSuccessTransaction(tx, obj) {
		try {
			let from = tx.from[0].publicKey;
			let { identifier } = tx.returnMessage();
			if (!from) {
				throw Error('REGISTRY: NO "FROM" PUBLIC KEY FOUND');
			}
			let request = 'register success';
			let newtx =
				await this.app.wallet.createUnsignedTransactionWithDefaultFee(
					from
				);
			newtx.addFrom(this.publicKey);

			newtx.msg = {
				request,
				module: 'Registry',
				identifier,
				...obj
			};

			await newtx.sign();
			console.log('sending register success tx');
			await this.app.network.propagateTransaction(newtx);
		} catch (error) {
			console.error(
				'REGISTRY: error creating register request transaction',
				error
			);
		}
	}

	async receiveRegisterSuccessTransaction(blk, tx) {
		try {
			let txmsg = tx.returnMessage();
			if (!txmsg) {
				throw Error('txmsg is invalid');
			}
			if (tx.from[0].publicKey == this.registry_publickey) {
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
							this.registry_publickey
						)
					) {
						if (this.publicKey != this.registry_publickey) {
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

							console.log(
								'receiving register success transaction'
							);
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
									'update_identifier',
									tx.to[0].publicKey
								);
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
				'Registry: Error receiving register success transaction'
			);
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
					this.registry_publickey
				);
			if (!newtx) {
				throw new Error(
					'Failed to create transaction in registry module.'
				);
			}

			// Set transaction details
			newtx.msg.module = 'Registry';
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
				'Registry: Error creating Update Request Transaction.',
				error
			);
			return false;
		}
	}

	async receiveUpdateRequestTransaction(block, transaction) {
		try {
			const txmsg = transaction.returnMessage();

			if (
				transaction.isTo(this.publicKey) &&
				this.publicKey === this.registry_publickey
			) {
				const identifier = txmsg.identifier;
				const publicKey = transaction.from[0].publicKey;
				const unixTime = new Date().getTime();
				const blockId = block.id;
				const blockHash = block.hash;
				const lockBlock = 0;
				const signedMessage =
					identifier + publicKey + blockId + blockHash;
				const signature = this.app.crypto.signMessage(
					signedMessage,
					await this.app.wallet.getPrivateKey()
				);
				const signer = this.registry_publickey;
				const data = txmsg.data;
				const bio = txmsg.bio;
				const photo = txmsg.photo;
				console.log(bio, data, photo, 'updating records');
				const result = await this.updateRecord(
					identifier,
					bio,
					photo,
					data
				);

				console.log(result, 'result from updating record');
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
		} catch (error) {
			console.error(
				'Registry: Error receiving register request transaction.',
				error
			);
		}
	}

	async sendUpdateSuccessTransaction(tx, obj) {
		try {
			let from = tx.from[0].publicKey;
			let { identifier } = tx.returnMessage();
			if (!from) {
				throw Error('REGISTRY: NO "FROM" PUBLIC KEY FOUND');
			}
			let request = 'update success';
			let newtx =
				await this.app.wallet.createUnsignedTransactionWithDefaultFee(
					from
				);
			newtx.addFrom(this.publicKey);

			newtx.msg = {
				request,
				module: 'Registry',
				identifier,
				...obj
			};

			await newtx.sign();
			console.log('sending register success tx');
			await this.app.network.propagateTransaction(newtx);
		} catch (error) {
			console.error(
				'REGISTRY: error creating register request transaction',
				error
			);
		}
	}
	async receiveUpdateSuccessTransaction(blk, tx) {
		try {
			let txmsg = tx.returnMessage();
			if (!txmsg) {
				throw Error('txmsg is invalid');
			}
			if (tx.from[0].publicKey == this.registry_publickey) {
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
							this.registry_publickey
						)
					) {
						if (this.publicKey != this.registry_publickey) {
							if (!this.app.BROWSER) {
								let res = await this.updateRecord(
									identifier,
									bio,
									photo,
									data
								);
							}

							console.log(
								'receiving register success transaction'
							);
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
									'update_identifier',
									tx.to[0].publicKey
								);
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
				'Registry: Error receiving update success transaction'
			);
		}
	}
}

module.exports = Registry;
