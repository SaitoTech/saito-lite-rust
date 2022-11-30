const RedSquareMainTemplate = require("./main.template");
const RedSquareAppspaceHome = require("./appspace/home");
const RedSquareAppspaceNotifications = require("./appspace/home");

class RedSquareMain {

  constructor(app, mod, container = "") {

    this.app = app;
    this.mod = mod;
    this.container = container;
    this.name = "RedSquareMain";

    this.components = {};
    this.components['home'] = new RedSquareAppspaceHome(app, mod, ".saito-main");
    this.components['notifications'] = new RedSquareAppspaceNotifications(app, mod, ".saito-main");
    this.render_component = 'home';

  }

  render() {
    //
    // replace element or insert into page
    //
    if (document.querySelector(".saito-container")) {
      this.app.browser.replaceElementBySelector(RedSquareMainTemplate(this.app, this.mod), ".saito-container");
    } else {
      if (this.container) {
        this.app.browser.addElementToSelector(RedSquareMainTemplate(this.app, this.mod), this.container);
      } else {
        this.app.browser.addElementToDom(RedSquareMainTemplate(this.app, this.mod));
      }
    }

    //
    // this should be event-triggered, just testing here
    //
    if (this.components[this.render_component]) {
      this.components[this.render_component].render();
    }

    this.attachEvents();
  }  

  attachEvents() {

  }

}

module.exports = RedSquareMain;

