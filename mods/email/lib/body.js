const BodyTemplate = require('./body.template');

class EmailBody {

  constructor(app, mod) {
  }

  render(app, mod, email) {

    //
    // add template
    //
    document.querySelector(".email-body").innerHTML = BodyTemplate(app, mod, email);

  }

}

module.exports = EmailBody;


