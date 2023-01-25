const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay.js');
const ChatManagerOverlayTemplate = require('./chat-manager.template');

class ChatManagerOverlay {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(app, mod);
  }

  render() {

    let app = this.app;
    let mod = this.mod;

    this.overlay.show(ChatManagerOverlayTemplate());

    let cm = this.mod.respondTo("chat-manager");
    cm.container = ".chat-manager-overlay";

    //
    // delete if already exists on page
    //
    if (document.querySelector(".chat-manager")) {
      document.querySelector(".chat-manager").remove();
    }

    //
    // now render
    //
    cm.render();

    //
    //
    //
    document.querySelector(".saito-overlay-closebox").style.display = "none";

    this.attachEvents();

  }

  //
  // Note: mod = Arcade
  //
  attachEvents() {

    document.querySelector(".chat-manager-overlay").onclick = (e) => {
      this.overlay.remove();
    }

  }
}

module.exports = ChatManagerOverlay;

