const saito = require('./../../../../lib/saito/saito');
const ArcadeGameSidebarTemplate = require('./arcade-game-sidebar.template');
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
   /* We probably need a better way to pass the game name around */
    let gameStub = app.browser.returnURLParameter("game");
    let game_mod = app.modules.returnModuleBySlug(gameStub);

    //Launch Game on Click
    let newGameBtn = document.querySelector("#new-game");
    if (newGameBtn){
      newGameBtn.addEventListener('click', (e) => {
        //Should we create a new Event tag?
        app.browser.logMatomoEvent("Arcade", "ArcadeSidebarInviteCreateClick", game_mod.name); 
        let tx = new saito.default.transaction();
        tx.msg.game = game_mod.name;
        ArcadeGameDetails.render(app, mod, tx);
        ArcadeGameDetails.attachEvents(app, mod, tx);
        
      });
    }
    
    //Fetch Instructions
    let howToBtn = document.querySelector("#how-to-play");
    if (howToBtn){
      howToBtn.addEventListener('click', (e) => {
        mod.overlay.show(app, mod, game_mod.returnGameRulesHTML());
      });
    }          

    //Bread crumbs
    Array.from(document.getElementsByClassName('navigation-return-to-arcade')).forEach(link => {
      link.addEventListener("click", (e) => {
        window.location = "/arcade";
      });
    });


    app.modules.respondTo("email-chat").forEach(module => {
      module.respondTo('email-chat').attachEvents(app, mod);
    });

  }

}



