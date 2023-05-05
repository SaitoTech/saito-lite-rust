const DepositTemplate = require("./deposit.template");
const SaitoOverlay = require("./../saito-overlay/saito-overlay");

class Deposit {

  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(app, mod, false);

    this.app.connection.on("saito-crypto-deposit-render-request", (obj) => {
      this.render();
    });
  }

  render() {
    this.overlay.show(DepositTemplate(this.app, this.mod, this));  

    this.renderCrypto();
    this.attachEvents();
    
  }  

  attachEvents() {    
    document.querySelector(".saito-crypto-deposit-container .pubkey-containter").onclick = (e) => {
      let public_key = document.querySelector('.saito-crypto-deposit-container #profile-public-key').innerHTML;
      navigator.clipboard.writeText(public_key);
      let icon_element = document.querySelector(".saito-crypto-deposit-container .pubkey-containter i");
      icon_element.classList.toggle("fa-copy");
      icon_element.classList.toggle("fa-check");

      setTimeout(() => {
        icon_element.classList.toggle("fa-copy");
        icon_element.classList.toggle("fa-check");
      }, 800);
    } 
  }


  async renderCrypto() {

    try {

      let available_cryptos = this.app.wallet.returnInstalledCryptos();
      let preferred_crypto = this.app.wallet.returnPreferredCrypto();
      let add = preferred_crypto.returnAddress();

      if (typeof preferred_crypto.destination != 'undefined') {
        if (document.querySelector(".saito-crypto-deposit-container #profile-public-key").innerHTML != preferred_crypto.destination) {
          document.querySelector(".saito-crypto-deposit-container  #profile-public-key").innerHTML = preferred_crypto.destination;
          document.querySelector("#deposit-qrcode").innerHTML = "";
          this.app.browser.generateQRCode(preferred_crypto.destination, 'deposit-qrcode');

        }
      } else {
        if (document.querySelector(".saito-crypto-deposit-container #profile-public-key").innerHTML != this.app.wallet.returnPublicKey()) {
          document.querySelector(".saito-crypto-deposit-container  #profile-public-key").innerHTML = this.app.wallet.returnPublicKey();
          document.querySelector("#deposit-qrcode").innerHTML = "";
          this.app.browser.generateQRCode(this.app.wallet.returnPublicKey(), 'deposit-qrcode');
        }
      }

      for (let i = 0; i < available_cryptos.length; i++) {
        this.loadCryptoBalance(available_cryptos[i], preferred_crypto);
      }

    } catch (err) { console.log("Error rendering crypto header: " + err); }
  }

  async loadCryptoBalance(cryptoMod, preferred_crypto) {
    try {
      if (cryptoMod.returnIsActivated()) {
        let balance = await cryptoMod.formatBalance();
        if (cryptoMod == preferred_crypto) {
          document.querySelector(`.saito-crypto-deposit-container .balance-amount`).innerHTML = `${balance} <span class="deposit-ticker">${cryptoMod.ticker}</span>`;
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

}

module.exports = Deposit;

