module.exports = ArcadeGameDetailsTemplate = (app, mod, invite) => {
  const players = (min, max) => {
    let selection = "";
    if (min === max) {
      selection = `<div class="game-wizard-players-no-select" style="display:none" data-player="${min}">${min} player</div>`;
    } else {
      selection = `<select class="game-wizard-players-select" name="game-wizard-players-select">`;
      for (let p = min; p <= max; p++) {
        selection += `<option value="${p}">${p} player</option>`;
      }
      selection += `</select>`;
    }

    return selection;
  };

  let html = `
    <div class="game-wizard">
      <form id="game-wizard-form" class="game-wizard-form">
        <div class="game-wizard-header">
          <div class="game-wizard-image"><img class="game-image" src="/${mod.returnSlug()}/img/arcade.jpg"/></div>
          <div class="game-wizard-intro">
            <input type="hidden" name="gamename" value="${invite.msg.game}" />
            <div class="game-wizard-title">${mod.gamename}</div>
            <div class="game-wizard-description">${mod.description} <div class="game-wizard-post-description">[<span class="game-home-link">homepage</span>]</div></div>
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
          </div>  
          <button type="button" id="game-invite-btn" class="game-invite-btn">${(mod.maxPlayers == 1) ? "Play":"Create New Game"}</button>
        </div>
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
