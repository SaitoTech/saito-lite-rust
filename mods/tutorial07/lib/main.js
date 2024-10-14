const Tutorial07MainTemplate = require('./main.template');

class Tutorial07Main {

  constructor(app, mod) {

    this.app = app;
    this.mod = mod;
    this.name = "Tutorial07Main";

  }

  render() {

    if (document.querySelector("body")) {
      document.querySelector("body").innerHTML = Tutorial07MainTemplate();
    }

    let btn = document.querySelector('.tutorial07-button');
    if (btn) { 
      btn.onclick = (e) => { 
        const textInput = document.querySelector('#tutorial07-text');
        let text = textInput ? textInput.value : '';
        this.mod.sendTutorial07Transaction(text);
      }
    }

  }

  receiveTransaction(tx) {
    let txmsg = tx.returnMessage();
    this.app.browser.addElementToSelector(`TX received - random: ${txmsg.data} <br />`, `.tutorial07-received-transactions`);
  }

}

module.exports = Tutorial07Main;

