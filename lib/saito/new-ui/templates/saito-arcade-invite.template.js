const SaitoModuleXTemplate = require("./saito-module-x.template");

/*
  Template for RedSquare - right sidebar games sidebar
  Shows a compressed availabe game invitation
*/


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
  let game_name = gameModule.returnName();
  let image = gameModule.returnArcadeImg();
  let game_option = "standard game";

  if (typeof invite.msg?.options?.crypto != 'undefined' && invite.msg?.options?.crypto != "") {
    game_option = "crypto game";
  }
  if (invite.msg?.options?.league){
    game_option = "league game";
  } 

  //Test if "custom" game options
  if (game_option == "standard game"){
    let defaultOptions = gameModule.returnDefaultGameOptions();
    let defaultKeys = Object.keys(defaultOptions);
    let inviteKeys = Object.keys(invite.msg.options);
    if (defaultKeys.length == inviteKeys.length){
      for (const key of defaultKeys){
        if (defaultOptions[key] !== invite.msg.options[key] && !key.includes("game-wizard-players")){
          console.log(key, defaultOptions[key], invite.msg.options[key]);
          game_option = "custom game";
          break;
        }
      }
    }else{
      game_option = "custom game";
    }
  }

  let numPlayerSlots = Math.max(invite.msg.options["game-wizard-players-select-max"] || 0, invite.msg.players_needed);

  let player_identicons = `<div class="saito-module-description-identicon-box">`;
  for (let i = 0; i < numPlayerSlots; i++) {
    if (i < invite.msg.players.length) {
      if (app.wallet.returnPublicKey() == invite.msg.players[i]){
        action = "Details";
      }
      let identicon = app.keys.returnIdenticon(invite.msg.players[i]);
       player_identicons += `<div class="saito-module-identicon-box tip id-${invite.msg.players[i]}"><img class="saito-module-identicon small" src="${identicon}"><div class="tiptext">${app.browser.returnAddressHTML(invite.msg.players[i])}</div></div>`;
    } else if (i < invite.msg.players_needed){
      player_identicons += `<div class="saito-module-identicon-box identicon-needed tip"><div class="tiptext">You need this player to start the game</div></div>`;
    } else{
      player_identicons += `<div class="tip player-slot-ellipsis"><i class="fas fa-ellipsis"></i><div class="tiptext">More players may join this game after it starts</div></div>`;
      break;
    }
  }
  player_identicons += '</div>';

  return SaitoModuleXTemplate(game_name, player_identicons, image, game_option, action, invite.transaction.sig);
}



