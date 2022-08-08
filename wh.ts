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

  console.log("npm run cli help - for help");

  switch (process.argv[2]) {
    case "count":
      count(process.argv[3], process.argv[4]);
      break;
    case "save":
      loadTxToDatabase(process.argv[3]);
      break;
    case "version":
      console.log(1);
      break;
    case "help":
      printHelp();
      break;
    case "h":
      printHelp();
      break;
    default:
      console.log("Argument not recognised.");
  }

  function loadTxToDatabase(dir) {
    let count = 0;
    const files = fs.readdirSync(dir);
    const total = files.length;
    files.forEach((file) => {
      count += 1;
      console.log("Processing block " + count + " of " + total + ".");
      try {
        if (file !== "empty") {
          app.storage.loadBlockByFilename(dir + file).then((blk) => {
            addTransactionsToDatabase(blk);
          });
        }
      } catch (err) {
        console.error(err);
      }
    });
  }

  function count(what, dir) {
    var x = 0;
    const files = fs.readdirSync(dir);
    if(what =="blocks") {
      x = files.length;
      console.log(x + " " + what + " on disk.");
    } else {
      files.forEach((file) => {
        try {
          if (file !== "empty") {
            app.storage.loadBlockByFilename(dir + file).then((blk) => {
              x += blk.transactions.length;
              console.log("another: " + blk.transactions.length + " for " + x + " total.");
              if (file == files[files.length-1]) {
                console.log(x + " " + what + " on disk.");
              }    
            });
          }
        } catch (err) {
          console.error(err);
        }
      });  
    }
  }

  async function addTransactionsToDatabase(blk) {
    try {
      for (let i = 0; i < blk.transactions.length; i++) {
        if (blk.transactions[i].transaction.type >= -999) {
          for (let ii = 0; ii < blk.transactions[i].transaction.to.length; ii++) {
            if (blk.transactions[i].transaction.type >= -999) {
              let sql = `INSERT OR IGNORE INTO transactions (
                                address, 
                                amt, 
                                bid, 
                                tid, 
                                sid, 
                                bhash, 
                                lc, 
                                rebroadcast,
                                sig,
                                ts,
                                block_ts,
                                type,
                                tx_from,
                                tx_to,
                                name,
                                module
                                )
                             VALUES (
                                $address, 
                                $amt, 
                                $bid, 
                                $tid, 
                                $sid, 
                                $bhash, 
                                $lc, 
                                $rebroadcast,
                                $sig,
                                $ts,
                                $block_ts,
                                $type,
                                $tx_from,
                                $tx_to,
                                $name,
                                $module
                                )`;
              let ttype = 0;
              let tname = "";
              let tmodule = "";
              if (blk.transactions[i].msg.type) {
                ttype = blk.transactions[i].msg.type;
              }
              if (blk.transactions[i].msg.name) {
                tname = blk.transactions[i].msg.name;
              }
              if (blk.transactions[i].msg.module) {
                tmodule = blk.transactions[i].msg.module;
              }
              let params = {
                $address: blk.transactions[i].transaction.to[ii].add,
                $amt: blk.transactions[i].transaction.to[ii].amt,
                $bid: blk.block.id,
                $tid: blk.transactions[i].transaction.id,
                $sid: ii,
                $bhash: blk.returnHash(),
                $lc: 1,
                $rebroadcast: 0,
                $sig: blk.transactions[i].transaction.sig,
                $ts: blk.transactions[i].transaction.ts,
                $block_ts: blk.block.ts,
                $type: ttype,
                $tx_from: blk.transactions[i].transaction.from[0].add,
                $tx_to: blk.transactions[i].transaction.to[ii].add,
                $name: tname,
                $module: tmodule
              }
              await app.storage.executeDatabase(sql, params, "warehouse");
            }
          }
        }
      }
      return;
    } catch (err) {
      console.error(err);
    }

  }


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
