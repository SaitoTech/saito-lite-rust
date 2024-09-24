var ModTemplate = require('../../lib/templates/modtemplate');
const Transaction = require('../../lib/saito/transaction').default;

class Tutorial02 extends ModTemplate {

  constructor(app) {

    super(app);

    this.name            = "Tutorial02";
    this.slug            = "tutorial02";
    this.description     = "Listening for Chat Messages";

    return this;

  }

  shouldAffixCallbackToModule(modname) {
    if (modname == this.name) { return 1; }
    if (modname == 'Chat') { return 1; }
    if (modname == 'Relay') { return 1; }
    return 0;
  }

  async onConfirmation(blk, tx, conf) {
    let txmsg = tx.returnMessage();
    if (conf == 0) {
      if (txmsg.module == "Chat") {		
        modself.processChatTransaction(txmsg);
      }
    }
  }

  async handlePeerTransaction(app, tx, peer, mycallback = null) {
    let txmsg = tx.returnMessage();

    if (txmsg.request == "chat relay") {

      let inner_tx = new Transaction(undefined, txmsg.data);
      await inner_tx.decryptMessage(app);
      let inner_txmsg = inner_tx.returnMessage();
      this.processChatTransaction(inner_txmsg);

    }

    if (txmsg.module == "Chat") {		
      this.processChatTransaction(txmsg);
    }
  }

  async processChatTransaction(txmsg) {
    if (this.app.BROWSER) {
      if (txmsg.message) {
        if (txmsg.message.indexOf("huzzah") > -1) {
	  alert("Huzzah!");                             
        }
      }
    }
  }

}

module.exports = Tutorial02;


