const SaitoCalendarTemplate = require("./saito-calendar.template");
const UIModTemplate = require("./../../../templates/uimodtemplate");

class SaitoCalendar {

  constructor(app) {

    this.app = app;
    this.name = "SaitoCalendar";
    this.size = "small";

  }


  render(app, mod, class_container="") {

    if (!document.querySelector(`.saito-calendar.${this.size}`)) {
      if (class_container === "") {
        app.browser.addElementToDom(SaitoCalendarTemplate(app, mod, this.size));
      } else {
        let my_container = document.querySelector(class_container);
        if (!my_container) {
          app.browser.addElementToDom(SaitoCalendarTemplate(app, mod, this.size));
        } else {
          if (!document.querySelector(`.saito-calendar.${this.size}`)) {
            app.browser.addElementToElement(SaitoCalendarTemplate(app, mod, this.size), my_container);
          } else {
            app.browser.addElementToElement(SaitoCalendarTemplate(app, mod, this.size), my_container);
          }
        }
      }
    }

  }


}

module.exports = SaitoCalendar;


