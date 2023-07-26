module.exports = GameSelectorTemplate = (app, mod, game_selector) => {
  let games_menu = "";

  for (let i = 0; i < mod.arcade_games.length; i++) {
    let game_mod = mod.arcade_games[i];

    if (game_selector.obj.publicKey != null && game_mod.minPlayers == 1) {
    } else {
      games_menu += `
       <div id="${game_mod.name}" class="arcade-game-selector-game" data-id="${game_mod.name}">
     	 <div class="arcade-game-selector-game-image"><img src="${
         game_mod.respondTo("arcade-games").image
       }" /></div>
      	 <div class="arcade-game-selector-game-title">${game_mod.returnName()}</div>
       </div>
      `;
    }
  }

  return `
    <div class="arcade-game-selector">
      ${games_menu}
    </div>
  `;
};
