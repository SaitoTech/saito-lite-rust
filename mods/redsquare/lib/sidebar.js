const RedSquareSidebarTemplate = require("./sidebar.template");
const SaitoCalendar = require("./../../../lib/saito/new-ui/saito-calendar/saito-calendar");

class RedSquareSidebar {

  constructor(app, mod, container="") {
    this.name = "RedSquareSidebar";
    this.mod = mod;
    this.container = container;
  }

  render(app, mod, container="") {

    if (!document.querySelector(".saito-sidebar.right")) {

      if (container != "") {
        app.browser.addElementToClass(RedSquareSidebarTemplate(app, mod), container);
	
      } else {
        app.browser.addElementToClass(RedSquareSidebarTemplate(app, mod), this.container);
      }


      let sidebar_calendar = new SaitoCalendar(app, mod);
      sidebar_calendar.render(app, mod, ".redsquare-sidebar-calendar");

    }

    this.attachEvents(app, mod);

  }

  attachEvents(app, mod) {

  } 

}

module.exports = RedSquareSidebar;


