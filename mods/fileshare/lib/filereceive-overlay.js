const FileReceiveOverlayTemplate = require('./filereceive-overlay.template');
const SaitoUser = require('./../../../lib/saito/ui/saito-user/saito-user');

class FileReceiveOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.throttle_me = false;
	}

	render(sender) {

		this.sender = new SaitoUser(this.app, this.mod,	'.saito-file-transfer-overlay .contact', sender);

		this.app.browser.addElementToDom(FileReceiveOverlayTemplate(this.app, this.mod));

		this.sender.render();
		this.attachEvents();

		if (!this.mod.stun.hasConnection(sender)) {
			this.app.connection.on("stun-data-channel-open", peerId => {
				if (peerId == sender){
					this.onConnectionSuccess();
				}
			})
		}else{
			this.onConnectionSuccess();
		}
	}

	remove(){
		if (document.querySelector('.saito-file-transfer-overlay')){
			document.querySelector('.saito-file-transfer-overlay').remove();
		}
	}

	beginTransfer() {
		let field = document.getElementById('transfer-speed-row');
		if (field){
			field.classList.remove("hideme");
		}	

		let field2 = document.getElementById("file-transfer-buttons");
		if (field2){
			field2.classList.remove('hideme');
		}

		let field3 = document.querySelector(".stun-phone-notice");
		if (field3){
			field3.classList.add('hideme');
		}
	}

	renderStats(stats){
		if (!this.throttle_me){
			let field = document.getElementById("file-transfer-status");
			if (field){
				field.innerHTML = `<span class="fixed-width">${stats.speed}</span>`;
			}
			this.throttle_me = true;
			setTimeout(()=>{
				this.throttle_me = false;
			}, 500);			
		}

		let progress_bar = document.querySelector(".file-transfer-progress");
		if (progress_bar){
			progress_bar.style.width = `${stats.percentage}%`;
		}
	}

	finishTransfer(blob){

		let field = document.getElementById("file-transfer-status");
		if (field){
			field.innerHTML = `<i class="fa-solid fa-check"></i>`;
		}

		let progress_bar = document.querySelector(".file-transfer-progress");
		if (progress_bar){
			progress_bar.style.width = `100%`;
		}

		const received = new Blob(blob.receiveBuffer);

		let html = `<a href="${URL.createObjectURL(received)}" download="${blob.name}"></a>`

		this.app.browser.addElementToSelector(html, ".saito-file-transfer-overlay");

		let download_btn = document.getElementById('download-transfer');
		if (download_btn){
			download_btn.classList.remove("hideme");
			download_btn.onclick = () => {
				document.querySelector(".saito-file-transfer-overlay a").click();
			}
		}

		let cancel_btn = document.getElementById("cancel-transfer");
		if (cancel_btn){
			cancel_btn.style.visibility = "hidden";
		}

	}
	

	onCancel(){
		let field2 = document.getElementById("file-transfer-buttons");
		if (field2){
			field2.classList.add('hideme');
		}

		let field = document.getElementById("file-transfer-status");
		if (field){
			field.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
		}

	}


	onConnectionSuccess(){
		let field = document.getElementById("peer-connection-status");
		if (field){
			field.innerHTML = `<i class="fa-solid fa-check"></i>`;
		}
	}

	onConnectionFailure(){
		let field = document.getElementById("peer-connection-status");
		if (field){
			field.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
		}
	}


	attachEvents(){
		this.app.browser.makeDraggable('file-transfer');

		let accept_btn = document.getElementById("accept-file");
		let reject_btn = document.getElementById("reject-file");

		if (accept_btn){
			accept_btn.onclick = () => {
				this.mod.prepareToReceive();

				let button_row = document.getElementById('peer-permission-buttons');
				if (button_row){
					button_row.remove();
				}
				this.beginTransfer();
			}
		}

		if (reject_btn){
			reject_btn.onclick = () => {
				this.mod.file = null;
				this.mod.fileId = null;

				this.app.connection.emit('relay-send-message', {
					recipient: this.sender.publicKey,
					request: 'deny file permission',
					data: {}
				});

				this.remove();
			}
		}

		let cancel = document.getElementById('cancel-transfer');
		if (cancel){
			cancel.onclick = () => {
				this.mod.interrupt(true);
			}
		}

		let close = document.querySelector(".icon-button#close");
		if (close){
			close.onclick = (e) => {
				if (this.mod.sending){
					this.mod.interrupt(true);	
				}else{
					this.mod.file = null;
					this.mod.fileId = null;

					this.app.connection.emit('relay-send-message', {
						recipient: this.sender.publicKey,
						request: 'deny file permission',
						data: {}
					});
				}
				
				this.remove();
			}
		}


		let resize = document.querySelector(".icon-button#resize");
		if (resize){
			resize.onclick = (e) => {
				let overlay = document.getElementById("file-transfer");
				overlay.classList.toggle("minimize");
				overlay.removeAttr("style");
			}
		}
	}
}


module.exports = FileReceiveOverlay;
