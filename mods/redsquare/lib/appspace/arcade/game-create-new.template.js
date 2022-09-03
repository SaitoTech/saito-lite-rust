const Saitogame_modIntroTemplate = require('./../../../../../lib/saito/new-ui/templates/saito-module-intro.template');
const SaitoOverlay = require('./../../../../../lib/saito/new-ui/saito-overlay/saito-overlay');

module.exports = AppstoreAppDetailsTemplate = (app, mod, game_mod) => {

  var unixtime = new Date(game_mod.unixtime);

  let html = `<div class="game-create-new-overlay">`;
  let slug = (game_mod.returnSlug())? game_mod.slug: game_mod.name.toLowerCase();
  let image = `/${slug}/img/arcade/arcade.jpg`;

  html += `

    ${SaitoModuleIntroTemplate(app, mod, image, game_mod.name, game_mod.description )} 

  `;

  html += `

    <div class="appstore-appbox-details">
      <div class="saito-table">
        <div class="saito-table-row odd">
	  <div>date</div>
	  <div>${unixtime.toUTCString()}</div>
        </div>
        <div class="saito-table-row">
	  <div>publisher</div>
	  <div>${game_mod.publickey}</div>
        </div>
        <div class="saito-table-row odd">
	  <div>version</div>
	  <div>${game_mod.version}</div>
        </div>
        <div class="saito-table-row">
	  <div>block hash</div>
	  <div>${game_mod.bsh}</div>
        </div>
      </div>
    </div>
  

    </div>
  `;


  return html;

}
