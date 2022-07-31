const EmailAppspaceTemplate = require('./main.template');
const EmailLineTemplate = require('./../line.template');
//const Body = require('./../body.template');
//const Header = require('./../header.template');
//const Compose = require('./../compose.template');
const JSON = require('json-bigint');

class EmailAppspace {

  constructor(app, mod) {
  }

  render(app, mod, boxname="inbox") {

    //
    // add template
    //
    document.querySelector(".appspace").innerHTML = EmailAppspaceTemplate(app, mod, boxname);

    let box = mod.inbox;
    if (boxname === "outbox") { box = mod.outbox; }

    //
    // add emails
    //
    for (let i = 0; i < box.length; i++) {
      app.browser.addElementToSelector(EmailLineTemplate(app, mod, box[i]), ".email-list");
    }

    this.attachEvents(app, mod);

  }


  attachEvents(app, mod) {
  }

}

module.exports = EmailAppspace;


