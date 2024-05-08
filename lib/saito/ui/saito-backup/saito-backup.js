const SaitoBackupTemplate = require('./saito-backup.template');
const SaitoOverlay = require('./../saito-overlay/saito-overlay');

class SaitoBackup {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = container;
		this.overlay = new SaitoOverlay(this.app, this.mod);
		this.msg = null;

		this.app.connection.on('saito-backup-render-request', (obj) => {
			console.log('object: ', obj);
			if (typeof obj.msg != 'undefined') {
				this.msg = obj.msg;
			}
			this.render();
		});

		
	}
	render() {
		this.overlay.show(SaitoBackupTemplate(this.app, this.mod, this));
		this.overlay.callback_on_close = () => {
			this.callBackFunction();
		}
		this.attachEvents();
	}

	attachEvents() {
		let this_self = this;
		document.querySelector('#saito-backup-manual')
		.addEventListener('click', async () => {
			this_self.app.wallet.backupWallet();

			this_self.app.options.wallet.backup_required_msg = 0;
			await this_self.app.wallet.saveWallet();

			this_self.overlay.close();
		});

		document.querySelector('#saito-backup-auto')
		.addEventListener('click', async () => {
			
			this_self.app.options.wallet.backup_required_msg = 0;
			await this_self.app.wallet.saveWallet();

			this_self.app.connection.emit(
				'recovery-backup-overlay-render-request'
			);
			this_self.overlay.hide();
		});
	}

	callBackFunction(){
		let this_self = this;
		if (this.app.options.wallet.backup_required_msg == 1) {
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
		} else {
			this.app.connection.emit('saito-header-update-message', {});
		}
	}
}

module.exports = SaitoBackup;
