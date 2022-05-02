const InvitesAppspaceTemplate = require('./invites-appspace.template.js');
const jsonTree = require('json-tree-viewer');

module.exports = InvitesAppspace = {

    render(app, mod) {

      document.querySelector(".email-appspace").innerHTML = sanitize(DebugAppspaceTemplate());

      try {
        var tree = jsonTree.create(app.options.invites, document.getElementById("invites"));
      } catch (err) {
        console.log("error creating jsonTree: " + jsonTree);
      }

      let actions = '';
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

    },

    attachEvents(app, mod) {

      //
      // button to initiate invites
      //
      document.getElementById("invite_btn").onclick = (e) => {

	let address = document.getElementById("invite_address").value;

	alert("Clicked w/ address: " + address);

	let newtx = app.wallet.createUnsignedTransaction(address);
	newtx.transaction.msg = {
	  module : mod.name ,
	  request : "open" ,
	}
	newtx = app.wallet.signTransaction(newtx);
	app.network.propagateTransaction(newtx);

	let relay_mod = app.modules.returnModule("Relay");
	if (relay_mod) {
          relay_mod.sendRelayMessage([address, app.wallet.returnPublicKey()], "invites open", newtx);
	}

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
