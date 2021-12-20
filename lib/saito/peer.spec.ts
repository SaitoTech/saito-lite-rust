import {Saito} from "../../apps/core";

const saito = require("./saito");
const blake3 = require("blake3");

test("", () => {
    // @ts-ignore
    const mockApp: Saito = {};
    const networkApi = new saito.default.networkApi(mockApp);
    const crypto = new saito.default.crypto(mockApp);
    const binary = new saito.default.binary(mockApp);
    const wallet = new saito.default.wallet(mockApp);
    mockApp.networkApi = networkApi;
    mockApp.crypto = crypto;
    mockApp.binary = binary;
    mockApp.wallet = wallet;
    wallet.wallet.privatekey = "4a16ffa08e5fc440772ee962c1d730041f12c7008a6e5c704d13dfd3d1905e0d";
    wallet.wallet.publickey = "28Mh8nEhxymH9bFMhSKU51pnSQAnqURuPYkXTUqY2ueDM";

    mockApp.hash = (data) => {
        return blake3.hash(data).toString('hex');
    };

})
