const StunComponentListenersTemplate = require("./listeners.template");


class Listeners {
  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
  }

  render(app, mod) {

    app.browser.addElementToDom(StunComponentListenersTemplate(app, mod), "stun-information");
    this.attachEvents(app, mod);

  }


  attachEvents(app, mod) {
  }
}

module.exports = Listeners;

