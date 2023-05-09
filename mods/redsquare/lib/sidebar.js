const RedSquareSidebarTemplate = require("./sidebar.template");
const SaitoCalendar = require("./../../../lib/saito/ui/saito-calendar/saito-calendar");

class RedSquareSidebar {

  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.name = "RedSquareSidebar";
    this.calendar = new SaitoCalendar(app, mod, ".redsquare-sidebar-calendar");

  }

  render() {

    if (document.querySelector(".redsquare-sidebar")) {
      this.app.browser.replaceElementBySelector(RedSquareSidebarTemplate(), ".redsquare-sidebar");
    } else {
      this.app.browser.addElementToSelector(RedSquareSidebarTemplate(), this.container);
    }

    //
    // render calendar
    //
    this.calendar.render();

    //
    // appspace modules
    //
    this.app.modules.renderInto(".redsquare-sidebar");

    this.attachEvents();
  }  


  attachEvents() {

  }

}

module.exports = RedSquareSidebar;

