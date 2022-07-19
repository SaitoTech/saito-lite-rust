module.exports = ArcadeLeagueTemplate = (app, mod, league) => {

  if (!league){
    return "";
  }

  let game = league.game;
  let gameModule = app.modules.returnModule(game);
  let slug, bannerBack, gameBack;

  if (!gameModule){ 
    bannerBack = "/saito/img/doom.jpg";
    gameBack = "/saito/img/background.png";
  }else{
    slug = gameModule.returnSlug();
    bannerBack = gameModule.respondTo("arcade-carousel")?.background || `/${slug}/img/arcade.jpg`;
    gameBack = gameModule.respondTo("arcade-games")?.img || `/${slug}/img/arcade.jpg`;
  }
  
  let playersHtml = `<div class="playerInfo" style="">`;
  
  if (league.myRank > 0) {
    let identicon = app.keys.returnIdenticon(app.wallet.returnPublicKey());
    playersHtml += `<div class="player-slot tip id-${app.wallet.returnPublicKey()}"><img class="identicon" src="${identicon}"><div class="tiptext">${app.browser.returnAddressHTML(app.wallet.returnPublicKey())}</div></div>`;
    playersHtml += `<span class="player-rank">#${league.myRank}</span>`;
  }
  playersHtml += '</div>';


  let inviteHtml = `
    <div id="league-${league.id}" class="arcade-tile" style="background-image: url('${bannerBack}');">
      <div class="invite-tile-wrapper">
        <div class="game-inset-img" style="background-image: url('${gameBack}');"></div>
        <div class="invite-col-2">
          <div class="gameName">${league.name}</div>
          <div class="gamePlayers">${playersHtml}</div>
        </div>
        <div class="gameShortDescription">${makeDescription(app, league)}</div>
	      <div class="gameButtons">
          ${league.myRank < 0 ? `<button data-sig="${league.id}" data-cmd="join" class="button league-tile-button">JOIN</button>`:''}
          <button data-sig="${league.id}" data-cmd="view" class="button league-tile-button">VIEW</button>
        </div>
      </div>
    </div>`;

  return inviteHtml;
}


/* 
  This could use some improvement since some games have a lot of options...
*/
let makeDescription = (app, league) => {

  let html = '';

  
  if (league.game && league.admin !== "saito"){
    html += `<div class="gameShortDescriptionRow"><div class="gameShortDescriptionKey">League: </div><div class="gameShortDescriptionValue">${league.game}</div></div>`;
  }
  if (league.max_players > 0){
    html += `<div class="gameShortDescriptionRow"><div class="gameShortDescriptionKey">Players: </div><div class="gameShortDescriptionValue">${league.playerCnt}/${league.max_players}</div></div>`;  
  }else{
    html += `<div class="gameShortDescriptionRow"><div class="gameShortDescriptionKey">Players: </div><div class="gameShortDescriptionValue">${league.playerCnt}</div></div>`;  
  }
  html += `<div class="gameShortDescriptionRow">${league.type.toUpperCase()}</div>`;  
  html += `<div class="gameShortDescriptionRow">${league.ranking.toUpperCase()}</div>`;  
  
  return html;

}


