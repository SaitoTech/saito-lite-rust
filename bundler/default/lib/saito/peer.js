const io = require('socket.io-client');
const saito = require('./saito');
const JSON = require('json-bigint');

class Peer {

  constructor(app, peerjson = "") {

    this.app = app || {};

    this.peer = {};
    this.peer.host = "localhost";
    this.peer.port = "12101";
    this.peer.publickey = "";
    this.peer.version = "";
    this.peer.protocol = "http";
    this.peer.synctype = "full";         // full = full blocks
                                         // lite = lite blocks
    this.peer.endpoint = {};
    this.peer.endpoint.host = "localhost";
    this.peer.endpoint.port = "12101";
    this.peer.endpoint.publickey = "";
    this.peer.endpoint.protocol = "http";

    this.peer.receiveblks = 1;
    this.peer.receivetxs = 1;
    this.peer.receivegts = 1;
    this.peer.sendblks = 1;
    this.peer.sendtxs = 1;
    this.peer.sendgts = 1;

    this.peer.minfee = 0.001;    // minimum propagation fee
    this.peer.socket = {};
    this.peer.modules = [];
    this.peer.keylist = [];

    if (peerjson != "") {
      let peerobj = JSON.parse(peerjson);
      if (peerobj.peer.endpoint == null) {
        peerobj.peer.endpoint = {};
        peerobj.peer.endpoint.host = peerobj.peer.host;
        peerobj.peer.endpoint.port = peerobj.peer.port;
        peerobj.peer.endpoint.protocol = peerobj.peer.protocol;
      }
      this.peer = peerobj.peer;
    }
  } 


  addPathToTransaction(tx) {

    var tmptx = tx.clone();

    // add our path
    var hop = new saito.hop();
    hop.from = this.app.wallet.returnPublicKey();
    hop.to = this.returnPublicKey();
    hop.sig = this.app.crypto.signMessage(hop.to, this.app.wallet.returnPrivateKey());

    tmptx.transaction.path.push(hop);
    return tmptx;

  }


  async connect(attempt=0) {
    this.socket = await this.app.networkApi.wsConnectAndInitialize(this.peer.protocol, this.peer.host, this.peer.port);
  }


  //
  // delete before we close
  //
  disconnect() {

    try {

      let socket_id = this.socket.id;

      try {
        this.socket.close();
      } catch (err) {
        console.log("error with socket.close on "+socket_id);
      }

      delete this.socket;

    } catch (err) {
      console.log("ERROR 582034: error closing websocket: " + err);
    }

  }

  inTransactionPath(tx) {
    if (tx == null) { return 0; }
    if (tx.isFrom(this.peer.publickey)) { return 1; }
    for (let i = 0; i < tx.transaction.path.length; i++) {
      if (tx.transaction.path[i].from == this.peer.publickey) { return 1; }
    }
    return 0;
  }


  returnPublicKey() {
    return this.peer.publickey;
  }


  sendRequest(message, data = "") {

    //
    // respect prohibitions
    //
    if (this.peer.receiveblks == 0 && message == "block") { return; }
    if (this.peer.receiveblks == 0 && message == "blockchain") { return; }
    if (this.peer.receivetxs == 0 && message == "transaction") { return; }
    if (this.peer.receivegts == 0 && message == "golden ticket") { return; }

    // find out initial state of peer and blockchain
    var um = {};
    um.request = message;
    um.data = data;

    if (this.socket != null) {
      if (this.socket.connected == true && this.socket.readyState === this.socket.OPEN) {
        // This sometimes causes and exception to be thrown on Chrome but it cannot be
        // caught because it is within another v8 loop
        try {
          this.socket.emit('request', JSON.stringify(um));
        } catch (err) {
	  console.log("Error: likely Chrome internal issue with V8 engine loop on socket communications");
	}
      } else {
        console.log("Socket Not Connected");
	this.sendRequestWithCallbackAndRetry(message, data);
      }
    }
  }


  //
  // new default implementation
  //
  sendRequestWithCallback(request, data = {}, callback=null) {

    //
    // respect prohibitions
    //
    if (this.peer.receiveblks == 0 && message == "block") { return; }
    if (this.peer.receiveblks == 0 && message == "blockchain") { return; }
    if (this.peer.receivetxs == 0 && message == "transaction") { return; }
    if (this.peer.receivegts == 0 && message == "golden ticket") { return; }

    var requestMessage = {};
    requestMessage.request = request;
    requestMessage.data = data;

    if (this.socket != null && this.socket.connected && this.socket.readyState === this.socket.OPEN) {
      this.socket.emit('request', JSON.stringify(requestMessage), function (res) {
	if (callback != null) {
          callback(res);
	}
      });
    } else {
      callback({err: "Socket Not Connected"});
      this.sendRequestWithCallbackAndRetry(message, data, callback);
    }
  }

  //
  // repeats until success. this should no longer be called directly, it is called by the 
  // above functions in the event that socket transmission is unsuccessful. this is part of
  // our effort to simplify and move down to having only two methods for requesting 
  // request emission.
  //
  sendRequestWithCallbackAndRetry(request, data = {}, callback = null, initialDelay = 1000, delayFalloff = 1.3) {
    let callbackWrapper = (res) => {
      if(!res.err) {
	if (callback != null) {
          callback(res);
	}
      } else if(res.err === "Socket Not Connected") {
        setTimeout((() => {
          initialDelay = initialDelay * delayFalloff;
          this.sendRequestWithCallback(request, data, callbackWrapper);
        }), initialDelay);
      } else if(res.err === "Peer not found") {
	if (callback != null) {
          callback(res); // Server could not find peer,
	}
      } else  {
        console.log("ERROR 12511: Unknown Error from socket...")
      }
    }
    this.sendRequestWithCallback(request, data, callbackWrapper);
  }



}

module.exports = Peer;

