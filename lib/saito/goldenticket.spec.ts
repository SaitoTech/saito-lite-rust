import { Saito } from "../../apps/core";

import saito from "./saito";
import hashLoader from "../../apps/core/hash-loader";

import GoldenTicket from "./goldenticket";

test("golden ticket serialization", async () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const mockApp: Saito = {};
  const networkApi = new saito.networkApi(mockApp);
  const crypto = new saito.crypto(mockApp);
  const binary = new saito.binary(mockApp);
  const wallet = new saito.wallet(mockApp);
  mockApp.networkApi = networkApi;
  mockApp.crypto = crypto;
  mockApp.binary = binary;
  mockApp.wallet = wallet;
  wallet.wallet.privatekey = "4a16ffa08e5fc440772ee962c1d730041f12c7008a6e5c704d13dfd3d1905e0d";
  wallet.wallet.publickey = "28Mh8nEhxymH9bFMhSKU51pnSQAnqURuPYkXTUqY2ueDM";

  await hashLoader(mockApp);

  const target_hash = "844702489d49c7fb2334005b903580c7a48fe81121ff16ee6d1a528ad32f235e";
  const random_hash = "03bf1a4714cfc7ae33d3f6e860c23191ddea07bcb1bfa6c85bc124151ad8d4ce";
  const golden_ticket = new saito.goldenticket(mockApp);
  const buffer = golden_ticket.serialize(target_hash, random_hash);
  console.log("gt = " + buffer.toString("hex"));
  const result = golden_ticket.deserialize(buffer);
  expect(result.target_hash).toEqual(target_hash);
  expect(result.random_hash).toEqual(random_hash);
  expect(result.creator).toEqual(wallet.wallet.publickey);
});

test("difficulty test", () => {
  expect(GoldenTicket.generateHash(0).toUpperCase()).toEqual(
    "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
  );
  expect(GoldenTicket.generateHash(1).toUpperCase()).toEqual(
    "7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
  );
  expect(GoldenTicket.generateHash(2).toUpperCase()).toEqual(
    "3FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
  );
  expect(GoldenTicket.generateHash(3).toUpperCase()).toEqual(
    "1FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
  );
  expect(GoldenTicket.generateHash(4).toUpperCase()).toEqual(
    "0FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
  );
  expect(GoldenTicket.generateHash(16).toUpperCase()).toEqual(
    "0000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
  );
  expect(GoldenTicket.generateHash(17).toUpperCase()).toEqual(
    "00007FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
  );

  expect(
    GoldenTicket.verifyHash(
      "4523d0eb05233434b42de74a99049decb6c4347da2e7cde9fb49330e905da1e2",
      "7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
    )
  ).toBeTruthy();
  expect(
    GoldenTicket.verifyHash(
      "4523d0eb05233434b42de74a99049decb6c4347da2e7cde9fb49330e905da1e2",
      "3FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
    )
  ).toBeFalsy();
});
