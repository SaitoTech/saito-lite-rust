module.exports = ArcadeMainTemplate = (app, mod) => {

  let games_menu = '';

  for (let i = 0; i < mod.arcade_games.length; i++) {
    let game_mod = mod.arcade_games[i];
      games_menu += `
       <div id="${game_mod.name}" class="arcade-game-selector-game" data-id="${ game_mod.name }">
       <div class="arcade-game-selector-game-image"><img src="${game_mod.respondTo('arcade-games').image}" /></div>
         <div class="arcade-game-selector-game-title">${game_mod.returnName()}</div>
       </div>
      `;
  }

	return `
    <div id="saito-container" class="saito-container arcade-container">
      <div id="arcade-main" class="saito-main arcade-main">
        <div id="arcade-invites-box" class="arcade-invites-box"></div>
        <div id="arcade-game-filter-list" class="arcade-game-filter-list">
          <div id="all-games" class="game-filter-item">all games</div>
          <div id="all-games" class="game-filter-item">card games</div>
          <div id="all-games" class="game-filter-item">board games</div>
          <div id="all-games" class="game-filter-item">one player games</div>
        </div>
        <div id="arcade-central-panel" class="arcade-central-panel">
          ${games_menu}
	      </div>
      </div>
      <div class="saito-sidebar right">
        <div id="arcade-leagues" class="arcade-leagues"></div>
      </div>
    </div>
  `;

};
