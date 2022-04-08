"use strict";

import saito from "../saito";
import Storage from "../storage";
import fs from "fs-extra";
import * as JSON from "json-bigint";
import path from "path";
import sqlite from "sqlite";
import { Saito } from "../../../apps/core";
import Block from "../block";
import Slip , { SlipType } from "../slip";


class StorageCore extends Storage {
  public data_dir: any;
  public config_dir: any;
  public dest: any;
  public db: any;
  public dbname: any;
  public loading_active: any;
  public file_encoding_save: any;
  public file_encoding_load: any;
  public app: Saito;

  constructor(app, data?, dest = "blocks") {
    super(app);

    this.data_dir = data || path.join(__dirname, "../../../data");
    this.config_dir = path.join(__dirname, "../../../config");
    this.dest = dest;
    this.db = [];
    this.dbname = [];
    this.loading_active = false;

    this.file_encoding_save = "utf8";
    this.file_encoding_load = "utf8";
    //    this.file_encoding_load    = 'binary';
    //this.file_encoding         = 'binary';
  }

  deleteBlockFromDisk(filename) {
    try {
      return fs.unlinkSync(filename);
    } catch (error) {
      console.error(`failed deleting the block file ${filename} from disk`);
      console.error(error);
    }
  }

  returnFileSystem() {
    return fs;
  }

  async returnDatabaseByName(dbname) {
    for (let i = 0; i < this.dbname.length; i++) {
      if (dbname == this.dbname[i]) {
        return this.db[i];
      }
    }
    try {
      const db = await sqlite.open(this.data_dir + "/" + dbname + ".sq3");

      this.dbname.push(dbname);
      this.db.push(db);

      return this.db[this.db.length - 1];
    } catch (err) {
      console.log("Error creating database for db-name: " + dbname);
      return null;
    }
  }

  generateBlockFilename(block): string {
    let filename = this.data_dir + "/" + this.dest + "/";
    filename += block.block.timestamp;
    filename += "-";
    filename += block.hash;
    filename += ".sai";
    return filename;
  }

  async loadBlockFromDisk(filename) {
    try {
      if (fs.existsSync(filename)) {
        const buffer = fs.readFileSync(filename);
        const block = new Block(this.app);
        block.deserialize(buffer);
        block.generateMetadata();
        return block;
      }
    } catch (error) {
      console.log("Error reading block from disk");
      console.error(error);
    }
    return null;
  }

  async loadBlocksFromDisk(maxblocks = 0) {
    this.loading_active = true;

    //
    // sort files by creation date, and then name
    // if two files have the same creation date
    //
    const dir = `${this.data_dir}/${this.dest}/`;

    //
    // if this takes a long time, our server can
    // just refuse to sync the initial connection
    // as when it starts to connect, currently_reindexing
    // will be set at 1
    //
    const files = fs.readdirSync(dir);

    //
    // "empty" file only
    //
    if (files.length == 1) {
      this.loading_active = false;
      return;
    }

    files.sort(function (a, b) {
      const compres = fs.statSync(dir + a).mtime.getTime() - fs.statSync(dir + b).mtime.getTime();
      if (compres == 0) {
        return parseInt(a) - parseInt(b);
      }
      return compres;
    });

    for (let i = 0; i < files.length; i++) {
      try {
        const fileID = files[i];
        if (fileID !== "empty") {
          const blk = await this.loadBlockByFilename(dir + fileID);
          if (blk == null) {
            console.log("block is null: " + fileID);
            return null;
          }
          if (!blk.is_valid) {
            console.log("We have saved an invalid block: " + fileID);
            return null;
          }

          await this.app.blockchain.addBlockToBlockchain(blk, 1);
          console.log("Loaded block " + i + " of " + files.length);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  /**
   * Saves a block to database and disk and shashmap
   *
   * @param {Block} block block
   */
  async saveBlock(block: Block): Promise<string> {
    try {
      const filename = this.generateBlockFilename(block);
      if (!fs.existsSync(filename)) {
        const fd = fs.openSync(filename, "w");
        const buffer = block.serialize();
        fs.writeSync(fd, buffer);
        fs.fsyncSync(fd);
        fs.closeSync(fd);
      }
      return filename;
    } catch (err) {
      console.error("ERROR 285029: error saving block to disk ", err);
    }
    return "";
  }

  /* deletes block from shashmap and disk */
  async deleteBlock(bid, bsh, lc) {
    const blk = await this.loadBlockByHash(bsh);
    if (blk != null) {
      //
      // delete txs utxoset
      //
      if (blk.transactions != undefined) {
        for (let b = 0; b < blk.transactions.length; b++) {
          for (let bb = 0; bb < blk.transactions[b].transaction.to.length; bb++) {
            this.app.utxoset.delete(blk.transactions[b].transaction.to[bb].returnKey());
          }
        }
      }

      //
      // deleting file
      //
      const block_filename = await this.returnBlockFilenameByHashPromise(bsh);

      fs.unlink(block_filename.toString(), function (err) {
        if (err) {
          console.error(err);
        }
      });
    }
  }

  async loadBlockById(bid) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const bsh = this.app.blockchain.bid_bsh_hmap[bid];
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const ts = this.app.blockchain.bsh_ts_hmap[bsh];
    const filename = ts + "-" + bsh + ".blk";
    const blk = await this.loadBlockByFilename(filename);
    return blk;
  }

  async loadBlockByHash(bsh) {
    if (!this.app.blockchain.blocks[bsh]) {
      return null;
    }
    const blk = this.app.blockchain.blocks[bsh];
    const filename = blk.returnFilename();
    const block = await this.loadBlockByFilename(filename);
    return block;
  }

  async loadBlockByFilename(filename) {
    try {
      if (fs.existsSync(filename)) {
        const data = fs.readFileSync(filename);
        const block = new Block(this.app);
        block.deserialize(data);
        block.generateMetadata();
        block.generateHashes();
        return block;
      } else {
        console.error(`cannot open: ${filename} as it does not exist on disk`);
        return null;
      }
    } catch (err) {
      console.log("Error reading block from disk");
      console.error(err);
    }

    console.log("Block not being returned... returning null");
    return null;
  }

  /**
   * Load the options file
   */
  async loadOptions() {
    if (fs.existsSync(`${this.config_dir}/options`)) {
      //
      // open options file
      //
      try {
        const optionsfile = fs.readFileSync(`${this.config_dir}/options`, this.file_encoding_load);
        this.app.options = JSON.parse(optionsfile.toString());
      } catch (err) {
        // this.app.logger.logError("Error Reading Options File", {message:"", stack: err});
        console.error(err);
        process.exit();
      }
    } else {
      //
      // default options file
      //
      this.app.options = JSON.parse(
        '{"server":{"host":"localhost","port":12101,"protocol":"http"}}'
      );
    }
  }

  async loadRuntimeOptions() {
    if (fs.existsSync(`${this.config_dir}/runtime.config.js`)) {
      //
      // open runtime config file
      //
      try {
        const configfile = fs.readFileSync(
          `${this.config_dir}/runtime.config.js`,
          this.file_encoding_load
        );
        this.app.options.runtime = JSON.parse(configfile.toString());
      } catch (err) {
        // this.app.logger.logError("Error Reading Runtime Config File", {message:"", stack: err});
        console.error(err);
        process.exit();
      }
    } else {
      //
      // default options file
      //
      this.app.options.runtime = {};
    }
  }

  /**
   * Save the options file
   */
  saveOptions() {
    this.app.options = Object.assign({}, this.app.options);

    try {
      fs.writeFileSync(`${this.config_dir}/options`, JSON.stringify(this.app.options), null);
    } catch (err) {
      // this.app.logger.logError("Error thrown in storage.saveOptions", {message: "", stack: err});
      console.error(err);
      return;
    }
  }



  //
  // token issuance functions below
  //
  returnTokenSupplySlipsFromDisk(): any {

    let v: any = [];
    let tokens_issued = 0;
    let filename;
    let contents;
    let slips;
    let s;

    filename = this.data_dir + "/issuance/issuance";
    contents = fs.readFileSync(filename);
    contents = contents.toString();
    slips = contents.split("\n");
    for (let i = 0; i < slips.length; i++) {
      if (slips[i] !== "") {
        s = this.convertIssuanceIntoSlip(slips[i]);
	if (s != null) { v.push(s); }
      }
    }

    filename = this.data_dir + "/issuance/default";
    contents = fs.readFileSync(filename);
    contents = contents.toString();
    slips = contents.split("\n");
    for (let i = 0; i < slips.length; i++) {
      if (slips[i] !== "") {
        s = this.convertIssuanceIntoSlip(slips[i]);
	if (s != null) { v.push(s); }
      }
    }

    filename = this.data_dir + "/issuance/earlybirds";
    contents = fs.readFileSync(filename);
    contents = contents.toString();
    slips = contents.split("\n");
    for (let i = 0; i < slips.length; i++) {
      if (slips[i] !== "") {
        s = this.convertIssuanceIntoSlip(slips[i]);
	if (s != null) { v.push(s); }
      }
    }

    return v;
  }


  convertIssuanceIntoSlip(line = "") { 

    let entries = line.split("\t");

console.log(JSON.stringify(entries));

    let amount = BigInt(entries[0]);
    let publickey = entries[1];
    let type = entries[2];

    let slip = new Slip(
      publickey , 
      amount 
    );

    if (type === "VipOutput") {
      slip.type = SlipType.VipOutput;
    }
    if (type === "StakerDeposit") {
      slip.type = SlipType.StakerDeposit;
    }
    if (type === "Normal") {
      slip.type = SlipType.Normal;
    }

    return slip;
  }



  // overwrite to stop the server from attempting to reset options live
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  resetOptions() {}

  ///////////////////////
  // saveClientOptions //
  ///////////////////////
  //
  // when browsers connect to our server, we check to see
  // if the client.options file exists in our web directory
  // and generate one here if it does not.
  //
  // this is fed out to client browsers and serves as their
  // default options, specifying us as the node to which they
  // should connect and through which they can route their
  // transactions. :D
  //
  saveClientOptions() {
    if (this.app.BROWSER == 1) {
      return;
    }
    const client_peer = Object.assign({}, this.app.server.server.endpoint, {
      synctype: "lite",
    });
    //
    // mostly empty, except that we tell them what our latest
    // block_id is and send them information on where our
    // server is located so that they can sync to it.
    //
    const t: any = {};
    t.keys = [];
    t.peers = [];
    t.services = this.app.options.services;
    t.dns = [];
    t.blockchain = {};
    t.registry = this.app.options.registry;
    t.appstore = {};
    t.appstore.default = this.app.wallet.returnPublicKey();
    t.peers.push(client_peer);

    //
    // write file
    //
    try {
      fs.writeFileSync(`${__dirname}/web/client.options`, JSON.stringify(t));
    } catch (err) {
      console.log(err);
      console.error(err);
      // this.app.logger.logError("Error thrown in storage.saveBlock", {message: "", stack: err});
    }
  }

  returnClientOptions(): string {
    if (this.app.BROWSER == 1) {
      return "";
    }
    if (this.app.options) {
      if (this.app.options.client_options) {
        return JSON.stringify(this.app.options.client_options, null, 2);
      }
    }

    const client_peer = Object.assign({}, this.app.server.server.endpoint, {
      synctype: "lite",
    });
    //
    // mostly empty, except that we tell them what our latest
    // block_id is and send them information on where our
    // server is located so that they can sync to it.
    //
    const t: any = {};
    t.keys = [];
    t.peers = [];
    t.services = this.app.options.services;
    t.dns = [];
    t.runtime = this.app.options.runtime;
    t.blockchain = {};
    t.wallet = {};
    t.registry = this.app.options.registry;
    //t.appstore             = {};
    //t.appstore.default     = this.app.wallet.returnPublicKey();
    t.peers.push(client_peer);

    //
    // return json
    //
    return JSON.stringify(t, null, 2);
  }

  /**
   * TODO: uses a callback and should be moved to await / async promise
   **/
  async returnBlockFilenameByHash(block_hash, mycallback) {
    const sql = "SELECT id, ts, block_id FROM blocks WHERE hash = $block_hash";
    const params = { $block_hash: block_hash };

    try {
      const row = await this.db.get(sql, params);
      if (row == undefined) {
        mycallback(null, "Block not found on this server");
        return;
      }
      const filename = `${row.ts}-${block_hash}.blk`;
      mycallback(filename, null);
    } catch (err) {
      console.log("ERROR getting block filename in storage: " + err);
      mycallback(null, err);
    }
  }

  returnBlockFilenameByHashPromise(block_hash) {
    return new Promise((resolve, reject) => {
      this.returnBlockFilenameByHash(block_hash, (filename, err) => {
        if (err) {
          reject(err);
        }
        resolve(filename);
      });
    });
  }

  /**
   *
   * @param {*} sql
   * @param {*} params
   * @param {*} callback
   */
  async executeDatabase(sql, params, database, mycallback = null) {
    try {
      const db = await this.returnDatabaseByName(database);
      if (mycallback == null) {
        return await db.run(sql, params);
      } else {
        return await db.run(sql, params, mycallback);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async queryDatabase(sql, params, database) {
    try {
      const db = await this.returnDatabaseByName(database);
      const rows = await db.all(sql, params);
      if (rows == undefined) {
        return [];
      }
      return rows;
    } catch (err) {
      console.log(err);
      return [];
    }
  }
}

export default StorageCore;
