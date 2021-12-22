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
var saito_1 = __importDefault(require("./saito"));
var blake3 = __importStar(require("blake3"));
test("golden ticket serialization", function () {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    var mockApp = {};
    var networkApi = new saito_1.default.networkApi(mockApp);
    var crypto = new saito_1.default.crypto(mockApp);
    var binary = new saito_1.default.binary(mockApp);
    var wallet = new saito_1.default.wallet(mockApp);
    mockApp.networkApi = networkApi;
    mockApp.crypto = crypto;
    mockApp.binary = binary;
    mockApp.wallet = wallet;
    wallet.wallet.privatekey = "4a16ffa08e5fc440772ee962c1d730041f12c7008a6e5c704d13dfd3d1905e0d";
    wallet.wallet.publickey = "28Mh8nEhxymH9bFMhSKU51pnSQAnqURuPYkXTUqY2ueDM";
    mockApp.hash = function (data) {
        return blake3.hash(data).toString('hex');
    };
    var target_hash = "844702489d49c7fb2334005b903580c7a48fe81121ff16ee6d1a528ad32f235e";
    var random_hash = "03bf1a4714cfc7ae33d3f6e860c23191ddea07bcb1bfa6c85bc124151ad8d4ce";
    var golden_ticket = new saito_1.default.goldenticket(mockApp);
    var buffer = golden_ticket.serialize(target_hash, random_hash);
    var result = golden_ticket.deserialize(buffer);
    expect(result.target_hash).toEqual(target_hash);
    expect(result.random_hash).toEqual(random_hash);
    expect(result.creator).toEqual(wallet.wallet.publickey);
});
//# sourceMappingURL=goldenticket.spec.js.map