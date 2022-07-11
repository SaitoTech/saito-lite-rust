const RedSquareGamesSidebarTemplate = require("./games-sidebar.template");
const SaitoCalendar = require("./../../../lib/saito/new-ui/saito-calendar/saito-calendar");

class RedSquareGamesSidebar {

  constructor(app, mod, container="") {
    this.name = "RedSquareGamesSidebar";
    this.mod = mod;
    this.container = container;
  }

  render(app, mod, container="") {

    if (!document.querySelector(".saito-sidebar.right")) {

      if (container != "") {
        app.browser.addElementToClass(RedSquareGamesSidebarTemplate(app, mod), container);
	
      } else {
        app.browser.addElementToClass(RedSquareGamesSidebarTemplate(app, mod), this.container);
      }

    }

    this.attachEvents(app, mod);

  }

  attachEvents(app, mod) {

  } 

}

module.exports = RedSquareGamesSidebar;

