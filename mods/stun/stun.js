const saito = require("../../lib/saito/saito");
const ModTemplate = require("../../lib/templates/modtemplate");
<<<<<<< HEAD
var serialize = require("serialize-javascript");
const StunAppspace = require("./lib/appspace/main");
const ChatManagerLarge = require("./lib/components/chat-manager-large");
const ChatManagerSmall = require("./lib/components/chat-manager-small");
const InviteOverlay = require("./lib/components/invite-overlay");
const StunxGameMenu = require("./lib/game-menu/main");
const ChatInvitationLink = require("./lib/overlays/chat-invitation-link");
const Relay = require("../relay/relay");
const adapter = require("webrtc-adapter");
const PeerManager = require("./lib/components/PeerManager");
const ChatSetting = require("./lib/components/chat-setting");

class Stun extends ModTemplate {
  constructor(app, mod) {
    super(app);
    this.appname = "Video Call";
    this.name = "Stun";
    this.slug = this.returnSlug();
    this.description = "Dedicated Video Chat Module";
    this.categories = "Video Call";
    this.app = app;
    this.appspaceRendered = false;
    this.remoteStreamPosition = 0;
    this.peer_connections = {};
    this.videoMaxCapacity = 5;
    this.ChatManagerLarge = new ChatManagerLarge(app, this);
    this.ChatManagerSmall = new ChatManagerSmall(app, this);
    this.InviteOverlay = new InviteOverlay(app, this);
    this.icon = "fas fa-video";
    this.localStream = null;
    this.hasRendered = true;
    this.chatType = null;
    this.central = false;
    this.peer_connections = {};
    this.peer_connection_states = {};
    this.stunGameMenu = new StunxGameMenu(app, this);
    this.current_step = 0;
    this.gotten_keys = false;
    this.commands = [];
    this.rooms = new Map();
    this.chatSetting = new ChatSetting(app, mod);
    // this.receiving_from = {}
=======
const StunLauncher = require("./lib/appspace/call-launch");
const CallInterfaceVideo = require("./lib/components/call-interface-video");
const CallInterfaceAudio = require("./lib/components/call-interface-audio");
const PeerManager = require("./lib/appspace/PeerManager");

//Do these do anything???
var serialize = require("serialize-javascript");
const adapter = require("webrtc-adapter");

class Stun extends ModTemplate {
  constructor(app) {
    super(app);
    this.app = app;
    this.appname = "Video Call";
    this.name = "Stun";
    this.slug = this.returnSlug();
    this.description = "P2P Video & Audio Connection Module";
    this.categories = "Utilities Communications";
    this.icon = "fas fa-video";


    this.request_no_interrupts = true; // Don't let chat popup inset into /videocall
    this.rooms = new Map();
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0

    this.servers = [
      {
        urls: "stun:stun-sf.saito.io:3478",
      },
      {
        urls: "turn:stun-sf.saito.io:3478",
        username: "guest",
        credential: "somepassword",
      },
      {
        urls: "stun:stun-sg.saito.io:3478",
      },
      {
        urls: "turn:stun-sg.saito.io:3478",
        username: "guest",
        credential: "somepassword",
      },
      {
        urls: "stun:stun-de.saito.io:3478",
      },
      {
        urls: "turn:stun-de.saito.io:3478",
        username: "guest",
        credential: "somepassword",
      },
    ];

    this.styles = ["/saito/saito.css", "/videocall/style.css"];

<<<<<<< HEAD
    app.connection.on("stun-send-message-to-server", async (data) => {
      await this.sendStunMessageToServerTransaction(data);
    });

    app.connection.on("stun-init-peer-manager", (ui_type, config) => {
      // console.log("config", config);
      if (!this.peerManager) {
        this.peerManager = new PeerManager(app, mod, ui_type, config);
      }

      if (ui_type === "large") {
        this.peerManager.showSetting();
      }
    });
=======
    //When StunLauncher is rendered or game-menu triggers it
    app.connection.on("stun-init-peer-manager", (ui_type = "large") => {

      console.log("Init PeerManager and Set UI to " + ui_type);

      if (this.CallInterface){
        console.warn("Already instatiated a video/audio call manager");
        return;
      }

      if (!this.peerManager) {
        //Create the PeerManager, which includes listeners for events
        this.peerManager = new PeerManager(app, this);
      }

      this.ui_type = ui_type;

      if (ui_type === "large") {
        this.CallInterface = new CallInterfaceVideo(app, this);
      }else{
        this.CallInterface = new CallInterfaceAudio(app, this);        
      }
    });

>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
  }

  onPeerHandshakeComplete(app, peer) {
    if (app.BROWSER !== 1) {
      return;
    }
<<<<<<< HEAD
    if (!this.video_chat_loaded) {
      if (app.browser.returnURLParameter("stun_video_chat")) {
        let room_obj = JSON.parse(
          app.crypto.base64ToString(app.browser.returnURLParameter("stun_video_chat"))
        );

        // JOIN THE ROOM
        let stun_self = app.modules.returnModule("Stun");
        stun_self.renderInto("body");

        let interval = setInterval(() => {
          if (document.readyState === "complete") {
            let room_code = room_obj.room_code;
            // stun_self.peerManager = new PeerManager(app, stun_self, room_code);
            // stun_self.peerManager.showSetting(true);
            app.connection.emit("stun-to-join-room", true, room_code);
            clearInterval(interval);
          }
        }, 500);
      }
    }

    this.video_chat_loaded = 1;
  }

=======

    if (app.browser.returnURLParameter("stun_video_chat")) {
      let room_obj = JSON.parse(
        app.crypto.base64ToString(app.browser.returnURLParameter("stun_video_chat"))
      );

      // JOIN THE ROOM
      if (this.browser_active){
        this.renderInto("body");  
      }else{
        this.renderInto(".saito-overlay");  
      }
      
      app.connection.emit("stun-to-join-room", room_obj.room_code);
    }
  }

  /**
   * Stun will be rendered on
   *  - /videocall
   *  - Saito-header menu
   *  - Saito-user-menu
   *  - game-menu options
   *
   * This will trigger a "stun-init-peer-manager" event that leads to the creation of PeerManager
   */
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
  render() {
    this.renderInto("body");
  }

  canRenderInto(qs) {
    if (qs === ".saito-overlay") {
      return true;
    }
    return false;
  }

  renderInto(qs) {
    if (qs == ".saito-overlay") {
      if (!this.renderIntos[qs]) {
        this.renderIntos[qs] = [];
<<<<<<< HEAD
        this.renderIntos[qs].push(new StunAppspace(this.app, this, qs));
=======
        this.renderIntos[qs].push(new StunLauncher(this.app, this, qs));
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
      }
      this.attachStyleSheets();
      this.renderIntos[qs].forEach((comp) => {
        comp.render();
      });
      this.renderedInto = qs;
    }
    if (qs == "body") {
      if (!this.renderIntos[qs]) {
        this.renderIntos[qs] = [];
<<<<<<< HEAD
        this.renderIntos[qs].push(new StunAppspace(this.app, this, qs));
=======
        this.renderIntos[qs].push(new StunLauncher(this.app, this, qs));
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
      }
      this.attachStyleSheets();
      this.renderIntos[qs].forEach((comp) => {
        comp.render();
      });
      this.renderedInto = "body";
    }
  }

<<<<<<< HEAD
  async respondTo(type) {
    if (type === "invite") {
      // this.styles = [`/stun/style.css`,];
      await super.render(this.app, this);
      return new StunxInvite(this.app, this);
    }
    if (type === "saito-header") {
      return [
        {
          text: "Video Call",
          icon: this.icon,
          callback: function (app, id) {
            let stun_self = app.modules.returnModule("Stun");
            stun_self.renderInto(".saito-overlay");
          },
        },
      ];
    }
    if (type == "game-menu") {
      // this.styles = [`/${this.returnSlug()}/css/style.css`,];

      await super.render(this.app, this);
      return {
        id: "game-chat",
        text: "Video Chat",
        submenus: [
          {
            text: "Start call",
            id: "start-group-video-chat",
            class: "start-group-video-chat",
            callback: function (app, game_mod) {
              if (game_mod.game.players.length > 1) {
                let stun_self = app.modules.returnModule("Stun");
                stun_self.attachStyleSheets();
                app.connection.emit("game-menu-start-video-call", [...game_mod.game.players]);
              }
            },
          },
          {
            text: "Join call",
            id: "join-group-video-chat",
            class: "join-group-video-chat",
            callback: function (app, game_mod) {
              let stun_self = app.modules.returnModule("Stun");
              app.connection.emit("game-menu-join-video-call", {
                room_code: stun_self.game_room_code,
              });
            },
          },
          // game_mod.game.player.map(player => (
          //     {
          //         text: `Player ${player}`,
          //         id: `${player}-video-chat`,
          //         class: `${player}-video-chat`,
          //         callback: function (app, game_mod) {
          //              //

          //         },
          //     }
          // )),
        ],
      };
=======
  respondTo(type, obj) {
    let stun_self = this;

    if (type === "invite") {
      this.attachStyleSheets();
      super.render(this.app, this);
      return new StunxInvite(this.app, this);
    }
    if (type === "saito-header") {
      this.attachStyleSheets();
      super.render(this.app, this);

      return [
        {
          text: "Video Call",
          icon: this.icon,
          allowed_mods: ["redsquare", "arcade"],
          callback: function (app, id) {
            stun_self.renderInto(".saito-overlay");
          },
        },
      ];
    }
    //
    //Game-Menu passes the game_mod as the obj, so we can test if we even want to add the option
    //
    if (type == "game-menu") {
      this.attachStyleSheets();
      super.render(this.app, this);
      if (obj?.game?.players?.length > 1) {
        return {
          id: "game-chat",
          text: "Video Chat",
          submenus: [
            {
              text: "Start call",
              id: "start-group-video-chat",
              class: "start-group-video-chat",
              callback: function (app, game_mod) {
                //Start Call          
                stun_self.establishStunCallWithPeers("voice", [...game_mod.game.players]);
              },
            },
          ],
        };
      }
    }

    if (type === "user-menu") {
      if (obj?.publickey) {
        if (obj.publickey !== this.app.wallet.returnPublicKey()) {
          this.attachStyleSheets();
          super.render(this.app, this);
          return [
            {
              text: "Video/Audio Call",
              icon: "fas fa-video",
              callback: function (app, public_key) {
                //stun_self.renderInto(".saito-overlay");
                //salert("You still need to send an invitation link to the call (after you start it)");
                stun_self.establishStunCallWithPeers("large", [public_key]);
              },
            },
          ];
        }
      }
    }

    return null;
  }

  onConfirmation(blk, tx, conf, app) {
    let txmsg = tx.returnMessage();

    if (conf === 0) {
      if (txmsg.module === "Stun") {
        //
        // Do we even need/want to send messages on chain?
        // There are problems with double processing events...
        //
        if (app.BROWSER === 1) {
          if (txmsg.request === "stun-send-message-to-peers") {
            console.log("onConf: stun-send-message-to-peers");
            this.receiveStunMessageToPeersTransaction(app, tx);
          }
        }
      }
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    }
  }

<<<<<<< HEAD
    if (type === "user-menu") {
      this.styles = [`/${this.returnSlug()}/style.css`];
      this.attachStyleSheets();
      await super.render(this.app, this);
      return [
        {
          text: "Video/Audio Call",
          icon: "fas fa-video",
          callback: function (app, public_key) {
            app.connection.emit("game-start-video-call", public_key);
          },
        },
      ];
    }

    if (type === "saito-header") {
      let m = [
        {
          text: "Video Call",
          icon: this.icon,
          allowed_mods: ["redsquare", "arcade"],
          callback: function (app, id) {
            let pub_key = app.wallet.publicKey;
            app.connection.emit("game-start-video-call", pub_key);
          },
        },
      ];
      return m;
    }
    return null;
  }

  onConfirmation(blk, tx, conf) {
    let txmsg = tx.returnMessage();

    if (conf === 0) {
      if (txmsg.module === "Stun") {
        // if (txmsg.request === "stun media channel offer") {
        //     this.receiveMediaChannelOfferTransaction(app, tx)
        // }
        // if (txmsg.request === "stun data channel offer") {
        //     this.receiveDataChannelOfferTransaction(app, tx)
        // }
        // if (txmsg.request === "stun media channel answer") {
        //     this.receiveMediaChannelAnswerTransaction(app, tx)
        // }
        // if (txmsg.request === "stun data channel answer") {
        //     this.receiveDataChannelAnswerTransaction(app, tx)
        // }
        // if (txmsg.request === "stun notifcation transmission request") {
        //     this.receiveMediaChannelNotificationTransaction(app, tx)
        // }
        // if (txmsg.request === "stun key update") {
        //     this.receiveKeyUpdateTransaction(app, tx)
        // }
        // if (txmsg.request === "receive room code") {
        //     this.receiveRoomCodeTransaction(app, tx)
        // }
        // if (txmsg.request === "stun command transmission request") {
        //     this.receiveCommandToPeerTransaction(app, tx, conf, blk)
        // }
      }
    }
  }

  async handlePeerTransaction(app, tx = null, peer, mycallback) {
    if (tx == null) {
      return;
    }
    let txmsg = tx.returnMessage();

    if (app.BROWSER === 0) {
      if (txmsg.request === "stun-create-room-transaction") {
        let stun_mod = app.modules.returnModule("Stun");
        await stun_mod.receiveCreateRoomTransaction(app, tx);
      }
      if (txmsg.request === "stun-send-message-to-server") {
        let stun_mod = app.modules.returnModule("Stun");
        await stun_mod.receiveStunMessageToServerTransaction(app, tx, peer);
      }
    }

    if (app.BROWSER === 1) {
      if (txmsg.request === "stun-send-message-to-peers") {
        let stun_mod = app.modules.returnModule("Stun");
        stun_mod.receiveStunMessageToPeersTransaction(app, tx);
      }
      if (txmsg.request === "stun-send-game-call-message") {
        // console.log("receiving");
        let stun_mod = app.modules.returnModule("Stun");
        await stun_mod.receiveGameCallMessageToPeers(app, tx);
      }
    }
    await super.handlePeerTransaction(app, tx, peer, mycallback);
  }

  async sendCreateRoomTransaction(room_code) {
    let newtx = this.publicKey;

    let _data = {
      public_key: this.publicKey,
      room_code,
    };
    let request = "stun-create-room-transaction";
    let peers = await this.app.network.getPeers();
    let server = peers[0];

    // offchain data
    let data = {
      request,
      data: _data,
    };

    this.app.connection.emit("relay-send-message", {
      recipient: server.publicKey,
      request,
      data,
    });

    // server.sendRequestAsTransaction("stun-create-room-transaction", data);
  }

  // server receives this
  async receiveCreateRoomTransaction(app, tx) {
    let txmsg = tx.returnMessage();
    let stun_mod = app.modules.returnModule("Stun");

    let room_code = txmsg.data.data.room_code;
    let public_key = txmsg.data.data.public_key;
    stun_mod.addRoom(room_code);
    stun_mod.addKeyToRoom(room_code, public_key);
  }

  async sendStunMessageToServerTransaction(_data) {
    let request = "stun-send-message-to-server";
    let peers = await this.app.network.getPeers();
    let server = peers[0];

    // console.log('server public key', server, server.publicKey)

    // offchain data
    let data = {
      request,
      data: _data,
    };

    this.app.connection.emit("relay-send-message", {
      recipient: server.publicKey,
      request,
      data,
    });
    // await server.sendRequestAsTransaction("stun-send-message-to-server", data);
  }

  // server receives this
  async receiveStunMessageToServerTransaction(app, tx, peer) {
    // console.log('peer.peer', peer, peer.peer.public_key)
    let txmsg = tx.returnMessage();
    let stun_mod = app.modules.returnModule("Stun");

    let room_code = txmsg.data.data.room_code;
    let type = txmsg.data.data.type;
    let public_key = peer.peer.public_key;

    if (type === "peer-joined") {
      this.addKeyToRoom(room_code, public_key);
    }
    if (type === "peer-left") {
      this.removeKeyFromRoom(room_code, public_key);
    }
=======
  async handlePeerTransaction(app, tx = null, peer, mycallback) {
    if (tx == null) {
      return;
    }
    let txmsg = tx.returnMessage();

    if (app.BROWSER === 0) {
      try {
        //Let's not kill the server with bad data
        if (txmsg.request === "stun-create-room-transaction") {
          this.receiveCreateRoomTransaction(app, tx);
        }
        if (txmsg.request === "stun-send-message-to-server") {
          this.receiveStunMessageToServerTransaction(app, tx, peer);
        }
      } catch (err) {
        console.error("Stun Error:", err);
      }
    }

    if (app.BROWSER === 1) {
      if (txmsg.request === "stun-send-message-to-peers") {
        console.log("HPT: stun-send-message-to-peers");
        this.receiveStunMessageToPeersTransaction(app, tx);
      }
      if (txmsg.request === "stun-send-game-call-message") {
        console.log("HPT: stun-send-game-call-message");
        this.receiveGameCallMessageToPeers(app, tx);
      }
    }
    super.handlePeerTransaction(app, tx, peer, mycallback);
  }

  async sendCreateRoomTransaction() {
    let room_code = this.app.crypto.generateRandomNumber().substring(0, 6);

    // offchain data
    let _data = {
      public_key: this.app.wallet.returnPublicKey(),
      room_code,
    };

    //Are we sure this will always be the stun server?
    // Shouldn't this be set by onPeerServiceUp
    let server = this.app.network.peers[0];

    let data = {
      request: "stun command transmission request",
      data: _data,
    };

    server.sendRequestAsTransaction("stun-create-room-transaction", data);

    return room_code;
  }

  // server receives this
  async receiveCreateRoomTransaction(app, tx) {
    let txmsg = tx.returnMessage();
    this.addKeyToRoom(txmsg.data.data.room_code, txmsg.data.data.public_key);
  }

  async sendStunMessageToServerTransaction(_data) {
    let request = "stun-send-message-to-server";
    let server = this.app.network.peers[0];

    // offchain data
    let data = {
      request,
      data: _data,
    };

    server.sendRequestAsTransaction("stun-send-message-to-server", data);
  }

  // server receives this
  async receiveStunMessageToServerTransaction(app, tx, peer) {
    let txmsg = tx.returnMessage();

    let room_code = txmsg.data.data.room_code;
    let type = txmsg.data.data.type;
    let public_key = peer.peer.publickey;

    if (type === "peer-joined") {
      this.addKeyToRoom(room_code, public_key);
    }

    if (type === "peer-left") {
      this.removeKeyFromRoom(room_code, public_key);
    }

>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    // public keys in the room and relay;
    let recipients = [];
    if (txmsg.data.data.targetPeerId) {
      recipients.push(txmsg.data.data.targetPeerId);
    } else {
<<<<<<< HEAD
      recipients = stun_mod.rooms.get(room_code)?.filter((p) => p !== public_key);
=======
      recipients = this.rooms.get(room_code)?.filter((p) => p !== public_key);
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    }

    let data = {
      ...txmsg.data.data,
      public_key,
    };
<<<<<<< HEAD

    this.sendStunMessageToPeersTransaction(data, recipients);
  }

  sendStunMessageToPeersTransaction(_data, recipients) {
    // send data to the peers in the room
    let request = "stun-send-message-to-peers";

    // offchain data
    let data = {
      recipient: recipients,
      request,
      data: _data,
    };

    this.app.connection.emit("relay-send-message", data);
  }

  receiveStunMessageToPeersTransaction(app, tx) {
    let txmsg = tx.returnMessage();
    let data = tx.msg.data;
    app.connection.emit("stun-event-message", data);
  }

  sendGameCallMessageToPeers(app, _data, recipients) {
    //
    let request = "stun-send-game-call-message";

    let data = {
      recipient: recipients,
      request,
      data: _data,
    };
    // console.log("sending to", recipients);
    this.app.connection.emit("relay-send-message", data);
  }

  async receiveGameCallMessageToPeers(app, tx) {
    let txmsg = tx.returnMessage();
    let data = tx.msg.data;
    // console.log(data, "data");

    switch (data.type) {
      case "connection-request":
        let result = await sconfirm("Accept in game call");
        if (result === true) {
          // connect
          // send to sender and inform
          let _data = {
            type: "connection-accepted",
            room_code: data.room_code,
            sender: app.wallet.publicKey,
          };

          this.sendGameCallMessageToPeers(app, _data, [data.sender]);

          // join room
          app.connection.emit("game-menu-join-video-call", { room_code: data.room_code });
        } else if (result == false) {
          //send to sender to stop connection
          let _data = {
            type: "connection-rejected",
            room_code: data.room_code,
            sender: app.wallet.publicKey,
          };
          this.sendGameCallMessageToPeers(app, _data, [data.sender]);
        }

        // console.log(result);

        break;

      case "connection-accepted":
        console.log("connection accepted");
        salert(`Call accepted by ${data.sender}`);
        break;
      case "connection-rejected":
        console.log("connection rejected");
        salert(`Call rejected by ${data.sender}`);
        break;

      default:
        break;
    }

    //
    // app.connection.emit('stun-event-message', data);
  }

  // server functions
  addRoom(room_code) {
    if (!this.rooms.has(room_code)) {
      this.rooms.set(room_code, []);
    }
  }

  addKeyToRoom(room_code, public_key) {
    if (this.rooms.has(room_code)) {
      let public_keys = this.rooms.get(room_code);
      if (!public_keys.includes(public_key)) {
        public_keys.push(public_key);
      }
      this.rooms.set(room_code, public_keys);
    }
  }

  removeKeyFromRoom(room_code, public_key) {
    if (this.rooms.has(room_code)) {
      let public_keys = this.rooms.get(room_code).filter((p) => p !== public_key);
      this.rooms.set(room_code, public_keys);
=======

    //And rebroadcasts to peers
    this.sendStunMessageToPeersTransaction(data, recipients);
  }

  sendStunMessageToPeersTransaction(_data, recipients) {
    let request = "stun-send-message-to-peers";

    // onchain
    let newtx = this.app.wallet.createUnsignedTransaction();
    if (recipients) {
      recipients.forEach((recipient) => {
        newtx.transaction.to.push(new saito.default.slip(recipient));
      });
    }
    newtx.msg.module = "Stun";
    newtx.msg.request = request;
    newtx.msg.data = _data;
    newtx = this.app.wallet.signTransaction(newtx);

    // offchain data
    let data = {
      recipient: recipients,
      request,
      data: _data,
    };

    this.app.connection.emit("relay-send-message", data);
    setTimeout(() => {
      //This is the only proper onChain TX... ?
      this.app.network.propagateTransaction(newtx);
    }, 2000);
  }

  receiveStunMessageToPeersTransaction(app, tx) {
    let txmsg = tx.returnMessage();
    let data = tx.msg.data;
    app.connection.emit("stun-event-message", data);
  }

  async establishStunCallWithPeers(ui_type, recipients) {

    salert("Establishing a connection with your peers...");

    // init peer manager and chat manager through self event
    this.app.connection.emit("stun-init-peer-manager", ui_type);

    // create a room
    let room_code = await this.sendCreateRoomTransaction();

    //Store room_code in PeerManager
    this.app.connection.emit("stun-peer-manager-update-room-code", room_code);
 
    // send the information to the other peers and ask them to join the call
    recipients = recipients.filter((player) => {
      return player !== this.app.wallet.returnPublicKey();
    });

    let data = {
      type: "connection-request",
      room_code,
      ui: ui_type,
      sender: this.app.wallet.returnPublicKey(),
    };

    this.sendStunCallMessageToPeers(this.app, data, recipients);
  }

  sendStunCallMessageToPeers(app, _data, recipients) {
    let data = {
      recipient: recipients,
      request: "stun-send-game-call-message",
      data: _data,
    };

    console.log("sending to", recipients);
    this.app.connection.emit("relay-send-message", data);

    //Relay only...
  }

  async receiveGameCallMessageToPeers(app, tx) {
    let txmsg = tx.returnMessage();
    let data = tx.msg.data;
    console.log(data, "data");

    switch (data.type) {
      case "connection-request":
        let call_type = (data.ui == "voice") ? "Voice" : "Video";
        let result = await sconfirm(`Accept Saito ${call_type} Call`);
        if (result === true) {
          // connect
          // send to sender and inform
          let _data = {
            type: "connection-accepted",
            room_code: data.room_code,
            sender: app.wallet.returnPublicKey(),
          };

          this.sendStunCallMessageToPeers(app, _data, [data.sender]);

          // init peer manager
          app.connection.emit("stun-init-peer-manager", data.ui);
          app.connection.emit("stun-peer-manager-update-room-code", data.room_code);

          // send the information to the other peers and ask them to join the call
          // show-call-interface
          app.connection.emit("start-stun-call");

        } else if (result == false) {
          //send to sender to stop connection
          let _data = {
            type: "connection-rejected",
            room_code: data.room_code,
            sender: app.wallet.returnPublicKey(),
          };
          this.sendStunCallMessageToPeers(app, _data, [data.sender]);
        }
        console.log(result);
        break;

      case "connection-accepted":
        console.log("connection accepted");
        salert(`Call accepted by ${data.sender}`);
        app.connection.emit("start-stun-call");
        break;
      case "connection-rejected":
        console.log("connection rejected");
        salert(`Call rejected by ${data.sender}`);
        break;

      default:
        break;
    }
  }

  /*
  Will add an empty room if it doesn't already exist and there is no key
  */
  addKeyToRoom(room_code, public_key = "") {
    let public_keys = this.rooms.has(room_code) ? this.rooms.get(room_code) : [];

    if (!public_keys.includes(public_key)) {
      public_keys.push(public_key);
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    }
  }

<<<<<<< HEAD
  updateGameRoomCode(room_code) {
    this.game_room_code = room_code;
=======
    this.rooms.set(room_code, public_keys);
  }

  removeKeyFromRoom(room_code, public_key) {
    if (this.rooms.has(room_code)) {
      let public_keys = this.rooms.get(room_code).filter((p) => p !== public_key);
      this.rooms.set(room_code, public_keys);
    }
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
  }
}

module.exports = Stun;
