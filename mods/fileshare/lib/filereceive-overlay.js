const SaitoOverlay = require('./../../../lib/saito/ui/saito-overlay/saito-overlay');
const FileReceiveOverlayTemplate = require('./filereceive-overlay.template');
const SaitoUser = require('./../../../lib/saito/ui/saito-user/saito-user');

class FileReceiveOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, mod);
	}

	render(sender) {

		this.sender = new SaitoUser(this.app, this.mod,	'.saito-file-transfer-overlay .contact', sender);

		this.overlay.show(FileReceiveOverlayTemplate(this.app, this.mod));
		this.sender.render();
		this.overlay.blockClose();
		this.attachEvents();
	}

	beginTransfer() {
		console.log("H1");
		
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
		let field = document.getElementById("file-transfer-status");
		if (field){
			field.innerHTML = `<span>${stats.speed}</span>`;
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

	attachEvents(){

		let accept_btn = document.getElementById("accept-file");
		let reject_btn = document.getElementById("reject-file");

		if (accept_btn){
			accept_btn.onclick = () => {
				this.app.connection.emit('relay-send-message', {
					recipient: this.sender.publicKey,
					request: 'grant file permission',
					data: {}
				});

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

				this.overlay.remove();
			}
		}

		let cancel = document.getElementById('cancel-transfer');
		if (cancel){
			cancel.onclick = () => {
				this.mod.interrupt(true);
			}
		}

	}
}


module.exports = FileReceiveOverlay;
