const InvitesAppspaceTemplate = require('./main.template.js');
const InviteTemplate = require('./invite.template.js');
const SaitoScheduler = require('./../../../../lib/saito/new-ui/saito-scheduler/saito-scheduler');

class InvitesAppspace {

  constructor(app) {
  }

  render(app, mod, container = "") {

    if (!document.querySelector(".invite-email-appspace")) {
      app.browser.addElementToSelector(InvitesAppspaceTemplate(app, mod), ".appspace");
    }


    if (mod.invites) {

      for (let i = 0; i < mod.invites.length; i++) {
        app.browser.addElementToSelector(InvitesInvitationTemplate(app, mod, i), ".invites");
      }

      for (let i = 0; i < mod.invites.length; i++) {
        if (mod.isPendingMe(mod.invites[i], app.wallet.returnPublicKey())) {
          let qs = `#invites-invitation-${i} > invites-invitation-accept`;
          document.querySelectorAll(qs).forEach((el) => {
            el.style.display = "none";
          });
        }
        if (mod.isPendingOthers(mod.invites[i], app.wallet.returnPublicKey())) {
          let qs = `#invites-invitation-${i} > invites-invitation-accept`;
          document.querySelectorAll(qs).forEach((el) => {
            el.style.display = "none";
          });
        }
      }
    }

    this.attachEvents(app, mod);
  }



  attachEvents(app, mod) {

    document.getElementById("invites-new-invite").onclick = (e) => {

      let sc = new SaitoScheduler(app, mod);
      sc.render(app, mod, function(data) {
        let gc = new GameCreator(app, mod);
        gc.render(app, mod);
      });

    }


    //
    // button to initiate invites
    //
    // document.getElementById("invite_btn").onclick = (e) => {
    //
    //   let recipient = document.getElementById("invite_address").value;
    //   if (recipient === "") { recipient = app.wallet.returnPublicKey(); }
    //
    //   mod.createOpenTransaction(recipient, { from: app.wallet.returnPublicKey(), to: recipient });
    //
    // }

    //
    // buttons to respond
    //
    // document.querySelectorAll(".invites-invitation-accept").forEach((el) => {
    //   el.onclick = (e) => {
    //     let index = el.getAttr("data-id");
    //     alert("accept: " + index);
    //   }
    // });
    // document.querySelectorAll(".invites-invitation-cancel").forEach((el) => {
    //   el.onclick = (e) => {
    //     let index = el.getAttr("data-id");
    //     alert("cancel: " + index);
    //   }
    // });

    // expand height 
    // const additionalInfoButtonContainer = document.querySelector('.invites-appspace-additional-info');
    // const additionalInfoButton = document.querySelector('.invites-appspace-additional-info i');
    // const containerId = additionalInfoButtonContainer.getAttribute('data-target');
    // const container = document.querySelector(containerId)

    // additionalInfoButton.addEventListener('click', () => {
    //   if (!additionalInfoButton.classList.contains('rotate')) {
    //     container.style.maxHeight = "200rem";
    //     additionalInfoButton.classList.add('rotate');
    //   }
    //   else {
    //     container.style.maxHeight = "22rem";
    //     additionalInfoButton.classList.remove('rotate');

    //   }
    // })

  }

}

module.exports = InvitesAppspace;

