const saito = require('../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');
const PeerService = require('saito-js/lib/peer_service').default;

//
// Library
//
// the library  module is used to index content I have saved in my own transaction
// archives for curation, personal use and lending as legally permitted. It queries
// my peers for items they have indexed in the same collections, and fetches those
// records on load.
//
// the library abstracts away the storage and ownership of the content, assigning
// control across the distributed network to whichever publickey is in possession
// of the rights to use.
//
// this.collections = [
//   {
//     module 		: "Nwasm" ,
//     mod 		: this ,
//     collection 	: "Nwasm" ,
//     key 		: this.nwasm.random ,
//     shouldArchive 	: (tx) => { return false; } // true or false
//   }
// ]
//
// this.library[collection.id].peers{'publickey'} = [
//    {
//      id 		: "id" ,
//      title 		: "title" ,
//      description 	: "description" ,
//      num 		: 1 ,				// total in collection
//      available 	: 1 ,				// total available (not in use)
//      key 		: "" ,				// random key that encrypts content
//      checkout 	: [] ,
//      sig 		: "sig"				// sig of transaction with content
//   }
// ]
//
// The library module provides basic functionality for DRM-respecting management of this
// digital content. It specifically transfers ownership of the items in question when
// they are lent.
//
// Modules that wish to use the library to view/manage network-available content should
// respondTo() the "library-collection" event to inform the library of what kind of
// material it should track. The library will add this to its list of collections and
// start indexing and serving those materials to peers on request.
//
class Library extends ModTemplate {
	constructor(app) {
		super(app);

		this.app = app;
		this.name = 'Library';
		this.slug = 'library';
		this.description = `Adds digital rights management (DRM) and curation and lending functionality, permitting 
			users to create curated collections of content and share it in rights-permitting fashion.
		`;;
		this.categories = 'Core Utilities DRM';

		//
		// any library borrowing coded for 2 hour minimum increments
		// TODO -- is this still used
		this.return_milliseconds = 7200000;

		//
		// library['collection'].peers = {}
		//
		this.library = {};

		//
		// the information stored will look like this
		//
		//
		this.collections = [];

		//
		//
		//
		this.load();

		//
		// index transactions that are saved
		//
		app.connection.on('saito-save-transaction', (tx) => {
			//      console.log("---------------------");
			//      console.log("---------------------");
			//      console.log("IN LIBRARY ON SAVE TX");
			//      console.log("---------------------");
			//      console.log("---------------------");

			//
			// fetch information for index
			//
			let txmsg = tx.returnMessage();
			let id = txmsg.id;
			let title = txmsg.title;
			let module = txmsg.module;
			let request = txmsg.request || '';
			let sig = tx.signature;

			//
			// sanity check to avoid adding duplicates
			//
			let does_item_exist_in_collection = this.isItemInCollection(
				{ id: id },
				module
			);
			if (does_item_exist_in_collection) {
				try {
					let c = confirm(
						'Your library already contains a copy of this item. Is this a new copy?'
					);
					if (!c) {
						alert('refusing to add duplicate item!');
					}
				} catch (err) {}
			}

			//
			// add item to library
			//
			for (let i = 0; i < this.collections.length; i++) {
				if (this.collections[i].shouldArchive(tx)) {
					let item = {
						id: id,
						title: txmsg.title,
						description: '',
						num: 1, // total
						available: 1, // total available
						checkout: [],
						sig: sig
					};
					this.addItemToCollection(
						item,
						this.collections[i],
						this.publicKey
					);
					this.save();
				}
			}
		});
	}

	//
	// initialization
	//
	// this asks any modules we have installed locally whether they want library
	// support. if they do, we run addCollection() to make sure that we will index
	// and fetch information needed.
	//
	async initialize(app) {
		//
		// modules respondTo("library-collection") if they want the library to be
		// indexing content for them. we add each of the collections we are being
		// asked to manage to our library, and initialize it with sensible default
		// values.
		//
		await super.initialize(app);

		for (const m of app.modules.returnModulesRespondingTo(
			'library-collection'
		)) {
			this.addCollection(
				m.respondTo('library-collection'),
				this.publicKey
			);
		}
	}

	returnServices() {
		let services = [];
		if (this.app.BROWSER == 0) {
			services.push(new PeerService(null, 'library', 'Library'));
		}
		return services;
	}

	//
	// ON PEER SERVICE UP
	//
	// when we connect to a peer that supports the "Library" service, we contact
	// them with a request for any information on collections we are interested in
	// accessing.
	//
	async onPeerServiceUp(app, peer, service = {}) {
		let library_self = app.modules.returnModule('Library');

		//
		// remote peer runs a library
		//
		if (service.service === 'library') {
			//
			// fetch their library
			//
			for (let m of library_self.collections) {
				//
				// we want to know what content is indexed for collection with specified name
				//
				let message = {};
				message.request = 'library collection';
				message.data = {};
				message.data.collection = m.name;

				//
				// add it to our library
				//
				app.network.sendRequestAsTransaction(
					message.request,
					message.data,
					(res) => {
						if (res.length > 0) {
							library_self.library[m.collection].peers[
								peer.publicKey
							] = res; // res = collection
						}
					},
					peer.peerIndex
				);
			}
		}
	}

	//
	// handle off-chain requests for copies of specific collections we may be
	// indexing.
	//
	async handlePeerTransaction(app, tx = null, peer, mycallback) {
		if (tx == null) {
			return;
		}
		let message = tx.returnMessage();

		//
		// respond to requests for our local collection
		//
		if (message.request === 'library collection') {
			if (!message.data) {
				return;
			}
			if (!message.data.collection) {
				return;
			}
			if (!this.library[message.data.collection].peers[this.publicKey]) {
				return;
			}
			if (mycallback) {
				let x = JSON.parse(JSON.stringify(this.library[message.data.collection].peers[this.publicKey]));
				for (let key in x) { x.random = ""; } // do not share decryption key is all
				mycallback( this.library[message.data.collection].peers[this.publicKey] );
				return 1;
			}
			return;
		}

		return super.handlePeerTransaction(app, tx, peer, mycallback);
	}

	//
	// interacting with our collections
	//
	// - addCollection()
	// - isItemInCollection()
	// - addItemToCollection()
	// - checkoutItem()
	// - returnItem()
	//
	addCollection(collection, peer = 'localhost') {
		if (peer === 'localhost') {
			peer = this.publicKey;
		}

		if (this.collections[collection.name]) {
			if (this.app.BROWSER) {
				alert('collection already exists!');
			}
			return;
		}

		this.collections.push(collection);

		//
		// if this is an existing collection, we will already have content
		// indexed in our library. but if it is not indexed, we should create
		// the library and ensure we have "localhost" available as a peer
		// so there is a place to store our collection.
		//
		if (!this.library[collection.name]) {
			this.library[collection.name] = {};
			this.library[collection.name].peers = {};
			this.library[collection.name].peers[peer] = [];
		} else {
			if (!this.library[collection.name].peers) {
				this.library[collection.name].peers = {};
				this.library[collection.name].peers[peer] = [];
			}
		}

		this.save();
	}

	isItemInCollection(item, collection, peer = 'localhost') {
		if (peer === 'localhost') {
			peer = this.publicKey;
		}
		if (this.library[collection]) {
			let idx = -1;
			let contains_item = false;
			for (
				let i = 0;
				i < this.library[collection].peers[this.publicKey].length;
				i++
			) {
				let item = this.library[collection].peers[this.publicKey][i];
				if (
					item.id == this.library[collection].peers[this.publicKey].id
				) {
					return true;
				}
			}
		}
		return false;
	}

	addItemToCollection(item, collection, peer = 'localhost') {
		if (peer === 'localhost') {
			peer = this.publicKey;
		}

		if (!this.library[collection.name]) {
			this.addCollection(collection);
		}

		//
		// the object inside the library looks like this
		//
		// id 		: "id" ,
		// title	: "title" ,
		// description 	: "description" ,
		// num 		: 1 ,				// total in collection
		// available 	: 1 ,				// total available (not in use)
		// random 	: "" ,				// random hash used to encrypt
		// checkout 	: [] ,
		// sig 		: "sig"

		let does_item_exist_in_collection = false;

		//
		// every item must have a unique signature
		//
		for (
			let i = 0;
			i < this.library[collection.name].peers[peer].length;
			i++
		) {
			if (
				this.library[collection.name].peers[peer][i].title ===
					item.title &&
				this.library[collection.name].peers[peer][i].sig == item.sig
			) {
				does_item_exist_in_collection = true;
			}
		}

		if (!does_item_exist_in_collection) {
			this.library[collection.name].peers[peer].push(item);
		}
	}

	returnItem(collection, publicKey, sig, mycallback) {
		//
		// get index of item
		//
		let idx = -1;
		for (
			let i = 0;
			i < this.library[collection].peers[this.publicKey].length;
			i++
		) {
			if (this.library[collection].peers[this.publicKey][i].sig === sig) {
				idx = i;
				break;
			}
		}

		if (idx != -1) {
			//
			// find the item
			//
			let item = this.library[collection].peers[publicKey][idx];

			//
			// is it checked out ?
			//
			let is_already_borrowed = 0;
			let is_already_borrowed_idx = -1;
			for (let i = 0; i < item.checkout.length; i++) {
				if (item.checkout[i].publicKey === publicKey) {
					item.checkout[i].timestamp = new Date().getTime();
					is_already_borrowed_idx = i;
				}
			}

			//
			// the one condition we permit re-borrowing is if this user is the
			// one who has borrowed the item previously and has it in their
			// possession. in that case they have simply rebooted their
			// machine and should be provided with the data under the previous
			// valid request to borrow, since they are already marked as in
			// control of the item.
			//
			// first we "unset" the loan so that it can be reset with the passing
			// through of control to the !is_already_borrowed sanity check.
			//
			if (is_already_borrowed) {
				for (let i = 0; i < item.checkout.length; i++) {
					if (item.checkout[i].publicKey === publicKey) {
						item.checkout.splice(i, 1);
						// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!! //
						// be careful that item.available //
						// is not removed below for legal //
						// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!! //
						item.available++;
						this.save();
						is_already_borrowed = 0;
					}
				}
			}
		}
	}

	checkoutItem(collection, publicKey, sig, mycallback) {
		//
		// if the collection doesn't exist, we cannot lend
		//
		if (!this.library[collection]) {
			return;
		}

		//
		// get index of item
		//
		let idx = -1;
		for (
			let i = 0;
			i < this.library[collection].peers[this.publicKey].length;
			i++
		) {
			if (this.library[collection].peers[this.publicKey][i].sig === sig) {
				idx = i;
				break;
			}
		}

		//
		// if the item exists
		//
		if (idx != -1) {
			//
			// grab the item
			//
			let item = this.library[collection].peers[publicKey][idx];

			//
			// is it checked out ?
			//
			let is_already_borrowed = 0;
			let is_already_borrowed_idx = -1;
			for (let i = 0; i < item.checkout.length; i++) {
				if (item.checkout[i].publicKey === publicKey) {
					item.checkout[i].timestamp = new Date().getTime();
					is_already_borrowed_idx = i;
				}
			}

			//
			// the one condition we permit re-borrowing is if this user is the
			// one who has borrowed the item previously and has it in their
			// possession. in that case they have simply rebooted their
			// machine and should be provided with the data under the previous
			// loan.
			//
			// this "unsets" the loan so that it can be reset with the passing
			// through of control to the !is_already_borrowed sanity check.
			//
			//
			if (is_already_borrowed) {
				for (let i = 0; i < item.checkout.length; i++) {
					if (item.checkout[i].publicKey === publicKey) {
						item.checkout.splice(i, 1);
						// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!! //
						// be careful that item.available //
						// is not removed below for legal //
						// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!! //
						item.available++;
						this.save();
						is_already_borrowed = 0;
					}
				}
			}

			//
			// now we can permit the checkout
			//
			if (!is_already_borrowed) {
				if (item.available < 1) {
					alert('1 - ' + item.available);
					this.app.storage.loadTransactions({ sig: sig }, mycallback);
					return;
				}
				if (item.checkout.length > item.num) {
					alert('2 - ' + item.checkout.length + ' -- ' + item.num);
					this.app.storage.loadTransactions({ sig: sig }, mycallback);
					return;
				}
				//
				// record the checkout
				//
				item.checkout.push({
					publicKey: publicKey,
					ts: new Date().getTime()
				});
				// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!! //
				// be careful that item.available //
				// is not removed above for legal //
				// as allows sanity check         //
				// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!! //
				item.available--;
				this.save();

				alert('ABOUT TO CHECKOUT!');

				this.app.storage.loadTransactions({ sig: sig }, mycallback);
			}
		}
	}

	//
	// save and load
	//
	save() {
		this.app.options.library = this.library;
		this.app.storage.saveOptions();
	}

	load() {
		if (this.app.options.library) {
			this.library = this.app.options.library;
			return;
		}
		this.library = {};
		this.save();
	}

	async createBorrowTransaction(data) {
		let library_self = this;

		let obj = {
			module: 'Library',
			request: 'borrow',
			data: {
				return_tx: library_self.createReturnTransaction(data)
			}
		};
		for (let key in data) {
			obj.data[key] = data[key];
		}

		let newtx = await library_self.app.wallet.createUnsignedTransaction();
		newtx.msg = obj;
		await newtx.sign();
		await redsquare_self.app.network.propagateTransaction(newtx);

		return newtx;
	}

	async createReturnTransaction(data) {
		let library_self = this;

		let obj = {
			module: 'Library',
			request: '',
			data: {}
		};
		for (let key in data) {
			obj.data[key] = data[key];
		}

		let newtx = await library_self.app.wallet.createUnsignedTransaction();
		newtx.msg = obj;
		await newtx.sign();
		await redsquare_self.app.network.propagateTransaction(newtx);

		return newtx;
	}
}

module.exports = Library;
