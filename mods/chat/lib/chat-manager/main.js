const ChatPopup = require("./popup");
const ChatManagerTemplate = require("./main.template");
const ChatTeaser = require("./teaser.template");
const JSON = require("json-bigint");
<<<<<<< HEAD
=======
const ChatMenu = require("./../overlays/chat-menu");
const ContactsList = require("./../../../../lib/saito/ui/modals/saito-contacts/saito-contacts");
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0

class ChatManager {
  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.container = container || ".chat-manager";
    this.contactList = new ContactsList(app, mod, true);
    this.contactList.callback = async (person) => {
      if (Array.isArray(person) && person.length > 1) {
        let name = await sprompt("Choose a name for the group");
        //Make sure I am in the group too!
        person.push(this.app.wallet.returnPublicKey());
        let group = this.mod.returnOrCreateChatGroupFromMembers(person, name);
        
        if (group.txs.length == 0){
          this.mod.sendCreateGroupTransaction(group);  
        }
      }
    };

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

<<<<<<< HEAD
    app.connection.on("chat-manager-and-popup-render-request", (group) => {
      if (this.render_manager_to_screen) {
        group.unread = 0;
        this.render();
        if (this.render_popups_to_screen) {
          app.connection.emit("chat-popup-render-request", group);
        }
      }
    });

=======
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    app.connection.on("chat-manager-request-no-interrupts", () => {
      this.render_popups_to_screen = 0;
    });

    //
    // handle requests to re-render chat popups
    //
<<<<<<< HEAD
    app.connection.on("chat-popup-render-request", async (group = null) => {
      //
      // mobile devices should not force open chat for us
      //
      if (app.browser.isMobileBrowser()) {
        let active_mod = this.app.modules.returnActiveModule();
        if (await active_mod.respondTo("arcade-games")) {
          return;
        }
      }

      if (group == null) {
        let group = this.mod.returnCommunityChat();
        if (group != null) {
          this.app.connection.emit("chat-popup-render-request", group);
        }
      } else {
        if (this.render_popups_to_screen) {
          if (!this.popups[group.id]) {
            this.popups[group.id] = new ChatPopup(this.app, this.mod, "");
            this.popups[group.id].group = group;
          }
          await this.popups[group.id].render();
=======
    app.connection.on("chat-popup-render-request", (group = null) => {

      if (!group) {
        group = this.mod.returnCommunityChat();
      }

      if (group) {
        if (!this.popups[group.id]) {
          this.popups[group.id] = new ChatPopup(this.app, this.mod);
          this.popups[group.id].group = group;
        }

        if (this.render_popups_to_screen) {
          this.popups[group.id].container = group?.target_container || "";
          this.popups[group.id].render();
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
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

<<<<<<< HEAD
=======
    // This is a short cut for any other UI components to trigger the chat-popup window
    // (in the absence of a proper chat-manager listing the groups/contacts)

>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    app.connection.on("open-chat-with", (data = null) => {
      this.render_popups_to_screen = 1;

      if (this.mod.debug) {
        console.log("open-chat-with");
      }

      if (!data) {
        let group = this.mod.returnCommunityChat();
        if (this.popups[group.id]) {
          this.popups[group.id].manually_closed = false;
        }
        this.app.connection.emit("chat-popup-render-request", this.mod.returnCommunityChat());
        return;
      }

      let group;

      if (Array.isArray(data.key)) {
        group = this.mod.returnOrCreateChatGroupFromMembers(data.key, data.name);
      } else {
        let name = data.name || app.keychain.returnUsername(data.key);
        group = this.mod.returnOrCreateChatGroupFromMembers(
          [app.wallet.returnPublicKey(), data.key],
          name
        );
      }

      //
      // permit re-open
      //
      if (this.popups[group.id]) {
        this.popups[group.id].manually_closed = false;
      }

      app.connection.emit("chat-popup-render-request", group);
    });
<<<<<<< HEAD
  }

=======

    app.connection.on("relay-is-online", (pkey) => {
      let target_id = this.mod.createGroupIdFromMembers([pkey, app.wallet.returnPublicKey()]);
      let group = this.mod.returnGroup(target_id);
      console.log("Receive online confirmation from " + pkey);
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

      this.timers[group.id] = setTimeout(()=>{
        group.online = false;
        app.connection.emit("chat-manager-render-request");
      }, 60000);
    });

  }

>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
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
      this.app.browser.replaceElementBySelector(
        ChatManagerTemplate(this.app, this.mod),
        ".chat-manager"
      );
    } else {
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
<<<<<<< HEAD
    for (let group of this.mod.groups) {
      if (!group.unread) {
        group.unread = 0;
      }
=======
    let now = new Date().getTime();
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0

    for (let group of this.mod.groups) {

<<<<<<< HEAD
      if (group.txs.length > 0) {
        let tx = group.txs[group.txs.length - 1];
        console.log("transaction returned", tx);
        last_msg = this.app.browser.stripHtml(tx.msg);
        last_ts = tx.ts;
=======
      // *****************************************************
      // If this devolves into a DDOS attack against ourselves
      // comment out the following code
      // 
      // We only send out a ping on a render if it has been at 
      // least a minute since the last ping
      // *****************************************************
      if (group.members.length == 2 && this.mod.isRelayConnected) {
        for (let member of group.members) {
          if (member != this.app.wallet.returnPublicKey()) {
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
                cm_handle.classList.remove("online");
                group.online = false;
                this.timers[group.id] = null;
              }, 1000 * 5);
            }
          }
        }
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
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
<<<<<<< HEAD
    let cm = this;

=======
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    //
    // clicks on the element itself (background)
    //
    document.querySelectorAll(".chat-manager-list .saito-user").forEach((item) => {
      item.onclick = (e) => {
        let gid = e.currentTarget.getAttribute("data-id");
        this.render_popups_to_screen = 1;
        let group = this.mod.returnGroup(gid);

        if (!this.popups[gid]) {
          this.popups[gid] = new ChatPopup(this.app, this.mod);
          this.popups[gid].group = group;
        }

        // unset manually closed to permit re-opening
<<<<<<< HEAD
        if (this.popups[gid]) {
          this.popups[gid].manually_closed = false;
        }
        cm.app.connection.emit("chat-popup-render-request", group);
      };
    });
=======
        this.popups[gid].manually_closed = false;

        if (this.render_popups_to_screen) {
          this.popups[gid].container = group?.target_container || "";
          this.popups[gid].render();
          this.popups[gid].input.focus(true);
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
      };
    });

    if (document.querySelector(".add-contacts")) {
      document.querySelector(".add-contacts").onclick = (e) => {
        this.contactList.render();
      };
    }

    if (document.querySelector(".refresh-contacts")) {
      document.querySelector(".refresh-contacts").onclick = (e) => {
        for (let group of this.mod.groups) {
          if (group.members.length == 2) {
            //console.log(JSON.parse(JSON.stringify(group.members)));
            for (let member of group.members) {
              if (member != this.app.wallet.returnPublicKey()) {
                //console.log("Send Ping to " + member);
                this.app.connection.emit("relay-send-message", {
                  recipient: [member],
                  request: "ping",
                  data: {},
                });

                this.pinged[group.id] = new Date().getTime();

                if (this.timers[group.id]) {
                  clearTimeout(this.timers[group.id]);
                }

                //If you don't hear back in 5 seconds, assume offline
                this.timers[group.id] = setTimeout(() => {
                  console.log("Auto change to offline");
                  let cm_handle = document.querySelector(`.chat-manager #saito-user-${group.id}`);
                  cm_handle.classList.remove("online");
                  group.online = false;
                  this.timers[group.id] = null;
                }, 1000 * 5);

              }
            }
          }
        }
      };
    }
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
  }
}

module.exports = ChatManager;
