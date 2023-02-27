const saito = require('../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');
const ReigsterStaffTemplate = require('./lib/register-staff.template');
const SaitoHeader = require("../../lib/saito/ui/saito-header/saito-header");


class Staff extends ModTemplate {

  constructor(app) {

    super(app);
    this.app = app;
    this.name = "Staff";
    this.description = "Register as a Staff on Arcade";
    this.categories = "Utilities";
    this.isThisRegistered = false;

    //
    // master staff list publickey for this module
    //
    this.publickey = 'zYCCXRZt2DyPD9UmxRfwFgLTNAqCd5VE8RuNneg4aNMK';

    return this;
  }

  //this function will trigger when you are connected to a peer.
  //Use this to check if the key from the wallet is in the db.
  onPeerHandshakeComplete(app, peer) {
    if (app.BROWSER == 1) {
      if (this.browser_active == 1) {
        this.checkRecord(this.app.wallet.getPublicKey());
      }
    }
  }

  render(app, mod) {
    if (this.header == null) {
      this.header = new SaitoHeader(app, this);
    }
    if (typeof app != "undefined") {
      this.header.render(app, this);
      this.header.attachEvents(app, this);

      document.getElementById('staff_register').innerHTML = (sanitize(RegisterStaffTemplate()));
      document.querySelector('#publicKey').innerHTML = this.app.wallet.getPublicKey();
      document.getElementById("isRegistered").checked = this.isThisRegistered;

      if (this.isThisRegistered) {
        document.getElementById("add_staff").style.display = "none";
        document.getElementById("remove_staff").style.display = "block";
      } else {
        document.getElementById("add_staff").style.display = "block";
        document.getElementById("remove_staff").style.display = "none";
      }

      //add button events
      document.querySelector('#add_staff').addEventListener("click", () => {
        this.sendRegisterTX(this.publickey, this.app.wallet.getPublicKey(), "register");
      });
      document.querySelector('#remove_staff').addEventListener("click", () => {
        this.sendRegisterTX(this.publickey, this.app.wallet.getPublicKey(), "deregister");
      });

    }
  }


  async checkRecord(publickey) {
    let sql = 'SELECT publickey FROM staff WHERE publickey = "' + publickey + '";';
    this.sendPeerDatabaseRequestWithFilter(this.name, sql,
      (res) => {
        if (res) {
          if (res.rows) {
            if (res.rows.length > 0) {
              this.isThisRegistered = true;
            } else {
              this.isThisRegistered = false;
            }
            this.render(this.app);
          }
        }
      });
  }


  createRegisterTransaction(to, publicKey, msgType) {
    let newtx = this.app.wallet.createUnsignedTransaction(to);
    newtx.msg.module = this.name;
    newtx.msg.type = msgType;
    newtx.msg.publicKey = publicKey;

    return this.app.wallet.signTransaction(newtx);
  }

  sendRegisterTX(to, publicKey, msgType) {
    var registerTx = this.createRegisterTransaction(to, publicKey, msgType);
    this.app.network.propagateTransaction(registerTx);
  }

  onConfirmation(blk, tx, conf, app) {
    let staff_self = app.modules.returnModule("Staff");
    let txmsg = tx.returnMessage();
    let publickey = txmsg.publicKey;

    if (txmsg.module == this.name) {
      if (conf == 0) {
        if (app.BROWSER == 0) {
          if (tx.isTo(staff_self.publickey) && app.wallet.getPublicKey() === staff_self.publickey) {
            //this tx is for us - the authoritative node.
            if (txmsg.type == "register") {
              let sql = "INSERT INTO staff (publickey) VALUES ($publickey)";
              staff_self.receiveRegisterTransaction(txmsg, sql);
            } else if (txmsg.type == "deregister") {
              let sql = 'DELETE FROM staff WHERE publickey = $publickey';
              staff_self.receiveRegisterTransaction(txmsg, sql);
            }
            this.sendRegisterTX(txmsg.publicKey, txmsg.publicKey, txmsg.type);
          } else if (tx.isFrom(staff_self.publickey)) {
            //this message is from the authoritative node.
            if (txmsg.type == "register") {
              let sql = "INSERT INTO staff (publickey) VALUES ($publickey)";
              staff_self.receiveRegisterTransaction(txmsg, sql);
            } else if (txmsg.type == "deregister") {
              let sql = 'DELETE FROM staff WHERE publickey = $publickey';
              staff_self.receiveRegisterTransaction(txmsg, sql);
            }
          }
        } else {
          if (tx.isTo(this.app.wallet.getPublicKey())) {
            this.checkRecord(this.app.wallet.getPublicKey());
          }
        }
      }
    }
  }

  receiveRegisterTransaction(tx, sql) {
    let publickey = tx.publicKey;
    let params = {
      $publickey: publickey
    }

    this.app.storage.executeDatabase(sql, params, "staff");
  }
}

module.exports = Staff;
