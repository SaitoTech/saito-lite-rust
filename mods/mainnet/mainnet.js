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

  render() {

    if (!this.browser_active) { return; }

    let el = document.querySelector(".withdraw-button");
    el.onclick = (e) => {

      try {

        let email = document.querySelector("#email").value;
        let publickey = document.querySelector("#publickey").value;

	let mailrelay_mod = this.app.modules.returnModule("MailRelay");
	if (!mailrelay_mod) { 
	  alert("Your Saito install does not contain email support, please write the project manually to process token withdrawal");
	  return;
	}

	let emailtext = `

	  This is a template email to test the mail relay module in the mainnet transfer module.

	  The publickey submitted was ${publickey}


	`;

	mailrelay_mod.sendMailRelayTransaction("david.lancashire@gmail.com", "info@saito.tech", "Saito Token Withdrawal (mainnet)", emailtext);

      } catch (err) {

alert("Error Reading Email or Saito Address: please contact us manually");

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


