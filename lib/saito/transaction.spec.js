const saito = require("./saito");
const blake3 = require("blake3");

test("tx serialize deserialze", () => {
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

    let tx = new saito.transaction(mockApp);
    tx.transaction.ts = "1637034582666";
    tx.transaction.type = saito.transaction.TransactionType.ATR;
    tx.transaction.sig = "c9a6c2d0bf884be6933878577171a3c8094c2bf6e0bc1b4ec3535a4a55224d186d4d891e254736cae6c0d2002c8dfc0ddfc7fcdbe4bc583f96fa5b273b9d63f4";

    let buffer = tx.serialize(mockApp);

    let tx2 = new saito.transaction(mockApp);
    tx2.deserialize(buffer, 0);

    expect(tx2.transaction.ts).toEqual(tx.transaction.ts);
    expect(tx2.transaction.type).toEqual(tx.transaction.type);
    expect(tx2.transaction.sig).toEqual(tx.transaction.sig);
});
