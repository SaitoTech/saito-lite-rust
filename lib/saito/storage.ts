import * as JSON from 'json-bigint';
import Transaction from './transaction';
import { Saito } from '../../apps/core';
import Block from './block';
const localforage = require('localforage');
import fs from 'fs';
import path from 'path';
const JsStore = require('jsstore');
import S from 'saito-js/saito';

class Storage {
  public app: Saito;
  public active_tab: any;
  public timeout: any;
  currentBuildNumber: bigint = BigInt(0);
  public localDB: any = null;
  public wallet_options_hash: any = '';

  constructor(app) {
    this.app = app || {};
    this.active_tab = 1; // TODO - only active tab saves, move to Browser class
    this.timeout = null;
    this.localDB = null;
    this.wallet_options_hash = '';
  }

  async initialize() {
    await this.loadOptions();

    if (this.app.BROWSER === 0) {
      this.watchBuildFile();
    }

    if (this.app.BROWSER == 1) {
      try {
        this.localDB = null;
        await this.initializeApplicationDB();
        console.log(JSON.stringify(await this.loadLocalApplications()));
      } catch (err) {
        console.log('Error initializeApplicationDB:', err);
      }
    }

    return;
  }

  //
  // Oct 12, 2023 added the safety check from deprecated getOptions()
  // Should we worry about app.BROWSER == 0 ???
  //
  async loadOptions() {
    if (this.app.BROWSER == 1) {
      if (this.active_tab == 0) {
        return;
      }
    }
    const response = await fetch(`/options`);
    let receivedOptions = await response.json();
    if (typeof Storage !== 'undefined') {
      const data = localStorage.getItem('options');
      if (data != 'null' && data != null) {
        this.app.options = JSON.parse(data);
        this.app.options.consensus = receivedOptions.consensus;
        return;
      }
    }
    this.app.options = receivedOptions;
  }

  returnClientOptions(): string {
    throw new Error('Method not implemented.');
  }

  //
  // HOW THE STORAGE CLASS SAVES TXS
  //
  // modules call ---> app.storage.saveTransaction(tx, obj, peer))
  //    ---> saveTransaction() creates TX type="archive" / request="save" transaction
  //    ---> saveTransaction() directs this transaction to:
  //                    "localhost"   ==> its own archive module
  //      peer    ==> this specific peer via offchain handlePeerTransaction() request)
  //      null    ==> all peers via offchain handlePeerTransaction() request)
  //    ---> peers receive via Archive module
  //    ---> peers save to DB
  //
  // HOW THE STORAGE CLASS LOADS TXS
  //
  // modules call ---> app.storage.loadTransactions()
  //    ---> loadTransactions() creates TX type="archive" / request="load" transaction
  //    ---> loadTransactions() directs this transaction to:
  //                    "localhost"   ==> its own archive module
  //      peer    ==> this specific peer via offchain handlePeerTransaction() request)
  //      null    ==> all peers via offchain handlePeerTransaction() request)
  //    ---> peers receive via Archive module
  //    ---> peers fetch from DB, return via callback or return TX
  //
  async saveTransaction(tx: Transaction, obj = {}, peer = null) {
    try {
      const txmsg = tx.returnMessage();
      const message = 'archive';

      let data: any = {};
      data.request = 'save';
      data.serial_transaction = tx.serialize_to_web(this.app);

      data = Object.assign(data, obj);

      //
      // defaults
      //
      // - field1 = module
      // - field2 = sender
      // - field3 = receiver
      //
      if (!data.field1) {
        data.field1 = txmsg.module;
      }
      if (!data.field2) {
        data.field2 = tx.from[0].publicKey;
      }
      if (!data.field3) {
        data.field3 = tx.to[0].publicKey;
      }

      this.app.connection.emit('saito-save-transaction', tx);

      if (peer === 'localhost') {
        let archive_mod = this.app.modules.returnModule('Archive');
        if (archive_mod) {
          return await archive_mod.saveTransaction(tx, data);
        }
      }
      if (peer != null) {
        return await this.app.network.sendRequestAsTransaction(message, data, null, peer.peerIndex);
      } else {
        return await this.app.network.sendRequestAsTransaction(message, data);
      }
    } catch (error) {
      console.warn('failed saving tx : ' + tx.signature);
      console.error(error);
      return { err: error };
    }
    return { err: 'Save Transaction failed' };
  }

  async updateTransaction(tx: Transaction, obj = {}, peer = null) {
    const message = 'archive';
    let data: any = {};
    data.request = 'update';
    data.optional = tx.optional;
    data.serial_transaction = tx.serialize_to_web(this.app);

    data = Object.assign(data, obj);

    if (peer === 'localhost') {
      let archive_mod = this.app.modules.returnModule('Archive');
      if (archive_mod) {
        return await archive_mod.updateTransaction(tx, obj);
      }
    } else {
      if (peer != null) {
        return await this.app.network.sendRequestAsTransaction(message, data, null, peer.peerIndex);
      } else {
        return await this.app.network.sendRequestAsTransaction(message, data);
      }
    }
    return { err: 'Save Transaction failed' };
  }

  // You might need to await this function for the internal callbacks to work...
  async loadTransactions(obj = {}, mycallback, peer = null) {
    let storage_self = this;

    const message = 'archive';
    let data: any = {};
    data.request = 'load';
    data = Object.assign(data, obj);

    //
    // We could have the archive module handle this
    // idk why we have it return an array of objects that are just {"tx": serialized/stringified transaction}
    //
    let internal_callback = (res) => {
      let txs = [];
      if (res) {
        for (let i = 0; i < res.length; i++) {
          let tx = new Transaction();
          tx.deserialize_from_web(storage_self.app, res[i].tx);

          tx['updated_at'] = res[i].updated_at;

          txs.push(tx);
        }
      }
      return mycallback(txs);
    };

    if (peer === 'localhost') {
      let archive_mod = this.app.modules.returnModule('Archive');
      if (archive_mod) {
        return archive_mod.loadTransactionsWithCallback(obj, (res) => {
          return internal_callback(res);
        });
      }
    }

    if (peer != null) {
      //peer.sendRequestAsTransaction(message, data, function (res) {
      this.app.network.sendRequestAsTransaction(
        message,
        data,
        function (res) {
          internal_callback(res);
        },
        peer.peerIndex
      );
      return [];
    } else {
      this.app.network.sendRequestAsTransaction(message, data, function (res) {
        internal_callback(res);
      });
      return [];
    }

    return [];
  }

  async deleteTransaction(tx = null, mycallback = null, peer = null) {
    if (tx == null) {
      return;
    }

    const message = 'archive';
    let data: any = {};
    data.request = 'delete';

    if (peer === 'localhost') {
      let archive_mod = this.app.modules.returnModule('Archive');
      if (archive_mod) {
        await archive_mod.deleteTransaction(tx);
      }
      return;
    }

    if (peer != null) {
      this.app.network.sendRequestAsTransaction(message, data, function () {
        if (mycallback != null) {
          mycallback();
        }
      });
    }
  }

  async deleteTransactions(obj = {}, mycallback = null, peer = null) {
    const message = 'archive';
    let data: any = {};
    data.request = 'multidelete';
    data = Object.assign(data, obj);

    if (peer === 'localhost') {
      let archive_mod = this.app.modules.returnModule('Archive');
      if (archive_mod) {
        await archive_mod.deleteTransactions(obj);
        if (mycallback != null) {
          mycallback();
        }
      }
      return;
    }

    if (peer != null) {
      this.app.network.sendRequestAsTransaction(message, data, function (obj) {
        if (mycallback != null) {
          mycallback();
        }
      });
    }
  }

  async resetOptions() {
    try {
      //Wipe local storage before resaving options
      localStorage.clear();

      const response = await fetch(`/options`);
      this.app.options = await response.json();
      this.saveOptions();
    } catch (err) {
      console.error(err);
    }
  }

  async resetOptionsFromKey(publicKey) {
    if (this.app.BROWSER) {
      let wallet = await localforage.getItem(publicKey);
      if (wallet) {
        console.log(`Found wallet for ${publicKey} in IndexedDB`);
        //siteMessage(`Found wallet for ${publicKey} in IndexedDB`);
        this.app.options = wallet;
        this.app.storage.saveOptions();
      } else {
        console.log(`Creating fresh wallet for ${publicKey}`);
        //siteMessage(`Creating fresh wallet for ${publicKey}`);
        await this.resetOptions();
      }
    }
  }

  /**
   *  Save the entire app.options as a key-entry pair in localForage -- enables switching accounts
   *
   */
  async saveOptionsToForage() {
    if (this.app.BROWSER) {
      let key = await this.app.wallet.getPublicKey();
      if (key) {
        localforage.setItem(key, this.app.options);
      }
    }
  }

  /**
   * Wrapper classes so modules can consistently use localForage (indexedDB)
   */

  async getLocalForageItem(key) {
    if (this.app.BROWSER) {
      try {
        return await localforage.getItem(key);
      } catch (err) {
        console.error(err);
        return null;
      }
    }
  }

  async setLocalForageItem(key, value) {
    if (this.app.BROWSER) {
      try {
        return await localforage.setItem(key, value);
      } catch (err) {
        console.error(err);
        return null;
      }
    }
  }

  async removeLocalForageItem(key) {
    if (this.app.BROWSER) {
      try {
        return await localforage.removeItem(key);
      } catch (err) {
        console.error(err);
        return null;
      }
    }
  }

  async clearLocalForage() {
    if (this.app.BROWSER) {
      try {
        await localforage.clear();
        console.log('Cleared LocalForage!');
      } catch (err) {
        console.error(err);
      }
    }
  }

  saveOptions() {
    if (this.app.BROWSER == 1) {
      if (this.active_tab == 0) {
        return;
      }
    }

    let new_wallet_json = JSON.stringify(this.app.options);
    let new_wallet_hash = this.app.crypto.hash(new_wallet_json);

    if (new_wallet_hash == this?.wallet_options_hash) {
      return;
    }

    try {
      localStorage.setItem('options', new_wallet_json);

      //Update hash
      this.wallet_options_hash = new_wallet_hash;

      //update indexedDB (which is needed for privateKey wallet recovery)
      this.saveOptionsToForage();
    } catch (err) {
      console.error(err);
      for (let i = 0; i < localStorage.length; i++) {
        let item = localStorage.getItem(localStorage.key(i));
        console.log(localStorage.key(i), item.length, item, JSON.parse(item));
      }
    }
  }

  async saveLocalApplication(mod, bin) {
    if (!this.app.BROWSER) {
      return;
    }

    if (this.app.BROWSER) {
      let obj = {
        mod: mod,
        binary: bin,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime()
      };

      console.log('obj: ', obj);

      let numRows = await this.localDB.insert({
        into: 'dyn_mods',
        values: [obj]
      });

      let v = await this.loadLocalApplications();
      console.log('POST INSERT: ' + JSON.stringify(v));
    }
  }

  async loadLocalApplications(mod_slug = null) {
    try {
      if (!this.app.BROWSER) {
        return;
      }

      let obj = {
        from: 'dyn_mods',
        order: { by: 'id', type: 'desc' }
      };

      if (mod_slug != null) {
        obj['where'] = {
          mod: mod_slug
        };
      }

      let rows = await this.localDB.select(obj);

      return rows;
    } catch (err) {
      console.log('Error loadLocalApplications: ', err);
    }
  }

  async removeLocalApplication(mod_slug = null) {
    try {
      if (!this.app.BROWSER) {
        return;
      }

      let rowsDeleted = await this.localDB.remove({
        from: 'dyn_mods',
        where: {
          mod: mod_slug
        }
      });

      return rowsDeleted;
    } catch (err) {
      console.log('Error removeLocalApplication: ', err);
    }
  }

  async removeAllLocalApplications() {

    try {

      if (!this.app.BROWSER) {
        return;
      }

      let rowsDeleted = await this.localDB.remove({
          from: 'dyn_mods'
      });

      return rowsDeleted;

    } catch (err) {
      console.log('Error removeLocalApplication: ', err);
    }

  }

  async initializeApplicationDB() {
    if (this.app.BROWSER) {
      this.localDB = new JsStore.Connection(new Worker('/saito/lib/jsstore/jsstore.worker.js'));

      //
      // create Local database
      //
      let dyn_mod = {
        name: 'dyn_mods',
        columns: {
          id: { primaryKey: true, autoIncrement: true },
          mod: { dataType: 'string', default: '' },
          binary: { dataType: 'string', default: '' },
          created_at: { dataType: 'number', default: 0 },
          updated_at: { dataType: 'number', default: 0 }
        }
      };

      let db = {
        name: 'dyn_mods_db',
        tables: [dyn_mod]
      };

      var isDbCreated = await this.localDB.initDb(db);
      if (isDbCreated) {
        console.log('STORAGE: db created and connection opened');
      } else {
        console.log('STORAGE: connection opened');
      }
    }

    return;
  }

  getModuleOptionsByName(modname) {
    for (let i = 0; i < this.app.options.modules.length; i++) {
      if (this.app.options.modules[i].name === modname) {
        return this.app.options.modules[i];
      }
    }
    return null;
  }

  /**
   * DUMMY FUNCTIONS IMPLEMENTED BY STORAGE-CORE IN ./core/storage-core.js
   **/
  deleteBlockFromDisk(filename) {}

  async loadBlockById(bid): Promise<Block> {
    return null;
  }

  async loadBlockByHash(bsh): Promise<Block> {
    return null;
  }

  async loadBlockFromDisk(filename): Promise<Block> {
    return null;
  }

  async loadBlockByFilename(filename): Promise<Block> {
    return null;
  }

  async loadBlocksFromDisk(maxblocks = 0): Promise<Block> {
    return null;
  }

  returnPath() {
    return null;
  }

  returnFileSystem() {
    return null;
  }

  async saveBlock(block: Block): Promise<string> {
    return '';
  }

  saveClientOptions() {}

  async returnDatabaseByName(dbname) {
    return null;
  }

  async returnBlockFilenameByHash(block_hash, mycallback) {}

  returnTokenSupplySlipsFromDisk(): any {
    return [];
  }

  returnBlockFilenameByHashPromise(block_hash: string) {}

  async queryDatabase(sql, params, database) {}

  async runDatabase(sql, params, database, mycallback = null) {}

  async executeDatabase(sql, database) {}

  generateBlockFilename(block: Block): string {
    return ''; // empty
  }

  watchBuildFile(): void {
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
          if (typeof this.currentBuildNumber == 'undefined') {
            console.info('Build number undefined');
            return false;
          }
          if (typeof buildNumber == 'undefined') {
            console.info('Error reading build number from file');
            return false;
          }
          if (Number(this.currentBuildNumber) < Number(buildNumber)) {
            let buffer = { buildNumber };
            let jsonString = JSON.stringify(buffer);
            let uint8Array = new Uint8Array(jsonString.length);
            for (let i = 0; i < jsonString.length; i++) {
              uint8Array[i] = jsonString.charCodeAt(i);
            }
            //await this.app.modules.getBuildNumber();
            this.app.build_number = Number(buildNumber);
            let peers = await this.app.network.getPeers();
            console.log('peers', peers);
            peers.forEach((peer) => {
              this.app.network.sendRequest('software-update', data, null, peer);
            });

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

    fs.watchFile('web/saito/saito.js', { interval: 1000 }, (curr, prev) => {
      checkBuildNumber();
    });

    const filePath = path.join(__dirname, 'config/build.json');
  }
}

export default Storage;
