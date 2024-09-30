var ModTemplate = require('../../lib/templates/modtemplate');
const Transaction = require('../../lib/saito/transaction').default;


class Tutorial04 extends ModTemplate {

  constructor(app) {

    super(app);

    this.name            = "Tutorial04";
    this.slug            = "tutorial04";
    this.description     = "Building a Simple Chatbox";
    this.categories       = 'Dev educational';
    return this;

  }

  shouldAffixCallbackToModule(modname) {
    if (modname == this.name) { return 1; }
    if (modname == 'Chat') { return 1; }
    if (modname == 'Relay') { return 1; }
    return 0;
  }


  //
  // receive on-chain transactions
  //
  async onConfirmation(blk, tx, conf) {

    let txmsg = tx.returnMessage();
    if (conf == 0 && txmsg.module === "Chat") {
      this.processChatTransaction(txmsg);
    }

  }

  //
  // receive peer-to-peer transactions
  //
  async handlePeerTransaction(app, tx, peer, mycallback = null) {

    let txmsg = tx.returnMessage();

    //
    // Chat transactions
    //
    if (txmsg.module == "Chat") {
      this.processChatTransaction(txmsg);
    }

    if (txmsg.request == "chat relay") {
      let inner_tx = new Transaction(undefined, txmsg.data);
      await inner_tx.decryptMessage(app);
      let inner_txmsg = inner_tx.returnMessage();
      this.processChatTransaction(inner_txmsg);
    }

  }

  async processChatTransaction(txmsg) {
    //
    // am I a browser?
    //
    if (this.app.BROWSER) {
      //
      // is there a chat message here?
      //
      if (txmsg.message) {
        //
        // examine the message and...
        //
        if (txmsg.message.indexOf("huzzah") > -1) {
          //
          // do something !
          //
          alert("Huzzah!");
        }
      }
    }
  }

}

module.exports = Tutorial04;


