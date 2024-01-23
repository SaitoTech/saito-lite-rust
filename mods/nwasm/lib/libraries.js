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
		this.header_inserted = false;
	}

	hide() {
		let obj = document.getElementById('nwasm-libraries');
		if (obj) {
			obj.style.display = 'none';
		}
	}

	renderItemInLibrary(item, publickey) {
		let status = 'available';
		let available = item.available;
		if (available == 0) {
			status = 'loaned out';
		} else {
			available = available.toString() + '/' + item.num.toString();
		}

		if (item.title != '') {
			if (this.header_inserted == false) {
				this.app.browser.addElementToSelector(
					`
	  <div id="nwasm-libraries-header" class="saito-table-row saito-table-header nwasm-libraries-header">
	    <div class="nwasm-lib-title">title</div>
	    <div class="nwasm-lib-copies">copies</div>
	    <div class="nwasm-lib-status">status</div>
	  </div>
	`,
					'.nwasm-libraries'
				);
				this.header_inserted = true;
			}
			this.app.browser.addElementToSelector(
				`
	<div id="${item.sig}" data-id="${publickey}" class="saito-table-row">
	  <div class="nwasm-lib-title">${item.title}</div>
	  <div class="nwasm-lib-copies">${available}</div>
	  <div class="nwasm-lib-status">${status}</div>
	</div>
      `,
				'.nwasm-libraries'
			);
		}
	}

	attachEventsToItemInLibrary(item, publickey) {
		let nwasm_self = this;

		let status = 'available';
		if (item.num == 0) {
			status = 'loaned out';
		}

		let obj = document.getElementById(item.sig);

		if (obj) {
			if (status !== 'available') {
				obj.onclick = async (e) => {
					if (publickey === (await this.app.wallet.getPublicKey())) {
						alert(
							'Your title is out on loan. Please try again in a few hours.'
						);
					} else {
						alert(
							'This title is not available for play currently.'
						);
					}
				};
			} else {
				obj.onclick = async (e) => {
					//
					// show loader
					//
					this.loader.render();

					//
					// sig and publickey
					//
					let sig = obj.getAttribute('id');
					let publickey = obj.getAttribute('data-id');

					if (publickey === (await this.app.wallet.getPublicKey())) {
						let library_mod =
							this.app.modules.returnModule('Library');
						library_mod.checkoutItem(
							'Nwasm',
							await this.app.wallet.getPublicKey(),
							sig,
							function (txs) {
								if (txs == null) {
									alert('Cannot checkout item...');
									return;
								}

								if (txs.length > 0) {
									console.log('THEREIS AT LEAST 1 TX');

									try {
										let tx = txs[0];
										nwasm_self.mod.hideLibrary();
										nwasm_self.loader.overlay.hide();
										alert('about to load rom file...');
										nwasm_self.mod.loadRomFile(tx);
									} catch (err) {
										console.log(
											'Error downloading and decrypting: ' +
												err
										);
									}
								} else {
									alert('ERROR LOADING NWASM ROM');
									console.log(
										'ERROR TXS LIBRARY: ' +
											JSON.stringify(txs)
									);
									alert('Error - is network down?');
								}
							}
						);
					} else {
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
								let peer = peers[i];
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

	async render() {
		let library_mod = this.app.modules.returnModule('Library');
		if (!library_mod) {
			return;
		}

		//
		// main container
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

		//
		// hide default message if exists
		//
		if (document.querySelector('.nwasm-instructions')) {
			document.querySelector('.nwasm-instructions').style.display =
				'none';
		}

		//
		// make visible again
		//
		if (document.querySelector('.nwasm-libraries')) {
			document.querySelector('.nwasm-libraries').style.display = 'block';
		}

		try {
			for (let key in library_mod.library) {
				let peers = library_mod.library[key].peers;
				for (let p in peers) {
					for (let i = 0; i < peers[p].length; i++) {
						let item = peers[p][i];
						this.renderItemInLibrary(item, p);
					}
				}
			}
		} catch (err) {
			console.log('Error showing libraries in NwasmLibrary... ' + err);
		}

		this.attachEvents();
	}

	attachEvents() {
		let library_mod = this.app.modules.returnModule('Library');
		if (!library_mod) {
			return;
		}

		try {
			for (let key in library_mod.library) {
				let peers = library_mod.library[key].peers;
				for (let p in peers) {
					for (let i = 0; i < peers[p].length; i++) {
						let item = peers[p][i];
						this.attachEventsToItemInLibrary(item, p);
					}
				}
			}
		} catch (err) {
			console.log('Error showing libraries in NwasmLibrary... ' + err);
		}
	}
}

module.exports = NwasmLibrary;
