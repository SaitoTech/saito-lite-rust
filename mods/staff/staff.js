const saito = require('../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');


class gametest extends ModTemplate {

    constructor(app) {

        super(app);

        this.name = "Staff";
        this.description = "Register as a Staff on Arcade";
        this.categories = "Utilities";

        return this;
    }

    //attachEvents(app, mod) {

    //    document.querySelector('#add_staff').onclick = () => {
    //        var publicKey = this.app.wallet.returnPublicKey();
    //        if (publicKey) {
    //            document.getElementById("publicKey").innerHTML = publicKey;
    //          //  registerToDatabase(identifier);
    //        }
    //    }

    //}



    //async registerToDatabase(identifier) {
    //    let am = app.modules.returnActiveModule();
    //    if (am == null) {
    //        console.log("No Active Module");
    //        return;
    //    }
    //    let publickey = this.app.wallet.returnPublicKey();
    //    let sql = "SELECT * FROM records WHERE publickey = $publickey";

    //    am.sendPeerDatabaseRequestWithFilter("Staff", sql,
    //        (res) => {
    //            if (res.rows) {
    //                if (res.rows.length > 0) {
    //                    addRecord(publickey);
    //                }
    //            }
    //        })
    //}

    //async addRecord(identifier = "", publickey = "") {

    //    let sql = `INSERT INTO staff (
    //    identifier, 
    //    publickey, 
    //  ) VALUES (
    //    $identifier, 
    //    $publickey,
    //  )`;
    //    let params = {
    //        $identifier: identifier,
    //        $publickey: publickey
    //    }
    //    await this.app.storage.executeDatabase(sql, params, "registry");

    //    sql = "SELECT * FROM records WHERE identifier = $identifier AND publickey = $publickey AND unixtime = $unixtime AND bid = $bid AND bsh = $bsh AND lock_block = $lock_block AND sig = $sig AND signer = $signer AND lc = $lc";
    //    let rows = await this.app.storage.queryDatabase(sql, params, "registry");
    //    if (rows.length == 0) {
    //        return 0;
    //    } else {
    //        return 1;
    //    }

    //}

}