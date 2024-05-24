var saito = require('../../lib/saito/saito');
var ModTemplate = require('../../lib/templates/modtemplate');

class ModTools extends ModTemplate {

	constructor(app) {

		super(app);
		this.app = app;
		this.name = 'ModTools';
		this.appname = 'ModTools';
		this.slug = 'modtools';
		this.description = 'Module for managing and customizing wallet and application moderation tools';
		this.class = 'utility';
		this.categories = 'Core Utilities';
		this.icon = 'fas fa-eye-slash';
		this.styles = [
			'/modtools/style.css',
		];

		this.whitelist = [];
		this.blacklist = [];
		this.apps = {};

		return this;
	}

	async initialize(app) {

		await super.initialize(app);

		let modtools_self = this;
		modtools_self.load();


		this.app.connection.on(
                        'saito-blacklist',
                        async (address) => {
				modtools_self.blacklist();
                        }
		}

		this.app.connection.on(
                        'saito-whitelist',
                        async (address) => {
				modtools_self.whitelist();
                        }
		}




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
		// this moderation-level examines ALL transactions and permits or prevents them
		// from being processed by ALL applications.
		//
		if (type === 'core-moderation') {
			return {
                                filter_func: (tx = null) => {
                                        if (tx == null) { return 0; }
					if (this.whitelist.includes(tx.from[0].publicKey) { return 1; }
					if (this.blacklist.includes(tx.from[0].publicKey) { return 0; }
					return 1;
				}
			}
		}

		//
		// this moderation-level examines ALL transactions that are sent into specific 
		// applications and checks to see if they are permitted. it will block applications
		// from being processed if they do not meet criteria.
		//
		if (type === 'app-moderation') {
			return {
                                filter_func: (app = null , tx = null) => {
                                        if (tx == null || app == null) { return 0; }
					if (this.whitelist.includes(tx.from[0].publicKey) { return 1; }
					if (this.blacklist.includes(tx.from[0].publicKey) { return 0; }

					//
					// any app-specific custom settings?
					//
					if (this.apps[app.name]) {


					}

					return 1;
				}
			}
		}

		//
		// this moderation-level examines ALL transactions that arrive via handlePeerRequest
		// and permits or prevents them from being processed by ALL applications.
		//
		if (type === 'swarm-moderation') {
			return {
                                filter_func: (tx = null) => {
                                        if (tx == null) { return 0; }
					if (this.whitelist.includes(tx.from[0].publicKey) { return 1; }
					if (this.blacklist.includes(tx.from[0].publicKey) { return 0; }
					return 1;
				}
			}
		}

		return null;
	}

	blacklist(add) {
		if (!this.blacklist.includes(address)) {
                	this.blacklist.push(address);
			this.save();
                }
	}

	whitelist(add) {
		if (!this.whitelist.includes(address)) {
                	this.whitelist.push(address);
			this.save();
                }
	}

	save() {
	  	this.app.options.modtools.whitelist = this.whitelist;
	  	this.app.options.modtools.blacklist = this.blacklist;
		this.app.storage.saveOptions();
	}

	load() {
	  	this.whitelist = this.app.options.modtools.whitelist;
	  	this.blacklist = this.app.options.modtools.blacklist;
	}


}

module.exports = ModTools;
