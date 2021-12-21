var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var ModalAddUserTemplate = require('./modal-add-user.template');
var ModalAddUserConfirmTemplate = require('./modal-add-user-confirm.template');
var SaitoOverlay = require('./../saito-overlay/saito-overlay');
var InviteFriendsQR = require('./invite-friends-qr');
var InviteFriendsTemplate = require('./invite-friends.template.js');
var InviteFriendsLinkTemplate = require('./invite-friends-link.template');
var InviteFriendsPublickeyTemplate = require('./invite-friends-publickey.template');
function stopVideo() {
    var video = document.querySelector('video');
    if (video) {
        video.srcObject.getTracks().forEach(function (track) { return track.stop(); });
    }
}
var ModalAddUser = /** @class */ (function () {
    function ModalAddUser(app) {
        this.app = app;
    }
    ModalAddUser.prototype.render = function (app, mod) {
        mod.modal_overlay = new SaitoOverlay(app);
        mod.modal_overlay.render(app, mod);
        mod.modal_overlay.attachEvents(app, mod);
        if (!document.querySelector(".add-user")) {
            mod.modal_overlay.showOverlay(app, mod, ModalAddUserTemplate());
        }
    };
    ModalAddUser.prototype.attachEvents = function (app, mod) {
        var _this = this;
        var startKeyExchange = function (publickey) { return __awaiter(_this, void 0, void 0, function () {
            var doInitiate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("pkey: " + publickey);
                        doInitiate = function (pubkey) {
                            try {
                                var encrypt_mod = app.modules.returnModule('Encrypt');
                                encrypt_mod.initiate_key_exchange(pubkey);
                                console.log("done initiate key exchange");
                                mod.modal_overlay.showOverlay(app, mod, ModalAddUserConfirmTemplate());
                                document.querySelector("#confirm-box").onclick = function () {
                                    mod.modal_overlay.hideOverlay();
                                };
                            }
                            catch (err) {
                                console.log(JSON.stringify(err));
                                salert("Address is not a valid Saito Address");
                            }
                        };
                        if (!!app.crypto.isPublicKey(publickey)) return [3 /*break*/, 2];
                        return [4 /*yield*/, app.keys.fetchPublicKey(publickey, doInitiate)];
                    case 1:
                        publickey = _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        doInitiate(publickey);
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        document.querySelector('.tutorial-skip').onclick = function () {
            stopVideo();
            mod.modal_overlay.hideOverlay();
        };
        document.querySelector('.generate-link-box').onclick = function () {
            document.querySelector('.welcome-modal-left').innerHTML = InviteFriendsLinkTemplate(app);
            document.querySelector('.link-space').addEventListener('click', function (e) {
                var text = document.querySelector('.share-link');
                text.select();
                document.execCommand('copy');
            });
        };
        document.querySelector('.scanqr-link-box').onclick = function () {
            var qrscanner = app.modules.returnModule("QRScanner");
            if (qrscanner) {
                qrscanner.startScanner();
            }
            //      data.stopVideo = stopVideo;
            //      data.startKeyExchange = startKeyExchange;
            //      InviteFriendsQR.render(app, data);
            //      InviteFriendsQR.attachEvents(app, data);
        };
        document.querySelector('.address-link-box').onclick = function () {
            document.querySelector('.welcome-modal-left').innerHTML = InviteFriendsPublickeyTemplate(app);
            document.getElementById('add-contact-btn').onclick = function () {
                var publickey = document.getElementById('add-contact-input').value;
                console.log("VALUE: " + publickey);
                startKeyExchange(publickey);
            };
        };
    };
    return ModalAddUser;
}());
module.exports = ModalAddUser;
//# sourceMappingURL=modal-add-user.js.map