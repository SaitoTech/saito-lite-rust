const UpdateProfileTemplate = require('./update-profile.template');
const PhotoUploader = require('../../../lib/saito/ui/photo-uploader/photo-uploader');
const SaitoOverlay = require('../../../lib/saito/ui/saito-overlay/saito-overlay');
const SaitoLoader = require('../../../lib/saito/ui/saito-loader/saito-loader');

class UpdateProfile {
	constructor(app, mod, mode = 'update') {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod);
		this.loader = new SaitoLoader(
			this.app,
			this.mod,
			'.saito-overlay-form'
		);
		this.callback = null;
		this.mode = mode;
		this.image = null;
		this.photoUploader = new PhotoUploader(app, mod);
		this.unresized = null;
	}

	render(msg = '') {
		let key = this.app.keychain.returnKey(this.mod.publicKey);
		let photo = '';

		if (key?.profile) {
			photo = key.profile.photo || '';
		}
		this.image = photo;
		this.overlay.show(UpdateProfileTemplate(msg, key, this.mode));
		this.attachEvents();
	}

	attachEvents() {
		document.querySelector('.saito-overlay-form-input').select();
		document.querySelector(
			'.saito-overlay-form-alt-opt#loginOrRecover'
		).onclick = (e) => {
			this.overlay.remove();
			this.app.connection.emit('recovery-login-overlay-render-request');
			return;
		};

		document.querySelector('#upload-image').onclick = (e) => {
			this.photoUploader.callbackAfterUpload = async (result) => {
				try {
					this.unresized = result;
					this.image = await this.app.browser.resizeImg(result);
					document.querySelector('#uploaded-photo').src = result;
				} catch (error) {
					console.error('Profile: error uploading image', error);
				}
			};

			console.log(this.unresized, this.image);
			this.photoUploader.render(this.unresized || this.image);

			// const outsideClickListener = (event) => {
			// 	const imageUploader = document.querySelector('#image-uploader');
			// 	const uploadImageButton =
			// 		document.querySelector('#upload-image');

			// 	if (
			// 		!imageUploader.contains(event.target) &&
			// 		!uploadImageButton.contains(event.target)
			// 	) {
			// 		imageUploader.style.display = 'none';
			// 		document.body.removeEventListener(
			// 			'click',
			// 			outsideClickListener
			// 		);
			// 	}
			// };

			// Attach the outside click listener to the body
			// document.body.addEventListener('click', outsideClickListener);
		};

		document.querySelector('.saito-overlay-form-submit').onclick = async (
			e
		) => {
			e.preventDefault();
			let identifier = document.querySelector(
				'.saito-overlay-form-input'
			).value;

			let bio = document.querySelector(
				'.saito-overlay-form-textarea'
			).value;

			if (identifier) {
				if (identifier.indexOf('@') > -1) {
					identifier = identifier.substring(
						0,
						identifier.indexOf('@')
					);
				}

				try {
					document.querySelector(
						'.saito-overlay-form-header-title'
					).innerHTML = `${
						this.mode === 'update' ? 'Updating' : 'Registering'
					} profile...`;
					document
						.querySelector('.saito-overlay-form-header-title')
						.classList.add('saito-cached-loader', 'loading');

					document.querySelector('.saito-overlay-form-text').remove();

					document
						.querySelector('.saito-overlay-form-textarea')
						.remove();
					document.querySelector('#upload-image').remove();
					document.querySelector(
						'.saito-overlay-form-input'
					).style.visibility = 'hidden';
					document
						.querySelector('.saito-overlay-form-submitline')
						.remove();
				} catch (err) {
					console.log(err);
				}

				let domain = '@saito';

				let data = {
					identifier: identifier + domain,
					request: 'profile namecheck'
				};

				let profile_peer = null;
				if (this.mod.peers[0]?.peerIndex) {
					profile_peer = this.mod.peers[0].peerIndex;
				}

				if (this.mode === 'update') {
					let success = this.mod.updateProfile(
						identifier + domain,
						bio,
						this.image
					);
					if (success) {
						console.log('REGISTRY: tx to update successfully sent');
						//
						// mark wallet that we have registered username
						//
						this.app.keychain.addKey(this.mod.publicKey, {
							has_registered_username: true
						});

						// Change Saito-header / Settings page
						this.app.connection.emit(
							'update_profile',
							this.mod.publicKey
						);

						//Fake responsiveness
						setTimeout(() => {
							this.overlay.remove();
							if (this.callback) {
								this.callback(identifier);
							}
						}, 2000);
					} else {
						salert('Error 411413: Error Updating Username');
						this.render();
					}
				}

				if (this.mode === 'register') {
					this.app.network.sendRequestAsTransaction(
						'profile query',
						data,
						async (results) => {
							if (results.length > 0) {
								salert(
									'Identifier already in use. Please select another'
								);
								this.render();
								return;
							} else {
								console.log(
									'REGISTRY: name available, try to register'
								);
								try {
									let success =
										await this.mod.registerProfile(
											identifier,
											domain,
											bio,
											this.image
										);
									if (success) {
										console.log(
											'REGISTRY: tx to register successfully sent'
										);
										//
										// mark wallet that we have registered username
										//
										this.app.keychain.addKey(
											this.mod.publicKey,
											{
												has_registered_username: true
											}
										);

										// Change Saito-header / Settings page
										this.app.connection.emit(
											'update_profile',
											this.mod.publicKey
										);

										//Fake responsiveness
										setTimeout(() => {
											this.overlay.remove();
											if (this.callback) {
												this.callback(identifier);
											}
										}, 2000);
									} else {
										salert(
											'Error 411413: Error Registering Username'
										);
										this.render();
									}
								} catch (err) {
									if (
										err.message ==
										'Alphanumeric Characters only'
									) {
										salert(
											'Error: Alphanumeric Characters only'
										);
									} else {
										salert(
											'Error: Error Registering Username'
										);
									}
									this.render();
									console.error(err);
								}
							}
						},
						profile_peer
					);
				}
			}
		};
	}
}

module.exports = UpdateProfile;
