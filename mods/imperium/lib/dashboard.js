const ImperiumDashboardTemplate = require("./dashboard.template");


class Dashboard {

  constructor(app, mod, container="") {
    this.app = app;
    this.mod = mod;
    this.container = container;
  }

  render(agenda_phase=0) {

    let myqs = this.container + " .imperium-dashboard";    

    if (document.querySelector(myqs)) {
      this.app.browser.replaceElementBySelector(ImperiumDashboardTemplate(this.mod, agenda_phase), myqs);
    } else {
      if (this.container == "") {
        this.app.browser.addElementToDom(ImperiumDashboardTemplate(this.mod, agenda_phase));
      } else {
        this.app.browser.addElementToSelector(ImperiumDashboardTemplate(this.mod, agenda_phase), this.container);
      }
    }

    this.attachEvents();

  }

  attachEvents() {
  }

}

module.exports = Dashboard;

