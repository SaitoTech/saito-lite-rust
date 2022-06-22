const StunComponentMyStunTemplate = require("./my-stun.template");


class MyStun {
  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
  }

  render(app, mod) {

    app.browser.addElementToDom(StunComponentMyStunTemplate(app, mod), "stun-information");
    this.attachEvents(app, mod);

  }


  attachEvents(app, mod) {
  }
}

module.exports = MyStun;

