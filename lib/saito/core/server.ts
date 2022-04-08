import Block from "./../block";
import { Saito } from "../../../apps/core";
import express from "express";
import { Server as Ser } from "http";

// const io          = require('socket.io')(webserver, {
//   cors: {
//     origin: "*.*",
//     methods: ["GET", "POST"]
//   }
// });
import fs from "fs";
import path from "path";
import bodyParser from "body-parser";

const JSON = require("json-bigint");
const app = express();
const webserver = new Ser(app);

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
    publickey: "",
    protocol: "",
    name: "",
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
  public publickey: string;

  constructor(app: Saito) {
    this.app = app;

    this.blocks_dir = path.join(__dirname, "../../../data/blocks/");
    this.web_dir = path.join(__dirname, "../../../web/");

    this.webserver = null;
    //this.io                         = null;
    this.server_file_encoding = "utf8";
  }

  initializeWebSocketServer(app) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ws = require("ws");

    const server = new ws.Server({
      noServer: true,
      // port:5001, // TODO : setup this correctly
      path: "/wsopen",
    });

    app.on("upgrade", (request, socket, head) => {
      server.handleUpgrade(request, socket, head, (websocket) => {
        server.emit("connection", websocket, request);
      });
    });

    server.on("connection", (wsocket, request) => {
      //console.log("new connection received by server", request);
      this.app.network.addRemotePeer(wsocket);
    });
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
      this.server.endpoint.publickey = this.app.options.server.publickey;
    } else {
      const { host, port, protocol, publickey } = this.server;
      this.server.endpoint = { host, port, protocol, publickey };
      this.app.options.server.endpoint = { host, port, protocol, publickey };
      this.app.storage.saveOptions();
    }

    //
    // save options
    //
    this.app.options.server = this.server;
    this.app.storage.saveOptions();

    //
    // enable cross origin polling for socket.io
    // - FEB 16 - replaced w/ upgrade to v3
    //
    //io.origins('*:*');

    // body-parser
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    /////////////////
    // full blocks //
    /////////////////
    app.get("/blocks/:bhash/:pkey", (req, res) => {
      const bhash = req.params.bhash;
      if (bhash == null) {
        return;
      }

      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const blk = this.app.blockchain.blocks[bhash];
        if (!blk) {
          return;
        }
        const filename = blk.returnFilename();
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
        res.status(400);
        res.send({
          error: {
            message: `FAILED SERVER REQUEST: could not find block: ${bhash}`,
          },
        });
      }
    });

    //////////////////////
    // full json blocks //
    //////////////////////
    app.get("/json-blocks/:bhash/:pkey", (req, res) => {
      const bhash = req.params.bhash;
      if (bhash == null) {
        return;
      }

      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const blk = server_self.app.blockchain.blocks[bhash];
        if (!blk) {
          return;
        }
        const blkwtx = new Block(server_self.app);
        blkwtx.block = JSON.parse(JSON.stringify(blk.block));
        blkwtx.transactions = blk.transactions;
        blkwtx.app = null;

        res.writeHead(200, {
          "Content-Type": "text/plain",
          "Content-Transfer-Encoding": "utf8",
        });
        res.write(Buffer.from(JSON.stringify(blkwtx), "utf8"), "utf8");
        res.end();
      } catch (err) {
        //
        // file does not exist on disk, check in memory
        //
        //let blk = await this.app.blockchain.returnBlockByHash(bsh);

        console.error("FETCH BLOCKS ERROR SINGLE BLOCK FETCH: ", err);
        res.status(400);
        res.send({
          error: {
            message: `FAILED SERVER REQUEST: could not find block: ${bhash}`,
          },
        });
      }
    });

    /////////////////
    // lite-blocks //
    /////////////////
    app.get("/lite-block/:bhash/:pkey", async (req, res) => {
      if (req.params.bhash == null) {
        return;
      }

      let pkey = server_self.app.wallet.returnPublicKey();
      if (req.params.pkey != null) {
        pkey = req.params.pkey;
      }

      const bsh = req.params.bhash;
      let keylist = [];
      let peer = null;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      for (let i = 0; i < this.app.network.peers.length; i++) {
        if (this.app.network.peers[i].returnPublicKey() === pkey) {
          peer = this.app.network.peers[i];
        }
      }

      if (peer == null) {
        keylist.push(pkey);
      } else {
        keylist = peer.peer.keylist;
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
      const block = this.app.blockchain.blocks[bsh];

      if (block) {
        if (block.hasKeylistTransactions(bsh, keylist) === 0) {
          res.writeHead(200, {
            "Content-Type": "text/plain",
            "Content-Transfer-Encoding": "utf8",
          });
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const liteblock = block.returnLiteBlock(keylist);
          const buffer = Buffer.from(liteblock.serialize(), "binary").toString("base64");

          //res.write(Buffer.from(liteblock.serialize(), "utf8"), "utf8");
          res.write(buffer, "utf8");
          res.end();
          return;
        }

        //
        // TODO - load from disk to ensure we have txs -- slow.
        //
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const blk = await this.app.storage.loadBlockByHash(bsh);

        if (blk == null) {
          res.writeHead(200, {
            "Content-Type": "text/plain",
            "Content-Transfer-Encoding": "utf8",
          });
          res.send("{}");
          res.end();
          return;
        } else {
          const newblk = blk.returnLiteBlock(keylist);

          res.writeHead(200, {
            "Content-Type": "text/plain",
            "Content-Transfer-Encoding": "utf8",
          });

          const liteblock = block.returnLiteBlock(keylist);
          const buffer = Buffer.from(liteblock.serialize(), "binary").toString("base64");
          res.write(buffer, "utf8");
          //res.write(Buffer.from(liteblock.serialize(), "utf8"), "utf8");
          res.end();
          return;
        }

        console.log("hit end...");
        return;
      }

      console.log("block doesn't exist...");
      return;
    });

    app.get("/block/:hash", async (req, res) => {

      try {

        const hash = req.params.hash;
        console.debug("server giving out block : " + hash);
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
        let bufferString = Buffer.from(buffer).toString("base64");

        res.status(200);
        res.end(bufferString);

      } catch (err) {

	console.log("ERROR: server cannot feed out block");

      }
    });

    app.get("/json-block/:hash", async (req, res) => {

      try {

        const hash = req.params.hash;
        console.debug("server giving out block : " + hash);

        if (!hash) {
          console.warn("hash not provided");
          return res.sendStatus(400); // Bad request
        }

        const block = await this.app.blockchain.loadBlockAsync(hash);
        if (!block) {
          console.warn("block not found for : " + hash);
          return res.sendStatus(404); // Not Found
        }

        let block_to_return = { block: {}, transactions: {} };
        if (block?.block) {
          block_to_return.block = JSON.parse(JSON.stringify(block.block));
        }
        if (block?.transactions) {
          block_to_return.transactions = JSON.parse(JSON.stringify(block.transactions));
        }

        let buffer = JSON.stringify(block_to_return).toString("utf-8");
        buffer = Buffer.from(buffer, "utf-8");

        res.status(200);
        res.end(buffer);
 
        } catch (err) {
	  console.log("ERROR: server cannot feed out block");
	}

    });

    app.get("/json-block/:hash", async (req, res) => {

      try {

        const hash = req.params.hash;
        console.debug("server giving out block : " + hash);

        if (!hash) {
          console.warn("hash not provided");
          return res.sendStatus(400); // Bad request
        }

        const block = await this.app.blockchain.loadBlockAsync(hash);
        if (!block) {
          console.warn("block not found for : " + hash);
          return res.sendStatus(404); // Not Found
        }

        let block_to_return = { block: null, transactions: null };

        block_to_return.block = JSON.parse(JSON.stringify(block.block));
        block_to_return.transactions = JSON.parse(JSON.stringify(block.transactions));

        let buffer = JSON.stringify(block_to_return).toString("utf-8");
        console.log("buffer is created!");
        buffer = Buffer.from(buffer, "utf-8");

        res.status(200);
        res.end(buffer);

      } catch (err) {
        console.log("ERROR: server cannot feed out block ");
      }

    });

    /////////
    // web //
    /////////
    app.get("/options", (req, res) => {
      //this.app.storage.saveClientOptions();
      // res.setHeader("Cache-Control", "private, no-cache, no-store, must-revalidate");
      // res.setHeader("expires","-1");
      // res.setHeader("pragma","no-cache");
      const client_options_file = this.web_dir + "client.options";
      if (!fs.existsSync(client_options_file)) {
        const fd = fs.openSync(client_options_file, "w");
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        fs.writeSync(fd, this.app.storage.returnClientOptions(), this.server_file_encoding);
        fs.closeSync(fd);
      }
      res.sendFile(client_options_file);
      //res.send(this.app.storage.returnClientOptions());
      return;
    });

    app.get("/runtime", (req, res) => {
      res.writeHead(200, {
        "Content-Type": "text/json",
        "Content-Transfer-Encoding": "utf8",
      });
      res.write(Buffer.from(JSON.stringify(this.app.options.runtime)), "utf8");
      res.end();
    });

    app.get("/r", (req, res) => {
      res.sendFile(this.web_dir + "refer.html");
      return;
    });

    app.get("/saito/saito.js", (req, res) => {
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
      const caching =
        process.env.NODE_ENV === "prod"
          ? "private max-age=31536000"
          : "private, no-cache, no-store, must-revalidate";
      res.setHeader("Cache-Control", caching);
      res.setHeader("expires", "-1");
      res.setHeader("pragma", "no-cache");
      res.sendFile(this.web_dir + "/saito/saito.js");
      return;
    });

    //
    // make root directory recursively servable
    app.use(express.static(this.web_dir));
    //

    /////////////
    // modules //
    /////////////
    this.app.modules.webServer(app, express);

    app.get("*", (req, res) => {
      res.status(404).sendFile(`${this.web_dir}404.html`);
      res.status(404).sendFile(`${this.web_dir}tabs.html`);
    });

    //     io.on('connection', (socket) => {
    // console.log("IO CONNECTION on SERVER: ");
    //       this.app.network.addRemotePeer(socket);
    //     });
    this.initializeWebSocketServer(webserver);

    webserver.listen(this.server.port);
    // try webserver.listen(this.server.port, {cookie: false});
    this.webserver = webserver;
  }

  close() {
    this.webserver.close();
  }
}

export default Server;
