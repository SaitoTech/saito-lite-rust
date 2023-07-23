const saito = require('../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');

//
// Library module is used to index material that I have saved in my own transaction
// archives for curation, personal use and lending as legally permitted. It queries
// my peers for items they have indexed in the same collections, and fetches those 
// records on load.
//
// Modules that wish to manage distributed and curated content should respondTo() the
// the "library-collection" to tell it what class of material it should index for 
// personal or distributed use. The library will then start indexing those materials 
// and serve entries to peers on request.
//
// Library indexes are stored in the wallet - backup wallet to save.
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

    //
    // library['collection'].peers = {}
    //
    this.library = {};

    //
    // the information stored will look like this
    //
    //    module 	: "Nwasm" ,
    //    mod 		: this ,     
    //    collection 	: "Nwasm" ,
    //    key 		: this.nwasm.random ,
    //    shouldArchive : (tx) => { return false; } // true or false
    //
    this.collections = [];

    //
    //
    //
    this.load();


    //
    // index transactions that are saved
    //
    app.connection.on("saito-save-transaction", (tx) => {

//console.log("---------------------");
//console.log("---------------------");
//console.log("IN LIBRARY ON SAVE TX");
//console.log("---------------------");
//console.log("---------------------");

      //
      // fetch information for index
      //
      let txmsg 	= tx.returnMessage();
      let id 		= txmsg.id;
      let title 	= txmsg.title;
      let module 	= txmsg.module;
      let request 	= txmsg.request || "";
      let sig 		= tx.transaction.sig;

      //
      // sanity check
      //
      let does_item_exist_in_collection = this.isItemInCollection({ id : id }, module);
      if (does_item_exist_in_collection) {
        try {
          let c = confirm("Your library already contains a copy of this item. Is this a new copy?");
          if (c) {

	    let idx = -1;
	    for (let i = 0; i < this.library[module].peers[this.app.wallet.returnPublicKey()],length; i++) {
	      if (this.library[module].peers[this.app.wallet.returnPublicKey()][i].id == id) {
		idx = i;
		break;
	      }
	    }

	    if (idx == -1) {
	      alert("ERROR: cannot find item which supposedly exists");
	    } else {
              this.library[module].peers[this.app.wallet.returnPublicKey()][idx].num++;
              this.library[module].peers[this.app.wallet.returnPublicKey()][idx].available++;
              this.save();
	    }

	    return;

          } else {

	    alert("Not Saving");
	    return;

	  }
        } catch (err) {}
      }

      //
      // add item to library
      //
      for (let i = 0; i < this.collections.length; i++) {

        if (this.collections[i].shouldArchive(tx)) {
	  let item = {
  		id 		: id ,
		title 		: txmsg.title ,
		description 	: "" ,
		num 		: 1 ,			// total
		available 	: 1 ,		// total available
		checkout 	: [] ,
		sig 		: sig
	  };
	  this.addItemToCollection(item, this.collections[i], this.app.wallet.returnPublicKey());
	  this.save();
	}
      }
    });
  } 


  addCollection(collection, peer="localhost") {

    if (peer === "localhost") { peer = this.app.wallet.returnPublicKey(); }

    this.collections.push(collection);

    //
    // if this is an existing collection, we will already have content
    // indexed in our library. but if it is not indexed, we should create
    // the library and ensure we have "localhost" available as a peer
    // so there is a place to store our collection.
    //
    if (!this.library[collection.name]) {
      this.library[collection.name] = {};
      this.library[collection.name].peers = {};
      this.library[collection.name].peers[peer] = [];
    } else {
      if (!this.library[collection.name].peers) {
        this.library[collection.name].peers = {};
        this.library[collection.name].peers[peer] = [];
      }
    }

    this.save();

  }


  isItemInCollection(item, collection, peer="localhost") {
    if (peer === "localhost") { peer = this.app.wallet.returnPublicKey(); }
    if (this.library[collection]) {
      let idx = -1;
      let contains_item = false;
      for (let i = 0; i < this.library[collection].peers[this.app.wallet.returnPublicKey()].length; i++) {
        let item = this.library[collection].peers[this.app.wallet.returnPublicKey()][i];
	if (item.id == this.library[collection].peers[this.app.wallet.returnPublicKey()].id) { return true; }
      }
    }
    return false;
  }


  addItemToCollection(item, collection, peer="localhost") {

    if (peer === "localhost") { peer = this.app.wallet.returnPublicKey(); }

    if (!this.library[collection.name]) {
      this.addCollection(collection);
    }

    // id 		: "id" ,
    // title 		: "title" ,
    // description 	: "description" ,
    // num 		: 1 ,				// total in collection
    // available 	: 1 ,				// total available (not in use)
    // checkout 	: [] ,
    // sig 		: "sig"

    let does_item_exist_in_collection = false;

    for (let i = 0; i < this.library[collection.name].peers[peer].length; i++) {
      if (this.library[collection.name].peers[peer][i].title === item.title) {
        does_item_exist_in_collection = true;
        this.library[collection.name].peers[peer][i].num++;
        this.library[collection.name].peers[peer][i].available++;
      }
    }

    if (!does_item_exist_in_collection) {
      this.library[collection.name].peers[peer].push(item);
    }

  }


  initialize(app) {

    //
    // modules respondTo("library-collection") if they want the library to be 
    // indexing content for them. we add each of the collections we are being 
    // asked to manage to our library, and initialize it with sensible default
    // values.
    //
    app.modules.returnModulesRespondingTo("library-collection").forEach((m) => {
      this.addCollection(m.respondTo("library-collection"), this.app.wallet.returnPublicKey());
    });


  }


  returnServices() {
    let services = [];
    if (this.app.BROWSER == 0) { services.push({ service: "library", name: "Library" }); }
    return services;
  }
 

 
  //
  // runs when peer with library service connects
  //
  async onPeerServiceUp(app, peer, service = {}) {

    let library_self = app.modules.returnModule("Library"); 

    //
    // remote peer runs a library
    //
    if (service.service === "library") {

      //
      // fetch content for collections we are tracking
      //
      for (let m of library_self.collections) {

	//
	// we want to know what content is indexed for collection with specified name
	//
        let message = {};
            message.request = "library collection";
            message.data = {};
            message.data.collection = m.name;

	//
	// send the request and fetch the peer collection
	//
        app.network.sendRequestAsTransactionWithCallback(message.request, message.data, (res) => {
          if (res.length > 0) {
	    library_self.library[m.collection].peers[peer.returnPublicKey()] = res;  // res = collection
	  }
        }, peer);
      }
    }
  }



  async handlePeerTransaction(app, tx=null, peer, mycallback) {

    if (tx == null) { return; }
    let message = tx.returnMessage();

    //
    // respond to requests for our local collection
    //
    if (message.request === "library collection") {
      if (!message.data) { return; }
      if (!message.data.collection) { return; }
      if (!this.library[message.data.collection].peers[this.app.wallet.returnPublicKey()]) {return; }
      if (mycallback) { mycallback(this.library[message.data.collection].peers[this.app.wallet.returnPublicKey()]); }
      return;
    }

    super.handlePeerTransaction(app, tx, peer, mycallback);
  }


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


  returnItem(collection, publickey, sig, mycallback) {

    //
    // get index of item
    //
    let idx = -1;
    for (let i = 0; i < this.library[collection].peers[this.app.wallet.returnPublicKey()].length; i++) {
      if (this.library[collection].peers[this.app.wallet.returnPublicKey()][i].sig === sig) {
        idx = i;
        break;
      }
    }

    if (idx != -1) {

      //
      // find the item
      //
      let item = this.library[collection].peers[publickey][idx];

      //
      // is it checked out ?
      //
      let is_already_borrowed = 0;
      let is_already_borrowed_idx = -1;
      for (let i = 0; i < item.checkout.length; i++) {
        if (item.checkout[i].publickey === publickey) {
	  item.checkout[i].ts = new Date().getTime();
          is_already_borrowed_idx = i;
	}
      }

      //
      // the one condition we permit re-borrowing is if this user is the 
      // one who has borrowed the item previously and has it in their
      // possession. in that case they have simply rebooted their 
      // machine and should be provided with the data under the previous
      // loan.
      //
      // this "unsets" the loan so that it can be reset with the passing
      // through of control to the !is_already_borrowed sanity check.
      //
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
    }
  }


  checkoutItem(collection, publickey, sig, mycallback) {

    //
    // if the collection doesn't exist, we cannot lend
    //
    if (!this.library[collection]) { return; }

    //
    // get index of item
    //
    let idx = -1;
    for (let i = 0; i < this.library[collection].peers[this.app.wallet.returnPublicKey()].length; i++) {
      if (this.library[collection].peers[this.app.wallet.returnPublicKey()][i].sig === sig) {
        idx = i;
        break;
      }
    }

    //
    // if the item exists
    //
    if (idx != -1) {

      //
      // grab the item
      //
      let item = this.library[collection].peers[publickey][idx];

      //
      // is it checked out ?
      //
      let is_already_borrowed = 0;
      let is_already_borrowed_idx = -1;
      for (let i = 0; i < item.checkout.length; i++) {
        if (item.checkout[i].publickey === publickey) {
	  item.checkout[i].ts = new Date().getTime();
          is_already_borrowed_idx = i;
	}
      }

      //
      // the one condition we permit re-borrowing is if this user is the 
      // one who has borrowed the item previously and has it in their
      // possession. in that case they have simply rebooted their 
      // machine and should be provided with the data under the previous
      // loan.
      //
      // this "unsets" the loan so that it can be reset with the passing
      // through of control to the !is_already_borrowed sanity check.
      //
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

      //
      // now we can permit the checkout
      //
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
        this.app.storage.loadTransactions({ sig : sig }, mycallback);
      }
    }
  }

}

module.exports = Library;

