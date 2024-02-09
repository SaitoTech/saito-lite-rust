const SaitoInputSelectionBoxTemplate = require('./saito-input-selection-box.template');
const SaitoUser = require('./../saito-user/saito-user');

class SaitoInputSelectionBox {

	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = ""; // add straight to DOM
		this.is_visible = false;
		this.searchString = "";
		this.keylist = [];
	}

	hide() {

		this.is_visible = false;
		this.searchString = "";
		this.keylist = [];

		if (document.querySelector('.saito-input-selection-box')) {
			document.querySelector('.saito-input-selection-box').remove();
		}
	}

	render(obj={}) {

		this.is_visible = true;
		this.searchString = "";
		this.keylist = this.findKeyOrIdentifier(this.searchString);

		if (!document.querySelector(".saito-input-selection-box")) {
			this.app.browser.addElementToDom(SaitoInputSelectionBoxTemplate(obj));
		} else {
			this.hide();
			this.render(obj);
			return;
		}

		this.displayKeys(this.keylist);
	}

	displayKeys(keys=[]) {

        	let lst = document.querySelector(".saito-input-contact-list");
                if (lst) {
			lst.innerHTML = ""; 
                	for (let key of keys) {
                        	let x = new SaitoUser(this.app, this.mod, ".saito-input-selection-box .saito-input-contact-list", key.publicKey, "last seen on April 21");
                                x.render();
                        }
		}
	}

	attachEvents() {

	}

	processKeyDownEvents(e) {

        	if (e.key.length == 1) {
                	this.searchString += String.fromCharCode(e.keyCode);
                }

                // whitespace
                if (e.keyCode == 32) {
                	this.hide();
                        return;
                }

                //backspace
                if (e.keyCode == 8) {
                	if (this.searchString.length > 0) {
                        	this.searchString = this.searchString.substring(0, this.searchString.length - 1);
                        } else {
                                this.searchString = "";
                                this.hide();
                        }
                }

console.log("searching for: " + this.searchString);

                this.keylist = this.findKeyOrIdentifier(this.searchString);       
 	        if (this.keylist.length > 0) {

			//
			// refresh keylist
			//
			this.displayKeys(this.keylist);

                        // tab into list
                        //
                        if (e.keyCode == 9) {

                        	e.preventDefault();
                                e.stopImmediatePropagation();

                                let choices = document.querySelectorAll('.saito-input-contact-list .saito-user');
                                let index = 0;
                                choices[index].focus();

                                document.querySelector('.saito-input-contact-list').onkeydown = (e) => {

                                	if (e.keyCode == 38) {
                                                index = Math.max(--index, 0);
                                                e.stopImmediatePropagation();
                                                e.preventDefault();
                                        } else if (e.keyCode == 40) {
                                                index++;
                                                if (index >= choices.length) {
                                                	index = choices.length - 1;
                                                }
                                                e.stopImmediatePropagation();
                                        	e.preventDefault();
                                        }
                                        choices[index].focus();
                                };
                   	}

            	} else {
                	this.hide();
                }

	}



                        
        findKeyOrIdentifier(searchString="") {
               
		//
		// fetches ALL keys including from modules
		//
                let myKeys = this.app.keychain.returnKeys();
		let matchingKeys = [];

                for (let key of myKeys) {
                        let added = false;
                                
                        if (key?.publicKey) {
                                if (key.publicKey.toUpperCase().includes(searchString.toUpperCase())) {
                                        matchingKeys.push(key);
                                        added = true;
                                }
                        }

                        if (!added && key?.identifier) {
                                if (key.identifier.toUpperCase().includes(searchString.toUpperCase())) {
                                        matchingKeys.push(key);
                                }
                        }
                }       

                return matchingKeys;
        }

}
module.exports = SaitoInputSelectionBox;



