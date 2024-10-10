const SaitoProfileTemplate = require('./saito-profile.template');
const SaitoOverlay = require('../saito-overlay/saito-overlay');

class SaitoProfile {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = container;
		this.tab_container;

		this.publicKey = null; //Always set externally...

		app.connection.on('profile-update-dom', (publicKey, data) => {

			if (!publicKey || !data){
				return;
			}
			
			console.log("PROFILE: update dom for ", publicKey);

			let { banner, description, image } = data;

			if (banner) {
				const qs = `.profile-banner-${publicKey}`;
				Array.from(document.querySelectorAll(qs)).forEach(element => {
					element.style.backgroundImage = `url('${banner}')`;
				});
			}
			if (description) {
				const qs = `.profile-description-${publicKey}`;
				Array.from(document.querySelectorAll(qs)).forEach(element => {
					element.innerHTML = this.app.browser.sanitize(description, true).replaceAll("\n", "<br>");
				});
			}
			if (image) {
				const qs = `.profile-image-${publicKey}`;
				Array.from(document.querySelectorAll(qs)).forEach(element => {
					element.src = profile.image;
				});
			}
		});


	}

	remove() {
		let myqs = `#saito-profile${this.ordinal}`;

		if (document.querySelector(myqs)) {
			document.querySelector(myqs).remove();
		}
	}

	reset(publicKey, active_tab = "", tabs = []) {
		//Make sure you remove it first!
		this.remove();

		if (!this.active_tab || !tabs.includes(this.active_tab)){
			this.active_tab = active_tab;
		}

		this.resetMenuTabs(tabs);

		this.publicKey = publicKey;

		delete this.description;
		delete this.name;
		delete this.mask_key;
		
		this.ordinal = 0;
	}


	// Just rerender tabs ... 
	render() {

		if (this.ordinal == 0) {
			let max = 0;
			Array.from(document.querySelectorAll('.saito-profile')).forEach(
				(ov) => {
					let temp = parseInt(ov.id.replace('saito-profile', ''));
					if (temp > max) {
						max = temp;
					}
				}
			);

			this.ordinal = max + 1;
		}


		let myqs = `#saito-profile${this.ordinal}`;
		let content = SaitoProfileTemplate(this.app, this.mod, this);

		console.log("Render -- " + myqs);

		if (document.querySelector(myqs)) {
			this.app.browser.replaceElementBySelector(content, myqs);
		} else if (this.container) {
			this.app.browser.prependElementToSelector(content, this.container);
		} else {
			this.app.browser.addElementToDom(content);
		}

		// send an event to profile mod
		this.app.connection.emit('profile-fetch-content-and-update-dom', this.publicKey);

		this.renderMenuTabs();

	}


	resetMenuTabs(tabs){
		this.menu = {};
		for (let t of tabs){
			this.menu[t] = [];
		}
	}

	renderMenuTabs(){

		let menu = document.querySelector(`#saito-profile${this.ordinal} .saito-profile-menu`);

		if (menu){
			
			menu.innerHTML = "";

			if (Object.keys(this.menu).length > 0){
				for (let i in this.menu){
					let class1 = (i == this.active_tab) ? " active" : "";
					let class2 = (this.menu[i].length > 0) ? "" : "hidden";
					let html = `<div class="saito-profile-tab${class1}" data-id="${i}">
									${i}
									<span class="${class2}"> (${this.menu[i].length})</span>
								</div>`;

					this.app.browser.addElementToSelector(html, `#saito-profile${this.ordinal} .saito-profile-menu`);
				}
			}
		}

		this.renderTab();
		this.attachEvents();
	}

	attachEvents() {

		if (this.tab_container){
			document
				.querySelectorAll(`#saito-profile${this.ordinal} .saito-profile-tab`)
				.forEach((el) => {
					el.onclick = (e) => {
						if (this.active_tab != e.currentTarget.dataset.id) {
							this.active_tab = e.currentTarget.dataset.id;
							this.renderMenuTabs();
						}
					};
				});
		}

		if (document.querySelector(`#saito-profile${this.ordinal} #saito-banner-edit`)) {
			document.querySelector(`#saito-profile${this.ordinal} #saito-banner-edit`).onclick = async (
				e
			) => {
				this.app.connection.emit('profile-edit-banner', this.publicKey);
			};
		}
		if (document.querySelector(`#saito-profile${this.ordinal} .saito-profile-description.can-edit`)) {
			document.querySelector(`#saito-profile${this.ordinal} .saito-profile-description.can-edit`).onclick = async (
				e
			) => {
				this.app.connection.emit('profile-edit-description', this.publicKey);
			};
		}

		if (document.querySelector(`#saito-profile${this.ordinal} #saito-profile-help`)){
			document.querySelector(`#saito-profile${this.ordinal} #saito-profile-help`).onclick = (e) => {
				let overlay = new SaitoOverlay(this.app, this.mod);

				let html = `<div class="saito-modal">
								<div class="saito-modal-title">Profile Editing</div>
								<div class="saito-profile-note">You have the private key for this profile in your keychain.</div> 
								<div class="saito-profile-note">You can edit it by opening importing that private key in a private browser 
									directed to saito.io/profile</div>
								</div>
							</div>`;
				overlay.show(html, () => {
					let localKey = this.app.keychain.returnKey(this.publicKey, true);
		  			if (localKey) {
		  				if (localKey?.privateKey) {
						    let obj = {
						    	publicKey: localKey.publicKey,
						    	privateKey: localKey.privateKey
						    }

						    let base64obj = this.app.crypto.stringToBase64(JSON.stringify(obj));
						    let link = window.location.origin + '/profile?load_key=' + base64obj;
						    navigator.clipboard.writeText(link);
		  					siteMessage("Private URL copied", 5000);
		  				}
		  			}
				});

			};
		}
	}


	renderTab(){

		if (this.tab_container){
			if (document.querySelector(this.tab_container)){
				document.querySelector(this.tab_container).innerHTML = "";
			}

			if (this.active_tab && this.menu[this.active_tab]) {
				for (let p of this.menu[this.active_tab]){
					p.render();
				}
			}
		}
	}

}

module.exports = SaitoProfile;
