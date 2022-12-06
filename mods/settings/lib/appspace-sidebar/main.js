const SettingsAppspaceSidebarTemplate = require('./main.template.js');

class SettingsAppspaceSidebar {

  constructor(app, mod, container="") {
    this.app = app;
    this.mod = mod;
    this.container = container;
  }

  render(app, mod) {

    if (document.querySelector(".settings-appspace-sodebar")) {
      this.app.browser.replaceElementBySelector(SettingsAppspaceTemplate(this.app, this.mod), ".settings-appspace-sidebar");
    } else {
      this.app.browser.addElementToSelectorOrDom(SettingsAppspaceTemplate(this.app, this.mod), this.container);
    }

  }

}

module.exports = SettingsAppspaceSidebar;

