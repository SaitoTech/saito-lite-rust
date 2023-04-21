const SaitoOverlay = require("../../../../lib/saito/ui/saito-overlay/saito-overlay");
const SwitchDisplayTemplate = require("./switch-display.template");

class SwitchDisplay {
  constructor(app, mod, chatManager) {
    this.app = app;
    this.mod = mod;
    this.chatManager = chatManager;
    this.saitoOverlay = new SaitoOverlay(app, mod);
  }

  render() {
    this.saitoOverlay.show(
      SwitchDisplayTemplate(this.app, this.mod, this.chatManager.display_mode)
    );
    this.attachEvents();
  }

  attachEvents() {
    document.querySelector("#switch-to-focus").onclick = async (e) => {
      this.chatManager.switchDisplayToFocus();
      this.saitoOverlay.hide();
    };
    document.querySelector("#switch-to-gallery").onclick = async (e) => {
      this.chatManager.switchDisplayToGallery();
      this.saitoOverlay.hide();
    };
    document.querySelector("#switch-to-speaker").onclick = async (e) => {
      this.chatManager.switchDisplayToSpeaker();
      this.saitoOverlay.hide();
    };
  }
}

module.exports = SwitchDisplay;
