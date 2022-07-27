const StunComponentMyStunTemplate = require("./my-stun.template");


class MyStun {
  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
  }

  render(app, mod) {
    let publicKey = app.wallet.returnPublicKey();
    const key_index = app.keys.keys.findIndex(tk => tk.publickey === publicKey);
    let listeners = app.keys.keys[key_index].data.stun.listeners;

    if (!document.querySelector(".my-stun-container")) {
      app.browser.addElementToDom(StunComponentMyStunTemplate(app, mod, listeners), "stun-information");
      this.attachEvents(app, mod);
    }


  }


  attachEvents(app, mod) {


  }
}

module.exports = MyStun;

