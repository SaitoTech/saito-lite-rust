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

        this.app.isThisRegistered = staff_self.getRecord(this.app.wallet.returnPublicKey());
        console.log(this.app.isThisRegistered);
    // check if key in db
    // do something like
 //   document.getElementById("isRegistered").value = this.getRecord(this.app.wallet.returnPublicKey());

    }

    render(app, mod) {
        document.querySelector('#publicKey').innerHTML = this.app.wallet.returnPublicKey();
        document.getElementById("isRegistered").value = this.isThisRegistered;
    }

    attachEvents(app, mod) {
        document.querySelector('#add_staff').onclick = () => {
            var publicKey = this.app.wallet.returnPublicKey();
            if (publicKey) {
                this.app.modules.returnModule("Staff").sendRegisterTX(publicKey);
                //this.registerToDatabase(publicKey);
                // here you want to use sendRegisterTransaction with the wallet public key
            }
        }
    }

    async getRecord(publickey) {
        console.log("key:"+publickey);
        sql = "SELECT publickey FROM staff WHERE publickey = $publickey";
        this.sendPeerDatabaseRequestWithFilter("Staff",  sql, 
        (publicKey)=>{
            console.log("sql value: " + publicKey.publickey);
            return true;
        });
    }


    createRegisterTransaction(publicKey) {
        let newtx = this.app.wallet.createUnsignedTransaction();
    
        newtx.msg.module = "Staff";
        newtx.msg.type = "register";
        newtx.msg.publicKey = publicKey;
    
        return this.app.wallet.signTransaction(newtx);  
      }

    sendRegisterTX(publicKey){
        var registerTx = this.app.modules.returnModule("Staff").createRegisterTransaction(this.app.wallet.returnPublicKey());
        this.app.network.propagateTransaction(registerTx);
    }

    onConfirmation(blk, tx, conf, app) {

        if (app.BROWSER == 0) {
          if (conf == 0) {
              let txmsg = tx.returnMessage();
              console.log(txmsg.module == "Staff");

            if (txmsg.module == "Staff") {
              let staff_self = app.modules.returnModule("Staff");
              console.log("processing: "+txmsg.type);
              if (txmsg.type == "register") {
                  staff_self.receiveRegisterTransaction(txmsg);
              }
            }
          }
        }
    }

    receiveRegisterTransaction(tx) {
        let publickey = tx.publicKey;
        console.log("pubkey" + publickey);
        let sql = `INSERT INTO staff (publickey) VALUES ($publickey)`;
        let params = {
            $publickey: publickey
        }

        this.app.storage.executeDatabase(sql, params, "staff");

          //unpack transaction
          // save into sql db.
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