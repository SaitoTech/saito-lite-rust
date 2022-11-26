const ControlsTemplate = require("./controls.template");
const SaitoOverlay = require("./../../../lib/saito/new-ui/saito-overlay/saito-overlay");


class ControlsOverlay {

  constructor(app, mod = null, selector = "") {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(app, false);
  }

  render(app, mod, selector = "") {
    this.overlay.show(app, mod, ControlsTemplate(app, mod));
    this.attachEvents(app, mod);
  }

  attachEvents(app, mod) {

    let controls = this;    

    try {

      console.log("attaching controls...");

    } catch(err) {
      console.log('Error attaching events to controls ' + err);
    }

  }
}

module.exports = ControlsOverlay;

