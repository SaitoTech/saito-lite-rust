import { Saito } from "../core";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import mods_config from "../../config/modules.config";
import { initialize as initSaito } from "saito-js/index.web";
import S from "saito-js/saito";
import WebSharedMethods from "saito-js/lib/custom/shared_methods.web";
import Transaction from "../../lib/saito/transaction";
import Factory from "../../lib/saito/factory";

class WebMethods extends WebSharedMethods {
  app: Saito;

  constructor(app: Saito) {
    super();
    this.app = app;
  }

  async processApiCall(buffer: Uint8Array, msgIndex: number, peerIndex: bigint): Promise<void> {
    console.log("WebMethods.processApiCall : peer= " + peerIndex);
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
}

async function init() {
  console.log("lite init...");
  const saito = new Saito({ mod_paths: mods_config.lite });
  await saito.storage.initialize();

  await initSaito(
    saito.options,
    // {
    //   server: {
    //     host: "",
    //     port: 0,
    //     protocol: "",
    //     endpoint: {
    //       host: "",
    //       port: 0,
    //       protocol: "",
    //     },
    //     verification_threads: 0,
    //     channel_size: 0,
    //     stat_timer_in_ms: 0,
    //     thread_sleep_time_in_ms: 0,
    //     block_fetch_batch_size: 0,
    //   },
    //   peers: [],
    // },
    new WebMethods(saito),
    new Factory()
  );

  saito.BROWSER = 1;
  saito.SPVMODE = 1;
  await saito.init();
}

// init();
window.onload = function () {
  init();
};
