
module.exports = SaitoArcadeInviteTemplate = (app, mod, invite=null) => {
  if (!invite){
    return "";
  }
  let gameModule = app.modules.returnModule(invite.msg.game);
  if (!gameModule){
    return "";
  }  
  let slug = gameModule.returnSlug();
  let gameBack = gameModule.respondTo("arcade-games")?.img || `/${slug}/img/arcade.jpg`;
  let details_tab = "standard game";
  //Would be nice if we had an easy way to check if advanced options are utilized
  //details_tab = "custom game";
  if (typeof invite.msg?.options?.crypto != 'undefined' && invite.msg?.options?.crypto != "") {
    details_tab = "crypto game";
  }
  if (invite.msg?.options?.league){
    details_tab = "league game";
  } 
//console.log("OPTIONS: " + JSON.stringify(invite.msg.options));

  let numPlayerSlots = Math.max(invite.msg.options['game-wizard-players-select'] || 0, invite.msg.players_needed);

  let playersHtml = `<div class="saito-arcade-invite-slots">`;

  for (let i = 0; i < numPlayerSlots; i++) {
    if (i < invite.msg.players.length) {
      let identicon = app.keys.returnIdenticon(invite.msg.players[i]);
       playersHtml += `<div class="saito-arcade-invite-slot tip id-${invite.msg.players[i]}"><img class="saito-identicon small" src="${identicon}"><div class="tiptext">${app.browser.returnAddressHTML(invite.msg.players[i])}</div></div>`;
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



