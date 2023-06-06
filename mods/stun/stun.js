const saito = require("../../lib/saito/saito");
const ModTemplate = require("../../lib/templates/modtemplate");
const StunAppspace = require("./lib/appspace/main");
const StunChatManagerLarge = require("./lib/components/chat-manager-large");
const StunChatManagerSmall = require("./lib/components/chat-manager-small");
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

    //When a appspace/main StunAppspace is rendered or game-menu triggers it
    app.connection.on("stun-init-peer-manager", (ui_type = "large") => {

      if (this.ChatManagerLarge || this.ChatManagerSmall){
        console.warn("Already instatiated a video/audio call manager");
        return;
      }

      if (!this.peerManager) {
        //Create the PeerManager, which includes listeners for events
        this.peerManager = new PeerManager(app, this);
      }

      this.ui_type = ui_type;

      if (ui_type === "large") {
        this.ChatManagerLarge = new StunChatManagerLarge(app, this);
      }else{
        this.ChatManagerSmall = new StunChatManagerSmall(app, this);        
      }
    });

  }

  onPeerHandshakeComplete(app, peer) {
    if (app.BROWSER !== 1) {
      return;
    }
    if (!this.video_chat_loaded) {
      if (app.browser.returnURLParameter("stun_video_chat")) {
        let room_obj = JSON.parse(
          app.crypto.base64ToString(app.browser.returnURLParameter("stun_video_chat"))
        );

        // JOIN THE ROOM
        this.renderInto("body");
        app.connection.emit("stun-to-join-room", room_obj.room_code);
      }
    }

    this.video_chat_loaded = 1;
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
        this.renderIntos[qs].push(new StunAppspace(this.app, this, qs));
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
        this.renderIntos[qs].push(new StunAppspace(this.app, this, qs));
      }
      this.attachStyleSheets();
      this.renderIntos[qs].forEach((comp) => {
        comp.render();
      });
      this.renderedInto = "body";
    }
  }

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
    if (type == "game-menu") {
      this.attachStyleSheets();
      super.render(this.app, this);

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
                stun_self.establishStunCallWithPeers("small", [...game_mod.game.players]);
                //app.connection.emit("game-menu-start-video-call", );
              }
            },
          },
        ],
      };
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
        //Do we even need/want to send messages on chain?

        if (app.BROWSER === 1) {
          if (txmsg.request === "stun-send-message-to-peers") {
            console.log("onConf: stun-send-message-to-peers");
            this.receiveStunMessageToPeersTransaction(app, tx);
          }
        }
      }
    }
  }

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

    // public keys in the room and relay;
    let recipients = [];
    if (txmsg.data.data.targetPeerId) {
      recipients.push(txmsg.data.data.targetPeerId);
    } else {
      recipients = this.rooms.get(room_code)?.filter((p) => p !== public_key);
    }

    let data = {
      ...txmsg.data.data,
      public_key,
    };

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

    // init peer manager and chat manager through self event
    this.app.connection.emit("stun-init-peer-manager", ui_type);

    // create a room
    let room_code = await this.sendCreateRoomTransaction();

    //Store room_code in PeerManager
    this.app.connection.emit("stun-peer-manager-update-room-code", room_code);

    // change ui from start to join
    document.querySelector("#start-group-video-chat").style.display = "none";

    // send the information to the other peers and ask them to join the call
    recipients = recipients.filter((player) => {
      return player !== this.app.wallet.returnPublicKey();
    });

    let data = {
      type: "connection-request",
      room_code,
      sender: this.app.wallet.returnPublicKey(),
    };

    this.sendGameCallMessageToPeers(this.app, data, recipients);
  }

  sendGameCallMessageToPeers(app, _data, recipients) {
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
        let result = await sconfirm("Accept in game call");
        if (result === true) {
          // connect
          // send to sender and inform
          let _data = {
            type: "connection-accepted",
            room_code: data.room_code,
            sender: app.wallet.returnPublicKey(),
          };

          this.sendGameCallMessageToPeers(app, _data, [data.sender]);

          // join room
          app.connection.emit("game-menu-join-video-call", { room_code: data.room_code });
          // init peer manager
          app.connection.emit("stun-init-peer-manager", "small");
          app.connection.emit("stun-peer-manager-update-room-code", data.room_code);

          // send the information to the other peers and ask them to join the call
          // show-small-chat-manager
          app.connection.emit("show-chat-manager");
          try {
            document.querySelector("#start-group-video-chat").style.display = "none";
          } catch (err) {}
        } else if (result == false) {
          //send to sender to stop connection
          let _data = {
            type: "connection-rejected",
            room_code: data.room_code,
            sender: app.wallet.returnPublicKey(),
          };
          this.sendGameCallMessageToPeers(app, _data, [data.sender]);
        }
        console.log(result);
        break;

      case "connection-accepted":
        console.log("connection accepted");
        salert(`Call accepted by ${data.sender}`);
        app.connection.emit("show-chat-manager");
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
    }

    this.rooms.set(room_code, public_keys);
  }

  removeKeyFromRoom(room_code, public_key) {
    if (this.rooms.has(room_code)) {
      let public_keys = this.rooms.get(room_code).filter((p) => p !== public_key);
      this.rooms.set(room_code, public_keys);
    }
  }
}

module.exports = Stun;
