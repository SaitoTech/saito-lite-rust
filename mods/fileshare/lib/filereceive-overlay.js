const FileReceiveOverlayTemplate = require('./filereceive-overlay.template');
const SaitoUser = require('./../../../lib/saito/ui/saito-user/saito-user');

class FileReceiveOverlay {
	constructor(app, mod, fileId, sender = "") {
		this.app = app;
		this.mod = mod;
		this.fileId = fileId || "generic";
		this.sender = sender;
		this.throttle_me = false;
		this.ready = false;
		this.divId = `file-transfer-${fileId}-${sender}`;
	}

	render(file) {

		this.senderUI = new SaitoUser(this.app, this.mod, `#${this.divId} .contact`, this.sender);

		this.app.browser.addElementToDom(FileReceiveOverlayTemplate(this.mod, this, file));

		this.senderUI.render();
		this.attachEvents();

		if (!this.mod.stun.hasConnection(file.sender)) {
			this.app.connection.on("stun-data-channel-open", peerId => {
				if (peerId == file.sender){
					this.onConnectionSuccess();
				}
			})
		}else{
			this.onConnectionSuccess();
		}
	}

	remove(){
		if (document.getElementById(this.divId)){
			document.getElementById(this.divId).remove();
		}
		this.ready = false;
	}

	beginTransfer() {
		let div = document.getElementById(this.divId);

		let field = div?.querySelector('#transfer-speed-row');
		if (field){
			field.classList.remove("hideme");
		}	

		let field2 = div?.querySelector("#file-transfer-buttons");
		if (field2){
			field2.classList.remove('hideme');
		}

		let field3 = div?.querySelector(".stun-phone-notice");
		if (field3){
			field3.classList.add('hideme');
		}
	}

	renderStats(stats){
		let div = document.getElementById(this.divId);

		if (!this.throttle_me){
			let field = div?.querySelector("#file-transfer-status");
			if (field){
				field.innerHTML = `<span class="fixed-width">${stats.speed}</span>`;
			}
			this.throttle_me = true;
			setTimeout(()=>{
				this.throttle_me = false;
			}, 500);			
		}

		let progress_bar = div?.querySelector(".file-transfer-progress");
		if (progress_bar){
			progress_bar.style.width = `${stats.percentage}%`;
		}
	}

	finishTransfer(blob){

		console.log("Finish transfer!!!!!");
		let div = document.getElementById(this.divId);

		let field = div?.querySelector("#file-transfer-status");
		if (field){
			field.innerHTML = `<i class="fa-solid fa-check"></i>`;
		}

		let progress_bar = div?.querySelector(".file-transfer-progress");
		if (progress_bar){
			progress_bar.style.width = `100%`;
		}

		const received = new Blob(blob.receiveBuffer);

		let html = `<a href="${URL.createObjectURL(received)}" download="${blob.name}"></a>`

		this.app.browser.addElementToId(html, this.divId);

		let download_btn = div?.querySelector('#download-transfer');
		if (download_btn){
			download_btn.classList.remove("hideme");
			download_btn.onclick = () => {
				document.querySelector(`#${this.divId} a`).click();
				document.querySelector(`#${this.divId} a`).remove();
				this.mod.reset(this.fileId);
				this.remove();
			}
		}

		let cancel_btn = div.querySelector("#cancel-transfer");
		if (cancel_btn){
			cancel_btn.style.visibility = "hidden";
		}

		this.ready = true;
	}
	

	onCancel(){

		let div = document.getElementById(this.divId);

		let field2 = div.querySelector("#file-transfer-buttons");
		if (field2){
			field2.classList.add('hideme');
		}

		let field = div.querySelector("#file-transfer-status");
		if (field){
			field.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
		}

	}


	onConnectionSuccess(){
		let div = document.getElementById(this.divId);

		let field = div.querySelector("#peer-connection-status");
		if (field){
			field.innerHTML = `<i class="fa-solid fa-check"></i>`;
		}
	}

	onConnectionFailure(){
		let div = document.getElementById(this.divId);

		let field = div.querySelector("#peer-connection-status");
		if (field){
			field.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
		}
	}


	attachEvents(){
		this.app.browser.makeDraggable(this.divId);
		let div = document.getElementById(this.divId);

		let accept_btn = div.querySelector("#accept-file");
		let reject_btn = div.querySelector("#reject-file");

		if (accept_btn){
			accept_btn.onclick = () => {
				this.mod.prepareToReceive(this.fileId);

				let button_row = div.querySelector('#peer-permission-buttons');
				if (button_row){
					button_row.remove();
				}
				this.beginTransfer();
			}
		}

		if (reject_btn){
			reject_btn.onclick = () => {

				this.mod.sendRejectTransferTransaction(this.fileId, this.sender);
				this.mod.reset(this.fileId);
				this.remove();
			}
		}

		let cancel = div.querySelector('#cancel-transfer');
		if (cancel){
			cancel.onclick = () => {
				this.mod.interrupt(this.fileId, this.sender);
				this.mod.sendRejectTransferTransaction(this.fileId, this.sender);
				this.mod.reset(this.fileId);
			}
		}

		let close = div.querySelector(".icon-button#close");
		if (close){
			close.onclick = async (e) => {
				if (this.ready){
					let c = await sconfirm("Close without saving the file first?");
					if (!c){
						console.log("Okay Don't close overlay yet");
						return;
					}
				}else if (this.mod.incoming[this.fileId]?.sending){
					this.mod.interrupt(this.fileId, this.sender);	
				}else if (this.mod.incoming[this.fileId]) {
					this.mod.sendRejectTransferTransaction(this.fileId, this.sender);
				}
				
				this.mod.reset(this.fileId);
				this.remove();
			}
		}


		let resize = div.querySelector(".icon-button#resize");
		if (resize){
			resize.onclick = (e) => {
				div.classList.toggle("minimize");
				div.removeAttribute("style");
			}
		}
	}
}


module.exports = FileReceiveOverlay;
