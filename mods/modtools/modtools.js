var saito = require('../../lib/saito/saito');
var ModTemplate = require('../../lib/templates/modtemplate');
const PeerService = require('saito-js/lib/peer_service').default;
var SaitoOverlay = require('../../lib/saito/ui/saito-overlay/saito-overlay');
var AppSettings = require('./lib/modtools-settings');

class ModTools extends ModTemplate {

//
// blacklist and whitelist format
//
// { 
//	publickey : add , 
//	from : [moderator] , 
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
		this.name = 'ModTools';
		this.appname = 'ModTools';
		this.slug = 'modtools';
		this.description = 'Module for managing and customizing wallet and application moderation tools';
		this.class = 'modtools';
		this.categories = 'Core Moderation';
		this.icon = 'fas fa-eye-slash';
		//this.prune_after = 1500000; // ~1 day
		this.prune_after = 60000; // ~1 minute
		this.max_hops = 2; // stop blacklisting after N hops
		this.styles = [
			'/modtools/style.css',
		];

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

		//
		// searchable publickeys, nothing more
		//
		this.whitelisted_publickeys = [];
		this.blacklisted_publickeys = [];

		this.apps = {};

		return this;
	}


	async initialize(app) {

		await super.initialize(app);

		let modtools_self = this;
		modtools_self.load();


		//
		// obj = {
		//   
		//
		// }
		//
		this.app.connection.on(
                        'saito-blacklist',
                        async (obj) => {

				//
				// first we blacklist the address
				//
				if (!obj.address) { obj.address = ""; }
				if (!obj.duration) { obj.duration = 0; }
				if (!obj.moderator) { obj.moderator = ""; }
				let address = obj.address;
				let duration = obj.duration;
				let moderator = obj.moderator;
				if (duration == 0) { duration = modtools_self.prune_after; }
				if (!moderator) { moderator = this.publicKey; }
				let cd = new Date().getTime();
				modtools_self.blacklistAddress(address, moderator, cd, duration);
				//
				// next we share it with peers
				//
				let newtx = await this.createBlacklistTransaction(address, moderator, duration);
				let txmsg = newtx.returnMessage();

				this.app.network.sendRequestAsTransaction(
					'modtools',
					txmsg.data
				);
			}
		);


		this.app.connection.on(
                        'saito-whitelist',
                        async (obj) => {

				//
				// first we whitelist the address
				//
				if (!obj.address) { obj.address = ""; }
				if (!obj.duration) { obj.duration = 0; }
				if (!obj.moderator) { obj.moderator = ""; }
				let address = obj.address;
				let duration = obj.duration;
				let moderator = obj.moderator;
				if (duration == 0) { duration = modtools_self.prune_after; }
				if (!moderator) { moderator = this.publicKey; }
				let cd = new Date().getTime();
				modtools_self.whitelistAddress(address, moderator, cd, duration);

				//
				// next we share it with peers
				//
				let newtx = await this.createWhitelistTransaction(address, moderator, duration);
				let txmsg = newtx.returnMessage();

				this.app.network.sendRequestAsTransaction(
					'modtools',
					txmsg.data
				);
			}
		);

		this.app.connection.on(
                        'saito-unblacklist',
                        async (address) => {
				modtools_self.unblacklistAddress(address, moderator);
                        }
		);

		this.app.connection.on(
                        'saito-unwhitelist',
                        async (address, moderator="", duration=modtools_self.prune_after) => {
				modtools_self.unwhitelistAddress(address);
                        }
		)


		//
		// parse wallet to add 
		//
		this.apps['Chat'] = "*";

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
		if (service.service === "modtools") {

			let message = {};
                        message.request = 'modtools';
                        message.data = {};
                        message.data.request = 'load_whitelist';

                        app.network.sendRequestAsTransaction(
                        	message.request,
                                message.data,
                                (res) => {
					if (res.whitelist) {
                                		if (res.whitelist.length > 0) {
                                        		modtools_self.addPeerWhitelist(peer.publicKey, res.whitelist);
                                        	}
                                        }
				},
                                peer.peerIndex
                        );

			let bmessage = {};
                        bmessage.request = 'modtools';
                        bmessage.data = {};
                        bmessage.data.request = 'load_blacklist';

                        app.network.sendRequestAsTransaction(
                        	bmessage.request,
                                bmessage.data,
                                (res) => {
					if (res.blacklist) {
                                		if (res.blacklist.length > 0) {
                                        		modtools_self.addPeerBlacklist(peer.publicKey, res.blacklist);
                                        	}
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

		if (txmsg.request === "modtools") {
			if (txmsg.data) {
				if (txmsg.data.request == "whitelist") {
        				await this.receiveWhitelistTransaction(blk, tx, conf, this.app);
				}
				if (txmsg.data.request == "blacklist") {
        				await this.receiveBlacklistTransaction(blk, tx, conf, this.app);
				}
			}
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

                let req = tx.returnMessage();

                if (!req?.request || !req?.data) {
                        return 0;
                }

                var response = {};

                //
                // saves TX containing archive insert instruction
                //
                if (req.request === 'modtools') {
                        if (req.data.request === 'load_whitelist') {
                                if (mycallback) {
                                        mycallback({ whitelist : this.whitelist });
                                        return 1;
                                }
                        }
                        if (req.data.request === 'load_blacklist') {
                                if (mycallback) {
                                        mycallback({ blacklist : this.blacklist });
                                        return 1;
                                }
                        }
                        if (req.data.request === 'whitelist') {
        			this.receiveWhitelistTransaction(null, tx, 0, this.app);
                                return 1;
                        }
                        if (req.data.request === 'blacklist') {
        			this.receiveBlacklistTransaction(null, tx, 0, this.app);
                                return 1;
                        }
		}
	
		// return 0 if callback not fired
		return 0;

                return super.handlePeerTransaction(app, tx, peer, mycallback);
        }


	async createBlacklistTransaction(key) {
    		let newtx = await this.app.wallet.createUnsignedTransaction();
        
    		newtx.msg = {
      			module: this.name,
      			request: "modtools",
      			data: { request : "blacklist" , address : key },
    		};
  
    		//await newtx.sign();
    		//await this.app.network.propagateTransaction(newtx);
    
    		return newtx;
  	}
        
	async createWhitelistTransaction(key) {
    		let newtx = await this.app.wallet.createUnsignedTransaction();
    		newtx.msg = {
      			module: this.name,
      			request: "modtools",
      			data: { request : "whitelist" , address : key },
    		};
  
    		//await newtx.sign();
    		//await this.app.network.propagateTransaction(newtx);
    
    		return newtx;
  	}
        
	async receiveBlacklistTransaction(blk, tx, conf, app) {
		let txmsg = tx.returnMessage();
		let address = txmsg.data.address;
		let moderator = tx.from[0].publicKey;
		let created_at = new Date().getTime();
		let duration = this.prune_after;
		if (txmsg.data.duration) {
			let d = parseInt(txmsg.data.duration);
			if (d > 0) { duration = d; }
		}
		if (this.canPeerBlacklist(moderator)) {
			this.blacklistAddress(address, moderator, created_at, duration);
		}
	}

	async receiveWhitelistTransaction(blk, tx, conf, app) {
		let txmsg = tx.returnMessage();
		let address = txmsg.data.address;
		let moderator = tx.from[0].publicKey;
		let created_at = new Date().getTime();
		let duration = this.prune_after;
		if (txmsg.data.duration) {
			let d = parseInt(txmsg.data.duration);
			if (d > 0) { duration = d; }
		}
		if (this.canPeerWhitelist(moderator)) {
			this.whitelistAddress(address, moderator, created_at, duration);
		}
	}




  	hasSettings() {
    		return true;
  	}
 
  	loadSettings(container = null) {
    		if (!container){
      			let overlay = new SaitoOverlay(this.app, this.mod);
      			overlay.show(`<div class="module-settings-overlay"><h2>Moderation Settings</h2></div>`);
      			container = ".module-settings-overlay";
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
	respondTo(type = '') {

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
                                filter_func: (app = null , tx = null) => {
                                        if (tx == null || app == null) { return 0; }

					//
					// any app-specific moderation settings?
					//
					if (this.apps[app.name]) {
						// permit everything
						if (this.apps[app.name] == "*") { return 1; }
					}
/*
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
*/
					return 0;
				}
			}
		}
		if (type === 'saito-moderation-core') {
			return {
                                filter_func: (tx = null) => {
                                        if (tx == null) { return 0; }
                                        if (!tx.from) { return 0; }
                                        if (!tx.from[0].publicKey) { return 0; }
					let add = tx.from[0].publicKey;
					if (this.whitelisted_publickeys.includes(add)) { return 1; }				
					if (this.blacklisted_publickeys.includes(add)) { return -1; }
					return 0;
				}
			}
		}

		return null;
	}

	unblacklistAddress(add) {
		if (this.blacklisted_publickeys.includes(add)) {
			for (let i = 0; i < this.blacklist.length; i++) {
				if (this.blacklist[i].publickey == add) {
					this.blacklist.splice(i, 1);
					break;
				}
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
		if (this.whitelisted_publickeys.includes(add)) {
			for (let i = 0; i < this.whitelist.length; i++) {
				if (this.whitelist[i].publickey == add) {
					this.whitelist.splice(i, 1);
					break;
				}
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

	canPeerWhitelist(moderator="") {
		if (!this.permissions) { return 0; }
		if (this.permissions.mode == "public") { return 1; }
		if (this.permissions.mode == "friends") {
			if (this.app.keychain.hasSharedSecret(moderator)) { return 1; }
			return 0;
		}
		if (this.permissions.mode == "custom") {
			let key = this.app.keys.returnKey(moderator);
			if (key.sync_whitelist == true) { return 1; }
			return 0;
		}
		return 0;
	}

	canPeerBlacklist(moderator="") {
		if (!this.permissions) { return 0; }
		if (this.permissions.mode == "public") { return 1; }
		if (this.permissions.mode == "friends") {
			if (this.app.keychain.hasSharedSecret(moderator)) { return 1; }
			return 0;
		}
		if (this.permissions.mode == "custom") {
			let key = this.app.keys.returnKey(moderator);
			if (key.sync_blacklist == true) { return 1; }
			return 0;
		}
		return 0;
	}

	addPeerBlacklist(moderator, list=[]) {

		if (!list) { return; }

		//
		// we do not process a list that blacklists US or anyone that we have
		// whitelisted.
		//
		for (let i = 0; i < list.length; i++) {
			//
			// we do not process a list that blacklists addresses we have whitelisted
			//
			if (this.isBlacklisted(list[i].publickey)) { return 0; }
			if (list[i].publickey == this.publicKey) { return 0; }
		}

		for (let i = 0; i < list.length; i++) {
			if (list[i].hop <= this.max_hops) {
				this.blacklistAddress(list[i].publickey , moderator, list[i].created_at);
			}
		}
		this.save();
	}

	addPeerWhitelist(moderator, list=[]) {
		if (!list) { return; }
		let am_i_blacklisted = 0;
		let is_anyone_whitelisted = 0;
		for (let i = 0; i < list.length; i++) {
			if (list[i].hop <= this.max_hops) {
				this.whitelistAddress(list[i].publickey , moderator, list[i].created_at);
			}
		}
		this.save();
	}

	blacklistAddress(add="", moderator="", created_at=0, duration=0, hop=0) {
		// there is an edge-case where the first address will be added address-free, so checking and bailing
	  	if (add == "") { return; }
		if (duration == "") { duration = this.prune_after; }
		if (moderator == "") { moderator = this.publicKey; }
		if (!this.blacklisted_publickeys) { this.blacklisted_publickeys = []; }
		if (!this.blacklisted_publickeys.includes(add)) {
                	this.blacklisted_publickeys.push(add);
                	this.blacklist.push({ publickey : add , from : [moderator] , duration : duration , created_at : new Date().getTime() , hop : (hop+1) });
			this.save();
                }
	}

	whitelistAddress(add="", moderator="", created_at=0, duration=0, hop=0) {
		// there is an edge-case where the first address will be added address-free, so checking and bailing
	  	if (add == "") { return; }
		if (duration == 0) { duration = this.prune_after; }
		if (moderator == "") { moderator = this.publicKey; }
		if (!this.whitelisted_publickeys) { this.whitelisted_publickeys = []; }
		if (!this.whitelisted_publickeys.includes(add)) {
                	this.whitelisted_publickeys.push(add);
                	this.whitelist.push({ publickey : add , from : [moderator] , duration : duration , created_at : new Date().getTime() , hop : (hop+1) });
			this.save();
                }
	}

	prune() {
		let current_time = new Date().getTime();
		for (let i = 0; i < this.whitelist.length; i++) {
			if (this.whitelist[i].moderator == this.publicKey) {
				if (this.whitelist[i].duration != -1) {
					if (this.whitelist[i].duration > 0) {
						if (this.whitelist[i].duration < (current_time - this.whitelist[i].created_at)) {
							this.whitelist.splice(i, 1);
						}
					} else {
						if (this.prune_after < (current_time - this.whitelist[i].created_at)) {
							this.whitelist.splice(i, 1);
						}
					}
				}
			}
		}
		for (let i = 0; i < this.blacklist.length; i++) {
			if (this.blacklist[i].moderator == this.publicKey) {
				if (this.prune_after < (current_time - this.blacklist[i].created_at)) {
					this.blacklist.splice(i, 1);
				}
			}
		}
	}

	updatePermissions(mode="") {	
		if (mode == "" && mode != "public" && mode != "custom" && mode != "friends") { return; }
		if (mode == "") { return; }
		this.permissions.mode = mode;
		this.save();
	}

	isBlacklisted(add="") {
		if (this.blacklisted_publickeys.includes(add)) { return 1; }
		return 0;
	}

	isWhitelisted(add="") {
		if (this.whitelisted_publickeys.includes(add)) { return 1; }
		return 0;
	}

	save() {
		if (!this.app.options.modtools) { this.app.options.modtools = {}; }
	  	this.app.options.modtools.whitelist = this.whitelist;
	  	this.app.options.modtools.blacklist = this.blacklist;
	  	this.app.options.modtools.permissions = this.permissions;
		this.app.storage.saveOptions();
	}

	load() {
		if (!this.app.options.modtools) { this.app.options.modtools = {}; }
		if (!this.app.options.modtools.whitelist) { this.app.options.modtools.whitelist = []; }
		if (!this.app.options.modtools.blacklist) { this.app.options.modtools.blacklist = []; }
		if (!this.app.options.modtools.permissions) { 
		  this.app.options.modtools.permissions = {
		    mode : "friends" ,		// friends = anyone in my keylist
						// public = literally anyone
						// custom = manually tag keys w/ blacklist/whitelist
						// none = no moderation
		    mods : [] ,
		    share_blacklist : true ,
		    share_whitelist : true ,
		    sync_blacklist : true ,
		    sync_whitelist : true ,
		  };
		}
	  	this.whitelist = this.app.options.modtools.whitelist;
	  	this.blacklist = this.app.options.modtools.blacklist;
	  	this.permissions = this.app.options.modtools.permissions;
		for (let i = 0; i < this.whitelist.length; i++) { this.whitelisted_publickeys.push(this.whitelist[i].publickey); }
		for (let i = 0; i < this.blacklist.length; i++) { this.blacklisted_publickeys.push(this.blacklist[i].publickey); }
	}


}

module.exports = ModTools;
