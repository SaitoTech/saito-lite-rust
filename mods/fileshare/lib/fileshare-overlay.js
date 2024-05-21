const SaitoOverlay = require('./../../../lib/saito/ui/saito-overlay/saito-overlay');
const FileShareOverlayTemplate = require('./fileshare-overlay.template');

class FileShareOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, mod);
	}

	render(){
		this.overlay.show(FileShareOverlayTemplate(this.app, this.mod));
		this.overlay.blockClose();

		this.attachEvents();

	}

	updateFileData(){
		let html = `<div class="saito-file-transfer" id="saito-file-transfer-${this.mod.fileId}">
					<i class="fa-solid fa-file"></i>
					<div class="file-name">${this.mod.file.name}</div>
					<div class="file-size">${this.mod.calcSize(this.mod.file.size)}</div>
					</div>`;

		this.app.browser.addElementToSelector(html, ".teleporter-file-data");
	}

	transfering(){

	}

	complete(){

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
		}
	}
}

module.exports = FileShareOverlay;
