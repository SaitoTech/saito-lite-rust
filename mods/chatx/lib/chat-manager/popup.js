const ChatPopupTemplate = require("./popup.template");

class ChatPopup {

  constructor(app, mod, group_id="") {
    this.app = app;
    this.mod = mod;
    this.name = "ChatPopup";
    this.group_id = group_id;
  }

  render(app, mod, group_id="") {

    if (!document.getElementById(`chat-container-${group_id}`)) {
      app.browser.addElementToDom(ChatPopupTemplate(app, mod, group_id));
    }

    this.attachEvents(app, mod, group_id);

    app.connection.on("chat-render-request", (message) => {
      // update rendered popup
      let divid = "chat-container-"+group_id;
      app.browser.replaceElementById(ChatPopupTemplate(app, mod, group_id), divid);
      this.attachEvents(app, mod, group_id);
    });

  }

  attachEvents(app, mod, group_id) {

    //
    // close
    //
    document.querySelector(`#chat-container-close-${group_id}`).onclick = (e) => {
      let obj = document.getElementById(`chat-container-${group_id}`).remove(); 
    }

    //
    // focus on text input
    //
    let iobj = "chat-input-"+group_id;
    document.getElementById(iobj).focus();


    //
    // submit
    //
    let idiv = "chat-input-"+group_id;
    msg_input = document.getElementById(idiv);
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
    let ibtn = "chat-input-submit-"+group_id;
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

