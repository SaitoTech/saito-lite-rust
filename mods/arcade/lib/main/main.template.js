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
        <div class='saito-announcement'>The Saito Arcade is a launch pad for a variety of peer-to-peer games hosted on Saito's unique blockchain. Games here integrate other features of the Saito Network, such as instant messaging, web3 cryptocurrency staking, and voice and video calling tools. Play any game to automatically join the leaderboard. Register a free username so that your opponents can remember who kicked their butt. Have fun!</div>
      </div>
    </div>
  `;

};
