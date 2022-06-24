var saito = require('../../lib/saito/saito');
var InviteTemplate = require('../../lib/templates/invitetemplate');
const InvitesEmailAppspace = require('./lib/email-appspace/email-appspace');


class Invites extends InviteTemplate {

  constructor(app) {
    super(app);

    this.app            = app;
    this.name           = "Invites";
    this.description    = "Demo module with UI for invite display and acceptance";
    this.categories     = "Utilities Education Demo";

    this.invites        = [];

    return this;
  }


  initialize(app) {
    this.load();
  }



  respondTo(type) {

//    if (type == 'email-appspace') {
//      return new InvitesEmailAppspace(this.app, this);
//    }

    return null;
  }


  addInvite(tx) {

    let txmsg = tx.returnMessage();

    for (let i = 0; i < this.invites.length; i++) {
      if (JSON.stringify(txmsg) === JSON.stringify(this.invites[i])) {
	return;
      }
    }

    this.invites.push(txmsg);
  }


  async onConfirmation(blk, tx, conf, app) {

    let txmsg = tx.returnMessage();

console.log("we are here with the txmsg: " + txmsg);

    try {
      if (conf == 0) {
        if (txmsg.request === "open") {
console.log("open 1");
          this.receiveOpenTransaction(blk, tx, conf, app);
console.log("open 2");
        }
      }
    } catch (err) {
      console.log("ERROR in invites onConfirmation: " + err);
    }
  }




  createOpenTransaction(recipient, invite_obj) {

    let newtx = this.app.wallet.createUnsignedTransaction(recipient);
    newtx.transaction.msg = {
      module : "Invites" ,
      request : "open" ,
      invite : invite_obj ,
    }

    newtx = this.app.wallet.signTransaction(newtx);
    this.app.network.propagateTransaction(newtx);

console.log("WE SENT: " + JSON.stringify(newtx));

    let relay_mod = this.app.modules.returnModule("Relay");
    if (relay_mod) {
      relay_mod.sendRelayMessage([recipient, this.app.wallet.returnPublicKey()], "invites open", newtx);
    }

  }
  receiveOpenTransaction(blk, tx, conf, app) {
    this.addInvite(tx);
    this.save();
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


module.exports = Invites;

