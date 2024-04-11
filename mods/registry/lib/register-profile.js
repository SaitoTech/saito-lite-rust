const RegisterProfileTemplate = require('./register-profile.template');
const SaitoOverlay = require('../../../lib/saito/ui/saito-overlay/saito-overlay');
const SaitoLoader = require('../../../lib/saito/ui/saito-loader/saito-loader');

class RegisterUsername {
	constructor(app, mod, mode = 'register') {
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
	}

	render(msg = '') {
		let key = this.app.keychain.returnKey(this.mod.publicKey);

		this.overlay.show(RegisterProfileTemplate(msg, key, this.mode));
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

		document.querySelector('#upload-image').onclick = () => {
			this.app.browser.addDragAndDropFileUploadToElement(
				'image-uploader',
				(result) => {
					console.log(result);
					document.querySelector('#uploaded-image').src = result;

					console.log('handling drop');
				}
			);

			const profilerUploader = document.querySelector('#image-uploader');
			profilerUploader.style.display = 'block';
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
					request: 'registry namecheck'
				};

				let registry_peer = null;
				if (this.mod.peers[0]?.peerIndex) {
					registry_peer = this.mod.peers[0].peerIndex;
				}

				if (this.mode === 'update') {
					let success = this.mod.updateProfile(
						identifier + domain,
						bio,
						'data:image/jpeg;base64,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'
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
							'update_identifier',
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
						'registry query',
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
											'data:image/jpeg;base64,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'
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
											'update_identifier',
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
						registry_peer
					);
				}
			}
		};
	}
}

module.exports = RegisterUsername;
