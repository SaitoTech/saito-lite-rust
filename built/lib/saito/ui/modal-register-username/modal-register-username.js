var ModalRegisterUsernameTemplate = require('./modal-register-username.template');
var SaitoOverlay = require('./../saito-overlay/saito-overlay');
var ModalRegisterUsername = /** @class */ (function () {
    function ModalRegisterUsername(app, callback) {
        if (callback === void 0) { callback = function () { }; }
        this.app = app;
        this.callback = callback;
    }
    ModalRegisterUsername.prototype.render = function (app, mod) {
        mod.modal_overlay = new SaitoOverlay(app);
        mod.modal_overlay.render(app, mod);
        mod.modal_overlay.attachEvents(app, mod);
        if (!document.querySelector(".add-user")) {
            mod.modal_overlay.showOverlay(app, mod, ModalRegisterUsernameTemplate());
        }
    };
    ModalRegisterUsername.prototype.attachEvents = function (app, mod) {
        var _this = this;
        document.querySelector('.username-registry-input').select();
        document.querySelector('.username-registry-input').setAttribute("placeholder", "");
        document.querySelector('.tutorial-skip').onclick = function () {
            app.options.wallet.anonymous = 1;
            app.storage.saveOptions();
            mod.modal_overlay.hideOverlay();
            _this.callback();
        };
        document.querySelector('#registry-modal-button').onclick = function () {
            //check identifier taken
            var identifier = document.querySelector('#registry-input').value;
            var hp = document.querySelector('#name').value;
            if (hp == "") {
                app.modules.returnActiveModule().sendPeerDatabaseRequestWithFilter("Registry", "SELECT * FROM records WHERE identifier = \"".concat(identifier, "@saito\""), function (res) {
                    if (res.rows) {
                        if (res.rows.length > 0) {
                            salert("Identifier already in use. Please select another");
                            return;
                        }
                        else {
                            var register_mod = app.modules.returnModule("Registry");
                            if (register_mod) {
                                var register_success = app.modules.returnModule('Registry').tryRegisterIdentifier(identifier);
                                if (register_success) {
                                    salert("Registering " + identifier + "@saito");
                                    mod.modal_overlay.hideOverlay();
                                    _this.callback();
                                }
                                else {
                                    salert("Error 411413: Error Registering Username");
                                }
                            }
                        }
                    }
                });
            }
        };
    };
    return ModalRegisterUsername;
}());
module.exports = ModalRegisterUsername;
//# sourceMappingURL=modal-register-username.js.map