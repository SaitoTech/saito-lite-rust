const SaitoUserTemplate = require('./saito-user.template');

class SaitoUser {
	constructor(
		app,
		mod,
		container = '',
		publicKey = '',
		notice = '',
		fourthelem = ''
	) {
		this.app = app;
		this.mod = mod;
		this.publicKey = publicKey;
		this.notice = notice;
		this.fourthelem = fourthelem;
		this.container = container;
		this.extra_classes = "";
	}

	updateUserline(userline) {
		let qs =
			this.container + `> .saito-user-${this.publicKey} .saito-userline`;
		let elem = document.querySelector(qs);
		if (elem) {
			elem.innerHTML = userline;
			if (userline){
				elem.classList.remove("hidden");
			}else{
				elem.classList.add("hidden");
			}
		}
	}

	updateAddress(address) {
		let qs =
			this.container + `> .saito-user-${this.publicKey} .saito-address`;
		if (document.querySelector(qs)) {
			document.querySelector(qs).innerHTML = address;
		}
	}

	render() {
		let qs = this.container + `> .saito-user-${this.publicKey}`;

		if (document.querySelector(qs)) {
			this.app.browser.replaceElementBySelector(
				SaitoUserTemplate(this),
				qs
			);
		} else {
			this.app.browser.addElementToSelector(
				SaitoUserTemplate(this),
				this.container
			);
		}
	}

	attachEvents() {}
}

module.exports = SaitoUser;
