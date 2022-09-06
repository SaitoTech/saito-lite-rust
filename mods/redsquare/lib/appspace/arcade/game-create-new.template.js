const Saitogame_modIntroTemplate = require('./../../../../../lib/saito/new-ui/templates/saito-module-intro.template');
const SaitoOverlay = require('./../../../../../lib/saito/new-ui/saito-overlay/saito-overlay');

module.exports = AppstoreAppDetailsTemplate = (app, mod, game_mod) => {

  let html = `<div class="game-create-new-overlay">`;
  let slug = (game_mod.returnSlug())? game_mod.slug: game_mod.name.toLowerCase();
  let image = `/${slug}/img/arcade/arcade.jpg`;

  const players = (min, max) => {
    let selection = "";
    if (min === max) {
      selection = `<div class="game-wizard-players-no-select" style="display:none" data-player="${min}">${min} player</div>`;
      selection += game_mod.returnSingularGameOption(app);
    } else {
      selection = `<select class="arcade-select-players" name="game-wizard-players-select">`;
      for (let p = min; p <= max; p++) {
        selection += `<option value="${p}">${p} player</option>`;
      }
      selection += `</select>`;
    }

    return selection;
  };

  html += `
    <div class="saito-module-intro">
      
      <!- ***Game thumbnail & options start*** -->
      <div class="saito-module-intro-image">
        <img class="game-image arcade-game-thumbnail" src="${image}">
        
        ${players(game_mod.minPlayers, game_mod.maxPlayers)}

        <div class="info-item-wrapper arcade-advance-opt">Advanced Options</div>
      </div>
      <!- ***Game thumbnail & options end*** -->


      <!- ***Game desc & title start*** -->
      <div class="saito-module-intro-details">
        <div>${game_mod.name}</div>
        <div>${game_mod.description}</div>
        <div id="game-rules-btn" class="game-help-link arcade-game-help info-item-wrapper">How to play?</div>

        <div class="saito-multi-select_btn saito-select">
         <div class="saito-multi-select_btn_options saito-slct">
            <button type="button" class="saito-multi-btn game-invite-btn" data-type="open">Create Open Game</button>
            <button type="button" class="saito-multi-btn game-invite-btn" data-type="private">Create Private Game</button>
         </div>
        </div>
      </div>
      <!- ***Game desc & title end*** -->

      <form>
        <input type="hidden" name="game" value="${game_mod.name}" />
      </form>

    </div>

  `;
  
  // message for licensed games
  if (game_mod.publisher_message) {
    html += `<div id="arcade-game-publisher-message" class="arcade-game-publisher-message">
      <span>NOTE: </span>${game_mod.publisher_message}</div>`;
  }

  html += `<div id="game-wizard-advanced-options-overlay" class="game-wizard-advanced-options-overlay" style="display:none"></div>`;
  html += `</div>`; // overlay closing

  return html;

}
