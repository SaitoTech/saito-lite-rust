import { Saito } from "../../apps/core";
import NetworkAPI from "./networkapi";

import * as blake3 from "blake3";
import Crypto from "./crypto";
import Wallet from "./wallet";
import Binary from "./binary";

test("", () => {
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
});
