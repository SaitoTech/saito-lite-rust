var ModalRegisterEmailTemplate = require('./modal-register-email.template');
var SaitoOverlay = require('../saito-overlay/saito-overlay');
var saito = require('../../saito');
var MODES = {
    "NEWSLETTER": 0,
    "PRIVATESALE": 1,
    "REGISTEREMAIL": 2,
    "BACKUP": 3,
};
var ModalRegisterEmail = /** @class */ (function () {
    function ModalRegisterEmail(app, callback) {
        if (callback === void 0) { callback = function () { }; }
        this.app = app;
        this.callback = callback;
        this.mode = null;
    }
    ModalRegisterEmail.prototype.render = function (app, mod, mode) {
        if (mode === void 0) { mode = MODES.NEWSLETTER; }
        this.mode = mode;
        this.modal_overlay_email = new SaitoOverlay(app);
        this.modal_overlay_email.render(app, mod);
        this.modal_overlay_email.attachEvents(app, mod);
        if (!document.querySelector(".add-user")) {
            this.modal_overlay_email.showOverlay(app, mod, ModalRegisterEmailTemplate(mode, MODES));
        }
    };
    ModalRegisterEmail.prototype.attachEvents = function (app, mod) {
        var _this = this;
        document.querySelectorAll('.tutorial-skip').forEach(function (el) {
            el.onclick = function () {
                _this.modal_overlay_email.hideOverlay();
            };
        });
        document.querySelectorAll('#registry-input').forEach(function (el) {
            el.onclick = function () {
                document.querySelector('#registry-input').setAttribute("placeholder", "");
            };
        });
        document.querySelectorAll('#backup-email-button').forEach(function (el) {
            el.onclick = function () {
                var submitted_email = document.querySelector("#registry-input").value;
                var subscribe_newsletter = document.querySelector("#signup") && document.querySelector("#signup").checked;
                if (_this.mode === MODES.NEWSLETTER) {
                    _this.doNewsletterSignup(app, mod, submitted_email);
                }
                else if (_this.mode === MODES.PRIVATESALE) {
                    _this.doPrivateSaleSignup(app, mod, submitted_email, subscribe_newsletter);
                }
                else if (_this.mode === MODES.REGISTEREMAIL) {
                    _this.doRegisterEmail(app, mod, submitted_email, subscribe_newsletter);
                }
                else if (_this.mode === MODES.BACKUP) {
                    // TODO: This mode doesnt' actually work. I think it's possible to
                    // leverage mailrelay.js to maybe make this work...
                    _this.doEmailBackup(app, mod, submitted_email, subscribe_newsletter);
                }
                else {
                    throw "No such mode: " + _this.mode;
                }
                _this.modal_overlay_email.hideOverlay();
                salert("Thanks for signing up!");
            };
        });
    };
    ModalRegisterEmail.prototype.validateEmail = function (submitted_email) {
        //
        // regexp to identify email addresses
        //
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!re.test(String(submitted_email).toLowerCase()) || submitted_email === "email@domain.com") {
            salert("Invalid email address!");
            return false;
        }
        return true;
    };
    ModalRegisterEmail.prototype.sendServiceRequest = function (submitted_email, request_type) {
        tx = new saito.default.transaction();
        tx.msg = {
            key: this.app.wallet.returnPublicKey(),
            email: submitted_email,
            time: Date.now()
        };
        this.app.modules.returnActiveModule().sendPeerRequestWithServiceFilter("emailcollector", {
            request: request_type,
            data: tx
        }, function (rows) {
            document.querySelector(".arcade-sidebar-done").innerHTML = "";
            rows.forEach(function (row) {
                if (typeof (row.label) != "undefined" || typeof (row.icon) != "undefined") {
                    document.querySelector(".arcade-sidebar-done").innerHTML += RewardsSidebarRow(row.label, row.icon, row.count);
                }
            });
        });
    };
    ModalRegisterEmail.prototype.doRegisterEmail = function (app, mod, submitted_email, subscribe_newsletter) {
        if (!this.validateEmail(submitted_email)) {
            return;
        }
        app.keys.updateEmail(app.wallet.returnPublicKey(), submitted_email);
        if (subscribe_newsletter) {
            this.doNewsletterSignup(app, mod, submitted_email);
        }
        window.location.reload();
    };
    ModalRegisterEmail.prototype.doEmailBackup = function (app, mod, submitted_email, subscribe_newsletter) {
        if (!this.validateEmail(submitted_email)) {
            return;
        }
        // TODO: send an email to the user here with their wallet...
        app.keys.updateEmail(app.wallet.returnPublicKey(), submitted_email);
        if (subscribe_newsletter) {
            this.doNewsletterSignup(app, mod, submitted_email);
        }
    };
    ModalRegisterEmail.prototype.doPrivateSaleSignup = function (app, mod, submitted_email, subscribe_newsletter) {
        if (!this.validateEmail(submitted_email)) {
            return;
        }
        this.sendServiceRequest(submitted_email, "public sale signup");
        if (subscribe_newsletter) {
            this.doNewsletterSignup(app, mod, submitted_email);
        }
    };
    ModalRegisterEmail.prototype.doNewsletterSignup = function (app, mod, submitted_email) {
        if (!this.validateEmail(submitted_email)) {
            return;
        }
        this.sendServiceRequest(submitted_email, "newsletter signup");
    };
    return ModalRegisterEmail;
}());
ModalRegisterEmail.MODES = MODES;
module.exports = ModalRegisterEmail;
//# sourceMappingURL=modal-register-email.js.map