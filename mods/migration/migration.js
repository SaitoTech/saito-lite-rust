const ModTemplate = require('./../../lib/templates/modtemplate');
const PeerService = require('saito-js/lib/peer_service').default;

class Migration extends ModTemplate {
	constructor(app) {
		super(app);

		this.app = app;
		this.name = 'Migration';
		this.slug = 'migration';
		this.description = 'Migrate ERC20 or BEP20 tokens to Saito Native Tokens';
		this.categories = 'Core Utilities Messaging';
		this.publickey = '';

		return this;
	}

	async render() {
		if (!this.browser_active) {
			return;
		}

		this.publickey = await this.app.wallet.getPublicKey();

		//
		//
		//
		let pk = this.app.browser.returnURLParameter('publickey');
		let erc20 = this.app.browser.returnURLParameter('erc20');
		let email = this.app.browser.returnURLParameter('email');

		if (pk && erc20) {
			document.querySelector('.withdraw-outtro').style.display = 'none';
			document.querySelector('.withdraw-title').innerHTML =
				'Confirm Transfer';
			document.querySelector(
				'.withdraw-intro'
			).innerHTML = `Please confirm your ERC20/BEP20 transfer is complete`;
			document.querySelector('.withdraw-button').innerHTML = `confirm`;
			document.querySelector('#email').style.display = 'none';
			document.querySelector('#publickey').style.display = 'none';
			document.querySelector('#erc20').style.display = 'none';

			let el2 = document.querySelector('.withdraw-button');
			el2.onclick = (e) => {
				let mailrelay_mod = this.app.modules.returnModule('MailRelay');
				if (!mailrelay_mod) {
					alert(
						'Your Saito install does not contain email support, please write the project manually to complete token withdrawal'
					);
					return;
				}

				let emailtext = `
      <div>
	    <p>Dear Saitozen,</p>
     	<p>Token withdrawal requested:</p>
		<p>From: ${erc20}</p>
		<p>To: ${pk}</p>
		<p>Email: ${email}</p>
		<p>Token transfer should be recorded at:</p>
		<p>0x24F10EA2827717770270e3cc97F015Ba58fcB9b6</p>
 	    <p>-- Saito Migration Transfer Service</p>
	  `;

				mailrelay_mod.sendMailRelayTransaction(
					email,
					'Saito Token Migration <info@saito.tech>',
					'Saito Token Withdrawal Request (action required)',
					emailtext,
					true,
					'',
					'migration@saito.io'
				);
				mailrelay_mod.sendMailRelayTransaction(
					'migration@saito.tech',
					'Saito Token Migration <info@saito.tech>',
					'Saito Token Withdrawal Request (action required)',
					emailtext,
					true,
					'',
					'migration@saito.io'
				);

				document.querySelector('.withdraw-intro').innerHTML =
					'Your request is now processing. Please contact us by email if you do not receive confirmation of token issuance within 24 hours.';
				document.querySelector('.withdraw-outtro').style.display =
					'none';
				document.querySelector('.withdraw-title').innerHTML =
					'Request in Process';
				document.querySelector('.withdraw-button').style.display =
					'none';

				this.sendStoreMigrationTransaction(this.app, this, {
					pk: pk,
					erc20: erc20,
					email: email
				});
			};

			return;
		}

		let el = document.querySelector('.withdraw-button');
		el.onclick = (e) => {
			let email = document.querySelector('#email').value;
			let erc20 = document.querySelector('#erc20').value;
			let publickey = document.querySelector('#publickey').value;

			//
			//
			//
			if (publickey !== this.publickey) {
				alert(
					'The publickey provided is not the publickey of this wallet. To avoid problems please request token withdrawal from the wallet which will receive the tokens'
				);
				return;
			} else {
				let c = confirm('I confirm that I have backed up this wallet.');
				if (c) {
				} else {
					alert(
						'Please backup your wallet before continuing. The project cannot be responsible for lost or misplaced private keys'
					);
				}
			}

			let mailrelay_mod = this.app.modules.returnModule('MailRelay');
			if (!mailrelay_mod) {
				alert(
					'Your Saito install does not contain email support, please write the project manually to process token withdrawal'
				);
				return;
			}

			let emailtext = `

	<div>
      <p>Dear Saitozen,</p>
      <p>You have provided the following ERC20/BEP20 address:</p>
      <p>${erc20}</p>
      <p>And the following Saito address / publickey:</p>
      <p>${publickey}</p>
      <p>If this information is correct, complete your withdrawal by sending your ERC20 or BEP20 tokens to our monitored multisig address:</p>
      <p>0x24F10EA2827717770270e3cc97F015Ba58fcB9b6</p>
	  <p>(Note, the address is the same on both networks.)</b>
      <p>Once the transfer is complete, please click on the following link and confirm the submission - our team will complete the transfer within 24 hours:</p>
      <p>http://saito.io/migration?publickey=${publickey}&erc20=${erc20}&email=${email}</p>
      <p>Please reach out by email if you do not hear from us in a day.</p>
      <p>-- The Saito Team</p> 
    </div>

	`;

			mailrelay_mod.sendMailRelayTransaction(
				email,
				'Saito Token Migration <info@saito.tech>',
				'Saito Token Withdrawal (migration)',
				emailtext,
				true
			);
			mailrelay_mod.sendMailRelayTransaction(
				'migration@saito.io',
				'Saito Token Migration <info@saito.tech>',
				'Saito Token Withdrawal (migration)',
				emailtext,
				true
			);

			document.querySelector('.withdraw-outtro').style.display = 'none';
			document.querySelector('.withdraw-title').innerHTML = 'Email Sent';
			document.querySelector(
				'.withdraw-intro'
			).innerHTML = `<p>We have emailed you instructions on transferring your ERC20/BEP20 tokens and a link to report the transfer when complete.</p>
			 <p>In the event of problems please reach out directly at <i>info@saito.tech</i>.</p>`;
			document.querySelector('#email').style.display = 'none';
			document.querySelector('#publickey').style.display = 'none';
			document.querySelector('#erc20').style.display = 'none';
			document.querySelector('.withdraw-button').style.display = 'none';
		};
	}

	async onConfirmation(blk, tx, conf) {

		if (this.app.BROWSER && !tx.isTo(this.publicKey)) {
			return;
		}

		let txmsg = tx.returnMessage();
		try {
			if (conf == 0) {
				console.log('Migration onConfirmation: ' + txmsg.request);

				if (txmsg.request === 'save migration data') {
					await this.receiveStoreMigrationTransaction(blk, tx, conf);
				}
			}
		} catch (err) {
			console.log('ERROR in ' + this.name + ' onConfirmation: ' + err);
		}
	}

	async sendStoreMigrationTransaction(app, mod, data) {
		let obj = {
			module: this.name,
			request: 'save migration data',
			data: {}
		};
		for (let key in data) {
			obj.data[key] = data[key];
		}

		let newtx = await this.app.wallet.createUnsignedTransaction();
		newtx.msg = obj;
		await newtx.sign();
		await this.app.network.propagateTransaction(newtx);

		return newtx;
	}

	async receiveStoreMigrationTransaction(blk, tx, conf) {
		try {
			//
			// browsers
			//
			if (this.app.BROWSER == 1) {
				return;
			}

			//
			// servers
			//
			let txmsg = tx.returnMessage();
			let sql = `INSERT INTO migration ( 
	    						publickey,
	    						erc20,
	    						erc20_tx_id,
	    						email,
	    						saito_isssued,
	    						created_at
	  						 )
	               VALUES ( 
	                $publickey,
	                $erc20,
	                '',
	                $email,
	                0,
	                $created_at
	               )`;
			let params = {
				$publickey: txmsg.data.pk,
				$erc20: txmsg.data.erc20,
				$email: txmsg.data.email,
				$created_at: tx.timestamp
			};
			await this.app.storage.runDatabase(sql, params, 'migration');
		} catch (err) {
			console.log('ERROR in saving migration data to db: ' + err);
		}
	}
}

module.exports = Migration;
