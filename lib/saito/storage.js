'use strict';
const saito = require('./saito');

class Storage {

  constructor(app, data, dest="blocks") {
    this.app                 = app || {};
  }

  initialize() {

  }



  /**
   * DUMMY FUNCTIONS IMPLEMENTED BY STORAGE-CORE IN ./core/storage-core.js
   **/

  loadBlockById(bid) {}

  loadBlockByHash(bsh) {}

  loadBlockByFilename(filename) {}

  async loadBlocksFromDisk(maxblocks=0) {}

  returnFileSystem() { return null; }

  async saveBlock() {}

  saveClientOptions() {}

  async returnDatabaseByName(dbname) { return null; }

  async returnBlockFilenameByHash(block_hash, mycallback) {}

  returnBlockFilenameByHashPromise(block_hash) {}

  async queryDatabase(sql, params, database) {}

  async executeDatabase(sql, params, database, mycallback=null) {}

}

module.exports = Storage;

