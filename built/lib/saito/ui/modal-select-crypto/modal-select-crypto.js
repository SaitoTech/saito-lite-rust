var ModalSelectCryptoTemplate = require('./modal-select-crypto.template');
var SaitoOverlay = require('./../saito-overlay/saito-overlay');
var ModalSelectCrypto = /** @class */ (function () {
    function ModalSelectCrypto(app, cryptomod) {
        this.app = app;
        this.cryptomod = cryptomod;
    }
    ModalSelectCrypto.prototype.render = function (app, cryptomod) {
        if (this.cryptomod == null) {
            console.log("ERROR: crypto module not supported");
            return;
        }
        cryptomod.modal_overlay = new SaitoOverlay(app);
        cryptomod.modal_overlay.render(app, cryptomod);
        cryptomod.modal_overlay.attachEvents(app, cryptomod);
        cryptomod.modal_overlay.showOverlay(app, cryptomod, ModalSelectCryptoTemplate(app, cryptomod));
        document.getElementById("saito-overlay-closebox").style.display = "none";
        document.getElementById("saito-overlay-backdrop").onclick = function (e) { };
    };
    ModalSelectCrypto.prototype.attachEvents = function (app, cryptomod) {
        this.cryptomod.attachEventsModalSelectCrypto(app, this.cryptomod);
    };
    return ModalSelectCrypto;
}());
module.exports = ModalSelectCrypto;
//# sourceMappingURL=modal-select-crypto.js.map