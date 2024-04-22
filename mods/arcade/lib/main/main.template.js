module.exports = ArcadeMainTemplate = (app, mod) => {

  let games_menu = '';
  
  let league = null;

  try{
    league = app.modules.returnFirstRespondTo("leagues-for-arcade");  
  }catch (err){
    console.warn("no league module installled");
  }
  

  for (let i = 0; i < mod.arcade_games.length; i++) {
    let game_mod = mod.arcade_games[i];

    let lid = app.crypto.hash(game_mod.returnName());
    if (!league?.returnLeague(lid)){
      lid = "";
    }

      games_menu += `
       <div id="${game_mod.name}" class="arcade-game-selector-game" data-id="${ game_mod.name }" data-league="${lid}">
         <div class="arcade-game-selector-game-image"><img src="${game_mod.respondTo('arcade-games').image}" /></div>
         <div class="arcade-game-selector-game-title"><span>${game_mod.returnName()}</span>`
     if (game_mod?.can_bet){
        games_menu += `<i class="fa-solid fa-coins game-crypto-enabled-icon" title="you can stake web3 crypto on this game"></i>`;  
     }

     games_menu +='</div></div>';
  }

	return `
    <div id="saito-container" class="saito-container arcade-container">
      <div id="arcade-main" class="saito-main arcade-main">
        <div id="arcade-central-panel" class="arcade-central-panel hide-scrollbar">
          <div class="intersection-anchor" id="top-of-game-list"></div>
          ${games_menu}
	        <div class="intersection-anchor" id="bottom-of-game-list"></div>
        </div>
      </div>
      <div class="saito-sidebar right arcade-sidebar">
        <div class='saito-announcement'>The Saito Arcade is an online hub for the peer-to-peer games, web3, and video apps that run on Saito. Play any game to automatically join the leaderboard. Have fun!</div>
      </div>
    </div>
  `;

};
