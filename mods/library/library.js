const saito = require('../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');

//
// Library module is used to index material that I have saved in my own transaction
// archives for curation, personal use, and lending as legally permitted. It queries
// my peers for items they have indexed in the same collections, and fetches those 
// records on load.
//
// The module then provides abstract functionality permitting the borrowing and 
// lending of this content. Records are updated across the distributed system such
// that we can ensure compliance with US copyright law.
//
// Modules that wish to take advantage of the existence of the library should respondTo
// the "library-collection" to inform it that it should listen for collections of a 
// specific type of material. The library will then start indexing those materials and
// serving entries out to peers on request.
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

    //
    // contains both our collection and list of remote / indexable
    //
    // library['collection'].local <-- index of our items
    // library['collection'].peers <-- 
    //
    this.library = {};

    //
    // array of content our modules care about
    //
    this.monitor = [];

    //
    //
    //
    this.load();

    //
    // index transactions that are saved
    //
    app.connection.on("save-transaction", (tx) => {

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

      if (this.library[module]) {

	let idx = -1;
	let contains_item = false;

        for (let i = 0; i < this.library[module].length; i++) {
	  let item = this.library[module][i];
	  if (item.id == id) {
	    contains_item = true;
	    idx = i;
	    i = this.library[module].length+1;
	  }
	}

	//
	// add ROM or update library
	//
	for (let i = 0; i < this.monitor.length; i++) {
	  if (this.monitor[i].shouldArchive(request)) {

	    if (contains_item == false) {
	      this.library[module].local.push(
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
	      this.save();
	    } else {
	      try {
	        let c = confirm("Your library already contains a copy of this item. Is this a new copy?");
	        if (c) {
	          this.library[module][idx].num++;
	          this.library[module][idx].available++;
	          this.save();
	        }
	      } catch (err) {}
	    }
	  }
	}
      }
    });
  } 


  //
  // check which modules / libraries we care about
  //
  initialize(app) {

    //
    // modules tell us which content to monitor from peers, and which we 
    // index ourselves
    //
    app.modules.getRespondTos("library-collection").forEach((m) => {

      this.monitor.push(m.collection);
      if (!this.library[m.collection]) {

console.log(" > ");
console.log(" > added collection: " + m.collection);
console.log(" > ");

	this.library[m.collection] = {};
	this.library[m.collection].local = [];
	this.library[m.collection].peers = {};


	this.library[m.collection].local.push({
  		  id : "id" ,
		  title : "title" ,
		  description : "description" ,
		  num : 1 ,				// total
		  available : 1 ,			// total available
		  checkout : [] ,
		  sig : "sig"
        });

        this.save();
      } else {
	if (!this.library[m.collection].local) { this.library[m.collection].local = []; }
	if (!this.library[m.collection].peers) { this.library[m.collection].peers = {}; }
      }
    });

  }


  returnServices() {
    let services = [];
    if (this.app.BROWSER == 0) { services.push({ service: "library", name: "Multimedia Library" }); }
    return services;
  }
  

 
  //
  // runs when peer with library service connects
  //
  async onPeerServiceUp(app, peer, service = {}) {

    let library_self = app.modules.returnModule("Library"); 

    //
    // library -- let remote library know we are 
    // interested in their index of content for 
    // collections we monitor.
    //
    if (service.service === "library") {
      //
      // fetch
      //
      for (let collection of library_self.monitor) {

        let message = {};
            message.request = "library collection";
            message.data = {};
            message.data.collection = collection

console.log(" >> ");
console.log(" >> requesting: " + collection);
console.log(" >> ");

        app.network.sendRequestAsTransactionWithCallback(message.request, message.data, (res) => {
console.log("RETURNED: " + JSON.stringify(res));
          if (res.length > 0) {
console.log(" >>> ");
console.log(" >>> response: " + JSON.stringify(res));
console.log(" >>> ");

	    library_self.library[collection].peers[peer.returnPublicKey()] = res;  // res = collection
	  }
        }, peer);
      }
    }
  }




  async handlePeerTransaction(app, tx=null, peer, mycallback) {

    if (tx == null) { return; }
    let message = tx.returnMessage();

    if (message.request === "library collection") {

      if (!message.data) { return; }
      if (!message.data.collection) { return; }
      if (!this.library[message.data.collection].local) {return; }
      if (mycallback) { mycallback(this.library[message.data.collection].local); }
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



}

module.exports = Library;

