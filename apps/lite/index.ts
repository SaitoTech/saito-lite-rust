import { Saito } from "../core";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const fs = require('fs');
const EventEmitter = require('events');

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

  lastBuildNumber = null;




  connectToPeer(peerData: any): void {
    console.log('god')
    let protocol = "ws";
    if (peerData.protocol === "https") {
      protocol = "wss";
    }
    let url = protocol + "://" + peerData.host + ":" + peerData.port + "/wsopen";


    try {
      console.log("connecting to " + url + "....");
      let socket = new WebSocket(url);
      socket.binaryType = "arraybuffer";
      let index = S.getInstance().addNewSocket(socket);

      function updateSaitoScript(buildNumber) {
        // Find the existing saito.js script tag by id
        const existingScript = document.getElementById('saito');

        if (existingScript?.parentNode) {
          // Remove the existing script tag
          existingScript.parentNode.removeChild(existingScript);

          // Create a new script tag with the updated src
          const newScript = document.createElement('script');
          newScript.id = 'saito';  // Reuse the same id
          newScript.type = 'text/javascript';
          newScript.src = `/saito/saito.js?v=${buildNumber}`;
          // Add the new script tag to the document
          document.body.appendChild(newScript);
          window.location.reload();
        } else {
          console.error('Saito script tag not found');
        }
      }

      socket.onmessage = (event: MessageEvent) => {
        console.log(event, "event senters");
        const buffer = new Uint8Array(event.data);
        const messageType = buffer[0];
        console.log('Message Type:', messageType);

        if (messageType === 7) {
          let buildNumber = BigInt(0);
          for (let i = 1; i <= 32; i++) {
            buildNumber = (buildNumber << BigInt(8)) | BigInt(buffer[i]);
          }
          console.log('Decoded BigInt:', buildNumber.toString());

          // Retrieve the stored build number, defaulting to 0 if not present
          const storedBuildNumber = BigInt(localStorage.getItem('buildNumber') || '0');
          console.log('Stored Build Number:', storedBuildNumber.toString());
          console.log('New Build Number:', buildNumber.toString());

          // Compare and update if necessary
          if (buildNumber > storedBuildNumber) {
            localStorage.setItem('buildNumber', buildNumber.toString());
            // Usage: call this function with the new build number
            updateSaitoScript(buildNumber);
          }
        }

        try {
          S.getLibInstance().process_msg_buffer_from_peer(new Uint8Array(event.data), index);
        } catch (error) {
          console.error(error);
        }
      };

      socket.onopen = () => {
        try {
          S.getLibInstance().process_new_peer(index, peerData);
        } catch (error) {
          console.error(error);
        }
      };
      socket.onclose = () => {
        try {
          console.log("socket.onclose : " + index);
          S.getLibInstance().process_peer_disconnection(index);
        } catch (error) {
          console.error(error);
        }
      };


      console.log("connected to : " + url + " with peer index : " + index);
    } catch (e) {
      console.error(e);
    }
  }


  async processApiCall(buffer: Uint8Array, msgIndex: number, peerIndex: bigint): Promise<void> {
    // console.log(
    //   "WebMethods.processApiCall : peer= " + peerIndex + " with size : " + buffer.byteLength
    // );
    const mycallback = async (response_object) => {
      try {
        await S.getInstance().sendApiSuccess(
          msgIndex,
          Buffer.from(JSON.stringify(response_object), "utf-8"),
          peerIndex
        );
      } catch (error) {
        console.error(error);
      }
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
    // console.log("web shared methods . emit : " + event, this.app.connection);
    this.app.connection.emit(event, peerIndex);
  }

  sendBlockSuccess(hash: string, blockId: bigint) {
    this.app.connection.emit("add-block-success", { hash, blockId });
  }

  sendNewVersionAlert(major: number, minor: number, patch: number, peerIndex: bigint): void {
    console.log(`emit : new-version-detected ${major}:${minor}:${patch}`);
    this.app.connection.emit("new-version-detected", {
      version: `${major}.${minor}.${patch}`,
      peerIndex: peerIndex,
    });
  }

  sendWalletUpdate() {
    this.app.connection.emit("wallet-updated");
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
      LogLevel.Info
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
  try {
    await init();
  } catch (error) {
    console.error(error);
  }
};
