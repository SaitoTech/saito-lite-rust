import * as JSON from "json-bigint";
import { Saito } from "../../apps/core";
import Peer from "./peer";
import WSWebSocket from "ws";
import fetch from "node-fetch";
import Transaction from "./transaction";
import Block from "./block";

class Network {
  public app: Saito;
  public peers: Peer[];
  public peers_connected: number;
  public peers_connected_limit: number;
  public sendblks: any;
  public sendtxs: any;
  public sendgts: any;
  public receiveblks: any;
  public receivetxs: any;
  public receivegts: any;
  public downloads: any;
  public downloads_hmap: any;
  public downloading_active: any;
  public block_sample_size: any;
  public dead_peers: any;
  public socket: any;
  public peer_monitor_timer_speed: any;
  public peer_monitor_connection_timeout: any;

  constructor(app: Saito) {
    this.app = app;

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

    const peerobj: any = {};
    peerobj.peer = JSON.parse(peerjson);

    if (peerobj.peer.protocol == null) {
      peerobj.peer.protocol = "http";
    }
    if (peerobj.peer.host !== undefined) {
      peerhost = peerobj.peer.host;
    }
    if (peerobj.peer.port !== undefined) {
      peerport = peerobj.peer.port;
    }

    //
    // no duplicate connections
    //
    for (let i = 0; i < this.peers.length; i++) {
      if (
        this.peers[i].peer.host === peerhost &&
        this.peers[i].peer.port === peerport
      ) {
        console.log("already connected to peer...");
        return;
      }
    }

    //
    // do not connect to ourselves
    //
    if (this.app.options.server != null) {
      if (peerhost === "localhost") {
        return;
      }
      if (
        this.app.options.server.host === peerhost &&
        this.app.options.server.port === peerport
      ) {
        console.log(
          "ERROR 185203: not adding " +
            this.app.options.server.host +
            " as peer since it is our server."
        );
        return;
      }
      if (this.app.options.server.endpoint != null) {
        if (
          this.app.options.server.endpoint.host === peerhost &&
          this.app.options.server.endpoint.port === peerport
        ) {
          console.log(
            "ERROR 185204: not adding " +
              this.app.options.server.host +
              " as peer since it is our server."
          );
          return;
        }
      }
    }
    //
    // create peer and add it
    //
    const peer = new Peer(this.app, JSON.stringify(peerobj));

    //
    // we connect to them
    //
    peer.socket = this.app.network.initializeWebSocket(
      peer,
      false,
      this.app.BROWSER == 1
    );
    this.peers.push(peer);
    this.peers_connected++;

    //
    // initiate the handshake (verifying peers)
    //
  }

  //
  // addRemotePeer
  //
  // server sends us a websocket
  //
  addRemotePeer(socket) {
    // deny excessive connections
    if (this.peers_connected >= this.peers_connected_limit) {
      console.log(
        "ERROR 757594: denying request to remote peer as server overloaded..."
      );
      return null;
    }

    //
    // sanity check
    //
    //for (let i = 0; i < this.peers.length; i++) {
    //    if (this.peers[i].socket_id === socket.id) { // TODO : add a valid check. these fields are undefined in websockets
    //         console.log("error adding socket: already in pool [" + this.peers[i].socket_id + " - " + socket.id + "]");
    //         return;
    //    }
    //}

    //
    // add peer
    //
    const peer = new Peer(this.app);
    peer.socket = socket;

    //
    // create socket and attach events
    //
    this.initializeWebSocket(peer, true, false);

    //
    // they connected to us
    //
    // TODO - where and how are events attached to incoming sockets
    // if the handshake is not attaching data such as publickey, etc.
    // to the peer socket, then how we do we handle not adding dupes,
    // etc.
    //
    this.peers.push(peer);
    this.peers_connected++;

    //
    // initiate the handshake (verifying peers)
    // - this is normally done in initializeWebSocket, but it is not
    // done for remote-sockets created int he server, so we manually
    // do it here. this adds the message emission events to the socket
    this.app.handshake.initiateHandshake(socket);

    //
    // remote peers can do this here, as the connection is already open
    //
    this.app.network.requestBlockchain(peer);

    return peer;
  }

  /**
   * @param {string} block_hash
   * @param peer
   */
  async fetchBlock(block_hash: string, peer: Peer = null) {
    console.debug("network.fetchBlock : " + block_hash);
    if (peer === null) {
      if (this.peers.length === 0) {
        return;
      }
      peer = this.peers[0];
    }

    try {
      let url = `${peer.peer.protocol}://${peer.peer.host}:${peer.peer.port}/block/${block_hash}`;
      if (this.app.BROWSER == 1 || this.app.SPVMODE == 1) {
        url = `${peer.peer.protocol}://${peer.peer.host}:${
          peer.peer.port
        }/lite-block/${block_hash}/${this.app.wallet.returnPublicKey()}`;
      }
      console.log("URL: " + url);
      const res = await fetch(url);
      if (res.ok) {
        const base64Buffer = await res.arrayBuffer();
        const buffer = Buffer.from(
          Buffer.from(base64Buffer).toString("utf-8"),
          "base64"
        );
        const block = new Block(this.app);
        block.deserialize(buffer);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        block.peer = this;
        this.app.mempool.addBlock(block);
      } else {
        console.error(
          `Error fetching block: Status ${res.status} -- ${res.statusText}`
        );
      }
    } catch (err) {
      console.log(`Error fetching block:`);
      console.error(err);
    }
    return null;
  }

  initializeWebSocket(peer, remote_socket = false, browser = false) {
    //
    // browsers can only use w3c sockets
    //
    if (browser == true) {
      let wsProtocol = "ws";
      if (peer.peer?.protocol) {
        if (peer.peer.protocol === "https") {
          wsProtocol = "wss";
        }
      }
      peer.socket = new WebSocket(
        `${wsProtocol}://${peer.peer.host}:${peer.peer.port}/wsopen`
      );
      peer.socket.peer = peer;

      peer.socket.onopen = (event) => {
        console.log("connected to network", event);
        this.app.handshake.initiateHandshake(peer.socket);
        this.app.network.requestBlockchain(peer);
      };
      peer.socket.onclose = (event) => {
        console.log(
          `[close] Connection closed cleanly by web client, code=${event.code} reason=${event.reason}`
        );
        this.app.network.cleanupDisconnectedSocket(peer.socket);
      };
      peer.socket.onerror = (event) => {
        console.log(`[error] ${event.message}`);
      };
      peer.socket.onmessage = async (event) => {
        const data = await event.data.arrayBuffer();
        const api_message = this.app.networkApi.deserializeAPIMessage(data);
        if (api_message.message_name === "RESULT__") {
          this.app.networkApi.receiveAPIResponse(api_message);
        } else if (api_message.message_name === "ERROR___") {
          this.app.networkApi.receiveAPIError(api_message);
        } else {
          await this.receiveRequest(peer, api_message);
        }
      };

      return peer.socket;
    }

    //
    // only create the socket if it is not a remote peer, as remote peers
    // have their socket code added by the server class.
    //
    if (remote_socket == false) {
      let wsProtocol = "ws";
      if (peer.peer.protocol === "https") {
        wsProtocol = "wss";
      }
      peer.socket = new WSWebSocket(
        `${wsProtocol}://${peer.peer.host}:${peer.peer.port}/wsopen`
      );
      peer.socket.peer = peer;

      //
      // default ws websocket
      //
      peer.socket.on("open", async (event) => {
        await this.app.handshake.initiateHandshake(peer.socket);
        this.app.network.requestBlockchain(peer);
      });
      peer.socket.on("close", (event) => {
        console.log(
          `[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
        );
      });
      peer.socket.on("error", (event) => {
        console.log(`[error] ${event.message}`);
      });
    } else {
      peer.socket.peer = peer;
    }

    peer.socket.on("message", async (data) => {
      const api_message = this.app.networkApi.deserializeAPIMessage(data);
      if (api_message.message_name === "RESULT__") {
        this.app.networkApi.receiveAPIResponse(api_message);
      } else if (api_message.message_name === "ERROR___") {
        this.app.networkApi.receiveAPIError(api_message);
      } else {
        //console.debug("handling peer command - receiving peer id " + peer.socket.peer.id, api_message);
        await this.receiveRequest(peer, api_message);
      }
    });

    return peer.socket;
  }

  cleanupDisconnectedSocket(peer, force = 0) {
    for (let c = 0; c < this.peers.length; c++) {
      if (this.peers[c] === peer) {
        let keep_peer = -1;

        //
        // do not remove peers we asked to add
        //
        if (this.app.options.peers != null) {
          for (let d = 0; d < this.app.options.peers.length; d++) {
            if (
              this.app.options.peers[d].host === peer.peer.host &&
              this.app.options.peers[d].port === peer.peer.port
            ) {
              keep_peer = d;
            }
          }
        }

        //
        // do not remove peers if it's end point is in our options
        //
        if (
          this.app.options.peers != null &&
          typeof peer.peer.endpoint != "undefined"
        ) {
          for (let d = 0; d < this.app.options.peers.length; d++) {
            if (
              this.app.options.peers[d].host === peer.peer.endpoint.host &&
              this.app.options.peers[d].port === peer.peer.endpoint.port
            ) {
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
              if (
                this.app.options.dns[d].host === peer.peer.host &&
                this.app.options.dns[d].port === peer.peer.port
              ) {
                keep_peer = d;
              }
            }
          }
        }

        //
        // respect our arbitrary force-kill ability
        //
        if (force !== 0) {
          keep_peer = -1;
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
        try {
          this.peers[c].socket.close();
        } catch (err) {
          console.log("ERROR 582034: error closing websocket: " + err);
        }
        this.peers.splice(c, 1);
        c--;
        this.peers_connected--;
      }
    }
  }

  initialize() {
    if (this.app.options) {
      if (this.app.options.server) {
        if (
          this.app.options.server.receiveblks !== undefined &&
          this.app.options.server.receiveblks === 0
        ) {
          this.receiveblks = 0;
        }
        if (
          this.app.options.server.receivetxs !== undefined &&
          this.app.options.server.receivetxs === 0
        ) {
          this.receivetxs = 0;
        }
        if (
          this.app.options.server.receivegts !== undefined &&
          this.app.options.server.receivegts === 0
        ) {
          this.receivegts = 0;
        }
        if (
          this.app.options.server.sendblks !== undefined &&
          this.app.options.server.sendblks === 0
        ) {
          this.sendblks = 0;
        }
        if (
          this.app.options.server.sendtxs !== undefined &&
          this.app.options.server.sendtxs === 0
        ) {
          this.sendtxs = 0;
        }
        if (
          this.app.options.server.sendgts !== undefined &&
          this.app.options.server.sendgts === 0
        ) {
          this.sendgts = 0;
        }
      }
    }

    if (this.app.options.peers != null) {
      for (let i = 0; i < this.app.options.peers.length; i++) {
        this.addPeer(JSON.stringify(this.app.options.peers[i]));
      }
    }

    this.app.connection.on("peer_disconnect", (peer) => {
      this.cleanupDisconnectedSocket(peer);
    });
  }

  isPrivateNetwork() {
    for (let i = 0; i < this.peers.length; i++) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
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
      if (this.peers.length === 0) {
        return true;
      }
      return process.env.NODE_ENV === "prod";
    } else {
      return false;
    }
  }

  async receiveRequest(peer, message) {
    console.debug("network.receiveRequest : ", message);
    let block;
    let block_hash;
    let fork_id;
    let block_id;
    let bytes;
    let challenge;
    let is_block_indexed;
    let tx;
    let publickey;

    switch (message.message_name) {
      case "SHAKINIT": {
        challenge = await this.app.handshake.handleIncomingHandshakeRequest(
          peer,
          message.message_data
        );
        await peer.sendResponse(message.message_id, challenge);

        //
        // prune older peers
        //
        const publickey = peer.peer.publickey;
        let count = 0;
        for (let i = this.peers.length - 1; i >= 0; i--) {
          if (this.peers[i].peer.publickey === publickey) {
            count++;
          }
          if (count > 1) {
            this.cleanupDisconnectedSocket(this.peers[i], 1);
            i--;
          }
        }

        break;
      }
      case "REQBLOCK":
        // NOT YET IMPLEMENTED -- send FULL block
        break;

      case "REQBLKHD":
        // NOT YET IMPLEMENTED -- send HEADER block
        break;

      case "SPVCHAIN": {
        console.log("RECEIVED SPVCHAIN");

        const buffer = Buffer.from(message.message_data, "utf8");
        const litechain = JSON.parse(buffer.toString("utf8"));

        console.log("RECEIVED LITECHAIN: " + JSON.stringify(litechain));
        break;
      }

      case "REQCHAIN": {
        block_id = 0;
        block_hash = "";
        fork_id = "";
        publickey = "";
        bytes = message.message_data;

        block_id = Number(
          this.app.binary.u64FromBytes(Buffer.from(bytes.slice(0, 8)))
        );
        if (!block_id) {
          block_hash = Buffer.from(bytes.slice(8, 40), "hex").toString("hex");
          fork_id = Buffer.from(bytes.slice(40, 72), "hex").toString("hex");
        }

        console.log(
          "RECEIVED REQCHAIN with fork_id: " +
            fork_id +
            " and block_id " +
            block_id
        );

        const last_shared_ancestor =
          this.app.blockchain.generateLastSharedAncestor(block_id, fork_id);

        console.log(
          "last shared ancestor generated at: " + last_shared_ancestor
        );

        //
        // notify peer of longest-chain after this amount
        //
        for (
          let i = last_shared_ancestor;
          i <= this.app.blockring.returnLatestBlockId();
          i++
        ) {
          block_hash =
            this.app.blockring.returnLongestChainBlockHashAtBlockId(i);
          if (block_hash !== "") {
            block = await this.app.blockchain.loadBlockAsync(block_hash);

            if (block) {
              this.propagateBlock(block, peer);
            }
          }
        }
        //
        // const blocks_to_send = [];
        //
        // for (
        //   let i = last_shared_ancestor;
        //   i <= this.app.blockring.returnLatestBlockId();
        //   i++
        // ) {
        //   block_hash =
        //     this.app.blockring.returnLongestChainBlockHashAtBlockId(i);
        //   if (block_hash !== "") {
        //     if (this.app.blockchain.blocks[block_hash]) {
        //       const block = this.app.blockchain.blocks[block_hash];
        //       if (block.hasKeylistTransactions([publickey])) {
        //         blocks_to_send.push({ hash: block_hash, type: "spv" });
        //       } else {
        //         blocks_to_send.push({ hash: block_hash, type: "hash" });
        //       }
        //     }
        //   }
        // }
        //
        // const litechain = { start: "", prehash: [], id: [], ts: [] };
        // let idx = 0;
        //
        // for (let i = 0; i < blocks_to_send.length; i++) {
        //   // send lite-hashes
        //   if (blocks_to_send[i].type === "hash") {
        //     const block_hash = blocks_to_send[i].hash;
        //     litechain.id.push(
        //       this.app.blockchain.blocks[block_hash].returnId()
        //     );
        //     litechain.prehash.push(
        //       this.app.blockchain.blocks[block_hash].returnPreHash()
        //     );
        //     litechain.ts.push(
        //       this.app.blockchain.blocks[block_hash].returnTimestamp()
        //     );
        //     idx++;
        //     // send spv blocks
        //   } else {
        //     const block_hash = blocks_to_send[i].hash;
        //     block = await this.app.blockchain.loadBlockAsync(block_hash);
        //     if (block) {
        //       this.propagateBlock(block, peer);
        //     }
        //   }
        // }
        //
        // if (idx > 0) {
        //   this.propagateLiteChain(litechain, peer);
        // }

        break;
      }

      case "SNDCHAIN":
        // NOT YET IMPLEMENTED -- send chain
        break;

      //await peer.sendResponse(message.message_id, Buffer.from("OK", "utf-8"));
      //let send_blockchain_message = SendBlockchainMessage.deserialize(message.message_data, this.app);
      //for (let data of send_blockchain_message.blocks_data) {
      //    await network.fetchBlock(data.block_hash.toString("hex"));
      //}
      //break;

      //
      // this delivers the block as BlockType.Header
      //
      case "SNDBLOCK":
        block = new Block(this.app);
        block.deserialize(message.message_data);
        block_hash = block.returnHash();

        is_block_indexed = this.app.blockchain.isBlockIndexed(block_hash);
        if (is_block_indexed) {
          console.info("SNDBLOCK hash already known: " + block_hash);
        } else {
          await this.fetchBlock(block_hash, peer);
        }
        break;

      //
      // this delivers the block as block_hash
      //
      case "SNDBLKHH":
        block_hash = Buffer.from(message.message_data, "hex").toString("hex");

        is_block_indexed = this.app.blockchain.isBlockIndexed(block_hash);
        if (!is_block_indexed) {
          // TODO : added sending peer to this. @david to fix if there's a better way
          await this.fetchBlock(block_hash, peer);
        }
        break;

      case "SNDTRANS":
        tx = new Transaction();
        tx.deserialize(this.app, message.message_data, 0);
        await this.app.mempool.addTransaction(tx);
        break;

      case "SNDKYLST":
        //await this.app.networkApi.sendAPIResponse(this.socket, "ERROR___", message.message_id, Buffer.from("UNHANDLED COMMAND", "utf-8"));
        break;

      case "SENDMESG": {
        let mdata;
        let reconstructed_obj;
        let reconstructed_message = "";
        let reconstructed_data: any = {};

        try {
          mdata = message.message_data.toString();
          reconstructed_obj = JSON.parse(mdata);
          reconstructed_message = reconstructed_obj.message;
          reconstructed_data = reconstructed_obj.data;
        } catch (err) {
          console.log(
            "Error reconstructing data: " + JSON.stringify(mdata) + " - " + err
          );
        }

        const msg: any = {};
        msg.request = "";
        msg.data = {};

        if (reconstructed_message) {
          msg.request = reconstructed_message;
        }
        if (reconstructed_data) {
          msg.data = reconstructed_data;
        }
        const mycallback = function (response_object) {
          peer.sendResponse(
            message.message_id,
            Buffer.from(JSON.stringify(response_object), "utf-8")
          );
        };

        switch (message.message_name) {
          default:
            if (reconstructed_data) {
              if (reconstructed_data.transaction) {
                if (reconstructed_data.transaction.m) {
                  // backwards compatible - in case modules try the old fashioned way
                  console.log("aaa message : ", message);
                  msg.data.transaction.msg = JSON.parse(
                    this.app.crypto.base64ToString(msg.data.transaction.m)
                  );
                  msg.data.msg = msg.data.transaction.msg;
                }
              }
            }
            await this.app.modules.handlePeerRequest(msg, peer, mycallback);
        }
        break;
      }
      default:
        console.error(
          "Unhandled command received by client... " + message.message_name
        );
        await this.app.networkApi.sendAPIResponse(
          this.socket,
          "ERROR___",
          message.message_id,
          Buffer.from("NO SUCH", "utf-8")
        );
        break;
    }
  }

  pollPeers(peers, app) {
    const this_network = app.network;

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
    const peer_add_delay =
      this.peer_monitor_timer_speed - this.peer_monitor_connection_timeout;
    this.dead_peers.forEach((peer) => {
      setTimeout(() => {
        this_network.connectToPeer(JSON.stringify(peer));
      }, peer_add_delay);
    });
    this.dead_peers = [];
  }

  //
  // propagate block
  //
  propagateBlock(blk, peer = null) {
    if (this.app.BROWSER) {
      return;
    }
    console.debug("network.propagateBlock", blk);
    if (!blk) {
      return;
    }
    if (!blk.is_valid) {
      return;
    }

    const data = { bhash: blk.returnHash(), bid: blk.block.id };
    for (let i = 0; i < this.peers.length; i++) {
      if (
        peer === this.peers[i] ||
        (!peer && this.peers[i].peer.sendblks === 1)
      ) {
        this.sendRequest(
          "SNDBLKHH",
          Buffer.from(blk.returnHash(), "hex"),
          this.peers[i]
        );
      }
    }
  }

  //
  // propagate lite-chain
  //
  propagateLiteChain(litechain, peer = null) {
    console.log("in propagate lite chain..");

    if (this.app.BROWSER) {
      return;
    }
    if (peer == null) {
      return;
    }

    for (let i = 0; i < this.peers.length; i++) {
      if (peer === this.peers[i]) {
        console.log("sending SPVCHAIN w " + JSON.stringify(litechain));
        this.sendRequest(
          "SPVCHAIN",
          Buffer.from(JSON.stringify(litechain), "utf8"),
          this.peers[i]
        );
      }
    }
  }

  //
  // propagate transaction
  //
  propagateTransaction(tx: Transaction, outbound_message = "transaction") {
    console.debug("network.propagateTransaction", tx);
    if (tx === null) {
      return;
    }
    if (!tx.is_valid) {
      return;
    }
    // TODO : @david to check. is this type===FEE(1) ? or should it be type===GT(2) ?
    if (tx.transaction.type === 1) {
      outbound_message = "golden ticket";
    }

    //
    // if this is our (normal) transaction, add to pending
    //
    if (tx.transaction.from[0].add === this.app.wallet.returnPublicKey()) {
      this.app.wallet.addTransactionToPending(tx);
      this.app.connection.emit("update_balance", this.app.wallet);
    }

    if (this.app.BROWSER === 0 && this.app.SPVMODE === 0) {
      //
      // is this a transaction we can use to make a block
      //
      if (!this.app.mempool.containsTransaction(tx)) {
        //
        // return if we can create a transaction
        //
        if (!this.app.mempool.addTransaction(tx)) {
          console.error("ERROR 810299: balking at propagating bad transaction");
          console.error("BAD TX: " + JSON.stringify(tx.transaction));
          return;
        } else {
          console.log(" ... added transaftion");
        }
        if (this.app.mempool.canBundleBlock()) {
          return 1;
        }
      }
    }

    //
    // now send the transaction out with the appropriate routing hop
    //
    let fees = tx.returnFeesTotal();
    for (let i = 0; i < tx.transaction.path.length; i++) {
      fees = fees / BigInt(2);
    }
    this.peers.forEach((peer) => {
      //&& fees >= peer.peer.minfee
      if (peer.peer.receivetxs === 0) {
        return;
      }
      if (!peer.inTransactionPath(tx) && peer.returnPublicKey() != null) {
        const tmptx = peer.addPathToTransaction(tx);
        if (peer.socket) {
          this.sendRequest("SNDTRANS", tmptx.serialize(this.app), peer);
        } else {
          console.error("socket not found");
        }
      }
    });
  }

  requestBlockchain(peer = null) {
    let latest_block_id = this.app.blockring.returnLatestBlockId();
    let latest_block_hash = this.app.blockring.returnLatestBlockHash();
    const fork_id = this.app.blockchain.blockchain.fork_id;

    if (this.app.BROWSER == 1) {
      if (this.app.blockchain.blockchain.last_block_id > latest_block_id) {
        latest_block_id = this.app.blockchain.blockchain.last_block_id;
        latest_block_hash = this.app.blockchain.blockchain.last_block_hash;
      }
    }

    console.log(
      "req blockchain with: " +
        latest_block_id +
        " and " +
        latest_block_hash +
        " and " +
        fork_id
    );

    const buffer_to_send = Buffer.concat([
      this.app.binary.u64AsBytes(latest_block_id),
      Buffer.from(latest_block_hash, "hex"),
      Buffer.from(fork_id, "hex"),
    ]);

    for (let x = this.peers.length - 1; x >= 0; x--) {
      if (this.peers[x] === peer) {
        this.sendRequest("REQCHAIN", buffer_to_send, peer);
        return;
      }
    }

    if (this.peers.length > 0) {
      this.sendRequest("REQCHAIN", buffer_to_send, this.peers[0]);
    }
  }

  sendRequest(message, data: any = "", peer: Peer = null) {
    if (peer !== null) {
      peer.sendRequest(message, data);
    } else {
      for (let x = this.peers.length - 1; x >= 0; x--) {
        this.peers[x].sendRequest(message, data);
      }
    }
  }

  sendRequestWithCallback(message, data = "", callback, peer = null) {
    if (peer !== null) {
      for (let x = this.peers.length - 1; x >= 0; x--) {
        if (this.peers[x] === peer) {
          this.peers[x].sendRequestWithCallback(message, data, callback);
        }
      }
      return;
    }
    for (let x = this.peers.length - 1; x >= 0; x--) {
      this.peers[x].sendRequestWithCallback(message, data, callback);
    }
  }

  //
  // this function requires switching to the new network API
  //
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  updatePeersWithWatchedPublicKeys() {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  close() {}
}

export default Network;
