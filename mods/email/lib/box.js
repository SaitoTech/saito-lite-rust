const EmailBoxTemplate = require('./box.template');
const EmailLine = require('./line');

class EmailBox {

  constructor(app, mod) {
  }

  render(app, mod, boxname="inbox") {

    //
    // add template
    //
    document.querySelector(".email-body").innerHTML = EmailBoxTemplate(app, mod, boxname);

    let box = mod.inbox;
    if (boxname === "outbox") { box = mod.outbox; }

    //
    // add emails
    //
    for (let i = 0; i < box.length; i++) {
      let emailline = new EmailLine(app, mod);
      emailline.render(app, mod, box[i]);
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


  openEmail(app, mod, sig, boxname="inbox") {

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

}

module.exports = EmailBox;


