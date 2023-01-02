const CryptoModule = require("../../lib/templates/cryptomodule");

class TST extends CryptoModule {

  constructor(app) {
    super(app, 'TST');
    this.name = 'TST';
    this.ticker = 'TST';
    this.description = 'This module implement CryptoModule functions without moving tokens';
    this.categories = "Cryptocurrency";
    this.information = "This is some important information you may care to read about when enabling the TST crypto module";
    this.warning = "The TST crypto module wishes you to read this warning";
  }



   //
   // returns the web3 crypto address
   //
   returnAddress() {
     // just given them our Saito publickey - easy to test
     return this.app.wallet.returnPublicKey();
   }

   //
   // returns the web3 crypto private key
   //
   returnPrivateKey() {
     // just give them our Saito privatekey - easy to test
     return this.app.wallet.returnPrivateKey();
   }

   //
   // fetches and returns the balance at the web3 crypto addresses
   //
   // @param {String} address in which to check balance
   // @return {Array} Array of {address: {String}, balance: {Int}}
   //
   async returnBalance(address = "") {
     return "100.00000000";
   }

   //
   // sends a payment in amount requested to the specified address if possible
   //
   // @param {String} amount of tokens to send
   // @param {String} address of recipient
   // @return {Array} Array of {hash: {String}} where hash is the transaction_id
   //        of the transaction that makes this transfer on the external web3
   //        crypto.
   //
   async sendPayment(amounts="", recipient="", unique_hash="") {
     return this.app.crypto.hash(Math.random().toString());
   }

   //
   // checks if a payment has been received at the web3 crypto address
   //
   // @param {String} amount of tokens to send
   // @param {String} sender of transfer
   // @param {String} recipient of transfer
   // @param {timestamp} timestamp after which transfer must have been made
   // @return {Array} Array of {hash: {String}} where hash is the transaction_id
   //
   async receivePayment(amount="", sender="", receiver="", timestamp, unique_hash="") {
     if (Math.random() > 0.5) {
       console.log("received payment...");
       return 1;
     }
console.log("not received payment...");
     return 0;
   }



  renderModalSelectCrypto(app, cryptomod) {
    return `
      <div id="dot-warning" class="dot-warning">
        <div id="dot-warning-header" class="dot-warning-header">Welcome to Kusama!</div>
        <div id="dot-warning-body" class="dot-warning-body">
TST is a non-existent crypto. This is a test module.

<p style="margin-bottom:20px"></p>

This shows how to make the Select Crypto module show up.

        </div>
        <div id="dot-warning-confirm" class="dot-warning-confirm button">Backup and Continue</div>
      </div>
      <style>
.dot-warning {
  background-image: url(/saito/img/dreamscape.png);
  background-size: cover;
  width: 80vw;
  max-height: 80vh;
  max-width: 750px;
  padding: 30px;
}
.dot-warning-header {
  font-size: 4em;
  text-transform: uppercase;
  font-weight: bold;
  padding: 5px;
}
.dot-warning-body {
  max-width: 650px;
  font-size: 1.25em;
  padding: 20px;
  background: #0005;
}
.dot-warning-confirm {
  max-width: 275px;
  font-size: 1.2em;
  margin-top: 20px;
  text-align: center;
  background: whitesmoke;
  color: var(--saito-red);
  border: 1px solid var(--saito-red);
}
      </style>
    `;
  }
  attachEventsModalSelectCrypto(app, cryptomod) {
    try {
      let dotgo = document.getElementById("dot-warning-confirm");
      if (dotgo) {
        dotgo.onclick = (e) => {
          cryptomod.modal_overlay.hide();
          app.connection.emit('update_balance');
        }
      }
    } catch (err) {
console.log("ERROR ACTIVATING: " + err);
    }
    return;
  }

}

module.exports = TST;

