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

    let result = crypto.signBuffer(Buffer.from("dcf6cceb74717f98c3f7239459bb36fdcd8f350eedbfccfbebf7c0b0161fcd8b", 'hex'),
                                   Buffer.from("854702489d49c7fb2334005b903580c7a48fe81121ff16ee6d1a528ad32f235d", "hex")
    );

    expect(Buffer.from(result).toString('hex').toUpperCase())
        .toEqual(
            "DCF6CCEB74717F98C3F7239459BB36FDCD8F350EEDBFCCFBEBF7C0B0161FCD8BE2E37DDC79031B4ECE045369864A2709BA43021005AF68241CA4901579B8FF861BD39A830D1B778C9CB506FDDFDCB975C26FB85B9DD5B69DBF8458D28A51E30E");
});

