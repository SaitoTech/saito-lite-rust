const JSON = require('json-bigint');
const LimboMainTemplate = require('./main.template');
const LimboMenu = require('./menu');
const LimboSidebar = require("./limbo-sidebar");
const SaitoLoader = require('./../../../lib/saito/ui/saito-loader/saito-loader');

const SaitoSidebar = require('./../../../lib/saito/ui/saito-sidebar/saito-sidebar');

class LimboMain {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;

		//
		// left sidebar
		//
		let menu = new LimboMenu(this.app, this.mod, '.limbo-main');
		
		let sidebar = new LimboSidebar(this.app, this.mod, ".saito-sidebar.right");

		this.rsidebar = new SaitoSidebar(this.app, this.mod, '.saito-container');
		this.rsidebar.align = "right";
		this.rsidebar.addComponent(sidebar);

		this.loader = new SaitoLoader(this.app, this.mod, "#limbo-main");

		app.connection.on("limbo-populated", (source) => {
			if (source == "service"){
				this.loader.remove(250);
			}
		});

		app.connection.on("limbo-open-dream", (dreamer) => {
			let container = document.querySelector(".limbo-container");
			if (!container){
				return;
			}
			if (dreamer){
				container.classList.add("dreaming");
			}else{
				container.classList.remove("dreaming");
			}
		});
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

		await this.rsidebar.render();

		this.loader.render();

		this.attachEvents();
	}

	attachEvents() {

	}
}

module.exports = LimboMain;
