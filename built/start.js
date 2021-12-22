"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = __importDefault(require("./lib/saito/core/server"));
var storage_core_1 = __importDefault(require("./lib/saito/core/storage-core"));
var core_1 = require("./apps/core");
var modules_config_1 = __importDefault(require("./config/modules.config"));
function initSaito() {
    return __awaiter(this, void 0, void 0, function () {
        function shutdownSaito() {
            console.log("Shutting down Saito");
            app.server.close();
            app.network.close();
        }
        var app, _a, protocol, host, port, localServer;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    app = new core_1.Saito({
                        mod_paths: modules_config_1.default.core,
                    });
                    app.server = new server_1.default(app);
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    app.storage = new storage_core_1.default(app);
                    app.BROWSER = 0;
                    app.SPVMODE = 0;
                    //
                    // set basedir
                    //
                    global.__webdir = __dirname + "/lib/saito/web/";
                    return [4 /*yield*/, app.init()];
                case 1:
                    _b.sent();
                    _a = app.options.server, protocol = _a.protocol, host = _a.host, port = _a.port;
                    localServer = "".concat(protocol, "://").concat(host, ":").concat(port);
                    console.log("\n\n                                           \n                     \u25FC\u25FC\u25FC                   \n                  \u25FC\u25FC   \u25FC \u25FC\u25FC                \n               \u25FC\u25FC\u25FC      \u25FC  \u25FC\u25FC\u25FC             \n            \u25FC\u25FC\u25FC          \u25FC    \u25FC\u25FC\u25FC          \n         \u25FC\u25FC\u25FC              \u25FC      \u25FC\u25FC\u25FC       \n       \u25FC\u25FC\u25FC                 \u25FC       \u25FC\u25FC\u25FC     \n    \u25FC\u25FC\u25FC                     \u25FC         \u25FC\u25FC\u25FC  \n   \u25FC\u25FC\u25FC                       \u25FC         \u25FC\u25FC\u25FC \n   \u25FC  \u25FC\u25FC\u25FC                     \u25FC     \u25FC\u25FC\u25FC  \u25FC \n   \u25FC     \u25FC\u25FC\u25FC                   \u25FC  \u25FC\u25FC\u25FC    \u25FC \n   \u25FC       \u25FC\u25FC\u25FC                 \u25FC\u25FC\u25FC       \u25FC \n   \u25FC        \u25FC \u25FC\u25FC\u25FC           \u25FC\u25FC\u25FC          \u25FC \n   \u25FC       \u25FC     \u25FC\u25FC\u25FC     \u25FC\u25FC\u25FC             \u25FC \n   \u25FC      \u25FC         \u25FC\u25FC \u25FC\u25FC                \u25FC \n   \u25FC     \u25FC            \u25FC                  \u25FC \n   \u25FC    \u25FC             \u25FC                  \u25FC \n   \u25FC   \u25FC              \u25FC                  \u25FC \n   \u25FC  \u25FC               \u25FC                  \u25FC \n   \u25FC \u25FC                \u25FC                  \u25FC \n   \u25FC\u25FC                 \u25FC                  \u25FC \n   \u25FC\u25FC                 \u25FC\u25FC\u25FC\u25FC\u25FC\u25FC\u25FC\u25FC\u25FC\u25FC\u25FC\u25FC\u25FC\u25FC\u25FC\u25FC\u25FC\u25FC\u25FC\u25FC \n    \u25FC\u25FC\u25FC               \u25FC               \u25FC\u25FC\u25FC  \n       \u25FC\u25FC\u25FC            \u25FC            \u25FC\u25FC\u25FC     \n         \u25FC\u25FC\u25FC          \u25FC          \u25FC\u25FC\u25FC       \n            \u25FC\u25FC\u25FC       \u25FC       \u25FC\u25FC\u25FC          \n               \u25FC\u25FC\u25FC    \u25FC    \u25FC\u25FC\u25FC             \n                  \u25FC\u25FC  \u25FC  \u25FC\u25FC                \n                     \u25FC\u25FC\u25FC                   \n                                           \n    ################################################################\n\n    Welcome to Saito\n\n    address: ".concat(app.wallet.returnPublicKey(), "\n    balance: ").concat(app.wallet.returnBalance(), "\n    local module server: ").concat(localServer, "\n\n    ################################################################\n\n    This is the address and balance of your computer on the Saito network. Once Saito\n    is running it will generate tokens automatically over time. The more transactions\n    you process the greater the chance that you will be rewarded for the work.\n\n    For inquiries please visit our website: https://saito.io\n\n  "));
                    /////////////////////
                    // Cntl-C to Close //
                    /////////////////////
                    process.on("SIGTERM", function () {
                        shutdownSaito();
                        console.log("Network Shutdown");
                        process.exit(0);
                    });
                    process.on("SIGINT", function () {
                        shutdownSaito();
                        console.log("Network Shutdown");
                        process.exit(0);
                    });
                    return [2 /*return*/];
            }
        });
    });
}
initSaito();
//# sourceMappingURL=start.js.map