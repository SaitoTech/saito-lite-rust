const AddMempoolTemplate = require('./add-mempool.template');
const SaitoOverlay = require('./../../../lib/saito/ui/saito-overlay/saito-overlay');

class Main {
    constructor(app, mod, container = '') {
        this.app = app;
        this.mod = mod;
        this.overlay = new SaitoOverlay(this.app, this.mod);
    }

    render() {
        this.overlay.show(AddMempoolTemplate(this.app, this.mod, this));

        this.attachEvents();
    }

    attachEvents() {
        let this_self = this;

        document.querySelector('#add_transaction').onclick = async (e) => {
            let fee = document.querySelector('#fee').value;
            console.log('fee: ', fee);

            let newtx = await this.app.wallet.createUnsignedTransaction('', BigInt(0), BigInt(fee));
            newtx.msg = {
                module: 'ATR',
                request: 'test',
                data: { random: Math.random() }
            };
            await newtx.sign();

            console.log("newtx:", newtx);

            await this.app.network.propagateTransaction(newtx);
            console.log('newtx', newtx);
            this_self.overlay.hide();
        };

    }
}

module.exports = Main;

