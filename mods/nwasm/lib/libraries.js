const saito = require('./../../../lib/saito/saito');
const JSON = require('json-bigint');
const NwasmLibraryTemplate = require("./libraries.template");
const LoadRom = require("./load-rom");


class NwasmLibrary {

  constructor(app, mod = null, selector = "") {
    this.app = app;
    this.mod = mod;
    this.loader = new LoadRom(app, mod);
  }

  render(app, mod, selector = "") {

    //
    // main container
    //
    app.browser.replaceElementById(NwasmLibraryTemplate(this.app, this.mod), "nwasm-libraries");

    //
    // libraries
    //
    try {
      let header_inserted = false;
      for (let key in mod.libraries) {
        let collection = mod.libraries[key];
        for (let i = 0; i < collection.length; i++) {

	  let status = "available";
	  let available = collection[i].available;
	  if (available == 0) {
	    status = "loaned out";
	  } else {
	    available = available.toString() + "/" + collection[i].num.toString();
          }

	  if (collection[i].title != "") {
	    if (header_inserted == false) {
	      this.app.browser.addElementToSelector(`<div id="nwasm-libraries-header" class="saito-table-row saito-table-header nwasm-libraries-header"><div class="nwasm-lib-title">title</div><div class="nwasm-lib-copies">copies</div><div class="nwasm-lib-status">status</div></div>`, ".nwasm-libraries");
	      header_inserted = true;
	    }
	    this.app.browser.addElementToSelector(`<div id="${collection[i].sig}" data-id="${key}" class="saito-table-row"><div class="nwasm-lib-title">${collection[i].title}</div><div class="nwasm-lib-copies">${available}</div><div class="nwasm-lib-status">${status}</div></div>`, ".nwasm-libraries");
	  }
	}
      }
    } catch (err) {
console.log("Error showing libraries in NwasmLibrary... " + err);
    }

    this.attachEvents(app, mod);
  }

  attachEvents(app, mod) {

    let lib_self = this;

    try {

      for (let key in mod.libraries) {

        let collection = mod.libraries[key];
        for (let i = 0; i < collection.length; i++) {

	  let status = "available";
	  if (collection[i].num == 0) { status = "loaned out"; }

	  let obj = document.getElementById(collection[i].sig);

	  if (obj) {
	    if (status !== "available") {
	      obj.onclick = (e) => {
		if (key === this.app.wallet.returnPublicKey()) {
		  alert("Your title is out on loan. Please try again in a few hours.");
		} else {
		  alert("This title is not available for play currently.");
	        }
	      }
	    } else {
	      obj.onclick = (e) => {

		//
		// show loader
		//
		this.loader.render();

		if (key === this.app.wallet.returnPublicKey()) {

		  let sig = obj.getAttribute("id");
		  let collection = obj.getAttribute("data-id");

		  let library_mod = this.app.modules.returnModule("Library");
		  library_mod.checkout("Nwasm", sig, this.app.wallet.returnPublicKey(), function(txs) {

		    if (txs == null) {
		      alert("Cannot checkout item...");
		      return;
		    }

		    if (txs.length > 0) {
		      try {
		        let tx = new saito.default.transaction(txs[0].transaction);
			mod.hideLibrary();
			lib_self.loader.overlay.hide();
		        mod.loadRomFile(tx);
		      } catch (err) {
		        console.log("Error downloading and decrypting: " + err);
		      }
		    } else {
		      console.log("ERROR TXS LIBRARY: " + JSON.stringify(txs));
		      alert("Error - is network down?");
		    }
	          });

		} else {

		  let nwasm_mod = mod;
	          let message = {};
	              message.request = "library collection";
        	      message.data = {};
     	              message.data.collection = "Nwasm";
     	              message.data.sig = sig;

		  let peer = null;
		  for (let i = 0; i < app.network.peers.length; i++) {

		    //
		    // libraries organized by publickey
		    //
		    if (app.network.peers[i].returnPublicKey() === key) {
		      let peer = app.network.peers[i];
		      i = app.network.peers.length + 100; // buffer against connect/disconnect
		    }
		  }

        	  app.network.sendRequestAsTransactionWithCallback(message.request, message.data, function(res) {
                  }, peer);
	        }
	      }
	    }
	  }
        }
      }
    } catch (err) {

console.log("Error attaching events to libraries in NwasmLibrary... " + err);

    }
  }

}


module.exports = NwasmLibrary;

