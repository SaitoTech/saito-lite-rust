var GameCryptoTransferManagerTemplate = require('./game-crypto-transfer-manager.template');
var GameCryptoTransferManagerSendTemplate = require('./game-crypto-transfer-manager-send.template');
var GameCryptoTransferManagerReceiveTemplate = require('./game-crypto-transfer-manager-receive.template');
var GameCryptoTransferManagerBalanceTemplate = require('./game-crypto-transfer-manager-balance.template');
var GameOverlay = require('./../game-overlay/game-overlay');
var GameCryptoTransferManager = /** @class */ (function () {
    function GameCryptoTransferManager(app) {
        this.app = app;
        this.game_crypto_transfer_manager_overlay = new GameOverlay(app);
    }
    GameCryptoTransferManager.prototype.render = function (app, mod) {
    };
    GameCryptoTransferManager.prototype.attachEvents = function (app, mod, mycallback) {
        if (mycallback === void 0) { mycallback = null; }
    };
    GameCryptoTransferManager.prototype.balance = function (app, mod, address, ticker, mycallback) {
        if (mycallback === void 0) { mycallback = null; }
        var sobj = {};
        sobj.address = address;
        sobj.ticker = ticker;
        this.game_crypto_transfer_manager_overlay.showOverlay(app, mod, GameCryptoTransferManagerBalanceTemplate(app, sobj));
        document.querySelector(".game-overlay-backdrop").onclick = (e) = {};
    };
    GameCryptoTransferManager.prototype.send = function (app, mod, sender, receiver, amount, ts, ticker, mycallback) {
        var _this = this;
        if (mycallback === void 0) { mycallback = null; }
        var sobj = {};
        sobj.amount = amount;
        sobj.from = sender;
        sobj.to = receiver;
        sobj.ticker = ticker;
        this.game_crypto_transfer_manager_overlay.showOverlay(app, mod, GameCryptoTransferManagerSendTemplate(app, sobj));
        document.querySelector(".game-overlay-backdrop").onclick = (e) = {};
        document.querySelector(".crypto_transfer_btn").onclick = function (e) {
            _this.game_crypto_transfer_manager_overlay.hideOverlay(mycallback);
        };
    };
    GameCryptoTransferManager.prototype.receive = function (app, mod, sender, receiver, amount, ts, ticker, mycallback) {
        if (mycallback === void 0) { mycallback = null; }
        var sobj = {};
        sobj.amount = amount;
        sobj.from = sender;
        sobj.to = receiver;
        sobj.ticker = ticker;
        this.game_crypto_transfer_manager_overlay.showOverlay(app, mod, GameCryptoTransferManagerReceiveTemplate(app, sobj));
        document.querySelector(".game-overlay-backdrop").onclick = (e) = {};
        if (mycallback != null) {
            mycallback();
        }
    };
    GameCryptoTransferManager.prototype.hideOverlay = function () {
        this.game_crypto_transfer_manager_overlay.hideOverlay();
    };
    return GameCryptoTransferManager;
}());
module.exports = GameCryptoTransferManager;
//# sourceMappingURL=game-crypto-transfer-manager.js.map