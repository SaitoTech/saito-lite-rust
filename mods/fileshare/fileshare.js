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
		this.slug = 'fileshare';
		this.description = 'Send files P2P over STUN';
		this.categories = 'Utility Entertainment';
		this.chunkSize = 16348;

		this.stun = null;

		this.outgoing_files = {};
		/***********
		fileId (randomly generated code) -> { obj } mapping
		obj : {
			file: {
				name: file name
				size: file size,
				type: file type
			}

			recipient
			overlay
			sending: 
			offset: 0
			bytesPrev:
			timestampPrev:
			byteRateMax:
			
		}
		************/
		this.incoming = {};
		/***********
		fileId (randomly generated code) -> { obj } mapping
		obj : {
			name: file name
			size: file size,
			type: file type,
			sender: publickey
			overlay
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

			const fileId = data.id;

			const file = {
				name: data.name,
				size: data.size,
				type: data.type,
				sender: data.publicKey,
				bytesPrev: 0,
				timestampPrev: 0,
				byteRateMax: 0,
				receiveBuffer: [],
				receivedSize: 0,
				overlay: new FileReceiveOverlay(this.app, this, fileId, data.publicKey)
			}

			this.incoming[fileId] = file;
			file.overlay.render(file);

		} else {
			//this.sendFile();
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
						callback: function (app, id = '') {

							const fileId = fss.app.crypto.generateRandomNumber().substring(0, 12);

							fss.outgoing_files[fileId] = {
								recipient,
								overlay: new FileShareOverlay(app, fss, fileId, recipient),
								bytesPrev: 0,
								timestampPrev: 0,
								byteRateMax: 0,
								offset: 0
							};

							fss.outgoing_files[fileId].overlay.render();

							//
							if (!fss.stun.hasConnection(recipient)) {
								fss.stun.createPeerConnection(recipient);
							} else {
								console.log("emit dummy event")
								fss.app.connection.emit('stun-data-channel-open', recipient);
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
		let fileId = this.app.crypto.generateRandomNumber().substring(0, 12);

		this.outgoing_files[fileId] = {
			overlay: new FileShareOverlay(this.app, this, fileId),
			bytesPrev: 0,
			timestampPrev: 0,
			byteRateMax: 0,
			offset: 0
		};

		this.outgoing_files[fileId].overlay.render();

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

				const data = JSON.parse(
					this.app.crypto.base64ToString(this.app.browser.returnURLParameter('file'))
				);

				const pkey = data.publicKey;

				console.log("File Share: message friend that ready to connect -- ", pkey);

				this.app.connection.emit('relay-send-message', {
					recipient: pkey,
					request: 'request file transfer',
					data: {
						recipient: this.publicKey,
						id: data.id
					}
				});

				this.app.connection.emit("open-chat-with", {key: pkey});
			}
		}
	}

	async handlePeerTransaction(app, tx = null, peer, mycallback) {
		if (tx) {
			let txmsg = tx.returnMessage();

			if (tx.isTo(this.publicKey)) {
				//if (txmsg.request.includes("file")){
				//	console.log(txmsg);
				//}

				if (txmsg.request == 'query file permission') {

					const file = {
						name: txmsg.data.name,
						size: txmsg.data.size,
						type: txmsg.data.type,
						sender: tx.from[0].publicKey,
						bytesPrev: 0,
						timestampPrev: 0,
						byteRateMax: 0,
						receiveBuffer: [],
						receivedSize: 0,
					}
					const fileId = txmsg.data.id;

					this.incoming[fileId] = file;

					file.overlay = new FileReceiveOverlay(this.app, this, fileId, tx.from[0].publicKey);
					file.overlay.render(file);

					return;
				}

				if (txmsg.request == 'grant file permission') {
					console.log("Start sending file !" + txmsg.data.id);
					this.addNavigationProtections();
					const fs = this.outgoing_files[txmsg.data.id];

					if (!fs.sending){
						fs.sending = true;
						fs.overlay.onPeerAccept();
						fs.overlay.beginTransfer();

						const slice = fs.file.slice(0, this.chunkSize);
						fs.reader.readAsArrayBuffer(slice);
					}

					return;
				}

				if (txmsg.request == 'deny file permission') {
					if (this.outgoing_files[txmsg.data.id]){
						this.outgoing_files[txmsg.data.id].overlay.onPeerReject();
						siteMessage('File transfer declined', 5000);
					}
					if (this.incoming[txmsg.data.id]){
						this.incoming[txmsg.data.id].overlay.onCancel();
						this.reset(txmsg.data.id);
						siteMessage('File transfer declined', 5000);
					}
					return;
				}

				if (txmsg.request == 'stop file transfer') {
					this.interrupt(txmsg.data.id);

					let file = this.outgoing_files[txmsg.data.id] || this.incoming[txmsg.data.id];
					if (file){
						file.overlay.onCancel();
					}

					this.reset(txmsg.data.id);
					return;
				}

				if (txmsg.request == 'request file transfer') {
					let recipient = tx.from[0].publicKey;
					let fileId = txmsg.data.id;
					console.log("FileShare: party followed link to receive!", recipient);

					if (this.outgoing_files[fileId]) {

						const file = this.outgoing_files[fileId].file;
						//Hide the original overlay
						this.outgoing_files[fileId].overlay.remove();

						//create a new item
						let newfileid = this.app.crypto.generateRandomNumber().substring(0, 12);

						this.app.connection.emit('relay-send-message', {
							recipient,
							request: 'update file transfer',
							data: { old_id: fileId, new_id: newfileid }
						});

						this.outgoing_files[newfileid] = {
							recipient,
							overlay: new FileShareOverlay(this.app, this, newfileid, recipient),
							bytesPrev: 0,
							timestampPrev: 0,
							byteRateMax: 0,
							offset: 0
						};

						this.outgoing_files[newfileid].overlay.render(false);
						this.outgoing_files[newfileid].overlay.onFile(file);
						this.addFileUploader(file, newfileid);

						console.log("Send updated file code and wait for their confirmation");
					}

					return;
				}

				if (txmsg.request == 'update file transfer') {

					console.log("FILE SHARE UPDATE: ", txmsg.request, txmsg.data);

					if (this.incoming[txmsg.data.old_id]){
						this.incoming[txmsg.data.old_id].overlay.remove();
						this.reset(txmsg.data.old_id);
						this.stun.createPeerConnection(tx.from[0].publicKey);
					}

					return;
				}

				if (txmsg.module == this.name) {
					if (txmsg.request == 'share file') {

						const blob = this.incoming[txmsg.data.meta.id];

						if (!this.stun || !blob?.sending) {
							console.warn("No stun / not ready to receive!");
							return;
						}

						let restoredBinary = this.convertBase64ToByteArray(txmsg.data.raw);
						blob.receivedSize += restoredBinary.byteLength;
						blob.receiveBuffer.push(restoredBinary);

						this.sendReadReceipt(txmsg.data.meta);

						// calculate file transfer speed
						this.transferStats(blob, blob.receivedSize);

						if (blob.receivedSize === blob.size) {
							blob.overlay.finishTransfer(blob);
						}
					}

					if (txmsg.request == 'read receipt') {
						//data: { id, chunk_id }
						const fileId = txmsg.data.id;
						if (this.outgoing_files[fileId]){
							let received_bytes = txmsg.data.chunk_id * this.chunkSize;
							let percentage = (100 * received_bytes / this.outgoing_files[fileId].file.size).toFixed(2);
							this.outgoing_files[fileId].overlay.updateRStats(percentage);
						}
					}
				}
			}
		}

		return super.handlePeerTransaction(app, tx, peer, mycallback);
	}

	transferStats(file, bytesNow) {
		let currentTimestamp = new Date().getTime();

		const byteRate = Math.round(
			(bytesNow - file.bytesPrev) / (currentTimestamp - file.timestampPrev)
		);

		file.timestampPrev = currentTimestamp;

		if (byteRate > file.byteRateMax) {
			file.byteRateMax = byteRate;
		}

		let stats = {
			percentage: ((100 * bytesNow) / file.size).toFixed(1),
			amount: this.calcSize(bytesNow),
			speed: `${this.calcSize(byteRate * 1000, 2)}/s`,
			max: file.byteRateMax
		};

		file.bytesPrev = bytesNow;
		file.overlay.renderStats(stats);
	}

	addFileUploader(file, fileId) {

		if (!file) {
			console.warn('No file chosen');
			return;
		}
		if (file.size === 0) {
			console.warn('File is empty');
			return;
		}

		this.outgoing_files[fileId].file = file;
		this.outgoing_files[fileId].size = file.size;
		this.outgoing_files[fileId].iterator = 1;

		console.log(`File is ${[file.name, file.size, file.type].join(' ')}`);

		this.outgoing_files[fileId].reader = new FileReader();

		this.outgoing_files[fileId].reader.addEventListener('error', (error) => console.error('Error reading file:', error));
		this.outgoing_files[fileId].reader.addEventListener('abort', (event) => console.log('File reading aborted:', event));

		this.outgoing_files[fileId].reader.addEventListener('load', async (event) => {

			if (!this.outgoing_files[fileId]?.sending) {
				console.warn("Not in sending state! Stop reading file!");
				return;
			}

			await this.createFileChunkTransaction(fileId, event.target.result);

			this.outgoing_files[fileId].offset += event.target.result.byteLength;

			this.outgoing_files[fileId].iterator++;
			
			this.transferStats(this.outgoing_files[fileId], this.outgoing_files[fileId].offset);

			// calculate file transfer speed

			if (this.outgoing_files[fileId].offset < file.size) {				
				let offset = this.outgoing_files[fileId].offset;
				const slice = this.outgoing_files[fileId].file.slice(offset, offset + this.chunkSize);
				this.outgoing_files[fileId].reader.readAsArrayBuffer(slice);
			} else {
				console.log('Finished!');
				this.outgoing_files[fileId].overlay.finishTransfer();
			}
		});

		this.outgoing_files[fileId].overlay.updateFileData(file);

		if (this.outgoing_files[fileId].recipient) {
			this.sendFileTransferRequest(fileId, file);
		} else {
			this.copyShareLink(fileId);
		}
	}


	addNavigationProtections(){
		if (Object.keys(this.outgoing_files).length + Object.keys(this.incoming).length <= 1){
			//navigation away checks...
			window.addEventListener(this.terminationEvent, this.visibilityChange.bind(this));
			window.addEventListener('beforeunload', this.beforeUnloadHandler);
			if (this.app.browser.isMobileBrowser()) {
				document.addEventListener('visibilitychange', this.visibilityChange.bind(this));
			}

		}
	}

	prepareToReceive(fileId) {

		this.incoming[fileId].sending = true;
		const sender = this.incoming[fileId].sender;

		this.addNavigationProtections();

		// Send confirmation message to sender
		this.app.connection.emit('relay-send-message', {
			recipient: sender,
			request: 'grant file permission',
			data: { id: fileId }
		});

	}

	interrupt(fileId, send_to = "") {
		let file = this.outgoing_files[fileId] || this.incoming[fileId];

		if (!file){
			console.log("No file selected, don't bother");
			return;
		}

		file.overlay.onCancel();
		
		if (send_to) {
			this.app.connection.emit('relay-send-message', {
				recipient: send_to,
				request: 'stop file transfer',
				data: { id: fileId}
			});
		} else {
			siteMessage('File transfer cancelled', 5000);
		}
	
		file.sending = false;
	
	}

	reset(fileId) {

		delete this.outgoing_files[fileId];
		delete this.incoming[fileId];

		if (Object.keys(this.outgoing_files).length + Object.keys(this.incoming).length == 0){
 			window.removeEventListener('beforeunload', this.beforeUnloadHandler);
			window.removeEventListener(this.terminationEvent, this.visibilityChange.bind(this));
			if (this.app.browser.isMobileBrowser()) {
				document.removeEventListener('visibilitychange', this.visibilityChange.bind(this));
			}
		}
	}

	sendFileTransferRequest(fileId, file) {
		if (!file) {
			console.warn('No file selected!');
			return;
		}

		let data = {
			publicKey: this.publicKey,
			id: fileId,
			name: file.name.replace(/\s+/g, ''),
			size: file.size,
			type: file.type
		};

		this.app.connection.emit('relay-send-message', {
			recipient: this.outgoing_files[fileId].recipient,
			request: 'query file permission',
			data
		});
	}

	sendRejectTransferTransaction(fileId, sender){
		this.app.connection.emit('relay-send-message', {
			recipient: sender,
			request: 'deny file permission',
			data: {
				id: fileId,
				from: this.publicKey
			}
		});
	}

	async createFileChunkTransaction(fileId, rawData) {
		let obj = this.outgoing_files[fileId];

		let tx = await this.app.wallet.createUnsignedTransaction(obj.recipient);

		//let base64data = this.xorBase64(this.convertByteArrayToBase64(data));

		tx.msg = {
			module: this.name,
			request: 'share file',
			data: {
				meta: {
					id: fileId,
					name: obj.file.name.replace(/\s+/g, ''),
					size: obj.file.size,
					type: obj.file.type,
					offset: obj.offset,
					chunk_id: obj.iterator,
					chunk: rawData.byteLength
				},
				raw: this.convertByteArrayToBase64(rawData)
			}
		};

		await tx.sign();

		//
		// No fallback to onchain or relay (on purpose!)
		//
		if (this?.stun && this.stun.hasConnection(obj.recipient)) {
			this.stun.sendTransaction(obj.recipient, tx);
		}else{
			console.warn("No stun connection to transfer file!");
		}
	}

	async sendReadReceipt(data) {
		let id = data.id;
		let obj = this.incoming[id];

		let tx = await this.app.wallet.createUnsignedTransaction(obj.sender);

		tx.msg = {
			module: this.name,
			request: 'read receipt',
			data: {
				id,
				chunk_id: data.chunk_id,
			}
		};

		await tx.sign();

		if (this?.stun && this.stun.hasConnection(obj.sender)) {
			this.stun.sendTransaction(obj.sender, tx);
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
		for (let id in this.outgoing_files){
			this.interrupt(id, this.outgoing_files[id].recipient);	
		}
		for (let id in this.incoming){
			this.interrupt(id, this.incoming[id].sender);		
		}
		
	}

	webServer(app, expressapp, express) {
		let webdir = `${__dirname}/../../mods/${this.dirname}/web`;
		let mod_self = this;

		expressapp.get('/' + encodeURI(this.returnSlug()), async function (req, res) {
			let reqBaseURL = req.protocol + '://' + req.headers.host + '/';

			mod_self.social.url = reqBaseURL + encodeURI(mod_self.returnSlug());

			if (!res.finished) {
				res.setHeader('Content-type', 'text/html');
				res.charset = 'UTF-8';
				return res.send(HomePage(app, mod_self, app.build_number, mod_self.social));
			}
			return;
		});

		expressapp.use('/' + encodeURI(this.returnSlug()), express.static(webdir));
	}

	copyShareLink(fileId) {
		if (!this.outgoing_files[fileId]) {
			return;
		}

		this.addNavigationProtections();

		let data = {
			publicKey: this.publicKey,
			id: fileId,
			name: this.outgoing_files[fileId].file.name.replace(/\s+/g, ''),
			size: this.outgoing_files[fileId].file.size,
			type: this.outgoing_files[fileId].file.type
		};

		let base64obj = this.app.crypto.stringToBase64(JSON.stringify(data));

		let url1 = window.location.origin + '/fileshare/';

		let link = `${url1}?file=${base64obj}`;

		navigator.clipboard.writeText(link);
		siteMessage('Invite link copied to clipboard', 2500);
	}
}

module.exports = Fileshare;
