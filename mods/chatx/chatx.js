const SaitoUserSmallTemplate = require('./../../lib/saito/new-ui/templates/saito-user-small.template.js');
const saito = require('../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');
const ChatManager = require('./lib/chat-manager/main');
const ChatPopup = require("./lib/chat-manager/popup");

const JSON = require('json-bigint');

class Chatx extends ModTemplate {

    constructor(app) {

        super(app);
        this.name = "Chat";

        this.gamesmenufilter = "chatx"; // once chat is purged, remove in games-menu
        this.description = "Saito instant-messaging client";

        this.groups = [];

        this.mute_community_chat = 0; //TODO add functionality

        this.inTransitImageMsgSig = null;

        this.added_identifiers_post_load = 0;
        this.chat_manager = new ChatManager(this.app, this);
        
        this.mobile_chat_active = false;

    }



    returnServices() {

        let services = [];

        // servers with chat service run plaintext community chat groups
        if (this.app.BROWSER == 0) { services.push({ service: "chat" }); }

        return services;
    }


    respondTo(type) {
        switch (type) {

            //Left Sidebar wants a widget that can manage a list of ongoing chats
            case 'chat-manager':
                //We could insert specific CSS here, e.g. this.styles.push()
                return this.chat_manager;
            default:
                return super.respondTo(type);
        }
    }



    shouldAffixCallbackToModule(modname, tx = null) {
        if (modname == this.name) { return 1; }
        if (modname == "Chat") { return 1; }
        return 0;
    }


    initialize(app) {

        super.initialize(app);
        if (!this.app.BROWSER){return;}

        //
        // create chatgroups from keychain -- friends only
        //
        let keys = this.app.keys.returnKeys();
        for (let i = 0; i < keys.length; i++) {
            if (keys[i].aes_publickey) {
                this.createChatGroup([keys[i].publickey, this.app.wallet.returnPublicKey()], keys[i].name);
            }
        }

        //
        // create chatgroups from groups
        //
        let g = this.app.keys.returnGroups();
        for (let i = 0; i < g.length; i++) {
            this.createChatGroup(g[i].members, g[i].name);
        }


        app.connection.on("encrypt-key-exchange-confirm", (data) => {
            if (data?.members) {
                this.createChatGroup(data.members);
            }
        });

        app.connection.on("open-chat-with", (data) => {
            let group;

            if (Array.isArray(data.key)){
                group = this.createChatGroup(data.key, data.name);
            }else{
                let name = data.name || app.keys.returnUsername(data.key);
                group = this.createChatGroup([app.wallet.returnPublicKey(), data.key], name);
            }
            
            this.openChatBox(group.id);
        });

        app.connection.on("open-chat-with-community", ()=>{
            this.openChatBox();
        });

    }

    returnGroup(group_id) {

        for (let i = 0; i < this.groups.length; i++) {
            if (group_id === this.groups[i].id) {
                return this.groups[i];
            }
        }

        return null;

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
        if (!app.BROWSER) { return; }

        let community_chat_group_id = "";

        //
        // create mastodon server
        //
        if (peer.isMainPeer()) {


            //
            // note - we read this from the options file directly as
            // the peers will not have yet initialized and thus will 
            // not be able to inform us whether they support the chat
            // service. TODO - fix later
            //
            let newgroup = this.createChatGroup([peer.peer.publickey], "Saito Community Chat");

            community_chat_group_id = newgroup.id;

            // not a publickey but group_id gets archived as if it were one
            let sql = `SELECT id, tx FROM txs WHERE publickey = "${community_chat_group_id}" ORDER BY ts DESC LIMIT 25`;

            this.sendPeerDatabaseRequestWithFilter(

                "Archive",

                sql,

                (res) => {

                    if (res?.rows) {
                        for (let i = 0; i < res.rows.length; i++) {
                            let tx = new saito.default.transaction(JSON.parse(res.rows[i].tx));
                            let txmsg = tx.returnMessage();
                            let ins = true;

                            for (let z = 0; z < this.groups.length; z++) {
                                for (let zz = 0; zz < this.groups[z].txs.length; zz++) {
                                    if (this.groups[z].txs[zz].transaction.sig === tx.transaction.sig) {
                                        let oldtxmsg = this.groups[z].txs[zz].returnMessage();
                                        if (txmsg.timestamp === oldtxmsg.timestamp) {
                                            ins = false;
                                            break;
                                        }
                                    }
                                }
                            }
                            if (ins) {
                                this.binaryInsert(this.groups[this.groups.length - 1].txs, tx, (a, b) => {
                                    return a.transaction.ts - b.transaction.ts;
                                })
                            } 
                        }

                        //
                        // show community chat on load if not mobile
                        //
                        if (app.BROWSER) {
                            if ((!app.browser.isMobileBrowser(navigator.userAgent) && window.innerWidth > 600) || this.mobile_chat_active) {
                                if (app.options.auto_open_chat_box == null || app.options.auto_open_chat_box){
                                    let active_module = app.modules.returnActiveModule();
                                    if (active_module.request_no_interrupts == true) {
                                        // if the module has ASKED leave it alone
                                        console.log("ASKED NOT TO INTERRUPT!");
                                        return;
                                    }
                                    this.openChatBox();                                     
                                } 
                            }
                        }

                        //
                        // check identifiers
                        //
                        if (this.added_identifiers_post_load == 0) {
                            try {
                                setTimeout(() => {
                                    this.app.browser.addIdentifiersToDom();
                                    this.added_identifiers_post_load = 1;
                                }, 1200);
                            } catch (err) {
                                console.warn("error adding identifiers post-chat");
                            }
                        }
                    }
                },

                (p) => {
                    if (p.peer.publickey === peer.peer.publickey) {
                        return 1;
                    }
                }
            );

        } 

        //
        // load transactions from server, but not group chat again
        //
        let group_ids = this.groups.map( 
            (group) => { 
             if (group.id!==community_chat_group_id){
                 return group.id
             } 
         });


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
            txs[i].decryptMessage(app);
            let txmsg = txs[i].returnMessage();
            for (let z = 0; z < this.groups.length; z++) {
                if (this.groups[z].id === txmsg.group_id) {
                    let ins = true;
                    for (let zz = 0; zz < this.groups[z].txs.length; zz++) {
                        // why does ts differ slightly?
                        if (this.groups[z].txs[zz].transaction.sig === txs[i].transaction.sig) {
                            let oldtxmsg = this.groups[z].txs[zz].returnMessage();
                            if (txmsg.timestamp === oldtxmsg.timestamp) {
                                //console.log("confirmed duplicate");
                                ins = false;
                                break;
                            }
                        }
                    }
                    if (ins) {
                        this.binaryInsert(this.groups[z].txs, txs[i], (a, b) => {
                            return a.transaction.ts - b.transaction.ts;
                        });
                    }
                }
            }
        }

    }


    parseMsg(txs) {
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


    //
    // onchain messages --> eeceiveMessage()
    //
    onConfirmation(blk, tx, conf, app) {

        if (conf == 0) {

            tx.decryptMessage(app);

            let txmsg = tx.returnMessage();

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

                this.receiveChatTransaction(app, tx);
                app.storage.saveTransactionByKey(txmsg.group_id, modified_tx);
            }
        }
    }


    async handlePeerRequest(app, message, peer, mycallback = null) {

        if (!message.request || !message.data) {
            return;
        }

        let tx = message.data;

        try {

            switch (message.request) {

                case "chat message":

                    //
                    let modified_tx_obj = JSON.parse(JSON.stringify(tx.transaction));
                    let modified_tx = new saito.default.transaction(modified_tx_obj);
                    modified_tx.transaction.ts = new Date().getTime();

                    // decrypt if needed
                    let tx2 = new saito.default.transaction(tx.transaction);
                    tx2.decryptMessage(app);
                    this.receiveChatTransaction(app, tx2);
                    // only save onchain
                    //this.app.storage.saveTransaction(modified_tx);

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
                        this.receiveChatTransaction(app, routed_tx);
                        // save when we receive onchain
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
            console.error(err);
        }
    }


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

            tx = app.wallet.signAndEncryptTransaction(tx);

            app.network.propagateTransaction(tx);
            
            app.connection.emit("send-relay-message", {recipient, request: 'chat broadcast message', data:tx});

        } else {
            salert("Connection to chat server lost");
        }

    }


    createChatTransaction(group_id, msg) {

        let members = [];

        //Make sure we have an array of unique member keys
        for (let i = 0; i < this.groups.length; i++) {
            if (group_id === this.groups[i].id) {
                members = [...new Set(this.groups[i].members)];
            }
        }

        //
        // rearrange if needed so we are not first --- WHY IS THIS NECESSARY???
        //
        if (members[0] === this.app.wallet.returnPublicKey()) {
            members.splice(0, 1);
            members.push(this.app.wallet.returnPublicKey());
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


    returnChatBody(group_id) {

        let html = '';
        let group = this.returnGroup(group_id);
        let message_blocks = this.createMessageBlocks(group);

        for (let block of message_blocks) {
            let ts = 0;
            if (block.length > 0) {
                let sender = "";
                let msg = "";
                for (let z = 0; z < block.length; z++) {
                    if (z > 0) { msg += '<br/>'; }
                    let txmsg = block[z].returnMessage();
                    sender = block[z].transaction.from[0].add;
                    msg += txmsg.message;
                    ts = txmsg.timestamp;
                }
                msg = this.app.browser.sanitize(msg);
                html += `${SaitoUserSmallTemplate(this.app, this, sender, msg, ts)}`;
            }
        }

        group.unread = 0;

        return html;

    }

    createMessageBlocks(group) {

        let blocks = [];
        let block = [];
        let txs = group.txs;
        let last_message_sender = "";

        for (let i = 0; i < txs.length; i ++) {

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

    receiveChatTransaction(app, tx) {

        //
        // TODO - remove when Arcade is purged
        //
        //let am = app.modules.returnActiveModule();
        //if (am?.name === "Arcade") { return; }


        if (this.inTransitImageMsgSig == tx.transaction.sig) {
            this.inTransitImageMsgSig = null;
        }

        let txmsg = tx.returnMessage();

        if (this.debug) { console.log("receiveChatTrans: " + JSON.stringify(txmsg)); }

        //
        // if to someone else and encrypted
        //
        if (tx.transaction.from[0].add == app.wallet.returnPublicKey()) {
            if (app.keys.hasSharedSecret(tx.transaction.to[0].add)) {
                tx.decryptMessage(app);
                txmsg = tx.returnMessage();
            }
        }


        if (txmsg.group_id) {
            for (let i = 0; i < this.groups.length; i++) {
                if (this.groups[i].id === txmsg.group_id) {
                    
                    //Have we already inserted this message into the chat
                    for (let z = 0; z < this.groups[i].txs.length; z++) {
                        if (this.groups[i].txs[z].transaction.sig === tx.transaction.sig) { 
                            return; 
                        }
                    }
                    this.addTransactionToGroup(this.groups[i], tx);
                    
                    if (this.debug){ console.log("emitting render request with group id: " + txmsg.group_id); }
                    app.connection.emit('chat-render-request', txmsg.group_id);
                    return;
                }
            }
        }


        //
        // no match on groups -- direct message
        //
        if (tx.isTo(app.wallet.returnPublicKey())) {

            let members = [];
            for (let x = 0; x < tx.transaction.to.length; x++) {
                if (!members.includes(tx.transaction.to[x].add)) {
                    members.push(tx.transaction.to[x].add);
                }
            }

            //
            // if we already have a group with these members, 
            // createChatGroup will find and return it, otherwise
            // it makes a new group
            //
            let proper_group = this.createChatGroup(members);
            
            this.addTransactionToGroup(proper_group, tx);
            
            if (this.debug) { console.log("emitting render request 2 with group id: " + proper_group.id); }
            
            app.connection.emit('chat-render-request', proper_group.id);

        }

    }


    //////////////////
    // UI Functions //
    //////////////////

    /*
        This is a function to open a chat popup, and create it if necessary
    */
    openChatBox(group_id = null) {
        if (!this.app.BROWSER) {return;}

        this.app.options.auto_open_chat_box = true;
        this.app.storage.saveOptions();

        if (group_id == null) {

            let community = this.returnCommunityChat();

            if (!community?.id) {
                return;
            }
            group_id = community.id;
        }

        let group = this.returnGroup(group_id);
        
        if (!group) {return;}

        if (!group.popup){
            group.popup = new ChatPopup(this.app, this, group_id);
        }

        group.popup.render(this.app, this, group_id);

    }


    ///////////////////
    // CHAT SPECIFIC //
    ///////////////////
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
                if (members[i] != this.app.wallet.returnPublicKey()) {
                    name += members[i] + ", ";
                }
            }
            if (!name) {
                name = "me";
            }else{
                name = name.substring(0, name.length-2);
            }
        }

        let newGroup = {
            id: id,
            members: members,
            name: name,
            txs: [],
            unread: 0,
            popup: (this.app.BROWSER)? new ChatPopup(this.app, this, id) : null,
        }

        this.groups.push(newGroup);

        //Tell chat manager to add this group to its list
        this.app.connection.emit("refresh-chat-groups", newGroup.id);

        return newGroup;

    }


    addTransactionToGroup(group, tx) {
        for (let i = 0; i < group.txs.length; i++) {
            if (group.txs[i].transaction.sig === tx.transaction.sig && group.txs[i].transaction.ts === tx.transaction.ts) {
                return;
            }
        }
        group.unread++;
        group.txs.push(tx);
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
                if (this.groups[i].name === "Saito Community Chat") {
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


    saveChat() {
        this.app.options.chat = Object.assign({}, this.app.options.chat);
        this.app.storage.saveOptions();
    }




}


module.exports = Chatx;
