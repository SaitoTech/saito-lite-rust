const saito = require('./../../lib/saito/saito');
const OnePlayerGameTemplate = require('../../lib/templates/oneplayer-gametemplate');
const PeerService = require('saito-js/lib/peer_service').default;
const NwasmGameOptionsTemplate = require('./lib/nwasm-game-options.template');
const UploadRom = require('./lib/upload-rom');
const ControlsOverlay = require('./lib/controls');
const NwasmLibrary = require('./lib/libraries');
const SaveGameOverlay = require('./lib/save-games');
const JSON = require('json-bigint');
const xorInplace = require('buffer-xor/inplace');
const Transaction = require('../../lib/saito/transaction').default;


//
// NWasm Library
//
// the library module is used to index ROMS I have saved in my own transaction
// archives for curation, personal use and lending as legally permitted. It queries
// my peers for items they have indexed in the same collections, and fetches those
// records on load.
//
// the library abstracts away the storage and ownership of the content, assigning
// control across the distributed network to whichever publickey is in possession
// of the rights to use.
//
// The Nwasm components abstract away the saving and loading of the ROMs themselves
// and initialization of the webpage.
//
// 	ROMS -- saved as 'Nwams' modules
// 	SAVEGAMES --- saved as 'NwasmGAMESIG' (hash of title)
//
class Nwasm extends OnePlayerGameTemplate {

	constructor(app) {

		super(app);

		this.app = app;
		this.name = 'Nwasm';
		this.slug = 'nwasm';
		this.gamename = 'Nintendo 64';
		this.description = `The Saito Nintendo 64 emulator provides a user-friendly in-browser N64 emulator that allows archiving and playing the N64 games you own directly in your browser. Game files are encrypted so only you can access them and archived in your private transaction store.`;
		this.categories = 'Games Videogame Classic';

		this.uploader = null;
		this.ui = new NwasmLibrary(this.app, this);
		this.library = {};

		//
		// any games we can play or potentially borrow should be listed in the library object
		// we are going to maintain.
		//
		// this.library['publickey'] = [
		//    {
		//      id              : "id" ,
		//      title           : "title" ,
		//      description     : "description" ,
		//      num             : 1 ,                           // total in collection
		//      available       : 1 ,                           // total available (not in use)
		//      key             : "" ,                          // random key that encrypts content
		//      checkout        : [] ,
		//      sig             : "sig"                         // sig of transaction with content
		//   }
		// ]         
		//

		this.load();

		this.active_rom = null;
		this.active_rom_name = '';
		this.active_rom_sig = '';
		this.active_game = new ArrayBuffer(8);
		this.active_game_img = '';
		this.active_game_saves = [];

		this.active_game_time_played = 0;
		this.active_game_load_ts = 0;
		this.active_game_save_ts = 0;

		this.uploaded_rom = false;

		return this;
	}


	
	//
	// Library Management Functions
	//
        returnServices() {
                let services = [];
                if (this.app.BROWSER == 0) {
                        services.push(new PeerService(null, 'nwasm', 'Nwasm'));
                }
                return services;
        }      


        //
        // when we connect to a peer that supports the "Nwasm" service, we contact
        // them with a request for information on any library that they have in case
	// we can access it.
        //
        async onPeerServiceUp(app, peer, service = {}) {

                //
                // remote peer runs a library
                //
                if (service.service === 'nwasm') {
 
                	//
                        // we want to know what content is indexed for collection with specified name
                        //
                        let message = {};
                        message.request = 'nwasm collection';
                        message.data = {};

                        //
                        // add it to our library
                        //
                        app.network.sendRequestAsTransaction(
                        	message.request,
                                message.data,
                                (res) => {
                                	if (res.length > 0) {
                                        	library_self.library[peer.publicKey] = res;
                                        }
                                },
                                peer.peerIndex
                        );
                }
        }

        isItemInLibrary(item, peer = 'localhost') {
                if (peer === 'localhost') {
                        peer = this.publicKey;
                }
                if (this.library[peer]) {
                        let idx = -1;
                        let contains_item = false;
                        for (
                                let i = 0;
                                i < this.library[peer].length;
                                i++
                        ) {
                                if (
                                        item.id == this.library[peer].id
                                ) {
                                        return true;
                                }
                        }
                }
                return false;
        }

	


        addItemToLibrary(tx, secret_key="", peer = 'localhost') {

                if (peer === 'localhost') {
                        peer = this.publicKey;
                }

		let txmsg = tx.returnMessage();
		let does_item_exist_in_collection = false;

		if (!this.library[peer]) { this.library[peer] = []; }

                for (
                        let i = 0;
                        i < this.library[peer].length;
                        i++
                ) {
                        if (
                                this.library[peer][i].title === item.title &&
                                this.library[peer][i].sig == item.sig
                        ) {
                                does_item_exist_in_collection = true;
                        }
                }

		//
		// preventing unwitting duplication
		//
                if (does_item_exist_in_collection) {
                	try {
                        	let c = confirm('Your library already contains a copy of this item. Is this a new copy?');
                                if (!c) { alert('refusing to add duplicate item!'); return; }
				does_item_exist_in_collection = false;
                        } catch (err) {}
                }

		//
		// and push into library
		//
                if (!does_item_exist_in_collection) {

			if (!this.library[peer]) { this.library[peer] = []; }
                        this.library[peer].push({
				
				module		:	this.name ,
				id		:	txmsg.id ,
				title		:	txmsg.title ,
				key		:	secret_key ,
				owner		:	peer ,
				num		:	1 ,
				available	:	1 ,
				checkout	:	[] ,
				sig		:	tx.signature ,	
			});
			this.save();
                }

        }


	checkout(borrower, sig, mycallback) {

		//
		// cannot checkout if library has no reference
		//
		if (!this.library[this.publicKey]) { return; }

		//
		// find item
		//
		let idx = -1;
		for (
			let i = 0;
			i < this.library[this.publicKey].length;
			i++
		) {
			if (this.library[this.publicKey][i].sig === sig) {
				idx = i;
				break;
			}
		}

		//
		// if item exists
		//
		if (idx != -1) {

			//
			// grab item
			//
			let item = this.library[this.publicKey][idx];

			//
			// is it checked out ?
			//
			let is_already_borrowed = 0;
			let is_already_borrowed_idx = -1;
			for (let i = 0; i < item.checkout.length; i++) {
				if (item.checkout[i].publickey === borrower) {
					item.checkout[i].timestamp = new Date().getTime();
					is_already_borrowed_idx = i;
				}
			}

			//
			// the one condition we permit re-borrowing is if this user is the
			// one who has borrowed the item previously and has it in their
			// possession. in that case they have simply rebooted their
			// machine or browser, and we do not want to have policies that 
			// prevent them continuing.
			//
			// this "unsets" the loan so that it can be reset with the passing
			// through of control to the !is_already_borrowed sanity check.
			//
			if (is_already_borrowed) {
				for (let i = 0; i < item.checkout.length; i++) {
					if (item.checkout[i].publickey === borrower) {
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
					alert("item not available: " + item.available);
					return;
				}
				if (item.checkout.length > item.num) {
					alert("item not available - checked out: " + item.available);
					return;
				}
				//
				// record the checkout
				//
				item.checkout.push({
					publickey: borrower,
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
        //
        //
        async handlePeerTransaction(app, tx = null, peer, mycallback) {
                if (tx == null) {
                        return;
                }
                let message = tx.returnMessage();

                //
                // respond to requests for our local collection
                //
                if (message.request === 'nwasm collection') {
                        if (!message.data) {
                                return;
                        }
                        if (!message.data.collection) {
                                return;
                        }
                        if (!this.library[this.publicKey]) {
                                return;
                        }
                        if (mycallback) {
                                let x = JSON.parse(JSON.stringify(this.library[this.publicKey]));
                                for (let key in x) { x.random = ""; } // do not share decryption key
                                mycallback( x );
                                return 1;
                        }
                        return;
                }

                return super.handlePeerTransaction(app, tx, peer, mycallback);
        }







	//
	// when this game initializes it begins to monitor the console log. this is 
	// used to provide feedback into the Saito module when the game has loaded 
	// and when it is saving or loading files, etc.
	//
	async initialize(app) {

		await super.initialize(app);

		if (app.BROWSER == 0) {
			return;
		}

		//
		// uncheckout personal items
		//
		if (!this.library[this.publicKey]) { this.library[this.publicKey] = []; }
		for (let i = 0; i < this.library[this.publicKey].length; i++) {
		  let item = this.library[this.publicKey][i];
		  if (item.checkout.length > 0) {
		    for (let z = 0; z < item.checkout.length; z++) {
		      let borrower = item.checkout[z];
		      if (borrower.publickey === this.publicKey) {
			//
			// we borrowed from ourselves, so auto-return on refresh/reload
			//
			item.available++;
			item.checkout.splice(z, 1);
		      }
		    }
		  }
		}

		//
		// monitor log if browser
		//
		if (this.browser_active == 1) {
			{
				const log = console.log.bind(console);
				console.log = (...args) => {
					if (args.length > 0) {
						if (typeof args[0] === 'string') {
							this.processNwasmLog(args[0], log);
						}
						log(...args);
					}
				};
			}
		}
	}




	//////////////////////
	// UI and Rendering //
	//////////////////////
	async render(app) {
		let game_mod = this;
		if (!this.browser_active) {
			return;
		}

		super.render(app);

		//
		// ADD MENU
		//
		this.menu.addMenuOption('game-game', 'Game');
		this.menu.addSubMenuOption('game-game', {
			text: 'Upload',
			id: 'game-upload-rom',
			class: 'game-upload-rom',
			callback: function (app, game_mod) {
				game_mod.uploaded_rom = false;
				game_mod.active_rom_name = '';
				game_mod.menu.hideSubMenus();
				game_mod.uploadRom(app, game_mod);
			}
		});
		this.menu.addSubMenuOption('game-game', {
			text: 'Save',
			id: 'game-export',
			class: 'game-export',
			callback: function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				game_mod.exportState();
			}
		});
		this.menu.addSubMenuOption('game-game', {
			text: 'Load',
			id: 'game-import',
			class: 'game-import',
			callback: function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				let x = new SaveGameOverlay(app, game_mod);
				x.render(app, game_mod);
				//game_mod.importState();
			}
		});
		this.menu.addSubMenuOption('game-game', {
			text: 'Delete',
			id: 'game-rom-delete',
			class: 'game-rom-delete',
			callback: async function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				let c = confirm('Confirm: delete all your ROMS?');
				if (c) {
					await game_mod.deleteRoms();
					game_mod.ui.render();
				}
			}
		});
		this.menu.addChatMenu();
		this.menu.render();

		await this.ui.render();
	}


	/////////////////////////
	// Game Engine Support //
	/////////////////////////
	initializeGame(game_id) {
		let nwasm_self = this;

		if (!this.game.state) {
			this.game.state = {};
			this.game.queue = [];
			this.game.queue.push('round');
			this.game.queue.push('READY');
		}

		//
		// when games are saved in the emulator
		//
		this.app.connection.on('nwasm-export-game-save', (savegame) => {
			nwasm_self.active_game = savegame;
			nwasm_self.saveGameFile(savegame);
		});
	}

	handleGameLoop(msg = null) {
		///////////
		// QUEUE //
		///////////
		if (this.game.queue.length > 0) {
			let qe = this.game.queue.length - 1;
			let mv = this.game.queue[qe].split('\t');
			let shd_continue = 1;
			if (mv[0] === 'round') {
				this.game.queue.splice(this.game.queue.length - 1, 1);
			}
			if (shd_continue == 0) {
				return 0;
			}
		}
		return 1;
	}

	startPlaying(ts = null) {
		if (ts == null) {
			ts = new Date().getTime();
		}
		this.active_game_load_ts = ts;
		this.active_game_save_ts = ts;
		this.ui.hide();
	}

	stopPlaying(ts = null) {
		if (ts == null) {
			ts = new Date().getTime();
		}
		this.active_game_time_played += ts - this.active_game_load_ts;
		this.active_game_load_ts = ts;
	}

	////////////////////
	// ROM Management //
	////////////////////
	//
	// this function is run when the user uploads the ROM into their browser. it
	// encrypts the ROM using a secret key that is only known to this wallet and
	// then puts the encrypted ROM into a transaction which is saved through the
	// normal storage functions.
	//
	// the transaction will be indexed by the Archive module of any users who are
	// providing storage for this user, as well as their own browser possibly. the
	// same Archive module that provides storage can then listen on the network
	// for requests that will transfer ownership/control/rights as needed for
	// legal DRM usage.
	//
	// DO NOT CONSOLE LOG THIS FUNCTION as it is called from the browser when
	// parsing the logs for the NWASM game load condition. any attempt to output
	// a console.log here thus triggers circular loop.
	//
	async saveRomFile(data) {

		let nwasm_self = this;
		let secret_key = this.app.crypto.generateRandomNumber();
		let base64data = this.xorBase64(this.convertByteArrayToBase64(data), secret_key);

		let added_to_library = 0;
		let iobj = document.querySelector('.nwasm-upload-instructions');
		if (iobj) { iobj.innerHTML = 'bundling ROM into archive file...'; }

		//
		// we create a transaction that will have the encrypted ROM data
		// on it. because this transaction has a lot of binary data, we 
		// want to manually handle the save-transaction process
		//
		let newtx = await this.app.wallet.createUnsignedTransaction();
		newtx.msg = {
			module: this.name,
			id: this.app.crypto.hash(this.active_rom_name),
			type: this.app.crypto.hash(this.active_rom_name),
			title: this.active_rom_name.trim(),
			request: 'archive insert',
			data: base64data
		};

		document.querySelector('.loader').classList.add('steptwo');
		if (iobj) {
			iobj.innerHTML = 'cryptographically signing archive file...';
		}

		await newtx.sign();

		if (iobj) {
			let size = Object.keys(newtx).length;
			iobj.innerHTML = 'uploading archive file: ' + size + ' bytes';
		}

		//
		// save the encrypted ROM file
		//
		await this.app.storage.saveTransaction(newtx, {
			owner: this.publicKey,
			field1: this.name,
			field2: this.publicKey,
			field3: this.active_rom_name
		});

		if (iobj) {
			iobj.innerHTML = 'saving reference to local file';
		}

		//
		// add this to our library
		//
		this.addItemToLibrary(newtx, secret_key);

	}

	async deleteRoms() {

		let nwasm_mod = this;

		//
		// broadcast message instructing any archive to delete all ROMS or any other content 
		// associated with our publickey. this purges everything that you associated
		// with this collection and our publickey. this purges everything that you own
		// that is in your archive.
		//
		this.app.storage.deleteTransactions(
			{
				owner: this.publicKey,
				field1: this.name
			},

			() => {
				try {
					alert('Transactions deleted');
				} catch (err) {
					console.log(
						'error running alert when transactions deleted'
					);
				}
			},

			null
		);

		//
		// we also manually purge any library if installed locally
		//
		nwasm_mod.library[this.publicKey] = {};
		nwasm_mod.save();
		nwasm_mod.ui.render();

	}

	initializeRom(bytearray) {
		this.active_game_saves = [];
		myApp.initializeRom(bytearray);
		this.ui.hide();
	}

	returnAdvancedOptions() {
		return NwasmGameOptionsTemplate(this.app, this);
	}

	//
	// Saito Module gets feedback from the N64 Emulator by monitoring the console log
	// for updates on the state of the program execution (has it initialized? have we	
	// saved? etc.).
	//
	// for the love of God don't add console.logs within this function or you'll throw
	// execution into an infinite loop.
	//
	async processNwasmLog(logline = '', log) {
		let x = logline;
		let nwasm_self = this;

		//
		// emulator started
		//
		if (logline.indexOf('detected emulator started') == 0) {
			if (this.uploader != null) {
				this.ui.hide();
				this.uploader.overlay.hide();
			}
		}

		if (logline.indexOf('mupen64plus: ') == 0) {
			x = logline.substring(13);
			if (x.indexOf('Name: ') == 0) {
				x = x.substring(6);
				if (x.indexOf('muopen') > -1) {
					x = x.substring(0, x.indexOf('muopen'));
				}

				let len = x.trim().length;
				if (len > 6) {
					len = 6;
				}

				if (
					this.active_rom_name.indexOf(x.trim().substring(0, len)) !=
					0
				) {
					this.active_rom_name = x.trim();
					this.active_rom_sig = this.app.crypto.hash(
						this.active_rom_name
					);

					//
					// archive the rom
					//
					if (
						this.uploaded_rom == false &&
						this.active_rom_name !== ''
					) {
						this.uploaded_rom = true;
						let similar_rom_exists = false;

						//
						// save ROM in archives
						//
						similar_rom_exists = this.isItemInLibrary(
								{
									id: this.app.crypto.hash(this.active_rom_name)
								},
								this.publicKey
						);

						if (similar_rom_exists) {
							let c = confirm(
								'Archive: ROM with this name already archived - is this a separate lawful copy?'
							);
							if (c) {
								await this.saveRomFile(this.active_rom);
							}
						} else {
							await this.saveRomFile(this.active_rom);
						}
					}

					//
					// load 5 saved games
					//
					this.app.storage.loadTransactions(
						{ field1: 'Nwasm' + this.active_rom_sig, limit: 5 },
						function (txs) {
							try {
								for (let z = 0; z < txs.length; z++) {
									let newtx = txs[z];
									nwasm_self.active_game_saves.push(newtx);
								}
							} catch (err) {
								log('error loading Nwasm game...: ' + err);
							}
						}
					);
				}
			}
		}
	}


	editControls(app) {
		this.controls = new ControlsOverlay(app, this);
		this.controls.render(app, this);
	}

	uploadRom(app) {
		this.uploader = new UploadRom(app, this);
		this.uploader.render(app, this);
	}


	//////////////////
	// transactions //
	//////////////////
	loadRomFile(tx) {
	
		alert('in load ROM file... 1');

		let txmsg = tx.returnMessage();
		let secret_key = "";

		for (let peer in this.library) {
		  for (let i = 0; i < this.library[peer].length; i++) {
		    let item = this.library[peer][i];
		    console.log("ID: " + txmsg.id);
		    if (txmsg.id == item.id) {
		      console.log("KEY: " + item.key);
		      secret_key = item.key;
		    }
		  }
		}

		alert('in load ROM file... 2');

		//console.log(txmsg.data);

		let ab = this.convertBase64ToByteArray(this.xorBase64(txmsg.data, secret_key));

console.log("after convert base 64 to byte array...");

		alert('in load ROM file... 3');

		//
		// prevents us saving the file, this is an already uploaded rom
		//
		this.uploaded_rom = true;
		this.active_game_saves = [];

console.log("before start playing...");

		this.startPlaying();

		//
		// initialize ROM gets the ROM the APP and the MOD
		//
console.log("before initialize ROM...");
		myApp.initializeRom(ab, this.app, this);
	}

	loadSaveGame(sig) {
		for (let i = 0; i < this.active_game_saves.length; i++) {
			let newtx = this.active_game_saves[i];
			if (sig === newtx.signature) {
				let txmsg = newtx.returnMessage();
				let byteArray = this.convertBase64ToByteArray(txmsg.data);
				this.active_game = byteArray;
				myApp.loadStateLocal();
			}
		}
	}

	loadGameFile() {
		let nwasm_mod = this;
		let module_type = 'Nwasm' + this.active_rom_sig;

		this.app.storage.loadTransactions(
			{ field1: 'Nwasm' + this.active_rom_sig, limit: 1 },
			function (txs) {
				try {
					if (txs.length <= 0) {
						alert('No Saved Games Available');
					}
					let newtx = txs[0];
					let txmsg = newtx.returnMessage();
					let byteArray = nwasm_mod.convertBase64ToByteArray(
						txmsg.data
					);
					nwasm_mod.active_game = byteArray;
					mwasm_mod.active_game_time_played = txmsg.time_played;
					nwasm.startPlaying();
					myApp.loadStateLocal();
				} catch (err) {
					console.log('error loading Nwasm game...: ' + err);
				}
			}
		);
	}

	async saveGameFile(data) {
		let base64data = this.convertByteArrayToBase64(data);
		let screenshot = await this.app.browser.resizeImg(this.active_game_img);

		let newtx = await this.app.wallet.createUnsignedTransaction();

		this.stopPlaying();

		let obj = {
			module: this.name + this.active_rom_sig,
			request: 'upload savegame',
			name: this.active_rom_name.trim(),
			screenshot: screenshot,
			time_played: this.active_game_time_played,
			data: base64data
		};

		newtx.msg = obj;
		await newtx.sign();
		await this.app.storage.saveTransaction(newtx, {
			field1: 'Nwasm-' + this.active_rom_sig
		});
		this.active_game_saves.push(newtx);
	}

	sleep(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	/////////////////////
	// data conversion //
	/////////////////////
	convertByteArrayToBase64(data) {
		return Buffer.from(data, 'binary').toString('base64');
	}

	convertBase64ToByteArray(data) {
		let b = Buffer.from(data, 'base64');
		let b2 = new Uint8Array(b.length);
		for (let i = 0; i < b.length; ++i) {
			b2[i] = b[i];
		}
		return b2;
	}

	xorBase64(data, secret_key) {
		let b = Buffer.from(data, 'base64');
		let r = Buffer.from(secret_key, 'utf8');
		return xorInplace(b, r).toString('base64');
	}


	////////////////////////
	// saving and loading //
	////////////////////////
	saveState() {
		myApp.saveStateLocal();
	}

	loadState() {
		myApp.loadStateLocal();
	}

	exportState() {
		let nwasm_mod = this;
		this.app.browser.screenshotCanvasElementById('canvas', function (img) {
			nwasm_mod.active_game_img = img;
			myApp.saveStateLocal();
			myApp.exportStateLocal();
		});
	}

	importState() {
		if (this.active_game == null) {
			alert('Load from Transaction not done yet!');
		} else {
			this.loadGameFile();
		}
	}

	save() {
		if (!this.nwasm) { this.nwasm = {}; }
		for (let key in this.library) { if (this.library[key].length == 0) { delete this.library[key]; } }
		this.nwasm.library = this.library;
		this.app.options.nwasm = this.nwasm;
		this.app.storage.saveOptions();
        }

        load() {
		if (!this.nwasm) { this.nwasm = {}; }
                if (this.app.options.nwasm) {
                        this.nwasm = this.app.options.nwasm;
			if (this.nwasm.library) {
                          this.library = this.nwasm.library;
			}
                        return;
                }
                this.nwasm = {};
		this.nwasm.library = {};
                this.save();
	}

	webServer(app, expressapp, express){
		// opt out of index.js
		// revert to web directory
		let webdir = `${__dirname}/../../mods/${this.dirname}/web`;
		let fs = app?.storage?.returnFileSystem();

		if (fs != null) {
			if (fs.existsSync(webdir)) {
				expressapp.use(
					'/' + encodeURI(this.returnSlug()),
					express.static(webdir)
				);
			} else if (this.default_html) {
				expressapp.use(
					'/' + encodeURI(this.returnSlug()),
					express.static(__dirname + '/../../lib/templates/html')
				);
			}
		}
	}

}

module.exports = Nwasm;
