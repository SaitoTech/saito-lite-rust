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
	  if (collection[i].num == 0) { status = "loaned out"; }

	  if (collection[i].title != "") {
	    if (header_inserted == false) {
	      app.browser.addElementToSelector(`<div id="nwasm-libraries-header" class="saito-table-row saito-table-header nwasm-libraries-header"><div>title</div><div>copies</div><div>status</div></div>`, ".nwasm-libraries");
	      header_inserted = true;
	    }
	    app.browser.addElementToSelector(`<div id="${collection[i].sig}" data-id="${key}" class="saito-table-row"><div>${collection[i].title}</div><div>${collection[i].num}</div><div>${status}</div></div>`, ".nwasm-libraries");
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
		  library_mod.checkout(collection, sig, this.app.wallet.returnPublicKey(), function(txs) {
console.log("======== RECEIVED TX BACK! ======");
console.log("======== RECEIVED TX BACK! ======");
console.log("======== RECEIVED TX BACK! ======");
		    alert("Playing your game.");
	          });

		} else {
		  alert("Requesting permission to play.");
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

