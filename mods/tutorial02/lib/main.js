const Tutorial02MainTemplate = require('./main.template');

class Tutorial02Main {

  constructor(app, mod) {

    this.app = app;
    this.mod = mod;
    this.name = "Tutorial02Main";

  }

  render() {

    if (document.querySelector("body")) {
      document.querySelector("body").innerHTML = Tutorial02MainTemplate();
    }

    let btn = document.querySelector('.tutorial02-button');
    if (btn) { 
      btn.onclick = (e) => { 
	alert("sending a transaction!");
        this.mod.sendTutorial02Transaction(); 
      }
    }

  }

}

module.exports = Tutorial02Main;

