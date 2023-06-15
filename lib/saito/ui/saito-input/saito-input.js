const SaitoInputTemplate = require("./saito-input.template");
const SaitoInputLargeTemplate = require("./saito-input-large.template");
const SaitoInputSelectionBox = require("./saito-input-selection-box.template");
const SaitoLoader = require("./../saito-loader/saito-loader");

class SaitoInput {

	constructor(app, mod, container = "") {
		this.app = app;
		this.mod = mod;
		this.container = container;
		this.loader = new SaitoLoader(app, mod, ".photo-window");
		this.callbackOnReturn = null;
		this.callbackOnUpload = null;
		this.display = "small";
		this.placeholder = "say something";
	}

	render() {
		//Need Unique ids -- based on unique container!

		if (!document.querySelector(this.container + " .saito-input")) {
			if (this.display == "small") {
				this.app.browser.prependElementToSelector(SaitoInputTemplate(this.placeholder), this.container);
				this.attachEvents();
			} else {
				this.app.browser.prependElementToSelector(
					SaitoInputLargeTemplate(this.placeholder),
					this.container
				);
				this.attachLargeEvents();
			}
		}

		this.focus();
	}

	attachEvents() {
		let input_icon = document.querySelector(`${this.container} .saito-input .saito-emoji`);

		if (input_icon) {
			input_icon.onclick = (e) => {
				e.stopPropagation();
				if (document.querySelector(".saito-input-selection-box")) {
					this.removeSelectionBox();
				} else {
					this.insertSelectionBox();
				}
			};
		}

		let msg_input = document.querySelector(`${this.container} .saito-input .text-input`);
		if (msg_input) {
			msg_input.onkeydown = (e) => {
				if ((e.which == 13 || e.keyCode == 13) && !e.shiftKey) {
					e.preventDefault();
					if (this.callbackOnReturn) {
						this.callbackOnReturn(this.getInput());
					}
				}
			};
		}
	}

	getInput() {
		let inputBox = document.querySelector(`${this.container} .saito-input .text-input`);
		if (inputBox) {
			return inputBox.innerHTML;
		}
		return "";
	}

	setInput(text) {
		let inputBox = document.querySelector(`${this.container} .saito-input .text-input`);
		if (inputBox) {
			inputBox.innerHTML = sanitize(text);
		}
		this.focus();
	}

	insertRange(text) {
		let inputBox = document.querySelector(`${this.container} .saito-input .text-input`);
		if (inputBox) {
			inputBox.innerHTML = sanitize(text);

			const range = document.createRange();
			var sel = window.getSelection();
			range.setStart(inputBox, 2);
			range.collapse(true);
			sel.removeAllRanges();
			sel.addRange(range);
		}
		this.focus();
	}

	focus(force = false) {
		let inputBox = document.querySelector(`${this.container} .saito-input .text-input`);
		if (inputBox) {
			if (force || !this.isOtherInputActive()){
				inputBox.focus();	
		  	    document.execCommand('selectAll', false, null);
      			document.getSelection().collapseToEnd();
			}
		}

	}

	/*
	TODO -- SelectionBox should probably be it's own component class with render and attachEvents and remove fucntions
	*/

	removeSelectionBox() {
		if (document.querySelector(".saito-input-selection-box")) {
			document.querySelector(".saito-input-selection-box").remove();
		}
		document.onclick = null;
		this.giphy_rendered = false;
		this.focus();
	}

	attachLargeEvents() {
		//Switch between tabs
		let open_tab = "";

		Array.from(document.querySelectorAll(".saito-box-tab")).forEach((tab) => {
			tab.onclick = (e) => {
				e.stopPropagation();
				let selected_tab = e.currentTarget.getAttribute("id").replace("tab", "window");

				this.removeSelectionBox();

				if (selected_tab == open_tab) {
					open_tab = "";
					return;
				}

				open_tab = selected_tab;

				let si = document.querySelector(`${this.container} .saito-input .selection-box-tabs`);
				let reference = si.getBoundingClientRect();

				this.app.browser.addElementToDom(
					SaitoInputSelectionBox(reference.top, reference.right, false)
				);

				// close selection box by clicking outside
				document.onclick = (event) => {
					if (!document.querySelector(".saito-input-selection-box").contains(event.target)) {
						this.removeSelectionBox();
					}
				};

				Array.from(document.querySelectorAll(".active-tab")).forEach((tab2) => {
					tab2.classList.remove("active-tab");
				});

				if (document.getElementById(selected_tab)) {
					document.getElementById(selected_tab).classList.add("active-tab");
				}

				switch (selected_tab) {
					case "emoji-window":
						this.addEmojiEvent();
						break;
					case "gif-window":
						this.addGiphyEvent();
						break;
					case "photo-window":
						this.addPhotoEvent();
						break;
					default:
				}
			};
		});
	}

	insertSelectionBox() {
		if (!document.querySelector(".saito-input-selection-box")) {
			let si = document.querySelector(`${this.container} .saito-input`);
			let reference = si.getBoundingClientRect();

			this.app.browser.addElementToDom(SaitoInputSelectionBox(reference.top, reference.left-1));

			//Switch between tabs
			Array.from(document.querySelectorAll(".saito-box-tab")).forEach((tab) => {
				tab.onclick = (e) => {
					Array.from(document.querySelectorAll(".active-tab")).forEach((tab2) => {
						tab2.classList.remove("active-tab");
					});
					let selected_tab = e.currentTarget.getAttribute("id").replace("tab", "window");

					if (document.getElementById(selected_tab)) {
						document.getElementById(selected_tab).classList.add("active-tab");
					}

					if (selected_tab === "gif-window"){
						this.addGiphyEvent();
					}
				};
			});

			// close selection box by clicking outside
			document.onclick = (e) => {
				if (!document.querySelector(".saito-input-selection-box").contains(e.target)) {
					this.removeSelectionBox();
				}
			};


			this.addEmojiEvent();

			this.addPhotoEvent();

			
		}
	}


	addPhotoEvent(){
		//Add photo loading functionality to this selection-box
		this.app.browser.addDragAndDropFileUploadToElement(`photo-window`, async (filesrc) => {
			document.querySelector(".photo-window").innerHTML = "";
			this.loader.render();
			filesrc = await this.app.browser.resizeImg(filesrc); // (img, size, {dimensions})
			this.loader.remove();

			if (this.callbackOnUpload){
				this.callbackOnUpload(filesrc);
			}else if (this.callbackOnReturn) {
				this.callbackOnReturn(filesrc);
			}
			this.removeSelectionBox();
		});

	}

	addEmojiEvent(){
		let picker = document.querySelector("emoji-picker");

		if (picker) {
			picker.addEventListener("emoji-click", (event) => {
				let emoji = event.detail;
				var input = document.querySelector(`${this.container} .saito-input .text-input`);
				if (input.value) {
					input.value += emoji.unicode;
				} else {
					input.textContent += emoji.unicode;
				}

				if (this.display == "large"){
					this.removeSelectionBox();
				}
			});
		}
	}

	addGiphyEvent(){
		//Insert Giphy page
		if (this.giphy_rendered){
			return;
		}

		let gif_mod = this.app.modules.respondTo("giphy");
		let gif_function = gif_mod?.length > 0 ? gif_mod[0].respondTo("giphy") : null;
		if (gif_function) {
			gif_function.renderInto("#gif-window", (gif_source) => {
				if (this.callbackOnUpload){
					this.callbackOnUpload(gif_source);
				}else if (this.callbackOnReturn) {
					this.callbackOnReturn(gif_source);
				}
				this.removeSelectionBox();
			});
			this.giphy_rendered = true;
		}

	}


	  //
  // Maybe needs improvement, but simple test to not rip away
  // focus from a ChatPopup if rendering a new Chatpopup
  //
  isOtherInputActive() {

    if (document.querySelector(".saito-input-selection-box")){
    	return 1;	
    }

    if (document.querySelector("emoji-picker")) {
      return 1;
    }

    let ae = document.activeElement;

    if (!ae) {
      return 0;
    }

    if (ae.tagName.toLowerCase() == "input" || ae.tagName.toLowerCase() == "textarea") {
      return 1;
    }

    if (ae.classList.contains("text-input")) {
      return 1;
    }


    return 0;
  }

}

module.exports = SaitoInput;
