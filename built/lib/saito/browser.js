"use strict";
// @ts-nocheck
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var screenfull_1 = __importDefault(require("screenfull"));
var Browser = /** @class */ (function () {
    function Browser(app) {
        this.app = app || {};
        this.browser_active = 0;
        this.drag_callback = null;
        this.urlParams = {};
        //
        // tells us the browser window is visible, as opposed to
        // browser_active which is used to figure out which applications
        // users are interacting with in the browser.
        //
        this.active_tab = 0;
    }
    Browser.prototype.initialize = function (app) {
        return __awaiter(this, void 0, void 0, function () {
            var channel_1, current_url, myurl, myurlpath, active_module, entries, entries_1, entries_1_1, pair, preferred_crypto_found, available_cryptos, i, i, urlParams, err_1;
            var e_1, _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.app.BROWSER != 1) {
                            return [2 /*return*/, 0];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        if (!document.hidden) {
                            this.setActiveTab(1);
                        }
                        //
                        // Ralph took the conch from where it lay on the polished seat and held it
                        // to his lips; but then he hesitated and did not blow. He held the shell
                        // up instead and showed it to them and they understood.
                        //
                        try {
                            channel_1 = new BroadcastChannel('saito');
                            if (!document.hidden) {
                                channel_1.postMessage({ active: 1, publickey: this.app.wallet.returnPublicKey() });
                            }
                            channel_1.onmessage = function (e) {
                                if (!document.hidden) {
                                    channel_1.postMessage({ active: 1, publickey: _this.app.wallet.returnPublicKey() });
                                    _this.setActiveTab(1);
                                }
                                else {
                                    //
                                    // only disable if someone else active w/ same key
                                    //
                                    if (e.data) {
                                        if (e.data.active == 1) {
                                            if (e.data.active == 1 && e.data.publickey === _this.app.wallet.returnPublicKey()) {
                                                _this.setActiveTab(0);
                                            }
                                        }
                                    }
                                }
                            };
                            document.addEventListener("visibilitychange", function () {
                                if (document.hidden) {
                                    channel_1.postMessage({ active: 0, publickey: _this.app.wallet.returnPublicKey() });
                                }
                                else {
                                    _this.setActiveTab(1);
                                    channel_1.postMessage({ active: 1, publickey: _this.app.wallet.returnPublicKey() });
                                }
                            }, false);
                            window.addEventListener('storage', function (e) {
                                if (_this.active_tab == 0) {
                                    _this.app.storage.loadOptions();
                                }
                            });
                        }
                        catch (err) {
                            console.error(err);
                        }
                        //
                        // try and figure out what module is running
                        // This code will error in a node.js environment - that's ok.
                        // Abercrombie's rule.
                        //
                        if (typeof window == "undefined") {
                            console.log("Initializing Saito Node");
                            return [2 /*return*/];
                        }
                        else {
                            console.info("Initializing Saito Light Client");
                        }
                        current_url = window.location.toString();
                        myurl = new URL(current_url);
                        myurlpath = myurl.pathname.split("/");
                        active_module = myurlpath[1] ? myurlpath[1].toLowerCase() : "";
                        if (active_module == "") {
                            active_module = "website";
                        }
                        //
                        // query strings
                        //
                        this.urlParams = new URLSearchParams(window.location.search);
                        entries = this.urlParams.entries();
                        try {
                            for (entries_1 = __values(entries), entries_1_1 = entries_1.next(); !entries_1_1.done; entries_1_1 = entries_1.next()) {
                                pair = entries_1_1.value;
                                //
                                // if crypto is provided switch over
                                //
                                if (pair[0] === "crypto") {
                                    preferred_crypto_found = 0;
                                    available_cryptos = this.app.wallet.returnInstalledCryptos();
                                    for (i = 0; i < available_cryptos.length; i++) {
                                        if (available_cryptos[i].ticker) {
                                            if (available_cryptos[i].ticker.toLowerCase() === pair[1].toLowerCase()) {
                                                preferred_crypto_found = 1;
                                                this.app.wallet.setPreferredCrypto(available_cryptos[i].ticker);
                                            }
                                        }
                                    }
                                    if (preferred_crypto_found == 0) {
                                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                        // @ts-ignore
                                        salert("Your compile does not contain a ".concat(pair[1].toUpperCase(), " module. Visit the AppStore or contact us about getting one built!"));
                                    }
                                }
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (entries_1_1 && !entries_1_1.done && (_a = entries_1.return)) _a.call(entries_1);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                        //
                        // tell that module it is active
                        //
                        for (i = 0; i < this.app.modules.mods.length; i++) {
                            if (this.app.modules.mods[i].returnSlug() == active_module) {
                                this.app.modules.mods[i].browser_active = 1;
                                this.app.modules.mods[i].alerts = 0;
                                urlParams = new URLSearchParams(location.search);
                                this.app.modules.mods[i].handleUrlParams(urlParams);
                            }
                        }
                        //
                        // check if we are already open in another tab -
                        // gracefully return out after warning user.
                        //
                        this.checkForMultipleWindows();
                        if (!('serviceWorker' in navigator)) return [3 /*break*/, 3];
                        return [4 /*yield*/, navigator.serviceWorker
                                .register('/sw.js')];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        this.browser_active = 1;
                        return [3 /*break*/, 5];
                    case 4:
                        err_1 = _b.sent();
                        if (err_1 == "ReferenceError: document is not defined") {
                            console.log("non-browser detected: " + err_1);
                        }
                        else {
                            throw err_1;
                        }
                        return [3 /*break*/, 5];
                    case 5:
                        if (this.app.BROWSER == 1) {
                            //
                            // Add Connection Monitors
                            //
                            this.app.connection.on('connection_up', function (peer) {
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                siteMessage('Websocket Connection Established', 1000);
                            });
                            this.app.connection.on('connection_down', function (peer) {
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                siteMessage('Websocket Connection Lost');
                            });
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Browser.prototype.returnURLParameter = function (name) {
        var e_2, _a;
        var entries = this.urlParams.entries();
        try {
            for (var entries_2 = __values(entries), entries_2_1 = entries_2.next(); !entries_2_1.done; entries_2_1 = entries_2.next()) {
                var pair = entries_2_1.value;
                if (pair[0] == name) {
                    return pair[1];
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (entries_2_1 && !entries_2_1.done && (_a = entries_2.return)) _a.call(entries_2);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return "";
    };
    Browser.prototype.isMobileBrowser = function (user_agent) {
        var check = false;
        (function (user_agent) {
            if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(user_agent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(user_agent.substr(0, 4)))
                check = true;
        })(user_agent);
        return check;
    };
    Browser.prototype.isSupportedBrowser = function (userAgent) {
        //
        // no to Safari
        //
        if (userAgent.toLowerCase().indexOf("safari/") > -1) {
            if (userAgent.toLowerCase().indexOf("chrome") == -1 && userAgent.toLowerCase().indexOf("firefox") == -1) {
                return 0;
            }
        }
        //
        // require ES6
        //
        try {
            Function("() => {};");
        }
        catch (err) {
            return 0;
        }
        return 1;
    };
    Browser.prototype.sendNotification = function (title, message, event) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.app.BROWSER == 0) {
                    return [2 /*return*/];
                }
                if (!this.isMobileBrowser(navigator.userAgent)) {
                    if (Notification.permission === 'default') {
                        Notification.requestPermission();
                    }
                    if (Notification.permission === 'granted') {
                        notify = new Notification(title, {
                            body: message,
                            iconURL: "/saito/img/touch/pwa-192x192.png",
                            icon: "/saito/img/touch/pwa-192x192.png"
                        });
                    }
                }
                else {
                    Notification.requestPermission()
                        .then(function (result) {
                        if (result === 'granted' || result === 'default') {
                            navigator.serviceWorker.ready.then(function (registration) {
                                registration.showNotification(title, {
                                    body: message,
                                    icon: '/saito/img/touch/pwa-192x192.png',
                                    vibrate: [200, 100, 200, 100, 200, 100, 200],
                                    tag: event
                                });
                            });
                        }
                    });
                }
                return [2 /*return*/];
            });
        });
    };
    Browser.prototype.checkForMultipleWindows = function () {
        var _this = this;
        //Add a check to local storage that we are open in a tab.
        localStorage.openpages = Date.now();
        var onLocalStorageEvent = function (e) {
            if (e.key == "openpages") {
                // Listen if anybody else opening the same page!
                localStorage.page_available = Date.now();
            }
            if (e.key == "page_available" && !_this.isMobileBrowser(navigator.userAgent)) {
                console.log(e.key);
                console.log(navigator.userAgent);
                //alert("One more page already open");
                //window.location.href = "/tabs.html";
            }
        };
        window.addEventListener('storage', onLocalStorageEvent, false);
    };
    Browser.prototype.returnInviteObject = function (email) {
        if (email === void 0) { email = ""; }
        //
        // this informaton is in the email link provided by the user
        // to their friends.
        //
        var obj = {};
        obj.publickey = this.app.wallet.returnPublicKey();
        obj.bundle = "";
        obj.email = email;
        if (this.app.options.bundle != "") {
            obj.bundle = this.app.options.bundle;
        }
        return obj;
    };
    //
    // toggle active tab and disable / enable core blockchain
    // functionality as needed.
    //
    Browser.prototype.setActiveTab = function (active) {
        this.active_tab = active;
        this.app.blockchain.process_blocks = active;
        this.app.storage.save_options = active;
        for (var i = 0; i < this.app.network.peers.length; i++) {
            this.app.network.peers[i].handle_peer_requests = active;
        }
    };
    //////////////////////////////////
    // Browser and Helper Functions //
    //////////////////////////////////
    // https://github.com/sindresorhus/screenfull.js
    Browser.prototype.requestFullscreen = function () {
        if (screenfull_1.default.isEnabled) {
            screenfull_1.default.toggle();
        }
    };
    Browser.prototype.addElementToDom = function (html, id) {
        if (id === void 0) { id = null; }
        var el = document.createElement('div');
        if (id == null) {
            document.body.appendChild(el);
        }
        else {
            if (!document.getElementById(id)) {
                document.body.appendChild(el);
            }
            else {
                document.getElementById(id).appendChild(el);
            }
        }
        el.outerHTML = html;
    };
    Browser.prototype.prependElementToDom = function (html, elemWhere) {
        if (elemWhere === void 0) { elemWhere = document.body; }
        try {
            var elem = document.createElement('div');
            elemWhere.insertAdjacentElement('afterbegin', elem);
            elem.outerHTML = html;
        }
        catch (err) {
            console.log("ERROR 582343: error in prependElementToDom");
        }
    };
    Browser.prototype.addElementToElement = function (html, elem) {
        if (elem === void 0) { elem = document.body; }
        try {
            var el = document.createElement('div');
            elem.appendChild(el);
            el.outerHTML = html;
        }
        catch (err) {
            console.log("ERROR 582343: error in addElementToElement");
        }
    };
    Browser.prototype.makeElement = function (elemType, elemId, elemClass) {
        var headerDiv = document.createElement(elemType);
        headerDiv.id = elemId;
        headerDiv.class = elemClass;
        return headerDiv;
    };
    Browser.prototype.htmlToElement = function (domstring) {
        var html = new DOMParser().parseFromString(domstring, 'text/html');
        return html.body.firstChild;
    };
    Browser.prototype.formatDate = function (timestamp) {
        var datetime = new Date(timestamp);
        var hours = datetime.getHours();
        var minutes = datetime.getMinutes();
        var months = [12];
        months[0] = "January";
        months[1] = "February";
        months[2] = "March";
        months[3] = "April";
        months[4] = "May";
        months[5] = "June";
        months[6] = "July";
        months[7] = "August";
        months[8] = "September";
        months[9] = "October";
        months[10] = "November";
        months[11] = "December";
        var month = months[datetime.getMonth()];
        var day = datetime.getDay();
        var year = datetime.getFullYear();
        minutes = minutes.toString().length == 1 ? "0".concat(minutes) : "".concat(minutes);
        return { year: year, month: month, day: day, hours: hours, minutes: minutes };
    };
    Browser.prototype.addDragAndDropFileUploadToElement = function (id, handleFileDrop, click_to_upload) {
        var _this = this;
        if (handleFileDrop === void 0) { handleFileDrop = null; }
        if (click_to_upload === void 0) { click_to_upload = true; }
        var hidden_upload_form = "\n      <form class=\"my-form\" style=\"display:none\">\n        <p>Upload multiple files with the file dialog or by dragging and dropping images onto the dashed region</p>\n        <input type=\"file\" id=\"hidden_file_element_".concat(id, "\" multiple accept=\"*\">\n        <label class=\"button\" for=\"fileElem\">Select some files</label>\n      </form>\n    ");
        if (!document.getElementById("hidden_file_element_".concat(id))) {
            this.addElementToDom(hidden_upload_form, id);
            var dropArea_1 = document.getElementById(id);
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(function (eventName) {
                dropArea_1.addEventListener(eventName, _this.preventDefaults, false);
            });
            ['dragenter', 'dragover'].forEach(function (eventName) {
                dropArea_1.addEventListener(eventName, _this.highlight, false);
            });
            ['dragleave', 'drop'].forEach(function (eventName) {
                dropArea_1.addEventListener(eventName, _this.unhighlight, false);
            });
            dropArea_1.addEventListener('drop', function (e) {
                var dt = e.dataTransfer;
                var files = dt.files;
                (__spreadArray([], __read(files), false)).forEach(function (file) {
                    var reader = new FileReader();
                    reader.addEventListener('load', function (event) {
                        handleFileDrop(event.target.result);
                    });
                    reader.readAsDataURL(file);
                });
            }, false);
            dropArea_1.parentNode.parentNode.addEventListener('paste', function (e) {
                var files = e.clipboardData.files;
                (__spreadArray([], __read(files), false)).forEach(function (file) {
                    var reader = new FileReader();
                    reader.addEventListener('load', function (event) {
                        handleFileDrop(event.target.result);
                    });
                    reader.readAsDataURL(file);
                });
            }, false);
            var input_1 = document.getElementById("hidden_file_element_".concat(id));
            if (click_to_upload == true) {
                dropArea_1.addEventListener('click', function (e) {
                    input_1.click();
                });
            }
            input_1.addEventListener('change', function (e) {
                var fileName = '';
                if (this.files && this.files.length > 0) {
                    var files = this.files;
                    (__spreadArray([], __read(files), false)).forEach(function (file) {
                        var reader = new FileReader();
                        reader.addEventListener('load', function (event) {
                            handleFileDrop(event.target.result);
                        });
                        reader.readAsDataURL(file);
                    });
                }
            }, false);
            dropArea_1.focus();
        }
    };
    Browser.prototype.highlight = function (e) {
        document.getElementById(e.currentTarget.id).style.opacity = 0.8;
    };
    Browser.prototype.unhighlight = function (e) {
        document.getElementById(e.currentTarget.id).style.opacity = 1;
    };
    Browser.prototype.preventDefaults = function (e) {
        e.preventDefault();
        e.stopPropagation();
    };
    Browser.prototype.makeDraggable = function (id_to_move, id_to_drag, mycallback) {
        if (id_to_drag === void 0) { id_to_drag = ""; }
        if (mycallback === void 0) { mycallback = null; }
        try {
            var element_to_move_1 = document.getElementById(id_to_move);
            var element_to_drag = element_to_move_1;
            if (id_to_drag != "") {
                element_to_drag = document.getElementById(id_to_drag);
            }
            var element_moved_1 = 0;
            var mouse_down_left_1 = 0;
            var mouse_down_top_1 = 0;
            var mouse_current_left_1 = 0;
            var mouse_current_top_1 = 0;
            var element_start_left_1 = 0;
            var element_start_top_1 = 0;
            element_to_drag.onmousedown = function (e) {
                if ((e.currentTarget.id != id_to_move && e.currentTarget.id != id_to_drag) || e.currentTarget.id === undefined) {
                    document.ontouchend = null;
                    document.ontouchmove = null;
                    document.onmouseup = null;
                    document.onmousemove = null;
                    return;
                }
                e = e || window.event;
                //e.preventDefault();
                //if (e.stopPropagation) { e.stopPropagation(); }
                //if (e.preventDefault) { e.preventDefault(); }
                //e.cancelBubble = true;
                //e.returnValue = false;
                var rect = element_to_move_1.getBoundingClientRect();
                element_start_left_1 = rect.left;
                element_start_top_1 = rect.top;
                mouse_down_left_1 = e.clientX;
                mouse_down_top_1 = e.clientY;
                mouse_current_left_1 = mouse_down_left_1;
                mouse_current_top_1 = mouse_down_top_1;
                //console.log("Element Start Left: " + element_start_left);
                //console.log("Element Start Top: " + element_start_top);
                //console.log("Mouse Down Left: " + mouse_down_left);
                //console.log("Mouse Down Top: " + mouse_down_top);
                document.onmouseup = function (e) {
                    document.ontouchend = null;
                    document.ontouchmove = null;
                    document.onmouseup = null;
                    document.onmousemove = null;
                    if (mycallback != null) {
                        if (element_moved_1 == 1) {
                            mycallback();
                        }
                    }
                };
                document.onmousemove = function (e) {
                    e = e || window.event;
                    //e.preventDefault();
                    mouse_current_left_1 = e.clientX;
                    mouse_current_top_1 = e.clientY;
                    var adjustmentX = mouse_current_left_1 - mouse_down_left_1;
                    var adjustmentY = mouse_current_top_1 - mouse_down_top_1;
                    if (adjustmentX > 0) {
                        element_moved_1 = 1;
                    }
                    if (adjustmentY > 0) {
                        element_moved_1 = 1;
                    }
                    // set the element's new position:
                    element_to_move_1.style.left = (element_start_left_1 + adjustmentX) + "px";
                    element_to_move_1.style.top = (element_start_top_1 + adjustmentY) + "px";
                    element_to_move_1.style.bottom = "unset";
                    element_to_move_1.style.right = "unset";
                    element_to_move_1.style.transform = "unset";
                    element_to_move_1.style.transform = "unset";
                };
            };
            element_to_drag.ontouchstart = function (e) {
                if ((e.currentTarget.id != id_to_move && e.currentTarget.id != id_to_drag) || e.currentTarget.id === undefined) {
                    document.ontouchend = null;
                    document.ontouchmove = null;
                    document.onmouseup = null;
                    document.onmousemove = null;
                    return;
                }
                e = e || window.event;
                //e.preventDefault();
                //if (e.stopPropagation) { e.stopPropagation(); }
                //if (e.preventDefault) { e.preventDefault(); }
                //e.cancelBubble = true;
                //e.returnValue = false;
                var rect = element_to_move_1.getBoundingClientRect();
                element_start_left_1 = rect.left;
                element_start_top_1 = rect.top;
                mouse_down_left_1 = (e.targetTouches[0] ? e.targetTouches[0].pageX : e.changedTouches[e.changedTouches.length - 1].pageX);
                mouse_down_top_1 = (e.targetTouches[0] ? event.targetTouches[0].pageY : e.changedTouches[e.changedTouches.length - 1].pageY);
                mouse_current_left_1 = mouse_down_left_1;
                mouse_current_top_1 = mouse_down_top_1;
                document.ontouchend = function (e) {
                    document.ontouchend = null;
                    document.ontouchmove = null;
                    document.onmouseup = null;
                    document.onmousemove = null;
                    if (mycallback != null) {
                        if (element_moved_1 == 1) {
                            mycallback();
                        }
                    }
                };
                document.ontouchmove = function (e) {
                    e = e || window.event;
                    //e.preventDefault();
                    mouse_current_left_1 = (e.targetTouches[0] ? e.targetTouches[0].pageX : e.changedTouches[e.changedTouches.length - 1].pageX);
                    mouse_current_top_1 = (e.targetTouches[0] ? event.targetTouches[0].pageY : e.changedTouches[e.changedTouches.length - 1].pageY);
                    var adjustmentX = mouse_current_left_1 - mouse_down_left_1;
                    var adjustmentY = mouse_current_top_1 - mouse_down_top_1;
                    if (adjustmentX > 0) {
                        element_moved_1 = 1;
                    }
                    if (adjustmentY > 0) {
                        element_moved_1 = 1;
                    }
                    // set the element's new position:
                    element_to_move_1.style.left = element_start_left_1 + adjustmentX + "px";
                    element_to_move_1.style.top = element_start_top_1 + adjustmentY + "px";
                    element_to_move_1.style.bottom = "unset";
                    element_to_move_1.style.right = "unset";
                    element_to_move_1.style.transform = "unset";
                    element_to_move_1.style.transform = "unset";
                };
            };
        }
        catch (err) {
            console.log("error: " + err);
        }
    };
    /**
     * Fetchs identifiers from a set of keys
     *
     * @param {Array} keys
     */
    Browser.prototype.addIdentifiersToDom = function (keys) {
        if (keys === void 0) { keys = []; }
        return __awaiter(this, void 0, void 0, function () {
            var addresses, answer, err_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (keys.length == 0) {
                            addresses = document.getElementsByClassName("saito-address");
                            Array.from(addresses).forEach(function (add) {
                                var pubkey = add.getAttribute("data-id");
                                if (pubkey) {
                                    keys.push(pubkey);
                                }
                            });
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.app.keys.fetchManyIdentifiersPromise(keys)];
                    case 2:
                        answer = _a.sent();
                        Object.entries(answer).forEach(function (_a) {
                            var _b = __read(_a, 2), key = _b[0], value = _b[1];
                            return _this.updateAddressHTML(key, value);
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        err_2 = _a.sent();
                        console.error(err_2);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Browser.prototype.returnAddressHTML = function (key) {
        var identifier = this.app.keys.returnIdentifierByPublicKey(key);
        var id = !identifier ? key : identifier;
        return "<span data-id=\"".concat(key, "\" class=\"saito-address saito-address-").concat(key, "\">").concat(id, "</span>");
    };
    Browser.prototype.returnAddressHTMLPromise = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var identifier, id;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.returnIdentifier(key)];
                    case 1:
                        identifier = _a.sent();
                        id = !identifier ? key : identifier;
                        return [2 /*return*/, "<span class=\"saito-address saito-address-".concat(key, "\">").concat(id, "</span>")];
                }
            });
        });
    };
    Browser.prototype.updateAddressHTML = function (key, id) {
        if (!id) {
            return;
        }
        try {
            var addresses = document.getElementsByClassName("saito-address-".concat(key));
            Array.from(addresses).forEach(function (add) { return add.innerHTML = id; });
        }
        catch (err) {
        }
    };
    Browser.prototype.logMatomoEvent = function (category, action, name, value) {
        try {
            this.app.modules.returnFirstRespondTo("matomo_event_push").push(category, action, name, value);
        }
        catch (err) {
            if (err.startsWith("Module responding to")) {
                console.log("Matomo module not present, cannot push event");
            }
            else {
                console.log(err);
            }
        }
    };
    //////////////////////////////////////////////////////////////////////////////
    /////////////////////// url-hash helper functions ////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    // TODO: Add a function which alphabetizes keys so that noop url changes will
    // always act correctly... .e.g. someFunction("#bar=1&foo=2") should never
    // return "#foo=1&bar=2". Some other way of preserving order may be better...
    //////////////////////////////////////////////////////////////////////////////
    //
    // Parse a url-hash string into an object.
    // usage: parseHash("#foo=1&bar=2") --> {foo: 1, bar: 2}
    Browser.prototype.parseHash = function (hash) {
        if (hash === "") {
            return {};
        }
        return hash.substr(1).split('&').reduce(function (result, item) {
            var parts = item.split('=');
            result[parts[0]] = parts[1];
            return result;
        }, {});
    };
    // Build a url-hash string from an object.
    // usage: buildHash({foo: 1, bar: 2}) --> "#foo=1&bar=2"
    Browser.prototype.buildHash = function (hashObj) {
        var hashString = Object.keys(hashObj).reduce(function (output, key) {
            var val = hashObj[key];
            return output + "&".concat(key, "=").concat(hashObj[key]);
        }, "");
        return "#" + hashString.substr(1);
    };
    // Make a new hash and mix in keys from another hash.
    // usage: buildHashAndPreserve("#foo=1&bar=2","#foo=3&bar=4&baz=5","baz") --> "#foo=1&bar=2&baz=5"
    Browser.prototype.buildHashAndPreserve = function (newHash, oldHash) {
        var preservedKeys = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            preservedKeys[_i - 2] = arguments[_i];
        }
        return this.buildHash(Object.assign(this.getSubsetOfHash(oldHash, preservedKeys), this.parseHash(newHash)));
    };
    // Get a subset of key-value pairs from a url-hash string as an object.
    // usage: getSubsetOfHash("#foo=1&bar=2","bar") --> {bar: 2}
    Browser.prototype.getSubsetOfHash = function (hash) {
        var keys = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            keys[_i - 1] = arguments[_i];
        }
        var hashObj = this.parseHash(hash);
        return keys.reduce(function (o, k) {
            o[k] = hashObj[k];
            return o;
        }, {});
    };
    // Remove a subset of key-value pairs from a url-hash string.
    // usage: removeFromHash("#foo=1&bar=2","bar") --> "#foo=1"
    Browser.prototype.removeFromHash = function (hash) {
        var keys = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            keys[_i - 1] = arguments[_i];
        }
        var hashObj = this.parseHash(hash);
        keys.forEach(function (key, i) {
            delete hashObj[key];
        });
        return this.buildHash(hashObj);
    };
    // Add new key-value pairs to the hash.
    // usage: modifyHash("#foo=1",{bar: 2}) --> "#foo=1&bar=2"
    Browser.prototype.modifyHash = function (oldHash, newHashValues) {
        return this.buildHash(Object.assign(this.parseHash(oldHash), newHashValues));
    };
    // Override defaults with other values. Useful to initialize a page.
    // usage: modifyHash("#foo=1&bar=2","#foo=3") --> "#foo=3&bar=2"
    Browser.prototype.defaultHashTo = function (defaultHash, newHash) {
        return this.buildHash(Object.assign(this.parseHash(defaultHash), this.parseHash(newHash)));
    };
    // Initialize a hash on page load.
    // Typically some values need a setting but can be overridden by a "deep link".
    // Other values must take certain values on page load, e.g. ready=false these
    // go in the forcedHashValues
    //
    // usage:
    // let currentHash = window.location.hash; // (e.g."#page=2&ready=1")
    // initializeHash("#page=1", currentHash, {ready: 0}) --> #page=2&ready=0
    Browser.prototype.initializeHash = function (defaultHash, deepLinkHash, forcedHashValues) {
        return this.modifyHash(this.defaultHashTo(defaultHash, deepLinkHash), forcedHashValues);
    };
    // TODO: implement htis function
    Browser.prototype.getValueFromHashAsBoolean = function () {
    };
    Browser.prototype.getValueFromHashAsNumber = function (hash, key) {
        try {
            var subsetHashObj = this.getSubsetOfHash(hash, key);
            if (subsetHashObj[key]) {
                return Number(subsetHashObj[key]);
            }
            else {
                throw "key not found in hash";
            }
        }
        catch (err) {
            return Number(0);
        }
    };
    return Browser;
}());
exports.default = Browser;
//# sourceMappingURL=browser.js.map