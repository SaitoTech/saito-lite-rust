const ComposeTemplate = require('./compose.template');

class EmailCompose {

  constructor(app, mod) {
  }

  render(app, mod) {
    app.browser.addElementToSelector(ComposeTemplate(app, mod), ".email-body");
  }


  attachEvents(app, mod) {
  }

}

module.exports = EmailCompose;

