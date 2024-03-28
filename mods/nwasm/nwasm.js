const saito = require('./../../lib/saito/saito');
const OnePlayerGameTemplate = require('../../lib/templates/oneplayer-gametemplate');
const NwasmGameOptionsTemplate = require('./lib/nwasm-game-options.template');
const UploadRom = require('./lib/upload-rom');
const ControlsOverlay = require('./lib/controls');
const NwasmLibrary = require('./lib/libraries');
const SaveGameOverlay = require('./lib/save-games');
const JSON = require('json-bigint');
const xorInplace = require('buffer-xor/inplace');
const Transaction = require('../../lib/saito/transaction').default;

//
// ROMS -- saved as 'Nwams' modules
// SAVEGAMES --- saved as 'NwasmGAMESIG' (hash of title)
//
class Nwasm extends OnePlayerGameTemplate {
	constructor(app) {
		super(app);

		this.app = app;
		this.name = 'Nwasm';

		this.gamename = 'Nintendo 64';
		this.description =
			'The Saito Nintendo 64 emulator provides a user-friendly in-browser N64 emulator that allows players to archive and play the N64 games you own directly in your browser. Game files are encrypted so only you can access them and archived in your private transaction store.';
		this.categories = 'Games Videogame Classic';
		this.uploader = null;

		this.library = new NwasmLibrary(this.app, this);

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

	async initialize(app) {
		await super.initialize(app);

		if (app.BROWSER == 0) {
			return;
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

	respondTo(type = '') {
		if (type === 'library-collection') {
			return {
				name: 'Nwasm',
				key: this.nwasm.random,
				//	mod : this ,
				shouldArchive: function (tx = null) {
					if (tx == null) {
						try {
							alert('NULL!');
						} catch (err) {}
						return false;
					}
					let txmsg = tx.returnMessage();
					if (txmsg.request === 'archive insert') {
						return true;
					}
					return false;
				}
			};
		}
		return super.respondTo(type);
	}

	async handlePeerTransaction(app, tx = null, peer, mycallback) {
		if (tx == null) {
			return;
		}
		let message = tx.returnMessage();

		//
		// this code doubles onConfirmation
		//
		if (message?.request === 'nwasm testing') {
			if (mycallback) {
				mycallback(
					'Handle Peer Request in Nwasm: this can be used for testing'
				);
				return 1;
			}
		}

		return super.handlePeerTransaction(app, tx, peer, mycallback);
	}

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
		/***
     this.menu.addSubMenuOption("game-game",{
      text : "Controls",
      id : "game-controls",
      class : "game-controls",
      callback : function(app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.editControls(app, game_mod);
      }
    });
     this.menu.addSubMenuOption("game-game",{
      text : "Instant Save",
      id : "game-save",
      class : "game-save",
      callback : function(app, game_mod) {
        game_mod.menu.hideSubMenus();
	game_mod.saveState();
      }
    });
     this.menu.addSubMenuOption("game-game",{
      text : "Instant Load",
      id : "game-load",
      class : "game-load",
      callback : function(app, game_mod) {
        game_mod.menu.hideSubMenus();
	game_mod.loadState();
      }
    });
     ***/
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
					game_mod.library.render();
				}
			}
		});

		this.menu.addChatMenu();
		this.menu.render();

		await this.library.render();
	}

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

	startPlaying(ts = null) {
		if (ts == null) {
			ts = new Date().getTime();
		}
		this.active_game_load_ts = ts;
		this.active_game_save_ts = ts;
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

		let base64data = this.xorBase64(this.convertByteArrayToBase64(data));
		let added_to_library = 0;
		let iobj = document.querySelector('.nwasm-upload-instructions');

		//
		// larger tx, so we use subrequest and manually handle the save
		// transaction process...
		//
		// the transaction goes into data, the type goes into type
		// and the rest is used by this module in handling the tansaction
		// callback.
		//
		let obj = {
			module: this.name,
			id: this.app.crypto.hash(this.active_rom_name),
			type: this.app.crypto.hash(this.active_rom_name),
			title: this.active_rom_name.trim(),
			request: 'archive insert',
			data: base64data
		};

		if (iobj) {
			iobj.innerHTML = 'bundling ROM into archive file...';
		}

		let newtx = await this.app.wallet.createUnsignedTransaction();
		newtx.msg = obj;

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
			field1: obj.module,
			field2: this.publicKey,
			field3: this.active_rom_name
		});

		//
		// and hide our instructions
		//
		this.hideLibrary();
	}

	async deleteRoms() {
		let nwasm_mod = this;

		//
		// broadcast message instructing any configured archives to delete all content associated
		// with this collection and our publickey.
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
		// and manually purge library if installed
		//
		let library_mod = this.app.modules.returnModule('Library');
		if (library_mod) {
			nwasm_mod.library[this.name] = {};
			nwasm_mod.library[this.name].peers = {};
			nwasm_mod.library[this.name].peers['localhost'] = [];
			nwasm_mod.save();
			nwasm_mod.updateVisibleLibrary();
		}
	}

	hideSplashScreen() {
		if (document.querySelector('.nwasm-instructions')) {
			document.querySelector('.nwasm-instructions').style.display =
				'none';
		}
		if (document.querySelector('.nwasm-selector')) {
			document.querySelector('.nwasm-selector').style.display = 'none';
		}
	}

	hideLibrary() {
		if (document.querySelector('.nwasm-instructions')) {
			document.querySelector('.nwasm-instructions').style.display =
				'none';
		}
		this.library.hide();
	}

	initializeRom(bytearray) {
		this.active_game_saves = [];
		myApp.initializeRom(bytearray);
		this.hideLibrary();
	}

	returnAdvancedOptions() {
		return NwasmGameOptionsTemplate(this.app, this);
	}

	//
	// for the love of God don't add console.logs within this function
	//
	async processNwasmLog(logline = '', log) {
		let x = logline;
		let nwasm_self = this;

		if (logline.indexOf('detected emulator started') == 0) {
			if (this.uploader != null) {
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
						// save ROM in archives --dynamically is best
						//
						let library_mod =
							this.app.modules.returnModule('Library');
						if (library_mod) {
							similar_rom_exists = library_mod.isItemInCollection(
								{
									id: this.app.crypto.hash(
										this.active_rom_name
									)
								},
								this.publicKey
							);
						}

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

		alert('in load ROM file... 2');

		console.log(txmsg.data);

		let ab = this.convertBase64ToByteArray(this.xorBase64(txmsg.data));

		alert('in load ROM file... 3');

		//
		// prevents us saving the file, this is an already uploaded rom
		//
		this.uploaded_rom = true;
		this.active_game_saves = [];

		this.startPlaying();

		//
		// initialize ROM gets the ROM the APP and the MOD
		//
		myApp.initializeRom(ab, this.app, this);
	}

	sleep(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
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

	xorBase64(data) {
		let b = Buffer.from(data, 'base64');
		let r = Buffer.from(this.nwasm.random, 'utf8');
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
		this.app.options.nwasm = this.nwasm;
		this.app.storage.saveOptions();
	}

	load() {
		if (this.app.options.nwasm) {
			this.nwasm = this.app.options.nwasm;
			return;
		}
		this.nwasm = {};
		this.nwasm.random = this.app.crypto.generateRandomNumber();
		this.save();
	}

	webServer(app, expressapp, express){
		//Opt out of fancy index.js
		// revert to basic modtemplate code
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
