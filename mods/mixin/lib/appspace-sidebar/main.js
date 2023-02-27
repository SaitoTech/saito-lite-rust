const MixinAppspaceSidebarTemplate = require('./main.template.js');

class MixinAppspaceSidebar {

  constructor(app) {
    this.app;
  }

  render(app, mod) {

    if (!document.querySelector(".settings-appspace-sidebar")) {
      app.browser.addElementToSelector(MixinAppspaceTemplate(app, mod), ".appspace-sidebar");
    }

    this.attachEvents(app, mod);

  }

  attachEvents(app, mod) {

  }

}


module.exports = MixinAppspaceSidebar;


