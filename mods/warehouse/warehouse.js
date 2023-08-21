const ModTemplate = require("../../lib/templates/modtemplate");

class Warehouse extends ModTemplate {
  constructor(app) {
    super(app);
    this.app = app;
    this.name = "Warehouse";
    this.description =
      "Block data warehouse for the Saito blockchain. Not suitable for lite-clients";
    this.categories = "Utilities Dev";
  }

  onConfirmation(blk, tx, conf) {
    if (conf == 0) {
      // removed addTransactionsToDatabase from here
    }
  }

  onNewBlock(blk, lc) {
    // console.log('warehouse - on new block');
    this.addTransactionsToDatabase(blk);
  }

  async addTransactionsToDatabase(blk) {
    try {
      console.log("adding block to warehouse : " + blk.hash);
      for (let i = 0; i < blk.transactions.length; i++) {
        if (blk.transactions[i].type >= -999) {
          for (let ii = 0; ii < blk.transactions[i].to.length; ii++) {
            let sql = `INSERT
            OR IGNORE INTO transactions (
                                address, 
                                amt, 
                                bid, 
                                tid, 
                                sid, 
                                bhash, 
                                lc, 
                                rebroadcast,
                                sig,
                                ts,
                                block_ts,
                                type,
                                tx_from,
                                tx_to,
                                name,
                                module
                                )
                             VALUES (
            $address,
            $amt,
            $bid,
            $tid,
            $sid,
            $bhash,
            $lc,
            $rebroadcast,
            $sig,
            $ts,
            $block_ts,
            $type,
            $tx_from,
            $tx_to,
            $name,
            $module
            )`;
            let ttype = 0;
            let tname = "";
            let tmodule = "";
            if (blk.transactions[i].msg.type) {
              ttype = blk.transactions[i].type;
            }
            if (blk.transactions[i].msg.name) {
              tname = blk.transactions[i].msg.name;
            }

            if (blk.transactions[i].msg.module) {
              tmodule = blk.transactions[i].msg.module;
            } else if (Object.keys(blk.transactions[i].msg).length == 308) {
              tmodule = "Encrypted";
            }
            let tx_from = "";
            if (blk.transactions[i].from.length > 0) {
              tx_from = blk.transactions[i].from[0].publicKey;
            }
            let params = {
              $address: blk.transactions[i].to[ii].publicKey,
              $amt: blk.transactions[i].to[ii].amount,
              $bid: blk.id,
              $tid: "",
              $sid: ii,
              $bhash: blk.hash,
              $lc: 1,
              $rebroadcast: 0,
              $sig: blk.transactions[i].signature,
              $ts: blk.transactions[i].timestamp,
              $block_ts: blk.transactions[i].timestamp,
              $type: ttype,
              $tx_from: tx_from,
              $tx_to: blk.transactions[i].to[ii].publicKey,
              $name: tname,
              $module: tmodule,
            };
            await this.app.storage.executeDatabase(sql, params, "warehouse");
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  shouldAffixCallbackToModule() {
    return 1;
  }
}

module.exports = Warehouse;
