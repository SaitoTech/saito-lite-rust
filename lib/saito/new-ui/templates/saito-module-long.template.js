
/*
 A generic template for the original arcade invite stubs, i.e. long box with game image background and action buttons on right
*/

module.exports = SaitoModuleLongTemplate = (app, gameModule, id, playersHtml, options, actions) => {
  if (!app || !gameModule) { 
    return "";
  }
  
  let slug = gameModule.returnSlug();
  let bannerBack = gameModule.respondTo("arcade-carousel")?.background || `/${slug}/img/arcade/arcade-banner-background.png`;
  let gameBack = gameModule.respondTo("arcade-games")?.img || `/${slug}/img/arcade/arcade.jpg`;
  let name = gameModule.gamename || gameModule.name;

  return `
    <div id="${id}" class="arcade-tile" style="background-image: url('${bannerBack}');">
      <div class="invite-tile-wrapper">
        <div class="game-inset-img" style="background-image: url('${gameBack}');"></div>
        <div class="invite-col">
          <div class="gameName">${name}</div>
          <div class="gamePlayers">${playersHtml}</div>
        </div>
        <div class="gameShortDescription">${options}</div>
	    <div class="invite-col">${actions}</div>
      </div>
    </div>`;

};