const SaitoUserTemplate = require('./../../lib/saito/ui/templates/saito-user.template.js');
const saito = require('../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');
const ChatManager = require('./lib/chat-manager/main');
const ChatManagerOverlay = require('./lib/overlays/chat-manager');
const ChatPopup = require("./lib/chat-manager/popup");

const JSON = require('json-bigint');

class Chat extends ModTemplate {

  constructor(app) {

    super(app);

    this.name = "Chat";

    this.description = "Saito instant-messaging client";

    this.groups = [];

    this.inTransitImageMsgSig = null;

    this.added_identifiers_post_load = 0;

    this.communityGroupName = "Saito Community Chat";

    this.debug = false;

    this.mute = false;

    this.chat_manager = null;

    this.chat_manager_overlay = null;

    this.app.connection.on("encrypt-key-exchange-confirm", (data) => {
      this.createChatGroup(data?.members);
      this.app.connection.emit("chat-manager-render-request");
    });

  }


  returnServices() {

    let services = [];

    // servers with chat service run plaintext community chat groups
    if (this.app.BROWSER == 0) {
      services.push({ service: "chat", name: "Saito Community Chat" });
    }

    return services;
  }


  respondTo(type) {

    switch (type) {
      case 'chat-manager':
        if (this.chat_manager == null) {
          this.chat_manager = new ChatManager(this.app, this);
        }
        return this.chat_manager;
      case 'chat-manager-overlay':
        if (this.chat_manager_overlay == null) {
          this.chat_manager_overlay = new ChatManagerOverlay(this.app, this);
        }
        return this.chat_manager_overlay;
      default:
        return super.respondTo(type);
    }
  }


  initialize(app) {

    super.initialize(app);

    if (!app.BROWSER) {
      return;
    }

    //
    // create chatgroups from keychain -- friends only
    //
    let keys = app.keychain.returnKeys();
    for (let i = 0; i < keys.length; i++) {
      if (keys[i].aes_publickey) {
        this.createChatGroup([keys[i].publickey, app.wallet.getPublicKey()], keys[i].name);
      }
    }

    //
    // create chatgroups from groups
    //
    let g = app.keychain.returnGroups();
    for (let i = 0; i < g.length; i++) {
      this.createChatGroup(g[i].members, g[i].name);
    }

  }


  async onPeerHandshakeComplete(app, peer) {
    if (!app.BROWSER) {
      return;
    }

    //
    // create mastodon server
    //
    if (peer.isMainPeer()) {

      //
      // We wait until we establish a peer connection to create the community chat
      // Now that we have all the chat groups from our wallet + peer
      // We can load the previously messages from our local storage
      //
      this.createChatGroup([peer.peer.publickey], this.communityGroupName);

      this.app.connection.emit("chat-manager-render-request");


      this.loadChats();


      //
      //Now we send queries to the Archive to load the last N chats per group
      //this enables us to pick up anything new that we had previously not received
      //
      let sql;
      for (let i = 0; i < this.groups.length; i++) {
        // not a publickey but group_id gets archived as if it were one
        sql = `SELECT id, tx FROM txs WHERE publickey = "${this.groups[i].id}" ORDER BY ts DESC LIMIT 100`;
        this.sendPeerDatabaseRequestWithFilter(
          "Archive",
          sql,

          (res) => {
            if (res?.rows) {
              while (res.rows.length > 0) {

                //Process the chat transaction like a new message

                let tx = new saito.default.transaction(JSON.parse(res.rows.pop().tx));

                tx.decryptMessage(app);

                this.receiveChatTransaction(app, tx);
              }

              //
              // add identifiers
              //
              app.browser.addIdentifiersToDom();
            }
          },

          (p) => {
            if (p.peer.publickey === peer.peer.publickey) {
              return 1;
            }
          }
        );
      }

    }

    //
    // See if we want to auto open a chatpopup
    // we update the group_id of our default chat every time the user opens/closes a popup
    //
    if (app.BROWSER) {
      if ((!app.browser.isMobileBrowser(navigator.userAgent) && window.innerWidth > 600)) {
        let group = this.returnGroupByMemberPublickey(peer.returnPublicKey());
        if (group) {
          let active_module = app.modules.returnActiveModule();
          if (active_module.request_no_interrupts != true) {
            this.app.connection.emit('chat-popup-render-request', group);
          }
        }
      } else {
        //Under mobile use, always wait for user to open chat box
        this.mute = true;
      }
    }

  }


  //
  // ---------- on chain messages ------------------------
  // ONLY processed if I am in the to/from of the transaction
  // so I will process messages I send to community, but not other peoples
  // it is mostly just a legacy safety catch for direct messaging
  //
  onConfirmation(blk, tx, conf, app) {

    if (conf == 0) {

      tx.decryptMessage(app);

      let txmsg = tx.returnMessage();

      if (txmsg.request == "chat message") {
        this.receiveChatTransaction(app, tx);
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

    if (!txmsg.request) {
      return;
    }

    if (txmsg.request === "chat message") {

      this.receiveChatTransaction(app, tx);

      //
      // notify sender if requested
      //
      if (mycallback) {
        mycallback({ "payload": "success", "error": {} });
      }

    } else if (txmsg.request === "chat message broadcast") {

      let inner_tx = new saito.default.transaction(txmsg.data);
      let inner_txmsg = inner_tx.returnMessage();

      if (!inner_txmsg?.group_id) {
        return;
      }

      //Chat message broadcast is the Relay to the Chat-services server
      //that handles Community chat and will forward the message as a "chat message"
      //Without relay + handlePeerTransaction, we do not receive community chat messages

      //Tell Archive to save a copy of this TX
      app.connection.emit("archive-save-transaction", { key: inner_txmsg.group_id, type: "Chat", inner_tx });

      //Forward to all my peers (but not me again) with new request & same data
      //
      // servers can forward if they get chat broadcast
      //
      if (app.BROWSER == 0) {
        app.network.peers.forEach(p => {
          if (p.peer.publickey !== peer.peer.publickey) {
            p.sendTransactionWithCallback(inner_tx, () => {
            });
          }
        });
      }

      //
      // notify sender if requested
      //
      if (mycallback) {
        mycallback({ "payload": "success", "error": {} });
      }

    }

  }


  /**
   *
   * Encrypt and send your chat message
   * We send messages on chain to their target and to the chat-services node via Relay
   *
   */
  sendChatTransaction(app, tx, broadcast = 0) {

    if (tx.msg.message.substring(0, 4) == "<img") {
      if (this.inTransitImageMsgSig) {
        salert("Image already being sent");
        return;
      }
      this.inTransitImageMsgSig = tx.transaction.sig;
    }
    if (app.network.peers.length > 0) {

      let recipient = app.network.peers[0].peer.publickey;
      for (let i = 0; i < app.network.peers.length; i++) {
        if (app.network.peers[i].hasService("chat")) {
          recipient = app.network.peers[i].peer.publickey;
          break;
        }
      }

      //We want to send this info unencrypted, so save a copy first
      let group_id = tx.msg.group_id;
      tx = app.wallet.signAndEncryptTransaction(tx);
      app.network.propagateTransaction(tx);

      app.connection.emit("send-relay-message", { recipient, request: 'chat message broadcast', data: tx.transaction });

    } else {
      salert("Connection to chat server lost");
    }

  }


  createChatTransaction(group_id, msg) {

    let members = this.returnMembers(group_id);

    //
    // rearrange if needed so we are not first --- WHY IS THIS NECESSARY???
    //
    if (members[0] === this.app.wallet.getPublicKey()) {
      members.splice(0, 1);
      members.push(this.app.wallet.getPublicKey());
    }

    let newtx = this.app.wallet.createUnsignedTransaction(members[0], 0.0, 0.0);

    if (newtx == null) {
      return;
    }

    for (let i = 1; i < members.length; i++) {
      newtx.transaction.to.push(new saito.default.slip(members[i]));
    }
    newtx.msg = {
      module: "Chat",
      request: "chat message",
      group_id: group_id,
      message: msg,
      timestamp: new Date().getTime()
    };

    newtx.msg.sig = this.app.wallet.signMessage(JSON.stringify(newtx.msg));
    newtx = this.app.wallet.signTransaction(newtx);
    return newtx;

  }

  /**
   * Everyone receives the chat message (via the Relay)
   * So we make sure here it is actually for us (otherwise will be encrypted gobbledygook)
   */
  receiveChatTransaction(app, tx) {

    if (!app.BROWSER) {
      return;
    }

    if (this.inTransitImageMsgSig == tx.transaction.sig) {
      this.inTransitImageMsgSig = null;
    }

    let txmsg = tx.returnMessage();

    //
    // if to someone else and encrypted
    // (i.e. I am sending an encrypted message and not waiting for relay)
    //
    if (tx.transaction.from[0].add == app.wallet.getPublicKey()) {
      if (app.keychain.hasSharedSecret(tx.transaction.to[0].add)) {
        tx.decryptMessage(app);
        txmsg = tx.returnMessage();
      }
    }

    let group = this.returnGroup(txmsg.group_id);

    if (group) {

      //Have we already inserted this message into the chat?
      for (let z = 0; z < group.txs.length; z++) {
        if (group.txs[z].transaction.sig === tx.transaction.sig) {
          return;
        }
      }
      this.addTransactionToGroup(group, tx);

      app.connection.emit('chat-popup-render-request', group);

    } else if (tx.isTo(app.wallet.getPublicKey())) {
      //
      // no match on groups -- direct message to me
      //

      let members = [];
      for (let x = 0; x < tx.transaction.to.length; x++) {
        if (!members.includes(tx.transaction.to[x].add)) {
          members.push(tx.transaction.to[x].add);
        }
      }

      let proper_group = this.createChatGroup(members);

      this.addTransactionToGroup(proper_group, tx);

      if (this.debug) {
        console.log("emitting render request to new group: " + proper_group.id);
      }

      app.connection.emit('chat-popup-render-request', proper_group);

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

//console.log("group ID: " + group_id);

    let html = '';
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
          if (z > 0) {
            msg += '<br/>';
          }
          let txmsg = block[z].returnMessage();
          sender = block[z].transaction.from[0].add;
          msg += txmsg.message;
          ts = txmsg.timestamp;
        }
        msg = this.app.browser.sanitize(msg);
        html += `${SaitoUserTemplate(this.app, sender, msg, this.app.browser.returnTime(ts))}`;
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
      last_message_sender = txs[i].transaction.from[0].add;
    }

    blocks.push(block);
    return blocks;

  }

  msgIsFrom(txs, publickey) {
    if (txs.transaction.from != null) {
      for (let v = 0; v < txs.transaction.from.length; v++) {
        if (txs.transaction.from[v].add === publickey) {
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
  createChatGroup(members = null, name = null) {

    if (!members) {
      return null;
    }

    //So the David + Richard == Richard + David
    members.sort();

    let id = this.app.crypto.hash(`${members.join('_')}`);

    for (let i = 0; i < this.groups.length; i++) {
      if (this.groups[i].id == id) {
        return this.groups[i];
      }
    }

    if (!name) {
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

    let newGroup = {
      id: id,
      members: members,
      name: name,
      txs: [],
      unread: 0,
    }

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

    this.mute = false;

    this.app.connection.emit("chat-popup-render-request", (group.id));

  }


  //
  // Since we were always testing the timestamp its a good thing we don't manipulate it
  //
  addTransactionToGroup(group, tx) {

    for (let i = 0; i < group.txs.length; i++) {
      if (group.txs[i].transaction.sig === tx.transaction.sig) {
        return;
      }
      if (tx.transaction.ts < group.txs[i].transaction.ts) {
        let pos = Math.max(0, i - 1);
        group.txs.splice(pos, 0, tx);
        return;
      }
    }

    group.txs.push(tx);
    //We mark "new/unread" messages as we add them to the group
    //and clear them when we render them in the popup
    if (!group.unread) {
      group.unread = 0;
    }
    group.unread++;
  }


  ///////////////////
  // CHAT UTILITIES //
  ///////////////////

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


  returnChatByName(name = "") {
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

  returnDefaultChat() {
    for (let i = 0; i < this.groups.length; i++) {
      if (this.app.options.peers.length > 0) {
        if (this.groups[i].members[0] === this.app.options.peers[0].publickey) {
          return this.groups[i];
        }
      }
      if (this.app.network.peers.length > 0) {
        if (this.groups[i].members[0] === this.app.network.peers[0].peer.publickey) {
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

  loadChats() {
    if (!this.app.options.chat) {
      return;
    }

    for (let g of this.groups) {
      if (this.app.options.chat[g.id] && g.txs.length == 0) {
        for (let stx of this.app.options.chat[g.id]) {
          let newtx = new saito.default.transaction(stx);
          newtx.decryptMessage(this.app);
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
    for (let t of group.txs.slice(-100)) {
      this.app.options.chat[group.id].push(t.transaction);
    }

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
      .filter(key => key !== "popup")
      .reduce((obj, key) => {
        obj[key] = group[key];
        return obj;
      }, {});
    console.log(JSON.parse(JSON.stringify(filtered)));
  }

}


module.exports = Chat;
