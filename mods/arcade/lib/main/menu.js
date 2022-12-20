const ArcadeMenuTemplate = require('./menu.template');

class ArcadeMenu {

  constructor(app, mod, container="") {
    this.app = app;
    this.mod = mod;
    this.container = container;
  }

  render() {

    //
    // create HTML of games list
    //
    let gamelist = [];
    let html = "";
    for (let i = 0; i < this.mod.games.length; i++) {
console.log("GAME: " + (i+1));
      let game_mod = this.mod.games[i];
      gamelist.push([game_mod.categories, `<li class="arcade-menu-item${(game_mod.name == this.mod.viewing_game_homepage)? " selected":""}" id="${game_mod.name}">${game_mod.returnName()}</li>`]);
    };
    if (!this.mod.manual_ordering){
      gamelist.sort(function (a,b){
        if (a[0]>b[0]){ return 1;}
        if (a[0]<b[0]){ return -1;}
        return 0;
      });
    }
console.log(JSON.stringify(gamelist));
    for (let g of gamelist){
      html += g[1];
    }

console.log("HTML: " + html);

    if (document.querySelector(".arcade-menu")) {
      this.app.browser.replaceElementBySelector(ArcadeMenuTemplate(html), ".arcade-menu");
    } else {
      this.app.browser.addElementToSelector(ArcadeMenuTemplate(html), this.container);
    }

    this.attachEvents();

  }

  
  attachEvents() {

/*****  
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
*****/

  }

}

module.exports = ArcadeMenu;

