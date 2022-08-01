const EmailAppspaceTemplate = require('./main.template');
const EmailLineTemplate = require('./../line.template');
const BodyTemplate = require('./../body.template');
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
      obj.onclick = (e) => {
        let id = obj.getAttribute("data-id");
        line_self.openEmail(app, mod, id, boxname);
      }
    });

  }


  openEmail(app, mod, sig, boxname="inbox") 
    let email = "";

    if (boxname === "inbox") {
      for (let i = 0; i < mod.inbox.length; i++) {
	if (mod.inbox[i].transaction.sig === sig) {
	  email = mod.inbox[i];
	  break;
	}
      }
    }

    if (boxname === "outbox") {
      for (let i = 0; i < mod.outbox.length; i++) {
	if (mod.outbox[i].transaction.sig === sig) {
	  email = mod.outbox[i];
	  break;
	}
      }
    }

    document.querySelector(".appspace").innerHTML = BodyTemplate(app, mod, email);

  }

  attachEvents(app, mod) {

    document.getElementById("email-compose").onclick = (e) => {
      document.querySelector(".email-list").innerHTML = ComposeTemplate(app, mod);
    };
    document.getElementById("email-outbox").onclick = (e) => {
      this.render(app, mod, "outbox");
    };
    document.getElementById("email-inbox").onclick = (e) => {
      this.render(app, mod);
    };

  }

}

module.exports = EmailAppspace;


