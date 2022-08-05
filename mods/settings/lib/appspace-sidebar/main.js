const SettingsAppspaceSidebarTemplate = require('./main.template.js');

class SettingsAppspaceSidebar {

  constructor(app) {
    this.app;
  }

  render(app, mod) {

    if (!document.querySelector(".settings-appspace-sidebar")) {
      app.browser.addElementToSelector(SettingsAppspaceTemplate(app, mod), ".appspace-sidebar");
    }

    this.attachEvents(app, mod);

  }

  attachEvents(app, mod) {

  }

}


module.exports = SettingsAppspace;


