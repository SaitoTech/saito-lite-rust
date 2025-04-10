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
			'#backup-template #saito-overlay-loader'
		);

		app.connection.on('recovery-backup-loader-overlay-render-request',
			async (msg) => {

				app.options.wallet.backup_required = msg;
				app.wallet.saveWallet();

				this.render();
				await this.showLoaderOverlay(msg);
			}
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

	async close() {
		this.modal_overlay.close();
	}

	attachEvents() {
		let this_self = this;

		document.querySelector(
			'#backup-template .saito-overlay-form-submit'
		).onclick = async (e) => {
			e.preventDefault();
			let email = document.querySelector(
				'#backup-template .saito-overlay-form-email'
			).value;
			let password = document.querySelector(
				'#backup-template .saito-overlay-form-password'
			).value;

			if (!email || !password) {
				salert('No email or password provided!');
				return;
			}

			await this_self.showLoaderOverlay();
			this_self.mod.backupWallet(email, password);
		};
	}

	//
	// This is called when we receive the backup wallet tx that we sent
	//
	async success() {
		let this_self = this;
		siteMessage('wallet backup successful', 10000);
		
		setTimeout(async function(){
			this_self.app.options.wallet.backup_required = false;
			await this_self.app.wallet.saveWallet();
			await this_self.close();

			if (this_self.success_callback) {
				this_self.success_callback();
			}
		}, 3000);
	}

	callBackFunction(){
		let this_self = this;
		if (this.app.options.wallet?.backup_required) {
			this_self.app.connection.emit(
				'saito-header-update-message',
				{
					msg: 'wallet backup needed',
					flash: true,
					callback: function() {
						this_self.app.connection.emit(
							'recovery-backup-overlay-render-request'
						);
					}
				}
			);
		} else {
			this.app.connection.emit('saito-header-update-message', {});	
		}
	}

	async showLoaderOverlay(msg = null){
		this.app.options.wallet.backup_required = false;
		await this.app.wallet.saveWallet();

		document.querySelector('#saito-overlay-form-header-title').innerHTML = 
		`Enabling Account Recovery`;

		let div = document.querySelector(
			'#backup-template .saito-overlay-subform'
		);
		if (div) {
			if (msg == null) {
				msg = `
					<div id="saito-overlay-loader"></div>
					<div class="saito-overlay-form-subtext">
					    Your browser is encrypting your wallet with the password 
					    provided. Once completed, it will send a copy of this 
					    wallet to your email address.
		            </div>

					<div class="saito-overlay-form-subtext">
						This entire process usually takes no more than a minute. 
						Once done you will also be able to login to your account 
						from any computer. Please be patient while the process finishes.
		      		</div>
	      		`;
			}

			div.innerHTML = msg;
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
	}
}

module.exports = Backup;
