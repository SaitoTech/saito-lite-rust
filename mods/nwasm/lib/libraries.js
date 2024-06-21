const saito = require('./../../../lib/saito/saito');
const JSON = require('json-bigint');
const NwasmLibraryTemplate = require('./libraries.template');
const LoadRom = require('./load-rom');
const Transaction = require('../../../lib/saito/transaction').default;

class NwasmLibrary {

	constructor(app, mod = null) {
		this.app = app;
		this.mod = mod;
		this.loader = new LoadRom(app, mod);
	}

	hide() {
		let obj = document.getElementById('nwasm-instructions');
		if (obj) { obj.style.display = 'none'; }
		    obj = document.getElementById('nwasm-libraries');
		if (obj) { obj.style.display = 'none'; }
	}

	async render() {

		let nwasm_self = this.mod;

		//
		// exit if no games...
		//
		let games_to_show = false;
		for (let peer in nwasm_self.library) {
		  	if (nwasm_self.library[peer].length > 0) { games_to_show = true; }
		}
		if (games_to_show == false) { 
		  	return; 
		} else {
			if (document.querySelector('.nwasm-instructions')) {
				document.querySelector('.nwasm-instructions').style.display =
					'none';
			}
		}

		//
		// otherwise render contain for library content
		//
		if (document.querySelector('.nwasm-libraries')) {
			this.app.browser.replaceElementBySelector(
				NwasmLibraryTemplate(this.app, this.mod),
				'.nwasm-libraries'
			);
		} else {
			this.app.browser.addElementToDom(
				NwasmLibraryTemplate(this.app, this.mod)
			);
		}
		if (document.querySelector('.nwasm-libraries')) {
			document.querySelector('.nwasm-libraries').style.display = 'block';
		}

		//
		// render items in library
		//
		try {
			for (let peer in nwasm_self.library) {
				let lib = nwasm_self.library[peer];
				for (let i = 0; i < lib.length; i++) {
					let item = lib[i];
					this.renderItem(item, peer);
				}
			}
		} catch (err) {
			console.log('Error showing libraries in NwasmLibrary... ' + err);
		}

		this.attachEvents();
	}

	renderItem(item, publickey) {

		let status = 'available';
		let available = item.available;
		if (available == 0) {
			status = 'loaned out';
		} else {
			available = available.toString() + '/' + item.num.toString();
		}

		this.app.browser.addElementToSelector(
			`
				<div id="${item.sig}" data-id="${publickey}" class="saito-table-row">
				  <div class="nwasm-lib-title">${item.title}</div>
				  <div class="nwasm-lib-copies">${available}</div>
				  <div class="nwasm-lib-status">${status}</div>
				  <div class="nwasm-lib-sig">${item.sig}</div>
				  <div class="nwasm-lib-owner">${publickey}</div>
				</div>

			`, '.nwasm-libraries'
		);
	}

	attachEvents() {

		let nwasm_self = this.mod;

		try {
			for (let peer in nwasm_self.library) {
				let lib = nwasm_self.library[peer];
				for (let i = 0; i < lib.length; i++) {
					let item = lib[i];
					this.attachEventsToItem(item, peer);
				}
			}
		} catch (err) {
			console.log('Error showing libraries in NwasmLibrary... ' + err);
		}
	}



	attachEventsToItem(item, publickey) {

		let nwasm_self = this.mod;
		let lib_self = this;

		let status = 'available';
		if (item.num == 0) { status = 'loaned out'; }

		let obj = document.getElementById(item.sig);
		if (obj) {
			if (status !== 'available') {
				obj.onclick = async (e) => {
					if (publickey === (await this.app.wallet.getPublicKey())) {
						alert('Your title is out on loan. Please try again in a few hours.');
					} else {
						alert('This title is not available at present.');
					}
				};
			} else {
				obj.onclick = async (e) => {

					//
					// show loader
					//
					this.loader.render();
					this.hide();

					//
					// grab sig and publickey
					//
					let sig = obj.getAttribute('id');
					let publickey = obj.getAttribute('data-id');

					//
					// if this is our ROM
					//
					if (publickey === nwasm_self.publicKey) {
alert("trying checkout!");
						nwasm_self.checkout(
							nwasm_self.publicKey,			// i am borrower
							sig,					// this is sig
							function (txs) {			// callback after borrow

alert("callback run!");
								if (txs == null) {
									alert('Cannot checkout item...');
									return;
								}

								if (txs.length > 0) {

									console.log('THEREIS AT LEAST 1 TX');

									try {
										let tx = txs[0];
										nwasm_self.ui.hide();
										lib_self.loader.overlay.hide();
										alert('about to load rom file...');
										nwasm_self.loadRomFile(tx);
									} catch (err) {
										console.log('Error downloading and decrypting: ' + err);
									}
								} else {
									alert('ERROR LOADING NWASM ROM');
									console.log('ERROR TXS LIBRARY: ' + JSON.stringify(txs));
									alert('Error - is network down?');
								}
							}
						);

					//
					// ROM is in peer library, must buy or borrow
					//
					} else {
alert("is not ours!");
						let nwasm_mod = this.mod;
						let message = {};
						message.request = 'library collection';
						message.data = {};
						message.data.collection = 'Nwasm';
						message.data.signature = sig;

						let peer = null;
						let peers = await this.app.network.getPeers();
						for (let i = 0; i < peers.length; i++) {
							//
							// libraries organized by publickey
							//
							if (peers[i].publicKey === publickey) {
								peer = peers[i];
								i = peers.length + 100; // buffer against connect/disconnect
							}
						}

						alert('fetching...');
						this.app.network.sendRequestAsTransaction(
							message.request,
							message.data,
							function (res) {},
							peer.peerIndex
						);
					}
				};
			}
		}
	}

}

module.exports = NwasmLibrary;
