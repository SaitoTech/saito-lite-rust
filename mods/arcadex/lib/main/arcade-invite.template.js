const SaitoModuleLong = require("./../../../../lib/saito/new-ui/templates/saito-module-long.template");

module.exports = ArcadeInviteTemplate = (app, mod, invite, idx) => {
  if (mod.debug){
    console.log("ARCADEINVITETEMPLATE:", invite);
  }

  if (!invite || !invite.msg){
    return "ERROR -- NO INVITE";
  }

  let id = `invite-${invite.transaction.sig}`;

  if (document.getElementById("id")) { return ''; }

  //
  //Build player description
  //
  let numPlayerSlots = Math.max(invite.msg.options["game-wizard-players-select-max"] || 0, invite.msg.players_needed);

  let playersHtml = `<div class="playerInfo">`;
  for (let i = 0; i < numPlayerSlots; i++) {
    if (i < invite.msg.players.length) {
      let identicon = app.keys.returnIdenticon(invite.msg.players[i]);
      playersHtml += `<div class="player-slot tip"><img class="identicon" src="${identicon}"><div class="tiptext">${app.browser.returnAddressHTML(invite.msg.players[i])}</div></div>`;
    } else if (i < invite.msg.players_needed) {
      playersHtml += `<div class="player-slot identicon-empty"></div>`;  
    }else{
      playersHtml += `<div class="tip player-slot player-slot-ellipsis"><i class="fas fa-ellipsis-h"></i><div class="tiptext">More players may join this game after it starts</div></div>`;  
      break;
    }
  }
  playersHtml += '</div>';

  //
  //Build Game Options description
  //
  let optionsHtml = '';
  let gameModule = app.modules.returnModule(invite.msg.game);
  if (gameModule && gameModule !== "Arcade") {
    let sgoa = gameModule.returnShortGameOptionsArray(invite.msg.options);
    for (let i in sgoa) {
      optionsHtml += `<div class="gameShortDescriptionRow"><div class="gameShortDescriptionKey">${i.replace(/_/g, ' ')}`;
      if (sgoa[i] !== null){
        optionsHtml += `: </div><div class="gameShortDescriptionValue">${sgoa[i]}</div></div>`;
      }else{
        optionsHtml += `</div></div>`
      }
    }
  }

  //
  // Figure out appropriate buttons
  //
  let game_initialized = (invite.msg.players_needed <= invite.msg.players.length) ? 1 : 0;

  for (let i = 0; i < app.options?.games?.length; i++) {
    if (app.options.games[i].id == invite.transaction.sig){
      if (app.options.games[i].initializing == 1) {
        game_initialized = 0;
      }
    }
  }

  let buttonsHtml = "";

   if (invite.isMine) {
     if (game_initialized == 1) { 
       buttonsHtml += `<button data-sig="${invite.transaction.sig}" data-cmd="continue" class="button invite-tile-button">CONTINUE</button>`;
     }else{
        buttonsHtml += `<div class="button_with_icon"><i class="fas fa-link link_icon private"></i>`;          
        if (invite.transaction.from[0].add == app.wallet.returnPublicKey()){
          buttonsHtml += `<button data-sig="${invite.transaction.sig}" data-cmd="${(invite.msg.request == "private")?"publicize":"invite"}" class="button invite-tile-button">${(invite.msg.request == "private")?"PRIVATE":"PUBLIC"}</button></div>`;  
        }
      }
     buttonsHtml += `<button data-sig="${invite.transaction.sig}" data-cmd="cancel" class="button invite-tile-button">CANCEL</button>`;
   } else {
     if (game_initialized == 1) {
       //Open Table Games
       buttonsHtml += `<button data-sig="${invite.transaction.sig}" data-cmd="watch" class="button invite-tile-button">VIEW/JOIN</button><i class="game_status_indicator game_live fas fa-circle"></i>`;
     } else {
       buttonsHtml += `<button data-sig="${invite.transaction.sig}" data-cmd="join" class="button invite-tile-button">JOIN</button>`;
     }
   }
 
  return SaitoModuleLong(app, app.modules.returnModule(invite.msg.game), id, playersHtml, optionsHtml, buttonsHtml);
}


