const ChatPopupTemplate = require("./popup.template");
const ChatMessageTemplate = require('../templates/chat-body-message.template');
class ChatPopup {

  constructor(app, mod, group_id = "") {
    this.app = app;
    this.mod = mod;
    this.name = "ChatPopup";
    this.group_id = group_id;
    this.input_value = ""
    this.hasRendered = true;

    app.connection.on("chat-render-request", (gid = "") => {
      let continue_render =false;
      for (let i = 0; i < app.modules.mods.length; i++) {
        if (app.modules.mods[i].slug === "chat" && app.modules.mods[i].gamesmenufilter === "chatx") {
          let chatmod = app.modules.mods[i];
          if(chatmod.chat_manager.active_popups.includes(gid)){
            continue_render = true;
          }
        }
      }

      if(!continue_render) return;


      if (gid === this.group_id && gid != "" && this.group_id != "") {
        let divid = "chat-container-" + gid;
        this.input_value = document.querySelector(`#chat-input-${group_id}`).value
        if(!this.hasRendered){
          app.browser.replaceElementById(ChatPopupTemplate(app, mod, gid, this.input_value), divid);
          this.hasRendered = true;
        }

    
        app.browser.replaceElementBySelector(`<div class="chat-body"> ${ChatMessageTemplate(app, mod, gid)} </div> ,`,  ".chat-body");
        document.querySelector(".chat-body").scroll(0, 1000000000);
        // app.browser.makeDraggable(`chat-container-${gid}`);
        this.attachEvents(app, mod, gid);
      }	
    });


  }

  render(app, mod, group_id = "") {
    if (group_id != "" && this.group_id == "") { this.group_id = group_id; }
    if (!document.getElementById(`chat-container-${this.group_id}`)) {
      if(!document.querySelector(".chat-popup-list")){
        app.browser.addElementToDom(`<div class="chat-popup-list"> </div>`)
      }
      app.browser.addElementToSelector(ChatPopupTemplate(app, mod, this.group_id), '.chat-popup-list');
      // app.browser.makeDraggable(`chat-container-${this.group_id}`);
      this.attachEvents(app, mod, this.group_id);
    }

  }

  attachEvents(app, mod, group_id) {

    //
    // close
    //
    document.querySelector(`#chat-container-close-${group_id}`).onclick = (e) => {
      mod.deactivatePopup(app, mod, group_id);
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

