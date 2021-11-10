const Big      = require('big.js');
const saito    = require('./saito');

const TransactionType = {
  Normal: 0,
  Fee: 1,
  GoldenTicket: 2,
  ATR: 3,
  Vip: 4,
  StakerDeposit: 5,
  StakerWithdrawal: 6,
  Other: 7,
  Issuance: 8
};

class Transaction {

  constructor(txobj=null) {

    /////////////////////////
    // consensus variables //
    /////////////////////////
    this.transaction               = {};
    this.transaction.id            = 1;
    this.transaction.from          = [];
    this.transaction.to            = [];
    this.transaction.ts            = new Date().getTime();
    this.transaction.sig           = "";  // sig of tx
    this.transaction.ver           = 1.0;
    this.transaction.path          = [];
    this.transaction.r             = 1; // "replaces" (how many txs this represents in merkle-tree for spv block)
    this.transaction.type          = 0;
    this.transaction.m             = "";

    this.fees_total                = "";
    this.work_available_to_me      = "";
    this.work_available_to_creator = "";
    this.work_cumulative           = "0.0";
					  //
                                          // cumulative fees. this is calculated when
					  // we process the block so that we can quickly
					  // select the winning transaction based on the
					  // golden ticket. it indicates how much this
					  // transaction carries in work in the overall
                                          // weight of the block. we use this to find
                                          // the winning node in the block for the
                                          // routing payment. i.e. this measures the
                                          // cumulative weight of the usable fees that
                                          // are behind the transactions.

    this.msg                       = {};
    this.dmsg                      = "";
    this.size                      = 0;
    this.is_valid                  = 1;
    this.transactionType           = TransactionType.Normal;
    this.inputs                    = [];
    this.outputs                   = [];

    return this;
  }

  decryptMessage(app) {
    if (this.transaction.from[0].add != app.wallet.returnPublicKey()) {
      try {
        let parsed_msg = this.msg;
        this.dmsg = app.keys.decryptMessage(this.transaction.from[0].add, parsed_msg);
      } catch (e) {
        console.log("ERROR: " + e);
      }
      return;
    }
    try { this.dmsg = app.keys.decryptMessage(this.transaction.to[0].add, this.msg); } catch (e) {}
    return;
  }


  returnFeesTotal(app) {
    if (this.fees_total == "") {

      //
      // sum inputs
      //
      let inputs = Big(0.0);
      if (this.transaction.from != null) {
        for (let v = 0; v < this.transaction.from.length; v++) {
          inputs = inputs.plus(Big(this.transaction.from[v].amt));
        }
      }

      //
      // sum outputs
      //
      let outputs = Big(0.0);
      for (let v = 0; v < this.transaction.to.length; v++) {
        //
        // do not count outputs in GT and FEE txs create outputs that cannot be counted.
        //
        if (this.transaction.to[v].type != 1 && this.transaction.to[v].type != 2) {
          outputs = outputs.plus(Big(this.transaction.to[v].amt));
        }
      }

      this.fees_total = inputs.minus(outputs).toFixed(8);
    }

    return this.fees_total;
  }

  returnMessage() {
    if (this.dmsg != "") { return this.dmsg; }
    if (this.msg != {}) { return this.msg; }
    return this.msg;
  }

  returnRoutingWorkAvailableToPublicKey(app) {
    let uf =  Big(this.returnFeesTotal(app));
    for (let i = 0; i < this.transaction.path.length; i++) {
      let d = 1;
      for (let j = i; j > 0; j--) { d = d*2; }
      uf = uf.div(d);
    }
    return uf.toFixed(8);
  }

  returnSignature(app, force=0) {
    if (this.transaction.sig != "" && force != 1) { return this.transaction.sig; }
    this.sign(app);
    return this.transaction.sig;
  }

  serializeForSignature() {
    let s = this.transaction.ts;
    for (let i = 0; i < this.transaction.from.length; i++) {
      s += this.transaction.from[i].serializeInputForSignature();
    }
    for (let i = 0; i < this.transaction.to.length; i++) {
      s += this.transaction.to[i].serializeOutputForSignature();
    }
    s += this.transaction.type;
    s += this.transaction.m;
    return s;
  }


  sign(app) {
    //
    // set slip ordinals
    //
    for (let i = 0; i < this.transaction.to.length; i++) { this.transaction.to[i].sid = i; }
    this.transaction.sig = app.crypto.signMessage(this.serializeForSignature(), app.wallet.returnPrivateKey());
  }


  validate() {

    for (let i = 0; i < this.transaction.from.length; i++) {
      if (this.transaction.from[i].validate() != true) {
	return false;
      }
    }

    return true;

  }

}

Transaction.TranasctionType = TransactionType;

module.exports = Transaction;

