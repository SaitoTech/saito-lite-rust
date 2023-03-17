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

  async render() {

    if (document.querySelector(".redsquare-sidebar")) {
      this.app.browser.replaceElementBySelector(RedSquareSidebarTemplate(), ".redsquare-sidebar");
    } else {
      this.app.browser.addElementToSelectorOrDom(RedSquareSidebarTemplate(), this.container);
    }

    //
    // render calendar
    //
    await this.calendar.render();

    //
    // appspace modules
    //
    await this.app.modules.renderInto(".redsquare-sidebar");

    this.attachEvents();
  }


  attachEvents() {

  }

}

module.exports = RedSquareSidebar;

