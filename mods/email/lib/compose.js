const ComposeTemplate = require('./compose.template');

class EmailCompose {

  constructor(app, mod) {
  }

  render(app, mod) {
    document.getElementById("email-body").innerHTML = ComposeTemplate(app, mod);
    this.attachEvents(app, mod);
  }


  attachEvents(app, mod) {

    document.querySelector(".email-compose-submit").onclick = (e) => {

      let recipient = document.getElementById("email-to-address").value;

      if (!app.crypto.isPublicKey(recipient)) { alert("Recipient needs to be publickey / address"); return; }

      let title = document.getElementById("email-subject").value;
      let text = document.getElementById("email-compose-text").value;
      let data = { title : title , text : text };     

      document.getElementById("email-body").innerHTML = '<div class="saito-loader"></div>';

      mod.sendEmailTransaction(recipient, data);
      document.getElementById("email-inbox").click();

    };

  }

}

module.exports = EmailCompose;

