import { Saito } from "../../apps/core";

import * as blake3 from "blake3";
import NetworkAPI from "./networkapi";
import Binary from "./binary";
import Wallet from "./wallet";
import Crypto from "./crypto";

test("signBuffer", () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
    return blake3.hash(data).toString("hex");
  };

  const testBuffer = Buffer.from("testing 123", "utf-8");
  const result = crypto.signBuffer(testBuffer, wallet.wallet.privatekey);

  const signedBuffer = Buffer.concat([testBuffer, Buffer.from(result, "hex")]);

  expect(result).toEqual(
    "0125bcc960bcd9d31129a9ec93d31f40a65ad853b3799ccea5a238e6e2ccc67715575eb886fd642548951102b3137f3aadd57b742f0c08a1ab007c7c8042e989"
  );

  const verificationResult = crypto.verifyHash(
    crypto.hash(testBuffer.toString("hex")),
    result,
    wallet.wallet.publickey
  );
  expect(verificationResult).toBeTruthy();
});
