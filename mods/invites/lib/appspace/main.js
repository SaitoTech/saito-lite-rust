const InvitesAppspaceTemplate = require('./main.template.js');
const InviteTemplate = require('./invite.template.js');
const SaitoScheduler = require('./../../../../lib/saito/ui/saito-scheduler/saito-scheduler');

class InvitesAppspace {

  constructor(app, mod, container = "") {

    this.app = app;
    this.mod = mod;
    this.container = container;

    app.connection.on("event-render-request", (invite_obj) => {
      if (!document.querySelector(".invite-email-appspace")) {
        app.browser.replaceElementBySelector(InvitesAppspaceTemplate(app, mod), ".appspace");
	this.render();
	return;
      }
    });



  }


  render() {

    let app = this.app;
    let mod = this.mod;

    if (document.querySelector(".invites-appspace")) {
      this.app.browser.replaceElementBySelector(InvitesAppspaceTemplate(this.app, this.mod), ".invites-appspace");
    } else {
      this.app.browser.addElementToSelectorOrDom(InvitesAppspaceTemplate(this.app, this.mod), this.container);
    }


    if (mod.invites.length > 0) {
      for (let i = 0; i < mod.invites.length; i++) {
        app.browser.addElementToSelector(InviteTemplate(app, mod, mod.invites[i]), ".invites-list");
      }
      for (let i = 0; i < mod.invites.length; i++) {


console.log("-------");
console.log("-------");
console.log(JSON.stringify(mod.invites[i]));

	try {

	  //
	  // buttons may not exist
	  //
          let qs = `#invites-invitation-join-${mod.invites[i].invite_id}`;
          document.querySelector(qs).style.display = "none";
console.log("-------");

	  // hide accept
          qs = `#invites-invitation-accept-${mod.invites[i].invite_id}`;
          document.querySelector(qs).style.display = "none";
console.log("-------");

	  for (let z = 0; z < mod.invites[i].adds.length; z++) {
	    if (mod.invites[i].adds[z] === app.wallet.returnPublicKey()) {
	      have_i_accepted = 0;
	      try {
	        if (mod.invites[i].sigs.length >= (z+1)) {
	          if (mod.invites[i].sigs[z] != "") {
	      	    have_i_accepted = 1;
	          }
	        }
	      } catch (err) { }
              if (have_i_accepted == 0) {
                qs = `#invites-invitation-accept-${mod.invites[i].invite_id}`;
                document.querySelector(qs).style.display = "block";
              }
	    }
	  }

	} catch (err) {

	}

      }
    }

    this.attachEvents();

  }



  attachEvents() {

    let app = this.app;
    let mod = this.mod;

    //
    // buttons to respond
    //
    document.querySelectorAll(".invites-invitation-accept").forEach((el) => {
       el.onclick = (e) => {
         let sig = e.currentTarget.getAttribute("data-id");
         let idx = -1;
	 for (let i = 0; i < mod.invites.length; i++) {
	   if (mod.invites[i].invite_id === sig) { idx = i; }
	 }
	 if (idx == -1) { alert("ERROR: cannot find invite!"); }
	 let invite_obj = mod.invites[idx];
console.log("INVITE OBJ is: " + JSON.stringify(invite_obj));
	 mod.createAcceptTransaction(invite_obj);
         alert("sent accept!");
         let qs = `#invites-invitation-accept-${mod.invites[idx].invite_id}`;
         document.querySelector(qs).style.display = "none";
       }
    });

  }

}

module.exports = InvitesAppspace;

