const SaitoUserTemplate = require("./../../lib/saito/ui/saito-user/saito-user.template.js");
const saito = require("../../lib/saito/saito");
const ModTemplate = require("../../lib/templates/modtemplate");
const ChatManager = require("./lib/chat-manager/main");
const ChatManagerOverlay = require("./lib/overlays/chat-manager");
const ChatPopup = require("./lib/chat-manager/popup");
const JSON = require("json-bigint");
const PeerService = require("saito-js/lib/peer_service").default;
const Slip = require("../../lib/saito/slip").default;
const Transaction = require("../../lib/saito/transaction").default;

class Chat extends ModTemplate {
  constructor(app) {
    super(app);

    this.app = app;

    this.name = "Chat";

    this.description = "Saito instant-messaging client";

    this.groups = [];

    this.inTransitImageMsgSig = null;

    this.added_identifiers_post_load = 0;

    this.communityGroup = null;
    this.communityGroupName = "Saito Community Chat";
    this.communityGroupHash = "";
    this.communityGroupMessages = [];

    this.debug = false;

    this.mute = false;

    this.chat_manager = null;

    this.chat_manager_overlay = null;
    this.publicKey = this.app.wallet.publicKey;

    //    app.connection.on("encrypt-key-exchange-confirm", (data) => {
    //   this.createChatGroup(data?.members);
    //    app.connection.emit("chat-manager-render-request");
    // });

    this.postScripts = ["/saito/lib/emoji-picker/emoji-picker.js"];

    return;
  }

  async onPeerServiceUp(app, peer, service = {}) {
    let chat_self = this;

    //
    // load private chat
    //

    console.log("chat peer service up", service.service);
    if (service.service === "archive") {
      if (this.debug) {
        console.log("Chat: onPeerServiceUp", service.service);
      }

      this.loading = this.groups.length;

      for (let group of this.groups) {
        //Let's not hit the Archive for community chat since that is seperately queried on service.service == chat
        if (group.name !== this.communityGroupName) {
          // Mods should not be directly querying the archive module (or should they)
          // But I need a finer grained query than the app.storage API currently supports
          // TODO FIX THIS

          let sql = `SELECT tx
                     FROM txs
                     WHERE type = "${group.id}"
                       AND ts > ${group.last_update}
                     ORDER BY ts DESC LIMIT 100`;

          this.sendPeerDatabaseRequestWithFilter(
            "Archive",
            sql,

            (res) => {
              chat_self.loading--;

              if (res?.rows) {
                if (chat_self.debug) {
                  console.log(group.id + " Archive TXs:" + res.rows.length);
                }

                while (res.rows.length > 0) {
                  //Process the chat transaction like a new message
                  let temp = res.rows.pop();
                  let tx = new Transaction();
                  tx.deserialize_from_web(app, temp.tx);
                  tx.decryptMessage(chat_self.app);
                  chat_self.addTransactionToGroup(group, tx);
                }
              }
            },
            (p) => {
              if (p == peer) {
                return 1;
              }
              return 0;
            }
          );

          /*
              this.app.storage.loadTransactions(group_id, 25, function (txs) {
                  if (chat_self.debug){ console.log("Chat PSuP Archive callback:" + txs.length); }

                  try {
                      //Note loadTransactions returns them in reverse order....
                      //Now addTransactionToGroup will sort them, but this will be more efficient
                      while (txs.length > 0){
                          let tx = txs.pop();
                          tx.decryptMessage(chat_self.app);
                          chat_self.addTransactionToGroup(group, tx);
                      }

                  } catch (err) {
                      console.log("error loading chats...: " + err);
                  }
              });
              */
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
        [peer.instance.public_key],
        this.communityGroupName
      );
      this.communityGroup.members = [peer.instance.public_key];

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
          ts: this.communityGroup.last_update,
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

  /**
   *
   * @param app
   * @param peer {Peer | null}
   * @returns {Promise<void>}
   */
  async onPeerHandshakeComplete(app, peer) {
    if (!app.BROWSER) {
      return;
    }
    console.log(peer, "peerss");
    if (peer.instance.is_main_peer()) {
      // console.log("peersss ", peer);
      this.communityGroup = this.createChatGroup([peer.publicKey()], this.communityGroupName);
      if (this.communityGroup) {
        this.communityGroupHash = this.communityGroup.id;
      }
      await this.loadChats();
      let sql;
      for (let i = 0; i < this.groups.length; i++) {
        sql = `SELECT id, tx
               FROM txs
               WHERE publickey = "${this.groups[i].id}"
               ORDER BY ts DESC LIMIT 100`;
        await this.sendPeerDatabaseRequestWithFilter(
          "Archive",
          sql,

          async (res) => {
            if (res?.rows) {
              while (res.rows.length > 0) {
                //Process the chat transaction like a new message
                let tx = new Transaction(undefined, JSON.parse(res.rows.pop().tx));
                await tx.decryptMessage(app);
                await this.receiveChatTransaction(app, tx);
              }
            }
          },

          (p) => {
            if (p.instance.public_key === peer.instance.public_key) {
              return 1;
            }
          }
        );
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

  async respondTo(type, obj) {
    let chat_self = this;

    switch (type) {
      case "chat-manager":
        if (this.chat_manager == null) {
          this.chat_manager = new ChatManager(this.app, this);
        }
        return this.chat_manager;
      case "chat-manager-overlay":
        if (this.chat_manager_overlay == null) {
          this.chat_manager_overlay = new ChatManagerOverlay(this.app, this);
        }
        return this.chat_manager_overlay;
      case "saito-header":
        //TODO:
        //Since the left-sidebar chat-manager disappears at screens less than 1200px wide
        //We need another way to display/open it...
        if (
          this.app.browser.isMobileBrowser() /*|| (this.app.BROWSER && window.innerWidth < 1200)*/
        ) {
          return [
            {
              text: "Chat",
              icon: "fas fa-comments",
              callback: async function (app, id) {
                let cmo = await chat_self.respondTo("chat-manager-overlay");
                await cmo.render();
              },
            },
          ];
        }
        return null;
      case "user-menu":
        if (obj !== undefined && obj["publickey"] !== undefined) {
          let publickey = obj.publickey;
          let key_exists = chat_self.app.keychain.hasPublicKey(publickey);

          if (!key_exists) return null;
        }

        return {
          text: "Chat",
          icon: "far fa-comment-dots",
          callback: function (app, publickey) {
            let group = chat_self.returnGroupByMemberPublickey(publickey);

            if (chat_self.chat_manager == null) {
              chat_self.chat_manager = new ChatManager(chat_self.app, chat_self);
            }

            chat_self.chat_manager.render_manager_to_screen = 1;
            chat_self.chat_manager.render_popups_to_screen = 1;
            chat_self.app.connection.emit("chat-popup-render-request", group);
          },
        };
      default:
        return super.respondTo(type);
    }
  }

  async initialize(app) {
    //
    app.options.chat = {};
    app.storage.saveOptions();

    await super.initialize(app);

    //
    // create chatgroups from keychain -- friends only
    //
    let keys = await app.keychain.returnKeys();
    for (let i = 0; i < keys.length; i++) {
      if (keys[i].aes_publickey) {
        this.createChatGroup([keys[i].publickey, this.publicKey], keys[i].name);
      }
    }

    //
    // create chatgroups from groups
    //
    let g = app.keychain.returnGroups();
    for (let i = 0; i < g.length; i++) {
      this.createChatGroup(g[i].members, g[i].name);
    }

    //
    // if I run a chat service, create it
    //
    if (app.BROWSER == 0) {
      let group = this.createChatGroup([this.publicKey], "Saito Community Chat");
    }

    if (app.BROWSER) {
      this.attachPostScripts();
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
      if (txmsg.request == "chat message") {
        await this.receiveChatTransaction(app, tx);
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

    tx.decryptMessage(app); //In case forwarding private messages
    let txmsg = tx.returnMessage();

    console.log(txmsg, "txmsg");
    if (!txmsg.request) {
      return;
    }

    if (txmsg.request === "chat history") {
      let group_id = txmsg.group_id;
      if (!group_id) {
        return;
      }
      let group = this.returnGroup(group_id);
      if (!group) {
        return;
      }
      let chat_msgs_to_load = group.txs;
      if (chat_msgs_to_load.length > 20) {
        chat_msgs_to_load = chat_msgs_to_load.splice(chat_msgs_to_load.length - 20);
      }

      //mycallback(group.txs);
      mycallback(chat_msgs_to_load);
    }

    if (txmsg.request === "chat message") {
      await this.receiveChatTransaction(app, tx);

      //
      // notify sender if requested
      //
      if (mycallback) {
        mycallback({ payload: "success", error: {} });
      }
    } else if (txmsg.request === "chat message broadcast") {
      console.log("chat message broadcasting", txmsg.data);
      let inner_tx = new Transaction(undefined, txmsg.data);

      let inner_txmsg = inner_tx.returnMessage();

      //
      // if chat message broadcast is received - we are being asked to broadcast this
      // to a peer if the inner_tx is addressed to one of our peers.
      //
      console.log("sending to peers ", inner_tx.to);
      if (inner_tx.to.length > 0) {
        if (inner_tx.to[0].publicKey != this.publicKey) {
          if (app.BROWSER == 0) {
            let peers = await app.network.getPeers();
            console.log("sending to peers ", peers, inner_tx.to);
            peers.forEach((p) => {
              if (p.instance.public_key != inner_tx.to[0].publicKey) {
                app.connection.emit("relay-send-message", {
                  recipient: p.instance.public_key,
                  request: "chat message",
                  data: inner_tx.toJson(),
                });
              }
              console.log("public keys , ", p.instance.public_key, this.publicKey);
              // if (p.public_key !== this.publicKey) {
              //   p.sendTransactionWithCallback(inner_tx, () => {});
              // }

              // app.connection.emit("relay-send-message", {
              //   recipient: p.instance.public_key,
              //   request: "chat message",
              //   data: inner_tx.toJson(),
              // });
            });
            return;
          }
        } else {
          //
          // broadcast to me, so send to all non-this-peers
          //
          if (app.BROWSER == 0) {
            console.log("sending tx to myself");
            let peers = await app.network.getPeers();
            peers.forEach((p) => {
              if (p.public_key !== peer.publicKey()) {
                p.sendTransactionWithCallback(inner_tx, () => {});
              }
            });
          }
        }
      }

      // MAR 14
      //if (!inner_txmsg?.group_id) { return; }

      //Chat message broadcast is the Relay to the Chat-services server
      //that handles Community chat and will forward the message as a "chat message"
      //Without relay + handlePeerTransaction, we do not receive community chat messages

      //Tell Archive to save a copy of this TX
      //app.connection.emit("archive-save-transaction", { key: inner_txmsg.group_id, type: "Chat", inner_tx });

      //
      // Forward to all my peers (but not me again) with new request & same data
      //
      // servers can forward if they get chat broadcast
      //
      // MAR 14
      //if (app.BROWSER == 0) {
      //    app.network.peers.forEach(p => {
      //        if (p.peer.publickey !== peer.peer.publickey) {
      //            p.sendTransactionWithCallback(inner_tx, () => { });
      //        }
      //    });
      //}

      //
      // notify sender if requested
      //
      if (mycallback) {
        mycallback({ payload: "success", error: {} });
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
    console.log("chat transaction", tx);
    //
    // won't exist if encrypted
    //
    // let message = tx.returnMessage();
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

  async createChatTransaction(group_id, msg = "") {
    let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();
    let slip = new Slip();
    slip.publicKey = this.publicKey;
    slip.amount = 0;
    newtx.addToSlip(slip);

    if (newtx == null) {
      return;
    }

    let members = this.returnMembers(group_id);

    for (let i = 0; i < members.length; i++) {
      if (members[i] !== this.publicKey) {
        let slip = new Slip();
        slip.publicKey = members[i];
        slip.amount = 0;
        newtx.addToSlip(slip);
        // newtx.transaction.to.push(new saito.default.slip(members[i]));
      }
    }

    //
    // swap first two addresses so if private chat we will encrypt with proper shared-secret
    //
    if (newtx.to.length > 1) {
      let x = newtx.to[0];
      newtx.to[0] = newtx.to[1];
      newtx.to[1] = x;
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
      timestamp: new Date().getTime(),
    };

    if (members.length == 2) {
      //
      // the first recipient is ourself, so the second is the one with the shared secret
      //

      let key = this.app.keychain.returnKey(newtx.to[0].publicKey);
      newtx.signAndEncrypt();
      // newtx = this.app.wallet.signAndEncryptTransaction(newtx);
    } else {
      await newtx.sign();
    }
    console.log(newtx, "new transaction");
    return newtx;
  }

  /**
   * Everyone receives the chat message (via the Relay)
   * So we make sure here it is actually for us (otherwise will be encrypted gobbledygook)
   */
  async receiveChatTransaction(app, tx) {
    console.log("receiving chat transaction");
    if (this.inTransitImageMsgSig == tx.signature) {
      this.inTransitImageMsgSig = null;
    }

    let txmsg = "";

    try {
      tx.decryptMessage(app);
      txmsg = tx.returnMessage();
    } catch (err) {
      console.log("ERROR: " + JSON.stringify(err));
    }

    //
    // if to someone else and encrypted
    // (i.e. I am sending an encrypted message and not waiting for relay)
    //
    //if (tx.transaction.from[0].publicKey == this.publicKey) {
    //    if (app.keychain.hasSharedSecret(tx.transaction.to[0].add)) {
    //    }
    //}

    //
    // save transaction if private chat
    //
    for (let i = 0; i < tx.to.length; i++) {
      if (tx.to[i].publicKey == this.publicKey) {
        await this.app.storage.saveTransaction(tx, txmsg.group_id);
        break;
      }
    }

    let group = this.returnGroup(txmsg.group_id);

    if (group) {
      //Have we already inserted this message into the chat?
      for (let z = 0; z < group.txs.length; z++) {
        if (group.txs[z].signature === tx.signature) {
          return;
        }
      }
      this.addTransactionToGroup(group, tx);

      app.connection.emit("chat-popup-render-request", group);
    } else if (tx.isTo(this.publicKey)) {
      //
      // no match on groups -- direct message to me
      //

      let members = [];
      for (let x = 0; x < tx.to.length; x++) {
        if (!members.includes(tx.to[x].publicKey)) {
          members.push(tx.to[x].publicKey);
        }
      }

      let proper_group = this.createChatGroup(members);

      this.addTransactionToGroup(proper_group, tx);

      if (this.debug) {
        console.log("emitting render request to new group: " + proper_group.id);
      }

      app.connection.emit("chat-popup-render-request", proper_group);
    } else {
      if (this.debug) {
        console.log("Chat message not for me");
      }
    }
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
      if (block.length > 0) {
        let sender = "";
        let msg = "";
        for (let z = 0; z < block.length; z++) {
          let txmsg = block[z].returnMessage();
          if (txmsg.message) {
            if (z > 0) {
              msg += "<br/>";
            }
            sender = block[z].from[0].publicKey;
            if (txmsg.message.indexOf("<img") != 0) {
              msg += this.app.browser.sanitize(txmsg.message);
            } else {
              msg += txmsg.message.substring(0, txmsg.message.indexOf(">") + 1);
            }
            ts = txmsg.timestamp;
          }
        }
        const replyButton = `<div data-id="${group_id}" class="saito-userline-reply">reply <i class="fa-solid fa-reply"></i></div>`;
        html += `${SaitoUserTemplate({
          app: this.app,
          publickey: sender,
          notice: msg,
          fourthelem:
            `<div class="saito-chat-line-controls"><span class="saito-chat-line-timestamp">` +
            this.app.browser.returnTime(ts) +
            `</span>${replyButton}</div>`,
        })}`;
      }
    }

    if (!group.unread) {
      group.unread = 0;
    }
    group.unread = 0;

    //Save to Wallet Here
    this.saveChat(group);

    return html;
  }

  createMessageBlocks(group) {
    let blocks = [];
    let block = [];
    let txs = [];
    if (group) {
      if (group.txs) {
        txs = group.txs;
      }
    }
    let last_message_sender = "";

    for (let i = 0; i < txs.length; i++) {
      //First transaction -- start first block
      if (last_message_sender == "") {
        block.push(txs[i]);
      } else {
        //Same Sender -- keep building block
        if (this.msgIsFrom(txs[i], last_message_sender)) {
          block.push(txs[i]);
        } else {
          //Start new block
          blocks.push(block);
          block = [];
          block.push(txs[i]);
        }
      }
      last_message_sender = txs[i].from[0].publicKey;
    }

    blocks.push(block);
    return blocks;
  }

  msgIsFrom(txs, publickey) {
    if (txs.from != null) {
      for (let v = 0; v < txs.from.length; v++) {
        if (txs.from[v].publicKey === publickey) {
          return true;
        }
      }
    }
    return false;
  }

  ///////////////////
  // CHAT SPECIFIC //
  ///////////////////
  //
  // if we already have a group with these members,
  // createChatGroup will find and return it, otherwise
  // it makes a new group
  //
  returnGroupIdFromMembers(members = null) {
    if (members == null) {
      return "";
    }
    return this.app.crypto.hash(`${members.join("_")}`);
  }

  createChatGroup(members = null, name = null) {
    if (!members) {
      return null;
    }

    //So the David + Richard == Richard + David
    members.sort();

    // be careful changing this, other components
    let id = this.returnGroupIdFromMembers(members);

    for (let i = 0; i < this.groups.length; i++) {
      if (this.groups[i].id == id) {
        return this.groups[i];
      }
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

    let newGroup = {
      id: id,
      members: members,
      name: name,
      txs: [],
      unread: 0,
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

  //
  // This is a function to open a chat popup, and create it if necessary
  //
  openChatBox(group_id = null) {
    alert("open chat box~");

    if (!this.app.BROWSER) {
      return;
    }

    if (!group_id || group_id == -1) {
      let community = this.returnCommunityChat();

      if (!community?.id) {
        return;
      }
      group_id = community.id;
    }

    let group = this.returnGroup(group_id);

    if (!group) {
      return;
    }

    this.app.options.auto_open_chat_box = group_id;
    this.app.storage.saveOptions();

    this.app.connection.emit("chat-popup-render-request", group.id);
  }

  //
  // Since we were always testing the timestamp its a good thing we don't manipulate it
  //
  addTransactionToGroup(group, tx) {
    while (group.txs.length > 200) {
      group.txs.shift();
    }

    for (let i = 0; i < group.txs.length; i++) {
      if (group.txs[i].signature === tx.signature) {
        return;
      }
      if (tx.timestamp < group.txs[i].timestamp) {
        let pos = Math.max(0, i - 1);
        group.txs.splice(pos, 0, tx);
        return;
      }
    }

    group.txs.push(tx);
    if (!group.unread) {
      group.unread = 0;
    }
    group.unread++;
  }

  ///////////////////
  // CHAT UTILITIES //
  ///////////////////
  createGroupIdFromMembers(members = null) {
    if (members == null) {
      return "";
    }
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

    //So David + Richard == Richard + David
    members.sort();

    // be careful changing this, other components
    let id = this.createGroupIdFromMembers(members);

    //This might keep persistence across server resets
    if (name === this.communityGroupName) {
      id = this.app.crypto.hash(this.communityGroupName);
    }

    for (let i = 0; i < this.groups.length; i++) {
      if (this.groups[i].id == id) {
        return this.groups[i];
      }
    }

    if (name == null) {
      name = "";
      for (let i = 0; i < members.length; i++) {
        if (members[i] != this.app.wallet.getPublicKey()) {
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

  //
  // Maybe needs improvement, but simple test to not rip away
  // focus from a ChatPopup if rendering a new Chatpopup
  //
  isOtherInputActive() {
    // if we are viewing an overlay, nope out
    if (document.querySelector(".saito-overlay-backdrop")?.style?.display == "block") {
      return 1;
    }

    let ae = document.activeElement;

    if (!ae) {
      return 0;
    }

    if (ae.tagName.toLowerCase() == "input" || ae.tagName.toLowerCase() == "textarea") {
      return 1;
    }

    return 0;
  }

  ///////////////////
  // LOCAL STORAGE //
  ///////////////////

  async loadChats() {
    if (!this.app.options.chat) {
      return;
    }

    for (let g of this.groups) {
      if (this.app.options.chat[g.id] && g.txs.length == 0) {
        for (let stx of this.app.options.chat[g.id]) {
          let newtx = new Transaction(undefined, stx);
          await newtx.decryptMessage(this.app);
          g.txs.push(newtx);
        }
        //this.printGroup(g);
      }
    }

    this.app.connection.emit("chat-manager-render-request");
  }

  saveChat(group) {
    if (!this.app.options.chat) {
      this.app.options.chat = {};
    }

    this.app.options.chat[group.id] = [];
    //for (let t of group.txs.slice(-100)) {
    //    this.app.options.chat[group.id].push(t.transaction);
    //}

    this.app.storage.saveOptions();
  }

  ///////////////////
  // CHAT DEBUGGING //
  ///////////////////
  //
  // I'm a lazy man who stores the popup module in the group,
  // but the popup module includes a reference to this,
  // so attempting to print (with any JSON operation) is an
  // exercise in infinite recursion, but we do sometimes want
  // to inspect the group for debugging purposes
  //
  printGroup(group) {
    const filtered = Object.keys(group)
      .filter((key) => key !== "popup")
      .reduce((obj, key) => {
        obj[key] = group[key];
        return obj;
      }, {});
    console.log(JSON.parse(JSON.stringify(filtered)));
  }
}

module.exports = Chat;
