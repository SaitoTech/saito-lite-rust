const saito = require('../../lib/saito/saito');
const Transaction = require('../../lib/saito/transaction').default;
const ModTemplate = require('../../lib/templates/modtemplate');
const PhotoUploader = require('../../lib/saito/ui/saito-photo-uploader/saito-photo-uploader');
const UpdateDescription = require('./lib/ui/update-description');
const SaitoHeader = require('../../lib/saito/ui/saito-header/saito-header');
const SaitoProfile = require('../../lib/saito/ui/saito-profile/saito-profile');
const pageHome = require('./index');

class Profile extends ModTemplate {
	constructor(app) {
		super(app);
		this.app = app;
		this.name = 'Profile';
		this.slug = 'profile';
		this.description = 'Profile Module';
		this.archive_public_key;
		this.cache = {};
		this.enable_profile_edits = true;

	    this.social = {
	      twitter: '@SaitoOfficial',
	      title: '🟥 Saito User - Web3 Social Media',
	      url: 'https://saito.io/redsquare#profile',
	      description: 'Peer to peer Web3 social media platform',
	      image: 'https://saito.tech/wp-content/uploads/2022/04/saito_card.png' //square image with "Saito" below logo
	    };

		app.connection.on('profile-fetch-content-and-update-dom',
			async (key) => {

				//console.log('profile-fetch-content-and-update-dom --- ' + key);

				// 
				// If not cached, check archives
				// 
				if (!this.cache[key]) {
					this.cache[key] = {};
					
					//console.log("PROFILE: Need to cache -- ",key);

					if (this.app.keychain.isWatched(key)) {

						let returned_key = this.app.keychain.returnKey(key);

						if (returned_key?.profile) {

							this.cache[key] = await this.fetchProfileFromArchive(returned_key);

							//console.log("PROFILE: async fetches for watched key finished");
						
						}

					} else {

						this.app.storage.loadTransactions(
							{ field1: "Profile", field2: key }, 
							async (txs) => {
								let data_found = {};
								if (txs?.length > 0) {
									//Go reverse order for oldest first
									for (let i = txs.length - 1; i >= 0; i--) {
										let txmsg = txs[i].returnMessage();
										//console.log("Remote Archive Profile TX: ", txmsg);
										Object.assign(data_found, txmsg.data);
									}
								}

								Object.assign(this.cache[key], data_found);
								this.app.connection.emit('profile-update-dom', key, this.cache[key]);
							},
						null);

						return;
					}
				}
				
				this.app.connection.emit('profile-update-dom', key, this.cache[key]);

			}
		);

		app.connection.on('profile-edit-banner', (profile_key) => {
			this.photoUploader = new PhotoUploader(
				this.app,
				this.mod,
				'banner'
			);
			this.photoUploader.callbackAfterUpload = async (photo) => {
				let banner = await this.app.browser.resizeImg(photo);
				this.sendProfileTransaction({ banner }, profile_key);
			};
			this.photoUploader.render(this.photo);
		});

		app.connection.on('profile-edit-description', (key) => {
			const elementId = `profile-description-${key}`;
			const element = document.querySelector(`#${elementId}`);
			this.updateDescription = new UpdateDescription(this.app, this, key);
			this.updateDescription.render(element.textContent);
		});

	}


	async onConfirmation(blk, tx, conf) {
		let txmsg = tx.returnMessage();
		if (conf == 0) {
			if (txmsg.request === 'update profile') {
				//console.log("Profile onConfirmation");

				await this.receiveProfileTransaction(tx);

			}
		}
	}


	async onPeerServiceUp(app, peer, service = {}) {

		if (!app.BROWSER) {
			return;
		}

		if (service.service === 'archive') {

			let keys_to_check = app.keychain.returnKeys( {watched: true, profile: undefined} );

			for (let key of keys_to_check) {

				// Save an empty profile, so we don't keep querying on every page load... 
				// if we are watching them, we will get the tx when they update...
				//
				app.keychain.addKey(key.publicKey, { profile: {} });

				//
				//Check remote archives
				//
				await app.storage.loadTransactions(
					{ field1: "Profile", field2: key.publicKey }, 
					async (txs) => {
						let txs_found = {};
						// We want to get the most recent tx for description/image/banner
						if (txs?.length > 0) {
							for (let i = txs.length - 1; i >= 0; i--) {
								let txmsg = txs[i].returnMessage();
								for (let k in txmsg.data){
									txs_found[k] = txs[i];
								}
							}
						}
						for (let k in txs_found){
							await this.receiveProfileTransaction(txs_found[k]);
						}
					}
				);
			}
		}
	}


	async render() {

		// Check for URL param (since that is the prime use case)
 	   	let param = this.app.browser.returnURLParameter('load_key');
    		if (param){
    		let key = JSON.parse(this.app.crypto.base64ToString(param));

    		//console.log("My key: ", this.publicKey, "Wanted Key: ", key.publicKey);

    		if (key.publicKey !== this.publicKey){
				let result = await this.app.wallet.onUpgrade('import', key.privateKey);
				if (result){
					let c = await sconfirm(`Import key ${this.app.keychain.returnUsername(key.publicKey)}?`);
					if (c){
						reloadWindow(300);
					}
					return;
				}
    		}
    	}

		this.main = new SaitoProfile(this.app, this);
		this.header = new SaitoHeader(this.app, this);

		await this.header.initialize(this.app);

		this.main.reset(this.publicKey);

		this.addComponent(this.main);
		this.addComponent(this.header);

		await super.render(this.app, this);
	}


	/**
	 * Asynchronously sends a transaction to update a user's profile.
	 *
	 * @param {Object} data { image, banner, description, archive: {publicKey}}
	 *
	 **/
	async sendProfileTransaction(data) {

		this.app.connection.emit("saito-header-update-message", {msg: "broadcasting profile update"})

		let newtx =  await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey);
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

		//
		// Update (server) cache with profile data
		//
		if (!this.cache[from]){
			this.cache[from] = {};
		}

		Object.assign(this.cache[from], txmsg.data);

		//
		// If we follow the key, save the indices (tx sig) in our keychain
		// and archive the transactions
 		//
		if (this.app.BROWSER && this.app.keychain.isWatched(from)) {

			console.log(`PROFILE UPDATE for ${this.app.keychain.returnUsername(from)}: `, txmsg.data);

			let data = {};

			for (let key in txmsg.data) {
				if (key == "archive") {
					data[key] = txmsg.data[key];
				} else {
					data[key] = tx.signature;
				}
			}

			let returned_key = this.app.keychain.returnKey(from);

			let profile = Object.assign({}, returned_key?.profile);

			// Clear out old profile transactions...
			for (let field in txmsg.data){
				if (profile[field]){
					await this.app.storage.deleteTransaction(profile[field], "", "localhost");
				}
			}
			
			profile = Object.assign(profile, data);

			//console.log("New profile: ", profile);

			this.app.keychain.addKey(from, { profile } );

			await this.saveProfileTransaction(tx);	

		}else if (!this.app.BROWSER){
			//
			// Save update transaction in archive if server 
			//
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
			this.app.connection.emit('profile-update-dom', from, this.cache[from]);
		}

	}

	//
	//  LOAD PROFILE VALUES FUNCTIONS
	//
 	async fetchProfileFromArchive(key) {
 		//console.log("PROFILE: Fetching local profile for: ", key);
 		return this.app.storage.loadTransactions({ field2: key.publicKey, field1: 'Profile' },
			(txs) => {

				if (txs?.length > 0) {
					let obj = {};
					for (let tx of txs){
						//console.log("PROFILE: local archive returned txs (inside)!");
						let txmsg = tx.returnMessage();

						for (let field in key.profile){
							if (key.profile[field] === tx.signature){
								if (txmsg.data[field]){
									obj[field] = txmsg.data[field];
								}
							}
						}
					}
					return obj;
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

	webServer(app, expressapp, express) {
		let webdir = `${__dirname}/../../mods/${this.dirname}/web`;
		let mod_self = this;

		expressapp.get(
			'/' + encodeURI(this.returnSlug()),
			async function (req, res) {
				let reqBaseURL = req.protocol + '://' + req.headers.host + '/';

				let updatedSocial = Object.assign({}, mod_self.social);

				updatedSocial.url = reqBaseURL + encodeURI(mod_self.returnSlug());

				// Need to insert profile stuff!

				let html = pageHome(app, mod_self, app.build_number, updatedSocial);
				if (!res.finished) {
					res.setHeader('Content-type', 'text/html');
					res.charset = 'UTF-8';
					return res.send(html);
				}
				return;
			}
		);

		expressapp.use(
			'/' + encodeURI(this.returnSlug()),
			express.static(webdir)
		);
	}


}

module.exports = Profile;
