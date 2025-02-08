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
    const filterList = document.querySelector('#tutorial07-filter-list');
    filterList.innerHTML = `<li>${Array.from(this.mod.app.options.tutorial07.keywords).join('</li><li>')}</li>`;


    // Send TX
    let btn = document.querySelector('.tutorial07-button');
    if (btn) {
      btn.onclick = (e) => {
        const textInput = document.querySelector('#tutorial07-text');
        let text = textInput ? textInput.value : '';
        this.mod.sendTutorial07Transaction(text);
      }
    }

    // Add keyword
    let filter_btn = document.querySelector('.tutorial07-filter-button');
    if (filter_btn) {
      filter_btn.onclick = (e) => {
        const filterInput = document.querySelector('#tutorial07-filter');
        let text = filterInput ? filterInput.value : '';
        filterInput.value = ''

        // Save the keyword to our options and save the options to permanent storage
        this.mod.app.options.tutorial07.keywords.add(text);
        this.mod.app.storage.saveOptions();

//        const filterList = document.querySelector('#tutorial07-filter-list');
        filterList.innerHTML += `<li>${text}</li>`
      }
    }

    // Clear keywords
    let filter_clear_btn = document.querySelector('.tutorial07-filter-clear');
    if (filter_clear_btn) {
      filter_clear_btn.onclick = (e) => {
        const filterInput = document.querySelector('#tutorial07-filter');
        let text = filterInput ? filterInput.value : '';

        // Clear all keywords and update permanent storage
        this.mod.app.options.tutorial07.keywords.clear();
        this.mod.app.storage.saveOptions();

//        const filterList = document.querySelector('#tutorial07-filter-list');
        filterList.innerHTML = ``;

      }
    }


  }

  receiveTransaction(tx) {
    let txmsg = tx.returnMessage();
    this.app.browser.addElementToSelector(`TX received - message: ${txmsg.data} <br />`, `.tutorial07-received-transactions`);
  }

}

module.exports = Tutorial07Main;

