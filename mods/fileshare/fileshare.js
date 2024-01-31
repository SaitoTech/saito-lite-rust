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

		this.incoming = { };

		app.connection.on("relay-stun-send-fail", ()=> {
			this.available = false;
		});
	}

	respondTo(type, obj) {
		let fss = this;
		if (!this.available) {
			return null;
		}

		if (type === 'chat-actions') {
			if (obj?.publicKey) {
				if (obj.publicKey !== this.app.wallet.publicKey) {
					return [
						{
							text: 'Send File',
							icon: 'fa-solid fa-file',
							callback: function (app, public_key, id) {
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
									let count = document.querySelectorAll(".saito-file-transfer").length;
									let html = `
									<div class="saito-file-transfer" id="saito-file-transfer-${count}">
									<i class="fa-solid fa-file"></i>
									<div class="file-name">${file.name}</div>
									<div class="file-size">${fss.calcSize(file.size)}</div>
									</div>`;
									fss.app.connection.emit("chat-message-user", obj.publicKey, html.replace(/\s+/, ""));
								}

								fss.recipient = obj.publicKey;
								fss.offset = 0;
								fss.addFileUploader(id);
							}
						}
					];
				}
			}
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

				if (txmsg.module == this.name) {

					if (txmsg.request == 'share file') {
						if (!this.incoming[txmsg.data.meta.name]){
							this.incoming[txmsg.data.meta.name] = {
								receiveBuffer: [],
								receivedSize: 0,
								fileSize: txmsg.data.meta.size
							}
						}

						let blob = this.incoming[txmsg.data.meta.name];

						console.log(txmsg.data);
						blob.receivedSize += txmsg.data.raw.byteLength;
						blob.receiveBuffer.push(txmsg.data.raw);
						
						if (blob.receivedSize === blob.fileSize){
							siteMessage(`Finished transfering file: ${txmsg.data.meta.name}`);
						
							const received = new Blob(blob.receiveBuffer);
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

					file.name = file.name.replace(/\s+/g, "");

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

						if (this.offset < file.size) {
							this.chunkFile(file, this.offset);
						}
					});

					if (this.callback) {
						this.callback(file);
					}

					this.chunkFile(file, 0);
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

	async createFileChunkTransaction(file, rawData) {
		let tx = await this.app.wallet.createUnsignedTransaction(
			this.recipient
		);

		tx.msg = {
			module: this.name,
			request: 'share file',
			data: {
				meta: {
					name: file.name,
					size: file.size,
					type: file.type,
					offset: this.offset,
					chunk: rawData.byteLength,
				},
				raw: rawData
			}
		};

		await tx.sign();

		this.app.connection.emit('relay-transaction', tx, true);	
		
	}
}

module.exports = Fileshare;
