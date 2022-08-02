const EmailAppspaceTemplate = require('./main.template');
const EmailLineTemplate = require('./../line.template');
//const Body = require('./../body.template');
const HeaderTemplate = require('./../header.template');
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
    document.querySelector(".email-header").innerHTML = HeaderTemplate(app, mod, "inbox");

    let box = mod.inbox;
    if (boxname === "outbox") { box = mod.outbox; }

    //
    // add emails
    //
    for (let i = 0; i < box.length; i++) {
      app.browser.addElementToSelector(EmailLineTemplate(app, mod, box[i]), ".email-list");
    }

    let line_self = this;
    let qs = ".email-line-from, .email-line-title, .email-line-time";
    document.querySelectorAll(qs).forEach(function(obj) {
      let id = obj.getAttribute("data-id");
      line_self.openEmail(id);
    });

  }


  openEmail(sig) {
alert(sig);
  }

  attachEvents(app, mod) {

  }

}

module.exports = EmailAppspace;


