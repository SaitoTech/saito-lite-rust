const LimboMenuTemplate = require('./menu.template');

class LimboMenu {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = container;

		app.connection.on("limbo-populated", ()=>{ 
			this.render();
		});
	}

	render() {

		let html = '';

		if (Object.keys(this.mod.dreams)?.length > 0){
			for (let key in this.mod.dreams){
				html += this.createStub(key, this.mod.dreams[key]);
			}
		}


		if (document.getElementById('limbo-menu')) {
			this.app.browser.replaceElementById(
				LimboMenuTemplate(this.app, this.mod),
				'limbo-menu'
			);
		} else {
			this.app.browser.addElementToSelector(
				LimboMenuTemplate(this.app, this.mod),
				this.container
			);
		}

		this.app.browser.addElementToId(html, "spaces");

		this.attachEvents();
	}


	createStub(dreamer, audience){

		let imgsrc = this.app.keychain.returnIdenticon(dreamer);

		return `<div class="saito-user dream" id="saito-user-${dreamer}" data-id="${dreamer}" data-disable="true">
					    <div class="saito-identicon-box">
					      <img class="saito-identicon" src="${imgsrc}" data-disable="true"/>
					    </div>
					    <div class="saito-address" data-id="${dreamer}" data-disable="true">${dreamer}</div>
					    <div class="saito-userline">${audience.length} listening</div>
					</div>`;

	}


	attachEvents() {

		let button = document.getElementById("new-space");
		if (button){
			button.onclick = () => {
				this.mod.exitSpace();
				this.mod.broadcastDream();
			}
		}

		let alt_button = document.getElementById("exit-space");
		if (alt_button){
			alt_button.onclick = () => {
				this.mod.sendKickTransaction();
				this.mod.stop();
			}
		}


		document.querySelectorAll("#spaces .saito-user.dream").forEach(element => {
			element.onclick = async (e) => {
				let dreamer = e.currentTarget.datatset.id;

				if (this.dreamer){
					if (this.dreamer !== dreamer){
						let c = await sconfirm("Leave current space?");
						if (c) {
							this.mod.exitSpace();
							this.mod.joinDream(dreamer);
						}
					}
				}else{
					this.mod.joinDream(dreamer);
				}
			}
		});
	}
}

module.exports = LimboMenu;
