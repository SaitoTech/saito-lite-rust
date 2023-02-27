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

//console.log("---------------------");
//console.log("---------------------");
//console.log("IN LIBRARY ON SAVE TX");
//console.log("---------------------");
//console.log("---------------------");

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

