// import { Saito } from "../../apps/core";
//
// import NetworkAPI from "./networkapi";
// import Binary from "./binary";
// import Wallet from "./wallet";
// import Crypto from "./crypto";
// import hashLoader from "../../apps/core/hash-loader";
//
// test("signBuffer", async () => {
//   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//   // @ts-ignore
//   const mockApp: Saito = {};
//   const networkApi = new NetworkAPI(mockApp);
//   const crypto = new Crypto(mockApp);
//   const binary = new Binary(mockApp);
//   const wallet = new Wallet(mockApp);
//   mockApp.networkApi = networkApi;
//   mockApp.crypto = crypto;
//   mockApp.binary = binary;
//   mockApp.wallet = wallet;
//   wallet.wallet.privatekey = "4a16ffa08e5fc440772ee962c1d730041f12c7008a6e5c704d13dfd3d1905e0d";
//   wallet.wallet.publickey = "28Mh8nEhxymH9bFMhSKU51pnSQAnqURuPYkXTUqY2ueDM";
//
//   await hashLoader(mockApp);
//
//   const testBuffer = Buffer.from("5a16ffa08e5fc440772ee962c1d730041f12c7008a6e5c704d13dfd3d1906e0d", "hex");
//
//   const hex = crypto.hash(testBuffer);
//   expect(hex).toEqual("f8b1f22222bdbd2e0bce06707a51f5fffa0753b11483c330e3bfddaf5bacabd6");
//   const result = crypto.signBuffer(testBuffer, wallet.wallet.privatekey);
//
//   const signedBuffer = Buffer.concat([testBuffer, Buffer.from(result, "hex")]);
//
//   expect(result).toEqual(
//     "11c0e19856726c42c8ac3ec8e469057f5f8a882f7206377525db00899835b03f6ec3010d19534a5703dd9b1004b4f0e31d19582cdd5aec794541d0d0f339db7c"
//   );
//
//   const verificationResult = crypto.verifyHash(
//     testBuffer,
//     result,
//     wallet.wallet.publickey
//   );
//   expect(verificationResult).toBeTruthy();
// });
