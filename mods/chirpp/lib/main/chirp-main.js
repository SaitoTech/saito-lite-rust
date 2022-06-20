const ChirpMainTemplate = require('./chirp-main.template');

class ChirpMain {

  constructor(app) {
  };

  render(app) {
    if (!document.querySelector('.container')) {
      app.browser.addElementToDom(ChirpMainTemplate(app));
    }
    this.attachEvents();
  };

  attachEvents() {


  };
}

module.exports = ChirpMain;

