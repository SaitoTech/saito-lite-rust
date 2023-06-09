const SaitoInputTemplate = require("./saito-input.template");
const SaitoInputSelectionBox = require("./saito-input-selection-box.template");
const SaitoLoader = require("./../saito-loader/saito-loader");

class SaitoInput {
	constructor(app, mod, container = ""){
		this.app = app;
		this.mod = mod;
		this.container = container;
		this.loader = new SaitoLoader(app, mod, ".photo-window");
		this.callbackOnReturn = null;
	}

	render(){
		//Need Unique ids

		if (!this.num){
			this.num = Array.from(document.querySelectorAll(".saito-input")).length;
		}

		if (!document.getElementById(`saito-input${this.num}`)){
			this.app.browser.prependElementToSelector(SaitoInputTemplate(this.num), this.container);
		}

		this.attachEvents();
	}

	attachEvents(){
		let input_icon = document.querySelector(`#saito-input${this.num} .saito-emoji`);

		if (input_icon) {
			input_icon.onclick = (e) => {
				e.stopPropagation();
				if (document.querySelector(".saito-input-selection-box")){
					this.removeSelectionBox();
				}else{
					this.insertSelectionBox();
				}
			}
		}

 		let msg_input = document.querySelector(`#saito-input${this.num} .text-input`);
 		if (msg_input){
 			msg_input.onkeydown = (e) => {
	          if ((e.which == 13 || e.keyCode == 13) && !e.shiftKey) {
	          	e.preventDefault();
	          	if (this.callbackOnReturn){
	          	   this.callbackOnReturn(this.getInput());
	          	}
	          }
	        };	
 		}

	}

	getInput(){
		let inputBox = document.querySelector(`saito-input${this.num} .text-input`);
		if (inputBox){
			return inputBox.innerHTML;
		}
		return "";
	}

	setInput(text){
		let inputBox = document.querySelector(`saito-input${this.num} .text-input`);
		if (inputBox){
			inputBox.innerHTML = sanitize(text);
		}
	}

	focus(){
		let inputBox = document.querySelector(`saito-input${this.num} .text-input`);
		if (inputBox){
			inputBox.focus();
		}
	}

	removeSelectionBox(){
		if (document.querySelector(".saito-input-selection-box")){
			document.querySelector(".saito-input-selection-box").remove();
			document.onclick = null;
		}
	}

	insertSelectionBox(){
		if (!document.querySelector(".saito-input-selection-box")){

			let si = document.getElementById(`saito-input${this.num}`);
			let reference = si.getBoundingClientRect();

			this.app.browser.addElementToDom(SaitoInputSelectionBox(reference.top, reference.left));
            
            let picker = document.querySelector("emoji-picker");
	          
	        if (picker){
	          
	            picker.addEventListener("emoji-click", (event) => {
	              let emoji = event.detail;
	              var input = document.getElementById("text-input");
	              if (input.value) {
	                input.value += emoji.unicode;
	              } else {
	                input.textContent += emoji.unicode;
	              }
	            });
	        }
	        
	        // close selection box by clicking outside
	        document.onclick = (e) => {
	          if (!document.querySelector(".saito-input-selection-box").contains(e.target)){
	          	this.removeSelectionBox();
	          }
	        };
	        
	        //Switch between tabs
	        Array.from(document.querySelectorAll(".saito-box-tab")).forEach(tab => {
	        	tab.onclick = (e) => {
	        		Array.from(document.querySelectorAll(".active-tab")).forEach(tab2 => {
	        			tab2.classList.remove("active-tab");
	        		});
	        		let selected_tab = e.currentTarget.getAttribute("id").replace("tab", "window");

	        		if (document.getElementById(selected_tab)){
	        			document.getElementById(selected_tab).classList.add("active-tab");
	        		}

	        	}
	        });

	        //Add photo loading functionality to this selection-box
	 		this.app.browser.addDragAndDropFileUploadToElement(`photo-window`, async (filesrc) => {
	 			document.querySelector(".photo-window").innerHTML = "";
	 			this.loader.render();
	        	filesrc = await this.app.browser.resizeImg(filesrc); // (img, size, {dimensions})
	        	this.loader.remove();

		        let img = document.createElement('img');
		        img.classList.add('img-prev');
		        img.src = filesrc;
		        let msg = img.outerHTML;
		        if (this.callbackOnReturn){
		        	this.callbackOnReturn(msg);
		        }
		        this.removeSelectionBox();
		    });


	 		//Insert Giphy page
	 	    let gif_mod = this.app.modules.respondTo("giphy");
		    let gif_function = (gif_mod?.length > 0) ? gif_mod[0].respondTo("giphy") : null;
		    if (gif_function) {
		      gif_function.renderInto("#gif-window", function (gif_source) { 
			        let img = document.createElement('img');
			        img.classList.add('img-prev');
			        img.src = gif_source;
			        let msg = img.outerHTML;
			        if (this.callbackOnReturn){
			        	this.callbackOnReturn(msg);
			        }
		      		this.removeSelectionBox();
		      });
		    }

		}

	}

}

module.exports = SaitoInput;
