const BackupTemplate = require('./backup.template');
const SaitoOverlay = require('./../../../lib/saito/ui/saito-overlay/saito-overlay');
const SaitoLoader = require('./../../../lib/saito/ui/saito-loader/saito-loader');

class Backup {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.success_callback = null;
		this.desired_identifier = '';

		this.modal_overlay = new SaitoOverlay(this.app, this.mod);
		this.loader = new SaitoLoader(
			this.app,
			this.mod,
			'#backup-template .saito-overlay-subform'
		);
	}

	render() {
		let this_self = this;
		let key = this.app.keychain.returnKey(this.mod.publicKey);
		let identifier = key?.identifier || '';
		let newIdentifier = key?.has_registered_username && identifier === '';
		identifier = this.desired_identifier || identifier;

		this.modal_overlay.show(BackupTemplate(identifier, newIdentifier));
		this.modal_overlay.callback_on_close = () => {
			this_self.callBackFunction();
		}
		this.attachEvents();
	}

	show() {
		this.render();
	}
	hide() {
		this.close();
	}

	close() {
		this.modal_overlay.close();
	}

	attachEvents() {
		let this_self = this;

		document.querySelector(
			'#backup-template .saito-overlay-form-submit'
		).onclick = (e) => {
			e.preventDefault();
			let email = document.querySelector(
				'#backup-template .saito-overlay-form-email'
			).value;
			let password = document.querySelector(
				'#backup-template .saito-overlay-form-password'
			).value;

			if (!email || !password) {
				console.warn('No email or password provided!');
				return;
			}

			if (document.querySelector('.saito-overlay-form-text')) {
				document.querySelector('.saito-overlay-form-text').remove();
			}

			let div = document.querySelector(
				'#backup-template .saito-overlay-subform'
			);
			if (div) {
				div.innerHTML = '';
				div.classList.add('centerme');
			}

			this.loader.render();

			let button = document.querySelector(
				'#backup-template .saito-overlay-form-submit'
			);
			if (button) {
				button.innerHTML = 'Uploading...';
				button.onclick = null;
			}

			this.mod.backupWallet(email, password);

			setTimeout(() => {
				this_self.app.wallet.backup_required = 0;
				this.close();
				if (this.success_callback) {
					this.success_callback();
				}
			}, 3000);
		};
	}

	//
	// This is called when we receive the backup wallet tx that we sent
	//
	success() {
		siteMessage('Wallet backed up on blockchain', 4000);
		this.app.wallet.backup_required = 1;
		this.app.connection.emit('saito-header-update-message', {});
	}

	callBackFunction(){
		console.log('inside backup.js callback ////');
		console.log('this.app.wallet.backup_required: ', this.app.wallet.backup_required);
		let this_self = this;
		if (this.app.wallet.backup_required == 1) {
			
			this_self.app.connection.emit(
				'saito-header-update-message',
				{
					msg: 'Wallet backup required',
					flash: true,
					callback: function() {
						this_self.app.connection.emit(
							'recovery-backup-overlay-render-request'
						);
					}
				}
			);
		}
	}
}

module.exports = Backup;
