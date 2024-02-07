const ChatSidebarTemplate = require('./chat-sidebar.template');
const ChatUserMenu = require('../overlays/chat-user-menu');

class ChatSidebar {
	constructor(app, mod, container = '.saito-sidebar.right') {
		this.app = app;
		this.mod = mod;
		this.container = container;

    this.callbacks = {};

    app.connection.on('chat-manager-opens-group', (group = null) => {
      if (group) {
        this.render(group);
      }
    });
	}

	render(chat = null) {

    if (document.getElementById("chat-sidebar")){
      this.app.browser.replaceElementById(ChatSidebarTemplate(this.app, this.mod, chat), "chat-sidebar");
    }else{
      this.app.browser.addElementToSelector(ChatSidebarTemplate(this.app, this.mod, chat), this.container);
    }

    if (chat){


      if (chat.members.length > 2) {
        // Multiparty Group
      } else if (chat.id == this.mod.communityGroup?.id || chat.name == this.mod.communityGroupName) {
        // Community Chat
      } else {
        // 1-1 chat
        for (let member of chat.members) {
          if (member !== this.mod.publicKey) {
            this.addUserMenu(member);
            break;
          }
        }
      }

      this.attachEvents(chat);  
    }
    
  }


  addUserMenu(user_publickey){
    
    let availableMods = this.app.modules.returnModulesRespondingTo("user-menu", {
          publicKey: user_publickey
        });

    let index = 0;

    for (let am of availableMods){
      console.log(am.returnName());
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
      text: 'Send SAITO',
      callback: function (app, publicKey) {
        app.connection.emit(
          'saito-crypto-withdraw-render-request',
          { address: publicKey, ticker: 'SAITO' }
        );
      }
    }, `user_menu_item_${index++}`, user_publickey);
  }

  addMenuItem(item, id, publicKey){
    this.app.browser.addElementToSelector(`<div id="${id}" class="saito-modal-menu-option"><i class="${item.icon}"></i><div>${item.text}</div></div>`, ".saito-profile-menu");

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

  }
}
 
module.exports = ChatSidebar;
