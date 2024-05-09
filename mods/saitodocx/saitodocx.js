const saito = require('./../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');
const SaitoHeader = require('../../lib/saito/ui/saito-header/saito-header');
const SaitoOverlay = require('../../lib/saito/ui/saito-overlay/saito-overlay');
const localforage = require('localforage');
const PeerService = require('saito-js/lib/peer_service').default;
const SaitoDocxMain = require('./lib/saitodocx-main');

class SaitoDocx extends ModTemplate {
	constructor(app) {
		super(app);

		this.name = 'Saito Docx';
		this.slug = 'saitodocx';
		this.description = 'Module to create, view & share documents';
		this.categories = 'Utilities';
		this.overlay = null;

		this.styles = ['/saitodocx/style.css'];

		//
		// UI components
		//
		this.main = null;
		this.header = null;
		this.icon_fa = 'fas fa-user-friends';
		this.debug = false;
	}

	respondTo(type, obj = null) {
		return super.respondTo(type, obj);
	}

	async initialize(app) {
		console.log('saitodocx initialize ////');
		await super.initialize(app);

		if (this.browser_active) {
			this.styles.unshift('/saito/saito.css');
		}
	}


	//////////////////////////
	// Rendering Components //
	//////////////////////////
	async render() {
		let app = this.app;
		let mod = this.mod;

		this.main = new SaitoDocxMain(app, this);
		this.header = new SaitoHeader(app, this);
		await this.header.initialize(this.app);

		this.addComponent(this.main);
		this.addComponent(this.header);

		await super.render(app, this);
	}


	async onPeerServiceUp(app, peer, service) {
		let league_self = this;

		if (service.service === 'saitodocx') {

		}
	}

	async onConfirmation(blk, tx, conf) {
		if (conf != 0) {
			return;
		}

		try {
			let txmsg = tx.returnMessage();

			if (this.debug) {
				console.log('LEAGUE onConfirmation: ' + txmsg.request);
			}

			if (txmsg.request === 'saitodocx create') {
				//await this.receiveCreateTransaction(blk, tx, conf);
			} else {
				//Don't save or refresh if just a game move!!!
				return;
			}

			if (this.app.BROWSER) {
			}
		} catch (err) {
			console.log('ERROR in saitodocx onConfirmation: ' + err);
		}

		return;
	}


}

module.exports = SaitoDocx;
