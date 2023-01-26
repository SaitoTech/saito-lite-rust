const ChatManagerOverlayTemplate = require('./chat-manager.template');

class ChatManagerOverlay {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.chat_manager = null;
    this.old_chat_manager_container = null;
    this.header_first_click = 0;
  }

  render() {

    let app = this.app;
    let mod = this.mod;

    this.app.browser.addElementToDom(ChatManagerOverlayTemplate(this.app, this.mod));

    this.chat_manager = this.mod.respondTo("chat-manager");

    //
    // delete if already exists on page
    //
    if (document.querySelector(".chat-manager")) {
      this.old_chat_manager_container = this.chat_manager.container;
      document.querySelector(".chat-manager").remove();
    }

    //
    // now render
    //
    this.chat_manager.container = ".chat-manager-overlay";
    this.header_first_click = 0;
    this.chat_manager.render();

    this.attachEvents();

  }

  //
  // Note: mod = Arcade
  //
  attachEvents() {

    document.querySelector(".chat-manager-overlay").onclick = (e) => {
      document.querySelector(".chat-manager-overlay").remove();
      if (this.old_chat_manager_container) {
        this.chat_manager.container = this.old_chat_manager_container;
        this.chat_manager.render();
      }
    }

    let sh = document.getElementById("saito-header");
    if (sh) {
      sh.addEventListener("click", this.onOffChatClick, false);
    }

  }


  onOffChatClick(e) {

    let cl = e.target.classList.toString();
    let should_remove = true;

    // if an icon-click in header triggered this, avoid pain
    if (cl.indexOf("fa-") > -1) { should_remove = false; }
    if (cl.indexOf("fas ") > -1) { should_remove = false; }
    
    if (should_remove && document.querySelector(".chat-manager-overlay")) {
      let sh = document.getElementById("saito-header");
      sh.removeEventListener("click", this.onOffChatClick, false);
      document.querySelector(".chat-manager-overlay").remove();
      if (this.old_chat_manager_container) {
        this.chat_manager.container = this.old_chat_manager_container;
        this.chat_manager.render();
      }
    }
  }

}

module.exports = ChatManagerOverlay;

