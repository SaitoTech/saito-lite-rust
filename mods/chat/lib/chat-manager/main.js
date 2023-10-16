const ChatPopup = require("./popup");
const ChatManagerTemplate = require("./main.template");
const ChatTeaser = require("./teaser.template");
const JSON = require("json-bigint");
const ChatUserMenu = require("./../overlays/chat-user-menu");
const ChatManagerMenu = require("./../overlays/chat-manager-menu");

class ChatManager {
  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.container = container || ".chat-manager";

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
    app.connection.on("chat-manager-render-request", async () => {
      if (this.render_manager_to_screen) {
        await this.render();
      }
    });

    app.connection.on("chat-manager-request-no-interrupts", () => {
      this.render_popups_to_screen = 0;
    });

    //
    // handle requests to re-render chat popups
    //
    app.connection.on("chat-popup-render-request", async (group = null) => {
      if (!group) {
        group = this.mod.returnCommunityChat();
      }

      if (group) {
        if (!this.popups[group.id]) {
          this.popups[group.id] = new ChatPopup(
            this.app,
            this.mod,
            group?.target_container || this.chat_popup_container
          );
          this.popups[group.id].group = group;
        }

        // if (this.render_popups_to_screen || !this.popups[group.id].is_rendered) {
        this.popups[group.id].render();
        // }

        if (this.render_manager_to_screen) {
          await this.render();
        }
      }
    });

    //
    // handle requests to re-render chat popups
    //
    app.connection.on("chat-popup-remove-request", (group = null) => {
      console.log("removing chat popup", group);
      if (!group) {
        return;
      } else {
        if (this.popups[group.id]) {
          this.popups[group.id].remove();
          delete this.popups[group.id];
          console.log("removed chat popup", group);
        }
      }
    });

    // This is a short cut for any other UI components to trigger the chat-popup window
    // (in the absence of a proper chat-manager listing the groups/contacts)

    app.connection.on("open-chat-with", async (data = null) => {
      this.render_popups_to_screen = 1;

      if (this.mod.debug) {
        console.log("open-chat-with");
      }

      let group = null;

      if (!data) {
        group = this.mod.returnCommunityChat();
      } else {

        if (data.key){
          if (Array.isArray(data.key)) {
            group = this.mod.returnOrCreateChatGroupFromMembers(data.key, data.name);
          } else {
            group = this.mod.returnOrCreateChatGroupFromMembers(
              [this.mod.publicKey, data.key],
              data.name
            );
          }
        }

        //Other modules can specify a chat group id (maybe linked to game_id or league_id)
        if (data.id) {
          let group2 = this.mod.returnGroup(data.id);
          if (!group2 && group){
            group.id = data.id;
          }else{
            group = group2;
          }

          
        }
        if (data.admin) {
          //
          // It may be overkill to send a group update transaction everytime the admin starts a chat
          // But if groups have variable memberships, it does push out an update to everyone as long
          // as the admin has an accurate list
          //
          await this.mod.sendCreateGroupTransaction(group);
        }
      }

      //
      // permit re-open
      //
      if (this.popups[group.id]) {
        this.popups[group.id].manually_closed = false;
      }

      app.connection.emit("chat-popup-render-request", group);
    });

    app.connection.on("relay-is-online", async (pkey) => {
      let target_id = this.mod.createGroupIdFromMembers([pkey, this.mod.publicKey]);
      let group = this.mod.returnGroup(target_id);
      //console.log("Receive online confirmation from " + pkey);
      if (!group || group.members.length !== 2) {
        return;
      }
      group.online = true;
      let cm_handle = document.querySelector(`.chat-manager #saito-user-${group.id}`);
      if (cm_handle) {
        cm_handle.classList.add("online");
        if (this.timers[group.id]) {
          clearTimeout(this.timers[group.id]);
        }
        this.timers[group.id] = null;
      }
    });

    app.connection.on("group-is-active", (group) => {
      if (group.members.length !== 2) {
        return;
      }

      group.online = true;
      if (this.timers[group.id]) {
        clearTimeout(this.timers[group.id]);
      }

      this.pinged[group.id] = new Date().getTime();

      this.timers[group.id] = setTimeout(() => {
        group.online = false;
        app.connection.emit("chat-manager-render-request");
      }, 60000);
    });
  }

  async render() {
    //
    // some applications do not want chat-manager appearing (games!)
    //
    if (this.render_manager_to_screen == 0) {
      return;
    }

    //
    // replace element or insert into page
    //
    if (document.querySelector(this.container + ".chat-manager")) {
      this.app.browser.replaceElementBySelector(
        ChatManagerTemplate(this.app, this.mod),
        ".chat-manager"
      );
    } else {
      if (document.querySelector(".chat-manager")) {
        document.querySelector(".chat-manager").remove();
      }

      this.app.browser.addElementToSelectorOrDom(
        ChatManagerTemplate(this.app, this.mod),
        this.container
      );
    }

    // Sort chat groups
    this.mod.groups = this.mod.groups.sort((a, b) => {
      let ts_a = a?.last_update || 0;
      let ts_b = b?.last_update || 0;

      return ts_b - ts_a;
    });

    //
    // render chat groups
    //
    let now = new Date().getTime();

    for (let group of this.mod.groups) {
      // *****************************************************
      // If this devolves into a DDOS attack against ourselves
      // comment out the following code
      //
      // We only send out a ping on a render if it has been at
      // least a minute since the last ping
      // *****************************************************
      if (group.members.length == 2 && this.mod.isRelayConnected) {
        for (let member of group.members) {
          if (member != this.mod.publicKey) {
            if (!this.pinged[group.id] || this.pinged[group.id] < now - 60000) {
              this.app.connection.emit("relay-send-message", {
                recipient: [member],
                request: "ping",
                data: {},
              });

              this.pinged[group.id] = now;

              if (this.timers[group.id]) {
                clearTimeout(this.timers[group.id]);
              }

              //If you don't hear back in 5 seconds, assume offline
              this.timers[group.id] = setTimeout(() => {
                console.log("Auto change to offline");
                let cm_handle = document.querySelector(`.chat-manager #saito-user-${group.id}`);
                if (cm_handle) {
                  cm_handle.classList.remove("online");
                }
                group.online = false;
                this.timers[group.id] = null;
              }, 1000 * 5);
            }
          }
        }
      }

      let html = await ChatTeaser(this.app, group);
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

  /*
    Set popup flags so that we don't auto open any chat groups in the /chat interface
  */
  switchTabs() {
    for (let popup in this.popups) {
      this.popups[popup].manually_closed = true;
      this.popups[popup].is_rendered = false;
    }
  }

  attachEvents() {
    //
    // clicks on the element itself (background)
    //
    document.querySelectorAll(".chat-manager-list .saito-user").forEach((item) => {
      item.onclick = async (e) => {
        e.stopPropagation();

        let gid = e.currentTarget.getAttribute("data-id");
        let group = this.mod.returnGroup(gid);

        if (!this.popups[gid]) {
          this.popups[gid] = new ChatPopup(
            this.app,
            this.mod,
            group?.target_container || this.chat_popup_container
          );
          this.popups[gid].group = group;
        }

        if (this.mod.browser_active) {
          this.switchTabs();
        }

        console.log("clcked popup", this.popups[gid]);
        // unset manually closed to permit rendering
        this.popups[gid].manually_closed = false;
        this.popups[gid].render();
        this.popups[gid].input.focus(true);

        if (this.render_manager_to_screen) {
          await this.render();
        }
      };

      item.oncontextmenu = async (e) => {
        e.preventDefault();
        let gid = e.currentTarget.getAttribute("data-id");
        let chatMenu = new ChatUserMenu(this.app, this.mod, this.mod.returnGroup(gid));
        await chatMenu.render();
      };
    });

    if (document.querySelector(".close-chat-manager")) {
      document.querySelector(".close-chat-manager").onclick = (e) => {
        this.app.connection.emit("close-chat-manager-overlay");
      };
    }


    if (document.querySelector(".chat-manager-options")) {
      document.querySelector(".chat-manager-options").onclick = (e) => {
        if (!this.chatManagerMenu){
          this.chatManagerMenu = new ChatManagerMenu(this.app, this.mod);
        }
        if (this.chatManagerMenu.active){
          this.chatManagerMenu.hide();
        }else{
          this.chatManagerMenu.render();  
        }
        document.querySelector(".chat-manager-options").classList.toggle("active");
      }
    }

  }
}

module.exports = ChatManager;
