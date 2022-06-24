const InvitesEmailAppspaceTemplate = require('./email-appspace.template.js');
const jsonTree = require('json-tree-viewer');

class InvitesEmailAppspace {

  constructor(app) {
  }

  render(app, mod, container = "") {

    if (!document.querySelector(".invite-email-appspace")) {
      app.browser.addElementToClass(InvitesEmailAppspaceTemplate(app, mod), ".email-appspace");
    }

    try {
      var tree = jsonTree.create(app.options.invites, document.getElementById("invites"));
    } catch (err) {
      console.log("error creating jsonTree: " + jsonTree);
    }

    let actions = '';
    if (mod.invites) {
      for (let i = 0; i < mod.invites.length; i++) {
        let inv = mod.invites[i];
        if (inv.transaction.msg.request === "open" || inv.transaction.msg.request === "invite") {
          actions += `<div class="action_link action_link_invite" data-id="${i}" id="action_link_${i}">accept ${i}</div>`;
        }
        if (inv.transaction.msg.request === "accept" || inv.transaction.msg.request === "accept") {
          actions += `<div class="action_link action_link_accept" data-id="${i}" id="action_link_${i}">cancel ${i}</div>`;
        }
      }
      document.getElementById("actions").innerHTML = actions;

    }

    this.attachEvents(app, mod);
  }



  attachEvents(app, mod) {

      //
      // button to initiate invites
      //
      document.getElementById("invite_btn").onclick = (e) => {

	let recipient = document.getElementById("invite_address").value;
	if (recipient === "") { recipient = app.wallet.returnPublicKey(); }

        mod.createOpenTransaction(recipient, { from : app.wallet.returnPublicKey() , to : recipient });

      }

      //
      // buttons to respond
      //
      document.querySelectorAll(".action_link_invite").forEach((el) => {
alert("accept");
      });
      document.querySelectorAll(".action_link_accept").forEach((el) => {
alert("cancel");
      });

  }

}

module.exports = InvitesEmailAppspace;

