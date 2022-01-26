import { Saito } from "../../apps/core";
import NetworkAPI from "./networkapi";
import Crypto from "./crypto";
import Binary from "./binary";
import Wallet from "./wallet";
import * as blake3 from "blake3";
import Transaction, { TransactionType } from "./transaction";
import Slip, { SlipType } from "./slip";

test("tx serialize deserialze", () => {
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
  wallet.wallet.privatekey = "854702489d49c7fb2334005b903580c7a48fe81121ff16ee6d1a528ad32f235d";
  wallet.wallet.publickey = "02af1a4714cfc7ae33d3f6e860c23191ddea07bcb1bfa6c85bc124151ad8d4ce74";

  mockApp.hash = (data) => {
    return blake3.hash(data).toString("hex");
  };

  const tx = new Transaction();
  tx.transaction.ts = 1637034582666;
  tx.transaction.type = TransactionType.ATR;
  tx.transaction.sig =
    "c9a6c2d0bf884be6933878577171a3c8094c2bf6e0bc1b4ec3535a4a55224d186d4d891e254736cae6c0d2002c8dfc0ddfc7fcdbe4bc583f96fa5b273b9d63f4";

  const buffer = tx.serialize(mockApp);

  const tx2 = new Transaction();
  tx2.deserialize(mockApp, buffer, 0);

  expect(tx2.transaction.ts).toEqual(tx.transaction.ts);
  expect(tx2.transaction.type).toEqual(tx.transaction.type);
  expect(tx2.transaction.sig).toEqual(tx.transaction.sig);
});

describe("serializeForSignature", () => {
  /***
     test("empty tx", () => {
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

        let tx = new saito.transaction();
        let buffer = tx.serializeForSignature(mockApp);

        expect(buffer).toEqual(Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 123, 125]));
    });

     test("with data", () => {
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
        wallet.wallet.publickey = mockApp.crypto.toBase58("dcf6cceb74717f98c3f7239459bb36fdcd8f350eedbfccfbebf7c0b0161fcd8bcc");

        mockApp.hash = (data) => {
            return blake3.hash(data).toString('hex');
        };

        let tx = new saito.transaction();
        tx.transaction.ts = 1637034582666;
        tx.transaction.type = saito.transaction.TransactionType.ATR;
        tx.msg = {test: "test"};

        let input_slip = new saito.slip(wallet.wallet.publickey);
        input_slip.uuid = "dcf6cceb74717f98c3f7239459bb36fdcd8f350eedbfccfbebf7c0b0161fcd8b";
        input_slip.amt = "123";
        input_slip.sid = 10;
        input_slip.type = saito.slip.SlipType.ATR;

        let output_slip = new saito.slip(wallet.wallet.publickey);
        output_slip.uuid = "dcf6cceb74717f98c3f7239459bb36fdcd8f350eedbfccfbebf7c0b0161fcd8b";
        output_slip.amt = "345";
        output_slip.sid = 23;
        output_slip.type = saito.slip.SlipType.Normal;

        tx.transaction.from.push(input_slip);
        tx.transaction.to.push(output_slip);

        let buffer = tx.serializeForSignature(mockApp);

        expect(buffer).toEqual(Uint8Array.from([
            0, 0, 1, 125, 38, 221, 98, 138, 220, 246, 204, 235, 116, 113, 127, 152, 195, 247,
            35, 148, 89, 187, 54, 253, 205, 143, 53, 14, 237, 191, 204, 251, 235, 247, 192,
            176, 22, 31, 205, 139, 204, 220, 246, 204, 235, 116, 113, 127, 152, 195, 247, 35,
            148, 89, 187, 54, 253, 205, 143, 53, 14, 237, 191, 204, 251, 235, 247, 192, 176,
            22, 31, 205, 139, 0, 0, 0, 0, 0, 0, 0, 123, 10, 0, 0, 0, 1, 220, 246, 204, 235,
            116, 113, 127, 152, 195, 247, 35, 148, 89, 187, 54, 253, 205, 143, 53, 14, 237,
            191, 204, 251, 235, 247, 192, 176, 22, 31, 205, 139, 204, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 1, 89, 23, 0, 0, 0, 0, 0, 0, 0, 3, 123, 34, 116, 101, 115, 116, 34, 58, 34,
            116, 101, 115, 116, 34, 125
        ]));
    });
     ***/
});

test("sign", () => {
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

  const tx = new Transaction();
  tx.transaction.ts = 1637034582666;
  tx.transaction.type = TransactionType.ATR;
  tx.msg = { test: "test" };

  const input_slip = new Slip(wallet.wallet.publickey);
  input_slip.uuid = "dcf6cceb74717f98c3f7239459bb36fdcd8f350eedbfccfbebf7c0b0161fcd8b";
  input_slip.amt = BigInt(123);
  input_slip.sid = 10;
  input_slip.type = SlipType.ATR;

  const output_slip = new Slip(wallet.wallet.publickey);
  output_slip.uuid = "dcf6cceb74717f98c3f7239459bb36fdcd8f350eedbfccfbebf7c0b0161fcd8b";
  output_slip.amt = BigInt(345);
  output_slip.sid = 23;
  output_slip.type = SlipType.Normal;

  tx.transaction.from.push(input_slip);
  tx.transaction.to.push(output_slip);

  tx.sign(mockApp);
  expect(tx.transaction.sig).toEqual(
    "190738f6085516ca669935bb6baf33ce5682acdb0f3b21f930cb0ac8a02198632f1947e6b557f99e704040b4e104aeb4ebf38d9fc92ec02a0ee82fae67a6e728"
  );
});
