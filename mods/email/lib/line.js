const EmailLineTemplate = require('./line.template');

class EmailLine {

  constructor(app, mod) {
  }

  render(app, mod, tx) {
    app.browser.addElementToSelector(EmailLineTemplate(app, mod, tx), ".email-list");
  }


  attachEvents(app, mod) {
  }

}

module.exports = EmailLine;


