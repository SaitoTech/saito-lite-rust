const saito = require('../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');

//
// Library module is used to index material that I have saved in my own transaction
// archives for curation, personal use, and lending as possible. It listens for saved
// transactions and processes them into collections.
//
// Modules that wish to take advantage of the existence of the library should respondTo
// the "library-collection" with the template object they wish to index (i.e. which fields
// should be indexed and how they are saved). The Library will then listen for saved
// transactions and add them to the index if any of them match a collection. 
//
// Library indexes are currently stored in the wallet.
//
// library['collection'] = [
//    { 
//	id : "", 
//	title : "" , 
//	description : "" , 
//	num : 1 , 
//	sig : ""
//    }
// }
//
class Library extends ModTemplate {

  constructor(app) {

    super(app);

    this.app = app;
    this.name = "Library";
    this.description = "Adds digital rights management (DRM) and curation and lending functionality, permitting users to create curated collections of content and share it in rights-permitting fashion.";
    this.categories = "Core Utilities DRM";

    this.library = {};
    this.monitor = [];

    return this;
  }


  //
  // other modules can let us know they monitor a collection. we create the entries here as needed.
  // monitoring both the saved transactions for transaction-types that might be a library item, as 
  // we as creating a new collection object for saving items if one does not already exist.
  //
  initialize(app) {

    //
    // setup library
    //
    let mods = app.modules.respondTo("library-collection");
    for (let i = 0; i < mods.length; i++) {
      let m = mods[i].respondTo("library-collection");
      if (!this.library[m.collection]) {
	this.library[m.collection] = [];
      }
    }

    //
    // listen for publications / modifications
    //
    this.app.connection.on("save-transaction", function (tx) {

console.log("save transaction!");

      //
      // library exists?
      //
      if (this.library[m.collection]) {

console.log("collection exists! " + m.collection);

        let txmsg = tx.returnMessage();
        let id = txmsg.id;
        let title = txmsg.title;
        let module = txmsg.module;
        let request = txmsg.request;
        let sig = tx.transaction.sig;

	let idx = -1;
	let contains_item = false;

        for (let i = 0; i < this.library[m.collection].length; i++) {
	  let item = this.library[m.collection][i];
	  if (item.id == id) {
	    contains_item = true;
	    idx = i;
	    i = this.library[m.collection].length+1;
	  }
	}

	//
	// add ROM or update library
	//
	if (request === "upload rom") {
	  if (contains_item == false) {
console.log("adding item!");
	    this.library[m.collection].push(
	      {
		id : id ,
		title : title ,
		num : 1 ,
		sig : sig ,
	      }
	    );
	  } else {
console.log("incrementing item!");
	    this.library[m.collection][idx].num++;
	  }

console.log("saving");
	  this.save();
console.log(JSON.stringify(this.library));
	}
      }
    });
  }



  async handlePeerRequest(app, message, peer, mycallback = null) {

    if (message.request === "library collection") {

        let collection = null;

        if (message.data.collection) {
	  collection = message.data.collection;
        } else {
	  return;
	}
      
	if (this.library[collection]) {
	  mycallback(returnCollection(collection));
	}
    }
  } 

  returnCollection(collection) {
    if (this.library[collection]) {
      return this.library[collection];
    }
    return [];
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

