const LimboMenuTemplate = require('./menu.template');

class LimboMenu {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = container;

		app.connection.on("limbo-populated", ()=>{
			console.log("Update limbo menu"); 
			this.render();
		});
	}

	render() {

		let html = '';

		if (Object.keys(this.mod.dreams)?.length > 0){
			for (let key in this.mod.dreams){
				html += this.createStub(key, this.mod.dreams[key].members);
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

		let currentDream = (this.mod.dreamer === dreamer);
		let imgsrc = this.app.keychain.returnIdenticon(dreamer);

		return `<div class="saito-user dream ${currentDream?"active":""}" id="saito-user-${dreamer}" data-id="${dreamer}" data-disable="true">
					    <div class="saito-identicon-box">
					      <img class="saito-identicon" src="${imgsrc}" data-disable="true"/>
					    </div>
					    <div class="saito-address saito-address-long">
					    	<div class="saito-address" data-id="${dreamer}" data-disable="true">${dreamer}</div>
					    	${currentDream ? `<i class="fa-solid fa-volume-high"></i>` : ""}
					    </div>
					    <div class="saito-userline">${audience.length} listening</div>
					</div>`;

	}


	attachEvents() {

		let button = document.getElementById("new-space");
		if (button){
			button.onclick = async () => {
				this.mod.broadcastDream();
			}
		}

		let alt_button = document.getElementById("exit-space");
		if (alt_button){
			alt_button.onclick = async () => {
				if (this.mod.dreamer == this.mod.publicKey){
					await this.mod.sendKickTransaction();	
				}else{
					await this.mod.sendLeaveTransaction();	
				}
				
				this.mod.exitSpace();
			}
		}


		document.querySelectorAll("#spaces .saito-user.dream").forEach(element => {
			element.onclick = async (e) => {
				let dreamer = e.currentTarget.dataset.id;

				if (this.mod.dreamer){
					if (this.mod.dreamer !== dreamer){
						let c = await sconfirm("Leave current space to join new one?");
						if (c) {
							await this.mod.sendLeaveTransaction();
							this.mod.exitSpace();
							this.mod.joinDream(dreamer);
						}
					}else{
						let c = await sconfirm("Leave current space?");
						if (c) {
							await this.mod.sendLeaveTransaction();
							this.mod.exitSpace();
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
