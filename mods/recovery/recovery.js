const ModTemplate = require('../../lib/templates/modtemplate');
const BackupOverlay = require('./lib/overlays/backup-overlay');
const RecoverOverlay = require('./lib/overlays/recover-overlay');


class Recovery extends ModTemplate {

  constructor(app) {

    super(app);
    this.name = "Recovery";
    this.description = "Secure and anonymous account backup and recovery";
    this.categories = "Utilities Core";

    this.backup_overlay = new BackupOverlay(app, this);
    this.recover_overlay = new RecoverOverlay(app, this);

    app.connection.on("recovery-backup-overlay-render-request", () => {
      this.backup_overlay.render();
    });
    app.connection.on("recovery-recover-overlay-render-request", () => {
      this.recover_overlay.render();
    });

  }

  returnServices() {
      let services = [];
      if (this.app.BROWSER == 0) { services.push({ service: "recovery" }); }
      return services;
  }


  respondTo(type) {
    if (type == "saito-header") {
      return [{
        text: "Backup",
        icon: "fa-sharp fa-solid fa-cloud-arrow-up",
        allowed_mods: ["redsquare"],
        callback: function (app) {
          app.connection.emit("recovery-backup-overlay-render-request");
        }
      },
      {
        text: "Recover",
        icon: "fa-sharp fa-solid fa-cloud-arrow-down",
        allowed_mods: ["redsquare"],
        callback: function (app) {
	  app.connection.emit("recovery-recover-overlay-render-request");
        }
      }];
    }
    return null;
  }


  onConfirmation(blk, tx, conf, app) {

    if (conf == 0) {

      let txmsg = tx.returnMessage();

      if (txmsg.request == "backup") {
	this.receiveBackupTransaction(tx);
      }
    }
  }

  async handlePeerTransaction(app, tx=null, peer, mycallback) {

    try {

      if (tx == null) { return; }

      let txmsg = tx.returnMessage();

      if (txmsg.request == "backup") {
	this.receiveBackupTransaction(tx);
      }

      if (txmsg.request === "recover") {
        this.receiveRecoverTransaction(tx, mycallback);
	return;
      }
      
    } catch (err) {
      console.log("Error in handlePeerTransaction in Recovery module: " + err);
    }

  }



  sendBackupTransaction(decryption_secret, retrieval_hash) {
    let newtx = this.createBackupTransaction(decryption_secret, retrieval_hash);
    this.app.network.propagateTransaction(newtx);
  }
  createBackupTransaction(decryption_secret, retrieval_hash) {
    let newtx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
    newtx.msg = {
      module: "Recover",
      email: "",
      hash: retrieval_hash,
    };
    return this.app.wallet.signTransaction(newtx);
  }
  async receiveBackupTransaction(tx) {

    let txmsg = tx.returnMessage();
    let publickey = tx.transaction.from[0].add;
    let email = txmsg.email || "";
    let hash = txmsg.hash || "";
    let txjson = JSON.stringify(tx.transaction);    

    let sql = "INSERT OR REPLACE INTO recovery (publickey, email, hash, tx) VALUES ($publickey, $email, $hash, $tx)";
    let params = {
        $publickey	:	publickey ,
        $email		:	email ,
        $hash		:	hash ,
        $tx		:	txjson ,
    };
    await this.app.storage.executeDatabase(sql, params, "recovery");

  }



  async receiveRecoverTransaction(tx, mycallback=null) {

    let txmsg = tx.returnMessage();
    let hash = txmsg.hash || "";

    let sql = "SELECT * FROM recovery WHERE hash = $hash";
    let params = {
        $hash		:	hash ,
    };
    let rows = await this.app.storage.queryDatabase(sql, params, "recovery");

    if (mycallback != null) { mycallback(rows); }

  }

}


module.exports = Recovery;

