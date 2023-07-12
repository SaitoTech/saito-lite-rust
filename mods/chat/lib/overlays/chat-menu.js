const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");
const chatMenuTemplate = require("./chat-menu.template");
const ContactsList = require("./../../../../lib/saito/ui/modals/saito-contacts/saito-contacts");

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

          if (thisobj.chat_group?.member_ids[thisobj.app.wallet.returnPublicKey()] == "admin") {
            console.log("Send new name as group tx");
            thisobj.mod.sendCreateGroupTransaction(thisobj.chat_group);
          }
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

    if (document.getElementById("invite")){
      document.getElementById("invite").onclick = (e) => {
        const contactList = new ContactsList(this.app, this.mod, false);
        contactList.callback = async (person) => {
          if (person) {

            //Add here, not on receiveTX
            if (!thisobj.chat_group.members.includes(person)) {
              thisobj.chat_group.members.push(person);
            }

            if (!thisobj.chat_group.member_ids[person]) {
              thisobj.chat_group.member_ids[person] = 0;  
            }

            this.mod.sendAddMemberTransaction(thisobj.chat_group, person);

            this.mod.saveChatGroup(thisobj.chat_group);
            thisobj.overlay.remove();
            thisobj.render();   
            siteMessage("User invited to chat group", 2000);  
          }
        };
        contactList.render();
      }
    }

    document.querySelectorAll(".remove_user").forEach(user => {
      user.onclick = (e) => {
        let user_id = e.currentTarget.dataset.id;
        if (user_id) {
          this.mod.sendRemoveMemberTransaction(thisobj.chat_group, user_id);

            //Add here, not on receiveTX
            for (let i = 0; i < thisobj.chat_group.members.length; i++) {
              if (thisobj.chat_group.members[i] == user_id){
                thisobj.chat_group.members.splice(i,1);
                break;
              }
            }
            
            delete thisobj.chat_group.member_ids[user_id];  
            
            if (this.app.wallet.returnPublicKey() == user_id){
              this.mod.deleteChatGroup(thisobj.chat_group);
            }else{
              this.mod.saveChatGroup(thisobj.chat_group);
            }
          thisobj.overlay.remove();
          thisobj.render();   
          siteMessage("User removed from chat group", 2000);
        }
      }
    });


    document.querySelectorAll(".saito-contact.unconfirmed").forEach(user => {
      user.onclick = (e) => {
      let user_id = e.currentTarget.dataset.id;
        if (user_id) {
          this.mod.sendAddMemberTransaction(thisobj.chat_group, user_id);
          siteMessage("Chat Group invite resent", 2000);
        }        
      }
    });

  }

}

module.exports = ChatMenu;
