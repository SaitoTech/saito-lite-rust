const StunComponentPeersTemplate = require("./peers.template");


class Peers {
  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
  }

  render(app, mod) {

    let publicKey = preferred_crypto.returnAddress();
    
    for (let i = 0; i < app.keys.keys.length; i++) {
      let tk = app.keys.keys[i];
      
      if (tk.publickey === publicKey) {
        
        console.log("public key ", tk.publickey, publicKey);
        stun = app.keys.keys[i].data.stun;

        //
        // NOTHING HAPPENING INSIDE???
        //

      } else {
        app.browser.addElementToDom(StunComponentPeersTemplate(app, mod, tk), "stun-information");
      }
    }

    this.attachEvents(app, mod);
  }


  attachEvents(app, mod) {
  }
}

module.exports = Peers;

