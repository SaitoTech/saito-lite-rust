const saito = require('./saito');
const JSON = require('json-bigint');
const fetch = require('node-fetch');
const { set } = require('numeral');
const Base58 = require("base-58");
const secp256k1 = require('secp256k1');

class Network {

  constructor(app) {

    this.app = app || {};

    this.peers = [];
    this.peers_connected = 0;
    this.peers_connected_limit = 2048; // max peers

    //
    // default comms behavior
    //
    this.sendblks = 1;
    this.sendtxs = 1;
    this.sendgts = 1;
    this.receiveblks = 1;
    this.receivetxs = 1;
    this.receivegts = 1;

    //
    // downloads
    //
    this.downloads = {};
    this.downloads_hmap = {};
    this.downloading_active = 0;
    this.block_sample_size = 15;

    //
    // manage peer disconnections, to provide fall-back
    // reconnect logic in the event socket.io fails to
    // reconnect to a rebooted peer
    //
    this.dead_peers = [];

  }


  //
  // addPeer
  //
  // we initiate an outgoing connection
  // 
  addPeer(peerjson) {

    let peerhost = "";
    let peerport = "";

    let peerobj = {};
    peerobj.peer = JSON.parse(peerjson);

    if (peerobj.peer.protocol == null) { peerobj.peer.protocol = "http"; }
    if (peerobj.peer.host != undefined) { peerhost = peerobj.peer.host; }
    if (peerobj.peer.port != undefined) { peerport = peerobj.peer.port; }

    //
    // no duplicate connections
    //
    for (let i = 0; i < this.peers.length; i++) {
      if (this.peers[i].peer.host == peerhost && this.peers[i].peer.port == peerport) {
        console.log("already connected to peer...");
        return;
      }
    }

    //
    // do not connect to ourselves
    //
    if (this.app.options.server != null) {
      if (peerhost == "localhost") { return; }
      if (this.app.options.server.host == peerhost && this.app.options.server.port == peerport) {
        console.log("ERROR 185203: not adding " + this.app.options.server.host + " as peer since it is our server.");
        return;
      }
      if (this.app.options.server.endpoint != null) {
        if (this.app.options.server.endpoint.host == peerhost && this.app.options.server.endpoint.port == peerport) {
          console.log("ERROR 185204: not adding " + this.app.options.server.host + " as peer since it is our server.");
          return;
        }
      }
    }
    //
    // create peer and add it
    //
    let peer = new saito.peer(this.app, JSON.stringify(peerobj));

    //
    // we connect to them
    //
    peer.connect();
    this.peers.push(peer);
    this.peers_connected++;

  }


  //
  // addRemotePeer
  //
  // server sends us a websocket
  //
  addRemotePeer(socket) {

    // deny excessive connections
    if (this.peers_connected >= this.peers_connected_limit) {
      console.log("ERROR 757594: denying request to remote peer as server overloaded...");
      return;
    }

    //
    // sanity check
    //
    for (let i = 0; i < this.peers.length; i++) {
      if (this.peers[i].socket_id == socket.id) {
        console.log("error adding socket: already in pool");
        return;
      }
    }


    //
    // add peer
    //
    let peer = new saito.peer(this.app);
    peer.socket = socket;

    //
    // they connected to us
    //
    // TODO - where and how are events attached to incoming sockets
    // if the handshake is not attaching data such as publickey, etc.
    // to the peer socket, then how we do we handle not adding dupes,
    // etc.
    //
    //peer.connect(1);
    //
    //
    //
    this.peers.push(peer);
    this.peers_connected++;

  }






  cleanupDisconnectedSocket(peer) {

    for (let c = 0; c < this.peers.length; c++) {
      if (this.peers[c] == peer) {

        var keep_peer = -1;

        //
        // do not remove peers we asked to add
        //
        if (this.app.options.peers != null) {
          for (let d = 0; d < this.app.options.peers.length; d++) {
            if (this.app.options.peers[d].host == peer.peer.host && this.app.options.peers[d].port == peer.peer.port) {
              keep_peer = d;
            }
          }
        }

        //
        // do not remove peers if it's end point is in our options
        //
        if (this.app.options.peers != null && typeof peer.peer.endpoint != 'undefined') {
          for (let d = 0; d < this.app.options.peers.length; d++) {
            if (this.app.options.peers[d].host == peer.peer.endpoint.host && this.app.options.peers[d].port == peer.peer.endpoint.port) {
              keep_peer = d;
            }
          }
        }

        //
        // do not remove peers serving dns
        //
        if (this.app.options.peers != null) {
          if (this.app.options.dns != null) {
            for (let d = 0; d < this.app.options.dns.length; d++) {
              if (this.app.options.dns[d].host == peer.peer.host && this.app.options.dns[d].port == peer.peer.port) {
                keep_peer = d;
              }
            }
          }
        }
        if (keep_peer >= 0) {
          //
          // we push onto dead peers list, which will
          // continue to try and request a connection
          //
          this.dead_peers.push(this.app.options.peers[keep_peer]);
        }

        //
        // close and destroy socket, and stop timers
        //
        this.peers[c].disconnect();
        this.peers.splice(c, 1);
        c--;
        this.peers_connected--;

      }
    }
  }






  initialize() {

    if (this.app.options) {
      if (this.app.options.server) {
        if (this.app.options.server.receiveblks !== undefined && this.app.options.server.receiveblks === 0) { this.receiveblks = 0; }
        if (this.app.options.server.receivetxs !== undefined && this.app.options.server.receivetxs === 0) { this.receivetxs = 0; }
        if (this.app.options.server.receivegts !== undefined && this.app.options.server.receivegts === 0) { this.receivegts = 0; }
        if (this.app.options.server.sendblks !== undefined && this.app.options.server.sendblks === 0) { this.sendblks = 0; }
        if (this.app.options.server.sendtxs !== undefined && this.app.options.server.sendtxs === 0) { this.sendtxs = 0; }
        if (this.app.options.server.sendgts !== undefined && this.app.options.server.sendgts === 0) { this.sendgts = 0; }
      }
    }

    if (this.app.options.peers != null) {
      for (let i = 0; i < this.app.options.peers.length; i++) {
        this.addPeer(JSON.stringify(this.app.options.peers[i]));
      }
    }

    this.app.connection.on('peer_disconnect', (peer) => {
      this.cleanupDisconnectedSocket(peer);
    });

  }



  pollPeers(peers, app) {

    var this_network = app.network;

    //
    // loop through peers to see if disconnected
    //
    peers.forEach((peer) => {

      //
      // if disconnected, cleanupDisconnectedSocket
      //
      if (!peer.socket.connected) {
        if (!this.dead_peers.includes(peer)) {
          this.cleanupDisconnectedSocket(peer);
        }
      }
    });

    //console.log('dead peers to add: ' + this.dead_peers.length);
    // limit amount of time nodes spend trying to reconnect to
    // prevent ddos issues.
    var peer_add_delay = this.peer_monitor_timer_speed - this.peer_monitor_connection_timeout;
    this.dead_peers.forEach((peer) => {
      setTimeout(() => { this_network.connectToPeer(JSON.stringify(peer)) }, peer_add_delay);
    });
    this.dead_peers = [];
  }



  isPrivateNetwork() {
    for (let i = 0; i < this.peers.length; i++) {
      if (this.peers[i].isConnected()) {
	return false; 
      }
    }
    if (this.app.options.peers != null) {
      return false;
    }
    return true;
  }

  isProductionNetwork() {
    if (this.app.BROWSER === 0) {
      // no peers, ok?
      if (this.peers.length == 0) { return true; }
      return process.env.NODE_ENV === 'prod'
    } else {
      return false
    }
  }


  //
  // propagate block
  //
  propagateBlock(blk) {

    if (this.app.BROWSER == 1) { return; }
    if (blk == null) { return; }
    if (blk.is_valid == 0) { return; }

    var data = { bhash: blk.returnHash(), bid: blk.block.id };
    for (let i = 0; i < this.peers.length; i++) {
      if (this.peers[i].handshake_completed == 1) {
        if (this.peers[i].peer.sendblks == 1) {
          this.peers[i].sendRequest("block", data);
        }
      }
    }
  }



  //
  // propagate transaction
  //
  propagateTransaction(tx, outbound_message = "transaction", mycallback = null) {

console.log("ABOUT TO PROPAGATE TRANSACTION");

    if (tx == null) { return; }
    if (!tx.is_valid) { return; }
    if (tx.transaction.type == 1) { outbound_message = "golden ticket"; }

    //
    // if this is our (normal) transaction, add to pending
    //
    if (tx.transaction.from[0].add == this.app.wallet.returnPublicKey()) {
      this.app.wallet.addTransactionToPending(tx);
      this.app.connection.emit("update_balance", this.app.wallet);
    }

    if (this.app.BROWSER == 0 && this.app.SPVMODE == 0) {

      //
      // is this a transaction we can use to make a block
      //
      if (this.app.mempool.containsTransaction(tx) != 1) {

        //
        // return if we can create a transaction
        //
        if (!this.app.mempool.addTransaction(tx)) {
          console.error("ERROR 810299: balking at propagating bad transaction");
          console.error("BAD TX: " + JSON.stringify(tx.transaction));
          return;
        }
        if (this.app.mempool.canBundleBlock() == 1) {
          return 1;
        }
      }
    }

    //
    // whether we propagate depends on whether the fees paid are adequate
    //
    let fees = tx.returnFeesTotal(this.app);
    for (let i = 0; i < tx.transaction.path.length; i++) { fees = fees / 2; }
console.log("DOWN HERE");
    this.sendTransactionToPeers(tx, outbound_message, fees, mycallback);

  }


  sendPeerRequest(message, data = "", peer) {
    for (let x = this.peers.length - 1; x >= 0; x--) {
      if (this.peers[x] == peer) {
        this.peers[x].sendRequest(message, data);
      }
    }
  }
  sendRequest(message, data = "") {
    for (let x = this.peers.length - 1; x >= 0; x--) {
      this.peers[x].sendRequest(message, data);
    }
  }

  sendRequestWithCallback(message, data = "", callback) {
    for (let x = this.peers.length - 1; x >= 0; x--) {
      this.peers[x].sendRequestWithCallback(message, data, callback);
    }
   sendPeerRequest(message, data = "", peer) {
    for (let x = this.peers.length - 1; x >= 0; x--) {
      if (this.peers[x] == peer) {
        this.peers[x].sendRequest(message, data);
      }
    }
  }
  sendRequest(message, data = "") {
    for (let x = this.peers.length - 1; x >= 0; x--) {
      this.peers[x].sendRequest(message, data);
    }
  }

  sendRequestWithCallback(message, data = "", callback) {
    for (let x = this.peers.length - 1; x >= 0; x--) {
      this.peers[x].sendRequestWithCallback(message, data, callback);
    }
  }
 }



  sendTransactionToPeers(tx, outbound_message, fees = 1, callback = null) {

    this.peers.forEach((peer) => {
      //&& fees >= peer.peer.minfee

      if (peer.peer.receivetxs == 0) {
console.log("peer does not receive txs... not sending");
        return;
      }
      if (!peer.inTransactionPath(tx) && peer.returnPublicKey() != null) {
        let tmptx = peer.addPathToTransaction(tx);
        if (callback) {
          peer.sendRequestWithCallback(outbound_message, JSON.stringify(tmptx.transaction), callback);
        } else {
          peer.sendRequest(outbound_message, JSON.stringify(tmptx.transaction));
        }
      }
    });
  }





  //
  // this function requires switching to the new network API
  //
  updatePeersWithWatchedPublicKeys() {

  }





}

module.exports = Network;

