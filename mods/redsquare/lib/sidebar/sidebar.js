const RedSquareSidebarTemplate = require("./sidebar.template");
const SaitoCalendar = require("./../../../lib/saito/new-ui/saito-calendar/saito-calendar");

class RedSquareSidebar {

  constructor(app, mod, selector="") {
    this.name = "RedSquareSidebar";
    this.mod = mod;
    this.selector = selector;
  }

  render(app, mod, selector="") {

    if (document.querySelector(".saito-sidebar.right")) {
      document.querySelector(".saito-sidebar.right").remove();
    }

    if (selector != "") {
      app.browser.addElementToSelector(RedSquareSidebarTemplate(app, mod), selector);
    } else {
      app.browser.addElementToSelector(RedSquareSidebarTemplate(app, mod), this.selector);
    }

    let sidebar_calendar = new SaitoCalendar(app, mod);
    sidebar_calendar.render(app, mod, ".redsquare-sidebar-calendar");

    this.attachEvents(app, mod);

  }

  attachEvents(app, mod) {

  } 

}

module.exports = RedSquareSidebar;


