const SaitoModuleTemplate = require('./../../../../lib/saito/new-ui/templates/saito-module.template');


module.exports = (app, mod) => {

    let league_mod = app.modules.returnModule("League");


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

      let modname = mods[i].name; //Arcade Game Details and stuff works on .name, NOT .gamename (human readable)
      let modtitle = mods[i].gamename || mods[i].appname || modname;

      let modimage = "/" + mods[i].returnSlug() + "/img/arcade/arcade.jpg";

      html += `
        <div class="saito-game">

	        ${SaitoModuleTemplate(app, mod, modtitle, modimage)}

          <div class="saito-game-content">
            <div class="saito-leaderboard">
	            <div class="saito-table">`;

        if (league_mod){
          if (league_mod.leagues.length > 0){
            for (let l of league_mod.leagues){
              if (l.admin == "saito" && l.id == modname.toUpperCase()){
                console.log(JSON.parse(JSON.stringify(l)));
                for (let i = 1; i <= 3; i ++){
                  let player = (i <= l.top3.length) ? l.top3[i-1] : null;
                  if (player){
                    html += `<div class="saito-table-row ${(i%2 == 1)?"odd":""}">

                              <div class="saito-leaderboard-gamename">${app.keys.returnUsername(player)}</div>
                              <div class="saito-leaderboard-rank">${i}</div>
                            </div>`;     
                  }
                }
              }
            }
          }
        }

	    html += `
              </div>
             </div>
             <div class="saito-game-controls">
                <div class="create-game-link" data-id="${modname}">Create Game</div>
                <div class="load-game-instructions" data-id="${modname}">how to play?</div>
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

