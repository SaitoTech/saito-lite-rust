const SaitoContactsTemplate = require('./saito-contacts.template');
const SaitoOverlay = require('./../../saito-overlay/saito-overlay');

class SaitoContacts {
	constructor(app, mod, multi_select = false) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, mod);
		this.multi_select = multi_select;
		this.title = "Contacts";
		this.multi_button = "Create Group";
	}

	async render(keys = null) {
		if (!document.getElementById('saito-contacts-modal')) {
			this.overlay.show(SaitoContactsTemplate(this.app, this, keys));
		} else {
			this.app.browser.replaceElementById(
				SaitoContactsTemplate(this.app, this, keys),
				'saito-contacts-modal'
			);
		}

		this.attachEvents();
	}

	attachEvents() {
		if (this.multi_select) {
			Array.from(document.querySelectorAll('#saito-contacts-modal .saito-contact')).forEach(
				(contact) => {
					contact.onclick = (e) => {
						e.stopPropagation();

						//Clicking the input toggles it too, so don't double toggle
						if (e.target.tagName.toUpperCase() == 'INPUT') {
							return;
						}

						let checkbox = e.currentTarget.querySelector('input');

						if (checkbox) {
							checkbox.checked = !checkbox.checked;
						}
					};
				}
			);

			let submitBtn = document.querySelector('#saito-contact-submit');
			if (submitBtn) {
				submitBtn.onclick = (e) => {
					let selected = [];
					document
						.querySelectorAll('.saito-contact input')
						.forEach((checkbox) => {
							if (checkbox.checked) {
								selected.push(checkbox.dataset.id);
							}
						});
					if (this.callback) {
						console.log("Run Call back on selected", selected);
						this.callback(selected);
					}
					this.overlay.remove();
				};
			}
		} else {
			document.querySelectorAll('#saito-contacts-modal .saito-contact').forEach((contact) => {
				contact.onclick = (e) => {
					this.overlay.remove();
					if (this.callback) {
						this.callback(e.currentTarget.dataset.id);
					}
				};
			});
		}
	}
}

module.exports = SaitoContacts;
