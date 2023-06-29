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
const localforage = require("localforage");

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

    this.app.connection.on("encrypt-key-exchange-confirm", (data) => {
      this.returnOrCreateChatGroupFromMembers(data?.members);
      this.app.connection.emit("chat-manager-render-request");
    });

    this.postScripts = ["/saito/lib/emoji-picker/emoji-picker.js"];
  }

  async initialize(app) {
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
      if (keys[i].aes_publickey) {
        this.returnOrCreateChatGroupFromMembers(
          [keys[i].publickey, app.wallet.publicKey],
          keys[i].name
        );
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
        [this.publicKey],
        "Saito Community Chat"
      );
      this.communityGroup.members = [this.publicKey];
    }

    //Add script for emoji to work
    if (app.BROWSER) {
      this.attachPostScripts();
    }
  }

  async onPeerServiceUp(app, peer, service = {}) {
    let chat_self = this;

    console.log("peer service up", peer, service);

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
                  let tx = new saito.default.transaction();
                  tx.deserialize_from_web(app, temp.tx);
                  tx.decryptMessage(chat_self.app);
                  // chat_self.addTransactionToGroup(group, tx);
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

  returnServices() {
    let services = [];
    // servers with chat service run plaintext community chat groups
    if (this.app.BROWSER == 0) {
      services.push(new PeerService(null, "chat", "Saito Community Chat"));
    }
    return services;
  }

  respondTo(type, obj = null) {
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
        if (this.app.browser.isMobileBrowser() || (this.app.BROWSER && window.innerWidth < 600)) {
          return [
            {
              text: "Chat",
              icon: "fas fa-comments",
              callback: function (app, id) {
                let cmo = chat_self.respondTo("chat-manager-overlay");
                cmo.render();
              },
            },
          ];
        }
        return null;
      case "user-menu":
        if (obj?.publickey) {
          if (
            chat_self.app.keychain.hasPublicKey(obj.publickey) &&
            obj.publickey !== chat_self.app.wallet.publicKey
          ) {
            return {
              text: "Chat",
              icon: "far fa-comment-dots",
              callback: function (app, publickey) {
                if (chat_self.chat_manager == null) {
                  chat_self.chat_manager = new ChatManager(chat_self.app, chat_self);
                }

                chat_self.chat_manager.render_popups_to_screen = 1;
                chat_self.app.connection.emit("open-chat-with", { key: publickey });
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
        console.log("Chat onConfirmation: " + txmsg.request);
      }

      if (txmsg.request == "chat message") {
        await this.receiveChatTransaction(this.app, tx);
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

    // console.log("transaction message for handling peer ", this.publicKey);

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
      this.receiveChatTransaction(app, tx);

      //
      // notify sender if requested
      //
      if (mycallback) {
        mycallback({ payload: "success", error: {} });
      }
    } else if (txmsg.request === "chat message broadcast") {
      let inner_tx = new Transaction(undefined, txmsg.data);
      await inner_tx.sign();

      let inner_txmsg = inner_tx.returnMessage();

      //
      // if chat message broadcast is received - we are being asked to broadcast this
      // to a peer if the inner_tx is addressed to one of our peers.
      //

      if (inner_tx.to.length > 0) {
        if (inner_tx.to[0].publicKey != this.publicKey) {
          if (app.BROWSER == 0) {
            let peers = await app.network.getPeers();
            peers.forEach((p) => {
              if (p.instance.public_key !== inner_tx.to[0].publicKey) {
                app.connection.emit("relay-send-message", {
                  recipient: p.instance.public_key,
                  request: "chat message",
                  data: inner_tx.msg,
                });
                // p.sendTransactionWithCallback();
              }
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
  async sendChatTransaction(app, tx, data) {
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
      let recipient = peers[0].publickey;
      for (let i = 0; i < peers.length; i++) {
        if (peers[i].hasService("chat")) {
          recipient = peers[i].publicKey;
          break;
        }
      }

      // app.network.propagateTransaction(tx);
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

    if (newtx == null) {
      return;
    }

    // let slip = new Slip();
    // slip.publicKey = this.publicKey;
    // slip.amount = 0;
    // newtx.addToSlip(slip);

    let members = this.returnMembers(group_id);

    for (let i = 0; i < members.length; i++) {
      if (members[i] !== this.app.wallet.publicKey) {
        let slip = new Slip();
        slip.publicKey = members[i];
        slip.amount = 0;
        newtx.addToSlip(slip);
      }
    }

    //
    // swap first two addresses so if private chat we will encrypt with proper shared-secret
    //
    if (newtx.to.length > 1) {
      // TODO : this assignment won't work with WASM API
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
      await newtx.sign();
    } else {
      await newtx.sign();
    }
    return [newtx, newtx.msg];
  }

  /**
   * Everyone receives the chat message (via the Relay)
   * So we make sure here it is actually for us (otherwise will be encrypted gobbledygook)
   */
  async receiveChatTransaction(app, tx) {
    if (this.inTransitImageMsgSig == tx.signature) {
      this.inTransitImageMsgSig = null;
    }

    let txmsg = "";

    console.log(tx, txmsg, "received chat transaction");

    try {
      tx.decryptMessage(app);
      txmsg = await tx.returnMessage();
      if (txmsg.data) {
        txmsg = txmsg.data;
      }
    } catch (err) {
      console.log("ERROR: " + JSON.stringify(err));
    }

    if (this.debug) {
      console.log(JSON.parse(JSON.stringify(tx)));
      console.log(JSON.parse(JSON.stringify(txmsg)));
    }

    //
    // if to someone else and encrypted
    // (i.e. I am sending an encrypted message and not waiting for relay)
    //
    //if (tx.from[0].add == app.wallet.publicKey) {
    //    if (app.keychain.hasSharedSecret(tx.to[0].add)) {
    //    }
    //}

    //
    // save transaction if private chat
    //
    if (this.app.BROWSER) {
      if (txmsg.group_id !== this.communityGroup?.id) {
        for (let i = 0; i < tx.to.length; i++) {
          if (tx.to[i].publicKey == this.publicKey) {
            // if (this.debug) {
            console.log("Should save TX in Archive or locally");
            // }
            await this.app.storage.saveTransaction(tx, txmsg.group_id);
            await this.saveChatTx(tx, txmsg.group_id);
            break;
          }
        }
      }
    }

    let group = this.returnGroup(txmsg.group_id);

    if (!Array.isArray(group.txs)) {
      group.txs = group.txs.msg;
    }

    if (!group) {
      if (!tx.isTo(this.publicKey)) {
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
      if (group.txs[z].signature === tx.signature) {
        // if (this.debug) {
        console.log("Duplicate received message");
        // }
        return;
      }
    }
    this.addTransactionToGroup(group, tx, txmsg);
    app.connection.emit("chat-popup-render-request", group);
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
      console.log("message block ", block, group);
      let ts = 0;
      if (block.length > 0) {
        let sender = "";
        let msg = "";
        for (let z = 0; z < block.length; z++) {
          if (z > 0) {
            msg += "<br>";
          }
          sender = block[z].from[0];
          if (block[z].msg.indexOf("<img") != 0) {
            msg += this.app.browser.sanitize(block[z].msg);
          } else {
            msg += block[z].msg.substring(0, block[z].msg.indexOf(">") + 1);
          }
          ts = ts || block[z].ts;
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

    group.unread = 0;

    return html;
  }

  createMessageBlocks(group) {
    let blocks = [];
    let block = [];
    let last_message_sender = "";

    for (let minimized_tx of group?.txs) {
      //First transaction -- start first block
      if (last_message_sender == "") {
        block.push(minimized_tx);
      } else {
        //Same Sender -- keep building block
        if (minimized_tx.from.includes(last_message_sender)) {
          block.push(minimized_tx);
        } else {
          //Start new block
          blocks.push(block);
          block = [];
          block.push(minimized_tx);
        }
      }
      last_message_sender = minimized_tx.from[0];
    }

    blocks.push(block);
    return blocks;
  }

  //
  // Since we were always testing the timestamp its a good thing we don't manipulate it
  //
  addTransactionToGroup(group, tx, txmsg) {
    if (this.debug) {
      console.log("Adding Chat TX to group: ", tx);
    }

    //Limit live memory
    while (group.txs.length > 200) {
      group.txs.shift();
    }

    let content = txmsg.message;
    if (!content) {
      console.warn("Not a chat message?");
      return;
    }
    let new_message = {
      sig: tx.signature,
      ts: tx.timestamp,
      from: [],
      msg: content,
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
      if (tx.timestamp < group.txs[i].ts) {
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

    if (this.debug) {
      console.log(`new msg: ${group.unread} unread`);
      console.log(JSON.parse(JSON.stringify(new_message)));
    }

    //Save to IndexedDB Here
    // if (this.loading <= 0) {
    this.saveChatGroup(group);
    // } else {
    //   console.warn(`Not saving because in loading mode (${this.loading})`);
    // }
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

    if (ae.className == "chat-input") {
      return 1;
    }

    if (document.querySelector("emoji-picker")) {
      return 1;
    }

    return 0;
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
      localforage.getItem(`chat_${g_id}`, function (error, value) {
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
    localforage.setItem(`chat_${group.id}`, group).then(function () {
      // if (chat_self.debug) {
      console.log("Saved chat history for " + group.id);
      console.log(JSON.parse(JSON.stringify(group)));
      // }
    });
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

  onWalletReset() {
    console.log("Wallet reset");
    /*this.db_connection.dropDb().then(function() {
            console.log('Db deleted successfully');
            window.location.reload();
        }).catch(function(error) {
            console.log(error);
        });;
        */
  }
}

module.exports = Chat;
