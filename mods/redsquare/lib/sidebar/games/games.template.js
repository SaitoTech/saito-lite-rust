const SaitoArcadeInviteTemplate = require('./../../../../../lib/saito/new-ui/templates/saito-arcade-invite.template');

module.exports = RedSquareGamesTemplate = (app, mod) => {

	let html = "";
  console.log("Render game sidebar for RS");
  let arcade_mod = app.modules.returnModule("Arcade");
  if (arcade_mod) {

    let mygames = arcade_mod.games.filter(invite => { 
      return arcade_mod.isMyGame(invite, app);
    });

    if (mygames.length > 0){
      html += `<h6>My Games:</h6>
                  <div class="saito-arcade-invite-list">`;
      for (let i = 0; i < mygames.length; i++) {
        html +=  SaitoArcadeInviteTemplate(app, mod, mygames[i]);
      }
      html +=    `</div>`;
    }

    let games = arcade_mod.games.filter(invite => {
      console.log(JSON.parse(JSON.stringify(invite.msg)));
      return (invite.msg.players.length < invite.msg.players_needed && !arcade_mod.isMyGame(invite, app));
    });

    if (games.length > 0){
      html += `<h6>Open Invites:</h6>
            <div class="saito-arcade-invite-list">`;

      for (let i = 0; i < games.length; i++) {
        html +=  SaitoArcadeInviteTemplate(app, mod, games[i]);
      }

      html += `</div>`;
    }else{
      if (window.location.hash !== "#games" && mygames.length == 0){
       html += `<div id="redsquare-create-game" class="saito-button-secondary small">New Game</div>`;
      }
    }
  }

  return html;
}

