const StunComponentPeersTemplate = require("./peers.template");


class Peers {
  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
  }

  render(app, mod) {

    app.browser.addElementToDom(StunComponentPeersTemplate(app, mod), "stun-information");
    this.attachEvents(app, mod);

  }


  attachEvents(app, mod) {
  }
}

module.exports = Peer;

