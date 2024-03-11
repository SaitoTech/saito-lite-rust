const JSON = require('json-bigint');
const LimboMainTemplate = require('./main.template');
const LimboMenu = require('./menu');
const ArcadeInitializer = require('./initializer');
const SaitoSidebar = require('./../../../lib/saito/ui/saito-sidebar/saito-sidebar');

class LimboMain {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;

		//
		// left sidebar
		//
		this.sidebar = new SaitoSidebar(this.app, this.mod, '.saito-container');
		this.sidebar.align = 'nope';
		this.menu = new LimboMenu(this.app, this.mod, '.saito-sidebar.left');
		this.sidebar.addComponent(this.menu);

	}

	async render() {
		if (document.querySelector('.saito-container')) {
			this.app.browser.replaceElementBySelector(
				LimboMainTemplate(),
				'.saito-container'
			);
		} else {
			this.app.browser.addElementToSelector(
				LimboMainTemplate(),
				this.container
			);
		}

		await this.sidebar.render();

		//
		// invite manager
		//
		await this.app.modules.renderInto('.limbo-chat-box');


		this.attachEvents();
	}

	attachEvents() {

	}
}

module.exports = LimboMain;
