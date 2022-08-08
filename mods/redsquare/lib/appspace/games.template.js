const SaitoModuleTemplate = require('./../../../../lib/saito/new-ui/templates/saito-module.template');


module.exports = (app, mod) => {

  let html = `

    <div class="redsquare-appspace-games">

      <div class="saito-page-header">
        <div id="redsquare-schedule-game" class="saito-button-secondary small" style="float: right;">Schedule for Later</div>
        <div id="redsquare-create-game" class="saito-button-secondary small" style="float: right;">Create New Game</div>
        <div class="saito-page-header-title">SAITO ARCADE</div>
        <div class="saito-page-header-text">
Welcome to the Saito Arcade, where all games are open source, provably-fair and can be played directly in your browser. Create a game today, or join our developer community in porting more great games to the platform.
        </div>
      </div>


      <div class="redsquare-games-container">

    `;

    let mods = app.modules.respondTo("arcade-games");
    for (let i = 0; i < mods.length; i++) {

      let modname = mods[i].name;
      if (mods[i].appname) { modname = mods[i].appname; }
      if (mods[i].gamename) { modname = mods[i].gamename; }

      let modimage = "/" + mods[i].returnSlug() + "/img/arcade/arcade.jpg";

      html += `
        <div class="saito-game">

	  ${SaitoModuleTemplate(app, mod, modname, modimage)};

          <div class="saito-game-content">
            <div class="saito-leaderboard">
	      <div class="saito-table">
                <div class="saito-table-row odd">
                  <div class="saito-leaderboard-gamename">david@saito</div>
                  <div class="saito-leaderboard-rank">1</div>
                </div>
                <div class="saito-table-row">
                  <div class="saito-leaderboard-gamename">xQsdfCcQsGbJxehvBUGN3g...</div>
                  <div class="saito-leaderboard-rank">2</div>
                </div>
                <div class="saito-table-row odd">
                  <div class="saito-leaderboard-gamename">richard@saito</div>
                  <div class="saito-leaderboard-rank">3</div>
                </div>
              </div>
            </div>
	    <div class="saito-game-controls">
              <div class="create-game-link" data-id="Chess">Create Game</div>
              <div>how to play?</div>
	    </div>
          </div>
        </div>
      `;

    }

    html += `
      </div>
    </div>

  `;

   return html;
}

