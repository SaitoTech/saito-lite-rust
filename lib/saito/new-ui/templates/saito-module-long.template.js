
/*
 A generic template for the original arcade invite stubs, i.e. long box with game image background and action buttons on right
*/

module.exports = SaitoModuleLongTemplate = (app, gameModule, id, playersHtml, options, actions) => {
  if (!app || !gameModule) { 
    return "";
  }

  return `
    <div id="${id}" class="arcade-tile" style="background-image: url('${gameModule.returnArcadeBnner()}');">
      <div class="invite-tile-wrapper">
        <div class="game-inset-img" style="background-image: url('${gameModule.returnArcadeImg()}');"></div>
        <div class="invite-col">
          <div class="gameName">${gameModule.returnName()}</div>
          <div class="gamePlayers">${playersHtml}</div>
        </div>
        <div class="gameShortDescription">${options}</div>
	    <div class="invite-col">${actions}</div>
      </div>
    </div>`;

};