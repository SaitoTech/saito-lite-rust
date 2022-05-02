const ModTemplate = require('./modtemplate');
const saito = require("./../saito/saito");

class InviteTemplate extends ModTemplate {

  constructor(app) {

    super(app);   

    this.invites = []; // unaccepted
    this.accepted = [];

    if (!this.app?.options?.invites) { this.app.options.invites = []; }

    this.relay_mod = null;

    if (app.modules.returnModule("Relay")) { 
      this.relay_mod = app.modules.returnModule("Relay");
    }

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
          this.receiveInviteRequest(tx);
        }

        //
        // join invite
        //
        if (txmsg.request === "join") {
          this.receiveJoinRequest(tx);
        }

        //
        // cancel invite
        //
        if (txmsg.request == "close") {
          this.receiveCloseRequest(tx);
        }

      	//
	      // "sorry, already accepted"
	      //
        if (txmsg.request === "sorry") {
          this.receiveSorryRequest(tx);
        }


        //
        // acceptances
        //
        if (txmsg.request === "accept") {
          this.receiveAcceptRequest(tx);
      	}

      }

    } catch (err) {

    }

  }

  //
  // unaccepted invites
  //
  returnUnacceptedInvitesFromMe() {

    let invites = [];

    for (let i = 0; i < this.app.options.invites.length; i++) {
      let inv = this.app.options.invites[i];
      if (inv.transaction.from[0] === this.app.wallet.returnPublicKey()) {
        if (inv.transaction.msg.request === "open" || inv.transaction.msg.request === "invite") {
          let accept_found = 0;
          for (let z = 0; z < this.app.options.invites.length; z++) {
            let invz = this.app.options.invites[z];
            if (invz.transaction.msg.request === "accept") {
              if (invz.transaction.msg.invite_id == inv.transaction.sig) {
	        accept_found = 1;
	      }
 	    }
	  }
	  if (accept_found == 0) {
	    invites.push(inv);
  	  }
        }
      }
    }

    return invites;
  }

  returnUnacceptedInvitesToMe() {

    let invites = [];

    for (let i = 0; i < this.app.options.invites.length; i++) {
      let inv = this.app.options.invites[i];
      if (inv.transaction.from[0] !== this.app.wallet.returnPublicKey()) {
        if (inv.transaction.msg.request === "open" || inv.transaction.msg.request === "invite") {
          let accept_found = 0;
          for (let z = 0; z < this.app.options.invites.length; z++) {
            let invz = this.app.options.invites[z];
            if (invz.transaction.msg.request === "accept") {
              if (invz.transaction.msg.invite_id == inv.transaction.sig) {
	        accept_found = 1;
	      }
 	    }
	  }
	  if (accept_found == 0) {
	    invites.push(inv);
  	  }
        }
      }
    }

    return invites;
  }

  returnAcceptedInvitesFromMe() {

    let invites = [];

    for (let i = 0; i < this.app.options.invites.length; i++) {
      let inv = this.app.options.invites[i];
      if (inv.transaction.from[0] === this.app.wallet.returnPublicKey()) {
        if (inv.transaction.msg.request === "open" || inv.transaction.msg.request === "invite") {
          let accept_found = 0;
          for (let z = 0; z < this.app.options.invites.length; z++) {
            let invz = this.app.options.invites[z];
            if (invz.transaction.msg.request === "accept") {
              if (invz.transaction.msg.invite_id == inv.transaction.sig) {
	        accept_found = 1;
	      }
 	    }
	  }
	  if (accept_found == 1) {
	    invites.push(inv);
  	  }
        }
      }
    }

    return invites;
  }

  returnAcceptedInvitesToMe() {

    let invites = [];

    for (let i = 0; i < this.app.options.invites.length; i++) {
      let inv = this.app.options.invites[i];
      if (inv.transaction.from[0] !== this.app.wallet.returnPublicKey()) {
        if (inv.transaction.msg.request === "open" || inv.transaction.msg.request === "invite") {
          let accept_found = 0;
          for (let z = 0; z < this.app.options.invites.length; z++) {
            let invz = this.app.options.invites[z];
            if (invz.transaction.msg.request === "accept") {
              if (invz.transaction.msg.invite_id == inv.transaction.sig) {
	        accept_found = 1;
	      }
 	    }
	  }
	  if (accept_found == 1) {
	    invites.push(inv);
  	  }
        }
      }
    }

    return invites;
  }



  receiveInviteRequest(tx) {

    let found_invite = 0;

    for (let i = 0; i < this.app.options.invites.length; i++) {
      if ( this.app.options.invites[i].transaction.sig === tx.transaction.sig) {
	found_invite = 1;
      }
    }

    if (found_invite != 1) {
      tx.transaction.msg.invite_id = tx.transaction.sig;
      this.app.options.invites.push(tx);
      this.onInvite(tx);
    }

  }
  receiveJoinRequest(tx) {

    let txs = [];
    let found_invite = 0;

    for (let i = 0; i < this.app.options.invites.length; i++) {
      if ( this.app.options.invites[i].transaction.sig === tx.transaction.sig) {
	found_invite = 1;
      }
      if ( this.app.options.invites[i].transaction.msg.invite_id === tx.transaction.sig) {
	txs.push(this.app.options.invites[i]);
      }
    }

    if (found_invite != 1) {
      this.app.options.invites.push(tx);
      txs.push(tx);
      this.onJoin(txs);
    }

  }
  receiveCloseRequest(tx) {

    let txs = [];
    let found_invite = 0;

    for (let i = 0; i < this.app.options.invites.length; i++) {
      if ( this.app.options.invites[i].transaction.sig === tx.transaction.sig) {
	found_invite = 1;
      }
      if ( this.app.options.invites[i].transaction.msg.invite_id === tx.transaction.sig) {
	txs.push(this.app.options.invites[i]);
      }
    }

    if (found_invite != 1) {
      this.app.options.invites.push(tx);
      txs.push(tx);
      this.onClose(txs);
    }

  }
  receiveSorryRequest(tx) {

  }
  receiveAcceptRequest(tx) {

    let found_invite = 0;

    for (let i = 0; i < this.app.options.invites.length; i++) {
      if ( this.app.options.invites[i].transaction.sig === tx.transaction.sig) {
	found_invite = 1;
      }
    }

    if (found_invite != 1) {
      this.app.options.invites.push(tx);
      this.onAccept(tx);
    }
  }

  onInvite(tx) {
try { siteMessage("on invite"); } catch (err) {}
  }
  onJoin(txarray) {
try { siteMessage("on join"); } catch (err) {}
  }
  onClose(txarray) {
try { siteMessage("on close"); } catch (err) {}
  }
  onAccept(tx) {
try { siteMessage("on accept"); } catch (err) {}
  }

  async handlePeerRequest(app, message, peer, mycallback = null) {

    let tx = null;
    if (!message.data.tx) {
      tx = new saito.default.transaction(message.data.transaction);
    } else {
      return;
    }

try {
console.log("HPR MESSAGE: " + tx.transaction.msg.request);
} catch (err) {}


    if (app.BROWSER == 0 && app.SPVMODE == 0) {
      this.notifyPeers(app, tx, message);
    }

    if (message.request === (this.returnSlug() + " open") || message.request === (this.returnSlug() + " invite")) {
      this.receiveInviteRequest(tx);
    }

    if (message.request === (this.returnSlug() + " join")) {
      this.receiveJoinRequest(tx);
    }

    if (message.request === (this.returnSlug() + " close")) {
      this.receiveCloseRequest(tx);
    }

    if (message.request === (this.returnSlug() + " sorry")) {
      this.receiveSorryRequest(tx);
    }

    if (message.request === (this.returnSlug() + " accept")) {
      this.receiveAcceptRequest(tx);
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

  load() {
    if (this.mixin.publickey !== "") {
      this.account_created = 1;
    }
  }

  save() {
    this.app.options.mixin = this.mixin;
    this.app.storage.saveOptions();
  }

}

module.exports = InviteTemplate;


