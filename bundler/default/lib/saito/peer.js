const io = require('socket.io-client');
const saito = require('./saito');

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

  async connect(attempt=0) {
//    this.socket = await this.app.networkApi.wsConnectAndInitialize();
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



}

module.exports = Peer;

