const saito = require("../../lib/saito/saito");
const ModTemplate = require("./../../lib/templates/modtemplate");
const StunLauncher = require("./lib/appspace/call-launch");
const CallInterfaceVideo = require("./lib/components/call-interface-video");
const CallInterfaceAudio = require("./lib/components/call-interface-audio");
const PeerManager = require("./lib/appspace/PeerManager");

//Do these do anything???
var serialize = require("serialize-javascript");
const adapter = require("webrtc-adapter");
const { default: Transaction } = require("../../lib/saito/transaction");
const Slip = require("../../lib/saito/slip").default;

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
    this.isRelayConnected = false;
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

    //When StunLauncher is rendered or game-menu triggers it
    app.connection.on("stun-init-peer-manager", (ui_type = "large") => {
      console.log("Init PeerManager and Set UI to " + ui_type);

      if (this.CallInterface) {
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
      } else {
        this.CallInterface = new CallInterfaceAudio(app, this);
      }
    });
  }

  // Just use inherited initialize, which sets this.publicKey
  // async initialize(app)

  onPeerHandshakeComplete(app, peer) {}

  /**
   * Stun will be rendered on
   *  - /videocall
   *  - Saito-header menu
   *  - Saito-user-menu
   *  - game-menu options
   *
   * This will trigger a "stun-init-peer-manager" event that leads to the creation of PeerManager
   */

  async onPeerServiceUp(app, peer, service) {
    if (app.BROWSER !== 1) {
      return;
    }

    if (service.service === "relay") {
      if (app.BROWSER !== 1) {
        return;
      }

      this.isRelayConnected = true;
      this.ring_sound = new Audio("/videocall/audio/ring.mp3");
      if (app.browser.returnURLParameter("stun_video_chat")) {
        let room_obj = JSON.parse(
          app.crypto.base64ToString(app.browser.returnURLParameter("stun_video_chat"))
        );

        // JOIN THE ROOM
        if (this.browser_active) {
          this.renderInto("body");
        } else {
          this.renderInto(".saito-overlay");
        }

        app.connection.emit("stun-to-join-room", room_obj.room_code);
      }
    }
  }
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
        this.renderIntos[qs].push(new StunLauncher(this.app, this, qs));
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
        this.renderIntos[qs].push(new StunLauncher(this.app, this, qs));
      }
      this.attachStyleSheets();
      this.renderIntos[qs].forEach((comp) => {
        comp.render();
      });
      this.renderedInto = "body";
    }
  }

  startRing() {
    this.ring_sound.play();
  }
  stopRing() {
    this.ring_sound.pause();
  }

  respondTo(type = "") {
    // console.log(type, obj);
    let stun_self = this;
    let obj = arguments[1];
    
    if (type === "user-menu") {
      if (obj?.publicKey) {
        if (obj.publicKey !== this.app.wallet.publicKey) {
          this.attachStyleSheets();
          super.render(this.app, this);
          return [
            {
              text: "Video/Audio Call",
              icon: "fas fa-video",
              callback: function (app, public_key) {
                //stun_self.renderInto(".saito-overlay");
                //salert("You still need to send an invitation link to the call (after you start it)");
                stun_self.startRing();
                stun_self.establishStunCallWithPeers("large", [public_key]);
              },
            },
          ];
        }
      }
    }

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
      console.log("game-menu");
      this.attachStyleSheets();
      super.render(this.app, this);
      if (obj?.game?.players?.length > 1) {
        return {
          id: "game-chat",
          text: "Voice Chat",
          submenus: [
            {
              parent: "game-chat",
              text: "Voice Chat",
              id: "group-voice-chat",
              class: "group-voice-chat",
              callback: function (app, game_mod) {
                //this.showSubMenu("start-group-video-chat");
              },
            },
            {
              parent: "group-voice-chat",
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

    if (type === "chat-popup") {
      console.log("chat popup");
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
    }
  }

  async handlePeerTransaction(app, tx = null, peer, mycallback) {
    if (tx == null) {
      return;
    }
    let txmsg = tx.returnMessage();

    if (txmsg.request === "stun-message-broadcast") {
      let inner_tx = new Transaction(undefined, txmsg.data);
      let message = inner_tx.returnMessage();
      try {
        if (message.request === "stun-create-room-transaction") {
          this.receiveCreateRoomTransaction(app, inner_tx);
        }
        if (message.request === "stun-send-message-to-server") {
          this.receiveStunMessageToServerTransaction(app, inner_tx, peer);
        }

        if (message.request === "stun-send-message-to-peers") {
          console.log("HPT: stun-send-message-to-peers");
          this.receiveStunMessageToPeersTransaction(app, inner_tx);
        }
        if (message.request === "stun-send-game-call-message") {
          console.log("HPT: stun-send-game-call-message");
          this.receiveGameCallMessageToPeers(app, inner_tx);
        }
      } catch (err) {
        console.error("Stun Error:", err);
      }
    }

    super.handlePeerTransaction(app, tx, peer, mycallback);
  }

  async sendCreateRoomTransaction(room_code = null) {
    if (!room_code){
      room_code = this.app.crypto.generateRandomNumber().substring(0, 12);
    }

    let _data = {
      public_key: this.publicKey,
      room_code,
    };

    // onchain
    //Are we sure this will always be the stun server?
    // Shouldn't this be set by onPeerServiceUp
    let server = (await this.app.network.getPeers())[0];
    let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();

    newtx.addTo(server.publicKey);
    newtx.msg.module = "Stun";
    newtx.msg.request = "stun-create-room-transaction";
    newtx.msg.data = _data;
    await newtx.sign();

    let data = {
      recipient: server.publicKey,
      request: "stun-message-broadcast",
      data: newtx.toJson(),
    };

    // server.sendRequestAsTransaction("stun-create-room-transaction", data);

    this.app.connection.emit("relay-send-message", data);

    return room_code;
  }

  // server receives this
  async receiveCreateRoomTransaction(app, tx) {
    let txmsg = tx.returnMessage();
    this.addKeyToRoom(txmsg.data.room_code, txmsg.data.public_key);
  }

  async sendStunMessageToServerTransaction(_data) {
    let request = "stun-send-message-to-server";
    let server = (await this.app.network.getPeers())[0];

    // onchain
    let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();

    newtx.addTo(server.publicKey);
    newtx.msg.module = "Stun";
    newtx.msg.request = request;
    newtx.msg.data = _data;
    await newtx.sign();

    let data = {
      recipient: server.publicKey,
      request: "stun-message-broadcast",
      data: newtx.toJson(),
    };

    this.app.connection.emit("relay-send-message", data);
  }

  // server receives this
  async receiveStunMessageToServerTransaction(app, tx, peer) {
    let txmsg = tx.returnMessage();

    let room_code = txmsg.data.room_code;
    let type = txmsg.data.type;
    // console.log("peer public key: ", peer.publicKey);
    let public_key = peer.publicKey;

    if (type === "peer-joined") {
      this.addKeyToRoom(room_code, public_key);
      // console.log(this.rooms, "this.rooms", room_code, "room_code", public_key, "public_key");
    }

    if (type === "peer-left") {
      this.removeKeyFromRoom(room_code, public_key);
    }

    // public keys in the room and relay;
    let recipients = [];
    if (txmsg.data.targetPeerId) {
      recipients.push(txmsg.data.targetPeerId);
    } else {
      recipients = this.rooms.get(room_code)?.filter((p) => p && p !== public_key);
    }

    let data = {
      ...txmsg.data,
      public_key,
    };

    //And rebroadcasts to peers
    this.sendStunMessageToPeersTransaction(data, recipients);
  }

  async sendStunMessageToPeersTransaction(_data, recipients) {
    let request = "stun-send-message-to-peers";

    // onchain
    let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();

    if (recipients) {
      recipients.forEach((recipient) => {
        if (recipient) {
          newtx.addTo(recipient);
        }
      });
    }

    // let _data = { ..._data, recipients };

    newtx.msg.module = "Stun";
    newtx.msg.request = "stun-send-message-to-peers";
    newtx.msg.data = _data;
    await newtx.sign();

    // offchain data

    let data = {
      recipient: recipients,
      request,
      data: _data,
    };

    if (recipients) {
      recipients.forEach((recipient) => {
        let data = {
          recipient: [recipient],
          request: "stun-message-broadcast",
          data: newtx.toJson(),
        };
        this.app.connection.emit("relay-send-message", data);
      });
    }

    setTimeout(async () => {
      //This is the only proper onChain TX... ?
      // await this.app.network.propagateTransaction(newtx);
    }, 2000);
  }

  receiveStunMessageToPeersTransaction(app, tx) {
    let data = tx.msg.data;
    app.connection.emit("stun-event-message", data);
    // this.peerManager.handleStunEventMessage(data);
  }

  async establishStunCallWithPeers(ui_type, recipients) {
    // salert("Establishing a connection with your peers...");

    // create a room
    let room_code = await this.sendCreateRoomTransaction();

    //Store room_code in PeerManager
    // this.app.connection.emit("stun-peer-manager-update-room-code", room_code);

    // send the information to the other peers and ask them to join the call
    recipients = recipients.filter((player) => {
      return player !== this.publicKey;
    });

    let data = {
      type: "connection-request",
      room_code,
      ui: ui_type,
      sender: this.publicKey,
    };

    this.sendStunCallMessageToPeers(this.app, data, recipients);

    this.dialing = setTimeout(() => {
      // cancel the call after 30seconds
      let data = {
        type: "cancel-connection-request",
        room_code,
        ui: ui_type,
        sender: this.publicKey,
      };
      this.sendStunCallMessageToPeers(this.app, data, recipients);
      this.stopRing();
      if (document.getElementById("saito-alert")) {
        document
          .getElementById("saito-alert")
          .parentElement.removeChild(document.getElementById("saito-alert"));
      }
    }, 30000);

    const result = await sconfirm("establishing connection with peers");
    if (!result) {
      // cancel the call
      let data = {
        type: "cancel-connection-request",
        room_code,
        ui: ui_type,
        sender: this.publicKey,
      };
      clearTimeout(this.dialing);
      this.dialing = null;
      this.stopRing();
      this.sendStunCallMessageToPeers(this.app, data, recipients);
    }
  }

  async sendStunCallMessageToPeers(app, _data, recipients) {
    let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();

    if (recipients) {
      recipients.forEach((recipient) => {
        if (recipient) {
          newtx.addTo(recipient);
        }
      });
    }

    newtx.msg.module = "Stun";
    newtx.msg.request = "stun-send-game-call-message";
    newtx.msg.data = _data;
    await newtx.sign();

    recipients.forEach((recipient) => {
      let data = {
        recipient: recipient,
        request: "stun-message-broadcast",
        data: newtx.toJson(),
      };
      this.app.connection.emit("relay-send-message", data);
    });
  }

  async receiveGameCallMessageToPeers(app, tx) {
    let txmsg = tx.returnMessage();
    let data = tx.msg.data;

    switch (data.type) {
      case "connection-request":
        let call_type = data.ui == "voice" ? "Voice" : "Video";
        this.startRing();
        let result = await sconfirm(`Accept Saito ${call_type} Call from ${data.sender}`);

        if (result === true) {
          // connect
          // send to sender and inform
          let _data = {
            type: "connection-accepted",
            room_code: data.room_code,
            sender: app.wallet.publicKey,
            ui: data.ui,
          };

          this.sendStunCallMessageToPeers(app, _data, [data.sender]);

          setTimeout(() => {  
            // init peer manager
            app.connection.emit("stun-init-peer-manager", data.ui);
            app.connection.emit("stun-peer-manager-update-room-code", data.room_code);

            // send the information to the other peers and ask them to join the call
            // show-call-interface
            app.connection.emit("start-stun-call");
          }, 2000);

        } else {
          //send to sender to stop connection
          let _data = {
            type: "connection-rejected",
            room_code: data.room_code,
            sender: app.wallet.publicKey,
          };
          this.sendStunCallMessageToPeers(app, _data, [data.sender]);
        }
        this.stopRing();
        // console.log(result);
        break;

      case "connection-accepted":
        console.log("connection accepted");
        this.stopRing();
        if (document.getElementById("saito-alert")) {
          document
            .getElementById("saito-alert")
            .parentElement.removeChild(document.getElementById("saito-alert"));
        }

        siteMessage(`${data.sender} accepted your call`, 2000);

        if (this.dialing){
          clearTimeout(this.dialing);
          this.dialing = null;
        }
        
        // init peer manager and chat manager through self event
        this.app.connection.emit("stun-init-peer-manager", data.ui);
        this.app.connection.emit("stun-peer-manager-update-room-code", data.room_code);
        this.app.connection.emit("start-stun-call");
        

        break;
      case "connection-rejected":
        console.log("connection rejected");
        this.stopRing();
        if (document.getElementById("saito-alert")) {
          document
            .getElementById("saito-alert")
            .parentElement.removeChild(document.getElementById("saito-alert"));
        }

        salert(`Call rejected by ${data.sender}`);
        break;
      case "cancel-connection-request":
        // console.log("connection rejected");
        this.stopRing();
        if (document.getElementById("saito-alert")) {
          document
            .getElementById("saito-alert")
            .parentElement.removeChild(document.getElementById("saito-alert"));
        }

        // salert(`Call cancelled by ${data.sender}`);
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
    console.log("public keys in the room", public_keys);
    console.log("public key that wants to join ", public_key);
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
