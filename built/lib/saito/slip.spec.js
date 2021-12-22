"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var blake3 = __importStar(require("blake3"));
var networkapi_1 = __importDefault(require("./networkapi"));
var crypto_1 = __importDefault(require("./crypto"));
var binary_1 = __importDefault(require("./binary"));
var wallet_1 = __importDefault(require("./wallet"));
var slip_1 = __importDefault(require("./slip"));
test("slip serialize deserialze", function () {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    var mockApp = {};
    var networkApi = new networkapi_1.default(mockApp);
    var crypto = new crypto_1.default(mockApp);
    var binary = new binary_1.default(mockApp);
    var wallet = new wallet_1.default(mockApp);
    mockApp.networkApi = networkApi;
    mockApp.crypto = crypto;
    mockApp.binary = binary;
    mockApp.wallet = wallet;
    wallet.wallet.privatekey = "854702489d49c7fb2334005b903580c7a48fe81121ff16ee6d1a528ad32f235d";
    wallet.wallet.publickey = mockApp.crypto.toBase58("02af1a4714cfc7ae33d3f6e860c23191ddea07bcb1bfa6c85bc124151ad8d4ce74");
    mockApp.hash = function (data) {
        return blake3.hash(data).toString('hex');
    };
    var slip = new slip_1.default(wallet.wallet.privatekey);
    slip.add = mockApp.crypto.toBase58("02af1a4714cfc7ae33d3f6e860c23191ddea07bcb1bfa6c85bc124151ad8d4ce74");
    slip.amt = BigInt(1234);
    slip.sid = 2;
    slip.type = 3;
    var buffer = slip.serialize(mockApp, "dcf6cceb74717f98c3f7239459bb36fdcd8f350eedbfccfbebf7c0b0161fcd8b");
    var slip2 = new slip_1.default(wallet.wallet.privatekey);
    slip2.deserialize(mockApp, buffer);
    console.log("SLIP 2");
    console.log(slip2.add);
    console.log(slip2.amt);
    console.log(slip2.sid);
    console.log(slip2.type);
    expect(slip2.add).toEqual(slip.add);
    expect(slip2.amt).toEqual(slip.amt);
    expect(slip2.sid).toEqual(slip.sid);
    expect(slip2.type).toEqual(slip.type);
});
describe("serializeForSignature", function () {
    test("empty slip", function () {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        var mockApp = {};
        var networkApi = new networkapi_1.default(mockApp);
        var crypto = new crypto_1.default(mockApp);
        var binary = new binary_1.default(mockApp);
        var wallet = new wallet_1.default(mockApp);
        mockApp.networkApi = networkApi;
        mockApp.crypto = crypto;
        mockApp.binary = binary;
        mockApp.wallet = wallet;
        wallet.wallet.privatekey = "854702489d49c7fb2334005b903580c7a48fe81121ff16ee6d1a528ad32f235d";
        wallet.wallet.publickey = "02af1a4714cfc7ae33d3f6e860c23191ddea07bcb1bfa6c85bc124151ad8d4ce74";
        mockApp.hash = function (data) {
            return blake3.hash(data).toString('hex');
        };
        var slip = new slip_1.default();
        var buffer = slip.serializeInputForSignature(mockApp);
        expect(buffer).toEqual(Uint8Array.from(Buffer.alloc(78)));
    });
});
//# sourceMappingURL=slip.spec.js.map