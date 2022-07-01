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

    let txmsg = tx.returnMessage();

    //
    // insert invite_id if it does not already exist
    //
    if (!txmsg.invite_id) { txmsg.invite_id = tx.transaction.sig; }

    //
    // check validity
    //
    if (!this.isValid(txmsg.invite)) {
console.log("THIS INVITATION IS INVALID!");
      return false;
    }


    for (let i = 0; i < tx.transaction.to.length; i++) {
      if (tx.transaction.to[i].add !== txmsg.creator) {
	txmsg.recipients.push(tx.transaction.to[i]);
      }
    }
    
    for (let i = 0; i < this.invites.length; i++) {
      if (txmsg.invite_id === this.invites[i].invite_id) {
        return;
      }
    }


    this.invites.push(txmsg);

  }

  onInvite(tx) {
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
    try { siteMessage("on accept"); } catch (err) {}
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

    //
    // example invite_obj 
    // 
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
   

    let newtx = this.app.wallet.createUnsignedTransaction(recipient);
    newtx.msg = {
      module : "Invites" ,
      request : "open" ,
      invite : invite_obj ,
    }

    //
    // set defaults
    //
    if (!invite_obj.invite_id)  { invite_obj.status     = "open"; }			   // or "closed"
    if (!invite_obj.status)     { invite_obj.status     = "open"; }			   // or "closed"
    if (!invite_obj.type)       { invite_obj.type       = "event"; }
    if (!invite_obj.min)        { invite_obj.min        = 2; }				   // min participants
    if (!invite_obj.max)        { invite_obj.max        = 2; }				   // max participants
    if (!invite_obj.date)       { invite_obj.date       = 0; }				   // timestamp
    if (!invite_obj.created_at) { invite_obj.created_at = new Date().getTime(); }	   // timestamp
    if (!invite_obj.public)     { invite_obj.public     = "public" }			   // or "private"
    if (!invite_obj.terms)      { invite_obj.terms      = "on accept"; }		   // on accept -- when respondent return valid sigs
    if (!invite_obj.creator)    { invite_obj.creator    = newtx.transaction.from[0].add; }  // creator
    if (!invite_obj.adds)       { invite_obj.adds       = [newtx.transaction.from[0].add]; }  // addressees
    if (!invite_obj.sigs)       { invite_obj.sigs       = [this.signInvite(invite_obj)]; } // sigs
    if (!invite_obj.terms)      { invite_obj.terms      = ["on accept"]; } 		   // or "on review"
    //

    newtx = this.app.wallet.signTransaction(newtx);
    this.app.network.propagateTransaction(newtx);

    let relay_mod = this.app.modules.returnModule("Relay");
    if (relay_mod) {
      relay_mod.sendRelayMessage([recipient, this.app.wallet.returnPublicKey()], `${this.returnSlug()} open`, newtx);
    }

  }
  signInvite(invite_obj, invite_id="") {

    //
    // the first time, the sig isn't set
    //
    if (!invite_obj.sigs) { invite_obj.sigs = []; }
    if (invite_obj.sigs.length == 0) { invite_obj.sigs = [invite_obj.creator]; }

    for (let i = 0; i < invite_obj.adds.length; i++) {
      if (invite_obj.adds[i] === this.app.wallet.returnPublicKey()) {
        if (this.app.wallet.returnPublicKey() == invite_obj.creator) {
          invite_obj.sigs[i] = this.app.wallet.signMessage(`${invite_obj.created_at} ${invite_obj.terms[i]} ${invite_obj.adds[i]} ${invite_obj.sigs[i]}`);
        } else {
          invite_obj.sigs[i] = this.app.wallet.signMessage(`${invite_id} ${invite_obj.terms[i]} ${invite_obj.adds[i]} ${invite_obj.sigs[i]}`);
	}
      }
    }
  }
  verifyInviteSig(publickey, invite_obj) {
    for (let i = 0; i < invite_obj.adds.length; i++) {
      let publickey_found = 0; 
      if (invite_obj.adds[i] === publickey) {
        publickey_found = 1; 
        if (invite_obj.creator === publickey) {
          if (this.app.crypto.verifyMessage(`${invite_obj.created_at} ${invite_obj.terms[i]} ${invite_obj.adds[i]} ${invite_obj.sigs[i]}}`, invite_obj.sigs[i], publickey) != true) { return false; }
        } else {
          if (this.app.crypto.verifyMessage(`${invite_id} ${invite_obj.terms[i]} ${invite_obj.adds[i]} ${invite_obj.sigs[i]}}`, invite_obj.sigs[i], publickey) != true) { return false; };
	}
      }
    }
    if (publickey_found == 0) { return false; }
    return true;
  }
  isValid(invite_obj) {
    for (let i = 0; i < invite_obj.adds.length; i++) {
      if (verifyInviteSig(invite_obj.adds[i], invite_obj) == false) { return false; }
    }
    return true;
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



  createJoinTransaction(recipient, invite_id) {

    let obj = {};
    obj.module = "Invites";
    obj.request = "join";
    obj.invite = {};
   
    for (let i = 0; i < this.invites.length; i++) {
      if (this.invites[i].invite_id === invite_id) {
	obj.invite = JSON.parse(JSON.stringify(this.invites[i].invite_id));
      }
    }

    txmsg.invite_id = tx.transaction.sig;
    txmsg.created_at = tx.transaction.ts;
    txmsg.creator = tx.transaction.from[0];
    txmsg.recipients = [];
    txmsg.sigs = [];
    for (let i = 0; i < tx.transaction.to.length; i++) {
      if (tx.transaction.to[i].add !== txmsg.creator) {
        txmsg.recipients.push(tx.transaction.to[i]);
      }
    }

    for (let i = 0; i < this.invites.length; i++) {
      if (txmsg.invite_id === this.invites[i].invite_id) {
        return;
      }
    }

    let newtx = this.app.wallet.createUnsignedTransaction(recipient);
    newtx.msg = {
      module : "Invites" ,
      request : "join" ,
      invite : invite_obj ,
    }

    let tx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
    tx.transaction.to.push(new saito.default.slip(gametx.transaction.from[0].add, 0.0));
    tx.transaction.to.push(new saito.default.slip(this.app.wallet.returnPublicKey(), 0.0));
    tx.msg.ts = "";
    tx.msg.module = txmsg.game;
    tx.msg.request = "join";
    tx.msg.game_id = gametx.transaction.sig;
    tx.msg.players_needed = parseInt(txmsg.players_needed);
    tx.msg.options = txmsg.options;
    tx.msg.invite_sig = this.app.crypto.signMessage(
      "invite_game_" + gametx.msg.ts,
      this.app.wallet.returnPrivateKey()
    );
    if (gametx.msg.ts != "") {
      tx.msg.ts = gametx.msg.ts;
    }
    tx = this.app.wallet.signTransaction(tx);



    return tx;

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
    }

    this.onClose(tx);

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


