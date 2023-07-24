const saito = require("../../lib/saito/saito");
const ModTemplate = require("../../lib/templates/modtemplate");
const StunLauncher = require("./lib/appspace/call-launch");
const CallInterfaceVideo = require("./lib/components/call-interface-video");
const CallInterfaceAudio = require("./lib/components/call-interface-audio");
const PeerManager = require("./lib/appspace/PeerManager");

//Do these do anything???
var serialize = require("serialize-javascript");
const adapter = require("webrtc-adapter");
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
    this.publicKey = this.app.wallet.getPublicKey();
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

  onPeerHandshakeComplete(app, peer) {
    if (app.BROWSER !== 1) {
      return;
    }

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
        if (obj.publickey !== this.app.wallet.publickey) {
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
      public_key: this.publicKey,
      room_code,
    };

    //Are we sure this will always be the stun server?
    // Shouldn't this be set by onPeerServiceUp
    let server = (await this.app.network.getPeers())[0];

    let data = {
      recipient: server.publicKey,
      request: "stun-create-room-transaction",
      data: _data,
    };

    // server.sendRequestAsTransaction("stun-create-room-transaction", data);

    this.app.connection.emit("relay-send-message", data);

    return room_code;
  }

  // server receives this
  async receiveCreateRoomTransaction(app, tx) {
    let txmsg = tx.returnMessage();
    console.log(txmsg, "txmsg");
    this.addKeyToRoom(txmsg.data.room_code, txmsg.data.public_key);
  }

  async sendStunMessageToServerTransaction(_data) {
    let request = "stun-send-message-to-server";
    let server = (await this.app.network.getPeers())[0];

    // offchain data

    let data = {
      recipient: server.publicKey,
      request,
      data: _data,
    };

    this.app.connection.emit("relay-send-message", data);
  }

  // server receives this
  async receiveStunMessageToServerTransaction(app, tx, peer) {
    let txmsg = tx.returnMessage();

    let room_code = txmsg.data.room_code;
    let type = txmsg.data.type;
    console.log("publick key", peer);
    let public_key = peer.publicKey;

    if (type === "peer-joined") {
      this.addKeyToRoom(room_code, public_key);
    }

    if (type === "peer-left") {
      this.removeKeyFromRoom(room_code, public_key);
    }

    // public keys in the room and relay;
    let recipients = [];
    if (txmsg.data.targetPeerId) {
      recipients.push(txmsg.data.targetPeerId);
    } else {
      recipients = this.rooms.get(room_code)?.filter((p) => p !== public_key);
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
        let slip = new Slip();
        slip.publicKey = recipient;
        slip.amount = BigInt(0);
        newtx.addToSlip(slip);
      });
    }

    newtx.msg.module = "Stun";
    newtx.msg.request = "send-message-to-peers";
    newtx.msg.data = _data;
    await newtx.sign();

    // offchain data
    let data = {
      recipient: recipients,
      request,
      data: _data,
    };

    this.app.connection.emit("relay-send-message", data);

    setTimeout(async () => {
      //This is the only proper onChain TX... ?
      // await this.app.network.propagateTransaction(newtx);
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
      return player !== this.publicKey;
    });

    let data = {
      type: "connection-request",
      room_code,
      ui: ui_type,
      sender: this.publicKey,
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
        let call_type = data.ui == "voice" ? "Voice" : "Video";
        let result = await sconfirm(`Accept Saito ${call_type} Call`);
        if (result === true) {
          // connect
          // send to sender and inform
          let _data = {
            type: "connection-accepted",
            room_code: data.room_code,
            sender: app.wallet.publicKey,
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
            sender: app.wallet.publicKey,
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
