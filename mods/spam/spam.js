const ModTemplate = require('./../../lib/templates/modtemplate');
const PeerService = require('saito-js/lib/peer_service').default;

class Spam extends ModTemplate {
	constructor(app) {
		super(app);

		this.app = app;
		this.slug = 'spam';
		this.name = 'spam';
		this.description = 'Tool to generate spam txs';
		this.categories = 'Core Utilities Messaging';
		this.class = 'utility';
		this.to = '';
		this.payment = 0;
		this.fee = 0;
		this.nodeLoopDelay = 13000; // 13 seconds to guarantee block production
		this.loop_start = 0;
		this.frequency = 1; //no of tx per period
		this.period = 1000;
		this.interval = null;
		this.loop_count = 0;

		this.styles = ['/spam/style.css', '/saito/saito.css'];

		return this;
	}

	initialize(app) {
		super.initialize(app);
		if (this.browser_active) {
			this.styles = ['/spam/style.css', '/saito/saito.css'];
		}
		if (this.app.BROWSER == 0) {
			setInterval(() => {
				this.nodeSpamLoop(app, this);
			}, this.nodeLoopDelay);
		}
	}

	onNewBlock(blk) {
		if(this.browser_active) {
			// Update block ID display in UI
			const blockIdInput = document.getElementById('spam-blockid');
			if (blockIdInput) {
				blockIdInput.value = blk.id;
			}

			// Update address display
			this.app.wallet.getPublicKey()
				.then(publicKey => {
					const addressInput = document.getElementById('spam-address');
					if (addressInput) {
						addressInput.value = publicKey;
					}
				})
				.catch(err => console.error("Error getting public key:", err));

			// Update balance display (convert from nolan to Saito)
			this.app.wallet.getBalance()
				.then(balance => {
					const balanceInput = document.getElementById('spam-balance');
					if (balanceInput) {
						const balanceNumber = Number(balance.toString());
						const balanceInSaito = balanceNumber / 100000000;
						balanceInput.value = balanceInSaito.toLocaleString(undefined, { minimumFractionDigits: 8 });
					}
				})
				.catch(err => console.error("Error getting balance:", err));

			// Update slip count display
			this.app.wallet.getSlips()
				.then(slips => {
					const slipCountInput = document.getElementById('spam-slipcount');
					if (slipCountInput) {
						slipCountInput.value = slips.length;
					}
				})
				.catch(err => console.error("Error getting slips:", err));
		}
	}

	async render() {
		if (!this.browser_active) {
			return;
		}
		let this_mod = this;

		let start = document.querySelector('.start');
		start.onclick = (e) => {
			this_mod.frequency = document.querySelector('#spam-frequency').value;
			this_mod.period = document.querySelector('#spam-period').value * 1000;
			this_mod.to = document.querySelector('#spam-to').value;
			this_mod.payment = document.querySelector('#spam-payment').value;
			this_mod.fee = document.querySelector('#spam-fee').value;

			console.log(this.to, this.fee, 'fee');

			document.querySelector('.spam-loop-count').innerHTML =
				this_mod.loop_count;
			document.querySelector('.spam-loop-dot').style.backgroundColor =
				'green';

			this_mod.loop_start = 1;

			this_mod.changeLoopStatus();
		};

		let stop = document.querySelector('.stop');
		stop.onclick = (e) => {
			this_mod.loop_start = 0;
			document.querySelector('.spam-loop-dot').style.backgroundColor =
				'red';
			this_mod.changeLoopStatus();
		};

		let reset = document.querySelector('.reset');
		reset.onclick = (e) => {
			this_mod.loop_start = 0;
			this_mod.frequency = 1;
			this_mod.period = 1000;
			this_mod.interval = null;
			this_mod.loop_count = 0;

			document.querySelector('.spam-loop-count').innerHTML = '0';
			document.querySelector('.spam-loop-dot').style.backgroundColor =
				'red';
			document.querySelector('#spam-frequency').value = 1;
			document.querySelector('#spam-period').value = 1;
			this_mod.changeLoopStatus();
		};
	}

	nodeSpamLoop(app, mod) {
		console.info('Sending heartbeat spam tx: ' + mod.loop_count);
		mod.sendSpamTransaction(app, mod, { tx_num: mod.loop_count });
		mod.loop_count++;
	}

	changeLoopStatus() {
		let this_mod = this;
		if (this.loop_start == 1) {
			console.log('starting loop ..');
			console.log(
				'txs per second: ' +
				(1000 / this_mod.period) * this_mod.frequency
			);

			this.interval = setInterval(function () {
				document.querySelector('.spam-loop-count').innerHTML =
					this_mod.loop_count;
				this_mod.sendSpamTransaction(this_mod.app, this_mod.mod, {
					tx_num: this_mod.loop_count
				});
				this_mod.loop_count++;
			}, Math.floor(this_mod.period / this_mod.frequency));
		} else {
			console.log('stop loop ..');

			clearInterval(this.interval);
			this.interval = null;
		}
	}

	async onConfirmation(blk, tx, conf) {
		let txmsg = tx.returnMessage();

		if (this.app.BROWSER && !tx.isTo(this.publicKey)) {
			return;
		}

		try {
			if (conf == 0) {
				if (txmsg.request === 'send spam tx') {
					await this.receiveSpamTransaction(blk, tx, conf);
				}
			}
		} catch (err) {
			console.log('ERROR in ' + this.name + ' onConfirmation: ' + err);
		}
	}

	async sendSpamTransaction(app, mod, data) {
		try {
			let obj = {
				module: this.name,
				request: 'send spam tx',
				data: {}
		};
		for (let key in data) {
			obj.data[key] = data[key];
		}

		let newtx = await this.app.wallet.createUnsignedTransaction(
			this.to,
			BigInt(this.payment),
			BigInt(this.fee)
		);
		newtx.msg = obj;
		await newtx.sign();
		// console.log('tx: ' + data.tx_num);
		// console.log(newtx);
		await this.app.network.propagateTransaction(newtx);

			return newtx;
		} catch (err) {
			console.log('SPAM ERROR: ' + err);
		}
	}

	async receiveSpamTransaction(blk, tx, conf) {
		try {
			//
			// browsers
			//
			// if (this.app.BROWSER == 1) {
			//   return;
			// }
			// console.log("Received tx: ");
			// console.log(tx);
		} catch (err) {
			console.log('SPAM ERROR: ' + err);
		}
	}
}

module.exports = Spam;

