const saito = require("../../lib/saito/saito");
const ModTemplate = require("../../lib/templates/modtemplate");
var serialize = require("serialize-javascript");
//const StunAppspace = require("./lib/appspace/main");
const ChatManagerLarge = require("./lib/components/chat-manager-large");
// const ChatManagerSmall = require("./lib/components/chat-manager-small");
//const InviteOverlay = require("./lib/components/invite-overlay");
//const StunxGameMenu = require("./lib/game-menu/main");
// const StunxGameMenu = require("./lib/game-menu/main");
// const StunxInvite = require("./lib/invite/main");
//const ChatInvitationLink = require("./lib/overlays/chat-invitation-link");
const Relay = require("../relay/relay");
const adapter = require("webrtc-adapter");
const Slip = require("../../lib/saito/slip");

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
    //this.ChatManagerSmall = new ChatManagerSmall(app, this);
    //this.InviteOverlay = new InviteOverlay(app, this);
    this.icon = "fas fa-video";
    //this.stunxGameMenu = new StunxGameMenu(app, this);
    this.localStream = null;
    this.hasRendered = true;
    this.chatType = null;
    this.central = false;
    this.peer_connections = {};
    this.peer_connection_states = {};
    //this.stunGameMenu = new StunxGameMenu(app, this);
    this.current_step = 0;
    this.gotten_keys = false;
    this.commands = [];
    // this.receiving_from = {}

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
  }

  async onPeerHandshakeComplete(app, peer) {
    if (!this.video_chat_loaded) {
      if (app.browser.returnURLParameter("stun_video_chat")) {
        let room_obj = JSON.parse(
          app.crypto.base64ToString(app.browser.returnURLParameter("stun_video_chat"))
        );

        // JOIN THE ROOM

        let stun_self = app.modules.returnModule("Stun");
        await stun_self.renderInto("body");
        app.connection.emit("stun-show-loader");
        // super.render(this.app, this);

        let interval = setInterval(() => {
          if (document.readyState === "complete") {
            app.connection.emit("stun-join-conference-room-with-link", room_obj);
            clearInterval(interval);
          }
        }, 500);
      }
    }

    this.video_chat_loaded = 1;
  }

  async render() {
    await this.renderInto("body");
  }

  canRenderInto(qs) {
    if (qs === ".saito-overlay") {
      return true;
    }
    return false;
  }

  async renderInto(qs) {
    if (qs == ".saito-overlay") {
      if (!this.renderIntos[qs]) {
        this.renderIntos[qs] = [];
        //this.renderIntos[qs].push(new StunAppspace(this.app, this, qs));
      }

      this.attachStyleSheets();
      for (const comp of this.renderIntos[qs]) {
        await comp.render();
      }
      this.renderedInto = qs;
    }
    if (qs == "body") {
      if (!this.renderIntos[qs]) {
        this.renderIntos[qs] = [];
        //this.renderIntos[qs].push(new StunAppspace(this.app, this, qs));
      }
      this.attachStyleSheets();
      for (const comp of this.renderIntos[qs]) {
        await comp.render();
      }
      this.renderedInto = "body";
    }
  }

  async respondTo(type) {
    if (type === "invite") {
      // this.styles = [`/stun/style.css`,];
      await super.render(this.app, this);
      return new StunxInvite(this.app, this);
    }
    // if (type === 'appspace') {
    //     this.styles = [`/${this.returnSlug()}/css/style.css`,];
    //     super.render(this.app, this);
    //     return new StunxAppspace(this.app, this);
    // }
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
      this.styles = [`/${this.returnSlug()}/css/style.css`];
      await super.render(this.app, this);
      return {
        id: "game-chat",
        text: "Chat",
        submenus: [
          {
            text: "Video Chat",
            id: "game-video-chat",
            class: "game-video-chat",
            callback: function (app, game_mod) {
              if (game_mod.game.player.length > 1) {
                app.connection.emit("game-start-video-call", [...game_mod.game.players]);
              } else {
                //Open a modal to invite someone to a video chat
              }
            },
          },
        ],
      };
    }

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
          callback: async function (app, id) {
            let pub_key = await app.wallet.getPublicKey();
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

    if (txmsg.request === "stun media channel offer") {
      this.receiveMediaChannelOfferTransaction(app, tx);
    }
    if (txmsg.request === "stun data channel offer") {
      this.receiveDataChannelOfferTransaction(app, tx);
    }
    if (txmsg.request === "stun media channel answer") {
      this.receiveMediaChannelAnswerTransaction(app, tx);
    }
    if (txmsg.request === "stun data channel answer") {
      this.receiveDataChannelAnswerTransaction(app, tx);
    }
    if (txmsg.request === "stun notifcation transmission request") {
      this.receiveMediaChannelNotificationTransaction(app, tx);
    }
    if (txmsg.request === "stun key update") {
      this.receiveKeyUpdateTransaction(app, tx);
    }
    if (txmsg.request === "receive room code") {
      this.receiveRoomCodeTransaction(app, tx);
    }
    if (txmsg.request === "stun command transmission request") {
      this.receiveCommandToPeerTransaction(app, tx);
    }

    super.handlePeerTransaction(app, tx, peer, mycallback);
  }

  async createRoom(callback = null) {
    let room_code = this.app.crypto.generateRandomNumber().substring(0, 6);
    let room = {
      code: room_code,
      peers: [],
      peerCount: 0,
      isMaxCapicity: 0,
      validityPeriod: 86400,
      startTime: Date.now(),
    };
    this.room = room;
    if (callback) {
      callback(room_code);
    }
  }

  // async sendUpdateRoomTransaction(room_code, data) {
  //     const { peers_in_room, peer_count, is_max_capacity } = data;
  //     let newtx = this.app.wallet.createUnsignedTransaction();
  //     // get recipient -- server in this case
  //     let server = this.app.network.peers[0];

  //     let data_ = {
  //         room_code,
  //         peers_in_room,
  //         peer_count,
  //         is_max_capacity
  //     };

  //     server.sendRequestAsTransaction('update room', data_);
  // }

  createSendCommandToPeerTransaction(recipient, sender, command) {
    let _data = {
      sender,
      recipient,
      command,
    };
    let request = "stun command transmission request";

    // offchain data
    let data = {
      recipient: [recipient],
      request,
      data: _data,
    };

    return [null, data];
  }

  async sendCommandToPeerTransaction(recipient, sender, command) {
    let [tx, data] = this.createSendCommandToPeerTransaction(recipient, sender, command);
    console.log("sending command ", data);
    this.app.connection.emit("relay-send-message", data);
  }

  async receiveCommandToPeerTransaction(app, tx, conf, blk) {
    if (app.BROWSER !== 1) return;
    let stun_self = app.modules.returnModule("Stun");
    console.log("getting stun command");
    // if (!stun_self.ChatManagerLarge.isActive) return;
    const command = tx.msg.data.command;
    const recipient = tx.msg.data.recipient;
    const sender = tx.msg.data.sender;
    let reply_sender = recipient;
    let reply_recipient = sender;
    let reply_command;

    switch (command.name) {
      case "PING":
        console.log("pinging, to reply");
        let status = "success";
        if (
          !stun_self.ChatManagerLarge.isActive ||
          command.room_code !== stun_self.ChatManagerLarge.room_code
        ) {
          status = "failed";
        }
        reply_command = { name: "PING_REPLY", id: command.id, status };
        stun_self.sendCommandToPeerTransaction(reply_recipient, reply_sender, reply_command);
        break;

      case "PING_REPLY":
        stun_self.sendCommandToPeerTransaction(reply_recipient, reply_sender, reply_command);
        stun_self.commands.forEach((c) => {
          if (c.id === command.id) {
            c.status = command.status;
          }
        });
        console.log("PING REPLY", stun_self.commands);
        break;
      default:
        break;
    }

    let my_pubkey = app.wallet.getPublicKey();
  }

  createMediaConnectionOffer(publicKey, ui_type, call_type, room_code) {
    const createPeerConnection = new Promise((resolve, reject) => {
      let ice_candidates = [];
      const execute = async () => {
        try {
          let pc = new RTCPeerConnection({
            iceServers: this.servers,
          });
          this.peer_connections[publicKey] = pc;
          pc.onicecandidate = (ice) => {
            if (!ice || !ice.candidate || !ice.candidate.candidate) {
              let offer_sdp = pc.localDescription;
              resolve({ recipient: publicKey, offer_sdp, ice_candidates, pc, ui_type, call_type });
              return;
            } else {
              ice_candidates.push(ice.candidate);
            }
          };

          pc.addEventListener("connectionstatechange", (e) => {
            // console.log(pc.connectionState, " with ", publicKey);

            if (pc.connectionState === "disconnected") {
              if (this.peer_connections[publicKey].connectionState !== "disconnected") {
                console.log("peer objects not equal");
                return;
              }
              this.app.connection.emit(
                "change-connection-state-request",
                publicKey,
                pc.connectionState,
                ui_type,
                call_type,
                room_code
              );
            } else if (pc.connectionState === "failed") {
              if (this.peer_connections[publicKey].connectionState !== "failed") {
                console.log("peer objects not equal");
                return;
              }
              this.app.connection.emit(
                "change-connection-state-request",
                publicKey,
                pc.connectionState,
                ui_type,
                call_type,
                room_code
              );
            } else {
              this.app.connection.emit(
                "change-connection-state-request",
                publicKey,
                pc.connectionState,
                ui_type,
                call_type,
                room_code
              );
            }
          });

          // add data channels
          const data_channel = pc.createDataChannel("channel");
          pc.dc = data_channel;
          pc.dc.onmessage = (event) => {
            console.log("Received message from :", publicKey, " ", event.data);
            let data = JSON.parse(event.data);
            this.app.connection.emit(data.event, data.kind, publicKey);
            if (data.event === "disconnect") {
              // remove peer and disconnect media peer
            }
          };
          pc.dc.onopen = (e) => {
            console.log("data channel connection opened with ", publicKey);
          };

          const stunx_self = this.app.modules.returnModule("Stun");
          let localStream = stunx_self.localStream;
          if (!localStream) return console.log("there is no localstream");

          stunx_self.localStream.getTracks().forEach((track) => {
            pc.addTrack(track, localStream);
          });

          const remoteStream = new MediaStream();
          pc.addEventListener("track", (event) => {
            event.streams[0].getTracks().forEach((track) => {
              remoteStream.addTrack(track);
              this.remoteStreamPosition += 1;
            });
            this.app.connection.emit(
              "add-remote-stream-request",
              publicKey,
              remoteStream,
              pc,
              ui_type,
              call_type,
              room_code
            );
            console.log("adding remote stream from ", publicKey, "  ", event.streams);

            if (!this.room.peers.includes(publicKey)) {
              this.room.peers.push(publicKey);
            }
          });
          const offer = await pc.createOffer();
          pc.setLocalDescription(offer);
        } catch (error) {
          console.log(error);
        }
      };
      execute();
    });

    return createPeerConnection;
  }

  createStunConnectionOffer(publickey, app) {
    const createPeerConnection = new Promise((resolve, reject) => {
      let ice_candidates = [];
      const execute = async (app) => {
        try {
          const pc = new RTCPeerConnection({
            iceServers: this.servers,
          });

          pc.onicecandidate = (ice) => {
            if (!ice || !ice.candidate || !ice.candidate.candidate) {
              let offer_sdp = pc.localDescription;
              console.log(offer_sdp);
              resolve({ recipient: publickey, offer_sdp, ice_candidates, pc });
              return;
            } else {
              ice_candidates.push(ice.candidate);
            }
          };

          pc.onconnectionstatechange = (e) => {
            console.log("connection state ", pc.connectionState);
            switch (pc.connectionState) {
              case "connected":
                // this.app.network.addStunPeer({publickey, peer_connection: pc })
                break;
              default:
                "";
                break;
            }
          };

          const data_channel = pc.createDataChannel("channel");
          // pc.dc = data_channel;
          // let stunx_mod = this.app.modules.returnModule("Stun");
          // pc.dc.onmessage = (e) => {
          // console.log('new message from client : ', e.data);
          app.network.addStunPeer({ publickey, peer_connection: pc, data_channel });
          // };
          // pc.dc.onopen = (e) =>  {
          //     pc.dc.send("new message");
          //     console.log("connection opened")
          // };

          pc.createOffer().then((offer) => {
            pc.setLocalDescription(offer);
          });
          // pc.setLocalDescription(offer);
        } catch (error) {
          console.log(error);
        }
      };

      execute(app);
    });

    return createPeerConnection;
  }

  // acceptMediaChannelConnectionOffer(app, offer_creator, offer) {

  //     const room_code = offer.room_code
  //     const createPeerConnection = async () => {
  //         let reply = {
  //             room_code,
  //             answer: "",
  //             ice_candidates: []
  //         }
  //         let stunx_mod = app.modules.returnModule("Stun");
  //         stunx_mod.peer_connections[offer_creator] = "";
  //         let pc = new RTCPeerConnection({
  //             iceServers: this.servers,
  //         });

  //         stunx_mod.peer_connections[offer_creator] = "";
  //         stunx_mod.peer_connections[offer_creator] = pc;

  //         try {
  //             pc.onicecandidate = (ice) => {
  //                 if (!ice || !ice.candidate || !ice.candidate.candidate) {
  //                     stunx_mod.sendMediaChannelAnswerTransaction(stunx_mod.app.wallet.getPublicKey(), offer_creator, reply);
  //                     return;
  //                 };
  //                 reply.ice_candidates.push(ice.candidate);
  //             }

  //             pc.addEventListener('connectionstatechange', () => {
  //                 // console.log(pc.connectionState, ' with ', offer_creator);
  //                 if (pc.connectionState !== stunx_mod.peer_connections[offer_creator].connectionState) {
  //                     console.log('peer objects not equal');
  //                     return;
  //                 }

  //                 switch (pc.connectionState) {
  //                     case "connecting":
  //                         this.app.connection.emit('change-connection-state-request', offer_creator, pc.connectionState, offer.ui_type, offer.call_type, room_code);
  //                         break;
  //                     case "connected":
  //                         this.app.connection.emit('change-connection-state-request', offer_creator, pc.connectionState, offer.ui_type, offer.call_type, room_code);
  //                         break;
  //                     case "disconnected":
  //                         if (stunx_mod.peer_connections[offer_creator].connectionState !== "disconnected") {
  //                             console.log('peer objects not equal');
  //                             return;
  //                         }
  //                         this.app.connection.emit('change-connection-state-request', offer_creator, pc.connectionState, offer.ui_type, offer.call_type, room_code);
  //                         break;
  //                     case "failed":

  //                         break;
  //                     default:
  //                         ""
  //                         break;
  //                 }

  //             })

  //             // add data channels

  //             pc.ondatachannel = function (event) {
  //                 let dataChannel = event.channel;
  //                 pc.dc = dataChannel;
  //                 pc.dc.onmessage = function (event) {
  //                     // if(pc !== stunx_mod.peer_connections[offer_creator]) return
  //                     let data = JSON.parse(event.data);
  //                     app.connection.emit(data.event, data.kind, offer_creator);
  //                     console.log("Received message:", event.data);
  //                 };

  //                 dataChannel.onopen = function () {
  //                     console.log("Data channel is open!");
  //                 };
  //             };

  //             const localStream = this.localStream;
  //             localStream.getTracks().forEach(track => {
  //                 pc.addTrack(track, localStream);
  //             });

  //             const remoteStream = new MediaStream();
  //             pc.addEventListener('track', (event) => {
  //                 console.log('got remote stream from offer creator ', event.streams);
  //                 event.streams[0].getTracks().forEach(track => {
  //                     remoteStream.addTrack(track);
  //                 });
  //                 let my_pubkey = this.app.wallet.getPublicKey();
  //                 if (!this.room.peers.includes(my_pubkey)) {
  //                     this.room.peers.push(my_pubkey);
  //                 }
  //                 if (!this.room.peers.includes(offer_creator)) {
  //                     this.room.peers.push(offer_creator);
  //                 }
  //                 let other_peers = this.room.peers.filter(peer => {
  //                     if (peer !== offer_creator && peer !== my_pubkey) {
  //                         return peer;
  //                     }
  //                 });

  //                 this.sendKeyUpdateTransaction([offer_creator], other_peers, this.room.peers);
  //                 app.connection.emit('add-remote-stream-request', offer_creator, remoteStream, pc, offer.ui_type);
  //                 console.log('adding remote stream from ', offer_creator, '  ', event.streams);

  //             });

  //             await pc.setRemoteDescription(offer.offer_sdp);
  //             const offer_ice_candidates = offer.ice_candidates;

  //             if (offer_ice_candidates.length > 0) {
  //                 console.log('adding offer icecandidates');
  //                 for (let i = 0; i < offer_ice_candidates.length; i++) {
  //                     pc.addIceCandidate(offer_ice_candidates[i]);
  //                 }
  //             }
  //             reply.answer = await pc.createAnswer();
  //             console.log("answer ", reply.answer);
  //             pc.setLocalDescription(reply.answer);
  //         } catch (error) {
  //             console.log("error", error);
  //         }
  //     }
  //     createPeerConnection();
  // }

  acceptDataChannelConnectionOffer(app, offer_creator, offer) {
    const createPeerConnection = async () => {
      let reply = {
        answer: "",
        ice_candidates: [],
      };
      let pc;
      if (stunx_mod.peer_connections[offer_creator]) {
        pc = stunx_mod.peer_connections[offer_creator];
      } else {
        pc = new RTCPeerConnection({
          iceServers: this.servers,
        });
      }

      try {
        pc.onicecandidate = (ice) => {
          if (!ice || !ice.candidate || !ice.candidate.candidate) {
            console.log("ice candidate check closed");
            let stunx_mod = app.modules.returnModule("Stun");
            stunx_mod.peer_connections[offer_creator] = pc;
            // stunx_mod.initializeStun(stunx_mod.peer_connections[offer_creator]);
            stunx_mod.sendDataChannelAnswerTransaction(
              stunx_mod.app.wallet.getPublicKey(),
              offer_creator,
              reply
            );
            return;
          }
          reply.ice_candidates.push(ice.candidate);
        };
        pc.onconnectionstatechange = (e) => {
          // console.log("connection state ", pc.connectionState)
          switch (pc.connectionState) {
            // case "connecting":
            //     this.app.connection.emit('change-connection-state-request', offer_creator, pc.connectionState, ui_type);
            //     break;
            case "connected":
              // this.app.network.addStunPeer({publicKey:offer_creator, peer_connection: pc})
              break;
            // case "disconnected":
            //     this.app.connection.emit('change-connection-state-request', offer_creator, pc.connectionState, ui_type);
            //     break;
            // case "failed":
            //     this.app.connection.emit('change-connection-state-request', offer_creator, pc.connectionState, ui_type);
            //     break;
            default:
              "";
              break;
          }
        };

        pc.ondatachannel = (e) => {
          console.log("new data channel", e.channel);
          let data_channel = e.channel;
          app.network.addStunPeer({ publickey: offer_creator, peer_connection: pc, data_channel });
        };

        await pc.setRemoteDescription(offer.offer_sdp);
        const offer_ice_candidates = offer.ice_candidates;
        // console.log('peer ice candidates', offer_ice_candidates);
        if (offer_ice_candidates.length > 0) {
          console.log("adding offer icecandidates");
          for (let i = 0; i < offer_ice_candidates.length; i++) {
            pc.addIceCandidate(offer_ice_candidates[i]);
          }
        }
        console.log("remote description  is set");
        reply.answer = await pc.createAnswer();
        console.log("answer ", reply.answer);
        pc.setLocalDescription(reply.answer);
      } catch (error) {
        console.log("error", error);
      }
    };
    createPeerConnection();
  }

  // async createMediaChannelConnectionWithPeers(public_keys, ui_type, call_type, room_code) {
  //     let my_pubkey = this.app.wallet.getPublicKey();
  //     if (public_keys.includes(my_pubkey)) return;
  //     let peerConnectionOffers = [];
  //     if (public_keys.length > 0) {
  //         // send connection to other peers if they exit
  //         for (let i = 0; i < public_keys.length; i++) {
  //             console.log('public key ', public_keys[i], ' ui_type ', ui_type);
  //             // send notification
  //             this.sendMediaChannelNotificationTransaction(this.app.wallet.getPublicKey(), public_keys[i], room_code)
  //             peerConnectionOffers.push(this.createMediaConnectionOffer(public_keys[i], ui_type, call_type, room_code));
  //         }
  //     }
  //     try {
  //         let time = Date.now()
  //         peerConnectionOffers = await Promise.all(peerConnectionOffers);
  //         if (peerConnectionOffers.length > 0) {
  //             const offers = [];
  //             peerConnectionOffers.forEach((offer) => {
  //                 console.log('offer :', offer)
  //                 this.peer_connections[offer.recipient] = offer.pc
  //                 offers.push({
  //                     ice_candidates: offer.ice_candidates,
  //                     offer_sdp: offer.offer_sdp,
  //                     recipient: offer.recipient,
  //                     ui_type: offer.ui_type,
  //                     call_type: offer.call_type,
  //                     room_code
  //                 })
  //             })

  //             let index = 0;
  //             let interval = setInterval(() => {
  //                 let offer;
  //                 offer = offers[index];
  //                 this.sendMediaChannelOfferTransaction(this.app.wallet.getPublicKey(), offer)
  //                 console.log('sending offer', index)
  //                 if (offers.length - 1 === index) {
  //                     clearInterval(interval)
  //                 }
  //                 index++;
  //             }, 3000);

  //         }

  //     } catch (error) {
  //         console.log('an error occurred with peer connection creation', error);
  //     }
  //     siteMessage(`Starting ${call_type} connection`, 5000);
  // }

  // async createDataChannelConnectionWithPeers(public_keys) {
  //     let peerConnectionOffers = [];
  //     if (public_keys.length > 0) {
  //         // send connection to other peers if they exit
  //         for (let i = 0; i < public_keys.length; i++) {
  //             console.log('public key ', public_keys[i]);
  //             peerConnectionOffers.push(this.createStunConnectionOffer(public_keys[i], this.app));
  //         }
  //     }

  //     try {
  //         peerConnectionOffers = await Promise.all(peerConnectionOffers);
  //         if (peerConnectionOffers.length > 0) {
  //             const offers = [];
  //             peerConnectionOffers.forEach((offer) => {
  //                 // map key to pc
  //                 console.log('offer :', offer)
  //                 this.peer_connections[offer.recipient] = offer.pc
  //                 // this.initializeStun(this.peer_connections[offer.recipient]);
  //                 offers.push({
  //                     ice_candidates: offer.ice_candidates,
  //                     offer_sdp: offer.offer_sdp,
  //                     recipient: offer.recipient,
  //                 })
  //             })
  //             // const offers = peerConnectionOffers.map(item => item.offer_sdp);
  //             this.sendDataChannelOfferTransaction(this.app.wallet.getPublicKey(), offers);
  //         }
  //     } catch (error) {
  //         console.log('an error occurred with peer connection creation', error);
  //     }
  //     console.log("peer connections ", this.peer_connections);
  // }

  // setLocalStream(localStream) {
  //     this.localStream = localStream;
  // }

  // createMediaChannelNotificationTransaction(offer_creator, offer_recipient, room_code) {
  //     let _data = {
  //         offer_creator,
  //         offer_recipient,
  //         room_code
  //     }
  //     let request = "stun notifcation transmission request"

  //     // offchain data
  //     let data = {
  //         recipient: [offer_creator, offer_recipient],
  //         request,
  //         data: _data
  //     }

  //     return [null, data];
  // }

  // async sendMediaChannelNotificationTransaction(offer_creator, recipient, room_code) {
  //     let [tx, data] = this.createMediaChannelNotificationTransaction(offer_creator, recipient, room_code);
  //     this.app.connection.emit('relay-send-message', data);

  // }

  // async receiveMediaChannelNotificationTransaction(app, tx, conf, blk) {
  //     if (app.BROWSER !== 1) return;
  //     const offer_creator = tx.msg.data.offer_creator;
  //     const room_code = tx.msg.data.room_code
  //     const offer_recipient = tx.msg.data.offer_recipient;

  //     if (!this.ChatManagerLarge.isActive || this.ChatManagerLarge.room_code !== room_code) return;

  //     let my_pubkey = app.wallet.getPublicKey();

  //     app.connection.emit('stun-receive-media-offer', {
  //         room_code,
  //         offer_creator,
  //         offer_recipient
  //     })

  // }

  // createMediaChannelOfferTransaction(offer_creator, offer) {
  //     let _data = {
  //         offer_creator,
  //         offer
  //     }
  //     let request = "stun media channel offer"

  //     // onchain
  //     let newtx = this.app.wallet.createUnsignedTransaction();
  //     newtx.transaction.to.push(new saito.default.slip(offer.recipient));
  //     newtx.msg.module = "Stun";
  //     newtx.msg.request = request
  //     newtx.msg.data = _data

  //     newtx = this.app.wallet.signTransaction(newtx);

  //     // offchain data
  //     let data = {
  //         recipient: [offer_creator, offer.recipient],
  //         request,
  //         data: _data
  //     }
  //     return [newtx, data]
  // }

  // sendMediaChannelOfferTransaction(offer_creator, offer) {
  //     let [newtx, data] = this.createMediaChannelOfferTransaction(offer_creator, offer);

  //     // offchain
  //     this.app.connection.emit('relay-send-message', data);

  //     // onchain
  //     // this.app.network.propagateTransaction(newtx);
  // }

  // receiveMediaChannelOfferTransaction(app, tx, conf, blk) {
  //     if (app.BROWSER !== 1) return;
  //     const room_code = tx.msg.data.offer.room_code;

  //     if (this.ChatManagerLarge.room_code !== room_code) {
  //         return;
  //     }

  //     let stunx_self = app.modules.returnModule("Stun");
  //     let my_pubkey = app.wallet.getPublicKey();
  //     const offer_creator = tx.msg.data.offer_creator;

  //     const recipient = tx.msg.data.offer.recipient;

  //     // offer creator should not respond
  //     if (my_pubkey === offer_creator) {
  //         return
  //     }
  //     // check if current instance is a recipent
  //     if (my_pubkey === recipient) {
  //         this.peer_connection_states[offer_creator] = "connecting"
  //         stunx_self.acceptMediaChannelOfferAndBroadcastAnswer(app, offer_creator, tx.msg.data.offer);
  //     }

  // }

  // createKeyUpdateTransaction(recipients, public_keys, all_peers) {
  //     let _data = {
  //         public_keys,
  //         all_peers
  //     };
  //     let request = "stun key update"

  //     // onchain
  //     // let newtx = this.app.wallet.createUnsignedTransaction();
  //     // newtx.transaction.to.push(new saito.default.slip(offer_creator));
  //     // newtx.msg.module = "Stun";
  //     // newtx.msg.request = request
  //     // newtx.msg.data= _data;
  //     // newtx = this.app.wallet.signTransaction(newtx);

  //     // offchain
  //     let data = {
  //         request,
  //         recipient: [...recipients],
  //         all_peers,
  //         data: _data
  //     }

  //     return [null, data]
  // }

  // sendKeyUpdateTransaction(recipients, public_keys, all_peers) {
  //     [newtx, data] = this.createKeyUpdateTransaction(recipients, public_keys, all_peers);

  //     // offchain
  //     this.app.connection.emit('relay-send-message', data)

  // }

  // receiveKeyUpdateTransaction(app, tx, conf, blk) {
  //     if (app.BROWSER !== 1) return;

  //     if (!this.gotten_keys) {
  //         if (tx.msg.data.public_keys.length > 0) {
  //             this.room.peers = tx.msg.data.all_peers;
  //             this.createMediaChannelConnectionWithPeers(tx.msg.data.public_keys, 'large', 'video', this.room_code);
  //             this.gotten_keys = true;
  //         }
  //     }

  //     console.log(this, 'this')

  // }

  // createMediaChannelAnswerTransaction(answer_creator, offer_creator, reply) {
  //     let _data = {
  //         answer_creator,
  //         offer_creator,
  //         reply,

  //     };
  //     let request = "stun media channel answer"

  //     // onchain
  //     let newtx = this.app.wallet.createUnsignedTransaction();
  //     newtx.transaction.to.push(new saito.default.slip(offer_creator));
  //     newtx.msg.module = "Stun";
  //     newtx.msg.request = request
  //     newtx.msg.data = _data;
  //     newtx = this.app.wallet.signTransaction(newtx);

  //     // offchain
  //     let data = {
  //         request,
  //         recipient: [offer_creator, answer_creator],
  //         data: _data
  //     }

  //     return [newtx, data]
  // }

  // sendMediaChannelAnswerTransaction(answer_creator, offer_creator, reply) {
  //     [newtx, data] = this.createMediaChannelAnswerTransaction(answer_creator, offer_creator, reply)

  //     // offchain
  //     this.app.connection.emit('relay-send-message', data)

  //     // onchain
  //     // this.app.network.propagateTransaction(newtx);
  // }

  // receiveMediaChannelAnswerTransaction(app, tx, conf, blk) {
  //     if (app.BROWSER !== 1) return;
  //     // if(this.current_step >= 2) return;

  //     // this.current_step = 2;;
  //     if (!this.ChatManagerLarge.isActive) return;
  //     let stunx_self = app.modules.returnModule("Stun");
  //     let my_pubkey = app.wallet.getPublicKey();
  //     // console.log('receiving stun media channel answer');

  //     // app.connection.emit('stun-receive-media-answer', {
  //     //     room_code:tx.msg.data.reply.room_code,
  //     //     offer_creator: tx.msg.data.offer_creator,
  //     //     recipient:tx.msg.data.answer_creator
  //     // })

  //     if (my_pubkey === tx.msg.data.offer_creator) {
  //         console.log('receiving stun media channel answer');
  //         const reply = tx.msg.data.reply;

  //         if (stunx_self.peer_connections[tx.msg.data.answer_creator]) {
  //             if (stunx_self.peer_connections[tx.msg.data.answer_creator].remoteDescription == null || stunx_self.peer_connections[tx.msg.data.answer_creator].currentRemoteDescription == null) {
  //                 stunx_self.peer_connections[tx.msg.data.answer_creator].setRemoteDescription(reply.answer).then(result => {
  //                 }).catch(error => console.log(" An error occured with setting remote description for :", stunx_self.peer_connections[tx.msg.data.answer_creator], error));
  //             }

  //             if (reply.ice_candidates.length > 0) {
  //                 for (let i = 0; i < reply.ice_candidates.length; i++) {
  //                     stunx_self.peer_connections[tx.msg.data.answer_creator].addIceCandidate(reply.ice_candidates[i]);
  //                 }
  //             }
  //         } else {
  //             console.log("peer connection not found");
  //         }
  //     }
  // }

  async sendDataChannelOfferTransaction(offer_creator, offers) {
    let newtx = await this.app.wallet.createUnsignedTransaction();
    console.log("broadcasting offers");
    for (let i = 0; i < offers.length; i++) {
      let slip = new Slip();
      slip.publicKey = offers[i].recipient;
      newtx.addToSlip(slip);
    }

    newtx.msg.module = "Stun";
    newtx.msg.request = "stun data channel offer";
    newtx.msg.offers = {
      offer_creator,
      offers,
    };
    await newtx.sign();
    await this.app.network.propagateTransaction(newtx);
  }

  acceptMediaChannelOfferAndBroadcastAnswer(app, offer_creator, offer) {
    if (offer.ui_type == "large") {
      this.acceptMediaChannelConnectionOffer(app, offer_creator, offer);
    }
  }

  acceptDataChannelOfferAndBroadcastAnswer(app, offer_creator, offer) {
    console.log("accepting offer");
    console.log("from:", offer_creator, offer);
    this.acceptDataChannelConnectionOffer(app, offer_creator, offer);
  }

  async sendDataChannelAnswerTransaction(answer_creator, offer_creator, reply) {
    let newtx = await this.app.wallet.createUnsignedTransaction();
    console.log("broadcasting answer to ", offer_creator);
    let slip = new Slip();
    slip.publicKey = offer_creator;
    newtx.addToSlip(slip);
    newtx.msg.module = "Stun";
    newtx.msg.request = "stun data channel answer";
    newtx.msg.data = {
      answer_creator,
      offer_creator,
      reply: reply,
    };
    await newtx.sign();
    console.log(this.app.network);
    await this.app.network.propagateTransaction(newtx);
  }

  receiveDataChannelOfferTransaction(app, tx, conf, blk) {
    if (app.BROWSER !== 1) return;
    let stunx_self = app.modules.returnModule("Stun");
    let my_pubkey = this.publicKey;
    const offer_creator = tx.msg.offers.offer_creator;

    // offer creator should not respond
    if (my_pubkey === offer_creator) return;
    console.log("offer received from ", tx.msg.offers.offer_creator);
    // check if current instance is a recipent
    const index = tx.msg.offers.offers.findIndex((offer) => offer.recipient === my_pubkey);
    if (index !== -1) {
      stunx_self.acceptDataChannelOfferAndBroadcastAnswer(
        app,
        offer_creator,
        tx.msg.offers.offers[index]
      );
    }
  }

  receiveDataChannelAnswerTransaction(app, tx, conf, blk) {
    let stunx_self = app.modules.returnModule("Stun");
    let my_pubkey = this.publicKey;
    if (my_pubkey === tx.msg.answer.offer_creator) {
      if (app.BROWSER !== 1) return;
      console.log("current instance: ", my_pubkey, " answer room: ", tx.msg.answer);
      console.log("peer connections: ", stunx_self.peer_connections);
      const reply = tx.msg.answer.reply;
      if (stunx_self.peer_connections[tx.msg.answer.answer_creator]) {
        stunx_self.peer_connections[tx.msg.answer.answer_creator]
          .setRemoteDescription(reply.answer)
          .then((result) => {
            console.log(
              "setting remote description of ",
              stunx_self.peer_connections[tx.msg.answer.answer_creator]
            );
          })
          .catch((error) =>
            console.log(
              " An error occured with setting remote description for :",
              stunx_self.peer_connections[tx.msg.answer.answer_creator],
              error
            )
          );
        if (reply.ice_candidates.length > 0) {
          console.log("Adding answer candidates");
          for (let i = 0; i < reply.ice_candidates.length; i++) {
            stunx_self.peer_connections[tx.msg.answer.answer_creator].addIceCandidate(
              reply.ice_candidates[i]
            );
          }
        }
      } else {
        console.log("peer connection not found");
      }
    }
  }

  receiveRoomCodeTransaction(app, tx, conf, blk) {
    if (app.BROWSER !== 1) return;
    console.log(tx.msg.data);
    if (tx.msg.data.creator === this.publicKey) {
      return;
    }
    sconfirm("Accept video call from " + tx.msg.data.creator).then((e) => {
      if (e === false) {
        salert("Video call rejected");
        return;
      }
      this.styles = [`/${this.returnSlug()}/style.css`];
      this.attachStyleSheets();
      setTimeout(() => {
        this.app.connection.emit("join-direct-room-with-code", tx.msg.data.roomCode);
      }, 3000);
    });
  }

  sendVideoEffectsTransaction(effects_obj) {}

  closeMediaConnections(peer) {
    if (peer) {
      for (let i in this.peer_connections) {
        console.log(i, this.peer_connections);
        if (i === peer) {
          this.peer_connections[i].close();
          delete this.peer_connections[i];
          console.log("closing peer connection", this.peer_connections);
        }
      }

      return;
    }

    for (let i in this.peer_connections) {
      this.peer_connections[i].close();
      delete this.peer_connections[i];
      console.log("closing peer connection", this.peer_connections);
    }
    this.room.peers = this.room.peers.filter((p) => p !== peer);

    // if (this.room.peers.includes(offer_creator)) {
    //     this.room.peers = this.room.peers.filter(peer => peer !== offer_creator);
    // }

    console.log(this.room);

    // update database and delete public key from room
  }

  showShareLink(room_obj = {}) {
    let base64string = this.app.crypto.toBase58(JSON.stringify(room_obj));

    let inviteLink = window.location.href;
    if (!inviteLink.includes("#")) {
      inviteLink += "#";
    }

    if (inviteLink.includes("?")) {
      inviteLink = inviteLink.replace("#", "&stun_video_chat=" + base64string);
    } else {
      inviteLink = inviteLink.replace("#", "?stun_video_chat=" + base64string);
    }

    // let linkModal = new ChatInvitationLink(this.app, this, inviteLink);
    // linkModal.render();
  }

  resetStep() {
    this.current_step = 0;
  }

  saveCommand(command) {
    let index = this.commands.findIndex((c) => c.id === command);
    if (index === -1) {
      this.commands.unshift(command);
      console.log("new command saved");
    } else {
      this.commands[index] = command;
    }
  }

  deleteCommand(command) {
    this.commands = this.commands.filter((c) => c.id !== command.id);
  }
}

module.exports = Stun;
