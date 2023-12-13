import { Saito } from "../../../apps/core";
import express from "express";
import { Server as Ser } from "http";
import S from "saito-js/index.node";

import fs from "fs";
import path from "path";
import bodyParser from "body-parser";
import ws from "ws";
import process from "process";
import CustomSharedMethods from "saito-js/lib/custom/custom_shared_methods";
import { parse } from "url";
import Peer from "../peer";
import Transaction from "../transaction";
import PeerServiceList from "saito-js/lib/peer_service_list";
import Block from "../block";

import fetch from "node-fetch";
import { toBase58 } from "saito-js/lib/util";
import { TransactionType } from "saito-js/lib/transaction";
import { BlockType } from "saito-js/lib/block";

const JSON = require("json-bigint");
const expressApp = express();
const webserver = new Ser(expressApp);


export class NodeSharedMethods extends CustomSharedMethods {
  public app: Saito;
  currentBuildNumber: bigint = BigInt(0);
  isWatchingConfigFile = false;
  fileWatcher: any;
  constructor(app: Saito) {
    super();
    this.app = app;
  }

  sendMessage(peerIndex: bigint, buffer: Uint8Array): void {
    try {
      let socket = S.getInstance().getSocket(peerIndex);
      if (socket) {
        socket.send(buffer);
      }
    } catch (e) {
      console.error(e);
    }
  }

  sendMessageToAll(buffer: Uint8Array, exceptions: bigint[]): void {
    S.getInstance().sockets.forEach((socket, key) => {
      if (exceptions.includes(key)) {
        return;
      }
      try {
        socket.send(buffer);
      } catch (error) {
        console.error(error);
      }
    });
  }

  pollConfigFile(peerIndex): void {
    const checkBuildNumber = async () => {
      const filePath = path.join(__dirname, '/config/build.json');
      fs.readFile('config/build.json', 'utf8', async (err, data) => {
        if (err) {
          console.error('Error reading options file:', err);
          return;
        }
        try {
          const jsonData = JSON.parse(data);
          const buildNumber = BigInt(jsonData.build_number);

          if (Number(this.currentBuildNumber) < Number(buildNumber)) {
            let buffer = { buildNumber, peerIndex };
            let jsonString = JSON.stringify(buffer);
            let uint8Array = new Uint8Array(jsonString.length);
            for (let i = 0; i < jsonString.length; i++) {
              uint8Array[i] = jsonString.charCodeAt(i);
            }
            await this.app.modules.getBuildNumber();
            await S.getInstance().sendSoftwareUpdate(peerIndex, buildNumber);
            this.currentBuildNumber = buildNumber;

            console.log('Updated build number to:', this.currentBuildNumber);
          } else {
            // console.log("Current build number is up-to-date or higher");
          }

        } catch (e) {
          console.error('Error parsing JSON from options file:', e);
        }
      });
    };

    const filePath = path.join(__dirname, 'config/build.json');


    console.log('Setting up watcher for config file');
    if (this.fileWatcher) {
      this.fileWatcher.close();
      this.fileWatcher = null;
      console.log('Previous file watcher closed');
    }


    fs.watch('config/build.json', (eventType, prev) => {
      checkBuildNumber();
      // }
    });


  }


  updateSoftware(buffer: Uint8Array): void {

  }







  connectToPeer(peerData: any): void {
    let protocol = "ws";
    if (peerData.protocol === "https") {
      protocol = "wss";
    }
    let url = protocol + "://" + peerData.host + ":" + peerData.port + "/wsopen";

    try {
      console.log("connecting to " + url + "....");

      let socket = new ws.WebSocket(url);
      let index = S.getInstance().addNewSocket(socket);



      socket.on("message", (buffer: any) => {
        try {
          S.getLibInstance().process_msg_buffer_from_peer(buffer, index);
        } catch (e) {
          console.error(e);
        }
      });
      socket.on("close", () => {
        try {
          S.getLibInstance().process_peer_disconnection(index);
        } catch (e) {
          console.error(e);
        }
      });
      socket.on("error", (error) => {
        console.error(error);
      });
      S.getLibInstance().process_new_peer(index, peerData);
      console.log("connected to : " + url + " with peer index : " + index);
    } catch (e) {
      console.error(e);
    }
  }

  writeValue(key: string, value: Uint8Array): void {
    try {
      fs.writeFileSync(key, value);
    } catch (error) {
      console.error(error);
    }
  }

  readValue(key: string): Uint8Array {
    try {
      return fs.readFileSync(key);
    } catch (error) {
      console.error(error);
      return new Uint8Array();
    }
  }

  loadBlockFileList(): string[] {
    try {
      let files = fs.readdirSync("data/blocks/");
      files = files.filter((file: string) => file.endsWith(".sai"));
      return files;
    } catch (e) {
      console.log("cwd : ", process.cwd());
      console.error(e);
      return [];
    }
  }

  isExistingFile(key: string): boolean {
    try {
      let result = fs.existsSync(key);
      return !!result;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  removeValue(key: string): void {
    try {
      fs.rmSync(key);
    } catch (e) {
      console.error(e);
    }
  }

  disconnectFromPeer(peerIndex: bigint): void {
    S.getInstance().removeSocket(peerIndex);
  }

  fetchBlockFromPeer(url: string): Promise<Uint8Array> {
    console.log("fetching block from peer: " + url);
    return fetch(url)
      .then((res: any) => {
        return res.arrayBuffer();
      })
      .then((buffer: ArrayBuffer) => {
        console.log("block data fetched for " + url + " with size : " + buffer.byteLength);
        return new Uint8Array(buffer);
      })
      .catch((err) => {
        console.error("Error fetching block: " + url, err);
        throw "failed fetching block";
      });
  }

  async processApiCall(buffer: Uint8Array, msgIndex: number, peerIndex: bigint): Promise<void> {
    // console.log(
    //   "NodeMethods.processApiCall : peer= " + peerIndex + " with size : " + buffer.byteLength
    // );
    const mycallback = async (response_object) => {
      // console.log("response_object ", response_object);
      await S.getInstance().sendApiSuccess(
        msgIndex,
        response_object ? Buffer.from(JSON.stringify(response_object), "utf-8") : Buffer.alloc(0),
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
    this.app.connection.emit(event, peerIndex);
  }

  sendBlockSuccess(hash: string, blockId: bigint) {
    this.app.connection.emit("add-block-success", { hash, blockId });
  }

  sendWalletUpdate() {
    this.app.connection.emit("wallet-updated");
  }

  async saveWallet(): Promise<void> {
    this.app.options.wallet.publicKey = await this.app.wallet.getPublicKey();
    this.app.options.wallet.privateKey = await this.app.wallet.getPrivateKey();
    this.app.options.wallet.balance = await this.app.wallet.getBalance();
  }

  loadWallet(): void {
    throw new Error("Method not implemented.");
  }

  saveBlockchain(): void {
    throw new Error("Method not implemented.");
  }

  loadBlockchain(): void {
    throw new Error("Method not implemented.");
  }

  getMyServices() {
    let list = new PeerServiceList();
    let result = this.app.network.getServices();
    result.forEach((s) => list.push(s));
    return list;
  }

  sendNewVersionAlert(major: number, minor: number, patch: number, peerIndex: bigint): void { }
}

/**
 * Constructor
 */
class Server {
  public app: Saito;
  public blocks_dir: string;
  public web_dir: string;
  public server: any = {
    host: "",
    port: 0,
    publicKey: "",
    protocol: "",
    name: "",
    block_fetch_url: "",
    endpoint: {
      host: "",
      port: 0,
      protocol: "",
    },
  };
  public webserver: any;
  public server_file_encoding: string;
  public host: string;
  public port: number;
  public protocol: string;

  constructor(app: Saito) {
    this.app = app;

    this.blocks_dir = path.join(__dirname, "../../../data/blocks/");
    this.web_dir = path.join(__dirname, "../../../web/");

    this.webserver = null;
    //this.io                         = null;
    this.server_file_encoding = "utf8";
  }

  initializeWebSocketServer() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ws = require("ws");

    const wss = new ws.Server({
      noServer: true,
      // port:5001, // TODO : setup this correctly
      path: "/wsopen",
    });
    webserver.on("upgrade", (request: any, socket: any, head: any) => {
      // console.debug("connection upgrade ----> " + request.url);
      const { pathname } = parse(request.url);
      console.info('### upgrade pathname: ' + pathname);
      if (pathname === "/wsopen") {
        wss.handleUpgrade(request, socket, head, (websocket: any) => {
          wss.emit("connection", websocket, request);
        });
      } else {
        socket.destroy();
      }
    });
    webserver.on("error", (error) => {
      console.error("error on express : ", error);
    });
    wss.on("connection", (socket: any, request: any) => {
      const { pathname } = parse(request.url);
      console.log('connection established')
      console.info('### connection pathname: ' + pathname);
      let index = S.getInstance().addNewSocket(socket);

      socket.on("message", (buffer: any) => {
        S.getLibInstance()
          .process_msg_buffer_from_peer(new Uint8Array(buffer), index)
          .then(() => { });
      });
      socket.on("close", () => {
        S.getLibInstance().process_peer_disconnection(index);
      });
      socket.on("error", (error) => {
        console.error("error on socket : " + index, error);
      });


      S.getLibInstance().process_new_peer(index, null);

      // watch build file
    });
    // app.on("upgrade", (request, socket, head) => {
    //   server.handleUpgrade(request, socket, head, (websocket) => {
    //     server.emit("connection", websocket, request);
    //   });
    // });
    //
    // server.on("connection", (wsocket, request) => {
    //   //console.log("new connection received by server", request);
    //   this.app.network.addRemotePeer(wsocket).catch((error) => {
    //     console.log("failed adding remote peer");
    //     console.error(error);
    //   });
    // });
  }

  initialize() {
    const server_self = this;

    if (this.app.BROWSER === 1) {
      return;
    }

    //
    // update server information from options file
    //
    if (this.app.options.server != null) {
      this.server.host = this.app.options.server.host;
      this.server.port = this.app.options.server.port;
      this.server.protocol = this.app.options.server.protocol;
      this.server.name = this.app.options.server.name || "";

      this.server.sendblks =
        typeof this.app.options.server.sendblks == "undefined"
          ? 1
          : this.app.options.server.sendblks;
      this.server.sendtxs =
        typeof this.app.options.server.sendtxs == "undefined" ? 1 : this.app.options.server.sendtxs;
      this.server.sendgts =
        typeof this.app.options.server.sendgts == "undefined" ? 1 : this.app.options.server.sendgts;
      this.server.receiveblks =
        typeof this.app.options.server.receiveblks == "undefined"
          ? 1
          : this.app.options.server.receiveblks;
      this.server.receivetxs =
        typeof this.app.options.server.receivetxs == "undefined"
          ? 1
          : this.app.options.server.receivetxs;
      this.server.receivegts =
        typeof this.app.options.server.receivegts == "undefined"
          ? 1
          : this.app.options.server.receivegts;
    }

    //
    // sanity check
    //
    if (this.server.host === "" || this.server.port === 0) {
      console.log("Not starting local server as no hostname / port in options file");
      return;
    }

    //
    // init endpoint
    //
    if (this.app.options.server.endpoint != null) {
      this.server.endpoint.port = this.app.options.server.endpoint.port;
      this.server.endpoint.host = this.app.options.server.endpoint.host;
      this.server.endpoint.protocol = this.app.options.server.endpoint.protocol;
      this.server.endpoint.publicKey = this.app.options.server.publicKey;
    } else {
      const { host, port, protocol, publicKey } = this.server;
      this.server.endpoint = { host, port, protocol, publicKey };
      this.app.options.server.endpoint = { host, port, protocol, publicKey };
      console.log("SAVE OPTIONS IN SERVER");
      this.app.storage.saveOptions();
    }

    let url = this.server.endpoint.protocol;
    url += "://";
    url += this.server.endpoint.host;
    url += ":";
    url += this.server.endpoint.port;
    // url += "/block/";

    this.server.block_fetch_url = url;

    //
    // save options
    //
    this.app.options.server = Object.assign(this.app.options.server, this.server);
    console.log("SAVE OPTIONS IN SERVER 2");
    this.app.storage.saveOptions();

    //
    // enable cross origin polling for socket.io
    // - FEB 16 - replaced w/ upgrade to v3
    //
    //io.origins('*:*');

    // body-parser
    expressApp.use(bodyParser.urlencoded({ extended: true }));
    expressApp.use(bodyParser.json());

    /////////////////
    // full blocks //
    /////////////////
    expressApp.get("/blocks/:bhash/:pkey", async (req, res) => {
      const bhash = req.params.bhash;
      if (bhash == null) {
        return;
      }

      try {
        const blk = await this.app.blockchain.getBlock(bhash);
        if (!blk) {
          return;
        }
        const filename = "./data/blocks/" + blk.file_name;
        // console.info("### write from line 188 of server.ts.");
        res.writeHead(200, {
          "Content-Type": "text/plain",
          "Content-Transfer-Encoding": "utf8",
        });
        const src = fs.createReadStream(filename, { encoding: "utf8" });
        src.pipe(res);
      } catch (err) {
        //
        // file does not exist on disk, check in memory
        //
        //let blk = await this.app.blockchain.returnBlockByHash(bsh);

        console.error("FETCH BLOCKS ERROR SINGLE BLOCK FETCH: ", err);
        console.info("### write from line server.ts:422");
        res.status(400);
        res.end({
          error: {
            message: `FAILED SERVER REQUEST: could not find block: ${bhash}`,
          },
        });
      }
    });

    // //////////////////////
    // // full json blocks //
    // //////////////////////
    // app.get("/json-blocks/:bhash/:pkey", (req, res) => {
    //   const bhash = req.params.bhash;
    //   if (bhash == null) {
    //     return;
    //   }
    //
    //   try {
    //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //     // @ts-ignore
    //     const blk = server_self.app.blockchain.blocks.get(bhash);
    //     if (!blk) {
    //       return;
    //     }
    //     const blkwtx = new Block(server_self.app);
    //     blkwtx.block = JSON.parse(JSON.stringify(blk.block));
    //     blkwtx.transactions = blk.transactions;
    //     blkwtx.app = null;
    //
    //     // console.info("### write from line 232 of server.ts.");
    //     res.writeHead(200, {
    //       "Content-Type": "text/plain",
    //       "Content-Transfer-Encoding": "utf8",
    //     });
    //     res.end(Buffer.from(JSON.stringify(blkwtx), "utf8"), "utf8");
    //   } catch (err) {
    //     //
    //     // file does not exist on disk, check in memory
    //     //
    //     //let blk = await this.app.blockchain.returnBlockByHash(bsh);
    //
    //     console.error("FETCH BLOCKS ERROR SINGLE BLOCK FETCH: ", err);
    //     // console.info("### write from line 188 of server.ts.");
    //     res.status(400);
    //     res.end({
    //       error: {
    //         message: `FAILED SERVER REQUEST: could not find block: ${bhash}`,
    //       },
    //     });
    //   }
    // });

    /////////////////
    // lite-blocks //
    /////////////////
    expressApp.get("/lite-block/:bhash/:pkey?", async (req, res) => {
      if (req.params.bhash == null) {
        return;
      }
      let pkey = await server_self.app.wallet.getPublicKey();
      if (req.params.pkey != null) {
        pkey = req.params.pkey;
        if (pkey.length == 66) {
          pkey = toBase58(pkey);
        }
      }

      const bsh = req.params.bhash;
      let keylist = [];
      let peer: Peer | null = null;
      let peers: Peer[] = await this.app.network.getPeers();
      for (let i = 0; i < peers.length; i++) {
        try {
          if (peers[i].publicKey === pkey) {
            peer = peers[i];
            break;
          }
        } catch (error) {
          console.error(error);
        }
      }
      if (peer == null) {
        keylist.push(pkey);
      } else {
        keylist = peer.keyList;
        if (!keylist.includes(pkey)) {
          keylist.push(pkey);
        }
      }

      //
      // SHORTCUT hasKeylistTransactions returns (1 for yes, 0 for no, -1 for unknown)
      // if we have this block but there are no transactions for it in the block hashmap
      // then we just fetch the block header from memory and serve that.
      //
      // this avoids the need to run blk.returnLiteBlock because we know there are no
      // transactions and thus no need for lite-clients that are not fully-validating
      // the entire block to calculate the merkle root.
      //
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const block = await this.app.blockchain.getBlock(bsh);

      if (!block) {
        console.log(`block : ${bsh} doesn't exist...`);
        res.sendStatus(404);
        return;
      }

      if (block.block_type === BlockType.Full || !block.hasKeylistTxs(keylist)) {
        res.writeHead(200, {
          "Content-Type": "text/plain",
          "Content-Transfer-Encoding": "utf8",
        });
        const liteblock = block.generateLiteBlock(keylist);

        // console.log(
        //   `liteblock : ${bsh} from memory txs count = : ${liteblock.transactions.length}`
        // );
        // console.log(
        //   "valid txs : " +
        //     liteblock.transactions.filter((tx) => tx.type !== TransactionType.SPV).length
        // );
        // liteblock.transactions.forEach((tx) => {
        // });
        const buffer = Buffer.from(liteblock.serialize());
        res.end(buffer, "utf8");
        return;
      }

      console.log("loading block from disk : " + bsh);

      let methods = new NodeSharedMethods(this.app);
      // TODO - load from disk to ensure we have txs -- slow.
      try {
        let buffer = new Uint8Array();
        let list = methods.loadBlockFileList();
        for (let filename of list) {
          if (filename.includes(bsh)) {
            buffer = methods.readValue("./data/blocks/" + filename);
            break;
          }
        }
        if (buffer.byteLength == 0) {
          res.sendStatus(404);
          return;
        }
        let blk = new Block();
        blk.deserialize(buffer);
        const newblk = blk.generateLiteBlock(keylist);
        // console.log(
        //   `lite block : ${newblk.hash} generated with txs : ${newblk.transactions.length}`
        // );
        console.log(
          `lite block fetch : block  = ${req.params.bhash} key = ${pkey} with txs : ${newblk.transactions.length}`
        );
        console.log(`liteblock : ${bsh} from disk txs count = : ${newblk.transactions.length}`);
        console.log(
          "valid txs : " +
          newblk.transactions.filter((tx) => tx.type !== TransactionType.SPV).length
        );

        res.writeHead(200, {
          "Content-Type": "text/plain",
          "Content-Transfer-Encoding": "utf8",
        });
        const buffer2 = Buffer.from(newblk.serialize());
        res.end(buffer2);
        return;
      } catch (error) {
        console.log("failed serving lite block : " + bsh);
        console.error(error);
      }
      try {
        res.sendStatus(400);
      } catch (error) {
        console.error(error);
      }
    });

    expressApp.get("/block/:hash", async (req, res) => {
      try {
        const hash = req.params.hash;
        // console.debug("server giving out block : " + hash);
        if (!hash) {
          console.warn("hash not provided");
          return res.sendStatus(400); // Bad request
        }

        const block = await this.app.blockchain.loadBlockAsync(hash);
        if (!block) {
          console.warn("block not found for : " + hash);
          return res.sendStatus(404); // Not Found
        }
        let buffer = block.serialize();

        res.status(200);
        res.end(buffer);
      } catch (err) {
        console.log("ERROR: server cannot feed out block");
        res.sendStatus(404);
      }
    });

    expressApp.get("/balance/:keys?", async (req, res) => {
      try {
        let keys = [];
        if (req.params.keys) {
          keys = req.params.keys.split(";");
        }
        keys = keys.map((key) => {
          if (key.length === 66) {
            return toBase58(key);
          }
          return key;
        });
        console.log("fetching balance snapshot with keys : ", keys);

        const snapshot = await S.getInstance().getBalanceSnapshot(keys);
        res.setHeader("Content-Disposition", "attachment; filename=" + snapshot.file_name);
        res.end(snapshot.toString());
      } catch (error) {
        console.error(error);
        res.sendStatus(404);
      }
    });

    // app.get("/json-block/:hash", async (req, res) => {
    //   try {
    //     const hash = req.params.hash;
    //     console.debug("server giving out block : " + hash);
    //
    //     if (!hash) {
    //       console.warn("hash not provided");
    //       return res.sendStatus(400); // Bad request
    //     }
    //
    //     const block = await this.app.blockchain.loadBlockAsync(hash);
    //     if (!block) {
    //       console.warn("block not found for : " + hash);
    //       return res.sendStatus(404); // Not Found
    //     }
    //
    //     let block_to_return = { block: {}, transactions: {} };
    //     if (block?.block) {
    //       block_to_return.block = JSON.parse(JSON.stringify(block.block));
    //     }
    //     if (block?.transactions) {
    //       block_to_return.transactions = JSON.parse(JSON.stringify(block.transactions));
    //     }
    //
    //     let buffer = JSON.stringify(block_to_return).toString("utf-8");
    //     buffer = Buffer.from(buffer, "utf-8");
    //
    //     res.status(200);
    //     console.info("### write from server.ts:637");
    //     console.log("serving block .. : " + hash + " , buffer size : " + buffer.length);
    //     res.end(buffer);
    //   } catch (err) {
    //     console.log("ERROR: server cannot feed out block");
    //   }
    // });

    /////////
    // web //
    /////////
    expressApp.get("/options", (req, res) => {
      //this.app.storage.saveClientOptions();
      // res.setHeader("Cache-Control", "private, no-cache, no-store, must-revalidate");
      // res.setHeader("expires","-1");
      // res.setHeader("pragma","no-cache");
      const client_options_file = this.web_dir + "client.options";
      if (!fs.existsSync(client_options_file)) {
        const fd = fs.openSync(client_options_file, "w");
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        fs.writeSync(fd, this.app.storage.getClientOptions(), this.server_file_encoding);
        fs.closeSync(fd);
      }
      res.sendFile(client_options_file);
      //res.send(this.app.storage.returnClientOptions());
    });

    expressApp.get("/r", (req, res) => {
      res.sendFile(this.web_dir + "refer.html");
      return;
    });

    // expressApp.get("/check-build", (req, res) => {
    //   // res.sendFile(this.web_dir);
    //   this.app.modules.webServer(expressApp, express);
    //   res.send()
    // })


    expressApp.get("/saito/saito.js", (req, res) => {
      //
      // may be useful in the future, if we gzip
      // files before releasing for production
      //
      // gzipped, cached
      //
      //res.setHeader("Cache-Control", "public");
      //res.setHeader("Content-Encoding", "gzip");
      //res.setHeader("Content-Length", "368432");
      //res.sendFile(server_self.web_dir + 'saito.js.gz');
      //
      // non-gzipped, cached
      //
      //res.setHeader("Cache-Control", "public");
      //res.setHeader("expires","72000");
      //res.sendFile(server_self.web_dir + '/dist/saito.js');
      //
      // caching in prod
      //
      /* Not needed as handled by nginx.
      const caching =
        process.env.NODE_ENV === "prod"
          ? "private max-age=31536000"
          : "private, no-cache, no-store, must-revalidate";
      res.setHeader("Cache-Control", caching);
      res.setHeader("expires", "-1");
      res.setHeader("pragma", "no-cache");
      */
      res.sendFile(this.web_dir + "/saito/saito.js");
      return;
    });

    //
    // make root directory recursively servable
    expressApp.use(express.static(this.web_dir));
    //

    /////////////
    // modules //
    /////////////
    //
    // res.write -- have to use res.end()
    // res.send --- is combination of res.write() and res.end()
    //



    this.app.modules.webServer(expressApp, express);

    expressApp.get("*", (req, res) => {
      res.status(404).sendFile(`${this.web_dir}404.html`);
      res.status(404).sendFile(`${this.web_dir}tabs.html`);
    });

    //     io.on('connection', (socket) => {
    // console.log("IO CONNECTION on NODE: ");
    //       this.app.network.addRemotePeer(socket);
    //     });
    this.initializeWebSocketServer();

    webserver.listen(this.server.port, () => {
      console.log("web server is listening");
    });
    // try webserver.listen(this.server.port, {cookie: false});
    this.webserver = webserver;
  }

  close() {
    this.webserver.close();
  }
}

export default Server;
