const InvitesEmailAppspaceTemplate = require('./email-appspace.template.js');
const InvitesInvitationTemplate = require('./../invitation.template.js');
const jsonTree = require('json-tree-viewer');

class InvitesEmailAppspace {

  constructor(app) {
  }

  render(app, mod, container = "") {

    if (!document.querySelector(".invite-email-appspace")) {
      app.browser.addElementToClass(InvitesEmailAppspaceTemplate(app, mod), ".email-appspace");
    }

    try {
      var tree = jsonTree.create(app.options.invites, document.getElementById("invites-json-tree"));
    } catch (err) {
      console.log("error creating jsonTree: " + jsonTree);
    }

console.log("about to look through invites!");

    if (mod.invites) {
console.log("about to look through invites 2!");
console.log("mod invites len: " + mod.invites.length);
      for (let i = 0; i < mod.invites.length; i++) {
console.log("adding element to class...");
        app.browser.addElementToClass(InvitesInvitationTemplate(app, mod, i), ".invites");
console.log("done adding element to class...");
      }


console.log("about to look through invites 3!");

      for (let i = 0; i < mod.invites.length; i++) {
console.log("about to look through invites 3 1!");
console.log(JSON.stringify(mod.invites[i]));
        if (mod.isPendingMe(mod.invites[i], app.wallet.returnPublicKey())) {
	  let qs = `#invites-invitation-${i} > invites-invitation-accept`;
	  document.querySelectorAll(qs).forEach((el) => {
	    el.style.display = "none";
	  });
	}
console.log("about to look through invites 3 2!");
        if (mod.isPendingOthers(mod.invites[i], app.wallet.returnPublicKey())) {
	  let qs = `#invites-invitation-${i} > invites-invitation-accept`;
	  document.querySelectorAll(qs).forEach((el) => {
	    el.style.display = "none";
	  });
	}
      }
    }
console.log("about to look through invites 3 3!");

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
console.log("about to look through invites 5!");
    document.querySelectorAll(".invites-invitation-accept").forEach((el) => {
      el.onclick = (e) => {
	let index = el.getAttr("data-id");
        alert("accept: " + index);
      }
    });
console.log("about to look through invites 6!");
    document.querySelectorAll(".invites-invitation-cancel").forEach((el) => {
      el.onclick = (e) => {
	let index = el.getAttr("data-id");
        alert("cancel: " + index);
      }
    });

  }

}

module.exports = InvitesEmailAppspace;

