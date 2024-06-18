const JSON = require('json-bigint');
const LimboMainTemplate = require('./main.template');
const LimboSidebar = require("./limbo-sidebar");
const SaitoLoader = require('./../../../lib/saito/ui/saito-loader/saito-loader');
const SaitoProfile = require('./../../../lib/saito/ui/saito-profile/saito-profile');

const SaitoSidebar = require('./../../../lib/saito/ui/saito-sidebar/saito-sidebar');

class LimboMain {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;

		let sidebar = new LimboSidebar(this.app, this.mod, ".saito-sidebar.right");
		this.rsidebar = new SaitoSidebar(this.app, this.mod, '.saito-container');
		this.rsidebar.align = "right";
		this.rsidebar.addComponent(sidebar);

		this.loader = new SaitoLoader(this.app, this.mod, "#limbo-main");

		app.connection.on("limbo-spaces-update", (source) => {
			console.log("EVENT (main): limbo-spaces-update");
			if (!this.mod.dreamer){
				this.render();
			}
		});

		app.connection.on("limbo-dream-render", (dreamer) => {
			console.log("EVENT (main): limbo-open-dream");

			let container = document.querySelector(".limbo-container");
			if (!container){
				return;
			}

			if (dreamer){
				container.classList.add("dreaming");
				this.loader.remove(10);
			}else{
				this.render();
			}
		});
	}

	async render() {
		console.log("Render limbo main");
		if (document.querySelector('.saito-container')) {
			this.app.browser.replaceElementBySelector(
				LimboMainTemplate(this.app, this.mod),
				'.saito-container'
			);
		} else {
			this.app.browser.addElementToSelector(
				LimboMainTemplate(this.app, this.mod),
				this.container
			);

			this.loader.render();
		}

		await this.rsidebar.render();

		this.renderSpaces();

		this.attachEvents();
	}


	renderSpaces(){

		if (Object.keys(this.mod.dreams)?.length > 0){
			this.app.browser.addElementToSelector(`<h3>Join an ongoing cast</h3>`, ".space-list-header");

			for (let key in this.mod.dreams){
				
				this.mod.createProfileCard(key, this.mod.dreams[key], ".spaces-list");

			}
		}

	}


	attachEvents() {


		document.querySelectorAll("#spaces .saito-profile").forEach(element => {
			element.onclick = async (e) => {
				let id = e.currentTarget.dataset.id;
				let dreamer;

				if (this.mod.dreams[id]){
					dreamer = id;
				}else{
					for (let d in this.mod.dreams){
						if (this.mod.dreams[d]?.alt_id == id){
							dreamer = d;
							break;
						}
					}
				}

				if (!dreamer){
					console.warn("Dream not found...");
					return;
				}

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

//To do : update this!!!!!!!!

		if (document.getElementById("video")){
			document.getElementById("video").onclick = (e) => {
				let obj = {
					keylist: [],
					includeCamera: true,
					screenStream: false,
					mode: "camera"
				};
				this.mod.broadcastDream(obj);
			}
		}
		if (document.getElementById("audio")){
			document.getElementById("audio").onclick = (e) => {
				let obj = {
					keylist: [],
					includeCamera: false,
					screenStream: false,
					audio: true,
					mode: "audio"
				};
				this.mod.broadcastDream(obj);
			}
		}

		if (document.getElementById("screen")){
			document.getElementById("screen").onclick = (e) => {
				let obj = {
					keylist: [],
					includeCamera: false,
					screenStream: true,
					mode: "screen"
				};
				this.mod.broadcastDream(obj);
			}
		}

	}
}

module.exports = LimboMain;
