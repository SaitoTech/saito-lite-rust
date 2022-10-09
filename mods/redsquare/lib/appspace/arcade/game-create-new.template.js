
module.exports = AppstoreAppDetailsTemplate = (app, mod, game_mod, invite) => {

  let html = `<div class="game-create-new-overlay dark">`;
  let slug = (game_mod.returnSlug())? game_mod.slug: game_mod.name.toLowerCase();
  let image = `/${slug}/img/arcade/arcade.jpg`;

  const players = (min, max) => {
    let selection = "";
    if (min === max) {
      selection = `<div class="game-wizard-players-no-select" style="display:none" data-player="${min}">${min} player</div>`;
      selection += game_mod.returnSingularGameOption(app);
    } else {
      let defaultPlayers = min;
      if (game_mod.opengame){
        defaultPlayers = max;
      }
      selection += `<select class="game-wizard-players-select dark" name="game-wizard-players-select">`;
      for (let p = min; p <= max; p++) {
        selection += `<option value="${p}" ${(p===defaultPlayers)?"selected default":""}>${p} table limit</option>`;
      }
      selection += `</select>`;
    }

    return selection;
  };


  html += `
    <form>
    <div class="saito-module-intro">
    
      <!- ***Game thumbnail & options start*** -->
      <div class="saito-module-intro-image">
        <img class="game-image arcade-game-thumbnail" src="${image}">
      </div>
      <!- ***Game thumbnail & options end*** -->


      <!- ***Game desc & title start*** -->
      <div class="saito-module-intro-details rs-create-game-desc-wrapper">
        <div>
          <span><b>${game_mod.name}</b></span>
          <div id="game-rules-btn" class="game-help-link arcade-game-help info-item-wrapper">how to play?</div>
        </div>
        <div class="rs-create-game-desc">${game_mod.description}</div>
        
  `;
        
  html += `
      </div>
      <!- ***Game desc & title end*** -->

      
        <input type="hidden" name="game" value="${game_mod.name}" />
        ${(invite.msg.league)? `<input type="hidden" name="league" value="${invite.msg.league}" />` : ""}
      

    </div>


    <div class="game-wizard-controls">
  
      <div class="rs-create-game-players dark">
        ${players(game_mod.minPlayers, game_mod.maxPlayers)}
        <div class="info-item-wrapper arcade-advance-opt">advanced options...</div>
      </div>

      <div class="game-wizard-invite">
  `;

    if (mod.maxPlayers == 1){
      html += `<button type="button" id="game-invite-btn" class="game-invite-btn" >Play</button>`;
    }else{
      html += `
          <div class="saito-multi-select_btn saito-select dark">
           <div class="saito-multi-select_btn_options dark saito-slct">
              <button type="button" class="saito-multi-btn game-invite-btn" data-type="open">Create Open Game</button>
              <button type="button" class="saito-multi-btn game-invite-btn" data-type="private">Create Private Game</button>
           </div>
          </div>`;
    }


  html += `
      </div>

    </div>
    <div id="advanced-options-overlay-container"></div>
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
