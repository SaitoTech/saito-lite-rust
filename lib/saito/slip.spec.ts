const saito = require("./saito");
const blake3 = require("blake3");

test("slip serialize deserialze", () => {

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
    wallet.wallet.publickey = mockApp.crypto.toBase58("02af1a4714cfc7ae33d3f6e860c23191ddea07bcb1bfa6c85bc124151ad8d4ce74");

    mockApp.hash = (data) => {
        return blake3.hash(data).toString('hex');
    };

    let slip = new saito.slip(wallet.wallet.privatekey);
    slip.add = mockApp.crypto.toBase58("02af1a4714cfc7ae33d3f6e860c23191ddea07bcb1bfa6c85bc124151ad8d4ce74");
    slip.amt = BigInt(1234);
    slip.sid = 2;
    slip.type = 3;

    let buffer = slip.serialize(mockApp,"dcf6cceb74717f98c3f7239459bb36fdcd8f350eedbfccfbebf7c0b0161fcd8b");

    let slip2 = new saito.slip(wallet.wallet.privatekey);
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

describe("serializeForSignature", () => {
    test("empty slip", () => {
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

        let slip = new saito.slip();

        let buffer = slip.serializeInputForSignature(mockApp);

        expect(buffer).toEqual(Uint8Array.from(Buffer.alloc(78)));

    });
});
