import {Saito} from "../../apps/core";
import Wallet from "./wallet";
import Binary from "./binary";
import Crypto from './crypto'
import NetworkAPI from "./networkapi";

const blake3 = require("blake3");

test("signBuffer", () => {
    // @ts-ignore
    const mockApp: Saito = {};
    const networkApi = new NetworkAPI(mockApp);
    const crypto = new Crypto(mockApp);
    const binary = new Binary(mockApp);
    const wallet = new Wallet(mockApp);
    mockApp.networkApi = networkApi;
    mockApp.crypto = crypto;
    mockApp.binary = binary;
    mockApp.wallet = wallet;
    wallet.wallet.privatekey = "4a16ffa08e5fc440772ee962c1d730041f12c7008a6e5c704d13dfd3d1905e0d";
    wallet.wallet.publickey = "28Mh8nEhxymH9bFMhSKU51pnSQAnqURuPYkXTUqY2ueDM";

    mockApp.hash = (data) => {
        return blake3.hash(data).toString('hex');
    };

    const testBuffer = Buffer.from("testing 123", 'utf-8');
    const result = crypto.signBuffer(testBuffer,
        Buffer.from(wallet.wallet.privatekey, "hex")
    );

    const signedBuffer = Buffer.concat([testBuffer, Buffer.from(result, 'hex')]);

    expect(result)
        .toEqual(
            "2e4a69e9d538ee32bf44d486b7130a8971c051946184ae27a4e5bbbbe9f85bf16370595e252204d5857659959046f3b374821f08b8f35d824cd7b2010f4987ef");

    const verificationResult = crypto.verifyHash(crypto.hash(testBuffer.toString()),
        result,
        wallet.wallet.publickey
    );
    expect(verificationResult).toBeTruthy();
});

