var ModTemplate = require('../../lib/templates/modtemplate');
const MainUI = require('./lib/main');


class Tutorial02 extends ModTemplate {

  constructor(app) {

    super(app);

    this.name            = "Tutorial02";
    this.slug            = "tutorial02";
    this.description     = "Transactions and UI Components";
    this.categories       = 'Dev educational';
    this.ui		 = new MainUI(this.app, this);

    return this;

  }


  async render() {
    this.ui.render();
  }


  async sendTutorial02Transaction() {

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

module.exports = Tutorial02;


