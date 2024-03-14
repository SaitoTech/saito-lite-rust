const LimboSidebarTemplate = require('./limbo-sidebar.template');


class LimboSidebar {
	constructor(app, mod, container = '.saito-sidebar.right') {
		this.app = app;
		this.mod = mod;
		this.container = container;

    app.connection.on('limbo-open-dream', (dreamer = null) => {
      this.render(dreamer);
    });

  }

	render(dreamer = null) {

    if (document.getElementById("limbo-sidebar")){
      this.app.browser.replaceElementById(LimboSidebarTemplate(this.app, this.mod, dreamer), "limbo-sidebar");
    }else{
      this.app.browser.addElementToSelector(LimboSidebarTemplate(this.app, this.mod, dreamer), this.container);
    }
  }

  attachEvents() {  }
}
 
module.exports = LimboSidebar;
