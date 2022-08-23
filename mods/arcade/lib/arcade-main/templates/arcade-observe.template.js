//TODO -- DELETE ME
module.exports = ArcadeObserveTemplate = (app, mod, msg) => {

  let gameModule = app.modules.returnModule(msg.module);
  let slug = gameModule.returnSlug();

  let playersHtml = `<div class="playerInfo" style="grid-template-columns: repeat(${msg.players_array.split("_").length}, 1fr);">`;
  let gameName= gameModule.gamename || gameModule.name;
  let gametime = new Date().getTime();
  let datetime = app.browser.formatDate(gametime);

  msg.players_array.split("_").forEach((player) => {
    let identicon = app.keys.returnIdenticon(player);
    playersHtml += `<div class="player-slot tip id-${player}"><img class="identicon" src="${identicon}"><div class="tiptext">${app.browser.returnAddressHTML(player)}</div></div>`;
  });
  playersHtml += '</div>';

  let bannerBack = gameModule.respondTo("arcade-carousel")?.background || `/${slug}/img/arcade.jpg`;
  let gameBack = gameModule.respondTo("arcade-games")?.img || `/${slug}/img/arcade.jpg`;

  let inviteHtml = `
    <div id="invite-${msg.game_id}" class="arcade-tile" style="background-image: url('${bannerBack}');">
      <div class="invite-tile-wrapper">
        <div class="game-inset-img" style="background-image: url('${gameBack}');"></div>
        <div class="invite-col-2">
          <div class="gameName">${gameName}</div>
          <div class="gameName" style="font-size:0.9em">${datetime.day} ${datetime.month} ${datetime.year}</div>
          ${playersHtml}
        </div>
        <div class="gameShortDescription">${makeDescription(app, msg)}</div>
	<div class="gameButtons">
          <button data-sig="${msg.game_id}" data-cmd="watch" class="button observe-game-btn">WATCH</button>
        </div>
      </div>
    </div>
    `;

  return inviteHtml;
}


let makeDescription = (app, invite) => {

  let html = '';

  if (invite.msg) {
    let gameModule = app.modules.returnModule(invite.msg.game);
    if (gameModule) {
      let sgoa = gameModule.returnShortGameOptionsArray(invite.msg.options);
      for (let i in sgoa) {
        let output_me = 1;
        if (output_me == 1) {
          html += `<div class="gameShortDescriptionRow"><div class="gameShortDescriptionKey">${i}: </div><div class="gameShortDescriptionValue">${sgoa[i]}</div></div>`;
        }
      }
    }
  }

  return html;

}


