const SaitoOverlay = require("../../../../lib/saito/ui/saito-overlay/saito-overlay");
const VideoCallSettingsTemplate = require("./videocall-settings.template");

class VideoCallSettings {
  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.saitoOverlay = new SaitoOverlay(app, mod);
  }

  render(display_mode) {
    this.saitoOverlay.show(VideoCallSettingsTemplate(display_mode, this.mod));
    this.attachEvents();
  }

  attachEvents() {
    this_self = this;
    Array.from(document.querySelectorAll(".videocall-option-input")).forEach((option) => {
      option.onchange = (e) => {
        let choice = e.currentTarget.getAttribute("value");
        this_self.app.connection.emit("stun-switch-view", choice);
        this_self.saitoOverlay.remove();
      };
    });

    if (!this.mod.screen_share){
      document.querySelectorAll(".share-control").forEach((item) => {
        item.onclick = () => {
          this_self.app.connection.emit("begin-share-screen");
          this_self.saitoOverlay.remove();
        };
      });
    }
  }
}

module.exports = VideoCallSettings;
