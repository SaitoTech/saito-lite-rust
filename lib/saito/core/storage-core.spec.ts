import { Saito } from "../../../apps/core";
import StorageCore from "./storage-core";

import fs from "fs-extra";

import * as blake3 from "blake3";
import Transaction, { TransactionType } from "../transaction";
import NetworkAPI from "../networkapi";
import Crypto from "../crypto";
import Binary from "../binary";
import Wallet from "../wallet";
import Block from "../block";

test("write_read_empty_block_to_file", async () => {
  fs.emptyDirSync("../data/blocks");

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const mockApp: Saito = {};
  const networkApi = new NetworkAPI(mockApp);
  const crypto = new Crypto(mockApp);
  const binary = new Binary(mockApp);
  mockApp.networkApi = networkApi;
  mockApp.crypto = crypto;
  mockApp.binary = binary;
  mockApp.hash = (data) => {
    return blake3.hash(data).toString("hex");
  };

  const block = new Block(mockApp);
  block.generateMetadata();

  const storage = new StorageCore(mockApp);
  const result = await storage.saveBlock(block);
  expect(result).toBeTruthy();

  const block2 = await storage.loadBlockFromDisk(result);
  expect(block2).toBeTruthy();
  expect(block2.block.id).toEqual(block.block.id);
  expect(block2.hash).toEqual(block.hash);
  expect(block2.prehash).toEqual(block.prehash);
});

test("write_read_block_with_data_to_file", async () => {
  fs.emptyDirSync("../data/blocks");

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

  const block = new Block(mockApp);
  block.block.id = 10;
  block.block.timestamp = 1637034582666;
  block.block.previous_block_hash =
    "bcf6cceb74717f98c3f7239459bb36fdcd8f350eedbfccfbebf7c0b0161fcd8b";
  block.block.merkle = "ccf6cceb74717f98c3f7239459bb36fdcd8f350eedbfccfbebf7c0b0161fcd8b";
  block.block.creator = crypto.toBase58(
    "dcf6cceb74717f98c3f7239459bb36fdcd8f350eedbfccfbebf7c0b0161fcd8bcc"
  );
  block.block.burnfee = BigInt(50000000);
  block.block.difficulty = 0;
  block.block.treasury = BigInt(0);
  block.block.staking_treasury = BigInt(0);
  block.block.signature =
    "c9a6c2d0bf884be6933878577171a3c8094c2bf6e0bc1b4ec3535a4a55224d186d4d891e254736cae6c0d2002c8dfc0ddfc7fcdbe4bc583f96fa5b273b9d63f4";

  const tx = new Transaction();
  tx.transaction.ts = 1637034582666;
  tx.transaction.type = TransactionType.ATR;
  tx.transaction.sig =
    "c9a6c2d0bf884be6933878577171a3c8094c2bf6e0bc1b4ec3535a4a55224d186d4d891e254736cae6c0d2002c8dfc0ddfc7fcdbe4bc583f96fa5b273b9d63f4";
  block.transactions.push(tx);

  block.generateMetadata();

  const storage = new StorageCore(mockApp);
  const result = await storage.saveBlock(block);
  expect(result).toBeTruthy();

  const block2 = await storage.loadBlockFromDisk(result);
  expect(block2).toBeTruthy();
  expect(block2.block.id).toEqual(block.block.id);
  expect(block2.block.timestamp).toEqual(block.block.timestamp);
  expect(block2.block.previous_block_hash).toEqual(block.block.previous_block_hash);
  expect(block2.block.merkle).toEqual(block.block.merkle);
  expect(block2.block.creator).toEqual(block.block.creator);
  expect(block2.block.burnfee).toEqual(block.block.burnfee);
  expect(block2.block.difficulty).toEqual(block.block.difficulty);
  expect(block2.block.treasury).toEqual(block.block.treasury);
  expect(block2.block.staking_treasury).toEqual(block.block.staking_treasury);
  expect(block2.block.signature).toEqual(block.block.signature);
  expect(block2.block.burnfee).toEqual(block.block.burnfee);
  expect(block2.hash).toEqual(block.hash);
  expect(block2.prehash).toEqual(block.prehash);

  expect(block2.transactions.length).toEqual(block.transactions.length);

  const tx2 = block2.transactions[0];
  expect(tx2.transaction.ts).toEqual(tx.transaction.ts);
  expect(tx2.transaction.type).toEqual(tx.transaction.type);
  expect(tx2.transaction.sig).toEqual(tx.transaction.sig);
});

test.skip("read_block_from_disk (from rust generated block)", async () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const mockApp: Saito = {};
  const networkApi = new NetworkAPI(mockApp);
  const crypto = new Crypto(mockApp);
  const binary = new Binary(mockApp);
  mockApp.networkApi = networkApi;
  mockApp.crypto = crypto;
  mockApp.binary = binary;
  mockApp.hash = (data) => {
    return blake3.hash(data).toString("hex");
  };

  const storage = new StorageCore(mockApp);

  const block = new Block(mockApp);

  const block2 = await storage.loadBlockFromDisk(
    "./data/blocks/0000017d22813455-bcf6cceb74717f98c3f7239459bb36fdcd8f350eedbfccfbebf7c0b0161fcd8b.sai"
  );
  console.log(process.cwd());
  expect(block2).toBeTruthy();
  expect(block2.block.id).toEqual(block.block.id);
  expect(block2.block.burnfee).toEqual(block2.block.burnfee);
});
