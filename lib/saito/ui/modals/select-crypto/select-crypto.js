const SelectCryptoTemplate = require('./select-crypto.template');
const SaitoOverlay = require('./../../saito-overlay/saito-overlay');


class ModalSelectCrypto {

    constructor(app, mod, cryptomod) {
      this.app = app;
      this.mod = mod;
      this.cryptomod = cryptomod;
    }

    render() {

      if (this.cryptomod == null) {
	console.log("ERROR: crypto module not supported");
	return;
      }

      cryptomod.modal_overlay = new SaitoOverlay(this.app, this.mod, false);
      cryptomod.modal_overlay.show(SelectCryptoTemplate(this.app, this.mod, this.cryptomod));

    }

    attachEvents() {
        this.cryptomod.activate();
        this.cryptomod.attachEventsModalSelectCrypto(this.app, this.mod, this.cryptomod);
    }

}

module.exports = ModalSelectCrypto

