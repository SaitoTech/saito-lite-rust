const Saitogame_modIntroTemplate = require('./../../../../../lib/saito/new-ui/templates/saito-module-intro.template');
const SaitoOverlay = require('./../../../../../lib/saito/new-ui/saito-overlay/saito-overlay');

module.exports = AppstoreAppDetailsTemplate = (app, mod, game_mod) => {

  console.log('game_mod');
  console.log(game_mod);

  let html = `<div class="game-create-new-overlay">`;
  let slug = (game_mod.returnSlug())? game_mod.slug: game_mod.name.toLowerCase();
  let image = `/${slug}/img/arcade/arcade.jpg`;

  const players = (min, max) => {
    let selection = "";
    if (min === max) {
      selection = `<div class="game-wizard-players-no-select" style="display:none" data-player="${min}">${min} player</div>`;
      selection += mod.returnSingularGameOption(app);
    } else {
      selection = `<select class="game-wizard-players-select" name="game-wizard-players-select">`;
      for (let p = min; p <= max; p++) {
        selection += `<option value="${p}">${p} player</option>`;
      }
      selection += `</select>`;
    }

    return selection;
  };

  html += `

    ${SaitoModuleIntroTemplate(app, mod, image, game_mod.name, game_mod.description )} 

  `;

  html += `

    <div class="game-create-new-details">
      <div class="saito-table">
        <div class="saito-table-row odd">
  `;

      if (mod.maxPlayers > 1) {
        players(mod.minPlayers, mod.maxPlayers);
      }

  html += `    	   

        </div>
        <div class="saito-table-row">
      	  <div>Advanced Options</div>
      	  <div>How to play?</div>
        </div>
      </div>
    </div>
  

    </div>
  `;


  return html;

}
