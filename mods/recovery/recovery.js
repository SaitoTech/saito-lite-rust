const saito = require('../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');
const SaitoLogin = require("./lib/login");
const SaitoBackup = require("./lib/backup");

class Recovery extends ModTemplate {

  constructor(app) {

    super(app);
    this.name = "Recovery";
    this.description = "Secure wallet backup and recovery";
    this.categories = "Utilities Core";

    this.backup_overlay = new SaitoBackup(app, this);
    this.login_overlay = new SaitoLogin(app, this);

    this.keychain_hash = "";

    app.connection.on("wallet-updated", () => {

      let new_keychain_hash = app.crypto.hash(JSON.stringify(app.keychain.keys) + JSON.stringify(app.keychain.groups));
      if (new_keychain_hash != this.keychain_hash) {

	      this.keychain_hash = new_keychain_hash;
	      let key = app.keychain.returnKey(app.wallet.returnPublicKey());
	      if (key) {
	        if (key.wallet_decryption_secret && key.wallet_retrieval_hash) {
            console.info("our wallet has updated, so rebroadcasting wallet recovery TX");
            let newtx = this.createBackupTransaction(key.wallet_decryption_secret, key.wallet_retrieval_hash);
            this.app.network.propagateTransaction(newtx);
	        }
	      }
        return;
      }
    });


    app.connection.on("recovery-backup-overlay-render-request", (obj = {}) => {

      console.debug("Received recovery-backup-overlay-render-request");
      //
      //If we already have the email/password, just send the backup
      //
      let key = app.keychain.returnKey(app.wallet.returnPublicKey());
      if (key) {
        if (key.wallet_decryption_secret && key.wallet_retrieval_hash) {
          let newtx = this.createBackupTransaction(key.wallet_decryption_secret, key.wallet_retrieval_hash);
          this.app.network.propagateTransaction(newtx);
          if (obj?.success_callback){
            obj.success_callback();
          }
          return;
        }
      }

      //Read optional parameters
      this.backup_overlay.success_callback = obj?.success_callback;
      this.backup_overlay.desired_identifier = obj?.desired_identifier;

      //
      // Otherwise, call up the modal to query them from the user
      //

      this.backup_overlay.render();
      
    });


    app.connection.on("recovery-login-overlay-render-request", (success_callback = null) => {

      console.debug("Received recovery-login-overlay-render-request");
      this.login_overlay.success_callback = success_callback;
      this.login_overlay.render();
    });

  }

  returnDecryptionSecret(email = "", pass = "") {
    let hash1 = "WHENINDISGRACEWITHFORTUNEANDMENSEYESIALLALONEBEWEEPMYOUTCASTSTATE";
    let hash2 = "ANDTROUBLEDEAFHEAVENWITHMYBOOTLESSCRIESANDLOOKUPONMYSELFANDCURSEMYFATE";
    return this.app.crypto.hash(this.app.crypto.hash(email+pass)+hash1);
  }

  returnRetrievalHash(email = "", pass = "") {
    let hash1 = "WHENINDISGRACEWITHFORTUNEANDMENSEYESIALLALONEBEWEEPMYOUTCASTSTATE";
    let hash2 = "ANDTROUBLEDEAFHEAVENWITHMYBOOTLESSCRIESANDLOOKUPONMYSELFANDCURSEMYFATE";
    return this.app.crypto.hash(this.app.crypto.hash(hash2+email)+pass);
  }

  returnServices() {
      let services = [];
      if (this.app.BROWSER == 0) { services.push({ service: "recovery" }); }
      return services;
  }

  respondTo(type) {
    if (type == "saito-header") {
      let x = [];

      let unknown_user = this.app.keychain.returnIdentifierByPublicKey(this.app.wallet.returnPublicKey(), true) === this.app.wallet.returnPublicKey();

    	if (unknown_user) {
      } else {
      }

      return x;
    }

    return super.respondTo(type);
  }

  onConfirmation(blk, tx, conf, app) {
    if (conf == 0) {
      let txmsg = tx.returnMessage();
      if (txmsg.request == "recovery backup") {
	       this.receiveBackupTransaction(tx);
      }
      if (txmsg.request == "recovery recover") {
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
    
    newtx.transaction.to.push(new saito.default.slip(this.app.wallet.returnPublicKey(), 0.0));

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

    if (this.app.wallet.returnPublicKey() === publickey){
      this.backup_overlay.success();
    }

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

    newtx.transaction.to.push(new saito.default.slip(this.app.wallet.returnPublicKey(), 0.0));

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

  backupWallet(email, password){
    let decryption_secret = this.returnDecryptionSecret(email, password);
    let retrieval_hash    = this.returnRetrievalHash(email, password);

    //
    // save email
    //
    this.app.keychain.addKey(this.app.wallet.returnPublicKey(), { email , wallet_decryption_secret : decryption_secret , wallet_retrieval_hash : retrieval_hash });
    this.app.keychain.saveKeys();    

    //
    // and send transaction
    //
    let newtx = this.createBackupTransaction(decryption_secret, retrieval_hash);
    this.app.network.propagateTransaction(newtx);
  }


  restoreWallet(email, password){
    let decryption_secret = this.returnDecryptionSecret(email, password);
    let retrieval_hash    = this.returnRetrievalHash(email, password);

    let newtx = this.createRecoverTransaction(retrieval_hash);
    let peers = this.app.network.returnPeersWithService("recovery");

    if (peers.length > 0) {
      this.app.network.sendTransactionWithCallback(newtx, (res) => {

        if (!res) { 
          console.log("empty response!"); 
          this.login_overlay.failure();
          return; 
        }
        
        if (!res.rows) { 
          console.log("no rows returned!");
          this.login_overlay.failure();
          return;
        }
        if (!res.rows[0].tx) { 
          console.log("no transaction in row returned");
          this.login_overlay.failure();
          return;
        }

        let tx = JSON.parse(res.rows[0].tx);
        let identifier = res.rows[0].identifier;
        let newtx2 = new saito.default.transaction(tx);
        let txmsg = newtx2.returnMessage();

        let encrypted_wallet = txmsg.wallet;
        let decrypted_wallet = this.app.crypto.aesDecrypt(encrypted_wallet, decryption_secret);
        
        this.app.wallet.wallet = JSON.parse(decrypted_wallet);
        this.app.wallet.saveWallet();
        this.app.keychain.addKey(this.app.wallet.returnPublicKey(), { identifier : identifier });
        this.app.keychain.saveKeys();
        
        this.login_overlay.success();

       }, peers[0]);
    } else {
      if (document.querySelector(".saito-overlay-form-text")) {
        document.querySelector(".saito-overlay-form-text").innerHTML = "<center>Unable to download encrypted wallet from network...</center>";
      }
      this.login_overlay.failure();
    }

    return;
  }

}


module.exports = Recovery;

