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
      if(mod.chat_manager.inactive_popups.includes(group_id)) return;
      if (gid === this.group_id && gid != "" && this.group_id != "") {

        let divid = "chat-container-" + gid;
      
        if (!this.hasRendered){
          app.browser.replaceElementById(ChatPopupTemplate(app, mod, gid), divid);
          this.hasRendered = true;
          console.log('returning chat body 1;' , mod.returnChatBody(gid))
          app.browser.addElementToSelector(`${mod.returnChatBody(gid)}`,  `.chat-body-${gid}`);
        }

        console.log('returning chat body 2;' , mod.returnChatBody(gid))
        app.browser.replaceElementBySelector(`<div class="chat-body chat-body-${gid}">${mod.returnChatBody(gid)} </div> ,`,  `.chat-body-${gid}`);

        document.querySelector(".chat-body").scroll(0, 1000000000);
        app.browser.makeDraggable(`chat-container-${gid}`);
        this.attachEvents(app, mod, gid);
      }	
    });


  }

  render(app, mod, group_id = "") {
    if(mod.chat_manager.inactive_popups.includes(group_id)) return;
    if (group_id != "" && this.group_id == "") { this.group_id = group_id; }
    if (!document.getElementById(`chat-container-${this.group_id}`)) {
      if(!document.querySelector(".chat-popup-list")){
        app.browser.addElementToDom(`<div class="chat-popup-list"> </div>`)
      }
      app.browser.prependElementToSelector(ChatPopupTemplate(app, mod, this.group_id), '.chat-popup-list');
      app.browser.makeDraggable(`chat-container-${this.group_id}`);
      this.attachEvents(app, mod, this.group_id);
    } else {
      // we've been told to render, but the container exists, so update the chat-body
     
    }

    console.log('returning chat body')
    app.browser.addElementToSelector(`${mod.returnChatBody(group_id)}`,  `.chat-body`);
  }

  attachEvents(app, mod, group_id) {

    //
    // close
    //
    document.querySelector(`#chat-container-close-${group_id}`).onclick = (e) => {
      mod.deactivatePopup(group_id);
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

