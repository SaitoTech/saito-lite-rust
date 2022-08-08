const RedSquareSettingsSidebarTemplate = require("./settings-sidebar.template");
const SaitoCalendar = require("./../../../../lib/saito/new-ui/saito-calendar/saito-calendar");

class RedSquareGamesSidebar {

  constructor(app, mod, selector = "") {
    this.app = app;
    this.name = "RedSquareSettingsSidebar";
    this.mod = mod;
    this.selector = selector;
  }

  render(app, mod, selector="") {

    if (document.querySelector(".saito-sidebar.right")) {
      document.querySelector(".saito-sidebar.right").remove();
    }

    console.log("ADDING GAMES SIDEBAR!");

    if (selector != "") {
      app.browser.addElementToSelector(RedSquareSettingsSidebarTemplate(app, mod), selector);
    } else {
      app.browser.addElementToSelector(RedSquareSettingsSidebarTemplate(app, mod), this.selector);
    }

    this.attachEvents(app, mod);

  }

  attachEvents(app, mod) { 
  }

}

module.exports = RedSquareGamesSidebar;

