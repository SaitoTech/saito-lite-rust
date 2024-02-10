const SaitoInputIconsTemplate = require("./saito-input-icons.template");
const SaitoInputPanel = require("./saito-input-panel");

class SaitoInputIcons {

	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = container;
		this.panel = new SaitoInputPanel(app, mod);
	}

	hide() {
		// HACK - make sure emoji picker sticks around
		this.hideEmojiPicker();
		this.panel.hide();
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

					this.panel.hide();
					this.panel.render(input_self);

					// close selection box by clicking outside
					document.onclick = (e) => {
						if (
							!document
								.querySelector('.saito-input-selection-box')
								.contains(e.target)
						) {
								this.panel.hide();
						}
					};

                                        if (selected_tab == "emoji-tab") {
                                                this.showEmojiPanel();
                                        }
                                        if (selected_tab == "photo-tab") {
                                                this.showPhotoPanel();
                                        }
                                        if (selected_tab == "gif-tab") {
                                                this.showGiphyPanel();
                                        }
                                        if (selected_tab == "at-tab") {
//                                                this.showAtPanel();
                                        }

                                };
                        }
                );


	}


                                       
        showEmojiPanel() {
                               
                let picker = document.querySelector('emoji-picker'); 
                if (picker) {                                   

			//
			// make it visible
			//
			picker.style.display = "block";
		
			//
                        // insert emoji-window back into window          
			//
                        let container = document.querySelector('.saito-input-panel');
                        if (container) { container.append(picker); }               
                                                
			//
                        // make sure we only add event listener once (because we keep the emoji-picker in DOM)
			//
                        if (!this.emoji_event_added) {  
                                picker.addEventListener('emoji-click', (event) => {
                                        let emoji = event.detail;
                                        var input = document.querySelector(`.saito-input .text-input`);      
                                        if (input.value) {
						input.value += emoji.unicode;
                                        } else {
                                                input.innerHTML += emoji.unicode;
                                        }
			        	this.hideEmojiPicker();
					this.panel.hide();
                                });
                                this.emoji_event_added = true;
                        }

			//
                        // add focus to search bar
			//
                        let search_bar = picker.shadowRoot.querySelector('input.search');
                        if (search_bar) {
                                if (!this.app.browser.isMobileBrowser()) {
                                        search_bar.focus({ focusVisible: true });
                                }
                        }
                }
        }

	hideEmojiPicker() {
		if (document.querySelector('.saito-input-panel emoji-picker')) { 
			document.querySelector('emoji-picker').style.display = "none";
			document.body.append(document.querySelector('emoji-picker')); 
		}
	}


        async showGiphyPanel() {

                //Insert Giphy page
                if (this.giphy_rendered) {
alert("giphy is already rendered...");
                        return;
                }

if (document.querySelector('#saito-input-panel')) {
  alert("READY FOR GIFFY");
}





                let gif_mod = this.app.modules.respondTo('giphy');
                let gif_function = gif_mod?.length > 0 ? gif_mod[0].respondTo('giphy') : null;
                if (gif_function) {
                        gif_function.renderInto(
				'#saito-input-panel',
				(gif_source) => {
                                	if (this.callbackOnUpload) {
                                        	this.callbackOnUpload(gif_source);
                                	} else if (this.callbackOnReturn) {
                                        	this.callbackOnReturn(gif_source);
                                	}
                                this.panel.hide();
                        });
                        this.giphy_rendered = true;
                }
        }


        async showAtPanel() {

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

                     
        showPhotoPanel() {               
                //Add photo loading functionality to this selection-box

document.querySelector('#saito-input-panel').innerHTML = `<div style="
    position: absolute;
    margin: auto;
    padding: 4rem;
    width: 100%;
    height: 100%;
    text-align: center;
    align-items: center;
    display: flex;
    font-size: 3rem;
    color: var(--saito-font-color);
" class="">drag and drop an image or click and select one to upload</div>`;

                this.app.browser.addDragAndDropFileUploadToElement(
                        `saito-input-panel`,
                        async (filesrc) => {
                                this.loader.render();
                                filesrc = await this.app.browser.resizeImg(filesrc); // (img, size, {dimensions})
                                this.loader.remove();
                        
                                if (this.callbackOnUpload) {
                                        this.callbackOnUpload(filesrc);
                                } else if (this.callbackOnReturn) {
                                        this.callbackOnReturn(filesrc);
                                }
				this.panel.hide();
                        }
                );              
        }

 
}

module.exports = SaitoInputIcons;

