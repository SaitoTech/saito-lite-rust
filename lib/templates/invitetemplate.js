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


  addInvite(tx) {

    for (let i = 0; i < this.invites.length; i++) {
      if (JSON.stringify(txmsg) === JSON.stringify(this.invites[i])) {
        return;
      }
    }

    this.invites.push(txmsg);
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



  async onConfirmation(blk, tx, confnum, app) {

    try {

      if (conf == 0) {

console.log("TESTING A");

        let txmsg = tx.returnMessage();

console.log(JSON.stringify(txmsg));

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
        if (txmsg.request === "open") {
console.log("OPEN: " + tx.returnMessage());
          this.receiveOpenTransaction(tx);
console.log("DONE OPEN");
        }

        //
        // join invite
        //
        if (txmsg.request === "join") {
          this.receiveJoinTransaction(tx);
        }

        //
        // cancel invite
        //
        if (txmsg.request == "close") {
          this.receiveCloseTransaction(tx);
        }

      	//
	      // "sorry, already accepted"
	      //
        if (txmsg.request === "sorry") {
          this.receiveSorryTransaction(tx);
        }


        //
        // acceptances
        //
        if (txmsg.request === "accept") {
          this.receiveAcceptTransaction(tx);
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





  createOpenTransaction(recipient, invite_obj) {

console.log("we have been asked to send an OPEN transaction");

    let newtx = this.app.wallet.createUnsignedTransaction(recipient);
    newtx.msg = {
      module : "Invites" ,
      request : "open" ,
      invite : invite_obj ,
    }

console.log(JSON.stringify(newtx.msg));

    newtx = this.app.wallet.signTransaction(newtx);
    this.app.network.propagateTransaction(newtx);

    let relay_mod = this.app.modules.returnModule("Relay");
    if (relay_mod) {
      relay_mod.sendRelayMessage([recipient, this.app.wallet.returnPublicKey()], `${this.returnSlug()} open`, newtx);
    }

  }
  receiveOpenTransaction(tx) {

    let found_invite = 0;

    for (let i = 0; i < this.app.options.invites.length; i++) {
      if ( this.app.options.invites[i].transaction.sig === tx.transaction.sig) {
	found_invite = 1;
      }
    }

    if (found_invite != 1) {
      tx.transaction.optional = {};
      tx.transaction.optional.invite_id = tx.transaction.sig;
console.log("HAVE NOT FOUND? in receive open transaction");
      this.addInvite(tx);
      this.onInvite(tx);
    }

  }






  createJoinTransaction(recipient, invite_obj) {

    let newtx = this.app.wallet.createUnsignedTransaction(recipient);
    newtx.msg = {
      module : "Invites" ,
      request : "join" ,
      invite : invite_obj ,
    }

    newtx = this.app.wallet.signTransaction(newtx);
    this.app.network.propagateTransaction(newtx);

    let relay_mod = this.app.modules.returnModule("Relay");
    if (relay_mod) {
      relay_mod.sendRelayMessage([recipient, this.app.wallet.returnPublicKey()], `${this.returnSlug()} join`, newtx);
    }

  }
  receiveJoinTransaction(tx) {

    let txs = [];
    let found_invite = 0;

    for (let i = 0; i < this.app.options.invites.length; i++) {
      if ( this.app.options.invites[i].transaction.sig === tx.transaction.sig) {
	found_invite = 1;
      }
      if ( this.app.options.invites[i].transaction.msg.invite_id === tx.transaction.sig) {
	txs.push(this.app.options.invites[i]);
        this.onJoin(txs);
      }
    }

    if (found_invite != 1) {
      this.addInvite(tx.returnMessage());
      txs.push(tx);
      this.onJoin(txs);
    }

  }


  createCloseTransaction(recipient, invite_obj) {

    let newtx = this.app.wallet.createUnsignedTransaction(recipient);
    newtx.msg = {
      module : "Invites" ,
      request : "close" ,
      invite : invite_obj ,
    }

    newtx = this.app.wallet.signTransaction(newtx);
    this.app.network.propagateTransaction(newtx);

    let relay_mod = this.app.modules.returnModule("Relay");
    if (relay_mod) {
      relay_mod.sendRelayMessage([recipient, this.app.wallet.returnPublicKey()], `${this.returnSlug()} close`, newtx);
    }

  }
  receiveCloseTransaction(tx) {

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

  createSorryTransaction(recipient, invite_obj) {

    let newtx = this.app.wallet.createUnsignedTransaction(recipient);
    newtx.msg = {
      module : "Invites" ,
      request : "sorry" ,
      invite : invite_obj ,
    }

    newtx = this.app.wallet.signTransaction(newtx);
    this.app.network.propagateTransaction(newtx);

    let relay_mod = this.app.modules.returnModule("Relay");
    if (relay_mod) {
      relay_mod.sendRelayMessage([recipient, this.app.wallet.returnPublicKey()], `${this.returnSlug()} sorry`, newtx);
    }

  }
  receiveSorryTransaction(tx) {

  }



  createAcceptTransaction(recipient, invite_obj) {

    let newtx = this.app.wallet.createUnsignedTransaction(recipient);
    newtx.msg = {
      module : "Invites" ,
      request : "sorry" ,
      invite : invite_obj ,
    }

    newtx = this.app.wallet.signTransaction(newtx);
    this.app.network.propagateTransaction(newtx);

    let relay_mod = this.app.modules.returnModule("Relay");
    if (relay_mod) {
      relay_mod.sendRelayMessage([recipient, this.app.wallet.returnPublicKey()], `${this.returnSlug()} accept`, newtx);
    }

  }

  receiveAcceptTransaction(tx) {

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



  async handlePeerRequest(app, message, peer, mycallback = null) {

    let tx = null;
    if (!message.data.tx) {
      tx = new saito.default.transaction(message.data.transaction);
    } else {
      return;
    }

    if (app.BROWSER == 0 && app.SPVMODE == 0) {
      this.notifyPeers(app, tx, message);
    }

    if (message.request === (this.returnSlug() + " open")) {
      this.receiveOpenTransaction(tx);
    }

    if (message.request === (this.returnSlug() + " join")) {
      this.receiveJoinTransaction(tx);
    }

    if (message.request === (this.returnSlug() + " close")) {
      this.receiveCloseTranaction(tx);
    }

    if (message.request === (this.returnSlug() + " sorry")) {
      this.receiveSorryTransaction(tx);
    }

    if (message.request === (this.returnSlug() + " accept")) {
      this.receiveAcceptTransaction(tx);
    }

  }

  onInviteAccepted() {
console.log("INVITE ACCEPTED!");
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
    if (this.app.options.invites) {
      this.invites = this.app.options.invites;
      return;
    }
    this.invites = {};
  }

  save() {
    this.app.options.invites = this.invites;
    this.app.storage.saveOptions();
  }


}

module.exports = InviteTemplate;


