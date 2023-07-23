// import { Saito } from "../../apps/core";
//
// import NetworkAPI from "./networkapi";
// import Crypto from "./crypto";
// import Binary from "./binary";
// import Wallet from "./wallet";
// import Slip from "./slip";
// import { SLIP_SIZE } from "./transaction";
// import hashLoader from "../../apps/core/hash-loader";
//
// test("slip serialize deserialze", async () => {
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
//
//   wallet.wallet.privatekey = "854702489d49c7fb2334005b903580c7a48fe81121ff16ee6d1a528ad32f235d";
//   wallet.wallet.publickey = mockApp.crypto.toBase58(
//     "02af1a4714cfc7ae33d3f6e860c23191ddea07bcb1bfa6c85bc124151ad8d4ce74"
//   );
//
//   await hashLoader(mockApp);
//
//   const slip = new Slip(wallet.wallet.privatekey);
//   slip.publicKey = mockApp.crypto.toBase58(
//     "02af1a4714cfc7ae33d3f6e860c23191ddea07bcb1bfa6c85bc124151ad8d4ce74"
//   );
//   slip.amt = BigInt(1234);
//   slip.sid = 2;
//   slip.type = 3;
//
//   const buffer = slip.serialize(mockApp);
//
//   const slip2 = new Slip(wallet.wallet.privatekey);
//   slip2.deserialize(mockApp, buffer);
//
//   console.log("SLIP 2");
//   console.log(slip2.publicKey ;
//   console.log(slip2.amt);
//   console.log(slip2.sid);
//   console.log(slip2.type);
//
//   expect(slip2.publicKey .toEqual(slip.publicKey ;
//   expect(slip2.amt).toEqual(slip.amt);
//   expect(slip2.sid).toEqual(slip.sid);
//   expect(slip2.type).toEqual(slip.type);
// });
//
// describe("serializeForSignature", () => {
//   test("empty slip", async () => {
//     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//     // @ts-ignore
//     const mockApp: Saito = {};
//     const networkApi = new NetworkAPI(mockApp);
//     const crypto = new Crypto(mockApp);
//     const binary = new Binary(mockApp);
//     const wallet = new Wallet(mockApp);
//     mockApp.networkApi = networkApi;
//     mockApp.crypto = crypto;
//     mockApp.binary = binary;
//     mockApp.wallet = wallet;
//     wallet.wallet.privatekey = "854702489d49c7fb2334005b903580c7a48fe81121ff16ee6d1a528ad32f235d";
//     wallet.wallet.publickey = "02af1a4714cfc7ae33d3f6e860c23191ddea07bcb1bfa6c85bc124151ad8d4ce74";
//
//     await hashLoader(mockApp);
//
//     const slip = new Slip();
//
//     const buffer = slip.serializeInputForSignature(mockApp);
//
//     expect(buffer).toEqual(Uint8Array.from(Buffer.alloc(51)));
//   });
// });
