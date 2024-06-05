const ChatSidebarTemplate = require('./chat-sidebar.template');
const SaitoProfile = require('./../../../../lib/saito/ui/saito-profile/saito-profile');
const ChatUserMenu = require('../overlays/chat-user-menu');

class ChatSidebar {
	constructor(app, mod, container = '.saito-sidebar.right') {
		this.app = app;
		this.mod = mod;
		this.container = container;

    this.profile = new SaitoProfile(app, mod, '.chat-sidebar');

    app.connection.on('chat-manager-opens-group', (group = null) => {
      if (group) {
        this.render(group);
      }
    });

    app.connection.on('chat-popup-remove-request', (group = null) => {
      this.render();
    });
  	
  }

	render(chat = null) {

    if (!chat) {
      return;
    }

    if (document.getElementById("chat-sidebar")) {
      this.app.browser.replaceElementById(ChatSidebarTemplate(this.app, this.mod, chat), "chat-sidebar");
    }else{
      this.app.browser.addElementToSelector(ChatSidebarTemplate(this.app, this.mod, chat), this.container);
    }

    let groupKey = chat.id;
    let groupName = chat.name;
    let dm = false;

    if (chat.member_ids) {
      // Multiparty Group
    } else if (chat.id == this.mod.communityGroup?.id || chat.name == this.mod.communityGroupName || chat.members.length !== 2) {
      // Community Chat
      // If the peerservices haven't come up, we won't have a communityGroup obj yet....
      groupKey = "";
    } else {
      // 1-1 chat
      dm = true;
      for (let member of chat.members) {
        if (member !== this.mod.publicKey) {
          groupKey = member;
        }
      }
    }

    this.profile.reset(groupKey);
    this.profile.description = chat.description;

    if (!groupKey){
      this.profile.name = groupName;
    }

    this.profile.render();

    if (dm) {
      this.addUserMenu(groupKey);
    }

    this.attachEvents(chat);  
    
  }


  addUserMenu(user_publickey){
    
    let availableMods = this.app.modules.returnModulesRespondingTo("user-menu", {
          publicKey: user_publickey
        });

    let index = 0;

    for (let am of availableMods){
      if (am.returnName() !== this.mod.returnName()){
        let item = am.respondTo("user-menu", { publicKey: user_publickey });
        if (item instanceof Array) {
          item.forEach((j) => {
            this.addMenuItem(j, `user_menu_item_${index++}`, user_publickey);
          });
        } else if (item != null) {
          this.addMenuItem(item, `user_menu_item_${index++}`, user_publickey);
        }
      }
    }

    //This is not in a respondTo????
    this.addMenuItem({ 
      icon: 'fas fa-money-check-dollar', 
      text: 'Send Crypto',
      callback: function (app, publicKey) {
        app.connection.emit(
          'saito-crypto-withdraw-render-request',
          { address: publicKey, ticker: 'SAITO' }
        );
      }
    }, `user_menu_item_${index++}`, user_publickey);
  }

  addMenuItem(item, id, publicKey){
    this.app.browser.addElementToSelector(`<div id="${id}" class="saito-modal-menu-option"><i class="${item.icon}"></i><div>${item.text}</div></div>`, ".saito-profile-controls");

    let menu_option = document.getElementById(id);
    if (menu_option){
      menu_option.onclick = (e) => {
        item.callback(this.app, publicKey);
      } 
    }
  }

  attachEvents(chat) {

    if (document.getElementById("chat-group-edit")){
      document.getElementById("chat-group-edit").onclick = (e) => {
        let chatMenu = new ChatUserMenu(this.app, this.mod, chat);
        chatMenu.render();
      }
    }

    // Add .remove_user functionality
    Array.from(document.querySelectorAll(".remove_user")).forEach((member) => {
      member.onclick = async (e) => {
        let person = e.currentTarget.dataset.id;
        if (person){
            await this.mod.sendRemoveMemberTransaction(
            chat,
            person
          );

          for (let i = 0; i < chat.members.length; i++) {
            if (chat.members[i] == person) {
              chat.members.splice(i, 1);
              break;
            }
          }

          chat.member_ids[person] = -1;
        }
      }
    });


  }
}
 
module.exports = ChatSidebar;
