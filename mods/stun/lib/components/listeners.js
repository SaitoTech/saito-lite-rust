const StunComponentListenersTemplate = require("./listeners.template");


class Listeners {
  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
  }

  render(app, mod) {

    // 
    // Note:
    // `listeners` is empty in constructor 
    //
    const preferred_crypto = app.wallet.returnPreferredCrypto();
    let publicKey = preferred_crypto.returnAddress();
    let key_index = app.keys.keys.findIndex(key => key.publickey === publicKey)
    const listeners = app.keys.keys[key_index].data?.stun?.listeners;

    app.browser.addElementToDom(StunComponentListenersTemplate(app, mod, listeners), "stun-information");
    
    this.attachEvents(app, mod);
  }


  attachEvents(app, mod) {
  }
}

module.exports = Listeners;

