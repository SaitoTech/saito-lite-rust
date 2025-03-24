import modtemplate from './../templates/modtemplate';
import * as JSON from 'json-bigint';
import Identicon from 'identicon.js';
import { Saito } from '../../apps/core';

class Keychain {
	public app: Saito;
	public publickey_keys_hmap: any;
	public keys: Array<any>;
	public groups: any;
	public modtemplate: any;
	public fetched_keys: Map<string, number>;
	public publicKey: string
	public identifier: string;
	public bid: bigint;
	public bsh: string;
	public lc: boolean;
	public hash: string;



	constructor(app: Saito) {
		this.app = app;
		this.publickey_keys_hmap = {}; // 1 if saved
		this.keys = [];
		this.groups = [];
		this.modtemplate = new modtemplate(this.app);
		this.fetched_keys = new Map<string, number>();
	}


	async initialize() {

		if (this.app.options.keys == null) {
			this.app.options.keys = [];
		}

		this.publicKey = await this.app.wallet.getPublicKey();

		//
		// saved keys
		//
		for (let i = 0; i < this.app.options.keys.length; i++) {
			//Rename JSON saved variable
			if (
				this.app.options.keys[i].publickey &&
				!this.app.options.keys[i].publicKey
			) {
				this.app.options.keys[i].publicKey =
					this.app.options.keys[i].publickey;
				delete this.app.options.keys[i].publickey;
			}
			this.keys.push(this.app.options.keys[i]);
			this.publickey_keys_hmap[this.app.options.keys[i].publicKey] = 1;
		}

		//
		// saved groups
		//
		if (this.app.options.groups == null) {
			this.app.options.groups = [];
		} else {
			this.groups = this.app.options.groups;
		}



		//
		// add my key if needed
		//
		if (this.app.options.keys.length == 0) {
			this.addKey({ publicKey: this.publicKey, watched: true });
		}


		// automatically remove old event keys & outdated modes
		let events = this.returnKeys({type: "scheduled_call"});	
		for (let e of events){
			this.removeKey(e.publicKey);
		}	

		events = this.returnKeys({type: "event"});
		let now = Date.now();
		for (let e of events){
			let scheduledTime = new Date(e.startTime).getTime();
			if (scheduledTime + 24*60*60*1000 < now){
				console.log("Event Over:", e);
				this.removeKey(e.publicKey);
			}
		}	

		this.saveKeys();


		//
		// creates hash of important info so we know if values change
		//
		this.hash = this.returnHash();

	}

	returnHash() {
		return this.app.crypto.hash(
			JSON.stringify(this.keys) + JSON.stringify(this.groups)
		);
	}

	//
	// adds an individual key, we have two ways of doing this !
	//
	// (publicKey, data)
	// ({ publicKey : x, data : y })
	//
	addKey(pa = null, da = null) {

		// You need at least one argument!
		if (pa === null) {
			return;
		}

		let data = { publicKey: '' };

		//
		// argument-overloading permitted !!
		//
		if (typeof pa === 'string') {
			data.publicKey = pa;
			for (let key in da) {
				if (key !== 'publicKey') {
					data[key] = da[key];
				}
			}
		} else {
			data = pa;
		}

		//
		// skip empty keys
		//
		//console.log("Add key: ", JSON.stringify(data));
		if (!data?.publicKey) {
			console.warn(
				'Keychain Error: cannot add key because unknown publicKey'
			);
			console.log(data);
			return;
		}

		//
		// update existing entry
		//
		for (let i = 0; i < this.keys.length; i++) {
			if (this.keys[i].publicKey === data.publicKey) {
				for (let key in data) {
					if (key !== 'publicKey') {
						this.keys[i][key] = data[key];
					}
				}
				this.saveKeys();
				return;
			}
		}

		//
		// or add new entry
		//
		let newkey = { publicKey: '' };
		newkey.publicKey = data.publicKey;
		for (let key in data) {
			if (key !== 'publicKey') {
				newkey[key] = data[key];
			}
		}
		this.keys.push(newkey);
		this.publickey_keys_hmap[newkey.publicKey] = 1;
		this.saveKeys();
	}




	decryptMessage(publicKey: string, encrypted_msg) {
		// submit JSON parsed object after unencryption
		for (let x = 0; x < this.keys.length; x++) {
			// check for matching public key && see if it has an aes_secret
			if (this.keys[x].publicKey === publicKey && this.keys[x].aes_secret) {
				const tmpmsg = this.app.crypto.aesDecrypt(
					encrypted_msg,
					this.keys[x].aes_secret
				);

				if (tmpmsg == null) {
					console.warn('Failed decryption with aes_secret');
					return null;
				}

				try {
					const decrypted_msg = JSON.parse(tmpmsg);

					// Succesful decryption and parsing returns here
					return decrypted_msg;
				} catch (err) {
					console.error('Failed to JSON.parse decrypted message', err);
					this.app.connection.emit('encrypt-decryption-failed', publicKey);
					return null;
				}
			}
		}

		if (this.app.BROWSER) {
			console.warn(
				"I don't share a decryption key with encrypter, cannot decrypt"
			);
			this.app.connection.emit('encrypt-decryption-failed', publicKey);
		}
		return null;
	}

	hasPublicKey(publicKey = '') {
		if (this.publickey_keys_hmap[publicKey]) {
			return true;
		}
		return false;
	}

	addGroup(group_id = '', data = { members: [] }) {
		//
		//
		//
		let group = null;

		for (let i = 0; i < this.groups.length; i++) {
			if (this.groups[i].id === group_id) {
				group = this.groups[i];
			}
		}

		if (group === null) {
			group = {};
			group.id = group_id;
			group.members = [];
			group.name = 'New Group';
			group.tag = '';
			group.block_id = 0;
			group.block_hash = 0;
		}

		for (let key in data) {
			if (key !== 'members') {
				group[key] = data[key];
			} else {
				if (data.members) {
					for (let i = 0; i < data.members.length++; i++) {
						this.addKey(data.members[i]);
						if (!group.members.includes(data.members[i])) {
							group.members.push(data.members[i]);
						}
					}
				}
			}
		}

		this.saveGroups();
	}

	decryptString(publicKey, encrypted_string) {
		for (let x = 0; x < this.keys.length; x++) {
			if (this.keys[x].publicKey == publicKey) {
				if (this.keys[x].aes_secret) {
					return this.app.crypto.aesDecrypt(
						encrypted_string,
						this.keys[x].aes_secret
					);
				}
			}
		}

		return encrypted_string;
	}

	encryptMessage(publicKey: string, msg) {
		for (let x = 0; x < this.keys.length; x++) {
			if (this.keys[x].publicKey === publicKey) {
				if (this.keys[x].aes_secret) {
					const jsonmsg = JSON.stringify(msg);
					return this.app.crypto.aesEncrypt(
						jsonmsg,
						this.keys[x].aes_secret
					);
				}
			}
		}
		console.warn('Message not encrypted, missing key');
		return msg;
	}

	hasSharedSecret(publicKey: string) {
		for (let x = 0; x < this.keys.length; x++) {
			if (
				this.keys[x].publicKey === publicKey ||
				this.keys[x].identifier === publicKey
			) {
				if (this.keys[x].aes_secret) {
					return true;
				}
			}
		}
		return false;
	}

	isWatched(publicKey) {
		for (let x = 0; x < this.keys.length; x++) {
			if (
				this.keys[x].publicKey == publicKey ||
				this.keys[x].identifier === publicKey
			) {
				if (this.keys[x].watched == true) {
					return true;
				}
			}
		}
		return false;
	}

	removeKey(publicKey = null) {
		if (publicKey == null) {
			return;
		}
		for (let x = this.keys.length - 1; x >= 0; x--) {
			if (this.keys[x].publicKey == publicKey) {
				this.keys.splice(x, 1);
				delete this.publickey_keys_hmap[publicKey];
				this.saveKeys();
				return;
			}
		}
	}

	returnKey(data = null, force_local_keychain = false) {
		//
		// data might be a publicKey, permit flexibility
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
		let key_idx = -1;
		for (let x = 0; x < this.keys.length; x++) {
			let match = true;
			for (let key in data) {
				if (this.keys[x][key] !== data[key]) {
					match = false;
				}
			}
			if (match) {
				key_idx = x;
				break; //Stop Looping
			}
		}

		let return_key = key_idx != -1 ? this.keys[key_idx] : null;

		if (force_local_keychain) {
			return return_key;
		}

		//
		// no match - maybe we have a module that has cached this information?
		//
		this.app.modules
			.getRespondTos('saito-return-key')
			.forEach((modResponse) => {
				let key = modResponse.returnKey(data);
				if (key) {
					if (return_key) {
						return_key = Object.assign(return_key, key);
					} else {
						return_key = key;
					}
				}
			});

		return return_key;
	}

	returnKeys(data = null, force_local_keychain = true) {
		const kx = [];

		//
		// no filters? return everything
		//
		if (data == null) {
			for (let x = 0; x < this.keys.length; x++) {
				if (
                    /*this.keys[x].lc &&*/ this.keys[x].publicKey !=
					this.publicKey
				) {
					kx.push(this.keys[x]);
				}
			}
		} else {
			//
			// if data filter for keys
			//
			for (let x = 0; x < this.keys.length; x++) {
				let match = true;
				for (let key in data) {
					if (this.keys[x][key] !== data[key]) {
						match = false;
					}
				}
				if (match == true) {
					kx.push(this.keys[x]);
				}
			}
		}

		if (!force_local_keychain){
			//
			//Fallback to cached registry
			//
			this.app.modules
				.getRespondTos('saito-return-key')
				.forEach((modResponse) => {
					//
					// Return keys converts the publickey->identifer object into
					// an array of {publicKey, identifier} objects
					//
					for (let key of modResponse.returnKeys()) {
						let can_add = true;

						// Don't add myself
						if (key.publicKey == this.publicKey) {
							continue;
						}

						// Make sure not already added from my actual keychain
						for (let added_keys of kx) {
							if (added_keys.publicKey == key.publicKey) {
								can_add = false;
								break;
							}
						}

						if (can_add) {
							kx.push(key);
						}
					}
				}
			);

		}

		return kx;
	}





	returnGroups() {
		return this.groups;
	}

	saveKeys() {
		this.app.options.keys = [...this.keys];
		this.app.storage.saveOptions();
		let new_hash = this.returnHash();
		if (new_hash != this.hash) {
			this.hash = new_hash;
			this.app.connection.emit('keychain-updated');
		}
	}

	saveGroups() {
		this.app.options.groups = this.groups;
		this.app.storage.saveOptions();
		if (this.returnHash() != this.hash) {
			this.hash = this.returnHash();
			this.app.connection.emit('keychain-updated');
		}
	}


	addCryptoAddress(publicKey, ticker, address) {

		if (!publicKey || !ticker || !address) {
			return;
		}

		// Is a contact and not myself
		if (!this.hasPublicKey(publicKey) || publicKey == this.publicKey){
			return;
		}

		// Is an address that needs caching
		if (ticker == "SAITO" || address == publicKey) {
			return;
		}

		let friend = this.returnKey(publicKey, true);

		if (!friend){
			return;
		}

		let crypto_addresses = friend?.crypto_addresses || {};

		if (!crypto_addresses?.ticker || crypto_addresses.ticker !== address){
			crypto_addresses[ticker] = address;
			this.app.keychain.addKey(publicKey, {
				crypto_addresses
			});
		}

	}


	returnIdenticon(publicKey: string, img_format = 'svg') {
		if (this.keys != undefined) {
			for (let x = 0; x < this.keys.length; x++) {
				if (this.keys[x].publicKey === publicKey) {
					if (
						this.keys[x].identicon != '' &&
						typeof this.keys[x].identicon !== 'undefined'
					) {
						return this.keys[x].identicon;
					}
				}
			}
		}

		//
		// if we reach here, generate from publicKey
		//
		const options = {
			//foreground: [247, 31, 61, 255],           // saito red
			//background: [64, 64, 64, 0],
			saturation: 0.6,
            brightness: 0.4,
			margin: 0.0, // 0% margin
			size: 420, // 420px square
			format: img_format // use SVG instead of PNG
		};
		const data = new Identicon(
			this.app.crypto.hash(publicKey),
			options
		).toString();
		return 'data:image/' + img_format + '+xml;base64,' + data;
	}

	returnIdenticonColorRGB(publicKey) {
		const hue =
			parseInt(this.app.crypto.hash(publicKey).substr(-7), 16) /
			0xfffffff;
		const saturation = 0.6;
		const brightness = 0.4;
		const values = this.hsl2rgb(hue, saturation, brightness).map(
			Math.round
		);
		return `rgba(${values.join(',')})`;
	}

	returnIdenticonColor(publicKey) {
		const hue =
			parseInt(this.app.crypto.hash(publicKey).substr(-7), 16) /
			0xfffffff;
		const saturation = 0.6;
		const brightness = 0.4;
		const values = this.hsl2rgb(hue, saturation, brightness).map(
			Math.round
		);
		const toHex = (c) => ('0' + c.toString(16)).slice(-2);
		return '#' + toHex(values[0]) + toHex(values[1]) + toHex(values[2]);
	}

	hsl2rgb(h, s, b) {
		h *= 6;
		s = [
			(b += s *= b < 0.5 ? b : 1 - b),
			b - (h % 1) * s * 2,
			(b -= s *= 2),
			b,
			b + (h % 1) * s,
			b + s
		];

		return [
			s[~~h % 6] * 255, // red
			s[(h | 16) % 6] * 255, // green
			s[(h | 8) % 6] * 255 // blue
		];
	}

	returnPublicKeyByIdentifier(identifier: string) {
		let key = this.returnKey({ identifier: identifier });
		if (key?.publicKey) {
			return key.publicKey;
		}
		console.log(identifier + " not found!");
		return null;
	}

	returnIdentifierByPublicKey(publicKey: string, returnKey = false): string {
		let key = this.returnKey({ publicKey: publicKey });
		if (key) {
			if (key.identifier) {
				return key.identifier;
			}
		}

		if (returnKey) {
			return publicKey;
		} else {
			return '';
		}
	}

	returnUsername(publicKey: string = "", max = 12): string {
		const name = this.returnIdentifierByPublicKey(publicKey, true);
		if (name != publicKey && name != '') {
			return name;
		}
		if (name === publicKey) {
			if (name.length > max) {
				//return name.substring(0, max) + '...';
				return 'Anon-' + name.substring(0, 6);
			}
		}
		return publicKey;
	}

	returnWatchedPublicKeys() {
		const x = [];
		for (let i = 0; i < this.keys.length; i++) {
			if (this.keys[i].watched) {
				x.push(this.keys[i].publicKey);
			}
		}
		return x;
	}




	returnKeyArchiveNodes(publicKey) {
		const keylist: any = this.app.options.keys;
		const key = keylist.find(key => key.publicKey === publicKey);
		if (key && key.profile && Array.isArray(key.profile.archive_nodes)) {
			const parsedArchiveNodes = key.profile.archive_nodes.map(node => {
				try {
					return JSON.parse(node);
				} catch (error) {
					console.error(`Failed to parse archive node: ${node}`, error);
					return null;
				}
			}).filter(node => node !== null);
			return parsedArchiveNodes || [];
		}else {
			console.warn('no archive nodes found');
			return [];
		}
	}

	/**
 * Adds a publicKey to the watch list and updates the keys storage.
 * This function takes a publicKey as input, marks it as watched, saves the updated keys,
 *
 * @param {string} publicKey The public key to add to the watch list. Defaults to an empty string.
 */
	addWatchedPublicKey(publicKey = '') {
		if (publicKey){
			this.addKey(publicKey, { watched: true });			
		}
	}

	/**
 * Marks a publicKey as not watched in the keys list.
 * This function takes a publicKey as input and updates its status to not watched,
 * without removing it from the list.
 *
 * @param {string} publicKey The public key to mark as not watched.
 */
	unwatchPublicKey(publicKey = '') {
		if (typeof publicKey !== 'string') {
			throw new Error('Invalid publicKey: must be a string');
		}
		const keyExists = this.keys.some(key => key.publicKey === publicKey);

		if (keyExists) {
			this.keys = this.keys.map(key => {
				if (key.publicKey === publicKey) {
					return { ...key, watched: false };
				}
				return key;
			});
			this.saveKeys();
		} else {
			console.warn(`PublicKey ${publicKey} not found.`);
		}
	}



	updateEncryptionByPublicKey(
		publicKey: string,
		aes_publicKey = '',
		aes_privatekey = '',
		shared_secret = ''
	) {
		if (!publicKey) {
			return;
		}
		this.addKey(publicKey, {
			aes_publicKey: aes_publicKey,
			aes_privatekey: aes_privatekey,
			aes_secret: shared_secret
		});

		//
		// remove the flag from broken encryption
		//
		let key = this.returnKey(publicKey, true);
		delete key.encryption_failure;

		this.saveKeys();

		console.log('SAVED CRYPTO AES: ' + publicKey);
		console.log(JSON.stringify(this.returnKey(publicKey)));

		return true;
	}
}

export default Keychain;

