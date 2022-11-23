const ArcadeLeftSidebarTemplate = require('./arcade-left-sidebar.template');

class ArcadeLeftSidebar {

	constructor(app, mod, container = "") {
		this.app = app;
		this.mod = mod;
		this.container = container;
	}

	render() {

		if (document.querySelector('.arcade-menu.left') != null) {
			this.app.browser.addElementToSelector(ArcadeLeftSidebarTemplate(this.app, this.mod), '.arcade-menu.left');
		} else {

			if (this.container != "") {
				this.app.browser.addElementToSelector(ArcadeLeftSidebarTemplate(this.app, this.mod), this.container);
			} else {
				this.app.browser.addElementToDom(ArcadeLeftSidebarTemplate(this.app, this.mod));
			}
		}

		this.attachEvents();
	}	

	attachEvents() {

	}
}

module.exports = ArcadeLeftSidebar;