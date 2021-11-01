'use strict';
const saito = require('./saito');

class Storage {

  constructor(app, data, dest="blocks") {
    this.app                 = app || {};
    this.active_tab	     = 1; 		// TODO - only active tab saves, move to Browser class
  }

  async initialize() {
    await this.loadOptions();
    this.saveOptions();
    return;
  }

  async loadOptions() {
    if (typeof(Storage) !== "undefined") {
      let data = localStorage.getItem("options");
      if (data != "null" && data != null)  {
        this.app.options = JSON.parse(data);
      } else {
        try {
          let response = await fetch(`/options`);
          this.app.options = await response.json();
          this.saveOptions();
        } catch(err) {
          console.error(err);
        }
      }
    }
  }

  async resetOptions() {
    try {
      let response = await fetch(`/options`);
      this.app.options = await response.json();
      this.saveOptions();
    } catch(err) {
      console.error(err);
    }
  }

  saveOptions() {
    if (this.app.BROWSER == 1) {
      if (this.active_tab == 0) { return; }
    }
    try {
      if (typeof(Storage) !== "undefined") {
        localStorage.setItem("options", JSON.stringify(this.app.options));
      }
    } catch (err) {
      console.log(err);
    }
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

