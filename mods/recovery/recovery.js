const saito = require("../../lib/saito/saito");
const ModTemplate = require("../../lib/templates/modtemplate");
const SaitoLogin = require("./lib/login");
const SaitoBackup = require("./lib/backup");
const Slip = require("../../lib/saito/slip");
const PeerService = require("saito-js/lib/peer_service").default;

class Recovery extends ModTemplate {
  constructor(app) {
    super(app);
    this.name = "Recovery";
    this.description = "Secure wallet backup and recovery";
    this.categories = "Utilities Core";

    this.backup_overlay = new SaitoBackup(app, this);
    this.login_overlay = new SaitoLogin(app, this);

    this.keychain_hash = "";

    app.connection.on("wallet-updated", async () => {
      let new_keychain_hash = app.crypto.hash(
        JSON.stringify(app.keychain.keys) + JSON.stringify(app.keychain.groups)
      );
      if (new_keychain_hash != this.keychain_hash) {
        this.keychain_hash = new_keychain_hash;
        let key = app.keychain.returnKey(this.publicKey);
        if (key) {
          if (key.wallet_decryption_secret && key.wallet_retrieval_hash) {
            console.info("our wallet has updated, so rebroadcasting wallet recovery TX");
            let newtx = await this.createBackupTransaction(
              key.wallet_decryption_secret,
              key.wallet_retrieval_hash
            );
            await this.app.network.propagateTransaction(newtx);
          }
        }
        return;
      }
    });

    app.connection.on("recovery-backup-overlay-render-request", async (success_callback = null) => {
      console.debug("Received recovery-backup-overlay-render-request");
      this.backup_overlay.success_callback = success_callback;

      //
      //If we already have the email/password, just send the backup
      //
      let key = app.keychain.returnKey(this.publicKey);
      if (key) {
        if (key.wallet_decryption_secret && key.wallet_retrieval_hash) {
          let newtx = await this.createBackupTransaction(
            key.wallet_decryption_secret,
            key.wallet_retrieval_hash
          );
          await this.app.network.propagateTransaction(newtx);
          return;
        }
      }

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
    return this.app.crypto.hash(this.app.crypto.hash(email + pass) + hash1);
  }

  returnRetrievalHash(email = "", pass = "") {
    let hash1 = "WHENINDISGRACEWITHFORTUNEANDMENSEYESIALLALONEBEWEEPMYOUTCASTSTATE";
    let hash2 = "ANDTROUBLEDEAFHEAVENWITHMYBOOTLESSCRIESANDLOOKUPONMYSELFANDCURSEMYFATE";
    return this.app.crypto.hash(this.app.crypto.hash(hash2 + email) + pass);
  }

  returnServices() {
    let services = [];
    if (this.app.BROWSER == 0) {
      services.push(new PeerService(null, "recovery"));
    }
    return services;
  }

  respondTo(type) {
    if (type == "saito-header") {
      let x = [];

      let unknown_user =
        this.app.keychain.returnIdentifierByPublicKey(this.publicKey, true) === this.publicKey;

      if (unknown_user) {
        x.push({
          text: "Login",
          icon: "fa fa-sign-in",
          //allowed_mods: ["redsquare"], //Why restrict it??
          callback: function (app) {
            app.connection.emit("recovery-login-overlay-render-request");
          },
        });
      } else {
        x.push({
          text: "Backup",
          icon: "fa-sharp fa-solid fa-cloud-arrow-up",
          rank: 130,
          callback: function (app) {
            app.connection.emit("recovery-backup-overlay-render-request");
          },
        });
      }

      return x;
    }

    return super.respondTo(type);
  }

  async onConfirmation(blk, tx, conf, app) {
    if (conf == 0) {
      let txmsg = tx.returnMessage();
      if (txmsg.request == "recovery backup") {
        await this.receiveBackupTransaction(tx);
      }
      if (txmsg.request == "recovery recover") {
        await this.receiveBackupTransaction(tx);
      }
    }
  }

  async handlePeerTransaction(app, tx = null, peer, mycallback) {
    try {
      if (tx == null) {
        return;
      }

      let txmsg = tx.returnMessage();

      if (txmsg.request == "recovery backup") {
        await this.receiveBackupTransaction(tx);
      }

      if (txmsg.request === "recovery recover") {
        await this.receiveRecoverTransaction(tx, mycallback);
      }
    } catch (err) {
      console.log("Error in handlePeerTransaction in Recovery module: " + err);
    }
  }

  ////////////
  // Backup //
  ////////////
  async createBackupTransaction(decryption_secret, retrieval_hash) {
    let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();
    newtx.msg = {
      module: "Recovery",
      request: "recovery backup",
      email: "",
      hash: retrieval_hash,
      wallet: this.app.crypto.aesEncrypt(JSON.stringify(this.app.wallet.wallet), decryption_secret),
    };

    newtx.transaction.to.push(new saito.default.slip(this.publicKey, 0.0));
    await newtx.sign();
    return newtx;
  }

  async receiveBackupTransaction(tx) {
    let txmsg = tx.returnMessage();
    let publickey = tx.from[0].publicKey;
    let hash = txmsg.hash || "";
    let txjson = JSON.stringify(tx.transaction);

    let sql =
      "INSERT OR REPLACE INTO recovery (publickey, hash, tx) VALUES ($publickey, $hash, $tx)";
    let params = {
      $publickey: publickey,
      $hash: hash,
      $tx: txjson,
    };
    await this.app.storage.executeDatabase(sql, params, "recovery");

    if (this.publicKey === publickey) {
      this.backup_overlay.success();
    }
  }

  /////////////
  // Recover //
  /////////////
  async createRecoverTransaction(retrieval_hash) {
    let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();
    newtx.msg = {
      module: "Recovery",
      request: "recovery recover",
      hash: retrieval_hash,
    };
    let slip = new Slip();
    slip.publicKey = this.publicKey;
    newtx.addToSlip(slip);

    await newtx.sign();
    return newtx;
  }

  //
  // this is never run, see overlay
  //
  async receiveRecoverTransaction(tx, mycallback = null) {
    if (mycallback == null) {
      return;
    }
    if (this.app.BROWSER == 1) {
      return;
    }

    let txmsg = tx.returnMessage();
    let publickey = tx.from[0].publicKey;
    let hash = txmsg.hash || "";

    let sql = "SELECT * FROM recovery WHERE hash = $hash";
    let params = {
      $hash: hash,
    };
    let res = {};
    res.rows = await this.app.storage.queryDatabase(sql, params, "recovery");
    await mycallback(res);
  }

  async backupWallet(email, password) {
    let decryption_secret = this.returnDecryptionSecret(email, password);
    let retrieval_hash = this.returnRetrievalHash(email, password);

    //
    // save email
    //
    this.app.keychain.addKey(this.publicKey, {
      email,
      wallet_decryption_secret: decryption_secret,
      wallet_retrieval_hash: retrieval_hash,
    });
    this.app.keychain.saveKeys();

    //
    // and send transaction
    //
    let newtx = await this.createBackupTransaction(decryption_secret, retrieval_hash);
    await this.app.network.propagateTransaction(newtx);
  }

  async restoreWallet(email, password) {
    let decryption_secret = this.returnDecryptionSecret(email, password);
    let retrieval_hash = this.returnRetrievalHash(email, password);

    let newtx = await this.createRecoverTransaction(retrieval_hash);
    let peers = this.app.network.returnPeersWithService("recovery");

    if (peers.length > 0) {
      this.app.network.sendTransactionWithCallback(
        newtx,
        (res) => {
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
          let newtx2 = new saito.default.transaction(undefined, tx);
          let txmsg = newtx2.returnMessage();

          let encrypted_wallet = txmsg.wallet;
          let decrypted_wallet = this.app.crypto.aesDecrypt(encrypted_wallet, decryption_secret);

          this.app.wallet.wallet = JSON.parse(decrypted_wallet);
          this.app.wallet.saveWallet();
          this.app.keychain.addKey(this.publicKey, { identifier: identifier });
          this.app.keychain.saveKeys();

          this.login_overlay.success();
        },
        peers[0]
      );
    } else {
      if (document.querySelector(".saito-overlay-form-text")) {
        document.querySelector(".saito-overlay-form-text").innerHTML =
          "<center>Unable to download encrypted wallet from network...</center>";
      }
      this.login_overlay.failure();
    }

    return;
  }
}

module.exports = Recovery;
