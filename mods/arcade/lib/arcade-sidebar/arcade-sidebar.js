const saito = require('./../../../../lib/saito/saito');
const ArcadeSidebarTemplate = require('./arcade-sidebar.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');
const ModalRegisterUsername = require('./../../../../lib/saito/ui/modal-register-username/modal-register-username');
const ArcadeGameDetails = require('../arcade-game/arcade-game-details');
const ArcadeContainerTemplate = require('../arcade-main/templates/arcade-container.template');
module.exports = ArcadeSidebar = {

  render(app, mod) {

    if (!document.getElementById("arcade-container")) { app.browser.addElementToDom(ArcadeContainerTemplate()); }
    if (!document.querySelector(".arcade-sidebar")) { app.browser.prependElementToDom(ArcadeSidebarTemplate(), document.getElementById("arcade-container")); }

    app.modules.respondTo("email-chat").forEach(module => {
      if (module != null) {
        module.respondTo('email-chat').render(app, module);
      }
    });

    let gamelist = [];
    //Query all games in Saito build
    app.modules.respondTo("arcade-games").forEach(module => {
      let title = (module.gamename)? module.gamename: module.name;
      if (!document.getElementById(module.name)) {
        gamelist.push([module.categories, `<li class="arcade-navigator-item" id="${module.name}">${title}</li>`]);
      }
    });

    //Sort the games according to their categories...
    if (false){
      gamelist.sort(function (a,b){
        if (a[0]>b[0]){ return 1;}
        if (a[0]<b[0]){ return -1;}
        return 0;
      });
    }

    let gamelisthtml = "";
    for (let g of gamelist){
      gamelisthtml += g[1];
    }

    let games_menu = document.querySelector(".arcade-apps");
    if (games_menu){
      games_menu.innerHTML = sanitize(gamelisthtml);
    }

  },

  
  attachEvents(app, mod) {
  
      let addGames = document.getElementById("games-add-game");
      let appstore_mod = app.modules.returnModule("AppStore");
      if (addGames){
        if (appstore_mod){
          addGames.onclick = () => {
            let options = { search : "" , category : "Entertainment" , featured : 1 };
            appstore_mod.openAppstoreOverlay(options);
          };
        }else{
          addGames.remove();
        }
      }
          
    Array.from(document.getElementsByClassName('arcade-navigator-item')).forEach(game => {
      game.addEventListener('click', (e) => {
        let gameName = e.currentTarget.id;
        app.browser.logMatomoEvent("Arcade", "GameListArcadeSidebarClick", gameName);
        let doGameDetails = () => {
          let tx = new saito.default.transaction();
          tx.msg.game = gameName;
          ArcadeGameDetails.render(app, mod, tx);
          ArcadeGameDetails.attachEvents(app, mod, tx);
        }
        /*
        // Skip registration prompt
        //
        if (app.keys.returnIdentifierByPublicKey(app.wallet.returnPublicKey()) == "") {
          if (app.options.wallet.anonymous != 1) {
            mod.modal_register_username = new ModalRegisterUsername(app, doGameDetails);
            mod.modal_register_username.render(app, mod);
            mod.modal_register_username.attachEvents(app, mod);
            return;
          }
        }*/
        doGameDetails();
      });
    });


    app.modules.respondTo("email-chat").forEach(module => {
      module.respondTo('email-chat').attachEvents(app, mod);
    });


  }

}



