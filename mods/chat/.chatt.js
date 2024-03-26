const ModTemplate = require('../../lib/templates/modtemplate');
const HomePage = require('./index');

class Chatt extends ModTemplate {
	constructor(app) {
		super(app);
		this.name = 'Chatx';
		this.test_public_key = '';
		this.description = 'Saito instant-messaging client';
		this.categories = 'Messaging Chat';
		this.groups = [];
		this.app = app;
		let privateKey = this.app.crypto.generateKeys();
		let publicKey = this.app.crypto.generatePublicKey(privateKey);
		console.log(publicKey, ' this is the public key');
	}

	// webServer(app, expressapp, express) {
	// 	let webdir = `${__dirname}/../../mods/${this.dirname}/web`;
	// 	let mod_self = this;

	// 	expressapp.get(
	// 		'/' + encodeURI(this.returnSlug()),
	// 		async function (req, res) {
	// 			let reqBaseURL = req.protocol + '://' + req.headers.host + '/';

	// 			// mod_self.social.url =
	// 			// 	reqBaseURL + encodeURI(mod_self.returnSlug());

	// 			res.setHeader('Content-type', 'text/html');
	// 			res.charset = 'UTF-8';
	// 			res.send(HomePage(app, mod_self, app.build_number));
	// 			return;
	// 		}
	// 	);

	// 	expressapp.use(
	// 		'/' + encodeURI(this.returnSlug()),
	// 		express.static(webdir)
	// 	);
	// }

	render() {
		return `
        <button id="button-sender'> 
            Send Tx
        </button>
        `;
	}

	async onConfirmation(blk, tx, conf) {
		console.log(blk);
	}

	attachEvents() {
		document
			.querySelector('#button-sender')
			.addEventListener('click', async (e) => {
				let newtx =
					this.app.wallet.createUnsignedTransactionWithDefaultFee(
						this.test_public_key
					);

				newtx.msg = {
					module: 'ChatX',
					request: 'lite-block-test',
					data: {
						msg: 'Hello world'
					}
				};

				await newtx.sign();
				await this.app.network.propagateTransaction(newtx);
			});
	}
}

module.exports = Chatt;
