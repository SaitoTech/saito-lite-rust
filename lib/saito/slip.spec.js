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
    wallet.wallet.publickey = "02af1a4714cfc7ae33d3f6e860c23191ddea07bcb1bfa6c85bc124151ad8d4ce74";

    mockApp.hash = (data) => {
        return blake3.hash(data).toString('hex');
    };

    let slip = new saito.slip(wallet.wallet.privatekey);
    slip.add = "02af1a4714cfc7ae33d3f6e860c23191ddea07bcb1bfa6c85bc124151ad8d4ce74";
    slip.amt = "1234";
    slip.sid = 2;
    slip.type = 3;

    let buffer = slip.serialize(mockApp,"123e4567e89b12d3a456426614174000");

    let slip2 = new saito.slip(wallet.wallet.privatekey);
    slip2.deserialize(mockApp, buffer);

    expect(slip2.add).toEqual(slip.add);
    expect(slip2.amt).toEqual(slip.amt);
    expect(slip2.sid).toEqual(slip.sid);
    expect(slip2.type).toEqual(slip.type);
});
