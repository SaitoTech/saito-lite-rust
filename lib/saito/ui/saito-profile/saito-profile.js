const SaitoProfileTemplate = require('./saito-profile.template');

class SaitoProfile {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = container;
		
		this.tab_container;

		this.publicKey = null; //Always set externally...

		app.connection.on('profile-update-dom', (publicKey, data) => {

			let { banner, description } = data;

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
		});


	}

	remove() {
		if (document.querySelector('.saito-profile')) {
			document.querySelector('.saito-profile').remove();
		}
	}

	reset(publicKey, active_tab = "", tabs = []) {
		this.active_tab = active_tab;
		this.menu = {};
		for (let t of tabs){
			this.menu[t] = [];
		}
		this.publicKey = publicKey;

		delete this.description;
		delete this.name;
	}

	render() {
		let myqs = '.saito-profile';

		if (!document.querySelector(myqs)) {
			this.app.browser.addElementToSelector(
				SaitoProfileTemplate(this.app, this.mod, this),
				this.container
			);
		} else {
			this.app.browser.replaceElementBySelector(
				SaitoProfileTemplate(this.app, this.mod, this),
				myqs
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
		let menu = document.querySelector(".saito-profile-menu");

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

					this.app.browser.addElementToSelector(html, ".saito-profile-menu");
				}
			}
		}

		this.renderTab();
		this.attachEvents();
	}

	attachEvents() {
		document
			.querySelectorAll('.saito-profile-tab')
			.forEach((el) => {
				el.onclick = (e) => {
					if (this.active_tab != e.currentTarget.dataset.id) {
						this.active_tab = e.currentTarget.dataset.id;
						this.renderMenuTabs();
					}
				};
			});

		if (document.querySelector('.saito-banner-edit')) {
			document.querySelector('.saito-banner-edit').onclick = async (
				e
			) => {
				this.app.connection.emit('profile-edit-banner');
			};
		}
		if (document.querySelector('.saito-profile-description.can-edit')) {
			document.querySelector('.saito-profile-description.can-edit').onclick = async (
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
