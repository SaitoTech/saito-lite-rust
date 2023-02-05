const SaitoModuleLong = require("./../../../../lib/saito/new-ui/templates/saito-module-long.template");

module.exports = ArcadeObserverTemplate = (app, mod, msg) => {

  if (!msg || !msg.module){ return ""; }

  let playersHtml = `<div class="playerInfo">`;
  msg.players_array.split("_").forEach((player) => {
    let identicon = app.keychain.returnIdenticon(player);
    playersHtml += `<div class="player-slot`;
    if (msg.winner && msg.winner.includes(player)){
      playersHtml += " winner";
    }
    playersHtml += ` tip"><img class="identicon" src="${identicon}"><div class="tiptext">${app.browser.returnAddressHTML(player)}</div></div>`;
  });
  playersHtml += '</div>';

  let id=`observe-${msg.game_id}`;
  let buttonsHtml = `<button data-sig="${msg.game_id}" data-cmd="watch" class="button observe-game-btn">${(msg.game_status == "over")?"REVIEW":"WATCH"}</button>`;

  let datetime = app.browser.formatDate(msg.latest_move);

  let detailsHtml = `
  <div class="gameShortDescriptionRow">
    <div class="gameShortDescriptionKey">Moves:</div>
    <div class="gameShortDescriptionValue">${msg.step}</div>
  </div>
  <div class="gameShortDescriptionRow">
    <div class="gameShortDescriptionKey">Last:</div>
    <div class="gameShortDescriptionValue">${datetime.hours}:${datetime.minutes}</div>
  </div>
  `;

  return SaitoModuleLong(app, app.modules.returnModule(msg.module), id, playersHtml, detailsHtml, buttonsHtml);

}



