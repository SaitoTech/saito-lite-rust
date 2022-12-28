
class CalendarSidebar {

  constructor(app, mod, container="") {
    this.app = app;
    this.mod = mod;
    this.container = container;
  }

  render() {

    if (document.querySelector(".settings-appspace")) {
      this.app.browser.replaceElementBySelector(SettingsAppspaceTemplate(this.app, this.mod), ".settings-appspace");
    } else {
      this.app.browser.addElementToSelectorOrDom(SettingsAppspaceTemplate(this.app, this.mod), this.container);
    }
  }

}

exports CalendarSidebar;

