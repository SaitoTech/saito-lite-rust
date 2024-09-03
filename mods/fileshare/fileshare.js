const ModTemplate = require('../../lib/templates/modtemplate');
const FileShareOverlay = require('./lib/fileshare-overlay');
const FileReceiveOverlay = require('./lib/filereceive-overlay');
const SaitoHeader = require('../../lib/saito/ui/saito-header/saito-header');
const HomePage = require('./index');

class Fileshare extends ModTemplate {
	constructor(app) {
		super(app);

		this.appname = 'FileShare';
		this.name = 'Fileshare';
		this.description = 'Send files P2P over STUN';
		this.categories = 'Utility Entertainment';
		this.chunkSize = 16348;

		this.stun = null;
		/*
		For the sender, this is the uploaded file
		For the recipient, this is an object with file metadata
		*/
		this.file = null;
		this.fileId = null;
		this.incoming = {};
		this.offset = 0;

		this.sending = false;

		this.bytesPrev = 0;
		this.timestampPrev = 0;
		this.byteRateMax = 0;

		this.files = {};
		/***********
		fileId (randomly generated code) -> { obj } mapping
		obj : {
			recipient
			name: file name
			size: file size,
			type: file type,

			bytesPrev:
			timestampPrev:
			byteRateMax:



		}

		************/
		this.terminationEvent = 'unload';

		this.social = {
			twitter: '@SaitoOfficial',
			title: 'Saito Fileshare',
			url: 'https://saito.io/fileshare/',
			description: 'P2P live file transfering on Saito Network blockchain',
			image: 'https://saito.tech/wp-content/uploads/2022/04/saito_card_horizontal.png'
		};
	}

	async initialize(app) {
		await super.initialize(app);

		if (app.BROWSER) {
			if ('onpagehide' in self) {
				this.terminationEvent = 'pagehide';
			}

			try {
				this.stun = app.modules.returnFirstRespondTo('peer-manager');
			} catch (err) {
				console.warn('No Stun available');
			}
		}
	}

	async render() {
		//
		// browsers only!
		//
		if (!this.app.BROWSER) {
			return;
		}

		this.header = new SaitoHeader(this.app, this);
		await this.header.initialize(this.app);

		this.addComponent(this.header);

		await super.render();

		if (this.app.browser.returnURLParameter('file')) {
			const data = JSON.parse(
				this.app.crypto.base64ToString(this.app.browser.returnURLParameter('file'))
			);

			this.recipient = data.publicKey;
			this.fileId = data.id;
			this.file = {
				name: data.name,
				size: data.size,
				type: data.type
			};

			this.overlay = new FileReceiveOverlay(this.app, this);
			this.overlay.render(data.publicKey);

		} else {
			this.sendFile();
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
							if (fss.fileId || fss.sending) {
								salert('Currently sending a file!');
								return;
							}

							fss.fileId = fss.app.crypto.generateRandomNumber().substring(0, 12);

							fss.recipient = recipient;

							fss.overlay = new FileShareOverlay(app, fss);
							fss.overlay.render();

							//
							if (!fss.stun.hasConnection(fss.recipient)) {
								fss.stun.createPeerConnection(fss.recipient);

							} else {
								fss.app.connection.emit('stun-data-channel-open', fss.recipient);
							}

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
				if (!this.app.browser.isMobileBrowser()) {
					//Let's drop from the videocall interface altogether
					//return returnObj;
				}
			}
		}

		if (type === 'saito-header') {
			let x = [];
			if (!this.browser_active) {
				x.push({
					text: 'File Transfer',
					icon: `fa-solid fa-laptop-file`,
					callback: function (app, id) {
						fss.sendFile();
					}
				});

				return x;
			}
		}

		return super.respondTo(type, obj);
	}

	sendFile() {
		this.fileId = this.app.crypto.generateRandomNumber().substring(0, 12);
		this.overlay = new FileShareOverlay(this.app, this);
		this.overlay.render();
	}

	calcSize(bytes, digits = 0) {
		let kilobytes = bytes / 1024;
		let megabytes = kilobytes / 1024;
		let gigabytes = megabytes / 1024;

		const roundMe = (num, digits) => {
			if (digits) {
				return num.toFixed(digits);
			} else {
				return Math.round(num * 100) / 100;
			}
		};

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

	async onPeerServiceUp(app, peer, service = {}) {

		if (service.service === 'relay') {

			if (this.app.browser.returnURLParameter('file')) {

				console.log("File Share: message friend that ready to connect");

				this.stun.createPeerConnection(this.recipient);

				this.app.connection.emit('relay-send-message', {
					recipient: this.recipient,
					request: 'request file transfer',
					data: {recipient: this.publicKey}
				});
			}
		}
	}

	async handlePeerTransaction(app, tx = null, peer, mycallback) {
		if (tx) {
			let txmsg = tx.returnMessage();

			if (tx.isTo(this.publicKey)) {
				if (txmsg.request == 'query file permission') {
					if (this.sending || this.fileId) {
						this.app.connection.emit('relay-send-message', {
							recipient: tx.from[0].publicKey,
							request: 'deny file permission',
							data: {}
						});

						return;
					}

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
					console.log("Start sending file!");
					this.startTransfer();
					this.overlay.onPeerAccept();
					this.overlay.beginTransfer();
					this.chunkFile(this.file, 0);
					return;
				}

				if (txmsg.request == 'deny file permission') {
					this.overlay.onPeerReject();
					siteMessage('File transfer declined', 5000);
					return;
				}

				if (txmsg.request == 'stop file transfer') {
					this.interrupt();
					return;
				}

				if (txmsg.request == 'request file transfer') {
					this.recipient = tx.from[0].publicKey;
					console.log("FileShare: party followed link to receive!", this.recipient);
					this.overlay.recipient = this.recipient;
					return;
				}

				if (txmsg.module == this.name) {
					if (txmsg.request == 'share file') {
						if (!this.stun || !this.sending) {
							console.warn("No stun / not ready to send!");
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

						let restoredBinary = this.convertBase64ToByteArray(txmsg.data.raw);
						blob.receivedSize += restoredBinary.byteLength;
						blob.receiveBuffer.push(restoredBinary);

						/*console.log(
							restoredBinary.byteLength,
							blob.receivedSize,
							blob.fileSize
						);*/

						// calculate file transfer speed
						this.transferStats(blob.receivedSize);

						if (blob.receivedSize === blob.fileSize) {
							this.overlay.finishTransfer(blob);
						}
					}
				}
			}
		}

		return super.handlePeerTransaction(app, tx, peer, mycallback);
	}

	transferStats(bytesNow) {
		let currentTimestamp = new Date().getTime();

		const byteRate = Math.round(
			(bytesNow - this.bytesPrev) / (currentTimestamp - this.timestampPrev)
		);

		this.timestampPrev = new Date().getTime();

		if (byteRate > this.byteRateMax) {
			this.byteRateMax = byteRate;
		}

		let stats = {
			percentage: ((100 * bytesNow) / this.file.size).toFixed(1),
			amount: this.calcSize(bytesNow),
			speed: `${this.calcSize(byteRate * 1000, 2)}/s`,
			max: this.byteRateMax
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

		console.log(`File is ${[file.name, file.size, file.type, file.lastModified].join(' ')}`);

		this.reader = new FileReader();

		this.reader.addEventListener('error', (error) => console.error('Error reading file:', error));
		this.reader.addEventListener('abort', (event) => console.log('File reading aborted:', event));

		this.reader.addEventListener('load', async (event) => {
			console.log('File Share: onload ', event);

			if (!this.sending) {
				console.warn("Not in sending state!");
				return;
			}

			await this.createFileChunkTransaction(file, event.target.result);

			this.offset += event.target.result.byteLength;

			this.transferStats(this.offset);

			// calculate file transfer speed

			if (this.offset < file.size) {
				this.chunkFile(file, this.offset);
			} else {
				console.log('Finished!');
				this.overlay.finishTransfer();
				this.reset();
			}
		});

		this.file = file;

		this.overlay.updateFileData();

		if (this.recipient) {
			this.sendFileTransferRequest();
		} else {
			this.copyShareLink();
		}
	}

	startTransfer() {
		//Flag so we know if sending/receiving a file
		this.sending = true;

		//navigation away checks...
		window.addEventListener(this.terminationEvent, this.visibilityChange.bind(this));
		window.addEventListener('beforeunload', this.beforeUnloadHandler);
		if (this.app.browser.isMobileBrowser()) {
			document.addEventListener('visibilitychange', this.visibilityChange.bind(this));
		}
	}

	prepareToReceive() {
		this.startTransfer();

		// Send confirmation message to sender
		this.app.connection.emit('relay-send-message', {
			recipient: this.recipient,
			request: 'grant file permission',
			data: {}
		});

		//set up stun listeners for interruptions
		this.app.connection.on('stun-data-channel-close', (peerId) => {
			if (peerId == this.recipient) {
				this.overlay?.onConnectionFailure();
			}
		});
		this.app.connection.on('stun-connection-failed', (peerId) => {
			if (peerId == this.recipient) {
				this.overlay?.onConnectionFailure();
			}
		});
	}

	interrupt(send_message = false) {
		if (this.sending) {
			if (send_message) {
				this.app.connection.emit('relay-send-message', {
					recipient: this.recipient,
					request: 'stop file transfer',
					data: {}
				});
			} else {
				siteMessage('File transfer cancelled', 5000);
			}
			this.sending = false;
		}

		this.overlay.onCancel();
	}

	reset() {
		this.fileId = null;
		this.file = null;
		this.recipient = null;

		this.bytesPrev = 0;
		this.timestampPrev = 0;
		this.byteRateMax = 0;

		this.offset = 0;

		//clear the memory as soon as possible
		delete this.incoming;
		this.incoming = {};

		this.sending = false;

		window.removeEventListener('beforeunload', this.beforeUnloadHandler);
		window.removeEventListener(this.terminationEvent, this.visibilityChange.bind(this));
		if (this.app.browser.isMobileBrowser()) {
			document.removeEventListener('visibilitychange', this.visibilityChange.bind(this));
		}
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
			publicKey: this.publicKey,
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
		let tx = await this.app.wallet.createUnsignedTransaction(this.recipient);

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
		}else{
			console.warn("No stun connection to transfer file!");
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

	beforeUnloadHandler(event) {
		event.preventDefault();
		event.returnValue = true;
	}

	visibilityChange() {
		console.log('visibilitychange triggered');
		this.interrupt(true);
	}

	webServer(app, expressapp, express) {
		let webdir = `${__dirname}/../../mods/${this.dirname}/web`;
		let mod_self = this;

		expressapp.get('/' + encodeURI(this.returnSlug()), async function (req, res) {
			let reqBaseURL = req.protocol + '://' + req.headers.host + '/';

			mod_self.social.url = reqBaseURL + encodeURI(mod_self.returnSlug());

			res.setHeader('Content-type', 'text/html');
			res.charset = 'UTF-8';
			res.send(HomePage(app, mod_self, app.build_number, mod_self.social));
			return;
		});

		expressapp.use('/' + encodeURI(this.returnSlug()), express.static(webdir));
	}

	copyShareLink() {
		if (!this?.file) {
			return;
		}

		let data = {
			publicKey: this.publicKey,
			id: this.fileId,
			name: this.file.name.replace(/\s+/g, ''),
			size: this.file.size,
			type: this.file.type
		};

		let base64obj = this.app.crypto.stringToBase64(JSON.stringify(data));

		let url1 = window.location.origin + '/fileshare/';

		let link = `${url1}?file=${base64obj}`;

		navigator.clipboard.writeText(link);
		siteMessage('Invite link copied to clipboard', 1500);
	}
}

module.exports = Fileshare;
