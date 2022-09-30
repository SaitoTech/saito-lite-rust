module.exports = ArcadeGameDetailsTemplate = (app, mod, invite) => {
  const players = (min, max) => {
    let selection = "";
    if (min === max) {
      selection = `<div class="game-wizard-players-no-select" style="display:none" data-player="${min}">${min} player</div>`;
      selection += mod.returnSingularGameOption(app);
    } else {
      let defaultPlayers = min;
      if (mod.opengame){
        defaultPlayers = max;
        selection = `<label for="game-wizard-players-select">Max Number of Players:</label>`;
      }
      selection += `<select class="game-wizard-players-select" name="game-wizard-players-select">`;
      for (let p = min; p <= max; p++) {
        selection += `<option value="${p}" ${(p===defaultPlayers)?"selected default":""}>${p} player</option>`;
      }
      selection += `</select>`;
    }

    return selection;
  };

  let game_name = mod.gamename || mod.name;
  let gamemod_url = mod.respondTo("arcade-games")?.img || `/${mod.returnSlug()}/img/arcade/arcade.jpg`;
  let html = `
    <div class="game-wizard">
      <form id="game-wizard-form" class="game-wizard-form">
        <div class="game-wizard-header">
          <div class="game-wizard-image"><img class="game-image" src="${gamemod_url}"/></div>
          <div class="game-wizard-intro">
            <input type="hidden" name="game" value="${invite.msg.game}" />
            ${(invite.msg.league)? `<input type="hidden" name="league" value="${invite.msg.league}" />` : ""}
            <div class="game-wizard-title"><span class="game-home-link">${game_name}</span></div>
            <div class="game-wizard-description">${mod.description} </div>
            <div class="game-wizard-post-description">[<span id="game-rules-btn" class="game-help-link">how to play</span>]</div>
          </div>
        </div>
        
      <div class="game-wizard-controls">
        <div id="game-wizard-players" class="game-wizard-players">
          ${players(mod.minPlayers, mod.maxPlayers)}
          <div class="game-wizard-options-toggle"><span class="game-wizard-options-toggle-text">advanced options...</span></div>
         </div>
        <div id="game-wizard-invite" class="game-wizard-invite">
          <div class="game-wizard-other-btns">
            <button type="button" id="game-rules-btn" class="game-rules-btn">How to Play</button>
            <button type="button" id="game-home-btn" class="game-home-btn">Home Page</button>
          </div>`;  
      if (mod.maxPlayers == 1){
        html += `<button type="button" id="game-invite-btn" data-type="single" class="game-invite-btn" >Play</button>`;
      }else{
        html += `<div class="dynamic_button saito-select">
                 <div class="dynamic_button_options saito-slct">
                    <button type="button" id="game-invite-btn" class="game-invite-btn" data-type="open">Create ${(invite.msg.league)?"League":"Open"} Game</button>
                    <button type="button" id="game-invite-btn" class="game-invite-btn tip" data-type="private">Create Private Game<div class="tiptext">Other players on the Saito network will not see this game and can only join if you provide them the invitation link</div></button>
                 </div>
                 </div>
                `;
      }
          
    html += `</div>
      </div>`;

  if (mod.publisher_message) {
    html += `<div id="game-wizard-publisher-message" class="game-wizard-publisher-message"><span style="font-weight:bold">NOTE: </span>${mod.publisher_message}</div>`;
  }

  html += `<div id="game-wizard-advanced-options-overlay" class="game-wizard-advanced-options-overlay" style="display:none"></div>
      </form>
    </div>
`;
  return html;
};
