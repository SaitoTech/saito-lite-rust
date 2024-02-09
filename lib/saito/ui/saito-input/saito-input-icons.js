const SaitoInputIconsTemplate = require("./saito-input-icons.template");
const SaitoIputLegacySelectionBoxTemplate = require("./saito-input-legacy-selection-box.template");

class SaitoInputIcons {

	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = container;
	}

	hide() {
		if (document.querySelector(".saito-input-icons")) { document.querySelector(".saito-input-icons").remove(); }
	}

	render(input_self) {

		//
		// remove if exists
		//
		this.hide();

		//
		// and add
		//
		this.app.browser.addElementToSelector(SaitoInputIconsTemplate(input_self), this.container);

	}

	attachEvents(input_self) {

                Array.from(document.querySelectorAll('.saito-box-tab')).forEach(
                        (tab) => {

                                tab.onclick = (e) => {
                                        e.stopPropagation();

                                        let selected_tab = e.currentTarget.getAttribute('id');

                                        this.removeSelectionBox();
                                        this.app.browser.addElementToDom(SaitoInputLegacySelectionBoxTemplate(this));;


                                        // close selection box by clicking outside
                                        document.onclick = (event) => {
                                                if (!document.querySelector('.saito-input-selection-box').contains(event.target)) {
                                                        this.removeSelectionBox();
                                                }
                                        };

                                        if (selected_tab == "emoji-tab") {
                                                this.addEmojiEvent();
                                        }
                                        if (selected_tab == "photo-tab") {
                                                this.addPhotoEvent();
                                        }
                                        if (selected_tab == "gif-tab") {
                                                this.addGiphyEvent();
                                        }
                                        if (selected_tab == "at-tab") {
                                                this.addAtEvent();
                                        }

                                };
                        }
                );


	}


                                
        removeSelectionBox() {  
                if (document.querySelector('.saito-input-selection-box')) {
                        document.querySelector('.saito-input-selection-box').remove();
                }                               
                document.onclick = null;        
        }       


                                       
        addEmojiEvent() {                                               
                let picker = document.querySelector('emoji-picker'); 
                                                        
                if (picker) {                                   
                        //Insert emoji-window back into window          
                        let container = document.getElementById('emoji-window');
                        if (container) {                                
                                container.append(picker);               
                        }                               
                                                
                        //Make sure we only add event listener once (because we keep the emoji-picker in DOM)
                        if (!this.emoji_event_added) {  
                                picker.addEventListener('emoji-click', (event) => {
                                        let emoji = event.detail;
                                        var input = document.querySelector(
                                                `${this.container} .saito-input .text-input`
                                        );      
                                        if (input.value) {
                                                input.value += emoji.unicode;
                                        } else {
                                                input.innerHTML += emoji.unicode;
                                        }

                                        if (this.display == 'large') {
                                                this.removeSelectionBox();
                                        } else {
                                                //this.focus(true);
                                        }
                                });
                                this.emoji_event_added = true;
                        }

                        //Add focus to search bar
                        let search_bar = picker.shadowRoot.querySelector('input.search');
                        if (search_bar) {
                                if (!this.app.browser.isMobileBrowser()) {
                                        search_bar.focus({ focusVisible: true });
                                }
                        }
                }
        }



        async addGiphyEvent() {
                //Insert Giphy page
                if (this.giphy_rendered) {
                        return;
                }

                let gif_mod = this.app.modules.respondTo('giphy');
                let gif_function =
                        gif_mod?.length > 0 ? gif_mod[0].respondTo('giphy') : null;
                if (gif_function) {
                        gif_function.renderInto('#gif-window', (gif_source) => {
                                if (this.callbackOnUpload) {
                                        this.callbackOnUpload(gif_source);
                                } else if (this.callbackOnReturn) {
                                        this.callbackOnReturn(gif_source);
                                }
                                this.removeSelectionBox();
                        });
                        this.giphy_rendered = true;
                }
        }


        async addAtEvent() {

                //
                // update keylist
                //
                let keys = this.app.keychain.returnKeys();
                let lst = document.querySelector(".saito-input-contact-list");
                if (lst) {
                        lst.innerHTML = "";
                        for (let key of keys) {
                                let x = new SaitoUser(this.app, this.mod, ".saito-input-selection-box .saito-input-contact-list", key.publicKey, "last seen on April 21");
                                x.render();
                        }
                }


                // Make sure this also works through typing ... close selection box by clicking outside
                document.onclick = (e) => {
                        if (document.querySelector('.saito-input-selection-box')) {
                                if (
                                        !document
                                                .querySelector('.saito-input-selection-box')
                                                .contains(e.target)
                                ) {
                                        this.removeSelectionBox();
                                }
                        }
                };

                if (document.getElementById('saito-mention-search-bar')) {
                        document.getElementById('saito-mention-search-bar').focus();
                        document.getElementById('saito-mention-search-bar').oninput = (e) => {
                                this.searchString = e.currentTarget.value.toUpperCase();
                                let lst = document.querySelector(".saito-input-contact-list");
                                if (lst) { lst.innerHTML = ""; }
                                let keys = this.findKeyOrIdentifier();
console.log("search for : " + this.searchString + " -- updated to nothing: " + keys.length);
                                for (let key of keys) {
                                        let x = new SaitoUser(this.app, this.mod, ".saito-input-contact-list", key.publicKey, "last seen on April 24");
                                        x.render();
                                }
                        };
                }
        }

                     
        addPhotoEvent() {               
                //Add photo loading functionality to this selection-box
                this.app.browser.addDragAndDropFileUploadToElement(
                        `photo-window`,
                        async (filesrc) => {
                                document.querySelector('.photo-window').innerHTML = '';
                                this.loader.render();
                                filesrc = await this.app.browser.resizeImg(filesrc); // (img, size, {dimensions})
                                this.loader.remove();
                        
                                if (this.callbackOnUpload) {
                                        this.callbackOnUpload(filesrc);
                                } else if (this.callbackOnReturn) {
                                        this.callbackOnReturn(filesrc);
                                }
                                this.removeSelectionBox();
                        }
                );              
        }

 
}

module.exports = SaitoInputIcons;

