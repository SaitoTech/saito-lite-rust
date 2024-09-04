const FileShareOverlayTemplate = require('./fileshare-overlay.template');
const SaitoUser = require('./../../../lib/saito/ui/saito-user/saito-user');

class FileShareOverlay {
	constructor(app, mod, fileId, recipient = "") {
		this.app = app;
		this.mod = mod;
		this.fileId = fileId;
		this.recipient = recipient;
		this.active = true;
		this.throttle_me = false;
		this.qs = `#file-transfer-${this.fileId}-${this.recipient}`;

		app.connection.on('stun-data-channel-open', (peerId) => {
			console.log("open");
			if (peerId == this.recipient && this.active) {
				this.onConnectionSuccess();
			}
		});

		app.connection.on('stun-connection-timeout', (peerId) => {
			if (peerId == this.recipient && this.active) {
				this.onConnectionFailure();
			}
		});

		app.connection.on('stun-data-channel-close', (peerId) => {
			if (peerId == this.recipient && this.active) {
				this.onConnectionFailure();
			}
		});
		app.connection.on('stun-connection-failed', (peerId) => {
			if (peerId == this.recipient && this.active) {
				this.onConnectionFailure();
			}
		});

	}

	render(needs_file = true){

		this.app.browser.addElementToDom(FileShareOverlayTemplate(this));

		if (this.recipient){
			this.senderUI = new SaitoUser(this.app, this.mod, `${this.qs} .contact`, this.recipient);
			this.senderUI.render();
		}

		this.attachEvents(needs_file);
	}

	remove(){
		if (document.querySelector(this.qs)){
			document.querySelector(this.qs).remove();
		}
	}

	addRecipient(recipient){
		this.recipient = recipient;
		this.senderUI = new SaitoUser(this.app, this.mod, `${this.qs} .contact`, this.recipient);
		this.senderUI.render();
	}

	updateFileData(file){
		let html = `<div class="saito-file-transfer" id="saito-file-transfer-${this.fileId}">
					<div class="file-transfer-progress"></div>
					<i class="fa-solid fa-file-export"></i>
					<div class="file-name">${file.name}</div>
					<div class="file-size fixed-width">${this.mod.calcSize(file.size)}</div>
					</div>`;


		this.app.browser.addElementToSelector(html, `${this.qs} .teleporter-file-data`);
	}

	beginTransfer(){

		let field = document.querySelector(this.qs + ' #transfer-speed-row');
		if (field){
			field.classList.remove("hideme");
		}	

		let field2 = document.querySelector(this.qs + " #file-transfer-buttons");
		if (field2){
			field2.classList.remove('hideme');
		}
	}

	renderStats(stats){
		if (!this.throttle_me){
			let field = document.querySelector(this.qs + " #file-transfer-status");
			if (field){
				field.innerHTML = `<span class="fixed-width">${stats.speed}</span>`;
			}
			this.throttle_me = true;
			setTimeout(()=>{
				this.throttle_me = false;
			}, 500);			
		}

		let progress_bar = document.querySelector(this.qs + " .file-transfer-progress");
		if (progress_bar){
			progress_bar.style.width = `${stats.percentage}%`;
		}
	}

	finishTransfer(){

		this.active = false;

		let field = document.querySelector(this.qs + " #file-transfer-status");
		if (field){
			field.innerHTML = `<i class="fa-solid fa-check"></i>`;
		}

		let progress_bar = document.querySelector(this.qs + " .file-transfer-progress");
		if (progress_bar){
			progress_bar.style.width = `100%`;
		}

		let field2 = document.querySelector(this.qs + " #file-transfer-buttons");
		if (field2){
			field2.remove();
		}

	}



	onPeerAccept(){
		let field = document.querySelector(this.qs + " #peer-accept-status");
		if (field){
			field.innerHTML = `<i class="fa-solid fa-check"></i>`;
		}

	}

	onPeerReject(){
		let field = document.querySelector(this.qs + " #peer-accept-status");
		if (field){
			field.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
		}

		this.active = false;
	}


	onConnectionSuccess(){
		let field = document.querySelector(this.qs + " #peer-connection-status");
		
		console.log(field);

		if (field){
			field.innerHTML = `<i class="fa-solid fa-check"></i>`;
		}

		let message_field = document.querySelector(this.qs + " .teleporter-transfer-field");
		if (message_field){
			message_field.innerHTML = '';
			message_field.onclick = null;
		}

	}

	onConnectionFailure(){
		let field = document.querySelector(this.qs + " #peer-connection-status");
		if (field){
			field.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
		}

		// If this is a failure to connection rather than dropped connection after starting to send
		//
		if (!this.mod.outgoing_files[this.fileId].sending) {
			let message_field = document.querySelector(this.qs + " .teleporter-transfer-field");
			if (message_field){
				message_field.innerHTML = `Peer appears to be offline. <span class="saito-link">Send them a link?</span> `;

				message_field.onclick = (e) => {
					this.mod.copyShareLink(this.fileId);
				}
			}
		}

	}


	onFile(file = null){
		let field = document.querySelector(this.qs + " #file-selection-status");
		if (!field){
			return;
		}
		if (!file || !file.size){
			field.innerHTML = `<i class="fa-solid fa-xmark"></i>`;

		}else{
			field.innerHTML = `<i class="fa-solid fa-check"></i>`;
			let hidden_form = document.querySelector(this.qs + " .saito-file-uploader.needs-file");
			if (hidden_form){
				hidden_form.onclick = null;
				hidden_form.classList.remove("needs-file");
			}
		}
	}

	onCancel(){
		let field2 = document.querySelector(this.qs + " #file-transfer-buttons");
		if (field2){
			field2.classList.add('hideme');
		}

		let field = document.querySelector(this.qs + " #file-transfer-status");
		if (field){
			field.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
		}

		this.active = false;
	}

	attachEvents(needs_file){
		this.app.browser.makeDraggable(`file-transfer-${this.fileId}-${this.recipient}`);

		if (needs_file){
			let input = document.querySelector(this.qs + ` #hidden_file_element_uploader_overlay`);
			if (input) {
				input.addEventListener('change', (e) => {
					this.mod.addFileUploader(input.files[0], this.fileId);
					this.onFile(input.files[0]);
				});
				
				input.click();

				let hidden_form = document.querySelector(this.qs + " .saito-file-uploader.needs-file");
				if (hidden_form){
					hidden_form.onclick = () => {
						input.click();
					}
				}

			}
		}

		let cancel = document.querySelector(this.qs + ' #cancel-transfer');
		if (cancel){
			cancel.onclick = () => {
				this.mod.interrupt(this.fileId, this.recipient);
			}
		}


		let close = document.querySelector(this.qs + " .icon-button#close");
		if (close){
			close.onclick = (e) => {
				this.mod.interrupt(this.fileId, this.recipient);
				this.remove();
			}
		}

		let resize = document.querySelector(this.qs + " .icon-button#resize");
		if (resize){
			resize.onclick = (e) => {
				let overlay = document.querySelector(this.qs);
				overlay.classList.toggle("minimize");
				overlay.removeAttribute("style");
			}
		}

	}
}

module.exports = FileShareOverlay;
