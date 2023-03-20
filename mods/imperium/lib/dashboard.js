const ImperiumDashboardTemplate = require("./dashboard.template");


class Dashboard {

  constructor(app, mod, container="") {
    this.app = app;
    this.mod = mod;
    this.container = container;
  }

  render(player) {

    let myqs = this.container + " .imperium-dashboard";    

    if (document.querySelector(myqs)) {
      this.app.browser.replaceElementBySelector(ImperiumDashboardTemplate(this.mod), myqs);
    } else {
      if (this.container == "") {
        this.app.browser.addElementToDom(ImperiumDashboardTemplate(this.mod));
      } else {
        this.app.browser.addElementToSelector(ImperiumDashboardTemplate(this.mod), this.container);
      }
    }

    this.attachEvents();

  }

  attachEvents() {
  }

}

module.exports = Dashboard;

