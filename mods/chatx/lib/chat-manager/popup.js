const SaitoEmoji = require("../../../../lib/saito/new-ui/saito-emoji/saito-emoji");
const ChatPopupTemplate = require("./popup.template");
class ChatPopup {

  constructor(app, mod, group_id = "") {
    this.app = app;
    this.mod = mod;
    this.name = "ChatPopup";
    this.group_id = group_id;
    this.input_value = ""
    this.hasRendered = true;

    app.connection.on("chat-render-request", (gid = "") => {

      if (mod.chat_manager.inactive_popups.includes(gid)) { return; }

      if (gid === this.group_id && gid != "" && this.group_id != "") {

        let divid = "chat-container-" + gid;

        if ((app.browser.isMobileBrowser(navigator.userAgent) == true || window.innerWidth < 600) && !mod.mobile_chat_active) {
          //emit-chat-notification-event for mobile
          app.connection.emit("chat-render-request-notify");
        } else {
          if (!this.hasRendered) {
            app.browser.replaceElementById(ChatPopupTemplate(app, mod, gid), divid);
            this.emoji = new SaitoEmoji(app, mod, `chat-input-${gid}`);
            this.emoji.render(app, mod);
            this.hasRendered = true;
            app.browser.addElementToSelector(`${mod.returnChatBody(gid)}`, `.chat-body-${gid}`);
          }
          app.browser.replaceElementBySelector(`<div class="chat-body chat-body-${gid}">${mod.returnChatBody(gid)} </div>`, `.chat-body-${gid}`);
          document.querySelector(".chat-body").scroll(0, 1000000000);
          app.browser.makeDraggable(`chat-container-${gid}`, `chat-header-${gid}`);
          this.attachEvents(app, mod, gid);
        }
      }
    });


  }

  render(app, mod, group_id = "") {

    if ((app.browser.isMobileBrowser(navigator.userAgent) == true || window.innerWidth < 600) && !mod.mobile_chat_active) {
      //emit-chat-notification-event
      app.connection.emit("chat-render-request-notify");
    } else {
      let chatboxen_open = 0;
      let pixen_consumed = 0;
      let right_orientation = "0px";
  
      for (let i = 0; i < mod.groups.length; i++) {
        if (document.getElementById(`chat-container-${mod.groups[i].id}`)) {
          chatboxen_open++;
          pixen_consumed += document
            .getElementById(`chat-container-${mod.groups[i].id}`)
            .getBoundingClientRect().width;
        }
      }
  
      right_orientation = pixen_consumed + (20 * chatboxen_open) + "px";
  
      if (mod.chat_manager.inactive_popups.includes(group_id)) { return; }
      if (group_id != "" && this.group_id == "") { this.group_id = group_id; }
      if (!document.getElementById(`chat-container-${this.group_id}`)) {
        app.browser.addElementToDom(ChatPopupTemplate(app, mod, this.group_id));
        this.emoji = new SaitoEmoji(app, mod, `chat-input-${this.group_id}`);
        this.emoji.render(app, mod);
        app.browser.makeDraggable(`chat-header-${this.group_id}`, `chat-header-${this.group_id}`);
        this.attachEvents(app, mod, this.group_id);
      } else {
        // we've been told to render, but the container exists, so update the chat-body     
      }
  
      //
      // update right-alignment
      //
      let obj = document.querySelector(`.chat-container-${this.group_id}`);
      if (obj) { obj.style.right = right_orientation; }
  
      app.browser.addElementToSelector(`${mod.returnChatBody(group_id)}`, `.chat-body`);
      }
  }

  attachEvents(app, mod, group_id) {

    //
    // close
    //
    document.querySelector(`#chat-container-close-${group_id}`).onclick = (e) => {
      mod.deactivatePopup(group_id);
      mod.mobile_chat_active = false;
      let obj = document.getElementById(`chat-container-${group_id}`).remove();
    }

    //
    // focus on text input
    //
    let iobj = "chat-input-" + group_id;
    document.getElementById(iobj).focus();

    //
    // submit
    //
    let idiv = "chat-input-" + group_id;

    let msg_input = document.getElementById(idiv);

    msg_input.addEventListener("keydown", (e) => {
      if ((e.which == 13 || e.keyCode == 13) && !e.shiftKey) {
        e.preventDefault();
        if (msg_input.value == "") { return; }
        let newtx = mod.createChatTransaction(group_id, msg_input.value);
        mod.sendChatTransaction(app, newtx);
        mod.receiveChatTransaction(app, newtx);
        msg_input.value = "";
      }
    });

    //
    // submit (button)
    //
    let ibtn = "chat-input-submit-" + group_id;
    document.getElementById(ibtn).onclick = (e) => {
      e.preventDefault();
      if (msg_input.value == "") { return; }
      let newtx = mod.createChatTransaction(group_id, msg_input.value);
      mod.sendChatTransaction(app, newtx);
      mod.receiveChatTransaction(app, newtx);
      msg_input.value = "";
    }

  }

}

module.exports = ChatPopup;

