const saito = require('../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');

//
//
// library['collection'] = [
//    { title : "" , num : "" }
//
//
// }
//
//
class Library extends ModTemplate {

  constructor(app) {

    super(app);

    this.app = app;
    this.name = "Library";
    this.description = "Adds digital rights management (DRM) and curation and lending functionality, permitting users to create curated collections of content and share it in rights-permitting fashion.";
    this.categories = "Core Utilities DRM";

    this.library = [];

    return this;
  }


  returnServices() {
    return [{ service: "library", domain: "saito" }];
  }

  respondTo(type = "") {
    if (type == "library-request") {
    }
    return null;
  }

  

  async handlePeerRequest(app, message, peer, mycallback = null) {

    let response = {};
    let txs = [];

    if (message.request === 'library collection query') {
      let tx = message.data.tx;
      let collection = message.data.collection;
      let library_self = app.modules.returnModule("Library");
      if (library_self.library[collection]) {
       
	let tx = new saito.default.transaction();
        tx.msg = {
          collection : collection , 
	  results : library_self.library[collection] ,
        }
	tx.presign();
	txs.push(tx);

        response.err = "";
        response.txs = txs;
        mycallback(response);
 
      }
    }

    if (message.request === 'library checkout request') {
      let tx = message.data.tx;
      let library_self = app.modules.returnModule("Library");
    }

    super.handlePeerRequest(app, message, peer, mycallback);
  }

  async onConfirmation(blk, tx, conf, app) {

    let library_self = app.modules.returnModule("Library");
    let txmsg = tx.returnMessage();

    if (conf == 0) {
      if (txmsg.module === "Library") {
          return;
      }
    }
  }


  load() {
    if (this.app.options.library) {
      this.library = this.app.options.library;
      return;
    }
    this.library = {};
  }

  save() {
    this.app.options.library = this.library;
    this.app.storage.saveOptions();
  }



}

module.exports = Library;

