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
import PeerServiceList from "saito-js/lib/peer_service_list";
import { LogLevel } from "saito-js/saito";

// import Config from "saito-js/lib/config";

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
      newtx.deserialize(buffer);
      newtx.unpackData();
    } catch (error) {
      console.error(error);
      newtx.msg = buffer;
    }
    await this.app.modules.handlePeerTransaction(newtx, peer, mycallback);
  }

  sendInterfaceEvent(event: string, peerIndex: bigint) {
    console.log("web shared methods . emit : " + event, this.app.connection);
    this.app.connection.emit(event, peerIndex);
  }

  sendBlockSuccess(hash: string, blockId: bigint) {
    this.app.connection.emit("add-block-success", { hash, blockId });
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
    let list = new PeerServiceList();
    let result = this.app.network.getServices();
    result.forEach((s) => list.push(s));
    return list;
  }
}

async function init() {
  console.log("lite init...");
  const saito = new Saito({ mod_paths: mods_config.lite });
  await saito.storage.initialize();

  saito.options.browser_mode = true;
  saito.options.spv_mode = true;

  // saito.storage.convertOptionsBigInt(saito.options);

  console.log("saito options : ", saito.options);
  try {
    await initSaito(
      saito.options,
      new WebMethods(saito),
      new Factory(),
      saito.options.wallet?.privateKey || "",
      LogLevel.Trace
    );
  } catch (e) {
    console.error(e);
  }
  saito.wallet = (await S.getInstance().getWallet()) as Wallet;
  saito.wallet.app = saito;
  saito.blockchain = (await S.getInstance().getBlockchain()) as Blockchain;
  saito.blockchain.app = saito;
  saito.BROWSER = 1;
  saito.SPVMODE = 1;
  try {
    await saito.init();
  } catch (e) {
    console.error(e);
  }

  S.getInstance().start();
}

// init();
window.onload = async function () {
  await init();
};
