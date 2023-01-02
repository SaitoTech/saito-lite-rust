import * as JSON from "json-bigint";
import { Saito } from "../../apps/core";
import Peer from "./peer";
import WSWebSocket from "ws";
import fetch from "node-fetch";
import Transaction from "./transaction";
import Block from "./block";
import { MessageType } from "./networkapi";

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
  public peer_monitor_timer_speed = 7500;
  public peer_monitor_connection_timeout = 2000;
  public peer_monitor_timer: any;
  public debugging: boolean;
  public blocks_to_fetch: Array<{ id: bigint; hash: string; peer: Peer }> = new Array<{
    id: bigint;
    hash: string;
    peer: Peer;
  }>();

  public block_fetch_running = false;

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
    this.downloading_active = false;
    this.block_sample_size = 15;

    //
    // manage peer disconnections, to provide fall-back
    // reconnect logic in the event socket.io fails to
    // reconnect to a rebooted peer
    //
    this.dead_peers = [];
    this.debugging = true;
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
      if (this.peers[i].peer.host === peerhost && this.peers[i].peer.port === peerport) {
        if (this.debugging) {
          console.log("already connected to peer...");
        }
        return;
      }
    }

    //
    // do not connect to ourselves
    //
    if (this.app.options.server != null) {
      // if (peerhost === "localhost") {
      //   return;
      // }
      if (this.app.options.server.host === peerhost && this.app.options.server.port === peerport) {
        if (this.debugging) {
          console.log(
            "ERROR 185203: not adding " +
              this.app.options.server.host +
              " as peer since it is our server."
          );
        }
        return;
      }
      if (this.app.options.server.endpoint != null) {
        if (
          this.app.options.server.endpoint.host === peerhost &&
          this.app.options.server.endpoint.port === peerport
        ) {
          if (this.debugging) {
            console.log(
              "ERROR 185204: not adding " +
                this.app.options.server.host +
                " as peer since it is our server."
            );
          }
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
    peer.socket = this.app.network.initializeWebSocket(peer, false, this.app.BROWSER == 1);
    this.peers.push(peer);
    this.peers_connected++;
    peer.keepAlive();
  }

  addStunPeer(stun_object) {
    const peer = new Peer(this.app);
    this.initializeStun(peer, stun_object);
  }

  initializeStun(peer, stun_object) {
    let pc = stun_object.peer_connection;
    let publickey = stun_object.publickey;
    let data_channel = stun_object.data_channel;

    peer.stun = { peer_connection: pc, data_channel, publickey };
    peer.peer.publickey = publickey;
    peer.stun.data_channel.peer = peer;
    peer.uses_stun = true;

    peer.stun.data_channel.onmessage = async (e) => {
      const data = await e.data;
      const api_message = this.app.networkApi.deserializeAPIMessage(data);
      if (api_message.message_type === MessageType.Result) {
        this.app.networkApi.receiveAPIResponse(api_message);
      } else if (api_message.message_type === MessageType.Error) {
        this.app.networkApi.receiveAPIError(api_message);
      } else {
        await this.receiveRequest(peer, api_message);
      }
    };

    peer.stun.data_channel.onopen = (e) => {
      // console.log('stun connection opened with '+publickey, "opened ");
      if (this.debugging) {
        console.log("direct data channel created with ", peer.peer.publickey);
      }
      this.app.handshake.initiateHandshake(peer.stun.data_channel);

      this.app.network.requestBlockchain(peer);
      this.app.connection.emit("peer_connect", peer);
      this.app.connection.emit("connection_up", peer);
      this.app.network.propagateServices(peer);
    };

    peer.stun.data_channel.onclose = (event) => {
      if (this.debugging) {
        console.log(
          `[close] Connection closed cleanly by web client, code=${event.code} reason=${event.reason}`
        );
      }
      this.app.connection.emit("connection_dropped", peer);
      this.app.connection.emit("peer_disconnect", peer);
    };

    peer.stun.data_channel.onerror = (event) => {
      if (this.debugging) {
        console.log(`Peer Datachannel Error: [error] `);
      }
    };

    let index = this.peers.findIndex((peer) => peer.stun.publickey === publickey);
    if (index === -1) {
      this.peers.push(peer);
    } else {
      this.peers[index] = peer;
    }
    this.peers.push(peer);
    this.peers_connected++;
    console.log("adding stun peer", peer);
  }

  //
  // addRemotePeer
  //
  // server sends us a websocket
  //
  async addRemotePeer(socket) {
    // deny excessive connections
    if (this.peers_connected >= this.peers_connected_limit) {
      if (this.debugging) {
        console.log("ERROR 757594: denying request to remote peer as server overloaded...");
      }
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
    peer.keepAlive();

    //
    // initiate the handshake (verifying peers)
    // - this is normally done in initializeWebSocket, but it is not
    // done for remote-sockets created in the server, so we manually
    // do it here. this adds the message emission events to the socket
    //
    await this.app.handshake.initiateHandshake(socket);

    return peer;
  }

  /**
   * @param {string} block_hash
   * @param peer
   */
  async fetchBlock(block_hash: string, peer: Peer = null) {
    if (!block_hash) {
      console.trace("block hash is empty");
    }
    if (peer === null) {
      if (this.peers.length === 0) {
        return;
      }
      peer = this.peers[0];
    }

    let url = "";
    try {
      if (!peer.peer.block_fetch_url) {
        console.error("peer block fetch url is not set");
      }
      let base_url = peer.peer.block_fetch_url.endsWith("/")
        ? peer.peer.block_fetch_url
        : peer.peer.block_fetch_url + "/";
      url = `${base_url}${block_hash}`;
      if (this.app.SPVMODE == 1) {
        url = `${peer.peer.protocol}://${peer.peer.host}:${
          peer.peer.port
        }/lite-block/${block_hash}/${this.app.wallet.returnPublicKey()}`;
      }
      console.log("fetching url : " + url);
      const res = await fetch(url);
      if (res.ok) {
        const blob = await res.blob(); //arrayBuffer();
        // const buffer = Buffer.from(Buffer.from(base64Buffer).toString("utf-8"), "base64");
        const buffer = Buffer.from(await blob.arrayBuffer());
        console.log("block fetched : " + block_hash + " size = " + buffer.length);

        const block = new Block(this.app);
        block.deserialize(buffer);
        // console.debug("block deserialized : " + block_hash);
        block.generateMetadata();
        await block.generateConsensusValues();
        console.assert(
          block_hash === block.hash,
          `generated block hash : ${block.hash} not matching with requested : ${block_hash}`
        );
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        block.peer = this;
        await this.app.mempool.addBlock(block);
      } else {
        // if (this.debugging) {
        console.error(
          `Error fetching block from :${url}: Status ${res.status} -- ${res.statusText}`
        );
        // }
      }
    } catch (err) {
      // if (this.debugging) {
      console.error(`Error fetching block: ${url}`);
      // }
      // if (this.debugging) {
      console.error(err);
      // }
    }
    return;
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
      peer.socket = new WebSocket(`${wsProtocol}://${peer.peer.host}:${peer.peer.port}/wsopen`);
      peer.socket.peer = peer;

      peer.socket.onopen = (event) => {
        if (this.debugging) {
          console.log("connected to network", event);
        }
        try {
          this.app.connection.emit("peer_connect", peer);
          this.app.connection.emit("connection_up", peer);
          this.app.network.propagateServices(peer);
        } catch (error) {
          console.error(error);
        }
      };
      peer.socket.onclose = (event) => {
        if (this.debugging) {
          console.log(
            `[close] Connection closed cleanly by web client, code=${event.code} reason=${event.reason}`
          );
        }
        this.app.connection.emit("connection_dropped", peer);
        this.app.connection.emit("peer_disconnect", peer);
        peer.initiated_handshake = false;
        peer.peer.publickey = "";
      };
      peer.socket.onerror = (event) => {
        if (this.debugging) {
          console.log(`Peer Socket Error: [error] ${event.message}`);
        }
      };
      peer.socket.onmessage = async (event) => {
        try {
          const data = new Uint8Array(await event.data.arrayBuffer());
          // console.log("data buffer 2 first: ", data[0]);
          const api_message = this.app.networkApi.deserializeAPIMessage(data);
          if (api_message.message_type == MessageType.Result) {
            this.app.networkApi.receiveAPIResponse(api_message);
          } else if (api_message.message_type == MessageType.Error) {
            this.app.networkApi.receiveAPIError(api_message);
          } else {
            await this.receiveRequest(peer, api_message);
          }
        } catch (error) {
          console.error(error);
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
      } else {
      }
      peer.socket = new WSWebSocket(`${wsProtocol}://${peer.peer.host}:${peer.peer.port}/wsopen`);
      peer.socket.peer = peer;

      //
      // default ws websocket
      //
      peer.socket.on("open", async (event) => {
        try {
          this.app.network.propagateServices(peer);
        } catch (error) {
          console.error(error);
        }
      });
      peer.socket.on("close", (event) => {
        if (this.debugging) {
          console.log(
            `[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
          );
        }
      });
      peer.socket.on("error", (event) => {
        if (this.debugging) {
          console.log(`[error] ${event.message}`);
        }
      });
    } else {
      peer.socket.peer = peer;
      this.app.network.propagateServices(peer);
    }

    peer.socket.on("message", async (data) => {
      // if (data.length === 0) {
      //   console.log("received message buffer with 0 length");
      //   return;
      // }
      // console.log("data buffer 1 first: ", data[0]);
      try {
        const api_message = this.app.networkApi.deserializeAPIMessage(new Uint8Array(data));
        if (api_message.message_type == MessageType.Result) {
          this.app.networkApi.receiveAPIResponse(api_message);
        } else if (api_message.message_type == MessageType.Error) {
          this.app.networkApi.receiveAPIError(api_message);
        } else {
          await this.receiveRequest(peer, api_message);
        }
      } catch (error) {
        console.error(error);
      }
    });

    return peer.socket;
  }

  cleanupDisconnectedPeer(peer, force = 0) {
    if (peer.uses_stun) {
      // clean up peer
      let publickey = peer.peer.publickey;
      for (let i = 0; i < this.peers.length; i++) {
        if (this.peers[i].peer.publickey === publickey) {
          if (this.peers[i].stun.data_channel.readyState === "closed") {
            try {
              this.peers[i].stun.data_channel.close();
              this.peers.splice(i, 1);
            } catch (error) {
              console.log("ERROR : error closing datachannel: " + error);
            }
          }
        }
      }
      return;
    }

    for (let c = 0; c < this.peers.length; c++) {
      // it has to be this peer, and the socket must be closed
      if (
        this.peers[c].id === peer.id &&
        this.peers[c].socket.readyState === this.peers[c].socket.CLOSED
      ) {
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
        if (this.app.options.peers != null && typeof peer.peer.endpoint != "undefined") {
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
          this.dead_peers.push(peer);
        }

        //console.debug("keep_peer = " + keep_peer);
        //
        // close and destroy socket, and stop timers
        //
        try {
          this.peers[c].socket.close();
        } catch (err) {
          if (this.debugging) {
            console.log("ERROR 582034: error closing websocket: " + err);
          }
        }
        this.peers.splice(c, 1);
        c--;
        this.peers_connected--;
      }
    }
  }

  hasPeer(publickey) {
    for (let i = 0; i < this.peers.length; i++) {
      if (this.peers[i].peer.publickey === publickey) {
        return true;
      }
    }
    return false;
  }

  initialize() {
    console.debug("[DEBUG] initialize network");

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
      console.debug("[DEBUG] peers length " + this.app.options.peers.length);
      for (let i = 0; i < this.app.options.peers.length; i++) {
        this.addPeer(JSON.stringify(this.app.options.peers[i]));
      }
    } else {
      console.debug("[DEBUG] no peers defined");
    }

    this.app.connection.on("peer_disconnect", (peer) => {
      this.cleanupDisconnectedPeer(peer);
    });

    this.peer_monitor_timer = setInterval(() => {
      this.pollPeers();
    }, this.peer_monitor_timer_speed);
  }

  isNetworkUp() {
    for (let i = 0; i < this.peers.length; i++) {
      if (this.peers[i].isConnected()) {
        return true;
      }
    }
    return false;
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
    console.log("network.receiveRequest : ", message);

    let block;
    let block_hash;
    let fork_id;
    let block_id: bigint;
    let bytes;
    let response;
    let is_block_indexed;
    let tx;
    let publickey;

    switch (message.message_type) {
      case MessageType.HandshakeChallenge: {
        await this.app.handshake.handleIncomingHandshakeChallenge(peer, message.message_data);

        break;
      }

      case MessageType.HandshakeResponse: {
        await this.app.handshake.handleHandshakeResponse(peer, message.message_data);

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
            this.cleanupDisconnectedPeer(this.peers[i], 1);
            i--;
          }
        }
        break;
      }
      // case MessageType.HandshakeCompletion: {
      //   await this.app.handshake.handleHandshakeCompletion(peer, message.message_data);
      //
      //   //
      //   // prune older peers
      //   //
      //   const publickey = peer.peer.publickey;
      //   let count = 0;
      //   for (let i = this.peers.length - 1; i >= 0; i--) {
      //     if (this.peers[i].peer.publickey === publickey) {
      //       count++;
      //     }
      //     if (count > 1) {
      //       this.cleanupDisconnectedPeer(this.peers[i], 1);
      //       i--;
      //     }
      //   }
      //   break;
      // }
      case MessageType.Ping:
        // console.log("received ping...");
        // job already done!
        break;

      // case "REQBLOCK":
      //   // NOT YET IMPLEMENTED -- send FULL block
      //   break;
      //
      // case "REQBLKHD":
      //   // NOT YET IMPLEMENTED -- send HEADER block
      //   break;

      case MessageType.SPVChain: {
        //if (this.debugging) { console.log("RECEIVED SPVCHAIN"); }

        const buffer = Buffer.from(message.message_data, "utf8");
        const litechain = JSON.parse(buffer.toString("utf8"));

        //if (this.debugging) { console.log("RECEIVED LITECHAIN: " + JSON.stringify(litechain)); }
        break;
      }

      case MessageType.Services: {
        const buffer = Buffer.from(message.message_data, "utf8");

        try {
          peer.peer.services = JSON.parse(buffer.toString("utf8"));
          console.log("services : ", peer.peer.services);
        } catch (err) {
          console.error("ERROR parsing peer services list or setting services in peer");
        }

        break;
      }

      case MessageType.GhostChain: {
        const buffer = Buffer.from(message.message_data, "utf8");
        const syncobj = JSON.parse(buffer.toString("utf8"));

        if (this.debugging) {
          console.log("RECEIVED GSTCHAIN 1: ", syncobj);
        }

        let previous_block_hash = syncobj.start;

        for (let i = 0; i < syncobj.prehash.length; i++) {
          let buf = Buffer.concat([
            this.app.binary.hexToSizedArray(previous_block_hash, 32),
            this.app.binary.hexToSizedArray(syncobj.prehash[i], 32),
          ]);
          let block_hash = this.app.crypto.hash(buf);

          if (this.debugging) {
            console.log("block hash as: " + block_hash);
          }

          if (parseInt(syncobj.txs[i]) > 0) {
            if (this.debugging) {
              console.log("fetching block! " + block_hash);
            }
            await this.fetchBlock(block_hash);
            if (this.debugging) {
              console.log("done fetch block!");
            }
          } else {
            // ghost block
            if (this.debugging) {
              console.log("adding ghostchain block! " + block_hash);
            }
            this.app.blockchain.addGhostToBlockchain(
              BigInt(syncobj.block_ids[i]),
              previous_block_hash,
              syncobj.block_ts[i],
              syncobj.prehash[i],
              syncobj.gts[i],
              block_hash
            );
          }

          previous_block_hash = block_hash;
        }

        break;
      }

      case MessageType.BlockchainRequest: {
        block_id = BigInt(0);
        block_hash = "";
        fork_id = "";
        publickey = "";
        bytes = message.message_data;

        block_id = this.app.binary.u64FromBytes(Buffer.from(bytes.slice(0, 8)));
        block_hash = Buffer.from(bytes.slice(8, 40), "hex").toString("hex");
        fork_id = Buffer.from(bytes.slice(40, 72), "hex").toString("hex");

        if (this.debugging) {
          console.log("RECEIVED REQCHAIN with fork_id: " + fork_id + " and block_id " + block_id);
        }

        const last_shared_ancestor = this.app.blockchain.generateLastSharedAncestor(
          block_id,
          fork_id
        );

        if (this.debugging) {
          console.log("last shared ancestor generated at: " + last_shared_ancestor);
        }

        //
        // notify peer of longest-chain after this amount
        //
        for (let i = last_shared_ancestor; i <= this.app.blockring.returnLatestBlockId(); i++) {
          block_hash = this.app.blockring.returnLongestChainBlockHashAtBlockId(i);
          if (block_hash !== "") {
            block = await this.app.blockchain.loadBlockAsync(block_hash);
            if (block) {
              this.propagateBlock(block, peer);
            }
          }
        }

        break;
      }

      case MessageType.GhostChainRequest: {
        block_hash = "";
        fork_id = "";
        publickey = peer.peer.publickey;
        bytes = message.message_data;

        block_id = this.app.binary.u64FromBytes(Buffer.from(bytes.slice(0, 8)));
        block_hash = Buffer.from(bytes.slice(8, 40), "hex").toString("hex");
        fork_id = Buffer.from(bytes.slice(40, 72), "hex").toString("hex");

        if (this.debugging) {
          console.log("RECEIVED REQGSTCN with fork_id: " + fork_id + " and block_id " + block_id);
        }

        let last_shared_ancestor = this.app.blockchain.generateLastSharedAncestor(
          block_id,
          fork_id
        );

        if (this.debugging) {
          console.log("last shared ancestor generated at: " + last_shared_ancestor);
        }

        if (last_shared_ancestor <= 0) {
          if (this.app.blockchain.returnLatestBlockId() > BigInt(10)) {
            last_shared_ancestor = this.app.blockchain.returnLatestBlockId() - BigInt(10);
          }
        }

        let syncobj = {
          start: "",
          prehash: new Array<string>(),
          previous_block_hash: new Array<string>(),
          block_ids: new Array<bigint>(),
          block_ts: new Array<number>(),
          txs: new Array<number>(),
          gts: new Array<boolean>(),
        };
        syncobj.start =
          this.app.blockring.returnLongestChainBlockHashAtBlockId(last_shared_ancestor);

        for (
          let i = last_shared_ancestor + BigInt(1);
          i <= this.app.blockring.returnLatestBlockId();
          i++
        ) {
          block_hash = this.app.blockring.returnLongestChainBlockHashAtBlockId(i);
          if (block_hash !== "") {
            if (this.app.blockchain.blocks.get(block_hash)) {
              let block = this.app.blockchain.blocks.get(block_hash);
              syncobj.gts.push(block.hasGoldenTicket());
              syncobj.block_ts.push(block.returnTimestamp());
              syncobj.prehash.push(block.prehash);
              syncobj.previous_block_hash.push(block.returnPreviousBlockHash());
              syncobj.block_ids.push(block.returnId());
              if (block.hasKeylistTransactions([publickey])) {
                syncobj.txs.push(1);
              } else {
                syncobj.txs.push(0);
              }
            }
          }
        }

        console.log("sync obj for gst chain : ", syncobj);

        this.sendRequest("GSTCHAIN", Buffer.from(JSON.stringify(syncobj)), peer);
        break;
      }

      //
      // this delivers the block as BlockType.Header
      //
      case MessageType.Block:
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
      case MessageType.BlockHeaderHash:
        block_hash = Buffer.from(message.message_data.slice(0, 32), "hex").toString("hex");
        block_id = this.app.binary.u64FromBytes(message.message_data.slice(32, 40));
        console.log("BlockHeaderHash received : " + block_hash);
        is_block_indexed = this.app.blockchain.isBlockIndexed(block_hash);
        if (!is_block_indexed) {
          this.blocks_to_fetch.push({ id: block_id, hash: block_hash, peer: peer });
          await this.fetchBlocks();
        }
        break;

      case MessageType.Transaction:
        tx = new Transaction();
        tx.deserialize(this.app, message.message_data, 0);
        // await this.app.mempool.addTransaction(tx);
        this.propagateTransaction(tx);
        break;

      // case "SNDKYLST":
      //   //await this.app.networkApi.sendAPIResponse(this.socket, "ERROR___", message.message_id, Buffer.from("UNHANDLED COMMAND", "utf-8"));
      //   break;

      case MessageType.ApplicationTransaction: {
        tx = new Transaction();
        tx.deserialize(this.app, message.message_data, 0);

        const mycallback = function (response_object) {
          peer.sendResponse(
            message.message_id,
            Buffer.from(JSON.stringify(response_object), "utf-8")
          );
        };

        await this.app.modules.handlePeerTransaction(tx, peer, mycallback);
        break;
      }

      case MessageType.ApplicationMessage: {
        let mdata;
        let reconstructed_obj;
        let reconstructed_message = "";
        let reconstructed_data: any = {};

        try {
          mdata = Buffer.from(message.message_data).toString("utf-8");
          // console.log("mdata = ",mdata);
          reconstructed_obj = JSON.parse(mdata);
          // console.log("obj = ",reconstructed_obj);
          reconstructed_message = reconstructed_obj.message;
          reconstructed_data = reconstructed_obj.data;
        } catch (err) {
          if (this.debugging) {
            console.log("Error reconstructing data: " + JSON.stringify(mdata) + " - " + err);
          }
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

        switch (message.message_type) {
          default:
            if (reconstructed_data) {
              if (reconstructed_data.transaction) {
                if (reconstructed_data.transaction.m) {
                  // backwards compatible - in case modules try the old fashioned way
                  if (msg.data.transaction.m.byteLength === 0) {
                    msg.data.transaction.msg = {};
                  } else {
                    msg.data.transaction.msg = JSON.parse(
                      this.app.crypto.base64ToString(
                        Buffer.from(msg.data.transaction.m).toString("base64")
                      )
                    );
                  }
                  msg.data.msg = msg.data.transaction.msg;
                }
              }
            }
            await this.app.modules.handlePeerRequest(msg, peer, mycallback);
        }
        break;
      }
      default:
        if (this.debugging) {
          console.error("Unhandled command received by client... " + message.message_type);
        }
        await this.app.networkApi.sendAPIResponse(
          peer.socket,
          MessageType.Error,
          message.message_id,
          Buffer.from("NO SUCH", "utf-8")
        );
        break;
    }
  }

  pollPeers() {
    let network_self = this;

    // console.debug(
    //   `polling peers [count = ${this.app.network.peers.length}][dead_peers = ${this.dead_peers.length}]`
    // );
    //
    // loop through peers to see if disconnected
    //
    this.app.network.peers.forEach((peer) => {
      if (peer.uses_stun) {
        return;
      }
      //
      // if disconnected, cleanupDisconnectedSocket
      // or reconnect if they're in our list of peers
      // to which to connect.
      //
      if (peer.socket.readyState === peer?.socket?.CLOSED) {
        if (!this.dead_peers.includes(peer)) {
          this.cleanupDisconnectedPeer(peer);
        }
      }
    });

    // limit amount of time nodes spend trying to reconnect to
    // prevent ddos issues.
    const peer_add_delay = this.peer_monitor_timer_speed - this.peer_monitor_connection_timeout;
    let unsuccessful_peers = this.dead_peers;
    this.dead_peers = []; // to capture peers failing at connection
    unsuccessful_peers.forEach((peer) => {
      setTimeout(() => {
        if (this.debugging) {
          console.log("Attempting to Connect to Peer!");
        }
        peer.socket = network_self.app.network.initializeWebSocket(
          peer,
          false,
          network_self.app.BROWSER == 1
        );
        if (this.debugging) {
          console.log("Attempt finished to Connect to Peer!");
        }
        let has_peer = false;
        // TODO : check performance impact and refactor this
        for (let peer2 of this.app.network.peers) {
          if (peer2.peer.host === peer.peer.host && peer2.peer.port === peer.peer.port) {
            has_peer = true;
            break;
          }
        }
        if (!has_peer) {
          this.app.network.peers.push(peer);
          this.peers_connected++;
        }
      }, peer_add_delay);
    });
  }

  //
  // propagate block
  //
  propagateBlock(blk: Block | null, peer = null) {
    if (this.app.BROWSER) {
      return;
    }
    //console.debug("network.propagateBlock", blk.returnHash());
    if (!blk) {
      return;
    }
    if (!blk.is_valid) {
      return;
    }

    const data = { bhash: blk.returnHash(), bid: blk.block.id };
    for (let i = 0; i < this.peers.length; i++) {
      if (peer === this.peers[i] || (!peer && this.peers[i].peer.sendblks === 1)) {
        let blockheader = Buffer.concat([
          Buffer.from(blk.returnHash(), "hex"),
          this.app.binary.u64AsBytes(blk.returnId()),
        ]);
        this.sendRequest("SNDBLKHH", blockheader, this.peers[i]);
      }
    }
  }

  //
  // propagate lite-chain
  //
  propagateLiteChain(litechain, peer = null) {
    if (this.debugging) {
      console.log("in propagate lite chain..");
    }

    if (this.app.BROWSER) {
      return;
    }
    if (peer == null) {
      return;
    }

    for (let i = 0; i < this.peers.length; i++) {
      if (peer === this.peers[i]) {
        if (this.debugging) {
          console.log("sending SPVCHAIN w " + JSON.stringify(litechain));
        }
        this.sendRequest("SPVCHAIN", Buffer.from(JSON.stringify(litechain), "utf8"), this.peers[i]);
      }
    }
  }

  //
  // propagate services
  //
  propagateServices(peer = null) {
    let my_services = [];
    for (let i = 0; i < this.app.modules.mods.length; i++) {
      let modservices = this.app.modules.mods[i].returnServices();
      if (modservices.length > 0) {
        for (let k = 0; k < modservices.length; k++) {
          my_services.push(modservices[k]);
        }
      }
    }

    if (peer == null) {
      for (let i = 0; i < this.peers.length; i++) {
        if (peer === this.peers[i] || (!peer && this.peers[i].peer.sendblks === 1)) {
          console.log("sending services request: " + JSON.stringify(my_services));
          this.sendRequest("SERVICES", Buffer.from(JSON.stringify(my_services)), this.peers[i]);
        }
      }
    } else {
      console.log("sending services request: " + JSON.stringify(my_services));
      this.sendRequest("SERVICES", Buffer.from(JSON.stringify(my_services)), peer);
    }
  }

  //
  // propagate transaction
  //
  propagateTransaction(tx: Transaction) {
    if (tx === null) {
      return;
    }
    if (!tx.transaction) {
      console.log("TX not found in propagate transaction");
      return;
    }
    if (!tx.transaction.from) {
      console.log("TX FROM not found in propagate transaction");
      return;
    }
    if (!tx.is_valid) {
      console.warn("tx is not valid. not propagating", tx);
      return;
    }

    for (let i = 0; i < tx.transaction.from.length; ++i) {
      tx.transaction.from[i].generateKey(this.app);
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
          if (this.debugging) {
            console.error("ERROR 810299: balking at propagating bad transaction");
          }
          if (this.debugging) {
            console.error("BAD TX: ", tx.transaction);
          }
          return;
        } else {
          if (this.debugging) {
            console.log(" ... added transaction : " + tx.transaction.sig);
          }
        }
        if (this.app.mempool.canBundleBlock()) {
          return;
        }
      }
    }

    console.log("propagating tx with sig: ", tx.transaction.sig);

    //
    // now send the transaction out with the appropriate routing hop
    //
    let fees = tx.returnFeesTotal();
    for (let i = 0; i < tx.path.length; i++) {
      fees = fees / BigInt(2);
    }
    this.peers.forEach((peer) => {
      if (peer.uses_stun) {
        return;
      }
      //&& fees >= peer.peer.minfee
      // console.log('peer ', pe)
      if (peer.peer.receivetxs === 0) {
        return;
      }
      if (!!tx.path && !peer.inTransactionPath(tx) && !!peer.returnPublicKey()) {
        const tmptx = peer.addPathToTransaction(tx);
        if (peer.socket && peer.socket.readyState === peer.socket.OPEN) {
          // 1 = WebSocket Open
          this.sendRequest("SNDTRANS", tmptx.serialize(this.app), peer);
        } else {
          if (!peer.socket) {
            if (this.debugging) {
              console.error("socket not found");
            }
          } else {
            if (this.debugging) {
              console.warn("not sending the transaction to peer as the socket is not open yet");
            }
          }
        }
      }
    });
  }

  requestBlockchain(peer: Peer | null = null) {
    let latest_block_id = this.app.blockring.returnLatestBlockId();
    let latest_block_hash = this.app.blockring.returnLatestBlockHash();
    let fork_id = this.app.blockchain.blockchain.fork_id;

    console.log(
      `requesting blockchain from peer : latest block id= ${latest_block_id} latest block hash = ${latest_block_hash} fork id = ${fork_id}`
    );

    if (this.app.BROWSER == 1) {
      if (this.app.blockchain.blockchain.last_block_id > latest_block_id) {
        latest_block_id = this.app.blockchain.blockchain.last_block_id;
        latest_block_hash = this.app.blockchain.blockchain.last_block_hash;
      }
    }
    if (!latest_block_id) {
      latest_block_hash = "0000000000000000000000000000000000000000000000000000000000000000";
    }
    if (!fork_id) {
      fork_id = "0000000000000000000000000000000000000000000000000000000000000000";
    }

    if (this.debugging) {
      console.log(
        "req blockchain with: " + latest_block_id + " and " + latest_block_hash + " and " + fork_id
      );
    }

    const buffer_to_send = Buffer.concat([
      this.app.binary.u64AsBytes(latest_block_id),
      Buffer.from(latest_block_hash, "hex"),
      Buffer.from(fork_id, "hex"),
    ]);

    for (let x = this.peers.length - 1; x >= 0; x--) {
      if (this.peers[x] === peer) {
        if (this.app.SPVMODE == 1) {
          console.log("requesting ghost chain from peer : " + peer.id);
          this.sendRequest("REQGSTCN", buffer_to_send, peer);
        } else {
          console.log("requesting full chain from peer : " + peer.id);
          this.sendRequest("REQCHAIN", buffer_to_send, peer);
        }
        return;
      }
    }

    if (this.peers.length > 0) {
      if (this.app.SPVMODE == 1) {
        console.log("requesting ghost chain from first peer");
        this.sendRequest("REQGSTCN", buffer_to_send, this.peers[0]);
      } else {
        console.log("requesting full chain from first peer");
        this.sendRequest("REQCHAIN", buffer_to_send, this.peers[0]);
      }
    }
  }

  sendRequest(message: string, data: any = "", peer: Peer = null) {
    if (peer !== null) {
      peer.sendRequest(message, data);
    } else {
      for (let x = this.peers.length - 1; x >= 0; x--) {
        this.peers[x].sendRequest(message, data);
      }
    }
  }

  sendTransaction(tx: any = "", peer: Peer = null) {
    if (peer !== null) {
      peer.sendTransactionWithCallback(tx);
    } else {
      for (let x = this.peers.length - 1; x >= 0; x--) {
        this.peers[x].sendTransactionWithCallback(tx);
      }
    }
  }

  //
  // a request formatted as a transaction with request / data (tx)
  //
  sendTransactionWithCallback(tx: any = "", callback, peer = null) {
    if (peer !== null) {
      for (let x = this.peers.length - 1; x >= 0; x--) {
        if (this.peers[x] === peer) {
          this.peers[x].sendTransactionWithCallback(tx, callback);
        }
      }
      return;
    }
    for (let x = this.peers.length - 1; x >= 0; x--) {
      this.peers[x].sendTransactionWithCallback(tx, callback);
    }
  }

  sendRequestWithCallback(message: string, data = "", callback, peer = null) {
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

  async fetchBlocks() {
    if (this.block_fetch_running) {
      return;
    }
    this.block_fetch_running = true;
    do {
      let promises = [];
      for (let i = 0; i < 100 && this.blocks_to_fetch.length > 0; ++i) {
        let entry = this.blocks_to_fetch.pop();
        promises.push(this.fetchBlock(entry.hash, entry.peer));
        // await this.fetchBlock(entry.hash, entry.peer);
      }
      await Promise.all(promises);
    } while (this.blocks_to_fetch.length > 0);
    this.block_fetch_running = false;
  }
}

export default Network;
