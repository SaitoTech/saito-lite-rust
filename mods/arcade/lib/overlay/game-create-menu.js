const saito = require('./../../../../lib/saito/saito');
const GameCreateMenuTemplate= require('./game-create-menu.template');
const SaitoOverlay = require('./../../../../lib/saito/new-ui/saito-overlay/saito-overlay');

/*
  Not yet deprecated code for selecting a game from a list of games in order to launch the game wizard
*/

module.exports = GameCreateMenu = {

  render(app, mod) {
  
    let overlay = new SaitoOverlay(app);
    
    let html = "";
    app.modules.respondTo("arcade-games").forEach(game_mod => {
      let title = (game_mod.gamename)? game_mod.gamename: game_mod.name;
      let status = (game_mod.status)? `<div class="tiptext">This game is: ${game_mod.status}.</div>`: "";
      html += `<li class="arcade-navigator-item tip" id="${game_mod.name}">${title}${status}</li>`;
    });

    overlay.show(app, mod, GameCreateMenuTemplate(html));

    Array.from(document.getElementsByClassName('arcade-navigator-item')).forEach(game => {
      game.addEventListener('click', (e) => {
        let gameName = e.currentTarget.id;
        app.browser.logMatomoEvent("Arcade", "GameListOverlayClick", gameName);
          
        mod.createGameWizard(gameName);
        overlay.remove();
      });
    });

  }
  
}



