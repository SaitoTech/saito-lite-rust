const EmailAppspaceTemplate = require('./main.template');
const EmailLine = require('./../line');
const EmailBody = require('./../body');
const EmailBox = require('./../box');
const HeaderTemplate = require('./../header.template');
const ComposeTemplate = require('./../compose.template');
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

    let inbox = new EmailBox(app, mod);
    inbox.render(app, mod, boxname);

    this.attachEvents(app, mod);

  }


  attachEvents(app, mod) {

    document.getElementById("email-compose").onclick = (e) => {
      document.getElementById("email-header").style.visibility = "hidden";
      document.querySelector(".email-body").innerHTML = ComposeTemplate(app, mod, app.wallet.returnPublicKey(), "", "");
    };
    document.getElementById("email-outbox").onclick = (e) => {
      document.getElementById("email-header").style.visibility = "visible";
      let box = new EmailBox(app, mod);
      box.render(app, mod, "outbox");
    };
    document.getElementById("email-inbox").onclick = (e) => {
      document.getElementById("email-header").style.visibility = "visible";
      let box = new EmailBox(app, mod);
      box.render(app, mod, "inbox");
    };

  }

}

module.exports = EmailAppspace;


