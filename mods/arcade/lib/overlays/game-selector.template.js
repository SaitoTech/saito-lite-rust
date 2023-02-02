module.exports = GameSelectorTemplate = (app, mod, game_selector, element_title = "") => {

  let games_menu = '';
  if (element_title === "") { element_title = "Select Game"; }

  for (let i = 0; i < mod.arcade_games.length; i++) {
    let game_mod = mod.arcade_games[i];

    if (game_selector.obj.publickey != null && game_mod.minPlayers == 1) {
      return; 
    }

    games_menu += `
     <div id="${game_mod.name}" class="arcade-game-selector-game" data-id="${game_mod.name}">
     	 <div class="arcade-game-selector-game-image"><img src="${game_mod.returnArcadeImg()}" /></div>
    	 <div class="arcade-game-selector-game-title">${game_mod.returnName()}</div>
     </div>
    `;
    
  }


  return `
  <div class="arcade-game-selector">
    ${games_menu}
  </div>
  `;

}
