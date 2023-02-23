const ModTemplate = require('../../lib/templates/modtemplate');
const SetupOverlay = require('./lib/overlays/setup');
const RestoreOverlay = require('./lib/overlays/restore');
const SaitoLogin = require("./../../lib/saito/ui/modals/login/login");
const SaitoBackup = require("./../../lib/saito/ui/modals/setup-recovery/setup-recovery");


class Recovery extends ModTemplate {

  constructor(app) {

    super(app);
    this.name = "Recovery";
    this.description = "Secure and anonymous account backup and recovery";
    this.categories = "Utilities Core";

    //this.backup_overlay = new SetupOverlay(app, this);
    //this.recover_overlay = new RestoreOverlay(app, this);
    this.backup_overlay = new SaitoBackup(app, this);
    this.recover_overlay = new SaitoLogin(app, this);

    app.connection.on("recovery-backup-overlay-render-request", (obj) => {
      if (obj.success_callback != null) {
        this.backup_overlay.success_callback = obj.success_callback;
      } else {
	this.backup_overlay.success_callback = (e) => {};
      }
      if (obj.failure_callback != null) {
        this.backup_overlay.failure_callback = obj.failure_callback;
      } else {
	this.backup_overlay.failure_callback = (e) => {};
      }

      //
      // if submitted with email / pass, auto-backup
      //
      if (obj.email && obj.pass) {

        let hash1 = "WHENINDISGRACEWITHFORTUNEANDMENSEYESIALLALONEBEWEEPMYOUTCASTSTATE";
        let hash2 = "ANDTROUBLEDEAFHEAVENWITHMYBOOTLESSCRIESANDLOOKUPONMYSELFANDCURSEMYFATE";

	let email = obj.email;
	let pass = obj.pass;

        let decryption_secret = this.app.crypto.hash(this.app.crypto.hash(email+pass)+hash1);
        let retrieval_hash    = this.app.crypto.hash(this.app.crypto.hash(hash2+email)+pass);

        let newtx = this.createBackupTransaction(decryption_secret, retrieval_hash);
        this.app.network.propagateTransaction(newtx);
        if (this.backup_overlay.success_callback) { this.backup_overlay.success_callback(true); }
	return;
      }

      this.backup_overlay.render();
    });

    app.connection.on("recovery-recover-overlay-render-request", (obj) => {
      if (obj.success_callback != null) {
	this.backup_overlay.callback = obj.success_callback;
      }
/**
      if (obj.success_callback != null) {
        this.recover_overlay.success_callback = obj.success_callback;
      } else {
	this.recover_overlay.success_callback = (e) => {};
      }
      if (obj.failure_callback != null) {
        this.recover_overlay.failure_callback = obj.failure_callback;
      } else {
	this.recover_overlay.failure_callback = (e) => {};
      }
***/
      //
      // if submitted with email / pass, auto-backup
      //
      if (obj.email && obj.pass) {

        let hash1 = "WHENINDISGRACEWITHFORTUNEANDMENSEYESIALLALONEBEWEEPMYOUTCASTSTATE";
        let hash2 = "ANDTROUBLEDEAFHEAVENWITHMYBOOTLESSCRIESANDLOOKUPONMYSELFANDCURSEMYFATE";

	let email = obj.email;
	let pass = obj.pass;

        let decryption_secret = this.app.crypto.hash(this.app.crypto.hash(email+pass)+hash1);
        let retrieval_hash    = this.app.crypto.hash(this.app.crypto.hash(hash2+email)+pass);

        let newtx = this.createBackupTransaction(decryption_secret, retrieval_hash);
        this.app.network.propagateTransaction(newtx);
        if (this.recover_overlay.success_callback) { this.recover_overlay.success_callback(true); }
	return;
      }

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
      let x = [];
      if (this.app.browser.isMobileBrowser()) {
	if (this.app.keychain.returnIdenticon(this.app.wallet.returnPublicKey())) {
	  x.push({
            text: "Login",
            icon: "fa fa-sign-in",
            allowed_mods: ["redsquare"],
            callback: function (app) {
  	      let success_callback = function(res) {};
	      let failure_callback = function(res) {};
	      app.connection.emit("recovery-recover-overlay-render-request", (success_callback, failure_callback));
            }
	  });
        } else {
	  x.push({
            text: "Backup",
            icon: "fa-sharp fa-solid fa-cloud-arrow-up",
            rank: 130,
            callback: function (app) {
  	      let success_callback = function(res) {};
	      let failure_callback = function(res) {};
	      app.connection.emit("recovery-backup-overlay-render-request", (success_callback, failure_callback));
            }
	  });
        }
      } else {
	x.push({
          text: "Backup",
          icon: "fa-sharp fa-solid fa-cloud-arrow-up",
          rank: 130,
          callback: function (app) {
  	    let success_callback = function(res) {};
	    let failure_callback = function(res) {};
	    app.connection.emit("recovery-backup-overlay-render-request", (success_callback, failure_callback));
          }
	});
      }
      return x;
    }
    return null;
  }

  onConfirmation(blk, tx, conf, app) {
    if (conf == 0) {
      let txmsg = tx.returnMessage();
      if (txmsg.request == "recovery backup") {
	this.receiveBackupTransaction(tx);
      }
    }
  }

  async handlePeerTransaction(app, tx=null, peer, mycallback) {

    try {

      if (tx == null) { return; }

      let txmsg = tx.returnMessage();

      if (txmsg.request == "recovery backup") {
	this.receiveBackupTransaction(tx);
      }

      if (txmsg.request === "recovery recover") {
        this.receiveRecoverTransaction(tx, mycallback);
	return;
      }
      
    } catch (err) {
      console.log("Error in handlePeerTransaction in Recovery module: " + err);
    }

  }



  ////////////
  // Backup //
  ////////////
  createBackupTransaction(decryption_secret, retrieval_hash) {
    let newtx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
    newtx.msg = {
      module: "Recovery",
      request: "recovery backup",
      email: "",
      hash: retrieval_hash,
      wallet: this.app.crypto.aesEncrypt(JSON.stringify(this.app.wallet.wallet), decryption_secret),
    };
    return this.app.wallet.signTransaction(newtx);
  }
  async receiveBackupTransaction(tx) {

    let txmsg = tx.returnMessage();
    let publickey = tx.transaction.from[0].add;
    let hash = txmsg.hash || "";
    let txjson = JSON.stringify(tx.transaction);    

    let sql = "INSERT OR REPLACE INTO recovery (publickey, hash, tx) VALUES ($publickey, $hash, $tx)";
    let params = {
        $publickey	:	publickey ,
        $hash		:	hash ,
        $tx		:	txjson ,
    };
    await this.app.storage.executeDatabase(sql, params, "recovery");

  }

  /////////////
  // Recover //
  /////////////
  createRecoverTransaction(retrieval_hash) {
    let newtx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
    newtx.msg = {
      module: "Recovery",
      request: "recovery recover",
      hash: retrieval_hash,
    };
    return this.app.wallet.signTransaction(newtx);
  }
  //
  // this is never run, see overlay
  //
  async receiveRecoverTransaction(tx, mycallback=null) {

    if (mycallback == null) { return; }
    if (this.app.BROWSER == 1) { return; }

    let txmsg = tx.returnMessage();
    let publickey = tx.transaction.from[0].add;
    let hash = txmsg.hash || "";

    let sql = "SELECT * FROM recovery WHERE hash = $hash";
    let params = {
        $hash           :       hash ,
    };
    let res = {};
    res.rows = await this.app.storage.queryDatabase(sql, params, "recovery");
    mycallback(res);

  }

}


module.exports = Recovery;

