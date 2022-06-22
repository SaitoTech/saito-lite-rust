const saito = require("./../../lib/saito/saito");
const ModTemplate = require("../../lib/templates/modtemplate");
const StunUI = require('./lib/stun-ui');
const Slip = require('../..//lib/saito/slip.ts');
var serialize = require('serialize-javascript');


class Stun extends ModTemplate {

  constructor(app) {
    super(app);
    this.appname = "Stun";
    this.name = "Stun";
    this.description = "Session Traversal Utilitiesf for NAT (STUN)";
    this.categories = "Utility Networking";

    this.stun = {};
    this.stun.ip_address = "";
    this.stun.port = "";
    this.stun.offer_sdp = "";
    this.stun.listeners = [];
    this.stun.pc = "";
    this.stun.iceCandidates = [];
    this.stun.counter = 0;
    this.servers = [
      {
        urls: "stun:stun.l.google.com:19302",
      },
      {
        urls: "turn:openrelay.metered.ca:80",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
      {
        urls: "turn:openrelay.metered.ca:443",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
      {
        urls: "turn:openrelay.metered.ca:443?transport=tcp",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
    ]

    this.stun_servers = [
      {
        urls: "stun:stun.l.google.com:19302",
      },
    ]

    this.turn_servers = [
      {
        urls: "turn:openrelay.metered.ca:80",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
      {
        urls: "turn:openrelay.metered.ca:443",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
      {
        urls: "turn:openrelay.metered.ca:443?transport=tcp",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
    ]

    this.peer_connections = {};
    this.stunUI = new StunUI(app, this)
  }

  async initialize(app) {
    let publickey = this.app.wallet.returnPublicKey();
    let key_index = this.app.keys.keys.findIndex(key => key.publickey === publickey);

    // save key if it doesnt exist
    if (key_index === -1) {
      this.app.keys.addKey(publickey);
      this.app.keys.saveKeys();
    }
    if (!this.app.keys.keys[key_index].data.stun) {
      this.app.keys.keys[key_index].data.stun = this.stun;
      this.app.keys.saveKeys();
    }
  }


  onConfirmation(blk, tx, conf, app) {
    if (conf == 0) {
      let txmsg = tx.returnMessage();
      let my_pubkey = app.wallet.returnPublicKey();
      if (txmsg.module === 'Stun') {
        let stun_self = app.modules.returnModule("Stun");
        if (tx.msg.stun) {
          // check if key exists in key chain
          let key_index = stun_self.app.keys.keys.findIndex((key) => key.publickey === tx.transaction.from[0].add);
          console.log(key_index, "key index");

          // save key if it doesn't exist
          if (key_index === -1) {
            stun_self.app.keys.addKey(tx.transaction.from[0].add);
            stun_self.app.keys.saveKeys();
          }
          for (let i = 0; i < app.keys.keys.length; i++) {

            if (tx.transaction.from[0].add === stun_self.app.keys.keys[i].publickey) {
              console.log(JSON.stringify(stun_self.app.keys.keys[i].data.stun), JSON.stringify(tx.msg.stun))
              if (JSON.stringify(stun_self.app.keys.keys[i].data.stun) != JSON.stringify(tx.msg.stun)) {
                let my_pubkey = app.wallet.returnPublicKey();
                console.log("stun changed, saving changes..", tx.msg.stun);
                stun_self.app.keys.keys[i].data.stun = { ...tx.msg.stun };

                stun_self.app.keys.saveKeys();

              }

            }
          }


          app.connection.emit("stun-update", app, stun_self);


        }



        if (tx.msg.answer) {
          // if (my_pubkey === tx.msg.answer.peer_b) {
          //   stun_self.app.connection.emit('answer_received', tx.msg.answer.peer_a, tx.msg.answer.peer_b, tx.msg.answer.reply);
          // } else {
          //   // console.log('tx peer key not equal');
          // }
          if (app.BROWSER !== 1) return;
          if (my_pubkey === tx.msg.answer.offer_creator) {

            console.log("current instance: ", my_pubkey, " answer room: ", tx.msg.answer);
            console.log("peer connections: ", stun_self.peer_connections, stun_self);
            const reply = tx.msg.answer.reply;

            if (stun_self.peer_connections[tx.msg.answer.answer_creator]) {
              stun_self.peer_connections[tx.msg.answer.answer_creator].setRemoteDescription(reply.answer).then(result => {
                console.log('setting remote description of ', stun_self.peer_connections[tx.msg.answer.answer_creator]);

              }).catch(error => console.log(" An error occured with setting remote description for :", stun_self.peer_connections[tx.msg.answer.answer_creator], error));
              if (reply.ice_candidates.length > 0) {
                console.log("Adding answer candidates");
                for (let i = 0; i < reply.ice_candidates.length; i++) {
                  stun_self.peer_connections[tx.msg.answer.answer_creator].addIceCandidate(reply.ice_candidates[i]);
                }
              }

            } else {
              console.log("peer connection not found");
            }


          }

        }


        if (tx.msg.offers) {
          if (app.BROWSER !== 1) return;

          const offer_creator = tx.msg.offers.offer_creator;

          // offer creator should not respond
          if (my_pubkey === offer_creator) return;
          console.log("offers received from ", tx.msg.offers.offer_creator, tx.msg.offers);

          // check if current instance is a recipent
          const index = tx.msg.offers.offers.findIndex(offer => offer.recipient === my_pubkey);

          if (index !== -1) {
            stun_self.acceptOfferAndBroadcastAnswer(app, offer_creator, tx.msg.offers.offers[index]);
          }


        }


        if (tx.msg.offer) {
          console.log("offer received");
          if (my_pubkey === tx.msg.offer.peer_b) {
            stun_self.app.connection.emit('offer_received', tx.msg.offer.peer_a, tx.msg.offer.peer_b, tx.msg.offer.offer);
          } else {
            console.log('tx peer key not equal');
          }
        }

        if (tx.msg.broadcast_details) {

          const listeners = tx.msg.broadcast_details.listeners;
          const from = tx.msg.broadcast_details.from;
          if (my_pubkey === from) return;

          console.log("listeners: ", listeners, "from: ", from);
          const index = stun_self.app.keys.keys.findIndex(key => key.publickey === my_pubkey);
          if (index !== -1) {
            stun_self.app.keys.keys[index].data.stun.listeners.push(from);
            stun_self.app.keys.saveKeys();

            app.connection.emit('listeners-update', stun_self.app, stun_self.app.keys.keys[index].data.stun.listeners);
            console.log("keys updated, added: ", from, " updated listeners: ", stun_self.app.keys.keys[index].data.stun.listeners);
          }
        }

        if (tx.msg.listeners) {
          stun_self.addListenersFromPeers(tx.msg.listeners.listeners);
        }
      }
    }
  }

  onPeerHandshakeComplete() {
    if (this.app.BROWSER === 0) {

      // browser instance's public key
      const instance_pubkey = this.app.network.peers[this.app.network.peers.length - 1].returnPublicKey();

      let newtx = this.app.wallet.createUnsignedTransaction();

      const pubKeys = [];
      this.app.network.peers.forEach(peer => {
        pubKeys.push(peer.returnPublicKey());
      })


      console.log('instance ', instance_pubkey, ' pubkeys ', pubKeys)
      // newtx.transaction.to.push(new saito.default.slip(instance_pubkey));

      newtx.msg.module = "Stun";
      newtx.msg.pubKeys = {
        pubKeys
      };

      newtx.msg.listeners = {
        listeners: pubKeys
      };
      newtx = this.app.wallet.signTransaction(newtx);
      this.app.network.propagateTransaction(newtx);

      let relay_mod = this.app.modules.returnModule('Relay');

      relay_mod.sendRelayMessage(instance_pubkey, 'get_public_keys', newtx);
    }

  }

  handlePeerRequest(app, req, peer, mycallback) {

    if (req.request == null) {
      return;
    }
    if (req.data == null) {
      return;
    }

    let tx = req.data;
    let stun_self = app.modules.returnModule("Stun");

    switch (req.request) {

      case "get_public_keys":
        console.log('got public keys: ', tx.msg.pubKeys.pubKeys);

        if (app.BROWSER !== 1) return;
        // create peer connection offers


        stun_self.public_keys = tx.msg.pubKeys.pubKeys
        app.options.public_keys = stun_self.public_keys
        app.storage.saveOptions();

        this.createPeerConnectionOffers(app, app.options.public_keys);
        break;

    }

  }



  acceptOfferAndBroadcastAnswer(app, offer_creator, offer) {
    if (app.BROWSER !== 1) return;
    let stun_mod = app.modules.returnModule("Stun");

    console.log('accepting offer');
    console.log('from:', offer_creator, offer)

    const createPeerConnection = async () => {
      let reply = {
        answer: "",
        ice_candidates: []
      }
      const pc = new RTCPeerConnection({
        iceServers: stun_mod.servers,
      });
      try {

        pc.onicecandidate = (ice) => {
          if (!ice || !ice.candidate || !ice.candidate.candidate) {
            console.log('ice candidate check closed');

            let stun_mod = app.modules.returnModule("Stun");
            stun_mod.peer_connections[offer_creator] = pc;

            stun_mod.broadcastAnswer(stun_mod.app.wallet.returnPublicKey(), offer_creator, reply);
            return;

          };

          reply.ice_candidates.push(ice.candidate);





        }

        pc.onconnectionstatechange = e => {
          console.log("connection state ", pc.connectionState)
          // switch (pc.connectionState) {


          //     // case "connected":
          //     //     vanillaToast.cancelAll();
          //     //     vanillaToast.success(`${offer_creator} Connected`, { duration: 3000, fadeDuration: 500 });
          //     //     break;

          //     // case "disconnected":
          //     //     vanillaToast.error(`${offer_creator} Disconnected`, { duration: 3000, fadeDuration: 500 });
          //     //     break;

          //     // default:
          //     //     ""
          //     //     break;
          // }
        }

        // add data channels 
        const data_channel = pc.createDataChannel('channel');
        pc.dc = data_channel;


        pc.dc.onmessage = (e) => {
          console.log('new message from client : ', e.data);
          stun_mod.receiveMesssage(e);
          // StunUI.displayMessage(peer_key, e.data);
        };
        pc.dc.onopen = (e) => {
          console.log('connection opened');
          // $('#connection-status').html(` <p style="color: green" class="data">Connected to ${peer_key}</p>`);
        }



        await pc.setRemoteDescription(offer.offer_sdp);

        const offer_ice_candidates = offer.ice_candidates;
        // console.log('peer ice candidates', offer_ice_candidates);
        if (offer_ice_candidates.length > 0) {
          console.log('adding offer icecandidates');
          for (let i = 0; i < offer_ice_candidates.length; i++) {
            pc.addIceCandidate(offer_ice_candidates[i]);
          }
        }


        console.log('remote description  is set');

        reply.answer = await pc.createAnswer();

        console.log("answer ", reply.answer);


        pc.setLocalDescription(reply.answer);

        // console.log("peer connection ", pc);





      } catch (error) {
        console.log("error", error);
      }

    }

    createPeerConnection();

  }


  broadcastOffers(offer_creator, offers) {
    let newtx = this.app.wallet.createUnsignedTransaction();


    console.log('broadcasting offers now');
    for (let i = 0; i < offers.length; i++) {
      newtx.transaction.to.push(new saito.default.slip(offers[i].recipient));

    }

    console.log(offer_creator, offers)

    newtx.msg.module = "Stun";
    newtx.msg.offers = {
      offer_creator,
      offers
    }

    newtx = this.app.wallet.signTransaction(newtx);
    console.log(this.app.network);
    this.app.network.propagateTransaction(newtx);
  }



  async createPeerConnectionOffers(app, pubKeys) {
    let peerConnectionOffers = [];
    const stun_mod = app.modules.returnModule('Stun');

    if (pubKeys.length > 1) {

      // send connection to other peers if they exit
      for (let i = 0; i < pubKeys.length; i++) {
        if (pubKeys[i] !== stun_mod.app.wallet.returnPublicKey()) {
          peerConnectionOffers.push(stun_mod.createPeerConnectionOffer(app, pubKeys[i]));
        }
      }
    }

    try {
      peerConnectionOffers = await Promise.all(peerConnectionOffers);


      if (peerConnectionOffers.length > 0) {

        const offers = [];
        peerConnectionOffers.forEach((offer) => {
          // map key to pc
          console.log('offer :', offer)
          stun_mod.peer_connections[offer.recipient] = offer.pc
          offers.push({
            ice_candidates: offer.ice_candidates,
            offer_sdp: offer.offer_sdp,
            recipient: offer.recipient,
          })
        })

        // const offers = peerConnectionOffers.map(item => item.offer_sdp);

        stun_mod.broadcastOffers(stun_mod.app.wallet.returnPublicKey(), offers);
      } else {

        console.log("no pair to connect to");
      }

    } catch (error) {
      console.log('an error occurred with peer connection creation', error);
    }
  }



  createPeerConnectionOffer(app, publicKey) {
    const stun_mod = app.modules.returnModule('Stun');

    const createPeerConnection = new Promise((resolve, reject) => {
      let ice_candidates = [];
      const execute = async () => {

        try {
          const pc = new RTCPeerConnection({
            iceServers: stun_mod.servers,
          });



          pc.onicecandidate = (ice) => {
            if (!ice || !ice.candidate || !ice.candidate.candidate) {

              // pc.close();

              let offer_sdp = pc.localDescription;
              resolve({ recipient: publicKey, offer_sdp, ice_candidates, pc });
              // stun_mod.broadcastIceCandidates(my_key, peer_key, ['savior']);

              return;
            } else {
              ice_candidates.push(ice.candidate);
            }

          };

          pc.onconnectionstatechange = e => {
            console.log("connection state ", pc.connectionState)
            switch (pc.connectionState) {


              case "connected":

                break;

              case "disconnecting":

                break;

              default:
                ""
                break;
            }
          }



          const data_channel = pc.createDataChannel('channel');
          pc.dc = data_channel;
          pc.dc.onmessage = (e) => {
            console.log('new message from client : ', e.data);
            stun_mod.receiveMesssage(e);

          };
          pc.dc.onopen = (e) => console.log("peer connection opened");

          const offer = await pc.createOffer();
          pc.setLocalDescription(offer);

        } catch (error) {
          console.log(error);
        }

      }
      execute();

    })

    return createPeerConnection;

  }



  async updateKey(publicKey) {
    console.log('updating key');
    let newtx = this.app.wallet.createUnsignedTransaction();
    newtx.msg.module = "Stun";

    newtx = this.app.wallet.signTransaction(newtx);
    console.log(this.app.network);
    this.app.network.propagateTransaction(newtx);

  }



  transmitMessage(app, sender, msg, callback, recipients = null) {
    const stun_mod = app.modules.returnModule('Stun');
    if (!recipients || recipients?.length === 0) {
      this.peer_connections.forEach(pc => {
        if (pc.connectionState === "connected") {
          pc.dc.send({
            from: sender,
            msg: JSON.stringify(msg),
            callback
          })
        }
      })
    }

    else {
      recipients.forEach(recipient => {
        // check if exists 
        for (let i in stun_mod.peer_connections) {
          if (i === recipient) {
            stun_mod.peer_connections[i].dc.send({
              from: sender,
              msg: JSON.stringify(msg),
              callback
            })
          }
        }
      })
    }
  }

  receiveMesssage(msg) {
    console.log(msg, " from ");
  }


  respondTo(type) {
    if (type == 'email-appspace') {
      let obj = {};
      obj.render = this.stunUI.render(app, mod);
      return obj;
    }
    return null;
  }

  broadcastOffer(my_key, peer_key, offer) {
    let newtx = this.app.wallet.createUnsignedTransaction();
    console.log('broadcasting offer  to ', peer_key);
    newtx.transaction.to.push(new saito.default.slip(peer_key));
    console.log("offer ", offer);
    newtx.msg.module = "Stun";
    newtx.msg.offer = {
      peer_a: my_key,
      peer_b: peer_key,
      offer
    }
    console.log('new tx', newtx);
    newtx = this.app.wallet.signTransaction(newtx);
    console.log(this.app.network);
    this.app.network.propagateTransaction(newtx);
  }

  broadcastAnswer(answer_creator, offer_creator, reply) {
    let newtx = this.app.wallet.createUnsignedTransaction();
    console.log('broadcasting answer to ', offer_creator);
    newtx.transaction.to.push(new saito.default.slip(offer_creator));

    newtx.msg.module = "Stun";
    newtx.msg.answer = {
      answer_creator,
      offer_creator,
      reply: reply
    };
    newtx = this.app.wallet.signTransaction(newtx);

    this.app.network.propagateTransaction(newtx);
  }


  addListenersFromPeers(peers) {
    // only lite clients allowed to run this
    if (this.app.BROWSER === 0) return;
    console.log("adding peers as listeners ...");
    if (peers.length === 0) return console.log("No peers to add");

    let filteredListeners;

    // remove current istance public key
    filteredListeners = peers.filter(peer => peer !== this.app.wallet.returnPublicKey());

    // remove duplicates
    const seen = new Map();
    let filteredPeers = [];
    for (let i = 0; i < filteredListeners.length; i++) {
      if (!seen[filteredListeners[i]]) {
        seen[filteredListeners[i]] = 1;
        filteredPeers.push(filteredListeners[i]);

      } else {
        seen[filteredListeners[i]] += 1;
      }
    }
    console.log('filtered peers ', filteredPeers, ' seen ', seen);

    // save key if it doesnt exist
    let publickey = this.app.wallet.returnPublicKey();
    let key_index = this.app.keys.keys.findIndex(key => key.publickey === publickey);
    if (key_index === -1) {
      this.app.keys.addKey(publickey);
      this.app.keys.saveKeys();
    }
    if (!this.app.keys.keys[key_index].data.stun) {
      this.app.keys.keys[key_index].data.stun = this.stun;
      this.app.keys.saveKeys();

    }
    this.app.keys.keys[key_index].data.stun.listeners = filteredPeers;
    this.app.keys.saveKeys();
    // this.app.connection.emit('listeners-update', this.app, this.app.keys.keys[key_index].data.stun.listeners);
  }


  addListeners(listeners) {
    if (this.app.BROWSER === 0) return;
    console.log("adding listeners ...");
    if (listeners.length === 0) return console.log("No listeners to add");

    let publickey = this.app.wallet.returnPublicKey();
    let key_index = this.app.keys.keys.findIndex(key => key.publickey === publickey);

    // save key if it doesnt exist
    if (key_index === -1) {
      this.app.keys.addKey(publickey);
      this.app.keys.saveKeys();
    }
    if (!this.app.keys.keys[key_index].data.stun) {
      this.app.keys.keys[key_index].data.stun = this.stun;
      this.app.keys.saveKeys();

    }

    let validated_listeners;

    // check if key is valid
    validated_listeners = listeners.map(listener => listener.trim());
    validated_listeners = listeners.filter(listener => listener.length === 44);

    // filter out already existing keys
    validated_listeners = listeners.filter(listener => !this.app.keys.keys[key_index].data.stun.listeners.includes(listener));

    // this.broadcastKeyToListeners(validated_listeners);

    // add listeners to existing listeners
    this.app.keys.keys[key_index].data.stun.listeners = [...this.app.keys.keys[key_index].data.stun.listeners, ...validated_listeners];
    this.app.keys.saveKeys();
    this.app.connection.emit('listeners-update', this.app, this.app.keys.keys[key_index].data.stun.listeners);
  }


  broadcastKeyToListeners(listeners) {
    let newtx = this.app.wallet.createUnsignedTransaction();
    let from = this.app.wallet.returnPublicKey();
    console.log('Adding contacts :', listeners, " to ", from);

    for (let i = 0; i < listeners.length; i++) {
      newtx.transaction.to.push(new saito.default.slip(listeners[i]));
    }

    newtx.msg.module = "Stun";
    newtx.msg.broadcast_details = {
      listeners,
      from
    };
    newtx = this.app.wallet.signTransaction(newtx);

    this.app.network.propagateTransaction(newtx);

  }
}

module.exports = Stun;

