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
var binary_1 = __importDefault(require("./binary"));
var wallet_1 = __importDefault(require("./wallet"));
var crypto_1 = __importDefault(require("./crypto"));
test("signBuffer", function () {
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
    wallet.wallet.privatekey = "4a16ffa08e5fc440772ee962c1d730041f12c7008a6e5c704d13dfd3d1905e0d";
    wallet.wallet.publickey = "28Mh8nEhxymH9bFMhSKU51pnSQAnqURuPYkXTUqY2ueDM";
    mockApp.hash = function (data) {
        return blake3.hash(data).toString('hex');
    };
    var testBuffer = Buffer.from("testing 123", 'utf-8');
    var result = crypto.signBuffer(testBuffer, Buffer.from(wallet.wallet.privatekey, "hex"));
    var signedBuffer = Buffer.concat([testBuffer, Buffer.from(result, 'hex')]);
    expect(result)
        .toEqual("2e4a69e9d538ee32bf44d486b7130a8971c051946184ae27a4e5bbbbe9f85bf16370595e252204d5857659959046f3b374821f08b8f35d824cd7b2010f4987ef");
    var verificationResult = crypto.verifyHash(crypto.hash(testBuffer.toString()), result, wallet.wallet.publickey);
    expect(verificationResult).toBeTruthy();
});
//# sourceMappingURL=crypto.spec.js.map