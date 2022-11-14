const ArcadeMenuTemplate = require('./menu.template');

class ArcadeMenu {

  constructor(app){
    this.app = app;
  }

  render(app, mod, container = "") {

    let gamelist = [];

    //Query all games in Saito build
    app.modules.respondTo("arcade-games").forEach(game_mod => {
      let title = (game_mod.gamename)? game_mod.gamename: game_mod.name;
        gamelist.push([game_mod.categories, 
          `<li class="arcade-menu-item${(game_mod.name == mod.viewing_game_homepage)? " selected":""}" id="${game_mod.name}">${title}</li>`]);
    });

    //Sort the games according to their categories...
    if (!mod.manual_ordering){
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

    if (!document.querySelector(".arcade-menu")) {
      app.browser.addElementToSelector(ArcadeMenuTemplate(app, mod, gamelisthtml), container);
    } else {
      app.browser.replaceElementBySelector(ArcadeMenuTemplate(app, mod, gamelisthtml), container);
    }

    this.attachEvents(app, mod);
  }

  
  attachEvents(app, mod) {
            
    Array.from(document.getElementsByClassName('arcade-menu-item')).forEach(game => {
      game.addEventListener('click', (e) => {
        let gameName = e.currentTarget.id;

        //mod.viewing_game_homepage = "Arcade"; //gameName;
        //mod.viewing_arcade_initialization_page = false;
        //mod.render(app);

        if (gameName !== mod.name){
          mod.createGameWizard(gameName); 
        }else{
          mod.createGameSelector();
          //mod.viewing_game_homepage = "Arcade";
          //window.location.hash = "";
          //mod.render(app);          
        }

      });
    });


  }

}

module.exports = ArcadeMenu;

