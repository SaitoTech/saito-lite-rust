var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var SaitoHeaderTemplate = require('./templates/saito-header.template');
var UIModTemplate = require('./../../../templates/uimodtemplate');
var SideMenu = require('./lib/side-menu');
var TextSizer = require('./lib/text-sizer');
var SaitoHeader = /** @class */ (function (_super) {
    __extends(SaitoHeader, _super);
    function SaitoHeader(app) {
        var _this = _super.call(this, app) || this;
        //
        // respond to which events
        //
        // demo example of ui components responding to events
        //
        //this.events = ['chat-render-request'];
        _this.name = "SaitoHeader UIComponent";
        _this.app = app;
        if (app.BROWSER) {
            _this.sideMenu = new SideMenu(app);
        }
        //
        // now initialize, since UI components are created
        // after all other modules have initialized, we need
        // to run any missed functions here in the constructor
        // in this case, initialize, as that is what processes
        // receiveEvent, etc.
        //
        _this.initialize(app);
        return _this;
    }
    SaitoHeader.prototype.initialize = function (app) {
        var _this = this;
        _super.prototype.initialize.call(this, app);
        app.connection.on('update_balance', function (wallet) { _this.renderCrypto(app, _this); });
        app.connection.on('update_identifier', function (key) { _this.renderUsername(app, _this); });
        app.connection.on('update_email', function (key) { _this.sideMenu.render(app, _this); });
        app.connection.on("set_preferred_crypto", function (data) { _this.renderCrypto(app, _this); });
    };
    SaitoHeader.prototype.updateIdentifier = function (app) {
        try {
            var identifier = this.app.keys.returnIdentifierByPublicKey(app.wallet.returnPublicKey());
            if (identifier == app.wallet.returnPublicKey() || identifier == "") {
            }
            else {
                document.getElementById("header-username").innerHTML = identifier;
            }
        }
        catch (err) {
        }
    };
    SaitoHeader.prototype.loadBalance = function (cryptoMod) {
        return __awaiter(this, void 0, void 0, function () {
            var innerText, balance, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        innerText = "activate " + cryptoMod.ticker;
                        if (!cryptoMod.returnIsActivated()) return [3 /*break*/, 2];
                        return [4 /*yield*/, cryptoMod.formatBalance()];
                    case 1:
                        balance = _a.sent();
                        innerText = balance + " " + cryptoMod.ticker;
                        _a.label = 2;
                    case 2:
                        document.querySelector("#crypto-option-".concat(cryptoMod.name)).innerHTML = innerText;
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        console.log(err_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SaitoHeader.prototype.render = function (app, mod) {
        try {
            //
            // UI component (modules) will show up sometimes if they're in the mod list
            // but in those cases mod will be undefined, so we can work-around the problem
            // by only rendering if there is a module here...
            //
            if (mod == null) {
                return;
            }
            if (!document.getElementById("saito-header")) {
                app.browser.addElementToDom(SaitoHeaderTemplate(app));
            }
            this.renderPhoto(app, mod);
            this.renderUsername(app, mod);
            this.renderCrypto(app, mod);
            this.sideMenu.render(app, mod);
            TextSizer.render(app, mod);
            TextSizer.attachEvents(app, mod);
            this.attachEvents(app, mod);
        }
        catch (err) {
            console.log(err);
        }
    };
    SaitoHeader.prototype.renderCrypto = function () {
        return __awaiter(this, void 0, void 0, function () {
            var available_cryptos, preferred_crypto, _a, html, i, crypto_mod, html_1, add_other_cryptos_html, modal_select_crypto, err_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        available_cryptos = this.app.wallet.returnInstalledCryptos();
                        preferred_crypto = this.app.wallet.returnPreferredCrypto();
                        _a = document.getElementById("profile-public-key");
                        return [4 /*yield*/, this.app.wallet.returnPreferredCrypto().returnAddress()];
                    case 1:
                        _a.innerHTML = _b.sent();
                        document.querySelector("#header-token-select").innerHTML = "";
                        html = "<option id=\"crypto-option-".concat(preferred_crypto.name, "\" value=\"").concat(preferred_crypto.ticker, "\">... ").concat(preferred_crypto.ticker, "</option>");
                        this.app.browser.addElementToElement(html, document.querySelector("#header-token-select"));
                        this.loadBalance(preferred_crypto);
                        //
                        // add other options
                        //
                        for (i = 0; i < available_cryptos.length; i++) {
                            crypto_mod = available_cryptos[i];
                            if (crypto_mod.name != preferred_crypto.name) {
                                html_1 = "<option id=\"crypto-option-".concat(crypto_mod.name, "\" value=\"").concat(crypto_mod.ticker, "\">... ").concat(crypto_mod.ticker, "</option>");
                                this.app.browser.addElementToElement(html_1, document.querySelector("#header-token-select"));
                                this.loadBalance(available_cryptos[i]);
                            }
                        }
                        add_other_cryptos_html = "<option id=\"crypto-option-add-new\" value=\"add-new\">install new crypto...</option>";
                        this.app.browser.addElementToElement(add_other_cryptos_html, document.querySelector("#header-token-select"));
                        modal_select_crypto = new ModalSelectCrypto(app, preferred_crypto);
                        modal_select_crypto.render(app, preferred_crypto);
                        modal_select_crypto.attachEvents(app, preferred_crypto);
                        return [3 /*break*/, 3];
                    case 2:
                        err_2 = _b.sent();
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SaitoHeader.prototype.renderPhoto = function (app, mod) {
        try {
            document.getElementById("header-profile-photo").src = app.keys.returnIdenticon(app.wallet.returnPublicKey());
        }
        catch (err) {
        }
    };
    SaitoHeader.prototype.renderUsername = function (app, mod) {
        try {
            var username = app.keys.returnIdentifierByPublicKey(app.wallet.returnPublicKey());
            if (username == "" || username == app.wallet.returnPublicKey()) {
                username = "Anonymous Account";
            }
            document.getElementById("header-username").innerHTML = username;
        }
        catch (err) {
        }
    };
    SaitoHeader.prototype.receiveEvent = function (type, data) {
        if (type == 'chat-render-request') {
            //console.log("Header Component processing chat-render-request in " + this.name);
        }
    };
    SaitoHeader.prototype.attachEvents = function (app, mod) {
        var _this = this;
        if (!document) {
            return;
        }
        var is_email_mod_active = 0;
        var is_qr_scanner_active = 0;
        for (var i = 0; i < app.modules.mods.length; i++) {
            if (app.modules.mods[i].name == "Email" && app.modules.mods[i].browser_active == 1) {
                is_email_mod_active = 1;
            }
            if (app.modules.mods[i].name == "QRScanner") {
                is_qr_scanner_active = 1;
            }
        }
        document.querySelectorAll('#header-logo-link').forEach(function (element) {
            element.onclick = function (event) {
                var activeModule = app.modules.returnActiveModule();
                if (activeModule) {
                    app.browser.logMatomoEvent("Navigation", "".concat(activeModule.name, "HeaderNavigationClick"), "HeaderLogoHomepageLink");
                }
                else {
                    app.browser.logMatomoEvent("Navigation", "UnknownModuleHeaderNavigationClick", "HeaderLogoHomepageLink");
                    console.log("Error: No active module");
                }
            };
        });
        document.querySelectorAll("#profile-public-key").forEach(function (element, i) {
            element.onmouseup = function () {
                var selObj = window.getSelection();
                if (selObj.toString() === element.innerHTML && element.innerHTML != "copied...") { // The user has selected this element
                    document.execCommand("copy");
                    var oldVal_1 = element.innerHTML;
                    element.innerHTML = "Copied";
                    setTimeout(function () {
                        element.innerHTML = oldVal_1;
                    }, 300);
                }
            };
        });
        document.querySelectorAll('#header-token-select').forEach(function (element, i) {
            element.onchange = function (value) {
                if (element.value === "add-new") {
                    var current_default = _this.app.wallet.returnPreferredCrypto();
                    var select_box = document.querySelector('#header-token-select');
                    select_box.value = current_default.name;
                    var appstore_mod = app.modules.returnModule("AppStore");
                    if (appstore_mod) {
                        var options = { search: "", category: "Cryptocurrency", featured: 1 };
                        appstore_mod.openAppstoreOverlay(options);
                    }
                    else {
                        salert("We cannot install additional cryptocurrencies without AppStore installed!");
                    }
                    return;
                }
                app.wallet.setPreferredCrypto(element.value, 1);
            };
        });
        if (document.getElementById('header-dropdown-scan-qr')) {
            document.getElementById('header-dropdown-scan-qr').onclick = function () {
                if (is_qr_scanner_active == 1) {
                    var qrscanner = app.modules.returnModule("QRScanner");
                    qrscanner.startScanner();
                }
                else {
                    salert("QR Scanner not installed or disabled");
                }
            };
        }
        if (document.getElementById('header-dropdown-my-profile')) {
            document.getElementById('header-dropdown-my-profile').onclick = function () {
                if (is_email_mod_active == 1) {
                    var elements = document.getElementsByClassName("email-apps-item");
                    for (var i = 0; i < elements.length; i++) {
                        if (elements[i].innerHTML === "Profile") {
                            elements[i].click();
                        }
                    }
                }
                else {
                    window.location = '/wallet/#page=email_appspace&subpage=Profile';
                }
            };
        }
        if (document.getElementById('header-dropdown-faucet')) {
            document.getElementById('header-dropdown-faucet').onclick = function () {
                var newtx = app.wallet.createUnsignedTransaction(app.wallet.returnPublicKey(), 0.0);
                newtx.msg.module = "Reward";
                newtx.msg.action = "faucet";
                newtx = app.wallet.signTransaction(newtx);
                app.network.propagateTransaction(newtx);
                salert("Faucet request sent.<br/><br/><i>(Faucet will only pay once every 24 hours)<i/>");
            };
        }
        if (document.getElementById('header-dropdown-add-contacts')) {
            document.getElementById('header-dropdown-add-contacts').onclick = function () {
                var t = app.modules.returnModule("Tutorial");
                if (t) {
                    t.inviteFriendsModal();
                }
            };
        }
        if (document.getElementById('header-dropdown-reset-wallet')) {
            document.getElementById('header-dropdown-reset-wallet').onclick = function () {
                app.wallet.resetWallet();
            };
        }
        if (document.getElementById('header-dropdown-backup-wallet')) {
            document.getElementById('header-dropdown-backup-wallet').onclick = function () {
                app.wallet.backupWallet();
            };
        }
        if (document.getElementById('header-dropdown-settings')) {
            document.getElementById('header-dropdown-settings').onclick = function () {
                if (is_email_mod_active == 1) {
                    var elements = document.getElementsByClassName("email-apps-item");
                    for (var i = 0; i < elements.length; i++) {
                        if (elements[i].innerHTML === "Settings") {
                            elements[i].click();
                        }
                    }
                }
                else {
                    window.location = '/wallet/#page=email_appspace&subpage=Settings';
                }
            };
        }
        if (document.getElementById('header-dropdown-restore-wallet')) {
            document.getElementById('header-dropdown-restore-wallet').onclick = function (e) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    document.getElementById('saito-header-file-input').addEventListener('change', function (e) {
                        var file = e.target.files[0];
                        app.wallet.restoreWallet(file);
                    });
                    document.querySelector('#saito-header-file-input').click();
                    return [2 /*return*/];
                });
            }); };
            //document.getElementById('header-dropdown-restore-wallet').addEventListener('click', async (e) => {
            //
            //  let privatekey = "";
            //  let publickey = "";
            //
            //  try {
            //
            //    privatekey = await sprompt("Enter Private Key:");
            //
            //    if (privatekey != "") {
            //      publickey = app.crypto.returnPublicKey(privatekey);
            //
            //      app.wallet.wallet.privatekey = privatekey;
            //      app.wallet.wallet.publickey = publickey;
            //      app.wallet.wallet.inputs = [];
            //      app.wallet.wallet.outputs = [];
            //      app.wallet.wallet.spends = [];
            //      app.wallet.wallet.pending = [];
            //
            //      await app.wallet.saveWallet();
            //      window.location.reload();
            //    }
            //  } catch (e) {
            //    salert("Restore Private Key ERROR: " + e);
            //    console.log("Restore Private Key ERROR: " + e);
            //  }
            //});
        }
        if (document.querySelector('.manage-account')) {
            document.querySelector('.manage-account').onclick = function () {
                window.location = '/wallet/#page=email_appspace&subpage=Settings';
            };
        }
    };
    return SaitoHeader;
}(UIModTemplate));
module.exports = SaitoHeader;
//# sourceMappingURL=saito-header.js.map