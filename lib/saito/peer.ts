import { Saito } from "../../apps/core";

import * as JSON from "json-bigint";
import Hop from "./hop";
import Transaction from "./transaction";
import { MessageType } from "./networkapi";

class Peer {
  public keep_alive_timer: any;
  public app: Saito;
  public id: number;
  public challenge: any;
  public initiated_handshake: boolean;
  public uses_stun = false;
  public stun = {
    publickey: "",
    data_channel: null,
    peer_connection: null,
  };
  public initial_sync_done = false;

  public peer = {
    host: "localhost",
    port: "12101",
    publickey: "",
    version: "",
    protocol: "http",
    synctype: "full", // full : full blocks
    block_fetch_url: "",
    services: [],
    // lite : lite blocks
    endpoint: {
      host: "localhost",
      port: "12101",
      publickey: "",
      protocol: "http",
    },

    receiveblks: 1,
    receivetxs: 1,
    receivegts: 1,
    sendblks: 1,
    sendtxs: 1,
    sendgts: 1,
    minfee: 0.001, // minimum propagation fee
    socket: {},
    modules: [],
    keylist: [],
  };

  public socket: any;

  constructor(app: Saito, peerjson = "") {
    this.app = app;

    this.id = new Date().getTime();
    this.keep_alive_timer = null;
    this.initiated_handshake = false;

    if (peerjson !== "") {
      try {
        const peerobj: any = JSON.parse(peerjson);
        if (peerobj.peer.endpoint == null) {
          peerobj.peer.endpoint = {};
          peerobj.peer.endpoint.host = peerobj.peer.host;
          peerobj.peer.endpoint.port = peerobj.peer.port;
          peerobj.peer.endpoint.protocol = peerobj.peer.protocol;
        }
        this.peer = { ...this.peer, ...peerobj.peer };
      } catch (err) {
        console.error(err);
      }
    }
  }

  addPathToTransaction(tx: Transaction): Transaction {
    const tmptx = tx.clone();

    // add our path
    const hop = new Hop();
    hop.from = this.app.wallet.returnPublicKey();
    hop.to = this.returnPublicKey();
    let buffer = Buffer.concat([
      Buffer.from(tx.transaction.sig, "hex"),
      Buffer.from(this.app.crypto.fromBase58(hop.to), "hex"),
    ]);

    hop.sig = this.app.crypto.signBuffer(buffer, this.app.wallet.returnPrivateKey());
    tmptx.path.push(hop);
    return tmptx;
  }

  inTransactionPath(tx) {
    if (tx == null) {
      return 0;
    }
    if (tx.isFrom(this.peer.publickey)) {
      return 1;
    }
    if (this.returnPublicKey() === "") {
      console.log("Anonymous peer publickey found, not forwarding!");
      return 1; // don't forward to anonymous peers
    }
    for (let i = 0; i < tx.path.length; i++) {
      if (tx.path[i].from === this.peer.publickey) {
        return 1;
      }
    }
    return 0;
  }

  isConnected() {
    if (this.uses_stun) {
      if (this.stun.data_channel.readyState === "open") {
        return true;
      }
      return false;
    } else {
      if (this.socket) {
        if (this.socket.readyState === this.socket.OPEN) {
          return true;
        }
      }
      return false;
    }
  }

  //
  // returns true if we are the first listed peer in the options file
  // TODO -- isFirstPeer
  isMainPeer() {
    if (this.app?.options?.peers?.length > 0) {
      const option_peer = this.app.options.peers[0];
      if (option_peer.host === this.peer.endpoint.host) {
        return true;
      }
      if (option_peer.host === this.peer.host) {
        return true;
      }
    }
    return false;
  }

  hasService(service) {
    for (let i = 0; i < this.peer.services.length; i++) {
      if (this.peer.services[i].service === service) {
        return 1;
      }
    }
    return 0;
  }

  //
  // keepAlive
  //
  keepAlive() {
    if (this.keep_alive_timer != null) {
      clearInterval(this.keep_alive_timer);
    }
    this.keep_alive_timer = setInterval(() => {
      try {
        this.sendRequest("PINGPING");
      } catch (err) {
        console.log("ping is not working");
      }
    }, 10000);
  }

  returnPublicKey() {
    return this.peer.publickey;
  }

  ////////////////
  // NETWORKING //
  ////////////////
  //
  // tags as response and sends as direct binary stream
  //
  async sendTransactionResponse(message_id, data) {
    let channel = this.uses_stun ? this.stun.data_channel : this.socket;
    await this.app.networkApi.sendAPIResponse(channel, MessageType.Result, message_id, data);
  }
  async sendResponse(message_id, data) {
    let channel = this.uses_stun ? this.stun.data_channel : this.socket;
    await this.app.networkApi.sendAPIResponse(channel, MessageType.Result, message_id, data);
  }
  sendRequestAsTransactionWithCallback(message: string, data: any = "", mycallback = null) {
    return this.sendRequestAsTransaction(message, data, mycallback);
  }
  sendRequestAsTransaction(message: string, data: any = "", mycallback = null) {

    if (mycallback == null) { mycallback = () => {}; }

    //
    // convert request to zero-fee transaction, send that
    //
    let newtx = this.app.wallet.createUnsignedTransaction(this.app.wallet.returnPublicKey(), BigInt(0), BigInt(0));
        newtx.msg.request = message;
        newtx.msg.data = data;
    //
    // everything but time-intensive sig
    //
    newtx.presign(this.app);

    this.sendTransactionWithCallback(newtx, mycallback);

    return;
  }
  
  sendRequest(message: string, data: any = "") {
    let socket = this.socket;
    if (this.uses_stun) {
      socket = this.stun.data_channel;
    }
    //
    // respect prohibitions
    //
    // console.debug("peer.sendRequest : " + message);
    // block as Block.serialize(BlockType.Header)

    if (message === "SNDBLOCK") {
      this.app.networkApi.send(socket, MessageType.Block, data);
      return;
    }
    // block as block_hash
    if (message === "SNDBLKHH") {
      this.app.networkApi.send(socket, MessageType.BlockHeaderHash, data);
      return;
    }
    // transaction as Transaction.serialize()
    if (message === "SNDTRANS") {
      this.app.networkApi.send(socket, MessageType.Transaction, data);
      return;
    }
    // transaction as Transaction.serialize()
    if (message === "REQGSTCN") {
      this.app.networkApi.send(socket, MessageType.GhostChainRequest, data);
      return;
    }
    if (message === "REQCHAIN") {
      this.app.networkApi.send(socket, MessageType.BlockchainRequest, data);
      return;
    }
    if (message === "SPVCHAIN") {
      this.app.networkApi.send(socket, MessageType.SPVChain, data);
      return;
    }
    if (message === "GSTCHAIN") {
      this.app.networkApi.send(socket, MessageType.GhostChain, data);
      return;
    }
    // json list of services running on server
    if (message === "SERVICES") {
      this.app.networkApi.send(socket, MessageType.Services, data);
      return;
    }
    if (message === "PINGPING") {
      this.app.networkApi.send(socket, MessageType.Ping, data);
      return;
    }

    //
    // alternately, we have a legacy transmission format, which is sent
    // as a JSON object for reconstruction and manipulation by apps on
    // the other side.
    //
    const data_to_send = { message: message, data: data };
    const buffer = Buffer.from(JSON.stringify(data_to_send), "utf-8");

    if (this.uses_stun && this.stun.data_channel.readyState === "open") {
      this.app.networkApi
        .sendAPICall(this.stun.data_channel, MessageType.ApplicationMessage, buffer)
        .then(() => {});
    } else {
      if (this.socket && this.socket.readyState === this.socket.OPEN) {
        this.app.networkApi
          .sendAPICall(this.socket, MessageType.ApplicationMessage, buffer)
          .then(() => {});
      } else {
        this.sendRequestWithCallbackAndRetry(message, data);
      }
    }
  }

  //
  // new default implementation
  //
  sendRequestWithCallback(message: string, data: any = "", callback = null, loop = true) {

    //
    // convert request to zero-fee transaction, send that
    //
    let newtx = this.app.wallet.createUnsignedTransaction(this.app.wallet.returnPublicKey(), BigInt(0), BigInt(0));
        newtx.msg.request = message;
        newtx.msg.data = data;
    //
    // everything but time-intensive sig
    //
    newtx.presign(this.app);
    
    this.sendTransactionWithCallback(newtx, callback);   
 
  }



  //
  // repeats until success. this should no longer be called directly, it is called by the
  // above functions in the event that socket transmission is unsuccessful. this is part of
  // our effort to simplify and move down to having only two methods for requesting
  // request emission.
  //
  sendRequestWithCallbackAndRetry(
    request,
    data = {},
    callback = null,
    initialDelay = 1000,
    delayFalloff = 1.3
  ) {
    //console.debug("sendRequestWithCallbackAndRetry");
    const callbackWrapper = (res) => {
      if (!res.err) {
        if (callback != null) {
          callback(res);
        }
      } else if (res.err === "Socket Not Connected") {
        setTimeout(() => {
          initialDelay = initialDelay * delayFalloff;
          this.sendRequestWithCallback(request, data, callbackWrapper, false);
        }, initialDelay);
      } else if (res.err === "Peer not found") {
        if (callback != null) {
          callback(res); // Server could not find peer,
        }
      } else {
        console.log("ERROR 12511: Unknown Error from socket...");
      }
    };
    this.sendRequestWithCallback(request, data, callbackWrapper, false);
  }

  //
  // new default implementation
  //
  sendTransactionWithCallback(tx: any = "", callback = null, loop = true) {
    if (this.uses_stun) {
      let data_channel = this.stun.data_channel;
      if (data_channel && data_channel.readyState === "open") {
        const buffer = tx.serialize(this.app);
        this.app.networkApi
          .sendAPICall(data_channel, MessageType.ApplicationTransaction, buffer)
          .then((response: Buffer) => {
            if (callback) {

              let newtx = new Transaction();
              newtx.deserialize(this.app, response, 0);
	      let txmsg = newtx.returnMessage();
              callback(txmsg.response);

              //let content = Buffer.from(response).toString("utf-8");
              //content = JSON.parse(content);
              //callback(content);
            }
          })
          .catch((error) => {
            console.error(error);
            if (callback) {
              callback({ err: error.toString() });
            }
          });
      } else {
        if (loop) {
          this.sendTransactionWithCallbackAndRetry(tx, callback);
        } else {
          if (callback) {
            callback({ err: "Socket Not Connected" });
          }
        }
      }
    } else if (this.socket) {
      if (this.socket && this.socket.readyState === this.socket.OPEN) {
        const buffer = tx.serialize(this.app);
        this.app.networkApi
          .sendAPICall(this.socket, MessageType.ApplicationTransaction, buffer)
          .then((response: Buffer) => {
            if (callback) {
              let newtx = new Transaction();
              newtx.deserialize(this.app, response, 0);
	      let txmsg = newtx.returnMessage();
              callback(txmsg.response);
            }
          })
          .catch((error) => {
            console.error(error);
            if (callback) {
              callback({ err: error.toString() });
            }
          });
      } else {
        if (loop) {
          this.sendTransactionWithCallbackAndRetry(tx, callback);
        } else {
          if (callback) {
            callback({ err: "Socket Not Connected" });
          }
        }
      }
    }
  }

  //
  // a version of sendRequestWithCallbackAndRetry that sends the TX
  //
  sendTransactionWithCallbackAndRetry(
    tx,
    callback = null,
    initialDelay = 1000,
    delayFalloff = 1.3
  ) {
    //console.debug("sendTransactionWithCallbackAndRetry");
    const callbackWrapper = (res) => {
      if (!res.err) {
        if (callback != null) {
          callback(res);
        }
      } else if (res.err === "Socket Not Connected") {
        setTimeout(() => {
          initialDelay = initialDelay * delayFalloff;
          this.sendTransactionWithCallback(tx, callbackWrapper, false);
        }, initialDelay);
      } else if (res.err === "Peer not found") {
        if (callback != null) {
          callback(res); // Server could not find peer,
        }
      } else {
        console.log("ERROR 12511: Unknown Error from socket...");
      }
    };
    this.sendTransactionWithCallback(tx, callbackWrapper, false);
  }
}

export default Peer;

