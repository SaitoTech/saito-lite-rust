const saito = require('../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');
const RegisterStaffTemplate = require('./register-staff.template');
const ArcadeGameSidebar = require("../../mods/arcade/lib/arcade-sidebar/arcade-game-sidebar");
const SaitoHeader = require("../../lib/saito/ui/saito-header/saito-header");





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
        if (app.BROWSER == 1) {
            this.checkRecord(this.app.wallet.returnPublicKey());
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
            this.addEvents(this.app);
            document.querySelector('#publicKey').innerHTML = this.app.wallet.returnPublicKey();
            document.getElementById("isRegistered").checked = this.isThisRegistered;

            if (this.isThisRegistered) {
               // document.getElementById("add_staff").style.display = "none";
               // document.getElementById("remove_staff").style.display = "block";
                this.example("none", "block")
            } else {
                document.getElementById("add_staff").style.display = "block";
                document.getElementById("remove_staff").style.display = "none";
            }
    
        }
    }

    example(add_state, remove_state) {
        document.getElementById("add_staff").style.display = this.add_state;
        document.getElementById("remove_staff").style.display = this.remove_state;
    }

    addEvents(app) {
        document.querySelector('#add_staff').onclick = this.addstaff(app);
        document.querySelector('#remove_staff').onclick = this.removestaff(app);
    
    }

    removestaff(app) {
        var publicKey = this.app.wallet.returnPublicKey();
        if (publicKey) {
            this.app.modules.returnModule(this.name).sendRegisterTX(publicKey, "deregister");
        }
    }

    addstaff(app) {
        var publicKey = app.wallet.returnPublicKey();
        if (publicKey) {
            this.app.modules.returnModule(this.name).sendRegisterTX(publicKey, "register");
        }
    }

    /*
    renderSidebar() {
        if (this.viewing_game_homepage) {
            ArcadeGameSidebar.render(this.app, this);
            ArcadeGameSidebar.attachEvents(this.app, this);
        } else {
            ArcadeSidebar.render(this.app, this);
            ArcadeSidebar.attachEvents(this.app, this);
        }
    }
    */

    async checkRecord(publickey) {
        sql = 'SELECT publickey FROM staff WHERE publickey = "' + publickey + '";';
        this.sendPeerDatabaseRequestWithFilter(this.name, sql,
            (res) => {
                if (res) {
                    if (res.rows) {
                        if (res.rows.length > 0) {
                            this.isThisRegistered = true;
                        } else {
                            this.isThisRegistered = false;
                        }
                        this.render();
                    }
                }
            });
    }


    createRegisterTransaction(publicKey, msgType) {
        let newtx = this.app.wallet.createUnsignedTransaction();
        newtx.msg.module = this.name;
        newtx.msg.type = msgType;
        newtx.msg.publicKey = publicKey;

        return this.app.wallet.signTransaction(newtx);
    }

    sendRegisterTX(publicKey, msgType) {
        var registerTx = this.app.modules.returnModule(this.name).createRegisterTransaction(this.app.wallet.returnPublicKey(), msgType);
        this.app.network.propagateTransaction(registerTx);
    }

    onConfirmation(blk, tx, conf, app) {
        let txmsg = tx.returnMessage();
        if (app.BROWSER == 0) {
            if (conf == 0) {
                if (txmsg.module == this.name) {
                    let staff_self = app.modules.returnModule(this.name);
                    let publickey = txmsg.publicKey;
                    if (txmsg.type == "register") {
                        let sql = "INSERT INTO staff (publickey) VALUES ($publickey)";
                        staff_self.receiveRegisterTransaction(txmsg, sql);
                    } else if (txmsg.type == "deregister") {
                        let sql = 'DELETE FROM staff WHERE publickey = $publickey';
                        staff_self.receiveRegisterTransaction(txmsg, sql);
                    }
                }
            }
        } else {
            if (conf == 0) {
                if (txmsg.module == this.name) {
                    if (txmsg.publicKey == this.app.wallet.returnPublicKey()) {
                        this.checkRecord(this.app.wallet.returnPublicKey());
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