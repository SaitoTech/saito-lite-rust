import { Saito } from "../core";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import mods_config from "../../config/modules.config";
import { initialize as initSaito } from "saito-js/index.web";
import S from "saito-js/saito";
import WebSharedMethods from "saito-js/lib/custom/shared_methods.web";
import Transaction from "../../lib/saito/transaction";

class WebMethods extends WebSharedMethods {
  app: Saito;

  constructor(app: Saito) {
    super();
  }

  async processApiCall(buffer: Uint8Array, msgIndex: number, peerIndex: bigint): Promise<void> {
    const mycallback = (response_object) => {
      S.getInstance().sendApiSuccess(
        msgIndex,
        Buffer.from(JSON.stringify(response_object), "utf-8"),
        peerIndex
      );
    };
    let peer = await this.app.network.getPeer(peerIndex);
    let newtx = new Transaction();
    try {
      let data = Buffer.from(buffer).toString("utf-8");
      let msg = JSON.parse(data);
      newtx.msg = msg.data;
    } catch (error) {
      console.error(error);
      newtx.msg = buffer;
    }
    await this.app.modules.handlePeerTransaction(newtx, peer, mycallback);
  }
}

async function init() {
  const saito = new Saito({ mod_paths: mods_config.lite });
  await initSaito(
    {
      server: {
        host: "",
        port: 0,
        protocol: "",
        endpoint: {
          host: "",
          port: 0,
          protocol: "",
        },
        verification_threads: 0,
        channel_size: 0,
        stat_timer_in_ms: 0,
        thread_sleep_time_in_ms: 0,
        block_fetch_batch_size: 0,
      },
      peers: [],
    },
    new WebMethods(saito)
  );

  saito.BROWSER = 1;
  saito.SPVMODE = 1;
  await saito.init();
}

// init();
window.onload = function () {
  init();
};
