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
var networkapi_1 = __importDefault(require("./networkapi"));
var crypto_1 = __importDefault(require("./crypto"));
var binary_1 = __importDefault(require("./binary"));
var wallet_1 = __importDefault(require("./wallet"));
var blake3 = __importStar(require("blake3"));
var transaction_1 = __importStar(require("./transaction"));
var slip_1 = __importStar(require("./slip"));
test("tx serialize deserialze", function () {
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
    var tx = new transaction_1.default();
    tx.transaction.ts = 1637034582666;
    tx.transaction.type = transaction_1.TransactionType.ATR;
    tx.transaction.sig =
        "c9a6c2d0bf884be6933878577171a3c8094c2bf6e0bc1b4ec3535a4a55224d186d4d891e254736cae6c0d2002c8dfc0ddfc7fcdbe4bc583f96fa5b273b9d63f4";
    var buffer = tx.serialize(mockApp);
    var tx2 = new transaction_1.default();
    tx2.deserialize(mockApp, buffer, 0);
    expect(tx2.transaction.ts).toEqual(tx.transaction.ts);
    expect(tx2.transaction.type).toEqual(tx.transaction.type);
    expect(tx2.transaction.sig).toEqual(tx.transaction.sig);
});
describe("serializeForSignature", function () {
    /***
     test("empty tx", () => {
        let mockApp = {};
        let networkApi = new saito.networkApi(mockApp);
        let crypto = new saito.crypto(mockApp);
        let binary = new saito.binary(mockApp);
        let wallet = new saito.wallet(mockApp);
        mockApp.networkApi = networkApi;
        mockApp.crypto = crypto;
        mockApp.binary = binary;
        mockApp.wallet = wallet;
        wallet.wallet.privatekey = "854702489d49c7fb2334005b903580c7a48fe81121ff16ee6d1a528ad32f235d";
        wallet.wallet.publickey = "02af1a4714cfc7ae33d3f6e860c23191ddea07bcb1bfa6c85bc124151ad8d4ce74";

        mockApp.hash = (data) => {
            return blake3.hash(data).toString('hex');
        };

        let tx = new saito.transaction();
        let buffer = tx.serializeForSignature(mockApp);

        expect(buffer).toEqual(Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 123, 125]));
    });

     test("with data", () => {
        let mockApp = {};
        let networkApi = new saito.networkApi(mockApp);
        let crypto = new saito.crypto(mockApp);
        let binary = new saito.binary(mockApp);
        let wallet = new saito.wallet(mockApp);

        mockApp.networkApi = networkApi;
        mockApp.crypto = crypto;
        mockApp.binary = binary;
        mockApp.wallet = wallet;

        wallet.wallet.privatekey = "854702489d49c7fb2334005b903580c7a48fe81121ff16ee6d1a528ad32f235d";
        wallet.wallet.publickey = mockApp.crypto.toBase58("dcf6cceb74717f98c3f7239459bb36fdcd8f350eedbfccfbebf7c0b0161fcd8bcc");

        mockApp.hash = (data) => {
            return blake3.hash(data).toString('hex');
        };

        let tx = new saito.transaction();
        tx.transaction.ts = 1637034582666;
        tx.transaction.type = saito.transaction.TransactionType.ATR;
        tx.msg = {test: "test"};

        let input_slip = new saito.slip(wallet.wallet.publickey);
        input_slip.uuid = "dcf6cceb74717f98c3f7239459bb36fdcd8f350eedbfccfbebf7c0b0161fcd8b";
        input_slip.amt = "123";
        input_slip.sid = 10;
        input_slip.type = saito.slip.SlipType.ATR;

        let output_slip = new saito.slip(wallet.wallet.publickey);
        output_slip.uuid = "dcf6cceb74717f98c3f7239459bb36fdcd8f350eedbfccfbebf7c0b0161fcd8b";
        output_slip.amt = "345";
        output_slip.sid = 23;
        output_slip.type = saito.slip.SlipType.Normal;

        tx.transaction.from.push(input_slip);
        tx.transaction.to.push(output_slip);

        let buffer = tx.serializeForSignature(mockApp);

        expect(buffer).toEqual(Uint8Array.from([
            0, 0, 1, 125, 38, 221, 98, 138, 220, 246, 204, 235, 116, 113, 127, 152, 195, 247,
            35, 148, 89, 187, 54, 253, 205, 143, 53, 14, 237, 191, 204, 251, 235, 247, 192,
            176, 22, 31, 205, 139, 204, 220, 246, 204, 235, 116, 113, 127, 152, 195, 247, 35,
            148, 89, 187, 54, 253, 205, 143, 53, 14, 237, 191, 204, 251, 235, 247, 192, 176,
            22, 31, 205, 139, 0, 0, 0, 0, 0, 0, 0, 123, 10, 0, 0, 0, 1, 220, 246, 204, 235,
            116, 113, 127, 152, 195, 247, 35, 148, 89, 187, 54, 253, 205, 143, 53, 14, 237,
            191, 204, 251, 235, 247, 192, 176, 22, 31, 205, 139, 204, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 1, 89, 23, 0, 0, 0, 0, 0, 0, 0, 3, 123, 34, 116, 101, 115, 116, 34, 58, 34,
            116, 101, 115, 116, 34, 125
        ]));
    });
     ***/
});
test("sign", function () {
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
    wallet.wallet.publickey = mockApp.crypto.toBase58("dcf6cceb74717f98c3f7239459bb36fdcd8f350eedbfccfbebf7c0b0161fcd8bcc");
    mockApp.hash = function (data) {
        return blake3.hash(data).toString('hex');
    };
    var tx = new transaction_1.default();
    tx.transaction.ts = 1637034582666;
    tx.transaction.type = transaction_1.TransactionType.ATR;
    tx.msg = { test: "test" };
    var input_slip = new slip_1.default(wallet.wallet.publickey);
    input_slip.uuid = "dcf6cceb74717f98c3f7239459bb36fdcd8f350eedbfccfbebf7c0b0161fcd8b";
    input_slip.amt = BigInt(123);
    input_slip.sid = 10;
    input_slip.type = slip_1.SlipType.ATR;
    var output_slip = new slip_1.default(wallet.wallet.publickey);
    output_slip.uuid = "dcf6cceb74717f98c3f7239459bb36fdcd8f350eedbfccfbebf7c0b0161fcd8b";
    output_slip.amt = BigInt(345);
    output_slip.sid = 23;
    output_slip.type = slip_1.SlipType.Normal;
    tx.transaction.from.push(input_slip);
    tx.transaction.to.push(output_slip);
    tx.sign(mockApp);
    expect(tx.transaction.sig)
        .toEqual("78387536e0f909b897f3ef3af5203401986b45ccdbd9252bd5acf93fe332342150d253f6efd5b0a7b343c877bfdc802a5542a08cd24e28b13c6321e7cf8face0");
});
//# sourceMappingURL=transaction.spec.js.map