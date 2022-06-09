const saito = require('../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');


class Staff extends ModTemplate {

    constructor(app) {

        super(app);
        this.app = app;
        this.name = "Staff";
        this.description = "Register as a Staff on Arcade";
        this.categories = "Utilities";
        this.isThisRegistered = false;

        return this;
    }

    //this function will trigger when you are connected to a peer.
    //Use this to check if the key from the wallet is in the db.
    onPeerHandshakeComplete(app, peer) {
        let staff_self = app.modules.returnModule("Staff");
        console.log(staff_self);

        //run on the node, rendering BROWSER on browser checking - don't do this on full node
        if (app.BROWSER == 1) {
            this.checkRecord(this.app.wallet.returnPublicKey());
        }

        // check if key in db
        // do something like
        //   document.getElementById("isRegistered").value = this.getRecord(this.app.wallet.returnPublicKey());

    }

    render(app, mod) {    
        document.querySelector('#publicKey').innerHTML = this.app.wallet.returnPublicKey();
        document.getElementById("isRegistered").checked = this.isThisRegistered;
        if (this.isThisRegistered) {
            document.getElementById("add_staff").disabled = true;
        }
    }

    attachEvents(app, mod) {
        document.querySelector('#add_staff').onclick = () => {
            var publicKey = this.app.wallet.returnPublicKey();
            if (publicKey) {
                this.app.modules.returnModule("Staff").sendRegisterTX(publicKey, "register");
                //this.registerToDatabase(publicKey);
                // here you want to use sendRegisterTransaction with the wallet public key
            }
        }
        document.querySelector('#remove_staff').onclick = () => {
            var publicKey = this.app.wallet.returnPublicKey();
            if (publicKey) {
                this.app.modules.returnModule("Staff").sendRegisterTX(publicKey, "deregister");
                //this.registerToDatabase(publicKey);
                // here you want to use sendRegisterTransaction with the wallet public key
            }
        }
    }

    async checkRecord(publickey) {
        console.log("key:" + publickey);
        sql = 'SELECT publickey FROM staff WHERE publickey = "' + publickey + '";';
        console.log(sql);
        this.sendPeerDatabaseRequestWithFilter("Staff", sql,
            (res) => {
                if (res) {
                    if (res.rows) { 
                        if (res.rows.length > 0) {
                            console.log(res.rows[0].publickey);
                            this.isThisRegistered = true;
                            this.render();
                        }
                    }
                }
            });
    }


    createRegisterTransaction(publicKey, msgType) {
        let newtx = this.app.wallet.createUnsignedTransaction();

        newtx.msg.module = "Staff";
        newtx.msg.type = msgType;
        newtx.msg.publicKey = publicKey;

        return this.app.wallet.signTransaction(newtx);
    }

    sendRegisterTX(publicKey, msgType) {
        var registerTx = this.app.modules.returnModule("Staff").createRegisterTransaction(this.app.wallet.returnPublicKey(), msgType);
        this.app.network.propagateTransaction(registerTx);
    }

    onConfirmation(blk, tx, conf, app) {
        console.log("running on: " + app.BROWSER);
        if (app.BROWSER == 0) {
            if (conf == 0) {
                let txmsg = tx.returnMessage();
                console.log(txmsg.module == "Staff");
                if (txmsg.module == "Staff") {
                    let staff_self = app.modules.returnModule("Staff");
                    console.log("processing: " + txmsg.type);
                    if (txmsg.type == "register") {
                        let sql = "INSERT INTO staff (publickey) VALUES ($publickey)";
                        staff_self.receiveRegisterTransaction(txmsg, sql);
                    } else if (txmsg.type == "deregister") {
                        let publickey = txmsg.publicKey;
                        let sql = 'DELETE FROM staff WHERE publickey = $publickey';
                        staff_self.receiveRegisterTransaction(txmsg, sql);
                    }
                }
            }
        } else {
            if (conf==0) {
                if (txmsg.module == "Staff") {
                  let txmsg = tx.returnMessage();
                  if (txmsg.publicKey == this.app.wallet.returnPublicKey()) {
                      this.checkRecord(this.app.wallet.returnPublicKey());
                  }
                }
            }
        }
    }

    receiveRegisterTransaction(tx, sql) {
        let publickey = tx.publicKey;
        console.log("pubkey" + publickey);
        let params = {
            $publickey: publickey
        }

        this.app.storage.executeDatabase(sql, params, "staff").then(() => {
            this.render();
        });

        //unpack transaction
        // save into sql db.
    }


    sampleCallBack() {
        console.log("callback called");
    }

    /* 

    async addRecord(publicKey = "") {

        let sql = `INSERT INTO staff (publicKey) VALUES ($publicKey)`;
        let params = {
            $publicKey: publicKey
        }

        await this.app.storage.executeDatabase(sql, params, "staff");

        sql = "SELECT * FROM staff WHERE publicKey = $publicKey";

        let rows = this.app.storage.queryDatabase(sql, params, "staff");
        if (rows.length <= 0) {
            alert(rows);
            alert("not found in db");
            return 0;
        } else if (rows.length > 0) {
            let text = "";
            alert(rows);
            //  document.getElementById("#list_of_keys") = text;
            for (let index = 0; index < rows.length; index++) {
                alert("value: " + rows.length);
                //  text += (index + 1) + ":" + rows[index].publicKey + "<br>";
            }
            alert("found in db");
            return 1;
        } else {
            alert("db not called");
        }

    }

    async registerToDatabase(publicKey) {
        //alert("went here");
        let am = this.app.modules.returnActiveModule();
        if (am == null) {
            console.log("no active module");
            return;
        } else {
            this.addRecord(publicKey);
        }



        //let sql = "SELECT * FROM records WHERE publicKey = $publicKey";
        //alert("sql");

        //am.sendPeerDatabaseRequestWithFilter("Staff", sql,
        //    (res) => {
        //        if (res.rows) {
        //            if (res.rows.length > 0) {
        //                alert("went here");
        //                // addrecord(publicKey);
        //            }
        //        } else {
        //            alert("none");
        //        }
        //    })
    }
    */



}

module.exports = Staff;