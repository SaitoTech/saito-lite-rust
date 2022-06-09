const saito = require('../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');
const EmailChat = require('./lib/email-chat/email-chat');
const ChatMain = require('./lib/chat-main/chat-main');
const ChatRoom = require('./lib/chat-main/chat-room');
const SaitoHeader = require('./../../lib/saito/ui/saito-header/saito-header');
const JSON = require('json-bigint');

var marked = require('marked');
var sanitizeHtml = require('sanitize-html');
const linkifyHtml = require('markdown-linkify');

class Chat extends ModTemplate {

    constructor(app) {

        super(app);
        this.name = "Chat";
        this.description = "Saito instant-messaging client and application platform";
        this.events = ['encrypt-key-exchange-confirm'];
        this.groups = [];

        this.timeerror_tolerance = 1800000; // 30 minutes tolerance for TZ issues at chat head
        this.header = null;
        this.renderMode = "none";
        this.relay_moves_onchain_if_possible = 1;

        /* if someone closes community chat, don't pop it back open
           any navigation to another page with re-construct chat and forget this
         */
        this.mute_community_chat = 0;
        //this.max_msg_size = 1*1024*1024;
        this.max_msg_size = 1 * 300 * 1024;

        this.icon_fa = "far fa-comments";
        this.inTransitImageMsgSig = null;

        this.added_identifiers_post_load = 0;

    }



    returnServices() {
        let services = [];
        // servers with chat installed are running community chat groups
        if (this.app.BROWSER == 0) { services.push({ service: "chat" }); }
        return services;
    }


    receiveEvent(type, data) {

        if (type === "encrypt-key-exchange-confirm") {

            if (data.members === undefined) {
                return;
            }

            let newgroup = this.createChatGroup(data.members);

            this.sendEvent('chat-render-request', {});
            this.saveChat();
            this.render(this.app);
        }

    }


    respondTo(type) {
        switch (type) {
            case 'email-chat':
                return {
                    render: this.renderEmailChat,
                    attachEvents: this.attachEventsEmailChat,
                }
            case 'header-dropdown':
                return {
                    name: this.appname ? this.appname : this.name,
                    icon_fa: this.icon_fa,
                    browser_active: this.browser_active,
                    slug: this.returnSlug()
                };
            default:
                return null;
        }
    }


    //
    // email-chat -- mod should be email since refernece is not "this"
    //
    renderEmailChat(app, mod) {
        let chatmod = app.modules.returnModule("Chat");
        EmailChat.render(app, chatmod);
        EmailChat.attachEvents(app, chatmod);
    }

    attachEventsEmailChat(app, mod) {
        //let chatmod = app.modules.returnModule("Chat");
    }


    //
    // main module render
    //
    render(app, renderMode = "") {

        if (renderMode != "") {
            this.renderMode = renderMode;
        }

        if (this.renderMode == "chatroom") {
            ChatRoom.render(app, this);
            ChatRoom.attachEvents(app, this);
            return;
        }

        if (this.renderMode == "main") {
            ChatMain.render(app, this);
            ChatMain.attachEvents(app, this);
        }

        if (this.renderMode == "email") {
            EmailChat.render(app, this);
            EmailChat.attachEvents(app, this);
        }

    }


    initializeHTML(app) {

        if (this.browser_active == 1) {
            if (this.renderMode != "other") {
                this.renderMode = "main";
            }
        }

        if (this.renderMode == "main") {

            if (this.header == null) {
                this.header = new SaitoHeader(app, this);
            }
            this.header.render(app, this);
            this.header.attachEvents(app, this);

            ChatMain.render(app, this);
            ChatMain.attachEvents(app, this);
        }

    }


    initialize(app) {

        super.initialize(app);

        //
        // create chatgroups from keychain
        //
        let keys = this.app.keys.returnKeys();
        for (let i = 0; i < keys.length; i++) {
            if (keys[i].aes_publickey == "") {
                return;
            }
            this.createChatGroup([keys[i].publickey, this.app.wallet.returnPublicKey()], keys[i].name);
        }

        //
        // create chatgroups from groups
        //
        let g = this.app.keys.returnGroups();
        for (let i = 0; i < g.length; i++) {
            this.createChatGroup(g[i].members, g[i].name);
        }

        //
        // note that this may run before initializeHTML
        //
        this.sendEvent('chat-render-request', {});
    }

    binaryInsert(list, item, compare, search) {

        var start = 0;
        var end = list.length;

        while (start < end) {

            var pos = (start + end) >> 1;
            var cmp = compare(item, list[pos]);

            if (cmp === 0) {
                start = pos;
                end = pos;
                break;
            } else if (cmp < 0) {
                end = pos;
            } else {
                start = pos + 1;
            }
        }

        if (!search) {
            list.splice(start, 0, item);
        }

        return start;
    }

    async onPeerHandshakeComplete(app, peer) {

        let loaded_txs = 0;
        let community_chat_group_id = "";

        //
        // create mastodon server
        //
        if (peer.isMainPeer()) {
            console.log("peer handshake complete with: " + peer.peer.publickey);
            this.createChatGroup([peer.peer.publickey], "Saito Community Chat");
            community_chat_group_id = this.groups[this.groups.length - 1].id;

            // not a publickey but group_id gets archived as if it were one
            let sql = `SELECT id, tx FROM txs WHERE publickey = "${community_chat_group_id}" ORDER BY ts DESC LIMIT 25`;

            this.sendPeerDatabaseRequestWithFilter(

                "Archive",

                sql,

                (res) => {
                    if (res) {
                        if (res.rows) {
                            for (let i = 0; i < res.rows.length; i++) {
                                let tx = new saito.default.transaction(JSON.parse(res.rows[i].tx));
                                let txmsg = tx.returnMessage();
                                this.binaryInsert(this.groups[this.groups.length - 1].txs, tx, (a, b) => {
                                    return a.transaction.ts - b.transaction.ts;
                                })
                            }
                            this.sendEvent('chat-render-request', {});

                            //
                            // check identifiers
                            //
                            if (this.added_identifiers_post_load == 0) {
                                console.log("ADD IDENTIFIERS POST LOAD: chat.js");
                                try {
                                    setTimeout(() => {
                                        this.app.browser.addIdentifiersToDom();
                                        this.added_identifiers_post_load = 1;
                                    }, 1200);
                                } catch (err) {
                                    console.log("error adding identifiers post-chat");
                                }
                            }

                        }
                    }
                },

                (p) => {
                    if (p.peer.publickey === peer.peer.publickey) {
                        return 1;
                    }

                    this.sendEvent('chat-render-request', {});

		    //
		    // check identifiers
		    //
		    if (this.added_identifiers_post_load == 0) {
		      try {
			setTimeout(()=>{
		          this.app.browser.addIdentifiersToDom();
		          this.added_identifiers_post_load = 1;
			}, 1200);
		      } catch (err) {
			console.log("error adding identifiers post-chat");
		      }
		    }
                }


            );


        } else {

            //
            // if we have already loaded txs, nope out
            //
            if (loaded_txs == 1) {
                return;
            }
        }

        //
        // load transactions from server, but not group chat again
        //
        let group_ids = this.groups.map(group => group.id);
        for (let i = 0; i < group_ids.length; i++) {
            if (group_ids[i] === community_chat_group_id) {
                group_ids.splice(i, 1);
                i--;
            }
        }


        let txs = new Promise((resolve, reject) => {
            app.storage.loadTransactionsByKeys(group_ids, "Chat", 25, (txs) => {
                resolve(txs);
            });
        });
        txs = await txs;

        //
        // TODO - make more efficient
        //
        for (let i = 0; i < txs.length; i++) {
            loaded_txs = 1;
            txs[i].decryptMessage(app);
            let txmsg = txs[i].returnMessage();
            for (let z = 0; z < this.groups.length; z++) {
                if (this.groups[z].id === txmsg.group_id) {
                    this.binaryInsert(this.groups[z].txs, txs[i], (a, b) => {
                        return a.transaction.ts - b.transaction.ts;
                    })
                }
            }
        }


        //
        // update last message
        //
        for (let i = 0; i < this.groups.length; i++) {
            if (this.renderMode == "email") {
                if (this.groups[i].txs.length > 0) {
                    this.updateLastMessage(this.groups[i].id, this.parseMsg(this.groups[i].txs[this.groups[i].txs.length - 1]), this.groups[i].txs[this.groups[i].txs.length - 1].transaction.ts);
                } else {
                    this.updateLastMessage(this.groups[i].id, "new chat");
                }
            }
            if (this.renderMode == "main") {
                if (this.groups[i].txs.length > 0) {
                    this.updateLastMessage(this.groups[i].id, this.parseMsg(this.groups[i].txs[this.groups[i].txs.length - 1]), this.groups[i].txs[this.groups[i].txs.length - 1].transaction.ts);
                }
            }
        }


        //
        // render loaded messages
        //
        this.sendEvent('chat-render-request', {});
        this.sendEvent('chat-render-box-request', {});

        this.render(this.app);

    }


    parseMsg(txs){
        let msg = {};
        msg.message = "";
        try {
          const reconstruct = Buffer.from((Buffer.from(txs.transaction.m).toString()), "base64").toString("utf-8");
          msg = JSON.parse(reconstruct);
        } catch (err) {
          console.error(err);
        }
        return msg.message;
    }

    updateLastMessage(group_id, msg, ts = null) {

        let tstamp = new Date().getTime();
        if (ts != null) {
            tstamp = ts;
        }

        let datetime = this.app.browser.formatDate(tstamp);

        for (let i = 0; i < this.groups.length; i++) {
            if (this.groups[i].id === group_id) {
                let element_to_update = 'chat-last-message-' + group_id;
                try {
                    document.getElementById(element_to_update).innerHTML = sanitize(msg);
                } catch (err) {
                }
                element_to_update = 'chat-last-message-timestamp-' + group_id;
                try {
                    document.getElementById(element_to_update).innerHTML = sanitize(`${datetime.hours}-${datetime.minutes}`);
                } catch (e) {
                }
            }
        }
    }


    //
    // onchain messages --> eeceiveMessage()
    //
    onConfirmation(blk, tx, conf, app) {

        tx.decryptMessage(app);
        let txmsg = tx.returnMessage();
        if (conf == 0) {
            if (txmsg.request == "chat message") {
                //
                // we manually update the TS ourselves to prevent re-orgs, this means sigs
                // no longer validate on messages, but we should be able to recreate if needed
                // by just testing timestamps around this time until we get a match. with that
                // said this is TODO -- these changes for early usability.
                //
                // update TS before save -- TODO -- find a better fix that doesn't break
                // our ability to validate the chat messages.
                //
                let modified_tx_obj = JSON.parse(JSON.stringify(tx.transaction));
                let modified_tx = new saito.default.transaction(modified_tx_obj);
                modified_tx.transaction.ts = new Date().getTime();

                app.storage.saveTransactionByKey(txmsg.group_id, modified_tx);

                if (tx.transaction.from[0].add == app.wallet.returnPublicKey()) {
                    return;
                }
                this.receiveMessage(app, tx);
            }
        }
    }


    //
    // peer messages --> receiveMessage()
    //
    async handlePeerRequest(app, req, peer, mycallback) {
        if (req.request == null) {
            return;
        }
        if (req.data == null) {
            return;
        }

        let tx = req.data;

        try {

            switch (req.request) {

                case "chat message":

                    //
                    let modified_tx_obj = JSON.parse(JSON.stringify(tx.transaction));
                    let modified_tx = new saito.default.transaction(modified_tx_obj);
                    modified_tx.transaction.ts = new Date().getTime();

                    // decrypt if needed
                    let tx2 = new saito.default.transaction(tx.transaction);
                    tx2.decryptMessage(app);
                    this.receiveMessage(app, tx2);
                    this.app.storage.saveTransaction(modified_tx);

                    if (mycallback) {
                        mycallback({ "payload": "success", "error": {} });
                    }

                    break;

                case "chat broadcast message":

                    let routed_tx = new saito.default.transaction(tx.transaction);
                    routed_tx.decryptMessage(this.app);
                    let routed_tx_msg = routed_tx.returnMessage();
                    routed_tx.transaction.ts = new Date().getTime();

                    //
                    // this might be a message for us! process if so
                    //
                    if (routed_tx.isTo(app.wallet.returnPublicKey())) {
                        this.receiveMessage(app, routed_tx);
                        //this.app.storage.saveTransaction(routed_tx);
                    }

                    //
                    // update TS before save -- TODO -- find a better fix that doesn't break
                    // our ability to validate the chat messages.
                    //
                    let modified_routed_tx_obj = JSON.parse(JSON.stringify(routed_tx.transaction));
                    let modified_routed_tx = new saito.default.transaction(modified_routed_tx_obj);
                    modified_routed_tx.transaction.ts = new Date().getTime();

                    //
                    // server saves
                    //
                    let archive = this.app.modules.returnModule("Archive");
                    if (archive) {
                        archive.saveTransactionByKey(routed_tx_msg.group_id, modified_routed_tx);
                    }

                    this.app.network.peers.forEach(p => {
                        if (p.peer.publickey !== peer.peer.publickey) {
                            p.sendRequest("chat message", tx);
                        }
                    });
                    if (mycallback) {
                        mycallback({ "payload": "success", "error": {} });
                    }
                    break;
            }
        } catch (err) {
            console.log(err);
        }
    }


    sendMessage(app, tx, broadcast = 0) {

        if (tx.msg.message.substring(0, 4) == "<img") {
            if (this.inTransitImageMsgSig != null) {
                salert("Image already being sent");
                return;
            }
            this.inTransitImageMsgSig = tx.transaction.sig;
        }
        if (app.network.peers.length > 0) {

            let recipient = app.network.peers[0].peer.publickey;
            for (let i = 0; i < app.network.peers.length; i++) {
                if (app.network.peers[i].hasService("chat")) {
                    recipient = app.network.peers[0].peer.publickey;
                    i = app.network.peers.length + 1;
                }
            }
            let relay_mod = app.modules.returnModule('Relay');

            tx = this.app.wallet.signAndEncryptTransaction(tx);
            if (this.relay_moves_onchain_if_possible == 1) {
                this.app.network.propagateTransaction(tx);
            }

            relay_mod.sendRelayMessage(recipient, 'chat broadcast message', tx);
        } else {
            salert("Connection to chat server lost");
        }

        console.log('saving chats on sendMessage');
        this.saveChat();
        console.log('chats saved');
        console.log(localStorage);
    }


    createMessage(group_id, msg) {

        let members = [];

        for (let i = 0; i < this.groups.length; i++) {
            if (group_id === this.groups[i].id) {
                for (let z = 0; z < this.groups[i].members.length; z++) {
                    if (!members.includes(this.groups[i].members[z])) {
                        members.push(this.groups[i].members[z]);
                    }
                }
            }
        }

        //
        // rearrange if needed so we are not first
        //
        if (members[0] === this.app.wallet.returnPublicKey()) {
            members.splice(0, 1);
            members.push(this.app.wallet.returnPublicKey());
        }

        console.log("MEMBERS ZERO: " + members[0]);

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
            type: "myself",
            timestamp: new Date().getTime()
        };
        newtx.msg.sig = this.app.wallet.signMessage(JSON.stringify(newtx.msg));
        newtx = this.app.wallet.signTransaction(newtx);
        return newtx;

    }

    msgIsFrom(txs, publickey) {
        const x = [];
        if (txs.transaction.from != null) {
          for (let v = 0; v < txs.transaction.from.length; v++) {
            if (txs.transaction.from[v].add === publickey) {
              x.push(txs.transaction.from[v]);
            }
          }
        }
        return (x.length !==0);
    }


    createMessageBlocks(group) {

        let idx = 0;
        let blocks = [];
        let block = [];
        let txs = group.txs;
        let last_message_sender = "";

        while (idx < txs.length) {
            if (blocks.length == 0) {
                if (last_message_sender == "") {
                    block.push(txs[idx]);
                } else {
                    if (this.msgIsFrom(txs[idx], last_message_sender)) {
                        block.push(txs[idx]);
                    } else {
                        blocks.push(block);
                        block = [];
                        block.push(txs[idx]);
                    }
                }
                last_message_sender = txs[idx].transaction.from[0].add;
            } else {
                if (this.msgIsFrom(txs[idx], last_message_sender)) {
                    block.push(txs[idx]);
                } else {
                    blocks.push(block);
                    block = [];
                    block.push(txs[idx]);
                    last_message_sender = txs[idx].transaction.from[0].add;
                }
            }
            idx++;
        }

        blocks.push(block);
        return blocks;

    }


    formatMessage(msg) {

        msg = linkifyHtml(msg, { target: { url: '_self' } });
        msg = marked(msg);
        msg = sanitizeHtml(msg, {
            allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
                'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
                'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img', 'marquee', 'pre'
            ],
            allowedAttributes: {
                div: ['class', 'id'],
                a: ['href', 'name', 'target', 'class', 'id'],
                img: ['src', 'class']
            },
            selfClosing: ['img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta'],
            allowedSchemes: ['http', 'https', 'ftp', 'mailto'],
            allowedSchemesByTag: {},
            allowedSchemesAppliedToAttributes: ['href', 'cite'],
            allowProtocolRelative: true,
            transformTags: {
                'a': sanitizeHtml.simpleTransform('a', { target: '_blank' })
            }
        });
        return sanitize(msg);
    }


    receiveMessage(app, tx, renderMode = "") {

        console.log('receing msgs');
        console.log(tx);
        console.log(tx.returnMessage());

        if (this.inTransitImageMsgSig == tx.transaction.sig) {
            this.inTransitImageMsgSig = null;
        }

        let txmsg = tx.returnMessage();

        //
        // if to someone else and encrypted
        //
        if (tx.transaction.from[0].add == app.wallet.returnPublicKey()) {
            if (app.keys.hasSharedSecret(tx.transaction.to[0].add)) {
                tx.decryptMessage(app);
                txmsg = tx.returnMessage();
            }
        }

        if (app.BROWSER == 1) {
            let m = app.modules.returnActiveModule();
            if (!m.events.includes("chat-render-request")) {
                this.showAlert();
            }
        }


        //
        // if direct message, add group
        //
        if (tx.isTo(app.wallet.returnPublicKey())) {
            let add_new_group = 1;
            let members = [];
            for (let x = 0; x < tx.transaction.to.length; x++) {
                if (!members.includes(tx.transaction.to[x].add)) {
                    members.push(tx.transaction.to[x].add);
                }
            }
            members.sort();
            let group_id = this.app.crypto.hash(members.join('_'));
            for (let i = 0; i < this.groups.length; i++) {
                if (this.groups[i].id == group_id) {
                    add_new_group = 0;
                }
            }
            if (add_new_group == 1) {
                this.createChatGroup(members);
                txmsg.group_id = group_id;
            } else {
                if (!txmsg, group_id) {
                    txmsg.group_id = group_id;
                }
            }
        }


        //
        // notify group chat if not-on-page
        //
        let chat_on_page = 1;
        try {
            let chat_box_id = "#chat-box-" + txmsg.group_id;
            if (!document.querySelector(chat_box_id)) {
                chat_on_page = 0;
            }
        } catch (err) {
        }


        let message = txmsg.message;
        this.groups.forEach(group => {
            try {
                if (group.id == txmsg.group_id) {
                    //
                    // only add if not from me, otherwise will be encrypted for others
                    //
                    if (!tx.isFrom(this.app.wallet.returnPublicKey())) {
                        let identifier = app.keys.returnIdentifierByPublicKey(tx.transaction.from[0].add);
                        let title = identifier ? identifier : tx.transaction.from[0].add;
                        group.txs.push(tx);
                        app.browser.sendNotification(title, message, 'chat-message-notification');
                    } else {
                        let identifier = app.keys.returnIdentifierByPublicKey(this.app.wallet.returnPublicKey());
                        let title = identifier ? identifier : this.app.wallet.returnPublicKey();
                        group.txs.push(tx);
                        app.browser.sendNotification(title, message, 'chat-message-notification');
                    }
                }
            } catch (err) {
                console.log("ERROR 113234: chat error receiving message: " + err);
            }
        });

        if (chat_on_page == 0) {
            if (!tx.isFrom(this.app.wallet.returnPublicKey())) {
                this.openChatBox(txmsg.group_id);
                try {
                    if (this.isOtherInputActive() == 0) {
                        document.getElementById(`chat-box-new-message-input-${txmsg.group_id}`).focus();
                        if (document.getElementById(`chat-box-new-message-input-${txmsg.group_id}`).val === "") {
                            document.getElementById(`chat-box-new-message-input-${txmsg.group_id}`).select();
                        }
                    }
                } catch (err) {
                }
            }
        } else {
            try {
                if (this.isOtherInputActive() == 0) {
                    document.getElementById(`chat-box-new-message-input-${txmsg.group_id}`).focus();
                    if (document.getElementById(`chat-box-new-message-input-${txmsg.group_id}`).val === "") {
                        document.getElementById(`chat-box-new-message-input-${txmsg.group_id}`).select();
                    }
                }
            } catch (err) {
            }
        }

        //
        // update sidebar if possible
        //
        this.updateLastMessage(txmsg.group_id, message);
        this.sendEvent('chat_receive_message', message);
        this.render(this.app, renderMode);


        console.log('saving chat on receive');
        this.saveChat();
        console.log('chats saved');
        console.log(localStorage);

        //
        // maybe try to find out who this is...
        //
        let msgidentifier = app.keys.returnIdentifierByPublicKey(tx.transaction.from[0].add);
        if (msgidentifier === tx.transaction.from[0].add || msgidentifier == "") {
            app.browser.addIdentifiersToDom([tx.transaction.from[0].add]);
        }

    }

    getChatGroups() {
        let options = this.app.storage.getOptions();
        let groups = [];

        if (options != null && options != "") {
            options = JSON.parse(options);
            groups = options.chat.groups;
        }

        return groups;
    }


    saveChat() {

        this.app.options.chat = Object.assign({}, this.app.options.chat);
        this.app.options.chat.groups = this.groups.map(group => {
            let { id, name, members, is_encrypted, txs } = group;
            return { id, name, members, is_encrypted, txs};
        });
        this.app.storage.saveOptions();
    }


    //////////////////
    // UI Functions //
    //////////////////

    openChats() {
        let groups = this.getChatGroups();

        console.log('available chat groups');
        console.log(groups);

        if (groups.length > 0) {
            for (let i=0; i < groups.length; i++) {
                console.log('opening this group chat');
                console.log(groups[i]);
                this.groups = groups;
                this.openChatBox(groups[i].id);
            }
        } else {
           this.openChatBox();
        }
    }

    openChatBox(group_id = null) {

        if (this.renderMode != "email" && this.renderMode != "none") {
            return;
        }

        if (group_id == null) {
            let group = this.returnCommunityChat();
            if (group == undefined || group == null) {
                return;
            }
            if (group.id == undefined || group.id == null) {
                return;
            }
            group_id = group.id;
        }

        let community_chat_group = this.returnCommunityChat();
        if (community_chat_group.id == group_id && this.mute_community_chat == 1) {
            return;
        }

        if (document.getElementById(`chat-box-${group_id}`)) {
            let chat_box_input = document.getElementById(`chat-box-new-message-input-${group_id}`);
            if (this.isOtherInputActive() == 0) {
                chat_box_input.focus();
            }

            //
            // maximize if minimized
            //
            let chat_box = document.getElementById(`chat-box-${group_id}`);
            chat_box.classList.remove("chat-box-hide");
            return;
        }

        for (let i = 0; i < this.groups.length; i++) {
            if (this.groups[i].id == group_id) {
                EmailChat.showChatBox(this.app, this, this.groups[i]);
            }
        }

        this.render(this.app);

        try {
            if (this.isOtherInputActive() == 0) {
                document.getElementById(`chat-box-new-message-input-${group_id}`).focus();
                if (document.getElementById(`chat-box-new-message-input-${group_id}`).val === "") {
                    document.getElementById(`chat-box-new-message-input-${group_id}`).select();
                }
            }
        } catch (err) {
        }

    }

    ///////////////////
    // CHAT SPECIFIC //
    ///////////////////
    createChatGroup(members = null, name = null) {

        if (members == null) {
            return;
        }
        members.sort();
        if (name == null || name == "" || name == undefined) {
            for (let i = 0; i < members.length; i++) {
                if (members[i] != this.app.wallet.returnPublicKey()) {
                    name = members[i];
                }
            }
            if (name == null) {
                name = "me";
            }
        }

        let id = this.app.crypto.hash(`${members.join('_')}`)
        for (let i = 0; i < this.groups.length; i++) {
            if (this.groups[i].id == id) {
                return null;
            }
        }

        this.groups.push({
            id: id,
            members: members,
            name: name,
            txs: [],
        });
    }


    returnCommunityChat() {
        for (let i = 0; i < this.groups.length; i++) {
            if (this.app.options.peers.length > 0) {
                if (this.groups[i].name === "Community Chat") {
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


    isOtherInputActive() {
        try {
            let ae = document.activeElement;
            // if we are viewing an overlay, nope out
            if (document.getElementById("saito-overlay-backdrop")) {
                if (document.getElementById("saito-overlay-backdrop").style.display == "block") {
                    return 1;
                }
            }
            if (document.getElementById("game-overlay-backdrop")) {
                if (document.getElementById("game-overlay-backdrop").style.display == "block") {
                    return 1;
                }
            }
            if (!ae) {
                return 0;
            }
            if (ae.tagName == "INPUT") {
                return 1;
            }
            if (ae.tagName == "TEXTAREA") {
                return 1;
            }
            if (ae.tagName == "input") {
                return 1;
            }
            if (ae.tagName == "textarea") {
                return 1;
            }
        } catch (err) {
        }
        return 0;
    }


    chatLoadMessages(app, tx) {
    }

    async chatRequestMessages(app, tx) {
    }


}


module.exports = Chat;
