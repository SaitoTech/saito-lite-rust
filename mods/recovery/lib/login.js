const LoginTemplate = require('./login.template');
const SaitoOverlay = require('./../../../lib/saito/ui/saito-overlay/saito-overlay');
const SaitoLoader = require('./../../../lib/saito/ui/saito-loader/saito-loader');
const LoginSuccessTemplate = require('./login-success.template');

class Login {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;

		this.modal_overlay = new SaitoOverlay(this.app, this.mod);
		this.loader = new SaitoLoader(
			this.app,
			this.mod,
			'#login-template .saito-overlay-form'
		);

		app.connection.on('recovery-login-overlay-render-request', () => {
			console.debug('Received recovery-login-overlay-render-request');
			this.render();
		});
	}

	render() {
		this.modal_overlay.show(LoginTemplate());
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
		document.querySelector('.saito-overlay-login-submit').onclick = (e) => {
			let email = document.querySelector(
				'.saito-overlay-form-email'
			).value;
			let password = document.querySelector(
				'.saito-overlay-form-password'
			).value;

			//document.querySelector(".saito-overlay-form-text").remove();
			document.querySelector('.saito-overlay-form-email').remove();
			document.querySelector('.saito-overlay-form-password').remove();
			document.querySelector('.saito-overlay-form-submitline').remove();

			this.loader.render();

			document.querySelector(
				'#login-template .saito-overlay-form-text'
			).innerHTML =
				'<center>Fetching Encrypted Wallet from Network...</center>';
			this.mod.restoreWallet(email, password);
		};
	}

	async success() {
		if (!this.app.BROWSER) {
			return;
		}

		this.modal_overlay.closebox = false;
		this.modal_overlay.show(LoginSuccessTemplate());

		document.querySelector('.saito-overlay-login-submit').onclick = (e) => {
			reloadWindow(300);
		};

		this.modal_overlay.blockClose();
	}

	failure() {
		try {
			this.render();
			document.querySelector(
				'#login-template .saito-overlay-form-text'
			).innerHTML =
				'<center>Failed: Incorrect Email or Password?</center>';
			this.attachEvents();
		} catch (err) {
			console.error(err);
		}
	}
}

module.exports = Login;
