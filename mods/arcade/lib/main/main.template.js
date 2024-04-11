module.exports = ArcadeMainTemplate = (app, mod) => {

  let games_menu = '';
  let leagues = [];

  try{
    let league_obj = app.modules.returnFirstRespondTo("leagues-for-arcade");  
    leagues = league_obj.leagues;
  }catch (err){
    console.warn("no league module installled");
  }
  

  for (let i = 0; i < mod.arcade_games.length; i++) {
    let game_mod = mod.arcade_games[i];
      games_menu += `
       <div id="${game_mod.name}" class="arcade-game-selector-game" data-id="${ game_mod.name }">
         <div class="arcade-game-selector-game-image"><img src="${game_mod.respondTo('arcade-games').image}" /></div>
         <div class="arcade-game-selector-game-title"><span>${game_mod.returnName()}</span>`
     if (game_mod?.can_bet){
        games_menu += `<i class="fa-solid fa-coins game-crypto-enabled-icon" title="you can stake web3 crypto on this game"></i>`;  
     }
       games_menu += `</div>
        <div class="game-selector-card-buttons">
          <div id="launch-wizard" class="saito-button-primary launch-wizard" data-id="${ game_mod.name }">play</div>
       `;

       let lid = app.crypto.hash(game_mod.returnName());
       for (let league of leagues){
          if (league.id == lid){
            games_menu += `<div id="lauch-league" class="saito-button-primary launch-league" data-id="${lid}">info</div>`;
            break;  
          }
       }       

       games_menu +='</div></div>';
  }

	return `
    <div id="saito-container" class="saito-container arcade-container">
      <div id="arcade-main" class="saito-main arcade-main">
        <div id="arcade-game-filter-list" class="arcade-game-filter-list">
          <!--div id="all-games" class="game-filter-item">all games</div>
          <div id="all-games" class="game-filter-item">card games</div>
          <div id="all-games" class="game-filter-item">board games</div>
          <div id="all-games" class="game-filter-item">one player games</div-->
        </div>
        <div id="arcade-central-panel" class="arcade-central-panel hide-scrollbar">
          <div class="intersection-anchor" id="top-of-game-list"></div>
          ${games_menu}
	        <div class="intersection-anchor" id="bottom-of-game-list"></div>
        </div>
      </div>
      <div class="saito-sidebar right arcade-sidebar"></div>
    </div>
  `;

};
