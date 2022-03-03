// import "source-map-support/register";
import Server from "./lib/saito/core/server";
import StorageCore from "./lib/saito/core/storage-core";
import { Saito } from "./apps/core";
import fs from "fs-extra";
import * as JSON from "json-bigint";


import mods_config from "./config/modules.config";
import { readBlockUsers } from "mixin-node-sdk";

async function initCLI() {
  const app = new Saito({
    mod_paths: mods_config.core,
  });

  //app.server = new Server(app);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  app.storage = new StorageCore(app);
  const blake3 = require("blake3");
  // const blake3 = await import ("blake3");
  app.hash = (data) => {
    return blake3.hash(data).toString("hex");
  };
  app.BROWSER = 0;
  app.SPVMODE = 0;

  console.log ("npm run cli help - for help");

  switch (process.argv[2]) {
    case 'block':
      readBlock(process.argv[3]);
      break;
    case 'block.tx':
      readBlockTransactions(process.argv[3]);
      break;
    case 'blocks':
      readBlocks(process.argv[3]);
      break;
      case 'blocks.tx':
        readBlocksTransactions(process.argv[3]);
        break;
      case 'help':
        printHelp();
        break;
      case 'h':
        printHelp();
        break;
    default:
      console.log("Argument not recognised.")
  }


  function readBlocks(dir){
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      try {
        if (file !== "empty") {
          app.storage.loadBlockByFilename(dir + file).then((blk) => {
            console.log(blk);         
          });
        }
      } catch (err) {
        console.error(err);
      }
    });
  }

  function readBlocksTransactions(dir){
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      try {
        if (file !== "empty") {
          app.storage.loadBlockByFilename(dir + file).then((blk) => {
            console.log(blk.transactions);         
          });
        }
      } catch (err) {
        console.error(err);
      }
    });
  }

  function readBlock(filename) {
    app.storage.loadBlockFromDisk(filename).then((block) => {
      console.log(block);
    });
  };
  function readBlockTransactions(filename) {
    app.storage.loadBlockFromDisk(filename).then((block) => {
      console.log(block.transactions);
    });
  };

  function printHelp() {
    var help = `
    Commands:

     block <path and file name>     print block;
     block.tx <path and file name>  print transactions from block
     blocks <directory>             print out blocks in directory
     blocks.tx <directory>          print out all tx from all bocks in direcory
    `;
    console.log(help);
  }


  /////////////////////
  // Cntl-C to Close //
  /////////////////////
  process.on("SIGTERM", function () {
    console.log("Network Shutdown");
    process.exit(0);
  });
  process.on("SIGINT", function () {
    console.log("Network Shutdown");
    process.exit(0);
  });
}

initCLI();
