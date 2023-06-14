const ChatPopup = require("./popup");
const ChatManagerTemplate = require("./main.template");
const ChatTeaser = require('./teaser.template');
const JSON = require('json-bigint');
const ChatMenu = require("./../overlays/chat-menu");
const ContactsList = require("./../../../../lib/saito/ui/modals/saito-contacts/saito-contacts");

class ChatManager {

  constructor(app, mod, container = "") {

    this.app = app;
    this.mod = mod;
    this.container = container || ".chat-manager";
    this.contactList = new ContactsList(app, mod, true);
    this.contactList.callback = async (person) => 
        { 
          if (Array.isArray(person) && person.length > 1){
            let name = await sprompt("Choose a name for the group");
            this.mod.returnOrCreateChatGroupFromMembers(person, name);   
          }
        }


    //
    // some apps may want chat manager quietly in background
    //
    this.render_manager_to_screen = 0;
    this.render_popups_to_screen = 1;

    //
    // track popups
    //
    this.popups = {};

    this.timers = {};
    this.pinged = {};

    //
    // handle requests to re-render chat manager
    //
    app.connection.on("chat-manager-render-request", () => {
      if (this.render_manager_to_screen) {
        this.render();
      }
    });

    app.connection.on("chat-manager-request-no-interrupts", () => {
      this.render_popups_to_screen = 0;
    });


    //
    // handle requests to re-render chat popups
    //
    app.connection.on("chat-popup-render-request", (group = null) => {

      //
      // mobile devices should not force open chat for us
      //
      //if (app.browser.isMobileBrowser()) {
      //  let active_mod = this.app.modules.returnActiveModule();
      //  if (active_mod.respondTo("arcade-games")) {
      //    return;
      //  }
      //}


      if (!group) {
        group = this.mod.returnCommunityChat();
      } 

      if (group) {
        //console.log("Chat popup");
        //console.log(JSON.parse(JSON.stringify(group)));
        if (!this.popups[group.id]) {
          this.popups[group.id] = new ChatPopup(this.app, this.mod);
          this.popups[group.id].group = group;
        }

        if (this.render_popups_to_screen) {
          this.popups[group.id].container = group?.target_container || "";  
          this.popups[group.id].render();
        }

        if (this.render_manager_to_screen) {
          this.render();
        }
      }
    });


    //
    // handle requests to re-render chat popups
    //
    app.connection.on("chat-popup-remove-request", (group = null) => {
      //
      // mobile devices should not force open chat for us
      //
      if (group == null) {
        return;
      } else {
        if (this.popups[group.id]) {
          this.popups[group.id].remove();
          delete this.popups[group.id];
        }
      }
    });


    // This is a short cut for any other UI components to trigger the chat-popup window
    // (in the absence of a proper chat-manager listing the groups/contacts)

    app.connection.on("open-chat-with", (data = null) => {

      this.render_popups_to_screen = 1;

      if (this.mod.debug) {
        console.log("open-chat-with");
      }

      if (!data) {
        let group = this.mod.returnCommunityChat();
        if (this.popups[group.id]) { this.popups[group.id].manually_closed = false; }
        this.app.connection.emit('chat-popup-render-request', this.mod.returnCommunityChat());
        return;
      }

      let group;

      if (Array.isArray(data.key)) {
        group = this.mod.returnOrCreateChatGroupFromMembers(data.key, data.name);
      } else {
        let name = data.name || app.keychain.returnUsername(data.key);
        group = this.mod.returnOrCreateChatGroupFromMembers([app.wallet.returnPublicKey(), data.key], name);
      }

      //
      // permit re-open
      //
      if (this.popups[group.id]) { this.popups[group.id].manually_closed = false; }

      app.connection.emit('chat-popup-render-request', group);
    });

    app.connection.on("relay-is-online", (pkey)=>{
      let group = this.mod.returnGroupByMemberPublickey(pkey);
      console.log("Receive online confirmation from " + pkey);
      group.online = true;
      let cm_handle = document.querySelector(`.chat-manager #saito-user-${group.id}`);
      if (cm_handle){
        cm_handle.classList.add("online");
        if (this.timers[group.id]){
          clearTimeout(this.timers[group.id]);
        }
        this.timers[group.id] = setTimeout(()=>{
          cm_handle.classList.remove("online");
          group.online = false;
        }, 360000)
      }
    });
    

  }


  render() {

    //
    // some applications do not want chat-manager appearing (games!)
    //
    if (this.render_manager_to_screen == 0) {
      return;
    }

    //
    // replace element or insert into page
    //
    if (document.querySelector(".chat-manager")) {
      this.app.browser.replaceElementBySelector(ChatManagerTemplate(this.app, this.mod), ".chat-manager");
    } else {
      this.app.browser.addElementToSelectorOrDom(ChatManagerTemplate(this.app, this.mod), this.container);
    }

    // Sort chat groups
    this.mod.groups = this.mod.groups.sort((a,b) => {
      let ts_a = a?.last_update || 0;
      let ts_b = b?.last_update || 0;

      return ts_b - ts_a;
    });

    //
    // render chat groups
    //
    let now = new Date().getTime();

    for (let group of this.mod.groups) {

      if (group.members.length == 2 && this.mod.isRelayConnected){
        for (let member of group.members){
          if (member != this.app.wallet.returnPublicKey() && (!this.pinged[member] || this.pinged[member] < now - 1000*60*60*2)){
            this.app.connection.emit("relay-send-message", {recipient: [member], request: "ping", data: {}});
            this.pinged[member] = now;
          }
        }
      }
      


      let html = ChatTeaser(this.app, group); 
      let divid = "saito-user-" + group.id;

      let obj = document.getElementById(divid);
      if (obj) {
        this.app.browser.replaceElementById(html, divid);
      } else {
        if (document.querySelector(".chat-manager-list")) {
          this.app.browser.addElementToSelector(html, ".chat-manager-list");
        }
      }
    }

    this.attachEvents();

  }


  attachEvents() {

    //
    // clicks on the element itself (background)
    //
    document.querySelectorAll('.chat-manager-list .saito-user').forEach(item => {
      item.onclick = (e) => {
        let gid = e.currentTarget.getAttribute("data-id");
        this.render_popups_to_screen = 1;
        let group = this.mod.returnGroup(gid);

        if (!this.popups[gid]) {
          this.popups[gid] = new ChatPopup(this.app, this.mod);
          this.popups[gid].group = group;
        }

        // unset manually closed to permit re-opening
        this.popups[gid].manually_closed = false;

        if (this.render_popups_to_screen) {
          this.popups[gid].container = group?.target_container || "";  
          this.popups[gid].render();
          this.popups[gid].input.focus();
        }

        if (this.render_manager_to_screen) {
          this.render();
        }
 
      };

      item.oncontextmenu = (e) => {
        e.preventDefault();
        let gid = e.currentTarget.getAttribute("data-id");
        let chatMenu = new ChatMenu(this.app, this.mod, this.mod.returnGroup(gid));
        chatMenu.render();
      }
    });


    if (document.querySelector(".add-contacts")){
      document.querySelector(".add-contacts").onclick = (e) => {
        this.contactList.render();
      }
    }

    if (document.querySelector(".refresh-contacts")){
      document.querySelector(".refresh-contacts").onclick = (e) => {
          for (let group of this.mod.groups) {

          if (group.members.length == 2){
            console.log(JSON.parse(JSON.stringify(group.members)));
            for (let member of group.members){
              if (member != this.app.wallet.returnPublicKey()){
                console.log("Send Ping to " + member);
                this.app.connection.emit("relay-send-message", {recipient: [member], request: "ping", data: {}});
              }
            }
          }
        }
      }
    }

  }

}

module.exports = ChatManager;


