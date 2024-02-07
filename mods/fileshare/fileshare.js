const ModTemplate = require('../../lib/templates/modtemplate');

class Fileshare extends ModTemplate {
	constructor(app) {
		super(app);

		this.appname = 'FileShare';
		this.name = 'Fileshare';
		this.description = 'Send files over STUN';
		this.categories = 'Utility Entertainment';
		this.chunkSize = 16348;
		this.available = false;

		this.callback = null;

		this.fileId = null;
		this.incoming = { };

		app.connection.on("relay-stun-send-fail", (publicKey)=> {
			this.available = false;
			if (this.fileId){
				siteMessage("Transfer failed!");	
			}
		});

	}

	respondTo(type, obj) {
		let fss = this;
		if (!this.available) {
			return null;
		}

		let returnObj = null;

		if (obj?.publicKey) {
			if (obj.publicKey !== this.app.wallet.publicKey) {
				returnObj = [
					{
						text: 'Send File',
						icon: 'fa-solid fa-file unavailable-without-relay',
						callback: function (app, public_key, id = "body") {
						
							if (fss.fileId){
								salert("Currently sending a file!");
								return;
							}

							fss.recipient = obj.publicKey;
							fss.offset = 0;
							fss.addFileUploader(id);

							//
							fss.app.connection.emit(
								'open-stun-relay',
								public_key,
								() => {
									//
									// When stun connection is established, select a file to upload
									//
									const input = document.getElementById(
										`hidden_file_element_${id}`
									);
									input.click();
								}
							);

							fss.callback = (file) => {
								let html = `
								<div class="saito-file-transfer" id="saito-file-transfer-${fss.fileId}">
								<i class="fa-solid fa-file"></i>
								<div class="file-name">${file.name.replace(/\s+/g, "")}</div>
								<div class="file-size">${fss.calcSize(file.size)}</div>
								</div>`;
								fss.app.connection.emit("chat-message-user", obj.publicKey, html.replace(/\s+/, ""));
							}

						}
					}
				];
			}
		}


		if (type === 'chat-actions') {
			return returnObj;
		}

    if (type === "user-menu") {
    	return returnObj;
    }

	}

	initialize(app) {
		super.initialize(app);

		if (app.modules.returnModule('Relay')) {
			this.available = true;
		}
	}


	calcSize(bytes){
		let kilobytes = bytes / 1024;
		let megabytes = kilobytes / 1024;
		let gigabytes = megabytes / 1024;

		if (gigabytes > 1){
			return `${gigabytes.toFixed(2)}GB`;
		}
		if (megabytes > 1){
			return `${megabytes.toFixed(2)}MB`;
		}
		if (kilobytes > 1){
			return `${kilobytes.toFixed(2)}KB`;
		}

		return `${bytes}B`;
	}

	async handlePeerTransaction(app, tx = null, peer, mycallback) {
		if (tx) {
			if (tx.isTo(this.publicKey)) {
				let txmsg = tx.returnMessage();

				console.log(txmsg);

				if (txmsg.request == "query file permission"){
					let answer = await sconfirm(`${this.app.keychain.returnUsername(tx.from[0].publicKey)} wants to send "${txmsg.data.name}" (${this.calcSize(txmsg.data.size)}, ${txmsg.data.type}). Accept?`);
					if (answer){
						this.fileId = txmsg.data.id;
						this.app.connection.emit("relay-send-message", {recipient: tx.from[0].publicKey, request: "grant file permission", data: {}});
					}else{
						this.app.connection.emit("relay-send-message", {recipient: tx.from[0].publicKey, request: "deny file permission", data: {}});
					}
					return;
				}

				if (txmsg.request == "grant file permission"){
					this.chunkFile(this.file, 0);
					return;
				}

				if (txmsg.request == "deny file permission"){
					salert("User will not accept file transfer");
					this.file = null;
					this.fileId = null;
					return;
				}

				if (txmsg.module == this.name) {

					if (txmsg.request == 'share file') {
						if (!this.incoming[txmsg.data.meta.id]){
							this.incoming[txmsg.data.meta.id] = {
								receiveBuffer: [],
								receivedSize: 0,
								fileSize: txmsg.data.meta.size,
								name: txmsg.data.meta.name,
							}
						}

						let blob = this.incoming[txmsg.data.meta.id];

						let restoredBinary = this.convertBase64ToByteArray(txmsg.data.raw);
						blob.receivedSize += restoredBinary.byteLength;
						blob.receiveBuffer.push(restoredBinary);
						
						siteMessage(`Receiving: ${Math.floor(100*blob.receivedSize/blob.fileSize)}%`);
						console.log(restoredBinary.byteLength, blob.receivedSize, blob.fileSize);

						if (blob.receivedSize === blob.fileSize){
						
							const anchor = document.getElementById(`saito-file-transfer-${txmsg.data.meta.id}`);
							if (!anchor){
								console.error("Didn't render hook for receiving file!");
							}else{
								siteMessage(`Transfer Complete!`);

								this.app.browser.replaceElementById(`<a id="download-${txmsg.data.meta.id}">${anchor.outerHTML}</a>`, anchor.id);
								const received = new Blob(blob.receiveBuffer);
								const downloadLink = document.getElementById(`download-${txmsg.data.meta.id}`);
								downloadLink.href = URL.createObjectURL(received);	
								downloadLink.download = blob.name;

								this.fileId = null;
							}
						}
					}
				}
			}
		}

		return super.handlePeerTransaction(app, tx, peer, mycallback);
	}


	addFileUploader(id) {
		const fss = this; //file share self

		const hidden_upload_form = `
      <form id="uploader_${id}" class="saito-file-uploader" style="display:none">
        <input type="file" id="hidden_file_element_${id}" accept="*" class="hidden_file_element_${id}">
      </form>
    `;

		if (!document.getElementById(`uploader_${id}`)) {

			this.app.browser.addElementToId(hidden_upload_form, id);

			const input = document.getElementById(`hidden_file_element_${id}`);

			console.log(`hidden_file_element_${id}`);

			input.addEventListener(
				'change',
				(e) => {
					const file = input.files[0];

					if (!file) {
						console.warn('No file chosen');
						return;
					}
					if (file.size === 0) {
						console.warn('File is empty');
						return;
					}

					console.log(
						`File is ${[
							file.name,
							file.size,
							file.type,
							file.lastModified
						].join(' ')}`
					);

					this.reader = new FileReader();

					this.reader.addEventListener('error', (error) =>
						console.error('Error reading file:', error)
					);
					this.reader.addEventListener('abort', (event) =>
						console.log('File reading aborted:', event)
					);

					this.reader.addEventListener('load', async (event) => {
						//console.log('File Share: onload ', event);
						await this.createFileChunkTransaction(
							file,
							event.target.result
						);

						this.offset += event.target.result.byteLength;

						siteMessage(`Sending: ${Math.floor(100*this.offset/file.size)}%`);

						if (this.offset < file.size) {
							this.chunkFile(file, this.offset);
						}else{
							this.fileId = null;
							this.file = null;
						}
					});

					this.fileId = this.app.crypto.generateRandomNumber().substring(0, 12);

					if (this.callback) {
						this.callback(file);
					}

					this.file = file;

					this.sendFileTransferRequest();

				},
				false
			);
		}
	}

	chunkFile(file, o) {
		if (this.available) {
			const slice = file.slice(this.offset, o + this.chunkSize);
			this.reader.readAsArrayBuffer(slice);
		}
	}

	async sendFileTransferRequest(){

		if (!this.file){
			console.warn("No file selected!");
			return;
		}

		let data = {
			id:   this.fileId,
			name: this.file.name.replace(/\s+/g, ""),
			size: this.file.size,
			type: this.file.type,
		};

		this.app.connection.emit("relay-send-message", {recipient: this.recipient, request: "query file permission", data});
	}

	async createFileChunkTransaction(file, rawData) {
		let tx = await this.app.wallet.createUnsignedTransaction(
			this.recipient
		);

		//let base64data = this.xorBase64(this.convertByteArrayToBase64(data));


		tx.msg = {
			module: this.name,
			request: 'share file',
			data: {
				meta: {
					id: this.fileId,
					name: file.name.replace(/\s+/g, ""),
					size: file.size,
					type: file.type,
					offset: this.offset,
					chunk: rawData.byteLength,
				},
				raw: this.convertByteArrayToBase64(rawData),
			}
		};

		await tx.sign();

		this.app.connection.emit('relay-transaction', tx, true);	
		
	}


	convertByteArrayToBase64(data) {
		return Buffer.from(data, 'binary').toString('base64');
	}

	convertBase64ToByteArray(data) {
		let b = Buffer.from(data, 'base64');
		let b2 = new Uint8Array(b.length);
		for (let i = 0; i < b.length; ++i) {
			b2[i] = b[i];
		}
		return b2;
	}

}

module.exports = Fileshare;
