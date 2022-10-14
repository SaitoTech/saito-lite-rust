const SaitoEmoji = require("../../../../lib/saito/new-ui/saito-emoji/saito-emoji");
const ChatPopupTemplate = require("./popup.template");
class ChatPopup {

  constructor(app, mod, group_id = "") {
    this.app = app;
    this.mod = mod;
    this.group_id = group_id;
    this.emoji = new SaitoEmoji(app, mod, `chat-input-${this.group_id}`);

    this.active = true;
    this.minimized = false;

    //Each ChatPopup has listeners so we need to only act if it is for us
    app.connection.on("chat-render-request", (gid) => {
      if (gid && gid === this.group_id) {
        if (((app.browser.isMobileBrowser(navigator.userAgent) == true || window.innerWidth < 600) && !mod.mobile_chat_active)
          || !this.active || this.minimized) {
          app.connection.emit("chat-render-request-notify", gid);
        } else {
          this.render(app, mod);
        }
      }
    });

    app.connection.on("chat-render-request-notify", (gid)=>{
      if (gid && gid === this.group_id) {
        if (this.active && this.minimized){
            let group = mod.returnGroup(gid);
            let chat_bubble = document.getElementById(`chat-container-minimize-${gid}`);
            if (chat_bubble && group?.unread){
              chat_bubble.innerHTML = `<div class="saito-notification-counter">${group.unread}</div>`;
            }
        }
      }
    });

  }

  render(app, mod) {

      this.active = true;

      if (this.minimized){
        this.toggleDisplay();
      }

      if (!document.getElementById(`chat-container-${this.group_id}`)) {

        // 
        // Some calculations to layer chatpopups from the right side of screen
        //
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
  
        app.browser.addElementToDom(ChatPopupTemplate(app, mod, this.group_id));

        //
        // update right-alignment
        //
        let obj = document.querySelector(`.chat-container-${this.group_id}`);
        if (obj) { obj.style.right = right_orientation; }
  
        this.emoji.render(app, mod);
  
        app.browser.makeDraggable(`chat-container-${this.group_id}`, `chat-header-${this.group_id}`);

      }else{
        app.browser.replaceElementBySelector(`<div class="chat-body">${mod.returnChatBody(this.group_id)}</div>`, `#chat-container-${this.group_id} .chat-body`);
      } 

      document.querySelector(".chat-body").scroll(0, 1000000000);
      this.attachEvents(app, mod);
      
  }

  attachEvents(app, mod) {

    let group_id = this.group_id;
    
    //
    // close
    //
    document.querySelector(`#chat-container-close-${group_id}`).onclick = (e) => {
      this.active = false;
      this.minimized = false;
      mod.mobile_chat_active = false;
      let obj = document.getElementById(`chat-container-${group_id}`).remove();
    }

    //
    // minimize
    //
    let chat_bubble = document.getElementById(`chat-container-minimize-${group_id}`);
    if (chat_bubble){
      chat_bubble.onclick = (e) =>{
        this.toggleDisplay();
      }
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

  toggleDisplay(){
    let chat_bubble = document.getElementById(`chat-container-minimize-${this.group_id}`);
    if (chat_bubble){
      chat_bubble.parentElement.parentElement.classList.toggle("minimize");
      chat_bubble.parentElement.parentElement.removeAttribute("style");
      chat_bubble.innerHTML = "";

      this.minimized = !this.minimized;

      if (!this.minimized){
        this.app.connection.emit("chat-render-request", this.group_id);
      }

    }

  }

}

module.exports = ChatPopup;

