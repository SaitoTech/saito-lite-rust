const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");
const chatMenuTemplate = require("./chat-menu.template");

class ChatMenu {
  constructor(app, mod, chat_group) {
    this.app = app;
    this.mod = mod;
    this.chat_group = chat_group;
    this.overlay = new SaitoOverlay(app, null, true, true);
  }

  render() {
    let thisobj = this;
    if (!this.chat_group) {
      return;
    }
    if (!document.querySelector("#saito-chat-menu")) {
      this.overlay.show(chatMenuTemplate(this.app, this.chat_group));
      this.attachEvents();
    }

    this.app.connection.emit("chat-popup-remove-request", this.chat_group);
  }

  attachEvents() {
    let thisobj = this;
    
    if (document.getElementById("rename")){
      document.getElementById("rename").onclick = async (e) => {
        let name = await sprompt("What do you want to call the chat group?");
        if (name){
          thisobj.chat_group.name = sanitize(name);
          thisobj.mod.saveChatGroup(thisobj.chat_group);
          thisobj.app.connection.emit("chat-manager-render-request");          
        }
        thisobj.overlay.remove();
      }
    }
    if (document.getElementById("delete")){
      document.getElementById("delete").onclick = async (e) => {
        let c = await sconfirm("Remove this chat group from my local storage?");
        if (c){
          thisobj.mod.deleteChatGroup(thisobj.chat_group);
        }
        thisobj.overlay.remove();
      }
    }

  }

}

module.exports = ChatMenu;
