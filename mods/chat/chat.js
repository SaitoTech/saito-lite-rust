const SaitoUserTemplate = require('./../../lib/saito/ui/saito-user/saito-user.template.js');
const saito = require('../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');
const ChatMain = require('./lib/appspace/main');
const SaitoHeader = require('./../../lib/saito/ui/saito-header/saito-header');
const ChatManager = require('./lib/chat-manager/main');
const ChatManagerOverlay = require('./lib/overlays/chat-manager');
const JSON = require('json-bigint');
const Transaction = require('../../lib/saito/transaction').default;
const PeerService = require('saito-js/lib/peer_service').default;
const ChatSettings = require('./lib/overlays/chat-manager-menu');
const ChatSidebar = require('./lib/appspace/chat-sidebar');
const HomePage = require('./index');

class Chat extends ModTemplate {
  constructor(app) {
    super(app);

    this.name = 'Chat';
    this.slug = 'chat';
    this.description = 'Saito instant-messaging client';
    this.categories = 'Messaging Chat';
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
            notice = (optional) flag that the tx is not really a chat message, but meta data
            mentioned = array of keys for saito mention
            flag_message = (optional) flag that message is a notification to me
        }
        last_update
    }
    */

    this.inTransitImageMsgSig = null;

    this.added_identifiers_post_load = 0;

    this.communityGroup = null;
    this.communityGroupName = 'Saito Community Chat';

    this.debug = false;

    this.chat_manager = null;

    this.chat_manager_overlay = null;

    this.loading = true;
    this.enable_profile_edits = true;
    this.isRelayConnected = false;

    this.audio_notifications = true;
    this.audio_chime = 'Glass';
    this.auto_open_community = false;

    this.black_list = [];

    this.app.connection.on('encrypt-key-exchange-confirm', (data) => {
      let group = this.returnOrCreateChatGroupFromMembers(data?.members);
      this.app.connection.emit('chat-manager-render-request');
      //Refresh the chat app if you are in it
      this.app.connection.emit('chat-manager-opens-group', group);
    });

    this.app.connection.on(
      'remove-user-from-chat-group',
      async (group_id, member_id) => {
        let group = this.returnGroup(group_id);
        if (group) {
          if (
            group.members.includes(member_id) &&
            group?.member_ids[this.publicKey] == 'admin'
          ) {
            await this.sendRemoveMemberTransaction(group, member_id);
          }
        }
      }
    );

    this.app.connection.on('chat-ready', () => {
      if (this.auto_open_community) {
        this.app.connection.emit('chat-popup-render-request');
      }else{
        this.app.connection.emit('chat-manager-render-request');
      }
    });

    this.app.connection.on('chat-message-user', (pkey, message) => {
      let group;
      if (pkey.toLowerCase() == "community"){
        group = this.returnCommunityChat();
      }else{
        group = this.returnOrCreateChatGroupFromMembers([
          this.publicKey,
          pkey
        ]);
      }

      this.createChatTransaction(group.id, message);
    });

    this.postScripts = ['/saito/lib/emoji-picker/emoji-picker.js'];

    this.social = {
      twitter: '@SaitoOfficial',
      title: 'Saito Chat',
      url: 'https://saito.io/chat/',
      description: 'Instant messaging client on Saito Network blockchain',
      image:
        'https://saito.tech/wp-content/uploads/2022/04/saito_card_horizontal.png'
    };
  }

  hasSettings() {
    return true;
  }

  loadSettings(container) {
    let as = new ChatSettings(this.app, this, container);
    as.render();
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
      await this.getOlderTransactions(this.communityGroup.id, 'localhost');

      return;
    }

    //
    // BROWSERS ONLY
    //

    this.loadOptions();

    this.chime = new Audio(`/saito/sound/${this.audio_chime}.mp3`);

    await this.loadChatGroups();

    //Add script for emoji to work
    this.attachPostScripts();
  }

  async render() {
    if (!this.app.BROWSER) {
      return;
    }

    if (this.main == null) {
      this.header = new SaitoHeader(this.app, this);
      await this.header.initialize(this.app);
      this.header.header_class = 'wide-screen';
      this.addComponent(this.header);
      this.main = new ChatMain(this.app, this);
      this.addComponent(this.main);

      this.addComponent(new ChatSidebar(this.app, this));
    }

    if (this.chat_manager == null) {
      this.chat_manager = new ChatManager(this.app, this);
      this.addComponent(this.chat_manager);
    }
    this.chat_manager.container = '.saito-sidebar.left';

    if (
      !(
        this.app.browser.isMobileBrowser(navigator.userAgent) &&
        window.innerWidth < 750
      ) &&
      window.innerWidth > 599
    ) {
      this.chat_manager.chat_popup_container = '.saito-main';
    }

    this.chat_manager.render_popups_to_screen = 0;
    this.chat_manager.render_manager_to_screen = 1;

    this.styles = ['/chat/style.css'];

    await super.render();

    let chat_id = this.app.browser.returnURLParameter('chat_id');

    if (chat_id) {
      if (this.app.wallet.isValidPublicKey(chat_id)) {
        //data.key = public key(s) of other chat parties
        this.app.connection.emit('open-chat-with', { key: chat_id });
      } else {
        let chat_group = JSON.parse(this.app.crypto.base64ToString(chat_id));

        console.log('CHAT LINK:', chat_group);

        let search = this.returnGroup(chat_group.id);
        if (search) {
          //data.id = group id
          this.app.connection.emit('open-chat-with', {
            id: chat_group.id
          });
        } else {
          // Simulate receiving the original create group transaction

          let newtx =
            await this.app.wallet.createUnsignedTransactionWithDefaultFee(
              this.publicKey
            );
          newtx.msg = chat_group;

          this.receiveCreateGroupTransaction(newtx);
        }
      }

      window.history.replaceState({}, document.title, '/' + this.slug);
    }
  }

  async onPeerServiceUp(app, peer, service = {}) {
    let chat_self = this;

    if (!app.BROWSER) {
      return;
    }

    if (service.service === 'relay') {
      this.isRelayConnected = true;
      this.app.connection.emit('chat-manager-render-request');
    }

    //
    // load private chat
    //
    if (service.service === 'archive') {
      if (this.debug) {
        console.log('Chat: onPeerServiceUp', service.service);
      }

      this.loading = 0;

      /* We shouldn't need to fall back to archive to retrieve offline messages anymore... maybe

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
      }*/
    }

    //
    // load public chat
    //
    if (service.service === 'chat') {
      if (this.debug) {
        console.log('Chat: onPeerServiceUp', service.service);
      }

      if (this?.communityGroup?.members?.includes(peer.publicKey)){
        console.log("Reconnect to chat service peer");
        return;
      }

      this.communityGroup = this.returnOrCreateChatGroupFromMembers(
        [peer.publicKey],
        this.communityGroupName
      );

      if (this.communityGroup) {
        this.communityGroup.members = [peer.publicKey];

        this.communityGroup.description =
          'an open forum for anyone on Saito to chat';

        //
        // remove duplicate public chats caused by server update
        //
        let connectedPeers = await this.app.network.getPeers();

        for (let i = this.groups.length; i >= 0; i--) {
          if (
            this.groups[i]?.name === this.communityGroup.name &&
            this.groups[i].id !== this.communityGroup.id &&
            this.groups[i].members.length == 1
          ) {
            console.log('New community chat server... need to update');

            let old_peer = this.groups[i].members[0];
            let should_delete = true;

            for (let peer of connectedPeers) {
              if (old_peer == peer.publicKey) {
                should_delete = false;
                console.log(
                  'Nevermind, still connected to old peer ' + old_peer
                );
              }
            }

            if (should_delete) {
              this.app.connection.emit(
                'chat-popup-remove-request',
                this.groups[i]
              );
              this.groups.splice(i, 0);
            }
          }
        }

        // let newtx = await this.app.wallet.createUnsignedTransaction();

        let msg = {
          request: 'chat history',
          group_id: this.communityGroup.id,
          timestamp: this.communityGroup.last_update
        };

        this.app.network.sendRequestAsTransaction(
          'chat history',
          msg,
          (txs) => {
            this.loading--;
            if (this.debug) {
              console.log('chat history callback: ' + txs.length);
            }
            // These are no longer proper transactions!!!!

            if (this.communityGroup.txs.length > 0) {
              let most_recent_ts =
                this.communityGroup.txs[this.communityGroup.txs.length - 1]
                  .timestamp;
              for (let i = 0; i < txs.length; i++) {
                if (txs[i].timestamp > most_recent_ts) {
                  this.communityGroup.txs.push(txs[i]);
                  this.communityGroup.unread++;
                }
              }
            } else {
              this.communityGroup.txs = txs;
              this.communityGroup.unread = txs.length;
            }

            if (this.app.BROWSER) {
              let active_module = app.modules.returnActiveModule();
              if (
                app.browser.isMobileBrowser(navigator.userAgent) ||
                window.innerWidth < 600 ||
                active_module?.request_no_interrupts
              ) {
                this.app.connection.emit('chat-manager-request-no-interrupts');
              }

              this.app.connection.emit('chat-ready');
            }
          },
          peer.peerIndex
        );
      }

      let now = new Date().getTime();

      for (let group of this.groups) {
        /*
        -- Video call/limbo uses the server as a member
        -- games address the players, but add a flag when creating the group
        */

        if (group.name !== this.communityGroupName) {
          //
          // Not the community group but using the chat server, clear these out after 1 day by default
          //
          if (group.members.includes(peer.publicKey) || group?.temporary){

            let last_update = group?.last_update || 0;

            if (now - last_update > (1000 * 60 * 60 * 24)){
              console.log(group.name, JSON.stringify(group.members));
              console.log("Time since last update (s): ", (now - last_update)/1000);
              console.log("Delete Chat group!");
              await this.deleteChatGroup(group);
            }
          }
        }
      }

      // console.log(JSON.parse(JSON.stringify(this.groups)));
    }
  }

  returnServices() {
    let services = [];
    // servers with chat service run plaintext community chat groups
    if (this.app.BROWSER == 0) {
      services.push(new PeerService(null, 'chat', this.communityGroupName));
    }
    return services;
  }

  respondTo(type, obj = null) {
    let chat_self = this;
    let force = false;

    switch (type) {
      case 'chat-manager':
        if (this.chat_manager == null) {
          this.chat_manager = new ChatManager(this.app, this);
        }
        return this.chat_manager;

      case 'saito-game-menu':
      case 'saito-chat-popup':
      case 'saito-floating-menu':

          // Need to make sure this is created so we can listen for requests to open chat popups
          if (this.chat_manager == null) {
            this.chat_manager = new ChatManager(this.app, this);
          }
          //Don't want mobile chat auto popping up
          this.chat_manager.render_popups_to_screen = 0;

          if (this.chat_manager_overlay == null) {
            this.chat_manager_overlay = new ChatManagerOverlay(this.app, this);
          }
          return [
            {
              text: 'Chat',
              icon: 'fas fa-comments',
              callback: function (app, id) {
                // console.log('Render Chat manager overlay');
                chat_self.chat_manager_overlay.render();
              },
              rank: 15,
              is_active: this.browser_active,
              event: function (id) {
                chat_self.app.connection.on(
                  'chat-manager-render-request',
                  () => {
                    let unread = 0;
                    for (let group of chat_self.groups) {
                      unread += group.unread;
                    }
                    chat_self.app.browser.addNotificationToId(unread, id);
                    chat_self.app.connection.emit(
                      'saito-header-notification',
                      'chat',
                      unread
                    );
                  }
                );

                //Trigger my initial display
                chat_self.app.connection.emit('chat-manager-render-request');
              }
            }
          ];

      break;

      case 'saito-header':
        if (chat_self.browser_active) {
          return null;
        }

        //
        // In mobile, we use the hamburger menu to open chat (without leaving the page)
        //
        if (
          this.app.browser.isMobileBrowser() ||
          (this.app.BROWSER && window.innerWidth < 600)) {
          if (this.chat_manger) {
            //Don't want mobile chat auto popping up
            this.chat_manager.render_popups_to_screen = 0;
          }

          if (this.chat_manager_overlay == null) {
            this.chat_manager_overlay = new ChatManagerOverlay(this.app, this);
          }
          return [
            {
              text: 'Chat',
              icon: 'fas fa-comments',
              callback: function (app, id) {
                // console.log('Render Chat manager overlay');
                chat_self.chat_manager_overlay.render();
              },
              event: function (id) {
                chat_self.app.connection.on(
                  'chat-manager-render-request',
                  () => {
                    let unread = 0;
                    for (let group of chat_self.groups) {
                      unread += group.unread;
                    }
                    chat_self.app.browser.addNotificationToId(unread, id);
                    chat_self.app.connection.emit(
                      'saito-header-notification',
                      'chat',
                      unread
                    );
                  }
                );

                //Trigger my initial display
                chat_self.app.connection.emit('chat-manager-render-request');
              }
            }
          ];
        } else {
          //
          // Otherwise we go to the main chat application
          //
          return [
            {
              text: 'Chat',
              icon: 'fas fa-comments',
              callback: function (app, id) {
                navigateWindow('/chat');
              }
            }
          ];
        }
        return null;
      case 'user-menu':
        if (obj?.publicKey !== this.publicKey) {
          let dynamic_text = this.black_list.includes(obj.publicKey)
            ? 'Unblock and Chat'
            : 'Chat';

          return {
            text: dynamic_text,
            icon: 'far fa-comment-dots',
            callback: function (app, publicKey) {
              if (chat_self.chat_manager == null) {
                chat_self.chat_manager = new ChatManager(
                  chat_self.app,
                  chat_self
                );
              }

              for (let i = 0; i < chat_self.black_list.length; i++) {
                if (chat_self.black_list[i] == publicKey) {
                  chat_self.black_list.splice(i, 1);
                  break;
                }
              }
              chat_self.saveOptions();
              chat_self.app.connection.emit('open-chat-with', {
                key: publicKey
              });
            }
          };
        }

        return null;

      //
      // Abandoned code to duplicate user menu in saito-profile
      //
      case 'saito-profile-menu':
        if (obj?.publicKey) {
          if (
            chat_self.app.keychain.hasPublicKey(obj.publicKey) &&
            obj.publicKey !== this.publicKey
          ) {
            return {
              text: 'Chat',
              icon: 'far fa-comment-dots',
              callback: function (app, publicKey) {
                if (chat_self.chat_manager == null) {
                  chat_self.chat_manager = new ChatManager(
                    chat_self.app,
                    chat_self
                  );
                }

                chat_self.app.connection.emit('open-chat-with', {
                  key: publicKey
                });
              }
            };
          }
        }

        return null;

      case 'call-actions':
        if (obj?.call_id) {
          if (this.chat_manager == null) {
            this.chat_manager = new ChatManager(this.app, this);
          }

          this.createFreshGroup('Saito Talk', obj.call_id);

          return [
            {
              text: 'Chat',
              icon: 'fa-regular fa-comments',
              callback: function (app) {
                app.connection.emit('open-chat-with', {
                  id: obj.call_id
                });
              },
              event: function (id) {
                let group = chat_self.returnGroup(obj.call_id);
                if (group){
                  chat_self.app.browser.addNotificationToId(group.unread, id);
                  chat_self.app.connection.on(
                    'chat-manager-render-request',
                    () => {
                      chat_self.app.browser.addNotificationToId(group.unread, id);
                    }
                  );
                }
              }
            }
          ];
        }

        break;

      case 'limbo-actions':
        if (obj?.call_id) {
          if (this.chat_manager == null) {
            this.chat_manager = new ChatManager(this.app, this);
          }

          this.createFreshGroup(obj.group_name, obj.call_id);

          return [
            {
              text: 'Chat',
              icon: 'fa-regular fa-comments',
              callback: function (app) {
                app.connection.emit('open-chat-with', {
                  id: obj.call_id
                });
              },
              event: function (id) {
                let group = chat_self.returnGroup(obj.call_id);
                if (group){
                   chat_self.app.browser.addNotificationToId(group.unread, id);
                   chat_self.app.connection.on(
                    'chat-manager-render-request',
                    () => {
                        chat_self.app.browser.addNotificationToId(group.unread, id);
                    }
                  );

                }
              }
            }
          ];
        }

        break;

      case 'ntfy-notification':
        console.log(JSON.stringify(obj));

        if(obj.tx?.msg?.module != 'Chat') {
          return null;
        }


        let tx = obj.tx;
        let notification = obj.notification;

        //Add from.
        let from = this.app.keychain.returnIdentifierByPublicKey(
          tx.from[0].publicKey,
          true
        );

        if ((tx.to.length = 2)) {
          notification.title = 'Saito DM';
        } else {
          notification.title = 'Saito Chat';
        }

        notification.tags = ['envelope'];

        notification.message = 'From: ' + from + '\n';

        if (typeof tx.msg == 'string') {
          //was checking if JSON.parse(tx.msg).ct was a string but this was breaking on parsing bigint...
          notification.message += 'Message Encyrypted';
        } else {
          // Make sure this is a Chat Notification!!!!
          if (tx?.msg?.module !== 'Chat') {
            return null;
          }
          notification.message += tx.msg.message?.substring(0, 50);
        }
        notification.actions = [
          { action: 'view', label: 'Open Saito', url: this.app.server.server.url + '/chat/' }
        ];
        return notification;

      default:
        return super.respondTo(type);
    }
  }

  createFreshGroup(name, id) {
    
    if (this.returnGroup(id)){
      return;
    }

    let chat_group = {
      id,
      members: this.communityGroup.members, //general chat services host key
      name,
      txs: [],
      unread: 0,
      temporary: true
      //
      // USE A TARGET Container if the chat box is supposed to show up embedded within the UI
      // Don't include if you want it to be just a chat popup....
      //
      //target_container: `.stun-chatbox .${this.remote_container}`,
    };

    this.groups.push(chat_group);
  }

  //
  // ---------- on chain messages ------------------------
  // ONLY processed if I am in the to/from of the transaction
  // so I will process messages I send to community, but not other peoples
  // it is mostly just a legacy safety catch for direct messaging
  //
  async onConfirmation(blk, tx, conf) {

    if (conf == 0) {
      //Does this break chat or fix the encryption bugs...?
      if (this.app.BROWSER && !tx.isTo(this.publicKey)) {
        return;
      }

      if (tx.decryptMessage) {
        await tx.decryptMessage(this.app);
      }

      let txmsg;
      if (tx.returnMessage) {
        txmsg = tx.returnMessage();
      } else {
        txmsg = tx.msg;
      }

      if (!txmsg.module == 'Chat') {
        return;
      }

      if (this.debug) {
        console.log('Chat onConfirmation: ' + txmsg.request);
      }

      if (txmsg.request == 'chat message') {
        await this.receiveChatTransaction(tx, 1);
      }

      // We put chat message above because we actually have some logic in
      // the "double" processing of chat messages
      if (this.hasSeenTransaction(tx) && this.app.BROWSER) {
        console.log('***************Already processed!');
        return;
      }

      if (txmsg.request == 'chat group') {
        await this.receiveCreateGroupTransaction(tx);
      }
      if (txmsg.request == 'chat join') {
        await this.receiveJoinGroupTransaction(tx);
      }
      if (txmsg.request == 'chat update') {
        await this.receiveUpdateGroupTransaction(tx);
      }
      if (txmsg.request == 'chat remove') {
        await this.receiveRemoveMemberTransaction(tx);
      }
      if (txmsg.request == 'chat like') {
        await this.receiveChatLikeTransaction(tx, 1);
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

    if (this.debug && txmsg.request.includes('chat ')) {
      console.log('Chat handlePeerTransaction: ' + txmsg.request);
    }

    if (txmsg.request === 'chat history') {
      console.log('Chat history request for: ', peer.publicKey, peer.peerIndex);
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

    // This is forwarded directly as it's transaction because
    if (txmsg.request == 'chat group') {
      this.receiveCreateGroupTransaction(tx);
      return;
    }

    //
    // Sometimes we use the relay to wrap the chat module transaction with a different set of keys
    //
    if (txmsg.request === 'chat relay') {
      let inner_tx = new Transaction(undefined, txmsg.data);
      await inner_tx.decryptMessage(app);

      let inner_message = inner_tx.returnMessage();

      if (this.hasSeenTransaction(inner_tx)) {
        console.warn('Relayed transaction already seen...');
        return;
      }

      if (inner_message.request == 'chat join') {
        this.receiveJoinGroupTransaction(inner_tx);
        return;
      }

      if (inner_message.request == 'chat update') {
        this.receiveUpdateGroupTransaction(inner_tx);
        return;
      }

      if (inner_message.request == 'chat remove') {
        this.receiveRemoveMemberTransaction(inner_tx);
        return;
      }

      if (inner_message.request === 'chat like') {
        if (app.BROWSER) {
          await this.receiveChatLikeTransaction(inner_tx);
        } else {
          //We address to the chat service so it can relay to everyone
          if (app.BROWSER == 0) {
            if (tx.isTo(this.publicKey)) {
              let peers = await app.network.getPeers();
              peers.forEach((p) => {
                if (p.publicKey !== peer.publicKey) {
                  app.network.sendTransactionWithCallback(
                    tx,
                    null,
                    p.peerIndex
                  );
                }
              });
            }
          }
        }

        if (mycallback) {
          mycallback({ payload: 'success', error: {} });
          return 1;
        }

        return 0;
      }

      // Should be chat message if encrypted...
      if (
        app.crypto.isAesEncrypted(inner_message) ||
        inner_message.request == 'chat message'
      ) {
        if (app.BROWSER) {
          await this.receiveChatTransaction(inner_tx);
        } else {
          //
          // if chat message broadcast is received - we are being asked to broadcast this
          // to a peer if the inner_tx is addressed to one of our peers.
          //
          if (tx.isTo(this.publicKey)) {
            let peers = await app.network.getPeers();

            //
            // Addressed to chat server, so forward to all
            //
            //console.log('Community Chat, relay to all: ', txmsg);
            peers.forEach((p) => {
              //This is filtering for not receiving your chat tx back to you... but there are case where we do want that?
              //if (p.publicKey !== peer.publicKey) {
                app.network.sendTransactionWithCallback(
                  tx, // the relay wrapped message
                  null,
                  p.peerIndex
                );
              //}
            });
          }
        }

        //
        // notify sender if requested
        //
        if (mycallback) {
          mycallback({ payload: 'success', error: {} });
          return 1;
        }

        return 0;
      }
    }

    return super.handlePeerTransaction(app, tx, peer, mycallback);
  }

  //
  // Create a n > 2 chat group (currently unencrypted)
  // We have a single admin (who can add additional members or kick people out)
  //
  async sendCreateGroupTransaction(name, invitees = []) {

    let pk = this.app.crypto.generateKeys();
    let id = this.app.crypto.generatePublicKey(pk);

    this.app.keychain.addWatchedPublicKey(id);
    this.app.keychain.addKey(id, { identifier: name, group: 1, privateKey: pk });

    let newtx = await this.app.wallet.createUnsignedTransaction(
      this.publicKey,
      BigInt(0),
      BigInt(0)
    );
    if (newtx == null) {
      return;
    }

    for (let i = 0; i < invitees.length; i++) {
      if (invitees[i] !== this.publicKey) {
        newtx.addTo(invitees[i]);
      }
    }

    newtx.msg = {
      module: 'Chat',
      request: 'chat group',
      name: name,
      admin: this.publicKey,
      id
    };

    await newtx.sign();

    await this.app.network.propagateTransaction(newtx);

    this.app.connection.emit('relay-transaction', newtx);
  }

  async receiveCreateGroupTransaction(tx) {
    if (tx.isTo(this.publicKey)) {
      let txmsg = tx.returnMessage();

      console.log('Receiving group creation tx', txmsg);

      //I already have the group
      if (this.returnGroup(txmsg.id)) {
        return;
      }

      this.app.keychain.addWatchedPublicKey(txmsg.id);
      this.app.keychain.addKey(txmsg.id, {
        identifier: txmsg.name,
        group: 1
      });

      let newGroup = {
        id: txmsg.id,
        members: [txmsg.admin],
        member_ids: {},
        name: txmsg.name,
        txs: [],
        unread: 0,
        last_update: 0
      };

      for (let x = 0; x < tx.to.length; x++) {
        if (!newGroup.members.includes(tx.to[x].publicKey)) {
          newGroup.members.push(tx.to[x].publicKey);
          newGroup.member_ids[tx.to[x].publicKey] = 1;
        }
      }

      newGroup.member_ids[txmsg.admin] = 'admin';

      this.groups.push(newGroup);
      this.saveChatGroup(newGroup);

      if (tx.isFrom(txmsg.admin)) {
        tx.msg.message = `<div class="saito-chat-notice"><span class="saito-mention saito-address" data-id="${
          txmsg.admin
        }">${this.app.keychain.returnUsername(txmsg.admin)}</span>
	            <span> created the group ${txmsg.name}</span></div>`;
        tx.notice = true;
        this.addTransactionToGroup(newGroup, tx);
      }

      if (tx.isFrom(this.publicKey) && this.publicKey == txmsg.admin) {
        // We have now generated a unique ID (transaction signature) for the chat group
        // and can create a link for anyone else to find it
        this.generateChatGroupLink(newGroup);
      } else {
        let inviter = txmsg?.sender || txmsg.admin;
        await this.sendJoinGroupTransaction(newGroup, inviter);
      }

      //Update UI
      this.app.connection.emit('chat-manager-opens-group', newGroup);
      this.app.connection.emit('open-chat-with', { id: newGroup.id });
    }
  }

  //
  // We automatically send a confirmation when added to a chat group (just so that we can make sure that the user was successfully added)
  // But in the future, we may add a confirmation interface
  //
  async sendJoinGroupTransaction(group, inviter) {
    let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(
      group.id
    );

    if (!newtx) {
      return;
    }

    newtx.msg = {
      module: 'Chat',
      request: 'chat join',
      group_id: group.id,
      invited_by: inviter
    };

    //just to make sure those txs go through
    newtx.addTo(group.admin);
    if (group.admin !== inviter) {
      newtx.addTo(inviter);
    }

    await newtx.sign();

    await this.app.network.propagateTransaction(newtx);
    this.app.connection.emit('relay-send-message', {
      request: 'chat relay',
      recipient: group.members,
      data: newtx.toJson()
    });
  }

  async receiveJoinGroupTransaction(tx) {
    let txmsg = tx.returnMessage();
    let group = this.returnGroup(txmsg.group_id);

    if (!group) {
      console.warn(
        "Receiving chat group transaction from a group I don't know"
      );
      return;
    }

    if (tx.isTo(group.id)) {
      let new_member = tx.from[0].publicKey;

      if (group.member_ids[new_member] == -1) {
        console.log('Blacklisted member attempting to rejoin!');
        return;
      }

      if (!group.members.includes(new_member)) {
        group.members.push(new_member);
        tx.msg.message = `<div class="saito-chat-notice">
											<span class="saito-mention saito-address" data-id="${new_member}">${this.app.keychain.returnUsername(
          txmsg.invited_by
        )}</span>
											<span> added </span>
											<span class="saito-mention saito-address" data-id="${new_member}">${this.app.keychain.returnUsername(
          new_member
        )}</span>
											<span> joined the group</span>
										</div>`;
        tx.notice = true;
        this.addTransactionToGroup(group, tx);
      }

      //Don't overwrite admin (if for some reason admin is sending a confirm)
      if (group.member_ids[new_member] !== 'admin') {
        group.member_ids[new_member] = 1;
      }

      this.app.connection.emit('chat-popup-render-request', group);

      this.sendUpdateGroupTransaction(group, new_member);

      if (tx.isTo(this.publicKey)) {
        siteMessage(
          `${this.app.keychain.returnUsername(new_member)} joined ${
            group.name
          }`,
          3000
        );
      }
    }
  }

  //
  //
  //
  async sendUpdateGroupTransaction(group, target = null) {
    let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(
      group.id
    );
    if (newtx == null) {
      return;
    }

    newtx.msg = {
      module: 'Chat',
      request: 'chat update',
      group_name: group.name,
      group_id: group.id,
      member_ids: group.member_ids
    };

    //
    // These are stripped down objects, much smaller than the original transactions
    // but still (hopefully) compatible with the addTransactionToGroup logic
    //
    if (target) {
      console.log(`Sending ${group.txs.length} last messages to ${target}`);
      newtx.msg.chat_history = group.txs;

      newtx.addTo(target);
    }

    await newtx.sign();

    await this.app.network.propagateTransaction(newtx);

    this.app.connection.emit('relay-send-message', {
      request: 'chat relay',
      recipient: group.members,
      data: newtx.toJson()
    });
  }

  async receiveUpdateGroupTransaction(tx) {
    let txmsg = tx.returnMessage();
    let group = this.returnGroup(txmsg.group_id);

    if (!group) {
      console.warn('Chat group not found');
      return;
    }

    if (tx.isTo(group.id)) {
      console.log('CHAT UPDATE:', txmsg);
      let sender = tx.from[0].publicKey;

      if (group.member_ids[sender] !== 'admin') {
        if (tx.isTo(this.publicKey)) {
          console.log('Accepting info from other group members');
          for (let i in txmsg.member_ids) {
            group.member_ids[i] = txmsg.member_ids[i];
          }
          for (let i in group.member_ids) {
            if (group.member_ids[i] !== -1) {
              if (!group.members.includes(i)) {
                group.members.push(i);
              }
            }
          }
        } else {
          console.log('Non-admin attempting to change the group!');
        }
        return;
      }

      let notice = '';

      if (txmsg.group_name !== group.name) {
        notice += `<div class="saito-chat-notice">
				<span class="saito-mention saito-address" data-id="${sender}">${this.app.keychain.returnUsername(
          sender
        )}</span>
				<span> changed the name of the group to ${txmsg.group_name}</span></div>`;
        group.name = txmsg.group_name;
      }

      for (let i in txmsg.member_ids) {
        let add_member = 0;
        if (txmsg.member_ids[i] !== group.member_ids[i]) {
          if (txmsg.member_ids[i] == 'admin') {
            group.member_ids[i] = 'admin';
            notice += `<div class="saito-chat-notice">
										<span class="saito-mention saito-address" data-id="${sender}">${this.app.keychain.returnUsername(
              sender
            )}</span>
										<span>granted admin rights to </span>
										<span class="saito-mention saito-address" data-id="${i}">${this.app.keychain.returnUsername(
              i
            )}</span>
									  </div>`;
            add_member = 1;
          }
          if (txmsg.member_ids[i] == 1) {
            add_member = 1;
          }
          if (txmsg.member_ids[i] == -1) {
            add_member = -1;
          }

          if (add_member) {
            //change status in member_ids
            group.member_ids[i] = txmsg.member_ids[i];

            if (add_member > 0 && !group.members.includes(i)) {
              //add member
              group.members.push(i);
            } else if (add_member < 0 && group.members.includes(i)) {
              //remove member
              for (let j = 0; j < group.members.length; j++) {
                if (group.members[j] == i) {
                  group.members.splice(j, 1);
                  break;
                }
              }
            }
          }
        }
      }

      console.log('CHAT group update:', group);

      if (notice) {
        tx.msg.message = notice;
        tx.notice = true;
        this.addTransactionToGroup(group, tx);
      }

      if (txmsg.chat_history) {
        for (t of txmsg.chat_history) {
          this.addTransactionToGroup(group, t);
        }
      }

      this.app.connection.emit('chat-popup-render-request', group);
    }
  }

  async sendRemoveMemberTransaction(group, member) {
    let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(
      group.id
    );

    if (newtx == null) {
      return;
    }

    newtx.msg = {
      module: 'Chat',
      request: 'chat remove',
      group_id: group.id,
      member_id: member
    };

    await newtx.sign();

    await this.app.network.propagateTransaction(newtx);
    this.app.connection.emit('relay-send-message', {
      request: 'chat relay',
      recipient: group.members,
      data: newtx.toJson()
    });
  }

  async receiveRemoveMemberTransaction(tx) {
    let txmsg = tx.returnMessage();
    let group = this.returnGroup(txmsg.group_id);

    if (!group) {
      console.warn(`Chat group doesn't exist locally`);
      return;
    }

    if (tx.isTo(group.id)) {
      let sender = tx.from[0].publicKey;

      if (group.member_ids[sender] == 'admin' || sender == txmsg.member_id) {
        for (let i = 0; i < group.members.length; i++) {
          if (group.members[i] == txmsg.member_id) {
            group.members.splice(i, 1);
            break;
          }
        }

        if (this.publicKey == txmsg.member_id) {
          await this.deleteChatGroup(group);
        } else {
          if (tx.isFrom(txmsg.member_id)) {
            group.member_ids[txmsg.member_id] = 0;
            tx.msg.message = `<div class="saito-chat-notice">
													<span class="saito-mention saito-address" data-id="${
                            txmsg.member_id
                          }">${this.app.keychain.returnUsername(
              txmsg.member_id
            )}</span>
													<span>left the group</span></div>`;
          } else {
            group.member_ids[txmsg.member_id] = -1;
            tx.msg.message = `<div class="saito-chat-notice">
													<span class="saito-mention saito-address" data-id="${sender}">${this.app.keychain.returnUsername(
              sender
            )}</span>
													<span> kicked </span>
													<span class="saito-mention saito-address" data-id="${
                            txmsg.member_id
                          }">${this.app.keychain.returnUsername(
              txmsg.member_id
            )}</span>
													<span> out of the group</span>
												</div>`;
          }

          //Flag this as a pseudo chat transaction
          tx.notice = true;
          this.addTransactionToGroup(group, tx);
          this.app.connection.emit('chat-manager-opens-group', group);
          this.app.connection.emit('chat-popup-render-request', group);
        }
      }
    }
  }

  async createChatTransaction(group_id, msg = '', to_keys = []) {
    let newtx = await this.app.wallet.createUnsignedTransaction(
      this.publicKey,
      BigInt(0),
      BigInt(0)
    );
    if (newtx == null) {
      console.error('Null tx created for chat');
      return null;
    }

    // sanity check
    let wallet_balance = await this.app.wallet.getBalance('SAITO');

    // restrict radix-spam
    if (
      wallet_balance == 0 &&
      this.communityGroup?.id == group_id &&
      this.app.BROWSER == 1 &&
      this.app.browser.stripHtml(msg).length >= 1000
    ) {
      siteMessage(
        'Insufficient SAITO to Send Large Messages in Community Chat...',
        3000
      );
      return null;
    }

    let secret_holder = '';

    let group = this.returnGroup(group_id);
    let members = this.returnMembers(group_id);

    if (group?.member_ids) {
      //
      // watch key-based groups just need to address to the group public key
      //
      newtx.addTo(group_id);
    } else {
      //
      // otherwise, send to every member of group, which is typically 1 person
      //
      for (let i = 0; i < members.length; i++) {
        // for encrypted dms, who is the other person i am dm-ing
        if (members[i] !== this.publicKey) {
          secret_holder = members[i];
        }

        newtx.addTo(members[i]);
      }
    }

    //
    // Make sure tx is addressed to anyone with a special mention/notification
    //
    for (let mention of to_keys) {
      if (!members.includes(mention)) {
        newtx.addTo(mention);
      }
    }

    //
    // create chat message
    //
    newtx.msg = {
      module: 'Chat',
      request: 'chat message',
      group_id: group_id,
      message: msg,
      timestamp: new Date().getTime(),
      mentioned: to_keys
    };

    //
    // add name (?) -- TO DO -- clean up the old code for managing dynamic naming
    //
    if (group) {
      if (!members.includes(group.name)) {
        newtx.msg.group_name = group.name;
      }
    }

    // DMs
    if (members.length == 2 && !group?.member_ids) {
      //console.log('Chat: Try encrypting Message for ' + secret_holder);

      //
      // Only encrypts if we have swapped keys and haveSharedKey, otherwise just signs
      //
      newtx = await this.app.wallet.signAndEncryptTransaction(
        newtx,
        secret_holder
      );
    } else {
      await newtx.sign();
    }

    ////////////////
    // Send it here
    ////////////////

    if (msg.substring(0, 4) == '<img') {
      if (this.inTransitImageMsgSig) {
        salert('Image already being sent');
        return;
      }
      this.inTransitImageMsgSig = newtx.signature;
    }

    await this.app.network.propagateTransaction(newtx);

    this.app.connection.emit('relay-send-message', {
      recipient: group.members,
      request: 'chat relay',
      data: newtx.toJson()
    });

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

    let txmsg = '';

    try {
      if (tx.decryptMessage) {
        await tx.decryptMessage(this.app);
      }
      if (tx.returnMessage) {
        txmsg = tx.returnMessage();
      } else {
        txmsg = tx.msg;
      }
    } catch (err) {
      console.log('ERROR: ' + JSON.stringify(err));
    }

    if (this.debug) {
      console.log('Receive Chat Transaction: ', onchain);
      // console.log(JSON.parse(JSON.stringify(tx)));
      //console.log(JSON.parse(JSON.stringify(txmsg)));
    }


    if (this.app.modules.moderate(tx) == -1) {
      console.log('Refuse chat message from blocked account');
      return;
    }

    //
    // save transactions if getting chat tx over chain
    // and only trigger if you were the sender
    // (should less the duplication effect)
    //
    if (onchain) {
      if (this.app.BROWSER) {
        if (tx.isFrom(this.publicKey)) {
          //console.log("Save My Sent Chat TX");
          await this.app.storage.saveTransaction(tx, {
            field3: txmsg.group_id
          });
        }
      }
    }

    let group = this.returnGroup(txmsg.group_id);

    if (!group) {
      if (!tx.isTo(this.publicKey)) {
        if (this.debug) {
          console.log('Chat message not for me');
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

      group = this.returnOrCreateChatGroupFromMembers(
        members,
        txmsg.group_name
      );
      group.id = txmsg.group_id;
    }

    if (group?.member_ids) {
      let sender = tx.from[0].publicKey;
      if (group.member_ids[sender] == -1) {
        console.log('Refuse chat message from banned account');
        return;
      } else if (!group.member_ids[sender]) {
        //fall back for adding group members to my list based on them chatting
        group.member_ids[sender] = 1;
      }

      if (!group.members.includes(sender)) {
        group.members.push(sender);
      }
    }


    //Have we already inserted this message into the chat?
    for (let z = 0; z < group.txs.length; z++) {
      if (group.txs[z].signature === tx.signature) {
        return;
      }
    }

    if (this.addTransactionToGroup(group, tx)) {

      //
      // Just a little warning that it isn't nice to @ people if you blocked them and they cannot reply
      //
      if (tx.isFrom(this.publicKey)) {
        for (let i = 0; i < tx.to.length; i++) {
          let key = tx.to[i].publicKey;
          if (this.app.modules.moderateAddress(key) == -1 && !this.communityGroup.members.includes(key)) {
            let new_message = `<div class="saito-chat-notice">
							<span class="saito-mention saito-address" data-id="${key}">${this.app.keychain.returnUsername(
              key
            )}</span>
							<span> is blocked and cannot respond </span>
						</div>`;

            group.txs.push({
              signature: tx.signature + '1',
              timestamp: new Date().getTime(),
              from: [],
              msg: new_message,
              mentioned: [],
              notice: true,
              likes: 0,
              liked_by: {}
            });
          }
        }
      }
    }

    this.app.connection.emit('chat-popup-render-request', group);
  }

  //////////////////
  // UI Functions //
  //////////////////
  //
  // These three functions replace all the templates to format the messages into
  // single speaker blocks
  //
  returnChatBody(group_id) {
    let chat_self = this;
    let html = '';
    let group = this.returnGroup(group_id);
    if (!group) {
      return '';
    }
    let message_blocks = this.createMessageBlocks(group);

    let new_message_flag = false;

    for (let block of message_blocks) {
      let ts = 0;
      if (block?.date) {
        html += `<div class="saito-time-stamp">${block.date}</div>`;
      } else if (block?.notice) {
        html += `<div class="saito-time-stamp">${block.notice}</div>`;
      } else {
        if (block.length > 0) {
          let sender = '';
          let msg = '';
          for (let z = 0; z < block.length; z++) {
            ts = ts || block[z].timestamp;
            sender = block[z].from[0];

            // replace @mentions with saito treated address
            block[z].msg = chat_self.app.browser.markupMentions(block[z].msg);

            // Get my like status
            let liked = '';
            let like_number;
            this.groups.forEach((group) => {
              group.txs.forEach((tx) => {
                if (tx.signature === block[z].signature) {
                  if (!tx.liked_by) tx.liked_by = {};
                  if (!tx.likes) tx.likes = 0;
                  if (tx.liked_by[this.publicKey] === true) {
                    liked = 'liked';
                  }
                  like_number = tx.likes;
                }
              });
            });

            const replyButton = `
						 	<div data-id="${block[z].signature}" data-href="${
              sender + ts
            }" class="saito-userline-reply">
							<div class="chat-like chat-message-action"><i class="fas fa-thumbs-up  ${liked}"></i> </div> 
		                  <div class="chat-copy chat-message-action"><i class="fas fa-copy"></i></div>
		                  <div class="chat-reply chat-message-action"><i class="fas fa-reply"></i></div>
		                  <div class="saito-chat-line-timestamp">
		                    <span>${this.app.browser.returnTime(ts)}</span>
		                  </div>
		               </div>`;

            msg += `<div class="chat-message-line message-${block[z].signature}`;
            if (block[z]?.flag_message) {
              msg += ' user-mentioned-in-chat-line';
            }
            if (new_message_flag) {
              msg += ' new-message';
            }
            msg += `">`;
            if (block[z].msg.indexOf('<img') != 0) {
              let saniText = this.app.browser.sanitize(block[z].msg, true);
              if (saniText.includes("\n")){
                msg += saniText.split("\n").join("<br>");
              }else{
                msg += saniText;  
              }
            } else {
              msg += block[z].msg.substring(0, block[z].msg.indexOf('>') + 1);
            }
            msg +=
              like_number > 0
                ? `<div class="chat-likes"> <i class="fas fa-thumbs-up"></i><div class="chat-like-number">${like_number}</div> </div>`
                : `<div></div>`;
            msg += `${replyButton}</div>`;

            if (
              group?.last_read_message &&
              block[z].signature == group.last_read_message &&
              group.unread > 0
            ) {
              console.log('Mark remaining messages as new!');
              new_message_flag = true;
            }
          }

          //Use FA 5 so compatible in games (until we upgrade everything to FA6)
          html += `${SaitoUserTemplate({
            app: this.app,
            publicKey: sender,
            notice: msg,
            fourthelem: '',
            id: sender + ts
          })}`;
        }
      }
    }

    if (!html) {
      html = `<div class="saito-time-stamp">say hello</div>`;
    }

    group.mentioned = false;

    //Save the status that we have read these messages
    this.saveChatGroup(group);

    return html;
  }

  createMessageBlocks(group) {
    let blocks = [];
    let block = [];
    let last_message_sender = '';
    let last_message_ts = 0;
    let last = new Date(0);

    for (let minimized_tx of group?.txs) {
      //Same Sender -- keep building block
      let next = new Date(minimized_tx.timestamp);

      if (minimized_tx?.notice) {
        if (block.length > 0) {
          blocks.push(block);
          block = [];
        }
        blocks.push({ notice: minimized_tx.msg });

        last_message_sender = '';
        continue;
      }

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
            blocks.push({ date: 'Today' });
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

    if (block.length > 0) {
      blocks.push(block);
    }

    return blocks;
  }

  //
  //
  //
  addTransactionToGroup(group, tx, historic = false) {
    // Limit live memory
    // I may be overly worried about memory leaks
    // If users can dynamically load older messages, this limit creates a problem
    // when scrolling back in time
    if (!this.app.BROWSER) {
      while (group.txs.length > 200) {
        group.txs.shift();
      }
    }

    let txmsg = tx.msg;
    try {
      txmsg = tx.returnMessage();
    } catch (err) {}

    if (this.debug) {
      // console.log('Adding Chat TX to group: ', txmsg);
    }

    let content = txmsg.message || txmsg;
    let mentions = txmsg?.mentioned || tx?.mentioned || [];

    if (!content || typeof content !== 'string') {
      //console.warn('Not a chat message?');
      //console.log(tx);
      return 0;
    }
    let new_message = {
      signature: tx.signature,
      timestamp: tx.timestamp,
      from: [],
      msg: content,
      mentioned: mentions,
      likes: 0,
      liked_by: {}
    };

    if (!historic && group.last_update > new_message.timestamp){
      console.log("Fake the timestamp so chats don't rearrange...");
      new_message.timestamp = group.last_update + 1;
    }

    if (tx?.notice) {
      new_message.notice = tx.notice;
    }

    // Need to rewrite this!!!
    if (this.app.BROWSER && new_message.mentioned.includes(this.publicKey)) {
      console.log('CHAT MESSAGE DIRECTED TO ME!!!!');
      group.mentioned = true;
      new_message.flag_message = true;
    }

    //Keep the from array just in case....
    for (let sender of tx.from) {
      let key = sender?.publicKey || sender;
      if (!new_message.from.includes(key)) {
        new_message.from.push(key);
      }
    }

    let insertion_index = 0;
    for (let i = 0; i < group.txs.length; i++) {
      if (group.txs[i].signature === tx.signature) {
        if (this.debug) {
          console.log('duplicate');
        }
        return 0;
      }
      if (new_message.timestamp < group.txs[i].timestamp) {
        if (this.debug) {
          console.log('out of order ' + i);
          console.log(JSON.parse(JSON.stringify(new_message)));
        }
        break;
      }
      insertion_index++;
    }

    if (!new_message.from.includes(this.publicKey)) {
      group.unread++;
    } else {
      group.last_read_message = tx.signature;
    }

    //Handle new messages (possibly out of order)

    group.txs.splice(insertion_index, 0, new_message);

    group.last_update = Math.max(group.last_update, new_message.timestamp);

    if (!this.app.BROWSER) {
      return 0;
    }

    if (this.debug) {
      console.log(`new msg: ${group.unread} unread`);
      console.log(JSON.parse(JSON.stringify(new_message)));
    }

    if (!new_message.from.includes(this.publicKey)) {
      //Flash new message in browser tab
      if (!group.muted) {
        this.notification(group);

        // Flag the group that there is a new message
        // This is so we can add an animation effect on rerender
        // and will be reset there
        //
        group.notification = true;
      }

      //Add liveness indicator to group
      this.app.connection.emit('group-is-active', group);
    }

    //Save to IndexedDB Here
    if (this.loading <= 0) {
      this.saveChatGroup(group);
    } else {
      console.warn(`Not saving because in loading mode (${this.loading})`);
    }

    return 1;
  }

  // /**
  //  * Asynchronously creates a "like" transaction for a chat message.
  //  *
  //  */
  async createChatLikeTransaction(group, signature, mentioned) {
    let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();

    if (newtx == null) {
      console.error('Chat: Failed to create a new transaction');
      return null;
    }

    if (mentioned) {
      console.log('ADDRESS TO: ', mentioned);
      newtx.addTo(mentioned);
    }

    if (group?.member_ids) {
      newtx.addTo(group.id);
    } else {
      for (let i = 0; i < group.members.length; i++) {
        newtx.addTo(group.members[i]);
      }
    }

    newtx.msg = {
      module: 'Chat',
      request: 'chat like',
      group_id: group.id,
      sender: this.publicKey,
      signature,
      mentioned
    };

    await newtx.sign();

    await this.app.network.propagateTransaction(newtx);

    this.app.connection.emit('relay-send-message', {
      recipient: group.members,
      request: 'chat relay',
      data: newtx.toJson()
    });

    return newtx;
  }

  /**
   * Asynchronously handles the receipt of a "like" transaction.
   */
  async receiveChatLikeTransaction(tx) {
    const { group_id, signature, sender } = tx.returnMessage();

    const group = this.returnGroup(group_id);

    if (!group) {
      console.warn('Chat: Group not found for the given group ID');
      return;
    }

    group.txs.forEach((transaction) => {
      if (transaction.signature === signature) {
        transaction.liked_by = transaction.liked_by || {};
        transaction.likes = transaction.likes || 0;
        if (transaction.liked_by[sender]) {
          transaction.likes--;
          transaction.liked_by[sender] = false;
        } else {
          transaction.likes++;
          transaction.liked_by[sender] = true;
        }
      }
    });

    this.app.connection.emit('chat-popup-render-request', group);
  }

  ///////////////////
  // CHAT UTILITIES //
  ///////////////////
  createGroupIdFromMembers(members = null) {
    if (members == null) {
      return '';
    }

    let clean_array = [];
    for (let member of members) {
      clean_array.push(member);
    }
    //So David + Richard == Richard + David
    clean_array.sort();

    return this.app.crypto.hash(`${clean_array.join('_')}`);
  }

  //
  // if we already have a group with these members,
  // returnOrCreateChatGroupFromMembers will find and return it, otherwise
  // it makes a new group
  //
  returnOrCreateChatGroupFromMembers(
    members = null,
    name = null,
    update_name = true
  ) {
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

    if (!id) {
      console.warn('Chat error: ', members);
      console.trace();
    }

    if (name == null) {
      name = '';
      for (let i = 0; i < members.length; i++) {
        if (members[i] != this.publicKey) {
          name += members[i] + ', ';
        }
      }
      if (!name) {
        name = 'me';
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

    this.app.connection.emit('chat-manager-render-request');

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
        if (this.groups[i].member_ids) {
          let members = [];
          for (let m of this.groups[i].members) {
            if (!members.includes(m)) {
              if (
                this.groups[i].member_ids[m] == 'admin' ||
                this.groups[i].member_ids[m] == 1
              ) {
                members.push(m);
              }
            }
          }
          return members;
        } else {
          return [...new Set(this.groups[i].members)];
        }
      }
    }
    return [];
  }

  returnGroupByName(name = '') {
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
        this.returnOrCreateChatGroupFromMembers(
          [keys[i].publicKey],
          keys[i].name,
          false
        );
      }
    }

    this.app.connection.emit('chat-manager-render-request');
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
      { field3: group_id, limit: 25, created_earlier_than: ts },
      async (txs) => {
        console.log(`Fetched ${txs?.length} older chat messages from Archive`);

        if (!txs || txs.length < 25) {
          this.app.connection.emit(
            'chat-remove-fetch-button-request',
            group_id
          );
        }

        if (txs) {
          while (txs.length > 0) {
            //Process the chat transaction like a new message
            let tx = txs.pop();
            await tx.decryptMessage(chat_self.app);
            chat_self.addTransactionToGroup(group, tx, true);
            chat_self.app.connection.emit('chat-popup-render-request', group);
            chat_self.app.connection.emit(
              'chat-popup-scroll-top-request',
              group_id
            );
          }
        }
      },
      peer
    );
  }

  ///////////////////
  // LOCAL STORAGE //
  ///////////////////
  loadOptions() {
    //Enforce compliance with wallet indexing
    if (!this.app.options?.chat) {
      this.app.options.chat = {};
      this.app.options.chat.groups = [];
    } else if (Array.isArray(this.app.options.chat)) {
      let newObj = {
        groups: this.app.options.chat
      };
      this.app.options.chat = newObj;
    } else {
      if (
        this.app.options.chat.audio_notifications !== 'undefined' &&
        this.app.options.chat.audio_notifications !== false
      ) {
        this.audio_notifications = this.app.options.chat.audio_notifications;
      }

      if (this.app.options.chat?.audio_chime) {
        this.audio_chime = this.app.options.chat?.audio_chime;
      }

      delete this.app.options.chat.enable_notifications;

      this.auto_open_community = this.app.options.chat?.auto_open_community;
      if (this.app.options.chat?.black_list) {
        this.black_list = this.app.options.chat.black_list;
      }
    }

    if (this.app.options.chat.groups?.length == 0) {
      this.createDefaultChatsFromKeys();
    }

    this.app.storage.saveOptions();
  }

  saveOptions() {
    this.app.options.chat.audio_notifications = this.audio_notifications;
    this.app.options.chat.audio_chime = this.audio_chime;
    this.app.options.chat.auto_open_community = this.auto_open_community;
    this.app.options.chat.black_list = this.black_list;
    this.app.storage.saveOptions();
  }

  async loadChatGroups() {
    if (!this.app.BROWSER) {
      return;
    }

    let chat_self = this;
    //console.log("Reading local DB");
    let count = 0;
    for (let g_id of this.app.options.chat.groups) {

      let value = await this.app.storage.getLocalForageItem(`chat_${g_id}`);
      if (value) {
        let currentGroup = chat_self.returnGroup(g_id);
        if (currentGroup) {
          value.members = currentGroup.members;
          currentGroup = Object.assign(currentGroup, value);
        } else {
          chat_self.groups.push(value);
        }

        currentGroup = chat_self.returnGroup(g_id);
        if (!currentGroup?.last_read_message) {
          if (currentGroup.txs.length > 0) {
            currentGroup.last_read_message =
              currentGroup.txs.slice(-1)[0].signature;
          }
        }

        //console.log(value);
      }
    }
    this.createDefaultChatsFromKeys();
  }

  saveChatGroup(group) {
    if (!this.app.BROWSER || !group?.id) {
      return;
    }
    let chat_self = this;

    //Save group in app.options
    if (!this.app.options.chat.groups.includes(group.id)) {
      this.app.options.chat.groups.push(group.id);
    }

    this.saveOptions();

    let online_status = group.online;

    //Make deep copy
    let new_group = JSON.parse(JSON.stringify(group));
    new_group.online = false;
    new_group.txs = group.txs.slice(-50);
    //Don't save the stun-specified target container
    if (new_group.target_container) {
      delete new_group.target_container;
    }

    this.app.storage.setLocalForageItem(`chat_${group.id}`, new_group);
    group.online = online_status;
  }

  async deleteChatGroup(group = null) {
    if (!group) {
      return;
    }

    this.app.connection.emit('chat-popup-remove-request', group);

    let key_to_update = '';
    for (let i = 0; i < this.groups.length; i++) {
      if (this.groups[i].id === group.id) {
        if (this.groups[i].members.length == 2 && !this.groups[i]?.member_ids) {
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

    this.saveOptions();

    if (key_to_update) {
      this.app.keychain.addKey(key_to_update, { mute: 1 });
    }

    await this.app.storage.removeLocalForageItem(`chat_${group.id}`);

    this.app.connection.emit('chat-manager-render-request');
  }

  generateChatGroupLink(group) {
    let obj = {
      id: group.id,
      name: group.name,
      sender: this.publicKey
    };

    for (let mem of group.members) {
      if (group.member_ids[mem] == 'admin') {
        obj.admin = mem;
        break;
      }
    }

    let base64obj = this.app.crypto.stringToBase64(JSON.stringify(obj));

    let link = window.location.origin + '/chat?chat_id=' + base64obj;
    navigator.clipboard.writeText(link);
    siteMessage('Link Copied', 2000);
  }


  webServer(app, expressapp, express) {
    let webdir = `${__dirname}/../../mods/${this.dirname}/web`;
    let mod_self = this;

    expressapp.get(
      '/' + encodeURI(this.returnSlug()),
      async function (req, res) {
        let reqBaseURL = req.protocol + '://' + req.headers.host + '/';

        mod_self.social.url = reqBaseURL + encodeURI(mod_self.returnSlug());

	if (!res.finished) {
        	res.setHeader('Content-type', 'text/html');
        	res.charset = 'UTF-8';
        	return res.send(HomePage(app, mod_self, app.build_number, mod_self.social));
	}
	return;

      }
    );

    expressapp.use('/' + encodeURI(this.returnSlug()), express.static(webdir));
  }

  notification(group) {
    /*Send System notification
			if (this.enable_notifications && !group.muted) {
				let sender = this.app.keychain.returnIdentifierByPublicKey(
					new_message.from[0],
					true
				);
				if (group.unread > 1) {
					sender += ` (${group.unread})`;
				}
				let new_msg =
					content.indexOf('<img') == 0
						? '[image]'
						: this.app.browser.sanitize(content);
				const regex = /<blockquote>.*<\/blockquote>/is;
				new_msg = new_msg.replace(regex, 'reply: ').replace('<br>', '');
				const regex2 = /<a[^>]+>/i;
				new_msg = new_msg.replace(regex2, '').replace('</a>', '');

				this.app.browser.sendNotification(
					sender,
					new_msg,
					`chat-message-${group.id}`
				);
			}*/

    if (group.muted) {
      return;
    }

    // If we don't have chat enabled, don't chime!
    if (!this.chat_manager) {
      return;
    }

    this.app.browser.createTabNotification('New Message', group.name);

    if (!this.audio_notifications) {
      return;
    }

    if (!this.app.browser.active_tab) {
      this.playChime();
      return;
    } else if (this.audio_notifications === 'tabs') {
      return;
    }

    if (
      this.audio_notifications == 'groups' &&
      this.chat_manager.popups[group.id]?.is_rendered
    ) {
      return;
    }

    this.playChime();
  }

  playChime() {
    if (this.beeping) {
      console.log('Block multiple chimes');
      return;
    }

    this.beeping = setTimeout(() => {
      this.beeping = null;
    }, 1000);

    try {
      this.chime.play();
    } catch (err) {
      console.error(err);
    }
  }

}

module.exports = Chat;
