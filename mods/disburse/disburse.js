const ModTemplate = require('./../../lib/templates/modtemplate');

class Disburse extends ModTemplate {
	constructor(app) {
		super(app);

		this.app = app;
		this.slug = 'disburse';
		this.name = 'disburse';
		this.description = '';
		this.categories = 'Core Utilities Messaging';
		this.class = 'utility';
		this.styles = ['/disburse/style.css', '/saito/saito.css'];

		return this;
	}

	initialize(app) {
		super.initialize(app);
		if (this.browser_active) {
			this.styles = ['/disburse/style.css', '/saito/saito.css'];
		}
	}

	async render() {
		if (!this.browser_active) {
			return;
		}
		let this_mod = this;
		document.querySelector(".wallet").innerHTML = this.app.wallet.publicKey;
		document.querySelector(".balance").innerHTML = await this.app.wallet.getBalance();

		let click_button = document.querySelector("#validate-input");
		click_button.onclick = (e) => {
			let text = document.querySelector("#disburse-input").value;
			this_mod.parseData(text);
		};
		// let input_area = document.querySelector("#disburse-input");
		// input_area.addEventListener("paste", (e) => {
		// 	e.preventDefault();
		// 	let paste = e.clipboardData.getData("text");
		// 	input_area.value = paste;
		// 	this_mod.parseData(paste);
		// });
	}

	async onConfirmation(blk, tx, conf) {
		let txmsg = tx.returnMessage();
		try {
			if (conf == 0) {

			}
		} catch (err) {
			console.log('ERROR in ' + this.name + ' onConfirmation: ' + err);
		}
	}

	parseData(text) { /*    expected data, list of 'wallet \t value \n'    */
		// console.log('Raw data');
		// console.log(text);
		try {
			// let a = [];
			// text.split(/\n/).filter(Boolean).map( (e) => {
			// 	a.push(e.split(/\t/));
			// })
			// console.log(a);

			// console.log('Splitting data in rows');
			// Split on new line - and discard empty lines?
			let rows = text.split(/\n/).filter(Boolean);
			// console.log(rows);
			// console.log('here3');
			let dataArray = [];
			if (rows.length > 0) {
				console.log('Numbers of wallets:' + rows.length);
				for (let i = 0; i < rows.length; i++) {
					let row = rows[i];
					row = row.split(/\t/);
					if (row.length == 2) {
						// console.log(row);
						dataArray.push(row);
					} else {
						console.log('ERROR at row[' + i + ']\n data is:' + rows[i]);
						alert('Unable to parse, please verify.');
					}
				}
				if (dataArray.length == rows.length) {
					console.log(dataArray);
					document.getElementById("validate-input").remove();
					document.getElementById("disburse-input").readOnly = true;
					let node = document.querySelector(".disburse-main");
					let sendTransaction_button = document.createElement("button", { id: "send-transaction" });
					sendTransaction_button.innerHTML = "Send transaction";
					node.appendChild(sendTransaction_button);
					sendTransaction_button.addEventListener("click", (e) => {
						this.sendBalance(dataArray);
					});
				}
			} else {
				alert('Unable to parse, please verify.');
			}
		} catch (error) {
			console.log(error);
		}
	}

	async sendBalance(dataArray) {
		console.log("sendBalance()");
		console.log(dataArray);
		document.querySelector("button").remove();
		this.sendBalanceTransaction(dataArray[0][0], dataArray[0][1])

	}

	async sendBalanceTransaction(wallet, value) {
		console.log('Sending ' + value + ' to ' + wallet);
		try {
			let senders = this.app.wallet.publicKey;
			let receivers = wallet;
			let amounts = value;
			let timestamp = new Date().getTime();
			let unique_hash = btoa(senders + receivers + amounts + timestamp);
			let ticker = 'SAITO';
			console.log(senders + '\n' + receivers + '\n' + amounts + '\n' + timestamp + '\n' + unique_hash + '\n' + ticker)
			let hash = await this.app.wallet.sendPayment(
				[senders],
				[receivers],
				[amounts],
				timestamp,
				unique_hash,
				null,
				ticker
			);
			console.log(hash);
		} catch (error) {
			console.log(error);
		}
	}

}

module.exports = Disburse;
