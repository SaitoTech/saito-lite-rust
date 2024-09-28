const Tutorial03MainTemplate = require('./main.template');

class Tutorial03Main {

  constructor(app, mod) {

    this.app = app;
    this.mod = mod;
    this.name = "Tutorial03Main";

  }

  render() {

    if (document.querySelector("body")) {
      document.querySelector("body").innerHTML = Tutorial03MainTemplate();
    }

    let btn = document.querySelector('.tutorial03-button');
    if (btn) { 
      btn.onclick = (e) => { 
        this.mod.sendTutorial03Transaction(); 
      }
    }

  }

  receiveTransaction(tx) {
    let txmsg = tx.returnMessage();
    this.app.browser.addElementToSelector(`TX received - random: ${txmsg.data.random} <br />`, `.tutorial03-received-transactions`);
  }

}

module.exports = Tutorial03Main;

