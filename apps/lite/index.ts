import { Saito } from "../core";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import mods_config from "../../config/modules.config";
import { initialize as initSaito } from "saito-js/index.web";
import S from "saito-js/saito";
import WebSharedMethods from "saito-js/lib/custom/shared_methods.web";
import Transaction from "../../lib/saito/transaction";
import Factory from "../../lib/saito/factory";
import Wallet from "../../lib/saito/wallet";
import Blockchain from "../../lib/saito/blockchain";

class WebMethods extends WebSharedMethods {
  app: Saito;

  constructor(app: Saito) {
    super();
    this.app = app;
  }

  async processApiCall(buffer: Uint8Array, msgIndex: number, peerIndex: bigint): Promise<void> {
    console.log(
      "WebMethods.processApiCall : peer= " + peerIndex + " with size : " + buffer.byteLength
    );
    const mycallback = async (response_object) => {
      await S.getInstance().sendApiSuccess(
        msgIndex,
        Buffer.from(JSON.stringify(response_object), "utf-8"),
        peerIndex
      );
    };
    let peer = await this.app.network.getPeer(peerIndex);
    let newtx = new Transaction();
    try {
      // console.log("buffer length : " + buffer.byteLength, buffer);
      newtx = Transaction.deserialize(buffer, new Factory()) as Transaction;
      newtx.unpackData();
    } catch (error) {
      console.error(error);
      newtx.msg = buffer;
    }
    await this.app.modules.handlePeerTransaction(newtx, peer, mycallback);
  }

  sendInterfaceEvent(event: string, peerIndex: bigint) {
    this.app.connection.emit(event, peerIndex);
  }

  async saveWallet() {
    this.app.options.wallet.publicKey = await this.app.wallet.getPublicKey();
    this.app.options.wallet.privateKey = await this.app.wallet.getPrivateKey();
    this.app.options.wallet.balance = await this.app.wallet.getBalance();
  }

  async loadWallet() {
    throw new Error("Method not implemented.");
  }

  async saveBlockchain() {
    throw new Error("Method not implemented.");
  }

  async loadBlockchain() {
    throw new Error("Method not implemented.");
  }

  getMyServices() {
    return this.app.network.getServices();
  }
}

async function init() {
  console.log("lite init...");
  const saito = new Saito({ mod_paths: mods_config.lite });
  await saito.storage.initialize();

  await initSaito(
    saito.options,
    new WebMethods(saito),
    new Factory(),
    saito.options.wallet?.privateKey || ""
  );
  saito.wallet = (await S.getInstance().getWallet()) as Wallet;
  saito.wallet.app = saito;
  saito.blockchain = (await S.getInstance().getBlockchain()) as Blockchain;
  saito.BROWSER = 1;
  saito.SPVMODE = 1;
  await saito.init();
}

// init();
window.onload = async function () {
  await init();
};
