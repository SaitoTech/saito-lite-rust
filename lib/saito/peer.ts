import { Saito } from "../../apps/core";

import * as JSON from "json-bigint";
import Hop from "./hop";
import Transaction from "./transaction";

class Peer {
  public keep_alive_timer: any;
  public app: Saito;
  public id: number;
  public peer = {
    host: "localhost",
    port: "12101",
    publickey: "",
    version: "",
    protocol: "http",
    synctype: "full", // full : full blocks
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
    hop.from = this.app.crypto.fromBase58(this.app.wallet.returnPublicKey());
    hop.to = this.app.crypto.fromBase58(this.returnPublicKey());
    hop.sig = this.app.crypto.signMessage(hop.to, this.app.wallet.returnPrivateKey());

    tmptx.transaction.path.push(hop);
    return tmptx;
  }

  inTransactionPath(tx) {
    if (tx == null) {
      return 0;
    }
    if (tx.isFrom(this.peer.publickey)) {
      return 1;
    }
    for (let i = 0; i < tx.transaction.path.length; i++) {
      if (tx.transaction.path[i].from === this.peer.publickey) {
        return 1;
      }
    }
    return 0;
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
      if (this.peer.services[i].service === service) { return 1; }
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
        // console.log("send ping request...");
        this.sendRequest("PINGPING");
      } catch (err) {
        console.log("ping is not working");
      }
    }, 10000);
  }

  returnPublicKey() {
    return this.peer.publickey;
  }

  //
  // no checks on socket state necessary when sending response
  //
  async sendResponse(message_id, data) {
    await this.app.networkApi.sendAPIResponse(this.socket, "RESULT__", message_id, data);
  }

  sendRequest(message: string, data: any = "") {
    //
    // respect prohibitions
    //
    // console.debug("peer.sendRequest : " + message);
    // block as Block.serialize(BlockType.Header)
    if (message === "SNDBLOCK") {
      this.app.networkApi.send(this.socket, "SNDBLOCK", data);
      return;
    }
    // block as block_hash
    if (message === "SNDBLKHH") {
      this.app.networkApi.send(this.socket, "SNDBLKHH", data);
      return;
    }
    // transaction as Transaction.serialize()
    if (message === "SNDTRANS") {
      this.app.networkApi.send(this.socket, "SNDTRANS", data);
      return;
    }
    // transaction as Transaction.serialize()
    if (message === "REQGSTCN") {
      this.app.networkApi.send(this.socket, "REQGSTCN", data);
      return;
    }
    if (message === "REQCHAIN") {
      this.app.networkApi.send(this.socket, "REQCHAIN", data);
      return;
    }
    if (message === "SPVCHAIN") {
      this.app.networkApi.send(this.socket, "SPVCHAIN", data);
      return;
    }
    if (message === "GSTCHAIN") {
      this.app.networkApi.send(this.socket, "GSTCHAIN", data);
      return;
    }
    // json list of services running on server
    if (message === "SERVICES") {
      this.app.networkApi.send(this.socket, "SERVICES", data);
      return;
    }
    if (message === "PINGPING") {
      this.app.networkApi.send(this.socket, "PINGPING", data);
      return;
    }

    //
    // alternately, we have a legacy transmission format, which is sent
    // as a JSON object for reconstruction and manipulation by apps on
    // the other side.
    //
    const data_to_send = { message: message, data: data };
    const buffer = Buffer.from(JSON.stringify(data_to_send), "utf-8");

    if (this.socket && this.socket.readyState === this.socket.OPEN) {
      this.app.networkApi.sendAPICall(this.socket, "SENDMESG", buffer).then(() => {
        //console.debug("message sent with sendRequest");
      });
    } else {
      this.sendRequestWithCallbackAndRetry(message, data);
    }
  }

  //
  // new default implementation
  //
  sendRequestWithCallback(message, data: any = "", callback = null, loop = true) {
    //console.log("sendRequestWithCallback : " + message);
    //
    // respect prohibitions
    //
    if (this.peer.receiveblks === 0 && message === "block") {
      return;
    }
    if (this.peer.receiveblks === 0 && message === "blockchain") {
      return;
    }
    if (this.peer.receivetxs === 0 && message === "transaction") {
      return;
    }
    if (this.peer.receivegts === 0 && message === "golden ticket") {
      return;
    }

    const data_to_send = { message: message, data: data };
    const buffer = Buffer.from(JSON.stringify(data_to_send), "utf-8");

    if (this.socket && this.socket.readyState === this.socket.OPEN) {
      this.app.networkApi
        .sendAPICall(this.socket, "SENDMESG", buffer)
        .then((response: Buffer) => {
          //console.log("RESPONSE RECEIVED: ", response);
          if (callback) {
            let content = Buffer.from(response).toString("utf-8");
            content = JSON.parse(content);
            callback(content);
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
        //console.log("send request with callback and retry!");
        this.sendRequestWithCallbackAndRetry(message, data, callback);
      } else {
        if (callback) {
          callback({ err: "Socket Not Connected" });
        }
      }
    }
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
}

export default Peer;
