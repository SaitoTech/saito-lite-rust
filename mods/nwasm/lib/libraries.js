const saito = require('./../../../lib/saito/saito');
const JSON = require('json-bigint');
const NwasmLibraryTemplate = require("./libraries.template");


class NwasmLibrary {

  constructor(app, mod = null, selector = "") {
    this.app = app;
    this.mod = mod;
  }

  render(app, mod, selector = "") {

    //
    // main container
    //
    app.browser.replaceElementById(NwasmLibraryTemplate(app, mod), "nwasm-libraries");

    //
    // libraries
    //
    try {
      let header_inserted = false;
      for (let key in mod.libraries) {
        let collection = mod.libraries[key];
        for (let i = 0; i < collection.length; i++) {

	  let status = "available";
	  let available = collection[i].available;;
	  if (available == 0) {
	    status = "loaned out";
	  } else {
	    available = available.toString() + "/" + collection[i].num.toString();
          }

	  if (collection[i].title != "") {
	    if (header_inserted == false) {
	      app.browser.addElementToSelector(`<div id="nwasm-libraries-header" class="saito-table-row saito-table-header nwasm-libraries-header"><div>title</div><div>copies</div><div>status</div></div>`, ".nwasm-libraries");
	      header_inserted = true;
	    }
	    app.browser.addElementToSelector(`<div id="${collection[i].sig}" data-id="${key}" class="saito-table-row"><div>${collection[i].title}</div><div>${available}</div><div>${status}</div></div>`, ".nwasm-libraries");
	  }
	}
      }
    } catch (err) {
console.log("Error showing libraries in NwasmLibrary... " + err);
    }

    this.attachEvents(app, mod);
  }

  attachEvents(app, mod) {

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
		if (key === this.app.wallet.returnPublicKey()) {

		  let sig = obj.getAttribute("id");
		  let collection = obj.getAttribute("data-id");

alert("checking out game with sig: " + sig);
		  let library_mod = this.app.modules.returnModule("Library");
		  library_mod.checkout("Nwasm", sig, this.app.wallet.returnPublicKey(), function(txs) {
console.log("======== RECEIVED TX BACK! ======");
console.log("======== RECEIVED TX BACK! ======");
console.log("======== RECEIVED TX BACK! ======");
console.log("TXS: " + JSON.stringify(txs));

		    if (txs == null) {
alert("Cannot checkout item...");
		    }

		    if (txs.length > 0) {
		      try {
		        alert("Playing your game.");
		        let tx = new saito.default.transaction(txs[0].transaction);
console.log("TX READY TO SUBMIT: ");
		        mod.loadRomFile(tx);
		      } catch (err) {
		        console.log("ERROR LOADING GAME: " + err);
		      }
		    } else {
		      alert("Error Checkout");
		    }
	          });

		} else {

		  alert("Requesting permission to play.");
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

        	  app.network.sendRequestWithCallback(message.request, message.data, function(res) {
console.log("======-----======");
console.log("======-----======");
console.log("======-----======");
console.log("received callback as: " + JSON.stringify(res));

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

