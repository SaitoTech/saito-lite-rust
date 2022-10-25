module.exports = ArcadeInviteTemplate = (app, mod, invite, idx) => {
  if (mod.debug){
    //console.log("ARCADEINVITETEMPLATE");
    //console.log(invite);
  }

  if (!invite || !invite.msg){
    return "ERROR -- NO INVITE";
  }

  let gameModule = app.modules.returnModule(invite.msg.game);
  if (!gameModule){
    return "";
  }  
  let slug = gameModule.returnSlug();

  let inviteTypeClass = "open-invite";

  let game_initialized = 0;
  if (invite.isMine) { inviteTypeClass = "my-invite"; }

  if (invite.msg.players_needed <= invite.msg.players.length) {
    //console.log("Game initialized becase msg.players_needed")
    game_initialized = 1;
  }
  let numPlayerSlots = Math.max(invite.msg.options["game-wizard-players-select-max"] || 0, invite.msg.players_needed);

  //console.log("Game_initialized: " + game_initialized);
  //
  // trying to stop games from continue / cancel on load
  //
  //console.log(app.options.games);
  for (let i = 0; i < app.options?.games?.length; i++) {
    if (app.options.games[i].id == invite.transaction.sig){
      if (app.options.games[i].initializing == 1) {
        //console.log("Game not initialized because app.options.games[i]")
        game_initialized = 0;
      }
    }
  }
  //console.log("Game_initialized: " + game_initialized);
  let playersHtml = `<div class="playerInfo" style="">`;
  for (let i = 0; i < numPlayerSlots; i++) {
    if (i < invite.msg.players.length) {
      let identicon = app.keys.returnIdenticon(invite.msg.players[i]);
      playersHtml += `<div class="player-slot tip id-${invite.msg.players[i]}"><img class="identicon" src="${identicon}"><div class="tiptext">${app.browser.returnAddressHTML(invite.msg.players[i])}</div></div>`;
    } else if (i < invite.msg.players_needed) {
      playersHtml += `<div class="player-slot identicon-empty"></div>`;  
    }else{
      playersHtml += `<div class="player-slot saito-module-identicon-box"></div>`;  
    }
  }

  playersHtml += '</div>';

  if (document.getElementById(`invite-${invite.transaction.sig}`)) { return ''; }
  let bannerBack = gameModule.respondTo("arcade-carousel")?.background || `/${slug}/img/arcade.jpg`;
  let gameBack = gameModule.respondTo("arcade-games")?.img || `/${slug}/img/arcade.jpg`;

  let inviteHtml = `
    <div id="invite-${invite.transaction.sig}" class="arcade-tile i_${idx} ${inviteTypeClass}" style="background-image: url('${bannerBack}');">
      <div class="invite-tile-wrapper">
        <div class="game-inset-img" style="background-image: url('${gameBack}');"></div>
        <div class="invite-col-2">
          <div class="gameName">${invite.msg.game}</div>
          <div class="gamePlayers">${playersHtml}</div>
        </div>
        <div class="gameShortDescription">${makeDescription(app, invite)}</div>
	      <div class="gameButtons" style="position:relative;">
    `;
     if (invite.isMine) {
       if (game_initialized == 1) { 
         inviteHtml += `<button data-sig="${invite.transaction.sig}" data-cmd="continue" class="button invite-tile-button">CONTINUE</button>`;
       }else{
          inviteHtml += `<div class="button_with_icon"><i class="fas fa-link link_icon private"></i>`;          
          if (invite.transaction.from[0].add == app.wallet.returnPublicKey()){
            inviteHtml += `<button data-sig="${invite.transaction.sig}" data-cmd="${(invite.msg.request == "private")?"publicize":"invite"}" class="button invite-tile-button">${(invite.msg.request == "private")?"PRIVATE":"PUBLIC"}</button></div>`;  
          }
        }
       inviteHtml += `<button data-sig="${invite.transaction.sig}" data-cmd="cancel" class="button invite-tile-button">CANCEL</button>`;
     } else {
       if (game_initialized == 1) {
         inviteHtml += `<button data-sig="${invite.transaction.sig}" data-cmd="watch" class="button invite-tile-button">JOIN</button><i class="game_status_indicator game_live fas fa-circle"></i>`;
         //inviteHtml += `<button data-sig="${invite.transaction.sig}" data-cmd="cancel" class="button invite-tile-button">CANCEL</button>`;
       } else {
         inviteHtml += `<button data-sig="${invite.transaction.sig}" data-cmd="join" class="button invite-tile-button invite-tile-button-join">JOIN</button>`;
       }
     }

  inviteHtml += `
        </div>
      </div>
    </div>
    `;

  return inviteHtml;
}


/* 
  This could use some improvement since some games have a lot of options...
*/
let makeDescription = (app, invite) => {

  let html = '';

  if (invite.msg) {
    let gameModule = app.modules.returnModule(invite.msg.game);
    if (gameModule && gameModule !== "Arcade") {
      let sgoa = gameModule.returnShortGameOptionsArray(invite.msg.options);
      for (let i in sgoa) {
        html += `<div class="gameShortDescriptionRow"><div class="gameShortDescriptionKey">${i.replace(/_/g, ' ')}`;
        if (sgoa[i] !== null){
          html += `: </div><div class="gameShortDescriptionValue">${sgoa[i]}</div></div>`;
        }else{
          html += `</div></div>`
        }
      }
    }
  } 

  return html;

}


