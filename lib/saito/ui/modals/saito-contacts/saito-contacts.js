const SaitoContactsTemplate = require("./saito-contacts.template");
const SaitoOverlay = require("./../../saito-overlay/saito-overlay");

class SaitoContacts {

	constructor(app, mod, multi_select = false){
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, mod);
		this.multi_select = multi_select;
	}

	render(){
		if (!document.getElementById("saito-contacts-modal")){
			this.overlay.show(SaitoContactsTemplate(this.app, this));
		}else{
			this.app.browser.replaceElementById(SaitoContactsTemplate(this.app, this), "saito-contacts-modal");
		}

		this.attachEvents();
	}

	attachEvents(){

		if (this.multi_select){
			Array.from(document.querySelectorAll(".saito-contact")).forEach(contact => {
				contact.onclick = (e) => {
					e.stopPropagation();
					
					//Clicking the input toggles it too, so don't double toggle
					if (e.target.tagName.toUpperCase() == "INPUT") {
						return;
					}

					let checkbox = e.currentTarget.querySelector("input");

					if (checkbox){
						checkbox.checked = !checkbox.checked;
					}
				}
			});


			let submitBtn = document.querySelector("#saito-contact-submit");
			if (submitBtn){
				submitBtn.onclick = (e) => {
					let selected = [];
					document.querySelectorAll(".saito-contact input").forEach(checkbox => {
						if (checkbox.checked){
							selected.push(checkbox.dataset.id);
						}
					});
					if (this.callback){
						this.callback(selected);
					}
					this.overlay.remove();
				}
			}
		}else{
			document.querySelectorAll(".saito-contact").forEach(contact => {
				contact.onclick = (e) => {
					if (this.callback){
						this.callback(e.currentTarget.dataset.id);
					}
					this.overlay.remove();
				}
			})
		}

	}
}

module.exports = SaitoContacts;