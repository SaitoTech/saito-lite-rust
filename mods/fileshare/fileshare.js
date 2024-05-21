const ModTemplate = require('../../lib/templates/modtemplate');
const FileShareOverlay = require('./lib/fileshare-overlay');
//const FileReceiveOverlay = require('./lib/filereceive-overlay');

class Fileshare extends ModTemplate {
	constructor(app) {
		super(app);

		this.appname = 'FileShare';
		this.name = 'Fileshare';
		this.description = 'Send files over STUN';
		this.categories = 'Utility Entertainment';
		this.chunkSize = 16348;
		this.available = false;

		this.stun = null;
		/*
		For the sender, this is the uploaded file
		For the recipient, this is an object with file metadata
		*/
		this.file = null;
		this.fileId = null;
		this.incoming = {};

		//
		// This + this.available is a bit of a hack to interrupt the chunking of the file
		// if we lose the connection. TODO : write a more robust way of tracking file transfer(s)
		// in progress
		//
		app.connection.on('relay-stun-send-fail', (publicKey) => {
			this.available = false;
			if (this.fileId) {
				siteMessage('Transfer failed!');
			}
		});

		this.bytesPrev = 0;
		this.timestampPrev = 0;
		this.timestampStart;
		this.statsInterval = null;
		this.byteRateMax = 0;
		this.byteRatePerSec = '0 kbps';
		this.file_sending = false;
		this.event_attached = false;
	}

	async initialize(app) {
		await super.initialize(app);

		if (app.BROWSER) {
			try {
				this.stun = app.modules.returnFirstRespondTo('peer-manager');
				this.available = true;
			} catch (err) {
				console.warn('No Stun available');
			}
		}
	}

	respondTo(type, obj) {
		let fss = this;

		//
		//	Define the return object here
		//
		let returnObj = null;

		if (this?.stun) {
			let recipient = obj?.publicKey || obj?.members;
			let chat_id = obj?.call_id || obj?.publicKey;

			if (recipient && chat_id && recipient !== this.publicKey && recipient.length > 0) {
				let icon = this.stun.hasConnection(recipient)
					? 'fa-solid fa-file-arrow-up'
					: 'fa-solid fa-file';

				returnObj = [
					{
						text: 'Send File',
						icon,
						callback: function (app, public_key, id = '') {
							if (fss.fileId) {
								salert('Currently sending a file!');
								return;
							}

							fss.recipient = recipient;
							fss.offset = 0;

							fss.overlay = new FileShareOverlay(app, fss);
							fss.overlay.render();

							//
							if (!fss.stun.hasConnection(recipient)) {
								fss.stun.createPeerConnection(recipient);

								fss.app.connection.on("stun-data-channel-open", peerId => {
									if (peerId == recipient){
										fss.overlay?.onConnectionSuccess();
									}
								})
							}else{
								fss.overlay.onConnectionSuccess();
							}
							
							fss.app.connection.on("stun-data-channel-close", (peerId) => {
								if (peerId == recipient){
									fss.overlay?.onConnectionFailure();
								}
							});
							fss.app.connection.on("stun-connection-faled", (peerId) => {
								if (peerId == recipient){
									fss.overlay?.onConnectionFailure();
								}
							});

						}
					}
				];
			}

			//
			// Return it here
			//
			if (type === 'chat-actions') {
				return returnObj;
			}

			if (type === 'user-menu') {
				return returnObj;
			}

			if (type === 'call-actions') {
				if (!this.app.browser.isMobileBrowser()){
					//Let's drop from the videocall interface altogether
					//return returnObj;
				}
			}
		}

		return super.respondTo(type, obj);
	}

	calcSize(bytes) {
		let kilobytes = bytes / 1024;
		let megabytes = kilobytes / 1024;
		let gigabytes = megabytes / 1024;

		if (gigabytes > 1) {
			return `${(Math.round(gigabytes*100)/100)} GB`;
		}
		if (megabytes > 1) {
			return `${(Math.round(megabytes*100)/100)} MB`;
		}
		if (kilobytes > 1) {
			return `${(Math.round(kilobytes*100)/100)} KB`;
		}

		return `${bytes}B`;
	}

	async handlePeerTransaction(app, tx = null, peer, mycallback) {
		if (tx) {
			let txmsg = tx.returnMessage();

			if (tx.isTo(this.publicKey)) {
				if (txmsg.request == 'query file permission') {
					let answer = await sconfirm(
						`${this.app.keychain.returnUsername(
							tx.from[0].publicKey
						)} wants to send "${txmsg.data.name}" (${this.calcSize(
							txmsg.data.size
						)}, ${txmsg.data.type}). Accept?`
					);
					if (answer) {
						this.fileId = txmsg.data.id;

						this.file = {
							name: txmsg.data.name,
							size: txmsg.data.size,
							type: txmsg.data.type
						};

						this.app.connection.emit('relay-send-message', {
							recipient: tx.from[0].publicKey,
							request: 'grant file permission',
							data: {}
						});
						this.overlay.render();

					} else {
						this.app.connection.emit('relay-send-message', {
							recipient: tx.from[0].publicKey,
							request: 'deny file permission',
							data: {}
						});
					}
					return;
				}

				if (txmsg.request == 'grant file permission') {
					this.overlay.render();
					this.chunkFile(this.file, 0);
					return;
				}

				if (txmsg.request == 'deny file permission') {
					salert('User will not accept file transfer');
					this.file = null;
					this.fileId = null;
					return;
				}

				if (txmsg.module == this.name) {
					if (txmsg.request == 'share file') {
						if (!this.incoming[txmsg.data.meta.id]) {
							this.incoming[txmsg.data.meta.id] = {
								receiveBuffer: [],
								receivedSize: 0,
								fileSize: txmsg.data.meta.size,
								name: txmsg.data.meta.name
							};
						}

						let blob = this.incoming[txmsg.data.meta.id];

						let restoredBinary = this.convertBase64ToByteArray(
							txmsg.data.raw
						);
						blob.receivedSize += restoredBinary.byteLength;
						blob.receiveBuffer.push(restoredBinary);

						console.log(
							restoredBinary.byteLength,
							blob.receivedSize,
							blob.fileSize
						);

			      // calculate file transfer speed	      
						let bytesNow = blob.receivedSize;

						let currentTimestamp = new Date().getTime();
						if ((currentTimestamp - this.timestampPrev) > 1000) {
				      
				      const byteRate = Math.round((bytesNow - this.bytesPrev)  /
				        (currentTimestamp - this.timestampPrev));
				      this.byteRatePerSec = `${this.calcSize(byteRate*1000)}/s`;
				      this.timestampPrev = (new Date()).getTime();
				      this.bytesPrev = bytesNow;
				      if (byteRate > this.byteRateMax) {
				        this.byteRateMax = byteRate;
				      }
			    	}

			    	let msg = `<span class="fileshare-info monospace">
												<span>Receiving: ${Math.floor((100 * blob.receivedSize) / blob.fileSize)}% </span>
												<span>${this.calcSize(blob.receivedSize)}</span>
												<span> of ${this.calcSize(blob.fileSize)}</span>
												<span>(${this.byteRatePerSec})</span>
											</span>`;

						siteMessage(msg);

						if (blob.receivedSize === blob.fileSize) {
							const anchor = document.getElementById(
								`saito-file-transfer-${txmsg.data.meta.id}`
							);
							if (!anchor) {
								console.error(
									"Didn't render hook for receiving file!"
								);
							} else {
								siteMessage(`Transfer Complete!`);

								this.app.browser.replaceElementById(
									`<a id="download-${txmsg.data.meta.id}">${anchor.outerHTML}</a>`,
									anchor.id
								);
								const received = new Blob(blob.receiveBuffer);
								const downloadLink = document.getElementById(
									`download-${txmsg.data.meta.id}`
								);
								downloadLink.href =
									URL.createObjectURL(received);
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

	addFileUploader(file) {
		const fss = this; //file share self

		if (!file) {
			console.warn('No file chosen');
			return;
		}
		if (file.size === 0) {
			console.warn('File is empty');
			return;
		}



		console.log(
			`File is ${[file.name, file.size, file.type, file.lastModified].join(' ')}`
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

			// attach event for checking closing of tab
			if (this.file_sending == false && this.event_attached == false) {
				this.file_sending = true;
				this.checkCloseTab();
			}

			await this.createFileChunkTransaction(file, event.target.result);

			this.offset += event.target.result.byteLength;

			// calculate file transfer speed
			let currentTimestamp = new Date().getTime();
			if (currentTimestamp - this.timestampPrev > 1000) {
				const bytesNow = this.offset;
				const byteRate = Math.round(
					(bytesNow - this.bytesPrev) /
						(currentTimestamp - this.timestampPrev)
				);
				this.byteRatePerSec = `${this.calcSize(byteRate * 1000)}/s`;
				this.timestampPrev = new Date().getTime();
				this.bytesPrev = bytesNow;
				if (byteRate > this.byteRateMax) {
					this.byteRateMax = byteRate;
				}
			}

			let msg = ``;
			if (this.offset < file.size) {
				this.chunkFile(file, this.offset);
				msg = `<span class="fileshare-info monospace">
													<span>Sending: ${Math.floor((100 * this.offset) / file.size)}%</span>
													<span>${this.calcSize(this.offset)}</span>
													<span> of ${this.calcSize(file.size)}</span>
													<span>(${this.byteRatePerSec})</span>
												</span>`;
			} else {
				this.fileId = null;
				this.file = null;
				msg = `<span class="fileshare-info monospace">
														<span>
															Sending: ${Math.floor((100 * this.offset) / file.size)}%
														</span>
													</span>`;

				// remove event for checking closing of tab
				this.file_sending = false;
				this.checkCloseTab();
			}

			siteMessage(msg);
		});

		this.fileId = this.app.crypto.generateRandomNumber().substring(0, 12);

		this.file = file;

		this.overlay.updateFileData();

		this.sendFileTransferRequest();
	}

	chunkFile(file, o) {
		if (this.available) {
			const slice = file.slice(this.offset, o + this.chunkSize);
			this.reader.readAsArrayBuffer(slice);
		}
	}

	sendFileTransferRequest() {
		if (!this.file) {
			console.warn('No file selected!');
			return;
		}

		let data = {
			id: this.fileId,
			name: this.file.name.replace(/\s+/g, ''),
			size: this.file.size,
			type: this.file.type
		};

		this.app.connection.emit('relay-send-message', {
			recipient: this.recipient,
			request: 'query file permission',
			data
		});
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
					name: file.name.replace(/\s+/g, ''),
					size: file.size,
					type: file.type,
					offset: this.offset,
					chunk: rawData.byteLength
				},
				raw: this.convertByteArrayToBase64(rawData)
			}
		};

		await tx.sign();

		//
		// No fallback to onchain or relay (on purpose!)
		//
		if (this?.stun && this.stun.hasConnection(this.recipient)) {
			this.stun.sendTransaction(this.recipient, tx);
		} else {
			this.available = false;
		}
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

	checkCloseTab(){
		let this_self = this;
		if (this.file_sending == true && this.event_attached == false){
			window.onbeforeunload = (e) => { 
			  this_self.event_attached = true;
			  return true; 
			}
		}
		if (this.file_sending == false && this.event_attached == true){
			window.onbeforeunload = null;
		}
	}
}

module.exports = Fileshare;
