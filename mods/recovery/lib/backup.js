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
		let key = this.app.keychain.returnKey(this.mod.publicKey);
		let identifier = key?.identifier || '';
		let newIdentifier = key?.has_registered_username && identifier === '';
		identifier = this.desired_identifier || identifier;

		this.modal_overlay.show(BackupTemplate(identifier, newIdentifier));
		this.attachEvents();
	}

	show() {
		this.render();
	}
	hide() {
		this.remove();
	}

	remove() {
		this.modal_overlay.remove();
	}

	attachEvents() {
		document.querySelector(
			'#backup-template .saito-overlay-form-cancel'
		).onclick = (e) => {
			this.modal_overlay.remove();
		};

		document.querySelector(
			'.saito-overlay-form-alt-opt#update-profile'
		).onclick = (e) => {
			this.modal_overlay.remove();
			this.app.connection.emit('update-profile');
		};

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
				this.remove();
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
	}
}

module.exports = Backup;
