var ModTemplate = require('../../lib/templates/modtemplate');
const MainUI = require('./lib/main');


class Tutorial07 extends ModTemplate {

  constructor(app) {

    super(app);

    this.name            = "Tutorial07";
    this.slug            = "tutorial07";
    this.description     = "Filtering";
    this.categories      = 'Dev educational';
    this.ui		 = new MainUI(this.app, this);

    //this.app.options.tutorial07.keywords = new Set(["PoS"]);

    return this;

  }


  async render() {
    if (!this.app.options.tutorial07) {
        this.app.options.tutorial07 = {};
    }
    if (!this.app.options.tutorial07.keywords) {
        this.app.options.tutorial07.keywords = new Set(["PoS"]);
    }

    this.ui.render();
    console.log("OPTIONS: ------------------------------", this.app.options);
  }


  async onConfirmation(blk, tx, conf) {

    let txmsg = tx.returnMessage();

    if (conf == 0) {
      if (txmsg.module == this.name) {
        this.receiveTutorial07Transaction(tx);
      }
    }

  }

  receiveTutorial07Transaction(tx) {
    this.ui.receiveTransaction(tx);
  }



  async sendTutorial07Transaction(text) {

    let address = await this.app.wallet.getPublicKey();

    let newtx = await this.app.wallet.createUnsignedTransaction(address);
    newtx.msg = {
      module: this.name,
      data: text
    };
    await newtx.sign();

    this.app.network.propagateTransaction(newtx);

  }

  respondTo(type = '', obj = null) {
    // this moderation-level examines ALL transactions that are sent into specific
    // applications and checks to see if they are permitted. it will block applications
    // from being processed if they do not meet criteria.
    //
    // 1 = definitely show
    // -1 = definitely filter
    // 0 = no preference
    if (type === 'saito-moderation-app') {
        return {
          filter_func: (app = null, tx = null) => {
            if (tx == null || app == null) {
              return 0;
            }
            if (tx.msg.module === "Tutorial07" && this.app.options.tutorial07.keywords.has(tx.msg.data)) {
              console.log("Keywords: ", this.app.options.tutorial07.keywords);
              console.log("FILTERING CHAT MESSAGEE");
              return -1;
            }

            return 0;
          }
        };
      }
    }

  //


}

module.exports = Tutorial07;


