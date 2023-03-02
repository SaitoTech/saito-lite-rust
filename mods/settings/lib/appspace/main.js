const SettingsAppspaceTemplate = require('./main.template.js');
const RegisterUsernameModal = require('./../../../../lib/saito/ui/modals/register-username/register-username.js');
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");

const jsonTree = require('json-tree-viewer');

class SettingsAppspace {

  constructor(app, mod, container="") {
    this.app = app;
    this.mod = mod;
    this.container = container;

    this.overlay = new SaitoOverlay(app, mod);

    this.app.connection.on("settings-overlay-render-request", () => {
      this.mod.attachStyleSheets();
      this.render();
    });

  }

  render() {

    this.overlay.show(SettingsAppspaceTemplate(this.app, this.mod));

    let settings_appspace = document.querySelector(".settings-appspace");
    if (settings_appspace) {
      for (let i = 0; i < this.app.modules.mods.length; i++) {
        if (this.app.modules.mods[i].respondTo("settings-appspace") != null) {
          let mod_settings_obj = this.app.modules.mods[i].respondTo("settings-appspace");
          mod_settings_obj.render(this.app, this.mod);
        }
      }
    }

    //debug info
    let el = document.querySelector(".settings-appspace-debug-content");

    try {
      let optjson = JSON.parse(JSON.stringify(this.app.options, (key, value) =>
            typeof value === 'bigint'
                ? value.toString()
                : value // return everything else unchanged
        ));
      var tree = jsonTree.create(optjson, el);
    } catch (err) {
      console.log("error creating jsonTree: " + err);
    }

    this.attachEvents();

  }

  attachEvents() {

    let app = this.app;
    let mod = this.mod;

    try {

      let settings_appspace = document.querySelector(".settings-appspace");
      if (settings_appspace) {
        for (let i = 0; i < app.modules.mods.length; i++) {
          if (app.modules.mods[i].respondTo("settings-appspace") != null) {
            let mod_settings_obj = app.modules.mods[i].respondTo("settings-appspace");
            mod_settings_obj.attachEvents(app, mod);
          }
        }
      }

      document.getElementById("register-identifier-btn").onclick = function (e) {
       mod.modal_register_username = new RegisterUsernameModal(app, mod);
       mod.modal_register_username.render(app, mod);
       mod.modal_register_username.attachEvents(app, mod);
      }

      document.querySelector(".settings-appspace-see-privatekey").onclick = function (e) {
        document.querySelector(".settings-appspace-see-privatekey").classList.toggle("saito-password");
      }


      if (document.getElementById("trigger-appstore-btn")) {
        document.getElementById("trigger-appstore-btn").onclick = function (e) {
          let appstore_mod = app.modules.returnModule("AppStore");
          if (appstore_mod) {
            appstore_mod.openAppstoreOverlay(app, appstore_mod);
          }
        }
      }

      //
      // install module (button)
      //
      Array.from(document.getElementsByClassName("modules_mods_checkbox")).forEach(ckbx => {

        ckbx.onclick = async (e) => {

          let thisid = parseInt(e.currentTarget.id);
          let currentTarget = e.currentTarget;

          if (e.currentTarget.checked == true) {
            let sc = await sconfirm("Reactivate this module?");
            if (sc) {
              app.options.modules[thisid].active = 1;
              app.storage.saveOptions();
              window.location = window.location;
            } else {
              window.location = window.location;
            }
          } else {
            let sc = await sconfirm("Remove this module?");
            if (sc) {
              app.options.modules[thisid].active = 0;
              app.storage.saveOptions();
              window.location = window.location;
            } else {
              currentTarget.checked = true;
            }
          }

        };
      });

      document.getElementById('backup-account-btn').addEventListener('click', (e) => {
        app.wallet.backupWallet();
      });

      document.getElementById('restore-account-btn').onclick = async (e) => {
        document.getElementById('file-input').addEventListener('change', function (e) {
          var file = e.target.files[0];
          app.wallet.restoreWallet(file);
        });
        document.querySelector('#file-input').click();
      }

      document.querySelector('.copy-public-key').onclick = (e) =>{
        navigator.clipboard.writeText(app.wallet.returnPublicKey());
        salert("Public key copied");
      }
      /*
          document.getElementById('reset-account-btn').onclick = async (e) => {
      
            confirmation = await sconfirm('This will reset your account, do you wish to proceed?');
            if (confirmation) {
              app.wallet.resetWallet();
              app.modules.returnModule('Arcade').onResetWallet();
              app.storage.resetOptions();
      
              mod.emails.inbox = [];
              mod.emails.sent = [];
              mod.emails.trash = [];
      
              mod.render(app, mod);
              mod.attachEvents(app, mod);
      
              app.blockchain.resetBlockchain();
            }
          };
      */

      document.getElementById('restore-privatekey-btn').onclick = async (e) => {

        await app.storage.resetOptions();

        let privatekey = "";
        let publickey = "";

        try {
          privatekey = await sprompt("Enter Private Key:");
          if (privatekey != "") {
            publickey = app.crypto.returnPublicKey(privatekey);

            app.wallet.wallet.privatekey = privatekey;
            app.wallet.wallet.publickey = publickey;
            app.wallet.wallet.inputs = [];
            app.wallet.wallet.outputs = [];
            app.wallet.wallet.spends = [];
            app.wallet.wallet.pending = [];

            app.blockchain.resetBlockchain();
            await app.wallet.saveWallet();
            window.location = window.location;
          }
        } catch (e) {
          salert("Restore Private Key ERROR: " + e);
          console.log("Restore Private Key ERROR: " + e);
        }

      };

    } catch (err) {
      console.log("Error in Settings Appspace: " + JSON.stringify(err));
    }
  }

}


module.exports = SettingsAppspace;


