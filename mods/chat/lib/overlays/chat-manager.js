const ChatManagerOverlayTemplate = require("./chat-manager.template");

//Floating Chat Manager for mobile

class ChatManagerOverlay {
  constructor(app, mod) {
    this.app = app;
    this.mod = mod;

    app.connection.on("close-chat-manager-overlay", () => {
      if (document.querySelector(".chat-manager-overlay")) {
        document.querySelector(".chat-manager-overlay").style.visibility = "hidden";
      }
    });
  }

  async render() {
    if (!document.querySelector(".chat-manager-overlay")) {
      this.app.browser.addElementToDom(ChatManagerOverlayTemplate(this.app, this.mod));
    }

    document.querySelector(".chat-manager-overlay").style.visibility = "visible";

    if (this.mod.chat_manager == null) {
      this.mod.respondTo("chat-manager");
      this.mod.chat_manager.render_popups_to_screen = 0;
    }

    // Make sure we can render chat manager within the overlay
    this.mod.chat_manager.render_manager_to_screen = 1;

    this.mod.chat_manager.container = ".chat-manager-overlay";

    this.app.connection.emit("chat-manager-render-request");

    this.attachEvents();
  }

  //
  // Note: mod = Arcade
  //
  attachEvents() {
    document.querySelector(".chat-manager-overlay").onclick = (e) => {
      if (e.currentTarget == e.target) {
        document.querySelector(".chat-manager-overlay").style.visibility = "hidden";
      }
    };

    if (document.querySelector(".floating-cm-overlay")) {
      this.app.browser.makeDraggable("chat-manager-overlay", "chat-manager-header");
    }

    /*
    let sh = document.getElementById("saito-header");
    if (sh) {
      sh.addEventListener("click", this.onOffChatClick, false);
    }
    */
  }

  onOffChatClick(e) {
    let cl = e.target.classList.toString();
    let should_remove = true;

    // if an icon-click in header triggered this, avoid pain
    if (cl.indexOf("fa-") > -1) {
      should_remove = false;
    }
    if (cl.indexOf("fas ") > -1) {
      should_remove = false;
    }

    if (should_remove && document.querySelector(".chat-manager-overlay")) {
      let sh = document.getElementById("saito-header");
      sh.removeEventListener("click", this.onOffChatClick, false);
      document.querySelector(".chat-manager-overlay").style.visibility = "hidden";
    }
  }
}

module.exports = ChatManagerOverlay;

