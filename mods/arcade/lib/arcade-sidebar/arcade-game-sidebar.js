const saito = require('./../../../../lib/saito/saito');
const ArcadeGameSidebarTemplate = require('./arcade-game-sidebar.template');
const ArcadeGamesFullListOverlayTemplate = require('./arcade-games-full-list-overlay.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');
const ModalRegisterUsername = require('./../../../../lib/saito/ui/modal-register-username/modal-register-username');
const ArcadeGameDetails = require('../arcade-game/arcade-game-details');
const ArcadeContainerTemplate = require('../arcade-main/templates/arcade-container.template');
module.exports = ArcadeGameSidebar = {

  render(app, mod) {

    let x = app.browser.returnURLParameter("game");
    let game_mod = app.modules.returnModuleBySlug(x);

    if (!document.getElementById("arcade-container")) { app.browser.addElementToDom(ArcadeContainerTemplate()); }
    if (!document.querySelector(".arcade-sidebar")) { app.browser.addElementToDom(ArcadeGameSidebarTemplate(game_mod), "arcade-container"); }

    app.modules.respondTo("email-chat").forEach(module => {
      if (module != null) {
        module.respondTo('email-chat').render(app, module);
      }
    });

  },

  
  attachEvents(app, mod) {

    if (!document.getElementById("games-add-game")) { return; }

    if (app.modules.returnModule("AppStore") != null) {
      document.getElementById("games-add-game").onclick = () => {
        let appstore_mod = app.modules.returnModule("AppStore");
        if (appstore_mod) {
          let options = { search : "" , category : "Entertainment" , featured : 1 };
          appstore_mod.openAppstoreOverlay(options);
        }
      };
    }

    Array.from(document.getElementsByClassName('arcade-navigator-item')).forEach(game => {
      game.addEventListener('click', (e) => {

        let gameName = e.currentTarget.id;
        app.browser.logMatomoEvent("Arcade", "ArcadeSidebarInviteCreateClick", gameName);
        let doGameDetails = () => {
          let tx = new saito.default.transaction();
          tx.msg.game = gameName;
          ArcadeGameDetails.render(app, mod, tx);
          ArcadeGameDetails.attachEvents(app, mod, tx);
        }

        //
        // not registered
        //
        if (app.keys.returnIdentifierByPublicKey(app.wallet.returnPublicKey()) == "") {
          if (app.options.wallet.anonymous != 1) {
            mod.modal_register_username = new ModalRegisterUsername(app, doGameDetails);
            mod.modal_register_username.render(app, mod);
            mod.modal_register_username.attachEvents(app, mod);
            return;
          }
        }
        doGameDetails();
      });
    });


    app.modules.respondTo("email-chat").forEach(module => {
      module.respondTo('email-chat').attachEvents(app, mod);
    });

  }

}



