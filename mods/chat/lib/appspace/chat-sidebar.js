const ChatSidebarTemplate = require('./chat-sidebar.template');
const SaitoProfile = require('./../../../../lib/saito/ui/saito-profile/saito-profile');
const ChatUserMenu = require('../overlays/chat-user-menu');
const SaitoUser = require('./../../../../lib/saito/ui/saito-user/saito-user');

class ChatSidebar {
	constructor(app, mod, container = '.saito-sidebar.right') {
		this.app = app;
		this.mod = mod;
		this.container = container;

    this.profile = new SaitoProfile(app, mod, '.chat-sidebar');
    this.profile.tab_container = ".saito-modal-content";

    app.connection.on('chat-manager-opens-group', (group = null) => {
      if (group) {
        this.render(group);
      }
    });

    app.connection.on('chat-popup-remove-request', (group = null) => {
      if (group?.id == this?.group?.id) {
        this.remove();
      }
    });
  	
  }

  remove() {
    if (document.getElementById("chat-sidebar")) {
      document.getElementById("chat-sidebar").remove();
    }
    this.group = null;
  }

	render(chat = null) {

    if (!chat) {
      return;
    }

    this.group = chat;

    if (document.getElementById("chat-sidebar")) {
      this.app.browser.replaceElementById(ChatSidebarTemplate(this.app, this.mod), "chat-sidebar");
    }else{
      this.app.browser.addElementToSelector(ChatSidebarTemplate(this.app, this.mod), this.container);
    }

    if (!document.querySelector(".chat-sidebar .saito-modal-content")){
      this.app.browser.addElementToSelector(`<div class="saito-modal-content hide-scrollbar"></div>`, ".chat-sidebar");
    }

    let groupKey = chat.id;

    let dm = false;

    this.profile.mask_key = true;

    if (chat.member_ids) {
      // Multiparty Group
      this.profile.reset(groupKey, "members", ["members"]);
      for (let m of chat.members){

        let name = m;
        if (m == this.app.keychain.returnIdentifierByPublicKey(m, true)) {
          name = '';
        }

        // Could add a fourth element so admins can delete people...

        let user = new SaitoUser(this.app, this.mod, ".chat-sidebar .saito-modal-content", m, name)
        user.extra_classes = "saito-add-user-menu saito-contact";
        
        if (chat.member_ids[m] == "admin"){
          user.icon = `<i class="saito-overlaid-icon fa-solid fa-dragon"></i>`;
        }

        this.profile.menu.members.push(user);
      }

    } else if (chat.id == this.mod.communityGroup?.id || chat.name == this.mod.communityGroupName || chat.members.length !== 2){
      // Community Chat
      // If the peerservices haven't come up, we won't have a communityGroup obj yet....
      this.profile.reset(groupKey, "active", ["active"]);
      this.profile.name = chat.name;
      this.profile.mask_key = true;

      //Scan stored transactions for list of people active in community
      let active_users = [];
      for (let i = chat.txs.length - 1; i >= 0; i--){
        let key = chat.txs[i].from;
        if (Array.isArray(key)){
          for (let k of key){
            if (!active_users.includes(k)){
              active_users.push(k);
            } 
          }
        }else{
          if (!active_users.includes(key)){
            active_users.push(key);
          }
        }
      }

      //Build data structure
      for (let m of active_users){
        let name = m;
        if (m == this.app.keychain.returnIdentifierByPublicKey(m, true)) {
          name = '';
        }

        let user = new SaitoUser(this.app, this.mod, ".chat-sidebar .saito-modal-content", m, name)
        user.extra_classes = "saito-add-user-menu saito-contact";
        
        this.profile.menu.active.push(user);
      }

    } else {
      // 1-1 chat
      dm = true;

      for (let member of chat.members) {
        if (member !== this.mod.publicKey) {
          groupKey = member;
        }
      }

      this.profile.reset(groupKey);
    }

    this.profile.description = chat.description;

    this.profile.render();

    this.app.browser.addElementToSelector(`<div id="chat-group-edit" class="saito-modal-menu-option"><i class="fa-solid fa-users-gear"></i><div>Manage Chat</div></div>`, ".chat-sidebar .saito-profile-controls");

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
