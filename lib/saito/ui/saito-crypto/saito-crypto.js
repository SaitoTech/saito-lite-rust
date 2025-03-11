const Activate = require('./overlays/activate');
const Deposit = require('./overlays/deposit');
const Withdraw = require('./overlays/withdraw');
const History = require('./overlays/history');
const Send = require('./overlays/send');
const Receive = require('./overlays/receive');

/*
	This is a container for all the independent overlays for sending (withdrawing), 
	depositing, sending, checking history of installed cryptocurrencies
*/
class SaitoCrypto {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;

		/*
			Activate was the original warning message overlay
			It has been supplanted by : saito-backup-render-request
		*/
		//this.activate_overlay = new Activate(app, mod);

		//'saito-crypto-deposit-render-request'
		this.deposit_overlay = new Deposit(app, mod);
		
		//'saito-crypto-withdraw-render-request'
		this.withdrawal_overlay = new Withdraw(app, mod);
		
		//'saito-crypto-history-render-request'
		this.history_overlay = new History(app, mod);

		//'saito-crypto-send-render-request'
		this.send_overlay = new Send(app, mod);

		//'saito-crypto-receive-render-request'
		this.receive_overlay = new Receive(app, mod);

	}
}

module.exports = SaitoCrypto;
