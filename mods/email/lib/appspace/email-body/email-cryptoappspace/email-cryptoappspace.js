const EmailCryptoAppspaceTemplate = require('./email-cryptoappspace.template.js');
let rerenderCallback = async() => {
  await this.rerender(app);
}
let EmailCryptoAppspace = {
  app: null,
  async rerenderCallback() {
    // render is called many times...
    //
    // We need to set an event listener for set_preferred_crypto, but we don't want to attach this listener over and over...
    // The only way to know if we've already attached the listener(other than trying to track that state ourselves manually)
    // is to have a reference to the callback listener that app.connection can then check to see if it is already present
    // (i.e. within) removeListener.
    //
    // However, this listener also needs some kind of closure to hold a reference to app...
    // But, if we create a new closure on each call to render, the new listener reference won't match the old one and we
    // won't be able to remove it, we need something that looks like a static function. i.e a reference to listeners
    // which doesn't change
    //
    // We also cannot use .bind(this) because of the same problem. The function returned by bind() would not be the same as
    // the one attached on the previous call to render.
    //
    // Instead, we get a reference to EmailCryptoAppspace directly, and use it as a place to carry a reference to app and
    // the static-like function(rerender) we want to remove. That is the purpose of this function rerenderCallback.
    await EmailCryptoAppspace.rerender(EmailCryptoAppspace.app);
  },
  async render(app, mod) {
    this.app = app;
    try {
      await this.rerender(app);
      app.connection.removeListener('set_preferred_crypto', this.rerenderCallback);
      app.connection.on('set_preferred_crypto', this.rerenderCallback);
    } catch(error) {
      mod.locationErrorFallback(`Error loading Crypto Module.<br/>${error}`, error)
    }
  },

  getCryptoMod(app) {
    let subPage = app.browser.parseHash(window.location.hash).subpage;
    let cryptoMod = app.modules.returnModule(subPage);
    return cryptoMod;
  },
  async rerender(app) {
    let loadBalance = async(responseInterface) => {
      if(responseInterface.returnIsActivated()) {
        document.querySelectorAll(`.email-appspace-${responseInterface.ticker} .crypto-container .balance`).forEach((elem, i) => {
          elem.innerHTML = "loading...";
        });
        let balance = await responseInterface.returnBalance();
        document.querySelectorAll(`.email-appspace-${responseInterface.ticker} .crypto-container .balance`).forEach((elem, i) => {
          elem.innerHTML = sanitize(balance);
        });
      }

    }
    let loadPubkey = async(responseInterface) => {
      let address = await responseInterface.returnAddress();
      document.querySelector('.crypto-container .address').innerHTML = sanitize(address);
    }
    let cryptoMod = this.getCryptoMod(app);
    let preferredCryptoMod = app.wallet.returnPreferredCrypto();
    document.querySelector(".email-body").innerHTML = sanitize(EmailCryptoAppspaceTemplate(app, cryptoMod));
    loadBalance(cryptoMod);
    loadPubkey(cryptoMod);

    document.querySelectorAll(`.email-appspace-${cryptoMod.ticker} .crypto-container .balance`).forEach((elem, i) => {
      elem.onclick = function (e) {
        cryptoMod.activate();
        loadBalance(cryptoMod);
      }
    });

    try {
      document.getElementById("private-key").onclick = function (e) {
        document.getElementById("private-key").toggleClass("password");
      }
    } catch (err) {
      console.log(err);
    }


    document.querySelector(`.crypto-container .sendbutton`).onclick = () => {
      let howMuch = document.querySelector(`.crypto-container .howmuch`).value;
      let toAddress = document.querySelector(`.crypto-container .pubkeyto`).value;
      try {
        let cryptoMod = this.getCryptoMod(app);
        cryptoMod.transfer(howMuch, toAddress);
        salert("Sent!");
        document.querySelector(`.crypto-container .howmuch`).value = "";
        document.querySelector(`.crypto-container .pubkeyto`).value = "";
      } catch(error) {
        // TODO if error looks like 'Transaction is temporarily banned', this
        // is just a double broadcast and we can inform the user with a more
        // friendly message...
        salert(`Error sending transaction.\n{error}`);
      }
    }
/****
    document.querySelectorAll(`.crypto-container .set-preferred`).forEach((elem, i) => {
      elem.onclick = (event) => {
        if (event.currentTarget.classList.contains('preferred')) {
          event.currentTarget.classList.remove('preferred');
          event.currentTarget.classList.add('not-preferred');
          app.wallet.setPreferredCrypto("SAITO");
        } else {
          event.currentTarget.classList.remove('not-preferred');
          event.currentTarget.classList.add('preferred');
          let cryptoMod = this.getCryptoMod(app);
          app.wallet.setPreferredCrypto(cryptoMod.ticker);
        }
      }
    });
****/

  }

}
module.exports = EmailCryptoAppspace;
