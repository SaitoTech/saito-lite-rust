const saito = require('./../../../../lib/saito/saito');
const ArcadeGameSidebarTemplate = require('./arcade-game-sidebar.template');
const ArcadeContainerTemplate = require('./../templates/arcade-container.template');

module.exports = ArcadeGameSidebar = {

  render(app, mod) {
    let game_mod = app.modules.returnModuleBySlug(mod.viewing_game_homepage);

    if (!document.getElementById("arcade-container")) { app.browser.addElementToDom(ArcadeContainerTemplate()); }
    if (!document.querySelector(".arcade-sidebar")) { app.browser.addElementToDom(ArcadeGameSidebarTemplate(game_mod), document.getElementById("arcade-container")); }

  },

  
  attachEvents(app, mod) {
    let game_mod = app.modules.returnModuleBySlug(mod.viewing_game_homepage);

    //Launch Game on Click
    Array.from(document.querySelectorAll("#new-game")).forEach(newGameBtn => {
      newGameBtn.addEventListener('click', (e) => {
        //Should we create a new Event tag?
        app.browser.logMatomoEvent("Arcade", "GamePageClick", game_mod.name); 
	mod.createGameWizard(game_mod.name);
      });
    });
    
    //Fetch Instructions
    Array.from(document.querySelectorAll("#how-to-play")).forEach(howToBtn => {
      howToBtn.addEventListener('click', (e) => {
        app.browser.logMatomoEvent("Arcade", "GameRules", game_mod.name); 
        mod.overlay.show(app, mod, game_mod.returnGameRulesHTML());
      });
    });

    //Bread crumbs
    Array.from(document.getElementsByClassName('navigation-return-to-arcade')).forEach(link => {
      link.addEventListener("click", (e) => {
        app.browser.logMatomoEvent("Navigation", "GamePageToArcade", game_mod.name); 
        window.location = "/arcade";
      });
    });


  }

}



