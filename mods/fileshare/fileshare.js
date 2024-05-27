const ModTemplate = require('../../lib/templates/modtemplate');
const FileShareOverlay = require('./lib/fileshare-overlay');
const FileReceiveOverlay = require('./lib/filereceive-overlay');

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

		this.bytesPrev = 0;
		this.timestampPrev = 0;
		this.byteRateMax = 0;

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

	calcSize(bytes, digits = 0) {
		let kilobytes = bytes / 1024;
		let megabytes = kilobytes / 1024;
		let gigabytes = megabytes / 1024;

		const roundMe = (num, digits) => {
			if (digits){
				return num.toFixed(digits);
			}else{
				return Math.round(num*100)/100;
			}
		}

		if (gigabytes > 1) {
			return `${roundMe(gigabytes, digits)} GB`;
		}
		if (megabytes > 1) {
			return `${roundMe(megabytes, digits)} MB`;
		}
		if (kilobytes > 1) {
			return `${roundMe(kilobytes, digits)} KB`;
		}

		return `${bytes}B`;
	}

	async handlePeerTransaction(app, tx = null, peer, mycallback) {
		if (tx) {
			let txmsg = tx.returnMessage();

			if (tx.isTo(this.publicKey)) {
				if (txmsg.request == 'query file permission') {

					this.recipient = tx.from[0].publicKey;
					this.fileId = txmsg.data.id;
					this.file = {
						name: txmsg.data.name,
						size: txmsg.data.size,
						type: txmsg.data.type
					};

					this.overlay = new FileReceiveOverlay(this.app, this);
					this.overlay.render(tx.from[0].publicKey);

					return;
				}

				if (txmsg.request == 'grant file permission') {
					this.overlay.onPeerAccept();
					this.overlay.beginTransfer();
					this.chunkFile(this.file, 0);
					return;
				}

				if (txmsg.request == 'deny file permission') {
					this.overlay.onPeerReject();
					this.file = null;
					this.fileId = null;
					return;
				}

				if (txmsg.request == 'stop file transfer') {
					this.interrupt();
					return;
				}

				if (txmsg.module == this.name) {
					if (txmsg.request == 'share file') {
						if (!this.available) {
							return;
						}

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
			      		this.transferStats(blob.receivedSize);

						if (blob.receivedSize === blob.fileSize) {
							this.overlay.finishTransfer(blob)
							this.reset();
						}
					}
				}
			}
		}

		return super.handlePeerTransaction(app, tx, peer, mycallback);
	}

	transferStats(bytesNow){

		let currentTimestamp = new Date().getTime();

		const byteRate = Math.round((bytesNow - this.bytesPrev) /
				(currentTimestamp - this.timestampPrev)
		);
		
		this.timestampPrev = new Date().getTime();

		if (byteRate > this.byteRateMax) {
			this.byteRateMax = byteRate;
		}

		let stats = {
			percentage: ((100 * bytesNow) / this.file.size).toFixed(1),
			amount: this.calcSize(bytesNow),
			speed: `${this.calcSize(byteRate * 1000, 2)}/s`,
			max: this.byteRateMax,
		};

		this.bytesPrev = bytesNow;
		this.overlay.renderStats(stats);

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
			console.log('File Share: onload ', event);

			if (!this.available){
				return;
			}

			await this.createFileChunkTransaction(file, event.target.result);

			this.offset += event.target.result.byteLength;

			this.transferStats(this.offset);

			// calculate file transfer speed

			if (this.offset < file.size) {
				this.chunkFile(file, this.offset);
			} else {
				console.log("Finished!");
				this.overlay.finishTransfer();
				this.reset();
			}

		});

		this.fileId = this.app.crypto.generateRandomNumber().substring(0, 12);

		this.file = file;

		this.overlay.updateFileData();

		this.sendFileTransferRequest();
	}

	prepareToReceive(){
		
		// Send confirmation message to sender
		this.app.connection.emit('relay-send-message', {
			recipient: this.recipient,
			request: 'grant file permission',
			data: {}
		});

		//set up stun listeners for interruptions
		this.app.connection.on("stun-data-channel-close", (peerId) => {
			if (peerId == recipient){
				this.overlay?.onConnectionFailure();
			}
		});
		this.app.connection.on("stun-connection-faled", (peerId) => {
			if (peerId == recipient){
				this.overlay?.onConnectionFailure();
			}
		});


	}

	interrupt(send_message = false){
		if (send_message){
			this.app.connection.emit("relay-send-message", {recipient: this.recipient, request: "stop file transfer", data: {}});
		}else{
			siteMessage("File transfer cancelled", 5000);
		}
		this.available = false;
		this.overlay.onCancel();
		this.reset();
	}

	reset(){
		this.fileId = null;
		this.file = null;
		this.recipient = null;

		this.bytesPrev = 0;
		this.timestampPrev = 0;
		this.byteRateMax = 0;
	}

	chunkFile(file, o) {
		const slice = file.slice(this.offset, o + this.chunkSize);
		this.reader.readAsArrayBuffer(slice);
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

}

module.exports = Fileshare;
