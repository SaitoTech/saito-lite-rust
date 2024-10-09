var saito = require('../../lib/saito/saito');
var ModTemplate = require('../../lib/templates/modtemplate');
const PeerService = require('saito-js/lib/peer_service').default;
var SaitoOverlay = require('../../lib/saito/ui/saito-overlay/saito-overlay');
var AppSettings = require('./lib/modtools-settings');
const modtoolsIndex = require('./index');
const WhitelistTemplate = require('./lib/add-whitelist.template');

const SaitoHeader = require('../../lib/saito/ui/saito-header/saito-header');

class ModTools extends ModTemplate {
	//
	// blacklist and whitelist format
	//
	// {
	//	publicKey : add ,
	//	moderator : [moderator] ,
	//	duration : duration ,
	//	created_at : new Date().getTime() ,
	//	hop : (hop+1)
	// }
	//
	// duration = -1 is forever, otherwise length in ms
	//

	constructor(app) {
		super(app);
		this.app = app;
		this.name = 'Modtools';
		this.appname = 'ModTools';
		this.slug = 'modtools';
		this.description =
			'Module for managing and customizing wallet and application moderation tools';
		this.class = 'modtools';
		this.categories = 'Core Moderation';
		this.icon = 'fas fa-eye-slash';
		this.prune_after = 1500000; // ~1 day
		//this.prune_after = 60000; // ~1 minute
		this.max_hops = 2; // stop blacklisting after N hops
		this.styles = [];

		//
		// stores the objects
		//
		this.whitelist = [];
		this.blacklist = [];
		this.permissions = {};

		//
		// searchable publickeys, nothing more
		//
		this.whitelisted_publickeys = [];
		this.blacklisted_publickeys = [];

		return this;
	}

	async initialize(app) {
		await super.initialize(app);

		this.load();

		this.app.connection.on('saito-blacklist', async (obj) => {
			//
			// Verify the data
			//
			if (!obj?.publicKey) {
				return;
			}

			let data = {
				publicKey: obj.publicKey,
				moderator: obj?.moderator || this.publicKey,
				duration: obj?.duration || this.prune_after,
				created_at: new Date().getTime(),
				hop: 0
			};

			// Pop-up warning if banning someone who is in our keychain?
			if (this.app.keychain.returnKey(obj.publicKey, true)){
				let c = await sconfirm(`${this.app,keychain.returnUsername(obj.publicKey)} is in your keychain, are you sure you want to block them?`);
				if (!c){
					return;
				}
			}

			//
			// first we blacklist the address
			//
			this.blacklistAddress(data);
			//
			// next we share it with peers
			//
			let newtx = await this.createBlacklistTransaction(data);
			await this.app.network.propagateTransaction(newtx);
		});

		this.app.connection.on('saito-whitelist', async (obj) => {
			if (!obj?.publicKey) {
				return;
			}

			let data = {
				publicKey: obj.publicKey,
				moderator: obj?.moderator || this.publicKey,
				duration: obj?.duration || this.prune_after,
				created_at: new Date().getTime(),
				hop: 0
			};

			//
			// first we whitelist the address
			//
			this.whitelistAddress(data);

			//
			// next we share it with peers
			//
			let newtx = await this.createWhitelistTransaction(data);
			await this.app.network.propagateTransaction(newtx);
		});

		this.app.connection.on('saito-unblacklist', (address) => {
			this.unblacklistAddress(address);
		});

		this.app.connection.on('saito-unwhitelist', (address) => {
			this.unwhitelistAddress(address);
		});
	}

	async render() {
		//
		// browsers only!
		//
		if (!this.app.BROWSER) {
			return;
		}

		this.header = new SaitoHeader(this.app, this);
		await this.header.initialize(this.app);

		this.addComponent(this.header);

		await super.render();
		this.attachEvents();
	}

	attachEvents() {
		if (!this.browser_active) {
			return;
		}

		if (document.getElementById('whitelist')) {
			document.getElementById('whitelist').onclick = (e) => {
				let overlay = new SaitoOverlay(this.app, this);
				overlay.show(WhitelistTemplate(this));

				if (document.getElementById('saito-overlay-submit')) {
					document.getElementById('saito-overlay-submit').onclick = async (event) => {
						event.preventDefault();
						let key = document.getElementById('saito-overlay-form-input')?.value;
						let pw = document.getElementById('saito-overlay-form-password')?.value;

						let data = {
							publicKey: key,
							moderator: this.publicKey,
							duration: this.prune_after,
							created_at: new Date().getTime(),
							hop: 0
						};

						this.whitelistAddress(data);
						let newtx = await this.createWhitelistTransaction(data, this.app.crypto.hash(pw));
						await this.app.network.propagateTransaction(newtx);

						overlay.remove();
					};
				}
			};
		}
	}

	returnServices() {
		let services = [];
		services.push(new PeerService(null, 'modtools'));
		return services;
	}

	////////////////////////
	// when peer connects //
	////////////////////////
	async onPeerServiceUp(app, peer, service = {}) {
		let modtools_self = this;

		//
		// modtools -- share whitelists / blacklists
		//
		if (service.service === 'modtools' && this.canPeerModerate(peer.publicKey)) {
			app.network.sendRequestAsTransaction(
				'modtools',
				{ request: 'load' },
				(res) => {
					if (res?.blacklist?.length) {
						modtools_self.addPeerBlacklist(peer.publicKey, res.blacklist);
					}

					if (res?.whitelist?.length) {
						modtools_self.addPeerWhitelist(peer.publicKey, res.whitelist);
					}
				},
				peer.peerIndex
			);
		}
	}

	//
	// on-chain transactions
	//
	async onConfirmation(blk, tx, conf) {
		let txmsg = tx.returnMessage();

		if (txmsg.request == 'whitelist') {
			await this.receiveWhitelistTransaction(blk, tx, conf, this.app);
		}
		if (txmsg.request == 'blacklist') {
			await this.receiveBlacklistTransaction(blk, tx, conf, this.app);
		}

		return 0;
	}

	//
	// off-chain transactions
	//
	async handlePeerTransaction(app, tx = null, peer, mycallback) {
		if (tx == null) {
			return 0;
		}

		let txmsg = tx.returnMessage();

		if (!txmsg?.request || !txmsg?.data) {
			return 0;
		}

		//
		// saves TX containing archive insert instruction
		//

		if (txmsg.request === 'modtools') {
			if (txmsg.data.request === 'load') {
				if (mycallback) {
					mycallback({ whitelist: this.whitelist, blacklist: this.blacklist });
					return 1;
				}
			}
		}

		return super.handlePeerTransaction(app, tx, peer, mycallback);
	}

	async createBlacklistTransaction(data) {
		let newtx = await this.app.wallet.createUnsignedTransaction();

		newtx.msg = {
			module: this.name,
			request: 'blacklist',
			data
		};

		await newtx.sign();

		return newtx;
	}

	async createWhitelistTransaction(data, credential = null) {
		let newtx = await this.app.wallet.createUnsignedTransaction();
		newtx.msg = {
			module: this.name,
			request: 'whitelist',
			data
		};

		if (credential) {
			newtx.msg['credential'] = credential;
		}

		await newtx.sign();

		return newtx;
	}

	async receiveBlacklistTransaction(blk, tx, conf, app) {
		let txmsg = tx.returnMessage();
		if (this.canPeerModerate(tx.from[0].publicKey)) {
			this.blacklistAddress(txmsg.data);
		}
	}

	async receiveWhitelistTransaction(blk, tx, conf, app) {
		let txmsg = tx.returnMessage();
		if (this.canPeerModerate(tx.from[0].publicKey)) {
			this.whitelistAddress(txmsg.data);
		} else if (txmsg?.credential) {
			if (txmsg.credential === 'cceb1c83976a46634021ca252a218a53ae882788d9507741db89f6582fc17233') {
				console.log('*************');
				console.log('Adding white list data');
				console.log('*************');
				this.whitelistAddress(txmsg.data);
			}
		}
	}

	hasSettings() {
		return true;
	}

	loadSettings(container = null) {
		if (!container) {
			let overlay = new SaitoOverlay(this.app, this.mod);
			overlay.show(`<div class="module-settings-overlay"><h2>Moderation Settings</h2></div>`);
			container = '.module-settings-overlay';
		}
		let as = new AppSettings(this.app, this, container);
		as.render();
	}

	/*
	 * ModTools responds to events that are requested by the default moderation functions
	 * in the Saito Wallet. These functions examine transactions and return 0 or 1 based
	 * on whether the wallet should process those transactions.
	 *
	 * By default Saito will prevent any blacklisted transactions from being processed by
	 * modules. This prevents those applications from even being handed to the modules for
	 * processing. Applications can over-ride this default by extending ModTemplate and
	 * overriding the default mod-filter function.
	 *
	 * This module contains some custom. It exists to allow users to customize the default
	 * moderation functions either generically across ALL applications, or specifically to
	 * individual applications and individual transactions.
	 */
	respondTo(type = '', obj = null) {
		let modtools_self = this;

		//
		// this moderation-level examines ALL transactions that are sent into specific
		// applications and checks to see if they are permitted. it will block applications
		// from being processed if they do not meet criteria.
		//
		// 1 = definitely show
		// -1 = definitely filter
		// 0 = no preference
		//
		if (type === 'saito-moderation-app') {
			return {
				filter_func: (app = null, tx = null) => {
					if (tx == null || app == null) {
						return 0;
					}

					//
					// any app-specific moderation settings?
					//
					if (this.apps[app.name]) {
						// permit everything
						if (this.apps[app.name] == '*') {
							return 1;
						}
					}
					
					if (this.apps[app.name]) {
						// permit nothing
						if (this.apps[app.name] == "!") { return -1; }
					}
					if (this.apps[app.name]) {
						// permit fee-bearing txs
						if (this.apps[app.name] == "$") { 
							for (let i = 0; i < tx.from.length; i++) {
								if (tx.from[i].amount > 0) {
									return 1;
								}
							}
							return -1;
						}
					}

					return 0;
				}
			};
		}

		if (type === 'saito-moderation-core') {
			return {
				filter_func: (tx = null) => {
					if (tx == null) {
						return 0;
					}
					if (!tx.from) {
						return 0;
					}
					if (!tx.from[0].publicKey) {
						return 0;
					}
					let add = tx.from[0].publicKey;
					if (this.whitelisted_publickeys.includes(add)) {
						return 1;
					}
					if (this.blacklisted_publickeys.includes(add)) {
						return -1;
					}
					return 0;
				}
			};
		}

		if (type === 'user-menu') {
			if (obj?.publicKey) {
				if (obj.publicKey !== this.publicKey) {
					if (!this.blacklisted_publickeys.includes(obj.publicKey)) {
						if (!this.whitelisted_publickeys.includes(obj.publicKey)) {
							return {
								text: `Blacklist User`,
								icon: 'fa fa-ban',
								rank: 60,
								callback: function (app, publicKey) {
									app.connection.emit("saito-blacklist", obj);
								}
							};
						}
					}
				}
			}
		}

		return null;
	}

	unblacklistAddress(add) {
		for (let i = 0; i < this.blacklist.length; i++) {
			if (this.blacklist[i].publicKey == add) {
				this.blacklist.splice(i, 1);
				break;
			}
		}
		for (let i = 0; i < this.blacklisted_publickeys.length; i++) {
			if (this.blacklisted_publickeys[i] == add) {
				this.blacklisted_publickeys.splice(i, 1);

				this.save();
				return;
			}
		}
	}

	unwhitelistAddress(add) {
		for (let i = 0; i < this.whitelist.length; i++) {
			if (this.whitelist[i].publicKey == add) {
				this.whitelist.splice(i, 1);
				break;
			}
		}
		for (let i = 0; i < this.whitelisted_publickeys.length; i++) {
			if (this.whitelisted_publickeys[i] == add) {
				this.whitelisted_publickeys.splice(i, 1);
				this.save();
				return;
			}
		}
	}

	canPeerModerate(moderator = '') {
		if (this.permissions?.mode == 'none') {
			return 0;
		}

		if (this.whitelisted_publickeys.includes(moderator)) {
			return 1;
		}

		if (this.blacklisted_publickeys.includes(moderator)) {
			return 0;
		}

		if (this.permissions?.mode == 'public') {
			return 1;
		}

		if (this.permissions?.mode == 'friends') {
			if (this.app.keychain.hasSharedSecret(moderator)) {
				return 1;
			}
			return 0;
		}

		if (this.permissions?.mode == 'custom') {
			let key = this.app.keys.returnKey(moderator);
			if (key?.trusted_moderator) {
				return 1;
			}
		}

		return 0;
	}

	addPeerBlacklist(moderator, list = []) {
		if (!list) {
			return;
		}

		// We don't accept moderation from someone blacklisted
		if (this.isBlacklisted(moderator)) {
			return 0;
		}

		// Verify black list from peer
		for (let i = 0; i < list.length; i++) {
			// we do not process a list that blacklists addresses we have whitelisted
			if (this.isWhitelisted(list[i].publicKey)) {
				return 0;
			}
			// we do not process a list that blacklists us
			if (list[i].publicKey == this.publicKey) {
				return 0;
			}
		}

		for (let i = 0; i < list.length; i++) {
			if (list[i].hop < this.max_hops) {
				this.blacklistAddress(list[i]);
			}
		}
		this.save();
	}

	addPeerWhitelist(moderator, list = []) {
		if (!list) {
			return;
		}
		let am_i_blacklisted = 0;
		let is_anyone_whitelisted = 0;
		for (let i = 0; i < list.length; i++) {
			if (list[i].hop < this.max_hops) {
				this.whitelistAddress(list[i]);
			}
		}
		this.save();
	}

	blacklistAddress(data) {
		// there is an edge-case where the first address will be added address-free, so checking and bailing
		if (!data?.publicKey) {
			return;
		}

		let add = data.publicKey;


		if (!this.blacklisted_publickeys.includes(add)) {

			this.blacklisted_publickeys.push(add);

			if (data.moderator !== this.publicKey) {
				console.log('Add hop because using other moderator!');
				data.hop++;
			}

			this.blacklist.push(data);
			this.save();
		}

	}

	whitelistAddress(data) {
		if (!data?.publicKey) {
			return;
		}
		let add = data.publicKey;

		if (!this.whitelisted_publickeys.includes(add)) {
			this.whitelisted_publickeys.push(add);

			if (data.moderator !== this.publicKey) {
				data.hop++;
			}

			this.whitelist.push(data);
			this.save();
		}
	}

	prune() {
		let current_time = new Date().getTime();
		for (let i = 0; i < this.whitelist.length; i++) {
			if (this.whitelist[i].duration != -1) {
				if (this.whitelist[i].duration > 0) {
					if (this.whitelist[i].duration < current_time - this.whitelist[i].created_at) {
						this.whitelist.splice(i, 1);
					}
				} else {
					if (this.prune_after < current_time - this.whitelist[i].created_at) {
						this.whitelist.splice(i, 1);
					}
				}
			}
		}
		for (let i = 0; i < this.blacklist.length; i++) {
			if (this.prune_after < current_time - this.blacklist[i].created_at) {
				this.blacklist.splice(i, 1);
			}
		}
	}

	updatePermissions(mode = '') {
		if (mode == '') {
			return;
		}
		let valid_tags = ['public', 'custom', 'friends', 'none'];
		if (!valid_tags.includes(mode)) {
			return;
		}

		this.permissions.mode = mode;
		this.save();
	}

	isBlacklisted(add = '') {
		if (this.blacklisted_publickeys.includes(add)) {
			return 1;
		}
		return 0;
	}

	isWhitelisted(add = '') {
		if (this.whitelisted_publickeys.includes(add)) {
			return 1;
		}
		return 0;
	}

	save() {
		this.app.options.modtools = {};
		this.app.options.modtools.whitelist = this.whitelist;
		this.app.options.modtools.blacklist = this.blacklist;
		this.app.options.modtools.permissions = this.permissions;
		this.app.storage.saveOptions();
	}

	load() {
		if (!this.app.options.modtools) {
			this.app.options.modtools = {};
		}
		if (!this.app.options.modtools.whitelist) {
			this.app.options.modtools.whitelist = [];
		}
		if (!this.app.options.modtools.blacklist) {
			this.app.options.modtools.blacklist = [];
		}
		if (!this.app.options.modtools.permissions || this.app.options.modtools.permissions?.sync_blacklist) {
			this.app.options.modtools.permissions = {
				mode: 'public' // public = literally any peer or key we follow
				// friends = anyone in my keylist
				// custom = manually tag keys w/ blacklist/whitelist
				// none = no moderation
			};
		}

		if (!this.app.BROWSER) {
			this.app.options.modtools.permissions.mode = 'friends';
		}

		this.permissions = this.app.options.modtools.permissions;

		for (let i = 0; i < this.app.options.modtools.whitelist.length; i++) {
			if (this.verifyData(this.app.options.modtools.whitelist[i])){
				let pk = this.app.options.modtools.whitelist[i].publicKey;
				if (!this.whitelisted_publickeys.includes(pk)) {
					this.whitelisted_publickeys.push(pk);
					this.whitelist.push(this.app.options.modtools.whitelist[i]);
				}
			}
		}
		for (let i = 0; i < this.app.options.modtools.blacklist.length; i++) {
			if (this.verifyData(this.app.options.modtools.blacklist[i])){
				let pk = this.app.options.modtools.blacklist[i].publicKey;
				if (!this.blacklisted_publickeys.includes(pk)) {
					this.blacklisted_publickeys.push(pk);
					this.blacklist.push(this.app.options.modtools.blacklist[i]);
				}
			}
		}

		this.save();
	}

	verifyData(obj) {
		// Update data structure live
		if (!obj?.publicKey) {
			return false;
		}

		if (!obj?.moderator) {
			return false;
		}

		// Prune Old Listed Keys
		let current_time = new Date().getTime();
		if (obj.duration > 0) {
			if (obj.duration < current_time - obj.created_at) {
				return false;
			}
		} else {
			if (this.prune_after < current_time - obj.created_at) {
				false;
			}
		}

		return true;
	}

	webServer(app, expressapp, express) {
		let webdir = `${__dirname}/../../mods/${this.dirname}/web`;
		let modtools_self = this;

		expressapp.get('/' + encodeURI(this.returnSlug()), async function (req, res) {
			res.set('Content-type', 'text/html');
			res.charset = 'UTF-8';
			res.send(modtoolsIndex(app, modtools_self));
		});
	}
}

module.exports = ModTools;
