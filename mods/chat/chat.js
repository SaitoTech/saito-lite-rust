const SaitoUserTemplate = require("./../../lib/saito/ui/saito-user/saito-user.template.js");
const saito = require("../../lib/saito/saito");
const ModTemplate = require("../../lib/templates/modtemplate");
const ChatMain = require("./lib/appspace/main");
const SaitoHeader = require("./../../lib/saito/ui/saito-header/saito-header");
const ChatManager = require("./lib/chat-manager/main");
const ChatManagerOverlay = require("./lib/overlays/chat-manager");
const JSON = require("json-bigint");
const localforage = require("localforage");
const Transaction = require("../../lib/saito/transaction").default;
const PeerService = require("saito-js/lib/peer_service").default;

class Chat extends ModTemplate {
  constructor(app) {
    super(app);

    this.name = "Chat";

    this.description = "Saito instant-messaging client";

    this.groups = [];

    /*
     Array of:
     {
        id: id,
        members: members, //Array of publicKeys
        member_ids: {} // Key->value pairs  :admin / :1 / :0 -- group admin, confirmed, unconfirmed member
        name: name,
        unread: 0, //Number of new messages
        txs: [],
        // Processed TX:
        {
            sig = "string" //To helpfully prevent duplicates??
            ts = number
            from = "string" //Assuming only one sender
            msg = "" // raw message
        }
        last_update
    }
    */

    this.inTransitImageMsgSig = null;

    this.added_identifiers_post_load = 0;

    this.communityGroup = null;
    this.communityGroupName = "Saito Community Chat";

    this.debug = false;

    this.chat_manager = null;

    this.chat_manager_overlay = null;

    this.loading = true;

    this.isRelayConnected = false;

    this.enable_notifications = false;

    this.app.connection.on("encrypt-key-exchange-confirm", (data) => {
      this.returnOrCreateChatGroupFromMembers(data?.members);
      this.app.connection.emit("chat-manager-render-request");
    });

    this.app.connection.on("remove-user-from-chat-group", async (group_id, member_id) => {
      let group = this.returnGroup(group_id);
      if (group) {
        if (group.members.includes(member_id) && group?.member_ids[this.publicKey] == "admin") {
          await this.sendRemoveMemberTransaction(group, member_id);
        }
      }
    });

    this.app.connection.on("chat-message-user", async (pkey, message) => {
      let group = this.returnOrCreateChatGroupFromMembers([this.publicKey, pkey]);

      let newtx = await this.createChatTransaction(group.id, message);
      await this.sendChatTransaction(this.app, newtx);

      siteMessage("Message sent through chat", 2500);
    });

    this.postScripts = ["/saito/lib/emoji-picker/emoji-picker.js"];

    this.theme_options = {
      lite: "fa-solid fa-sun",
      dark: "fa-solid fa-moon",
    };

    this.hiddenTab = "hidden";
    this.orig_title = "";
  }

  async initialize(app) {
    await super.initialize(app);

    //
    // if I run a chat service, create it
    //
    if (app.BROWSER == 0) {
      this.communityGroup = this.returnOrCreateChatGroupFromMembers(
        [this.publicKey],
        this.communityGroupName
      );
      this.communityGroup.members = [this.publicKey];

      //
      // Chat server hits archive on boot up so it has something to return
      // on chat history request
      await this.getOlderTransactions(this.communityGroup.id, "localhost");

      return;
    }

    //
    // BROWSERS ONLY
    //

    //Enforce compliance with wallet indexing
    if (!app.options?.chat) {
      app.options.chat = {};
      app.options.chat.groups = [];
      app.options.chat.enable_notifications = this.enable_notifications;
    } else if (Array.isArray(app.options.chat)) {
      let newObj = {
        groups: app.options.chat,
        enable_notifications: this.enable_notifications,
      };
      app.options.chat = newObj;
    } else {
      this.enable_notifications = app.options.chat?.enable_notifications;
    }

    if (app.options.chat.groups?.length == 0) {
      this.createDefaultChatsFromKeys();
    }

    this.app.storage.saveOptions();

    await this.loadChatGroups();

    //Add script for emoji to work
    this.attachPostScripts();

    // Set the name of the hidden property and the change event for visibility
    let visibilityChange;
    if (typeof document.hidden !== "undefined") {
      // Opera 12.10 and Firefox 18 and later support
      this.hiddenTab = "hidden";
      visibilityChange = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
      this.hiddenTab = "msHidden";
      visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
      this.hiddenTab = "webkitHidden";
      visibilityChange = "webkitvisibilitychange";
    }

    document.addEventListener(
      visibilityChange,
      () => {
        if (document[this.hiddenTab]) {
        } else {
          if (this.tabInterval) {
            clearInterval(this.tabInterval);
            this.tabInterval = null;
            document.title = this.orig_title;
          }
        }
      },
      false
    );
  }

  async render() {
    if (!this.app.BROWSER) {
      return;
    }

    if (this.app.options.theme) {
      let theme = this.app.options.theme[this.slug];

      if (theme != null) {
        this.app.browser.switchTheme(theme);
      }
    }

    if (this.main == null) {
      this.header = new SaitoHeader(this.app, this);
      await this.header.initialize(this.app);
      this.addComponent(this.header);

      this.main = new ChatMain(this.app, this);
      this.addComponent(this.main);
    }

    if (this.chat_manager == null) {
      this.chat_manager = new ChatManager(this.app, this);
      this.addComponent(this.chat_manager);
    }
    this.chat_manager.container = ".saito-sidebar.left";

    if (!(this.app.browser.isMobileBrowser(navigator.userAgent) && window.innerWidth < 750) && window.innerWidth > 599) {
      this.chat_manager.chat_popup_container = ".saito-main";
      //Main Chat Application doesn't use popups as such...
      this.chat_manager.render_popups_to_screen = 0;
    }

    this.chat_manager.render_manager_to_screen = 1;

    this.styles = ["/saito/saito.css", "/chat/style.css"];

    await super.render();
  }

  async onPeerServiceUp(app, peer, service = {}) {
    let chat_self = this;

    if (!app.BROWSER) {
      return;
    }

    if (service.service === "relay") {
      this.isRelayConnected = true;
      this.app.connection.emit("chat-manager-render-request");
    }

    //
    // load private chat
    //
    if (service.service === "archive") {
      if (this.debug) {
        console.log("Chat: onPeerServiceUp", service.service);
      }

      this.loading = this.groups.length;

      for (let group of this.groups) {
        //Let's not hit the Archive for community chat since that is seperately queried on service.service == chat
        if (group.name !== this.communityGroupName) {
          await this.app.storage.loadTransactions(
            {
              field3: group.id,
              limit: 100,
              created_later_than: group.last_update,
            },
            async (txs) => {
              chat_self.loading--;

              if (txs) {
                while (txs.length > 0) {
                  //Process the chat transaction like a new message
                  let tx = txs.pop();
                  await tx.decryptMessage(chat_self.app);
                  chat_self.addTransactionToGroup(group, tx);
                }
              }
            }
          );
        }
      }
    }

    //
    // load public chat
    //
    if (service.service === "chat") {
      if (this.debug) {
        console.log("Chat: onPeerServiceUp", service.service);
      }

      this.communityGroup = this.returnOrCreateChatGroupFromMembers(
        [peer.publicKey],
        this.communityGroupName
      );
      this.communityGroup.members = [peer.publicKey];

      if (this.communityGroup) {
        //
        // remove duplicate public chats caused by server update
        //
        for (let i = 0; i < this.groups.length; i++) {
          if (
            this.groups[i].name === this.communityGroup.name &&
            this.groups[i] !== this.communityGroup
          ) {
            if (this.groups[i].members.length == 1) {
              if (!this.app.network.isConnectedToPublicKey(this.groups[i].members[0])) {
                this.app.connection.emit("chat-popup-remove-request", this.groups[i]);
                this.groups.splice(i, 0);
              }
            }
          }
        }

        // let newtx = await this.app.wallet.createUnsignedTransaction();

        let msg = {
          request: "chat history",
          group_id: this.communityGroup.id,
          timestamp: this.communityGroup.last_update,
        };

        // await newtx.sign();

        this.app.network.sendRequestAsTransaction("chat history", msg, (txs) => {
          this.loading--;
          if (this.debug) {
            console.log("chat history callback: " + txs.length);
          }
          // These are no longer proper transactions!!!!

          if (this.communityGroup.txs.length > 0) {
            let most_recent_ts =
              this.communityGroup.txs[this.communityGroup.txs.length - 1].timestamp;
            for (let i = 0; i < txs.length; i++) {
              if (txs[i].timestamp > most_recent_ts) {
                this.communityGroup.txs.push(txs[i]);
              }
            }
          } else {
            this.communityGroup.txs = txs;
          }

          if (this.app.BROWSER) {
            let active_module = app.modules.returnActiveModule();
            if (
              app.browser.isMobileBrowser(navigator.userAgent) ||
              window.innerWidth < 600 ||
              active_module?.request_no_interrupts
            ) {
              this.app.connection.emit("chat-manager-request-no-interrupts");
              return;
            }
            /*
            Let's see if not auto opening community chat makes for a better UX
             else{
              this.app.connection.emit("chat-popup-render-request");
            }*/
          }
        });
      }
    }
  }

  returnServices() {
    let services = [];
    // servers with chat service run plaintext community chat groups
    if (this.app.BROWSER == 0) {
      services.push(new PeerService(null, "chat", this.communityGroupName));
    }
    return services;
  }

  respondTo(type, obj = null) {
    let chat_self = this;
    let force = false;

    switch (type) {
      case "chat-manager":
        if (this.chat_manager == null) {
          this.chat_manager = new ChatManager(this.app, this);
        }
        return this.chat_manager;
      case "saito-game-menu":
        // Need to make sure this is created so we can listen for requests to open chat popups
        if (this.chat_manager == null) {
          this.chat_manager = new ChatManager(this.app, this);
        }
        // Toggle this so that we can have the in-game menu launch a floating overlay for the chat manager
        force = true;

      case "saito-header":
      case "saito-floating-menu":
        //
        // In mobile, we use the hamburger menu to open chat (without leaving the page)
        //
        if (
          this.app.browser.isMobileBrowser() ||
          (this.app.BROWSER && window.innerWidth < 600) ||
          force
        ) {
          if (this.chat_manger) {
            //Don't want mobile chat auto popping up
            this.chat_manager.render_popups_to_screen = 0;
          }

          if (this.chat_manager_overlay == null) {
            this.chat_manager_overlay = new ChatManagerOverlay(this.app, this);
          }
          return [
            {
              text: "Chat",
              icon: "fas fa-comments",
              callback: function (app, id) {
                console.log("Render Chat manager overlay");
                chat_self.chat_manager_overlay.render();
              },
              event: function (id) {
                chat_self.app.connection.on("chat-manager-render-request", () => {
                  let elem = document.getElementById(id);
                  //console.log("Chat event, update", elem);
                  if (elem) {
                    let unread = 0;
                    for (let group of chat_self.groups) {
                      unread += group.unread;
                    }

                    if (unread) {
                      if (elem.querySelector(".saito-notification-dot")) {
                        elem.querySelector(".saito-notification-dot").innerHTML = unread;
                      } else {
                        chat_self.app.browser.addElementToId(
                          `<div class="saito-notification-dot">${unread}</div>`,
                          id
                        );
                      }
                    } else {
                      if (elem.querySelector(".saito-notification-dot")) {
                        elem.querySelector(".saito-notification-dot").remove();
                      }
                    }
                  }
                });

                //Trigger my initial display
                chat_self.app.connection.emit("chat-manager-render-request");
              },
            },
          ];
        } else if (!chat_self.browser_active) {
          //
          // Otherwise we go to the main chat application
          //
          return [
            {
              text: "Chat",
              icon: "fas fa-comments",
              callback: function (app, id) {
                window.location = "/chat";
              },
            },
          ];
        }
        return null;
      case "user-menu":
        if (obj?.publicKey!== this.publicKey) {
          return {
            text: "Chat",
            icon: "far fa-comment-dots",
            callback: function (app, publicKey) {
              if (chat_self.chat_manager == null) {
                chat_self.chat_manager = new ChatManager(chat_self.app, chat_self);
              }

              chat_self.chat_manager.render_popups_to_screen = 1;
              chat_self.app.connection.emit("open-chat-with", { key: publicKey });
            },
          };
        }

        return null;

      case "saito-profile-menu":
        if (obj?.publicKey) {
          if (
            chat_self.app.keychain.hasPublicKey(obj.publicKey) &&
            obj.publicKey !== this.publicKey
          ) {
            return {
              text: "Chat",
              icon: "far fa-comment-dots",
              callback: function (app, publicKey) {
                if (chat_self.chat_manager == null) {
                  chat_self.chat_manager = new ChatManager(chat_self.app, chat_self);
                }

                chat_self.chat_manager.render_popups_to_screen = 1;
                chat_self.app.connection.emit("open-chat-with", { key: publicKey });
              },
            };
          }
        }

        return null;
      default:
        return super.respondTo(type);
    }
  }

  //
  // ---------- on chain messages ------------------------
  // ONLY processed if I am in the to/from of the transaction
  // so I will process messages I send to community, but not other peoples
  // it is mostly just a legacy safety catch for direct messaging
  //
  async onConfirmation(blk, tx, conf) {
    if (conf == 0) {
      await tx.decryptMessage(this.app);

      let txmsg = tx.returnMessage();

      if (this.debug) {
        //console.log("Chat onConfirmation: " + txmsg.request);
      }

      if (txmsg.request == "chat message") {
        await this.receiveChatTransaction(tx, 1);
      }
      if (txmsg.request == "chat group") {
        await this.receiveCreateGroupTransaction(tx);
      }
      if (txmsg.request == "chat confirm") {
        await this.receiveConfirmGroupTransaction(tx);
      }
      if (txmsg.request == "chat add") {
        await this.receiveAddMemberTransaction(tx);
      }
      if (txmsg.request == "chat remove") {
        await this.receiveRemoveMemberTransaction(tx);
      }
    }
  }

  //
  // We have a Chat-services peer that does 2 things
  // 1) it uses archive to save all the chat messages passing through it
  // 2) it forwards all messages to everyone through Relay
  // Private messages are encrypted and will be ignored by other parties
  // but this is essential to receive unencrypted community chat messages
  // the trick is that receiveChatTransaction checks if the message is to a group I belong to
  // or addressed to me
  //
  async handlePeerTransaction(app, tx = null, peer, mycallback) {
    if (tx == null) {
      return 0;
    }

    await tx.decryptMessage(app); //In case forwarding private messages

    let txmsg = tx.returnMessage();

    if (!txmsg.request) {
      return 0;
    }

    if (this.debug && txmsg.request.includes("chat ")) {
      console.log("Chat handlePeerTransaction: " + txmsg.request);
    }

    if (txmsg.request === "chat history") {
      let group = this.returnGroup(txmsg?.data?.group_id);

      if (!group) {
        console.log("Group doesn't exist?");
        return 0;
      }

      //Just process the most recent 50 (if event that any)
      //Without altering the array!
      //mycallback(group.txs.slice(-50));

      if (mycallback) {
        let txs = group.txs.filter((t) => t.timestamp > txmsg?.data?.timestamp);
        mycallback(txs);
        return 1;
      }

      return 0;
    }

    if (txmsg.request === "chat message") {
      await this.receiveChatTransaction(tx);

      //
      // notify sender if requested
      //
      if (mycallback) {
        mycallback({ payload: "success", error: {} });
        return 1;
      }

      return 0;
    }

    if (txmsg.request === "chat message broadcast") {
      let inner_tx = new Transaction(undefined, txmsg.data);

      // console.log(inner_tx);

      //
      // if chat message broadcast is received - we are being asked to broadcast this
      // to a peer if the inner_tx is addressed to one of our peers.
      //
      if (inner_tx.to.length > 0 && app.BROWSER == 0) {
        let peers = await app.network.getPeers();

        if (inner_tx.isTo(this.publicKey)) {
          //
          // Addressed to chat server, so forward to all
          //
          console.log("Community Chat");
          peers.forEach((p) => {
            if (p.publicKey !== peer.publicKey) {
              app.network.sendTransactionWithCallback(inner_tx, null, p.peerIndex);
            }
          });
        } else {
          console.log(txmsg.data.to);
          peers.forEach((p) => {
            if (inner_tx.isTo(p.publicKey)) {
              //console.log("Forward private chat to " + p.publicKey);
              app.network.sendTransactionWithCallback(inner_tx, null, p.peerIndex);
            }
          });
        }
      }

      //
      // notify sender if requested
      //
      if (mycallback) {
        mycallback({ payload: "success", error: {} });
        return 1;
      }

      return 0;
    }

    return super.handlePeerTransaction(app, tx, peer, mycallback);
  }

  //
  // Create a n > 2 chat group (currently unencrypted)
  // We have a single admin (who can add additional members or kick people out)
  //
  async sendCreateGroupTransaction(group) {
    let newtx = await this.app.wallet.createUnsignedTransaction(
      this.publicKey,
      BigInt(0),
      BigInt(0)
    );
    if (newtx == null) {
      return;
    }

    for (let i = 0; i < group.members.length; i++) {
      if (group.members[i] !== this.publicKey) {
        newtx.addTo(group.members[i]);
      }
    }

    newtx.msg = {
      module: "Chat",
      request: "chat group",
      group_id: group.id,
      group_name: group.name,
      admin: this.publicKey,
      timestamp: new Date().getTime(),
    };

    await newtx.sign();

    await this.app.network.propagateTransaction(newtx);
  }

  async receiveCreateGroupTransaction(tx) {
    if (tx.isTo(this.publicKey)) {
      let txmsg = tx.returnMessage();

      let group = this.returnGroup(txmsg.group_id);

      //
      //Get the list of all keys message is sent to
      //
      let members = [];
      for (let x = 0; x < tx.to.length; x++) {
        if (!members.includes(tx.to[x].publicKey)) {
          members.push(tx.to[x].publicKey);
        }
      }

      if (group) {
        if (txmsg.group_name) {
          console.log("Update group name: " + txmsg.group_name);
          group.name = txmsg.group_name;
        }
      } else {
        group = this.returnOrCreateChatGroupFromMembers(members, txmsg.group_name);
        group.id = txmsg.group_id;
      }

      group.members = members;

      if (!group.member_ids) {
        group.member_ids = {};
      }
      for (let m of group.members) {
        if (!group.member_ids[m]) {
          group.member_ids[m] = 0;
        }
      }

      group.member_ids[this.publicKey] = 1;

      if (txmsg.admin) {
        group.member_ids[txmsg.admin] = "admin";
      }

      this.saveChatGroup(group);
      this.app.connection.emit("chat-manager-render-request");

      if (!tx.isFrom(this.publicKey)) {
        await this.sendConfirmGroupTransaction(group);
      }
    }
  }

  //
  // We automatically send a confirmation when added to a chat group (just so that we can make sure that the user was successfully added)
  // But in the future, we may add a confirmation interface
  //
  async sendConfirmGroupTransaction(group) {
    let newtx = await this.app.wallet.createUnsignedTransaction(
      this.publicKey,
      BigInt(0),
      BigInt(0)
    );
    if (newtx == null) {
      return;
    }

    for (let i = 0; i < group.members.length; i++) {
      if (group.members[i] !== this.publicKey) {
        newtx.addTo(group.members[i]);
      }
    }

    newtx.msg = {
      module: "Chat",
      request: "chat confirm",
      group_id: group.id,
      group_name: group.name,
      timestamp: new Date().getTime(),
    };

    await newtx.sign();

    await this.app.network.propagateTransaction(newtx);
  }

  async receiveConfirmGroupTransaction(tx) {
    if (tx.isTo(this.publicKey) && !tx.isFrom(this.publicKey)) {
      let txmsg = tx.returnMessage();

      let group = this.returnGroup(txmsg.group_id);

      if (!group) {
        await this.receiveCreateGroupTransaction(tx);
        group = this.returnGroup(txmsg.group_id);
      }

      if (!group.members.includes(tx.from[0].publicKey)) {
        group.members.push(tx.from[0].publicKey);
      }

      //Don't overwrite admin (if for some reason admin is sending a confirm)
      if (!group.member_ids[tx.from[0].publicKey]) {
        group.member_ids[tx.from[0].publicKey] = 1;
      }

      this.saveChatGroup(group);
    }
  }

  //
  // Add a member to an existing chat group
  //
  async sendAddMemberTransaction(group, member) {
    let newtx = await this.app.wallet.createUnsignedTransaction(
      this.publicKey,
      BigInt(0),
      BigInt(0)
    );
    if (newtx == null) {
      return;
    }

    if (!group.members.includes(member)) {
      group.members.push(member);
    }

    for (let i = 0; i < group.members.length; i++) {
      if (group.members[i] !== this.publicKey) {
        newtx.addTo(group.members[i]);
      }
    }

    newtx.msg = {
      module: "Chat",
      request: "chat add",
      group_name: group.name,
      group_id: group.id,
      member_id: member,
    };

    await newtx.sign();

    await this.app.network.propagateTransaction(newtx);
  }

  async receiveAddMemberTransaction(tx) {
    if (tx.isTo(this.publicKey)) {
      let txmsg = tx.returnMessage();

      //I am receiving message about being added to the group
      if (this.publicKey == txmsg.member_id) {
        await this.receiveCreateGroupTransaction(tx);
        let group = this.returnGroup(txmsg.group_id);

        tx.msg.message = `<div class="saito-chat-notice">added you to the group</div>`;
        this.addTransactionToGroup(group, tx);

        return;
      }

      let group = this.returnGroup(txmsg.group_id);

      if (!group) {
        console.warn("Chat group not found");
        return;
      }

      if (!group.members.includes(txmsg.member_id)) {
        group.members.push(txmsg.member_id);
      }

      //
      //Don't overwrite confirmed flag if txs arrive out of order
      //
      if (!group.member_ids) {
        group.member_ids = {};
      }

      if (!group.member_ids[txmsg.member_id]) {
        group.member_ids[txmsg.member_id] = 0;
      }

      tx.msg.message = `<div class="saito-chat-notice">added ${this.app.browser.returnAddressHTML(
        txmsg.member_id
      )} to the group</div>`;
      this.addTransactionToGroup(group, tx);

      //      this.saveChatGroup(group);
    }
  }

  async sendRemoveMemberTransaction(group, member) {
    let newtx = await this.app.wallet.createUnsignedTransaction(
      this.publicKey,
      BigInt(0),
      BigInt(0)
    );
    if (newtx == null) {
      return;
    }

    for (let i = 0; i < group.members.length; i++) {
      if (group.members[i] !== this.publicKey) {
        newtx.addTo(group.members[i]);
      }
    }

    newtx.msg = {
      module: "Chat",
      request: "chat remove",
      group_id: group.id,
      member_id: member,
    };

    await newtx.sign();

    await this.app.network.propagateTransaction(newtx);
  }

  async receiveRemoveMemberTransaction(tx) {
    if (tx.isTo(this.publicKey)) {
      let txmsg = tx.returnMessage();

      let group = this.returnGroup(txmsg.group_id);

      if (!group) {
        console.warn("Chat group doesn't exist locally");
        return;
      }

      for (let i = 0; i < group.members.length; i++) {
        if (group.members[i] == txmsg.member_id) {
          group.members.splice(i, 1);
          break;
        }
      }

      if (group.member_ids) {
        delete group.member_ids[txmsg.member_id];
      }

      if (this.publicKey == txmsg.member_id) {
        await this.deleteChatGroup(group);
      } else {
        if (tx.isFrom(txmsg.member_id)) {
          tx.msg.message = `<div class="saito-chat-notice">left the group</div>`;
        } else {
          tx.msg.message = `<div class="saito-chat-notice">kicked ${this.app.browser.returnAddressHTML(
            txmsg.member_id
          )} out of the group</div>`;
        }

        this.addTransactionToGroup(group, tx);
      }
    }
  }

  /**
   *
   * Encrypt and send your chat message
   * We send messages on chain to their target and to the chat-services node via Relay
   *
   */
  async sendChatTransaction(app, tx) {
    if (!tx) {
      console.warn("Chat: Cannot send null transaction");
      return;
    }

    //
    // won't exist if encrypted
    //
    if (tx?.msg?.message) {
      if (tx.msg.message.substring(0, 4) == "<img") {
        if (this.inTransitImageMsgSig) {
          salert("Image already being sent");
          return;
        }
        this.inTransitImageMsgSig = tx.signature;
      }
    }

    let peers = await app.network.getPeers();

    if (peers.length > 0) {
      let recipient = peers[0].publicKey;
      for (let i = 0; i < peers.length; i++) {
        if (peers[i].hasService("chat")) {
          recipient = peers[i].publicKey;
          break;
        }
      }

      await app.network.propagateTransaction(tx);
      app.connection.emit("relay-send-message", {
        recipient,
        request: "chat message broadcast",
        data: tx.toJson(),
      });
    } else {
      salert("Connection to chat server lost");
    }
  }

  async createChatTransaction(group_id, msg = "", to_keys = []) {
    let newtx = await this.app.wallet.createUnsignedTransaction(
      this.publicKey,
      BigInt(0),
      BigInt(0)
    );
    if (newtx == null) {
      console.error("Null tx created for chat");
      return null;
    }

    let secret_holder = "";

    //
    //I'm not sure we need either of these...
    //
    newtx.addFrom(this.publicKey);
    newtx.addTo(this.publicKey);

    for (let mention of to_keys) {
      newtx.addTo(mention);
    }

    let members = this.returnMembers(group_id);

    for (let i = 0; i < members.length; i++) {
      if (members[i] !== this.publicKey) {
        secret_holder = members[i];
      }

      newtx.addTo(members[i]);
    }

    newtx.msg = {
      module: "Chat",
      request: "chat message",
      group_id: group_id,
      message: msg,
      timestamp: new Date().getTime(),
    };


    // sanity check
    let wallet_balance = await this.app.wallet.getBalance("SAITO");

    // restrict radix-spam
    if (
      wallet_balance == 0 &&
      this.app.BROWSER == 1 &&
      this.app.browser.stripHtml(msg).length >= 1000
    ) {
      siteMessage("Purchase SAITO to Send Large Messages in Community Chat...", 3000);
      return null;
    }

    let group = this.returnGroup(group_id);
    if (group) {
      if (!members.includes(group.name)) {
        newtx.msg.group_name = group.name;
      }
    }

    if (members.length == 2) {
      console.log("Chat: Try encrypting Message for " + secret_holder);

      //
      // Only encrypts if we have swapped keys and haveSharedKey, otherwise just signs
      //
      newtx = await this.app.wallet.signAndEncryptTransaction(newtx, secret_holder);
    } else {
      await newtx.sign();
    }

    return newtx;
  }

  /**
   * Everyone receives the chat message (via the Relay)
   * So we make sure here it is actually for us (otherwise will be encrypted gobbledygook)
   */
  async receiveChatTransaction(tx, onchain = 0) {
    if (this.inTransitImageMsgSig == tx.signature) {
      this.inTransitImageMsgSig = null;
    }

    let txmsg = "";

    try {
      await tx.decryptMessage(this.app);
      txmsg = tx.returnMessage();
    } catch (err) {
      console.log("ERROR: " + JSON.stringify(err));
    }

    if (this.debug) {
      console.log("Receive Chat Transaction:");
      console.log(JSON.parse(JSON.stringify(tx)));
      console.log(JSON.parse(JSON.stringify(txmsg)));
    }

    //
    // if to someone else and encrypted
    // (i.e. I am sending an encrypted message and not waiting for relay)
    //
    //if (tx.from[0].publicKey == this.publicKey) {
    //    if (app.keychain.hasSharedSecret(tx.to[0].publicKey ) {
    //    }
    //}

    //
    // save transactions if getting chat tx over chain
    // and only trigger if you were the sender
    // (should less the duplication effect)
    //
    if (onchain) {
      if (this.app.BROWSER) {
        if (tx.isFrom(this.publicKey)) {
          //console.log("Save My Sent Chat TX");
          await this.app.storage.saveTransaction(tx, { field3: txmsg.group_id });
        }
      }
    }

    let group = this.returnGroup(txmsg.group_id);

    if (!group) {
      if (!tx.isTo(this.publicKey)) {
        if (this.debug) {
          console.log("Chat message not for me");
        }
        return;
      }

      //
      // Create a chat group on the fly if properly addressed to me
      //
      let members = [];
      for (let x = 0; x < tx.to.length; x++) {
        if (!members.includes(tx.to[x].publicKey)) {
          members.push(tx.to[x].publicKey);
        }
      }

      group = this.returnOrCreateChatGroupFromMembers(members, txmsg.group_name);
      group.id = txmsg.group_id;
    }

    //Have we already inserted this message into the chat?
    for (let z = 0; z < group.txs.length; z++) {
      if (group.txs[z].signature === tx.signature) {
        if (this.debug) {
          console.log("Duplicate received message");
        }
        return;
      }
    }

    this.addTransactionToGroup(group, tx);
    this.app.connection.emit("chat-popup-render-request", group);
  }

  //////////////////
  // UI Functions //
  //////////////////
  //
  // These three functions replace all the templates to format the messages into
  // single speaker blocks
  //
  returnChatBody(group_id) {
    let html = "";
    let group = this.returnGroup(group_id);
    if (!group) {
      return "";
    }
    let message_blocks = this.createMessageBlocks(group);

    for (let block of message_blocks) {
      let ts = 0;
      if (block?.date) {
        html += `<div class="saito-time-stamp">${block.date}</div>`;
      } else {
        if (block.length > 0) {
          let sender = "";
          let msg = "";
          for (let z = 0; z < block.length; z++) {
            ts = ts || block[z].timestamp;
            sender = block[z].from[0];

            const replyButton = `
              <div data-id="${block[z].signature}" data-href="${
              sender + ts
            }" class="saito-userline-reply">
                <div class="chat-copy"><i class="fas fa-copy"></i></div>
                <div class="chat-reply"><i class="fas fa-reply"></i></div>
                <div class="saito-chat-line-controls">
                  <span class="saito-chat-line-timestamp">
                    ${this.app.browser.returnTime(ts)}
                  </span>
                </div>
              </div>`;
            msg += `<div class="chat-message-line message-${block[z].signature}${
              block[z].flag_message ? " user-mentioned-in-chat-line" : ""
            }">`;
            if (block[z].msg.indexOf("<img") != 0) {
              msg += this.app.browser.sanitize(block[z].msg);
            } else {
              msg += block[z].msg.substring(0, block[z].msg.indexOf(">") + 1);
            }
            msg += `
                ${replyButton}
              </div>`;
          }

          //Use FA 5 so compatible in games (until we upgrade everything to FA6)
          html += `${SaitoUserTemplate({
            app: this.app,
            publicKey: sender,
            notice: msg,
            fourthelem: "",
            id: sender + ts,
          })}`;
        }
      }
    }

    group.unread = 0;
    group.mentioned = false;

    //Save the status that we have read these messages
    this.saveChatGroup(group);

    return html;
  }

  createMessageBlocks(group) {
    let blocks = [];
    let block = [];
    let last_message_sender = "";
    let last_message_ts = 0;
    let last = new Date(0);

    for (let minimized_tx of group?.txs) {
      //Same Sender -- keep building block
      let next = new Date(minimized_tx.timestamp);

      if (
        minimized_tx.from.includes(last_message_sender) &&
        minimized_tx.timestamp - last_message_ts < 300000 &&
        next.getDate() == last.getDate()
      ) {
        block.push(minimized_tx);
      } else {
        //Start new block
        if (block.length > 0) {
          blocks.push(block);
          block = [];
        }
        if (next.getDate() !== last.getDate()) {
          if (next.toDateString() == new Date().toDateString()) {
            blocks.push({ date: "Today" });
          } else {
            blocks.push({ date: next.toDateString() });
          }
        }

        block.push(minimized_tx);
      }

      last_message_sender = minimized_tx.from[0];
      last_message_ts = minimized_tx.timestamp;
      last = next;
    }

    blocks.push(block);
    return blocks;
  }

  //
  // Since we were always testing the timestamp its a good thing we don't manipulate it
  //
  addTransactionToGroup(group, tx) {
    if (this.debug) {
      console.log("Adding Chat TX to group: ", tx);
    }

    // Limit live memory
    // I may be overly worried about memory leaks
    // If users can dynamically load older messages, this limit creates a problem
    // when scrolling back in time
    if (!this.app.BROWSER) {
      while (group.txs.length > 200) {
        group.txs.shift();
      }
    }

    let content = tx.returnMessage()?.message;
    if (!content) {
      console.warn("Not a chat message?");
      return;
    }
    let new_message = {
      signature: tx.signature,
      timestamp: tx.timestamp,
      from: [],
      msg: content,
    };

    if (
      tx.isTo(this.publicKey) &&
      this.app.BROWSER &&
      !tx.isFrom(this.publicKey) &&
      group.members.length !== 2
    ) {
      console.log("CHAT MESSAGE DIRECTED TO ME!!!!");
      group.mentioned = true;
      new_message.flag_message = true;
    }

    //Keep the from array just in case....
    for (let sender of tx.from) {
      if (!new_message.from.includes(sender.publicKey)) {
        new_message.from.push(sender.publicKey);
      }
    }

    for (let i = 0; i < group.txs.length; i++) {
      if (group.txs[i].signature === tx.signature) {
        if (this.debug) {
          console.log("duplicate");
        }
        return;
      }
      if (tx.timestamp < group.txs[i].timestamp) {
        group.txs.splice(i, 0, new_message);
        group.unread++;

        if (this.debug) {
          console.log("out of order " + i);
          console.log(JSON.parse(JSON.stringify(new_message)));
        }

        return;
      }
    }

    group.txs.push(new_message);

    group.unread++;

    group.last_update = tx.timestamp;

    if (!this.app.BROWSER) {
      return;
    }

    if (this.debug) {
      console.log(`new msg: ${group.unread} unread`);
      console.log(JSON.parse(JSON.stringify(new_message)));
    }

    if (/*group.name !== this.communityGroupName &&*/ !new_message.from.includes(this.publicKey)) {
      //
      // Flag the group that there is a new message
      // This is so we can add an animation effect on rerender
      // and will be reset there
      //
      group.notification = true;

      //Send System notification
      if (this.enable_notifications) {
        let sender = this.app.keychain.returnIdentifierByPublicKey(new_message.from[0], true);
        if (group.unread > 1) {
          sender += ` (${group.unread})`;
        }
        let new_msg = content.indexOf("<img") == 0 ? "[image]" : this.app.browser.sanitize(content);
        const regex = /<blockquote>.*<\/blockquote>/is;
        new_msg = new_msg.replace(regex, "reply: ").replace("<br>", "");
        const regex2 = /<a[^>]+>/i;
        new_msg = new_msg.replace(regex2, "").replace("</a>", "");

        this.app.browser.sendNotification(sender, new_msg, `chat-message-${group.id}`);
      }

      //Flash new message in browser tab
      this.startTabNotification();

      //Add liveness indicator to group
      this.app.connection.emit("group-is-active", group);
    }

    //Save to IndexedDB Here
    if (this.loading <= 0) {
      this.saveChatGroup(group);
    } else {
      console.warn(`Not saving because in loading mode (${this.loading})`);
    }
  }

  ///////////////////
  // CHAT UTILITIES //
  ///////////////////
  createGroupIdFromMembers(members = null) {
    if (members == null) {
      return "";
    }

    let clean_array = [];
    for (let member of members) {
      clean_array.push(member);
    }
    //So David + Richard == Richard + David
    clean_array.sort();

    return this.app.crypto.hash(`${clean_array.join("_")}`);
  }

  //
  // if we already have a group with these members,
  // returnOrCreateChatGroupFromMembers will find and return it, otherwise
  // it makes a new group
  //
  returnOrCreateChatGroupFromMembers(members = null, name = null, update_name = true) {
    if (!members) {
      return null;
    }

    let id;

    //This might keep persistence across server resets
    if (name === this.communityGroupName) {
      id = this.app.crypto.hash(this.communityGroupName);
    } else {
      //Make sure that I am part of the chat group
      if (!members.includes(this.publicKey)) {
        members.push(this.publicKey);
      }
      id = this.createGroupIdFromMembers(members);
    }

    if (name == null) {
      name = "";
      for (let i = 0; i < members.length; i++) {
        if (members[i] != this.publicKey) {
          name += members[i] + ", ";
        }
      }
      if (!name) {
        name = "me";
      } else {
        name = name.substring(0, name.length - 2);
      }
    }

    for (let i = 0; i < this.groups.length; i++) {
      if (this.groups[i].id == id) {
        //console.log(JSON.parse(JSON.stringify(this.groups[i])));
        if (update_name && this.groups[i].name != name) {
          this.groups[i].old_name = this.groups[i].name;
          this.groups[i].name = name;
        } else if (this.groups[i].old_name) {
          this.groups[i].name = this.groups[i].old_name;
          delete this.groups[i].old_name;
        }

        return this.groups[i];
      }
    }

    if (this.debug) {
      console.log("Creating new chat group " + id);
      console.log(JSON.stringify(members));
    }

    let newGroup = {
      id: id,
      members: members,
      name: name,
      txs: [],
      unread: 0,
      last_update: 0,
    };

    //Prepend the community chat
    if (name === this.communityGroupName) {
      this.groups.unshift(newGroup);
    } else {
      this.groups.push(newGroup);
    }

    this.app.connection.emit("chat-manager-render-request");

    return newGroup;
  }

  returnGroup(group_id) {
    for (let i = 0; i < this.groups.length; i++) {
      if (group_id === this.groups[i].id) {
        return this.groups[i];
      }
    }

    return null;
  }

  returnGroupByMemberPublickey(publicKey) {
    for (let i = 0; i < this.groups.length; i++) {
      if (this.groups[i].members.includes(publicKey)) {
        return this.groups[i];
      }
    }
    return null;
  }

  returnMembers(group_id) {
    for (let i = 0; i < this.groups.length; i++) {
      if (group_id === this.groups[i].id) {
        return [...new Set(this.groups[i].members)];
      }
    }
    return [];
  }

  returnGroupByName(name = "") {
    for (let i = 0; i < this.groups.length; i++) {
      if (this.groups[i].name === name) {
        return this.groups[i];
      }
    }
    return this.groups[0];
  }

  returnCommunityChat() {
    for (let i = 0; i < this.groups.length; i++) {
      if (this.groups[i].name === this.communityGroupName) {
        return this.groups[i];
      }
    }
    return this.groups[0];
  }

  createDefaultChatsFromKeys() {
    //
    // create chatgroups from keychain -- friends only
    //
    let keys = this.app.keychain.returnKeys();
    //console.log("Populate chat list");
    for (let i = 0; i < keys.length; i++) {
      if (keys[i].aes_publicKey && !keys[i]?.mute) {
        this.returnOrCreateChatGroupFromMembers([keys[i].publicKey], keys[i].name, false);
      }
    }

    //
    // create chatgroups from groups
    //
    let g = this.app.keychain.returnGroups();
    for (let i = 0; i < g.length; i++) {
      this.returnOrCreateChatGroupFromMembers(g[i].members, g[i].name, false);
    }
    this.app.connection.emit("chat-manager-render-request");
  }

  async getOlderTransactions(group_id, peer = null) {
    let group = this.returnGroup(group_id);

    if (!group) {
      return;
    }

    let ts = new Date().getTime();

    if (group.txs.length > 0) {
      ts = group.txs[0].timestamp;
    }

    let chat_self = this;

    await this.app.storage.loadTransactions(
      { field3: group.id, limit: 25, created_earlier_than: ts },
      async (txs) => {
        console.log(`Fetched ${txs?.length} older chat messages from Archive`);

        if (!txs || txs.length < 25) {
          this.app.connection.emit("chat-remove-fetch-button-request", group_id);
        }

        if (txs) {
          while (txs.length > 0) {
            //Process the chat transaction like a new message
            let tx = txs.pop();
            await tx.decryptMessage(chat_self.app);
            chat_self.addTransactionToGroup(group, tx);
            chat_self.app.connection.emit("chat-popup-render-request", group);
            chat_self.app.connection.emit("chat-popup-scroll-top-request", group_id);
          }
        }
      },
      peer
    );
  }

  ///////////////////
  // LOCAL STORAGE //
  ///////////////////
  async loadChatGroups() {
    if (!this.app.BROWSER) {
      return;
    }

    let chat_self = this;
    //console.log("Reading local DB");
    let count = 0;
    for (let g_id of this.app.options.chat.groups) {
      //console.log("Fetch", g_id);
      count++;
      await localforage.getItem(`chat_${g_id}`, function (error, value) {
        count--;
        //Because this is async, the initialize function may have created an
        //empty default group

        if (value) {
          let currentGroup = chat_self.returnGroup(g_id);
          if (currentGroup) {
            value.members = currentGroup.members;
            currentGroup = Object.assign(currentGroup, value);
          } else {
            chat_self.groups.push(value);
          }

          //console.log(value);
        }

        if (count === 0) {
          chat_self.createDefaultChatsFromKeys();
        }
      });
    }
  }

  saveChatGroup(group) {
    if (!this.app.BROWSER) {
      return;
    }
    let chat_self = this;

    //Save group in app.options
    if (!this.app.options.chat.groups.includes(group.id)) {
      this.app.options.chat.groups.push(group.id);
      this.app.storage.saveOptions();
    }

    let online_status = group.online;

    //Make deep copy
    let new_group = JSON.parse(JSON.stringify(group));
    new_group.online = false;
    new_group.txs = group.txs.slice(-50);
    //Don't save the stun-specified target container
    if (new_group.target_container) {
      delete new_group.target_container;
    }

    localforage.setItem(`chat_${group.id}`, new_group).then(function () {
      if (chat_self.debug) {
        console.log("Saved chat history for " + new_group.id);
        console.log(JSON.parse(JSON.stringify(new_group)));
      }
    });
    group.online = online_status;
  }

  async deleteChatGroup(group = null) {
    if (!group){
      return;
    }

    let key_to_update = "";
    for (let i = 0; i < this.groups.length; i++) {
      if (this.groups[i].id === group.id) {
        if (this.groups[i].members.length == 2) {
          for (let member of this.groups[i].members) {
            if (member !== this.publicKey) {
              key_to_update = member;
            }
          }
        }

        this.groups.splice(i, 1);
        break;
      }
    }

    for (let i = 0; i < this.app.options.chat.groups.length; i++) {
      if (this.app.options.chat.groups[i] === group.id) {
        this.app.options.chat.groups.splice(i, 1);
        break;
      }
    }

    this.app.storage.saveOptions();

    if (key_to_update) {
      this.app.keychain.addKey(key_to_update, { mute: 1 });
    }

    await localforage.removeItem(`chat_${group.id}`);

    this.app.connection.emit("chat-manager-render-request");
  }

  async onUpgrade(type, privatekey, walletfile) {
    if (type == "nuke") {
      for (let i = 0; i < this.groups.length; i++) {
        await localforage.removeItem(`chat_${this.groups[i].id}`);
      }
    }
    return 1;
  }

  startTabNotification() {
    if (!this.app.BROWSER) {
      return;
    }
    //If we haven't already started flashing the tab
    let notifications = 0;
    for (let group of this.groups) {
      if (group.name !== this.communityGroupName) {
        notifications += group.unread;
      }
    }

    if (!this.tabInterval && document[this.hiddenTab]) {
      this.orig_title = document.title;
      this.tabInterval = setInterval(() => {
        if (document.title === this.orig_title) {
          document.title = `(${notifications}) unread message${notifications == 1 ? "" : "s"}`;
        } else {
          document.title = "New message";
        }
      }, 650);
    }
  }
}

module.exports = Chat;
