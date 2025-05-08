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
		document.querySelector(".wallet-value").innerHTML = this.app.wallet.publicKey;
		let this_wallet_balance = parseFloat(await this.app.wallet.getBalance());
		document.querySelector(".balance-value").innerHTML = this.app.browser.formatNumberToLocale(this_wallet_balance);
		//
		//	Manual input
		//
		let click_button = document.querySelector("#validate-input");
		click_button.onclick = (e) => {
			let raw_data = document.querySelector("#disburse-input").value;
			this_mod.parseData(raw_data, this_wallet_balance);
		};
		//
		//	Paste Logic
		//

		// let input_area = document.querySelector("#disburse-input");
		// input_area.addEventListener("paste", (e) => {
		// 	e.preventDefault();
		// 	let paste = e.clipboardData.getData("raw_data");
		// 	input_area.value = paste;
		// 	this_mod.parseData(paste);
		// });
	}

	/*
	async onConfirmation(blk, tx, conf) {

		if (this.app.BROWSER && !tx.isTo(this.publicKey)) {
			return;
		}

		let txmsg = tx.returnMessage();
		try {
			if (conf == 0) {

			}
		} catch (err) {
			console.log('ERROR in ' + this.name + ' onConfirmation: ' + err);
		}
	}
	*/

	parseData(raw_data, this_wallet_balance) { /*    expected data, list of 'wallet \t value \n'    */
		try {
			// console.log('Splitting data in rows');
			// Split on new line - and discard empty lines?
			let rows = raw_data.split(/\n/).filter(Boolean);
			let dataArray = [];
			if (rows.length > 0) {
				// console.log('Numbers of wallets:' + rows.length);
				let total_out = 0;
				for (let i = 0; i < rows.length; i++) {
					let row = rows[i];
					row = row.split(/\s+/);
					if (row.length == 2) {
						// console.log(row);
						total_out = total_out + parseFloat(row[1]);
						dataArray.push(row);
					} else {
						console.log('ERROR at row[' + i + ']\n data is:' + rows[i]);
						// alert('Unable to parse, please verify.');
					}
				}
				if (dataArray.length == rows.length && this_wallet_balance >= total_out) {
					let message_area = document.querySelector(".disburse-message");
					message_area.style.display = "block";
					document.getElementById("total_wallet").innerHTML = dataArray.length;
					document.getElementById("total_out").innerHTML = this.app.browser.formatNumberToLocale(total_out);
					document.getElementById("sender_balance").innerHTML = this.app.browser.formatNumberToLocale(this_wallet_balance);
					document.getElementById("final_balance").innerHTML = this.app.browser.formatNumberToLocale(this_wallet_balance - total_out);

					document.getElementById("validate-input").remove();
					document.getElementById("disburse-input").readOnly = true;
					let button_area = document.querySelector(".disburse-button-area");

					let reset_button = document.createElement("button");
					reset_button.id = "reset";
					reset_button.innerHTML = "Reset";
					button_area.appendChild(reset_button);

					reset_button.addEventListener("click", (e) => {
						dataArray = [];
						document.location.reload();
					});

					let sendTransaction_button = document.createElement("button");
					sendTransaction_button.id = "send-transaction";
					sendTransaction_button.innerHTML = "Send transaction";
					button_area.appendChild(sendTransaction_button);
					sendTransaction_button.addEventListener("click", (e) => {
						this.sendBalance(dataArray);
					});
				} else {
					if (this_wallet_balance < total_out) alert("Not enought funds");
					else {
						alert('Unable to parse, please check wallet funds or recievers.');
					}
				}
			} else {
				alert('Unable to parse, please verify.');
			}
		} catch (error) {
			console.log(error);
		}
	}

	async sendBalance(dataArray) {
		try {
			console.log("sendBalance()");
			document.getElementById("send-transaction").remove();
			// console.table(dataArray);
			this.sendBalanceTransaction(dataArray)
		} catch (error) {
			console.log(error);
		}

	}

	async sendBalanceTransaction(dataArray) {
		try {
			let senders = []
			let receivers = [];
			let amounts = [];
			dataArray.forEach(row => {
				senders.push(this.app.wallet.publicKey);
				receivers.push(row[0]);
				amounts.push(row[1]);
			});
			let timestamp = new Date().getTime();
			let unique_hash = btoa(senders + receivers + amounts + timestamp);
			let ticker = 'SAITO';
			console.log("senders.length :" + senders.length);
			// if (senders.length > 1) {
			console.log("sendPayments");
			await this.app.wallet.sendPayments(
				senders,
				receivers,
				amounts,
				timestamp,
				unique_hash,
				async function (res) {
					console.log("hash:\t" + res.hash);
					if (res.hash) {
						salert("Success, please wait - transaction hash: " + res.hash.substring(0, 250));
					} 
					if (res.err) {
						salert("Error: " + res.err);
					}
				},
				ticker
			);
		} catch (error) {
			console.log(error);
		}
	}

}

module.exports = Disburse;
