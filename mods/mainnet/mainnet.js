const ModTemplate = require("./../../lib/templates/modtemplate");
const PeerService = require("saito-js/lib/peer_service").default;

class Mainnet extends ModTemplate {

  constructor(app) {

    super(app);

    this.app = app;
    this.name = "Mainnet";
    this.description = "Migrate ERC20 tokens to Saito Mainnet";
    this.categories = "Core Utilities Messaging";

    //
    // master migration publickey
    //
    this.registry_publickey = "zYCCXRZt2DyPD9UmxRfwFgLTNAqCd5VE8RuNneg4aNMK";

    return this;
  }

  async onConfirmation(blk, tx, conf) {

    let txmsg = tx.returnMessage();

    if (conf == 0) {

      if (!!txmsg && txmsg.module === "Mainnet") {

      }
    }
  }


  receiveMigrateTokensTransaction() {

  }

  createMigrateTokensTransaction() {

  }

  async onChainReorganization(bid, bsh, lc) {
    var sql = "UPDATE records SET lc = $lc WHERE bid = $bid AND bsh = $bsh";
    var params = { $bid: bid, $bsh: bsh };
    await this.app.storage.executeDatabase(sql, params, "registry");
    return;
  }

}

module.exports = Mainnet;


