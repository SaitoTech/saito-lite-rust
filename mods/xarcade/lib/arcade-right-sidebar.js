const ArcadeRightSidebarTemplate = require('./arcade-right-sidebar.template');

class ArcadeRightSidebar {

	constructor(app, mod, container = "") {
		this.app = app;
		this.mod = mod;
		this.container = container;
	}

	render() {

		if (document.querySelector('.arcade-menu.right') != null) {
			this.app.browser.addElementToSelector(ArcadeRightSidebarTemplate(this.app, this.mod), '.arcade-menu.right');
		} else {

			if (this.container != "") {
				this.app.browser.addElementToSelector(ArcadeRightSidebarTemplate(this.app, this.mod), this.container);
			} else {
				this.app.browser.addElementToDom(ArcadeRightSidebarTemplate(this.app, this.mod));
			}
		}

		this.attachEvents();
	}	

	attachEvents() {

	}
}

module.exports = ArcadeRightSidebar;