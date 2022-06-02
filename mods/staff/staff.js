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

    registerToDatabase(publickey) {
        //alert("went here");
        let am = this.app.modules.returnactivemodule();
        //if (am == null) {
        //    console.log("no active module");
        //    return;
        //}
        let sql = "select * from records where publickey = $publickey";
     
        am.sendpeerdatabaserequestwithfilter("staff", sql,
            (res) => {
                if (res.rows) {
                    if (res.rows.length > 0) {
                        alert.box("went here");
                        // addrecord(publickey);
                    }
                } else {
                    alert.box("none");
                }
            })
    }

    //addRecord(publickey = "") {

    //    let sql = `INSERT INTO staff (
    //    publickey, 
    //  ) VALUES (
    //    $publickey,
    //  )`;
    //    let params = {
    //        $publickey: publickey
    //    }

    //    this.app.storage.executeDatabase(sql, params, "staff");

    //    sql = "SELECT * FROM staff WHEREpublickey = $publickey;
    //    let rows =  this.app.storage.queryDatabase(sql, params, "staff");
    //    if (rows.length == 0) {
    //        alert("not found in DB");
    //        return 0;
    //    } else {
    //        alert("found in DB");
    //        return 1;
    //    }

    //}

}

module.exports = Staff;