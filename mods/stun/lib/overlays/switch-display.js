const SaitoOverlay = require("../../../../lib/saito/ui/saito-overlay/saito-overlay");
const SwitchDisplayTemplate = require("./switch-display.template");

class SwitchDisplay {
  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.saitoOverlay = new SaitoOverlay(app, mod);
  }

  render(display_mode) {
    this.saitoOverlay.show(SwitchDisplayTemplate(display_mode));
    this.attachEvents();
  }

  attachEvents() {
    Array.from(document.querySelectorAll(".switch-to")).forEach((option) => {
      option.onclick = (e) => {
        let choice = e.currentTarget.getAttribute("id");
        this.app.connection.emit("stun-switch-view", choice);
        this.saitoOverlay.hide();
      };
    });
  }
}

module.exports = SwitchDisplay;
