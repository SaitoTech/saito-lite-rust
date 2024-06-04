const saito = require('../../lib/saito/saito');
const Transaction = require('../../lib/saito/transaction').default;
const ModTemplate = require('../../lib/templates/modtemplate');
const PhotoUploader = require('../../lib/saito/ui/saito-photo-uploader/saito-photo-uploader');
const UpdateDescription = require('./lib/ui/update-description');

class Profile extends ModTemplate {
	constructor(app) {
		super(app);
		this.app = app;
		this.name = 'Profile';
		this.description = 'Profile Module';
		this.archive_public_key;
		this.cache = {};

		app.connection.on('profile-fetch-content-and-update-dom',
			async (key) => {

				console.log('profile-fetch-content-and-update-dom');

				// 
				// If not cached, check my local archives
				// 
				if (!this.cache[key]) {
					this.cache[key] = {};
					
					if (this.app.keychain.isWatched(key)) {

						let returned_key = this.app.keychain.returnKey(key);

						if (returned_key?.banner){
							this.cache[key].banner = await this.fetchProfileFromArchive("banner", returned_key.banner);
						}

						if (returned_key?.description){
							this.cache[key].description = await this.fetchProfileFromArchive("description", returned_key.description);
						}

						if (returned_key?.image){
							this.cache[key].image = await this.fetchProfileFromArchive("image", returned_key.image);
						}
					}
				}

				this.updateProfileDom(this.cache[key], key);

				if (this.publicKey !== key && !this.app.keychain.isWatched(key)) {
					//Check remote archives
					this.app.storage.loadTransactions(
						{ field1: "Profile", field2: key }, 
						async (txs) => {
							let data_found = {};
							if (txs?.length > 0) {
								//Go reverse order for oldest first
								for (let i = txs.length - 1; i >= 0; i--) {
									let txmsg = txs[i].returnMessage();
									console.log("Remote Archive Profile TX: ", txmsg);
									Object.assign(data_found, txmsg.data);
								}
							}

							Object.assign(this.cache[key], data_found);
							this.updateProfileDom(this.cache[key], key);
						},
					null);
				}

				console.log(this.cache);
			}
		);

		app.connection.on('profile-edit-banner', () => {
			this.photoUploader = new PhotoUploader(
				this.app,
				this.mod,
				'banner'
			);
			this.photoUploader.callbackAfterUpload = async (photo) => {
				let banner = await this.app.browser.resizeImg(photo);
				this.sendProfileTransaction({ banner });
			};
			this.photoUploader.render(this.photo);
		});

		app.connection.on('profile-edit-description', (key) => {
			const elementId = `profile-description-${key}`;
			const element = document.querySelector(`#${elementId}`);
			this.updateDescription = new UpdateDescription(this.app, this);
			this.updateDescription.render(element.textContent);
		});

	}

	async onConfirmation(blk, tx, conf) {
		let txmsg = tx.returnMessage();
		if (conf == 0) {
			if (txmsg.request === 'update profile') {
				console.log("Profile onConfirmation");

				await this.receiveProfileTransaction(tx);

			}
		}
	}

	/**
	 * Asynchronously sends a transaction to update a user's profile.
	 *
	 * @param {Object} data { image, banner, description, archive: {publicKey}}
	 *
	 **/
	async sendProfileTransaction(data) {

		this.app.connection.emit("saito-header-update-message", {msg: "broadcasting profile update"})

		let newtx =
			await this.app.wallet.createUnsignedTransactionWithDefaultFee(
				this.publicKey
			);
		newtx.msg = {
			module: this.name,
			request: 'update profile',
			data
		};
		
		await newtx.sign();

		this.app.connection.emit('profile-update-dom', this.publicKey, data);

		await this.app.network.propagateTransaction(newtx);

	}

	/**
	 * Processes a received transaction to update a user's profile.
	 *
	 * @param {Object} tx - The transaction object received, containing data to be processed.
	 **/
	async receiveProfileTransaction(tx) {

		let from = tx?.from[0]?.publicKey;

		if (!from) {
			console.error("Profile: Invalid TX");
			return;
		}

		let txmsg = tx.returnMessage();
		let data = {};

		console.log("PROFILE UPDATE: ", txmsg.data);

		for (let key in txmsg.data) {
			if (key == "archive") {
				data[key] = txmsg.data[key];
			} else {
				data[key] = tx.signature;
			}
		}


		//
		// Update (server) cache
		//
		if (!this.cache[from]){
			this.cache[from] = {};
		}

		Object.assign(this.cache[from], txmsg.data);

		//
		// Save update transaction in archive if server or we do the key
		//
		if (this.app.keychain.isWatched(from) || !this.app.BROWSER){
			// 
			// Save index reference in keychain (if we follow the key)
			//
			if (this.app.keychain.isWatched(from)) {
				this.app.keychain.addKey(from, data);
			}

			await this.saveProfileTransaction(tx);	
		}

		//
		// Update my UI to confirm that tx was received on chain
		//
		if (tx.isFrom(this.publicKey)) {
			// Clear the saito-header notification from sendProfileTransaction
			this.app.connection.emit("saito-header-update-message", {msg: ""})
			siteMessage('Profile updated', 2000);
		}

		if (this.app.keychain.isWatched(from)){
			this.updateProfileDom(this.cache[from], from);
		}

	}

	//
	//
	//  LOAD PROFILE VALUES FUNCTIONS
	//
 	async fetchProfileFromArchive(field, sig) {
 		return this.app.storage.loadTransactions({ sig, field1: 'Profile' },
			(txs) => {
				if (txs?.length > 0) {
					for (let tx of txs){
						let txmsg = tx.returnMessage();
						if (txmsg.data[field]){
							return txmsg.data[field];
						}
					}
				}
				return null;
			},
			'localhost');
 	}


	//
	// Every profile update saves a new transaction to the archive, and in the keychain 
	// we store the signature of the most recent update so that we can pull that up
	//
	async saveProfileTransaction(tx) {

		await this.app.storage.saveTransaction(
			tx,
			{ field1: 'Profile', preserve: 1 },
			'localhost'
		);
	}


	updateProfileDom(profile, key){
		//
		// Plug in any info I found
		//
		if (profile?.banner){
			const element = document.querySelector(`#profile-banner-${key}`);
			if (element){
				element.style.backgroundImage = `url('${profile.banner}')`;
			}
		}

		if (profile?.description){
			const element = document.querySelector(`#profile-description-${key}`);
			if (element){
				element.textContent = profile.description;
			}
		}

		if (profile?.image){
			const element = document.querySelector(`#profile-image-${key}`);
			if (element){
				element.src = profile.image;
			}
		}


	}

}

module.exports = Profile;
