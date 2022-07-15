const RedSquareGamesSidebarTemplate = require("./games-sidebar.template");
const SaitoCalendar = require("./../../../lib/saito/new-ui/saito-calendar/saito-calendar");

class RedSquareGamesSidebar {

  constructor(app, mod, selector = "") {
    this.name = "RedSquareGamesSidebar";
    this.mod = mod;
    this.selector = selector;
  }

  render(app, mod, selector="") {

    if (document.querySelector(".saito-sidebar.right")) {
      document.querySelector(".saito-sidebar.right").remove();
    }

    if (selector != "") {
      app.browser.addElementToSelector(RedSquareGamesSidebarTemplate(app, mod), selector);
    } else {
      app.browser.addElementToSelector(RedSquareGamesSidebarTemplate(app, mod), this.selector);
    }

    this.attachEvents(app, mod);

  }

  attachEvents(app, mod) {

  } 

}

module.exports = RedSquareGamesSidebar;

