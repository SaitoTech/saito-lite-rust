const SaitoOverlay = require('./../../../lib/saito/ui/saito-overlay/saito-overlay');
const FileShareOverlayTemplate = require('./fileshare-overlay.template');

class FileShareOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, mod);
		this.throttle_me = false;
	}

	render(){
		this.overlay.show(FileShareOverlayTemplate(this.app, this.mod));
		this.overlay.blockClose();

		this.attachEvents();

	}

	updateFileData(){
		let html = `<div class="saito-file-transfer" id="saito-file-transfer-${this.mod.fileId}">
					<div class="file-transfer-progress"></div>
					<i class="fa-solid fa-file"></i>
					<div class="file-name">${this.mod.file.name}</div>
					<div class="file-size">${this.mod.calcSize(this.mod.file.size)}</div>
					</div>`;

		this.app.browser.addElementToSelector(html, ".teleporter-file-data");
	}

	beginTransfer(){
		console.log("H1");

		let field = document.getElementById('transfer-speed-row');
		if (field){
			field.classList.remove("hideme");
		}	

		let field2 = document.getElementById("file-transfer-buttons");
		if (field2){
			field2.classList.remove('hideme');
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

	finishTransfer(){
		let field = document.getElementById("file-transfer-status");
		if (field){
			console.log(1);
			field.innerHTML = `<i class="fa-solid fa-check"></i>`;
		}

		let progress_bar = document.querySelector(".file-transfer-progress");
		if (progress_bar){
			progress_bar.style.width = `100%`;
		}

		let field2 = document.getElementById("file-transfer-buttons");
		if (field2){
			console.log(2);
			field2.remove();
		}

	}



	onPeerAccept(){
		let field = document.getElementById("peer-accept-status");
		if (field){
			field.innerHTML = `<i class="fa-solid fa-check"></i>`;
		}

	}

	onPeerReject(){
		let field = document.getElementById("peer-accept-status");
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

	onFile(file = null){
		let field = document.getElementById("file-selection-status");
		if (!field){
			return;
		}
		if (!file || !file.size){
			field.innerHTML = `<i class="fa-solid fa-xmark"></i>`;

		}else{
			field.innerHTML = `<i class="fa-solid fa-check"></i>`;
			let hidden_form = document.querySelector(".saito-file-uploader.needs-file");
			if (hidden_form){
				hidden_form.onclick = null;
				hidden_form.classList.remove("needs-file");
			}
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
		let input = document.getElementById(`hidden_file_element_uploader_overlay`);
		if (input) {
			input.addEventListener('change', (e) => {
				this.mod.addFileUploader(input.files[0]);
				this.onFile(input.files[0]);
			});
			
			input.click();

			let hidden_form = document.querySelector(".saito-file-uploader.needs-file");
			if (hidden_form){
				hidden_form.onclick = () => {
					input.click();
				}
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

module.exports = FileShareOverlay;
