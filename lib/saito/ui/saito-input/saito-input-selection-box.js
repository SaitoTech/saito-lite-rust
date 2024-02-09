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
		this.keylist = this.findKeyOrIdentifier();

		if (!document.querySelector(".saito-input-selection-box")) {
			this.app.browser.addElementToDom(SaitoInputSelectionBoxTemplate(obj));
		}

		this.addKeys(this.keylist);
	}

	addKeys(keys=[]) {

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


                this.keylist = this.findKeyOrIdentifier();
                if (this.keylist.length > 0) {

			//
			// refresh keylist
			//
			this.addKeys(this.keylist);

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



                        
        findKeyOrIdentifier() {
                
                let myKeys = this.app.keychain.returnKeys();
                let matchingKeys = [];

                for (let key of myKeys) {
                        let added = false;
                                
                        if (key?.publicKey) {
                                if (key.publicKey.toUpperCase().includes(this.searchString)) {
                                        matchingKeys.push(key);
                                        added = true;
                                }
                        }

                        if (!added && key?.identifier) {
                                if (key.identifier.toUpperCase().includes(this.searchString)) {
                                        matchingKeys.push(key);
                                }
                        }
                }       

                //      
                //Fallback to cached registry
                //      
                this.app.modules
                        .getRespondTos('saito-return-key')
                        .forEach((modResponse) => {
                                //
                                // Return keys converts the publickey->identifer object into
                                // an array of {publicKey, identifier} objects
                                //
                                let pseudoKeyChain = modResponse.returnKeys();

                                for (let key of pseudoKeyChain) {
                                        let can_add = false;

                                        // Don't add myself
                                        if (key.publicKey == this.mod.publicKey) {
                                                continue;
                                        }

                                        // Check for partial match
                                        if (
                                                key.publicKey.toUpperCase().includes(this.searchString)
                                        ) {
                                                can_add = true;
                                        }


                                        if (
                                                key.identifier.toUpperCase().includes(this.searchString)
                                        ) {
                                                can_add = true;
                                        }

                                        // Make sure not already added from my actual keychain
                                        for (let added_keys of matchingKeys) {
                                                if (added_keys.publicKey == key.publicKey) {
                                                        can_add = false;
                                                        break;
                                                }
                                        }

                                        if (can_add) {
                                                matchingKeys.push(key);
                                        }
                                }
                        });

                return matchingKeys;
        }

}
module.exports = SaitoInputSelectionBox;



