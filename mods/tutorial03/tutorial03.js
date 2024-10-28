var ModTemplate = require('../../lib/templates/modtemplate');
const MainUI = require('./lib/main');


class Tutorial03 extends ModTemplate {

  constructor(app) {

    super(app);

    this.name            = "Tutorial03";
    this.slug            = "tutorial03";
    this.description     = "Receiving Transactions";
    this.categories       = 'Dev educational';
    this.ui		 = new MainUI(this.app, this);

    return this;

  }


  async render() {
    this.ui.render();
  }


  async onConfirmation(blk, tx, conf) {

    let txmsg = tx.returnMessage();

    if (conf == 0) {
      if (txmsg.module == this.name) {
        this.receiveTutorial03Transaction(tx);
      }
    }

  }

  receiveTutorial03Transaction(tx) {
    this.ui.receiveTransaction(tx);
  }



  async sendTutorial03Transaction() {

    let address = await this.app.wallet.getPublicKey();

    let newtx = await this.app.wallet.createUnsignedTransaction(address);
    newtx.msg = {
      module: this.name,
      data: {
	random : Math.random()
      }
    };              
    await newtx.sign();

    this.app.network.propagateTransaction(newtx);

  }

}

module.exports = Tutorial03;


