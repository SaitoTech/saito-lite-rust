const saito = require("../../lib/saito/saito");
const ModTemplate = require('../../lib/templates/modtemplate');
const EmailAppspace = require('./lib/appspace/main');


class Email extends ModTemplate {

  constructor(app) {

    super(app);

    this.app = app;
    this.name = "Email";
    this.appname = "Email";
    this.description = "Essential wallet, messaging platform and extensible control panel for Saito applications";
    this.categories = "Core Messaging Admin Productivity Utilities";
    this.events = ['chat-render-request'];
    this.icon = "fas fa-envelope";

    this.inbox = [];
    this.outbox = [];

    this.count = 0;

    //this.styles = [`/${this.returnSlug()}/css/appspace.css`];

  }

  initialize(app) {
    //super.initialize(app);
    let welcometx = app.wallet.createUnsignedTransaction();
    welcometx.msg.module   = "Email";
    welcometx.msg.title    = "Welcome to Saito";
    welcometx.msg.message  = `Saito is an open network that runs applications in your browser!
      <br/><br/>
      Saito is under development. If you are interested in developing applications for the network, why not check out the <a href="https://wiki.saito.io">Saito Wiki</a>.
      <br/><br/>
      Have questions? Why not join us on <a href="">Saito Telegram</a>?
    `;
    this.addEmail(welcometx);
  }

  respondTo(type) {
    if (type === "appspace") {
      super.render(this.app, this);
      return new EmailAppspace(this.app, this, "inbox");
    }
    return null;
  }


  onPeerHandshakeComplete(app, peer) {

    if (this.browser_active == 0) { return; }
    url = new URL(window.location.href);
    if (url.searchParams.get('module') != null) { return; }

    this.app.storage.loadTransactions("Email", 50, (txs) => {
      for (let i = 0; i < txs.length; i++) {
	txs[i].decryptMessage(app);
        this.receiveEmailTransaction(txs[i]);
      }
    });

  }

  onConfirmation(blk, tx, conf, app) {

    if (conf == 0) {
      let txmsg = tx.returnMessage();
      if (txmsg.request === "email") {

console.log("RECEIVE EMAIL TRANSACTION: " + JSON.stringify(txmsg));

	this.receiveEmailTransaction(tx);
      }
    }

  }

  sendEmailTransaction(recipient, data) {

    let obj = {
      module: "Email",
      request: "email",
      data : {} ,
    };
    for (let key in data) {
      obj.data[key] = data[key];
    }

    let newtx = this.app.wallet.createUnsignedTransaction(recipient);
    newtx.msg = obj;
    newtx = this.app.wallet.signTransaction(newtx);
    this.app.network.propagateTransaction(newtx);

    return newtx;

  }

  receiveEmailTransaction(tx) {

    let publickey = this.app.wallet.returnPublicKey();

    if (tx.transaction.to[0].add == publickey) {
      this.app.storage.saveTransaction(tx);
      this.addEmail(tx, "inbox");
    }
    if (tx.transaction.from[0].add == publickey) {
      this.app.storage.saveTransaction(tx);
      this.addEmail(tx, "outbox");
    }

  }



  addEmail(tx, which_box = "inbox") {

    let x = this.inbox;
    if (which_box === "outbox") { x = this.outbox; }

    for (let k = 0; k < x.length; k++) {
      if (x[k].transaction.sig == tx.transaction.sig) {
        return;
      }
    }
    x.unshift(tx);

  }

}

module.exports = Email;


