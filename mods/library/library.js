const saito = require('../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');

//
// Library module is used to index material that I have saved in my own transaction
// archives for curation, personal use, and lending as possible. It listens for saved
// transactions and processes them into collections. It then provides meta-data about
// the status of items in the collection, and permits the checkout of those items, 
// while enforcing non-availability of borrowed materials to others.
//
// Modules that wish to take advantage of the existence of the library should respondTo
// the "library-collection" to inform it that it should listen for transactions of a 
// specific type, which will then listen for saved transactions and add them to the index
// in the event of a content-match.
//
// Library indexes are currently stored in the wallet. backup Wallet to save index.
//
// library['collection'] = [
//    { 
//	id : "", 
//	title : "" , 
//	description : "" , 
//	num : 1 , 
//	available : 1,
//	checkout : [],
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

    //
    // any library borrowing coded for 2 hour minimum increments
    //
    this.return_milliseconds = 7200000;

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

    let library_self = this;

    library_self.load();

    //
    // setup library
    //
    for (let i = 0; i < app.modules.mods.length; i++) {
      let m = app.modules.mods[i].respondTo("library-collection");
      if (m) {
        if (!library_self.library[m.collection]) {
	  library_self.library[m.collection] = [];
          library_self.save();
        }
      }
    }

    //
    // listen for publications / modifications
    //
    app.connection.on("save-transaction", function (tx) {

console.log("---------------------");
console.log("---------------------");
console.log("IN LIBRARY ON SAVE TX");
console.log("---------------------");
console.log("---------------------");

      //
      // library exists?
      //
      let txmsg = tx.returnMessage();
      let id = txmsg.id;
      let title = txmsg.title;
      let module = txmsg.module;
      let request = txmsg.request;
      let subrequest = txmsg.subrequest;
      let sig = tx.transaction.sig;

      if (library_self.library[module]) {

	let idx = -1;
	let contains_item = false;

        for (let i = 0; i < library_self.library[module].length; i++) {
	  let item = library_self.library[module][i];
	  if (item.id == id) {
	    contains_item = true;
	    idx = i;
	    i = library_self.library[module].length+1;
	  }
	}

	//
	// add ROM or update library
	//
	if (request === "archive rom" || subrequest === "archive rom") {
	  if (contains_item == false) {
	    library_self.library[module].push(
	      {
		id : id ,
		title : txmsg.title ,
		description : "" ,
		num : 1 ,			// total
		available : 1 ,			// total available
		checkout : [] ,
		sig : sig ,
	      }
	    );
	    library_self.save();
	  } else {
	    let c = confirm("Your library already contains a copy of this game. Is this a new copy?");
	    if (c) {
	      library_self.library[module][idx].num++;
	      library_self.library[module][idx].available++;
	      library_self.save();
	    }
	  }
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
	  let publickey = peer.returnPublicKey();
	  mycallback(this.returnCollection(collection, publickey));
	}
    }

    if (message.request === "library checkout") {

        let collection = null;
        let sig = null;

        if (message.data?.collection && message.data?.sig) {
	  collection = message.data.collection;
	  sig = message.data.sig;
        } else {
	  return;
	}
      
	if (this.library[collection]) {
	  this.checkout(collection, sig, publickey, mycallback);
	}
    }


    if (message.request === "library delete") {

        let collection = null;
        let publickey = null;

        if (message.data?.collection && message.data?.publickey) {
	  collection = message.data.collection;
	  publickey = message.data.publickey;
        } else {
console.log("returning as no collection or publickey");
	  return;
	}
      
console.log("do we have a collection?");
console.log(JSON.stringify(this.library));
	if (this.library[collection]) {
	  this.deleteCollection(collection, publickey);
	}
    }

  } 

  deleteCollection(collection, publickey) {

    //
    // remove from library
    //
    if (this.library[collection]) {
      this.library[collection] = [];
      this.save();
    }

    //
    // trigger delete from TX archive of anything owned by this publickey
    //
    this.app.storage.deleteTransactions("Nwasm", publickey, function() {
console.log("AND EVERYTHING SUPPOSEDLY DELETED");
    });

  }

  cleanupLibrary() {

    let ts = new Date().getTime();

    for (let key in this.library) {
      for (let i = 0; i < this.library[key].length; i++) {

	let item = this.library[key][i];

	if (item.checkout.length > 0) {
	  for (let z = 0; z < item.checkout.length; z++) {

	    if (item.checkout[z].ts < (ts-this.return_milliseconds)) {

	      //
	      // process return
	      //
	      item.checkout.splice(z, 1);
	      item.available++;
	      // should never happen, but safety-catch
	      if (item.available > item.num) { item.available = item.num; }

	    }

	  }
	}
      }
    }

  }

  checkout(collection, sig, publickey, mycallback) {

    let idx = -1;

    if (this.library[collection]) {
      for (let i = 0; i < this.library[collection].length; i++) {
        let sig = this.library[collection][i].sig;
	if (sig === sig) {
	  idx = i;
	  i = this.library[collection].length+1;
	}
      }
    }

    if (idx != -1) {
      
      let item = this.library[collection][idx];

      //
      // current user may checkout again, but we need to 
      // update the time they checked it out
      //
      let is_already_borrowed = 0;
      for (let i = 0; i < item.checkout.length; i++) {
        if (item.checkout[i].publickey === publickey) {
	  item.checkout[i].ts = new Date().getTime();
          is_already_borrowed = 1;
	}	
      }

      //
      // the one condition we permit borrowing is if this user is the 
      // one who has borrowed the item previously and has it in their
      // possession. in that case they have simply rebooted their 
      // machine and should be provided with the data. we 
      //
      if (is_already_borrowed) {
        for (let i = 0; i < item.checkout.length; i++) {
          if (item.checkout[i].publickey === publickey) {
	    item.checkout.splice(i, 1);

	    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!! //
	    // be careful that item.available //
	    // is not removed below for legal //
	    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!! //
	    item.available++;
            this.save();
            is_already_borrowed = 0;
	  }	
        }
      }

      if (!is_already_borrowed) {

        if (item.available < 1) { return; }
        if (item.checkout.length > item.num) { return; }
        //
        // record the checkout
        //
        item.checkout.push({ publickey : publickey , ts : new Date().getTime() });
	// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!! //
	// be careful that item.available //
	// is not removed above for legal //
	// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!! //
        item.available--;
        this.save();
        this.app.storage.loadTransactionBySig(sig, mycallback);
      }
    }

  }

  returnCollection(collection, publickey = null) {

    if (this.library[collection]) {
      let c = [];
      for (let i = 0; i < this.library[collection].length; i++) {
        let item = this.library[collection][i];
        let num = item.num;
        let available = item.available;

	for (let z = 0; z < item.checkout.length; z++) {
	  if (item.checkout[z].publickey === publickey && publickey != null) {
	    available++;
	  }
	}

	if (item.title != "") {
	  c.push({ title : item.title , available : available , num : num , sig : item.sig });
        }
      }
      return c;
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


/***************
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

    if (message.request === 'library delete request') {
      let tx = message.data.tx;
      let library_self = app.modules.returnModule("Library");
    }

    if (message.request === 'library checkout request') {
      let tx = message.data.tx;
      let library_self = app.modules.returnModule("Library");
    }

    super.handlePeerRequest(app, message, peer, mycallback);
  }
***************/


  load() {
    if (this.app.options.library) {
      this.library = this.app.options.library;
      return;
    }
    this.library = {};
    this.save();
  }

  save() {
    this.app.options.library = this.library;
    this.app.storage.saveOptions();
  }



}

module.exports = Library;

