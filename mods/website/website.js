const path = require('path');
const saito = require('../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');

class Website extends ModTemplate {
	constructor(app) {
		super(app);

		this.app = app;
		this.name = 'Website';
		this.slug = 'website';
		this.description = 'Module that creates a root website on a Saito node.';
		this.categories = 'Utilities Communications';
		this.class = 'utility';
		this.header = null;
		return this;
	}

	initializeHompage(app) {
		const wallet_init_button = document.querySelector('.wallet-init-button');
		wallet_init_button.addEventListener('click', () => {
			alert('wallet_init_button');
		});
	}

	initializeHTML(app) {
		alert('initializeHTML');
	}
	async initialize(app) {
		await super.initialize(app);

		if(app.BROWSER == 1) {
			this.initializeHompage(app);
		}
	}

	webServer(app, expressapp, express) {
		expressapp.use(
			'/',
			express.static(`${__dirname}/../../mods/${this.dirname}/web`)
		);
		// TODO: change every reference in the site from /website/* to /* and remove this line
		expressapp.use(
			`/${this.dirname}/`,
			express.static(`${__dirname}/../../mods/${this.dirname}/web`)
		);
	}
}
module.exports = Website;
