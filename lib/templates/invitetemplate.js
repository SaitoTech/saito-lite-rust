const ModTemplate = require('./modtemplate');

class InviteTemplate extends ModTemplate {

  constructor(app) {

    super(app);   

  }

  async onConfirmation(blk, tx, confnum, app) {

    try {

      if (conf == 0) {

        let txmsg = tx.returnMessage();

        //
        // servers notify SPV clients
        //
        if (
          app.BROWSER == 0 && 
          txmsg.request == "open" ||
          txmsg.request == "invite" ||
          txmsg.request == "join" ||
          txmsg.request == "accept" ||
          txmsg.request == "close"
        ) {
          this.notifyPeers(app, tx);
        }

        //
        // open invite
        //
        if (txmsg.request === "invite" || txmsg.request === "open") {
          this.receiveInviteRequest(app, tx);
        }

        //
        // join invite
        //
        if (txmsg.request === "join") {
          this.receiveJoinRequest(app, tx);
        }

        //
        // cancel invite
        //
        if (txmsg.request == "close") {
          this.receiveCloseRequest(app, tx);
        }

	//
	// "sorry, already accepted"
	//
        if (txmsg.request === "sorry") {
          this.receiveSorryRequest(appm tx);
        }

        //
        // acceptances
        //
        if (txmsg.request === "accept") {
          this.receiveAcceptRequest(app, tx);
	}

      }

    } catch (err) {

    }

  }

  async handlePeerRequest(app, message, peer, mycallback = null) {

    let request_header = this.returnSlug() " + " spv ";
    let tx = null;
    if (!message.data.tx) {
      tx = new saito.default.transaction(message.data.transaction);
    } else {
      return;
    }

    if (app.BROWSER == 0 && app.SPVMODE == 0) {
      this.notifyPeers(app, tx, message);
    }

    if (message.request === (this.returnSlug() + " open") || message.request === (this.returnSlug() + " invite")) {
      this.receiveInviteRequest(app, tx);
    }

    if (message.request === (this.returnSlug() + " open") || message.request === (this.returnSlug() + " invite")) {
      this.receiveJoinRequest(app, tx);
    }

    if (message.request === (this.returnSlug() + " open") || message.request === (this.returnSlug() + " invite")) {
      this.receiveSorryRequest(app, tx);
    }

    if (message.request === (this.returnSlug() + " open") || message.request === (this.returnSlug() + " invite")) {
      this.receiveAcceptRequest(app, tx);
    }

  }

  onInviteAccepted() {

  }


  notifyPeers(app, tx, message) {
    if (app.BROWSER == 1) {
      return;
    }
    for (let i = 0; i < app.network.peers.length; i++) {
      if (app.network.peers[i].peer.synctype == "lite") {
        let message = {};
        message.request = message.request;
        message.data = {};
        message.data.tx = tx;
        app.network.peers[i].sendRequest(message.request, message.data);
      }
    }
  }




}

module.exports = InviteTemplate;


