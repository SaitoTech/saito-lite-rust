const SaitoProfileTemplate = require('./saito-profile.template');

class SaitoProfile {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = container;
		
		this.tab_container;

		this.publicKey = null; //Always set externally...

		app.connection.on('profile-update-dom', (publicKey, data) => {

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
					element.textContent = description;
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

		this.active_tab = active_tab;
		this.menu = {};
		for (let t of tabs){
			this.menu[t] = [];
		}
		this.publicKey = publicKey;

		delete this.description;
		delete this.name;

		this.ordinal = 0;
	}

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

		if (document.querySelector(myqs)) {
			this.app.browser.replaceElementBySelector(
				SaitoProfileTemplate(this.app, this.mod, this),
				myqs
			);
		} else {
			this.app.browser.prependElementToSelector(
				SaitoProfileTemplate(this.app, this.mod, this),
				this.container
			);
		}

		// send an event to profile mod
		this.app.connection.emit(
			'profile-fetch-content-and-update-dom',
			this.publicKey
		);

		this.renderMenuTabs();

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

		if (document.querySelector(`#saito-profile${this.ordinal} .saito-banner-edit`)) {
			document.querySelector(`#saito-profile${this.ordinal} .saito-banner-edit`).onclick = async (
				e
			) => {
				this.app.connection.emit('profile-edit-banner');
			};
		}
		if (document.querySelector(`#saito-profile${this.ordinal} .saito-profile-description.can-edit`)) {
			document.querySelector(`#saito-profile${this.ordinal} .saito-profile-description.can-edit`).onclick = async (
				e
			) => {
				this.app.connection.emit(
					'profile-edit-description',
					this.publicKey
				);
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
