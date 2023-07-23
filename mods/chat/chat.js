// const SaitoUserTemplate = require("./../../lib/saito/ui/saito-user/saito-user.template.js");
// const saito = require("../../lib/saito/saito");
// const ModTemplate = require("../../lib/templates/modtemplate");
// const ChatManager = require("./lib/chat-manager/main");
// const ChatManagerOverlay = require("./lib/overlays/chat-manager");
// const ChatPopup = require("./lib/chat-manager/popup");
// const JSON = require("json-bigint");
// const PeerService = require("saito-js/lib/peer_service").default;
// const Slip = require("../../lib/saito/slip").default;
// const Transaction = require("../../lib/saito/transaction").default;
// const localforage = require("localforage");
// const ChatMain = require("./lib/appspace/main");

const SaitoUserTemplate = require("./../../lib/saito/ui/saito-user/saito-user.template.js");
const saito = require("../../lib/saito/saito");
const ModTemplate = require("../../lib/templates/modtemplate");
const ChatMain = require("./lib/appspace/main");
const SaitoHeader = require("./../../lib/saito/ui/saito-header/saito-header");
const ChatManager = require("./lib/chat-manager/main");
const ChatManagerOverlay = require("./lib/overlays/chat-manager");
const JSON = require("json-bigint");
//const JsStore = require("jsstore");
const Slip = require("../../lib/saito/slip").default;
const Transaction = require("../../lib/saito/transaction").default;
const localforage = require("localforage");
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
        members: members, //Array of publickeys
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

    this.publicKey = app.wallet.publicKey;

    this.isRelayConnected = false;

    this.app.connection.on("encrypt-key-exchange-confirm", (data) => {
      this.returnOrCreateChatGroupFromMembers(data?.members);
      this.app.connection.emit("chat-manager-render-request");
    });

    this.postScripts = ["/saito/lib/emoji-picker/emoji-picker.js"];

    //    this.styles = ["/saito/saito.css", "/chat/style.css"];

    this.theme_options = {
      lite: "fa-solid fa-sun",
      dark: "fa-solid fa-moon"
    };

    this.hiddenTab = "hidden";
    this.orig_title = "";

    return;
  }

  async initialize(app) {
    console.log("inside initialize /////");
    await super.initialize(app);

    //Enforce compliance with wallet indexing
    if (!app.options?.chat || !Array.isArray(app.options.chat)) {
      app.options.chat = [];
    }

    if (app.BROWSER) {
      this.loadChatGroups();
    }

    //
    // create chatgroups from keychain -- friends only
    //
    let keys = await app.keychain.returnKeys();
    for (let i = 0; i < keys.length; i++) {
      if (keys[i].aes_publickey && !keys[i]?.mute) {
        this.returnOrCreateChatGroupFromMembers([keys[i].publickey], keys[i].name);
      }
    }

    //
    // create chatgroups from groups
    //
    let g = app.keychain.returnGroups();
    for (let i = 0; i < g.length; i++) {
      this.returnOrCreateChatGroupFromMembers(g[i].members, g[i].name);
    }

    //
    // if I run a chat service, create it
    //
    if (app.BROWSER == 0) {
      this.communityGroup = this.returnOrCreateChatGroupFromMembers(
        [this.publickey],
        "Saito Community Chat"
      );
      this.communityGroup.members = [this.publickey];
    }

    //Add script for emoji to work
    if (app.BROWSER) {
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
  }

  async render() {
    if (this.app.BROWSER == 1) {
      if (this.app.options.theme) {
        let theme = this.app.options.theme[this.slug];

        if (theme != null) {
          this.app.browser.switchTheme(theme);
        }
      }
    }

    if (this.main == null) {
      this.main = new ChatMain(this.app, this);
      this.header = new SaitoHeader(this.app, this);
      this.addComponent(this.header);
      this.addComponent(this.main);
    }

    if (this.chat_manager == null) {
      console.log("Render");
      this.chat_manager = new ChatManager(this.app, this);
      this.addComponent(this.chat_manager);
    }
    this.chat_manager.container = ".saito-sidebar.left";
    this.chat_manager.chat_popup_container = ".saito-main";
    this.chat_manager.render_manager_to_screen = 1;
    this.chat_manager.render_popups_to_screen = 0;

    console.log("i am going to render it //////");

    await super.render();
  }

  async onPeerServiceUp(app, peer, service = {}) {
    let chat_self = this;

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
              created_later_than: group.last_update
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

      console.log("peeeeeeeer //////////");
      console.log(peer);

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

        let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();

        newtx.msg = {
          request: "chat history",
          group_id: this.communityGroup.id,
          ts: this.communityGroup.last_update
        };

        await newtx.sign();

        this.app.network.sendTransactionWithCallback(newtx, (txs) => {
          this.loading--;
          if (this.debug) {
            console.log("chat history callback: " + txs.length);
          }
          // These are no longer proper transactions!!!!

          if (this.communityGroup.txs.length > 0) {
            let most_recent_ts = this.communityGroup.txs[this.communityGroup.txs.length - 1].ts;
            for (let i = 0; i < txs.length; i++) {
              if (txs[i].ts > most_recent_ts) {
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
            }
            this.app.connection.emit("chat-popup-render-request");
          }
        });
      }
    }
  }

  returnServices() {
    let services = [];
    // servers with chat service run plaintext community chat groups
    if (this.app.BROWSER == 0) {
      services.push(new PeerService(null, "chat", "Saito Community Chat"));
    }
    return services;
  }

  async respondTo(type, obj = null) {
    let chat_self = this;

    switch (type) {
      case "chat-manager":
        if (this.chat_manager == null) {
          //console.log("Respond to");
          this.chat_manager = new ChatManager(this.app, this);
        }
        return this.chat_manager;
      case "saito-header":
        //TODO:
        //Since the left-sidebar chat-manager disappears at screens less than 1200px wide
        //We need another way to display/open it...
        if (this.app.browser.isMobileBrowser() || (this.app.BROWSER && window.innerWidth < 600)) {
          chat_self.chat_manager.render_popups_to_screen = 0;
          if (this.chat_manager_overlay == null) {
            this.chat_manager_overlay = new ChatManagerOverlay(this.app, this);
          }
          return [
            {
              text: "Chat",
              icon: "fas fa-comments",
              callback: function(app, id) {
                console.log("Callback for saito-header chat");
                chat_self.chat_manager_overlay.render();
              }
            }
          ];
        } else if (!chat_self.browser_active) {
          return [
            {
              text: "Chat",
              icon: "fas fa-comments",
              callback: function(app, id) {
                window.location = "/chat";
              }
            }
          ];
        }
        return null;
      case "user-menu":
        if (obj?.publickey) {
          if (
            chat_self.app.keychain.alreadyHaveSharedSecret(obj.publickey) &&
            obj.publickey !== chat_self.publickey
          ) {
            return {
              text: "Chat",
              icon: "far fa-comment-dots",
              callback: function(app, publickey) {
                if (chat_self.chat_manager == null) {
                  chat_self.chat_manager = new ChatManager(chat_self.app, chat_self);
                }

                chat_self.chat_manager.render_popups_to_screen = 1;
                chat_self.app.connection.emit("open-chat-with", { key: publickey });
              }
            };
          }
        }

        return null;

      case "saito-profile-menu":
        if (obj?.publickey) {
          if (
            chat_self.app.keychain.hasPublicKey(obj.publickey) &&
            obj.publickey !== chat_self.publickey
          ) {
            return {
              text: "Chat",
              icon: "far fa-comment-dots",
              callback: function(app, publickey) {
                if (chat_self.chat_manager == null) {
                  chat_self.chat_manager = new ChatManager(chat_self.app, chat_self);
                }

                chat_self.chat_manager.render_popups_to_screen = 1;
                chat_self.app.connection.emit("open-chat-with", { key: publickey });
              }
            };
          }
        }

        return null;
      default:
        return await super.respondTo(type);
    }
  }

  //
  // ---------- on chain messages ------------------------
  // ONLY processed if I am in the to/from of the transaction
  // so I will process messages I send to community, but not other peoples
  // it is mostly just a legacy safety catch for direct messaging
  //
  async onConfirmation(blk, tx, conf, app) {
    if (conf == 0) {
      await tx.decryptMessage(app);

      let txmsg = tx.returnMessage();

      if (this.debug) {
        console.log("Chat onConfirmation: " + txmsg.request);
      }

      if (txmsg.request == "chat message") {
        await this.receiveChatTransaction(app, tx);
      }
      if (txmsg.request == "chat group") {
        this.receiveCreateGroupTransaction(app, tx);
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
      return;
    }

    await tx.decryptMessage(app); //In case forwarding private messages
    let txmsg = tx.returnMessage();

    if (!txmsg.request) {
      return;
    }

    if (this.debug) {
      console.log("Chat handlePeerTransaction: " + txmsg.request);
    }

    if (txmsg.request === "chat history") {
      //console.log(JSON.parse(JSON.stringify(txmsg)));

      let group = this.returnGroup(txmsg?.group_id);

      if (!group) {
        return;
      }

      //Just process the most recent 50 (if event that any)
      //Without altering the array!
      //mycallback(group.txs.slice(-50));

      if (mycallback) {
        mycallback(group.txs.filter((t) => t.ts > txmsg.ts));
      }
    }

    if (txmsg.request === "chat message") {
      await this.receiveChatTransaction(app, tx);

      //
      // notify sender if requested
      //
      if (mycallback) {
        mycallback({ payload: "success", error: {} });
      }
    } else if (txmsg.request == "chat group") {
      console.log("HPT create group");
      console.log(tx);
      this.receiveCreateGroupTransaction(app, tx);
    } else if (txmsg.request === "chat message broadcast") {
      /*
       * This whole block is duplicating the functional logic of the Relay module....
       */

      let inner_tx = new Transaction(undefined, txmsg.data);
      await inner_tx.sign();

      let inner_txmsg = inner_tx.returnMessage();

      //
      // if chat message broadcast is received - we are being asked to broadcast this
      // to a peer if the inner_tx is addressed to one of our peers.
      //
      if (inner_tx.to.length > 0) {
        if (inner_tx.to[0].publicKey != this.publickey) {
          if (app.BROWSER == 0) {
            app.network.peers.forEach((p) => {
              if (p.peer.publicKey === inner_tx.to[0].publicKey) {
                p.sendTransactionWithCallback(inner_tx, () => {
                });
              }
              return;
            });
            return;
          }
        } else {
          //
          // broadcast to me, so send to all non-this-peers
          //
          if (app.BROWSER == 0) {
            app.network.peers.forEach((p) => {
              if (p.peer.publicKey !== peer.peer.publicKey) {
                p.sendTransactionWithCallback(inner_tx, () => {
                });
              }
            });
          }
        }
      }

      //
      // notify sender if requested
      //
      if (mycallback) {
        mycallback({ payload: "success", error: {} });
      }
    }
  }

  async sendCreateGroupTransaction(group) {
    let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();

    if (newtx == null) {
      return;
    }

    for (let i = 0; i < group.members.length; i++) {
      if (group.members[i] !== this.publickey) {
        newtx.to.push(new saito.default.slip(group.members[i]));
      }
    }

    newtx.msg = {
      module: "Chat",
      request: "chat group",
      group_id: group.id,
      group_name: group.name,
      timestamp: new Date().getTime()
    };

    await newtx.sign();

    await this.sendChatTransaction(this.app, newtx);
  }

  receiveCreateGroupTransaction(app, tx) {
    if (tx.isTo(this.publickey)) {
      let txmsg = tx.returnMessage();

      let group = this.returnGroup(txmsg.group_id);

      if (group) {
        group.name = txmsg.group_name;
      } else {
        let members = [];
        for (let x = 0; x < tx.to.length; x++) {
          if (!members.includes(tx.to[x].publicKey)) {
            members.push(tx.to[x].publicKey);
          }
        }

        console.log(JSON.stringify(members));

        group = this.returnOrCreateChatGroupFromMembers(members, txmsg.group_name);
      }

      this.saveChatGroup(group);
      this.app.connection.emit("chat-manager-render-request");
    }
  }

  /**
   *
   * Encrypt and send your chat message
   * We send messages on chain to their target and to the chat-services node via Relay
   *
   */
  async sendChatTransaction(app, tx) {
    //
    // won't exist if encrypted
    //
    if (tx.msg.message) {
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

      app.network.propagateTransaction(tx);
      app.connection.emit("relay-send-message", {
        recipient,
        request: "chat message broadcast",
        data: tx
      });
    } else {
      salert("Connection to chat server lost");
    }
  }

  async createChatTransaction(group_id, msg = "") {
    let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();

    console.log("new chat tx");
    console.log(newtx);

    if (newtx == null) {
      return;
    }

    let members = this.returnMembers(group_id);

    for (let i = 0; i < members.length; i++) {
      if (members[i] !== this.publickey) {
        let slip = new Slip();
        slip.publicKey = members[i];
        slip.amount = 0;
        newtx.addToSlip(slip);
      }
    }

    if (msg.substring(0, 4) == "<img") {
      if (this.inTransitImageMsgSig) {
        salert("Image already being sent");
        return;
      }
      this.inTransitImageMsgSig = newtx.signature;
    }

    newtx.msg = {
      module: "Chat",
      request: "chat message",
      group_id: group_id,
      message: msg,
      timestamp: new Date().getTime()
    };

    //
    // swap first two addresses so if private chat we will encrypt with proper shared-secret
    //
    if (newtx.to.length == 2) {
      let x = newtx.to[0];
      newtx.to[0] = newtx.to[1];
      newtx.to[1] = x;
    }

    if (members.length == 2) {
      await this.app.wallet.signAndEncryptTransaction(newtx);
    } else {
      await newtx.sign();
    }
    return newtx;
  }

  /**
   * Everyone receives the chat message (via the Relay)
   * So we make sure here it is actually for us (otherwise will be encrypted gobbledygook)
   */
  async receiveChatTransaction(app, tx) {
    console.log("receiveChatTransaction ///");
    console.log(tx);

    if (this.inTransitImageMsgSig == tx.signature) {
      this.inTransitImageMsgSig = null;
    }

    let txmsg = "";

    try {
      await tx.decryptMessage(app);
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
    //if (tx.from[0].publicKey == this.publickey) {
    //    if (app.keychain.hasSharedSecret(tx.to[0].publicKey)) {
    //    }
    //}

    //
    // save transaction if private chat
    //
    if (this.app.BROWSER) {
      if (txmsg.group_id !== this.communityGroup?.id) {
        for (let i = 0; i < tx.from.length; i++) {
          if (tx.from[i].publicKey == this.publickey) {
            console.log("Save Chat TX");
            await this.app.storage.saveTransaction(tx, { field3: txmsg.group_id });
            break;
          }
        }
      }
    }

    let group = this.returnGroup(txmsg.group_id);

    if (!group) {
      if (!tx.isTo(this.publickey)) {
        if (this.debug) {
          console.log("Chat message not for me");
        }
        return;
      } else {
        //
        // no match on groups, but direct message to me
        //

        let members = [];
        for (let x = 0; x < tx.to.length; x++) {
          if (!members.includes(tx.to[x].publicKey)) {
            members.push(tx.to[x].publicKey);
          }
        }

        group = this.returnOrCreateChatGroupFromMembers(members);

        if (this.debug) {
          console.log(
            "creating new chat group from direct message:",
            JSON.parse(JSON.stringify(group))
          );
        }
      }
    }

    //Have we already inserted this message into the chat?
    for (let z = 0; z < group.txs.length; z++) {
      if (group.txs[z].sig === tx.signature) {
        if (this.debug) {
          console.log("Duplicate received message");
        }
        return;
      }
    }

    // console.log("adding tx to group /////");
    // console.log(tx);

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
            if (z > 0) {
              msg += "<br>";
            }

            console.log("block ////");
            console.log(block[z]);

            sender = block[z].from[0];
            if (block[z].msg.indexOf("<img") != 0) {
              msg += this.app.browser.sanitize(block[z].msg);
            } else {
              msg += block[z].msg.substring(0, block[z].msg.indexOf(">") + 1);
            }
            ts = ts || block[z].ts;
          }

          //Use FA 5 so compatible in games (until we upgrade everything to FA6)
          const replyButton = `<div data-id="${group_id}" class="saito-userline-reply">reply <i class="fas fa-reply"></i></div>`;
          html += `${SaitoUserTemplate({
            app: this.app,
            publickey: sender,
            notice: msg,
            fourthelem:
              `<div class="saito-chat-line-controls"><span class="saito-chat-line-timestamp">` +
              this.app.browser.returnTime(ts) +
              `</span>${replyButton}</div>`
          })}`;
        }
      }
    }

    group.unread = 0;

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

    console.log("group //////");
    console.log(group);

    for (let minimized_tx of group?.txs) {
      //Same Sender -- keep building block
      let next = new Date(minimized_tx.ts);

      if (
        minimized_tx.from.includes(last_message_sender) &&
        minimized_tx.ts - last_message_ts < 300000 &&
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
      last_message_ts = minimized_tx.ts;
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

    //Limit live memory
    while (group.txs.length > 200) {
      group.txs.shift();
    }

    let content = tx.msg.message;
    if (!content) {
      console.warn("Not a chat message?");
      return;
    }
    let new_message = {
      sig: tx.signature,
      ts: tx.timestamp,
      from: [],
      msg: content
    };

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
      if (tx.ts < group.txs[i].ts) {
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

    group.last_update = tx.ts;

    if (this.debug) {
      console.log(`new msg: ${group.unread} unread`);
      console.log(JSON.parse(JSON.stringify(new_message)));
    }

    if (group.name !== this.communityGroupName && !new_message.from.includes(this.publickey)) {
      this.startTabNotification();
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
    //So David + Richard == Richard + David
    members.sort();

    return this.app.crypto.hash(`${members.join("_")}`);
  }

  //
  // if we already have a group with these members,
  // returnOrCreateChatGroupFromMembers will find and return it, otherwise
  // it makes a new group
  //
  returnOrCreateChatGroupFromMembers(members = null, name = null) {
    if (!members) {
      return null;
    }

    let id;

    //This might keep persistence across server resets
    if (name === this.communityGroupName) {
      id = this.app.crypto.hash(this.communityGroupName);
    } else {
      //Make sure that I am part of the chat group
      if (!members.includes(this.publickey)) {
        members.push(this.publickey);
      }
      id = this.createGroupIdFromMembers(members);
    }

    for (let i = 0; i < this.groups.length; i++) {
      if (this.groups[i].id == id) {
        return this.groups[i];
      }
    }

    if (name == null) {
      name = "";
      for (let i = 0; i < members.length; i++) {
        if (members[i] != this.publickey) {
          name += members[i] + ", ";
        }
      }
      if (!name) {
        name = "me";
      } else {
        name = name.substring(0, name.length - 2);
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
      last_update: 0
    };

    //Prepend the community chat
    if (name === this.communityGroupName) {
      this.groups.unshift(newGroup);
    } else {
      this.groups.push(newGroup);
    }

    //Save group in app.options
    if (!this.app.options.chat.includes(id)) {
      this.app.options.chat.push(id);
      this.app.storage.saveOptions();
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

  returnGroupByMemberPublickey(publickey) {
    for (let i = 0; i < this.groups.length; i++) {
      if (this.groups[i].members.includes(publickey)) {
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
      if (this.app.options.peers.length > 0) {
        if (this.groups[i].name === name) {
          return this.groups[i];
        }
      }
    }
    return this.groups[0];
  }

  returnCommunityChat() {
    for (let i = 0; i < this.groups.length; i++) {
      if (this.app.options.peers.length > 0) {
        if (this.groups[i].name === this.communityGroupName) {
          return this.groups[i];
        }
      }
    }
    return this.groups[0];
  }

  ///////////////////
  // LOCAL STORAGE //
  ///////////////////
  loadChatGroups() {
    if (!this.app.BROWSER) {
      return;
    }

    let chat_self = this;
    //console.log("Reading local DB");
    for (let g_id of this.app.options.chat) {
      //console.log("Fetch", g_id);
      localforage.getItem(`chat_${g_id}`, function(error, value) {
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

          chat_self.app.connection.emit("chat-manager-render-request");
          //console.log(value);
        }
      });
    }
  }

  saveChatGroup(group) {
    if (!this.app.BROWSER) {
      return;
    }
    let chat_self = this;

    let online_status = group.online;

    let new_group = Object.assign(group, { online: false });

    localforage.setItem(`chat_${group.id}`, new_group).then(function() {
      if (chat_self.debug) {
        console.log("Saved chat history for " + new_group.id);
        console.log(JSON.parse(JSON.stringify(new_group)));
      }
    });
    group.online = online_status;
  }

  deleteChatGroup(group) {
    let key_to_update = "";
    for (let i = 0; i < this.groups.length; i++) {
      if (this.groups[i].id === group.id) {
        if (this.groups[i].members.length == 2) {
          for (let member of this.groups[i].members) {
            if (member !== this.publickey) {
              key_to_update = member;
            }
          }
        }

        this.groups.splice(i, 1);
        break;
      }
    }

    for (let i = 0; i < this.app.options.chat.length; i++) {
      if (this.app.options.chat[i] === group.id) {
        this.app.options.chat.splice(i, 1);
        break;
      }
    }

    this.app.storage.saveOptions();

    if (key_to_update) {
      this.app.keychain.addKey(key_to_update, { mute: 1 });
    }

    localforage.removeItem(`chat_${group.id}`);

    this.app.connection.emit("chat-manager-render-request");
  }

  /****************************

   DO NOT DELETE

   These are working bits of code that we need to implement in storage/Archive later

   *****************************/

  async loadChatTxs() {
    /*
       this.db_connection = new JsStore.Connection(new Worker("/saito/lib/jsstore/jsstore.worker.js"));

        let tbl = {
            name: "chat_history",
            columns: {
                id: {primaryKey: true, autoIncrement: true},
                group_id: {notNull: true, dataType: "string"},
                transaction: {notNull: true, dataType: "string", enableSearch: false},
            },
        };

        let db = {
            name: "chat_db",
            tables: [tbl],
        };

        var isDbCreated = await this.db_connection.initDb(db);


          if (isDbCreated) {
            console.log('Db Created & connection is opened');
          }
          else {
            console.log('Connection is opened');
          }

        let results = await this.db_connection.select({
            from: "chat_history",
        });

        results.forEach((item) => {

            let group = this.returnGroup(item.group_id);

            if (group){
                console.log(item);
                let newtx = new saito.default.transaction();
                newtx.deserialize_from_web(this.app, item.transaction);
                newtx.decryptMessage(this.app);
                this.addTransactionToGroup(group, newtx);
            }
        });
        //db_connection.terminate();
        this.groups.forEach((group) => {
            group.unread = 0;
        });

        this.app.connection.emit("chat-manager-render-request");
        */
  }

  async saveChatTx(tx, group_id) {
    /*datas = {
            group_id,
            transaction: tx.serialize_to_web(this.app),
        };

        try{

            let inserted = await this.db_connection.insert({
                into: "chat_history",
                values: [datas],
                ignore: true,
            });

            if (inserted > 0) {
                console.log("Insert Successful");
            }

        }catch(err){

        }
        */
  }

  onWalletReset(nuke) {
    console.log("Wallet reset");

    if (nuke) {
      for (let i = 0; i < this.groups.length; i++) {
        localforage.removeItem(`chat_${this.groups[i].id}`);
      }
    }

    /*this.db_connection.dropDb().then(function() {
            console.log('Db deleted successfully');
            window.location.reload();
        }).catch(function(error) {
            console.log(error);
        });;
        */
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
