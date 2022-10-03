const SaitoModuleXTemplate = require("./saito-module-x.template");

module.exports = SaitoArcadeInviteTemplate = (app, mod, invite=null) => {
  if (!invite){
    return "";
  }
  let gameModule = app.modules.returnModule(invite.msg.game);
  if (!gameModule){
    return "";
  }  
  let action = "Join";
  let slug = gameModule.returnSlug();
  let image = gameModule.respondTo("arcade-games")?.img || `/${slug}/img/arcade.jpg`;
  let game_option = "standard game";
  //Would be nice if we had an easy way to check if advanced options are utilized
  //game_option = "custom game";
  if (typeof invite.msg?.options?.crypto != 'undefined' && invite.msg?.options?.crypto != "") {
    game_option = "crypto game";
  }
  if (invite.msg?.options?.league){
    game_option = "league game";
  } 

  let numPlayerSlots = Math.max(invite.msg.options?.max_players || 0, invite.msg.players_needed);

  let player_identicons = `<div class="saito-module-description-identicon-box">`;
  for (let i = 0; i < numPlayerSlots; i++) {
    if (i < invite.msg.players.length) {
      let identicon = app.keys.returnIdenticon(invite.msg.players[i]);
       player_identicons += `<div class="saito-module-identicon-box tip id-${invite.msg.players[i]}"><img class="saito-module-identicon small" src="${identicon}"><div class="tiptext">${app.browser.returnAddressHTML(invite.msg.players[i])}</div></div>`;
    } else {
      player_identicons += `<div class="saito-module-identicon-box identicon-empty"></div>`;  
    }
  }
  player_identicons += '</div>';

  return SaitoModuleXTemplate(gameModule.gamename, player_identicons, image, game_option, action, invite.transaction.sig);

}

let makeDescription = (app, invite) => {

  let html = '';

  if (invite.msg) {
    let gameModule = app.modules.returnModule(invite.msg.game);
    if (gameModule && gameModule !== "Arcade") {
      let sgoa = gameModule.returnShortGameOptionsArray(invite.msg.options);
      for (let i in sgoa) {
        html += `<div>${i.replace(/_/g, ' ')}</div>`;
        if (sgoa[i] !== null){
          html += `<div>${sgoa[i]}</div>`;
        }
      }
    }
  } 

  return html;

}



