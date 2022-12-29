const SettingsAppspaceSidebarTemplate = require('./main.template.js');

class SettingsAppspaceSidebar {

  constructor(app, mod, container="") {
    this.app = app;
    this.mod = mod;
    this.container = container;
  }

  render(app, mod) {

    if (document.querySelector(".settings-appspace-sidebar")) {
      this.app.browser.replaceElementBySelector(SettingsAppspaceSidebarTemplate(this.app, this.mod), ".settings-appspace-sidebar");
    } else {
      this.app.browser.addElementToSelectorOrDom(SettingsAppspaceSidebarTemplate(this.app, this.mod), this.container);
    }

  }

}

module.exports = SettingsAppspaceSidebar;

