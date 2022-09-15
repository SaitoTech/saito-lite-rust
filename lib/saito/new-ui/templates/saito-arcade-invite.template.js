
module.exports = SaitoArcadeInviteTemplate = (app, mod, invite="") => {

  let gameModule = app.modules.returnModule(invite.msg.game);
  if (!gameModule){
    return "";
  }  
  let slug = gameModule.returnSlug();
  let gameBack = gameModule.respondTo("arcade-games")?.img || `/${slug}/img/arcade.jpg`;
  let details_tab = "standard game";
  if (invite.msg?.options?.crypto != "") {
    details_tab = "crypto game";
  } 
//console.log("OPTIONS: " + JSON.stringify(invite.msg.options));

  let playersNeeded = invite.msg.players_needed;
  let playersHtml = `<div class="saito-arcade-invite-slots">`;

  for (let i = 0; i < invite.msg.players_needed; i++) {
    if (i < invite.msg.players.length) {
      let identicon = app.keys.returnIdenticon(invite.msg.players[i]);
       playersHtml += `<div class="saito-arcade-invite-slot id-${invite.msg.players[i]}"><img class="saito-identicon small" src="${identicon}"></div>`;
    } else {
      playersHtml += `<div class="saito-arcade-invite-slot identicon-empty"></div>`;  
    }
  }

  playersHtml += '</div>';



  return `
    <div class="saito-arcade-invite" data-id="${invite.transaction.sig}">

      <div class="saito-arcade-invite-graphic"><img src="${gameBack}" class="saito-arcade-game-image"></div>
      <div class="saito-arcade-invite-name-container">
        <div class="saito-arcade-invite-name">${gameModule.returnName()}</div>
        ${playersHtml}
      </div>

      <div class="saito-arcade-invite-details">
        <div class="saito-arcade-invite-detail-content">
          <div class="saito-arcade-invite-details-summary">${details_tab}</div>
          <div class="saito-arcade-invite-options">
            ${makeDescription(app, invite)}
          </div>
        </div>
      </div>

    </div>
  `;

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



