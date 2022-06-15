
module.exports = (app, mod) => {

  let html = `
    <div class="league-main-wrapper">
      <div id="league-main-header" class="saito-contentbox saito-box-shadow mb-2">
        <h2>Create a tournament</h2>
        <p>Create a tournament to compete against other players, through rankings, and win prizes</p>
      </div>
      
      <div class="league-avl-games-container">
  `;

  if (typeof mod.games != 'undefined' && mod.games.length > 0) {
    for (var i=0; i<mod.games.length; i++){
        let game = mod.games[i];

        html += `
            <div class="league-avl-game-item">
              <img src="${game.img}">
              <h4>${game.modname}</h4>
              <a href="#"> Create Tournament</a>
            </div>
        `;
    }
  } else {
    html += `
          <h3> No games avilable in arcade for creating a league.</h3>
    `;
  }

  html += ` 
      </div>
    </div>
  `;

  return html;
}
