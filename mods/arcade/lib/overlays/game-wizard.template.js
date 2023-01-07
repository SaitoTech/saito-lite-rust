
module.exports = GameWizardTemplate = (app, mod, game_mod, invite_obj = {}) => {

  let html = `<div class="arcade-wizard-overlay">`;
  let image = `/${game_mod.returnSlug()}/img/arcade/arcade.jpg`;
  let invite = null;
  let publickey = null;
  if (invite_obj.invite) { invite = invite_obj.invite; }
  if (invite_obj.publickey) { publickey = invite_obj.publickey; }

  html += `
    <form>
    <div class="arcade-wizard-game-container">
    
      <!- ***Game thumbnail & options start*** -->
      <div class="arcade-wizard-game-image">
        <img class="arcade-wizard-game-thumbnail" src="${image}">
      </div>
      <!- ***Game thumbnail & options end*** -->


      <!- ***Game desc & title start*** -->
      <div class="arcade-wizard-game-details  rs-create-game-desc-wrapper">
        <div class="arcade-wizard-game-name">
          <span><b>${game_mod.returnName()}</b></span>
        </div>
        <div class="arcade-wizard-game-description">${game_mod.description}</div>
      </div>
      <!- ***Game desc & title end*** -->
  `;

  html += `
        <input type="hidden" name="game" value="${game_mod.name}" />
  `;
  if (invite) {
    html += `
      ${(invite.msg.league) ? `<input type="hidden" name="league" value="${invite.msg.league}" />` : ""}
    `;
  }
  html += `
    </div>

    <div class="arcade-wizard-game-controls">
  
      <div class="settings">
        ${game_mod.returnPlayerSelectHTML()}
        <div id="arcade-advance-opt"><span class="arcade-advance-opt-text">advanced options...</span></div>
      </div>

      <div class="arcade-wizard-game-invite">
  `;

  if (game_mod.maxPlayers == 1) {
    html += `<button type="button" id="game-invite-btn" class="game-invite-btn" data-type="single">Play</button>`;
  } else {
    html += `
          <div class="saito-multi-select_btn saito-select">
           <div class="saito-multi-select_btn_options saito-slct">
      `;
    if (publickey) {
      html += `
              <button type="button" class="saito-multi-btn game-invite-btn" data-type="direct">Next Step...</button>
       `;
    } else {
      html += `
              <button type="button" class="saito-multi-btn  game-invite-btn" data-type="open">Create Open Game</button>
              <button type="button" class="saito-multi-btn game-invite-btn" data-type="private">Create Private Game</button>
       `;
    }
    html += `
           </div>
          </div>
	`;
  }


  html += `
      </div>

    </div>
  </form>
  `;

  // message for licensed games
  if (game_mod.publisher_message) {
    html += `<div id="arcade-game-publisher-message" class="arcade-game-publisher-message">
      <span>NOTE: </span>${game_mod.publisher_message}</div>`;
  }

  html += `</div>`; // overlay closing

  return html;

}
