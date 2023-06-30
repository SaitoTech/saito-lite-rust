const ChatPopup = require("./popup");
const ChatManagerTemplate = require("./main.template");
const ChatTeaser = require("./teaser.template");
const JSON = require("json-bigint");

class ChatManager {
  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.container = container || ".chat-manager";
    this.name = "ChatManager";

    //
    // some apps may want chat manager quietly in background
    //
    this.rendered = 0;
    this.render_manager_to_screen = 1;
    this.render_popups_to_screen = 1;

    //
    // track popups
    //
    this.popups = {};

    //
    // handle requests to re-render chat manager
    //
    app.connection.on("chat-manager-render-request", () => {
      if (this.render_manager_to_screen) {
        this.render();
      }
    });

    app.connection.on("chat-manager-and-popup-render-request", (group) => {
      if (this.render_manager_to_screen) {
        group.unread = 0;
        this.render();
        if (this.render_popups_to_screen) {
          app.connection.emit("chat-popup-render-request", group);
        }
      }
    });

    app.connection.on("chat-manager-request-no-interrupts", () => {
      this.render_popups_to_screen = 0;
    });

    //
    // handle requests to re-render chat popups
    //
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
          if (!Array.isArray(group.txs)) {
            group.txs = group.txs.msg;
          }
          this.app.connection.emit("chat-popup-render-request", group);
        }
      } else {
        if (this.render_popups_to_screen) {
          if (!this.popups[group.id]) {
            this.popups[group.id] = new ChatPopup(this.app, this.mod, "");
            this.popups[group.id].group = group;
          }
          await this.popups[group.id].render();
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

    app.connection.on("open-chat-with", async (data = null) => {
      this.render_popups_to_screen = 1;

      //
      // mobile devices should not force open chat for us
      //
      if (app.browser.isMobileBrowser()) {
        return;
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
        group = this.mod.createChatGroup(data.key, data.name);
      } else {
        let name = data.name || app.keychain.returnUsername(data.key);
        group = this.mod.createChatGroup([await app.wallet.getPublicKey(), data.key], name);
      }

      //
      // permit re-open
      //
      if (this.popups[group.id]) {
        this.popups[group.id].manually_closed = false;
      }

      app.connection.emit("chat-popup-render-request", group);
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

    //
    // render chat groups
    //
    for (let group of this.mod.groups) {
      if (!group.unread) {
        group.unread = 0;
      }

      // {
      //   id: id,
      //   members: members,
      //   name: name,
      //   txs: [],
      // }

      let last_msg = "new chat";
      let last_ts = new Date().getTime();

      if (group.txs.length > 0) {
        let tx = group.txs[group.txs.length - 1];
        console.log("transaction returned", tx);
        last_msg = this.app.browser.stripHtml(tx.msg);
        last_ts = tx.ts;
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

    this.rendered = 1;
    this.attachEvents();
  }

  attachEvents() {
    let cm = this;

    //
    // clicks on the element itself (background)
    //
    document.querySelectorAll(".chat-manager-list .saito-user").forEach((item) => {
      item.onclick = (e) => {
        let gid = e.currentTarget.getAttribute("data-id");
        this.render_popups_to_screen = 1;
        let group = cm.mod.returnGroup(gid);
        // unset manually closed to permit re-opening
        if (this.popups[gid]) {
          this.popups[gid].manually_closed = false;
        }
        cm.app.connection.emit("chat-popup-render-request", group);
      };
    });
  }
}

module.exports = ChatManager;
