// import { Saito } from "../../apps/core";
// import NetworkAPI from "./networkapi";
// import Crypto from "./crypto";
// import Binary from "./binary";
// import Wallet from "./wallet";
// import Transaction, { TransactionType } from "./transaction";
// import Slip, { SlipType } from "./slip";
// import hashLoader from "../../apps/core/hash-loader";
//
// test("tx serialize deserialze", async () => {
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
//   wallet.wallet.privatekey = "854702489d49c7fb2334005b903580c7a48fe81121ff16ee6d1a528ad32f235d";
//   wallet.wallet.publickey = "02af1a4714cfc7ae33d3f6e860c23191ddea07bcb1bfa6c85bc124151ad8d4ce74";
//
//   await hashLoader(mockApp);
//
//   const tx = new Transaction();
//   tx.ts = 1637034582666;
//   tx.type = TransactionType.ATR;
//   tx.signature =
//     "c9a6c2d0bf884be6933878577171a3c8094c2bf6e0bc1b4ec3535a4a55224d186d4d891e254736cae6c0d2002c8dfc0ddfc7fcdbe4bc583f96fa5b273b9d63f4";
//
//   const buffer = tx.serialize(mockApp);
//
//   const tx2 = new Transaction();
//   tx2.deserialize(mockApp, buffer, 0);
//
//   expect(tx2.ts).toEqual(tx.ts);
//   expect(tx2.type).toEqual(tx.type);
//   expect(tx2.signature).toEqual(tx.signature);
// });
//
// describe("serializeForSignature", () => {
//   /***
//      test("empty tx", () => {
//         let mockApp = {};
//         let networkApi = new saito.networkApi(mockApp);
//         let crypto = new saito.crypto(mockApp);
//         let binary = new saito.binary(mockApp);
//         let wallet = new saito.wallet(mockApp);
//         mockApp.networkApi = networkApi;
//         mockApp.crypto = crypto;
//         mockApp.binary = binary;
//         mockApp.wallet = wallet;
//         wallet.wallet.privatekey = "854702489d49c7fb2334005b903580c7a48fe81121ff16ee6d1a528ad32f235d";
//         wallet.wallet.publickey = "02af1a4714cfc7ae33d3f6e860c23191ddea07bcb1bfa6c85bc124151ad8d4ce74";
//
//         mockApp.hash = (data) => {
//             return blake3.hash(data).toString('hex');
//         };
//
//         let tx = new saito.transaction();
//         let buffer = tx.serializeForSignature(mockApp);
//
//         expect(buffer).toEqual(Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 123, 125]));
//     });
//
//      test("with data", () => {
//         let mockApp = {};
//         let networkApi = new saito.networkApi(mockApp);
//         let crypto = new saito.crypto(mockApp);
//         let binary = new saito.binary(mockApp);
//         let wallet = new saito.wallet(mockApp);
//
//         mockApp.networkApi = networkApi;
//         mockApp.crypto = crypto;
//         mockApp.binary = binary;
//         mockApp.wallet = wallet;
//
//         wallet.wallet.privatekey = "854702489d49c7fb2334005b903580c7a48fe81121ff16ee6d1a528ad32f235d";
//         wallet.wallet.publickey = mockApp.crypto.toBase58("dcf6cceb74717f98c3f7239459bb36fdcd8f350eedbfccfbebf7c0b0161fcd8bcc");
//
//         mockApp.hash = (data) => {
//             return blake3.hash(data).toString('hex');
//         };
//
//         let tx = new saito.transaction();
//         tx.ts = 1637034582666;
//         tx.type = saito.TransactionType.ATR;
//         tx.msg = {test: "test"};
//
//         let input_slip = new saito.slip(wallet.wallet.publickey);
//         input_slip.uuid = "dcf6cceb74717f98c3f7239459bb36fdcd8f350eedbfccfbebf7c0b0161fcd8b";
//         input_slip.amt = "123";
//         input_slip.sid = 10;
//         input_slip.type = saito.slip.SlipType.ATR;
//
//         let output_slip = new saito.slip(wallet.wallet.publickey);
//         output_slip.uuid = "dcf6cceb74717f98c3f7239459bb36fdcd8f350eedbfccfbebf7c0b0161fcd8b";
//         output_slip.amt = "345";
//         output_slip.sid = 23;
//         output_slip.type = saito.slip.SlipType.Normal;
//
//         tx.from.push(input_slip);
//         tx.to.push(output_slip);
//
//         let buffer = tx.serializeForSignature(mockApp);
//
//         expect(buffer).toEqual(Uint8Array.from([
//             0, 0, 1, 125, 38, 221, 98, 138, 220, 246, 204, 235, 116, 113, 127, 152, 195, 247,
//             35, 148, 89, 187, 54, 253, 205, 143, 53, 14, 237, 191, 204, 251, 235, 247, 192,
//             176, 22, 31, 205, 139, 204, 220, 246, 204, 235, 116, 113, 127, 152, 195, 247, 35,
//             148, 89, 187, 54, 253, 205, 143, 53, 14, 237, 191, 204, 251, 235, 247, 192, 176,
//             22, 31, 205, 139, 0, 0, 0, 0, 0, 0, 0, 123, 10, 0, 0, 0, 1, 220, 246, 204, 235,
//             116, 113, 127, 152, 195, 247, 35, 148, 89, 187, 54, 253, 205, 143, 53, 14, 237,
//             191, 204, 251, 235, 247, 192, 176, 22, 31, 205, 139, 204, 0, 0, 0, 0, 0, 0, 0, 0,
//             0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
//             0, 0, 1, 89, 23, 0, 0, 0, 0, 0, 0, 0, 3, 123, 34, 116, 101, 115, 116, 34, 58, 34,
//             116, 101, 115, 116, 34, 125
//         ]));
//     });
//      ***/
// });
//
// test("sign", async () => {
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
//   const tx = new Transaction();
//   tx.ts = 1637034582666;
//   tx.type = TransactionType.ATR;
//   tx.m = Buffer.from("abc", "hex");
//
//   const input_slip = new Slip(wallet.wallet.publickey);
//   //input_slip.uuid = "dcf6cceb74717f98c3f7239459bb36fdcd8f350eedbfccfbebf7c0b0161fcd8b";
//   input_slip.amt = BigInt(123);
//   input_slip.sid = 10;
//   input_slip.type = SlipType.ATR;
//
//   const output_slip = new Slip(wallet.wallet.publickey);
//   //output_slip.uuid = "dcf6cceb74717f98c3f7239459bb36fdcd8f350eedbfccfbebf7c0b0161fcd8b";
//   output_slip.amt = BigInt(345);
//   output_slip.sid = 23;
//   output_slip.type = SlipType.Normal;
//
//   tx.from.push(input_slip);
//   tx.to.push(output_slip);
//
//   tx.sign(mockApp);
//
//   let tx1_buffer = tx.serialize(mockApp);
//
//   console.log(Buffer.from(tx1_buffer).toString("hex"));
//
//   //TODO : FIX THIS
//   expect(tx.signature).toEqual(
//     "56f604952f5b325b445bd31e6fd62746532e5a568393315e661d0f944239cad845e402ffe8ff0a413d6835bae88efd7a8bb6313d72fa91c7af4cc18515578d7c"
//   );
//
//   expect(tx.validateSignature(mockApp)).toBeTruthy();
//
//   // let buffer = Buffer.from("000000010000000100000014000000009e49d33a16f8a7a7dd9507511b3ab102ca6fa509d28ee9c10d89f13ce1233e4f7ef2681b2bab8a9a3b8eb2d7786c5c1d4373d8803132af1e3b4aa026ac312b920000017d26dd628a000000010303cb14a56ddc769932baba62c22773aaf6d26d799b548c8b8f654fb92d25ce7610dcf6cceb74717f98c3f7239459bb36fdcd8f350eedbfccfbebf7c0b0161fcd8b000000000000007b0a0003cb14a56ddc769932baba62c22773aaf6d26d799b548c8b8f654fb92d25ce7610dcf6cceb74717f98c3f7239459bb36fdcd8f350eedbfccfbebf7c0b0161fcd8b0000000000000159000065794a305a584e30496a6f696447567a64434a39","hex");
//   let tx2 = new Transaction();
//   tx2.deserialize(mockApp, tx1_buffer, 0);
//
//   expect(tx).toEqual(tx2);
//
//   console.log("tx = ", tx);
//   console.log("slip = ", tx.from[0]);
//
//   console.log("ser = " + tx.serializeForSignature(mockApp).toString("hex"));
//   let tx2_buffer = tx2.serialize(mockApp);
//   tx2.generateMetadata(mockApp, BigInt(1), BigInt(2), "");
//   expect(tx1_buffer).toEqual(tx2_buffer);
//   expect(tx.serializeForSignature(mockApp)).toEqual(tx2.serializeForSignature(mockApp));
//   expect(tx2.validateSignature(mockApp)).toBeTruthy();
// });
