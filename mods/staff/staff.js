const saito = require('../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');


class Staff extends ModTemplate {

    constructor(app) {

        super(app);
        this.app = app;
        this.name = "Staff";
        this.description = "Register as a Staff on Arcade";
        this.categories = "Utilities";

        return this;
    }
   
    attachEvents(app, mod) {
        document.querySelector('#add_staff').onclick = () => {
            var publicKey = this.app.wallet.returnPublicKey();
            if (publicKey) {
                document.getElementById("publicKey").innerHTML = publicKey;
                this.registerToDatabase(publicKey);
            }
        }
    }

    addRecord(publickey = "") {

        let sql = `INSERT INTO staff (publickey) VALUES ($publickey)`;
        let params = {
            $publickey: publickey
        }

        this.app.storage.executeDatabase(sql, params, "staff");

        sql = "SELECT * FROM staff WHERE publickey = $publickey";

        let rows = this.app.storage.queryDatabase(sql, params, "staff");
        if (rows.length <= 0) {
            alert(rows);
            alert("not found in db");
            return 0;
        } else {
            alert(rows);
            alert("found in db");
            return 1;
        }

    }

    async registerToDatabase(publickey) {
        //alert("went here");
        let am = this.app.modules.returnActiveModule();
        if (am == null) {
            console.log("no active module");
            return;
        } else {
            this.addRecord(publickey);
        }



        //let sql = "SELECT * FROM records WHERE publickey = $publickey";
        //alert("sql");

        //am.sendPeerDatabaseRequestWithFilter("Staff", sql,
        //    (res) => {
        //        if (res.rows) {
        //            if (res.rows.length > 0) {
        //                alert("went here");
        //                // addrecord(publickey);
        //            }
        //        } else {
        //            alert("none");
        //        }
        //    })
    }

    

}

module.exports = Staff;