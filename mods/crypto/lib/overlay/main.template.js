
module.exports = (app, mod) => {


  let available_cryptos = app.wallet.returnInstalledCryptos();
  let preferred_crypto = app.wallet.returnPreferredCrypto();
  let add = preferred_crypto.returnAddress();

  const html = `<option class="saito-select-crypto-option" id="crypto-option-${preferred_crypto.name}" value="${preferred_crypto.ticker}">... ${preferred_crypto.ticker}</option>`;
  this.app.browser.addElementToElement(html, document.querySelector(".saito-select-crypto"));
  this.loadCryptoBalance(preferred_crypto);


      //
      // add other options
      //
      for (let i = 0; i < available_cryptos.length; i++) {
        let crypto_mod = available_cryptos[i];
        if (crypto_mod.name != preferred_crypto.name) {
          const html = `<option class="saito-select-crypto-option" id="crypto-option-${crypto_mod.name}" value="${crypto_mod.ticker}">... ${crypto_mod.ticker}</option>`;
          this.app.browser.addElementToElement(html, document.querySelector(".saito-select-crypto"));
          this.loadCryptoBalance(available_cryptos[i]);
        }
      }


  html = `

    Enable Crypto

    

  `;

  return html;

}

