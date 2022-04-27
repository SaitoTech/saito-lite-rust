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
          app.BROWSER == 0 && (txmsg.request == "open" ||
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
          this.receiveOpenRequest(blk, tx, conf, app);
        }

        //
        // join invite
        //
        if (txmsg.request === "join") {
          this.joinGame(app, tx);
        }

        //
        // cancel invite
        //
        if (txmsg.request == "close") {
          this.closeGameInvite(blk, tx, conf, app);
        }

	//
	//
	//
        if (txmsg.request === "sorry") {
          //this.receiveSorryAcceptedTransaction(blk, tx, conf, app);
        }

        //
        // acceptances
        //
        if (txmsg.request === "accept") {
          this.acceptGame(app, tx);
	}

  }

  async handlePeerRequest(app, message, peer, mycallback = null) {

  }

  onInviteAccepted() {

  }

}

module.exports = InviteTemplate;


