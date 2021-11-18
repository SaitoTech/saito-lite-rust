const saito = require("./saito");
const blake3 = require("blake3");
test("signBuffer", () => {
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
    wallet.wallet.publickey = "dcf6cceb74717f98c3f7239459bb36fdcd8f350eedbfccfbebf7c0b0161fcd8bcc";

    mockApp.hash = (data) => {
        return blake3.hash(data).toString('hex');
    };

    let result = crypto.signBuffer("dcf6cceb74717f98c3f7239459bb36fdcd8f350eedbfccfbebf7c0b0161fcd8b","854702489d49c7fb2334005b903580c7a48fe81121ff16ee6d1a528ad32f235d");

    expect(result.toUpperCase()).toEqual("CA7625923075B10A124AD6C9F54F91447CB5812B5B804BBD2279F46CD66A2E9B36E29D01E63A97520BB129FACC4A20156D80B1720FAB0996ED74EC0292D22745");
});

