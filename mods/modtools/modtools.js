var saito = require('../../lib/saito/saito');
var ModTemplate = require('../../lib/templates/modtemplate');
const PeerService = require('saito-js/lib/peer_service').default;
var SaitoOverlay = require('../../lib/saito/ui/saito-overlay/saito-overlay');
var AppSettings = require('./lib/modtools-settings');

class ModTools extends ModTemplate {

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
		this.prune_after = 1500000; // ~1 day
		this.styles = [
			'/modtools/style.css',
		];

		//
		// stores the objects
		//
		//	{
		//		publickey: ____________
		//		from:	[] , 
		//		created_at:	time to live
		//	}
		//
		this.whitelist = [];
		this.blacklist = [];

		//
		// share with peers
		//
		this.whitelist_to_share = [];
		this.blacklist_to_share = [];

		//
		// searchable publickeys, nothing more
		//
		this.whitelisted_publickeys = [];
		this.blacklisted_publickeys = [];

		this.apps = {};

		return this;
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

		//
		// modtools -- share whitelists / blacklists
		//
		if (service.service === "modtools") {

			let message = {};
                        message.request = 'modtools';
                        message.data = {};
                        message.data.request = 'whitelist';

                        app.network.sendRequestAsTransaction(
                        	message.request,
                                message.data,
                                (res) => {
					if (res.whitelist) {

console.log("*");
console.log("*");
console.log("*");
console.log("FETCHED WHITELIST: " + JSON.stringify(res));

                                		if (res.whitelist.length > 0) {
                                        		modtools_self.addPeerWhitelist(res.whitelist);
                                        	}
                                        }
				},
                                peer.peerIndex
                        );

			let bmessage = {};
                        bmessage.request = 'modtools';
                        bmessage.data = {};
                        bmessage.data.request = 'blacklist';

                        app.network.sendRequestAsTransaction(
                        	bmessage.request,
                                bmessage.data,
                                (res) => {
					if (res.blacklist) {

console.log("*");
console.log("*");
console.log("*");
console.log("FETCHED BLACKLIST: " + JSON.stringify(res));

                                		if (res.blacklist.length > 0) {
                                        		modtools_self.addPeerBlacklist(res.blacklist);
                                        	}
                                        }
				},
                                peer.peerIndex
                        );

		}

	}


	//
	// happy to share whitelists and blacklists with peers
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
                        if (req.data.request === 'whitelist') {
                                if (mycallback) {
                                        mycallback({ whitelist : ["THIS IS A THE WHITELIST PROVIDED BY HANDLE PEER TRANSACTION"] });
                                        return 1;
                                }
                        }

                        if (req.data.request === 'blacklist') {
                                if (mycallback) {
                                        mycallback({ blacklist : ["THIS IS A THE BLACKLIST PROVIDED BY HANDLE PEER TRANSACTION"] });
                                        return 1;
                                }
                        }
		}
	
		// return 0 if callback not fired
		return 0;

                return super.handlePeerTransaction(app, tx, peer, mycallback);
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

	async initialize(app) {

		await super.initialize(app);

		let modtools_self = this;
		modtools_self.load();


		this.app.connection.on(
                        'saito-blacklist',
                        async (address) => {
				modtools_self.blacklistAddress(address);
                        }
		);

		this.app.connection.on(
                        'saito-unblacklist',
                        async (address) => {
				modtools_self.unblacklistAddress(address);
                        }
		);

		this.app.connection.on(
                        'saito-whitelist',
                        async (address) => {
				modtools_self.whitelistAddress(address);
                        }
		)

		this.app.connection.on(
                        'saito-unwhitelist',
                        async (address) => {
				modtools_self.unwhitelistAddress(address);
                        }
		)


		//
		// parse wallet to add 
		//
		this.apps['Chat'] = "*";

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
						if (this.apps[app.name] == "*") { return 1; }
					}

					return 0;
				}
			}
		}
		if (type === 'saito-moderation-core') {
			return {
                                filter_func: (tx = null) => {
                                        if (tx == null || app == null) { return 0; }
					if (this.whitelisted_publickeys.includes(add)) { return 1; }				
					if (this.blacklist_publickeys.includes(add)) { return 0; }
					return 1;
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

	blacklistAddress(add, moderator="") {
		if (moderator == "") { moderator = this.publicKey; }
		if (!this.blacklisted_publickeys.includes(add)) {
                	this.blacklisted_publickeys.push(add);
                	this.blacklist.push({ publickey : add , from : [moderator] , created_at : new Date().getTime() });
			this.save();
                }
	}

	whitelistAddress(add, moderator="") {
		if (moderator == "") { moderator = this.publicKey; }
		if (!this.whitelisted_publickeys.includes(add)) {
                	this.whitelisted_publickeys.push(add);
                	this.whitelist.push({ publickey : add , from : [moderator] , created_at : new Date().getTime() });
			this.save();
                }
	}

	prune() {
		for (let i = 0; i < this.whitelist.length; i++) {
			if (this.whitelist[i].moderator == this.publicKey) {
				this.whitelist.splice(i, 1);
			}
		}
		for (let i = 0; i < this.blacklist.length; i++) {
			if (this.blacklist[i].moderator == this.publicKey) {
				this.blacklist.splice(i, 1);
			}
		}
	}

	save() {
		if (!this.app.options.modtools) { this.app.options.modtools = {}; }
	  	this.app.options.modtools.whitelist = this.whitelist;
	  	this.app.options.modtools.blacklist = this.blacklist;
		this.app.storage.saveOptions();
	}

	load() {
		if (!this.app.options.modtools) { this.app.options.modtools = {}; }
		if (!this.app.options.modtools.whitelist) { this.app.options.modtools.whitelist = []; }
		if (!this.app.options.modtools.blacklist) { this.app.options.modtools.blacklist = []; }
	  	this.whitelist = this.app.options.modtools.whitelist;
	  	this.blacklist = this.app.options.modtools.blacklist;
		for (let i = 0; i < this.whitelist.length; i++) { this.whitelisted_publickeys.push(this.whitelist[i].publickey); }
		for (let i = 0; i < this.blacklist.length; i++) { this.blacklist_publickeys.push(this.blacklist[i].publickey); }
	}


}

module.exports = ModTools;
