const ModTemplate = require('./modtemplate');
const saito = require("./../saito/saito");

class InviteTemplate extends ModTemplate {

  constructor(app) {

    super(app);   

    this.invites = []; // unaccepted
    this.accepted = [];
    this.options = {}; // invite options

    if (!this.app?.options?.invites) { this.app.options.invites = []; }

    this.relay_mod = null;

    if (app.modules.returnModule("Relay")) { 
      this.relay_mod = app.modules.returnModule("Relay");
    }

  }

  initialize(app) {

    this.loadInvites();
    super.initialize(app);

    //
    // this should only load accepted Invites
    //
    app.storage.loadTransactions("Invites", 50, (txs) => {
      for (let i = 0; i < txs.length; i++) {
        txs[i].decryptMessage(app);
        this.app.connection.emit('event-render-request', txs[i]);
      }
    });

  }

  async handlePeerRequest(app, message, peer, mycallback = null) {
    super.handlePeerRequest(app, message, peer, mycallback);
  }


  addInvite(tx) {

    let txmsg = tx.returnMessage();

    //
    // insert invite_id if it does not already exist
    //
    if (!txmsg.invite) { return; }

    let invite = txmsg.invite;
    if (!invite.invite_id) { invite.invite_id = tx.transaction.sig; }

    //
    // check validity
    //
    if (!this.isValid(invite)) {
      return false;
    }

    for (let i = 0; i < tx.transaction.to.length; i++) {
      if (tx.transaction.to[i].add !== invite.creator) {
	invite.adds.push(tx.transaction.to[i].add);
	invite.terms.push("on review");
	invite.sigs.push("");
      }
    }
    
    for (let i = 0; i < this.invites.length; i++) {
      if (invite.invite_id === this.invites[i].invite_id) {
        return;
      }
    }

    this.invites.push(invite);
    this.saveInvites();

  }

  onInvite(tx) {

    //
    // if we have opened our own transactions with only ourselves
    // the invitation is equivalent to an acceptance.
    //
    let txmsg = tx.returnMessage();
    if (txmsg.invite.num == 1) {
      this.onAccept(tx);
    }

  }


  onJoin(txarray) {
    try { siteMessage("on join"); } catch (err) {}
  }
  onClose(txarray) {
    for (let i = 0; i < this.invites.length; i++) {
      if (txmsg.invite_id === this.invites[i].invite_id) {
        this.invites[i].status = "close";
        return;
      }
    }
  }
  onAccept(tx) {
console.log("----------------");
console.log("----------------");
console.log("---ON ACCEPT ---");
console.log("----------------");
console.log("----------------");
    try { siteMessage("on accept"); } catch (err) {}


    //
    // EVENTS are accepted invites that are saved
    // in storage so that we can retrieve them that
    // way when loading the calendar, etc.
    //
    this.app.storage.saveTransaction(tx);
    this.app.connection.emit('event-render-request', tx);
  }



  async onConfirmation(blk, tx, conf, app) {

    try {

      if (conf == 0) {

        let txmsg = tx.returnMessage();

        //
        // servers notify SPV clients
        //
        if (
          app.BROWSER == 0 && 
          txmsg.request === "open" ||
          txmsg.request === "invite" ||
          txmsg.request === "join" ||
          txmsg.request === "accept" ||
          txmsg.request === "close"
        ) {
          this.notifyPeers(app, tx);
        }

        //
        // open invite
        //
        if (txmsg.request === "open") {
          this.receiveOpenTransaction(tx);
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
        if (txmsg.request === "close") {
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





  createOpenTransaction(invite_obj = {}) {

    // {
    //   status 	: "open" ,
    //   type 		: "event" ,
    //   num 		: 2 ,
    //   date		: [timestamp] ,
    //   public 	: "public" ,
    //   terms  	: "on accept" ,
    //   invite_id 	: [tx_sig of original invite]
    //   adds		: [publickey1, publickey2, publickey3]
    //   terms		: ["on accept", "on accept"]
    // }
   

    //
    // set defaults
    //
    if (!invite_obj.invite_id)  { invite_obj.invite_id  = ""; }
    if (!invite_obj.status)     { invite_obj.status     = "open"; }			   // or "closed"
    if (!invite_obj.type)       { invite_obj.type       = "event"; }
    if (!invite_obj.num)        { invite_obj.num        = 1; }				   // min participants
    if (!invite_obj.min)        { invite_obj.min        = 1; }				   // min participants
    if (!invite_obj.max)        { invite_obj.max        = 1; }				   // max participants
    if (!invite_obj.datetime)   { invite_obj.datetime   = 0; }				   // timestamp
    if (!invite_obj.created_at) { invite_obj.created_at = new Date().getTime(); }	   // timestamp
    if (!invite_obj.public)     { invite_obj.public     = "public" }			   // or "private"
    if (!invite_obj.terms)      { invite_obj.terms      = ["on accept"]; }		   // on accept -- when respondent return valid sigs
    if (!invite_obj.creator)    { invite_obj.creator    = this.app.wallet.returnPublicKey(); }  // creator
    if (!invite_obj.adds)       { invite_obj.adds       = [this.app.wallet.returnPublicKey()]; }  // addressees
    if (invite_obj.num > invite_obj.adds.length) {
      if (!invite_obj.terms)    { invite_obj.terms      = ["on review"]; } 		   // on review when public
    } else {
      if (!invite_obj.terms)    { invite_obj.terms      = ["on accept"]; } 		   // on accept when private
    }
    if (!invite_obj.sigs)       { invite_obj.sigs       = [this.signInvite(invite_obj)]; } // sigs


    //
    // create accept if only me
    //
    if (invite_obj.adds.length == 1 && invite_obj.num == 1) {
      if (invite_obj.adds[0] === this.app.wallet.returnPublicKey()) {
        this.createAcceptTransaction(invite_obj);
        return;
      }
    }

    //
    // create transaction - to all participants
    //
    let newtx = this.app.wallet.createUnsignedTransaction(this.app.wallet.returnPublicKey());
    newtx.msg = {
      module : "Invites" ,
      request : "open" ,
      invite : invite_obj ,
    }
    for (let i = 0; i < invite_obj.adds.length; i++) {
      if (invite_obj.adds[i] !== "public") {
        newtx.transaction.to.push(new saito.default.slip(invite_obj.adds[i], 0.0));
      }
    }

    newtx = this.app.wallet.signTransaction(newtx);
    this.app.network.propagateTransaction(newtx);

    let relay_mod = this.app.modules.returnModule("Relay");
    if (relay_mod) {
      for (let i = 0; i < invite_obj.adds.length; i++) {
        if (invite_obj.adds[i] !== "public") {
          relay_mod.sendRelayMessage([invite_obj.adds[i], this.app.wallet.returnPublicKey()], `${this.returnSlug()} open`, newtx);
        }
      }
    }

  }
  signInvite(invite_obj, invite_id="") {
    for (let i = 0; i < invite_obj.adds.length; i++) {
      if (invite_obj.adds[i] === this.app.wallet.returnPublicKey()) {
        if (this.app.wallet.returnPublicKey() == invite_obj.creator) {
          return this.app.wallet.signMessage(`${invite_obj.created_at} ${invite_obj.terms[i]} ${invite_obj.adds[i]}`);
        } else {
          return this.app.wallet.signMessage(`${invite_id} ${invite_obj.terms[i]} ${invite_obj.adds[i]}`);
	}
      }
    }
    return "";
  }
  verifyInviteSig(invite_obj, publickey) {
    let publickey_found = 0; 
    for (let i = 0; i < invite_obj.adds.length; i++) {
      if (invite_obj.adds[i] === publickey) {
        publickey_found = 1; 
        if (invite_obj.creator === publickey) {
          if (this.app.crypto.verifyMessage(`${invite_obj.created_at} ${invite_obj.terms[i]} ${invite_obj.adds[i]}`, invite_obj.sigs[i], publickey) != true) { return false; }
        } else {
          if (this.app.crypto.verifyMessage(`${invite_id} ${invite_obj.terms[i]} ${invite_obj.adds[i]}`, invite_obj.sigs[i], publickey) != true) { return false; };
	}
      }
    }
    if (publickey_found == 0) { return false; }
    return true;
  }
  isValid(invite_obj) {
    for (let i = 0; i < invite_obj.adds.length; i++) {
      if (this.verifyInviteSig(invite_obj, invite_obj.adds[i]) == false) { return false; }
    }
    return true;
  }
  isAccepted(invite_obj, publickey) {
    for (let i = 0; i < invite_obj.adds.length; i++) {
      if (invite_obj.terms[i] === "on accept") {
        if (this.verifyInviteSig(invite_obj, invite_obj.adds[i]) == true) { return true; }
      }
    }
    return false; 
  }
  isPending(invite_obj, publickey) {
    for (let i = 0; i < invite_obj.adds.length; i++) {
      if (invite_obj.adds[i] === this.app.wallet.returnPublicKey()) {
        if (invite_obj.terms[i] === "on accept") {
          if (this.verifyInviteSig(invite_obj, invite_obj.adds[i]) == true) { return false; }
        }
        return true;
      }
    }
    return false; 
  }
  isPendingOthers(invite_obj) {
    // not enough participants
    if (invite_obj.adds.length < invite_obj.min) { return true; }
    // or someone else is "on review"
    for (let i = 0; i < invite_obj.adds.length; i++) {
      if (invite_obj.adds[i] !== this.app.wallet.returnPublicKey()) {
        if (invite_obj.terms[i] === "on review") {
	  return true;
        }
      }
    }
    return false; 
  }
  isPendingMe(invite_obj) {
    // not enough participants
    if (invite_obj.adds.length < invite_obj.min) { return false; }
    // if i am "on review"
    for (let i = 0; i < invite_obj.adds.length; i++) {
      if (invite_obj.adds[i] === this.app.wallet.returnPublicKey()) {
        if (invite_obj.terms[i] === "on review") {
	  return true;
        }
      }
    }
    return false; 
  }

  receiveOpenTransaction(tx) {

    let found_invite = 0;

    for (let i = 0; i < this.app.options.invites.length; i++) {
      if ( this.app.options.invites[i].transaction.sig === tx.transaction.sig) {
	found_invite = 1;
      }
    }

    if (found_invite != 1) {
      this.addInvite(tx);
    }


    this.onInvite(tx);
  }



  createJoinTransaction(invite_obj) {

    let obj = {};
    obj.module = "Invites";
    obj.request = "join";
    obj.invite = invite_obj;
   
    for (let i = 0; i < invite_obj.adds; i++) {
      if (invite_objs.adds[i] === this.wallet.returnPublicKey()) {
        invite_objs.terms[i] = "on accept";
        invite_objs.sigs[i] = this.app.wallet.signMessage(`${invite_id} ${invite_obj.terms[i]} ${invite_obj.adds[i]}`);
      }
    }

    let newtx = this.app.wallet.createUnsignedTransaction();
    for (let i = 0; i < invite_obj.adds; i++) {
      if (invite_obj.adds[i] != this.app.wallet.returnPublicKey()) {
        newtx.transaction.to.push(new saito.default.slip(invite_obj.adds[i]), 0.0);
      }
    }
    newtx.msg = {
      module : "Invites" ,
      request : "join" ,
      invite : invite_obj ,
    }

    newtx = this.app.wallet.signTransaction(newtx);
    this.app.network.propagateTransaction(newtx);

    let relay_mod = this.app.modules.returnModule("Relay");
    if (relay_mod) {
      relay_mod.sendRelayMessage(invite_obj.adds.filter(x => x !== 'public'), `${this.returnSlug()} join`, newtx);
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


  createCloseTransaction(invite_obj) {

    let newtx = this.app.wallet.createUnsignedTransaction(invite_obj.adds[0]);
    newtx.msg = {
      module : "Invites" ,
      request : "close" ,
      invite : invite_obj ,
    }
    for (let i = 1; i < invite_obj.adds.length; i++) {
      if (invite_obj.adds[i] !== "public") {
        newtx.transaction.to.push(new saito.default.slip(invite_obj.adds[i], 0.0));
      }
    }

    newtx = this.app.wallet.signTransaction(newtx);
    this.app.network.propagateTransaction(newtx);

    let relay_mod = this.app.modules.returnModule("Relay");
    if (relay_mod) {
      relay_mod.sendRelayMessage(invite_obj.adds.filter(x => x !== 'public'), `${this.returnSlug()} close`, newtx);
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
      this.addInvite(tx);
    }

    this.onClose(tx);

  }

  createSorryTransaction(invite_obj) {

    let newtx = this.app.wallet.createUnsignedTransaction(invite_obj.adds[0]);
    newtx.msg = {
      module : "Invites" ,
      request : "sorry" ,
      invite : invite_obj ,
    }
    for (let i = 1; i < invite_obj.adds.length; i++) {
      if (invite_obj.adds[i] !== "public") {
        newtx.transaction.to.push(new saito.default.slip(invite_obj.adds[i], 0.0));
      }
    }

    newtx = this.app.wallet.signTransaction(newtx);
    this.app.network.propagateTransaction(newtx);

    let relay_mod = this.app.modules.returnModule("Relay");
    if (relay_mod) {
      relay_mod.sendRelayMessage(invite_obj.adds.filter(x => x !== 'public'), `${this.returnSlug()} sorry`, newtx);
    }

  }
  receiveSorryTransaction(tx) {

  }


  

  createAcceptTransaction(invite_obj) {

    let newtx = this.app.wallet.createUnsignedTransaction(invite_obj.adds[0]);
    newtx.msg = {
      module : "Invites" ,
      request : "accept" ,
      invite : invite_obj ,
    }
    for (let i = 1; i < invite_obj.adds.length; i++) {
      if (invite_obj.adds[i] !== "public") {
        newtx.transaction.to.push(new saito.default.slip(invite_obj.adds[i], 0.0));
      }
    }

    newtx = this.app.wallet.signTransaction(newtx);
    this.app.network.propagateTransaction(newtx);

    let relay_mod = this.app.modules.returnModule("Relay");
    if (relay_mod) {
      relay_mod.sendRelayMessage(invite_obj.adds.filter(x => x !== 'public'), `${this.returnSlug()} accept`, newtx);
    }

  }

  receiveAcceptTransaction(tx) {

    let found_invite = 0;

    for (let i = 0; i < this.app.options.invites.length; i++) {
      if (this.app.options.invites[i].transaction.sig === tx.transaction.sig) {
	found_invite = 1;
      }
    }


    if (found_invite == 0) {
      this.addInvite(tx);
      this.onAccept(tx);
    }
  }



  async handlePeerRequest(app, message, peer, mycallback = null) {

    let tx = null;
    if (typeof (message.data.tx) != 'undefined') {
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

  loadInvites() {
    if (this.app.options.invites) {
      this.invites = this.app.options.invites;
      return;
    }
    this.invites = {};
  }

  saveInvites() {
    this.app.options.invites = this.invites;
    this.app.storage.saveOptions();
  }


  ////////////////////
  // Invite Options //
  ////////////////////
  resetInviteOptions() {
    this.options = {};
  }
  addPrivateSlotToInviteOptions(publickey) {

    if (!this.options) 		{ this.options = {}; }
    if (!this.options.adds) 	{ this.options.adds = []; }
    if (!this.options.num) 	{ this.options.num = 1; } else {
      this.options.num++;
    }
    if (!this.options.terms) 	{ this.options.terms = []; }

    if (!this.options.adds.includes(publickey)) {
      this.options.adds.push(publickey);
      this.options.terms.push("on accept");
      if (this.options.adds.length > 1) { this.options.num++; }
    }

    if (this.options.num > this.options.max) {
      this.options.max = this.options.num; 
    }
    if (this.options.num > this.options.min) {
      this.options.min = this.options.num; 
    }

  }
  addPublicSlotToInviteOptions() {
    
    if (!this.options) 		{ this.options = {}; }
    if (!this.options.adds) 	{ this.options.adds = []; }
    if (!this.options.num) 	{ this.options.num = 1; } else {
      this.options.num++;
    }

    if (this.options.num > this.options.max) {
      this.options.max = this.options.num; 
    }
    if (this.options.num > this.options.min) {
      this.options.min = this.options.num; 
    }

  }

}

module.exports = InviteTemplate;


