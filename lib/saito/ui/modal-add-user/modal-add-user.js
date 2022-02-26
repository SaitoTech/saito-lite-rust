const ModalAddUserTemplate = require("./modal-add-user.template");
const ModalAddUserConfirmTemplate = require("./modal-add-user-confirm.template");
const SaitoOverlay = require("./../saito-overlay/saito-overlay");

const InviteFriendsQR = require("./invite-friends-qr");
const InviteFriendsTemplate = require("./invite-friends.template.js");
const InviteFriendsLinkTemplate = require("./invite-friends-link.template");
const InviteFriendsPublickeyTemplate = require("./invite-friends-publickey.template");

class ModalAddUser {
  constructor(app) {
    this.app = app;
  }

  render(app, mod) {
    mod.modal_overlay = new SaitoOverlay(app);

    if (!document.querySelector(".add-user")) {
      mod.modal_overlay.show(app, mod, ModalAddUserTemplate());
      document.querySelector(".welcome-modal-left").innerHTML = sanitize(
        InviteFriendsPublickeyTemplate(app)
      );
    }
  }

  attachEvents(app, mod) {
    const startKeyExchange = async (publickey) => {
      console.log("pkey: " + publickey);
      publickey = app.keys.fetchPublicKey(publickey);
      console.log("pkey: " + publickey);

      if (publickey) {
        let encrypt_mod = app.modules.returnModule("Encrypt");
        encrypt_mod.initiate_key_exchange(publickey);
        console.log("done initiate key exchange");
        mod.modal_overlay.show(app, mod, ModalAddUserConfirmTemplate());
        document.querySelector("#confirm-box").onclick = () => {
          mod.modal_overlay.hide();
        };
      } else {
        salert("Address not found");
      }
    };

    /*
// This is broken
      document.querySelector('.generate-link-box').onclick = () => {
        document.querySelector('.welcome-modal-left').innerHTML = InviteFriendsLinkTemplate(app);
        document.querySelector('.link-space').addEventListener('click', (e) => {
          let text = document.querySelector('.share-link');
          text.select();
          document.execCommand('copy');
        });
      }

  //this does nothing
      document.querySelector('.scanqr-link-box').onclick = () => {
        let qrscanner = app.modules.returnModule("QRScanner");
        if (qrscanner) { qrscanner.startScanner(); }
//      data.stopVideo = stopVideo;
//      data.startKeyExchange = startKeyExchange;
//      InviteFriendsQR.render(app, data);
//      InviteFriendsQR.attachEvents(app, data);
    }

    document.querySelector('.address-link-box').onclick = () => {
      document.querySelector('.welcome-modal-left').innerHTML = InviteFriendsPublickeyTemplate(app);
      document.getElementById('add-contact-btn').onclick = () => {
        let publickey = document.getElementById('add-contact-input').value;
        console.log("VALUE: " + publickey);
        startKeyExchange(publickey);
      };
    }
*/
    document.getElementById("add-contact-btn").onclick = () => {
      let publickey = document.getElementById("add-contact-input").value;
      console.log("VALUE: " + publickey);
      startKeyExchange(publickey);
    };
  }
}

module.exports = ModalAddUser;
